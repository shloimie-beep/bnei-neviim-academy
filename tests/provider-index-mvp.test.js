const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const migration = fs.readFileSync(path.join(repoRoot, 'railway-migration-2026-06-15-provider-index-mvp.sql'), 'utf8');
const operations = fs.readFileSync(path.join(repoRoot, 'public', 'operations.html'), 'utf8');
const join = fs.readFileSync(path.join(repoRoot, 'public', 'providers-join.html'), 'utf8');
const directory = fs.readFileSync(path.join(repoRoot, 'public', 'service-providers.html'), 'utf8');
const profile = fs.readFileSync(path.join(repoRoot, 'public', 'provider-profile.html'), 'utf8');
const telegram = fs.readFileSync(path.join(repoRoot, 'scripts', 'telegram-kimi-bridge.mjs'), 'utf8');
const {
  PROVIDER_CATEGORY_SEEDS,
  normalizeCategorySlugs,
  normalizeProviderLanguages,
  normalizeProviderSignupPayload,
  providerCompleteness,
  providerMatchesPublicFilters,
  slugifyProviderName,
} = require('../src/lib/bna/provider-index');

test('provider index helper normalizes slugs, categories, languages, signup payloads, and completeness', () => {
  assert.equal(slugifyProviderName('Rabbi Cohen Math & Gemara!'), 'rabbi-cohen-math-and-gemara');
  assert.deepEqual(normalizeCategorySlugs(['Torah', 'tutoring', 'Rabbi']), ['rabbeim-shiurim', 'tutoring']);
  assert.deepEqual(normalizeProviderLanguages('english, Hebrew\nenglish'), ['English', 'Hebrew']);
  const payload = normalizeProviderSignupPayload({
    provider_name: 'Cohen Tutoring',
    email: 'TEST@EXAMPLE.COM',
    category: 'tutoring',
    language: 'english',
    location: 'Beit Shemesh',
    description: 'Warm math tutoring',
    services_offered: 'Free intro math class',
  });
  assert.equal(payload.email, 'test@example.com');
  assert.equal(payload.categories[0], 'tutoring');
  assert.equal(payload.offerings[0].title, 'tutoring');
  const completeness = providerCompleteness(payload, [{ slug: 'tutoring' }], payload.offerings, []);
  assert.equal(completeness.score, 100);
});

test('provider index migration creates MVP tables, seed upserts, and approval-only status compatibility', () => {
  for (const table of [
    'bna_provider_categories',
    'bna_provider_category_map',
    'bna_provider_images',
    'bna_provider_offerings',
    'bna_provider_leads',
    'bna_provider_upgrade_events',
  ]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  for (const category of PROVIDER_CATEGORY_SEEDS) {
    assert.match(migration, new RegExp(category.slug));
  }
  assert.match(migration, /CHECK \(status IN \('draft', 'pending', 'pending_review', 'approved', 'hidden', 'paused', 'rejected', 'archived'\)\)/);
  assert.match(migration, /idx_bna_service_providers_slug_unique/);
  assert.match(migration, /idx_bna_service_providers_languages_gin/);
});

test('provider index server routes require pending signup and public approved-only visibility', () => {
  assert.match(server, /const createProviderIndexMvpSQL = fs\.readFileSync/);
  assert.match(server, /await pool\.query\(createProviderIndexMvpSQL\)/);
  assert.match(server, /async function ensureUniqueProviderSlug/);
  assert.match(server, /slug = `\$\{base\}-\$\{suffix\}`/);
  assert.match(server, /app\.post\('\/api\/provider-signup'/);
  assert.match(server, /status: 'pending'/);
  assert.match(server, /app\.get\('\/api\/provider-categories'/);
  assert.match(server, /app\.get\('\/api\/providers'/);
  assert.match(server, /approvedOnly: true/);
  assert.match(server, /app\.post\('\/api\/providers\/:id\/questions'/);
  assert.match(server, /INSERT INTO bna_provider_leads/);
  assert.match(server, /bna_provider_upgrade_events/);
  assert.match(server, /PROVIDER_UPGRADE_URL/);
  assert.doesNotMatch(server, /auto_approved: true/);
});

test('public provider filtering excludes pending and hidden providers', () => {
  const approved = { status: 'approved', public_listing_enabled: true, categories: [{ slug: 'tutoring' }], languages: ['English'], display_name: 'Cohen Tutoring' };
  assert.equal(providerMatchesPublicFilters(approved, { category: 'tutoring', language: 'english', q: 'cohen' }), true);
  assert.equal(providerMatchesPublicFilters({ ...approved, status: 'pending' }, {}), false);
  assert.equal(providerMatchesPublicFilters({ ...approved, status: 'hidden' }, {}), false);
  assert.equal(providerMatchesPublicFilters({ ...approved, public_listing_enabled: false }, {}), false);
});

test('public pages expose signup, directory, category, profile, SEO, leads, and upgrade interest UX', () => {
  assert.match(join, /\/api\/provider-signup/);
  assert.match(join, /BNA will review/);
  assert.match(join, /No checkout or provider login is required/);
  assert.match(directory, /\/api\/provider-categories/);
  assert.match(directory, /\/api\/providers/);
  assert.match(directory, /\/providers\/category\//);
  assert.match(directory, /Free offering/);
  assert.match(profile, /providerJsonLd/);
  assert.match(profile, /\/upgrade-interest/);
  assert.match(profile, /\/questions/);
  assert.match(profile, /Basic listing stays free/);
});

test('public provider pages share BNA site navigation, public helper, and current brand palette', () => {
  for (const html of [join, directory, profile]) {
    assert.match(html, /\/css\/bna-site-nav\.css/);
    assert.match(html, /data-bna-site-nav/);
    assert.match(html, /\/js\/bna-site-nav\.js/);
    assert.match(html, /\/js\/bna-helper-knowledge\.js/);
    assert.match(html, /\/js\/bna-bot-widget\.js/);
  }
  assert.doesNotMatch([join, directory, profile].join('\n'), /--primary-blue:\s*#111111|background:\s*#111\b/);
});

test('Operations and Telegram expose provider admin/review workflow without auto-publish', () => {
  for (const method of ['getProviders', 'getProvider', 'updateProvider', 'approveProvider', 'hideProvider', 'featureProvider', 'getProviderCategories', 'createProviderCategory', 'updateProviderCategory', 'getProviderLeads', 'updateProviderLead']) {
    assert.match(operations, new RegExp(method));
  }
  assert.match(operations, /data-provider-index-admin/);
  assert.match(operations, /approveProviderIndexProvider/);
  assert.match(operations, /updateProviderLeadStatus/);
  assert.match(telegram, /\/provider_onboard/);
  assert.match(telegram, /handleProviderOnboardingTelegramCommand/);
  assert.match(telegram, /admin approval required before public listing/);
});
