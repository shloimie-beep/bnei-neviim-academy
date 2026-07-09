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
| Execution directive | Operator approved implementation after the advisory pass. Implement the ChatGPT dropoff/control-tower lane, profile the slow live route, and do not overlap another agent's source-file lane. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | `REQ-20260709-012` deploy/live fix remains blocked on a clean BNA release lane; `REQ-20260709-010` and `REQ-20260709-011` are implemented in repo workflow files. |

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
- Follow-up implementation request added the parallel-agent requirement: before
  a new ChatGPT/Codex window creates or edits a packet, it must check the
  control tower for active packets, dirty files, claimed lanes, terminal
  packets, and local-only state ChatGPT cannot see.
- Live authenticated readback on 2026-07-09 found BNA production serving the
  old inline Operations shell (`2,316,039` HTML bytes, inline API/dashboard
  markers present, split shell assets absent), while OneTime production served
  the split shell (`1,688` HTML bytes, `/js/operations-shell.js` present).
  This explains the slow BNA load without proving a database capacity problem.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260709-009` | Give the operator a clear recommendation for how to use ChatGPT to save Codex credits without losing proof, status, or source-of-truth safety. | `RAW-20260709-002` | `bna_platform` | Codex | advisory | P0 | `advice` | Current-state inspection | Response explains the recommended workflow, what is already working, what is not clear enough, and how ChatGPT should hand work to Codex. | Chat response, this register | no | Done |
| `REQ-20260709-010` | Build or refine a visible ChatGPT/Codex packet control tower so broad ChatGPT rambles do not become one giant unclear chat. | `RAW-20260709-002` | `bna_platform` | Codex | workflow-ui | P0 | `chatgpt-controltower` | operator implementation request | One view shows packet/source ID, owner, status, next action, ready/claimed/blocked/done state, proof link, and whether a packet is safe for Agent Mode audit. | `scripts/chatgpt-dropoff-control-tower.mjs`, `ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md`, `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md`, docs/templates/tests | no | Done - verified for scoped closeout |
| `REQ-20260709-011` | Audit and clean up ChatGPT dropoff and agent-fleet queue status noise so done/stale/blocked/ready work is easy to understand. | `RAW-20260709-002` | `bna_platform` | Codex | queue-hygiene | P0 | `chatgpt-controltower` | operator implementation request | Fleet/dropoff status distinguishes terminal packets, active claimable jobs, fallback-ready tasks, stale jobs, blocked jobs, and unknown records with one recommended next action. | `scripts/chatgpt-dropoff-ingestor.mjs`, `scripts/chatgpt-dropoff-control-tower.mjs`, dropoff templates/tests | no | Done - verified for scoped closeout |
| `REQ-20260709-012` | Re-profile the exact live route/account that still feels slow and explain whether the bottleneck is database, server, network, JavaScript, rendering, helper/AI, or cold start. | `RAW-20260709-002` | `bna_platform` / `one_time_mishnah_class` | Codex | performance | P0 | `performance-readback` | operator implementation request and inferred slow surface `/operations?view=tasks` | A report separates browser load time, JS parse/execute, API timings, DB/query timings where observable, number of API round trips, cold/warm differences, and the recommended next fix. | `scripts/profile-operations-startup.mjs` evidence, live readback evidence | yes if fix follows | Blocked for live fix - BNA deploy lane/target must be clean before shipping split shell |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260709-005` | chatgpt_codex_control_tower | Create a visible packet/control-tower view for ChatGPT packets, Agent Mode audits, Codex jobs, blockers, and proof links. | Codex | `bna_platform` | `RAW-20260709-002` | `REQ-20260709-010`, `REQ-20260709-011` | Use `npm run chatgpt:dropoff:tower` before new ChatGPT/Codex packet work; commit/push the closeout so GitHub-connected ChatGPT can read it. | internal/workflow | Done - verified for scoped closeout |
| `TASK-20260709-006` | live_slow_route_profile | Profile the specific live app surface that still feels slow after the Operations shell split. | Codex | `bna_platform` / `one_time_mishnah_class` | `RAW-20260709-002` | `REQ-20260709-012` | Create a clean BNA deploy lane/target and deploy the already-split Operations shell to BNA production; live-smoke after deploy. | internal/performance | Blocked for deploy lane |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260709-003` | Should ChatGPT write production source code directly or write repo-visible packets for Codex audit? | None for recommendation. | Shloimie/Codex | Keep ChatGPT in packet mode: it can write large diffs, code sketches, audits, and test plans in `PATCHES.md`, but Codex audits, adapts, tests, commits, pushes, and deploys. | Let ChatGPT edit app files directly through GitHub. | Direct source edits may save tokens short term but increase merge, stale-context, proof, privacy, and deployment risk. | Use packet folders or marked GitHub comments, not direct app/source edits, unless Codex explicitly asks for a narrow PR shape. | `REQ-20260709-010` | Recommended |
| `DEC-20260709-004` | Does paying more for the database automatically fix the slow app? | Exact live bottleneck for the route that feels slow. | Codex/Shloimie | Do not upgrade database as the first move. Profile first; upgrade only if DB query time, CPU, connection saturation, or cold/sleep behavior is proven. | Upgrade DB/provider immediately. | Could waste money while the actual issue is JavaScript bundle size, too many API calls, browser rendering, helper/AI wait, cache headers, or Railway cold starts. | Deploy the split Operations shell to BNA production from a clean BNA lane, then re-profile before buying database capacity. | `REQ-20260709-012` | Confirmed by live readback |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| `Q-20260709-002` | Which exact live route/view/account feels slow right now: Operations overview, Rabbi provider CRM, student portal, parent setup, classroom, helper, or another page? | Performance fixes need the route and role that actually hurt the user. | Blocks only non-BNA route profiling | Answered for inferred BNA `/operations?view=tasks`; other routes can be profiled later if still slow |
| `Q-20260709-003` | Does the slow feeling happen on first load only, every navigation, after login, on mobile, or after leaving the page idle? | Separates cold start/cache/browser JS issues from database/API issues. | Blocks deeper tuning only | Partially answered: BNA first authenticated Operations load is serving a heavy inline shell; OneTime split-shell route is fast |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| `MEM-20260709-002` | For saving Codex credits, ChatGPT should be used as a packet-producing sidekick: audit, split, draft diffs, and prepare test plans in repo-visible dropoff packets, while Codex remains the integration/proof/deploy owner. | maybe, after operator accepts | Stable workflow preference if accepted. |
| `MEM-20260709-003` | App performance questions should be answered with route-specific profiling before recommending infrastructure upgrades. | yes, likely performance/workflow memory if repeated | Prevents buying database capacity when bottleneck is front-end, cache, API fan-out, or cold starts. |
| `MEM-20260709-004` | Before starting parallel ChatGPT/Codex work, check the ChatGPT dropoff control tower for dirty files, active packets, owner/lane, status, next action, and local-only state invisible to GitHub-connected ChatGPT. | yes | Stable workflow preference accepted by implementation request. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260709-009` | Done | Current-state command outputs from `bna:run:status`, `bna:run:next`, `chatgpt:dropoff:scan`, and `agent:fleet:status`; register created. | `raw-input/RAW-20260709-002-chatgpt-credit-routing-and-app-lag-advice.md`, `memory/2026-07-09.md`, `tasks-pending/2026-07-09-chatgpt-credit-routing-and-app-lag-advice.md` | Advisory inspection only; no app code changed. | Implementation of control tower and performance re-profile are pending operator request. |
| `REQ-20260709-010` | Done - verified for scoped closeout | Control tower generated at `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md` and JSON sibling; ChatGPT quickstart created; templates now require `lane_key`, `owner`, `next_action`, blockers, tests, and local-state warning fields. | `scripts/chatgpt-dropoff-control-tower.mjs`, `ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md`, `AGENTS.md`, `BNA-START-HERE.md`, dropoff docs/templates/tests | `node --check scripts/chatgpt-dropoff-control-tower.mjs`; focused node tests passed; `npm run watchdog:protocol-drift`; `npm run secrets:audit`; `git diff --check`. | GitHub-connected ChatGPT can use the workflow after the scoped closeout commit is pushed. |
| `REQ-20260709-011` | Done - verified for scoped closeout | Ingestor no longer writes fresh pickup report files for routine terminal `skipped` / `already_queued` results unless `--write-skip-reports` is requested; control tower summarizes terminal packets, active/fallback/stale/blocked fleet status, recent pickups, and collision warning. | `scripts/chatgpt-dropoff-ingestor.mjs`, `scripts/chatgpt-dropoff-control-tower.mjs`, `package.json`, tests | Focused node tests passed; `npm run chatgpt:dropoff:scan` returned terminal skipped packets with no report paths; `npm run chatgpt:dropoff:tower -- --json` generated the control tower. | GitHub-connected ChatGPT and other agents should run/read the control tower before starting overlapping work. |
| `REQ-20260709-012` | Blocked for live fix | OneTime live profile: overview visible `1484ms`, `8` fetches, max fetch `336ms`, `0` long tasks. BNA live profile: shell visible `2720ms`, `18` fetches, max fetch `689ms`, `12,593` DOM nodes, `1,481` buttons, `577ms` long tasks, resource transfer about `15.7MB`. Live readback shows BNA serves old inline shell while OneTime serves split shell. | Performance evidence files under `ops/performance-audits/2026-07-08-app-backend-helper-performance/` | `node scripts/profile-operations-startup.mjs` for OneTime and BNA; authenticated HTML marker readback for both domains; release gates checked. | BNA deploy cannot be called done from this mixed branch/state. Next action: create/use a clean BNA deploy lane with explicit Railway target, deploy the split shell, then run live readback/profile again. |
