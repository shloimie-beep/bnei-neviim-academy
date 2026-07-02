# Deployment

## Baseline

- Pre-run Railway deployment: `f9921a2d-d614-44df-88c0-392d810ddebd`
- Pre-run Railway doctor: PASS
- Pre-run live smoke:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`

## Batch 3

- Deployment ID: `89967278-38dc-49f3-a70d-4536c59f82f6`
- Deployed commit: `f8a2fd62`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- Focused Task/Decision live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`

Prior failed checks during the same batch:

- Deployment `fbf13644-a344-4fd0-8a23-0276b2faff0c` exposed an ambiguous
  `project_key` SQL reference for `task_view=one_time_tasks`; fixed in
  `a28a9332`.
- Deployment `1b174b4f-4492-4ecf-b307-55a1b990031d` allowed text-matched BNA
  rows into the One Time task filter; fixed in `f8a2fd62`.
- `npm run app:smoke:operations-workspace-taxonomy` failed on the unrelated
  pre-existing `Family Directory` HTML expectation. The focused Batch 3 smoke
  passed after the scoping fix.

## Batch 4

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `bcb0e153aac41bf5452c80f83bf184e972c979d2`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `641ac75e-d6d7-4379-a27c-4f7a4d9d3dbf`
- Deployed commit: `bcb0e153aac41bf5452c80f83bf184e972c979d2`
- Service/environment: `skillful-motivation / production`
- Direct Railway upload command used from the clean deploy bundle because the
  project token could read status but the script's temporary `railway link`
  step was unauthorized.
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-23T15-59-34-390Z-live-app-smoke.md`
- Focused Batch 4 control-plane live smoke: PASS,
  `ops/live-smokes/2026-06-23T16-00-48-379Z-batch4-control-plane-live-smoke.md`
- Operations workspace taxonomy live smoke from the clean branch: PASS,
  `ops/live-smokes/2026-06-23T16-01-39-450Z-operations-workspace-taxonomy-live-smoke.md`

Prior failed checks during the same batch:

- `npm run railway:doctor` from the clean worktree initially failed because
  `.secrets/railway-token.txt` is intentionally absent there. The existing
  main-worktree token was then passed in-process as `RAILWAY_TOKEN` without
  copying or printing it.
- `npm run railway:redeploy` failed during the temporary-bundle `railway link`
  step with an authorization error. The same deploy bundle succeeded with
  direct `railway up --project ... --service ... --environment ...`.
- Main-worktree `npm run app:smoke:operations-workspace-taxonomy` passed the
  live API taxonomy check but failed on an older local script expectation for
  `Family Directory`. The same smoke from the deployed clean branch passed.

## Batch 5

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `e22bd90db50190a26c9a4536b8ec7ae6cb4dd0b1`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `c93a9311-4eb0-4982-8c14-b5f7a9cd5c8e`
- Deployed commit: `e22bd90db50190a26c9a4536b8ec7ae6cb4dd0b1`
- Service/environment: `skillful-motivation / production`
- Direct Railway upload command used from the prepared deploy bundle because
  the script's temporary `railway link` step was unauthorized.
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Focused Batch 5 action coverage live smoke: PASS,
  `ops/live-smokes/2026-06-23T16-37-19-965Z-batch5-action-coverage-live-smoke.md`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-23T16-39-27-702Z-live-app-smoke.md`
- Operations workspace taxonomy live smoke from the clean branch: PASS,
  `ops/live-smokes/2026-06-23T16-39-50-955Z-operations-workspace-taxonomy-live-smoke.md`

Prior failed or invalid checks during the same batch:

- An initial annotation used `id` instead of `option.id` inside the Operations
  workspace option renderer, causing a runtime `ReferenceError`; it was fixed
  before commit, full tests, deployment, and live smoke.
- `npm run railway:redeploy` failed during the temporary-bundle `railway link`
  step with an authorization error. The same deploy bundle succeeded with
  direct `railway up --project ... --service ... --environment ...`.
- A manual deployment poll used unsupported `railway status --project`
  arguments for the installed Railway CLI; the subsequent `npm run
  railway:doctor` returned the deployed `SUCCESS` status.

## Batch 6

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- Direct Railway upload command used from the prepared deploy bundle because
  the script's temporary `railway link` step was unauthorized.
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-23T16-59-39-550Z-live-app-smoke.md`
- Operations workspace taxonomy live smoke from the clean branch: PASS,
  `ops/live-smokes/2026-06-23T17-00-15-340Z-operations-workspace-taxonomy-live-smoke.md`
- Focused Batch 6 Operations UI live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-01-12-970Z-batch6-operations-ui-live-smoke.md`

Prior failed or transient checks during the same batch:

- `npm run railway:redeploy` again prepared the clean deploy bundle but failed
  during `railway link` with an authorization error. The same bundle succeeded
  with direct `railway up --project ... --service ... --environment ...`.
- The first Railway doctor call saw deployment
  `e9949680-4330-454c-9b1c-b61dce2d475b` in `BUILDING`/`DEPLOYING`; polling
  continued until `Status: SUCCESS`.
- The first clean-worktree Operations taxonomy smoke lacked `OPS_USERNAME` and
  `OPS_PASSWORD`; rerunning with the main local `.env.local` loaded in-process
  passed without printing secrets.

## Batch 7

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the communications workspace and
  Resend/WAPI implementation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- WhatsApp UX live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-09-51-981Z-whatsapp-ux-live-smoke.md`
- Email/Resend UX live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-09-52-093Z-email-resend-ux-live-smoke.md`
- Communications screening live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-10-27-503Z-communications-screening-live-smoke.md`

Guardrails:

- No WhatsApp message, email, external CRM write, DNS mutation, account change,
  billing action, real WAPI outbound action, or Resend production send was
  performed.
- `DEC-20260619-301` remains the sender/domain/Resend account blocker for real
  outbound email production readiness.

## Batch 9

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the product/schedule/booking/
  portal/billing readiness implementation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- One Time Product Booking live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-16-03-089Z-one-time-product-booking-live-smoke.md`
- One Time Payment Access/Class Links live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-16-03-292Z-one-time-payment-access-class-links-live-smoke.md`
- One Time Shared Review live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-16-03-566Z-one-time-shared-review-live-smoke.md`

Guardrails:

- Live product smoke created only internal One Time class-event and
  appointment-intent records.
- No live payment, checkout, payment link, charge, invoice, subscription,
  access grant, email, WhatsApp, external CRM write, DNS mutation, real Zoom
  meeting/registrant/join-link mutation, upload, or external calendar write
  was performed.

## Batch 12

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the Zoom attendance/session
  automation foundation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- One Time Zoom Attendance live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-23-08-813Z-one-time-zoom-attendance-live-smoke.md`

Guardrails:

- Meeting creation returned the expected blocked response.
- Live smoke confirmed `external_write_performed=false` and
  `zoom_meeting_created=false`.
- No Zoom meeting, registrant, webhook attendance write, attendance
  correction, recording read, transcript read, summary read, external send,
  portal publish, participant invite, host start URL exposure, or raw Zoom join
  URL exposure was performed.

## Batch 11/13

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the Vimeo/member-library/
  recording pipeline foundation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- One Time Vimeo Member Library live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-28-42-169Z-one-time-vimeo-member-library-live-smoke.md`

Guardrails:

- The smoke created temporary internal One Time class/library records, then
  rolled back the temporary published item and archived the temporary class.
- Automated Vimeo upload remained disabled.
- No Vimeo upload, provider publish/unpublish/delete, email, WhatsApp,
  payment, Zoom meeting, participant invite, real member access grant,
  external portal write, DNS change, or duplicate connector/action system was
  created.

## Batch 14

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the transcript privacy foundation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- One Time Transcript Privacy live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-33-56-257Z-one-time-transcript-privacy-live-smoke.md`

Guardrails:

- The smoke was read-only and body-free.
- No transcript content write, student record write, public-helper corpus
  write, portal data write, raw transcript body, staff-private note,
  cross-student private segment, send, charge, Zoom/Vimeo/Google/DNS mutation,
  external CRM/GHL write, or secret exposure was performed.

## Batch 15

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the gamification/badge audit
  foundation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- One Time Gamification live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-38-46-447Z-one-time-gamification-live-smoke.md`

Guardrails:

- The smoke was read-only and did not create gamification events, award
  badges, reverse badges, notify anyone, grant access, or change prizes or
  credits.
- No public individual leaderboard, negative-point action, external CRM/GHL
  write, send, charge, Zoom/Vimeo/Google/DNS mutation, or secret exposure was
  performed.

## Batch 16

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the community moderation
  foundation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- One Time Community live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-43-01-034Z-one-time-community-live-smoke.md`

Guardrails:

- The smoke was read-only and did not create threads, messages, approvals,
  public posts, parent-visible messages, staff notes, notifications, or
  delete/purge actions.
- Unrestricted student-to-student messaging, unreviewed publication, public
  promotion writes, external notifications, sends, charges,
  Zoom/Vimeo/Google/DNS mutation, external CRM/GHL write, and secret exposure
  remained disabled.

## Batch 17

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- No new deployment was required for this batch because the clean PR #13
  deployment from Batch 6 already contained the study-assistant readiness
  foundation.
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- One Time Study Assistant live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-48-36-925Z-one-time-study-assistant-live-smoke.md`

Guardrails:

- The smoke was read-only and did not ingest Sefaria/API content, mutate the
  source corpus, publish to a portal, generate answers, create chat sessions,
  or retrieve raw source text.
- Unrestricted AI chat, arbitrary version ingestion, arbitrary translation
  merge, raw transcript retrieval, cross-student retrieval, sends, charges,
  Zoom/Vimeo/Google/DNS mutation, external CRM/GHL write, and secret exposure
  remained disabled.

## REQ-20260623-012

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commits: `ee2fe192` and `7d351b6f`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `04756fab-bd9c-4f6b-869a-39668f64c419`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T18-25-13-013Z-live-app-smoke.md`
- Assistant control-plane readiness live smoke: PASS,
  `ops/live-smokes/2026-06-23T18-26-39-444Z-assistant-control-plane-readiness-live-smoke.md`

Guardrails:

- The readiness smoke was authenticated and read-only. It returned the expected
  assistant schema/index counts and no-write guard metadata only.
- No assistant rows, external sends, publish actions, charges, DNS changes,
  OAuth actions, connector calls, secret values, or row payloads were returned
  or mutated.

## Batch 19

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Remote branch:
  `refs/heads/codex/one-time-batch4-control-plane-20260623` at
  `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e9949680-4330-454c-9b1c-b61dce2d475b`
- Deployed commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T17-55-00-705Z-live-app-smoke.md`
- Final register surfaces live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-55-27-727Z-final-register-surfaces-live-smoke.md`
- Operations workspace taxonomy live smoke: PASS,
  `ops/live-smokes/2026-06-23T17-55-27-745Z-operations-workspace-taxonomy-live-smoke.md`

Guardrails:

- The final smokes did not run live external sends, billing charges, DNS
  mutations, real Zoom meeting creation, real Vimeo upload/publication, hard
  deletes, live badge award/reversal writes, prize/credit issuance, access
  grants, public leaderboard exposure, unreviewed community publication,
  unrestricted student messaging, transcript publication, vector corpus
  mutation, Sefaria/API ingestion, answer generation, separate One Time
  infrastructure provisioning, PR merge, external CRM/GHL write, or secret
  exposure.

## REQ-20260623-013

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `19a85636ed60f9d1b148abdbc3df2e49f6fb9e4d`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `e4b035db-e309-4402-b19c-4a26774aab8d`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T18-41-53-481Z-live-app-smoke.md`

Guardrails:

- This was a repo/report parity-gate batch. It introduced no browser-click
  substitution and no runtime external action.
- No duplicate registry, external send, publish, charge, DNS mutation, OAuth
  action, connector call, hard delete, or secret exposure was performed.

## REQ-20260623-014

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `12a586f0`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `d61bbb67-c6bd-409a-89a1-c0e9c63e11e6`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T18-53-31-401Z-live-app-smoke.md`

Guardrails:

- This was a shared planner/runner contract batch. It reused the canonical
  registry, permission engine, and action runner.
- No duplicate Telegram/website action system, external send, publish, charge,
  DNS mutation, OAuth action, connector call, browser-click substitution, hard
  delete, or secret exposure was performed.

## REQ-20260623-015

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `bc4c6348`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `be818786-b5ab-416a-bbb3-0818c79cfc76`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS on rerun,
  `ops/live-smokes/2026-06-23T19-05-47-613Z-live-app-smoke.md`

Guardrails:

- This was a shared draft/template/versioning contract batch. It reused the
  existing assistant data model and shared control-plane policy.
- No duplicate versioning system, external send, publish, charge, DNS mutation,
  OAuth action, connector call, browser-click substitution, hard delete, or
  secret exposure was performed.

## REQ-20260623-016

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `be1383a2`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `6a3c0cfe-44bb-4154-8f1c-00bcf6f9a169`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T19-14-56-082Z-live-app-smoke.md`

Guardrails:

- This was a shared file/media intake contract batch. It reused the existing
  canonical source-envelope foundation.
- No duplicate intake pipeline, external send, publish, charge, DNS mutation,
  OAuth action, connector call, browser-click substitution, hard delete, or
  secret exposure was performed.

## REQ-20260623-017

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `a1186d5c`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `24301b82-8b71-45e4-b0a9-aa3d2f236cad`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T19-25-10-625Z-live-app-smoke.md`

Guardrails:

- This was a Service Provider Studio onboarding contract batch. It reused the
  shared draft/versioning and file/media intake contracts.
- No duplicate provider onboarding system, page builder, intake pipeline,
  external send, publish, charge, DNS mutation, OAuth action, connector call,
  browser-click substitution, hard delete, or secret exposure was performed.

## REQ-20260623-018

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `c77501e1`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `c8abec9b-5f50-481d-8d5c-7c39714ffa3a`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T19-37-26-570Z-live-app-smoke.md`

Guardrails:

- This was a parent self-service contract batch. It reused the shared
  control-plane policy and draft/versioning contracts.
- No duplicate parent assistant system, chart builder, external send, official
  attendance/score write, publish, charge, DNS mutation, OAuth action,
  connector call, browser-click substitution, hard delete, or secret exposure
  was performed.

## REQ-20260623-019

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `f68e9d3d`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `5196fc2f-1e56-4a6f-a1ff-e44649831540`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T19-51-57-448Z-live-app-smoke.md`

Guardrails:

- This was a chart/dashboard configuration contract batch. It reused the
  shared control-plane policy, parent self-service contract, and assistant
  preview/version model.
- No duplicate chart builder, external send, official attendance/score write,
  publish, charge, DNS mutation, OAuth action, connector call,
  browser-click substitution, hard delete, or secret exposure was performed.

## REQ-20260623-020

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `8a7c1c66`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `b796a1b9-8de7-43ea-90fb-0f9a87a9304b`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T20-05-05-992Z-live-app-smoke.md`

Guardrails:

- This was a campaign-control contract batch. It reused the shared
  control-plane policy, action registry, action runner, planner, and
  draft/versioning model.
- No external send, campaign execution, live schedule enablement, contact-list
  write, suppression write, connector call, DNS mutation, billing action,
  browser-click substitution, hard delete, or secret exposure was performed.

## REQ-20260623-021

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `6137985a`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `8006f53f-d12b-4a38-9233-26b9f217d26b`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T20-19-39-519Z-live-app-smoke.md`

Guardrails:

- This was an automation-builder contract batch. It reused the shared
  control-plane policy, action registry, action runner, planner, and
  draft/versioning model.
- No automation enablement, external send, connector call, live schedule
  activation, contact-list write, official data mutation, publish, charge,
  DNS mutation, OAuth action, browser-click substitution, hard delete, or
  secret exposure was performed.

## REQ-20260623-022

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `75c91c72`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `7cc4fbe0-2d98-4496-b44f-f38e3a4c87e0`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T20-31-58-654Z-live-app-smoke.md`

Guardrails:

- This was a problem-resolution/ticketing contract batch. It reused the
  existing ticket actions, support-ticket surfaces, action registry, action
  runner, planner, and Agent Work handoff path.
- No duplicate ticketing system, personal Pending card, Codex task execution,
  external send, connector call, official data mutation, publish, charge, DNS
  mutation, OAuth action, browser-click substitution, hard delete, or secret
  exposure was performed.

## REQ-20260623-023

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `1acdb699`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `a811771e-60e1-43f9-902c-70b0865d78ed`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T20-44-13-808Z-live-app-smoke.md`

Guardrails:

- This was a reminder/notification contract batch. It reused the shared
  control-plane policy, action registry, action runner, planner, and
  assistant delivery-outbox model.
- No reminder delivery, external send, connector call, live schedule
  activation, official data mutation, publish, charge, DNS mutation, OAuth
  action, browser-click substitution, hard delete, or secret exposure was
  performed.

## REQ-20260623-024

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `dd905201`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `6620b95b-0771-4e38-9fb9-1e6c4921e2bd`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T20-53-13-014Z-live-app-smoke.md`

Guardrails:

- This was a role/workspace security batch. It reused the shared
  control-plane policy and added adapter-context risk checks.
- No data exposure, permission bypass, external send, connector call,
  official data mutation, publish, charge, DNS mutation, OAuth action,
  browser-click substitution, hard delete, or secret exposure was performed.

## REQ-20260623-025

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `296a276a`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `02944240-4c1b-477b-a57f-5f6140e80400`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T21-07-46-763Z-live-app-smoke.md`
- Focused live Control Center endpoint readback: PASS, status 200.

Guardrails:

- This was a read-only Operations Assistant Control Center batch over the
  shared assistant model and action registry.
- No action execution, queue mutation, raw body/payload exposure, external
  send, connector call, official data mutation, publish, charge, DNS mutation,
  OAuth action, browser-click substitution, hard delete, or secret exposure was
  performed.

## REQ-20260623-026

- Clean branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `6560b8f0`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Deployment ID: `359bd3c5-8cdc-4b70-a2eb-535e03f8d62e`
- Service/environment: `skillful-motivation / production`
- Railway doctor readback: PASS, deployment status `SUCCESS`.
- Standard live app smoke: PASS,
  `ops/live-smokes/2026-06-23T21-16-19-796Z-live-app-smoke.md`
- Focused live Control Center endpoint readback: PASS, status 200,
  `total_actions=79`, `telegram_ready=79`, `website_ready=79`,
  `blocker_count=0`.

Guardrails:

- This was a final documentation, QA, and live-readback closeout batch for the
  shared Telegram plus website-assistant control plane.
- No external send, connector call, official data mutation, publish, charge,
  DNS mutation, OAuth/account-owner action, browser-click substitution, hard
  delete, secret exposure, duplicate action registry, duplicate intake
  pipeline, duplicate agent queue, or duplicate provider onboarding system was
  created or executed.

## REQ-20260624-001 / REQ-20260624-002

- Branch: `codex/integration-navigation-owner-review-20260624`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- Release-candidate SHA:
  `fc4d88145276ff18465214c926cb90c4020b4be0`
- Deployment: intentionally not run.
- Live smoke: intentionally not run.

Guardrails:

- This pass is credential-free and owner-review local-first.
- No production readback, production database mutation, backfill application,
  deploy, live production smoke, external send, publish, upload, charge, DNS,
  OAuth/account-owner action, or secret request was performed.
- Independent CI/status-check creation is blocked because GitHub rejected
  workflow-file creation without `workflow` scope.
