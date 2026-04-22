import "server-only";
import { db } from "@/lib/db";

export async function getShopOffers() {
  return db.z_shop_offer.findMany({
    orderBy: [{ offer_type: "asc" }, { points: "asc" }],
  });
}

export async function getShopOfferById(id: number) {
  return db.z_shop_offer.findUnique({ where: { id } });
}
