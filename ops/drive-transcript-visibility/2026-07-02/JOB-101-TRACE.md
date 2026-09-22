# Job 101 Trace

Status: partial/blocker recorded; no production mutation.

## Identity

| Field | Value |
|---|---|
| Drive job | `2026-07-02-1782986967824-mgi6h3` |
| Content job | `101` |
| File | `Voice 260702_100126.m4a` |
| Downloaded path from source packet | `media-inbox/2026-07-02/2026-07-02T10-09-04-304Z-drive-Voice-260702_100126.m4a` |
| Redacted Drive ref | `drive_file:f07607f3f9f8` |
| MIME | `audio/mp4` |
| Size | `90266771` bytes |

## Current State

| Check | Result |
|---|---|
| Content job exists | Yes |
| Source envelope exists | Yes |
| Drive source exists | Yes |
| Local media exists | Known downloaded path from packet; not re-read as an apply step |
| Current Drive stage | `03 Transcribed` |
| Current app DB status | `transcribed` |
| Transcription provider status | Existing job has transcript text |
| Fallback attempted on existing job | No evidence on existing job |
| Transcript chars | `39920` |
| Transcript doc exists in private Drive library | No |
| Parser output exists | No visible parser output |
| Labels exist | No confirmed labels |
| Summary exists | No confirmed summary |
| Questions extracted | 0 |
| Matched student questions | 0 |
| Ambiguous/unmatched | 0 |
| Task candidates | 0 |
| Score/progress candidates | 0 |
| Newsletter readiness | Not ready |

## Blockers

- Job 101 is not silently lost: it is transcribed and in `03 Transcribed`.
- It is not complete: parser request/result and structured output are missing.
- It is not ChatGPT Drive connector ready: no private Drive transcript document
  exists for job 101.
- Reprocess dry-run plan says the safe candidate is `dry_run_reparse` for
  `content_job:101`; no apply command is authorized.

## Exact Next Action

Run an approved dry-run reparse for `content_job:101`. After that, create the
private Drive transcript doc only after this exact approval or a narrower
approved backlog phrase:

`APPROVE_20260702_PRIVATE_DRIVE_TRANSCRIPT_DOC_SYNC_FOR_BACKLOG_AND_FUTURE_UPLOADS`

No student score/progress writes are authorized.
