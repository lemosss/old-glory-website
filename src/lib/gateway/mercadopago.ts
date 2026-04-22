import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { env } from "@/lib/env";

/**
 * Mercado Pago is the only gateway wired up right now. Supports PIX + credit card
 * for Brazilian accounts. Requires MERCADOPAGO_ACCESS_TOKEN.
 *
 * To add another gateway (Stripe, PayPal): create a sibling file with the same
 * `createCheckoutSession` / `verifyWebhook` shape and expose a gateway factory.
 */

function getClient() {
  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN is not set — payment gateway is disabled.",
    );
  }
  return new MercadoPagoConfig({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 10_000 },
  });
}

export type CreatePreferenceInput = {
  accountId: number;
  package: { id: string; points: number; priceBRL: number; name: string };
};

export async function createCheckoutSession(input: CreatePreferenceInput) {
  const client = getClient();
  const preference = new Preference(client);
  const externalRef = `acct:${input.accountId}:pkg:${input.package.id}:ts:${Date.now()}`;

  const result = await preference.create({
    body: {
      items: [
        {
          id: input.package.id,
          title: input.package.name,
          description: `${input.package.points} premium points para ${env.NEXT_PUBLIC_SITE_NAME}`,
          quantity: 1,
          unit_price: input.package.priceBRL,
          currency_id: "BRL",
          category_id: "virtual_goods",
        },
      ],
      external_reference: externalRef,
      back_urls: {
        success: `${env.NEXT_PUBLIC_SITE_URL}/buypoints?status=success`,
        failure: `${env.NEXT_PUBLIC_SITE_URL}/buypoints?status=failure`,
        pending: `${env.NEXT_PUBLIC_SITE_URL}/buypoints?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
      metadata: {
        account_id: input.accountId,
        package_id: input.package.id,
        points: input.package.points,
      },
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }], // disable boleto if you want
      },
    },
  });

  return {
    id: result.id!,
    initPoint: result.init_point ?? result.sandbox_init_point!,
    externalRef,
  };
}

export async function fetchPayment(paymentId: string | number) {
  const client = getClient();
  const payments = new Payment(client);
  return payments.get({ id: Number(paymentId) });
}
