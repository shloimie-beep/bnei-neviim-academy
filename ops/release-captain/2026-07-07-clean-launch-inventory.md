# Clean Launch Inventory - 2026-07-07

## Scope

Operator request: clean up, push, launch, and deploy everything.

Release rule used: ship only scoped, verified, non-secret, non-private,
non-external-write work. Park generated artifacts and blocked provider/account
work instead of sweeping them into Git.

## Current Release Base

- Branch: `master`
- Base commit before this cleanup batch: `ecf5178e`
- Previous deployed proof commit: `ecf5178e Record One Time helper live verification`
- Active run: `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation`
- Active run status at inventory: 6 done, 4 blocked, validation passing

## Worktree Classification

| Category | Count / files | Classification | Release decision |
|---|---:|---|---|
| Tracked safe code/test/docs batch | 8 code/test/task files | Scoped launchable work | Stage after tests/watchdogs pass. |
| Current clean-launch intake/PQC/proof files | 8 files | Required closeout proof | Stage. |
| `ops/chatgpt-ramble-dropoff/**` pickup artifacts | about 1,832 status entries | Generated pickup/drop-off artifacts | Do not stage wholesale; needs dedupe/retention policy. |
| `ops/watchdog-audits/**` generated artifacts | about 101 status entries | Generated watchdog proof | Stage only current scoped proof reports. |
| `ops/queue-audits/**` generated artifacts | about 27 status entries | Generated queue proof/readbacks | Park; not part of this release batch. |
| `ops/ui-audits/**` generated artifacts | about 9 status entries in git status grouping | Screenshot/proof artifacts from other lanes | Park unless tied to this release. |
| `ops/release-captain/latest-*` | 2 modified tracked files | Local generated latest pointers | Do not stage; latest files were produced by a previous blocked release-captain run. |
| Ledger/changelog | 2 modified tracked files with unrelated agent-fleet churn | Shared append-only history | Stage only narrow current closeout entries, not wholesale local churn. |

## Safe Batch Contents

- `public/operations.html`
  - Removes the visible `Archive test duplicate` Operations button and its
    frontend-only `archiveCodexTestParent` call path.
- `scripts/agent-fleet-supervisor.mjs`
  - Keeps explicit human-review / `agent_executable:false` work out of agent
    fleet auto-claiming.
  - Prevents broad note text from causing clean task titles to be retitled.
  - Adds a repair lane for overloaded broad-fix task titles.
- `tests/agent-fleet-hardening.test.js`
- `tests/task-title-cleanup-dry-run.test.js`
- `tests/watchdog-soft-repair.test.js`
- `tests/parent-student-portal-contract.test.js`
- `tasks-pending/2026-07-02-job101-review-triage-and-ui-system-corrections.md`
- `tasks-pending/2026-07-04-ship-pr87-onetime-ui-live-cleanup.md`

## Verification Run

- `npm run pqc:validate -- ops\prompt-packets\2026-07-07-clean-launch-everything\00-clean-launch-everything.product-quality.json`
  - Passed after schema/state/action/trace fixes.
- `node --check scripts\agent-fleet-supervisor.mjs`
  - Passed.
- `node --test tests\agent-fleet-hardening.test.js tests\task-title-cleanup-dry-run.test.js tests\watchdog-soft-repair.test.js tests\parent-student-portal-contract.test.js`
  - Passed: 57/57 tests.
- `npm run watchdog:actions`
  - Passed: 0 findings.
- `npm run watchdog:protocol-drift`
  - Passed.
- `npm run secrets:audit`
  - Passed: tracked secret audit found 0 tracked secret-risk files.
- `npm run bna:run:validate`
  - Passed: active run validates with 6 done and 4 blocked.
- `npm run watchdog:security`
  - Passed: 0 findings.

## Still Blocked / Parked

| Blocker | Owner | Next action | Consequence |
|---|---|---|---|
| One Time provider aliases for Zoom, Vimeo, Stripe, and Whapi/WAPI are missing. | Shloimie / account owner | Provide exact sandbox/live aliases and approved account setup packet. | Provider runtime setup remains blocked. |
| `join.onetimeonetime.com` separate Railway target is not available in current local Railway context. | Shloimie / Railway account owner | Configure/select the correct Railway target or provide deployment access. | Separate join-domain deployment cannot be claimed complete locally. |
| Drive/private transcript sync and Job101 source reprocessing need exact private-data approval. | Shloimie | Approve exact Drive sync/reprocess packet and scope. | Private transcript workflow remains blocked. |
| External sends/payments/DNS/access grants/provider writes. | Shloimie | Approve exact recipient/account/action packet before mutation. | Not performed in this launch batch. |
| Generated drop-off/watchdog/queue artifact flood. | Codex | Create a separate retention/dedupe/ignore cleanup packet. | Not staged wholesale; worktree remains locally dirty by design. |

## Deploy Gate

This batch changes `public/operations.html`, so deployment and live readback are
required after the commit is pushed before calling the app-visible part Done.

Result:

- Commit `af220573` was pushed to `origin/master`.
- Railway deployment `795f3f77-e4f1-4ff1-aaf9-0c54d3ae2e01` reached
  `SUCCESS`.
- Live readback proof:
  `ops/release-captain/2026-07-07-clean-launch-live-smoke.md`.
- `/operations` returned `401`, preserving the protected route.
- `/operations.html` returned `200` and did not contain `Archive test
  duplicate` or `archiveCodexTestParent`.
