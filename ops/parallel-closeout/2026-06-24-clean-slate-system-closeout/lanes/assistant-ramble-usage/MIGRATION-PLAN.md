# Migration Plan

Generated for branch `codex/closeout-assistant-ramble-usage-20260624`.

## Migration

Proposed file: `migrations/20260624-provider-api-usage-persistence.sql`

This lane did not apply the migration to production and did not mutate a production database.

## Apply Sequence

1. Review the migration against the integration branch after lane merge.
2. Apply to a local or staging Postgres database first.
3. Verify `bna_provider_api_usage_events` exists with `idempotency_key` unique and the no-private-metadata check.
4. Verify indexes and `bna_provider_api_usage_daily_rollups`.
5. Apply shared server wiring from `SHARED-PATCH.diff` only after the migration is present.
6. Run assistant chat/message persistence smokes against the nonproduction database.
7. Deploy after release approval.
8. Run live smoke with approved provider credentials and no-send safeguards.

## Rollback

Because the migration is additive, rollback is:

```sql
DROP VIEW IF EXISTS bna_provider_api_usage_daily_rollups;
DROP TABLE IF EXISTS bna_provider_api_usage_events;
```

Do not run rollback against production without explicit operator approval and an export/backup decision.

## Validation

Minimum post-apply checks:

- inserting the same `idempotency_key` twice records one event
- cross-workspace list attempts fail with `403`
- aggregation by feature, bot, and model provider matches inserted rows
- prompt and secret-shaped metadata is rejected or scrubbed
- usage dashboards show an honest empty state when no events exist

## Known Blockers

- Production migration is intentionally not applied in this lane.
- Live hosted-provider proof requires approved credentials and explicit live-smoke approval.
- Full chat/message persistence proof requires a local or staging database URL via `BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL`.
