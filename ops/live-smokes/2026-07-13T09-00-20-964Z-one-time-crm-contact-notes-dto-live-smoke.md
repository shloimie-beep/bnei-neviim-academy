# One Time CRM Contact Notes DTO Live Smoke - 2026-07-13T09:00:20.964Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: skipped_no_live_contact_notes
Deployment: 99ea47d8-a5a1-4403-b435-a732b7df21d1
Commit: e0dd3d48543740efb32b35f64ad27cf0cc6e676b

## Checks
- PASS operations login uses One Time Railway auth fallback (2026ms)
- PASS scoped One Time CRM list exposes canonical contacts without external writes (478ms)
- PASS selected canonical contact DTOs include legacy contact notes when live notes exist (3582ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, note bodies, message bodies, provider IDs, sends, payments, access grants, or external writes are saved.
- The smoke scans canonical bna_contacts cards and records only aggregate counts plus whether a contact_note DTO was found.
- If production has no scoped canonical One Time contact notes, the probe records a skip rather than creating data.
