import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  getLevelHighscores,
  getMagicHighscores,
  getSkillHighscores,
} from "@/lib/services/highscores";
import { getVocationName } from "@/lib/vocations";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Category =
  | "level"
  | "magic"
  | "fist"
  | "club"
  | "sword"
  | "axe"
  | "distance"
  | "shielding"
  | "fishing";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "level", label: "Experience" },
  { key: "magic", label: "Magic" },
  { key: "fist", label: "Fist" },
  { key: "club", label: "Club" },
  { key: "sword", label: "Sword" },
  { key: "axe", label: "Axe" },
  { key: "distance", label: "Distance" },
  { key: "shielding", label: "Shielding" },
  { key: "fishing", label: "Fishing" },
];

function isCategory(v: string | undefined): v is Category {
  return CATEGORIES.some((c) => c.key === v);
}

type Row = {
  rank: number;
  name: string;
  level: number;
  vocation: number;
  promotion: number;
  value: bigint | number;
  valueLabel: string;
};

async function loadRows(category: Category): Promise<Row[]> {
  if (category === "level") {
    const rows = await getLevelHighscores(100);
    return rows.map((p, i) => ({
      rank: i + 1,
      name: p.name,
      level: p.level,
      vocation: p.vocation,
      promotion: p.promotion,
      value: p.experience,
      valueLabel: "Experience",
    }));
  }
  if (category === "magic") {
    const rows = await getMagicHighscores(100);
    return rows.map((p, i) => ({
      rank: i + 1,
      name: p.name,
      level: p.level,
      vocation: p.vocation,
      promotion: p.promotion,
      value: p.maglevel,
      valueLabel: "Magic Level",
    }));
  }
  const rows = await getSkillHighscores(category, 100);
  return rows
    .filter((r) => r.players && r.players.group_id < 2)
    .map((r, i) => ({
      rank: i + 1,
      name: r.players?.name ?? "—",
      level: r.players?.level ?? 0,
      vocation: r.players?.vocation ?? 0,
      promotion: r.players?.promotion ?? 0,
      value: r.value,
      valueLabel: "Skill",
    }));
}

export default async function HighscoresPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: raw } = await searchParams;
  const category: Category = isCategory(raw) ? raw : "level";
  const rows = await loadRows(category);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/highscores?category=${c.key}`}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition",
              c.key === category
                ? "bg-amber-600 text-stone-950"
                : "border border-stone-700 text-stone-300 hover:border-amber-600 hover:text-amber-300",
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>
      <Card>
        <CardHeader title={`Highscores — ${CATEGORIES.find((c) => c.key === category)?.label}`} />
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-950 text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Vocation</th>
                <th className="px-4 py-2 text-right">Level</th>
                <th className="px-4 py-2 text-right">{rows[0]?.valueLabel ?? "Value"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {rows.map((r) => (
                <tr key={`${r.name}-${r.rank}`}>
                  <td className="px-4 py-2 text-stone-500">{r.rank}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/characters?name=${encodeURIComponent(r.name)}`}
                      className="text-amber-400 hover:underline"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-stone-300">
                    {getVocationName(r.vocation)}
                  </td>
                  <td className="px-4 py-2 text-right text-stone-300">{r.level}</td>
                  <td className="px-4 py-2 text-right font-mono text-stone-200">
                    {typeof r.value === "bigint" ? r.value.toString() : r.value}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                    No data yet.
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
