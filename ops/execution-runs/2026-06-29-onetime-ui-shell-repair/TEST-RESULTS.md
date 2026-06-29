# Test Results

## Passing

- `node --test tests/one-time-action-coverage.test.js tests/watchdog-action-registry.test.js tests/watchdog-route-security.test.js tests/one-time-operations-ui-smoke.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/one-time-shared-review-branding.test.js tests/one-time-review-only-server.test.js tests/communications-screening-import-ui.test.js tests/one-time-communications-workspace.test.js tests/wapi-phonebook-report.test.js`: PASS, 43/43 tests.
- `npm run watchdog:actions`: PASS, report `ops/watchdog-audits/2026-06-29T14-23-watchdog-action-audit.md`.
- `npm run watchdog:security`: PASS, report `ops/watchdog-audits/2026-06-29T14-23-watchdog-security-routes.md`.
- `npm run watchdog:links`: PASS, report `ops/watchdog-audits/2026-06-29T14-23-watchdog-link-audit.md`.
- `npm run secrets:audit`: PASS, 5329 tracked paths checked, 0 tracked secret-risk files found.
- `npm run bna:run:validate`: PASS after run setup and after verification updates.

## Notes

- `npm ci` was run in this clean worktree because `node_modules` was absent; it installed from the existing lockfile.
- The first focused test run exposed a content topic recursion in the Operations content route; `contentParsedSections` / `contentTopicKeys` now use a skip-fallback guard and the rerun passed.
- The in-app browser could render and inspect the DOM, but its screenshot API timed out. Local Chrome headless captured the before/after viewport screenshots against the fixture server.

## Release Handoff Commands

- PASS `git commit -m "Repair One Time Operations UI shell"` -> `a6087dc019c3f146cab28eceafc8b7e629c59aec`.
- PASS `git push -u origin codex/rabbi-onetime-comms-scope-release-20260629`.
- PASS draft PR opened: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`.
- PASS `npm run bna:release-gate -- --json` dry run: branch clean, pushed, and no dry-run blockers.
- BLOCKED `npm run railway:doctor`: Railway target guard requires explicit service ID/name and aborted before deploy.
