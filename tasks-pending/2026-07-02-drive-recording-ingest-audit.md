# 2026-07-02 Drive Recording Ingest Audit

Raw input: `RAW-20260702-004`
Audit report: `ops/audits/2026-07-02-drive-recording-ingest-audit.md`

## Current State

- Job `100` (`Voice 260702_114208.m4a`) is transcribed and partially parsed/filed.
  - Transcript chars: 39,206.
  - Parse run: `57`.
  - Filed count: 254.
  - Review backlog: 528.
  - Content job status remains `blocked` despite parse evidence.
- Job `101` (`Voice 260702_100126.m4a`) is transcribed but not parsed.
  - Transcript chars: 39,920.
  - Status: `transcribed`.
  - Parse run: none.

## Blockers

- Parser output from job `100` is too broad to auto-trust: 782 items from one recording, 528 review items.
- Running Telegram/Drive bridge showed stale OpenAI key behavior before the fresh keyholder diagnostic passed.
- Telegram bridge logs show repeated `409 Conflict`, meaning more than one polling instance may be active.

## Safe Next Batch

1. Review parse run `57` and decide whether to accept, prune, or supersede the filed/review items.
2. Create a parser over-extraction guard before parsing job `101`.
3. Restart the Telegram/Drive bridge from the working environment and stop duplicate polling instances.
4. Export repo-safe transcript digests for jobs `100` and `101` after review policy is decided.

## Do Not Do Yet

- Do not auto-file job `101`.
- Do not publish, email, WhatsApp, or social-post any transcript-derived output.
- Do not commit raw transcript text or full Drive IDs.
