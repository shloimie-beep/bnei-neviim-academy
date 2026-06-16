const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getResendReadiness,
  sendResendEmail,
} = require('../src/lib/integrations/resend-client');

function mockResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

test('missing Resend key returns safe setup blocker', async () => {
  const readiness = await getResendReadiness({
    config: { apiKey: '', apiBase: 'https://api.resend.com', fromEmail: '', accountOwner: 'unknown' },
    fetchImpl: async () => {
      throw new Error('fetch should not run');
    },
  });
  assert.equal(readiness.configured, false);
  assert.equal(readiness.connected, false);
  assert.equal(readiness.send_allowed, false);
  assert.match(readiness.blocker, /RESEND_API_KEY is not configured/);
});

test('unverified Resend domain blocks production send while preserving account metadata', async () => {
  const config = {
    apiKey: 'resend-secret-key',
    apiBase: 'https://api.resend.test',
    accountOwner: 'shloimie',
    providerAccount: 'Shloimie Resend account',
    domain: 'bneineviimacademy.org',
    from: 'BNA <office@bneineviimacademy.org>',
    fromEmail: 'office@bneineviimacademy.org',
    fallbackApproved: false,
  };
  const fetchImpl = async () => mockResponse(200, {
    data: [{ id: 'domain1', name: 'bneineviimacademy.org', status: 'pending' }],
  });
  const readiness = await getResendReadiness({ config, fetchImpl });
  assert.equal(readiness.account_owner, 'shloimie');
  assert.equal(readiness.provider_account, 'Shloimie Resend account');
  assert.equal(readiness.domain, 'bneineviimacademy.org');
  assert.equal(readiness.domain_verified, false);
  assert.equal(readiness.send_allowed, false);
  assert.match(readiness.blocker, /not verified/);

  await assert.rejects(
    () => sendResendEmail({
      to: ['parent@example.com'],
      subject: 'Hello',
      text: 'Body',
    }, { config, fetchImpl }),
    /not verified/
  );
});

test('verified Resend domain still blocks send without explicit confirmation', async () => {
  const config = {
    apiKey: 'resend-secret-key',
    apiBase: 'https://api.resend.test',
    accountOwner: 'bna',
    providerAccount: 'BNA Resend account',
    domain: 'bneineviimacademy.org',
    from: 'BNA <office@bneineviimacademy.org>',
    fromEmail: 'office@bneineviimacademy.org',
    fallbackApproved: false,
  };
  let emailPostAttempted = false;
  const fetchImpl = async (url) => {
    if (url.endsWith('/domains')) {
      return mockResponse(200, {
        data: [{ id: 'domain1', name: 'bneineviimacademy.org', status: 'verified' }],
      });
    }
    emailPostAttempted = true;
    return mockResponse(200, { id: 'email1' });
  };
  await assert.rejects(
    () => sendResendEmail({
      to: ['parent@example.com'],
      subject: 'Hello',
      text: 'Body',
    }, { config, fetchImpl }),
    /requires exact confirmation phrase/
  );
  assert.equal(emailPostAttempted, false);
});

test('verified Resend domain allows approved send and does not expose API key in errors', async () => {
  const config = {
    apiKey: 'resend-secret-key',
    apiBase: 'https://api.resend.test',
    accountOwner: 'bna',
    providerAccount: 'BNA Resend account',
    domain: 'bneineviimacademy.org',
    from: 'BNA <office@bneineviimacademy.org>',
    fromEmail: 'office@bneineviimacademy.org',
    fallbackApproved: false,
  };
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/domains')) {
      return mockResponse(200, {
        data: [{ id: 'domain1', name: 'bneineviimacademy.org', status: 'verified' }],
      });
    }
    return mockResponse(200, { id: 'email1' });
  };
  const sent = await sendResendEmail({
    to: ['parent@example.com'],
    subject: 'Hello',
    text: 'Body',
  }, { config, fetchImpl, confirm: 'SEND_RESEND_EMAIL' });
  assert.equal(sent.id, 'email1');
  assert.equal(sent.readiness.send_allowed, true);
  assert.equal(sent.approval.approved, true);
  assert.equal(JSON.parse(calls.at(-1).options.body).from, 'BNA <office@bneineviimacademy.org>');
});
