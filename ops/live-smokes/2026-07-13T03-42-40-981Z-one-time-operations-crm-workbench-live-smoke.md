# One Time Operations CRM Workbench Live Smoke - 2026-07-13T03:42:40.981Z

Base URL: https://join.onetimeonetime.com
Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts
Result: passed
Deployment: 3ea1e251-67aa-4137-85cc-82d38437ab8d
Commit: 467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8

## Checks
- PASS operations login uses One Time Railway auth fallback (2001ms)
- PASS deployed Operations HTML includes CRM workbench detail markers (1092ms)
- PASS scoped CRM contacts API responds without external-write flags (262ms)
- PASS selected CRM timeline API is read-only when a card exists (326ms)

## Guardrails
- Read-only live smoke; no contact data, notes, raw message bodies, screenshots, sends, payments, access grants, or external CRM writes are saved.
- Live API readback records counts and guard flags only.
- Synthetic local screenshots remain the visual proof for private-data-safe layout review.
