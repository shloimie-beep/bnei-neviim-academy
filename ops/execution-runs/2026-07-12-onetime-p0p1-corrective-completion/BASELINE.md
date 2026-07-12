# Baseline

Clean Git truth established before implementation:

- Coordinator checkout `C:\Users\User\BNA v2.0` is dirty on `master` and is
  not used for implementation.
- Canonical worktree for this lane:
  `C:\Users\User\BNA-onetime-p0p1-corrective-20260711`.
- Worktree started clean on branch `codex/onetime-p0p1-corrective-20260711`
  at `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`.
- `gh pr view 129` reported PR #129 open, draft, mergeable, head
  `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`, base
  `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`.
- Existing July 11 run has been marked inactive and continued by this run.

Current evidence gap:

- The July 11 run says local implementation and draft PR setup are complete,
  but the July 12 prompt requires additional implementation/proof before
  release readiness: authentic provider login, real API CRM persistence,
  exact lead linkage, public landing cleanup, ramble-to-done service, mandatory
  regressions, screenshots, and a requirement matrix.

Control tower:

- `npm run chatgpt:dropoff:tower` found no ready ChatGPT packets and no dirty
  worktree at the PR lane baseline. It still lists a draft packet with
  `codex_done`, which is now part of `REQ-20260712-008`.
