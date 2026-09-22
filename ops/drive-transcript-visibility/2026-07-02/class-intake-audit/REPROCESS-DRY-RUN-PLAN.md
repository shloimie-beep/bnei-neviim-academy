# Reprocess Dry-Run Plan

Generated: 2026-07-02T15:44:52.962Z
Safe to apply: false
Guardrail: NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.

## Dry-Run Repair Candidates

| Action | Target | Source | Reason | No write |
| --- | --- | --- | --- | --- |
| dry_run_reparse | content_job_parse_json | content_job:101 | Transcript exists but no parser metadata/output was found. | yes |

## Row-Level Change Plan

- None. This package intentionally performs no production mutations.
