# Current-Code Correction Map - One Time Billing V2

Generated from the first `rg` pass in
`C:\Users\User\BNA-onetime-billing-v2` for:

`trial_days`, `trial_period_days`, `trial_end`, `trial_will_end`, `30-day`,
`free trial`, `one_time_warm_lead_intro_trial`, `grace_period`,
`grace_until`, `access_during_grace`, `provider_revenue_split`,
`refund decision required`, `manual month credit`, `Connect`, `payout`,
`revenue share`, `Rosh Hashanah`, `billing_start_at`.

## Active Correction Targets

| Target | Current finding | Required disposition | Requirement |
|---|---|---|---|
| `src/lib/integrations/stripe.js` | One Time launch policy fallback uses `one_time_warm_lead_intro_trial`; default trial days can be 30. | Replace active One Time launch subscription creation with no-trial promotional conversion/checkout rules; keep historical references only if clearly archived. | `REQ-20260713-954`, `REQ-20260713-955` |
| `src/lib/bna/one-time-product-system.js` | Default product system includes `one_time_warm_lead_intro_trial`, `trial_days: 30`, `30-day warm-lead intro trial`, and `grace_period` access state. | Supersede active launch policy with Rosh Hashanah promotional access and no failed-payment grace period. | `REQ-20260713-951`, `REQ-20260713-954`, `REQ-20260713-956` |
| `public/js/operations-shell.js` | Provider Operations UI renders `Intro Trial`, `30-day warm-lead intro trial`, and policy key/version copy. | Remove active One Time trial UI and replace with billing campaign/product states in the Billing UI batch. | `REQ-20260713-951`, `REQ-20260713-960` |
| `tests/one-time-stripe-local-beta.test.js` | Tests assert warm-lead intro trial and `trial_days: 30`. | Rewrite to assert no Stripe trial, promotional-access policy, canonical `billing_start_at`, and $67/month membership. | `REQ-20260713-954`, `REQ-20260713-961` |
| `tests/stripe-billing-lifecycle.test.js` | Tests assert `subscription_data.trial_period_days = 30`, `trial_end`, `trial_will_end`, and grace-period entitlement. | Rewrite lifecycle tests for no-trial subscription/campaign model, invoice paid/failed/recovered, no grace, cancellation, and refund exception. | `REQ-20260713-955`, `REQ-20260713-956`, `REQ-20260713-961` |
| `tests/one-time-product-system.test.js` | Tests expect `grace_period` state for monthly access policy. | Replace with immediate suspension on failed payment and paid-period access on cancel-at-period-end. | `REQ-20260713-956` |
| `src/lib/bna/rabbi-emails.js` and `tests/one-time-parent-trial-invite.test.js` | Parent trial invite copy says `30-day access is ready`. | Supersede with billing notice / access-ready language that does not imply a Stripe trial. | `REQ-20260713-957` |
| `scripts/smoke-one-time-trial-referral-live.mjs` | Live smoke asserts 30-day trial, trial policy row, and Operations HTML trial copy. | Replace with no-trial Rosh Hashanah conversion smoke; avoid live writes. | `REQ-20260713-954`, `REQ-20260713-961` |
| `scripts/smoke-stripe-sandbox-billing.mjs` | Existing sandbox smoke creates trial-like test subscription data (`trial_end`). | Update/add Billing V2 sandbox smoke that proves no trial/grace/Connect/payout behavior. | `REQ-20260713-955`, `REQ-20260713-961` |
| `scripts/seed-one-time-ui-review-data.mjs` | UI review data includes `TEST One Time Free Trial Member` and 30-day free-trial access copy. | Rename/reseed as promotional access / billing campaign review state. | `REQ-20260713-960` |
| `config/service-provider-bots/schema.json` and `src/lib/bna/provider-lead-bot.js` | Generic provider offer schema/runtime still talks in trial terms. | Do not break future generic provider bot tests blindly; for One Time, publish no trial/pricing claims unless approved by Billing V2 policy. Consider schema extension for `promotional_access` rather than active One Time trial. | `REQ-20260713-954`, `REQ-20260713-957` |

## Historical Or Archive-Only Findings

| Target | Current finding | Disposition |
|---|---|---|
| `docs/integrations/STRIPE.md` | Mentions Stripe Connect as a question and `customer.subscription.trial_will_end` in event docs. | Keep only as integration background if explicitly historical/general; One Time Billing V2 must not depend on Connect or trial-ending events. |
| `scripts/setup-one-time-partnership-drive.mjs` | Contains old grace-period/revenue-share/refund/payout planning language for partnership docs. | Treat as historical Drive/proposal generation unless later code proves active runtime use; do not use for Billing V2 execution. |
| `docs/archive/**` | Legacy GHL/LeadConnector references and other historical text. | Archive-only; no active runtime. |
| `content-memory/**` | Natural-language educational transcripts may mention `30 days` unrelated to billing. | Out of scope for billing correction. |

## Required Follow-Up Audit

After code fixes, rerun a narrowed active-source audit excluding archive/content
provenance:

```bash
rg -n "trial_days|trial_period_days|trial_end|trial_will_end|30-day free trial|free trial|one_time_warm_lead_intro_trial|grace_period|grace_until|access_during_grace|provider_revenue_split|Stripe Connect|payout|revenue share" src public server.js scripts tests config docs/integrations -g "!docs/archive/**"
```

Expected result: active One Time checkout/subscription/UI/email/tests no longer
use the old 30-day Stripe trial or grace-period policy. Remaining matches must
be explicitly historical, generic-provider non-One-Time, or separately mapped.
