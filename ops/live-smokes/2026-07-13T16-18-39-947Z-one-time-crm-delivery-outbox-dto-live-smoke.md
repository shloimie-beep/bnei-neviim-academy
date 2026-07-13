# One Time CRM Delivery Outbox DTO Live Smoke - 2026-07-13T16:18:39.947Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: passed
Deployment: (not provided)
Commit: (not provided)

## Checks
- PASS operations login uses One Time Railway auth fallback (2446ms)
- PASS scoped One Time CRM list exposes canonical contacts without external writes (473ms)
- PASS selected contact Activity exposes delivery outbox rows only when live outbox data exists (1065ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, recipients, message bodies, payload bodies, sends, payments, access grants, or external writes are saved.
- The smoke records only aggregate counts, no-send flags, and whether selected-contact Activity exposes assistant_delivery_outbox rows.
- Delivery outbox rows are expected in Activity/timeline only and must not appear in selected-contact Conversations.
- If production has no scoped One Time outbox rows, the probe records a skip rather than creating synthetic data.
