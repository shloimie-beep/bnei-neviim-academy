# Next Session

Updated: 2026-06-18T23:54:00+03:00

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

Exact next requirement:

- REQ-20260618-151 / BNA-ACCOUNTING-001: Workspace payment/accounting scoping and safe actions.

Exact next command:

```powershell
npm run bna:run:status
rg -n "payment|payments|accounting|signups|payment-intake|payment-reminders|green-invoice|workspace_id|workspace|project|selectedProjectFilter|confirm|SEND_REMINDERS|reconcile|safe" server.js public\operations.html scripts tests src\lib\bna
```

Then inspect accounting/payment endpoints and Operations actions so payment reads/writes preserve workspace scoping and dangerous actions require explicit confirmations.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125 through REQ-20260618-150 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
