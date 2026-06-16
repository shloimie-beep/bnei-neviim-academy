const PROVIDER_CATEGORY_SEEDS = [
  { slug: 'tutoring', name: 'Tutoring', description: 'Academic and homework support for students.' },
  { slug: 'chugim-classes', name: 'Chugim / Classes', description: 'Classes, groups, and recurring enrichment programs.' },
  { slug: 'coaching', name: 'Coaching', description: 'Student, parent, learning, and executive-function coaching.' },
  { slug: 'therapy-support', name: 'Therapy / Support', description: 'Therapy-adjacent and support services for families.' },
  { slug: 'rabbeim-shiurim', name: 'Rabbeim / Shiurim', description: 'Torah learning, rabbeim, shiurim, and chavrusah-style programs.' },
  { slug: 'extracurricular', name: 'Extracurricular', description: 'Activities outside core school subjects.' },
  { slug: 'camps-programs', name: 'Camps / Programs', description: 'Seasonal camps, programs, and structured experiences.' },
  { slug: 'family-services', name: 'Family Services', description: 'Family-facing services and practical supports.' },
];

const PROVIDER_CATEGORY_ALIASES = {
  chugim: 'chugim-classes',
  chug: 'chugim-classes',
  classes: 'chugim-classes',
  class: 'chugim-classes',
  course: 'chugim-classes',
  courses: 'chugim-classes',
  learning: 'tutoring',
  tutor: 'tutoring',
  tutors: 'tutoring',
  therapy: 'therapy-support',
  therapist: 'therapy-support',
  support: 'therapy-support',
  emotional: 'therapy-support',
  ot: 'therapy-support',
  speech: 'therapy-support',
  rabbi: 'rabbeim-shiurim',
  rebbe: 'rabbeim-shiurim',
  rabbeim: 'rabbeim-shiurim',
  shiur: 'rabbeim-shiurim',
  shiurim: 'rabbeim-shiurim',
  torah: 'rabbeim-shiurim',
  mishnah: 'rabbeim-shiurim',
  gemara: 'rabbeim-shiurim',
  extracurriculars: 'extracurricular',
  activity: 'extracurricular',
  activities: 'extracurricular',
  camp: 'camps-programs',
  camps: 'camps-programs',
  program: 'camps-programs',
  programs: 'camps-programs',
  family: 'family-services',
  families: 'family-services',
};

const PROVIDER_OFFERING_TYPES = new Set(['service', 'class', 'course', 'free_course', 'free_offer', 'shiur', 'program']);
const PROVIDER_PUBLIC_STATUSES = new Set(['approved']);
const PROVIDER_HIDDEN_STATUSES = new Set(['draft', 'pending', 'pending_review', 'hidden', 'paused', 'rejected', 'archived']);
const PROVIDER_UPSELL_OPTIONS = [
  'marketing_help',
  'ads',
  'seo',
  'improved_website_funnel',
  'premium_listing',
];

function slugifyProviderName(value = '', fallback = 'provider') {
  const raw = String(value || '').trim().toLowerCase();
  const ascii = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const slug = ascii
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 90);
  return slug || fallback;
}

function normalizeProviderLanguages(value) {
  const items = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[,;\n|]+/)
      .map((item) => item.trim());
  return [...new Set(items
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, ' '))
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1)))];
}

function normalizeCategorySlugs(value) {
  const seedSlugs = new Set(PROVIDER_CATEGORY_SEEDS.map((category) => category.slug));
  const items = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[,;\n|]+/)
      .map((item) => item.trim());
  return [...new Set(items
    .map((item) => slugifyProviderName(item, ''))
    .map((slug) => PROVIDER_CATEGORY_ALIASES[slug] || slug)
    .filter((slug) => seedSlugs.has(slug)))];
}

function normalizeProviderImages(value) {
  const items = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/\r?\n/)
      .map((item) => item.trim());
  return [...new Set(items
    .map((item) => {
      if (typeof item === 'string') return { image_url: item.trim(), alt_text: '' };
      return {
        image_url: String(item?.image_url || item?.url || '').trim(),
        alt_text: String(item?.alt_text || item?.alt || '').trim(),
      };
    })
    .filter((item) => /^https?:\/\//i.test(item.image_url) || item.image_url.startsWith('/uploads/') || item.image_url.startsWith('/images/'))
    .map((item) => JSON.stringify(item)))]
    .map((item) => JSON.parse(item));
}

function normalizeProviderOfferings(value, fallback = {}) {
  const rawItems = Array.isArray(value) ? value : [];
  const textFallback = String(fallback.services_offered || fallback.service_description || fallback.description || '').trim();
  const items = rawItems.length ? rawItems : textFallback ? [{
    title: fallback.service_title || fallback.category || fallback.display_name || 'Provider service',
    description: textFallback,
    offering_type: fallback.offering_type || fallback.service_type || 'service',
    is_free: Boolean(fallback.is_free || /\bfree\b/i.test(textFallback)),
    schedule_text: fallback.schedule_text || '',
    age_range: fallback.age_range || '',
    language: fallback.language || '',
    signup_url: fallback.signup_url || fallback.website_url || '',
    price_text: fallback.price_text || fallback.pricing_structure || '',
  }] : [];

  return items
    .map((item) => {
      const title = String(item?.title || item?.name || item?.service_title || '').trim();
      const type = slugifyProviderName(item?.offering_type || item?.type || item?.service_type || 'service', 'service').replace(/-/g, '_');
      return {
        title,
        description: String(item?.description || item?.body || '').trim(),
        offering_type: PROVIDER_OFFERING_TYPES.has(type) ? type : 'service',
        is_free: Boolean(item?.is_free || item?.free || type.startsWith('free_')),
        price_text: String(item?.price_text || item?.price || '').trim(),
        age_range: String(item?.age_range || item?.ages || '').trim(),
        schedule_text: String(item?.schedule_text || item?.schedule || '').trim(),
        location_label: String(item?.location_label || item?.location || '').trim(),
        language: String(item?.language || '').trim(),
        signup_url: String(item?.signup_url || item?.url || '').trim(),
        category_slug: normalizeCategorySlugs(item?.category || item?.category_slug || item?.categorySlug)[0] || '',
      };
    })
    .filter((item) => item.title);
}

function providerCompleteness(provider = {}, categories = [], offerings = [], images = []) {
  const contactPresent = Boolean(provider.email || provider.contact_email || provider.phone || provider.contact_phone || provider.whatsapp || provider.whatsapp_phone);
  const locationPresent = Boolean(provider.location_label || provider.service_area || provider.city || provider.neighborhood);
  const descriptionPresent = Boolean(provider.short_description || provider.about || provider.full_description || provider.public_notes);
  const photoPresent = Boolean(provider.profile_photo_url || provider.profile_image_url || provider.hero_image_url || images.length);
  const checks = [
    { key: 'display_name', ok: Boolean(provider.display_name || provider.provider_name), weight: 15 },
    { key: 'contact', ok: contactPresent, weight: 15 },
    { key: 'category', ok: categories.length > 0, weight: 15 },
    { key: 'location', ok: locationPresent, weight: 12 },
    { key: 'language', ok: normalizeProviderLanguages(provider.languages || provider.language).length > 0, weight: 12 },
    { key: 'description', ok: descriptionPresent, weight: 16 },
    { key: 'offering', ok: offerings.length > 0, weight: 15 },
    { key: 'image', ok: photoPresent, weight: 0 },
  ];
  const score = checks.reduce((sum, item) => sum + (item.ok ? item.weight : 0), 0);
  return {
    score: Math.max(0, Math.min(100, score)),
    missing: checks.filter((item) => !item.ok && item.weight > 0).map((item) => item.key),
    recommended: photoPresent ? [] : ['image'],
  };
}

function isPublicProviderStatus(status) {
  return PROVIDER_PUBLIC_STATUSES.has(String(status || '').toLowerCase());
}

function isHiddenProviderStatus(status) {
  return PROVIDER_HIDDEN_STATUSES.has(String(status || '').toLowerCase());
}

function normalizeProviderSignupPayload(body = {}) {
  const displayName = String(body.display_name || body.displayName || body.provider_name || body.providerName || body.business_name || body.businessName || body.name || '').trim();
  const contactName = String(body.contact_name || body.contactName || body.name || '').trim();
  const email = String(body.email || body.contact_email || body.contactEmail || '').trim().toLowerCase();
  const phone = String(body.phone || body.contact_phone || body.contactPhone || '').trim();
  const whatsapp = String(body.whatsapp || body.whatsapp_phone || body.whatsappPhone || phone || '').trim();
  const categories = normalizeCategorySlugs(body.categories || body.category_slugs || body.category || body.service_category || body.serviceCategory);
  const languages = normalizeProviderLanguages(body.languages || body.language);
  const profilePhotoUrl = String(body.profile_photo_url || body.profilePhotoUrl || body.profile_image_url || body.profileImageUrl || '').trim();
  const galleryImages = normalizeProviderImages(body.gallery_image_urls || body.galleryImageUrls || body.images || body.gallery || '');
  const offerings = normalizeProviderOfferings(body.offerings || body.services || [], {
    display_name: displayName,
    category: categories[0] || body.category || body.service_category || '',
    services_offered: body.services_offered || body.servicesOffered || body.program_description || body.service_description || body.description || '',
    service_title: body.service_title || body.serviceTitle || body.program_title || body.programTitle || '',
    service_type: body.service_type || body.serviceType || '',
    age_range: body.age_range || body.ageRange || body.ages_served || body.agesServed || '',
    language: languages[0] || '',
    website_url: body.website_url || body.websiteUrl || body.website || '',
    pricing_structure: body.pricing_structure || body.pricingStructure || '',
  });
  return {
    display_name: displayName,
    contact_name: contactName,
    email,
    phone,
    whatsapp,
    website_url: String(body.website_url || body.websiteUrl || body.website || '').trim(),
    profile_photo_url: profilePhotoUrl,
    hero_image_url: String(body.hero_image_url || body.heroImageUrl || '').trim(),
    short_description: String(body.short_description || body.shortDescription || body.headline || body.program_description || body.service_description || body.description || '').trim(),
    about: String(body.about || body.full_description || body.fullDescription || body.bio || body.services_offered || body.servicesOffered || '').trim(),
    categories,
    languages,
    location_label: String(body.location_label || body.locationLabel || body.location || body.service_area || body.serviceArea || '').trim(),
    city: String(body.city || '').trim(),
    neighborhood: String(body.neighborhood || '').trim(),
    service_area: String(body.service_area || body.serviceArea || body.location || '').trim(),
    service_area_json: body.service_area_json || body.serviceAreaJson || {},
    publish_contact: Boolean(body.publish_contact || body.publishContact),
    gallery_images: galleryImages,
    offerings,
    notes: String(body.notes || '').trim(),
    private_admin_notes: String(body.private_admin_notes || body.privateAdminNotes || '').trim(),
    source_context: body.source_context || body.sourceContext || {},
    raw_intake: String(body.raw_intake || body.rawIntake || body.intake_text || body.intakeText || '').trim(),
  };
}

function providerMatchesPublicFilters(provider = {}, filters = {}) {
  if (!isPublicProviderStatus(provider.status)) return false;
  if (provider.public_listing_enabled === false) return false;
  if (filters.category) {
    const categorySlugs = new Set((provider.categories || []).map((item) => item.slug || item.category_slug || item));
    if (!categorySlugs.has(filters.category)) return false;
  }
  if (filters.language) {
    const language = String(filters.language || '').toLowerCase();
    if (!(provider.languages || []).some((item) => String(item || '').toLowerCase() === language)) return false;
  }
  if (filters.location) {
    const location = String(filters.location || '').toLowerCase();
    const haystack = [provider.location_label, provider.city, provider.neighborhood, provider.service_area].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(location)) return false;
  }
  if (filters.q) {
    const q = String(filters.q || '').toLowerCase();
    const haystack = [
      provider.display_name,
      provider.provider_name,
      provider.short_description,
      provider.about,
      provider.service_area,
      ...(provider.categories || []).map((item) => item.name || item.slug || ''),
      ...(provider.offerings || []).map((item) => `${item.title || ''} ${item.description || ''}`),
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function sanitizeProviderForPublic(provider = {}) {
  const publishContact = provider.publish_contact === true;
  return {
    id: provider.id,
    slug: provider.slug,
    display_name: provider.display_name || provider.provider_name,
    short_description: provider.short_description || '',
    about: provider.about || provider.full_description || '',
    website_url: provider.website_url || '',
    profile_photo_url: provider.profile_photo_url || provider.profile_image_url || '',
    hero_image_url: provider.hero_image_url || '',
    is_featured: Boolean(provider.is_featured),
    languages: normalizeProviderLanguages(provider.languages),
    location_label: provider.location_label || provider.service_area || provider.city || '',
    city: provider.city || '',
    neighborhood: provider.neighborhood || '',
    service_area: provider.service_area || '',
    categories: provider.categories || [],
    images: provider.images || [],
    offerings: provider.offerings || [],
    contact_name: publishContact ? provider.contact_name || '' : '',
    email: publishContact ? provider.email || provider.contact_email || '' : '',
    phone: publishContact ? provider.phone || provider.contact_phone || '' : '',
    whatsapp: publishContact ? provider.whatsapp || provider.whatsapp_phone || '' : '',
    publish_contact: publishContact,
    profile_completeness: provider.profile_completeness || 0,
    upgrade: provider.upgrade || null,
    seo_title: provider.seo_title || '',
    seo_description: provider.seo_description || '',
    created_at: provider.created_at || null,
    updated_at: provider.updated_at || null,
  };
}

module.exports = {
  PROVIDER_CATEGORY_SEEDS,
  PROVIDER_OFFERING_TYPES,
  PROVIDER_UPSELL_OPTIONS,
  isHiddenProviderStatus,
  isPublicProviderStatus,
  normalizeCategorySlugs,
  normalizeProviderImages,
  normalizeProviderLanguages,
  normalizeProviderOfferings,
  normalizeProviderSignupPayload,
  providerCompleteness,
  providerMatchesPublicFilters,
  sanitizeProviderForPublic,
  slugifyProviderName,
};
