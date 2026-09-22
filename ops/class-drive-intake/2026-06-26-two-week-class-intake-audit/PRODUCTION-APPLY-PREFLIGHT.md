# Production Apply Preflight

Generated: 2026-06-28T13:14:08.495Z
Mode: production_apply_preflight_no_writes
Branch: codex/issue41-class-question-fallback-20260628
PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/49
Issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/41
No production mutation: true
Production apply executed: false
Production apply command may be run now: false
Final owner approval required: true
Required gate phrase: APPLY_GUARDED_CLASS_BACKFILL
Approved job IDs: 21, 25, 26, 30, 31, 56, 57, 58, 59, 71
Approved action list: personal_questions, class_question_broadcasts, score_progress

## Expected Row Counts

- personal_question_candidates: 36
- personal_question_rows: 36
- class_question_broadcast_candidates: 1249
- class_question_broadcast_rows: 9992
- score_progress_rows: 1
- progress_event_rows_deferred: 1
- production_task_rows: 0
- internal_task_candidates_not_applied: 119
- target_table_rows_if_all_requested_batches_are_later_approved: {"bna_accountability_events":10028,"bna_torah_learning_entries":1}

## Refusal Checks

| Check | Passed | Severity | Detail |
| --- | --- | --- | --- |
| exact_approved_job_ids | yes | blocker | requested=21,25,26,30,31,56,57,58,59,71 report=21,25,26,30,31,56,57,58,59,71 |
| all_approved_jobs_inspected | yes | blocker | inspected=21,25,26,30,31,56,57,58,59,71 |
| private_reparse_evidence_non_empty | yes | blocker | private dry-run markdown/json evidence exists and is non-empty |
| private_reparse_evidence_sanitized | yes | blocker | no raw transcript body, raw Drive URL/ID, or secret literal detected in evidence |
| known_private_reparse_counts_preserved | yes | blocker | private dry-run summary matches the approved baseline packet |
| row_counts_match_preflight | yes | blocker | personal=36; classCandidates=1249; classRows=9992; scoreProgress=1; taskCandidates=119 |
| no_blocked_review_question_candidates | yes | blocker | 0 blocked-review question route(s) |
| no_ambiguous_personal_question_matches | yes | blocker | 0 ambiguous personal route(s); ambiguous/no-name questions remain class broadcasts |
| score_progress_before_after_present | yes | blocker | 1 score/progress row(s) |
| target_schema_mapping_known | yes | blocker | supported tables map to bna_accountability_events metadata and bna_torah_learning_entries updates |
| snapshot_path_present | yes | blocker | C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl |
| rollback_path_present | yes | blocker | C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql |
| dedupe_keys_present | yes | blocker | naturalKeys=10029; duplicateKeys=0 |
| production_db_readback_available | yes | blocker | read-only production DB snapshot query succeeded |
| no_drive_write_or_ai_or_raw_export | yes | blocker | private preflight uses DB/app transcript source only and writes repo-safe evidence only |
| production_tasks_not_enabled | yes | blocker | 119 internal task candidate(s) remain internal and are not user-facing production tasks |
| final_owner_apply_approval_recorded | no | owner_approval | This packet authorizes implementation and final no-write preflight only; actual production apply needs a separate exact approval. |

## Batch Commands - Do Not Run Until Final Approval

| Batch | Expected Rows | Command |
| --- | ---: | --- |
| personal_questions | 36 | `node scripts/class-drive-intake-reconcile.cjs production-apply --apply --gate APPLY_GUARDED_CLASS_BACKFILL --job-ids 21,25,26,30,31,56,57,58,59,71 --approved-actions personal_questions,class_question_broadcasts,score_progress --batch personal_questions --snapshot "C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl" --rollback-out "C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql" ` |
| class_question_broadcasts | 9992 | `node scripts/class-drive-intake-reconcile.cjs production-apply --apply --gate APPLY_GUARDED_CLASS_BACKFILL --job-ids 21,25,26,30,31,56,57,58,59,71 --approved-actions personal_questions,class_question_broadcasts,score_progress --batch class_question_broadcasts --snapshot "C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl" --rollback-out "C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql" ` |
| score_progress | 1 | `node scripts/class-drive-intake-reconcile.cjs production-apply --apply --gate APPLY_GUARDED_CLASS_BACKFILL --job-ids 21,25,26,30,31,56,57,58,59,71 --approved-actions personal_questions,class_question_broadcasts,score_progress --batch score_progress --snapshot "C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl" --rollback-out "C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql" ` |

## Remaining Blocker

Final production apply is still blocked by DEC-20260626-101 until Shloimie approves the exact command(s), snapshot path, rollback path, and row counts printed by this preflight.
