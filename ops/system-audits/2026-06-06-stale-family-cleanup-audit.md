# Stale Family Cleanup Audit - 2026-06-06

## Scope

- Role: Agent C, stale-family cleanup auditor/patcher.
- Constraint followed: no runtime/schema rewrites and no edits to
  `server.js`, `public/operations.html`, or `public/index.html`.
- Current app reality: `package.json` starts `node server.js`; the old
  Next/Supabase family app appears dormant for the current Railway app path, but
  it remains risky if Next routes, helper modules, or legacy SQL are reused.

## High-Risk Legacy Paths

1. Old Next family app island under `src/app/**`.
   - `src/app/page.tsx:6` hard-codes Menachem/Esther tiles and links to
     `/kid/<name>/pin`.
   - `src/app/kid/[name]/page.tsx:13` and
     `src/app/parent/page.tsx:1` implement the kid/parent dashboard model.
   - `src/app/api/checkins/route.ts:1`,
     `src/app/api/goals/route.ts`, `src/app/api/meetings/route.ts`,
     `src/app/api/consequences/route.ts`, and
     `src/app/api/cron/reminders/route.ts` still operate on
     `users`, `meetings`, `goals`, `checkins`, and family approval semantics.
   - `src/app/api/cron/daily-summary/route.ts:109` queries non-frozen kids and
     `src/app/api/cron/daily-summary/route.ts:223` sends a
     `Family Accountability` subject.

2. Legacy auth/session model.
   - `src/middleware.ts:1` gates `/kid/[name]` and `/parent/*`.
   - `src/lib/auth/kid-session.ts:26` uses the `family-acc-kid` cookie.
   - `src/lib/auth/kid-session.ts:293` only maps
     `KID_PINS_HASH_MENACHEM` and `KID_PINS_HASH_ESTHER`.
   - `src/lib/onboarding.ts:5` uses the `family-acc-onboarded` cookie.

3. Legacy AI context and prompt surface.
   - `src/lib/ai/chat.ts` imports the family prompt/context builders.
   - `src/lib/ai/system-prompt.ts:14` identifies the bot as the Dratler family
     home assistant.
   - `src/lib/ai/family-context.ts:15` builds `<family-context>` from
     `users.role = kid`, `meetings`, `goals`, `checkins`, `parent_notes`, and
     `get_streak`.
   - If the old webhook is ever mounted, ordinary chat could answer from stale
     family data instead of BNA students/tasks/content.

4. Legacy Telegram parent-bot stack.
   - `src/app/api/telegram/webhook/[parent]/route.ts:4` documents
     `@shlomofam_bot` and `@ahuvafam_bot`.
   - `src/lib/telegram/auth.ts:16` defines only `shloimie` and `ahuva`
     parent bot identities.
   - `src/lib/telegram/messages.ts:184` still renders
     `Family Accountability Bot`.
   - `scripts/set-webhooks.mjs`, `scripts/launch.mjs`, and
     `scripts/send-onboarding.mjs` still target the old family onboarding and
     bot setup flow.

5. Legacy schema and migrations.
   - `supabase-schema.sql:1` is explicitly the Family Accountability schema.
   - `supabase-schema.sql:13` creates the shared `users` table with
     `kid`/`parent` roles and `pin_hash`.
   - `supabase-schema.sql:24` seeds Menachem and Esther.
   - `supabase-schema.sql:35`, `supabase-schema.sql:69`, and
     `supabase-schema.sql:86` create `meetings`, `goals`, and `checkins`.
   - `supabase-migration-002.sql:7` and `supabase-migration-002.sql:33` add
     `parent_notes` and `goal_consequences`.
   - These files should not be run against the BNA production database without a
     deliberate migration plan.

## Medium-Risk Cleanup Targets

- Legacy docs: `README.md`, `SETUP.md`, `SPEC.md`, `ARCHITECTURE.md`,
  `DESIGN.md`, `CHANGELOG.md`, `CLAUDE_CODE_PROMPT.md`, `README-bundle.md`, and
  `WISHLIST.md` still describe the old family app. They are not runtime code,
  but they can mislead future agents.
- Legacy launch/onboarding helpers: root `launch.html` and
  `onboarding/index.html` are old family launch materials.
- `.env.example` still includes `TELEGRAM_CHAT_ID_AHUVA`; this may be a
  backward-compatible bridge fallback, so do not remove it until the Telegram
  config owner confirms the final env naming.
- `scripts/send-onboarding.mjs` and `scripts/launch.mjs` should be deprecated or
  guarded before anyone runs old family setup commands.

## Intentional Non-Issues

- `parent`, `child`, `children`, `family`, and `accountability` are not all
  stale. They are valid in BNA brand, signup, parent messaging, student growth,
  and student accountability contexts.
- `server.js` and `public/operations.html` contain many BNA-valid parent,
  student, approval, and accountability references. No safe stale visible string
  was obvious enough to patch under this task's constraints.
- `public/index.html` contains public-facing BNA philosophy language around
  children, parents, and family-centered education. Those references appear
  intentional, not legacy app leakage.

## Safe Next Patches

1. Add a clear deprecation banner to legacy root docs rather than rewriting them
   in place. Recommended first targets: `README.md`, `SETUP.md`, `SPEC.md`,
   `ARCHITECTURE.md`, `DESIGN.md`, and `CLAUDE_CODE_PROMPT.md`.
2. Add safety guards to `scripts/send-onboarding.mjs`, `scripts/launch.mjs`, and
   `scripts/set-webhooks.mjs`, requiring an explicit
   `ALLOW_LEGACY_FAMILY_APP=1` before they run.
3. Move or archive the dormant Next family tree only after verifying no current
   `server.js` app path imports `src/app/**`, `src/lib/auth/**`,
   `src/lib/telegram/**`, or `src/lib/ai/family-context.ts`.
4. Replace the legacy family AI context with a BNA context builder based on
   `bna_students`, `bna_accountability_events`, `bna_tasks`,
   `content_jobs`, and live signup/payment data before any old webhook code is
   reused.
5. Rename or archive `supabase-schema.sql` and `supabase-migration-002.sql` as
   legacy family SQL. Keep BNA schema changes in BNA-named migrations.
6. After any runtime-visible cleanup, follow the repo rule: deploy the app
   bundle, run Railway doctor/live smoke, and only then mark the task complete.

## Safe Patch Made In This Pass

- Updated `PROJECT-NOTES.md` so it no longer says Kimi is tried before OpenAI
  and now records that the current app entrypoint is `node server.js`.
- Added this audit report. No risky code or schema changes were made.
