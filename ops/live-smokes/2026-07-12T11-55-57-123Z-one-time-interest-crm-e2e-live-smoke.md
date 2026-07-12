# One Time Interest CRM E2E Live Smoke - 2026-07-12T11:55:57.123Z

Base URL: https://join.onetimeonetime.com
Result: passed
Test email: test-onetime-crm-e2e-2026-07-12t11-55-57-123z@example.invalid
CRM lead id: 16
Follow-up task id: 97
Deleted follow-up task: yes
Archived lead: yes

## Checks
- PASS operations login uses One Time Railway auth fallback (1897ms)
- PASS public interest submit writes scoped TEST CRM lead without Telegram reminder (481ms)
- PASS admin parent-lead search finds the TEST CRM lead (242ms)
- PASS CRM contact search finds the TEST lead card (256ms)
- PASS CRM timeline shows the captured signup and blocked follow-up attempts (248ms)
- PASS edit TEST CRM contact and create fake follow-up task through API (281ms)
- PASS reload confirms persisted fake CRM edit and follow-up task (260ms)
- PASS cross-workspace CRM isolation hides fake One Time contact (250ms)
- PASS timeline shows fake note and follow-up task before cleanup (240ms)
- PASS browser opens targeted mailbox and returns to same fake contact (5030ms)
- PASS delete fake follow-up task after readback (869ms)
- PASS archive TEST CRM lead after readback (1121ms)

## Guardrails
- Synthetic TEST/example.invalid lead only.
- Telegram reminder must be skipped by the public interest route.
- No email, WhatsApp/WAPI, checkout, access grant, Zoom, Vimeo, Drive, DNS, or external CRM write is performed.
- CRM lead is archived after visible CRM/timeline readback.
- Append-only product lead row may remain as TEST proof; no raw private data is submitted.
