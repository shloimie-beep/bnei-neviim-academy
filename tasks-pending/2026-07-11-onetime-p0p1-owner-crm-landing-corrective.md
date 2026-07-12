# One Time P0/P1 Owner CRM Landing Corrective

Raw source: `raw-input/RAW-20260711-001-onetime-p0p1-owner-crm-landing-corrective.md`
Execution run: `ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective`
PQC packet: `tasks-pending/2026-07-11-onetime-p0p1-owner-crm-landing-corrective.product-quality.json`
Surface map: `ops/surface-maps/2026-07-11-onetime-p0p1-corrective-surface-map.md`
Packet folder: `ops/prompt-packets/2026-07-11-onetime-p0p1-corrective/`

## Source Head

- `origin/master`: `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`
- Corrective branch: `codex/onetime-p0p1-corrective-20260711`
- Clean corrective worktree: `C:\Users\User\BNA-onetime-p0p1-corrective-20260711`

## Register Rule

Prior One Time reports and requirement rows that claim Done are evidence inputs only. They do not prove current completion for this packet unless current canonical `/operations`, One Time owner-mode, first-party CRM, public landing/signup/onboarding, screenshot, deploy, and live-smoke proof is linked here or in the execution run. Direct `public/operations.html` proof does not prove canonical `/operations`.

## Requirements

| ID | Priority | Batch | Status | Requirement | Terminal Criteria |
| --- | --- | --- | --- | --- | --- |
| REQ-20260711-001 | P0 | wave-0-intake-run | Verified | Preserve the corrective packet as raw intake, create the canonical run, product-quality packet, control tower, surface map, and current-state audit. | `npm run bna:run:validate`, `npm run pqc:validate`, and linked artifacts pass. |
| REQ-20260711-002 | P0 | wave-0-false-done-reopen | Verified | Reopen false Done claims by treating prior evidence-only/source-mapping reports as non-terminal unless they prove current served routes. | Execution run and register explicitly name the reopened proof gap and no historical-source remap is generated. |
| REQ-20260711-003 | P0 | wave-1-operations-artifact | Needs operator decision | Make canonical `/operations` the source of browser proof and add generated Operations build/check commands. | Local build/check/canonical artifact proof passes; production deploy/live smoke waits for review approval. |
| REQ-20260711-004 | P0 | wave-2-owner-shell | Needs operator decision | Normal Rabbi Scheller owner mode uses the shared Operations shell with One Time branding, nav rails, responsive behavior, and scoped role data. | Local owner-shell smoke passes; production deploy/live smoke waits for review approval. |
| REQ-20260711-005 | P0 | wave-3-crm | Needs operator decision | Build the first-party One Time CRM workbench with canonical contact DTO, list/detail/timeline/mailbox/pipeline/actions, and no external sends/imports. | Local CRM smoke passes; production deploy/live smoke waits for review approval. |
| REQ-20260711-006 | P1 | wave-4-public-landing | Needs operator decision | Public landing/signup/onboarding must match approved hierarchy and content, use the approved Robot Scheller image in the bubble, and remove preview/TBD/stale CTA contracts. | Local public/onboarding smoke passes; production deploy/live smoke waits for review approval. |
| REQ-20260711-007 | P1 | wave-4-config-registries | Needs operator decision | Synchronize One Time site config, route registry, and action registry with actual public/CRM/owner actions. | Local registry/watchdog proof passes; production deploy/live smoke waits for review approval. |
| REQ-20260711-008 | P1 | wave-5-verification | Needs operator decision | Capture focused tests, browser screenshots, accessibility/readability evidence, no BNA leakage proof, and watchdog/protocol drift closeout. | Local smokes/tests pass with evidence paths; terminal verification waits for review-approved deploy/live smoke. |
| REQ-20260711-009 | P1 | wave-6-pr-deploy | Needs operator decision | Keep the existing corrective PR #129 as the only delivery lane and deploy only through the approved review pipeline. | PR #129 is opened and reviewed; production deploy/live smoke is performed only after review approval or remains blocked with exact next action. |

## Decisions And Blockers

- DEC-20260711-001: No email, WhatsApp, Telegram, campaign, charge, access grant, historical import, DNS, or external-provider mutation is authorized in this corrective implementation.
- DEC-20260711-002: The latest downloaded Robot Scheller file was found at `C:\Users\User\Downloads\ChatGPT Image Jul 10, 2026, 06_43_03 PM.png` and should be imported without destructive upper-body cropping.
- DEC-20260711-003: Final deployment is blocked until the approved review path authorizes production release, even if local code and PR are complete.

## Local Verification Summary

- `npm run operations:build`, `npm run operations:check-generated`, and `npm run operations:check-canonical` passed.
- Focused One Time/CRM/owner tests passed: `42` tests.
- Public landing/onboarding smoke passed and captured Robot Scheller in the mobile bubble.
- Operations owner-shell smoke, CRM workbench smoke, and provider CRM layout smoke passed.
- `npm run watchdog:actions`, `npm run watchdog:protocol-drift`, `npm run pqc:validate`, and `npm run bna:run:validate` passed.

## Remaining Release Gate

Review draft PR #129, keep the evidence current, and deploy only after explicit review approval. Production live smoke/readback remains required before app-visible requirements can become Done.
