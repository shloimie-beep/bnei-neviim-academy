# One Time Interest CRM E2E Live Smoke - 2026-07-10T11:27:49.452Z

Base URL: https://join.onetimeonetime.com
Result: passed
Test email: test-onetime-crm-e2e-2026-07-10t11-27-49-452z@example.invalid
CRM lead id: 11
Archived lead: yes

## Checks
- PASS operations login uses One Time Railway auth fallback (1943ms)
- PASS public interest submit writes scoped TEST CRM lead without Telegram reminder (430ms)
- PASS admin parent-lead search finds the TEST CRM lead (243ms)
- PASS CRM contact search finds the TEST lead card (251ms)
- PASS CRM timeline shows the captured signup and blocked follow-up attempts (247ms)
- PASS archive TEST CRM lead after readback (284ms)

## Guardrails
- Synthetic TEST/example.invalid lead only.
- Telegram reminder must be skipped by the public interest route.
- No email, WhatsApp/WAPI, checkout, access grant, Zoom, Vimeo, Drive, DNS, or external CRM write is performed.
- CRM lead is archived after visible CRM/timeline readback.
- Append-only product lead row may remain as TEST proof; no raw private data is submitted.
