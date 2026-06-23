# Rabbi Task UI / Helper / One Time Preview Handoff

Date: 2026-06-14

Branch: `cleanup/rabbi-workspace-task-ui-helper-20260614-155524`

Safety snapshot:

- Safety branch: `safety/pre-rabbi-task-ui-cleanup-20260614-155524`
- Safety commit: `d98373e Safety snapshot before Rabbi task UI and workspace cleanup`

## Objective

Finish the local BNA Operations task UI/helper cleanup and One Time audit/preview pass, then deploy and live-smoke only after local verification is green.

## Implemented Locally

- Operations shared shell palette now uses BNA blue/gold/soft-blue/parchment
  instead of generic black/gray dashboard tokens.
- Operations topbar/mobile header now uses the BNA icon asset instead of a
  dark text dot.
- Added a workspace context strip showing current workspace, current role,
  viewing scope, and active task filters.
- Replaced `Workspace Bucket` language with `Workspace Status`.
- Task filters now show clearer Workspace, Assignee, Type, Status, and Date
  controls, including Upcoming and No date.
- Decision cards now route option selection through the typed
  `/actions/choose-decision` endpoint.
- Added a typed `/api/bna/tasks/:id/actions/needs-more-info` endpoint and UI
  button so decisions can remain open without choosing a fake option.
- Added selected-day calendar controls:
  - `Add task to this date`
  - `Move selected task to this date`
- Added a preview-only One Time Mishnah funnel:
  - `/preview/one-time-mishnah`
  - `/one-time-preview`
  - Static page: `public/one-time-preview.html`
  - Assets copied into `public/images/one-time-logo-black.png` and
    `public/images/one-time-existing-site-preview.jpg`
- Added audit docs:
  - `ops/audits/2026-06-14-one-time-repo-inventory.md`
  - `ops/audits/2026-06-14-rabbi-scheller-app-backend-advice.md`
  - `ops/audits/2026-06-14-one-time-billing-referral-plan.md`
  - `ops/audits/2026-06-14-bna-helper-action-matrix.md`
- Fixed the Operations login/auth hot path found during local smoke:
  - `operations-login.html` now redirects only when `/api/bna/auth/me` returns
    an authenticated JSON body, not merely HTTP 200.
  - `buildBnaIdentityPayload` no longer runs personal workspace seeding on
    every auth read, so `/api/bna/auth/me` does not block first render.
  - Added regression coverage for both behaviors.

## One Time Repo Findings

- `shloimie-beep/one-time-app` is an Expo/mobile companion prototype with demo
  backend content and no real billing/email/moderation.
- `shloimie-beep/one-time-one-time` is the existing web/backend source with
  Stripe, Resend, Vimeo, media library, analytics, comments/questions, hotline,
  admin, and customer portal surfaces.
- No active GHL/GoHighLevel/LeadConnector runtime was found in the exported One
  Time code.
- `one-time-one-time` needs security hardening before reuse: debug/setup routes,
  a hard-coded setup secret literal, broad CORS, query-token phone exports,
  committed media caches, and missing child/forum moderation states.

## Local Verification

Completed before this handoff was finalized:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS focused task/brand/Operations tests:
  `node --test tests/operations-saas-crm-redesign.test.js tests/operations-pwa-login.test.js tests/app-wide-brand-shell.test.js tests/bna-brand-shell.test.js tests/operations-task-comments-and-dictation.test.js tests/one-time-preview-page.test.js`
- PASS `npm test` 341/341
- PASS authenticated local Playwright/browser smoke:
  `ops/playwright-smokes/2026-06-14-task-ui-brand-cleanup-authenticated/report.md`
  - `/operations?view=tasks`
  - `/operations?view=tasks&section=decisions`
  - `/operations?view=tasks&section=schedule`
  - `/operations?view=service_providers`
  - `/parent`
  - `/student.html`
  - `/signup`
  - `/signup-he`
  - `/preview/one-time-mishnah`
  - widths: 390, 430, 768, 1440

## Deployment Gate

Completed for the BNA app deployment:

- PASS Railway deployment `f8c16762-9a73-4a77-8a9b-c5cbe2a00ec8` reached
  SUCCESS.
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T13-56-08-327Z-live-app-smoke.md`
- PASS live Operations tasks/decisions/schedule/providers smoke and live
  parent/student/signup/preview smoke:
  `ops/playwright-smokes/2026-06-14-task-ui-brand-cleanup-live/report.md`

Do not deploy Rabbi Scheller's live production site or activate payment links.
The One Time page in BNA is preview-only until Shloimie approves launch.

## Remaining Work

- Add fully typed helper actions for natural retitle, add decision option,
  schedule/move task, Rabbi shiur idea, Rabbi source-sheet task, referral
  ledger, and moderated student question flow.
- DONE 2026-06-15: Converted the Green Invoice vs Stripe billing provider and
  refund/cancellation blocker into an approval-ready policy packet in
  `ops/rabbi-scheller/green-invoice-billing-options.md`. The packet now
  requires exactly one provider of record per live One Time plan, covers Green
  Invoice, Stripe, and manual-bridge options, defines refund policy choices
  R1/R2/R3, lists exact approval phrases, and repeats the no-checkout/no-access
  guardrails. Actual implementation remains blocked on Shloimie's provider,
  price/currency, first-cycle, subscription-anchor, access-start,
  failed-payment, support-owner, and rollback/revoke approvals.
- DONE 2026-06-15: Build the private question moderation schema and Rabbi
  review queue before any student-facing comments/questions go public.
  `bna_one_time_question_reviews`, `GET /api/bna/one-time/question-moderation`,
  and Operations Content > One Time Library `Private Question Moderation Queue`
  are deployed and live-smoked. The queue is private/no-send/no-forum/
  no-member-visible and creates no public answer surface.

## 2026-06-14 17:20 Addendum - Public/Portal Privacy Fix

New local work on branch `cleanup/onboarding-helper-crm-workspace-rabbi`:

- Preserved the prior dirty tree with a named stash, switched to the
  goal-mode branch, and reapplied the work.
- Fixed `/parent/login?onboard=accountability` so it shows the public
  onboarding/login shell instead of auto-rendering the private parent portal
  from an existing session.
- Fixed stale student browser state:
  - `/student/login` clears saved `bnaStudentAccessCode` when no current code
    is present.
  - non-student pages clear saved student codes.
  - the universal helper no longer reads saved student access codes from
    `localStorage`.
- Student-audience portal payloads no longer spread the full student DB row;
  parent contact fields are redacted from the student response.
- Local report:
  `ops/goal-mode/2026-06-14-onboarding-helper-crm-workspace-report.md`.
- Local smoke:
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-fix/report.md`.

Verification:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS focused privacy/assistant/workspace tests
- PASS `npm test` 341/341
- PASS local browser privacy smoke

Deployment gate:

- PASS Railway deployment `59b07235-039a-4d0c-9676-8ecea6736390` reached
  SUCCESS.
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-25-57-627Z-live-app-smoke.md`
- PASS live public/parent/student privacy smoke:
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-live/report.md`

The public/portal privacy item from the goal-mode brief is closed. The broader
brief remains open for helper action coverage, CRM/contact timeline,
automations/prompts/drips, provider login, and deeper Rabbi/One Time
follow-through.

## 2026-06-14 17:41 Addendum - Local BNA Keyholder

Completed the keyholder security slice from the goal-mode brief:

- Created local folder `C:\Users\User\BNA-Keyholder` outside the repo.
- Created the desktop shortcut `BNA Keyholder`.
- Added `scripts/open-bna-keyholder.ps1` to initialize/open the folder with
  expected key files, `README.txt`, and `keyholder-log.jsonl`.
- Added `scripts/keyholder-diagnostics.mjs` to report keyholder file metadata,
  normalized lengths, SHA-256 fingerprint prefixes, newline/quote/BOM status,
  last modified time, and `.secrets` fingerprint matches without printing
  secret values.
- Added package commands `keyholder:open` and `keyholder:diagnose`.
- Added `docs/local-keyholder.md`.
- Added `tests/keyholder-diagnostics.test.js`.

Verification:

- PASS `node --check scripts/keyholder-diagnostics.mjs`
- PASS `node --test tests/keyholder-diagnostics.test.js`
- PASS `npm run keyholder:diagnose`:
  `ops/qa-runs/2026-06-14T14-41-27-809Z-keyholder-diagnostics.md`
- PASS `npm test` 345/345

The broader brief remains open for helper action coverage, CRM/contact
timeline, automations/prompts/drips, provider login, and deeper Rabbi/One Time
follow-through.

## 2026-06-14 17:46 Addendum - Official Rabbi Audit Deliverables

Completed the exact Rabbi/One Time report paths named by the goal-mode brief:

- Added `ops/rabbi-scheller/2026-06-14-one-time-app-audit.md`.
- Added `ops/rabbi-scheller/green-invoice-billing-options.md`.
- Added `tests/rabbi-scheller-audit-docs.test.js`.
- Rechecked GitHub refs:
  - `one-time-app` main:
    `a3463bc6756ac34d8f304451fa0e5190309b8ae1`
  - `one-time-one-time` main:
    `050fe2468a3f5601e74e738c219cbe5c1bdf398e`

Verification:

- PASS `node --test tests/rabbi-scheller-audit-docs.test.js`
- PASS `npm test` 347/347

The docs are still audit/advice only. Do not replace Rabbi Scheller's live site,
activate checkout, invent credentials, or merge One Time member/media/payment
records into BNA school private records without approval.

## 2026-06-15 02:18 Addendum - Rabbi Task-Flow Audit Script

Completed the remaining local admin review/report item without moving records:

- Added `scripts/rabbi-task-flow-audit.mjs`.
- Added package command `task:rabbi-flow-audit`.
- Added `tests/rabbi-task-flow-audit.test.js`.
- Generated the live read-only report:
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`.

Report summary:

- Scanned tasks: 305.
- Rabbi / One Time related tasks: 102.
- Active Rabbi / One Time tasks: 51.
- Human blocker or decision: 48.
- Codex-ready: 0.
- Private BNA scope review: 6.
- External-write gate review: 32.
- Visible title review: 2.

Guardrail:

- The audit is read-only and has no apply mode. It writes only Markdown/JSON
  reports, redacts private BNA terms in title previews, and does not move,
  close, retitle, reassign, patch, send, publish, grant access, or write any
  external system.

Verification:

- PASS `node --check scripts/rabbi-task-flow-audit.mjs`
- PASS `node --check tests/rabbi-task-flow-audit.test.js`
- PASS `node --test tests/rabbi-task-flow-audit.test.js`
- PASS focused task/Telegram tests 41/41
- PASS live read-only audit run
- PASS full `npm test` 392/392

No deployment was required because this is local CLI/report tooling only.

## 2026-06-15 02:43 Addendum - Private Question Moderation Queue

Completed and deployed the private One Time question moderation schema/API/UI
before any public/forum/member-visible question surface:

- Added `bna_one_time_question_reviews`.
- `submit_student_question_for_moderation` now creates the private review row
  alongside the task.
- `review_moderated_question` updates the private review row alongside the
  task/comment.
- Added read-only `GET /api/bna/one-time/question-moderation`.
- Operations Content > One Time Library renders `Private Question Moderation
  Queue`.

Guardrail:

- The queue performs no forum post creation, member-visible answer publishing,
  send, Codex job creation, checkout/access grant, Drive/video-host write, or
  external CRM write.

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

## 2026-06-15 03:02 Addendum - Automation Library / Prompt Browser

Completed the next automations/prompts visibility slice from the broader
follow-up:

- Operations Settings > Automations now shows a read-only Automation Library
  with 8 guarded workflow cards and a Prompt Browser table.
- Cards show trigger, audience, channel, prompt/template, status, last/next
  evidence, linked records, dry-run preview, and disabled approval-required
  enable controls.
- Rabbi/One Time-specific cards cover private question review, 8-week nurture
  planning, and Rabbi content-added review.

Verification:

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

No live automation was enabled by this slice.

## 2026-06-15 03:30 Addendum - Private In-app Notification Center

Completed and deployed the private first-party Operations notification center:

- Added `bna_in_app_notifications` and `bna_notification_preferences`.
- Added admin APIs for notification read/update and no-send notification
  preferences:
  - `GET /api/bna/notifications`
  - `PATCH /api/bna/notifications/:id`
  - `GET /api/bna/notification-preferences`
  - `PATCH /api/bna/notification-preferences`
- Operations Dashboard > Alerts now renders `Private In-app Alerts`, unread
  counts, priority/status/event badges, read/unread/archive actions, and an
  explicit lock note that no external channel is triggered.
- Hooked in-app alerts for parent leads, provider onboarding, parent
  accountability leads, One Time leads, support tickets, processed ticket
  drafts, Rabbi content added, and One Time question moderation/review.
- One Time question moderation actions now log private in-app alerts while still
  avoiding public/member-visible answers, forum posts, sends, and external
  writes.

Guardrail:

- The new notification framework is in-app only. It does not send email,
  WhatsApp, Telegram, portal messages, Buffer/social posts, Google/Drive writes,
  checkout/access grants, member-visible publishes, or external CRM writes.
- Preference APIs force external channel flags false until a future explicit
  approval path defines sender, recipients, copy, rollback, and smoke rules.

Verification:

- PASS `node --check server.js`
- PASS `node --check src/lib/actions/actions/operations.js`
- PASS `node --check src/lib/actions/registry.js`
- PASS Operations inline script parse
- PASS focused notification/action tests 33/33
- PASS `npm test` 399/399
- PASS local Operations Browser/UI smoke for Dashboard > Alerts
- PASS local authenticated notification/preference API smoke
- PASS Railway deployment `a3c49708-8c22-462a-bb88-60b43abd94c2`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T00-27-55-812Z-live-app-smoke.md`
- PASS focused live API and Browser/UI smoke:
  `ops/live-smokes/2026-06-15T00-30-00-000Z-notification-center-live-smoke.md`

Remaining blockers:

- Live automations still require a specific approval path, connector/sender
  configuration, recipient/source policy, rollback path, and focused smoke
  before any external send, publish, billing/access, member-visibility, Google,
  Drive/video-host, Buffer/social, or external CRM write.
- Live Google/Classroom/Drive/Google Business adapters remain blocked until
  OAuth/test-user scope policy/provider approval and
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Full One Time member-library/media publishing remains blocked until
  destination, visibility/audience, hosting, connector, smoke item, rollback,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decisions are explicit.

## 2026-06-15 03:38 Addendum - Current Dirty Worktree Commit Groups

Completed the unblocked safety step from Immediate Next Actions item 1:

- Added
  `ops/worktree-snapshots/2026-06-15T03-38-00-goalmode-current-commit-groups.md`.
- Current inventory at capture time:
  - 86 `git status --short` entries.
  - 44 tracked modified files.
  - 98 untracked files from `git ls-files --others --exclude-standard`.
  - tracked diff stat: 44 files, 16,826 insertions, 2,193 deletions.
- Classified the dirty tree into curated commit groups:
  - goal bookkeeping and durable memory
  - action registry / Telegram routing / helper actions
  - server runtime and database/APIs
  - Operations UI and public/portal surfaces
  - focused tests
  - read-only reports, local smokes, and screenshots
  - local Rabbi task-flow audit tool

Guardrail:

- Nothing was staged, committed, reverted, deleted, moved, deployed, sent, or
  externally written by this classification pass.
- The report explicitly says not to broad-stage the tree and to use curated
  `git add -- <files>` groups only.

Remaining blockers:

- Live Google/Classroom/Drive/Google Business adapters remain blocked until
  OAuth/test-user/provider approval and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Full One Time member-library/media publishing remains blocked until
  destination, visibility/audience, hosting, connector, smoke item, rollback,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decisions are explicit.

## 2026-06-15 03:40 Addendum - Exact One Time Access / Backend Audit Refresh

Completed the local documentation gap for the exact source-brief path:

- Refreshed
  `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md`.
- The audit now covers repo/live/Replit URL status, login routes, role/access
  model, how Shloimie can safely log in, credential source names only, missing
  credentials and decisions, analytics/billing/Resend/media inventory, routes
  and pages, BNA reuse/separation/integration guidance, risks/blockers, and a
  safe One Time bootstrap/reset plan.
- The report explicitly avoids secrets and says BNA should not reset live One
  Time admin access without owner-approved target confirmation and secret
  handling.
- Added focused coverage to `tests/rabbi-scheller-audit-docs.test.js`.

Verification:

- PASS `node --check tests/rabbi-scheller-audit-docs.test.js`
- PASS `node --test tests/rabbi-scheller-audit-docs.test.js` 3/3

No deployment was required because this is local documentation/test coverage
only.

Remaining blockers are unchanged:

- Live Google/Classroom/Drive/Google Business adapters remain blocked until
  OAuth/test-user/provider approval and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Full One Time member-library/media publishing remains blocked until
  destination, visibility/audience, hosting, connector, smoke item, rollback,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decisions are explicit.

## 2026-06-15 03:46 Addendum - Forum / Gamification Moderation Plan

Documented the Phase 11 One Time forum/gamification safety plan without
launching any public or member-visible surface:

- Added `ops/one-time-mishnah/forum-gamification-moderation-plan.md`.
- Added `tests/one-time-forum-gamification-plan.test.js`.
- The plan keeps questions private-first and requires authenticated-only
  participation, AI-first moderation, human review, temporary holds pending
  admin review instead of automatic bans, quality rewards/badges only after
  Rabbi/admin approval, no public shame, no leaderboard without explicit
  approval, moderation audit trail, no-send notification gates, and launch
  smokes.

Verification:

- PASS `node --check tests/one-time-forum-gamification-plan.test.js`
- PASS focused test 4/4
- PASS adjacent One Time tests 42/42

No deployment was required because this is local documentation/test coverage
only.

## 2026-06-15 09:41 Addendum - Rabbi/One Time Task Dialogue Board

Completed and deployed the requested Rabbi/One Time task manager internal
dialogue slice for project `one_time_mishnah_class`.

What changed:

- Added repeatable migration/backfill
  `railway-migration-2026-06-15-rabbi-task-dialogue.sql`.
- Extended active Express `server.js` task startup SQL with `task_kind`,
  clean display fields, raw/cleaned capture fields, bot-created labels,
  pending/blocker fields, `bna_task_activity`, and One Time pending-access
  seed cards.
- Refactored task creation/bot intake so One Time rambles route to
  `one_time_mishnah_class`, raw text stays in detail fields, visible titles
  are cleaned, low-confidence operational input becomes review/decision work,
  access blockers become Pending/access, and Codex/system work becomes
  observable agent jobs.
- Added board/detail/comment/action behavior for board-ready task fields,
  project-visible One Time comments, activity history, latest agent-job state,
  and transition logging.
- Updated `public/operations.html` so One Time Tasks render exactly four
  columns: Decisions, Pending/access, Tasks, and Done/history.
- Fixed a live-smoke title edge case where a recording-page voice note was
  still too close to the raw transcript in the visible card title.

Verification:

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/rabbi-task-dialogue.test.js` 4/4
- PASS focused task/agent/Rabbi bundle 54/54
- PASS full `npm test` 455/455
- PASS Railway deployment `57d70c58-b659-4165-9da1-469137b2a568`
- PASS `npm run railway:doctor`
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T06-40-02-550Z-live-app-smoke.md`
- PASS focused live Rabbi dialogue API smoke:
  `ops/live-smokes/2026-06-15T06-41-04-215Z-rabbi-task-dialogue-live-smoke.md`

Guardrails:

- The focused live smoke created a temporary One Time task, verified clean
  title/raw-detail separation, added a Rabbi project-visible comment, moved
  the card to Pending/access for Vimeo access/rules, converted it back to a
  task, marked it Done/history, verified activity history, and deleted it.
- No Google Drive/Classroom/Calendar write, Zoom API scheduling, Vimeo upload,
  Buffer/social action, WhatsApp/email send, checkout/access grant,
  member-library publish, external connector write, external CRM write, or
  Rabbi live-site change was performed.
- Zoom and Vimeo remain manual/pending-access placeholders only.

Remaining blockers:

- One Time Pending/access cards now represent the external blockers for
  Stripe/payment processor access, Vimeo access/posting rules, website/content
  assets, Zoom/manual links, and Resend/email settings.
- Local-only `npm run doctor` remains blocked on this machine until a usable
  local `DATABASE_URL` is provided through the approved keyholder/Railway path;
  live Railway verification is green.

## 2026-06-15 09:02 Addendum - Observable Codex Queue Deployed

Completed and deployed the observable bot-to-Codex lifecycle.

What changed:

- `server.js` now creates a first-party `bna_tickets` table, canonical
  `bna_agent_jobs` status lifecycle, `bna_agent_job_events`, and bridge/task
  source metadata.
- `captureIncomingBotMessage()` is the source-of-truth helper for Telegram/bot
  captures and powers `/api/bna/bot/capture`.
- New Operations APIs expose tickets, agent jobs, claim/heartbeat/complete/block,
  queue status, and stale sweep.
- `scripts/telegram-kimi-bridge.mjs` sends actionable task captures through the
  observable capture endpoint and shows ticket/job IDs in `/queue`.
- `scripts/agent-fleet-supervisor.mjs` now prefers queued observable jobs,
  claims them atomically, reports start/completion/blocker messages to the
  source Telegram chat when available, and falls back to old task selection only
  if the job API is unavailable.
- `public/operations.html` Agent work status shows job/ticket/task IDs, status,
  blockers, reports, and stale candidates.

Verification:

- PASS `node --check server.js`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS full `npm test` 443/443
- PASS Railway deployment `13d01908-e353-428c-b5eb-9313cb1d8bf8`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T06-00-50-878Z-live-app-smoke.md`
- PASS live `npm run agent:fleet:status`; deployed `/api/bna/codex-queue/status`
  returned 12 observable `queued_for_codex` jobs.

Remaining caution:

- Existing queued fallback tasks were backfilled into observable jobs/tickets.
  Future cleanup can decide whether to close or work those queued jobs, but do
  not mark them complete without the normal Codex verification/deploy gate.

## 2026-06-15 08:15 Addendum - Task Calendar Selected-Day Polish

Completed and deployed the Phase 8.4 selected-date follow-up:

- Tasks > Calendar selected-day view now shows an explicit
  `Selected: Weekday, Month Day, Year` label.
- The panel keeps Hebrew date/item context plus Add Task and Move Selected Task
  actions.
- Added a `Google dry-run` control wired to `sync_google_calendar` with
  `dry_run: true` and `no_google_calendar_write: true`.

Guardrail:

- The dry-run path does not create internal calendar events or Google Calendar
  events. Focused live smoke recorded zero write requests after login.

Verification:

- PASS Operations inline script parse.
- PASS focused task/action/Google tests 45/45.
- PASS full `npm test` 427/427.
- PASS local in-app Browser check.
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-local/report.md`.
- PASS Railway deployment `84bd450e-d5e9-409c-8126-29a147ab51cd`.
- PASS Railway doctor SUCCESS and live app smoke:
  `ops/live-smokes/2026-06-15T05-14-42-829Z-live-app-smoke.md`.
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/report.md`.

Remaining:

- Live Google Calendar execution remains blocked until OAuth/test-user/scope
  approval and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.

## 2026-06-15 08:30 Addendum - Decision Card Context Polish

Completed and deployed the Phase 8.3 decision-card follow-up:

- Decision detail cards now show question-style prompts, workspace/owner/due
  context, Option A/B/C cards, pros, cons, consequences, recommendation,
  `Needs more info`, and an inline decision-comment box.
- Stored single-letter `A/B/C` option labels are suppressed as standalone
  titles so the card displays the real option sentence.
- Decision comments use the existing task-comment API with `requeue: false`.

Verification:

- PASS Operations inline script parse.
- PASS focused task/action-registry tests 42/42.
- PASS full `npm test` 433/433.
- PASS Railway deployment `03ad6a70-0f58-40c1-abb4-f2a6bfe4e3a5`.
- PASS Railway doctor SUCCESS and live app smoke:
  `ops/live-smokes/2026-06-15T05-28-00-126Z-live-app-smoke.md`.
- PASS focused live HTTP readback:
  `ops/live-smokes/2026-06-15T05-30-30-413Z-operations-decision-card-ui-live-smoke.md`.

Guardrail:

- Focused live readback was no-write. No task update, comment creation,
  choose-decision action, send, Google/Buffer action, or external CRM write was
  attempted.

## 2026-06-15 05:02 Addendum - Google Integrations Route

Operations > Integrations > Google is now the canonical Google readiness
surface for Rabbi/One Time Google work. Provider and platform workspaces can
open the Integrations module; parent/household workspaces are redirected away
from it. Settings > Google Workspace remains as a compatibility mirror.

Verification:

- PASS full `npm test` 415/415
- PASS Railway deployment `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T01-59-10-544Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-google-integrations-module-live/report.md`

Guardrail: no live Google API read/write, connector write, send, publish,
access grant, or external CRM write was performed.

## 2026-06-15 04:41 Addendum - Parent Accountability Lead Capture

Completed and deployed the parent/accountability CRM follow-up slice:

- `/api/parent-accountability/onboarding` now creates or updates a first-party
  `bna_parent_leads` row with `lead_type = 'accountability_interest'`.
- Support tickets, lead communication notes, and private in-app Operations
  notifications are linked back to the parent lead.
- Operations Contacts > Interested Parents defaults to all lead categories and
  includes `Accountability app interest`.
- `dry_run` supports no-write local/live smoke testing.

Guardrail:

- Dry-run writes nothing. Real submissions create only first-party BNA
  Operations records; they do not send email, WhatsApp, Telegram, or portal
  messages, create child-visible goals, write Google/Drive/Buffer/social, or
  write external CRM.

Verification:

- PASS syntax checks, Operations/parent inline script parse, focused tests
  22/22, and full `npm test` 414/414 before deploy.
- PASS local dry-run smoke:
  `ops/local-smokes/2026-06-15-parent-accountability-onboarding-local.md`.
- PASS Railway deployment `59ec51a1-56b2-4e0d-854a-ee3f8aab5558`.
- PASS Railway doctor SUCCESS and live app smoke:
  `ops/live-smokes/2026-06-15T01-38-34-614Z-live-app-smoke.md`.
- PASS focused live dry-run smoke:
  `ops/live-smokes/2026-06-15T01-39-30-000Z-parent-accountability-onboarding-live-smoke.md`.

## 2026-06-15 04:24 Addendum - One Time Thumbnail Preview UI

Completed and deployed the Phase 13 thumbnail preview UI slice:

- Operations Content > One Time Library cards now show a `Thumbnail Preview`
  panel.
- The panel reads HTTP(S) URLs from `thumbnail_brief` metadata, parsed
  metadata, or job thumbnail/image URL fields.
- It renders the image, status/brief copy, `Open Thumbnail`, and
  `Thumbnail reference missing` when no URL exists.

Guardrail:

- Display-only UI. No thumbnail generation/upload, member-library publish,
  email/WhatsApp/social send, checkout/access change, Drive/video-host write,
  Buffer action, local content write, or external CRM write runs from this
  panel.

Verification:

- PASS syntax checks, Operations inline script parse, focused action/One Time
  tests 37/37, and full `npm test` 409/409 before deploy.
- PASS local renderer-based browser smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-local/report.md`.
- PASS Railway deployment `85107895-5677-4580-b3f6-7d91c1e70025`.
- PASS Railway doctor SUCCESS and live app smoke:
  `ops/live-smokes/2026-06-15T01-24-36-196Z-live-app-smoke.md`.
- PASS live renderer-based browser smoke:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-live/report.md`.

## 2026-06-15 04:03 Addendum - Social Schedule Preview Action

Completed and deployed the Phase 14 Buffer/social scheduling preview slice:

- Added typed action `preview_social_schedule_package`.
- Added Telegram routing for scheduling/Buffer/queueing phrases such as
  "Schedule this Facebook post", "Make 3 posts from this video", and "one post
  per day this week".
- Regenerated action-registry artifacts under `ops/action-registry/`.
- The action returns Buffer/provider readiness, target channels, schedule
  slots, blockers, and the `APPROVE_BUFFER_SOCIAL_DRAFT` phrase.

Guardrail:

- The preview performs no Buffer draft write, no Buffer media upload, no social
  publish, no send, no local content write, and no external write.

Verification:

- PASS syntax checks for `src/lib/actions/actions/operations.js`,
  `src/lib/actions/registry.js`, and
  `src/lib/bna/telegram-action-router.js`.
- PASS Operations inline script parse.
- PASS focused action/Telegram test 31/31.
- PASS adjacent social/content/automation tests 53/53.
- PASS full `npm test` 409/409.
- PASS local action-runner smoke:
  `ops/local-smokes/2026-06-15-social-schedule-preview-local.md`.
- PASS Railway deployment `cc96c44c-303f-4dab-ada0-e6dd62738d3b`.
- PASS Railway doctor SUCCESS.
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T01-02-48-717Z-live-app-smoke.md`.
- PASS focused live API smoke:
  `ops/live-smokes/2026-06-15T01-03-38-576Z-social-schedule-preview-live-smoke.md`.

Remaining blockers:

- Actual Buffer draft creation or publishing still requires approval of source
  material, channel/account, copy, schedule window, hosted media path,
  rollback/no-post policy, and `APPROVE_BUFFER_SOCIAL_DRAFT`.
- Live Google/Classroom/Drive/Google Business adapters remain blocked until
  OAuth/test-user/provider approval and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Full One Time member-library/media publishing remains blocked until
  destination, visibility/audience, hosting, connector, smoke item, rollback,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decisions are explicit.

## 2026-06-15 03:51 Addendum - Provider Login / Grabify Audit

Documented the Phase 12 provider-login / Grabify bug current state:

- Added `ops/provider-intake/provider-login-phase12-audit.md`.
- Added `tests/provider-login-phase12-audit.test.js`.
- The audit records active provider login/setup/session APIs, scoped provider
  access, generic failed-login messages, prior live provider portal smoke, and
  the fresh live credential smoke checklist for any current login failure.
- No active Grabify reference was found in the inspected provider login source
  surfaces.

Verification:

- PASS `node --check tests/provider-login-phase12-audit.test.js`
- PASS focused test 4/4
- PASS adjacent provider-directory tests 16/16

No deployment was required because this is local documentation/test coverage
only.
