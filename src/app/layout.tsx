import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "OldGlory";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oldglory.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: `${siteName} — Open Tibia community site. Classic 7.4 server with balanced respawns, quests, wars and a real community.`,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description: `${siteName} — Open Tibia community site.`,
    images: ["/bg-tibia.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: `${siteName} — Open Tibia community site.`,
    images: ["/bg-tibia.jpg"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-950 text-stone-100">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
