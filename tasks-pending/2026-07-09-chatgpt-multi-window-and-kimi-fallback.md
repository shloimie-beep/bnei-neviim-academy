# Ramble Intake - 2026-07-09 - ChatGPT Multi-Window And Kimi Fallback

## Raw intake

See
`raw-input/RAW-20260709-003-chatgpt-multi-window-and-kimi-fallback.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260709-003` |
| Source | `codex_chat` |
| Parse status | `registered` |
| Requirement register | `tasks-pending/2026-07-09-chatgpt-multi-window-and-kimi-fallback.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes, inferred from "do all of those things" |
| Active goal objective | Automate the ChatGPT multi-packet workflow, add parallel-lane safeguards, and assess/implement safe Kimi fallback configuration without interfering with active agents. |
| Goal tool used | yes |
| Execution directive | Implement unblocked protocol/script/config changes now. Do not touch the active OneTime UI lane or deploy/externally mutate anything from this lane. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |

## Current-state inspection

- `git status -sb` showed another active lane with dirty files:
  `ops/action-registry/universal-action-parity.json`,
  `ops/action-registry/universal-action-parity.md`,
  `public/css/one-time-shared-review.css`, `public/parent.html`,
  `public/student.html`, and
  `ops/ui-audits/2026-07-09-onetime-student-review-polish-live-final/`.
- `npm run chatgpt:dropoff:tower -- --json --no-agent-status` showed no ready
  ChatGPT packets and warned about the dirty OneTime UI lane.
- Current Kimi defaults before this work were `KIMI_MODEL=kimi-k2.6` and
  `KIMI_CLI_MODEL=bna-kimi`.
- Official Kimi API docs checked on 2026-07-09 list
  `kimi-k2.7-code` and `kimi-k2.7-code-highspeed`; the quickstart recommends
  `kimi-k2.7-code-highspeed` first for programming agents and long-running
  coding tasks.
- Telegram-side Kimi fallback already exists for chat replies/API fallback.
  Agent-fleet task execution had only a Codex CLI execution path before this
  work.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260709-013` | Make the ChatGPT packet workflow automatic enough that the operator does not need to remember the standard prompts. | `RAW-20260709-003` | `bna_platform` | Codex | workflow_automation | P0 | `packet-splitter` | Control tower exists | A repo script or durable protocol generates copy-ready, lane-scoped ChatGPT prompts and tells agents to check the control tower before creating/claiming packets. | `scripts/chatgpt-packet-prompt-splitter.mjs`, `package.json`, dropoff docs/tests | no | Done |
| `REQ-20260709-014` | Support the five-ChatGPT-window workflow: one parent ramble creates five child prompts, and each ChatGPT window creates one packet. | `RAW-20260709-003` | `bna_platform` | Codex | workflow_automation | P0 | `packet-splitter` | `REQ-20260709-013` | Generated prompts have unique prompt IDs, packet IDs, lane keys, scope/out-of-scope rules, and handback instructions. | `scripts/chatgpt-packet-prompt-splitter.mjs`, docs/tests | no | Done |
| `REQ-20260709-015` | Set Kimi defaults to the current high-level coding model where safe. | `RAW-20260709-003` | `bna_platform` | Codex | provider_config | P0 | `kimi-fallback` | Official Kimi model ID verification | Repo defaults use `kimi-k2.7-code-highspeed` for Kimi coding/fallback paths unless explicitly overridden. | `.env.example`, `docs/local-setup.md`, Kimi scripts, fleet config | no | Done |
| `REQ-20260709-016` | Add a safe Kimi fallback path so agent-fleet tasks do not sit stale after Codex quota/credit/rate-limit failures. | `RAW-20260709-003` | `bna_platform` | Codex | agent_fleet | P0 | `kimi-fallback` | Kimi CLI available and configured at runtime | When enabled and Codex fails with a likely capacity/quota error, the fleet can invoke Kimi CLI on the same scoped task with no deploy/external writes, then run normal verification and record provider/fallback evidence. | `scripts/agent-fleet-supervisor.mjs`, tests, docs | no | Done |
| `REQ-20260709-017` | Avoid interfering with the other active OneTime UI agent lane. | `RAW-20260709-003` | `bna_platform` / `one_time_mishnah_class` | Codex | coordination | P0 | `all` | none | This lane does not edit or stage the dirty OneTime UI files; control tower/lane warnings remain explicit. | status/evidence/register | no | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260709-005` | Should Kimi automatically deploy, send, mutate production data, or push when Codex is out of credits? | none | Codex/Shloimie | No. Kimi fallback may do local Tier-1 code/doc/test work only; Codex/fleet verification and release gates still own done/deploy status. | Let Kimi run fully autonomous deploy/external writes. | Higher chance of unsafe mutations, hidden provider behavior, and collision with other agent lanes. | Keep Kimi fallback bounded to same task, no deploy/external writes, and normal verification/reporting. | `REQ-20260709-016` | Accepted |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260709-013` | Done | Added `npm run chatgpt:packet-prompts`, updated `CHATGPT-START-HERE.md`, dropoff README, `AGENTS.md`, and `MEMORY.md` so agents/operators can generate prompts instead of remembering them. | `scripts/chatgpt-packet-prompt-splitter.mjs`, `package.json`, dropoff docs, `AGENTS.md`, `MEMORY.md` | PASS `node --check scripts/chatgpt-packet-prompt-splitter.mjs`; PASS focused packet/control-tower tests 15/15. | none |
| `REQ-20260709-014` | Done | Generated five copy-ready prompts under `ops/chatgpt-ramble-dropoff/outgoing/20260709-chatgpt-multi-window-and-kimi-fallback/prompts/`; manifest has five unique prompt IDs, packet IDs, lane keys, and one-window/one-packet rules. | outgoing prompt batch, splitter script/tests | PASS prompt splitter test verifies five lane-scoped prompts and docs/package wiring. | none |
| `REQ-20260709-015` | Done | Official Kimi docs checked on 2026-07-09; repo defaults and active Kimi scripts now prefer `kimi-k2.7-code-highspeed`; local `.env.local` was updated for runtime but not staged. | `.env.example`, `docs/local-setup.md`, `docs/integrations/studio-model-adapters.md`, `scripts/telegram-kimi-bridge.mjs`, Kimi helper scripts, `src/lib/bna/service-provider-studio.js` | PASS model sweep found no active `kimi-k2.6`/`bna-kimi` defaults except archived dormant code; PASS `kimi --version` returned 1.44.0. | Runtime account/API key must remain configured outside tracked files. |
| `REQ-20260709-016` | Done | Agent fleet now exposes `AGENT_FLEET_KIMI_FALLBACK_ENABLED`, `AGENT_FLEET_KIMI_FALLBACK_MODE=quota_only`, quota-like failure detection, Kimi CLI invocation, fallback logs, provider evidence, and normal verification/reporting after fallback. | `scripts/agent-fleet-supervisor.mjs`, tests, `.env.example`, docs/memory | PASS `node --check scripts/agent-fleet-supervisor.mjs`; PASS fleet hardening test; PASS `npm run agent:fleet:status` showed `Kimi coding fallback: quota_only / kimi-k2.7-code-highspeed`. | Real fallback execution requires Codex to return an actual quota/capacity-style failure; no artificial quota failure was forced. |
| `REQ-20260709-017` | Done | Work stayed scoped to workflow/config/docs/tests; initial dirty OneTime UI lane was observed and avoided. | no active OneTime UI files staged by this lane | PASS `git status -sb` and explicit staging review before commit; PASS `npm run secrets:audit`; PASS `npm run watchdog:protocol-drift` with 0 findings. | none |
