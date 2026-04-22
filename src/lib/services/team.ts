import "server-only";
import { db } from "@/lib/db";

export const GROUP_NAMES: Record<number, string> = {
  2: "Tutor",
  3: "Senior Tutor",
  4: "Gamemaster",
  5: "Community Manager",
  6: "God",
  7: "Administrator",
};

/**
 * Public staff listing for /team. Intentionally excludes God/Administrator
 * (group_id >= 6) — those are system-level and shouldn't be exposed publicly.
 */
export async function getPublicStaff() {
  return db.players.findMany({
    where: {
      group_id: { gte: 2, lte: 5 },
      deleted: false,
    },
    select: {
      id: true,
      name: true,
      level: true,
      vocation: true,
      group_id: true,
      online: true,
    },
    orderBy: [{ group_id: "desc" }, { name: "asc" }],
  });
}
