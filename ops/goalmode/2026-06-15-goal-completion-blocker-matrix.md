# Goal-Mode Completion And Blocker Matrix

Date: 2026-06-15

Source brief:
`C:\Users\User\Downloads\BNA_Codex_GoalMode_Google_Onboarding_CRM_Workspace_Followup_2026-06-14.md`

Purpose: give the next BNA/Codex session a phase-by-phase readout of the
2026-06-14 goal-mode follow-up. This is a local audit artifact only. It does
not deploy code, send messages, write to Google/Drive/Classroom, write to
Buffer/social, write to WhatsApp/email, create checkout/access, publish member
content, or touch Rabbi Scheller's live site.

## Status Legend

- `done_deployed`: code/UI/API changed, deployed, and live-smoked.
- `done_local`: local doc/test/audit artifact complete; no deployment needed.
- `preview_ready`: usable internal preview/readiness path exists, but live
  external execution is intentionally blocked.
- `blocked_owner_or_connector`: the next live step needs owner approval,
  credentials, OAuth/scope approval, connector access, or a rollback/smoke plan.

## Phase Matrix

| Phase | Brief area | Current status | Evidence | Remaining blocker |
|---|---|---|---|---|
| Phase 0 | Preflight and dirty worktree recovery | done_deployed | Named safety snapshots/stash notes and goal-mode handoffs preserve the dirty worktree before later deploys. | Continue preserving unrelated dirty-tree work; do not reset or revert user changes. |
| Phase 1 | Immediate public/student/parent privacy hotfix | done_deployed | Parent onboarding/login privacy fix, student stale-code clearing, public homepage aggregate Torah summary, Phase 1 route smoke, and deployed student portal auth audit/rate-limit policy are verified and documented in the goal report. Latest auth evidence: Railway deployment `367994a3-04b6-4de4-8abd-0061d68222bf`, live app smoke `ops/live-smokes/2026-06-15T08-16-28-472Z-live-app-smoke.md`, and targeted auth audit smoke `ops/live-smokes/2026-06-15T08-18-36-134Z-student-auth-policy-live-smoke.md`. | Keep repeating public route smoke after future public/portal changes; do not add student PIN/password until account rollout, parent consent, recovery, support owner, retention, smoke, and rollback are approved. |
| Phase 2 | Google strategy, Operations Google MVP, natural-language Google actions | preview_ready | Google readiness/settings module, Google action audit view, Classroom topic/material preview, calendar launch preview, live-adapter approval packet, and public OAuth verification packet are tested. | Live adapters require OAuth/test users, scopes, target IDs, rollback, focused smoke, and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`; public OAuth submission separately requires `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET` plus final Cloud Console scope categories, privacy/deletion URLs, demo evidence, and test-user smoke evidence. |
| Phase 3 | Rabbi Scheller / One Time app access and backend audit | preview_ready | Official app audit, access/backend readiness audit, task-flow audit, and billing provider packet exist with tests. | Live app URL, admin/member credentials, deployment target, provider decision, checkout/access policy, and owner approval are still required. |
| Phase 4 | Service provider, parent accountability, Rabbi Mishnah lead-capture bots | done_deployed | Provider join, parent accountability lead capture, One Time onboarding intake, bot ticket capture, and observable Codex queue lifecycle are deployed and tested. | Outbound messages, checkout/access, and external connector writes remain separate approval-gated steps. |
| Phase 5 | BNA Helper mobile behavior, timing/copy, knowledge, one helper, tools | done_deployed | Public helper mobile sheet, one-helper surfaces, source-boundary guard, assistant onboarding coach, assistant onboarding intake capture, action registry, and helper tool coverage are deployed and tested. Latest intake evidence: Railway deployment `39012fde-d811-4c8d-853f-8b52da7eb2b8`, live app smoke `ops/live-smokes/2026-06-15T11-50-12-417Z-live-app-smoke.md`, and targeted onboarding intake smoke `ops/live-smokes/2026-06-15T11-50-42-993Z-assistant-onboarding-intake-live-smoke.md`. | Sensitive tools still require explicit approval and must stay preview/dry-run first. |
| Phase 6 | Communications, WAPI, CRM repair | done_deployed | WAPI phonebook report/correction overlay, local lead-candidate review importer, local communication history, Telegram note-to-CRM, parent announcement approval/readback, and Contacts People/WAPI history are deployed/tested. Latest evidence: Railway deployment `988985c6-f310-4f84-b169-85878aa16d3c`, live app smoke `ops/live-smokes/2026-06-15T07-48-33-953Z-live-app-smoke.md`, and no-write WAPI lead-candidate preview smoke `ops/live-smokes/2026-06-15T07-49-22-656Z-wapi-lead-candidate-preview-live-smoke.md`. | Live WhatsApp/email sends and any external CRM write remain blocked; active CRM stays first-party BNA, not GHL. |
| Phase 7 | Settings, filters, workspace UI cleanup | done_deployed | SaaS shell, workspace switcher/context, admin users/external access, roles/policy matrix, Operations Integrations/Automations settings, filter menus, the local external-access persistence workflow packet, and the deployed dry-run external-access preview endpoint/form are tested. | New external-user persistence remains disabled until `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` plus target person, workspace, role/access, delivery/no-send policy, review date, rollback owner, and readback are approved. |
| Phase 8 | Task manager and Decisions repair | done_deployed | Retitle helper, task/decision helper bundle, decision-card context polish, selected-day calendar actions, and canonical observable agent-job lifecycle are deployed/tested. | Human decisions must stay in Decisions/Pending; Codex/system lifecycle stays on agent jobs. |
| Phase 9 | Integrations, automations, drips, prompts | preview_ready | Automation Library / Prompt Browser, approval decision preview controls, and approval-readiness packets are deployed/read-only. | Live drips/automations require sender/recipient policy, connector config, approval phrase, rollback, and smoke evidence. |
| Phase 10 | Alerts and notifications | done_deployed | First-party in-app notification storage, preferences, hooks, alert center, and update actions are deployed/tested as no-send notifications. | External notification delivery remains separate and unapproved. |
| Phase 11 | Rabbi Mishnah forum/gamification moderation plan | preview_ready | Forum/gamification moderation plan, private first-party question moderation queue, private question digest preview, and no-public-forum tests are complete/deployed. Latest digest evidence: Railway deployment `b43bdbf2-1526-4cab-86e8-a527f6e76b42`, live app smoke `ops/live-smokes/2026-06-15T13-21-40-918Z-live-app-smoke.md`, and targeted digest smoke `ops/live-smokes/2026-06-15T13-22-30-000Z-one-time-question-digest-live-smoke.md`. | Public/member question surfaces, answers, rewards, leaderboards, and notifications remain blocked until moderation, safety, visibility, and send approvals exist. |
| Phase 12 | Provider login / provider access bug | done_deployed | Provider login audit/implementation, provider portal, scoped provider access, Admin Users external access, and provider setup paths are tested/deployed. | Rabbi-owned One Time app login credentials and live app admin access are not created by BNA. |
| Phase 13 | Content library and thumbnails | done_deployed | One Time content library workspace, class media intake, hosted media URL support, thumbnail preview UI, meeting drops, content/media workflow, first-party `one_time_member_library_items` publishing tables, Class Package Manager, publish/rollback/smoke admin APIs, and public `/member-library` access-code readback are deployed/tested. Focused live smoke: `ops/live-smokes/2026-06-15T07-10-48-018Z-one-time-member-library-live-smoke.md`. | Using the member-library publishing path for a real item still requires destination, visibility/audience, hosted media, smoke item, rollback/revoke, and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`. Binary upload, Drive/video-host writes, public forum/answer visibility, and sends remain separate approval-gated future work. |
| Phase 14 | Social scheduling | done_deployed | Social schedule package preview, Buffer approval packet, and hosted image/video asset payload support are deployed/tested without unapproved external writes. Buffer `createPost` now uses the current ordered `assets` array for direct hosted media URLs and rejects local/Drive preview URLs before a Buffer write. Evidence: Railway deployment `a6c7b3a4-0e2c-456a-9a26-f93af982f2fa`, live app smoke `ops/live-smokes/2026-06-15T07-40-12-729Z-live-app-smoke.md`, and no-write hosted-media preview smoke `ops/live-smokes/2026-06-15T07-41-24-838Z-buffer-hosted-media-preview-live-smoke.md`. | Actual Buffer draft/publish still requires approved source material, channels/accounts, copy, schedule window, stable direct hosted media, rollback/no-post policy, and `APPROVE_BUFFER_SOCIAL_DRAFT`. BNA still does not host/upload local media files to Buffer. |
| Phase 15 | Tests and deploy | done_deployed | Runtime slices were syntax checked, focused tested, full-suite tested, Railway deployed when runtime changed, Railway doctored, and live-smoked. | Docs/test-only slices correctly skip deploy; any future runtime slice must deploy and live-smoke before completion. |
| Phase 16 | Reports and tracking | done_local | Goal report, handoffs, changelog, task ledger, daily memory, and this matrix are updated. | Keep append-only ledger/changelog entries for each future completed, deployed, failed, or blocked slice. |

## Current Owner Decisions

Use `ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md` for the
copy-paste templates and required fields.

- Google live adapter smoke: approve OAuth/test-user/scope setup, target IDs,
  rollback, and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Google public OAuth verification: review
  `ops/google-integrations/google-public-oauth-verification-packet.md`, then
  approve final scopes, Cloud Console categories, privacy/deletion/support
  URLs, demo video, test-user smoke evidence, Google verification email owner,
  rollback plan, and
  `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET` before preparing or
  submitting the public verification packet.
- One Time member-library publishing smoke/use: the first-party path exists,
  but approve destination, visibility/audience, hosting/media path, smoke item,
  rollback/revoke, and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` before any
  real member-visible item is published.
- One Time question digest/public forum: the private digest preview is deployed
  for Rabbi-facing review, but public/member question surfaces, answer
  publishing, rewards, leaderboard behavior, or notifications still need
  explicit moderation, safety, visibility, and send approval.
- One Time billing provider: choose Green Invoice, Stripe, or a short manual
  bridge from `ops/rabbi-scheller/green-invoice-billing-options.md`; approve
  price/currency, first-cycle rule, subscription anchor, access-start rule,
  refund/cancellation option, failed-payment grace, support owner, and
  rollback/revoke owner.
- Buffer/social draft or publish: approve source material, channels/accounts,
  copy, schedule window, hosted media path, no-post/rollback policy, and
  `APPROVE_BUFFER_SOCIAL_DRAFT`.
- Rabbi live app access: confirm live URL/deployment target, Shloimie/admin
  login or reset path, Rabbi/member test account, database/media/email/billing
  providers, and safe rollback before any live app writes.
- External Access persistence: review
  `ops/access/external-access-persistence-workflow.md`, then approve target
  person, workspace, role/access level, scoped Operations username,
  delivery/no-send policy, review date, rollback owner, readback, and
  `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` before enabling create/edit.

## Guardrail

The next useful Codex work should be either a clearly scoped local/readiness
artifact or an owner-approved live adapter smoke. Do not convert a blocked
connector, billing, payment links, media, social, email, WhatsApp,
member-access, or Rabbi live-site lane into a hidden background write.
