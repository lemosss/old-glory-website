import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getGuildDetail } from "@/lib/services/guilds";
import { getVocationName } from "@/lib/vocations";
import { formatUnixDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GuildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const guild = await getGuildDetail(numericId);
  if (!guild) notFound();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={guild.name} />
        <CardBody className="space-y-2 text-sm">
          <p className="text-stone-300">{guild.description || "No description."}</p>
          <p className="text-stone-400">
            <span className="text-stone-500">MOTD:</span> {guild.motd || "—"}
          </p>
          <p className="text-xs text-stone-500">
            Founded {formatUnixDate(guild.creationdata)}
          </p>
        </CardBody>
      </Card>

      {guild.guild_ranks.map((rank) => (
        <Card key={rank.id}>
          <CardHeader title={rank.name} />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Vocation</th>
                  <th className="px-4 py-2 text-right">Level</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {rank.players.map((p) => (
                  <tr key={p.id}>
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
                    <td className="px-4 py-2">
                      {p.online ? (
                        <span className="text-emerald-400">Online</span>
                      ) : (
                        <span className="text-stone-500">Offline</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rank.players.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-stone-500">
                      No members.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
