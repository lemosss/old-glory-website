import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getTopFraggers } from "@/lib/services/top-weekly";
import { getVocationName } from "@/lib/vocations";

export const metadata = { title: "Top Fraggers" };
export const dynamic = "force-dynamic";

export default async function FraggersPage() {
  const top = await getTopFraggers(50);

  return (
    <Card>
      <CardHeader title="Top Fraggers — total unjustified kills" />
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Vocation</th>
              <th className="px-4 py-2 text-right">Level</th>
              <th className="px-4 py-2 text-right">Frags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {top.map((p, i) => (
              <tr key={p.player_id}>
                <td className="px-4 py-2 text-stone-500">{i + 1}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/characters?name=${encodeURIComponent(p.name)}`}
                    className="text-red-400 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-300">
                  {getVocationName(p.vocation)}
                </td>
                <td className="px-4 py-2 text-right text-stone-300">{p.level}</td>
                <td className="px-4 py-2 text-right font-mono text-red-300">
                  {p.frags}
                </td>
              </tr>
            ))}
            {top.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  No frags recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
