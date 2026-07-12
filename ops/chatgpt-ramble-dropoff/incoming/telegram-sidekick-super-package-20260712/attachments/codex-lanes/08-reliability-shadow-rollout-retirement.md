# Lane 08 — Reliability, Shadow Rollout, And Legacy Retirement

**Packet role:** integration, verification, release
**Owner:** Codex; external effects require operator approval
**Depends on:** all implementation lanes

## Mission

Prove the sidekick survives real runtime conditions, cut over safely, and remove duplicate architectures only after evidence.

## Implement/verify

- DB cursor/leader lease, envelope/outbox claim, per-conversation ordering, retries/backoff/Telegram `retry_after`, dead letters, replay, SIGTERM drain, both heartbeat/readiness paths.
- Exactly-once domain action behavior through idempotency; at-least-once Telegram notification semantics documented.
- Crash/chaos tests at each durable boundary.
- Shadow old/new plan comparison with execution and reply delivery disabled.
- Shloimie canary: reads -> drafts/internal writes -> approval-gated consequential actions.
- Rabbi canary only after cross-scope negatives; verify memory and One Time-only connector/context.
- Authenticated web/helper compatibility wrappers converge later without public-profile widening.

## Cutover thresholds

- 100% high-risk/scope/read-no-write/exact-query cases.
- >=95% full golden routing.
- No unsafe scope/effect delta in shadow window.
- Queue/error/latency within accepted budget.
- Rollback flag exercised.

## Retirement

After two verified releases/rollback window:

- remove Telegram keyword router/snapshots/direct capture and local correctness memory/state;
- remove direct CLI/deploy/Zoom/connector bypasses permanently;
- remove hardcoded universal assistant tool planner and duplicate Helper execution definitions;
- freeze legacy assistant tables read-only, then archive in a separately reviewed migration;
- delete unsigned legacy webhook.

## Production gate

This packet itself does not authorize deployment, production migration, or live messaging. With separate approval, record commit, target service, migration preflight/apply, worker version/getMe/profile/binding/lease/heartbeat, queue/outbox health, read-only live smoke for both bots, restart-memory smoke, Rabbi cross-scope negative, and rollback proof.

## Handback

Return exact shadow metrics, cutover flags, deployment/version evidence, live-smoke results, retired paths, rollback status, and remaining owner/external blockers.
