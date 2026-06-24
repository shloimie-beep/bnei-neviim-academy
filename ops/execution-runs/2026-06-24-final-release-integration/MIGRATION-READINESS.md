# Migration Readiness - REQ-20260624-024

Generated: 2026-06-24T18:09:00+03:00

Scope: local release-candidate review only. No production database read, write,
schema apply, class backfill, deploy, send, charge, upload, DNS change,
credential change, or secret exposure was performed.

## Summary

`REQ-20260624-024` is a readiness gate, not an apply gate. The integrated branch
contains additive migration proposals and older Railway migration history, but
the final release must not apply production schema changes until a later gate
authorizes the exact target database, command, backup, rollback, and readback.

The current release can continue to local release-gate testing without applying
these migrations. The new assistant usage writer is wrapped in a transaction
savepoint, so a missing `bna_provider_api_usage_events` table records
`usage_recorded=false` instead of breaking chat. Stripe status, checkout
preview, and webhook preview are in-memory/safe-preview paths and do not require
Stripe billing persistence tables for this local batch.

## Active Candidate Migrations

| File | Purpose | Readiness | Risk notes |
|---|---|---|---|
| `migrations/20260624-provider-api-usage-persistence.sql` | Adds `bna_provider_api_usage_events`, indexes, and daily rollup view for assistant/provider API usage metadata. | Additive, idempotent, transaction-wrapped, no destructive markers found. | Enables persistent usage recording. If not applied, assistant chat still works and reports usage not recorded on missing table. |
| `migrations/parallel-20260624-stripe-billing-lifecycle.sql` | Adds Stripe billing customer/subscription/invoice/webhook/revenue/audit tables. | Additive and idempotent, no destructive markers found, not transaction-wrapped. | Schema only; does not authorize live billing, charges, webhook acceptance, or access grants. Wrap in a transaction during any approved apply. |
| `railway-migration-2026-06-21-one-time-transcript-privacy.sql` | Adds transcript privacy/review columns to `bna_class_sessions`. | Additive, `ADD COLUMN IF NOT EXISTS`, no destructive markers found, not transaction-wrapped. | Requires target table inventory first. Does not authorize class backfill or transcript publication. |
| `railway-migration-2026-06-21-one-time-trial-referral-config.sql` | Adds One Time trial/referral policy tables and seeds disabled policy/decision rows. | Mostly additive with `ON CONFLICT` seed upserts, not transaction-wrapped. | Seed/upsert changes are real data mutations. Apply only after target inventory confirms dependencies and owner approves policy seed behavior. |
| `railway-migration-2026-06-23-service-provider-studio.sql` | Adds Service Provider Studio tables and seed price/catalog settings. | Additive tables/indexes plus `ON CONFLICT` upsert seed data, not transaction-wrapped. | Requires `bna_projects` and content-job dependencies. Seed/upsert changes require backup and readback. |
| `migrations/parallel-20260619-core-001-platform-core.sql` | Broad platform/workspace/community/course/reward/domain core foundation. | Transaction-wrapped and mostly additive, but includes baseline data updates. | Broad migration. Do not blindly apply to production until target schema inventory proves exactly which parts are missing and tenant effects are reviewed. |

## Do Not Use

`migrate-railway.sql` is legacy bootstrap/history and contains `DROP TABLE`
markers. It is not an approved final-release migration path.

Older root `railway-migration-2026-06-05*`, `2026-06-15*`, `2026-06-16*`, and
`2026-06-17*` files are historical/baseline migrations from earlier work. They
must be treated as target-diff inputs only, not as a blanket apply list.

## Required Before Any Production Apply

1. Snapshot/backup:
   - Railway/Postgres backup or `pg_dump` of the exact target database.
   - Record backup timestamp, database label, and backup artifact ID without
     printing connection strings or secrets.
2. Target inventory:
   - Read-only table/column inventory for every candidate table/column.
   - Dependency checks for `bna_projects`, `bna_class_sessions`,
     `bna_product_programs`, `bna_content_jobs`, and workspace/project keys.
3. Dry run:
   - Run the exact migration list against a disposable clone/staging database
     with `ON_ERROR_STOP=1`.
   - Wrap non-transaction files in an outer transaction for the dry run.
4. Apply plan:
   - Exact ordered file list.
   - Exact environment/target.
   - Expected row/table changes.
   - Typed confirmation phrase from the operator if the gate requires it.
5. Rollback:
   - Primary rollback is restore from backup/snapshot.
   - Do not rely on destructive down migrations for production rollback.
   - Seed/upsert rollback requires pre-apply row snapshots or database restore.
6. Post-apply readback:
   - Verify table existence, expected columns, indexes, constraints, and zero
     secret-like values in migrated metadata.
   - Verify tenant/workspace isolation on new tables using scoped queries.

## Tenant And Privacy Notes

- Provider API usage persistence stores workspace-scoped metadata only; prompt,
  messages, response, tokens, passwords, authorization, and secret keys are
  blocked by code scrubbing and a metadata check constraint.
- Stripe billing persistence tables include `workspace_key`, `project_key`,
  `provider_id`, and `mode`; they must never store Stripe secret keys or webhook
  secrets.
- Studio tables carry `project_id` and `workspace_key` and must remain scoped by
  server authorization.
- Transcript privacy columns do not authorize public transcript release,
  student media publication, or class backfill.

## Blockers And Gates

- Production DB apply is not authorized in `REQ-20260624-024`.
- Live target inventory/readback has not been run in this batch.
- Stripe live billing, live checkout, webhook acceptance, and real funds remain
  blocked by existing external/payment gates.
- Class backfill remains blocked by `REQ-20260624-028` because current evidence
  has `safe_to_apply=false`, zero approved candidate jobs, and no row-level
  write plan.

## Recommendation

Proceed to the local release gate (`REQ-20260624-025`) without production schema
apply. If later deployment/readiness requires persistence tables, run a separate
approved DB gate with the exact ordered candidate list, starting with
credential-free target inventory and clone/staging dry run.
