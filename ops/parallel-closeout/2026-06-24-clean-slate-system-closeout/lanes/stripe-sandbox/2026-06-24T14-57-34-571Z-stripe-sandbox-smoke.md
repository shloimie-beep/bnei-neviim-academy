# Stripe Sandbox Smoke - 2026-06-24T14:57:34.568Z

- status: live_key_blocked
- config_state: live_disabled
- external_write_performed: false
- live_mode_disabled: true
- no_real_customer_data: true
- no_real_funds: true

## Configuration

- secret_configured: true
- webhook_secret_configured: false
- account_owner: unknown
- missing: STRIPE_WEBHOOK_SECRET or RABBI_STRIPE_WEBHOOK_SECRET, test-mode STRIPE_SECRET_KEY or RABBI_STRIPE_SECRET_KEY (sk_test/rk_test)
- blockers: Live Stripe billing requires explicit live mode, live billing enablement, and final approval.

## Sandbox Objects

- product: not created
- price: not created
- customer: not created
- checkout_session: not created
- cleanup: none

## Lifecycle Verification

- pricing: true
- trial: true
- checkout: true
- payment_method: true
- successful_payment: true
- failed_payment: true
- retry: true
- renewal: true
- cancellation: true
- entitlement: true
- invoice_receipt: true
- member_billing: true
- provider_revenue: true
- test_live_mode: true

## Notes

- A live Stripe key is configured. Sandbox smoke blocked all Stripe API calls to avoid live-mode effects.
