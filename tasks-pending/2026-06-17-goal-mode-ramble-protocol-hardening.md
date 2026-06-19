# Ramble Intake - 2026-06-17 - goal-mode-ramble-protocol-hardening

This file is the source-of-truth register for `RAW-20260617-001`, the request
to make future GPT/ChatGPT correction outputs trigger Codex goal-mode execution
and to continue working the full correction register until terminal statuses.

## Raw intake

- RAW-20260617-001 (codex_chat, 2026-06-17): full raw wording preserved at
  `raw-input/RAW-20260617-001-goal-mode-ramble-protocol.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260617-001 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-17-goal-mode-ramble-protocol-hardening.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Harden the BNA ramble protocol so future ChatGPT correction outputs trigger durable goal-mode execution, then work through the full pending website correction register until every item is completed, deployed/live-smoked or explicitly blocked with proof. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260616-061, REQ-20260616-062, and REQ-20260616-065 through REQ-20260616-069, excluding closed or blocked items, prioritizing provider/public flow, display audit, calendar/classroom, integration key storage/rotation, helper-controlled workflows, explanatory Operations copy, and ledger/changelog closeout gaps. |

## Parsed requirements

| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|
| REQ-20260617-001 | Set an active Codex goal for the full protocol-hardening and correction-register execution work | "I'm going to let go mode go set it as a goal" | Codex creates/continues an active goal and does not mark it complete until the full register reaches terminal statuses. | Codex goal lifecycle | Goal tool result plus this register. | Done |
| REQ-20260617-002 | Harden AGENTS.md so GPT correction outputs trigger goal-mode execution | "adjust whatever agents file ... so when I ramble again into ... GPT it picks up my natural language" | AGENTS.md names trigger phrases, create/continue-goal behavior, register-first then execution behavior, terminal statuses, and deploy/live-smoke proof rules. | Agent protocol | Focused ramble protocol tests. | Done |
| REQ-20260617-003 | Add a GPT output contract that Codex can execute directly | "adjust it in the files that GPT will read so he knows how to create an output that you will just work through" | A reusable `BNA_GOAL_MODE_EXECUTION_PACKET` template exists and defines raw source, requirements, batches, blockers, and closeout rules. | Prompt/output contract | Focused ramble protocol tests and watchdog audit. | Done |
| REQ-20260617-004 | Add parser metadata for goal-mode correction packets | "whatever output he puts out that I'm going to give to you it should make you ... go into goal setting mode" | Canonical intake parser detects goal-mode/GPT correction language and emits goal-mode execution metadata, terminal statuses, and create/continue-goal directive. | Intake parser | Focused intake parser tests. | Done |
| REQ-20260617-005 | Teach Telegram/hosted assistant prompts to produce goal-mode execution packets | "Chat GPT will pick up my natural language" | Telegram bridge/system prompts mention `BNA_GOAL_MODE_EXECUTION_PACKET`, and Codex queue trigger recognizes goal-mode/whole-prompt execution language. | Telegram / hosted assistant | Syntax check and focused ramble/Telegram tests. | Done |
| REQ-20260617-006 | Continue implementing the full 2026-06-16 correction register until done | "I want you to actually work through this entire output ... his whole prompt that he made for you" | Work continues through `tasks-pending/2026-06-16-website-ramble-correction-audit.md` until each requirement has a terminal status with proof or blocker. | Full correction register | Ongoing batch verification, final audits, deploy/live smokes, watchdog reports. | Pending |

## Parsed tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-001 | Harden goal-mode ramble protocol and GPT output contract | Codex | Agent lifecycle | "first adjust the protocol" | Protocol docs, parser, bridge, tests, watchdog, memory, ledger, changelog, deploy, and live smoke are updated and verified. | Done deployed |
| TASK-20260617-002 | Work through the pending website correction register | Codex | Agent lifecycle | "continue doing everything till it's done" | Every pending `REQ-20260616-*` item reaches a terminal status with evidence, deploy/live smoke, or blocker. | Running |

## Decisions

| ID | Decision | Impact | Where stored | Status |
|---|---|---|---|---|
| DEC-20260617-001 | Goal-mode correction packets are execution instructions when Shloimie asks to finish/build/work through the whole output | Prevents future broad correction prompts from stopping at planning or registration. | AGENTS.md; MEMORY.md; parser metadata; Telegram bridge | Registered |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260617-001 | Which production deploy window should carry the current local parent/helper/protocol bundle? | App-visible items cannot be production-Done until deployed and live-smoked. | No | Resolved: deployed to Railway production `ff95e44f-f1f5-4eeb-a83d-fc8f9456674b` and live-smoked. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260617-001 | Goal-mode / build-everything language from Shloimie means Codex should create/continue a goal, register the ramble, then execute all requirements to terminal statuses with proof. | Yes | Stable cross-channel operating rule |

## Implementation map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|
| REQ-20260617-001 | Goal tool; tasks-pending/2026-06-17-goal-mode-ramble-protocol-hardening.md | Create active goal and record objective/status. | Goal tool result; register. |
| REQ-20260617-002 | AGENTS.md; raw-input/README.md; tasks-pending/_template-ramble-intake.md | Add goal-mode trigger rules and intake fields. | Focused ramble tests. |
| REQ-20260617-003 | tasks-pending/_template-goal-mode-correction-output.md | Add GPT/Codex executable output contract. | Focused ramble tests; watchdog. |
| REQ-20260617-004 | src/lib/bna/ramble-protocol.js; src/lib/bna/intake-parser.js; server.js; tests/intake-parser.test.js | Detect goal-mode/GPT correction packet language, merge deterministic metadata over stale AI protocol output, and emit execution metadata. | Syntax checks; focused parser tests; production goal-mode/helper live smoke. |
| REQ-20260617-005 | scripts/telegram-kimi-bridge.mjs; tests/ramble-protocol-hardening.test.js; tests/telegram-ramble-routing-regression.test.js | Teach hosted assistant/Telegram bridge to name the execution packet and route whole-output work to Codex. | Syntax checks; focused Telegram tests; production deployment. |
| REQ-20260617-006 | tasks-pending/2026-06-16-website-ramble-correction-audit.md; tasks-pending/2026-06-17-website-ramble-correction-audit.md | Continue implementing pending correction requirements in batches. | Ongoing. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-001 | Done | Active goal was created for protocol hardening plus full correction-register execution. | tasks-pending/2026-06-17-goal-mode-ramble-protocol-hardening.md | Goal tool result in Codex thread. | Goal remains active until full correction register is terminal. |
| REQ-20260617-002 | Done | AGENTS.md now has a Goal-Mode Ramble Execution Trigger section with trigger phrases, goal behavior, register-first execution, terminal statuses, and deploy/live-smoke rules. | AGENTS.md; raw-input/README.md; tasks-pending/_template-ramble-intake.md | Focused ramble tests; `npm test` 669/669; Railway production `ff95e44f-f1f5-4eeb-a83d-fc8f9456674b`; live app and goal-mode/helper smokes passed. | None for protocol trigger. |
| REQ-20260617-003 | Done | Added `BNA_GOAL_MODE_EXECUTION_PACKET` output contract template. | tasks-pending/_template-goal-mode-correction-output.md | Focused ramble tests; `npm run prompts:audit`; watchdog audit; deployed in Railway `ff95e44f-f1f5-4eeb-a83d-fc8f9456674b`. | Future GPT outputs must use this shape. |
| REQ-20260617-004 | Done | Parser emits `goal_mode_execution_requested`, `gpt_correction_packet_detected`, `should_create_or_continue_goal`, terminal statuses, and contract path; AI-provided stale `ramble_protocol` can no longer suppress deterministic goal-mode metadata. | src/lib/bna/ramble-protocol.js; src/lib/bna/intake-parser.js; tests/intake-parser.test.js; server.js | Syntax checks; focused parser tests; `npm test` 669/669; live goal-mode parser smoke passed: `ops/live-smokes/2026-06-17T04-53-04-502Z-goal-mode-helper-live-smoke.md`. | None for runtime parser path. |
| REQ-20260617-005 | Done | Telegram bridge prompts and Codex queue trigger recognize goal-mode/whole-output work and mention the execution packet. | scripts/telegram-kimi-bridge.mjs; tests/ramble-protocol-hardening.test.js; tests/telegram-ramble-routing-regression.test.js | Syntax checks; focused Telegram/ramble tests; `npm test` 669/669; deployed in Railway `ff95e44f-f1f5-4eeb-a83d-fc8f9456674b`. | Telegram runtime should be watched on the next real operator packet. |
| REQ-20260617-006 | Pending | Full 2026-06-16 correction register remains active; 60 done, 1 blocked, and 9 pending after the protocol/raw-intake deploy proof, parent child-login closeout, full portal security audit, Operations Activity/Queue Health UI batch, BNA Helper duplicate/branding/action-planning batch, workspace taxonomy/list/selector/role batch, public/portal navigation-positioning batch, Rabbi/OneTime landing/pricing-placeholder batch, safe OpenAI keyholder/Kimi fallback batch, Operations settings/dashboard/integrations/automations batch, provider classroom/settings batch, content/research scope batch, and communications screening/imports batch. | tasks-pending/2026-06-16-website-ramble-correction-audit.md; tasks-pending/2026-06-17-website-ramble-correction-audit.md; ops/system-audits/2026-06-17-communications-screening-imports-audit.md; ops/playwright-smokes/2026-06-17-communications-screening-local/report.md; ops/live-smokes/2026-06-17T10-46-34-893Z-communications-screening-live-smoke.md; ops/live-smokes/2026-06-17T10-45-20-615Z-live-app-smoke.md; ops/live-smokes/2026-06-17T10-46-28-607Z-public-route-privacy-smoke.md | Ongoing; latest communications screening/imports batch deployed to Railway `3991f132-9207-4386-a9fd-b6148db5944f`, Railway doctor reported `SUCCESS`, full `npm test` passed 696/696, local browser proof covered overview/import/email/WhatsApp desktop/mobile with no horizontal overflow, live app/privacy/communications smokes passed, and the audit file records no-send/no-external-write boundaries. `REQ-20260616-030` remains blocked on provider credentials/payment links after placeholders were implemented. | Must continue implementing, deploying/live-smoking, or blocking each pending requirement. Production OpenAI key rotation remains approval-gated; Kimi-primary mode remains valid until explicit approval. |

Allowed statuses:

- Raw
- Parsed
- Registered
- Pending
- Done
- Already satisfied
- Blocked
- Failed
- Needs operator decision
- Archived
