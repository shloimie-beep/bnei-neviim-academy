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
| `REQ-20260629-202` | Repair One Time Operations shell globally. | Codex | In progress | Dashboard and module shell no longer have giant blank dark panels, duplicate headers, squeezed rails, or debug-style hierarchy. |
| `REQ-20260629-203` | Fix toolbar and tab hierarchy. | Codex | Not started | Rabbi routes show one compact header, one module tab rail, no duplicate workspace chip, no dominant New Message/date/search row. |
| `REQ-20260629-204` | Fix dashboard overview route. | Codex | Not started | Dashboard route uses readable useful cards and no floating card in a blank void. |
| `REQ-20260629-205` | Fix communications overview route. | Codex | Not started | Communications tabs are clean, channel counts are not duplicated, import logs are demoted to history/audit, sends are gated. |
| `REQ-20260629-206` | Normalize buttons and action states. | Codex | Not started | Controls map to Ready, Preview only, Needs Rabbi decision, Needs Shloimie setup, Blocked external setup, or Internal support only. |
| `REQ-20260629-207` | Scope and repair One Time brand CSS. | Codex | Not started | Brand is present but scoped; BNA Operations is unaffected; dark/yellow styling does not break layout or contrast. |
| `REQ-20260629-208` | Audit visible One Time modules. | Codex | Not started | Dashboard, Members, Program, Tasks, Automations, Integrations, Reporting, and Communications render sane shell at key widths. |
| `REQ-20260629-209` | Preserve workspace/data separation and no-GHL guardrails. | Codex | Not started | Rabbi routes remain scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`; no BNA private data or GHL runtime is added. |
| `REQ-20260629-210` | Produce before/after evidence, tests, deployment or exact blocker. | Codex | Not started | Screenshot/browser evidence, focused tests, watchdogs, ledger/changelog, and deploy/live smoke proof or blocker are recorded. |

## Canonical Agent Task

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260629-005` | `onetime-ui-shell-repair` | Execute OneTime Rabbi Operations UI shell repair packet. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260629-005` | `REQ-20260629-201` | agent_activity | running |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| `DEC-20260629-201` | Keep sends, payments, DNS, Railway mutation, external CRM, imports, and account actions blocked in this UI shell pass. | Exact approval for any external write, send, charge, DNS/Railway mutation, import, or credential action. | Shloimie / account owner | Keep this pass UI-only and no-send/no-charge/no-import. | Approve a separate external-action packet later. | Codex can repair UI and run local/browser tests, but cannot send, charge, import, mutate DNS/Railway, or write external CRM data. | Provide a separate explicit approval packet naming the exact external action, account, recipient/domain if any, rollback, and confirmation phrase. | External actions only; UI repair remains executable. | Needs operator decision |

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
| `REQ-20260629-201` | Done | Raw/register/run files listed above. | Raw/register/run metadata, memory, TASKS. | Initial run CLI executed and mismatch recorded. | Implementation requirements remain open. |



## Local Closeout Update - 2026-06-29T17:20:33+03:00

Local implementation and verification passed. `REQ-20260629-202` through `REQ-20260629-210` are blocked pending deploy/live Railway smoke proof, not marked Done. See `ops/execution-runs/2026-06-29-onetime-ui-shell-repair/EVIDENCE.md`, `TEST-RESULTS.md`, and `DEPLOYMENT.md`.

Next action: Confirm the exact Railway production service name/id for `bneineviimacademy.org`, or release draft PR #51 through the approved normal production path, then deploy and run live smoke for the Rabbi One Time Operations routes.

## Release Handoff Update - 2026-06-29T17:33:00+03:00

The UI-only branch was committed and pushed:

- Branch: `codex/rabbi-onetime-comms-scope-release-20260629`
- Commit: `a6087dc019c3f146cab28eceafc8b7e629c59aec`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`

`npm run bna:release-gate -- --json` passed dry-run branch/push cleanliness checks. `npm run railway:doctor` authenticated, but deploy remains blocked because the Railway target guard resolved the target to `one-time-production` with no explicit service name/id and aborted. `REQ-20260629-202` through `REQ-20260629-210` remain blocked pending explicit Railway target plus live smoke proof.
