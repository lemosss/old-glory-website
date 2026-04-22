"use client";

import { useState, useTransition } from "react";
import type { PointsPackage } from "./packages";
import { startCheckout } from "./actions";

export function BuyPointsGrid({
  packages,
  disabled,
}: {
  packages: PointsPackage[];
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleBuy = (packageId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await startCheckout(packageId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded bg-red-950/40 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`flex flex-col gap-2 rounded border p-3 ${
              pkg.highlight
                ? "border-amber-600 bg-amber-950/10"
                : "border-stone-800 bg-stone-900/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-200">{pkg.name}</h3>
              {pkg.highlight && (
                <span className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-stone-950">
                  Best value
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-amber-300">
              {pkg.points}
              <span className="ml-1 text-xs font-normal text-stone-400">pts</span>
            </p>
            <p className="text-sm text-stone-300">
              R$ {pkg.priceBRL.toFixed(2).replace(".", ",")}
            </p>
            <button
              type="button"
              onClick={() => handleBuy(pkg.id)}
              disabled={disabled || pending}
              className="mt-auto rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-stone-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Redirecting…" : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
