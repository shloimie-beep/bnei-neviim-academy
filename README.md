# BNA v2.0

This repository is the shared operating brain and live app workspace for Bnei
Neviim Academy, the Whole Child Torah Learning Community in Beit Shemesh.

## Current Source Of Truth

- `AGENTS.md` - agent operating rules and workflow behavior
- `MEMORY.md` - durable BNA facts, requirements, preferences, and definitions
- `TASKS.md` - current work queue and visible next actions
- `SYSTEM-STATE.md` - verified live system state and deployment notes
- `PROJECT-NOTES.md` - local migration notes and technical caveats
- `brand-kit/` - BNA voice, philosophy, parent messaging, and teaching principles
- `content-memory/` - transcript/content inventory and platform prompt memory
- `ops/agent-changelog.md` - completed agent work and verification trail

## Current App Reality

- Live Operations is the Express/static app served by `server.js` and
  `public/operations.html`.
- The normal public site is the static public website under `public/`.
- Railway is the live hosting and production Postgres source of truth.
- Supabase is not the current BNA operations database unless explicitly
  reintroduced.
- The old Next/Supabase family-app code has been moved out of active source and
  archived under `docs/archive/dormant-next-supabase-app/`.

## BNA Model

BNA is not the old family accountability app and not a generic secular-project
school platform. The current academy model is a home-based, integrative Torah
learning program, currently framed around a 10:00 to 1:00 learning window, with
private coaching/check-ins and parent partnership around the child.

The stable philosophy lives in `MEMORY.md` and `brand-kit/`. In short: Torah
learning should meet the whole child, responsibility grows through autonomy,
mastery, purpose, meaningful roles, and honest coaching, and practical
real-world skills should serve the Torah learning environment rather than
replacing it.

## Legacy Archive

The old family-accountability bundle and historical Supabase setup files were
archived under:

- `docs/archive/legacy-family-accountability/`
- `docs/archive/legacy-supabase-setup/`
- `docs/archive/dormant-next-supabase-app/`

Those files are historical reference only. Do not use them to decide current
BNA product behavior, database setup, Telegram behavior, parent/student
workflow, school model, or brand voice.

The root `SUPABASE_SETUP.md` is only a deprecation pointer. It is not a setup
guide.
Old family launch, onboarding, webhook, and Supabase helper scripts were also
removed from `scripts/` and preserved under the legacy archive.
Old Next/Supabase app-router code, parent/kid React surfaces, localStorage
TaskApp code, and family Telegram/email helpers are preserved only in the
dormant Next/Supabase app archive.

## Useful Checks

```powershell
node --check server.js
npm test
npm run railway:doctor
```

Do not deploy or mark live tasks done unless the task explicitly requires that
system-state change and the live Railway smoke checks pass.
