# One Time CRM Email Thread DTO Live Smoke - 2026-07-13T08:54:43.751Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: passed
Deployment: (not provided)
Commit: (not provided)

## Checks
- PASS operations login uses One Time Railway auth fallback (5411ms)
- PASS scoped One Time CRM cards expose mailbox activity candidates (1008ms)
- PASS selected contact conversations DTO includes scoped email thread when live mailbox data exists (362ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, subjects, bodies, message IDs, sends, payments, access grants, or external writes are saved.
- The smoke records only counts, channel/open-action flags, no-send flags, and whether a matching email DTO was found.
- If production has no scoped One Time cards with mailbox activity, the probe records a skip rather than creating data.
