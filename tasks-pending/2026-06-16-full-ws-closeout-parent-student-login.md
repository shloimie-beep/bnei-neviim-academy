# Full WS01-WS11 Closeout Plus Parent-Managed Student Login

## Summary

Cycle:
`2026-06-16-full-ws-prompt-closeout-parent-student-login`

Sources:

- `C:\Users\User\Downloads\2026-06-16-full-ws-closeout-parent-student-login-codex-prompt.md`
- `C:\Users\User\.codex\attachments\a1e0641b-6e96-450e-b6ea-fb46b5ef62c1\pasted-text.txt`

Primary code-local requirement: replace the old student private-code-only
policy with parent-managed student username/password login while preserving
existing `student_access_code` links as rollout fallback.

## Decisions Captured

- Parents can create/reset a username/password login for each linked
  son/student from the authenticated parent portal.
- Student self-reset is out of scope for v1.
- Parent reset is the only student password recovery path in v1.
- Student sessions must be separate from parent and Operations sessions.
- Existing private access-code links remain valid fallback during rollout.
- No raw password, raw access code, raw IP address, or secret may be stored or
  exposed in tracked files, screenshots, logs, task titles, helper output, or
  bot output.

## Open Questions

- Authenticated live parent/student credential smoke requires a dedicated test
  parent/student fixture before creating or resetting any real live credential.
- Production closeout for DB-backed workstreams still depends on reachable DB,
  deployment access, credentials/DNS, and human legal/billing/product/asset
  decisions where applicable.

## Tasks

| Task | Owner | Category | Priority | Depends on | Related file | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Add student password-account/session/auth-attempt schema | Codex | technology | high | none | `server.js` | Additive bootstrap only. |
| Add scrypt v1 student password hash/verify helpers | Codex | security | high | schema | `server.js` | Include version, params, salt, derived key. |
| Add parent-scoped student credential API | Codex | portal | high | parent session | `server.js` | Use `getParentPortalStudentForSession`; never return password/hash. |
| Add student username/password login/session/logout API | Codex | portal | high | schema/helpers | `server.js` | Keep access-code fallback. |
| Update parent and student portal UIs | Codex | frontend | high | APIs | `public/parent.html`, `public/student.html` | Parent reset form; student login with fallback access-code field. |
| Update policy and tests | Codex | QA | high | implementation | `ops/access/student-portal-auth-policy.md`, `tests/*` | Replace private-code-only assertions. |
| Create screenshots/proof artifacts | Codex | QA | medium | local app | `ops/playwright-smokes/2026-06-16-parent-student-login-local/` | Fixture-only for parent account panel; no real login/write. |
| Final WS01-WS11 status matrix | Codex | operations | high | audit/tests | this file | Evidence-based classification only. |

## Workflow Implications

- Parent portal Account section becomes the first v1 student credential
  management surface.
- Student portal supports session-based login plus access-code fallback.
- Existing student checkoff and message APIs should accept either valid student
  session or valid access code.
- Operations should continue treating student access-code preparation as a
  fallback/readiness path, not a bulk credential send.

## Files Checked

- `AGENTS.md`
- `README.md`
- `TASKS.md`
- `SYSTEM-STATE.md`
- `MEMORY.md`
- `memory/2026-06-16.md`
- newest `tasks-pending/*.md`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- `package.json`
- `server.js`
- `public/student.html`
- `public/parent.html`
- `tests/student-portal-auth-policy.test.js`
- `tests/parent-student-portal-contract.test.js`
- `scripts/smoke-student-portal-auth-policy-live.mjs`

## Implementation Update - 2026-06-16

Code-local student login implementation is complete:

- Added additive student password account, session, and password auth-attempt
  schema in `server.js`.
- Added scrypt v1 student password hashing/verification and hashed student
  session storage.
- Added parent-scoped
  `POST /api/parent-portal/students/:studentId/login-account`.
- Added student `POST /api/student-portal/login`,
  `GET /api/student-portal/session`, and `POST /api/student-portal/logout`.
- Kept existing `student_access_code` fallback and existing student portal APIs.
- Added parent Account controls for per-student username/password setup/reset
  plus access-code fallback buttons.
- Added student login form with username/password first and access-code fallback
  below.
- Replaced private-code-only policy with parent-managed username/password
  policy in `ops/access/student-portal-auth-policy.md`.
- Extended the live auth-policy smoke script to verify invalid password audit
  rows without raw username/password storage.

No real student credential was created or reset. No email, WhatsApp, billing,
Google, Buffer, external CRM, or live access write was performed.

## Proof Commands

Passed:

- `node --check server.js`
- `node --check scripts/smoke-student-portal-auth-policy-live.mjs`
- inline script parse for `public/student.html` and `public/parent.html`
- `node --test tests\student-portal-auth-policy.test.js tests\parent-student-portal-contract.test.js tests\public-route-privacy-contract.test.js`
- `npm test` -> 620/620 passing
- local Browser/Playwright screenshot smoke:
  `ops/playwright-smokes/2026-06-16-parent-student-login-local/report.md`
- `npm run railway:doctor` -> production service healthy
- `npm run railway:redeploy` -> deployment
  `dfbc65fa-fec4-4633-b45f-93adce342cc4`
- post-deploy `npm run railway:doctor` -> SUCCESS
- `npm run app:smoke` ->
  `ops/live-smokes/2026-06-16T07-12-31-276Z-live-app-smoke.md`
- `npm run app:smoke:public-privacy` ->
  `ops/live-smokes/2026-06-16T07-12-37-866Z-public-route-privacy-smoke.md`
- `npm run app:smoke:student-auth` ->
  `ops/live-smokes/2026-06-16T07-14-26-412Z-student-auth-policy-live-smoke.md`

Live real-credential creation/reset smoke remains blocked until a dedicated test
parent/student fixture is approved; the deployed live auth smoke verifies
invalid access-code and invalid username/password audit rows without raw secret
echo/storage.

## Final WS Status Matrix

| WS | Name | Current evidence | Code-local status | Production status | Proof run | Remaining blocker | Final classification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WS01 | Operations UI / mobile / dark gray cleanup | Prior WS01 status map, combined deploy records, current full tests | implemented | broad deploy previously passed | `npm test` 620/620 | no new code-local blocker found | code-local closed; live targeted screenshots remain optional evidence |
| WS02 | Decision lifecycle / reprocess | Prior local implementation records and tests in full suite | implemented | needs live DB readback | `npm test` 620/620 | live DB/readback | blocked external/live readback |
| WS03 | Pending/access dedupe / Done links | Prior local implementation records and tests in full suite | implemented | needs live DB cleanup/readback | `npm test` 620/620 | live DB/cleanup decisions | blocked external/live readback |
| WS04 | Queue audit / agent visibility | Deployed queue audit records and tests in full suite | implemented | deployed verified previously | `npm test` 620/620 | none known | closed locally |
| WS05 | BNA Helper tools | Helper tests and support-ticket routing tests in full suite | implemented | deployed broad bundle; targeted live helper readback still useful | `npm test` 620/620 | live helper/support-ticket readback | code-local closed; live readback open |
| WS06 | Buffer / Resend / keyholder | Communications tests in full suite | implemented as draft/preview/readiness | external gated | `npm test` 620/620 | Buffer/Resend keys, domains, account decisions | blocked external credentials/DNS |
| WS07 | Automation Center compact layout | Automation tests in full suite | implemented | needs live DB/readback | `npm test` 620/620 | live DB/deploy/readback | blocked external/live readback |
| WS08 | Workspace directory/categories | Workspace/person tests in full suite | implemented | needs scoped live readback | `npm test` 620/620 | DB/readback/SDDraftler evidence | blocked external/live readback |
| WS09 | Student identity dedupe | Student identity tests in full suite | implemented | needs live Menachem review/test fixture | `npm test` 620/620 | live DB evidence/test fixture | blocked external/live fixture |
| WS10 | One Time product/payments/assets | Decision handoff and product/payment tests in full suite | decision-ready | external gated | `npm test` 620/620 | legal/billing/account/assets/human decisions | blocked human/external decisions |
| WS11 | Gamification/community/parent progress | WS11 tests in full suite | implemented | broad deploy done; targeted privacy readback open | `npm test` 620/620 | live privacy/readback fixture | code-local closed; live privacy readback open |
