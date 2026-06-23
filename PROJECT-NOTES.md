# BNA v2.0 Notes

This workspace was bootstrapped from `family-accountability`, but the active
project is now Bnei Neviim Academy. Do not use the archived family-app bundle as
current product guidance.

Current state:

- The current local/Railway app entrypoint is `node server.js` from
  `package.json`.
- The live app uses Railway hosting plus production Postgres as the operations
  data source of truth. Supabase setup files from the family-app scaffold and
  early BNA experiments were archived under `docs/archive/`; do not run them
  against live BNA without a fresh migration audit.
- Free-text bot chat no longer depends on Anthropic. OpenAI API is the default
  Telegram reply engine; Kimi is fallback only for provider failures or legacy
  records.
- The old Next/Supabase family app tree was moved out of active source to
  `docs/archive/dormant-next-supabase-app/`. Treat it as historical reference
  only unless a future migration task deliberately restores part of it.
- Active Operations/dashboard work belongs in `public/operations.html` and the
  server APIs that feed it. The old React localStorage TaskApp prototype is now
  archived under `docs/archive/dormant-next-supabase-app/src/app/operations/`.
- The current BNA learning model is a home-based, integrative Torah learning
  program, currently framed around 10:00 to 1:00, with private coaching and
  parent partnership. It is not the old family-accountability app and not a
  standalone outsourced secular-curriculum platform.
- BNA no longer uses GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as
  active runtime. First-party BNA Operations owns contacts, communities,
  providers, parent/student portals, bot actions, tickets, decisions, and
  newsletters. External services are explicit connectors only.
- Active workspace task behavior lives in `server.js` plus
  `public/operations.html`. The visible task buckets are Decisions, Pending,
  and Tasks; Pending is only for human/external blockers. Codex/system work is
  tracked through agent jobs/status and must not be left as "pending for
  Codex."
- Rabbi Scheller's current app/Replit runtime is a source to audit and migrate
  from, not the canonical BNA runtime. Resend, Stripe/payment processors,
  Buffer, Whapi/WAPI, Vimeo, and domain/DNS tools are connectors only.
