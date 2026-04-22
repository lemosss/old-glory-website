import "server-only";
import { db } from "@/lib/db";
import { publicPlayerFilter } from "@/lib/filters";

/**
 * Weekly top exp gainers — based on exphist_lastexp vs exphist1 (7 days ago snapshot).
 * Schema: exphist1..exphist7 are daily snapshots rotated by the server.
 */
export async function getPowerGamers(limit = 50) {
  const players = await db.players.findMany({
    where: publicPlayerFilter,
    select: {
      id: true,
      name: true,
      level: true,
      vocation: true,
      promotion: true,
      experience: true,
      exphist1: true,
    },
    take: 500, // fetch wide pool, filter in JS because we compute diff
  });

  return players
    .map((p) => ({
      ...p,
      gained: p.experience - (p.exphist1 ?? 0n),
    }))
    .filter((p) => p.gained > 0n)
    .sort((a, b) => (b.gained > a.gained ? 1 : b.gained < a.gained ? -1 : 0))
    .slice(0, limit);
}

/**
 * Top fraggers (all-time unjustified kills). The server only tracks via killers.unjustified
 * on player_killers, so we aggregate from there.
 */
export async function getTopFraggers(limit = 50) {
  const rows = await db.$queryRaw<
    { player_id: number; name: string; level: number; vocation: number; promotion: number; frags: bigint }[]
  >`
    SELECT
      pk.player_id,
      p.name,
      p.level,
      p.vocation,
      p.promotion,
      COUNT(*) AS frags
    FROM player_killers pk
    JOIN killers k ON k.id = pk.kill_id
    JOIN players p ON p.id = pk.player_id
    WHERE k.unjustified = 1
      AND p.deleted = 0
      AND p.account_id > 1
      AND p.group_id < 2
    GROUP BY pk.player_id, p.name, p.level, p.vocation, p.promotion
    ORDER BY frags DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ ...r, frags: Number(r.frags) }));
}
