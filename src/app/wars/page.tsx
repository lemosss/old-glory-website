import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatUnixDate, formatNumber } from "@/lib/utils";

export const metadata = { title: "Guild Wars" };
export const dynamic = "force-dynamic";

export default async function WarsPage() {
  const wars = await db.guild_wars.findMany({
    where: { status: true },
    orderBy: { begin: "desc" },
    include: {
      guilds_guild_wars_guild_idToguilds: { select: { id: true, name: true } },
      guilds_guild_wars_enemy_idToguilds: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Active Wars" actions={<span className="text-xs text-stone-500">{wars.length} ongoing</span>} />
        <CardBody>
          <p className="text-sm text-stone-300">
            Official wars declared between guilds. Frags during a war don&apos;t
            count toward red skull.
          </p>
        </CardBody>
      </Card>

      {wars.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-sm text-stone-400">No wars in progress.</p>
          </CardBody>
        </Card>
      )}

      <div className="space-y-3">
        {wars.map((w) => {
          const g = w.guilds_guild_wars_guild_idToguilds;
          const e = w.guilds_guild_wars_enemy_idToguilds;
          return (
            <Card key={w.id}>
              <CardBody>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                  <div className="space-y-1">
                    <Link
                      href={`/guilds/${g.id}`}
                      className="text-lg font-semibold text-amber-300 hover:underline"
                    >
                      {g.name}
                    </Link>
                    <p className="text-xs text-stone-400">
                      Kills: <strong className="text-stone-200">{w.guild_kills}</strong>
                    </p>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-stone-500">
                    vs
                  </div>
                  <div className="space-y-1">
                    <Link
                      href={`/guilds/${e.id}`}
                      className="text-lg font-semibold text-amber-300 hover:underline"
                    >
                      {e.name}
                    </Link>
                    <p className="text-xs text-stone-400">
                      Kills: <strong className="text-stone-200">{w.enemy_kills}</strong>
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                  <span>Started {formatUnixDate(w.begin)}</span>
                  <span>Prize: {formatNumber(w.payment)} gp</span>
                  <span>Limit: {w.frags} frags</span>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
