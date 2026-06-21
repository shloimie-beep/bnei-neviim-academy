# Test Results

## Batch 0 Preflight

- PASS `npm run bna:run:status` against the previous latest run.
- PASS `npm run bna:run:validate` against the previous latest run.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with LF/CRLF warnings only.
- PASS `npm run railway:doctor`.
- PASS `npm run app:smoke`; report:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`.
- PASS `npm run bna:run:status` against the successor run.
- PASS `npm run bna:run:validate` against the successor run.

## Batch 1 Protocol Repair

- PASS `node --check scripts/bna-execution-run.mjs`.
- PASS `node --check src/lib/bna/intake-schema.js`.
- PASS `node --test tests/bna-execution-run.test.js` (23/23).
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:next`.
- PASS `npm run bna:run:blockers`.
- PASS `npm run bna:run:source-coverage`.
- PASS `npm run bna:run:stale-evidence`.
- PASS `git diff --check` with LF/CRLF warnings only.
- PASS `node scripts/audit-secrets.mjs` with 0 tracked secret-risk files.

<!-- batch-2:start -->
## Batch 2 Test Results

Recorded after focused verification:

- PASS `node --check scripts/generate-one-time-master-completion-reconciliation.mjs`
- PASS `node scripts/generate-one-time-master-completion-reconciliation.mjs`
- PASS `node --test tests/one-time-master-backlog-reconciliation.test.js tests/rabbi-scheller-meeting-reconciliation.test.js`
- PASS `npm run bna:run:validate`
- PASS `npm run bna:run:source-coverage`
- PASS `git diff --check` with line-ending warnings only where reported by Git
- PASS `node scripts/audit-secrets.mjs`
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 Test Results

Recorded after Task/Decision census, cleanup tooling, server filters, and
Operations view changes:

- PASS `node --check scripts/task-decision-census.mjs`
- PASS `node --check scripts/task-decision-production-cleanup.mjs`
- PASS `node --check server.js`
- PASS `node --test tests/task-decision-census.test.js tests/task-decision-production-cleanup.test.js`
- PASS `node --test tests/task-decision-census.test.js tests/operations-task-queue-visibility.test.js tests/operations-task-comments-and-dictation.test.js tests/workspace-task-no-stale-agent.test.js tests/telegram-ramble-routing-regression.test.js`
- PASS `node scripts/task-decision-census.mjs --limit=1000`
- PASS `node scripts/task-decision-production-cleanup.mjs --limit=1000 --apply`
- PASS `npm run railway:doctor` after deployment `89967278-38dc-49f3-a70d-4536c59f82f6`
- PASS `npm run app:smoke`; report `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- PASS focused Batch 3 Task/Decision live smoke; report `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`

Post-cleanup live census passed workspace isolation checks:

- BNA records in One Time: 0
- One Time records in BNA: 0

Intermediate deployment failures were fixed before final verification:

- `task_view=one_time_tasks` SQL ambiguity fixed by `a28a9332`.
- Text-matched BNA records in One Time task view fixed by strict scoping in `f8a2fd62`.
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 Test Results

Recorded after workspace role model, scoped workspace user APIs, Operations
Users UI actions, and negative authorization coverage:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/one-time-role-model.js`
- PASS `node --check src/platform/rbac/index.js`
- PASS `node --test tests/one-time-role-auth-model.test.js tests/platform-core/platform-core-rbac.test.js tests/operations-module-scoping.test.js tests/external-access-persistence-workflow.test.js tests/workspace-user-role-management.test.js tests/operations-pwa-login.test.js tests/workspace-person-household-provider-contract.test.js tests/live-class-infrastructure.test.js tests/agent-control-api-readback.test.js tests/one-time-operations-ui-smoke.test.js`

Focused combined test result:

- Tests: 58 passed, 0 failed.
- Suites covered: canonical One Time roles, platform RBAC aliases, scoped
  Operations module access, external-access persistence, workspace user role
  management, PWA login/admin users UI, workspace person/provider contracts,
  live-class isolation foundations, agent-control readback, and Operations UI
  smoke.

Dependency note:

- `npm ci` was run in the clean PR worktree because `node_modules` was absent.
  It installed declared lockfile dependencies only and did not modify package
  manifests.

Deployment/live verification:

- PASS `npm run railway:doctor` after deployment
  `04fde749-fca1-4e54-a7c4-f2ece847847b`.
- PASS `npm run app:smoke`; report
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`.
- PASS focused workspace-user role live smoke; report
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`.

Intermediate failure recorded:

- The first focused workspace-user smoke attempt queried `/health`; the live app
  exposes `/api/health`. The smoke was corrected and rerun successfully. This
  was a smoke-script endpoint mistake, not an app regression.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Test Results

Recorded after action coverage artifacts, visible Operations action labels, and
setup-path changes:

- PASS `node --test tests/one-time-action-coverage.test.js tests/watchdog-action-registry.test.js`
- PASS `node --test tests/one-time-action-coverage.test.js tests/watchdog-action-registry.test.js tests/workspace-user-role-management.test.js tests/one-time-operations-ui-smoke.test.js tests/operations-module-scoping.test.js tests/action-registry-telegram-ui-bot.test.js`
- PASS `node --check server.js`
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after Railway deployment
  `9c31c21f-143e-46f3-b95d-2b458a848d9f`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T10-10-19-366Z-live-app-smoke.md`.
- PASS focused One Time visible-action live smoke,
  `ops/live-smokes/2026-06-21T10-11-36-599Z-one-time-visible-actions-live-smoke.md`.

Focused combined test result:

- Tests: 52 passed, 0 failed.
- Covered: One Time action coverage metadata, required visible labels, handler
  and endpoint mapping, placeholder removal, external-write gates, existing
  watchdog action registry, Operations UI smoke, module scoping, workspace user
  actions, and Telegram/UI action registry behavior.
- Live covered: production health, Operations task/decision action markers,
  One Time class/session/appointment/video setup controls, integration setup
  controls, and absence of the old generic placeholder handlers.
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 Test Results

Recorded after Operations sidebar/top-filter separation, horizontal filter rail
correction, status-chip compaction, and UI audit harness viewport updates:

- PASS `node --test tests/operations-shell-navigation-contract.test.js tests/operations-saas-crm-redesign.test.js tests/bna-brand-shell.test.js tests/ops-ui-audit-harness.test.js tests/one-time-operations-ui-smoke.test.js tests/operations-module-scoping.test.js tests/operations-ws01-layout-readability.test.js tests/assistant-portal-communications-contract.test.js`
- PASS `node --check scripts/full-ui-audit.mjs`
- PASS `node --check tools/ops-ui-audit/config.js`
- PASS `npm run ops:audit -- smoke-login`
- PASS production before-audit capture:
  `UI_AUDIT_TARGET_MODE=batch6 UI_AUDIT_SLUG=2026-06-21-batch6-before-prod UI_AUDIT_BASE_URL=https://bneineviimacademy.org node scripts/full-ui-audit.mjs`
- PASS `npm run railway:doctor` after Railway deployment
  `d6c09c49-8372-42d7-8b3b-a049ab24ad63`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T10-56-35-826Z-live-app-smoke.md`.
- PASS production after-audit capture:
  `UI_AUDIT_TARGET_MODE=batch6 UI_AUDIT_SLUG=2026-06-21-batch6-after-prod UI_AUDIT_BASE_URL=https://bneineviimacademy.org node scripts/full-ui-audit.mjs`
- PASS focused Operations filter-rail live smoke,
  `ops/live-smokes/2026-06-21T11-06-48-694Z-operations-filter-rail-live-smoke.md`.

Focused combined test result:

- Tests: 41 passed, 0 failed.
- Covered: Operations shell navigation contract, SaaS CRM layout expectations,
  brand shell filter behavior, UI audit viewport configuration, Operations
  Playwright smoke, module scoping, layout readability, and assistant portal
  communications contract.

Before-audit capture result:

- Screenshots: 141.
- Errors: 0.
- Required widths captured: 1440, 1024, 768, 430, 390, and 360.

After-audit capture result:

- Screenshots: 141.
- Errors: 0.
- Required widths captured: 1440, 1024, 768, 430, 390, and 360.

Focused live smoke confirmed:

- Production health and Operations login succeeded.
- Deployed Operations HTML contains `data-top-filter-rail`, module-sidebar
  mode, and filter-track tablist markers.
- Deployed Operations HTML no longer contains `data-module-toolbar-id` or
  `MODULE_TOOLBAR_PRIORITY`.
- Mobile widths 430, 390, and 360 keep the Tasks filter rail in one row with
  local horizontal scrolling.
- No page-level horizontal overflow was detected at the checked mobile widths.

Intermediate failure notes:

- First focused live-smoke attempt failed on a smoke-script assertion that
  expected Blocked filter ID `blocked`; the live ID is `pending`.
- Second focused live-smoke attempt failed waiting for Playwright `networkidle`;
  the page was then checked with `domcontentloaded` plus explicit selector
  waits and passed.
<!-- batch-6:end -->
