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

<!-- batch-4:start -->
## Batch 4 Evidence

Workspace user and role implementation is deployed and live-verified.

- Canonical role model:
  `src/lib/bna/one-time-role-model.js`
- Platform RBAC normalization and permissions:
  `src/platform/rbac/index.js`
- Server-side workspace membership, role audit, and scoped user APIs:
  `server.js`
- Operations scoped Users screen and real membership actions:
  `public/operations.html`
- Focused role/auth/UI tests:
  `tests/workspace-user-role-management.test.js`,
  `tests/one-time-role-auth-model.test.js`, and
  `tests/external-access-persistence-workflow.test.js`

Implemented behavior:

- Rabbi Ellie Scheller is the public-facing One Time owner/admin identity while
  legacy Rabbi name aliases remain accepted.
- Shloimie retains platform super-admin status and One Time workspace
  admin/manager access for intentional workspace switching.
- Canonical platform, workspace, and member roles are normalized and validated.
- The scoped Operations Users screen supports no-send Add Member / Invite User,
  Assign Role, Deactivate, Reactivate, reversible Remove Membership, and
  role-change audit readback.
- Server APIs enforce workspace scope and deny scoped managers platform-role
  assignment and cross-workspace membership mutation.
- Production external writes, sends, billing changes, and hard deletes: 0.

Deployment and live evidence:

- Implementation commit: `c8d93646`
- Pushed commit: `c8d93646`
- Deployed commit: `c8d93646`
- Railway deployment: `04fde749-fca1-4e54-a7c4-f2ece847847b`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`
- Focused workspace-user live smoke:
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`

Focused live smoke confirmed:

- `/api/bna/workspace-users?workspace_key=rabbi_sheller_provider` is readable.
- `/api/bna/workspace-users/role-audit?workspace_key=rabbi_sheller_provider`
  is readable.
- One Time users are scoped to `rabbi_sheller_provider`.
- Canonical roles are visible in live readback.
- `bna_main` does not leak into the One Time workspace-user readback.
- Operations Users HTML contains Add Member and role-audit controls.
- The old Provider Users dead placeholder is absent.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Evidence

Visible action coverage is implemented, pushed, deployed, and live-verified.

- One Time action coverage report:
  `ops/action-registry/one-time-action-coverage.md`
- One Time action coverage machine-readable registry:
  `ops/action-registry/one-time-action-coverage.json`
- Operations UI action-label/setup-path changes:
  `public/operations.html`
- Automated coverage tests:
  `tests/one-time-action-coverage.test.js`
- Implementation/pushed commit:
  `90da952bf3a0c57ce60b4532e193f869a677df47`
- Railway deployment:
  `9c31c21f-143e-46f3-b95d-2b458a848d9f`
- Deployed commit:
  `90da952bf3a0c57ce60b4532e193f869a677df47`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T10-10-19-366Z-live-app-smoke.md`
- Focused visible-action live smoke:
  `ops/live-smokes/2026-06-21T10-11-36-599Z-one-time-visible-actions-live-smoke.md`

Implemented behavior:

- Required controls are mapped to working handlers, setup paths, or gated
  blockers: Add Member, Invite User, Assign Role, Add Class, Add Session,
  Add Appointment, Add Task, Create Decision, Create Draft, Configure
  Integration, Test Connection, Preview Upload, Attach Vimeo Video, Approve,
  Publish, Unpublish, Archive, Restore, Retry, and View Evidence.
- Generic `showNotConfigured(...)` placeholder buttons were removed from Help,
  provider website import, and settings Test/Reset actions.
- The only remaining `showNotConfigured(...)` call is the disabled workspace
  switch denial for a user who lacks access.
- One Time appointment, Vimeo upload, and recording retry controls open exact
  setup prompts instead of silently failing.
- External-write controls remain no-send, preview-only, setup-only, disabled, or
  exact-approval gated.
- Production HTML was checked for the changed task/decision, One Time class,
  session, appointment, video setup, integration setup, and helper setup-path
  controls, and for removal of the old generic placeholder handlers.
<!-- batch-5:end -->
