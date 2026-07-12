# 00 — Package Overview

## Outcome

Build one production assistant kernel that makes Telegram and approved app assistants capable, contextual, and consistent while keeping identity, workspace, privacy, and side-effect controls deterministic.

The kernel must support six capability kinds:

1. **Answer** — explain from permitted context without a tool.
2. **Query** — retrieve current app data with scope, filters, pagination, and provenance.
3. **Navigate** — produce a secure canonical app deep link for a route/button.
4. **Draft** — prepare content or a proposed change without applying/sending it.
5. **Act** — execute a typed internal operation with permission, idempotency, result, and audit.
6. **Research/external tool** — use approved connectors such as public web search under egress, readiness, and approval policy.

## Audit baseline

At audited master `d68e3f9` the application has four parallel assistant engines:

- Telegram monolith: 11,753-line polling worker with its own prompts, snapshots, filesystem memory, direct commands, actions, and runtime state.
- Canonical `assistant_*` control-plane schema and policy: mostly dormant contract/skeleton.
- Operations Helper: 169 tool definitions with its own planner, profile, confirmation, and audit model.
- Web/universal assistant: `bna_assistant_*` threads and roughly 19 hardcoded natural-language actions, plus a separate public hosted-AI chat path.

Registry truth is also split:

- 80 typed app actions in `src/lib/actions/registry.js`.
- 169 Helper tools; 69 overlap typed actions and 100 do not.
- 127 UI/root action records in `ops/action-registry.json`, with no canonical foreign key to typed actions.
- 24 Telegram hardcoded routed action IDs.
- 140 route records at the audited revision.

The current shared planner routed only 56 of its own 123 English examples to the expected action (45.5%) and had zero Hebrew examples. Existing Telegram parity output is not reliable because it treats intent examples/context tags as executable parity.

## Product invariants

1. One executable capability catalog. Old action IDs, Helper names, UI IDs, and route IDs become aliases or generated mappings.
2. One transport-neutral turn orchestrator. Channel adapters may format but not decide permissions or business behavior.
3. Server-resolved identity and immutable scope. Text/model/body fields never grant authority.
4. Reads never fall through to intake or writes. Unknown/ambiguous turns clarify or return no match.
5. Model output is an untrusted plan proposal validated against the actor-filtered manifest.
6. Every write has explicit effect class, handler, scope, idempotency, result, audit, and undo/correction behavior.
7. Shared memory means a shared service and policy-controlled namespaces, not shared transcripts.
8. Current domain facts come from domain queries. Memory is for preferences, stable facts, summaries, decisions, and working references.
9. Public lead surfaces use a separate public capability profile and ephemeral memory namespace.
10. Raw CLI, shell, deployment, migration, secret, credential, and unrestricted diagnostics remain outside user-facing assistant tools.

## Definition of Ready

Before implementation:

- current `master`, branch, dirty files, active packets/jobs, and deployments are refreshed;
- raw intake and dated requirement register exist;
- file ownership and lane dependencies are accepted;
- current database schema is compared against the migration draft using a real Postgres preflight;
- no unowned decisions remain for identity, scope, public-agent separation, memory namespace, effect classes, or exact question semantics;
- live/external actions remain disabled.

## Definition of Done

Done requires all of the following, not merely code generation or unit tests:

- canonical runtime handles both private Telegram profiles;
- exact question query works in English and Hebrew with zero domain writes;
- durable scoped memory/preferences survive restart and can be viewed, corrected, and forgotten;
- capability compiler reports 100% handled-or-intentionally-excluded controls and routes;
- profile manifests prove Rabbi/public isolation;
- high-risk approvals resist tampering, replay, expiry, and wrong-user callbacks;
- queue/idempotency/chaos tests pass;
- legacy paths are disabled only after shadow parity and rollback readiness;
- source changes are committed/pushed;
- each intended Railway target runs the correct version and reports a fresh heartbeat;
- separately approved live read-only smokes pass for both bots;
- no secrets/private payloads appear in repository proof or structured logs.
