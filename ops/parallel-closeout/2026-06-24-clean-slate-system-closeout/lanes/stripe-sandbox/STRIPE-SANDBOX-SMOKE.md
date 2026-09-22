# Stripe Sandbox Smoke - 2026-07-13T10:39:09.057Z

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

- product: prod_UsSAgNkQqqzmNG_[redacted_779c7a7b1b32]
- price: price_1TshGUEEOawBwiexvfEp30M4_[redacted_eecc23a86b70]
- customer: cus_UsSAJ5S5yK7a39_[redacted_04a5c855690d]
- checkout_session: cs_test_[redacted_14a49edc59af]
- cleanup: checkout_session:expired, customer:deleted, product:deactivated

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

- Created synthetic Stripe test-mode product, price, customer, and checkout session; lifecycle success/failure/cancellation were simulated locally from redacted test object IDs.

