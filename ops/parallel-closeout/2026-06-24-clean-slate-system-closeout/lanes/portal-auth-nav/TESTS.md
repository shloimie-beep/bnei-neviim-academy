# portal-auth-nav Tests

Status: Done locally. No deployment, production database mutation, credential use,
real sends, billing, DNS, or external write was performed.

## Contract and Static Tests

```powershell
node --test tests/provider-api-usage-readiness.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-route-map-contract.test.js tests/portal-agnostic-auth-contract.test.js tests/portal-operations-login-fallback.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/google-workspace-settings-contract.test.js
```

Result: pass, 33/33.

```powershell
node --test tests/provider-api-usage-readiness.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-route-map-contract.test.js tests/portal-agnostic-auth-contract.test.js tests/portal-operations-login-fallback.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/operations-task-queue-visibility.test.js tests/one-time-role-auth-model.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js tests/provider-login-phase12-audit.test.js tests/service-provider-directory.test.js tests/public-route-privacy-contract.test.js tests/google-workspace-settings-contract.test.js tests/operations-one-time-view-as.test.js tests/watchdog-action-registry.test.js
```

Result: pass, 77/77 after regenerating action coverage and universal parity
artifacts.

```powershell
node --test tests/watchdog-route-security.test.js tests/one-time-shared-review-branding.test.js tests/one-time-review-only-server.test.js tests/one-time-canonical-journey.test.js
```

Result: pass, 12/12.

## Local Browser Smokes

```powershell
node scripts/smoke-rabbi-scheller-provider-api-usage-local.mjs
```

Result: pass.
Evidence:
`ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/report.md`

```powershell
node scripts/smoke-rabbi-scheller-provider-navigation-local.mjs
```

Result: pass.
Evidence:
`ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/report.md`

```powershell
node scripts/smoke-rabbi-scheller-operations-navigation-local.mjs
```

Result: pass.
Evidence:
`ops/playwright-smokes/2026-06-23-rabbi-scheller-operations-navigation-local/report.md`

```powershell
node scripts/smoke-portal-agnostic-login-chooser-local.mjs
```

Result: pass.
Evidence:
`ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/report.md`

## Generated Artifacts

```powershell
node scripts/build-rabbi-scheller-route-map.mjs
```

Result: pass. Wrote 740 Express routes to
`ops/audits/2026-06-23-rabbi-scheller-route-map.json`.

```powershell
node scripts/generate-one-time-action-coverage.mjs
node scripts/generate-universal-action-parity.mjs
```

Result: pass. One Time action coverage: ok, 40 controls. Universal action
parity: ok, 26 visible controls and 141 registry rows.

## Watchdogs and Safety Checks

```powershell
npm run watchdog:links
npm run watchdog:actions
npm run watchdog:security
npm run secrets:audit
git diff --check
node --check server.js
node --check scripts/build-rabbi-scheller-route-map.mjs
node --check src/lib/bna/provider-api-usage.js
```

Results:

- `npm run watchdog:links`: ok, 0 findings. Evidence:
  `ops/watchdog-audits/2026-06-24T12-50-watchdog-link-audit.md`
- `npm run watchdog:actions`: ok, 0 findings. Evidence:
  `ops/watchdog-audits/2026-06-24T12-50-watchdog-action-audit.md`
- `npm run watchdog:security`: ok, 0 findings. Evidence:
  `ops/watchdog-audits/2026-06-24T12-51-watchdog-security-routes.md`
- `npm run secrets:audit`: pass, 4351 tracked paths checked and 0 tracked
  secret-risk files found.
- `git diff --check`: pass.
- `node --check` commands: pass.

## Execution-Run CLI

```powershell
npm run bna:run:validate
npm run bna:run:status
npm run bna:run:next
```

Result: blocked for this lane branch only. The branch is intentionally based on
the app base SHA from `CONTROL.json`, before the final control-run pointer
commit. The CLI therefore sees stale run metadata for
`codex/issue-8-complete-system-reconciliation`. Central execution-run pointer
edits are reserved for the final integrator.
