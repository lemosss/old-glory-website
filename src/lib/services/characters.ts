import "server-only";
import { db } from "@/lib/db";

export type CharacterSummary = {
  id: number;
  name: string;
  level: number;
  vocation: number;
  promotion: number;
  world_id: number;
  online: number;
  deleted: number;
  sex: number;
  town_id: number;
  lastlogin: bigint;
  account_id: number;
  group_id: number;
};

export async function findCharacterByName(name: string) {
  return db.players.findFirst({
    where: { name: { equals: name } },
  });
}

export async function getCharacterFullView(name: string) {
  // Explicit `select` on both queries so we never pull the password hash,
  // email, IP address, or any other sensitive account/player column into the
  // process — even though Server Components don't serialize this to the
  // client, it's safer to never read it in the first place.
  const player = await db.players.findFirst({
    where: { name: { equals: name } },
    select: {
      id: true,
      name: true,
      level: true,
      vocation: true,
      promotion: true,
      sex: true,
      town_id: true,
      lastlogin: true,
      world_id: true,
      online: true,
      deleted: true,
      account_id: true,
      rank_id: true,
      group_id: true,
    },
  });
  if (!player) return null;

  const [account, guildRank, recentDeaths, siblings] = await Promise.all([
    db.accounts.findUnique({
      where: { id: player.account_id },
      select: { premdays: true },
    }),
    db.guild_ranks.findUnique({
      where: { id: player.rank_id },
      include: { guilds: { select: { id: true, name: true } } },
    }),
    db.player_deaths.findMany({
      where: { player_id: player.id },
      orderBy: { date: "desc" },
      take: 10,
      select: { id: true, date: true, level: true },
    }),
    db.players.findMany({
      where: { account_id: player.account_id, deleted: false },
      select: {
        id: true,
        name: true,
        level: true,
        world_id: true,
        online: true,
      },
      orderBy: { level: "desc" },
    }),
  ]);

  return { player, account, guildRank, recentDeaths, siblings };
}

export async function searchCharactersByPrefix(prefix: string, limit = 10) {
  return db.players.findMany({
    where: { name: { startsWith: prefix }, deleted: false },
    select: { id: true, name: true, level: true, world_id: true },
    orderBy: { level: "desc" },
    take: limit,
  });
}

export type NewCharacterInput = {
  accountId: number;
  name: string;
  sex: 0 | 1; // 0 = female, 1 = male
};

export async function characterNameAvailable(name: string) {
  const exists = await db.players.findFirst({
    where: { name },
    select: { id: true },
  });
  return !exists;
}

export async function createCharacter(input: NewCharacterInput) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  // Default outfit: sex 1 (male) -> 128, sex 0 (female) -> 136 (legacy OT defaults)
  const looktype = input.sex === 1 ? 128 : 136;

  return db.players.create({
    data: {
      name: input.name,
      account_id: input.accountId,
      sex: input.sex,
      vocation: 0,
      town_id: 1,
      level: 1,
      experience: 0n,
      health: 150,
      healthmax: 150,
      mana: 0,
      manamax: 0,
      soul: 100,
      cap: 400,
      looktype,
      lookhead: 78,
      lookbody: 106,
      looklegs: 58,
      lookfeet: 95,
      created: nowSeconds,
      conditions: Buffer.alloc(0),
      // Legacy columns declared NOT NULL without usable defaults in the DB.
      // We provide explicit safe values here so Prisma doesn't reject the insert.
      auction_balance: 0,
      nick_verify: "",
      comment: "",
      signature: "",
      castDescription: "",
      ip: "0",
    },
  });
}
