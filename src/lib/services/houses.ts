import "server-only";
import { db } from "@/lib/db";

export async function getHouses() {
  return db.houses.findMany({
    orderBy: [{ town: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      town: true,
      size: true,
      price: true,
      rent: true,
      owner: true,
      beds: true,
      guild: true,
    },
  });
}

export async function getHousesWithOwnerNames() {
  const houses = await getHouses();
  const ownerIds = [...new Set(houses.map((h) => h.owner).filter((id) => id > 0))];
  const owners = ownerIds.length
    ? await db.players.findMany({
        where: { id: { in: ownerIds } },
        select: { id: true, name: true },
      })
    : [];
  const nameById = new Map(owners.map((p) => [p.id, p.name]));
  return houses.map((h) => ({
    ...h,
    ownerName: h.owner > 0 ? (nameById.get(h.owner) ?? null) : null,
  }));
}
