# Stripe Integration

Date checked: 2026-06-28

Scope: One Time local beta pricing, checkout/payment-link abstraction, payment
event mocks, enrollment/access state, refunds/cancel state, and provider-plan
readiness. This file contains no secrets.

## Current Local Contract

- Primary One Time offer: `$67` USD after the trial, configurable through
  product/pricing configuration.
- Launch trial: 30 days free, no credit card at signup, no payment method at
  signup, and no checkout session at signup.
- Payment modes allowed in this stage: Stripe test mode or local mocks only.
- Live charges: not allowed.
- Stripe Connect: not assumed. Provider payouts require a separate Decision.
- Automatic tax: disabled for the current test/safe-mode workflow.
- Grace period: none. Trial access ends or converts through an explicit later
  Stripe path; there is no access-during-grace period.
- Refund policy for this launch packet: no refunds. Refund/cancel automation is
  not a live workflow in this stage.
- Local mock module: `src/platform/integrations/stripe-local-beta.js`.

## Required Local/Test-Mode Behaviors

One Time:

- configurable live-class offer
- checkout session or payment-link abstraction
- trial access without card or payment method
- conversion to paid access after a later verified payment event
- receipt/status display
- refund/cancel review state only; no live refund workflow
- webhook verification/idempotency
- parent/student relationship
- no real charge during this stage

Future cohort:

- 20-seat capacity
- waitlist
- 3 scholarship seats
- human-approved scholarship
- transparent audit

Provider plans:

- free provider plan
- optional paid privacy plan
- clear entitlements
- plan-change audit
- no hidden downgrade behavior

## Configuration Names

Non-secret identifiers may be referenced in Decisions:

- `STRIPE_ACCOUNT_OWNER`
- `STRIPE_MODE`
- `STRIPE_ONE_TIME_PRICE_ID`
- `STRIPE_ONE_TIME_PAYMENT_LINK_ID`
- `STRIPE_WEBHOOK_MODE`
- `STRIPE_AUTOMATIC_TAX_ENABLED=false`

Secrets must be stored only in keyholder/server environment:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Required Decisions Before Live Use

- Confirm the separate One Time Stripe account/test-mode owner.
- Confirm the later conversion path: checkout sessions or payment links.
- Confirm the first approved test buyer/session before any live billing.
- Confirm that provider payout/revenue split/tax configuration stays out of
  scope until a later business decision.

## Local Acceptance

- Automated tests must use mocks or test-mode fixtures.
- `tests/one-time-stripe-local-beta.test.js` verifies no-card trial signup,
  checkout preview for later conversion, paid-event conversion, duplicate-event
  idempotency, failed/expired/canceled no-grant behavior, refund review state,
  and readiness-card exposure.
- No live checkout, live product, live price, payment link, subscription,
  charge, refund, payout, or webhook endpoint mutation should occur without an
  explicit later release approval.
