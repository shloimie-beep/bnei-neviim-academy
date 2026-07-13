# One Time Operations CRM Workbench Live Smoke - 2026-07-12T21:48:53.805Z

Base URL: https://join.onetimeonetime.com
Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts
Result: passed
Deployment: 13eed8ec-cf2a-4c65-ace5-a3d8522816c4
Commit: 224bc077919c624f115c264d35e35092ed4144da

## Checks
- PASS operations login uses One Time Railway auth fallback (1853ms)
- PASS deployed Operations HTML includes CRM workbench detail markers (1127ms)
- PASS scoped CRM contacts API responds without external-write flags (265ms)
- PASS selected CRM timeline API is read-only when a card exists (249ms)

## Guardrails
- Read-only live smoke; no contact data, notes, raw message bodies, screenshots, sends, payments, access grants, or external CRM writes are saved.
- Live API readback records counts and guard flags only.
- Synthetic local screenshots remain the visual proof for private-data-safe layout review.
