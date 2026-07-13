# One Time Interest Dry-Run Live Smoke - 2026-07-13T13:38:48.485Z

Base URL: https://join.onetimeonetime.com
Result: passed

## Checks
- PASS public One Time direct signup form points to interest endpoint (489ms)
- PASS public dry-run validates lead capture mapping without writes (268ms)

## Guardrails
- Dry-run only; no product lead is inserted.
- No CRM lead is created or updated.
- No internal communication note is created.
- No Telegram, email, WhatsApp/WAPI, checkout, access grant, Zoom meeting, or external write is performed.
