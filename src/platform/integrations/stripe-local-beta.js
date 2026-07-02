const {
  buildOneTimeProductConfig,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
} = require('../instances/one-time');
const {
  buildOneTimeStripeTrialPolicy,
  buildOneTimeTrialSignupPreview,
} = require('../../lib/bna/one-time-launch-readiness');
const {
  buildPaymentEventKey,
  stripeCheckoutStatus,
} = require('../../lib/bna/rabbi-payments');

const ONE_TIME_STRIPE_MOCK_EVENT_TYPES = Object.freeze({
  paid: 'checkout.session.completed',
  failed: 'payment_intent.payment_failed',
  expired: 'checkout.session.expired',
  canceled: 'payment_intent.canceled',
  refunded: 'charge.refunded',
});

function cleanIdPart(value = 'mock') {
  return String(value || 'mock')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'mock';
}

function buildOneTimeStripeMockCheckout(input = {}, options = {}) {
  const product = buildOneTimeProductConfig(options.product || {}).primary_offer;
  const policy = buildOneTimeStripeTrialPolicy(options.policy || {});
  const email = String(input.email || input.parent_email || 'parent@example.test').trim().toLowerCase();
  const studentName = String(input.student_name || input.studentName || 'Synthetic Student').trim();
  const checkoutId = input.checkout_session_id
    || input.checkoutSessionId
    || `cs_test_onetime_${cleanIdPart(email)}`;
  return {
    provider: 'stripe',
    mode: 'test_mock',
    preview_only: true,
    external_write_performed: false,
    live_charge_performed: false,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    product_key: 'one_time_mishnah_class',
    offer_key: product.key,
    checkout_session_id: checkoutId,
    payment_link_id: input.payment_link_id || 'plink_test_onetime_67_mock',
    amount_cents: product.price_cents,
    currency: product.currency.toLowerCase(),
    parent: {
      name: String(input.parent_name || input.parentName || 'Synthetic Parent').trim(),
      email,
    },
    student: {
      name: studentName,
      synthetic_id: input.student_id || input.studentId || `student_${cleanIdPart(studentName)}`,
    },
    status: 'conversion_checkout_preview',
    idempotency_key: `one_time_checkout:${checkoutId}`,
    enrollment_after_paid: false,
    signup_card_required: false,
    signup_checkout_required: false,
    payment_method_required_at_signup: false,
    collection_phase: 'near_or_after_trial_conversion',
    automatic_tax_enabled: false,
    stripe_connect_required: false,
    refund_policy: 'no_refunds',
    grace_period_days: policy.grace_period.days,
    access_during_grace: policy.grace_period.access_during_grace,
    trial_days: policy.trial.days,
    receipt_after_paid: true,
    refund_cancel_supported: false,
    live_cancellation_workflow_enabled: false,
  };
}

function buildOneTimeStripeTrialSignup(input = {}, options = {}) {
  return buildOneTimeTrialSignupPreview(input, options);
}

function buildOneTimeStripeMockEvent(kind = 'paid', checkout = {}, overrides = {}) {
  const normalizedKind = ONE_TIME_STRIPE_MOCK_EVENT_TYPES[kind] ? kind : 'paid';
  const eventType = overrides.event_type || overrides.eventType || ONE_TIME_STRIPE_MOCK_EVENT_TYPES[normalizedKind];
  const checkoutId = checkout.checkout_session_id || overrides.checkout_session_id || 'cs_test_onetime_mock';
  const object = {
    id: checkoutId,
    payment_status: normalizedKind === 'paid' ? 'paid' : normalizedKind,
    amount_total: checkout.amount_cents || 6700,
    currency: checkout.currency || 'usd',
    customer_email: checkout.parent?.email || overrides.email || 'parent@example.test',
    ...overrides.object,
  };
  const paymentStatus = normalizedKind === 'refunded'
    ? 'refunded'
    : stripeCheckoutStatus(eventType, object);
  const eventId = overrides.event_id || overrides.eventId || `evt_test_onetime_${normalizedKind}_${cleanIdPart(checkoutId)}`;
  return {
    provider: 'stripe',
    mode: 'test_mock',
    external_write_performed: false,
    event_id: eventId,
    event_type: eventType,
    checkout_session_id: checkoutId,
    payment_status: paymentStatus,
    payment_event_key: buildPaymentEventKey({
      provider: 'stripe',
      eventId,
      eventType,
      checkoutId,
      email: object.customer_email,
      amount: object.amount_total,
    }),
    object,
  };
}

function applyOneTimeStripeMockEvent(checkout = {}, event = {}, state = {}) {
  const processed = new Set(Array.isArray(state.processed_event_keys) ? state.processed_event_keys : []);
  const key = event.payment_event_key || buildPaymentEventKey({
    provider: 'stripe',
    eventId: event.event_id,
    eventType: event.event_type,
    checkoutId: event.checkout_session_id || checkout.checkout_session_id,
  });
  if (processed.has(key)) {
    return {
      duplicate: true,
      external_write_performed: false,
      payment_status: event.payment_status || 'duplicate',
      enrollment_status: state.enrollment_status || 'unchanged',
      access_status: state.access_status || 'unchanged',
      processed_event_keys: [...processed],
      actions: [],
    };
  }

  processed.add(key);
  const status = event.payment_status || stripeCheckoutStatus(event.event_type, event.object || {});
  const result = {
    duplicate: false,
    external_write_performed: false,
    payment_status: status,
    processed_event_keys: [...processed],
    actions: [],
  };

  if (status === 'paid') {
    result.enrollment_status = 'converted_to_paid';
    result.access_status = 'active_paid';
    result.receipt_status = 'mock_receipt_ready';
    result.actions.push('convert_trial_to_paid_access_mock', 'prepare_mock_receipt');
  } else if (status === 'refunded') {
    result.enrollment_status = 'paused_pending_refund_policy';
    result.access_status = 'refund_review';
    result.refund_status = 'mock_refund_recorded';
    result.actions.push('record_mock_refund', 'hold_access_change_for_policy');
  } else if (['failed', 'expired', 'canceled'].includes(status)) {
    result.enrollment_status = 'not_enrolled';
    result.access_status = 'not_granted';
    result.actions.push('route_to_manual_or_recovery_review');
  } else {
    result.enrollment_status = 'manual_review';
    result.access_status = 'not_granted';
    result.actions.push('route_to_manual_review');
  }

  return result;
}

module.exports = {
  ONE_TIME_STRIPE_MOCK_EVENT_TYPES,
  applyOneTimeStripeMockEvent,
  buildOneTimeStripeMockCheckout,
  buildOneTimeStripeMockEvent,
  buildOneTimeStripeTrialPolicy,
  buildOneTimeStripeTrialSignup,
};
