"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { buyOffer, type BuyState } from "./actions";

type Offer = {
  id: number;
  offer_name: string;
  offer_description: string;
  points: number;
  itemid1: number;
  offer_type: string | null;
};

type Character = { id: number; name: string; skull: boolean; banned: boolean };

/**
 * Pick a fallback shop icon when the Tibia item sprite is missing.
 * Server-custom items (VIP Scrolls, etc.) have itemid1 values outside the
 * standard client range, so /images/items/<id>.gif 404s — use /images/shop/*
 * icons based on offer_type and common name patterns instead.
 */
function shopIconFor(offer: Offer): string | null {
  const type = offer.offer_type ?? "";
  const name = offer.offer_name.toLowerCase();

  if (type === "unban") return "/images/shop/ban.gif";
  if (type === "redskull" || type === "blackskull") return "/images/shop/skull.gif";
  if (type === "changename") return "/images/shop/name.gif";
  if (type === "changesex") return "/images/shop/sex.gif";
  if (type === "pacc" || type === "acc") return "/images/shop/premium.gif";

  if (name.includes("vip")) return "/images/shop/vip.gif";
  if (name.includes("skull")) return "/images/shop/skull.gif";
  if (name.includes("unban")) return "/images/shop/ban.gif";
  if (name.includes("sex") || name.includes("gender")) return "/images/shop/sex.gif";
  if (name.includes("name")) return "/images/shop/name.gif";
  if (name.includes("blessing")) return "/images/shop/premium.gif";
  if (name.includes("postman") || name.includes("premium")) return "/images/shop/premium.gif";

  return null;
}

type ExtraConfig = { label: string; placeholder: string; hint?: string } | null;

function extraFor(type: string | null): ExtraConfig {
  switch (type) {
    case "changename":
      return {
        label: "New character name",
        placeholder: "E.g. My New Hero",
        hint: "3–25 letters, spaces allowed.",
      };
    default:
      return null;
  }
}

/** Characters that can actually receive this offer. */
function filterEligible(
  offerType: string | null,
  chars: Character[],
): Character[] {
  if (offerType === "redskull" || offerType === "blackskull") {
    return chars.filter((c) => c.skull);
  }
  if (offerType === "unban") {
    return chars.filter((c) => c.banned);
  }
  return chars;
}

/** Message shown when the account has no character eligible for this offer. */
function noEligibleMessage(offerType: string | null): string {
  if (offerType === "redskull" || offerType === "blackskull") {
    return "No character on this account has a skull.";
  }
  if (offerType === "unban") {
    return "No character on this account is banned.";
  }
  return "No character available.";
}

export function OfferCard({
  offer,
  characters,
}: {
  offer: Offer;
  characters: Character[] | null;
}) {
  const hasAccount = characters !== null;
  const [state, formAction, pending] = useActionState(buyOffer, {} as BuyState);
  const [itemImgBroken, setItemImgBroken] = useState(false);
  const [shopImgBroken, setShopImgBroken] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const eligibleChars = useMemo(
    () => (characters ? filterEligible(offer.offer_type, characters) : null),
    [characters, offer.offer_type],
  );
  const hasEligible = !!eligibleChars && eligibleChars.length > 0;

  const [selectedChar, setSelectedChar] = useState(eligibleChars?.[0]?.name ?? "");

  // If the eligible list changes (e.g. after a purchase revalidates),
  // make sure the current selection is still valid.
  useEffect(() => {
    if (!eligibleChars) return;
    const stillValid = eligibleChars.some((c) => c.name === selectedChar);
    if (!stillValid) setSelectedChar(eligibleChars[0]?.name ?? "");
  }, [eligibleChars, selectedChar]);

  const extraCfg = extraFor(offer.offer_type);
  const itemSrc = offer.itemid1 > 0 ? `/images/items/${offer.itemid1}.gif` : null;
  const shopSrc = shopIconFor(offer);
  const purchased = !!state.message;
  const noEligible = hasAccount && !hasEligible;
  const canBuy = hasAccount && hasEligible;

  const lastSuccessRef = useRef<BuyState | null>(null);
  useEffect(() => {
    if (state.message && lastSuccessRef.current !== state) {
      lastSuccessRef.current = state;
      setConfirming(false);
    }
  }, [state]);

  // Prefer the curated shop icon when we recognize the offer (VIP, Postman,
  // Skull, etc.), since the Tibia item sprite for server-custom IDs doesn't
  // exist in /images/items/ — that way SSR renders the correct icon on first
  // paint instead of a broken image that only heals after the onError handler
  // runs on the client.
  let image: React.ReactNode;
  if (shopSrc && !shopImgBroken) {
    image = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={shopSrc}
        alt={offer.offer_name}
        width={32}
        height={32}
        onError={() => setShopImgBroken(true)}
      />
    );
  } else if (itemSrc && !itemImgBroken) {
    image = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={itemSrc}
        alt={offer.offer_name}
        width={32}
        height={32}
        onError={() => setItemImgBroken(true)}
      />
    );
  } else {
    image = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/shop/nophoto.png"
        alt={offer.offer_name}
        width={32}
        height={32}
      />
    );
  }

  return (
    <div className="flex gap-3 rounded border border-stone-800 bg-stone-900/60 p-3">
      <div className="grid size-16 shrink-0 place-items-center rounded border border-stone-700 bg-stone-950">
        {image}
      </div>
      <form action={formAction} className="flex-1 space-y-1.5">
        <input type="hidden" name="offerId" value={offer.id} />
        <input type="hidden" name="playerName" value={selectedChar} />

        <h3 className="text-sm font-semibold text-amber-200">{offer.offer_name}</h3>
        <p className="text-xs text-stone-400 line-clamp-2">
          {offer.offer_description}
        </p>

        {!confirming && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-amber-400">{offer.points} pts</span>
            {canBuy && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded bg-amber-600 px-3 py-1 text-xs font-semibold text-stone-950 transition hover:bg-amber-500"
              >
                Buy
              </button>
            )}
          </div>
        )}
        {!confirming && hasAccount && noEligible && (
          <p className="text-[11px] text-stone-500">
            {noEligibleMessage(offer.offer_type)}
          </p>
        )}

        {confirming && hasAccount && eligibleChars && eligibleChars.length > 0 && (
          <div className="mt-2 space-y-2 rounded border border-amber-900/40 bg-stone-950/80 p-2">
            <label className="block text-xs">
              <span className="text-stone-400">Deliver to</span>
              <select
                value={selectedChar}
                onChange={(e) => setSelectedChar(e.target.value)}
                className="mt-1 w-full rounded border border-stone-700 bg-stone-900 px-2 py-1 text-xs text-stone-200"
                required
              >
                {eligibleChars.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {extraCfg && (
              <label className="block text-xs">
                <span className="text-stone-400">{extraCfg.label}</span>
                <input
                  name="extra"
                  placeholder={extraCfg.placeholder}
                  required
                  maxLength={32}
                  className="mt-1 w-full rounded border border-stone-700 bg-stone-900 px-2 py-1 text-xs text-stone-200"
                />
                {extraCfg.hint && (
                  <span className="mt-0.5 block text-[10px] text-stone-500">
                    {extraCfg.hint}
                  </span>
                )}
              </label>
            )}

            <div className="rounded bg-amber-900/20 px-2 py-1.5 text-xs text-stone-300">
              You will spend <strong className="text-amber-300">{offer.points} pts</strong>{" "}
              for <strong className="text-amber-300">{offer.offer_name}</strong>.
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-stone-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Processing…" : "Confirm purchase"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="rounded border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:border-stone-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {state.error && <p className="text-xs text-red-400">{state.error}</p>}
        {purchased && (
          <p className="rounded bg-emerald-950/40 px-2 py-1 text-xs text-emerald-300">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}