"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const BuySchema = z.object({
  offerId: z.coerce.number().int().positive(),
  playerName: z.string().min(1).max(32),
  extra: z.string().max(255).optional(),
});

export type BuyState = { error?: string; message?: string };

const CHAR_NAME_RE = /^[A-Za-z ]{3,25}$/;

/**
 * Words/fragments blocked in new character names. Matched case-insensitively
 * against the full name and each whitespace-separated token, so "Adm Lemos"
 * and "Admlemos" are both rejected.
 */
const FORBIDDEN_NAME_FRAGMENTS = [
  "adm",
  "admin",
  "administrator",
  "gm",
  "gamemaster",
  "cm",
  "communitymanager",
  "god",
  "staff",
  "tutor",
  "support",
  "owner",
  "mod",
  "moderator",
  "tibia",
  "gesior",
];

function nameIsForbidden(name: string): boolean {
  const lowered = name.toLowerCase();
  const compact = lowered.replace(/\s+/g, "");
  const tokens = lowered.split(/\s+/).filter(Boolean);
  return FORBIDDEN_NAME_FRAGMENTS.some(
    (f) => tokens.includes(f) || compact.startsWith(f) || compact.endsWith(f),
  );
}

/** Offer types delivered in-game by the OT server's shop script. */
const AUTO_DELIVER_IN_GAME = new Set([
  "item",
  "mount",
  "addon",
  "deco",
  "container",
  "pacc",
  "redskull",
  "blackskull",
]);

/** Offer types applied immediately at the DB level by this action. */
const APPLIED_HERE = new Set([
  "changename",
  "changesex",
  "unban",
  "postman",
  "avatar",
  "avartar",
  "blessing",
  "blessings",
  "avatarblessing",
]);

const POSTMAN_STORAGE_KEY = "250";
const POSTMAN_STORAGE_VALUE = "47";
const AVATAR_STORAGE_KEY = "4523987";
const AVATAR_STORAGE_VALUE = "1";
/** Bitmask covering all 5 blessings (1|2|4|8|16). */
const ALL_BLESSINGS = 31;

/**
 * Atomically deducts `amount` premium points from the account — the `WHERE`
 * clause contains the balance guard, so two concurrent buys can't both pass
 * a non-transactional "enough points?" check and overspend. Returns `true`
 * when the deduction succeeded (1 row affected) and `false` otherwise.
 */
async function deductPoints(accountId: number, amount: number): Promise<boolean> {
  const { count } = await db.accounts.updateMany({
    where: { id: accountId, premium_points: { gte: amount } },
    data: { premium_points: { decrement: amount } },
  });
  return count > 0;
}

/** Refund on transaction failure — best-effort, swallows errors intentionally. */
async function refundPoints(accountId: number, amount: number): Promise<void> {
  try {
    await db.accounts.update({
      where: { id: accountId },
      data: { premium_points: { increment: amount } },
    });
  } catch (err) {
    console.error("refundPoints failed", { accountId, amount, err });
  }
}

export async function buyOffer(
  _prev: BuyState | undefined,
  formData: FormData,
): Promise<BuyState> {
  const session = await auth();
  if (!session?.user?.accountId) return { error: "Not signed in." };
  const accountId = session.user.accountId;

  const parsed = BuySchema.safeParse({
    offerId: formData.get("offerId"),
    playerName: formData.get("playerName"),
    extra: formData.get("extra") ?? undefined,
  });
  if (!parsed.success) return { error: "Invalid request." };

  const offer = await db.z_shop_offer.findUnique({
    where: { id: parsed.data.offerId },
  });
  if (!offer) return { error: "Offer not found." };

  const type = offer.offer_type ?? "";
  if (!AUTO_DELIVER_IN_GAME.has(type) && !APPLIED_HERE.has(type)) {
    return {
      error: "This offer is not available on the website. Open a ticket on Discord.",
    };
  }

  // Defense in depth: reject any offer with non-positive points so a bad row
  // (priced 0 or, worse, negative) can't be turned into a point generator
  // through the decrement below.
  if (offer.points <= 0) {
    return { error: "Invalid offer price." };
  }

  const account = await db.accounts.findUnique({ where: { id: accountId } });
  if (!account) return { error: "Account not found." };

  const player = await db.players.findFirst({
    where: { name: parsed.data.playerName, account_id: accountId },
  });
  if (!player) return { error: "Character not found on your account." };

  // Prevent applying DB-level changes while the character is online.
  if (APPLIED_HERE.has(type) && player.online) {
    return { error: "Log out of this character before purchasing." };
  }

  // Eligibility: Remove Skull only applies if the character actually has one.
  // The server persists `skull` as a constant (SKULL_RED) on save — the real
  // active-skull signal is `skulltime > now` (iologindata.cpp:567).
  if (type === "redskull" || type === "blackskull") {
    const now = Math.floor(Date.now() / 1000);
    if (!player.skull || player.skulltime <= now) {
      return { error: `${player.name} has no skull to remove.` };
    }
  }

  // Eligibility: Unban requires an active ban on the account or character.
  if (type === "unban") {
    const now = Math.floor(Date.now() / 1000);
    const activeBan = await db.bans.findFirst({
      where: {
        active: true,
        value: { in: [accountId, player.id] },
        OR: [{ expires: 0 }, { expires: { gt: now } }],
      },
    });
    if (!activeBan) {
      return { error: `${player.name} is not banned.` };
    }
  }

  // Build the DB write(s) per offer type.
  const nowSeconds = Math.floor(Date.now() / 1000);
  const historyEntry = {
    to_name: player.name,
    to_account: accountId,
    from_account: accountId,
    price: offer.points,
    offer_id: String(offer.id),
    trans_start: nowSeconds,
    trans_real: 0,
  };

  try {
    if (type === "changename") {
      const newName = (parsed.data.extra ?? "").trim().replace(/\s+/g, " ");
      if (!CHAR_NAME_RE.test(newName)) {
        return { error: "Invalid new name (3–25 letters only)." };
      }
      if (nameIsForbidden(newName)) {
        return {
          error: "Reserved name: cannot contain terms like ADM, GM, God, Staff, etc.",
        };
      }
      const normalized = newName
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const taken = await db.players.findFirst({ where: { name: normalized } });
      if (taken && taken.id !== player.id) {
        return { error: "That name is already taken." };
      }
      if (!(await deductPoints(accountId, offer.points))) {
        return { error: "Not enough premium points." };
      }
      try {
        await db.$transaction([
          db.players.update({
            where: { id: player.id },
            data: { name: normalized, old_name: player.name },
          }),
          db.z_shop_history_item.create({
            data: {
              ...historyEntry,
              from_nick: `changename:${player.name}->${normalized}`,
              trans_state: "done",
              trans_real: nowSeconds,
            },
          }),
        ]);
      } catch (err) {
        await refundPoints(accountId, offer.points);
        throw err;
      }
      revalidatePath("/shop");
      revalidatePath("/account");
      return { message: `${player.name} is now ${normalized}.` };
    }

    if (type === "unban") {
      const now = Math.floor(Date.now() / 1000);
      const activeBans = await db.bans.findMany({
        where: {
          active: true,
          value: { in: [accountId, player.id] },
          OR: [{ expires: 0 }, { expires: { gt: now } }],
        },
        select: { id: true },
      });
      if (!(await deductPoints(accountId, offer.points))) {
        return { error: "Not enough premium points." };
      }
      try {
        await db.$transaction([
          ...activeBans.map((b) =>
            db.bans.update({ where: { id: b.id }, data: { active: false } }),
          ),
          db.z_shop_history_item.create({
            data: {
              ...historyEntry,
              from_nick: `unban:${player.name}`,
              trans_state: "done",
              trans_real: nowSeconds,
            },
          }),
        ]);
      } catch (err) {
        await refundPoints(accountId, offer.points);
        throw err;
      }
      revalidatePath("/shop");
      revalidatePath("/account");
      return { message: `${player.name} has been unbanned.` };
    }

    if (type === "changesex") {
      const newSex = player.sex === 0 ? 1 : 0;
      if (!(await deductPoints(accountId, offer.points))) {
        return { error: "Not enough premium points." };
      }
      try {
        await db.$transaction([
          db.players.update({ where: { id: player.id }, data: { sex: newSex } }),
          db.z_shop_history_item.create({
            data: {
              ...historyEntry,
              from_nick: `changesex:${player.name}`,
              trans_state: "done",
              trans_real: nowSeconds,
            },
          }),
        ]);
      } catch (err) {
        await refundPoints(accountId, offer.points);
        throw err;
      }
      revalidatePath("/shop");
      revalidatePath("/account");
      return { message: `${player.name}'s gender was changed.` };
    }

    if (type === "postman") {
      const existing = await db.player_storage.findUnique({
        where: {
          player_id_key: { player_id: player.id, key: POSTMAN_STORAGE_KEY },
        },
      });
      if (existing && existing.value === POSTMAN_STORAGE_VALUE) {
        return { error: `${player.name} already finished the Postman quest.` };
      }
      if (!(await deductPoints(accountId, offer.points))) {
        return { error: "Not enough premium points." };
      }
      try {
        await db.$transaction([
          db.player_storage.upsert({
            where: {
              player_id_key: { player_id: player.id, key: POSTMAN_STORAGE_KEY },
            },
            create: {
              player_id: player.id,
              key: POSTMAN_STORAGE_KEY,
              value: POSTMAN_STORAGE_VALUE,
            },
            update: { value: POSTMAN_STORAGE_VALUE },
          }),
          db.z_shop_history_item.create({
            data: {
              ...historyEntry,
              from_nick: `postman:${player.name}`,
              trans_state: "done",
              trans_real: nowSeconds,
            },
          }),
        ]);
      } catch (err) {
        await refundPoints(accountId, offer.points);
        throw err;
      }
      revalidatePath("/shop");
      revalidatePath("/account");
      return { message: `${player.name} received the Postman quest.` };
    }

    if (type === "avatar" || type === "avartar") {
      const existing = await db.player_storage.findUnique({
        where: {
          player_id_key: { player_id: player.id, key: AVATAR_STORAGE_KEY },
        },
      });
      if (existing && existing.value === AVATAR_STORAGE_VALUE) {
        return { error: `${player.name} already has the Avar Tar permission.` };
      }
      if (!(await deductPoints(accountId, offer.points))) {
        return { error: "Not enough premium points." };
      }
      try {
        await db.$transaction([
          db.player_storage.upsert({
            where: {
              player_id_key: { player_id: player.id, key: AVATAR_STORAGE_KEY },
            },
            create: {
              player_id: player.id,
              key: AVATAR_STORAGE_KEY,
              value: AVATAR_STORAGE_VALUE,
            },
            update: { value: AVATAR_STORAGE_VALUE },
          }),
          db.z_shop_history_item.create({
            data: {
              ...historyEntry,
              from_nick: `avatar:${player.name}`,
              trans_state: "done",
              trans_real: nowSeconds,
            },
          }),
        ]);
      } catch (err) {
        await refundPoints(accountId, offer.points);
        throw err;
      }
      revalidatePath("/shop");
      revalidatePath("/account");
      return { message: `${player.name} received the Avar Tar permission.` };
    }

    if (type === "blessing" || type === "blessings" || type === "avatarblessing") {
      if ((player.blessings ?? 0) >= ALL_BLESSINGS) {
        return { error: `${player.name} already has all blessings.` };
      }
      if (!(await deductPoints(accountId, offer.points))) {
        return { error: "Not enough premium points." };
      }
      try {
        await db.$transaction([
          db.players.update({
            where: { id: player.id },
            data: { blessings: ALL_BLESSINGS },
          }),
          db.z_shop_history_item.create({
            data: {
              ...historyEntry,
              from_nick: `blessings:${player.name}`,
              trans_state: "done",
              trans_real: nowSeconds,
            },
          }),
        ]);
      } catch (err) {
        await refundPoints(accountId, offer.points);
        throw err;
      }
      revalidatePath("/shop");
      revalidatePath("/account");
      return { message: `${player.name} received all blessings.` };
    }

    // Items and other in-game offers: register as pending for the server script.
    if (!(await deductPoints(accountId, offer.points))) {
      return { error: "Not enough premium points." };
    }
    try {
      await db.z_shop_history_item.create({
        data: {
          ...historyEntry,
          from_nick: "shop",
          trans_state: "wait",
        },
      });
    } catch (err) {
      await refundPoints(accountId, offer.points);
      throw err;
    }
    revalidatePath("/shop");
    revalidatePath("/account");
    return {
      message: `Order placed for ${player.name}. Delivery will happen in-game on next login.`,
    };
  } catch (err) {
    console.error("buyOffer failed", err);
    return { error: "Unable to complete purchase." };
  }
}
