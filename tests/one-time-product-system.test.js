const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  ONE_TIME_PRODUCT_PROGRAM_KEY,
  ONE_TIME_CONTENT_ALIAS,
  ONE_TIME_PRODUCT_TIER_KEYS,
  calendarRangeForView,
  normalizeCandidatePricing,
  normalizeOneTimeRegion,
  normalizeOneTimeTierKey,
  validateOneTimeLead,
  fixtureSefariaLookup,
  buildSourcePrepDraft,
} = require('../src/lib/bna/one-time-product-system');

const {
  RABBI_TIER_KEYS,
  normalizeRabbiTierKey,
  accessScopesForTier,
  tierPublicView,
} = require('../src/lib/bna/rabbi-products');

const server = fs.readFileSync('server.js', 'utf8');
const checkoutMigration = fs.readFileSync('railway-migration-2026-06-15-rabbi-checkout-access.sql', 'utf8');
const productMigration = fs.readFileSync('railway-migration-2026-06-16-one-time-product-system.sql', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const oneTimeHtml = fs.readFileSync('public/one-time/index.html', 'utf8');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('OneTime product helper normalizes tiers, regions, leads, calendar views, and source prep safely', () => {
  assert.equal(ONE_TIME_PRODUCT_PROGRAM_KEY, 'one_time_mishnah_class');
  assert.equal(ONE_TIME_CONTENT_ALIAS, 'mishna');
  assert.equal(normalizeOneTimeRegion('United States'), 'us');
  assert.equal(normalizeOneTimeRegion('Eretz Yisrael'), 'israel');
  assert.equal(normalizeOneTimeTierKey('VIP'), ONE_TIME_PRODUCT_TIER_KEYS.VIP_HIGH_TOUCH);
  assert.equal(normalizeOneTimeTierKey('interactive live'), ONE_TIME_PRODUCT_TIER_KEYS.INTERACTIVE_ZOOM);

  const lowTouchPricing = normalizeCandidatePricing('library_live_low_touch');
  assert.deepEqual(lowTouchPricing.candidates, [50, 67, 100, 149]);
  assert.equal(lowTouchPricing.preferred, 50);
  assert.equal(lowTouchPricing.status, 'decision_pending');

  assert.throws(() => validateOneTimeLead({ parent_name: 'No Contact' }), /Email, phone, or WhatsApp is required/);
  const lead = validateOneTimeLead({
    parent_name: 'Parent',
    email: 'PARENT@EXAMPLE.COM',
    region: 'UK',
    interested_tiers: ['vip', 'interactive'],
    source_landing_page: '/one-time/uk',
  });
  assert.equal(lead.region, 'uk');
  assert.equal(lead.email, 'parent@example.com');
  assert.deepEqual(lead.interested_tiers, ['vip_high_touch', 'interactive_zoom']);
  assert.equal(lead.no_send, true);
  assert.equal(lead.external_write_performed, false);

  const week = calendarRangeForView('week', new Date('2026-06-16T12:00:00Z'));
  assert.equal(week.view, 'week');
  assert.match(week.start, /^2026-06-14T00:00:00/);
  assert.match(week.end, /^2026-06-21T00:00:00/);

  const sources = fixtureSefariaLookup(['Mishnah Berakhot 1:1']);
  assert.equal(sources[0].source, 'fixture');
  assert.equal(sources[0].external_lookup_performed, false);
  const draft = buildSourcePrepDraft({
    title: 'Class 1',
    requested_refs: ['Mishnah Berakhot 1:1'],
    natural_language_prompt: 'Prepare class materials',
  });
  assert.equal(draft.external_write_performed, false);
  assert.equal(draft.visibility, 'admin_only');
  assert.equal(draft.approval_status, 'needs_review');
  assert.equal(draft.source_sheet_draft.refs.length, 1);
});

test('Rabbi tier helper preserves existing tiers and accepts draft OneTime planning tiers', () => {
  assert.equal(normalizeRabbiTierKey('Live Plus Library'), RABBI_TIER_KEYS.LIVE_LIBRARY);
  assert.equal(normalizeRabbiTierKey('interactive zoom'), RABBI_TIER_KEYS.INTERACTIVE_ZOOM);
  assert.equal(normalizeRabbiTierKey('vip high touch'), RABBI_TIER_KEYS.VIP_HIGH_TOUCH);
  assert.deepEqual(accessScopesForTier('library_only'), ['library']);
  assert.deepEqual(accessScopesForTier('interactive_zoom'), ['library', 'live']);

  const tier = tierPublicView({
    tier_key: 'interactive_zoom',
    display_name: 'Interactive Zoom',
    metadata: {
      price_status: 'decision_pending',
      candidate_prices: [149, 150],
      preferred_candidate_price: 149,
      public_publish_status: 'draft',
    },
  });
  assert.equal(tier.price_status, 'decision_pending');
  assert.deepEqual(tier.candidate_prices, [149, 150]);
  assert.equal(tier.preferred_candidate_price, 149);
  assert.equal(tier.checkout_enabled, false);
});

test('SQL migrations create OneTime product system without final pricing or external writes', () => {
  [
    'bna_product_programs',
    'bna_product_funnels',
    'bna_product_decisions',
    'bna_product_leads',
    'bna_program_schedules',
    'bna_program_calendar_events',
    'bna_source_prep_jobs',
  ].forEach((table) => {
    assert.match(productMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });

  [
    'library_live_low_touch',
    'interactive_zoom',
    'vip_high_touch',
  ].forEach((tierKey) => {
    assert.match(checkoutMigration, new RegExp(escapeRegex(tierKey)));
    assert.match(productMigration, new RegExp(escapeRegex(tierKey)));
  });

  assert.match(checkoutMigration, /'draft', planning_tiers\.sort_order/);
  assert.match(checkoutMigration, /"price_status":"decision_pending"/);
  assert.match(productMigration, /'one_time_mishnah_class'/);
  assert.match(productMigration, /'mishna'/);
  assert.match(productMigration, /'\/one-time\/uk'/);
  assert.match(productMigration, /'tier_pricing'/);
  assert.match(productMigration, /TIME '19:00'/);
  assert.match(productMigration, /'Asia\/Jerusalem'/);
  assert.match(productMigration, /external_write_performed/);
  assert.match(productMigration, /no_send BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(productMigration, /external_write_performed BOOLEAN NOT NULL DEFAULT FALSE/);
});

test('server exposes scoped OneTime product APIs and public draft routes', () => {
  [
    "app.get('/api/bna/one-time/product-system'",
    "app.get(['/api/bna/product-leads', '/api/bna/one-time/product-leads']",
    "app.post(['/api/bna/product-leads', '/api/one-time/interest']",
    "app.get('/api/bna/one-time/calendar'",
    "app.get('/api/one-time/calendar'",
    "app.get('/api/bna/one-time/source-prep-jobs'",
    "app.post('/api/bna/one-time/source-prep-jobs'",
  ].forEach((route) => assert.match(server, new RegExp(escapeRegex(route))));

  assert.match(server, /createOneTimeProductSystemSQL/);
  assert.match(server, /railway-migration-2026-06-16-one-time-product-system\.sql/);
  assert.match(server, /isScopedOpsPathAllowed[\s\S]*\/api\/bna\/one-time\/product-system/);
  assert.match(server, /no_checkout: true/);
  assert.match(server, /no_access_granted: true/);
  assert.match(server, /external_write_performed: false/);
  assert.match(server, /app\.get\(\['\/one-time', '\/one-time\/us', '\/one-time\/uk', '\/one-time\/israel', '\/one-time\/interest', '\/one-time\/member-login'\]/);
});

test('public OneTime draft page is noindex, interest-only, and has no checkout call', () => {
  assert.match(oneTimeHtml, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(oneTimeHtml, /OneTime Mishnayos/);
  assert.match(oneTimeHtml, /Draft \/ noindex/);
  assert.match(oneTimeHtml, /Pricing pending/);
  assert.match(oneTimeHtml, /7:00 PM Israel/);
  assert.match(oneTimeHtml, /\/api\/one-time\/interest/);
  assert.match(oneTimeHtml, /No payment or external send is approved by this form/);
  assert.doesNotMatch(oneTimeHtml, /\/api\/rabbi\/checkout/);
  assert.doesNotMatch(oneTimeHtml, /Stripe checkout/i);
  assert.doesNotMatch(oneTimeHtml, /GreenInvoice checkout/i);
});

test('Operations provider workspace reads OneTime product system and labels pricing as pending', () => {
  [
    'getOneTimeProductSystem',
    'getOneTimeProductCalendar',
    'getOneTimeProductLeads',
    'createOneTimeSourcePrepJob',
    'renderOneTimeProductDecisionPanel',
    'renderOneTimeProductTiersPanel',
    'renderOneTimeFunnelPanel',
    'renderOneTimeLeadPanel',
    'createOneTimeSourcePrepFixture',
  ].forEach((needle) => assert.match(operationsHtml, new RegExp(needle)));

  assert.match(operationsHtml, /RABBI-04 is draft\/decision-ready only/);
  assert.match(operationsHtml, /Candidate prices are review data only/);
  assert.match(operationsHtml, /Checkout disabled/);
  assert.match(operationsHtml, /fixture source-prep draft/i);
  assert.doesNotMatch(operationsHtml, /price: '\$67\/month'/);
  assert.doesNotMatch(operationsHtml, /price: '\$149\/month'/);
});
