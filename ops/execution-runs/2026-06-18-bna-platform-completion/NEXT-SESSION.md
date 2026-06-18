# Next Session

Updated: 2026-06-18T20:02:08+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-124 partial implementation: workspace schema, idempotent migration columns/indexes, default workspace seeds, legacy backfills, and primary write-path `workspace_id` inheritance.
- REQ-20260618-125 local implementation moved to `needs_verification`: shared scoped-route authorization helper, direct task-row access guard, workspace-inheriting task comments, internal route denial, and HTTP isolation tests with mocked cross-workspace rows.
- REQ-20260618-170 local backend/API negative tests moved to `needs_verification` for current scoped-user surfaces.

Exact next requirement:

- REQ-20260618-126 / BNA-WS-004: Clear super-admin selector and ordinary-user behavior.

Exact next command:

```powershell
npm run bna:run:status
rg -n "workspace|project|selector|currentProject|projectFilter|workspace" public\operations.html server.js tests
```

Then inspect the Operations shell and implement super-admin workspace selection plus minimal/absent ordinary-user selector behavior without exposing global workspace directory UI to scoped users.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until UI selected-workspace enforcement, release approval, and live smoke are complete.
- REQ-20260618-125 remains `needs_verification` until final audit/live smoke.
- REQ-20260618-170 remains `needs_verification` until final acceptance sweep.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
