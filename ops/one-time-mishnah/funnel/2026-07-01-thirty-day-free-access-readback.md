# One Time 30-Day Free Access Readback

Date: 2026-07-01

Requirement: `REQ-20260701-604`

## Result

The `/api/one-time/interest` signup path now grants local 30-day One Time
member access after scoped signup tracking succeeds.

The access grant uses existing first-party Rabbi/One Time primitives:

- `bna_members.access_status = trial`
- `bna_members.access_tier = live_plus_library`
- `bna_access_grants.status = active`
- `bna_access_grants.scopes = library, live`
- `bna_access_grants.starts_at = trial_start_at`
- `bna_access_grants.expires_at = trial_end_at`

The access grant is idempotent by product-lead signup key, so duplicate form
submits reuse the same member and grant rather than creating duplicate trial
access or extending the trial indefinitely.

## Safety

- No Stripe checkout was created.
- No subscription was created.
- No charge, refund, cancellation, or billing mutation ran.
- No email, WhatsApp, social, or campaign send ran.
- No GHL/LeadConnector runtime or external CRM write was added.
- The live smoke used a synthetic `example.test` identity only.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js tests/one-time-launch-readiness.test.js`
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js tests/one-time-launch-readiness.test.js tests/resend-inbound-crm.test.js tests/communications-integrations-contract.test.js tests/watchdog-route-security.test.js tests/watchdog-action-registry.test.js`
- PASS `npm run watchdog:security`
- PASS `npm run watchdog:actions`
- PASS `node scripts/generate-one-time-action-coverage.mjs`
- PASS `node scripts/generate-universal-action-parity.mjs`
- PASS Railway deployment `5661544b-b960-48a4-8ef5-41489815e5b1` reached `SUCCESS`
- PASS live BNA fallback synthetic duplicate access smoke:
  `ops/live-smokes/2026-07-01T15-28-00Z-one-time-thirty-day-access-live-smoke.md`

## Live Smoke Summary

The deployed endpoint returned:

- `access_grant_performed: true`
- `trial_access.access_granted: true`
- `member_access_status: trial`
- `scopes: library,live`
- duplicate submit reused the same product lead, member, and access grant
- `no_send: true`
- `no_checkout: true`
- `external_write_performed: false`
- `trial_signup.email_send_performed: false`
- `trial_signup.stripe_checkout_created: false`
- `subscription_created: false`
- `cancellation_or_refund_performed: false`

Real campaign send remains blocked.
