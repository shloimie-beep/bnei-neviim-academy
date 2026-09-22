# Production Apply Batch Plan

Generated: 2026-06-28T13:14:08.495Z
No production mutation: true
Final owner approval required: true

| Batch | Status | Candidates | Row-Level Apply Rows | Target Tables | Note |
| --- | --- | ---: | ---: | --- | --- |
| personal_questions | ready_after_final_owner_approval | 36 | 36 | {"bna_accountability_events":36} |  |
| class_question_broadcasts | ready_after_final_owner_approval | 1249 | 9992 | {"bna_accountability_events":9992} |  |
| score_progress | ready_after_snapshot_and_final_owner_approval | 1 | 1 | {"bna_torah_learning_entries":1} | The ancillary progress_event row is deferred unless separately approved; the approved score/progress count is one row. |
| production_tasks | not_allowed_internal_candidates_only | 119 | 0 | {} | Internal agent/parser/audit task candidates must not become user-facing tasks without a separate human-visible task plan. |

## Commands - Do Not Run Until Final Approval

- personal_questions: `node scripts/class-drive-intake-reconcile.cjs production-apply --apply --gate APPLY_GUARDED_CLASS_BACKFILL --job-ids 21,25,26,30,31,56,57,58,59,71 --approved-actions personal_questions,class_question_broadcasts,score_progress --batch personal_questions --snapshot "C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl" --rollback-out "C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql"`
- class_question_broadcasts: `node scripts/class-drive-intake-reconcile.cjs production-apply --apply --gate APPLY_GUARDED_CLASS_BACKFILL --job-ids 21,25,26,30,31,56,57,58,59,71 --approved-actions personal_questions,class_question_broadcasts,score_progress --batch class_question_broadcasts --snapshot "C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl" --rollback-out "C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql"`
- score_progress: `node scripts/class-drive-intake-reconcile.cjs production-apply --apply --gate APPLY_GUARDED_CLASS_BACKFILL --job-ids 21,25,26,30,31,56,57,58,59,71 --approved-actions personal_questions,class_question_broadcasts,score_progress --batch score_progress --snapshot "C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl" --rollback-out "C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql"`
