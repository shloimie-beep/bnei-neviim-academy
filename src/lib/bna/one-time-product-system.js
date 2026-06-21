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
const ONE_TIME_PRODUCT_OFFER_KEYS = Object.freeze(['membership_67_monthly', 'premium_masechta_intensive']);
const ONE_TIME_BILLING_MODELS = Object.freeze(['recurring_monthly', 'fixed_duration', 'upfront', 'weekly_installments']);
const ONE_TIME_ACCESS_STATES = Object.freeze([
  'pending',
  'active',
  'grace_period',
  'failed_payment',
  'past_due',
  'cancellation_requested',
  'cancelled',
  'refund_pending',
  'refunded',
  'completed',
  'expired',
]);
const ONE_TIME_AVAILABILITY_TYPES = Object.freeze([
  'recurring',
  'exception',
  'blackout',
  'masechta_window',
  'preparation_block',
  'follow_up_block',
]);
const ONE_TIME_APPOINTMENT_TYPES = Object.freeze([
  'consultation',
  'placement_call',
  'parent_progress_call',
  'student_progress_call',
  'office_hours',
]);
const ONE_TIME_APPOINTMENT_STATUSES = Object.freeze([
  'intent',
  'pending_parent_confirmation',
  'confirmed_internal',
  'reschedule_requested',
  'cancelled',
  'no_show',
  'completed',
]);

const ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS = Object.freeze({
  policy_key: 'one_time_warm_lead_intro_trial',
  policy_version: 'one-time-warm-lead-intro-trial-v1',
  offer_key: 'membership_67_monthly',
  trial_days: 30,
  renewal_amount_cents: 6700,
  currency: 'USD',
  billing_interval: 'month',
  card_required: true,
  one_intro_trial_per_household: true,
});

const ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS = Object.freeze({
  policy_key: 'one_time_referral_credit_after_first_paid_cycle',
  policy_version: 'one-time-referral-credit-v1',
  reward_type: 'manual_month_credit_candidate',
  reward_amount_cents: 6700,
  currency: 'USD',
  activation_trigger: 'first_successful_paid_cycle',
});

const ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS = Object.freeze({
  payment_policy_key: 'one_time_test_payment_to_access_v1',
  access_policy_key: 'one_time_approved_test_event_access_v1',
  class_link_policy_key: 'one_time_relationship_scoped_class_link_v1',
  required_paid_status: 'paid',
  required_provider_mode: 'test',
  required_access_source: 'approved_local_test_event',
  required_class_scope: 'live',
});

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
        note: 'Stripe, Green Invoice, or manual bridge must be explicitly approved before live billing.',
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
  {
    section_key: 'trial_referral_launch',
    title: 'Trial And Referral Launch',
    items: [
      {
        key: 'warm_lead_30_day_trial',
        label: '30-day warm-lead intro trial',
        status: 'local_contract_present',
        note: 'Default trial policy is modeled locally for the $67 monthly membership without creating a checkout session.',
      },
      {
        key: 'card_required_one_intro_trial',
        label: 'Card-required and one intro trial per household',
        status: 'local_contract_present',
        note: 'Policy rules require card collection and one intro trial per household when a live checkout path is approved.',
      },
      {
        key: 'policy_version_acceptance_storage',
        label: 'Policy-version acceptance storage',
        status: 'local_contract_present',
        note: 'Acceptance rows carry policy_key, policy_version, acceptance_key, actor/contact reference, accepted_at, source, and test-mode metadata.',
      },
      {
        key: 'referral_after_first_paid_cycle',
        label: 'Referral credit after first successful paid cycle',
        status: 'local_contract_present',
        note: 'Referral reward eligibility is manual-review only and activates only after trusted first paid-cycle evidence.',
      },
      {
        key: 'no_real_charge_or_invoice_credit',
        label: 'No real charge or invoice credit',
        status: 'blocked_external_approval',
        note: 'Checkout creation, live charges, payment links, and invoice credits remain disabled until billing/accounting approval and test checkout proof.',
      },
      {
        key: 'trial_referral_legal_wording',
        label: 'Trial and referral legal wording',
        status: 'needs_operator_decision',
        note: 'Public trial, renewal, card-required, referral, and credit wording must be approved before publication.',
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

function normalizeOneTimeProductOfferKey(value, fallback = 'membership_67_monthly') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  const aliases = {
    monthly: 'membership_67_monthly',
    monthly_membership: 'membership_67_monthly',
    membership: 'membership_67_monthly',
    sixty_seven: 'membership_67_monthly',
    '$67': 'membership_67_monthly',
    intensive: 'premium_masechta_intensive',
    masechta: 'premium_masechta_intensive',
    premium: 'premium_masechta_intensive',
  };
  const mapped = aliases[normalized] || normalized;
  return ONE_TIME_PRODUCT_OFFER_KEYS.includes(mapped) ? mapped : fallback;
}

function normalizeOneTimeBillingModel(value, fallback = 'recurring_monthly') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  const aliases = {
    monthly: 'recurring_monthly',
    recurring: 'recurring_monthly',
    fixed: 'fixed_duration',
    fixed_term: 'fixed_duration',
    pay_upfront: 'upfront',
    installments: 'weekly_installments',
    weekly: 'weekly_installments',
  };
  const mapped = aliases[normalized] || normalized;
  return ONE_TIME_BILLING_MODELS.includes(mapped) ? mapped : fallback;
}

function normalizeOneTimeAccessState(value, fallback = 'pending') {
  return normalizeEnum(value, ONE_TIME_ACCESS_STATES, fallback);
}

function normalizeOneTimeAvailabilityType(value, fallback = 'recurring') {
  return normalizeEnum(value, ONE_TIME_AVAILABILITY_TYPES, fallback);
}

function normalizeOneTimeAppointmentType(value, fallback = 'consultation') {
  return normalizeEnum(value, ONE_TIME_APPOINTMENT_TYPES, fallback);
}

function normalizeOneTimeAppointmentStatus(value, fallback = 'intent') {
  return normalizeEnum(value, ONE_TIME_APPOINTMENT_STATUSES, fallback);
}

function defaultOneTimeAccessPolicy() {
  return {
    state_keys: [...ONE_TIME_ACCESS_STATES],
    failed_payment_state: 'failed_payment',
    grace_period_state: 'grace_period',
    cancellation_state: 'cancellation_requested',
    refund_state: 'refund_pending',
    completion_state: 'completed',
    expiration_state: 'expired',
    automation_enabled: false,
    manual_review_required: true,
  };
}

function safePositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

function oneTimePolicyDecisionView(decisions = [], decisionKey = 'trial_referral_legal_wording') {
  const rows = Array.isArray(decisions) ? decisions : [];
  const match = rows.find((decision) => String(decision?.decision_key || decision?.decisionKey || '') === decisionKey) || {};
  return {
    decision_key: decisionKey,
    status: match.status || 'decision_pending',
    title: match.title || 'Approve trial and referral legal wording',
    question: match.question || 'What exact public trial, card-required, renewal, referral, and credit wording may One Time use?',
    context: match.context || 'Local implementation can store policy versions and acceptance records, but public/legal wording needs approval before publication.',
    needed_from: match.needed_from || 'Shloimie + legal/accounting owner',
    public_output_allowed: match.public_output_allowed === true,
    blocks_public_copy: match.status !== 'approved',
    blocks_local_configuration: false,
  };
}

function oneTimePolicyAcceptanceRecordView(row = {}) {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
  return {
    id: row.id ? Number(row.id) : null,
    policy_key: row.policy_key || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.policy_key,
    policy_version: row.policy_version || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.policy_version,
    acceptance_key: row.acceptance_key || row.acceptanceKey || '',
    contact_id: row.contact_id ? Number(row.contact_id) : null,
    member_id: row.member_id ? Number(row.member_id) : null,
    checkout_record_id: row.checkout_record_id ? Number(row.checkout_record_id) : null,
    accepted_by_name: row.accepted_by_name || '',
    accepted_by_email: row.accepted_by_email || '',
    accepted_at: row.accepted_at || null,
    source: row.source || 'test_local',
    test_mode: row.test_mode !== false,
    external_write_performed: row.external_write_performed === true,
    metadata,
  };
}

function buildOneTimePolicyAcceptanceStorageContract(rows = []) {
  const records = (Array.isArray(rows) ? rows : []).map(oneTimePolicyAcceptanceRecordView);
  return {
    table: 'bna_one_time_policy_acceptances',
    supported: true,
    test_local_mode_supported: true,
    policy_versions: [
      ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.policy_version,
      ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.policy_version,
    ],
    required_fields: [
      'project_id',
      'program_key',
      'policy_key',
      'policy_version',
      'acceptance_key',
      'accepted_by_name_or_email',
      'accepted_at',
      'source',
    ],
    records,
    record_count: records.length,
    live_public_acceptance_enabled: false,
    external_write_performed: false,
  };
}

function buildOneTimeLaunchTrialPolicy(input = {}) {
  const offer = input.offer && typeof input.offer === 'object' ? input.offer : {};
  const trialDays = safePositiveInteger(input.trial_days ?? input.trialDays, ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.trial_days);
  const renewalAmountCents = safePositiveInteger(
    input.renewal_amount_cents ?? input.renewalAmountCents ?? offer.price_amount_cents,
    ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.renewal_amount_cents,
  );
  const currency = String(input.currency || offer.currency || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.currency).toUpperCase();
  return {
    requirement_id: 'REQ-20260621-906',
    policy_key: input.policy_key || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.policy_key,
    policy_version: input.policy_version || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.policy_version,
    offer_key: input.offer_key || offer.offer_key || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.offer_key,
    status: 'local_contract_present',
    mode: 'test_local_only',
    trial_days: trialDays,
    renewal: {
      amount_cents: renewalAmountCents,
      display_amount: `${currency === 'USD' ? '$' : `${currency} `}${(renewalAmountCents / 100).toFixed(2)}`,
      currency,
      billing_interval: input.billing_interval || offer.billing_interval || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.billing_interval,
      starts_after_trial: true,
    },
    rules: {
      card_required: input.card_required !== undefined ? input.card_required === true : ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.card_required,
      one_intro_trial_per_household: input.one_intro_trial_per_household !== undefined
        ? input.one_intro_trial_per_household === true
        : ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.one_intro_trial_per_household,
      acceptance_required: true,
      household_match_keys: ['normalized_parent_email', 'normalized_parent_phone', 'normalized_student_name'],
    },
    acceptance: {
      policy_version: input.policy_version || ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.policy_version,
      required: true,
      storage_table: 'bna_one_time_policy_acceptances',
      records_are_test_local: true,
    },
    gates: {
      checkout_session_creation_enabled: false,
      live_charges_enabled: false,
      invoices_enabled: false,
      invoice_credit_enabled: false,
      payment_link_creation_enabled: false,
      access_grant_automation_enabled: false,
      external_write_performed: false,
    },
  };
}

function buildOneTimeReferralCreditPolicy(input = {}) {
  const rewardAmountCents = safePositiveInteger(
    input.reward_amount_cents ?? input.rewardAmountCents,
    ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.reward_amount_cents,
  );
  const currency = String(input.currency || ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.currency).toUpperCase();
  return {
    requirement_id: 'REQ-20260621-906',
    policy_key: input.policy_key || ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.policy_key,
    policy_version: input.policy_version || ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.policy_version,
    status: 'manual_review_required',
    mode: 'test_local_only',
    activation_trigger: ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.activation_trigger,
    reward: {
      type: input.reward_type || ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.reward_type,
      amount_cents: rewardAmountCents,
      display_amount: `${currency === 'USD' ? '$' : `${currency} `}${(rewardAmountCents / 100).toFixed(2)}`,
      currency,
      application_mode: 'manual_after_admin_review',
    },
    rules: {
      activate_only_after_first_successful_paid_cycle: true,
      self_referrals_allowed: false,
      one_reward_per_referred_member: true,
      duplicate_referrals_require_review: true,
      do_not_contact_and_failed_payment_suppression_required: true,
    },
    ledger: {
      referral_table: 'bna_one_time_referrals',
      credit_table: 'bna_one_time_referral_credits',
      idempotency_keys: [
        'referral_code',
        'referred_contact_or_member_id',
        'first_paid_cycle_event_id',
        'reward_policy_version',
      ],
    },
    gates: {
      automatic_credit_enabled: false,
      invoice_credit_enabled: false,
      real_invoice_credit_created: false,
      payment_provider_write_enabled: false,
      external_write_performed: false,
    },
  };
}

function oneTimeReferralRecordView(row = {}) {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
  return {
    id: row.id ? Number(row.id) : null,
    referral_code: row.referral_code || '',
    status: row.status || 'candidate',
    activation_status: row.activation_status || 'pending_first_paid_cycle',
    reward_status: row.reward_status || 'not_approved',
    reward_policy_version: row.reward_policy_version || ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS.policy_version,
    first_paid_cycle_event_id: row.first_paid_cycle_event_id || '',
    external_write_performed: row.external_write_performed === true,
    metadata,
  };
}

function buildOneTimeTrialReferralConfiguration({
  offers = [],
  decisions = [],
  acceptances = [],
  referrals = [],
} = {}) {
  const offerRows = Array.isArray(offers) ? offers : [];
  const monthlyOffer = offerRows.find((offer) => offer?.offer_key === ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS.offer_key) || {};
  const referralRows = (Array.isArray(referrals) ? referrals : []).map(oneTimeReferralRecordView);
  return {
    requirement_id: 'REQ-20260621-906',
    workspace_key: 'rabbi_sheller_provider',
    project_key: ONE_TIME_PRODUCT_PROGRAM_KEY,
    status: 'local_contract_present',
    mode: 'test_local_only',
    launch_trial: buildOneTimeLaunchTrialPolicy({ offer: monthlyOffer }),
    referral_credit: buildOneTimeReferralCreditPolicy(),
    acceptance_storage: buildOneTimePolicyAcceptanceStorageContract(acceptances),
    referral_records: referralRows,
    legal_wording_decision: oneTimePolicyDecisionView(decisions),
    guardrails: {
      live_charges_enabled: false,
      real_invoice_credits_enabled: false,
      checkout_creation_enabled: false,
      payment_link_creation_enabled: false,
      email_send_enabled: false,
      whatsapp_send_enabled: false,
      external_crm_write_enabled: false,
      external_write_performed: false,
    },
    blockers: [
      'legal_wording_decision_required_before_public_copy',
      'billing_provider_and_test_checkout_required_before_live_card_collection',
      'accounting_owner_approval_required_before_real_invoice_credit_or_reward',
    ],
  };
}

function oneTimeCheckoutRecordView(row = {}) {
  return {
    id: row.id ? Number(row.id) : null,
    member_id: row.member_id ? Number(row.member_id) : null,
    tier_key: normalizeOneTimeTierKey(row.tier_key || row.tierKey || 'library_live_low_touch'),
    provider: row.provider || 'manual',
    provider_mode: row.provider_mode || row.providerMode || 'test',
    status: row.status || 'pending',
    source: row.source || '',
    amount_cents: row.amount_cents === null || row.amount_cents === undefined ? null : Number(row.amount_cents),
    currency: row.currency || 'USD',
    paid_at: row.paid_at || null,
    external_write_performed: row.external_write_performed === true,
  };
}

function oneTimeAccessGrantRecordView(row = {}) {
  const scopes = Array.isArray(row.scopes)
    ? row.scopes
    : String(row.scopes || '').split(/[,;\s]+/);
  return {
    id: row.id ? Number(row.id) : null,
    member_id: row.member_id ? Number(row.member_id) : null,
    checkout_record_id: row.checkout_record_id ? Number(row.checkout_record_id) : null,
    payment_event_id: row.payment_event_id ? Number(row.payment_event_id) : null,
    tier_key: normalizeOneTimeTierKey(row.tier_key || row.tierKey || 'library_live_low_touch'),
    scopes: Array.from(new Set(scopes.map((scope) => String(scope || '').trim().toLowerCase()).filter(Boolean))),
    status: row.status || 'pending',
    source: row.source || '',
    starts_at: row.starts_at || null,
    expires_at: row.expires_at || null,
    external_write_performed: row.external_write_performed === true,
  };
}

function oneTimeClassLinkSessionView(row = {}) {
  const requiredScope = String(row.required_scope || row.requiredScope || ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_class_scope);
  const hasRawJoinUrl = Boolean(row.zoom_url || row.join_url || row.meeting_url);
  return {
    id: row.id ? Number(row.id) : null,
    title: row.title || '',
    status: row.status || 'scheduled',
    start_at: row.start_at || null,
    required_scope: requiredScope,
    relationship_scope: 'member_session_and_active_live_grant',
    protected_reference_required: true,
    raw_join_url_present_for_admin_setup: hasRawJoinUrl,
    raw_zoom_join_url_returned_to_member: false,
    zoom_host_start_url_returned: false,
    student_visible_url_returned: false,
  };
}

function buildOneTimePaymentAccessClassLinkConfiguration({
  checkouts = [],
  accessGrants = [],
  liveSessions = [],
} = {}) {
  const checkoutRows = (Array.isArray(checkouts) ? checkouts : []).map(oneTimeCheckoutRecordView);
  const grantRows = (Array.isArray(accessGrants) ? accessGrants : []).map(oneTimeAccessGrantRecordView);
  const sessionRows = (Array.isArray(liveSessions) ? liveSessions : []).map(oneTimeClassLinkSessionView);
  const paidCheckoutRows = checkoutRows.filter((checkout) => checkout.status === ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_paid_status);
  const testPaidCheckoutRows = paidCheckoutRows.filter((checkout) => checkout.provider_mode === ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_provider_mode || checkout.provider === 'manual');
  const activeGrantRows = grantRows.filter((grant) => grant.status === 'active');
  const liveScopedSessions = sessionRows.filter((session) => session.required_scope === ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_class_scope);
  return {
    requirement_id: 'REQ-20260621-907',
    workspace_key: 'rabbi_sheller_provider',
    project_key: ONE_TIME_PRODUCT_PROGRAM_KEY,
    status: 'local_contract_present',
    mode: 'test_local_only',
    payment_state: {
      policy_key: ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.payment_policy_key,
      required_status: ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_paid_status,
      required_provider_mode: ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_provider_mode,
      allowed_sources: ['stripe_test_webhook', 'green_invoice_test_webhook', 'manual_admin_test_override'],
      checkout_count: checkoutRows.length,
      paid_checkout_count: paidCheckoutRows.length,
      test_paid_checkout_count: testPaidCheckoutRows.length,
      live_charges_enabled: false,
      checkout_session_creation_enabled: false,
      payment_link_creation_enabled: false,
      external_write_performed: false,
    },
    access_gate: {
      policy_key: ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.access_policy_key,
      required_event: ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_access_source,
      approved_local_test_event_required: true,
      manual_admin_review_required: true,
      active_grant_count: activeGrantRows.length,
      grant_count: grantRows.length,
      automated_access_grants_enabled: false,
      real_access_grant_performed_by_this_flow: false,
      send_welcome_or_receipt_enabled: false,
      external_write_performed: false,
    },
    class_link_scope: {
      policy_key: ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.class_link_policy_key,
      relationship_scope: 'member_session_and_active_live_grant',
      member_session_required: true,
      active_live_grant_required: true,
      required_scope: ONE_TIME_PAYMENT_ACCESS_CLASS_LINK_DEFAULTS.required_class_scope,
      session_count: sessionRows.length,
      live_scoped_session_count: liveScopedSessions.length,
      raw_zoom_join_url_returned_to_members: false,
      zoom_host_start_url_returned: false,
      admin_notes_returned_to_members: false,
      protected_reference_required: true,
    },
    records: {
      checkouts: checkoutRows.slice(0, 25),
      access_grants: grantRows.slice(0, 25),
      class_link_sessions: sessionRows.slice(0, 25),
    },
    guardrails: {
      live_charges_enabled: false,
      checkout_session_creation_enabled: false,
      payment_link_creation_enabled: false,
      subscription_creation_enabled: false,
      invoice_credit_enabled: false,
      automated_access_grants_enabled: false,
      real_access_grant_performed_by_this_flow: false,
      raw_zoom_join_url_returned_to_members: false,
      zoom_host_start_url_returned: false,
      email_send_enabled: false,
      whatsapp_send_enabled: false,
      external_crm_write_enabled: false,
      external_write_performed: false,
    },
    blockers: [
      'trusted_test_payment_event_required_before_access_grant',
      'member_session_and_active_live_grant_required_before_class_link_visibility',
      'protected_join_reference_required_before_member_visible_class_link',
      'zoom_host_start_url_must_never_be_returned_to_members',
    ],
  };
}

function oneTimeProductOfferView(row = {}) {
  const offerKey = normalizeOneTimeProductOfferKey(row.offer_key || row.offerKey || row.key);
  const billingModel = normalizeOneTimeBillingModel(row.billing_model || row.billingModel, offerKey === 'premium_masechta_intensive' ? 'fixed_duration' : 'recurring_monthly');
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
  const defaultMonthly = offerKey === 'membership_67_monthly';
  return {
    id: row.id ? Number(row.id) : null,
    offer_key: offerKey,
    title: row.title || (defaultMonthly ? '$67 monthly membership' : 'Premium Masechta intensive'),
    billing_model: billingModel,
    price_amount_cents: row.price_amount_cents === null || row.price_amount_cents === undefined
      ? (defaultMonthly ? 6700 : null)
      : Number(row.price_amount_cents),
    currency: row.currency || 'USD',
    price_status: row.price_status || (defaultMonthly ? 'candidate_pending_approval' : 'decision_pending'),
    duration_weeks: row.duration_weeks === null || row.duration_weeks === undefined ? null : Number(row.duration_weeks),
    upfront_payment_supported: row.upfront_payment_supported === true || metadata.upfront_payment_supported === true || offerKey === 'premium_masechta_intensive',
    weekly_installments_supported: row.weekly_installments_supported === true || metadata.weekly_installments_supported === true || offerKey === 'premium_masechta_intensive',
    access_entitlements: normalizeTierList(row.access_entitlements || metadata.access_entitlements || (defaultMonthly ? ['library_live_low_touch'] : ['interactive_zoom', 'vip_high_touch'])),
    access_policy: {
      ...defaultOneTimeAccessPolicy(),
      ...(metadata.access_policy && typeof metadata.access_policy === 'object' ? metadata.access_policy : {}),
    },
    checkout_enabled: false,
    payment_links_enabled: false,
    access_automation_enabled: false,
    requires_operator_decision: true,
    no_live_billing_write: true,
    no_access_grant_performed: true,
    metadata,
  };
}

function buildOneTimeProductOfferCatalog(rows = []) {
  const mapped = new Map((Array.isArray(rows) ? rows : []).map((row) => {
    const offer = oneTimeProductOfferView(row);
    return [offer.offer_key, offer];
  }));
  for (const key of ONE_TIME_PRODUCT_OFFER_KEYS) {
    if (!mapped.has(key)) mapped.set(key, oneTimeProductOfferView({ offer_key: key }));
  }
  return [...mapped.values()];
}

function oneTimeAvailabilityRuleView(row = {}) {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
  return {
    id: row.id ? Number(row.id) : null,
    rule_key: row.rule_key || row.ruleKey || 'israel_7pm_recurring',
    rule_type: normalizeOneTimeAvailabilityType(row.rule_type || row.ruleType),
    title: row.title || 'Rabbi availability rule',
    timezone: row.timezone || 'Asia/Jerusalem',
    days_of_week: Array.isArray(row.days_of_week) ? row.days_of_week : String(row.days_of_week || 'review_needed').split(/[,\s]+/).filter(Boolean),
    start_time_local: row.start_time_local || '19:00',
    duration_minutes: Number(row.duration_minutes || 60),
    capacity_min: row.capacity_min === null || row.capacity_min === undefined ? null : Number(row.capacity_min),
    capacity_max: row.capacity_max === null || row.capacity_max === undefined ? null : Number(row.capacity_max),
    masechta: row.masechta || metadata.masechta || '',
    window_start: row.window_start || metadata.window_start || null,
    window_end: row.window_end || metadata.window_end || null,
    prep_block_minutes: Number(row.prep_block_minutes || metadata.prep_block_minutes || 0),
    follow_up_block_minutes: Number(row.follow_up_block_minutes || metadata.follow_up_block_minutes || 0),
    status: row.status || 'draft',
    cancellation_policy: row.cancellation_policy || metadata.cancellation_policy || 'operator_decision_required',
    reschedule_policy: row.reschedule_policy || metadata.reschedule_policy || 'operator_decision_required',
    makeup_policy: row.makeup_policy || metadata.makeup_policy || 'operator_decision_required',
    external_calendar_write_enabled: false,
    zoom_meeting_write_enabled: false,
    metadata,
  };
}

function buildOneTimeAvailabilityFoundation(rows = []) {
  const items = Array.isArray(rows) && rows.length
    ? rows.map(oneTimeAvailabilityRuleView)
    : [
      oneTimeAvailabilityRuleView({
        rule_key: 'israel_7pm_recurring',
        rule_type: 'recurring',
        title: 'Rabbi Ellie Scheller 7:00 PM Israel class window',
        days_of_week: ['review_needed'],
        start_time_local: '19:00',
        duration_minutes: 60,
        prep_block_minutes: 30,
        follow_up_block_minutes: 15,
      }),
      oneTimeAvailabilityRuleView({
        rule_key: 'masechta_window_placeholder',
        rule_type: 'masechta_window',
        title: 'Premium Masechta intensive window',
        days_of_week: ['operator_decision_required'],
        start_time_local: '19:00',
        duration_minutes: 60,
      }),
    ];
  return {
    requirement_id: 'REQ-20260619-306',
    timezone: 'Asia/Jerusalem',
    rules: items,
    exceptions_supported: true,
    blackout_dates_supported: true,
    masechta_windows_supported: true,
    preparation_blocks_supported: true,
    follow_up_blocks_supported: true,
    cancellations_supported: true,
    rescheduling_supported: true,
    makeup_classes_supported: true,
    external_write_performed: false,
  };
}

function oneTimeAppointmentIntentView(row = {}) {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
  return {
    id: row.id ? Number(row.id) : null,
    appointment_type: normalizeOneTimeAppointmentType(row.appointment_type || row.appointmentType),
    status: normalizeOneTimeAppointmentStatus(row.status),
    parent_name: row.parent_name || row.parentName || '',
    parent_email: row.parent_email || row.parentEmail || '',
    student_name: row.student_name || row.studentName || '',
    starts_at: row.starts_at || row.startsAt || null,
    duration_minutes: Number(row.duration_minutes || row.durationMinutes || 30),
    buffer_minutes: Number(row.buffer_minutes || row.bufferMinutes || 10),
    booking_window_days: Number(row.booking_window_days || row.bookingWindowDays || 30),
    cancellation_cutoff_hours: Number(row.cancellation_cutoff_hours || row.cancellationCutoffHours || 24),
    entitlement_required: row.entitlement_required === true || metadata.entitlement_required === true,
    payment_required: row.payment_required === true || metadata.payment_required === true,
    parent_confirmation_required: row.parent_confirmation_required !== false,
    reminders_enabled: false,
    zoom_meeting_created: false,
    external_calendar_write_performed: false,
    private_notes: row.private_notes || row.privateNotes || '',
    parent_visible_summary: row.parent_visible_summary || row.parentVisibleSummary || '',
    metadata,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

function defaultOneTimeAppointmentTypes() {
  return ONE_TIME_APPOINTMENT_TYPES.map((type) => oneTimeAppointmentIntentView({
    appointment_type: type,
    status: 'intent',
    duration_minutes: type === 'office_hours' ? 45 : 30,
    buffer_minutes: 10,
    metadata: { template_only: true },
  }));
}

function buildOneTimePortalFoundations({ calendar = {}, offers = [], appointmentIntents = [], libraryItems = [] } = {}) {
  const events = Array.isArray(calendar?.events) ? calendar.events : [];
  const offerRows = Array.isArray(offers) ? offers : [];
  const appointmentRows = Array.isArray(appointmentIntents) ? appointmentIntents : [];
  const libraryRows = Array.isArray(libraryItems) ? libraryItems : [];
  const shared = {
    scoped_project_key: ONE_TIME_PRODUCT_PROGRAM_KEY,
    no_bna_student_data_by_default: true,
    no_live_billing_write: true,
    no_zoom_meeting_created: true,
    external_write_performed: false,
  };
  return {
    parent: {
      ...shared,
      sections: [
        'next_class',
        'calendar',
        'attendance_lateness',
        'current_masechta_perek_mishnah',
        'progress',
        'weekly_update',
        'recordings_watch_progress',
        'assignments_badges',
        'rabbi_feedback',
        'consultation_booking',
        'membership_billing_access_status',
      ],
      loaded_counts: {
        calendar_events: events.length,
        offers: offerRows.length,
        appointment_intents: appointmentRows.length,
        library_items: libraryRows.length,
      },
    },
    student: {
      ...shared,
      sections: [
        'next_class',
        'calendar',
        'secure_join_class_gated',
        'current_learning_unit',
        'progress_assignments',
        'recordings_continue_watching',
        'review_plan_badges',
        'community_private_questions',
        'reviewed_rabbi_feedback',
      ],
      join_class_enabled: false,
      join_class_blocker: 'Zoom meeting and entitlement validation are required before exposing a join URL.',
    },
    provider: {
      ...shared,
      sections: [
        'schedule',
        'availability',
        'classes_members',
        'attendance_curriculum',
        'weekly_updates_questions',
        'media_transcript_review',
        'publication_approval_badges',
        'consultations_parent_communication',
      ],
      provider_actions_enabled: true,
      external_send_enabled: false,
    },
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
  ONE_TIME_PRODUCT_OFFER_KEYS,
  ONE_TIME_BILLING_MODELS,
  ONE_TIME_ACCESS_STATES,
  ONE_TIME_AVAILABILITY_TYPES,
  ONE_TIME_APPOINTMENT_TYPES,
  ONE_TIME_APPOINTMENT_STATUSES,
  ONE_TIME_LAUNCH_TRIAL_POLICY_DEFAULTS,
  ONE_TIME_REFERRAL_CREDIT_POLICY_DEFAULTS,
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
  normalizeOneTimeProductOfferKey,
  normalizeOneTimeBillingModel,
  normalizeOneTimeAccessState,
  normalizeOneTimeAvailabilityType,
  normalizeOneTimeAppointmentType,
  normalizeOneTimeAppointmentStatus,
  normalizeCandidatePricing,
  oneTimeTierPlanningView,
  oneTimeProductOfferView,
  buildOneTimeProductOfferCatalog,
  oneTimeAvailabilityRuleView,
  buildOneTimeAvailabilityFoundation,
  oneTimeAppointmentIntentView,
  defaultOneTimeAppointmentTypes,
  buildOneTimePortalFoundations,
  calendarRangeForView,
  validateOneTimeLead,
  fixtureSefariaLookup,
  buildSourcePrepDraft,
  oneTimePolicyAcceptanceRecordView,
  buildOneTimePolicyAcceptanceStorageContract,
  buildOneTimeLaunchTrialPolicy,
  buildOneTimeReferralCreditPolicy,
  oneTimeReferralRecordView,
  buildOneTimeTrialReferralConfiguration,
  oneTimeCheckoutRecordView,
  oneTimeAccessGrantRecordView,
  oneTimeClassLinkSessionView,
  buildOneTimePaymentAccessClassLinkConfiguration,
  oneTimeProductReadinessView,
};
