# BNA Tasks

## Now

- [ ] Resume the active execution run at
  `ops/execution-runs/2026-06-18-bna-platform-completion/`. Continue the next
  unblocked local implementation or verification item from `NEXT-SESSION.md`.
  Only screenshot-specific audit package/comparison items wait for the audit
  ZIP or output path. Do not deploy or mutate production data until local
  acceptance passes and Shloimie explicitly approves release.
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
- [x] Add GHL Facebook draft creation from approved content outputs
- [ ] Run a safe GHL draft write/delete smoke for Telegram `publish draft ...`; code paths and diagnostics are verified, but no live draft/post was created in this audit
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
- [x] Wire Telegram media intake into local storage with GHL upload deferred until publish approval
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

- [x] Add Telegram-driven Remotion source-video editing: `/edit_video`, `/edit_drop`, direct small upload captions, source timeline composition, and render-return path
- [x] Run the first operator-directed plain-English Remotion video edit from an available source clip and verify the rendered MP4 output; fallback source used because no fresh non-generated clip was present
- [ ] Add Shotstack or Creatomate credentials and render adapter for cloud/platform-specific video edits if local Remotion rendering is not enough; blocked until a cloud-render provider is chosen and credentials exist
- [x] Add first-pass selected-content generator so Newsletter/Facebook/WhatsApp/etc. can use multiple recordings with the same saved prompt
- [x] Add richer weekly newsletter review/edit workflow after bundle generation is reliable; live dashboard now supports review bundles, source lists, draft edit/save, regenerate, approve/example, and archive without sending email
- [ ] Add guarded weekly newsletter recipient preview, test-send, and typed-confirmation live send after parent recipient list/approval rules are confirmed
- [x] Implement Drive Raw Intake website-image watcher from `tasks-pending/2026-06-03-website-moments-and-parser-routing.md`
- [ ] Clean out stale family-accountability docs, prompts, and dead code paths
- [ ] Decide whether the long-term runtime stays Express or moves fully to Next
- [ ] Rebuild the operations dashboard against one canonical API surface
- [x] Add smoke tests for login, task APIs, signup submit, and GHL sync
- [x] Configure Green Invoice webhook logging, reconciliation, and manual reprocess path
- [ ] Verify Green Invoice sender-side webhook delivery/log settings once account access is available; app-side receiver/log/reprocess path is complete
- [x] Clean Green Invoice app route so only one live `/api/webhooks/green-invoice` handler processes production webhooks
- [x] Fix Railway deploy bundle so `src/` library imports are included in production
- [x] Add a bot command to trigger Railway deploys and smoke checks from Telegram (`/railway_deploy`)

## Blockers

- [x] First-party website blog posting is live; a GHL blog site is no longer required for BNA website articles
- [x] GHL Social Planner diagnostics is live-smoke green again; latest `npm run app:smoke -- --require-drive` returned configured, 1 Facebook account, 3 other accounts, and posts read OK
- [x] `GHL_DEFAULT_FACEBOOK_ACCOUNT_ID` is optional while only one active Facebook account exists; Content approval now refuses ambiguous multi-Facebook drafting if more are added without a default
- [ ] Google posting needs explicit alias selection because multiple Google accounts are connected
- [ ] Rabbi Elie scoped Telegram bot needs `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`, `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`, and scoped One Time login credentials before live startup
- [ ] Real Android/tablet shutoff requires a physical test tablet plus confirmed QStudio/Qustodio/Headwind/FreeKiosk credentials; app-side device control is mock-only until then
- [ ] Green Invoice sender-side delivery logs/settings require access to the Green Invoice account; app receiver, logs, idempotency, and reprocess are already built
- [ ] Cloud video rendering requires choosing/provisioning Shotstack, Creatomate, or another provider if local Remotion is not enough
- [x] Unsynced paid intake records were reconciled into admin-created signup rows; unknown parent contact fields are intentionally blank instead of blocking the Accounting roster
- [x] Voice/audio transcription is wired through the content ingestion path
- [x] GHL blog posting is not required for first-party website blogs; GHL remains optional for distribution/contact workflows

## Recent Wins

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
- [x] Found and fixed the GHL auth issue in code by switching to the current HighLevel PIT API
- [x] Found and fixed the broken operations login/session flow in local code
- [x] Confirmed local Kimi CLI is configured for `kimi-k2.6`
- [x] Created a repo-level pending-work convention using `tasks-pending/*.md`
- [x] Local Telegram bot now routes directly to local Kimi CLI on `kimi-k2.6`
- [x] Confirmed the connected GHL social accounts for Facebook, YouTube, and Google
- [x] Confirmed GHL media upload works from local code
- [x] Confirmed GHL social draft creation works from local code
- [x] Confirmed 2026-06-01 that Content job #6 uploads video to GHL media and creates a Bnei Neviim Academy Facebook draft
- [x] Added a GHL Social diagnostics endpoint at `/api/bna/ghl-social/diagnostics`
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
- [x] Verified GHL Facebook draft creation works for text and media content through the Content action path
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
- [x] Added first-party website blog publishing from Content outputs: `blog_draft` prompts, Operations Website Blog generation, Telegram `Make Website Blog`, approval/publish to public JSON, and dynamic homepage/blog/article loading. GHL blogs are no longer a blocker for website articles.
- [x] Added homepage Learning Moments dynamic image feed plus `npm run website:add-moment -- --source ...` to optimize/copy images into the public carousel feed; Drive watcher/approval automation remains next.
- [x] Expanded mixed-recording parsing with `daily_torah_updates` so spoken daily Torah completion writes admin-visible daily entries and cumulative 30-unit trip progress recalculates without setting public trip progress to 100.
- [x] Extended Telegram Remotion editing so Drive/drop-folder companion images and audio become overlay assets for `/edit_video` and `/edit_drop`; dry-run smoke confirmed image overlay, audio overlay, and subtitle props.
- [x] Cleaned Telegram task refinement and agent ownership: task confirmations use polished titles, quick buttons show Mine/Codex/Urgent/Done, Codex is the visible machine-work owner, and Kimi is fallback only.

## Read Next

- `SYSTEM-STATE.md`
- `tasks-pending/2026-05-31-website-slider-and-telegram-context.md`
- `tasks-pending/2026-05-26-login-ghl-audit.md`
- `tasks-pending/2026-05-27-content-repurposing-pipeline.md`
- `tasks-pending/2026-05-27-bna-telegram-accountability-audit.md`
- `memory/2026-05-26.md`
