# Source Envelope Parser Live Smoke - 2026-06-21T13:38:09.230Z

App: https://bneineviimacademy.org
Result: passed
Dry run: true

## Checks
- PASS Operations login: cookie bna_ops_session
- PASS Dry-run parse source envelope fixture: parse run 18
- PASS Envelope has required fields and Dratler default: family_meeting dratler_family/dratler_family
- PASS Operations fragment overrides local item scope: task internal_super_admin/bna_operations

## Parse Evidence
- Raw intake: RAW-20260621-002
- Parse run: 18
- Source envelope: family_meeting dratler_family/dratler_family
- Operations override: task internal_super_admin/bna_operations

## Guardrails
- Synthetic fixture only; no private source text.
- `dry_run: true`; no parse-run apply, task filing, external send, billing, Zoom, Vimeo, Buffer, DNS, or CRM/GHL write.
