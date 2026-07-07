# Release Captain

Generated: 2026-07-07T19:41:26.770Z

State: **local changes need verify commit push**

| Check | Value |
| --- | --- |
| Branch | master |
| Head | 86469317ab73 |
| Upstream | origin/master |
| Head pushed | yes |
| Dirty files | 10 |
| Active run | 2026-07-02-background-drive-ui-launch-continuation |

## Blockers

- Working tree has dirty or untracked files; do not deploy from a mixed dirty worktree.

## Next Actions

- Finish the scoped edit batch, then run the focused tests and smokes.
- Stage only the scoped files, commit, push, and open or update the PR.
- After merge, run the approved deployment path and live smoke before marking app-visible work Done.

## Target Gate

| Field | Value |
| --- | --- |
| Target | not_requested |
| Base URL | not requested |
| Expected project | not requested |
| Expected service | not requested |
| Result | passed |

- No target gate blockers.

## Open PRs

No open PRs reported by GitHub CLI.

## Guardrails

- This report is read-only: no deploy, merge, production mutation, external send, payment, DNS, access grant, or secret print.
- App-visible Done still requires merge/deploy/live-smoke evidence.
