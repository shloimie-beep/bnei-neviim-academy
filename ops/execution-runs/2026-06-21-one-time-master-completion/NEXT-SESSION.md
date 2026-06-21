# Next Session

Continue `REQ-20260619-302`: commit, push, deploy, and live-smoke the
Batch 3 Task/Decision cleanup and default-view changes. Exact next command:

```powershell
npm run bna:run:validate
```

Then run focused checks and publish the coherent Batch 3 commit:

- `node --test tests/task-decision-census.test.js tests/task-decision-production-cleanup.test.js tests/operations-task-queue-visibility.test.js tests/operations-task-comments-and-dictation.test.js tests/workspace-task-no-stale-agent.test.js tests/telegram-ramble-routing-regression.test.js`
- `git diff --check`
- `node scripts/audit-secrets.mjs`
- commit and push via the PR worktree
- deploy app-visible changes
- run live Task/Decision and Operations smoke checks
- mark `REQ-20260619-302` done after deployed/live evidence is recorded

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

The remaining Batch 3 work is app delivery evidence only: commit, push, deploy,
live smoke, then continue to Batch 4.
<!-- batch-3:end -->
