# Stripe Payments Memory

- Stripe setup is provider setup/readback work, not a blocker for UI audit or IA
  cleanup.
- Current One Time product assumption: `$67/month` membership.
- One Time Stripe setup is scoped to `rabbi_sheller_provider` /
  `one_time_mishnah_class`; BNA Academy Stripe/payment records must not be
  treated as One Time records without an explicit cross-workspace link.
- Sandbox/test-mode smoke must come before live payments.
- As of 2026-07-06, the local Stripe sandbox handoff explains how to configure
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and price/product ids for
  One Time. No live payment link, webhook endpoint mutation, charge, refund,
  or access grant was performed by that handoff.
- Do not use real card details.
- Do not expose or commit secrets.
- Do not invent refund/legal policy copy; mark policy as owner/legal/business
  decision when needed.
- Payment success may map to access grant only in an approved implementation or
  sandbox packet with reversible test records.
- As of `RAW-20260713-005`, One Time no longer uses a 30-day Stripe trial for
  launch. The Rosh Hashanah pre-billing period is application-level
  promotional access, not `trial_period_days`, `trial_end`, or a required
  `customer.subscription.trial_will_end` workflow.
- Current One Time paid product policy from `RAW-20260713-005`: One Time
  Mishnayos Membership, `$67/month, plus applicable taxes where required`,
  USD, monthly recurring, tax-exclusive, no free trial, full first monthly
  charge at the approved `billing_start_at`, and no partial charge before that
  billing start.
- One Time failed-payment policy from `RAW-20260713-005`: no post-failure grace
  period; failed payment suspends paid entitlement immediately and a recovered
  payment restores according to the approved lifecycle.
- One Time refund policy from `RAW-20260713-005`: no automatic refunds or
  prorated refunds. Exceptional refunds require manual workspace-admin review
  and explicit approval before any Stripe refund execution.
- One Time live activation remains blocked until a separate exact launch packet
  approves the final live price, live Stripe/webhook setup, cohort,
  `billing_start_at`, policy/copy, payment/consent coverage, deployed SHA,
  notice/send plan, and charge authorization.

