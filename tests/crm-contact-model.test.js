'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeEmail,
  normalizePhone,
  humanCrmSourceLabel,
  crmListLimit,
  decodeCrmCursor,
  encodeCrmCursor,
  toContactCard,
  filterCrmContacts,
  filterProviderContactInbox,
  buildTimeline,
} = require('../src/lib/bna/crm-contact-model');

test('normalizes email and Israel-style phone fallback', () => {
  assert.equal(normalizeEmail(' Test@Example.COM '), 'test@example.com');
  assert.equal(normalizePhone('052-123-4567'), '+972521234567');
  assert.equal(normalizePhone('+1 (555) 100-2000'), '+15551002000');
});

test('maps mixed source row into contact card', () => {
  const card = toContactCard({
    id: 7,
    display_name: 'Mrs. Cohen',
    email: 'COHEN@example.com',
    phone: '0521112222',
    lead_type: 'school_interest',
    tags: 'hot, phonebook',
    lead_status: 'new',
    notes: 'Asked about school',
  }, { source: 'bna_parent_leads', workspace_key: 'bna_school' });

  assert.equal(card.display_name, 'Mrs. Cohen');
  assert.equal(card.email, 'cohen@example.com');
  assert.equal(card.phone, '+972521112222');
  assert.equal(card.contact_type, 'school_interest');
  assert.deepEqual(card.tags, ['hot', 'phonebook']);
});

test('CRM source labels hide internal table names', () => {
  assert.equal(humanCrmSourceLabel('bna_parent_leads'), 'Lead intake');
  assert.equal(humanCrmSourceLabel('bna_contacts'), 'First-party contact');
  assert.equal(humanCrmSourceLabel('bna_contact_pipeline_events'), 'Timeline note');
  assert.equal(humanCrmSourceLabel('one_time_free_class'), 'One Time free class');
  assert.equal(humanCrmSourceLabel('bna_unknown_private_table'), 'First-party CRM');

  const card = toContactCard({
    id: 11,
    source_table: 'bna_parent_leads',
    parent_name: 'Parent Lead',
    parent_email: 'lead@example.test',
  });
  assert.equal(card.source_label, 'Lead intake');
  assert.doesNotMatch(card.source_label, /^bna_/);
});

test('maps first-party CRM reconciled context into one contact DTO', () => {
  const card = toContactCard({
    id: 'bna_parent_leads:88',
    parent_lead_id: 88,
    parent_name: 'Mrs. Levi',
    parent_email: 'levi@example.test',
    parent_phone: '+1 555 010 1188',
    student_name: 'Levi Student',
    lead_type: 'school_interest',
    status: 'follow_up',
    owner: 'Rabbi Scheller team',
    next_follow_up_at: '2026-07-20',
    tags: ['free-class-interest', 'trial-review'],
    membership_access: {
      member_id: 14,
      access_status: 'active',
      access_tier: 'library_only',
      access_enabled: true,
    },
    mailbox: {
      message_count: 3,
      latest_thread_key: 'thread-levi',
      latest_subject: 'Class details',
    },
    support: {
      open_ticket_count: 1,
      latest_ticket_id: 22,
      latest_ticket_title: 'Portal question',
    },
    follow_up_task: {
      task_id: 31,
      assigned_to: 'Rabbi Scheller team',
      due_date: '2026-07-20',
      status: 'assigned',
    },
    class_context: {
      trial_status: 'trial_or_free_class_interest',
      access_context: 'parent portal pending',
    },
    timeline_activity: {
      activity_count: 5,
      latest_activity_type: 'dashboard',
    },
  }, { source: 'bna_parent_leads', workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' });

  assert.equal(card.family_school_classification, 'school');
  assert.equal(card.linked.parent_lead_id, 88);
  assert.equal(card.linked.parent_name, 'Mrs. Levi');
  assert.equal(card.linked.student_name, 'Levi Student');
  assert.equal(card.membership_access.member_id, 14);
  assert.equal(card.mailbox.message_count, 3);
  assert.equal(card.support.open_ticket_count, 1);
  assert.equal(card.follow_up_task.task_id, 31);
  assert.equal(card.class_context.trial_status, 'trial_or_free_class_interest');
  assert.equal(card.timeline_activity.activity_count, 5);
  assert.ok(card.editable_fields.includes('email'));
});

test('free provider cannot access full CRM filters', () => {
  const scope = { tenant_type: 'service_provider', entitlement_plan: 'free_provider' };
  assert.throws(() => filterCrmContacts([], {}, scope), /Entitlement denied: crm_contacts/);
});

test('provider plus can filter CRM contacts', () => {
  const rows = [
    { id: 1, display_name: 'Parent A', contact_type: 'parent', status: 'new', tags: ['hot'], updated_at: '2026-06-25T10:00:00Z' },
    { id: 2, display_name: 'Provider B', contact_type: 'provider', status: 'active', tags: ['vendor'], updated_at: '2026-06-24T10:00:00Z' },
  ];
  const scope = { tenant_type: 'service_provider', entitlement_plan: 'service_provider_plus', workspace_key: 'provider_plus' };
  const result = filterCrmContacts(rows, { contact_type: 'parent', tag: 'hot' }, scope);

  assert.equal(result.total, 2);
  assert.equal(result.filtered_total, 1);
  assert.equal(result.cards[0].display_name, 'Parent A');
  assert.ok(result.filters.contact_types.includes('parent'));
});

test('CRM contacts paginate with default and capped limits', () => {
  const rows = Array.from({ length: 120 }, (_, index) => ({
    id: index + 1,
    display_name: `Parent ${String(index + 1).padStart(3, '0')}`,
    contact_type: 'parent',
    status: 'new',
    tags: ['hot'],
    updated_at: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
  }));
  const scope = {
    tenant_type: 'service_provider',
    entitlement_plan: 'service_provider_plus',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  };
  const firstPage = filterCrmContacts(rows, {}, scope);

  assert.equal(firstPage.cards.length, 50);
  assert.equal(firstPage.limit, 50);
  assert.equal(firstPage.returned_count, 50);
  assert.equal(firstPage.has_more, true);
  assert.ok(firstPage.next_cursor);

  const secondPage = filterCrmContacts(rows, { cursor: firstPage.next_cursor, limit: 200 }, scope);
  assert.equal(secondPage.limit, 100);
  assert.equal(secondPage.cards.length, 70);
  assert.equal(secondPage.has_more, false);
  assert.equal(secondPage.next_cursor, null);

  assert.equal(crmListLimit(0), 50);
  assert.equal(crmListLimit(999), 100);
  assert.deepEqual(decodeCrmCursor(encodeCrmCursor(25)), { offset: 25 });
});

test('CRM pagination keeps 10000-contact fixture payload page-sized', () => {
  const rows = Array.from({ length: 10000 }, (_, index) => ({
    id: index + 1,
    display_name: `Contact ${index + 1}`,
    contact_type: index % 2 === 0 ? 'parent' : 'student',
    status: 'new',
    tags: index % 3 === 0 ? ['trial'] : [],
    updated_at: new Date(Date.UTC(2026, 0, 1, 0, 0, index % 60)).toISOString(),
  }));
  const scope = {
    tenant_type: 'service_provider',
    entitlement_plan: 'service_provider_plus',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  };
  const result = filterCrmContacts(rows, { limit: 50 }, scope);

  assert.equal(result.total, 10000);
  assert.equal(result.filtered_total, 10000);
  assert.equal(result.cards.length, 50);
  assert.equal(result.returned_count, 50);
  assert.equal(result.has_more, true);
  assert.ok(result.next_cursor);
});

test('free provider can access limited contact inquiry inbox', () => {
  const rows = [
    { id: 1, parent_display_name: 'Parent A', parent_phone: '0521234567', body: 'Can my son join?', inquiry_status: 'new' },
  ];
  const scope = { tenant_type: 'service_provider', entitlement_plan: 'free_provider', workspace_key: 'provider_free' };
  const result = filterProviderContactInbox(rows, {}, scope);

  assert.equal(result.cards.length, 1);
  assert.equal(result.cards[0].contact_type, 'provider_inquiry');
  assert.equal(result.cards[0].phone, '+972521234567');
});

test('timeline is read-only/no-send', () => {
  const timeline = buildTimeline([
    { id: 1, source: 'whatsapp', body: 'Question about class', created_at: '2026-06-25T09:00:00Z' },
  ]);

  assert.equal(timeline.length, 1);
  assert.equal(timeline[0].no_send, true);
  assert.equal(timeline[0].external_write_performed, false);
});
