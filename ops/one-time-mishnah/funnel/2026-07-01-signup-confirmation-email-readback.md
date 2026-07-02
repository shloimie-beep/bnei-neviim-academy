# One Time Signup Confirmation Email Readback - 2026-07-01

Requirement: `REQ-20260701-606`

## Result

- Public `/api/one-time/interest` now sends a single transactional signup confirmation email after the local 30-day trial access grant is committed.
- Sender path is the One Time Resend identity: `info@onetimeonetime.com` / `OneTimeOneTime Mishnah`.
- The email is scoped to the current signup recipient only.
- Duplicate submits reuse the same product lead, member, and access grant, then skip the confirmation as already sent.

## Guardrails

- No bulk campaign send.
- No imported lead/contact send.
- No WhatsApp send.
- No checkout, payment, subscription, cancellation, or refund.
- No DNS mutation.
- No GHL/LeadConnector runtime.
- No external CRM write.
- No secret values printed or committed.

## Verification

- PASS `node --check server.js`.
- PASS focused suite: `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/one-time-local-hardening-audit.test.js tests/resend-client.test.js tests/rabbi-checkout-access.test.js`.
- PASS expanded suite: 67 tests across One Time, Rabbi access, Resend, communications, route/action watchdog contracts.
- PASS `npm run watchdog:security`.
- PASS `npm run watchdog:actions`.
- PASS Railway deployment `2afaa69f-5812-46a7-941d-0bf3bee62094` reached `SUCCESS`.
- PASS live synthetic Resend delivered-address signup smoke.
- PASS live duplicate submit skipped as already sent.
- PASS live Email/Resend UX smoke reports `bulk_send_enabled=false`, `test_send_enabled=false`, and `email_send_performed=false`.
- PASS live app smoke.

## Live Smoke

Evidence:

- `ops/live-smokes/2026-07-01T15-45-55-623Z-one-time-signup-confirmation-live-smoke.md`
- `ops/live-smokes/2026-07-01T15-45-55-623Z-one-time-signup-confirmation-live-smoke.json`
- `ops/live-smokes/2026-07-01T15-46-12-598Z-rabbi-onetime-landing-smoke.md`
- `ops/live-smokes/2026-07-01T15-46-14-452Z-live-app-smoke.md`

Live smoke summary:

- First synthetic signup: HTTP `200`, confirmation `sent`, provider `resend`, provider message id present.
- Duplicate synthetic signup: HTTP `200`, confirmation `skipped`, reason `confirmation_already_sent`.
- Duplicate kept the same product lead, member, and access grant IDs.

## Campaign Decision

The transactional signup confirmation is send-ready and live for current signup recipients.

The real launch campaign remains **not authorized** until final copy, exact recipient list/segment, final links/domain state, and explicit send approval are supplied.
