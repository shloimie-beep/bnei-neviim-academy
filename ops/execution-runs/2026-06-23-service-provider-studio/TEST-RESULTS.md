# Test Results

## Pre-Register Commands

- `git fetch --all --prune`: PASS.
- `git symbolic-ref --short refs/remotes/origin/HEAD`: `origin/master`.
- `gh pr view 5 --json ...`: PR #5 is `MERGED`; head
  `codex/agent-control-center-20260619`; base `master`.
- `git worktree add -b codex/service-provider-studio-20260623 ... origin/master`:
  PASS.
- Clean feature worktree `git status --short --branch`: PASS, no modified files
  before register edits.

## Known Pre-Existing Run Drift

From the clean feature base before the new Studio run was initialized:

- `npm run bna:run:status`: expected FAIL against previous One Time run because
  that run recorded stale branch metadata and references historical live-smoke
  artifacts not present in this clean default-branch worktree.
- `npm run bna:run:next`: same expected FAIL for the previous run.

This run must pass `npm run bna:run:validate` after registration and again
before closeout.

## Register Validation

- `npm run bna:run:validate`: PASS for the new
  `2026-06-23-service-provider-studio` run.
- `npm run bna:run:next`: PASS; selected Batch A / `REQ-20260623-001`, then
  next will advance to `REQ-20260623-002` after the metadata update.

## Baseline Audit

- `git status --short --branch`: PASS; still on isolated
  `codex/service-provider-studio-20260623` worktree with only run/register
  files changed before product-code implementation.
- Canonical audit: PASS; documented reuse/missing/conflict classification in
  `docs/product/service-provider-studio-baseline-2026-06-23.md`.

## Local Feature Gates

- `node --check server.js`: PASS.
- `node --check src\lib\bna\service-provider-studio.js`: PASS.
- Inline Operations script syntax extraction: PASS before full suite.
- Focused Studio and navigation contract tests:
  `node --test tests/google-workspace-settings-contract.test.js tests/ui-01-public-operations-shell.test.js tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js`:
  PASS, 20/20.
- `npm test`: PASS, 1060/1060.
- `npm run studio:smoke`: PASS, 1/1.
- `node scripts\audit-secrets.mjs`: PASS; tracked secret audit passed with
  4072 tracked paths checked and 0 tracked secret-risk files found.
- `git diff --check`: PASS.
- `npm run bna:run:validate`: PASS; work remains by design until default
  integration/deploy evidence exists.
- `npm run watchdog:audit`: PASS; report
  `ops/watchdog-audits/2026-06-23T07-19-watchdog-audit.md`, severity `ok`,
  finding_count `0`.
- `npm run watchdog:actions`: PASS; report
  `ops/watchdog-audits/2026-06-23T07-19-watchdog-action-audit.md`, severity
  `ok`, finding_count `0`.
- `npm run watchdog:security`: PASS; report
  `ops/watchdog-audits/2026-06-23T07-19-watchdog-security-routes.md`,
  severity `ok`, finding_count `0`.

Browser evidence:

- `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-overview.png`
- `ops/playwright-smokes/2026-06-23-service-provider-studio-local/mobile-handoff.png`

## Clean Integration Gates

- Integration worktree:
  `C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio-integration`
- Base: `origin/master` at `4d412797`.
- Merge: `codex/service-provider-studio-20260623` merged with no conflicts.
- `node --check server.js`: PASS.
- `node --check src\lib\bna\service-provider-studio.js`: PASS.
- `npm run studio:smoke`: PASS, 1/1.
- `npm test`: PASS, 1063/1063.
- `npm run bna:run:validate`: PASS; work remains by design until default
  push/deploy proof exists.
- `node scripts\audit-secrets.mjs`: PASS; tracked secret audit checked 4092
  tracked paths and found 0 tracked secret-risk files.
- `git diff --check`: PASS.
- `npm run watchdog:audit`: PASS; report
  `ops/watchdog-audits/2026-06-23T07-28-watchdog-audit.md`, severity `ok`,
  finding_count `0`.
- `npm run watchdog:actions`: PASS; report
  `ops/watchdog-audits/2026-06-23T07-28-watchdog-action-audit.md`, severity
  `ok`, finding_count `0`.
- `npm run watchdog:security`: PASS; report
  `ops/watchdog-audits/2026-06-23T07-28-watchdog-security-routes.md`,
  severity `ok`, finding_count `0`.
