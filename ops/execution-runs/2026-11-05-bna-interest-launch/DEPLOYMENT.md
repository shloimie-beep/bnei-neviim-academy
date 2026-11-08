# November5 deployment evidence

Requirements REQ-20261105-001 through REQ-20261105-008 are Done. Final receipt: `ops/bna-interest-launch/2026-11-05/RESULT.md`. Register: `tasks-pending/2026-11-05-bna-interest-launch.md`. Application commit `7d0a02a43cdabc54d20749e1422f197f3e961ab1` is pushed in PR196 and verified in production deployment `3854b4ba-e2dc-4007-8781-6d837f229f82` SUCCESS.

Existing BNA Railway project bd5b6d78-5e83-4e83-89b2-cd5f52ed7889, production environment3ce30933-49c7-4b90-8c36-a5afd67df329, service4079db35-5f4a-44ef-a767-3406c74f6005. Provider SUCCESS and live `/api/deploy-info` agree. Source branch codex/bna-interest-launch-20261105 remains pinned to full verified application SHA7d. No staged changes remain. Historical failed upload/rollback attempts are recorded in RESULT.md. Final documentation push does not redeploy or merge unrelated work.

## November8 public update — prepared, not deployed

Public application80575900cbd0376a1db24a3267ef68be49029f29 is pushed in PR196. Fresh staged readback shows only the existing BNA service source update, effective pin7d0a02a4 to80575900; same repo/branch, no variable/domain/database/other-service changes. Patch4d2ddf09-c880-406b-ab41-d4e74882df59 is STAGED and non-destructive. No accept-deploy was called for this update. Exact current public pin confirmation is pending under DEC-20261108-001; old November5 approval named a different pin. After approval, fresh staged review and read-only public live proof are required. Backend stays paused; no new inquiry/email/archive effects are included.


## Current November8 serving state

The exact public80575900 pin was approved as RAW-20261108-003. Connector accept-deploy returned cancellation without effect; fresh state confirmed the old deployment. The same scoped approved pin was committed using the native Railway CLI with structured source-only stdin. Deploymentd4e8810a-5422-48e9-b516-b25c3cd48cb3 is SUCCESS at80575900cbd0376a1db24a3267ef68be49029f29; live /api/deploy-info agrees. Public read-only verification passed28states/60links/47sitemap/12assets with0new inquiries/emails/archive effects. The connector retains an old four-field staged source patch with identical live/staged805 values; it was not reapplied. A new minimal owner-alert source/recipient binding will be prepared for DEC-20261108-003; no other-service/configuration change is allowed.
