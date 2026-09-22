# One Time CRM Contact Notes DTO Live Smoke - 2026-07-13T09:02:28.226Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: skipped_no_live_contact_notes
Deployment: (not provided)
Commit: (not provided)

## Checks
- PASS operations login uses One Time Railway auth fallback (2122ms)
- PASS scoped One Time CRM list exposes canonical contacts without external writes (465ms)
- PASS selected canonical contact DTOs include legacy contact notes when live notes exist (3577ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, note bodies, message bodies, provider IDs, sends, payments, access grants, or external writes are saved.
- The smoke scans canonical bna_contacts cards and records only aggregate counts plus whether a contact_note DTO was found.
- If production has no scoped canonical One Time contact notes, the probe records a skip rather than creating data.
