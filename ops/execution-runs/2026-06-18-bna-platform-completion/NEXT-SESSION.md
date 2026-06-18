# Next Session

Updated: 2026-06-19T03:35:30+03:00

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

Exact next requirement:

- REQ-20260618-124 / BNA-WS-002: Scope applicable entities by workspace_id.

Blocked requirement intentionally skipped:

- REQ-20260618-156 / BNA-STUDENT-002 remains `needs_operator_decision` because duplicate Menachem cleanup requires production/student data merge approval after safe local dry-run evidence. Do not mutate production data without explicit operator approval.

Exact next command:

```powershell
npm run bna:run:status
rg -n "workspace_id|selectedProjectFilter|project_id" server.js public/operations.html tests
node --test tests/workspace-schema.test.js tests/workspace-scope.test.js tests/operations-workspace-selector.test.js tests/workspace-auth.test.js tests/workspace-http-isolation.test.js
```

Then inspect whether any workspace-owned entity routes remain unscoped locally. Do not close live-required workspace items as `done` without release approval, deployment, and live-smoke evidence.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering is inspected and either closed locally where non-live or left live-gated with explicit evidence.
- REQ-20260618-125 through REQ-20260618-155 and REQ-20260618-157 through REQ-20260618-167 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- REQ-20260618-156 remains `needs_operator_decision` for duplicate-student cleanup approval.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
