const crypto = require('node:crypto');

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeUrl(input, baseUrl = 'https://bneineviimacademy.org') {
  try {
    const url = new URL(input || '/', baseUrl);
    url.hash = normalizeHash(url.hash);
    const params = [...url.searchParams.entries()]
      .filter(([key, value]) => !/^(_|cache|cb|t|ts|timestamp|nonce|utm_)/i.test(key) && value !== '')
      .sort(([a], [b]) => a.localeCompare(b));
    url.search = '';
    for (const [key, value] of params) url.searchParams.append(key, value);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

function normalizeHash(hash) {
  const value = String(hash || '').trim();
  if (!value || value === '#') return '';
  return value.replace(/[?&](_|cache|cb|t|ts|timestamp|nonce)=[^&]*/gi, '');
}

function slugify(value, fallback = 'state') {
  const slug = normalizeWhitespace(value)
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || fallback;
}

function stableHash(parts) {
  return crypto.createHash('sha1').update(JSON.stringify(parts)).digest('hex').slice(0, 12);
}

function buildStateFingerprint(input = {}) {
  const activeLabels = Array.isArray(input.activeLabels) ? input.activeLabels.map(normalizeWhitespace).filter(Boolean).sort() : [];
  const headings = Array.isArray(input.majorHeadings) ? input.majorHeadings.map(normalizeWhitespace).filter(Boolean).slice(0, 12) : [];
  const parts = {
    url: normalizeUrl(input.url || '/', input.baseUrl),
    title: normalizeWhitespace(input.title).toLowerCase(),
    mainHeading: normalizeWhitespace(input.mainHeading).toLowerCase(),
    module: normalizeWhitespace(input.module).toLowerCase(),
    activeLabels,
    workspace: normalizeWhitespace(input.workspace).toLowerCase(),
    role: normalizeWhitespace(input.role).toLowerCase(),
    modal: normalizeWhitespace(input.modal).toLowerCase(),
    headings,
  };
  return stableHash(parts);
}

function buildStateSlug(state = {}) {
  const pieces = [
    state.module,
    state.activeLabels && state.activeLabels[0],
    state.workspace,
    state.mainHeading,
    state.route,
  ].filter(Boolean);
  return slugify(pieces.join(' '), 'operations');
}

function screenshotFilename(index, state, viewportName, type = 'full') {
  const number = String(index).padStart(3, '0');
  const suffix = type === 'viewport' ? '-viewport' : '';
  return `${number}-${buildStateSlug(state)}${suffix}.png`.replace(/-+/g, '-');
}

module.exports = {
  buildStateFingerprint,
  buildStateSlug,
  normalizeUrl,
  normalizeWhitespace,
  screenshotFilename,
  slugify,
  stableHash,
};
