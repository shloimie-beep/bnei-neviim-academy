# One Time CRM Email Thread DTO Live Smoke - 2026-07-13T09:00:20.963Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: passed
Deployment: 99ea47d8-a5a1-4403-b435-a732b7df21d1
Commit: e0dd3d48543740efb32b35f64ad27cf0cc6e676b

## Checks
- PASS operations login uses One Time Railway auth fallback (1986ms)
- PASS scoped One Time CRM cards expose mailbox activity candidates (470ms)
- PASS selected contact conversations DTO includes scoped email thread when live mailbox data exists (245ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, subjects, bodies, message IDs, sends, payments, access grants, or external writes are saved.
- The smoke records only counts, channel/open-action flags, no-send flags, and whether a matching email DTO was found.
- If production has no scoped One Time cards with mailbox activity, the probe records a skip rather than creating data.
