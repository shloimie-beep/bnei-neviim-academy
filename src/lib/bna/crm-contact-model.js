'use strict';

const {
  ENTITLEMENTS,
  hasEntitlement,
  assertEntitlement,
} = require('./account-scope-entitlements');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  if (!digits.startsWith('+')) {
    // Israel-friendly fallback; Codex can replace with existing repo normalizer.
    if (digits.startsWith('0')) digits = `+972${digits.slice(1)}`;
  }
  return digits;
}

function splitTags(value) {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return splitTags(parsed);
    } catch (_) {}
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function deriveContactType(row = {}) {
  const raw = String(
    row.contact_type ||
    row.lead_type ||
    row.role ||
    row.person_type ||
    row.provider_role ||
    ''
  ).toLowerCase();

  if (raw.includes('parent')) return 'parent';
  if (raw.includes('student')) return 'student';
  if (raw.includes('provider')) return 'provider';
  if (raw.includes('school_interest')) return 'school_interest';
  if (raw.includes('content_interest')) return 'content_interest';
  if (raw.includes('group_member')) return 'group_member';
  if (raw.includes('accountability_interest')) return 'accountability_interest';
  if (raw.includes('friend')) return 'friend_non_lead';
  if (raw.includes('spam')) return 'spam_irrelevant';
  return raw || 'general_contact';
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function parseObject(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }
  return {};
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function deriveFamilySchoolClassification(row = {}, contactType = '') {
  const raw = String(firstNonEmpty(
    row.family_school_classification,
    row.classification,
    row.signup_as,
    row.audience_type,
    row.contact_segment,
    row.lead_type,
    contactType
  )).toLowerCase();
  if (/school|classroom|teacher|principal|administrator|mosad/.test(raw)) return 'school';
  if (/family|parent|home|homeschool|household/.test(raw)) return 'family';
  if (contactType === 'school_interest') return 'school';
  return 'family';
}

function toContactCard(row = {}, options = {}) {
  const source = options.source || row.source_table || row.source || 'unknown';
  const id = firstNonEmpty(row.id, row.contact_id, row.person_id, row.lead_id, row.provider_id);
  const displayName = firstNonEmpty(
    row.display_name,
    row.full_name,
    row.parent_name,
    row.student_name,
    row.provider_name,
    row.contact_name,
    row.name,
    row.phone,
    row.email,
    `Contact ${id || ''}`.trim()
  );

  const email = normalizeEmail(firstNonEmpty(row.email, row.contact_email, row.parent_email));
  const phone = normalizePhone(firstNonEmpty(row.phone, row.contact_phone, row.whatsapp_phone, row.parent_phone));

  const tags = splitTags(firstNonEmpty(row.tags, row.contact_tags, row.lead_tags));
  const contactType = deriveContactType(row);
  const status = String(firstNonEmpty(row.lead_status, row.status, row.contact_status, 'new')).toLowerCase();
  const membershipAccess = parseObject(row.membership_access);
  const mailbox = parseObject(row.mailbox);
  const support = parseObject(row.support);
  const followUpTask = parseObject(row.follow_up_task);
  const classContext = parseObject(row.class_context);
  const timelineActivity = parseObject(row.timeline_activity);
  const classification = deriveFamilySchoolClassification(row, contactType);

  return {
    id: String(id || `${source}:${displayName}:${email || phone}`),
    source,
    workspace_key: row.workspace_key || row.workspaceKey || options.workspace_key || null,
    project_key: row.project_key || row.projectKey || options.project_key || null,
    display_name: String(displayName || 'Unknown contact'),
    contact_type: contactType,
    family_school_classification: classification,
    status,
    lifecycle_stage: status,
    assigned_owner: firstNonEmpty(row.assigned_owner, row.owner, row.assignee, row.created_by),
    interest_level: row.interest_level || row.priority || '',
    email,
    phone,
    tags,
    source_label: firstNonEmpty(row.source_label, row.source_channel, row.lead_source, source),
    last_contact_at: firstNonEmpty(row.last_contact_at, row.last_communication_at, row.updated_at, row.created_at),
    next_follow_up_at: firstNonEmpty(row.next_follow_up_at, row.follow_up_at, row.due_at),
    summary: firstNonEmpty(row.summary, row.notes, row.internal_notes, row.last_message_snippet, row.body),
    linked: {
      contact_id: row.contact_id || null,
      person_id: row.person_id || null,
      parent_lead_id: row.parent_lead_id || row.lead_id || null,
      provider_profile_id: row.provider_profile_id || null,
      student_id: row.student_id || null,
      signup_id: row.signup_id || null,
      parent_name: firstNonEmpty(row.parent_name, row.linked_parent_name),
      student_name: firstNonEmpty(row.student_name, row.linked_student_name),
    },
    membership_access: {
      member_id: membershipAccess.member_id || row.member_id || null,
      access_status: firstNonEmpty(membershipAccess.access_status, row.access_status),
      access_tier: firstNonEmpty(membershipAccess.access_tier, row.access_tier),
      access_enabled: membershipAccess.access_enabled !== undefined ? Boolean(membershipAccess.access_enabled) : row.access_enabled,
      source: firstNonEmpty(membershipAccess.source, row.membership_source, 'first_party'),
    },
    mailbox: {
      message_count: numberOrZero(firstNonEmpty(mailbox.message_count, row.message_count)),
      latest_thread_key: firstNonEmpty(mailbox.latest_thread_key, row.latest_thread_key, row.thread_key),
      latest_subject: firstNonEmpty(mailbox.latest_subject, row.latest_subject, row.subject),
      latest_at: firstNonEmpty(mailbox.latest_at, row.latest_message_at, row.last_contact_at),
      filtered_route: firstNonEmpty(mailbox.filtered_route, row.filtered_mailbox_route),
    },
    support: {
      ticket_count: numberOrZero(firstNonEmpty(support.ticket_count, row.support_ticket_count)),
      open_ticket_count: numberOrZero(firstNonEmpty(support.open_ticket_count, row.open_support_ticket_count)),
      latest_ticket_id: support.latest_ticket_id || row.latest_ticket_id || null,
      latest_ticket_title: firstNonEmpty(support.latest_ticket_title, row.latest_ticket_title),
    },
    follow_up_task: {
      task_id: followUpTask.task_id || row.follow_up_task_id || null,
      task_count: numberOrZero(firstNonEmpty(followUpTask.task_count, row.follow_up_task_count)),
      assigned_to: firstNonEmpty(followUpTask.assigned_to, row.follow_up_assigned_to, row.assigned_owner),
      due_date: firstNonEmpty(followUpTask.due_date, row.follow_up_due_date, row.next_follow_up_at),
      status: firstNonEmpty(followUpTask.status, row.follow_up_task_status),
    },
    class_context: {
      class_type: firstNonEmpty(classContext.class_type, row.class_type, contactType),
      trial_status: firstNonEmpty(classContext.trial_status, row.trial_status),
      access_context: firstNonEmpty(classContext.access_context, row.access_context),
      live_class_context: firstNonEmpty(classContext.live_class_context, row.live_class_context),
    },
    timeline_activity: {
      activity_count: numberOrZero(firstNonEmpty(timelineActivity.activity_count, row.timeline_activity_count)),
      latest_activity_at: firstNonEmpty(timelineActivity.latest_activity_at, row.latest_activity_at, row.last_contact_at),
      latest_activity_type: firstNonEmpty(timelineActivity.latest_activity_type, row.latest_activity_type),
    },
    editable_fields: ['display_name', 'email', 'phone', 'lifecycle_stage', 'next_follow_up_at', 'assigned_owner', 'tags', 'internal_note'],
    raw: options.includeRaw ? row : undefined,
  };
}

function textIncludes(haystack, needle) {
  if (!needle) return true;
  return String(haystack || '').toLowerCase().includes(String(needle).toLowerCase());
}

function matchesFilters(card, filters = {}) {
  if (filters.workspace_key && card.workspace_key !== filters.workspace_key) return false;
  if (filters.project_key && card.project_key !== filters.project_key) return false;

  if (filters.contact_type && filters.contact_type !== 'all' && card.contact_type !== filters.contact_type) {
    return false;
  }

  if (filters.status && filters.status !== 'all' && card.status !== filters.status) {
    return false;
  }

  if (filters.source && filters.source !== 'all' && card.source !== filters.source && card.source_label !== filters.source) {
    return false;
  }

  if (filters.tag && filters.tag !== 'all' && !card.tags.includes(filters.tag)) {
    return false;
  }

  if (filters.search) {
    const blob = [
      card.display_name,
      card.email,
      card.phone,
      card.summary,
      card.tags.join(' '),
      card.source_label,
      card.family_school_classification,
      card.membership_access?.access_status,
      card.membership_access?.access_tier,
      card.mailbox?.latest_subject,
      card.support?.latest_ticket_title,
      card.follow_up_task?.assigned_to,
    ].join(' ');
    if (!textIncludes(blob, filters.search)) return false;
  }

  return true;
}

function sortCards(cards, sortKey = 'last_contact_desc') {
  const rows = [...cards];
  const byDate = (field, direction) => (a, b) => {
    const av = new Date(a[field] || 0).getTime() || 0;
    const bv = new Date(b[field] || 0).getTime() || 0;
    return direction === 'asc' ? av - bv : bv - av;
  };

  if (sortKey === 'name_asc') return rows.sort((a, b) => a.display_name.localeCompare(b.display_name));
  if (sortKey === 'name_desc') return rows.sort((a, b) => b.display_name.localeCompare(a.display_name));
  if (sortKey === 'next_follow_up_asc') return rows.sort(byDate('next_follow_up_at', 'asc'));
  if (sortKey === 'created_desc') return rows.sort(byDate('created_at', 'desc'));
  return rows.sort(byDate('last_contact_at', 'desc'));
}

function buildFilterOptions(cards = []) {
  const options = {
    contact_types: new Set(['all']),
    statuses: new Set(['all']),
    sources: new Set(['all']),
    tags: new Set(['all']),
  };

  for (const card of cards) {
    if (card.contact_type) options.contact_types.add(card.contact_type);
    if (card.status) options.statuses.add(card.status);
    if (card.source_label) options.sources.add(card.source_label);
    for (const tag of card.tags || []) options.tags.add(tag);
  }

  return {
    contact_types: Array.from(options.contact_types).sort(),
    statuses: Array.from(options.statuses).sort(),
    sources: Array.from(options.sources).sort(),
    tags: Array.from(options.tags).sort(),
  };
}

function canViewFullCrm(scope = {}) {
  return hasEntitlement(scope, ENTITLEMENTS.CRM_CONTACTS);
}

function filterCrmContacts(rows = [], filters = {}, scope = {}) {
  assertEntitlement(scope, ENTITLEMENTS.CRM_CONTACTS);
  if (filters.tag || filters.search || filters.status || filters.contact_type || filters.source) {
    assertEntitlement(scope, ENTITLEMENTS.CRM_FILTERS);
  }

  const cards = rows.map((row) => toContactCard(row, {
    workspace_key: scope.workspace_key,
    project_key: scope.project_key,
  }));

  const filtered = cards.filter((card) => matchesFilters(card, filters));
  const sorted = sortCards(filtered, filters.sort_key);
  return {
    cards: sorted,
    filters: buildFilterOptions(cards),
    total: cards.length,
    filtered_total: sorted.length,
    scope: {
      workspace_key: scope.workspace_key || null,
      project_key: scope.project_key || null,
    },
  };
}

function filterProviderContactInbox(rows = [], filters = {}, scope = {}) {
  assertEntitlement(scope, ENTITLEMENTS.PROVIDER_CONTACT_INBOX);

  const cards = rows.map((row) => ({
    id: String(row.id),
    workspace_key: row.workspace_key || scope.workspace_key || null,
    project_key: row.project_key || scope.project_key || null,
    display_name: row.parent_display_name || row.parent_name || row.parent_email || row.parent_phone || 'Parent inquiry',
    contact_type: 'provider_inquiry',
    status: row.inquiry_status || row.status || 'new',
    email: normalizeEmail(row.parent_email),
    phone: normalizePhone(row.parent_phone),
    subject: row.subject || 'Parent inquiry',
    summary: row.body || row.summary || '',
    student_display_name: row.student_display_name || '',
    preferred_contact_method: row.preferred_contact_method || '',
    created_at: row.created_at || null,
    last_response_draft: row.last_response_draft || '',
  }));

  return {
    cards: sortCards(cards.filter((card) => matchesFilters(card, filters)), filters.sort_key || 'created_desc'),
    filters: buildFilterOptions(cards),
    total: cards.length,
    filtered_total: cards.length,
  };
}

function buildTimeline(rows = []) {
  return rows.map((row) => ({
    id: String(row.id || row.communication_id || `${row.source || 'timeline'}:${row.created_at || ''}`),
    type: row.communication_type || row.type || row.source || 'note',
    channel: row.channel || row.source_channel || row.source || 'manual',
    direction: row.direction || 'inbound',
    body: row.body || row.summary || row.notes || '',
    occurred_at: row.occurred_at || row.sent_at || row.created_at || null,
    no_send: true,
    external_write_performed: false,
    source_context: row.source_context || null,
  })).sort((a, b) => (new Date(b.occurred_at || 0).getTime() || 0) - (new Date(a.occurred_at || 0).getTime() || 0));
}

module.exports = {
  normalizeEmail,
  normalizePhone,
  splitTags,
  deriveContactType,
  toContactCard,
  matchesFilters,
  sortCards,
  buildFilterOptions,
  canViewFullCrm,
  filterCrmContacts,
  filterProviderContactInbox,
  buildTimeline,
};
