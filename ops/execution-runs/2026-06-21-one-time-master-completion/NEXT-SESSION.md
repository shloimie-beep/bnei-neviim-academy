# Next Session

Continue `REQ-20260621-501`: refresh the One Time master backlog
reconciliation. Exact next command:

```powershell
npm run bna:run:resume
```

Then inspect and reconcile:

- `ops/one-time-mishnah/master-backlog-reconciliation.md`
- `ops/one-time-mishnah/master-backlog-reconciliation.json`
- `ops/one-time-mishnah/next-master-backlog-input.md`
- `ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md`
- `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json`
- `tasks-pending/*`
- `raw-input/*`
- current requirements, tests, migrations, production-safe evidence, and open PR context

Do not run external sends, billing, DNS, real Zoom meeting creation, real Vimeo
upload/publication, hard deletes, or PR merge.

<!-- batch-2:start -->
## Batch 2 Handoff

Batch 2 is locally verified. Continue with `REQ-20260619-302` / `batch-3`: production Task and Decision census, backup/export, dry-run cleanup plan, reversible archive/quarantine workflow, scoped default views, and tests.

Exact next command:

```powershell
npm run bna:run:next
```
<!-- batch-2:end -->
