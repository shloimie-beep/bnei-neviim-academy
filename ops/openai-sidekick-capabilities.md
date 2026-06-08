# OpenAI Sidekick Capabilities

Last updated: 2026-06-05

This note defines what the Telegram OpenAI API sidekick can do and how its work
stays synchronized with Codex and other agents.

## Role

OpenAI is the fast operator sidekick for normal Telegram conversation,
brainstorming, system navigation, task triage, content/tone work, and
summarizing live BNA state.

Codex remains the implementation worker for code edits, filesystem changes,
database migrations, tests, deploys, and high-risk operational changes.

## Read Context

OpenAI receives summarized context from:

- `AGENTS.md`
- `MEMORY.md`
- `TASKS.md`
- `SYSTEM-STATE.md`
- internal Codex handoff notes from `tasks-pending/*.md`
- today's `memory/YYYY-MM-DD.md`
- `ops/agent-task-ledger.jsonl` tail
- `ops/agent-changelog.md` tail
- Google Drive snapshots for Drive/upload/intake questions
- live BNA app snapshots for task/student/content/accounting/system questions

The live app snapshot is intentionally summarized. It should not include
secrets, API keys, raw credentials, private student access codes, or full raw
transcripts.

## Safe Writes

The bridge can safely write records before or around an OpenAI reply:

- create app Tasks from rambles
- create Student accountability events
- create Accounting/payment intake records
- create Content jobs from media/Drive/drop-folder intake
- revise saved Content outputs such as WhatsApp updates, Facebook posts, weekly newsletters, and blog drafts
- approve/save saved Content outputs from plain Telegram text, including
  replies like `save this as final` or `save this as an example`
- record Telegram decisions
- queue Codex-owned work and mark it `in_progress`
- append daily memory entries
- append shared task ledger records
- append shared agent changelog records when work is completed

OpenAI should describe these writes only when the bridge/app actually created
or queued the record.

Content-draft edit requests should not become Codex tasks by default. If the
operator replies to a draft or says something like `edit output #39: make it
shorter`, the Telegram bridge should use OpenAI API first, fall back to Kimi API
if needed, save the revised body back to the same Content output, and return the
approval buttons.

Natural follow-up corrections should also count as content edits even when the
operator does not repeat `edit output #...`. Examples: `No, the first section
should be bullets with emojis`, `put the date on top`, `use Hebrew letters for
Hebrew words`, or `make the next section what we learned this week`. If recent
conversation context points at a saved Content output, edit that output directly
instead of creating a Codex task.

Weekly/content-organization requests such as `organize all recordings this week`
or `make the weekly parent update from the transcripts` should pull all recent
transcribed Content jobs from the week, excluding obvious separate One Time /
Rabbi Elie content unless requested. These should generate or revise actual
Content outputs directly, not create Codex tasks.

## Must Route To Codex

OpenAI must not claim it directly completed:

- code edits
- filesystem writes
- migrations/schema changes
- deploys
- tests
- destructive/high-risk changes
- long implementation tasks

For those, OpenAI should route the work into tracked Codex tasks/jobs so Codex
can execute and verify it.

## Sync Trail

Agents should pick up work through:

- live app task records
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- `TASKS.md`
- `tasks-pending/*.md`
- `memory/YYYY-MM-DD.md`

If Telegram says "keep going", "finish all tasks", or similar, Codex-owned
active tasks should be started or continued rather than left as passive captures.

## Task Updates

The Telegram bridge should not rely only on in-memory Codex batch reminders.
It now polls the live Operations task table and watches Codex/Kimi/system-owned
tasks for stage/completion/verification changes. `/queue` should report the
live Operations queue first. Legacy `ops/pending/*.json` media/intake jobs are
separate from the live Codex implementation queue and should be labeled that
way when shown.
