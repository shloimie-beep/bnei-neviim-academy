#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildOneTimeTrialSignupPreview,
} = require('../src/lib/bna/one-time-launch-readiness');

const signup = buildOneTimeTrialSignupPreview({
  parent_name: 'Smoke Parent',
  email: 'smoke-parent@example.test',
  student_name: 'Smoke Student',
  referral_code: 'RABBI-SMOKE',
  source_landing_page: '/one-time?ref=RABBI-SMOKE',
}, { checkedAt: '2026-06-28T10:00:00.000Z' });

assert.equal(signup.preview_only, true);
assert.equal(signup.local_write_performed, false);
assert.equal(signup.external_write_performed, false);
assert.equal(signup.email_send_performed, false);
assert.equal(signup.stripe_checkout_created, false);
assert.equal(signup.live_charge_performed, false);
assert.equal(signup.policy.trial.card_required, false);
assert.equal(signup.policy.trial.payment_method_required_at_signup, false);
assert.equal(signup.access_status, 'trial');
assert.equal(signup.referral.captured, true);
assert.equal(signup.referral.reward_or_credit_created, false);
assert.ok(signup.required_tags.includes('trial_30_days_no_card'));

console.log(JSON.stringify({
  success: true,
  signup_flow: signup.signup_flow,
  access_status: signup.access_status,
  trial_days: signup.policy.trial.days,
  card_required: signup.policy.trial.card_required,
  referral_captured: signup.referral.captured,
  reward_or_credit_created: signup.referral.reward_or_credit_created,
  external_write_performed: signup.external_write_performed,
}, null, 2));
