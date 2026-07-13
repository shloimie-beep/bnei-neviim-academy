const DEFAULT_CAMPAIGN = Object.freeze({
  key: 'rosh_hashanah_5787_promo',
  offer_key: 'one-time-rosh-hashanah-5787-promo',
  headline: 'Rosh Hashanah special: free promotional access until Friday, September 11, 2026',
  time_zone: 'Asia/Jerusalem',
  free_access_until_date: '2026-09-11',
  free_access_until_label: 'Friday, September 11, 2026 (Israel time)',
  post_promo_price_label: '$67/month afterward',
  monthly_price_amount: 67,
  currency: 'USD',
  billing_interval: 'month',
  payment_cutoff_at: '2026-09-11T23:59:59+03:00',
  payment_cutoff_basis: 'Israel calendar-date fallback from the approved Rosh Hashanah 5787 campaign date; no sunset time is invented.',
});

function stringValue(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function booleanValue(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes'].includes(String(value).trim().toLowerCase());
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateKeyInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day}`;
}

function dateKeyToNumber(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
  if (!match) return NaN;
  return Number(`${match[1]}${match[2]}${match[3]}`);
}

function daysUntilDateInTimeZone(now, targetDate, timeZone) {
  const current = dateKeyToNumber(dateKeyInTimeZone(now, timeZone));
  const target = dateKeyToNumber(targetDate);
  if (!Number.isFinite(current) || !Number.isFinite(target)) return null;

  const currentDate = Date.UTC(
    Math.floor(current / 10000),
    Math.floor((current % 10000) / 100) - 1,
    current % 100
  );
  const targetDateUtc = Date.UTC(
    Math.floor(target / 10000),
    Math.floor((target % 10000) / 100) - 1,
    target % 100
  );
  return Math.max(0, Math.ceil((targetDateUtc - currentDate) / 86400000));
}

function buildOneTimeCampaignConfig(siteConfig = {}, options = {}) {
  const env = options.env || process.env;
  const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
  const campaign = {
    ...DEFAULT_CAMPAIGN,
    ...((siteConfig && siteConfig.campaign) || {}),
  };

  const timeZone = stringValue(env.ONE_TIME_CAMPAIGN_TIME_ZONE, campaign.time_zone);
  const freeAccessUntilDate = stringValue(env.ONE_TIME_CAMPAIGN_FREE_ACCESS_UNTIL_DATE, campaign.free_access_until_date);
  const cutoffAt = stringValue(
    env.ONE_TIME_CAMPAIGN_CUTOFF_AT || env.ONE_TIME_CAMPAIGN_DEADLINE_AT,
    campaign.payment_cutoff_at
  );
  const startAt = stringValue(env.ONE_TIME_CAMPAIGN_START_AT, campaign.start_at || '');
  const offerKey = stringValue(env.ONE_TIME_CAMPAIGN_OFFER_KEY, campaign.offer_key);
  const cutoffMs = Date.parse(cutoffAt);
  const startMs = startAt ? Date.parse(startAt) : NaN;
  const cutoffConfigured = Number.isFinite(cutoffMs);
  const startConfigured = Number.isFinite(startMs);
  const nowMs = now.getTime();
  const active = cutoffConfigured && (!startConfigured || nowMs >= startMs) && nowMs <= cutoffMs;
  const expired = cutoffConfigured && nowMs > cutoffMs;

  return {
    campaign_key: stringValue(campaign.key, DEFAULT_CAMPAIGN.key),
    offer_key: offerKey,
    headline: stringValue(campaign.headline, DEFAULT_CAMPAIGN.headline),
    free_access_until_date: freeAccessUntilDate,
    free_access_until_label: stringValue(campaign.free_access_until_label, DEFAULT_CAMPAIGN.free_access_until_label),
    post_promo_price_label: stringValue(campaign.post_promo_price_label, DEFAULT_CAMPAIGN.post_promo_price_label),
    monthly_price_amount: numberValue(campaign.monthly_price_amount, DEFAULT_CAMPAIGN.monthly_price_amount),
    currency: stringValue(campaign.currency, DEFAULT_CAMPAIGN.currency),
    billing_interval: stringValue(campaign.billing_interval, DEFAULT_CAMPAIGN.billing_interval),
    start_at: startConfigured ? new Date(startMs).toISOString() : '',
    cutoff_at: cutoffConfigured ? cutoffAt : '',
    cutoff_at_utc: cutoffConfigured ? new Date(cutoffMs).toISOString() : '',
    deadline_at: cutoffConfigured ? cutoffAt : '',
    deadline_at_utc: cutoffConfigured ? new Date(cutoffMs).toISOString() : '',
    payment_cutoff_basis: stringValue(campaign.payment_cutoff_basis, DEFAULT_CAMPAIGN.payment_cutoff_basis),
    time_zone: timeZone,
    server_now: now.toISOString(),
    deadline_configured: cutoffConfigured,
    deadline_timestamp_configured: cutoffConfigured,
    start_configured: startConfigured,
    active,
    expired,
    days_until_deadline: daysUntilDateInTimeZone(now, freeAccessUntilDate, timeZone),
    status: cutoffConfigured ? (expired ? 'expired' : active ? 'active' : 'scheduled') : 'needs_operator_decision',
    stripe_trial_object: booleanValue(campaign.stripe_trial_object, false),
    hidden_trial: booleanValue(campaign.hidden_trial, false),
    trial_days: 0,
    card_required_for_promotional_signup: booleanValue(campaign.card_required_for_promotional_signup, false),
    paid_service_requires_active_choice: booleanValue(campaign.paid_service_requires_active_choice, true),
    surprise_subscription: booleanValue(campaign.surprise_subscription, false),
    tax_inclusive: booleanValue(campaign.tax_inclusive, false),
    automatic_refunds: booleanValue(campaign.automatic_refunds, false),
    grace_period: booleanValue(campaign.grace_period, false),
    public_signup_no_card_today: true,
    no_live_charge_performed: true,
    editable_by: 'platform_super_admin',
    audit_required_for_changes: true,
    decision: null,
    external_write_performed: false,
    secrets_included: false,
  };
}

module.exports = {
  buildOneTimeCampaignConfig,
  daysUntilDateInTimeZone,
};
