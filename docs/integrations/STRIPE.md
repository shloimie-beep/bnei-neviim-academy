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

## Sandbox Setup Walkthrough

Use Stripe **Dashboard > Developers > API keys** with **Test mode** enabled.
Copy only non-secret identifiers into app configuration or Operations notes:

- test account ID, if needed for ownership readback
- test product ID
- test recurring price ID
- webhook endpoint ID
- webhook signing-secret name, not the value

Secrets must stay in server-side secret storage only. Preferred local secret
store: `C:\Users\User\BNA-Keyholder`. Approved secret names:

- `STRIPE_SECRET_KEY` or `RABBI_STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` or `RABBI_STRIPE_WEBHOOK_SECRET`
- `STRIPE_MODE=test` or `RABBI_STRIPE_MODE=test`
- `STRIPE_ACCOUNT_OWNER`

Create the webhook at **Dashboard > Developers > Webhooks > Add endpoint**.
For local or staging validation, use the app endpoint that will route to the
Stripe billing handler, currently proposed in the lane shared patch as
`/api/webhooks/stripe/rabbi`. Subscribe at minimum to:

- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.upcoming`
- `payment_method.attached`

Validation command:

```powershell
npm run stripe:sandbox-smoke
```

Expected UI/API status after sandbox validation: `sandbox_ready`, with
`live_mode_disabled: true`, no secret values in browser payloads, and redacted
Stripe object IDs recorded in the lane evidence.

Live-mode acceptance criteria:

- explicit owner approval for live billing mode;
- approved price, currency, trial, renewal, cancellation, refund, tax, grace
  period, receipt/invoice language, and provider revenue split Decisions;
- separate live webhook endpoint and live signing secret configured server-side;
- successful sandbox smoke and webhook idempotency proof;
- rollback/revoke path for access grants;
- no live key promoted merely because a key exists.

## Local Acceptance

- Automated tests must use mocks or test-mode fixtures.
- `tests/one-time-stripe-local-beta.test.js` verifies checkout preview,
  paid-event enrollment, duplicate-event idempotency, failed/expired/canceled
  no-grant behavior, refund review state, and readiness-card exposure.
- No live checkout, live product, live price, payment link, subscription,
  charge, refund, payout, or webhook endpoint mutation should occur without an
  explicit later release approval.
