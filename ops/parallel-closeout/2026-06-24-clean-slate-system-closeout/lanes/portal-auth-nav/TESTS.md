# portal-auth-nav Tests

Expected minimum checks:

- `node --test tests/provider-api-usage-readiness.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-route-map-contract.test.js tests/portal-agnostic-auth-contract.test.js tests/portal-operations-login-fallback.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/google-workspace-settings-contract.test.js`
- `node scripts/smoke-rabbi-scheller-provider-api-usage-local.mjs`
- `node scripts/smoke-rabbi-scheller-provider-navigation-local.mjs`
- `node scripts/smoke-rabbi-scheller-operations-navigation-local.mjs`
- `node scripts/smoke-portal-agnostic-login-chooser-local.mjs`

Record actual commands and results here.
