"use server";

import { auth } from "@/lib/auth";
import { PACKAGES } from "./packages";

export type CheckoutResult = { url: string } | { error: string };

export async function startCheckout(packageId: string): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.accountId) {
    return { error: "Sign in to continue." };
  }
  const pkg = PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return { error: "Invalid package." };

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return { error: "Payment gateway is not configured yet. Try again later." };
  }

  // Lazy-import so the MercadoPago SDK is never loaded when the env var is
  // missing — keeps the page functional on unconfigured environments.
  const { createCheckoutSession } = await import("@/lib/gateway/mercadopago");
  try {
    const { initPoint } = await createCheckoutSession({
      accountId: session.user.accountId,
      package: pkg,
    });
    return { url: initPoint };
  } catch (err) {
    console.error("createCheckoutSession failed", err);
    return { error: "Unable to start checkout. Please try again." };
  }
}
