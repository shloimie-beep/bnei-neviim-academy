# Plan

## Batch A - Read-Only Reconciliation

1. Inspect class/content/Drive intake code, schemas, tests, and existing
   evidence.
2. Add or reuse a read-only reconciliation command that produces:
   - auth readiness without secrets;
   - sanitized per-job pipeline census;
   - suspected-cause verification;
   - orphan/duplicate/retry/UI-read-model diagnostics;
   - deterministic dry-run row-level plan;
   - safe-to-apply gate result.
3. Add focused tests for parser/persistence mapping, ambiguity exclusion,
   duplicate idempotency, repeat dry runs, workspace scoping, no-write behavior,
   and evidence redaction.
4. Run focused tests, JSON checks, secret audit, run validation, source
   coverage, stale evidence, and `git diff --check`.
5. Commit, push, open/update PR, and post the terminal verdict to Issue #18.
6. After Issue #18 is terminal, create/continue the Issue #20 parent run.

## Explicitly Out Of Scope

- Production class backfill apply.
- Production database mutation.
- Drive moves/uploads, new transcription calls, worker restarts, sends,
  charges/refunds, DNS changes, public publishing, or credential rotation.
