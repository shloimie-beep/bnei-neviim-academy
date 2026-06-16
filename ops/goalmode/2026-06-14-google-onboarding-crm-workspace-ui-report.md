# Goal-Mode Follow-Up Report

Date: 2026-06-14

## Status

Partially done. This pass preserved the dirty worktree, confirmed the earlier
public/student privacy fix was already deployed and live-smoked, added and
deployed a dedicated Google Workspace readiness surface in Operations, and
created the named follow-up docs for Google, helper tools, WAPI/CRM, and
Rabbi/One Time. Follow-up slices also deployed manual provider Google Business
Profile link capture, a WAPI phonebook grouping dry-run report, the Telegram
note-to-CRM matcher, the WAPI manual correction apply UI, parent announcement
persistence/readback, task-title cleanup dry-run tooling, Rabbi Mishnayos
onboarding lead capture, and the `retitle_task_naturally` helper action. The
broader live Google adapter and deeper One Time content-library work remain
open. The task/decision helper action bundle is also deployed and live
preview-smoked, the Rabbi shiur/source-sheet helper pair is deployed and live
preview-smoked, the referral/moderation helper action trio is deployed and live
preview-smoked, the WAPI phonebook-first conversation workspace is deployed
and live-smoked, the One Time content-library review surface is deployed and
live-smoked, and the Google Action Audit readback view is deployed and
live-smoked. The public helper mobile-sheet UX follow-up is also deployed and
live-smoked. The public helper source-boundary guard is also deployed and
live-smoked against the live assistant API. Support ticket processed
notifications are also deployed and live-smoked as first-party no-send drafts
plus internal ticket comments. Google live-adapter and One Time publishing
approval-readiness packets are also deployed and live-smoked. Local
approval-decision preview controls for those packets are also deployed and
live-smoked. Parent/accountability onboarding now creates first-party
`accountability_interest` parent leads linked to support tickets,
communications, and private Operations notifications, with dry-run/no-write
local and live smoke coverage. Operations > Integrations > Google is now also
the canonical deployed Google readiness module; Settings > Google Workspace
remains as a compatibility mirror for older links. The older provider
onboarding/integrations foundation deployment gate is also closed on current
production with a focused no-write live browser/API smoke. The mobile
public/login/document screenshot matrix is also complete and deployed; its
first run found and fixed a stale student-access-code clearing gap on public
registration document pages.

## Dirty Worktree

- Current branch: `cleanup/onboarding-helper-crm-workspace-rabbi`
- Safety branch: `safety/pre-goalmode-google-onboarding-crm-20260614-173354`
- Dirty patch: `.runtime/pre-goalmode-dirty-worktree-20260614-173354.patch`
- Dirty status: `.runtime/pre-goalmode-git-status-20260614-173354.txt`

## Security / Privacy

- The latest handoff says the public parent/student leak fix was deployed and
  live-smoked on Railway deployment `59b07235-039a-4d0c-9676-8ecea6736390`.
- This pass did not undo those protections.
- Current Google/Operations UI additions have focused and full test coverage
  recorded below.

## Google Integrations Module

- Deployed Operations > Integrations > Google on Railway deployment
  `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`.
- The module exposes the existing Google readiness, Google Live Adapter
  Approval Packet, approval-decision preview controls, and Google Action Audit
  from a first-class Integrations route. Settings > Google Workspace remains a
  compatibility mirror.
- Verification passed: full `npm test` 415/415, Railway doctor SUCCESS, live
  app smoke
  `ops/live-smokes/2026-06-15T01-59-10-544Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-google-integrations-module-live/report.md`.
- Guardrail verified: no Google API read/write, connector write, send, publish,
  access grant, or external CRM write is performed from the page.

## Provider Onboarding Foundation

- Closed the older provider onboarding/integrations deployment gate on current
  production deployment `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`.
- Verification passed: focused provider tests 12/12, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T02-11-53-759Z-live-app-smoke.md`, and focused
  live browser/API smoke
  `ops/playwright-smokes/2026-06-15-provider-onboarding-foundation-live/report.md`.
- Guardrail verified: no provider signup, intake submission, parent-provider
  message, provider reply, email, WhatsApp, billing, Google API call,
  connector write, or external CRM write was executed.

## Mobile Public/Login/Document Matrix

- Deployed registration-document stale student-code clearing and the reusable
  live mobile matrix smoke on Railway deployment
  `e7c5c182-70ff-49cd-b786-ca76de01efc2`.
- The matrix covers homepage, public helper open state, English/Hebrew signup,
  all four required registration document pages, parent login/accountability
  onboarding, student login, and provider login at 390px mobile width.
- Verification passed: focused assistant/signup tests 15/15, full `npm test`
  415/415, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T02-24-39-914Z-live-app-smoke.md`, and live matrix
  `ops/playwright-smokes/2026-06-15-mobile-public-login-document-matrix-live/report.md`.
- Guardrail verified: no form submission, provider signup, parent/student
  login, assistant send, email, WhatsApp, billing, Google API call, connector
  write, or external CRM write was executed.

## Google Now-Vs-Later

- Added Operations Settings > Google Workspace.
- The panel separates:
  - No-OAuth/manual/public-link mode.
  - Test-user OAuth.
  - Later production verification.
- Cards cover Google Drive, Google Calendar, Google Classroom, and Google
  Business Profile.
- Calendar and Classroom cards use registered dry-run actions.
- Drive cards use registered preview-only actions for file search/list, Doc
  preview, folder preview, and move preview.
- `/api/bna/integrations/google/status` now mirrors the existing Google status
  payload for the Operations API client and includes real OAuth rows from
  `bna_google_connections` when test-user accounts are connected.
- Google connection disconnect is confirmation-gated and deployed at:
  - `/api/google/connections/:connectionId/disconnect`
  - `/api/bna/integrations/google/connections/:connectionId/disconnect`
- Operations Settings > Google Workspace now includes a read-only Google
  Action Audit over local `botActionLogs` for Google/Drive/Calendar/Classroom/
  Google Business/Profile preview and execution actions.
- The audit view formats nested preview/result metadata as readable text and
  remains evidence-only: it does not perform external Google writes.
- Operations Settings > Google Workspace now includes the Google Live Adapter
  Approval Packet with OAuth test-user, Drive scope policy, explicit
  external-write confirmation, smoke evidence, and exact
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` checklist language. The packet is
  readiness-only and performs no live Google read/write.
- The Google packet now has a `Preview Decision Draft` button that calls
  `create_decision` with `dry_run: true`. Smokes verified it returns
  `executed: false` and `preview.decision_created: false`.
- Provider Google Business/Profile links and Place IDs now have an
  approval-gated manual capture action:
  `capture_provider_google_business_link`. It stores manual provider metadata
  only and does not call the live GBP API.
- Scope and action docs:
  - `ops/google-integrations/google-now-vs-later-scope-plan.md`
  - `ops/google-integrations/oauth-test-user-plan.md`
  - `ops/google-integrations/google-natural-language-action-map.md`

## Onboarding Bots

- Existing tests show provider onboarding and parent/accountability onboarding
  routes/pages are present.
- Service provider onboarding remains free-listing first.
- Rabbi Mishnah preview exists at `/preview/one-time-mishnah` and
  `/one-time-preview`.
- Rabbi Mishnayos lead capture is deployed at
  `/one-time-preview#one-time-onboarding` with
  `POST /api/one-time/mishnah/onboarding`. Confirmed submissions stay
  first-party/local to the One Time workspace and create review records only:
  lead/contact, internal transcript, support ticket, and follow-up task.
- The lead-capture flow does not create checkout, grant access, send email,
  send WhatsApp, post publicly, or write to an external CRM.
- Assistant onboarding intake capture is now deployed for explicit parent,
  student, and service-provider capture language. It writes first-party
  `bna_assistant_onboarding_intakes` review drafts only, with actor scope,
  topic, extracted fields, open questions, `no_send:true`, and no durable
  profile, child-visible goal, public provider profile, send, or external
  connector write. Final evidence: Railway deployment
  `39012fde-d811-4c8d-853f-8b52da7eb2b8`, live app smoke
  `ops/live-smokes/2026-06-15T11-50-12-417Z-live-app-smoke.md`, and targeted
  smoke
  `ops/live-smokes/2026-06-15T11-50-42-993Z-assistant-onboarding-intake-live-smoke.md`.

## BNA Helper

- Created `ops/bna-helper/bna-helper-tool-audit.md`.
- Current action registry covers core tasks, tickets, decisions, email drafts,
  weekly updates, calendar, provider requests, and student/parent helpers.
- Provider Google Business/Profile link capture is now covered by
  `capture_provider_google_business_link` with Telegram and web-assistant
  routing.
- Task/decision organization helpers are now covered by
  `add_decision_option`, `schedule_task_on_date`, and `move_task_workspace`.
  They are approval-gated and preview-first, and approved execution stays on
  local task records only.
- Rabbi content planning helpers are now covered by
  `create_rabbi_shiur_idea` and `create_rabbi_source_sheet_task`. They are
  approval-gated and preview-first, and approved execution creates only scoped
  local One Time review tasks.
- Referral/moderation helpers are now covered by
  `create_referral_ledger_entry`, `submit_student_question_for_moderation`,
  and `review_moderated_question`. They are approval-gated and preview-first.
  Approved execution stays first-party/local: referral candidate, ledger note,
  review task, or private question-review task/comment only.
- Public helper source-boundary guard is deployed. Public assistant context
  names the current 10-1 program, hosted assistant prompts forbid filling
  policy gaps from generic school knowledge, and allergy/medical policy
  questions return a deterministic `public_policy_boundary` reply before
  hosted AI.
- Approval-readiness packet UI is deployed for the remaining live helper lanes:
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` for Google live adapter testing and
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` for One Time member-library
  publishing.
- Approval packet decision previews are deployed. They are local audit previews
  only and create no Shloimie decision task unless a separate approved typed
  action is executed later.
- Remaining high-value helper work is limited to live Google/Drive adapter
  execution after OAuth/scope approval.

## Communications / WAPI / CRM

- Created `ops/communications/wapi-crm-audit-and-plan.md`.
- The plan keeps CRM first-party, no-GHL, no-send by default.
- Nati Freeze/Fries is explicitly friend/general contact unless real message
  evidence says otherwise.
- Added and deployed a WAPI phonebook grouping dry-run report:
  `npm run wapi:phonebook-report`, `/api/bna/wapi/phonebook-report`, and
  Operations Communications > WhatsApp > Phonebook grouping.
- The report is read-only/no-send, includes confidence/review flags, aggregate
  manual correction candidates, and keeps Nati Freeze/Fries friend/non-lead by
  default.
- Added and deployed the Telegram note-to-CRM matcher:
  `src/lib/bna/telegram-note-to-crm.js`,
  `POST /api/bna/contact-communications/match-note`, and Telegram `/crm_note`,
  `/whatsapp_note`, `/wa_note`, plus natural-language notes like "that WhatsApp
  with X was about Y".
- The matcher reads local WAPI/WhatsApp communications, scores name/phone/text
  clues, creates a local Telegram/internal CRM note only on a confident match
  or explicit communication id, and never sends WhatsApp messages.
- Added and deployed WAPI manual correction apply/readback:
  `POST /api/bna/wapi/phonebook-corrections`, local
  `bna_wapi_phonebook_corrections` persistence, correction overlay in the
  report, and Operations Apply recommended/Friend non-lead/School interest
  buttons.
- WAPI correction writes require `APPLY_WAPI_CORRECTION`, stay local-only, and
  never send WhatsApp messages or write to an external CRM.
- Added and deployed parent announcement approved-draft persistence/readback:
  `GET/POST /api/bna/parent-announcements`, Operations Communications >
  Announcements readback, and `APPROVE_PARENT_ANNOUNCEMENT` for local selection
  without email, WhatsApp, or social sends.
- Added and deployed support ticket processed-notification drafts. Resolving or
  closing a ticket writes a local `bna_contact_communications` internal-note
  draft with `ticket_processed_notification`, `no_send`, and
  `external_write_performed: false` metadata, adds an internal ticket comment,
  and returns `notification_draft`; no email, WhatsApp, SMS, Telegram, portal,
  or external CRM send is automatic.

## Workspaces / UI

- Google settings are now a dedicated compact section instead of only scattered
  Calendar/Classroom connector rows.
- Broader workspace search/switcher and role-badge cleanup remains in the
  existing task queue.

## Tasks / Decisions / Calendar

- Earlier handoff already added typed decision buttons and selected-day
  calendar controls.
- Natural-language task retitle has local dry-run tooling through
  `npm run task:title-cleanup`, and single-task helper retitles are deployed
  through `retitle_task_naturally`.
- Task/decision helper actions are deployed for adding decision options,
  scheduling a task date/time, and moving a task between BNA/One Time project
  scopes. Telegram routes matching natural-language phrases into preview-only
  typed actions.
- Rabbi shiur/source-sheet helper actions are deployed for local One Time
  content planning tasks. Telegram routes matching Rabbi/One Time phrasing into
  preview-only typed actions.
- Referral and moderated-question helper actions are deployed for local One
  Time referral intake, private question submission, and private
  moderated-question review. Telegram routes matching referral ledger and
  question moderation phrasing into preview-only typed actions.
- Support-ticket processed notifications are deployed as local no-send drafts
  plus internal comments when tickets are resolved or closed.

## Rabbi App / Backend

- Created `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md` from
  the existing repo audits.
- No live Rabbi site was changed.
- Existing conclusion: `one-time-one-time` is the main backend source;
  `one-time-app` is a mobile companion/reference.
- BNA now has a preview-safe One Time onboarding intake wired to local
  review/follow-up records, but the live external Rabbi site/backend remains
  untouched pending approval/access.
- Operations Content > One Time Library now includes the One Time Publishing
  Approval Packet with destination, visibility/audience, hosted media,
  notification/social channel, smoke evidence, and exact
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` language. The packet performs no
  publishing, connector write, send, checkout/access, member visibility, or
  external CRM write.
- The One Time packet now has a `Preview Decision Draft` button that calls
  `create_decision` with `dry_run: true`. Smokes verified it returns
  `executed: false` and `preview.decision_created: false`.

## Tests

- Added `tests/google-workspace-settings-contract.test.js`.
- PASS `node --check server.js`
- PASS focused Google/workspace/Operations tests:
  `node --test tests/google-workspace-settings-contract.test.js tests/google-assignment-system.test.js tests/workspace-person-household-provider-contract.test.js tests/operations-saas-crm-redesign.test.js`
- PASS `npm test` 349/349
- PASS provider Google Business action syntax checks and focused action/
  assistant/Google tests, 44/44.
- PASS latest `npm test` 350/350.
- PASS WAPI phonebook syntax checks, Operations inline parse, focused WAPI/CRM
  tests 17/17, and latest `npm test` 353/353.
- PASS Telegram note-to-CRM syntax checks, focused Telegram/WAPI tests 15/15,
  and final `npm test` 357/357.
- PASS WAPI correction syntax checks, Operations inline parse, focused WAPI/CRM
  correction tests 21/21, and final `npm test` 358/358.
- PASS parent announcement syntax checks, Operations inline parse, focused
  community/Operations/portal tests 38/38, and final `npm test` 360/360.
- PASS task-title cleanup syntax check, focused task/watchdog/reconciler tests
  28/28, live dry-run report, and final `npm test` 367/367.
- PASS Rabbi Mishnayos onboarding syntax checks, preview inline script parse,
  focused onboarding/provider/workspace tests 23/23, and final `npm test`
  370/370.
- PASS `retitle_task_naturally` syntax checks, focused action/task/watchdog
  tests 44/44, and final `npm test` 372/372.
- PASS task/decision helper syntax checks, focused action suite 24/24, and
  final `npm test` 374/374.
- PASS Rabbi shiur/source-sheet helper syntax checks, focused action suite
  25/25, and final `npm test` 375/375.
- PASS referral/moderation helper syntax checks, focused action suite 26/26,
  and final `npm test` 376/376.
- PASS WAPI phonebook workspace syntax checks, Operations inline script parse,
  focused WAPI/communications/CRM tests 19/19, local browser smoke, and final
  `npm test` 376/376.
- PASS public helper source-boundary syntax checks:
  `node --check server.js` and `node --check src/lib/bna/ai-context.js`.
- PASS updated assistant contract 9/9.
- PASS local public assistant API smoke for `What is the BNA allergy policy?`
  returning `public_policy_boundary` without hosted AI.
- PASS support-ticket processed notification syntax checks:
  `node --check server.js` and
  `node --check scripts/setup-one-time-partnership-drive.mjs`.
- PASS Operations inline script parse and focused support/Operations/assistant
  tests 48/48.
- PASS latest full `npm test` 383/383.
- PASS latest `git diff --check` with only existing LF/CRLF warnings.
- PASS approval-readiness Operations inline script parse.
- PASS focused approval-readiness contracts 7/7:
  `node --test tests/google-workspace-settings-contract.test.js tests/one-time-content-library-workspace.test.js`.
- PASS final `npm test` 383/383.
- PASS local approval-readiness browser smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-local/report.md`.
- PASS approval decision preview Operations inline script parse.
- PASS focused approval decision preview contracts 7/7:
  `node --test tests/google-workspace-settings-contract.test.js tests/one-time-content-library-workspace.test.js`.
- PASS final `npm test` 383/383.
- PASS local approval decision preview browser smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-local/report.md`.

## Deploy

- PASS pre-deploy `npm run railway:doctor`.
- PASS pre-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-50-47-870Z-live-app-smoke.md`.
- Railway deployment `e38167f2-5e6d-4447-b9d4-e195375c4315` reached SUCCESS.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-52-26-757Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS local browser smoke on the temporary server:
  - desktop/default viewport: `/operations?view=settings&section=google_workspace`
    rendered 4 Google cards, dry-run/test/OAuth states, and no console errors.
  - mobile 390x844: 4 Google cards rendered, no horizontal overflow, and no
    console errors.
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`.
- Railway deployment `d2ee16bc-cacd-4025-a77d-f1d358d1230c` reached SUCCESS
  for the disconnect/readiness follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-02-18-301Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS non-mutating live disconnect route probe with a fake id returned 404
  without touching any real token.
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-disconnect-live/report.md`.
- Railway deployment `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` reached SUCCESS
  for the Drive preview action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-07-51-724Z-live-app-smoke.md`.
- PASS live Drive preview action smoke:
  `ops/playwright-smokes/2026-06-14-google-drive-preview-live/report.md`.
- Railway deployment `03c2c30c-7639-494c-8e05-20863386c054` reached SUCCESS
  for the provider Google Business capture action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-16-29-530Z-live-app-smoke.md`.
- PASS live action catalog/API dry-run smoke:
  `ops/live-smokes/2026-06-14T15-19-19-000Z-provider-google-business-action-smoke.md`.
- Railway deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225` reached SUCCESS
  for the WAPI phonebook grouping report follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-40-45-848Z-live-app-smoke.md`.
- PASS local and live WAPI phonebook UI/API smokes:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-local/report.md`
  and `ops/playwright-smokes/2026-06-14-wapi-phonebook-live/report.md`.
- Railway deployment `73a812e2-572e-4231-a971-20aef4f52450` reached SUCCESS
  for the Telegram note-to-CRM matcher follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-56-27-842Z-live-app-smoke.md`.
- PASS local and live Telegram note-to-CRM endpoint dry-run smokes:
  `ops/live-smokes/2026-06-14T15-54-29-499Z-telegram-note-to-crm-local-smoke.md`
  and
  `ops/live-smokes/2026-06-14T15-57-04-987Z-telegram-note-to-crm-live-smoke.md`.
- Railway deployment `578fc257-386a-49ef-8103-789ca42d7adc` reached SUCCESS
  for the WAPI manual correction follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-13-56-298Z-live-app-smoke.md`.
- PASS local and live WAPI correction endpoint/UI smokes:
  `ops/live-smokes/2026-06-14T16-08-29-510Z-wapi-phonebook-correction-local-smoke.md`,
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-local/report.md`,
  `ops/live-smokes/2026-06-14T16-14-54-502Z-wapi-phonebook-correction-live-smoke.md`,
  and
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-live/report.md`.
- Railway deployment `e0f3b52d-b16c-4812-8221-3c4d1fbbc05e` reached SUCCESS
  for the parent announcement persistence/readback follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-27-29-418Z-live-app-smoke.md`.
- PASS local and live parent announcement endpoint/UI dry-run smokes:
  `ops/live-smokes/2026-06-14T16-26-08-240Z-parent-announcement-local-smoke.md`,
  `ops/playwright-smokes/2026-06-14-parent-announcements-local/report.md`,
  `ops/live-smokes/2026-06-14T16-28-27-990Z-parent-announcement-live-smoke.md`,
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-live/report.md`.
- Task-title cleanup dry-run did not require deployment because it adds local
  CLI/report tooling only. Live dry-run report:
  `ops/system-audits/2026-06-14T16-37-35-442Z-task-title-cleanup-dry-run.md`
  scanned 304 tasks, skipped 224 closed tasks, found 0 automatic patch
  candidates, and routed 1 active raw-looking title to manual review.
- Railway deployment `8e55d3c5-b958-42b2-b176-ae74df5bfdb8` reached SUCCESS
  for the Rabbi Mishnayos onboarding lead-capture follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-05-14-786Z-live-app-smoke.md`.
- PASS local One Time onboarding endpoint/browser smokes:
  `ops/live-smokes/2026-06-14T-one-time-onboarding-local-smoke.json` and
  `ops/playwright-smokes/2026-06-14-one-time-onboarding-local/report.md`.
- PASS live One Time onboarding dry-run smoke:
  `ops/live-smokes/2026-06-14T17-06-57-397Z-one-time-onboarding-live-dry-run.md`.
- Railway deployment `67ba8b4b-2072-4367-b12c-181cfe156424` reached SUCCESS
  for the `retitle_task_naturally` helper action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-18-12-469Z-live-app-smoke.md`.
- PASS live preview-only retitle action smoke:
  `ops/live-smokes/2026-06-14T17-18-55-172Z-retitle-task-action-live-preview.md`.
- Railway deployment `e93d2da8-4852-4d82-a260-39b1be5960b2` reached SUCCESS
  for the One Time video-library item helper action follow-up.
- PASS syntax checks for `server.js`, `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS focused action/One Time tests 58/58.
- PASS final `npm test` 373/373.
- PASS local preview-only action smoke:
  `ops/local-smokes/2026-06-14-one-time-video-library-action-local-preview.json`.
- Browser opened the local Operations login page, but the in-app browser could
  not type the local smoke credentials because its virtual clipboard support was
  unavailable; HTTP/API and test verification covered the action surface.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-36-34-282Z-live-app-smoke.md`.
- PASS live preview-only action smoke:
  `ops/live-smokes/2026-06-14T17-40-27-one-time-video-library-live-preview.json`.
- Railway deployment `85c15479-f581-45d3-bb53-695fb99f8ac7` reached SUCCESS
  for the task/decision helper action bundle.
- PASS syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`.
- PASS focused action suite 24/24.
- PASS final `npm test` 374/374.
- PASS local preview-only action smoke:
  `ops/local-smokes/2026-06-14-task-decision-helper-actions-local-preview.json`.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T17-54-55-156Z-live-app-smoke.md`.
- PASS live preview-only action smoke:
  `ops/live-smokes/2026-06-14T17-55-44-901Z-task-decision-helper-actions-live-preview.json`.
- Railway deployment `0dd6f6ec-26ca-4fa1-8520-6e8d76790246` reached SUCCESS
  for the Rabbi shiur/source-sheet helper action pair.
- PASS syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`.
- PASS focused action suite 25/25.
- PASS final `npm test` 375/375.
- PASS local preview-only action smoke:
  `ops/local-smokes/2026-06-14-rabbi-content-helper-actions-local-preview.json`.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T18-08-35-649Z-live-app-smoke.md`.
- PASS live preview-only action smoke:
  `ops/live-smokes/2026-06-14T18-09-23-665Z-rabbi-content-helper-actions-live-preview.json`.
- Railway deployment `e54244e1-41dd-40ae-a313-31cc0c49d6e2` reached SUCCESS
  for the referral/moderation helper action trio.
- PASS syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`.
- PASS focused action suite 26/26.
- PASS final `npm test` 376/376.
- PASS local preview-only action smoke:
  `ops/local-smokes/2026-06-14-referral-moderation-helper-actions-local-preview.json`.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T18-25-56-841Z-live-app-smoke.md`.
- PASS live preview-only action smoke:
  `ops/live-smokes/2026-06-14T18-26-48-024Z-referral-moderation-helper-actions-live-preview.json`.
- Railway deployment `6c9f06bc-6c1b-47b9-980a-4e8baca73eae` reached SUCCESS
  for the WAPI phonebook-first conversation workspace.
- PASS syntax checks for `server.js`,
  `src/lib/bna/wapi-phonebook-report.js`, and
  `tests/wapi-phonebook-report.test.js`.
- PASS Operations inline script parse.
- PASS focused WAPI/communications/CRM tests 19/19.
- PASS final `npm test` 376/376.
- PASS local WAPI workspace browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-local/report.md`.
- PASS post-deploy `npm run railway:doctor` with deployment SUCCESS.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T18-51-33-221Z-live-app-smoke.md`.
- PASS live WAPI workspace browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-live/report.md`.
- Railway deployment `4a77ab03-a394-4663-b4b7-55957655c6b0` reached SUCCESS
  for the One Time content library review surface.
- PASS `node --check server.js`.
- PASS Operations inline script parse.
- PASS focused One Time/content tests 7/7.
- PASS final `npm test` 382/382.
- PASS local One Time content library browser/API smoke:
  `ops/playwright-smokes/2026-06-14-one-time-content-library-local/report.md`.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T19-20-41-625Z-live-app-smoke.md`.
- PASS live One Time content library browser/API smoke:
  `ops/playwright-smokes/2026-06-14-one-time-content-library-live/report.md`.
- Railway deployment `f4f63168-afa4-41e3-8930-a67159c069f1` reached SUCCESS
  for the Google Action Audit readback view.
- PASS Google Action Audit focused contract 3/3, Operations inline script
  parse, and full `npm test` 382/382.
- PASS local Google Action Audit browser/API smoke:
  `ops/playwright-smokes/2026-06-14-google-action-audit-local/report.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T19-49-14-650Z-live-app-smoke.md`.
- PASS focused live Google Action Audit browser/API smoke:
  `ops/playwright-smokes/2026-06-14-google-action-audit-live/report.md`.
- Railway deployment `0b9085f7-a10e-41bb-8123-f8ba1c233ac8` reached SUCCESS
  for the public helper mobile-sheet UX follow-up.
- PASS assistant syntax check, assistant contract 9/9, and full `npm test`
  382/382.
- PASS local and live assistant mobile/desktop browser smokes:
  `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-local/report.md`
  and
  `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-live/report.md`.
- Railway deployment `dcb59bc8-835b-4eb7-a951-653b54a389bf` reached SUCCESS
  for the public helper source-boundary guard.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-25-36-985Z-live-app-smoke.md`.
- PASS focused live public assistant API smoke against
  `https://bneineviimacademy.org`: allergy policy question returned the
  deterministic verified-content boundary reply with `public_policy_boundary`
  metadata.
- Railway deployment `f64213ae-1cc1-4b2e-a762-a06c3e81f3b1` reached SUCCESS
  for support ticket processed-notification drafts.
- PASS local support-ticket processed notification API/DB smoke:
  `ops/live-smokes/2026-06-14T20-39-16-327Z-support-ticket-notification-local-smoke.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-40-31-601Z-live-app-smoke.md`.
- PASS focused live support-ticket processed notification API/DB smoke:
  `ops/live-smokes/2026-06-14T20-42-38-426Z-support-ticket-notification-live-smoke.md`.
- Railway deployment `cdb127bb-0f27-4e9b-b9a1-7adb93d64f19` reached SUCCESS
  for the Google/One Time approval-readiness packets.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T20-56-48-950Z-live-app-smoke.md`.
- PASS focused live approval-readiness browser smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-live/report.md`.
- Railway deployment `475c598d-e9c3-4a5b-990c-e00f2ef1f070` reached SUCCESS
  for the approval decision preview controls.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T21-27-02-855Z-live-app-smoke.md`.
- PASS focused live approval decision preview browser smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`.
- Railway deployment `f8951767-ca5f-4c58-a8c5-696015f9d3b9` reached SUCCESS
  for the Rabbi/One Time launch-calendar preview action.
- PASS syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS Operations inline script parse.
- PASS focused action/Google settings tests 30/30.
- PASS final `npm test` 384/384.
- PASS local launch-calendar preview browser smoke:
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-local/report.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T21-51-39-727Z-live-app-smoke.md`.
- PASS focused live launch-calendar preview browser smoke:
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-live/report.md`.
- Railway deployment `72a371b8-50b7-48c8-8cf7-f3efa7b1f8a4` reached SUCCESS
  for the Classroom topic/material preview action.
- PASS syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS Operations inline script parse.
- PASS focused action/Google settings tests 31/31.
- PASS final `npm test` 385/385.
- PASS local Classroom topic/material preview browser smoke:
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-local/report.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T22-09-44-742Z-live-app-smoke.md`.
- PASS focused live Classroom topic/material preview browser smoke:
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-live/report.md`.
- The in-app Browser plugin was attempted for a lightweight visual check, but
  its localhost control socket returned `ECONNREFUSED ::1:9222`; Playwright
  local/live smokes are the verification evidence for this slice.
- Railway deployment `89294419-27aa-4527-ba8d-c7edcfddf394` reached SUCCESS
  for the Google Business preview helpers.
- PASS syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS Operations inline script parse.
- PASS focused action/Google settings tests 32/32.
- PASS final `npm test` 386/386.
- PASS local Google Business preview browser smoke:
  `ops/playwright-smokes/2026-06-15-google-business-preview-local/report.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T22-22-55-796Z-live-app-smoke.md`.
- PASS focused live Google Business preview browser smoke:
  `ops/playwright-smokes/2026-06-15-google-business-preview-live/report.md`.
- In-app Browser plugin retry remained unavailable with
  `ECONNREFUSED ::1:9222`; Playwright local/live smokes are the verification
  evidence.
- Railway deployment `32573f44-f7a6-4cbd-baa2-432cf6b1e0a6` reached SUCCESS
  for the One Time publish-package preview.
- PASS syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, `src/lib/bna/telegram-action-router.js`,
  and `tests/action-registry-telegram-ui-bot.test.js`.
- PASS Operations inline script parse.
- PASS focused action/One Time tests 34/34.
- PASS final `npm test` 387/387.
- PASS local One Time publish-package preview browser/API smoke:
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-local/report.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T22-41-22-482Z-live-app-smoke.md`.
- PASS focused live One Time publish-package preview browser/API smoke:
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-live/report.md`.
- Railway deployment `55102a5c-f6a6-4866-aacf-d0086ba6b909` reached SUCCESS
  for the One Time app/admin/member-library access readiness surface.
- PASS syntax checks for `server.js`,
  `scripts/setup-one-time-partnership-drive.mjs`, and focused test files.
- PASS Operations inline script parse.
- PASS focused One Time tests 37/37.
- PASS final `npm test` 388/388.
- PASS local One Time app access readiness browser/API smoke:
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-local/report.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T23-05-50-938Z-live-app-smoke.md`.
- PASS focused live API readback and Playwright smoke:
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-live/report.md`.
- PASS local Rabbi/One Time task-flow audit tooling:
  `node --check scripts/rabbi-task-flow-audit.mjs`,
  `node --check tests/rabbi-task-flow-audit.test.js`, focused task/Telegram
  tests 41/41, live read-only audit run, and full `npm test` 392/392.
- Generated report:
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`.
  It scanned 305 tasks, found 102 Rabbi/One Time related records, and
  performed no task patch, workspace move, send, publish, access grant, or
  external write.
- Railway deployment `afff8d91-e0aa-426b-94f8-f128b8f57822` reached SUCCESS
  for the private One Time question moderation queue.
- Added `bna_one_time_question_reviews`,
  `GET /api/bna/one-time/question-moderation`, and Operations Content > One
  Time Library `Private Question Moderation Queue`.
- `submit_student_question_for_moderation` now creates a private review row
  with the task, and `review_moderated_question` updates the private review
  row with the task/comment.
- PASS syntax checks for `server.js`,
  `src/lib/actions/actions/operations.js`, and focused test files.
- PASS Operations inline script parse.
- PASS focused action/One Time tests 68/68.
- PASS full `npm test` 393/393 before deploy.
- PASS local API and Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-local/report.json`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T23-42-19-692Z-live-app-smoke.md`.
- PASS focused live API smoke:
  `ops/live-smokes/2026-06-14T23-42-54-513Z-one-time-question-moderation-live-smoke.md`.
- PASS focused live Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-live/report.json`.
- Guardrail verified: no forum post, member-visible answer, send, Codex job,
  checkout/access grant, Drive/video-host write, or external CRM write is
  created automatically.
- Railway deployment `5d21c82c-d77e-4d5d-a8c2-c1b1129c17a8` reached SUCCESS
  for the Operations Automation Library / Prompt Browser.
- Operations Settings > Automations now shows 8 guarded workflow cards:
  service-provider onboarding review, parent accountability lead follow-up,
  ticket processed acknowledgement, parent weekly update approval, One Time
  question review alert, One Time 8-week nurture plan, Google live-adapter test
  gate, and Rabbi content added review.
- Cards show trigger, audience, channel, prompt/template, status, last/next
  evidence, linked records, dry-run preview, and disabled approval-required
  enable controls. The Prompt Browser lists content prompts, assignment
  prompts, helper policies, and no-send/no-external-write guardrails.
- PASS Operations inline script parse.
- PASS focused adjacent tests 45/45.
- PASS final `npm test` 396/396.
- PASS local Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-automation-library-local/report.json`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T23-58-42-116Z-live-app-smoke.md`.
- PASS focused live Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-automation-library-live/report.json`.
- Guardrail verified: the library performs no external send, publish,
  billing/access change, member-visibility change, Google write,
  Drive/video-host write, checkout/access grant, or external CRM write.
- Added local Phase 11 One Time forum/gamification moderation readiness plan:
  `ops/one-time-mishnah/forum-gamification-moderation-plan.md`.
- The plan requires authenticated-only participation, AI-first moderation,
  human review, temporary holds pending admin review instead of automatic bans,
  quality rewards/badges only after Rabbi/admin approval, no public shame, no
  leaderboard without explicit approval, moderation audit trail, no-send
  notification gates, and launch smokes.
- PASS `node --check tests/one-time-forum-gamification-plan.test.js`.
- PASS focused forum/gamification plan test 4/4.
- PASS adjacent One Time content/external workflow tests 42/42.
- No deployment was required for this local documentation/test slice.
- Added Phase 12 provider-login / Grabify bug current-state audit:
  `ops/provider-intake/provider-login-phase12-audit.md`.
- The audit records active provider login/setup/session APIs, scoped provider
  access, generic failed-login messages, prior live provider portal smoke, no
  active Grabify reference in inspected provider login source surfaces, and a
  fresh live credential smoke checklist for the next approved test provider.
- PASS `node --check tests/provider-login-phase12-audit.test.js`.
- PASS focused provider-login Phase 12 test 4/4.
- PASS adjacent provider-directory tests 16/16.
- No deployment was required for this local documentation/test slice.
- Railway deployment `cc96c44c-303f-4dab-ada0-e6dd62738d3b` reached SUCCESS
  for the Phase 14 Buffer/social schedule preview action.
- Added `preview_social_schedule_package` to the action registry and
  Operations action handler, plus Telegram routing for scheduling/Buffer/
  multi-post phrases.
- Regenerated `ops/action-registry/actions.json`,
  `ops/action-registry/page-action-map.json`, and
  `ops/action-registry/ui-button-map.md`.
- PASS syntax checks for `src/lib/actions/actions/operations.js`,
  `src/lib/actions/registry.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS Operations inline script parse.
- PASS focused action/Telegram test 31/31.
- PASS adjacent social/content/automation tests 53/53.
- PASS final `npm test` 409/409.
- PASS local action-runner smoke:
  `ops/local-smokes/2026-06-15-social-schedule-preview-local.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-15T01-02-48-717Z-live-app-smoke.md`.
- PASS focused live API smoke:
  `ops/live-smokes/2026-06-15T01-03-38-576Z-social-schedule-preview-live-smoke.md`.
- Guardrail verified: no Buffer draft write, media upload, social publish,
  send, local content write, or external write is performed by the preview.
- Railway deployment `85107895-5677-4580-b3f6-7d91c1e70025` reached SUCCESS
  for the Phase 13 One Time thumbnail preview UI.
- Operations Content > One Time Library cards now render `Thumbnail Preview`
  from `thumbnail_brief` metadata, parsed metadata, or job thumbnail/image URL
  fields when an HTTP(S) thumbnail URL exists.
- The panel shows the image, status/brief copy, `Open Thumbnail`, and
  `Thumbnail reference missing` fallback.
- PASS syntax checks, Operations inline script parse, focused action/One Time
  tests 37/37, and full `npm test` 409/409 before deploy.
- PASS local renderer-based browser smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-local/report.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-15T01-24-36-196Z-live-app-smoke.md`.
- PASS live renderer-based Playwright smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-live/report.md`.
- Guardrail verified: no thumbnail generation/upload, member-library publish,
  email/WhatsApp/social send, checkout/access change, Drive/video-host write,
  Buffer action, local content write, or external CRM write is performed by
  the preview UI.
- Railway deployment `59ec51a1-56b2-4e0d-854a-ee3f8aab5558` reached SUCCESS
  for parent/accountability onboarding lead capture.
- `/api/parent-accountability/onboarding` now creates or updates first-party
  `bna_parent_leads` records with `lead_type = 'accountability_interest'` and
  links the support ticket, lead communication note, and private in-app
  Operations notification back to the lead.
- Operations Contacts > Interested Parents defaults to all lead categories and
  includes an `Accountability app interest` filter.
- PASS syntax checks, Operations/parent inline script parse, focused
  parent/accountability and adjacent tests 22/22, and full `npm test` 414/414
  before deploy.
- PASS local dry-run smoke:
  `ops/local-smokes/2026-06-15-parent-accountability-onboarding-local.md`.
- PASS post-deploy `npm run railway:doctor` and `npm run app:smoke`:
  `ops/live-smokes/2026-06-15T01-38-34-614Z-live-app-smoke.md`.
- PASS focused live dry-run smoke:
  `ops/live-smokes/2026-06-15T01-39-30-000Z-parent-accountability-onboarding-live-smoke.md`.
- Guardrail verified: dry-run writes nothing; real submissions remain
  first-party BNA Operations records and do not send email/WhatsApp/Telegram/
  portal messages, create child-visible goals, or write external CRM.

## 2026-06-15 Student Hebrew/RTL Audit Deployed

- Railway deployment `8a2d1967-7573-499d-955f-a21f90a990c0` deployed the
  student Hebrew/RTL cleanup and audit runner.
- Student question answers now use the localized `answer` label instead of
  hardcoded `Answer:`.
- The Rabbi WhatsApp meeting CTA now uses the localized `whatsappRabbi` label
  instead of hardcoded English copy.
- Added fixture-backed Playwright audit:
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/run-smoke.mjs`.
- The live audit covers mobile and desktop Hebrew/RTL state, mobile
  agenda-first calendar, calendar drawer detail, assignments, questions,
  documents, bot/help sections, Hebrew Sefaria refs, no mojibake, no horizontal
  overflow, no runtime/console errors, and no private sentinel leakage.
- Verification passed: `node --check server.js`,
  `node --check public/js/bna-bot-widget.js`, smoke runner syntax check,
  focused assistant/student-polish tests 12/12, full `npm test` 415/415,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T02-41-35-249Z-live-app-smoke.md`, and live
  Hebrew/RTL Playwright audit
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/report.md`.
- Guardrail verified: the audit uses synthetic student data, blocks portal
  writes, and performs no real checkoff, note save, message send, email,
  WhatsApp, Google API call, connector write, or external CRM write.

## 2026-06-15 Parent Weekly Update Approval Workspace Deployed

- Railway deployment `a298a146-8e34-408c-9a1f-f6e26e38dd0c` deployed the
  Operations Communications > Announcements approval workspace.
- Replaced the prompt-based parent announcement approval path with an in-page
  form: candidate loading, title/body/image URL/video URL readback,
  `Preview No-Write`, status messaging, and typed
  `APPROVE_PARENT_ANNOUNCEMENT` local approval.
- The backend contract remains `GET/POST /api/bna/parent-announcements`; the
  preview path uses `dry_run: true`, while final approval stores a local
  selected weekly update only.
- Added focused contract coverage in
  `tests/community-weekly-updates-contract.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-live/run-smoke.mjs`.
- Verification passed: `node --check server.js`, Operations inline script
  parse, smoke runner syntax check, focused weekly/Operations/portal tests
  35/35, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-local/report.md`,
  full `npm test` 415/415, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T03-02-35-006Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-live/report.md`.
- Guardrail verified: the focused live smoke intercepted parent-announcement
  API calls, confirmed the preview POST used `dry_run: true`, and recorded zero
  non-dry-run write attempts. No official weekly update copy/media was selected
  or promoted; operator selection remains open.

## 2026-06-15 Parent Password Setup Preview Deployed

- Railway deployment `990a677c-a6a5-4b2d-97d7-13f1cf83c862` deployed the
  Operations Students > Next Year Login parent password setup/reset preview
  path.
- Added `POST /api/bna/parent-access/password-reset`, with a dry-run preview
  returning `password_setup_preview`, `no_send: true`,
  `local_write_performed: false`, and
  `confirm_required: SEND_PARENT_PASSWORD_SETUP`.
- Added per-family `Preview Password Setup` and `Email Password Setup` buttons
  plus rollout packet copy clarifying that no bulk parent onboarding campaign
  is sent from the page.
- Confirmed send remains single-family and requires
  `SEND_PARENT_PASSWORD_SETUP` before token/email handling.
- Verification passed: `node --check server.js`, Operations inline script
  parse, smoke runner syntax check, focused next-year/portal tests 26/26, full
  `npm test` 415/415, `git diff --check`, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T03-17-11-309Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-live/report.md`.
- Guardrail verified: focused live smoke intercepted the password-reset API,
  confirmed exactly one preview POST with `dry_run: true`, and recorded zero
  live email send attempts. No parent token, email, WhatsApp, onboarding
  campaign, portal message, student access change, external CRM write,
  Google/Drive action, or Buffer/social action was triggered by the preview.

## 2026-06-15 Parent Weekly Recipient Preview Deployed

- Railway deployment `f03ccc1f-a64d-43db-8907-70f6c62d46b7` deployed the
  Communications > Announcements no-send recipient preview.
- Added `GET /api/bna/parent-announcements/recipients`, returning active BNA
  student parent recipients, signup-only review candidates, second-parent/
  spouse policy candidates, missing-email records, and external-accountability
  exclusions.
- The response is explicitly preview-only: `dry_run: true`, `no_send: true`,
  `local_write_performed: false`, `external_write_performed: false`,
  `send_enabled: false`, and
  `future_confirm_required: APPROVE_PARENT_WEEKLY_UPDATE_SEND`.
- Operations now shows `Preview Recipients No-Send` and a recipient readback
  card. Test-send/live-send remains disabled until recipient policy, copy,
  media, rollback/no-send rules, and typed approval are explicit.
- Verification passed: `node --check server.js`, smoke runner syntax check,
  Operations inline script parse, focused weekly-update test 8/8, local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-local/report.md`,
  full `npm test` 415/415, `git diff --check`, Railway doctor SUCCESS, live
  app smoke `ops/live-smokes/2026-06-15T03-31-36-029Z-live-app-smoke.md`, and
  focused live Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-live/report.md`.
- Guardrail verified: focused live smoke used synthetic recipients only,
  intercepted one recipient-preview GET, and recorded zero write/send attempts.
  No real parent email was written into the smoke report, and no email,
  WhatsApp, portal message, communication log, Buffer/social action,
  Google/Drive action, external CRM write, parent-announcement write, or
  test-send/live-send action was triggered.

## 2026-06-15 Admin Role Policy Matrix Deployed

- Railway deployment `8098d014-5857-44b0-bffa-c94458917802` deployed Admin >
  Roles as a read-only Role / Access Policy Matrix.
- The matrix covers Super Admin / Operator, BNA School Admin / Rabbi, Parent /
  Primary Contact, Second Parent / Spouse, Student, Service Provider / Rabbi
  Sheller, Community Member, and Codex / Agent Work.
- It names current access state, workspace scope, guardrails, and approval
  gates for weekly update sends, parent password setup, Google live adapters,
  and One Time member-library publishing.
- Spouse/second-parent and community-member access remain policy-gated; no
  invite/grant/send surface was enabled.
- Verification passed: `node --check server.js`, smoke runner syntax check,
  Operations inline script parse, focused Operations PWA/login test 7/7, local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-admin-role-policy-local/report.md`, full
  `npm test` 416/416, `git diff --check`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T03-41-18-298Z-live-app-smoke.md`, and
  focused live Playwright smoke
  `ops/playwright-smokes/2026-06-15-admin-role-policy-live/report.md`.
- Guardrail verified: focused live smoke recorded zero write requests after
  login. No invitation, login token, password reset, email, WhatsApp, access
  grant, billing change, Google/Drive action, Buffer/social action, One Time
  publishing action, external connector write, or external CRM write was
  triggered.

## 2026-06-15 Contacts WAPI History Deployed

- Railway deployment `7a866693-367d-4c1d-81d2-f6e8c60f4288` deployed the
  Contacts-side WAPI/local communication history readback.
- Operations Contacts parent cards and Interested Parent cards now count and
  render local communication history matched by direct first-party IDs,
  normalized phone variants, email addresses, and WAPI source context.
- Communication tabs include read-only guardrail copy and perform no Whapi
  sync, WhatsApp send, broadcast, contact/tag write, or external CRM write.
- Added focused contract coverage in `tests/wapi-phonebook-report.test.js`.
- Added reusable fixture-backed smoke runner:
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-live/run-smoke.mjs`.
- Verification passed: `node --check server.js`, Operations inline script
  parse, smoke runner syntax check, focused WAPI/CRM tests 12/12, local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-local/report.md`,
  full `npm test` 417/417, `git diff --check`, Railway doctor SUCCESS, live
  app smoke `ops/live-smokes/2026-06-15T03-54-38-056Z-live-app-smoke.md`, and
  focused live Playwright smoke
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-live/report.md`.
- Guardrail verified: focused smokes used synthetic contact data and recorded
  zero write requests. No Whapi sync, WhatsApp send, broadcast, contact/tag
  update, email, portal message, Google/Drive action, Buffer/social action, or
  external CRM write was triggered.

## 2026-06-15 Contact History Helper Action Deployed

- Railway deployment `fcdf52fe-f623-47c5-8029-194eb68d7cb6` deployed
  `show_contact_communication_history` as the helper/Telegram-facing read-only
  action for local communication history previews.
- The action is registered in the shared Operations Action Registry and routed
  from natural Telegram/helper contact-history requests instead of Codex or raw
  send paths.
- The action reads local `bna_contact_communications` joined to leads, signups,
  and students; it matches by direct first-party IDs, normalized phone variants,
  email/source-address tokens, contact names, and WAPI source context.
- Added focused contract coverage in
  `tests/action-registry-telegram-ui-bot.test.js`, regenerated the action
  registry artifacts, and added reusable focused live API smoke
  `scripts/smoke-contact-history-helper.mjs`.
- Verification passed: action/registry/router/smoke syntax checks, Operations
  inline script parse, focused action/WAPI/CRM tests 44/44, full `npm test`
  418/418, `git diff --check`, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T04-08-21-656Z-live-app-smoke.md`, and focused
  live API smoke
  `ops/live-smokes/2026-06-15T04-08-37-882Z-contact-history-helper-live-smoke.md`.
- Guardrail verified: focused live smoke used fake contact clues with
  `dry_run: true`, returned `executed: false`, `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`. No
  Whapi sync, WhatsApp send, broadcast, contact/tag update, email, Google/Drive
  action, Buffer/social action, or external CRM write was performed.

## 2026-06-15 One Time First-Party Capability Map

- Added `ops/one-time-mishnah/first-party-capability-map.md` to document what
  BNA Operations can safely own before external Rabbi/One Time writes.
- Added `tests/one-time-first-party-capability-map.test.js`.
- The map covers contacts/identities, tags/segments, pipelines/opportunities,
  calendars/classes, payments/access, workflows/automations,
  community/membership support, content/media intake, Buffer/social previews,
  WhatsApp/WAPI communications, no-GHL policy, browser-only Rabbi-owned gaps,
  and external-write acceptance gates.
- Live One Time app/Replit, Vimeo/media host, billing, Resend/email, DNS,
  Google live adapters, Buffer publishing/media attachment, and WhatsApp/Wappy
  outbound automation remain external targets until access, approval phrase,
  rollback, and focused smoke are explicit.
- Verification passed: `node --check` on the new test, focused One Time/audit
  tests 41/41, full `npm test` 420/420, and `git diff --check`.
- No deployment was required because this is local documentation/test coverage
  only. No One Time app access, billing/access change, Google/Drive/Buffer/
  Vimeo/Resend/Stripe write, WhatsApp send, or external CRM write was
  performed.

## 2026-06-15 One Time Content/Media Intake Workflow

- Added `ops/one-time-mishnah/content-media-intake-workflow.md` to document
  the internal-first workflow from Drive drops through recording/session
  records, transcripts/source notes, source sheets, worksheets, question
  digests, organic clips, ad candidates, approval packages, posting, and
  reporting.
- Added `tests/one-time-content-media-intake-workflow.test.js`.
- The workflow uses first-party records before external writes:
  `bna_content_jobs`, `bna_project_meetings`, `bna_content_outputs`,
  `bna_class_sessions`, `bna_one_time_question_reviews`, action/task/decision
  records, action logs/content statuses, and dashboard alerts.
- Live member-library publishing, Google/Drive writes, video-host writes,
  Buffer drafts/publishing, WhatsApp/email sends, access grants, ad spend, and
  external CRM writes remain blocked behind explicit approvals and focused
  smokes.
- Verification passed: `node --check` on the new test, focused One Time/content
  tests 46/46, full `npm test` 422/422, and `git diff --check` with only
  existing LF/CRLF warnings.
- No deployment was required because this is local documentation/test coverage
  only. No One Time app access, member-library publish, Google/Drive/Buffer/
  video-host write, WhatsApp/email send, access grant, ad spend, or external CRM
  write was performed.

## 2026-06-15 One Time Partnership Drafting Pack

- Added `ops/one-time-mishnah/partnership-drafting-pack.md` as the local
  draft-only handoff for Claude or another writing assistant.
- Added `tests/one-time-partnership-drafting-pack.test.js`.
- The pack covers a cleaner agreement memo, values checklist,
  refund/cancellation policy options, family/device/Zoom/access rules,
  landing-page copy, launch emails, and reactivation copy.
- It points drafting work to the current One Time Drive map, billing/referral
  plan, first-party capability map, content/media workflow, and app/backend
  audit while keeping old GHL/legacy CRM wording out of active runtime
  direction.
- Verification passed: `node --check` on the new test, focused One
  Time/drafting tests 48/48, full `npm test` 424/424, and `git diff --check`
  with only existing LF/CRLF warnings.
- No deployment was required because this is local documentation/test coverage
  only. No Google Doc/Drive upload, email, WhatsApp, Buffer/social action,
  billing link, Zoom/access change, member-library publish, ad spend, or
  external CRM write was performed.

## 2026-06-15 Admin Users / External Access

- Deployed Operations Admin > Users as `Users / External Access` for
  super-admin review of external project users.
- External Rabbi/provider/project users are separated from internal users and
  parent accounts. Cards show workspace, role, access level, and configured
  Operations login username.
- The page exposes the existing short-lived `/api/bna/ops-access-links` action
  only as a guarded click path for configured login usernames; new external-user
  creation/editing remains disabled until a dedicated persistence workflow is
  approved.
- Added focused coverage in `tests/operations-pwa-login.test.js` and
  `tests/one-time-external-user-portal.test.js`.
- Verification passed: Operations inline script parse, focused Operations/One
  Time tests 41/41, full `npm test` 426/426, local browser smoke
  `ops/playwright-smokes/2026-06-15-admin-users-local/report.md`, Railway
  deployment `8d87ea87-8034-4533-85f7-71b70e99ccb5`, Railway doctor SUCCESS,
  live app smoke `ops/live-smokes/2026-06-15T04-38-14-284Z-live-app-smoke.md`,
  and focused live smoke
  `ops/playwright-smokes/2026-06-15-admin-users-live/report.md`.
- Guardrail verified: focused live smoke recorded zero write requests after
  login. No email, WhatsApp, password reset, parent account creation, billing
  link, Zoom/access change, member-library publish, Google/Drive action,
  Buffer/social action, external connector write, or external CRM write was
  triggered.

## 2026-06-15 Student Assistant Onboarding Coach

- Deployed deterministic role-specific onboarding coaching inside the shared
  BNA Helper path.
- Student setup/help prompts now explain Today, goals, daily checkoff,
  questions, reflection, and messaging Rabbi/Shloimie before generic
  support-ticket fallback.
- Updated `server.js`, `public/js/bna-bot-widget.js`, and
  `tests/universal-assistant-contract.test.js`, with fixture smoke coverage
  under
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-local/` and
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-live/`.
- Verification passed: syntax checks, focused assistant/portal tests 49/49,
  local fixture Playwright smoke, in-app Browser fixture check, full `npm test`
  427/427, Railway deployment `6b77f88f-7508-43ac-b107-c713d29c34a3`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T04-57-22-945Z-live-app-smoke.md`, and focused
  live fixture smoke
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-live/report.md`.
- Guardrail verified: no support ticket, durable profile/goal write, real
  student checkoff/message, email, WhatsApp, Google Drive, Buffer/social
  action, external connector write, or external CRM write was performed by the
  coach path.

## 2026-06-15 Task Calendar Selected-Day Polish

- Deployed the Phase 8.4 task-calendar selected-day follow-up.
- Tasks > Calendar selected-day view now shows an explicit
  `Selected: Weekday, Month Day, Year` label, Hebrew date/item context, Add
  Task, Move Selected Task, and an adjacent `Google dry-run` action.
- The Google dry-run action is wired through `sync_google_calendar` with
  `dry_run: true`, `requested_from: task_calendar_selected_day`, and
  `no_google_calendar_write: true`.
- Updated `public/operations.html` and
  `tests/operations-task-comments-and-dictation.test.js`, with focused local
  and live smoke coverage under
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-local/` and
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/`.
- Verification passed: Operations inline script parse, focused
  task/action/Google tests 45/45, local in-app Browser check, local Playwright
  smoke, full `npm test` 427/427, Railway deployment
  `84bd450e-d5e9-409c-8126-29a147ab51cd`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T05-14-42-829Z-live-app-smoke.md`, and
  focused live Playwright smoke
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/report.md`.
- Guardrail verified: focused live smoke recorded zero write requests after
  login. No Google Calendar event, internal calendar event, email, WhatsApp,
  Buffer/social action, external connector write, or external CRM write was
  triggered.

## 2026-06-15 Decision Card Context Polish

- Deployed the Phase 8.3 decision-card follow-up.
- Tasks > Decisions detail cards now show a question-style prompt,
  workspace/owner/due context, Option A/B/C choice cards, pros, cons,
  consequences, recommendation, `Needs more info`, and an inline
  decision-comment box.
- Stored single-letter `A/B/C` option labels no longer render as stray
  standalone titles; the visible card uses the real option sentence.
- Decision comments use the existing task-comment API with
  `visibility: workspace`, `source: dashboard`, and `requeue: false`.
- Updated `public/operations.html` and
  `tests/operations-task-comments-and-dictation.test.js`.
- Verification passed: Operations inline script parse, focused
  task/action-registry tests 42/42, full `npm test` 433/433,
  `git diff --check` with only LF/CRLF warnings, local in-app Browser readback
  before the browser reload policy blocked further local browser use, Railway
  deployment `03ad6a70-0f58-40c1-abb4-f2a6bfe4e3a5`, Railway doctor SUCCESS,
  live app smoke `ops/live-smokes/2026-06-15T05-28-00-126Z-live-app-smoke.md`,
  and focused live HTTP readback
  `ops/live-smokes/2026-06-15T05-30-30-413Z-operations-decision-card-ui-live-smoke.md`.
- Guardrail verified: the focused live readback was HTTP-only after Operations
  login. No task update, comment creation, choose-decision action, external
  connector action, email, WhatsApp, Google, Buffer, or CRM write was attempted.

## 2026-06-15 Public Homepage Torah Progress Privacy Hotfix

- Deployed the remaining Phase 1 public/private leak fix for the public Torah
  trip progress surface.
- Public homepage fallback now renders aggregate class trip progress, current
  anonymous range, and trip-status cards instead of the five named student
  cards.
- The runtime homepage renderer now consumes aggregate public metrics and does
  not render `student.name` into the public DOM.
- `/api/torah-learning/public-summary` now returns group fields plus aggregate
  `metrics`, with `students: []` kept only as a compatibility empty array.
  Authenticated/private Torah summaries remain unchanged for Operations and
  portal surfaces.
- Added `tests/public-homepage-privacy.test.js` and updated
  `scripts/smoke-live-app.mjs` to enforce the aggregate-only public API
  contract.
- Verification passed: homepage inline JavaScript parse, focused privacy/Torah
  tests 25/25, full `npm test` 435/435, `git diff --check` with only LF/CRLF
  warnings, Railway deployment `0562f80d-b24d-463b-bef4-7f027fdad077`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T05-46-52-317Z-live-app-smoke.md`, and focused
  live privacy readback
  `ops/live-smokes/2026-06-15T05-47-38-650Z-public-homepage-privacy-live-smoke.md`.
- Guardrail verified: the live public homepage/API omit the five full student
  names, stale per-student renderer strings, parent names/emails, goal minutes,
  and student access codes. No send, connector write, CRM write, task write,
  or portal credential action was performed.

## 2026-06-15 Phase 1 Public Route Privacy Smoke Coverage

- Added repeatable unauthenticated public/private route audit coverage for the
  Phase 1 route list in the 2026-06-14 follow-up brief.
- Added `scripts/smoke-public-route-privacy.mjs` and package command
  `npm run app:smoke:public-privacy`.
- Added `tests/public-route-privacy-contract.test.js`.
- The live smoke covers `/`, `/parent`, `/parent.html`, `/parent/login`,
  `/student`, `/student.html`, `/student/login`, `/signup`, `/signup.html`,
  `/signup-he`, `/providers`, `/service-providers`,
  `/become-service-provider`, `/operations`, `/api/parent-portal`,
  `/api/parent-portal/session`, and `/api/student-portal`.
- Live result: public routes returned anonymous shells, `/operations`
  redirected to Operations login, `/api/parent-portal` returned 401,
  `/api/parent-portal/session` returned 400 with no token, and
  `/api/student-portal` returned 401 with no credential.
- Verification passed: `node --check scripts/smoke-public-route-privacy.mjs`,
  focused route/privacy/portal/provider tests 50/50, full `npm test` 439/439,
  focused `git diff --check` with only LF/CRLF warnings, and live route smoke
  `ops/live-smokes/2026-06-15T05-55-49-944Z-public-route-privacy-smoke.md`.
- No deployment was required because this was test/smoke tooling and audit
  evidence only; no runtime app surface changed.

## 2026-06-15 Observable Codex Queue Canonical Lifecycle Follow-Up

- Corrected the observable Telegram/bot -> ticket -> task -> Codex job flow so
  `bna_agent_jobs.status` stores the canonical machine lifecycle:
  `queued`, `running`, `completed`, `failed`, and
  `blocked_needs_human_decision`.
- Kept ticket/operator readback separate: tickets can still use
  `queued_for_codex`, `in_progress`, `done`, `failed`, and `needs_decision`
  labels, while job rows and fleet APIs use the agent lifecycle required by
  the Operations task model.
- Updated `server.js`, `scripts/agent-fleet-supervisor.mjs`,
  `railway-migration-2026-06-15-observable-codex-queue.sql`, and
  `tests/observable-codex-queue.test.js`.
- Verification passed: `node --check server.js`,
  `node --check scripts/agent-fleet-supervisor.mjs`,
  `node --check scripts/telegram-kimi-bridge.mjs`, focused observable queue
  test 4/4, full `npm test` 443/443, pre-deploy Railway doctor, Railway
  deployment `bee86ce8-747b-4287-90e3-bfa86f7077ab` SUCCESS, post-deploy
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-15T06-07-20-124Z-live-app-smoke.md`, and targeted
  live `/api/bna/codex-queue/status?limit=5` readback with five sampled
  canonical `queued` jobs.
- Guardrail verified: no Google/Drive/Calendar/Classroom, Vimeo, Buffer,
  WhatsApp, email, external connector, external CRM, send, publish, or member
  visibility action was performed.

## Remaining Blockers

- Google OAuth credentials/test users must be confirmed before live test-user
  Google actions can be smoked.
- Drive scope policy still needs approval before turning preview-only Drive
  actions into live Drive reads/writes.
- The Google Action Audit readback view, Google Live Adapter Approval Packet,
  local Google approval decision preview, Rabbi/One Time launch-calendar
  preview action, Classroom topic/material preview action, and Google
  Business/Profile Place ID/location preview helpers are complete and
  deployed; they do not change the OAuth/scope approval blocker for live
  Google adapters.
- Live provider GBP API/feed sync still requires provider opt-in,
  `business.manage`, OAuth/test-user setup, and approval.
- Rabbi live URL and admin/member credentials are still needed for deeper live
  backend audit/replacement work.
- One Time video-library item creation now has a first-party scoped helper and
  Operations review surface plus a publishing approval packet and local
  decision preview, a publish-package blocker preview, a deployed first-party
  Class Package Manager/member-library publishing path, public `/member-library`
  access-code readback, and a deployed read-only app/admin/member-library access
  readiness card/API. It also has a private first-party question moderation
  queue for internal review, a display-only thumbnail preview on library cards,
  plus a local forum/gamification moderation readiness plan. Using the
  member-library path for a real item still requires explicit owner-approved
  destination, visibility/audience, hosted media, smoke item, rollback/revoke,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`. One Time app/admin writes,
  billing/access grants, binary upload, video-host/Drive writes,
  public/member answer/forum/reward surfaces, and public/social/newsletter sends
  remain separate future work behind explicit approval decisions.
- Operations Automation Library / Prompt Browser is complete and live-smoked as
  a read-only map. Any live automation still needs a specific approval phrase,
  connector/sender configuration, recipient/source policy, rollback path, and
  focused smoke before send/publish/billing/access/member-visibility or
  external connector writes.
- Buffer/social schedule preview is complete and live-smoked. Actual Buffer
  draft creation or publishing still requires approval of source material,
  channel/account, copy, schedule window, hosted media path, rollback/no-post
  policy, and `APPROVE_BUFFER_SOCIAL_DRAFT`.

## Next Action

Continue with the next remaining scoped item: one approved One Time
member-library publish/smoke or deeper media hosting after
destination/visibility/hosting/smoke-item/rollback approvals, or live
Google/Classroom/Drive/Google Business adapters after OAuth/scope approval and
`APPROVE_GOOGLE_LIVE_ADAPTER_TEST`. Live
Buffer/social drafts can be exercised only after
`APPROVE_BUFFER_SOCIAL_DRAFT` and the source/channel/schedule/rollback details
are explicit. The local Rabbi/One Time task-flow review script/report, private
One Time question moderation queue, read-only Automation Library / Prompt
Browser, social schedule preview, Contacts WAPI/local history readback, and
`show_contact_communication_history` helper action, One Time first-party
capability map, One Time content/media intake workflow, and One Time
partnership drafting pack, Admin Users / External Access, student assistant
onboarding-coach, task-calendar selected-day polish, decision-card context
polish, public homepage Torah progress privacy hotfix, and Phase 1 public
route privacy smoke coverage, and observable Codex queue canonical lifecycle
items are complete.

## 2026-06-15T09:16:36+03:00 - One Time Billing Policy Packet

The Green Invoice vs Stripe/refund blocker is now an approval-ready local
policy packet, not a vague implementation item.

- Updated `ops/rabbi-scheller/green-invoice-billing-options.md` with the rule
  that One Time must use exactly one provider of record per live product/plan.
- Documented Green Invoice, Stripe, and manual-bridge choices, required billing
  policy decisions, refund/cancellation options R1/R2/R3, exact approval
  phrases, and implementation guardrails.
- Updated `tests/rabbi-scheller-audit-docs.test.js` to require the packet
  before future checkout work.
- Verification passed: `node --check tests/rabbi-scheller-audit-docs.test.js`,
  focused doc tests 4/4, and full `npm test` 444/444.
- No deployment was required because this was local documentation/test coverage
  only.
- No payment links, checkout sessions, subscriptions, invoices, refunds,
  cancellations, member access grants, email/WhatsApp/social sends,
  Drive/video-host writes, external CRM writes, or Rabbi live-site changes were
  performed.

Remaining decision: Shloimie still needs to choose the provider, plan price/
currency, first-cycle rule, subscription anchor, refund policy, access-start
rule, failed-payment grace, support owner, and rollback/revoke owner before
Codex implements checkout or access.

## 2026-06-15T09:21:52+03:00 - Completion Matrix

Added the phase-by-phase completion/blocker matrix:
`ops/goalmode/2026-06-15-goal-completion-blocker-matrix.md`.

- Covers phases 0-16 from the original goal-mode brief.
- Separates `done_deployed`, `done_local`, `preview_ready`, and
  `blocked_owner_or_connector` lanes.
- Keeps approval gates visible for Google live adapters, One Time
  member-library publishing, One Time billing/provider policy, Buffer/social
  drafts, and Rabbi live app access.
- Verification passed: `node --check tests/goalmode-completion-matrix.test.js`,
  focused matrix test 2/2, and full `npm test` 444/444.
- No deployment was required because this was local documentation/test coverage
  only; no connector, send, checkout/access, billing, publishing, member
  visibility, external CRM, or Rabbi live-site write was performed.

## 2026-06-15T09:26:35+03:00 - Owner Approval Unblocker Pack

Added the single owner approval pack:
`ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md`.

- Gives copy-paste templates for Google live adapter smoke, One Time
  member-library publishing smoke, One Time billing/refund policy,
  Buffer/social draft or publish, and Rabbi live app access confirmation.
- Requires required fields, rollback/revoke details, and readback evidence in
  addition to the approval phrase.
- Added `tests/goalmode-owner-approval-unblocker-pack.test.js`.
- Verification passed: `node --check
  tests/goalmode-owner-approval-unblocker-pack.test.js` and focused pack test
  2/2.
- No deployment was required; no connector, send, checkout/access, billing,
  publishing, member visibility, external CRM, or Rabbi live-site write was
  performed.

## 2026-06-15T09:30:38+03:00 - Scoped Task Comment Visibility Test Alignment

Aligned task-comment contract tests with the current scoped visibility helper:

- `tests/operations-task-comments-and-dictation.test.js` now checks that inline
  task and decision comments call `taskCommentDefaultVisibility(...)`.
- `tests/workspace-task-no-stale-agent.test.js` now checks the helper contract:
  One Time Mishnah class comments default to `project`; ordinary comments
  default to `workspace`.
- Verification passed: focused Operations comment/dictation tests 10/10,
  focused workspace no-stale-agent tests 4/4, and full `npm test` 452/452.
- No deployment was required because this was test-only; no runtime code,
  connector, send, checkout/access, billing, publishing, member visibility,
  external CRM, or Rabbi live-site write was performed.

## 2026-06-15T09:35:22+03:00 - External Access Persistence Workflow Packet

Converted the Admin Users / External Access persistence blocker into a local,
test-covered readiness packet:

- Added `ops/access/external-access-persistence-workflow.md`.
- Added `tests/external-access-persistence-workflow.test.js`.
- Added `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` to the owner approval
  pack.
- The packet defines the future dry-run-first `POST
  /api/bna/admin/external-access` target, required person/workspace/role/login
  fields, rollback/revoke owner, audit/readback requirements, and boundaries
  that keep parent/student portal accounts, provider portal passwords,
  Rabbi-owned live-app credentials, billing, member-library access, sends, and
  external connector writes separate.
- The tests also pin today's runtime state: Admin Users remains read-only for
  create/edit and only the existing short-lived Operations access-link action
  is available.

Verification passed:

- PASS `node --check tests/external-access-persistence-workflow.test.js`
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

## 2026-06-15T09:42:48+03:00 - Google Public OAuth Verification Packet

Converted Phase 2 Mode C public production OAuth into a local, test-covered
submission-readiness packet:

- Added `ops/google-integrations/google-public-oauth-verification-packet.md`.
- Added `tests/google-public-oauth-verification-packet.test.js`.
- Updated `ops/google-integrations/google-now-vs-later-scope-plan.md`.
- Added `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET` to the owner
  approval pack.
- The packet is anchored to official Google OAuth app verification, API
  Services User Data Policy, sensitive-scope verification, restricted-scope
  verification, and demo-video guidance checked on 2026-06-15.
- The packet requires final Cloud Console scope categories at submission time,
  privacy/deletion/support URLs, feature-by-scope justification, test-user
  smoke evidence, demo video evidence, security-assessment decision for any
  restricted scope, verification email owner, and rollback plan.
- It explicitly separates public OAuth verification approval from live adapter
  write approval; live reads/writes still require
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.

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

## 2026-06-15T09:52:01+03:00 - Google Test-User OAuth Scope Guard

Tightened the Phase 2 Mode B test-user OAuth setup so the default path no
longer asks Google for broad scopes:

- `server.js` now defaults `GOOGLE_SCOPES` to
  `https://www.googleapis.com/auth/userinfo.email` only.
- A bare `/api/google/oauth/start` no longer requests the configured scope set
  or Drive-pipeline setup implicitly. Broader scopes require an explicit
  feature/scope/setup request for the approved smoke.
- Google role defaults in `src/lib/bna/google-integrations.js` are
  identity-only.
- Classroom manage scopes now avoid roster and profile-email scopes by default.
- `.env.example` now documents identity-only setup plus per-smoke scope
  examples instead of Gmail, broad Drive, Classroom roster, or profile-email
  defaults.
- The OAuth callback page now redacts refresh-token values. Tokens are saved
  only under ignored `.secrets/` files; the browser page shows metadata only.
- Added `tests/google-oauth-scope-guard.test.js`.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/google-integrations.js`
- PASS `node --check tests/google-oauth-scope-guard.test.js`
- PASS focused Google OAuth/scope tests 18/18
- PASS full `npm test` 463/463
- PASS pre-deploy Railway doctor
- PASS Railway deployment `8a02f9fb-6044-48ee-bfeb-747bfeecee2f` reached
  SUCCESS
- PASS post-deploy Railway doctor
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T06-58-03-600Z-live-app-smoke.md`
- PASS targeted live Google readiness readback:
  `default_scopes` and `required_scopes` are both
  `https://www.googleapis.com/auth/userinfo.email`; existing broad Railway
  `GOOGLE_SCOPES` values are reported as configured-scope warnings and are not
  requested by a bare OAuth start.

Deployment:

- Deployed to Railway production as
  `8a02f9fb-6044-48ee-bfeb-747bfeecee2f`.

Guardrail:

- No OAuth flow was started, no Google account was connected, no consent-screen
  setting changed, no Google/Drive/Classroom/Calendar/Business Profile read or
  write ran, no refresh token was printed, and no email/WhatsApp/SMS/Telegram
  send, checkout/access, billing, member-library, Buffer/social, WAPI, external
  CRM, or Rabbi live-site write was performed.

## 2026-06-15T10:09:51+03:00 - Railway Google Scope Env Narrowed

Closed the remaining deployed `GOOGLE_SCOPES` warning from the Mode B OAuth
scope guard:

- Set the Railway production `GOOGLE_SCOPES` variable to
  `https://www.googleapis.com/auth/userinfo.email`.
- Used the Railway one-variable path only; no other Railway variables were
  printed or changed.
- Redeployed the app so the running process picked up the narrowed env value.

Verification passed:

- PASS pre-change Railway doctor
- PASS Railway variable readback for `GOOGLE_SCOPES` only:
  `https://www.googleapis.com/auth/userinfo.email`
- PASS Railway deployment `16920b4a-751a-4ee3-8534-9193a2739a7c` reached
  SUCCESS
- PASS post-deploy Railway doctor
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T07-09-09-425Z-live-app-smoke.md`
- PASS targeted live Google readiness readback:
  `configured_scopes`, `default_scopes`, and `required_scopes` are all
  `https://www.googleapis.com/auth/userinfo.email`; configured-scope warning
  count is 0.

Guardrail:

- No OAuth flow was started, no Google account was connected, no consent-screen
  setting changed, no Google/Drive/Classroom/Calendar/Business Profile read or
  write ran, no secret variable value was printed, and no email/WhatsApp/SMS/
  Telegram send, checkout/access, billing, member-library, Buffer/social, WAPI,
  external CRM, or Rabbi live-site write was performed.

## 2026-06-15T10:11:48+03:00 - One Time Member-Library Publishing Slice

Deployed the first-party One Time member-library publishing path for
`one_time_mishnah_class` class packages:

- Added additive publishing schema anchored to `bna_class_sessions`:
  `one_time_class_assets`, `one_time_member_library_items`,
  `one_time_member_access`, and `one_time_library_publish_events`.
- Added admin APIs for class-package create/edit, linked asset capture, package
  preview, member preview, approval, publish, rollback, and smoke verification.
- Added Operations Content > One Time Library Class Package Manager for
  Vimeo/manual hosted URLs, linked worksheets/source sheets, visibility/tier
  targeting, rollback, and smoke.
- Added public `/member-library` plus `GET /api/member-library?code=...`; the
  readback returns only active-code, tier-visible, published safe fields and
  omits approval flags, rollback metadata, private transcript notes, and
  unrelated BNA student/accounting data.

Verification passed:

- PASS `node --check server.js`
- PASS Operations/member page inline script parse
- PASS `node --test tests/one-time-member-library.test.js` 7/7
- PASS overlapping One Time regression tests 46/46
- PASS full `npm test` 470/470
- PASS Railway deployment `16920b4a-751a-4ee3-8534-9193a2739a7c`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T07-09-28-789Z-live-app-smoke.md`
- PASS focused member-library live smoke:
  `ops/live-smokes/2026-06-15T07-10-48-018Z-one-time-member-library-live-smoke.md`
- PASS Browser render check for live `/member-library`.

Guardrail:

- Publishing remains impossible without explicit `member_library` destination,
  visibility/audience tier, and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.
  No real Vimeo upload/API, Drive/video-host write, email, WhatsApp,
  Buffer/social, checkout/billing, external CRM, public forum, or student
  goal-checkoff merge was added.

## 2026-06-15T10:27:03+03:00 - Signup Credit Email Preview Deploy

Closed the unsafe part of the signup credit payment-link email follow-up by
adding a no-send live preview for the admin confirmation resend path:

- `/api/bna/signups/:id/send-confirmation` now accepts `dry_run:true`.
- Dry-run returns `no_send: true`, `external_write_performed: false`,
  `local_write_performed: false`, and an `email_preview` with recipient count,
  payment method, payment-link status, and redacted body preview.
- The non-dry-run resend path now composes unpaid credit confirmations with the
  configured `PAYMENT_LINK`, matching the public signup submit path.
- Added `scripts/smoke-signup-credit-email-preview.mjs` and package command
  `npm run app:smoke:signup-credit-email-preview`.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-signup-credit-email-preview.mjs`
- PASS focused signup/portal tests 32/32
- PASS full `npm test` 478/478
- PASS pre-deploy Railway doctor
- PASS Railway deployment `c9c861e4-4e1e-4f2e-9fed-7db972d9b1ab` reached
  SUCCESS
- PASS post-deploy Railway doctor
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T07-26-35-552Z-live-app-smoke.md`
- PASS targeted signup credit email preview smoke:
  `ops/live-smokes/2026-06-15T07-26-34-821Z-signup-credit-email-preview-live-smoke.md`

Remaining:

- The original live-send/email-log proof is still open. It should send only to
  approved test recipients and then verify `bna_email_log` for both parent
  emails before marking the old payment-link email task fully done.

Guardrail:

- The targeted live smoke used `dry_run:true`; it sent no email, created no
  checkout/payment activity, wrote no local rows, and did not touch WhatsApp,
  Google, Buffer/social, external CRM, or Rabbi live-site state.

## 2026-06-15T10:41:24+03:00 - Buffer Hosted Media Asset Support Deploy

Closed the unblocked Buffer hosted-media support item for social/content posts:

- Added `src/lib/bna/buffer-media-assets.js` to build Buffer media asset
  payloads from direct hosted image/video URLs.
- `createBufferPostFromContent` now uses Buffer's current ordered `assets`
  array on `createPost` and returns/records media attachment metadata.
- Local file paths and Drive/Dropbox preview links are rejected before any
  Buffer write, preventing accidental text-only drafts when media is not hosted
  correctly.
- Workflow Q/R and the first-party capability map now say hosted Buffer media
  attachment exists, while binary hosting/upload and actual Buffer draft/publish
  remain approval-gated.
- Aligned stale `live_classes` contract expectations in One Time/Google tests
  with the current Operations navigation state.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/buffer-media-assets.js`
- PASS focused Buffer/action/media tests 45/45
- PASS focused One Time/Buffer roadmap tests 41/41
- PASS focused Google settings contract 4/4
- PASS full `npm test` 484/484
- PASS pre-deploy Railway doctor
- PASS Railway deployment `a6c7b3a4-0e2c-456a-9a26-f93af982f2fa` reached
  SUCCESS
- PASS post-deploy Railway doctor
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T07-40-12-729Z-live-app-smoke.md`
- PASS targeted no-write hosted-media preview smoke:
  `ops/live-smokes/2026-06-15T07-41-24-838Z-buffer-hosted-media-preview-live-smoke.md`

Remaining:

- Actual Buffer draft/publish remains blocked until source material,
  channel/account, copy, schedule window, stable direct hosted media, rollback/
  no-post policy, and `APPROVE_BUFFER_SOCIAL_DRAFT` are approved.
- BNA still does not host/upload local media files to Buffer; a separate media
  hosting path is required for local Telegram/Content binaries before they can
  be attached.

Guardrail:

- The targeted live smoke used the existing preview action only. No Buffer
  draft, publish, media upload, email, WhatsApp, Google, billing, member-library,
  external CRM, or Rabbi live-site write was performed.

## 2026-06-15T10:49:22+03:00 - WAPI Lead-Candidate Review Importer Deploy

Closed the remaining WAPI/Whapi lead-candidate review importer item:

- WAPI phonebook correction preview now plans a local
  `bna_parent_leads` `create_lead_candidate` write for unmatched WhatsApp
  school/content/group-interest contacts.
- Existing linked lead/signup/student records are treated as current-family
  matches and skip duplicate lead-candidate creation.
- Confirmed apply remains behind `APPLY_WAPI_CORRECTION`.
- The apply path writes only first-party BNA contact/lead rows and continues to
  report `no_send: true` and `external_write_performed: false`.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/wapi-phonebook-report.js`
- PASS focused WAPI/Whapi/Telegram note tests 13/13
- PASS full `npm test` 488/488
- PASS pre-deploy Railway doctor
- PASS Railway deployment `988985c6-f310-4f84-b169-85878aa16d3c` reached
  SUCCESS
- PASS post-deploy Railway doctor
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T07-48-33-953Z-live-app-smoke.md`
- PASS targeted no-write WAPI lead-candidate preview smoke:
  `ops/live-smokes/2026-06-15T07-49-22-656Z-wapi-lead-candidate-preview-live-smoke.md`

Guardrail:

- The targeted live smoke used `dry_run:true`; it performed no local row write,
  WhatsApp send, broadcast, external CRM write, Buffer/social, Google, billing,
  member-library, or Rabbi live-site write.

## 2026-06-15T11:19:29+03:00 - Student Portal Auth Policy Deployment

- Closed the remaining student portal auth-model decision: BNA keeps private
  access-code links for the current small-school/student portal model.
- Student PIN/password is not approved until a broader student-account rollout,
  parent consent flow, recovery process, support owner, retention policy,
  test-student smoke, and rollback plan are approved.
- Added persistent `bna_student_portal_auth_attempts` auth attempt audit and
  rate-limit support with hashed IP/access-code identifiers,
  success/failure/throttled outcomes, route path only, user-agent hash, and
  metadata proving raw code/IP are not stored.
- Updated the credential guard so persistent failure counts are checked before
  the in-memory fallback and audit count/record calls use the primary pool
  outside caller transactions.
- Added `scripts/smoke-student-portal-auth-policy-live.mjs` and
  `npm run app:smoke:student-auth` for repeatable live readback.
- Fixed `scripts/railway-redeploy.ps1` to include root
  `railway-migration-*.sql` files in the deploy bundle. This fixed the
  transient crash in deployment `0c57ca17-461b-4d04-ba56-ab3243b14aa0`, which
  was missing `railway-migration-2026-06-15-rabbi-checkout-access.sql`.

Verification passed:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-student-portal-auth-policy-live.mjs`
- PASS focused portal/auth/privacy tests 42/42
- PASS full `npm test` 495/495
- PASS Railway deployment `367994a3-04b6-4de4-8abd-0061d68222bf`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T08-16-28-472Z-live-app-smoke.md`
- PASS targeted auth audit live smoke:
  `ops/live-smokes/2026-06-15T08-18-36-134Z-student-auth-policy-live-smoke.md`

Guardrail:

- The targeted auth smoke created one expected first-party invalid-code audit
  row only.
- No student credential was created, sent, rotated, or exposed.
- No email, WhatsApp, SMS, Telegram, Buffer/social, Google/Drive/Classroom,
  billing/access, member-library, external CRM, or Rabbi live-site action was
  performed.
