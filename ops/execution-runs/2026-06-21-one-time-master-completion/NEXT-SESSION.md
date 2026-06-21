# Next Session

Continue `REQ-20260619-303`: workspace users and roles. Exact next command:

```powershell
npm run bna:run:next
```

Then implement Batch 4:

- complete workspace membership model;
- scope Rabbi Ellie Scheller to One Time only;
- retain Shloimie platform super-admin and intentional workspace switching;
- implement scoped Users screen and role/member management actions;
- add negative authorization tests for cross-workspace users, tasks, Decisions,
  messages, and recordings.

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

<!-- batch-3:start -->
## Batch 3 Handoff

Production cleanup has already been applied through reversible task APIs:

- 5 One Time records re-scoped into One Time.
- 1 internal handoff card quarantined.
- 139 non-private duplicate One Time pending fan-out records archived against a canonical task.
- Final live census shows workspace isolation passed.

Batch 3 is deployed and live-verified. Continue to Batch 4.
<!-- batch-3:end -->
