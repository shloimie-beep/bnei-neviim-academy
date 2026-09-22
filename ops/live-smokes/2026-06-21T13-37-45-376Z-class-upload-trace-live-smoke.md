# Class Upload Trace Live Smoke - 2026-06-21T13:37:45.376Z

App: https://bneineviimacademy.org
Result: blocked_verified
Content job: #78 Drive Class Sunday balak

## Checks
- PASS Operations login: cookie bna_ops_session
- PASS Content job source readback: Drive Class Sunday balak (blocked, 02 Ingesting)
- PASS Blocked-before-parse state is explicit: sanitized credential blocker present; no transcript body stored
- PASS No parse run was created for blocked job: no parse run; blocker occurred before transcription completed

## Trace Evidence
- Source type: google_drive
- Workspace/project: n/a / bna
- Drive stage/status: 02 Ingesting / blocked
- Drive file id: 1Fq_4BCquWGwsNzHvbCuf8ew5HQxn01gH
- Created at: 2026-06-21T10:04:38.843Z
- Transcript chars: 0
- Parse run for source #78: none
- Blocker: OpenAI transcription credential rejected with 401 invalid_credential before transcript or parse run could be created.

## Guardrails
- Readback plus status patch evidence only; no transcript body is written to this report.
- No parse-run apply, task filing, external send, billing, Zoom, Vimeo, Buffer, DNS, CRM/GHL, WhatsApp, or email write is performed by this smoke.
- The live content job notes were checked for secret-like credential material before this smoke passed.
