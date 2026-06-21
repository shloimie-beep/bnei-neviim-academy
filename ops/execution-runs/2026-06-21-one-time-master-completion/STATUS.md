# Status

Status as of 2026-06-21T11:24:48+03:00.

Batch 0 and Batch 1 are done locally. The successor run is the single active
run. The execution CLI now validates structured requirements, reports the next
unblocked batch, lists external blockers, reports source coverage, and detects
stale evidence. The next executable batch is `REQ-20260621-501`, master backlog
reconciliation.

<!-- batch-2:start -->
## Batch 2 - Master Backlog Reconciliation

Status: done / verified local

Updated `ops/one-time-mishnah/master-backlog-reconciliation.md` and `ops/one-time-mishnah/master-backlog-reconciliation.json` for the June 21 active run. No visible Task fan-out, production mutation, external write, or app runtime change was performed.

Next unblocked batch after verification: `REQ-20260619-302` production Task and Decision cleanup.
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 - Production Task And Decision Cleanup

Status: done / deployed / verified live

Created the live production Task/Decision census and reversible cleanup tooling.
Applied only reversible production changes through existing authenticated task
APIs: One Time task re-scopes, one internal handoff quarantine, and
non-private duplicate fan-out archive actions. No hard deletes and no
parent/student/payment/communication records were mutated.

Final post-cleanup census:

- Tasks seen: 864
- Lane counts: Decisions 16, Blocked 14, Tasks 406, Calendar 18, Codex Queue 6, Completed/Activity 404
- Duplicate groups remaining in dry-run plan: 12
- Workspace isolation: 0 BNA records in One Time, 0 One Time records in BNA

The Operations UI/server changes for default Task and Decision views are
deployed in Railway deployment `89967278-38dc-49f3-a70d-4536c59f82f6` at
commit `f8a2fd62` and verified by standard plus focused live smokes.

Next unblocked batch: `REQ-20260619-303` workspace users and roles.
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 - Workspace Users And Roles

Status: implemented / verified local / pending deployment

The canonical One Time role model now includes platform, workspace, and member
roles; Rabbi Ellie Scheller is the public-facing One Time owner/admin identity
with legacy aliases preserved; and Shloimie retains platform super-admin plus
One Time workspace admin/manager access.

The Operations Users screen now has real no-send workspace-user actions for Add
Member / Invite User, Assign Role, Deactivate, Reactivate, reversible Remove
Membership, and role-change audit readback. Server APIs enforce workspace scope,
block scoped users from assigning platform roles, and keep external sends and
account writes disabled.

Focused local verification passed with 58 tests and syntax checks. Next step:
commit, push, deploy the safe app-visible changes, run focused live workspace
user smokes, then continue to Batch 5 action coverage.
<!-- batch-4:end -->
