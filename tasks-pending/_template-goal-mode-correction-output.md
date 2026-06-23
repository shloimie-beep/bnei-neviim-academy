# BNA_GOAL_MODE_EXECUTION_PACKET

Use this shape when ChatGPT/GPT turns Shloimie's natural-language correction
ramble into a Codex-ready output. The output should make Codex execute, not
only summarize.

## Execution Directive

- Create or continue an active Codex goal for this packet.
- Capture the raw input first as `RAW-YYYYMMDD-###`.
- Create/update the dated requirement register under `tasks-pending/`.
- Work the requirements in practical batches until every requirement has a
  terminal status.
- Do not ask Shloimie for ordering confirmation unless a real human/external
  decision is required.
- App-visible or server-visible work is not complete until deploy/live-smoke
  proof exists, or the deployment/live-smoke blocker is recorded.

## Goal Objective

Write the concrete objective Codex should create/continue as the active goal.

## Raw Source

| Field | Value |
|---|---|
| Raw ID | RAW-YYYYMMDD-### |
| Source channel | codex_chat / telegram / website_bot / drive / manual / other |
| Source file/message | |
| Raw storage path | memory/YYYY-MM-DD.md or raw-input/... |
| Requirement register | tasks-pending/YYYY-MM-DD-short-title.md |

## Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Suggested Batches

| Batch | Requirement IDs | Why this order | Verification |
|---|---|---|---|

## Human Or External Blockers

| ID | Blocker/Decision | Requirement IDs | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required |
|---|---|---|---|---|---|---|---|---|

## Closeout Rules For Codex

- Preserve raw wording as provenance; visible tasks use distilled titles.
- Update `MEMORY.md` only for durable facts or stable preferences.
- Update `TASKS.md` for active work and blockers.
- Append `ops/agent-task-ledger.jsonl` for created/updated/completed agent
  work.
- Append `ops/agent-changelog.md` for implemented, verified, deployed,
  blocked, failed, or archived work.
- Update the requirement register final audit after each batch.
- Use `npm run bna:run:next` and continue the next unblocked batch
  automatically after each verified checkpoint.
- Do not convert raw prompts, internal handoffs, audit output, or duplicate
  parser fan-out into default visible user Tasks.
- Run focused tests and then broader tests/audits proportional to blast radius.
- Run `npm run watchdog:audit` after major ramble-derived closeouts.
- Do not mark the goal complete until all requirements are terminal and proof
  or blockers are visible.
