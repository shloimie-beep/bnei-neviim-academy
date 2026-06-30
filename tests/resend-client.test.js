const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  getReceivedEmail,
  getResendConfig,
  getResendReadiness,
  normalizeResendWebhookEvent,
  processResendWebhook,
  sendResendEmail,
  verifyResendWebhookRequest,
} = require('../src/lib/integrations/resend-client');

function mockResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

function signedWebhookHeaders(payload, {
  id = 'msg_test_webhook',
  secret = 'whsec_dGVzdC1zZWNyZXQ=',
  timestamp = Math.floor(Date.now() / 1000),
} = {}) {
  const key = Buffer.from(secret.slice('whsec_'.length), 'base64');
  const signature = crypto
    .createHmac('sha256', key)
    .update(`${id}.${timestamp}.${payload}`)
    .digest('base64');
  return {
    'svix-id': id,
    'svix-timestamp': String(timestamp),
    'svix-signature': `v1,${signature}`,
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

test('bare Resend API key file is not reused as sender or domain config', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-resend-config-'));
  fs.mkdirSync(path.join(repoRoot, '.secrets'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, '.secrets', 'resend-api-key.txt'), 're_secret_bare_key_only');

  try {
    const config = getResendConfig({ repoRoot, keyholderRoots: [] });
    assert.equal(config.apiKey, 're_secret_bare_key_only');
    assert.equal(config.apiBase, 'https://api.resend.com');
    assert.equal(config.from, '');
    assert.equal(config.fromEmail, '');
    assert.equal(config.domain, '');
    assert.equal(config.replyTo, '');
    assert.equal(config.fallbackApproved, false);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('Rabbi profile resolves OneTimeOneTime sender identity without using BNA defaults', () => {
  const previous = {
    RESEND_PROFILE: process.env.RESEND_PROFILE,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    RESEND_FROM_NAME: process.env.RESEND_FROM_NAME,
    RESEND_REPLY_TO: process.env.RESEND_REPLY_TO,
    RESEND_DOMAIN: process.env.RESEND_DOMAIN,
    RESEND_RABBI_FROM_EMAIL: process.env.RESEND_RABBI_FROM_EMAIL,
    RESEND_RABBI_FROM_NAME: process.env.RESEND_RABBI_FROM_NAME,
    RESEND_RABBI_REPLY_TO: process.env.RESEND_RABBI_REPLY_TO,
    RESEND_RABBI_DOMAIN: process.env.RESEND_RABBI_DOMAIN,
    RESEND_RABBI_PROVIDER_ACCOUNT: process.env.RESEND_RABBI_PROVIDER_ACCOUNT,
  };
  Object.assign(process.env, {
    RESEND_FROM_EMAIL: 'office@bneineviimacademy.org',
    RESEND_FROM_NAME: 'Bnei Neviim Academy Office',
    RESEND_REPLY_TO: 'office@bneineviimacademy.org',
    RESEND_DOMAIN: 'bneineviimacademy.org',
    RESEND_RABBI_FROM_EMAIL: 'info@onetimeonetime.com',
    RESEND_RABBI_FROM_NAME: 'OneTimeOneTime Mishnah',
    RESEND_RABBI_REPLY_TO: 'info@onetimeonetime.com',
    RESEND_RABBI_DOMAIN: 'onetimeonetime.com',
    RESEND_RABBI_PROVIDER_ACCOUNT: 'Rabbi Sheller Resend account',
  });
  const secretsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-resend-empty-secrets-'));

  try {
    const config = getResendConfig({
      profile: 'rabbi',
      keyholderRoots: [],
      secretsRoot,
    });
    assert.equal(config.domain, 'onetimeonetime.com');
    assert.equal(config.fromEmail, 'info@onetimeonetime.com');
    assert.equal(config.fromName, 'OneTimeOneTime Mishnah');
    assert.equal(config.replyTo, 'info@onetimeonetime.com');
    assert.equal(config.from, 'OneTimeOneTime Mishnah <info@onetimeonetime.com>');
    assert.equal(config.providerAccount, 'Rabbi Sheller Resend account');
  } finally {
    fs.rmSync(secretsRoot, { recursive: true, force: true });
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('received email fetch uses the Resend receiving endpoint', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return mockResponse(200, {
      id: 'email_received_123',
      subject: 'Question about Mishnah class',
      text: 'Please call me back.',
    });
  };
  const payload = await getReceivedEmail('email_received_123', {
    config: {
      apiKey: 'resend-secret-key',
      apiBase: 'https://api.resend.test',
    },
    fetchImpl,
  });
  assert.equal(payload.id, 'email_received_123');
  assert.equal(calls[0].url, 'https://api.resend.test/emails/receiving/email_received_123?html_format=cid');
  assert.equal(calls[0].options.method, 'GET');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer resend-secret-key');
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
    replyTo: 'reply@bneineviimacademy.org',
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
    replyTo: 'reply@bneineviimacademy.org',
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
    replyTo: 'reply@bneineviimacademy.org',
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
  const body = JSON.parse(calls.at(-1).options.body);
  assert.equal(body.from, 'BNA <office@bneineviimacademy.org>');
  assert.equal(body.reply_to, 'reply@bneineviimacademy.org');
});

test('Resend webhook verifier accepts Svix signatures and rejects missing signed headers', () => {
  const payload = JSON.stringify({ type: 'email.delivered', data: { email_id: 'email_123' } });
  const secret = 'whsec_dGVzdC1zZWNyZXQ=';
  const headers = signedWebhookHeaders(payload, { secret });
  const verified = verifyResendWebhookRequest({ payload, headers, secret });
  assert.equal(verified.verified, true);
  assert.equal(verified.method, 'svix');
  assert.throws(
    () => verifyResendWebhookRequest({ payload, headers: {}, secret }),
    /Missing Resend Svix webhook headers/
  );
  assert.throws(
    () => verifyResendWebhookRequest({
      payload,
      headers: { ...headers, 'svix-signature': 'v1,not-a-valid-signature' },
      secret,
    }),
    (error) => error.status === 401 && /Invalid Resend webhook signature/.test(error.message)
  );
});

test('Resend webhook normalization maps event status and message identity', () => {
  const event = normalizeResendWebhookEvent({
    type: 'email.bounced',
    id: 'evt_123',
    data: {
      email_id: 'email_123',
      to: ['parent@example.com'],
      subject: 'Launch update',
    },
  });
  assert.equal(event.event_type, 'email.bounced');
  assert.equal(event.status, 'bounced');
  assert.equal(event.message_id, 'email_123');
  assert.deepEqual(event.to, ['parent@example.com']);
});

test('Resend webhook processing updates local records with safe mocked storage only', async () => {
  const payload = JSON.stringify({
    type: 'email.delivered',
    id: 'evt_delivery',
    created_at: '2026-06-21T12:00:00.000Z',
    data: {
      email_id: 'email_123',
      to: ['parent@example.com'],
      subject: 'Launch update',
      html: '<p>private body is not stored in metadata</p>',
    },
  });
  const secret = 'whsec_dGVzdC1zZWNyZXQ=';
  const queries = [];
  const db = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (/INSERT INTO bna_resend_webhook_events/.test(sql)) return { rows: [{ id: 33, duplicate_count: 0 }] };
      if (/UPDATE bna_resend_webhook_events/.test(sql)) return { rows: [{ id: 33 }] };
      if (/UPDATE bna_communications/.test(sql)) return { rows: [{ id: 9, status: params[1] }] };
      return { rows: [] };
    },
  };

  const result = await processResendWebhook({
    payload: JSON.parse(payload),
    rawPayload: payload,
    headers: signedWebhookHeaders(payload, { secret }),
    secret,
    db,
    logCommunication: async () => {
      throw new Error('matched message should update instead of creating a new communication');
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.status, 'delivered');
  assert.equal(result.stored_event_id, 33);
  assert.equal(result.updated_count, 1);
  assert.ok(queries.length >= 2);
  const eventInsert = queries.find((query) => /INSERT INTO bna_resend_webhook_events/.test(query.sql));
  assert.ok(eventInsert, 'Resend webhook event insert query was not recorded');
  assert.deepEqual(JSON.parse(eventInsert.params[5]), {
    resend_event: 'email.delivered',
    resend_webhook_id: 'evt_delivery',
    resend_message_id: 'email_123',
    created_at: '2026-06-21T12:00:00.000Z',
  });
  const communicationUpdate = queries.find((query) => /UPDATE bna_communications/.test(query.sql));
  assert.ok(communicationUpdate, 'communication update query was not recorded');
  const metadata = JSON.parse(communicationUpdate.params[2]);
  assert.deepEqual(metadata, {
    resend_event: 'email.delivered',
    resend_webhook_id: 'evt_delivery',
    resend_message_id: 'email_123',
    created_at: '2026-06-21T12:00:00.000Z',
  });
});
