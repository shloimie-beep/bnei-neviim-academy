# One Time CRM Email Thread DTO Live Smoke - 2026-07-13T08:38:11.769Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: passed
Deployment: 4002d6ca-6a1c-483b-bd56-65906d60020e
Commit: 298751d8d940c02ce4c8a9c70c5b36862ea67766

## Checks
- PASS operations login uses One Time Railway auth fallback (4297ms)
- PASS scoped One Time CRM cards expose mailbox activity candidates (429ms)
- PASS selected contact conversations DTO includes scoped email thread when live mailbox data exists (243ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, subjects, bodies, message IDs, sends, payments, access grants, or external writes are saved.
- The smoke records only counts, channel/open-action flags, no-send flags, and whether a matching email DTO was found.
- If production has no scoped One Time cards with mailbox activity, the probe records a skip rather than creating data.
