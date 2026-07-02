# Plan - One Time Clean Integration From PR #62

## B0 - Clean Branch

- Create a fresh branch from current `origin/master`.
- Use PR #62 only as source material.
- Avoid broad runtime/UI conflict merge.

## B1 - Narrow Port

- Add a no-write One Time external setup readiness checker.
- Add focused tests.
- Restore launch-unblocker operator setup tasks, join-domain instructions, WhatsApp setup-message draft, and post-setup deploy/live-smoke packet.
- Correct active One Time provisioning to use `join.onetimeonetime.com`.

## B2 - Verification

- Run syntax checks, focused tests, setup checker, Railway dry-run, DB bootstrap dry-run, BNA run validation, PQC validation, secrets audit, and `git diff --check`.
- Treat setup readiness failures as exact external blockers, not generic Codex blockers.

## B3 - Closeout

- Update run evidence and next-session handoff.
- Commit and push the clean branch.
- Open a clean PR.
- Do not deploy separate One Time until setup checker passes.
