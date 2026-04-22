import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getRecentDeaths } from "@/lib/services/killstatistics";
import { formatUnixDate } from "@/lib/utils";

export const metadata = { title: "Kill Statistics" };
export const dynamic = "force-dynamic";

export default async function KillStatisticsPage() {
  const deaths = await getRecentDeaths(50);

  return (
    <Card>
      <CardHeader
        title="Latest Deaths"
        actions={
          <span className="text-xs text-stone-500">{deaths.length} most recent</span>
        }
      />
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Victim</th>
              <th className="px-4 py-2 text-right">Level</th>
              <th className="px-4 py-2">Killed by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {deaths.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-2 text-stone-400">{formatUnixDate(d.date)}</td>
                <td className="px-4 py-2">
                  {d.players ? (
                    <Link
                      href={`/characters?name=${encodeURIComponent(d.players.name)}`}
                      className="text-amber-400 hover:underline"
                    >
                      {d.players.name}
                    </Link>
                  ) : (
                    <span className="text-stone-500">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right text-stone-300">{d.level}</td>
                <td className="px-4 py-2 text-stone-300">
                  {d.isPvP ? (
                    <Link
                      href={`/characters?name=${encodeURIComponent(d.killerName)}`}
                      className="text-red-400 hover:underline"
                    >
                      {d.killerName}
                    </Link>
                  ) : (
                    <span>{d.killerName}</span>
                  )}
                </td>
              </tr>
            ))}
            {deaths.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                  No deaths recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
