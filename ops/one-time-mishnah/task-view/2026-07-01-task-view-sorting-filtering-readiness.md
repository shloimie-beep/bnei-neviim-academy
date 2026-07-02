# One Time Task View Sorting/Filtering Readiness

Date: 2026-07-01

Requirement: REQ-20260701-716

## Result

Local implementation is complete. Operations task cards now prioritize newest active work by last activity/update time, push terminal/history records below active work, and keep workspace/project/owner signals visible on each card/detail view.

## Scope

- Updated client task sorting in `public/operations.html`.
- Updated the `/api/bna/tasks` query ordering in `server.js`.
- Added provider-scoped visibility helpers so One Time project-scoped users do not see internal Codex/system-only task cards unless they are explicitly shared with provider scope or require Rabbi/provider/external action.
- Kept super-admin behavior broad: Shloimie/global operators can still see all relevant One Time workspace work with owner/project filters.

## Verification

- PASS: `node --check server.js`
- PASS: `node --test tests\workspace-task-no-stale-agent.test.js tests\operations-task-queue-visibility.test.js tests\operations-task-comments-and-dictation.test.js tests\one-time-operations-ui-smoke.test.js`
- PASS: route/action registry JSON parse

## Guardrails

- No deploy or live smoke was run.
- No DNS, email, WhatsApp, Stripe, Railway, database, or external provider mutation was performed.
- No raw private task/contact/student/parent data was written into this evidence file.

## Remaining Blocker

This is app-visible Operations UI work. Final done status still requires deploy/live smoke evidence in the release batch after the One Time Railway/deploy target is available.
