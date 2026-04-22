import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

type NavItem = { href: string; label: string };

const PRIMARY: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/characters", label: "Characters" },
  { href: "/highscores", label: "Highscores" },
  { href: "/online", label: "Online" },
  { href: "/shop", label: "Shop" },
  { href: "/guilds", label: "Guilds" },
];

type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "Community",
    items: [
      { href: "/team", label: "Team" },
      { href: "/wars", label: "Wars" },
      { href: "/killstatistics", label: "Kill Statistics" },
      { href: "/powergamers", label: "Power Gamers" },
      { href: "/fraggers", label: "Top Fraggers" },
      { href: "/records", label: "Records" },
      { href: "/bans", label: "Bans" },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/serverinfo", label: "Server Info" },
      { href: "/rules", label: "Rules" },
      { href: "/houses", label: "Houses" },
      { href: "/downloads", label: "Downloads" },
    ],
  },
];

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function Header() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "OldGlory";
  const session = await auth();
  const signedIn = !!session?.user?.accountId;

  return (
    <header className="sticky top-0 z-30 border-b border-amber-900/40 bg-stone-950/60 backdrop-blur-md supports-[backdrop-filter]:bg-stone-950/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wide text-amber-400">
            {siteName}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-1.5 text-sm font-medium text-stone-300 transition hover:bg-stone-800 hover:text-amber-300"
            >
              {item.label}
            </Link>
          ))}
          {GROUPS.map((g) => (
            <NavDropdown key={g.label} group={g} />
          ))}
          {signedIn ? (
            <>
              <Link
                href="/account"
                className="ml-2 rounded bg-amber-600 px-3 py-1.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-500"
              >
                Profile
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded border border-amber-600 px-3 py-1.5 text-sm font-semibold text-amber-400 transition hover:border-red-500 hover:bg-red-600 hover:text-stone-950"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="ml-2 rounded bg-amber-600 px-3 py-1.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-500"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded border border-amber-600 px-3 py-1.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-600 hover:text-stone-950"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavDropdown({ group }: { group: NavGroup }) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="rounded px-3 py-1.5 text-sm font-medium text-stone-300 transition hover:bg-stone-800 hover:text-amber-300"
      >
        {group.label} ▾
      </button>
      <div className="invisible absolute right-0 top-full z-40 min-w-[180px] translate-y-1 rounded border border-amber-900/40 bg-stone-950/95 p-1 opacity-0 shadow-lg backdrop-blur-md transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {group.items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-800 hover:text-amber-300"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
