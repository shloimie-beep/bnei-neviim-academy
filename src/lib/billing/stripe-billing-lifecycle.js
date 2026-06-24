const crypto = require('crypto');

const STRIPE_CONFIG_STATES = Object.freeze([
  'not_configured',
  'sandbox_configured',
  'sandbox_invalid',
  'sandbox_ready',
  'live_configured',
  'live_disabled',
  'live',
]);

const DEFAULT_TENANT_ID = 'one_time_mishnah_class';
const DEFAULT_PROVIDER_ID = 'rabbi_scheller';

const PROVISIONAL_TEST_POLICY = Object.freeze({
  policy_key: 'one_time_provisional_stripe_sandbox_policy',
  policy_version: 'stripe-sandbox-provisional-2026-06-24',
  policy_status: 'provisional_test_only',
  price: {
    offer_key: 'membership_67_monthly',
    product_key: 'one_time_membership',
    display_name: 'One Time membership sandbox test',
    amount_cents: 6700,
    currency: 'USD',
    interval: 'month',
  },
  trial: {
    days: 30,
    card_required: true,
    one_intro_trial_per_household: true,
  },
  renewal: {
    interval: 'month',
    retry_collection: 'stripe_smart_retries',
  },
  cancellation: {
    behavior: 'period_end',
  },
  refund: {
    status: 'decision_required',
    default_action: 'manual_review_only',
  },
  tax: {
    status: 'not_configured',
    automatic_tax_enabled: false,
  },
  grace_period: {
    days: 7,
    access_during_grace: true,
  },
  receipt_invoice_language: {
    status: 'draft',
    customer_facing_copy_approved: false,
  },
  provider_revenue_split: {
    status: 'decision_required',
    provider_share_basis_points: null,
  },
});

const POLICY_GAPS = Object.freeze([
  'Canonical live price is not approved; $67/month and 30-day trial are provisional sandbox defaults.',
  'Currency, tax handling, refund policy, grace period, cancellation effective date, receipt/invoice language, and provider revenue split need approved Decisions before live mode.',
  'Provider payout/Stripe Connect ownership is unresolved and must not be inferred from sandbox readiness.',
]);

function nowIso(now = new Date()) {
  return now instanceof Date ? now.toISOString() : new Date(now).toISOString();
}

function normalizeMode(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (['test', 'sandbox', 'sandbox_configured', 'sandbox_ready'].includes(normalized)) return 'sandbox';
  if (['live', 'production', 'prod'].includes(normalized)) return 'live';
  if (['disabled', 'off', 'none'].includes(normalized)) return 'disabled';
  return '';
}

function detectStripeKeyMode(secretKey = '') {
  const key = String(secretKey || '').trim();
  if (/^sk_test_/.test(key) || /^rk_test_/.test(key)) return 'sandbox';
  if (/^sk_live_/.test(key) || /^rk_live_/.test(key)) return 'live';
  if (!key) return 'missing';
  return 'unknown';
}

function safeBoolean(value, fallback = false) {
  if (value === true || value === false) return value;
  const normalized = String(value || '').trim().toLowerCase();
  if (['true', '1', 'yes', 'on', 'enabled'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off', 'disabled'].includes(normalized)) return false;
  return fallback;
}

function fingerprint(value = '') {
  const text = String(value || '').trim();
  if (!text) return null;
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
}

function sanitizeStripeId(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  const prefix = text.split('_').slice(0, 2).join('_') || 'stripe';
  return `${prefix}_[redacted_${fingerprint(text)}]`;
}

function redactStripeSecrets(value, extraSecrets = []) {
  let text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  for (const secret of extraSecrets) {
    const normalized = String(secret || '').trim();
    if (normalized) text = text.split(normalized).join('[redacted]');
  }
  text = text.replace(/\b(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9._-]{8,}\b/g, '[redacted_stripe_key]');
  text = text.replace(/\bwhsec_[A-Za-z0-9._-]{8,}\b/g, '[redacted_webhook_secret]');
  text = text.replace(/Authorization:\s*Bearer\s+[A-Za-z0-9._-]+/gi, 'Authorization: Bearer [redacted]');
  if (typeof value === 'string') return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

class BillingLifecycleError extends Error {
  constructor(message, { code = 'billing_lifecycle_error', statusCode = 400, state = null, details = {} } = {}) {
    super(message);
    this.name = 'BillingLifecycleError';
    this.code = code;
    this.statusCode = statusCode;
    this.state = state;
    this.details = details;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      state: this.state,
      details: redactStripeSecrets(this.details),
    };
  }
}

function resolveStripeBillingConfig(input = {}) {
  const secretKey = String(input.secretKey || input.secret_key || '').trim();
  const webhookSecret = String(input.webhookSecret || input.webhook_secret || '').trim();
  const publishableKey = String(input.publishableKey || input.publishable_key || '').trim();
  const requestedMode = normalizeMode(input.mode || input.requestedMode || '');
  const keyMode = detectStripeKeyMode(secretKey);
  const accountOwner = String(input.accountOwner || input.account_owner || '').trim();
  const liveApproved = safeBoolean(input.liveApproved ?? input.live_approved, false);
  const liveBillingEnabled = safeBoolean(input.liveBillingEnabled ?? input.live_billing_enabled, false);
  const sandboxApiVerified = safeBoolean(input.sandboxApiVerified ?? input.sandbox_api_verified, false);
  const sandboxAccountLivemode = input.sandboxAccountLivemode ?? input.sandbox_account_livemode;
  const missing = [];
  const blockers = [];
  let state = 'not_configured';
  let effectiveMode = 'not_configured';

  if (!secretKey) {
    missing.push('STRIPE_SECRET_KEY or RABBI_STRIPE_SECRET_KEY');
    blockers.push('Stripe secret key is not configured server-side.');
  } else if (keyMode === 'unknown') {
    state = 'sandbox_invalid';
    effectiveMode = requestedMode || 'unknown';
    blockers.push('Stripe secret key prefix is not recognized as test or live.');
  } else if (keyMode === 'sandbox') {
    effectiveMode = 'sandbox';
    if (requestedMode === 'live') {
      state = 'sandbox_invalid';
      blockers.push('STRIPE_MODE/RABBI_STRIPE_MODE requested live mode with a test key.');
    } else if (sandboxAccountLivemode === true) {
      state = 'sandbox_invalid';
      blockers.push('Stripe API returned livemode=true for a sandbox key.');
    } else {
      state = sandboxApiVerified ? 'sandbox_ready' : 'sandbox_configured';
      if (!sandboxApiVerified) blockers.push('Sandbox key is present but API readiness has not been verified in this run.');
    }
  } else if (keyMode === 'live') {
    effectiveMode = requestedMode === 'live' ? 'live' : 'disabled_live';
    if (requestedMode !== 'live') {
      state = 'live_configured';
      blockers.push('A live Stripe key is configured, but live mode is not explicitly requested; live billing remains disabled.');
    } else if (!liveBillingEnabled || !liveApproved) {
      state = 'live_disabled';
      blockers.push('Live Stripe billing requires explicit live mode, live billing enablement, and final approval.');
    } else {
      state = 'live';
    }
  }

  if (secretKey && !accountOwner) {
    blockers.push('Stripe account owner must be documented before checkout or live billing.');
  }
  if (secretKey && !webhookSecret) {
    missing.push('STRIPE_WEBHOOK_SECRET or RABBI_STRIPE_WEBHOOK_SECRET');
  }

  return {
    provider: 'stripe',
    state,
    effective_mode: effectiveMode,
    requested_mode: requestedMode || null,
    key_mode: keyMode,
    secret_configured: Boolean(secretKey),
    webhook_secret_configured: Boolean(webhookSecret),
    publishable_key_configured: Boolean(publishableKey),
    account_owner_configured: Boolean(accountOwner),
    account_owner: accountOwner || 'unknown',
    live_billing_enabled: Boolean(liveBillingEnabled),
    live_approved: Boolean(liveApproved),
    sandbox_api_verified: Boolean(sandboxApiVerified),
    missing,
    blockers,
    safe_to_create_checkout_session: state === 'sandbox_ready' || state === 'live',
    safe_to_create_live_charge: state === 'live',
    secret_fingerprint: fingerprint(secretKey),
    webhook_secret_fingerprint: fingerprint(webhookSecret),
    secrets_included: false,
  };
}

function safeConfigView(config = {}) {
  const safe = { ...config };
  delete safe.secretKey;
  delete safe.secret_key;
  delete safe.webhookSecret;
  delete safe.webhook_secret;
  delete safe.publishableKey;
  delete safe.publishable_key;
  safe.secrets_included = false;
  return redactStripeSecrets(safe);
}

function assertAllowedConfigState(config, allowedStates = []) {
  const state = config?.state || 'not_configured';
  if (!allowedStates.includes(state)) {
    throw new BillingLifecycleError(`Stripe configuration state ${state} is not allowed for this action.`, {
      code: 'stripe_config_state_blocked',
      statusCode: 409,
      state,
      details: { allowedStates, config: safeConfigView(config) },
    });
  }
}

function getStripeClientWrapper({ StripeCtor, secretKey, apiVersion = '2025-05-28.basil' } = {}) {
  const key = String(secretKey || '').trim();
  if (!key) return null;
  const Stripe = StripeCtor || require('stripe');
  return new Stripe(key, { apiVersion });
}

function resolveBillingPolicy(input = {}) {
  const approved = input.policy && input.policy.policy_status === 'approved';
  const policy = approved ? input.policy : {
    ...PROVISIONAL_TEST_POLICY,
    ...(input.policy && typeof input.policy === 'object' ? input.policy : {}),
    policy_status: input.policy?.policy_status || PROVISIONAL_TEST_POLICY.policy_status,
  };
  return {
    ...policy,
    credential_free: true,
    canonical_approved: Boolean(approved),
    provisional_test_policy: !approved,
    gaps: approved ? [] : [...POLICY_GAPS],
  };
}

function cents(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function buildProductPriceMap({ policy = resolveBillingPolicy(), tiers = [], priceIds = {} } = {}) {
  const defaultPrice = policy.price || PROVISIONAL_TEST_POLICY.price;
  const rows = tiers.length ? tiers : [{
    tier_key: defaultPrice.offer_key,
    display_name: defaultPrice.display_name,
    amount_cents: defaultPrice.amount_cents,
    currency: defaultPrice.currency,
    billing_interval: defaultPrice.interval,
    stripe_price_id: priceIds[defaultPrice.offer_key] || '',
    access_scopes: ['library'],
  }];
  const byOfferKey = {};
  for (const row of rows) {
    const offerKey = String(row.offer_key || row.tier_key || defaultPrice.offer_key).trim();
    byOfferKey[offerKey] = {
      offer_key: offerKey,
      product_key: row.product_key || defaultPrice.product_key,
      display_name: row.display_name || row.name || defaultPrice.display_name,
      amount_cents: cents(row.amount_cents ?? row.price_amount_cents, defaultPrice.amount_cents),
      currency: String(row.currency || defaultPrice.currency || 'USD').toUpperCase(),
      interval: row.billing_interval || row.interval || defaultPrice.interval || 'month',
      stripe_price_id: String(row.stripe_price_id || priceIds[offerKey] || '').trim(),
      access_scopes: Array.isArray(row.access_scopes) ? row.access_scopes : ['library'],
      policy_status: policy.policy_status,
      provisional_test_policy: Boolean(policy.provisional_test_policy),
    };
  }
  return {
    provider: 'stripe',
    by_offer_key: byOfferKey,
    default_offer_key: defaultPrice.offer_key,
    missing_price_ids: Object.values(byOfferKey)
      .filter((entry) => !entry.stripe_price_id)
      .map((entry) => entry.offer_key),
  };
}

function assertBrowserSafeStripePayload(payload) {
  const text = JSON.stringify(payload ?? {});
  if (/\b(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9._-]{8,}\b/.test(text) || /\bwhsec_[A-Za-z0-9._-]{8,}\b/.test(text)) {
    throw new BillingLifecycleError('Stripe payload contains a secret-like value.', {
      code: 'stripe_secret_leak',
      statusCode: 500,
    });
  }
  const unsafeKey = [];
  (function walk(value, path = []) {
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      const safeSecretMetadata = /^(?:webhook_)?secret_configured$|^(?:webhook_)?secret_fingerprint$|^secrets_included$/i.test(key);
      if (!safeSecretMetadata && /secret|token|authorization|password/i.test(key)) unsafeKey.push([...path, key].join('.'));
      walk(item, [...path, key]);
    }
  })(payload);
  if (unsafeKey.length) {
    throw new BillingLifecycleError('Stripe browser payload contains unsafe secret-bearing fields.', {
      code: 'stripe_secret_field_leak',
      statusCode: 500,
      details: { fields: unsafeKey },
    });
  }
  return true;
}

function buildCheckoutSessionPayload({
  request = {},
  policy = resolveBillingPolicy(),
  priceMap = buildProductPriceMap({ policy }),
  tenantId = DEFAULT_TENANT_ID,
  providerId = DEFAULT_PROVIDER_ID,
  successUrl = 'https://example.invalid/billing/success',
  cancelUrl = 'https://example.invalid/billing/cancel',
} = {}) {
  const offerKey = String(request.offer_key || request.offerKey || priceMap.default_offer_key || policy.price.offer_key).trim();
  const price = priceMap.by_offer_key[offerKey];
  if (!price) {
    throw new BillingLifecycleError(`Stripe offer ${offerKey} is not mapped to a billing price.`, {
      code: 'stripe_price_mapping_missing',
      statusCode: 400,
      details: { offerKey },
    });
  }
  if (!price.stripe_price_id) {
    throw new BillingLifecycleError(`Stripe offer ${offerKey} does not have a non-secret price ID.`, {
      code: 'stripe_price_id_missing',
      statusCode: 409,
      details: { offerKey },
    });
  }
  const customerEmail = String(request.customer_email || request.email || request.member_email || '').trim();
  const memberId = String(request.member_id || request.memberId || '').trim();
  const payload = {
    mode: 'subscription',
    line_items: [{ price: price.stripe_price_id, quantity: 1 }],
    success_url: String(request.success_url || request.successUrl || successUrl),
    cancel_url: String(request.cancel_url || request.cancelUrl || cancelUrl),
    customer: request.customer_id || request.customerId || undefined,
    customer_email: request.customer_id || request.customerId ? undefined : (customerEmail || undefined),
    allow_promotion_codes: true,
    automatic_tax: { enabled: Boolean(policy.tax?.automatic_tax_enabled) },
    client_reference_id: memberId || undefined,
    subscription_data: {
      trial_period_days: cents(policy.trial?.days, 0) || undefined,
      metadata: {
        tenant_id: tenantId,
        provider_id: providerId,
        offer_key: offerKey,
        member_id: memberId,
        policy_key: policy.policy_key,
        policy_version: policy.policy_version,
        provisional_test_policy: String(Boolean(policy.provisional_test_policy)),
      },
    },
    metadata: {
      tenant_id: tenantId,
      provider_id: providerId,
      offer_key: offerKey,
      member_id: memberId,
      policy_key: policy.policy_key,
      policy_version: policy.policy_version,
      provisional_test_policy: String(Boolean(policy.provisional_test_policy)),
    },
  };
  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  assertBrowserSafeStripePayload({
    mode: payload.mode,
    line_items: payload.line_items,
    success_url_configured: Boolean(payload.success_url),
    cancel_url_configured: Boolean(payload.cancel_url),
    metadata: payload.metadata,
  });
  return {
    provider: 'stripe',
    offer_key: offerKey,
    price,
    payload,
    preview_only: true,
    external_write_performed: false,
  };
}

async function createStripeCheckoutSession({
  stripeClient,
  config,
  request = {},
  policy,
  priceMap,
  idempotencyKey,
} = {}) {
  assertAllowedConfigState(config, ['sandbox_ready', 'live']);
  if (config.state === 'live' && !config.safe_to_create_live_charge) {
    throw new BillingLifecycleError('Live checkout is disabled.', {
      code: 'stripe_live_checkout_disabled',
      statusCode: 409,
      state: config.state,
    });
  }
  if (!stripeClient?.checkout?.sessions?.create) {
    throw new BillingLifecycleError('Stripe checkout client is not available.', {
      code: 'stripe_client_unavailable',
      statusCode: 503,
    });
  }
  const built = buildCheckoutSessionPayload({ request, policy, priceMap });
  const session = await stripeClient.checkout.sessions.create(
    built.payload,
    idempotencyKey ? { idempotencyKey } : undefined
  );
  return {
    provider: 'stripe',
    checkout_session_id: session?.id || null,
    checkout_url: session?.url || null,
    mode: session?.mode || built.payload.mode,
    livemode: Boolean(session?.livemode),
    external_write_performed: true,
    secrets_included: false,
    request: {
      offer_key: built.offer_key,
      price_id: sanitizeStripeId(built.price.stripe_price_id),
      customer_email_present: Boolean(built.payload.customer_email),
    },
  };
}

function buildSafeBillingPreview(options = {}) {
  const policy = resolveBillingPolicy(options);
  const priceMap = buildProductPriceMap({ policy, tiers: options.tiers || [], priceIds: options.priceIds || {} });
  const config = resolveStripeBillingConfig(options.config || {});
  let checkout = null;
  try {
    checkout = buildCheckoutSessionPayload({
      request: {
        ...(options.request || {}),
        offer_key: options.offer_key || options.offerKey || priceMap.default_offer_key,
      },
      policy,
      priceMap,
    });
  } catch (error) {
    checkout = error instanceof BillingLifecycleError ? error.toJSON() : { error: String(error?.message || error) };
  }
  const preview = {
    provider: 'stripe',
    config: safeConfigView(config),
    policy,
    price_map: {
      default_offer_key: priceMap.default_offer_key,
      offers: Object.fromEntries(Object.entries(priceMap.by_offer_key).map(([key, value]) => [
        key,
        {
          ...value,
          stripe_price_id: sanitizeStripeId(value.stripe_price_id),
        },
      ])),
      missing_price_ids: priceMap.missing_price_ids,
    },
    checkout_preview: checkout,
    preview_only: true,
    external_write_performed: false,
    secrets_included: false,
  };
  assertBrowserSafeStripePayload(preview);
  return preview;
}

function idFromObject(value = {}) {
  return String(value.id || value.object_id || value.subscription || value.customer || value.payment_intent || 'unknown');
}

function metadataValue(object = {}, keys = []) {
  const metadata = object.metadata || {};
  for (const key of keys) {
    if (metadata[key] !== undefined && metadata[key] !== null && String(metadata[key]).trim()) {
      return String(metadata[key]).trim();
    }
  }
  return '';
}

function eventIdempotencyKey(event = {}) {
  const object = event?.data?.object || event.object || {};
  return [
    event.account || 'acct_unknown',
    event.id || event.type || 'event',
    event.type || 'unknown',
    idFromObject(object),
  ].join(':');
}

function createInitialBillingState({
  tenantId = DEFAULT_TENANT_ID,
  providerId = DEFAULT_PROVIDER_ID,
  policy = resolveBillingPolicy(),
  config = resolveStripeBillingConfig(),
  now = new Date(),
} = {}) {
  return {
    tenant_id: tenantId,
    provider_id: providerId,
    mode_state: config.state,
    effective_mode: config.effective_mode,
    policy,
    generated_at: nowIso(now),
    members: {},
    customers: {},
    checkout_sessions: {},
    subscriptions: {},
    invoices: {},
    payment_methods: {},
    entitlements: {},
    provider_revenue: {
      tenant_id: tenantId,
      provider_id: providerId,
      currency: policy.price?.currency || 'USD',
      gross_collected_cents: 0,
      failed_cents: 0,
      refunded_cents: 0,
      pending_cents: 0,
      invoice_count: 0,
      successful_renewal_count: 0,
      scope: 'tenant_provider',
    },
    processed_event_keys: {},
    audit_events: [],
    errors: [],
  };
}

function copyState(state) {
  return JSON.parse(JSON.stringify(state));
}

function toUnixIso(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return new Date(number * 1000).toISOString();
}

function graceUntil(policy, now = new Date()) {
  const days = cents(policy.grace_period?.days, 0) || 0;
  if (!days) return null;
  return new Date(new Date(now).getTime() + days * 86400000).toISOString();
}

function ensureMemberRecord(next, object = {}) {
  const memberId = metadataValue(object, ['member_id', 'memberId']) || object.client_reference_id || object.customer_email || object.customer || 'member_unknown';
  const customerId = object.customer || object.customer_id || '';
  const email = object.customer_email || object.customer_details?.email || object.email || '';
  const name = object.customer_details?.name || object.name || '';
  if (!next.members[memberId]) {
    next.members[memberId] = {
      member_id: memberId,
      customer_id: customerId || null,
      email: email || null,
      name: name || null,
      billing_state: 'new',
      tenant_id: next.tenant_id,
      provider_id: next.provider_id,
    };
  } else {
    next.members[memberId] = {
      ...next.members[memberId],
      customer_id: customerId || next.members[memberId].customer_id || null,
      email: email || next.members[memberId].email || null,
      name: name || next.members[memberId].name || null,
    };
  }
  if (customerId) {
    next.customers[customerId] = {
      customer_id: customerId,
      member_id: memberId,
      email: email || next.members[memberId].email || null,
      tenant_id: next.tenant_id,
      provider_id: next.provider_id,
    };
  }
  return memberId;
}

function updateEntitlement(next, memberId, patch = {}) {
  const current = next.entitlements[memberId] || {
    member_id: memberId,
    tenant_id: next.tenant_id,
    provider_id: next.provider_id,
    entitlement_state: 'none',
    access_enabled: false,
    scopes: [],
    reason: 'not_started',
  };
  next.entitlements[memberId] = {
    ...current,
    ...patch,
    member_id: memberId,
    tenant_id: next.tenant_id,
    provider_id: next.provider_id,
  };
  return next.entitlements[memberId];
}

function subscriptionEntitlementPatch(status, object = {}, policy = PROVISIONAL_TEST_POLICY, now = new Date()) {
  const currentPeriodEnd = toUnixIso(object.current_period_end);
  const trialEnd = toUnixIso(object.trial_end);
  if (status === 'trialing') {
    return {
      entitlement_state: 'trial',
      access_enabled: true,
      reason: 'trial_active',
      trial_ends_at: trialEnd,
      current_period_end: currentPeriodEnd,
    };
  }
  if (status === 'active') {
    return {
      entitlement_state: 'active',
      access_enabled: true,
      reason: 'subscription_active',
      trial_ends_at: trialEnd,
      current_period_end: currentPeriodEnd,
    };
  }
  if (['past_due', 'unpaid', 'incomplete', 'incomplete_expired'].includes(status)) {
    return {
      entitlement_state: policy.grace_period?.access_during_grace ? 'grace_period' : 'payment_failed',
      access_enabled: Boolean(policy.grace_period?.access_during_grace),
      reason: 'payment_failed_retry_required',
      grace_until: graceUntil(policy, now),
      current_period_end: currentPeriodEnd,
    };
  }
  if (status === 'canceled' || status === 'cancelled') {
    if (policy.cancellation?.behavior === 'period_end' && currentPeriodEnd) {
      return {
        entitlement_state: 'scheduled_cancellation',
        access_enabled: true,
        reason: 'cancel_at_period_end',
        current_period_end: currentPeriodEnd,
      };
    }
    return {
      entitlement_state: 'revoked',
      access_enabled: false,
      reason: 'subscription_canceled',
      revoked_at: nowIso(now),
    };
  }
  return {
    entitlement_state: 'manual_review',
    access_enabled: false,
    reason: `subscription_${status || 'unknown'}`,
  };
}

function eventTenantId(object = {}, fallback = DEFAULT_TENANT_ID) {
  return metadataValue(object, ['tenant_id', 'project_key', 'workspace_key']) || fallback;
}

function applyStripeBillingEvent(state, event, options = {}) {
  const now = options.now || new Date();
  const next = copyState(state || createInitialBillingState(options));
  const object = event?.data?.object || event.object || {};
  const type = String(event?.type || object.event_type || '').trim();
  const key = eventIdempotencyKey(event);
  const incomingTenant = eventTenantId(object, next.tenant_id);
  const auditBase = {
    provider: 'stripe',
    event_id: event?.id || null,
    event_type: type || 'unknown',
    idempotency_key: key,
    object_id: object.id || null,
    processed_at: nowIso(now),
    external_write_performed: false,
  };

  if (incomingTenant !== next.tenant_id) {
    const audit = {
      ...auditBase,
      status: 'ignored',
      reason: 'tenant_mismatch',
      expected_tenant_id: next.tenant_id,
      incoming_tenant_id: incomingTenant,
    };
    next.audit_events.push(audit);
    return { state: next, duplicate: false, ignored: true, audit };
  }

  if (next.processed_event_keys[key]) {
    const audit = {
      ...auditBase,
      status: 'duplicate',
      reason: 'event_replay_ignored',
    };
    next.audit_events.push(audit);
    return { state: next, duplicate: true, ignored: true, audit };
  }
  next.processed_event_keys[key] = { event_type: type, object_id: object.id || null, processed_at: nowIso(now) };

  const memberId = ensureMemberRecord(next, object);
  const customerId = object.customer || object.customer_id || '';
  const amountPaid = cents(object.amount_paid ?? object.amount_total ?? object.amount_received, 0) || 0;
  const amountDue = cents(object.amount_due ?? object.amount_remaining ?? object.amount, 0) || 0;
  let audit = { ...auditBase, status: 'processed', member_id: memberId };

  if (type === 'checkout.session.completed') {
    next.checkout_sessions[object.id] = {
      checkout_session_id: object.id,
      status: 'completed',
      payment_status: object.payment_status || 'unknown',
      customer_id: customerId || null,
      subscription_id: object.subscription || null,
      amount_total_cents: amountPaid,
      currency: String(object.currency || next.provider_revenue.currency || 'usd').toUpperCase(),
      member_id: memberId,
      offer_key: metadataValue(object, ['offer_key']) || next.policy.price?.offer_key || null,
    };
    next.members[memberId].billing_state = object.payment_status === 'paid' ? 'paid' : 'checkout_completed';
    if (object.payment_status === 'paid') {
      updateEntitlement(next, memberId, {
        entitlement_state: 'active',
        access_enabled: true,
        reason: 'checkout_paid',
      });
    }
    audit.lifecycle_state = 'checkout_success';
  } else if (type === 'checkout.session.expired') {
    next.checkout_sessions[object.id] = {
      checkout_session_id: object.id,
      status: 'expired',
      customer_id: customerId || null,
      member_id: memberId,
    };
    next.members[memberId].billing_state = 'checkout_expired';
    audit.lifecycle_state = 'checkout_expired';
  } else if (type === 'setup_intent.succeeded' || type === 'payment_method.attached') {
    const methodId = object.payment_method || object.id;
    next.payment_methods[methodId] = {
      payment_method_id: methodId,
      customer_id: customerId || null,
      member_id: memberId,
      state: 'ready',
      reusable: true,
    };
    next.members[memberId].billing_state = 'payment_method_ready';
    audit.lifecycle_state = 'payment_method_ready';
  } else if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
    const status = String(object.status || 'unknown');
    next.subscriptions[object.id] = {
      subscription_id: object.id,
      customer_id: customerId || null,
      member_id: memberId,
      status,
      cancel_at_period_end: Boolean(object.cancel_at_period_end),
      current_period_end: toUnixIso(object.current_period_end),
      trial_end: toUnixIso(object.trial_end),
      latest_invoice: object.latest_invoice || null,
    };
    updateEntitlement(next, memberId, subscriptionEntitlementPatch(status, object, next.policy, now));
    next.members[memberId].billing_state = status;
    audit.lifecycle_state = status === 'trialing' ? 'trial' : status === 'active' ? 'subscription_active' : `subscription_${status}`;
  } else if (type === 'customer.subscription.trial_will_end') {
    updateEntitlement(next, memberId, {
      entitlement_state: 'trial_ending',
      access_enabled: true,
      reason: 'trial_will_end',
      trial_ends_at: toUnixIso(object.trial_end),
    });
    next.members[memberId].billing_state = 'trial_ending';
    audit.lifecycle_state = 'trial_ending';
  } else if (type === 'invoice.upcoming') {
    next.invoices[object.id || key] = {
      invoice_id: object.id || null,
      state: 'renewal_pending',
      amount_due_cents: amountDue,
      currency: String(object.currency || next.provider_revenue.currency || 'usd').toUpperCase(),
      member_id: memberId,
      subscription_id: object.subscription || null,
      hosted_invoice_url: null,
      receipt_url: null,
    };
    next.provider_revenue.pending_cents += amountDue;
    audit.lifecycle_state = 'renewal_pending';
  } else if (type === 'invoice.payment_succeeded') {
    next.invoices[object.id] = {
      invoice_id: object.id,
      state: 'paid',
      amount_paid_cents: amountPaid,
      currency: String(object.currency || next.provider_revenue.currency || 'usd').toUpperCase(),
      member_id: memberId,
      subscription_id: object.subscription || null,
      hosted_invoice_url: object.hosted_invoice_url || null,
      invoice_pdf: object.invoice_pdf || null,
      receipt_url: object.charge?.receipt_url || object.receipt_url || null,
      paid_at: object.status_transitions?.paid_at ? toUnixIso(object.status_transitions.paid_at) : nowIso(now),
    };
    next.provider_revenue.gross_collected_cents += amountPaid;
    next.provider_revenue.invoice_count += 1;
    if (object.billing_reason === 'subscription_cycle') next.provider_revenue.successful_renewal_count += 1;
    updateEntitlement(next, memberId, {
      entitlement_state: 'active',
      access_enabled: true,
      reason: object.billing_reason === 'subscription_cycle' ? 'renewal_paid' : 'invoice_paid',
      current_period_end: toUnixIso(object.lines?.data?.[0]?.period?.end) || null,
    });
    next.members[memberId].billing_state = 'paid';
    audit.lifecycle_state = object.billing_reason === 'subscription_cycle' ? 'renewal_success' : 'payment_success';
  } else if (type === 'invoice.payment_failed' || type === 'payment_intent.payment_failed') {
    const invoiceId = object.id || object.invoice || key;
    next.invoices[invoiceId] = {
      invoice_id: object.id || object.invoice || null,
      state: 'payment_failed',
      amount_due_cents: amountDue,
      currency: String(object.currency || next.provider_revenue.currency || 'usd').toUpperCase(),
      member_id: memberId,
      subscription_id: object.subscription || null,
      next_payment_attempt: toUnixIso(object.next_payment_attempt),
      hosted_invoice_url: object.hosted_invoice_url || null,
    };
    next.provider_revenue.failed_cents += amountDue;
    updateEntitlement(next, memberId, {
      entitlement_state: next.policy.grace_period?.access_during_grace ? 'grace_period' : 'payment_failed',
      access_enabled: Boolean(next.policy.grace_period?.access_during_grace),
      reason: 'payment_failed_retry_required',
      grace_until: graceUntil(next.policy, now),
      retry_state: object.next_payment_attempt ? 'scheduled' : 'needs_recovery',
    });
    next.members[memberId].billing_state = 'payment_failed';
    audit.lifecycle_state = 'payment_failed_retry';
  } else if (type === 'customer.subscription.deleted') {
    next.subscriptions[object.id] = {
      ...(next.subscriptions[object.id] || {}),
      subscription_id: object.id,
      customer_id: customerId || next.subscriptions[object.id]?.customer_id || null,
      member_id: memberId,
      status: 'canceled',
      canceled_at: toUnixIso(object.canceled_at) || nowIso(now),
      current_period_end: toUnixIso(object.current_period_end),
    };
    updateEntitlement(next, memberId, subscriptionEntitlementPatch('canceled', object, next.policy, now));
    next.members[memberId].billing_state = 'canceled';
    audit.lifecycle_state = 'cancellation';
  } else if (type === 'charge.refunded' || type === 'refund.created' || type === 'refund.updated') {
    const refunded = cents(object.amount_refunded ?? object.amount, 0) || 0;
    next.provider_revenue.refunded_cents += refunded;
    updateEntitlement(next, memberId, {
      entitlement_state: 'manual_review',
      access_enabled: true,
      reason: 'refund_requires_manual_policy_review',
    });
    next.members[memberId].billing_state = 'refund_review';
    audit.lifecycle_state = 'refund_review';
  } else {
    audit = {
      ...audit,
      status: 'ignored',
      reason: 'unhandled_event_type',
    };
  }

  next.audit_events.push(audit);
  return { state: next, duplicate: false, ignored: audit.status === 'ignored', audit };
}

function buildInvoiceReceiptReadModel(state = {}) {
  const invoices = Object.values(state.invoices || {}).map((invoice) => ({
    invoice_id: invoice.invoice_id ? sanitizeStripeId(invoice.invoice_id) : null,
    state: invoice.state,
    amount_paid_cents: invoice.amount_paid_cents || 0,
    amount_due_cents: invoice.amount_due_cents || 0,
    currency: invoice.currency || state.provider_revenue?.currency || 'USD',
    member_id: invoice.member_id || null,
    subscription_id: invoice.subscription_id ? sanitizeStripeId(invoice.subscription_id) : null,
    hosted_invoice_url_configured: Boolean(invoice.hosted_invoice_url),
    invoice_pdf_configured: Boolean(invoice.invoice_pdf),
    receipt_url_configured: Boolean(invoice.receipt_url),
    paid_at: invoice.paid_at || null,
    next_payment_attempt: invoice.next_payment_attempt || null,
  }));
  return {
    tenant_id: state.tenant_id || DEFAULT_TENANT_ID,
    provider_id: state.provider_id || DEFAULT_PROVIDER_ID,
    invoice_count: invoices.length,
    invoices,
    secrets_included: false,
  };
}

function aggregateProviderRevenue(state = {}) {
  const revenue = state.provider_revenue || {};
  return {
    tenant_id: state.tenant_id || revenue.tenant_id || DEFAULT_TENANT_ID,
    provider_id: state.provider_id || revenue.provider_id || DEFAULT_PROVIDER_ID,
    currency: revenue.currency || 'USD',
    gross_collected_cents: revenue.gross_collected_cents || 0,
    failed_cents: revenue.failed_cents || 0,
    refunded_cents: revenue.refunded_cents || 0,
    pending_cents: revenue.pending_cents || 0,
    net_collected_cents: (revenue.gross_collected_cents || 0) - (revenue.refunded_cents || 0),
    invoice_count: revenue.invoice_count || 0,
    successful_renewal_count: revenue.successful_renewal_count || 0,
    scope: 'tenant_provider',
    secrets_included: false,
  };
}

function verifyStripeWebhookSignature({
  rawBody,
  signature,
  webhookSecret,
  stripeClient,
  tolerance,
} = {}) {
  const secret = String(webhookSecret || '').trim();
  if (!secret) {
    throw new BillingLifecycleError('Stripe webhook secret is not configured.', {
      code: 'stripe_webhook_secret_missing',
      statusCode: 409,
    });
  }
  if (!signature) {
    throw new BillingLifecycleError('Stripe signature header is missing.', {
      code: 'stripe_signature_missing',
      statusCode: 400,
    });
  }
  if (!stripeClient?.webhooks?.constructEvent) {
    throw new BillingLifecycleError('Stripe webhook verifier is unavailable.', {
      code: 'stripe_webhook_verifier_unavailable',
      statusCode: 503,
    });
  }
  try {
    const event = stripeClient.webhooks.constructEvent(rawBody, signature, secret, tolerance);
    return {
      verified: true,
      event,
      event_id: event?.id || null,
      event_type: event?.type || null,
      secrets_included: false,
    };
  } catch (error) {
    throw new BillingLifecycleError(`Stripe webhook signature verification failed: ${redactStripeSecrets(error.message, [secret])}`, {
      code: 'stripe_webhook_signature_invalid',
      statusCode: 400,
    });
  }
}

function buildSyntheticStripeEvent({
  id,
  type,
  object = {},
  account = 'acct_test_synthetic',
  tenantId = DEFAULT_TENANT_ID,
  providerId = DEFAULT_PROVIDER_ID,
} = {}) {
  const objectWithMetadata = {
    ...object,
    metadata: {
      tenant_id: tenantId,
      provider_id: providerId,
      ...(object.metadata || {}),
    },
  };
  return {
    id: id || `evt_test_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
    object: 'event',
    account,
    livemode: false,
    type,
    data: { object: objectWithMetadata },
  };
}

function buildLifecycleFinalAudit(state = {}) {
  const entitlements = Object.values(state.entitlements || {});
  const latestEntitlement = entitlements[entitlements.length - 1] || null;
  return {
    tenant_id: state.tenant_id || DEFAULT_TENANT_ID,
    provider_id: state.provider_id || DEFAULT_PROVIDER_ID,
    mode_state: state.mode_state || 'not_configured',
    states: {
      pricing: Boolean(state.policy?.price),
      trial: entitlements.some((entry) => entry.entitlement_state === 'trial' || entry.trial_ends_at),
      checkout: Object.keys(state.checkout_sessions || {}).length > 0,
      payment_method: Object.keys(state.payment_methods || {}).length > 0,
      successful_payment: Object.values(state.invoices || {}).some((invoice) => invoice.state === 'paid')
        || entitlements.some((entry) => entry.reason === 'checkout_paid'),
      failed_payment: Object.values(state.invoices || {}).some((invoice) => invoice.state === 'payment_failed'),
      retry: entitlements.some((entry) => /retry|required|grace/i.test(`${entry.reason || ''} ${entry.retry_state || ''}`))
        || Object.values(state.invoices || {}).some((invoice) => invoice.state === 'payment_failed' && Boolean(invoice.next_payment_attempt)),
      renewal: state.provider_revenue?.successful_renewal_count > 0
        || Object.values(state.invoices || {}).some((invoice) => invoice.state === 'renewal_pending'),
      cancellation: entitlements.some((entry) => ['scheduled_cancellation', 'revoked'].includes(entry.entitlement_state)),
      entitlement: entitlements.length > 0,
      invoice_receipt: Object.keys(state.invoices || {}).length > 0,
      member_billing: Object.keys(state.members || {}).length > 0,
      provider_revenue: Boolean(state.provider_revenue),
      test_live_mode: STRIPE_CONFIG_STATES.includes(state.mode_state),
    },
    latest_entitlement: latestEntitlement,
    revenue: aggregateProviderRevenue(state),
    invoice_receipts: buildInvoiceReceiptReadModel(state),
    audit_event_count: (state.audit_events || []).length,
    secrets_included: false,
  };
}

module.exports = {
  BillingLifecycleError,
  DEFAULT_PROVIDER_ID,
  DEFAULT_TENANT_ID,
  POLICY_GAPS,
  PROVISIONAL_TEST_POLICY,
  STRIPE_CONFIG_STATES,
  aggregateProviderRevenue,
  applyStripeBillingEvent,
  assertAllowedConfigState,
  assertBrowserSafeStripePayload,
  buildCheckoutSessionPayload,
  buildInvoiceReceiptReadModel,
  buildLifecycleFinalAudit,
  buildProductPriceMap,
  buildSafeBillingPreview,
  buildSyntheticStripeEvent,
  createInitialBillingState,
  createStripeCheckoutSession,
  detectStripeKeyMode,
  eventIdempotencyKey,
  getStripeClientWrapper,
  redactStripeSecrets,
  resolveBillingPolicy,
  resolveStripeBillingConfig,
  safeConfigView,
  sanitizeStripeId,
  verifyStripeWebhookSignature,
};
