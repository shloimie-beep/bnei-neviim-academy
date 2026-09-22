# Deployment

Final production deployment was completed on 2026-07-12T22:38:00+03:00.

- Final deployed `master` SHA: `22cc6b88b0045f9052a403582ec8249e369196a0`.
- One Time Railway target: `one-time-production / production / one-time-web`.
- One Time deployment: `89c697ad-3f72-4d4f-96a2-46f0b2c2d740`, status `SUCCESS`.
- One Time readback: `https://join.onetimeonetime.com/api/deploy-info` returned final SHA, `deployment_source=railway:redeploy`, `target_app=one-time`.
- BNA readback: `https://bneineviimacademy.org/api/deploy-info` returned final SHA from runtime/auto deploy.
- Live smoke proof passed for One Time public funnel, direct signup, landing/WhatsApp readiness, Operations CRM workbench, portal routes, signed view-as scope denials, BNA route no-write smoke, and production compression headers.
- No external email, WhatsApp/WAPI manual send, Telegram send, payment/access mutation, DNS/account mutation, provider-data mutation, GHL runtime operation, or production CRM write was performed by these release smokes.

Historical release candidate state retained below:

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
