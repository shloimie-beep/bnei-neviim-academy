# Ramble Intake - 2026-07-05 - Repo Release Workflow And Drive Email

## Raw intake

Shloimie asked for a plain-English release/status audit, the next step for
making repo push/merge/deploy flow reliable, and a repair so Rabbi Drive
PowerPoint/source-material uploads trigger email reminders to
`sdratler@gmail.com`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-010 |
| Source | codex_chat |
| Parse status | registered |
| Raw record | `raw-input/RAW-20260705-010-repo-release-workflow-and-drive-email.md` |
| Branch | `codex/drive-dropoff-scheduler-repair-canonical-20260705` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260705-601 | State the current release truth in plain English. | RAW-20260705-010 | bna_platform / release_closeout | Codex | release_audit | P0 | B0 | Answer separates live/pushed/merged/deployed work from remaining blockers. | Done |
| REQ-20260705-602 | Audit the repo hygiene state that affects future ramble-to-ship flow. | RAW-20260705-010 | bna_platform / github_hygiene | Codex | repo_audit | P0 | B0 | Check branch, worktree, recent PRs, stale open PRs, and active execution run status. | Done |
| REQ-20260705-603 | Verify the Rabbi Drive drop-off notifier recipient and no-send dry-run state. | RAW-20260705-010 | rabbi_sheller_provider / one_time_mishnah_class | Codex | drive_email | P0 | B1 | Dry run checks approved folders, confirms recipient path can be supplied as `sdratler@gmail.com`, and sends no email. | Done |
| REQ-20260705-604 | Repair the Windows scheduled task so future Rabbi Drive uploads run the canonical notifier from this checkout. | RAW-20260705-010 | rabbi_sheller_provider / one_time_mishnah_class | Codex | scheduler_repair | P0 | B1 | Scheduled task action points to `run-one-time-drive-dropoff-notifier.vbs`, uses `sdratler@gmail.com`, and last run exits `0`. | Done |
| REQ-20260705-605 | Publish the scheduler registration hardening so future re-registration works from a path with spaces. | RAW-20260705-010 | bna_platform / release_closeout | Codex | publish | P0 | B2 | Focused tests pass; branch is committed and pushed; PR is opened or exact blocker recorded. | Done; PR #100 merged |
| REQ-20260705-606 | Clean stale dirty draft PRs without broad-merging them. | RAW-20260705-010 | bna_platform / github_hygiene | Codex | pr_cleanup | P1 | B3 | PR #51, #62, and #63 are audited for close/extract/ignore, then closed or superseded when safe. | Done; PRs #51/#62/#63 closed unmerged |
| REQ-20260705-607 | Repair/re-verify the active agent-fleet/execution-run blockers. | RAW-20260705-010 | bna_platform / agent_ops | Codex | workflow_hardening | P1 | B3 | `npm run agent:fleet:status`, readiness, and active run blockers are reconciled from canonical branch state. | Done for readiness; runtime supervisor/watchdog local action remains |
| REQ-20260705-608 | Finish logged-in One Time Operations visual cleanup only with valid auth-backed proof. | RAW-20260705-010 | rabbi_sheller_provider / one_time_mishnah_class | Codex | ui_quality | P1 | B4 | Valid session/credentials allow screenshot-backed dashboard/sidebar/right-rail audit and any scoped UI repair. | Blocked follow-up - needs valid Operations credentials/session |

## Evidence

| Check | Status | Evidence |
|---|---|---|
| One Time public release truth | Passed | PR #99 merged to `master` at `e666ddcc13ea0a4a119717cef8a97c6d54239afe`; Railway One Time deployment `e95bb2e7-a675-46b2-a58a-e38413646702` succeeded; target guard and live smoke passed for `join.onetimeonetime.com`. |
| Repo status | Passed | Local worktree was clean before this repair branch; current branch is `codex/drive-dropoff-scheduler-repair-canonical-20260705` from `origin/master`. |
| Open PR audit | Passed, later closed | PRs #51, #62, and #63 were later closed unmerged as conflict-stale lanes; `gh pr list --state open` now returns none. |
| Active run status | Passed with blockers | Active run `2026-07-02-background-drive-ui-launch-continuation` has 6 done and 4 blocked requirements. |
| Drive dry run | Passed | `npm run drive:one-time-dropoff-notify -- --recipient=sdratler@gmail.com` checked the two approved Rabbi-facing folders, found 0 items, sent 0 emails. |
| Scheduler readback before repair | Failed | Task `BNA One Time Drive Dropoff Email` pointed to missing `scripts\one-time-drive-dropoff-email-watch.mjs`; last result was `1`. |
| Scheduler repair | Passed locally | Task now executes `wscript.exe` with `scripts\run-one-time-drive-dropoff-notifier.vbs` and `sdratler@gmail.com`; forced run returned `LastTaskResult=0`. |
| Focused test | Passed | `node --test tests/one-time-drive-dropoff-notifier.test.js` passed 5/5. |
| Publish | Passed | Commit `7ba2108b` pushed to `codex/drive-dropoff-scheduler-repair-canonical-20260705`; PR #100 merged at `e80bbc9f7be873036b17c5b3855b8cdba12163b9`. |
| Repo cleanup follow-up | Passed | PR #103 merged at `1a35b78a`; smoke/browser test output now defaults to temp directories unless explicit evidence paths are supplied. |
| Agent fleet readiness | Passed with runtime note | `npm run agent:fleet:readiness` generated `ops/agent-fleet-hardening/2026-07-06T19-26-02-395Z-agent-fleet-readiness.md` with `Overall OK: true`; `agent:fleet:status` still reports supervisor not running and `watchdog:status` reports a stale local lock/API status. |

## Next safest batch

1. Keep `master` as the single active local worktree/branch after the July 6
   cleanup.
2. Start/restart the local agent fleet/watchdog only when Shloimie wants the
   background worker running on this machine.
3. Get valid Operations credentials/session before claiming logged-in One Time
   dashboard/sidebar/right-rail UI as visually clean.
