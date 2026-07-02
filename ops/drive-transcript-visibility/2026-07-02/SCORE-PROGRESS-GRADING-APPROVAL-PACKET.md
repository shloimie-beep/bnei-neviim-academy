# Score / Progress / Grading Approval Packet

Status: blocked/no rows to approve yet.

## Summary

No score/progress/grading rows are ready to apply. The scoped audit found no
candidates, and job 101 still needs a dry-run parser repair before any
row-level before/after plan can exist.

## Required Before Approval Can Be Used

This packet must be updated with exact rows containing:

- student ref;
- source job and source section hash/ref;
- current value summary/hash;
- proposed after-state summary;
- confidence;
- idempotency key;
- rollback/readback plan.

## Current Row-Level Plan

No rows.

## Approval Phrase

Approval phrase for any future apply:

```text
APPROVE_20260702_SCORE_PROGRESS_GRADING_APPLY_EXACT_PACKET_ONLY
```

Do not use this phrase until the exact row-level packet exists and has been
reviewed.
