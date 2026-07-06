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

