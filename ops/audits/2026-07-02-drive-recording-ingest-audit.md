# BNA Drive Recording Ingest Audit - 2026-07-02

Raw request: `RAW-20260702-004`
Scope: two BNA Drive raw media recordings dropped on 2026-07-02.
Privacy: raw transcript text, full Drive IDs, and private item payloads are not included in this repo-safe audit.

## Executive Verdict

The process is partially working, but it is not terminally healthy yet.

- Both recordings were discovered, moved out of raw upload, downloaded locally, chunked for transcription, and now have content-job records.
- Initial automatic transcription failed because the running bridge used a bad/stale OpenAI key. A fresh no-secret diagnostic passed from the keyholder source, so the current keyholder key is good.
- Job `100` was retried, transcribed, and parsed into live intake categories, but it ended as `blocked` / `partially_filed`: 254 items filed and 528 items still in review. The parser output is too broad for a clean "parsed accordingly" claim.
- Job `101` was retried and transcribed, but it was not auto-parsed because job `100` exposed a parser quality/review problem that should not be repeated blindly.
- The Drive raw upload folder is empty; both July 2 files moved to processing/processed stages. One older June 30 recording remains stuck in Processing.

## Recording Status

| Recording | Job | Current State | Evidence |
| --- | ---: | --- | --- |
| `Voice 260702_114208.m4a` | `100` | Transcribed, parsed, partially filed, still blocked | 8 chunks transcribed; 39,206 transcript chars; Drive stage `03 Transcribed`; parse run `57`; 254 filed; 528 review |
| `Voice 260702_100126.m4a` | `101` | Transcribed, not parsed | 10 chunks transcribed; 39,920 transcript chars; Drive stage `03 Transcribed`; no parse JSON yet |

## Category Routing Observed

Job `100` parse run `57` produced these category counts:

| Category | Count |
| --- | ---: |
| requirements | 14 |
| tasks | 14 |
| decisions | 8 |
| tickets | 22 |
| open questions | 274 |
| memory candidates | 13 |
| goal candidates/goals | 11 |
| student notes/questions/observations | 279 |
| class session notes | 22 |
| content/research items | 19 |
| contacts/communications | 16 |
| integration/service-provider items | 4 |
| diet/nutrition/behavior/attendance/assignment | 83 |
| workspace routing/alerts | 3 |

Parser persistence counts reported by the app for job `100`:

- Tasks: 14
- Class notes: 22
- Daily Torah updates: 5
- Torah learning entries: 5
- Accountability events: 218
- Review items: 528

This is not clean enough to trust as fully correct category routing. The system captured many useful lanes, but it over-extracted and left a large review backlog.

## Findings

1. `FIND-20260702-DRIVE-001` - Initial transcription failure was caused by a stale/bad OpenAI key in the running bridge environment. Fresh `npm run openai:diagnose` passed from `keyholder:openaiv2.txt`.
2. `FIND-20260702-DRIVE-002` - The worker created content jobs while transcription was missing, leaving jobs looking queued/ingested rather than terminally blocked.
3. `FIND-20260702-DRIVE-003` - Job `100` parse run over-extracted 782 items from one recording and left 528 review items open.
4. `FIND-20260702-DRIVE-004` - Job `101` should not be auto-filed until parser review thresholds are tightened.
5. `FIND-20260702-DRIVE-005` - Runtime logs repeatedly show Telegram `409 Conflict`, meaning multiple bot polling instances are active or fighting for updates.
6. `FIND-20260702-DRIVE-006` - Error text recorded in memory included provider error JSON with a partial key-shaped value. The runtime should only store a generic provider-configuration blocker.
7. `FIND-20260702-DRIVE-007` - Direct DB readback from this machine failed DNS, though authenticated app API readback succeeded. Future audits should prefer the app readback path when DB DNS is unavailable.
8. `FIND-20260702-DRIVE-008` - The Drive Processing folder still contains an older June 30 recording, so stuck-stage monitoring is needed.
9. `FIND-20260702-DRIVE-009` - No repo-safe transcript digest/index was generated for the July 2 recordings during this pass.

## Commands And Evidence

- `npm run bna:run:status` passed; active run has no unblocked executable batch.
- `npm run bna:run:next` passed; no unblocked executable batch.
- Google Drive connector confirmed `BNA V2 / 00 Upload Here - Raw Media Intake` is empty after pickup.
- Google Drive connector confirmed July 2 recordings moved through `10 Processing - Temporary` / `20 Processed Recordings - Source Media`.
- `npm run openai:diagnose` passed; report `ops/qa-runs/2026-07-02T10-12-49-944Z-openai-diagnostics.md`.
- `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 100 101 --dry-run --auto-parse` initially showed both jobs retryable.
- `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 100 101 --auto-parse` transcribed job `100` but ended with `fetch failed` during follow-up app parse/closeout.
- Authenticated app readback confirmed job `100` transcript, parse run `57`, partial filing, and review backlog.
- `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 101` transcribed job `101` without auto-filing.
- Authenticated app readback confirmed final job states without exposing transcript text.

## Twenty Natural-Language Parsing Improvements

1. Add a single intake state machine: `discovered -> moved -> downloaded -> chunked -> transcribed -> classified -> parsed -> filed -> review -> digest_exported -> done`.
2. Create a raw-intake row before moving a Drive file, with a repo-safe fallback pointer when live DB readback is unavailable.
3. Require every Drive media job to have a small manifest: filename, stable source key, size, MIME, chunk count, stage, job ID, transcript status, parser status, and blocker.
4. Run an AI-provider health preflight before moving files out of Raw Intake.
5. If transcription fails, mark the job `blocked_transcription` instead of leaving `queued` or generic `ingested`.
6. Normalize all provider errors through one secret-safe error formatter before Telegram, memory, logs, content-job notes, or task records.
7. Add an automatic retry queue that wakes after the provider key changes and retries only blocked transcription jobs.
8. Split "Content job" from "Recording intake" earlier: mixed operator/task/student recordings should not default to marketing/content just because the default caption says "content queue".
9. Use a multi-label classifier before filing: class notes, student questions, student progress, tasks, UI bugs, decisions, contacts, communications, content ideas, research, memory, accounting, integrations, and alerts.
10. Add confidence thresholds per lane; low-confidence items should create one grouped review packet, not hundreds of individual visible tasks.
11. Add a statement-level source map so every extracted item points to a redacted timestamp/segment reference.
12. Cap automatic item creation per recording until review passes; large outputs should become a review bundle first.
13. Add duplicate suppression for repeated student questions and repeated open questions inside the same transcript.
14. Separate "question asked in class" from "operator open question" so class questions do not flood the Decisions/Open Questions lane.
15. Add UI/product-quality trigger detection that creates a Product Quality Compiler packet instead of direct UI implementation tasks.
16. Add provider/workspace routing rules to prevent BNA Academy and One Time/Rabbi data from merging without explicit cross-workspace links.
17. Export repo-safe transcript digests automatically after transcription, even when filing is blocked.
18. Add a stuck-stage watchdog for files sitting in `02 Ingesting` / Processing longer than a defined threshold.
19. Enforce a single active Telegram polling bridge and alert when a `409 Conflict` appears more than once.
20. Build parser eval fixtures from redacted excerpts of real mixed recordings and require regressions to pass before auto-filing from Drive.

## Next Actions

1. Review parse run `57` before trusting the 254 filed items and 528 review items.
2. Do not auto-file job `101` until the parser over-extraction issue is addressed or a manual review packet is created.
3. Restart/repair the running Telegram/Drive bridge so it uses the working keyholder OpenAI key and only one polling instance.
4. Add or run a stuck-stage watchdog for the June 30 and July 2 Drive backlog.
5. Generate repo-safe transcript digests for jobs `100` and `101` after review policy is decided.
