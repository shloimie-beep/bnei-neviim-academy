const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  ONE_TIME_PRODUCT_PROGRAM_KEY,
  ONE_TIME_CONTENT_ALIAS,
  ONE_TIME_PRODUCT_TIER_KEYS,
  ONE_TIME_PRODUCT_READINESS_SECTIONS,
  calendarRangeForView,
  normalizeCandidatePricing,
  normalizeOneTimeRegion,
  normalizeOneTimeTierKey,
  validateOneTimeLead,
  fixtureSefariaLookup,
  buildSourcePrepDraft,
  oneTimeProductReadinessView,
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

test('OneTime product readiness maps product, schedule, booking, portal, and billing gates without writes', () => {
  const readiness = oneTimeProductReadinessView({
    providers: [{ provider: 'stripe', enabled: true, secret_configured: false, configured: false }],
    schedules: [{ id: 1, timezone: 'Asia/Jerusalem' }],
    calendar: { events: [{ id: 10, title: 'Class 1' }] },
    tiers: [{ tier_key: 'library_live_low_touch', checkout_enabled: false }],
  });

  assert.equal(readiness.requirement_id, 'REQ-20260619-306');
  assert.equal(readiness.status, 'needs_operator_decision');
  assert.equal(readiness.safe_local_only, true);
  assert.equal(readiness.no_external_write_performed, true);
  assert.equal(readiness.gates.checkout_enabled, false);
  assert.equal(readiness.gates.charges_enabled, false);
  assert.equal(readiness.gates.invoices_enabled, false);
  assert.equal(readiness.gates.payment_links_enabled, false);
  assert.equal(readiness.gates.zoom_meeting_write_enabled, false);
  assert.equal(readiness.gates.email_send_enabled, false);
  assert.equal(readiness.gates.whatsapp_send_enabled, false);
  assert.equal(readiness.gates.portal_publish_enabled, false);
  assert.equal(readiness.observed_state.provider_settings_loaded, 1);
  assert.equal(readiness.observed_state.schedule_rows_loaded, 1);
  assert.equal(readiness.observed_state.calendar_events_loaded, 1);

  const sectionKeys = readiness.sections.map((section) => section.section_key);
  assert.deepEqual(sectionKeys, ONE_TIME_PRODUCT_READINESS_SECTIONS.map((section) => section.section_key));
  [
    'product_model',
    'schedule',
    'consultation_booking',
    'parent_portal',
    'student_portal',
    'provider_portal',
    'billing_readiness',
  ].forEach((key) => assert.ok(sectionKeys.includes(key), `missing ${key}`));

  const itemKeys = readiness.sections.flatMap((section) => section.items.map((item) => item.key));
  [
    'membership_67_monthly',
    'premium_fixed_duration_masechta_intensive',
    'optional_weekly_installments',
    'entitlements_grace_failed_cancel_refund_access',
    'legacy_price_preservation',
    'rabbi_recurring_availability',
    'exceptions_blackouts_date_windows',
    'masechta_availability_cohort_dates',
    'session_generation_duration_timezone_capacity',
    'reschedule_cancel_makeup_prep_followup',
    'appointment_types',
    'availability_duration_buffers_cutoff',
    'no_show_reminders_parent_confirmation',
    'student_relationship_private_notes_parent_summary',
    'future_zoom_relation',
    'parent_next_class_calendar',
    'parent_billing_invoice_payment_links_cancellation_access',
    'student_next_class_secure_join_calendar',
    'student_watched_progress_badges_community_questions_review',
    'provider_schedule_availability_classes',
    'provider_parent_communication_approvals',
    'provider_of_record',
    'no_charge_cards_or_invoices',
    'refund_cancellation_policy',
    'release_live_smoke',
  ].forEach((key) => assert.ok(itemKeys.includes(key), `missing ${key}`));

  assert.ok(readiness.summary.total_checks >= 30);
  assert.match(readiness.blockers.join('\n'), /billing_provider_of_record_required_before_checkout/);
  assert.match(readiness.blockers.join('\n'), /zoom_calendar_email_whatsapp_and_portal_publish_writes_require_explicit_approval/);
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
  const signupRouteBlock = server.slice(
    server.indexOf("app.post(['/api/bna/product-leads', '/api/one-time/interest']"),
    server.indexOf("app.get('/api/bna/one-time/calendar'"),
  );
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
  assert.match(signupRouteBlock, /no_checkout: true/);
  assert.match(signupRouteBlock, /no_access_granted: false/);
  assert.match(signupRouteBlock, /access_grant_performed: true/);
  assert.match(signupRouteBlock, /trial_signup: trialSignup/);
  assert.match(signupRouteBlock, /contact_tracking: contactTracking/);
  assert.match(signupRouteBlock, /trial_access: trialAccess/);
  assert.match(signupRouteBlock, /confirmation_email: confirmationEmail/);
  assert.match(signupRouteBlock, /transactional_email_send_performed: confirmationEmail\.sent === true/);
  assert.match(signupRouteBlock, /no_bulk_campaign_send: true/);
  assert.match(signupRouteBlock, /imported_lead_send_performed: false/);
  assert.match(signupRouteBlock, /campaign_send_performed: false/);
  assert.match(signupRouteBlock, /external_crm_write_performed: false/);
  assert.match(server, /product_readiness: oneTimeProductReadinessView/);
  assert.match(server, /app\.get\(\['\/one-time', '\/one-time\/mishnayos', '\/one-time\/us', '\/one-time\/uk', '\/one-time\/israel', '\/one-time\/interest'\]/);
  assert.match(server, /app\.get\(\['\/rabbi-member', '\/rabbi\/member', '\/one-time\/member-login'\]/);
});

test('OneTime launch signup writes only scoped first-party tracking records', () => {
  const trackingBlock = server.slice(
    server.indexOf('function oneTimeSignupTrackingTags'),
    server.indexOf('async function oneTimeProductSystemPayload'),
  );
  assert.match(server, /function findExistingOneTimeProductLead/);
  assert.match(server, /function ensureOneTimeSignupScopedTracking/);
  assert.match(server, /function upsertOneTimeSignupContact/);
  assert.match(server, /function upsertOneTimeSignupParentLead/);
  assert.match(server, /function createOneTimeSignupTrackingCommunication/);
  assert.match(server, /function attachOneTimeSignupTrackingToProductLead/);
  assert.match(server, /FROM bna_product_leads[\s\S]*WHERE project_id = \$1[\s\S]*AND program_key = \$2/);
  assert.match(server, /UPDATE bna_product_leads/);
  assert.match(server, /dedupe_status: existing \? 'updated_existing_product_lead' : 'created_product_lead'/);
  assert.match(server, /FROM bna_contacts[\s\S]*WHERE workspace_id = \$1/);
  assert.match(server, /INSERT INTO bna_contacts/);
  assert.match(server, /UPDATE bna_contacts/);
  assert.match(server, /FROM bna_parent_leads[\s\S]*WHERE project_id = \$1/);
  assert.match(server, /INSERT INTO bna_parent_leads/);
  assert.match(server, /UPDATE bna_parent_leads/);
  assert.match(server, /INSERT INTO bna_contact_communications/);
  assert.match(server, /source: 'one_time_launch_signup'/);
  assert.match(server, /ONE_TIME_PROVIDER_WORKSPACE_KEY/);
  assert.match(server, /ONE_TIME_PROJECT_KEY/);
  assert.match(server, /'one-time-trial-signup'/);
  assert.match(server, /'one-time-no-send-until-approved'/);
  assert.match(server, /'campaign_candidate_30_day_free'/);
  assert.match(server, /no_send: true/);
  assert.match(server, /no_checkout: true/);
  assert.match(trackingBlock, /trial_access_grant_expected: true/);
  assert.match(server, /external_write_performed: false/);
  assert.match(server, /'web_assistant'/);
  assert.match(server, /local trial access is handled through bna_access_grants/);
  assert.doesNotMatch(trackingBlock, /GHL|GoHighLevel|LeadConnectorHQ|leadconnector\.hq/i);
});

test('OneTime launch signup grants idempotent 30-day local trial access without payment writes', () => {
  const trialAccessBlock = server.slice(
    server.indexOf('function oneTimeTrialAccessIdempotencyKey'),
    server.indexOf('async function oneTimeProductSystemPayload'),
  );
  assert.match(server, /function ensureOneTimeTrialAccessGrant/);
  assert.match(server, /function attachOneTimeTrialAccessMetadata/);
  assert.match(server, /function oneTimeTrialAccessMetadata/);
  assert.match(trialAccessBlock, /RABBI_TIER_KEYS\.LIVE_LIBRARY/);
  assert.match(trialAccessBlock, /access_status = 'trial'/);
  assert.match(trialAccessBlock, /startsAt: trialSignup\.trial_start_at/);
  assert.match(trialAccessBlock, /expiresAt: trialSignup\.trial_end_at/);
  assert.match(trialAccessBlock, /idempotencyKey/);
  assert.match(trialAccessBlock, /source: 'one_time_trial_signup'/);
  assert.match(trialAccessBlock, /payment_required_at_signup: false/);
  assert.match(trialAccessBlock, /stripe_checkout_created: false/);
  assert.match(trialAccessBlock, /subscription_created: false/);
  assert.match(trialAccessBlock, /cancellation_or_refund_performed: false/);
  assert.match(trialAccessBlock, /external_write_performed: false/);
  assert.match(server, /access_grant_performed: true/);
  assert.match(server, /preview_only: false/);
  assert.doesNotMatch(trialAccessBlock, /stripeIntegration|greenInvoice|checkout-create|provider_checkout_url/);
});

test('OneTime launch signup sends one idempotent Resend confirmation only to the current signup', () => {
  const confirmationBlock = server.slice(
    server.indexOf('function oneTimeSignupConfirmationEmailIdempotencyKey'),
    server.indexOf('async function oneTimeProductSystemPayload'),
  );
  assert.match(confirmationBlock, /function oneTimeSignupConfirmationEmailIdempotencyKey/);
  assert.match(confirmationBlock, /function oneTimeSignupConfirmationEmailMetadata/);
  assert.match(confirmationBlock, /async function existingOneTimeSignupConfirmationEmail/);
  assert.match(confirmationBlock, /async function sendOneTimeSignupConfirmationEmail/);
  assert.match(confirmationBlock, /templateKey: 'receipt_access'/);
  assert.match(confirmationBlock, /!RESEND_API_KEY \|\| !RESEND_FROM_EMAIL/);
  assert.match(confirmationBlock, /One Time signup confirmation requires the Resend sender identity/);
  assert.match(confirmationBlock, /current_signup_recipient_only: true/);
  assert.match(confirmationBlock, /no_bulk_campaign_send: true/);
  assert.match(confirmationBlock, /imported_lead_send_performed: false/);
  assert.match(confirmationBlock, /campaign_send_performed: false/);
  assert.match(confirmationBlock, /whatsapp_send_performed: false/);
  assert.match(confirmationBlock, /external_crm_write_performed: false/);
  assert.match(confirmationBlock, /existingOneTimeSignupConfirmationEmail\(\{ projectId: project\.id, idempotencyKey \}\)/);
  assert.match(confirmationBlock, /sendResendMessage\(\{/);
  assert.match(confirmationBlock, /workspace: 'rabbi_sheller_provider'/);
  assert.match(confirmationBlock, /from_email: ONE_TIME_EMAIL_FROM/);
  assert.match(confirmationBlock, /reply_to: ONE_TIME_EMAIL_REPLY_TO/);
  assert.doesNotMatch(confirmationBlock, /GHL|GoHighLevel|LeadConnectorHQ|leadconnector\.hq/i);
});

test('public OneTime trial page is noindex, no-card, and has no checkout call', () => {
  assert.match(oneTimeHtml, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(oneTimeHtml, /OneTime Mishnayos/);
  assert.match(oneTimeHtml, /30-Day Free Trial/);
  assert.match(oneTimeHtml, /Start 30 Days Free/);
  assert.match(oneTimeHtml, /No card, no checkout/);
  assert.match(oneTimeHtml, /No payment is collected during signup/);
  assert.match(oneTimeHtml, /Your 30-day member access runs through/);
  assert.match(oneTimeHtml, /sends only your signup confirmation email/);
  assert.match(oneTimeHtml, /No payment, checkout, WhatsApp, imported-list email, campaign send, or external CRM write is approved by this form/);
  assert.match(oneTimeHtml, /\$67\/month planned/);
  assert.match(oneTimeHtml, /Watch Rabbi Video/);
  assert.match(oneTimeHtml, /What Your Child Gets/);
  assert.match(oneTimeHtml, /Private questions to Rabbi/);
  assert.match(oneTimeHtml, /Parent progress basics/);
  assert.match(oneTimeHtml, /name="timezone"/);
  assert.match(oneTimeHtml, /name="utm_campaign"/);
  assert.match(oneTimeHtml, /free_mishnayos_class/);
  assert.match(oneTimeHtml, /\/api\/one-time\/interest/);
  assert.doesNotMatch(oneTimeHtml, /\/api\/rabbi\/checkout/);
  assert.doesNotMatch(oneTimeHtml, /Stripe checkout/i);
  assert.doesNotMatch(oneTimeHtml, /GreenInvoice checkout/i);
  assert.doesNotMatch(oneTimeHtml, /zoom\.us|zoom\.com/i);
});

test('Operations provider workspace reads OneTime product system and labels pricing as pending', () => {
  [
    'getOneTimeProductSystem',
    'getOneTimeProductCalendar',
    'getOneTimeProductLeads',
    'createOneTimeSourcePrepJob',
    'renderOneTimeProductDecisionPanel',
    'renderOneTimeProductReadinessPanel',
    'renderOneTimeProductTiersPanel',
    'renderOneTimeFunnelPanel',
    'renderOneTimeLeadPanel',
    'createOneTimeSourcePrepFixture',
  ].forEach((needle) => assert.match(operationsHtml, new RegExp(needle)));

  assert.match(operationsHtml, /RABBI-04 is draft\/decision-ready only/);
  assert.match(operationsHtml, /data-one-time-product-readiness/);
  assert.match(operationsHtml, /REQ-20260619-306/);
  assert.match(operationsHtml, /No checkout, invoice, payment link, Zoom, external calendar, email, WhatsApp, Telegram, portal publish, or access automation is enabled/);
  assert.match(operationsHtml, /Candidate prices are review data only/);
  assert.match(operationsHtml, /Checkout disabled/);
  assert.match(operationsHtml, /fixture source-prep draft/i);
  assert.doesNotMatch(operationsHtml, /price: '\$67\/month'/);
  assert.doesNotMatch(operationsHtml, /price: '\$149\/month'/);
});
