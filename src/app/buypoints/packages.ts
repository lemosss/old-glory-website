export type PointsPackage = {
  id: string;
  points: number;
  priceBRL: number;
  name: string;
  highlight?: boolean;
};

/**
 * Point packs offered in the store. Prices are in BRL (MercadoPago is wired up
 * for Brazilian accounts). Tweak here — no code changes needed elsewhere.
 */
export const PACKAGES: PointsPackage[] = [
  { id: "starter", name: "Starter", points: 100, priceBRL: 10 },
  { id: "basic", name: "Basic", points: 300, priceBRL: 25 },
  { id: "plus", name: "Plus", points: 650, priceBRL: 50, highlight: true },
  { id: "premium", name: "Premium", points: 1400, priceBRL: 100 },
  { id: "mega", name: "Mega", points: 3000, priceBRL: 200 },
];
