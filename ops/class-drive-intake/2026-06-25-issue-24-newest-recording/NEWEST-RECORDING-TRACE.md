# Newest Drive Recording Read-Only Trace

Generated: 2026-07-02T12:41:45.410Z
Mode: read_only_newest_drive_recording_trace
No production mutation: true
Class backfill guardrail: NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.

## Verdict

- Status: PARTIAL
- Summary: Newest recording has no confirmed structured class output.
- Blocker: No structured class output was found.
- Next action: Inspect parser request/result for the content job; preserve the Issue #18 no-backfill guardrail.

## Selection

- Source: google_drive_readback
- Match status: matched
- Reason: Newest Drive recording matched to a content job by Drive file id.
- Selected Drive file: drive_file:f07607f3f9f8
- Selected content job: content_job:101
- Transcript chars: 39920

## Stage Verdict

| Stage | Status | Evidence |
| --- | --- | --- |
| source_discovered | CONFIRMED | content job 101 |
| source_fingerprint | CONFIRMED | 487e9f3034b947eb |
| intake_record | UNKNOWN | No linked raw/canonical intake row was found. |
| queue_record | CONFIRMED | status=transcribed stage=03 Transcribed |
| download | CONFIRMED | Download/transcript evidence exists. |
| transcription_request | CONFIRMED | Transcript or transcription metadata exists. |
| transcription_result | CONFIRMED | 39920 transcript chars |
| parser_request | UNKNOWN | Transcript exists but parser request is not visible. |
| structured_output | UNKNOWN | No structured class output was found. |
| class_session_match | UNKNOWN | No class-session signal. |
| student_name_alias_match | UNKNOWN | No parsed student names found. |
| ambiguity_review | UNKNOWN | No student names to review. |
| score_progress_proposal | UNKNOWN | No progress signals found. |
| question_proposal | UNKNOWN | No parsed student questions found. |
| profile_note_proposal | UNKNOWN | No profile-note candidates found. |
| accountability_proposal | UNKNOWN | No accountability events found. |
| canonical_write_status | UNKNOWN | No structured output to compare. |
| operations_read_model_visibility | CONFIRMED | Operations-backed row is visible. |
| parent_student_visibility | CONFIRMED | Progress/accountability rows exist for downstream views. |
| retry_dedup_status | CONFIRMED | No duplicate or retry marker found. |

## Structured Output Counts

```json
{
  "parser": null,
  "class_notes": 0,
  "daily_torah_updates": 0,
  "group_goal_entries": 0,
  "accountability_events": 0,
  "tasks": 0,
  "intake_parse_run_ref": null,
  "raw_intake_stable_id": null
}
```

## Related Row Counts

```json
{
  "class_sessions": 0,
  "group_goal_entries": 0,
  "torah_entries_scope": 47,
  "accountability_events": 0,
  "content_outputs": 1,
  "intake_parse_runs": 44,
  "raw_intake_rows": 46
}
```
