# Drive Backlog Question Score Repair Plan

Generated: 2026-06-28T06:34:20.164Z

Mode: read-only repair plan. No Drive write, production DB mutation, class
backfill, raw transcript export, AI call, paid retranscription, send, publish,
charge, or access grant was performed.

## Current Status

- Drive/class audit: 18 Drive recordings in range, 29 content jobs, 0 Drive
  orphans, final verdict `PARTIAL`.
- Transcript library: last verified at 47 docs after the approved #83 private
  Drive transcript doc sync.
- Digest export: 29 recordings, raw transcript bodies false, privacy findings 0.
- Content cards: 29 generated titles, 10 `Needs parse`, 0 `Needs digest`,
  0 `Needs routing`, 0 `Needs topic classification`.
- Topic filters: 29 multi-topic cards, 0 uncategorized cards.

## Parser Repair Candidates

These jobs have transcript text but need parser/reparse review before downstream
writes:

`71, 59, 58, 57, 56, 31, 30, 26, 25, 21`

Target: `content_job_parse_json`

Status: review-only. `DEC-20260626-101` plus explicit production parser/canonical
write approval is required before any apply command.

## Student Questions

- Total rows: 13
- Matched rows: 7
- Need student-match review: 6
- Jobs with question rows: `25, 26, 30, 31, 58`

Rows needing review, using redacted refs only:

| Job | Question ref | Match status | Source kind | Next action |
| --- | --- | --- | --- | --- |
| 58 | `question:c516d14ee4e5d49f` | no_student_name | class_notes.discussions_question | Human student-match review before any write |
| 58 | `question:1a8cf5034c4c839f` | no_student_name | class_notes.discussions_question | Human student-match review before any write |
| 26 | `question:51aa618b95a7d29d` | unmatched | class_notes.student_questions | Human student-match review before any write |
| 26 | `question:2158d47f6c0c2923` | no_student_name | class_notes.discussions_question | Human student-match review before any write |
| 26 | `question:8f9c41ec6da4ca8c` | no_student_name | class_notes.discussions_question | Human student-match review before any write |
| 25 | `question:e1d44fb96cef6915` | no_student_name | class_notes.discussions_question | Human student-match review before any write |

## Scores And Progress

Not ready to apply.

The fresh read-only audit generated 0 row-level score/progress change rows and
reports score/progress proposal state as `UNKNOWN` for relevant jobs. Kids'
scores/progress should not be updated until an approved dry-run parser/canonical
write plan emits redacted before/after rows.

## Tasks And Research Cards

- Digest manifest task candidates: 34
- Task category cards: 10
- Student-question category cards: 5
- Source sheet status: not verified by this audit
- Production Tasks/research cards created: 0

The Operations cards can now show the safe digest/task/question states. Creating
production tasks, research cards, student question records, or score/progress
rows remains blocked until the parser candidates and question matching are
reviewed or explicitly approved for apply.

## Remaining Blockers

- 10 content jobs need parser/reparse review.
- 6 student question rows need human student-match review.
- Student score/progress updates have no safe row-level apply plan yet.
- PR #45 still needs merge, deployment, and live smoke before app-visible Done.
- `DEC-20260626-101` remains open for production writes, class backfill, broad
  Drive sync, raw export, AI call, paid retranscription, or other unsafe paths.

Exact next safe command after this evidence is pushed:

```bash
gh pr merge 45 --merge
```
