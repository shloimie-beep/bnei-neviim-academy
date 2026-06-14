# BNA Agent Operating Guide

This repository is the shared brain for BNA work across terminal, Telegram,
and future automation channels.

## Purpose

- Build and operate BNA's school systems, website, internal workflows, and
  operator sidekick tools.
- Treat this repository as the canonical workspace for durable memory and
  current execution state.

## Source Of Truth

Use these files consistently:

- `AGENTS.md`: operating rules, workflow, and channel behavior
- `MEMORY.md`: durable facts, decisions, preferences, definitions
- `TASKS.md`: active work queue, next actions, blockers
- `ops/agent-task-ledger.jsonl`: append-only task trail shared by Telegram and Codex
- `ops/agent-changelog.md`: completed agent work and verified changes
- `tasks-pending/*.md`: internal Codex handoff briefs for the next coding session
- `memory/YYYY-MM-DD.md`: daily rambles, notes, raw captures, summaries
- `PROJECT-NOTES.md`: local project migration notes and technical caveats

Do not dump transient rambles into `AGENTS.md`.

## How To Handle Rambles

When the operator rambles:

1. Capture the raw ramble in today's file under `memory/YYYY-MM-DD.md`.
2. Distill it into:
   - durable facts for `MEMORY.md`
   - concrete next actions for `TASKS.md`
   - current-session internal implementation briefs for `tasks-pending/*.md` when a
     future coding session should pick up the work without re-explaining
   - repo/process rules for `AGENTS.md` only if they are stable
3. Keep the raw wording only when it helps preserve intent or phrasing.
4. When Telegram or Codex creates or updates a task, append a structured record to
   `ops/agent-task-ledger.jsonl`.
5. When an agent task is completed, verified, deployed, or otherwise finished,
   append a concise record to `ops/agent-changelog.md`.
6. Do not show raw ramble language as task titles. Store raw wording as
   provenance only; visible tasks should be concise, rephrased, and actionable.

## Memory Promotion Rules

Promote into `MEMORY.md` only if the information is one of:

- a stable project goal
- a product requirement
- a preference that will likely matter again
- an identity fact about BNA, the operator, or a workflow
- an integration detail that should persist

Keep `MEMORY.md` compact and curated.

## Working Style

- Prefer clear, structured execution over abstract brainstorming.
- Break work into small tasks with visible progress.
- When the operator says `build everything`, treat it as permission for Codex
  to choose the implementation order, work through the queued tasks, and report
  completed/verified results. Do not ask for ordering confirmation unless a
  real blocker or product decision is required.
- When the operator asks to make or refine a prompt for Codex or ChatGPT,
  treat it as planning/refinement mode first: show the visible prompt/brief in
  chat, refine it with the operator, and only implement once the operator asks
  to build, test, run, or apply it.
- When the operator asks to test something that can be verified through browser
  interaction, use Playwright or the browser automation tools and report what
  was actually checked.
- When uncertain, propose 2-3 concrete options and recommend one.
- Preserve operator language and intent while turning it into usable plans.
- Avoid creating sprawling prompt junk drawers or giant rejected-memory files.
- After implementing ramble-derived work, record what changed, where it changed,
  verification performed, and remaining decisions in the relevant
  `tasks-pending/` handoff, `ops/agent-changelog.md`, and
  `ops/agent-task-ledger.jsonl`.
- Operations task buckets are `Decisions`, `Pending`, and `Tasks`, with
  `Calendar` and `Done / Activity` as supporting views. `Pending` means a
  human or external system is blocking progress; it must not mean "waiting for
  Codex."
- Codex/system work belongs in the agent lifecycle (`queued`, `running`,
  `completed`, `failed`, or `blocked_needs_human_decision`) and stays visible as
  agent status under Tasks/Activity, not as a human-facing Pending card.
- Do not show `tasks-pending/*.md` as a visible Planned Briefs, Pending Briefs,
  or Implementation Briefs section. Those files are internal Codex handoffs.
- Use the local BNA keyholder workflow for new or rotated API keys. The default
  keyholder folder is `C:\Users\User\BNA-Keyholder`, outside the repo. Do not
  paste secrets into chat, tracked files, screenshots, task titles, or logs.
  Diagnostics may report only metadata and fingerprints. Copying a key from the
  keyholder into `.secrets` or Railway requires an explicit operator request.

## Current Project Reality

- This repo started as a copy of an older legacy family app.
- It is being repurposed into BNA's school project.
- The current app and schema still contain family-oriented assumptions that
  need to be systematically replaced.
- The live Operations dashboard/task UI is the Express/static
  `public/operations.html` surface. The old React local-storage TaskApp
  prototype is archived under
  `docs/archive/dormant-next-supabase-app/src/app/operations/`; do not edit it
  for live Operations behavior unless deliberately reviving it in a new task.
- Archived files under `docs/archive/` are historical reference only. Do not
  use archived family-accountability docs, old Supabase setup files, or old
  launch/onboarding surfaces as current BNA product, database, school-model, or
  workflow guidance.
- BNA does not use GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as active
  runtime. Do not add new GHL MCP tools, env vars, API clients, smoke checks,
  dashboard controls, Telegram actions, tags, workflows, docs, routes, prompts,
  or schema assumptions. Historical files belong only under
  `docs/archive/legacy-ghl/`; active contact, community, provider, parent,
  student, bot, ticket, decision, and newsletter behavior belongs in first-party
  BNA Operations tables/APIs. Buffer is only a social scheduler connector.
- Public, parent, and Operations PWAs must keep separate manifest identities:
  public `/manifest.json`, parent `/parent-manifest.json`, and Operations
  `/operations-manifest.json`. Do not make the public or parent install launch
  the private Operations app.

## Current AI Setup

- Codex is the primary development agent and visible machine-work owner.
- `Assistant` is the visible Telegram reply mode for ordinary conversation,
  tone/content refinement, brainstorms, and normal system running. It uses the
  hosted AI provider path behind the scenes.
- Clear repo, code, database, bridge, deploy, test, dashboard, or programming
  requests should route to Codex automatically.
- OpenAI is the preferred hosted AI provider when available.
- Kimi is normally fallback only for API/model-provider failures or legacy
  records, but `BNA_AI_PRIMARY_PROVIDER=kimi` is the approved temporary
  Kimi-primary mode while the OpenAI key path/account issue is unresolved.
- Kimi is never the task owner. Codex remains the development/task/deploy owner
  even when Kimi is the temporary hosted chat/content provider.

## Near-Term Priorities

- Build a proper BNA memory structure.
- Replace family-specific language, prompts, and schema assumptions.
- Keep the Telegram bridge capable of both:
  - hosted API chat for ordinary conversation and content/tone refinement
    (OpenAI normally, Kimi during explicit temporary Kimi-primary mode)
  - Codex coding turns for repo work
  - structured Buffer social commands for draft/post scheduling and queue management
- Keep one canonical memory system across channels.

## Telegram Ops Reality

- The academy Telegram bot is the active bot, not the old family bot.
- The bridge now supports:
  - hosted API default chat for ordinary conversation and content/tone refinement
    (OpenAI normally, Kimi during explicit temporary Kimi-primary mode)
  - automatic Codex routing for repo/development work
  - persistent Telegram bottom buttons for `Assistant` and `Codex` mode switching;
    `Assistant` is the provider-neutral hosted chat path for normal users
  - `/accounts`, `/blogs`, `/queue`, `/help`, `/status`
  - photo, video, voice, and document intake
  - automatic local asset capture plus Buffer text draft handoff for social posts
- Telegram task captures should not show per-task owner/status buttons such as
  `Mine`, `Codex`, `Urgent`, or `Done`; the parser should assign ownership and
  route the item into the correct app lane.
- Telegram should read like natural conversation first. Do not send mechanical
  "queued Codex in the background" style messages for ordinary chat; mention a
  capture only when a real task, student note, payment item, content item, or
  decision was created or needs action.
- After Codex completes a Telegram-requested test, fix, deploy, or verification,
  it must report back in Telegram with a concise accomplished/verified summary.
  The operator should not have to infer completion from logs or dashboard state.
- App-visible, server-visible, or dashboard-visible Codex tasks are not
  complete after local verification alone. The agent fleet must deploy the
  changed app bundle, run the live Railway doctor/smoke check, and only then
  mark the task done. If deployment is unavailable or fails, keep the task open
  and notify Telegram with the blocker.
- Social posting is partially wired:
  - Buffer is the active social posting provider for Facebook, LinkedIn, and YouTube.
  - draft/publish commands create Buffer text drafts/posts for resolved targets.
  - media assets are saved locally; Buffer media posting needs hosted media URL support before local photos/videos can be attached.
  - voice assets are saved, but not transcribed yet

## Pending Work Convention

- `TASKS.md` should stay concise and show the overall queue.
- `tasks-pending/*.md` should hold the latest actionable brief with context,
  findings, and explicit next steps.
- When resuming work, read the newest file in `tasks-pending/` before making
  major changes.
