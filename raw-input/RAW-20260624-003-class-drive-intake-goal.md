# RAW-20260624-003 - Class/Drive Intake Reconciliation Goal

- Source channel: `codex_chat`
- Source file: `C:\Users\User\.codex\attachments\24b66692-62fb-456c-95b6-bbd72bf01e03\pasted-text.txt`
- Captured at: 2026-06-24
- Parse status: `registered`
- Requirement register: `tasks-pending/2026-06-24-class-drive-intake-reconciliation-goal.md`

## Raw Source Summary

The operator supplied a Codex goal packet titled "Class/Drive Intake Reconciliation and Guarded Recovery" and instructed Codex to create/continue the goal:

`BNA CLASS INTAKE - FIND EVERY UPLOAD, REPAIR PARSING, AND PREPARE GUARDED BACKFILL`

The packet authorized read-only external production inspection under `READ_EXTERNAL_PRODUCTION_STATE`, prohibited production mutation in this parallel lane, required branch `codex/closeout-class-drive-intake-20260624`, and required evidence files:

- `PIPELINE-CENSUS.json`
- `PIPELINE-CENSUS.md`
- `BACKFILL-RECOMMENDATION.json`
- `BACKFILL-DRY-RUN.md`
- `AUTH-READINESS.md`

It also required diagnostics for pipeline census/stage/orphans/ambiguity/proposed changes/duplicates/UI mismatch/credentials, a dry-run-only guarded backfill with gate phrase `APPLY_GUARDED_CLASS_BACKFILL`, focused tests, source coverage, JSON checks, secret audit, `git diff --check`, and pushed branch evidence before goal completion.

## Lane Boundaries

This lane owns diagnostic and dry-run reconciliation code, tests, and evidence. It must not edit `server.js`, portal UI files, or central run/ledger/memory files. Shared wiring must be handed off as `SHARED-PATCH.diff`.

## Created IDs

- `REQ-20260624-101` - Create lane intake/register and preserve source provenance.
- `REQ-20260624-102` - Build read-only pipeline census and stage diagnostics.
- `REQ-20260624-103` - Verify or disprove suspected class intake failure causes.
- `REQ-20260624-104` - Build dry-run-only guarded backfill recommendation.
- `REQ-20260624-105` - Cover student matching, progress, questions, duplicates, retries, visibility, and rollback with tests.
- `REQ-20260624-106` - Produce auth readiness and secret-safe evidence.
- `REQ-20260624-107` - Provide shared parser/persistence wiring patch without editing shared files.
- `REQ-20260624-108` - Run verification and no-mutation checks.
- `REQ-20260624-109` - Commit and push the lane branch.
