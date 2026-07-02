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

Recorded after adding the shared assistant/control-plane scope policy:

- PASS `node --check src/platform/assistant/control-plane.js`
- PASS `node --test tests/universal-control-plane-scope-policy.test.js`
  (6/6)
- PASS `node --test tests/one-time-role-auth-model.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js tests/universal-assistant-mvp.test.js`
  (18/18)
- PASS `node --test tests/one-time-role-auth-model.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js tests/one-time-external-user-portal.test.js tests/operations-people-filter.test.js tests/workspace-person-household-provider-contract.test.js`
  (62/62)
- PASS `node --test tests/rabbi-task-dialogue.test.js`
  (4/4)
- PASS `node --test tests/task-decision-census.test.js tests/workspace-task-no-stale-agent.test.js tests/operations-task-comments-and-dictation.test.js tests/operations-task-queue-visibility.test.js`
  (24/24)
- PASS `npm test`
  (1028/1028)
- PASS clean-worktree `npm test`
  (1069/1069) in
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- PASS clean-worktree `npm run railway:doctor`
  with Railway deployment `641ac75e-d6d7-4379-a27c-4f7a4d9d3dbf`
- PASS main-worktree `npm run app:smoke`
  report `ops/live-smokes/2026-06-23T15-59-34-390Z-live-app-smoke.md`
- PASS focused Batch 4 live smoke
  report `ops/live-smokes/2026-06-23T16-00-48-379Z-batch4-control-plane-live-smoke.md`
- PASS clean-branch Operations workspace taxonomy live smoke
  report `ops/live-smokes/2026-06-23T16-01-39-450Z-operations-workspace-taxonomy-live-smoke.md`

Batch 4 is deployed and live-smoked. `REQ-20260619-303` is marked done.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Test Results

Recorded after adding the One Time action coverage gate and Operations action
annotations:

- PASS `node --check scripts/generate-one-time-action-coverage.mjs`
- PASS `node scripts/generate-one-time-action-coverage.mjs`
  (`One Time action coverage: ok (40 controls)`)
- PASS `npm run watchdog:actions`
  report `ops/watchdog-audits/2026-06-23T16-28-watchdog-action-audit.md`
- PASS main-worktree `node --test tests/watchdog-action-registry.test.js`
  (4/4)
- PASS clean-worktree
  `node --test tests/one-time-action-coverage.test.js tests/watchdog-action-registry.test.js`
  (9/9)
- PASS clean-worktree related action/UI pack
  (69/69)
- PASS clean-worktree browser smokes:
  `tests/agent-control-browser-smoke.test.js` (2/2),
  `tests/one-time-operations-ui-smoke.test.js` (1/1), and
  `tests/service-provider-studio-browser-smoke.test.js` (1/1 after rerun)
- PASS clean-worktree `npm test`
  (1071/1071)
- PASS clean-worktree `npm run railway:doctor`
  with Railway deployment `c93a9311-4eb0-4982-8c14-b5f7a9cd5c8e`
- PASS focused Batch 5 action coverage live smoke
  report `ops/live-smokes/2026-06-23T16-37-19-965Z-batch5-action-coverage-live-smoke.md`
- PASS main-worktree `npm run app:smoke`
  report `ops/live-smokes/2026-06-23T16-39-27-702Z-live-app-smoke.md`
- PASS clean-branch Operations workspace taxonomy live smoke
  report `ops/live-smokes/2026-06-23T16-39-50-955Z-operations-workspace-taxonomy-live-smoke.md`
- PASS `npm run bna:run:validate`
  counts: done 6, not_started 12, needs_operator_decision 1
- PASS `npm run bna:run:source-coverage`
  with 0 unmapped executable statements
- PASS `npm run bna:run:next`
  next unblocked batch `REQ-20260619-304`

Batch 5 is deployed and live-smoked. `REQ-20260621-502` is marked done.
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 Test Results

Recorded after the One Time Operations UI/design-system correction:

- PASS clean-worktree `node --check scripts/one-time-ui-design-delta-audit.mjs`
- PASS clean-worktree `node scripts/one-time-ui-design-delta-audit.mjs`
  (`One Time UI design delta audit: pass`)
- PASS clean-worktree
  `node --test tests/one-time-ui-design-delta-audit.test.js tests/operations-shell-navigation-contract.test.js tests/operations-saas-crm-redesign.test.js tests/operations-ws01-layout-readability.test.js`
  (16/16)
- PASS clean-worktree `node --test tests/one-time-operations-ui-smoke.test.js`
  (1/1), with desktop and mobile screenshots refreshed
- PASS clean-worktree Batch 6 related action/UI pack
  (59/59)
- PASS clean-worktree `npm run watchdog:actions`
  (severity `ok`, finding count 0)
- PASS clean-worktree `npm test`
  (1071/1071)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS main-worktree `npm run app:smoke`
  report `ops/live-smokes/2026-06-23T16-59-39-550Z-live-app-smoke.md`
- PASS clean-worktree `npm run app:smoke:operations-workspace-taxonomy`
  report `ops/live-smokes/2026-06-23T17-00-15-340Z-operations-workspace-taxonomy-live-smoke.md`
- PASS focused Batch 6 Operations UI live smoke
  report `ops/live-smokes/2026-06-23T17-01-12-970Z-batch6-operations-ui-live-smoke.md`

Batch 6 is deployed and live-smoked. `REQ-20260619-304` is marked done.
<!-- batch-6:end -->

<!-- batch-7:start -->
## Batch 7 Test Results

Recorded after closing the first-party communications parent requirement:

- PASS clean-worktree focused communications suite:
  `node --test tests/one-time-communications-workspace.test.js tests/communications-screening-import-ui.test.js tests/communications-integrations-contract.test.js tests/assistant-portal-communications-contract.test.js tests/intake-parser-communications.test.js tests/resend-client.test.js tests/wapi-phonebook-report.test.js`
  (36/36)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `npm run app:smoke:whatsapp-ux`
  report `ops/live-smokes/2026-06-23T17-09-51-981Z-whatsapp-ux-live-smoke.md`
- PASS clean-worktree `npm run app:smoke:email-resend-ux`
  report `ops/live-smokes/2026-06-23T17-09-52-093Z-email-resend-ux-live-smoke.md`
- PASS clean-worktree `npm run app:smoke:communications-screening`
  report `ops/live-smokes/2026-06-23T17-10-27-503Z-communications-screening-live-smoke.md`

Batch 7 is deployed and live-smoked. `REQ-20260619-305`,
`REQ-20260621-503`, and `REQ-20260621-504` are marked done.
<!-- batch-7:end -->

<!-- batch-9:start -->
## Batch 9 Test Results

Recorded after closing the product/schedule/booking/portal/billing
foundations:

- PASS clean-worktree focused product/portal/billing suite:
  `node --test tests/one-time-product-system.test.js tests/rabbi-checkout-access.test.js tests/rabbi-member-portal-access.test.js tests/rabbi-parent-portal.test.js tests/provider-classroom-local-contract.test.js tests/parent-portal-contract.test.js tests/student-portal-auth-policy.test.js`
  (20/20)
- PASS clean-worktree syntax checks:
  `node --check src/lib/bna/one-time-product-system.js`,
  `node --check scripts/smoke-one-time-product-booking-live.mjs`, and
  `node --check scripts/smoke-one-time-payment-access-class-links-live.mjs`
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `node scripts/smoke-one-time-product-booking-live.mjs`
  report `ops/live-smokes/2026-06-23T17-16-03-089Z-one-time-product-booking-live-smoke.md`
- PASS clean-worktree `npm run app:smoke:one-time-payment-access-class-links`
  report `ops/live-smokes/2026-06-23T17-16-03-292Z-one-time-payment-access-class-links-live-smoke.md`
- PASS clean-worktree `npm run app:smoke:one-time-shared-review`
  report `ops/live-smokes/2026-06-23T17-16-03-566Z-one-time-shared-review-live-smoke.md`

Batch 9 is deployed and live-smoked. `REQ-20260619-306` is marked done.
<!-- batch-9:end -->

<!-- batch-12:start -->
## Batch 12 Test Results

Recorded after closing the Zoom meeting and attendance foundation:

- PASS clean-worktree syntax checks:
  `node --check src/lib/integrations/zoom.js` and
  `node --check scripts/smoke-one-time-zoom-attendance-live.mjs`
- PASS clean-worktree focused Zoom/product/portal suite:
  `node --test tests/one-time-zoom-attendance-automation.test.js tests/live-class-infrastructure.test.js tests/rabbi-checkout-access.test.js tests/one-time-product-system.test.js tests/provider-classroom-local-contract.test.js tests/parent-student-portal-contract.test.js`
  (53/53)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `node scripts/smoke-one-time-zoom-attendance-live.mjs`
  report
  `ops/live-smokes/2026-06-23T17-23-08-813Z-one-time-zoom-attendance-live-smoke.md`

Batch 12 is deployed and live-smoked. `REQ-20260619-307` is marked done.
<!-- batch-12:end -->

<!-- batch-11-13:start -->
## Batch 11/13 Test Results

Recorded after closing the Vimeo/member-library/recording pipeline:

- PASS clean-worktree syntax checks:
  `node --check src/lib/integrations/video-hosting.js` and
  `node --check scripts/smoke-one-time-vimeo-member-library-live.mjs`
- PASS clean-worktree focused recording/Vimeo/member-library suite:
  `node --test tests/one-time-recording-vimeo-pipeline.test.js tests/one-time-member-library.test.js tests/one-time-content-library-workspace.test.js tests/live-class-infrastructure.test.js tests/provider-classroom-local-contract.test.js tests/provider-integrations-secret-storage.test.js tests/operations-content-library-taxonomy.test.js`
  (30/30)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `node scripts/smoke-one-time-vimeo-member-library-live.mjs`
  report
  `ops/live-smokes/2026-06-23T17-28-42-169Z-one-time-vimeo-member-library-live-smoke.md`

Batch 11/13 is deployed and live-smoked. `REQ-20260619-308` is marked done.
<!-- batch-11-13:end -->

<!-- batch-14:start -->
## Batch 14 Test Results

Recorded after closing transcript privacy and knowledge scoping:

- PASS clean-worktree syntax checks:
  `node --check src/lib/bna/transcript-privacy.js` and
  `node --check scripts/smoke-one-time-transcript-privacy-live.mjs`
- PASS clean-worktree focused transcript privacy suite:
  `node --test tests/one-time-transcript-privacy.test.js tests/public-helper-context.test.js tests/public-helper-privacy.test.js tests/one-time-recording-vimeo-pipeline.test.js tests/one-time-zoom-attendance-automation.test.js tests/provider-classroom-local-contract.test.js tests/parent-student-portal-contract.test.js tests/one-time-content-library-workspace.test.js`
  (54/54)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `node scripts/smoke-one-time-transcript-privacy-live.mjs`
  report
  `ops/live-smokes/2026-06-23T17-33-56-257Z-one-time-transcript-privacy-live-smoke.md`

Batch 14 is deployed and live-smoked. `REQ-20260619-309` is marked done.
<!-- batch-14:end -->

<!-- batch-15:start -->
## Batch 15 Test Results

Recorded after closing gamification and badge auditing:

- PASS clean-worktree syntax checks:
  `node --check src/lib/bna/gamification.js` and
  `node --check scripts/smoke-one-time-gamification-live.mjs`
- PASS clean-worktree focused gamification/badge suite:
  `node --test tests/gamification-events.test.js tests/one-time-gamification-badge-audit.test.js tests/ws11-community-model-contract.test.js tests/parent-progress-privacy.test.js tests/provider-classroom-local-contract.test.js tests/parent-student-portal-contract.test.js tests/one-time-community-moderation-workflow.test.js`
  (57/57)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `node scripts/smoke-one-time-gamification-live.mjs`
  report
  `ops/live-smokes/2026-06-23T17-38-46-447Z-one-time-gamification-live-smoke.md`

Batch 15 is deployed and live-smoked. `REQ-20260619-310` is marked done.
<!-- batch-15:end -->

<!-- batch-16:start -->
## Batch 16 Test Results

Recorded after closing community and moderation workflow:

- PASS clean-worktree syntax checks:
  `node --check src/lib/bna/community-moderation.js` and
  `node --check scripts/smoke-one-time-community-live.mjs`
- PASS clean-worktree focused community/moderation suite:
  `node --test tests/one-time-community-moderation-workflow.test.js tests/ws11-community-model-contract.test.js tests/provider-classroom-settings-contract.test.js tests/provider-classroom-local-contract.test.js tests/parent-progress-privacy.test.js tests/one-time-gamification-badge-audit.test.js tests/parent-student-portal-contract.test.js`
  (53/53)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `node scripts/smoke-one-time-community-live.mjs`
  report
  `ops/live-smokes/2026-06-23T17-43-01-034Z-one-time-community-live-smoke.md`

Batch 16 is deployed and live-smoked. `REQ-20260619-311` is marked done.
<!-- batch-16:end -->

<!-- batch-17:start -->
## Batch 17 Test Results

Recorded after closing Sefaria and scoped study-assistant readiness:

- PASS clean-worktree syntax checks:
  `node --check src/lib/bna/study-assistant-readiness.js` and
  `node --check scripts/smoke-one-time-study-assistant-live.mjs`
- PASS clean-worktree focused study-assistant/privacy/portal/community suite:
  `node --test tests/one-time-study-assistant-readiness.test.js tests/one-time-transcript-privacy.test.js tests/public-helper-context.test.js tests/public-helper-privacy.test.js tests/provider-classroom-local-contract.test.js tests/parent-student-portal-contract.test.js tests/one-time-community-moderation-workflow.test.js`
  (47/47)
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `node scripts/smoke-one-time-study-assistant-live.mjs`
  report
  `ops/live-smokes/2026-06-23T17-48-36-925Z-one-time-study-assistant-live-smoke.md`

Batch 17 is deployed and live-smoked. `REQ-20260619-312` is marked done.
<!-- batch-17:end -->

<!-- batch-19:start -->
## Batch 19 Test Results

Recorded after final verification and release closeout:

- PASS clean-worktree `npm test` (1071/1071)
- PASS clean-worktree `npm run secrets:audit`
  (4100 tracked paths checked, 0 tracked secret-risk files found)
- PASS clean-worktree `npm run watchdog:actions`
  (severity `ok`, 0 findings)
- PASS remote branch readback:
  `refs/heads/codex/one-time-batch4-control-plane-20260623` resolves to
  `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- PASS `npm run railway:doctor`
  with Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status
  `SUCCESS`
- PASS clean-worktree `npm run app:smoke`
  report `ops/live-smokes/2026-06-23T17-55-00-705Z-live-app-smoke.md`
- PASS clean-worktree `npm run app:smoke:final-register-surfaces`
  report
  `ops/live-smokes/2026-06-23T17-55-27-727Z-final-register-surfaces-live-smoke.md`
- PASS clean-worktree `npm run app:smoke:operations-workspace-taxonomy`
  report
  `ops/live-smokes/2026-06-23T17-55-27-745Z-operations-workspace-taxonomy-live-smoke.md`

Batch 19 is deployed and live-smoked. `REQ-20260619-314` is marked done.
<!-- batch-19:end -->

<!-- addendum-req-011:start -->
## REQ-20260623-011 Test Results

Recorded after implementing the shared assistant control-plane contract:

- PASS `node --check src/platform/assistant/control-plane.js`
- PASS `node --test tests/universal-control-plane-scope-policy.test.js`
  (8/8)

`REQ-20260623-011` is verified locally. No deploy/live smoke is required for
this architecture contract batch.
<!-- addendum-req-011:end -->

<!-- addendum-req-012:start -->
## REQ-20260623-012 Test Results

Recorded after implementing and deploying the shared assistant data model:

- PASS clean-worktree `node --check server.js`
- PASS clean-worktree `node --check src/platform/assistant/control-plane.js`
- PASS clean-worktree assistant/control-plane focused suite:
  `node --test tests/assistant-control-plane-data-model.test.js tests/universal-control-plane-scope-policy.test.js tests/universal-assistant-mvp.test.js tests/universal-assistant-contract.test.js tests/assistant-portal-communications-contract.test.js tests/community-weekly-updates-contract.test.js tests/developer-tester-ticket-capture.test.js`
  (49/49)
- PASS clean-worktree route registry JSON parse.
- PASS main-workspace `node --check server.js`
- PASS main-workspace `node --check src/platform/assistant/control-plane.js`
- PASS main-workspace focused suite:
  `node --test tests/assistant-control-plane-data-model.test.js tests/universal-control-plane-scope-policy.test.js`
  (13/13)
- PASS main-workspace route registry JSON parse.
- PASS `npm run railway:doctor` with Railway deployment
  `04756fab-bd9c-4f6b-869a-39668f64c419` status `SUCCESS`.
- PASS main-workspace `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T18-25-13-013Z-live-app-smoke.md`.
- PASS authenticated live assistant readiness smoke, report
  `ops/live-smokes/2026-06-23T18-26-39-444Z-assistant-control-plane-readiness-live-smoke.md`.

`REQ-20260623-012` is deployed and live-smoked.
<!-- addendum-req-012:end -->

<!-- addendum-req-013:start -->
## REQ-20260623-013 Test Results

Recorded after implementing and deploying the universal action parity gate:

- PASS clean-worktree `node --check scripts/generate-universal-action-parity.mjs`
- PASS clean-worktree `node scripts/generate-one-time-action-coverage.mjs`
  (40 controls)
- PASS clean-worktree `node scripts/generate-universal-action-parity.mjs`
  (22 visible controls, 133 registry rows)
- PASS clean-worktree `node --test tests/watchdog-action-registry.test.js`
  (5/5)
- PASS clean-worktree
  `node --test tests/action-registry-telegram-ui-bot.test.js` (33/33)
- PASS clean-worktree `npm run watchdog:actions`
  (severity `ok`, 0 findings)
- PASS main-workspace `node --check scripts/generate-universal-action-parity.mjs`
- PASS main-workspace `node --test tests/watchdog-action-registry.test.js`
  (5/5)
- PASS main-workspace
  `node --test tests/action-registry-telegram-ui-bot.test.js` (33/33)
- PASS main-workspace `npm run watchdog:actions`
  (severity `ok`, 0 findings)
- PASS `npm run railway:doctor` with Railway deployment
  `e4b035db-e309-4402-b19c-4a26774aab8d` status `SUCCESS`.
- PASS main-workspace `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T18-41-53-481Z-live-app-smoke.md`.

`REQ-20260623-013` is deployed and live-smoked.
<!-- addendum-req-013:end -->

<!-- addendum-req-014:start -->
## REQ-20260623-014 Test Results

Recorded after implementing and deploying the shared registry-constrained
planner/runner:

- PASS main-workspace `node --check src/platform/assistant/action-planner.js`
- PASS main-workspace `node --check tests/assistant-action-planner-contract.test.js`
- PASS main-workspace `node --test tests/assistant-action-planner-contract.test.js`
  (6/6)
- PASS main-workspace
  `node --test tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/action-registry-telegram-ui-bot.test.js`
  (47/47)
- PASS clean-worktree `node --check src/platform/assistant/action-planner.js`
- PASS clean-worktree
  `node --test tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/action-registry-telegram-ui-bot.test.js`
  (47/47)
- PASS `npm run railway:doctor` with Railway deployment
  `d61bbb67-c6bd-409a-89a1-c0e9c63e11e6` status `SUCCESS`.
- PASS main-workspace `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T18-53-31-401Z-live-app-smoke.md`.

`REQ-20260623-014` is deployed and live-smoked.
<!-- addendum-req-014:end -->

<!-- addendum-req-015:start -->
## REQ-20260623-015 Test Results

Recorded after implementing and deploying the shared draft/template/versioning
contract:

- PASS main-workspace `node --check src/platform/assistant/draft-versioning.js`
- PASS main-workspace `node --check tests/assistant-draft-versioning-contract.test.js`
- PASS main-workspace
  `node --test tests/assistant-draft-versioning-contract.test.js` (8/8)
- PASS main-workspace
  `node --test tests/assistant-draft-versioning-contract.test.js tests/assistant-action-planner-contract.test.js tests/assistant-control-plane-data-model.test.js tests/universal-control-plane-scope-policy.test.js tests/action-registry-telegram-ui-bot.test.js`
  (60/60)
- PASS clean-worktree `node --check src/platform/assistant/draft-versioning.js`
- PASS clean-worktree
  `node --test tests/assistant-draft-versioning-contract.test.js tests/assistant-action-planner-contract.test.js tests/assistant-control-plane-data-model.test.js tests/universal-control-plane-scope-policy.test.js tests/action-registry-telegram-ui-bot.test.js`
  (60/60)
- PASS `npm run railway:doctor` with Railway deployment
  `be818786-b5ab-416a-bbb3-0818c79cfc76` status `SUCCESS`.
- First `npm run app:smoke` attempt exceeded the command timeout before
  returning a report.
- PASS rerun `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T19-05-47-613Z-live-app-smoke.md`.

`REQ-20260623-015` is deployed and live-smoked.
<!-- addendum-req-015:end -->

<!-- addendum-req-016:start -->
## REQ-20260623-016 Test Results

Recorded after implementing and deploying the shared file/media intake
contract:

- PASS main-workspace `node --check src/platform/assistant/file-media-intake.js`
- PASS main-workspace
  `node --test tests/assistant-file-media-intake-contract.test.js` (8/8)
- PASS main-workspace
  `node --test tests/assistant-file-media-intake-contract.test.js tests/telegram-media-routing.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js`
  (42/42)
- PASS clean-worktree `node --check src/platform/assistant/file-media-intake.js`
- PASS clean-worktree
  `node --test tests/assistant-file-media-intake-contract.test.js tests/telegram-media-routing.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js`
  (41/41)
- PASS `npm run railway:doctor` with Railway deployment
  `6a3c0cfe-44bb-4154-8f1c-00bcf6f9a169` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T19-14-56-082Z-live-app-smoke.md`.

`REQ-20260623-016` is deployed and live-smoked.
<!-- addendum-req-016:end -->

<!-- addendum-req-017:start -->
## REQ-20260623-017 Test Results

Recorded after implementing and deploying the assistant-led Service Provider
Studio onboarding contract:

- PASS main-workspace
  `node --check src/platform/assistant/provider-onboarding-studio.js`
- PASS main-workspace
  `node --test tests/assistant-provider-onboarding-studio-contract.test.js`
  (6/6)
- PASS main-workspace
  `node --test tests/assistant-provider-onboarding-studio-contract.test.js tests/assistant-file-media-intake-contract.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/service-provider-directory.test.js tests/universal-assistant-contract.test.js`
  (59/59)
- PASS clean-worktree
  `node --check src/platform/assistant/provider-onboarding-studio.js`
- PASS clean-worktree
  `node --test tests/assistant-provider-onboarding-studio-contract.test.js tests/assistant-file-media-intake-contract.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/service-provider-directory.test.js tests/universal-assistant-contract.test.js`
  (59/59)
- PASS `npm run railway:doctor` with Railway deployment
  `24301b82-8b71-45e4-b0a9-aa3d2f236cad` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T19-25-10-625Z-live-app-smoke.md`.

`REQ-20260623-017` is deployed and live-smoked.
<!-- addendum-req-017:end -->

<!-- addendum-req-018:start -->
## REQ-20260623-018 Test Results

Recorded after implementing and deploying the parent natural-language
self-service contract:

- PASS main-workspace
  `node --check src/platform/assistant/parent-self-service.js`
- PASS main-workspace
  `node --test tests/assistant-parent-self-service-contract.test.js` (6/6)
- PASS main-workspace
  `node --test tests/assistant-parent-self-service-contract.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-file-media-intake-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/universal-assistant-contract.test.js`
  (47/47)
- PASS clean-worktree
  `node --check src/platform/assistant/parent-self-service.js`
- PASS clean-worktree
  `node --test tests/assistant-parent-self-service-contract.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-file-media-intake-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/universal-assistant-contract.test.js`
  (47/47)
- PASS `npm run railway:doctor` with Railway deployment
  `c8abec9b-5f50-481d-8d5c-7c39714ffa3a` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T19-37-26-570Z-live-app-smoke.md`.

`REQ-20260623-018` is deployed and live-smoked.
<!-- addendum-req-018:end -->

<!-- addendum-req-019:start -->
## REQ-20260623-019 Test Results

Recorded after implementing and deploying the canonical chart/dashboard
configuration contract:

- PASS main-workspace
  `node --check src/platform/assistant/chart-dashboard-config.js`
- PASS main-workspace
  `node --check src/platform/assistant/parent-self-service.js`
- PASS main-workspace
  `node --test tests/assistant-chart-dashboard-config-contract.test.js tests/assistant-parent-self-service-contract.test.js tests/universal-control-plane-scope-policy.test.js`
  (20/20)
- PASS main-workspace
  `node --test tests/assistant-chart-dashboard-config-contract.test.js tests/assistant-parent-self-service-contract.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-file-media-intake-contract.test.js tests/assistant-provider-onboarding-studio-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/universal-assistant-contract.test.js`
  (59/59)
- PASS clean-worktree
  `node --check src/platform/assistant/chart-dashboard-config.js`
- PASS clean-worktree
  `node --check src/platform/assistant/parent-self-service.js`
- PASS clean-worktree
  `node --test tests/assistant-chart-dashboard-config-contract.test.js tests/assistant-parent-self-service-contract.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-file-media-intake-contract.test.js tests/assistant-provider-onboarding-studio-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/universal-assistant-contract.test.js`
  (59/59)
- PASS `npm run railway:doctor` with Railway deployment
  `5196fc2f-1e56-4a6f-a1ff-e44649831540` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T19-51-57-448Z-live-app-smoke.md`.

`REQ-20260623-019` is deployed and live-smoked.
<!-- addendum-req-019:end -->

<!-- addendum-req-020:start -->
## REQ-20260623-020 Test Results

Recorded after implementing and deploying the campaign/segment/drip sequence
control contract:

- PASS main-workspace
  `node --check src/platform/assistant/campaign-control.js`
- PASS main-workspace
  `node --check src/platform/assistant/action-planner.js`
- PASS main-workspace
  `node --check src/lib/actions/actions/operations.js`
- PASS main-workspace
  `node --test tests/assistant-campaign-control-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/action-registry-telegram-ui-bot.test.js`
  (52/52)
- PASS main-workspace
  `node --test tests/assistant-campaign-control-contract.test.js tests/assistant-chart-dashboard-config-contract.test.js tests/assistant-parent-self-service-contract.test.js tests/assistant-draft-versioning-contract.test.js tests/assistant-file-media-intake-contract.test.js tests/assistant-provider-onboarding-studio-contract.test.js tests/assistant-action-planner-contract.test.js tests/universal-control-plane-scope-policy.test.js tests/universal-assistant-contract.test.js tests/action-registry-telegram-ui-bot.test.js`
  (97/97)
- PASS main-workspace parity generators:
  `node scripts/generate-universal-action-parity.mjs` and
  `node scripts/generate-one-time-action-coverage.mjs`
- PASS main-workspace `npm run watchdog:actions` with 0 findings.
- PASS clean-worktree syntax checks for campaign/planner/operations modules.
- PASS clean-worktree focused assistant/action suite (97/97).
- PASS clean-worktree `npm run watchdog:actions` with 0 findings.
- PASS `npm run railway:doctor` with Railway deployment
  `b796a1b9-8de7-43ea-90fb-0f9a87a9304b` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T20-05-05-992Z-live-app-smoke.md`.

`REQ-20260623-020` is deployed and live-smoked.
<!-- addendum-req-020:end -->

<!-- addendum-req-021:start -->
## REQ-20260623-021 Test Results

Recorded after implementing and deploying the natural-language automation
builder contract:

- PASS main-workspace
  `node --check src/platform/assistant/automation-builder.js`
- PASS main-workspace
  `node --test tests/assistant-automation-builder-contract.test.js tests/assistant-action-planner-contract.test.js tests/action-registry-telegram-ui-bot.test.js`
  (45/45)
- PASS main-workspace
  `node --test tests/assistant-*.test.js tests/action-registry-telegram-ui-bot.test.js tests/action-registry-universal-control-plane.test.js`
  (97/97)
- PASS clean-worktree focused assistant/action suite (97/97).
- PASS clean-worktree parity generators:
  `node scripts/generate-universal-action-parity.mjs` reported 22 visible
  controls and 137 registry rows, and
  `node scripts/generate-one-time-action-coverage.mjs` reported 40 controls.
- PASS clean-worktree `npm run watchdog:actions` with 0 findings.
- PASS `npm run railway:doctor` with Railway deployment
  `8006f53f-d12b-4a38-9233-26b9f217d26b` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T20-19-39-519Z-live-app-smoke.md`.

`REQ-20260623-021` is deployed and live-smoked.
<!-- addendum-req-021:end -->

<!-- addendum-req-022:start -->
## REQ-20260623-022 Test Results

Recorded after implementing and deploying the natural-language
ticketing/problem-resolution contract:

- PASS main-workspace
  `node --check src/platform/assistant/problem-resolution.js`
- PASS main-workspace
  `node --check src/lib/actions/actions/operations.js`
- PASS main-workspace
  `node --test tests/assistant-problem-resolution-contract.test.js tests/assistant-action-planner-contract.test.js tests/action-registry-telegram-ui-bot.test.js`
  (45/45)
- PASS main-workspace
  `node --test tests/assistant-*.test.js tests/action-registry-telegram-ui-bot.test.js tests/action-registry-universal-control-plane.test.js`
  (103/103)
- PASS clean-worktree focused problem/planner/action suite (45/45).
- PASS clean-worktree focused assistant/action suite (103/103).
- PASS clean-worktree parity generators:
  `node scripts/generate-universal-action-parity.mjs` reported 22 visible
  controls and 137 registry rows, and
  `node scripts/generate-one-time-action-coverage.mjs` reported 40 controls.
- PASS clean-worktree `npm run watchdog:actions` with 0 findings.
- PASS `npm run railway:doctor` with Railway deployment
  `7cc4fbe0-2d98-4496-b44f-f38e3a4c87e0` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T20-31-58-654Z-live-app-smoke.md`.

`REQ-20260623-022` is deployed and live-smoked.
<!-- addendum-req-022:end -->

<!-- addendum-req-023:start -->
## REQ-20260623-023 Test Results

Recorded after implementing and deploying the unified
reminder/notification contract:

- PASS main-workspace
  `node --check src/platform/assistant/reminder-notifications.js`
- PASS main-workspace
  `node --check src/platform/assistant/action-planner.js`
- PASS main-workspace
  `node --check src/lib/actions/actions/operations.js`
- PASS main-workspace
  `node --test tests/assistant-reminder-notifications-contract.test.js tests/assistant-action-planner-contract.test.js tests/action-registry-telegram-ui-bot.test.js`
  (45/45)
- PASS main-workspace
  `node --test tests/assistant-*.test.js tests/action-registry-telegram-ui-bot.test.js tests/action-registry-universal-control-plane.test.js`
  (109/109)
- PASS clean-worktree focused reminder/planner/action suite (45/45).
- PASS clean-worktree focused assistant/action suite (109/109).
- PASS clean-worktree parity generators:
  `node scripts/generate-universal-action-parity.mjs` reported 22 visible
  controls and 138 registry rows, and
  `node scripts/generate-one-time-action-coverage.mjs` reported 40 controls.
- PASS clean-worktree `npm run watchdog:actions` with 0 findings.
- PASS `npm run railway:doctor` with Railway deployment
  `a811771e-60e1-43f9-902c-70b0865d78ed` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T20-44-13-808Z-live-app-smoke.md`.

`REQ-20260623-023` is deployed and live-smoked.
<!-- addendum-req-023:end -->

<!-- addendum-req-024:start -->
## REQ-20260623-024 Test Results

Recorded after implementing and deploying role/workspace security hardening:

- PASS main-workspace
  `node --check src/platform/assistant/control-plane.js`
- PASS main-workspace
  `node --test tests/universal-control-plane-scope-policy.test.js`
  (10/10)
- PASS main-workspace
  `node --test tests/assistant-*.test.js tests/action-registry-telegram-ui-bot.test.js tests/action-registry-universal-control-plane.test.js tests/universal-control-plane-scope-policy.test.js`
  (119/119)
- PASS clean-worktree scope-policy suite (10/10).
- PASS clean-worktree focused assistant/action suite (119/119).
- PASS clean-worktree `npm run watchdog:actions` with 0 findings.
- PASS `npm run railway:doctor` with Railway deployment
  `6620b95b-0771-4e38-9fb9-1e6c4921e2bd` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T20-53-13-014Z-live-app-smoke.md`.

`REQ-20260623-024` is deployed and live-smoked.
<!-- addendum-req-024:end -->

<!-- addendum-req-025:start -->
## REQ-20260623-025 Test Results

Recorded after implementing and deploying the Operations Assistant Control
Center readback:

- PASS main-workspace `node --check src/platform/assistant/control-center.js`
- PASS main-workspace `node --check server.js`
- PASS main-workspace
  `node --test tests/assistant-control-center-contract.test.js tests/assistant-control-plane-data-model.test.js tests/universal-control-plane-scope-policy.test.js`
  (18/18)
- PASS main-workspace focused assistant/action suite (122/122).
- PASS clean-worktree control-center/data-model/scope suite (18/18).
- PASS clean-worktree focused assistant/action suite (122/122).
- PASS clean-worktree `npm run watchdog:actions` with 0 findings.
- PASS `npm run railway:doctor` with Railway deployment
  `02944240-4c1b-477b-a57f-5f6140e80400` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T21-07-46-763Z-live-app-smoke.md`.
- PASS focused live readback
  `/api/bna/assistant/control-center` returned status 200 and no-write guards.

`REQ-20260623-025` is deployed and live-smoked.
<!-- addendum-req-025:end -->

<!-- addendum-req-026:start -->
## REQ-20260623-026 Test Results

Recorded after final cross-channel QA and return-packet closeout:

- PASS final JSON artifact parse:
  `ops/audits/2026-06-24-telegram-system-truth.json`,
  `ops/audits/2026-06-24-telegram-action-parity.json`,
  `ops/qa-runs/2026-06-24-telegram-end-to-end.json`, and
  `.runtime/telegram-audit/CHATGPT-RETURN-PACKET.json`.
- PASS clean-worktree control-center/data-model/scope suite (18/18).
- PASS clean-worktree focused assistant/action suite (122/122).
- PASS clean-worktree `npm run watchdog:actions` with 0 findings.
- PASS `npm run railway:doctor` with Railway deployment
  `359bd3c5-8cdc-4b70-a2eb-535e03f8d62e` status `SUCCESS`.
- PASS `npm run app:smoke`, report
  `ops/live-smokes/2026-06-23T21-16-19-796Z-live-app-smoke.md`.
- PASS focused live readback
  `/api/bna/assistant/control-center` returned status 200,
  `total_actions=79`, `telegram_ready=79`, `website_ready=79`,
  `blocker_count=0`, and no-write guards.
- PASS `npm run bna:run:validate` with 35 done and 1
  `needs_operator_decision`.
- PASS `npm run bna:run:source-coverage` with 0 unmapped executable
  statements.
- PASS `npm run bna:run:next`; next unblocked executable batch is none.

`REQ-20260623-026` is deployed and live-smoked. Live Telegram sends,
external campaign sends, publishing, charges, DNS/account-owner actions, real
Zoom/Vimeo mutations, and PR merge remain intentionally outside this standard
smoke.
<!-- addendum-req-026:end -->

<!-- integration-navigation-req-001-002:start -->
## REQ-20260624-001 / REQ-20260624-002 Test Results

Integration preflight on branch
`codex/integration-navigation-owner-review-20260624`:

- PASS `npm ci`
- Initial `npm test` failed 1200/1202 because generated action parity hashes
  were stale after merging PR #12 and PR #13.
- PASS regenerated `ops/action-registry/one-time-action-coverage.*`.
- PASS regenerated `ops/action-registry/universal-action-parity.*`.
- PASS `node --test tests/watchdog-action-registry.test.js` 5/5.
- Initial `npm run watchdog:links` returned 7 medium route-registry findings
  for `/parent.html`, `/student.html`, and `/one-time-classroom.html` aliases.
- PASS after registering the aliases in `ops/route-registry.json`:
  `npm run watchdog:links` 0 findings.
- PASS `npm run watchdog:actions` 0 findings.
- PASS `npm run watchdog:security` 0 findings.
- PASS final `npm test` 1202/1202.
- PASS `npm run secrets:audit` with 4191 tracked paths checked and 0 tracked
  secret-risk files found.

Blocked check:

- `.github/workflows/credential-free-ci.yml` could not be pushed because the
  GitHub OAuth app lacks `workflow` scope.
<!-- integration-navigation-req-001-002:end -->

<!-- integration-navigation-req-003:start -->
## REQ-20260624-003 Test Results

Route inventory baseline on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- PASS `npm run owner-review:routes`
- PASS `node --test tests/owner-review-route-inventory.test.js`
- PASS pushed commit
  `094ca7c6634b3ade13d158e15b0716907c367d3a` to
  `origin/codex/integration-navigation-owner-review-20260624`

The generator output reports 0 missing implementation rows. It intentionally
leaves 44 customer-facing orphan-review rows and 26 duplicate implementation
groups for `REQ-20260624-004`.
<!-- integration-navigation-req-003:end -->

<!-- integration-navigation-req-004:start -->
## REQ-20260624-004 Test Results

Navigation repair/classification on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- PASS `npm run owner-review:routes`:
  689 routes, 34 HTML pages, 0 orphan-review rows
- PASS focused route/provider/public suite:
  `node --test tests\ui-01-public-operations-shell.test.js tests\public-helper-bot-landing-sodas.test.js tests\public-route-privacy-contract.test.js tests\service-provider-directory.test.js tests\signup-permissions-mobile-homepage.test.js`
  (36/36)
- PASS full suite: `npm test` (1203/1203)
- PASS `npm run secrets:audit`:
  4198 tracked paths checked, 0 tracked secret-risk files found
- PASS `npm run watchdog:links`: 0 findings
- PASS `npm run watchdog:actions`: 0 findings
- PASS `npm run watchdog:security`: 0 findings
- PASS pushed commit
  `e4378c31c7d70f7d3c2c8505d3907ff29d7e2a5f` to
  `origin/codex/integration-navigation-owner-review-20260624`
<!-- integration-navigation-req-004:end -->

<!-- integration-navigation-req-005:start -->
## REQ-20260624-005 Test Results

Canonical One Time journey on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- PASS `npm run one-time:smoke:canonical-journey-local`
  - local server ran with `ONE_TIME_REVIEW_ONLY_NO_DB=1`
  - verified `/one-time` -> `/rabbi-member`, alias redirects, desktop/mobile
    member home, library, classroom, and logout state clearing
- PASS focused contracts:
  `node --test tests\one-time-canonical-journey.test.js tests\one-time-product-system.test.js tests\public-route-privacy-contract.test.js tests\live-class-infrastructure.test.js tests\owner-review-route-inventory.test.js`
  (23/23)
- PASS full suite: `npm test` (1207/1207)
- PASS `npm run owner-review:routes`:
  689 routes, 34 HTML pages, 0 orphan-review rows
- PASS `npm run secrets:audit`:
  4198 tracked paths checked, 0 tracked secret-risk files found
- PASS `npm run watchdog:links`: 0 findings
- PASS `npm run watchdog:actions`: 0 findings
- PASS `npm run watchdog:security`: 0 findings
- PASS pushed commit
  `3375c9fe33e3eb7efe6e0333067265e6d3429756` to
  `origin/codex/integration-navigation-owner-review-20260624`
<!-- integration-navigation-req-005:end -->

<!-- integration-navigation-req-006:start -->
## REQ-20260624-006 Test Results

Integrated information architecture on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- PASS `npm run owner-review:routes`:
  689 routes, 34 HTML pages, 0 orphan-review rows
- PASS focused IA/privacy suite:
  `node --test tests\ui-01-public-operations-shell.test.js tests\public-route-privacy-contract.test.js tests\signup-permissions-mobile-homepage.test.js tests\workspace-person-household-provider-contract.test.js tests\owner-review-route-inventory.test.js`
  (27/27)
- Initial full `npm test` failed only because the universal action parity hash
  was stale after visible navigation changes.
- PASS `node scripts\generate-universal-action-parity.mjs`:
  22 visible controls, 138 registry rows
- PASS `node --test tests\watchdog-action-registry.test.js` (5/5)
- PASS full suite: `npm test` (1207/1207)
- PASS `npm run owner-review:routes`:
  689 routes, 34 HTML pages, 0 orphan-review rows
- PASS `npm run secrets:audit`:
  4213 tracked paths checked, 0 tracked secret-risk files found
- PASS `npm run watchdog:links`: 0 findings
- PASS `npm run watchdog:actions`: 0 findings
- PASS `npm run watchdog:security`: 0 findings
- PASS pushed commit
  `ca49a1404ab619dc37319ad2f6108049e9c2f347` to
  `origin/codex/integration-navigation-owner-review-20260624`
<!-- integration-navigation-req-006:end -->

<!-- integration-navigation-req-007:start -->
## REQ-20260624-007 Test Results

Shared website assistant visibility on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- PASS focused assistant/portal/One Time/provider route contracts:
  `node --test tests\universal-assistant-contract.test.js tests\assistant-portal-communications-contract.test.js tests\public-route-privacy-contract.test.js tests\one-time-canonical-journey.test.js tests\parent-student-portal-contract.test.js tests\service-provider-directory.test.js`
  (66/66)
- PASS `npm run owner-review:routes`:
  689 routes, 34 HTML pages, 0 orphan-review rows
- PASS `node scripts\generate-universal-action-parity.mjs`:
  22 visible controls, 138 registry rows
- PASS `node scripts\generate-one-time-action-coverage.mjs`:
  40 controls
- PASS `node --check server.js`
- PASS `node --check public\js\bna-bot-widget.js`
- PASS `npm run one-time:smoke:canonical-journey-local`
- PASS full suite: `npm test` (1208/1208)
- PASS `npm run secrets:audit`:
  4216 tracked paths checked, 0 tracked secret-risk files found
- PASS `npm run watchdog:links`: 0 findings
- PASS `npm run watchdog:actions`: 0 findings
- PASS `npm run watchdog:security`: 0 findings
- PASS pushed commit
  `d853b9205626e6ea50bd3b639b7718b1f374040d` to
  `origin/codex/integration-navigation-owner-review-20260624`
<!-- integration-navigation-req-007:end -->
