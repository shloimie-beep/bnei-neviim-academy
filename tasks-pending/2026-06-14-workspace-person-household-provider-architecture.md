# Workspace / Person / Household / Provider Architecture Handoff - 2026-06-14

## Status

Deployed and live-smoked in Railway deployment
`bb23bbe2-b131-4c5a-9597-bdecddf48b99`.

## What Changed

- Added canonical person, workspace membership, household, provider profile,
  provider media/comment, integration connection, login, assistant, and ticket
  compatibility schema/bootstrap support in `server.js`.
- Extended `bna_projects` into the broader workspace layer with
  `workspace_type`, owner, visibility, default language, settings, and slug.
- Seeded Super Admin, BNA School, and Dratler/Family Accountability workspaces
  idempotently.
- Seeded Shloimie, Menachem, and Esty as canonical people. Menachem has one
  person record with family child/son and BNA student memberships. Esty has a
  family child/daughter membership only unless an explicit BNA school record is
  later reviewed.
- Added workspace/session APIs, parent household/setup APIs, provider profile
  APIs, public provider micro profile route, Google readiness/fallback APIs,
  assistant aliases, and ticket aliases.
- Expanded parent and provider portals with family/provider-specific sections,
  setup/filter flow, assistant entry points, provider media/comments, Google
  status, upgrade placeholder handling, and tablet/mobile-safe layout.
- Added a public provider profile page and kept the provider index compatible
  with both `/api/providers` and the legacy `/api/service-providers` endpoint.
- Added shared i18n dictionary scaffolding under `src/lib/i18n`.

## Verification

- PASS `node --check server.js`
- PASS inline script parse for `public/parent.html`, `public/provider.html`,
  `public/service-providers.html`, `public/provider-profile.html`, and
  `public/operations.html`
- PASS `node --test tests/workspace-person-household-provider-contract.test.js`
- PASS `node --test tests/service-provider-directory.test.js`
- PASS `node --test tests/parent-student-portal-contract.test.js`
- PASS `node --test tests/universal-assistant-contract.test.js`
- PASS `node --test tests/assistant-portal-communications-contract.test.js`
- PASS `node --test tests/app-select-dropdown.test.js tests/operations-pwa-login.test.js`
- PASS `npm test` 329/329
- PASS local Playwright static smoke with mocked API data at 390, 768, and 1024
  px for parent portal, provider dashboard, provider index, and provider public
  profile; no horizontal overflow or page errors.
- PASS Railway deployment `bb23bbe2-b131-4c5a-9597-bdecddf48b99`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T09-52-25-833Z-live-app-smoke.md`
- PASS focused live workspace/provider/Google fallback smoke:
  `ops/live-smokes/2026-06-14T09-54-58-038Z-workspace-provider-live-smoke.json`

## Remaining External Blockers

- Google OAuth app verification and Google Business Profile API access are not
  confirmed. The implementation exposes status/checklist/fallbacks and does not
  fake live Google reviews.
- Stripe provider upgrade links are not configured. The implementation shows a
  safe not-configured state and creates super-admin setup work.
- The local `.env.local` database is remote Supabase, so browser smoke used a
  static server with mocked API responses instead of booting `server.js` against
  the live database.

## Next Steps

1. Keep family/private data out of public provider pages and continue replacing
   legacy family assumptions through the canonical person/workspace layer.
2. Finish deeper assistant tool execution for parent/provider natural-language
   actions beyond the current thread/message/action scaffold.
3. Configure Google/Stripe external credentials only after the operator confirms
   accounts, scopes, and billing links.

## 2026-06-14 Hosted AI / Super Agent Box Update

Status: deployed and live-smoked in Railway deployment
`740011e1-c0d5-41ba-af7e-8280e2609215`.

What changed:

- Replaced the web assistant's OpenAI-only hosted reply path with ordered hosted
  provider selection. The configured primary runs first and Kimi is used as a
  quiet fallback when available.
- Removed user-facing "OpenAI failed" and "Kimi fallback" wording from the web
  assistant and Telegram normal-chat fallback. Provider details remain in
  internal metadata/logs for operator debugging only.
- Upgraded the shared assistant widget into a thicker Super Agent Box with
  role-specific capability cards, guardrail copy, and one-tap prompt chips for
  parent, student, provider, signup, public, and Operations surfaces.
- Quick prompt chips prefill the composer instead of auto-sending, so users can
  review before an action is created.

Verification:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS focused assistant/provider/Telegram routing tests
- PASS `npm test` 331/331
- PASS local Playwright Super Agent Box smoke at 390, 768, and 1024 px for
  parent, provider, student, and Operations surfaces
- PASS `npm run openai:smoke`; selected provider was Kimi (`kimi-k2.6`):
  `ops/openai-smokes/2026-06-14T10-35-32-319Z-openai-sidekick-smoke.md`
- PASS Railway doctor for deployment `740011e1-c0d5-41ba-af7e-8280e2609215`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T10-36-53-481Z-live-app-smoke.md`
- PASS focused live assistant fallback smoke:
  `ops/live-smokes/2026-06-14T10-37-40-872Z-assistant-kimi-fallback-live-smoke.json`

## 2026-06-14 Telegram Bot Provider-Neutral Follow-Up

Status: deployed and live-smoked in Railway deployment
`3de705f9-f00a-4cbd-9627-16ce53b6444d`.

What changed:

- Corrected the Telegram bot path after the operator clarified "the bot, not
  the box."
- The persistent Telegram keyboard now advertises `Assistant` and `Codex`
  instead of `OpenAI API` and `Codex`.
- Normal bot help, status, mode-switch, capabilities, and hosted-chat fallback
  copy now uses provider-neutral Assistant wording.
- Old compatibility aliases still work: `OpenAI API`, `/openai_capabilities`,
  `/smoke_openai`, and `/openai_smoke` continue to map to the same internal
  hosted assistant path.
- Added `/diagnostics` and `/provider_status` as the explicit path for
  Shloimie/admin provider visibility, including OpenAI/Kimi key/path status.
- Updated `AGENTS.md` and `MEMORY.md` so future Telegram work treats
  `Assistant` as the visible hosted chat mode name.

Verification:

- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --test tests/ai-provider-selection.test.js --test-reporter=spec`
- PASS focused Telegram routing tests:
  `node --test tests/telegram-planning-intent.test.js tests/telegram-content-intent.test.js tests/telegram-ramble-routing-regression.test.js --test-reporter=spec`
- PASS `npm test` 331/331
- PASS `npm run openai:smoke`; selected provider was Kimi (`kimi-k2.6`):
  `ops/openai-smokes/2026-06-14T10-45-30-253Z-openai-sidekick-smoke.md`
- PASS Railway doctor; deployment `3de705f9-f00a-4cbd-9627-16ce53b6444d`
  reached SUCCESS.
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T10-47-29-026Z-live-app-smoke.md`

Notes:

- No live Telegram message was sent during verification. This avoids adding
  test chatter to the real chat while still verifying the bot bridge source,
  routing tests, hosted assistant smoke, deployment, and live app health.
- OpenAI account/key health remains an external blocker. The deployed behavior
  uses Kimi through the hosted assistant provider path when configured, without
  announcing fallback provider details to normal users.

## 2026-06-14 Single Bot Widget Follow-Up

Status: deployed and live Playwright-smoked in Railway deployment
`d0441ccd-1c17-4e61-8633-3d920e20dd49`.

What changed:

- Simplified the web assistant widget into one interactive bot interface.
- Removed the visible Super Agent Box, capability cards, prompt chips, history
  button, and mode/Codex buttons from the drawer.
- The open widget now contains only the chat header, close control, message
  thread, typing state, textarea, and send control.
- Web assistant payloads now submit in safe mode without exposing mode switching
  UI.
- Updated assistant contract tests so future changes do not reintroduce
  `data-agent-*`, history, or mode controls.

Verification:

- PASS `node --check public/js/bna-bot-widget.js`
- PASS focused assistant contracts:
  `node --test tests/universal-assistant-contract.test.js tests/assistant-portal-communications-contract.test.js --test-reporter=spec`
- PASS focused community/assistant contracts:
  `node --test tests/community-weekly-updates-contract.test.js tests/universal-assistant-contract.test.js --test-reporter=spec`
- PASS local Playwright single-bot widget smoke across parent, student,
  provider, and Operations at 390, 768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-single-bot-widget/report.md`
- PASS `npm test` 331/331
- PASS Railway deployment `d0441ccd-1c17-4e61-8633-3d920e20dd49`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T10-57-40-365Z-live-app-smoke.md`
- PASS live Playwright single-bot widget smoke across parent, student,
  provider, and logged-in Operations at 390, 768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-single-bot-widget-live/report.md`

Notes:

- Live Playwright intercepts `/api/bna/assistant/chat` with a mocked response so
  it verifies deployed UI interaction without creating real assistant records.
- Logged-in Operations was checked with a real session cookie to avoid the
  unauthenticated production redirect loop.

## 2026-06-14 Adaptive Bot Tool-Parity Follow-Up

Status: deployed and live Playwright-smoked in Railway deployment
`6e236394-e503-4f87-a370-4c969e786db9`.

What changed:

- Kept the web assistant as one clean interactive chat interface while moving
  tool selection into the server.
- Added server-side adaptive intent routing for web search requests, Codex
  implementation work, tickets, tasks, decisions, and provider question posts.
- Wired the assistant to the shared action registry with
  `visibleActionsForActor(...)` and `runAction(...)`, so permissions are
  enforced server-side instead of by front-end buttons.
- Added `bna_assistant_tool_calls` logging for adaptive action execution and
  web-search attempts.
- Added OpenAI Responses web-search scaffolding with `tools: [{ type:
  'web_search' }]`. If that external path is unavailable, the assistant records
  the tool failure internally and falls back to the hosted chat path without
  showing provider names to ordinary users.
- The widget still submits `mode: safe`; that now means the client is not
  choosing the tool. Admin Codex/task routing is inferred from the message.

Verification:

- PASS `node --check server.js`
- PASS focused assistant/community contracts:
  `node --test tests/universal-assistant-contract.test.js tests/community-weekly-updates-contract.test.js`
- PASS `npm test` 332/332
- PASS `npm run openai:smoke`; selected hosted provider was Kimi
  (`kimi-k2.6`):
  `ops/openai-smokes/2026-06-14T11-18-43-978Z-openai-sidekick-smoke.md`
- PASS local Playwright assistant tool-parity smoke across parent, student,
  provider, Operations, and Hebrew signup at 390, 768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-assistant-tool-parity-local/report.md`
- PASS Railway deployment `6e236394-e503-4f87-a370-4c969e786db9`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T11-26-48-796Z-live-app-smoke.md`
- PASS live Playwright assistant tool-parity smoke across parent, student,
  provider, Operations, and Hebrew signup at 390, 768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-assistant-tool-parity-live/report.md`

Remaining:

- OpenAI account/key health remains an external blocker for actual live OpenAI
  Responses web-search calls. The code path is scaffolded and tool-logged; Kimi
  remains the approved hosted chat fallback/temporary primary path.
- Playwright chat submissions were mocked so no real assistant records, tickets,
  tasks, or web-search API calls were created during UI smoke testing.

## 2026-06-14 Natural-Language Onboarding Vision

Source:

- Operator wants every parent, student, and service provider to experience the
  app through natural-language guidance in English or Hebrew.
- The bot should not feel like a separate toolbox. It should welcome the user,
  explain the app, ask the next setup question, and write durable records after
  permission checks.

Product intent:

- Parents:
  - greet by name and language;
  - explain the family/accountability app in plain language;
  - ask about each child, goals, home expectations, desired prompts/parser
    instructions, and accountability style;
  - walk the parent through recording upload: what to upload, what the system
    will extract, what stays parent-visible, and what requires Rabbi/admin
    review before the child sees it;
  - teach the self-governance model: clear commitments, check-ins, reflection,
    repair, responsibility, and parent/Rabbi review rather than punishment-only
    or hidden-control automation.
- Students:
  - greet in English/Hebrew;
  - explain what the student portal is for;
  - guide the student through goals, daily checkoff, asking a question, and
    reflecting on responsibility;
  - keep tone as learning coach / critical-thinking coach, not surveillance.
- Service providers:
  - greet in English/Hebrew;
  - walk through profile setup, services, photos, service area, parent
    questions, comments/reviews, Google Business status, and upgrade blockers;
  - collect missing profile fields conversationally and save scoped provider
    records only after permission checks.

Implementation brief:

- Add role/language-specific assistant onboarding state, probably stored in
  assistant thread metadata plus durable setup/profile tables where appropriate.
- Add action/tool handlers for:
  - start/continue onboarding;
  - save parent child-profile notes and prompt/parser preferences;
  - explain and start recording upload;
  - summarize uploaded recording intake expectations;
  - create/update child goals and check-ins from chat;
  - save provider profile/service/media setup steps;
  - mark onboarding step complete.
- UI should remain the same single chat interface. No new button wall.
- Hebrew mode must use full Hebrew, RTL, and Hebrew bot copy.
- Recording upload guidance must not imply remote device/filter control or
  bypass instructions. It should explain review, visibility, and safe upload
  flow.
- Tests should assert English/Hebrew onboarding copy, role-scoped allowed
  actions, no cross-household/provider data leakage, and Playwright smoke at
  390/768/1024 px.

## 2026-06-14 Assistant History Button Follow-Up

Status: deployed and live Playwright-smoked in Railway deployment
`b8cf4fc0-4025-4e47-8f29-6bf893c02f2f`.

What changed:

- Restored chat history as the only extra regular-user assistant control, using
  an icon-only clock button rather than an `H` or text button.
- History opens inside the same assistant drawer and lists previous scoped
  assistant threads from `/api/bna/assistant/threads`.
- Selecting a previous chat loads that thread's messages and sets it as the
  active `thread_id`, so the next message continues that same chat.
- Kept prompt chips, mode buttons, Super Agent box cards, and visible provider
  controls out of the UI.

Verification:

- PASS `node --check public/js/bna-bot-widget.js`
- PASS focused assistant/community contracts
- PASS `npm test` 332/332
- PASS local Playwright assistant history smoke across parent, student,
  provider, and Hebrew signup at 390, 768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-assistant-history-local/report.md`
- PASS Railway deployment `b8cf4fc0-4025-4e47-8f29-6bf893c02f2f`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T11-39-39-227Z-live-app-smoke.md`
- PASS live Playwright assistant history smoke across parent, student,
  provider, and Hebrew signup at 390, 768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-assistant-history-live/report.md`

Notes:

- Playwright mocked assistant history/chat endpoints so no real assistant
  records were created during UI smoke testing.

## 2026-06-14 Conversational Website Onboarding Follow-Up

Status: deployed and live Playwright-smoked in Railway deployment
`052a8c57-a58f-4b01-a7db-a2f742352748`.

What changed:

- Replaced the visible `/providers/join` form wall with a single chat-style
  provider onboarding assistant. It thanks the provider, explains the BNA
  review process, explains the students/homeschoolers/alternative-education
  audience, and explains provider index plus future family-intake funnel
  direction before collecting listing fields one question at a time.
- Kept the existing provider field names and `/api/provider-onboarding` backend
  contract intact through hidden compatibility fields and the same POST path.
- Added `/api/parent-accountability/onboarding` for public pre-login parent
  accountability setup requests. It creates a support ticket plus a general
  communication record, assigned for BNA review, without requiring a parent
  session or exposing private household data.
- Added a pre-login parent accountability onboarding assistant on
  `/parent/login?onboard=accountability`, asking about child struggles, goals,
  motivators, chores, meal/eating preferences, recording/upload context, tablet/
  filter/setup context, and the self-governance model.
- Updated homepage and provider-index links to open
  `/become-service-provider?onboard=provider` and
  `/parent/login?onboard=accountability`.
- Suppressed the shared floating assistant only on the public parent onboarding
  URL so the page shows one bot-style intake instead of two assistant
  interfaces.

Verification:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS inline JS parse for `public/providers-join.html`, `public/parent.html`,
  `public/index.html`, and `public/service-providers.html`
- PASS focused provider/workspace contracts
- PASS `npm test` 334/334
- PASS local Playwright provider/parent conversational onboarding smoke at
  390, 768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-conversational-onboarding-local/report.md`
- PASS Railway deployment `052a8c57-a58f-4b01-a7db-a2f742352748`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T12-03-04-927Z-live-app-smoke.md`
- PASS live Playwright provider/parent conversational onboarding smoke at 390,
  768, and 1024 px:
  `ops/playwright-smokes/2026-06-14-conversational-onboarding-live/report.md`

Remaining:

- The broader natural-language onboarding task is not fully complete until the
  student portal gets the same role-specific onboarding and deeper action-tool
  execution for uploads/goals/check-ins.

## 2026-06-14 Operations Workspace Directory Follow-Up

Status: deployed and live Playwright-smoked in Railway deployment
`129a0092-f58e-47fe-ad1a-78529134e9c9`.

What changed:

- Reworked the Operations side-panel workspace switcher into a Workspace
  Directory with type filters for Super Admin, Schools, Service Providers, Home
  Accountability, Parent Households, and Community / Projects.
- Added type-aware workspace helpers so provider, family, and household
  workspaces get the right sidebar profiles instead of relying on only
  `rabbi_sheller_provider` special cases.
- Renamed the global provider label to "One Time Mishnayos Provider Workspace"
  while preserving the underlying `rabbi_sheller_provider` key for existing
  One Time scoped login/project behavior.
- Added a `parent_households` workspace settings seed row and a parent-household
  fallback entry so the directory has a clear place for future parent logins and
  household setup records.
- Grouped the Admin > Workspaces panel by the same official workspace
  categories.
- Fixed workspace filter hiding so CSS `display: flex` no longer overrides the
  `[hidden]` state on filtered workspace cards.

Verification:

- PASS `node --check server.js`
- PASS Operations inline script parse
- PASS focused Operations/brand/workspace contract tests
- PASS `npm test` 334/334
- PASS local Playwright workspace-directory smoke:
  `ops/playwright-smokes/2026-06-14-operations-workspace-directory-local/report.md`
- PASS Railway deployment `129a0092-f58e-47fe-ad1a-78529134e9c9`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T12-29-12-447Z-live-app-smoke.md`
- PASS live Playwright workspace-directory smoke:
  `ops/playwright-smokes/2026-06-14-operations-workspace-directory-live/report.md`

Remaining:

- This creates the official structure and navigation. The next data task is to
  add real parent-household records, parent login management, and people
  population flows into the directory.

## 2026-06-14 Public Assistant Lead-Magnet Follow-Up

Status: deployed and live Playwright-smoked in Railway deployment
`b0c87179-7801-4af3-8716-b0b87d64f299`.

What changed:

- Updated the shared public/signup assistant widget so it auto-opens after a
  short delay, greets in the page language, then shows a second follow-up after
  a typing-style pause unless the visitor closes it.
- Kept the visible interface to one chat drawer with the history clock, close,
  textarea, and send button. No settings, mode buttons, prompt cards, or
  separate agent box render for regular visitors.
- Added a safe public assistant context in `server.js` built from the BNA
  self-governance/accountability model plus approved/published public content
  outputs and class-session summaries after existing public-content sanitation.
- Let regular users get hosted assistant answers with provider-neutral fallback
  behavior. OpenAI/Kimi/provider names and failures stay out of user-facing
  public replies.
- Added public lead capture: contact/follow-up requests create a support ticket
  and a general communication record for Shloimie.
- Added public feedback capture: clear site/app/bot issues create a support
  ticket plus a Codex review queue item; broader product suggestions become
  Shloimie Decisions. Public users still do not get admin, CLI, deploy,
  migration, or private-data access.
- Traced the parent newsletter task: the parent newsletter hero infrastructure
  was deployed on 2026-06-12, but it only renders when a `bna_weekly_updates`
  row is `selected`/`published` and selected for the parent portal. The still
  open task is selecting/entering approved weekly copy and pool/talking-head
  media.

Verification:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS focused assistant/newsletter contracts
- PASS `npm test` 337/337
- PASS local Playwright public assistant smoke:
  `ops/playwright-smokes/2026-06-14-public-assistant-local/report.md`
- PASS Railway deployment `b0c87179-7801-4af3-8716-b0b87d64f299`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T13-07-54-304Z-live-app-smoke.md`
- PASS live Playwright public assistant smoke:
  `ops/playwright-smokes/2026-06-14-public-assistant-live/report.md`

Remaining:

- Deeper role-specific agentic coaching remains open: parent/student/provider
  assistants should read and update scoped goal/interests/profile records, not
  only assistant thread memory and public knowledge context.
- Select or enter the approved BNA weekly newsletter copy/media row so the
  already-built parent hero has content to render.
