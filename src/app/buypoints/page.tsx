import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getAccountPublic } from "@/lib/services/accounts";
import { BuyPointsGrid } from "./buy-points-grid";
import { PACKAGES } from "./packages";

export const metadata = { title: "Buy Points" };
export const dynamic = "force-dynamic";

export default async function BuyPointsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();
  const account = session?.user?.accountId
    ? await getAccountPublic(session.user.accountId)
    : null;

  const gatewayEnabled = !!process.env.MERCADOPAGO_ACCESS_TOKEN;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Buy Premium Points"
          actions={
            account ? (
              <span className="text-sm text-stone-300">
                Current balance:{" "}
                <strong className="text-amber-300">
                  {account.premium_points} pts
                </strong>
              </span>
            ) : (
              <span className="text-xs text-stone-500">Sign in to purchase</span>
            )
          }
        />
        <CardBody className="space-y-2 text-sm text-stone-300">
          <p>
            Choose a package. Payment is handled via{" "}
            <strong className="text-amber-300">PIX</strong> or{" "}
            <strong className="text-amber-300">credit card</strong>. Points are
            credited to your account automatically as soon as the payment is
            confirmed.
          </p>
          <p className="text-xs text-stone-500">
            Having issues? Open a ticket on Discord with your receipt.
          </p>
        </CardBody>
      </Card>

      {status === "success" && (
        <Card>
          <CardBody>
            <p className="text-sm text-emerald-400">
              Payment received — points are credited within seconds.
            </p>
          </CardBody>
        </Card>
      )}
      {status === "pending" && (
        <Card>
          <CardBody>
            <p className="text-sm text-amber-400">
              Payment pending. Points will arrive as soon as the PIX clears.
            </p>
          </CardBody>
        </Card>
      )}
      {status === "failure" && (
        <Card>
          <CardBody>
            <p className="text-sm text-red-400">
              Payment didn&apos;t go through. Feel free to try again below.
            </p>
          </CardBody>
        </Card>
      )}

      {!gatewayEnabled && (
        <Card>
          <CardBody>
            <p className="text-sm text-amber-400">
              Payment gateway not configured. Set{" "}
              <code className="rounded bg-stone-800 px-1 py-0.5 text-xs">
                MERCADOPAGO_ACCESS_TOKEN
              </code>{" "}
              in <code>.env</code> to enable.
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Packages" />
        <CardBody>
          <BuyPointsGrid
            packages={PACKAGES}
            disabled={!account || !gatewayEnabled}
          />
        </CardBody>
      </Card>
    </div>
  );
}
