const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildInboundPipelineReceipt,
  ingestInboundCommunication,
} = require('../src/lib/bna/crm/ingest-inbound-communication');

class FakeDb {
  constructor({ duplicate = null, existingContact = null, threadKey = '' } = {}) {
    this.duplicate = duplicate;
    this.existingContact = existingContact;
    this.threadKey = threadKey;
    this.queries = [];
    this.contactInsertParams = null;
    this.identityInsertParams = [];
    this.communicationInsertParams = null;
  }

  async query(sql, params = []) {
    const compactSql = String(sql || '').replace(/\s+/g, ' ').trim();
    this.queries.push({ sql: compactSql, params });

    if (compactSql === 'SELECT id FROM bna_workspace_settings WHERE workspace_key = $1 LIMIT 1') {
      return { rows: [{ id: 77 }] };
    }

    if (compactSql === 'SELECT id FROM bna_projects WHERE project_key = $1 LIMIT 1') {
      return { rows: [{ id: 88 }] };
    }

    if (compactSql.startsWith('SELECT * FROM bna_communications')) {
      return { rows: this.duplicate ? [this.duplicate] : [] };
    }

    if (compactSql.startsWith('SELECT c.* FROM bna_contacts')) {
      return { rows: this.existingContact ? [this.existingContact] : [] };
    }

    if (compactSql.startsWith('INSERT INTO bna_contacts')) {
      this.contactInsertParams = params;
      return {
        rows: [{
          id: 101,
          workspace_id: params[0],
          full_name: params[1],
          primary_email: params[2],
          primary_phone: params[3],
        }],
      };
    }

    if (compactSql.startsWith('INSERT INTO bna_contact_identities')) {
      this.identityInsertParams.push(params);
      return { rows: [{ id: this.identityInsertParams.length, contact_id: params[1], identity_type: params[2] }] };
    }

    if (compactSql.startsWith('SELECT thread_key FROM bna_communications')) {
      return { rows: this.threadKey ? [{ thread_key: this.threadKey }] : [] };
    }

    if (compactSql.startsWith('INSERT INTO bna_communications')) {
      this.communicationInsertParams = params;
      return {
        rows: [{
          id: 202,
          contact_id: params[2],
          external_message_id: params[12],
          thread_key: params[13],
        }],
      };
    }

    throw new Error(`Unexpected SQL: ${compactSql.slice(0, 180)}`);
  }
}

test('inbound service resolves binding, contact, conversation, message, unread, agent, and outbox metadata', async () => {
  const db = new FakeDb();
  const result = await ingestInboundCommunication({
    db,
    binding: {
      workspaceKey: 'rabbi_sheller_provider',
      projectKey: 'one_time_mishnah_class',
      replyMode: 'draft',
    },
    channel: 'email',
    provider: 'resend',
    communicationType: 'resend_inbound_email',
    providerMessageId: 'email_received_secret_123',
    providerEventId: 'evt_secret_123',
    sender: {
      displayName: 'Sender Person',
      email: 'sender@example.com',
    },
    recipients: ['info@onetimeonetime.com'],
    subject: 'Question',
    bodyText: 'Private message body should stay out of receipts.',
    bodyHtml: '<p>Private html should stay out of receipts.</p>',
    threadHints: {
      emailMessageId: '<msg-secret@example.com>',
    },
    metadata: {
      raw_headers_json: { subject: 'Question' },
    },
    contact: {
      source: 'resend_inbound',
      tags: ['resend_inbound', 'one_time_mishnah_class'],
      metadata: { workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' },
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.duplicate, false);
  assert.equal(result.communication_id, 202);
  assert.equal(result.contact_id, 101);
  assert.equal(result.workspace_key, 'rabbi_sheller_provider');
  assert.equal(result.project_key, 'one_time_mishnah_class');

  assert.equal(db.contactInsertParams[0], 77);
  assert.equal(db.contactInsertParams[2], 'sender@example.com');
  assert.equal(db.identityInsertParams[0][2], 'email');
  assert.equal(db.communicationInsertParams[0], 77);
  assert.equal(db.communicationInsertParams[1], 88);
  assert.equal(db.communicationInsertParams[3], 'email');
  assert.equal(db.communicationInsertParams[4], 'inbound');
  assert.equal(db.communicationInsertParams[12], 'email_received_secret_123');

  const metadata = JSON.parse(db.communicationInsertParams[16]);
  assert.equal(metadata.inbound_pipeline_version, '2026-07-13-v1');
  assert.equal(metadata.binding_resolved, true);
  assert.equal(metadata.contact_resolution_status, 'resolved');
  assert.equal(metadata.conversation_resolved, true);
  assert.equal(metadata.message_persisted, true);
  assert.equal(metadata.timeline_projection, 'operations_communications_unified_timeline');
  assert.equal(metadata.unread, true);
  assert.equal(metadata.agent_loaded, false);
  assert.equal(metadata.agent_reply_mode, 'draft');
  assert.equal(metadata.outbox_status, 'not_created');
  assert.equal(metadata.external_write_performed, false);

  assert.equal(result.receipt.redacted_receipt, true);
  assert.equal(result.receipt.sender.email_masked, 's***r@example.com');
  assert.equal(result.receipt.body_returned, false);
  assert.equal(result.receipt.html_returned, false);
  assert.equal(result.receipt.raw_headers_returned, false);
  assert.equal(result.receipt.external_write_performed, false);
  assert.doesNotMatch(JSON.stringify(result.receipt), /Private message body|sender@example\.com|email_received_secret_123|evt_secret_123/i);
});

test('inbound service accepts WhatsApp-shaped adapter input without creating an outbox send', async () => {
  const db = new FakeDb();
  const result = await ingestInboundCommunication({
    db,
    binding: {
      workspaceId: 77,
      projectId: 88,
      workspaceKey: 'rabbi_sheller_provider',
      projectKey: 'one_time_mishnah_class',
      replyMode: 'capture_only',
    },
    channel: 'whatsapp',
    provider: 'wapi',
    communicationType: 'wapi_inbound_message',
    providerMessageId: 'wamid.secret.123',
    sender: {
      displayName: 'WhatsApp Lead',
      whatsapp: '+1 (555) 123-4567',
    },
    recipients: ['One Time WAPI sender'],
    bodyText: 'I want to join the class.',
    threadHints: {
      chatId: 'chat-secret-123',
      wapiMessageId: 'wamid.secret.123',
    },
    metadata: {
      wapi_message_id: 'wamid.secret.123',
      source: 'wapi_webhook',
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.provider, 'wapi');
  assert.equal(result.channel, 'whatsapp');
  assert.equal(db.identityInsertParams[0][2], 'whatsapp');
  assert.equal(db.identityInsertParams[0][4], '15551234567');
  assert.equal(db.communicationInsertParams[3], 'whatsapp');

  const metadata = JSON.parse(db.communicationInsertParams[16]);
  assert.equal(metadata.sender_identity_type, 'whatsapp');
  assert.equal(metadata.unread, true);
  assert.equal(metadata.outbox_status, 'not_created');
  assert.equal(metadata.external_write_performed, false);

  assert.equal(result.receipt.sender.phone_masked.endsWith('4567'), true);
  assert.equal(result.receipt.outbox_status, 'not_created');
  assert.equal(result.receipt.external_write_performed, false);
  assert.doesNotMatch(JSON.stringify(result.receipt), /15551234567|\+1 \(555\) 123-4567|I want to join/i);
});

test('duplicate inbound messages return a redacted no-send receipt without inserting', async () => {
  const db = new FakeDb({
    duplicate: {
      id: 303,
      contact_id: 404,
      external_message_id: 'email_received_existing',
      thread_key: 'resend:existing-thread',
    },
  });
  const result = await ingestInboundCommunication({
    db,
    binding: {
      workspaceKey: 'rabbi_sheller_provider',
      projectKey: 'one_time_mishnah_class',
      replyMode: 'draft',
    },
    channel: 'email',
    provider: 'resend',
    providerMessageId: 'email_received_existing',
    sender: { email: 'duplicate@example.com' },
    bodyText: 'Duplicate private body.',
  });

  assert.equal(result.duplicate, true);
  assert.equal(result.communication_id, 303);
  assert.equal(result.contact_id, 404);
  assert.equal(db.communicationInsertParams, null);
  assert.equal(result.receipt.duplicate, true);
  assert.equal(result.receipt.body_returned, false);
  assert.equal(result.receipt.external_write_performed, false);
  assert.doesNotMatch(JSON.stringify(result.receipt), /duplicate@example\.com|Duplicate private body|email_received_existing/i);
});

test('standalone receipts redact provider identifiers and raw identities', () => {
  const receipt = buildInboundPipelineReceipt({
    channel: 'telegram',
    provider: 'telegram',
    workspaceKey: 'bna',
    projectKey: 'bna_academy',
    providerMessageId: 'telegram-message-secret',
    providerEventId: 'telegram-event-secret',
    sender: { phone: '+972 50 111 2222' },
  });

  assert.equal(receipt.redacted_receipt, true);
  assert.equal(receipt.sender.phone_masked.endsWith('2222'), true);
  assert.doesNotMatch(JSON.stringify(receipt), /telegram-message-secret|telegram-event-secret|\+972 50 111 2222|972501112222/i);
});
