import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { verifyResetToken } from "@/lib/services/password-reset";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Reset Password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const verified = token ? await verifyResetToken(token) : null;

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader title="Reset Password" />
        <CardBody>
          {!verified ? (
            <div className="space-y-3">
              <p className="rounded bg-red-950/40 px-3 py-2 text-sm text-red-300">
                Invalid or expired link. Please request a new password reset.
              </p>
              <Link href="/login/forgot" className="text-sm text-amber-400 hover:underline">
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-stone-400">
                Choose a new password for your account. The link expires in a few minutes.
              </p>
              <ResetForm token={token} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
