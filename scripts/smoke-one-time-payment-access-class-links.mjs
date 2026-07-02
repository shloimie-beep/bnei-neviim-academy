#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildOneTimeClassCourseIngestionPreview,
} = require('../src/platform/ingestion/one-time-class-course-builder');
const {
  applyOneTimeStripeMockEvent,
  buildOneTimeStripeMockCheckout,
  buildOneTimeStripeMockEvent,
  buildOneTimeStripeTrialSignup,
} = require('../src/platform/integrations/stripe-local-beta');

function unwrap(result, label) {
  assert.equal(result.ok, true, `${label} should be ok: ${result.error?.message || ''}`);
  return result.data;
}

const signup = buildOneTimeStripeTrialSignup({
  parent_name: 'Smoke Parent',
  email: 'smoke-parent@example.test',
  student_name: 'Smoke Student',
});
const checkout = buildOneTimeStripeMockCheckout({ email: 'smoke-parent@example.test' });
const paid = buildOneTimeStripeMockEvent('paid', checkout);
const payment = applyOneTimeStripeMockEvent(checkout, paid);
const classDraft = unwrap(buildOneTimeClassCourseIngestionPreview({
  raw_id: 'RAW-20260628-SMOKE-CLASS',
  source_type: 'vimeo_asset',
  provider_asset_id: 'vimeo-smoke-001',
  vimeo_url: 'https://vimeo.com/987654321',
  raw_text: 'Course: One Time Smoke Course. Module 1: Launch Readiness. Lesson: Payment access link smoke. Vimeo: https://vimeo.com/987654321. Do not publish this yet.',
}), 'class link preview');

assert.equal(signup.access_status, 'trial');
assert.equal(signup.stripe_checkout_created, false);
assert.equal(checkout.enrollment_after_paid, false);
assert.equal(checkout.signup_card_required, false);
assert.equal(payment.enrollment_status, 'converted_to_paid');
assert.equal(payment.access_status, 'active_paid');
assert.equal(classDraft.external_write_performed, false);
assert.equal(classDraft.live_publish_performed, false);
assert.equal(classDraft.flow_coverage.video_reference, 'drafted');
assert.equal(classDraft.flow_coverage.publish, 'blocked_or_not_requested');

console.log(JSON.stringify({
  success: true,
  trial_access_status: signup.access_status,
  signup_checkout_created: signup.stripe_checkout_created,
  checkout_enrollment_after_paid: checkout.enrollment_after_paid,
  payment_enrollment_status: payment.enrollment_status,
  payment_access_status: payment.access_status,
  class_video_reference: classDraft.flow_coverage.video_reference,
  class_publish: classDraft.flow_coverage.publish,
  external_write_performed: false,
}, null, 2));
