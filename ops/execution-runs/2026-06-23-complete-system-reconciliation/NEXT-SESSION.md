# Next Session

Current run: `2026-06-23-complete-system-reconciliation`

Branch:
`codex/issue-8-complete-system-reconciliation`

Worktree:
`C:\Users\User\Documents\Codex\2026-06-23\goal-c-users-user-downloads-bna\work\bna-reconciliation`

Open requirements:

- `REQ-20260623-209`: blocked on approved external readback/backfill gates.
- `REQ-20260623-210`: in progress; stable display ID, prompt lifecycle bridge,
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
  approved deploy/live verification. Remaining approved production database
  apply, deploy, and live verification work remain open.

Next exact commands for continuation:

```powershell
git fetch origin
git switch codex/issue-8-complete-system-reconciliation
git pull --ff-only origin codex/issue-8-complete-system-reconciliation
npm run bna:run:resume
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
  deploy/live approval checks.

Follow-on implementation scope:

- Approved production database apply/readback using the guarded canonical
  Postgres operator CLI after explicit gate approval.
- Deploy of the app-visible/schema changes after explicit deployment approval
  and a clean release-gate report from a deploy-safe worktree.
- Live read-only verification after deploy and approved credentials/service
  selection, using the release-gate confirmation path.

Do not deploy, delete worktrees, rewrite Git history, apply production backfill,
send messages, upload to Vimeo, or charge cards without explicit gates.
