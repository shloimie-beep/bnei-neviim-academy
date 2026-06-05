# Telegram AI Mode And One Time Rabbi Setup

Date: 2026-06-05

## Status

Project/workspace model implemented locally for task #72. Deploy/restart is
needed for the long-running server process to serve the new routes/UI.

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

## Current Repo Reality

- `bna_tasks` currently has `category`, `assigned_to`, and status fields, but no
  first-class project table, project membership table, task comment table, or
  decision-required boolean.
- Operations Content has a heuristic project filter with an internal `mishna`
  key. That is the existing Mishnah/One Time concept and should be reused rather
  than duplicated.
- The current login/session system is Operations-wide. Rabbi Elie Scheller
  scoped access needs a real project/user access layer before going live.

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
