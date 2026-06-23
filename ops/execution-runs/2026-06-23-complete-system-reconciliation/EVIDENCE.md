# Evidence

## Intake And Branch

- Raw pointer:
  `raw-input/RAW-20260623-002-complete-system-reconciliation-redacted-pointer.md`
- Handoff:
  `tasks-pending/2026-06-23-complete-system-reconciliation.md`
- Branch:
  `codex/issue-8-complete-system-reconciliation`
- Worktree:
  `C:\Users\User\Documents\Codex\2026-06-23\goal-c-users-user-downloads-bna\work\bna-reconciliation`
- Base:
  `a9528b2d9467174d76d4c25bfb028f9308f24b4f`

## Generated Reports

- `ops/system-audits/2026-06-23T10-46-07-456Z-system-truth.md`
- `ops/worktree-reconciliation/2026-06-23-worktree-cleanup-plan.md`
- `ops/source-truth/2026-06-23-source-truth.md`
- `ops/source-truth/2026-06-23T10-45-18-453Z-github-issue-7-dry-run.md`
- `ops/source-truth/2026-06-23T10-45-18-359Z-github-issue-8-dry-run.md`
- `ops/drive-audits/2026-06-23-class-intake-complete-truth.md`
- `ops/drive-audits/2026-06-23-guarded-progress-question-backfill.md`
- `ops/audits/2026-06-23-one-time-asset-drive-and-render-truth.md`
- `ops/ui-audits/2026-06-23-ui-source-coverage.md`
- `ops/ui-audits/2026-06-23-one-time-asset-contact-sheet/README.md`
- `ops/watchdog-audits/2026-06-23T10-52-watchdog-action-audit.md`
- `ops/watchdog-audits/2026-06-23T10-52-watchdog-security-routes.md`
- `ops/return-packets/2026-06-23-complete-system-reality-redacted.md`

## Implementation Evidence

- `src/platform/ingestion/canonical-ids.js`
- `src/platform/ingestion/intake-source.js`
- `src/platform/ingestion/intake-service.js`
- `src/platform/ingestion/intake-persistence.js`
- `src/lib/bna/intake-schema.js`
- `src/lib/bna/ramble-protocol.js`
- `src/lib/bna/intake-parser.js`
- `src/lib/bna/goal-memory.js`
- `src/platform/ingestion/prompt-queue.js`
- `scripts/intake-github.mjs`
- `scripts/ramble-intake-contract.mjs`
- `scripts/watchdog-raw-intake-drift.mjs`
- `scripts/platform-synthetic-e2e.mjs`
- `docs/product/ramble-queue-contract.md`
- `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/synthetic-e2e-acceptance.json`
- `tests/ingestion/canonical-ids.test.js`
- `tests/intake-parser.test.js`
- `tests/ingestion/w3-parser-queue.test.js`
- `tests/ingestion/w3-intake-source.test.js`
- `tests/ingestion/w3-intake-service.test.js`
- `tests/ingestion/w3-intake-persistence.test.js`
- `tests/watchdog-raw-intake-drift.test.js`
- `tests/one-time-synthetic-pilot.test.js`
- `tests/system-truth-scripts.test.js`

Stable display ID slice verified:

- Same-day source disambiguation for parser task IDs.
- Task/ticket uniqueness despite shared `TASK` display prefix.
- Timestamped intake display dates rendered in the operations timezone.

Prompt lifecycle slice verified:

- Incoming `pass`, `passed`, and `sealed_pass` package statuses normalize to
  parent `completed`.
- Child `passed` outcomes count as terminal in ramble status.
- All-terminal child outcomes prompt parent closeout with evidence.

Source adapter slice verified:

- GitHub issue/PR inputs normalize as `github` provider records.
- ChatGPT exports normalize as `chatgpt` provider records.
- GitHub intake dry-runs no longer identify issue packets as `local_file`.

Canonical intake service slice verified:

- Adapters can enter through one `buildCanonicalIntakePacket` service.
- Packets include source record, platform parse, parent prompt, and
  persistence-ready raw intake / parse-run / parse-item records.
- GitHub dry-runs and the ramble contract script use the service without
  external writes.

Canonical persistence readback slice verified:

- Local memory apply/readback upserts canonical raw intake, parse run, parse
  items, and parent prompt records idempotently.
- Readback can locate linked rows by raw intake ID or parent prompt ID.
- `scripts/ramble-intake-contract.mjs --memory-readback` exercises the adapter
  without production database writes.

Canonical watchdog contract slice verified:

- `npm run watchdog:raw` checks canonical service/readback, GitHub adapter, and
  ramble contract script drift markers.
- Focused watchdog test confirms all canonical contract checks pass.
- Existing medium raw provenance findings remain non-failing and unrelated to
  this service/readback contract.

Canonical synthetic E2E slice verified:

- `npm run platform:synthetic-e2e` now exercises the canonical intake service
  and local memory readback adapter.
- The synthetic artifact records packet/readback contracts, parse run/item
  counts, and no external writes.
- Static synthetic pilot coverage guards the runner against drifting back to a
  hand-built source/parse/prompt path.

## Privacy Boundary

- The full Goal Mode prompt is not committed; only a local pointer/hash is.
- Secret readiness reports include variable state and source labels only.
- Drive IDs/URLs are kept out of the redacted repo packet.
- No production database mutation, external send, Vimeo upload, charge, deploy,
  history rewrite, or worktree deletion was performed.
