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

Latest return-packet slice:

- The private and redacted return packets now report both the current branch
  head and the validated Agent Work commit basis.
- Agent Work rows include `current_branch_head`, `validated_commit`, and
  `commit_basis` in the JSON packet.

Latest source-truth slice:

- Source truth recognizes GitHub Issue #7 and Issue #8 dry-run intake evidence
  from `ops/source-truth/*github-issue-*-dry-run.*`.
- The issue dry-run evidence is marked no-write and secret-safe; production
  persistence remains gated.

Latest integration-readiness slice:

- The return packet now includes OpenAI, Vimeo, Resend, Stripe, and Rabbi
  Telegram readiness by configured/missing variable state only.
- The integration readiness section reports no external read and no secret
  values; production reads, sends, uploads, charges, deploys, and worker
  verification remain gated.
- The production closeout gate now uses the same shared integration-readiness
  summary and blocks deploy/live/final closeout when integration readiness is
  incomplete.

Latest external-readback closeout slice:

- The external readback gate now exports the sanitized scope/count summary used
  by the return packet.
- The production closeout gate reports database, Railway, and Drive readiness
  through that sanitized summary and blocks deploy/live/final closeout when
  any of those scopes is not ready.
- The release-gate next-command plan now includes the guarded external readback
  and backfill gate commands before deploy/live closeout commands.

## Implementation Evidence

- `server.js`
- `public/operations.html`
- `src/platform/ingestion/canonical-ids.js`
- `src/platform/ingestion/intake-source.js`
- `src/platform/ingestion/intake-service.js`
- `src/platform/ingestion/intake-persistence.js`
- `src/platform/ingestion/intake-postgres-persistence.js`
- `src/lib/bna/intake-schema.js`
- `src/lib/bna/ramble-protocol.js`
- `src/lib/bna/intake-parser.js`
- `src/lib/bna/goal-memory.js`
- `src/platform/ingestion/prompt-queue.js`
- `scripts/intake-github.mjs`
- `scripts/ramble-intake-contract.mjs`
- `scripts/canonical-intake-postgres.mjs`
- `scripts/bna-production-closeout-gate.mjs`
- `scripts/bna-external-readback-gate.mjs`
- `scripts/system-truth.mjs`
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
- `tests/canonical-intake-postgres-cli.test.js`
- `tests/bna-production-closeout-gate.test.js`
- `tests/bna-external-readback-gate.test.js`
- `tests/watchdog-raw-intake-drift.test.js`
- `tests/one-time-synthetic-pilot.test.js`
- `tests/service-provider-studio-browser-smoke.test.js`
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

Canonical parsed entity projection slice verified:

- Local memory persistence now projects parse items into stable
  `parsed_entities` rows linked to raw intake, parse run, parse item, and parent
  prompt IDs.
- Entity rows retain group/type, status, lane, workspace/project, owner,
  expected result, next action, source excerpt, and metadata where available.
- Focused coverage verifies decisions, tasks, calendar, content, community,
  integration, notes, and unresolved review rows with idempotent readback.
- The synthetic artifact records parsed entity totals and group counts without
  external writes.

Canonical auto-resume lifecycle slice verified:

- `src/platform/ingestion/prompt-queue.js` plans prompt lifecycle actions for
  resolved operator decisions, all-terminal child outcomes, stale heartbeats,
  and explicit blockers.
- `applyPromptAutoResumePlan()` only applies transitions that are already valid
  under the canonical parent prompt state machine.
- Focused coverage verifies decision resume, completed child closeout, and
  stale-heartbeat routing to `needs_decision`.
- The synthetic artifact records a local decision auto-resume apply with no
  external writes.
- The Studio browser smoke now scrolls to the mobile handoff section through a
  stable in-page query, avoiding the unrelated DOM-detach flake observed during
  full-suite verification.

Canonical auto-resume watchdog contract slice verified:

- `scripts/watchdog-raw-intake-drift.mjs` guards the prompt queue auto-resume
  planner/apply helper alongside intake service and readback contracts.
- Watchdog contract markers cover resolved-decision resume, stale-heartbeat
  routing, and the no-external-write marker.
- Focused watchdog/queue tests passed, 9/9, and `npm run watchdog:raw` passed
  with the existing non-failing medium raw provenance findings.

Canonical Operations source/audit readback slice verified:

- Parse-run detail readback now includes the linked `bna_raw_intake` row when
  the run metadata carries `raw_intake_stable_id`.
- Operations Intake has compact Source and Audit sections for raw stable ID,
  source channel/message, source excerpts, item distribution, review pressure,
  parser status, and no-external-write readback.
- Static intake workflow coverage pins the server detail enrichment and the
  new Operations sections.
- Focused parser/UI tests passed, 16/16, and the Operations inline scripts
  parsed successfully.

Canonical Postgres persistence/readback slice verified:

- Additive schema tables now cover canonical stable parse runs, parent prompts,
  and parsed entity projection without replacing the existing raw-intake,
  parse-run, parse-item, or review queue tables.
- Raw-intake source channels now accept the first-class provider set required
  for GitHub, ChatGPT, approved uploads, helper sources, email, WhatsApp, and
  WAPI.
- `src/platform/ingestion/intake-postgres-persistence.js` builds a no-write
  Postgres plan, applies only through an injected client, and reads back
  canonical rows by raw intake, parse run, or parent prompt IDs.
- `scripts/ramble-intake-contract.mjs --postgres-plan` emits a redacted
  production persistence preview without SQL values or live database writes.
- The raw-intake watchdog guards the Postgres adapter and plan flag.
- Focused persistence/parser/watchdog/system tests passed, 27/27, and
  `npm run watchdog:raw` passed with the existing non-failing medium raw
  provenance findings.

Canonical Postgres operator CLI slice verified:

- `scripts/canonical-intake-postgres.mjs` wraps the canonical Postgres adapter
  in a dry-run-first operator command for plan, readback, and approved apply
  paths.
- Dry-run output includes only statement names, counts, and canonical locators;
  it does not print database URLs, SQL text, or SQL values.
- Live readback requires `READ_CANONICAL_INTAKE_POSTGRES` plus
  `BNA_CANONICAL_INTAKE_POSTGRES_READBACK_APPROVED=approved`; apply requires
  `APPLY_CANONICAL_INTAKE_POSTGRES` plus
  `BNA_CANONICAL_INTAKE_POSTGRES_APPLY_APPROVED=approved`.
- Focused CLI/persistence/watchdog/system tests passed, 13/13, and
  `npm run watchdog:raw` passed with the operator CLI contract guarded.

Production closeout gate slice verified:

- `scripts/bna-production-closeout-gate.mjs` checks branch alignment, pushed
  HEAD, dirty worktree state, required npm scripts, active run metadata, and
  explicit deploy/live approval gates before production closeout.
- It supports explicit clean detached release-candidate validation with
  `--allow-detached --remote-branch`, requiring the detached HEAD to match the
  named pushed remote branch.
- Detached checkout mode without the explicit release-candidate flags remains
  blocked.
- The gate and return-packet system-truth report preserve leading whitespace in
  Git porcelain output so unstaged dirty files are not reported as staged in
  deploy-readiness JSON or handoff evidence.
- The return-packet Agent Work row is anchored to
  `git_refs.last_validated_head`, so it names the last pushed verified
  implementation checkpoint rather than the transient packet-generation HEAD.
- The return packet now embeds a redacted external gate summary built from the
  same dry-run gate logic as `npm run bna:external-readback-gate`; it reports
  database, Railway, and Drive readiness counts, approval blockers, next
  approved commands, and explicit no-read/no-write safety flags without
  rendering secret/config variable names in the redacted handoff.
- The return packet now reports branch ahead/behind/local-only commit counts,
  exact resume commands, and the private `.runtime` packet files as
  gitignored/not pushed, matching the handoff requirements for local-only
  commits, resume commands, and private files.
- Full `npm test` passed, 1101/1101, after the return-packet
  resume/private-file summary hardening; run validation, source coverage,
  stale-evidence detection, tracked secret audit, and redacted packet
  resume/private-file field checks also passed.
- Full `npm test` passed, 1101/1101, after the external gate return-packet
  summary hardening; run validation, source coverage, stale-evidence detection,
  tracked secret audit, and the expected-blocked external gate dry-run also
  passed.
- Full `npm test` passed, 1101/1101, after the validated Agent Work handoff
  hardening; source coverage, stale-evidence detection, and tracked secret
  audit checks also passed.
- The gate does not deploy, live-smoke, mutate a database, call Railway, or
  print secret values.
- The real local gate run confirmed the current branch HEAD is pushed but
  blocked deploy because this worktree still has mixed dirty/untracked files;
  after the porcelain whitespace fix it reports `staged: 0`.
- Focused release-gate tests passed, 6/6. Focused release-gate/system tests
  passed, 11/11. Stale-evidence, action watchdog, and security watchdog checks
  also passed.
- Full `npm test` passed, 1101/1101, after the dirty-state reporting fix.

Approval-gated queue hardening slice verified:

- `scripts/bna-execution-run.mjs` now separates approval-gated in-progress
  requirements from unblocked executable batches.
- `REQ-20260623-210` is explicitly marked `can_continue_without_operator:
  false` until the required DB/Railway/Drive targets and approval gates are
  configured.
- `npm run bna:run:next` reports no unblocked executable batch while showing
  approval-gated `REQ-20260623-210`.
- `npm run bna:run:blockers` reports both the blocked external readback
  requirement and the approval-gated production closeout work.
- The return packet generator derives `NEXT AUTOMATIC ACTION` from executable
  requirement state and now reports no unblocked automatic package when
  remaining work is approval-gated.
- Full `npm test` passed, 1099/1099.

External readback/backfill gate slice verified:

- `scripts/bna-external-readback-gate.mjs` reports database, Railway, and Drive
  readback/backfill readiness by configured state and source label only.
- The gate requires `READ_EXTERNAL_PRODUCTION_STATE` with
  `BNA_EXTERNAL_READBACK_APPROVED=approved` before readback, and
  `APPLY_GUARDED_CLASS_BACKFILL` with `BNA_BACKFILL_APPLY_APPROVED=approved`
  before guarded backfill apply.
- The real dry-run gate correctly blocked all three scopes in this environment
  because the required configured state is missing.
- No external read, production mutation, deploy, live smoke, or safe apply was
  performed.

Return packet reproducibility slice verified:

- `scripts/system-truth.mjs return-packet` builds the copy-ready ChatGPT return
  packet from current run, requirement, worktree, class-intake, asset, UI, and
  PR state.
- `npm run bna:return-packet` writes ignored private local files at
  `.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.md` and
  `.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.json`.
- The tracked redacted summary at
  `ops/return-packets/2026-06-23-complete-system-reality-redacted.md` is
  generated from the same report and redacts local home paths as
  `[local-user]`.
- Focused system-truth coverage passed, 4/4, and the tracked redacted packet
  was checked for full local home path leakage.
- The active run pointer was refreshed before handoff regeneration so the
  redacted packet reports the current run update time and pushed branch head.

## Privacy Boundary

- The full Goal Mode prompt is not committed; only a local pointer/hash is.
- Secret readiness reports include variable state and source labels only.
- Drive IDs/URLs are kept out of the redacted repo packet.
- The private ChatGPT return packet is generated under ignored `.runtime/`
  local state and is not committed.
- The tracked redacted return packet redacts local home paths.
- The Postgres operator CLI dry-run evidence excludes database URLs, SQL text,
  and SQL values.
- No production database mutation, external send, Vimeo upload, charge, deploy,
  history rewrite, or worktree deletion was performed.
