# Next Session

Updated: 2026-06-18T20:24:59+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-126 local implementation moved to `needs_verification`: super-admin workspace selector, ordinary scoped-user locked workspace context, selected workspace task loading, scoped task project locking, and workspace metadata in `/api/bna/projects`.
- REQ-20260618-127 local implementation moved to `needs_verification`: workspace selector changes clear stale module, student, content selection, prompt, task modal, URL, and filter context before reloading scoped data.
- REQ-20260618-128 local implementation moved to `needs_verification`: one compact ordered horizontal module toolbar in the Operations main shell.
- REQ-20260618-129 local implementation moved to `needs_verification`: sidebar reduced to workspace context and normal scoped users avoid global workspace UI.

Exact next requirement:

- REQ-20260618-130 / BNA-OPS-003: Prevent unexpected page collapse/minimize.

Exact next command:

```powershell
npm run bna:run:status
rg -n "collapse|minimize|height|overflow|display: none|drawer-open|section-nav|container|empty-state" public\operations.html tests
```

Then inspect layout/collapse behavior and implement stable dimensions/overflow safeguards so pages do not unexpectedly collapse or minimize across module switches and responsive breakpoints.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125 through REQ-20260618-129 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
