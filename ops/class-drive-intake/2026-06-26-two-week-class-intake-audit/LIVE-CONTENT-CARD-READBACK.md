# Live Content Card Readback

Generated: 2026-06-28T06:57:17.305Z
App: https://bneineviimacademy.org
Deployment: fd93be96-8bec-4c06-b42f-c53d177eab40
Commit: c0b29982
Verdict: passed

## API Checks

| Query | Jobs | Digest cards | Needs parse jobs | Job #83 title | Raw transcript in digest cards |
| --- | ---: | ---: | --- | --- | --- |
| project_key=all | 81 | 29 | 21, 25, 26, 30, 31, 56, 57, 58, 59, 71 | Class Notes + Class Sessions - 2026-06-25 - #83 | false |
| project_key=bna | 80 | 28 | 21, 25, 26, 30, 31, 56, 58, 59, 71 | Class Notes + Class Sessions - 2026-06-25 - #83 | false |

Note: project_key=bna excludes job #57; project_key=all returns all 29 digest recordings.

## Guardrails

- No Drive write.
- No production database mutation.
- No class backfill.
- No raw transcript body export.
- No AI call.
