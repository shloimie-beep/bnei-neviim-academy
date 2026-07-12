# 01 — Target Architecture

## One kernel, multiple adapters

The canonical runtime entry point is a server-side `runAssistantTurn(request)` function. Every approved assistant surface creates the same transport-neutral request and receives the same typed plan/result envelope.

```text
Telegram / web / Operations / provider / parent / student
                         |
                  channel adapter
                         |
              normalized source envelope
                         |
              server-verified identity
                         |
               immutable ScopeContext
                         |
       conversation + permitted memory + object refs
                         |
             actor-filtered capability catalog
                         |
            deterministic scope/time resolution
                         |
        structured planner -> strict validation
                         |
       permission + effect + preview/approval gate
                         |
              query / draft / typed action
                         |
        result + audit + memory proposal + outbox
                         |
                  channel renderer
```

## Recommended repository seams

Add small modules; do not grow `server.js` or the Telegram monolith further.

```text
src/platform/assistant/runtime/index.js
src/platform/assistant/runtime/turn-orchestrator.js
src/platform/assistant/runtime/contracts.js
src/platform/assistant/runtime/identity-store.js
src/platform/assistant/runtime/scope-context.js
src/platform/assistant/runtime/conversation-store.js
src/platform/assistant/runtime/memory-store.js
src/platform/assistant/runtime/capability-catalog.js
src/platform/assistant/runtime/planner.js
src/platform/assistant/runtime/effect-policy.js
src/platform/assistant/runtime/approval-service.js
src/platform/assistant/runtime/executor.js
src/platform/assistant/runtime/result-envelope.js
src/platform/assistant/runtime/response-composer.js
src/platform/assistant/runtime/time-range.js
src/platform/assistant/runtime/retention.js
src/platform/assistant/runtime/tools/questions.js
src/platform/assistant/runtime/external-tools/web-search.js
src/platform/assistant/adapters/telegram.js
src/platform/assistant/adapters/http.js
src/routes/assistant-control-plane.js
scripts/telegram-assistant-worker.mjs
config/assistant-profiles/*.json
scripts/generate-assistant-capability-manifest.mjs
scripts/preflight-assistant-control-plane-migration.mjs
```

Use CommonJS for shared server modules unless the repo has migrated by implementation time. The ESM worker may use `createRequire`, matching current style.

## Transport-neutral request

The adapter may submit only channel facts and user content:

```json
{
  "request_id": "req_...",
  "channel": "telegram",
  "channel_instance_key": "telegram_shloimie_internal",
  "channel_message_id": "redacted-provider-message-ref",
  "reply_to_message_id": null,
  "conversation_key": null,
  "locale": "en",
  "timezone": "Asia/Jerusalem",
  "text": "Give me the questions from the last two weeks",
  "attachments": [],
  "client_metadata": {"event_type": "message"}
}
```

It must not accept authoritative role, workspace, project, approval, recipient, or execution flags. Identity is resolved from the signed channel instance plus verified external binding.

## Immutable ScopeContext

Every repository/tool method receives a non-null frozen context:

```json
{
  "identity_key": "identity_shloimie",
  "profile_key": "telegram_shloimie_super_admin",
  "role_key": "super_admin",
  "scope_mode": "all",
  "authorized_workspace_keys": ["bna", "rabbi_sheller_provider"],
  "authorized_project_keys": ["bna", "one_time_mishnah_class"],
  "active_workspace_key": "bna",
  "active_project_key": "bna",
  "relationship_scope": {},
  "locale": "en",
  "timezone": "Asia/Jerusalem",
  "channel_instance_key": "telegram_shloimie_internal"
}
```

The effective scope is the intersection of channel/profile maximum scope, verified human memberships/platform role, any short-lived agent delegation, and the requested target. A mismatch is denied before any domain query.

## Canonical data ownership

Use the existing `assistant_*` tables as the target model:

- `assistant_channels` and new channel instances/bindings own transport identity.
- `assistant_conversations`, `assistant_messages`, and `assistant_context_objects` own threads and working references.
- `assistant_action_plans`, `assistant_action_runs`, `assistant_previews`, and `assistant_approvals` own execution state.
- `assistant_delivery_outbox` and `assistant_dead_letters` own delivery reliability.
- new memory records/events own preferences and durable context.

Current `bna_assistant_*`, `bna_helper_*`, local `.runtime`, and daily Markdown writes become compatibility inputs during a bounded migration window. Do not dual-write indefinitely. Do not automatically import local Telegram Markdown because it can contain identifiers, private content, or stale instructions.

The current `assistant_*` schema is not production-complete. Its control-center queries already drift from declared columns. Apply a real migration and execute its queries against Postgres; fake query stubs are not proof.

## Capability ownership

`src/lib/actions/registry.js` remains authoritative for executable app mutations. A new canonical capability catalog wraps those actions and adds:

- read/query tools;
- navigation/deep-link capabilities;
- Helper-only tools that receive a real contract/handler;
- memory operations;
- approved external tools.

Legacy IDs are aliases, not separate definitions. Generated artifacts under `ops/assistant-capabilities/` are read-only outputs and CI checks their source hash.

## Private control-plane routes

Prefer signed worker routes separate from human/session routes:

```text
POST /api/internal/assistant/v1/envelopes/batch
POST /api/internal/assistant/v1/outbox/claim
POST /api/internal/assistant/v1/outbox/:key/sent
POST /api/internal/assistant/v1/outbox/:key/failed
POST /api/internal/assistant/v1/runtime/heartbeat
```

Authenticated application routes:

```text
POST /api/bna/assistant/control-plane/turn
POST /api/bna/assistant/control-plane/approve
POST /api/bna/assistant/control-plane/cancel
GET  /api/bna/assistant/control-plane/runs/:run_key
GET  /api/bna/assistant/capabilities
GET  /api/bna/assistant/memories
POST /api/bna/assistant/memories/:memory_key/confirm
POST /api/bna/assistant/memories/:memory_key/correct
DELETE /api/bna/assistant/memories/:memory_key
```

Compatibility wrappers may preserve existing response shapes while delegating to `runAssistantTurn`.

## Telegram worker responsibility

The new worker does only:

- validate configuration and expected bot identity;
- acquire the channel polling lease;
- poll/receive Telegram updates;
- durably insert envelopes before advancing cursor;
- download media into the canonical intake layer;
- claim/send outbox deliveries;
- render typed results, pagination, preview, approve/edit/cancel buttons, and secure deep links;
- report heartbeat/health and drain safely on shutdown.

It never calls LLMs, domain business endpoints, Codex, Railway, Zoom, WAPI, Drive, or databases outside the canonical assistant service directly.

Keep Academy and Rabbi as separate worker processes/tokens/channel instances. Do not combine them into one polling process.
