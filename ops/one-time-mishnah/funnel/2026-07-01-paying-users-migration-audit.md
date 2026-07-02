# One Time Paying Users Migration Audit - 2026-07-01

Requirement: `REQ-20260701-613`

## Result

- Read-only aggregate audit completed for One Time/Rabbi payment and access representations.
- No names, emails, phones, customer IDs, payment links, invoice URLs, or raw payment rows are included.
- No Stripe, Green Invoice, checkout, charge, subscription, cancellation, refund, or payment-link mutation was performed.

## Guardrails

- Stripe API called: `false`
- Checkout created: `false`
- Charge performed: `false`
- Subscription changed: `false`
- Cancellation/refund performed: `false`
- External write performed: `false`

## Aggregates

### Members By Access Status/Tier
| access_status | access_tier | count |
| --- | --- | --- |
| `active` | `library_only` | `4` |
| `canceled` | `library_only` | `4` |
| `canceled` | `live_plus_library` | `2` |
| `trial` | `live_plus_library` | `2` |
### Access Grants By Status/Source/Tier
| status | source | tier_key | count |
| --- | --- | --- | --- |
| `active` | `one_time_trial_signup` | `live_library` | `2` |
| `revoked` | `manual_override` | `live_library` | `2` |
### Checkout Records By Provider/Status
No rows.
### Payment Events By Provider/Status
No rows.
### Provider Settings By Provider/Mode
| provider | mode | enabled | secret_configured | count |
| --- | --- | --- | --- | --- |
| `green_invoice` | `live` | `false` | `false` | `1` |
| `green_invoice` | `test` | `false` | `false` | `1` |
| `stripe` | `live` | `false` | `false` | `1` |
| `stripe` | `test` | `false` | `false` | `1` |
### Product Tiers By Status
| status | tier_key | count | stripe_link_configured_count | green_invoice_link_configured_count |
| --- | --- | --- | --- | --- |
| `active` | `library_only` | `1` | `0` | `0` |
| `active` | `live_library` | `1` | `0` | `0` |
| `draft` | `interactive_zoom` | `1` | `0` | `0` |
| `draft` | `library_live_low_touch` | `1` | `0` | `0` |
| `draft` | `vip_high_touch` | `1` | `0` | `0` |
### Legacy Signups By Payment Status
| payment_status | count |
| --- | --- |
| `paid` | `5` |
| `partial` | `1` |
| `pending` | `3` |
## Blockers Before Any Migration

- Need billing source of truth and exact paying-user list/segment owner before any migration.
- Need explicit approval before Stripe/Green Invoice API calls, checkout/payment-link creation, subscription changes, cancellations, or refunds.
- Need reconciliation rules for trial, active paid, comped/manual, expired, revoked, and refund-review access states before migration.
