# Job Pipeline Trace

Generated: 2026-07-02T15:44:52.958Z
Date range: 2026-06-25 through 2026-07-02

| Kind | Job | Status/stage | Transcript chars | Parser | Structured | Canonical writes | Student match | Questions | Retry/dedup |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| content_job | #101 | transcribed/03 Transcribed | 39920 |  | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | CONFIRMED |
| content_job | #100 | blocked/03 Transcribed | 39206 | canonical-intake-parser | CONFIRMED | CONFIRMED | UNKNOWN | UNKNOWN | CONFIRMED |
| content_job | #91 | ingested/02 Ingesting | 0 |  | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | CONFIRMED |
| content_job | #85 | transcribed/04 Parsed | 58847 | canonical-intake-parser | CONFIRMED | CONFIRMED | UNKNOWN | UNKNOWN | CONFIRMED |
| content_job | #84 | transcribed/04 Parsed | 49429 | canonical-intake-parser | CONFIRMED | CONFIRMED | UNKNOWN | UNKNOWN | CONFIRMED |
| content_job | #83 | transcribed/04 Parsed | 9025 | canonical-intake-parser | CONFIRMED | CONFIRMED | UNKNOWN | UNKNOWN | CONFIRMED |
| content_job | #82 | transcribed/04 Parsed | 5309 | canonical-intake-parser | CONFIRMED | CONFIRMED | UNKNOWN | UNKNOWN | CONFIRMED |

## Stage Summary

```json
{
  "source_discovered": {
    "CONFIRMED": 7
  },
  "source_fingerprint": {
    "CONFIRMED": 7
  },
  "intake_record": {
    "CONFIRMED": 6,
    "UNKNOWN": 1
  },
  "queue_record": {
    "CONFIRMED": 7
  },
  "download": {
    "CONFIRMED": 7
  },
  "transcription_request": {
    "CONFIRMED": 6,
    "UNKNOWN": 1
  },
  "transcription_result": {
    "CONFIRMED": 6,
    "UNKNOWN": 1
  },
  "parser_request": {
    "UNKNOWN": 1,
    "CONFIRMED": 5,
    "SKIPPED": 1
  },
  "structured_output": {
    "UNKNOWN": 2,
    "CONFIRMED": 5
  },
  "class_session_match": {
    "UNKNOWN": 2,
    "CONFIRMED": 5
  },
  "student_name_alias_match": {
    "UNKNOWN": 7
  },
  "ambiguity_review": {
    "UNKNOWN": 7
  },
  "score_progress_proposal": {
    "UNKNOWN": 7
  },
  "question_proposal": {
    "UNKNOWN": 7
  },
  "profile_note_proposal": {
    "UNKNOWN": 7
  },
  "accountability_proposal": {
    "UNKNOWN": 6,
    "CONFIRMED": 1
  },
  "canonical_write_status": {
    "UNKNOWN": 2,
    "CONFIRMED": 5
  },
  "operations_read_model_visibility": {
    "CONFIRMED": 7
  },
  "parent_student_visibility": {
    "CONFIRMED": 7
  },
  "retry_dedup_status": {
    "CONFIRMED": 7
  }
}
```
