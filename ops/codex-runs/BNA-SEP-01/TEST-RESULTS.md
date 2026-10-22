# Test Results

Environment:

- Worktree: `C:\Users\User\.codex-worktrees\bna-sep-01-20260715T135234Z`
- Branch: `codex/bna-sep-01-speed-stabilization-20260715T135234Z`
- Base SHA: `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`
- Node: `v24.13.0`
- Final evidence update: `2026-07-15T14:23:37.0518052Z`

## Passed

| Command | Result | Evidence |
| --- | --- | --- |
| `node --check server.js` | pass | exit code 0 |
| `node --check scripts/check-school-admin-performance-budget.mjs` | pass | exit code 0 |
| `node --check scripts/audit-school-admin-performance.mjs` | pass | exit code 0 |
| `node --test tests/school-admin-speed-surface.test.js` | pass | 6 tests, 6 passed |
| `npm run school-admin:perf:budget` | pass | 4 initial requests; 3945 JS gzip bytes; 1662 CSS gzip bytes; 3019 HTML bytes |
| `npm run school-admin:perf:audit` | pass | wrote `AFTER/school-admin-static-summary.json` and `.md` |
| `git diff --check` | pass | only line-ending warnings from Windows autocrlf behavior |
| `npm run operations:check-generated` | pass | generated Operations shell check reported `ok: true` |
| `node scripts/generate-one-time-action-coverage.mjs` | pass | regenerated One Time coverage, `ok`, 40 controls |
| `node scripts/generate-universal-action-parity.mjs` | pass | regenerated universal parity, `ok`, 71 visible controls and 265 registry rows |
| `node --test tests/watchdog-action-registry.test.js` | pass | 5 tests, 5 passed after coverage regeneration |
| `node --test tests/watchdog-route-security.test.js ... tests/school-admin-speed-surface.test.js` | pass | 98 relevant route/security/privacy/workspace/portal tests passed |
| `npm run pqc:validate` | pass | wrote latest PQC validation report |
| `npm run pqc:validate:fixtures` | pass | wrote latest PQC fixture validation report |
| `npm run pqc:evals` | pass | wrote latest PQC eval report |
| `npm run watchdog:protocol-drift` | pass | wrote `ops/watchdog-audits/2026-07-15-product-quality-drift.*` |

The 98-test command intentionally excluded `tests/one-time-route-role-mapping.test.js` after the broader pass proved that file cannot load in this worktree without the Playwright package.

## Blocked

| Command | Status | Reason |
| --- | --- | --- |
| `node --test tests/one-time-route-role-mapping.test.js` | blocked | `Cannot find module 'playwright'` in this clean worktree |
| CODEX-01 30-sample browser matrix | blocked | no approved authenticated local/staging session and no stable browser/database measurement target available |
| `npm test` full suite | not run | not feasible in this worktree until browser-test dependencies are installed; targeted relevant suite and PQC/watchdog checks are recorded above |

## Not Claimed

No browser p50/p75/p95, axe, keyboard/touch, long-task, TTFB, request waterfall, HAR, screenshot, or database query timing evidence is claimed in this checkpoint.
