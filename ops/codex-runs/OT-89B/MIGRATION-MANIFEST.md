# OT-89B MIGRATION-MANIFEST

Migration: `migrations/20260716-ot89b-onetime-support-consumer.sql`

Safety:

- Additive only.
- Creates OT-89B-scoped tables for nonces, events/tickets, history, attachment references, alert outbox, and decision tokens.
- Adds indexes only for OT-89B lookups and outbox retry scans.
- Does not drop, rename, truncate, backfill, or mutate existing BNA tables.
- Not applied to any live database during this run.

Tables:

- `bna_onetime_support_nonces`
- `bna_onetime_support_events`
- `bna_onetime_support_history`
- `bna_onetime_support_attachment_refs`
- `bna_onetime_support_alert_outbox`
- `bna_onetime_support_decision_tokens`
