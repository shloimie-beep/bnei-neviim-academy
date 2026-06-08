# BNA v2.0 Notes

This workspace was bootstrapped from `family-accountability` so we could reuse
the existing Supabase-backed app structure without rebuilding the plumbing from
scratch.

Current state:

- The current local/Railway app entrypoint is `node server.js` from
  `package.json`.
- The copied `.env.local` still points at the working family-system Supabase
  project, which is now acting as the starting database for this workspace.
- Free-text bot chat no longer depends on Anthropic. OpenAI API is the default
  Telegram reply engine; Kimi is fallback only for provider failures or legacy
  records.
- The old Next/Supabase family app tree still exists under `src/app`,
  `src/lib/auth`, `src/lib/telegram`, and legacy schema files such as
  `supabase-schema.sql`. Treat those paths as legacy until they are
  intentionally migrated or archived.
