# Final Production Apply Dry-run

Generated: 2026-06-30T05:33:06.350Z
Mode: issue41_final_guarded_apply_plan
Dry-run passed: true
No Drive write: true
No AI call: true
Raw transcript bodies included: false
Raw Drive URLs/IDs included: false

## Summary

- question_rows_total: 13
- student_specific_matched_rows: 7
- general_class_question_rows: 6
- student_match_blocked_rows: 0
- score_progress_rows: 0
- task_research_private_review_rows: 25
- parser_backlog_job_ids: 21, 25, 26, 30, 31, 56, 57, 58, 59, 71
- recording_digest_count: 29
- class_question_fanout_rows: 0

## Checks

| Check | Passed | Detail |
| --- | --- | --- |
| owner_decision_packet_valid | yes | owner decision matches final approved counts |
| question_rows_total_13 | yes | questionRows=13 |
| student_specific_rows_7 | yes | personal=7 |
| general_class_rows_6 | yes | general=6 |
| student_match_blockers_zero | yes | blocked=0 |
| general_class_no_fanout | yes | classRows=6; fanoutRows=0 |
| score_progress_rows_zero | yes | score/progress final state is terminal no-op for Issue #41 |
| task_private_review_rows_25 | yes | approvedTaskRows=25; sourceTaskRows=25 |
| parser_backlog_exact_10 | yes | 21,25,26,30,31,56,57,58,59,71 |

## Row-level Routing

| Type | Job | Ref | Target | Action | Student |
| --- | ---: | --- | --- | --- | --- |
| personal_question | 25 | question:6019529478340587 | bna_accountability_events | insert_if_missing | student:643 |
| personal_question | 25 | question:60209685cc7d6f18 | bna_accountability_events | insert_if_missing | student:643 |
| personal_question | 26 | question:f6c6b9b262d1ded1 | bna_accountability_events | insert_if_missing | student:21982 |
| personal_question | 26 | question:21aaf39597e516fe | bna_accountability_events | insert_if_missing | student:21983 |
| personal_question | 30 | question:5a39d7e6e9c73fd9 | bna_accountability_events | insert_if_missing | student:2436 |
| personal_question | 31 | question:fa503a5ec9da60db | bna_accountability_events | insert_if_missing | student:21982 |
| personal_question | 58 | question:d7297f7b6a534cd7 | bna_accountability_events | insert_if_missing | student:643 |
| class_question | 25 | question:e1d44fb96cef6915 | bna_one_time_question_reviews | insert_if_missing |  |
| class_question | 26 | question:51aa618b95a7d29d | bna_one_time_question_reviews | insert_if_missing |  |
| class_question | 26 | question:2158d47f6c0c2923 | bna_one_time_question_reviews | insert_if_missing |  |
| class_question | 26 | question:8f9c41ec6da4ca8c | bna_one_time_question_reviews | insert_if_missing |  |
| class_question | 58 | question:c516d14ee4e5d49f | bna_one_time_question_reviews | insert_if_missing |  |
| class_question | 58 | question:1a8cf5034c4c839f | bna_one_time_question_reviews | insert_if_missing |  |
| private_task_research_review | 56 | TASK-CANDIDATE-000056-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 57 | TASK-CANDIDATE-000057-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 58 | TASK-CANDIDATE-000058-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 59 | TASK-CANDIDATE-000059-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 64 | TASK-CANDIDATE-000064-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 65 | TASK-CANDIDATE-000065-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 66 | TASK-CANDIDATE-000066-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 67 | TASK-CANDIDATE-000067-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 68 | TASK-CANDIDATE-000068-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 69 | TASK-CANDIDATE-000069-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 70 | TASK-CANDIDATE-000070-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 71 | TASK-CANDIDATE-000071-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 72 | TASK-CANDIDATE-000072-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 73 | TASK-CANDIDATE-000073-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 74 | TASK-CANDIDATE-000074-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 75 | TASK-CANDIDATE-000075-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 76 | TASK-CANDIDATE-000076-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 77 | TASK-CANDIDATE-000077-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 78 | TASK-CANDIDATE-000078-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 79 | TASK-CANDIDATE-000079-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 80 | TASK-CANDIDATE-000080-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 81 | TASK-CANDIDATE-000081-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 82 | TASK-CANDIDATE-000082-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 83 | TASK-CANDIDATE-000083-DIGEST | bna_tasks | insert_if_missing |  |
| private_task_research_review | 21 | TASK-CANDIDATE-ISSUE41-PARSER-BACKLOG-REVIEW | bna_tasks | insert_if_missing |  |

## Privacy Scan

- Passed: true
- Findings: none
