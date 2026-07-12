# 07 — Implementation DAG

This is a super-ramble and must not become one giant patch. Use the prepared lane prompts under `codex-lanes/`. Shared high-collision files are sequenced.

## Dependency graph

```text
00 Intake/control tower
        |
01 Security + identity
        |
02 Canonical contracts + capability compiler
        |
03 Turn orchestrator + Telegram adapter
       / \
04 Questions vertical slice   05 Memory loop
       \ /
06 Capability migration/parity
        |
07 External tools
        |
08 Reliability, shadow, rollout, legacy retirement
```

Questions and memory may run in parallel only after the turn contracts are stable and only when their files do not overlap. `server.js`, shared migrations, registries, and worker commands remain single-owner.

## Lane 00 — Intake and source refresh

- Create/link raw intake and dated requirements.
- Refresh control tower, master, active jobs, dirty files, deployment truth, and current production-readiness.
- Run current registry counts/routing baseline and real schema drift preflight.
- Record any changed assumptions; do not edit production code.

Exit: Definition of Ready and non-overlapping lane ownership.

## Lane 01 — Security and identity

- Channel instances, verified bindings/link flow, service request signing/nonces.
- Fail-closed private chats/allowlist and expected `getMe` identity.
- Immutable server scope and explicit role hierarchy.
- Disable legacy unsigned webhook and direct CLI/deploy/Zoom/connector bypasses.
- Redacted logging and both heartbeats.

Exit: identity/scope negative suite passes before model/domain access.

## Lane 02 — Canonical contracts and manifest compiler

- Add strict request/plan/result/capability schemas.
- Make typed actions authoritative; wrap old IDs as aliases.
- Compile UI/route/helper mappings and profile manifests.
- Add `--check` drift CI and classify UI-only/disabled/external-blocked controls.
- Explicit effect/approval/idempotency/handler/test metadata.

Exit: 100% structural manifest gate; no claim of runtime parity yet.

## Lane 03 — Turn orchestrator and thin adapter

- Durable source envelopes, conversations/messages, plans/runs/previews/approvals/outbox.
- `runAssistantTurn()` with no-fallback-to-write behavior.
- Compatibility wrappers for existing APIs.
- Thin Telegram worker/renderer in shadow mode.

Exit: credential-free Telegram envelope -> plan -> read/draft -> outbox integration test.

## Lane 04 — Questions vertical slice

- Shared Israel-time resolver.
- Canonical question query/index service.
- `app.questions.list` schemas, handler, renderer, pagination, object refs.
- Exact English/Hebrew and no-write/cross-scope tests.

Exit: exact request and follow-ups pass for Shloimie/Rabbi/public negatives.

## Lane 05 — Memory/preferences

- Canonical memory records/events, retrieval predicates, lifecycle, summarizer, retention.
- Explicit remember/list/confirm/correct/forget capabilities.
- Legacy memory candidates only; no raw Markdown import.
- Cross-surface same-identity and cross-tenant negative tests.

Exit: restart/deploy simulation preserves allowed preferences and forget removes them.

## Lane 06 — Full app capability migration

- Map all 80 typed actions, 169 Helper tools, 127 UI actions, and current route registry into handled or explicit-exclusion rows.
- Implement app query catalog: tasks, decisions, students, parents, providers, leads, contacts, communications, calendar, content/library, integrations, agent status.
- Convert Helper duplicates into aliases to the canonical handler.
- Add secure navigation capabilities for app buttons/routes.
- Raise bilingual routing corpus toward the release threshold.

Exit: 100% manifest/profile/parity structure, every enabled business capability runtime-tested, overall routing >=95%, high-risk false positives zero.

## Lane 07 — External tools

- Shared cited web search/read adapter first.
- Scoped file/Drive, calendar, and email reads/drafts as connectors are ready.
- External writes last, with readiness, egress, preview, consent/suppression, approval, and step-up.
- Honest blocked/not-configured behavior.

Exit: connector readiness and privacy tests; no real send in CI.

## Lane 08 — Reliability, rollout, and retirement

- Durable cursor/leader lease, retries, dead letters, per-conversation ordering, outbox, chaos tests.
- Shadow old/new plan comparisons with execution disabled.
- Cut over Shloimie read turns, then drafts/internal writes, then approval-gated effects.
- Cut over Rabbi only after cross-scope negatives.
- Converge authenticated web/helper surfaces through compatibility wrappers.
- Retire local Markdown/runtime correctness, Telegram router/snapshots/direct commands, hardcoded universal tools, and legacy webhook after two verified releases/rollback window.

Exit: deployment/version/heartbeat proof, approved live read-only smokes, rollback tested, legacy disabled.

## Parallel/collision rules

- One owner for `server.js` per batch.
- One migration owner; all SQL changes flow through the same preflight.
- Generated registries are never hand-edited.
- No parallel edits to `scripts/telegram-kimi-bridge.mjs`; prefer new modules and a compatibility flag.
- Each lane updates the requirements register, ledger, changelog, tests, and handback evidence before the next lane.
