import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getOnlinePlayers } from "@/lib/services/online";
import { getVocationName } from "@/lib/vocations";

export const dynamic = "force-dynamic";

export default async function OnlinePage() {
  const players = await getOnlinePlayers();

  return (
    <Card>
      <CardHeader
        title="Players Online"
        actions={<span className="text-sm text-stone-400">{players.length} online</span>}
      />
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Vocation</th>
              <th className="px-4 py-2 text-right">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {players.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  <Link
                    href={`/characters?name=${encodeURIComponent(p.name)}`}
                    className="text-amber-400 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-300">{getVocationName(p.vocation)}</td>
                <td className="px-4 py-2 text-right text-stone-300">{p.level}</td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-stone-500">
                  No players online.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
