# 09 Mock Data And Test Identities

Status: ready.

Scope:

Create guarded dry-run seed and cleanup scripts for One Time UI review data.
Data must be TEST-prefixed, scoped to `rabbi_sheller_provider` /
`one_time_mishnah_class`, metadata-tagged with the run ID, reversible, and
paired with cleanup SQL.

No external sends, payments, WhatsApp messages, provider writes, or live access
grants may occur.

Expected scripts:

- `scripts/seed-one-time-ui-review-data.mjs`
- `scripts/cleanup-one-time-ui-review-data.mjs`

Expected package scripts:

- `one-time:seed:ui-review`
- `one-time:cleanup:ui-review`

Run dry-run first and write:

- `ops/one-time-mishnah/mock-data/2026-07-02-ui-review-seed-readback.md`
- `ops/one-time-mishnah/mock-data/2026-07-02-ui-review-seed-readback.json`
