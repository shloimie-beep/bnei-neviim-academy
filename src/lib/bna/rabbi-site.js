const RABBI_PAGE_KEY = 'rabbi_landing';

function defaultRabbiLandingContent() {
  return {
    hero_title: 'One Time Mishnayos',
    hero_subtitle: 'A preview membership page for Rabbi Elie Scheller classes.',
    hero_note: 'Preview mode: checkout and member access can be tested without replacing the BNA public homepage.',
    image_placeholders: [
      'Rabbi teaching image',
      'Mishnayos library image',
      'Live class image',
    ],
    sections: [
      {
        title: 'Video Library',
        body: 'Recorded classes and source material, published after review.',
      },
      {
        title: 'Live + Library',
        body: 'Live Zoom access plus the recorded library when live membership is active.',
      },
    ],
  };
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
    title: row.title || 'One Time Mishnayos Preview',
    status: row.status || 'preview',
    allow_public_replacement: row.allow_public_replacement === true,
    approved_by: row.approved_by || '',
    approved_at: row.approved_at || null,
    content: row.content || defaultRabbiLandingContent(),
    metadata: row.metadata || {},
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

module.exports = {
  RABBI_PAGE_KEY,
  defaultRabbiLandingContent,
  publicReplacementAllowed,
  rabbiPageView,
};
