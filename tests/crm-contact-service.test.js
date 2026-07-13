'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createContactService,
  normalizeContactFilters,
  normalizePageOptions,
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

test('CRM contact service returns separate conversations and tasks DTO envelopes', async () => {
  const service = createContactService({
    model: crmContactModel,
    listContactRows: async () => [],
    timelineRows: async () => [
      {
        id: 11,
        channel: 'whatsapp',
        direction: 'inbound',
        body: 'Can my school join?',
        source: 'wapi',
        thread_key: 'phone:972501112222',
        from_address: '+972 50 111 2222',
        occurred_at: '2026-07-12T13:00:00Z',
        communication_type: 'communication',
      },
      {
        id: 13,
        channel: 'support',
        direction: 'internal',
        body: 'Support ticket OT-SUP-000013: Login link trouble',
        source: 'bna_support_tickets',
        source_context: JSON.stringify({
          support_ticket_id: 13,
          ticket_number: 'OT-SUP-000013',
          status: 'triage',
          no_send: true,
          external_write_performed: false,
        }),
        occurred_at: '2026-07-12T13:15:00Z',
        communication_type: 'support_ticket',
      },
      {
        id: 17,
        channel: 'internal_note',
        direction: 'internal_note',
        body: 'Manual note from the first-party contact timeline.',
        source: 'manual',
        source_context: JSON.stringify({
          crm_contact_id: 'bna_contacts:7',
          source_table: 'bna_contact_communications',
          canonical_note_match: true,
          no_send: true,
          external_write_performed: false,
        }),
        occurred_at: '2026-07-12T13:16:00Z',
        communication_type: 'contact_note',
      },
      {
        id: 12,
        channel: 'task',
        direction: 'internal',
        body: 'Follow up with school',
        source_context: JSON.stringify({
          task_id: 99,
          assigned_to: 'Rabbi Scheller team',
          due_date: '2026-07-15',
          stage: 'assigned',
        }),
        communication_type: 'follow_up_task',
      },
      {
        id: 14,
        channel: 'student',
        direction: 'internal',
        body: 'Student linked: Levi Student',
        source: 'bna_students',
        source_context: JSON.stringify({
          student_id: 14,
          status: 'active',
          no_send: true,
          external_write_performed: false,
        }),
        occurred_at: '2026-07-12T13:20:00Z',
        communication_type: 'student_link',
      },
      {
        id: 15,
        channel: 'membership',
        direction: 'internal',
        body: 'Membership linked: Levi Family - active',
        source: 'bna_members',
        source_context: JSON.stringify({
          member_id: 15,
          access_status: 'active',
          access_enabled: true,
          no_send: true,
          external_write_performed: false,
        }),
        occurred_at: '2026-07-12T13:21:00Z',
        communication_type: 'membership_access',
      },
      {
        id: 16,
        channel: 'attendance',
        direction: 'internal',
        body: 'Class attendance: One Time Mishnayos - checked in',
        source: 'bna_live_class_attendance',
        source_context: JSON.stringify({
          attendance_id: 16,
          live_session_id: 31,
          member_id: 15,
          attendance_status: 'checked_in',
          no_send: true,
          external_write_performed: false,
        }),
        occurred_at: '2026-07-12T13:22:00Z',
        communication_type: 'class_attendance',
      },
      {
        id: -7,
        channel: 'suppression',
        direction: 'internal',
        body: 'WhatsApp is not available for this contact.',
        source: 'crm_suppression',
        source_context: JSON.stringify({
          crm_contact_id: 'bna_contacts:7',
          suppression_status: 'whatsapp_wrong_number',
          whatsapp_suppressed: true,
          no_send: true,
          external_write_performed: false,
        }),
        occurred_at: '2026-07-12T13:23:00Z',
        communication_type: 'communication_suppression',
      },
    ],
  });

  const conversations = await service.getContactConversations('bna_contacts:7', { workspace_key: 'rabbi_sheller_provider' }, { limit: 1 });
  const expandedConversations = await service.getContactConversations('bna_contacts:7', { workspace_key: 'rabbi_sheller_provider' }, { limit: 5 });
  const tasks = await service.getContactTasks('bna_contacts:7', { workspace_key: 'rabbi_sheller_provider' }, { limit: 5 });
  const timeline = await service.getContactTimeline('bna_contacts:7', { workspace_key: 'rabbi_sheller_provider' });

  assert.equal(conversations.success, true);
  assert.equal(conversations.contact_key, 'bna_contacts:7');
  assert.equal(conversations.conversations.length, 1);
  assert.equal(conversations.conversations[0].channel, 'whatsapp');
  assert.equal(conversations.conversations.some((item) => item.communication_type === 'support_ticket'), false);
  assert.equal(conversations.conversations.some((item) => item.communication_type === 'student_link'), false);
  assert.equal(conversations.conversations.some((item) => item.communication_type === 'membership_access'), false);
  assert.equal(conversations.conversations.some((item) => item.communication_type === 'class_attendance'), false);
  assert.equal(conversations.conversations.some((item) => item.communication_type === 'communication_suppression'), false);
  assert.equal(conversations.conversations[0].open_action, 'whatsapp');
  assert.equal(conversations.conversations[0].thread_key, 'phone:972501112222');
  assert.equal(conversations.conversations[0].from_address, '+972 50 111 2222');
  assert.equal(conversations.conversations[0].no_send, true);
  assert.equal(conversations.page.limit, 1);
  assert.equal(expandedConversations.conversations.some((item) => item.communication_type === 'contact_note'), true);
  assert.equal(expandedConversations.conversations.find((item) => item.communication_type === 'contact_note').source, 'manual');

  assert.equal(tasks.success, true);
  assert.equal(tasks.contact_key, 'bna_contacts:7');
  assert.equal(tasks.tasks.length, 1);
  assert.equal(tasks.tasks[0].id, 99);
  assert.equal(tasks.tasks[0].assigned_to, 'Rabbi Scheller team');
  assert.equal(tasks.tasks[0].due_date, '2026-07-15');
  assert.equal(tasks.tasks[0].external_write_performed, false);

  assert.equal(timeline.timeline.some((item) => item.type === 'support_ticket'), true);
  assert.match(timeline.timeline.find((item) => item.type === 'support_ticket').body, /Support ticket OT-SUP-000013/);
  assert.equal(timeline.timeline.some((item) => item.type === 'student_link'), true);
  assert.equal(timeline.timeline.some((item) => item.type === 'membership_access'), true);
  assert.equal(timeline.timeline.some((item) => item.type === 'class_attendance'), true);
  assert.equal(timeline.timeline.some((item) => item.type === 'communication_suppression'), true);
  assert.equal(timeline.timeline.find((item) => item.type === 'communication_suppression').no_send, true);
});

test('CRM contact service filter and ref helpers are stable', () => {
  assert.deepEqual(parseCrmContactRef('bna_parent_leads:7'), { source: 'bna_parent_leads', id: 7 });
  assert.deepEqual(parseCrmContactRef('unsafe:7'), { source: 'bna_contacts', id: 7 });
  assert.deepEqual(normalizePageOptions({ limit: 500, cursor: 'abc' }), { limit: 100, cursor: 'abc' });
  assert.deepEqual(normalizePageOptions({ limit: 0 }), { limit: 1, cursor: null });
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
