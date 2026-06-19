# Dratler / One Time Workspace Scope Closeout - 2026-06-17

Status: passed

## Trigger

Fresh Telegram task `#1079` / agent job `#233` appeared during backlog
closeout. It clarified that Esti must be linked to Shloimie's Dratler Family
workspace, Shloimie must have the right scope in the Rabbi Sheller / One Time
workspace, the workspace switcher should show only the workspaces Shloimie is
in, and the duplicate Rabbi Sheller provider workspace should not appear.

## Implemented

- Added/verified Shloimie's owner membership on the canonical One Time workspace
  (`one_time_mishnah_class`, displayed as `rabbi_sheller_provider`).
- Scoped `/api/bna/workspace-directory` to the logged-in identity's memberships
  plus the platform pseudo-workspace, so unrelated parent household projects do
  not appear in the switcher.
- Hid duplicate provider project `provider_1` from the live workspace switcher
  by membership scoping instead of deleting historical data.
- Added a process-level once-wrapper for personal workspace seeding so the
  workspace directory does not re-run write-heavy seed logic on every read.
- Normalized student identity API output so legacy `family_app` storage aliases
  display as canonical `dratler_family`.
- Closed Telegram task `#1078` / job `#232` after linking Esti Dratler student
  `#53986` to Dratler Family household `#1312`, creating accountability event
  `#96`, creating clean goal-board item `#97`, and hiding duplicate goal item
  `#95`.
- Closed Telegram task `#1079` / job `#233` after live deploy/readback proof.

## Live Readback

Final `/api/bna/workspace-directory` readback returned exactly four switcher
entries:

| Category | Key | Project | Role | Access |
| --- | --- | --- | --- | --- |
| Super Admin | `platform` | n/a | `super_admin` | `owner` |
| School | `bna` | `bna` | `rabbi` | `admin` |
| Service Provider | `rabbi_sheller_provider` | `one_time_mishnah_class` | `owner` | `owner` |
| Family | `dratler_family` | `dratler_family` | `parent` | `owner` |

Additional readback:

- `duplicate_provider_visible: false`
- `visible_household_workspace_count: 0`
- `review_item_count: 0`
- Shloimie membership includes `one_time_mishnah_class:owner:owner`.
- Rabbi workspace membership readback returns `owner:owner`.
- Esti Dratler `#53986` is linked to household `#1312` / `dratler_family`.
- Esti workspace roles expose `dratler_family`, role `child`, access `member`.
- Esti tags preserve `external-accountability` and `not-bna-school`.

## Verification

- `npm test` passed `746/746`.
- Railway deployment `ca0075c2-5ce1-4a70-b6c8-e8d2c116adae` succeeded.
- `npm run railway:doctor` passed with deployment status `SUCCESS`.
- `npm run app:smoke` passed:
  `ops/live-smokes/2026-06-17T18-30-21-330Z-live-app-smoke.md`.
- `npm run task:reconcile` passed with active machine tasks `0` and actions
  `0`: `ops/system-audits/2026-06-17T18-31-06-470Z-task-queue-reconciler.md`.
- `npm run agent:fleet:status` reported observable Codex jobs `0`, active
  fallback `0`, and ready to claim `0`.

## Guardrails

- Used official app APIs for task/job closeout.
- No direct DB write, email send, social publish, payment charge, DNS write,
  credential copy, or external CRM write was performed.
- Existing historical duplicate provider/household records were not deleted;
  they are no longer shown in the operator workspace switcher unless the
  identity is actually a member.
