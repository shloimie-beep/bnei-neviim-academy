# Batch Status

| Batch | Requirement IDs | Status | Next action |
| --- | --- | --- | --- |
| intake-run | REQ-20260712-001 | Verified | Validate run and continue to delivery truth. |
| delivery-truth-ci | REQ-20260712-002 | Needs operator decision | Delivery truth and local gate passed; GitHub rejected pushing the workflow file because the OAuth token lacks `workflow` scope. |
| canonical-operations-proof | REQ-20260712-003 | Verified | Canonical smoke now uses real bootstrap/generated assets and rejects raw `operations.html` proof. |
| rabbi-provider-login | REQ-20260712-004 | Verified | Normal One Time provider login/session now lands in canonical Operations and aliases redirect away from the old dashboard. |
| signup-intake-addendum | REQ-20260712-012 | Verified | Signup/reminder addendum captured and made current P0 batch. |
| direct-signup-page | REQ-20260712-013 | Needs operator decision | Local route/form/CTA/visual proof complete; deploy/live smoke and operator personal test require release authorization. |
| city-timezone-consent | REQ-20260712-014 | Needs operator decision | Local city/timezone/DST conversion helper and form metadata complete; deploy/live readback requires release authorization. |
| crm-confirmation-outbox | REQ-20260712-015 | In progress | Local CRM/dedupe/consent/outbox enqueue path implemented; live DB/provider readback remains. |
| confirmation-email | REQ-20260712-016 | In progress | Local confirmation email template/outbox contract implemented; hosted Resend delivery/retry proof remains. |
| reminder-dispatcher | REQ-20260712-017 | In progress | Protected reminder enqueue endpoint and idempotency implemented; hosted cron/delivery proof remains. |
| whatsapp-gates | REQ-20260712-018 | In progress | Local WhatsApp consent/readiness/suppression gates implemented; live Whapi readiness and STOP proof remain. |
| rabbi-telegram-alert | REQ-20260712-019 | In progress | Scoped Rabbi Telegram outbox payload implemented; hosted worker/live single-alert smoke remains. |
| no-portal-negative-tests | REQ-20260712-020 | Needs operator decision | Local negative tests pass; deployed replay/no-side-effect proof requires release authorization. |
| local-class-preview-gate | REQ-20260712-021 | Needs operator decision | Admin preview route and exact-three blocker implemented; live scoped count readback requires release authorization. |
| signup-test-matrix | REQ-20260712-023 | In progress | Local tests/watchdogs/screenshot evidence pass; deployment/readiness/operator evidence remains. |
| readiness-deploy-operator-test | REQ-20260712-022 | Needs operator decision | Wait for deploy authorization and operator personal test submission. |
| first-party-crm | REQ-20260712-005 | Blocked | Local DTO/API/UI/tests/responsive smoke pass; provide `BNA_ONETIME_CRM_TEST_DATABASE_URL` and rerun `npm run one-time:smoke:crm-journey-local-db` for required real persistence proof. |
| onboarding-linkage | REQ-20260712-006 | Not started | Complete quick signup and Family/School continuation linkage. |
| landing-robot-config | REQ-20260712-007 | Not started | Complete public landing, Robot, and config. |
| ramble-to-done-service | REQ-20260712-008 | Needs operator decision | Canonical service/API/dropoff receipts, shared packet status, worker-health truth, worker-offline UI copy, `codex_done` migration, and duplicate #1945 packet correction pass locally; terminal Done needs release/live proof. |
| regression-suite | REQ-20260712-009 | Needs operator decision | Dedicated ramble-regression suite and combined ingestion/dropoff/intake/watchdog run pass locally; terminal Done needs release/live proof because server-visible protocol behavior changed. |
| screenshots-matrix-pr | REQ-20260712-010 | Not started | Capture screenshots and matrix after implementation. |
| release-live-smoke | REQ-20260712-011 | Needs operator decision | Wait for explicit release authorization. |
