# Next Session

Continue `REQ-20260621-502`: visible action coverage and no-dead-buttons
deployment/live verification. The implementation is locally verified; commit,
push, deploy, and live-smoke the app-visible Operations changes. Exact next
command:

```powershell
npm run bna:run:validate
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

<!-- batch-4:start -->
## Batch 4 Handoff

Workspace user and role implementation is deployed and live-verified:

- Implementation/deployed commit: `c8d93646`
- Railway deployment: `04fde749-fca1-4e54-a7c4-f2ece847847b`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`
- Focused workspace-user live smoke:
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`

Continue automatically with Batch 5 action coverage.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Handoff

Visible action coverage is locally verified but not yet deployed in this
handoff state.

Exact next commands:

```powershell
npm run bna:run:validate
node scripts/audit-secrets.mjs
git diff --check
```

Then commit, push, deploy, and run standard plus focused live action coverage
smokes.
<!-- batch-5:end -->
