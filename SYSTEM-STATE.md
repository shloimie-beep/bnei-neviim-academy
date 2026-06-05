# BNA Current System State

Last updated: 2026-06-05

2026-06-05 autonomous Codex agent fleet:
- Built `scripts/agent-fleet-supervisor.mjs` as the guarded worker loop for
  live Operations Codex Queue tasks.
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
- The Operations Tasks Changelog focus now shows pending plus completed agent
  work; Codex Queue remains the pending-only view.
- Live umbrella task #67 was marked done/verified after this build. Latest
  baseline smoke sees active Codex tasks `72, 65, 49, 43`.
- The local watcher was started after verification. Supervisor PID `37572`
  claimed task #43 first; Telegram bridge PID after restart was `203012`.

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
  `TASKS.md` and the newest `tasks-pending/` briefs, start executing, and
  report completed/verified work. Do not ask for ordering confirmation unless
  there is a real blocker or product decision.
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
