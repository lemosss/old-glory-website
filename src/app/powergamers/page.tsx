import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getPowerGamers } from "@/lib/services/top-weekly";
import { getVocationName } from "@/lib/vocations";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Power Gamers" };
export const dynamic = "force-dynamic";

export default async function PowerGamersPage() {
  const top = await getPowerGamers(50);

  return (
    <Card>
      <CardHeader title="Power Gamers — XP gained this week" />
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Vocation</th>
              <th className="px-4 py-2 text-right">Level</th>
              <th className="px-4 py-2 text-right">XP gained</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {top.map((p, i) => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-stone-500">{i + 1}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/characters?name=${encodeURIComponent(p.name)}`}
                    className="text-amber-400 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-300">
                  {getVocationName(p.vocation)}
                </td>
                <td className="px-4 py-2 text-right text-stone-300">{p.level}</td>
                <td className="px-4 py-2 text-right font-mono text-amber-200">
                  {formatNumber(p.gained)}
                </td>
              </tr>
            ))}
            {top.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  No one has earned XP this week yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
