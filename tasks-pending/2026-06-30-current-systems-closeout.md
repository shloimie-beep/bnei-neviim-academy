# Ramble Intake - 2026-06-30 - current systems closeout

## Raw intake

The operator asked Codex to finish the current BNA / One Time in-flight
operational systems closeout before returning to broad UI correction work. The
raw packet is preserved as `RAW-20260630-005`.

| Field | Value |
|---|---|
| Raw ID | RAW-20260630-005 |
| Source | codex_chat_attachment |
| Raw source | raw-input/RAW-20260630-005-current-systems-closeout-source.txt |
| Raw record | raw-input/RAW-20260630-005-current-systems-closeout.md |
| Content fingerprint | sha256:39b4eb10a15f733b179e8e42f6bb187ff31552aa11d7308ab5f8e84fe6b2110f |
| Parse status | implemented_with_external_blocker |
| Requirement register | tasks-pending/2026-06-30-current-systems-closeout.md |
| Closeout report | ops/system-audits/2026-06-30-current-systems-closeout.md |
| Execution run | ops/execution-runs/2026-06-30-current-systems-closeout |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Finish the current BNA / One Time in-flight operational systems closeout with evidence, verification, deployment/live-smoke proof, or precise blockers. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, execute in practical batches, and leave every requirement terminal. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | None locally. Only external Resend/send decisions remain. |

## Requirements

| ID | Status | Workspace/project | Result |
|---|---|---|---|
| REQ-20260630-201 | Done | bna / current_systems_closeout | Raw packet, register, report, execution run, ledger, changelog, and memory note recorded. |
| REQ-20260630-202 | Done | bna / production_release | Clean combined release branch merged as PR #56 and deployed to Railway production. |
| REQ-20260630-203 | Blocked | rabbi_sheller_provider / one_time_mishnah_class | First-party communications bridge, Email UX, CRM contacts, and no-send smokes passed; live Resend sender/webhook/send remains external. |
| REQ-20260630-204 | Done | bna / content_library | Content taxonomy/Torah/Class Notes filters repaired, deployed, and live-readback verified. |
| REQ-20260630-205 | Done | bna / class_drive_intake | Class upload/Drive intake audited; Issue #41 closed; job #78 live trace passed. |
| REQ-20260630-206 | Done | bna / telegram_ops | Telegram parser/runtime evidence reconciled; no unauthorized sends in this closeout. |
| REQ-20260630-207 | Done | bna / release_management | Primary dirty workspace avoided; PR #52 and PR #55 closed as superseded by PR #56. |
| REQ-20260630-208 | Done | bna / current_systems_closeout | Verification, deploy/live-smoke evidence, and exact blockers recorded. |

## Implementation and proof map

| ID | Files/routes/components | Verification | Commit/PR/deploy |
|---|---|---|---|
| REQ-20260630-201 | `raw-input/RAW-20260630-005-*`, this register, `ops/system-audits/2026-06-30-current-systems-closeout.md`, `ops/execution-runs/2026-06-30-current-systems-closeout/*` | Raw fingerprint recorded; JSON/JSONL validation in final closeout | Records PR #57 merged |
| REQ-20260630-202 | `server.js`, `public/operations.html`, Resend/content helpers/tests | PR #56 merged; Railway deployment `6257a4af-bb62-4fd4-b1b5-aff1ec057f40` reached `SUCCESS`; app smoke passed | PR #56, merge `98cfc4649e4bc52009a1aac9ee4616c1f5eeb272` |
| REQ-20260630-203 | Resend routes/helpers, Operations Email/CRM/communications UI/tests | Email/Resend UX smoke passed with `external_send_performed=false`; CRM contacts smoke returned 1591 leads and 112 communications; communications/security watchdogs passed | PR #56 deployed; external live Resend/send blocker remains |
| REQ-20260630-204 | `src/lib/bna/content-card-view-model.js`, `scripts/audit-content-card-topic-filter.cjs`, content tests | Content audit passed; live readback showed Torah 25, Class Notes 25, raw private markers false | PR #56 deployed and live-readback committed |
| REQ-20260630-205 | `scripts/smoke-class-upload-trace-live.mjs`, class/Drive evidence | Issue #41 closed; job #78 readback `transcribed` / `04 Parsed`; no transcript body in report | Current records branch adds live trace proof |
| REQ-20260630-206 | `scripts/telegram-kimi-bridge.mjs`, Telegram parser tests, ledger/changelog | Prior parser tests 13/13 and runtime healthy/running readback recorded | Existing deployed Telegram parser repair |
| REQ-20260630-207 | GitHub PR state and append-only records | PR #52 and PR #55 closed as superseded; PR #56 merged | Records PR #57 merged |
| REQ-20260630-208 | Register, report, execution run, ledger/changelog | Final validation commands recorded after file write | Records PR/merge for closeout docs |

## Decisions and blockers

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260630-201 | Complete Resend live sender/inbound webhook setup | Verified/approved sender env values, webhook secret, Resend `email.received` webhook subscription, and approved signed inbound replay | Shloimie / Resend account owner | Configure `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, and Resend `email.received` webhook to `https://bneineviimacademy.org/api/resend/inbound`, then approve a signed replay/readback | Keep no-send/no-inbound-readback mode | Live inbound/outbound cannot be marked complete, but no-send UX and first-party bridge remain deployed | Provide setup confirmation and approve signed inbound replay | REQ-20260630-203 | Blocked |
| EMAIL-SMOKE-20260630-201 | Run real email send smoke | Explicit safe recipient and confirmation that a test email may be sent | Shloimie | Provide one safe recipient and approve `npm run email:smoke` for a single test send | Keep no-send guardrail | Real send path remains unverified by design | Name recipient and approve exact send command | REQ-20260630-203 | Blocked |
| DEC-20260626-101 | Future raw/class/Drive/write backfills require exact approval | Exact production write scope, approval ID, and owner confirmation | Shloimie | Continue requiring exact approval for new production writes | Broad implicit approval | Prevents accidental transcript export, score/progress writes, Drive writes, sends, AI/paid transcription, or class fanout | Give exact approval for any future unsafe write | Future work only | Standing guardrail |

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260630-201 | Done | Raw/register/report/run files | Raw fingerprint and register paths recorded | none |
| REQ-20260630-202 | Done | PR #56 merged, Railway deployment `6257a4af-bb62-4fd4-b1b5-aff1ec057f40`, live app smoke | gh/Railway/app-smoke readback | none |
| REQ-20260630-203 | Blocked | Email/Resend and CRM no-send live smokes, communications/security watchdogs | No-send UI and scoped contact readbacks passed | Resend live sender/webhook and real test send require external approval |
| REQ-20260630-204 | Done | Content audit, content watchdog, live topic readback | Torah 25/Class Notes 25/raw private markers false | none |
| REQ-20260630-205 | Done | Issue #41 closed, Issue #18 read-only open, class upload trace smoke | Job #78 readback processed/transcribed; final Issue #41 apply recorded | future unsafe writes require exact approval |
| REQ-20260630-206 | Done | Telegram parser repair ledger/changelog | Prior parser tests/deploy/runtime readback recorded | none |
| REQ-20260630-207 | Done | PR #52/#55 superseded, PR #56 merged, clean records branch | git/gh readback | none |
| REQ-20260630-208 | Done | System audit, execution run, ledger/changelog | Final validation pass/fail recorded in closeout report | only external Resend/send blockers remain |
