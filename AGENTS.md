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
- When uncertain, propose 2-3 concrete options and recommend one.
- Preserve operator language and intent while turning it into usable plans.
- Avoid creating sprawling prompt junk drawers or giant rejected-memory files.

## Current Project Reality

- This repo started as a copy of an older legacy family app.
- It is being repurposed into BNA's school project.
- The current app and schema still contain family-oriented assumptions that
  need to be systematically replaced.

## Current AI Setup

- Kimi is the primary provider for custom bot/app chat flows.
- OpenAI is the fallback provider for those flows.
- Kimi Code CLI is the preferred coding agent interface for this repo.

## Near-Term Priorities

- Build a proper BNA memory structure.
- Replace family-specific language, prompts, and schema assumptions.
- Keep the Telegram bridge capable of both:
  - Kimi coding/chat turns for repo work
  - structured GHL ops commands for uploads, posting, and queue management
- Keep one canonical memory system across channels.

## Telegram Ops Reality

- The academy Telegram bot is the active bot, not the old family bot.
- The bridge now supports:
  - plain-text Kimi chat for repo work
  - `/accounts`, `/blogs`, `/queue`, `/help`, `/status`
  - photo, video, voice, and document intake
  - automatic local asset capture plus GHL media upload
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
