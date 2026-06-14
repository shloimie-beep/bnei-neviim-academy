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
