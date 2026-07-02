# Rabbi / One Time Launch Readiness - 2026-06-28

## Source

Raw intake: `RAW-20260628-003`
Source path: `raw-input/RAW-20260628-003-rabbi-onetime-launch-readiness.md`
Prior setup register: `tasks-pending/2026-06-28-rabbi-workspace-login-ui-fix.md`

## Requirement Register

| ID | Requirement | Workspace/project | Owner | Status | Acceptance criteria | Evidence | Verification | Blocker / next action |
|---|---|---|---|---|---|---|---|---|
| REQ-20260628-005 | Verify scoped Shloimie/Rabbi login readiness for the One Time workspace, without exposing credentials in tracked files. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Shloimie can log in as scoped Workspace Admin, Rabbi remains Workspace Owner, login opens the scoped workspace, and no raw password appears in tracked files or evidence. | Railway production now has `ONE_TIME_ADMIN_*` and `SHLOIMIE_ONE_TIME_*` configured; `server.js` handles same-username platform/scoped role disambiguation with role-qualified sessions; Railway deployment `836221d0-c75e-4499-b634-8fd4a80469c3` is live. | PASS `node --check server.js`; PASS focused auth/navigation tests 61/61; PASS live scoped login report `ops/live-smokes/2026-06-28T11-07-52.801Z-shloimie-one-time-scoped-login-smoke.md`; PASS redaction scan found no supplied credential pattern. | Separate Rabbi owner credential variables are still not configured because no separate owner password was supplied; this does not block Shloimie's scoped admin navigation. |
| REQ-20260628-006 | Audit and clean the One Time Operations CRM/category/subcategory structure so navigation feels professional and coherent. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Operations CRM categories/subcategories are named consistently, scoped to One Time, and avoid unrelated super-admin or stale internal handoff clutter. | `public/operations.html` now presents One Time taxonomy as Program / Launch, Members / CRM, Materials, Messages, Workflows, Setup, Usage, Workspace Settings; sub-tabs use Members, Email Leads, Parent Contacts, Support Messages, Membership, Tiers, Class Schedule, Materials, Payments / Access. | PASS focused Operations/Rabbi tests 77/77; PASS `npm run app:smoke:operations-workspace-taxonomy`; PASS local Operations navigation smoke. | None. |
| REQ-20260628-007 | Verify and fix visible button/action connectivity, even responsive layout, and linked workflows across the Rabbi/One Time UI. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Visible buttons have registry coverage or honest disabled states, navigation buttons distribute evenly, and local browser smokes pass across desktop/mobile. | Provider nav spacing, mobile helper footprint, closed helper overlay hit-testing, scoped toolbar actions, topbar status chips, and action coverage/parity artifacts were updated. | PASS `npm run watchdog:actions`; PASS one-time action coverage/parity generation; PASS four local browser smokes for provider navigation, Operations navigation, API Usage, and portal chooser. | None. |
| REQ-20260628-008 | Launch/deploy and live-smoke the app if credentials and deploy access are available. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Changed app is deployed, live URL responds, scoped login/Operations/provider smoke passes, and proof is recorded. | Railway deployment `836221d0-c75e-4499-b634-8fd4a80469c3` reached `SUCCESS`; live reports: `ops/live-smokes/2026-06-28T11-04-47-446Z-live-app-smoke.md`, `ops/live-smokes/2026-06-28T11-04-46-398Z-rabbi-onetime-landing-smoke.md`, `ops/live-smokes/2026-06-28T11-04-46-575Z-operations-workspace-taxonomy-live-smoke.md`, `ops/live-smokes/2026-06-28T11-07-52.801Z-shloimie-one-time-scoped-login-smoke.md`. | PASS `npm run railway:doctor`; PASS `npm run app:smoke`; PASS `npm run app:smoke:rabbi-onetime-landing`; PASS `npm run app:smoke:operations-workspace-taxonomy`; PASS scoped Shloimie login smoke. | None for Shloimie admin navigation. |

## Agent Task

| ID | Canonical key | Task | Owner | Visible lane | Status |
|---|---|---|---|---|---|
| TASK-20260628-003 | rabbi-onetime-launch-readiness | Finish local launch-readiness cleanup and deploy/live-smoke if available. | Codex | Agent Activity | done_live_verified |

## Guardrails

- No raw password, token, API key, or secret value in tracked files, logs, screenshots, or final response.
- No send/publish/charge/DNS/external-account mutation unless separately required and safe.
- Local-ready and live-ready are separate statuses.

## Closeout - 2026-06-28T12:33:00+03:00

Implemented and launched the app-visible cleanup. The deployed One Time
Operations experience now uses provider-specific CRM/program taxonomy, has
cleaner topbar/status actions, keeps buttons covered by the action registry,
and passed local browser/action checks plus live Railway smokes.

Remaining setup blocker: the real scoped Shloimie/Rabbi live login cannot be
truthfully claimed until the split One Time admin/owner credentials are placed
in the live environment through the secure secret workflow. The supplied
password remains redacted from tracked files and evidence.

## Closeout - 2026-06-28T14:08:38+03:00

Configured the Shloimie One Time admin variables in Railway production without
printing secret values, patched the auth collision where the same visible
username existed as both platform admin and scoped workspace admin, redeployed
deployment `836221d0-c75e-4499-b634-8fd4a80469c3`, and verified live scoped
login/navigation. Shloimie now logs in as `one_time_admin` for
`rabbi_sheller_provider` / `one_time_mishnah_class` and lands at
`/operations?workspace=rabbi_sheller_provider&view=dashboard`.
