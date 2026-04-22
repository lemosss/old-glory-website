export function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Tibia Server";
  return (
    <footer className="mt-auto border-t border-amber-900/40 bg-stone-950/60 py-6 text-center text-xs text-stone-400 backdrop-blur-md supports-[backdrop-filter]:bg-stone-950/40">
      © {new Date().getFullYear()} {siteName}. Not affiliated with CipSoft.
    </footer>
  );
}
