# Parent / Student / Provider Portal Security Audit - 2026-06-17

Scope:

- Public portal shells: `/parent`, `/parent/login`, `/student`, `/student/login`, `/provider`, `/provider/login`, `/member`, `/member-portal`, `/rabbi-member`.
- Protected portal APIs: `/api/parent-portal`, `/api/parent-portal/session`, `/api/parent/me`, `/api/student-portal`, `/api/student-portal/session`, `/api/provider-portal/session`, `/api/member-portal`, `/api/rabbi/member/session`.
- Existing scoped write paths reviewed by contract tests: parent-managed student login reset, student goal/checkoff/message/question routes, provider portal profile/service/media routes, and One Time member/member-library routes.

Findings:

- Parent, student, provider, member, and Rabbi member portal APIs were guarded by session/token/access-code checks, but the global cache/noindex middleware only covered Operations and `/api/bna/*`.
- Private portal API responses should be `Cache-Control: no-store` even when access is denied or when a valid session/token later returns private payloads.
- No public shell or anonymous protected API response exposed the known private student names, parent emails, access-code fields, or per-student Torah progress snippets covered by the smoke script.

Fix applied:

- `server.js` now applies `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store` to:
  - `/api/parent*`
  - `/api/parent-portal*`
  - `/api/student-portal*`
  - `/api/provider-portal*`
  - `/api/member-portal*`
  - `/api/rabbi/member*`
- `scripts/smoke-public-route-privacy.mjs` now covers provider/member portal shells and the protected provider/member/Rabbi member API namespaces.
- `tests/public-route-privacy-contract.test.js` pins the expanded route list and cache-header expectation.

Verification:

- `node --check server.js`
- `node --check scripts/smoke-public-route-privacy.mjs`
- `node --test tests/public-route-privacy-contract.test.js tests/identity-linking.test.js tests/student-portal-auth-policy.test.js tests/parent-student-portal-contract.test.js tests/one-time-external-user-portal.test.js` passed 75/75.
- Full `npm test` passed 669/669.
- Railway production deployment `142fde45-420c-4311-a35d-1d51338caaad` reached `SUCCESS`.
- Live app smoke passed: `ops/live-smokes/2026-06-17T05-09-18-937Z-live-app-smoke.md`.
- Live student-auth smoke passed: `ops/live-smokes/2026-06-17T05-09-17-862Z-student-auth-policy-live-smoke.md`.
- Expanded live public/privacy smoke passed: `ops/live-smokes/2026-06-17T05-10-00-447Z-public-route-privacy-smoke.md`.

Guardrails:

- No live email, WhatsApp, public post, upload, charge, DNS write, credential copy, account grant, or provider/member publication was performed.
- The live privacy smoke was anonymous and did not use real parent/student/provider/member credentials.
- Existing parent child-login live smoke remains: `ops/playwright-smokes/2026-06-17-parent-login-and-child-login-live-latest/report.md`.

Status:

- `REQ-20260616-027` is complete for parent/student/provider/member public entry safety, anonymous API rejection, no-store cache posture, and direct private API namespace coverage.
- Future product-specific audits can still be added for authenticated real-account UX, but that is not blocking this security correction requirement.
