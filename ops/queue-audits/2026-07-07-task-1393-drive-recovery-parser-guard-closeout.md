# Task 1393 Drive Recovery Parser Guard Closeout

Recorded: 2026-07-07T14:05:00+03:00

Task: `#1393`

Agent job: `#290`

Run ID: `task-1393-2026-07-07T10-50-09-609Z-a5cf5b`

Title: `Auto BNA Drive recovery after parser persistence deploy`

Related source: `recording_intake:1782116206`

Paired caption artifact: `#1392`

## Verdict

The live task was not a real standalone recovery requirement. It was created
from canonical parse run `22`, parse item `9572`, where a Drive recording-intake
source with no stored transcript body filed its own parser instruction,
caption, and title text into tasks/content/class-session lanes.

The actionable repair was to prevent metadata-only or caption-only recording
intake from being filed as operational records.

## What Changed

- `scripts/telegram-kimi-bridge.mjs` now requires real transcript text before
  choosing recording-intake parsing for parser-only media.
- `server.js` now extracts the actual `Transcript:` body before canonical
  intake filing.
- Metadata-only input such as `Caption/context:` without a transcript is
  rejected with a clear 400-level parser error.
- Canonical intake now receives the actual transcript body, while recording
  title/caption/source details are kept as metadata.
- The AI/progress parser receives the sanitized transcript body, preventing
  parser instructions and Drive captions from being treated as tasks or class
  notes.

## Live Readback

- Task `#1393` source context: `intake_parse_run_id=22`,
  `intake_parse_item_id=9572`, `source_type=recording_intake`,
  `source_id=1782116206`.
- Raw intake: `RAW-20260622-001`, source channel `drive`, parse status
  `registered`, raw text length `594`, transcript text length `0`.
- Parse run `22` status: `partially_filed`, parser version
  `canonical-intake-parser-v1`.
- Sibling items showed the failure mode: parser instruction/title/caption rows
  were filed as tasks and class-session notes, including `#1392` and `#1393`.

No raw transcript/private body was committed.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --test tests/final-register-surfaces-closeout.test.js tests/telegram-runtime-status.test.js tests/telegram-media-routing.test.js` (29/29)
- PASS `node --test tests/ingestion/w3-intake-service.test.js tests/ingestion/w3-intake-persistence.test.js tests/watchdog-raw-intake-drift.test.js` (11/11)
- PASS `node --test tests/class-drive-intake-shared-patch.test.js tests/telegram-goal-board-api-coverage.test.js` (9/9)
- PASS `npm run bna:run:status`
- PASS `npm run bna:run:next`
- PASS `npm run agent:fleet:status`

## Guardrails

- No live task status mutation.
- No Drive write.
- No production DB write beyond read-only API readbacks.
- No parser reprocess rerun.
- No external send.
- No deploy, merge, DNS, payment, access, credential, or provider mutation.

## Supervisor Next Action

After baseline verification, the supervisor can close task `#1393` as repaired
by the parser guard and treat the original live row as a stale parser artifact.
Deployment/live smoke remains a parent release-gate decision because this
worker is Tier 1 only.
