const crypto = require('node:crypto');

function createCsrfToken(sessionId, secret = 'synthetic-test-csrf-secret') {
  const nonce = crypto.randomBytes(16).toString('base64url');
  const mac = crypto.createHmac('sha256', secret).update(`${sessionId}:${nonce}`).digest('base64url');
  return `${nonce}.${mac}`;
}

function verifyCsrfToken(sessionId, token, secret = 'synthetic-test-csrf-secret') {
  const [nonce, mac] = String(token || '').split('.');
  if (!nonce || !mac) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${sessionId}:${nonce}`).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function assertCsrf({ sessionId, token, origin, expectedOrigin = 'https://control.bnei-neviim.com', secFetchSite = 'same-origin' } = {}) {
  if (origin !== expectedOrigin) throw Object.assign(new Error('bad origin'), { code: 'bad_origin' });
  if (!['same-origin', 'same-site', 'none'].includes(secFetchSite)) throw Object.assign(new Error('bad fetch site'), { code: 'bad_fetch_site' });
  if (!verifyCsrfToken(sessionId, token)) throw Object.assign(new Error('csrf invalid'), { code: 'csrf_invalid' });
  return true;
}

module.exports = {
  assertCsrf,
  createCsrfToken,
  verifyCsrfToken,
};
