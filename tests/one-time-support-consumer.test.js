const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const consumer = require('../src/lib/bna/one-time-support-consumer');
const { supportTicketApprovalKeyboard } = require('../src/lib/bna/telegram-notifications');

const now = new Date('2026-07-17T02:00:00.000Z');
const secret = 'test-one-time-support-secret';

function basePayload(overrides = {}) {
  return {
    event_id: 'evt_support_001',
    event_type: consumer.ONE_TIME_SUPPORT_EVENT_TYPE,
    schema_version: consumer.ONE_TIME_SUPPORT_SCHEMA_VERSION,
    account_key: consumer.ONE_TIME_SUPPORT_WORKSPACE_KEY,
    product_key: consumer.ONE_TIME_SUPPORT_PROJECT_KEY,
    ticket: {
      public_reference: 'OT-PUB-001',
      category: 'bug',
      severity: 'normal',
      title: 'Broken playback button',
      message: 'The play button fails after I click lesson 4.',
      reproduction_steps: 'Open library, choose lesson 4, click play.',
      expected_behavior: 'The class should play.',
      actual_behavior: 'The player shows an error.',
    },
    subscriber: {
      id: 'subscriber_123',
      email: 'subscriber@example.com',
      display_name: 'Synthetic Subscriber',
      entitlement: {
        proof_type: 'one_time_subscription_entitlement_v1',
        reference: 'entitlement_123',
        signature: 'signed-proof-reference',
        status: 'active',
        account_key: consumer.ONE_TIME_SUPPORT_WORKSPACE_KEY,
        product_key: consumer.ONE_TIME_SUPPORT_PROJECT_KEY,
        issued_at: '2026-07-17T01:59:00.000Z',
        valid_until: '2026-07-18T02:00:00.000Z',
      },
    },
    ...overrides,
  };
}

function signedFixture(payload = basePayload(), { timestamp = '1784253600', eventId = payload.event_id } = {}) {
  const rawBody = Buffer.from(JSON.stringify(payload));
  return {
    rawBody,
    headers: {
      'content-type': 'application/json',
      'x-bna-onetime-event-id': eventId,
      'x-bna-onetime-timestamp': timestamp,
      'x-bna-onetime-key-id': 'synthetic-key-v1',
      'x-bna-onetime-signature': consumer.buildOneTimeSupportSignature({
        rawBody,
        timestamp,
        eventId,
        secret,
      }),
    },
  };
}

test('signed One Time support requests verify raw bodies and reject tampering or replay', () => {
  const fixture = signedFixture();
  const verified = consumer.verifyOneTimeSupportSignature({
    rawBody: fixture.rawBody,
    headers: fixture.headers,
    env: { ONE_TIME_SUPPORT_WEBHOOK_SECRET: secret },
    now,
  });
  assert.equal(verified.eventId, 'evt_support_001');
  assert.equal(verified.signatureKeyId, 'synthetic-key-v1');
  assert.match(verified.rawBodySha256, /^[a-f0-9]{64}$/);

  assert.throws(() => consumer.verifyOneTimeSupportSignature({
    rawBody: Buffer.from(JSON.stringify({ ...basePayload(), tampered: true })),
    headers: fixture.headers,
    env: { ONE_TIME_SUPPORT_WEBHOOK_SECRET: secret },
    now,
  }), /signature did not match/);

  assert.throws(() => consumer.verifyOneTimeSupportSignature({
    rawBody: fixture.rawBody,
    headers: { ...fixture.headers, 'x-bna-onetime-signature': 'v1=' + '0'.repeat(64) },
    env: { ONE_TIME_SUPPORT_WEBHOOK_SECRET: secret },
    now,
  }), /signature did not match/);

  const stale = signedFixture(basePayload(), { timestamp: '1784240000' });
  assert.throws(() => consumer.verifyOneTimeSupportSignature({
    rawBody: stale.rawBody,
    headers: stale.headers,
    env: { ONE_TIME_SUPPORT_WEBHOOK_SECRET: secret },
    now,
  }), /outside the replay window/);

  assert.throws(() => consumer.verifyOneTimeSupportSignature({
    rawBody: Buffer.alloc(consumer.ONE_TIME_SUPPORT_MAX_BODY_BYTES + 1, 'x'),
    headers: fixture.headers,
    env: { ONE_TIME_SUPPORT_WEBHOOK_SECRET: secret },
    now,
  }), /too large/);

  assert.throws(() => consumer.verifyOneTimeSupportSignature({
    rawBody: fixture.rawBody,
    headers: { ...fixture.headers, 'content-type': 'text/plain' },
    env: { ONE_TIME_SUPPORT_WEBHOOK_SECRET: secret },
    now,
  }), /content-type/);
});

test('payload validation fails closed for product/account, fake entitlement, attachments, and malformed JSON', () => {
  assert.throws(() => consumer.parseOneTimeSupportPayload('{bad json'), /Malformed One Time support payload/);

  const valid = consumer.validateOneTimeSupportPayload(basePayload(), {
    verifiedEventId: 'evt_support_001',
    env: { ONE_TIME_SUPPORT_WEBHOOK_SECRET: secret },
    now,
  });
  assert.equal(valid.accountKey, consumer.ONE_TIME_SUPPORT_WORKSPACE_KEY);
  assert.equal(valid.productKey, consumer.ONE_TIME_SUPPORT_PROJECT_KEY);
  assert.equal(valid.entitlement.proofType, 'one_time_subscription_entitlement_v1');

  assert.throws(() => consumer.validateOneTimeSupportPayload(basePayload({ product_key: 'bna_academy' }), {
    verifiedEventId: 'evt_support_001',
    env: {},
    now,
  }), /outside the allowed account\/product scope/);

  assert.throws(() => consumer.validateOneTimeSupportPayload(basePayload({
    subscriber: {
      ...basePayload().subscriber,
      entitlement: { ...basePayload().subscriber.entitlement, proof_type: 'trust_me', signature: 'fake' },
    },
  }), { verifiedEventId: 'evt_support_001', env: {}, now }), /entitlement proof type is not allowed/);

  assert.throws(() => consumer.validateOneTimeSupportPayload(basePayload({
    subscriber: {
      ...basePayload().subscriber,
      entitlement: { ...basePayload().subscriber.entitlement, valid_until: '2026-07-16T01:00:00.000Z' },
    },
  }), { verifiedEventId: 'evt_support_001', env: {}, now }), /entitlement proof is expired/);

  assert.throws(() => consumer.validateOneTimeSupportPayload(basePayload({
    ticket: { ...basePayload().ticket, attachments: [{ url: 'https://example.invalid/private.png' }] },
  }), { verifiedEventId: 'evt_support_001', env: {}, now }), /attachments are not accepted/);
});

test('routing separates reproducible bugs, operator decisions, and restricted access/privacy tickets', () => {
  const normalized = consumer.validateOneTimeSupportPayload(basePayload(), {
    verifiedEventId: 'evt_support_001',
    env: {},
    now,
  });
  const bugRoute = consumer.routeOneTimeSupportTicket({ payload: basePayload(), normalized });
  assert.equal(bugRoute.routingState, 'awaiting_agent_review');
  assert.equal(bugRoute.supportCategory, 'bot_api');
  assert.equal(bugRoute.agentDecision.automatic_code_execution_allowed, false);
  assert.equal(bugRoute.agentDecision.codex_job_created_initially, false);

  const billingPayload = basePayload({
    ticket: {
      ...basePayload().ticket,
      category: 'billing',
      title: 'Refund dispute',
      message: 'I was charged twice.',
      reproduction_steps: '',
      expected_behavior: '',
      actual_behavior: '',
    },
  });
  const billingRoute = consumer.routeOneTimeSupportTicket({
    payload: billingPayload,
    normalized: consumer.validateOneTimeSupportPayload(billingPayload, {
      verifiedEventId: 'evt_support_001',
      env: {},
      now,
    }),
  });
  assert.equal(billingRoute.routingState, 'decision_needed');
  assert.equal(billingRoute.supportCategory, 'payment');
  assert.equal(billingRoute.decisionCard.automatic_code_execution_allowed, false);

  const accessPayload = basePayload({
    ticket: {
      ...basePayload().ticket,
      category: 'security',
      title: 'Private access problem',
      message: 'My password is hunter2 and the class link is https://zoom.us/j/123?pwd=secret',
    },
  });
  const accessRoute = consumer.routeOneTimeSupportTicket({
    payload: accessPayload,
    normalized: consumer.validateOneTimeSupportPayload(accessPayload, {
      verifiedEventId: 'evt_support_001',
      env: {},
      now,
    }),
  });
  assert.equal(accessRoute.supportCategory, 'access');
  assert.equal(accessRoute.severity, 'high');
  assert.equal(accessRoute.restrictedDisplay, true);
});

test('redaction and source context avoid secrets, class links, full payload returns, and Academy crossover', () => {
  const redacted = consumer.redactSupportFreeText('Email me subscriber@example.com password=hunter2 https://zoom.us/j/123?pwd=secret');
  assert.doesNotMatch(redacted, /subscriber@example\.com/);
  assert.doesNotMatch(redacted, /hunter2/);
  assert.doesNotMatch(redacted, /zoom\.us/);
  assert.match(redacted, /\[email\]/);
  assert.match(redacted, /\[redacted-link\]/);

  const normalized = consumer.validateOneTimeSupportPayload(basePayload(), {
    verifiedEventId: 'evt_support_001',
    env: {},
    now,
  });
  const route = consumer.routeOneTimeSupportTicket({ payload: basePayload(), normalized });
  const context = consumer.buildOneTimeSupportSourceContext({
    normalized,
    route,
    fields: {
      publicReference: 'OT-PUB-001',
      affectedSection: 'Library',
      requestedResult: 'Fix playback',
      reviewPath: '/operations?workspace=rabbi_sheller_provider',
      subscriberReferenceHash: 'hash-ref',
      subscriberEmailHash: 'hash-email',
      subscriberEmailMasked: 's***r@example.com',
      requesterDisplayName: 'Synthetic Subscriber',
      redactionFlags: ['secret_removed', 'url_removed'],
    },
    signature: { rawBodySha256: 'a'.repeat(64), signatureKeyId: 'synthetic-key-v1' },
    payload: basePayload(),
  });
  assert.equal(context.relationship_scope, 'one_time_subscriber_support_ticket');
  assert.equal(context.workspace_key, consumer.ONE_TIME_SUPPORT_WORKSPACE_KEY);
  assert.equal(context.project_key, consumer.ONE_TIME_SUPPORT_PROJECT_KEY);
  assert.equal(context.raw_body_stored, false);
  assert.equal(context.attachments_accepted, false);
  assert.equal(context.academy_data_crossover, false);
  assert.equal(context.automatic_code_execution_allowed, false);
});

test('Telegram alert and reverse status contracts queue safely without Rabbi bot or live send', () => {
  const source = fs.readFileSync('src/lib/bna/one-time-support-consumer.js', 'utf8');
  assert.match(source, /telegram:platform_support_shloimie/);
  assert.match(source, /role_alias:\s*ONE_TIME_SUPPORT_OPERATOR_ALIAS/);
  assert.match(source, /queued_only_by_consumer_no_direct_send/);
  assert.match(source, /real_send_attempted:\s*false/);
  assert.match(source, /provider_off:\s*true/);
  assert.match(source, /bna_one_time_support_status_outbox/);
  assert.doesNotMatch(source, /telegram:one_time_rabbi_operator/);

  const keyboard = supportTicketApprovalKeyboard({
    ticket: { id: 44 },
    context: { relationship_scope: 'one_time_subscriber_support_ticket' },
  });
  assert.equal(keyboard.inline_keyboard[0][1].text, 'Ask for Info');
  assert.equal(keyboard.inline_keyboard[0][1].callback_data, 'ticket:ask:44');
});

test('inbox, lease, idempotency, retry, and dead-letter contracts are explicit', () => {
  assert.match(consumer.createOneTimeSupportConsumerSQL, /event_id TEXT NOT NULL UNIQUE/);
  assert.match(consumer.createOneTimeSupportConsumerSQL, /bna_one_time_support_status_outbox/);
  assert.match(consumer.createOneTimeSupportConsumerSQL, /provider_off BOOLEAN NOT NULL DEFAULT TRUE/);

  const source = fs.readFileSync('src/lib/bna/one-time-support-consumer.js', 'utf8');
  assert.match(source, /ON CONFLICT \(event_id\) DO NOTHING/);
  assert.match(source, /FOR UPDATE SKIP LOCKED/);
  assert.match(source, /ON CONFLICT \(delivery_key\) DO NOTHING/);
  assert.match(source, /assistant_dead_letters/);

  const retry = consumer.nextOneTimeSupportProcessingState({ attemptCount: 1, maxAttempts: 5 });
  assert.equal(retry.processing_state, 'retry_wait');
  assert.equal(retry.retry, true);
  assert.ok(retry.delay_seconds >= 30);

  const dead = consumer.nextOneTimeSupportProcessingState({ attemptCount: 5, maxAttempts: 5 });
  assert.equal(dead.processing_state, 'dead_letter');
  assert.equal(dead.delivery_state, 'dead_lettered');
  assert.equal(dead.retry, false);
});

test('server and registries cover the signed endpoint and approval guardrails', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const rawRouteIndex = server.indexOf('app.post(ONE_TIME_SUPPORT_ENDPOINT_PATH, express.raw');
  const jsonMiddlewareIndex = server.indexOf('app.use(express.json');
  assert.ok(rawRouteIndex > -1, 'raw-body support consumer route should be registered');
  assert.ok(rawRouteIndex < jsonMiddlewareIndex, 'support consumer route must run before JSON middleware mutates the body');
  assert.match(server, /isApprovalGatedSupportTicketContext/);
  assert.match(server, /supportTicketBlocksAutomaticTask\(ticket, body\)/);
  assert.match(server, /one_time_subscriber_status_uses_signed_reverse_status_outbox/);
  assert.match(server, /one-time-support-consumer-approval-v1/);

  const routes = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8')).routes;
  const route = routes.find((entry) => entry.route === consumer.ONE_TIME_SUPPORT_ENDPOINT_PATH);
  assert.ok(route, 'route registry should cover signed support consumer endpoint');
  assert.equal(route.access, 'signed_integration');
  assert.match(route.security_expectation, /raw-body HMAC/);

  const actions = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8')).actions;
  assert.ok(actions.find((entry) => entry.action_id === 'ACTION-ONETIME-SUPPORT-CONSUMER-INTAKE'));
  assert.ok(actions.find((entry) => entry.action_id === 'ACTION-ONETIME-SUPPORT-CONSUMER-OPERATOR-DECISION'));
});
