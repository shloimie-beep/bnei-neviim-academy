# Agent Mode Prompt Reconciliation And One Time UI Audit Prompts

Raw ID: `RAW-20260707-004`

Created: 2026-07-07 Asia/Jerusalem

Workspace/project: `bna_platform` plus `rabbi_sheller_provider` /
`one_time_mishnah_class`

Goal: Reconcile which Agent Mode / ChatGPT dropoff prompts from yesterday were
actually queued, executed, implemented, verified, or blocked, then create the
next precise Agent Mode audit prompts for One Time/BNA UI consistency and
audited view-as navigation.

## Parsed Requirements

| ID | Requirement | Source | Workspace/project | Owner | Priority | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|
| `REQ-20260707-040` | Preserve this new ramble and register the reconciliation/audit-prompt work. | `RAW-20260707-004` | `bna_platform` | Codex | P0 | none | Raw record and register exist with stable IDs and guardrails. | Done |
| `REQ-20260707-041` | Reconcile yesterday's Agent Mode / ChatGPT dropoff prompts. | `RAW-20260707-004` | `bna_platform` / `agent_ops` | Codex | P0 | `REQ-20260707-040` | Inventory prompt/dropoff packets, agent-fleet queue state, completed implementation evidence, failed/credential-blocked attempts, and next action per prompt. | Done |
| `REQ-20260707-042` | Create Agent Mode audit prompts for One Time UI consistency. | `RAW-20260707-004` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | P0 | `REQ-20260707-041`, `REQ-20260707-032` | Prompts cover consistent toolbar/subcategory/filter/button systems, BNA vs One Time brand boundaries, route/view matrix, screenshots, credentials blockers, and output contract. | Done |
| `REQ-20260707-043` | Create Agent Mode audit prompt for Super Admin view-as navigation. | `RAW-20260707-004` | `bna_platform`; `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | P0 | `REQ-20260707-041`, `REQ-20260707-032` | Prompt audits login-once navigation to view as Rabbi/provider and student without shared passwords, with privacy guardrails and exact route/session findings. | Done |
| `REQ-20260707-044` | Keep Telegram/Agent Fleet intake policy clear. | `RAW-20260707-004` | `agent_ops` | Codex | P1 | `REQ-20260707-041` | Document what the fleet should read from Telegram/dropoff, what remains blocked, and how to avoid stale-job replay. | Done for status/reconciliation; full fleet restart remains blocked |

## Product Quality Compiler

Trigger phrases include `million-dollar app`, `consistent`, `filters`,
`buttons`, `toolbar`, `subcategories`, `logical`, `view as Rabbi`, and `view as
student`. These must compile into exact audit prompts before implementation.

Definition of Ready for implementation remains blocked until the current-state
audit and the new Agent Mode prompt packet(s) have exact routes, roles,
states, screenshots/blockers, action/route registry expectations, tests, and
deploy/live-smoke requirements.

## Initial Decisions

| ID | Decision | Recommended option | Status |
|---|---|---|---|
| `DEC-20260707-040` | How should Shloimie inspect Rabbi/student views from his own login? | Audited scoped view-as sessions/previews with persistent banner, return path, and no password exposure. | Open pending access audit |
| `DEC-20260707-041` | Should the full agent fleet be started now? | Do not start broadly until stale-job replay policy and active Telegram poller ownership are clear; reconcile queue first. | Open |

## Evidence Log

- Raw intake:
  `raw-input/RAW-20260707-004-agent-mode-prompt-reconciliation-onetime-ui-audit.md`
- Reconciliation report:
  `ops/system-audits/2026-07-07-agent-mode-prompt-reconciliation.md`
- Verified prior prompt packet:
  `ops/chatgpt-ramble-dropoff/incoming/onetime-agent-prompt-series-20260706-911/status.json`
- Prior prompt packet pickup audit:
  `ops/chatgpt-ramble-dropoff/pickups/2026-07-07T09-15-13-onetime-agent-prompt-series-audit.md`
- Agent fleet wrapper report:
  `ops/agent-fleet-runs/2026-07-07T06-21-46-153Z-task-1945.md`
- Current-state visual audit:
  `ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/report.md`
- New Agent Mode prompt series:
  `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/`

## Reconciliation Findings

| Finding | Status | Evidence | Next action |
|---|---|---|---|
| July 6 prompt series was queued as task `#1945` / job `#397`. | Verified | `status.json`, pickup reports, agent-fleet status | Done for prompt packet pickup. |
| The fleet consumed job `#397`; it is no longer in the next claimable list. | Verified | `npm run agent:fleet:status` after run shows 25 claimable jobs and omits `#397`. | Do not broadly start remaining stale queue. |
| The prior Agent Mode child audit packets were not delivered. | Verified | No expected `onetime-ui-audit-20260706-911-*` child directories exist under incoming. | Run Prompt `01`, then `02`/`03`/`04`, then `05`. |
| One earlier Agent Mode attempt failed because the ChatGPT session lacked GitHub connector/write ability. | Verified | `tasks-pending/2026-07-06-chatgpt-agent-dropoff-collector-and-fleet-status.md` | Use GitHub-connected Agent Mode or marked GitHub comment fallback. |
| Fleet wrapper for task `#1945` returned `ok: false`. | Verified | `ops/agent-fleet-runs/2026-07-07T06-21-46-153Z-task-1945.md` | The packet itself is `done_verified`; wrapper failed because broad `npm test` has action-registry/hash freshness failures. |
| New view-as access and UI consistency prompts were needed. | Done | New prompt packet under `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/` | Run prompts via Agent Mode and require repo-visible dropoff. |

## Verification Closeout

- PASS `node --check scripts/audit-onetime-role-ui-current-state.mjs`.
- PASS JSON parse for the new prompt-series manifest, current-state UI audit
  report, prior packet `status.json`, and packet pickup report JSON.
- PASS `ops/agent-task-ledger.jsonl` JSONL parse.
- PASS `npm run agent:fleet:status`: supervisor not running; job `#397` no
  longer appears in the next claimable list.
- PASS `npm run watchdog:protocol-drift` after Prompt `04` was patched with
  Product Quality Compiler, current-state visual audit, browser security,
  context budget, trace, support drawer, role-gate, and state-matrix coverage.
- PASS `npm run secrets:audit`.
- Known non-closeout blocker: the fleet wrapper's broad `npm test` run failed
  on action-registry/hash freshness assertions and a Launch / Checkout
  expectation mismatch. This does not block the prompt reconciliation packet,
  but it does block treating the full fleet wrapper as green.

## Guardrails

- No full agent-fleet start during reconciliation.
- No Telegram bridge restart during reconciliation.
- No UI code implementation from this register until prompts/audit packets pass Definition of Ready.
- No shared Rabbi/student passwords.
- No secrets, tokens, cookies, raw private email bodies, or student-sensitive data committed.
