# Next Session

Updated: 2026-06-18T20:18:55+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-124 partial implementation: workspace schema, idempotent migration columns/indexes, default workspace seeds, legacy backfills, primary write-path `workspace_id` inheritance, API route filtering, HTTP isolation, and Operations UI selected-workspace enforcement.
- REQ-20260618-125 local implementation moved to `needs_verification`: shared scoped-route authorization helper, direct task-row access guard, workspace-inheriting task comments, internal route denial, and HTTP isolation tests with mocked cross-workspace rows.
- REQ-20260618-126 local implementation moved to `needs_verification`: super-admin workspace selector, ordinary scoped-user locked workspace context, selected workspace task loading, scoped task project locking, and workspace metadata in `/api/bna/projects`.
- REQ-20260618-127 local implementation moved to `needs_verification`: workspace selector changes clear stale module, student, content selection, prompt, task modal, URL, and filter context before reloading scoped data.

Exact next requirement:

- REQ-20260618-128 / BNA-OPS-001: Ordered horizontal Operations module toolbar.

Exact next command:

```powershell
npm run bna:run:status
rg -n "MAIN_NAV_ITEMS|ops-sidebar|section-nav|nav-tabs|toolbar|module" public\operations.html tests
```

Then inspect the Operations shell and implement one compact ordered module toolbar without redundant top-level clutter, preserving scoped workspace behavior and mobile safety.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125, REQ-20260618-126, and REQ-20260618-127 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
