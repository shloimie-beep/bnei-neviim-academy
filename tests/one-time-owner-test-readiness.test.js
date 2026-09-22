const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ONE_TIME_OWNER_TEST_CONFIRM,
  buildOneTimeOwnerTestReadiness,
  loadOwnerAlias,
} = require('../src/lib/bna/one-time-owner-test-readiness');

const readyResend = {
  configured: true,
  connected: true,
  send_allowed: true,
  domain_verified: true,
  account_owner: 'rabbi',
  provider_account: 'rabbi-resend',
  from_email: 'noreply@example.invalid',
};

const readyWapi = {
  success: true,
  provider_setup: {
    ready: true,
    instance_id_present: true,
    phone_metadata_present: true,
    blockers: [],
  },
  outbound: {
    configured: true,
    credential_scope: 'one_time_scoped',
    one_time_token_present: true,
  },
  auto_reply: {
    ready: false,
    webhook_secret_present: true,
    blockers: ['auto reply intentionally gated'],
  },
  telegram_notifications: {
    ready: false,
  },
};

test('owner-test readiness reports only fingerprints and no raw destinations', () => {
  const env = {
    ONE_TIME_OWNER_TEST_EMAIL: 'owner@example.invalid',
    ONE_TIME_OWNER_TEST_WHATSAPP: '+1 (732) 555-0101',
  };
  const report = buildOneTimeOwnerTestReadiness({
    env,
    inspectKeyholder: false,
    resendReadiness: readyResend,
    wapiReadiness: readyWapi,
    confirm: ONE_TIME_OWNER_TEST_CONFIRM,
    now: new Date('2026-07-13T08:00:00Z'),
  });

  assert.equal(report.readiness.email_preflight_ready, true);
  assert.equal(report.readiness.whatsapp_preflight_ready, true);
  assert.equal(report.readiness.owner_send_confirmed, true);
  assert.equal(report.readiness.external_send_performed, false);
  assert.equal(report.owner_aliases.email.raw_value_returned, false);
  assert.equal(report.owner_aliases.whatsapp.raw_value_returned, false);
  assert.ok(report.owner_aliases.email.fingerprint.startsWith('sha256:'));
  assert.ok(report.owner_aliases.whatsapp.fingerprint.startsWith('sha256:'));
  const serialized = JSON.stringify(report);
  assert.doesNotMatch(serialized, /owner@example\.invalid/);
  assert.doesNotMatch(serialized, /732/);
  assert.doesNotMatch(serialized, /\+1/);
});

test('owner-test readiness blocks missing aliases without blocking no-send provider checks', () => {
  const report = buildOneTimeOwnerTestReadiness({
    env: {},
    inspectKeyholder: false,
    resendReadiness: readyResend,
    wapiReadiness: readyWapi,
  });
  assert.equal(report.readiness.email_preflight_ready, false);
  assert.equal(report.readiness.whatsapp_preflight_ready, false);
  assert.deepEqual(report.blockers.filter((item) => /alias_missing/.test(item)), [
    'owner_test_email_alias_missing',
    'owner_test_whatsapp_alias_missing',
  ]);
  assert.equal(report.readiness.external_send_performed, false);
});

test('owner alias validation rejects malformed configured values', () => {
  const badEmail = loadOwnerAlias({
    env: { ONE_TIME_OWNER_TEST_EMAIL: 'not an email' },
    envNames: ['ONE_TIME_OWNER_TEST_EMAIL'],
    kind: 'email',
    inspectKeyholder: false,
  });
  const badPhone = loadOwnerAlias({
    env: { ONE_TIME_OWNER_TEST_WHATSAPP: '123' },
    envNames: ['ONE_TIME_OWNER_TEST_WHATSAPP'],
    kind: 'whatsapp',
    inspectKeyholder: false,
  });
  assert.equal(badEmail.configured, true);
  assert.equal(badEmail.valid, false);
  assert.equal(badPhone.configured, true);
  assert.equal(badPhone.valid, false);
});
