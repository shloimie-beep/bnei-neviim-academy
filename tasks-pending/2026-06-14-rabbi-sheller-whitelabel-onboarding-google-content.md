# Rabbi Scheller / One Time White-Label Onboarding, Google, Content, CRM Follow-Up

Date: 2026-06-14
Source brief: `C:\Users\User\Downloads\BNA_Codex_Rabbi_Sheller_WhiteLabel_Onboarding_Google_Content_Superprompt_2026-06-14 (1).md`

## Current Status

The superprompt has been imported as an active Codex build brief. Treat this as
continuation work on the existing BNA/One Time goal-mode branch, not as a new
greenfield project.

Current branch:

`cleanup/onboarding-helper-crm-workspace-rabbi`

Preflight snapshot:

`ops/worktree-snapshots/2026-06-14T18-50-41-pre-rabbi-whitelabel-onboarding.md`

Safety archives:

- `.runtime/pre-rabbi-whitelabel-onboarding-20260614-185041.patch`
- `.runtime/pre-rabbi-whitelabel-onboarding-status-20260614-185041.txt`

## Already Completed / Verified In Existing 2026-06-14 Work

- Public/portal privacy hardening was deployed and live-smoked. Public pages,
  parent onboarding, and student login should not leak private parent/student
  records from stale browser state.
- Preview-only One Time Mishnah funnel exists at `/preview/one-time-mishnah`
  and `/one-time-preview`; checkout remains inactive and the live Rabbi site
  was not replaced.
- Official Rabbi/One Time audit docs exist under `ops/rabbi-scheller/` and
  related audit docs exist under `ops/audits/`.
- Operations Settings > Google Workspace is deployed with Drive, Calendar,
  Classroom, and Google Business Profile readiness cards.
- Drive actions are preview-only dry-runs until Google scope policy/test-user
  OAuth and explicit external-write approval are ready.
- Manual provider Google Business/Profile link capture is deployed as an
  approval-gated action without live Google Business Profile API calls.
- WAPI phonebook grouping and manual correction apply UI are deployed. The
  correction flow previews local CRM writes first, requires
  `APPLY_WAPI_CORRECTION`, can update first-party `bna_contacts` and linked
  `bna_parent_leads`, and skips student/signup/provider record mutation.
- Provider setup email and shorter provider join flow are deployed. Public
  provider join now asks 10 questions, sends provider setup email after commit,
  and supports `/provider?setup=...` password setup plus Operations resend.
- Telegram note-to-CRM matching is deployed and live-smoked as a no-send local
  CRM note capture path.
- Parent announcement approved-draft persistence/readback is deployed and
  live-smoked. It reuses local `bna_weekly_updates`, requires
  `APPROVE_PARENT_ANNOUNCEMENT`, and sends nothing during approval/readback.
- Task-title cleanup dry-run is implemented as local CLI/report tooling:
  `npm run task:title-cleanup` is dry-run by default and requires
  `--apply --confirm APPLY_TASK_TITLE_CLEANUP` before live patching.
- The single-task helper action `retitle_task_naturally` is deployed. It is
  approval-gated, rejects raw ramble-looking replacement titles, preserves only
  a truncated previous-title preview, and is routed from Telegram phrases like
  "retitle task #... to ...".
- Task/decision helper actions are deployed: `add_decision_option`,
  `schedule_task_on_date`, and `move_task_workspace`. They are approval-gated,
  preview-first, and local-task-only; they do not create Codex jobs, connector
  writes, sends, or external CRM records.
- Rabbi Mishnayos parent/member onboarding lead capture is deployed on the
  One Time preview funnel. `/one-time-preview#one-time-onboarding` posts to
  `POST /api/one-time/mishnah/onboarding`, which creates only scoped
  first-party review records for One Time and never creates checkout, access,
  email, WhatsApp, social posts, or external CRM writes.
- Local keyholder workflow exists at `C:\Users\User\BNA-Keyholder`; no secret
  values should be pasted into chat or committed.
- Registration toolbar/parent-permission notice deploy gate is closed.

## Completed In This Pass

- Created worktree snapshot and safety archives before new implementation.
- Promoted the superprompt into `MEMORY.md`, `TASKS.md`,
  `SYSTEM-STATE.md`, daily memory, changelog, ledger, and this handoff.
- Re-ran route privacy checks locally. The first browser pass found public
  provider routes did not clear stale `bnaStudentAccessCode` values.
- Fixed stale student-code clearing on:
  - `public/service-providers.html`
  - `public/providers-join.html`
  - `public/provider-profile.html`
- Added regression coverage in `tests/universal-assistant-contract.test.js`.
- Verified locally with focused tests 36/36, full `npm test` 357/357, and
  local Playwright route audit 17/17.
- Deployed Railway bundle `f2595077-6c36-4a04-a5b8-a69452d3dfa5`.
- Post-deploy Railway doctor, app smoke, and live provider/privacy browser
  smoke passed.
- Follow-up WAPI manual correction work was deployed in Railway deployment
  `4c152697-dbd0-4dd7-8834-83b483999459`: Operations now previews local CRM
  contact/lead tag writes before confirmed correction apply, and the live
  endpoint/browser smokes passed without sending WhatsApp or saving a smoke
  correction.
- Added and deployed the Rabbi Mishnayos parent/member onboarding intake in
  Railway deployment `8e55d3c5-b958-42b2-b176-ae74df5bfdb8`. The route writes
  scoped One Time review records only on confirmed submit and supports no-write
  dry-run smokes.
- Added and deployed the One Time video-library item helper in Railway
  deployment `e93d2da8-4852-4d82-a260-39b1be5960b2`. The
  `create_one_time_video_library_item` action is approval-gated and creates
  only scoped first-party One Time content records: one `bna_content_jobs` row
  plus internal review outputs for the library card, transcript review,
  thumbnail brief, worksheet/source-sheet plan, social copy plan, and
  newsletter plan. Preview mode creates no content job and reports no send/no
  external write/no member-public visibility.
- Added and deployed the task/decision helper action bundle in Railway
  deployment `85c15479-f581-45d3-bb53-695fb99f8ac7`. The bundle adds
  `add_decision_option`, `schedule_task_on_date`, and `move_task_workspace`
  with action-registry metadata, Telegram routing, generated action artifacts,
  and approval-gated local task/comment/project updates only.
- Added and deployed the Rabbi shiur/source-sheet helper pair in Railway
  deployment `0dd6f6ec-26ca-4fa1-8520-6e8d76790246`. The pair adds
  `create_rabbi_shiur_idea` and `create_rabbi_source_sheet_task` with
  action-registry metadata, Telegram routing, generated action artifacts, and
  approval-gated local One Time review task creation only. Preview mode writes
  no tasks, and approved execution does not create Codex jobs, Drive/Sefaria or
  member-library writes, sends, public/member visibility, or external CRM
  records.
- Added and deployed the referral/moderation helper trio in Railway deployment
  `e54244e1-41dd-40ae-a313-31cc0c49d6e2`. The trio adds
  `create_referral_ledger_entry`, `submit_student_question_for_moderation`, and
  `review_moderated_question` with action-registry metadata, Telegram routing,
  generated action artifacts, and approval-gated local writes only. Referral
  approval creates only a scoped One Time referral candidate, internal ledger
  note, and review task. Question moderation approval creates or updates only
  private local review tasks/comments. The helpers do not create Codex jobs,
  referral links, rewards/coupons, sends, forum posts, public/member
  visibility, Drive/Sefaria/member-library writes, or external CRM records.
- Added and deployed the WAPI phonebook-first conversation workspace in Railway
  deployment `6c9f06bc-6c1b-47b9-980a-4e8baca73eae`. Operations
  Communications > WhatsApp now renders a phonebook/contact list, selected
  conversation timeline, and details/notes/related records panel over the WAPI
  grouping report. Timeline readback can include matched WhatsApp/WAPI rows,
  Telegram/internal CRM notes, related tasks, and support tickets. Add Internal
  Note writes only local `bna_contact_communications` rows with no-send and
  external-write false metadata; no WhatsApp message, broadcast, or external
  CRM write is sent.
- Added and deployed the One Time content library review surface in Railway
  deployment `4a77ab03-a394-4663-b4b7-55957655c6b0`. Operations Content >
  One Time Library now renders the scoped internal review workspace over One
  Time video-library records: search, report metrics, hosted media URL
  readiness, library/transcript/thumbnail/worksheet/social/newsletter lanes,
  blockers, internal approval queues, and member-library guardrails. Approval
  here records internal state only; it does not send email/WhatsApp/social,
  publish member/public content, create checkout/access, write Drive/video
  hosts, or write external CRM. Live Operations task #610 was marked done after
  deployment and focused live smoke verification.
- Added and deployed the Google Action Audit view in Railway deployment
  `f4f63168-afa4-41e3-8930-a67159c069f1`. Operations Settings > Google
  Workspace now shows a read-only table of recent local Google/Drive/Calendar/
  Classroom/Google Business/Profile preview or execution action logs. The
  audit is local evidence only and does not perform external Google writes.
- Added and deployed the public helper mobile-sheet UX in Railway deployment
  `0b9085f7-a10e-41bb-8123-f8ba1c233ac8`. Phone-width public pages now open
  the BNA Helper as a partial bottom sheet with a reachable launcher/minimize
  control, concise 10-1 program copy, and no old "I'm still here" nudge.
- Added and deployed the public helper source-boundary guard in Railway
  deployment `dcb59bc8-835b-4eb7-a951-653b54a389bf`. Public assistant context
  now names the current 10-1 program, hosted assistant prompts explicitly
  forbid filling policy gaps from generic school-policy knowledge, and public
  allergy/medical policy questions return the deterministic
  `public_policy_boundary` reply before hosted AI.
- Added and deployed support ticket processed-notification drafts in Railway
  deployment `f64213ae-1cc1-4b2e-a762-a06c3e81f3b1`. Resolving or closing a
  ticket now logs a first-party `bna_contact_communications` no-send draft,
  adds an internal ticket comment, returns `notification_draft`, and performs
  no automatic email, WhatsApp, SMS, Telegram, portal, or external CRM send.
- Added and deployed approval-readiness packets in Railway deployment
  `cdb127bb-0f27-4e9b-b9a1-7adb93d64f19`. Operations Settings > Google
  Workspace now shows a Google Live Adapter Approval Packet with
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`; Operations Content > One Time Library
  now shows a One Time Publishing Approval Packet with
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`. Both packets are checklist UI
  only and perform no live Google read/write, Buffer/social, email, WhatsApp,
  Drive/video-host, checkout, member visibility, or external CRM write.
- Added and deployed local approval decision preview controls in Railway
  deployment `475c598d-e9c3-4a5b-990c-e00f2ef1f070`. Each approval packet now
  has a `Preview Decision Draft` button that calls `create_decision` with
  `dry_run: true`; local and live smokes verified `executed: false` and
  `preview.decision_created: false`, so no decision task or external write is
  created by previewing.
- Added and deployed the Rabbi/One Time 8-week launch-calendar preview action
  in Railway deployment `f8951767-ca5f-4c58-a8c5-696015f9d3b9`. Operations
  Settings > Google Workspace > Google Calendar now has an `8-week plan`
  dry-run button wired to `calendar_batch_launch_plan_preview`, and Telegram
  routes natural-language launch calendar requests. The preview is scoped to
  `rabbi_sheller_provider` and performs no internal calendar write, Google
  Calendar write, external write, send, or Google OAuth action.

Reports:

- `ops/qa-runs/2026-06-14T19-00-38-rabbi-whitelabel-onboarding-qa.md`
- `ops/playwright-smokes/2026-06-14-rabbi-whitelabel-provider-privacy-live/report.md`
- `ops/live-smokes/2026-06-14T16-24-46-381Z-wapi-phonebook-correction-live-smoke.md`
- `ops/playwright-smokes/2026-06-14-wapi-phonebook-correction-live/report.md`
- `ops/live-smokes/2026-06-14T-one-time-onboarding-local-smoke.json`
- `ops/playwright-smokes/2026-06-14-one-time-onboarding-local/report.md`
- `ops/live-smokes/2026-06-14T17-05-14-786Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T17-06-57-397Z-one-time-onboarding-live-dry-run.md`
- `ops/local-smokes/2026-06-14-one-time-video-library-action-local-preview.json`
- `ops/live-smokes/2026-06-14T17-36-34-282Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T17-40-27-one-time-video-library-live-preview.json`
- `ops/local-smokes/2026-06-14-task-decision-helper-actions-local-preview.json`
- `ops/live-smokes/2026-06-14T17-54-55-156Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T17-55-44-901Z-task-decision-helper-actions-live-preview.json`
- `ops/local-smokes/2026-06-14-rabbi-content-helper-actions-local-preview.json`
- `ops/live-smokes/2026-06-14T18-08-35-649Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T18-09-23-665Z-rabbi-content-helper-actions-live-preview.json`
- `ops/local-smokes/2026-06-14-referral-moderation-helper-actions-local-preview.json`
- `ops/live-smokes/2026-06-14T18-25-56-841Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T18-26-48-024Z-referral-moderation-helper-actions-live-preview.json`
- `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-local/report.md`
- `ops/live-smokes/2026-06-14T18-51-33-221Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-live/report.md`
- `ops/playwright-smokes/2026-06-14-provider-setup-email-local/report.md`
- `ops/live-smokes/2026-06-14T18-57-24-784Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T18-58-10-provider-setup-email-live-readback.md`
- `ops/playwright-smokes/2026-06-14-login-stability-local/report.md`
- `ops/live-smokes/2026-06-14T19-18-03-287Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-14-login-stability-live/report.md`
- `ops/playwright-smokes/2026-06-14-one-time-content-library-local/report.md`
- `ops/live-smokes/2026-06-14T19-20-41-625Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-14-one-time-content-library-live/report.md`
- `ops/playwright-smokes/2026-06-14-google-action-audit-local/report.md`
- `ops/live-smokes/2026-06-14T19-49-14-650Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-14-google-action-audit-live/report.md`
- `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-local/report.md`
- `ops/live-smokes/2026-06-14T20-12-20-143Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-live/report.md`
- `ops/live-smokes/2026-06-14T20-25-36-985Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T20-39-16-327Z-support-ticket-notification-local-smoke.md`
- `ops/live-smokes/2026-06-14T20-40-31-601Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-14T20-42-38-426Z-support-ticket-notification-live-smoke.md`
- `ops/playwright-smokes/2026-06-14-approval-readiness-local/report.md`
- `ops/live-smokes/2026-06-14T20-56-48-950Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-14-approval-readiness-live/report.md`
- `ops/playwright-smokes/2026-06-15-approval-decision-preview-local/report.md`
- `ops/live-smokes/2026-06-14T21-27-02-855Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`
- `ops/playwright-smokes/2026-06-15-calendar-launch-preview-local/report.md`
- `ops/live-smokes/2026-06-14T21-51-39-727Z-live-app-smoke.md`
- `ops/playwright-smokes/2026-06-15-calendar-launch-preview-live/report.md`

## Immediate Next Actions

1. Keep the dirty worktree preserved and classify changes into commit groups
   before staging anything.
2. One Time content library task #610 is complete for the internal review
   surface, and the One Time Publishing Approval Packet is deployed. Continue
   only with deeper member-library/media publishing after destination,
   visibility, hosting, connector, and explicit approval phrase decisions are
   complete. The packet can preview a local decision draft only as
   `dry_run: true`; previewing creates no decision task or publishing write.
3. Login/input stability has been deployed and live-smoked. Do not reintroduce
   fixed-height login shells, mobile auto-focus, or background refresh while
   text entry/dictation is active.
4. Helper typed actions from `ops/bna-helper/bna-helper-tool-audit.md` are
   implemented for retitle, task/decision organization, One Time video-library
   intake, Rabbi shiur/source-sheet planning, referrals, and private question
   moderation. The Google Action Audit readback view and public helper
   source-boundary guard are also deployed. Support ticket processed
   notifications are also deployed as local no-send drafts plus internal
   comments. The Google Live Adapter Approval Packet is also deployed.
   The Rabbi/One Time 8-week launch calendar can be previewed through
   `calendar_batch_launch_plan_preview`, but it does not create internal or
   Google Calendar events.
   Google Classroom topic/material placement can be previewed through
   `classroom_topic_material_preview`, but it does not perform Classroom
   reads/writes or live Google API calls.
   The packet can preview a local decision draft only as `dry_run: true`;
   previewing creates no decision task or Google write.
   Remaining helper-audit work is live Google/Drive adapter execution after
   OAuth/scope approval and explicit `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
5. Add live Drive adapters only after OAuth/test-user scope policy approval and
   explicit external-write confirmations are ready.

## 2026-06-15T07:15:52+03:00 - First-Party Capability Map Completed

Completed the unblocked One Time platform-planning item:

- Added `ops/one-time-mishnah/first-party-capability-map.md`.
- Added `tests/one-time-first-party-capability-map.test.js`.
- The map documents what BNA Operations can own now before external writes:
  contacts, tags, pipelines/opportunities, calendars/classes, payments/access
  readiness, workflow previews, private community/membership support,
  content/media intake, Buffer/social previews, and WAPI/local communication
  readback.
- It keeps Rabbi-owned live app/Replit, Vimeo/media host, billing,
  Resend/email, DNS, Google live adapters, Buffer publishing/media attachment,
  and WhatsApp/Wappy outbound automation gated behind owner access, explicit
  approval phrases, rollback paths, and focused smokes.

Verification:

- PASS test syntax check.
- PASS focused One Time/audit tests 41/41.
- PASS full `npm test` 420/420.
- PASS `git diff --check`.

No deployment was required because this is local documentation/test coverage
only. No external app, connector, send, billing/access, or external CRM write
was performed.

## Hard Gates

- Do not replace Rabbi Scheller's live production site until Shloimie reviews
  and approves a preview.
- Do not activate checkout, final pricing, or live payment links without
  Shloimie approval.
- Do not perform live Google Calendar/Classroom/Drive/Business Profile writes
  from natural language without draft preview and explicit confirmation.
- Do not expose BNA private students/accounting/family accountability data to
  Rabbi, One Time parents/students, service providers, or public pages.
- Do not run live email/WhatsApp/SMS sends during testing unless explicitly
  approved.
- Do not introduce GHL/LeadConnector runtime paths; active CRM/provider/contact
  work stays first-party BNA plus approved connectors such as Buffer/WAPI.

## Product Direction To Preserve

- Rabbi Scheller / One Time is the first real service-provider workspace under
  a broader BNA white-label/workspace model.
- Shloimie is platform super admin/admin manager; Rabbi Scheller is a scoped
  provider/teacher admin.
- One Time parents/students/members are separate from BNA school
  parents/students and separate from family accountability workspaces.
- The main One Time offer is live Mishnayos/community membership, with video
  library as support/fallback rather than the only CTA.
- Pricing must stay config-driven until approved.
- Content intake should support Drive/upload -> transcript -> library ->
  worksheet/source sheet -> newsletter/social drafts -> approval queue.
- Google work is layered: manual/no-OAuth now, test-user OAuth next,
  verification package later.

## Verification To Run Next

For the next app-visible slice, run the touched syntax checks, focused tests,
full `npm test`, a local browser/API smoke, Railway deploy, Railway doctor,
`npm run app:smoke`, and a live no-send/dry-run smoke before marking it done.
For local-only tooling, keep the report dry-run by default and document why no
deployment was required.

## 2026-06-14T23:59:28+03:00 - Approval-Readiness Packets Deployed

Google live-adapter and One Time member-library publishing readiness are now
explicit in Operations.

- Settings > Google Workspace renders the Google Live Adapter Approval Packet
  and the `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` phrase.
- Content > One Time Library renders the One Time Publishing Approval Packet
  and the `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` phrase.
- Both packets are readiness-only and perform no live Google read/write, no
  Buffer/social/email/WhatsApp/Drive/video-host/checkout/member-visibility
  work, and no external CRM write.

Verification passed:
- Operations inline script parse
- focused approval contracts 7/7
- full `npm test` 383/383
- `git diff --check` with only existing LF/CRLF warnings
- local smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-local/report.md`
- Railway deployment `cdb127bb-0f27-4e9b-b9a1-7adb93d64f19`
- Railway doctor SUCCESS
- live app smoke
  `ops/live-smokes/2026-06-14T20-56-48-950Z-live-app-smoke.md`
- live smoke:
  `ops/playwright-smokes/2026-06-14-approval-readiness-live/report.md`

## 2026-06-15T00:28:12+03:00 - Approval Decision Preview Controls Deployed

The approval packets can now produce local Shloimie decision previews without
creating tasks or running connector/publishing work.

- Google packet button: previews `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` decision
  context through `create_decision` dry-run.
- One Time packet button: previews
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decision context through
  `create_decision` dry-run.
- Local and live smokes verified `dry_run: true`, `executed: false`, and
  `preview.decision_created: false`.

Verification passed:
- Operations inline script parse
- focused approval contracts 7/7
- full `npm test` 383/383
- local smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-local/report.md`
- Railway deployment `475c598d-e9c3-4a5b-990c-e00f2ef1f070`
- Railway doctor SUCCESS
- live app smoke
  `ops/live-smokes/2026-06-14T21-27-02-855Z-live-app-smoke.md`
- live smoke:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`

## 2026-06-15T00:54:22+03:00 - Calendar Launch Preview Action Deployed

The Rabbi/One Time launch-calendar preview action is deployed.

- Operations Settings > Google Workspace > Google Calendar renders an
  `8-week plan` dry-run button.
- The button calls `calendar_batch_launch_plan_preview` with a real object
  payload and scopes the request to `rabbi_sheller_provider`.
- Telegram routes 8-week launch-calendar requests and extracts a start date
  when supplied.
- Without a start date, the preview returns only the expected `start_date`
  blocker.
- The action performs no internal calendar write, Google Calendar write,
  external write, send, or Google OAuth action.

Verification passed:
- JS syntax checks for the action registry, operations action runner, and
  Telegram router
- Operations inline script parse
- focused action/Google settings tests 30/30
- full `npm test` 384/384
- local smoke:
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-local/report.md`
- Railway deployment `f8951767-ca5f-4c58-a8c5-696015f9d3b9`
- Railway doctor SUCCESS
- live app smoke
  `ops/live-smokes/2026-06-14T21-51-39-727Z-live-app-smoke.md`
- live smoke:
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-live/report.md`

## 2026-06-15T01:11:18+03:00 - Classroom Topic/Material Preview Action Deployed

Google Classroom topic/material placement now has a deployed preview action.

- Operations Settings > Google Workspace > Google Classroom renders a
  `Topic/material` dry-run button.
- Telegram can route natural-language Classroom material/topic requests into
  `classroom_topic_material_preview`.
- The action previews course, topic, material title/link, topic lookup/create
  policy, and required external inputs only.
- It performs no Classroom read/write, no internal write, no send, no external
  write, and no live Google API call.

Verification passed:
- JS syntax checks for the action registry, operations action runner, and
  Telegram router
- Operations inline script parse
- focused action/Google settings tests 31/31
- full `npm test` 385/385
- local smoke:
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-local/report.md`
- Railway deployment `72a371b8-50b7-48c8-8cf7-f3efa7b1f8a4`
- Railway doctor SUCCESS
- live app smoke
  `ops/live-smokes/2026-06-14T22-09-44-742Z-live-app-smoke.md`
- live smoke:
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-live/report.md`

## 2026-06-15T01:24:07+03:00 - Google Business Preview Helpers Deployed

Google Business/Profile Place ID and accessible-locations planning now has
deployed preview actions.

- Operations Settings > Google Workspace > Google Business Profile renders
  `Place ID` and `Locations` dry-run buttons.
- Telegram can route natural-language Google Business/Profile Place ID and
  accessible-locations requests into `google_business_place_id_lookup` and
  `google_business_list_locations_preview`.
- The previews perform no Maps lookup, no Google Business Profile API call, no
  external read, no external write, no send, and no live Google API call.
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

One Time member-library publishing now has a deployed package/blocker preview.

- Operations Content > One Time Library cards can expose a `Package Preview`
  button wired to `preview_one_time_member_library_publish_package`.
- Telegram can route One Time content-job publish-package preview requests.
- The preview assembles package fields and blockers for one scoped One Time
  content job only.
- It performs no member-library publish, member visibility change,
  Drive/video-host write, Buffer/social write, email/WhatsApp send,
  checkout/access grant, external CRM write, live send, or local content write.
- Actual member-library publishing remains blocked until Shloimie approves the
  destination, visibility/audience, hosting, connector, smoke item, rollback,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.

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

## Remaining Operator Decisions

- Approve final One Time landing page copy/offer/pricing/payment path.
- Confirm Rabbi Scheller social destinations and Buffer/social scheduler setup.
- Approve One Time member-library/video-host destination and visibility rules
  before any publishing connector is built or used.
- Provide or confirm any needed Gemini/Vimeo/Zoom/Google/Resend/payment secrets
  through the local keyholder workflow, not chat.
- Confirm whether and when Rabbi should receive scoped login instructions.

## 2026-06-15T02:09:04+03:00 - One Time App Access Readiness

Deployed and verified a read-only readiness surface for the external One Time
app/admin/member-library stack.

- Operations Settings > Drive / Social Intake now shows
  `One Time App Readiness` for the Rabbi/One Time provider workspace.
- `GET /api/bna/one-time/app-access-readiness` returns blockers and no-write
  flags.
- The Drive/social ingestion map JSON and Markdown now include the same
  app-access readiness section.
- Railway deployment: `55102a5c-f6a6-4866-aacf-d0086ba6b909`.
- Verification: full `npm test` 388/388, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T23-05-50-938Z-live-app-smoke.md`, and live
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-live/report.md`.

No One Time admin password reset, member access grant, member-library publish,
Drive/video-host write, email/WhatsApp/SMS send, checkout/billing write, or
external CRM write was performed. Actual app/admin/member-library writes still
require owner-approved URL/access, Rabbi/member test login, database/source
confirmation, media host, Resend/domain/copy, billing/access policy,
rollback/revoke path, and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.

## 2026-06-15T02:18:44+03:00 - Rabbi Task-Flow Audit Local Report

Added and verified a local read-only task-flow audit for Rabbi/One Time records.

- Command: `npm run task:rabbi-flow-audit`.
- Report:
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`.
- The report scanned 305 tasks and found 102 Rabbi/One Time related records:
  51 active, 48 human blockers/decisions, 0 Codex-ready, 6 private BNA scope
  review flags, 32 external-write gate review flags, and 2 visible title
  review flags.
- Guardrail: read-only/no-apply, local Markdown/JSON report only, private BNA
  title-preview redaction, no task patching, no workspace move, no retitle,
  no send, no publish, no access grant, and no external write.
- Verification: syntax checks, focused task/Telegram tests 41/41, live
  read-only audit run, and full `npm test` 392/392.

No deployment was required. This closes the older internal handoff item for an
admin review script/report that can clean up the Rabbi task flow without
silently moving records.

## 2026-06-15T02:43:00+03:00 - Private Question Moderation Queue

Deployed and verified a private One Time question moderation queue before any
student/member-facing forum or answer surface exists.

- Added `bna_one_time_question_reviews`.
- `submit_student_question_for_moderation` now creates a private review row
  with the private task.
- `review_moderated_question` updates the private review row with the
  task/comment.
- Added read-only `GET /api/bna/one-time/question-moderation`.
- Operations Content > One Time Library shows `Private Question Moderation
  Queue`.

Guardrails:

- Private/no-send/no-public-forum/no-member-visible.
- No forum post, public/member answer, email/WhatsApp/SMS/portal send, Codex
  job, checkout/access grant, Drive/video-host write, or external CRM write is
  created automatically.

Verification:

- PASS syntax checks
- PASS Operations inline script parse
- PASS focused action/One Time tests 68/68
- PASS full `npm test` 393/393 before deploy
- PASS local API and Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-local/report.json`
- PASS Railway deployment `afff8d91-e0aa-426b-94f8-f128b8f57822`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T23-42-19-692Z-live-app-smoke.md`
- PASS live API smoke:
  `ops/live-smokes/2026-06-14T23-42-54-513Z-one-time-question-moderation-live-smoke.md`
- PASS live Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-live/report.json`

This closes the earlier queue/schema requirement for moderated questions. The
actual public/member answer experience remains future work behind explicit
destination, visibility, parent/provider safety, and send/publish approval.

## 2026-06-15T03:02:00+03:00 - Automation Library / Prompt Browser

Deployed and verified the read-only Operations Automation Library under
Settings > Automations.

- Includes One Time/Rabbi workflow cards for private question review, 8-week
  nurture planning, and Rabbi content-added review.
- Also includes adjacent BNA/provider cards for provider onboarding, parent
  accountability follow-up, ticket processed acknowledgement, parent weekly
  updates, and Google live-adapter testing.
- The Prompt Browser surfaces content prompts, assignment prompts, helper
  policies, and no-send/no-external-write guardrails.

Guardrails:

- No sends, publishing, billing/access changes, member visibility changes,
  Google writes, Drive/video-host writes, checkout/access grants, or external
  CRM writes run from this library.

Verification:

- PASS focused adjacent tests 45/45
- PASS full `npm test` 396/396
- PASS Railway deployment `5d21c82c-d77e-4d5d-a8c2-c1b1129c17a8`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T23-58-42-116Z-live-app-smoke.md`
- PASS live Browser/UI smoke:
  `ops/playwright-smokes/2026-06-15-automation-library-live/report.json`

## 2026-06-15T03:46:17+03:00 - Forum / Gamification Moderation Plan

Completed the local Phase 11 readiness plan before any public/member-facing
One Time forum or reward display is built.

- Added `ops/one-time-mishnah/forum-gamification-moderation-plan.md`.
- Added focused coverage in
  `tests/one-time-forum-gamification-plan.test.js`.
- The plan requires authenticated-only participation, AI-first moderation,
  human review, temporary holds pending admin review instead of automatic bans,
  quality rewards/badges only after Rabbi/admin approval, no public shame, no
  leaderboard without explicit approval, audit logging, no-send notification
  gates, and launch smokes.

Verification:

- PASS `node --check tests/one-time-forum-gamification-plan.test.js`
- PASS focused test 4/4
- PASS adjacent One Time tests 42/42

No deployment was required. This created no public forum, member-visible feed,
reward ledger, notification send, publishing, access grant, Google/Drive/
video-host write, Buffer/social write, checkout, or external CRM write.

## 2026-06-15T07:21:47+03:00 - One Time Content/Media Intake Workflow

Completed the internal-first content/media intake workflow requested for the
Rabbi/One Time pipeline:

- Added `ops/one-time-mishnah/content-media-intake-workflow.md`.
- Added `tests/one-time-content-media-intake-workflow.test.js`.
- The map covers Drive drops, recording/session records, transcripts/source
  notes, source sheets, worksheets, question digests, organic clips, ad
  candidates, approval packages, posting, and reporting.
- First-party BNA Operations records remain the holding layer until explicit
  approvals exist: `bna_content_jobs`, `bna_project_meetings`,
  `bna_content_outputs`, `bna_class_sessions`,
  `bna_one_time_question_reviews`, tasks, decisions, action logs, content
  statuses, and dashboard alerts.
- External writes remain gated behind the relevant approval phrases:
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`, `APPROVE_BUFFER_SOCIAL_DRAFT`, and
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.

Verification:

- PASS `node --check tests/one-time-content-media-intake-workflow.test.js`
- PASS focused One Time/content tests 46/46
- PASS full `npm test` 422/422
- PASS `git diff --check` with only existing LF/CRLF warnings

No deployment was required. This created no app access, member-library publish,
Google/Drive/Buffer/video-host write, WhatsApp/email send, access grant, ad
spend, public/member visibility, or external CRM write.

## 2026-06-15T07:26:24+03:00 - One Time Partnership Drafting Pack

Completed the proposal-to-writing-assistant drafting pack:

- Added `ops/one-time-mishnah/partnership-drafting-pack.md`.
- Added `tests/one-time-partnership-drafting-pack.test.js`.
- The pack includes source-backed prompts for:
  - cleaner agreement memo
  - values checklist
  - refund/cancellation policy options
  - family/device/Zoom/access rules
  - landing-page copy
  - launch email pack
  - reactivation copy with suppression rules
- It keeps all generated text draft-only until Shloimie/Rabbi review and
  legal/accounting review where needed.
- It explicitly blocks live Drive uploads, email/WhatsApp sends, Buffer/social
  actions, billing links, Zoom/access changes, member-library publishing, ad
  spend, Google writes, and external CRM writes.

Verification:

- PASS `node --check tests/one-time-partnership-drafting-pack.test.js`
- PASS focused One Time/drafting tests 48/48
- PASS full `npm test` 424/424
- PASS `git diff --check` with only existing LF/CRLF warnings

No deployment was required. This created no Google Doc/Drive upload, campaign,
billing/access change, public page publish, member-library publish,
Google/Buffer/video-host write, WhatsApp/email send, ad spend, or external CRM
write.

## 2026-06-15T07:40:38+03:00 - Admin Users / External Access Deployed

Completed and deployed the broader super-admin Users/account management slice
for One Time/external admins:

- Admin > Users now renders `Users / External Access`.
- External Rabbi/provider/project users are listed separately from internal
  users and are explicitly not parent portal accounts.
- Configured login usernames can receive a guarded short-lived BNA Operations
  access link only after a Super Admin click.
- The page states that One Time app/admin/member credentials are separate from
  BNA Operations access.
- New external-user creation/editing stays disabled until a dedicated
  persistence workflow is approved.

Verification:

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

Guardrail: no email, WhatsApp, password reset, parent account creation,
billing link, Zoom/access change, member-library publish, Google/Drive action,
Buffer/social action, external connector write, or external CRM write was
triggered.

## 2026-06-15T03:51:57+03:00 - Provider Login / Grabify Audit

Completed the local Phase 12 provider-login / Grabify bug audit:

- Added `ops/provider-intake/provider-login-phase12-audit.md`.
- Added focused coverage in `tests/provider-login-phase12-audit.test.js`.
- The report confirms the active scoped provider login/setup/session flow,
  provider-owned pending-review edits, generic failed-login behavior, prior
  live provider portal smoke, no active Grabify reference in inspected provider
  login sources, and the exact fresh live credential smoke checklist to run
  when an approved provider test account is available.

Verification:

- PASS `node --check tests/provider-login-phase12-audit.test.js`
- PASS focused Phase 12 test 4/4
- PASS adjacent provider-directory tests 16/16

No deployment was required. This created no provider password, setup token,
login link, email, WhatsApp, billing action, listing change, or external
connector write.

## 2026-06-15T04:03:38+03:00 - Social Schedule Preview Action

Completed and deployed the Phase 14 social scheduling preview:

- `preview_social_schedule_package` now lets the helper/action registry preview
  Buffer/social draft packages without writing to Buffer.
- Telegram routing recognizes scheduling/Buffer/multi-post phrases and routes
  them to the dry-run action instead of treating them as immediate publishing.
- The preview returns channels, schedule slots, blockers, provider `buffer`,
  and the `APPROVE_BUFFER_SOCIAL_DRAFT` phrase.

Verification:

- PASS syntax checks
- PASS Operations inline script parse
- PASS focused action/Telegram test 31/31
- PASS adjacent tests 53/53
- PASS full `npm test` 409/409
- PASS local action smoke:
  `ops/local-smokes/2026-06-15-social-schedule-preview-local.md`
- PASS Railway deployment `cc96c44c-303f-4dab-ada0-e6dd62738d3b`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T01-02-48-717Z-live-app-smoke.md`
- PASS focused live API smoke:
  `ops/live-smokes/2026-06-15T01-03-38-576Z-social-schedule-preview-live-smoke.md`

Guardrail:

- No Buffer draft, media upload, publish, send, local content write, Google/
  Drive write, checkout/access change, member-visibility change, or external
  CRM write is performed by this preview.

## 2026-06-15T04:24:36+03:00 - One Time Thumbnail Preview UI

Completed and deployed the Phase 13 thumbnail-preview follow-up for the Rabbi/
One Time library surface:

- Operations Content > One Time Library cards now render `Thumbnail Preview`.
- The preview reads HTTP(S) thumbnail URLs from `thumbnail_brief` metadata,
  parsed metadata, or job thumbnail/image URL fields.
- It shows the image, status/brief text, `Open Thumbnail`, and a
  `Thumbnail reference missing` fallback.

Verification:

- PASS syntax checks
- PASS Operations inline script parse
- PASS focused action/One Time tests 37/37
- PASS full `npm test` 409/409 before deploy
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-local/report.md`
- PASS Railway deployment `85107895-5677-4580-b3f6-7d91c1e70025`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T01-24-36-196Z-live-app-smoke.md`
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-live/report.md`

Guardrail:

- Display-only review UI. No thumbnail generation/upload, publish, send,
  access grant, Drive/video-host write, Buffer action, checkout/access change,
  member-visibility change, or external CRM write is performed.

## 2026-06-15T08:34:00+03:00 - Rabbi Class Media Intake V1 Deployed

Completed and deployed the Rabbi/One Time Class Media Intake V1 slice:

- Corrected the exact Rabbi Elie Scheller provider record
  (`rabbi_elie_scheller`) to the `one_time_mishnah_class` project scope.
- Added provider-portal `Class Media`, separate from profile/gallery `Media`.
- Added provider-authenticated APIs:
  - `POST /api/provider-portal/one-time/class-media`
  - `PATCH /api/provider-portal/one-time/class-media/:jobId`
- Added `dry_run: true` validation/preview support.
- Real submissions create/update scoped One Time `bna_content_jobs`, standard
  internal output lanes, class-session readback, and local in-app review
  notifications for Shloimie.
- Operations One Time Library readback now shows `Submitted from Rabbi portal`,
  provider/service/session context, hosted URL readiness, and review blockers.

Verification:

- PASS `node --check server.js`
- PASS Operations/provider inline script parse
- PASS focused One Time/provider tests 25/25
- PASS full `npm test` 432/432
- PASS local provider API dry-run smoke and Operations browser readback:
  `ops/playwright-smokes/2026-06-15-one-time-class-media-intake-local/report.md`
- PASS Railway deployment `2d58bd61-d3a7-477b-adee-b8eac5fd9599`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T05-32-09-348Z-live-app-smoke.md`
- PASS live endpoint dry-run smoke:
  `ops/live-smokes/2026-06-15T05-34-00-000Z-one-time-class-media-intake-live-smoke.md`

Guardrail:

- Live smoke was dry-run only.
- No login/setup email, WhatsApp, onboarding message, binary upload,
  Drive/Vimeo/video-host write, member-library publish, checkout/access grant,
  public/member visibility change, Buffer/social action, or external CRM write
  was performed.
