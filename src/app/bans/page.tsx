import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatUnixDate } from "@/lib/utils";

export const metadata = { title: "Bans" };
export const dynamic = "force-dynamic";

const BAN_TYPE: Record<number, string> = {
  1: "IP Banishment",
  2: "Namelock",
  3: "Account Banishment",
  4: "Notation",
  5: "Deletion",
  6: "Character Banishment",
  7: "Statement Report",
};

const BAN_REASON: Record<number, string> = {
  0: "Offensive name",
  1: "Invalid name",
  2: "Unsuitable name",
  3: "Advertising",
  4: "Spam",
  5: "Hate speech",
  6: "Offensive statement",
  7: "Pretending to be staff",
  8: "Bug abuse",
  9: "Game weakness abuse",
  10: "Macro use",
  11: "Illegal software",
  12: "Hacking",
  13: "Multi-client",
  14: "Account trading",
  15: "Account sharing",
  16: "Threatening staff",
};

export default async function BansPage() {
  const now = Math.floor(Date.now() / 1000);
  const bans = await db.bans.findMany({
    where: {
      active: true,
      type: { in: [2, 3, 6] },
      OR: [{ expires: 0 }, { expires: { gt: now } }],
    },
    orderBy: { added: "desc" },
    take: 100,
  });

  return (
    <Card>
      <CardHeader
        title="Active Bans"
        actions={
          <span className="text-xs text-stone-500">{bans.length} records</span>
        }
      />
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-2">Added</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Expires</th>
              <th className="px-4 py-2">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {bans.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2 text-stone-400">{formatUnixDate(b.added)}</td>
                <td className="px-4 py-2 text-stone-200">
                  {BAN_TYPE[b.type] ?? `Type ${b.type}`}
                </td>
                <td className="px-4 py-2 text-stone-300">
                  {BAN_REASON[b.reason] ?? "—"}
                </td>
                <td className="px-4 py-2 text-stone-400">
                  {b.expires === 0 ? (
                    <span className="text-red-400">Permanent</span>
                  ) : (
                    formatUnixDate(b.expires)
                  )}
                </td>
                <td className="px-4 py-2 text-stone-400">{b.comment || "—"}</td>
              </tr>
            ))}
            {bans.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  No active bans at the moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
