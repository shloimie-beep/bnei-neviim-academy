# One Time CRM Signup Context DTO Live Smoke - 2026-07-13T10:53:15.856Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: passed
Deployment: (not provided)
Commit: (not provided)

## Checks
- PASS operations login uses One Time Railway auth fallback (5445ms)
- PASS scoped One Time CRM list exposes signup-context candidates without external writes (1812ms)
- PASS selected contact Activity exposes signup-context rows only when live product-lead data exists (621ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, addresses, message bodies, payment links, checkout sessions, sends, payments, access grants, or external writes are saved.
- The smoke records only aggregate counts, no-send flags, and whether selected-contact Activity exposes bna_product_leads signup_context rows.
- Product lead signup_context rows are expected in Activity/timeline only and must not appear in selected-contact Conversations.
- If production has no scoped One Time signup-context candidates, the probe records a skip rather than creating synthetic data.
