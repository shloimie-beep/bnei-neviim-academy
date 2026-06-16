# Google / Onboarding / Helper / CRM / Workspace Follow-Up

Date: 2026-06-14

## Current Branch

`cleanup/onboarding-helper-crm-workspace-rabbi`

## Safety Snapshot

- `safety/pre-goalmode-google-onboarding-crm-20260614-173354`
- `.runtime/pre-goalmode-dirty-worktree-20260614-173354.patch`
- `.runtime/pre-goalmode-git-status-20260614-173354.txt`

## 2026-06-15T16:49:30+03:00 - Owner Approval Pack Numbering Fixed

Corrected the local owner approval unblocker pack after adding the One Time
question public/member approval lane:

- Renumbered the sections so `One Time Question Digest / Public Q&A Surface`
  is section 3.
- Shifted billing, Buffer/social, Rabbi live app access, External Access, and
  Google public OAuth verification to sections 4 through 8.
- Updated the Google public OAuth packet test to point to the new section
  number.
- Added test coverage that asserts the approval-pack headings appear in the
  exact intended order.

Verification passed:

- PASS focused owner-pack / Google OAuth / matrix tests 11/11

Guardrails:

- Docs/tests only; no deployment required.
- No approval, send, publish, billing, access grant, member visibility,
  Google/Drive/Classroom/Business Profile action, Buffer/social action, WAPI,
  external CRM, or Rabbi live-site write was performed.

## 2026-06-15T16:31:15+03:00 - One Time Question Public/Member Approval Gate Deployed

Completed the next no-write handoff/approval slice after the private question
digest preview:

- Added `APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE` to the owner approval
  unblocker pack.
- Added the same lane to Operations Settings > Advanced > Approval Gates as
  `One Time question public/member surface`.
- The required fields now force a source review/digest item, target surface,
  answer visibility, Rabbi/admin reviewer, student identity policy,
  reward/badge policy, leaderboard policy, notification policy, safety owner,
  rollback/unpublish path, and smoke readback before any public/member Q&A
  behavior is approved.
- Refreshed the goal-mode blocker matrix so Phase 11 includes the deployed
  private digest preview and keeps public/member surfaces, rewards,
  leaderboards, and notifications blocked.

Verification passed:

- PASS focused gateboard/pack/matrix/One Time tests 22/22
- PASS full `npm test` 537/537
- PASS Railway deployment `020a76c5-7a86-4bf0-b6ea-719417bcc211`
- PASS Railway doctor SUCCESS
- PASS live app smoke
  `ops/live-smokes/2026-06-15T13-30-27-504Z-live-app-smoke.md`
- PASS targeted live gateboard/digest guardrail readback
  `ops/live-smokes/2026-06-15T13-31-15-000Z-one-time-question-public-surface-gate-live-smoke.md`

Guardrails:

- No public forum post was created.
- No member-visible answer was published.
- No reward, badge, leaderboard, student identity exposure, or notification
  behavior was enabled.
- No email, WhatsApp, SMS, Telegram, portal, Google, Buffer/social, billing,
  member-library, WAPI, external CRM, or other connector write was performed.

## 2026-06-15T16:22:30+03:00 - Private One Time Question Digest Preview Deployed

Completed the next private Phase 11 readiness slice without creating a public
forum or any send/write path:

- Added a read-only `digest_preview` payload to
  `GET /api/bna/one-time/question-moderation`.
- The digest groups private review rows into Rabbi-facing sections:
  needs triage, ready for Rabbi review, needs source-sheet support, needs
  parent/member-safe response, needs clarification, duplicate grouped, and
  rejected private.
- Added Operations Content > One Time Library `Private Question Digest
  Preview`.
- The panel shows section counts, preview rows, duplicate-topic candidates,
  recommended next steps, and guardrails.
- Preview items intentionally omit submitter labels/identity.

Verification passed:

- PASS `node --check server.js`
- PASS focused One Time moderation/forum/action tests 42/42
- PASS full `npm test` 536/536
- PASS Railway deployment `b43bdbf2-1526-4cab-86e8-a527f6e76b42`
- PASS Railway doctor SUCCESS
- PASS live app smoke
  `ops/live-smokes/2026-06-15T13-21-40-918Z-live-app-smoke.md`
- PASS targeted live digest readback
  `ops/live-smokes/2026-06-15T13-22-30-000Z-one-time-question-digest-live-smoke.md`

Guardrails:

- No public forum was created.
- No member-visible answer was published.
- No email, WhatsApp, SMS, Telegram, or portal notification was sent.
- No Google, Buffer/social, billing, member-library, WAPI, external CRM, or
  other connector write was performed.

## 2026-06-15T16:14:03+03:00 - Owner Approval Gateboard Deployed

Completed the next no-write coordination slice for the remaining approval
lanes:

- Added Operations Settings > Advanced > Approval Gates.
- The gateboard lists the exact remaining owner approval/confirmation phrases:
  Google live adapter, One Time member-library publishing, One Time
  billing/refund policy, Buffer/social, Rabbi live app access/reset, External
  Access persistence, and Google public OAuth verification.
- Each card shows required fields and guardrails before Shloimie gives an
  approval.
- The page copies phrases only. It does not submit approvals or run any live
  action.
- Refreshed the goal-mode blocker matrix so Phase 7 no longer says the
  external-access dry-run endpoint is missing; the endpoint/form is deployed,
  while real persistence remains approval-gated.

Verification passed:

- PASS focused Operations/matrix/owner-pack tests 15/15
- PASS full `npm test` 536/536
- PASS Railway deployment `6ff9c6f2-4a5c-4cfb-aecd-13d6fa88ecb2`
- PASS Railway doctor SUCCESS
- PASS live app smoke
  `ops/live-smokes/2026-06-15T13-11-58-594Z-live-app-smoke.md`
- PASS targeted authenticated gateboard readback and unauthenticated browser
  redirect smoke
  `ops/live-smokes/2026-06-15T13-14-03-396Z-owner-approval-gateboard-live-smoke.md`

Guardrails:

- No approval, send, publish, billing, checkout, access grant, credential
  creation, Google/Drive/Classroom/Business Profile action, Buffer/social
  action, WAPI action, external CRM write, member-library visibility, or Rabbi
  live-site write was performed.

## 2026-06-15T16:03:12+03:00 - External Access Dry-Run Preview Deployed

Completed the next approval-safe Admin Users / External Access slice:

- Added `POST /api/bna/admin/external-access` as a platform-admin preview
  endpoint.
- The endpoint performs no writes. `dry_run:true` returns a readback package
  for the proposed person, workspace membership, project membership, optional
  access link, audit labels, required readback, and guardrails.
- `dry_run:false` without `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` is
  rejected with `external_write_performed:false`.
- Real persistence remains disabled even if a phrase is supplied; the current
  runtime is intentionally preview-only.
- Added an Admin > Users "External Access Create/Edit Preview" form and result
  panel in `public/operations.html`.
- Updated the External Access workflow packet and contract tests to make the
  dry-run-first runtime explicit.

Verification passed:

- PASS `node --check server.js`
- PASS focused external-access/Admin Users tests 44/44
- PASS full `npm test` 534/534
- PASS Railway deployment `937f5cf9-d824-43ed-93c1-fd532e94864f`
- PASS Railway doctor SUCCESS
- PASS live app smoke
  `ops/live-smokes/2026-06-15T13-02-14-730Z-live-app-smoke.md`
- PASS targeted live endpoint smoke
  `ops/live-smokes/2026-06-15T13-03-12-297Z-external-access-preview-live-smoke.md`

Guardrails:

- Live dry-run smoke returned `success:true`, `status:"preview_ready"`,
  `dry_run:true`, `no_send:true`, and `external_write_performed:false`.
- The planned access link reported `not_created_dry_run`.
- Live non-dry-run smoke without approval phrase returned HTTP 403 with
  `external_write_performed:false`.
- No parent/student/provider/member account, Rabbi live-app credential,
  access link, email, WhatsApp, SMS, Telegram, Google, Buffer, WAPI, external
  CRM, billing, or member-library write was performed.

## 2026-06-15T15:50:35+03:00 - Public Helper File Retrieval Deployed

Completed the helper knowledge upgrade that was left as future work after the
deterministic public helper/SODAS slice:

- Added `src/lib/bna/public-helper-retrieval.js`.
- The hosted public assistant now retrieves bounded, query-scored snippets from
  `public/js/bna-content.js`, curated brand-kit files, safe-status transcript
  markdown, curated helper paths, and existing approved/published DB content
  outputs.
- Transcript markdown with `needs_approval` or `archived` status is excluded
  from the retriever corpus.
- `buildPublicAssistantKnowledgeBase` now receives the visitor message and
  includes retrieved snippets in the public source boundary.
- The assistant may use retrieved snippets as support, but must not claim it is
  trained on the whole transcript library.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/public-helper-retrieval.js`
- PASS focused retrieval/helper/assistant tests 21/21
- PASS full `npm test` 534/534
- PASS Railway deployment `08a1bef5-b9b7-41fc-ac4f-574a73a16731`
- PASS Railway doctor SUCCESS
- PASS live app smoke
  `ops/live-smokes/2026-06-15T12-48-55-011Z-live-app-smoke.md`
- PASS targeted public assistant retrieval smoke
  `ops/live-smokes/2026-06-15T12-50-35-267Z-public-helper-retrieval-live-smoke.md`

Guardrails:

- The live smoke created only a harmless anonymous first-party assistant
  thread.
- No external CRM/GHL, WhatsApp/email, Buffer/social, Google, billing,
  member-library, or Rabbi live-site action was performed.

## Completed In This Pass

- Added BNA Operations API alias:
  `/api/bna/integrations/google/status`.
- Added Operations Settings > Google Workspace.
- Added cards for:
  - Google Drive
  - Google Calendar
  - Google Classroom
  - Google Business Profile
- Cards distinguish no-OAuth/manual, test-user OAuth, and later verification.
- Calendar/Classroom cards use registered dry-run actions:
  - `sync_google_calendar`
  - `sync_google_classroom`
- Google Classroom has a registered topic/material preview action:
  - `classroom_topic_material_preview`
- Drive cards use registered preview-only dry-run actions:
  - `google_drive_find_file_preview`
  - `google_drive_create_doc_preview`
  - `google_drive_create_folder_preview`
  - `google_drive_move_file_preview`
- Google readiness status now merges real OAuth rows from
  `bna_google_connections` into the Operations readiness payload.
- Added confirmation-gated Google connection disconnect/revoke endpoints:
  - `/api/google/connections/:connectionId/disconnect`
  - `/api/bna/integrations/google/connections/:connectionId/disconnect`
- Added approval-gated provider Google Business/Profile link capture:
  `capture_provider_google_business_link`.
- The action stores manual Google profile URLs/Place IDs for provider review
  without calling the live Google Business Profile API.
- Telegram and the web assistant can route natural-language provider Google
  Business/Profile/Maps/Place ID requests into the typed action.
- Added WAPI/Whapi phonebook grouping dry-run report:
  - shared logic: `src/lib/bna/wapi-phonebook-report.js`
  - CLI: `npm run wapi:phonebook-report`
  - API: `/api/bna/wapi/phonebook-report`
  - UI: Operations Communications > WhatsApp > Phonebook grouping.
- The report is read-only/no-send, returns confidence/review flags, includes
  aggregate manual correction candidates, and keeps Nati Freeze/Fries as
  friend/non-lead unless message evidence shows school interest.
- Added Telegram note-to-CRM matcher:
  - shared parser/scorer: `src/lib/bna/telegram-note-to-crm.js`
  - API: `POST /api/bna/contact-communications/match-note`
  - Telegram commands: `/crm_note`, `/whatsapp_note`, `/wa_note`
  - natural-language notes such as "that WhatsApp with X was about Y".
- The matcher reads local WAPI/WhatsApp communications, scores name/phone/text
  clues, and creates a local Telegram/internal CRM note only when the match is
  confident or a communication id is explicit. It never sends WhatsApp
  messages and exposes a dry-run/no-match smoke path.
- Added WAPI/Whapi manual contact correction apply UI:
  - local correction table: `bna_wapi_phonebook_corrections`
  - API: `POST /api/bna/wapi/phonebook-corrections`
  - report overlay/readback for applied corrections
  - Operations Communications > WhatsApp correction buttons for Apply
    recommended, Friend/non-lead, and School interest.
- Correction applies now request a dry-run local CRM write preview first. Final
  apply requires `APPLY_WAPI_CORRECTION` and can update first-party
  `bna_contacts` tags/status plus linked `bna_parent_leads` tags/status/lead
  type. Student, signup, and provider record mutation is skipped. Dry-run calls
  write nothing and return no-send/no-external-write flags.
- Added the full WAPI/Whapi phonebook-first conversation workspace:
  - UI: Operations Communications > WhatsApp > Phonebook Workspace
  - panes: phonebook/contact list, selected conversation timeline, and
    details/notes/related records
  - timeline readback: matched WhatsApp/WAPI communications, Telegram/internal
    CRM notes, related tasks, and support tickets when linked by phone/chat,
    source row, or first-party record ids
  - note action: Add Internal Note writes only local
    `bna_contact_communications` rows with no-send/external-write false
    metadata.
- The workspace does not send WhatsApp messages, create broadcasts, or write
  external CRM records. Manual correction buttons still use the preview/confirm
  guard.
- Added support ticket processed-notification drafts:
  - resolving or closing a support ticket creates a local
    `bna_contact_communications` internal-note draft
  - metadata includes `ticket_processed_notification`, `no_send`, and
    `external_write_performed: false`
  - the route adds an internal ticket comment and returns
    `notification_draft`
  - Operations alerts that the processed notification draft was logged
  - no email, WhatsApp, SMS, Telegram, portal message, or external CRM write is
    sent automatically.
- Workflow N support-ticket roadmap metadata and the One Time Drive setup
  script now document the no-send processed-notification behavior.
- Added and deployed approval-readiness packets for the remaining gated lanes:
  - Operations Settings > Google Workspace now shows a Google Live Adapter
    Approval Packet with OAuth test-user, Drive scope policy, explicit
    external-write confirmation, smoke-evidence, and
    `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` checklist items.
  - Operations Content > One Time Library now shows a One Time Publishing
    Approval Packet with destination, visibility/audience, hosted media
    provider, notification/social channel, smoke-evidence, and
    `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` checklist items.
  - These packets are readiness UI only. They perform no live Google
    read/write, Buffer/social, email, WhatsApp, Drive/video-host, checkout,
    member visibility, or external CRM write.
- Added and deployed local approval decision preview controls for those two
  packets:
  - each `Preview Decision Draft` button calls `create_decision` with
    `dry_run: true`
  - the preview response returns `executed: false` and
    `preview.decision_created: false`
  - no decision task, Google read/write, publishing, send, checkout, member
    visibility, Drive/video-host, Buffer/social, or external CRM write is
    created by the preview.
- Added parent announcement approved-draft persistence/readback:
  - API: `GET /api/bna/parent-announcements`
  - API: `POST /api/bna/parent-announcements`
  - UI: Operations Communications > Announcements
  - durable table: existing `bna_weekly_updates`.
- Parent announcement approval requires `APPROVE_PARENT_ANNOUNCEMENT`, selects
  the parent-visible weekly update locally, and never sends email, WhatsApp, or
  social posts.
- Added task-title cleanup dry-run:
  - script: `scripts/task-title-cleanup-dry-run.mjs`
  - command: `npm run task:title-cleanup`
  - focused test: `tests/task-title-cleanup-dry-run.test.js`.
- The cleanup script is dry-run by default, skips closed tasks unless
  `--include-closed` is supplied, excludes full raw operator wording from
  reports, routes unsafe generated titles to manual review, and requires
  `--apply --confirm APPLY_TASK_TITLE_CLEANUP` before any live task patch.
- Added Rabbi Mishnayos parent/member onboarding lead capture:
  - public page: `/one-time-preview#one-time-onboarding`
  - API: `POST /api/one-time/mishnah/onboarding`
  - focused test: `tests/one-time-onboarding-intake.test.js`.
- The onboarding route supports no-write dry-runs and confirmed local-only
  review record creation for One Time scoped `bna_parent_leads`, Rabbi
  provider-workspace `bna_contacts`, `bna_contact_communications`,
  `bna_support_tickets`, and a Shloimie/Rabbi follow-up `bna_tasks` record.
  It does not create checkout, grant access, send email, send WhatsApp, post
  publicly, or write to an external CRM.
- Added `retitle_task_naturally` helper typed action:
  - registry/action artifacts: `src/lib/actions/registry.js` and
    `ops/action-registry/*`
  - handler: `src/lib/actions/actions/operations.js`
  - Telegram routing: `src/lib/bna/telegram-action-router.js`.
- The retitle action is approval-gated, previews by default, rejects raw
  ramble-looking replacement titles, preserves previous-title provenance as a
  truncated preview, and does not create agent jobs.
- Added `create_one_time_video_library_item` helper typed action:
  - registry/action artifacts: `src/lib/actions/registry.js` and
    `ops/action-registry/*`
  - handler: `src/lib/actions/actions/operations.js`
  - Telegram routing: One Time/Rabbi video-library item/card phrasing
  - schema/readback: internal `bna_content_outputs` types and Operations labels
    for `video_library_item`, `transcript_review`, `thumbnail_brief`,
    `worksheet_draft`, `social_copy_plan`, and `newsletter_plan`.
- The One Time video-library helper is approval-gated, previews by default, and
  writes only scoped first-party `bna_content_jobs` plus internal review output
  rows for project `one_time_mishnah_class`. It does not create member/public
  visibility, Buffer/social drafts, email/WhatsApp sends, video-host writes,
  Drive writes, checkout/access, or external CRM records.
- Added task/decision helper action bundle:
  - `add_decision_option`
  - `schedule_task_on_date`
  - `move_task_workspace`
- These helpers are approval-gated, preview-first, and route from Telegram
  natural language. Approved execution only updates first-party task fields,
  task comments, due/planned dates, or BNA/One Time project scope. They do not
  create Codex jobs, connector writes, WhatsApp/email/social sends, or external
  CRM records.
- Added focused contract test:
  `tests/google-workspace-settings-contract.test.js`.
- Created required docs:
  - `ops/google-integrations/google-now-vs-later-scope-plan.md`
  - `ops/google-integrations/oauth-test-user-plan.md`
  - `ops/google-integrations/google-natural-language-action-map.md`
  - `ops/bna-helper/bna-helper-tool-audit.md`
  - `ops/communications/wapi-crm-audit-and-plan.md`
  - `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md`
  - `ops/goalmode/2026-06-14-google-onboarding-crm-workspace-ui-report.md`
- Added and deployed the small admin Google action audit view requested by the
  scope plan:
  - UI: Operations Settings > Google Workspace > Google Action Audit
  - source: local first-party `botActionLogs`
  - scope: Google/Drive/Calendar/Classroom/Google Business/Profile preview or
    execution action keys
  - guardrail: evidence/readback only; no external Google write is performed.

## Verification Completed

- PASS `node --check server.js`
- PASS focused tests:
  `node --test tests/google-workspace-settings-contract.test.js tests/google-assignment-system.test.js tests/workspace-person-household-provider-contract.test.js tests/operations-saas-crm-redesign.test.js`
- PASS `npm test` 349/349
- PASS local browser smoke on temporary local server:
  - desktop/default viewport rendered 4 Google cards and no console errors.
  - mobile 390x844 rendered 4 cards, no horizontal overflow, and no console
    errors.
- PASS pre-deploy `npm run railway:doctor`.
- PASS pre-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-50-47-870Z-live-app-smoke.md`.
- PASS Railway deployment `e38167f2-5e6d-4447-b9d4-e195375c4315` reached
  SUCCESS.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-52-26-757Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS live Operations Google Workspace browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`.
- PASS Google Action Audit focused contract update:
  `node --test tests/google-workspace-settings-contract.test.js` 3/3.
- PASS local Google Action Audit browser/API smoke:
  `ops/playwright-smokes/2026-06-14-google-action-audit-local/report.md`.
- PASS full `npm test` 382/382.
- PASS Railway deployment `f4f63168-afa4-41e3-8930-a67159c069f1` reached
  SUCCESS for the Google action audit view.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T19-49-14-650Z-live-app-smoke.md`.
- PASS focused live Google Action Audit browser/API smoke:
  `ops/playwright-smokes/2026-06-14-google-action-audit-live/report.md`.
- PASS Railway deployment `d2ee16bc-cacd-4025-a77d-f1d358d1230c` reached
  SUCCESS for the disconnect/readiness follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-02-18-301Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS non-mutating live disconnect route probe with a fake id returned 404
  without touching any real token.
- PASS live Operations Google Workspace disconnect/readiness browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-disconnect-live/report.md`.
- PASS Railway deployment `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` reached
  SUCCESS for the Drive preview action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-07-51-724Z-live-app-smoke.md`.
- PASS live Google Drive preview browser smoke:
  `ops/playwright-smokes/2026-06-14-google-drive-preview-live/report.md`.
- PASS provider Google Business action syntax checks:
  `server.js`, `src/lib/bna/telegram-action-router.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/actions/registry.js`.
- PASS focused provider/action/assistant/Google tests:
  `node --test tests/action-registry-telegram-ui-bot.test.js tests/universal-assistant-contract.test.js tests/google-workspace-settings-contract.test.js tests/service-provider-directory.test.js`
  44/44.
- PASS `npm test` 350/350.
- PASS Railway deployment `03c2c30c-7639-494c-8e05-20863386c054` reached
  SUCCESS for the provider Google Business capture action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-16-29-530Z-live-app-smoke.md`.
- PASS live action catalog/API dry-run smoke:
  `ops/live-smokes/2026-06-14T15-19-19-000Z-provider-google-business-action-smoke.md`.
- PASS WAPI phonebook syntax checks:
  `server.js`, `src/lib/bna/wapi-phonebook-report.js`, and
  `scripts/wapi-phonebook-report.mjs`.
- PASS Operations inline script parse.
- PASS focused WAPI/CRM tests:
  `node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/contact-role-repair.test.js tests/operations-saas-crm-redesign.test.js`
  17/17.
- PASS `npm test` 353/353.
- PASS local WAPI phonebook browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-local/report.md`.
- PASS Railway deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225` reached
  SUCCESS for the WAPI phonebook report follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-40-45-848Z-live-app-smoke.md`.
- PASS live WAPI phonebook API/UI smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-live/report.md`.
- PASS Telegram note-to-CRM syntax checks:
  `server.js`, `scripts/telegram-kimi-bridge.mjs`, and
  `src/lib/bna/telegram-note-to-crm.js`.
- PASS focused Telegram/WAPI tests:
  `node --test tests/telegram-note-to-crm.test.js tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/contact-role-repair.test.js tests/telegram-agent-routing.test.js`
  15/15.
- PASS final `npm test` 357/357.
- PASS local Telegram note-to-CRM endpoint smoke:
  `ops/live-smokes/2026-06-14T15-54-29-499Z-telegram-note-to-crm-local-smoke.md`.
- PASS Railway deployment `73a812e2-572e-4231-a971-20aef4f52450` reached
  SUCCESS for the Telegram note-to-CRM matcher follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-56-27-842Z-live-app-smoke.md`.
- PASS live Telegram note-to-CRM endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T15-57-04-987Z-telegram-note-to-crm-live-smoke.md`.
- PASS WAPI phonebook correction syntax checks:
  `server.js` and `src/lib/bna/wapi-phonebook-report.js`.
- PASS Operations inline script parse.
- PASS focused WAPI/CRM correction tests:
  `node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/contact-role-repair.test.js tests/telegram-note-to-crm.test.js tests/operations-saas-crm-redesign.test.js`
  21/21.
- PASS final `npm test` 358/358.
- PASS local WAPI correction endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T16-08-29-510Z-wapi-phonebook-correction-local-smoke.md`.
- PASS local WAPI correction UI smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-local/report.md`.
- PASS Railway deployment `578fc257-386a-49ef-8103-789ca42d7adc` reached
  SUCCESS for the WAPI manual correction follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-13-56-298Z-live-app-smoke.md`.
- PASS live WAPI correction endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T16-14-54-502Z-wapi-phonebook-correction-live-smoke.md`.
- PASS live WAPI correction UI smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-live/report.md`.
- PASS WAPI correction local CRM tag apply refinement syntax and focused tests:
  `node --check server.js`,
  `node --check src/lib/bna/wapi-phonebook-report.js`,
  focused WAPI tests 5/5, adjacent WAPI/communications/action tests 33/33.
- PASS final combined `npm test` 360/360 after source-of-truth updates.
- PASS Railway deployment `4c152697-dbd0-4dd7-8834-83b483999459` reached
  SUCCESS for the WAPI local CRM tag apply refinement.
- PASS live WAPI correction endpoint dry-run/confirmation-gate smoke:
  `ops/live-smokes/2026-06-14T16-24-46-381Z-wapi-phonebook-correction-live-smoke.md`.
- PASS live WAPI correction browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-correction-live/report.md`.
- PASS parent announcement syntax and Operations inline parse.
- PASS focused parent announcement/community/Operations/portal tests:
  `node --test tests/community-weekly-updates-contract.test.js tests/operations-saas-crm-redesign.test.js tests/parent-student-portal-contract.test.js`
  38/38.
- PASS final `npm test` 360/360.
- PASS local parent announcement endpoint/UI dry-run smokes:
  `ops/live-smokes/2026-06-14T16-26-08-240Z-parent-announcement-local-smoke.md`
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-local/report.md`.
- PASS Railway deployment `e0f3b52d-b16c-4812-8221-3c4d1fbbc05e` reached
  SUCCESS for the parent announcement follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-27-29-418Z-live-app-smoke.md`.
- PASS live parent announcement endpoint/UI dry-run smokes:
  `ops/live-smokes/2026-06-14T16-28-27-990Z-parent-announcement-live-smoke.md`
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-live/report.md`.
- PASS task-title cleanup syntax check:
  `node --check scripts/task-title-cleanup-dry-run.mjs`.
- PASS focused task-title cleanup/watchdog/reconciler tests:
  `node --test tests/task-title-cleanup-dry-run.test.js tests/watchdog-soft-repair.test.js tests/task-queue-reconciler.test.js`
  28/28.
- PASS final `npm test` 367/367.
- PASS live task-title cleanup dry-run:
  `ops/system-audits/2026-06-14T16-37-35-442Z-task-title-cleanup-dry-run.md`
  scanned 304 tasks, skipped 224 closed tasks, found 0 automatic patch
  candidates, and routed 1 active raw-looking title to manual review.
- PASS Rabbi Mishnayos onboarding syntax and browser/script checks:
  `node --check server.js`, preview inline script parse.
- PASS focused onboarding/provider/workspace tests:
  `node --test tests/one-time-onboarding-intake.test.js tests/one-time-preview-page.test.js tests/workspace-person-household-provider-contract.test.js tests/service-provider-directory.test.js`
  23/23.
- PASS final `npm test` 370/370.
- PASS local One Time onboarding endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T-one-time-onboarding-local-smoke.json`.
- PASS local One Time onboarding browser smoke:
  `ops/playwright-smokes/2026-06-14-one-time-onboarding-local/report.md`.
- PASS Railway deployment `8e55d3c5-b958-42b2-b176-ae74df5bfdb8` reached
  SUCCESS for the Rabbi Mishnayos onboarding follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-05-14-786Z-live-app-smoke.md`.
- PASS live One Time onboarding dry-run smoke:
  `ops/live-smokes/2026-06-14T17-06-57-397Z-one-time-onboarding-live-dry-run.md`.
- PASS retitle helper syntax checks:
  `server.js`, `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS focused action/task/watchdog tests:
  `node --test tests/action-registry-telegram-ui-bot.test.js tests/task-title-cleanup-dry-run.test.js tests/watchdog-soft-repair.test.js`
  44/44.
- PASS final `npm test` 372/372.
- PASS Railway deployment `67ba8b4b-2072-4367-b12c-181cfe156424` reached
  SUCCESS for the `retitle_task_naturally` helper action.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-18-12-469Z-live-app-smoke.md`.
- PASS live preview-only retitle action smoke:
  `ops/live-smokes/2026-06-14T17-18-55-172Z-retitle-task-action-live-preview.md`.
- PASS One Time video-library helper syntax checks:
  `server.js`, `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS focused action/One Time tests 58/58.
- PASS final `npm test` 373/373.
- PASS local preview-only One Time video-library action smoke:
  `ops/local-smokes/2026-06-14-one-time-video-library-action-local-preview.json`.
- PASS Railway deployment `e93d2da8-4852-4d82-a260-39b1be5960b2` reached
  SUCCESS for the One Time video-library helper follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-36-34-282Z-live-app-smoke.md`.
- PASS live preview-only One Time video-library action smoke:
  `ops/live-smokes/2026-06-14T17-40-27-one-time-video-library-live-preview.json`.
- PASS task/decision helper syntax checks:
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`.
- PASS focused action suite 24/24.
- PASS final `npm test` 374/374.
- PASS local task/decision helper preview smoke:
  `ops/local-smokes/2026-06-14-task-decision-helper-actions-local-preview.json`.
- PASS Railway deployment `85c15479-f581-45d3-bb53-695fb99f8ac7` reached
  SUCCESS for the task/decision helper action bundle.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-54-55-156Z-live-app-smoke.md`.
- PASS live task/decision helper preview-only action smoke:
  `ops/live-smokes/2026-06-14T17-55-44-901Z-task-decision-helper-actions-live-preview.json`.
- PASS Rabbi shiur/source-sheet helper syntax checks:
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`.
- PASS focused action suite 25/25.
- PASS final `npm test` 375/375.
- PASS local Rabbi shiur/source-sheet preview smoke:
  `ops/local-smokes/2026-06-14-rabbi-content-helper-actions-local-preview.json`.
- PASS Railway deployment `0dd6f6ec-26ca-4fa1-8520-6e8d76790246` reached
  SUCCESS for the Rabbi shiur/source-sheet helper pair.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T18-08-35-649Z-live-app-smoke.md`.
- PASS live Rabbi shiur/source-sheet preview-only action smoke:
  `ops/live-smokes/2026-06-14T18-09-23-665Z-rabbi-content-helper-actions-live-preview.json`.
- PASS referral/moderation helper syntax checks:
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`.
- PASS focused action suite 26/26.
- PASS final `npm test` 376/376.
- PASS local referral/moderation preview smoke:
  `ops/local-smokes/2026-06-14-referral-moderation-helper-actions-local-preview.json`.
- PASS Railway deployment `e54244e1-41dd-40ae-a313-31cc0c49d6e2` reached
  SUCCESS for the referral/moderation helper trio.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T18-25-56-841Z-live-app-smoke.md`.
- PASS live referral/moderation preview-only action smoke:
  `ops/live-smokes/2026-06-14T18-26-48-024Z-referral-moderation-helper-actions-live-preview.json`.
- PASS WAPI phonebook workspace syntax checks:
  `server.js`, `src/lib/bna/wapi-phonebook-report.js`, and
  `tests/wapi-phonebook-report.test.js`.
- PASS Operations inline script parse.
- PASS focused WAPI/communications/CRM tests:
  `node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/telegram-note-to-crm.test.js tests/operations-saas-crm-redesign.test.js`
  19/19.
- PASS final `npm test` 376/376.
- PASS local WAPI workspace browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-local/report.md`.
- PASS Railway deployment `6c9f06bc-6c1b-47b9-980a-4e8baca73eae` reached
  SUCCESS for the WAPI phonebook workspace.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T18-51-33-221Z-live-app-smoke.md`.
- PASS live WAPI workspace browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-live/report.md`.
- PASS support ticket processed-notification syntax checks:
  `node --check server.js` and
  `node --check scripts/setup-one-time-partnership-drive.mjs`.
- PASS Operations inline script parse.
- PASS focused support/Operations/assistant tests:
  `node --test tests/one-time-external-user-portal.test.js tests/operations-saas-crm-redesign.test.js tests/universal-assistant-contract.test.js`
  48/48.
- PASS final `npm test` 383/383.
- PASS local support-ticket processed notification API/DB smoke:
  `ops/live-smokes/2026-06-14T20-39-16-327Z-support-ticket-notification-local-smoke.md`.
- PASS Railway deployment `f64213ae-1cc1-4b2e-a762-a06c3e81f3b1` reached
  SUCCESS for the support-ticket processed-notification draft slice.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-40-31-601Z-live-app-smoke.md`.
- PASS focused live support-ticket processed notification API/DB smoke:
  `ops/live-smokes/2026-06-14T20-42-38-426Z-support-ticket-notification-live-smoke.md`.
- PASS One Time content-library syntax/API/UI checks:
  `node --check server.js`, Operations inline script parse, focused
  One Time/content tests 7/7, and final `npm test` 382/382.
- PASS local One Time content-library browser/API smoke:
  `ops/playwright-smokes/2026-06-14-one-time-content-library-local/report.md`.
- PASS Railway deployment `4a77ab03-a394-4663-b4b7-55957655c6b0` reached
  SUCCESS for the One Time content-library review surface.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T19-20-41-625Z-live-app-smoke.md`.
- PASS live One Time content-library browser/API smoke:
  `ops/playwright-smokes/2026-06-14-one-time-content-library-live/report.md`.
- PASS live Operations task #610 marked done with `agent_status: completed`.
- PASS approval-readiness Operations inline script parse.
- PASS approval-readiness focused contracts 7/7:
  `node --test tests/google-workspace-settings-contract.test.js tests/one-time-content-library-workspace.test.js`.
- PASS final `npm test` 383/383.
- PASS `git diff --check` with only existing LF/CRLF warnings.
- PASS local approval-readiness browser smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-local/report.md`.
- PASS Railway deployment `cdb127bb-0f27-4e9b-b9a1-7adb93d64f19` reached
  SUCCESS for the approval-readiness packets.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-56-48-950Z-live-app-smoke.md`.
- PASS live approval-readiness browser smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-live/report.md`.
- PASS approval decision preview Operations inline script parse.
- PASS approval decision preview focused contracts 7/7:
  `node --test tests/google-workspace-settings-contract.test.js tests/one-time-content-library-workspace.test.js`.
- PASS final `npm test` 383/383.
- PASS local approval decision preview browser smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-local/report.md`.
- PASS Railway deployment `475c598d-e9c3-4a5b-990c-e00f2ef1f070` reached
  SUCCESS for the approval decision preview controls.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T21-27-02-855Z-live-app-smoke.md`.
- PASS live approval decision preview browser smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`.

## Verification To Run Next

No additional verification is needed for the Google Workspace readiness panel,
Drive preview actions, manual provider Google Business link capture action,
WAPI phonebook grouping dry-run report, Telegram note-to-CRM matcher, WAPI
manual correction apply UI, parent announcement persistence/readback,
task-title cleanup dry-run, or Rabbi Mishnayos onboarding lead capture.
No additional verification is needed for `retitle_task_naturally`.
No additional verification is needed for `create_one_time_video_library_item`.
No additional verification is needed for `add_decision_option`,
`schedule_task_on_date`, or `move_task_workspace`.
No additional verification is needed for `create_rabbi_shiur_idea` or
`create_rabbi_source_sheet_task`.
No additional verification is needed for `create_referral_ledger_entry`,
`submit_student_question_for_moderation`, or `review_moderated_question`.
No additional verification is needed for the WAPI phonebook-first conversation
workspace.
No additional verification is needed for support ticket processed-notification
drafts.
No additional verification is needed for the One Time content-library internal
review surface.
No additional verification is needed for the Google Action Audit readback
view.
No additional verification is needed for the public helper mobile-sheet UX
slice.
No additional verification is needed for the public helper source-boundary
guard.
No additional verification is needed for the Google/One Time approval-readiness
packets.
No additional verification is needed for the approval packet decision-preview
controls.
No additional verification is needed for `calendar_batch_launch_plan_preview`.
Continue with the remaining implementation work below.

## Open Implementation Work

- Add live Drive adapters after the scope policy is approved: search/list,
  create folder, create Doc, and move file are preview-only right now.
- Extend One Time content-library work beyond the review surface only after
  approval: member-library publishing, video-host/Drive writes, automated
  transcript/worksheet generation, and public/social/newsletter send workflows
  remain future work.

## Deployment Gate

The Google Workspace readiness panel, Drive preview actions, manual provider
Google Business link capture action, WAPI phonebook grouping dry-run report,
Telegram note-to-CRM matcher, WAPI manual correction apply UI, parent
announcement persistence/readback, Rabbi Mishnayos onboarding lead capture,
retitle helper, One Time video-library helper, and task/decision helper bundle
have cleared the deployment gate. The Rabbi shiur/source-sheet helper pair has
also cleared the deployment gate. The referral/moderation helper trio has also
cleared the deployment gate. The WAPI phonebook-first conversation workspace
has also cleared the deployment gate. The One Time content-library internal
review surface has also cleared the deployment gate. The Google Action Audit
readback view has also cleared the deployment gate. The public helper
mobile-sheet UX slice has also cleared the deployment gate. The public helper
source-boundary guard has also cleared the deployment gate. Support ticket
processed-notification drafts have also cleared the deployment gate. The
Google live-adapter and One Time publishing approval-readiness packets have
also cleared the deployment gate. The approval packet local decision-preview
controls have also cleared the deployment gate. The Rabbi/One Time 8-week
launch-calendar preview action has also cleared the deployment gate. The
task-title cleanup dry-run needed no deployment because it is local CLI/report
tooling only. The broader goal-mode brief is still open for the remaining
Google live adapter and deeper One Time publishing/generation work after
approval.

## 2026-06-14T23:14:34+03:00 - Public Helper Mobile Sheet Deployed

The public BNA Helper mobile behavior from the brief is deployed. Phone-width
public pages open the helper as a partial bottom sheet instead of a full-screen
takeover, keep the underlying page visible, and move the launcher above the
sheet while open so tapping it again minimizes the helper. Public copy now
mentions the current 10-1 program and removes the old "I'm still here" nudge;
desktop remains a side panel.

Verification:
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --test tests/universal-assistant-contract.test.js` 9/9
- PASS full `npm test` 382/382
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-local/report.md`
- PASS Railway deployment `0b9085f7-a10e-41bb-8123-f8ba1c233ac8`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-12-20-143Z-live-app-smoke.md`
- PASS focused live browser smoke:
  `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-live/report.md`

## 2026-06-14T23:26:36+03:00 - Public Helper Source Boundary Deployed

The public BNA Helper knowledge/source guard from the brief is deployed.
Public assistant context now names the current 10-1 program and tells hosted AI
to answer only from public BNA content, role-scoped portal/workspace context,
and server action results. The hosted prompt now explicitly forbids filling
policy gaps from generic school-policy knowledge.

Public allergy/medical policy questions are intercepted before hosted AI with
`public_policy_boundary`; the assistant says no verified BNA policy is present
in current public content and offers to ask Shloimie.

Verification:
- PASS `node --check server.js`
- PASS `node --check src/lib/bna/ai-context.js`
- PASS `node --test tests/universal-assistant-contract.test.js` 9/9
- PASS local public assistant API smoke for `What is the BNA allergy policy?`
- PASS full `npm test` 382/382
- PASS `git diff --check` with only existing LF/CRLF warnings
- PASS Railway deployment `dcb59bc8-835b-4eb7-a951-653b54a389bf`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-25-36-985Z-live-app-smoke.md`
- PASS focused live public assistant API smoke against
  `https://bneineviimacademy.org`

## 2026-06-14T23:42:38+03:00 - Support Ticket Processed Notification Drafts Deployed

Support ticket processed-notification drafts are deployed. Moving a ticket to
`resolved` or `closed` now writes a local
`bna_contact_communications` internal-note draft with
`ticket_processed_notification`, `no_send`, and
`external_write_performed: false` metadata, adds an internal
`bna_support_ticket_comments` audit comment, and returns `notification_draft`
to the Operations client.

Operations shows the operator that the draft was logged and that no email was
sent. The route does not send email, WhatsApp, SMS, Telegram, portal messages,
or external CRM writes automatically. Workflow N support-ticket metadata and
the One Time Drive setup script document the same no-send behavior.

Verification:
- PASS `node --check server.js`
- PASS `node --check scripts/setup-one-time-partnership-drive.mjs`
- PASS Operations inline script parse
- PASS focused tests 48/48
- PASS full `npm test` 383/383
- PASS local API/DB smoke:
  `ops/live-smokes/2026-06-14T20-39-16-327Z-support-ticket-notification-local-smoke.md`
- PASS Railway deployment `f64213ae-1cc1-4b2e-a762-a06c3e81f3b1`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-40-31-601Z-live-app-smoke.md`
- PASS focused live API/DB smoke:
  `ops/live-smokes/2026-06-14T20-42-38-426Z-support-ticket-notification-live-smoke.md`

## 2026-06-14T23:59:28+03:00 - Approval-Readiness Packets Deployed

The two remaining approval-gated lanes now have visible Operations approval
packets. Settings > Google Workspace shows the Google Live Adapter Approval
Packet with `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`. Content > One Time Library
shows the One Time Publishing Approval Packet with
`APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.

Both packets are readiness/checklist UI only. They do not perform live Google
read/write, Buffer/social, email, WhatsApp, Drive/video-host, checkout, member
visibility, or external CRM writes.

Verification:
- PASS Operations inline script parse
- PASS focused approval contracts 7/7
- PASS full `npm test` 383/383
- PASS `git diff --check` with only existing LF/CRLF warnings
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-local/report.md`
- PASS Railway deployment `cdb127bb-0f27-4e9b-b9a1-7adb93d64f19`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-56-48-950Z-live-app-smoke.md`
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-live/report.md`

## 2026-06-15T00:28:12+03:00 - Approval Decision Preview Controls Deployed

The Google and One Time approval packets now have local `Preview Decision
Draft` buttons. Each button calls the typed `create_decision` action with
`dry_run: true` so the operator can see the Shloimie decision shape before
approval without creating a task.

Guardrails:
- The action response must return `executed: false`.
- The action response must return `preview.decision_created: false`.
- No decision task, Google read/write, publishing, send, checkout, member
  visibility, Drive/video-host, Buffer/social, or external CRM write is
  created by the preview.

Verification:
- PASS Operations inline script parse
- PASS focused approval contracts 7/7
- PASS full `npm test` 383/383
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-local/report.md`
- PASS Railway deployment `475c598d-e9c3-4a5b-990c-e00f2ef1f070`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T21-27-02-855Z-live-app-smoke.md`
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`

## 2026-06-15T00:54:22+03:00 - Calendar Launch Preview Action Deployed

The One Time/Rabbi launch-calendar preview action is deployed. Operations
Settings > Google Workspace > Google Calendar now includes an `8-week plan`
dry-run button wired to `calendar_batch_launch_plan_preview`, and Telegram can
route natural-language requests such as "Create the 8-week Rabbi Scheller
launch calendar starting 2026-06-21."

Guardrails:
- The button passes a real object payload rather than `[object Object]`.
- The top-level action request, inputs, and preview all resolve to
  `rabbi_sheller_provider`.
- Without a start date, the preview returns the expected `start_date` blocker.
- With a start date, the action previews the launch-calendar plan only.
- No internal calendar event, Google Calendar event, external write, send, or
  Google OAuth action is performed.

Verification:
- PASS `node --check src/lib/actions/registry.js`
- PASS `node --check src/lib/actions/actions/operations.js`
- PASS `node --check src/lib/bna/telegram-action-router.js`
- PASS Operations inline script parse
- PASS focused action/Google settings tests 30/30
- PASS full `npm test` 384/384
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-local/report.md`
- PASS Railway deployment `f8951767-ca5f-4c58-a8c5-696015f9d3b9`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T21-51-39-727Z-live-app-smoke.md`
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-live/report.md`

## 2026-06-15T01:11:18+03:00 - Classroom Topic/Material Preview Action Deployed

The Google Classroom topic/material preview action is deployed. Operations
Settings > Google Workspace > Google Classroom now includes a `Topic/material`
dry-run button wired to `classroom_topic_material_preview`, and Telegram can
route natural-language requests such as "Put this worksheet under topic Week 1
for course Mishnayos."

Guardrails:
- The button passes a real object payload scoped to the BNA workspace.
- The preview returns the course/topic/material plan, topic lookup/create
  policy, and required external inputs.
- No Classroom read/write, internal write, send, external write, or live
  Google API call is performed.
- Live execution still requires Google Classroom OAuth/test-user scope
  approval, topic ID or explicit topic-create policy, and external-write
  confirmation.

Verification:
- PASS `node --check src/lib/actions/registry.js`
- PASS `node --check src/lib/actions/actions/operations.js`
- PASS `node --check src/lib/bna/telegram-action-router.js`
- PASS Operations inline script parse
- PASS focused action/Google settings tests 31/31
- PASS full `npm test` 385/385
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-local/report.md`
- PASS Railway deployment `72a371b8-50b7-48c8-8cf7-f3efa7b1f8a4`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T22-09-44-742Z-live-app-smoke.md`
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-live/report.md`
- NOTE in-app Browser plugin attempt was blocked by `ECONNREFUSED ::1:9222`;
  Playwright local/live smokes are the verification evidence.

## 2026-06-15T01:24:07+03:00 - Google Business Preview Helpers Deployed

The Google Business/Profile Place ID and accessible-locations preview helpers
are deployed.

- Operations Settings > Google Workspace > Google Business Profile renders
  `Place ID` and `Locations` dry-run buttons.
- `Place ID` calls `google_business_place_id_lookup`.
- `Locations` calls `google_business_list_locations_preview`.
- Telegram can route natural-language Google Business/Profile Place ID and
  accessible-locations requests into the typed preview actions.

Guardrails:
- No Maps lookup, Google Business Profile locations read, GBP API call,
  external read, external write, send, or live Google API call is performed.
- Live GBP execution still requires provider opt-in, `business.manage`
  OAuth/API approval, and explicit external-read/write confirmation.

Verification passed:
- JS syntax checks for the action registry, operations action runner, and
  Telegram router
- Operations inline script parse
- focused action/Google settings tests 32/32
- full `npm test` 386/386
- local smoke:
  `ops/playwright-smokes/2026-06-15-google-business-preview-local/report.md`
- Railway deployment `89294419-27aa-4527-ba8d-c7edcfddf394`
- Railway doctor SUCCESS
- live app smoke
  `ops/live-smokes/2026-06-14T22-22-55-796Z-live-app-smoke.md`
- live smoke:
  `ops/playwright-smokes/2026-06-15-google-business-preview-live/report.md`

## 2026-06-15T01:44:00+03:00 - One Time Publish-Package Preview Deployed

The One Time member-library publishing lane now has a package/blocker preview
without enabling publishing.

- Added `preview_one_time_member_library_publish_package`.
- Operations Content > One Time Library cards can expose `Package Preview`.
- Telegram can route natural-language requests such as "Preview
  member-library publish package for One Time content job #57."
- The preview returns content job id, title, hosted media URL, output statuses,
  review statuses, destination/audience/visibility fields, notification plan,
  rollback plan, approval phrase state, and blockers.

Guardrails:
- No member-library publish, public/member visibility change, Drive/video-host
  write, Buffer/social write, email/WhatsApp send, checkout/access grant,
  external CRM write, live send, or local content write is performed.
- Full member-library publishing remains blocked until destination,
  visibility, hosting, connector, smoke-item, rollback, and
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decisions are explicit.

Verification passed:
- JS syntax checks for the action registry, operations action runner, Telegram
  router, and focused test file
- Operations inline script parse
- focused action/One Time tests 34/34
- full `npm test` 387/387
- local smoke:
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-local/report.md`
- Railway deployment `32573f44-f7a6-4cbd-baa2-432cf6b1e0a6`
- Railway doctor SUCCESS
- live app smoke
  `ops/live-smokes/2026-06-14T22-41-22-482Z-live-app-smoke.md`
- live smoke:
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-live/report.md`

## 2026-06-15T02:09:04+03:00 - One Time App Access Readiness Deployed

The One Time external app/admin/member-library stack now has a deployed
read-only readiness surface.

- Operations Settings > Drive / Social Intake renders `One Time App Readiness`
  in the `rabbi_sheller_provider` workspace.
- Added `GET /api/bna/one-time/app-access-readiness`.
- Updated the One Time Drive/social ingestion runtime fallback plus generated
  JSON/Markdown maps with the same app-access readiness blockers.

Guardrails:
- The readiness check performs no admin password reset, member access grant,
  member-library publish, Drive/video-host write, Resend/email,
  WhatsApp/SMS, checkout/billing write, or external CRM write.
- Actual One Time app/admin/member-library writes remain blocked until
  owner-approved URL/access, Rabbi/member test login, DB/source, media host,
  Resend/domain/copy, billing/access policy, rollback/revoke path, and
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` are explicit.

Verification passed:
- PASS `node --check server.js`
- PASS `node --check scripts/setup-one-time-partnership-drive.mjs`
- PASS focused test syntax checks
- PASS Operations inline script parse
- PASS focused One Time tests 37/37
- PASS full `npm test` 388/388
- PASS local browser/API smoke:
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-local/report.md`
- PASS Railway deployment `55102a5c-f6a6-4866-aacf-d0086ba6b909`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T23-05-50-938Z-live-app-smoke.md`
- PASS live API readback
- PASS live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-live/report.md`

## 2026-06-15T02:18:44+03:00 - Rabbi Task-Flow Audit Local Report

Added a local read-only audit for Rabbi/One Time task-flow cleanup.

- Command: `npm run task:rabbi-flow-audit`.
- Script: `scripts/rabbi-task-flow-audit.mjs`.
- Report:
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`.
- JSON:
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.json`.

Live read-only summary:

- Scanned task count: 305.
- Rabbi / One Time related tasks: 102.
- Active Rabbi / One Time tasks: 51.
- Human blocker or decision: 48.
- Codex-ready: 0.
- Private BNA scope review: 6.
- External-write gate review: 32.
- Visible title review: 2.

Guardrails:

- The audit has no apply mode.
- It writes only local Markdown/JSON reports.
- It redacts private BNA terms in visible title previews.
- It does not patch tasks, move workspace/project ownership, close/reopen
  records, retitle records, send messages, publish content, grant access, or
  write external systems.

Verification passed:

- PASS `node --check scripts/rabbi-task-flow-audit.mjs`
- PASS `node --check tests/rabbi-task-flow-audit.test.js`
- PASS focused task/Telegram tests 41/41
- PASS live read-only audit run
- PASS full `npm test` 392/392

No deployment was required because the change is local CLI/report tooling only.

## 2026-06-15T02:43:00+03:00 - One Time Private Question Moderation Queue Deployed

The private One Time question moderation queue is deployed and verified.

- Added first-party `bna_one_time_question_reviews`.
- `submit_student_question_for_moderation` now persists a private review row
  alongside the private moderation task.
- `review_moderated_question` updates the private review row alongside the
  task/comment.
- Added read-only `GET /api/bna/one-time/question-moderation`.
- Operations Content > One Time Library now renders `Private Question
  Moderation Queue`.

Guardrails:

- The queue is private, read-only from Operations, no-send, no-public-forum,
  and no-member-visible.
- It performs no forum post creation, member-visible answer publishing,
  email/WhatsApp/SMS/portal send, Codex job creation, checkout/access grant,
  Drive/video-host write, or external CRM write.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check src/lib/actions/actions/operations.js`
- PASS focused test syntax checks
- PASS Operations inline script parse
- PASS focused action/One Time tests 68/68
- PASS full `npm test` 393/393 before deploy
- PASS local API smoke and Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-local/report.json`
- PASS Railway deployment `afff8d91-e0aa-426b-94f8-f128b8f57822`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T23-42-19-692Z-live-app-smoke.md`
- PASS live API smoke:
  `ops/live-smokes/2026-06-14T23-42-54-513Z-one-time-question-moderation-live-smoke.md`
- PASS live Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-live/report.json`

Remaining blockers are unchanged: live Google/Classroom/Drive/Google Business
adapters need OAuth/scope/provider approval and
`APPROVE_GOOGLE_LIVE_ADAPTER_TEST`; actual One Time member-library publishing,
public question/forum surfaces, sends, access grants, Drive/video-host writes,
and external connector writes still need explicit owner/provider approval.

## 2026-06-15T03:02:00+03:00 - Operations Automation Library Deployed

The Phase 9 automation/prompt library slice is deployed and live-smoked as a
read-only Operations surface.

- Operations Settings > Automations now renders an Automation Library with 8
  guarded workflow cards.
- Cards cover service-provider onboarding review, parent accountability lead
  follow-up, ticket processed acknowledgement, parent weekly update approval,
  One Time question review alert, One Time 8-week nurture plan, Google
  live-adapter test gate, and Rabbi content added review.
- Each card shows trigger, audience, channel, prompt/template, status,
  last/next evidence, linked records, dry-run preview, and disabled
  approval-required enable controls.
- The Prompt Browser table shows content prompts, assignment prompts, helper
  policies, and no-send/no-external-write guardrails.

Guardrails:

- This is a read-only map and preview surface.
- It performs no external send, publish, billing/access change, member
  visibility change, Google write, Drive/video-host write, checkout/access
  grant, or external CRM write.

Verification passed:

- PASS Operations inline script parse
- PASS focused adjacent tests 45/45
- PASS full `npm test` 396/396
- PASS local Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-automation-library-local/report.json`
- PASS Railway deployment `5d21c82c-d77e-4d5d-a8c2-c1b1129c17a8`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T23-58-42-116Z-live-app-smoke.md`
- PASS live Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-automation-library-live/report.json`

Remaining blockers are unchanged: live automations still need specific
approval, connector/sender configuration, recipient/source policy, rollback
path, and smoke tests before any send/publish/billing/access/member-visibility
or external connector write.

## 2026-06-15T03:40:13+03:00 - One Time Access / Backend Audit Refresh

The exact source-brief audit path has been refreshed and protected by focused
coverage:

- `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md` now consolidates
  the One Time app access/backend readiness picture: repo refs, live/Replit URL
  unknowns, login routes, role/access model, Shloimie login/reset path,
  credential source names only, missing credentials and decisions,
  analytics/billing/Resend/media inventory, BNA preview/readiness surfaces,
  reuse/separation/integration guidance, risks, and safe bootstrap/reset
  guidance.
- `tests/rabbi-scheller-audit-docs.test.js` now asserts that the exact-path
  access/backend audit contains the required readiness sections and no obvious
  secret patterns.

Verification passed:

- PASS `node --check tests/rabbi-scheller-audit-docs.test.js`
- PASS `node --test tests/rabbi-scheller-audit-docs.test.js` 3/3

No deployment was required because this is local documentation/test coverage
only. The live Google adapter and full One Time member-library publishing
approval gates remain unchanged.

## 2026-06-15T03:46:17+03:00 - Forum / Gamification Moderation Plan

Phase 11 now has a local readiness plan before any One Time public/member
forum, answer feed, or reward display is built:

- Added `ops/one-time-mishnah/forum-gamification-moderation-plan.md`.
- Added `tests/one-time-forum-gamification-plan.test.js`.
- The plan requires authenticated-only participation, AI-first moderation,
  human review, blocked categories, temporary holds pending admin review
  instead of automatic bans, quality rewards/badges only after Rabbi/admin
  approval, no public shame, no leaderboard without explicit approval,
  moderation audit/event logging, no-send notification gates, and launch smokes
  before member visibility.

Verification passed:

- PASS `node --check tests/one-time-forum-gamification-plan.test.js`
- PASS `node --test tests/one-time-forum-gamification-plan.test.js` 4/4
- PASS `node --test tests/one-time-forum-gamification-plan.test.js tests/one-time-content-library-workspace.test.js tests/one-time-external-user-portal.test.js` 42/42

No deployment was required because this is local documentation/test coverage
only. No public forum, member-visible feed, reward ledger, send, publish,
access grant, Google/Drive/video-host write, Buffer/social write, checkout, or
external CRM write was performed.

## 2026-06-15T03:51:57+03:00 - Provider Login / Grabify Audit

Phase 12 now has a current-state audit and focused regression coverage:

- Added `ops/provider-intake/provider-login-phase12-audit.md`.
- Added `tests/provider-login-phase12-audit.test.js`.
- The audit records active provider login routes/APIs, setup-token/password
  flow, provider sessions, `requireProviderSession` guards, scoped provider
  payloads, pending-review edits, generic failed-login behavior, prior live
  provider portal smoke evidence, and the fresh live credential smoke checklist
  needed if a current provider-login failure is reported.
- The test protects the current no-Grabify active-source finding across
  `server.js`, `public/provider.html`, `public/operations.html`, and provider
  login tests.

Verification passed:

- PASS `node --check tests/provider-login-phase12-audit.test.js`
- PASS `node --test tests/provider-login-phase12-audit.test.js` 4/4
- PASS `node --test tests/provider-login-phase12-audit.test.js tests/service-provider-directory.test.js` 16/16

No deployment was required because this is local documentation/test coverage
only. No provider password, setup token, login link, email, WhatsApp, billing
action, listing change, or external connector write was created.

## 2026-06-15T04:03:38+03:00 - Social Schedule Preview Action

Phase 14 now has a deployed preview-only Buffer/social scheduling helper:

- Added `preview_social_schedule_package` to the shared action registry and
  operations action handler.
- Added Telegram natural-language routing for scheduling/Buffer/multi-post
  phrases such as "Schedule this Facebook post", "Make 3 posts from this
  video", and "one post per day this week".
- Regenerated `ops/action-registry/actions.json`,
  `ops/action-registry/page-action-map.json`, and
  `ops/action-registry/ui-button-map.md`.
- The action previews target channels, schedule slots, blockers, Buffer
  provider state, and the `APPROVE_BUFFER_SOCIAL_DRAFT` approval phrase.

Verification passed:

- PASS `node --check src/lib/actions/actions/operations.js`
- PASS `node --check src/lib/actions/registry.js`
- PASS `node --check src/lib/bna/telegram-action-router.js`
- PASS Operations inline script parse
- PASS focused action/Telegram test 31/31
- PASS adjacent social/content/automation tests 53/53
- PASS full `npm test` 409/409
- PASS local action-runner smoke:
  `ops/local-smokes/2026-06-15-social-schedule-preview-local.md`
- PASS Railway deployment `cc96c44c-303f-4dab-ada0-e6dd62738d3b`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T01-02-48-717Z-live-app-smoke.md`
- PASS focused live API smoke:
  `ops/live-smokes/2026-06-15T01-03-38-576Z-social-schedule-preview-live-smoke.md`

Guardrail verified: the action performs no Buffer draft write, no Buffer media
upload, no social publish, no send, no local content write, and no external
write. Actual Buffer draft creation remains behind source/channel/copy/schedule
approval, hosted media readiness, rollback/no-post policy, and
`APPROVE_BUFFER_SOCIAL_DRAFT`.

## 2026-06-15T04:24:36+03:00 - One Time Thumbnail Preview UI

Phase 13 now has deployed display-only thumbnail preview UI inside the One
Time library review surface:

- Operations Content > One Time Library cards render a `Thumbnail Preview`
  panel.
- Thumbnail URL lookup reads `thumbnail_brief` metadata, parsed metadata, or
  job thumbnail/image URL fields and only accepts HTTP(S) URLs.
- The panel renders the thumbnail image, status/brief text, `Open Thumbnail`,
  and a `Thumbnail reference missing` fallback.

Verification passed:

- PASS syntax checks
- PASS Operations inline script parse
- PASS focused action/One Time tests 37/37
- PASS full `npm test` 409/409 before deploy
- PASS local renderer-based browser smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-local/report.md`
- PASS Railway deployment `85107895-5677-4580-b3f6-7d91c1e70025`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T01-24-36-196Z-live-app-smoke.md`
- PASS live renderer-based Playwright smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-live/report.md`

Guardrail verified: the preview performs no thumbnail generation/upload,
member-library publish, email/WhatsApp/social send, checkout/access change,
Drive/video-host write, Buffer action, local content write, or external CRM
write.

## 2026-06-15T04:41:29+03:00 - Parent Accountability Lead Capture

The parent/accountability onboarding lane now writes real first-party CRM
records instead of only support-ticket context:

- `POST /api/parent-accountability/onboarding` creates or updates
  `bna_parent_leads` with `lead_type = 'accountability_interest'`.
- The route links the support ticket source context, lead communication note,
  and private in-app Operations notification to the parent lead id.
- Operations Contacts > Interested Parents defaults to all lead categories and
  exposes an `Accountability app interest` filter.
- `dry_run` returns planned records and no-write flags for safe local/live
  smoke testing.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check tests/parent-accountability-onboarding.test.js`
- PASS Operations and parent inline script parse
- PASS focused parent/accountability and adjacent tests 22/22
- PASS full `npm test` 414/414 before deploy
- PASS local dry-run smoke:
  `ops/local-smokes/2026-06-15-parent-accountability-onboarding-local.md`
- PASS Railway deployment `59ec51a1-56b2-4e0d-854a-ee3f8aab5558`
- PASS Railway doctor SUCCESS and live app smoke:
  `ops/live-smokes/2026-06-15T01-38-34-614Z-live-app-smoke.md`
- PASS focused live dry-run/parent/Operations smoke:
  `ops/live-smokes/2026-06-15T01-39-30-000Z-parent-accountability-onboarding-live-smoke.md`

Guardrail verified: dry-run performs no local writes. Real submissions remain
first-party BNA Operations records and perform no email/WhatsApp/Telegram send,
portal send, child-visible goal creation, Google/Drive write, Buffer/social
write, or external CRM write.

## 2026-06-15T05:02:49+03:00 - Google Integrations Module

Operations > Integrations > Google is now the canonical Google readiness
surface:

- Added a first-class Operations Integrations module and Google subtab.
- Routed legacy Google/integration aliases into `view=integrations`.
- Reused the existing Google readiness cards for Drive, Calendar, Classroom,
  and Google Business Profile, including approval packets and the Google Action
  Audit.
- Kept Settings > Google Workspace as a compatibility mirror for old links.
- Allowed the Integrations module for platform/provider workspaces and kept
  parent/household users out of the private integration surface.
- Tightened Google card grid CSS so desktop and mobile layouts do not overlap.

Verification passed:

- PASS `node --check server.js`
- PASS Operations inline script parse
- PASS focused integrations/workspace/automation/provider tests
- PASS full `npm test` 415/415
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-google-integrations-module-local/report.md`
- PASS Railway deployment `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T01-59-10-544Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-google-integrations-module-live/report.md`

Guardrail verified: the page performs no Google API read/write, connector
write, send, publish, access grant, or external CRM write. Live Google adapters
remain blocked until OAuth/test-user/provider approval and
`APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.

## 2026-06-15T05:14:46+03:00 - Provider Foundation Deployment Gate Closed

Closed the older provider onboarding/integrations foundation gate from the
broader onboarding/CRM/workspace brief.

- Verified the current production deployment
  `1a60aabe-b1a7-4adc-a788-de4e71abd0bd` includes the sanitized public
  provider API/index, provider join flow, provider login/setup shell, and
  logged-out parent route behavior.
- PASS `node --check server.js`
- PASS focused provider directory tests 12/12
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T02-11-53-759Z-live-app-smoke.md`
- PASS focused live browser/API smoke:
  `ops/playwright-smokes/2026-06-15-provider-onboarding-foundation-live/report.md`

Guardrail verified: no provider signup, provider intake submission,
parent-provider message, provider reply, email, WhatsApp, billing, Google API
call, connector write, or external CRM write was executed.

## 2026-06-15T05:25:50+03:00 - Mobile Public/Login/Document Matrix

Completed and deployed the mobile screenshot matrix follow-up from the broader
public/private leak and mobile usability work.

- Added reusable live Playwright smoke runner:
  `ops/playwright-smokes/2026-06-15-mobile-public-login-document-matrix-live/run-smoke.mjs`.
- First live matrix found that public registration document pages did not clear
  stale `bnaStudentAccessCode` values.
- Patched `public/documents/registration-document.html` to clear the stale code
  before rendering and added contract coverage.
- Final live matrix covered homepage, public helper open state, English/Hebrew
  signup, all four required registration document pages, parent login,
  parent-accountability onboarding, student login, and provider login at 390px
  mobile width.

Verification passed:

- PASS `node --check server.js`
- PASS smoke script syntax check
- PASS focused assistant/signup tests 15/15
- PASS full `npm test` 415/415
- PASS Railway deployment `e7c5c182-70ff-49cd-b786-ca76de01efc2`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T02-24-39-914Z-live-app-smoke.md`
- PASS live mobile matrix:
  `ops/playwright-smokes/2026-06-15-mobile-public-login-document-matrix-live/report.md`

Guardrail verified: no form submission, provider signup, parent/student login,
assistant send, email, WhatsApp, billing, Google API call, connector write, or
external CRM write was executed.

## 2026-06-15T05:41:35+03:00 - Student Hebrew/RTL Audit

Completed and deployed the student-facing Hebrew/RTL audit follow-up from the
broader onboarding/helper/workspace prompt.

- Student portal question answers now render the localized `answer` label
  instead of hardcoded `Answer:`.
- The Rabbi WhatsApp meeting CTA now renders the localized `whatsappRabbi`
  label instead of hardcoded English copy.
- Added focused contract coverage in
  `tests/parent-student-polish-contract.test.js`.
- Added reusable fixture-backed Playwright runner:
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/run-smoke.mjs`.
- The live audit checks mobile and desktop Hebrew/RTL state, Hebrew student
  display name, mobile agenda-first calendar, calendar drawer, Hebrew Sefaria
  source refs, localized answer label, no mojibake, no horizontal overflow, and
  no private sentinel leakage.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS smoke runner syntax check
- PASS focused assistant/student-polish tests 12/12
- PASS local fixture-backed browser audit
- PASS full `npm test` 415/415
- PASS Railway deployment `8a2d1967-7573-499d-955f-a21f90a990c0`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T02-41-35-249Z-live-app-smoke.md`
- PASS live Hebrew/RTL Playwright audit:
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/report.md`

Guardrail verified: `/api/student-portal` reads were fixture-backed, write
requests were blocked, and no real student credential, checkoff, note save,
parent/Rabbi message, assistant send, email, WhatsApp, Google API call,
connector write, or external CRM write was executed.

## 2026-06-15T06:02:35+03:00 - Parent Weekly Update Approval Workspace

Deployed the Operations approval-workspace slice for weekly parent updates.

- Operations Communications > Announcements now uses an in-page approval form
  instead of browser prompts.
- Candidate updates can be loaded into title/body/image URL/video URL fields.
- `Preview No-Write` calls the existing parent-announcements route with
  `dry_run: true`.
- Local approval still requires typing `APPROVE_PARENT_ANNOUNCEMENT`; it
  selects a parent-visible weekly update locally and does not send email,
  WhatsApp, social posts, Buffer drafts, or external CRM writes.
- Added focused contract coverage in
  `tests/community-weekly-updates-contract.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-live/run-smoke.mjs`.

Verification passed:

- PASS `node --check server.js`
- PASS Operations inline script parse
- PASS smoke runner syntax check
- PASS focused weekly/Operations/portal tests 35/35
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-local/report.md`
- PASS full `npm test` 415/415
- PASS Railway deployment `a298a146-8e34-408c-9a1f-f6e26e38dd0c`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-02-35-006Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-live/report.md`

Guardrail verified: the focused live smoke intercepted parent-announcement API
calls, confirmed the preview POST used `dry_run: true`, and recorded zero
non-dry-run write attempts. No official weekly update copy/media was selected
or promoted; operator selection remains open.

## 2026-06-15T06:17:55+03:00 - Parent Password Setup Preview Deployed

Deployed the Next Year Login parent password setup/reset follow-up as a
preview-first, per-family Operations action.

- Added admin route `POST /api/bna/parent-access/password-reset`.
- Dry-run preview resolves the parent/student target and returns
  `password_setup_preview` plus no-write/no-send flags:
  `local_write_performed: false`, `external_write_performed: false`,
  `no_send: true`, and `confirm_required: SEND_PARENT_PASSWORD_SETUP`.
- Confirmed send path remains single-family and requires
  `SEND_PARENT_PASSWORD_SETUP` before creating the local reset token and
  attempting the setup/reset email.
- Operations Students > Next Year Login now shows a rollout packet and
  per-family `Preview Password Setup` / `Email Password Setup` buttons. The
  page explicitly says no parent onboarding campaign is sent from that surface.
- Added focused contract coverage in `tests/next-year-login-readiness.test.js`
  and `tests/parent-student-portal-contract.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-live/run-smoke.mjs`.

Verification passed:

- PASS `node --check server.js`
- PASS Operations inline script parse
- PASS smoke runner syntax check
- PASS focused next-year/portal tests 26/26
- PASS full `npm test` 415/415
- PASS `git diff --check`
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-local/report.md`
- PASS Railway deployment `990a677c-a6a5-4b2d-97d7-13f1cf83c862`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-17-11-309Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-live/report.md`

Guardrail verified: focused live smoke intercepted the password-reset API,
confirmed exactly one preview POST with `dry_run: true`, and recorded zero
email send attempts. No parent token, email, WhatsApp, onboarding campaign,
portal message, student access change, external CRM write, Google/Drive action,
or Buffer/social action was triggered by the preview path.

## 2026-06-15T06:32:09+03:00 - Parent Weekly Recipient Preview Deployed

Deployed the weekly update recipient-preview follow-up for Communications /
CRM visibility.

- Added `GET /api/bna/parent-announcements/recipients`.
- The endpoint previews active BNA student parent recipients, dedupes by
  normalized email, reports missing parent emails, excludes
  external-accountability students, and separates signup-only and
  second-parent/spouse candidates behind review/policy gates.
- The response is explicitly no-send/no-write:
  `dry_run: true`, `no_send: true`, `local_write_performed: false`,
  `external_write_performed: false`, `send_enabled: false`, and
  `future_confirm_required: APPROVE_PARENT_WEEKLY_UPDATE_SEND`.
- Operations Communications > Announcements now has `Preview Recipients
  No-Send` plus a recipient preview card with eligible/missing/excluded/
  duplicate counts and a sample current-parent list.
- Test-send/live-send remains disabled until recipient rules, copy, media,
  rollback/no-send policy, and typed approval are explicit.
- Added focused contract coverage in
  `tests/community-weekly-updates-contract.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-live/run-smoke.mjs`.

Verification passed:

- PASS `node --check server.js`
- PASS smoke runner syntax check
- PASS Operations inline script parse
- PASS focused weekly-update test 8/8
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-local/report.md`
- PASS full `npm test` 415/415
- PASS `git diff --check`
- PASS Railway deployment `f03ccc1f-a64d-43db-8907-70f6c62d46b7`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-31-36-029Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-live/report.md`

Guardrail verified: focused live smoke used synthetic recipients only,
intercepted one recipient-preview GET, and recorded zero write/send attempts.
No real parent email was written into the smoke report, and no email,
WhatsApp, portal message, communication log, Buffer/social action,
Google/Drive action, external CRM write, parent-announcement write, or
test-send/live-send action was triggered.

## 2026-06-15T06:41:39+03:00 - Admin Role Policy Matrix Deployed

Deployed the workspace/roles policy-readback follow-up from the broader brief.

- Admin > Roles now renders a read-only Role / Access Policy Matrix instead of
  a generic not-configured placeholder.
- The matrix covers Super Admin / Operator, BNA School Admin / Rabbi, Parent /
  Primary Contact, Second Parent / Spouse, Student, Service Provider / Rabbi
  Sheller, Community Member, and Codex / Agent Work.
- It shows current access state, workspace scope, guardrails, and the approval
  gates for weekly update sends, parent password setup, Google live adapters,
  and One Time member-library publishing.
- The page explicitly does not create invitations, login tokens, password
  resets, email sends, WhatsApp sends, access grants, billing changes, or
  external connector writes.
- Spouse/second-parent and community-member access remain policy-gated until
  Shloimie approves the rules.
- Added focused contract coverage in `tests/operations-pwa-login.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-admin-role-policy-live/run-smoke.mjs`.

Verification passed:

- PASS `node --check server.js`
- PASS smoke runner syntax check
- PASS Operations inline script parse
- PASS focused Operations PWA/login test 7/7
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-admin-role-policy-local/report.md`
- PASS full `npm test` 416/416
- PASS `git diff --check`
- PASS Railway deployment `8098d014-5857-44b0-bffa-c94458917802`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-41-18-298Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-admin-role-policy-live/report.md`

Guardrail verified: focused live smoke recorded zero write requests after
login. No invitation, login token, password reset, email, WhatsApp, access
grant, billing change, Google/Drive action, Buffer/social action, One Time
publishing action, external connector write, or external CRM write was
triggered.

## 2026-06-15T06:55:29+03:00 - Contacts WAPI History Deployed

Deployed the Contacts-side WAPI/local communication history readback slice.

- Operations Contacts parent cards now count and render local communication
  history matched by signup/student ID, normalized phone variants, email
  addresses, and WAPI source context.
- Operations Contacts > Interested Parents cards now count and render local
  lead communication history matched by lead ID, normalized phone variants,
  email addresses, and WAPI source context.
- Communication tabs include read-only guardrail copy and data markers for
  smoke testing.
- The matcher reuses local first-party `contactCommunications`; it does not add
  a new external sync, send path, broadcast, or CRM write.
- Added focused contract coverage in `tests/wapi-phonebook-report.test.js`.
- Added reusable fixture-backed Playwright smoke:
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-live/run-smoke.mjs`.

Verification passed:

- PASS `node --check server.js`
- PASS Operations inline script parse
- PASS smoke runner syntax check
- PASS focused WAPI/CRM tests 12/12
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-local/report.md`
- PASS full `npm test` 417/417
- PASS `git diff --check`
- PASS Railway deployment `7a866693-367d-4c1d-81d2-f6e8c60f4288`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-54-38-056Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-live/report.md`

Guardrail verified: focused smokes used synthetic signups, leads, and
communications and recorded zero write requests after login. No Whapi sync,
WhatsApp send, broadcast, contact/tag update, email, portal message,
Google/Drive action, Buffer/social action, or external CRM write was triggered.

## 2026-06-15T07:09:09+03:00 - Contact History Helper Action Deployed

Deployed `show_contact_communication_history` as the helper/Telegram-facing
read-only action for local communication history previews.

- Added local matching helpers in `src/lib/actions/actions/operations.js` for
  normalized phone variants, email/source-address tokens, contact names, and
  WAPI source context.
- Registered `show_contact_communication_history` in
  `src/lib/actions/registry.js` as an admin-scoped communications action with
  dry-run support and no approval requirement.
- Routed natural Telegram/helper requests such as "Show WhatsApp history for
  +972..." to the typed action in `src/lib/bna/telegram-action-router.js`
  instead of Codex or a raw send path.
- The action reads local `bna_contact_communications` joined to leads, signups,
  and students. It returns summarized rows, match reasons, channel counts, and
  guardrail flags.
- Added focused coverage in `tests/action-registry-telegram-ui-bot.test.js`
  and regenerated `ops/action-registry/actions.json`,
  `ops/action-registry/page-action-map.json`, and
  `ops/action-registry/ui-button-map.md`.
- Added focused live API smoke runner:
  `scripts/smoke-contact-history-helper.mjs`.
- Updated `ops/bna-helper/bna-helper-tool-audit.md` to mark the helper action
  implemented/read-only.

Verification passed:

- PASS `node --check src/lib/actions/actions/operations.js`
- PASS `node --check src/lib/actions/registry.js`
- PASS `node --check src/lib/bna/telegram-action-router.js`
- PASS `node --check scripts/smoke-contact-history-helper.mjs`
- PASS Operations inline script parse
- PASS focused action/WAPI/CRM tests 44/44
- PASS full `npm test` 418/418
- PASS `git diff --check`
- PASS Railway deployment `fcdf52fe-f623-47c5-8029-194eb68d7cb6`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T04-08-21-656Z-live-app-smoke.md`
- PASS focused live API smoke:
  `ops/live-smokes/2026-06-15T04-08-37-882Z-contact-history-helper-live-smoke.md`

Guardrail verified: the focused live smoke used fake contact clues with
`dry_run: true`, returned `executed: false`, `no_send: true`,
`external_write_performed: false`, and `local_write_performed: false`. No
Whapi sync, WhatsApp send, broadcast, contact/tag update, email, Google/Drive
action, Buffer/social action, or external CRM write was performed.

## 2026-06-15T07:15:52+03:00 - One Time First-Party Capability Map

Completed the local no-write capability map for what BNA Operations can own
before external Rabbi/One Time writes:

- Added `ops/one-time-mishnah/first-party-capability-map.md`.
- Added `tests/one-time-first-party-capability-map.test.js`.
- The map covers contacts/identities, tags/segments, pipelines/opportunities,
  calendars/classes, payments/access, workflows/automations,
  community/membership support, content/media intake, Buffer/social previews,
  WhatsApp/WAPI communications, no-GHL policy, browser-only Rabbi-owned gaps,
  and external-write acceptance gates.
- It keeps live One Time app access, Replit, Vimeo/media host, billing,
  Resend/email, DNS, Google live adapters, Buffer publishing/media attachment,
  and WhatsApp/Wappy outbound automation as external targets until access,
  approval phrase, rollback, and focused smoke are explicit.

Verification passed:

- PASS `node --check tests/one-time-first-party-capability-map.test.js`
- PASS focused One Time/audit tests 41/41
- PASS full `npm test` 420/420
- PASS `git diff --check`

No deployment was required because this is local documentation/test coverage
only. No One Time app access, billing/access change, Google/Drive/Buffer/
Vimeo/Resend/Stripe write, WhatsApp send, or external CRM write was performed.

## 2026-06-15T07:21:47+03:00 - One Time Content/Media Intake Workflow

Completed the local no-write content/media intake map for the Rabbi/One Time
pipeline:

- Added `ops/one-time-mishnah/content-media-intake-workflow.md`.
- Added `tests/one-time-content-media-intake-workflow.test.js`.
- The workflow maps Drive drops into recording/session records,
  transcripts/source notes, source sheets, worksheets, question digests, organic
  clips, ad candidates, approval packages, posting, and reporting.
- It names the first-party records to use before external writes:
  `bna_content_jobs`, `bna_project_meetings`, `bna_content_outputs`,
  `bna_class_sessions`, `bna_one_time_question_reviews`, action/task/decision
  records, action logs/content statuses, and dashboard alerts.
- Guardrails stay explicit: no automatic raw recording publishing, source
  sheet/worksheet/question digest/clip/ad/newsletter/social/WhatsApp/email
  visibility, Google/Drive writes, video-host writes, Buffer draft/publish
  action, member-library access grant, ad spend, or external CRM write.

Verification passed:

- PASS `node --check tests/one-time-content-media-intake-workflow.test.js`
- PASS focused One Time/content tests 46/46
- PASS full `npm test` 422/422
- PASS `git diff --check` with only existing LF/CRLF warnings

No deployment was required because this is local documentation/test coverage
only. No One Time app access, member-library publish, Google/Drive/Buffer/
video-host write, WhatsApp/email send, access grant, ad spend, or external CRM
write was performed.

## 2026-06-15T07:26:24+03:00 - One Time Partnership Drafting Pack

Completed the local draft-only handoff for Claude or another writing assistant:

- Added `ops/one-time-mishnah/partnership-drafting-pack.md`.
- Added `tests/one-time-partnership-drafting-pack.test.js`.
- The pack covers a cleaner agreement memo, values checklist,
  refund/cancellation policy options, family/device/Zoom/access rules,
  landing-page copy, launch emails, and reactivation copy.
- It routes old proposal/legacy CRM ideas back through first-party BNA
  Operations/no-GHL boundaries and marks unresolved legal, billing, access,
  sender, Zoom, public-page, and approval items as `DECISION NEEDED`.
- It gives draft prompts only; it does not approve, send, publish, upload,
  schedule, bill, grant access, or modify external systems.

Verification passed:

- PASS `node --check tests/one-time-partnership-drafting-pack.test.js`
- PASS focused One Time/drafting tests 48/48
- PASS full `npm test` 424/424
- PASS `git diff --check` with only existing LF/CRLF warnings

No deployment was required because this is local documentation/test coverage
only. No Google Doc/Drive upload, email, WhatsApp, Buffer/social action,
billing link, Zoom/access change, member-library publish, ad spend, or external
CRM write was performed.

## 2026-06-15T07:40:38+03:00 - Admin Users / External Access Deployed

Completed and deployed the first-pass super-admin user management surface:

- Updated `public/operations.html` Admin > Users into `Users / External Access`.
- External project users are separated from internal users and parent accounts.
- The UI shows workspace, role, access level, and configured Operations login
  username.
- Added a guarded `Create 20 min link` click path that uses the existing
  `/api/bna/ops-access-links` endpoint only for configured login usernames.
- New external-user creation/editing remains disabled until a dedicated
  persistence workflow is approved.
- Added focused coverage in `tests/operations-pwa-login.test.js` and
  `tests/one-time-external-user-portal.test.js`.
- Added local and live smoke evidence:
  `ops/playwright-smokes/2026-06-15-admin-users-local/report.md` and
  `ops/playwright-smokes/2026-06-15-admin-users-live/report.md`.

Verification passed:

- PASS Operations inline script parse
- PASS focused Operations/One Time tests 41/41
- PASS full `npm test` 426/426
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-15-admin-users-local/report.md`
- PASS Railway deployment `8d87ea87-8034-4533-85f7-71b70e99ccb5`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T04-38-14-284Z-live-app-smoke.md`
- PASS focused live smoke:
  `ops/playwright-smokes/2026-06-15-admin-users-live/report.md`

Guardrail verified: focused live smoke recorded zero write requests after
login. No email, WhatsApp, password reset, parent account creation, billing
link, Zoom/access change, member-library publish, Google/Drive action,
Buffer/social action, external connector write, or external CRM write was
triggered.

## 2026-06-15T07:59:02+03:00 - Student Assistant Onboarding Coach Deployed

Completed and deployed the next natural-language onboarding slice:

- Added `assistant_onboarding_coach` handling in `server.js` so role-specific
  setup/help questions are answered before generic portal support-ticket
  fallback.
- Student guidance covers Today, goals, daily checkoff, questions, reflection,
  and messaging Rabbi/Shloimie.
- Updated the student helper intro in `public/js/bna-bot-widget.js`.
- Added contract coverage in `tests/universal-assistant-contract.test.js`.
- Added local and live fixture smoke coverage:
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-local/report.md`
  and
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-live/report.md`.

Verification passed:

- PASS syntax checks for `server.js`, `public/js/bna-bot-widget.js`,
  `tests/universal-assistant-contract.test.js`, and the live smoke runner
- PASS focused assistant/portal tests 49/49
- PASS local fixture Playwright smoke
- PASS in-app Browser fixture check
- PASS full `npm test` 427/427
- PASS Railway deployment `6b77f88f-7508-43ac-b107-c713d29c34a3`
- PASS Railway doctor SUCCESS
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-15T04-57-22-945Z-live-app-smoke.md`
- PASS focused live fixture Playwright smoke:
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-live/report.md`

Guardrails:

- The coaching path is no-ticket/no-write. It does not create support tickets,
  durable profile/goal rows, real student checkoffs/messages, email, WhatsApp,
  Google Drive, Buffer/social actions, external connector writes, or external
  CRM writes.

Remaining:

- Deeper parent/student/provider goal-store/profile writes and action execution
  remain open until explicit scoped action rules and approval gates are added.

## 2026-06-15T08:15:30+03:00 - Task Calendar Selected-Day Polish Deployed

Completed and deployed the Phase 8.4 calendar-date-click follow-up:

- Operations Tasks > Calendar selected-day panel now shows an explicit
  `Selected: Weekday, Month Day, Year` label.
- The panel preserves Hebrew date/item context and the existing Add Task and
  Move Selected Task actions.
- Added an adjacent `Google dry-run` action wired through the action registry
  as `sync_google_calendar` with `dry_run: true`,
  `requested_from: task_calendar_selected_day`, and
  `no_google_calendar_write: true`.
- Added contract coverage in
  `tests/operations-task-comments-and-dictation.test.js`.
- Added local/live focused smoke coverage:
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-local/report.md`
  and
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/report.md`.

Verification passed:

- PASS `node --check tests/operations-task-comments-and-dictation.test.js`
- PASS smoke runner syntax check
- PASS Operations inline script parse
- PASS focused task/action/Google tests 45/45
- PASS local in-app Browser check
- PASS local Playwright smoke
- PASS full `npm test` 427/427
- PASS `git diff --check` with only existing LF/CRLF warnings
- PASS Railway deployment `84bd450e-d5e9-409c-8126-29a147ab51cd`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T05-14-42-829Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/report.md`

Guardrails:

- Focused live smoke recorded zero write requests after login. No Google
  Calendar event, internal calendar event, email, WhatsApp, Buffer/social
  action, external connector write, or external CRM write was triggered.

Remaining:

- This completes the visible selected-date clarity and dry-run adjacency. Live
  Google Calendar execution remains blocked until OAuth/test-user/scope
  approval and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.

## 2026-06-15T08:30:38+03:00 - Decision Card Context Polish Deployed

Completed and deployed the Phase 8.3 decision-card follow-up:

- Decision detail cards now render question-style prompts, workspace/owner/due
  context, Option A/B/C choice cards, pros, cons, consequences, recommendation,
  `Needs more info`, and an inline decision-comment box.
- Stored single-letter `A/B/C` option labels no longer show as a stray bare
  title; the visible option card uses the actual option sentence.
- The decision-comment box writes only workspace task comments through the
  existing comment API with `requeue: false`. It does not choose an option,
  create an agent job, send messages, or touch external connectors.

Verification passed:

- PASS Operations inline script parse.
- PASS focused task/action-registry tests 42/42.
- PASS full `npm test` 433/433.
- PASS `git diff --check` with only LF/CRLF warnings.
- PASS local in-app Browser decision-panel readback before the Browser reload
  policy blocked further local browser use.
- PASS Railway deployment `03ad6a70-0f58-40c1-abb4-f2a6bfe4e3a5`.
- PASS Railway doctor SUCCESS.
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T05-28-00-126Z-live-app-smoke.md`.
- PASS focused live HTTP readback:
  `ops/live-smokes/2026-06-15T05-30-30-413Z-operations-decision-card-ui-live-smoke.md`.

Guardrails:

- The focused live readback was HTTP-only after Operations login. No task
  update, comment creation, choose-decision action, external connector action,
  email, WhatsApp, Google, Buffer, or CRM write was attempted.

Remaining:

- This completes the visible Phase 8.3 decision-card context/readability slice.
  Broader natural-language task cleanup and any actual decision selection still
  use the existing explicit action paths and approval gates.

## 2026-06-15T08:48:04+03:00 - Public Homepage Torah Progress Privacy Hotfix Deployed

Completed and deployed the remaining Phase 1 public/private data leak fix for
the Torah trip progress surface:

- Replaced the public homepage fallback from five named student cards with
  three aggregate public metric cards: class trip progress, current anonymous
  range, and trip status.
- Updated the homepage runtime renderer so a live public-summary response can
  render only aggregate/range cards; it no longer writes `student.name` values
  or student-specific labels into the public DOM.
- Updated `/api/torah-learning/public-summary` to serialize public group fields
  plus aggregate `metrics`, with `students: []` kept only as a compatibility
  empty array.
- Preserved the private `getTorahLearningSummary()` payload shape for
  authenticated Operations, parent/student portal, and admin use.
- Added `tests/public-homepage-privacy.test.js`.
- Updated `scripts/smoke-live-app.mjs` so regular live smoke now validates the
  aggregate-only public contract instead of calculating from public student
  records.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-live-app.mjs`
- PASS homepage inline JavaScript parse
- PASS `node --test tests/public-homepage-privacy.test.js`
- PASS focused privacy/Torah tests 25/25
- PASS full `npm test` 435/435
- PASS `git diff --check` with only LF/CRLF warnings
- PASS Railway deployment `0562f80d-b24d-463b-bef4-7f027fdad077`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T05-46-52-317Z-live-app-smoke.md`
- PASS focused live privacy readback:
  `ops/live-smokes/2026-06-15T05-47-38-650Z-public-homepage-privacy-live-smoke.md`

Guardrails:

- The live homepage/API omit the five full student names, stale public
  per-student renderer strings, parent names/emails, goal minutes, and student
  access codes.
- No email, WhatsApp, Google, Buffer/social action, external connector write,
  external CRM write, task/comment write, access grant, or portal credential
  action was performed.

Remaining:

- This closes the public Torah progress name leak. Authenticated parent/student
  and Operations views may continue to show individualized Torah progress under
  their existing auth/scope rules.

## 2026-06-15T08:56:15+03:00 - Phase 1 Public Route Privacy Smoke Coverage Added

Added repeatable coverage for the full Phase 1 unauthenticated route audit from
the follow-up brief.

Implemented:

- Added `scripts/smoke-public-route-privacy.mjs`.
- Added `npm run app:smoke:public-privacy`.
- Added `tests/public-route-privacy-contract.test.js`.
- The smoke checks these unauthenticated routes:
  `/`, `/parent`, `/parent.html`, `/parent/login`, `/student`,
  `/student.html`, `/student/login`, `/signup`, `/signup.html`,
  `/signup-he`, `/providers`, `/service-providers`,
  `/become-service-provider`, `/operations`, `/api/parent-portal`,
  `/api/parent-portal/session`, and `/api/student-portal`.
- The contract test pins that public route shells do not embed known private
  student data, the student route requires a fresh URL credential and clears
  stale stored codes, parent/student/provider APIs are server-gated, and
  Operations remains admin-gated.

Verification passed:

- PASS `node --check scripts/smoke-public-route-privacy.mjs`
- PASS focused route/privacy/portal/provider tests 50/50
- PASS full `npm test` 439/439
- PASS focused `git diff --check` with only LF/CRLF warnings
- PASS live unauthenticated route smoke:
  `ops/live-smokes/2026-06-15T05-55-49-944Z-public-route-privacy-smoke.md`

Live audit result:

- Public routes returned anonymous shells.
- `/operations` redirected to `/operations-login.html?returnTo=%2Foperations`.
- `/api/parent-portal` rejected anonymous access with 401.
- `/api/parent-portal/session` rejected missing token with 400.
- `/api/student-portal` rejected missing credential with 401.

Deployment:

- No deployment required. This slice added repeatable test/smoke tooling and a
  live audit report only; no runtime app surface changed.

## 2026-06-15T09:09:24+03:00 - Observable Codex Queue Canonical Lifecycle Follow-Up

Corrected the observable Telegram/bot -> ticket -> task -> Codex job flow so
the machine job table uses the same canonical lifecycle as the Operations task
model.

Implemented:

- `bna_agent_jobs.status` now canonicalizes to `queued`, `running`,
  `completed`, `failed`, or `blocked_needs_human_decision`.
- `bna_tickets.status` remains the operator-friendly ticket layer and may still
  use labels like `queued_for_codex`, `in_progress`, `done`, `failed`, and
  `needs_decision`.
- Updated server bootstrap SQL, the standalone Railway migration,
  job-list/claim/complete/block/stale APIs, queue snapshot counts, task
  enrichment status mapping, and the agent-fleet observable job selector.
- Strengthened `tests/observable-codex-queue.test.js` so it checks canonical
  job lifecycle values and alias migration, not just broad queue strings.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS focused observable queue test 4/4
- PASS full `npm test` 443/443
- PASS pre-deploy `npm run railway:doctor`
- PASS Railway deployment `bee86ce8-747b-4287-90e3-bfa86f7077ab` reached
  SUCCESS
- PASS post-deploy `npm run railway:doctor`
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T06-07-20-124Z-live-app-smoke.md`
- PASS targeted live `/api/bna/codex-queue/status?limit=5` readback with five
  sampled jobs all using canonical `queued` status.

Guardrail:

- No Google/Drive/Calendar/Classroom, Vimeo, Buffer/social, WhatsApp, email,
  external connector, external CRM, send, publish, or member visibility action
  was performed.

## 2026-06-15T09:16:36+03:00 - One Time Billing Policy Packet Follow-Up

Completed the local policy/doc slice for the remaining Rabbi/One Time billing
decision without touching live checkout, payment providers, access, messages,
or external systems.

Implemented:

- Expanded `ops/rabbi-scheller/green-invoice-billing-options.md` with a
  provider-of-record packet for Green Invoice, Stripe, or a short manual
  bridge.
- Added required decisions for price/currency, first-cycle billing,
  subscription anchor, access start, refund/cancellation, failed-payment grace,
  support owner, referral credits, and rollback/revoke ownership.
- Added refund/cancellation options R1/R2/R3 with a launch recommendation to
  use R2 unless a protected trial is ready.
- Added exact approval phrases for provider and refund policy decisions.
- Strengthened `tests/rabbi-scheller-audit-docs.test.js` so the packet remains
  present and checkout remains approval-gated.

Verification passed:

- PASS `node --check tests/rabbi-scheller-audit-docs.test.js`
- PASS focused Rabbi audit docs test 4/4
- PASS full `npm test` 444/444

Deployment:

- No deployment required. This slice changed local docs/tests only.

Guardrail:

- No payment link, checkout session, subscription, invoice, refund,
  cancellation, member access, email/WhatsApp/social send, Drive/video-host
  write, external CRM write, or Rabbi live-site change was performed. Actual
  checkout/access implementation remains blocked until Shloimie approves the
  provider, policy, pricing, access, failed-payment, support, and rollback
  choices.

## 2026-06-15T09:21:52+03:00 - Goal-Mode Completion Matrix Follow-Up

Completed a local phase-by-phase completion/blocker matrix for the original
goal-mode brief:

- Added `ops/goalmode/2026-06-15-goal-completion-blocker-matrix.md`.
- Added `tests/goalmode-completion-matrix.test.js`.
- Covered phases 0-16, including preflight, privacy, Google, Rabbi/One Time,
  onboarding bots, helper, WAPI/CRM, workspace UI, tasks/decisions/calendar,
  automations/prompts, alerts, forum/moderation, provider login, content/
  thumbnails, social scheduling, tests/deploy, and reporting.
- Preserved the remaining owner/connector blockers and approval phrases:
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`,
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`, and
  `APPROVE_BUFFER_SOCIAL_DRAFT`, plus the One Time billing/provider and Rabbi
  live app access decisions.

Verification passed:

- PASS `node --check tests/goalmode-completion-matrix.test.js`
- PASS focused matrix test 2/2
- PASS full `npm test` 444/444

Deployment:

- No deployment required. This slice changed local docs/tests only.

Guardrail:

- No connector, Google/Drive/Classroom, Buffer/social, WhatsApp/email,
  checkout/access, billing, publishing, member-visibility, external CRM, or
  Rabbi live-site write was performed.

## 2026-06-15 Local Classroom / Rabbi Content / Buffer Draft-Only Completion

Implemented and deployed the operator plan for local Classroom-first behavior:

- Operations Students > Classroom now renders the internal first-party
  Classroom board with Stream, Classwork, People, Calendar, and Review lanes.
- The Classroom board is explicitly local-first and does not require Google
  Classroom OAuth. Google Classroom/Calendar sync remains optional and gated.
- New assignment/material creation passes workspace/project scope so One Time
  classroom work can reuse the same assignment infrastructure safely.
- Operations Content > One Time Library now includes a local Rabbi Elie
  Scheller / One Time classroom handoff panel for class sessions, assignments,
  source sheets, worksheets, recordings, questions, and reviewable content
  outputs.
- Social output approval now enforces Buffer draft-only behavior. Buffer draft
  id/status metadata is saved, and any requested publish intent is recorded as
  blocked by policy instead of publishing.
- Email remains manual/current path. Resend readiness is non-blocking and no
  mass email campaign path was added.
- Member-library publishing, public/member Q&A, notifications, rewards, and
  leaderboards remain behind existing approval gates.

Verification:

- PASS `node --check server.js`
- PASS focused classroom/Buffer/Operations tests
- PASS full `npm test` 578/578
- PASS `git diff --check` with line-ending warnings only
- BLOCKED local smoke: `.env.local` has no `DATABASE_URL`
- PASS Railway deployment `1fefad7b-38a2-463f-86bd-ec43df529f2b` SUCCESS
- PASS Railway doctor SUCCESS
- PASS live app smoke
  `ops/live-smokes/2026-06-15T14-50-29-888Z-live-app-smoke.md`
- PASS targeted live classroom smoke
  `ops/playwright-smokes/2026-06-15-local-classroom-buffer-draft-live/report.md`

Notable live-smoke fix:

- The first post-deploy live app smoke caught task creation failing with
  Postgres `could not determine data type of parameter $43`. Fixed the task
  insert SQL by casting nullable decision placeholders, added a regression
  assertion, redeployed, and confirmed task create/comment/delete passes live.

Remaining gated/future work:

- Full One Time classroom/community build remains open: moderated class/video
  threads, approved participation leaderboard, notifications, and source-only
  Mishnah bot behavior are future/gated work under the One Time classroom brief.
- Buffer draft creation requires exact approved source, channel, copy, hosted
  media URL if any, and rollback/no-post policy. Buffer publish remains out of
  scope.
- Google Classroom remains optional/secondary. Do not make Google OAuth a
  blocker for local classroom workflows.
- Resend/mass email campaigns remain out of scope unless explicitly requested.

## Update 2026-06-15T14:52:21+03:00 - Assistant Onboarding Intake Capture

- Deployed a scoped assistant onboarding intake capture layer for explicit
  parent, student, and service-provider messages such as "save this onboarding
  intake for review".
- Added durable `bna_assistant_onboarding_intakes` review drafts with actor
  scope, topic, source message, extracted role-specific fields, open questions,
  `review_status: needs_review`, and no-send/no-external-write flags.
- The assistant reply tells the actor that the draft is saved for review and
  that no message, public profile, child-visible goal, durable profile update,
  or external connector write happened.
- Fixed routing so explicit role onboarding capture wins before anonymous
  public lead reminders. The first targeted live smoke caught the regression
  as `public_lead_reminder`; final deployment corrected it.
- Added repeatable live smoke:
  `scripts/smoke-assistant-onboarding-intake-live.mjs` and
  `npm run app:smoke:onboarding-intake`.
- Verification passed: `node --check server.js`, `node --check`
  `scripts/smoke-assistant-onboarding-intake-live.mjs`, focused
  assistant/workspace/portal tests 53/53, full `npm test` 523/523, Railway
  deployment `39012fde-d811-4c8d-853f-8b52da7eb2b8`, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T11-50-12-417Z-live-app-smoke.md`, and targeted
  live onboarding intake smoke
  `ops/live-smokes/2026-06-15T11-50-42-993Z-assistant-onboarding-intake-live-smoke.md`.
- Guardrail: the targeted smoke used a live student access context without
  printing the raw code, verified the stored no-send row, then archived the
  smoke intake and thread. No email, WhatsApp, SMS, Telegram, Buffer/social,
  Google/Drive/Classroom, billing/access, member-library, external CRM, or
  Rabbi live-site action was performed.

## 2026-06-15T10:27:03+03:00 - Signup Credit Email Preview Follow-Up

Deployed the safe no-send verification layer for the signup credit
payment-link email fix:

- Added `signupConfirmationResendOptions` and `signupConfirmationPreview`.
- `/api/bna/signups/:id/send-confirmation` now supports `dry_run:true`.
- Dry-run reports `no_send: true`, `external_write_performed: false`,
  `local_write_performed: false`, recipient count, payment-link status, and a
  redacted body preview.
- Non-dry-run admin resends now use the configured `PAYMENT_LINK` for unpaid
  credit confirmations.
- Added `scripts/smoke-signup-credit-email-preview.mjs` and
  `npm run app:smoke:signup-credit-email-preview`.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-signup-credit-email-preview.mjs`
- PASS focused signup/portal tests 32/32
- PASS full `npm test` 478/478
- PASS Railway deployment `c9c861e4-4e1e-4f2e-9fed-7db972d9b1ab`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T07-26-35-552Z-live-app-smoke.md`
- PASS no-send signup credit email preview smoke:
  `ops/live-smokes/2026-06-15T07-26-34-821Z-signup-credit-email-preview-live-smoke.md`

Remaining:

- Do not mark the old signup payment-link email task fully done until an
  approved live credit signup/email-log smoke sends only to approved test
  recipients and verifies both parent emails in `bna_email_log`.

Guardrail:

- No real email send, checkout/payment activity, local row write, WhatsApp,
  Google, Buffer/social, external CRM, or Rabbi live-site write occurred during
  the targeted smoke.

## 2026-06-15T09:35:22+03:00 - External Access Persistence Workflow Follow-Up

Converted the remaining Admin Users / External Access create-edit blocker into
a local readiness packet:

- Added `ops/access/external-access-persistence-workflow.md`.
- Added `tests/external-access-persistence-workflow.test.js`.
- Added `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` to
  `ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md`.
- Updated `ops/goalmode/2026-06-15-goal-completion-blocker-matrix.md` so Phase
  7 points to the new packet and approval phrase.
- The packet keeps future external-user persistence separate from parent/student
  portal accounts, provider portal passwords, Rabbi-owned live-app credentials,
  billing, member-library access, sends, Google/Drive, Buffer/social, WAPI, and
  external CRM writes.

Verification passed:

- PASS `node --check tests/external-access-persistence-workflow.test.js`
- PASS `node --check tests/goalmode-owner-approval-unblocker-pack.test.js`
- PASS focused external-access/owner-pack tests 5/5
- PASS full `npm test` 455/455

Deployment:

- No deployment required. This slice changed local docs/tests only.

Guardrail:

- No runtime code, external-user create/edit, parent/student account,
  provider-portal password, Rabbi live-app credential, access link, email,
  WhatsApp, SMS, Telegram, billing, checkout/access, member-library,
  Google/Drive, Buffer/social, WAPI, external CRM, or Rabbi live-site write was
  performed.

## 2026-06-15T09:42:48+03:00 - Google Public OAuth Verification Packet Follow-Up

Converted Phase 2 Mode C into a local public OAuth verification readiness
packet:

- Added `ops/google-integrations/google-public-oauth-verification-packet.md`.
- Added `tests/google-public-oauth-verification-packet.test.js`.
- Updated `ops/google-integrations/google-now-vs-later-scope-plan.md`.
- Added `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET` to
  `ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md`.
- Updated `ops/goalmode/2026-06-15-goal-completion-blocker-matrix.md`.
- The packet is source-anchored to official Google OAuth/app verification,
  Google API Services User Data Policy, sensitive/restricted scope verification,
  and demo-video guidance checked on 2026-06-15.
- The packet requires final Cloud Console scope categories at submission time,
  privacy/deletion/support URLs, scope-by-feature justification, test-user smoke
  evidence, demo evidence, restricted-scope security-assessment decision,
  verification email owner, and rollback plan.
- Public OAuth packet approval stays separate from live adapter write approval;
  live Google reads/writes still require `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.

Verification passed:

- PASS `node --check tests/google-public-oauth-verification-packet.test.js`
- PASS `node --check tests/goalmode-owner-approval-unblocker-pack.test.js`
- PASS focused Google/owner-pack tests 6/6
- PASS full `npm test` 459/459

Deployment:

- No deployment required. This slice changed local docs/tests only.

Guardrail:

- No runtime code, OAuth start, consent-screen change, Google account
  connection, public verification submission, Google read/write,
  Drive/Classroom/Calendar/Business Profile write, email, WhatsApp, SMS,
  Telegram, checkout/access, billing, member-library, Buffer/social, WAPI,
  external CRM, or Rabbi live-site write was performed.

## 2026-06-15T09:52:01+03:00 - Google Test-User OAuth Scope Guard Follow-Up

Completed and deployed the Phase 2 Mode B OAuth scope guard so test-user
Google connection starts from least privilege:

- `server.js` defaults `GOOGLE_SCOPES` to `userinfo.email` only.
- A bare `/api/google/oauth/start` no longer requests configured/broad scopes
  or Drive-pipeline setup implicitly.
- Explicit feature/scope/setup requests still work for approved test-user
  smokes, including Drive-pipeline setup when requested deliberately.
- Google role defaults are identity-only.
- Classroom manage feature scopes avoid roster/profile-email scope creep by
  default.
- `.env.example` now documents identity-only setup plus per-smoke scope
  examples instead of Gmail/broad Drive/roster defaults.
- OAuth callback pages redact refresh-token values; tokens stay under ignored
  `.secrets/`.
- Added `tests/google-oauth-scope-guard.test.js`.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/google-integrations.js`
- PASS `node --check tests/google-oauth-scope-guard.test.js`
- PASS focused Google OAuth/scope tests 18/18
- PASS full `npm test` 463/463
- PASS pre-deploy Railway doctor
- PASS Railway deployment `8a02f9fb-6044-48ee-bfeb-747bfeecee2f`
- PASS post-deploy Railway doctor
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T06-58-03-600Z-live-app-smoke.md`
- PASS targeted live Google readiness readback: `default_scopes` and
  `required_scopes` are identity-only; broad Railway `GOOGLE_SCOPES` values
  are exposed as configured-scope warnings rather than bare-start
  requirements.

Remaining:

- Railway still has four configured Google scopes, with two broad-scope
  warnings in the live readiness payload. Because a bare OAuth start no longer
  requests configured scopes, this is contained, but the owner should remove or
  narrow those Railway variables before any public/test-user OAuth smoke that
  depends on the configured scope set.

Guardrail:

- No OAuth flow was started, no Google account was connected, no Google read or
  write ran, no refresh token was printed, and no connector/send/billing/
  member-library/Buffer/WAPI/external CRM/Rabbi live-site write was performed.

## 2026-06-15T10:09:51+03:00 - Railway Google Scope Env Cleanup

Completed the remaining production env cleanup from the OAuth scope guard:

- Railway production `GOOGLE_SCOPES` is now
  `https://www.googleapis.com/auth/userinfo.email`.
- Used a one-variable Railway update only; no secret env values were dumped.
- The first restart attempt timed out and did not update the running process,
  so the app was redeployed through the existing deploy script.
- Railway deployment `16920b4a-751a-4ee3-8534-9193a2739a7c` reached SUCCESS.
- Live app smoke passed:
  `ops/live-smokes/2026-06-15T07-09-09-425Z-live-app-smoke.md`.
- Targeted live Google readiness readback passed:
  `configured_scopes`, `default_scopes`, and `required_scopes` are all
  identity-only, with zero configured-scope warnings.

Remaining:

- Test-user email addresses, Drive scope policy, and actual live test-user
  OAuth connection/smoke remain blocked until owner-provided account/scope
  details and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` for a narrow target.

Guardrail:

- No OAuth flow was started, no Google account was connected, no Google read or
  write ran, no secret env value was printed, and no connector/send/billing/
  member-library/Buffer/WAPI/external CRM/Rabbi live-site write was performed.

## 2026-06-15T10:41:24+03:00 - Buffer Hosted Media Follow-Up

Implemented and deployed the hosted-media support slice for Buffer social
draft/post creation:

- New pure helper: `src/lib/bna/buffer-media-assets.js`.
- Buffer `createPost` now sends direct hosted image/video URLs through the
  current ordered `assets` array.
- Output metadata records `buffer_media_attached`, `buffer_media_url`,
  `buffer_media_type`, `buffer_thumbnail_url`, and
  `buffer_media_upload_performed: false`.
- Local paths and Drive/Dropbox preview links fail before any Buffer write, so
  local Telegram/Content media must first be hosted at a stable direct URL.
- Updated the One Time workflow/capability text from "media support is missing"
  to "hosted media attachment is supported; binary hosting/upload is still a
  separate approval-gated path."

Verification:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/buffer-media-assets.js`
- PASS focused Buffer/action/media tests 45/45
- PASS focused One Time/Buffer roadmap tests 41/41
- PASS focused Google settings contract 4/4
- PASS full `npm test` 484/484
- PASS pre/post Railway doctor
- PASS Railway deployment `a6c7b3a4-0e2c-456a-9a26-f93af982f2fa`
- PASS live app smoke
  `ops/live-smokes/2026-06-15T07-40-12-729Z-live-app-smoke.md`
- PASS no-write hosted-media preview live smoke
  `ops/live-smokes/2026-06-15T07-41-24-838Z-buffer-hosted-media-preview-live-smoke.md`

Remaining:

- Do not create an actual Buffer draft/post until the operator approves source
  material, channel/account, copy, schedule window, stable hosted media,
  rollback/no-post policy, and `APPROVE_BUFFER_SOCIAL_DRAFT`.
- If local Telegram/Content binaries should attach automatically later, build
  an approved media-hosting/upload path first; BNA still does not host or upload
  binary media to Buffer.

Guardrail:

- The targeted live smoke used preview mode only and performed no Buffer draft,
  publish, media upload, email, WhatsApp, Google, billing, member-library,
  external CRM, or Rabbi live-site write.

## 2026-06-15T10:49:22+03:00 - WAPI Lead-Candidate Review Importer Follow-Up

Implemented and deployed the final WAPI/Whapi lead-candidate review importer
slice:

- WAPI phonebook correction preview now plans a local `bna_parent_leads`
  `create_lead_candidate` write for unmatched school/content/group-interest
  WhatsApp contacts.
- Existing linked `lead`, `signup`, or `student` records skip duplicate
  candidate creation so current parents are matched first.
- Confirmed apply remains gated by `APPLY_WAPI_CORRECTION` and writes only
  first-party BNA rows.
- The route continues to report `no_send: true` and
  `external_write_performed: false`; no WhatsApp send/broadcast or external CRM
  write is introduced.

Verification:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/wapi-phonebook-report.js`
- PASS focused WAPI/Whapi/Telegram note tests 13/13
- PASS full `npm test` 488/488
- PASS pre/post Railway doctor
- PASS Railway deployment `988985c6-f310-4f84-b169-85878aa16d3c`
- PASS live app smoke
  `ops/live-smokes/2026-06-15T07-48-33-953Z-live-app-smoke.md`
- PASS no-write WAPI lead-candidate preview smoke
  `ops/live-smokes/2026-06-15T07-49-22-656Z-wapi-lead-candidate-preview-live-smoke.md`

Guardrail:

- The targeted live smoke used `dry_run:true`; it performed no local row write,
  WhatsApp send, broadcast, external CRM write, Buffer/social, Google, billing,
  member-library, or Rabbi live-site write.

## 2026-06-15T11:19:29+03:00 - Student Portal Auth Policy Deployed

Closed the student portal auth-model decision and deployed the persistent
server-side audit/rate-limit guard:

- Decision: keep private access-code links for the current small-school/student
  portal model.
- Do not add a student PIN/password requirement until BNA approves a broader
  student-account rollout, parent consent flow, recovery process, support owner,
  retention policy, test-student smoke, and rollback plan.
- Added `bna_student_portal_auth_attempts` for persistent auth attempt audit
  rows with hashed IP/access-code identifiers, success/failure/throttled
  outcomes, route path, user-agent hash, and metadata proving raw code/IP are
  not stored.
- `getStudentForPortalCredential` now checks persistent failure counts before
  the in-memory fallback, records missing/invalid/throttled/success attempts,
  and records audit rows through the primary pool outside caller transactions
  so rejected write attempts are not lost when app transactions roll back.
- Audit route storage strips query strings before insert, so URL access codes
  are not stored in the route field.
- Added reusable live smoke `scripts/smoke-student-portal-auth-policy-live.mjs`
  and `npm run app:smoke:student-auth`.
- Fixed `scripts/railway-redeploy.ps1` to copy root
  `railway-migration-*.sql` files into the deploy bundle. This was required
  after deployment `0c57ca17-461b-4d04-ba56-ab3243b14aa0` crashed because
  `railway-migration-2026-06-15-rabbi-checkout-access.sql` was missing from the
  bundle.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-student-portal-auth-policy-live.mjs`
- PASS focused portal/auth/privacy tests 42/42
- PASS full `npm test` 495/495
- PASS pre-deploy Railway doctor on previous successful deployment
- PASS Railway deployment `04e0ed68-3c4a-498a-8a4b-7c5fecaea693` after the
  deploy-bundle SQL fix
- PASS final Railway deployment `367994a3-04b6-4de4-8abd-0061d68222bf`
- PASS post-deploy Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T08-16-28-472Z-live-app-smoke.md`
- PASS targeted auth audit live smoke:
  `ops/live-smokes/2026-06-15T08-18-36-134Z-student-auth-policy-live-smoke.md`

Guardrail:

- The targeted auth smoke created one expected first-party invalid-code audit
  row only.
- No student credential was created, emailed, texted, WhatsApped, rotated, or
  exposed.
- No email, WhatsApp, SMS, Telegram, Buffer/social, Google/Drive/Classroom,
  billing/access, member-library, external CRM, or Rabbi live-site action was
  performed.

## 2026-06-15T11:14:00+03:00 - Wappy Connector Decision Packet Follow-Up

Closed the open Wappy product-identification task as a local no-write decision
packet:

- Added `ops/communications/wappy-connector-decision-packet.md`.
- Added `tests/wappy-connector-decision-packet.test.js`.
- Compared `wappy.chat`, `wappy.ai`, current Whapi/WAPI, and the official Meta
  WhatsApp Business Platform baseline.
- Current decision: do not select Wappy yet. Public source readback does not
  prove the API, webhook/export, number model, ownership, compliance, pricing,
  or rollback details BNA would need before a runtime connector.
- Active BNA WhatsApp work remains Whapi/WAPI import/readback/correction
  preview only.

Guardrail:

- No Wappy env var, API client, webhook route, dashboard control, Telegram
  command, WhatsApp send, broadcast, external CRM write, Buffer/social, Google,
  billing, member-library, or Rabbi live-site write was added or performed.

Verification:

- PASS focused Wappy connector decision packet test 3/3
- PASS focused Wappy/WAPI/Whapi/Telegram note bundle 16/16
- PASS full `npm test` 491/491
- PASS JSONL validation 1053 records

## 2026-06-15T11:15:00+03:00 - Railway Latest Deployment Record Follow-Up

Closed the stale Railway deployment-record follow-up:

- Ran `npm run railway:doctor`.
- Railway doctor reported project `skillful-motivation`, environment
  `production`, service `skillful-motivation`, deployment
  `988985c6-f310-4f84-b169-85878aa16d3c`, status `SUCCESS`.
- The stale bad deployment `47f8d5d1-c425-4a79-8e31-ec4cb71f5dcc` is no longer
  the deployment record returned by the doctor.

Guardrail:

- No deploy, app code change, live write, connector action, WhatsApp/email send,
  Buffer/social action, Google action, billing/access change, member-library
  publish, external CRM write, or Rabbi live-site write was performed by this
  check.

## 2026-06-15T09:30:38+03:00 - Scoped Task Comment Visibility Test Alignment

Aligned the task-comment tests with the current scoped visibility helper instead
of requiring every comment payload to hardcode workspace visibility:

- Updated `tests/operations-task-comments-and-dictation.test.js`.
- Updated `tests/workspace-task-no-stale-agent.test.js`.
- The tests now require `taskCommentDefaultVisibility(task)` and the current
  rule: One Time Mishnah class comments default to `project`, while ordinary
  workspace comments default to `workspace`.
- The no-stale-agent/requeue guard remains covered through `requeue: false`
  and explicit agent requeue tests.

Verification passed:

- PASS `node --test tests/operations-task-comments-and-dictation.test.js` 10/10
- PASS `node --test tests/workspace-task-no-stale-agent.test.js` 4/4
- PASS full `npm test` 452/452

Deployment:

- No deployment required. This slice changed tests only.

Guardrail:

- No runtime code, connector, Google/Drive/Classroom, Buffer/social,
  WhatsApp/email, checkout/access, billing, publishing, member visibility,
  external CRM, or Rabbi live-site write was performed.

## 2026-06-15T09:26:35+03:00 - Owner Approval Unblocker Pack Follow-Up

Completed the local owner approval pack that turns the remaining blocked lanes
into copy-paste decision templates:

- Added `ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md`.
- Added `tests/goalmode-owner-approval-unblocker-pack.test.js`.
- Covered Google live adapter smoke, One Time member-library publishing smoke,
  One Time billing/refund policy, Buffer/social draft or publish, and Rabbi
  live app access confirmation.
- Each section requires the approval phrase plus required fields, rollback/
  revoke details, and readback evidence; a bare approval phrase alone remains
  incomplete.

Verification passed:

- PASS `node --check tests/goalmode-owner-approval-unblocker-pack.test.js`
- PASS focused owner approval pack test 2/2

Deployment:

- No deployment required. This slice changed local docs/tests only.

Guardrail:

- No connector, Google/Drive/Classroom, Buffer/social, WhatsApp/email,
  checkout/access, billing, publishing, member-visibility, external CRM, or
  Rabbi live-site write was performed.
