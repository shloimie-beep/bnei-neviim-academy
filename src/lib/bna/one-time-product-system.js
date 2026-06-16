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
};
