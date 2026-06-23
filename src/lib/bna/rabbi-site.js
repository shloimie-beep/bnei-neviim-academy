const RABBI_PAGE_KEY = 'rabbi_landing';
const RABBI_DEFAULT_TITLE = 'OneTimeOneTime - Rabbi Eli Scheller';
const LEGACY_RABBI_TITLES = new Set([
  'One Time Mishnayos Preview',
  'One Time Mishnayos',
]);

function defaultRabbiLandingContent() {
  return {
    hero_title: 'OneTimeOneTime',
    hero_subtitle: 'Stories, Mishnayos learning, and moderated group calls for children, now wired as a BNA service-provider landing and membership preview.',
    hero_note: 'Preview mode only. The BNA homepage is not replaced.',
    image_placeholders: [
      'OneTimeOneTime hero preview',
      'Mishnayos library preview',
      'Moderated live group call preview',
    ],
    sections: [
      {
        title: 'Video Library',
        body: 'Recorded OneTime Mishnayos library access.',
      },
      {
        title: 'Live + Library',
        body: 'Live class access plus the recorded OneTime Mishnayos library.',
      },
    ],
  };
}

function normalizeRabbiLandingContent(content = {}) {
  const defaults = defaultRabbiLandingContent();
  const normalized = content && typeof content === 'object'
    ? { ...defaults, ...content }
    : { ...defaults };
  if (
    !normalized.hero_title
    || normalized.hero_title === 'One Time Mishnayos'
    || normalized.hero_title === 'One Time Mishnayos Preview'
  ) {
    normalized.hero_title = defaults.hero_title;
  }
  if (
    !normalized.hero_subtitle
    || normalized.hero_subtitle === 'A preview membership page for Rabbi Elie Scheller classes.'
    || normalized.hero_subtitle === 'Preview membership page for Rabbi Elie Scheller classes.'
  ) {
    normalized.hero_subtitle = defaults.hero_subtitle;
  }
  if (
    !normalized.hero_note
    || normalized.hero_note === 'Preview mode: checkout and member access can be tested without replacing the BNA public homepage.'
    || normalized.hero_note === 'Preview mode only. This does not replace the BNA homepage.'
  ) {
    normalized.hero_note = defaults.hero_note;
  }
  return normalized;
}

function publicReplacementAllowed({ page = {}, env = process.env } = {}) {
  return page.status === 'approved'
    && page.allow_public_replacement === true
    && String(env.RABBI_ALLOW_PUBLIC_REPLACEMENT || '').toLowerCase() === 'true';
}

function rabbiPageView(row = {}) {
  return {
    id: row.id ? Number(row.id) : null,
    page_key: row.page_key || RABBI_PAGE_KEY,
    route_path: row.route_path || '/rabbi',
    title: !row.title || LEGACY_RABBI_TITLES.has(row.title) ? RABBI_DEFAULT_TITLE : row.title,
    status: row.status || 'preview',
    allow_public_replacement: row.allow_public_replacement === true,
    approved_by: row.approved_by || '',
    approved_at: row.approved_at || null,
    content: normalizeRabbiLandingContent(row.content),
    metadata: row.metadata || {},
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

module.exports = {
  RABBI_PAGE_KEY,
  RABBI_DEFAULT_TITLE,
  defaultRabbiLandingContent,
  normalizeRabbiLandingContent,
  publicReplacementAllowed,
  rabbiPageView,
};
