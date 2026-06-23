const {
  loadConfigValue,
  loadSecret,
  redactError,
} = require('./secret-loader');
const {
  requireExternalApproval,
} = require('./external-actions');

function secretMode(value = '', fallback = '') {
  const text = String(value || '').trim();
  if (text.startsWith('sk_live_')) return 'live';
  if (text.startsWith('rk_live_')) return 'live';
  if (text.startsWith('sk_test_')) return 'test';
  if (text.startsWith('rk_test_')) return 'test';
  return String(fallback || 'unknown').trim().toLowerCase() || 'unknown';
}

function getStripeConfig(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const loaderOptions = {
    repoRoot,
    ...(options.keyholderRoots !== undefined ? { keyholderRoots: options.keyholderRoots } : {}),
    ...(options.secretsRoot !== undefined ? { secretsRoot: options.secretsRoot } : {}),
  };
  const secret = options.secret !== undefined
    ? { configured: Boolean(options.secret), value: String(options.secret || ''), source_type: 'runtime' }
    : loadSecret({
      envName: options.envName || 'STRIPE_SECRET_KEY',
      names: ['stripe-secret-key', 'stripe', 'STRIPE_SECRET_KEY', 'RABBI_STRIPE_SECRET_KEY'],
      fileNames: ['stripe-secret-key.txt', 'stripe.txt', 'STRIPE_SECRET_KEY.txt', 'RABBI_STRIPE_SECRET_KEY.txt'],
      ...loaderOptions,
    });
  const rabbiSecret = options.rabbiSecret !== undefined
    ? { configured: Boolean(options.rabbiSecret), value: String(options.rabbiSecret || ''), source_type: 'runtime' }
    : loadSecret({
      envName: 'RABBI_STRIPE_SECRET_KEY',
      names: ['rabbi-stripe-secret-key', 'stripe', 'RABBI_STRIPE_SECRET_KEY'],
      fileNames: ['rabbi-stripe-secret-key.txt', 'stripe.txt', 'RABBI_STRIPE_SECRET_KEY.txt'],
      ...loaderOptions,
    });
  const activeSecret = rabbiSecret.value ? rabbiSecret : secret;
  const modeHint = options.mode || loadConfigValue({
    envName: rabbiSecret.value ? 'RABBI_STRIPE_MODE' : 'STRIPE_MODE',
    names: ['stripe-mode', 'stripe'],
    fileNames: ['stripe-mode.txt', 'STRIPE_MODE.txt', 'RABBI_STRIPE_MODE.txt', 'stripe.txt'],
    ...loaderOptions,
  });
  return {
    configured: Boolean(activeSecret.value),
    secretKey: activeSecret.value,
    source_type: activeSecret.source_type || null,
    mode: secretMode(activeSecret.value, modeHint || 'test'),
    accountOwner: String(options.accountOwner || loadConfigValue({
      envName: 'STRIPE_ACCOUNT_OWNER',
      names: ['stripe-account-owner', 'stripe'],
      fileNames: ['stripe-account-owner.txt', 'STRIPE_ACCOUNT_OWNER.txt', 'stripe.txt'],
      ...loaderOptions,
    }) || 'unknown').trim() || 'unknown',
    providerAccount: String(options.providerAccount || loadConfigValue({
      envName: 'STRIPE_PROVIDER_ACCOUNT',
      names: ['stripe-provider-account', 'stripe'],
      fileNames: ['stripe-provider-account.txt', 'STRIPE_PROVIDER_ACCOUNT.txt', 'stripe.txt'],
      ...loaderOptions,
    }) || '').trim(),
  };
}

function getStripeReadiness(options = {}) {
  const config = options.config || getStripeConfig(options);
  const blockers = [];
  const safeActions = ['health_check', 'checkout_preview'];
  const blockedActions = ['product_write', 'price_write', 'checkout_create', 'live_billing'];
  if (!config.configured) blockers.push('Stripe secret key is not configured server-side.');
  if (!config.accountOwner || config.accountOwner === 'unknown') blockers.push('Stripe account ownership must be documented before checkout or live billing.');
  if (config.mode === 'live') blockers.push('Live Stripe billing requires a separate final approval and test-buyer rollback plan.');
  return {
    provider: 'stripe',
    label: 'Stripe',
    configured: config.configured,
    status: config.configured
      ? (config.mode === 'live' ? 'configured_live_mode' : config.mode === 'test' ? 'configured_test_mode' : 'configured')
      : 'not_configured',
    mode: config.mode,
    accountOwner: config.accountOwner || 'unknown',
    providerAccount: config.providerAccount || null,
    safeActions,
    blockedActions,
    blockers,
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildCheckoutPreview(payload = {}, options = {}) {
  const readiness = getStripeReadiness(options);
  return {
    provider: 'stripe',
    preview_only: true,
    external_write_performed: false,
    readiness,
    checkout: {
      title: String(payload.title || payload.product_name || 'BNA checkout').slice(0, 160),
      currency: String(payload.currency || 'usd').toLowerCase().slice(0, 12),
      amount: Number.isFinite(Number(payload.amount)) ? Number(payload.amount) : null,
      success_url_configured: Boolean(payload.success_url || payload.successUrl),
      cancel_url_configured: Boolean(payload.cancel_url || payload.cancelUrl),
    },
  };
}

function buildOneTimeStripeLocalBetaPlan(payload = {}, options = {}) {
  const readiness = getStripeReadiness(options);
  const config = payload.trial_referral_config || payload.trialReferralConfig || payload || {};
  const trial = config.launch_trial || payload.launch_trial || {};
  const renewal = trial.renewal || {};
  const trialRules = trial.rules || {};
  const referral = config.referral_credit || payload.referral_credit || {};
  const referralReward = referral.reward || {};
  return {
    provider: 'stripe',
    requirement_id: 'REQ-20260621-906',
    mode: 'test_local_only',
    preview_only: true,
    external_write_performed: false,
    readiness,
    launch_trial: {
      policy_key: trial.policy_key || 'one_time_warm_lead_intro_trial',
      policy_version: trial.policy_version || 'one-time-warm-lead-intro-trial-v1',
      offer_key: trial.offer_key || 'membership_67_monthly',
      trial_days: Number.isFinite(Number(trial.trial_days)) ? Number(trial.trial_days) : 30,
      renewal_amount_cents: Number.isFinite(Number(renewal.amount_cents)) ? Number(renewal.amount_cents) : 6700,
      currency: String(renewal.currency || 'USD').toUpperCase(),
      billing_interval: renewal.billing_interval || 'month',
      card_required: trialRules.card_required !== false,
      one_intro_trial_per_household: trialRules.one_intro_trial_per_household !== false,
    },
    referral_credit: {
      policy_key: referral.policy_key || 'one_time_referral_credit_after_first_paid_cycle',
      policy_version: referral.policy_version || 'one-time-referral-credit-v1',
      activation_trigger: referral.activation_trigger || 'first_successful_paid_cycle',
      reward_type: referralReward.type || 'manual_month_credit_candidate',
      reward_amount_cents: Number.isFinite(Number(referralReward.amount_cents)) ? Number(referralReward.amount_cents) : 6700,
      currency: String(referralReward.currency || 'USD').toUpperCase(),
      manual_review_required: true,
    },
    actions: {
      checkout_preview_enabled: true,
      checkout_session_creation_enabled: false,
      subscription_creation_enabled: false,
      payment_method_collection_live_enabled: false,
      invoice_credit_enabled: false,
      live_charge_enabled: false,
      external_write_performed: false,
    },
    blocked_actions: [
      'checkout_session_create',
      'subscription_create',
      'payment_method_collection',
      'invoice_credit_apply',
      'live_charge',
    ],
    guardrails: {
      no_customer_created: true,
      no_subscription_created: true,
      no_payment_method_collected: true,
      no_invoice_credit_created: true,
      no_live_charge: true,
      external_write_performed: false,
    },
  };
}

function assertCheckoutCreateApproved(payload = {}, options = {}) {
  const readiness = getStripeReadiness(options);
  const confirm = payload.confirm || payload.confirmation_phrase || '';
  requireExternalApproval({
    provider: 'stripe',
    action: readiness.mode === 'live' ? 'live_billing' : 'checkout_create',
    riskLevel: 'high',
    previewOnly: false,
    confirm,
    accountOwner: readiness.accountOwner,
    mode: readiness.mode,
  });
  if (readiness.mode === 'live') {
    const error = new Error('Stripe live checkout creation remains blocked in INT-05 without explicit separate live-billing approval.');
    error.status = 409;
    throw error;
  }
  return readiness;
}

function safeStripeError(error, config = {}) {
  return redactError(error, [config.secretKey]);
}

module.exports = {
  assertCheckoutCreateApproved,
  buildCheckoutPreview,
  buildOneTimeStripeLocalBetaPlan,
  getStripeConfig,
  getStripeReadiness,
  safeStripeError,
  secretMode,
};
