#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  ONE_TIME_DOMAIN,
  buildOneTimeEmailWorkflowPreview,
  buildOneTimeStripeTrialPolicy,
} = require('../src/lib/bna/one-time-launch-readiness');
const {
  buildOneTimeIntegrationReadinessPayload,
} = require('../src/platform/integrations/readiness');
const {
  buildOneTimeMediaPipelinePreview,
} = require('../src/platform/integrations/media-local-pipeline');
const {
  buildOneTimeStripeMockCheckout,
} = require('../src/platform/integrations/stripe-local-beta');

const readiness = buildOneTimeIntegrationReadinessPayload({
  videoHostingReadiness: { configured: true, connected: false, mode: 'preview_only', account_owner: 'Rabbi Elie Scheller' },
  resendReadiness: { configured: true, connected: false, domain: ONE_TIME_DOMAIN, domain_verified: false },
  stripeReadiness: { configured: true, connected: false, mode: 'test_mock', account_owner: 'Rabbi Elie Scheller' },
});
const media = buildOneTimeMediaPipelinePreview({
  source_type: 'vimeo_asset',
  vimeo_url: 'https://vimeo.com/987654321',
  class_title: 'One Time smoke preview',
}, {
  videoHostingReadiness: { configured: true, connected: false, mode: 'preview_only' },
});
const email = buildOneTimeEmailWorkflowPreview({ resendReadiness: { configured: true, domain: ONE_TIME_DOMAIN } });
const stripe = buildOneTimeStripeMockCheckout({ email: 'smoke@example.test' });
const policy = buildOneTimeStripeTrialPolicy();

assert.equal(readiness.preview_only, true);
assert.equal(readiness.external_write_performed, false);
assert.equal(media.external_write_performed, false);
assert.equal(media.member_library_publish_performed, false);
assert.equal(email.email_send_performed, false);
assert.equal(email.bulk_send_enabled, false);
assert.equal(stripe.live_charge_performed, false);
assert.equal(stripe.enrollment_after_paid, false);
assert.equal(policy.trial.card_required, false);
assert.equal(policy.grace_period.days, 0);

console.log(JSON.stringify({
  success: true,
  preview_only: true,
  external_write_performed: false,
  readiness_cards: readiness.cards.map((card) => ({ provider: card.provider, status: card.status, blocked_actions: card.blocked_actions })),
  vimeo_publish_performed: media.member_library_publish_performed,
  email_send_performed: email.email_send_performed,
  stripe_live_charge_performed: stripe.live_charge_performed,
  stripe_card_required_at_signup: policy.trial.card_required,
}, null, 2));
