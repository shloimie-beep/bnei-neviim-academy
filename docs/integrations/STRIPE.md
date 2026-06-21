# Stripe Integration

Date checked: 2026-06-20

Scope: One Time local beta pricing, checkout/payment-link abstraction, payment
event mocks, enrollment/access state, refunds/cancel state, and provider-plan
readiness. This file contains no secrets.

## Current Local Contract

- Primary One Time offer: `$67` USD, configurable through product/pricing
  configuration.
- Payment modes allowed in this stage: Stripe test mode or local mocks only.
- Live charges: not allowed.
- Stripe Connect: not assumed. Provider payouts require a separate Decision.
- Local mock module: `src/platform/integrations/stripe-local-beta.js`.

## Required Local/Test-Mode Behaviors

One Time:

- configurable live-class offer
- checkout session or payment-link abstraction
- enrollment after verified payment event
- receipt/status display
- refund/cancel state
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

Secrets must be stored only in keyholder/server environment:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Required Decisions Before Live Use

- Which Stripe account owns One Time payments?
- Is the live path checkout sessions, payment links, or manual accounting first?
- Who approves refunds/cancellations?
- Is Stripe Connect needed, or are provider payouts out of scope?

## Local Acceptance

- Automated tests must use mocks or test-mode fixtures.
- `tests/one-time-stripe-local-beta.test.js` verifies checkout preview,
  paid-event enrollment, duplicate-event idempotency, failed/expired/canceled
  no-grant behavior, refund review state, and readiness-card exposure.
- No live checkout, live product, live price, payment link, subscription,
  charge, refund, payout, or webhook endpoint mutation should occur without an
  explicit later release approval.
