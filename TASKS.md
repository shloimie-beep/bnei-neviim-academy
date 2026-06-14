# BNA Tasks

Completed older entries that mention former GHL/legacy-CRM work are historical
changelog context only. They are superseded by the current no-GHL policy and do
not authorize active GHL runtime paths.

## Now

- [ ] Finish BNA workspace/community/provider/bot no-GHL release on
  `cleanup/bna-workspace-community-provider-bot-no-ghl`: dirty worktree was
  preserved on a safety branch/commit, active runtime is first-party BNA plus
  explicit connectors only, provider public signup is free-listing-only, action
  registry has role-aware ticket/decision/provider/community/worksheet bot
  actions, and OpenAI key diagnostics now prove `.secrets/openai-api-key.txt`
  and Railway share the selected key fingerprint but OpenAI rejects it with
  `401 invalid_api_key`. Local syntax checks, `npm test` 309/309, Railway
  doctor, live app smoke, and screenshot smoke pass. Keep open until a valid
  OpenAI project/org key is supplied, `npm run openai:smoke` passes, the changed
  bundle is deployed, post-deploy live smoke passes, and Telegram completion is
  sent. Handoff:
  `tasks-pending/2026-06-14-workspace-community-provider-bot-no-ghl.md`.
- [ ] Deploy and live-smoke the signup credit payment-link email fix: manual
  resend for signup #12 succeeded to both recorded parent emails, and local code
  now includes the configured credit `PAYMENT_LINK` in confirmation emails sent
  to Parent 1 plus Parent 2. Local syntax and focused signup tests passed; the
  latest full-suite rerun belongs with the current no-GHL cleanup branch.
  Future-signup behavior is not live because this checkout has a very large
  unrelated dirty worktree. Do not mark done until a safe deploy scope is
  chosen, Railway doctor passes, and a live credit signup/email-log smoke proves
  both parent emails receive the payment link. Handoff:
  `tasks-pending/2026-06-13-signup-credit-link-email-live-deploy.md`.
- [ ] Deploy and live-smoke the registration toolbar/parent-permission notice
  fix: local implementation is complete and verified, but live deployment is
  blocked because this checkout has a very large unrelated dirty worktree. Do
  not mark done until a safe deploy scope is chosen, Railway doctor passes, and
  live signup/document/thank-you smoke verifies the shared public-site hamburger
  toolbar, the no-checkbox parent responsibility notice, and black/readable
  Parent 1/Parent 2 name headings/labels/typed text. Handoff:
  `tasks-pending/2026-06-13-registration-toolbar-permission-live-deploy.md`.
- [ ] Deploy and live-smoke the Operations parent-to-student link fix: local
  implementation now loads the student roster for Contacts, resolves parent
  signups to student profiles by signup id or parent email/student name, and
  adds parent-detail linked-record actions. Local Operations regression test
  passed; live deployment is blocked by the same large unrelated dirty
  worktree. Do not mark done until a safe deploy scope is chosen, Railway
  doctor passes, and live Operations smoke verifies opening a parent shows and
  opens the linked student. Handoff:
  `tasks-pending/2026-06-14-operations-parent-student-links-live-deploy.md`.
- [ ] Build universal BNA helper and fix contact tagging/settings/Hebrew menu
  issues: local implementation and tests passed on 2026-06-13. Shipped local
  slices include role-safe universal assistant backend/widget, retired CRM
  contact compatibility cleanup, contact-role repair dry-run script, Whapi
  resolved-name fallback, Settings light-shell cleanup, Hebrew RTL drawer fix,
  and brand-kit AI context in the OpenAI sidekick smoke. Keep open until OpenAI
  API credentials are fixed, the contact repair dry-run can reach the live
  database, and the changed app bundle is deployed with Railway doctor/live
  smoke. Handoff:
  `tasks-pending/2026-06-13-universal-helper-tagging-settings-hebrew.md`.
- [ ] One Time: collect Rabbi Scheller contact email, WhatsApp/contact phone,
  and scoped login username, then send the Drive folder/WhatsApp and login
  last. Live task #506 completed the Drive/social ingestion setup but remains
  blocked on missing contact fields; handoff:
  `tasks-pending/2026-06-12-scheller-drive-social-login-brief.md`.
- [ ] Collect missing Weber/Fober parent contact details before portal link or
  WhatsApp send: Green Invoice webhook log is empty, and no email/phone exists
  in the signup, payment intake, or payment log records.
- [ ] Mapping out inner dialogue between members and the community and dialogue:
  core app implementation is deployed and live-smoked. Completed slices include
  runtime/DB audit, mobile nav/hero fix, parent permission persistence,
  learning-community/dialogue backend, newsletter hero, sliding portal bot,
  guarded email smoke, Railway deploy, and live smoke. Remaining follow-ups are
  the product/source-material items still listed below. Handoff:
  `tasks-pending/2026-06-12-inner-dialogue-community-bot-master.md`.
- [x] Audit live runtime and overlapping agent work for BNA community/dialogue
  build: Express/static runtime, live routes, current DB overlap, stale local
  Supabase URL, Railway DB secret, baseline tests, and production route shape
  were recorded before schema/UI edits.
- [ ] Normalize BNA brand kit across public, operations, parent, student, and
  form pages: several brand shell passes are already deployed; keep open until
  the master prompt surfaces are re-audited together.
- [x] Fix mobile public navigation, hamburger menu, and hero CTA placement:
  mobile nav now includes parent, student, provider/Rabbi, signup, language,
  contact, and provider join paths; hero image/spot badge were tightened and
  screenshot-smoked.
- [x] Rebuild signup flow into four signed document pages: all four required
  document cards now open branded full registration-document pages, preserve
  the typed signup form by returning to the opener tab, and persist the same
  four-signature payload with version/language/signer context.
- [x] Add parent permission fields for leaving, swimming, food, money, and
  pickup responsibility: English/Hebrew signup forms now collect the fields;
  the API persists normalized `parent_permissions` plus pickup responsibility
  fields and backfills parent permission profiles.
- [ ] Implement parent, spouse, student, rabbi, and service-provider login
  model: parent/student/provider foundations exist; spouse/rabbi/community
  access still needs audit and completion.
- [ ] Add onboarding and reset emails for parent and student access.
- [ ] Complete Hebrew and RTL audit for student-facing pages.
- [x] Build learning community roles and membership model: live backend now has
  BNA-scoped learning communities, memberships, default `bna-main`, and admin
  APIs.
- [x] Build internal dialogue/forum between community members: community thread
  and message tables/APIs are live with parent, student, provider, and admin
  actor resolution.
- [x] Build sliding in-app AI bot widget.
- [x] Connect bot widget to safe backend tool/action registry: portal widget
  uses preview-only safe actions and community note posting, not a raw LLM
  endpoint.
- [x] Add newsletter hero to parent dashboard: parent portal renders selected
  weekly updates as a first-screen hero with media/history slots when data
  exists.
- [ ] Retrieve or select approved weekly newsletter copy and pool/talking-head
  media: weekly-update data model/admin API is live; approved copy/media still
  needs operator selection.
- [x] Add email smoke tests and send controlled test email to
  `sdratler@gmail.com` only when authorized: guarded dry-run smoke script is
  live; no real email was sent without explicit approval.
- [ ] Add mobile screenshot smoke tests for homepage, forms, documents, login,
  parent, student, and bot: homepage, signup permissions, parent newsletter,
  and bot drawer screenshots were captured; full login/student/document matrix
  remains.
- [x] Deploy, smoke live routes, update changelog, ledger, memory, and task
  statuses: latest master-brief deployment
  `6b1e8b3a-c325-4fb1-ab73-80e6f0e6918d` reached SUCCESS and live smoke
  passed at `ops/live-smokes/2026-06-12T14-42-47-439Z-live-app-smoke.md`.

- [x] Finish the release OpenAI sidekick smoke verification for the parent/student/action-registry release: fresh local OpenAI key was stored outside chat, Drive smoke secrets were present in `C:\Users\User\bna-release-clean`, `npm run openai:smoke` passed with repo/app/Drive/OpenAI context, and the PR QA report was updated/pushed in commit `5894c79`. Report: `ops/openai-smokes/2026-06-12T06-22-48-616Z-openai-sidekick-smoke.md`.

- [x] Build the Operations Action Registry so Telegram, in-app bots, and UI
  buttons call the same typed backend actions with permissions, dry-run/approval
  gates, audit logs, and Codex routing only for code/system development:
  shipped 40 typed actions, Telegram intent routing, server/UI action endpoints,
  action artifacts, and tests. Verified with focused action/portal tests 46/46,
  `npm test` 268/268, app smoke, OpenAI smoke, and Railway doctor. Report:
  `ops/qa-runs/2026-06-11-action-registry-telegram-ui-bot.md`.
- [x] Run the production UI QA/fix loop for parent/student portals, calendar,
  provider participant portal, and only the shared Operations shell pieces
  needed for role/workspace clarity: re-verified 165 screenshots across
  360/390/430/768/1440, parent/student English and Hebrew, mobile calendar
  list/detail states, provider separation, and no horizontal overflow. Report:
  `ops/qa-runs/2026-06-11-final-release-readiness.md`.
- [ ] Build Content Library v2 normalized knowledge library: add taxonomy, segment, claim, source, claim-source, and research-task records; seed controlled Torah/ADHD/nutrition/parenting/education/operations/repurposing terms; add parser v2, backend filters, Operations review queues, and a safe backfill path without breaking existing content jobs, outputs, Prompt Studio, bundles, or publishing workflows. Handoff: `tasks-pending/2026-06-11-content-library-v2-build-brief.md`.
- [ ] Deploy and live-smoke the provider onboarding/integrations foundation: local work adds sanitized public provider index routes/API, provider profile Google/Profile fields, natural-language provider intake records/parser, parent-provider messages, provider replies, provider join form fields, public nav links, and credential-example cleanup. Local tests/browser smoke passed; remaining gate is Railway deploy, doctor, app smoke, and live public/provider/parent smoke. Handoff: `tasks-pending/2026-06-11-provider-onboarding-integrations.md`.
- [x] Deploy and live-smoke the registration/provider/student-security pass: public signup now shows four visible required docs, shared BNA UI/token guidance is in place, provider intake/AI Max application fields are expanded without checkout, student portal invalid-code handling is hardened, and the Rabbi/One Time video workflow is briefed. Railway deployment `d4f0be3c-1890-4f4a-9364-41ef6d57df58` reached SUCCESS; Railway doctor, live app smoke, and targeted production signup/provider/student security smoke passed. Handoff: `tasks-pending/2026-06-12-registration-provider-security-rabbi-video.md`.
- [ ] Decide the final student portal auth model: keep private access code only, or add code plus PIN/password; once chosen, add persistent server-side rate-limit/audit policy as needed.
- [ ] Confirm AI Max pricing, payment, and delivery terms before enabling any checkout, paid automation, ad launch, or billing flow.
- [x] Fix Torah/public content contamination from backend/task remarks: public content generation now applies shared source-separation guardrails, filters operational/admin/task/accountability lines before draft generation, persists the guardrails into saved public prompt rows on startup, refuses meta disclaimers like "technical/admin remarks were excluded," and routes corrupted Torah-section task notes to the Operations topic instead of Torah. Verified with `node --check server.js`, `node --check tests/public-content-contamination-guard.test.js`, focused content/routing tests 43/43, `npm test` 237/237, Railway deployment `d7f7fe38-207d-401b-b4ee-3ea9e49f34cb` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-11T08-12-52-256Z-live-app-smoke.md`, and live `/api/bna/content-prompts` readback confirming guardrails on all 6 public prompts.
- [x] Add per-card Content Library research/source links and student questions: every Content Library item now exposes student questions, sourceable topics, Sefaria search/direct source links, and a source-sheet task action while task/decision captures stay out of Content. Verified with `node --check server.js`, Operations script parse, focused Content tests 7/7, `npm test` 230/230, local card smoke `tmp/qa-runs/content-card-research-links/local-content-card-research-links-smoke.json`, Railway deployment `6b375c1d-ce49-4d2b-8582-b86825baa483` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-11T07-36-26-862Z-live-app-smoke.md`, and production card smoke `tmp/qa-runs/content-card-research-links/production-content-card-research-links-smoke.json`.
- [x] Add Content Library topic/source filters and clear transcript-only backlog status: Content Library now shows top Topic and Source filters, Torah/psychology/health/etc. topic pills, source pills/links, output counts, transcript length, and `Needs Output` / `Generate output` for saved transcripts with no platform drafts. Verified with `node --check server.js`, Operations script parse, focused Content tests 9/9, `npm test` 229/229, local Content UI smoke `tmp/qa-runs/content-library-taxonomy/local-content-library-taxonomy-smoke.json`, Railway deployment `a5692ae9-0284-4614-910e-dfd3076390bd` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-11T07-19-34-467Z-live-app-smoke.md`, and production Content UI smoke `tmp/qa-runs/content-library-taxonomy/production-content-library-taxonomy-smoke.json`.
- [x] Complete Operations full professional QA/product-polish pass: behaved as a fake user across Platform, BNA School Workspace, Rabbi Sheller Provider Workspace, parent/student/provider portals, settings, connectors, mobile, role/workspace switching, primary prompts/actions, dry-run workflows, privacy checks, and production pages; fixed workspace switcher search/stable hook, not-configured placeholder polish, and bot action preview response shape. Verified with `node --check server.js`, Operations script parse, `npm test` 220/220, `npm run screenshot`, `npm run openai:smoke`, Lighthouse `lighthouse-report.html` (performance 63, accessibility 84, best-practices 100, SEO 100; Windows temp-profile cleanup after report write), local full QA matrix `tmp/qa-runs/operations-full-qa-results-clean.json` (54 routes, 15 workflows, 38 screenshots, 0 failures), Railway deployment `ea35c7ae-f36d-4fd1-98f2-4327ceea530e` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T20-07-12-261Z-live-app-smoke.md`, production UI smoke `tmp/qa-runs/live-smoke/production-ui-smoke.json`, and QA report `ops/qa-runs/2026-06-10-operations-full-qa.md`.
- [x] Complete the BNA internal-first CRM/workspace connector pass: Operations is now the canonical CRM/workflow/calendar/task/communication/provider/settings shell with Platform, BNA School, and Rabbi Sheller Provider workspaces; persisted workspace settings, connector settings, internal calendar events, pipeline cards, internal dialogue, and typed bot action logs; manual/test/not-configured connector states for email identities, WhatsApp, social, Google Calendar/Classroom, Rabbi video/library, and disabled legacy CRM legacy reference; role-aware nav and scoped provider access; settings tabs that load promptly without unrelated CRM hydration; and local/live desktop/mobile portal smoke coverage. Verified with `node --check server.js`, Operations script parse, focused tests 49/49, `npm test` 220/220, local Operations/portal Playwright smoke `ops/playwright-smokes/2026-06-10T19-23-57-000Z-bna-operations-crm-local/report.md`, `npm run screenshot`, Lighthouse report `lighthouse-report.html` (scores: performance 68, accessibility 84, best-practices 100, SEO 100; CLI exit was Windows temp cleanup after report write), Railway deployment `86d727fc-1b09-4b90-847f-479506f665d4` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T19-29-39-508Z-live-app-smoke.md`, and production Operations/portal Playwright smoke `ops/playwright-smokes/2026-06-10T19-31-30-000Z-bna-operations-crm-production/report.md`.
- [x] Build the BNA Operations SaaS/CRM redesign: shipped the global workspace shell with nested left subnav, top bar/breadcrumbs, Dashboard, Service Providers, Communications, API Usage, Team/Admin, Settings, clean query-addressable detail surfaces, parent/student/provider portal IA cleanup, Hebrew/RTL portal support, guarded not-configured states, faster task API/query handling, and immediate Operations shell rendering for slow data hydration. Verified with `node --check server.js`, `npm test` 219/219, local Playwright smoke `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/report.md`, Railway deployment `13d594d3-42ff-4df3-8c06-7c9ad1b9ec6b` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T16-01-05-691Z-live-app-smoke.md`, and production Playwright smoke `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/report.md`.
- [x] Turn Rabbi meeting drop #1 into a One Time build brief: distilled Content job #57 into `tasks-pending/2026-06-10-one-time-rabbi-meeting-build-brief.md` with internal-first platform direction, parent/student/Rabbi admin surfaces, Rabbi stack discovery checklist, platform/login/ownership/Classroom/integration decision gates, implementation slices, and acceptance criteria.
- [x] Implement One Time meeting drops and student navigation cleanup: added structured Rabbi meeting artifacts/tasks from Content job #57, created Meeting Drops artifact #1 with linked tasks #417-#422, added Decision Required follow-ups for legacy CRM/internal stack and access model, compact student list/workspace navigation, mobile hamburger full navigation page, light student workspace polish, tests, Railway deployment `5c96321e-1759-4cdb-9541-3920d4fa518b`, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T14-20-47-965Z-live-app-smoke.md`, and production Playwright smoke `ops/playwright-smokes/2026-06-10T14-21-37-287Z-one-time-meeting-student-nav-live-structured/report.md`
- [x] Convert the One Time/Rabbi roadmap into scheduled task work and Team tickets: removed the separate Roadmap Operations section for scoped users, added Tasks > Schedule for planned/due One Time proposal work, backfilled proposal workflow task metadata/details, renamed Support to Team/Tickets & Messages, kept Rabbi as a limited project admin without programming controls, updated the shared UI shell to crisp black/white/gold, fixed Railway to bind the app on `0.0.0.0`, deployed Railway `35707ab0-1069-44e3-a34d-0a062ca7833c`, and verified with `npm test` 204/204, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T13-03-37-257Z-live-app-smoke.md`, OpenAI smoke `ops/openai-smokes/2026-06-10T13-04-44-064Z-openai-sidekick-smoke.md`, and live Playwright visual smoke `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/report.md`
- [x] Apply app-wide BNA brand shell and million-dollar SaaS UI polish: live task #402 is done/verified; app-wide light BNA brand shell/topbars, Operations provider directory UI, parent/student/provider portal brand bars, Telegram UI-intent parser guard, `npm test` 204/204, Railway deployment `56747aa2-6dd8-41ad-96a8-2846097e46d8`, live app smoke, and desktop/mobile Playwright smokes passed
- [x] Generate Sefaria source sheets from every class transcript: live task #322 is done/verified; produced `content-memory/source-sheets/2026-06-10-transcript-wide-class-source-sheets.md` with transcript coverage, direct Sefaria links, source maps, review notes, and verified URL/link checks
- [x] Add sourced bibliography workflow for public content videos as a second stage: live task #323 is done/verified; Content Research now creates `public_content_bibliography` tasks and stores outputs under `content-memory/public-bibliographies/` after tests, deploy, Railway doctor, app smoke, and live bundle readback
- [x] Map and build the service-provider login and parent-facing approved-provider directory: provider account/session schema, scoped `/provider` login, provider-only profile/service/class edits held in `pending_review`, Operations provider API, parent approved-provider directory filters for city/type/price/age/capacity/class time, explicit near-me radius geocoder/PostGIS blocker, Rabbi discount display, no-live-billing guardrails, seeded 7:00 Rabbi Scheller Mishnah class, `npm test` 204/204, Railway deployment `56747aa2-6dd8-41ad-96a8-2846097e46d8`, live app smoke, provider portal smoke, and Playwright visual smoke passed
- [x] Build person-detail side menus for students, parents, contacts, and users: live task #328 was corrected from the mislabeled Telegram message 977 capture, implemented with custom side/dropdown section menus for student, parent/contact, lead, and People/user detail views, deployed in Railway `5f0ebd68-5e24-49ee-890e-1c21a329c17c`, and verified with Railway doctor plus live smoke `ops/live-smokes/2026-06-10T05-41-59-944Z-live-app-smoke.md`
- [x] Fix BNA task list project assignment bug: live task #325 is done; generic source-sheet tasks now stay in BNA unless explicitly One Time/Mishnah/Rabbi Elie, task #322 was corrected to BNA, duplicate #324 remains archived, and Railway deployment `0e351331-0fe5-4b27-96c3-d04a22ce0e04` passed doctor/live smoke
- [x] Add Content Research section for uploaded recording topics: Operations Content now has a Research tab backed by class sessions, shows sourceable topics/questions/sources/highlights, and can create Codex source-sheet tasks for whole sessions with Sefaria/source-map requirements; deployed Railway `c72af775-5e41-47cc-ad8c-27d47bd7f047`, Railway doctor, full tests, live app smoke, and live Playwright Content Research smoke passed
- [x] Build Google Classroom worksheet assignment lane: Operations assignment creator from YouTube/material links, worksheet prompt patching, per-student worksheet generation/editing, natural scheduling, optional video-processing jobs, guarded Google Classroom/Calendar sync preview/live action, and student/parent portal assignment display; deployed Railway `6b210aa5-b85a-4328-b2bd-2d41d5c31ed2`, Railway doctor, full tests, live app smoke, and live assignment UI/API smoke passed
- [x] Update public website positioning copy from "boys who don't fit the system" to "boys ready for something more than regular school" in English and Hebrew; deployed Railway `af620276-69c4-47e4-b614-fee15171381a`, Railway doctor/live smoke/live text checks passed
- [x] Import the uploaded YouTube playlist transcript Google Doc into Content: created 23 per-video transcript jobs (#32-#54), bundle #1 `YouTube playlist transcripts 2024`, matching class sessions, transcript exports, a repo bundle brief, and verified Drive content-library sync
- [x] Ship parent/student question sharing with Sefaria source suggestions, goal share toggles, parent responses, and attendance in parent portal; deployed Railway `0dfa1e49-d8b1-4cbc-8ab9-aa6ac061d244`, Railway doctor, live app smoke, and live Playwright smoke passed
- [x] Deploy Operations filter overlays, polished student picker, student daily Goal Board rows/chart/message-rabbi flow, passwordless parent portal access, and duplicate email guards; Railway `6a4bbd52-5c36-467e-b46c-23d31bfeff74`, live app smoke, and live Playwright smoke passed
- [x] Add inline comments inside expanded Operations task details and protect Windows+H dictation/text entry from background dashboard re-renders; live HTML check and live app smoke passed on deployment `ed9b96a0-1a0a-4e23-a6fc-7beb34b4e584` while Railway CLI still reported `INITIALIZING`
- [x] Fix Operations decision-card completion flow: resolved decision cards now leave Decisions, plain decisions close into Done, and selected options that create agent work move to Changelog; deployed Railway `af620276-69c4-47e4-b614-fee15171381a` and live smoke passed
- [x] Update Content prompt feedback workflow so WhatsApp, Facebook, newsletter, website blog, LinkedIn, and YouTube outputs use one correction/regenerate action that patches and versions the saved prompt before regenerating; deployed Railway `a54d62da-0abc-4986-83ae-a5ad3df35d6f` and live smoke passed
- [x] Switch social posting from legacy CRM Social Planner to Buffer for Facebook, LinkedIn, and YouTube; Railway env, server approval path, Telegram bridge copy, Operations buttons, diagnostics, deploy, and live smoke are verified
- [x] Test the WhatsApp-first content lane with a real long video upload
- [x] Re-ingest/audit old raw rambles into the new Tasks / Students / Content / Contacts / Accounting model; live audit now shows 0 active tasks and 0 raw-looking task titles
- [x] Add Telegram student-match decision buttons when accountability capture cannot confidently match a student
- [x] Remove Telegram per-task owner/status buttons and make parser routing explicit in capture replies
- [x] Expand student accountability fields for meeting attendance, goal progress, engagement, follow-up, and next check-in
- [x] Add protected payment reminder preview/dry-run/send controls for Accounting
- [x] Clean Tasks UI so cards open details by click and no longer show raw ramble/test buttons
- [x] Remove bad `Fh` test student/signup from active BNA views
- [x] Tighten WhatsApp/Facebook/weekly-update prompts to English, natural, and not corny
- [x] Complete Google OAuth once and create the live `BNA V2` Drive pipeline folders
- [x] Wire `/ingest_drive` in Telegram after Drive folder IDs are available in Railway
- [x] Wire direct Google Drive doc sync commands so Drive Platform Memory docs can update repo `content-memory/`
- [x] Promote approved platform outputs into reusable prompt examples automatically
- [x] Add Content Prompt Studio with prompt versions, examples/files, regenerate, approval, and weekly bundles
- [x] Replace `Active Work` with `Decisions` and keep personal tasks separate from undecided choices
- [x] Remove generic Tasks pending/planned language; open work now stays in Decisions, My Tasks, Changelog Queue, Done, or Archive
- [x] Simplify Operations Tasks so machine work is visible inside Changelog from queued to in-progress to verified instead of a separate Codex Queue lane
- [x] Add required 2026-2027 registration document package signature flow from `bnei_neviim_registration_documents_bilingual_codex.md`; do not use the old Student Contract file
- [x] Replace the signup package flow with six separate full-screen document cards/signatures: Tuition Agreement, Parent Handbook, Student Code of Conduct, Safety Waiver, Registration/Intake, and Parent Agreement/Signature Page
- [x] Update signup payment options to first tuition payment by credit, cash, or bank transfer and switch the default Morning payment link to `https://mrng.to/rCH4DWiR5t`
- [x] Deploy latest signup/task UI changes to Railway, set production `PAYMENT_LINK=https://mrng.to/rCH4DWiR5t`, and verify live signup package/bank-transfer UI
- [x] Remove the visible Planned/Implementation Briefs section from Operations Tasks; `tasks-pending/*.md` now stays internal to Codex handoffs
- [x] Rework Content Library into collapsed cards with per-card generation and selected multi-card generation
- [x] Make Telegram content buttons use the same versioned prompt generator as the dashboard
- [x] Configure content generation with provider fallback
- [x] Remove raw natural-language Telegram wording from visible Tasks/Changelog cards
- [x] Add shared Codex task ledger and agent changelog under `ops/`
- [x] Add persistent Telegram `OpenAI API` / `Codex` mode buttons and route ordinary chat to OpenAI API by default
- [x] Add repeatable OpenAI sidekick smoke test for repo, app API, Drive, transcripts, and Telegram access
- [x] Expand Telegram OpenAI sidekick live Operations context so it can answer dashboard section/button/task/accountability/content/contact/accounting/system questions from protected app data instead of only transcripts
- [x] Build autonomous Codex agent fleet supervisor for queued machine work and verifier smokes
- [x] Clean Content routing so goals, tasks, and accountability leave Content while class topics and sources stay visible
- [x] Build automatic student accountability tablet-access MVP: bedtime/wake-up agreement fields, self-checkoff auto-approved access sessions, missed-goal lock/accountability review, Operations filters, and student portal access-rule display
- [x] Build project-scoped task collaboration for BNA and One Time Mishnah Class
- [x] Add task comments, Decision Required marker, and One Time category/assignment support
- [x] Add Rabbi Elie Scheller scoped login/access and Telegram agent wiring on the shared framework; live bot startup still needs Rabbi bot token/chat credentials
- [x] Reconcile paid-but-unlinked intake records for Weber/Huda and Galambo/Eitan into admin-created signup rows; missing contact fields are intentionally blank and `needs_signup` intake count is now 0
- [x] Build the content parser beyond WhatsApp: transcript -> tasks, accountability, class notes, parent notes, newsletter snippets
- [x] Add Content section website-blog generation/publish controls so approved recordings/videos/content can become public blog posts on the website
- [x] Add Drive Raw Intake website-image automation so a single dropped image can be approved/pushed into the public website image lane
- [x] Push updated `GOOGLE_DRIVE_PIPELINE_CONFIG` to Railway with Website Images intake and simplified folder metadata
- [x] Stop the elevated stale Telegram poller process PID `178552` and restart the bridge so the newest Telegram research/proactive-insight code is live
- [x] Extend Telegram/day-recording parser to update student accountability and Torah daily goal completion from spoken progress reports
- [x] Harden mixed recording parser routing and compact Content cards: topic-only collapsed cards, expanded detail sections, auto-parse triggers, and duplicate-safe filing
- [x] Add first-pass mixed recording parser: content job -> tasks, student accountability, class notes, and group-goal entries with fallback review report
- [x] Add edit/regenerate flow for platform drafts through tracked prompt versions
- [x] Add legacy CRM Facebook draft creation from approved content outputs
- [x] Verify the live legacy CRM Facebook publish path with a real post: Content output #52 is published as Facebook reel `6a26eb3dc39f87e2e6cf9f34`, and future draft/publish actions now store legacy CRM post readback metadata
- [x] Add blog-create flow later, after the WhatsApp lane is reliable; first-party website blog publishing is live
- [x] Add approval rules and safer target-selection for multi-account publishing
- [x] Build separate Drive `Website Moments Intake` lane that auto-adds approved images to the homepage carousel
- [x] Audit and fix live Torah group progress drift; public and admin summaries now show 15 percent for all five students and trip locked
- [x] Build daily progress update flow for the 30-page trip goal
- [x] Update homepage 30-page trip goal progress to 3.5/30
- [x] Remove public text panels from homepage Learning Moments carousel while keeping internal metadata
- [x] Wire OpenAI transcription for Telegram audio/video uploads, including long-video audio chunking
- [x] Add Telegram approve/reject buttons for WhatsApp content drafts
- [x] Add local `media-drop/inbox` ingest path for videos too large to send through Telegram
- [x] Add Google OAuth callback/setup endpoints and Drive pipeline folder generator
- [x] Add Hebrew signup form at `/signup-he.html`
- [x] Add repo-side BNA Brand Kit skeleton
- [x] Add repo-side content memory and make WhatsApp drafts read brand/platform memory plus approved examples
- [x] Align app-side AI config to `kimi-k2.6`
- [x] Set up the Telegram -> local Kimi CLI bridge into this repo brain
- [x] Fix the hosted operations login/session flow and redeploy it
- [x] Fix the signup payment flow to `Cash` vs `Credit` and redeploy it
- [x] Remove the broken `mailto:` signup fallback that opened the email app
- [x] Wire Telegram media intake into local storage with legacy CRM upload deferred until publish approval
- [x] Add Telegram commands for `/accounts`, `/blogs`, and `/queue`
- [x] Reshape operations dashboard language around Tasks, Students, Content, Contacts, and Accounting
- [x] Finish Telegram UI redesign acceptance follow-up: Contacts now uses compact clickable roster cards with a detail panel instead of a dense table
- [x] Reconcile split Telegram UI redesign messages 425-428: Content, Contacts, and Accounting now use the requested focused subtabs, Student Profile/Content/Prompts/Contacts/Accounting passed final live acceptance, and the bridge buffers split specs into the Codex task context
- [x] Reconcile Braka/Baraka partial Green Invoice payment: signup #7 now shows ILS 800 paid by Green Invoice transaction DP488806585 on 2026-06-01 09:16, ILS 200 remaining, and payment-intake #7 is matched instead of needs_signup
- [x] Convert the public homepage Blog section into a one-row horizontal carousel so only three desktop cards show at a time and the rest scroll instead of taking over the page
- [x] Audit hidden/internal work surfaces after the operator's "are things forgotten?" check and record the current live task/blocker state in `ops/system-audits/2026-06-07-forgotten-work-and-accounting-audit.md`
- [x] Merge Accounting duplicates by hiding already-matched payment-intake rows from the roster; live Accounting now shows exactly five family/student payment rows and `Needs signup` is 0
- [x] Add required signup Tuition Agreement modal/signature flow with signer name/email, server timestamp, client click timestamp, agreement version, and detailed signature record storage
- [x] Add homepage schedule section, 30-page trip goal progress bar, and Learning Moments carousel
- [x] Update homepage 30-page trip goal progress from 2/30 to 3/30 and file it as Changelog task #33
- [x] Replace reused carousel placeholder images with three new forest images from Drive Raw Intake
- [x] Add `SYSTEM-STATE.md` so Telegram/Kimi can understand recent Codex work like "the image slider"
- [x] Add `npm run learning:progress -- <pages>` for repeatable homepage progress updates

## Next

- [x] Build the Provider Commercial Model, Entitlements, and Pre-Integration Provider Setup layer: shipped free listing, paid managed setup, school/micro-school workspace, and revenue-share partner modes; provider status/commercial model/source-of-truth/integration fields; entitlement, integration, access-checklist, onboarding, and public CTA structures; Rabbi Sheller as the active revenue-share provider with Replit/Vimeo external delivery pending access; public `/providers/join`; and active-provider-only commercial admin UI. Verified with tests, screenshots, Railway deployment `ddc13990-3e9c-4b4a-872c-3cc498b25dc7`, live smoke, focused provider UI smoke, and live browser onboarding workflow. QA report: `ops/qa-runs/2026-06-11-provider-commercial-model.md`.
- [x] Agent fleet: audit and backfill the missed Telegram ingestion around messages 645-646, explain why it failed, fix the routing gap if needed, and report completion to Telegram (live task #220)
- [x] Add Telegram-driven Remotion source-video editing: `/edit_video`, `/edit_drop`, direct small upload captions, source timeline composition, and render-return path
- [x] Run the first operator-directed plain-English Remotion video edit from an available source clip and verify the rendered MP4 output; fallback source used because no fresh non-generated clip was present
- [ ] Build BNA Organic Clip Factory: ingest Drive/local image and video folders, auto-inventory assets, generate 22-second vertical Remotion clips with 2-second image chunks, captions/transcript overlays, transitions, background music, and a final flyer/update card, plus a CapCut handoff pack/prompt for manual finishing
- [ ] Produce first BNA `Set your son free` daily-video intro clip: use the 4K Downloader audio segment from 1:10-1:27, 4-5 slow-motion boy clips from local/Drive sources such as drums and cooking, pan/zoom transitions, top title overlay, and a roughly 15-second intro render
- [ ] One Time: map first-party BNA Operations capability for the Rabbi Sheller platform before external writes: contacts, tags, pipelines/opportunities, calendars/classes, payments/access, workflows, community/membership support, social/content posting through Buffer, and browser-only gaps in Rabbi-owned systems
- [ ] One Time: turn the partnership proposal into a drafting pack for Claude or another writing assistant: cleaner agreement draft, values checklist, refund/cancellation policy, family/device and Zoom/access rules, landing-page copy, launch emails, and reactivation copy
- [ ] One Time: design the Rabbi content/media intake workflow from Drive drops into recordings, source sheets, worksheets, question digests, organic clips, ad candidates, approval, posting, and reporting
- [x] One Time: ship first-pass external Rabbi portal/ticketing: generated scoped One Time Operations login, deployed `one_time_admin` project scope, Team tickets and Tasks > Schedule instead of a separate Roadmap section, project-scoped task/comment/parent/student/support-ticket APIs, final proposal task scheduling/workflow metadata seeding, and scoped Telegram support-ticket capture. Railway deployment `35707ab0-1069-44e3-a34d-0a062ca7833c`, Railway doctor, live smoke `ops/live-smokes/2026-06-10T13-03-37-257Z-live-app-smoke.md`, OpenAI smoke `ops/openai-smokes/2026-06-10T13-04-44-064Z-openai-sidekick-smoke.md`, and focused One Time live visual smoke passed.
- [ ] One Time: finish broader Users/account management UI under Shloimie super admin, beyond the first scoped Rabbi login, so future external users can be managed cleanly without treating them as parents
- [ ] One Time: finish live Rabbi bot runtime by collecting the confirmed Rabbi chat ID, setting `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`, choosing/starting the hosted bridge worker for `npm run telegram:rabbi`, and smoking `/status`, task/comment, and ticket creation; scoped One Time username/password are now installed locally and on Railway
- [x] Live task #260: Fix parent access link and polish parent/student dashboards; direct parent links, student daily/source display polish, weekly private meeting slots, parent financial/attendance dashboard, July registration-renewal safeguards, deployment, Railway doctor, live app smoke, and targeted production portal smoke passed
- [x] Fix Operations parent-login link handoff so the emailed parent portal link opens directly for the parent email on file without requiring the parent to type the email again; keep email copy, make clipboard failure non-blocking, and verify parent session creation. Deployed Railway `ccd3c5a4-5776-4382-b2e1-a365a459c960`; live smoke and targeted parent/student HTML checks passed.
- [ ] Polish student portal daily display/filtering: Hebrew source refs even in English UI, collapsible question/resource cards, clearer goal filters for today/upcoming/waiting/done, and meeting/message-rabbi visibility
- [ ] Assign weekly private meeting slots for all active boys between 9:00 and 10:00, one student per weekday while roster is five boys, then show the meeting day/time in student and parent portal dashboards
- [ ] Build parent dashboard financial/attendance panel: today's attendance, overall attendance, up-to-date/payment state, parent-visible financial reminders, and bottom WhatsApp button to Rabbi Shloimie
- [ ] Prepare and test July 1 registration-renewal email/flow: existing emails can resubmit signup, sign all documents/handbooks/agreements, receive yearly/prorated billing copy, and get the correct credit-card link once the old/new payment links are confirmed
- [ ] Add internal/external accountability filters and parent agreement inputs: distinguish BNA school students from external accountability people, show boy/girl/external grouping, and let parents add bedtimes/child agreements tied to parent/Rabbi weekly meeting schedules; coordinate with the active filter/dropdown agent and do not overwrite their filter refactor
- [x] Live task #311: Audit Telegram bot button/API coverage for Goal Board and parent accountability fields; Telegram text/media routing now preserves sections, subsections, checklists, bedtime agreements, consequences, incentives, parent meeting summaries, and reviewed student visibility while keeping parent recordings out of Content jobs
- [ ] Add Shotstack or Creatomate credentials and render adapter for cloud/platform-specific video edits if local Remotion rendering is not enough; blocked until a cloud-render provider is chosen and credentials exist
- [x] Add first-pass selected-content generator so Newsletter/Facebook/WhatsApp/etc. can use multiple recordings with the same saved prompt
- [x] Add richer weekly newsletter review/edit workflow after bundle generation is reliable; live dashboard now supports review bundles, source lists, draft edit/save, regenerate, approve/example, and archive without sending email
- [ ] Add guarded weekly newsletter recipient preview, test-send, and typed-confirmation live send after parent recipient list/approval rules are confirmed
- [ ] Rotate/renew the Buffer `BNAv2` API key before it expires on 2026-07-09 and update Railway/local secrets without committing the key
- [ ] After the next intentional Railway deploy, verify the latest deployment record no longer points at stale bad deployment `47f8d5d1-c425-4a79-8e31-ec4cb71f5dcc`; live app is healthy, but CLI `railway:doctor` still sees that stale `INITIALIZING` record
- [ ] Call Hillel's rabbi about whether to keep his learning approach inspiration/connection-first before moving him into text-based learning (live task #172)
- [ ] Set up updated payment links: new signups immediate charge then first-of-month 12-payment schedule; existing credit-card parents first-of-month link with no immediate charge (live task #173)
- [ ] Update `www.bneineviimacademy.org` DNS/Railway custom-domain setup so the www address gets a valid certificate or redirects cleanly (live task #194)
- [x] Build first-pass Contacts `Interested Parents` CRM lane with BNA-owned lead status, lead category, interest level, tags, notes, next follow-up, historical legacy CRM linkage fields, and a separate Communications log; seeded Adina Block and Sari Kaplan as school-interest leads
- [ ] Add hosted-media URL support for Buffer social posts so Telegram/Content photos and videos can attach to Buffer drafts instead of creating text-only drafts
- [ ] Build WAPI/Whapi WhatsApp lead-candidate review importer: audit recent WhatsApp contacts into reviewable first-party candidates, match current parents first, and avoid any external CRM writes
- [ ] Build WAPI/Whapi WhatsApp conversation history sync for Contacts cards: match by normalized phone/first-party contact, store safe conversation/message history, and render recent parent/lead WhatsApp messages inside the matching expanded card
- [ ] Confirm whether the intended Wappy product is `wappy.chat` or `wappy.ai`, and verify number portability, WhatsApp Business API access, webhooks/API export, Zapier/Pipedrive timing, AI automation, and data ownership before choosing any future WhatsApp connector
- [x] Redesign Operations section top controls into compact subcategory count buttons plus open date/status/category/tag filters, removing duplicate large count cards across Tasks, Students, Content, Contacts, and Accounting
- [x] Implement Drive Raw Intake website-image watcher from `tasks-pending/2026-06-03-website-moments-and-parser-routing.md`
- [x] Archive stale family-accountability docs and dormant Next/Supabase code paths; retained legacy files now live under `docs/archive/` and are marked historical reference only
- [ ] Decide whether the long-term runtime stays Express or moves fully to Next
- [ ] Rebuild the operations dashboard against one canonical API surface
- [x] Add smoke tests for login, task APIs, signup submit, and contact sync
- [x] Configure Green Invoice webhook logging, reconciliation, and manual reprocess path
- [ ] Verify Green Invoice sender-side webhook delivery/log settings once account access is available; app-side receiver/log/reprocess path is complete
- [x] Clean Green Invoice app route so only one live `/api/webhooks/green-invoice` handler processes production webhooks
- [x] Fix Railway deploy bundle so `src/` library imports are included in production
- [x] Add a bot command to trigger Railway deploys and smoke checks from Telegram (`/railway_deploy`)

## Blockers

- [x] First-party website blog posting is live; an external CRM blog site is no longer required for BNA website articles
- [x] Buffer social account lookup is the active social scheduler path for Facebook, LinkedIn, and YouTube
- [x] Content approval no longer depends on the old default Facebook account env var; ambiguous social posting should resolve through Buffer channel/account selection
- [ ] Google posting needs explicit alias selection because multiple Google accounts are connected
- [ ] Rabbi Elie scoped Telegram bot token is configured locally and in Railway, with `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false`; the One Time Drive folder and scoped Operations login are set up and smoke-tested, but live bot startup intentionally blocks until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is confirmed and a hosted bridge runtime for `npm run telegram:rabbi` is chosen/started
- [ ] Real Android/tablet shutoff requires a physical test tablet plus confirmed QStudio/Qustodio/Headwind/FreeKiosk credentials; app-side device control is mock-only until then
- [ ] Green Invoice sender-side delivery logs/settings require access to the Green Invoice account; app receiver, logs, idempotency, and reprocess are already built
- [ ] Cloud video rendering requires choosing/provisioning Shotstack, Creatomate, or another provider if local Remotion is not enough
- [x] Unsynced paid intake records were reconciled into admin-created signup rows; unknown parent contact fields are intentionally blank instead of blocking the Accounting roster
- [x] Voice/audio transcription is wired through the content ingestion path
- [x] External CRM blog posting is not required for first-party website blogs; Buffer remains the social distribution connector

## Recent Wins

- [x] Create the full UX click-map audit package without redesigning the app: captured and organized 2,237 live screenshots across desktop, laptop, tablet, mobile, and small-mobile; generated `manifest.json`, `screenshots.csv`, `actions.csv`, `routes.csv`, `flows.csv`, `issues.csv`, navigation map, role/workspace matrix, context-clarity failures, button/action audit, mobile audit, top findings, implementation backlog, and screenshot index at `ops/ux-audit-runs/2026-06-11-click-map/`; mirrored the folder to Google Drive `BNA UX Audit / 2026-06-11 Click Map` with 2,273 uploaded files and 0 upload failures.
- [x] Deployed parent-driven accountability and Hebrew parent portal defaults: parent chat/meeting uploads can create parent-visible, student-hidden pending-review Goal Board items with sections/subsections/checklists/agreements/consequences/incentives; parent portal has Hebrew/English toggle, Hebrew/RTL default from Hebrew tags, goal section/status filters, parent parser instructions, and multi-file/folder meeting upload. Live Menachem goal #81, Esti external record #53986, and Amitai Kosofsky Hebrew tags were verified. Railway deployment `b086984f-904f-458f-8a2e-759a1dd4db3a`, Railway doctor, and live app smoke passed.
- [x] Restored the installed phone/PWA app so it opens Operations while normal browser visits to `/` still show the public website; deployed Railway `9033bcc2-b822-472b-bcae-087becc6140e`, Railway doctor, live app smoke, live manifest/redirect checks, and live mobile Playwright Operations smoke passed.
- [x] Updated live Dratler accountability records: Menachem Mendel Dratler now syncs to Ahuva Dratler for parent portal access, signup #8 preserves prior Shloimie contact details in notes, Esti Dratler was added as a separate external accountability record with a private access code, and Ahuva parent-login link generation was verified without sending email.
- [x] Clarified Operations parent portal buttons after deployment: parent records now show `Open Parent Portal` for Shloimie inspection/copy with no email sent, `Email Login Link` for emailing the parent, and `WhatsApp Login Link` for confirmed WhatsApp send. Railway deployment `017f1a95-ccb1-477e-bb0a-3c414bf34ac8` reached SUCCESS; live app smoke and authenticated Operations HTML checks passed.
- [x] Fixed and deployed the parent portal access-link handoff: Operations email/WhatsApp login links now use the parent email on file, clipboard failures no longer make a sent email look failed, parent link-opening state is visible, lead records can receive portal links, and parent/student source labels prefer Hebrew `heRef`. Student portal question cards and goal cards are collapsible, with today/waiting goals opened by default. Railway deployment `ccd3c5a4-5776-4382-b2e1-a365a459c960` reached SUCCESS; `npm test`, live app smoke, and targeted live HTML checks passed.
- [x] Re-fixed the Content prompt feedback regenerate flow on 2026-06-09: the bottom action now reads `Apply Correction + Regenerate`, shows an inline patch/regenerate waiting state, preserves correction text on errors, updates the draft in place from the API response, and refreshes the patched prompt text; deployed to Railway and live smoke `ops/live-smokes/2026-06-09T18-01-36-963Z-live-app-smoke.md` passed.
- [x] Re-fixed the public homepage/PWA regression on 2026-06-09 after later changes restored the Operations manifest at `/manifest.json`. Live `/manifest.json` is public again, `/operations-manifest.json` is Operations-only, stale `/operations?source=pwa` redirects to `/`, and live smoke passed.
- [x] Added and deployed Tasks `Torah Research` category for halacha/source lookup questions: mixed recordings now route marked halacha research questions to Codex-owned Torah Research tasks with Sefaria search/API instructions, direct Sefaria-link requirements, source maps, source summaries, and open points for Shloimie/rav review; student philosophy/hashkafa questions stay in Student Questions/class notes. Railway deployment `8181117e-0d32-4127-b96f-52fac247e081` reached SUCCESS.
- [x] Deployed Operations-wide dropdown filter cleanup: Tasks, Students,
  Content, Contacts parent roster, Contacts interested-parent leads, and
  Accounting now use compact dropdowns for variable filters such as category,
  project, status, payment, tags, media, method, source, interest, and
  accountability state, while date choices remain compact chips. Railway
  deployment `bdbcd6d9-a1df-4671-96c3-9dea7d429135` reached SUCCESS and live
  smoke `ops/live-smokes/2026-06-09T06-21-28-612Z-live-app-smoke.md` passed.
- [x] Deployed first-pass Contacts Interested Parents CRM: live Contacts now has `Interested Parents` and `Communications` subtabs, school/content/group lead categories, lead status/interest filters, notes/touchpoints, quick follow-up/status actions, and seeded school-interest leads for Adina Block and Sari Kaplan. Railway deployment `c79744c8-94ca-42bc-a889-637084075f00` reached SUCCESS, live smoke `ops/live-smokes/2026-06-09T06-15-10-568Z-live-app-smoke.md` passed, and production UI/API checks confirmed both leads and notes.
- [x] Deployed inline Contacts parent cards and compact tag dropdowns: parent
  cards now open their own full detail in place, the tag filter is one dropdown,
  existing tags can be applied from the expanded card, and the future WhatsApp
  conversation-history sync is explicitly tracked as separate work. Railway
  deployment `f7307ad7-3c44-4e96-8342-47b49fe8c837` reached SUCCESS and live
  smoke `ops/live-smokes/2026-06-09T06-07-33-468Z-live-app-smoke.md` passed.
- [x] Deployed the Operations-wide compact subcategory/filter cleanup: Tasks, Students, Content, Contacts, and Accounting now show counts once in the top subcategory buttons, open section filters underneath, and no duplicate large count cards. Railway deployment `7cba3b98-cd37-4059-9f10-87d20c6e09bd` reached SUCCESS and live smoke `ops/live-smokes/2026-06-09T05-35-48-705Z-live-app-smoke.md` passed.
- [x] Built and deployed the BNA agent watchdog on top of `agent-fleet-supervisor.mjs`: `npm run watchdog:once/start/status`, `.runtime/watchdog` locks/state, timestamped `ops/system-audits/*-watchdog` reports, live `/api/bna/agent-fleet/status` watchdog details, soft stale-task repair rules, Telegram alert deduping, and Railway doctor visibility. Railway deployment `84c9e8b3-00ac-4031-b6e6-12629a6725c9` reached SUCCESS.
- [x] Restored Android/PWA Operations launch while keeping the public `.org` root as the website. `/manifest.json` and `/operations-manifest.json` now start at `/operations`, standalone root launches redirect to `/operations`, stale `/operations?source=pwa` shortcuts stay in the Operations login flow, the service worker cache is bumped, and Railway deployment `15de2d24-fedf-4fe1-83b4-461b4805b951` reached SUCCESS with live smoke and live PWA checks passing.
- [x] Corrected the June 7 and June 8 Torah audio parse, added admin-only Student Analysis in Operations, created live follow-up tasks #172 and #173, deployed Railway deployment `39e03acd-7199-4e65-ba88-a5e7fe8043c3`, and verified with `npm test`, OpenAI smoke, live app smoke, Railway doctor, and production Playwright.
- [x] Completed the Telegram UI redesign follow-up for task #130: after the app shell/sidebar/subtabs deploy, Codex removed the student portal Add Goal/configuration UI and collapsed the admin Goal Board creation form behind an Add Goal expander. Railway deployment `54a5e5f4-078a-4ce6-b76d-2f60d022e9f1` passed live smoke `ops/live-smokes/2026-06-07T08-55-35-102Z-live-app-smoke.md` and targeted live student-portal mobile validation.
- [x] Deployed the first-pass BNA Command Center UI cleanup: Operations now has a top Daily Command Center, cleaner task lanes/cards, clearer student accountability/device signal cards, compact Content next-action cards, roster-only Accounting, a simplified student portal command strip, and shared public-page spacing/card polish. Railway deployment `683dc322-538e-4ca0-bdb5-272c194d9861` passed live smoke `ops/live-smokes/2026-06-07T03-00-07-526Z-live-app-smoke.md`.
- [x] Fixed the Operations dashboard `column j.summary does not exist` load error by correcting the content-bundles API summary query; added that endpoint to live smoke coverage and deployed a clearer Task Manager strip with active filters, clear filters, and separate Decisions/My Work/Rabbi/Codex lanes.
- [x] Deployed automatic accountability-based tablet access MVP: students can create bedtime/wake-up agreements, choose the rule/consequence, and a 100 percent checkoff automatically opens the configured approved-access session in the BNA device layer while Q Studio/Qustodio remains the content filter.
- [x] Fixed the agent-fleet completion gap: deployable app changes now require Railway redeploy plus live doctor/smoke before a Codex task can be marked done; cleaned and closed stuck raw task #99 with a speaker-diarization implementation brief.
- [x] Cleared the live Changelog Queue: the agent fleet completed/verified tasks #43, #49, #65, #72, and #98; Codex manually closed #100 and #101 after adding OpenAI web-search research mode plus proactive-insight prompt rules. Latest smoke reports Active Codex tasks: 0.
- [x] Fixed the cause of the crazy-long Telegram/task output: the agent fleet was writing raw Codex CLI failure output into visible `verification_notes` for task #100. Future failures are summarized, with the full raw log kept only in `ops/agent-fleet-runs/`.
- [x] Added OpenAI Responses `web_search` research mode for Telegram OpenAI questions about current info, APIs, frameworks, YouTube/research needs, SEO/AEO/GEO, and similar research prompts.
- [x] Built the autonomous Codex agent fleet: `scripts/agent-fleet-supervisor.mjs` claims live Changelog Queue tasks, locks them, runs Codex CLI, runs verifier commands including `npm test` and `npm run openai:smoke`, updates task comments, writes `ops/agent-fleet-runs/`, appends the changelog/ledger, and notifies Telegram. Telegram commands added: `/agent_fleet_status`, `/agent_fleet_start`, and `/agent_fleet_once`. Live umbrella task #67 was marked done/verified; active queue is now #72, #65, #49, #43.
- [x] Updated Operations Tasks so Changelog shows queued, in-progress, and completed agent work in one visible place.
- [x] Smoke-tested the OpenAI Telegram sidekick end-to-end: `npm run openai:smoke -- --telegram` passed, proving OpenAI can read repo memory files, 18 transcript exports, 10 protected BNA app endpoints, 7 Drive folders, live student/payment/task/Torah data, and send the Telegram summary. Added `/smoke_openai` for future Telegram reruns; latest report is `ops/openai-smokes/2026-06-05T11-35-17-138Z-openai-sidekick-smoke.md`.
- [x] Completed the QStudio/Qustodio/FreeKiosk device-control implementation brief with a sub-agent checklist at `tasks-pending/2026-06-05-qstudio-device-control-checklist.md`; live task #81 is done/verified, with hardware/login verification left for the real devices.
- [x] Fixed another Telegram OpenAI content routing gap: transcript/topic requests like "list what we learned this week from all transcripts" now generate an in-chat OpenAI topic inventory directly instead of asking A/B/C format questions or turning into a Codex task; the missed weekly inventory was generated from 8 live transcript jobs and sent to Telegram.
- [x] Cleaned and simplified the Google Drive pipeline: `BNA V2` now uses clear upload folders for raw media and website images, source media is consolidated in `20 Processed Recordings - Source Media`, old redundant stages are archived, brand/memory/transcripts are GitHub-canonical, 18 transcript Markdown files were exported, and the Telegram bridge was restarted with the new folder wording.
- [x] Routed Telegram content-draft edits and approvals through OpenAI/API content workflows so saved WhatsApp/Facebook/newsletter/blog outputs can be revised, approved, and saved as examples directly instead of becoming Codex tasks
- [x] Split Operations Tasks into a visible agent queue inside `Changelog`; live smoke at the time showed 8 queued agent tasks and 38 changelog items, and cleaned queue titles
- [x] Replaced recycled blog card imagery with dedicated downloaded media thumbnails under `public/images/blog/`, including representative screenshots from videos
- [x] Expanded Telegram OpenAI sidekick context with capability/sync rules, shared ledger/changelog tails, live BNA app snapshots, Drive snapshots, and a `/capabilities` command
- [x] Updated Telegram task automation so Codex-owned captured tasks auto-start, move to in-progress, and send Telegram completion reminders when tracked tasks are marked done
- [x] Added Drive-aware Telegram OpenAI replies and `npm run drive:audit`; the current credential sees `office@bneineviimacademy.org` My Drive, zero Workspace Shared Drives, and the latest processed video `20260604_191840.mp4` in `BNA V2 / 04 Parsed`
- [x] Switched the Telegram bridge from provider-chat mode to Codex CLI primary for plain development messages; restarted live bridge on PID `123424` and verified startup log reports `Primary=codex`
- [x] Added Telegram-driven Remotion source-video editing: `NaturalVideoEdit` composition, `scripts/video-edit-source.mjs`, package scripts, `/edit_video` for Drive Raw Intake, `/edit_drop` for local drop folder, direct small-upload edit captions, bridge restart on PID `25032`, and smoke render for speed/brightness/subtitle timeline edits
- [x] Hardened Operations Content and mixed recording parsing on Railway deployment `f167fd34-7dd4-4671-bcfc-64fc6dddc006`: compact cards now show only short English topic chips, expanded cards keep full details, audio/video uploads can auto-route personal tasks vs Codex/system tasks vs student accountability/Torah progress, latest content job #19 is parsed, and duplicate parse calls are skipped safely
- [x] Added natural-language Remotion editing command: plain English requests now generate safe video props and render MP4s via `npm run video:edit`
- [x] Installed and verified Remotion video studio tooling with BNA starter portrait/wide compositions and rendered MP4 outputs in `renders/`
- [x] Converted the public homepage into a one-page Blog/FAQ experience with anchor navigation, topic filters, FAQ filters, homepage Blog/FAQ JSON-LD, `robots.txt`, and `sitemap.xml`; live smoke passed on Railway deployment `631758d2-d759-46e0-886b-d85322502b95`
- [x] Simplified Operations Accounting into one payment roster and removed Recent Payments, Pending Payments, and Green Invoice webhook audit from the visible payment section on Railway deployment `0b7adc21-6b1b-423b-aa73-190ed27964ee`
- [x] Launched public Blog, Article, FAQ, Hebrew route shells, homepage philosophy cards, Blog/FAQ navigation, and SEO/AEO JSON-LD on Railway deployment `da9dfcc5-94e8-473e-abf4-5cc85f2da6b4`
- [x] Found and fixed the legacy CRM auth issue in code by switching to the current legacy CRM PIT API
- [x] Found and fixed the broken operations login/session flow in local code
- [x] Confirmed local Kimi CLI is configured for `kimi-k2.6`
- [x] Created a repo-level pending-work convention using `tasks-pending/*.md`
- [x] Local Telegram bot now routes directly to local Kimi CLI on `kimi-k2.6`
- [x] Confirmed the connected legacy CRM social accounts for Facebook, YouTube, and Google
- [x] Confirmed legacy CRM media upload works from local code
- [x] Confirmed legacy CRM social draft creation works from local code
- [x] Confirmed 2026-06-01 that Content job #6 uploads video to legacy CRM media and creates a Bnei Neviim Academy Facebook draft
- [x] Added a legacy CRM Social diagnostics endpoint at `/api/bna/legacy CRM-social/diagnostics`
- [x] Cleaned the Operations task manager language so old raw rambles stay out of the visible task UI
- [x] Mobile-smoked Tasks, Content, and Students with Playwright after the task/content/student UI changes
- [x] Fixed Railway deploy auth loop by switching scripts to project-token mode and explicit service/environment targeting
- [x] Added `npm run railway:doctor` as a repeatable pre-deploy health check
- [x] Redeployed to Railway and smoke-tested live health, homepage, operations login, and mobile Operations views
- [x] Added structured student accountability fields and mobile student profile metrics
- [x] Removed Telegram quick action buttons for captured tasks; owner and lane now come from parser routing.
- [x] Tightened Tasks routing: Changelog is read-only machine work, Done is Shloimie's completed personal work
- [x] Added safe payment reminder endpoints and Accounting UI controls; local smoke passed without sending live email
- [x] Added Telegram student-match buttons for unmatched accountability notes and a protected accountability PATCH endpoint
- [x] Verified legacy CRM Facebook draft creation works for text and media content through the Content action path
- [x] Added Content tab and database tables for raw uploads, platform drafts, and approval status
- [x] Added shared content pipeline brief at `tasks-pending/2026-05-27-content-repurposing-pipeline.md`
- [x] Added Content Prompt Studio: each platform output has a versioned prompt, examples/files, generate/regenerate, copy, and approval flow
- [x] Added collapsed Content Library cards and selected-content generation so multiple recordings can generate one platform draft without creating a separate prompt path
- [x] Approved content outputs now save themselves as reusable examples for that platform prompt
- [x] Live prompt-generation smoke passed on Railway using Kimi `kimi-k2.6` with prompt v1
- [x] Live Tasks smoke passed after raw task #31 cleanup and Changelog task #30 rewrite
- [x] Live selected-content smoke passed on Railway deployment `7bb99db0-1351-4e0b-ba21-baade568e1ea`: two temporary content jobs generated one WhatsApp draft with prompt v1 and were archived afterward
- [x] Live homepage smoke passed on Railway deployment `cecac732-66b3-4273-956d-8d977a936825`: 3.5/30, 12 percent, image-only Learning Moments, 0 browser errors
- [x] Created Drive `BNA V2 / 00 Website Moments Intake` folder for future homepage image intake
- [x] Corrected the Torah student list to canonical `Eitan Chaim Golombo` and marked the duplicate `Golambo` row inactive
- [x] Corrected Torah trip progress so June 3 daily completion adds one cumulative unit: all five public cards show 15 percent and the trip remains locked
- [x] Replaced the public 30-page trip tracker with the Torah group-goal system: homepage shows only names plus cumulative trip percentages, while private daily minutes/goals stay admin-only
- [x] Added Green Invoice webhook audit logging, nested payload parsing, unmatched payment intake capture, and a manual reprocess path in Accounting; local nested-payload smoke passed and the live public endpoint is serving
- [x] Cleaned Content job #19 fallback parse into concrete student accountability goals, private Torah goal minutes, and Operations student-goal checkoff buttons; live Torah public progress remains 15 percent and trip locked
- [x] Added private student checkoff links at `/student.html`; all five current students have live access codes, canonical names, 15 percent Torah trip progress, and scoped `student_goal` checkoff updates
- [x] Cleaned Accounting payment state so Braka/Baraka is the only active pending payment; Dratler and Kosofsky are paid cash, Weber is paid Green Invoice intake, and Golombo/Galambo is paid cash intake needing signup
- [x] Added first-party website blog publishing from Content outputs: `blog_draft` prompts, Operations Website Blog generation, Telegram `Make Website Blog`, approval/publish to public JSON, and dynamic homepage/blog/article loading. legacy CRM blogs are no longer a blocker for website articles.
- [x] Added homepage Learning Moments dynamic image feed plus `npm run website:add-moment -- --source ...` to optimize/copy images into the public carousel feed; Drive watcher/approval automation remains next.
- [x] Expanded mixed-recording parsing with `daily_torah_updates` so spoken daily Torah completion writes admin-visible daily entries and cumulative 30-unit trip progress recalculates without setting public trip progress to 100.
- [x] Extended Telegram Remotion editing so Drive/drop-folder companion images and audio become overlay assets for `/edit_video` and `/edit_drop`; dry-run smoke confirmed image overlay, audio overlay, and subtitle props.
- [x] Cleaned Telegram task refinement and agent ownership: task confirmations use polished titles, quick buttons show Mine/Codex/Urgent/Done, Codex is the visible machine-work owner, and Kimi is fallback only.

## Read Next

- `SYSTEM-STATE.md`
- `tasks-pending/2026-06-11-content-library-v2-build-brief.md`
- `tasks-pending/2026-05-31-website-slider-and-telegram-context.md`
- `tasks-pending/2026-05-26-login-legacy CRM-audit.md`
- `tasks-pending/2026-05-27-content-repurposing-pipeline.md`
- `tasks-pending/2026-05-27-bna-telegram-accountability-audit.md`
- `memory/2026-05-26.md`
