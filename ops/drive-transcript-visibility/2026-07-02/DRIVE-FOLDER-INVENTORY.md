# Drive Folder Inventory

Status: read-only audit complete; broad Drive mutation not performed.

## Inventory Sources

- Google Drive connector read-only search/listing.
- `npm run drive:trace-newest-recording`
- `npm run content:drive-intake-audit -- --start-date 2026-06-25 --end-date 2026-07-02 --out-dir ops/drive-transcript-visibility/2026-07-02/class-intake-audit --job-id 101`
- `npm run content:sync-drive-library -- --dry-run --no-ai`

## Findings

| Area | Result |
|---|---|
| Configured Drive folders | 21 |
| Files seen by newest-recording trace | 385 |
| Likely recordings seen | 332 |
| Scoped Drive recordings, 2026-06-25 through 2026-07-02 | 7 |
| Scoped content jobs | 7 |
| Drive orphans in scoped audit | 0 |
| Stuck in `02 Ingesting` / processing | 1, `content_job:91` |
| Jobs with transcript but no GitHub-safe digest export | 6 |
| Jobs missing confirmed structured output | 2, including `content_job:101` |
| Job 101 private Drive transcript doc | Missing |

Observed folders include the BNA V2 root, Raw Media Intake, Processing /
Ingesting, Processed Recordings / Transcribed, Content Library - Marketing, and
`01 Transcript Library`.

The Raw Media Intake folder was empty in the connector listing. The Processing
folder still has one scoped stuck media item. The Transcript Library exists and
has existing docs, but `Job 101` and `Voice 260702_100126` did not appear in
search/listing checks.

## Lane Classification

- Audio/video: transcription candidate.
- Text/Doc transcript: transcript import candidate.
- Slides/PDF/source sheets: source material, not transcription.
- Images: asset lane.
- Unknown: needs operator decision.

## Guardrail

No Drive files were moved, created, shared, or updated during this audit.
