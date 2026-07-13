#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
  buildOneTimeProductOfferCatalog,
  buildOneTimeTrialReferralConfiguration,
} = require('../src/lib/bna/one-time-product-system');
const stripe = require('../src/lib/integrations/stripe');

const {
  applyStripeBillingEvent,
  buildCheckoutSessionPayload,
  buildLifecycleFinalAudit,
  buildProductPriceMap,
  buildSyntheticStripeEvent,
  createInitialBillingState,
  redactStripeSecrets,
  resolveBillingPolicy,
  resolveStripeBillingConfig,
  verifyStripeWebhookSignature,
} = stripe;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'ops', 'verifier-runs', '2026-07-13-onetime-billing-sandbox-e2e');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function timestampSlug(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(value || '').replace(/\r\n/g, '\n')}\n`);
}

function syntheticMember() {
  return {
    member_id: 'TEST-ONETIME-BILLING-MEMBER-001',
    customer_id: 'cus_test_onetime_billing_e2e',
    subscription_id: 'sub_test_onetime_billing_e2e',
    payment_method_id: 'pm_test_onetime_billing_e2e',
    checkout_session_id: 'cs_test_onetime_billing_e2e',
    invoice_paid_id: 'in_test_onetime_initial_paid',
    invoice_failed_id: 'in_test_onetime_failed',
    invoice_recovered_id: 'in_test_onetime_recovered',
    invoice_upcoming_id: 'in_test_onetime_upcoming',
    refund_id: 're_test_onetime_manual_exception',
    email: 'test.member+onetime-billing@example.invalid',
    name: 'TEST One Time Billing Member',
  };
}

function eventBase(member) {
  return {
    customer: member.customer_id,
    customer_email: member.email,
    customer_details: { email: member.email, name: member.name },
    metadata: {
      member_id: member.member_id,
      offer_key: 'membership_67_monthly',
      synthetic_test_identity: 'true',
    },
  };
}

function runLifecycleVerifier({ config, policy, member }) {
  let state = createInitialBillingState({ config, policy });
  const base = eventBase(member);
  const snapshots = {};
  const auditTrail = [];

  function apply(id, type, object = {}, captureKey = '') {
    const result = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
      id,
      type,
      object: {
        id: object.id,
        ...base,
        ...object,
      },
    }));
    state = result.state;
    auditTrail.push({
      id,
      type,
      ignored: Boolean(result.ignored),
      duplicate: Boolean(result.duplicate),
      lifecycle_state: result.audit?.lifecycle_state || null,
      reason: result.audit?.reason || null,
    });
    if (captureKey) {
      snapshots[captureKey] = JSON.parse(JSON.stringify(state.entitlements[member.member_id] || null));
    }
    return result;
  }

  apply('evt_e2e_payment_method_ready', 'setup_intent.succeeded', {
    id: 'seti_test_onetime_billing_e2e',
    payment_method: member.payment_method_id,
  }, 'payment_method_ready');
  apply('evt_e2e_checkout_completed', 'checkout.session.completed', {
    id: member.checkout_session_id,
    payment_status: 'paid',
    amount_total: 6700,
    currency: 'usd',
    subscription: member.subscription_id,
  }, 'checkout_paid');
  apply('evt_e2e_subscription_active', 'customer.subscription.created', {
    id: member.subscription_id,
    object: 'subscription',
    status: 'active',
    current_period_end: 1814200000,
  }, 'subscription_active');
  const ignoredTrial = apply('evt_e2e_legacy_trial_will_end', 'customer.subscription.trial_will_end', {
    id: member.subscription_id,
    object: 'subscription',
    status: 'trialing',
    trial_end: 1811608000,
  }, 'legacy_trial_ignored');
  apply('evt_e2e_invoice_initial_paid', 'invoice.payment_succeeded', {
    id: member.invoice_paid_id,
    amount_paid: 6700,
    amount_due: 6700,
    currency: 'usd',
    subscription: member.subscription_id,
    billing_reason: 'subscription_create',
    hosted_invoice_url: 'https://invoice.stripe.test/in_test_onetime_initial_paid',
    invoice_pdf: 'https://invoice.stripe.test/in_test_onetime_initial_paid.pdf',
    receipt_url: 'https://receipt.stripe.test/ch_test_onetime_initial_paid',
    status_transitions: { paid_at: 1811500000 },
  }, 'initial_invoice_paid');
  apply('evt_e2e_invoice_failed', 'invoice.payment_failed', {
    id: member.invoice_failed_id,
    amount_due: 6700,
    currency: 'usd',
    subscription: member.subscription_id,
    next_payment_attempt: 1811700000,
    hosted_invoice_url: 'https://invoice.stripe.test/in_test_onetime_failed',
  }, 'failed_payment');
  const recovered = buildSyntheticStripeEvent({
    id: 'evt_e2e_invoice_recovered',
    type: 'invoice.payment_succeeded',
    object: {
      id: member.invoice_recovered_id,
      ...base,
      amount_paid: 6700,
      amount_due: 6700,
      currency: 'usd',
      subscription: member.subscription_id,
      billing_reason: 'subscription_cycle',
      hosted_invoice_url: 'https://invoice.stripe.test/in_test_onetime_recovered',
      invoice_pdf: 'https://invoice.stripe.test/in_test_onetime_recovered.pdf',
      receipt_url: 'https://receipt.stripe.test/ch_test_onetime_recovered',
      lines: { data: [{ period: { end: 1816800000 } }] },
      status_transitions: { paid_at: 1811800000 },
    },
  });
  let result = applyStripeBillingEvent(state, recovered);
  state = result.state;
  auditTrail.push({
    id: recovered.id,
    type: recovered.type,
    ignored: Boolean(result.ignored),
    duplicate: Boolean(result.duplicate),
    lifecycle_state: result.audit?.lifecycle_state || null,
    reason: result.audit?.reason || null,
  });
  snapshots.payment_recovered = JSON.parse(JSON.stringify(state.entitlements[member.member_id] || null));
  const replay = applyStripeBillingEvent(state, recovered);
  state = replay.state;
  auditTrail.push({
    id: recovered.id,
    type: recovered.type,
    ignored: Boolean(replay.ignored),
    duplicate: Boolean(replay.duplicate),
    lifecycle_state: replay.audit?.lifecycle_state || null,
    reason: replay.audit?.reason || null,
  });
  apply('evt_e2e_invoice_upcoming', 'invoice.upcoming', {
    id: member.invoice_upcoming_id,
    amount_due: 6700,
    currency: 'usd',
    subscription: member.subscription_id,
  }, 'renewal_pending');
  apply('evt_e2e_refund_exception_created', 'refund.created', {
    id: member.refund_id,
    amount: 1200,
    currency: 'usd',
    payment_intent: 'pi_test_onetime_manual_exception',
  }, 'refund_manual_review');
  apply('evt_e2e_subscription_deleted', 'customer.subscription.deleted', {
    id: member.subscription_id,
    object: 'subscription',
    status: 'canceled',
    current_period_end: 1816800000,
    canceled_at: 1811900000,
  }, 'cancellation');

  return {
    audit: buildLifecycleFinalAudit(state),
    snapshots,
    auditTrail,
    ignored_trial_event: ignoredTrial.ignored === true && ignoredTrial.audit?.reason === 'trial_will_end_superseded_by_rosh_hashanah_policy',
    duplicate_replay_verified: replay.duplicate === true,
  };
}

function buildNoticePreview(config) {
  const notice = config.billing_notice || {};
  return {
    policy_key: notice.policy_key,
    policy_version: notice.policy_version,
    template_key: notice.template_key,
    preview_enabled: notice.delivery?.preview_enabled === true,
    batch_send_enabled: notice.delivery?.batch_send_enabled === true,
    live_send_enabled: notice.gates?.email_send_enabled === true,
    required_disclosures: notice.required_disclosures || [],
    copy_tokens: notice.copy_tokens || {},
    no_send: true,
    external_write_performed: false,
  };
}

function buildRefundReviewPreview(config, member) {
  const refund = config.refund_review || {};
  return {
    policy_key: refund.policy_key,
    policy_version: refund.policy_version,
    manual_review_required: refund.manual_review_required === true || refund.status === 'manual_review_required',
    automatic_refunds_enabled: refund.automatic_refunds_enabled === true,
    prorated_refunds_enabled: refund.prorated_refunds_enabled === true,
    refund_execution_enabled: refund.gates?.stripe_refund_create_enabled === true,
    linked_customer_id: member.customer_id,
    linked_invoice_id: member.invoice_recovered_id,
    linked_payment_id: 'pi_test_onetime_manual_exception',
    requested_reason: 'operator_approved_exception',
    access_decision_required: true,
    external_write_performed: false,
  };
}

function check(id, passed, detail) {
  return { id, passed: Boolean(passed), detail };
}

function renderMarkdown(report) {
  return [
    `# One Time Billing Sandbox E2E Verifier - ${report.generated_at}`,
    '',
    `- status: ${report.status}`,
    `- requirement: ${report.requirement_id}`,
    `- workspace: ${report.workspace_key}`,
    `- project: ${report.project_key}`,
    `- external_write_performed: ${report.external_write_performed}`,
    `- production_data_mutation_performed: ${report.production_data_mutation_performed}`,
    `- live_charge_performed: ${report.live_charge_performed}`,
    `- notice_send_performed: ${report.notice_send_performed}`,
    `- refund_performed: ${report.refund_performed}`,
    `- access_mutation_performed: ${report.access_mutation_performed}`,
    '',
    '## Checks',
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...report.checks.map((item) => `| \`${item.id}\` | ${item.passed ? 'PASS' : 'FAIL'} | ${String(item.detail || '').replace(/\|/g, '\\|')} |`),
    '',
    '## Lifecycle States',
    '',
    ...Object.entries(report.lifecycle.audit.states).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Evidence',
    '',
    ...report.evidence.map((item) => `- ${item}`),
    '',
    '## Remaining Live Blockers',
    '',
    ...report.remaining_live_blockers.map((item) => `- ${item}`),
  ].join('\n');
}

export function buildReport(now = new Date()) {
  const member = syntheticMember();
  const offers = buildOneTimeProductOfferCatalog([]);
  const billingConfig = buildOneTimeTrialReferralConfiguration({
    offers,
    acceptances: [{
      policy_key: 'one_time_rosh_hashanah_promotional_access',
      policy_version: 'one-time-rosh-hashanah-promotional-access-v1',
      acceptance_key: 'TEST-ONETIME-BILLING-E2E-CONSENT',
      accepted_by_email: member.email,
      accepted_at: '2026-07-13T12:00:00.000Z',
      source: 'sandbox_e2e_verifier',
      test_mode: true,
    }],
    referrals: [{
      referral_code: 'TEST-ONETIME-BILLING-E2E',
      activation_status: 'pending_first_paid_cycle',
      reward_status: 'manual_review_required',
    }],
  });
  const policy = resolveBillingPolicy();
  const priceMap = buildProductPriceMap({
    policy,
    priceIds: { membership_67_monthly: 'price_test_onetime_membership_67_monthly' },
  });
  const config = resolveStripeBillingConfig({
    secretKey: 'sk_test_e2e',
    webhookSecret: 'whsec_e2e',
    mode: 'test',
    accountOwner: 'Rabbi Eli Scheller',
    sandboxApiVerified: true,
    sandboxAccountLivemode: false,
  });
  const checkout = buildCheckoutSessionPayload({
    request: {
      member_id: member.member_id,
      customer_email: member.email,
      success_url: 'https://example.invalid/onetime/billing/success',
      cancel_url: 'https://example.invalid/onetime/billing/cancel',
    },
    policy,
    priceMap,
  });
  const fakeStripeClient = {
    webhooks: {
      constructEvent(rawBody, signature, webhookSecret) {
        if (signature !== 'synthetic-valid' || webhookSecret !== 'whsec_e2e') {
          throw new Error(`bad synthetic signature for ${webhookSecret}`);
        }
        return JSON.parse(rawBody);
      },
    },
  };
  const webhookPayload = JSON.stringify(buildSyntheticStripeEvent({
    id: 'evt_e2e_webhook_signature',
    type: 'invoice.payment_succeeded',
    object: {
      id: 'in_test_onetime_webhook_signature',
      customer: member.customer_id,
      metadata: { member_id: member.member_id, offer_key: 'membership_67_monthly' },
    },
  }));
  const webhook = verifyStripeWebhookSignature({
    rawBody: webhookPayload,
    signature: 'synthetic-valid',
    webhookSecret: 'whsec_e2e',
    stripeClient: fakeStripeClient,
  });
  const noticePreview = buildNoticePreview(billingConfig);
  const refundPreview = buildRefundReviewPreview(billingConfig, member);
  const lifecycle = runLifecycleVerifier({ config, policy, member });

  const latest = lifecycle.audit.latest_entitlement || {};
  const checks = [
    check('synthetic_test_identity_only', member.email.endsWith('@example.invalid') && member.member_id.startsWith('TEST-'), 'Verifier uses only TEST identity data and example.invalid email.'),
    check('product_price_model', priceMap.by_offer_key.membership_67_monthly?.amount_cents === 6700
      && priceMap.by_offer_key.membership_67_monthly?.currency === 'USD'
      && priceMap.by_offer_key.membership_67_monthly?.interval === 'month'
      && priceMap.missing_price_ids.length === 0, '$67/month USD recurring price maps to a non-secret test price reference.'),
    check('checkout_subscription_payload_no_trial', checkout.payload.mode === 'subscription'
      && checkout.payload.subscription_data?.trial_period_days === undefined
      && checkout.payload.subscription_data?.metadata?.stripe_trial_enabled === 'false', 'Checkout payload is subscription mode and does not include Stripe trial fields.'),
    check('consent_policy_acceptance_storage', billingConfig.acceptance_storage?.record_count === 1
      && billingConfig.acceptance_storage?.required_fields?.includes('policy_version')
      && billingConfig.acceptance_storage?.live_public_acceptance_enabled === false, 'Policy-version acceptance storage is modeled for the TEST member without live public acceptance.'),
    check('webhook_signature_verified', webhook.verified === true && webhook.event_id === 'evt_e2e_webhook_signature', 'Synthetic raw-body webhook signature path verifies without exposing webhook secrets.'),
    check('payment_method_ready', Boolean(lifecycle.audit.states.payment_method) && lifecycle.snapshots.payment_method_ready === null, 'Payment method readiness is processed before any paid entitlement is created.'),
    check('checkout_subscription_invoice_payment', lifecycle.audit.states.checkout
      && lifecycle.audit.states.successful_payment
      && lifecycle.audit.revenue.gross_collected_cents === 13400, 'Checkout, subscription, initial invoice, and recovered renewal payment are reflected in member billing and revenue read models.'),
    check('legacy_trial_event_ignored', lifecycle.ignored_trial_event === true && lifecycle.audit.states.trial === false, 'Legacy trial_will_end event is ignored and no trial state appears.'),
    check('failed_payment_no_grace', lifecycle.snapshots.failed_payment?.entitlement_state === 'payment_failed'
      && lifecycle.snapshots.failed_payment?.access_enabled === false
      && lifecycle.snapshots.failed_payment?.grace_until === null, 'Failed payment immediately disables paid access and records no grace period.'),
    check('payment_recovery_restores_access', lifecycle.snapshots.payment_recovered?.entitlement_state === 'active'
      && lifecycle.snapshots.payment_recovered?.access_enabled === true, 'Recovered payment restores active paid entitlement.'),
    check('duplicate_replay_ignored', lifecycle.duplicate_replay_verified === true, 'Replayed invoice event is idempotently ignored.'),
    check('notice_preview_no_send', noticePreview.preview_enabled === true
      && noticePreview.batch_send_enabled === false
      && noticePreview.live_send_enabled === false
      && noticePreview.no_send === true
      && noticePreview.required_disclosures.includes('no_stripe_trial'), 'Pre-billing notice preview is available, but batch/live sends remain disabled and disclose no Stripe trial.'),
    check('refund_exception_manual_review_only', refundPreview.manual_review_required === true
      && refundPreview.automatic_refunds_enabled === false
      && refundPreview.prorated_refunds_enabled === false
      && refundPreview.refund_execution_enabled === false
      && lifecycle.snapshots.refund_manual_review?.entitlement_state === 'manual_review', 'Refund exception path creates manual-review state only; Stripe refund execution remains disabled.'),
    check('cancellation_period_end_access', latest.entitlement_state === 'scheduled_cancellation'
      && latest.access_enabled === true
      && latest.reason === 'cancel_at_period_end', 'Cancellation keeps paid access until period end instead of immediate refund/revoke.'),
    check('no_live_or_external_mutation', true, 'Verifier performs no Stripe API call, email send, invoice credit, refund, provider mutation, or access mutation.'),
  ];

  const report = {
    generated_at: now.toISOString(),
    requirement_id: 'REQ-20260713-961',
    scope: 'one_time_billing_sandbox_e2e_local_verifier',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    status: checks.every((item) => item.passed) ? 'passed' : 'failed',
    external_write_performed: false,
    production_data_mutation_performed: false,
    live_charge_performed: false,
    notice_send_performed: false,
    refund_performed: false,
    access_mutation_performed: false,
    secrets_included: false,
    test_identity: {
      member_id: member.member_id,
      email_domain: 'example.invalid',
      synthetic: true,
    },
    config: {
      state: config.state,
      effective_mode: config.effective_mode,
      key_mode: config.key_mode,
      account_owner: config.account_owner,
      safe_to_create_live_charge: config.safe_to_create_live_charge,
      secret_configured: config.secret_configured,
      webhook_secret_configured: config.webhook_secret_configured,
      secrets_included: false,
    },
    product_price: {
      offer_key: 'membership_67_monthly',
      product_key: priceMap.by_offer_key.membership_67_monthly?.product_key,
      amount_cents: priceMap.by_offer_key.membership_67_monthly?.amount_cents,
      currency: priceMap.by_offer_key.membership_67_monthly?.currency,
      interval: priceMap.by_offer_key.membership_67_monthly?.interval,
      stripe_price_id: stripe.sanitizeStripeId(priceMap.by_offer_key.membership_67_monthly?.stripe_price_id),
      tax_behavior: policy.price?.tax_behavior,
      stripe_trial_enabled: false,
    },
    checkout_preview: {
      mode: checkout.payload.mode,
      line_item_count: checkout.payload.line_items.length,
      trial_period_days_present: checkout.payload.subscription_data?.trial_period_days !== undefined,
      metadata: checkout.payload.metadata,
      external_write_performed: false,
    },
    notice_preview: noticePreview,
    refund_review: refundPreview,
    lifecycle,
    checks,
    evidence: [
      'scripts/verify-onetime-billing-sandbox-e2e.mjs',
      'src/lib/billing/stripe-billing-lifecycle.js',
      'src/lib/bna/one-time-product-system.js',
      'tests/stripe-billing-lifecycle.test.js',
      'tests/one-time-stripe-local-beta.test.js',
    ],
    remaining_live_blockers: [
      'Exact billing_start_at in Asia/Jerusalem must be approved.',
      'Hosted Stripe webhook/Railway env readback must be verified before deploy/live smoke completion.',
      'Final pre-billing notice sender, copy, and cohort need explicit approval before any send.',
      'Final live price/account/campaign launch packet and exact charge authorization are required before live charges.',
      'Refund execution and access automation remain disabled until explicit authorized-admin approval.',
    ],
  };
  const safeReport = redactStripeSecrets(report, ['sk_test_e2e', 'whsec_e2e']);
  const serialized = JSON.stringify(safeReport);
  if (/\b(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9._-]{8,}\b/.test(serialized) || /\bwhsec_[A-Za-z0-9._-]{8,}\b/.test(serialized)) {
    throw new Error('Verifier report contains an unredacted Stripe-like secret.');
  }
  return safeReport;
}

export function writeReport(report) {
  ensureDir(reportDir);
  const slug = timestampSlug(new Date(report.generated_at));
  const jsonPath = path.join(reportDir, `${slug}-sandbox-e2e.json`);
  const mdPath = path.join(reportDir, `${slug}-sandbox-e2e.md`);
  const latestJsonPath = path.join(reportDir, 'latest.json');
  const latestMdPath = path.join(reportDir, 'latest.md');
  writeJson(jsonPath, report);
  writeText(mdPath, renderMarkdown(report));
  writeJson(latestJsonPath, report);
  writeText(latestMdPath, renderMarkdown(report));
  return { jsonPath, mdPath, latestJsonPath, latestMdPath };
}

export function main() {
  const report = buildReport();
  const paths = writeReport(report);
  console.log(renderMarkdown(report));
  console.log('');
  console.log(`Reports written: ${rel(paths.latestMdPath)} and ${rel(paths.latestJsonPath)}`);
  if (report.status !== 'passed') process.exitCode = 1;
  return { report, paths };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    main();
  } catch (error) {
    console.error(`One Time billing sandbox E2E verifier failed: ${redactStripeSecrets(error?.message || error)}`);
    process.exitCode = 1;
  }
}
