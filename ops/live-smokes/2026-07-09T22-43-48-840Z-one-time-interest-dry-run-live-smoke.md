# OneTime Interest Dry-Run Live Smoke - 2026-07-09T22:43:48.840Z

Base URL: https://join.onetimeonetime.com
Result: passed

## Checks
- PASS public OneTime landing form points to interest endpoint (745ms)
- PASS public dry-run validates lead capture mapping without writes (458ms)

## Guardrails
- Dry-run only; no product lead is inserted.
- No CRM lead is created or updated.
- No internal communication note is created.
- No Telegram, email, WhatsApp/WAPI, checkout, access grant, Zoom meeting, or external write is performed.
