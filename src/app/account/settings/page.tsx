import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getAccountPublic } from "@/lib/services/accounts";
import { ChangeEmailForm, ChangePasswordForm } from "./settings-forms";

export const metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.accountId) redirect("/login");

  const account = await getAccountPublic(session.user.accountId);
  if (!account) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card>
        <CardHeader
          title="Settings"
          actions={
            <Link
              href="/account"
              className="text-xs text-stone-400 hover:text-amber-300"
            >
              ← Back
            </Link>
          }
        />
        <CardBody>
          <p className="text-sm text-stone-300">
            Change your account password and email. The new password applies
            immediately on the website and in-game.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <CardBody>
          <ChangePasswordForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change email" />
        <CardBody>
          <ChangeEmailForm current={account.email ?? ""} />
        </CardBody>
      </Card>
    </div>
  );
}
