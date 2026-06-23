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
const migration = fs.readFileSync('railway-migration-2026-06-21-one-time-trial-referral-config.sql', 'utf8');
const decisionDoc = fs.readFileSync('ops/one-time-mishnah/revenue-launch-parser-followup-decisions.md', 'utf8');

test('One Time trial and referral configuration is test-local and policy-versioned', () => {
  const offers = buildOneTimeProductOfferCatalog([]);
  const config = buildOneTimeTrialReferralConfiguration({
    offers,
    decisions: [
      {
        decision_key: 'trial_referral_legal_wording',
        status: 'decision_pending',
        needed_from: 'Shloimie / Rabbi Ellie Scheller / legal-accounting owner',
      },
    ],
    acceptances: [
      {
        policy_key: 'one_time_warm_lead_intro_trial',
        policy_version: 'one-time-warm-lead-intro-trial-v1',
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

  assert.equal(config.requirement_id, 'REQ-20260621-906');
  assert.equal(config.mode, 'test_local_only');
  assert.equal(config.launch_trial.trial_days, 30);
  assert.equal(config.launch_trial.renewal.amount_cents, 6700);
  assert.equal(config.launch_trial.renewal.currency, 'USD');
  assert.equal(config.launch_trial.renewal.billing_interval, 'month');
  assert.equal(config.launch_trial.rules.card_required, true);
  assert.equal(config.launch_trial.rules.one_intro_trial_per_household, true);
  assert.equal(config.launch_trial.acceptance.storage_table, 'bna_one_time_policy_acceptances');
  assert.equal(config.launch_trial.gates.checkout_session_creation_enabled, false);
  assert.equal(config.launch_trial.gates.live_charges_enabled, false);
  assert.equal(config.launch_trial.gates.invoice_credit_enabled, false);

  assert.equal(config.referral_credit.activation_trigger, 'first_successful_paid_cycle');
  assert.equal(config.referral_credit.rules.activate_only_after_first_successful_paid_cycle, true);
  assert.equal(config.referral_credit.rules.self_referrals_allowed, false);
  assert.equal(config.referral_credit.reward.amount_cents, 6700);
  assert.equal(config.referral_credit.gates.invoice_credit_enabled, false);
  assert.equal(config.referral_credit.gates.real_invoice_credit_created, false);
  assert.equal(config.referral_credit.gates.external_write_performed, false);

  assert.equal(config.acceptance_storage.supported, true);
  assert.equal(config.acceptance_storage.test_local_mode_supported, true);
  assert.equal(config.acceptance_storage.record_count, 1);
  assert.ok(config.acceptance_storage.required_fields.includes('policy_version'));
  assert.ok(config.acceptance_storage.required_fields.includes('accepted_at'));
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

  assert.equal(beta.requirement_id, 'REQ-20260621-906');
  assert.equal(beta.preview_only, true);
  assert.equal(beta.external_write_performed, false);
  assert.equal(beta.readiness.status, 'configured_test_mode');
  assert.equal(beta.launch_trial.trial_days, 30);
  assert.equal(beta.launch_trial.renewal_amount_cents, 6700);
  assert.equal(beta.launch_trial.card_required, true);
  assert.equal(beta.launch_trial.one_intro_trial_per_household, true);
  assert.equal(beta.referral_credit.activation_trigger, 'first_successful_paid_cycle');
  assert.equal(beta.referral_credit.manual_review_required, true);
  assert.equal(beta.actions.checkout_preview_enabled, true);
  assert.equal(beta.actions.checkout_session_creation_enabled, false);
  assert.equal(beta.actions.subscription_creation_enabled, false);
  assert.equal(beta.actions.invoice_credit_enabled, false);
  assert.equal(beta.actions.live_charge_enabled, false);
  assert.ok(beta.blocked_actions.includes('checkout_session_create'));
  assert.ok(beta.blocked_actions.includes('invoice_credit_apply'));
  assert.equal(beta.guardrails.no_customer_created, true);
  assert.equal(beta.guardrails.no_invoice_credit_created, true);
  assert.equal(beta.guardrails.no_live_charge, true);
});

test('trial/referral migration creates storage and seeds only disabled policy records', () => {
  [
    'bna_one_time_promotion_policies',
    'bna_one_time_policy_acceptances',
    'bna_one_time_referrals',
    'bna_one_time_referral_credits',
  ].forEach((table) => {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });

  assert.match(migration, /one_time_warm_lead_intro_trial/);
  assert.match(migration, /one-time-warm-lead-intro-trial-v1/);
  assert.match(migration, /"trial_days":30/);
  assert.match(migration, /"renewal_amount_cents":6700/);
  assert.match(migration, /"card_required":true/);
  assert.match(migration, /"one_intro_trial_per_household":true/);
  assert.match(migration, /one_time_referral_credit_after_first_paid_cycle/);
  assert.match(migration, /first_successful_paid_cycle/);
  assert.match(migration, /"reward_amount_cents":6700/);
  assert.match(migration, /invoice_credit_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /real_invoice_credit_created BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /external_write_performed BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(migration, /trial_referral_legal_wording/);
  assert.match(migration, /DEC-20260621-901/);
  assert.match(migration, /public_output_allowed, metadata, updated_at/);
});

test('server and Operations expose trial/referral readback with disabled billing actions', () => {
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
  assert.match(operationsHtml, /REQ-20260621-906/);
  assert.match(operationsHtml, /Warm-lead intro trial/);
  assert.match(operationsHtml, /Referral credit/);
  assert.match(operationsHtml, /Policy acceptance storage/);
  assert.match(operationsHtml, /No live charge, payment link, or real invoice credit is enabled/);
  assert.match(operationsHtml, /invoice credits \${guardrails\.real_invoice_credits_enabled \? 'enabled' : 'disabled'}/);
});

test('one concise legal wording Decision exists and blocks only public/legal copy', () => {
  assert.match(decisionDoc, /Decision ID: `DEC-20260621-901`/);
  assert.match(decisionDoc, /final customer-facing legal wording/);
  assert.match(decisionDoc, /trial renewal, cancellation, refund exceptions, and policy acceptance/);
  assert.match(decisionDoc, /This Decision blocks only final public\/legal copy and live billing launch/);
  assert.match(decisionDoc, /does not block test-mode implementation/);
});
