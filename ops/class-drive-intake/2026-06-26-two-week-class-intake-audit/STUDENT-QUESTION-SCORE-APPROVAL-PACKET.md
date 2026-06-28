# Student Question Score Approval Packet

Generated: 2026-06-28T10:10:00+03:00

Mode: read-only owner decision packet. No Drive write, production DB mutation,
class backfill, raw transcript export, AI call, paid retranscription, send,
publish, charge, access grant, credential/account/DNS change, or broad Drive
sync was performed.

## What Is Working Now

- Approved content job #83 Drive transcript sync is complete.
- #83 Drive readback passed at 9683 chars.
- `01 Transcript Library` was verified at 47 docs after #83.
- Privacy-safe digest export covers 29 recordings.
- Digest export includes no raw transcript bodies and reported 0 privacy
  findings.
- Operations Content cards/topic filters are live after PR #45, PR #46, and PR
  #47.
- Live `/api/bna/content-jobs?project_key=all` readback returns all 29 digest
  cards, 10 explicit `Needs parse` jobs, job #83's clean generated title, and
  no raw transcript text in digest-card payloads.

## What Is Not Safe Yet

Production student question/task/score/progress writes are not safe to apply.

Reasons:

- 10 content jobs need parser/reparse review:
  `71, 59, 58, 57, 56, 31, 30, 26, 25, 21`.
- 13 student-question rows were found.
- 7 question rows are matched.
- 6 question rows need human student-match review.
- Score/progress planning produced 0 row-level before/after apply rows.

Rows needing student-match review, using redacted refs only:

| Job | Question ref | Match status | Source kind |
| --- | --- | --- | --- |
| 58 | `question:c516d14ee4e5d49f` | no_student_name | class_notes.discussions_question |
| 58 | `question:1a8cf5034c4c839f` | no_student_name | class_notes.discussions_question |
| 26 | `question:51aa618b95a7d29d` | unmatched | class_notes.student_questions |
| 26 | `question:2158d47f6c0c2923` | no_student_name | class_notes.discussions_question |
| 26 | `question:8f9c41ec6da4ca8c` | no_student_name | class_notes.discussions_question |
| 25 | `question:e1d44fb96cef6915` | no_student_name | class_notes.discussions_question |

## Verdict

No production apply command is currently safe.

Recommended decision: keep production writes blocked until a later dry-run
emits redacted row-level before/after changes, resolves or explicitly excludes
the 6 ambiguous question rows, and either produces safe score/progress rows or
proves that no score/progress write is needed.

## Optional Next Approval

Use this only if Shloimie wants Codex to run a no-write planner/reparse review
next. This approval does not authorize production mutation.

```text
OWNER APPROVAL - CLASS CONTENT STUDENT APPLY DRY-RUN ONLY

I approve a no-write dry-run class-content student apply planner for these job
IDs only:
21, 25, 26, 30, 31, 56, 57, 58, 59, 71

Allowed command:
node scripts/class-drive-intake-reconcile.cjs backfill --jobs 21-83 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit

Allowed:
- produce a dry-run row-level plan only;
- emit redacted before/after rows if available;
- keep ambiguous question rows excluded or marked needs review;
- update sanitized repo evidence.

Still forbidden:
- no --apply;
- no production DB mutation;
- no production class backfill;
- no Drive write/create/update/move/delete;
- no raw transcript-body export;
- no AI call;
- no paid retranscription;
- no stale deletion;
- no sends/publishes/charges/access grants;
- no credential/account/DNS changes;
- no broad Drive sync.
```

## Existing Dry-Run Tool

The repository already has a guarded backfill planner in
`scripts/class-drive-intake-reconcile.cjs`. Its apply path is blocked by design
unless an explicit gate and apply flag are supplied. Do not run `--apply`
unless a future dry-run emits safe row-level rows and Shloimie approves that
exact apply command.

## Exact Next Safe Command Without Approval

```powershell
npm run bna:run:next
```
