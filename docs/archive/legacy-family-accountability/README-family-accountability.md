# Family Accountability

A small, warm web app for the Dratler family. Two kids, two parents,
one Telegram bot, a nightly summary email, and a goal that the kids
tap to check off each day.

This is **not** a WebCraft Media / Holy Flow product. Same operator,
same billing accounts (Railway + Supabase), but a completely separate
codebase, separate database, separate Telegram identity. Family data
never sits near client work.

## Quick start

1. **Supabase project** — see [SETUP.md §1](./SETUP.md)
2. **Resend domain** — see [SETUP.md §2](./SETUP.md)
3. **Telegram bot** — see [SETUP.md §3](./SETUP.md)
4. **Env vars** — copy `.env.example` to `.env.local`, fill in
5. **Install + run**

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000

6. **Deploy** — see [SETUP.md §5](./SETUP.md)

## Docs

- [`SPEC.md`](./SPEC.md) — what the app does, who uses it
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — stack, data flow, security
- [`DESIGN.md`](./DESIGN.md) — type system, palette, micro-interactions
- [`SETUP.md`](./SETUP.md) — step-by-step deploy walkthrough (forward §7 to Ahuva)
- [`supabase-schema.sql`](./supabase-schema.sql) — paste into Supabase SQL editor
- [`CHANGELOG.md`](./CHANGELOG.md) — what's done, what's pending

## Tech

Next.js 14 App Router · TypeScript · Tailwind · Supabase · Resend ·
node-telegram-bot-api · Railway · PWA via next-pwa.

## License

Private — Dratler family only.
