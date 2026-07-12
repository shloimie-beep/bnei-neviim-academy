# Batch Status

| Batch | Requirement IDs | Status | Notes |
|---|---|---|---|
| delta-00 | REQ-20260712-801 | done | Intake/run/register created; raw source and baseline recorded; run validation passed. |
| delta-B1-B3 | REQ-20260712-803 | done | Runner, Railway config, package command, env example, and focused tests are locally verified. |
| delta-B4 | REQ-20260712-804 | done | Separate Railway cron service deployed, two redacted zero-due executions proved, no class-reminders logs in the verification window, old dispatcher automation paused. |
| delta-A | REQ-20260712-802 | done | Local hardening verified, deployed to One Time Railway deployment `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8`, and SHA-pinned live smoke passed. |
| delta-C0 | REQ-20260712-805 | done | Canonical CRM Contacts/Inbox spec, focused surface map, and OT-CRM gap matrix created; JSON/tests/PQC validation passed. |
| delta-C1-C9 | REQ-20260712-806 | blocked | Safe C3/C8 slice implemented and locally/browser verified; isolated DB mutation/reload proof is blocked until `BNA_ONETIME_CRM_TEST_DATABASE_URL` points at a local/test Postgres database. |
| delta-closeout | REQ-20260712-807 | not_started | Final all-work commit/push/deploy/live-smoke closeout; current runner artifact closeout is in progress. |
