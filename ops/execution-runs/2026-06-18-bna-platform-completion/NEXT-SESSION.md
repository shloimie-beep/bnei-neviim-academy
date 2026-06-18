# Next Session

Updated: 2026-06-19T01:20:30+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-155: Student Portal Hebrew mode localizes dynamic goal cards, command cards, tablet access statuses, dates, statuses, empty/filter labels, buttons, save/error messages, and applies RTL-specific layout behavior.
- REQ-20260618-157: Operations now has one BNA Assistant shell/status surface, one Assistant toolbar module, one read-only `/api/bna/assistant/status` route, and scoped GET-only access without duplicate Codex/Kimi/helper visible personas.
- REQ-20260618-158: Assistant memory now has a scoped `bna_assistant_memory` table, exact workspace/project/user/role/surface/module/subject read API, shared workspace-auth access, and Operations Memory Scope visibility.
- REQ-20260618-159: Assistant actions now have a permissioned backend registry, scoped read-only `/api/bna/assistant/actions` route, guarded execution endpoint, and Operations Action Registry visibility without execution buttons.
- REQ-20260618-160: Assistant action execution now has confirmation tiers, `bna_assistant_action_audit`, audited confirmation_required/denied/executed/failed outcomes, and explicit registered handlers for read-only, task-create, and task-comment actions.
- REQ-20260618-161: Assistant and task-routing visible copy now uses one assistant identity and System Work product labels while preserving internal Codex owner values for compatibility.

Exact next requirement:

- REQ-20260618-162 / BNA-HELPER-006: Prevent public/authenticated memory leakage.

Blocked requirement intentionally skipped:

- REQ-20260618-156 / BNA-STUDENT-002 remains `needs_operator_decision` because duplicate Menachem cleanup requires production/student data merge approval after safe local dry-run evidence. Do not mutate production data without explicit operator approval.

Exact next command:

```powershell
npm run bna:run:status
rg -n "public|authenticated|memory|assistant|helper|user_key|workspace_id|project_id|surface|public helper|auth|login|operations_user" server.js public tests src\lib\bna
```

Then inspect Assistant memory routes, public/login surfaces, scoped route access, and UI context rendering for public/authenticated memory leakage. Implement exact isolation checks and tests without calling OpenAI or mutating production data.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125 through REQ-20260618-155 and REQ-20260618-157 through REQ-20260618-161 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- REQ-20260618-156 remains `needs_operator_decision` for duplicate-student cleanup approval.
- REQ-20260618-162 remains open for public/authenticated memory-leak prevention.
- REQ-20260618-163 through REQ-20260618-169 remain open for public copy/routes and acceptance-test coverage.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
