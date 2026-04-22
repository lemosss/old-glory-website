import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * The OT server uses `encryptionType = "sha1"` — passwords are 40-char hex SHA1.
 * We must hash the same way so login works both on the website and in-game.
 */
function sha1(input: string): string {
  return createHash("sha1").update(input, "utf8").digest("hex");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export type CreateAccountInput = {
  name: string;
  email: string;
  password: string;
};

/** Generate an 8-group recovery key like XXXX-XXXX-XXXX-XXXX (16 hex chars split). */
function generateRecoveryKey(): string {
  const bytes = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0")
      .toUpperCase(),
  );
  return bytes.join("-");
}

export type AccountPublic = {
  id: number;
  name: string;
  email: string;
  premium_points: number;
  premdays: number;
  created: number;
  blocked: boolean;
};

export async function findAccountByName(name: string) {
  return db.accounts.findFirst({ where: { name } });
}

export async function findAccountById(id: number) {
  return db.accounts.findUnique({ where: { id } });
}

export async function getAccountPublic(id: number): Promise<AccountPublic | null> {
  const acc = await db.accounts.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      premium_points: true,
      premdays: true,
      created: true,
      blocked: true,
    },
  });
  return acc;
}

export async function accountNameAvailable(name: string) {
  const exists = await db.accounts.findFirst({ where: { name }, select: { id: true } });
  return !exists;
}

export async function createAccount(input: CreateAccountInput) {
  const hash = sha1(input.password);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const recoveryKey = generateRecoveryKey();
  const account = await db.accounts.create({
    data: {
      name: input.name,
      email: input.email,
      password: hash,
      key: recoveryKey,
      created: nowSeconds,
      create_date: nowSeconds,
      page_lastday: 0,
      vote: 0,
      email_new: "",
      email_new_time: 0,
      rlname: "",
      location: "",
      flag: "",
    },
  });
}

export async function verifyAccountPassword(name: string, password: string) {
  const acc = await db.accounts.findFirst({ where: { name } });
  if (!acc) return null;

  const stored = acc.password;
  let ok = false;

  if (/^\$2[aby]\$/.test(stored)) {
    // bcrypt (if someone imported a modern hash)
    ok = await bcrypt.compare(password, stored);
  } else if (/^[a-f0-9]{40}$/i.test(stored)) {
    // SHA1 hex (OT server default)
    ok = constantTimeEqual(sha1(password).toLowerCase(), stored.toLowerCase());
  } else if (/^[a-f0-9]{32}$/i.test(stored)) {
    // MD5 (legacy fallback for very old servers)
    const md5 = createHash("md5").update(password, "utf8").digest("hex");
    ok = constantTimeEqual(md5.toLowerCase(), stored.toLowerCase());
  } else if (/^[a-f0-9]{64}$/i.test(stored)) {
    // SHA256
    const sha256 = createHash("sha256").update(password, "utf8").digest("hex");
    ok = constantTimeEqual(sha256.toLowerCase(), stored.toLowerCase());
  } else {
    // plain-text legacy
    ok = stored === password;
  }

  return ok ? acc : null;
}

export async function updateAccountPassword(accountId: number, newPassword: string) {
  const hash = sha1(newPassword);
  await db.accounts.update({ where: { id: accountId }, data: { password: hash } });
}

export async function updateAccountEmail(accountId: number, newEmail: string) {
  await db.accounts.update({ where: { id: accountId }, data: { email: newEmail } });
}

export async function getAccountCharacters(accountId: number) {
  return db.players.findMany({
    where: { account_id: accountId },
    select: {
      id: true,
      name: true,
      level: true,
      vocation: true,
      promotion: true,
      world_id: true,
      online: true,
      deleted: true,
      skull: true,
      skulltime: true,
    },
    orderBy: { level: "desc" },
  });
}

/**
 * Returns the set of character ids (and whether the account itself is banned)
 * that currently have an active ban. Account-level bans affect every character
 * on the account, so account-ban → all chars considered banned.
 */
export async function getBannedCharacterIds(
  accountId: number,
  playerIds: number[],
): Promise<{ accountBanned: boolean; playerIds: Set<number> }> {
  const now = Math.floor(Date.now() / 1000);
  const values = [accountId, ...playerIds];
  const bans = await db.bans.findMany({
    where: { active: true, value: { in: values } },
    select: { value: true, expires: true },
  });

  const isLive = (expires: number) => expires === 0 || expires > now;
  const accountBanned = bans.some((b) => b.value === accountId && isLive(b.expires));
  const banned = new Set<number>();
  const playerIdSet = new Set(playerIds);
  for (const b of bans) {
    if (!isLive(b.expires)) continue;
    if (playerIdSet.has(b.value)) banned.add(b.value);
  }
  return { accountBanned, playerIds: banned };
}
