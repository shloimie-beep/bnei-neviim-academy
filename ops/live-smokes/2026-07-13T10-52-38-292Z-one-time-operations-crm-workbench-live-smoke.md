# One Time Operations CRM Workbench Live Smoke - 2026-07-13T10:52:38.292Z

Base URL: https://join.onetimeonetime.com
Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts
Result: passed
Deployment: (not provided)
Commit: (not provided)

## Checks
- PASS operations login uses One Time Railway auth fallback (3869ms)
- PASS deployed Operations HTML includes CRM workbench detail markers (1191ms)
- PASS scoped CRM contacts API responds without external-write flags (271ms)
- PASS selected CRM timeline API is read-only when a card exists (449ms)

## Guardrails
- Read-only live smoke; no contact data, notes, raw message bodies, screenshots, sends, payments, access grants, or external CRM writes are saved.
- Live API readback records counts and guard flags only.
- Synthetic local screenshots remain the visual proof for private-data-safe layout review.
