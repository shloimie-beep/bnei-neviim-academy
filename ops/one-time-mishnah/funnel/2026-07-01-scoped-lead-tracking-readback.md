# One Time Scoped Lead Tracking Readback

Date: 2026-07-01

Requirement: `REQ-20260701-603`

## Result

The `/api/one-time/interest` signup path now writes only first-party, scoped
One Time tracking records:

- `bna_product_leads` scoped by `project_id` and `program_key =
  one_time_mishnah_class`
- `bna_contacts` scoped to the Rabbi Sheller provider workspace
- `bna_parent_leads` scoped by `project_id`
- `bna_contact_communications` internal note scoped by `project_id`

Duplicate signups are deduped by scoped email/phone lookup. A duplicate updates
or links the same product lead, contact, and parent lead while adding a new
internal note event.

## Safety

- No GHL, GoHighLevel, LeadConnector, or external CRM runtime was added.
- No imported lead/contact was sent to.
- No email, WhatsApp, Stripe, checkout, payment, access grant, DNS mutation, or
  social publish action ran.
- The live smoke used a synthetic `example.test` address and recorded no real
  recipient data.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/one-time-launch-readiness.test.js`
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/one-time-launch-readiness.test.js tests/resend-inbound-crm.test.js tests/communications-integrations-contract.test.js tests/watchdog-route-security.test.js tests/watchdog-action-registry.test.js`
- PASS `npm run watchdog:security`
- PASS `npm run watchdog:actions`
- PASS `node scripts/generate-one-time-action-coverage.mjs`
- PASS `node scripts/generate-universal-action-parity.mjs`
- PASS Railway deployment `4fae9506-f07c-4d49-b01a-f200d392ce27` reached `SUCCESS`
- PASS live BNA fallback synthetic signup smoke:
  `ops/live-smokes/2026-07-01T15-18-00Z-one-time-scoped-lead-tracking-live-smoke.md`

## Live Smoke Summary

The first synthetic POST created scoped local records. The second synthetic POST
with the same identity returned the same product/contact/parent-lead IDs and
reported `updated_existing_product_lead`.

Returned guardrails stayed true:

- `no_send`
- `no_checkout`
- `no_access_granted`
- `external_write_performed: false`
- `trial_signup.email_send_performed: false`
- `trial_signup.stripe_checkout_created: false`
