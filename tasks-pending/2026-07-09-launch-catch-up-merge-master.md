# Launch Catch-Up, Merge Master, Deploy Everything

## Raw intake

Source: `RAW-20260709-009`

Shloimie asked to catch the whole launch state up, merge to `master`, deploy,
and explain the remaining errors/blockers instead of leaving work scattered.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260709-009 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-09-launch-catch-up-merge-master.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Catch the launch state up: register the deployment/merge request, audit what is ahead of master and what is live, merge/push/deploy the safe scoped work to master where release gates allow, and leave exact blockers for any remaining errors. |
| Goal tool used | yes |
| Execution directive | Register first, then verify, fast-forward master if safe, deploy/live-smoke, and record exact remaining blockers. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-041 | Preserve the merge/deploy catch-up request and create a launch catch-up register. | RAW-20260709-009 | agent_ops | Codex | intake | P0 | 0 | none | Raw file, memory note, register, ledger/changelog closeout exist. | raw-input, memory, tasks-pending, ops ledgers | no | In progress |
| REQ-20260709-042 | Audit branch/master delta before merge. | RAW-20260709-009 | repo | Codex | release-audit | P0 | 1 | REQ-20260709-041 | Current branch, ahead/behind count, open PR state, and representative commit scope are recorded. | git/GitHub readbacks | no | Done |
| REQ-20260709-043 | Run release gates/tests before master catch-up. | RAW-20260709-009 | repo | Codex | verification | P0 | 1 | REQ-20260709-042 | Relevant tests, release gate, action/protocol/secrets checks pass or exact blocker is recorded. | test/watchdog outputs | no | Done |
| REQ-20260709-044 | Fast-forward or otherwise safely merge launch branch to `master`. | RAW-20260709-009 | repo | Codex | git-release | P0 | 2 | REQ-20260709-043 | `master` contains the launch branch commits and is pushed, without force-merging unrelated dirty work. | git | yes if deploy follows | Pending |
| REQ-20260709-045 | Deploy caught-up `master` through the correct guarded release path. | RAW-20260709-009 | BNA + OneTime | Codex | deployment | P0 | 3 | REQ-20260709-044 | Deploy target guard identifies the intended app/service before mutation; deployment reaches SUCCESS; live smokes pass. | Railway/release scripts | yes | Pending |
| REQ-20260709-046 | Summarize remaining errors/blockers precisely. | RAW-20260709-009 | BNA + OneTime + agent_ops | Codex | closeout | P0 | 4 | REQ-20260709-045 | Final status names what is live, what is not, which errors remain, owner, and next action. | register, ledger, changelog | no | Pending |

## Current readback

- Start branch: `codex/rabbi-helper-tool-scope-20260708`.
- Initial status: clean and pushed.
- Initial delta: `origin/master...HEAD` reports `0 behind / 69 ahead`.
- Open PRs: none from `gh pr list`.
- Active execution run still has 8 done and 2 blocked, both full-launch setup blockers, not immediate OneTime lead capture blockers.
- Pre-merge verification found stale action report hashes after the OneTime lead-capture/action-registry change. Regenerated `ops/action-registry/one-time-action-coverage.*` and `ops/action-registry/universal-action-parity.*`.
- Pre-merge release gates passed:
  - `node --test tests/watchdog-action-registry.test.js`: 5/5 pass.
  - `npm test`: 1691/1691 pass.
  - `npm run secrets:audit`: 7390 tracked paths, 0 tracked secret-risk files.
  - `npm run watchdog:actions`: ok, 0 findings.
  - `npm run watchdog:protocol-drift`: 0 findings.
  - `npm run bna:run:validate`: validation passed; active run remains 8 done / 2 blocked.
  - `git diff --check`: no whitespace errors, line-ending warnings only.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260709-041 | In progress | Raw/register created. | raw-input/RAW-20260709-009-launch-catch-up-merge-master.md; memory/2026-07-09.md; this file | Pending ledger/changelog closeout after deploy proof. | None |
| REQ-20260709-042 | Done | Branch was `codex/rabbi-helper-tool-scope-20260708`, clean/pushed before intake, no open PRs, `origin/master...HEAD` reported `0 behind / 69 ahead`. | git readbacks | `git branch --show-current`; `git rev-list --left-right --count origin/master...HEAD`; `gh pr list --state open`. | None |
| REQ-20260709-043 | Done | Stale action report hashes were corrected and all release gates passed. | ops/action-registry/one-time-action-coverage.json; ops/action-registry/one-time-action-coverage.md; ops/action-registry/universal-action-parity.json; ops/action-registry/universal-action-parity.md; ops/watchdog-audits/2026-07-09-product-quality-drift.md; ops/watchdog-audits/2026-07-09-product-quality-drift.json | `node --test tests/watchdog-action-registry.test.js`; `npm test`; `npm run secrets:audit`; `npm run watchdog:actions`; `npm run watchdog:protocol-drift`; `npm run bna:run:validate`; `git diff --check`. | None |
