# Legacy Supabase Setup Archive

Archived on 2026-06-10 during BNA task #209.

These files are historical manual setup notes from the period when this repo was
being moved from the old family-accountability scaffold into early BNA
experiments. They are not the live BNA database source of truth.

Current BNA operations use Railway hosting plus the production Postgres database
described in `MEMORY.md`, `SYSTEM-STATE.md`, `RAILWAY_TOKEN_SETUP.md`, and the
current server/database bootstrap code.

Do not run these SQL files against live BNA unless a future migration task
explicitly audits and updates them first.

Archived files:

- `SUPABASE_SETUP.md`
- `RUN_IN_SUPABASE.sql`
- `supabase-migration-003-bna-tasks.sql`
- `supabase-migration-004-cli-bridge.sql`
