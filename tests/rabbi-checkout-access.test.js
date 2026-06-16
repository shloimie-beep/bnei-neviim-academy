const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  RABBI_PROJECT_KEY,
  RABBI_TIER_KEYS,
  accessScopesForTier,
  normalizeRabbiTierKey,
  tierPublicView,
} = require('../src/lib/bna/rabbi-products');
const {
  buildPaymentEventKey,
  greenInvoiceCheckoutStatus,
  providerBlocker,
  stripeCheckoutStatus,
} = require('../src/lib/bna/rabbi-payments');
const {
  activeGrantScopes,
  generateLoginToken,
  hashLoginToken,
  publicMemberView,
} = require('../src/lib/bna/rabbi-access');
const {
  RABBI_PAGE_KEY,
  publicReplacementAllowed,
  rabbiPageView,
} = require('../src/lib/bna/rabbi-site');

const server = fs.readFileSync('server.js', 'utf8');
const migration = fs.readFileSync('railway-migration-2026-06-15-rabbi-checkout-access.sql', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const publicRabbiHtml = fs.readFileSync('public/rabbi.html', 'utf8');
const publicRabbiMemberHtml = fs.readFileSync('public/rabbi-member.html', 'utf8');
const publicRabbiJs = fs.readFileSync('public/js/rabbi-launch.js', 'utf8');
const publicRabbiMemberJs = fs.readFileSync('public/js/rabbi-member.js', 'utf8');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('Rabbi product, payment, access, and page helpers use the One Time contract', () => {
  assert.equal(RABBI_PROJECT_KEY, 'one_time_mishnah_class');
  assert.equal(RABBI_PAGE_KEY, 'rabbi_landing');
  assert.equal(normalizeRabbiTierKey('Live Plus Library'), RABBI_TIER_KEYS.LIVE_LIBRARY);
  assert.deepEqual(accessScopesForTier('library_only'), ['library']);
  assert.deepEqual(accessScopesForTier('live_library'), ['library', 'live']);

  const tier = tierPublicView({
    tier_key: 'live_library',
    display_name: 'Live + Library',
    stripe_price_id: 'price_test_123',
    stripe_payment_link_url: 'https://buy.stripe.test/live',
    green_invoice_item_id: 'green_item_123',
    green_invoice_payment_link_url: 'https://green.test/live',
    access_scopes: ['library', 'live'],
  });
  assert.equal(tier.checkout.stripe_price_id, 'price_test_123');
  assert.equal(tier.checkout.green_invoice_item_id, 'green_item_123');
  assert.equal(tier.checkout.stripe_price_configured, true);
  assert.equal(tier.checkout.green_invoice_item_configured, true);

  assert.equal(stripeCheckoutStatus('checkout.session.completed', { payment_status: 'paid' }), 'paid');
  assert.equal(stripeCheckoutStatus('checkout.session.expired', {}), 'expired');
  assert.equal(greenInvoiceCheckoutStatus({ paymentStatus: 'approved' }), 'paid');
  assert.equal(greenInvoiceCheckoutStatus({ status: 'declined' }), 'failed');
  assert.equal(providerBlocker('greeninvoice'), 'green_invoice_not_configured');
  assert.equal(
    buildPaymentEventKey({ provider: 'green invoice', eventId: 'evt_1', checkoutId: 'co_1' }),
    'green_invoice:evt_1:co_1',
  );

  const token = generateLoginToken();
  assert.match(token, /^rabbi_[a-f0-9]{64}$/);
  assert.equal(hashLoginToken(token), hashLoginToken(token));
  const member = publicMemberView({ id: 4, display_name: 'Preview Member', email: 'member@example.com' }, [
    { status: 'active', scopes: ['library'] },
    { status: 'revoked', scopes: ['live'] },
  ]);
  assert.deepEqual(activeGrantScopes([{ status: 'active', scopes: ['library', 'live'] }]), ['library', 'live']);
  assert.equal(member.has_library_access, true);
  assert.equal(member.has_live_access, false);

  assert.equal(publicReplacementAllowed({ page: { status: 'approved', allow_public_replacement: true }, env: {} }), false);
  assert.equal(
    publicReplacementAllowed({
      page: { status: 'approved', allow_public_replacement: true },
      env: { RABBI_ALLOW_PUBLIC_REPLACEMENT: 'true' },
    }),
    true,
  );
  assert.equal(rabbiPageView({}).route_path, '/rabbi');
});

test('migration creates the Rabbi checkout, payment, access, login, content, and page tables', () => {
  [
    'bna_members',
    'bna_product_tiers',
    'bna_payment_provider_settings',
    'bna_checkout_records',
    'bna_payment_events',
    'bna_access_grants',
    'bna_member_login_tokens',
    'bna_library_items',
    'bna_live_sessions',
    'bna_project_public_pages',
  ].forEach((table) => {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });

  [
    'project_id',
    'member_id',
    'checkout_record_id',
    'access_grant_id',
    'template_key',
    'recipient_name',
  ].forEach((column) => {
    assert.match(migration, new RegExp(`ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS ${column}\\b`));
  });

  assert.match(migration, /project_key = 'one_time_mishnah_class'/);
  assert.match(migration, /SELECT id, 'library_only'.*ARRAY\['library'\]/s);
  assert.match(migration, /SELECT id, 'live_library'.*ARRAY\['library','live'\]/s);
  assert.match(migration, /\('stripe', 'test'\)/);
  assert.match(migration, /\('green_invoice', 'test'\)/);
  assert.match(migration, /SELECT id, 'rabbi_landing', '\/rabbi'.*'preview', FALSE/s);
  assert.match(migration, /public_replacement_blocked/);
});

test('server exposes scoped Rabbi admin, public, member, and webhook routes', () => {
  [
    "app.get('/api/bna/rabbi/config'",
    "app.patch('/api/bna/rabbi/config'",
    "app.get('/api/bna/rabbi/tiers'",
    "app.post('/api/bna/rabbi/tiers'",
    "app.patch('/api/bna/rabbi/tiers/:id'",
    "app.get('/api/bna/rabbi/provider-settings'",
    "app.patch('/api/bna/rabbi/provider-settings/:provider'",
    "app.get('/api/bna/rabbi/checkouts'",
    "app.post('/api/bna/rabbi/checkouts/manual'",
    "app.post('/api/bna/rabbi/checkouts/:id/mark-abandoned'",
    "app.get('/api/bna/rabbi/members'",
    "app.post('/api/bna/rabbi/members'",
    "app.get('/api/bna/rabbi/access-grants'",
    "app.post('/api/bna/rabbi/access-grants/manual'",
    "app.post('/api/bna/rabbi/access-grants/:id/revoke'",
    "app.get('/api/bna/rabbi/library-items'",
    "app.post('/api/bna/rabbi/library-items'",
    "app.get('/api/bna/rabbi/live-sessions'",
    "app.post('/api/bna/rabbi/live-sessions'",
    "app.get('/api/bna/rabbi/communications'",
    "app.post('/api/bna/rabbi/communications/send'",
    "app.get('/api/bna/rabbi/site'",
    "app.patch('/api/bna/rabbi/site'",
    "app.post('/api/bna/rabbi/site/approve-public-replacement'",
    "app.get('/api/rabbi/tiers'",
    "app.post('/api/rabbi/checkout'",
    "app.post('/api/rabbi/member/request-login'",
    "app.post('/api/rabbi/member/login'",
    "app.get('/api/rabbi/member/session'",
    "app.get('/api/rabbi/member/library'",
    "app.get('/api/rabbi/member/live-sessions'",
    "app.post('/api/webhooks/green-invoice/rabbi'",
  ].forEach((route) => assert.match(server, new RegExp(escapeRegex(route))));

  const stripeWebhookIndex = server.indexOf("app.post('/api/webhooks/stripe/rabbi', express.raw");
  const jsonMiddlewareIndex = server.indexOf('app.use(express.json');
  assert.ok(stripeWebhookIndex > -1, 'missing raw Stripe webhook route');
  assert.ok(jsonMiddlewareIndex > -1, 'missing JSON middleware');
  assert.ok(stripeWebhookIndex < jsonMiddlewareIndex, 'Stripe webhook must be mounted before express.json');
  assert.match(server, /stripe_not_configured/);
  assert.match(server, /tier\.stripe_price_id && process\.env\.RABBI_STRIPE_SECRET_KEY/);
  assert.match(server, /providerBlocker\('green_invoice'\)/);
  assert.match(server, /APPROVE_RABBI_PUBLIC_REPLACEMENT_PREVIEW/);
  assert.match(server, /RABBI_ALLOW_PUBLIC_REPLACEMENT/);
  assert.match(server, /start_at is required/);
  assert.match(server, /assertWorkspaceAccess\(req, 'rabbi_sheller_provider'\)/);
});

test('public preview pages and Operations launch panel keep Rabbi launch separate from the BNA homepage', () => {
  assert.match(server, /app\.get\(\['\/rabbi', '\/rabbi-preview', '\/one-time-mishnayos'\]/);
  assert.match(server, /res\.sendFile\(path\.join\(__dirname, 'public', 'rabbi\.html'\)\)/);
  assert.doesNotMatch(server, /app\.get\(\s*\['\/'[\s\S]*rabbi\.html/);
  assert.doesNotMatch(server, /app\.get\(\s*'\/'[\s\S]*rabbi\.html/);

  assert.match(publicRabbiHtml, /Preview mode only\. The BNA homepage is not replaced\./);
  assert.match(publicRabbiHtml, /\/js\/rabbi-launch\.js/);
  assert.match(publicRabbiJs, /\/api\/rabbi\/tiers/);
  assert.match(publicRabbiJs, /\/api\/rabbi\/checkout/);
  assert.match(publicRabbiMemberHtml, /Library and live class access are shown only when an active grant exists\./);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/request-login/);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/library/);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/live-sessions/);
  assert.doesNotMatch(publicRabbiMemberJs, /zoom_url.*state\.member\?\.has_live_access/s);

  assert.match(operationsHtml, /Launch \/ Checkout/);
  assert.match(operationsHtml, /function renderRabbiLaunchPanel/);
  assert.match(operationsHtml, /one_time_mishnah_class/);
  assert.match(operationsHtml, /loadRabbiLaunchData/);
  assert.match(operationsHtml, /needsRabbiLaunchData/);
  assert.match(operationsHtml, /APPROVE_RABBI_PUBLIC_REPLACEMENT_PREVIEW/);
  assert.match(operationsHtml, /Create Test Member \/ Grant/);
});
