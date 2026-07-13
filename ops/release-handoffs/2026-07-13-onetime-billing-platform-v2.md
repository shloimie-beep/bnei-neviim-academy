# One Time Provider Billing Platform V2 Release Handoff

Status: draft PR mergeable; live activation blocked
Branch: `codex/onetime-rosh-hashanah-billing-platform-v2`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Primary requirements: `REQ-20260713-950` through `REQ-20260713-963`
Branch head at latest merge verification: `ea909d4d47b421f71976897f86fdd79b330fced1`
Current master/base SHA: `10960a86bba30aede6c72075ef1b5eb1a529f54d`
Draft PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/132
Release owner: release/integration agent after final operator launch packet

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
| Old-policy active audit | `ops/audits/2026-07-13-onetime-billing-v2-old-policy-active-audit.md`; parent invite/email/review fixtures/prompt cleanup | Passed locally; live activation still blocked |
| No-trial Stripe lifecycle | `tests/stripe-billing-lifecycle.test.js`; `tests/one-time-stripe-local-beta.test.js` | Passed |
| Stripe sandbox API smoke | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/lanes/stripe-sandbox/STRIPE-SANDBOX-SMOKE.md` | Passed with synthetic test objects only |
| Billing UI before/after | `ops/ui-audits/2026-07-13-onetime-billing-ui-current-state/report.md`; `ops/ui-audits/2026-07-13-onetime-billing-ui-after/report.md` | Passed |
| Billing route-module budget | `ops/performance-audits/2026-07-13-onetime-provider-route-module-budget/report.md` | Passed |
| Sandbox E2E verifier | `ops/verifier-runs/2026-07-13-onetime-billing-sandbox-e2e/latest.md` | Passed |
| Hosted Railway Stripe readback | `ops/deploy-readbacks/2026-07-13-onetime-billing-railway-readback.md`; `ops/deploy-readbacks/2026-07-13-onetime-billing-railway-propagation.md` | Passed for sandbox/test config; no deploy triggered |
| Branch/PR mergeability | PR #132 at latest verified merge `ea909d4d47b421f71976897f86fdd79b330fced1`; base `10960a86bba30aede6c72075ef1b5eb1a529f54d` | Passed: GitHub merge state `CLEAN`, draft/open |
| Secret handling | `npm run secrets:audit`; targeted changed-file secret scan | Passed |
| Generated Operations shell | `npm run operations:check-generated` | Passed |

## Commands Used

- `npm run stripe:sandbox-smoke`
- `npm run stripe:sandbox-e2e`
- `npm run stripe:railway-propagate`
- `npm run stripe:railway-readback`
- `node --test tests/one-time-billing-sandbox-e2e-verifier.test.js tests/stripe-billing-lifecycle.test.js tests/one-time-stripe-local-beta.test.js`
- `node --test tests/one-time-parent-trial-invite.test.js`
- `node --test tests/one-time-shared-review-branding.test.js tests/agent-review-hub.test.js`
- `node scripts/watchdog-workspace-scope-guardrails.mjs`
- `npm run watchdog:protocol-drift`
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
- Hosted Stripe/Railway readback now confirms the One Time target has test-mode
  Rabbi Stripe config, webhook secret, and price reference without triggering a
  deploy. Hosted webhook delivery still needs deployed-SHA live smoke before it
  can be called complete.
- If deployment is rolled back, no live payment state should need rollback
  because this branch does not authorize live billing writes.

## Live Activation Blockers

Live activation remains blocked until Shloimie/Rabbi approve an exact final
launch packet with:

- canonical `billing_start_at` in Asia/Jerusalem;
- final live Stripe account/key/webhook approval for the One Time target;
- final live price/account/campaign/cohort confirmation;
- consent/payment-method coverage readback;
- final pre-billing notice sender, copy, recipient cohort, and send approval;
- final deployed SHA and live smoke evidence;
- explicit authorization before any live customer charge;
- explicit authorized-admin approval before any refund execution;
- explicit approval before any paid access grant/revoke automation.

## Draft PR

Draft PR URL: https://github.com/shloimie-beep/bnei-neviim-academy/pull/132
Draft PR merge state: `CLEAN`, verified after the latest handoff refresh.
Latest merged base in this branch is
`10960a86bba30aede6c72075ef1b5eb1a529f54d`; latest verified merge commit is
`ea909d4d47b421f71976897f86fdd79b330fced1`.

## Final Report

### Policy Correction

- Superseded old active policy: One Time 30-day Stripe trial.
- New policy: Rosh Hashanah application-level promotional access followed by
  no-trial `$67/month` recurring billing only after consent, payment readiness,
  notice, and final launch approval.
- Historical trial evidence is preserved as provenance; new checkout and
  lifecycle paths do not use Stripe trial fields.
- Parent invite/email/review fixtures now present active access as
  promotional access with `trial_days: 0`, `stripe_trial_enabled: false`, no
  checkout, and no payment creation.

### Product

- Product: One Time Mishnayos Membership.
- Price model: `$67/month`, USD, recurring monthly, tax-exclusive.
- Provider account owner: Rabbi Eli Scheller.
- Future-provider architecture: provider-scoped account binding; no BNA/One
  Time credential reuse.
- Out of scope: Stripe Connect, transfers, payouts, commissions, or revenue
  splitting.

### Campaign

- Campaign key: Rosh Hashanah promotional-access conversion.
- Canonical timezone: Asia/Jerusalem.
- Live `billing_start_at`: still requires final operator/Rabbi approval.
- Noneligible members without consent/payment method remain `payment_required`
  and must not be charged.

### Stripe

- Current hosted configuration: One Time Railway target has test-mode Rabbi
  Stripe key presence, webhook secret presence, price reference presence, and
  live-billing disabled flags by redacted readback.
- Sandbox verifier proves checkout/subscription payloads omit trial fields,
  webhook signatures are verified, replay is idempotent, failed payment
  suspends access immediately, recovery restores access, and cancellation keeps
  access through the paid period.
- No live customer, real money, real email send, refund execution, or paid
  access mutation was performed.

### Policies And Automations

- No grace period after failed payment.
- Cancellation is cancel-at-period-end by default.
- Refunds are manual exceptional-review only; no automatic/prorated refunds.
- Notice, invoice/receipt, refund, and access automation states are modeled as
  preview/gated paths until exact live approval.

### UI

- Billing UI exists inside the dedicated One Time provider shell with Overview,
  Catalog, Billing, Automations, and Settings categories.
- UI actions for live billing, notice sends, refunds, and access mutation remain
  disabled/gated with explicit blockers.
- Responsive/current-state proof and route-module budget evidence are linked in
  the verification matrix.

### Verification

- Sandbox E2E verifier: passed.
- Hosted Railway Stripe readback: ready `2/2`.
- Focused Billing/provider/Stripe/auth tests: passed in this branch history.
- Secret audit: passed, with no tracked Stripe/webhook secret values.
- Generated Operations shell check: passed.
- `npm run bna:run:validate` is still blocked by unrelated shared-CRM evidence
  paths outside this Billing V2 branch scope.

### Remaining Live Blockers

- Exact `billing_start_at` in Asia/Jerusalem.
- Final live Stripe account/key/webhook approval and readback.
- Final live price/account/campaign/cohort confirmation.
- Consent/payment-method coverage readback.
- Final notice sender, copy, recipient cohort, suppressions, and send approval.
- Final deployed SHA and live smoke.
- Explicit authorization before live charge, refund execution, or paid access
  grant/revoke automation.
