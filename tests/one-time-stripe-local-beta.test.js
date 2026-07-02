const test = require('node:test');
const assert = require('node:assert/strict');

const {
  applyOneTimeStripeMockEvent,
  buildOneTimeStripeMockCheckout,
  buildOneTimeStripeMockEvent,
} = require('../src/platform/integrations/stripe-local-beta');
const {
  buildOneTimeIntegrationReadinessPayload,
} = require('../src/platform/integrations/readiness');

test('One Time Stripe local beta checkout is a no-write 67 dollar mock', () => {
  const checkout = buildOneTimeStripeMockCheckout({
    parent_name: 'Test Parent',
    email: 'parent@example.test',
    student_name: 'Test Student',
  });

  assert.equal(checkout.provider, 'stripe');
  assert.equal(checkout.mode, 'test_mock');
  assert.equal(checkout.preview_only, true);
  assert.equal(checkout.external_write_performed, false);
  assert.equal(checkout.live_charge_performed, false);
  assert.equal(checkout.amount_cents, 6700);
  assert.equal(checkout.currency, 'usd');
  assert.equal(checkout.enrollment_after_paid, false);
  assert.equal(checkout.signup_card_required, false);
  assert.equal(checkout.payment_method_required_at_signup, false);
  assert.equal(checkout.automatic_tax_enabled, false);
  assert.equal(checkout.stripe_connect_required, false);
  assert.equal(checkout.grace_period_days, 0);
  assert.equal(checkout.access_during_grace, false);
});

test('paid Stripe mock event grants One Time access once and is idempotent', () => {
  const checkout = buildOneTimeStripeMockCheckout({ email: 'parent@example.test' });
  const paid = buildOneTimeStripeMockEvent('paid', checkout);
  const first = applyOneTimeStripeMockEvent(checkout, paid);
  const replay = applyOneTimeStripeMockEvent(checkout, paid, first);

  assert.equal(paid.event_type, 'checkout.session.completed');
  assert.equal(paid.payment_status, 'paid');
  assert.equal(first.enrollment_status, 'converted_to_paid');
  assert.equal(first.access_status, 'active_paid');
  assert.deepEqual(first.actions, ['convert_trial_to_paid_access_mock', 'prepare_mock_receipt']);
  assert.equal(replay.duplicate, true);
  assert.deepEqual(replay.actions, []);
});

test('One Time trial signup requires no card, checkout, or live charge', () => {
  const signup = require('../src/platform/integrations/stripe-local-beta').buildOneTimeStripeTrialSignup({
    email: 'parent@example.test',
    referral_code: 'RABBI-LAUNCH',
  }, { checkedAt: '2026-06-28T12:00:00.000Z' });

  assert.equal(signup.access_status, 'trial');
  assert.equal(signup.stripe_checkout_created, false);
  assert.equal(signup.live_charge_performed, false);
  assert.equal(signup.policy.trial.card_required, false);
  assert.equal(signup.policy.trial.payment_method_required_at_signup, false);
  assert.equal(signup.policy.grace_period.days, 0);
  assert.equal(signup.referral.captured, true);
  assert.ok(signup.required_tags.includes('trial_30_days_no_card'));
});

test('failed, expired, canceled, and refunded Stripe mock events avoid live writes', () => {
  const checkout = buildOneTimeStripeMockCheckout({ email: 'parent@example.test' });

  for (const kind of ['failed', 'expired', 'canceled']) {
    const event = buildOneTimeStripeMockEvent(kind, checkout);
    const result = applyOneTimeStripeMockEvent(checkout, event);
    assert.equal(result.external_write_performed, false);
    assert.equal(result.enrollment_status, 'not_enrolled');
    assert.equal(result.access_status, 'not_granted');
    assert.ok(result.actions.includes('route_to_manual_or_recovery_review'));
  }

  const refund = buildOneTimeStripeMockEvent('refunded', checkout);
  const refundResult = applyOneTimeStripeMockEvent(checkout, refund);
  assert.equal(refundResult.payment_status, 'refunded');
  assert.equal(refundResult.refund_status, 'mock_refund_recorded');
  assert.equal(refundResult.access_status, 'refund_review');
  assert.ok(refundResult.actions.includes('hold_access_change_for_policy'));
});

test('One Time readiness includes Stripe as a local/mock integration card', () => {
  const payload = buildOneTimeIntegrationReadinessPayload({
    stripeReadiness: { configured: true, connected: true, mode: 'test_mock', account_owner: 'Shloimie' },
  });
  const stripe = payload.cards.find((card) => card.provider === 'stripe');

  assert.ok(stripe);
  assert.equal(stripe.test_connection.mode, 'mock');
  assert.equal(stripe.test_connection.external_write_performed, false);
  assert.ok(stripe.safe_actions.includes('checkout_mock_preview'));
  assert.ok(stripe.safe_actions.includes('webhook_mock_event'));
  assert.ok(stripe.blocked_actions.includes('live_charge'));
});
