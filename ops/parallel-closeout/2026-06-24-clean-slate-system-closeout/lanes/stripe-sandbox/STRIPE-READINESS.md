# Stripe Readiness

## Configuration States

Implemented states:

- `not_configured`
- `sandbox_configured`
- `sandbox_invalid`
- `sandbox_ready`
- `live_configured`
- `live_disabled`
- `live`

Live mode is never inferred merely because a live key exists. A live key without
explicit live mode and approval reports as `live_configured` or `live_disabled`,
with live checkout/charge creation blocked.

## Implemented Lifecycle Coverage

- pricing and product/price mapping
- provisional trial policy
- checkout session payload and sandbox creation wrapper
- customer association
- subscription status mapping
- webhook signature verification
- idempotency and replay safety
- entitlement updates
- trial, payment success, payment failure, retry, renewal, and cancellation
- invoice/receipt read model
- member billing state
- provider revenue aggregation
- test/live mode safety
- structured billing errors
- no-charge preview mode

## Verification Summary

- Credential-free lifecycle tests passed 7/7.
- Focused Stripe/Rabbi regression suite passed 21/21.
- Sandbox smoke ran and recorded `live_key_blocked`.
- No Stripe API writes were attempted because a live key is configured and a
  test-mode key is missing.
- `git diff --check` passed.
- `npm run secrets:audit` passed with 0 tracked secret-risk files.

## Operator Stripe Setup

Dashboard page: Stripe **Dashboard > Developers > API keys**. Enable **Test
mode** before copying any non-secret IDs.

Required non-secret IDs:

- test product ID
- test recurring price ID
- test account ID, if used for ownership readback
- webhook endpoint ID

Required secret names:

- `STRIPE_SECRET_KEY` or `RABBI_STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` or `RABBI_STRIPE_WEBHOOK_SECRET`
- `STRIPE_MODE=test` or `RABBI_STRIPE_MODE=test`
- `STRIPE_ACCOUNT_OWNER`

Secret-store location: `C:\Users\User\BNA-Keyholder` for local keyholder
workflow, or server-side Railway variables for deployed environments. Do not
paste secret values into chat, tracked files, screenshots, or logs.

Webhook setup: Stripe **Dashboard > Developers > Webhooks > Add endpoint**.
Proposed endpoint after shared patch integration:
`/api/webhooks/stripe/rabbi`.

Required events:

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

Expected UI status after valid sandbox setup: `sandbox_ready`,
`live_mode_disabled: true`, checkout creation allowed only for sandbox, no
secret values in browser payloads, and redacted object IDs in lane evidence.

Live-mode acceptance criteria:

- final owner approval for live billing;
- approved policy Decisions for price, currency, trial, renewal, cancellation,
  refunds, taxes, grace period, receipt/invoice language, and provider revenue;
- live webhook secret and endpoint configured server-side;
- sandbox smoke and idempotency proof already passing;
- access rollback/revoke path proven;
- live deploy and live smoke explicitly approved by final integrator.
