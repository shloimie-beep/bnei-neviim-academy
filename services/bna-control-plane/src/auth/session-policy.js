const crypto = require('node:crypto');

const COOKIE_NAME = '__Host-bna_cp_session';
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

function newSessionId() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashSessionId(sessionId, secret) {
  return crypto.createHmac('sha256', secret).update(sessionId).digest('hex');
}

function buildSessionCookie(sessionId) {
  return `${COOKIE_NAME}=${sessionId}; Secure; HttpOnly; SameSite=Strict; Path=/`;
}

function parseCookieHeader(header = '') {
  const result = {};
  for (const part of String(header).split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) continue;
    result[rawKey] = rest.join('=');
  }
  return result;
}

function extractControlPlaneSession(cookieHeader = '') {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[COOKIE_NAME] || '';
}

function productCookieCannotAuthenticate(cookieHeader = '') {
  const cookies = parseCookieHeader(cookieHeader);
  return !cookies[COOKIE_NAME];
}

function assertSessionFresh(session, now = Date.now()) {
  if (!session) throw Object.assign(new Error('missing session'), { code: 'session_missing' });
  if (now - new Date(session.last_seen_at).getTime() > IDLE_TIMEOUT_MS) throw Object.assign(new Error('session idle timeout'), { code: 'session_idle_timeout' });
  if (now - new Date(session.created_at).getTime() > ABSOLUTE_TIMEOUT_MS) throw Object.assign(new Error('session absolute timeout'), { code: 'session_absolute_timeout' });
  if (session.revoked_at) throw Object.assign(new Error('session revoked'), { code: 'session_revoked' });
  return true;
}

module.exports = {
  ABSOLUTE_TIMEOUT_MS,
  COOKIE_NAME,
  IDLE_TIMEOUT_MS,
  assertSessionFresh,
  buildSessionCookie,
  extractControlPlaneSession,
  hashSessionId,
  newSessionId,
  productCookieCannotAuthenticate,
};
