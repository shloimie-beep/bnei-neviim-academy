# Deployment

Deployment status: deployed, but domain live smoke blocked by external DNS/hosting.

App-visible changes require:

- focused local tests;
- route/action registry updates where relevant;
- screenshot/live-smoke evidence for affected public/member routes;
- Railway target verification: PASS for `skillful-motivation` / `production`.
- Railway deployment: PASS `0ae3cb12-7f4f-4ae7-9bd9-7dd8f5a78be4` reached `SUCCESS`.
- Railway deployment: PASS `b75c6cec-31ea-4b23-8308-71606a3175ba` reached
  `SUCCESS` for Buffer/social guard changes.
- Railway deployment: PASS `dfc18e8e-d533-4841-a266-4adb36fe5fc7` reached
  `SUCCESS` for the `/one-time` landing/signup update.
- Railway deployment: PASS `4fae9506-f07c-4d49-b01a-f200d392ce27` reached
  `SUCCESS` for the scoped One Time lead/contact tracking update.
- Railway deployment: PASS `5661544b-b960-48a4-8ef5-41489815e5b1` reached
  `SUCCESS` for the 30-day local trial access grant update.
- Railway deployment: PASS `2afaa69f-5812-46a7-941d-0bf3bee62094` reached
  `SUCCESS` for the signup confirmation email update.
- Live smoke: BNA root PASS; One Time real campaign domain BLOCKED because
  apex is served by `Google Frontend` with legacy Rabbi preview content and
  `www.onetimeonetime.com` does not resolve.
- Live smoke: BNA fallback `/one-time` PASS with 30-day free/no-card signup
  copy, no payment links, and no direct Zoom links.
- Live smoke: BNA fallback `/api/one-time/interest` PASS with synthetic
  duplicate signup dedupe, scoped local tracking IDs, no send, no checkout, no
  access grant, and no external write.
- Live smoke: BNA fallback `/api/one-time/interest` PASS with synthetic
  duplicate 30-day access grant, same product/member/access-grant IDs,
  `trial` status, `library,live` scopes, no send, no checkout, no payment,
  no subscription, no cancellation/refund, and no external write.
- Live smoke: BNA fallback `/one-time/member-login` and member APIs PASS with
  an existing safe synthetic member: anonymous member APIs rejected missing
  token, invalid classroom access exposed no private media/Zoom values, dry-run
  member login created/exchanged a temporary token without sending email, and
  authenticated member APIs returned library/live access state.
- Live smoke: BNA fallback `/api/one-time/interest` PASS with synthetic
  Resend delivered-address signup: first submit sent one transactional
  confirmation through Resend, duplicate submit skipped as already sent, and
  the same product/member/access-grant IDs were reused. No bulk campaign,
  imported-list send, WhatsApp, checkout/payment, subscription/refund/
  cancellation, DNS, GHL, or external CRM write occurred.
- No deployment was required for `REQ-20260701-613`; it was a read-only
  aggregate audit of existing local payment/access representations. No
  Stripe/Green Invoice API call, checkout, charge, payment-link creation,
  subscription change, cancellation, refund, or external write occurred.

DNS changes for `onetimeonetime.com` are not authorized from Codex and remain
manual/operator-owned.

Evidence:

- `ops/live-smokes/2026-07-01T14-40-00Z-one-time-domain-route-live-smoke.md`
- `ops/live-smokes/2026-07-01T14-50-00Z-one-time-buffer-social-live-smoke.md`
- `ops/live-smokes/2026-07-01T15-08-00Z-one-time-landing-signup-live-smoke.md`
- `ops/live-smokes/2026-07-01T15-18-00Z-one-time-scoped-lead-tracking-live-smoke.md`
- `ops/live-smokes/2026-07-01T15-28-00Z-one-time-thirty-day-access-live-smoke.md`
- `ops/live-smokes/2026-07-01T16-07-50-327Z-one-time-member-path-live-smoke.md`
- `ops/live-smokes/2026-07-01T15-45-55-623Z-one-time-signup-confirmation-live-smoke.md`
- `ops/live-smokes/2026-07-01T15-46-12-598Z-rabbi-onetime-landing-smoke.md`
- `ops/live-smokes/2026-07-01T15-46-14-452Z-live-app-smoke.md`
