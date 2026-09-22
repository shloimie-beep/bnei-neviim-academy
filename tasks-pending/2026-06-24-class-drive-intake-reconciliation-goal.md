# Class/Drive Intake Reconciliation Goal - 2026-06-24

Raw source: `RAW-20260624-003`

Branch: `codex/closeout-class-drive-intake-20260624`

Base: `codex/clean-slate-integration-20260624` at `68f0b02f`

Goal: `BNA CLASS INTAKE - FIND EVERY UPLOAD, REPAIR PARSING, AND PREPARE GUARDED BACKFILL`

## Lane Rules

- This lane may inspect production DB, Railway metadata/log state, and Google Drive metadata/content only read-only under `READ_EXTERNAL_PRODUCTION_STATE`.
- This lane must not mutate production.
- This lane must not edit `server.js`, portal UI files, or central run/ledger/memory files.
- Shared wiring goes into `ops/class-drive-intake/2026-06-24-closeout/SHARED-PATCH.diff`.
- Backfill apply is reserved for the final integrator and requires `APPLY_GUARDED_CLASS_BACKFILL`.

## Requirement Register

| ID | Requirement | Status | Evidence / Next Action |
| --- | --- | --- | --- |
| `REQ-20260624-101` | Preserve raw source and create this lane register. | Done | Raw fallback record added at `raw-input/RAW-20260624-003-class-drive-intake-goal.md`; this register tracks lane status. |
| `REQ-20260624-102` | Build read-only pipeline census and per-stage diagnostics for all relevant class/media jobs, explicitly jobs 64-74 if present. | Done | `PIPELINE-CENSUS.json/md` generated. Readback classified 75 content jobs, all 64-74, plus 75 Drive orphan rows from 341 Drive files. |
| `REQ-20260624-103` | Verify/disprove suspected causes including 401, Drive auth/config, worker gaps, parser/apply gaps, alias ambiguity, wrong-table writes, omitted accountability, duplicates, generic parser, undeployed fixes, and stale statuses. | Done | Cause table in `PIPELINE-CENSUS.json/md`: 401 confirmed; Drive target/auth disproved; orphan Drive files confirmed; parser/apply gaps confirmed; generic parser confirmed; stale statuses confirmed; worker and deployment revision remain `UNKNOWN` with evidence. |
| `REQ-20260624-104` | Build dry-run-only guarded backfill with row-level plan, exclusions, counts, transaction boundaries, rollback, idempotency, and machine-readable recommendation. | Done | `BACKFILL-DRY-RUN.md` and `BACKFILL-RECOMMENDATION.json` generated. For guarded range 64-74, `safe_to_apply=false`, no approved candidate jobs, and no row-level writes are recommended. |
| `REQ-20260624-105` | Cover multi-student class sessions, score/progress, questions, linkage, ambiguity, duplicate idempotency, retries, visible failures, apply idempotency, accountability, read models, dry run, rollback. | Done | `tests/class-drive-intake-reconcile.test.js`, `tests/class-drive-intake-shared-patch.test.js`, and focused related tests passed 86/86. |
| `REQ-20260624-106` | Produce credential/auth readiness without printing secrets or raw Drive IDs. | Done | `AUTH-READINESS.md` generated. OAuth refresh-token path is ready; 21 Drive stage folders detected; evidence uses hashes/redacted refs only. |
| `REQ-20260624-107` | Repair architecture where shared wiring is required without editing shared files in this lane. | Done | `SHARED-PATCH.diff` now uses the real `activeStudentsForMixedRecordingParse` helper, keeps progress-only writes `contentBacked: false`, and includes idempotency guards; `tests/class-drive-intake-shared-patch.test.js` validates the handoff. Not applied in this lane by rule. |
| `REQ-20260624-108` | Run focused tests, source coverage, JSON checks, secret audit, and `git diff --check`. | Done | Focused tests, lane source coverage, JSON checks, secret audit, and `git diff --check` passed. The central `npm run bna:run:source-coverage` branch guard is documented as not applicable to this lane; lane coverage is in `SOURCE-COVERAGE.json/md`. |
| `REQ-20260624-109` | Commit and push branch. | Done | Branch pushed to `origin/codex/closeout-class-drive-intake-20260624`; pushed commit history on the branch is the commit evidence. |

## Evidence Targets

- `ops/class-drive-intake/2026-06-24-closeout/PIPELINE-CENSUS.json`
- `ops/class-drive-intake/2026-06-24-closeout/PIPELINE-CENSUS.md`
- `ops/class-drive-intake/2026-06-24-closeout/BACKFILL-RECOMMENDATION.json`
- `ops/class-drive-intake/2026-06-24-closeout/BACKFILL-DRY-RUN.md`
- `ops/class-drive-intake/2026-06-24-closeout/AUTH-READINESS.md`
- `ops/class-drive-intake/2026-06-24-closeout/SHARED-PATCH.diff`
- `ops/class-drive-intake/2026-06-24-closeout/SOURCE-COVERAGE.json`
- `ops/class-drive-intake/2026-06-24-closeout/SOURCE-COVERAGE.md`

## Current Blockers

- No production mutation is allowed in this lane.
- Guarded backfill for jobs 64-74 is not safe to apply from the dry-run evidence because no row-level repair candidates were produced for that range.
- The central execution-run source coverage command remains branch-guarded to `codex/clean-slate-integration-20260624`; this lane uses `SOURCE-COVERAGE.json/md` for source mapping instead of mutating central run files.
