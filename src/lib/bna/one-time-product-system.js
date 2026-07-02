const ONE_TIME_PRODUCT_PROGRAM_KEY = 'one_time_mishnah_class';
const ONE_TIME_CONTENT_ALIAS = 'mishna';

const ONE_TIME_PRODUCT_TIER_KEYS = Object.freeze({
  LIBRARY_LIVE_LOW_TOUCH: 'library_live_low_touch',
  INTERACTIVE_ZOOM: 'interactive_zoom',
  VIP_HIGH_TOUCH: 'vip_high_touch',
});

const ONE_TIME_COMPAT_TIER_KEYS = Object.freeze({
  LIBRARY_ONLY: 'library_only',
  LIVE_LIBRARY: 'live_library',
});

const ONE_TIME_PRODUCT_TIER_KEY_VALUES = Object.freeze([
  ...Object.values(ONE_TIME_PRODUCT_TIER_KEYS),
  ...Object.values(ONE_TIME_COMPAT_TIER_KEYS),
]);

const ONE_TIME_REGIONS = Object.freeze(['us', 'uk', 'israel', 'worldwide']);
const ONE_TIME_AUDIENCES = Object.freeze(['parents', 'students', 'members', 'public', 'admin']);
const ONE_TIME_VISIBILITIES = Object.freeze(['admin_only', 'parent_visible', 'student_visible', 'public']);
const ONE_TIME_ARTIFACT_STATUSES = Object.freeze(['not_started', 'drafting', 'needs_review', 'approved', 'published']);
const ONE_TIME_CALENDAR_VIEWS = Object.freeze(['today', 'week', 'month', 'list']);
const ONE_TIME_DECISION_STATUSES = Object.freeze(['decision_pending', 'approved', 'rejected', 'blocked']);
const ONE_TIME_LEAD_STATUSES = Object.freeze(['new', 'reviewing', 'follow_up', 'converted', 'archived']);

const ONE_TIME_CANDIDATE_PRICING = Object.freeze({
  library_live_low_touch: {
    currency: 'USD',
    candidates: [50, 67, 100, 149],
    preferred: 50,
    status: 'decision_pending',
    public_label: 'Pricing pending',
  },
  interactive_zoom: {
    currency: 'USD',
    candidates: [149, 150],
    preferred: 149,
    status: 'decision_pending',
    public_label: 'Pricing pending',
  },
  vip_high_touch: {
    currency: 'USD',
    candidates: [300],
    preferred: 300,
    status: 'decision_pending',
    public_label: 'Pricing pending',
    note: '$300+ candidate tier for review',
  },
});

const ONE_TIME_PRODUCT_TIER_DEFINITIONS = Object.freeze({
  library_live_low_touch: {
    tier_key: ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH,
    display_name: 'Library + Live Replay',
    description: 'Low-touch access to the Mishnayos library, class recordings, and core class schedule.',
    access_scopes: ['library', 'live_replay'],
    sort_order: 30,
    price_status: 'decision_pending',
  },
  interactive_zoom: {
    tier_key: ONE_TIME_PRODUCT_TIER_KEYS.INTERACTIVE_ZOOM,
    display_name: 'Interactive Zoom',
    description: 'Live Zoom participation with replay/library access and moderated questions.',
    access_scopes: ['library', 'live', 'questions'],
    sort_order: 40,
    price_status: 'decision_pending',
  },
  vip_high_touch: {
    tier_key: ONE_TIME_PRODUCT_TIER_KEYS.VIP_HIGH_TOUCH,
    display_name: 'VIP High-Touch',
    description: 'High-touch Mishnayos support for families who need more direct guidance.',
    access_scopes: ['library', 'live', 'questions', 'vip'],
    sort_order: 50,
    price_status: 'decision_pending',
  },
});

const ONE_TIME_DEFAULT_REGION_NOTES = Object.freeze({
  israel: '7:00 PM Israel time can be positioned as the direct live class option.',
  uk: '7:00 PM Israel time is likely usable for UK families and should be reviewed as a live-friendly option.',
  us: '7:00 PM Israel time is usually better framed around replay/library plus selected live opportunities.',
  worldwide: 'Worldwide funnel should clarify replay-first access and timezone-specific live expectations.',
});

const ONE_TIME_READINESS_STATUSES = Object.freeze([
  'local_contract_present',
  'needs_live_data',
  'needs_operator_decision',
  'blocked_external_approval',
]);

const ONE_TIME_PRODUCT_READINESS_SECTIONS = Object.freeze([
  {
    section_key: 'product_model',
    title: 'Product Model',
    items: [
      {
        key: 'membership_67_monthly',
        label: '$67 monthly One Time membership',
        status: 'needs_operator_decision',
        note: 'Represented as a reviewable membership plan without overwriting the existing $67 library-only compatibility tier.',
      },
      {
        key: 'premium_fixed_duration_masechta_intensive',
        label: 'Premium fixed-duration Masechta intensive',
        status: 'needs_operator_decision',
        note: 'Modeled as a separate intensive offer so it does not silently collapse into recurring membership access.',
      },
      {
        key: 'intensive_upfront_payment',
        label: 'Upfront intensive payment',
        status: 'blocked_external_approval',
        note: 'Requires approved billing provider, product, payment link, and live checkout smoke before collection.',
      },
      {
        key: 'optional_weekly_installments',
        label: 'Optional weekly installments',
        status: 'needs_operator_decision',
        note: 'Installment cadence remains a policy choice; no invoice or subscription schedule is created locally.',
      },
      {
        key: 'entitlements_grace_failed_cancel_refund_access',
        label: 'Entitlements, grace, failed payment, cancellation, refund, and access expiration',
        status: 'needs_operator_decision',
        note: 'Access-state vocabulary is documented for implementation, but live payment and refund rules need approval.',
      },
      {
        key: 'intensive_completion_member_status',
        label: 'Intensive completion and member status',
        status: 'local_contract_present',
        note: 'Readiness keeps completion/member state separate from BNA student records and parent portal accounts.',
      },
      {
        key: 'legacy_price_preservation',
        label: 'Preserve existing $67 library-only and $149 live-plus-library records',
        status: 'local_contract_present',
        note: 'Planning tiers stay decision-pending and do not silently overwrite existing launch-tier rows.',
      },
    ],
  },
  {
    section_key: 'schedule',
    title: 'Schedule And Cohorts',
    items: [
      {
        key: 'rabbi_recurring_availability',
        label: 'Rabbi recurring availability',
        status: 'needs_live_data',
        note: 'Local schedule rows can carry the recurring 7:00 PM Israel class; exact recurrence still needs approved source data.',
      },
      {
        key: 'exceptions_blackouts_date_windows',
        label: 'Exceptions, blackout dates, and date windows',
        status: 'needs_live_data',
        note: 'The readiness contract names these fields before any Google Calendar or Zoom write is allowed.',
      },
      {
        key: 'masechta_availability_cohort_dates',
        label: 'Masechta availability and cohort dates',
        status: 'needs_operator_decision',
        note: 'Cohort and Masechta sequencing must be chosen before publishing member-visible schedules.',
      },
      {
        key: 'session_generation_duration_timezone_capacity',
        label: 'Session generation, duration, timezone, capacity, min, and max',
        status: 'local_contract_present',
        note: 'Calendar payloads expose timezone/duration/capacity-safe fields without external calendar writes.',
      },
      {
        key: 'reschedule_cancel_makeup_prep_followup',
        label: 'Rescheduling, cancellation, makeup, prep, and follow-up blocks',
        status: 'needs_operator_decision',
        note: 'Policy and notice timing are held as approval work before member notifications or provider calendar writes.',
      },
    ],
  },
  {
    section_key: 'consultation_booking',
    title: 'Consultation Booking',
    items: [
      {
        key: 'appointment_types',
        label: 'Parent consultation, placement call, progress call, and office hours',
        status: 'needs_operator_decision',
        note: 'Appointment types are named for the future booking workflow; no live booking provider is connected here.',
      },
      {
        key: 'availability_duration_buffers_cutoff',
        label: 'Availability, duration, buffers, booking window, and cutoff',
        status: 'needs_live_data',
        note: 'Requires approved Rabbi availability and booking rules before member-facing slots are generated.',
      },
      {
        key: 'no_show_reminders_parent_confirmation',
        label: 'No-show, reminders, and parent confirmation',
        status: 'blocked_external_approval',
        note: 'Reminder sends and calendar writes are explicitly blocked until approval and live smoke.',
      },
      {
        key: 'student_relationship_private_notes_parent_summary',
        label: 'Student relationship, private notes, and parent-visible summary',
        status: 'local_contract_present',
        note: 'Private notes stay admin/provider-only; parent-visible summaries are a separate surface.',
      },
      {
        key: 'future_zoom_relation',
        label: 'Future Zoom meeting relation',
        status: 'blocked_external_approval',
        note: 'No Zoom meeting is created or updated without explicit external-account approval.',
      },
    ],
  },
  {
    section_key: 'parent_portal',
    title: 'Parent Portal',
    items: [
      {
        key: 'parent_next_class_calendar',
        label: 'Next class and calendar',
        status: 'local_contract_present',
        note: 'Parent-facing readiness can read class/calendar state without exposing admin-only provider notes.',
      },
      {
        key: 'parent_attendance_learning_progress',
        label: 'Attendance, lateness, learning progress, Masechta, Perek, and Mishnah',
        status: 'local_contract_present',
        note: 'Existing parent portal patterns already separate safe student progress from private analysis.',
      },
      {
        key: 'parent_weekly_update_recordings_badges_assignments_booking',
        label: 'Weekly Rabbi update, recordings, badges, assignments, review, and booking',
        status: 'needs_live_data',
        note: 'The readiness layer names these surfaces; real content requires approved source, recording, and booking data.',
      },
      {
        key: 'parent_billing_invoice_payment_links_cancellation_access',
        label: 'Billing, invoice/payment links if configured, cancellation, and access status',
        status: 'blocked_external_approval',
        note: 'Parent billing visibility stays read-only until the provider of record, payment links, invoices, refunds, and release smoke are approved.',
      },
    ],
  },
  {
    section_key: 'student_portal',
    title: 'Student Portal',
    items: [
      {
        key: 'student_next_class_secure_join_calendar',
        label: 'Next class, secure Join Class, and calendar',
        status: 'blocked_external_approval',
        note: 'Secure join can be displayed only from approved member access; live Zoom URL exposure remains gated.',
      },
      {
        key: 'student_learning_progress_assignments_library',
        label: 'Current learning unit, progress, assignments, and video library',
        status: 'local_contract_present',
        note: 'Student-safe portal surfaces already avoid parent/admin private notes.',
      },
      {
        key: 'student_watched_progress_badges_community_questions_review',
        label: 'Watched progress, badges, community, questions, private Rabbi feedback, and review plan',
        status: 'needs_live_data',
        note: 'Classroom/community pieces remain moderated and data-backed before student exposure.',
      },
    ],
  },
  {
    section_key: 'provider_portal',
    title: 'Provider Portal',
    items: [
      {
        key: 'provider_schedule_availability_classes',
        label: 'Rabbi schedule, availability, and classes',
        status: 'needs_live_data',
        note: 'Provider schedule is local/read-only until approved live calendar or booking writes are allowed.',
      },
      {
        key: 'provider_students_members_attendance_curriculum',
        label: 'Students/members, attendance, and curriculum',
        status: 'local_contract_present',
        note: 'Members stay separate from BNA school students and provider scope cannot read unrelated school data.',
      },
      {
        key: 'provider_updates_questions_recordings_badges_consultations',
        label: 'Weekly updates, questions, recording review, badge awards, and consultation appointments',
        status: 'needs_operator_decision',
        note: 'Publishing and review approvals must be chosen before provider actions become member-visible.',
      },
      {
        key: 'provider_parent_communication_approvals',
        label: 'Parent communication and publishing approvals',
        status: 'blocked_external_approval',
        note: 'No email, WhatsApp, Telegram, or portal notification send occurs from readiness review.',
      },
    ],
  },
  {
    section_key: 'billing_readiness',
    title: 'Billing And Access Readiness',
    items: [
      {
        key: 'provider_of_record',
        label: 'Provider of record',
        status: 'needs_operator_decision',
        note: 'Stripe-only conversion is required for the current 30-day free/no-card launch; live billing still needs explicit approval.',
      },
      {
        key: 'no_charge_cards_or_invoices',
        label: 'No card charge, invoice, payment link, or subscription creation',
        status: 'blocked_external_approval',
        note: 'Local readiness cannot create charges, invoices, subscriptions, or payment links.',
      },
      {
        key: 'failed_payment_dunning_owner_alert',
        label: 'Failed payment, dunning, and owner alert',
        status: 'blocked_external_approval',
        note: 'Payment recovery and owner alerts require approved provider webhooks and send approvals.',
      },
      {
        key: 'refund_cancellation_policy',
        label: 'Refund and cancellation policy',
        status: 'needs_operator_decision',
        note: 'Refund/cancellation policy must be approved before any live checkout or access-removal automation.',
      },
      {
        key: 'release_live_smoke',
        label: 'Deploy and live smoke proof',
        status: 'blocked_external_approval',
        note: 'App-visible/server-visible completion needs release and live smoke evidence; local verification alone is not final.',
      },
    ],
  },
]);

function normalizeEnum(value, allowed, fallback) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return allowed.includes(normalized) ? normalized : fallback;
}

function normalizeOneTimeRegion(value, fallback = 'worldwide') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (normalized === 'israel' || normalized === 'il' || normalized === 'eretz_yisrael') return 'israel';
  if (normalized === 'usa' || normalized === 'america' || normalized === 'united_states') return 'us';
  if (normalized === 'gb' || normalized === 'united_kingdom' || normalized === 'england') return 'uk';
  return ONE_TIME_REGIONS.includes(normalized) ? normalized : fallback;
}

function normalizeOneTimeTierKey(value, fallback = ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  const aliases = {
    library: ONE_TIME_COMPAT_TIER_KEYS.LIBRARY_ONLY,
    video_library: ONE_TIME_COMPAT_TIER_KEYS.LIBRARY_ONLY,
    live: ONE_TIME_COMPAT_TIER_KEYS.LIVE_LIBRARY,
    live_plus_library: ONE_TIME_COMPAT_TIER_KEYS.LIVE_LIBRARY,
    live_class: ONE_TIME_COMPAT_TIER_KEYS.LIVE_LIBRARY,
    low_touch: ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH,
    library_live: ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH,
    library_plus_live: ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH,
    live_replay: ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH,
    zoom: ONE_TIME_PRODUCT_TIER_KEYS.INTERACTIVE_ZOOM,
    interactive: ONE_TIME_PRODUCT_TIER_KEYS.INTERACTIVE_ZOOM,
    interactive_live: ONE_TIME_PRODUCT_TIER_KEYS.INTERACTIVE_ZOOM,
    high_touch: ONE_TIME_PRODUCT_TIER_KEYS.VIP_HIGH_TOUCH,
    vip: ONE_TIME_PRODUCT_TIER_KEYS.VIP_HIGH_TOUCH,
  };
  const mapped = aliases[normalized] || normalized;
  return ONE_TIME_PRODUCT_TIER_KEY_VALUES.includes(mapped) ? mapped : fallback;
}

function normalizeTierList(value) {
  const raw = Array.isArray(value)
    ? value
    : String(value || '').split(/[,;\s]+/);
  return Array.from(new Set(raw
    .map((item) => normalizeOneTimeTierKey(item, ''))
    .filter(Boolean)));
}

function normalizeOneTimeVisibility(value, fallback = 'admin_only') {
  return normalizeEnum(value, ONE_TIME_VISIBILITIES, fallback);
}

function normalizeOneTimeArtifactStatus(value, fallback = 'not_started') {
  return normalizeEnum(value, ONE_TIME_ARTIFACT_STATUSES, fallback);
}

function normalizeOneTimeCalendarView(value, fallback = 'week') {
  return normalizeEnum(value, ONE_TIME_CALENDAR_VIEWS, fallback);
}

function normalizeOneTimeLeadStatus(value, fallback = 'new') {
  return normalizeEnum(value, ONE_TIME_LEAD_STATUSES, fallback);
}

function normalizeOneTimeAudience(value, fallback = 'parents') {
  return normalizeEnum(value, ONE_TIME_AUDIENCES, fallback);
}

function normalizeCandidatePricing(tierKey) {
  const key = normalizeOneTimeTierKey(tierKey);
  const pricing = ONE_TIME_CANDIDATE_PRICING[key] || null;
  if (!pricing) {
    return {
      status: 'decision_pending',
      currency: 'USD',
      candidates: [],
      preferred: null,
      public_label: 'Pricing pending',
    };
  }
  return {
    status: pricing.status,
    currency: pricing.currency,
    candidates: [...pricing.candidates],
    preferred: pricing.preferred,
    public_label: pricing.public_label,
    note: pricing.note || '',
  };
}

function oneTimeTierPlanningView(tierKey) {
  const key = normalizeOneTimeTierKey(tierKey);
  const definition = ONE_TIME_PRODUCT_TIER_DEFINITIONS[key] || {};
  return {
    tier_key: key,
    display_name: definition.display_name || key,
    description: definition.description || '',
    access_scopes: [...(definition.access_scopes || [])],
    sort_order: Number(definition.sort_order || 0),
    price_status: definition.price_status || 'decision_pending',
    candidate_pricing: normalizeCandidatePricing(key),
    public_publish_status: 'draft',
    checkout_enabled: false,
  };
}

function calendarRangeForView(viewValue, nowValue = new Date()) {
  const view = normalizeOneTimeCalendarView(viewValue);
  const now = nowValue instanceof Date ? new Date(nowValue.getTime()) : new Date(nowValue);
  if (Number.isNaN(now.getTime())) throw new Error('Invalid calendar date');
  const start = new Date(now.getTime());
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start.getTime());
  if (view === 'today') {
    end.setUTCDate(end.getUTCDate() + 1);
  } else if (view === 'week') {
    const day = start.getUTCDay();
    start.setUTCDate(start.getUTCDate() - day);
    end.setTime(start.getTime());
    end.setUTCDate(end.getUTCDate() + 7);
  } else if (view === 'month') {
    start.setUTCDate(1);
    end.setTime(start.getTime());
    end.setUTCMonth(end.getUTCMonth() + 1);
  } else {
    end.setUTCDate(end.getUTCDate() + 90);
  }
  return { view, start: start.toISOString(), end: end.toISOString() };
}

function validateOneTimeLead(input = {}) {
  const parentName = String(input.parent_name || input.parentName || input.name || '').trim();
  const email = String(input.email || input.parent_email || input.parentEmail || '').trim().toLowerCase();
  const phone = String(input.phone || input.parent_phone || input.parentPhone || '').trim();
  const whatsapp = String(input.whatsapp || input.whatsapp_phone || input.whatsappPhone || '').trim();
  if (!email && !phone && !whatsapp) {
    const error = new Error('Email, phone, or WhatsApp is required');
    error.statusCode = 400;
    throw error;
  }
  const region = normalizeOneTimeRegion(input.region || input.funnel_region || input.country || 'worldwide');
  const interestedTiers = normalizeTierList(input.interested_tiers || input.interestedTiers || input.tier_key || input.tierKey);
  return {
    program_key: ONE_TIME_PRODUCT_PROGRAM_KEY,
    product_key: ONE_TIME_PRODUCT_PROGRAM_KEY,
    content_alias: ONE_TIME_CONTENT_ALIAS,
    region,
    audience: normalizeOneTimeAudience(input.audience || 'parents'),
    interested_tiers: interestedTiers.length ? interestedTiers : [ONE_TIME_PRODUCT_TIER_KEYS.LIBRARY_LIVE_LOW_TOUCH],
    parent_name: parentName || email || phone || whatsapp || 'OneTime prospect',
    email,
    phone,
    whatsapp,
    student_name: String(input.student_name || input.studentName || input.learner_name || input.learnerName || '').trim(),
    student_age: input.student_age || input.studentAge || input.learner_age || input.learnerAge || null,
    student_grade: String(input.student_grade || input.studentGrade || input.learner_stage || input.learnerStage || '').trim(),
    timezone: String(input.timezone || '').trim(),
    preferred_class_format: String(input.preferred_class_format || input.preferredClassFormat || '').trim(),
    source_landing_page: String(input.source_landing_page || input.sourceLandingPage || input.route || '/one-time').trim(),
    consent: input.consent === true || /^(?:1|true|yes|on)$/i.test(String(input.consent || '')),
    notes: String(input.notes || input.message || '').trim(),
    status: normalizeOneTimeLeadStatus(input.status || 'new'),
    no_send: true,
    external_write_performed: false,
    metadata: input.metadata && typeof input.metadata === 'object' && !Array.isArray(input.metadata)
      ? input.metadata
      : {},
  };
}

function fixtureSefariaLookup(refs = []) {
  const normalizedRefs = Array.isArray(refs) ? refs : String(refs || '').split(/[,;\n]+/);
  return normalizedRefs
    .map((ref) => String(ref || '').trim())
    .filter(Boolean)
    .map((ref) => ({
      ref,
      title: ref,
      url: `https://www.sefaria.org/${encodeURIComponent(ref.replace(/\s+/g, '_'))}`,
      he: '',
      en: '',
      source: 'fixture',
      external_lookup_performed: false,
    }));
}

function buildSourcePrepDraft(input = {}) {
  const refs = fixtureSefariaLookup(input.requested_refs || input.refs || []);
  const prompt = String(input.natural_language_prompt || input.prompt || '').trim();
  const title = String(input.title || input.class_title || 'OneTime Mishnayos Source Prep').trim();
  const sourceSheetDraft = {
    status: 'drafting',
    title,
    prompt,
    refs,
    note: 'Fixture draft only. Human review is required before publishing.',
  };
  const worksheetDraft = {
    status: 'drafting',
    title: `${title} Worksheet`,
    questions: [
      'What is the core Mishnah question for this class?',
      'Which source best supports the main point?',
      'What should a student be able to explain back after class?',
    ],
  };
  const slidesOutline = {
    status: 'drafting',
    title: `${title} Slides`,
    slides: [
      { title: 'Opening Question', body: prompt || 'Frame the class question.' },
      { title: 'Inside the Mishnah', body: refs.length ? `Review ${refs.map((item) => item.ref).join(', ')}` : 'Add reviewed source references.' },
      { title: 'Takeaway', body: 'Summarize the class takeaway after Rabbi/admin review.' },
    ],
  };
  return {
    source_lookup_status: refs.length ? 'drafting' : 'not_started',
    worksheet_status: 'drafting',
    slides_status: 'drafting',
    approval_status: 'needs_review',
    visibility: 'admin_only',
    source_sheet_draft: sourceSheetDraft,
    worksheet_draft: worksheetDraft,
    slides_outline: slidesOutline,
    generated_artifacts: {
      external_write_performed: false,
      fixture_refs: refs.length,
      needs_human_review: true,
    },
    blockers: refs.length ? [] : ['requested_refs_missing_or_empty'],
    errors: [],
    external_write_performed: false,
  };
}

function cloneReadinessSections() {
  return ONE_TIME_PRODUCT_READINESS_SECTIONS.map((section) => ({
    section_key: section.section_key,
    title: section.title,
    status: section.items.some((item) => item.status === 'blocked_external_approval')
      ? 'blocked_external_approval'
      : section.items.some((item) => item.status === 'needs_operator_decision')
        ? 'needs_operator_decision'
        : section.items.some((item) => item.status === 'needs_live_data')
          ? 'needs_live_data'
          : 'local_contract_present',
    items: section.items.map((item) => ({ ...item })),
  }));
}

function oneTimeReadinessSummary(sections = []) {
  const counts = ONE_TIME_READINESS_STATUSES.reduce((memo, status) => {
    memo[status] = 0;
    return memo;
  }, {});
  let total = 0;
  for (const section of sections) {
    for (const item of section.items || []) {
      total += 1;
      if (counts[item.status] !== undefined) counts[item.status] += 1;
    }
  }
  return {
    total_checks: total,
    local_contract_present: counts.local_contract_present,
    needs_live_data: counts.needs_live_data,
    needs_operator_decision: counts.needs_operator_decision,
    blocked_external_approval: counts.blocked_external_approval,
  };
}

function oneTimeProductReadinessView({
  providers = [],
  schedules = [],
  calendar = {},
  tiers = [],
} = {}) {
  const providerRows = Array.isArray(providers) ? providers : [];
  const scheduleRows = Array.isArray(schedules) ? schedules : [];
  const tierRows = Array.isArray(tiers) ? tiers : [];
  const calendarEvents = Array.isArray(calendar?.events) ? calendar.events : [];
  const configuredProviders = providerRows.filter((provider) => provider?.configured === true || (
    provider?.enabled === true && provider?.secret_configured === true
  ));
  const checkoutConfiguredRows = tierRows.filter((tier) => tier?.checkout_enabled === true || tier?.checkout?.stripe_price_configured || tier?.checkout?.green_invoice_item_configured);
  const sections = cloneReadinessSections();
  const summary = oneTimeReadinessSummary(sections);
  return {
    requirement_id: 'REQ-20260619-306',
    status: 'needs_operator_decision',
    safe_local_only: true,
    no_external_write_performed: true,
    summary,
    observed_state: {
      provider_settings_loaded: providerRows.length,
      configured_provider_count: configuredProviders.length,
      schedule_rows_loaded: scheduleRows.length,
      calendar_events_loaded: calendarEvents.length,
      tier_rows_loaded: tierRows.length,
      checkout_configured_tier_count: checkoutConfiguredRows.length,
    },
    gates: {
      checkout_enabled: false,
      charges_enabled: false,
      invoices_enabled: false,
      payment_links_enabled: false,
      subscriptions_enabled: false,
      access_grant_automation_enabled: false,
      zoom_meeting_write_enabled: false,
      external_calendar_write_enabled: false,
      email_send_enabled: false,
      whatsapp_send_enabled: false,
      telegram_send_enabled: false,
      portal_publish_enabled: false,
      deploy_live_smoke_required: true,
    },
    blockers: [
      'operator_approval_required_for_live_release_and_smoke',
      'billing_provider_of_record_required_before_checkout',
      'refund_cancellation_and_failed_payment_policy_required',
      'approved_rabbi_schedule_and_booking_rules_required',
      'zoom_calendar_email_whatsapp_and_portal_publish_writes_require_explicit_approval',
    ],
    sections,
  };
}

module.exports = {
  ONE_TIME_PRODUCT_PROGRAM_KEY,
  ONE_TIME_CONTENT_ALIAS,
  ONE_TIME_PRODUCT_TIER_KEYS,
  ONE_TIME_COMPAT_TIER_KEYS,
  ONE_TIME_PRODUCT_TIER_KEY_VALUES,
  ONE_TIME_PRODUCT_TIER_DEFINITIONS,
  ONE_TIME_CANDIDATE_PRICING,
  ONE_TIME_REGIONS,
  ONE_TIME_AUDIENCES,
  ONE_TIME_VISIBILITIES,
  ONE_TIME_ARTIFACT_STATUSES,
  ONE_TIME_CALENDAR_VIEWS,
  ONE_TIME_DECISION_STATUSES,
  ONE_TIME_LEAD_STATUSES,
  ONE_TIME_DEFAULT_REGION_NOTES,
  ONE_TIME_READINESS_STATUSES,
  ONE_TIME_PRODUCT_READINESS_SECTIONS,
  normalizeOneTimeRegion,
  normalizeOneTimeTierKey,
  normalizeTierList,
  normalizeOneTimeVisibility,
  normalizeOneTimeArtifactStatus,
  normalizeOneTimeCalendarView,
  normalizeOneTimeLeadStatus,
  normalizeOneTimeAudience,
  normalizeCandidatePricing,
  oneTimeTierPlanningView,
  calendarRangeForView,
  validateOneTimeLead,
  fixtureSefariaLookup,
  buildSourcePrepDraft,
  oneTimeProductReadinessView,
};
