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
- `node --check scripts\agent-browser-profile.mjs` passed.
- `node --test tests\agent-browser-profile-harness.test.js` passed 3/3.
- `npm run agent:browser:list -- --json` passed.
- `npm run agent:browser:health -- --json` passed before initialization with
  `root_exists=false`.
- Temporary external-root smoke for `one_time_review` against
  `https://bneineviimacademy.org/provider.html?review=one-time` passed with no
  screenshot written, no private data captured, body text detected, and no
  horizontal overflow.
- `npm run agent:browser:init -- --json` initialized all six named profiles
  under `C:\Users\User\AppData\Local\BNA\agent-browser-profiles`.
- Final `npm run agent:browser:health -- --json` passed with profile metadata,
  current-user ACL, and inheritance-disabled readback.
- Post-agent-browser execution-run validation passed:
  `npm run bna:run:validate`, `npm run bna:run:source-coverage`,
  `npm run bna:run:stale-evidence`, JSON/JSONL parse, `npm run secrets:audit`
  with 4709 tracked paths and 0 tracked secret-risk files, `git diff --check`,
  and `npm run bna:run:next` selected `REQ-20260624-043`.
- `node --check src\lib\bna\helper\destination-resolver.js` passed.
- `node --check src\lib\bna\helper\tool-registry.js` passed.
- `node --check scripts\watchdog-helper-destinations.mjs` passed.
- `node --test tests\helper-destination-resolver.test.js` passed 5/5.
- `node --test tests\bna-helper-tools.test.js tests\helper-destination-resolver.test.js` passed 15/15.
- `node --test tests\action-registry-telegram-ui-bot.test.js` passed 33/33.
- `node --test tests\universal-control-plane-scope-policy.test.js` passed 10/10.
- `npm run watchdog:actions` passed with 0 findings.
- `npm run watchdog:helper-destinations` passed with 10/10 matrix cases and
  wrote `ops/helper-destination-qa/20260624T203546Z/`.
- Post-helper execution-run validation passed:
  `npm run bna:run:source-coverage`, `npm run bna:run:stale-evidence`,
  JSON/JSONL parse, `npm run secrets:audit` with 4713 tracked paths and 0
  tracked secret-risk files, `git diff --check`, and `npm run bna:run:next`
  selected `REQ-20260624-044`.
- `node --check scripts\intake-github.mjs` passed.
- `node --check src\lib\bna\agent-result-packet.js` passed.
- `node --check src\lib\actions\actions\operations.js` passed.
- `node --check src\lib\actions\registry.js` passed.
- `node --check tests\action-registry-telegram-ui-bot.test.js` passed.
- `node --check tests\system-truth-scripts.test.js` passed.
- `node --test tests\action-registry-telegram-ui-bot.test.js` passed 35/35.
- `node --test tests\agent-control-api-readback.test.js` passed 2/2.
- `node --test tests\operations-activity-queue-health-ui.test.js` passed 3/3.
- `node --test --test-name-pattern "GitHub intake preview" tests\system-truth-scripts.test.js` passed 1/1.
- `npm run watchdog:actions` passed with 0 findings and wrote
  `ops/watchdog-audits/2026-06-24T21-01-watchdog-action-audit.md`.
- Static marker check confirmed the result API route, typed action, and
  Operations activity link functions are present.
- `ops/action-registry.json` parsed successfully.
- Post-agent-result execution-run validation passed:
  `npm run bna:run:validate`, `npm run bna:run:source-coverage`,
  `npm run bna:run:stale-evidence`, JSON/JSONL parse,
  `npm run secrets:audit` with 4720 tracked paths and 0 tracked
  secret-risk files, `git diff --check`, and `npm run bna:run:next`
  selected `REQ-20260624-045`.
- `node --check src\lib\bna\agent-fleet-hardening.js` passed.
- `node --check scripts\agent-fleet-readiness.mjs` passed.
- `node --check scripts\agent-fleet-supervisor.mjs` passed.
- `node --check tests\agent-fleet-hardening.test.js` passed.
- PowerShell parse check for `scripts\start-agent-fleet.ps1` and
  `scripts\start-watchdog.ps1` passed.
- `node --test tests\agent-fleet-hardening.test.js` passed 6/6.
- `node --test tests\agent-fleet-hardening.test.js tests\watchdog-soft-repair.test.js tests\workspace-task-no-stale-agent.test.js`
  passed 25/25.
- `node --test tests\agent-control-api-readback.test.js tests\operations-activity-queue-health-ui.test.js`
  passed 5/5.
- `npm run watchdog:agent-fleet -- --json` passed with `ok=true`,
  parent coordination 0 findings, synthetic ID `51db2f8fb2ce22e1`, and
  `external_write_performed=false`.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\start-agent-fleet.ps1 -Status`
  passed and read back `DESKTOP-E984MCC\User`.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\start-watchdog.ps1 -Status`
  passed and read back `DESKTOP-E984MCC\User`.
- Package and lane-manifest JSON parse check passed.
- Post-agent-fleet execution-run validation passed:
  `npm run bna:run:validate`, `npm run bna:run:source-coverage`,
  `npm run bna:run:stale-evidence`, JSON/JSONL parse,
  `npm run secrets:audit` with 4723 tracked paths and 0 tracked
  secret-risk files, `git diff --check`, and `npm run bna:run:next`
  selected `REQ-20260624-046`.

## Known Non-Blocking Test Note

- Full `node --test tests\system-truth-scripts.test.js` is not used as the
  Batch D gate because an unrelated environment-sensitive return-packet
  assertion currently reflects the dirty active worktree. The focused GitHub
  intake/status preview test passed.

## Pending

- Focused tests for remaining implementation lanes, starting with
  `REQ-20260624-046`.
- Full repository tests and watchdogs before final closeout.
