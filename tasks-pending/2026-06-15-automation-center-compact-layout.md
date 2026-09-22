# WS07 Automation Center Compact Layout

Status: local implementation verified; live deployment/readback blocked.

## What Changed

- Added the first-party automation registry schema in `server.js`:
  - `bna_automations`
  - `bna_automation_runs`
  - default BNA and One Time automation registry seeds
  - startup `seedDefaultAutomations()`
- Added repeatable migration SQL:
  - `railway-migration-2026-06-15-automation-center.sql`
- Added protected Operations APIs:
  - `GET /api/bna/automations`
  - `GET /api/bna/automations/:id`
  - `PATCH /api/bna/automations/:id`
- Added scoped access behavior:
  - project-scoped Operations users can read their project automation metadata
  - project-scoped users cannot patch automation registry metadata
- Added a first-class Operations `Automations` view in
  `public/operations.html`, separate from Settings > Automation Library.
- The compact UI includes filters, dense registry rows, setup blocker counts,
  owners, package/service/workspace fields, status/type, recent runs, related
  tasks, and safe metadata edits.
- No live run, enable, publish, send, billing/access, Google, Buffer, WAPI, or
  external connector execution controls were added.

## Verification Completed

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS Operations inline-script compile for `public/operations.html`
- PASS `node --test tests/operations-automation-center.test.js tests/operations-automation-library.test.js`
- PASS full `npm test` 587/587
- PASS local in-app browser smoke reached
  `http://127.0.0.1:8097/operations?view=automations&workspace=platform&section=center`
  and confirmed the protected Automation Center shell, filter row, clean empty
  state, and no browser console errors.

## Blocker

Live registry data readback and deployment were not completed because the
configured database host did not resolve locally:

`getaddrinfo ENOTFOUND db.amipeuneopdbzuhlnimt.supabase.co`

The local browser smoke reached the view, but the automation API load could not
complete against live data from this machine.

## Next Steps

1. Apply or confirm the Railway migration
   `railway-migration-2026-06-15-automation-center.sql`.
2. Restart/deploy the app so `seedDefaultAutomations()` runs against the live
   database.
3. Verify `GET /api/bna/automations` returns seeded registry rows for platform
   admin and project-scoped users.
4. Run Railway doctor and live app smoke.
5. Mark WS07 done only after deployed Operations shows non-empty registry
   readback or an intentionally empty live registry decision is documented.
