# One Time Provider Billing Platform V2 Release Handoff

Status: draft PR handoff pending
Branch: `codex/onetime-rosh-hashanah-billing-platform-v2`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Primary requirements: `REQ-20260713-950` through `REQ-20260713-963`

## Scope

This branch implements and proves the safe, no-live-charge Billing Platform V2
slice for One Time:

- Rosh Hashanah promotional-access conversion replaces the old active 30-day
  Stripe trial model.
- Current membership product is `$67/month`, USD, tax-exclusive, recurring
  monthly, no Stripe trial.
- Failed payment has no grace period in the paid entitlement lifecycle.
- Cancellation defaults to cancel-at-period-end.
- Refunds are manual exceptional-review only; no automatic or prorated refunds.
- Pre-billing notice and monthly invoice/receipt policy are modeled as no-send
  previews until exact approval.
- Provider Billing UI is available in the One Time provider shell and remains
  read-only/gated for live charge, refund, notice send, and access automation.

## Verification Matrix

| Area | Evidence | Status |
| --- | --- | --- |
| Raw/register/control | `raw-input/RAW-20260713-005-onetime-rosh-hashanah-billing-platform-v2.md`; `tasks-pending/2026-07-13-onetime-rosh-hashanah-billing-platform-v2.md`; `ops/prompt-packets/2026-07-13-onetime-rosh-hashanah-billing-platform-v2/` | Passed / registered |
| Product quality packet | `tasks-pending/2026-07-13-onetime-rosh-hashanah-billing-platform-v2.product-quality.json`; `ops/product-quality-compiler/validation/latest-product-quality-validation.md` | Passed |
| No-trial Stripe lifecycle | `tests/stripe-billing-lifecycle.test.js`; `tests/one-time-stripe-local-beta.test.js` | Passed |
| Stripe sandbox API smoke | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/lanes/stripe-sandbox/STRIPE-SANDBOX-SMOKE.md` | Passed with synthetic test objects only |
| Billing UI before/after | `ops/ui-audits/2026-07-13-onetime-billing-ui-current-state/report.md`; `ops/ui-audits/2026-07-13-onetime-billing-ui-after/report.md` | Passed |
| Billing route-module budget | `ops/performance-audits/2026-07-13-onetime-provider-route-module-budget/report.md` | Passed |
| Sandbox E2E verifier | `ops/verifier-runs/2026-07-13-onetime-billing-sandbox-e2e/latest.md` | Passed |
| Secret handling | `npm run secrets:audit`; targeted changed-file secret scan | Passed |
| Generated Operations shell | `npm run operations:check-generated` | Passed |

## Commands Used

- `npm run stripe:sandbox-smoke`
- `npm run stripe:sandbox-e2e`
- `node --test tests/one-time-billing-sandbox-e2e-verifier.test.js tests/stripe-billing-lifecycle.test.js tests/one-time-stripe-local-beta.test.js`
- `node --test tests/one-time-provider-review-navigation.test.js tests/one-time-provider-operations-login.test.js tests/one-time-stripe-local-beta.test.js tests/stripe-billing-lifecycle.test.js tests/one-time-shared-review-branding.test.js tests/rabbi-scheller-auth-navigation-contract.test.js`
- `node scripts/audit-onetime-billing-ui-current-state.mjs --expect after --out-dir ops/ui-audits/2026-07-13-onetime-billing-ui-after`
- `node scripts/audit-onetime-provider-route-module-budget.mjs`
- `npm run operations:check-generated`
- `npm run secrets:audit`
- `git diff --check`

## Guardrails

No live charge, live checkout launch, refund, notice email send,
invoice/receipt email send, WhatsApp/Telegram send, access grant/revoke,
provider mutation, Stripe Connect setup, payout/transfer setup, credential
mutation, or production data mutation is approved by this branch.

The sandbox verifier and UI proof use synthetic TEST identities only. Stripe
secret and webhook values are read from local/Railway-safe secret surfaces where
needed and are never written into tracked files.

## Migration / Deploy Notes

- The local migration seed is
  `railway-migration-2026-06-21-one-time-trial-referral-config.sql`.
- Deploying app-visible Billing UI still requires the normal One Time deploy
  path and live smoke against the deployed SHA.
- Hosted Stripe webhook readback still needs target guard confirmation before
  any hosted webhook smoke is called complete.
- If deployment is rolled back, no live payment state should need rollback
  because this branch does not authorize live billing writes.

## Live Activation Blockers

Live activation remains blocked until Shloimie/Rabbi approve an exact final
launch packet with:

- canonical `billing_start_at` in Asia/Jerusalem;
- final live Stripe account/key/webhook readback for the One Time target;
- final live price/account/campaign/cohort confirmation;
- consent/payment-method coverage readback;
- final pre-billing notice sender, copy, recipient cohort, and send approval;
- final deployed SHA and live smoke evidence;
- explicit authorization before any live customer charge;
- explicit authorized-admin approval before any refund execution;
- explicit approval before any paid access grant/revoke automation.

## Draft PR

Draft PR URL: pending creation after this handoff is committed and pushed.
