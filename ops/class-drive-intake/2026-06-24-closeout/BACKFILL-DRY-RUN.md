# Guarded Class Backfill Dry Run

Generated: 2026-06-24T13:44:04.977Z
Mode: dry_run_no_writes
No production mutation: true
Safe to apply: false
Required gate phrase: APPLY_GUARDED_CLASS_BACKFILL

## Candidate Jobs

| Job | Required Range | Fingerprint |
| ---: | --- | --- |
| 65 | yes | f719e2abdd6e9a15 |
| 67 | yes | 2134a59dd20571d0 |
| 68 | yes | 04392a2d40860991 |
| 69 | yes | b764af3449469fd9 |
| 70 | yes | 99189a9711767d88 |
| 72 | yes | 4292c6e10a25dad9 |
| 73 | yes | aa5fc9cdb46ec5cc |
| 74 | yes | c87c55f77e2c28aa |

## Exclusions

- Job 2: outside requested guarded backfill job range
- Job 4: outside requested guarded backfill job range
- Job 5: outside requested guarded backfill job range
- Job 6: outside requested guarded backfill job range
- Job 7: outside requested guarded backfill job range
- Job 8: outside requested guarded backfill job range
- Job 9: outside requested guarded backfill job range
- Job 10: outside requested guarded backfill job range
- Job 11: outside requested guarded backfill job range
- Job 12: outside requested guarded backfill job range
- Job 13: outside requested guarded backfill job range
- Job 14: outside requested guarded backfill job range
- Job 16: outside requested guarded backfill job range
- Job 17: outside requested guarded backfill job range
- Job 18: outside requested guarded backfill job range
- Job 19: outside requested guarded backfill job range
- Job 20: outside requested guarded backfill job range
- Job 21: outside requested guarded backfill job range
- Job 22: outside requested guarded backfill job range
- Job 23: outside requested guarded backfill job range
- Job 24: outside requested guarded backfill job range
- Job 25: outside requested guarded backfill job range
- Job 26: outside requested guarded backfill job range
- Job 27: outside requested guarded backfill job range
- Job 28: outside requested guarded backfill job range
- Job 29: outside requested guarded backfill job range
- Job 30: outside requested guarded backfill job range
- Job 31: outside requested guarded backfill job range
- Job 32: outside requested guarded backfill job range
- Job 33: outside requested guarded backfill job range
- Job 34: outside requested guarded backfill job range
- Job 35: outside requested guarded backfill job range
- Job 36: outside requested guarded backfill job range
- Job 37: outside requested guarded backfill job range
- Job 38: outside requested guarded backfill job range
- Job 39: outside requested guarded backfill job range
- Job 40: outside requested guarded backfill job range
- Job 41: outside requested guarded backfill job range
- Job 42: outside requested guarded backfill job range
- Job 43: outside requested guarded backfill job range
- Job 44: outside requested guarded backfill job range
- Job 45: outside requested guarded backfill job range
- Job 46: outside requested guarded backfill job range
- Job 47: outside requested guarded backfill job range
- Job 48: outside requested guarded backfill job range
- Job 49: outside requested guarded backfill job range
- Job 50: outside requested guarded backfill job range
- Job 51: outside requested guarded backfill job range
- Job 52: outside requested guarded backfill job range
- Job 53: outside requested guarded backfill job range
- Job 54: outside requested guarded backfill job range
- Job 56: outside requested guarded backfill job range
- Job 57: outside requested guarded backfill job range
- Job 58: outside requested guarded backfill job range
- Job 59: outside requested guarded backfill job range
- Job 62: outside requested guarded backfill job range
- Job 63: outside requested guarded backfill job range
- Job 64: no structured class/progress output available for backfill
- Job 66: no structured class/progress output available for backfill
- Job 71: no structured class/progress output available for backfill
- Job 75: outside requested guarded backfill job range
- Job 76: outside requested guarded backfill job range
- Job 77: outside requested guarded backfill job range
- Job 78: outside requested guarded backfill job range
- Job 79: outside requested guarded backfill job range
- Job 80: outside requested guarded backfill job range
- Job 81: outside requested guarded backfill job range

## Blocking Ambiguities

- None

## Expected Row Counts

```json
{}
```

## Row-Level Change Plan

| Table | Action | Natural Key |
| --- | --- | --- |

## Transaction And Rollback

- BEGIN
- lock each candidate bna_content_jobs row FOR UPDATE
- upsert by deterministic natural keys
- write audit event with source fingerprints and counts
- COMMIT
- Take a production DB snapshot before apply.
- Store inserted/updated row ids and previous values in the audit event.
- Rollback restores before values and deletes inserted rows by audit id in one transaction.

Apply command: `node scripts/class-drive-intake-reconcile.cjs backfill --apply --gate APPLY_GUARDED_CLASS_BACKFILL --jobs 64-74`
Rollback command: `node scripts/class-drive-intake-reconcile.cjs rollback --gate APPLY_GUARDED_CLASS_BACKFILL --audit-id <audit_event_id>`
