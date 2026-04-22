import "server-only";
import { db } from "@/lib/db";
import { publicPlayerFilter } from "@/lib/filters";

export async function getOnlinePlayers() {
  return db.players.findMany({
    where: { ...publicPlayerFilter, online: true },
    select: {
      id: true,
      name: true,
      level: true,
      vocation: true,
      promotion: true,
      world_id: true,
    },
    orderBy: [{ level: "desc" }, { name: "asc" }],
  });
}

export async function getOnlineCount() {
  return db.players.count({
    where: { ...publicPlayerFilter, online: true },
  });
}
