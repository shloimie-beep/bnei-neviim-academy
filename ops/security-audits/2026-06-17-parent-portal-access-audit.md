# Parent Portal Access Audit - 2026-06-17

Source raw ID: `RAW-20260617-010`

## Scope

Audit the concern that `/parent` may open a parent dashboard directly on this
machine. Determine whether that is an expected local session or an auth/privacy
leak.

## Current Inspection

| Area | Finding | Evidence | Status |
|---|---|---|---|
| Route registry | `/parent` is private and must redirect/show safe shell when logged out. | `ops/route-registry.json` marks `/parent` private, parent scoped, public disallowed. | Already satisfied in registry |
| Server routing | Parent/student/private entry routes set `Cache-Control: no-store`. | `server.js` has no-store headers around parent/student routes. | Needs smoke proof |
| Parent APIs | Parent routes use parent identity context. | `server.js` contains `requireParentIdentityContext`. | Needs focused review |
| Prior proof | Broader parent/student/provider security work exists from earlier 2026-06-17 closeout. | `ops/security-audits/2026-06-17-parent-student-provider-portal-security.md` referenced in `TASKS.md`. | Prior proof exists |
| Fresh local privacy smoke | Public portal shells render anonymous-safe content and protected APIs reject anonymous access. | `ops/playwright-smokes/2026-06-17-onetime-focused-landing-local/2026-06-17T14-17-25-218Z-public-route-privacy-smoke.md`. | Passed |
| Fresh live privacy smoke | Live public route privacy smoke passed after the OneTime focused landing was live. | `ops/live-smokes/2026-06-17T14-32-28-274Z-public-route-privacy-smoke.md`. | Passed |
| OneTime parent enrollment/billing sync | Parent shell is safe, but OneTime-specific billing/enrollment data needs real product/payment/access records. | This register marks `REQ-20260617-182` blocked. | Blocked on external/product data |

## Required Smoke / Follow-Up

- `/parent` logged out/incognito: passed through local and live route privacy
  smokes.
- `/parent/login` logged out: passed through live route privacy smoke.
- Protected parent/student/provider/member APIs reject anonymous access: passed.
- `/parent` with a valid parent session: requires approved test parent
  credentials/session.
- Wrong-scope/cross-household parent API attempt: requires approved test
  parent credentials/session.
- OneTime-specific enrollment/billing sync: blocked until payment provider,
  billing cadence, and real OneTime enrollment/access records are approved.

## Status

Done for anonymous/public-route safety in this packet. The direct dashboard on
this computer is consistent with an existing local session, not a public route
leak. Credentialed cross-scope proof and OneTime-specific enrollment/billing
sync remain blocked on approved credentials/data.
