# Ramble Queue Contract

Worker: W3
Requirement: REQ-20260619-403
Contract version: `w3-parent-prompt-queue-v1`

## Purpose

The ramble queue keeps one visible parent prompt for an operator ramble, file,
recording, or GPT/Codex packet. Child tasks, Decisions, content items, notes,
and agent work packages attach to that parent. This prevents one task per
sentence while keeping every outcome inspectable.

## Intake Source

Use `src/platform/ingestion/intake-source.js` to create a provider-neutral
source record before parsing. The record preserves:

- source provider/channel/kind
- source ID/link/filename/MIME type
- fingerprint/checksum
- raw text and transcript text/version
- timestamps
- actor
- workspace candidate/resolution
- parser version
- processing attempts
- final routing

The module is local/dry-run safe and does not mutate Drive or external
accounts.

## Folder Plan

Use `src/platform/ingestion/intake-folders.js` for the dedicated structure:

```text
BNA V2/
  00 Upload Here - Rambles & Prompts/
    10 Queued/
    20 In Progress/
    30 Needs Decision/
    40 Completed/
    90 Archive/
```

The folder setup plan is provider-neutral and dry-run only. Prompt 05 or an
explicit operator-approved Drive setup step should perform actual Drive
mutation.

## Parent Prompt Statuses

Allowed statuses:

```text
new
triaged
queued
in_progress
needs_decision
verifying
completed
failed
archived
```

Visible queue fields:

- prompt number/title
- source
- created/queued/started time
- elapsed
- agent
- current phase
- heartbeat
- queue position
- dependency
- child outcomes
- blocker
- result/evidence

View-model functions:

- `buildQueueViewModel()` for `/queue`
- `buildPromptDetailViewModel()` for `/prompt <id>`
- `buildRambleStatusViewModel()` for `/ramble_status`

## Parser Contract

Use `src/platform/ingestion/canonical-parser.js`. Its output shape is:

```json
{
  "workspace": {},
  "participants": [],
  "decisions": [],
  "tasks": [],
  "calendar_events": [],
  "content_items": [],
  "community_items": [],
  "integration_items": [],
  "notes": [],
  "unresolved": [],
  "deduplication_keys": []
}
```

Rules enforced locally:

- schema validation before writes
- deterministic idempotency keys
- dedupe against active/recent records
- high/medium/low confidence labels
- one concise Decision for parser ambiguity
- no raw transcript titles
- private student/accountability content is not public content
- general system requests are not filed as student records
- Zoom attendance is not inferred
- retry/watchdog noise is not visible Tasks
- One Time aliases resolve to `one_time_mishnah_class`

## Agent Loop

Use `src/platform/agent-control/closed-loop.js` to create one work package per
child outcome. The loop is:

```text
prompt -> work package -> implementation -> automated/browser/operator/mixed
verification -> evidence -> pass/fail/blocked -> exact requeue or one Decision
```

Browser prompts reject credential-like text and explicitly forbid external
mutations, sends, publishing, billing, invitations, production writes, broad
crawls, and watch loops unless a package explicitly authorizes them.

## WhatsApp Prompt

The parent update prompt is installed at
`content-memory/platform-prompts/whatsapp.md` as
`whatsapp-parent-update-v3`.

Approved examples stay in `content-memory/whatsapp/examples.md` only after
operator approval. The validator in
`src/platform/prompts/whatsapp-parent-update.js` enforces the final line,
banned phrases, parsha fact handling, placeholder removal, emoji guard, and
private-data gate.
