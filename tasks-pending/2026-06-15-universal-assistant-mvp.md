# Universal Assistant MVP - Completed 2026-06-15

Source: Codex implementation request for the Universal Assistant MVP inside the
existing Express/Postgres BNA app.

## Status

Completed, verified, and deployed.

Railway deployment:
`40db38b4-65c6-4a2e-95ba-3e9543e7c5fe`

## Scope Shipped

- Added an idempotent startup migration for the Universal Assistant MVP data
  model while preserving existing legacy tables.
- Added workspace, person, household/member, provider-profile item, student
  goal, assistant memory, assistant action, class-material, assistant-thread,
  assistant-message, and ticket compatibility fields.
- Backfilled workspaces, persons, and student goals from current first-party BNA
  records where safe.
- Added safe signup parent/household backfills, internal super-admin workspace
  seed data, and an environment-based Operations super-admin person seed.
- Added `bna_assistant_memories` and `bna_assistant_action_runs` as first-class
  assistant memory/action-run rows while keeping the existing assistant action
  record path.
- Backfilled active machine-assigned Tasks into observable `bna_agent_jobs`
  without relying on a partial-index conflict target.
- Added assistant actor/context resolution for operations, parent, student, and
  service-provider use cases.
- Added a local tool registry for creating tickets/tasks, updating first-party
  person/household/student/provider/class/content rows, showing access/payment
  status, and showing Codex/agent status.
- Added universal action aliases for Codex jobs, student goals/check-ins,
  content links, classes, worksheets/media URLs, access status, and payment
  status.
- Added permission checks so students can only act on their own context, parents
  can only act on matching student/household context, providers can only act on
  their own provider profile, and Codex/system actions remain admin-only.
- Added assistant routes for Operations, public setup intake, and the student
  portal.
- Added Operations support UI, student portal assistant UI, the setup assistant
  page, and compact English/Hebrew signup assistant widgets.

## Routes

- `POST /api/bna/assistant/message`
- `POST /api/assistant/message`
- `GET /api/bna/agent-status`
- `GET /api/bna/assistant/agent-status`
- `GET /api/bna/assistant/actions/:id`
- `POST /api/student-portal/assistant/message`

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/universal-assistant-mvp.test.js`
- PASS `node --test tests/universal-assistant-contract.test.js tests/app-select-dropdown.test.js tests/universal-assistant-mvp.test.js`
- PASS `node --test tests/identity-linking.test.js tests/parent-student-portal-contract.test.js`
- PASS `npm test` 514/514
- PASS local startup smoke after fixing the `bna_agent_jobs` partial-index
  `ON CONFLICT (job_uid)` migration issue.
- PASS local browser smoke for `/signup.html`, `/signup-he.html`,
  `/student.html`, and authenticated `/operations?view=admin&section=tickets`
  assistant surfaces with zero console errors.
- PASS `git diff --check` with only existing line-ending warnings.
- PASS `npm run agent:fleet:status`.
- PASS Railway deployment
  `40db38b4-65c6-4a2e-95ba-3e9543e7c5fe`.
- PASS Railway doctor after deploy.
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T10-42-45-867Z-live-app-smoke.md`
- PASS live direct page checks for `/assistant-setup.html`, `/signup.html`,
  `/signup-he.html`, `/student.html`, and `/operations.html`.
- PASS live guarded route checks:
  - anonymous `GET /api/bna/agent-status` returned 403.
  - anonymous `GET /api/bna/assistant/actions/1` returned 404/403-safe.
  - empty public `POST /api/assistant/message` returned 400.
  - unauthenticated `POST /api/student-portal/assistant/message` returned 401.

## Guardrails

- No external CRM/GHL runtime, WhatsApp send, email send, Buffer/social action,
  checkout/billing action, Google Classroom/Drive write, Zoom/Vimeo write, or
  Rabbi live-site action was added or performed.
- The setup assistant creates/supports first-party intake/ticket behavior only.
- Student portal assistant requests do not store raw access codes.
- Non-admin assistant users cannot invoke Codex/system actions.

## Remaining Follow-Up

- Richer natural-language parsing can be added later; the MVP intentionally uses
  conservative local planners and first-party writes.
- Agent fleet status reported the supervisor was not running; observable jobs
  and ready-to-claim counts were visible, but supervisor uptime is an operations
  follow-up rather than an assistant schema blocker.
- Any real parent/provider/student rollout copy and escalation policy still
  needs operator review before broad use.
