const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const stripe = require('../src/lib/integrations/stripe');

const {
  BillingLifecycleError,
  STRIPE_CONFIG_STATES,
  aggregateProviderRevenue,
  applyStripeBillingEvent,
  assertBrowserSafeStripePayload,
  buildLifecycleFinalAudit,
  buildProductPriceMap,
  buildSafeBillingPreview,
  buildSyntheticStripeEvent,
  createInitialBillingState,
  createStripeCheckoutSession,
  resolveBillingPolicy,
  resolveStripeBillingConfig,
  safeConfigView,
  verifyStripeWebhookSignature,
} = stripe;

const TEST_SECRET = 'sk_test_unit';
const LIVE_SECRET = 'sk_live_unit';
const WEBHOOK_SECRET = 'webhook-unit-secret';

function sandboxReadyConfig() {
  return resolveStripeBillingConfig({
    secretKey: TEST_SECRET,
    webhookSecret: WEBHOOK_SECRET,
    mode: 'test',
    accountOwner: 'Synthetic Stripe Test Owner',
    sandboxApiVerified: true,
    sandboxAccountLivemode: false,
  });
}

function priceMap(policy = resolveBillingPolicy()) {
  return buildProductPriceMap({
    policy,
    priceIds: {
      membership_67_monthly: 'price_test_membership_67_monthly',
    },
  });
}

test('Stripe billing config exposes exact states without inferring live mode from key presence', () => {
  assert.deepEqual(STRIPE_CONFIG_STATES, [
    'not_configured',
    'sandbox_configured',
    'sandbox_invalid',
    'sandbox_ready',
    'live_configured',
    'live_disabled',
    'live',
  ]);

  assert.equal(resolveStripeBillingConfig({}).state, 'not_configured');
  assert.equal(resolveStripeBillingConfig({ secretKey: TEST_SECRET, mode: 'test', accountOwner: 'Owner' }).state, 'sandbox_configured');
  assert.equal(sandboxReadyConfig().state, 'sandbox_ready');
  assert.equal(resolveStripeBillingConfig({ secretKey: TEST_SECRET, mode: 'live', accountOwner: 'Owner' }).state, 'sandbox_invalid');

  const liveConfigured = resolveStripeBillingConfig({ secretKey: LIVE_SECRET, mode: 'test', accountOwner: 'Owner' });
  assert.equal(liveConfigured.state, 'live_configured');
  assert.equal(liveConfigured.effective_mode, 'disabled_live');
  assert.equal(liveConfigured.safe_to_create_live_charge, false);

  const wrapperLiveConfigured = stripe.getStripeBillingRuntimeState({
    config: {
      secretKey: LIVE_SECRET,
      webhookSecret: '',
      mode: 'live',
      modeHint: '',
      accountOwner: 'Owner',
    },
  });
  assert.equal(wrapperLiveConfigured.state, 'live_configured');
  assert.equal(wrapperLiveConfigured.safe_to_create_live_charge, false);

  const liveDisabled = resolveStripeBillingConfig({ secretKey: LIVE_SECRET, mode: 'live', accountOwner: 'Owner' });
  assert.equal(liveDisabled.state, 'live_disabled');
  assert.equal(liveDisabled.safe_to_create_checkout_session, false);
});

test('safe config and preview payloads isolate secrets from browser-safe output', () => {
  const config = sandboxReadyConfig();
  const safe = safeConfigView({
    ...config,
    secretKey: TEST_SECRET,
    webhookSecret: WEBHOOK_SECRET,
  });
  const safeText = JSON.stringify(safe);
  assert.doesNotMatch(safeText, /sk_test_/);
  assert.doesNotMatch(safeText, /whsec_/);
  assert.equal(safe.secrets_included, false);

  const preview = buildSafeBillingPreview({
    config: {
      secretKey: TEST_SECRET,
      webhookSecret: WEBHOOK_SECRET,
      mode: 'test',
      accountOwner: 'Owner',
      sandboxApiVerified: true,
    },
    priceIds: {
      membership_67_monthly: 'price_test_preview',
    },
    request: {
      member_id: 'member_1',
      customer_email: 'stripe-preview@example.invalid',
    },
  });
  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.secrets_included, false);
  assert.doesNotMatch(JSON.stringify(preview), /sk_test_|whsec_/);
  assert.equal(assertBrowserSafeStripePayload(preview), true);
});

test('checkout request builds a subscription session and uses idempotency in sandbox-ready mode', async () => {
  const policy = resolveBillingPolicy();
  const captured = {};
  const fakeClient = {
    checkout: {
      sessions: {
        create: async (payload, options) => {
          captured.payload = payload;
          captured.options = options;
          return {
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/c/pay/cs_test_123',
            mode: payload.mode,
            livemode: false,
          };
        },
      },
    },
  };

  const result = await createStripeCheckoutSession({
    stripeClient: fakeClient,
    config: sandboxReadyConfig(),
    policy,
    priceMap: priceMap(policy),
    idempotencyKey: 'checkout-member-1',
    request: {
      member_id: 'member_1',
      customer_email: 'member@example.invalid',
      success_url: 'https://example.invalid/success',
      cancel_url: 'https://example.invalid/cancel',
    },
  });

  assert.equal(captured.payload.mode, 'subscription');
  assert.equal(captured.payload.subscription_data.trial_period_days, 30);
  assert.equal(captured.payload.metadata.provisional_test_policy, 'true');
  assert.equal(captured.options.idempotencyKey, 'checkout-member-1');
  assert.equal(result.external_write_performed, true);
  assert.equal(result.livemode, false);
  assert.doesNotMatch(JSON.stringify(result), /sk_test_|whsec_/);
});

test('webhook signature verification accepts valid events and redacts invalid errors', () => {
  const rawBody = JSON.stringify({ id: 'evt_test_signature', type: 'invoice.payment_succeeded' });
  const fakeClient = {
    webhooks: {
      constructEvent(body, signature, secret) {
        assert.equal(secret, WEBHOOK_SECRET);
        if (signature === 'valid') return JSON.parse(body);
        throw new Error(`bad signature for ${secret}`);
      },
    },
  };

  const verified = verifyStripeWebhookSignature({
    rawBody,
    signature: 'valid',
    webhookSecret: WEBHOOK_SECRET,
    stripeClient: fakeClient,
  });
  assert.equal(verified.verified, true);
  assert.equal(verified.event_id, 'evt_test_signature');

  assert.throws(
    () => verifyStripeWebhookSignature({
      rawBody,
      signature: 'invalid',
      webhookSecret: WEBHOOK_SECRET,
      stripeClient: fakeClient,
    }),
    (error) => error instanceof BillingLifecycleError
      && error.code === 'stripe_webhook_signature_invalid'
      && !/whsec_/.test(error.message)
  );
});

test('lifecycle maps trial, success, failure, retry, renewal, cancellation, entitlement, invoice, and revenue states', () => {
  const policy = resolveBillingPolicy();
  let state = createInitialBillingState({ config: sandboxReadyConfig(), policy });

  const baseObject = {
    customer: 'cus_test_member_1',
    customer_email: 'member@example.invalid',
    customer_details: { email: 'member@example.invalid', name: 'Member One' },
    metadata: { member_id: 'member_1', offer_key: 'membership_67_monthly' },
  };

  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_payment_method_ready',
    type: 'setup_intent.succeeded',
    object: { id: 'seti_test_1', payment_method: 'pm_test_1', ...baseObject },
  })).state;
  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_checkout_completed',
    type: 'checkout.session.completed',
    object: {
      id: 'cs_test_1',
      payment_status: 'paid',
      amount_total: 6700,
      currency: 'usd',
      subscription: 'sub_test_1',
      ...baseObject,
    },
  })).state;
  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_trialing',
    type: 'customer.subscription.created',
    object: {
      id: 'sub_test_1',
      object: 'subscription',
      status: 'trialing',
      current_period_end: 1814200000,
      trial_end: 1811608000,
      ...baseObject,
    },
  })).state;
  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_trial_will_end',
    type: 'customer.subscription.trial_will_end',
    object: {
      id: 'sub_test_1',
      object: 'subscription',
      status: 'trialing',
      trial_end: 1811608000,
      ...baseObject,
    },
  })).state;
  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_invoice_paid',
    type: 'invoice.payment_succeeded',
    object: {
      id: 'in_test_1',
      amount_paid: 6700,
      amount_due: 6700,
      currency: 'usd',
      subscription: 'sub_test_1',
      billing_reason: 'subscription_cycle',
      hosted_invoice_url: 'https://invoice.stripe.test/in_test_1',
      invoice_pdf: 'https://invoice.stripe.test/in_test_1.pdf',
      receipt_url: 'https://receipt.stripe.test/ch_test_1',
      lines: { data: [{ period: { end: 1814200000 } }] },
      ...baseObject,
    },
  })).state;
  const afterPaidRevenue = aggregateProviderRevenue(state);
  assert.equal(afterPaidRevenue.gross_collected_cents, 6700);

  const replay = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_invoice_paid',
    type: 'invoice.payment_succeeded',
    object: {
      id: 'in_test_1',
      amount_paid: 6700,
      currency: 'usd',
      subscription: 'sub_test_1',
      ...baseObject,
    },
  }));
  assert.equal(replay.duplicate, true);
  assert.equal(aggregateProviderRevenue(replay.state).gross_collected_cents, 6700);
  state = replay.state;

  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_invoice_failed',
    type: 'invoice.payment_failed',
    object: {
      id: 'in_test_2',
      amount_due: 6700,
      currency: 'usd',
      subscription: 'sub_test_1',
      next_payment_attempt: 1811700000,
      ...baseObject,
    },
  })).state;
  assert.equal(state.entitlements.member_1.entitlement_state, 'grace_period');
  assert.equal(state.entitlements.member_1.retry_state, 'scheduled');

  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_invoice_upcoming',
    type: 'invoice.upcoming',
    object: {
      id: 'in_test_3',
      amount_due: 6700,
      currency: 'usd',
      subscription: 'sub_test_1',
      ...baseObject,
    },
  })).state;
  state = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_cancel',
    type: 'customer.subscription.deleted',
    object: {
      id: 'sub_test_1',
      object: 'subscription',
      status: 'canceled',
      current_period_end: 1814200000,
      canceled_at: 1811600000,
      ...baseObject,
    },
  })).state;

  const audit = buildLifecycleFinalAudit(state);
  assert.equal(audit.states.pricing, true);
  assert.equal(audit.states.trial, true);
  assert.equal(audit.states.checkout, true);
  assert.equal(audit.states.payment_method, true);
  assert.equal(audit.states.successful_payment, true);
  assert.equal(audit.states.failed_payment, true);
  assert.equal(audit.states.retry, true);
  assert.equal(audit.states.renewal, true);
  assert.equal(audit.states.cancellation, true);
  assert.equal(audit.states.entitlement, true);
  assert.equal(audit.states.invoice_receipt, true);
  assert.equal(audit.states.member_billing, true);
  assert.equal(audit.states.provider_revenue, true);
  assert.equal(audit.states.test_live_mode, true);
  assert.equal(audit.latest_entitlement.entitlement_state, 'scheduled_cancellation');
  assert.equal(audit.revenue.gross_collected_cents, 6700);
  assert.equal(audit.revenue.failed_cents, 6700);
  assert.equal(audit.invoice_receipts.invoice_count, 3);
  assert.equal(audit.invoice_receipts.invoices[0].hosted_invoice_url_configured, true);
  assert.doesNotMatch(JSON.stringify(audit), /sk_test_|whsec_/);
});

test('tenant isolation ignores cross-tenant Stripe events without mutating member billing', () => {
  const state = createInitialBillingState({ config: sandboxReadyConfig(), policy: resolveBillingPolicy() });
  const result = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
    id: 'evt_wrong_tenant',
    type: 'invoice.payment_succeeded',
    tenantId: 'other_workspace',
    object: {
      id: 'in_other',
      amount_paid: 6700,
      customer: 'cus_other',
      metadata: { member_id: 'member_other' },
    },
  }));
  assert.equal(result.ignored, true);
  assert.equal(result.audit.reason, 'tenant_mismatch');
  assert.deepEqual(Object.keys(result.state.members), []);
  assert.equal(aggregateProviderRevenue(result.state).gross_collected_cents, 0);
});

test('sandbox smoke script and package command are explicit about missing config and live blocking', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const script = fs.readFileSync('scripts/smoke-stripe-sandbox-billing.mjs', 'utf8');

  assert.equal(packageJson.scripts['stripe:sandbox-smoke'], 'node scripts/smoke-stripe-sandbox-billing.mjs');
  assert.match(script, /stripe_sandbox_credentials_missing/);
  assert.match(script, /live_key_blocked/);
  assert.match(script, /accounts\.retrieve\(\)/);
  assert.match(script, /products\.create\(/);
  assert.match(script, /prices\.create\(/);
  assert.match(script, /customers\.create\(/);
  assert.match(script, /createStripeCheckoutSession/);
  assert.match(script, /checkout\.sessions\.expire\(/);
  assert.match(script, /applyStripeBillingEvent/);
  assert.doesNotMatch(script, /sk_live_[A-Za-z0-9]/);
  assert.doesNotMatch(script, /sk_test_[A-Za-z0-9]/);
});
