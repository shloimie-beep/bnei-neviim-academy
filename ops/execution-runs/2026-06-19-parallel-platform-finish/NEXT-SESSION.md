# Next Session

No open local implementation requirement remains in this run.

Next work requires explicit operator release approval:

1. Decide whether to push/PR this integration branch.
2. Approve or revise the release scope.
3. Approve production database migration and backup/rollback plan.
4. Approve Railway deploy/doctor.
5. Approve live smoke coverage, including authenticated Operations and One Time owner/admin checks.
6. Approve provider-specific live actions separately: Vimeo, Zoom, Resend, DNS, and any secret propagation.

Do not deploy, push, mutate production data, change DNS, send email, upload video,
create Zoom meetings, or copy secrets without explicit operator approval.
