# OneTime UI Shell Repair - 2026-06-29

Source raw input: `RAW-20260629-005`

Execution run: `ops/execution-runs/2026-06-29-onetime-ui-shell-repair`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Goal mode: yes. Codex goal created for the OneTime Operations UI shell repair.

## Preflight

- Clean release worktree: `C:\Users\User\BNA-rabbi-onetime-comms-release`
- Branch: `codex/rabbi-onetime-comms-scope-release-20260629`
- Base at intake: `origin/master` / `e3dad482`
- Dirty root avoided: `C:\Users\User\BNA v2.0` has many unrelated edits.
- Initial `npm run bna:run:status`, `next`, and `blockers` failed in the clean
  worktree because its active pointer was stale and referenced missing
  transcript-run evidence paths. This UI run replaces the clean-worktree active
  pointer.

## Requirement Register

| ID | Requirement | Owner | Status | Acceptance / Evidence Target |
|---|---|---|---|---|
| `REQ-20260629-201` | Register raw packet, clean worktree, run, and source mapping. | Codex | Done | Raw source copied, register created, active run initialized, stale clean-worktree run pointer recorded. |
| `REQ-20260629-202` | Repair One Time Operations shell globally. | Codex | Done | Dashboard and module shell no longer have giant blank dark panels, duplicate headers, squeezed rails, or debug-style hierarchy. |
| `REQ-20260629-203` | Fix toolbar and tab hierarchy. | Codex | Done | Rabbi routes show one compact header, one module tab rail, no duplicate workspace chip, no dominant New Message/date/search row. |
| `REQ-20260629-204` | Fix dashboard overview route. | Codex | Done | Dashboard route uses readable useful cards and no floating card in a blank void. |
| `REQ-20260629-205` | Fix communications overview route. | Codex | Done | Communications tabs are clean, channel counts are not duplicated, import logs are demoted to history/audit, sends are gated. |
| `REQ-20260629-206` | Normalize buttons and action states. | Codex | Done | Controls map to Ready, Preview only, Needs Rabbi decision, Needs Shloimie setup, Blocked external setup, or Internal support only. |
| `REQ-20260629-207` | Scope and repair One Time brand CSS. | Codex | Done | Brand is present but scoped; BNA Operations is unaffected; dark/yellow styling does not break layout or contrast. |
| `REQ-20260629-208` | Audit visible One Time modules. | Codex | Done | Dashboard, Members, Program, Tasks, Automations, Integrations, Reporting, and Communications render sane shell at key widths. |
| `REQ-20260629-209` | Preserve workspace/data separation and no-GHL guardrails. | Codex | Done | Rabbi routes remain scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`; no BNA private data or GHL runtime is added. |
| `REQ-20260629-210` | Produce before/after evidence, tests, deployment or exact blocker. | Codex | Done | Screenshot/browser evidence, focused tests, watchdogs, ledger/changelog, and deploy/live smoke proof or blocker are recorded. |

## Canonical Agent Task

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260629-005` | `onetime-ui-shell-repair` | Execute OneTime Rabbi Operations UI shell repair packet. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260629-005` | `REQ-20260629-210` | agent_activity | completed_deployed_live_smoked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| `DEC-20260629-201` | Keep non-UI external actions blocked in this UI shell pass. | None for this UI shell run. | Codex / Shloimie | Deploy only the UI shell repair through the verified BNA Railway app target; keep sends, imports, Stripe/payment, DNS/account setup, WAPI import, external CRM/GHL, and secrets in separate approval-gated packets. | Approve a separate external-action packet later. | UI repair can be considered complete after deploy/live smoke; non-UI external actions remain out of scope. | None for this UI shell run. | External actions only; UI repair complete. | Decided |

## Routes To Audit

- `/operations?view=dashboard&section=overview&workspace=rabbi_sheller_provider`
- `/operations?view=communications&section=overview&workspace=rabbi_sheller_provider`
- `/operations?view=members&section=overview&workspace=rabbi_sheller_provider`
- `/operations?view=program&section=overview&workspace=rabbi_sheller_provider`
- `/operations?view=tasks&section=overview&workspace=rabbi_sheller_provider`
- `/operations?view=automations&section=overview&workspace=rabbi_sheller_provider`
- `/operations?view=integrations&section=overview&workspace=rabbi_sheller_provider`
- `/operations?view=reporting&section=overview&workspace=rabbi_sheller_provider`

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260629-201` | Done | Raw/register/run files listed above. | Raw/register/run metadata, memory, TASKS. | Initial run CLI executed and mismatch recorded. | None. |
| `REQ-20260629-202` - `REQ-20260629-210` | Done | Before/after browser evidence, focused tests, Railway deployment `3033033b-5275-49b5-89ac-15b76eecc232`, and live smoke report. | `public/operations.html`, `public/css/one-time-operations.css`, `public/css/one-time-shared-review.css`, `server.js`, tests, registries, evidence/run files. | Focused tests, watchdogs, secrets audit, deployment, DNS endpoint readback, and final live UI shell smoke passed. | None for this UI shell run. |



## Local Closeout Update - 2026-06-29T17:20:33+03:00

Local implementation and verification passed. `REQ-20260629-202` through `REQ-20260629-210` are blocked pending deploy/live Railway smoke proof, not marked Done. See `ops/execution-runs/2026-06-29-onetime-ui-shell-repair/EVIDENCE.md`, `TEST-RESULTS.md`, and `DEPLOYMENT.md`.

Next action: none for this UI shell run. Keep non-UI external actions in separate approval-gated packets.

## Release Handoff Update - 2026-06-29T17:33:00+03:00

The UI-only branch was committed and pushed:

- Branch: `codex/rabbi-onetime-comms-scope-release-20260629`
- Commit: `a6087dc019c3f146cab28eceafc8b7e629c59aec`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`

`npm run bna:release-gate -- --json` passed dry-run branch/push cleanliness checks. `npm run railway:doctor` authenticated, but deploy remains blocked because the Railway target guard resolved the target to `one-time-production` with no explicit service name/id and aborted. `REQ-20260629-202` through `REQ-20260629-210` remain blocked pending explicit Railway target plus live smoke proof.

## Final Closeout Update - 2026-06-29T17:55:00+03:00

`REQ-20260629-201` through `REQ-20260629-210` are Done. The explicit BNA Railway target was verified as `skillful-motivation` / `production` / `skillful-motivation`. The branch was deployed and live-smoked:

- Final commit: `54a5124d24131c4062ecc6cd645ca91249682288`
- Final Railway deployment: `3033033b-5275-49b5-89ac-15b76eecc232`
- Live smoke: `ops/live-smokes/2026-06-29-onetime-ui-shell-repair-live/report.md`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`

The first live smoke found a real DNS tasks endpoint 500 caused by `/api/bna/communications/:id` matching `dns-tasks`. The route is now numeric-only, the endpoint returns 200, and the final live UI shell smoke passed with 0 failed responses, request failures, console errors, or page errors.
