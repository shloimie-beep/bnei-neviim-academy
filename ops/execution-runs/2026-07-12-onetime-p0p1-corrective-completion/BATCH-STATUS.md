# Batch Status

| Batch | Requirement IDs | Status | Next action |
| --- | --- | --- | --- |
| intake-run | REQ-20260712-001 | Verified | None. |
| delivery-truth-ci | REQ-20260712-002 | Needs operator decision | Add/push the CI workflow with a GitHub credential that has `workflow` scope. |
| canonical-operations-proof | REQ-20260712-003 | Verified | None. |
| rabbi-provider-login | REQ-20260712-004 | Verified | None. |
| first-party-crm | REQ-20260712-005 | Verified | None. |
| onboarding-linkage | REQ-20260712-006 | Verified | None. |
| landing-robot-config | REQ-20260712-007 | Needs verification | Complete the remaining non-landing live screenshot/matrix evidence. |
| ramble-to-done-service | REQ-20260712-008 | Needs operator decision | Decide whether to run a scoped production intake/dropoff write-smoke packet. |
| regression-suite | REQ-20260712-009 | Needs operator decision | Same production write-smoke decision as REQ-008. |
| screenshots-matrix-pr | REQ-20260712-010 | In progress | Capture the remaining live screenshots and source-to-proof matrix rows. |
| release-live-smoke | REQ-20260712-011 | Needs verification | Release/live proof is complete; close after the final-matrix dependency is closed. |
| signup-intake-addendum | REQ-20260712-012 | Verified | None. |
| direct-signup-page | REQ-20260712-013 | Verified | None. |
| city-timezone-consent | REQ-20260712-014 | Verified | None. |
| crm-confirmation-outbox | REQ-20260712-015 | In progress | Complete real DB/provider readback where safe and authorized. |
| confirmation-email | REQ-20260712-016 | Verified scoped live send | July 12 proof sent 3 scoped Resend class-reminder emails; broader retry/bounce proof remains separate. |
| reminder-dispatcher | REQ-20260712-017 | Verified scoped live dispatch | July 12 proof dispatched 5 due jobs and replay sent 0 duplicates; unattended recurring scheduler observation remains separate. |
| whatsapp-gates | REQ-20260712-018 | Verified scoped live send | July 12 proof sent 2 scoped One Time WAPI class-reminder WhatsApps; STOP/wrong-number proof remains separate. |
| rabbi-telegram-alert | REQ-20260712-019 | In progress | Hosted worker/live single-alert smoke remains; do not send without exact approval. |
| no-portal-negative-tests | REQ-20260712-020 | Needs operator decision | Terminal proof depends on real persistence/operator-test evidence. |
| local-class-preview-gate | REQ-20260712-021 | Needs operator decision | Terminal proof depends on real persistence/operator-test evidence. |
| readiness-deploy-operator-test | REQ-20260712-022 | Verified scoped live email/WAPI | Scoped 3-email/2-WhatsApp dispatch is complete; Telegram, unattended recurring scheduler observation, GitHub workflow scope, and OPS password rotation remain. |
| signup-test-matrix | REQ-20260712-023 | In progress | Extend the matrix beyond the signup/reminder slice. |
