# Next Session

Updated: 2026-06-19T05:15:30+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-165: Signup pages, signup thank-you, and parent manifest now use direct parent signup/self-governance messaging and consistently say parent app access is six months free.
- REQ-20260618-166: Portal header identity coverage now spans public/provider, parent signup launch, Student Portal, Operations shell, and Operations login while preserving manifest separation.
- REQ-20260618-167: Public/blog/FAQ/signup/student routes and CTAs now use clean public aliases and stay out of the private Operations shell.
- REQ-20260618-168: Guarded TEST-BNA-SEED plan/seed/cleanup commands now cover the required isolated fixture lanes with safety rails and tests.
- REQ-20260618-169: Focused Playwright acceptance coverage now exercises Operations route/history, responsive overflow, workspace selector scoping, Assistant context, student detail routing, and Student Portal Hebrew RTL.
- REQ-20260618-170: Backend/API/RBAC negative tests are locally terminal with route guard, real HTTP middleware, users, and accounting scope coverage.
- REQ-20260618-114: Source-of-truth files now describe the active recovery run, audit-only blockers, first-party Operations runtime direction, release gate, and exact resume path.
- REQ-20260618-124: Workspace-owned entity scoping is locally implemented through schema/backfill/create-path foundations plus hardened content job, bundle, output, prompt-example, mixed-recording, and Operations content write-path project checks.
- REQ-20260618-111: Safe test data and complete acceptance coverage parent rollup is locally closed because REQ-168, REQ-169, REQ-170, and REQ-171 are terminal with evidence and the combined acceptance set passed.
- REQ-20260618-101: Audit harness/audit package parent is terminally blocked on authenticated audit package/output only; its non-audit/protocol children are closed and this blocker does not pause unrelated local work.
- REQ-20260618-126: Operations workspace selector behavior has refreshed browser proof for a scoped One Time ordinary user: locked workspace context, no global selector, One Time task/calendar API calls, and mobile overflow safety. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-127: Workspace switching has refreshed static and browser proof for stale module/filter/student/content/helper reset. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-128: Operations module toolbar now has static and browser DOM proof for full super-admin order, scoped allowedViews filtering, and responsive overflow safety. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-129: Operations sidebar/workspace navigation now has static and browser DOM proof that the sidebar is workspace context only, module navigation is not duplicated, and scoped users do not see global workspace directory UI. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-130: Operations shell stability now has static and browser proof that the shell/view frame stay non-collapsed after viewport, module, history, workspace switch, and refresh changes. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-131: Portal/header identity now has static and browser DOM proof for Operations private manifest/logo/identity/language and Student Portal logo/identity/language controls. It remains needs_verification only for release approval, deploy, and live smoke.

Exact next requirement:

- REQ-20260618-132 / BNA-DESIGN-001: Shared high-contrast card/spacing/type/button system.

Blocked requirement intentionally skipped:

- REQ-20260618-156 / BNA-STUDENT-002 remains `needs_operator_decision` because duplicate Menachem cleanup requires production/student data merge approval after safe local dry-run evidence. Do not mutate production data without explicit operator approval.
- REQ-20260618-101 / audit parent remains `blocked` until the authenticated audit ZIP/output path is available. Do not start a new baseline crawl.

Exact next command:

```powershell
npm run bna:run:status
node --test tests/operations-design-system.test.js tests/operations-layout-stability.test.js tests/browser-acceptance.test.js
```

Then inspect whether `REQ-20260618-132` needs only refreshed local evidence or an additional browser/DOM assertion for shared high-contrast surfaces, spacing, type, buttons, and focus states. Do not close live-required design items as `done` without release approval, deployment, and live-smoke evidence.

Still open after this batch:

- REQ-20260618-124 through REQ-20260618-131 remain `needs_verification` because local implementation and tests pass, but release approval, deployment, and live smoke are still pending.
- REQ-20260618-132 through REQ-20260618-155 and REQ-20260618-157 through REQ-20260618-167 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- REQ-20260618-156 remains `needs_operator_decision` for duplicate-student cleanup approval.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
