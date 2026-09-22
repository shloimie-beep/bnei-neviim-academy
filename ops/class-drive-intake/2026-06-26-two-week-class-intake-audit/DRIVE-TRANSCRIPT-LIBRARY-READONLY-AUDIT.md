# Drive Transcript Library Read-Only Audit

- Raw source: `RAW-20260626-006`
- GitHub source: issue #41 comment `4808518537`
- Checked at: 2026-06-26T13:21:00+03:00
- Scope: Drive folder and transcript-doc presence only
- Mode: read-only Drive/listing plus sync dry-run

## Verdict

The issue #41 addendum is verified by local tooling.

- `01 Transcript Library` exists under `40 Content Library - Marketing`.
- The folder contained 46 Google Docs at readback time.
- No transcript-library docs were created after `2026-06-25T00:00:00Z`.
- Older job docs in the `#65`-`#70` range exist.
- `content_job:83` did not have an existing transcript-library doc at readback
  time.
- The sync plan remains dry-run only: #83 would be created; #65-#70 would be
  updated.

No Drive write, move, delete, Docs write, paid retranscription, worker retry,
production mutation, stale deletion, raw GitHub transcript export, send, or
deployment was performed.

## Read-Only Folder Listing

| Field | Result |
|---|---|
| Content library folder | `40 Content Library - Marketing` |
| Transcript folder | `01 Transcript Library` |
| Transcript folder exists | yes |
| Transcript folder ID hash | `b94d06a117fcc5cd` |
| Transcript doc count | 46 |
| Newest doc created time | `2026-06-17T17:41:06.110Z` |
| Docs created since `2026-06-25T00:00:00Z` | 0 |
| Minimum job number found | #2 |
| Maximum job number found | #70 |

## Sample Job Presence

| Job | Existing transcript-library doc | Created time | ID hash |
|---:|---|---|---|
| #65 | yes | `2026-06-17T16:46:34.261Z` | `f5d281557b8e8096` |
| #66 | yes | `2026-06-17T16:56:32.120Z` | `8d4eed513c6efa5d` |
| #67 | yes | `2026-06-17T17:20:15.492Z` | `b2f0237dcc8c32be` |
| #68 | yes | `2026-06-17T17:31:24.951Z` | `92694d34632cd105` |
| #69 | yes | `2026-06-17T17:35:50.799Z` | `46c9398a470f8d15` |
| #70 | yes | `2026-06-17T17:41:06.110Z` | `da7c68354c5ec463` |
| #83 | no | n/a | n/a |

## Dry-Run Sync Readback

Command:

```powershell
npm run content:sync-drive-library -- --dry-run --no-ai
```

Result:

- Live transcript jobs with text: 75
- Real transcript jobs selected: 59
- Website articles selected: 24
- Created docs: 0
- Updated docs: 0
- Skipped unchanged docs: 0
- AI breakdowns generated: 0
- AI breakdowns planned: 0
- Planned transcript action for #83: create doc
- Planned transcript actions for #65-#70: update docs

The command printed a private Drive folder URL to the local terminal. The URL
is intentionally not repeated in this tracked evidence file; only hashed IDs
and counts are recorded.

## Guardrails

- `drive_create_update_delete_performed`: false
- `docs_batch_update_performed`: false
- `drive_move_performed`: false
- `production_db_mutation_performed`: false
- `paid_retranscription_performed`: false
- `worker_retry_performed`: false
- `class_backfill_performed`: false
- `raw_transcript_body_export_performed`: false
- `stale_deletion_performed`: false
- `send_or_publish_performed`: false
- `deploy_performed`: false
