const RABBI_PROJECT_KEY = 'one_time_mishnah_class';
const {
  ONE_TIME_PRODUCT_TIER_KEYS,
  ONE_TIME_PRODUCT_TIER_DEFINITIONS,
  normalizeCandidatePricing,
} = require('./one-time-product-system');

const RABBI_TIER_KEYS = Object.freeze({
  LIBRARY_ONLY: 'library_only',
  LIVE_LIBRARY: 'live_library',
  LIBRARY_LIVE_LOW_TOUCH: ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH,
  INTERACTIVE_ZOOM: ONE_TIME_PRODUCT_TIER_KEYS.INTERACTIVE_ZOOM,
  VIP_HIGH_TOUCH: ONE_TIME_PRODUCT_TIER_KEYS.VIP_HIGH_TOUCH,
});

const RABBI_TIER_KEY_VALUES = Object.freeze(Object.values(RABBI_TIER_KEYS));

const RABBI_TIER_DEFINITIONS = Object.freeze({
  library_only: {
    tier_key: RABBI_TIER_KEYS.LIBRARY_ONLY,
    display_name: 'Video Library',
    description: 'Recorded Mishnayos library access.',
    access_scopes: ['library'],
    sort_order: 10,
  },
  live_library: {
    tier_key: RABBI_TIER_KEYS.LIVE_LIBRARY,
    display_name: 'Live + Library',
    description: 'Live Zoom classes plus recorded Mishnayos library access.',
    access_scopes: ['library', 'live'],
    sort_order: 20,
  },
  library_live_low_touch: {
    ...ONE_TIME_PRODUCT_TIER_DEFINITIONS.library_live_low_touch,
    access_scopes: ['library', 'live'],
  },
  interactive_zoom: {
    ...ONE_TIME_PRODUCT_TIER_DEFINITIONS.interactive_zoom,
    access_scopes: ['library', 'live'],
  },
  vip_high_touch: {
    ...ONE_TIME_PRODUCT_TIER_DEFINITIONS.vip_high_touch,
    access_scopes: ['library', 'live'],
  },
});

const RABBI_TIER_STATUSES = Object.freeze(['draft', 'active', 'paused', 'archived']);

function normalizeRabbiTierKey(value, fallback = RABBI_TIER_KEYS.LIBRARY_ONLY) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (normalized === 'live_plus_library' || normalized === 'live_class') return RABBI_TIER_KEYS.LIVE_LIBRARY;
  if (['low_touch', 'library_live', 'library_plus_live', 'live_replay'].includes(normalized)) return RABBI_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH;
  if (['interactive', 'interactive_live', 'zoom'].includes(normalized)) return RABBI_TIER_KEYS.INTERACTIVE_ZOOM;
  if (['vip', 'high_touch'].includes(normalized)) return RABBI_TIER_KEYS.VIP_HIGH_TOUCH;
  return RABBI_TIER_KEY_VALUES.includes(normalized) ? normalized : fallback;
}

function isValidRabbiTierKey(value) {
  return RABBI_TIER_KEY_VALUES.includes(normalizeRabbiTierKey(value, ''));
}

function accessScopesForTier(value) {
  const tierKey = normalizeRabbiTierKey(value);
  return [...(RABBI_TIER_DEFINITIONS[tierKey]?.access_scopes || ['library'])];
}

function normalizeTierStatus(value, fallback = 'active') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return RABBI_TIER_STATUSES.includes(normalized) ? normalized : fallback;
}

function centsFromMajorAmount(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return Math.round(numeric * 100);
}

function tierPublicView(row = {}) {
  const tierKey = normalizeRabbiTierKey(row.tier_key);
  const scopes = Array.isArray(row.access_scopes) ? row.access_scopes : accessScopesForTier(tierKey);
  const metadata = row.metadata || {};
  const candidatePricing = normalizeCandidatePricing(tierKey);
  return {
    id: row.id ? Number(row.id) : null,
    tier_key: tierKey,
    display_name: row.display_name || RABBI_TIER_DEFINITIONS[tierKey]?.display_name || tierKey,
    description: row.description || RABBI_TIER_DEFINITIONS[tierKey]?.description || '',
    price_amount_cents: row.price_amount_cents === null || row.price_amount_cents === undefined
      ? null
      : Number(row.price_amount_cents),
    currency: row.currency || 'USD',
    billing_interval: row.billing_interval || 'month',
    access_scopes: scopes,
    status: normalizeTierStatus(row.status),
    sort_order: Number(row.sort_order || RABBI_TIER_DEFINITIONS[tierKey]?.sort_order || 0),
    price_status: metadata.price_status || RABBI_TIER_DEFINITIONS[tierKey]?.price_status || (candidatePricing.candidates.length ? 'decision_pending' : 'not_configured'),
    candidate_prices: Array.isArray(metadata.candidate_prices) ? metadata.candidate_prices : candidatePricing.candidates,
    preferred_candidate_price: metadata.preferred_candidate_price === undefined ? candidatePricing.preferred : metadata.preferred_candidate_price,
    public_publish_status: metadata.public_publish_status || metadata.launch_mode || (candidatePricing.candidates.length ? 'draft' : ''),
    checkout_enabled: Boolean(row.stripe_price_id || row.stripe_payment_link_url || row.green_invoice_item_id || row.green_invoice_payment_link_url),
    checkout: {
      stripe_price_id: row.stripe_price_id || '',
      stripe_payment_link_url: row.stripe_payment_link_url || '',
      green_invoice_item_id: row.green_invoice_item_id || '',
      green_invoice_payment_link_url: row.green_invoice_payment_link_url || '',
      stripe_price_configured: Boolean(row.stripe_price_id),
      green_invoice_item_configured: Boolean(row.green_invoice_item_id),
    },
    metadata,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

module.exports = {
  RABBI_PROJECT_KEY,
  RABBI_TIER_KEYS,
  RABBI_TIER_KEY_VALUES,
  RABBI_TIER_DEFINITIONS,
  RABBI_TIER_STATUSES,
  normalizeRabbiTierKey,
  isValidRabbiTierKey,
  accessScopesForTier,
  normalizeTierStatus,
  centsFromMajorAmount,
  tierPublicView,
};
