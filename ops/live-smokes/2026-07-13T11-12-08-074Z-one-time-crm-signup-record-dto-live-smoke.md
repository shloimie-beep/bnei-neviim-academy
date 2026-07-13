# One Time CRM Signup Record DTO Live Smoke - 2026-07-13T11:12:08.074Z

Base URL: https://join.onetimeonetime.com
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Result: skipped_no_live_signup_records
Deployment: (not provided)
Commit: 8ea2cd06e1920eecfd1ae97b937c22d701c00099

## Checks
- PASS operations login uses One Time Railway auth fallback (4533ms)
- PASS scoped One Time CRM list returns bounded cards without external writes (431ms)
- PASS selected contact Activity exposes direct signup rows only when live signup data exists (6152ms)

## Guardrails
- Read-only live smoke; no contact IDs, names, emails, phone numbers, addresses, message bodies, payment links, checkout sessions, sends, payments, access grants, or external writes are saved.
- The smoke records only aggregate counts, no-send flags, and whether selected-contact Activity exposes direct signups rows as signup_record DTOs.
- Direct signups rows are expected in Activity/timeline only and must not appear in selected-contact Conversations.
- If production has no scoped One Time direct signup records in the inspected set, the probe records a skip rather than creating synthetic data.
