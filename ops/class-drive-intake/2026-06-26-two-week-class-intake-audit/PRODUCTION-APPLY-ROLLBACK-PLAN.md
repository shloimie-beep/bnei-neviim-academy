# Production Apply Rollback Plan

Generated: 2026-06-28T13:14:08.495Z
Required before apply: true
Rollback path: C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql
Rollback path ref: rollback_path:981fa9546360
Commit rollback artifact to Git: false
Contains private data: true

## Strategy

- insert rows: delete by apply audit id and natural key
- update rows: restore the full before snapshot for each row id
- all batches: verify post-rollback row counts and write sanitized readback proof
