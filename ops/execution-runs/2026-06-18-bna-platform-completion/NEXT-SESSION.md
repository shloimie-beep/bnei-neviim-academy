# Next Session

Updated: 2026-06-18T19:54:44+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-124 partial implementation: workspace schema, idempotent migration columns/indexes, default workspace seeds, legacy backfills, and primary write-path `workspace_id` inheritance.
- REQ-20260618-125 partial implementation: shared scoped-route authorization helper, direct task-row access guard, workspace-inheriting task comments, and negative helper tests proving scoped users cannot enumerate students/accounting/content or access a BNA task by changing ID.

Exact next requirement:

- Continue REQ-20260618-125 / BNA-WS-003: add direct HTTP/API tests with seeded cross-workspace data and any missing per-route workspace filters.

Exact next command:

```powershell
npm run bna:run:status
node --test tests/workspace-auth.test.js tests/workspace-schema.test.js
```

Then implement request-level tests or route filters for the remaining workspace-owned modules before moving to REQ-20260618-126.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until API filters, UI selected-workspace enforcement, release approval, and live smoke are complete.
- REQ-20260618-125 remains `in_progress` until HTTP/API-level negative tests cover all affected entities/users/accounting records.
- REQ-20260618-170 remains `in_progress` until full backend negative isolation tests use seeded cross-workspace data.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
