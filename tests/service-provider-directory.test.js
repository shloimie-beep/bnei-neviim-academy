const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const operations = fs.readFileSync(path.join(repoRoot, 'public', 'operations.html'), 'utf8');
const parent = fs.readFileSync(path.join(repoRoot, 'public', 'parent.html'), 'utf8');
const provider = fs.readFileSync(path.join(repoRoot, 'public', 'provider.html'), 'utf8');
const providerJoin = fs.readFileSync(path.join(repoRoot, 'public', 'providers-join.html'), 'utf8');
const serviceProviders = fs.readFileSync(path.join(repoRoot, 'public', 'service-providers.html'), 'utf8');

test('service-provider directory schema and guarded APIs are bootstrapped', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_service_providers/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_services/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_service_sessions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_rabbi_links/);
  assert.match(server, /app\.get\('\/api\/bna\/service-providers'/);
  assert.match(server, /app\.post\('\/api\/bna\/service-providers'/);
  assert.match(server, /app\.patch\('\/api\/bna\/service-providers\/:id'/);
});

test('provider directory seeds Rabbi Scheller class and blocks live billing by default', () => {
  assert.match(server, /7:00 Rabbi Scheller Mishnah class/);
  assert.match(server, /billing_guard: 'display_only_no_charges'/);
  assert.match(server, /No live billing or payout automation is enabled/);
  assert.match(server, /Discount eligibility is display-only/);
});

test('provider commercial model, entitlements, and pre-integration tables are bootstrapped', () => {
  for (const column of [
    'provider_status',
    'commercial_model',
    'entitlement_plan',
    'source_of_truth',
    'integration_status',
    'setup_package',
    'managed_services',
    'public_listing_enabled',
    'public_signup_enabled',
    'claim_listing_enabled',
  ]) {
    assert.match(server, new RegExp(column));
  }
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_entitlements/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_integrations/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_access_checklist/);
  assert.match(server, /PROVIDER_PLAN_DEFINITIONS/);
  assert.match(server, /provider_status TEXT NOT NULL DEFAULT 'draft'/);
  assert.match(server, /commercial_model TEXT NOT NULL DEFAULT 'free_listing'/);
  assert.match(server, /source_of_truth TEXT NOT NULL DEFAULT 'unknown_pending_access'/);
  assert.match(server, /integration_status TEXT NOT NULL DEFAULT 'no_access'/);
});

test('Rabbi Scheller is modeled as a revenue-share provider with external delivery pending access', () => {
  assert.match(server, /commercial_model: 'revenue_share'/);
  assert.match(server, /entitlement_plan: 'revenue_share_partner'/);
  assert.match(server, /provider_status = 'active_partner'/);
  assert.match(server, /source_of_truth = 'hybrid'/);
  assert.match(server, /access_requested/);
  assert.match(server, /Replit\/Vimeo app/);
  assert.match(server, /Mishnayos Membership - Video Library/);
  assert.match(server, /Mishnayos Membership - Live Membership/);
  assert.match(server, /price_amount,[\s\S]*?currency,[\s\S]*?billing_period/);
});

test('Rabbi provider checklist blocks login until contact and Drive/social setup are ready', () => {
  assert.match(server, /rabbi_contact_email/);
  assert.match(server, /Rabbi contact email/);
  assert.match(server, /rabbi_whatsapp_phone/);
  assert.match(server, /scoped_login_username/);
  assert.match(server, /login_release_guard/);
  assert.match(server, /one_time_drive_video_drop/);
  assert.match(server, /one_time_social_output_map/);
  assert.match(server, /Ask Rabbi Elie for the best email address in WhatsApp before sending any scoped login/);
  assert.match(server, /Release login only after Drive\/social ingestion is mapped/);
});

test('parent portal and Operations expose approved provider directory', () => {
  assert.match(server, /service_providers: serviceProviders/);
  assert.match(parent, /providerDirectory: 'Approved Providers'/);
  assert.match(parent, /renderProviderDirectory/);
  assert.match(parent, /providerFilters/);
  assert.match(parent, /providerRadiusBlocked/);
  assert.match(parent, /data-provider-filter="city"/);
  assert.match(parent, /data-provider-filter="capacity"/);
  assert.match(operations, /getServiceProviders/);
  assert.match(operations, /Approved Providers/);
  assert.match(operations, /renderServiceProviderDirectory/);
});

test('public parent/provider surfaces use sanitized provider records and safe CTA flow', () => {
  assert.match(server, /function publicServiceProviderView/);
  assert.match(server, /providerPublicCta/);
  assert.match(server, /public_listing_enabled !== false/);
  const publicViewBody = server.match(/function publicServiceProviderView[\s\S]*?\n}\n\nasync function ensureDefaultServiceProviderDirectory/)?.[0] || '';
  assert.doesNotMatch(publicViewBody, /commercial_notes/);
  assert.match(parent, /data-provider-cta/);
  assert.match(parent, /function openProviderRequest/);
  assert.match(parent, /providerRequestQueued/);
  assert.match(parent, /<option value="provider">/);
  assert.match(server, /return 'provider'/);
});

test('provider onboarding route and page create draft commercial records safely', () => {
  assert.match(server, /app\.post\('\/api\/provider-onboarding'/);
  assert.match(server, /app\.get\('\/providers\/join'/);
  assert.match(server, /provider_onboarding/);
  assert.match(server, /Review provider onboarding/);
  assert.match(server, /'unknown_pending_access', 'no_access'/);
  assert.match(server, /commercial_model: commercialModel/);
  assert.match(server, /serviceCategory/);
  assert.match(server, /agesServed/);
  assert.match(server, /public_future_plan_mentions_blocked/);
  assert.match(server, /cta_preference/);
  assert.match(server, /services_offered/);
  assert.match(server, /community_affiliation/);
  assert.match(server, /types_kids_served/);
  assert.match(server, /experience_background/);
  assert.match(server, /problems_solved/);
  assert.match(server, /discounts_group_options/);
  assert.match(server, /running_ads/);
  assert.match(server, /ai_max_interest: false/);
  assert.match(providerJoin, /Provider Network/);
  assert.match(providerJoin, /Free Listing/);
  assert.match(providerJoin, /This is a free listing application only/);
  assert.match(providerJoin, /Preferred CTA/);
  assert.match(providerJoin, /services_offered/);
  assert.match(providerJoin, /community_affiliation/);
  assert.match(providerJoin, /discounts_group_options/);
  assert.match(providerJoin, /\/api\/provider-onboarding/);
  assert.doesNotMatch(providerJoin, /Managed Setup|School Workspace|Partner|AI Max|Paid workspace|lead generation|marketing automation|No checkout yet/);
});

test('Operations exposes commercial settings, entitlements, access checklist, and audit pages', () => {
  assert.match(operations, /Commercial Model/);
  assert.match(operations, /Plans \/ Entitlements/);
  assert.match(operations, /Provider Plans/);
  assert.match(operations, /Provider Entitlements/);
  assert.match(operations, /Provider Onboarding/);
  assert.match(operations, /Commercial Models/);
  assert.match(operations, /Payment Links/);
  assert.match(operations, /External Apps/);
  assert.match(operations, /function renderProviderCommercialPanel/);
  assert.match(operations, /function renderProviderPlansPanel/);
  assert.match(operations, /function renderProviderOnboardingPanel/);
  assert.match(operations, /function renderProviderAccessChecklistPanel/);
  assert.match(operations, /function renderProviderIntegrationAuditPanel/);
  assert.match(operations, /async function updateProviderPlan/);
});

test('provider login is scoped and keeps edits in BNA review', () => {
  assert.match(server, /PROVIDER_SESSION_COOKIE_NAME/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_sessions/);
  assert.match(server, /password_hash/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/login'/);
  assert.match(server, /app\.get\('\/api\/provider-portal\/session', requireProviderSession/);
  assert.match(server, /app\.patch\('\/api\/provider-portal\/profile', requireProviderSession/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/services', requireProviderSession/);
  assert.match(server, /status = 'pending_review'/);
  assert.match(server, /No live billing, charge, payout, or admin-fee automation is enabled/);
  assert.match(provider, /BNA Provider Portal/);
  assert.match(provider, /Scoped Provider Workspace/);
  assert.match(provider, /\/api\/provider-portal\/login/);
  assert.match(provider, /\/api\/provider-portal\/services/);
  assert.match(provider, /function portalEntitlementEnabled/);
  assert.match(provider, /Commercial Model/);
  assert.match(provider, /Plan \/ Entitlements/);
  assert.match(provider, /External Apps \/ Integrations/);
  assert.match(provider, /Access Checklist/);
});

test('provider onboarding integrations foundation exposes intake, public index, and messages', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_onboarding_sessions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_intake_records/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_messages/);
  assert.match(server, /app\.get\('\/api\/service-providers'/);
  assert.match(server, /app\.post\('\/api\/provider-onboarding\/intake'/);
  assert.match(server, /app\.post\('\/api\/parent-portal\/provider-messages'/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/messages\/:id\/reply'/);
  assert.match(server, /google_business_profile_url/);
  assert.match(server, /google_place_id/);
  assert.match(serviceProviders, /\/api\/service-providers/);
  assert.match(serviceProviders, /Become a Service Provider/);
  assert.match(providerJoin, /raw_intake/);
  assert.match(providerJoin, /google_business_profile_url/);
  assert.match(parent, /\/api\/parent-portal\/provider-messages/);
  assert.match(parent, /provider_messages/);
  assert.match(provider, /providerMessages/);
  assert.match(provider, /\/api\/provider-portal\/messages\/\$\{encodeURIComponent/);
});
