import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getLatestTickers } from "@/lib/services/news";
import { getOnlineCount } from "@/lib/services/online";
import { formatUnixDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tickers, onlineCount] = await Promise.all([
    getLatestTickers(3),
    getOnlineCount(),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-lg border border-amber-900/40 bg-stone-950/45 shadow-xl backdrop-blur-md supports-[backdrop-filter]:bg-stone-950/35">
          <div className="relative space-y-5 px-6 py-10 md:px-10 md:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
              Your legend starts here
            </p>
            <h1 className="font-serif text-3xl leading-tight text-amber-100 md:text-5xl">
              Welcome to <span className="text-amber-400">OldGlory</span>
            </h1>
            <p className="max-w-2xl text-base text-stone-300 md:text-lg">
              You never forget your <strong className="text-amber-200">first dragon</strong>,
              your first guild, your first war. At OldGlory we bring back everything
              that made Tibia unforgettable — classic map, real economy, genuine
              respawns, and a community that plays to <em>write history</em>.
            </p>
            <p className="max-w-2xl text-sm text-stone-400">
              New here? <strong className="text-amber-200">Create your account in seconds</strong>,
              roll up your character, and step into a world where every level counts.
            </p>
            <dl className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-sm">
              <div>
                <dt className="text-stone-400">IP</dt>
                <dd className="font-mono text-amber-200">oldglory.net</dd>
              </div>
              <div>
                <dt className="text-stone-400">Port</dt>
                <dd className="font-mono text-amber-200">7171</dd>
              </div>
              <div>
                <dt className="text-stone-400">Client</dt>
                <dd className="font-mono text-amber-200">7.4</dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard title="Respawns" text="Balanced hunts, fair XP, and active quests." />
          <FeatureCard title="Wars & Guilds" text="War and fragger system, organized guilds." />
          <FeatureCard title="Antibug" text="Tested map, reviewed scripts, zero exploits." />
        </div>
      </div>

      <aside className="space-y-6">
        <Card>
          <CardHeader title="Server Status" />
          <CardBody className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Status</span>
              <span className="font-semibold text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Players online</span>
              <span className="font-semibold">{onlineCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">IP</span>
              <span className="font-mono text-amber-200">oldglory.net</span>
            </div>
          </CardBody>
        </Card>

        {tickers.length > 0 && (
          <Card>
            <CardHeader title="Latest news" />
            <CardBody>
              <ul className="space-y-3 text-sm">
                {tickers.map((t, i) => (
                  <li
                    key={`${t.date}-${i}`}
                    className="border-l-2 border-amber-600 pl-3"
                  >
                    <div
                      className="news-body text-stone-300"
                      dangerouslySetInnerHTML={{ __html: t.text }}
                    />
                    <time className="text-xs text-stone-500">
                      {formatUnixDate(t.date)}
                    </time>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </aside>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <CardBody className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-300">
          {title}
        </h3>
        <p className="text-sm text-stone-300">{text}</p>
      </CardBody>
    </Card>
  );
}
