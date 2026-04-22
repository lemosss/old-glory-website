import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getHousesWithOwnerNames } from "@/lib/services/houses";
import { getTownName } from "@/lib/vocations";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Houses" };
export const dynamic = "force-dynamic";

export default async function HousesPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string; status?: string }>;
}) {
  const { town, status } = await searchParams;
  const all = await getHousesWithOwnerNames();

  let list = all;
  if (town) list = list.filter((h) => String(h.town) === town);
  if (status === "free") list = list.filter((h) => h.owner === 0);
  if (status === "owned") list = list.filter((h) => h.owner !== 0);

  const towns = [...new Set(all.map((h) => h.town))].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Houses" actions={<span className="text-xs text-stone-500">{list.length} of {all.length}</span>} />
        <CardBody className="space-y-3">
          <form method="get" className="flex flex-wrap items-end gap-3 text-sm">
            <label className="space-y-1">
              <span className="block text-xs text-stone-400">Town</span>
              <select
                name="town"
                defaultValue={town ?? ""}
                className="rounded border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-200"
              >
                <option value="">All</option>
                {towns.map((t) => (
                  <option key={t} value={t}>
                    {getTownName(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-xs text-stone-400">Status</span>
              <select
                name="status"
                defaultValue={status ?? ""}
                className="rounded border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-200"
              >
                <option value="">All</option>
                <option value="free">Available</option>
                <option value="owned">Taken</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-amber-500"
            >
              Filter
            </button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Town</th>
                <th className="px-4 py-2 text-right">Size</th>
                <th className="px-4 py-2 text-right">Rent</th>
                <th className="px-4 py-2">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {list.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-2 text-stone-200">
                    {h.name}
                    {h.guild ? (
                      <span className="ml-2 rounded bg-amber-900/30 px-1.5 py-0.5 text-xs text-amber-300">
                        Guild
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-stone-400">{getTownName(h.town)}</td>
                  <td className="px-4 py-2 text-right text-stone-300">{h.size}</td>
                  <td className="px-4 py-2 text-right text-stone-300">
                    {formatNumber(h.rent)}
                  </td>
                  <td className="px-4 py-2">
                    {h.ownerName ? (
                      <Link
                        href={`/characters?name=${encodeURIComponent(h.ownerName)}`}
                        className="text-amber-400 hover:underline"
                      >
                        {h.ownerName}
                      </Link>
                    ) : (
                      <span className="text-emerald-400">Free</span>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                    No houses match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
