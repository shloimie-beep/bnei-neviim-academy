# Lane 03 — Canonical Turn Orchestrator And Thin Telegram Adapter

**Packet role:** implementation
**Owner:** Codex
**Depends on:** Lanes 01–02
**High-collision files:** canonical migration, `server.js`, package/worker commands

## Mission

Turn the dormant control-plane contract into the single runtime used by a new shadow Telegram adapter.

## Implement

- Apply/adapt the additive migration after a real Postgres duplicate/schema preflight.
- Add stores for channel/envelope, identity/scope, conversation/message, plans/runs, previews/approvals, outbox/dead letters, and audit.
- Implement transport-neutral request, immutable ScopeContext, strict structured plan, result envelope, and `runAssistantTurn()`.
- Unknown/ambiguous/read requests never call intake/task/ticket fallback.
- Wrap existing handlers through capability aliases rather than duplicating business logic.
- Add private signed worker ingress/outbox/heartbeat routes and authenticated app turn/run routes.
- Add thin Telegram adapter/worker that normalizes envelope, downloads media through canonical intake, renders typed results/buttons/deep links, and reports health.
- Run new path in shadow mode: no execution, no reply delivery.

## Do not

- Do not remove the legacy bridge yet.
- Do not allow the worker to call LLM/domain/Codex/Railway/Zoom/connectors directly.
- Do not activate seeded channel instances or real bindings from SQL.

## Acceptance

- Durable insert precedes cursor advance.
- Per-conversation sequence and idempotent envelope insert work under two workers.
- A credential-free synthetic Telegram update reaches plan and outbox without legacy business logic.
- No role/scope authority in transport payload.
- Planner output unknown IDs/extra args fail.
- Existing API wrappers preserve required public shapes under feature flag.

## Tests

Real Postgres migration/query test; envelope/cursor/sequence; turn contract; no-write fallback; adapter normalization/rendering; signed worker routes; shadow-mode no-execution/no-delivery.

## Handback

Return schema version, feature flags, compatibility paths, shadow instrumentation, tests, and blockers. Lane 04 is the first end-user vertical slice.
