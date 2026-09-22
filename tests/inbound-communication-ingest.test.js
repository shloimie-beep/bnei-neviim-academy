const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ingestInboundCommunication,
} = require('../src/lib/bna/crm/ingest-inbound-communication');

class FakeDb {
  constructor({ existingCommunication = null, existingContact = null } = {}) {
    this.existingCommunication = existingCommunication;
    this.existingContact = existingContact;
    this.queries = [];
    this.contactInsertParams = null;
    this.identityInserts = [];
    this.communicationInsertParams = null;
  }

  async query(sql, params = []) {
    const compactSql = String(sql || '').replace(/\s+/g, ' ').trim();
    this.queries.push({ sql: compactSql, params });

    if (compactSql.startsWith('SELECT * FROM bna_communications')) {
      return { rows: this.existingCommunication ? [this.existingCommunication] : [] };
    }

    if (compactSql.startsWith('SELECT id FROM bna_workspace_settings')) {
      return { rows: [{ id: 77 }] };
    }

    if (compactSql.startsWith('SELECT id FROM bna_projects')) {
      return { rows: [{ id: 88 }] };
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
          status: params[4],
          source: params[5],
        }],
      };
    }

    if (compactSql.startsWith('UPDATE bna_contacts')) {
      return { rows: [{ ...this.existingContact, id: params[0] }] };
    }

    if (compactSql.startsWith('INSERT INTO bna_contact_identities')) {
      this.identityInserts.push(params);
      return { rows: [{ id: this.identityInserts.length, contact_id: params[1] }] };
    }

    if (compactSql.startsWith('SELECT thread_key FROM bna_communications')) {
      return { rows: [] };
    }

    if (compactSql.startsWith('INSERT INTO bna_communications')) {
      this.communicationInsertParams = params;
      return {
        rows: [{
          id: 202,
          workspace_id: params[0],
          project_id: params[1],
          contact_id: params[2],
          channel: params[3],
          direction: params[4],
          communication_type: params[5],
          external_message_id: params[12],
          thread_key: params[13],
          provider: params[14],
        }],
      };
    }

    throw new Error(`Unexpected SQL: ${compactSql.slice(0, 180)}`);
  }
}

test('canonical inbound pipeline creates scoped WhatsApp contact and message without a task', async () => {
  const db = new FakeDb();
  const result = await ingestInboundCommunication({
    db,
    binding: {
      workspaceKey: 'rabbi_sheller_provider',
      projectKey: 'one_time_mishnah_class',
      channelId: 'wapi:one_time_whatsapp',
      replyMode: 'capture_only',
    },
    channel: 'whatsapp',
    provider: 'wapi',
    communicationType: 'wapi_inbound_whatsapp',
    providerMessageId: 'wamid.123',
    providerEventId: 'evt-wapi-123',
    sender: {
      displayName: 'Parent Example',
      phone: '+972 50 111 2222',
      whatsapp: '+972 50 111 2222',
    },
    recipients: ['+972 2 000 0000'],
    bodyText: 'Can I get the class details?',
    threadHints: { chatId: '972501112222@s.whatsapp.net', wapiMessageId: 'wamid.123' },
    metadata: { wapi_message_id: 'wamid.123' },
    contact: {
      source: 'whatsapp',
      lifecycle: 'New Inquiry',
      tags: ['one-time', 'whatsapp', 'wapi_inbound'],
    },
    createContactOnInbound: true,
    createConversationOnInbound: true,
    createTaskOnInbound: false,
  });

  assert.equal(result.success, true);
  assert.equal(result.duplicate, false);
  assert.equal(result.contact_id, 101);
  assert.equal(result.communication_id, 202);
  assert.equal(result.thread_key, 'wapi:972501112222@s.whatsapp.net');
  assert.equal(result.task_created, false);

  assert.equal(db.contactInsertParams[0], 77);
  assert.equal(db.contactInsertParams[1], 'Parent Example');
  assert.equal(db.contactInsertParams[3], '972501112222');
  assert.equal(db.contactInsertParams[4], 'lead');
  assert.equal(db.contactInsertParams[5], 'whatsapp');

  const identityTypes = db.identityInserts.map((params) => params[2]).sort();
  assert.deepEqual(identityTypes, ['phone', 'whatsapp']);
  assert.ok(db.identityInserts.every((params) => params[0] === 77));
  assert.ok(db.identityInserts.every((params) => params[1] === 101));
  assert.ok(db.identityInserts.every((params) => params[4] === '972501112222'));

  const params = db.communicationInsertParams;
  assert.equal(params[0], 77);
  assert.equal(params[1], 88);
  assert.equal(params[2], 101);
  assert.equal(params[3], 'whatsapp');
  assert.equal(params[4], 'inbound');
  assert.equal(params[5], 'wapi_inbound_whatsapp');
  assert.equal(params[12], 'wamid.123');
  assert.equal(params[14], 'wapi');

  const metadata = JSON.parse(params[16]);
  assert.equal(metadata.workspace_key, 'rabbi_sheller_provider');
  assert.equal(metadata.project_key, 'one_time_mishnah_class');
  assert.equal(metadata.wapi_message_id, 'wamid.123');
  assert.equal(metadata.inbound_pipeline_version, '2026-07-13-v1');
  assert.equal(metadata.create_contact_on_inbound, true);
  assert.equal(metadata.create_conversation_on_inbound, true);
  assert.equal(metadata.create_task_on_inbound, false);
  assert.equal(metadata.task_created, false);
  assert.equal(metadata.unread, true);
  assert.equal(metadata.redacted_receipt, true);
  assert.equal(db.queries.some((query) => /bna_tasks/i.test(query.sql)), false);
});

test('canonical inbound pipeline dedupes provider message ids before contact writes', async () => {
  const db = new FakeDb({
    existingCommunication: {
      id: 303,
      contact_id: 404,
      external_message_id: 'wamid.duplicate',
      thread_key: 'wapi:thread',
    },
  });
  const result = await ingestInboundCommunication({
    db,
    binding: { workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' },
    channel: 'whatsapp',
    provider: 'wapi',
    providerMessageId: 'wamid.duplicate',
    sender: { phone: '+972501112222' },
    bodyText: 'Duplicate message',
    metadata: { wapi_message_id: 'wamid.duplicate' },
  });

  assert.equal(result.success, true);
  assert.equal(result.duplicate, true);
  assert.equal(result.communication_id, 303);
  assert.equal(result.contact_id, 404);
  assert.equal(db.contactInsertParams, null);
  assert.equal(db.communicationInsertParams, null);
});
