# One Time Operations CRM Workbench Live Smoke - 2026-07-13T09:00:20.966Z

Base URL: https://join.onetimeonetime.com
Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts
Result: passed
Deployment: 99ea47d8-a5a1-4403-b435-a732b7df21d1
Commit: e0dd3d48543740efb32b35f64ad27cf0cc6e676b

## Checks
- PASS operations login uses One Time Railway auth fallback (2814ms)
- PASS deployed Operations HTML includes CRM workbench detail markers (1116ms)
- PASS scoped CRM contacts API responds without external-write flags (264ms)
- PASS selected CRM timeline API is read-only when a card exists (249ms)

## Guardrails
- Read-only live smoke; no contact data, notes, raw message bodies, screenshots, sends, payments, access grants, or external CRM writes are saved.
- Live API readback records counts and guard flags only.
- Synthetic local screenshots remain the visual proof for private-data-safe layout review.
