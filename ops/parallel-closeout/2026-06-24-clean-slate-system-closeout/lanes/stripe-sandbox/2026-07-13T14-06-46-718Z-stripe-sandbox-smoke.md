# Stripe Sandbox Smoke - 2026-07-13T14:06:42.456Z

- status: passed
- config_state: sandbox_ready
- external_write_performed: true
- live_mode_disabled: true
- no_real_customer_data: true
- no_real_funds: true

## Configuration

- secret_configured: true
- webhook_secret_configured: true
- account_owner: unknown
- missing: none
- blockers: none

## Sandbox Objects

- product: prod_UsVWx4tF2fGQGh_[redacted_64510e7989ee]
- price: price_1TskVLEEOawBwiexxXteMpAn_[redacted_cb9fd7b3a675]
- customer: cus_UsVWbeN2qMv4Bm_[redacted_8a76ea5de0df]
- checkout_session: cs_test_[redacted_443d46af418f]
- cleanup: checkout_session:expired, customer:deleted, product:deactivated

## Lifecycle Verification

- pricing: true
- trial: false
- promotional_access: true
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

- Created synthetic Stripe test-mode product, price, customer, and checkout session; lifecycle success/failure/cancellation were simulated locally from redacted test object IDs with no Stripe trial period.
