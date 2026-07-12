# Deployment

Record deploy/live-smoke proof or blockers.

## 2026-07-12 Batch 1 Deploy

- Commit: `966ded41b517433533f24370949426cfd1200213`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1`.
- BNA Railway doctor: passed for project `skillful-motivation`, service `skillful-motivation`, environment `production`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=966ded41b517433533f24370949426cfd1200213`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: passed for project `one-time-production`, service `one-time-web`, environment `production`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=966ded41b517433533f24370949426cfd1200213`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 966ded41b517433533f24370949426cfd1200213` passed.

Global production readiness remains blocked only by known external full-launch fields for Stripe and campaign send approval; deploy/readback for this bounded batch is complete.
