import "server-only";
import { db } from "@/lib/db";

export async function getGuilds() {
  return db.guilds.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      creationdata: true,
      description: true,
      motd: true,
    },
  });
}

export type GuildMember = {
  id: number;
  name: string;
  level: number;
  vocation: number;
  promotion: number;
  online: boolean;
  rank_id: number;
};

export type GuildRankWithMembers = {
  id: number;
  name: string;
  level: number;
  players: GuildMember[];
};

export type GuildDetail = {
  id: number;
  name: string;
  creationdata: number;
  description: string;
  motd: string;
  ownerid: number;
  guild_ranks: GuildRankWithMembers[];
};

/**
 * Prisma's introspected schema has no `guild_ranks → players` relation, so
 * we fetch the ranks and the members separately and assemble them in
 * application code (members are matched by `players.rank_id`).
 */
export async function getGuildDetail(id: number): Promise<GuildDetail | null> {
  const guild = await db.guilds.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      creationdata: true,
      description: true,
      motd: true,
      ownerid: true,
    },
  });
  if (!guild) return null;

  const ranks = await db.guild_ranks.findMany({
    where: { guild_id: id },
    select: { id: true, name: true, level: true },
    orderBy: { level: "desc" },
  });
  if (ranks.length === 0) {
    return { ...guild, guild_ranks: [] };
  }

  const rankIds = ranks.map((r) => r.id);
  const members = await db.players.findMany({
    where: { rank_id: { in: rankIds }, deleted: false },
    select: {
      id: true,
      name: true,
      level: true,
      vocation: true,
      promotion: true,
      online: true,
      rank_id: true,
    },
    orderBy: { level: "desc" },
  });

  const membersByRank = new Map<number, GuildMember[]>();
  for (const m of members) {
    const list = membersByRank.get(m.rank_id) ?? [];
    list.push(m);
    membersByRank.set(m.rank_id, list);
  }

  return {
    ...guild,
    guild_ranks: ranks.map((r) => ({
      ...r,
      players: membersByRank.get(r.id) ?? [],
    })),
  };
}
