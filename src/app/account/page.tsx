import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getAccountCharacters, getAccountPublic } from "@/lib/services/accounts";
import { getVocationName } from "@/lib/vocations";
import { formatUnixDate } from "@/lib/utils";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.accountId) redirect("/login");

  const accountId = session.user.accountId;
  const [account, characters] = await Promise.all([
    getAccountPublic(accountId),
    getAccountCharacters(accountId),
  ]);

  if (!account) redirect("/login");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Account"
          actions={
            <Link
              href="/account/settings"
              className="rounded border border-stone-700 px-3 py-1 text-xs text-stone-300 hover:border-amber-500 hover:text-amber-300"
            >
              Settings
            </Link>
          }
        />
        <CardBody>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <Row label="Email" value={account.email || "—"} />
            <Row label="Premium points" value={account.premium_points} />
            <Row label="Premium days" value={account.premdays} />
            <Row
              label="Created"
              value={account.created ? formatUnixDate(account.created) : "—"}
            />
            <Row
              label="Status"
              value={
                account.blocked ? (
                  <span className="text-red-400">Blocked</span>
                ) : (
                  <span className="text-emerald-400">Active</span>
                )
              }
            />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Characters"
          actions={
            <Link
              href="/account/create-character"
              className="rounded bg-amber-600 px-3 py-1 text-xs font-semibold text-stone-950 hover:bg-amber-500"
            >
              + Create Character
            </Link>
          }
        />
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">Vocation</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {characters.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                    No characters yet.
                  </td>
                </tr>
              )}
              {characters.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">
                    <Link
                      href={`/characters?name=${encodeURIComponent(c.name)}`}
                      className="text-amber-400 hover:underline"
                    >
                      {c.name}
                    </Link>
                    {c.deleted && (
                      <span className="ml-2 text-xs text-red-400">[deleted]</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-stone-300">{c.level}</td>
                  <td className="px-4 py-2 text-stone-300">
                    {getVocationName(c.vocation)}
                  </td>
                  <td className="px-4 py-2">
                    {c.online ? (
                      <span className="text-emerald-400">Online</span>
                    ) : (
                      <span className="text-stone-500">Offline</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-800/70 py-1.5">
      <dt className="text-stone-400">{label}</dt>
      <dd className="font-medium text-stone-200">{value}</dd>
    </div>
  );
}
