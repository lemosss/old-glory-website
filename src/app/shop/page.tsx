import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  getAccountCharacters,
  getAccountPublic,
  getBannedCharacterIds,
} from "@/lib/services/accounts";
import { getShopOffers } from "@/lib/services/shop";
import { OfferCard } from "./offer-card";

export const metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [session, offers] = await Promise.all([auth(), getShopOffers()]);
  const accountId = session?.user?.accountId ?? null;
  const [account, characters] = await Promise.all([
    accountId ? getAccountPublic(accountId) : null,
    accountId ? getAccountCharacters(accountId) : null,
  ]);

  const grouped = new Map<string, typeof offers>();
  for (const o of offers) {
    const key = o.offer_type ?? "other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(o);
  }

  // Keep related offers contiguous inside each group so a 3-column grid
  // wraps them onto the same row (e.g. all VIP Scrolls together, then the
  // remaining items). Sort key: subgroup first (VIP before non-VIP), then
  // points ascending.
  const subgroupRank = (name: string) => (name.toLowerCase().includes("vip") ? 0 : 1);
  for (const list of grouped.values()) {
    list.sort((a, b) => {
      const sa = subgroupRank(a.offer_name);
      const sb = subgroupRank(b.offer_name);
      if (sa !== sb) return sa - sb;
      return a.points - b.points;
    });
  }

  const liveChars = characters?.filter((c) => !c.deleted) ?? null;
  const banInfo = accountId && liveChars
    ? await getBannedCharacterIds(accountId, liveChars.map((c) => c.id))
    : null;

  // Server stores skull type hardcoded to SKULL_RED on save; the real
  // red-skull-active signal is `skulltime > now` (see iologindata.cpp:567).
  const nowSec = Math.floor(Date.now() / 1000);
  const charList =
    liveChars?.map((c) => ({
      id: c.id,
      name: c.name,
      skull: c.skull && c.skulltime > nowSec,
      banned: !!banInfo && (banInfo.accountBanned || banInfo.playerIds.has(c.id)),
    })) ?? null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Shop"
          actions={
            account ? (
              <span className="text-sm text-stone-300">
                Your points:{" "}
                <strong className="text-amber-300">{account.premium_points}</strong>
              </span>
            ) : (
              <span className="text-xs text-stone-500">Sign in to purchase</span>
            )
          }
        />
        <CardBody>
          <p className="text-sm text-stone-400">
            Support the server and get rewards. All purchases are delivered in-game.
          </p>
        </CardBody>
      </Card>

      {[...grouped.entries()].map(([type, list]) => (
        <Card key={type}>
          <CardHeader title={type.toUpperCase()} />
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((offer) => (
                <OfferCard key={offer.id} offer={offer} characters={charList} />
              ))}
            </div>
          </CardBody>
        </Card>
      ))}

      {offers.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-sm text-stone-400">No offers available yet.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
