# Deployment

No app/server implementation has been deployed yet for this run.

Release candidate state as of 2026-07-12T21:14:00+03:00:

- Release branch: `codex/onetime-crm-portal-release-20260712`
- Pushed implementation commit: `833cac222`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/131`
- PR mergeability: mergeable/clean as of 2026-07-12T21:22:41+03:00; no status checks reported.
- Local release-gate dry-run: ready on the clean pushed release branch.
- Production deployment/live verification: not run.

Deployment is required before any app-visible or server-visible implementation requirement can close as Done/Verified:

- `REQ-20260712-103` through `REQ-20260712-112` require deployment/live-smoke proof when implemented.
- `REQ-20260712-101` and `REQ-20260712-102` are run-control/audit artifacts and do not require deployment.

Final deployment closeout must verify the exact commit SHA on the BNA Operations/portal service and
the One Time public service, then run live smokes for Operations, landing, Family Portal, Student
Portal, Classroom, Library, CRM positive scope, and cross-workspace negative scope.

The production deploy/live-verify commands require explicit release-gate confirmation tokens. No
external send, provider write, payment/access/DNS change, production data mutation, or GHL runtime
operation is authorized by this run record.
