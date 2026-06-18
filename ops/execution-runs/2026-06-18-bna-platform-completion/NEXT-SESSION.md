# Next Session

Updated: 2026-06-19T00:44:30+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-126 through REQ-20260618-135 have local Operations shell/workspace/navigation/layout/header/design/mobile-control/desktop-grid/accessibility implementations and focused tests.
- REQ-20260618-132: semantic Operations design tokens and shared high-contrast surface/button/type/focus primitives are implemented.
- REQ-20260618-133: touch-safe mobile target sizing, scrollable dense controls, and reachable modal action footers are implemented.
- REQ-20260618-134: desktop dashboard, task, pipeline, content, and student grids use balanced auto-fit/readable minmax tracks.
- REQ-20260618-135: task modal semantics/focus, explicit labels, keyboard-activatable cards, pressed/current filter state, and disabled/sr-only primitives are implemented.
- REQ-20260618-136: canonical task states are implemented across schema/migration, API create/filter/update paths, queue filters, and Operations UI with legacy alias compatibility.
- REQ-20260618-137: task cards and modal now separate owner/status/urgency/due/blocker/provenance from visible titles, with blocker_reason stored in the task schema/API.
- REQ-20260618-138: high-confidence task intake auto-files, low-confidence task-like intake becomes a Decision with routing choices, and no separate visible Review Queue lane was introduced.
- REQ-20260618-139: internal scoped Calendar aggregates task due/planned dates, class sessions, accountability check-ins/events, and group goal due dates without external sync controls.
- REQ-20260618-140: stale worker/agent diagnostics, heartbeat/status panels, Changelog Queue wording, proof-gap concepts, and client-side agent-fleet status fetches are removed from the main task UI while Changelog remains as an activity lane.
- REQ-20260618-141: task overview counts now derive from the visible scoped task buckets and blocked counts link to visible blocked records with blocker explanations.
- REQ-20260618-142: mixed-recording parser records now use deterministic source item keys, workspace-scoped student matching, and upsert behavior so repeated parses do not duplicate tasks, accountability events, group-goal entries, or timer notes.
- REQ-20260618-143: Community/Contacts now loads signups through an explicit workspace project filter, returns workspace labels, and displays the active/contact workspace context in Operations.
- REQ-20260618-144: Content/class-session extraction now filters task, meeting, accountability, progress, timer, and parser-review material so reusable Content stays teaching/research oriented.
- REQ-20260618-145: Content jobs now return scoped workspace/project metadata, transcript/parse/output/approval/provenance fields, and Operations cards visibly render workspace, source, transcript, output, approval, and provenance details.
- REQ-20260618-146: Drive intake/routing now resolves workspace-specific folder config, rejects known folder/workspace mismatches, scopes content bundles by workspace, and blocks mixed-workspace combined outputs.
- REQ-20260618-147: Class sessions now support direct workspace project filtering and the Calendar class-session feed remains selected-workspace scoped.
- REQ-20260618-148: Automations now expose workspace-scoped status rows for payment reminders, Green Invoice webhooks, content Drive intake, and Codex task automation, with owner/status/last run/next run/failure reason and an Operations Automations module.
- REQ-20260618-149: Integrations now expose Buffer social target statuses for Facebook, LinkedIn, and YouTube with Connected/Not connected/Error state, account identity, last check, needed action, and an Operations Integrations module.
- REQ-20260618-150: Users now expose scoped project-member user/role rows and workspace invitation records through read-only APIs and an Operations Users module.
- REQ-20260618-151: Accounting/payment reads now carry workspace project filters, accounting mutations require explicit confirmations and scoped record checks, Green Invoice matching is constrained to BNA school workspace, and Operations Accounting sends the selected workspace through payment/reminder/intake/webhook actions.
- REQ-20260618-152: Student/detail isolation now scopes student, device, Goal Board, accountability, group-goal, and Torah-learning reads/writes by selected/scoped workspace and student ID where applicable.
- REQ-20260618-153: Goal Board controls now use plain product language for tablet access and goal actions, with horizontal purpose toolbars for setup, progress, review, board, and tablet actions.
- REQ-20260618-154: Goal Board cards now render in separate Current Goals, Progress / Check-ins, Approvals, and History lanes instead of one mixed list.
- REQ-20260618-155: Student Portal Hebrew mode now localizes dynamic goal cards, command cards, tablet access statuses, dates, statuses, empty/filter labels, buttons, save/error messages, and applies RTL-specific layout behavior.
- REQ-20260618-157: Operations now has one BNA Assistant shell/status surface, one Assistant toolbar module, one read-only `/api/bna/assistant/status` route, and scoped GET-only access without duplicate Codex/Kimi/helper visible personas.
- REQ-20260618-158: Assistant memory now has a scoped `bna_assistant_memory` table, exact workspace/project/user/role/surface/module/subject read API, shared workspace-auth access, and Operations Memory Scope visibility.

Exact next requirement:

- REQ-20260618-159 / BNA-HELPER-003: Permissioned backend action registry.

Blocked requirement intentionally skipped:

- REQ-20260618-156 / BNA-STUDENT-002 remains `needs_operator_decision` because duplicate Menachem cleanup requires production/student data merge approval after safe local dry-run evidence. Do not mutate production data without explicit operator approval.

Exact next command:

```powershell
npm run bna:run:status
rg -n "assistant|helper|action|registry|permission|confirm|audit|tool|POST|mutat|safe|status|memory" server.js public\\operations.html src\\lib\\bna tests .env.example
```

Then inspect the Assistant shell, existing safe-action/accounting confirmation patterns, and route registry expectations. Implement a permissioned backend action registry that lists what the Assistant may call, keeps mutation execution disabled until confirmation/audit requirements are implemented, and does not create duplicate helper identities.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125 through REQ-20260618-155 and REQ-20260618-157 through REQ-20260618-158 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- REQ-20260618-156 remains `needs_operator_decision` for duplicate-student cleanup approval.
- REQ-20260618-159 through REQ-20260618-162 remain open for helper action registry, confirmation tiers/audit logs, duplicate dev-language cleanup, and public/authenticated memory-leak prevention.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
