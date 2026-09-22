# One Time Interest Dry-Run Live Smoke - 2026-07-13T13:43:30.703Z

Base URL: https://join.onetimeonetime.com
Result: passed

## Checks
- PASS public One Time direct signup form points to interest endpoint (529ms)
- PASS public dry-run validates lead capture mapping without writes (286ms)

## Guardrails
- Dry-run only; no product lead is inserted.
- No CRM lead is created or updated.
- No internal communication note is created.
- No Telegram, email, WhatsApp/WAPI, checkout, access grant, Zoom meeting, or external write is performed.
