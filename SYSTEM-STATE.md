# BNA Current System State

Last updated: 2026-06-07

2026-06-07 Signup six-document signature flow:
- Signup now shows six separate required document cards on English and Hebrew
  pages: Tuition Agreement, Parent Handbook, Student Handbook / Code of
  Conduct, Safety Acknowledgment and Liability Waiver, Registration / Intake
  Form, and Parent Agreement / Signature Page.
- Each document opens in one shared large modal; on mobile the modal fills the
  full viewport. Parents must scroll to the bottom before the electronic
  signature button enables.
- The old tiny waiver box and old single Registration Documents Package modal
  are no longer visible. The old Student Contract file is not used.
- `/api/submit` now requires `agreement_signatures[]` with all six stable
  agreement types. The safety waiver signature sets `waiver_accepted=true` for
  compatibility, but daily submission validation no longer trusts the old
  checkbox/package fields alone.
- `bna_signup_agreement_signatures` stores one row per signed document with
  title, version, language viewed, text snapshot, signer name/email, client
  timestamp, server timestamp, IP/user-agent, and metadata.
- Verification passed: `node --check server.js`, `node --check
  public/js/signup-documents.js`, signup inline script parse, local dry-run
  valid/missing/mismatched signature checks, local mobile Playwright signup
  check, `npm test` 33/33, `npm run openai:smoke`, Railway deployment
  `b01730b7-3736-43eb-90ce-e3354222ed6b`, Railway doctor, `npm run app:smoke
  -- --require-drive`, and live mobile Playwright signup readback.

2026-06-07 Signup package and Tasks/Changelog cleanup:
- Operations Tasks visible lanes are now Overview, Decisions, My Tasks, and
  Changelog. Machine-owned implementation work belongs in Changelog from queued
  to in-progress to verified; old `codex`, `done`, `rabbi`, `pending`, and
  `queue` task-section URLs are normalized into the simplified structure.
- The Operations command center now opens `Changelog Queue`, and the
  Telegram/OpenAI UI inventory says queued/active/completed agent work lives in
  Changelog. There is no separate visible Codex Queue lane for new UI guidance.
- Signup now uses the current downloaded registration package
  `bnei_neviim_registration_documents_bilingual_codex.md`; the old
  `Bnei Neviim Academy Student Contract.md` file is not used.
- The served parent-facing package starts at the English/Hebrew document
  content, not the Codex implementation notes, and visible signup/payment
  wording says first tuition payment instead of registration fee.
- Superseded by the six-document signature flow above. This earlier pass
  required two deliberate signatures before submit: Tuition Agreement and
  Registration Documents Package.
- Signup payment options now support credit, cash, and bank transfer. The
  default Morning payment link in code is `https://mrng.to/rCH4DWiR5t`.
- Duplicate-safe signup matching now refreshes an existing non-archived signup
  when the same student and parent identity submit again, instead of creating a
  new duplicate row.
- Verification passed locally: `node --check server.js`, inline scripts parsed
  for Operations, English signup, Hebrew signup, and thank-you pages, `npm test`
  33/33, `npm run openai:smoke`, signup dry-run with bank transfer + package
  signature passed, and missing-package dry-run was rejected with HTTP 400.
- Railway production `PAYMENT_LINK` was updated from the old Morning link to
  `https://mrng.to/rCH4DWiR5t`.
- Railway deployment `13fbb336-0e5a-4a9d-869e-3cd890d2d57b` reached SUCCESS.
  Railway doctor passed, `npm run app:smoke -- --require-drive` passed
  (`ops/live-smokes/2026-06-07T14-10-31-637Z-live-app-smoke.md`), and live
  signup readback confirmed Registration Documents Package, bank transfer, and
  no old parent-facing wording.

2026-06-07 Signup tuition agreement signature flow:
- Added the first required parent document signature flow: `Bnei Neviim Academy
  Tuition Agreement`, version `2026-06-07-v1`.
- Public signup pages now show a Tuition Agreement section before the waiver.
  Parents must open a large readable agreement modal and click the signature
  button at the bottom. The UI states that clicking the button is the parent
  electronic signature.
- The signature is tied to Parent 1 name and Parent 1 email. If either field
  changes after signing, the signature resets and the parent must sign again.
- Backend `/api/submit` now requires `tuition_agreement_accepted=true`,
  signer name, signer email, version, and client click timestamp. It rejects
  unsigned forms and rejects signer names/emails that do not match Parent 1.
- Signup rows store summary fields:
  `tuition_agreement_accepted`, `tuition_agreement_accepted_at`,
  `tuition_agreement_version`, `tuition_agreement_signer_name`,
  `tuition_agreement_signer_email`, and
  `tuition_agreement_client_signed_at`.
- Detailed document signatures are stored in
  `bna_signup_agreement_signatures` with signup id, agreement type/title,
  version, text snapshot, signer, server timestamp, client timestamp, IP,
  user agent, and metadata. This table is intended for future required
  signup documents too.
- Verification passed: `node --check server.js`, signup inline scripts parse,
  `npm test` 33/33, Railway deployment
  `591f5ddc-fc87-4c34-a47f-a30d4e0d6932` reached SUCCESS, Railway doctor
  passed, `npm run app:smoke -- --require-drive` passed
  (`ops/live-smokes/2026-06-07T13-07-54-405Z-live-app-smoke.md`), targeted
  live browser check confirmed modal open/sign/reset behavior, targeted API
  checks confirmed unsigned and mismatched signatures are rejected, and
  `npm run openai:smoke` passed
  (`ops/openai-smokes/2026-06-07T13-09-23-353Z-openai-sidekick-smoke.md`).

2026-06-07 Accounting duplicate roster fix:
- Root cause: the Accounting roster combined active signup rows with
  already-matched payment-intake rows. After Weber/Huda and Galambo/Eitan were
  reconciled, their matched intake rows were still displayed as separate
  "open" roster cards.
- Operations now filters payment-intake rows through
  `isUnresolvedPaymentIntake()`, so only genuinely unresolved intake appears in
  the Accounting roster. Matched, completed, and ignored intake remains in the
  backend/history but does not duplicate the family card.
- Live Accounting `payments` view verification: 5 rows exactly, one each for
  Hillel Baraka, Huda Weber, Amitai Kosofsky, Eitan Chaim Golombo, and
  Menachem Mendel Dratler. `Needs signup` shows 0, `Paid` shows 4, `Open`
  shows 1, and no duplicate student names are present.
- Verification passed: Operations inline scripts parse, `npm test` 33/33,
  Railway deployment `85378409-0914-434f-bb66-d82951de65e5` reached SUCCESS,
  targeted live Playwright Accounting check passed, Railway doctor passed, and
  `npm run app:smoke -- --require-drive` passed:
  `ops/live-smokes/2026-06-07T12-38-57-821Z-live-app-smoke.md`.

2026-06-07 Forgotten-work/accounting audit and homepage Blog carousel:
- Public homepage Blog now renders as a horizontal carousel instead of six
  stacked desktop rows. Desktop shows three cards at a time; tablet narrows the
  card width; mobile remains a one-card horizontal carousel. Category filters
  reset the Blog row back to the first card.
- Added admin-only `POST /api/bna/payment-intake/reconcile-paid` so paid intake
  records with missing official signup forms can be safely turned into real
  signup/student/payment links without inventing contact details.
- Reconciled Nikki Weber / Huda Weber into signup #9 with payment log #5:
  ILS 1000 paid by Green Invoice on 2026-05-25, next due 2026-06-25, missing
  email/phone intentionally blank.
- Reconciled Shalom Galambo / Eitan Chaim Golombo into signup #10 with payment
  log #6: ILS 1000 paid cash on 2026-05-25, next due 2026-06-25, parent email
  `sholom2712@gmail.com`.
- Production readback now shows `needs_signup` payment-intake count 0. Braka /
  Hillel Baraka remains the only known partial payment: ILS 800 paid, ILS 200
  remaining.
- Hidden-work audit report:
  `ops/system-audits/2026-06-07-forgotten-work-and-accounting-audit.md`.
- Verification passed: `node --check server.js`, `npm test` 33/33, Railway
  deployment `d012de8b-aea5-43ce-a9af-1ea1ec572eba` reached SUCCESS, protected
  Accounting readback passed, and Playwright confirmed the homepage Blog has 18
  cards in one visual row with no page-level horizontal overflow on desktop or
  mobile. Full smokes also passed: `npm run openai:smoke`
  (`ops/openai-smokes/2026-06-07T12-30-22-849Z-openai-sidekick-smoke.md`) and
  `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-07T12-30-09-485Z-live-app-smoke.md`).

2026-06-07 Braka payment reconciliation and live queue audit:
- Braka/Baraka payment was reconciled from operator-provided Green Invoice
  details. Signup #7 Naomi Braka / Hillel Baraka is now `partial`, method
  `green_invoice`, amount paid ILS 800.00, Green Invoice transaction
  `DP488806585`, received 2026-06-01 09:16, with ILS 200.00 remaining.
- Payment intake #7 is linked to signup #7 and marked `matched`, so Braka no
  longer appears as `needs_signup`. Payment log #4 records the completed
  ILS 800.00 Green Invoice payment.
- Live task audit after reconciliation: 102 total app tasks, 1 active. The only
  active task is #147, `Complete Google Business Profile Task`, assigned to
  Shloimie from content job #24. Codex/agent-fleet queue is empty:
  pending 0, in_progress 0, urgent_today 0, agent fleet running.
- Remaining `needs_signup` payment intake records are Nikki Weber / Huda Weber
  and Shalom Galambo / Eitan Chaim. They are paid intake records without live
  signup rows, not unpaid records.

2026-06-07 Planned/Implementation Briefs removed from operator-facing Tasks:
- Operations Tasks no longer shows a Planned Briefs, Pending Briefs, or
  Implementation Briefs subtab, overview card, status strip, or workload count.
  `tasks-pending/*.md` remains as internal Codex handoff material only.
- Current operator-facing task lanes are Overview, Decisions, My Tasks, and
  Changelog. If a Telegram item does not require Shloimie's decision, it should
  route to Changelog Queue rather than sit as a planned brief.
- The Telegram/OpenAI Operations snapshot no longer fetches or reports
  pending-brief counts. OpenAI system-status replies should answer from live
  Tasks, Decisions, My Tasks, Changelog, Students, Content, Contacts,
  Accounting, Devices, and agent-fleet data.
- Verification passed: `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/agent-fleet-supervisor.mjs`,
  `node --check scripts/smoke-openai-sidekick.mjs`,
  `node --check scripts/smoke-live-app.mjs`, Operations inline scripts parse,
  `npm test` 33/33, `npm run openai:smoke`, Railway deployment
  `8da4a8a1-7cf2-424b-9a5d-f4188a116b73` reached SUCCESS, Railway doctor
  passed, live smoke passed
  `ops/live-smokes/2026-06-07T10-33-48-070Z-live-app-smoke.md`, and targeted
  live mobile checks confirmed no brief lane for `section=overview` or stale
  `section=briefs`.

2026-06-07 Telegram OpenAI Operations context fix:
- Root cause: broad operator requests like logistics/scheduling/ordering were
  sometimes routed to the weekly transcript topic inventory path, and the
  OpenAI fallback only received a small app snapshot. That made OpenAI answer
  from class transcripts instead of live Operations sections/tasks.
- The bridge now attaches a section-aware Operations snapshot for system
  questions: UI sections/subtabs/buttons/actions, task lane counts, active task
  details/comments, agent fleet status, students, accountability, Torah,
  devices, content jobs, prompts, bundles, contacts, accounting, reminders, and
  recent Green Invoice webhook summaries.
- Transcript topic inventory now refuses operational/system prompts unless the
  operator explicitly asks for transcript/class-content topics.
- The OpenAI sidekick smoke validates Operations sections, content prompts,
  devices, protected app endpoints, Drive folders, students, payments, and
  transcripts. Verification passed: `node --check
  scripts/telegram-kimi-bridge.mjs`, `node --check
  scripts/smoke-openai-sidekick.mjs`, `npm test` 33/33, and
  `npm run openai:smoke` with report
  `ops/openai-smokes/2026-06-07T09-57-22-678Z-openai-sidekick-smoke.md`.
- Local Telegram bridge was restarted with the fix live on PID `13056`.

2026-06-07 Tasks pending cleanup for Telegram task #140:
- Tasks no longer uses generic visible "Pending" language for ordinary work.
  The later same-day cleanup removed the visible brief lane entirely. Codex
  status copy says queued instead of pending, and assigned task badges render
  as Ready instead of Pending.
- Live task audit found only three active records: #140, duplicate clarified
  decision capture #139, and previously verified Torah correction #134. All
  three are now marked done/verified in the app, leaving 0 active tasks.
- Verification passed: `node --check server.js`, inline Operations/Student
  scripts parse, `npm test` passed 33/33, `npm run openai:smoke` passed,
  Railway deployment `a8fa5789-224c-4b2a-b4f9-9dbe21e15f41` succeeded,
  Railway doctor passed, live smoke passed
  `ops/live-smokes/2026-06-07T09-37-45-977Z-live-app-smoke.md`, and a targeted
  live Operations mobile check confirmed queued Codex wording with no 390px
  horizontal overflow.

2026-06-07 Torah progress correction for Telegram task #134:
- Live Torah rows for the stored 2026-06-04 recording were corrected from the
  operator's follow-up: Eitan Chaim Golombo and Amitai Kosofsky completed the
  full assigned time, Menachem Mendel Dratler and Huda Weber completed half,
  and Hillel Baraka completed two-thirds.
- Cumulative 30-unit trip progress now counts daily completion fractions
  instead of flattening all five students to the same completed-unit snapshot:
  Amitai and Eitan show 18 percent, Huda, Hillel, and Menachem show 17 percent,
  group progress is 17 percent, and the trip remains locked.
- `POST /api/bna/torah-learning/reconcile-trip-progress` now defaults to
  recalculating from daily percentages and refuses multi-student uniform
  overrides unless `apply_uniform_to_all_students: true` is explicit.
- Verification passed: `node --check server.js`,
  `node --check scripts/fix-torah-progress-task-134.mjs`, `npm test` passed
  33/33, `npm run openai:smoke` passed, Railway deployment
  `8b0152d8-12e3-4d40-b9c7-11ba393eea53` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T09-30-31-386Z-live-app-smoke.md`, and a targeted
  live reconcile negative test returned HTTP 400 for an unsafe multi-student
  uniform reset.

2026-06-07 Operations app shell for Telegram task #130:
- Operations now renders inside a desktop left sidebar and a mobile hamburger
  left drawer instead of the previous top horizontal category nav.
- Main app sections remain Tasks, Students, Content, Contacts, and Accounting,
  with per-section subtabs and URL `section` state.
- Tasks is split into Overview, Decisions, My Tasks, and Changelog. Students is
  split into Overview, Group Goal, Student
  List, Student Profile, Goal Board, Tablet Access, Questions, and Portal
  Links. Content, Contacts, and Accounting have functional filter-style
  subtabs.
- The old always-on Daily Command Center strip no longer renders above every
  section; key command metrics live in the focused Tasks overview.
- Verification passed: `node --check server.js`, inline Operations scripts
  parse, `npm test` passed 30/30, local Playwright screenshots confirmed the
  desktop sidebar and mobile drawer with 390px no-overflow rendering,
  `npm run openai:smoke` passed, Railway deployment
  `542e288f-51f1-4ee6-a905-81010e65eb0a` succeeded, and live smoke passed:
  `ops/live-smokes/2026-06-07T08-44-52-619Z-live-app-smoke.md`.
- Follow-up same day: Codex patched checklist misses after the fleet finished.
  The student portal no longer renders or binds any Add Goal/configuration
  form; students can only check off assigned goals and write notes. The
  Operations admin Goal Board creation form is now collapsed behind an Add Goal
  details control instead of being permanently visible above the list.
  Verification passed: inline Operations/Student scripts parse, `npm test`
  passed 30/30, `npm run openai:smoke` passed, Railway deployment
  `54a5e5f4-078a-4ce6-b76d-2f60d022e9f1` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T08-55-35-102Z-live-app-smoke.md`, and a targeted
  live mobile student-portal check confirmed no Add Goal/configuration text,
  the read-only notice is present, and no 390px horizontal overflow.
- Second follow-up same day: Contacts now renders as clickable compact roster
  cards with a selected detail panel instead of the legacy dense contacts
  table. Verification passed: inline Operations/Student scripts parse,
  `npm test` passed 30/30, `npm run openai:smoke` passed, Railway deployment
  `07feaf4c-960a-4f9f-8be0-153702f31429` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T09-05-39-414Z-live-app-smoke.md`, and targeted
  live Operations validation confirmed 4 contact cards, a detail panel, no
  legacy contacts table, and no desktop horizontal overflow.
- Split-message reconciliation same day: Codex audited Telegram messages 425,
  426, 427, and 428 as one UI redesign spec instead of only task #130's final
  chunk. Content subtabs now match Library, Selected, Repurpose, Newsletter,
  Prompts, and Bundles. Contacts subtabs now match Parents, Students, Intake,
  Needs Follow-up, and Tags. Accounting subtabs now match Overview, Payments,
  Open/Pending, Paid, Needs Signup, and Exceptions, with Overview showing
  compact totals instead of the full payment roster. The Telegram bridge now
  buffers split spec chunks and attaches them to the Codex implementation task
  as an internal comment. Verification passed: `node --check
  scripts/telegram-kimi-bridge.mjs`, inline Operations/Student scripts parse,
  `npm test` passed 30/30, `npm run openai:smoke` passed, Railway deployment
  `c50bb6a5-5adb-4edb-ba3d-7c34b07b2684` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T09-22-06-026Z-live-app-smoke.md`, and targeted
  live mobile validation confirmed the new Content/Contacts/Accounting tabs
  with no 390px horizontal overflow.
- Final acceptance same day: the split prompt was checked against the live app
  after the later Railway deployment `a8fa5789-224c-4b2a-b4f9-9dbe21e15f41`.
  Student Profile shows the requested collapsed admin sections, Content keeps
  filters/details collapsed, Prompts expose View/Edit and Make Output actions,
  Contacts shows compact roster cards plus selected parent detail/actions/timeline,
  and Accounting Overview shows summary cards without the roster table. Live
  smoke passed `ops/live-smokes/2026-06-07T09-38-15-451Z-live-app-smoke.md`;
  final UI acceptance passed
  `ops/system-audits/2026-06-07-ui-redesign-final-acceptance-1780825809195.json`.

2026-06-07 page-top polish for Telegram task #126:
- Operations mobile now keeps the Daily Command Center compact by rendering the
  six attention cards as a horizontal summary strip. The measured mobile
  command-center height dropped from 1069px to 218px, so the actual lane
  workspace starts near the first screen instead of far below the fold.
- Public homepage mobile entrance animations now use vertical motion instead of
  horizontal translate, removing hidden sideways page overflow. Live mobile
  checks for Home, Blog, FAQ, Student, and Operations all measured 390px page
  width with no horizontal overflow.
- Student portal landing alignment is tighter on desktop, with the language
  toggle aligned to the top row and the access card widened slightly. Mobile
  Student remains single-column.
- Verification passed: `node --check server.js`, inline
  public-page scripts parse, `npm test` passed 30/30, `npm run openai:smoke`
  passed, Railway deployment `85cfdcab-131d-4510-8520-b25e413ee052`
  succeeded, and live smoke passed:
  `ops/live-smokes/2026-06-07T03-25-17-982Z-live-app-smoke.md`.

2026-06-07 Operations UI command-center pass:
- Operations now has a top Daily Command Center above the main views, showing
  pending decisions, Codex queue, student accountability attention, tablet
  access issues, content needing review, and payment exceptions from the
  existing live APIs.
- Task rows now show a cleaner scan view by default: title, short detail,
  project, urgency, owner/stage, decision/comment/due signals, and an explicit
  cue to open the card for raw notes, verification, and full metadata.
- Students/Accountability now starts with a clear page heading and student
  signal cards showing agreement status, device state, due time, bedtime/wake
  agreement, access duration/window, recovery path, and cumulative trip
  progress. Admin Torah/device/goal details remain in selected-student panels.
- Content cards now show a primary next-action pill while transcripts and
  prompt/output details remain collapsed until opened.
- Accounting remains a roster-style payment view only; the payment reminder
  panel and Green Invoice webhook audit are not shown in the payment section.
- Student portal now has a boy-facing command strip for My Agreement, Check
  Off, Tablet Access, and Torah/Trip status. It continues to display
  cumulative trip progress separately from daily completion.
- Public shared page CSS now keeps blog cards equal-height, improves shared
  section spacing, and normalizes small hover/motion behavior.
- Verification passed: inline `public/operations.html` and `public/student.html`
  scripts compile, `npm test` passed 30/30, `npm run openai:smoke` passed,
  Railway deployment `683dc322-538e-4ca0-bdb5-272c194d9861` succeeded, and
  live smoke passed:
  `ops/live-smokes/2026-06-07T03-00-07-526Z-live-app-smoke.md`.

2026-06-06 automatic accountability tablet-access MVP:
- Student Goal Board metadata now separates the student agreement, success
  access rule, and missed-goal recovery/consequence.
- The first bedtime/wake-up flow supports in-bed/out-of-bed times, the
  student's chosen rule/consequence, automatic approved-access duration after
  honest checkoff, and missed-goal locked/accountability-only recovery.
- Student portal checkoff now applies the configured approved-access session
  automatically when a goal first reaches 100 percent. Partial checkoffs do not
  open access, and already-completed goals do not repeatedly reopen access.
- If no tablet record exists, the checkoff saves and returns
  `no_device_configured` so the UI can explain that access could not open yet.
- Q Studio/Qustodio remains the content-filter layer. Real Android calls remain
  disabled; the BNA device provider is still mock-only until Headwind/FreeKiosk
  is verified on a factory-reset test tablet.
- Operations Students now exposes accountability filters for Needs Setup, Due
  Today, Checked Off, Missed, Access Open, Locked, and Needs Review.
- Final Railway deployment `ed79c92e-605e-4732-9bec-bf67a71e506e` passed live
  smoke `ops/live-smokes/2026-06-06T20-07-35-433Z-live-app-smoke.md`.

2026-06-06 closeout audit:
- Root cause for "verified but unchanged UI": the autonomous agent fleet used to
  mark tasks done after local verification only. It now requires deployable app
  changes to pass `npm run railway:redeploy` and `npm run railway:doctor`
  before marking a task done.
- Railway deployment `b3c6d076-8a75-4190-9c3b-26a58ef098b4` deployed the latest
  closeout fixes: Torah trip reconciliation endpoint, summary snapshot fix,
  idempotent Torah migration seeding, Telegram `/railway_deploy`, and updated
  source-of-truth task docs.
- Live task audit after cleanup: active tasks `0`, raw/natural-language-looking
  visible task titles `0`, agent fleet running and not stale, pending queue `0`.
- Torah progress drift was fixed. Public and admin summaries now show all five
  current students at 15 percent cumulative trip progress, group 15 percent,
  trip locked. Daily completion remains admin/private and is not public trip
  completion.
- `GOOGLE_DRIVE_PIPELINE_CONFIG` was pushed to Railway with Website Images
  intake, simplified folder metadata, and source-of-truth notes. Drive remains
  operator-facing upload/source-media storage; GitHub remains canonical for
  brand, memory, and transcript exports.
- Student Goal Board MVP and tablet/device-control mock UI are implemented and
  deployed. Real tablet control is still mock-only until physical Android
  hardware plus QStudio/Qustodio/Headwind/FreeKiosk credentials are confirmed.
- One Time project collaboration, comments, Decision Required, scoped task
  access, and Rabbi Elie bridge profile are implemented. Live Rabbi bot startup
  still needs Rabbi-specific Telegram token/chat id and scoped login secrets.
- Follow-up deployment `39b175a8-da2e-4bb4-9160-42c6ee6cb082` added protected
  signup dry-run validation, live app smoke coverage via `npm run app:smoke`,
  and task-source sanitization so invalid task sources no longer become
  database constraint 500s. Latest live smoke report:
  `ops/live-smokes/2026-06-06T18-32-32-620Z-live-app-smoke.md`.
- The live app smoke verifies health, Operations login/session, protected
  dashboard APIs, public/admin Torah cumulative progress, task create/comment/
  delete, signup submit dry-run, GHL diagnostics, and Drive Website Images
  lane access. Latest smoke reports GHL diagnostics configured, 1 Facebook
  account, 3 other social accounts, and posts read OK.
- GHL/Facebook drafting now has a safer account-selection rule: Content
  approval will use the only active Facebook account, or the configured
  `GHL_DEFAULT_FACEBOOK_ACCOUNT_ID`; if multiple active Facebook accounts are
  connected and no default is set, the app refuses to pick one automatically.
  This guard is live on Railway deployment
  `38253aaf-4c05-4bb8-9e6b-5727dc856a19`; latest smoke report:
  `ops/live-smokes/2026-06-06T18-39-30-826Z-live-app-smoke.md`.

2026-06-06 sub-agent push:
- Spawned parallel agents for backlog audit, Remotion rendering, stale-family
  cleanup audit, newsletter workflow scoping, payment/signup reconciliation,
  and Telegram/GHL publish verification.
- Remotion produced
  `renders/20260606-operator-plain-english-remotion-edit.mp4` from fallback
  source `renders/remotion-source-smoke-input.mp4`; report:
  `ops/remotion-smokes/2026-06-06-operator-plain-english-edit.md`.
- Newsletter review/edit flow is live on Railway deployment
  `49be9d9b-c83e-4b1b-9361-b026b0917ed0`: Operations Content now has weekly
  newsletter review bundles with source lists, generate/regenerate, draft
  textarea editing, save edits, approve/save-example, and archive. It does not
  send email; recipient preview/test-send/live-send remains a separate guarded
  future step.
- Latest live app smoke passed:
  `ops/live-smokes/2026-06-06T18-52-29-196Z-live-app-smoke.md`.
- Payment/signup reconciliation audit confirms Amitai Kosofsky and Menachem
  Mendel Dratler are paid with active signups; Eitan Chaim and Huda Weber have
  paid/intake records needing signup/contact reconciliation; Hillel Baraka is
  signed up and payment pending. Report:
  `ops/system-audits/2026-06-06-payment-signup-reconciliation-agent-e.md`.
- Telegram/GHL publish code paths are verified for `/accounts`, `publish draft`,
  `publish now`, media captions, aliases, ambiguity handling, and diagnostics,
  but no live GHL draft/post was created. Reports:
  `ops/system-audits/2026-06-06-telegram-ghl-publish-workflow.md` and
  `ops/system-audits/2026-06-06-agent-f-telegram-ghl-publish-workflow-verification.md`.
- Stale family cleanup audit was created at
  `ops/system-audits/2026-06-06-stale-family-cleanup-audit.md`; runtime/schema
  removals should wait for Express-vs-Next and canonical API decisions.

2026-06-05 autonomous Codex agent fleet:
- Built `scripts/agent-fleet-supervisor.mjs` as the guarded worker loop for
  live Operations Changelog Queue tasks.
- The fleet claims one Codex/system/agent-owned active task at a time by
  default, writes a local task lock under `.runtime/agent-fleet/`, patches the
  task to `in_progress`, runs Codex CLI, then runs the verifier phase.
- Default verifier commands: `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/agent-fleet-supervisor.mjs`, `npm test`, and
  `npm run openai:smoke`.
- Successful runs patch the live task to done/verified, add a task comment,
  append `ops/agent-changelog.md`, append `ops/agent-task-ledger.jsonl`, write
  detailed reports to `ops/agent-fleet-runs/`, and notify Telegram.
- Failed runs are retried up to `AGENT_FLEET_MAX_RETRIES` and then moved to
  `needs_decision` so the same broken task does not loop forever.
- Commands: `npm run agent:fleet:status`, `npm run agent:fleet:once`,
  `npm run agent:fleet:start`, `npm run agent:fleet:restart`; Telegram:
  `/agent_fleet_status`, `/agent_fleet_once`, `/agent_fleet_start`.
- The Operations Tasks Changelog focus now shows queued, in-progress, verified,
  and completed agent work in one visible place.
- Live umbrella task #67 was marked done/verified after this build. Latest
  baseline smoke sees active Codex tasks `72, 65, 49, 43`.
- The local watcher was started after verification. Supervisor PID `37572`
  claimed task #43 first; Telegram bridge PID after restart was `203012`.
- Follow-up status: the fleet completed the live Codex queue through #43, #49,
  #65, #72, and #98. Tasks #100 and #101 were cleaned/implemented manually as
  OpenAI research/proactive-insight behavior. Latest `npm run openai:smoke`
  reported active Codex tasks `0`.
- The watcher was restarted after the queue cleared so it remains alive for
  future work. Current supervisor PID after restart: `76012`, polling every
  60 seconds with active Codex queue `0`.
- The "crazy long output" root cause was task #100: the fleet copied raw Codex
  CLI failure output into visible `verification_notes`. The supervisor now
  summarizes failures and keeps raw logs in `ops/agent-fleet-runs/`.
- Telegram process caveat: an access-denied stale local poller process, PID
  `178552` under parent PID `155100`, is still connected to Telegram. A duplicate
  newly-started bridge caused `409 Conflict` errors, so the duplicate was
  stopped and the lock was pointed at PID `178552`. To make newest bridge code
  live, stop PID `178552` from elevated Task Manager/PowerShell, then run
  `npm run telegram:kimi:start`.
- Follow-up: the operator killed stale PIDs `178552`, `176944`, and `155100`
  from elevated PowerShell. The elevated shell stayed in `C:\WINDOWS\system32`,
  so npm initially failed with missing `package.json`. Codex then cleared the
  stale lock and restarted the bridge from the repo. Current bridge PID:
  `165584`. Telegram log confirmed message processing and replies delivered
  again.

2026-06-05 OpenAI sidekick smoke test:
- Added `npm run openai:smoke` and Telegram `/smoke_openai` as the repeatable
  answer to whether OpenAI is really connected to the system.
- Latest smoke passed with `npm run openai:smoke -- --telegram` and wrote
  `ops/openai-smokes/2026-06-05T11-35-17-138Z-openai-sidekick-smoke.md`.
- The smoke verified: 8 repo source-of-truth files readable, 18 transcript
  exports readable, 10 protected BNA app endpoints readable, 7 Drive folders
  readable, OpenAI `gpt-4.1-mini` returned structured answers from live data,
  and Telegram summary delivery worked.
- Live data recognized by OpenAI during the smoke: active Codex tasks
  `72, 67, 65, 49, 43`; students Amitai Kosofsky, Eitan Chaim Golombo, Hillel
  Baraka, Huda Weber, and Menachem Mendel Dratler; pending payment student
  Hillel Baraka; Drive raw folder `00 Upload Here - Raw Media Intake`.
- The bridge was restarted after wiring `/smoke_openai`; current lock at the
  time of verification was PID `226784`.

2026-06-05 Drive/source-of-truth cleanup:
- Google Drive is now the operator-facing upload and source-media library, not
  the canonical brand/memory/transcript store.
- Current upload folders under `BNA V2`: recordings/videos/audio go into
  `00 Upload Here - Raw Media Intake`; website/blog images go into
  `00 Upload Here - Website Images`.
- Processed source media is consolidated in
  `20 Processed Recordings - Source Media`; approved website assets live in
  `30 Approved Website Assets`; old redundant stage folders and the deprecated
  Drive brand mirror live in `_Archive - Legacy Pipeline Folders`.
- Brand kit and agent memory are GitHub-canonical under `brand-kit/` and
  `content-memory/`. Transcript exports are GitHub-canonical under
  `content-memory/transcripts/`, while the live app database remains the
  working transcript source.
- The Drive setup route/scripts keep old stage keys as compatibility aliases
  but map them to the simplified folders. Latest audit:
  `ops/drive-audits/2026-06-05T10-24-54-809Z-google-drive-audit.md`.

2026-06-05 Telegram OpenAI transcript/topic behavior:
- OpenAI mode should answer transcript/topic/content questions directly in chat.
  It should not ask A/B/C format questions when the operator clearly asks for a
  transcript summary, topic list, weekly learning inventory, newsletter, or
  revised post.
- The bridge has a dedicated weekly transcript topic-inventory route. Requests
  like "list the actual things we learned this week from all transcripts" select
  recent transcribed Content jobs, generate the topic inventory through OpenAI,
  send it in Telegram, and log it as OpenAI content work without creating a
  Codex task.
- Decision buttons now keep source context and can continue transcript-topic
  work instead of only saying "Decision captured."

2026-06-05 Telegram AI mode selector:
- Telegram now treats OpenAI API as the default reply engine for ordinary
  conversation, content/tone refinement, brainstorming, and normal system
  running when configured.
- Clear repo/code/database/bridge/deploy/test/dashboard/programming work routes
  to Codex automatically.
- The Telegram bridge has persistent bottom reply-keyboard buttons for
  `OpenAI API` and `Codex`. Pressing `Codex` forces Codex replies until
  `OpenAI API` is selected again.
- Per-chat mode state is stored locally in `.runtime/telegram-chat-modes.json`.

2026-06-05 One Time / Rabbi Elie Scheller setup:
- The existing Mishnah/Mishna project/filter should be reused and standardized
  as `One Time Mishnah Class`; short visible label may be `One Time`.
- Operations Content now displays the existing `mishna` project filter as `One
  Time` without changing the internal key, so current content data is preserved.
- Rabbi Elie Scheller has a scoped agent scaffold in
  `agents/rabbi-elie-scheller/` for future Telegram bot/agent work.
- The current task schema does not yet have first-class projects, project
  members, task comments, or a decision-required flag. The implementation brief
  is `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md`.

2026-06-05 Telegram natural conversation rule:
- Telegram should feel like talking to Codex naturally, not like reading job
  queue logs.
- Ordinary chat should not receive `queued Codex in the background` style
  placeholder messages. The async bridge now stays quiet for conversational
  messages and sends the final Codex reply directly.
- Capture summaries are still sent when a real task, student note, payment
  item, content item, or decision was created or needs action.

2026-06-05 `build everything` Telegram rule:
- When Shloimie says `build everything`, Codex should choose the order from
  `TASKS.md` and the newest internal `tasks-pending/` handoff files, start
  executing, and report completed/verified work. Do not ask for ordering
  confirmation unless there is a real blocker or product decision.
- Task #67 was renamed to `Work through queued Codex tasks in a practical
  order` and remains assigned to Codex.
- Task #68 was renamed to `Remember build everything means work through queued
  tasks without order confirmation`, marked done, and verified after the rule
  was stored in `AGENTS.md`, `MEMORY.md`, today's memory file, and the Telegram
  bridge/server parser instructions.
- Railway deployment `a965d40a-37c0-4a38-a610-ef08c53fbdd3` deployed the
  server parser special case. Live smoke passed: `/api/health` returned OK, a
  temporary `Build everything` task produced the clean title `Work through
  queued Codex tasks in a practical order`, and the temporary task was deleted.

2026-06-04 WhatsApp content structure correction:
- Latest content job #21 WhatsApp output #39 was revised so the main video point leads with sleep/routines, breakfast, food environment, and values-to-actions, followed by a separate "Other things we did and discussed this week" section.
- Live WhatsApp Prompt Studio prompt was updated to v2 with the rule: preserve the main video message first, then separate extra class/week details.
- Repo-side WhatsApp prompt memory and the Telegram bridge auto-draft helper were updated with the same rule.
- Verification passed: `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, live API confirmed output #39 contains the sleep lead and other-topics section, and Telegram task #63 is done/verified.

2026-06-04 mobile hamburger and installed app launch update:
- Public website links still open the public website in normal browser mode.
- The installed BNA phone app is now intentionally Operations-first: `public/manifest.json` uses `name: "BNA Operations"` and `start_url: "/operations?source=pwa"`.
- Existing installed-app/homepage launches are guarded by standalone display-mode and redirect from `/`, `/he`, or `/index.html` to `/operations`; adding `?public` bypasses this for public-site testing.
- Old `/operations.html?source=pwa` shortcuts now redirect to `/operations`, not the public homepage.
- `public/sw.js` is `bna-public-v4`.
- Mobile public hamburger menus are now 236px compact right-side popovers on a 390px phone viewport, showing only Home, Blog, FAQ, language, Contact Us, and Sign Up.
- Accounting mobile summary cards remain compact but show their labels under the numbers; only the longer explanatory notes are hidden on mobile.
- Railway deployment `80c520d6-fc0f-44b7-9c35-8073f48c7404` deployed the fix. Live Playwright smoke passed for `/api/health`, manifest, service worker, homepage mobile menu, standalone app launch to `/operations`, old PWA URL redirect, and Accounting labels.

2026-06-04 Telegram completion reporting rule:
- Operator clarified that after Codex runs a requested test, completes a fix, deploys, or verifies work from Telegram, Codex must report back in Telegram that it was accomplished and list the verification result.
- This rule is now recorded in `AGENTS.md` and `MEMORY.md` so future Telegram development turns do not leave completion implicit.

2026-06-04 Content lane routing cleanup:
- Content is now treated as class/teaching material only: teaching philosophy, topics covered, verses/sources, class discussions, and class questions.
- Goals, personal/operator tasks, Codex/system tasks, student accountability, private meetings, attendance, progress, and follow-ups are filtered out of Content display and belong in Tasks or Students.
- Mixed recording parser instructions now explicitly split Tasks, Students/accountability/Torah progress, and class notes. Sources should include the best heard reference, with Hebrew source text only if it was present in the transcript.
- Telegram media routing now distinguishes class-content intent from parser-only task/student intent. Class recordings stay in Content while the parser still extracts Tasks/Students records.
- Live cleanup archived Content jobs #18, #19, and #20 plus their draft outputs because they were goal/accountability-heavy; extracted task/student/group-goal records remain preserved. Active Content jobs were normalized so jobs #7, #8, and #9 have class-only summaries/topics/sources.
- Local verification passed: `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, `node --check scripts/cleanup-content-routing.mjs`, `npm test`, live DB cleanup verification, and mobile Playwright smoke for `/operations?view=content` with 7 active cards and no forbidden goal/task/accountability titles.

2026-06-04 Telegram task button cleanup:
- Telegram task captures no longer send per-task owner/status buttons such as `Mine`, `Codex`, `Urgent`, and `Done`.
- Capture replies now summarize the inferred owner and Tasks section in plain text.
- The parser was tightened so direct bot/programming instructions such as removing Telegram buttons are assigned to Codex and treated as actionable work instead of hidden `raw_input`.
- Old task callback payloads are still accepted for compatibility if an older Telegram message already has buttons.

2026-06-04 public website start-route fix:
- Public website app/manifest launches now start at `/` instead of the Operations dashboard.
- `public/manifest.json` now has `id: "/"` and `start_url: "/"`; the description is public-website only.
- `public/sw.js` was bumped to `bna-public-v3`, no longer precaches `/operations.html`, and bypasses Operations routes so admin pages are not served from the public app shell cache.
- `public/operations.html` now unregisters service workers instead of registering the public one.
- Old installed/PWA shortcuts that still open `/operations.html?source=pwa` are redirected to `/` before the Operations shell loads.
- `server.js` serves `manifest.json` with `Cache-Control: no-store` alongside HTML and `sw.js`, so phones/browsers refresh the old operations-start manifest faster.
- Railway deployment `c66baa9e-caaa-4372-a2c2-02070be34e74` deployed the final fix. Live checks passed: `/manifest.json` reports `start_url: "/"` and `id: "/"`; `/` returns the public Bnei Neviim Academy homepage, not `Loading BNA Operations`; `/sw.js` is `bna-public-v3` and no longer precaches operations; Playwright confirmed `/operations.html?source=pwa` lands on `https://bneineviimacademy.org/`.
- Task #52 was corrected from the bad parser title to `Make public website links open the homepage, not Operations`, marked done, and verified in the live task API.

2026-06-04 public favicon and WhatsApp preview update:
- Public website pages now use the real BNA logo for browser favicons, Apple touch icon, PWA manifest icons, and WhatsApp/social link previews.
- Generated live assets include `/favicon.ico`, `/icons/favicon-16.png`, `/icons/favicon-32.png`, `/icons/apple-touch-icon.png`, `/icons/icon-192.png`, `/icons/icon-512.png`, and `/images/bna-social-preview.png`.
- Homepage, Blog, FAQ, Blog article shell, signup pages, Operations, and Operations login point to the new icon files.
- Public pages include Open Graph/Twitter image metadata using `https://bneineviimacademy.org/images/bna-social-preview.png` so shared links should show the school logo preview after client cache refresh.
- Task #42 was renamed to `Add BNA logo favicon and WhatsApp link preview`, marked done, and verified in the live task API.
- Railway deployment `47b63515-33cf-4c64-9055-774383377368` deployed the fix. Live checks passed: `/favicon.ico`, `/icons/icon-192.png`, and `/images/bna-social-preview.png` return 200; homepage HTML includes `og:image`, `twitter:image`, favicon, and Apple touch icon tags.
- HTTPS status: `https://bneineviimacademy.org/` is live, and `http://bneineviimacademy.org/` redirects to HTTPS. `www.bneineviimacademy.org` does not resolve yet; if the operator wants the www version, add/configure it as a Railway custom domain and create the required DNS record at the domain host.

2026-06-03 hamburger navigation update:
- Mobile public-site hamburger menus are compact popovers instead of full-width, screen-blocking stacks.
- Homepage and standalone Blog/FAQ page nav now use a simple mobile Blog link while keeping the category dropdown for desktop.
- Mobile menu taps close the popover and preserve normal anchor navigation.
- Task #40 was marked done and verified in the live task API.
- Railway deployment `8e29801d-e33b-4e74-be47-a1e7e866c9d3` deployed the fix. Live 390px Playwright smoke passed: homepage and Blog menus render as 288px by 264px popovers, no mobile category wall appears, no body overflow, and no browser errors.

2026-06-03 Telegram/Codex cleanup update:
- Codex is the active development agent and visible owner for machine work.
- Kimi is fallback only for provider/API failures or legacy references.
- Telegram task confirmations and dashboard task cards should show refined, normal task titles. Raw Telegram wording belongs only in provenance fields such as `ai_parsed.original_text` and daily memory captures.
- Telegram task quick-action buttons were removed on 2026-06-04; old callback payloads are still accepted only as compatibility aliases.
- Content and mixed-recording generation now prefer OpenAI when available and use Kimi only as fallback.

2026-06-03 mobile website layout update:
- The duplicate static homepage `Explore the Philosophy` card stack was removed.
- The homepage now has one filterable `Our Philosophy` section with topic filters on top.
- On mobile, homepage philosophy/blog article cards scroll horizontally instead of stacking into a long column.
- On mobile, the standalone `/blog` index also uses horizontal filters and horizontal article cards.
- On mobile, public Torah trip progress renders as compact student rows with name, percent, and progress bar instead of tall stacked cards.
- Task #38 was cleaned from raw Telegram wording to `Tighten mobile philosophy blog and Torah progress layout`, assigned to Codex, marked done, and verified.
- Railway deployment `a40d8e87-ccb5-410f-96e8-46cba23eb81b` deployed the fix. Live 390px Playwright smoke passed: homepage title `Our Philosophy`, no static philosophy preview, horizontal article scrolling, compact 74px student rows, no body overflow, and no first-party browser errors.

2026-06-01 update:
- Local server restarted on port 8080 and the Academy Telegram bridge restarted against `bneineviimacademy_bot`.
- GHL Social diagnostics pass for location `IIofSrquLHvNxc8zrpka`: Bnei Neviim Academy Facebook page is connected and not expired, posts list/read works, and a GHL admin user is available.
- Facebook draft creation now works locally. Content job #7 created a text-only GHL draft. Content job #6 uploaded its MP4 to GHL media storage and created a GHL draft with `type: reel`.
- Operations Tasks copy was cleaned up again: do not say "raw capture" in the visible UI, and machine work is shown as `Changelog`, not as Shloimie's personal tasks.
- Playwright mobile smoke passed for Tasks, Content, and Students with no browser errors using a real session cookie.
- Railway audit completed: the saved token works as a project-scoped `RAILWAY_TOKEN`, but the old deploy script incorrectly required `railway whoami` account-login auth. Deploy tooling now loads `.secrets/railway-token.txt`, skips `whoami` in project-token mode, and explicitly targets service `skillful-motivation` in `production`.
- Live deploy succeeded on Railway deployment `74f8c441-9531-4e04-ad40-650e35f86950`. Live smoke passed: `/api/health`, homepage, operations login, and mobile Operations Tasks/Content/Students.
- Added `npm run railway:doctor` to validate/repair Railway token/config/service targeting before deploys.
- 2026-06-01 follow-up: Student accountability events now support structured progress fields: goal target/actual/unit, progress percent, attendance status, next check-in date, engagement level, follow-up flag, and metadata.
- Telegram task captures briefly sent quick action buttons for `Mine`, `Codex`, `Urgent`, and `Done`; this was superseded on 2026-06-04 by parser-owned routing plus plain-text capture summaries.
- Student profiles now show average progress and follow-up counts using structured accountability data.
- Railway deployment `448f71a2-c025-4ce9-84d4-db44c1d6bb3f` deployed the structured accountability and Telegram task quick-action updates. Live smoke passed, including create/read/delete for a structured accountability event.
- Payment reminders now have one shared backend engine. Protected BNA endpoints can preview due reminders, dry-run them, and send live reminders only with the exact confirmation phrase `SEND_REMINDERS`.
- Accounting view now has a `Payment Reminder Control` panel showing reminders due within the configured 5-day window. Local API smoke passed: preview, dry-run, and live-send refusal without confirmation. Mobile Accounting smoke passed with no browser errors.
- Railway deployment `4c46a762-cf77-464b-ab3c-04a4786c48d0` deployed the payment reminder controls. Live smoke passed: `/api/health`, reminder preview, dry-run, live-send guard, and mobile Accounting view.
- Telegram accountability capture now sends `Which student?` inline buttons when it saves a student-related note without a confident student match. The callback updates the saved accountability event through `PATCH /api/bna/accountability/:id`.
- Railway deployment `9cfa39d4-b60b-4d46-b3a4-6e0f50f833d0` deployed the student-match PATCH endpoint. Live smoke passed by creating temporary event #12, patching it to a student, and deleting it.
- Tasks UI cleanup deployed: task cards open details by click, and the visible action buttons no longer include `Open details`, `Details`, `Done, needs test`, `Needs test`, or `Mark tested`.
- Future task extraction now stores a polished title and explanatory note instead of showing raw Telegram ramble language as the dashboard task.
- The bad test student `Fh` and linked signup #5 were removed from active views by setting the student inactive and archiving the signup.
- WhatsApp, Facebook, and weekly report prompts now prefer English, natural teacher language and explicitly avoid corny phrases like `Today at Bnei Neviim Academy` and `our learners explored`.
- GHL Facebook action smoke passed locally: Content job #7 created a text draft and Content job #6 created a media draft for the connected `Bnei Neviim Academy` Facebook page.
- Railway deployment `75d78726-dc90-40ed-b27b-ae649fa956f6` deployed the final cleanup. Live smoke passed: health, Students without `Fh`, GHL Facebook diagnostics, mobile Tasks, and mobile Content.
- 2026-06-02 update: Homepage 30-page goal progress is now 3/30 pages with 10 percent progress and updated English/Hebrew note copy. This was filed as clean Changelog task #33, assigned to Kimi and marked done/verified, so agents can see it without relying on the original Telegram ramble.
- 2026-06-02 update: Operations Tasks routing now keeps Active Work to decisions/personal actionable items, sends completed Codex/system work to read-only Changelog, and keeps Done for Shloimie's personal completed tasks only. Changelog cards have no action buttons.
- Railway deployment `cd63e998-98ba-49be-b2db-7f9b4af821c1` deployed the 3/30 progress update and final Tasks/Changelog routing cleanup. Live smoke passed: health, homepage 3/30, Changelog task #33 visible, no Changelog action buttons, and no stale `Review and organize` prefix on that changelog item.
- 2026-06-02 local update: Content now has a Prompt Studio. Each platform output (`WhatsApp`, `Facebook`, `Newsletter`, `LinkedIn`, `YouTube`) shows the active prompt version, updated time, example/file count, editable prompt text, generate/regenerate button, copy button, and approval button.
- 2026-06-02 local update: Content prompt versions are stored in `bna_content_prompts` and `bna_content_prompt_versions`; approved outputs are promoted into `bna_content_prompt_examples` so good drafts become examples automatically.
- 2026-06-02 local update: Weekly newsletter bundles are stored in `bna_content_bundles` and `bna_content_bundle_items`. The operator can select multiple recordings in the Content view, create a bundle, and generate one newsletter draft from the current newsletter prompt.
- 2026-06-02 local smoke passed: `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, authenticated `/api/bna/content-prompts` returned 5 prompts, `/api/bna/content-bundles` returned 200, and mobile Operations Content rendered prompt cards with no browser errors. Old Content buttons `Break into tasks`, `Custom instruction`, and `Copy transcript start` are gone.
- Railway deployment `43a657de-074c-4fee-b6f5-591f7b608352` deployed the Content Prompt Studio. Live smoke passed: `/api/health`, authenticated `/api/bna/content-prompts` returned 5 prompts, `/api/bna/content-bundles` returned 200, and mobile Operations Content showed Content Library, prompt versions, and Weekly Newsletter Bundle with no browser errors.
- 2026-06-03 update: Content generation is now OpenAI-first when `OPENAI_API_KEY` is configured, with Kimi only as fallback.
- 2026-06-03 update: Railway production was missing the content AI key, so prompt generation failed with "No content AI key is configured." `KIMI_API_KEY`, `KIMI_BASE_URL`, and `KIMI_MODEL` were added to the Railway service.
- 2026-06-03 update: Kimi/Moonshot rejected the old OpenAI-style `temperature: 0.35`; the content generator now sends `temperature: 1` for Kimi and `0.35` for OpenAI.
- 2026-06-03 update: Telegram content buttons now call the same backend `/api/bna/content-jobs/:id/actions` `generate_output` flow used by the dashboard, so Telegram drafts use the active prompt version and examples instead of a separate older prompt path.
- Railway deployment `79e5731d-2534-4fb1-8673-892ca2e9aa9a` deployed the earlier Kimi content generation fix. Current local code now prefers OpenAI and keeps Kimi as fallback.
- 2026-06-03 final smoke: Academy Telegram bridge restarted locally as PID `112992`. Railway doctor passed for deployment `79e5731d-2534-4fb1-8673-892ca2e9aa9a`. Live mobile Operations Content smoke passed with 5 prompts, prompt versions visible, Weekly Newsletter Bundle visible, and no browser errors.
- 2026-06-03 task cleanup update: visible Tasks/Changelog should not show raw Telegram ramble language. Task parser now stores raw wording as `ai_parsed.original_text` and uses concise `display_title`/clean titles for the dashboard.
- 2026-06-03 shared-agent ledger added:
  - `ops/agent-task-ledger.jsonl` is the append-only shared task trail for Telegram/Kimi and Codex.
  - `ops/agent-changelog.md` is the repo-visible completed agent work changelog.
  - `AGENTS.md` now instructs agents to write task updates/completed work there.
- 2026-06-03 live cleanup: raw task #31 was archived as a duplicate of completed homepage progress task #33. Raw Changelog task #30 was rewritten to `Use newest Drive intake images for the homepage Learning Moments carousel`.
- Railway deployment `5aa6997e-104c-4843-9fbf-6ff352e8b378` deployed task-language cleanup and shared ledger support. Live Tasks smoke passed: Active and Changelog views no longer showed the raw `Okay Mr Kenny...` or `No codex...` Telegram wording.
- 2026-06-03 update: Operations Tasks now uses `Decisions`, `My Tasks`, `Changelog`, and `Done`. `Decisions` is only for items still in Shloimie's ballpark where a choice/answer is needed. `My Tasks` is for already-decided personal work.
- 2026-06-03 update: Operations Content now renders as a collapsed Content Library. Each content card can be opened to show summaries, transcript info, platform prompt panels, drafts, copy, regenerate, and approval buttons.
- 2026-06-03 update: Operators can select multiple content cards and generate WhatsApp, Facebook, Newsletter, LinkedIn, or YouTube drafts from the same saved platform prompt. Custom instructions are one-time generation instructions and do not patch the saved prompt unless the prompt editor is explicitly saved.
- Railway deployment `7bb99db0-1351-4e0b-ba21-baade568e1ea` deployed Decisions plus the collapsed/multi-select Content Library. Live smoke passed: health OK, Railway doctor OK, operations HTML has `Decisions` and no `Active Work`, mobile Tasks has `Decisions` and no `Active Work`, mobile Content loaded with no browser errors, and the new bulk generation endpoint created a Kimi draft from two temporary content items using prompt v1, then archived the smoke records.
- 2026-06-03 update: Homepage Learning Moments carousel is image-only on the public page. Titles, descriptions, and timestamps remain in `learningMoments` as internal/accessibility metadata, but no text panel is displayed over or beside the images.
- 2026-06-03 update: Homepage 30-page goal progress is now 3.5/30 pages, 12 percent. Added `npm run learning:progress -- <pages>` so future progress updates can be done repeatably.
- Railway deployment `cecac732-66b3-4273-956d-8d977a936825` deployed the image-only Learning Moments carousel and 3.5/30 progress update. Live smoke passed: health OK, page shows 3.5 and 12 percent, no `.media-copy` caption elements remain, carousel has 3 slides, and mobile browser errors were 0.

## Website

- The public homepage is `public/index.html`.
- A new homepage section called `program-pulse` was added after Daily Morning Torah Learning.
- That section contains:
  - weekly schedule: Monday and Wednesday learning in the forest
  - other learning days meeting at HaChozeh MiLublin 7
  - 30-page goal card: current progress is 3.5/30 pages, 12 percent
  - Learning Moments image/video carousel with public images only
- When the operator says "the image slider", "learning moments", "website slider", or "the slider Codex built", they mean the Learning Moments carousel in `public/index.html`.
- The carousel data lives in the JavaScript array `learningMoments` inside `public/index.html`.
- Learning Moments descriptions and timestamps are internal/accessibility metadata only. Do not add visible text panels or caption overlays back to the public carousel unless the operator explicitly asks.
- Current carousel images live in `public/images/learning-moments/`.
- Current carousel files:
  - `forest-learning-01-web.jpg`
  - `forest-learning-02-web.jpg`
  - `forest-learning-03-web.jpg`
- The original full-size Drive images were downloaded from Google Drive `01 Raw Intake`, optimized for web, then the Drive originals were moved to `10 Approved`.
- Planned next lane: create a separate `BNA V2 / 00 Website Moments Intake` Drive folder that posts images straight to the homepage carousel without routing through GHL/social content. See `tasks-pending/2026-06-03-website-moments-and-parser-routing.md`.

## Telegram And Agent Context

- The Academy Telegram bridge is `scripts/telegram-kimi-bridge.mjs`.
- Codex should use this file plus the newest files in `tasks-pending/` to understand recent work.
- Codex should also read `ops/agent-task-ledger.jsonl` and `ops/agent-changelog.md` before assuming recent Telegram work is unknown.
- If the operator references recent work vaguely, check `SYSTEM-STATE.md`, `TASKS.md`, today's `memory/YYYY-MM-DD.md`, and the newest `tasks-pending/*.md` before asking clarifying questions.
- Do not tell the operator "I do not know what slider you mean" when the reference matches the homepage Learning Moments carousel.
- Natural language like "I dropped a video into Drive Raw Intake, make WhatsApp/Facebook captions" should be handled directly as Drive ingest. Pick the newest file in `BNA V2 / 01 Raw Intake`; do not ask for filename/time unless that configured folder is empty.
- The Telegram bridge now has a Drive auto-watcher. About every 10 seconds, it checks the configured `BNA V2 / 01 Raw Intake` folder. If a file is found, it ingests it automatically, transcribes audio/video or describes images, titles it, creates a Content job with the Drive link, moves the file down the pipeline, and pings Telegram with WhatsApp/Facebook action buttons.
- WhatsApp and Facebook drafts are separate outputs. WhatsApp should be short parent bullet points. Facebook should be a warmer, longer narrative draft saved as `facebook_post` with its own approval button.
- Facebook drafts also have a `Create Facebook Draft` Telegram button. It should create a GHL draft on the connected `Bnei Neviim Academy` Facebook account.
- Amitay/Amitai/Amitize should fuzzy-match to student `אמיתי קוסובסקי`. Student questions, goals, and private-meeting notes belong in Student Accountability, not Tasks.
- Amitay's conversion/fairness question was filed as Student Accountability event #8 on 2026-05-31. Accidental task captures #28 and #29 were archived.

## Content Source Of Truth

- Website/database should be the source of truth for BNA content.
- Google Drive is raw intake and storage.
- YouTube should host public videos later; the website should embed YouTube videos instead of hosting large video files directly.
- GHL can be used as a publishing destination for social/blog/email, but it should not be treated as the master content memory.
- Operations Content view now has media filters (`All`, `Video`, `Audio`, `Images`) and uploaded-date filters (`All dates`, `Today`, `Last 7 days`, `Last 30 days`). Content cards sort newest first and show media type, title, upload date, Drive stage, and Drive link.
- Operations Tasks view should not show a separate Smoke Test filter. It uses `Decisions`, `My Tasks`, `Changelog`, and `Done`. Changelog is read-only machine/Codex work; Done is for Shloimie's completed personal tasks.
- 2026-05-31 update: Tasks now also has urgency/date filter chips and the Kimi lane is labeled `Changelog` so machine work does not read like Shloimie's personal task list.
- 2026-05-31 update: Content has a project filter for `BNA` vs the Mishnah/One Time lane. As of 2026-06-05 the visible label is `One Time`, preserving the internal `mishna` key. The latest `Meeting rabbi sheller.m4a` was auto-ingested as Content job #7, titled `All-Day Mishnayas Learning and Micro Schools`, and classified under the Mishnah/One Time lane.
- 2026-06-02 update: Dashboard content actions now use the Prompt Studio. `Make WhatsApp`, `Make Facebook Post`, `Make Newsletter`, `Make LinkedIn Post`, and `Make YouTube Description` generate or regenerate drafts from their tracked prompts and examples. `Approve + Save Example` stores the output as a future example. `Approve + Create GHL Draft` creates a GHL Facebook draft for Facebook outputs.
- 2026-05-31 update: Students view now supports clickable student profiles. Selecting a student opens their accountability page with KPI counts, an accountability/progress chart, interests/topics, questions, goals, and private meeting/notes sections. Amitay's saved conversion/fairness question appears under his profile.
- 2026-06-01 update: Accounting has safe payment reminder controls. Real email sending requires the operator to explicitly confirm `SEND_REMINDERS`; dry run is the default path for testing.

## 2026-06-03 Mixed Parser And Torah Goal Update

- Mixed recording parse action exists for Content jobs through the Telegram button `Parse Tasks + Students`. It writes operator tasks, Student Accountability events, group-goal entries, and a parse report.
- AI parsing can time out on long mixed recordings. The backend now has a deterministic fallback so Telegram does not fail silently; fallback parses must be reviewed before trusting every extracted item.
- Content job #19 was fallback-parsed. Tasks #34-#37 and Accountability events #13-#16 were created. Kosofsky 50 percent was cleaned into group-goal entry #5 and a Torah entry for student #643.
- Student seed spelling is corrected: use `Eitan Chaim Golambo`, father `Shalom Golambo`. Do not revive the old `Eitan Chaim Golombo` record.
- Green Invoice has one live webhook route: `POST /api/webhooks/green-invoice`. Disabled legacy/debug routes are not the production webhook.
- Railway redeploys must include `src/`; `scripts/railway-redeploy.ps1` was fixed to copy it into `.deploy-railway`.
- `BNA V2 / 00 Website Moments Intake` was created in Drive. Folder ID: `1aiCzZ-lKEKSWTYfOMvXoO4YE56cVaK23`. The folder exists, but the auto-publish watcher for homepage images is still future work.
