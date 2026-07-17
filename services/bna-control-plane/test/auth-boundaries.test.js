const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertSessionFresh,
  buildSessionCookie,
  extractControlPlaneSession,
  productCookieCannotAuthenticate,
} = require('../src/auth/session-policy');
const { assertCsrf, createCsrfToken } = require('../src/auth/csrf');
const { loadConfig } = require('../src/config');

test('control-plane session uses its own host cookie and ignores product cookies', () => {
  const cookie = buildSessionCookie('session-id-1');
  assert.match(cookie, /^__Host-bna_cp_session=session-id-1; Secure; HttpOnly; SameSite=Strict; Path=\//);
  assert.equal(extractControlPlaneSession(cookie), 'session-id-1');
  assert.equal(productCookieCannotAuthenticate('one_time_session=abc; parent_session=def'), true);
});

test('sessions enforce idle and absolute timeouts', () => {
  const now = Date.UTC(2026, 6, 17, 8, 0, 0);
  assert.equal(assertSessionFresh({
    created_at: new Date(now - 60_000).toISOString(),
    last_seen_at: new Date(now - 60_000).toISOString(),
  }, now), true);
  assert.throws(() => assertSessionFresh({
    created_at: new Date(now - 60_000).toISOString(),
    last_seen_at: new Date(now - 31 * 60_000).toISOString(),
  }, now), /idle timeout/);
});

test('CSRF requires control-plane origin and token proof', () => {
  const sessionId = 'session-id-1';
  const token = createCsrfToken(sessionId);
  assert.equal(assertCsrf({ sessionId, token, origin: 'https://control.bnei-neviim.com' }), true);
  assert.throws(() => assertCsrf({ sessionId, token, origin: 'https://join.onetimeonetime.com' }), /bad origin/);
});

test('configuration fails closed when product/provider credentials leak into CP env', () => {
  assert.throws(() => loadConfig({
    NODE_ENV: 'production',
    STRIPE_SECRET_KEY: 'sk_live_forbidden',
    BNA_CP_DATABASE_URL: 'postgres://cp-only',
    BNA_CP_OIDC_ISSUER: 'https://issuer.example',
    BNA_CP_SESSION_SECRET: 'cp-session-secret',
    BNA_CP_COMMAND_KEY_ID: 'cp-command-key',
  }), /forbidden product/);
  assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /missing independent control-plane config/);
  assert.equal(loadConfig({ NODE_ENV: 'test' }).auth_mode, 'synthetic_test_only');
});
