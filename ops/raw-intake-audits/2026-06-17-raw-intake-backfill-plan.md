# Raw Intake Backfill Plan - 2026-06-17

Raw ID: `RAW-20260617-005`
Goal ID: `GOAL-20260617-005`

## Purpose

Backfill older BNA notes, prompts, handoffs, content/class records,
communications, and task sources into the hardened raw-first model without
losing provenance or exposing private data.

## Current Canonical Model

- Live intake table: `bna_raw_intake`.
- Repo fallback: `raw-input/`.
- Durable memory: `MEMORY.md` plus `memory-topics/`.
- Active work queue: `TASKS.md` plus dated requirement registers in
  `tasks-pending/`.
- Goal ledger: `ops/goal-ledger.jsonl`.
- Agent task trail: `ops/agent-task-ledger.jsonl`.

## Backfill Order

1. Existing prompt/register packets with no raw fallback pointer.
2. Older `memory/YYYY-MM-DD.md` rambles that created implementation work.
3. Class recordings/transcripts and mixed content jobs.
4. Important parent/student/accountability communications.
5. Provider/contact/accounting/import notes.
6. Legacy task rows that lack source/proof pointers.

## Rules

- Preserve raw wording only in raw storage or redacted provenance fields.
- Use clean, actionable visible titles in `TASKS.md` and Operations lanes.
- Assign stable IDs before implementation work starts.
- Link every parsed item to its raw ID, goal IDs, source channel, source
  workspace, proof path, and terminal status.
- Do not promote volatile notes into `MEMORY.md`; only durable preferences,
  goals, product requirements, identity facts, and integration rules belong
  there.
- Do not expose secrets, private student details, private parent/provider
  communications, or raw contact exports in proof.

## Immediate Backfill Created During Install

- `raw-input/RAW-20260616-002-on-page-scoped-helper-tool-parity.md`
- `raw-input/RAW-20260616-003-website-ramble-correction-audit.md`
- `raw-input/RAW-20260617-005-universal-agentic-goal-memory-watchdog-hardening.md`

## Verification

- Raw drift watchdog passed:
  `ops/watchdog-audits/2026-06-17T12-09-raw-intake-drift.md`.
- Content routing watchdog passed:
  `ops/watchdog-audits/2026-06-17T12-09-content-routing.md`.
- Communications alert watchdog passed:
  `ops/watchdog-audits/2026-06-17T12-09-communications-alerts.md`.
- General watchdog reports the remaining old backfill hygiene as pre-existing
  queue/source/proof cleanup:
  `ops/watchdog-audits/2026-06-17T12-09-watchdog-audit.md`.

## Next Queue

The next safe cleanup is to turn the seven older general-audit hygiene groups
into dated repair tasks. That work should be handled as a separate queue
hygiene batch so it does not mix with this install closeout.
