const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  RABBI_PROJECT_KEY,
  RABBI_TIER_DEFINITIONS,
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
  RABBI_DEFAULT_TITLE,
  RABBI_PAGE_KEY,
  defaultRabbiLandingContent,
  normalizeRabbiLandingContent,
  publicReplacementAllowed,
  rabbiPageView,
} = require('../src/lib/bna/rabbi-site');
const {
  buildOneTimePaymentAccessClassLinkConfiguration,
} = require('../src/lib/bna/one-time-product-system');

const server = fs.readFileSync('server.js', 'utf8');
const migration = fs.readFileSync('railway-migration-2026-06-15-rabbi-checkout-access.sql', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const publicRabbiHtml = fs.readFileSync('public/rabbi.html', 'utf8');
const oneTimeLandingHtml = fs.readFileSync('public/one-time/index.html', 'utf8');
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
  assert.equal(RABBI_TIER_DEFINITIONS.library_only.price_amount_cents, 6700);
  assert.equal(RABBI_TIER_DEFINITIONS.live_library.price_amount_cents, 14900);
  assert.equal(tierPublicView({ tier_key: 'library_only' }).price_amount_cents, 6700);
  assert.equal(tierPublicView({ tier_key: 'live_library' }).price_amount_cents, 14900);

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
  assert.equal(rabbiPageView({}).title, RABBI_DEFAULT_TITLE);
  assert.equal(defaultRabbiLandingContent().hero_title, 'One Time');
  assert.equal(
    normalizeRabbiLandingContent({ hero_title: 'One Time Mishnayos' }).hero_title,
    'One Time',
  );
  assert.equal(
    rabbiPageView({ title: 'One Time Mishnayos Preview', content: { hero_title: 'One Time Mishnayos' } }).content.hero_title,
    'One Time',
  );
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
  assert.match(migration, /SELECT id, 'library_only'.*6700.*ARRAY\['library'\]/s);
  assert.match(migration, /SELECT id, 'live_library'.*14900.*ARRAY\['library','live'\]/s);
  assert.match(migration, /payment_link_status/);
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
    "app.get('/api/rabbi/member/support-tickets'",
    "app.post('/api/rabbi/member/support-tickets'",
    "app.get('/api/rabbi/member/support-tickets/:id'",
    "app.get('/api/rabbi/member/questions'",
    "app.post('/api/rabbi/member/questions'",
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

test('public Rabbi aliases serve the focused One Time landing instead of the legacy BNA preview page', () => {
  assert.match(server, /app\.get\(\['\/rabbi\.html'\], sendOneTimePublicLanding\)/);
  assert.match(server, /app\.get\(\['\/rabbi', '\/rabbi-preview', '\/one-time-mishnayos'\], sendOneTimePublicLanding\)/);
  const rootHandler = server.match(/app\.get\(\['\/', '\/index\.html', '\/public', '\/public\/'\][\s\S]*?\n\}\);/);
  assert.ok(rootHandler, 'missing explicit One Time single-tenant root handler');
  assert.match(rootHandler[0], /sendOneTimePublicLanding/);
  assert.doesNotMatch(rootHandler[0], /rabbi\.html/);
  assert.doesNotMatch(server, /app\.get\(\s*'\/'[\s\S]*rabbi\.html/);
  assert.match(server, /defaults\.price_amount_cents/);

  assert.match(oneTimeLandingHtml, /Your Child Can Love Learning Mishnayos/);
  assert.match(oneTimeLandingHtml, /data-one-time-workspace="rabbi_sheller_provider"/);
  assert.match(oneTimeLandingHtml, /data-one-time-project="one_time_mishnah_class"/);
  assert.doesNotMatch(oneTimeLandingHtml, /Preview mode only\. The BNA homepage is not replaced\./);

  // The old preview artifact can remain for historical tests, but public Rabbi routes must not serve it.
  assert.match(publicRabbiHtml, /Preview mode only\. The BNA homepage is not replaced\./);
  assert.match(publicRabbiHtml, /One Time - Rabbi Eli Scheller/);
  assert.match(publicRabbiHtml, /--yellow: #ffd400/);
  assert.match(publicRabbiHtml, /The public prices stay at \$67 and \$149/);
  assert.match(publicRabbiHtml, /Payment setup/);
  assert.match(publicRabbiHtml, /\/js\/rabbi-launch\.js/);
  assert.match(publicRabbiJs, /\/api\/rabbi\/tiers/);
  assert.match(publicRabbiJs, /\/api\/rabbi\/checkout/);
  assert.match(publicRabbiJs, /Payment setup blocked: add a Stripe or Green Invoice link in Operations/);
  assert.match(publicRabbiJs, /stripeReady/);
  assert.match(publicRabbiJs, /greenReady/);
  assert.match(publicRabbiMemberHtml, /Library and live class access are shown only when an active grant exists\./);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/request-login/);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/library/);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/live-sessions/);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/questions/);
  assert.match(publicRabbiMemberJs, /\/api\/rabbi\/member\/support-tickets/);
  assert.match(publicRabbiMemberHtml, /id="questionForm"/);
  assert.match(publicRabbiMemberHtml, /id="supportForm"/);
  assert.match(publicRabbiMemberHtml, /Private Questions/);
  assert.match(publicRabbiMemberHtml, /Open a Ticket/);
  assert.match(publicRabbiMemberJs, /Secure Join Class is relationship-scoped/);
  assert.match(publicRabbiMemberJs, /host\/start URLs are never exposed/);
  assert.doesNotMatch(publicRabbiMemberJs, /session\.zoom_url/);

  assert.match(operationsHtml, /Billing & Payments/);
  assert.match(operationsHtml, /Checkout disabled/i);
  assert.match(operationsHtml, /function renderRabbiLaunchPanel/);
  assert.match(operationsHtml, /one_time_mishnah_class/);
  assert.match(operationsHtml, /loadRabbiLaunchData/);
  assert.match(operationsHtml, /needsRabbiLaunchData/);
  assert.match(operationsHtml, /APPROVE_RABBI_PUBLIC_REPLACEMENT_PREVIEW/);
  assert.match(operationsHtml, /Create Test Member \/ Grant/);
});

test('One Time payment-to-access and class-link readiness stays test-mode and protects Zoom links', () => {
  const readiness = buildOneTimePaymentAccessClassLinkConfiguration({
    checkouts: [
      { id: 1, member_id: 2, tier_key: 'live_library', provider: 'stripe', provider_mode: 'test', status: 'paid', amount_cents: 6700 },
      { id: 2, member_id: 3, tier_key: 'library_only', provider: 'stripe', provider_mode: 'live', status: 'paid', amount_cents: 6700 },
    ],
    accessGrants: [
      { id: 7, member_id: 2, checkout_record_id: 1, tier_key: 'live_library', scopes: ['library', 'live'], status: 'active', source: 'approved_local_test_event' },
    ],
    liveSessions: [
      { id: 10, title: 'Mishnah live', required_scope: 'live', status: 'scheduled', zoom_url: 'https://zoom.us/j/123' },
    ],
  });

  assert.equal(readiness.requirement_id, 'REQ-20260621-907');
  assert.equal(readiness.payment_state.live_charges_enabled, false);
  assert.equal(readiness.payment_state.test_paid_checkout_count, 1);
  assert.equal(readiness.access_gate.approved_local_test_event_required, true);
  assert.equal(readiness.access_gate.automated_access_grants_enabled, false);
  assert.equal(readiness.class_link_scope.relationship_scope, 'member_session_and_active_live_grant');
  assert.equal(readiness.class_link_scope.raw_zoom_join_url_returned_to_members, false);
  assert.equal(readiness.class_link_scope.zoom_host_start_url_returned, false);
  assert.equal(readiness.records.class_link_sessions[0].raw_join_url_present_for_admin_setup, true);
  assert.equal(readiness.records.class_link_sessions[0].raw_zoom_join_url_returned_to_member, false);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/payment-access-class-links'/);
  assert.match(operationsHtml, /data-one-time-payment-access-class-links/);
  assert.match(operationsHtml, /REQ-20260621-907/);
  assert.match(operationsHtml, /Payment state does not create live charges/);
  assert.match(operationsHtml, /Reveal Join Link/);
});
