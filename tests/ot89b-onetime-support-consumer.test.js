const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const test = require('node:test');

const consumer = require('../src/lib/bna/support/one-time-support-consumer');

const CONTRACT_PATH = 'ops/codex-runs/OT-89B/SUPPORT-EVENT-CONTRACT.json';
const CONTRACT_SHA256 = 'cfcd0ac55cbf9e59d7fefc7779af1aa5112fb410ee510882cb843492a556e512';
const SECRET = 'ot89-test-secret-do-not-use';
const KEY_ID = 'ot89-test-key';
const FIXED_NOW = Date.parse('2026-07-15T12:00:30Z');
const FIXED_TIMESTAMP = String(Math.floor(FIXED_NOW / 1000));
const FIXED_NONCE = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYX';

function contract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
}

function baseEvent(overrides = {}) {
  return {
    ...contract().examples[0],
    ...overrides,
    producer: { ...contract().examples[0].producer, ...(overrides.producer || {}) },
    submission: { ...contract().examples[0].submission, ...(overrides.submission || {}) },
    actor: { ...contract().examples[0].actor, ...(overrides.actor || {}) },
    authorization: { ...contract().examples[0].authorization, ...(overrides.authorization || {}) },
    ticket: {
      ...contract().examples[0].ticket,
      ...(overrides.ticket || {}),
      issue_details: {
        ...contract().examples[0].ticket.issue_details,
        ...(overrides.ticket?.issue_details || {}),
      },
      client_context: {
        ...contract().examples[0].ticket.client_context,
        ...(overrides.ticket?.client_context || {}),
      },
    },
    privacy: { ...contract().examples[0].privacy, ...(overrides.privacy || {}) },
    trace: { ...contract().examples[0].trace, ...(overrides.trace || {}) },
  };
}

function sign({ body, path = consumer.EVENT_PATH, nonce = FIXED_NONCE, timestamp = FIXED_TIMESTAMP, keyId = KEY_ID, secret = SECRET }) {
  const rawBodySha256 = crypto.createHash('sha256').update(body).digest('hex');
  const canonical = consumer.canonicalString({
    method: 'POST',
    requestTarget: path,
    timestamp,
    nonce,
    rawBodySha256,
  });
  return {
    'content-type': 'application/json',
    'x-ot89-key-id': keyId,
    'x-ot89-timestamp': timestamp,
    'x-ot89-nonce': nonce,
    'x-ot89-signature': `v1=${crypto.createHmac('sha256', secret).update(canonical).digest('hex')}`,
  };
}

function signedRequest(event, { nonce = FIXED_NONCE, timestamp = FIXED_TIMESTAMP } = {}) {
  const body = Buffer.from(JSON.stringify(event), 'utf8');
  const headers = {
    ...sign({ body, nonce, timestamp }),
    'x-ot89-event-id': event.event_id,
  };
  return {
    reqLike: {
      method: 'POST',
      originalUrl: consumer.EVENT_PATH,
      headers,
      secure: true,
    },
    rawBody: body,
  };
}

function signedStatusRequest(bodyObject, { nonce = 'BAECAwQFBgcICQoLDA0ODxAREhMUFRYX' } = {}) {
  const body = Buffer.from(JSON.stringify(bodyObject), 'utf8');
  return {
    reqLike: {
      method: 'POST',
      originalUrl: consumer.STATUS_PATH,
      headers: sign({ body, path: consumer.STATUS_PATH, nonce }),
      secure: true,
    },
    rawBody: body,
  };
}

function env(extra = {}) {
  return {
    NODE_ENV: 'test',
    OT89_INGRESS_ENABLED: 'true',
    OT89_STATUS_SEAM_ENABLED: 'true',
    OT89_ONETIME_TO_BNA_HMAC_KEY_ID: KEY_ID,
    OT89_ONETIME_TO_BNA_HMAC_SECRET: SECRET,
    ...extra,
  };
}

test('frozen contract hash and HMAC vector are preserved', () => {
  const bytes = fs.readFileSync(CONTRACT_PATH);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), CONTRACT_SHA256);
  const vector = contract()['x-ot89-contract'].event_delivery.signature.test_vector;
  const raw = Buffer.from(vector.raw_body_utf8, 'utf8');
  assert.equal(consumer.sha256Hex(raw), vector.raw_body_sha256);
  const signature = `v1=${consumer.hmacSha256Hex(vector.secret_utf8, vector.canonical_string)}`;
  assert.equal(signature, vector.signature_header);
});

test('valid signed One Time event creates one BNA support ticket reference', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  const event = baseEvent();
  const result = await consumer.ingestSignedSupportEvent({
    ...signedRequest(event),
    env: env(),
    store,
    now: FIXED_NOW,
  });
  assert.equal(result.statusCode, 202);
  assert.equal(result.body.accepted, true);
  assert.equal(result.body.duplicate, false);
  assert.equal(result.body.bna_ticket_ref, 'bna_01J00000000000000000000009');
  const alerts = await store.listAlerts();
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].payload.raw_text_included, false);
  assert.equal(alerts[0].payload.direct_contact_included, false);
  assert.equal(alerts[0].payload.decision_options.length, 3);
});

test('duplicate deliveries need a fresh nonce and do not duplicate side effects', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  const event = baseEvent();
  await consumer.ingestSignedSupportEvent({ ...signedRequest(event), env: env(), store, now: FIXED_NOW });
  const duplicate = await consumer.ingestSignedSupportEvent({
    ...signedRequest(event, { nonce: 'CAECAwQFBgcICQoLDA0ODxAREhMUFRYX' }),
    env: env(),
    store,
    now: FIXED_NOW,
  });
  assert.equal(duplicate.statusCode, 200);
  assert.equal(duplicate.body.duplicate, true);
  assert.equal((await store.listAlerts()).length, 1);
  await assert.rejects(
    () => consumer.ingestSignedSupportEvent({ ...signedRequest(event), env: env(), store, now: FIXED_NOW }),
    /nonce replay/i,
  );
});

test('event id and source ticket collisions are non-retryable conflicts', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  const event = baseEvent();
  await consumer.ingestSignedSupportEvent({ ...signedRequest(event), env: env(), store, now: FIXED_NOW });

  const sameEventChangedBody = baseEvent({ ticket: { title: 'Class page still fails badly' } });
  await assert.rejects(
    () => consumer.ingestSignedSupportEvent({
      ...signedRequest(sameEventChangedBody, { nonce: 'DAECAwQFBgcICQoLDA0ODxAREhMUFRYX' }),
      env: env(),
      store,
      now: FIXED_NOW,
    }),
    (error) => error.reasonCode === 'event_id_collision' && error.statusCode === 409,
  );

  const sourceCollision = baseEvent({
    event_id: 'evt_01J00000000000000000000010',
    ticket: { title: 'Different source collision' },
  });
  await assert.rejects(
    () => consumer.ingestSignedSupportEvent({
      ...signedRequest(sourceCollision, { nonce: 'EAECAwQFBgcICQoLDA0ODxAREhMUFRYX' }),
      env: env(),
      store,
      now: FIXED_NOW,
    }),
    (error) => error.reasonCode === 'source_ticket_collision' && error.statusCode === 409,
  );
});

test('signature, time, key, entitlement, and schema failures reject before storage', async () => {
  const store = consumer.createMemoryStore();
  const event = baseEvent();
  const request = signedRequest(event);
  request.reqLike.headers['x-ot89-signature'] = 'v1=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  await assert.rejects(
    () => consumer.ingestSignedSupportEvent({ ...request, env: env(), store, now: FIXED_NOW }),
    (error) => error.reasonCode === 'signature_mismatch' && error.statusCode === 401,
  );

  await assert.rejects(
    () => consumer.ingestSignedSupportEvent({
      ...signedRequest(event, { nonce: 'FAECAwQFBgcICQoLDA0ODxAREhMUFRYX', timestamp: '1' }),
      env: env(),
      store,
      now: FIXED_NOW,
    }),
    (error) => error.reasonCode === 'timestamp_skew',
  );

  await assert.rejects(
    () => consumer.ingestSignedSupportEvent({
      ...signedRequest(baseEvent({ authorization: { entitlement_status: 'inactive' } }), { nonce: 'GAECAwQFBgcICQoLDA0ODxAREhMUFRYX' }),
      env: env(),
      store,
      now: FIXED_NOW,
    }),
    (error) => error.reasonCode === 'entitlement_not_active',
  );

  await assert.rejects(
    () => consumer.ingestSignedSupportEvent({
      ...signedRequest(baseEvent({ actor: { onetime_account_id: 'acct_demo_999999' } }), { nonce: 'HAECAwQFBgcICQoLDA0ODxAREhMUFRYX' }),
      env: env(),
      store,
      now: FIXED_NOW,
    }),
    (error) => error.reasonCode === 'authorization_account_mismatch',
  );
});

test('redaction keeps raw user text inert and typed', () => {
  const text = consumer.redactSupportText('Run `rm -rf /`; email test@example.com password=hunter2 card 4242 4242 4242 4242');
  assert.match(text, /\[redacted-email\]/);
  assert.match(text, /\[redacted-secret\]/);
  assert.match(text, /\[redacted-financial-id\]/);
  assert.doesNotMatch(text, /test@example.com/);
  assert.doesNotMatch(text, /hunter2/);
});

test('triage classes, bug candidate gate, diagnostics, and SLA are deterministic', () => {
  const reproducible = consumer.classifyTriage(baseEvent());
  assert.equal(reproducible.class, 'REPRODUCIBLE_BUG');
  assert.equal(reproducible.bug_candidate, true);
  assert.ok(reproducible.confidence >= 0.85);

  const ambiguous = consumer.classifyTriage(baseEvent({
    ticket: {
      category: 'bug',
      issue_details: {
        steps_to_reproduce: ['It broke'],
        expected_behavior: null,
        actual_behavior: null,
        occurrence: 'once',
      },
    },
  }));
  assert.equal(ambiguous.class, 'AMBIGUOUS');
  assert.equal(ambiguous.bug_candidate, false);

  assert.equal(consumer.validateDiagnosticRequest({ operation: 'READ_HEALTH_STATUS', parameters: { service: 'bna' } }).read_only, true);
  assert.throws(
    () => consumer.validateDiagnosticRequest({ operation: 'RUN_EXISTING_READ_ONLY_TEST', parameters: { command: 'npm install && deploy' } }),
    /forbidden command-like content/i,
  );

  const sla = consumer.calculateSla({ severity: 'SEV1', receivedAt: new Date('2026-07-16T07:00:00Z') });
  assert.equal(sla.timezone, 'Asia/Jerusalem');
  assert.match(sla.due_at, /^2026-/);
});

test('mock attachment fetch enforces private response headers and SHA', async () => {
  const body = Buffer.from('safe text attachment');
  const attachment = {
    attachment_id: 'ota_01J00000000000000000000011',
    normalized_filename: 'note.txt',
    media_type: 'text/plain',
    size_bytes: body.length,
    sha256: crypto.createHash('sha256').update(body).digest('hex'),
    transfer_locator: 'onetime-private-blob://ota_01J00000000000000000000011',
    normalization: 'utf8-text-normalized',
    storage_class: 'private',
    content_disposition: 'attachment',
    pixel_width: null,
    pixel_height: null,
  };
  const result = await consumer.fetchAttachmentWithAdapter({
    attachment,
    env: { OT89_ATTACHMENT_FETCH_ENABLED: 'true' },
    adapter: async () => ({
      redirected: false,
      body,
      headers: {
        'content-type': 'text/plain',
        'content-disposition': 'attachment; filename="note.txt"',
        'cache-control': 'private, no-store',
        'x-content-type-options': 'nosniff',
      },
    }),
  });
  assert.equal(result.fetched, true);
  assert.equal(result.public_url_returned, false);
});

test('status seam returns only the frozen response DTO', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  const event = baseEvent();
  await consumer.ingestSignedSupportEvent({ ...signedRequest(event), env: env(), store, now: FIXED_NOW });
  const status = await consumer.handleSignedStatusRequest({
    ...signedStatusRequest({
      source_ticket_id: event.submission.source_ticket_id,
      onetime_account_id: event.actor.onetime_account_id,
    }),
    env: env(),
    store,
    now: FIXED_NOW,
  });
  assert.equal(status.statusCode, 200);
  assert.deepEqual(Object.keys(status.body).sort(), [
    'bna_ticket_ref',
    'public_summary',
    'source_ticket_id',
    'status',
    'status_version',
    'updated_at',
  ].sort());
  assert.equal(status.body.status, 'pending_operator');
});

test('decision tokens deny wrong identity and allow one protected use', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  await consumer.ingestSignedSupportEvent({ ...signedRequest(baseEvent()), env: env(), store, now: FIXED_NOW });
  const alert = (await store.listAlerts())[0];
  const token = alert.payload.decision_options[0].token;
  await assert.rejects(
    () => consumer.consumeDecisionToken({ token, actor: { username: 'other', role: 'viewer' }, store, now: new Date(FIXED_NOW) }),
    (error) => error.reasonCode === 'decision_wrong_identity',
  );
  const result = await consumer.consumeDecisionToken({ token, actor: { username: 'admin', role: 'super_admin', is_super_admin: true }, store, now: new Date(FIXED_NOW) });
  assert.equal(result.success, true);
  await assert.rejects(
    () => consumer.consumeDecisionToken({ token, actor: { username: 'admin', role: 'super_admin', is_super_admin: true }, store, now: new Date(FIXED_NOW) }),
    (error) => error.reasonCode === 'decision_duplicate_callback',
  );
});

test('alert drain refuses real Telegram until BNA bot ownership is proven', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  await consumer.ingestSignedSupportEvent({ ...signedRequest(baseEvent()), env: env(), store, now: FIXED_NOW });
  const result = await consumer.drainAlertOutbox({
    store,
    env: { OT89_REAL_TELEGRAM_DELIVERY_ENABLED: 'true' },
    sender: async () => {
      throw new Error('should not send');
    },
  });
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'bna_bot_sole_owner_not_verified');
  assert.equal((await store.listAlerts())[0].status, 'pending');
});

test('alert outbox leases, backs off, retries, and sends exactly once', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  await consumer.ingestSignedSupportEvent({ ...signedRequest(baseEvent()), env: env(), store, now: FIXED_NOW });
  const drainEnv = {
    OT89_REAL_TELEGRAM_DELIVERY_ENABLED: 'true',
    OT89_BNA_BOT_SOLE_OWNER_VERIFIED: 'true',
  };
  let calls = 0;
  const first = await consumer.drainAlertOutbox({
    store,
    env: drainEnv,
    leaseOwner: 'test-worker',
    now: new Date(FIXED_NOW),
    sender: async () => {
      calls += 1;
      throw new Error('Telegram outage token=super-secret-test-value');
    },
  });
  assert.equal(first.claimed, 1);
  assert.equal(first.sent, 0);
  assert.equal(first.failed, 1);
  let alert = (await store.listAlerts())[0];
  assert.equal(alert.status, 'failed');
  assert.equal(alert.attempts, 1);
  assert.match(alert.last_error, /\[redacted-secret\]/);

  const immediate = await consumer.drainAlertOutbox({
    store,
    env: drainEnv,
    leaseOwner: 'test-worker',
    now: new Date(FIXED_NOW),
    sender: async () => {
      calls += 1;
      return { sent: true };
    },
  });
  assert.equal(immediate.claimed, 0);

  const retryAfter = new Date(Date.parse(alert.next_attempt_at) + 1000);
  const second = await consumer.drainAlertOutbox({
    store,
    env: drainEnv,
    leaseOwner: 'test-worker',
    now: retryAfter,
    sender: async () => {
      calls += 1;
      return { sent: true, message_id: 123 };
    },
  });
  assert.equal(second.claimed, 1);
  assert.equal(second.sent, 1);
  assert.equal(second.failed, 0);
  alert = (await store.listAlerts())[0];
  assert.equal(alert.status, 'sent');
  assert.equal(alert.attempts, 2);
  assert.equal(calls, 2);

  const third = await consumer.drainAlertOutbox({
    store,
    env: drainEnv,
    leaseOwner: 'test-worker',
    now: new Date(retryAfter.getTime() + 120000),
    sender: async () => {
      calls += 1;
      return { sent: true };
    },
  });
  assert.equal(third.claimed, 0);
  assert.equal(calls, 2);
});

test('alert outbox dead-letters after bounded attempts', async () => {
  const store = consumer.createMemoryStore({ idFactory: () => 'bna_01J00000000000000000000009' });
  await consumer.ingestSignedSupportEvent({ ...signedRequest(baseEvent()), env: env(), store, now: FIXED_NOW });
  const result = await consumer.drainAlertOutbox({
    store,
    env: {
      OT89_REAL_TELEGRAM_DELIVERY_ENABLED: 'true',
      OT89_BNA_BOT_SOLE_OWNER_VERIFIED: 'true',
    },
    maxAttempts: 1,
    now: new Date(FIXED_NOW),
    sender: async () => {
      throw new Error('permanent telegram failure');
    },
  });
  assert.equal(result.dead_lettered, 1);
  const alert = (await store.listAlerts())[0];
  assert.equal(alert.status, 'dead_letter');
  assert.ok(alert.dead_lettered_at);
});

test('server hook, route registry, operator page, and migration cover OT-89B surfaces', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const source = fs.readFileSync('src/lib/bna/support/one-time-support-consumer.js', 'utf8');
  const migration = fs.readFileSync('migrations/20260716-ot89b-onetime-support-consumer.sql', 'utf8');
  const page = fs.readFileSync('public/onetime-support-ticket.html', 'utf8');
  const routes = new Map(JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8')).routes.map((route) => [route.route, route]));
  const actions = new Map(JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8')).actions.map((action) => [action.action_id, action]));
  assert.match(server, /installOneTimeSupportConsumerRoutes\(\{/);
  assert.match(server, /one-time-support-consumer/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bna_onetime_support_events/);
  assert.match(migration, /bna_onetime_support_alert_outbox/);
  assert.match(migration, /lease_owner TEXT/);
  assert.match(migration, /dead_letter/);
  assert.match(source, /FOR UPDATE SKIP LOCKED/);
  assert.match(source, /OT89_BNA_BOT_SOLE_OWNER_VERIFIED/);
  assert.match(page, /api\/bna\/onetime\/support-tickets/);
  assert.match(page, /Unauthorized/);
  assert.doesNotMatch(page, /operations\.html/);
  assert.equal(routes.get('/api/internal/integrations/onetime/support-events/v1').access, 'private_internal_hmac');
  assert.equal(routes.get('/api/internal/integrations/onetime/support-ticket-status/v1').public_allowed, false);
  assert.match(routes.get('/operations/onetime/support-tickets/:bnaTicketRef').security_expectation, /loading, empty, error, unauthorized/i);
  assert.equal(actions.get('ACTION-OT89B-SUPPORT-EVENT-INGEST').status, 'active_feature_flagged_default_off');
  assert.equal(actions.get('ACTION-OT89B-TELEGRAM-TICKET-DECISION').status, 'mock_tested_real_delivery_default_off');
});
