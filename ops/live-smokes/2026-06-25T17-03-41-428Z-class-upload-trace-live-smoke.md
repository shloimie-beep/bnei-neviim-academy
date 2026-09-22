# Class Upload Trace Live Smoke - 2026-06-25T17:03:41.428Z

App: https://bneineviimacademy.org
Result: processed_readback_verified
Content job: #78 Drive Class Sunday balak

## Checks
- PASS Operations login: cookie bna_ops_session
- PASS Content job source readback: Drive Class Sunday balak (transcribed, 04 Parsed)
- PASS Drive-backed content job state is explicit: processed state transcribed / 04 Parsed with 77315 transcript chars
- PASS Parse-run linkage matches content job state: parsed Drive job was not present in the recent parse-run listing

## Trace Evidence
- Source type: google_drive
- Workspace/project: n/a / bna
- Drive stage/status: 04 Parsed / transcribed
- Drive file id: 1Fq_4BCquWGwsNzHvbCuf8ew5HQxn01gH
- Created at: 2026-06-21T10:04:38.843Z
- Transcript chars: 77315
- Parse run for source #78: none
- Blocker: Historical sanitized credential blocker note retained after the job reached processed state.

## Guardrails
- Readback evidence only; no transcript body is written to this report.
- No parse-run apply, task filing, external send, billing, Zoom, Vimeo, Buffer, DNS, CRM/GHL, WhatsApp, or email write is performed by this smoke.
- The live content job notes were checked for secret-like credential material before this smoke passed.
