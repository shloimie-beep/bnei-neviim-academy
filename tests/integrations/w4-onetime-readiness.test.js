const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildOneTimeIntegrationReadinessPayload,
} = require('../../src/platform/integrations/readiness');

function assertNoSecretValues(value) {
  const text = JSON.stringify(value);
  assert.equal(/sk-[A-Za-z0-9_-]{12,}/.test(text), false);
  assert.equal(/(?:api|client|access)[_-]?token["']?\s*[:=]\s*["'][^"']{8,}/i.test(text), false);
  assert.equal(/password["']?\s*[:=]\s*["'][^"']{4,}/i.test(text), false);
}

test('W4 One Time readiness composes Vimeo, Zoom, and Resend cards without external writes', () => {
  const payload = buildOneTimeIntegrationReadinessPayload({
    checkedAt: '2026-06-19T00:00:00.000Z',
    videoHostingReadiness: { configured: true, connected: true, account_owner: 'Rabbi Elie Scheller' },
    zoomReadiness: { configured: true, connected: false, blocker: 'OAuth account owner approval required.' },
    resendReadiness: { configured: false, blocker: 'Domain is not verified.' },
  });

  assert.equal(payload.preview_only, true);
  assert.equal(payload.external_write_performed, false);
  assert.equal(payload.secret_values_included, false);
  assert.deepEqual(payload.cards.map((card) => card.provider), ['vimeo', 'zoom', 'resend']);
  assert.ok(payload.external_gates.includes('live_smoke_after_deploy'));
  assertNoSecretValues(payload);
});

test('W4 One Time readiness blocks live provider mutations and uses mock connection checks', () => {
  const payload = buildOneTimeIntegrationReadinessPayload({
    videoHostingReadiness: { configured: true, connected: true },
    zoomReadiness: { configured: true, connected: true },
    resendReadiness: { configured: true, connected: true, domain_verified: true },
  });

  for (const card of payload.cards) {
    assert.equal(card.test_connection.mode, 'mock');
    assert.equal(card.test_connection.external_write_performed, false);
    assert.ok(card.blocked_actions.length > 0);
  }
  assert.ok(payload.cards.find((card) => card.provider === 'vimeo').blocked_actions.includes('video_upload'));
  assert.ok(payload.cards.find((card) => card.provider === 'zoom').blocked_actions.includes('meeting_create'));
  assert.ok(payload.cards.find((card) => card.provider === 'resend').blocked_actions.includes('email_send'));
});
