# One Time Super Admin Mailbox And Provider Login

Raw ID: `RAW-20260707-002`

Created: 2026-07-07 Asia/Jerusalem

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Goal: Let Shloimie use Super Admin to clearly switch between BNA/Shloimie email
and Rabbi/One Time email, and provide a scoped admin-on-provider login path that
opens the same provider portal Rabbi sees without exposing Rabbi's password.

## Requirements

| ID | Requirement | Source IDs | Acceptance criteria | Status |
|---|---|---|---|---|
| `REQ-20260707-020` | Compile and validate the scoped Product Quality packet before product/auth edits. | `SRC-20260707-002-001` through `SRC-20260707-002-005` | PQC packet validates and names routes, state matrix, auth/privacy policy, registries, tests, and deploy gate. | Done |
| `REQ-20260707-021` | Add clear Super Admin email workspace inbox filter. | `SRC-20260707-002-001`, `SRC-20260707-002-002`, `SRC-20260707-002-003` | Operations Communications > Email shows an inbox selector/status for BNA/Shloimie vs Rabbi/One Time, filters rows/drafts by selected workspace/project, and labels the active inbox. | Done locally |
| `REQ-20260707-022` | Add scoped admin-on-provider login/open path. | `SRC-20260707-002-004`, `SRC-20260707-002-005` | Super Admin can open the One Time provider portal as an admin-on-provider session without printing/using Rabbi's password; provider portal shows the same sections/mailbox as Rabbi and a clear admin banner. | Done locally |
| `REQ-20260707-023` | Keep privacy, route/action registries, and tests aligned. | all | New routes/actions are registered; tests prove super admin-only access, provider scoping, no password exposure, no external send, and no bulk campaign behavior. | Done locally |
| `REQ-20260707-024` | Verify, publish, deploy, and live-smoke if app-visible code changes ship. | all | Focused tests/watchdogs pass; commit/push exists; deployment/live smoke passes or a precise blocker is recorded. | In progress |

## Decisions

| ID | Decision | Owner | Recommended option | Status |
|---|---|---|---|---|
| `DEC-20260707-020` | Admin-on-provider should be an audited scoped provider session, not a second copy of Rabbi's password. | Codex / Shloimie | Add a Super Admin-only endpoint/action that opens the provider portal with a provider-session cookie and visible admin banner. | Decided for implementation |

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| `REQ-20260707-020` | Done | `ops/prompt-packets/2026-07-07-onetime-admin-mailbox-access/00-admin-mailbox-filter-provider-login.product-quality.json`; validation artifacts in `ops/product-quality-compiler/validation/latest-product-quality-validation.md` and `.json` | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-07-onetime-admin-mailbox-access/00-admin-mailbox-filter-provider-login.product-quality.json` | none |
| `REQ-20260707-021` | Done locally | `public/operations.html` adds `EMAIL_INBOX_SCOPES`, literal inbox action IDs, `Now Viewing` label, and `emailInboxFilters()` for email reads/drafts/send requests. | PASS `node --test tests/one-time-admin-mailbox-access.test.js`; PASS local Playwright smoke `ops/live-smokes/2026-07-07-onetime-admin-mailbox-local-smoke.md` | deploy/live readback pending |
| `REQ-20260707-022` | Done locally | `server.js` adds `/api/bna/one-time/provider-session/start`; `public/provider.html` adds `ADMIN ON RABBI ACCOUNT` banner and return link. | PASS `node --check server.js`; PASS `node --test tests/one-time-admin-mailbox-access.test.js`; PASS local Playwright smoke | deploy/live readback pending |
| `REQ-20260707-023` | Done locally | `ops/action-registry.json`, `ops/route-registry.json`, `tests/one-time-admin-mailbox-access.test.js`, updated adjacent scoping tests. | PASS JSON registry parse; PASS `npm run watchdog:actions`; PASS `npm run watchdog:security`; PASS 26 focused tests | none |
| `REQ-20260707-024` | In progress | Local evidence: PQC, tests, action/security watchdogs, protocol drift watchdog, local browser smoke. | PASS `npm run watchdog:protocol-drift`; commit/push/deploy/live-smoke still pending. | Needs publish and live readback |
