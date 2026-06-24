# API Usage Schema

Generated for branch `codex/closeout-assistant-ramble-usage-20260624`.

## Canonical Interface

`src/lib/bna/provider-api-usage.js` now exports one workspace-scoped interface for current assistant work and the future provider bot:

- `normalizeProviderApiUsageEvent(input)`
- `providerApiUsageIdempotencyKey(input, event)`
- `createProviderApiUsageRecorder({ db, usageStore, writeEvent, environment })`
- `createProviderApiUsageStore({ db, tableName })`
- `recordProviderApiUsageEvent({ db, event, tableName })`
- `listProviderApiUsageEvents({ db, identity, workspaceKey, filters... })`
- `aggregateProviderApiUsageFromStore({ db, identity, workspaceKey, filters... })`
- `providerApiUsageEmptyState(workspaceKey)`

The recorder returns an honest not-recorded result when no sink is configured. It does not fabricate usage.

## Event Fields

| Field | Purpose |
| --- | --- |
| `idempotency_key` | Unique event key; explicit IDs are accepted, otherwise a deterministic hash is generated. |
| `workspace_key` | Required tenant/workspace scope. |
| `user_id`, `user_label` | Actor attribution without private prompt content. |
| `provider_key` | BNA/provider workspace or product-side provider key. |
| `model_provider_key` | Hosted model vendor key such as OpenAI or Kimi. |
| `model` | Model name when known. |
| `feature_key` | Feature, assistant surface, or agent name. |
| `bot_identifier` | Bot or runtime identifier. |
| `request_count` | Request count for aggregation. |
| `input_tokens`, `output_tokens`, `cached_tokens` | Token counts when the provider returns them. |
| `estimated_cost_usd` | Estimated cost only; views must label it estimated. |
| `actual_cost_usd` | Actual cost only when returned by a trusted billing source. |
| `latency_ms` | Request latency. |
| `success`, `error_category` | Success/failure and coarse error reason. |
| `timestamp`, `billing_period` | Occurrence time and `YYYY-MM` billing period. |
| `quota_key` | Optional quota/limit bucket. |
| `environment` | Runtime environment. |
| `request_correlation_id` | Request/run correlation. |
| `metadata` | Scrubbed metadata only. |

## Privacy Rules

The normalizer strips top-level prompt/message/secret-shaped metadata. The migration also rejects metadata keys named `prompt`, `messages`, `response`, `api_key`, `authorization`, `secret`, `token`, or `password`.

No tests or reports print provider keys, full prompts, private message bodies, or credentials.

## Tenant And Role Visibility

`canReadProviderApiUsage` allows platform/super-admin visibility. Workspace users can read only their own workspace when they have an owner/admin role or usage-read permission.

`buildProviderApiUsageListQuery` enforces tenant filters before building SQL. Cross-workspace reads throw `403`.

## Persistence

Migration proposal: `migrations/20260624-provider-api-usage-persistence.sql`

Table: `bna_provider_api_usage_events`

Rollup view: `bna_provider_api_usage_daily_rollups`

Indexes cover workspace/time, billing period, feature/bot, model provider/model, environment, and failures.

## Verification

Covered by `tests/provider-api-usage-readiness.test.js`:

- normalization and secret/prompt scrubbing
- empty state honesty
- future bot recorder interface
- idempotent DB persistence
- duplicate handling
- list filters, pagination, and date filters
- aggregation
- tenant isolation and role-based denial
- migration/schema assertions
