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
  getStripeConfig,
  getStripeReadiness,
  safeStripeError,
  secretMode,
};
