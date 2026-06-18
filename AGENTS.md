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

- `BNA-START-HERE.md`: first read for every new GitHub-connected BNA session
- `docs/BNA-RAMBLE-TO-DONE.md`: durable broad-ramble execution protocol
- `ops/execution-runs/latest.json`: active resumable execution run pointer
- `AGENTS.md`: operating rules, workflow, and channel behavior
- `MEMORY.md`: durable facts, decisions, preferences, definitions
- `TASKS.md`: active work queue, next actions, blockers
- `ops/agent-task-ledger.jsonl`: append-only task trail shared by Telegram and Codex
- `ops/agent-changelog.md`: completed agent work and verified changes
- `tasks-pending/*.md`: concrete handoff briefs for the next coding session
- `memory/YYYY-MM-DD.md`: daily rambles, notes, raw captures, summaries
- `PROJECT-NOTES.md`: local project migration notes and technical caveats

Do not dump transient rambles into `AGENTS.md`.

## How To Handle Rambles

When the operator rambles:

1. Capture the raw ramble in today's file under `memory/YYYY-MM-DD.md`.
2. Distill it into:
   - durable facts for `MEMORY.md`
   - concrete next actions for `TASKS.md`
   - current-session implementation briefs for `tasks-pending/*.md` when a
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
- When uncertain, propose 2-3 concrete options and recommend one.
- Preserve operator language and intent while turning it into usable plans.
- Avoid creating sprawling prompt junk drawers or giant rejected-memory files.

## Current Project Reality

- This repo started as a copy of an older legacy family app.
- It is being repurposed into BNA's school project.
- The current app and schema still contain family-oriented assumptions that
  need to be systematically replaced.

## Current AI Setup

- Codex is the primary development agent and visible machine-work owner.
- OpenAI API is the default Telegram reply engine for ordinary conversation,
  tone/content refinement, brainstorms, and normal system running when
  available.
- Clear repo, code, database, bridge, deploy, test, dashboard, or programming
  requests should route to Codex automatically.
- Kimi is fallback only for API/model-provider failures or legacy records.
- OpenAI is the preferred hosted AI provider when available; Kimi can be used after that as fallback.

## Near-Term Priorities

- Build a proper BNA memory structure.
- Replace family-specific language, prompts, and schema assumptions.
- Keep the Telegram bridge capable of both:
  - OpenAI API chat for ordinary conversation and content/tone refinement
  - Codex coding turns for repo work
  - structured GHL ops commands for uploads, posting, and queue management
- Keep one canonical memory system across channels.

## Telegram Ops Reality

- The academy Telegram bot is the active bot, not the old family bot.
- The bridge now supports:
  - OpenAI API default chat for ordinary conversation and content/tone refinement
  - automatic Codex routing for repo/development work
  - persistent Telegram bottom buttons for `OpenAI API` and `Codex` mode switching
  - `/accounts`, `/blogs`, `/queue`, `/help`, `/status`
  - photo, video, voice, and document intake
  - automatic local asset capture plus GHL media upload
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
- Social posting is partially wired:
  - draft/publish commands can create social posts for resolved targets
  - Google targets need explicit alias selection when multiple Google accounts exist
  - voice assets are saved, but not transcribed yet

## Pending Work Convention

- `TASKS.md` should stay concise and show the overall queue.
- `tasks-pending/*.md` should hold the latest actionable brief with context,
  findings, and explicit next steps.
- When resuming work, read the newest file in `tasks-pending/` before making
  major changes.
