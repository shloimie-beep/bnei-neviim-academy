# Codex Goal-Mode Pickup — Telegram Super Sidekick V2

You are Codex working in `shloimie-beep/bnei-neviim-academy`.

This packet is an implementation-ready design and code-preparation bundle, not proof. Audit it against the current repository, adapt it, implement it in small dependency-ordered lanes, and continue until every requirement has a terminal status. Do not respond with another architecture essay.

## Mandatory first actions

1. Read `BNA-START-HERE.md`, `AGENTS.md`, `MEMORY.md`, `TASKS.md`, `docs/BNA-RAMBLE-TO-DONE.md`, `docs/architecture/telegram-control-plane.md`, the active execution run, `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md`, and this entire packet.
2. Refresh `origin/master`, current branch/worktree status, active agent jobs, packet/control-tower state, and production-readiness records. The package was grounded to `d68e3f9`; current source wins.
3. Create or link one raw intake and a dated requirement register. Preserve the operator request and the exact failing utterance.
4. Run the packet validator described in `attachments/08-ACCEPTANCE-GATES.md`. Reject or repair stale file assumptions before editing.
5. Claim only Lane 01. Do not parallel-edit `server.js`, `scripts/telegram-kimi-bridge.mjs`, migrations, or shared registries.

## Mission

Deliver one canonical assistant kernel used by Telegram and approved in-app assistants. Telegram must become a transport adapter, not its own assistant. The kernel resolves verified identity, scope, conversation, memory, capabilities, typed planning, permission, preview, approval, execution, audit, and delivery.

The finished private sidekicks should naturally answer app questions, navigate to app destinations, draft work, and perform allowed typed actions. They must be able to route to every registered button or capability that is intentionally assistant-enabled. “Every button” does not mean browser clicking, shell access, bypassing permissions, or pretending disabled controls work.

## Fixed profiles

- `telegram_shloimie_super_admin`: verified Shloimie identity; role `super_admin`; platform scope; default active workspace remembered; all-workspace reads must be explicit/labeled; cross-workspace writes require explicit acting-on scope and audit.
- `telegram_rabbi_scheller_provider`: verified Rabbi identity; role `provider_admin`; immutable workspace `rabbi_sheller_provider`; immutable project `one_time_mishnah_class`.
- `public_bna_lead`: anonymous/capture-only; no private reads, memory, internal routes, or operational actions.
- `public_robot_scheller_lead`: anonymous/capture-only; One Time public knowledge and CRM lead capture only; class link remains protected by verified membership policy.

## Non-negotiable safety

- Fail closed when Telegram identity/allowlist mapping is missing.
- Role, workspace, project, and grants come from server-side identity records, never tool/model/request payloads.
- A read plan cannot call capture/intake/write handlers.
- Unknown capability IDs and arguments outside strict schemas are rejected.
- Raw CLI, shell, deploy, migrations, secrets, unrestricted diagnostics, and direct production mutations remain unavailable to Telegram and portal assistants.
- Model text never executes. Every write goes through a typed handler, permission check, idempotency key, result record, and audit event.
- External/consequential effects need a preview plus a fresh approval bound to identity, capability, normalized inputs, scope, and expiry.
- Private data is filtered before reaching any model or external web query.
- Public lead agents never inherit private identity, memory, tools, links, or context.

## Execution order

Use `attachments/07-IMPLEMENTATION-DAG.md` and the prompts under `attachments/codex-lanes/`.

1. Security, identity, and runtime fail-closed behavior.
2. Shared turn orchestrator and thin Telegram adapter.
3. Read/query foundation, date parser, no-write classifier, and `list_questions`.
4. Durable memory and preference lifecycle.
5. Capability parity compiler covering typed actions, UI actions, and route registry.
6. Safe external tools, beginning with cited web search.
7. Ingress/outbox reliability, heartbeats, retries, idempotency, and legacy retirement.
8. Full evaluation, shadow mode, canary, deploy proof, and approved live smoke.

## Required architecture choices

- Use the existing `assistant_*` control-plane tables as the canonical target. Keep compatibility adapters for currently used `bna_assistant_*` tables during migration; do not create a second active assistant.
- Use `src/lib/actions/registry.js` as the canonical mutation registry. Compile assistant capabilities from it plus `ops/action-registry.json`, `ops/route-registry.json`, read/query tools, and approved external tools. Do not measure parity from examples or tags.
- Reuse `src/lib/bna/helper/permissions.js`, `confirmation-gates.js`, `destination-resolver.js`, `assistant-scope-policy.js`, and `src/lib/actions/runner.js` after consolidating inconsistencies.
- Do not extend the 11,753-line Telegram bridge with more keyword branches. Move behavior into small shared modules and reduce the bridge to ingress/rendering during compatibility rollout.
- Store conversation and memory in Postgres, not local Markdown/runtime JSON. Repository memory files remain development/operator documentation, not end-user runtime memory.
- All relative dates use a shared `Asia/Jerusalem` parser and the assistant states the resolved interval.

## Exact required behavior

For the message `Give me the questions from the last two weeks` on 2026-07-12 Israel time:

- resolve a rolling 14-calendar-day interval of `2026-06-29` through `2026-07-12`, inclusive;
- choose `read.questions.list`, never intake capture;
- filter rows in SQL/service code before model use;
- Shloimie: query the active workspace by default, or all authorized workspaces only if explicitly requested; label/group every returned scope;
- Rabbi: return only One Time records from his immutable scope;
- include source/provenance, status, and pagination/count metadata;
- label parser-only candidates as unreviewed;
- return zero writes in action/audit assertions except the read audit and conversation message persistence.

## Completion proof

Do not remove legacy runtime paths until shadow comparisons meet the thresholds in `attachments/08-ACCEPTANCE-GATES.md`. Do not claim production completion without:

- all new and affected existing tests passing;
- generated capability parity proving every enabled capability has a handler and tests;
- scope/red-team cases passing for all four profiles;
- restart/idempotency/outbox tests passing;
- package/register/ledger/changelog evidence;
- pushed commit and correct worker deployment;
- worker version/heartbeat readback;
- separately approved live smoke for Shloimie and Rabbi using no-send/read-only requests first;
- explicit blockers for connector credentials or owner-only external actions.

Return exact requirement IDs, files changed, migrations, tests, parity counts, shadow results, commits, deployments, live-smoke evidence, and remaining blockers.
