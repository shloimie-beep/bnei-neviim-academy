# Baseline

## Git

- Shared dirty checkout at `C:\Users\User\BNA v2.0` is on
  `codex/closeout-vimeo-media-20260624` at
  `6f57d91037d559faa171c71565e6403e62126407` with many unrelated local
  changes. It is preserved and not reset.
- Clean Issue #24 worktree:
  `C:\Users\User\Documents\Codex\2026-06-25\issue-24-agent-review-hub`.
- Issue #24 branch: `codex/issue-24-agent-review-hub-20260625`.
- `origin/master`: `b8fb9e6dceb1b4c995108e3510cb3c2f9867a17b`.
- Local clean-worktree HEAD at start:
  `b8fb9e6dceb1b4c995108e3510cb3c2f9867a17b`.

## Deploy And Live Health

- Existing configured checkout Railway doctor passed for project/service
  `skillful-motivation`, environment `production`, deployment
  `4667ac5e-7695-4802-9b3d-5b6e12d07a64`, status `SUCCESS`.
- Existing configured checkout `npm run app:smoke` passed and wrote a local
  generated report under `ops/live-smokes/`.
- Clean worktree `npm run app:smoke:public-privacy` passed.
- Clean worktree `npm run app:smoke` initially failed before `npm ci` because
  `googleapis` was not installed in the fresh worktree; `npm ci` subsequently
  installed dependencies.
- Clean worktree `npm run railway:doctor` initially failed closed because the
  worktree lacks local untracked secrets/config and Railway CLI account status
  resolved a stale `one-time-production` target. Do not copy secrets into the
  repo; use the configured checkout or approved keyholder flow for later live
  deployment verification.

## Active Run And Queue

- Current `origin/master` `ops/execution-runs/latest.json` points to
  `2026-06-24-issue-20-parent-run` with status `closed_live_verified`.
- Clean worktree `npm run bna:run:status` and `npm run bna:run:next` report
  Issue #20 has 9 Done requirements and no work remaining, but validation
  fails because three generated `ops/live-smokes/` evidence paths referenced in
  `requirements.json` are not committed. This is recorded as baseline evidence
  drift and not treated as Issue #24 completion proof.
- This run now owns `ops/execution-runs/latest.json`.

## Worktrees

Existing worktrees were listed before creating this run. The dirty shared Vimeo
checkout and historical/detached deploy worktrees were not reset, cleaned,
pruned, or force-deleted. The only new worktree created for this run is:

`C:\Users\User\Documents\Codex\2026-06-25\issue-24-agent-review-hub`

## Guardrails

- Issue #18 remains `NOT SAFE TO APPLY`.
- No class backfill, production student-data mutation, Drive move/write, paid
  retranscription, worker retry, send, charge, DNS change, credential/account
  change, Buffer publish, or public publishing is authorized by registration.
