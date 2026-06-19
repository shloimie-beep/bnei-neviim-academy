# Agent Changelog

This file is a repo-visible changelog for work completed through Telegram/Kimi,
Codex, and other agents. It is intentionally separate from raw daily memory.

Agents should append concise completed-work records here when a machine task is
marked done, verified, deployed, or otherwise finished.

## 2026-06-07T16:09:29+03:00 - Add signup Tuition Agreement signature flow

Codex added the first required parent document signature flow to the public
signup process.

Changes:
- Added `Bnei Neviim Academy Tuition Agreement` version `2026-06-07-v1`.
- Public English and Hebrew signup pages now include a Tuition Agreement card
  before the waiver. Parents must open a large readable modal and click the
  signature button at the bottom.
- The UI states that clicking the button is the parent electronic signature.
- The signature is tied to Parent 1 name and Parent 1 email. Changing either
  after signing resets the signature.
- `/api/submit` now requires the tuition agreement signature and rejects
  unsigned or signer-mismatched submissions.
- Signup rows store tuition agreement summary fields.
- New table `bna_signup_agreement_signatures` stores detailed document
  signatures with signup id, agreement type/title/version, text snapshot,
  signer name/email, server timestamp, client click timestamp, IP, user agent,
  and metadata for this and future required documents.
- Updated live app smoke signup dry-run payload to include tuition signature
  data.

Verification:
- PASS `node --check server.js`
- PASS signup inline scripts parse for `public/signup.html` and
  `public/signup-he.html`
- PASS `npm test` 33/33
- PASS Railway deployment `591f5ddc-fc87-4c34-a47f-a30d4e0d6932`
- PASS Railway doctor
- PASS `npm run app:smoke -- --require-drive`:
  `ops/live-smokes/2026-06-07T13-07-54-405Z-live-app-smoke.md`
- PASS targeted live browser check: modal opens, tuition text appears, signing
  marks the agreement signed, and changing Parent 1 resets it
- PASS targeted API checks: unsigned and signer-mismatched dry-run submissions
  are rejected
- PASS `npm run openai:smoke`:
  `ops/openai-smokes/2026-06-07T13-09-23-353Z-openai-sidekick-smoke.md`

- source: codex
- worker: Codex

## 2026-06-07T15:39:21+03:00 - Merge duplicate Accounting roster rows

Codex fixed the duplicate rows that appeared in the Operations Accounting
section after paid intake records were reconciled into signup rows.

Root cause:
- The Accounting roster included active signups plus any intake row not marked
  `completed` or `ignored`.
- Reconciled intake rows were marked `matched`, so they still displayed beside
  their new signup rows.

Change:
- Added a shared unresolved-intake filter in `public/operations.html`.
- Accounting now displays payment-intake rows only when they are genuinely
  unresolved. `matched`, `completed`, and `ignored` intake rows remain in the
  database/history but do not duplicate the family roster card.

Live verification:
- Accounting Payments view now shows 5 rows exactly: Hillel Baraka, Huda
  Weber, Amitai Kosofsky, Eitan Chaim Golombo, and Menachem Mendel Dratler.
- Summary shows `Total records=5`, `Paid=4`, `Open=1`, `Needs signup=0`,
  `Partial=1`, and no duplicate student names.

Verification:
- PASS Operations inline scripts parse
- PASS `npm test` 33/33
- PASS Railway deployment `85378409-0914-434f-bb66-d82951de65e5`
- PASS targeted live Playwright Accounting roster check
- PASS Railway doctor
- PASS `npm run app:smoke -- --require-drive`:
  `ops/live-smokes/2026-06-07T12-38-57-821Z-live-app-smoke.md`

- source: codex
- worker: Codex

## 2026-06-07T15:28:17+03:00 - Fix homepage Blog carousel and reconcile paid intake records

Codex completed the operator's follow-up audit that some visible and hidden
work might still be sitting unfinished.

Changes:
- Public homepage Blog now uses a one-row horizontal carousel instead of
  stacking all blog cards down the page. Desktop shows three cards at a time,
  tablet narrows card width, mobile remains a one-card carousel, and category
  filters reset the row to the first card.
- Added admin-only `POST /api/bna/payment-intake/reconcile-paid` for safe,
  repeatable reconciliation of paid intake records that do not yet have
  official signup forms.
- Reconciled Nikki Weber / Huda Weber into signup #9 and payment log #5:
  ILS 1000 paid by Green Invoice on 2026-05-25, next due 2026-06-25.
- Reconciled Shalom Galambo / Eitan Chaim Golombo into signup #10 and payment
  log #6: ILS 1000 paid cash on 2026-05-25, next due 2026-06-25.
- Production now reports zero `needs_signup` payment-intake records. Braka /
  Hillel Baraka remains partial with ILS 800 paid and ILS 200 remaining.
- Created hidden-work audit report:
  `ops/system-audits/2026-06-07-forgotten-work-and-accounting-audit.md`.

Verification:
- PASS `node --check server.js`
- PASS `npm test` 33/33
- PASS Railway deployment `d012de8b-aea5-43ce-a9af-1ea1ec572eba`
- PASS protected Accounting readback
- PASS homepage Blog Playwright desktop/mobile carousel check
- PASS `npm run openai:smoke`:
  `ops/openai-smokes/2026-06-07T12-30-22-849Z-openai-sidekick-smoke.md`
- PASS `npm run app:smoke -- --require-drive`:
  `ops/live-smokes/2026-06-07T12-30-09-485Z-live-app-smoke.md`

- source: codex
- worker: Codex

## 2026-06-07T15:01:15+03:00 - Reconcile Braka partial Green Invoice payment

Codex reconciled the operator-provided Green Invoice details for the Braka /
Baraka family.

Live data now shows:
- Signup #7 Naomi Braka / Hillel Baraka: `payment_status=partial`,
  `payment_method=green_invoice`, `payment_amount=800.00`, transaction
  `DP488806585`, received 2026-06-01 09:16, with ILS 200.00 remaining.
- Payment intake #7: linked to signup #7, payer Mordechai Braka, student
  Hillel Baraka, amount ILS 800.00, method green_invoice, status `matched`.
- Payment log #4: completed ILS 800.00 Green Invoice payment with card-ending
  note `6609`.
- Braka no longer appears in the `needs_signup` payment-intake list.

Audit result:
- Live app tasks: 102 total, 1 active.
- Only active task: #147 `Complete Google Business Profile Task`, assigned to
  Shloimie from content job #24.
- Agent fleet is running with pending 0 and in_progress 0.
- Remaining paid-intake records needing signup/matching are Nikki Weber / Huda
  Weber and Shalom Galambo / Eitan Chaim.

Verification:
- PASS live protected API check for signups, payment intake, payment log,
  tasks, and agent fleet status.

- source: codex
- worker: Codex

## 2026-06-07T12:58:23+03:00 - Fix Telegram OpenAI Operations visibility

Codex fixed the Telegram OpenAI sidekick gap where broad operations questions
could be answered from transcript/topic context instead of the live dashboard.

Changes:
- Expanded the BNA app snapshot passed to OpenAI/Kimi API fallback with
  Operations UI sections, subtabs, visible actions/buttons, task lane counts,
  active task details/comments, implementation briefs, agent fleet status,
  students/accountability/Torah, devices/rules, content jobs/prompts/bundles,
  contacts/accounting, reminders, and recent webhook summaries.
- Tightened transcript-topic intent detection so logistics, scheduling,
  dashboard sections, pending/queued work, ordering, audits, accountability,
  payments, contacts, devices, and agent questions use the live app snapshot
  unless the operator explicitly asks for transcript/class-content topics.
- Updated the OpenAI sidekick smoke to verify Operations sections, pending
  briefs, content prompts, devices, protected app endpoints, Drive folders,
  students, payments, and transcripts.
- Restarted the local Telegram bridge; current PID is `13056`.

Verification:
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/smoke-openai-sidekick.mjs`
- PASS `npm test` 33/33
- PASS `npm run openai:smoke`:
  `ops/openai-smokes/2026-06-07T09-57-22-678Z-openai-sidekick-smoke.md`

- source: codex
- worker: Codex

## 2026-06-07T11:45:22+03:00 - Deploy Operations app shell

Built the Operations app shell for Telegram task #130. The old top horizontal
category nav is no longer the dashboard frame; Operations now renders inside a
left sidebar on desktop and a hamburger-driven left drawer on mobile. Tasks,
Students, Content, Contacts, and Accounting each have section subtabs with
route `section` state, and the previous always-on command-center strip no
longer crowds every screen.

Tasks now opens into an Overview plus focused lanes for Decisions, My Tasks,
Rabbi Tasks, Codex Queue, Pending Briefs, Changelog, and Done. Students uses
focused views for Overview, Group Goal, Student List, Student Profile, Goal
Board, Tablet Access, Questions, and Portal Links. Content, Contacts, and
Accounting gained functional subtabs/filters without backend schema changes.

Verification passed: `node --check server.js`, inline `public/operations.html`
scripts parse, `npm test` passed 30/30, local Playwright screenshots confirmed
desktop sidebar, mobile hamburger drawer, and no 390px horizontal overflow,
`npm run openai:smoke` passed, Railway deployment
`542e288f-51f1-4ee6-a905-81010e65eb0a` succeeded, and live smoke passed:
`ops/live-smokes/2026-06-07T08-44-52-619Z-live-app-smoke.md`.

- source: codex
- worker: Codex

## 2026-06-07T11:56:10+03:00 - Patch task #130 acceptance misses

Audited the completed task #130 app-shell work against the original Telegram
spec and patched the missed student-portal/admin-form requirements. The student
portal no longer renders or binds the Add Goal form, goal title/urgency/category
inputs, bedtime/wake/access-minute fields, missed-state configuration, or Add
Goal submit handler. It now shows a read-only notice explaining that goals,
consequences, bedtime rules, and tablet rules are assigned by the rebbi/admin.

Operations admin Goal Board still preserves all backend fields/actions, but the
long creation form is now collapsed behind an Add Goal details control instead
of being permanently visible above the goal list.

Verification passed: inline Operations/Student scripts parse, `npm test` passed
30/30, `npm run openai:smoke` passed, Railway deployment
`54a5e5f4-078a-4ce6-b76d-2f60d022e9f1` succeeded, live smoke passed at
`ops/live-smokes/2026-06-07T08-55-35-102Z-live-app-smoke.md`, and targeted live
student-portal mobile validation confirmed no Add Goal/configuration text, the
read-only notice is present, and there is no 390px horizontal overflow.

- source: codex
- worker: Codex

## 2026-06-06T23:05:28+03:00 - Deploy automatic accountability tablet-access MVP

Implemented the first automatic student accountability access loop. Goal Board
metadata now separates the student agreement, success access rule, and missed
goal recovery/consequence. Student-created bedtime/wake-up goals can store
in-bed/out-of-bed times, the student's chosen rule, a success access duration,
and the missed-goal locked/accountability-only state.

Student portal checkoff now applies the configured approved-access session
automatically when a goal first reaches 100 percent. Partial checkoffs do not
open access, and already-completed goals do not repeatedly reopen access.
If no tablet record exists, the checkoff still saves and returns a clear
`no_device_configured` result. Q Studio/Qustodio remains the content filter;
real Android calls remain disabled until Headwind/FreeKiosk is verified.

Operations Students now has clearer Student Accountability filters for Needs
Setup, Due Today, Checked Off, Missed, Access Open, Locked, and Needs Review,
with student cards showing the agreement, deadline, device state, access
window, and recovery rule.

Verification passed: `node --check server.js`, inline Operations/Student script
compile, `npm test` 30/30, `npm run openai:smoke`, Railway doctor, and
`npm run app:smoke -- --require-drive`. Final Railway deployment:
`ed79c92e-605e-4732-9bec-bf67a71e506e`. Final live smoke:
`ops/live-smokes/2026-06-06T20-07-35-433Z-live-app-smoke.md`.

- source: codex
- worker: Codex

## 2026-06-07T06:00:44+03:00 - Deploy BNA Command Center UI cleanup

Implemented the first-pass UI redesign across the Operations app and student
portal without schema changes. Operations now has a top Daily Command Center
for decisions, Codex queue, student accountability, tablet/device issues,
content review, and payment exceptions. Task rows are easier to scan, student
accountability cards show agreement/device/checkoff signals first, Content
cards show compact next actions with details collapsed, and Accounting is back
to one roster-style payment table without reminder/audit clutter. The student
portal now starts with boy-facing My Agreement, Check Off, Tablet Access, and
Torah/Trip status cards. Shared public CSS also keeps blog cards equal-height
and normalizes spacing/motion.

Verification passed: inline Operations/Student scripts compile, `npm test`
passed 30/30, `npm run openai:smoke` passed, Railway deployment
`683dc322-538e-4ca0-bdb5-272c194d9861` succeeded, and live app smoke passed at
`ops/live-smokes/2026-06-07T03-00-07-526Z-live-app-smoke.md`.

- source: codex
- worker: Codex

## 2026-06-05T20:27:48+03:00 - Make pending briefs visible in Operations task manager

Added a protected Operations pending-briefs API that reads `tasks-pending/*.md`,
classifies each handoff as Planned, Implementing, Verified, or Deployed, and
applies work-lane badges for Goal Board, device control, Rabbi bot, UI,
Drive/content, and parsing work.

Operations Tasks now has a Pending Briefs focus with lifecycle counts, lifecycle
filters, project/date filtering, read-only brief cards, source status notes, and
copyable file paths. Markdown planning handoffs remain visible as planning or
implementation records instead of being implied done by the existence of a plan.

Verification passed: `node --check server.js`, inline `public/operations.html`
script compilation with Node `vm.Script`, `npm test` (27/27), a local
tasks-pending classifier smoke, a mocked Playwright Operations UI smoke, and
`node --check scripts/telegram-kimi-bridge.mjs`.

- source: codex
- worker: Codex

## 2026-06-06T22:06:21+03:00 - Fix Operations dashboard load and task lane readability

Fixed the live Operations dashboard failure caused by the content-bundles API
querying a non-existent `bna_content_jobs.summary` column. The API now derives
bundle source summaries from parsed JSON, caption, or notes. Added
`/api/bna/content-bundles` to the live app smoke so this class of dashboard
load failure is caught before a deploy is considered verified.

Cleaned the Task Manager UI with a visible current-view/filter strip, one-click
jumps for Decisions, My Work, Rabbi, and Codex, active-filter pills, and a clear
filters button. Added a separate Rabbi task lane so Rabbi Elie work no longer
gets hidden inside My Tasks.

Verification passed: Operations inline JS compile, `node --check server.js`,
`node --check scripts/smoke-live-app.mjs`, `npm test` 27/27,
`npm run openai:smoke`, Railway doctor, and live app smoke with Drive required.
Final Railway deployment: `f9579ea6-3623-4af6-810c-4fb2e0b1515e`. Live smoke
report: `ops/live-smokes/2026-06-06T19-08-26-630Z-live-app-smoke.md`.

- source: codex
- worker: Codex

## 2026-06-06T21:44:00+03:00 - Complete first plain-English Remotion render smoke

Sub-agent Bohr ran the first operator-directed plain-English Remotion edit using
the available fallback source `renders/remotion-source-smoke-input.mp4` because
no fresh non-generated video was present in `media-drop/` or `uploads/`.

Output MP4:
`renders/20260606-operator-plain-english-remotion-edit.mp4`.
Report:
`ops/remotion-smokes/2026-06-06-operator-plain-english-edit.md`.

Verified result: MP4 rendered successfully at `1920x1080`, `30 fps`, `2.56s`,
`361269` bytes. No app/server/package files were edited by the sub-agent.

- source: subagent
- worker: Bohr

## 2026-06-06T21:52:29+03:00 - Deploy newsletter review bundles and sub-agent closeout

Spawned parallel agents for backlog audit, Remotion render verification,
stale-family cleanup audit, newsletter workflow scoping, payment/signup
reconciliation, and Telegram/GHL publish verification.

Implemented the first richer weekly newsletter review flow in Operations
Content. The dashboard now exposes weekly newsletter review bundles with source
lists, generate/regenerate, editable draft textarea, save edits, approve/save
example, and archive. Actual parent email sending remains intentionally out of
scope until recipient preview, test-send, and typed-confirmation live-send rules
are built.

Fixed approval semantics so newsletter/WhatsApp-style outputs are marked
`approved` when approved, not `published`, unless the output actually publishes
externally such as a website blog or GHL Facebook draft.

Sub-agent reports created:
- `ops/remotion-smokes/2026-06-06-operator-plain-english-edit.md`
- `ops/system-audits/2026-06-06-stale-family-cleanup-audit.md`
- `ops/system-audits/2026-06-06-payment-signup-reconciliation-agent-e.md`
- `ops/system-audits/2026-06-06-agent-f-telegram-ghl-publish-workflow-verification.md`
- `tasks-pending/2026-06-06-newsletter-review-send-workflow.md`

Verification passed: `node --check server.js`, Operations inline script compile,
`npm test`, `npm run openai:smoke`, Railway doctor, and `npm run app:smoke --
--require-drive`. Railway deployment:
`49be9d9b-c83e-4b1b-9361-b026b0917ed0`. Latest live smoke:
`ops/live-smokes/2026-06-06T18-52-29-196Z-live-app-smoke.md`.

- source: codex
- worker: Codex + subagents

## 2026-06-06T21:38:20+03:00 - Add safe Facebook account selection for GHL drafts

Hardened server-side Facebook draft creation so Content approval no longer
silently chooses the first connected Facebook account. The app now uses the
single active Facebook account, or the configured
`GHL_DEFAULT_FACEBOOK_ACCOUNT_ID`; if multiple active Facebook accounts exist
without a default, it refuses to create the draft and returns a clear setup
hint. Added the variable to `.env.example` and exposed default-account status
in GHL diagnostics.

Verification passed: `node --check server.js`, `npm test`, `npm run
openai:smoke`, Railway doctor, and `npm run app:smoke -- --require-drive`.
Railway deployment: `38253aaf-4c05-4bb8-9e6b-5727dc856a19`. Latest live smoke:
`ops/live-smokes/2026-06-06T18-39-30-826Z-live-app-smoke.md`. That final
smoke reports GHL diagnostics green: configured, 1 Facebook account, 3 other
social accounts, and posts read OK.

- source: codex
- worker: Codex

## 2026-06-06T21:33:33+03:00 - Add live app smoke and close verified image-lane tasks

Added `npm run app:smoke` with live checks for public health, Operations login
session, protected dashboard APIs, public/admin Torah cumulative progress, task
create/comment/delete cleanup, protected signup submit dry-run validation, GHL
diagnostics, and Drive Website Images lane visibility.

Added an admin-only `dry_run` path to `/api/submit` so production signup
validation can be smoke-tested without writing signup/student/payment records
or sending Telegram/Gmail/GHL side effects. Also sanitized task sources in
`createTaskFromText` so unsupported source strings fall back to `manual`
instead of producing a database constraint 500.

Verified the existing Drive Website Images automation: `/website_images`,
`npm run website:ingest-image`, and the idle bridge watcher are wired to the
dedicated `BNA V2 / 00 Upload Here - Website Images` folder. Marked the related
TASKS entries and pending brief as implemented. Railway deployment:
`39b175a8-da2e-4bb4-9160-42c6ee6cb082`. Latest live smoke report:
`ops/live-smokes/2026-06-06T18-32-32-620Z-live-app-smoke.md`.

GHL diagnostics are reachable but currently report an account-side PIT/scope
401, so full GHL publish smoke remains blocked until HighLevel token scopes are
updated.

- source: codex
- worker: Codex

## 2026-06-05T15:51:28+03:00 - Build One Time Mishnah Class project workspace model

Implemented the One Time Mishnah Class workspace model on the existing
Railway/Postgres-backed BNA app without creating a duplicate database or a new
Mishnah concept.

The backend now standardizes `BNA` and `One Time Mishnah Class` in
`bna_projects`, seeds project members, adds task comments, project assignment,
Decision Required, and author fields, and backfills existing Mishnah/Mishna/Rabbi
Elie/shiur/source-sheet tasks into the One Time project. Existing aliases such
as `mishna`, `mishnah`, `one time`, and `mishna learning` normalize to
`one_time_mishnah_class`.

Closed older direct task insert paths so mixed-recording parsed tasks, dashboard
recording task actions, and the legacy Telegram webhook fallback use the shared
project-aware `createTaskFromText` path. Added the repeatable non-destructive
`railway-migration-2026-06-05-one-time-projects.sql` for Railway/Postgres.

Operations Tasks now exposes project filter chips, project badges, project
selector, One Time categories, Shloimie/Codex/Rabbi Elie assignment options,
Decision Required controls, and task comments. Scoped One Time login loading now
avoids Students/Content/Contacts/Accounting APIs and stays within the task
workspace.

Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, Node VM compile of inline
`public/operations.html` scripts, `npm test` (20/20), local Playwright smoke on
a temporary updated server, and API create/comment/delete smoke proving
`project: "mishna"` routes to `One Time Mishnah Class`.

- source: codex
- worker: Codex

## 2026-06-05T08:55:00.000Z - Refresh blog visuals with downloaded media

Created dedicated blog-section images from the operator's newest downloaded
photos/videos in `C:\Users\User\Downloads`. Video files were converted into
representative JPG thumbnails with ffmpeg, using a 1200x800 canvas and blurred
background fill so portrait/vertical footage keeps the full subject without
harsh side bars.

Added nine optimized assets under `public/images/blog/` and updated
`public/js/bna-content.js` so English and Hebrew blog posts use the new blog
assets instead of recycling homepage/founder/learning-moment images.

Verification passed: `node --check public/js/bna-content.js`, `node --check
public/js/bna-pages.js`, reference check confirmed all blog images exist, and a
local Playwright smoke confirmed homepage blog cards plus `/blog` cards load
the new `/images/blog/` images at 1200x800. Screenshots saved at
`screenshots/local-home-blog-new-assets-20260605.png` and
`screenshots/local-blog-new-assets-20260605.png`. The only browser console issue
seen during the homepage smoke was an unrelated local Torah goal fetch failure.

- source: codex
- worker: Codex

## 2026-06-05T08:49:00.000Z - Expand OpenAI sidekick system visibility and sync contract

Expanded the Telegram OpenAI/Kimi API prompt context so the fast OpenAI sidekick
can navigate the BNA system with much more live context while still routing
implementation work to Codex.

The prompt now includes a capability contract, the shared agent task ledger tail,
the shared agent changelog tail, and `ops/openai-sidekick-capabilities.md`.
For system/navigation/status questions, the bridge also attaches a sanitized
live BNA app snapshot from protected app APIs: active tasks, Codex/Shloimie
owners, decision tasks, recent done tasks, students/accountability summaries,
Torah learning progress, content jobs/outputs, and accounting/payment records
when relevant. Drive-related questions still attach the Google Drive pipeline
snapshot added earlier.

Added `/capabilities` and `/openai_capabilities` Telegram commands so the
operator can see what OpenAI can read/write, what must route to Codex, and where
work is synchronized.

Safety boundary: OpenAI can create/summarize safe app records through the bridge
and queue Codex work, but it must not claim direct code/file/deploy/migration
work. Those remain Codex-tracked jobs with ledger/changelog synchronization.

Restarted the local Telegram bridge on PID `180780`; startup logs show
`TelegramDefault=openai`, `OpenAIKey=yes`, and `KimiKey=yes`.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`, `npm test`
with 16 passing tests, and a live API smoke for tasks, students, Torah learning,
content jobs, signups, payment intake, and payments. The deployed
`/api/bna/projects` endpoint currently returns 404, so project lookup is treated
as optional until the app is deployed with that route.

- source: codex
- worker: Codex

## 2026-06-05T08:41:00.000Z - Auto-start Codex task batches from Telegram

Updated the Telegram bridge so Codex-owned tasks captured from Telegram do not
sit passively in the task list. When a Telegram message creates runnable
Codex-assigned tasks, the bridge now marks them `in_progress`, queues a Codex
work job, and tells the operator that Codex work started. Messages such as
"work through the tasks", "keep going", "finish everything", and "not waiting"
can also pull active Codex tasks from the app queue and start a work batch.

Added safeguards so design-only messages like "do not build yet" or "just
brainstorm" do not trigger automatic implementation work. After a tracked Codex
job finishes, the bridge reloads the tracked task IDs and sends Telegram
completion reminders for any tasks that were marked `done`.

Restarted the local Telegram bridge on PID `16556`; startup logs show
`TelegramDefault=openai`, `OpenAIKey=yes`, and `KimiKey=yes`.

Live task cleanup: marked task #85 done with a clean title, marked task #82
done/verified for the Telegram routing automation, and moved task #67 to
`in_progress` as the umbrella "work through queued Codex tasks" item.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs` and
`npm test` with 16 passing tests.

- source: codex
- worker: Codex

## 2026-06-05T08:34:00.000Z - Add Drive-aware OpenAI replies and Drive audit report

Fixed the Telegram OpenAI/Kimi API prompt path so Drive-related messages attach
a current Google Drive snapshot before the model replies. The snapshot includes
the signed-in account, visible Shared Drives, BNA pipeline root, pipeline stage
folders, recent files by stage, and newest accessible Drive files, so OpenAI can
answer "where did the processed upload go?" instead of asking which folder to
check.

Added `npm run drive:audit` through `scripts/google-drive-audit.mjs`. The fresh
audit was saved to `ops/drive-audits/2026-06-05T08-31-57-930Z-google-drive-audit.md`
and `.json`. It confirmed the active OAuth credential is
`office@bneineviimacademy.org`, zero Workspace Shared Drives are visible through
that token, and the live BNA automation pipeline is `BNA V2` in that account's
My Drive. The last processed video is `20260604_191840.mp4` in `BNA V2 / 04 Parsed`.

Restarted the local Telegram bridge on PID `203012`; startup logs show
`TelegramDefault=openai`, `OpenAIKey=yes`, and `KimiKey=yes`.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`, `node
--check scripts/google-drive-audit.mjs`, `npm run drive:audit`, and `npm test`
with 16 passing tests.

- source: codex
- worker: Codex

## 2026-06-05T08:25:00.000Z - Add OpenAI API key to Railway production

Pushed `OPENAI_API_KEY` to the Railway `skillful-motivation` production service
using the Railway CLI with stdin so the secret was not placed in the command
line or logs. Verified Railway variable names include `OPENAI_API_KEY`,
`KIMI_API_KEY`, `KIMI_BASE_URL`, and `KIMI_MODEL`.

Restarted the latest Railway deployment without rebuilding so the service can
load the new environment variable. Railway restart returned deployment
`a965d40a-37c0-4a38-a610-ef08c53fbdd3`.

Verification passed: `npm run railway:doctor`, Railway service status
`SUCCESS`, live `/api/health` returned `status: ok` and `database: connected`,
and the public homepage returned HTTP 200.

- source: codex
- worker: Codex

## 2026-06-05T08:16:00.000Z - Configure OpenAI API key and labeled Kimi fallback for Telegram

Stored the operator-provided OpenAI API key in ignored local secret storage at
`.secrets/openai-api-key.txt` and restarted the Telegram bridge so it loads the
key through `scripts/start-telegram-kimi-bridge.ps1`.

Updated the Telegram bridge so normal chat uses OpenAI first, falls back to
Kimi second, and only uses Codex for explicit build/programming mode. Kimi API
or Kimi CLI fallback replies are now clearly labeled with a short "this is Kimi
fallback" note. Expanded the API prompt context to include `MEMORY.md` and
`PROJECT-NOTES.md` in addition to AGENTS, TASKS, system state, newest handoffs,
brand kit, and today's memory.

Verification passed: OpenAI smoke call returned `ok` on
`gpt-4.1-mini-2025-04-14`, `node --check scripts/telegram-kimi-bridge.mjs`,
`node --check server.js`, start-script parse check, bridge restarted on PID
`14616`, startup log showed `OpenAIKey=yes KimiKey=yes`, and the bridge error
log was empty.

- task_id: 71
- source: telegram
- worker: Codex

## 2026-06-05T14:27:00+03:00 - Fix Telegram OpenAI transcript topic answers

Audited the latest Telegram flow after the operator reported that OpenAI still
was not producing usable transcript/content answers directly in chat. Message
`#300` asked the bot to list the actual topics learned this week from all
transcripts. The generic OpenAI path replied with A/B/C format options, and the
button callback only recorded the selected option instead of generating the
answer.

Added a dedicated weekly transcript topic-inventory route to the Telegram bridge.
Requests asking for topics, what was learned, or what was covered across weekly
transcripts now select recent transcribed Content jobs, generate the answer with
OpenAI, send it directly in Telegram, and log it as OpenAI content work without
creating a Codex task. Decision buttons now store source text/reply text and can
continue transcript-topic work instead of only replying `Decision captured`.

Recovered the missed request by generating and sending a detailed topic
inventory from 8 active transcript jobs: `#21`, `#9`, `#8`, `#7`, `#6`, `#5`,
`#4`, and `#2`. The latest generated text is saved locally at
`.runtime/weekly-transcript-topic-inventory-latest.txt`. Restarted the bridge on
PID `166788`.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
`npm test`, live Content Jobs API readback, OpenAI generation, Telegram send,
and bridge restart/startup log.

- source: telegram
- worker: Codex

## 2026-06-05T08:09:00.000Z - Restart Telegram bridge into OpenAI-default mode and clean prompt fragments

Stopped the stale Telegram bridge and old Codex queue that were still running
pre-change code. The old bridge had split the operator's long prompt into many
Telegram messages and queued them as sequential Codex CLI jobs; job #1 took
about 12 minutes, so the remaining queue looked frozen.

Restarted the bridge on PID `143192`. Startup now logs
`TelegramDefault=openai BuildAgent=codex`, with no active stale Codex process
and an empty bridge error log. Added a no-silent-fallback guard so OpenAI mode
does not secretly start Codex for normal chat when API keys are missing.

Confirmed `OPENAI_API_KEY` is not configured locally yet, and updated
`scripts/start-telegram-kimi-bridge.ps1` so future `.secrets/openai-api-key.txt`
and `.secrets/kimi-api-key.txt` files are loaded into the bridge process.

Cleaned the live task board for prompt fragments #71-#84: #71 and #76 are done,
#72, #78, #81, and #82 remain as readable roadmap tasks, #83 is recorded as a
data-store constraint, and fragments #73-#75, #77, #79, #80, and #84 are
archived/merged.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
`node --check server.js`, PowerShell start-script parse check, `npm test`
16/16, bridge startup log, and Telegram report message #260 delivered with the
OpenAI API / Codex keyboard.

- task_id: 71
- task_id: 76
- source: telegram
- worker: Codex

## 2026-06-04T19:41:00.000Z - Restore Telegram bridge responsiveness and clean stuck task records

Fixed the local Telegram bridge after it failed to restart from a corrupted
stale lock file. The bridge now strips BOM/mojibake markers from the lock file
and moves unreadable lock files aside instead of crashing during startup.

Added runtime logging for incoming Telegram updates, text capture summaries,
Codex background queue creation, Codex job start, and Codex job completion so
future lag can be diagnosed from `.runtime/telegram-kimi-bridge.out.log`.

Cleaned the live task board: task #65 is now correctly titled around mapping
the student Goal Board, Google Classroom assignments, and natural consequences;
task #66 is marked done because Codex replied with design options; older
Content-routing duplicate tasks #45, #53, and #54 are closed as completed by
the parser-routing cleanup work.

Also cleaned recording-parser fragments: archived non-actionable fragments #47,
#48, #50, #51, and #60; closed duplicate Remotion setup tasks #46 and #59;
merged student login/incentive planning #61 into #65; and renamed the remaining
real tasks #43 and #49.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`, bridge
restarted on PID `161216`, startup log confirmed `Primary=codex`, and a direct
Telegram status response was sent successfully as message #227.

- task_id: 65
- task_id: 66
- source: telegram
- worker: Codex

## 2026-06-05T07:49:26Z - Telegram OpenAI/Codex mode selector and One Time scaffold

Implemented the local Telegram bridge changes for persistent `OpenAI API` and
`Codex` bottom buttons. Normal conversation, tone/content refinement, and
brainstorming now default to OpenAI API; clear repo/code/database/bridge/deploy
work routes to Codex automatically. Per-chat mode is stored in
`.runtime/telegram-chat-modes.json`.

Standardized the visible Operations Content Mishnah lane label to `One Time`
while preserving the internal `mishna` key. Added the Rabbi Elie Scheller scoped
agent scaffold in `agents/rabbi-elie-scheller/` and created the handoff brief
for real project/comment/access work.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
`node --check server.js`, and `node --test`. Live task #71 and #72 titles were
cleaned in the task API. Live bridge restart/deploy is still needed after the
current Telegram queue drains.

- task_id: 71
- task_id: 72
- source: telegram
- worker: Codex

## 2026-06-05T04:21:17.000Z - Make Telegram replies natural by default

Recorded the operator preference that Telegram should feel like normal
conversation with Codex, not like job queue output. Updated the async Telegram
bridge so ordinary conversational messages no longer receive a `queued Codex in
the background` placeholder. Real captures still receive concise capture
summaries, and final async replies are sent directly without a `Codex result
for message` wrapper.

Restarted the local Telegram bridge on PID `183664`; startup log reports
`TelegramDefault=openai`, `OpenAIKey=yes`, and `KimiKey=yes`.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
`npm test`, JSONL ledger validation, bridge restart, and startup log check.
A delayed local bridge restart was scheduled so this in-flight reply can send
before the running process reloads the new behavior.

- source: telegram
- worker: Codex

## 2026-06-04T19:58:30.000Z - Clean Annie parser fragment and student-system roadmap

Explained that task #37 came from content job #19 fallback parser text,
`Annie wants to build an app`, not from a confirmed BNA build request. Archived
task #37 so it no longer sits in active Tasks unless the operator later confirms
that project.

Updated task #65 to reflect the chosen planning path: student Goal Board first,
while still including Google Classroom YouTube assignments and
natural-consequence/filter rules in the same roadmap. No build was started.

- source: telegram
- worker: Codex

## 2026-06-04T17:11:20.843+03:00 - WhatsApp update corrected around sleep message

Revised content job #21 WhatsApp output #39 so the main video summary leads
with going to sleep on time, breakfast, food environment, and helping the boys
connect their actions to Torah/Hashem values. The weekly class material now
sits in a separate "Other things we did and discussed this week" section.

Updated live WhatsApp Prompt Studio prompt to v2 and added the same structure
rule to repo-side content memory and the Telegram bridge auto-draft helper.

Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, live API confirmed output #39 contains the
sleep lead and other-topics section, and task #63 is done/verified.

- task_id: 63
- source: telegram
- worker: Codex

## 2026-06-04T18:23:07.3352485+03:00 - Add Telegram completion reporting rule

Recorded the operator preference that Telegram-requested tests, fixes, deploys,
and verifications must be followed by a concise Telegram reply saying the work
was accomplished and listing the verification result. Updated `AGENTS.md`,
`MEMORY.md`, and `SYSTEM-STATE.md`.

## 2026-06-03T18:05:18.1144320+03:00 - Accounting payment section simplified

Reworked the Operations Accounting view into a single clean payment roster.
The visible payment section now shows each parent with the student underneath,
contact information, amount, method, status, paid date, and next due date.

Removed the normal Accounting display of:
- `Recent Payments`
- `Pending Payments`
- `Green Invoice Webhook Audit`

Pre-signup paid records are folded into the roster as `Paid, needs signup`
instead of living in a separate noisy block. Payment reminder controls remain,
but the empty state is compact.

Railway deployment `0b7adc21-6b1b-423b-aa73-190ed27964ee` succeeded. Live
mobile smoke confirmed 5 roster rows, no Recent/Pending/Webhook Audit sections,
Braka unpaid, Weber and Galambo paid but needing signup, Kosofsky and Dratler
paid, and zero first-party page errors. Screenshot saved at
`screenshots/live-operations-accounting-roster-mobile-20260603.png`.

- source: codex
- worker: Codex

## 2026-06-03T19:08:11.227Z - Our Philosophy subtitle copy deployed

The homepage Our Philosophy subtitle was changed from generic section copy to:
`Ideas that shape how we teach, mentor, and help boys grow.`

Railway deployment `b927f12e-c41a-41a7-8af6-eea0998f99a4` succeeded. Live 390px
Playwright smoke confirmed the new subtitle is visible, the old subtitle is
absent, and page errors were 0. Live task #41 was renamed, assigned to Codex,
marked done, and verified.

- source: codex
- worker: Codex

## 2026-06-03T18:39:54.000Z - Compact public mobile hamburger menu deployed

The public homepage and standalone Blog/FAQ navigation now use a compact mobile
hamburger popover instead of a full-width menu that exposes the entire Blog
category list. Desktop still keeps the Blog category dropdown.

Mobile menu taps now close the popover after anchor/link selection, and Task #40
was marked done and verified in the live task API.

Verification passed: `node --check server.js`, `node --check
public/js/bna-pages.js`, `npm test` 16/16, local 390px Playwright smoke, live
health check, and live 390px Playwright smoke on Railway deployment
`8e29801d-e33b-4e74-be47-a1e7e866c9d3`. Live smoke confirmed homepage and Blog
menus at 288px by 264px, no mobile category wall, no body overflow, and zero
browser errors.

- source: codex
- worker: Codex

## 2026-06-03T21:24:58.1089087+03:00 - Telegram task refinement and Codex ownership cleanup

Telegram task capture now treats Codex as the active machine-work owner.
Kimi is fallback only for provider/API failures or legacy callback aliases.

Task confirmations and Operations task cards should use polished, actionable
titles. Raw Telegram wording stays in daily memory or `ai_parsed.original_text`
for provenance, not as visible task titles.

Telegram quick action buttons now read `Mine`, `Codex`, `Urgent`, and `Done`.
Old `task:kimi` callbacks still work, but they assign the task to Codex.

- task_id: 39
- source: codex
- worker: Codex

## 2026-06-03T19:34:54.0000000+03:00 - Switch Telegram bridge to Codex primary

Plain Telegram text messages now route to Codex CLI first using `codex exec`
with the BNA repo as the working directory. The Codex prompt frames Telegram as
the operator's direct development channel, allowing repo inspection, edits,
tests, and concise implementation summaries when development work is requested.

Fallback behavior now tries Kimi API first and OpenAI API second if the primary
Codex CLI call fails. The bridge passes the Codex prompt through stdin to avoid
Windows command-line length limits. `/status` and bridge startup logs now report
Codex as the primary agent. The live bridge was restarted and is running on PID
`123424`.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`, `npm
test` 16/16, and direct Codex CLI smokes returned `codex primary ok` and
`codex stdin ok`.

- source: codex
- worker: Codex

## 2026-06-03T19:29:15.0000000+03:00 - Add Telegram-driven Remotion source-video editing

Added `NaturalVideoEdit`, a data-driven Remotion composition for real source
videos. It supports timeline segments, speed changes, fades, zoom/focus,
brightness/contrast, text overlays, subtitles, image overlays, and audio overlay
slots.

Added `scripts/video-edit-source.mjs` plus package scripts
`video:edit:source` and `video:edit:source:dry`. The script copies source media
into `public/video-edit-assets/`, probes duration/dimensions with FFmpeg, asks
Kimi first and OpenAI second for a safe timeline plan, writes props/summary JSON
under `src/remotion/generated/`, and renders `NaturalVideoEdit` to `renders/`.

Telegram bridge now supports `/edit_video ...` for the newest Google Drive Raw
Intake video, `/edit_drop ...` for local `media-drop/inbox`, and direct small
Telegram video uploads with edit-style captions. Rendered MP4s are sent back to
Telegram when small enough; otherwise the local render path is reported. The
bridge was restarted on PID `25032`.

Verification passed: `node --check scripts/video-edit-source.mjs`, `node
--check scripts/telegram-kimi-bridge.mjs`, `npm test` 16/16, `npx tsc
--noEmit`, `npm run video:compositions`, and a source-video smoke test where
Kimi produced 3 timeline segments with the middle second sped up 2x, brightness
boosted, and a timed subtitle. A rendered smoke MP4 was created under `renders/`.

- source: codex
- worker: Codex

## 2026-06-03T19:12:12.0000000+03:00 - Harden Operations Content parser routing and compact cards

Operations Content collapsed cards now show only short English topic chips, not
long transcript-style bullets. Expanded cards keep Source Overview, task/student
parser controls, and fuller Topics/Questions/Sources/Highlights/Next Steps
sections, and card open/collapse scrolls back to the selected card.

The mixed-recording parser prompt and fallback now separate Shloimie's personal
tasks, Kimi/Codex coding/system tasks, named student accountability, group-goal
entries, and class notes. Telegram, local drop-folder, and Drive ingestion now
auto-parse recordings only when task/accountability/Torah keywords are present,
with "do not parse" guardrails. Repeated parse calls skip safely unless a future
force action is used.

Railway deployment `f167fd34-7dd4-4671-bcfc-64fc6dddc006` succeeded. Local
checks passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, `npm test` 16/16, and `npx tsc --noEmit`.
Live smoke confirmed content job #19 has 3 compact chips (`Goals and routines`,
`Torah learning goals`, `Fitness routine`), parser controls, zero page errors,
stored mixed-parse counts of 4 tasks / 4 accountability events / 4 group-goal
entries, and duplicate parse calls return `skipped: true`.

- source: codex
- worker: Codex

## 2026-06-03T17:55:41.4152174+03:00 - Public Blog, FAQ, SEO/AEO pages launched

Implemented the public website content brief from
`C:\Users\User\Downloads\bnei_neviim_full_website_blog_faq_codex_prompt.md`.
Added static Blog, Article, FAQ, and Hebrew route templates backed by shared
front-end content data:
`/blog`, `/blog/:slug`, `/faq`, `/he`, `/he/blog`, `/he/blog/:slug`, and
`/he/faq`.

The homepage now has Blog/FAQ navigation, a mobile hamburger menu, homepage
EducationalOrganization/LocalBusiness JSON-LD, and a short `Explore the
Philosophy` card section linking to deeper blog articles. Blog/FAQ pages include
SEO metadata, keyword coverage, internal links, article/FAQ/breadcrumb schema,
and cautious disclaimer language avoiding accreditation, clinical, special-ed,
or ADHD-treatment claims.

Verification passed:
- `node --check` for `server.js`, `public/js/bna-content.js`, and
  `public/js/bna-pages.js`.
- `npm test` passed 16/16 tests.
- Local and live Playwright smoke confirmed rendered Blog cards, article body,
  FAQ accordions, Hebrew RTL routes, homepage philosophy cards, and JSON-LD.

Railway deployment `da9dfcc5-94e8-473e-abf4-5cc85f2da6b4` succeeded. Live
screenshots saved at `screenshots/live-blog-mobile-20260603.png`,
`screenshots/live-blog-article-mobile-loaded-20260603.png`, and
`screenshots/live-faq-mobile-20260603.png`.

- source: codex
- worker: Codex

## 2026-06-03T17:28:50.9866926+03:00 - Footer social icons added

Added public homepage footer social icons for YouTube, LinkedIn, and Facebook
using inline SVG icons and the operator-provided profile URLs:
`https://www.youtube.com/channel/UCKnmIcZqhzNCdAbE6RK-U-g`,
`https://www.linkedin.com/company/108630189/`, and
`https://www.facebook.com/profile.php?id=61590512065756`.

Railway deployment `3e7a9939-2dad-4eca-b6bb-dd69f7445391` succeeded. Live
mobile footer smoke confirmed all three links are present and no browser errors
were reported. Screenshot saved at
`screenshots/live-footer-social-icons-mobile-20260603.png`.

- source: codex
- worker: Codex

## 2026-06-03T17:20:47.4570502+03:00 - Accounting payment records cleaned

Cleaned the live Accounting/payment state from the operator's June 3 correction.
Active pending payments now show only `Naomi Braka / Hillel Baraka` as unpaid,
due May 25, 2026.

Updated paid records:
- `Shloimie Dratler / Menachem Mendel Dratler` marked paid cash on May 25, 2026.
- `Racheli Kosofsky / Amitai Kosofsky` marked paid cash on May 25, 2026.
- Archived stale `solomon dratler / Fh` signup marked paid so it cannot appear
  as pending or in reminder candidates.

Updated paid intake records needing signup/matching:
- `Shalom Galambo`, email `sholom2712@gmail.com`, student `Eitan Chaim`,
  mother `Ayala Galambo`, paid cash on May 25, 2026.
- `Nikki Weber / Huda Weber` paid by Green Invoice on May 25, 2026; no matching
  Green Invoice webhook/signup was present, so it remains a matching intake.

Operations Accounting now excludes archived signups from pending payment cards
and payment reminder candidates, and Recent Payments displays `received_at`
instead of log creation date. Railway deployment
`234ab9f5-39e9-4d4c-93b2-add3cc9a05db` succeeded. Live mobile smoke confirmed
one pending payment, the two paid intake items, May 25 recent payment dates, and
zero browser errors. Screenshot saved at
`screenshots/live-operations-accounting-payments-clean-mobile-20260603.png`.

- source: codex
- worker: Codex

## 2026-06-03T17:10:22.4486386+03:00 - Content cards changed to English bullet overviews

Operations Content now shows English-first source cards instead of raw
transcript-style previews. Compact cards show the content title, upload time,
status chips, and bullet points for what was discussed. Opening a card reveals
sectioned source material: source overview, topics discussed, questions /
discussions, sources, highlights, and next steps / follow-up.

The UI no longer falls back to transcript snippets in the visible card summary.
Old mostly-Hebrew draft bodies are hidden from copy/approval until regenerated,
and the live Hebrew title for content job `#9` was renamed to
`Free Choice and Lashon Hara in Torah`. Future generated content titles and
mixed-recording parse fields now explicitly request English output.

Railway deployment `a4d5a581-a2e0-4ecd-9292-b52ba26e8529` succeeded. Live
mobile Operations Content smoke confirmed uploaded time, topic bullets,
expanded sections, no raw transcript snippet, no old Hebrew title, and zero
browser errors. Screenshots saved at
`screenshots/live-operations-content-english-bullets-final-mobile-20260603.png`
and
`screenshots/live-operations-content-expanded-sections-final-mobile-20260603.png`.

- source: codex
- worker: Codex

## 2026-06-03T16:53:16.8161309+03:00 - Torah progress cards visually aligned

Polished the public homepage Torah progress cards so the five student tiles are
equal width/height, centered, and visually consistent. The card layout now uses
a fixed five-column desktop grid, centered student names, centered percentages,
aligned progress bars, and responsive two-column / one-column fallbacks.

Railway deployment `b0b67ee0-ba45-45e9-beb3-bc32fe2bfc96` succeeded. Live
Playwright smoke confirmed no browser errors, `Group Torah Goal: 15%`, trip
locked text, a centered `1152px` grid, and five cards all measuring `218 x 186`.
Screenshot saved at `screenshots/live-home-torah-cards-equal-20260603.png`.

- source: codex
- worker: Codex

## 2026-06-03T16:46:27.2757171+03:00 - Student checkoff portal deployed

Finished the private student login/checkoff workflow for the current BNA boys.
Operations Students can now create, refresh, regenerate, copy, and open a
private student portal link for each active student. The new student-facing
`/student.html` page loads only by access code and exposes only that student's
own non-private `student_goal` checkoff cards plus cumulative Torah trip
progress.

Added scoped API routes:
`GET /api/student-portal?code=...` and
`POST /api/student-portal/goals/:id/checkoff`. The checkoff route updates only
matching `student_goal` records for the linked student and does not expose
private Torah goal minutes, goal type, raw counted minutes, or admin notes.

Live data was updated so `Huda Weber`, `Hillel Baraka`,
`Menachem Mendel Dratler`, `Eitan Chaim Golombo`, and `Amitai Kosofsky` all
have enabled private access codes and canonical names in `bna_students`.
Live smoke confirmed all five portals return HTTP 200 with `15 percent` Torah
trip progress. Huda's portal returned 3 goal cards and a no-op checkoff POST
succeeded. Mobile Playwright smoke on Huda's live portal had zero browser
errors and saved `screenshots/live-student-portal-mobile-20260603.png`. App
task `#35` was marked done.

Railway deployment `b17d1f6f-ad27-4499-b4ef-9538e86fd24e` succeeded.

- source: codex
- worker: Codex

## 2026-06-03T05:40:00.000Z - Clean task language and shared agent ledger

Raw Telegram wording was removed from visible task records #30 and #31.
Task #31 was archived as a duplicate of completed Changelog task #33.
Task #30 now appears as a clean completed Changelog item for the homepage
Learning Moments carousel image update.

- source: codex
- worker: Codex

## 2026-06-03T16:27:59.1930568+03:00 - Content job 19 student goals cleaned up

Manually reviewed the transcript from content job `#19` after the mixed parser
fell back to generic review notes. Removed the fallback accountability review
events and filed concrete student goals from the recording:

- Menachem Mendel Dratler: 20 minutes Torah inside, plus workout/no-candy goal.
- Amitai Kosofsky: 60 minutes Torah inside, plus football practice/learning.
- Hillel Baraka: 30 minutes Torah inside, 1 hour/day job search, Mishnayos
  before bar mitzvah, and push-ups around 4pm.
- Huda Weber: 20 minutes Torah inside, app-building interest, and exercise /
  strength / focus goal.
- Eitan Chaim Golombo: left as a follow-up because the transcript did not
  clearly state his personal goal.

Private Torah goals and June 3 daily entries were updated for the clear
transcript commitments while public cumulative trip progress stayed at `15
percent`. The duplicate `Eitan Chaim Golambo` row was marked inactive and the
canonical active student name is `Eitan Chaim Golombo`.

Operations Students now has quick checkoff buttons on `student_goal` records
(`Not Yet`, `Half`, `Done`) using the existing accountability PATCH API. Task
`#34` and task `#36` were marked done; task `#35` remains open for the larger
student-facing login/checkoff flow. Railway deployment
`1898cedb-3b03-4922-89d7-ee0faf30f3fc` succeeded, and live smoke confirmed
the public Torah summary still returns five students at `15 percent`.

- source: codex
- worker: Codex

## 2026-06-03T16:07:01.6954819+03:00 - Torah trip-progress calculation corrected

Corrected the Torah trip-progress model so June 3 daily 100 percent completion
adds one cumulative unit instead of marking the whole trip complete. Public
Torah cards and the group bar now read from cumulative trip progress with
`3.5` carried-over units plus `1` completed day out of `30`, so all five seeded
students show `15 percent`, the group shows `15 percent`, and the trip stays
locked.

Daily completion, completed units, carried-over units, total units, and total
trip percentage are now stored separately in Torah entries. Canonical seeded
student selection also hides the legacy duplicate `Golambo` record so the live
public summary returns exactly five students in the intended order.

Railway deployment `c55e29f7-3a61-401a-916a-49c467281de1` succeeded, and live
smoke confirmed `https://bneineviimacademy.org/api/torah-learning/public-summary`
returns five students at `15 percent` with `tripUnlocked: false`.

- source: codex
- worker: Codex

## 2026-06-03T12:45:00.000Z - Mixed recording parser, Torah goal cleanup, and webhook audit hardening

Mixed content job #19 was parsed into live Operations records. Kimi timed out on
the long mixed transcript, so the server used the deterministic fallback parser
and marked the parse for review. Created/cleaned records:

- Tasks #34-#37 were created from the recording and then retitled into clean
  task-manager language.
- Student Accountability events #13-#16 were created from student mentions in
  the recording.
- The bad `Eitan Chaim Golombo` Torah seed was corrected to `Eitan Chaim
  Golambo`; only the corrected Eitan record remains active.
- Kosofsky's spoken 50 percent shorthand was stored in group-goal entry #5 and
  the Torah daily entry now shows Kosofsky at 50 percent, making the group 90
  percent and trip locked until every boy reaches 100 percent.
- `BNA V2 / 00 Website Moments Intake` now exists in Drive as folder
  `1aiCzZ-lKEKSWTYfOMvXoO4YE56cVaK23`.

Green Invoice was audited and cleaned so only one live
`POST /api/webhooks/green-invoice` route remains. The live route uses the
central normalized webhook processor, webhook log, duplicate protection,
payment-intake creation, signup matching, and reprocess support.

Railway deploy packaging was fixed: `scripts/railway-redeploy.ps1` now includes
`src/` in the bundle so server imports from `src/lib/bna/*` do not fail in
production. Railway deployment `a1fb8393-0b3e-47e8-aff4-ac60c1e9b8ab`
succeeded after the packaging fix.

- source: codex
- worker: Codex

## 2026-06-03T15:49:41.000Z - Natural-language Remotion editing command added

Added `scripts/video-edit.mjs` and package scripts `video:edit` and
`video:edit:dry` so the operator can edit Remotion videos through plain English
requests.

The command loads local AI configuration, uses Kimi first with OpenAI fallback,
and falls back to a deterministic parser if no AI provider works. It converts
natural language into safe Remotion props, writes the props to
`src/remotion/generated/`, and can render directly into `renders/`.

Expanded `BnaIntroVideo` props to support natural-language-controlled tone,
duration, footer text, and logo visibility. Added dynamic duration metadata for
the portrait and wide compositions.

Verified with a Kimi dry run and a rendered natural-language smoke video:
`renders/nl-video-edit-smoke.mp4`. TypeScript passed, Remotion compositions
loaded, and `npm test` passed 16/16.

- source: codex
- worker: Codex

## 2026-06-03T15:39:50.000Z - Remotion video studio setup installed

Remotion was integrated into the repo as local video tooling. Installed
Remotion `4.0.471`, `@remotion/cli`, `@remotion/renderer`,
`@remotion/media-utils`, React, TypeScript support, and exact `zod@4.3.6` as
dev dependencies.

Added `remotion.config.ts`, `tsconfig.json`, `src/remotion/index.ts`,
`src/remotion/Root.tsx`, `src/remotion/BnaIntroVideo.tsx`, and
`src/remotion/README.md`. Added package scripts for Studio, composition listing,
portrait render, wide render, and opening the renders folder.

Created starter BNA branded compositions:
`BnaIntroPortrait` at 1080x1920, 30fps, 7 seconds, and `BnaIntroWide` at
1920x1080, 30fps, 7 seconds.

Rendered and verified:
`renders/bna-intro-portrait.mp4`, `renders/bna-intro-wide.mp4`, and
`renders/bna-intro-poster.png`. TypeScript check passed, Remotion compositions
loaded, and `npm test` passed 16/16.

- source: codex
- worker: Codex

## 2026-06-03T15:28:19.000Z - Homepage one-page Blog FAQ and sitemap deployed

The public homepage now includes full Blog and FAQ sections fed from the shared
`public/js/bna-content.js` content data. Top navigation Blog and FAQ links point
to `#blog` and `#faq`, while standalone `/blog`, `/blog/:slug`, `/faq`, and
Hebrew routes remain available for SEO and direct links.

Homepage Blog topic chips and FAQ topic chips filter the visible content without
leaving the page. The homepage now injects Blog `ItemList` JSON-LD and FAQPage
JSON-LD alongside the existing organization schema.

Added `public/robots.txt` and `public/sitemap.xml` covering homepage, Hebrew
homepage, Blog/FAQ hubs, and English/Hebrew article URLs.

Railway deployment `631758d2-d759-46e0-886b-d85322502b95` succeeded. Live smoke
confirmed `/robots.txt`, valid `/sitemap.xml`, homepage Blog nav `#blog`, FAQ
nav `#faq`, 18 blog cards, 16 FAQ cards, and 3 JSON-LD blocks.

- source: codex
- worker: Codex

## 2026-06-03T07:10:00.000Z - Homepage progress and image-only moments deployed

The public homepage 30-page learning goal now shows 3.5/30 pages and 12 percent
progress. A reusable progress updater was added: `npm run learning:progress --
<pages>`.

Learning Moments is now image-only on the public page. The carousel still keeps
title, description, and timestamp metadata internally for tracking/accessibility,
but visible text panels were removed.

Railway deployment `cecac732-66b3-4273-956d-8d977a936825` succeeded. Live smoke
passed for health, 3.5/30 progress, image-only carousel, and zero mobile browser
errors.

- source: codex
- worker: Codex

## 2026-06-03T06:25:00.000Z - Decisions and selected-content library deployed

Operations Tasks now uses Decisions instead of Active Work, keeping undecided
choices separate from Shloimie's actual personal tasks.

Operations Content now shows collapsed library cards. A card can be opened for
single-source platform drafts, or multiple cards can be selected to generate
WhatsApp, Facebook, Newsletter, LinkedIn, or YouTube drafts from the same saved
platform prompts with one-time custom instructions.

Railway deployment `7bb99db0-1351-4e0b-ba21-baade568e1ea` succeeded. Live smoke
passed for health, mobile Tasks, mobile Content, and Kimi bulk generation from
two temporary content jobs using prompt v1.

- source: codex
- worker: Codex

## 2026-06-03T08:40:00.000Z - Torah group-goal system and Green Invoice audit deployed

The public homepage no longer uses the old 30-page tracker. It now shows a
Torah group-goal progress bar, trip locked/unlocked state, and a per-student
card list that exposes only each boy's name plus percentage toward his own
private goal.

Five active students were seeded for June 3, 2026:
`Huda Weber`, `Hillel Baraka`, `Menachem Mendel Dratler`,
`Eitan Chaim Golombo`, and `Amitai Kosofsky`. All five were seeded at 100
percent for June 3, 2026 so the live group percentage is 100 and the trip is
unlocked while real tracking starts on June 4, 2026.

Operations Students now includes admin-only Torah entry controls for date, goal
minutes, goal type, engaged listening minutes, inside engaged minutes,
listening-without-following minutes, and notes. Reusable scoring logic and
tests were added for student and group percentage calculations.

Green Invoice now logs every webhook receipt with event type, customer/payment
IDs, processing status, payload, and reprocess support. The parser now handles
the official nested `payer` + `transactions` payload shape instead of only the
old flat fields. Live public smoke confirmed
`/api/torah-learning/public-summary` returns the seeded 100 percent state, and
Railway deployment `410aac19-f28c-499b-9880-076d61465e80` succeeded.

- source: codex
- worker: Codex

## 2026-06-03T17:10:00.000Z - Website blog, image feed, parser, and Remotion assets deployed

GHL is no longer a blocker for BNA website blogs. Operations Content now has a
Website Blog draft type, Telegram content cards can generate `Make Website Blog`,
and approved blog drafts publish into first-party website JSON that the homepage,
blog index, and article route load dynamically.

Learning Moments now has a public JSON feed plus `npm run website:add-moment`
for adding optimized/copy-ready images without editing homepage HTML directly.
The Drive watcher/approval lane is still the next automation layer.

Mixed-recording parsing now includes `daily_torah_updates`, so spoken daily Torah
completion can create admin-visible daily entries while cumulative 30-unit trip
progress remains separate. Telegram Remotion `/edit_video` and `/edit_drop` now
pass companion image/audio files as overlay assets for natural-language editing.

Verification passed: `node --check` for server, Telegram bridge, image helper,
and public content JS; `npm test`; Remotion source dry-run with image/audio
assets; live Railway deployment `44717355-d9b8-41b3-a198-e91acc65c22c`; live
public JSON/blog/homepage smoke; live Torah summary remains 15 percent and
locked for all five active students.

- source: codex
- worker: Codex

## 2026-06-04T06:58:35.671Z - Backfill visible parser cleanup task

Audited Telegram task processing after operator reported lag and a missing
parser/accountability cleanup task. The work was implemented and documented in
`TASKS.md`, `tasks-pending/`, and this changelog, but it did not have a normal
visible `bna_tasks` record.

Created production task #44, `Separate Content parsing from tasks and student
accountability`, marked done and verified, so Operations now shows the work in
the regular task system.

- source: codex_audit
- worker: Codex

## 2026-06-04T07:01:52.143Z - Normalize goal-setting Content cards

Audited Content jobs #18 and #19 after the operator reported that the natural
language parsing cleanup did not look processed. Job #19 had a timeout fallback
summary, and job #18 had no structured parse JSON, so the Content section could
still look like raw transcript/task/accountability spillover.

Updated both jobs with English topic-only summaries, discussions, highlights,
and routing notes. Private named student accountability remains in Students, and
operator/system tasks remain in Tasks.

- source: codex_audit
- worker: Codex

## 2026-06-04T06:53:41.000Z - Public favicon and WhatsApp preview deployed

The public site now uses the real BNA logo for browser favicons, Apple touch
icon, PWA manifest icons, and WhatsApp/social link previews. Generated logo
assets include `/favicon.ico`, `/icons/favicon-16.png`,
`/icons/favicon-32.png`, `/icons/apple-touch-icon.png`,
`/icons/icon-192.png`, `/icons/icon-512.png`, and
`/images/bna-social-preview.png`.

Homepage, Blog, FAQ, Blog article shell, signup pages, Operations, and
Operations login now point to the new icon files. Public pages have static Open
Graph/Twitter metadata for `https://bneineviimacademy.org/images/bna-social-preview.png`
so link shares can show the school logo without needing JavaScript.

Verification passed: `node --check server.js`, `node --check public/js/bna-pages.js`,
`node --check public/js/bna-content.js`, manifest JSON parse, generated image
dimension checks, Railway deployment `47b63515-33cf-4c64-9055-774383377368`,
and live checks for `/favicon.ico`, `/icons/icon-192.png`,
`/images/bna-social-preview.png`, homepage metadata, and HTTP to HTTPS redirect.
Live task #42 was renamed, assigned to Codex, marked done, and verified.

Remaining external-domain note: `www.bneineviimacademy.org` does not resolve
yet. The non-www domain is secure; using www requires adding/configuring the
www custom domain in Railway and the matching DNS record at the domain host.

- source: codex
- worker: Codex

## 2026-06-04T10:18:07.452Z - Catch up Torah accountability from uploaded recording

Updated the live Students accountability/Torah progress records for Telegram
message #158 and Drive recording `Voice 260604_095939.m4a`. Cleaned the
auto-created Hillel event title and added/updated goal progress notes for Huda
Weber, Menachem Mendel Dratler, Hillel Baraka, Eitan Chaim Golombo, and Amitai
Kosofsky.

The deterministic parser fallback briefly set every student to 100% after the
recording finished parsing. Reapplied the operator's individual corrections,
marked content job #20 with `manual_torah_correction`, and deployed a parser
guard so all-students 100% fallback is skipped when named-student progress is
present. Railway deployment `809d5987-64c4-4307-906f-c9d1d27a0505` succeeded.

Verification passed: `node --check server.js`, `npm test`, live Operations API
for 2026-06-04, and public Torah summary. Final values: Huda 50%, Menachem 25%,
Hillel 66.67%, Eitan 100%, and Amitai 100%; group trip progress reports 16%.

- source: telegram_accountability_catchup
- worker: Codex

## 2026-06-04T10:45:49.210Z - Public website links open homepage instead of Operations

Fixed the public PWA/start-page behavior so clicking or launching the website
goes to the public homepage instead of the Operations shell. The manifest now
uses `id: "/"` and `start_url: "/"`, the service worker cache was bumped to
`bna-public-v3`, Operations routes are bypassed by the public service worker,
the Operations dashboard unregisters service workers instead of registering
the public app shell, and old `/operations.html?source=pwa` launches redirect
to `/`.

Railway deployment `c66baa9e-caaa-4372-a2c2-02070be34e74` succeeded. Live
checks passed for `/api/health`, `/manifest.json`, `/`, and `/sw.js`. Task #52
was corrected from the bad parser title and marked done/verified as `Make public
website links open the homepage, not Operations`. Playwright confirmed
`/operations.html?source=pwa` ends at `https://bneineviimacademy.org/`.

- source: telegram
- worker: Codex

## 2026-06-04T15:52:54.454+03:00 - End-of-week BNA parent update drafted

Drafted a parent-ready WhatsApp end-of-week update from the cleaned BNA content
records and the operator's wording corrections. The draft uses the active BNA
topics from jobs #8 and #9 plus the Torah goal/camping-trip theme, leaves out
the separate Mishnayos/micro-school content, and avoids private student
percentages. Live task #58 was marked done and verified.

- source: telegram
- worker: Codex

## 2026-06-04T17:05:00.000Z - End-of-week BNA update revised with latest video

Re-ran transcription on the latest Drive video audio chunk and revised the
parent-facing WhatsApp note. The draft keeps the operator-approved first section
about the Webers, the watermelon/zula, Torah learning, goals, and Amitai, then
adds the other BNA topics from the week, including Parshas Shelach.

Supabase DNS lookup failed locally while checking task #62, so completion was
recorded in the local ledger/changelog instead of being marked in the live task
table.

- source: telegram
- worker: Codex

## 2026-06-04T15:42:01.870Z - Accounting summary labels made clearer

Refined the compact Operations Accounting summary cards after the operator
reported that the smaller cards still read like plain numbers. The card label
now appears as the first visible line, with the number below it; the longer
helper note remains hidden on mobile so the cards stay small.

Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, `npm test`, and a Playwright mobile
render/screenshot using mocked Accounting data. Screenshot saved at
`screenshots/local-operations-accounting-labels-mobile-20260604-followup.png`.

Railway deployment `a2a42fe7-5c48-4623-ac97-14301c982f65` succeeded. Live
mobile smoke passed: `/api/health` returned 200, Accounting summary cards showed
`Total records 5`, `Paid 4`, `Open 1`, and `Needs signup 2` with visible labels,
and page errors were 0. The saved live screenshot is clipped to the summary area
only: `screenshots/live-operations-accounting-labels-mobile-20260604-followup.png`.

- source: telegram
- worker: Codex

## 2026-06-04T15:39:00.000Z - Mobile hamburger menu and Operations app launch

Fixed the public mobile hamburger menu so it opens as a compact right-side
popover instead of a large dropdown. The live 390px menu now measures 236px by
223px and shows only Home, Blog, FAQ, language, Contact Us, and Sign Up.

Changed the installed phone app behavior so it opens Operations instead of the
public homepage: `public/manifest.json` now uses `start_url:
"/operations?source=pwa"`, standalone homepage launches redirect to
`/operations`, old `/operations.html?source=pwa` links redirect to
`/operations`, and `public/sw.js` is bumped to `bna-public-v4`.

Also fixed the follow-up Accounting mobile card issue: compact cards still stay
small, but now show labels such as Total records, Paid, Open, and Needs signup
under the numbers while hiding only the longer explanatory notes.

Railway deployment `80c520d6-fc0f-44b7-9c35-8073f48c7404` succeeded.
Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, `node --check public/js/bna-pages.js`,
manifest JSON parse, `npm test`, local Playwright mobile smoke, and live
Playwright smoke for the menu, manifest, service worker, installed-app redirect,
old PWA redirect, and Accounting labels. Tasks #56 and #57 were marked
done/verified in the live task API.

- source: telegram
- worker: Codex

## 2026-06-04T15:17:00.963Z - Compact Operations mobile summary cards

Reduced the top summary cards on mobile across Operations Tasks, Content,
Accounting, and Students. The mobile layout now keeps the cards two-across,
uses smaller padding/type, and hides the explanatory note text inside the count
cards so the working content starts higher on the screen.

Railway deployment `cccc38b3-a397-426f-af5c-d3dc5ae0c170` succeeded.
Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, `npm test`, local Playwright mobile smoke,
and live Playwright mobile smoke for `/operations?view=tasks`,
`/operations?view=content`, `/operations?view=accounting`, and
`/operations?view=students`.

- source: telegram
- worker: Codex

## 2026-06-05T04:14:31.000Z - Store build everything operating rule

Recorded the Telegram rule that `build everything` means Codex should choose a
practical order, start working through queued tasks, and report completed or
verified work without asking for ordering confirmation. Updated repo memory,
Telegram bridge instructions, and the task parser special case. Live task #67
was renamed into a clean Codex work item, and task #68 was marked done/verified.
Railway deployment `a965d40a-37c0-4a38-a610-ef08c53fbdd3` deployed the parser
change.

Verification passed: `node --check server.js` and `node --check
scripts/telegram-kimi-bridge.mjs`, `npm test`, Railway doctor, live
`/api/health`, live task #67/#68 lookup, and a temporary production parser smoke
where `Build everything` produced `Work through queued Codex tasks in a
practical order`; the temporary smoke task was deleted.

- source: telegram
- worker: Codex

## 2026-06-05T08:59:52.080Z - Revise end-of-week WhatsApp post with detailed weekly Q&A

Updated live Content WhatsApp output `#39` for content job `#21` after the
operator asked for the latest video section to be shorter and the weekly section
to include detailed questions, answers, and learning points from the other BNA
transcribed audio/video files this week.

The revised copy leads with the sleep/breakfast/screens/video message, then
adds detailed weekly points from content jobs `#21`, `#20`, `#19/#18`, `#9`,
`#8`, and `#6/#5`, while excluding the separate One Time/Mishnayos content. The
saved body is one paste-ready copy block and does not mention the school name.
Live task `#86` was renamed, marked done, and verified.

Verification passed: production content output `#39` read back with status
`needs_approval`, body length `4440`, and no `Bnei Neviim`, `Academy`, or `BNA`
name match.

- source: telegram
- worker: Codex

## 2026-06-05T12:16:13+03:00 - Split pending Codex work from Changelog

Updated the Operations Tasks UI so active agent work is no longer hidden inside
the completed Changelog lane. The task screen now shows separate focus tabs for
Decisions, My Tasks, Codex Queue, Changelog, and Done. Pending/in-progress
Codex/system work appears in Codex Queue; completed/verified Codex work appears
in Changelog.

Also fixed task title selection so the UI prefers cleaned task titles over
stale `ai_parsed.display_title` fragments from older Telegram captures.

Railway deployment `6b7029ad-cdf4-4546-beb9-da26730bab51` succeeded, and live
task `#89` was added/verified for this UI fix.
Verification passed: Operations app script compile check, `npm test`, Railway
doctor, deployment status, and live mobile Playwright smoke. The live Tasks
screen showed `Codex Queue 8`, `Changelog 38`, and cleaned queue titles with no
browser console errors.

- source: codex_cli
- worker: Codex

## 2026-06-05T15:20:00+03:00 - Finish website image intake and non-redundant blog workflow

Completed task #43 repo-side implementation without marking the live task done.
The Telegram bridge now watches `00 Upload Here - Website Images` before Raw
Media Intake, publishes the newest image into the public Learning Moments feed
through `scripts/add-learning-moment-image.mjs`, moves the Drive original to
`30 Approved Website Assets`, and reports the published image back to Telegram.
Added explicit `/website_images` and one-off `npm run website:ingest-image`
controls; Raw Media Intake images can also publish when the command/caption
clearly asks for website/Learning Moments publishing.

Website blog generation now receives an existing-article map from both static
website articles and generated published posts. Blog drafts are instructed to
choose a fresh concrete angle or return `NON-REDUNDANT BLOG NOT FOUND:`.
Publishing a website blog now blocks exact duplicate title/slug matches and
high-overlap drafts before writing to the public website feed.

Verification passed: `node --check server.js`,
`node --check scripts/telegram-kimi-bridge.mjs`,
`node --check scripts/add-learning-moment-image.mjs`, `npm test`, static blog
catalog parse smoke (`24` posts found), and `npm run website:add-moment --
--help`.

- task_id: 43
- source: codex_cli
- worker: Codex

## 2026-06-05T12:25:00+03:00 - Route Telegram content edits through OpenAI

Updated the local Telegram bridge so follow-up edits to saved content drafts do
not become Codex implementation tasks. The bridge now detects requests such as
`edit output #39: make it shorter`, draft replies, Facebook/WhatsApp/newsletter
revision language, and old draft messages that include a Content job reference.

When matched, the bridge loads the relevant saved Content output, asks OpenAI API
to revise the actual saved draft using the operator instruction, brand/platform
memory, approved examples, and source content context, then saves the revised
body back to the same Content output with status `needs_approval`. If OpenAI is
unavailable, it falls back to Kimi API and labels that provider in metadata. The
reply returns the revised text with approval/publish buttons and no Codex task is
created.

Also updated future draft messages to include `Content output #...` so replying
to a draft targets the correct saved output more reliably. Live task `#90` was
added/verified for this bridge change. Restarted the bridge on PID `227912`;
startup log reports `TelegramDefault=openai`, `OpenAIKey=yes`, and
`KimiKey=yes`.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
`npm test`, bridge restart, startup log check, and live task queue audit showing
no active misrouted newsletter/Facebook edit task.

- source: telegram
- worker: Codex

## 2026-06-05T12:36:04+03:00 - Expand Telegram content workbench

Updated the local Telegram bridge so OpenAI content mode can work more like the
operator's copy/content sidekick instead of scheduling every content correction
as Codex work. Weekly organization requests now gather multiple recent
transcribed Content jobs from the week, while excluding obvious separate One
Time/Rabbi Elie material unless requested.

Saved draft revisions now receive all linked source transcripts when the output
was generated from multiple recordings. The bridge also accepts plain Telegram
text approvals such as `approve this`, `save this as final`, or `save this as an
example`, marks the selected Content output approved through the backend, and
saves it as a reusable example when applicable. Live task `#92` was added and
verified for this bridge/content-workbench change.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`.

- source: telegram
- worker: Codex

## 2026-06-05T13:05:08+03:00 - Fix natural Telegram content follow-up edits

Fixed the Telegram bridge path that still let natural content corrections become
Codex tasks. Telegram message `#287` asked for a revised WhatsApp/newsletter
structure using phrases like "first section", "bullet points with emojis",
"date on top", Hebrew words in Hebrew letters, and the Masmid shout-out, but it
did not repeat `output #39` or `WhatsApp`, so the old detector missed it.

The bridge now treats those natural follow-up content-shaping phrases as saved
Content output edits before generic task capture. It also prefers the local
`.secrets/openai-api-key.txt` over stale duplicate `.env.local` key lines and
allows longer API draft revisions.

Reprocessed the missed correction through OpenAI, saved the revised body to
Content output `#39`, sent Telegram message `#289` with approve/reject buttons,
and archived misrouted task `#93` so it no longer sits in the Codex Queue.
Restarted the local Telegram bridge on PID `19624`. Live task `#94` was added
and verified for this fix.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
OpenAI secret-file smoke check, Content output `#39` readback, task `#93`
archive readback, JSONL validation, bridge restart, startup log check, and
`npm test`.

- source: telegram
- worker: Codex

## 2026-06-05T13:15:06+03:00 - Add live Telegram task update watcher

Audited why the operator was not receiving updates about the broader task
queue. The old reminder path only checked tasks that were part of the same
in-memory Codex batch. When the Telegram bridge restarted, that in-memory queue
was gone, so older assigned tasks stayed quiet. `/queue` also showed legacy
local media/intake JSON jobs instead of the live Operations Codex Queue.

Updated the bridge so `/queue` loads the live Operations task table and lists
Codex-owned active tasks first. Added a periodic task watcher that stores task
state in `.runtime/telegram-task-watch-state.json` and notifies Telegram when
Codex/Kimi/system-owned tasks move stages, complete, or become verified.

Verified and closed stale tasks `#78` and `#15`, reducing the live Codex Queue
from 8 active tasks to 6. Sent Telegram message `#292` with the root cause and
the current active task list. Restarted the local Telegram bridge on PID
`32340`. Live task `#96` was added and verified for this bridge watcher fix.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
`npm test`, JSONL validation, live task API readback, bridge startup log, and
task watcher initialization.

- source: telegram
- worker: Codex

## 2026-06-05T13:27:00+03:00 - Simplify Google Drive pipeline and export transcripts

Audited the BNA Google Drive pipeline and confirmed the connected account is
`office@bneineviimacademy.org`, with no separate Workspace Shared Drive visible.
The confusing Drive stages were operator-facing folder clutter; the actual
transcripts were stored in the live app database, not as separate Drive docs.

Added a repeatable transcript exporter and exported 18 transcript Markdown files
to `content-memory/transcripts/` with an index. Added a non-destructive Drive
organizer that backs up local config, renames the live folders into a simplified
operator structure, consolidates processed recordings into
`20 Processed Recordings - Source Media`, keeps approved website assets in
`30 Approved Website Assets`, and moves old redundant workflow folders plus the
deprecated Drive brand mirror into `_Archive - Legacy Pipeline Folders`.

Updated the server Drive setup route, standalone Drive setup, Drive audit
report, package scripts, local Drive config, Railway env export file, Telegram
bridge upload wording, repo memory, and task list so GitHub is canonical for
brand kit, platform memory, and transcript exports while Drive remains the
upload/source-media library. Sent a Telegram summary to the operator and
restarted the bridge on PID `28668`.

Attempted to push the updated `GOOGLE_DRIVE_PIPELINE_CONFIG` to Railway twice
with stdin, but Railway GraphQL timed out both times. The local paste/export
file `.secrets/railway-google-env.txt` is updated, and `TASKS.md` now tracks
the remaining Railway env push.

Verification passed: `node --check` for edited server/scripts,
`npm run content:export-transcripts`, `npm run drive:organize -- --dry-run`,
`npm run drive:organize`, `npm run drive:audit`,
`npm test`, bridge restart, Telegram summary send, task watcher state update,
and failed Railway push attempts with timeout captured.

- source: telegram
- worker: Codex

## 2026-06-05T14:35:17+03:00 - Add OpenAI sidekick system smoke

Added `scripts/smoke-openai-sidekick.mjs`, package command
`npm run openai:smoke`, and Telegram commands `/smoke_openai` /
`/openai_smoke` so the OpenAI Telegram sidekick can be tested against real
system access instead of assumed capability.

The smoke reads repo memory/task files, exported transcripts, protected BNA app
endpoints, Google Drive folder metadata, live task/student/payment/Torah data,
then asks OpenAI for structured answers from that live snapshot and optionally
sends the summary back to Telegram.

First pass exposed two useful field-mapping issues in the smoke itself: Torah
group progress lives under `group.groupPercentage`, and pending payments must be
read from signup/payment-intake context rather than only settled payment rows.
Both mappings were fixed before the final run.

Latest verification passed with `npm run openai:smoke -- --telegram`: 8 repo
files readable, 18 transcript exports readable, 10 protected app endpoints
readable, 7 Drive folders readable, OpenAI model `gpt-4.1-mini` answered from
live data, Telegram summary sent, active Codex tasks were `72, 67, 65, 49, 43`,
and the latest report was written to
`ops/openai-smokes/2026-06-05T11-35-17-138Z-openai-sidekick-smoke.md`.

Restarted the Telegram bridge after wiring the command; current lock showed PID
`226784`.

- source: codex_cli
- worker: Codex

## 2026-06-05T14:33:49+03:00 - Complete QStudio device-control checklist brief

Spawned sub-agent Pauli to work in parallel on live task #81. The agent created
`tasks-pending/2026-06-05-qstudio-device-control-checklist.md` with the
QStudio/Qustodio/Headwind/FreeKiosk allowlist, setup sequence, blockers, and
device verification checklist.

Marked task #81 done and verified in the live Operations task API. Remaining
verification is physical device/login testing, not repo-side planning.

- source: codex_subagent
- worker: Pauli

## 2026-06-05T14:51:05+03:00 - Build autonomous Codex agent fleet

Built the first guarded autonomous worker loop for Codex-owned Operations tasks.
The new `scripts/agent-fleet-supervisor.mjs` can load the live task queue,
select active Codex/system/agent-owned work, claim one task at a time, write
local supervisor/task locks, patch the task to `in_progress`, run Codex CLI,
run baseline verifier smokes, update task comments, mark successful tasks
done/verified, write detailed reports, append this changelog, append the shared
JSONL ledger, and notify Telegram.

Added Windows and npm controls:
`scripts/start-agent-fleet.ps1`, `npm run agent:fleet`,
`npm run agent:fleet:start`, `npm run agent:fleet:restart`,
`npm run agent:fleet:once`, and `npm run agent:fleet:status`.

Added Telegram bridge controls: `/agent_fleet_status`,
`/agent_fleet_start`, and `/agent_fleet_once`. The bridge help/capability text
now describes the fleet.

Updated Operations Tasks so Changelog shows pending plus completed agent work,
while Codex Queue remains the focused pending-only view.

Marked live umbrella task #67 done and verified so the fleet starts on real
remaining tasks instead of recursing on the meta-task. Latest smoke sees active
Codex tasks `72, 65, 49, 43`.

Verification passed: `node --check server.js`,
`node --check scripts/telegram-kimi-bridge.mjs`,
`node --check scripts/agent-fleet-supervisor.mjs`, agent-fleet status,
agent-fleet dry run, `npm test`, and `npm run openai:smoke`.

- source: codex_cli
- worker: Codex

## 2026-06-05T17:12:39+03:00 - Clean agent output and add OpenAI research mode

Audited the operator report that Telegram produced a crazy-long output. Root
cause was task #100: the agent fleet wrote raw Codex CLI failure output and the
full worker prompt into visible `verification_notes`. That text then surfaced in
the Operations/Telegram trail.

Updated `scripts/agent-fleet-supervisor.mjs` so future failures use concise
summaries in Telegram and task notes, while raw output remains in
`ops/agent-fleet-runs/` reports. Cleaned task #100's visible note.

Added an OpenAI Responses `web_search` path to the Telegram OpenAI mode for
research/current/API/framework/YouTube/SEO/AEO/GEO-style questions. Normal
content edits and ordinary chat remain on the faster existing provider path.

Updated Telegram prompts so product/strategy/system questions are answered
directly first with recommendations/tradeoffs, and useful proactive
recommendations are labeled as suggestions instead of surprise questions.

Marked live tasks #100 and #101 done/verified. Latest verification passed:
`node --check scripts/telegram-kimi-bridge.mjs`,
`node --check scripts/agent-fleet-supervisor.mjs`, live OpenAI Responses
web-search smoke, `npm test` with 20 passing tests, and `npm run openai:smoke`
showing active Codex tasks `0`.

Telegram bridge caveat: an access-denied stale poller PID `178552` remains
connected and could not be killed from the current shell. The duplicate new
bridge was stopped to end `409 Conflict` errors; newest bridge code will become
live after PID `178552` is killed from an elevated process manager and the bridge
is restarted.

- source: codex_cli
- worker: Codex

## 2026-06-05T12:02:29+03:00 - Complete agent task #43: Finish website image intake and non-redundant blog publishing workflow

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Finished task #43 repo-side. Website Images Drive intake now publishes images into the public Learning Moments feed and moves originals to approved assets; explicit Raw Intake website-image publishing is supported when requested. Website blog generation now receives existing article context and publish blocks obvious duplicate/high-overlap drafts. I did not mark the live task done.

VERIFICATION: `node --check server.js` passed; `node --check scripts/telegram-kimi-bridge.mjs` passed; `node --check scripts/add-learning-moment-image.mjs` passed; `npm test` passed 16/16; static blog catalog smoke parsed 24 posts; `npm run website:add-moment -- --help` passed.

FILES: [server.js](<C:/Users/User/BNA v2.0/server.js:97>), [scripts/telegram-kimi-bridge.mjs](<C:/Users/User/BNA v2.0/scripts/telegram-kimi-bridge.mjs:34>), [package.json](<C:/Users/User/BNA v2.0/package.json:39>), [ops/agent-changelog.md](<C:/Users/User/BNA v2.0/ops/agent-changelog.md:1114>), [ops/agent-task-ledger.jsonl](<C:/Users/User/BNA v2.0/ops/agent-task-ledger.jsonl>)

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T12-02-29-545Z-task-43.md

- source: agent_fleet
- worker: Codex

## 2026-06-07T12:46:50+03:00 - Final acceptance for split Telegram UI redesign

Codex completed the final acceptance pass for the broken-up Telegram UI
redesign prompt across messages 425-428/task #130 after the later Railway
deployment `a8fa5789-224c-4b2a-b4f9-9dbe21e15f41`.

Verified live Operations behavior:
- Student Profile shows collapsed sections for Torah admin, Goal Board items,
  questions, notes, tablet access, portal link, and private notes.
- Content Library keeps filters/details collapsed; Prompts show View/Edit Prompt,
  Make output, and draft status controls.
- Contacts shows compact roster cards with selected parent/student detail,
  WhatsApp/follow-up/student actions, source/language fields, tags, and timeline.
- Accounting Overview shows summary cards without dumping the full roster table.
- Mobile checks showed no 390px horizontal overflow.

Verification:
- PASS final live UI acceptance:
  `ops/system-audits/2026-06-07-ui-redesign-final-acceptance-1780825809195.json`
- PASS latest live app smoke:
  `ops/live-smokes/2026-06-07T09-38-15-451Z-live-app-smoke.md`
- PASS Telegram bridge remains live on PID `211292`

- source: codex
- worker: Codex

## 2026-06-07T12:40:01+03:00 - Remove generic pending task lane wording

Audited the live Operations task queue for Telegram task #140. The only active
records were the clarified Codex task #140 and its superseded decision record
#139; both are now closed in the live app. Operations Tasks no longer presents
generic pending work as its own lane; work belongs in Decisions, My Tasks, Rabbi
Tasks, Codex Queue, Implementation Briefs, Changelog, Done, or Archive.

Follow-up cleanup renamed the remaining Accounting `Open/Pending` tab to
`Needs Attention` while preserving the unpaid/partial/review data underneath.
The durable rule is now recorded in `MEMORY.md` and `AGENTS.md`.

Verification passed: live task audit showed 0 active ambiguous tasks after
closure, `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`,
`node --check scripts/agent-fleet-supervisor.mjs`, inline Operations scripts
parsed, JSONL ledger parsed, `npm test` passed 33/33, `npm run openai:smoke`
passed, Railway deployment `e7f9b74b-db3f-43cf-85eb-a35aff61b21e` succeeded,
Railway doctor passed, live smoke passed at
`ops/live-smokes/2026-06-07T09-43-40-789Z-live-app-smoke.md`, and authenticated
live HTML verification confirmed `Needs Attention` is present with no
`Open/Pending` or `Open / Pending` label. Live closed task titles #139 and
#140 were also cleaned into concise titles while keeping raw Telegram wording
only in provenance fields.

- source: codex
- worker: Codex

## 2026-06-07T12:38:59+03:00 - Remove generic Tasks pending state for task #140

Codex audited the live task queue and updated the Tasks dashboard so "pending"
is no longer a generic visible task state.

Changes:
- Renamed the visible Tasks "Pending Briefs" subtab/card to "Implementation
  Briefs".
- Changed Codex status wording from pending to queued.
- Changed assigned task badges from Pending to Ready.
- Preserved accounting/payment pending language, because that is a real payment
  status rather than a task-management lane.
- Marked stale/superseded app records #134, #139, and #140 done/verified; the
  live app now reports 0 active tasks.

Verification:
- PASS `node --check server.js`
- PASS inline `public/operations.html` and `public/student.html` scripts parse
- PASS `npm test` 33/33
- PASS `npm run openai:smoke`
- PASS Railway deployment `a8fa5789-224c-4b2a-b4f9-9dbe21e15f41`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke -- --require-drive`:
  `ops/live-smokes/2026-06-07T09-37-45-977Z-live-app-smoke.md`
- PASS targeted live Operations mobile check: Implementation Briefs and queued
  Codex wording are visible, old task pending wording is absent, and 390px
  horizontal overflow is 0

- source: codex
- worker: Codex

## 2026-06-05T19:13:10+03:00 - Completed UI visibility fix after app appeared unchanged

Stopped the stuck child Codex worker for task #103, completed the visible UI/status work manually, deployed it to Railway, and marked live task #103 done/verified.

Changes:
- Public homepage Torah trip fallback now shows the cumulative 15% migration state for all five boys instead of a misleading 100% loading shell.
- Torah student progress cards now use equal centered layout with the progress bar anchored consistently.
- Operations Tasks now includes a Codex Queue Visibility panel with pending, in-progress, and urgent/today counts.
- Added `/api/bna/agent-fleet/status` GET/POST, a `bna_agent_runtime_status` heartbeat table, and supervisor heartbeat writes.
- Restarted the agent fleet watcher; live status now reports running with pending 0 and in_progress 0.

Verification:
- PASS `node --check server.js`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `npm test` with 20 tests
- PASS Railway deploy `a8cd4701-626d-4687-ae76-4473fde571ab`
- PASS live smoke for homepage 15%, service worker `bna-public-v5`, Operations agent panel, and agent status API

- source: codex_cli
- worker: Codex

## 2026-06-05T15:16:20+03:00 - Complete task #98: Fix Telegram replies that appear cut off after capture summaries

Investigated the Telegram exchange around message #328. The saved OpenAI reply
was complete, but the bridge appended a long captured-task summary from the
operator's speaker-label question, making the Telegram message look like it
stopped mid-sentence and then began another fragment.

Fixed the capture path so pure capability questions such as "is there a way to
label speakers" are answered in chat without creating visible Tasks. Added
explicit speaker-diarization task wording for real implementation requests,
shortened Telegram task summaries to clean complete-looking labels, and added
`Part X/Y` labels for genuinely long multi-message Telegram replies.

Archived accidental task #97 as an answered chat question and marked task #98
done/verified in the live app.

Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, and `npm test` (20/20).

- source: codex_cli
- worker: Codex

## 2026-06-05T15:12:21+03:00 - Improve spoken Torah engagement parser mapping

Improved mixed-recording parsing so spoken Torah timer updates can capture
inside/following minutes, listening-without-following minutes, distracted time,
timer duration, goal progress, and observed engagement without leaving parser
intake in the Content lane.

Added a tested Torah engagement normalizer, routed parsed timer details into
daily Torah entries, added private timer-style accountability events when exact
timer details are present, preserved percentage-only daily updates, and added
`distracted_minutes` support on group-goal entries.

Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, and `npm test`.

- source: codex
- worker: Codex

## 2026-06-05T12:13:12+03:00 - Complete agent task #49: Improve spoken Torah engagement parsing and timer mapping

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Improved spoken Torah parser mapping so timer updates can capture inside/following, listening-without-following, distracted time, timer duration, daily Torah progress, and private accountability events without keeping parser intake in Content. I did not mark the live task done.

VERIFICATION: `node --check server.js` passed; `node --check scripts\telegram-kimi-bridge.mjs` passed; `node --test tests\torah-learning.test.js` passed; `npm test` passed 20/20.

FILES: [server.js](<C:/Users/User/BNA v2.0/server.js:2615>), [src/lib/bna/torah-learning.js](<C:/Users/User/BNA v2.0/src/lib/bna/torah-learning.js:95>), [tests/torah-learning.test.js](<C:/Users/User/BNA v2.0/tests/torah-learning.test.js:84>), [scripts/telegram-kimi-bridge.mjs](<C:/Users/User/BNA v2.0/scripts/telegram-kimi-bridge.mjs:3068>), [ops/agent-changelog.md](<C:/Users/User/BNA v2.0/ops/agent-changelog.md:1380>).

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T12-13-12-980Z-task-49.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T15:21:23+03:00 - Harden Telegram reply delivery diagnostics for task #98

Follow-up hardening for the Telegram cut-off investigation. The bridge now uses
the tail of today's memory for OpenAI/Codex Telegram context, tells OpenAI not
to treat just-auto-captured tasks as the answer to pure questions, suppresses
task creation for exploratory capability questions, and records Telegram
delivery chunk counts/message IDs for normal and async replies.

Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, `node --check
scripts/agent-fleet-supervisor.mjs`, and `npm test` (20/20). An initial
`npm test -- --runInBand` command failed because this repo uses Node's test
runner, not Jest.

- task_id: 98
- source: codex
- worker: Codex

## 2026-06-05T12:24:33+03:00 - Complete agent task #98: Check what happened in the telegram but he was in the middle of a sentence responding to something and the message got cut off with multiple speakers and if it's each speaker and then it says C fix that

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Investigated the Telegram exchange. The saved OpenAI reply was complete, but the bridge could make it look cut off by auto-capturing a pure speaker-label question as a task and appending capture text. I hardened the bridge so exploratory capability questions stay conversational, OpenAI/Codex see the tail of today’s Telegram memory for “what just happened” questions, and sent replies now log Telegram chunk counts/message IDs.

VERIFICATION: `node --check server.js` passed; `node --check scripts\telegram-kimi-bridge.mjs` passed; `node --check scripts\agent-fleet-supervisor.mjs` passed; `npm test` passed 20/20; JSONL ledger parse passed. Initial `npm test -- --runInBand` failed because this repo uses Node’s test runner, not Jest.

FILES: [scripts/telegram-kimi-bridge.mjs](<C:/Users/User/BNA v2.0/scripts/telegram-kimi-bridge.mjs>), [ops/agent-changelog.md](<C:/Users/User/BNA v2.0/ops/agent-changelog.md>), [ops/agent-task-ledger.jsonl](<C:/Users/User/BNA v2.0/ops/agent-task-ledger.jsonl>).

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T12-24-33-913Z-task-98.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T15:27:11+03:00 - Complete student Goal Board and Classroom/consequence design brief

Created the planning-only handoff for task #65 at
`tasks-pending/2026-06-05-student-goal-board-classroom-consequences.md`.
The brief locks in the Goal Board-first recommendation, keeps Torah/morning
learning progress read-only at the top of the student page, maps Google
Classroom YouTube assignments into Goal Board items, and defines private
natural-consequence rules with parent/admin approval before any device-control
action.

No app code, database schema, or live task state was changed.

- task_id: 65
- source: codex
- worker: Codex

## 2026-06-05T12:30:56+03:00 - Complete agent task #65: Design student Goal Board, Classroom assignments, and consequence rules

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Completed the planning-only handoff for task #65. It defines the Goal Board-first design, Classroom YouTube assignment layer, and private consequence/device approval rules. I did not change app behavior or mark the live task done. Classroom API assumptions were checked against official Google docs: [Manage CourseWork](https://developers.google.com/workspace/classroom/guides/manage-coursework), [CourseWork resource](https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork), and [API structure](https://developers.google.com/workspace/classroom/guides/key-concepts/api-structure).

VERIFICATION: `node --check server.js` passed; `node --check scripts\telegram-kimi-bridge.mjs` passed; `node --check scripts\agent-fleet-supervisor.mjs` passed; `npm test` passed 20/20; JSONL ledger parse passed with 147 records.

FILES: changed [task brief](<C:/Users/User/BNA v2.0/tasks-pending/2026-06-05-student-goal-board-classroom-consequences.md:1>), [MEMORY.md](<C:/Users/User/BNA v2.0/MEMORY.md:49>), [agent changelog](<C:/Users/User/BNA v2.0/ops/agent-changelog.md>), [agent task ledger](<C:/Users/User/BNA v2.0/ops/agent-task-ledger.jsonl>). Inspected `public/student.html`, `server.js`, `public/operations.html`, `WISHLIST.md`, `SPEC.md`, and the QStudio checklist.

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T12-30-56-424Z-task-65.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T12:54:04+03:00 - Complete agent task #72: Build One Time Mishnah Class project/workspace model

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Implemented the One Time Mishnah Class workspace model without creating a duplicate database/concept. Existing `mishna`/`mishnah`/`one time` aliases now normalize to `one_time_mishnah_class`; BNA and One Time projects are seeded/backfilled, task comments and Decision Required are wired, and Operations Tasks now exposes project filters, project selector, assignment, One Time categories, and comments. I did not patch the live task status.

VERIFICATION: Passed `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, inline `public/operations.html` VM compile, `npm test` 20/20, `git diff --check`, Playwright dashboard smoke on temporary updated server, and API create/comment/delete smoke proving `project: "mishna"` routes to One Time.

FILES: Changed `server.js`, `public/operations.html`, `.env.example`, `railway-migration-2026-06-05-one-time-projects.sql`, `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md`, `ops/agent-changelog.md`, `ops/agent-task-ledger.jsonl`. Screenshot: `screenshots/local-operations-one-time-projects-20260605.png`.

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T12-54-04-242Z-task-72.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T12:55:26+03:00 - Agent task #100 blocked: Why aren't you able to investigate it what other things will you be able to do you need some sort of YouTube API or research apis or why can't you answer my questions be as helpful as regular chat GPT and be able to u...

The agent fleet claimed this Codex-owned task but did not mark it complete because the Codex run or verifier phase failed.

Codex result:
2026-06-05T12:55:11.434066Z  WARN codex_core::shell_snapshot: Failed to create shell snapshot for powershell: Shell snapshot not supported yet for PowerShell
OpenAI Codex v0.133.0-alpha.1
--------
workdir: C:\Users\User\BNA v2.0
model: gpt-5.5
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: xhigh
reasoning summaries: none
session id: 019e97da-1026-7c51-9532-0ebbf654f988
--------
user
You are Codex running as an autonomous BNA agent-fleet worker.
Work inside this repository and complete the assigned task end-to-end when feasible.
Safety rules:
- Follow AGENTS.md and MEMORY.md.
- Do not revert unrelated user changes.
- Do not ask the operator for ordering confirmation.
- If a real blocker or risky decision appears, stop and report it clearly.
- Do not start long-lived foreground services; the supervisor owns background loops.
- Run relevant checks yourself; the supervisor will run baseline verification afterward.
- Do not mark the live task done yourself unless you already changed the system state intentionally; the supervisor will normally mark done after verification.
Task ID: 100
Attempt: 1
Title: Why aren't you able to investigate it what other things will you be able to do you need some sort of YouTube API or research apis or why can't you answer my questions be as helpful as regular chat GPT and be able to u...
Stage: in_progress
Category: mar

Verification:

Report: ops/agent-fleet-runs/2026-06-05T12-55-26-838Z-task-100.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T12:56:48+03:00 - Agent task #100 blocked: Why aren't you able to investigate it what other things will you be able to do you need some sort of YouTube API or research apis or why can't you answer my questions be as helpful as regular chat GPT and be able to u...

The agent fleet claimed this Codex-owned task but did not mark it complete because the Codex run or verifier phase failed.

Codex result:
2026-06-05T12:56:34.456173Z  WARN codex_core::shell_snapshot: Failed to create shell snapshot for powershell: Shell snapshot not supported yet for PowerShell
OpenAI Codex v0.133.0-alpha.1
--------
workdir: C:\Users\User\BNA v2.0
model: gpt-5.5
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: xhigh
reasoning summaries: none
session id: 019e97db-5528-7892-934d-038676892731
--------
user
You are Codex running as an autonomous BNA agent-fleet worker.
Work inside this repository and complete the assigned task end-to-end when feasible.
Safety rules:
- Follow AGENTS.md and MEMORY.md.
- Do not revert unrelated user changes.
- Do not ask the operator for ordering confirmation.
- If a real blocker or risky decision appears, stop and report it clearly.
- Do not start long-lived foreground services; the supervisor owns background loops.
- Run relevant checks yourself; the supervisor will run baseline verification afterward.
- Do not mark the live task done yourself unless you already changed the system state intentionally; the supervisor will normally mark done after verification.
Task ID: 100
Attempt: 2
Title: Why aren't you able to investigate it what other things will you be able to do you need some sort of YouTube API or research apis or why can't you answer my questions be as helpful as regular chat GPT and be able to u...
Stage: assigned
Category: market

Verification:

Report: ops/agent-fleet-runs/2026-06-05T12-56-48-445Z-task-100.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T16:01:41+03:00 - Agent task #103 blocked: Handle UI updates after killing a process

The agent fleet claimed this Codex-owned task but did not mark it complete because the Codex run or verifier phase failed.

Codex result:
2026-06-05T15:56:39.320466Z  WARN codex_core::shell_snapshot: Failed to create shell snapshot for powershell: Shell snapshot not supported yet for PowerShell

Verification:

Report: ops/agent-fleet-runs/2026-06-05T16-01-41-916Z-task-103.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T19:34:45+03:00 - Implement Student Goal Board MVP in app UI

Built the first app-side Student Goal Board MVP on the existing private student
portal and Operations Students surfaces.

The student portal now shows read-only Torah trip/today/morning status rings,
EN/HE switching, Today/Upcoming/Waiting/Done filters, student-created goals,
goal cards with source/urgency/due/progress/check-in notes, Classroom links,
and recovery paths. The portal response is student-safe and does not expose raw
private meeting/admin notes or private Torah minutes/types.

Operations Students now has a Goal Board admin panel for admin/self/Classroom/
private-meeting items, local Classroom draft links, private admin notes,
recovery paths, approval-required waiting states, progress controls, archive
controls, and consequence review actions. Missed overdue device-linked goals
create pending review metadata instead of applying any device action.

Added `src/lib/bna/goal-board.js` plus focused tests for bucket behavior,
student-safe privacy, and pending-review consequence behavior.

Verification passed: `node --check server.js`, `node --check
src/lib/bna/goal-board.js`, `node --check tests/goal-board.test.js`, inline
script VM compile for `public/operations.html` and `public/student.html`,
`npm test` (23/23), `node --check scripts/telegram-kimi-bridge.mjs`, `node
--check scripts/agent-fleet-supervisor.mjs`, `git diff --check`, and a
short-lived mocked Playwright UI smoke with screenshots under `screenshots/`.

- source: codex_cli
- worker: Codex

## 2026-06-05T16:37:10+03:00 - Complete agent task #108: Implement Student Goal Board MVP in app UI

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Implemented the Student Goal Board MVP in the app UI: private student portal now has read-only Torah rings, EN/HE toggle, Today/Upcoming/Waiting/Done filters, student-created goals, safe cards, Classroom links, check-in notes, and recovery paths. Operations Students now has admin Goal Board controls for admin/self/Classroom/private-meeting items, private admin notes, approval-required waiting states, progress/archive/review actions, and missed overdue device-linked goals create pending review only.

VERIFICATION: `node --check server.js`; `node --check src/lib/bna/goal-board.js`; `node --check tests/goal-board.test.js`; inline VM compile for `public/operations.html` and `public/student.html`; `npm test` passed 23/23; `node --check scripts/telegram-kimi-bridge.mjs`; `node --check scripts/agent-fleet-supervisor.mjs`; `git diff --check` had only existing LF/CRLF warnings; mocked Playwright UI smoke passed with screenshots.

FILES: [server.js](</C:/Users/User/BNA v2.0/server.js>), [public/student.html](</C:/Users/User/BNA v2.0/public/student.html>), [public/operations.html](</C:/Users/User/BNA v2.0/public/operations.html>), [src/lib/bna/goal-board.js](</C:/Users/User/BNA v2.0/src/lib/bna/goal-board.js>), [tests/goal-board.test.js](</C:/Users/User/BNA v2.0/tests/goal-board.test.js>), [ops/agent-changelog.md](</C:/Users/User/BNA v2.0/ops/agent-changelog.md>), [

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T16-37-10-804Z-task-108.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T19:56:19+03:00 - Build tablet access accountability mock provider and approval UI

Built the safe app-side tablet access MVP without enabling any real device,
MDM, kiosk, QStudio, or Qustodio calls.

Added `bna_devices`, `bna_device_access_rules`, and
`bna_device_access_sessions` to app bootstrap plus a repeatable
`railway-migration-2026-06-05-device-control-mock.sql` migration. Added a
server-side mock `DeviceControlProvider` that supports lock, accountability
only, approved timed access, expired, and manual override states while writing
explicit `real_device_call: false` provider results.

Operations Students now shows tablet access status per student, mock tablet
creation, state/session controls, pending device-linked Goal Board reviews, and
approve/deny/manual override actions that record mock sessions. The student
portal now shows a read-only access-state strip when a device is configured.
Real shutoff remains blocked until the exact hardware/provider/admin path is
confirmed.

Verification passed: `node --check server.js`, `node --check
src/lib/bna/device-control.js`, inline script VM compile for
`public/operations.html` and `public/student.html`, `npm test` (27/27), `node
--check scripts/telegram-kimi-bridge.mjs`, `node --check
scripts/agent-fleet-supervisor.mjs`, and mocked Playwright UI smokes for
Operations desktop/mobile and student mobile with screenshots under
`screenshots/`.

- source: codex_cli
- worker: Codex

## 2026-06-05T16:59:08+03:00 - Complete agent task #109: Build tablet access accountability mock provider and approval UI

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Built the mock-only tablet access accountability MVP: device/rule/session tables and migration, server-side mock `DeviceControlProvider`, protected device/session/review APIs, Operations approval UI, student/device status display, and student portal read-only access state. No real MDM, kiosk, QStudio, Qustodio, or tablet calls are enabled. Live task status was not patched.

VERIFICATION: `node --check server.js`; `node --check src/lib/bna/device-control.js`; inline VM compile for `public/operations.html` and `public/student.html`; `npm test` passed 27/27; `node --check scripts/telegram-kimi-bridge.mjs`; `node --check scripts/agent-fleet-supervisor.mjs`; mocked Playwright UI smoke passed for Operations desktop/mobile and student mobile. `git diff --check` had only LF/CRLF warnings.

FILES: [server.js](</C:/Users/User/BNA v2.0/server.js>), [public/operations.html](</C:/Users/User/BNA v2.0/public/operations.html>), [public/student.html](</C:/Users/User/BNA v2.0/public/student.html>), [src/lib/bna/device-control.js](</C:/Users/User/BNA v2.0/src/lib/bna/device-control.js>), [tests/device-control.test.js](</C:/Users/User/BNA v2.0/tests/device-control.test.js>), [railway-migration-2026-06-05-device-control-mock.sql](</C:/Users/User/BNA v2.0/railway-migration-2026-06-05-device-control-mock.sql>), [ops/agent-changelog.md](</C:/Users/User/BNA v2.0/ops/agent-changel

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T16-59-08-906Z-task-109.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T20:14:12+03:00 - Finish Rabbi Elie One Time scoped task access

Implemented the Rabbi Elie Scheller scoped One Time Telegram/agent profile on
the existing bridge instead of creating a separate framework. The new
`rabbi-elie-scheller` profile uses separate runtime lock/log/mode files, loads
`agents/rabbi-elie-scheller/` context, uses only scoped One Time Operations
credentials, disables Codex execution by default, and limits app snapshots and
commands to One Time task/comment collaboration.

Added `npm run telegram:rabbi` and `npm run telegram:rabbi:start`, documented
the required live token/chat/login values in
`agents/rabbi-elie-scheller/SETUP.md`, and updated the One Time handoff with the
remaining live secret values.

Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`, `node
--check server.js`, `node --check scripts/agent-fleet-supervisor.mjs`, `npm
test` (27/27), `package.json` parse, PowerShell launcher parse, Operations
inline script compile, and a short-lived API smoke proving One Time project
filtering, comments, Rabbi/Shloimie assignment, Decision Required, and scoped
login restrictions.

- task_id: 110
- source: codex
- worker: Codex

## 2026-06-05T17:16:16+03:00 - Complete agent task #110: Finish Rabbi Elie One Time task manager and scoped bot access

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Finished the Rabbi Elie scoped One Time path in the repo. Added the `rabbi-elie-scheller` Telegram bridge profile, separate runtime files, scoped One Time task/comment capture, scoped prompt context from `agents/rabbi-elie-scheller/`, Codex disabled by default, npm start scripts, and exact setup docs. Live use still needs `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`, `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`, `ONE_TIME_OPS_USERNAME`, and `ONE_TIME_OPS_PASSWORD`.

VERIFICATION: Passed `node --check scripts/telegram-kimi-bridge.mjs`, `node --check server.js`, `node --check scripts/agent-fleet-supervisor.mjs`, `npm test` 27/27, package JSON parse, PowerShell launcher parse, Operations inline script compile, and `git diff --check` with only existing LF/CRLF warnings. Also ran a short-lived API smoke verifying One Time project filters, comments, Rabbi/Shloimie assignee patching, Decision Required, and scoped login blocking Students API.

FILES: `scripts/telegram-kimi-bridge.mjs`, `scripts/start-telegram-kimi-bridge.ps1`, `package.json`, `.env.example`, `agents/README.md`, `agents/rabbi-elie-scheller/SETUP.md`, `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md`, `MEMORY.md`, `ops/agent-changelog.md`, `ops/agent-task-ledger.jsonl`, inspected `server.js` and `public/operations.html`.

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T17-16-16-528Z-task-110.md

- source: agent_fleet
- worker: Codex

## 2026-06-05T17:28:45+03:00 - Complete agent task #111: Make pending briefs visible in Operations task manager

The agent fleet claimed this Codex-owned task, ran Codex CLI, then ran the verifier phase before marking the task done.

Codex result:
STATUS: done

SUMMARY: Added a read-only `Pending Briefs` focus in Operations Tasks backed by `/api/bna/pending-briefs`. It reads `tasks-pending/*.md`, labels briefs as Planned, Implementing, Verified, or Deployed, and shows Goal Board, device control, Rabbi bot, UI, Drive/content, and parsing badges without treating markdown plans as completed work.

VERIFICATION: `node --check server.js` passed; inline `public/operations.html` scripts compiled with Node `vm.Script`; `npm test` passed 27/27; local pending-brief classifier smoke passed; mocked Playwright Operations UI smoke passed; `node --check scripts/telegram-kimi-bridge.mjs` passed.

FILES: `server.js`, `public/operations.html`, `ops/agent-changelog.md`; inspected `tasks-pending/*.md`, `AGENTS.md`, `MEMORY.md`, `TASKS.md`.

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Report: ops/agent-fleet-runs/2026-06-05T17-28-45-988Z-task-111.md

- source: agent_fleet
- worker: Codex

## 2026-06-06T20:44:49+03:00 - Fix agent fleet completion gate and clean stuck raw task

Audited why completed dashboard/UI work did not appear live: the agent fleet
marked Codex-owned tasks done after local verification only, without requiring a
Railway deploy or live smoke. Added a deployment gate to the supervisor so
deployable app changes must run `npm run railway:redeploy` and
`npm run railway:doctor` before the live task can be marked done.

Also cleaned live task #99 from raw spoken wording into `Evaluate speaker
diarization for class recordings`, created
`tasks-pending/2026-06-06-speaker-diarization-recording-parser.md`, and marked
the live task done with a clear implementation handoff.

- source: codex
- worker: Codex

## 2026-06-06T20:59:00+03:00 - Clean historical raw task titles

Cleaned old done/archive task titles #6, #7, #8, #9, #19, #23, #24, #25,
#26, #28, #29, #62, #63, and #93 so dashboard history no longer displays raw
spoken fragments. Preserved their closed stages. Live audit afterward returned
`active_count: 0` and `natural_looking_titles_count: 0`.

- source: codex
- worker: Codex

## 2026-06-06T21:16:16+03:00 - Complete full task-system closeout audit

Completed the follow-up audit across live tasks, pending briefs, TASKS,
SYSTEM-STATE, Drive config, Telegram/fleet status, payment reminders, and Torah
public progress. Fixed the durable Torah drift root cause by making migration
seeding idempotent and reconciling canonical completed dates so all five
students show 15 percent and the trip remains locked. Pushed the updated Drive
pipeline config to Railway, added Telegram `/railway_deploy`, reconciled stale
TASKS/pending-brief status labels, and wrote
`ops/system-audits/2026-06-06-closeout-task-system.md`.

Verification passed: `node --check server.js`, `node --check
scripts/telegram-kimi-bridge.mjs`, `node --check
scripts/agent-fleet-supervisor.mjs`, `npm test` 27/27, `npm run openai:smoke`,
Railway doctor, and live API smoke. Final Railway deployment:
`b3c6d076-8a75-4190-9c3b-26a58ef098b4`.

- source: codex
- worker: Codex

## 2026-06-07T06:25:30+03:00 - Deploy page-top polish for task #126

Compacted the mobile Operations Daily Command Center into a horizontal summary
strip so the actual Tasks, Students, Content, Contacts, and Accounting work
starts much higher on phones. The measured mobile command-center height dropped
from 1069px to 218px, with the main workspace starting around y=373 instead of
y=1224.

Also tightened the Student portal landing top alignment on desktop while
leaving the desktop Operations command center unchanged.

Verification passed: `node --check server.js`, inline
`public/operations.html` and `public/student.html` scripts parsed with
`vm.Script`, `npm test` 30/30, `npm run openai:smoke`, Railway deployment
`389ffda4-febb-4414-b3c4-efd08e7ae99e`, and live smoke
`ops/live-smokes/2026-06-07T03-24-22-716Z-live-app-smoke.md`.

- source: codex
- worker: Codex

## 2026-06-07T06:27:01+03:00 - Fix mobile top-of-page layout across BNA pages

Completed agent task #126 follow-up verification. The Operations Daily Command
Center stays compact across dashboard views on mobile, with horizontally
scrollable attention cards instead of pushing the actual lane content below the
first screen. The public homepage mobile entrance animations no longer create
hidden horizontal page overflow, and live checks confirmed Home, Blog, FAQ,
Student, and Operations render at 390px width without sideways overflow.

Verification passed: `node --check server.js`, inline public-page script compile,
`npm test` 30/30, `npm run openai:smoke`, local Playwright visual metrics,
Railway deploy `85cfdcab-131d-4510-8520-b25e413ee052`, Railway doctor, live app
smoke `ops/live-smokes/2026-06-07T03-25-17-982Z-live-app-smoke.md`, and live
mobile visual metrics.

- source: codex
- worker: Codex

## 2026-06-07T03:31:02+03:00 - Complete agent task #126: Fix the up of all the pages

The agent fleet claimed this Codex-owned task, ran Codex CLI, ran verification, then passed the deployment gate before marking the task done.

Codex result:
STATUS: done

SUMMARY: Fixed and deployed the page-top/mobile layout follow-up for task #126. Operations now keeps the shared top Command Center compact on mobile, and the public homepage no longer creates hidden horizontal overflow from mobile entrance animations.

VERIFICATION: `node --check server.js` passed; inline public-page scripts compiled; `npm test` passed 30/30; `npm run openai:smoke` passed; Railway deploy `85cfdcab-131d-4510-8520-b25e413ee052` succeeded; Railway doctor passed; live smoke passed at `ops/live-smokes/2026-06-07T03-25-17-982Z-live-app-smoke.md`; live mobile metrics confirmed no horizontal overflow on Home, Blog, FAQ, Student, and Operations.

FILES: `public/index.html`, `SYSTEM-STATE.md`, `ops/agent-changelog.md`, `ops/agent-task-ledger.jsonl`; inspected/deployed current `public/operations.html` and `public/student.html`.

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Deployment gate:
- PASS Deployment gate for app-visible changes.
- Deployable files: agents/README.md, package.json, public/css/bna-pages.css, public/index.html, public/operations.html, public/student.html, scripts/railway-redeploy.ps1, server.js, src/lib/bna/device-control.js, src/lib/bna/goal-board.js, tasks-pending/2026-06-03-website-moments-and-parser-routing.md, tasks-pending/2026-06-05-qstudio-device-control-checklist.md, and 4 more
- PASS npm run railway:redeploy
- PASS npm run railway:doctor

Report: ops/agent-fleet-runs/2026-06-07T03-31-02-579Z-task-126.md

- source: agent_fleet
- worker: Codex

## 2026-06-07T08:47:21+03:00 - Complete agent task #130: Build an app shell:

The agent fleet claimed this Codex-owned task, ran Codex CLI, ran verification, then passed the deployment gate before marking the task done.

Codex result:
STATUS: done

SUMMARY: Built and deployed the Operations app shell for task #130. Operations now uses a desktop left sidebar, mobile hamburger drawer, and section subtabs for Tasks, Students, Content, Contacts, and Accounting. Deployment `542e288f-51f1-4ee6-a905-81010e65eb0a` is live and passed smoke.

VERIFICATION:
- `node --check server.js` passed
- Inline `public/operations.html` scripts parsed
- `npm test` passed 30/30
- Local Playwright screenshots passed: desktop sidebar, mobile drawer, 390px no overflow
- `npm run openai:smoke` passed
- `npm run railway:doctor` passed
- `npm run railway:redeploy` succeeded
- `npm run app:smoke -- --require-drive` passed: `ops/live-smokes/2026-06-07T08-44-52-619Z-live-app-smoke.md`

FILES:
- `public/operations.html`
- `SYSTEM-STATE.md`
- `ops/agent-changelog.md`
- `ops/agent-task-ledger.jsonl`
- `screenshots/task130-app-shell/`

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Deployment gate:
- PASS Deployment gate for app-visible changes.
- Deployable files: agents/README.md, package.json, public/css/bna-pages.css, public/index.html, public/operations.html, public/student.html, scripts/railway-redeploy.ps1, server.js, src/lib/bna/device-control.js, src/lib/bna/goal-board.js, tasks-pending/2026-06-03-website-moments-and-parser-routing.md, tasks-pending/2026-06-05-qstudio-device-control-checklist.md, and 4 more
- PASS npm run railway:redeploy
- PASS npm run railway:doctor

Report: ops/agent-fleet-runs/2026-06-07T08-47-21-783Z-task-130.md

- source: agent_fleet
- worker: Codex

## 2026-06-07T12:09:01+03:00 - Patch task #130 Contacts acceptance miss

Codex finished the remaining UI redesign acceptance gap from Telegram task #130: Contacts now renders as compact clickable roster cards with a selected detail panel instead of the legacy dense contacts table.

Verification:
- PASS inline `public/operations.html` and `public/student.html` scripts compile
- PASS `npm test` 30/30
- PASS `npm run openai:smoke`
- PASS Railway deployment `07feaf4c-960a-4f9f-8be0-153702f31429`
- PASS `npm run app:smoke -- --require-drive`: `ops/live-smokes/2026-06-07T09-05-39-414Z-live-app-smoke.md`
- PASS targeted live Operations Contacts check: 4 contact cards, detail panel present, no legacy contacts table, no desktop horizontal overflow

- source: codex
- worker: Codex

## 2026-06-07T12:22:49+03:00 - Reconcile split Telegram UI redesign spec

Codex audited Telegram messages 425-428 as one broken-up UI redesign spec instead of treating only message 428/task #130 as the source of truth.

Changes:
- Content now uses focused subtabs: Library, Selected, Repurpose, Newsletter, Prompts, Bundles.
- Contacts now uses focused subtabs: Parents, Students, Intake, Needs Follow-up, Tags.
- Accounting now uses focused subtabs: Overview, Payments, Open/Pending, Paid, Needs Signup, Exceptions.
- Accounting Overview now shows compact totals/attention lists instead of dumping the full payment roster inline.
- The Telegram bridge now buffers split spec chunks and attaches them to the Codex implementation task as an internal task comment, preventing continuation messages from being orphaned in memory only.

Verification:
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS inline `public/operations.html` and `public/student.html` scripts compile
- PASS `npm test` 30/30
- PASS `npm run openai:smoke`
- PASS Railway deployment `c50bb6a5-5adb-4edb-ba3d-7c34b07b2684`
- PASS `npm run app:smoke -- --require-drive`: `ops/live-smokes/2026-06-07T09-22-06-026Z-live-app-smoke.md`
- PASS targeted live mobile Operations check: new Content/Contacts/Accounting subtabs present, Contacts card/detail present, Accounting Overview present, no 390px horizontal overflow

- source: codex
- worker: Codex

## 2026-06-07T12:31:26+03:00 - Correct Torah trip progress fractions for task #134

Corrected the live Torah progress data flagged from Telegram task #134. The
stored 2026-06-04 recording rows now preserve the operator's clarified daily
fractions: Eitan Chaim Golombo 100%, Amitai Kosofsky 100%, Menachem Mendel
Dratler 50%, Huda Weber 50%, and Hillel Baraka 66.67%.

Cumulative 30-unit trip progress now reflects those actual fractions instead
of a flat 15% for every student: Amitai and Eitan are 18%, Huda, Hillel, and
Menachem are 17%, group progress is 17%, and the trip remains locked. Added
`scripts/fix-torah-progress-task-134.mjs` as a repeatable dry-run/apply repair
script, made summaries prefer recomputed daily-percentage totals over stale
uniform snapshots, and hardened the trip reconciliation endpoint so multi-student
uniform overrides require `apply_uniform_to_all_students: true`.

Verification passed: `node --check server.js`,
`node --check scripts/fix-torah-progress-task-134.mjs`, `npm test` 33/33,
`npm run openai:smoke`, Railway deployment
`8b0152d8-12e3-4d40-b9c7-11ba393eea53`, Railway doctor success, live smoke
`ops/live-smokes/2026-06-07T09-30-31-386Z-live-app-smoke.md`, targeted public
Torah summary check, and an unsafe multi-student uniform reconcile negative
test returning HTTP 400.

- source: codex
- worker: Codex

## 2026-06-07T09:36:10+03:00 - Complete agent task #134: One more thing to send to I know he changed everything back the 15% for each student but that's not what the actual numbers were so before he changed it back to 15 for everyone there were two students that on Friday t...

The agent fleet claimed this Codex-owned task, ran Codex CLI, ran verification, then passed the deployment gate before marking the task done.

Codex result:
STATUS: done

SUMMARY: Corrected task #134 live Torah progress. The 2026-06-04 rows now show Eitan 100%, Amitai 100%, Menachem 50%, Huda 50%, Hillel 66.67%; public cumulative trip progress is now Amitai/Eitan 18%, Huda/Hillel/Menachem 17%, group 17%, trip locked. Deployed a guard so multi-student uniform resets require explicit `apply_uniform_to_all_students: true`, and closed live task #134 with a clean title.

VERIFICATION: `node --check server.js` passed; `node --check scripts/fix-torah-progress-task-134.mjs` passed; `npm test` passed 33/33; correction script dry-run and `--apply` succeeded; live DB/API summary verified; unsafe reset negative test returned HTTP 400; Railway deployment `8b0152d8-12e3-4d40-b9c7-11ba393eea53` succeeded; `npm run railway:doctor`, `npm run openai:smoke`, and `npm run app:smoke` passed.

FILES: `server.js`, `src/lib/bna/torah-learning.js`, `tests/torah-learning.test.js`, `scripts/fix-torah-progress-task-134.mjs`, `MEMORY.md`, `SYSTEM-STATE.md`, `ops/agent-changelog.md`, `ops/agent-task-ledger.jsonl`.

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Deployment gate:
- PASS Deployment gate for app-visible changes.
- Deployable files: agents/README.md, package.json, public/css/bna-pages.css, public/index.html, public/operations.html, public/student.html, scripts/railway-redeploy.ps1, server.js, src/lib/bna/device-control.js, src/lib/bna/goal-board.js, src/lib/bna/torah-learning.js, tasks-pending/2026-06-03-website-moments-and-parser-routing.md, and 5 more
- PASS npm run railway:redeploy
- PASS npm run railway:doctor

Report: ops/agent-fleet-runs/2026-06-07T09-36-10-385Z-task-134.md

- source: agent_fleet
- worker: Codex

## 2026-06-07T09:46:49+03:00 - Complete agent task #140: Yes absolutely if there's nothing that needs my decision or approval they should be moved along the pipeline I don't want that section to exist either there should be no pending is something that there's some sort of...

The agent fleet claimed this Codex-owned task, ran Codex CLI, ran verification, then passed the deployment gate before marking the task done.

Codex result:
STATUS: done

SUMMARY: Audited the live task queue and closed the loop on task #140. Live active tasks are now `0`; task #139 was superseded and task #140 is done. Removed the remaining visible `Open/Pending` dashboard label by renaming Accounting’s tab to `Needs Attention`, added the durable no-generic-pending rule to repo memory/agent rules, cleaned live task titles #139/#140, deployed, and verified live.

VERIFICATION: `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, `node --check scripts/agent-fleet-supervisor.mjs`, Operations inline scripts parsed, `npm test` passed 33/33, `npm run openai:smoke` passed, Railway deploy `e7f9b74b-db3f-43cf-85eb-a35aff61b21e` succeeded, Railway doctor passed, `npm run app:smoke -- --require-drive` passed at `ops/live-smokes/2026-06-07T09-43-40-789Z-live-app-smoke.md`, and authenticated live label check confirmed `Needs Attention` present with no `Open/Pending`.

FILES: `public/operations.html`, `MEMORY.md`, `AGENTS.md`, `ops/agent-changelog.md`, `ops/agent-task-ledger.jsonl`; inspected live tasks API, `server.js`, Telegram bridge, fleet supervisor.

Verification:
- PASS node --check server.js
- PASS node --check scripts/telegram-kimi-bridge.mjs
- PASS node --check scripts/agent-fleet-supervisor.mjs
- PASS npm test
- PASS npm run openai:smoke

Deployment gate:
- PASS Deployment gate for app-visible changes.
- Deployable files: agents/README.md, package.json, public/css/bna-pages.css, public/index.html, public/operations.html, public/student.html, scripts/railway-redeploy.ps1, server.js, src/lib/bna/device-control.js, src/lib/bna/goal-board.js, src/lib/bna/torah-learning.js, tasks-pending/2026-06-03-website-moments-and-parser-routing.md, and 5 more
- PASS npm run railway:redeploy
- PASS npm run railway:doctor

Report: ops/agent-fleet-runs/2026-06-07T09-46-49-191Z-task-140.md

- source: agent_fleet
- worker: Codex

## 2026-06-07T13:37:01+03:00 - Remove planned briefs from operator-facing Tasks

Completed Telegram task #145 from chat `8202155026`, message `475`.

Operations Tasks no longer exposes Planned Briefs, Pending Briefs, or
Implementation Briefs as a visible subtab, overview card, status strip, or
workload count. `tasks-pending/*.md` remains available only as internal Codex
handoff material. The operator-facing task sections are now Overview,
Decisions, My Tasks, Rabbi Tasks, Codex Queue, Changelog, and Done.

Telegram/OpenAI system snapshots no longer fetch or report pending-brief counts,
and the parser now routes "remove planned briefs" style dashboard requests to
Codex, including common speech-to-text `Kodak` wording.

Verification:
- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --check scripts/smoke-openai-sidekick.mjs`
- PASS `node --check scripts/smoke-live-app.mjs`
- PASS Operations inline scripts parsed
- PASS `npm test` 33/33
- PASS `npm run openai:smoke`
- PASS `npm run railway:redeploy`
- PASS `npm run railway:doctor` after deployment `8da4a8a1-7cf2-424b-9a5d-f4188a116b73` reached SUCCESS
- PASS `npm run app:smoke -- --require-drive`
- PASS targeted live mobile Tasks check for `section=overview` and stale
  `section=briefs`: no visible brief lane and no horizontal overflow

Reports:
- `ops/openai-smokes/2026-06-07T10-33-12-340Z-openai-sidekick-smoke.md`
- `ops/live-smokes/2026-06-07T10-33-48-070Z-live-app-smoke.md`

## 2026-06-07T16:53:00+03:00 - Signup package, payment options, and Changelog queue cleanup

Completed the operator's clarification to use the downloaded registration
documents package and not the old Student Contract file, while also simplifying
the visible Tasks structure.

Implemented:
- Operations Tasks now shows Overview, Decisions, My Tasks, and Changelog.
  Machine-owned work is routed into Changelog from queue through verification;
  old `codex`, `done`, `rabbi`, `pending`, and `queue` section URLs normalize
  into the simplified structure.
- Telegram/OpenAI Operations UI inventory now describes Changelog Queue instead
  of a separate Codex Queue.
- Imported the current registration package into
  `public/documents/bnei_neviim_registration_documents_bilingual_codex.md`,
  cleaned parent-facing content so implementation notes are not displayed, and
  removed visible registration-fee wording.
- Signup now requires a Registration Documents Package signature in addition to
  the Tuition Agreement signature. Both are tied to Parent 1 name/email and
  stored in `bna_signup_agreement_signatures`.
- Signup payment options now support credit, cash, and bank transfer. The
  default Morning payment link in code is `https://mrng.to/rCH4DWiR5t`.
- `/api/submit` now accepts `bank_transfer`, rejects unsigned package
  submissions, and refreshes a matching existing signup instead of blindly
  creating a duplicate.

Verification:
- PASS `node --check server.js`
- PASS inline script parse for Operations, English signup, Hebrew signup, and
  thank-you pages
- PASS `npm test` 33/33
- PASS `npm run openai:smoke`
- PASS local `/api/submit?dry_run=true` with bank transfer and package
  signature
- PASS missing-package dry-run rejected with HTTP 400

Deployment:
- PASS Railway production `PAYMENT_LINK` updated to
  `https://mrng.to/rCH4DWiR5t`.
- PASS Railway deployment `13fbb336-0e5a-4a9d-869e-3cd890d2d57b` reached
  SUCCESS.
- PASS Railway doctor.
- PASS `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-07T14-10-31-637Z-live-app-smoke.md`).
- PASS targeted live signup readback confirmed Registration Documents Package,
  bank transfer, and no old parent-facing wording.

## 2026-06-07T21:39:00+03:00 - Signup six-document full-screen signature flow

Completed the follow-up signup redesign so parents sign six separate documents
instead of one raw package modal or a small waiver box.

Implemented:
- Added shared `/js/signup-documents.js` document flow for English/Hebrew
  signup pages.
- Signup now shows six document cards: Tuition Agreement, Parent Handbook,
  Student Handbook / Code of Conduct, Safety Acknowledgment and Liability
  Waiver, Registration / Intake Form, and Parent Agreement / Signature Page.
- Each document opens in a large modal, full-screen on mobile, and the sign
  button stays disabled until the parent scrolls to the bottom.
- `/api/submit` now requires all six `agreement_signatures[]`, validates each
  signer against Parent 1 name/email, and stores one
  `bna_signup_agreement_signatures` row per document with server-side text
  snapshots.
- Safety waiver signature now preserves the legacy `waiver_accepted=true`
  compatibility behavior.
- Live app smoke now covers six signatures, bank transfer, missing document
  rejection, and mismatched signer rejection.

Verification:
- PASS `node --check server.js`
- PASS `node --check public/js/signup-documents.js`
- PASS English/Hebrew signup inline scripts parsed
- PASS local signup dry-run valid, missing-signature, and mismatched-signer
  checks
- PASS local mobile Playwright signup UI check
- PASS `npm test` 33/33
- PASS `npm run openai:smoke`
- PASS Railway deployment `b01730b7-3736-43eb-90ce-e3354222ed6b`
- PASS Railway doctor
- PASS `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-07T18-38-49-806Z-live-app-smoke.md`)
- PASS live mobile Playwright signup readback for English and Hebrew

## 2026-06-18T13:15:00+03:00 - Operations UI Audit Harness

Built the Operations UI audit harness on branch
`codex/operations-ui-audit-harness-clean`: added secure manual Playwright auth,
safe authenticated crawler tooling, privacy redaction, route/state maps,
detectors, reports, contact sheets, ZIP packaging, docs, tests, and gitignored
generated auth/audit artifacts.

Verification:
- PASS `node --check server.js`.
- PASS `node --check scripts/telegram-kimi-bridge.mjs`.
- PASS harness syntax checks for `tools/ops-ui-audit.js` and modules.
- PASS `npm run ops:audit:help`.
- PASS `node --test tests/ops-ui-audit-harness.test.js` 7/7.
- PASS `npm test` 771/771 in the implementation worktree before clean cherry-pick.
- PASS missing-storage behavior: audit exits with the auth instruction.
- PASS unauthenticated live login smoke: `npm run ops:audit -- smoke-login`.

Authenticated crawl status:
- Not run in this Codex environment because
  `.runtime/auth/operations-storage-state.json` is absent. The first full
  audit package requires operator-run `npm run ops:audit:auth`, then
  `npm run ops:audit`.

No deployment, product UI fix, live send, publish, payment, sync, upload,
external connector write, or real record mutation was performed.

## 2026-06-18T16:41:03+03:00 - Durable Ramble-To-Done Execution Protocol

Added the durable execution-run protocol and resume framework for giant BNA
rambles and GPT/Codex correction packets.

- Added `BNA-START-HERE.md`, `docs/BNA-RAMBLE-TO-DONE.md`, and fresh-chat /
  implementation / verification prompt templates.
- Added `ops/execution-runs/` structure, schema, `latest.json`, and initial run
  `ops/execution-runs/2026-06-18-bna-platform-completion/`.
- Added `scripts/bna-execution-run.mjs` plus package scripts
  `bna:run:init`, `bna:run:status`, `bna:run:validate`, and
  `bna:run:resume`.
- Added validator tests for duplicate IDs, invalid statuses, missing closed
  evidence, missing live evidence, missing `NEXT-SESSION.md`, and stale
  `latest.json`.
- Imported the known June 18 remediation areas as blocked, not complete, with
  blocker `Waiting for user to upload agent-review-package.zip or audit output
  path`.

Verification:

- PASS `node --check scripts/bna-execution-run.mjs`.
- PASS `node --test tests/bna-execution-run.test.js` 7/7.
- PASS `npm test` 778/778.
- PASS `npm run bna:run:validate`.

No audit crawl, watch loop, agent fleet loop, deployment, production data
mutation, or audit-harness replacement was performed.

## 2026-06-18T19:55:00+03:00 - BNA June 18 Recovery Partial Progress

Created clean recovery branch `codex/2026-06-18-bna-platform-completion` from local `master`, cherry-picked PR #2 and PR #3 as consolidated recovery commits, repaired the active execution run with 11 parent workstreams and 61 child requirements, and removed the incorrect global audit-output blocker from non-visual work.

Implemented locally:
- Public/Operations/parent PWA identity separation, scoped service workers, no public standalone redirect to Operations, and public homepage no-loader/no-gap CSS guardrail.
- Workspace taxonomy/auth foundation: workspace types are exactly `school`, `service_provider`, and `family`; `super_admin` is a role/global context; One Time maps to a service-provider workspace while retaining project compatibility.

Verification:
- PASS `npm run bna:run:validate`.
- PASS `node --test tests/pwa-identity.test.js` 6/6.
- PASS `node --test tests/workspace-scope.test.js` 5/5.
- PASS `npm test` 63/63.

Status: partial; active run must resume at `REQ-20260618-124`. No deployment or production-data mutation was performed.

## 2026-06-18T19:49:34+03:00 - Workspace ID Scoping Foundation

Implemented the local workspace-scoping foundation for `REQ-20260618-124`.

- Added canonical `bna_workspaces` schema with exactly `school`,
  `service_provider`, and `family` workspace types.
- Added idempotent nullable `workspace_id` migrations and indexes for
  workspace-owned runtime tables.
- Seeded BNA as the school workspace and One Time Mishnah Class as the
  service-provider workspace.
- Backfilled existing projects, tasks, comments, signups, payment/accounting
  rows, students, devices, Torah learning, accountability, group goals, content
  jobs, class sessions, outputs, bundles, and prompt examples into workspace
  scope.
- Updated primary create paths so new rows inherit `workspace_id` from project,
  signup, student, device, group goal, content job/output, or default BNA scope.
- Added static workspace schema/write-path tests.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/workspace-schema.test.js`.
- PASS `node --test tests/workspace-scope.test.js tests/workspace-schema.test.js`
  10/10.
- PASS `npm test` 68/68.
- PASS `npm run bna:run:validate`.

Status: partial; `REQ-20260618-124` remains `in_progress` because API
authorization filters, UI selected-workspace enforcement, negative
cross-tenant tests, deployment approval, and live smoke remain open. Resume at
`REQ-20260618-125`. No deployment, production-data mutation, audit crawl,
watch loop, or agent-fleet loop was performed.

## 2026-06-18T19:54:44+03:00 - Workspace Authorization Negative Guards

Implemented the first local server-side isolation guard batch for
`REQ-20260618-125` and partial backend negative-test coverage for
`REQ-20260618-170`.

- Added `src/lib/bna/workspace-auth.js` for shared scoped route decisions and
  direct task-row access checks.
- Wired `requireAdmin` to the shared scoped-route helper.
- Wired `assertTaskAccess` to the shared direct task-row guard so scoped users
  cannot access another project task by changing the task ID.
- Made task comments inherit `workspace_id` from their parent task/project on
  insert.
- Added focused negative tests proving scoped ordinary users cannot enumerate
  students, signups, payment intake, payments, content jobs, class sessions, or
  content bundles, while still allowing scoped task routes and safe shared
  context routes.

Verification:

- PASS `node --check src/lib/bna/workspace-auth.js`.
- PASS `node --check server.js`.
- PASS `node --test tests/workspace-scope.test.js tests/workspace-schema.test.js
  tests/workspace-auth.test.js` 16/16.
- PASS `npm test` 74/74.

Status: partial; continue `REQ-20260618-125` with HTTP/API-level negative tests
using seeded cross-workspace data and any missing route filters before moving
to `REQ-20260618-126`. No deployment, production-data mutation, audit crawl,
watch loop, or agent-fleet loop was performed.

## 2026-06-18T20:02:08+03:00 - HTTP Workspace Isolation Coverage

Completed the local HTTP/API isolation batch for `REQ-20260618-125` and moved
the backend negative-test item `REQ-20260618-170` to local
`needs_verification`.

- Made `server.js` importable for tests without starting the listener or
  running DB initialization; normal `node server.js` startup still initializes
  and listens.
- Added HTTP tests against the real Express middleware with mocked DB rows.
- Proved scoped ordinary workspace users are denied student, signup,
  accounting/payment, content, pending-brief, and agent-fleet routes before DB
  access.
- Proved a scoped user cannot read BNA task comments by changing task ID.
- Proved a scoped user can still read comments for its own One Time task.
- Removed scoped ordinary-user access to internal pending-brief and
  agent-fleet status routes.

Verification:

- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/workspace-auth.js`.
- PASS `node --check tests/workspace-http-isolation.test.js`.
- PASS `node --test tests/workspace-auth.test.js
  tests/workspace-http-isolation.test.js` 9/9.
- PASS `npm test` 77/77.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-126`.

## 2026-06-18T20:14:02+03:00 - Operations Workspace Selector Scoping

Completed the local Operations workspace selector batch for
`REQ-20260618-126` and partially started `REQ-20260618-127`.

- Added an identity-aware workspace context control in the Operations sidebar.
- Super-admin/global users now get an explicit workspace selector with
  canonical workspace type labels from `/api/bna/projects`.
- Ordinary scoped users now see a locked workspace context instead of a global
  workspace selector.
- Selected/scoped workspace now drives task loading, task project filter state,
  and task create/edit project locking.
- Scoped users no longer call the global-only agent-fleet status endpoint from
  `loadData`.
- `/api/bna/projects` now returns workspace type, key, and name metadata while
  still narrowing scoped identities to their project.
- Workspace selector changes now clear task/content project filters and reload
  scoped data; broader stale student/content/helper context cleanup remains
  open under `REQ-20260618-127`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/operations-workspace-selector.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-workspace-selector.test.js
  tests/workspace-auth.test.js tests/workspace-http-isolation.test.js` 13/13.
- PASS `npm test` 81/81.
- PASS `npm run bna:run:validate`.

Status: local `needs_verification` for `REQ-20260618-126`; no deployment,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Continue `REQ-20260618-127`.

## 2026-06-18T20:18:55+03:00 - Workspace Switch Stale Context Cleanup

Completed the local stale-context cleanup batch for `REQ-20260618-127`.

- Added `resetWorkspaceScopedUiState`.
- Workspace changes now reset the Operations shell back to Tasks / Overview.
- Cleared stale task filters, content filters, selected contact, selected
  student, student filters, selected content jobs, expanded content jobs,
  expanded prompt context, open task modal state, and task comments.
- Workspace changes now reset the URL to `view=tasks&section=overview`, remove
  stale `student` query state, persist the selected workspace, and reload
  scoped data.
- Added focused static coverage for the reset invariants in
  `tests/operations-workspace-selector.test.js`.

Verification:

- PASS `node --check tests/operations-workspace-selector.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-workspace-selector.test.js` 5/5.
- PASS `npm test` 82/82.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-128`.

## 2026-06-18T20:24:59+03:00 - Operations Module Toolbar And Sidebar Simplification

Completed the local toolbar/sidebar batch for `REQ-20260618-128` and
`REQ-20260618-129`.

- Added `renderModuleToolbar` as the single top-level Operations module
  navigation surface.
- Preserved the ordered module sequence: Tasks, Students, Content, Contacts,
  Accounting.
- Kept module visibility filtered by `allowedViews` for scoped users.
- Made the toolbar compact, sticky, and horizontally scrollable on narrow
  screens.
- Removed duplicate top-level module buttons from the sidebar.
- Reduced the sidebar to BNA Operations workspace context plus the
  super-admin selector or ordinary-user locked workspace context.
- Added focused static coverage in `tests/operations-module-toolbar.test.js`.

Verification:

- PASS `node --check tests/operations-module-toolbar.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-module-toolbar.test.js
  tests/operations-workspace-selector.test.js` 8/8.
- PASS `npm test` 85/85.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-130`.

## 2026-06-18T20:28:55+03:00 - Operations Shell Layout Stability

Completed the local collapse/minimize prevention batch for
`REQ-20260618-130`.

- Wrapped all module content in a stable `ops-view-frame`.
- Added desktop and mobile min-height safeguards for the Operations main shell.
- Added non-collapsing dimensions for containers, section navigation, focus
  panels, task lists, and div empty states.
- Added `firstAllowedView` and `ensureCurrentViewAllowed`.
- Normalized invalid or disallowed view state before `loadData`, `render`,
  `switchView`, and `openCommandTarget`.
- Added focused static coverage in `tests/operations-layout-stability.test.js`.

Verification:

- PASS `node --check tests/operations-layout-stability.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-layout-stability.test.js
  tests/operations-module-toolbar.test.js
  tests/operations-workspace-selector.test.js` 11/11.
- PASS `npm test` 88/88.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-131`.

## 2026-06-18T20:33:30+03:00 - Operations Identity And Header Alignment

Completed the local header/logo/portal identity batch for `REQ-20260618-131`.

- Added the approved BNA logo image to the Operations shell sidebar and mobile
  header.
- Added explicit Operations portal and EN language identity chips to the
  Operations shell.
- Replaced the Operations login placeholder logo with the approved BNA logo.
- Added Operations portal and EN identity chips to the Operations login card.
- Added the approved BNA logo to the Student Portal header with explicit
  Student Portal identity.
- Kept the Student Portal EN/HE language controls intact.
- Added focused coverage in `tests/operations-identity-header.test.js`.

Verification:

- PASS `node --check tests/operations-identity-header.test.js`.
- PASS Operations, Operations Login, and Student Portal script parse via
  `vm.Script`.
- PASS `node --test tests/operations-identity-header.test.js
  tests/pwa-identity.test.js` 10/10.
- PASS `npm test` 92/92.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-132`.

## 2026-06-18T20:37:34+03:00 - Operations Design Primitives

Completed the local shared design primitive batch for `REQ-20260618-132`.

- Added semantic Operations CSS tokens for background, surfaces, parchment,
  borders, text, gold, focus, radius, spacing, and shadow.
- Added a shared high-contrast surface primitive for the main Operations cards,
  panels, task rows, content cards, prompt cards, event cards, student cards,
  KPI cards, table rows, and modals.
- Added shared control primitives for button radius, minimum height, primary
  gold treatment, and focus-visible outlines.
- Added parchment project badge treatment.
- Added an Operations-app-local type guard to prevent negative letter-spacing
  drift.
- Added focused coverage in `tests/operations-design-system.test.js`.

Verification:

- PASS `node --check tests/operations-design-system.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-design-system.test.js
  tests/operations-layout-stability.test.js
  tests/operations-module-toolbar.test.js` 10/10.
- PASS `npm test` 96/96.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-133`.

## 2026-06-18T20:43:28+03:00 - Operations Mobile Controls

Completed the local intentional mobile controls batch for `REQ-20260618-133`.

- Added handheld touch-target primitives for buttons, task actions, chips,
  section tabs, module buttons, command actions, task filters, reset buttons,
  and modal close controls.
- Added horizontal touch-scroll rails and overscroll containment for dense
  module, section, task, content, contact, and modal action groups.
- Kept task-row actions aligned on one mobile rail instead of cramped wrapping.
- Made task modal footers sticky and stacked full-width on very small screens.
- Added focused coverage in `tests/operations-mobile-controls.test.js`.

Verification:

- PASS `node --check tests/operations-mobile-controls.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-mobile-controls.test.js
  tests/operations-design-system.test.js
  tests/operations-layout-stability.test.js` 10/10.
- PASS `npm test` 99/99.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-134`.

## 2026-06-18T20:47:53+03:00 - Operations Desktop Grids

Completed the local balanced desktop grids batch for `REQ-20260618-134`.

- Replaced fixed six-column command-center and pipeline grids with auto-fit
  minmax tracks that fill available desktop width without dead columns.
- Replaced uneven task overview and agent-status fractional tracks with
  balanced readable minimum widths.
- Added stable desktop minimums for section KPI, content section, student KPI,
  and student profile grids.
- Added focused coverage in `tests/operations-desktop-grids.test.js`.

Verification:

- PASS `node --check tests/operations-desktop-grids.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-desktop-grids.test.js
  tests/operations-design-system.test.js
  tests/operations-layout-stability.test.js
  tests/operations-mobile-controls.test.js` 13/13.
- PASS `npm test` 102/102.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-135`.

## 2026-06-18T20:55:09+03:00 - Operations Accessibility Semantics

Completed the local accessibility labels, focus, semantics, and modal batch for
`REQ-20260618-135`.

- Added dialog semantics, labelled/described title text, aria-hidden state, and
  an accessible close label to the task modal.
- Added explicit labels for task modal fields and task comments.
- Added modal open state, title-field focus, Escape close, and trigger focus
  restoration where possible.
- Added keyboard Enter/Space activation and accessible labels for task rows and
  content cards.
- Added pressed/current state to section, task, and content filter controls.
- Added `sr-only` and disabled-control primitives.
- Added focused coverage in `tests/operations-accessibility.test.js`.

Verification:

- PASS `node --check tests/operations-accessibility.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-accessibility.test.js
  tests/operations-design-system.test.js
  tests/operations-mobile-controls.test.js` 12/12.
- PASS `npm test` 107/107.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-136`.

## 2026-06-18T21:02:35+03:00 - Canonical Task State Model

Completed the local canonical task state model batch for `REQ-20260618-136`.

- Canonicalized task stages to `decision_required`, `ready`, `in_progress`,
  `blocked`, `done`, and `archived`.
- Updated task table creation, idempotent stage migration, and protected
  migration SQL to use the canonical check/default.
- Added server-side old-value aliases for `raw_input`, `needs_decision`,
  `assigned`, `archive`, and older parser values.
- Normalized create, list filter, patch, content-task creation, and agent queue
  paths to the canonical states.
- Updated Operations labels, task modal options, action buttons, hidden capture
  logic, and task bucketing to use canonical state values while reading old
  values safely.
- Added focused coverage in `tests/task-state-model.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/task-state-model.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/task-state-model.test.js
  tests/operations-accessibility.test.js
  tests/operations-workspace-selector.test.js` 13/13.
- PASS `npm test` 110/110.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-137`.

## 2026-06-18T21:12:45+03:00 - Task Metadata And Provenance

Completed the local task metadata/provenance separation batch for
`REQ-20260618-137`.

- Added `blocker_reason` as a first-class `bna_tasks` field in table creation,
  idempotent migration, protected migration SQL, task creation, and task patch
  paths.
- Replaced unlabeled task-card badges with labeled metadata for workspace,
  owner, status, urgency, due date, blocker, and source provenance.
- Added a task modal blocker field and a separate provenance panel derived from
  `source`, `source_context`, and `ai_parsed`.
- Kept raw ramble/source wording as provenance instead of visible task titles.
- Added focused coverage in `tests/task-metadata-provenance.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/task-metadata-provenance.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/task-metadata-provenance.test.js
  tests/task-state-model.test.js` 6/6.
- PASS `npm test` 113/113.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-138`.

## 2026-06-18T21:25:30+03:00 - Task Intake Auto-Routing And Decisions

Completed the local intake-routing and Decisions merge batch for
`REQ-20260618-138`.

- Added deterministic task-intake confidence routing: clear captures auto-file
  as structured tasks, while task-like low-confidence captures become a single
  routing Decision.
- Added low-confidence Decision options for `File as my task`, `Send to Codex`,
  and `Archive`, stored in `ai_parsed.options` with routing metadata.
- Persisted the same routing metadata from dashboard ramble capture and
  Telegram capture paths through `taskCandidateAiParsed`.
- Updated Operations Decisions so option-specific updates are honored instead
  of forcing every chosen Decision to Codex.
- Kept routing review inside the existing Decisions lane; no visible Review
  Queue or Intake Review lane was introduced.
- Added focused coverage in `tests/task-intake-routing.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/task-intake-routing.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/task-intake-routing.test.js
  tests/task-state-model.test.js
  tests/task-metadata-provenance.test.js` 9/9.
- PASS `npm test` 116/116.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-139`.

## 2026-06-18T21:38:10+03:00 - Scoped Operations Calendar

Completed the local internal calendar batch for `REQ-20260618-139`.

- Added read-only `GET /api/bna/calendar` as a scoped aggregate endpoint.
- Calendar events include task due/planned dates, class sessions, accountability
  check-ins/events, and group goal due dates.
- Allowed ordinary scoped workspace users to read only the aggregate calendar
  endpoint while keeping raw students, class-sessions, content, and accounting
  enumeration blocked.
- Added Calendar to the Operations toolbar and loaded it with the active
  workspace selector.
- Rendered overdue, today, upcoming, and recently logged groups in the
  Operations Calendar module.
- Avoided Google Calendar or broken external sync controls.
- Added focused coverage in `tests/operations-calendar.test.js` and updated the
  module-toolbar/workspace-auth expectations.

Verification:

- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/workspace-auth.js`.
- PASS `node --check tests/operations-calendar.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-calendar.test.js
  tests/operations-module-toolbar.test.js
  tests/operations-workspace-selector.test.js
  tests/workspace-auth.test.js` 17/17.
- PASS `npm test` 119/119.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-140`.

## 2026-06-18T21:48:45+03:00 - Main Task UI Diagnostic Cleanup

Completed the local stale diagnostic cleanup batch for `REQ-20260618-140`.

- Removed the agent status/heartbeat panel from the main Operations task UI.
- Removed the Changelog details block that showed agent queue status,
  heartbeat, stale worker state, and worker counts.
- Replaced `Changelog Queue` wording with plain `Changelog` activity wording.
- Removed queued worker counts and the client-side agent-fleet status fetch
  from `public/operations.html`.
- Preserved the Changelog lane as an activity/completed-work trail.
- Added focused coverage in `tests/operations-task-diagnostics.test.js`.
- Updated desktop-grid and workspace-selector tests for the intentionally
  removed diagnostics panel/fetch.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/operations-task-diagnostics.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-task-diagnostics.test.js
  tests/operations-desktop-grids.test.js
  tests/operations-workspace-selector.test.js` 10/10.
- PASS `npm test` 121/121.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-141`.

## 2026-06-18T22:02:30+03:00 - Live Scoped Task Counts And Blockers

Completed the local live scoped counts and blocker explanations batch for
`REQ-20260618-141`.

- Derived urgent, blocked, decision, my-task, and changelog counts from the
  current scoped task buckets returned by `/api/bna/tasks`.
- Added a blocked count pill to the Tasks heading when blocked scoped records
  exist.
- Added a Blocked metric in the task overview that scrolls to a Blocked Work
  section rendered from the same live task records.
- Reused `taskBlockerLabel`, `blocker_reason`, and source-context blocker
  metadata so blocked cards display the blocker explanation on the linked
  records.
- Added focused coverage in `tests/operations-live-counts-blockers.test.js`.

Verification:

- PASS `node --check tests/operations-live-counts-blockers.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-live-counts-blockers.test.js
  tests/task-metadata-provenance.test.js
  tests/operations-task-diagnostics.test.js` 7/7.
- PASS `npm test` 123/123.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-142`.

## 2026-06-18T22:20:45+03:00 - Mixed Parser Idempotency

Completed the local mixed-recording parser idempotency and workspace-routing
batch for `REQ-20260618-142`.

- Added deterministic mixed-recording `parser_item_key` metadata for tasks,
  accountability events, group-goal entries, and Torah timer events.
- Added partial unique guard indexes for mixed-recording parser item keys on
  `bna_tasks`, `bna_accountability_events`, and `bna_group_goal_entries`.
- Updated `createTaskFromText` to refresh an existing parser-linked task when
  the same parser item appears again.
- Scoped mixed-recording student matching to the content job workspace.
- Routed ambiguous mixed-recording tasks through the source job workspace
  project fallback instead of silently defaulting everything to BNA.
- Converted accountability events, group-goal entries, and Torah timer notes to
  source-key upserts. Class sessions and daily Torah entries continue using
  their existing upsert paths.
- Added focused coverage in `tests/mixed-recording-idempotency.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/mixed-recording-idempotency.test.js`.
- PASS `node --test tests/mixed-recording-idempotency.test.js
  tests/task-intake-routing.test.js tests/workspace-schema.test.js
  tests/workspace-auth.test.js` 18/18.
- PASS `npm test` 127/127.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-143`.

## 2026-06-18T22:35:15+03:00 - Community Workspace Scoping

Completed the local Community/Contacts workspace-scoping batch for
`REQ-20260618-143`.

- Added explicit `project` filtering to `GET /api/bna/signups`.
- Applied scoped/requested project filtering through workspace/project metadata
  instead of returning the full signup roster unconditionally.
- Returned project and workspace labels with signup community records.
- Updated Operations Contacts to request signups with the active workspace
  selector.
- Added visible workspace context in the Contacts header, contact cards, and
  contact detail panel.
- Added focused coverage in `tests/community-workspace-scope.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/community-workspace-scope.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/community-workspace-scope.test.js
  tests/operations-workspace-selector.test.js tests/workspace-auth.test.js`
  13/13.
- PASS `npm test` 129/129.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-144`.

## 2026-06-18T22:50:05+03:00 - Content Boundary Cleanup

Completed the local reusable Content boundary batch for `REQ-20260618-144`.

- Expanded server-side non-content filtering for class/session extraction to
  reject student progress, Torah timer, parser fallback, and accountability
  review wording.
- Changed class-session creation so raw `class_notes` presence alone is not
  enough to create reusable Content; it now requires structured reusable class
  material or a clean academic title signal.
- Stopped deterministic mixed-recording fallback from manufacturing
  `class_notes` out of task/student review output.
- Mirrored the expanded non-content filtering in the Operations Content
  renderer so cards do not show progress/timer/parser-review material as
  teaching topics.
- Added focused coverage in `tests/content-boundary.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/content-boundary.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/content-boundary.test.js
  tests/telegram-content-intent.test.js tests/mixed-recording-idempotency.test.js`
  11/11.
- PASS `npm test` 132/132.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-145`.

## 2026-06-18T22:55:30+03:00 - Content Metadata And Provenance

Completed the local Content metadata/provenance batch for
`REQ-20260618-145`.

- Added explicit `project` filtering to `GET /api/bna/content-jobs`.
- Applied scoped/requested project filtering through workspace/project metadata
  so scoped views do not receive other workspace content rows.
- Returned project/workspace labels, transcript status, parse status, output
  counts, approval counts, latest output time, and Drive/source provenance
  fields with each content job.
- Updated Operations Content loading to request jobs for the active workspace
  selector.
- Updated Content cards to show workspace, source, transcript status, output
  summary, approval state, dates, and an expanded provenance panel.
- Added focused coverage in `tests/content-metadata-provenance.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/content-metadata-provenance.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/content-metadata-provenance.test.js
  tests/content-boundary.test.js tests/community-workspace-scope.test.js` 7/7.
- PASS `npm test` 134/134.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-146`.

## 2026-06-18T23:08:45+03:00 - Content Drive Workspace Routing

Completed the local workspace-specific Drive intake/routing batch for
`REQ-20260618-146`.

- Added config-driven Drive folder resolution from
  `GOOGLE_DRIVE_PIPELINE_CONFIG` or `.secrets/google-drive-pipeline.json`.
- Added per-workspace Drive config support for BNA and One Time Mishnah Class in
  the existing Google Drive setup helper and generated config shape.
- Made content job creation and Drive metadata edits resolve workspace routing
  before writes, including rejecting known Drive-folder/project mismatches.
- Added row-level workspace access checks to direct content job/output actions.
- Scoped Content bundles by selected workspace in both API and Operations UI.
- Added visible workspace labels to newsletter bundle cards.
- Blocked mixed-workspace content jobs from being combined into bundle or
  multi-select generated outputs.
- Documented the expected per-workspace Drive config shape in `.env.example`.
- Added focused coverage in `tests/content-drive-routing.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/content-drive-routing.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/content-drive-routing.test.js
  tests/content-metadata-provenance.test.js tests/community-workspace-scope.test.js
  tests/workspace-schema.test.js` 13/13.
- PASS `npm test` 138/138.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, Drive setup route, live Drive mutation, audit crawl,
watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-147`.

## 2026-06-18T23:18:20+03:00 - Class Session Workspace Scoping

Completed the local workspace-scoped live/classes batch for
`REQ-20260618-147`.

- Added explicit `project` filtering to `GET /api/bna/class-sessions`.
- Applied scoped/requested project filtering through class-session
  workspace/project metadata.
- Returned project and workspace labels with each class-session row.
- Preserved the existing selected-workspace Calendar class-session feed, so BNA
  calendar views only show BNA class rows and remain empty when no BNA classes
  are offered.
- Added focused coverage in `tests/class-sessions-scope.test.js`.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/class-sessions-scope.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/class-sessions-scope.test.js
  tests/operations-calendar.test.js tests/workspace-schema.test.js
  tests/workspace-auth.test.js` 16/16.
- PASS `npm test` 140/140.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-148`.

## 2026-06-18T23:30:30+03:00 - Scoped Automations Status

Completed the local scoped automations/status batch for `REQ-20260618-148`.

- Added read-only `GET /api/bna/automations/status`.
- Scoped automation rows by the active Operations workspace/project filter.
- Summarized payment reminders, Green Invoice webhooks, content Drive intake,
  and Codex task automation with owner, status, last run, next run, failure
  reason, and detail counts.
- Added the Operations Automations module and wired it to `selectedProjectFilter`.
- Allowed scoped users to read only the safe automations status route while
  leaving the old agent-fleet status endpoint global-only and without mutation
  controls.
- Added focused coverage in `tests/automations-status.test.js` and updated
  workspace/module/auth tests.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/automations-status.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/automations-status.test.js tests/workspace-auth.test.js
  tests/operations-module-toolbar.test.js tests/operations-workspace-selector.test.js
  tests/workspace-http-isolation.test.js` 21/21.
- PASS `node --test tests/operations-calendar.test.js
  tests/operations-layout-stability.test.js tests/operations-task-diagnostics.test.js
  tests/operations-design-system.test.js` 12/12.
- PASS `node --test tests/operations-accessibility.test.js
  tests/operations-workspace-selector.test.js tests/automations-status.test.js`
  14/14.
- PASS `npm test` 144/144.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, payment reminder send, Green Invoice reprocess, Drive
setup route, audit crawl, watch loop, or agent-fleet loop was performed. Resume
at `REQ-20260618-149`.

## 2026-06-18T23:42:00+03:00 - Integrations Status

Completed the local simplified integrations/social-account status batch for
`REQ-20260618-149`.

- Added read-only `GET /api/bna/integrations/status`.
- Scoped integration rows by the active Operations workspace/project filter.
- Added Buffer Facebook, LinkedIn, and YouTube target rows with Connected, Not
  connected, and Error states.
- Exposed account identity, last check, needed action, failure reason, provider,
  platform, and workspace labels without exposing tokens.
- Added the Operations Integrations module and wired it to `selectedProjectFilter`.
- Replaced visible Operations Facebook approval copy that named GHL as the active
  social draft provider with connector-neutral wording.
- Documented Buffer social scheduler profile configuration in `.env.example`
  without real IDs.
- Added focused coverage in `tests/integrations-status.test.js` and updated
  workspace/module/auth tests.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/integrations-status.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/integrations-status.test.js
  tests/operations-module-toolbar.test.js tests/operations-workspace-selector.test.js
  tests/workspace-auth.test.js tests/automations-status.test.js` 22/22.
- PASS `npm test` 148/148.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, Buffer account mutation, GHL mutation, audit crawl,
watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-150`.

## 2026-06-18T23:54:00+03:00 - Workspace Users and Invitations

Completed the local workspace-scoped users/roles/invitations batch for
`REQ-20260618-150`.

- Added the `bna_workspace_invitations` schema with workspace/project, invite
  status, access level, audit, token-hash, and expiry fields.
- Added read-only `GET /api/bna/users` scoped by the active Operations
  workspace/project filter.
- Added read-only `GET /api/bna/invitations` scoped by the active Operations
  workspace/project filter.
- Added the Operations Users module showing project members, roles, access
  levels, login usernames, invitation state, inviter, and expiry.
- Allowed scoped users to read only the safe users/invitations routes while
  denying account and invitation mutations through the scoped route helper.
- Added focused coverage in `tests/users-scope.test.js` and updated
  workspace/module/auth tests.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/users-scope.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/users-scope.test.js
  tests/operations-module-toolbar.test.js
  tests/operations-workspace-selector.test.js tests/workspace-auth.test.js
  tests/workspace-schema.test.js` 22/22.
- PASS `npm test` 151/151.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, invitation send, account mutation, audit crawl, watch
loop, or agent-fleet loop was performed. Resume at `REQ-20260618-151`.

## 2026-06-18T23:58:00+03:00 - Accounting Scope and Safe Actions

Completed the local workspace payment/accounting scoping batch for
`REQ-20260618-151`.

- Added workspace/project filters and returned workspace labels on payment logs,
  payment intake, payment reminders, and Green Invoice webhook audit APIs.
- Added confirmation-gated accounting mutations for payment logging, payment
  intake capture/update/delete/reconcile, live payment reminders, and Green
  Invoice webhook reprocess.
- Added server-side record checks so signup, intake, and webhook mutations must
  match the selected/scoped accounting workspace before writes run.
- Constrained Green Invoice contact matching and unmatched-intake reuse to the
  default BNA school workspace.
- Wired Operations Accounting reads/actions to `selectedProjectFilter`, cleared
  accounting state on workspace switch, and sent confirmation tokens from UI
  actions.
- Rejected legacy GHL payment-intake sync before external mutation and kept
  intake first-party BNA-only.
- Added focused coverage in `tests/accounting-scope.test.js` and updated
  workspace auth tests for scoped accounting users.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/accounting-scope.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/accounting-scope.test.js tests/workspace-auth.test.js
  tests/workspace-http-isolation.test.js tests/operations-workspace-selector.test.js`
  19/19.
- PASS `npm test` 156/156.

Status: local `needs_verification`; no deployment, production migration,
production-data mutation, payment reminder send, Green Invoice reprocess,
legacy GHL sync, audit crawl, watch loop, or agent-fleet loop was performed.
Resume at `REQ-20260618-152`.

## 2026-06-18T23:59:30+03:00 - Student Detail Scope

Completed the local workspace-and-student detail/analysis isolation batch for
`REQ-20260618-152`.

- Added shared student-scope helpers for selected/scoped project extraction and
  student, device, accountability event, and group-goal direct-record access.
- Scoped student, device, device-rule, accountability, group-goal, and Torah
  read APIs by the active Operations workspace project where applicable.
- Guarded student create/update/delete/access-code/merge, mock-device,
  device-action/rule, Goal Board, accountability, group-goal entry, and
  Torah-learning write paths before mutating student-owned records.
- Made Torah-learning reads return an empty non-BNA scoped summary and reject
  non-BNA writes/reconciliation instead of leaking BNA-only progress records.
- Wired Operations student reads and student-adjacent actions to
  `selectedProjectFilter`.
- Added `tests/student-detail-scope.test.js` and expanded workspace-auth route
  coverage for scoped student users.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/student-detail-scope.test.js`.
- PASS `node --check tests/workspace-auth.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/student-detail-scope.test.js tests/workspace-auth.test.js
  tests/workspace-http-isolation.test.js tests/operations-workspace-selector.test.js
  tests/goal-board.test.js tests/device-control.test.js tests/torah-learning.test.js`
  54/54.
- PASS `npm test` 162/162.

Status: local `needs_verification`; no deployment, production migration,
production student merge/cleanup, production-data mutation, audit crawl, watch
loop, or agent-fleet loop was performed. Resume at `REQ-20260618-153`.

## 2026-06-19T00:08:30+03:00 - Goal Board Plain Language

Completed the local Goal Board plain-language controls batch for
`REQ-20260618-153`.

- Replaced visible tablet-access state wording with product labels such as
  Pause Access, Checkoff Only, Open, Ended, Temporary Open, Open Tablet, Keep
  Closed, and Open Temporarily.
- Replaced Goal Board form labels with plain language for missed-goal behavior,
  successful checkoff behavior, review requirements, and the Add Goal action.
- Added `deviceAccessChangeLabel` so stored access states render as readable
  summaries like `Open for 60m` instead of raw stored values.
- Grouped Goal Board card controls into horizontal purpose toolbars for Goal,
  Progress, Review, Board, Tablet setup, and Tablet access actions.
- Removed visible mock-provider/device-state phrasing from tablet setup,
  tablet card, review card, prompt, and alert copy while preserving internal
  API values.
- Added `tests/goal-board-language.test.js` to prevent unclear labels from
  returning.

Verification:

- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --check tests/goal-board-language.test.js`.
- PASS `node --test tests/goal-board-language.test.js tests/goal-board.test.js
  tests/operations-mobile-controls.test.js tests/operations-design-system.test.js`
  15/15.
- PASS `npm test` 164/164.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-154`.

## 2026-06-19T00:16:30+03:00 - Goal Board Lane Separation

Completed the local Goal Board lane-separation batch for `REQ-20260618-154`.

- Replaced the single mixed Goal Board card list with explicit lanes for
  Current Goals, Progress / Check-ins, Approvals, and History.
- Added exclusive lane assignment so waiting review items land in Approvals,
  completed goals land in History, partial progress lands in Progress /
  Check-ins, and the remaining active items stay in Current Goals.
- Added visible lane headings, counts, and lane-specific empty states.
- Kept the existing filters while rendering filtered results through the lane
  layout.
- Added `tests/goal-board-separation.test.js` for the lane renderer and lane
  assignment order.

Verification:

- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --check tests/goal-board-separation.test.js`.
- PASS `node --test tests/goal-board-separation.test.js tests/goal-board-language.test.js
  tests/goal-board.test.js tests/operations-layout-stability.test.js
  tests/operations-mobile-controls.test.js` 16/16.
- PASS `npm test` 166/166.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-155`.

## 2026-06-19 - Student Portal Hebrew localization and RTL behavior

Requirement: `REQ-20260618-155`

Changed:

- Completed Student Portal Hebrew localization coverage for the dynamic student
  experience: goal cards, command cards, tablet access summaries, dates,
  minutes, statuses, filters, empty states, buttons, save confirmations, and
  fallback errors now route through the localization helpers.
- Added RTL-specific portal CSS so Hebrew mode flips document direction,
  progress fills from the right, Hebrew labels avoid uppercase letter tracking,
  and the private access-code field remains LTR for reliable copy/paste.
- Added `tests/student-portal-i18n.test.js` to guard complete Hebrew label
  coverage, RTL hooks, localized dynamic-card rendering, tablet status labels,
  and localized save/error messages.

Verification:

- PASS `node --test tests/student-portal-i18n.test.js` 3/3.
- PASS `npm test` 169/169.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. `REQ-20260618-156`
remains blocked on operator approval for production duplicate-student cleanup;
resume at `REQ-20260618-157`.

## 2026-06-19 - Operations Assistant shell

Requirement: `REQ-20260618-157`

Changed:

- Added one read-only `/api/bna/assistant/status` endpoint returning a single
  `BNA Assistant` identity, OpenAI provider readiness, selected workspace
  scope, visible capabilities, and disabled-until-verified guardrails without
  returning secrets.
- Added one Assistant module to the Operations toolbar and render flow, loaded
  through the active workspace filter and shown as one `BNA Assistant` shell.
- Allowed scoped users to read Assistant status while keeping POST/action
  execution denied for the later helper action, confirmation, and audit-log
  requirements.
- Added `tests/assistant-shell.test.js` and updated toolbar/workspace-auth
  tests to guard the single visible assistant identity and safe read-only route.

Verification:

- PASS `node --test tests/assistant-shell.test.js tests/operations-module-toolbar.test.js tests/workspace-auth.test.js` 14/14.
- PASS `npm test` 172/172.

Status: local `needs_verification`; no OpenAI call, deployment,
production-data mutation, audit crawl, watch loop, or agent-fleet loop was
performed. Resume at `REQ-20260618-158`.

## 2026-06-19 - Scoped Assistant memory context

Requirement: `REQ-20260618-158`

Changed:

- Added the scoped `bna_assistant_memory` table and migration coverage for
  workspace, project, user key, role, surface, module, subject type, subject ID,
  memory key, metadata, and exact-scope uniqueness.
- Added a read-only `/api/bna/assistant/memory` route that resolves project
  access through the shared workspace auth layer and filters memory by the
  exact assistant context before returning rows.
- Wired Operations Assistant to load memory through the selected workspace
  filter and render a Memory Scope panel showing project, user, role, subject,
  and scoped memory rows.
- Expanded assistant, workspace schema, and workspace-auth tests to guard the
  scoped memory table, exact SQL filters, read-only scoped access, and UI load.

Verification:

- PASS `node --test tests/assistant-shell.test.js tests/workspace-schema.test.js tests/workspace-auth.test.js tests/operations-workspace-selector.test.js` 22/22.
- PASS `npm test` 173/173.

Status: local `needs_verification`; no OpenAI call, helper action execution,
deployment, production-data mutation, audit crawl, watch loop, or agent-fleet
loop was performed. Resume at `REQ-20260618-159`.

## 2026-06-19 - Permissioned Assistant action registry

Requirement: `REQ-20260618-159`

Changed:

- Added `ASSISTANT_ACTION_REGISTRY` for existing read-only and mutating app
  actions with module view, method/route, risk level, confirmation token where
  applicable, audit requirement, and execution status.
- Added `/api/bna/assistant/actions` to return only the registry rows permitted
  for the current role/workspace view.
- Added a guarded `/api/bna/assistant/actions/:actionKey` execution route that
  validates registration and permission but refuses mutation until REQ-160
  confirmation tiers and action audit logs exist.
- Wired Operations Assistant to load and render an Action Registry card through
  the selected workspace filter without adding execution buttons.
- Added `tests/assistant-actions.test.js` and updated assistant/workspace-auth
  tests for registry route access, UI load, and the guarded execution rule.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/assistant-actions.test.js`.
- PASS `node --test tests/assistant-actions.test.js tests/assistant-shell.test.js tests/workspace-auth.test.js tests/operations-workspace-selector.test.js` 21/21.
- PASS `npm test` 177/177.

Status: local `needs_verification`; no OpenAI call, helper action execution,
deployment, production-data mutation, audit crawl, watch loop, or agent-fleet
loop was performed. Resume at `REQ-20260618-160`.

## 2026-06-19 - Assistant confirmation tiers and action audit trail

Requirement: `REQ-20260618-160`

Changed:

- Added `bna_assistant_action_audit` with workspace/project/requester/action,
  target, risk, confirmation, before/after summary, result, metadata, and
  startup/migration/index coverage.
- Added Assistant confirmation tiers for read-only, low/content mutation,
  publishing, financial, permission, and destructive action classes.
- Reworked `/api/bna/assistant/actions/:actionKey` to resolve scoped context,
  require the right confirmation token, write confirmation-required/denied/
  executed/failed audit rows, and return audit IDs.
- Added explicit audited handlers for read-only action acknowledgements,
  assistant-created tasks, and assistant task comments. Unimplemented registered
  mutations fail closed with an audit row.
- Updated action tests and workspace schema tests for confirmation tiers,
  audit fields, audit writes, and explicit handler boundaries.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/assistant-actions.test.js`.
- PASS `node --test tests/assistant-actions.test.js tests/assistant-shell.test.js tests/workspace-schema.test.js tests/workspace-auth.test.js tests/operations-workspace-selector.test.js` 27/27.
- PASS `npm test` 178/178.

Status: local `needs_verification`; no OpenAI call, live helper action
execution, deployment, production-data mutation, audit crawl, watch loop, or
agent-fleet loop was performed. Resume at `REQ-20260618-161`.

## 2026-06-19 - Assistant product-language cleanup

Requirement: `REQ-20260618-161`

Changed:

- Removed duplicate helper/provider/developer language from the visible Operations Assistant module while keeping one BNA Assistant identity.
- Changed user-facing Codex routing labels to System Work for task ownership and low-confidence intake Decisions.
- Preserved internal `Codex` owner values and `assigned_to` compatibility for existing machine-work records.
- Added `tests/assistant-language-cleanup.test.js` to prevent the duplicate helper/dev-language labels from returning.

Verification:

- PASS rg duplicate helper/dev-language patterns in public/server product sources with no matches.
- PASS `node --check server.js`.
- PASS `node --check tests/assistant-language-cleanup.test.js`.
- PASS `node --test tests/assistant-language-cleanup.test.js tests/assistant-shell.test.js tests/task-intake-routing.test.js tests/assistant-actions.test.js` 14/14.
- PASS `npm test` 180/180.

Status: local `needs_verification`; no OpenAI call, live helper action execution, deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-162`.

## 2026-06-19 - Assistant public/authenticated memory isolation

Requirement: `REQ-20260618-162`

Changed:

- Required the Assistant view before scoped users can read Assistant status, memory, or action registry routes.
- Added Assistant memory permission checks for Operations-only surface plus module and subject-specific views before querying `bna_assistant_memory`.
- Redacted raw Assistant memory `user_key` from client-facing scope and displayed a current-user session scope in Operations.
- Added private no-store headers to Assistant routes and no-store fetch behavior to Operations API requests.
- Added `tests/assistant-memory-isolation.test.js` for permission, redaction, header, and public/no-auth database non-access coverage.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/assistant-memory-isolation.test.js`.
- PASS `node --test tests/assistant-memory-isolation.test.js tests/assistant-shell.test.js tests/workspace-auth.test.js tests/assistant-actions.test.js tests/workspace-http-isolation.test.js` 26/26.
- PASS `npm test` 186/186.

Status: local `needs_verification`; no OpenAI call, live helper action execution, deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-163`.

## 2026-06-19 - Public navigation private Operations-link guard

Requirement: `REQ-20260618-163`

Changed:

- Verified the public homepage primary navigation does not advertise private Operations login.
- Verified shared public pages and nav/content scripts contain no private Operations links or Operations login labels.
- Preserved private `/operations` and `/operations-login.html` routes for the Operations app.
- Added `tests/public-navigation.test.js` to keep private Operations links out of public navigation and public page sources.

Verification:

- PASS rg /operations and Operations login strings across public prospect pages with no matches.
- PASS `node --check tests/public-navigation.test.js`.
- PASS `node --test tests/public-navigation.test.js tests/pwa-identity.test.js tests/operations-identity-header.test.js` 13/13.
- PASS `npm test` 189/189.

Status: local `needs_verification`; no deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-164`.

## 2026-06-19 - Provider free-listing CTA

Requirement: `REQ-20260618-164`

Changed:

- Added a homepage provider section headed "Advertise your program for free" with a matching WhatsApp CTA.
- Explained that free listings can include Torah classes, chugim, tutoring, mentoring, homeschool support, family resources, and youth services.
- Clarified what parents see in a listing and that basic community listings are free, while paid promotions/special placements are separate.
- Added English/Hebrew translation keys and responsive layout styling.
- Added `tests/public-provider-cta.test.js` for the provider CTA, translation keys, responsive layout, and no private Operations links.

Verification:

- PASS `node --check tests/public-provider-cta.test.js`.
- PASS public homepage inline script parse (1 script block).
- PASS `node --test tests/public-provider-cta.test.js tests/public-navigation.test.js tests/pwa-identity.test.js` 11/11.
- PASS `npm test` 191/191.

Status: local `needs_verification`; no deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-165`.

## 2026-06-19 - Parent signup six-month offer

Requirement: `REQ-20260618-165`

Changed:

- Added direct parent signup and self-governance copy to the English and Hebrew signup pages.
- Made the parent app offer consistently say six months free and state that paid continuation requires a separate parent decision.
- Repeated the parent app offer on the signup thank-you confirmation in English and Hebrew.
- Updated the parent PWA manifest description to match the direct-signup, self-governance, six-month offer copy.
- Added `tests/public-parent-offer.test.js` for signup, thank-you, manifest, and one-year-offer drift coverage.

Verification:

- PASS `node --check tests/public-parent-offer.test.js`.
- PASS signup and thank-you inline script parse via `vm.Script` (3 script blocks).
- PASS `node --test tests/public-parent-offer.test.js tests/public-provider-cta.test.js tests/public-navigation.test.js tests/pwa-identity.test.js tests/operations-identity-header.test.js` 19/19.
- PASS `npm test` 195/195.

Status: local `needs_verification`; no deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-166`.

## 2026-06-19 - Portal header identity coverage

Requirement: `REQ-20260618-166`

Changed:

- Normalized the English signup header to use the shared `nav-actions` wrapper instead of inline action styling.
- Extended portal identity tests to cover the parent PWA launching into the public signup header pattern.
- Extended provider-listing tests to prove provider CTAs stay under the public homepage header and do not introduce a private Operations header.
- Preserved existing coverage for Operations shell/login, Student Portal, public, signup, and manifest separation.

Verification:

- PASS `node --check tests/operations-identity-header.test.js`.
- PASS portal/header inline script parse via `vm.Script` (6 script blocks across public/signup/Operations/student/login pages).
- PASS `node --test tests/operations-identity-header.test.js tests/pwa-identity.test.js tests/public-navigation.test.js tests/public-parent-offer.test.js tests/public-provider-cta.test.js` 21/21.
- PASS `npm test` 197/197.

Status: local `needs_verification`; no deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-167`.

## 2026-06-19 - Public route and CTA integrity

Requirement: `REQ-20260618-167`

Changed:

- Added clean no-store server aliases for `/signup`, `/signup-he`, `/signup-thank-you`, and `/student` alongside existing blog/FAQ routes.
- Switched homepage signup CTAs, shared blog signup CTA data, signup language links, thank-you redirects, signup email links, and generated student portal links to clean public routes.
- Added `/signup` to the sitemap and kept private Operations/student app-shell routes out of public CTA paths.
- Added `tests/public-route-cta-integrity.test.js` for route aliases, public CTAs, parent PWA launch, signup email links, student portal links, and sitemap coverage.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/public-route-cta-integrity.test.js`.
- PASS public route inline script parse via `vm.Script` (10 script blocks).
- PASS `node --test tests/public-route-cta-integrity.test.js tests/public-navigation.test.js tests/pwa-identity.test.js tests/operations-identity-header.test.js tests/public-parent-offer.test.js tests/public-provider-cta.test.js` 26/26.
- PASS `npm test` 202/202.

Status: local `needs_verification`; no deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-168`.

## 2026-06-19 - Guarded test-data seed lifecycle

Requirement: `REQ-20260618-168`

Changed:

- Added `scripts/bna-test-data.mjs` with plan, seed, seed dry-run, cleanup dry-run, and cleanup commands for isolated `TEST-BNA-SEED` fixture records.
- Covered workspaces, users, students, tasks, decisions, events, content, communities, accounting, automations, integrations, live classes, Hebrew goals, helper memory, and helper action audit rows.
- Added package scripts for the test-data lifecycle and `tests/test-data-seed-script.test.js` for safety rails, lane coverage, cleanup ordering, helper-action audit rows, and Hebrew fixture coverage.
- Kept real mutation guarded by `BNA_TEST_DATA_ALLOW=1`, a provided `DATABASE_URL`, a database name containing `test`, and non-production-looking database targets.

Verification:

- PASS `node --check scripts/bna-test-data.mjs`.
- PASS `node --check tests/test-data-seed-script.test.js`.
- PASS `npm run test:data:plan`.
- PASS `node --test tests/test-data-seed-script.test.js tests/bna-execution-run.test.js` 13/13.

Status: local `done`; no deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-169`.

## 2026-06-19 - Focused browser acceptance coverage

Requirement: `REQ-20260618-169`

Changed:

- Added a shared Operations route-state helper so module, workspace, and student route changes write one consistent URL shape.
- Changed user-triggered module, workspace, task-section, and student navigation to push browser history entries.
- Added a Back/Forward `popstate` handler that rehydrates Operations route state from the URL and reloads scoped data.
- Added `tests/browser-acceptance.test.js`, a focused Playwright test that serves the real Express/static runtime and mocks only API JSON responses.
- Updated `tests/operations-workspace-selector.test.js` to guard the shared route helper and popstate listener.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS Operations HTML inline script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/browser-acceptance.test.js` 2/2.
- PASS `node --test tests/browser-acceptance.test.js tests/operations-workspace-selector.test.js tests/assistant-shell.test.js tests/student-portal-i18n.test.js` 14/14.

Status: local `done`; no audit harness rebuild, baseline crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-170`.

## 2026-06-19 - Backend API RBAC negative-test verification

Requirement: `REQ-20260618-170`

Changed:

- Closed the existing backend/API/RBAC negative-test requirement locally after verifying the current guard coverage.
- Expanded the recorded evidence to include users/invitations endpoint scoping and accounting read/mutation scoping, in addition to route guard and real HTTP middleware isolation tests.

Verification:

- PASS `node --test tests/workspace-auth.test.js tests/workspace-http-isolation.test.js tests/users-scope.test.js tests/accounting-scope.test.js` 20/20.
- PASS `npm test` 209/209.

Status: local `done`; no deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at `REQ-20260618-119`.

## 2026-06-19 - Active run source-of-truth reconciliation

Requirement: `REQ-20260618-114`

Changed:

- Updated `SYSTEM-STATE.md` to open with the active June 18 recovery run, branch,
  audit-only blockers, release gate, guarded test-data lifecycle, and browser
  acceptance coverage.
- Updated `TASKS.md` so the current top task resumes the active run immediately
  and no longer says unrelated work waits for the audit ZIP/output path.
- Updated `MEMORY.md` to supersede old GHL runtime direction with first-party
  BNA Operations/Buffer guidance and to clarify that audit output blocks only
  screenshot-specific audit package/comparison requirements.
- Refreshed `ops/execution-runs/latest.json`, run status, evidence, test
  results, and next-session notes for the locally closed requirement.

Verification:

- PASS targeted `rg` checks for active-run, audit-only, and first-party runtime
  language.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: local `done`; no app code changed, and no deployment, production-data
mutation, audit crawl, watch loop, or agent-fleet loop was performed. Resume at
`REQ-20260618-124`.

## 2026-06-19 - Content workspace scoping hardening

Requirement: `REQ-20260618-124`

Changed:

- Added selected-project content assertions for content jobs, bundles, bulk
  generation, content outputs, prompt examples, and mixed-recording parse
  actions.
- Hardened content job and bundle updates so row writes include workspace
  predicates after access checks.
- Threaded the active Operations workspace into content write/generate/approve,
  bundle create/archive, prompt-example, manual job, status, and parse payloads.
- Extended `tests/content-drive-routing.test.js` to cover the new server-side
  content project checks and Operations content payload scoping.

Verification:

- PASS `node --check server.js`.
- PASS `node --check tests/content-drive-routing.test.js`.
- PASS Operations HTML inline script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/content-drive-routing.test.js tests/workspace-schema.test.js tests/workspace-scope.test.js tests/operations-workspace-selector.test.js tests/workspace-auth.test.js tests/workspace-http-isolation.test.js` 32/32.
- PASS `npm test` 209/209.

Status: local `needs_verification`; no deployment, production-data mutation,
audit crawl, watch loop, or agent-fleet loop was performed. Release approval
and live smoke are still required before this live-required item can close.

## 2026-06-19 - Test coverage parent rollup

Requirement: `REQ-20260618-111`

Changed:

- Closed the non-live safe test data and complete acceptance coverage parent
  after verifying all child requirements are terminal with evidence:
  `REQ-20260618-168`, `REQ-20260618-169`, `REQ-20260618-170`, and
  `REQ-20260618-171`.
- Recorded parent rollup evidence in the active execution run and removed the
  parent from `latest.json` remaining IDs.

Verification:

- PASS `node --test tests/test-data-seed-script.test.js tests/browser-acceptance.test.js tests/workspace-auth.test.js tests/workspace-http-isolation.test.js tests/users-scope.test.js tests/accounting-scope.test.js tests/pwa-identity.test.js` 33/33.
- PASS `npm test` 209/209.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: local `done`; no deployment, production-data mutation, audit crawl,
watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Audit parent blocker rollup

Requirement: `REQ-20260618-101`

Changed:

- Marked the audit harness/package parent as `blocked`, because all
  non-audit/protocol children are closed and the remaining audit work depends
  on missing authenticated audit package/output.
- Corrected `REQ-20260618-118` so the post-fix audit comparison is explicitly
  audit-output-dependent.
- Recorded that this blocker is limited to screenshot/audit-package work and
  must not pause unrelated local implementation.

Verification:

- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `blocked`; no audit crawl, deployment, production-data mutation, watch
loop, or agent-fleet loop was performed.

## 2026-06-19 - Workspace selector scoped-user browser proof

Requirement: `REQ-20260618-126`

Changed:

- Added a Playwright acceptance path for a scoped One Time workspace member.
- Verified the scoped login sees locked workspace context, no global workspace
  selector, One Time task/calendar API scoping, and mobile overflow safety.
- Marked the requirement locally complete pending release/deploy/live-smoke
  verification, not `done`.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/browser-acceptance.test.js tests/operations-workspace-selector.test.js tests/workspace-auth.test.js tests/workspace-http-isolation.test.js` 21/21.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Community Contacts browser proof

Requirement: `REQ-20260618-143`

Changed:

- Added scoped signup fixtures to the Operations browser acceptance flow.
- Verified Contacts requests signups with the selected One Time workspace
  project after a workspace switch.
- Verified the Contacts header/card/detail render the selected service-provider
  workspace labels and exclude the BNA contact fixture.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/community-workspace-scope.test.js tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Mixed parser idempotency refreshed proof

Requirement: `REQ-20260618-142`

Changed:

- Refreshed the local evidence for the already-implemented mixed-recording
  parser idempotency work.
- Verified deterministic parser item keys, scoped student matching, task update
  instead of duplicate insert, and non-task lane upserts remain covered.

Verification:

- PASS `node --test tests/mixed-recording-idempotency.test.js tests/task-intake-routing.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Task live counts/blockers browser proof

Requirement: `REQ-20260618-141`

Changed:

- Added a blocked task fixture to the Operations browser acceptance flow.
- Verified the rendered task overview shows live scoped counts for urgent/today,
  Decisions, and blocked task buckets.
- Verified the blocked metric/status pill link to a visible Blocked Work record
  with the blocker explanation shown.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/operations-live-counts-blockers.test.js tests/operations-task-diagnostics.test.js tests/browser-acceptance.test.js` 7/7.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Task diagnostics cleanup browser proof

Requirement: `REQ-20260618-140`

Changed:

- Added browser acceptance proof for the rendered main task view.
- Verified Queue Health, Track Agent Work, Handoff Files, Do Not Restart,
  proof-gap, agent queue, worker diagnostic, and heartbeat diagnostic concepts
  are absent from the task surface.
- Verified the Changelog subtab remains visible and opens as a normal activity
  trail without worker diagnostic copy.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/operations-task-diagnostics.test.js tests/operations-calendar.test.js tests/browser-acceptance.test.js` 8/8.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Internal Calendar browser proof

Requirement: `REQ-20260618-139`

Changed:

- Expanded the Operations browser fixture to include task, class, check-in,
  student event, and group-goal calendar items.
- Verified the rendered Calendar module shows every required event family from
  scoped fixture data.
- Verified the rendered page has no Google Calendar, sync calendar, or connect
  calendar controls.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/operations-calendar.test.js tests/task-intake-routing.test.js tests/browser-acceptance.test.js` 9/9.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Task intake routing browser proof

Requirement: `REQ-20260618-138`

Changed:

- Added a low-confidence intake routing fixture to the Operations browser
  acceptance flow.
- Verified the rendered Decisions lane shows File as my task, Send to System
  Work, and Archive actions with no Review Queue or Intake Review surface.
- Verified clicking Send to System Work sends the option-specific PATCH payload
  for stage, decision_required, assigned_to, category, and decision notes.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/task-intake-routing.test.js tests/task-state-model.test.js tests/browser-acceptance.test.js` 9/9.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Task metadata/provenance browser proof

Requirement: `REQ-20260618-137`

Changed:

- Added browser acceptance fixture metadata for blocker, due date, raw ID, source,
  and raw operator wording.
- Verified task row badges show labeled Owner/Status/Urgency/Due/Blocker/Source
  metadata while raw wording stays out of visible title/text.
- Verified the task modal keeps concise title and blocker fields separate from
  provenance, with Source and Raw ID shown in the provenance panel.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/task-metadata-provenance.test.js tests/task-state-model.test.js tests/browser-acceptance.test.js` 9/9.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Canonical task state browser proof

Requirement: `REQ-20260618-136`

Changed:

- Added a legacy `needs_decision` task fixture to the browser acceptance flow.
- Verified the legacy alias renders in Decisions with canonical
  `Status: Decision` metadata and decision actions.
- Verified the task modal normalizes the alias to `decision_required`, checks
  Decision Required, and exposes only the six canonical stage options.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/task-state-model.test.js tests/operations-accessibility.test.js tests/browser-acceptance.test.js` 11/11.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Operations accessibility DOM proof

Requirement: `REQ-20260618-135`

Changed:

- Added browser acceptance assertions for keyboard task-row activation and
  rendered task-dialog accessibility.
- Verified role/aria modal metadata, sr-only description, accessible close
  label, active section tab pressed/current state, and focus restoration after
  Escape.
- Fixed task edit modal focus loss after asynchronous task-comment loading
  re-rendered the dialog.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/operations-accessibility.test.js tests/operations-design-system.test.js tests/browser-acceptance.test.js` 12/12.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Operations desktop grids DOM proof

Requirement: `REQ-20260618-134`

Changed:

- Added browser acceptance assertions for rendered desktop Operations grids.
- Verified task overview grid tracks and cards are multiple, readable, and
  balanced at desktop width.
- Verified the student profile grid resolves to two balanced readable tracks,
  while collapsed auto-fit tracks are ignored in the balance calculation.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/operations-desktop-grids.test.js tests/operations-layout-stability.test.js tests/browser-acceptance.test.js` 9/9.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Operations mobile controls DOM proof

Requirement: `REQ-20260618-133`

Changed:

- Added browser acceptance assertions for rendered mobile Operations controls.
- Verified mobile module and section rails are scroll-capable with touch-safe
  controls.
- Verified the Decisions lane renders touch-safe filters and nowrap task-row
  actions.
- Verified the task modal footer stays sticky, stacks full-width content-box
  actions on small screens, and keeps the close control touch-safe.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/operations-mobile-controls.test.js tests/operations-design-system.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Operations design-system DOM proof

Requirement: `REQ-20260618-132`

Changed:

- Added browser acceptance assertions for rendered Operations design-system
  primitives.
- Verified rendered focus panels and metric/module controls resolve the shared
  surface, border, text, radius, focus, and gold tokens.
- Verified mobile touch target overrides preserve the shared control primitive
  and app-shell letter spacing is non-negative.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/operations-design-system.test.js tests/operations-layout-stability.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Portal identity DOM proof

Requirement: `REQ-20260618-131`

Changed:

- Added rendered DOM checks for the Operations shell manifest, approved BNA
  logo, BNA Operations/private portal identity, and EN language text.
- Added rendered DOM checks for the Student Portal approved logo, brand,
  Student Portal identity, and EN/HE language controls.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/operations-identity-header.test.js`.
- PASS `node --test tests/operations-identity-header.test.js tests/pwa-identity.test.js tests/browser-acceptance.test.js` 15/15.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Operations shell stability browser proof

Requirement: `REQ-20260618-130`

Changed:

- Added a browser assertion that checks the Operations shell and active view
  frame stay visible and non-collapsed.
- Exercised the assertion after mobile/desktop viewport changes, module
  changes, student-profile navigation, history back/forward, workspace switch,
  and page reload.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/operations-layout-stability.test.js`.
- PASS `node --test tests/operations-layout-stability.test.js tests/operations-module-toolbar.test.js tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 14/14.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Operations sidebar simplification DOM proof

Requirement: `REQ-20260618-129`

Changed:

- Added browser assertions that the Operations sidebar contains exactly one
  workspace context control.
- Verified the sidebar has no duplicate module buttons or sidebar nav.
- Verified scoped One Time users do not see `All workspaces` / global
  workspace-directory UI.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/operations-module-toolbar.test.js`.
- PASS `node --test tests/operations-module-toolbar.test.js tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 11/11.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Operations toolbar DOM proof

Requirement: `REQ-20260618-128`

Changed:

- Added a browser helper that reads visible Operations module toolbar labels.
- Verified super-admin sees the full expected module order in the DOM.
- Verified a scoped One Time workspace member sees only allowedViews-filtered
  toolbar buttons.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/operations-module-toolbar.test.js`.
- PASS `node --test tests/operations-module-toolbar.test.js tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 11/11.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Workspace switch stale-context reset proof

Requirement: `REQ-20260618-127`

Changed:

- Expanded the workspace-switch reset test to explicitly guard calendar,
  Assistant status, Assistant memory, Assistant actions, content filters, and
  student filters.
- Added browser acceptance assertions that switching workspace from a student
  profile returns to Tasks overview, drops the stale student route parameter,
  removes the student profile panel, and reloads One Time scoped task data.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/operations-workspace-selector.test.js`.
- PASS `node --test tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 8/8.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data
mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Content boundary browser proof

Requirement: `REQ-20260618-144`

Changed:

- Added a browser acceptance Content fixture with reusable Mishnah teaching material and filtered task/accountability/progress/timer/parser-review noise.
- Verified the Operations Content view requests the selected One Time workspace and displays teaching topics, questions, sources, and highlights while excluding non-content phrases.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/content-boundary.test.js tests/telegram-content-intent.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Content provenance browser proof

Requirement: `REQ-20260618-145`

Changed:

- Extended the browser Content fixture with workspace/project, Drive, transcript, parse, output, approval, source-message, media, and local-capture metadata.
- Verified the expanded Operations Content card renders compact metadata plus the Content provenance panel for the selected One Time workspace.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/content-metadata-provenance.test.js tests/content-boundary.test.js tests/browser-acceptance.test.js` 8/8.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Content Drive routing browser proof

Requirement: `REQ-20260618-146`

Changed:

- Added browser proof that the Content module requests both content jobs and content bundles using the selected One Time workspace project.
- Verified the selected Content card shows One Time Drive folder/file provenance and does not leak the BNA Drive folder.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/content-drive-routing.test.js tests/content-metadata-provenance.test.js tests/browser-acceptance.test.js` 9/9.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, Drive setup route, or live Drive mutation was performed.

## 2026-06-19 - Live class workspace browser proof

Requirement: `REQ-20260618-147`

Changed:

- Added a BNA-only class fixture outside the One Time workspace scope.
- Verified the selected One Time Calendar requests the scoped project, shows the One Time class-session item with workspace label, and excludes the BNA-only class fixture.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/class-sessions-scope.test.js tests/operations-calendar.test.js tests/browser-acceptance.test.js` 8/8.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Automations status browser proof

Requirement: `REQ-20260618-148`

Changed:

- Added One Time and BNA automation status fixtures to the browser acceptance harness.
- Verified the One Time Automations module requests scoped status rows and renders owner, status, last run, next run, failure reason, detail counts, and workspace labels while excluding BNA rows.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/automations-status.test.js tests/operations-module-toolbar.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Integrations status browser proof

Requirement: `REQ-20260618-149`

Changed:

- Added scoped One Time Buffer integration fixtures for connected, not connected, and error states plus a BNA fixture for leakage checks.
- Verified the Integrations panel renders account identity, last check, needed action, failure reason, and workspace labels without active GHL social-runtime copy.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/integrations-status.test.js tests/operations-module-toolbar.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, or external account mutation was performed.

## 2026-06-19 - Workspace users browser proof

Requirement: `REQ-20260618-150`

Changed:

- Added scoped One Time and BNA user/invitation fixtures to the browser acceptance harness.
- Verified the Users panel requests selected-workspace users and invitations, renders member/access/login/invitation details, excludes BNA rows, and exposes no mutation/send controls.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/users-scope.test.js tests/operations-module-toolbar.test.js tests/browser-acceptance.test.js` 9/9.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, invitation send, or account mutation was performed.

## 2026-06-19 - Accounting scope browser proof

Requirement: `REQ-20260618-151`

Changed:

- Added scoped One Time and BNA payment, payment-intake, reminder, and Green Invoice webhook fixtures to the browser acceptance harness.
- Verified the Accounting panel requests selected-workspace accounting APIs, renders payment/intake summary counts and row details, excludes BNA rows, and exposes no send/reprocess/payment mutation during the proof.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/accounting-scope.test.js tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 12/12.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, payment send, Green Invoice reprocess, or accounting mutation was performed.

## 2026-06-19 - Student workspace isolation browser proof

Requirement: `REQ-20260618-152`

Changed:

- Added separate One Time student, parent, goal, and device fixtures to the browser acceptance harness.
- Verified the Students module reloads under the selected One Time workspace, requests student/detail-adjacent APIs with the selected project, renders only One Time student/profile/goal/device details, and excludes the old BNA student detail after workspace switch and reload.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/student-detail-scope.test.js tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 13/13.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, duplicate-student merge, or student mutation was performed.

## 2026-06-19 - Goal Board language browser proof

Requirement: `REQ-20260618-153`

Changed:

- Added rendered browser proof for the One Time Goal Board and Tablet Access views.
- Verified missed-goal/checkoff labels, Add Goal, progress/review/board toolbars, tablet review actions, and tablet access controls use plain product language while old internal/mock/provider labels remain absent.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/goal-board-language.test.js tests/goal-board.test.js tests/operations-workspace-selector.test.js tests/browser-acceptance.test.js` 16/16.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, or tablet/device mutation was performed.

## 2026-06-19 - Goal Board lane separation browser proof

Requirement: `REQ-20260618-154`

Changed:

- Added rendered browser proof for the Goal Board lane headings, counts, empty states, and pending review placement.
- Verified the selected One Time Goal Board keeps pending-review work in Approvals instead of mixing it into Current Goals, Progress / Check-ins, or History.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/goal-board-separation.test.js tests/goal-board-language.test.js tests/goal-board.test.js tests/browser-acceptance.test.js` 13/13.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, or tablet/device mutation was performed.

## 2026-06-19 - Student Portal Hebrew RTL browser proof

Requirement: `REQ-20260618-155`

Changed:

- Added rendered browser proof for Student Portal HE mode.
- Verified RTL document/body direction, LTR access-code entry, Hebrew dynamic command/action/detail labels, absence of English fallback labels, and mobile overflow safety.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/student-portal-i18n.test.js tests/browser-acceptance.test.js` 6/6.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, agent-fleet loop, or student mutation was performed. REQ-20260618-156 remains blocked on operator approval, so resume unblocked local work at REQ-20260618-157.

## 2026-06-19 - Assistant shell browser proof

Requirement: `REQ-20260618-157`

Changed:

- Added rendered browser proof for the Operations Assistant shell.
- Verified exactly one Assistant module and one BNA Assistant shell, connected AI readiness, scoped memory/action registry context, and absence of duplicate Codex/Kimi/helper persona labels.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/assistant-shell.test.js tests/assistant-language-cleanup.test.js tests/browser-acceptance.test.js` 9/9.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no OpenAI call, audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Assistant memory scope browser proof

Requirement: `REQ-20260618-158`

Changed:

- Added rendered browser proof that Assistant status, memory, and action routes reload under the selected One Time workspace project.
- Verified Memory Scope displays project/session/role/subject context and scoped memory rows without exposing raw user keys or test usernames.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --test tests/assistant-memory-isolation.test.js tests/assistant-shell.test.js tests/browser-acceptance.test.js` 11/11.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no OpenAI call, audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Assistant action registry browser proof

Requirement: `REQ-20260618-159`

Changed:

- Rendered Assistant Action Registry risk, confirmation, and audit metadata in Operations without adding execution controls.
- Added browser proof for ready read-only calendar context and gated audited financial Log payment action rows.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/assistant-actions.test.js`.
- PASS `node --test tests/assistant-actions.test.js tests/assistant-shell.test.js tests/browser-acceptance.test.js` 12/12.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no OpenAI call, helper action execution, audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Assistant confirmation and audit verification

Requirement: `REQ-20260618-160`

Changed:

- Recorded focused verification that Assistant confirmation tiers and action audit trail are implemented locally.
- Paired server-side confirmation/audit tests with browser proof that gated action metadata is visible without Run/Execute controls.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/assistant-actions.test.js`.
- PASS `node --test tests/assistant-actions.test.js tests/assistant-shell.test.js tests/browser-acceptance.test.js` 12/12.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no OpenAI call, helper action execution, audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Assistant language cleanup browser proof

Requirement: `REQ-20260618-161`

Changed:

- Recorded browser proof that Assistant and Decisions copy avoid duplicate helper/provider/dev labels.
- Verified user-visible task routing says System Work while internal Codex owner values remain API-only for compatibility.

Verification:

- PASS `node --test tests/assistant-language-cleanup.test.js tests/assistant-shell.test.js tests/task-intake-routing.test.js tests/browser-acceptance.test.js` 12/12.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no OpenAI call, audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Assistant memory leakage proof

Requirement: `REQ-20260618-162`

Changed:

- Recorded focused API/browser proof that public unauthenticated Assistant memory access is blocked before database access.
- Verified private no-store headers, scoped authenticated HTTP isolation, and rendered Assistant memory context without raw user keys/test usernames.

Verification:

- PASS `node --test tests/assistant-memory-isolation.test.js tests/workspace-http-isolation.test.js tests/browser-acceptance.test.js` 10/10.
- PASS `npm test` 210/210.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no OpenAI call, helper action execution, audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Public navigation browser proof

Requirement: `REQ-20260618-163`

Changed:

- Added browser acceptance coverage for the served public homepage primary navigation.
- Verified public manifest identity, prospect/family-facing links, no private Operations login links, and mobile/desktop overflow safety.

Verification:

- PASS `rg public Operations links` with no matches.
- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/public-navigation.test.js`.
- PASS `node --test tests/public-navigation.test.js tests/pwa-identity.test.js tests/operations-identity-header.test.js tests/browser-acceptance.test.js` 19/19.
- PASS `npm test` 211/211.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.

## 2026-06-19 - Provider free-listing CTA browser proof

Requirement: `REQ-20260618-164`

Changed:

- Added browser acceptance coverage for the served public homepage provider free-listing section.
- Verified the free listing CTA, provider scope copy, WhatsApp contact path, no private Operations links, and mobile/desktop overflow safety.

Verification:

- PASS `node --check tests/browser-acceptance.test.js`.
- PASS `node --check tests/public-provider-cta.test.js`.
- PASS `node --test tests/public-provider-cta.test.js tests/public-navigation.test.js tests/pwa-identity.test.js tests/browser-acceptance.test.js` 16/16.
- PASS `npm test` 212/212.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.

Status: `needs_verification`; no audit crawl, deployment, production-data mutation, watch loop, or agent-fleet loop was performed.
