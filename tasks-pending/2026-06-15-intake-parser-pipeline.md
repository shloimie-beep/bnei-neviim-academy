# Canonical BNA Intake Parser Pipeline

Status: deployed and verified on 2026-06-15.

## What Shipped

- Added canonical intake parsing modules:
  - `src/lib/bna/intake-parser.js`
  - `src/lib/bna/person-resolution.js`
  - `src/lib/bna/section-registry.js`
  - `src/lib/bna/task-shaping.js`
- Added additive schema bootstrapping in `server.js` for:
  - `bna_people` compatibility fields
  - `bna_person_aliases`
  - `bna_person_relationships`
  - `bna_intake_parse_runs`
  - `bna_intake_parse_items`
  - `bna_section_definitions`
  - `bna_section_records`
  - `bna_parse_review_queue`
  - `bna_tasks.what`, `bna_tasks.why`, and `bna_tasks.owner_person_id`
- Seeded system sections for goals, diet, attendance, assignments, behavior,
  Torah learning, chores, screen time, medical notes, parent questions,
  provider leads, class notes, content items, tasks, decisions, and tickets.
- Added safe backfills from existing students/signups into people, aliases,
  relationships, merge-review items, and safe accountability section records.
- Added canonical admin APIs:
  - `POST /api/bna/intake/parse`
  - `GET /api/bna/intake/parse-runs`
  - `GET /api/bna/intake/parse-runs/:id`
  - `POST /api/bna/intake/parse-runs/:id/apply`
  - `GET /api/bna/intake/review`
  - `POST /api/bna/intake/review/:id/resolve`
  - `GET/POST/PATCH /api/bna/intake/sections`
  - `GET/POST/PATCH /api/bna/sections`
- Routed task rambles, mixed recordings, `tasks_from_recording`, and Telegram
  scoped task capture through the canonical parser path with backward-compatible
  response shapes.
- Added Operations `Intake Review` with Parse Runs, Review Queue, Sections,
  manual parse entry, item grouping, apply/ignore/resolve actions, and mixed
  recording links to parse-run detail.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --check src/lib/bna/intake-parser.js`
- PASS `node --test tests/intake-parser.test.js` 9/9
- PASS focused regressions:
  - `tests/google-workspace-settings-contract.test.js`
  - `tests/one-time-external-user-portal.test.js`
  - `tests/rabbi-task-dialogue.test.js`
- PASS `npm test` 523/523
- BLOCKED `npm run smoke:local -- --skip-tests` because `.env.local` is missing
  a useful `DATABASE_URL`; no secret was copied or created.
- PASS Railway deployment `6bbe418a-e429-43bc-8c44-3d4f90ad584b`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T11-27-37-735Z-live-app-smoke.md`
- PASS live Browser check for `/operations?view=intake&section=runs` showing
  Parse Runs, Review Queue, Sections, and Parse Intake.
- PASS live read-only endpoint probe for:
  - `/api/bna/intake/parse-runs?limit=5`
  - `/api/bna/intake/review?status=open`
  - `/api/bna/sections?status=all`

## Guardrails Preserved

- No real Google Classroom auth/API writes were implemented or performed.
- Google Classroom requests become future backlog tickets only.
- No Google Auth expansion, device controls, Vimeo upload, external CRM/GHL
  runtime, WhatsApp/email send, Buffer/social publish, checkout/billing action,
  member-library action, or Rabbi live-site change was added or performed.
- Parser-created custom sections and ambiguous people default to review.
- Raw rambles are provenance/source excerpts only, not visible task titles.

## Remaining Follow-Up

- Local smoke needs a real `DATABASE_URL` in `.env.local` or the keyholder flow;
  leave this alone unless the operator explicitly asks to install/copy a secret.
- The first-pass review UI can approve, file, ignore, and resolve items, but
  richer person merge/link workflows should be deepened once real review rows
  accumulate.
- Custom section schemas are intentionally conservative; future work can add
  better field editing and section-specific renderers after operators see the
  proposed sections in practice.
