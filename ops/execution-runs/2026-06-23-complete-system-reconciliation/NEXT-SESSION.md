# Next Session

Current run: `2026-06-23-complete-system-reconciliation`

Branch:
`codex/issue-8-complete-system-reconciliation`

Worktree:
`C:\Users\User\Documents\Codex\2026-06-23\goal-c-users-user-downloads-bna\work\bna-reconciliation`

Open requirements:

- `REQ-20260623-209`: blocked on approved external readback/backfill gates.
- `REQ-20260623-210`: in progress but approval-gated; stable display ID, prompt lifecycle bridge,
  GitHub/ChatGPT source adapter, and canonical intake service/persistence
  packet plus local persistence readback and watchdog contract slices are
  verified. Local synthetic E2E now covers canonical intake/readback, local
  memory persistence projects parsed entity rows, local prompt auto-resume
  planning is covered, and the raw-intake watchdog guards the auto-resume
  contract. Operations source/audit readback tabs now expose linked raw-intake
  detail locally. The local Postgres persistence/readback adapter and no-write
  `--postgres-plan` preview are implemented. A guarded dry-run-first Postgres
  operator CLI is now available for approved readback/apply gates. A dry-run
  production closeout gate now checks branch/run/dirty-state readiness before
  approved deploy/live verification, and it supports explicit clean detached
  release-candidate validation via `--allow-detached --remote-branch`.
  Release-gate and return-packet dirty-state reporting now preserve Git
  porcelain leading whitespace, so unstaged changes are not misreported as
  staged. Return-packet Agent Work rows now use the execution run's validated
  checkpoint head instead of the transient packet-generation HEAD.
  The return packet now includes a redacted external gate readiness summary
  with database/Railway/Drive readiness counts, blockers, safety flags, and the
  next approved-command plan without rendering secret/config variable names in
  the redacted handoff.
  The return packet also reports branch ahead/behind/local-only commit counts,
  exact resume commands, and private `.runtime` packet files as gitignored/not
  pushed. It now distinguishes the current branch head from the validated Agent
  Work commit basis in system truth and Agent Work rows.
  Source truth and the return packet now recognize GitHub Issue #7/#8 dry-run
  intake evidence as present while keeping persistence/acknowledgement gated.
  The return packet now includes OpenAI, Vimeo, Resend, Stripe, and Rabbi
  Telegram readiness by configured/missing variable state only, without
  external reads or secret values.
  Remaining production database apply, deploy, and live verification work
  remain open and must not be advertised as an unblocked executable batch until
  the required external gates are configured and explicitly approved.
  A redacted external readback/backfill gate now reports database, Railway, and
  Drive readiness by configured state only.
- `REQ-20260623-211`: complete; `npm run bna:return-packet` now regenerates the
  ignored private ChatGPT return packet and the tracked redacted repo summary
  from current run evidence, with `latest.json` kept aligned to the active run
  metadata before handoff.

Next exact commands for continuation:

```powershell
git fetch origin
git switch codex/issue-8-complete-system-reconciliation
git pull --ff-only origin codex/issue-8-complete-system-reconciliation
npm run bna:run:resume
npm run bna:run:blockers
npm run bna:return-packet -- --json
```

Completed implementation slice:

- Shared canonical display ID helper.
- Source-aware parser/protocol/goal-memory IDs.
- Operations-timezone display date handling for timestamps.
- Regression tests for same-day source collisions, task/ticket prefix
  collisions, and Jerusalem date rendering.
- Prompt lifecycle bridge for `pass`/`passed`/`sealed_pass` package closeout
  through canonical parent `completed` status.
- GitHub issue/PR and ChatGPT export source provider/kind normalization,
  including GitHub dry-run intake alignment.
- Canonical intake service entrypoint that builds one source/parse/parent
  prompt/persistence-ready packet for adapters and contract scripts.
- Local canonical persistence memory adapter with idempotent apply/readback by
  raw intake, parse run, or parent prompt locator.
- Raw-intake watchdog contract checks for canonical service/readback and
  adapter/script drift.
- Local platform synthetic E2E wired through canonical intake service/readback
  with an updated no-external-write artifact.
- Local parsed entity projection for decisions, tasks, calendar, content,
  community, integration, notes, and unresolved review rows.
- Local prompt auto-resume planner for resolved Decisions, all-terminal child
  outcomes, and stale heartbeats routed to `needs_decision`.
- Raw-intake watchdog contract guard for the prompt auto-resume lifecycle
  planner/apply helper.
- Operations Intake source/audit tabs backed by parse-run detail readback and
  linked raw-intake records.
- Additive canonical Postgres persistence/readback adapter for raw intake,
  stable parse runs, parent prompts, parse items, and parsed entities, guarded
  by injected-client apply and a no-write `--postgres-plan` preview.
- Guarded canonical Postgres operator CLI exposed as
  `npm run bna:intake:postgres`, with redacted dry-run output and explicit
  readback/apply confirmation gates.
- Dry-run production closeout gate exposed as `npm run bna:release-gate`, with
  branch, pushed HEAD, dirty worktree, required script, run metadata, and
  deploy/live approval checks, plus explicit clean detached release-candidate
  validation support.
- Redacted external readback/backfill gate exposed as
  `npm run bna:external-readback-gate`, with explicit readback/backfill
  confirmation gates and no external reads or writes in dry-run mode.
- Reproducible ChatGPT return packet generator exposed as
  `npm run bna:return-packet`, writing private ignored `.runtime/` packet files
  plus the redacted repo packet.
- Execution-run queue hardening now separates approval-gated in-progress rows
  from unblocked executable batches in `bna:run:next`, `bna:run:resume`, and
  `bna:run:blockers`.
- The ChatGPT return packet now uses the same executable-batch rules for
  `NEXT AUTOMATIC ACTION` and reports no automatic package while the remaining
  closeout work is approval-gated.
- The production closeout gate and return-packet system-truth report now
  preserve Git porcelain leading whitespace and report the current mixed
  worktree as unstaged/untracked dirty state, not staged deploy-ready work.
- Return-packet Agent Work rows are anchored to
  `git_refs.last_validated_head`; the current validated checkpoint is
  `68649b1a345446a413b567f708a39708adbccfa9`.
- Return-packet external gate summary is backed by the same dry-run external
  readback gate logic and reports no external read, production mutation, safe
  apply, deploy, or secret values.
- Return-packet resume/private-file summary reports exact continuation
  commands and confirms the private `.runtime` packet files are gitignored and
  not pushed.

Follow-on implementation scope:

- Approved external readback/backfill gate setup for database, Railway service
  metadata, and Drive targets.
- Approved production database apply/readback using the guarded canonical
  Postgres operator CLI after explicit gate approval.
- Deploy of the app-visible/schema changes after explicit deployment approval
  and a clean release-gate report from a deploy-safe worktree.
- Live read-only verification after deploy and approved credentials/service
  selection, using the release-gate confirmation path.

Do not deploy, delete worktrees, rewrite Git history, apply production backfill,
send messages, upload to Vimeo, or charge cards without explicit gates.
