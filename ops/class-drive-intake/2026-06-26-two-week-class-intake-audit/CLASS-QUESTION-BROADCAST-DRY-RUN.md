# Class Question Broadcast Dry Run

Generated: 2026-06-28T12:30:00+03:00

Source: `RAW-20260628-003`

Mode: dry-run evidence only. No production mutation, Drive write, class
backfill, raw transcript export, AI call, paid retranscription, send, publish,
charge/access grant, credential/account/DNS change, broad Drive sync, or
`--apply` run was performed.

## Owner Rule

Unmatched or ambiguous student-question matches should become class questions
visible to every active student portal. They must not be assigned as personal
questions to a possibly wrong student.

## Result

The guarded 21-83 backfill planner now resolves the previous student-question
matching blocker by emitting class-question broadcast rows.

- Dry-run safety: `safe_to_apply=true` if a separate exact apply path is later
  approved.
- Production writes performed now: `0`.
- Expected future writes in dry-run: 917 `bna_accountability_events` rows.
- Existing rows skipped: 2.
- Matched student-question inserts: 5.
- Class-question broadcast inserts: 912.
- Class-question fallback candidates: 114.
- Blocking ambiguities: 0.

Class-question fallback jobs:

`25, 26, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
48, 49, 50, 51, 52, 53, 54, 58`

Detailed row-level keys and redacted hashes are in `BACKFILL-RECOMMENDATION.json`.

## Commands

```powershell
node --test tests/class-drive-intake-reconcile.test.js
node scripts/class-drive-intake-reconcile.cjs backfill --jobs 21-83 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit
node scripts/class-drive-intake-reconcile.cjs backfill --write --jobs 21-83 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit
```

## Evidence

- `BACKFILL-DRY-RUN.md`
- `BACKFILL-RECOMMENDATION.json`
- `PIPELINE-CENSUS.md`
- `SOURCE-COVERAGE.md`

## Remaining Blocker

Production application remains blocked by `DEC-20260626-101`. The current
script's apply lane still refuses mutation by design, so a future production
apply requires a separately approved exact implementation/apply path plus
snapshot/rollback evidence.
