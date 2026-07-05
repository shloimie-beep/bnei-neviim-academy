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
| REQ-20260705-604 | Repair the Windows scheduled task so future Rabbi Drive uploads run the canonical notifier from this checkout. | RAW-20260705-010 | rabbi_sheller_provider / one_time_mishnah_class | Codex | scheduler_repair | P0 | B1 | Scheduled task action points to `run-one-time-drive-dropoff-notifier.vbs`, uses `sdratler@gmail.com`, and last run exits `0`. | Done locally |
| REQ-20260705-605 | Publish the scheduler registration hardening so future re-registration works from a path with spaces. | RAW-20260705-010 | bna_platform / release_closeout | Codex | publish | P0 | B2 | Focused tests pass; branch is committed and pushed; PR is opened or exact blocker recorded. | In progress |
| REQ-20260705-606 | Clean stale dirty draft PRs without broad-merging them. | RAW-20260705-010 | bna_platform / github_hygiene | Codex | pr_cleanup | P1 | B3 | PR #51, #62, and #63 are audited for close/extract/ignore, then closed or superseded when safe. | Pending |
| REQ-20260705-607 | Repair/re-verify the active agent-fleet/execution-run blockers. | RAW-20260705-010 | bna_platform / agent_ops | Codex | workflow_hardening | P1 | B3 | `npm run agent:fleet:status`, readiness, and active run blockers are reconciled from canonical branch state. | Pending |
| REQ-20260705-608 | Finish logged-in One Time Operations visual cleanup only with valid auth-backed proof. | RAW-20260705-010 | rabbi_sheller_provider / one_time_mishnah_class | Codex | ui_quality | P1 | B4 | Valid session/credentials allow screenshot-backed dashboard/sidebar/right-rail audit and any scoped UI repair. | Blocked - needs valid Operations credentials/session |

## Evidence

| Check | Status | Evidence |
|---|---|---|
| One Time public release truth | Passed | PR #99 merged to `master` at `e666ddcc13ea0a4a119717cef8a97c6d54239afe`; Railway One Time deployment `e95bb2e7-a675-46b2-a58a-e38413646702` succeeded; target guard and live smoke passed for `join.onetimeonetime.com`. |
| Repo status | Passed | Local worktree was clean before this repair branch; current branch is `codex/drive-dropoff-scheduler-repair-canonical-20260705` from `origin/master`. |
| Open PR audit | Passed | Open PRs remain #51, #62, and #63, all draft dirty lanes that should not be broad-merged. |
| Active run status | Passed with blockers | Active run `2026-07-02-background-drive-ui-launch-continuation` has 6 done and 4 blocked requirements. |
| Drive dry run | Passed | `npm run drive:one-time-dropoff-notify -- --recipient=sdratler@gmail.com` checked the two approved Rabbi-facing folders, found 0 items, sent 0 emails. |
| Scheduler readback before repair | Failed | Task `BNA One Time Drive Dropoff Email` pointed to missing `scripts\one-time-drive-dropoff-email-watch.mjs`; last result was `1`. |
| Scheduler repair | Passed locally | Task now executes `wscript.exe` with `scripts\run-one-time-drive-dropoff-notifier.vbs` and `sdratler@gmail.com`; forced run returned `LastTaskResult=0`. |
| Focused test | Passed | `node --test tests/one-time-drive-dropoff-notifier.test.js` passed 5/5. |

## Next safest batch

1. Commit, push, and PR the scheduler registration hardening.
2. Audit/close or supersede stale draft PRs #51, #62, and #63.
3. Re-run agent fleet readiness from a canonical branch and resolve active run
   blockers one at a time.
4. Get valid Operations credentials/session before claiming logged-in One Time
   dashboard/sidebar/right-rail UI as visually clean.
