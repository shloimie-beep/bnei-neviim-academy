# Lane Handoff - stripe-sandbox

| Field | Value |
|---|---|
| Branch | `codex/closeout-stripe-sandbox-20260624` |
| Base | `161f8623c50d7ef226066d101bfa58c28aff2346` |
| Owner | Codex lane worker |
| Scope | Stripe integration modules, billing-domain modules, webhook lifecycle logic, entitlement state mapping, schema proposal, Stripe tests, and lane evidence. |
| Forbidden central files | Do not edit `server.js`, existing portal HTML, central run/task/memory/ledger/changelog/control files. Route/UI wiring is in `SHARED-PATCH.diff`. |

## Objective

Close sandbox billing readiness with credential-free lifecycle coverage and an
optional Stripe test-mode smoke when sandbox credentials are already configured.
Live mode remains disabled unless a later final integrator has explicit live
billing approval and approved billing policy Decisions.

## Current State

- Implementation module: `src/lib/billing/stripe-billing-lifecycle.js`.
- Existing wrapper exports lifecycle helpers through `src/lib/integrations/stripe.js`.
- Sandbox smoke command: `npm run stripe:sandbox-smoke`.
- Schema proposal: `migrations/parallel-20260624-stripe-billing-lifecycle.sql`.
- Shared route/UI wiring proposal: `SHARED-PATCH.diff`.
- Verification passed: focused Stripe/Rabbi tests 21/21, `git diff --check`,
  `npm run secrets:audit`, and sandbox smoke evidence.
- Sandbox API writes were blocked because the configured Stripe key is live,
  not test mode. Missing setup is recorded in `STRIPE-SANDBOX-SMOKE.md`.

## Guardrails

- No real customer data, payment methods, live charges, refunds, or live subscriptions.
- Test-mode Stripe object creation is allowed only when a test key passes account readback.
- Live keys are recorded as blocked; a live key alone never enables live mode.
- Secret values are redacted from reports, tests, and browser-safe payloads.

## Remaining External Setup

- Add a test-mode `STRIPE_SECRET_KEY` or `RABBI_STRIPE_SECRET_KEY`.
- Add `STRIPE_WEBHOOK_SECRET` or `RABBI_STRIPE_WEBHOOK_SECRET`.
- Set `STRIPE_ACCOUNT_OWNER`.
- Approve live billing policy Decisions before any live enablement.
