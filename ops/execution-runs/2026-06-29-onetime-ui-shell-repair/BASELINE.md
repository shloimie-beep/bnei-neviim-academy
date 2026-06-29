# Baseline

## 2026-06-29 Preflight

The dirty root worktree at `C:\Users\User\BNA v2.0` contains many unrelated
changes, including prior One Time work. This run uses the clean release
worktree at `C:\Users\User\BNA-rabbi-onetime-comms-release` on
`codex/rabbi-onetime-comms-scope-release-20260629`, based on `origin/master`
commit `e3dad482`.

Initial clean-worktree run CLI commands were executed before this run existed:

- `npm run bna:run:status`: failed because the stale active transcript run
  referenced missing evidence paths.
- `npm run bna:run:next`: same validation failure.
- `npm run bna:run:blockers`: same validation failure.

The referenced packet path
`ops/one-time-mishnah/operator-ui-review/2026-06-26-rabbi-ui-cleanup-implementation-map.md`
is not present on this production-base branch. Related historical ledger items
show prior Rabbi UI contract work and live closeout, but this run must inspect
the current production-base files directly.
