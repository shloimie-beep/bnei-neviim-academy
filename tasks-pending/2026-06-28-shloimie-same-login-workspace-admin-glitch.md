# Shloimie Same Login Workspace Admin Glitch - 2026-06-28

## Source

Raw intake: `RAW-20260628-004`
Source path: `raw-input/RAW-20260628-004-shloimie-same-login-workspace-admin-glitch.md`

## Requirement Register

| ID | Requirement | Workspace/project | Owner | Status | Acceptance criteria | Evidence | Verification | Blocker / next action |
|---|---|---|---|---|---|---|---|---|
| REQ-20260628-009 | Make Shloimie's same login work as both global agency/super-admin and One Time workspace admin without role collisions. | platform + `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Same username/password can authenticate and open either the platform role or the scoped One Time workspace-admin role intentionally. | `server.js` role-qualified sessions and preferred One Time admin role selection; `public/operations-login.html` submits sanitized `returnTo`; live report `ops/live-smokes/2026-06-28T12-01-35-891Z-shloimie-same-login-agency-onetime-smoke.md`. | `node --check server.js`; focused auth/navigation tests 72/72; direct live smoke proved default login returns `super_admin` and One Time return path returns `one_time_admin`. | Complete. |
| REQ-20260628-010 | Make One Time workspace entry show the provider workspace-admin experience, not only the super-admin configuration experience. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Clicking/opening the One Time workspace from Shloimie's login lands in the service-provider workspace view with admin settings access and no platform-only clutter. | Live scoped redirect `/operations?workspace=rabbi_sheller_provider&view=dashboard`; browser report `ops/live-smokes/2026-06-28T12-02-20-248Z-shloimie-scoped-login-browser-stability-smoke.md`; One Time UI smoke confirmed scoped modules and workspace view. | `node --test tests/one-time-operations-ui-smoke.test.js tests/operations-one-time-view-as.test.js`; Playwright browser smoke resolved `/api/bna/me` as `one_time_admin` in project `one_time_mishnah_class`. | Complete. |
| REQ-20260628-011 | Diagnose and fix the reported login/screen flicker. | Operations login + One Time workspace | Codex | Done | Login no longer loops/flickers, redirects are stable, and browser/live smoke confirms a stable landing route. | `public/operations-login.html` already-signed-in check now uses `/api/bna/me`; login POST includes `returnTo`; server returns role-specific `redirect_to`; browser stability report recorded stable landing after 2.5 seconds and no login form after scoped login. | `node --test tests/operations-pwa-login.test.js tests/portal-operations-login-fallback.test.js`; Playwright live browser stability smoke passed. | Complete. |
| REQ-20260628-012 | Update Railway credentials securely and live-smoke the corrected login/workspace navigation. | Railway production | Codex | Done | New password is set through Railway variables without being printed or tracked; deployment succeeds; live smokes prove login and workspace navigation. | Railway variables updated for platform Operations and One Time admin usernames/passwords with values redacted; deployment `451b4ab9-dc24-4512-8252-bf2f5aa77927` reached `SUCCESS`; live reports `ops/live-smokes/2026-06-28T12-00-01-990Z-live-app-smoke.md`, `ops/live-smokes/2026-06-28T12-00-00-278Z-rabbi-onetime-landing-smoke.md`, `ops/live-smokes/2026-06-28T12-00-00-287Z-operations-workspace-taxonomy-live-smoke.md`, `ops/live-smokes/2026-06-28T12-01-35-891Z-shloimie-same-login-agency-onetime-smoke.md`, and `ops/live-smokes/2026-06-28T12-02-20-248Z-shloimie-scoped-login-browser-stability-smoke.md`. | `npm run railway:doctor`; deployment polling to `SUCCESS`; `npm run app:smoke`; `npm run app:smoke:rabbi-onetime-landing`; `npm run app:smoke:operations-workspace-taxonomy`; direct same-login live smoke; Playwright scoped login stability smoke. | Complete. |

## Guardrails

- Password value is redacted from tracked files, logs, reports, and final answer.
- No external sends, billing/access grants, DNS changes, or unrelated account mutation.
- Rabbi Scheller remains workspace owner; Shloimie is workspace admin/member for One Time.

## Closeout

Shloimie's single login is now intentionally dual-context:

- Visiting `/operations-login.html` with no One Time return path logs in as the platform `super_admin`.
- Visiting `/operations-login.html?returnTo=%2Foperations%3Fworkspace%3Drabbi_sheller_provider%26view%3Ddashboard` logs in as scoped `one_time_admin` for Rabbi Scheller's One Time workspace.
- The login page no longer loses the workspace target on submit, and the already-signed-in check uses the unified `/api/bna/me` endpoint so scoped Operations sessions are recognized.
- Railway production deployment `451b4ab9-dc24-4512-8252-bf2f5aa77927` is live and verified.
