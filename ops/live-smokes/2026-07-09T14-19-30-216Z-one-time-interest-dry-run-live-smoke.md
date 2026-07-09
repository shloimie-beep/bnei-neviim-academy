# OneTime Interest Dry-Run Live Smoke - 2026-07-09T14:19:30.216Z

Base URL: https://join.onetimeonetime.com
Result: passed

## Checks
- PASS public OneTime landing form points to interest endpoint (592ms)
- PASS public dry-run validates lead capture mapping without writes (443ms)

## Guardrails
- Dry-run only; no product lead is inserted.
- No CRM lead is created or updated.
- No internal communication note is created.
- No Telegram, email, WhatsApp/WAPI, checkout, access grant, Zoom meeting, or external write is performed.
