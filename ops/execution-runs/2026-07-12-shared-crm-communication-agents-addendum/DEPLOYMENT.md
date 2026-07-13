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

## 2026-07-13 Complete/Reopen Task Slice Deploy

- Commit: `ec1e893848f12242a30fd1fc59c236442997f30e`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1`.
- BNA Railway doctor: deployment `3b43615c-3fde-4fad-bb1c-326baed500aa` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=ec1e893848f12242a30fd1fc59c236442997f30e`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `8f022587-8b8e-474e-8c59-886b68e18faa` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=ec1e893848f12242a30fd1fc59c236442997f30e`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha ec1e893848f12242a30fd1fc59c236442997f30e` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench -- https://join.onetimeonetime.com` passed; report `ops/live-smokes/2026-07-12T23-51-23-358Z-one-time-operations-crm-workbench-live-smoke.md`.
- Deployed asset marker checks passed for `ACTION-CRM-COMPLETE-TASK`, `ACTION-CRM-REOPEN-TASK`, `updateFirstPartyCrmLinkedTask`, `.crm-linked-task-card`, and `.crm-linked-task-meta`.

## 2026-07-13 Link Member Slice Deploy

- Commit: `8ea9b798fe9187fbb5f311fbd6073b49f1befcf3`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `91234f89-084d-4dc0-bc8b-4de7fbd33325` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=8ea9b798fe9187fbb5f311fbd6073b49f1befcf3`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `dc45500e-960c-4adf-8e78-dcb92a2a725c` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=8ea9b798fe9187fbb5f311fbd6073b49f1befcf3`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 8ea9b798fe9187fbb5f311fbd6073b49f1befcf3` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench -- https://join.onetimeonetime.com` passed; report `ops/live-smokes/2026-07-13T00-11-08-626Z-one-time-operations-crm-workbench-live-smoke.md`.
- Deployed JS/HTML marker checks passed for `ACTION-CRM-LINK-MEMBER`, `linkFirstPartyCrmMember`, `data-crm-member-link-state`, `access_status: 'paused'`, and `access_enabled: false`.

## 2026-07-13 One Time Bot/Landing Polish V2 Deploy

- Commit: `3712308731910a6e77fb9a18ce18b57ae35f22dd`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `77191e2f-0aaf-4fde-ae2c-cf69ce299af8` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=3712308731910a6e77fb9a18ce18b57ae35f22dd`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `38d75556-5a94-42d3-b8b3-65a5a3290fe7` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=3712308731910a6e77fb9a18ce18b57ae35f22dd`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 3712308731910a6e77fb9a18ce18b57ae35f22dd` passed.
- One Time public landing smoke: `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` passed; report `ops/live-smokes/2026-07-13T00-26-05-640Z-rabbi-onetime-landing-smoke.md`.
- Deployed marker checks passed for `--yellow: #ede518`, `box-shadow: none`, `margin-top: -10px`, removed old black CTA inset shadow, `/images/one-time/brand/onetimelogo.webp`, and `One Time Mishnayos<small>Sign up</small>`.

## 2026-07-13 Rabbi Telegram Ticket Approval Slice Deploy

- Commit: `8f6441523a5cd3547ecd4ba633dab90c8951ffd9`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true`.
- BNA Railway doctor: deployment `6ddd918b-3c4a-453d-8a07-8b6a53407607` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=8f6441523a5cd3547ecd4ba633dab90c8951ffd9`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=one-time`.
- One Time Railway doctor: deployment `16a16da1-4ca7-491c-87f8-d1f9637de5f7` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=8f6441523a5cd3547ecd4ba633dab90c8951ffd9`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 8f6441523a5cd3547ecd4ba633dab90c8951ffd9` passed.
- Live approval route guard: unauthenticated `POST /api/bna/support-tickets/1/approval-action` returned `401 Unauthorized` on both BNA and One Time with no ticket/job creation.
- Telegram readiness: `npm run telegram:rabbi:readiness` passed in no-send mode; Super Admin and Rabbi Telegram targets are configured/ready, but alert send flags are disabled in this environment.
- WAPI readiness remains no-send/no-write and blocked only by `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM`.
