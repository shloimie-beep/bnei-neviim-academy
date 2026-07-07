# One Time CRM Import Dedupe Live Smoke - 2026-07-07T06:54:02.818Z

App: https://bneineviimacademy.org
Result: passed

## Checks
- PASS Operations login: cookie bna_ops_session
- PASS Read One Time CRM import readiness route: 56 candidates / 2608 scoped leads
- PASS Operations CRM import panel is shipped with disabled apply action: panel marker and disabled apply shipped
- PASS Preview One Time CRM import without writes: 2 rows
- PASS Preview response has 9D safety policy: preview-only/no-send/no-GHL policy present
- PASS Inventory source and One Time scope are attached: inventory source and One Time scope present
- PASS Rows have scoped dedupe metadata and no raw source rows: scoped row dedupe metadata present

## Preview Evidence
- Source inventory ID: DL-SHEET-f93f34d98e
- Scope: rabbi_sheller_provider / one_time_mishnah_class
- Readiness candidates: 56
- Current scoped leads: 2608
- Preview rows: 2
- Possible duplicates: 0
- Commit blocked: true

## Guardrails
- Synthetic `.invalid` rows only; no real private contact rows are submitted or written to this report.
- Dry-run preview only; no contact, tag, email, WhatsApp, external CRM, GHL/LeadConnector, billing, or local import write.
- Preview response is checked for scoped dedupe keys and absence of raw `source_row` dumps.
