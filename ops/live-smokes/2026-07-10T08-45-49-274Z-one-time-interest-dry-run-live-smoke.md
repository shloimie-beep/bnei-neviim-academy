# OneTime Interest Dry-Run Live Smoke - 2026-07-10T08:45:49.274Z

Base URL: https://join.onetimeonetime.com
Result: passed

## Checks
- PASS public OneTime landing form points to interest endpoint (602ms)
- PASS public dry-run validates lead capture mapping without writes (450ms)

## Guardrails
- Dry-run only; no product lead is inserted.
- No CRM lead is created or updated.
- No internal communication note is created.
- No Telegram, email, WhatsApp/WAPI, checkout, access grant, Zoom meeting, or external write is performed.
