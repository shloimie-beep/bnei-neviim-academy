const crypto = require('crypto');
const { accessScopesForTier, normalizeRabbiTierKey } = require('./rabbi-products');

const RABBI_ACCESS_GRANT_STATUSES = Object.freeze(['active', 'revoked', 'expired', 'pending']);
const RABBI_LOGIN_TOKEN_PURPOSES = Object.freeze(['magic_link', 'session']);
const RABBI_LOGIN_TOKEN_STATUSES = Object.freeze(['active', 'used', 'revoked', 'expired']);

function normalizeGrantStatus(value, fallback = 'active') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return RABBI_ACCESS_GRANT_STATUSES.includes(normalized) ? normalized : fallback;
}

function normalizeLoginPurpose(value, fallback = 'magic_link') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return RABBI_LOGIN_TOKEN_PURPOSES.includes(normalized) ? normalized : fallback;
}

function normalizeLoginStatus(value, fallback = 'active') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  return RABBI_LOGIN_TOKEN_STATUSES.includes(normalized) ? normalized : fallback;
}

function grantScopesForTier(value) {
  return accessScopesForTier(normalizeRabbiTierKey(value));
}

function normalizeScopes(scopes = []) {
  const source = Array.isArray(scopes) ? scopes : String(scopes || '').split(/[,\s]+/);
  const allowed = new Set(['library', 'live']);
  return [...new Set(source.map((scope) => String(scope || '').trim().toLowerCase()).filter((scope) => allowed.has(scope)))];
}

function activeGrantScopes(grants = []) {
  const now = Date.now();
  const scopes = [];
  for (const grant of Array.isArray(grants) ? grants : []) {
    if (normalizeGrantStatus(grant.status) !== 'active') continue;
    if (grant.expires_at && new Date(grant.expires_at).getTime() <= now) continue;
    scopes.push(...normalizeScopes(grant.scopes || grant.access_scopes));
  }
  return [...new Set(scopes)];
}

function hasScope(grants, scope) {
  return activeGrantScopes(grants).includes(String(scope || '').trim().toLowerCase());
}

function generateLoginToken() {
  return `rabbi_${crypto.randomBytes(32).toString('hex')}`;
}

function hashLoginToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function publicMemberView(member = {}, grants = []) {
  const scopes = activeGrantScopes(grants);
  return {
    id: member.id ? Number(member.id) : null,
    display_name: member.display_name || '',
    email: member.email || '',
    phone: member.phone || '',
    access_scopes: scopes,
    has_library_access: scopes.includes('library'),
    has_live_access: scopes.includes('live'),
    access_pending: !scopes.length,
  };
}

module.exports = {
  RABBI_ACCESS_GRANT_STATUSES,
  RABBI_LOGIN_TOKEN_PURPOSES,
  RABBI_LOGIN_TOKEN_STATUSES,
  normalizeGrantStatus,
  normalizeLoginPurpose,
  normalizeLoginStatus,
  grantScopesForTier,
  normalizeScopes,
  activeGrantScopes,
  hasScope,
  generateLoginToken,
  hashLoginToken,
  publicMemberView,
};
