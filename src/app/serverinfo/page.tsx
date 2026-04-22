import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getOnlineRecord } from "@/lib/services/server-info";
import { getOnlineCount } from "@/lib/services/online";
import { formatUnixDate } from "@/lib/utils";

export const metadata = { title: "Server Info" };
export const dynamic = "force-dynamic";

export default async function ServerInfoPage() {
  const [record, online] = await Promise.all([getOnlineRecord(), getOnlineCount()]);

  const info: [string, React.ReactNode][] = [
    ["Name", "OldGlory"],
    ["IP", <code className="font-mono text-amber-200">oldglory.net</code>],
    ["Port", <code className="font-mono text-amber-200">7171</code>],
    ["Client version", "7.4"],
    ["Players online now", online],
    [
      "Online player record",
      record
        ? `${record.record} on ${formatUnixDate(record.timestamp)}`
        : "—",
    ],
  ];

  const rates: [string, string][] = [
    ["Experience", "1x"],
    ["Skills", "1x"],
    ["Magic", "1x"],
    ["Loot", "1x"],
    ["Spawn", "1x"],
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Server Information" />
        <CardBody>
          <dl className="divide-y divide-stone-800">
            {info.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[200px_1fr] gap-2 py-2 text-sm">
                <dt className="text-stone-400">{k}</dt>
                <dd className="text-stone-200">{v}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Rates" />
        <CardBody>
          <dl className="grid gap-2 sm:grid-cols-2">
            {rates.map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded border border-stone-800 bg-stone-900/50 px-4 py-2 text-sm"
              >
                <dt className="text-stone-400">{k}</dt>
                <dd className="font-mono font-semibold text-amber-300">{v}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="About the server" />
        <CardBody className="space-y-3 text-sm text-stone-300">
          <p>
            OldGlory is a <strong>classic Tibia 7.4 server</strong>, focused on
            balanced vocations, generous respawns, complete quests, and
            competitive wars.
          </p>
          <p>
            The map is the traditional global map, bug-free, with all quests
            tested. Closed economy with realistic NPCs and a shop limited to
            conveniences (no pay-to-win).
          </p>
          <p>
            Before you play, please read our{" "}
            <a href="/rules" className="text-amber-400 hover:underline">rules</a>.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
