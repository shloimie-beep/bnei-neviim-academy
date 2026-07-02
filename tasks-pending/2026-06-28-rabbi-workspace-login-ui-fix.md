# Rabbi Workspace Login And UI Fix - 2026-06-28

## Source

Raw intake: `RAW-20260628-002`
Source path: `raw-input/RAW-20260628-002-rabbi-workspace-login-ui-fix.md`
Prior audit: `tasks-pending/2026-06-28-rabbi-scheller-account-ui-audit.md`

## Requirement Register

| ID | Requirement | Workspace/project | Owner | Status | Acceptance criteria | Evidence | Verification | Blocker / next action |
|---|---|---|---|---|---|---|---|---|
| REQ-20260628-002 | Configure/verify Shloimie's scoped workspace-admin login path for Rabbi Scheller's workspace without using super-admin view. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Username `SHLOIMIE` maps to scoped workspace admin, Rabbi owner credentials remain separate, login destination opens scoped workspace dashboard, and raw password is not stored in tracked files. | Railway production now has `ONE_TIME_ADMIN_*` and `SHLOIMIE_ONE_TIME_*`; `server.js` supports same-visible-username role disambiguation and role-qualified Operations sessions; `public/operations-login.html` follows server redirect. Bundle deployed in Railway deployment `836221d0-c75e-4499-b634-8fd4a80469c3`. | PASS `node --check server.js`; PASS focused auth/navigation tests 61/61; PASS portal chooser local smoke; PASS live scoped login report `ops/live-smokes/2026-06-28T11-07-52.801Z-shloimie-one-time-scoped-login-smoke.md`. | None for Shloimie admin login. |
| REQ-20260628-003 | Preserve Rabbi Scheller as workspace owner while Shloimie can inspect as workspace admin. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Server identity model distinguishes owner vs workspace admin/legacy manager, UI role labels are correct, and tests prove no platform/super-admin capabilities leak into provider workspace roles. | `src/lib/bna/one-time-role-model.js`, `src/lib/bna/one-time-drive-brief.js`, and `server.js` keep Rabbi Elie Scheller as owner in the role model while Shloimie is `workspace_admin` / `one_time_admin`; legacy manager env remains compatibility-only; role model is deployed. | PASS `node --test tests/one-time-role-auth-model.test.js ...` focused suite; PASS live Shloimie readback as `one_time_admin` with settings access; PASS live app smoke. | Separate Rabbi owner login credentials are still not configured because no separate owner password was supplied. |
| REQ-20260628-004 | Fix the Rabbi-facing front-end polish issues found in the audit. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | Done | Provider sections are evenly displayed, mobile helper overlay does not cover primary content/notices, obvious buttons navigate or show honest disabled states, and local responsive browser smokes pass. | `public/provider.html` uses fixed responsive nav columns and extra bottom spacing; `public/js/bna-bot-widget.js` reduces the mobile public helper launcher to an icon button; `public/operations.html` hides the closed helper panel from hit testing/visibility and labels `one_time_admin` as Workspace Admin. Action coverage artifacts refreshed and bundle deployed. | PASS provider navigation, Operations navigation, API Usage, and portal chooser local Playwright smokes; PASS `npm run watchdog:actions`; PASS action coverage/parity contract tests; PASS live app/Rabbi landing/workspace taxonomy smokes. | None. |

## Agent Task

| ID | Canonical key | Task | Owner | Visible lane | Status |
|---|---|---|---|---|---|
| TASK-20260628-002 | rabbi-workspace-login-ui-fix | Implement Shloimie scoped admin login and Rabbi workspace UI polish fixes. | Codex | Agent Activity | done_live_verified |

## Existing Decisions / Open Questions Reused

| ID | Status | Why it matters |
|---|---|---|
| DEC-20260623-006 | Decided for Shloimie admin login | Shloimie admin secrets were installed in Railway and live-smoked. Separate Rabbi owner credentials remain an open owner handoff question. |
| Q-20260623-027 | Open | Rabbi Scheller's exact production owner login identity is still needed for real owner credential testing. |

## Sensitive Data Rule

The operator supplied a password in chat. It must not be committed to tracked
files or displayed in evidence. Use only redacted status/fingerprint metadata
when necessary.

## Local Verification - 2026-06-28

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/one-time-role-model.js`
- PASS `node --check src/lib/bna/one-time-drive-brief.js`
- PASS `node --test tests/one-time-role-auth-model.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/one-time-external-user-portal.test.js tests/one-time-drive-brief-ingestion.test.js tests/portal-operations-login-fallback.test.js tests/portal-agnostic-auth-contract.test.js tests/provider-api-usage-readiness.test.js tests/watchdog-action-registry.test.js` (77/77)
- PASS `node scripts/smoke-rabbi-scheller-provider-navigation-local.mjs`
- PASS `node scripts/smoke-rabbi-scheller-operations-navigation-local.mjs`
- PASS `node scripts/smoke-rabbi-scheller-provider-api-usage-local.mjs`
- PASS `node scripts/smoke-portal-agnostic-login-chooser-local.mjs`
- PASS `node --test tests/one-time-operations-ui-smoke.test.js`
- PASS `npm run watchdog:actions` with finding_count 0; latest report `ops/watchdog-audits/2026-06-28T09-27-watchdog-action-audit.md`
- PASS regenerated `ops/action-registry/one-time-action-coverage.*` and `ops/action-registry/universal-action-parity.*`
- PASS `ops/agent-task-ledger.jsonl` parse

## Remaining Live Setup

1. Configure Rabbi Scheller owner credentials separately as
   `ONE_TIME_OWNER_USERNAME/PASSWORD`.
2. Shloimie's scoped admin login is already live and verified in Railway
   deployment `836221d0-c75e-4499-b634-8fd4a80469c3`.
