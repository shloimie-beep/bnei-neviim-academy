# Class/Drive Intake Reconciliation And Guarded Recovery - 2026-06-24

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-003 |
| Source | codex_chat attachment |
| Goal | BNA CLASS INTAKE - FIND EVERY UPLOAD, REPAIR PARSING, AND PREPARE GUARDED BACKFILL |
| Branch | `codex/closeout-class-drive-intake-20260624` |
| Integration base | `codex/clean-slate-integration-20260624` at `68f0b02f` |
| Evidence folder | `ops/class-drive-intake/2026-06-24-closeout/` |

## Lane Rules

- Do not edit `server.js`, portal UI files, central execution-run files, `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md`, `MEMORY.md`, or `TASKS.md` in this lane.
- Production inspection is read-only under `READ_EXTERNAL_PRODUCTION_STATE`.
- Production mutation is not allowed in this lane.
- Shared server wiring, if required, must be delivered as `SHARED-PATCH.diff`.

## Requirements

| ID | Requirement | Owner | Status | Evidence |
|---|---|---|---|---|
| REQ-20260624-101 | Create the class/Drive intake reconciliation branch from the clean integration base. | Codex | Done | Branch `codex/closeout-class-drive-intake-20260624` from `68f0b02f`. |
| REQ-20260624-102 | Produce read-only auth readiness for DB, Drive, and hosted AI paths without printing secrets. | Codex | In progress | `AUTH-READINESS.md` pending. |
| REQ-20260624-103 | Produce a machine-readable per-job pipeline census for all discoverable Drive/class content jobs, including jobs 64-74. | Codex | In progress | `PIPELINE-CENSUS.json` / `.md` pending. |
| REQ-20260624-104 | Verify or disprove suspected failure causes with explicit evidence. | Codex | In progress | Suspected-cause table in census pending. |
| REQ-20260624-105 | Add read-only diagnostics for census, stage reports, orphan outputs, ambiguity, proposed changes, duplicates, UI mismatch, and credentials/workers. | Codex | In progress | `scripts/class-drive-intake-reconcile.cjs` pending verification. |
| REQ-20260624-106 | Build a guarded backfill recommendation and dry-run artifact with row-level plans, exclusions, rollback, and idempotency proof. | Codex | In progress | `BACKFILL-RECOMMENDATION.json` / `BACKFILL-DRY-RUN.md` pending. |
| REQ-20260624-107 | Add focused tests for class/session extraction, scoring, questions, student linkage, ambiguity exclusion, duplicate idempotency, retry visibility, dry-run no-write behavior, and rollback shape. | Codex | In progress | `tests/class-drive-intake-reconcile.test.js` pending run. |
| REQ-20260624-108 | Provide shared server patch instead of editing forbidden shared files if parser/persistence wiring must change. | Codex | In progress | `SHARED-PATCH.diff` pending if code inspection confirms. |
| REQ-20260624-109 | Run focused tests, JSON checks, secret audit, and `git diff --check`; commit and push. | Codex | Not started | Verification pending. |

## Completion Rules

- `Done` requires inspected files, command evidence, local generated artifacts, tests, and pushed branch.
- No production DB writes, Drive moves, transcription requests, parse-route calls, worker restarts, deploys, or live backfill apply may be performed in this lane.
