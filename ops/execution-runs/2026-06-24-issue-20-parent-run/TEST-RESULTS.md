# Test Results

## Completed

- `npm install --no-audit --no-fund` passed in the Issue #20 worktree.
- Baseline readback checks for Git/GitHub/live app were completed and recorded
  in `BASELINE-READBACK.md`.
- Direct live health readback passed for
  `https://bneineviimacademy.org/api/health` with HTTP 200 and database
  connected.
- `npm run railway:doctor` was run and failed due to local Railway CLI
  targeting mismatch; this is recorded as the final deploy/live closeout
  blocker for `REQ-20260624-048`.
- `npm run bna:run:validate` passed.
- `npm run bna:run:source-coverage` passed with 11 mapped source statements
  and 0 unmapped executable statements.
- `npm run bna:run:stale-evidence` passed with no stale evidence.
- `node -e` JSON/JSONL parse for `LANE-MANIFEST.json` and
  `ops/agent-task-ledger.jsonl` passed.
- `git diff --check` passed with Windows line-ending warnings only.
- `npm run bna:run:next` selected `REQ-20260624-041`.
- Checkpoint commit `3e0902f651302ae594e5462f3a88913b40406d8c` was pushed to
  `origin/codex/issue-20-parent-run-20260624`.
- `node --check scripts\watchdog-visual-baseline.mjs` passed.
- `node --check public\js\bna-site-nav.js` passed.
- `npm run watchdog:visual:local` passed with 0 findings across 9 routes and 3
  viewports.
- `npm run owner-review:visual` passed for release-local and production public.
- Focused visual/UI tests passed 22/22:
  `tests\bna-brand-shell.test.js`,
  `tests\app-wide-brand-shell.test.js`,
  `tests\one-time-shared-review-branding.test.js`,
  `tests\one-time-focused-landing.test.js`, and
  `tests\one-time-product-system.test.js`.
- `npm run watchdog:ui` passed with 0 findings.
- `npm run watchdog:visual` passed with 0 findings.
- Post-visual execution-run validation passed:
  `npm run bna:run:validate`, `npm run bna:run:source-coverage`,
  `npm run bna:run:stale-evidence`, JSON/JSONL parse, `git diff --check`, and
  `npm run bna:run:next` selected `REQ-20260624-042`.

## Pending

- Focused tests for remaining implementation lanes.
- Full repository tests and watchdogs before final closeout.
