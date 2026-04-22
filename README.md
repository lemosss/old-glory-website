# OldGlory — Community Website

Modern rewrite of a classic Gesior-style OT website. Built with **Next.js 16 (App Router)**,
**TypeScript**, **Tailwind**, **Prisma** (introspected against the existing MySQL schema),
and **Auth.js**. Designed to drop in front of an Open Tibia server and share the same
MySQL database, so a single login works on the website **and** in-game.

![OldGlory homepage](docs/screenshot.png)

- **Live:** https://oldglory.net
- **Repo:** https://github.com/lemosss/old-glory-website
- **License:** MIT

## Features

- Home page with live server status and news tickers
- Character search and detailed profiles (info, deaths, other chars on the account)
- Highscores for level, magic, and every combat skill (system chars hidden)
- Online list, guilds and rank members, houses, bans, wars, records
- Shop with premium points — transactional purchase with history, same account pool as in-game
- Buy Premium Points flow with MercadoPago (PIX + credit card)
- Register / Login / Forgot Password / Reset Password — SHA1 passwords stay compatible
  with the OT server's `encryptionType = "sha1"`
- Account panel: create characters, view owned chars, change password/email, sign out
- Admin-free: no server-side mutations the player can't also achieve in-game

## Tech stack

| Area            | Choice                                                     |
|-----------------|------------------------------------------------------------|
| Framework       | Next.js 16 (App Router, Server Components, Server Actions) |
| Language        | TypeScript (strict)                                        |
| Styling         | Tailwind CSS v4                                            |
| ORM             | Prisma 6 (MySQL, introspected schema)                      |
| Auth            | Auth.js (Credentials, JWT sessions)                        |
| Validation      | Zod 4                                                      |
| Email (reset)   | Resend HTTP API (no SMTP dependency) — optional            |
| Payments        | MercadoPago (PIX + credit card) — optional                 |

## Repository layout

```
src/
├── app/                      # routes (Server Components by default)
│   ├── page.tsx              # Home
│   ├── characters/           # search + profile
│   ├── highscores/, online/, guilds/, houses/, bans/, wars/, records/
│   ├── shop/                 # offers + server-action purchase
│   ├── buypoints/            # MercadoPago checkout
│   ├── register/, login/     # auth flow
│   ├── login/forgot/         # request password reset
│   ├── login/reset/          # redeem reset token
│   ├── account/              # signed-in dashboard, settings, create-character
│   ├── api/auth/             # Auth.js handlers
│   ├── robots.ts, sitemap.ts # SEO
│   └── rules/, serverinfo/, team/, downloads/
├── components/
│   ├── layout/               # Header, Footer
│   └── ui/                   # Card, Button, Input
├── lib/
│   ├── db.ts                 # Prisma singleton
│   ├── env.ts                # env schema validated with Zod
│   ├── auth.ts               # Auth.js config (Credentials + SHA1/bcrypt)
│   ├── mail.ts               # email sender (Resend or console)
│   ├── filters.ts            # shared Prisma filters
│   ├── utils.ts, vocations.ts, site-config.ts
│   ├── services/             # business logic on top of Prisma
│   │   ├── accounts.ts, characters.ts, guilds.ts, houses.ts
│   │   ├── killstatistics.ts, news.ts, online.ts, server-info.ts
│   │   ├── shop.ts, team.ts, top-weekly.ts
│   │   └── password-reset.ts # stateless HMAC tokens
│   ├── gateway/mercadopago.ts
│   └── validators/           # Zod schemas for forms
├── generated/prisma/         # Prisma Client output (not checked in)
└── types/next-auth.d.ts
```

Conventions:

- **No SQL in the UI.** Routes only call `lib/services/*`.
- **Env validated at boot** (`lib/env.ts` with Zod) — misconfiguration fails fast.
- **Type-safe end-to-end** with Prisma + TypeScript strict.
- **Server Actions** for all mutations (register, login, buyOffer, createCharacter,
  forgot/reset password), always validated with Zod.
- **JWT sessions** via Auth.js (no PHP session legacy).
- `publicPlayerFilter` hides system/staff characters from every public listing.

## Requirements

- Node.js **20+** (Next.js 16 requires modern Node)
- MySQL **5.7+** or MariaDB **10.3+** with the OT server schema imported
- (Optional) A Resend account for password-reset emails
- (Optional) A MercadoPago account for the Buy Points flow

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in the values
cp .env.example .env
# edit DATABASE_URL and AUTH_SECRET at minimum
# generate AUTH_SECRET with: openssl rand -base64 32

# 3. (Optional) Import the reference schema if you don't already have an OT DB
mysql -u root -e "CREATE DATABASE servidor CHARACTER SET utf8mb4;"
mysql -u root servidor < db/dump.sql

# 4. Generate the Prisma Client
npx prisma generate

# 5. Start the dev server
npm run dev
```

Dev server runs at http://localhost:3000 with hot reload.

## Environment variables

| Name                       | Required | Purpose                                                                 |
|----------------------------|----------|-------------------------------------------------------------------------|
| `DATABASE_URL`             | Yes      | `mysql://user:pass@host:3306/dbname`                                     |
| `AUTH_SECRET`              | Yes      | 32+ random characters — `openssl rand -base64 32`                        |
| `AUTH_TRUST_HOST`          | Yes      | `"true"` for Vercel or any reverse-proxy deployment                      |
| `NEXT_PUBLIC_SITE_NAME`    | No       | Display name used in header, footer, `<title>`, OG/Twitter cards         |
| `NEXT_PUBLIC_SITE_URL`     | No       | Public canonical URL for `metadataBase`, `robots.txt`, `sitemap.xml`     |
| `RESEND_API_KEY`           | No       | If set, password-reset emails go out via Resend. Otherwise logged only.  |
| `MAIL_FROM`                | No       | `From` address used by the password-reset email                          |
| `MERCADOPAGO_ACCESS_TOKEN` | No       | Enables the `/buypoints` checkout. When unset the page shows a warning.  |
| `MERCADOPAGO_WEBHOOK_SECRET` | No     | Used by the MercadoPago webhook handler (if you wire one up)             |

Every variable goes through `src/lib/env.ts` at startup, so a bad config fails fast
with a clear message instead of starting a broken app.

## Scripts

| Command          | What it does                                |
|------------------|---------------------------------------------|
| `npm run dev`    | Next.js dev server with Turbopack           |
| `npm run build`  | Production build                            |
| `npm start`      | Serve the production build                  |
| `npm run lint`   | ESLint                                      |
| `npx prisma generate` | Regenerate the Prisma Client           |

## Deploy to Vercel

1. Push the repo to GitHub.
2. In the Vercel dashboard, click **Add New → Project** and import the repo.
3. Set **Framework Preset** to *Next.js* (Vercel auto-detects it).
4. Under **Build & Development Settings**, set:
   - **Build Command:** `prisma generate && next build`
   - **Install Command:** `npm install`
5. Add environment variables (from `.env.example`):
   - `DATABASE_URL` — must be a publicly reachable MySQL host (PlanetScale,
     Railway, a VPS, …). Vercel's serverless runtime can't reach `127.0.0.1`.
   - `AUTH_SECRET` — fresh random string (do not reuse the dev value).
   - `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_SITE_NAME=OldGlory`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
   - `RESEND_API_KEY` and `MAIL_FROM` if you want real password-reset emails.
   - `MERCADOPAGO_ACCESS_TOKEN` if you want the Buy Points page functional.
6. Click **Deploy**.

That's it. Subsequent pushes to the default branch auto-deploy.

### Deploy anywhere else

The app is a vanilla Next.js project and works on any Node host (Railway, Fly,
Render, VPS with PM2, …). The only infra requirement is a MySQL instance it can
reach over the network.

```bash
npm run build
PORT=3000 npm start
```

## Database

`db/dump.sql` is a full MySQL dump that includes the schema and reference game
data (items, monsters, spells, shop offers, houses, tiles). It contains **no real
accounts** — only the system `Account Manager` and vocation sample characters.
See [`db/README.md`](./db/README.md) for import instructions.

## Legacy compatibility

- Passwords are hashed with **SHA1** so the OT server and the website share the
  same credential store (`encryptionType = "sha1"` in `config.lua`). A single
  account+password pair works on both.
- `z_news_big` / `z_news_tickers` have no primary key in the legacy schema, so
  we read them via `$queryRaw`.
- News bodies in the old database are often double-encoded between Latin1 and
  UTF-8. `lib/services/news.ts:decode()` reverses that on read.
- `publicPlayerFilter` hides `account_id = 1` (system) and `group_id >= 2`
  (staff) from every public listing.
- The OT server persists the player `skull` column as a constant (`SKULL_RED`),
  so the website reads `skulltime > now` to decide whether a red skull is
  actually active (see `src/app/shop/page.tsx`).

## Contributing

Contributions are welcome. The core guidelines:

- Keep all user-facing text in **English**.
- Read `src/lib/services/` before you reach for Prisma in a route.
- Add Zod validation for every new form / server action.
- Prefer Server Components; only drop to `"use client"` when you need state.

Open an issue before a large refactor so we can discuss the approach.

## License

MIT — see [`LICENSE`](./LICENSE).

Not affiliated with CipSoft. Tibia is a trademark of CipSoft GmbH.
