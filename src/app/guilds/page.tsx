import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getGuilds } from "@/lib/services/guilds";
import { formatUnixDate } from "@/lib/utils";

export const metadata = { title: "Guilds" };
export const dynamic = "force-dynamic";

export default async function GuildsPage() {
  const guilds = await getGuilds();

  return (
    <Card>
      <CardHeader title="Guilds" actions={<span className="text-xs text-stone-500">{guilds.length} total</span>} />
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">MOTD</th>
              <th className="px-4 py-2">Founded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {guilds.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-2">
                  <Link href={`/guilds/${g.id}`} className="text-amber-400 hover:underline">
                    {g.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-400">{g.motd}</td>
                <td className="px-4 py-2 text-stone-500">{formatUnixDate(g.creationdata)}</td>
              </tr>
            ))}
            {guilds.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-stone-500">
                  No guilds yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
