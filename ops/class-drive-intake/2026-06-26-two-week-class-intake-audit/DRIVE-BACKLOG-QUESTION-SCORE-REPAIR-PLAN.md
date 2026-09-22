# Drive Backlog Question Score Repair Plan

Generated: 2026-06-28T12:32:00+03:00

Mode: read-only repair plan refresh. No Drive write, production DB mutation,
class backfill, raw transcript export, AI call, paid retranscription, send,
publish, charge, access grant, credential/account/DNS change, or broad Drive
sync was performed.

## Current Status

- Drive/class audit: 18 Drive recordings in range, 29 content jobs, 0 Drive
  orphans, final verdict `PARTIAL`.
- Transcript library: last verified at 47 docs after the approved #83 private
  Drive transcript doc sync.
- Approved #83 Drive sync: complete; readback passed at 9683 chars; repo
  evidence stores only redacted hashes for the Drive doc pointer.
- Digest export: 29 recordings, raw transcript bodies false, privacy findings
  0.
- Content cards/topic filter: PR #45 and PR #46 are merged; Railway deployment
  `fd93be96-8bec-4c06-b42f-c53d177eab40` reached `SUCCESS`; live readback via
  `project_key=all` returns 81 jobs, all 29 digest cards, job #83's clean
  generated title, all 10 `Needs parse` jobs, and no raw transcript text inside
  `digest_card` payloads.
- Issue #41 remains open by design.
- New class-question routing rule from `RAW-20260628-003`: unmatched or
  ambiguous question candidates are dry-run planned as class questions for all
  active students, not personal questions.

## Parser Repair Candidates

These jobs have transcript text but need parser/reparse review before downstream
writes:

`71, 59, 58, 57, 56, 31, 30, 26, 25, 21`

Target: `content_job_parse_json`

Status: review-only. `DEC-20260626-101` plus explicit parser/canonical-write
approval is required before any production apply command.

## Student Questions

- Total rows: 13
- Matched rows: 7
- Need student-match review after class-question rule: 0 blocking
- Jobs with question rows: `25, 26, 30, 31, 58`
- Refreshed dry-run row plan: 917 future `bna_accountability_events` writes if
  a separate production apply path is approved.
- Dry-run breakdown: 912 class-question broadcast inserts, 5 matched
  student-question inserts, and 2 existing rows skipped.

Rows formerly needing review, using redacted refs only:

| Job | Question ref | Prior match status | Source kind | Dry-run routing |
| --- | --- | --- | --- | --- |
| 58 | `question:c516d14ee4e5d49f` | no_student_name | class_notes.discussions_question | class_question_broadcast |
| 58 | `question:1a8cf5034c4c839f` | no_student_name | class_notes.discussions_question | class_question_broadcast |
| 26 | `question:51aa618b95a7d29d` | unmatched | class_notes.student_questions | class_question_broadcast |
| 26 | `question:2158d47f6c0c2923` | no_student_name | class_notes.discussions_question | class_question_broadcast |
| 26 | `question:8f9c41ec6da4ca8c` | no_student_name | class_notes.discussions_question | class_question_broadcast |
| 25 | `question:e1d44fb96cef6915` | no_student_name | class_notes.discussions_question | class_question_broadcast |

## Scores And Progress

Not ready to apply.

The fresh read-only audit generated 0 row-level score/progress change rows and
reports score/progress proposal state as `UNKNOWN` for relevant jobs. Kids'
scores/progress should not be updated until a separately approved dry-run
parser/canonical-write plan emits redacted before/after rows, or explicitly
proves that no score/progress write is needed.

## Tasks And Research Cards

- Digest manifest task candidates: 34
- Task category cards: 10
- Student-question category cards: 5
- Source sheet status: not verified by this audit
- Production Tasks/research cards created: 0

The Operations cards now show safe digest/task/question states live. Creating
production tasks, research cards, student question records, or score/progress
rows remains blocked until an exact production apply path is reviewed and
approved.

## Remaining Blockers

- 10 content jobs need parser/reparse review.
- The old human student-match blocker is resolved in dry-run by class-question
  broadcast routing, but the resulting plan is large and needs owner review
  before any production apply path.
- Student score/progress updates have no safe row-level apply plan yet.
- `DEC-20260626-101` remains open for production parser/question/task/
  score/progress writes, class backfill, broad Drive sync, raw export, AI call,
  paid retranscription, or other unsafe paths.

No production apply command has been approved or implemented.

Recommended next safe move:

1. Keep production writes blocked.
2. Review the no-write owner approval packet:
   `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/STUDENT-QUESTION-SCORE-APPROVAL-PACKET.md`.
3. If approved, run only the dry-run planner named in that packet. Do not run
   `--apply` unless a later dry-run emits safe row-level before/after rows and
   Shloimie approves that exact apply command.

Exact next safe command without new owner approval:

```powershell
npm run bna:run:next
```
