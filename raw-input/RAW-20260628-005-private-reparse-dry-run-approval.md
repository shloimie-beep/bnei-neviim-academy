# RAW-20260628-005 - Owner approval for private reparse dry-run only

- Source channel: codex_chat
- Received: 2026-06-28
- Workspace/project: bna / class_drive_intake
- Status: registered
- Related issue: GitHub Issue #41
- Related PR: GitHub PR #49
- Privacy classification: private_transcript_read_approved_for_exact_jobs_no_write

## Raw request

OWNER APPROVAL - PRIVATE REPARSE / CANONICAL-WRITE DRY-RUN ONLY

I approve a no-write private reparse/canonical-write dry-run for these jobs only:

21, 25, 26, 30, 31, 56, 57, 58, 59, 71

Goal:
Use the authenticated private Drive/app transcript source to reparse these 10 jobs and produce sanitized row-level dry-run evidence.

Allowed:
- read the private transcript source for these 10 jobs only;
- extract structured question candidates;
- extract spoken student-name mentions and map them to normalized student/student_id candidates where safe;
- separate matched personal questions from class-question broadcasts;
- produce redacted row-level before/after plans for student questions, class questions, tasks, scores, and progress;
- update sanitized repo evidence only;
- update the active execution run, NEXT-SESSION.md, ledger, changelog, PR #49, and Issue #41 with results.

Still forbidden:
- no --apply;
- no production DB mutation;
- no student portal writes;
- no score/progress writes;
- no production task writes;
- no class backfill;
- no Drive create/update/delete/move;
- no raw transcript bodies committed to GitHub;
- no raw Drive URLs/IDs in repo evidence;
- no AI call unless separately approved;
- no paid retranscription;
- no sends/publishes/charges/access grants;
- no credential/account/DNS changes.

Required output:
- For each of the 10 jobs, explain why it was Needs parse.
- For every question candidate, show redacted row-level routing:
  personal_question, class_question_broadcast, existing_skip, or blocked_review.
- For every student-name mention, show the safe match status without exposing private transcript text.
- For score/progress, emit row-level before/after rows or a concrete no-op reason.
- Keep PR #49 draft unless production apply is still blocked.

## Parsed scope

- Approved private-read job IDs: 21, 25, 26, 30, 31, 56, 57, 58, 59, 71.
- Approved mode: dry-run evidence only.
- Approved writes: sanitized repo evidence and GitHub/run status updates only.
- Explicitly not approved: production apply, Drive writes, raw transcript export, AI, paid retranscription, sends/publishes/charges/access grants, credential/account/DNS changes.
