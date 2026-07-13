# One Time Billing V2 Old-Policy Active Audit

Date: 2026-07-13

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

Requirement: `REQ-20260713-951`

## Result

This slice retired the remaining active customer/review-facing 30-day trial language from the parent invite route, invite email, public helper copy, review prompts, review fixtures, campaign headline, and workspace-scope watchdog.

New parent invite writes now use promotional-access policy metadata:

- `policy_key: one_time_rosh_hashanah_promotional_access`
- `conversion_policy_key: one_time_rosh_hashanah_paid_conversion`
- `offer_key: membership_67_monthly`
- `trial_days: 0`
- `stripe_trial_enabled: false`
- `promotional_access: true`
- `no_payment_created: true`
- `no_checkout_created: true`

The route/template names `parent-trial-invite`, `ONE_TIME_PARENT_TRIAL_*`, and `parent_trial_invite` remain as compatibility identifiers only. New tags/source metadata use promotional access naming; legacy trial tags/source values are only used to find/update old records instead of orphaning them.

## Remaining Match Classification

Historical/provenance only:

- `tasks-pending/2026-07-13-onetime-rosh-hashanah-billing-platform-v2.md`
- `ops/release-handoffs/2026-07-13-onetime-billing-platform-v2.md`
- `ops/prompt-packets/2026-07-13-onetime-rosh-hashanah-billing-platform-v2/*`

Compatibility / migration identifiers:

- `/api/bna/one-time/parent-trial-invite`
- `ONE_TIME_PARENT_TRIAL_PASSWORD_SETUP_TTL_MS`
- `ONE_TIME_PARENT_TRIAL_INVITE_CONFIRM`
- `parent_trial_invite`
- `oneTimeParentTrialInvitePreflight`

Legacy event ignore tests:

- `customer.subscription.trial_will_end` remains in billing lifecycle tests and sandbox verifier only to prove superseded Stripe trial events are ignored and do not create trial state.

Unrelated 30-day references:

- Operations "Last 30 days" filters
- BNA withdrawal/notice documents
- Public BNA shared 30-day trip goal copy

Still not Billing V2 proof:

- `scripts/smoke-one-time-trial-referral-live.mjs` is a legacy smoke and should remain superseded until replaced by a no-trial Rosh Hashanah billing smoke.
- `scripts/smoke-owner-review-external-readiness.mjs` still checks an old local beta trial shape and should not be used as Billing V2 evidence until updated.

## Verification

Passed:

- `node --check server.js`
- `node --test tests/one-time-parent-trial-invite.test.js`
- `node --test tests/one-time-shared-review-branding.test.js tests/agent-review-hub.test.js`
- `node --test tests/one-time-stripe-local-beta.test.js tests/stripe-billing-lifecycle.test.js tests/one-time-billing-sandbox-e2e-verifier.test.js tests/one-time-billing-railway-readback.test.js`
- `node scripts/watchdog-workspace-scope-guardrails.mjs`
- `npm run watchdog:protocol-drift`
- `npm run secrets:audit`
- `git diff --check`

## Remaining Blockers

This audit does not authorize live charges, live refunds, live access mutation, broadcast email, or production deployment. Billing V2 activation still requires exact `billing_start_at`, final notice sender/copy/cohort approval, final live Stripe approval, deploy/live smoke, and explicit launch authorization.
