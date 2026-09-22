# WS11 Gamification, Community, and Parent Progress

## Status

Implementation, production migration, and targeted live privacy/readback are
complete. A 2026-06-16 follow-up found that the WS11 schema SQL existed but was
not wired into the startup migration path; that gap was patched, deployed, and
verified on Railway production deployment
`7c8c7010-497c-41c7-a127-6370cca049eb`.

## Implemented

- Added additive WS11 tables in the Express compatibility bootstrap for courses,
  lessons, worksheets, worksheet questions/submissions/answers, badges,
  gamification events, student badges, approved student references, explicit
  parent-student links, and parent progress reports.
- Seeded the One Time Mishnah learning community and default `Mishnah
  Foundations` course/badges through `ensureWs11CommunityFoundation`.
- Added backend helpers in `src/lib/bna/gamification.js` and
  `src/lib/bna/parent-progress.js` for event normalization, point summaries,
  idempotency keys, parent-safe row filtering, and parent access checks.
- Added admin APIs under `/api/bna/*` for courses, lessons, worksheets,
  gamification events/backfill, shoutouts, parent-student links, and
  parent-progress report generation/approval.
- Added student APIs for asking Mishnah questions and submitting worksheets;
  both create first-party records and award gamification events.
- Added a parent-scoped WS11 progress endpoint that requires an authenticated
  parent session, explicit parent-student link access, and generic 404 behavior
  when a student is not linked to that parent.
- Added WS11 data into student and parent portal payloads. Parent-facing WS11
  data is filtered to approved, parent-visible rows only.
- Added student portal community rendering for points, badges, courses,
  shoutouts, worksheet progress, and a Mishnah question form.
- Added Operations student-detail controls for backfilling participation,
  generating parent reports, adding approved shoutouts, and linking a parent.

## Files

- `server.js`
- `public/student.html`
- `public/operations.html`
- `src/lib/bna/gamification.js`
- `src/lib/bna/parent-progress.js`
- `tests/gamification-events.test.js`
- `tests/parent-progress-privacy.test.js`
- `tests/ws11-community-model-contract.test.js`
- `scripts/smoke-ws11-parent-progress-live.mjs`
- `package.json`

## Verification

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/gamification.js`
- PASS `node --check src/lib/bna/parent-progress.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/gamification-events.test.js tests/parent-progress-privacy.test.js tests/ws11-community-model-contract.test.js` 12/12
- PASS focused WS11 startup/migration regression:
  `node --test tests/ws11-community-model-contract.test.js`
- PASS full `npm test` 621/621 after startup migration patch
- PASS Railway doctor before/after deployment
- PASS Railway deployment `7c8c7010-497c-41c7-a127-6370cca049eb` reached
  `SUCCESS`
- PASS main live app smoke:
  `ops/live-smokes/2026-06-16T11-01-05-357Z-live-app-smoke.md`
- PASS public privacy smoke:
  `ops/live-smokes/2026-06-16T11-01-21-841Z-public-route-privacy-smoke.md`
- PASS student-auth smoke:
  `ops/live-smokes/2026-06-16T11-01-04-242Z-student-auth-policy-live-smoke.md`
- PASS targeted WS11 parent-progress live smoke:
  `ops/live-smokes/2026-06-16T11-00-29-396Z-ws11-parent-progress-live-smoke.md`
  It read back live WS11 tables and seed rows, created a temporary synthetic
  parent link/session plus temporary hidden rows, verified the parent WS11 API
  returned only approved parent-visible rows, and cleaned up the temporary
  rows.
- PASS `git diff --check` with line-ending warnings only

## Remaining

- Add a usable local `DATABASE_URL` only if local laptop doctor/smoke must run
  against a local DB instead of the Railway secret path.
- Decide later whether to expose a public/community leaderboard. The current
  implementation intentionally avoids public leaderboards and public shame.

## Guardrails

- No GHL, LeadConnector, external CRM, payment, email, WhatsApp/WAPI, Buffer,
  Google, or connector write was added or executed.
- Parent progress is explicit-link based and approval-gated.
- Student questions are first-party records; they do not auto-publish to a
  public forum.
