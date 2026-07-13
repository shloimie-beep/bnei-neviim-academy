# One Time Operations CRM Workbench Live Smoke - 2026-07-12T21:25:50.540Z

Base URL: https://join.onetimeonetime.com
Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts
Result: passed
Deployment: 3132ec38-3b28-4583-a2b9-0aab261ef112
Commit: bf0ec619b5ed10b2c057d5cf4f1553362d6614f4

## Checks
- PASS operations login uses One Time Railway auth fallback (1838ms)
- PASS deployed Operations HTML includes CRM workbench detail markers (1101ms)
- PASS scoped CRM contacts API responds without external-write flags (259ms)
- PASS selected CRM timeline API is read-only when a card exists (239ms)

## Guardrails
- Read-only live smoke; no contact data, notes, raw message bodies, screenshots, sends, payments, access grants, or external CRM writes are saved.
- Live API readback records counts and guard flags only.
- Synthetic local screenshots remain the visual proof for private-data-safe layout review.
