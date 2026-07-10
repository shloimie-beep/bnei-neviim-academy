# OneTime Interest CRM E2E Live Smoke - 2026-07-10T08:45:40.132Z

Base URL: https://join.onetimeonetime.com
Result: passed
Test email: test-onetime-crm-e2e-2026-07-10t08-45-40-132z@example.invalid
CRM lead id: 9
Archived lead: yes

## Checks
- PASS operations login uses One Time Railway auth fallback (1939ms)
- PASS public interest submit writes scoped TEST CRM lead without Telegram reminder (438ms)
- PASS admin parent-lead search finds the TEST CRM lead (238ms)
- PASS CRM contact search finds the TEST lead card (251ms)
- PASS CRM timeline shows the captured signup internal note (230ms)
- PASS archive TEST CRM lead after readback (240ms)

## Guardrails
- Synthetic TEST/example.invalid lead only.
- Telegram reminder must be skipped by the public interest route.
- No email, WhatsApp/WAPI, checkout, access grant, Zoom, Vimeo, Drive, DNS, or external CRM write is performed.
- CRM lead is archived after visible CRM/timeline readback.
- Append-only product lead row may remain as TEST proof; no raw private data is submitted.
