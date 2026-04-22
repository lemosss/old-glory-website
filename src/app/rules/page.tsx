import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = { title: "Rules" };

const RULES: { title: string; items: string[] }[] = [
  {
    title: "Names",
    items: [
      "Offensive, racist, sexual, or trademarked names are prohibited.",
      "Impersonating staff members (GM, CM, God, ADM, etc.) in your name results in a permanent namelock.",
      "Random-looking names (e.g. Asdfghjkl) may be namelocked.",
    ],
  },
  {
    title: "Communication",
    items: [
      "Spam, flood, advertising other servers, and phishing result in mute or ban.",
      "Don't insult other players outside of PvP context. Light trashtalk is tolerated.",
      "Don't share anyone's personal information (doxxing is a permanent ban).",
    ],
  },
  {
    title: "Gameplay",
    items: [
      "Using bots, scripts, or any automation results in a permanent account ban.",
      "Exploits, item duplication, and known bugs must be reported. Using them is a ban.",
      "Multi-client is allowed up to 2 simultaneous accounts. Above that requires staff approval.",
      "Trading accounts, items, or characters for real money outside the official shop is not allowed.",
    ],
  },
  {
    title: "Staff",
    items: [
      "GM decisions are final. Arguing publicly results in a mute.",
      "Appeal via Discord ticket with evidence (screenshot/video) — that's the proper channel.",
      "Staff don't play on the server with personal characters to avoid conflicts of interest.",
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Server Rules" />
        <CardBody>
          <p className="text-sm text-stone-300">
            By creating an OldGlory account you agree to the rules below. Breaking
            them results in punishment, ranging from a temporary mute to a
            permanent account and IP ban — depending on severity.
          </p>
        </CardBody>
      </Card>

      {RULES.map((section) => (
        <Card key={section.title}>
          <CardHeader title={section.title} />
          <CardBody>
            <ul className="list-disc space-y-2 pl-5 text-sm text-stone-300 marker:text-amber-500">
              {section.items.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
