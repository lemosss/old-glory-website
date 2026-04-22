import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { GROUP_NAMES, getPublicStaff } from "@/lib/services/team";

export const metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const staff = await getPublicStaff();
  const byGroup = new Map<number, typeof staff>();
  for (const m of staff) {
    if (!byGroup.has(m.group_id)) byGroup.set(m.group_id, []);
    byGroup.get(m.group_id)!.push(m);
  }
  const sortedGroups = [...byGroup.entries()].sort(([a], [b]) => b - a);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Staff" />
        <CardBody>
          <p className="text-sm text-stone-300">
            The team in charge of keeping OldGlory running. For reports or issues,
            PM an online staff member in-game or open a ticket on Discord.
          </p>
        </CardBody>
      </Card>

      {sortedGroups.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-sm text-stone-400">No staff members yet.</p>
          </CardBody>
        </Card>
      )}

      {sortedGroups.map(([groupId, members]) => (
        <Card key={groupId}>
          <CardHeader title={GROUP_NAMES[groupId] ?? `Group ${groupId}`} />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2 text-right">Level</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2">
                      <Link
                        href={`/characters?name=${encodeURIComponent(m.name)}`}
                        className="text-amber-400 hover:underline"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right text-stone-300">{m.level}</td>
                    <td className="px-4 py-2">
                      {m.online ? (
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
      ))}
    </div>
  );
}
