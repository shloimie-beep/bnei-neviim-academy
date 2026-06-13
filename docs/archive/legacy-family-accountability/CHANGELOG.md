# Changelog

All notable changes to the Family Accountability app.

## [Unreleased] — 2026-05-12 — Phase 9: Per-parent bots + Claude chat + reminders + QR

### Added
- **Per-parent Telegram bots.** Each parent has their own bot
  (`@shlomofam_bot`, `@ahuvafam_bot`) and their own webhook path
  (`/api/telegram/webhook/shloimie`, `/api/telegram/webhook/ahuva`). Auth
  module + client refactored to take a `ParentConfig`; notifications
  fan-out across BOTH bots so each parent sees their own thread.
- **Claude chat fallback in the bot.** Any non-command message sent to
  either bot routes to Claude via `@anthropic-ai/sdk`. System prompt is
  family-scoped — Claude has only the family Supabase as context, never
  WebCraft / Holy Flow data. Files live in `src/lib/claude/` (deliberately
  separate folder). Default model `claude-opus-4-7`, overridable via
  `ANTHROPIC_MODEL`. Prompt caching enabled on the system prompt.
- **Family context loader** (`src/lib/claude/family-context.ts`) — pulls
  active meeting + goals + today's check-ins + 7-day completion grid +
  streaks + last 3 meetings, formatted as a compact `<family-context>`
  block injected with every user message.
- `/dashboard` slash command and inline "Open Dashboard" button on bot
  replies — opens the parent web app from inside Telegram.
- **Reminder cron** at `/api/cron/reminders?type=morning|afternoon`. Lists
  each kid's open goals for the day; broadcasts to both parents. Auth via
  `CRON_SECRET`. Schedule TBD in Railway cron.
- **Kid login QR codes** at `/api/qr/<kid>`. Returns a 512×512 PNG QR
  pointing at `/kid/<kid>/pin` so kids scan once and land on PIN entry.
  Parchment-on-ink color palette matching the app.
- **Hebrew copy filled in** (`src/lib/i18n.ts`) — warm, kid-language
  Hebrew replacing all `__HE_TODO__` placeholders.
- **`broadcastToParents()` helper** in `lib/telegram/notify.ts` — used by
  reminder cron and daily summary. Daily summary's brittle dynamic import
  of the singleton `sendMessage` replaced with a clean call.

### Changed
- `.env.example` and `.env.local` restructured for per-parent secrets:
  `TELEGRAM_BOT_TOKEN_<PARENT>`, `TELEGRAM_BOT_USERNAME_<PARENT>`,
  `TELEGRAM_CHAT_ID_<PARENT>`, `TELEGRAM_WEBHOOK_SECRET_<PARENT>`.
  Singleton `TELEGRAM_BOT_TOKEN` removed.
- Old singleton webhook at `/api/telegram/webhook/route.ts` deleted.

### Verified
- `npx tsc --noEmit` clean
- `npx next build` succeeds, 25 routes (incl. 5 new APIs)

### Pending (see `WISHLIST.md`)
- Kid dashboard big-button polish
- Parent-to-parent shared notes
- Ad-hoc parent tasks (outside meetings)
- Natural-consequences system
- Multi-turn Claude memory
- Reminder cron Railway schedule

## [Unreleased] — 2026-05-12 — Phase 8: Parent polish pass

### Added
- **First-run onboarding wizard** `/parent/onboarding` — 5-step setup: welcome,
  kid PIN generation (in-app bcrypt → copyable Railway env vars), PWA install
  instructions, first family meeting (creates real meeting + goals), spouse
  magic-link + Telegram bot pointer. Parent home now redirects here on first
  visit; completion persisted via `family-acc-onboarded` cookie.
- **PWA install prompt** (`InstallPrompt`) — bottom banner on parent surfaces.
  Uses `beforeinstallprompt` on Android Chrome, dedicated "Add to Home Screen"
  sheet on iOS Safari. Dismissal sticky in localStorage.
- **Inline check-in approval** (`PendingCheckinRow`, `ApproveAllButton`) —
  parents can approve / reject from the dashboard (was Telegram-only). Optimistic
  hide on click; per-row error fallback if request fails.
- **Freeze toggle** (`FreezeToggle`) on parent → per-kid header.
- **Sticky mobile header** (`ParentHeader`) with optional back arrow + right slot.
- **Active meeting block** on parent → per-kid: notes, recording link, sorted
  goals, and a day-by-day completion grid (gold = all done, gold-soft = partial,
  line = none).
- **APIs:**
  - `POST /api/checkins/approve` — batch approve / reject
  - `POST /api/users/freeze` — pause / resume a kid's dashboard
  - `POST /api/users/pin-hash` — bcrypt-hash a PIN for env var pasting
  - `POST /api/onboarding/complete` — sets the onboarded cookie

### Changed
- **Parent home** rewritten mobile-first. Stacked on phone, two-column from
  `md:`. Total-pending counter at top. Each kid card surfaces pending check-ins
  inline (with proof note + photo indicator) above the "recent" tail.
- **Parent → per-kid** rewritten mobile-first with sticky header, freeze
  toggle, active-meeting block separated from history.
- `kid-session.ts` — switched `import crypto from 'node:crypto'` →
  `import crypto from 'crypto'` so Next/webpack bundles cleanly.

### Verified
- `npx tsc --noEmit` — clean
- `npx next lint --max-warnings=0` — clean
- `npx next build` — succeeds; all 23 routes (incl. 4 new APIs + onboarding)
  generate correctly

## [Unreleased] — 2026-05-12 (initial scaffold)

### Added — Phase 1: Scaffold
- Next.js 14 App Router + TypeScript + Tailwind project structure
- `package.json` with locked deps from bundle
- `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`
- `.env.example` with all required keys
- `.gitignore`
- Bundle docs mirrored: `SPEC.md`, `ARCHITECTURE.md`, `DESIGN.md`, `SETUP.md`,
  `CLAUDE_CODE_PROMPT.md`, `supabase-schema.sql`, `README-bundle.md`

### Added — Phase 2: Auth + routing
- Supabase server/browser/admin clients (`src/lib/supabase/`)
- Kid PIN session via signed httpOnly cookie (`src/lib/auth/kid-session.ts`)
- Parent Supabase magic link helpers (`src/lib/auth/parent-session.ts`)
- `src/middleware.ts` route protection
- `/api/auth/kid-login` and `/api/auth/parent-callback`

### Added — Phase 3: Kid dashboard
- Landing page `/` with two kid tiles + Parents link
- Kid PIN page `/kid/[name]/pin`
- Kid dashboard `/kid/[name]` — goal cards, optimistic UI, RTL Hebrew, streak counter
- Confetti on all-goals-done (one per day, gold + burgundy + ink, capped at 60)
- `/api/checkins` route (POST upsert)

### Added — Phase 4: Parent dashboard
- `/parent` two-kid layout with today's progress + streak + latest proofs
- `/parent/[kid]` meeting history view + "Start new meeting" modal
- `/api/meetings`, `/api/goals` CRUD

### Added — Phase 5: Telegram bot
- Webhook `/api/telegram/webhook`
- Commands: `/today`, `/streak`, `/meetings`, `/addgoal`, `/freeze`, `/unfreeze`, `/help`
- Inline Approve/Reject callback handlers on check-in notifications
- Chat-id whitelist enforced

### Added — Phase 6: Daily email
- `/api/cron/daily-summary` protected by `CRON_SECRET` Bearer
- React Email template `src/lib/email/templates/DailySummary.tsx`
- Resend client wrapper

### Added — Phase 7: PWA
- `public/manifest.json` with Frank-Ruhl-derived branding
- `next-pwa` service worker via `next.config.mjs`
- Placeholder app icons (Shlomo to replace)

### Pending (Phase 8 — polish, to be finalized by Claude Code in deploy session)
- Loading skeletons on all fetches
- Empty states (no meeting yet, no goals yet, frozen) — copy from DESIGN.md
- Error boundaries with friendly Hebrew/English messages
- End-to-end manual test pass
- Hebrew copy fill — currently `__HE_TODO__` placeholders in some empty states
