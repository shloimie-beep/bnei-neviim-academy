# Operations Workflows, Lanes, Calendar, And Task Routing

Cycle ID: `2026-06-16-ramble-router-parallel-chatgpt-to-codex`

Status: `completed_local_verification_live_followup_required`

What is done:

- Reconciled OPS-02 against the active Express/static Operations surface:
  `server.js` and `public/operations.html`.
- Added visible decision-comment workflow feedback in Operations and preserved
  default meaningful-comment reprocess behavior while allowing explicit
  no-reprocess comments to stay in `comment_added`.
- Modeled Rabbi Scheller's 7pm Mishnayos class as a first-class provider
  schedule object in the scoped provider calendar instead of a placeholder row.
- Verified generic signups remain in BNA enrollment/contact lanes while
  Service Providers shows provider-specific leads only.
- Refreshed stale contract tests for the current `community` Operations view
  and broader student roster loading.
- Added the shared in-app select enhancer to `public/one-time/index.html` so
  all public pages with native selects share the same dropdown behavior.

What remains:

- Deploy the verified local bundle, run Railway doctor/live Operations smoke,
  and only then mark app-visible/dashboard-visible OPS-02 work done.
- Perform any queue/data cleanup only after an approved safe DB plan. The local
  audit is read-only and intentionally did not archive, merge, delete, send,
  bill, grant access, or write external integrations.
- SDDraftler and Menachem identity/category questions stay review-only until
  evidence or explicit operator approval exists.

Files touched:

- `TASKS.md`
- `memory/2026-06-16.md`
- `public/operations.html`
- `public/one-time/index.html`
- `server.js`
- `tests/ops-02-workflow-correctness.test.js`
- `tests/google-workspace-settings-contract.test.js`
- `tests/one-time-external-user-portal.test.js`
- `tests/operations-people-filter.test.js`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- `ops/playwright-smokes/2026-06-16-ops-02-local/**`
- `ops/queue-audits/2026-06-16T12-42-41-531Z-queue-audit.*`

Proof paths:

- `ops/proofs/2026-06-16-ramble-router-parallel-closeout/OPS-02/`
- `ops/playwright-smokes/2026-06-16-ops-02-local/report.md`
- `ops/playwright-smokes/2026-06-16-ops-02-local/summary.json`
- `ops/playwright-smokes/2026-06-16-ops-02-local/browser-dom-checks.json`
- `ops/queue-audits/2026-06-16T12-42-41-531Z-queue-audit.md`
- `ops/queue-audits/2026-06-16T12-42-41-531Z-queue-audit.json`

Verification:

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- `node --check scripts/agent-fleet-supervisor.mjs`
- `node --check scripts/ops-queue-audit.mjs`
- Operations inline script parse: 2 inline scripts parsed.
- Focused OPS-02/decision/pending/queue tests: 16/16 passing.
- Focused refreshed contract tests passed.
- `npm run ops:audit-queue` passed read-only.
- `npm test` passed: 634/634.
- Browser/Playwright smoke captured desktop and mobile screenshots with zero
  console errors and no horizontal overflow on checked views.

Queue audit counts:

- active_fresh: 11
- active_stale: 118
- blocked: 19
- pending_shloimie: 23
- pending_external: 76
- completed_verified: 310
- done_missing_report: 25
- duplicate: 230
- abandoned_unknown: 57
- do_not_redo: 550

Blockers:

- Accumulated Railway deployment
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667` later reached `SUCCESS`; Railway
  doctor and live smoke coverage passed.
- Queue cleanup choices that mutate visible task status or archive duplicates
  still require safe DB/readback planning and approval.

needed_from_shloimie:

- Approve any queue cleanup decisions that affect visible task status,
  duplicate handling, identity/category merges, or Done proof history.

Safe next step:

- Decide which read-only audit buckets are safe to clean or reclassify, then
  run the cleanup with live DB readback and changelog/ledger proof.
