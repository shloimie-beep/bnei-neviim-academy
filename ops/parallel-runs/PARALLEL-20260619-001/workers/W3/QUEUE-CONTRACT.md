# Queue Contract

Contract version: `w3-parent-prompt-queue-v1`

Module: `src/platform/ingestion/prompt-queue.js`

## Statuses

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

## View Models

- `/queue`: `buildQueueViewModel(prompts)`
- `/prompt <id>`: `buildPromptDetailViewModel(prompt)`
- `/ramble_status`: `buildRambleStatusViewModel(prompt)`

## Visible Fields

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

## Child Outcomes

Child outcomes are deduped by idempotency key and should point to tasks,
Decisions, content items, notes, integration items, or agent work packages. The
parent prompt remains visible while children move independently through their
terminal statuses.

## Focused Tests

- `tests/ingestion/w3-parser-queue.test.js`
