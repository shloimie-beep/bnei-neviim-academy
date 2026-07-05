# Release Captain

Generated: 2026-07-05T13:52:38.313Z

State: **local changes need verify commit push**

| Check | Value |
| --- | --- |
| Branch | codex/release-captain-onetime-ui-20260705 |
| Head | 9ee594573ed2 |
| Upstream |  |
| Head pushed | no |
| Dirty files | 37 |
| Active run | 2026-07-02-background-drive-ui-launch-continuation |

## Blockers

- Current HEAD is not confirmed pushed to origin/codex/release-captain-onetime-ui-20260705.
- Working tree has dirty or untracked files; do not deploy from a mixed dirty worktree.

## Next Actions

- Finish the scoped edit batch, then run the focused tests and smokes.
- Stage only the scoped files, commit, push, and open or update the PR.
- After merge, run the approved deployment path and live smoke before marking app-visible work Done.

## Open PRs

| PR |Branch |Title |State |
| #63 |codex/one-time-clean-integration-20260702 |[codex] Clean One Time launch setup integration |draft |
| #62 |codex/one-time-launch-cleanup-20260702-no-workflow |[codex] Reconcile One Time launch cleanup |draft |
| #51 |codex/rabbi-onetime-comms-scope-release-20260629 |[codex] Repair One Time Operations UI shell |draft |

## Guardrails

- This report is read-only: no deploy, merge, production mutation, external send, payment, DNS, access grant, or secret print.
- App-visible Done still requires merge/deploy/live-smoke evidence.
