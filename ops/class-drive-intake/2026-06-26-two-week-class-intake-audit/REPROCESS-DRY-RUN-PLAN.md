# Reprocess Dry-Run Plan

Generated: 2026-06-26T11:13:59.673Z
Safe to apply: false
Guardrail: NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.

## Dry-Run Repair Candidates

| Action | Target | Source | Reason | No write |
| --- | --- | --- | --- | --- |
| dry_run_reparse | content_job_parse_json | content_job:71 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:59 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:58 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:57 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:56 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:31 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:30 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:26 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:25 | Transcript exists but no parser metadata/output was found. | yes |
| dry_run_reparse | content_job_parse_json | content_job:21 | Transcript exists but no parser metadata/output was found. | yes |

## Row-Level Change Plan

- None. This package intentionally performs no production mutations.
