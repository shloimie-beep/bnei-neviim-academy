# stripe-sandbox Tests

Actual verification:

- `node --check src/lib/billing/stripe-billing-lifecycle.js` - passed.
- `node --check src/lib/integrations/stripe.js` - passed.
- `node --check scripts/smoke-stripe-sandbox-billing.mjs` - passed.
- `node --test tests/stripe-billing-lifecycle.test.js` - passed 7/7.
- `node --test tests/stripe-billing-lifecycle.test.js tests/one-time-stripe-local-beta.test.js tests/one-time-resend-vimeo-stripe-safe-smoke.test.js tests/rabbi-checkout-access.test.js` - passed 21/21.
- `npm run stripe:sandbox-smoke` - passed with status `live_key_blocked`; no Stripe API writes were attempted because a live key is configured and a test key is missing.
- `git diff --check` - passed.
- `npm run secrets:audit` - passed; 4351 tracked paths checked, 0 tracked secret-risk files found.

Smoke evidence:

- `STRIPE-SANDBOX-SMOKE.md`
- `STRIPE-OBJECTS-REDACTED.json`
- timestamped smoke JSON/Markdown in this lane folder.
