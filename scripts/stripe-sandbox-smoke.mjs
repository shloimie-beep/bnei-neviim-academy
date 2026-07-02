#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  applyOneTimeStripeMockEvent,
  buildOneTimeStripeMockCheckout,
  buildOneTimeStripeMockEvent,
  buildOneTimeStripeTrialPolicy,
  buildOneTimeStripeTrialSignup,
} = require('../src/platform/integrations/stripe-local-beta');

const policy = buildOneTimeStripeTrialPolicy();
const signup = buildOneTimeStripeTrialSignup({ email: 'sandbox@example.test' });
const checkout = buildOneTimeStripeMockCheckout({ email: 'sandbox@example.test' });
const paid = buildOneTimeStripeMockEvent('paid', checkout);
const first = applyOneTimeStripeMockEvent(checkout, paid);
const replay = applyOneTimeStripeMockEvent(checkout, paid, first);
const failed = applyOneTimeStripeMockEvent(checkout, buildOneTimeStripeMockEvent('failed', checkout));

assert.equal(policy.stripe_only, true);
assert.equal(policy.stripe_connect_required, false);
assert.equal(policy.live_billing_enabled, false);
assert.equal(policy.automatic_tax_enabled, false);
assert.equal(policy.refund_policy, 'no_refunds');
assert.equal(policy.trial.days, 30);
assert.equal(policy.trial.card_required, false);
assert.equal(policy.trial.payment_method_required_at_signup, false);
assert.equal(policy.grace_period.days, 0);
assert.equal(policy.grace_period.access_during_grace, false);
assert.equal(signup.stripe_checkout_created, false);
assert.equal(signup.live_charge_performed, false);
assert.equal(checkout.signup_card_required, false);
assert.equal(checkout.automatic_tax_enabled, false);
assert.equal(checkout.enrollment_after_paid, false);
assert.equal(first.enrollment_status, 'converted_to_paid');
assert.equal(first.access_status, 'active_paid');
assert.equal(replay.duplicate, true);
assert.equal(failed.access_status, 'not_granted');

console.log(JSON.stringify({
  success: true,
  mode: checkout.mode,
  trial_days: policy.trial.days,
  card_required_at_signup: policy.trial.card_required,
  payment_method_required_at_signup: policy.trial.payment_method_required_at_signup,
  grace_period_days: policy.grace_period.days,
  access_during_grace: policy.grace_period.access_during_grace,
  automatic_tax_enabled: policy.automatic_tax_enabled,
  stripe_connect_required: policy.stripe_connect_required,
  live_charge_performed: checkout.live_charge_performed,
  paid_event_access_status: first.access_status,
  replay_duplicate: replay.duplicate,
}, null, 2));
