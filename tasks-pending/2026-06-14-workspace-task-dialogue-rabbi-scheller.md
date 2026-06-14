# Workspace Task Dialogue / Rabbi Scheller Handoff

Date: 2026-06-14

Branch: `cleanup/workspace-task-dialogue-rabbi-scheller`

## Objective

Finish and deploy the Operations workspace task cleanup:

- Decisions, Pending, Tasks are the primary human-facing buckets.
- Pending means human/external blocker only.
- Codex/system work uses agent jobs/status and must not sit as Pending.
- Task comments are shared workspace dialogue by default.
- Rabbi Scheller / One Time launch tasks, decisions, access blockers, and
  2-4 week timeline are seeded idempotently.
- Task Calendar shows month, week, and selected-day views with Hebrew dates.

## Safety Snapshot

- Safety branch: `safety/pre-workspace-task-system-20260614`
- Safety commit: `75d2b36 chore: safety snapshot before workspace task cleanup`
- Working branch: `cleanup/workspace-task-dialogue-rabbi-scheller`

## Implemented Locally

- Updated Operations Tasks to use `Decisions`, `Pending`, `Tasks`, `Calendar`,
  `Done`, and `Activity`.
- Added signal filters including Needs Shloimie, Needs Rabbi, External, Agent
  Working, Due Today, Due This Week, Stale, and Done.
- Added a clean task detail sheet with Decision / Action, Summary, Details,
  Original Capture, Comments / Internal Dialogue, and Activity sections.
- Kept comment posting as shared workspace dialogue by default
  (`visibility: workspace`, `requeue: false`).
- Changed comment requeue behavior so agent work is spawned only from an
  explicit requeue request.
- Added task Calendar month/week/selected-day views with Hebrew date labels via
  `Intl.DateTimeFormat('en-u-ca-hebrew')` and responsive mobile constraints.
- Verified no stale old lane strings in the active Operations task UI.
- Added/updated focused regression coverage for comments, no-stale agent rules,
  primary buckets, and Hebrew calendar rendering.
- Added `docs/rabbi-scheller-app-audit.md` as the Replit/source audit template.

## Server Behavior Already Present On This Branch

- `bna_agent_jobs` and task workflow fields are part of the idempotent server
  bootstrap path.
- `GET /api/bna/tasks` supports workspace/project, bucket, owner/waiting,
  agent-status, date, stale, and search filters.
- `POST /api/bna/tasks` and task action endpoints normalize decisions,
  human/external pending blockers, and agent-executable tasks.
- Rabbi Scheller launch seed/backfill is idempotent through the One Time project
  startup path and dedupes by project/workspace and title/seed metadata.

## Final Verification

- PASS `node --check server.js`
- PASS Operations inline script extraction/parse
- PASS targeted task regression suite:
  `node --test tests\workspace-task-no-stale-agent.test.js tests\operations-task-comments-and-dictation.test.js tests\telegram-ramble-routing-regression.test.js`
- PASS full `npm test` 315/315
- PASS local task API readback:
  - Rabbi project records: 96
  - pending waiting on Rabbi Elie Scheller: 8
  - queued agent jobs: 4
- PASS local mobile Playwright smoke at 390x844:
  `ops/playwright-smokes/2026-06-14-workspace-task-system-local/2026-06-14T07-48-14-549Z-report.md`
- PASS Kimi live API smoke through `scripts/kimi-chat.mjs`:
  `KIMI_OK workspace-task-smoke`
- PASS hosted AI sidekick smoke with `BNA_AI_PRIMARY_PROVIDER=kimi`:
  `ops/openai-smokes/2026-06-14T07-54-18-768Z-openai-sidekick-smoke.md`
- PASS Railway deployment `954411df-9a0a-4892-820e-28ebbdb9c85c`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T07-56-50-529Z-live-app-smoke.md`
- PASS live task API readback:
  - Rabbi project records: 96
  - pending waiting on Rabbi Elie Scheller: 8
  - decisions in Rabbi project: 18
  - queued agent jobs: 0
  - completed agent cleanup jobs: 4
- PASS live mobile Playwright smoke at 390x844:
  `ops/playwright-smokes/2026-06-14-workspace-task-system-live/2026-06-14T07-58-30-461Z-report.md`

## Provider Note

The operator explicitly approved using Kimi for now. Kimi-backed hosted AI smoke
passes. The separate OpenAI credential blocker remains recorded: the selected
OpenAI key fingerprint matches local/Railway selection but OpenAI returns
`401 invalid_api_key`.
