# Apply Lane Design

Generated: 2026-06-28T11:52:04.755Z
Mode: apply_lane_design_only_not_executed
Current apply lane status: refuses_mutation_by_design
Production apply executed: false
Dry-run default: true
Required gate phrase: APPLY_GUARDED_CLASS_BACKFILL

## Commands

Dry-run command: `node scripts/class-drive-intake-reconcile.cjs backfill --jobs 21-71 --out-dir <evidence-dir>`
Apply command template: `node scripts/class-drive-intake-reconcile.cjs backfill --apply --gate APPLY_GUARDED_CLASS_BACKFILL --jobs <exact-approved-job-range> --snapshot <snapshot-file> --rollback-out <rollback-file>`

## Required Controls

- explicit owner approval naming job IDs and actions
- production DB snapshot before write
- rollback file generated before commit
- row-level before/after evidence
- idempotent natural keys
- small batch support
- dry-run remains default

## Refusal Conditions

- raw transcript body would be exported to GitHub
- student match is ambiguous
- score/progress row lacks before/after
- target schema is unknown
- snapshot path is missing
- rollback path is missing
- approval scope does not exactly match job IDs/actions
- Drive write or broad sync is requested by the apply lane

## Success Planning Path

```json
{
  "safe_to_apply_if_separately_approved": true,
  "expected_row_counts": {
    "bna_accountability_events": 917
  },
  "row_level_change_plan_rows": 919,
  "blocking_ambiguities": 0,
  "dry_run_performs_no_writes": true
}
```

This packet documents the guarded apply contract but leaves the CLI mutation path disabled until an exact owner-approved implementation step is requested.
