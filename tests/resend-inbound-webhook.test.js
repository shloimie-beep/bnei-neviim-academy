const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  getReceivedEmail,
  verifyResendWebhookSignature,
} = require('../src/lib/integrations/resend-client');
const {
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  inboundRoutingForEmail,
  processResendInboundEvent,
} = require('../src/lib/integrations/resend-inbound-crm');

function signSvixPayload({ id, timestamp, payload, secretBytes }) {
  return crypto
    .createHmac('sha256', secretBytes)
    .update(`${id}.${timestamp}.${payload}`)
    .digest('base64');
}

function createFakeDb() {
  const state = {
    contacts: [],
    communications: [],
    contactIdentities: [],
    nextContactId: 100,
    nextCommunicationId: 500,
  };
  return {
    state,
    async query(sql, params = []) {
      const text = String(sql || '').replace(/\s+/g, ' ');
      if (/SELECT \* FROM bna_communications/i.test(text)) {
        const [emailId = '', eventId = '', messageId = ''] = params;
        return {
          rows: state.communications.filter((row) => {
            if (row.provider !== 'resend' || row.direction !== 'inbound') return false;
            const metadata = row.metadata || {};
            return (
              (emailId && row.external_message_id === emailId)
              || (emailId && metadata.resend_received_email_id === emailId)
              || (eventId && metadata.resend_event_id === eventId)
              || (messageId && metadata.email_message_id === messageId)
            );
          }).slice(0, 1),
        };
      }
      if (/SELECT c\.\* FROM bna_contacts/i.test(text)) {
        const [workspaceId, email] = params;
        return {
          rows: state.contacts
            .filter((row) => row.workspace_id === workspaceId && String(row.primary_email || '').toLowerCase() === email)
            .slice(0, 1),
        };
      }
      if (/UPDATE bna_contacts/i.test(text)) {
        const [id, fromName, email, tags, metadataJson] = params;
        const row = state.contacts.find((contact) => contact.id === id);
        if (!row) return { rows: [] };
        row.full_name = fromName || row.full_name;
        row.primary_email = email || row.primary_email;
        row.tags = [...new Set([...(row.tags || []), ...(tags || [])])];
        row.metadata = { ...(row.metadata || {}), ...JSON.parse(metadataJson || '{}') };
        return { rows: [row] };
      }
      if (/INSERT INTO bna_contacts/i.test(text)) {
        const [workspaceId, fromName, email, tags, metadataJson] = params;
        const row = {
          id: state.nextContactId++,
          workspace_id: workspaceId,
          full_name: fromName,
          primary_email: email,
          status: 'lead',
          source: 'resend_inbound',
          tags: tags || [],
          metadata: JSON.parse(metadataJson || '{}'),
        };
        state.contacts.push(row);
        return { rows: [row] };
      }
      if (/INSERT INTO bna_contact_identities/i.test(text)) {
        state.contactIdentities.push({
          contact_id: params[0],
          identity_value: params[1],
          normalized_value: params[2],
          metadata: JSON.parse(params[3] || '{}'),
        });
        return { rows: [] };
      }
      if (/SELECT thread_key FROM bna_communications/i.test(text)) {
        const [projectId, relatedIds = []] = params;
        return {
          rows: state.communications
            .filter((row) => row.project_id === projectId && row.provider === 'resend' && row.thread_key)
            .filter((row) => relatedIds.includes(row.external_message_id) || relatedIds.includes(row.metadata?.email_message_id))
            .slice(0, 1)
            .map((row) => ({ thread_key: row.thread_key })),
        };
      }
      if (/INSERT INTO bna_communications/i.test(text)) {
        const [
          workspaceId,
          projectId,
          contactId,
          fromName,
          fromAddress,
          toAddress,
          subject,
          bodyText,
          bodyHtml,
          externalMessageId,
          threadKey,
          metadataJson,
          occurredAt,
        ] = params;
        const row = {
          id: state.nextCommunicationId++,
          workspace_id: workspaceId,
          project_id: projectId,
          contact_id: contactId,
          channel: 'email',
          direction: 'inbound',
          communication_type: 'resend_inbound_email',
          from_name: fromName,
          from_address: fromAddress,
          to_address: toAddress,
          subject,
          body_text: bodyText,
          body_html: bodyHtml,
          external_message_id: externalMessageId,
          thread_key: threadKey,
          provider: 'resend',
          status: 'received',
          language: 'en',
          metadata: JSON.parse(metadataJson || '{}'),
          occurred_at: occurredAt,
        };
        state.communications.push(row);
        return { rows: [row] };
      }
      throw new Error(`Unexpected fake query: ${text.slice(0, 160)}`);
    },
  };
}

test('Resend inbound signature verification requires valid Svix headers and raw payload', () => {
  const id = 'msg_test_signature';
  const timestamp = '1782745800';
  const payload = JSON.stringify({ type: 'email.received', data: { email_id: 'email_123' } });
  const secretBytes = Buffer.from('test-webhook-secret', 'utf8');
  const webhookSecret = `whsec_${secretBytes.toString('base64')}`;
  const signature = signSvixPayload({ id, timestamp, payload, secretBytes });

  const event = verifyResendWebhookSignature({
    payload,
    webhookSecret,
    now: Number(timestamp) * 1000,
    headers: {
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': `v1,${signature}`,
    },
  });

  assert.equal(event.type, 'email.received');
  assert.equal(event.data.email_id, 'email_123');

  assert.throws(
    () => verifyResendWebhookSignature({
      payload,
      webhookSecret,
      now: Number(timestamp) * 1000,
      headers: {
        'svix-id': id,
        'svix-timestamp': timestamp,
        'svix-signature': 'v1,not-valid',
      },
    }),
    /Invalid Resend webhook signature/
  );
});

test('received email helper calls the Resend receiving retrieve endpoint', async () => {
  const calls = [];
  const result = await getReceivedEmail('email/with space', {
    config: {
      apiKey: 'resend-secret-key',
      apiBase: 'https://api.resend.test',
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'email/with space', object: 'email' }),
      };
    },
  });

  assert.equal(result.id, 'email/with space');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.test/emails/receiving/email%2Fwith%20space?html_format=cid');
  assert.equal(calls[0].options.method, 'GET');
});

test('inbound routing recognizes OneTimeOneTime recipients only', () => {
  const recognized = inboundRoutingForEmail(
    { data: { to: ['student@example.test'] } },
    { to: ['Info <info@onetimeonetime.com>'] }
  );
  assert.equal(recognized.recognized, true);
  assert.equal(recognized.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(recognized.project_key, ONE_TIME_PROJECT_KEY);

  const ignored = inboundRoutingForEmail(
    { data: { to: ['office@bneineviimacademy.org'] } },
    { to: ['office@bneineviimacademy.org'] }
  );
  assert.equal(ignored.recognized, false);
  assert.equal(ignored.reason, 'unrecognized_recipient');
});

test('inbound processor ignores non-received events without fetching email', async () => {
  let fetched = false;
  const result = await processResendInboundEvent({
    db: createFakeDb(),
    event: { type: 'email.delivered', data: { email_id: 'sent_1' } },
    fetchReceivedEmail: async () => {
      fetched = true;
      return {};
    },
  });

  assert.equal(result.ignored, true);
  assert.equal(result.reason, 'unsupported_event_type');
  assert.equal(fetched, false);
});

test('inbound processor fetches, stores scoped One Time communication, and dedupes retry', async () => {
  const db = createFakeDb();
  let fetchCount = 0;
  const event = {
    id: 'evt_received_1',
    type: 'email.received',
    data: {
      email_id: 'email_received_1',
      to: ['info@onetimeonetime.com'],
      message_id: '<event-message@example.test>',
    },
  };
  const receivedEmail = {
    id: 'email_received_1',
    from: 'Test Sender <sender@example.test>',
    to: ['info@onetimeonetime.com'],
    subject: 'Question about the Mishnah class',
    text: 'I would like details.',
    html: '<p>I would like details.</p>',
    headers: {
      'message-id': '<message-1@example.test>',
      references: '<earlier@example.test>',
      authorization: 'Bearer should-not-persist',
    },
    attachments: [{ id: 'att_1', filename: 'question.txt', size: 120 }],
    created_at: '2026-06-29T15:00:00.000Z',
  };

  const first = await processResendInboundEvent({
    db,
    event,
    workspaceId: 44,
    projectId: 77,
    fetchReceivedEmail: async (emailId) => {
      fetchCount += 1;
      assert.equal(emailId, 'email_received_1');
      return receivedEmail;
    },
  });

  assert.equal(first.success, true);
  assert.equal(first.ignored, false);
  assert.equal(first.duplicate, false);
  assert.equal(first.fetched, true);
  assert.equal(first.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(first.project_key, ONE_TIME_PROJECT_KEY);
  assert.equal(first.attachment_count, 1);
  assert.equal(db.state.contacts.length, 1);
  assert.equal(db.state.contacts[0].primary_email, 'sender@example.test');
  assert.ok(db.state.contacts[0].tags.includes('resend_inbound'));
  assert.ok(db.state.contacts[0].tags.includes(ONE_TIME_PROJECT_KEY));
  assert.equal(db.state.communications.length, 1);
  assert.equal(db.state.communications[0].external_message_id, 'email_received_1');
  assert.equal(db.state.communications[0].metadata.resend_event_id, 'evt_received_1');
  assert.equal(db.state.communications[0].metadata.email_message_id, '<message-1@example.test>');
  assert.equal(db.state.communications[0].metadata.raw_headers_json.authorization, undefined);
  assert.equal(fetchCount, 1);

  const duplicate = await processResendInboundEvent({
    db,
    event,
    workspaceId: 44,
    projectId: 77,
    fetchReceivedEmail: async () => {
      fetchCount += 1;
      return receivedEmail;
    },
  });

  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.fetched, false);
  assert.equal(duplicate.communication_id, first.communication_id);
  assert.equal(db.state.communications.length, 1);
  assert.equal(fetchCount, 1);
});

test('server exposes raw-body verified Resend inbound route aliases', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.match(server, /app\.post\('\/api\/resend\/inbound', handleResendInboundWebhook\)/);
  assert.match(server, /app\.post\('\/api\/bna\/resend\/inbound', handleResendInboundWebhook\)/);
  assert.match(server, /req\.rawBody = buf\.toString\('utf8'\)/);
  assert.match(server, /verifyResendWebhookSignature\(\{/);
});

test('server explicitly covers Resend outbound status webhook event names', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  [
    'email.sent',
    'email.delivered',
    'email.delivery_delayed',
    'email.bounced',
    'email.complained',
    'email.failed',
    'email.opened',
    'email.clicked',
    'email.suppressed',
  ].forEach((eventName) => assert.match(server, new RegExp(`'${eventName}'`)));
  assert.match(server, /'failed', 'suppressed'/);
  assert.match(server, /'delivery_delayed', 'suppressed', 'webhook_received'/);
});
