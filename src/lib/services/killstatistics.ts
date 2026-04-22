import "server-only";
import { db } from "@/lib/db";
import { publicPlayerFilter } from "@/lib/filters";

type EnvKillerRow = { kill_id: number; name: string };
type PlayerKillerRow = { kill_id: number; name: string };

export type RecentDeath = {
  id: number;
  date: number;
  level: number;
  players: { id: number; name: string; level: number } | null;
  killerName: string;
  isPvP: boolean;
};

/**
 * environment_killers and player_killers are `@ignore`d in the Prisma schema
 * (no primary key), so we can't `include` them. Instead, fetch killer ids
 * alongside each death and resolve their names with two raw queries keyed
 * by the kill ids.
 */
export async function getRecentDeaths(limit = 50): Promise<RecentDeath[]> {
  const deaths = await db.player_deaths.findMany({
    where: { players: publicPlayerFilter },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      players: { select: { id: true, name: true, level: true } },
      killers: {
        select: { id: true, final_hit: true },
        orderBy: { final_hit: "desc" },
      },
    },
  });

  const killerIds = deaths.flatMap((d) => d.killers.map((k) => k.id));
  if (killerIds.length === 0) {
    return deaths.map((d) => ({
      id: d.id,
      date: Number(d.date),
      level: d.level,
      players: d.players,
      killerName: "unknown",
      isPvP: false,
    }));
  }

  const [envRows, playerRows] = await Promise.all([
    db.$queryRawUnsafe<EnvKillerRow[]>(
      `SELECT kill_id, name FROM environment_killers WHERE kill_id IN (${killerIds.join(",")})`,
    ),
    db.$queryRawUnsafe<PlayerKillerRow[]>(
      `SELECT pk.kill_id, p.name AS name
       FROM player_killers pk
       JOIN players p ON p.id = pk.player_id
       WHERE pk.kill_id IN (${killerIds.join(",")})`,
    ),
  ]);

  const envByKillId = new Map<number, string>();
  for (const r of envRows) envByKillId.set(Number(r.kill_id), r.name);
  const playerByKillId = new Map<number, string>();
  for (const r of playerRows) playerByKillId.set(Number(r.kill_id), r.name);

  return deaths.map((d) => {
    // Prefer the final-hit killer (already ordered desc); fall back to any
    // environment killer or any player killer if the final-hit row doesn't
    // have a name on either side.
    let killerName = "unknown";
    let isPvP = false;
    for (const k of d.killers) {
      const playerName = playerByKillId.get(k.id);
      if (playerName) {
        killerName = playerName;
        isPvP = true;
        break;
      }
      const envName = envByKillId.get(k.id);
      if (envName) {
        killerName = envName;
        break;
      }
    }
    return {
      id: d.id,
      date: Number(d.date),
      level: d.level,
      players: d.players,
      killerName,
      isPvP,
    };
  });
}
