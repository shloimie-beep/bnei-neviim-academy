# Two-Week Class Intake Audit - Final Verdict

Generated: 2026-06-28T06:34:09.997Z
Status: PARTIAL
Safe to apply class backfill: false

## Summary

Two-week class intake has incomplete organization or downstream pipeline gaps.

## Counts

```json
{
  "drive_recordings_in_range": 18,
  "content_jobs_in_range": 29,
  "drive_orphans_in_range": 0,
  "student_question_rows": 13,
  "github_export_gaps": 24,
  "dry_run_repair_candidates": 10
}
```

## Blockers

- 1 scoped content job(s) do not have confirmed structured output.
- 6 student question row(s) need student-match review.
- 24 scoped transcript job(s) are missing from GitHub transcript export.

## Recommended Next Action

Resolve blockers through dry-run reparse/canonical-write/export plans before generating parent-facing newsletter copy.

## Guardrail

NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.
