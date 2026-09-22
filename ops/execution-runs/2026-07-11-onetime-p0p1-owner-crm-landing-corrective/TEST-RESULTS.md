# Test Results

Verified locally on 2026-07-11 / 2026-07-12 Asia/Jerusalem.

Passed:

- `node --check server.js`
- `node --check scripts/split-operations-shell.mjs`
- `node --check scripts/check-operations-canonical-artifact.mjs`
- `npm run operations:build`
- `npm run operations:check-generated`
- `npm run operations:check-canonical`
- `node --test tests/one-time-rabbi-dashboard-ia.test.js tests/one-time-focused-landing.test.js tests/one-time-preview-page.test.js tests/one-time-onboarding-intake.test.js tests/service-provider-scope-routes.test.js tests/one-time-admin-mailbox-access.test.js tests/one-time-safe-view-as-navigation.test.js tests/one-time-route-role-mapping.test.js tests/crm-contact-model.test.js tests/one-time-operations-ui-smoke.test.js` (`42` tests)
- `npm run one-time:smoke:public-onboarding-local`
- `npm run one-time:smoke:operations-crm-workbench-local`
- `npm run one-time:smoke:provider-crm-layout-local`
- `npm run watchdog:actions`
- `npm run watchdog:protocol-drift`
- `npm run pqc:validate`
- `npm run bna:run:validate`

Not run:

- Production deploy and live smoke. Blocked pending review approval.
