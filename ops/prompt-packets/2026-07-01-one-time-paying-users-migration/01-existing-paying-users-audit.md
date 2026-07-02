# Existing Paying Users Migration Audit Packet

Packet ID: `2026-07-01-one-time-paying-users-migration/01-existing-paying-users-audit`
Parent raw ID: `RAW-20260701-007`
Requirement: `REQ-20260701-715`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Packet role: read-only audit and migration-prep handoff

Do not solve the whole parent ramble. Complete only this packet's audit scope
and record the next packet or blocker.

## Scope

Audit existing One Time / Rabbi Sheller paying-user representations before any
migration to the separate One Time instance.

This packet is read-only. It does not cancel paid users, refund, charge, create
payment links, create checkout sessions, call Stripe/Green Invoice APIs, send
email, send WhatsApp, grant access, revoke access, or mutate production billing
records.

## Source Evidence

- Read-only aggregate audit:
  `ops/one-time-mishnah/funnel/2026-07-01-paying-users-migration-audit.md`
  and `.json`.
- Existing One Time app/payment tests:
  `tests/rabbi-checkout-access.test.js`,
  `tests/one-time-stripe-local-beta.test.js`,
  `tests/integrations/w4-onetime-readiness.test.js`, and
  `tests/int05-integrations-closeout.test.js`.

No names, emails, phones, Stripe customer IDs, checkout session IDs, payment
links, invoice URLs, or raw payment rows are included in this packet.

## Aggregate Readback

- Members by access status/tier:
  - `active` / `library_only`: 4
  - `trial` / `live_plus_library`: 2
  - `canceled` / `library_only`: 4
  - `canceled` / `live_plus_library`: 2
- Access grants:
  - `active` / `one_time_trial_signup` / `live_library`: 2
  - `revoked` / `manual_override` / `live_library`: 2
- Checkout records: 0 aggregate rows.
- Payment events: 0 aggregate rows.
- Provider settings exist for `stripe` and `green_invoice` in `test` and
  `live` modes, but all are disabled and show no configured secret in the
  aggregate audit.
- Product tiers exist for `library_only` and `live_library`, plus draft
  planning tiers, but no Stripe or Green Invoice link is configured in the
  aggregate audit.
- Legacy signup payment statuses:
  - `paid`: 5
  - `partial`: 1
  - `pending`: 3

## Required Classification Lanes

The aggregate data is not enough to classify individual users safely. Before
migration, the billing source of truth must classify people into these lanes:

| Lane | Current aggregate signal | Migration treatment |
| --- | --- | --- |
| `existing_paid_member` | Legacy signup `paid` count exists, but no payment-event/checkout rows are present. | Migrate only after billing-source readback confirms active payer identity, product, and current entitlement. |
| `legacy_video_only` | `library_only` member rows exist, including active and canceled statuses. | Preserve access temporarily until billing/access source is reconciled; do not cancel. |
| `legacy_live_class` | `live_plus_library` rows exist for trial/canceled states. | Preserve or hold according to verified source; do not infer live entitlement from aggregate alone. |
| `inactive_payer` | Canceled access rows exist, but no raw payer/source details are included. | Put into billing review; do not charge, cancel, or revoke further. |
| `unknown_status` | `partial` and `pending` legacy signup statuses exist. | Manual review before migration or communication. |
| `needs_billing_review` | Stripe/Green Invoice aggregate settings are disabled and no payment events are present. | Required for every user until the Replit/old Stripe/payment source is read back. |

## Migration Plan

1. Identify the real billing source of truth: Replit app, old Stripe account,
   old product IDs, external checkout, spreadsheet, or another provider.
2. Export/read back the payer list with status, product/price, started date,
   cancellation status, last payment, and current access entitlement.
3. Match each payer to the One Time DB by normalized email/phone only inside
   `rabbi_sheller_provider` / `one_time_mishnah_class`.
4. Stage migration rows as review-only with source fingerprints and lane
   classification.
5. Have Shloimie/Rabbi approve treatment rules for active, grandfathered,
   inactive, refund-review, partial, and unknown-status users.
6. Only after approval, migrate access records into the separate One Time DB.

## Draft Migration Email

Status: draft only; do not send.

Subject: We are updating your OneTimeOneTime class access

Body:

Hello,

We are updating the OneTimeOneTime Mishnah class platform so access to live
class details, recordings, and member resources is easier to manage.

Your existing access is not being canceled because of this update. Before any
change is made, we are reviewing current membership and billing records so each
member keeps the correct access.

If you have any questions, you can reply to this email and we will review your
account manually.

Thank you,
OneTimeOneTime Mishnah

## Blockers

- Need billing source of truth and exact paying-user list/segment owner.
- Need Replit/old Stripe readback or export showing who is paying, product,
  price, active/canceled status, and current entitlement.
- Need explicit approval before Stripe/Green Invoice API calls, checkout or
  payment-link creation, subscription changes, cancellations, refunds, or
  access migration.
- Need final migration treatment rules for active paid, comped/manual, trial,
  partial, pending, canceled, revoked, refund-review, and unknown-status users.

## Acceptance Criteria

- Existing paid users are not canceled.
- No billing/provider/access mutation runs from this packet.
- Audit evidence is aggregate/redacted.
- Migration requires a separate approval packet after billing source-of-truth
  readback.
