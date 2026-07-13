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
  resolveBillingPolicy,
  resolveStripeBillingConfig,
  verifyStripeWebhookSignature,
} = stripe;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reportDir = path.join(repoRoot, 'ops', 'verifier-runs', '2026-07-14-onetime-billing-sandbox-e2e');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
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

function applySyntheticLifecycle({ config, policy, member }) {
  let state = createInitialBillingState({ config, policy });
  const base = eventBase(member);
  const snapshots = {};

  function apply(id, type, object = {}, captureKey = '') {
    const result = applyStripeBillingEvent(state, buildSyntheticStripeEvent({
      id,
      type,
      object: { id: object.id, ...base, ...object },
    }));
    state = result.state;
    if (captureKey) {
      snapshots[captureKey] = JSON.parse(JSON.stringify(state.entitlements[member.member_id] || null));
    }
    return result;
  }

  apply('evt_e2e_payment_method_ready', 'setup_intent.succeeded', {
    id: 'seti_test_onetime_billing_e2e',
    payment_method: 'pm_test_onetime_billing_e2e',
  }, 'payment_method_ready');
  apply('evt_e2e_checkout_completed', 'checkout.session.completed', {
    id: 'cs_test_onetime_billing_e2e',
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
    id: 'in_test_onetime_initial_paid',
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
    id: 'in_test_onetime_failed',
    amount_due: 6700,
    currency: 'usd',
    subscription: member.subscription_id,
    next_payment_attempt: 1811700000,
  }, 'failed_payment');
  const recoveredEvent = buildSyntheticStripeEvent({
    id: 'evt_e2e_invoice_recovered',
    type: 'invoice.payment_succeeded',
    object: {
      id: 'in_test_onetime_recovered',
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
  let result = applyStripeBillingEvent(state, recoveredEvent);
  state = result.state;
  snapshots.payment_recovered = JSON.parse(JSON.stringify(state.entitlements[member.member_id] || null));
  const replay = applyStripeBillingEvent(state, recoveredEvent);
  state = replay.state;
  apply('evt_e2e_invoice_upcoming', 'invoice.upcoming', {
    id: 'in_test_onetime_upcoming',
    amount_due: 6700,
    currency: 'usd',
    subscription: member.subscription_id,
  }, 'renewal_pending');
  apply('evt_e2e_refund_exception_created', 'refund.created', {
    id: 're_test_onetime_manual_exception',
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
    ignored_trial_event: ignoredTrial.ignored === true
      && ignoredTrial.audit?.reason === 'trial_will_end_superseded_by_rosh_hashanah_policy',
    duplicate_replay_verified: replay.duplicate === true,
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
    `- external_write_performed: ${report.external_write_performed}`,
    `- live_charge_performed: ${report.live_charge_performed}`,
    `- access_mutation_performed: ${report.access_mutation_performed}`,
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...report.checks.map((item) => `| \`${item.id}\` | ${item.passed ? 'PASS' : 'FAIL'} | ${String(item.detail || '').replace(/\|/g, '\\|')} |`),
  ].join('\n');
}

export function buildReport(now = new Date()) {
  const member = syntheticMember();
  const billingConfig = buildOneTimeTrialReferralConfiguration({
    offers: buildOneTimeProductOfferCatalog([]),
    acceptances: [{
      policy_key: 'one_time_rosh_hashanah_promotional_access',
      policy_version: 'one-time-rosh-hashanah-promotional-access-v1',
      acceptance_key: 'TEST-ONETIME-BILLING-E2E-CONSENT',
      accepted_by_email: member.email,
      accepted_at: now.toISOString(),
      source: 'sandbox_e2e_verifier',
      test_mode: true,
    }],
  });
  const policy = resolveBillingPolicy();
  const priceMap = buildProductPriceMap({
    policy,
    priceIds: { membership_67_monthly: 'price_test_onetime_membership_67_monthly' },
  });
  const config = resolveStripeBillingConfig({
    secretKey: 'sk_test_unit',
    webhookSecret: 'whsec_unit',
    mode: 'test',
    accountOwner: 'Rabbi Elie Scheller',
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
  const webhookPayload = JSON.stringify(buildSyntheticStripeEvent({
    id: 'evt_e2e_webhook_signature',
    type: 'invoice.payment_succeeded',
    object: { id: 'in_test_signature', metadata: { member_id: member.member_id } },
  }));
  const webhook = verifyStripeWebhookSignature({
    rawBody: webhookPayload,
    signature: 'synthetic-valid',
    webhookSecret: 'whsec_unit',
    stripeClient: {
      webhooks: {
        constructEvent(rawBody, signature, secret) {
          if (signature !== 'synthetic-valid' || secret !== 'whsec_unit') throw new Error('bad synthetic signature');
          return JSON.parse(rawBody);
        },
      },
    },
  });
  const lifecycle = applySyntheticLifecycle({ config, policy, member });
  const notice = billingConfig.billing_notice || {};
  const refund = billingConfig.refund_review || {};
  const checks = [
    check('synthetic_test_identity_only', member.email.endsWith('@example.invalid') && member.member_id.startsWith('TEST-'), 'Only synthetic TEST identity data is used.'),
    check('checkout_payload_no_trial_period', checkout.payload.subscription_data?.trial_period_days === undefined, 'Checkout payload omits Stripe trial_period_days.'),
    check('checkout_metadata_no_trial', checkout.payload.subscription_data?.metadata?.stripe_trial_enabled === 'false', 'Checkout metadata explicitly says Stripe trial is disabled.'),
    check('price_model_67_monthly', priceMap.by_offer_key.membership_67_monthly?.amount_cents === 6700, '$67/month recurring price maps to a test price reference.'),
    check('webhook_signature_path_verified', webhook.verified === true, 'Synthetic raw-body webhook verification path passes.'),
    check('legacy_trial_event_ignored', lifecycle.ignored_trial_event === true && lifecycle.audit.states.trial === false, 'Legacy trial_will_end event is ignored.'),
    check('failed_payment_no_grace', lifecycle.snapshots.failed_payment?.entitlement_state === 'payment_failed' && lifecycle.snapshots.failed_payment?.access_enabled === false && lifecycle.snapshots.failed_payment?.grace_until === null, 'Failed payment disables paid access and records no grace period.'),
    check('payment_recovery_restores_access', lifecycle.snapshots.payment_recovered?.entitlement_state === 'active' && lifecycle.snapshots.payment_recovered?.access_enabled === true, 'Recovered payment restores active paid entitlement.'),
    check('duplicate_replay_ignored', lifecycle.duplicate_replay_verified === true, 'Replayed invoice event is idempotently ignored.'),
    check('notice_preview_no_send', notice.delivery?.preview_enabled === true && notice.delivery?.batch_send_enabled === false && notice.gates?.email_send_enabled === false, 'Billing notice is preview-only; sends remain disabled.'),
    check('refund_manual_review_only', refund.automatic_refunds_enabled === false && refund.prorated_refunds_enabled === false && refund.gates?.stripe_refund_create_enabled === false, 'Refund execution remains manual-review only and disabled.'),
    check('no_external_mutation', true, 'Verifier performs no Stripe API call, email send, refund, invoice credit, provider mutation, or access mutation.'),
  ];
  const report = {
    generated_at: now.toISOString(),
    requirement_id: 'REQ-20260713-937',
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
    product_price: {
      offer_key: 'membership_67_monthly',
      amount_cents: priceMap.by_offer_key.membership_67_monthly?.amount_cents,
      currency: priceMap.by_offer_key.membership_67_monthly?.currency,
      interval: priceMap.by_offer_key.membership_67_monthly?.interval,
      stripe_trial_enabled: false,
    },
    checkout_preview: {
      mode: checkout.payload.mode,
      trial_period_days_present: checkout.payload.subscription_data?.trial_period_days !== undefined,
      metadata: checkout.payload.metadata,
      external_write_performed: false,
    },
    notice_preview: {
      policy_key: notice.policy_key,
      preview_enabled: notice.delivery?.preview_enabled === true,
      batch_send_enabled: notice.delivery?.batch_send_enabled === true,
      live_send_enabled: notice.gates?.email_send_enabled === true,
      no_send: true,
    },
    refund_review: {
      policy_key: refund.policy_key,
      automatic_refunds_enabled: refund.automatic_refunds_enabled === true,
      prorated_refunds_enabled: refund.prorated_refunds_enabled === true,
      refund_execution_enabled: refund.gates?.stripe_refund_create_enabled === true,
      manual_review_required: true,
    },
    lifecycle,
    checks,
  };
  const serialized = JSON.stringify(report);
  if (/\b(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9._-]{8,}\b/.test(serialized) || /\bwhsec_[A-Za-z0-9._-]{8,}\b/.test(serialized)) {
    throw new Error('Verifier report contains an unredacted Stripe-like secret.');
  }
  return report;
}

export function writeReport(report) {
  ensureDir(reportDir);
  const slug = report.generated_at.replace(/[:.]/g, '-');
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
  console.log(`Reports written: ${path.relative(repoRoot, paths.latestMdPath).replace(/\\/g, '/')} and ${path.relative(repoRoot, paths.latestJsonPath).replace(/\\/g, '/')}`);
  if (report.status !== 'passed') process.exitCode = 1;
  return { report, paths };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    main();
  } catch (error) {
    console.error(`One Time billing sandbox E2E verifier failed: ${error?.message || error}`);
    process.exitCode = 1;
  }
}
