# Claude Code Build Prompt — Family Accountability App

Paste this entire file into Claude Code at the start of the build session.

---

You are building a family accountability web app for Shloimie Dratler. Two kids (Menachem and Esther) check off custom goals set at family meetings. Parents (Shloimie and his wife Ahuva) monitor via a web dashboard, a shared Telegram bot, and a nightly email summary.

This bundle includes a full spec (`SPEC.md`), architecture doc (`ARCHITECTURE.md`), design direction (`DESIGN.md`), setup guide (`SETUP.md`), a Supabase schema (`supabase-schema.sql`), and a `package.json` with the locked dependency list. Read all of them before writing code.

## Operating rules (from Shloimie's AGENTS.md protocol)

- You are the builder. Do not rewrite from scratch. Make small, verifiable commits.
- After each phase, run `npm run build` and `npm run lint` and confirm both pass before declaring the phase done.
- Maintain a `CHANGELOG.md` at the repo root. Append every meaningful change.
- If you hit ambiguity that genuinely blocks progress, stop and ask Shloimie. Do not invent product decisions.
- Match the design intent in `DESIGN.md`. Do not default to generic AI styling. No purple-on-white gradients. No Inter or Roboto. Follow the fonts and palette specified.

## Stack (non-negotiable)

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (Postgres + Auth + Storage for proof photos)
- Resend for transactional email
- node-telegram-bot-api for the Telegram bot
- Deploy target: Railway (separate project from any existing WebCraft Media project)
- PWA-enabled so it installs to the kids' home screens on both Android and iOS

## Build order (do these phases in sequence)

### Phase 1 — Scaffold
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router, ESLint, `src/` directory, import alias `@/*`.
- Install all deps from `package.json`.
- Set up Supabase client (server + browser).
- Create `.env.local` from `.env.example`. Stop and tell Shloimie which env vars he needs to populate.
- Run the schema from `supabase-schema.sql` in Supabase SQL editor (instruct Shloimie to do this).
- Commit. **Verify:** `npm run dev` boots without errors.

### Phase 2 — Auth and routing
- Landing page `/` shows two big tiles: "מנחם" and "אסתר" plus a small "Parents" link in the corner.
- Tap a kid's tile → 4-digit PIN screen → on success, route to `/kid/[name]`.
- Parent login uses Supabase Auth magic link to either Shloimie's or Ahuva's email.
- Sessions persist 30 days for kids, 7 days for parents.
- Commit. **Verify:** Both kid PIN flows work end-to-end with seeded test PINs.

### Phase 3 — Kid dashboard
- Fetch the current active meeting and that kid's goals for it.
- Render each goal as a large tappable card (see `DESIGN.md`).
- Tap to expand → show optional proof note field and "Upload photo" button (uses Supabase Storage).
- Submit check-in. Optimistic UI update. Streak counter updates.
- Hebrew/English toggle in the top corner. Persist preference per user in `user_preferences`.
- Hebrew is RTL; layout flips correctly with `dir="rtl"`.
- When all goals for the day are checked, run a one-time confetti animation (use `canvas-confetti` or a tasteful CSS variant — match design intent, don't make it cartoony).
- Commit. **Verify:** Check off a goal with proof; row appears correctly in `checkins` table.

### Phase 4 — Parent dashboard
- `/parent` shows both kids side by side: today's goals, completed/total, streak, latest proof items.
- Click a kid → meeting history view, with a "Start new meeting" button.
- "Start new meeting" → modal: date (default today), optional recording URL field, then add goals (title, description, which kid it's for). Goals are free-text, not from a template.
- Commit. **Verify:** Create a meeting with three goals, see them appear on the kid's dashboard immediately.

### Phase 5 — Telegram bot
- Webhook endpoint `/api/telegram/webhook`. Single bot, both parents authorized via chat_id whitelist in env.
- On kid check-in: bot sends a message with kid name, goal title, proof note/photo, and inline Approve/Reject buttons.
- Approve → marks `checkins.approved = true`. Reject → marks `approved = false` and notifies kid on next dashboard load with a gentle "Tatty/Mommy wants you to redo this" message.
- Commands: `/today` (today's status), `/streak` (both kids' streaks), `/freeze menachem` (locks kid dashboard with a friendly message until `/unfreeze`), `/addgoal menachem "title"` (mid-day addition).
- Commit. **Verify:** Full round trip: kid checks off → parent gets Telegram message → approves → status updates.

### Phase 6 — Daily email
- Cron endpoint `/api/cron/daily-summary` triggered at 22:00 Israel time by Railway cron.
- Renders a clean HTML email summarizing both kids' day: goals, what was checked, proof links, streak, anything missed.
- Sends to `ahuvadratler@gmail.com` and CCs Shloimie.
- Email template lives in `lib/email/templates/daily-summary.tsx` using React Email.
- Commit. **Verify:** Trigger endpoint manually, confirm Ahuva receives a well-rendered email.

### Phase 7 — PWA + install flows
- Add `manifest.json`, service worker, icons (generate placeholder app icons; Shloimie will replace).
- Test "Add to Home Screen" works on both iOS Safari and Android Chrome.
- Write installation instructions for each tablet into `SETUP.md` — the section is already there, but verify the URLs work.
- Commit. **Verify:** Install on both tablets, both look right, both load offline-shell.

### Phase 8 — Polish
- Loading skeletons everywhere there's a fetch.
- Empty states (no meeting yet, no goals yet, etc.) with copy that matches `DESIGN.md` tone.
- Error boundaries with friendly Hebrew/English messages.
- Manual test the full flow end-to-end. Document any issues in `CHANGELOG.md`.

## Where to ask vs. where to decide

**Decide yourself:** component naming, file structure within the conventions, styling specifics within `DESIGN.md` bounds, internal API shapes.

**Ask Shloimie:** anything that affects the product (new feature scope), security (auth flow changes), or costs (services beyond what's listed). Also ask if `DESIGN.md` is unclear — don't guess on aesthetic intent.

## Definition of done

- All 8 phases complete and verified.
- Deployed to Railway at a working URL.
- Both kids can log in on their tablets and check off goals.
- Ahuva received at least one daily email.
- Telegram bot responds to all listed commands.
- `CHANGELOG.md` is current.
- `README.md` at the repo root has the live URL and a "how to use" section for the family.
