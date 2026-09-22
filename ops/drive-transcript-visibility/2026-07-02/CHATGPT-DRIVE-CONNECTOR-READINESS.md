# ChatGPT Drive Connector Readiness

Status: not ready for job 101 until private Drive transcript docs are applied.

## Current Finding

The Transcript Library folder exists and contains existing docs, but connector
search/listing did not find a private Drive transcript doc for `Job 101` or
`Voice 260702_100126`.

The dry-run Drive library sync plans to create:

`#101 - Drive Voice 260702_100126`

No Drive write was performed.

## Readiness Criteria

Transcript docs should be Google Docs or readable text files, live in the
private folder accessible to the connected Drive account, and be searchable by:

- job ID;
- date;
- source filename;
- generated title;
- `Transcript Library`.

Each doc should include private warning, metadata, parser status, transcript
provider/model, clean subject breakdown, newsletter-safe markers,
student/private markers, task refs, score/progress refs, and raw transcript body
inside private Drive only.

## Sample Search Checklist

After approved sync, check:

- `Job 101`
- `Voice 260702_100126`
- `2026-07-02 Transcript`
- `#101 - Drive Voice 260702_100126`

Expected pass condition: the private Drive connector returns the job 101
transcript doc and its metadata can be read by the owner account.

Expected fail condition: only repo digests/app DB rows appear, or the doc is not
searchable by job/date/source filename.

## Approval Required

`APPROVE_20260702_PRIVATE_DRIVE_TRANSCRIPT_DOC_SYNC_FOR_BACKLOG_AND_FUTURE_UPLOADS`
