# Architecture — Family Accountability App

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router + TypeScript | Matches Shloimie's other repos; API routes built in; PWA-friendly |
| Styling | Tailwind CSS | Matches the WebCraft Media + Eitzikna pattern |
| DB + Auth + Storage | Supabase | One service for DB, kid auth (PIN via custom table), parent auth (magic link), proof photo storage |
| Email | Resend | Best React Email integration; free tier covers daily-summary volume |
| Telegram | node-telegram-bot-api | Webhook mode |
| Hosting | Railway | Same as Shloimie's existing infra; one new project named `family-accountability` |
| Scheduling | Railway cron | Built-in, no extra service |
| PWA | next-pwa | Standard, works on iOS + Android home-screen install |

## Project isolation

**Critical:** This must be a separate Railway project and a separate Supabase project from anything WebCraft Media. Reason: business separation from Yitz is in progress, and family data should never sit in any shared business infrastructure.

- New Supabase project: `family-accountability` (free tier is enough)
- New Railway project: `family-accountability`
- New Resend account or new sending domain — recommend a subdomain like `family.webcraftmedia.digital` so DNS is already under Shloimie's control, but the sending identity is clearly personal-family, not client-facing
- New Telegram bot via BotFather (don't reuse the WebCraft outreach bot)

## Data flow — kid check-in

```
Kid taps "complete" on tablet
    ↓
POST /api/checkins  (with optional photo upload to Supabase Storage)
    ↓
Supabase insert → checkins row, approved = null (pending)
    ↓
Server triggers Telegram message to both parents
    ↓
Parent taps Approve / Reject in Telegram
    ↓
Telegram webhook → POST /api/telegram/webhook
    ↓
Supabase update → checkins.approved = true/false
    ↓
Next time kid loads dashboard → sees status (or rejection note)
```

## Data flow — daily summary

```
Railway cron triggers at 22:00 Israel time
    ↓
GET /api/cron/daily-summary  (protected by CRON_SECRET header)
    ↓
Server queries today's checkins + goals + streaks for both kids
    ↓
React Email renders HTML
    ↓
Resend sends to ahuvadratler@gmail.com, CC shloimie's email
    ↓
Same data also sent as a formatted message to Telegram
```

## Auth model

**Kids:** No real auth service. The `users` table has `pin_hash` (bcrypt) for each kid. The kid selects their name on the landing page, enters PIN, and gets a long-lived signed cookie (30 days). Simple, age-appropriate, no email needed.

**Parents:** Supabase magic-link auth. Only two emails are allowed (env-pinned whitelist). 7-day session.

## Why not full Supabase Auth for kids

Kids are 12 or under (assumed). They don't have personal email. PIN flow is friendlier and more secure for this use case than any email/password setup.

## Streak calculation

A streak is calculated as: consecutive days where ALL of that day's goals were checked off (regardless of parent approval status — approval is a parent quality check, not a blocker for the kid's streak; otherwise the kid is penalized for parent slowness).

Calculated on the fly from the `checkins` table, no separate `streaks` table needed in V1.

## Estimated costs

| Service | Tier | Monthly |
|---|---|---|
| Supabase | Free | $0 |
| Railway | Hobby ($5 includes usage) | ~$5 |
| Resend | Free (3,000 emails/mo) | $0 |
| Telegram | Free | $0 |
| Domain (if new subdomain) | Already owned | $0 |
| **Total** | | **~$5/mo** |

## Security notes

- All API routes that mutate data require either kid session cookie or parent Supabase session.
- Telegram webhook validated via secret token.
- Cron endpoint validated via `CRON_SECRET` header.
- PIN attempts rate-limited (5 attempts per 15 minutes per kid) to prevent sibling guessing.
- Proof photos in Supabase Storage with signed URLs, never public.

## Failure modes the spec already handles

- Parent never approves → streak still counts (intentional, see streak logic above)
- Kid forgets to check off → tomorrow's dashboard shows yesterday faded out; can't backfill
- Internet outage on tablet → optimistic UI shows checked locally, syncs when online (V1.5; V1 ships without offline writes if it adds complexity)
- Telegram bot down → checkin still succeeds, dashboard still works; only the parent notification fails. Log to `notifications` table with `delivered = false`.
- Email service down → daily summary fails silently for the day. Manually re-trigger via parent dashboard "resend today's summary" button.
