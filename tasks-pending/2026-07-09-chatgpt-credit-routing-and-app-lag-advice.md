# Ramble Intake - 2026-07-09 - ChatGPT Credit Routing And App Lag Advice

## Raw intake

See
`raw-input/RAW-20260709-002-chatgpt-credit-routing-and-app-lag-advice.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260709-002` |
| Source | `codex_chat` |
| Parse status | `registered` |
| Requirement register | `tasks-pending/2026-07-09-chatgpt-credit-routing-and-app-lag-advice.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | none created from this advisory ramble |
| Goal tool used | no |
| Execution directive | Advice and current-state inspection first; implementation only after operator asks to build the recommended control-tower/performance changes. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | `REQ-20260709-010`, `REQ-20260709-011`, `REQ-20260709-012` if operator asks to implement |

## Current-state inspection

Commands run for this advisory pass:

- `npm run bna:run:status`
- `npm run bna:run:next`
- `npm run chatgpt:dropoff:scan`
- `npm run agent:fleet:status`

Findings:

- The active execution run validates and has `8` done requirements and `2`
  blocked requirements. There is no next unblocked executable batch in that
  run.
- ChatGPT dropoff ingest is enabled. The two known packet folders were scanned
  and skipped because both are terminal `done_verified`; queued count was `0`.
- The agent fleet supervisor is running. It reports ChatGPT dropoff ingest and
  comment collection enabled.
- Queue visibility is noisy: the fleet reports `32` observable Codex jobs,
  `0` claimable observable jobs under active-task policy, `2` fallback-ready
  tasks, plus many stale/blocked/unknown records.
- A performance register already exists:
  `tasks-pending/2026-07-08-app-backend-helper-performance.md`.
  Prior performance work found a real front-end/browser bottleneck: the
  Operations shell was about 2.35MB and was split into smaller cacheable and
  deferred assets. The latest recorded live profile showed the OneTime overview
  visible around 1.3 seconds with post-overview API fetches under about 350ms,
  but additional user-perceived slowness can still exist on other routes,
  browsers, accounts, or cold loads.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260709-009` | Give the operator a clear recommendation for how to use ChatGPT to save Codex credits without losing proof, status, or source-of-truth safety. | `RAW-20260709-002` | `bna_platform` | Codex | advisory | P0 | `advice` | Current-state inspection | Response explains the recommended workflow, what is already working, what is not clear enough, and how ChatGPT should hand work to Codex. | Chat response, this register | no | Done |
| `REQ-20260709-010` | Build or refine a visible ChatGPT/Codex packet control tower so broad ChatGPT rambles do not become one giant unclear chat. | `RAW-20260709-002` | `bna_platform` | Codex | workflow-ui | P0 | `future-implementation` | operator implementation request | One view shows packet/source ID, owner, status, next action, ready/claimed/blocked/done state, proof link, and whether a packet is safe for Agent Mode audit. | TBD: Operations/Agent Work/dropoff views, scripts, route/API as needed | yes if app-visible | Pending |
| `REQ-20260709-011` | Audit and clean up ChatGPT dropoff and agent-fleet queue status noise so done/stale/blocked/ready work is easy to understand. | `RAW-20260709-002` | `bna_platform` | Codex | queue-hygiene | P0 | `future-implementation` | operator implementation request | Fleet/dropoff status distinguishes terminal packets, active claimable jobs, fallback-ready tasks, stale jobs, blocked jobs, and unknown records with one recommended next action. | Agent-fleet scripts, queue audits, Operations Agent Work surface | maybe | Pending |
| `REQ-20260709-012` | Re-profile the exact live route/account that still feels slow and explain whether the bottleneck is database, server, network, JavaScript, rendering, helper/AI, or cold start. | `RAW-20260709-002` | `bna_platform` / `one_time_mishnah_class` | Codex | performance | P0 | `future-implementation` | operator implementation request and exact slow surface/session if needed | A report separates browser load time, JS parse/execute, API timings, DB/query timings where observable, number of API round trips, cold/warm differences, and the recommended next fix. | Existing performance audit scripts plus route-specific profiling | yes if fix follows | Pending |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260709-005` | chatgpt_codex_control_tower | Create a visible packet/control-tower view for ChatGPT packets, Agent Mode audits, Codex jobs, blockers, and proof links. | Codex | `bna_platform` | `RAW-20260709-002` | `REQ-20260709-010`, `REQ-20260709-011` | Wait for operator approval to implement; recommended as the next workflow improvement. | internal/future | Pending |
| `TASK-20260709-006` | live_slow_route_profile | Profile the specific live app surface that still feels slow after the Operations shell split. | Codex | `bna_platform` / `one_time_mishnah_class` | `RAW-20260709-002` | `REQ-20260709-012` | Ask for or infer exact slow route/session, then run live browser/API profiler and record bottleneck evidence. | internal/future | Pending |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260709-003` | Should ChatGPT write production source code directly or write repo-visible packets for Codex audit? | None for recommendation. | Shloimie/Codex | Keep ChatGPT in packet mode: it can write large diffs, code sketches, audits, and test plans in `PATCHES.md`, but Codex audits, adapts, tests, commits, pushes, and deploys. | Let ChatGPT edit app files directly through GitHub. | Direct source edits may save tokens short term but increase merge, stale-context, proof, privacy, and deployment risk. | Use packet folders or marked GitHub comments, not direct app/source edits, unless Codex explicitly asks for a narrow PR shape. | `REQ-20260709-010` | Recommended |
| `DEC-20260709-004` | Does paying more for the database automatically fix the slow app? | Exact live bottleneck for the route that feels slow. | Codex/Shloimie | Do not upgrade database as the first move. Profile first; upgrade only if DB query time, CPU, connection saturation, or cold/sleep behavior is proven. | Upgrade DB/provider immediately. | Could waste money while the actual issue is JavaScript bundle size, too many API calls, browser rendering, helper/AI wait, cache headers, or Railway cold starts. | Run route-specific live performance profiling and slow-query/API timing before buying capacity. | `REQ-20260709-012` | Recommended |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| `Q-20260709-002` | Which exact live route/view/account feels slow right now: Operations overview, Rabbi provider CRM, student portal, parent setup, classroom, helper, or another page? | Performance fixes need the route and role that actually hurt the user. | Blocks precise profiling only | Open |
| `Q-20260709-003` | Does the slow feeling happen on first load only, every navigation, after login, on mobile, or after leaving the page idle? | Separates cold start/cache/browser JS issues from database/API issues. | Blocks precise profiling only | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| `MEM-20260709-002` | For saving Codex credits, ChatGPT should be used as a packet-producing sidekick: audit, split, draft diffs, and prepare test plans in repo-visible dropoff packets, while Codex remains the integration/proof/deploy owner. | maybe, after operator accepts | Stable workflow preference if accepted. |
| `MEM-20260709-003` | App performance questions should be answered with route-specific profiling before recommending infrastructure upgrades. | yes, likely performance/workflow memory if repeated | Prevents buying database capacity when bottleneck is front-end, cache, API fan-out, or cold starts. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260709-009` | Done | Current-state command outputs from `bna:run:status`, `bna:run:next`, `chatgpt:dropoff:scan`, and `agent:fleet:status`; register created. | `raw-input/RAW-20260709-002-chatgpt-credit-routing-and-app-lag-advice.md`, `memory/2026-07-09.md`, `tasks-pending/2026-07-09-chatgpt-credit-routing-and-app-lag-advice.md` | Advisory inspection only; no app code changed. | Implementation of control tower and performance re-profile are pending operator request. |

