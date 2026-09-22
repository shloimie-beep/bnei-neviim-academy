# One Time Task And Decision Production Cleanup

Generated: 2026-06-24T17:33:49.701Z
Mode: applied
Tasks seen: 1000
Actions planned: 3
Actions applied: 3
Actions failed: 0

## Action Counts

- reclassify_one_time_record: 3

## Safety

- no hard deletes
- no parent/student/payment/communication records mutated
- duplicate archives use canonical_task_id and duplicate_of_task_id for rollback
- One Time reclassification updates only project scope
- internal handoff quarantine uses archive/history fields only

## Rollback

- Restore fields from each action.before object for the affected task_id.
- For duplicate archives, clear archived_at, duplicate_archived_at, duplicate_of_task_id, canonical_task_id, and duplicate_reason from the archived duplicate if rollback is approved.

