# Stripe Sandbox Smoke - 2026-07-13T12:02:16.208Z

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

- product: prod_UsTV1uewjBVpdt_[redacted_e031c5a57a47]
- price: price_1TsiYvEEOawBwiexjf3G3mia_[redacted_558aa9c4bff3]
- customer: cus_UsTVM9syrLyrEa_[redacted_2ef8f7a8aba6]
- checkout_session: cs_test_[redacted_7a0ddbc066c8]
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
