#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Stripe = require('stripe');

const {
  applyStripeBillingEvent,
  buildLifecycleFinalAudit,
  buildProductPriceMap,
  buildSyntheticStripeEvent,
  createInitialBillingState,
  createStripeCheckoutSession,
  getStripeConfig,
  redactStripeSecrets,
  resolveBillingPolicy,
  resolveStripeBillingConfig,
  sanitizeStripeId,
  verifyStripeWebhookSignature,
} = require('../src/lib/integrations/stripe');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const laneDir = path.join(repoRoot, 'ops', 'parallel-closeout', '2026-06-24-clean-slate-system-closeout', 'lanes', 'stripe-sandbox');

function timestampSlug(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeError(error, secrets = []) {
  return redactStripeSecrets({
    message: String(error?.message || error || 'Stripe sandbox smoke failed').slice(0, 800),
    code: error?.code || null,
    status: error?.status || error?.statusCode || null,
    type: error?.type || null,
  }, secrets);
}

function stripeObjectSummary(object = {}) {
  if (!object?.id) return null;
  return {
    id: sanitizeStripeId(object.id),
    object: object.object || null,
    livemode: Boolean(object.livemode),
    created: object.created || null,
    deleted: object.deleted || undefined,
    active: object.active === undefined ? undefined : Boolean(object.active),
    status: object.status || undefined,
  };
}

function summarizeAccount(account = {}) {
  return {
    id: sanitizeStripeId(account.id || 'acct_test'),
    livemode: account.livemode ?? null,
    charges_enabled: account.charges_enabled ?? null,
    payouts_enabled: account.payouts_enabled ?? null,
    details_submitted: account.details_submitted ?? null,
    country: account.country || null,
    default_currency: account.default_currency || null,
  };
}

function renderMarkdown(report) {
  const lines = [
    `# Stripe Sandbox Smoke - ${report.generated_at}`,
    '',
    `- status: ${report.status}`,
    `- config_state: ${report.config_state}`,
    `- external_write_performed: ${report.external_write_performed}`,
    `- live_mode_disabled: ${report.live_mode_disabled}`,
    `- no_real_customer_data: ${report.no_real_customer_data}`,
    `- no_real_funds: ${report.no_real_funds}`,
    '',
    '## Configuration',
    '',
    `- secret_configured: ${report.configuration.secret_configured}`,
    `- webhook_secret_configured: ${report.configuration.webhook_secret_configured}`,
    `- account_owner: ${report.configuration.account_owner}`,
    `- missing: ${(report.configuration.missing || []).join(', ') || 'none'}`,
    `- blockers: ${(report.configuration.blockers || []).join(' | ') || 'none'}`,
    '',
    '## Sandbox Objects',
    '',
    `- product: ${report.objects.product?.id || 'not created'}`,
    `- price: ${report.objects.price?.id || 'not created'}`,
    `- customer: ${report.objects.customer?.id || 'not created'}`,
    `- checkout_session: ${report.objects.checkout_session?.id || 'not created'}`,
    `- cleanup: ${(report.cleanup || []).map((item) => `${item.object}:${item.status}`).join(', ') || 'none'}`,
    '',
    '## Lifecycle Verification',
    '',
    ...Object.entries(report.lifecycle.states || {}).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Notes',
    '',
    ...(report.notes || []).map((note) => `- ${note}`),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

function writeReports(report) {
  ensureDir(laneDir);
  const safeReport = redactStripeSecrets(report);
  const baseName = `${timestampSlug()}-stripe-sandbox-smoke`;
  const jsonPath = path.join(laneDir, `${baseName}.json`);
  const mdPath = path.join(laneDir, `${baseName}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(safeReport, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(safeReport));
  fs.writeFileSync(path.join(laneDir, 'STRIPE-SANDBOX-SMOKE.md'), renderMarkdown(safeReport));
  fs.writeFileSync(path.join(laneDir, 'STRIPE-OBJECTS-REDACTED.json'), `${JSON.stringify(safeReport.objects, null, 2)}\n`);
  return { jsonPath, mdPath };
}

function runSyntheticLifecycle(configState, syntheticIds = {}) {
  const policy = resolveBillingPolicy();
  let state = createInitialBillingState({ config: configState, policy });
  const memberBase = {
    customer: syntheticIds.customer || 'cus_test_synthetic',
    customer_email: 'stripe-smoke@example.invalid',
    customer_details: { email: 'stripe-smoke@example.invalid', name: 'BNA Stripe Smoke' },
    metadata: {
      member_id: 'stripe_sandbox_smoke_member',
      offer_key: 'membership_67_monthly',
    },
  };
  const events = [
    buildSyntheticStripeEvent({
      id: 'evt_smoke_checkout_success',
      type: 'checkout.session.completed',
      object: {
        id: syntheticIds.checkoutSession || 'cs_test_synthetic',
        payment_status: 'paid',
        amount_total: 6700,
        currency: 'usd',
        subscription: 'sub_test_synthetic',
        ...memberBase,
      },
    }),
    buildSyntheticStripeEvent({
      id: 'evt_smoke_subscription_active',
      type: 'customer.subscription.created',
      object: {
        id: 'sub_test_synthetic',
        object: 'subscription',
        status: 'active',
        current_period_end: 1814200000,
        ...memberBase,
      },
    }),
    buildSyntheticStripeEvent({
      id: 'evt_smoke_legacy_trial_will_end',
      type: 'customer.subscription.trial_will_end',
      object: {
        id: 'sub_test_synthetic',
        object: 'subscription',
        status: 'trialing',
        trial_end: 1811608000,
        ...memberBase,
      },
    }),
    buildSyntheticStripeEvent({
      id: 'evt_smoke_payment_method',
      type: 'payment_method.attached',
      object: {
        id: 'pm_test_synthetic',
        object: 'payment_method',
        ...memberBase,
      },
    }),
    buildSyntheticStripeEvent({
      id: 'evt_smoke_invoice_success',
      type: 'invoice.payment_succeeded',
      object: {
        id: 'in_test_smoke_success',
        amount_paid: 6700,
        amount_due: 6700,
        currency: 'usd',
        subscription: 'sub_test_synthetic',
        billing_reason: 'subscription_cycle',
        hosted_invoice_url: 'https://invoice.stripe.test/in_test_smoke_success',
        invoice_pdf: 'https://invoice.stripe.test/in_test_smoke_success.pdf',
        ...memberBase,
      },
    }),
    buildSyntheticStripeEvent({
      id: 'evt_smoke_invoice_failure',
      type: 'invoice.payment_failed',
      object: {
        id: 'in_test_smoke_failure',
        amount_due: 6700,
        currency: 'usd',
        subscription: 'sub_test_synthetic',
        next_payment_attempt: 1811700000,
        hosted_invoice_url: 'https://invoice.stripe.test/in_test_smoke_failure',
        ...memberBase,
      },
    }),
    buildSyntheticStripeEvent({
      id: 'evt_smoke_invoice_upcoming',
      type: 'invoice.upcoming',
      object: {
        id: 'in_test_smoke_upcoming',
        amount_due: 6700,
        currency: 'usd',
        subscription: 'sub_test_synthetic',
        ...memberBase,
      },
    }),
    buildSyntheticStripeEvent({
      id: 'evt_smoke_cancel',
      type: 'customer.subscription.deleted',
      object: {
        id: 'sub_test_synthetic',
        object: 'subscription',
        status: 'canceled',
        current_period_end: 1814200000,
        canceled_at: 1811600000,
        ...memberBase,
      },
    }),
  ];

  let duplicateVerified = false;
  for (const event of events) {
    state = applyStripeBillingEvent(state, event).state;
    if (event.id === 'evt_smoke_invoice_success') {
      const replay = applyStripeBillingEvent(state, event);
      duplicateVerified = replay.duplicate === true;
      state = replay.state;
    }
  }
  const audit = buildLifecycleFinalAudit(state);
  return {
    duplicate_verified: duplicateVerified,
    states: audit.states,
    revenue: audit.revenue,
    latest_entitlement: audit.latest_entitlement,
    audit_event_count: audit.audit_event_count,
  };
}

async function expireCheckoutIfOpen(stripeClient, checkoutSession, cleanup) {
  if (!checkoutSession?.id || checkoutSession.status !== 'open') return;
  try {
    await stripeClient.checkout.sessions.expire(checkoutSession.id);
    cleanup.push({ object: 'checkout_session', id: sanitizeStripeId(checkoutSession.id), status: 'expired' });
  } catch (error) {
    cleanup.push({ object: 'checkout_session', id: sanitizeStripeId(checkoutSession.id), status: 'expire_failed', error: safeError(error) });
  }
}

async function deactivateProduct(stripeClient, product, cleanup) {
  if (!product?.id) return;
  try {
    await stripeClient.products.update(product.id, { active: false });
    cleanup.push({ object: 'product', id: sanitizeStripeId(product.id), status: 'deactivated' });
  } catch (error) {
    cleanup.push({ object: 'product', id: sanitizeStripeId(product.id), status: 'deactivate_failed', error: safeError(error) });
  }
}

async function deleteCustomer(stripeClient, customer, cleanup) {
  if (!customer?.id) return;
  try {
    await stripeClient.customers.del(customer.id);
    cleanup.push({ object: 'customer', id: sanitizeStripeId(customer.id), status: 'deleted' });
  } catch (error) {
    cleanup.push({ object: 'customer', id: sanitizeStripeId(customer.id), status: 'delete_failed', error: safeError(error) });
  }
}

async function runSandboxApiSmoke(config, baseConfigState, report) {
  const stripeClient = new Stripe(config.secretKey);
  const account = await stripeClient.accounts.retrieve();
  report.account = summarizeAccount(account);
  const configState = resolveStripeBillingConfig({
    secretKey: config.secretKey,
    webhookSecret: config.webhookSecret,
    mode: config.mode,
    accountOwner: config.accountOwner,
    sandboxApiVerified: true,
    sandboxAccountLivemode: account?.livemode,
  });
  report.config_state = configState.state;
  report.configuration = {
    ...report.configuration,
    ...configState,
  };

  if (account?.livemode === true || configState.state !== 'sandbox_ready') {
    report.status = 'blocked';
    report.notes.push('Stripe account readback did not prove sandbox_ready; no write objects were created.');
    return report;
  }

  const suffix = timestampSlug().replace(/-/g, '').slice(0, 20);
  const metadata = {
    synthetic: 'true',
    bna_lane: 'stripe-sandbox',
    created_by: 'codex',
    smoke_slug: suffix,
  };
  let product = null;
  let price = null;
  let customer = null;
  let checkoutSession = null;
  const cleanup = [];
  try {
    product = await stripeClient.products.create({
      name: `BNA synthetic sandbox product ${suffix}`,
      metadata,
    });
    price = await stripeClient.prices.create({
      product: product.id,
      unit_amount: 6700,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata,
    });
    customer = await stripeClient.customers.create({
      name: 'BNA Stripe Sandbox Smoke',
      email: `stripe-smoke-${suffix}@example.invalid`,
      metadata,
    });
    const policy = resolveBillingPolicy();
    const map = buildProductPriceMap({
      policy,
      priceIds: { membership_67_monthly: price.id },
    });
    const created = await createStripeCheckoutSession({
      stripeClient,
      config: configState,
      policy,
      priceMap: map,
      idempotencyKey: `bna-stripe-sandbox-${suffix}`,
      request: {
        customer_id: customer.id,
        member_id: `stripe_sandbox_smoke_${suffix}`,
        success_url: 'https://example.invalid/bna-stripe-sandbox-success',
        cancel_url: 'https://example.invalid/bna-stripe-sandbox-cancel',
      },
    });
    checkoutSession = created.checkout_session_id
      ? await stripeClient.checkout.sessions.retrieve(created.checkout_session_id)
      : null;
    report.external_write_performed = true;
    report.objects.product = stripeObjectSummary(product);
    report.objects.price = stripeObjectSummary(price);
    report.objects.customer = stripeObjectSummary(customer);
    report.objects.checkout_session = stripeObjectSummary(checkoutSession || { id: created.checkout_session_id, object: 'checkout.session' });
    report.lifecycle = runSyntheticLifecycle(configState, {
      customer: customer.id,
      checkoutSession: created.checkout_session_id,
    });
    report.status = report.lifecycle.duplicate_verified ? 'passed' : 'failed';
    report.notes.push('Created synthetic Stripe test-mode product, price, customer, and checkout session; lifecycle success/failure/cancellation were simulated locally from redacted test object IDs with no Stripe trial period.');
  } finally {
    await expireCheckoutIfOpen(stripeClient, checkoutSession, cleanup);
    await deleteCustomer(stripeClient, customer, cleanup);
    await deactivateProduct(stripeClient, product, cleanup);
    report.cleanup = cleanup;
  }

  if (config.webhookSecret) {
    const payload = JSON.stringify(buildSyntheticStripeEvent({
      id: 'evt_smoke_signature',
      type: 'invoice.payment_succeeded',
      object: { id: 'in_smoke_signature' },
    }));
    const header = stripeClient.webhooks.generateTestHeaderString({
      payload,
      secret: config.webhookSecret,
    });
    const verified = verifyStripeWebhookSignature({
      rawBody: payload,
      signature: header,
      webhookSecret: config.webhookSecret,
      stripeClient,
    });
    report.webhook_signature_verified = verified.verified;
  } else {
    report.webhook_signature_verified = false;
    report.notes.push('Webhook secret is missing; dashboard webhook signature validation could not be smoke-tested.');
  }

  return report;
}

export async function main() {
  const config = getStripeConfig({ repoRoot });
  const baseConfigState = resolveStripeBillingConfig({
    secretKey: config.secretKey,
    webhookSecret: config.webhookSecret,
    mode: config.mode,
    accountOwner: config.accountOwner,
  });
  const report = {
    generated_at: new Date().toISOString(),
    scope: 'stripe_sandbox_billing_lifecycle',
    status: 'blocked',
    config_state: baseConfigState.state,
    live_mode_disabled: baseConfigState.state !== 'live',
    no_real_customer_data: true,
    no_real_funds: true,
    external_write_performed: false,
    configuration: baseConfigState,
    account: null,
    objects: {
      product: null,
      price: null,
      customer: null,
      checkout_session: null,
    },
    lifecycle: runSyntheticLifecycle(baseConfigState),
    cleanup: [],
    webhook_signature_verified: false,
    notes: [],
  };

  if (!config.secretKey) {
    report.status = 'stripe_sandbox_credentials_missing';
    report.notes.push('STRIPE_SECRET_KEY or RABBI_STRIPE_SECRET_KEY is missing; sandbox API object creation was skipped.');
  } else if (baseConfigState.key_mode === 'live') {
    report.status = 'live_key_blocked';
    report.configuration.missing = [
      ...(report.configuration.missing || []),
      'test-mode STRIPE_SECRET_KEY or RABBI_STRIPE_SECRET_KEY (sk_test/rk_test)',
    ];
    report.notes.push('A live Stripe key is configured. Sandbox smoke blocked all Stripe API calls to avoid live-mode effects.');
  } else if (baseConfigState.key_mode !== 'sandbox') {
    report.status = 'sandbox_invalid';
    report.notes.push('Configured Stripe key is not a recognizable test key.');
  } else {
    try {
      await runSandboxApiSmoke(config, baseConfigState, report);
    } catch (error) {
      report.status = 'failed';
      report.error = safeError(error, [config.secretKey, config.webhookSecret]);
    }
  }

  report.live_mode_disabled = report.config_state !== 'live';
  const paths = writeReports(report);
  console.log(renderMarkdown(redactStripeSecrets(report, [config.secretKey, config.webhookSecret])));
  console.log(`Reports written: ${path.relative(repoRoot, paths.mdPath)} and ${path.relative(repoRoot, paths.jsonPath)}`);
  if (report.status === 'failed') process.exitCode = 1;
  return { report, paths };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(`Stripe sandbox smoke failed: ${redactStripeSecrets(error.message)}`);
    process.exitCode = 1;
  });
}
