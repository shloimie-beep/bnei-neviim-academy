# Dormant Next/Supabase App Archive

Archived on 2026-06-10 during BNA task #210.

This folder preserves the old Next.js App Router surfaces and their supporting
Supabase, parent/kid, email, localStorage task, and Telegram helper code. These
files came from the family-accountability app and early BNA experiments. They
are historical reference only.

## Runtime Boundary

The live BNA runtime is not this archive.

- Live app entrypoint: `server.js`
- Live Operations dashboard: `public/operations.html`
- Live public/student/parent static surfaces: `public/`
- Current shared BNA runtime helpers: `src/lib/bna/*.js`
- Current video/Remotion code: `src/remotion/`

Do not import archived files into live BNA code without a fresh migration task,
an import audit, and focused tests.

## Preserved Patterns

Useful ideas that may be reused after deliberate migration:

- warm, minimal parent/student task and check-in UI patterns
- parent review and child goal/check-in data shapes
- daily summary email composition structure
- Telegram command/callback handler organization
- Supabase auth/session examples if Supabase is explicitly reintroduced

Do not reuse the old family-accountability schema, bot identity, task lanes,
parent/kid assumptions, or copy as current BNA behavior.

## Archived Contents

- `next.config.mjs`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `src/app/`
- `src/components/`
- `src/middleware.ts`
- `src/lib/ai/`
- `src/lib/auth/`
- `src/lib/email/`
- `src/lib/supabase/`
- `src/lib/telegram/`
- `src/lib/tasks/`
- old Next-only `src/lib/bna/*.ts` bridge/task helpers
