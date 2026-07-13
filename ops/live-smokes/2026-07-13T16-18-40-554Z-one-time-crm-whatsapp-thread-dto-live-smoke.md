# One Time CRM WhatsApp Thread DTO Live Smoke - 2026-07-13T16:18:40.554Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: passed
Deployment: (not provided)
Commit: (not provided)

## Checks
- PASS operations login uses One Time Railway auth fallback (2523ms)
- PASS scoped One Time CRM cards expose phone candidates without external writes (464ms)
- PASS selected contact conversations DTO includes scoped WhatsApp thread when live WhatsApp data exists (249ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, phone numbers, addresses, message bodies, message IDs, sends, payments, access grants, or external writes are saved.
- The smoke records only aggregate counts, channel flags, no-send flags, and whether an existing WhatsApp DTO was found.
- If production has no scoped One Time WhatsApp thread rows, the probe records a skip rather than creating synthetic data or sending a message.
