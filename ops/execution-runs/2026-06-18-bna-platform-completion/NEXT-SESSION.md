# Next Session

Updated: 2026-06-18T20:14:02+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-124 partial implementation: workspace schema, idempotent migration columns/indexes, default workspace seeds, legacy backfills, primary write-path `workspace_id` inheritance, API route filtering, HTTP isolation, and Operations UI selected-workspace enforcement.
- REQ-20260618-125 local implementation moved to `needs_verification`: shared scoped-route authorization helper, direct task-row access guard, workspace-inheriting task comments, internal route denial, and HTTP isolation tests with mocked cross-workspace rows.
- REQ-20260618-126 local implementation moved to `needs_verification`: super-admin workspace selector, ordinary scoped-user locked workspace context, selected workspace task loading, scoped task project locking, and workspace metadata in `/api/bna/projects`.
- REQ-20260618-127 is `in_progress`: task/content project filter cleanup now runs on workspace selector changes, but student/content/helper context resets remain open.

Exact next requirement:

- REQ-20260618-127 / BNA-WS-005: Clear stale context on workspace changes.

Exact next command:

```powershell
npm run bna:run:status
rg -n "setWorkspaceProject|selectedStudentId|selectedContentJobIds|expandedContentJobIds|expandedPromptKey|contentSection|studentSection|helper|context" public\operations.html tests
```

Then finish workspace-change stale-context cleanup: clear selected student, content selections/expanded state, module subsection state, and helper/context state when a super-admin changes workspace; keep ordinary scoped users locked to their workspace.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125 remains `needs_verification` until final audit/live smoke.
- REQ-20260618-126 remains `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke.
- REQ-20260618-127 remains `in_progress` until all stale workspace context is cleared and tested.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
