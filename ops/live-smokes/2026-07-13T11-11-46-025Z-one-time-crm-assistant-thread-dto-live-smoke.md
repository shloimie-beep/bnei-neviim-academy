# One Time CRM Assistant Thread DTO Live Smoke - 2026-07-13T11:11:46.025Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: passed
Deployment: c2b6b88a-036a-4a33-93d9-3bd2f9de7719
Commit: 8ea2cd06e1920eecfd1ae97b937c22d701c00099

## Checks
- PASS operations login uses One Time Railway auth fallback (4038ms)
- PASS scoped One Time CRM list returns bounded cards without external writes (458ms)
- PASS selected contact Activity exposes assistant threads only when live assistant data exists (530ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, emails, phone numbers, assistant message bodies, support bodies, sends, or external writes are saved.
- The smoke records only aggregate counts, no-send flags, and whether selected-contact Activity exposes bna_assistant_threads as assistant_thread DTOs.
- Assistant thread rows are expected in Activity/timeline only and must not appear in selected-contact Conversations or Tasks.
- If production has no scoped One Time public assistant thread rows in the inspected set, the probe records a skip rather than creating synthetic data.
