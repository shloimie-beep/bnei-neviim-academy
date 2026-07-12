# Telegram Sidekick Super Package - Lane 01

## Raw intake

Source: `RAW-20260712-005`.

Packet path:
`ops/chatgpt-ramble-dropoff/incoming/telegram-sidekick-super-package-20260712/`

Operator instruction: unpack the ZIP, confirm the packet folder, read
`CODEX_PROMPT.md`, run drop-off validation/control tower, queue the packet for
implementation, and start with Lane 01 only. No deploy, live messages,
production migrations, or external actions are authorized.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260712-005 |
| Source | codex_chat + ChatGPT dropoff packet |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-12-telegram-sidekick-super-package-lane-01.md |
| Dropoff task | #2266 |
| Active goal | Process `telegram-sidekick-super-package-20260712` and implement only Lane 01 security, identity, and fail-closed runtime work through verified local evidence |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes, packet is titled Codex Goal-Mode Pickup and operator asked to start implementation |
| Active goal objective | Process the Telegram sidekick package and implement Lane 01 only with no external actions |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work Lane 01 requirements to terminal statuses or blockers. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes, but not authorized in this pass; record blocker instead |
| Next requirement IDs to work | REQ-20260712-202 through REQ-20260712-206 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260712-201 | Ingest and queue the Telegram sidekick packet. | RAW-20260712-005 | platform / assistant_control_plane | Codex | dropoff-intake | P0 | Lane 00 | none | Packet folder exists, `CODEX_PROMPT.md` read, scan/tower/apply run, task ID recorded. | `ops/chatgpt-ramble-dropoff/incoming/telegram-sidekick-super-package-20260712/status.json`, `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md` | no | Done |
| REQ-20260712-202 | Make Telegram private identity and scope server-derived and fail closed. | RAW-20260712-005 | platform + rabbi_sheller_provider / one_time_mishnah_class | Codex | security-identity | P0 | Lane 01 | REQ-20260712-201 | Verified Shloimie resolves super-admin/all; verified Rabbi resolves immutable One Time scope; unknown, group, wrong bot, revoked, and request/body role override are denied before planner or query. | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | no deploy authorized | Done |
| REQ-20260712-203 | Add nonempty allowlist/config validation and expected worker identity readiness. | RAW-20260712-005 | platform + One Time worker profiles | Codex | runtime-readiness | P0 | Lane 01 | REQ-20260712-202 | Academy and Rabbi worker startup/readiness fails closed when required identity, allowlist, signing nonce, or expected bot identity config is missing. | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | no deploy authorized | Done |
| REQ-20260712-204 | Disable legacy unsigned Telegram/webhook and high-risk direct command bypasses. | RAW-20260712-005 | platform assistant control plane | Codex | security-hardening | P0 | Lane 01 | REQ-20260712-202 | Unsigned `/api/bna/telegram` or equivalent legacy path cannot execute; raw Codex CLI, shell, deploy, migration, Zoom, connector side-effect commands are unavailable from Telegram/private assistants. | `server.js`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | no deploy authorized | Done |
| REQ-20260712-205 | Add redacted logging plus Telegram bridge heartbeat/readiness records. | RAW-20260712-005 | platform + One Time worker profiles | Codex | observability | P1 | Lane 01 | REQ-20260712-202 | Logs/errors avoid raw chat IDs, user IDs, message text, prompts, credentials, and secrets; `telegram-shloimie-bridge` and `telegram-rabbi-onetime-bridge` heartbeat/readiness can be read in local tests without external sends. | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `server.js`, `tests/telegram-runtime-status.test.js` | no deploy authorized | Done |
| REQ-20260712-206 | Verify Lane 01 locally and hand back next-lane ownership without claiming full sidekick completion. | RAW-20260712-005 | platform assistant control plane | Codex | verification | P0 | Lane 01 | REQ-20260712-202, REQ-20260712-203, REQ-20260712-204, REQ-20260712-205 | Focused identity, scope, webhook, high-risk command, redaction, and heartbeat tests pass or exact blockers are recorded; register, packet status, ledger, and changelog are updated. | `tasks-pending/2026-07-12-telegram-sidekick-super-package-lane-01.md`, packet `status.json`, `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md` | production proof blocked by DEC-20260712-201 | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260712-201 | telegram-sidekick-lane-01 | Implement local Lane 01 security and identity foundation for Telegram sidekick V2. | Codex | platform / assistant_control_plane | RAW-20260712-005 | REQ-20260712-202 through REQ-20260712-206 | Hand back to Lane 02/shared orchestrator after operator approval for any production rollout or live smoke. | Agent work | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260712-201 | Production rollout and live smoke approval. | Whether to deploy/restart workers, apply production migrations, bind real Telegram users, or send live smoke messages. | Shloimie | Keep this pass local and no-send; request explicit approval later with a concrete smoke plan. | Deploy or live-smoke now. | Without approval, local Lane 01 can be verified but production-visible Done remains blocked. | Approve a specific deploy/live-smoke/migration plan later if desired. | REQ-20260712-206 production proof only | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260712-201 | Which real Telegram bot/user bindings should be activated in production? | Lane 01 can add fail-closed local contracts, but binding real users and worker identities is a production/operator action. | No for local implementation; yes for production proof | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260712-201 | Telegram Super Sidekick V2 must be implemented as a shared assistant control-plane adapter, not a regex/snapshot Telegram-only assistant. | Already broadly covered in MEMORY.md and docs/architecture/telegram-control-plane.md | Existing durable memory already says Telegram and website assistants are adapters over one canonical control plane. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260712-202 | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | Added fixed private sidekick profiles, bridge profile identity binding, immutable Rabbi One Time scope, allowlist normalization, expected bot identity checks, and startup policy assertions. | PASS focused local tests. | Not staged | Not pushed | Not authorized |
| REQ-20260712-203 | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `server.js`, `tests/telegram-runtime-status.test.js` | Added fail-closed startup/readiness checks for missing private chat allowlists, missing bot identity, wrong expected bot identity, and missing Rabbi scoped Operations credentials; status readback now uses `telegram-shloimie-bridge` with legacy fallback. | PASS focused local tests and watchdog. | Not staged | Not pushed | Not authorized |
| REQ-20260712-204 | `server.js`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | Disabled the legacy unsigned `/api/bna/telegram` route with HTTP 410, blocked direct Telegram Zoom link mutation/send paths, removed raw Zoom URL echo, disabled raw Codex CLI execution from Telegram, and removed CLI fallback for hosted-chat failures. | PASS focused local tests and watchdog. | Not staged | Not pushed | Not authorized |
| REQ-20260712-205 | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `server.js`, `tests/telegram-runtime-status.test.js` | Runtime lock/heartbeat reports identity profile and allowlist count instead of raw IDs; startup/status logs mask chat/message IDs and preserve bridge readiness keys for Shloimie and Rabbi profiles. | PASS focused local tests and watchdog. | Not staged | Not pushed | Not authorized |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260712-201 | Done | `npm run chatgpt:dropoff:scan`, `npm run chatgpt:dropoff:apply`, `npm run chatgpt:dropoff:tower`; task `#2266` | packet status, control tower, pickup reports | scan had zero findings; apply queued one packet | Dirty worktree existed before pickup and remains a collision warning |
| REQ-20260712-202 | Done | Fixed profiles and fail-closed identity helpers added; tests cover Shloimie all-scope, Rabbi immutable One Time scope, missing allowlist, missing Rabbi ops credentials, and expected bot mismatch. | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | PASS `node --test tests\telegram-runtime-status.test.js tests\universal-control-plane-scope-policy.test.js tests\universal-assistant-contract.test.js tests\public-helper-agent-review-guardrails.test.js tests\account-scope-entitlements.test.js` | Production identity binding/live readback not authorized |
| REQ-20260712-203 | Done | Bridge startup now asserts private allowlist, bot token, expected bot identity, and scoped Rabbi credentials; readiness uses sidekick runtime keys. | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `server.js`, `tests/telegram-runtime-status.test.js` | PASS syntax checks; PASS focused tests; PASS `npm run watchdog:security` | Worker restart/hosted readiness live smoke not authorized |
| REQ-20260712-204 | Done | Legacy unsigned webhook returns 410; direct Zoom mutation/send commands are no-op blocked; raw Codex CLI execution is disabled from Telegram and guarded before `spawn`; CLI fallback removed. | `server.js`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | PASS new raw-CLI, webhook, and Zoom static tests; PASS watchdog security finding_count 0 | Shared orchestrator/thin adapter remains future Lane 02+ work, not claimed complete |
| REQ-20260712-205 | Done | Lock/status/logging now reports profile, runtime key, masked IDs, and allowlist counts rather than raw private chat IDs or raw message text. | `src/lib/bna/telegram-runtime-status.js`, `scripts/telegram-kimi-bridge.mjs`, `server.js`, `tests/telegram-runtime-status.test.js` | PASS focused tests; PASS `git diff --check` with CRLF warnings only | Live log readback not authorized |
| REQ-20260712-206 | Done | Register updated, packet status updated, ledger/changelog closeout prepared, and no deploy/send/migration/external action performed. | `tasks-pending/2026-07-12-telegram-sidekick-super-package-lane-01.md`, packet status, ledger, changelog | PASS local verification listed above | Production deploy/restart/live Telegram smoke remains blocked by `DEC-20260712-201` |

## 2026-07-12 agent-fleet attempt 1 addendum

Task `#2266` was picked up by the current agent-fleet attempt with the visible
title `Add watchdog soft repair for obvious task warnings`. Current-source
audit found the watchdog soft-repair implementation already present in
`scripts/agent-fleet-supervisor.mjs`, with no new code changes required.

Additional verification:

- PASS `node --check scripts/agent-fleet-supervisor.mjs`.
- PASS `node --test tests/agent-fleet-hardening.test.js tests/action-registry-telegram-ui-bot.test.js` (42/42).
- PASS `npm run chatgpt:dropoff:scan -- --packet telegram-sidekick-super-package-20260712`; packet skipped because it is already `codex_lane_01_local_verified`.
- PASS `npm run chatgpt:dropoff:tower`; packet remains `codex_lane_01_local_verified`.
- PARTIAL `node scripts/agent-fleet-supervisor.mjs --watchdog --once --no-telegram --no-repair --dry-run`; report `ops/system-audits/2026-07-12T14-53-15-000Z-watchdog.md` confirms the repair path suggested `Add watchdog soft repair for obvious task warnings` for one misrouted watchdog task, with repairs disabled.

Remaining blockers from the audit-only watchdog run are outside this scoped
repair: Railway doctor is unauthorized, stale local watchdog/Academy bridge
locks exist, and unrelated raw-looking task titles remain. No live task patch,
deploy, worker restart, Telegram send, production migration, credential change,
or external action was performed.
