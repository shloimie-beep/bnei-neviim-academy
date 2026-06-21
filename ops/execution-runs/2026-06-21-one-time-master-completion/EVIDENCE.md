# Evidence

## Batch 0

- Source pointer:
  `raw-input/RAW-20260621-001-one-time-master-completion-goal.md`
- Prior run preserved:
  `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`
- Successor run:
  `ops/execution-runs/2026-06-21-one-time-master-completion/`
- Preflight live smoke:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`
- Preflight live smoke machine output:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.json`
- Successor-run validation:
  `npm run bna:run:validate` passed on 2026-06-21T11:11:03+03:00.
- Secret audit:
  `node scripts/audit-secrets.mjs` passed with 0 tracked secret-risk files.
- Diff hygiene:
  `git diff --check` passed with LF/CRLF warnings only.

## Batch 1

- Protocol docs and templates:
  `AGENTS.md`, `BNA-START-HERE.md`, `docs/BNA-RAMBLE-TO-DONE.md`,
  `templates/BNA-CODEX-IMPLEMENTATION-PROMPT.md`,
  `templates/BNA-CODEX-VERIFICATION-PROMPT.md`,
  `tasks-pending/_template-ramble-intake.md`,
  `tasks-pending/_template-goal-mode-correction-output.md`, and
  `tasks-pending/2026-06-16-prompt-intake-register.md`.
- Execution runner and schema:
  `scripts/bna-execution-run.mjs`,
  `ops/execution-runs/requirements.schema.json`, and
  `tests/bna-execution-run.test.js`.
- Intake schema:
  `src/lib/bna/intake-schema.js`.
- Task lifecycle pointer:
  `TASKS.md`.

<!-- batch-2:start -->
## Batch 2 Evidence

- Reconciliation Markdown: `ops/one-time-mishnah/master-backlog-reconciliation.md`
- Reconciliation JSON: `ops/one-time-mishnah/master-backlog-reconciliation.json`
- Current source rows: 99
- Legacy statement rows preserved: 1164
- Visible Tasks created: 0
- Visible Decisions created: 0
- Production mutations: 0
- External writes: 0
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 Evidence

- Live Task/Decision production census:
  `ops/one-time-mishnah/task-decision-production-census.md`
- Live Task/Decision production census machine output:
  `ops/one-time-mishnah/task-decision-production-census.json`
- Reversible cleanup dry-run/apply report:
  `ops/one-time-mishnah/task-decision-production-cleanup.md`
- Reversible cleanup machine output:
  `ops/one-time-mishnah/task-decision-production-cleanup.json`
- Applied cleanup summary:
  `ops/one-time-mishnah/task-decision-production-cleanup-applied-summary.md`
- Applied cleanup summary machine output:
  `ops/one-time-mishnah/task-decision-production-cleanup-applied-summary.json`

Live cleanup applied through existing authenticated Task APIs:

- Wave 1: 144 planned, 144 applied, 0 failed.
- Wave 2: 1 planned, 1 applied, 0 failed.
- Total applied: 145 reversible task-row actions.
- Action counts: 5 One Time re-scopes, 1 internal handoff quarantine, 139 duplicate archives.
- Hard deletes: 0.
- Parent/student/payment/communication record mutations: 0.
- Final isolation: 0 BNA records in One Time and 0 One Time records in BNA.
- Deployed commit: `f8a2fd62`
- Railway deployment: `89967278-38dc-49f3-a70d-4536c59f82f6`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- Focused Batch 3 live smoke:
  `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`
<!-- batch-3:end -->
