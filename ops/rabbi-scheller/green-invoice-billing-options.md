# Green Invoice Billing Options For One Time

Date: 2026-06-14

Purpose: compare practical billing paths for the One Time Mishnah membership
without creating 30 daily payment links or activating live checkout before the
owner approves pricing, provider, and terms.

## Current Facts

- The audited `one-time-one-time` backend is Stripe-oriented.
- Green Invoice was not found in the audited One Time source.
- The operator specifically asked whether Green Invoice supports paying now and
  then recurring again in 30 days, versus paying now or on the first of the
  month.
- The BNA preview route must keep checkout inactive until approval.

## Option 1: Immediate Payment Plus First-Of-Month Subscription

Customer pays an initial amount now. Recurring membership bills on the first of
each month.

Pros:

- Simple monthly accounting.
- Easy for families to understand if copy is clear.
- Avoids a different billing anniversary for every member.
- Works well if Green Invoice supports a standard monthly subscription anchor.

Cons:

- Needs clear proration or first-period copy.
- Needs a policy for people joining near the first of the month.
- May require a one-time first payment plus a recurring subscription setup.

## Option 2: First-Of-Month Only

Customer signs up now, but payment and access start on the first of the month
or after manual approval.

Pros:

- Cleanest recurring billing schedule.
- Minimal custom payment logic.
- Easy reconciliation.

Cons:

- Can create a delay between interest and access.
- May lose leads if the user wants immediate access.
- Needs a clear waitlist/approval communication.

## Option 3: Manual First-Cycle Link, Then Subscription

Send a one-time manual payment link for the first cycle, then attach the member
to the standard first-of-month subscription.

Pros:

- Practical launch bridge.
- Avoids complex automation before the billing policy is settled.
- Lets Shloimie verify early payments manually.

Cons:

- Manual work for each signup.
- Easy to forget without a clear Operations task/ticket.
- Needs audit notes so the first-cycle payment is not lost.

## Option 4: Multiple Daily Links

Create separate payment links for different signup days so each user roughly
matches a 30-day billing cycle.

Pros:

- Can mimic 30-day timing if provider limitations force it.

Cons:

- Not recommended.
- High operational risk.
- Hard to audit.
- Confusing for support.
- Easy to send the wrong link.
- Multiplies across ILS/USD/GBP and plan variants.

## Option 5: Stripe Or Another Billing Alternative

Use Stripe or another provider if Green Invoice cannot support the approved
membership model.

Pros:

- May support subscription anchors, trials, coupons, and referral credits more
  naturally.
- Existing One Time source already has Stripe-oriented code.

Cons:

- May not fit Israeli invoicing/accounting needs.
- Adds another provider surface.
- Existing code still needs security and product review before reuse.

## Recommendation

Prefer Option 1 if Green Invoice can support it cleanly:

1. Charge an initial amount now.
2. Put the recurring charge on the first of the month.
3. Show clear first-period and recurring billing copy.
4. Keep checkout inactive until pricing and policy are approved.

Use Option 3 as a launch-safe manual bridge if automation is not ready.

Avoid Option 4 unless Green Invoice and every alternative provider make all
better paths impossible.

## Decision Card

Question: Which launch billing policy should One Time Mishnah use?

Context: The preview page is inactive for checkout. Existing exported code uses
Stripe, while the operator is considering Green Invoice. Billing must be simple
enough to support and clear enough for families.

Option A: Initial payment now, recurring on the first of the month.

Option B: First-of-month only, access starts after payment/approval.

Option C: Manual first-cycle payment link, then first-of-month subscription.

Option D: Stay with Stripe or another provider if Green Invoice cannot support
the approved model.

Recommendation: Option A if Green Invoice supports it cleanly; Option C as the
manual launch fallback. Do not create 30 daily payment links for launch.

## Required Before Live Checkout

- Approved ILS price.
- Approved USD price.
- GBP/UK decision if relevant.
- Refund and cancellation policy.
- Whether access starts immediately or after first payment clears.
- Whether Green Invoice or Stripe is the approved source of truth.
- Receipt/invoice wording.
- Failed payment and cancellation workflow.
- Referral reward accounting policy.

## Implementation Notes

- Keep `/preview/one-time-mishnah` preview-only.
- Create the approved billing policy as a visible Operations decision before
  wiring live checkout.
- Record every first-cycle manual payment as a communication/timeline note and
  task activity.
- Do not apply referral credits automatically until payment verification and
  admin approval exist.

## 2026-06-15 Provider Of Record And Policy Packet

This section resolves the open handoff into an approval-ready decision packet.
It does not activate checkout, create payment links, grant member access, send
messages, write to a billing provider, or modify Rabbi Scheller's live site.

### Current Source-Of-Truth Answer

- The audited One Time web/backend source is Stripe-oriented.
- Green Invoice is already known to BNA as a payment/invoice surface, but Green
  Invoice was not found in the audited One Time app source.
- The provider of record is still undecided until the owner approves either
  Green Invoice or Stripe for One Time Mishnah launch.
- One Time should have exactly one provider of record per live product/plan.
  Do not split new checkout, subscription status, refund status, cancellation
  status, and access decisions between Green Invoice and Stripe for the same
  membership plan.
- A second provider may be kept only for historical read-only import, manual
  exceptions, or an explicitly approved migration window with reconciliation
  notes.

### Provider Decision Options

Option A: Green Invoice is provider of record.

- Choose this if Green Invoice can support the approved subscription anchor,
  first-cycle payment, invoices/receipts, refunds/cancellations, webhook or
  export readback, and BNA reconciliation requirements.
- BNA should treat Green Invoice payment status as the source of truth for
  payment-success, failed-payment, refund, cancellation, and receipt events.
- Stripe code in the audited One Time source becomes a migration reference only
  until a future approved change.

Option B: Stripe is provider of record.

- Choose this if One Time should reuse the existing Stripe-oriented checkout,
  subscription, customer portal, webhook, refund, cancellation, and metadata
  model after the app is hardened.
- BNA should treat Stripe payment/subscription status as the source of truth and
  Green Invoice as a separate BNA school/accounting surface, not as the One Time
  membership source of truth.
- Accounting/invoice requirements must be confirmed before launch.

Option C: Manual launch bridge, then provider cutover.

- Use one approved manual first-cycle payment path while the final provider is
  being confirmed.
- Every manual payment must create an Operations activity note with payer,
  amount, currency, plan, period covered, owner, and follow-up task.
- This option must have an explicit end date or cutover decision so manual
  exceptions do not become the hidden operating system.

Recommendation: approve Option A only if Green Invoice can prove first-cycle
plus first-of-month subscription behavior and reliable status readback. Approve
Option B if the existing One Time Stripe model is faster and safer after
hardening. Use Option C only as a short launch bridge.

### Required Billing Policy Decisions

Before any live checkout or member access grant, capture these as Operations
decisions:

- Provider of record: Green Invoice, Stripe, or manual bridge.
- Plan names and prices for ILS, USD, and GBP if UK/US variants are active.
- Tax/VAT/invoice wording and receipt sender.
- First-cycle rule: charge now, prorate now, trial before billing, or wait for
  first of month.
- Subscription anchor: first of month, signup anniversary, or manual renewal.
- Access start: immediately after trusted payment, after manual review, or
  after trial approval.
- Refund policy and cancellation policy.
- Failed payment retry, grace period, dunning copy, owner alert, and access
  state.
- Chargeback/dispute handling and member-access freeze/revoke path.
- Referral credit timing and whether credits are manual or provider-native.
- Support owner for billing questions and the approved contact channel.
- Rollback/revoke path for duplicate, refunded, disputed, or mismatched
  payments.

### Refund And Cancellation Options

Option R1: No refunds after payment; cancel before next billing date.

- Cleanest to operate.
- Higher support risk if a family pays, immediately realizes it is wrong, and
  asks for help.
- Access normally remains through the paid period unless abuse, chargeback,
  dispute, or safety review requires manual restriction.

Option R2: Manual seven-day first-payment refund window, then cancel before the
next billing date.

- Better launch default if there is no true free trial.
- Applies only to the first payment unless Shloimie approves an exception.
- Renewal payments are not automatically refunded.
- Access is revoked or moved to preview-only after a refund is approved and
  recorded.

Option R3: Trial/preview before billing, then no refunds after first payment.

- Best if the funnel can protect paid content while giving families enough
  confidence before checkout.
- Requires a clear trial end, conversion event, and access boundary.
- Avoids most refund processing but needs stronger trial/access automation.

Recommendation: use Option R2 for launch unless a real protected trial is
ready, in which case Option R3 is cleaner. Do not publish refund copy, send
payment reminders, or automate access changes until the owner approves the
exact option and wording.

### Approval Phrases

Use one of these exact approval records before implementation:

- `APPROVE_ONE_TIME_BILLING_PROVIDER_GREEN_INVOICE`
- `APPROVE_ONE_TIME_BILLING_PROVIDER_STRIPE`
- `APPROVE_ONE_TIME_BILLING_MANUAL_BRIDGE`
- `APPROVE_ONE_TIME_REFUND_POLICY_R1_NO_REFUNDS`
- `APPROVE_ONE_TIME_REFUND_POLICY_R2_SEVEN_DAY_FIRST_PAYMENT`
- `APPROVE_ONE_TIME_REFUND_POLICY_R3_TRIAL_THEN_NO_REFUNDS`

Each approval should include the approved plan price/currency, first-cycle
rule, subscription anchor, access-start rule, failed-payment grace policy,
support owner, and rollback/revoke owner.

### Implementation Guardrails

- Keep BNA preview routes inactive for checkout until provider and refund
  policy approvals exist.
- Do not create payment links, checkout sessions, subscriptions, invoices,
  refunds, cancellations, member access, email/WhatsApp/social sends, Drive or
  video-host writes, or external CRM records from this audit.
- Do not use old setup/debug routes or hard-coded setup secrets from the
  audited One Time source.
- Do not mix BNA school accounting records with One Time member billing unless a
  typed scoped integration defines the shared fields.
- Post-approval smoke should use an approved test buyer/session first and
  verify payment success, duplicate event idempotency, failed payment handling,
  cancellation, refund/revoke behavior, and Operations audit logging before
  real launch traffic.
