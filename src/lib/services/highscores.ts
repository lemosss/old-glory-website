import "server-only";
import { db } from "@/lib/db";
import { publicPlayerFilter } from "@/lib/filters";

export type HighscoreCategory =
  | "level"
  | "magic"
  | "fist"
  | "club"
  | "sword"
  | "axe"
  | "distance"
  | "shielding"
  | "fishing";

const SKILL_MAP: Record<Exclude<HighscoreCategory, "level" | "magic">, number> = {
  fist: 0,
  club: 1,
  sword: 2,
  axe: 3,
  distance: 4,
  shielding: 5,
  fishing: 6,
};

export async function getLevelHighscores(limit = 100) {
  return db.players.findMany({
    where: publicPlayerFilter,
    select: {
      id: true,
      name: true,
      level: true,
      experience: true,
      vocation: true,
      promotion: true,
      world_id: true,
    },
    orderBy: [{ level: "desc" }, { experience: "desc" }],
    take: limit,
  });
}

export async function getMagicHighscores(limit = 100) {
  return db.players.findMany({
    where: publicPlayerFilter,
    select: {
      id: true,
      name: true,
      level: true,
      maglevel: true,
      vocation: true,
      promotion: true,
      world_id: true,
    },
    orderBy: { maglevel: "desc" },
    take: limit,
  });
}

export type SkillHighscore = {
  skillid: number;
  value: number;
  count: number;
  players: {
    id: number;
    name: string;
    level: number;
    vocation: number;
    promotion: number;
    world_id: number;
    group_id: number;
  };
};

/**
 * Prisma's introspected schema has no `player_skills → players` relation, so
 * we can't `include`. Pull the top N skill rows first, then fetch the
 * corresponding (public) player records and drop rows whose owner is hidden.
 */
export async function getSkillHighscores(
  category: Exclude<HighscoreCategory, "level" | "magic">,
  limit = 100,
): Promise<SkillHighscore[]> {
  const skillId = SKILL_MAP[category];
  // Over-fetch a bit so we still return `limit` rows after the public filter
  // drops system/staff characters.
  const rows = await db.player_skills.findMany({
    where: { skillid: skillId },
    orderBy: { value: "desc" },
    take: limit * 2,
  });
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.player_id);
  const players = await db.players.findMany({
    where: { id: { in: ids }, ...publicPlayerFilter },
    select: {
      id: true,
      name: true,
      level: true,
      vocation: true,
      promotion: true,
      world_id: true,
      group_id: true,
    },
  });
  const byId = new Map(players.map((p) => [p.id, p]));

  const out: SkillHighscore[] = [];
  for (const r of rows) {
    const p = byId.get(r.player_id);
    if (!p) continue;
    out.push({
      skillid: r.skillid,
      value: r.value,
      count: r.count,
      players: p,
    });
    if (out.length >= limit) break;
  }
  return out;
}
