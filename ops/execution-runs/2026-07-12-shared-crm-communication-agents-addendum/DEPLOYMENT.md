# Deployment

Record deploy/live-smoke proof or blockers.

## 2026-07-13 One Time-First Addendum Deployment Policy

- No deployment occurred for the control-correction step because it changed run state and planning artifacts only.
- During this phase, feature development and visual acceptance happen against One Time first.
- BNA deploys only when a shared runtime change actually requires BNA regression proof.
- The final One Time closeout must prove exact tested SHA, exact One Time target, no unnecessary BNA assets on the One Time critical path, performance budgets, mobile CRM behavior, owner-only communication tests, privacy/workspace isolation, and rollback path.

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

## 2026-07-13 CRM Family/Student Link Slice Deploy

- Commit: `003e3e7fe23684a40131e53be280787811bcc8a4`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true`.
- BNA Railway doctor: deployment `f8ff55d2-ebe1-4f1e-8250-7a4d34e873a6` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=003e3e7fe23684a40131e53be280787811bcc8a4`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=one-time`.
- One Time Railway doctor: deployment `7e9d6c53-e77f-493a-82ea-573e6b1fcb29` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=003e3e7fe23684a40131e53be280787811bcc8a4`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 003e3e7fe23684a40131e53be280787811bcc8a4` passed.
- Deployed JS marker checks passed for `ACTION-CRM-LINK-FAMILY`, `ACTION-CRM-LINK-STUDENT`, `linkFirstPartyCrmFamily`, `linkFirstPartyCrmStudent`, `student_access_not_granted`, and `relationship:family`.

## 2026-07-13 CRM Follow-up Actions Slice Deploy

- Commit: `eee9a431dd426d8627652b972c3d3336eaf18362`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true`.
- BNA Railway doctor: deployment `01b5cbf9-a187-4c5e-8e4e-a5e8985d3445` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=eee9a431dd426d8627652b972c3d3336eaf18362`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=one-time`.
- One Time Railway doctor: deployment `2eeead32-2f44-49b9-9a70-1528c3ad5945` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=eee9a431dd426d8627652b972c3d3336eaf18362`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha eee9a431dd426d8627652b972c3d3336eaf18362` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench -- https://join.onetimeonetime.com` passed; report `ops/live-smokes/2026-07-13T02-23-19-932Z-one-time-operations-crm-workbench-live-smoke.md`.
- Deployed JS marker checks passed for `ACTION-CRM-SET-FOLLOW-UP`, `ACTION-CRM-CHANGE-FOLLOW-UP`, `ACTION-CRM-CLEAR-FOLLOW-UP`, `CRM follow-up cleared`, `crm_action_id: submitterActionId`, and the clear-follow-up payload branch.

## 2026-07-13 CRM Note/Tag/Owner/Lifecycle Actions Slice Deploy

- Commit: `15796035598280b3ae14d748e3673d6a186af5cd`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true`.
- BNA Railway doctor: deployment `7e32345a-71c3-4296-a899-f10710339020` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=15796035598280b3ae14d748e3673d6a186af5cd`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=one-time`.
- One Time Railway doctor: deployment `8dc13638-9225-4c0f-99ca-bdc2bb5daab1` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=15796035598280b3ae14d748e3673d6a186af5cd`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 15796035598280b3ae14d748e3673d6a186af5cd` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench -- https://join.onetimeonetime.com` passed; report `ops/live-smokes/2026-07-13T02-32-29-354Z-one-time-operations-crm-workbench-live-smoke.md`.
- Deployed JS marker checks passed for `ACTION-CRM-ADD-NOTE`, `ACTION-CRM-ADD-TAG`, `ACTION-CRM-REMOVE-TAG`, `ACTION-CRM-ASSIGN-OWNER`, `ACTION-CRM-CHANGE-LIFECYCLE`, tag remove validation copy, and `create_follow_up_task: false`.

## 2026-07-13 CRM Conversation Thread Open Slice Deploy

- Commit: `83427a7a7d7d1c255d83f1e13da24b18265e55fd`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `8744a95d-c510-412a-9f57-f72f69f72ce2` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=83427a7a7d7d1c255d83f1e13da24b18265e55fd`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `16db8dd7-50d7-4ec1-ad79-e951956c07c3` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=83427a7a7d7d1c255d83f1e13da24b18265e55fd`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 83427a7a7d7d1c255d83f1e13da24b18265e55fd` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T03-12-16-557Z-one-time-operations-crm-workbench-live-smoke.md`.
- Deployed JS marker checks passed on BNA and One Time for `openFirstPartyCrmConversationThread`, literal email/WhatsApp conversation action markers, `No WhatsApp message was sent.`, and `Open WhatsApp thread`.
- Live selected-contact `/conversations` DTO readback through Operations auth returned 12 scoped cards, 6 selected conversations, `open_actions=["whatsapp"]`, `no_send=true`, and `external_write_performed=false`.

## 2026-07-13 CRM Task DTO Actions Slice Deploy

- Commit: `09d239dd095e59299f06c5b3cd38893cd5696fb8`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `91aab958-0b12-442b-bf15-545517abc9b9` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=09d239dd095e59299f06c5b3cd38893cd5696fb8`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `36827b53-3ffb-420e-ac37-2ef329db94ec` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=09d239dd095e59299f06c5b3cd38893cd5696fb8`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 09d239dd095e59299f06c5b3cd38893cd5696fb8` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T03-23-44-897Z-one-time-operations-crm-workbench-live-smoke.md`.
- Deployed JS marker checks passed on BNA and One Time for `updateFirstPartyCrmTaskDto`, `data-crm-task-dto-actions`, `Completed from CRM contact workspace Tasks tab.`, and `Reopened by an explicit Reopen task click in the CRM contact workspace Tasks tab.`.

## 2026-07-13 CRM Support-Ticket Aggregate Slice Deploy

- Commit: `e830ca924a2fd4853fc523a4bad6e55c454bf420`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `2db01b8e-2241-413e-8df1-21a2926e892b` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=e830ca924a2fd4853fc523a4bad6e55c454bf420`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `2357d677-5991-40e4-8c05-621b201d0ad6` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=e830ca924a2fd4853fc523a4bad6e55c454bf420`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha e830ca924a2fd4853fc523a4bad6e55c454bf420` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T03-36-02-229Z-one-time-operations-crm-workbench-live-smoke.md`.
- Read-only live DTO readback found no live support tickets on the sampled One Time contact set (`support_summary_cards=0`, `support_timeline_items=0`) and confirmed support tickets are not returned in Conversations (`support_conversation_items=0`), with `no_send=true` and `external_write_performed=false`.

## 2026-07-13 CRM Signup-Context Aggregate Slice Deploy

- Commit: `feaece026a62daaf1ff85bdb53ac25ffb246ab89`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `aff0823d-e323-439a-8837-150273689bc4` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=feaece026a62daaf1ff85bdb53ac25ffb246ab89`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `b119d430-216a-43c9-b59a-37b2b8dcfdb1` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=feaece026a62daaf1ff85bdb53ac25ffb246ab89`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha feaece026a62daaf1ff85bdb53ac25ffb246ab89` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T03-52-25-026Z-one-time-operations-crm-workbench-live-smoke.md`.
- Read-only live DTO readback confirmed the deployed One Time CRM list returned 12 scoped cards, 5 cards with signup context, 5 cards with linked legacy leads, 0 duplicate email/phone cards, `no_send=true`, and `external_write_performed=false`.

## 2026-07-13 CRM Student/Member Activity Context Slice Deploy

- Commit: `381023aad5fdaf1b23ef4c7ab0c12327ee2d369b`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `5b39768d-21ad-4d76-b414-d685447d3542` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=381023aad5fdaf1b23ef4c7ab0c12327ee2d369b`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `965166eb-7cbb-4935-aa43-9ca497978b4e` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=381023aad5fdaf1b23ef4c7ab0c12327ee2d369b`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 381023aad5fdaf1b23ef4c7ab0c12327ee2d369b` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T04-03-00-662Z-one-time-operations-crm-workbench-live-smoke.md`.
- Read-only live DTO readback confirmed the deployed One Time CRM list returned 12 scoped cards with `no_send=true` and `external_write_performed=false`. The current sampled live data had `total_student_activity_rows=0` and `total_membership_activity_rows=0`; local smoke and DTO tests cover row behavior when records exist.

## 2026-07-13 CRM Class-Attendance Activity Context Slice Deploy

- Commit: `593398dd6f3f927e321c24fad4bd2d01e13dcd51`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `8886d1ce-677e-406e-a34f-49313e9fde86` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=593398dd6f3f927e321c24fad4bd2d01e13dcd51`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `1bef031c-3522-440f-8e62-ac33972515cb` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=593398dd6f3f927e321c24fad4bd2d01e13dcd51`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 593398dd6f3f927e321c24fad4bd2d01e13dcd51` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T04-13-58-713Z-one-time-operations-crm-workbench-live-smoke.md`.
- Read-only live DTO readback confirmed the deployed One Time CRM list returned 12 scoped cards with `no_send=true` and `external_write_performed=false`. The sampled timelines had 20 rows, `class_attendance_timeline_rows=0`, and `class_attendance_conversation_rows=0`; current live data had no class-attendance rows, so local smoke and DTO tests cover row behavior when records exist.

## 2026-07-13 CRM Communication Consent/Suppression DTO Context Slice Deploy

- Commit: `0e33764d66519d8f45d86e57b320a1988a604058`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `1cf2ff91-2ead-4124-851d-a71b17742b56` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=0e33764d66519d8f45d86e57b320a1988a604058`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `57c2454e-60e2-40e9-9214-b7f5572df6c6` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=0e33764d66519d8f45d86e57b320a1988a604058`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 0e33764d66519d8f45d86e57b320a1988a604058` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T04-26-18-047Z-one-time-operations-crm-workbench-live-smoke.md`.
- Read-only live DTO readback confirmed the deployed One Time CRM list returned 12 scoped cards, `communication_preferences_cards=12`, preference counts `{whatsapp:2,email:3,not_set:7}`, consent counts `{not_recorded:12}`, suppression counts `{none_recorded:12}`, `no_send=true`, and `external_write_performed=false`.

## 2026-07-13 CRM Suppression / Opt-Out Activity Timeline Context Slice Deploy

- Commit: `e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=bna`.
- BNA Railway doctor: deployment `476ad2fb-8178-44b2-af2d-20d2eb7f15cd` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: deployment `9fd12f58-f9ca-4eb3-b581-e0b9f7aca3f9` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1` passed.
- One Time Operations CRM smoke: `npm run app:smoke:onetime-operations-crm-workbench` passed; report `ops/live-smokes/2026-07-13T04-40-38-338Z-one-time-operations-crm-workbench-live-smoke.md`.
- Read-only live DTO readback confirmed the deployed One Time CRM list returned 12 scoped cards with `no_send=true` and `external_write_performed=false`. The sampled live data had `suppression_timeline_rows=0`, `suppression_conversation_rows=0`, and `suppression_task_rows=0`; current live data had no suppressed contacts, so local smoke and DTO tests cover row behavior when records exist.

## 2026-07-13 CRM Delivery Outbox Activity DTO Slice Deploy

- App-code commit: `fc36995bf85e31b988e1d7e1d756bf4e51e00ca4`
- Deployed head: `ee9391d2bd4a1ff3ef41fc99296089254373a4d6`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true`.
- BNA Railway doctor: deployment `b49f07c2-86e5-44d3-8092-e4ed1bdaed2e` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=ee9391d2bd4a1ff3ef41fc99296089254373a4d6`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- One Time Railway doctor: latest deployment `2645a6c7-3b51-4ae6-915f-5a267dacde22` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=ee9391d2bd4a1ff3ef41fc99296089254373a4d6`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha ee9391d2bd4a1ff3ef41fc99296089254373a4d6` passed.
- One Time provider route-module smoke passed; report `ops/live-smokes/2026-07-13T09-33-33-717Z-onetime-provider-route-module-live-smoke.md`.
- One Time Operations CRM smoke passed; report `ops/live-smokes/2026-07-13T09-33-33-379Z-one-time-operations-crm-workbench-live-smoke.md`.
- One Time signup form matrix passed, including mobile widths and keyboard-only card completion; report `ops/live-smokes/2026-07-13T09-32-18-347Z-one-time-signup-form-matrix-live.md`.
- One Time direct signup dry-run passed without production writes or sends; report `ops/live-smokes/2026-07-13T09-32-18-048Z-one-time-interest-dry-run-live-smoke.md`.
- Delivery-outbox DTO live smoke passed with `skipped_no_live_delivery_outbox`; report `ops/live-smokes/2026-07-13T09-32-18-053Z-one-time-crm-delivery-outbox-dto-live-smoke.md`.
- Operations workspace taxonomy smoke passed; report `ops/live-smokes/2026-07-13T09-28-14-579Z-operations-workspace-taxonomy-live-smoke.md`.
- One Time performance regression gate passed against the deployed SHA; report `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md`.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw recipient/body logging, or production data mutation.

## 2026-07-13 CRM Delivery Dead-Letter Activity DTO Slice Deploy

- Commit: `01d5a054ad99ba0a41196b18fc5b8098972e1d5a`
- Branch: `master`
- Push: `git push origin master` succeeded.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=bna`.
- BNA Railway doctor: deployment `86b1d98c-d4d3-4c52-8f0f-784ebee3deef` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=01d5a054ad99ba0a41196b18fc5b8098972e1d5a`, `target_app=bna`.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=one-time`.
- One Time Railway doctor: deployment `7c81033a-ffc4-46e2-b2f5-f8ff0da1cf91` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=01d5a054ad99ba0a41196b18fc5b8098972e1d5a`, `target_app=one-time`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 01d5a054ad99ba0a41196b18fc5b8098972e1d5a` passed.
- One Time provider route-module smoke passed; report `ops/live-smokes/2026-07-13T09-51-50-534Z-onetime-provider-route-module-live-smoke.md`.
- One Time Operations CRM smoke passed; report `ops/live-smokes/2026-07-13T09-51-50-245Z-one-time-operations-crm-workbench-live-smoke.md`.
- Delivery dead-letter DTO live smoke passed with `skipped_no_live_dead_letters`; report `ops/live-smokes/2026-07-13T09-51-50-226Z-one-time-crm-dead-letter-dto-live-smoke.md`.
- Delivery-outbox DTO regression smoke passed with `skipped_no_live_delivery_outbox`; report `ops/live-smokes/2026-07-13T09-52-15-195Z-one-time-crm-delivery-outbox-dto-live-smoke.md`.
- Operations workspace taxonomy smoke passed; report `ops/live-smokes/2026-07-13T09-52-15-192Z-operations-workspace-taxonomy-live-smoke.md`.
- One Time performance regression gate passed against the deployed SHA; report `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md`.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw recipient/body/reason/payload logging, or production data mutation.

## 2026-07-13 CRM Direct Signup Record Activity DTO Slice Deploy

- Runtime app-code commit: `dab78d4e0b05b6e59affe08864e7207d2235652f`
- One Time deployed/proof commit: `1318c67da0d79e7a158aa0b13d3085906ffcdf15`
- Current BNA proof-refresh readback: `d12e31694f2a0475936c945f1d7ec0d0c2c35664`
- Branch: `master`
- Push: `git push origin master` succeeded.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=one-time`.
- One Time Railway doctor: deployment `af6b2ea0-721e-42de-b487-fe9ef7ea27c8` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=1318c67da0d79e7a158aa0b13d3085906ffcdf15`, `target_app=one-time`.
- BNA check: `npm run railway:doctor` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=bna`.
- BNA Railway doctor: current deployment `896c0a2f-ed48-4d44-ae6d-b415c669bd8d` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=d12e31694f2a0475936c945f1d7ec0d0c2c35664`; current deploy-info target metadata is blank in the runtime payload.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 1318c67da0d79e7a158aa0b13d3085906ffcdf15` passed.
- One Time provider route-module smoke passed; report `ops/live-smokes/2026-07-13T10-52-38-477Z-onetime-provider-route-module-live-smoke.md`.
- One Time Operations CRM smoke passed; report `ops/live-smokes/2026-07-13T10-52-38-292Z-one-time-operations-crm-workbench-live-smoke.md`.
- Signup-record DTO live smoke passed with `skipped_no_live_signup_records`; report `ops/live-smokes/2026-07-13T10-52-56-884Z-one-time-crm-signup-record-dto-live-smoke.md`.
- WhatsApp DTO regression smoke passed; report `ops/live-smokes/2026-07-13T10-52-56-884Z-one-time-crm-whatsapp-thread-dto-live-smoke.md`.
- Signup-context DTO regression smoke passed; report `ops/live-smokes/2026-07-13T10-53-15-856Z-one-time-crm-signup-context-dto-live-smoke.md`.
- Operations workspace taxonomy smoke passed; original report `ops/live-smokes/2026-07-13T10-52-56-884Z-operations-workspace-taxonomy-live-smoke.md`; current BNA proof-refresh head recheck report `ops/live-smokes/2026-07-13T11-00-32-825Z-operations-workspace-taxonomy-live-smoke.md`.
- One Time performance regression gate passed against the deployed SHA; report `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md`.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw signup private data logging, or production data mutation.

## 2026-07-13 CRM Website Assistant Thread Activity DTO Slice Deploy

- App-code commit: `8ea2cd06e1920eecfd1ae97b937c22d701c00099`
- Branch: `master`
- Push: `git push origin master` succeeded.
- One Time deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=one-time`.
- One Time Railway doctor: deployment `c2b6b88a-036a-4a33-93d9-3bd2f9de7719` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=8ea2cd06e1920eecfd1ae97b937c22d701c00099`, `target_app=one-time`.
- BNA deploy: `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=true` and `BNA_DEPLOY_APP=bna`.
- BNA Railway doctor: deployment `55f38854-f00a-4432-bfdf-0dfcf6c400fc` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=8ea2cd06e1920eecfd1ae97b937c22d701c00099`, `target_app=bna`.
- One Time smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 8ea2cd06e1920eecfd1ae97b937c22d701c00099` passed.
- One Time provider route-module smoke passed; report `ops/live-smokes/2026-07-13T11-11-46-347Z-onetime-provider-route-module-live-smoke.md`.
- One Time Operations CRM smoke passed; report `ops/live-smokes/2026-07-13T11-11-46-046Z-one-time-operations-crm-workbench-live-smoke.md`.
- Assistant-thread DTO live smoke passed with `assistant_thread_match=true`; report `ops/live-smokes/2026-07-13T11-11-46-025Z-one-time-crm-assistant-thread-dto-live-smoke.md`.
- Signup-record DTO regression smoke passed with `skipped_no_live_signup_records`; report `ops/live-smokes/2026-07-13T11-12-08-074Z-one-time-crm-signup-record-dto-live-smoke.md`.
- WhatsApp DTO regression smoke passed; report `ops/live-smokes/2026-07-13T11-12-07-959Z-one-time-crm-whatsapp-thread-dto-live-smoke.md`.
- Signup-context DTO regression smoke passed; report `ops/live-smokes/2026-07-13T11-12-08-074Z-one-time-crm-signup-context-dto-live-smoke.md`.
- Operations workspace taxonomy smoke passed; report `ops/live-smokes/2026-07-13T11-12-08-098Z-operations-workspace-taxonomy-live-smoke.md`.
- One Time performance regression gate passed against the deployed SHA; report `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md`.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw assistant body/contact logging, or production data mutation.

## 2026-07-13 Shared CRM Current-Phase Closeout

- No new runtime deploy was required for this status/evidence closeout.
- Current deployed/proved runtime SHA: `8ea2cd06e1920eecfd1ae97b937c22d701c00099`.
- BNA Railway deployment `55f38854-f00a-4432-bfdf-0dfcf6c400fc` reached `SUCCESS`; BNA `/api/deploy-info` returned exact SHA `8ea2cd06e1920eecfd1ae97b937c22d701c00099` and `target_app=bna`.
- One Time Railway deployment `c2b6b88a-036a-4a33-93d9-3bd2f9de7719` reached `SUCCESS`; One Time `/api/deploy-info` returned exact SHA `8ea2cd06e1920eecfd1ae97b937c22d701c00099` and `target_app=one-time`.
- Live proof remains: One Time exact-SHA separate-instance smoke, One Time provider route-module smoke, One Time Operations CRM workbench smoke, targeted assistant-thread DTO smoke, WhatsApp/signup-context/signup-record DTO regressions, BNA taxonomy smoke, and One Time performance gate.
- `REQ-20260712-302` is closed only for the current One Time-first shared CRM phase; dedicated CRM actions, owner-test sends, and future BNA frontend adoption remain separate lanes.

## 2026-07-13 Dedicated CRM Actions Closeout

- No new runtime deploy was required for `REQ-20260712-303`; the closeout proves action slices already deployed into current One Time runtime SHA `8ea2cd06e1920eecfd1ae97b937c22d701c00099`.
- Production marker proof on `https://join.onetimeonetime.com/operations.html` found all 18 expected CRM action IDs with none missing.
- Earlier bounded action slices deployed and live-smoked: Add Contact, Archive Contact, Complete/Reopen tasks, Link member, Link family/student, Set/Change/Clear follow-up, Add note/Add tag/Remove tag/Assign owner/Change lifecycle, and task DTO Complete/Reopen.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM write, provider mutation, payment/access mutation, import, credential mutation, or production data mutation was performed by the closeout proof.

## 2026-07-13 CRM Internal-Copy Cleanup Deploy

- Runtime commit: `a8df4c9b9cc091028105a16430aae6927cd0b429`.
- Branch: `master`.
- Push: `git push origin master` succeeded for the runtime commit.
- One Time deploy: `BNA_RAILWAY_USE_ACCOUNT_AUTH=true`, `BNA_RAILWAY_TARGET_PROFILE=one-time`, `npm run railway:redeploy`.
- One Time Railway doctor: deployment `6059d148-7708-43ae-9665-abdaa544a5d6` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=a8df4c9b9cc091028105a16430aae6927cd0b429`, `target_app=one-time`.
- One Time CRM workbench smoke passed; report `ops/live-smokes/2026-07-13T12-00-42-976Z-one-time-operations-crm-workbench-live-smoke.md`.
- BNA deploy: `BNA_RAILWAY_USE_ACCOUNT_AUTH=true`, `BNA_RAILWAY_TARGET_PROFILE=bna`, `npm run railway:redeploy`.
- BNA Railway doctor: deployment `16f00bed-0cb2-49df-b725-8ea8ee672415` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=a8df4c9b9cc091028105a16430aae6927cd0b429`, `target_app=bna`.
- BNA workspace taxonomy smoke passed; report `ops/live-smokes/2026-07-13T12-01-50-016Z-operations-workspace-taxonomy-live-smoke.md`.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM production write, provider mutation, payment/access mutation, import, credential mutation, or production data mutation was performed by this closeout proof.

## 2026-07-13 Canonical Inbound Communication Pipeline Runtime Slice Deploy

- Runtime app-code commit: `a692c6e002a09557b81c350c5c0187222d87b7de`.
- Current deployed head: `f8df93a4ca86ecd607d5c3b63d113f77be4327c2`, which includes the inbound runtime slice plus later One Time Vimeo readiness work.
- Branch: `master`.
- Push: `git push origin master` succeeded for the runtime commit.
- One Time Railway doctor: deployment `641ad29c-d8d6-4053-b4d3-c7412fa6b7d7` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=f8df93a4ca86ecd607d5c3b63d113f77be4327c2`, `target_app=one-time`.
- One Time CRM workbench smoke passed at the current deployed SHA; report `ops/live-smokes/2026-07-13T12-25-01-672Z-one-time-operations-crm-workbench-live-smoke.md`.
- BNA Railway doctor: deployment `68858c05-474e-4419-91c7-d934e7796305` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=f8df93a4ca86ecd607d5c3b63d113f77be4327c2`.
- BNA workspace taxonomy smoke passed at the current deployed SHA; report `ops/live-smokes/2026-07-13T12-25-01-801Z-operations-workspace-taxonomy-live-smoke.md`.
- Guardrails: no owner-test email send, WhatsApp/WAPI send, Telegram send, public auto-reply enablement, CRM destructive write, provider mutation, payment/access mutation, credential mutation, or raw private payload logging was performed by this proof.

## 2026-07-13 Canonical Inbound Website Assistant And Rabbi Telegram Slice Deploy

- Runtime deployed head: `c8865b070b8f2ee59615ad2a3ddf21ee171a32d8`.
- Branch: `master`.
- Push: `git push origin master` succeeded for the runtime head.
- One Time Railway deployment `ca335eed-37f9-4c47-acf3-cb310d1c80da` reached `SUCCESS`.
- One Time live readback: `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=c8865b070b8f2ee59615ad2a3ddf21ee171a32d8`, `target_app=one-time`.
- BNA Railway deployment `cb2ee7e7-abee-4cbf-95ec-a12711a25442` reached `SUCCESS`.
- BNA live readback: `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=c8865b070b8f2ee59615ad2a3ddf21ee171a32d8`, `target_app=bna`.
- One Time separate-instance smoke passed at the exact SHA.
- One Time CRM workbench smoke passed; report `ops/live-smokes/2026-07-13T12-45-53-175Z-one-time-operations-crm-workbench-live-smoke.md`.
- One Time provider route-module smoke passed; report `ops/live-smokes/2026-07-13T12-46-12-200Z-onetime-provider-route-module-live-smoke.md`.
- BNA workspace taxonomy smoke passed; report `ops/live-smokes/2026-07-13T12-46-11-923Z-operations-workspace-taxonomy-live-smoke.md`.
- Guardrails: no owner-test email send, WhatsApp/WAPI send, Telegram send, public auto-reply enablement, CRM destructive write, provider mutation, payment/access mutation, credential mutation, raw Telegram chat/message value logging, or raw private payload logging was performed by this proof.
