# One Time GHL Agent Loop

Captured: 2026-06-09

## Intent

Build a scoped One Time Mishnah Class agent loop for Rabbi Elie Scheller and
Shloimie so GHL/community setup work can be broken into one workflow at a time,
smoke-tested, reported back, and kept inside the One Time project instead of
mixing with BNA Academy operations.

The operator wants to reuse the Holy Flow agent-loop idea, but with Codex as the
active builder instead of Claude.

## Holy Flow Source Found

Local repo:

- `C:\Users\User\holyflow-platform`

Relevant files:

- `AGENTS.md`
- `context/skills/agent-loop-manager.md`
- `data/agent-tasks.json`
- `apps/client-pages/views/ops-agent-loop.ejs`
- `bridge/agent-loop-poll.js`
- `bridge/agent-loop-watcher.js`
- `bridge/agent-loop-closer.js`
- `work/tasks/active/TASK-AGENT-LOOP-CLOSED-LOOP.md`
- `config/prompts/executor-ghl-api.json`
- `config/prompts/executor-ghl-browser.json`
- `config/prompts/executor-ghl-mcp.json`

## Useful Holy Flow Pattern

- Handoff surface is a task deck, not raw chat:
  `data/agent-tasks.json` backed by Supabase `kv_store[agent-tasks]`.
- Dashboard route is `/ops/agent-loop`.
- Card states are `queued`, `in-progress`, `complete`, `deferred`, with
  `pending` used only when a follow-up question blocks the worker.
- Brain/Builder split:
  - OpenAI brain receives rambles, learns preferences, and drafts goal cards.
  - Builder reads cards, writes implementation prompts, executes, tests, and
    reports back.
- GHL routing is three lanes:
  - API first for what LeadConnector can safely do.
  - Browser/Chrome only for UI-only GHL work.
  - Operator walkthrough only for OAuth, approvals, codes, DNS, or vendor gates.
- "Observe before act" is a hard rule: read current GHL state before writing
  prompts or making changes.
- Prompts should name real GHL object IDs when available, not abstract labels.
- GHL writes are guarded. No automatic GHL writes or automations without
  explicit per-turn operator confirmation and a kill switch.
- The poll loop is deterministic:
  - detect saved worker reports
  - mark the matching card complete
  - notify Telegram
  - surface operator tasks and decisions
  - do not guess or recycle running cards
- Watcher is monitor-only:
  - attaches to an already-running Chrome over CDP
  - screenshots/assesses GHL or agent tabs
  - never clicks, types, navigates, focuses, or closes
- Closer is gated:
  - closes a tab only after a confirmed worker save
  - exactly one matching tab must exist
  - closed tab count may never exceed finished-worker count

## BNA/One Time Adaptation

Do not copy Holy Flow wholesale. BNA already has:

- project-scoped Tasks for `BNA` and `One Time Mishnah Class`
- task comments
- Decision Required
- Codex-owned Changelog/task ledger
- `scripts/agent-fleet-supervisor.mjs`
- Telegram bridge scoped profile for Rabbi Elie
- GHL helper scripts and guarded app integrations

Recommended adaptation:

1. Use the existing BNA Tasks/Changelog records as the task deck.
2. Add One Time-specific agent-loop grouping only if the normal task lanes are
   not enough.
3. Keep Rabbi-facing work scoped to One Time project routes.
4. Keep Codex execution disabled for the Rabbi bot by default.
5. For GHL work, implement an approval gate:
   - read-only API mapping and current-state audit first
   - proposed write plan second
   - typed/explicit confirmation before any GHL write
6. Use Chrome automation only for GHL surfaces not covered by the API.
7. Store each workflow smoke result as a task comment plus ledger/changelog
   entry.

## Immediate Decision Needed

Pick the One Time agent-loop runtime:

- Option A: Separate Railway worker service for `npm run telegram:rabbi`.
- Option B: Local Windows service for the Rabbi bridge and Chrome/GHL work,
  with Railway only hosting the app/dashboard.
- Option C: API-only planning first: no live Rabbi bot until the GHL API map and
  scoped Drive/content structure are done.

Recommendation: Option A for the bot runtime, plus Option B only for Chrome/GHL
browser automation that needs the operator's logged-in browser. This keeps the
Rabbi Telegram bot reliable while preserving real-browser access for GHL UI
work.

## First Build Steps

1. Finish Rabbi bot runtime setup:
   - set Rabbi bot token on the hosted runtime
   - set Rabbi allowed chat ID
   - set scoped One Time Operations username/password
   - choose Railway worker vs local service
   - smoke `/status` from Rabbi's chat
2. Add a One Time decision/task for the runtime choice.
3. Map GHL API support for the Rabbi project:
   - subaccounts/locations
   - users
   - contacts
   - tags
   - custom fields
   - pipelines/opportunities
   - calendars
   - communities/memberships, if available
   - workflows, and which parts are API vs browser-only
   - social planner/content posting support
4. Design the Rabbi content lane:
   - Drive raw intake folder
   - content jobs and outputs
   - platform drafts
   - GHL/Buffer/provider decision
   - approval and scheduling flow
5. Smoke one workflow at a time. Do not bulk-configure GHL.

## Blockers

- Rabbi chat ID is not known yet.
- Scoped One Time Operations username/password are not configured locally or on
  Railway production.
- Railway production app service currently starts only `node server.js`; it does
  not host the Rabbi bridge.
- Need a runtime decision before installing a long-running Rabbi bot worker.
