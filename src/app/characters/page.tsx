import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCharacterFullView } from "@/lib/services/characters";
import { getVocationName, getTownName } from "@/lib/vocations";
import { formatUnixDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function searchAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  redirect(`/characters?name=${encodeURIComponent(name)}`);
}

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const view = name ? await getCharacterFullView(name) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Search Character" />
        <CardBody>
          <form action={searchAction} className="flex gap-2">
            <Input
              name="name"
              placeholder="Character name"
              defaultValue={name ?? ""}
              maxLength={30}
              required
              className="max-w-sm"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardBody>
      </Card>

      {name && !view && (
        <Card>
          <CardBody>
            <p className="text-sm text-red-400">
              Character <strong>{name}</strong> does not exist.
            </p>
          </CardBody>
        </Card>
      )}

      {view && <CharacterView view={view} />}
    </div>
  );
}

function CharacterView({ view }: { view: NonNullable<Awaited<ReturnType<typeof getCharacterFullView>>> }) {
  const { player, account, guildRank, recentDeaths, siblings } = view;

  const info: [string, React.ReactNode][] = [
    ["Name", <strong key="name">{player.name}</strong>],
    ["Sex", player.sex === 0 ? "Female" : "Male"],
    ["Profession", getVocationName(player.vocation)],
    ["Level", player.level],
    ["Residence", getTownName(player.town_id)],
    [
      "Last login",
      player.lastlogin ? formatUnixDate(player.lastlogin) : "Never logged in",
    ],
    [
      "Account status",
      account && account.premdays > 0 ? (
        <span className="text-emerald-400">Premium Account</span>
      ) : (
        <span className="text-stone-400">Free Account</span>
      ),
    ],
  ];

  if (guildRank) {
    info.push([
      "Guild",
      <span key="guild">
        {guildRank.name} of{" "}
        <Link
          href={`/guilds/${guildRank.guilds.id}`}
          className="text-amber-400 hover:underline"
        >
          {guildRank.guilds.name}
        </Link>
      </span>,
    ]);
  }

  return (
    <>
      <Card>
        <CardHeader title="Character Information" />
        <CardBody>
          <dl className="divide-y divide-stone-800">
            {info.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[160px_1fr] gap-2 py-2 text-sm">
                <dt className="text-stone-400">{label}</dt>
                <dd className="text-stone-200">{value}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      {recentDeaths.length > 0 && (
        <Card>
          <CardHeader title="Deaths" />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-800">
                {recentDeaths.map((death) => (
                  <tr key={death.id}>
                    <td className="px-4 py-2 text-stone-400">
                      {formatUnixDate(death.date)}
                    </td>
                    <td className="px-4 py-2 text-stone-300">
                      Died at level <strong>{death.level}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {siblings.length > 1 && (
        <Card>
          <CardHeader title="Characters on this account" />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {siblings.map((c, i) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2 text-stone-500">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/characters?name=${encodeURIComponent(c.name)}`}
                        className="text-amber-400 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-stone-300">{c.level}</td>
                    <td className="px-4 py-2">
                      {c.online ? (
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
      )}
    </>
  );
}
