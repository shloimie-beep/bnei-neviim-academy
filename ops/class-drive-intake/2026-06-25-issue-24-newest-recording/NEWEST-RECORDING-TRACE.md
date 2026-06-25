# Newest Drive Recording Read-Only Trace

Generated: 2026-06-25T14:59:20.955Z
Mode: read_only_newest_drive_recording_trace
No production mutation: true
Class backfill guardrail: NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.

## Verdict

- Status: PARTIAL
- Summary: Newest recording has a pipeline issue at student_name_alias_match.
- Blocker: No parsed student names found.
- Next action: Inspect the named pipeline stage before claiming production processing.

## Selection

- Source: google_drive_readback
- Match status: matched
- Reason: Newest Drive recording matched to a content job by Drive file id.
- Selected Drive file: drive_file:9f6f75a5d602
- Selected content job: content_job:83
- Transcript chars: 9025

## Stage Verdict

| Stage | Status | Evidence |
| --- | --- | --- |
| source_discovered | CONFIRMED | content job 83 |
| source_fingerprint | CONFIRMED | 0e2bf35c08ff4c84 |
| intake_record | CONFIRMED | RAW-20260625-002 |
| queue_record | CONFIRMED | status=transcribed stage=04 Parsed |
| download | CONFIRMED | Download/transcript evidence exists. |
| transcription_request | CONFIRMED | Transcript or transcription metadata exists. |
| transcription_result | CONFIRMED | 9025 transcript chars |
| parser_request | CONFIRMED | canonical-intake-parser |
| structured_output | CONFIRMED | Canonical parser output exists but class/progress output is empty. |
| class_session_match | CONFIRMED | 1 class session row(s) |
| student_name_alias_match | UNKNOWN | No parsed student names found. |
| ambiguity_review | UNKNOWN | No student names to review. |
| score_progress_proposal | UNKNOWN | No progress signals found. |
| question_proposal | UNKNOWN | No parsed student questions found. |
| profile_note_proposal | UNKNOWN | No profile-note candidates found. |
| accountability_proposal | UNKNOWN | No accountability events found. |
| canonical_write_status | CONFIRMED | class=1 group=0 events=0 |
| operations_read_model_visibility | CONFIRMED | Operations-backed row is visible. |
| parent_student_visibility | CONFIRMED | Progress/accountability rows exist for downstream views. |
| retry_dedup_status | CONFIRMED | No duplicate or retry marker found. |

## Structured Output Counts

```json
{
  "parser": "canonical-intake-parser",
  "class_notes": 0,
  "daily_torah_updates": 0,
  "group_goal_entries": 0,
  "accountability_events": 0,
  "tasks": 0,
  "intake_parse_run_ref": "parse_run:54",
  "raw_intake_stable_id": "RAW-20260625-002"
}
```

## Related Row Counts

```json
{
  "class_sessions": 1,
  "group_goal_entries": 0,
  "torah_entries_scope": 36,
  "accountability_events": 0,
  "content_outputs": 1,
  "intake_parse_runs": 41,
  "raw_intake_rows": 42
}
```
