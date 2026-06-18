# Next Session

Updated: 2026-06-19T01:45:30+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-161: Assistant and task-routing visible copy now uses one assistant identity and System Work product labels while preserving internal Codex owner values for compatibility.
- REQ-20260618-162: Assistant memory now blocks public/no-auth access, requires Assistant plus context-specific views, redacts raw user keys from client scope, and sends private no-store responses.
- REQ-20260618-163: Public primary navigation and shared public nav/content scripts are guarded against advertising private Operations login while `/operations` remains a private app route.

Exact next requirement:

- REQ-20260618-164 / BNA-PUBLIC-002: Provider CTA: Advertise your program for free.

Blocked requirement intentionally skipped:

- REQ-20260618-156 / BNA-STUDENT-002 remains `needs_operator_decision` because duplicate Menachem cleanup requires production/student data merge approval after safe local dry-run evidence. Do not mutate production data without explicit operator approval.

Exact next command:

```powershell
npm run bna:run:status
rg -n "Advertise your program|provider|program|free|list|listing|community|service" public content-memory tests server.js
```

Then inspect public/provider/community copy and implement the service-provider CTA wording: Advertise your program for free, with clear free listing expectations.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125 through REQ-20260618-155 and REQ-20260618-157 through REQ-20260618-163 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- REQ-20260618-156 remains `needs_operator_decision` for duplicate-student cleanup approval.
- REQ-20260618-164 through REQ-20260618-169 remain open for public copy/routes and acceptance-test coverage.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
