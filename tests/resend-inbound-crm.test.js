const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  extractEmailAddresses,
  inboundRoutingForEmail,
  processResendInboundEvent,
} = require('../src/lib/integrations/resend-inbound-crm');

class FakeDb {
  constructor({ duplicateBefore = null, duplicateAfter = null, existingContact = null, threadKey = '' } = {}) {
    this.duplicateBefore = duplicateBefore;
    this.duplicateAfter = duplicateAfter;
    this.existingContact = existingContact;
    this.threadKey = threadKey;
    this.findCount = 0;
    this.queries = [];
    this.contactInsertParams = null;
    this.contactUpdateParams = null;
    this.identityInsertParams = null;
    this.communicationInsertParams = null;
  }

  async query(sql, params = []) {
    const compactSql = String(sql || '').replace(/\s+/g, ' ').trim();
    this.queries.push({ sql: compactSql, params });

    if (compactSql.startsWith('SELECT * FROM bna_communications')) {
      this.findCount += 1;
      if (this.findCount === 1 && this.duplicateBefore) return { rows: [this.duplicateBefore] };
      if (this.findCount > 1 && this.duplicateAfter) return { rows: [this.duplicateAfter] };
      return { rows: [] };
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
        }],
      };
    }

    if (compactSql.startsWith('UPDATE bna_contacts')) {
      this.contactUpdateParams = params;
      return {
        rows: [{
          ...this.existingContact,
          id: params[0],
          full_name: params[1] || this.existingContact?.full_name || null,
          primary_email: params[2] || this.existingContact?.primary_email || null,
        }],
      };
    }

    if (compactSql.startsWith('INSERT INTO bna_contact_identities')) {
      this.identityInsertParams = params;
      return { rows: [] };
    }

    if (compactSql.startsWith('SELECT thread_key FROM bna_communications')) {
      return { rows: this.threadKey ? [{ thread_key: this.threadKey }] : [] };
    }

    if (compactSql.startsWith('INSERT INTO bna_communications')) {
      this.communicationInsertParams = params;
      return {
        rows: [{
          id: 202,
          external_message_id: params[9],
          thread_key: params[10],
        }],
      };
    }

    throw new Error(`Unexpected SQL: ${compactSql.slice(0, 160)}`);
  }
}

test('Resend inbound routing recognizes the One Time address and domain catch-all', () => {
  assert.deepEqual(
    extractEmailAddresses(['Parent <Parent@Example.COM>', { email: 'second@example.com' }]),
    ['parent@example.com', 'second@example.com']
  );

  const direct = inboundRoutingForEmail({}, {
    to: ['One Time <info@onetimeonetime.com>'],
  });
  assert.equal(direct.recognized, true);
  assert.equal(direct.reason, 'primary_inbound_address');
  assert.equal(direct.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(direct.project_key, ONE_TIME_PROJECT_KEY);

  const catchAll = inboundRoutingForEmail({}, {
    to: ['questions@onetimeonetime.com'],
  });
  assert.equal(catchAll.recognized, true);
  assert.equal(catchAll.reason, 'onetime_domain_catch_all');
});

test('non-email.received Resend webhooks are ignored safely', async () => {
  const db = { query: async () => { throw new Error('db should not be queried'); } };
  const result = await processResendInboundEvent({
    db,
    event: { type: 'email.delivered', data: { email_id: 'email_123' } },
    fetchReceivedEmail: async () => {
      throw new Error('fetch should not run');
    },
  });
  assert.equal(result.success, true);
  assert.equal(result.ignored, true);
  assert.equal(result.reason, 'unsupported_event_type');
});

test('duplicate Resend inbound event does not fetch or insert a CRM message', async () => {
  const db = new FakeDb({
    duplicateBefore: {
      id: 303,
      external_message_id: 'email_received_123',
    },
  });
  const result = await processResendInboundEvent({
    db,
    event: { id: 'evt_123', type: 'email.received', data: { email_id: 'email_received_123' } },
    fetchReceivedEmail: async () => {
      throw new Error('fetch should not run for pre-fetch duplicate');
    },
  });
  assert.equal(result.duplicate, true);
  assert.equal(result.fetched, false);
  assert.equal(result.communication_id, 303);
  assert.equal(db.communicationInsertParams, null);
});

test('Resend inbound event fetches full email and stores scoped CRM communication', async () => {
  const db = new FakeDb();
  let fetchedEmailId = '';
  const result = await processResendInboundEvent({
    db,
    workspaceId: 77,
    projectId: 88,
    event: {
      id: 'evt_123',
      __svix_id: 'msg_123',
      type: 'email.received',
      created_at: '2026-06-29T10:00:00.000Z',
      data: {
        email_id: 'email_received_123',
        to: ['One Time <info@onetimeonetime.com>'],
        subject: 'Question about Mishnah class',
      },
    },
    fetchReceivedEmail: async (emailId) => {
      fetchedEmailId = emailId;
      return {
        id: 'email_received_123',
        created_at: '2026-06-29T10:00:05.000Z',
        from: 'Parent Person <Parent@Example.COM>',
        to: ['One Time <info@onetimeonetime.com>'],
        cc: [],
        bcc: [],
        received_for: ['info@onetimeonetime.com'],
        subject: 'Question about Mishnah class',
        text: 'Please call me back.',
        html: '<p>Please call me back.</p>',
        message_id: '<msg123@example.com>',
        headers: {
          'Message-ID': '<msg123@example.com>',
          'In-Reply-To': '<prev@example.com>',
          References: '<older@example.com> <prev@example.com>',
          Authorization: 'should not be stored',
        },
        attachments: [{
          id: 'att_123',
          filename: 'question.pdf',
          content_type: 'application/pdf',
          size: 1234,
        }],
      };
    },
  });

  assert.equal(fetchedEmailId, 'email_received_123');
  assert.equal(result.success, true);
  assert.equal(result.duplicate, false);
  assert.equal(result.communication_id, 202);
  assert.equal(result.contact_id, 101);
  assert.equal(result.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(result.project_key, ONE_TIME_PROJECT_KEY);
  assert.equal(result.attachment_count, 1);

  assert.equal(db.contactInsertParams[0], 77);
  assert.equal(db.contactInsertParams[1], 'Parent Person');
  assert.equal(db.contactInsertParams[2], 'parent@example.com');
  assert.equal(db.identityInsertParams[0], 77);
  assert.equal(db.identityInsertParams[1], 101);
  assert.equal(db.identityInsertParams[2], 'parent@example.com');
  assert.equal(db.identityInsertParams[3], 'parent@example.com');

  const contactLookup = db.queries.find((query) => query.sql.startsWith('SELECT c.* FROM bna_contacts'));
  assert.match(contactLookup.sql, /i\.workspace_id = c\.workspace_id/);
  assert.match(contactLookup.sql, /i\.workspace_id = \$1/);

  const identityInsert = db.queries.find((query) => query.sql.startsWith('INSERT INTO bna_contact_identities'));
  assert.match(identityInsert.sql, /workspace_id, contact_id, identity_type/);
  assert.match(identityInsert.sql, /ON CONFLICT \(workspace_id, identity_type, normalized_value\)/);
  assert.doesNotMatch(identityInsert.sql, /ON CONFLICT \(identity_type, normalized_value\)/);

  const params = db.communicationInsertParams;
  assert.equal(params[0], 77);
  assert.equal(params[1], 88);
  assert.equal(params[2], 101);
  assert.equal(params[4], 'parent@example.com');
  assert.equal(params[5], 'info@onetimeonetime.com');
  assert.equal(params[7], 'Please call me back.');
  assert.equal(params[8], '<p>Please call me back.</p>');
  assert.equal(params[9], 'email_received_123');

  const metadata = JSON.parse(params[11]);
  assert.equal(metadata.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(metadata.project_key, ONE_TIME_PROJECT_KEY);
  assert.equal(metadata.resend_event_id, 'evt_123');
  assert.equal(metadata.resend_received_email_id, 'email_received_123');
  assert.equal(metadata.email_message_id, '<msg123@example.com>');
  assert.deepEqual(metadata.received_for, ['info@onetimeonetime.com']);
  assert.equal(metadata.raw_headers_json.Authorization, undefined);
  assert.equal(metadata.attachment_metadata_json[0].filename, 'question.pdf');
});

test('duplicate after received-email fetch is deduped by message id', async () => {
  const db = new FakeDb({
    duplicateAfter: {
      id: 404,
      external_message_id: 'email_received_existing',
    },
  });
  const result = await processResendInboundEvent({
    db,
    workspaceId: 77,
    projectId: 88,
    event: {
      id: 'evt_456',
      type: 'email.received',
      data: { email_id: 'email_received_456', to: ['info@onetimeonetime.com'] },
    },
    fetchReceivedEmail: async () => ({
      id: 'email_received_456',
      from: 'Parent <parent@example.com>',
      to: ['info@onetimeonetime.com'],
      message_id: '<already-known@example.com>',
    }),
  });
  assert.equal(result.duplicate, true);
  assert.equal(result.fetched, true);
  assert.equal(result.communication_id, 404);
  assert.equal(db.communicationInsertParams, null);
});
