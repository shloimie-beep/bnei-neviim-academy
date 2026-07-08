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
  buildOneTimeProductOfferCatalog,
  buildOneTimeAvailabilityFoundation,
  oneTimeAppointmentIntentView,
  defaultOneTimeAppointmentTypes,
  buildOneTimePortalFoundations,
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

test('OneTime Batch 9/10 foundations model offers, booking, and portals without external writes', () => {
  const offers = buildOneTimeProductOfferCatalog([]);
  const monthly = offers.find((offer) => offer.offer_key === 'membership_67_monthly');
  const intensive = offers.find((offer) => offer.offer_key === 'premium_masechta_intensive');
  assert.equal(monthly.price_amount_cents, 6700);
  assert.equal(monthly.billing_model, 'recurring_monthly');
  assert.equal(monthly.checkout_enabled, false);
  assert.equal(monthly.payment_links_enabled, false);
  assert.equal(monthly.access_automation_enabled, false);
  assert.equal(monthly.access_policy.failed_payment_state, 'failed_payment');
  assert.equal(monthly.access_policy.grace_period_state, 'grace_period');
  assert.equal(monthly.access_policy.cancellation_state, 'cancellation_requested');
  assert.equal(monthly.access_policy.refund_state, 'refund_pending');
  assert.equal(monthly.access_policy.completion_state, 'completed');
  assert.equal(monthly.access_policy.expiration_state, 'expired');
  assert.equal(intensive.billing_model, 'fixed_duration');
  assert.equal(intensive.upfront_payment_supported, true);
  assert.equal(intensive.weekly_installments_supported, true);
  assert.equal(intensive.price_status, 'decision_pending');

  const availability = buildOneTimeAvailabilityFoundation([]);
  assert.equal(availability.exceptions_supported, true);
  assert.equal(availability.blackout_dates_supported, true);
  assert.equal(availability.masechta_windows_supported, true);
  assert.equal(availability.preparation_blocks_supported, true);
  assert.equal(availability.follow_up_blocks_supported, true);
  assert.equal(availability.cancellations_supported, true);
  assert.equal(availability.rescheduling_supported, true);
  assert.equal(availability.makeup_classes_supported, true);
  assert.equal(availability.external_write_performed, false);
  assert.ok(availability.rules.find((rule) => rule.rule_key === 'israel_7pm_recurring'));

  const appointment = oneTimeAppointmentIntentView({
    appointment_type: 'placement_call',
    parent_name: 'Parent',
    parent_email: 'parent@example.com',
    student_name: 'Student',
    private_notes: 'internal only',
    parent_visible_summary: 'Placement call requested.',
    payment_required: true,
  });
  assert.equal(appointment.appointment_type, 'placement_call');
  assert.equal(appointment.reminders_enabled, false);
  assert.equal(appointment.zoom_meeting_created, false);
  assert.equal(appointment.external_calendar_write_performed, false);
  assert.equal(appointment.parent_confirmation_required, true);
  assert.equal(defaultOneTimeAppointmentTypes().length, 5);

  const portals = buildOneTimePortalFoundations({
    calendar: { events: [{ id: 1 }] },
    offers,
    appointmentIntents: [appointment],
    libraryItems: [{ id: 10 }],
  });
  assert.ok(portals.parent.sections.includes('membership_billing_access_status'));
  assert.ok(portals.parent.sections.includes('consultation_booking'));
  assert.ok(portals.student.sections.includes('secure_join_class_gated'));
  assert.equal(portals.student.join_class_enabled, false);
  assert.match(portals.student.join_class_blocker, /Zoom meeting/);
  assert.ok(portals.provider.sections.includes('consultations_parent_communication'));
  assert.equal(portals.parent.loaded_counts.offers, 2);
  assert.equal(portals.parent.no_bna_student_data_by_default, true);
  assert.equal(portals.provider.external_send_enabled, false);
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
    'bna_one_time_product_offers',
    'bna_one_time_availability_rules',
    'bna_one_time_appointment_intents',
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
  assert.match(productMigration, /'membership_67_monthly'/);
  assert.match(productMigration, /'premium_masechta_intensive'/);
  assert.match(productMigration, /6700::integer/);
  assert.match(productMigration, /'candidate_pending_approval'/);
  assert.match(productMigration, /'fixed_duration'/);
  assert.match(productMigration, /'weekly_installments'/);
  assert.match(productMigration, /bna_one_time_product_offers_key_check/);
  assert.match(productMigration, /bna_one_time_appointment_type_check/);
  assert.match(productMigration, /'israel_7pm_recurring'/);
  assert.match(productMigration, /'premium_masechta_window_placeholder'/);
  assert.match(productMigration, /'operator_decision_required'/);
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
    "app.get('/api/bna/one-time/crm-import-preview'",
    "app.get(['/api/bna/product-leads', '/api/bna/one-time/product-leads']",
    "app.post(['/api/bna/product-leads', '/api/one-time/interest']",
    "app.get('/api/bna/one-time/calendar'",
    "app.post('/api/bna/one-time/calendar-events'",
    "app.get('/api/one-time/calendar'",
    "app.get('/api/bna/one-time/appointment-intents'",
    "app.post('/api/bna/one-time/appointment-intents'",
    "app.get('/api/bna/one-time/source-prep-jobs'",
    "app.post('/api/bna/one-time/source-prep-jobs'",
  ].forEach((route) => assert.match(server, new RegExp(escapeRegex(route))));

  assert.match(server, /createOneTimeProductSystemSQL/);
  assert.match(server, /railway-migration-2026-06-16-one-time-product-system\.sql/);
  assert.match(server, /isScopedOpsPathAllowed[\s\S]*\/api\/bna\/one-time\/product-system/);
  assert.match(server, /no_checkout: true/);
  assert.match(server, /no_access_granted: true/);
  assert.match(server, /external_write_performed: false/);
  assert.match(server, /product_readiness: oneTimeProductReadinessView/);
  assert.match(server, /crm_import_preview: crmImportPreview/);
  assert.match(server, /oneTimeCrmImportPreviewReadiness/);
  assert.match(server, /ONE_TIME_CRM_IMPORT_INVENTORY_SUMMARY/);
  assert.match(server, /one_time_rabbi_scheller_followers/);
  assert.match(server, /APPROVE_ONE_TIME_CRM_IMPORT/);
  assert.match(server, /ghl_leadconnector_inactive: true/);
  assert.match(server, /no_raw_rows_returned: true/);
  assert.match(server, /external_crm_write_performed: false/);
  assert.match(server, /product_offers: productOffers/);
  assert.match(server, /availability,/);
  assert.match(server, /appointment_types: defaultOneTimeAppointmentTypes/);
  assert.match(server, /appointment_intents: appointmentRows/);
  assert.match(server, /portal_foundations: buildOneTimePortalFoundations/);
  assert.match(server, /no_zoom_meeting_created: true/);
  assert.match(server, /external_calendar_write_performed: false/);
  assert.match(server, /appointment_intents_internal_only: true/);
  assert.match(server, /\/api\/bna\/one-time\/calendar-events/);
  assert.match(server, /\/api\/bna\/one-time\/appointment-intents/);
  assert.match(server, /app\.get\(\[[^\]]*'\/one-time'[^\]]*'\/one-time\/mishnayos'[^\]]*'\/one-time\/us'[^\]]*'\/one-time\/uk'[^\]]*'\/one-time\/israel'[^\]]*'\/one-time\/interest'[^\]]*\], sendOneTimePublicLanding\)/);
  assert.match(server, /app\.get\(\['\/one-time\/member-login', '\/member', '\/member-portal'\], redirectOneTimeMemberHome\)/);
});

test('public OneTime draft page is noindex, interest-only, and has no checkout call', () => {
  assert.match(oneTimeHtml, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(oneTimeHtml, /OneTimeOneTime Mishnah/);
  assert.match(oneTimeHtml, /Your Child Can Love Learning Mishnayos/);
  assert.match(oneTimeHtml, /Sign Up Now/);
  assert.match(oneTimeHtml, /#start-free/);
  assert.match(oneTimeHtml, /signup-strip/);
  assert.match(oneTimeHtml, /id="signupEmail"/);
  assert.match(oneTimeHtml, /source_landing_page/);
  assert.match(oneTimeHtml, /\/api\/one-time\/interest/);
  assert.match(oneTimeHtml, /Consent is required before submitting/);
  assert.match(oneTimeHtml, /You're on the list\. We will email the OneTimeOneTime start link\./);
  assert.doesNotMatch(oneTimeHtml, /class="announcement"/);
  assert.doesNotMatch(oneTimeHtml, /class="ticker"/);
  assert.doesNotMatch(oneTimeHtml, />Parent name</);
  assert.doesNotMatch(oneTimeHtml, />Phone \/ WhatsApp</);
  assert.doesNotMatch(oneTimeHtml, />Region</);
  assert.doesNotMatch(oneTimeHtml, />Notes</);
  assert.doesNotMatch(oneTimeHtml, /\/api\/rabbi\/checkout/);
  assert.doesNotMatch(oneTimeHtml, /Stripe checkout/i);
  assert.doesNotMatch(oneTimeHtml, /GreenInvoice checkout/i);
});

test('Operations provider workspace reads OneTime product system and labels pricing as pending', () => {
  [
    'getOneTimeProductSystem',
    'getOneTimeProductCalendar',
    'getOneTimeProductLeads',
    'createOneTimeCalendarEvent',
    'getOneTimeAppointmentIntents',
    'createOneTimeAppointmentIntent',
    'createOneTimeSourcePrepJob',
    'getOneTimeCrmImportPreview',
    'renderOneTimeProductDecisionPanel',
    'renderOneTimeProductReadinessPanel',
    'renderOneTimeProductTiersPanel',
    'renderOneTimeProductOffersPanel',
    'renderOneTimeAvailabilityBookingPanel',
    'renderOneTimePortalFoundationsPanel',
    'renderOneTimeFunnelPanel',
    'renderOneTimeLeadPanel',
    'renderOneTimeCrmImportPreviewPanel',
    'createOneTimeSourcePrepFixture',
  ].forEach((needle) => assert.match(operationsHtml, new RegExp(needle)));

  assert.match(operationsHtml, /RABBI-04 is draft\/decision-ready only/);
  assert.match(operationsHtml, /data-one-time-product-readiness/);
  assert.match(operationsHtml, /data-one-time-product-offers/);
  assert.match(operationsHtml, /data-one-time-availability-booking/);
  assert.match(operationsHtml, /data-one-time-portal-foundations/);
  assert.match(operationsHtml, /data-one-time-crm-import-preview/);
  assert.match(operationsHtml, /CRM Import Preview/);
  assert.match(operationsHtml, /Preview Mapping/);
  assert.match(operationsHtml, /Open Import Decision/);
  assert.match(operationsHtml, /Apply Import/);
  assert.match(operationsHtml, /disabled aria-disabled="true"/);
  assert.match(operationsHtml, /no email, WhatsApp, payment, or external CRM write is performed/);
  assert.match(operationsHtml, /REQ-20260619-306/);
  assert.match(operationsHtml, /No checkout, invoice, payment link, Zoom, external calendar, email, WhatsApp, Telegram, portal publish, or access automation is enabled/);
  assert.match(operationsHtml, /Add Class saves an internal OneTime calendar event only/);
  assert.match(operationsHtml, /Add Appointment/);
  assert.match(operationsHtml, /oneTimeClassTitle/);
  assert.match(operationsHtml, /oneTimeAppointmentType/);
  assert.match(operationsHtml, /No Zoom meeting, reminder, charge, or external calendar write was performed/);
  assert.match(operationsHtml, /Candidate prices are review data only/);
  assert.match(operationsHtml, /Checkout disabled/);
  assert.match(operationsHtml, /checkout disabled/);
  assert.match(operationsHtml, /payment links disabled/);
  assert.match(operationsHtml, /renderOneTimePortalFoundationCard\('Parent'/);
  assert.match(operationsHtml, /renderOneTimePortalFoundationCard\('Student'/);
  assert.match(operationsHtml, /renderOneTimePortalFoundationCard\('Provider'/);
  assert.match(operationsHtml, /fixture source-prep draft/i);
  assert.doesNotMatch(operationsHtml, /price: '\$67\/month'/);
  assert.doesNotMatch(operationsHtml, /price: '\$149\/month'/);
});
