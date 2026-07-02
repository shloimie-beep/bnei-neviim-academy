# Two-Week Class Intake Audit - Final Verdict

Generated: 2026-07-02T15:44:52.962Z
Status: PARTIAL
Safe to apply class backfill: false

## Summary

Two-week class intake has incomplete organization or downstream pipeline gaps.

## Counts

```json
{
  "drive_recordings_in_range": 7,
  "content_jobs_in_range": 7,
  "drive_orphans_in_range": 0,
  "student_question_rows": 0,
  "github_export_gaps": 6,
  "dry_run_repair_candidates": 1
}
```

## Blockers

- 1 scoped content job(s) have no transcript text.
- 2 scoped content job(s) do not have confirmed structured output.
- 6 scoped transcript job(s) are missing from GitHub transcript export.

## Recommended Next Action

Resolve blockers through dry-run reparse/canonical-write/export plans before generating parent-facing newsletter copy.

## Guardrail

NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.
