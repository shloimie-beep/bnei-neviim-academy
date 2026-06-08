# Telegram AI Mode And One Time Rabbi Setup

Date: 2026-06-05

## Status

Project/workspace model implemented by task #72 and deployed. Rabbi scoped
Telegram/agent profile implemented by task #110 and included in the deployed
bundle. Live Rabbi bot startup is blocked only on the Rabbi-specific bot token,
chat id, and scoped One Time login credentials.

## Implemented In Task #110 Pass

- Added a bridge profile for Rabbi Elie Scheller:
  `node scripts/telegram-kimi-bridge.mjs --profile rabbi-elie-scheller`.
- Added npm scripts:
  - `npm run telegram:rabbi`
  - `npm run telegram:rabbi:start`
- Rabbi profile uses separate runtime lock/log/mode/decision files from the
  academy bot.
- Rabbi profile reads scoped context from:
  - `agents/rabbi-elie-scheller/AGENTS.md`
  - `agents/rabbi-elie-scheller/MEMORY.md`
  - `agents/rabbi-elie-scheller/SETUP.md`
- Rabbi profile uses only scoped Operations credentials:
  - `ONE_TIME_OPS_USERNAME`
  - `ONE_TIME_OPS_PASSWORD`
  - or the `RABBI_ELIE_SCHELLER_OPS_USERNAME/PASSWORD` aliases
- Rabbi profile does not fall back to Shloimie's admin Operations credentials.
- Rabbi profile is OpenAI/Kimi chat plus One Time task/comment API access by
  default. Codex execution is disabled unless
  `RABBI_ELIE_SCHELLER_CODEX_ENABLED=true`.
- Rabbi profile only requests One Time task/project snapshots. It does not
  request Students, Accounting, Devices, broad Content, Drive, GHL posting,
  OpenAI smoke, or agent fleet commands.
- Explicit scoped task commands create One Time tasks. Non-explicit brainstorms
  are summarized by the model and should ask before task creation.
- Scoped comment commands post project-visible comments, for example:
  `comment task #123: add this context`.
- Added exact setup/env documentation in
  `agents/rabbi-elie-scheller/SETUP.md`.

## Live Values Still Needed

- `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER` or
  `.secrets/telegram-rabbi-elie-scheller-bot-token.txt`
- `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`
- `ONE_TIME_OPS_USERNAME`
- `ONE_TIME_OPS_PASSWORD`

Optional/advanced:

- `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false` should stay false unless Shloimie
  explicitly wants the Rabbi bot to execute Codex repo work.

## Implemented In This Pass

- Telegram bridge now has persistent bottom reply-keyboard buttons:
  - `OpenAI API`
  - `Codex`
- Per-chat mode is stored in `.runtime/telegram-chat-modes.json`.
- `.env.example` documents `TELEGRAM_DEFAULT_REPLY_MODE=openai`.
- Default mode is OpenAI API for normal conversation, tone/content refinement,
  brainstorms, and ordinary task capture.
- Clear development/system requests still route automatically to Codex even when
  the selected mode is OpenAI API.
- Pressing `Codex` forces Codex replies until `OpenAI API` is pressed again.
- The Operations Content project label formerly shown as `Mishna Learning` now
  displays as `One Time`; expanded cards show `One Time Mishnah Class`.
- The existing internal `mishna` key was preserved to avoid data churn.
- Added scoped agent files:
  - `agents/README.md`
  - `agents/rabbi-elie-scheller/AGENTS.md`
  - `agents/rabbi-elie-scheller/MEMORY.md`

## Implemented In Task #72 Pass

- Reused the existing Mishnah/Mishna concept as `One Time Mishnah Class` with
  internal project key `one_time_mishnah_class`; aliases such as `mishna`,
  `mishnah`, `one time`, and `mishna learning` normalize into that project.
- Added/standardized first-class project/workspace tables and fields:
  - `bna_projects`
  - `bna_project_members`
  - `bna_task_comments`
  - `bna_tasks.project_id`
  - `bna_tasks.decision_required`
  - `bna_tasks.author`
- Seeded `BNA` and `One Time Mishnah Class` on startup and through the new
  repeatable Railway/Postgres migration:
  `railway-migration-2026-06-05-one-time-projects.sql`.
- Backfilled null task projects to `BNA`, then moved Mishnah/One Time/Rabbi
  Elie/source-sheet/shiur-related tasks into `One Time Mishnah Class`.
- Routed mixed-recording extracted tasks, dashboard recording-task actions, and
  the legacy Telegram webhook fallback through the shared project-aware
  `createTaskFromText` helper instead of direct `INSERT INTO bna_tasks`.
- Added protected project/task/comment APIs and kept scoped One Time login
  limited to Tasks/project routes.
- Updated Operations Tasks UI with:
  - project filter chips
  - project badges
  - project selector
  - One Time categories
  - Shloimie/Codex/Rabbi Elie assignment selector
  - Decision Required checkbox/badge
  - task comments thread and add-comment control
- Added optional `.env.example` variables:
  - `ONE_TIME_OPS_USERNAME`
  - `ONE_TIME_OPS_PASSWORD`

## Verification For Task #72 Pass

- `node --check server.js` passed.
- `node --check scripts/telegram-kimi-bridge.mjs` passed.
- Inline scripts in `public/operations.html` compiled with Node `vm.Script`.
- `npm test` passed: 20/20 tests.
- Temporary updated server on port `18080` completed DB initialization and
  served the new dashboard.
- Local Playwright smoke passed on `/operations?view=tasks`: project filter,
  BNA/One Time chips, modal project selector, assignee selector, decision
  checkbox, comments UI, and `/api/bna/projects` BNA/One Time seed checks.
- API smoke passed: creating a temporary task with `project: "mishna"` returned
  `project_key: "one_time_mishnah_class"`, accepted Rabbi Elie assignment,
  `shiur_ideas` category, Decision Required, and a task comment; the smoke task
  was deleted afterward.

## Operator Intent

Normal Telegram conversation should feel like talking to an AI assistant that can
catch Shloimie's tone. OpenAI API should handle the basic running of the system
for conversation and content refinement. Codex should handle repo work,
programming, bridge changes, database/schema work, deploys, tests, and system
implementation.

Rabbi Elie Scheller should eventually have his own Telegram bot/agent using the
same agentic framework as Shloimie, scoped to One Time Mishnah Class.

## Historical Repo Reality

- `bna_tasks` currently has `category`, `assigned_to`, and status fields, but no
  first-class project table, project membership table, task comment table, or
  decision-required boolean.
- Operations Content has a heuristic project filter with an internal `mishna`
  key. That is the existing Mishnah/One Time concept and should be reused rather
  than duplicated.
- Superseded by task #72/#110: the project/comment/decision fields and scoped
  One Time access layer now exist in the app code.

## Backend Work Needed

1. Add safe migrations for projects and task collaboration:
   - `bna_projects`
   - `bna_project_members`
   - `bna_task_comments`
   - `bna_tasks.project_id`
   - `bna_tasks.decision_required`
2. Seed or standardize projects:
   - `BNA`
   - `One Time Mishnah Class` with short display name `One Time`
3. Backfill existing BNA tasks to `BNA`.
4. Backfill existing `mishna`/Mishnah content/task records to One Time Mishnah
   Class where applicable.
5. Extend task APIs so Telegram and dashboard use one creation path:
   - raw text
   - project
   - author
   - category
   - assigned_to
   - decision_required
   - notes/context
6. Add task comments API endpoints.

## UI Work Needed

- Add Tasks project filter: All Projects / BNA / One Time Mishnah Class.
- Add One Time categories:
  - Marketing
  - Content
  - Technology
  - Admin
  - Accounting
  - GHL Setup
  - Community
  - General
  - Torah Class Prep
  - Source Sheets
  - Shiur Ideas
- Add assignment options:
  - Shloimie
  - Rabbi Elie Scheller
  - Unassigned
- Add task comments/internal chat.
- Add Decision Required marker.
- Keep Changelog admin-facing and project-filterable.

## Rabbi Bot Work Needed

- Add Rabbi Elie Scheller bot identity/config without creating a duplicate
  framework.
- Load `agents/rabbi-elie-scheller/AGENTS.md` and `MEMORY.md` as scoped context.
- Scope task tools to One Time Mishnah Class.
- Usually summarize and ask before creating tasks unless the rabbi explicitly
  says to create one.
- Support Torah class prep, shiur ideas, source sheet concepts, and later
  Sefaria-style source lookup through a modular adapter.

## Verification For Current Pass

- Run `node --check scripts/telegram-kimi-bridge.mjs`.
- Smoke `/status` in Telegram and confirm the bottom buttons are visible.
- Press `OpenAI API`, then send a content/tone request and confirm API response.
- Send a clear repo/build/fix request and confirm it routes to Codex.
- Press `Codex`, then send a normal message and confirm it routes to Codex.
- Open Operations Content and confirm the project filter displays `One Time`.
