# One Time Operations CRM Workbench Live Smoke - 2026-07-10T08:45:30.918Z

Base URL: https://join.onetimeonetime.com
Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts
Result: passed
Deployment: 73676e6e-b489-4da1-9c95-f366a4aa7c92
Commit: 353a0f33

## Checks
- PASS operations login uses One Time Railway auth fallback (2218ms)
- PASS deployed Operations HTML includes CRM workbench detail markers (1563ms)
- PASS scoped CRM contacts API responds without external-write flags (281ms)
- PASS selected CRM timeline API is read-only when a card exists (262ms)

## Guardrails
- Read-only live smoke; no contact data, notes, raw message bodies, screenshots, sends, payments, access grants, or external CRM writes are saved.
- Live API readback records counts and guard flags only.
- Synthetic local screenshots remain the visual proof for private-data-safe layout review.
