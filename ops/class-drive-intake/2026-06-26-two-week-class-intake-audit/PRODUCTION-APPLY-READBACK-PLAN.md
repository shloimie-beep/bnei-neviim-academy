# Production Apply Readback Plan

Generated: 2026-06-28T13:14:08.495Z
Required after each batch: true

## Commands

- `node scripts/class-drive-intake-reconcile.cjs production-apply-preflight --job-ids 21,25,26,30,31,56,57,58,59,71 --approved-actions personal_questions,class_question_broadcasts,score_progress --snapshot "C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl" --rollback-out "C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql" --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit`
- `node scripts/class-drive-intake-reconcile.cjs private-reparse --job-ids 21,25,26,30,31,56,57,58,59,71 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit`
- `npm run bna:run:validate`

## Checks

- row counts match approved batch
- rerun preflight shows zero duplicate natural keys
- student/class portal read models show only approved question rows
- no raw transcript body appears in repo evidence
