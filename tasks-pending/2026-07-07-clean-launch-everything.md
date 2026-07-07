# Clean Launch Everything - 2026-07-07

## Source

- Raw input: `raw-input/RAW-20260707-014-clean-launch-everything.md`
- Product Quality packet: `ops/prompt-packets/2026-07-07-clean-launch-everything/00-clean-launch-everything.product-quality.json`
- Active execution run: `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation`

## Parsed Requirements

| ID | Requirement | Workspace/project | Owner | Priority | Batch | Acceptance criteria | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|
| REQ-20260707-140 | Capture the clean/push/deploy-everything request as raw intake, register, and Product Quality packet. | platform | Codex | P0 | 0 | Raw file, register, and PQC packet exist and validate. | no | Done |
| REQ-20260707-141 | Inventory the dirty worktree and classify each changed/untracked category before staging. | platform | Codex | P0 | 1 | Tracked dirty files, untracked artifact groups, current branch, pushed state, and active execution-run blockers are recorded. | no | Done |
| REQ-20260707-142 | Commit and push only safe, verified, scoped work. | platform | Codex | P0 | 2 | No secrets, raw private data, unrelated dirty changes, external sends, payments, DNS writes, or unverified generated junk are staged. | maybe | Done |
| REQ-20260707-143 | Deploy and live-smoke app-visible committed work. | platform + one_time_mishnah_class | Codex | P0 | 3 | Railway deployment reaches terminal success and affected live routes pass smoke/readback. | yes | Done |
| REQ-20260707-144 | Clean up or explicitly park generated artifacts that are not safe to push wholesale. | platform | Codex | P1 | 4 | Repetitive pickup/watchdog/queue artifacts are summarized, ignored, staged, or blocked with rationale; no destructive deletion of user work. | no | Blocked |
| REQ-20260707-145 | Preserve exact blockers for anything that cannot be launched safely now. | platform + one_time_mishnah_class | Codex | P0 | 5 | External/account-owner/provider/credential/private-data blockers name owner, missing info, recommended next action, and consequence. | no | Done |

## Guardrails

- Do not blindly `git add .`.
- Do not delete or revert user/agent dirty work to make the tree look clean.
- Do not commit secrets, raw private message bodies, contact exports, passwords,
  raw student/parent records, or private screenshots.
- Do not perform payment, DNS, external send, WhatsApp, email, credential,
  access-grant, Drive upload, Vimeo upload, Stripe, or provider mutations unless
  an exact approved packet exists.
- A deployment is not Done until the deployment reaches success and relevant
  live smoke/readback passes, or the blocker is explicit.

## Initial Findings

- Active goal created in Codex for this release-cleanup run.
- Active execution run `2026-07-02-background-drive-ui-launch-continuation`
  validates but still has work remaining: 6 done, 4 blocked.
- Current branch is `master`.
- Last pushed proof commits before this cleanup request:
  - `7ef3aebf` One Time public helper branding
  - `ecf5178e` One Time helper live verification

## Worktree Classification

| Category | Status | Evidence | Decision |
|---|---|---|---|
| Tracked dirty files | Inspected | `git status --short --untracked-files=no`; `git diff --stat -- public/operations.html scripts/agent-fleet-supervisor.mjs tests/*.test.js tasks-pending/2026-07-02-job101-review-triage-and-ui-system-corrections.md tasks-pending/2026-07-04-ship-pr87-onetime-ui-live-cleanup.md` | Stage scoped verified batch only. |
| Untracked ChatGPT pickup artifacts | Parked | About 1,832 status entries under `ops/chatgpt-ramble-dropoff/**` | Do not stage wholesale until deduped/validated. |
| Untracked queue/watchdog/audit artifacts | Partially staged | About 101 watchdog, 27 queue, and 9 UI audit status-group entries | Stage only current watchdog proof reports tied to this release; park the rest. |
| Release captain reports | Parked | `ops/release-captain/latest-release-captain.json`; `ops/release-captain/latest-release-captain.md` | Leave as local generated output from previous blocked run; stage only `2026-07-07-clean-launch-inventory.*`. |

## Local Verification

- `npm run pqc:validate -- ops\prompt-packets\2026-07-07-clean-launch-everything\00-clean-launch-everything.product-quality.json`
  - Passed after packet schema/state/action/trace fixes.
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
  - Passed: active execution run validates with 6 done and 4 blocked.
- `npm run watchdog:security`
  - Passed: 0 findings.

## Blocker Table

| ID | Blocker | Owner | Recommended next action | Consequence |
|---|---|---|---|---|
| BLK-20260707-140 | One Time provider aliases for Zoom, Vimeo, Stripe, and Whapi/WAPI are missing. | Shloimie / account owner | Provide exact sandbox/live aliases and approved setup packet. | Provider runtime setup remains blocked. |
| BLK-20260707-141 | `join.onetimeonetime.com` separate Railway target is not available in this local Railway context. | Shloimie / Railway account owner | Configure/select the correct Railway target or provide deployment access. | Separate join-domain deployment cannot be claimed complete locally. |
| BLK-20260707-142 | Drive/private transcript sync and Job101 source reprocessing need exact private-data approval. | Shloimie | Approve exact Drive sync/reprocess packet and scope. | Private transcript workflow remains blocked. |
| BLK-20260707-143 | External sends/payments/DNS/access grants/provider writes are not approved by this broad launch request. | Shloimie | Approve exact recipient/account/action packet before mutation. | Not performed in this launch batch. |
| BLK-20260707-144 | Generated drop-off/watchdog/queue artifact flood is not safe to commit wholesale. | Codex | Create a separate retention/dedupe/ignore cleanup packet. | Worktree remains locally dirty by design. |

## Final Audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260707-140 | Done | `raw-input/RAW-20260707-014-clean-launch-everything.md`; this register; `ops/prompt-packets/2026-07-07-clean-launch-everything/00-clean-launch-everything.product-quality.json` | `npm run pqc:validate -- ops\prompt-packets\2026-07-07-clean-launch-everything\00-clean-launch-everything.product-quality.json` passed. | None. |
| REQ-20260707-141 | Done | `ops/release-captain/2026-07-07-clean-launch-inventory.md`; `ops/release-captain/2026-07-07-clean-launch-inventory.json` | Dirty categories classified; active run blockers recorded. | None. |
| REQ-20260707-142 | Done | Commit `af220573`; pushed to `origin/master`. | `git diff --cached --check` passed before commit; `npm run secrets:audit` passed after staging. | None. |
| REQ-20260707-143 | Done | Railway deployment `795f3f77-e4f1-4ff1-aaf9-0c54d3ae2e01`; `ops/release-captain/2026-07-07-clean-launch-live-smoke.md`. | Deployment reached `SUCCESS`; live readback passed for `/operations` protection and `/operations.html` stale action removal. | None. |
| REQ-20260707-144 | Blocked | Artifact categories recorded in inventory. | Manual classification performed. | Needs separate retention/dedupe/ignore cleanup packet; not safe for this broad push. |
| REQ-20260707-145 | Done | Blocker table in this register and inventory. | Active execution-run validation passed with known blockers. | Blockers remain until account-owner/provider/private-data decisions happen. |
