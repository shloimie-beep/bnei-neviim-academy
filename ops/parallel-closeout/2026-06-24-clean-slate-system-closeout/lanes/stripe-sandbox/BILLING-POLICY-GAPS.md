# Billing Policy Gaps

The code separates policy from credentials. Sandbox tests use a provisional test
policy only:

- price: `$67/month`
- currency: `USD`
- trial: `30` days
- renewal: monthly
- cancellation: period end
- grace period: 7 days
- refunds: manual review only
- taxes: not configured
- receipt/invoice language: draft
- provider revenue split: unresolved

Required live Decisions:

- approved price and currency;
- approved trial length and whether a payment method is required up front;
- renewal cadence and retry behavior;
- cancel immediately vs cancel at period end;
- refund policy and refund exception owner;
- tax collection policy and tax registration owner;
- grace-period length and access rules;
- customer receipt/invoice wording;
- provider revenue split and payout mechanism, including whether Stripe Connect
  is in scope.

Live billing stays blocked until these Decisions are canonical and linked by
the final integrator.
