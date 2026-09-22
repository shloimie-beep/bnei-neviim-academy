# One Time CRM Dead Letter DTO Live Smoke - 2026-07-13T09:51:50.226Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: skipped_no_live_dead_letters
Deployment: (not provided)
Commit: (not provided)

## Checks
- PASS operations login uses One Time Railway auth fallback (1984ms)
- PASS scoped One Time CRM list exposes canonical contacts without external writes (449ms)
- PASS selected contact Activity exposes dead-letter rows only when live dead-letter data exists (3566ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, recipients, message bodies, payload bodies, provider error text, sends, payments, access grants, or external writes are saved.
- The smoke records only aggregate counts, no-send flags, and whether selected-contact Activity exposes assistant_dead_letters rows.
- Dead-letter rows are expected in Activity/timeline only and must not appear in selected-contact Conversations.
- If production has no scoped One Time dead-letter rows, the probe records a skip rather than creating synthetic data.
