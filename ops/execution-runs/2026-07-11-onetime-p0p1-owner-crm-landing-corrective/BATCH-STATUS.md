# Batch Status

| Batch | Status | Notes |
| --- | --- | --- |
| wave-0-intake-run | verified | Raw/run/register/PQC/control/audit/surface-map created and validators passed. |
| wave-0-false-done-reopen | verified | Register keeps prior Done labels non-terminal without current canonical proof. |
| wave-1-operations-artifact | needs_operator_decision | Local build/check/canonical artifact gate passes; deploy/live proof waits for review approval. |
| wave-2-owner-shell | needs_operator_decision | Generated IA-driven owner shell is locally verified; deploy/live proof waits for review approval. |
| wave-3-crm | needs_operator_decision | First-party CRM workbench and safe local update path are locally verified; deploy/live proof waits for review approval. |
| wave-4-public-landing | needs_operator_decision | Landing/onboarding/Robot/no-send flow is locally verified; deploy/live proof waits for review approval. |
| wave-5-verification | needs_operator_decision | Focused tests, smokes, screenshots, PQC/run validators, action watchdog, and protocol drift watchdog passed locally; terminal verification waits for review-approved deploy/live smoke. |
| wave-6-pr-deploy | needs_operator_decision | Branch pushed and draft PR opened; production deploy/live smoke needs review approval. |
