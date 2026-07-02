# Student Question Routing Audit

Status: routing rules verified/planned; no production question writes applied.

## Deterministic Rules

Route a personal student question only when all of these are true:

- explicit student identifier/name alias exists;
- match confidence passes threshold;
- no conflicting student candidate exists;
- class/session/workspace matches;
- duplicate check passes.

Route a class question when any of these are true:

- no student name;
- ambiguous student;
- unmatched name;
- general class discussion question;
- existing operator-approved class-question fallback applies.

Route to private/support review when any of these are true:

- personal, family, support, payment, or sensitive context appears;
- student identity is uncertain but private details appear;
- public/newsletter risk exists.

## Scoped Audit Result

The scoped 2026-06-25 through 2026-07-02 audit found 0 student question rows
and 0 matched student question candidates. Therefore no personal student write,
class-question broadcast write, or private/support write was applied.

## Required Metadata For Any Future Write

Every routed question must include source job, source section ref/hash, routing
reason, match confidence, privacy flag, idempotency key, rollback/readback plan,
and explicit apply authorization if it mutates production student data.

## Evidence

- `ops/drive-transcript-visibility/2026-07-02/class-intake-audit/STUDENT-QUESTION-MATRIX.json`
- `tests/transcript-digest-export.test.js`
