# Batch Status

| Batch | Requirement | Status | Notes |
|---|---|---|---|
| B1 | REQ-20260701-616 | Done | Structured requirements validate; Product Quality drift and trace validation repaired; `npm run pqc:all` passes. |
| B1 | REQ-20260701-601 | Blocked | Host-root implementation, local tests, Railway deploy, and BNA-root smoke pass; onetimeonetime.com is not routed to Railway and www does not resolve. |
| B2 | REQ-20260701-602 | Done | Current-state audit, Definition of Ready, 30-day free/no-card signup CTA, focused tests, local screenshot audit, deployment, and BNA fallback live smoke pass. |
| B3 | REQ-20260701-603 | Done | Scoped product lead/contact/parent lead/internal note tracking and dedupe pass focused tests, watchdogs, Railway deploy, and live synthetic duplicate signup smoke. |
| B3 | REQ-20260701-604 | Done | 30-day local trial access grant passes focused tests, watchdogs, Railway deploy, and live synthetic duplicate access smoke with idempotent grant reuse. |
| B3 | REQ-20260701-605 | Done | Member-login/member API/classroom entry path passes focused tests and live dry-run member smoke with no anonymous Zoom/private media exposure and no email send. |
| B4 | REQ-20260701-606 | Done | Signup confirmation sends one current-signup Resend email after access commit; duplicate submits skip as already sent; focused tests, watchdogs, deploy, live synthetic send smoke, UX no-send smoke, and app smoke pass. |
| B4 | REQ-20260701-607 | Needs operator decision | Dry-run reminder metadata packet prepared; activation needs final schedule, cadence, approved copy, recipient/suppression rules, seed/test member, and explicit approval. |
| B5 | REQ-20260701-608 | Blocked | WAPI/Whapi readiness blocker prepared; setup verification needs credential alias/path and approved sending number. |
| B5 | REQ-20260701-609 | Already satisfied | Existing WAPI/WhatsApp phonebook tooling is scoped, dry-run, and no-send; redacted live readback excluded unscoped rows and focused tests/watchdogs pass. |
| B5 | REQ-20260701-610 | Done | Buffer/social setup state and One Time schedule guard pass local tests, deploy, action watchdog, and live smoke. |
| B6 | REQ-20260701-611 | Blocked | Redacted Vimeo keyholder metadata and no-write media pipeline tests pass; API auth/upload readiness needs `VIMEO_ACCESS_TOKEN` and account decisions. |
| B3 | REQ-20260701-612 | Needs operator decision | Zoom/class-link security model documented and member-path smoke proves anonymous users do not see Zoom/private media; final Zoom/session details needed before configuration. |
| B7 | REQ-20260701-613 | Done | Read-only aggregate paying-user/access audit completed with no raw people/payment values and no Stripe/Green Invoice/API/billing mutations. |
| B8 | REQ-20260701-614 | Needs operator decision | First campaign and seed-send packets prepared; real send needs final copy, exact segment/list, final links/domain state, seed proof, and explicit send approval. |
| B9 | REQ-20260701-615 | Blocked | Completed safe app/server batches have tests, watchdogs, deploy, live-smoke, and screenshot proof; final campaign-domain smoke and real send readiness are blocked by DNS/hosting and final approval details. |
