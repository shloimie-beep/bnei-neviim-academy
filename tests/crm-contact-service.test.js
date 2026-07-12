'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createContactService,
  normalizeContactFilters,
  parseCrmContactRef,
} = require('../src/lib/bna/crm/contact-service');
const crmContactModel = require('../src/lib/bna/crm-contact-model');

test('CRM contact service returns canonical list DTO envelope', async () => {
  const calls = [];
  const service = createContactService({
    model: crmContactModel,
    listContactRows: async (scope, filters) => {
      calls.push({ scope, filters });
      return [
        {
          id: 1,
          display_name: 'One Time Parent',
          parent_email: 'PARENT@example.test',
          parent_phone: '052-111-2222',
          lead_type: 'school_interest',
          status: 'new',
          tags: ['trial'],
        },
      ];
    },
    timelineRows: async () => [],
  });

  const payload = await service.listContacts(
    {
      tenant_type: 'service_provider',
      entitlement_plan: 'service_provider_plus',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    { search: 'parent', limit: 10 }
  );

  assert.equal(payload.success, true);
  assert.equal(payload.aggregate_service, 'bna_crm_contact_service_v1');
  assert.equal(payload.external_write_performed, false);
  assert.equal(payload.no_send, true);
  assert.equal(payload.cards.length, 1);
  assert.equal(payload.cards[0].email, 'parent@example.test');
  assert.equal(payload.cards[0].workspace_key, 'rabbi_sheller_provider');
  assert.equal(calls[0].filters.contact_type, 'all');
  assert.equal(calls[0].filters.search, 'parent');
});

test('CRM contact service returns canonical timeline DTO envelope', async () => {
  const service = createContactService({
    model: crmContactModel,
    listContactRows: async () => [],
    timelineRows: async (contactRef, scope) => {
      assert.deepEqual(contactRef, { source: 'bna_parent_leads', id: 42 });
      assert.equal(scope.workspace_key, 'rabbi_sheller_provider');
      return [
        {
          id: 8,
          channel: 'email',
          direction: 'inbound',
          body: 'Question',
          source: 'resend',
          occurred_at: '2026-07-12T12:00:00Z',
        },
      ];
    },
  });

  const payload = await service.getContactTimeline('bna_parent_leads:42', {
    workspace_key: 'rabbi_sheller_provider',
  });

  assert.equal(payload.success, true);
  assert.equal(payload.contact_key, 'bna_parent_leads:42');
  assert.equal(payload.timeline.length, 1);
  assert.equal(payload.timeline[0].channel, 'email');
  assert.equal(payload.timeline[0].no_send, true);
  assert.equal(payload.external_write_performed, false);
});

test('CRM contact service filter and ref helpers are stable', () => {
  assert.deepEqual(parseCrmContactRef('bna_parent_leads:7'), { source: 'bna_parent_leads', id: 7 });
  assert.deepEqual(parseCrmContactRef('unsafe:7'), { source: 'bna_contacts', id: 7 });
  assert.deepEqual(normalizeContactFilters({ search: 'abc' }), {
    contact_type: 'all',
    status: 'all',
    source: 'all',
    tag: 'all',
    search: 'abc',
    sort_key: 'last_contact_desc',
    limit: undefined,
    cursor: undefined,
  });
});
