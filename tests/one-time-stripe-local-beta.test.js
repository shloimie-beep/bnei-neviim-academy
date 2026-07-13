const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  buildOneTimeProductOfferCatalog,
  buildOneTimeTrialReferralConfiguration,
} = require('../src/lib/bna/one-time-product-system');
const {
  buildOneTimeStripeLocalBetaPlan,
} = require('../src/lib/integrations/stripe');

const server = fs.readFileSync('server.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const operationsShell = fs.readFileSync('public/js/operations-shell.js', 'utf8');
const liveSmoke = fs.readFileSync('scripts/smoke-one-time-trial-referral-live.mjs', 'utf8');
const migration = fs.readFileSync('railway-migration-2026-06-21-one-time-trial-referral-config.sql', 'utf8');

test('One Time promotional conversion and referral configuration is test-local and policy-versioned', () => {
  const offers = buildOneTimeProductOfferCatalog([]);
  const config = buildOneTimeTrialReferralConfiguration({
    offers,
    decisions: [
      {
        decision_key: 'rosh_hashanah_billing_policy_copy',
        status: 'decision_pending',
        needed_from: 'Shloimie / Rabbi Ellie Scheller / legal-accounting owner',
      },
    ],
    acceptances: [
      {
        policy_key: 'one_time_rosh_hashanah_promotional_access',
        policy_version: 'one-time-rosh-hashanah-promotional-access-v1',
        acceptance_key: 'test-acceptance-001',
        accepted_by_email: 'parent@example.invalid',
        accepted_at: '2026-06-21T10:00:00.000Z',
      },
    ],
    referrals: [
      {
        referral_code: 'TEST-REFERRAL',
        activation_status: 'pending_first_paid_cycle',
        reward_status: 'not_approved',
      },
    ],
  });

  assert.equal(config.requirement_id, 'REQ-20260713-954');
  assert.equal(config.mode, 'test_local_only');
  assert.equal(config.launch_trial.policy_key, 'one_time_rosh_hashanah_promotional_access');
  assert.equal(config.launch_trial.conversion_policy_key, 'one_time_rosh_hashanah_paid_conversion');
  assert.equal(config.launch_trial.trial_days, 0);
  assert.equal(config.launch_trial.stripe_trial_enabled, false);
  assert.equal(config.promotional_access.access_until_billing_start, true);
  assert.equal(config.promotional_access.timezone, 'Asia/Jerusalem');
  assert.equal(config.launch_trial.renewal.amount_cents, 6700);
  assert.equal(config.launch_trial.renewal.currency, 'USD');
  assert.equal(config.launch_trial.renewal.billing_interval, 'month');
  assert.equal(config.launch_trial.renewal.tax_behavior, 'exclusive');
  assert.equal(config.launch_trial.renewal.starts_after_trial, false);
  assert.equal(config.launch_trial.rules.card_required, true);
  assert.equal(config.launch_trial.rules.billing_authorization_required, true);
  assert.equal(config.launch_trial.rules.one_intro_trial_per_household, false);
  assert.equal(config.launch_trial.rules.no_stripe_trial, true);
  assert.equal(config.launch_trial.rules.no_failed_payment_grace_period, true);
  assert.equal(config.launch_trial.acceptance.storage_table, 'bna_one_time_policy_acceptances');
  assert.equal(config.launch_trial.gates.checkout_session_creation_enabled, false);
  assert.equal(config.launch_trial.gates.live_charges_enabled, false);
  assert.equal(config.launch_trial.gates.invoice_credit_enabled, false);
  assert.equal(config.launch_trial.gates.stripe_trial_enabled, false);

  assert.equal(config.referral_credit.activation_trigger, 'first_successful_paid_cycle');
  assert.equal(config.referral_credit.rules.activate_only_after_first_successful_paid_cycle, true);
  assert.equal(config.referral_credit.rules.self_referrals_allowed, false);
  assert.equal(config.referral_credit.reward.amount_cents, 6700);
  assert.equal(config.referral_credit.gates.invoice_credit_enabled, false);
  assert.equal(config.referral_credit.gates.real_invoice_credit_created, false);
  assert.equal(config.referral_credit.gates.external_write_performed, false);
  assert.equal(config.billing_notice.requirement_id, 'REQ-20260713-957');
  assert.equal(config.billing_notice.policy_key, 'one_time_rosh_hashanah_pre_billing_notice');
  assert.equal(config.billing_notice.delivery.preview_enabled, true);
  assert.equal(config.billing_notice.delivery.batch_send_enabled, false);
  assert.equal(config.billing_notice.gates.email_send_enabled, false);
  assert.ok(config.billing_notice.required_disclosures.includes('no_stripe_trial'));
  assert.ok(config.billing_notice.required_disclosures.includes('manual_exception_refund_review_only'));
  assert.equal(config.refund_review.requirement_id, 'REQ-20260713-958');
  assert.equal(config.refund_review.policy_key, 'one_time_manual_exception_refund_review');
  assert.equal(config.refund_review.automatic_refunds_enabled, false);
  assert.equal(config.refund_review.prorated_refunds_enabled, false);
  assert.equal(config.refund_review.gates.stripe_refund_create_enabled, false);
  assert.ok(config.refund_review.required_review_fields.includes('stripe_invoice_id'));
  assert.ok(config.refund_review.allowed_exception_reasons.includes('operator_approved_exception'));

  assert.equal(config.acceptance_storage.supported, true);
  assert.equal(config.acceptance_storage.test_local_mode_supported, true);
  assert.equal(config.acceptance_storage.record_count, 1);
  assert.ok(config.acceptance_storage.required_fields.includes('policy_version'));
  assert.ok(config.acceptance_storage.required_fields.includes('accepted_at'));
  assert.ok(config.acceptance_storage.policy_versions.includes('one-time-rosh-hashanah-pre-billing-notice-v1'));
  assert.ok(config.acceptance_storage.policy_versions.includes('one-time-manual-exception-refund-review-v1'));
  assert.equal(config.referral_records.length, 1);
  assert.equal(config.referral_records[0].activation_status, 'pending_first_paid_cycle');
  assert.equal(config.legal_wording_decision.blocks_public_copy, true);
  assert.equal(config.legal_wording_decision.blocks_local_configuration, false);
  assert.equal(config.guardrails.live_charges_enabled, false);
  assert.equal(config.guardrails.real_invoice_credits_enabled, false);
  assert.equal(config.guardrails.external_write_performed, false);
});

test('Stripe local beta plan exposes preview/readiness only and blocks external billing writes', () => {
  const config = buildOneTimeTrialReferralConfiguration({
    offers: buildOneTimeProductOfferCatalog([]),
  });
  const beta = buildOneTimeStripeLocalBetaPlan({
    trial_referral_config: config,
  }, {
    config: {
      configured: true,
      mode: 'test',
      accountOwner: 'Rabbi Ellie Scheller',
      providerAccount: 'acct_test_redacted',
    },
  });

  assert.equal(beta.preview_only, true);
  assert.equal(beta.external_write_performed, false);
  assert.equal(beta.readiness.status, 'configured_test_mode');
  assert.equal(beta.requirement_id, 'REQ-20260713-954');
  assert.equal(beta.promotional_access.policy_key, 'one_time_rosh_hashanah_promotional_access');
  assert.equal(beta.promotional_access.conversion_policy_key, 'one_time_rosh_hashanah_paid_conversion');
  assert.equal(beta.promotional_access.stripe_trial_enabled, false);
  assert.equal(beta.launch_trial.trial_days, 0);
  assert.equal(beta.launch_trial.stripe_trial_enabled, false);
  assert.equal(beta.launch_trial.renewal_amount_cents, 6700);
  assert.equal(beta.launch_trial.tax_behavior, 'exclusive');
  assert.equal(beta.launch_trial.card_required, true);
  assert.equal(beta.launch_trial.billing_authorization_required, true);
  assert.equal(beta.launch_trial.one_intro_trial_per_household, false);
  assert.equal(beta.launch_trial.no_failed_payment_grace_period, true);
  assert.equal(beta.referral_credit.activation_trigger, 'first_successful_paid_cycle');
  assert.equal(beta.referral_credit.manual_review_required, true);
  assert.equal(beta.billing_notice.policy_key, 'one_time_rosh_hashanah_pre_billing_notice');
  assert.equal(beta.billing_notice.preview_enabled, true);
  assert.equal(beta.billing_notice.batch_send_enabled, false);
  assert.equal(beta.billing_notice.live_send_enabled, false);
  assert.equal(beta.refund_review.policy_key, 'one_time_manual_exception_refund_review');
  assert.equal(beta.refund_review.manual_review_required, true);
  assert.equal(beta.refund_review.automatic_refunds_enabled, false);
  assert.equal(beta.refund_review.prorated_refunds_enabled, false);
  assert.equal(beta.refund_review.refund_execution_enabled, false);
  assert.equal(beta.actions.checkout_preview_enabled, true);
  assert.equal(beta.actions.checkout_session_creation_enabled, false);
  assert.equal(beta.actions.subscription_creation_enabled, false);
  assert.equal(beta.actions.invoice_credit_enabled, false);
  assert.equal(beta.actions.notice_email_send_enabled, false);
  assert.equal(beta.actions.refund_execution_enabled, false);
  assert.equal(beta.actions.live_charge_enabled, false);
  assert.ok(beta.blocked_actions.includes('checkout_session_create'));
  assert.ok(beta.blocked_actions.includes('invoice_credit_apply'));
  assert.ok(beta.blocked_actions.includes('notice_email_send'));
  assert.ok(beta.blocked_actions.includes('stripe_refund_create'));
  assert.equal(beta.guardrails.no_customer_created, true);
  assert.equal(beta.guardrails.no_invoice_credit_created, true);
  assert.equal(beta.guardrails.no_notice_email_sent, true);
  assert.equal(beta.guardrails.no_refund_created, true);
  assert.equal(beta.guardrails.no_live_charge, true);
});

test('promotional conversion/referral migration creates storage and seeds only disabled policy records', () => {
  [
    'bna_one_time_promotion_policies',
    'bna_one_time_policy_acceptances',
    'bna_one_time_referrals',
    'bna_one_time_referral_credits',
    'bna_one_time_billing_notices',
    'bna_one_time_refund_reviews',
  ].forEach((table) => {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });

  assert.match(migration, /one_time_rosh_hashanah_promotional_access/);
  assert.match(migration, /one_time_rosh_hashanah_paid_conversion/);
  assert.match(migration, /one-time-rosh-hashanah-promotional-access-v1/);
  assert.match(migration, /"trial_days":0/);
  assert.match(migration, /"stripe_trial_enabled":false/);
  assert.match(migration, /"renewal_amount_cents":6700/);
  assert.match(migration, /"card_required":true/);
  assert.match(migration, /"billing_authorization_required":true/);
  assert.match(migration, /"no_failed_payment_grace_period":true/);
  assert.match(migration, /one_time_warm_lead_intro_trial/);
  assert.match(migration, /superseded_by/);
  assert.match(migration, /THEN 'archived'/);
  assert.match(migration, /one_time_referral_credit_after_first_paid_cycle/);
  assert.match(migration, /first_successful_paid_cycle/);
  assert.match(migration, /"reward_amount_cents":6700/);
  assert.match(migration, /invoice_credit_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /real_invoice_credit_created BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /external_write_performed BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /one_time_rosh_hashanah_pre_billing_notice/);
  assert.match(migration, /one_time_manual_exception_refund_review/);
  assert.match(migration, /send_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /refund_execution_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /automatic_refund BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /rosh_hashanah_billing_policy_copy/);
  assert.match(migration, /DEC-20260713-950/);
  assert.match(migration, /public_output_allowed, metadata, updated_at/);
});

test('server and Operations expose promotional conversion readback with disabled billing actions', () => {
  assert.match(server, /railway-migration-2026-06-21-one-time-trial-referral-config\.sql/);
  assert.match(server, /createOneTimeTrialReferralConfigSQL/);
  assert.match(server, /await pool\.query\(createOneTimeTrialReferralConfigSQL\)/);
  assert.match(server, /bna_one_time_promotion_policies/);
  assert.match(server, /bna_one_time_policy_acceptances/);
  assert.match(server, /bna_one_time_referrals/);
  assert.match(server, /promotion_policies: promotionPolicyViews/);
  assert.match(server, /promotion_policy_count: promotionPolicyViews\.length/);
  assert.match(server, /trial_referral_config: trialReferralConfig/);
  assert.match(server, /trial_referral_policies: promotionPolicyViews/);
  assert.match(server, /stripe_local_beta: stripeLocalBeta/);
  assert.match(server, /buildOneTimeStripeLocalBetaPlan/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/trial-referral-config'/);
  assert.match(server, /\/api\/bna\/one-time\/trial-referral-config' && method === 'GET'/);
  assert.match(server, /live_charges_enabled: false/);
  assert.match(server, /real_invoice_credits_enabled: false/);

  assert.match(operationsHtml, /getOneTimeTrialReferralConfig/);
  assert.match(operationsHtml, /renderOneTimeTrialReferralPanel/);
  assert.match(operationsHtml, /data-one-time-trial-referral-config/);
  assert.match(operationsHtml, /REQ-20260713-954/);
  assert.match(operationsHtml, /Rosh Hashanah promotional access/);
  assert.match(operationsHtml, /No live charge, payment link, Stripe trial, access grant, refund, notice send, or real invoice credit is enabled/);
  assert.match(operationsHtml, /Referral credit/);
  assert.match(operationsHtml, /Billing notice/);
  assert.match(operationsHtml, /Manual refund review/);
  assert.match(operationsHtml, /one_time_rosh_hashanah_pre_billing_notice/);
  assert.match(operationsHtml, /one_time_manual_exception_refund_review/);
  assert.match(operationsHtml, /Policy acceptance storage/);
  assert.match(operationsHtml, /invoice credits \${guardrails\.real_invoice_credits_enabled \? 'enabled' : 'disabled'}/);
  assert.match(operationsHtml, /refunds \${guardrails\.refund_execution_enabled \? 'enabled' : 'disabled'}/);
  assert.doesNotMatch(operationsHtml, /30-day warm-lead intro trial/);

  assert.match(server, /sendFile\(path\.join\(__dirname, 'public', 'operations-bootstrap\.html'\)\)/);
  assert.match(operationsShell, /data-one-time-trial-referral-config/);
  assert.match(liveSmoke, /Operations bootstrap route loads the split Operations shell/);
  assert.match(liveSmoke, /\/js\/operations-shell\.js/);
});

test('one concise no-trial billing Decision seed exists and blocks only live conversion where needed', () => {
  assert.match(migration, /DEC-20260713-950/);
  assert.match(migration, /Approve Rosh Hashanah billing notice and policy wording/);
  assert.match(migration, /no-trial/);
  assert.match(migration, /Blocks only final public\/legal copy and live billing launch/);
  assert.match(migration, /Test\/local policy storage, notice preview, and refund-review storage remain usable/);
});
