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

function metadataValue(metadata = {}, ...keys) {
  for (const key of keys) {
    const value = metadata[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
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

const SOURCE_LABELS = Object.freeze({
  bna_contacts: 'First-party contact',
  bna_parent_leads: 'Lead intake',
  bna_contact_communications: 'Contact timeline',
  bna_communications: 'Message history',
  bna_contact_pipeline_events: 'Timeline note',
  bna_support_tickets: 'Support ticket',
  support_ticket: 'Support ticket',
  support: 'Support ticket',
  bna_email_log: 'Email history',
  bna_whatsapp_messages: 'WhatsApp history',
  whatsapp: 'WhatsApp',
  wapi: 'WhatsApp',
  email: 'Email',
  signup: 'Signup form',
  signup_form: 'Signup form',
  one_time_public_interest: 'One Time public interest',
  one_time_free_class: 'One Time free class',
  one_time_trial: 'One Time trial',
  payment: 'Payment',
  stripe: 'Stripe payment',
  green_invoice: 'Green Invoice',
});

function normalizeSourceKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function humanCrmSourceLabel(value, fallback = '') {
  const raw = firstNonEmpty(value, fallback, 'First-party CRM');
  const key = normalizeSourceKey(raw);
  if (SOURCE_LABELS[key]) return SOURCE_LABELS[key];
  if (key.startsWith('bna_')) return 'First-party CRM';
  return String(raw)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toContactCard(row = {}, options = {}) {
  const source = options.source || row.source_table || row.source || 'unknown';
  const metadata = parseObject(row.metadata);
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
  const signupContext = parseObject(row.signup_context);
  const timelineActivity = parseObject(row.timeline_activity);
  const classification = deriveFamilySchoolClassification(row, contactType);
  const signupId = firstNonEmpty(signupContext.signup_id, row.signup_id, row.product_lead_id, metadata.product_lead_id, metadata.signup_id);

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
    source_label: humanCrmSourceLabel(firstNonEmpty(row.source_label, row.source_channel, row.lead_source, row.source), source),
    last_contact_at: firstNonEmpty(row.last_contact_at, row.last_communication_at, row.updated_at, row.created_at),
    next_follow_up_at: firstNonEmpty(row.next_follow_up_at, row.follow_up_at, row.due_at),
    summary: firstNonEmpty(row.summary, row.notes, row.internal_notes, row.last_message_snippet, row.body),
    linked: {
      contact_id: row.contact_id || null,
      person_id: row.person_id || null,
      parent_lead_id: firstNonEmpty(row.parent_lead_id, row.lead_id, metadata.parent_lead_id),
      provider_profile_id: row.provider_profile_id || null,
      student_id: row.student_id || null,
      signup_id: signupId || null,
      product_lead_id: signupId || null,
      canonical_contact_key: firstNonEmpty(row.canonical_contact_key, metadata.canonical_contact_key),
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
    signup_context: {
      signup_id: signupId || null,
      status: firstNonEmpty(signupContext.status, row.signup_status),
      audience_type: firstNonEmpty(signupContext.audience_type, row.audience_type, metadataValue(metadata, 'audience_type', 'signup_as')),
      reminder_preference: firstNonEmpty(signupContext.reminder_preference, row.reminder_preference, metadata.reminder_preference),
      city_label: firstNonEmpty(
        signupContext.city_label,
        row.city_label,
        metadata.city?.label,
        metadata.city?.name,
        metadata.city?.city
      ),
      timezone: firstNonEmpty(signupContext.timezone, row.timezone, metadata.timezone),
      source_landing_page: firstNonEmpty(signupContext.source_landing_page, row.source_landing_page, metadata.source_landing_page),
      latest_at: firstNonEmpty(signupContext.latest_at, row.signup_latest_at, row.updated_at, row.created_at),
      source: firstNonEmpty(signupContext.source, row.signup_source, 'one_time_public_signup'),
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

function canonicalCrmContactKey(card = {}) {
  const linked = card.linked || {};
  if (card.source === 'bna_contacts' && linked.contact_id) return `contact:${linked.contact_id}`;
  if (linked.canonical_contact_key) return `contact-key:${linked.canonical_contact_key}`;
  if (card.email) return `email:${card.workspace_key || ''}:${card.project_key || ''}:${card.email}`;
  if (card.phone) return `phone:${card.workspace_key || ''}:${card.project_key || ''}:${card.phone}`;
  return `source:${card.source}:${card.id}`;
}

function preferCanonicalCrmCard(existing = null, candidate = null) {
  if (!existing) return candidate;
  if (!candidate) return existing;
  if (candidate.source === 'bna_contacts' && existing.source !== 'bna_contacts') return candidate;
  if (existing.source === 'bna_contacts' && candidate.source !== 'bna_contacts') return existing;
  const existingActivity = new Date(existing.timeline_activity?.latest_activity_at || existing.last_contact_at || 0).getTime() || 0;
  const candidateActivity = new Date(candidate.timeline_activity?.latest_activity_at || candidate.last_contact_at || 0).getTime() || 0;
  return candidateActivity > existingActivity ? candidate : existing;
}

function cardsReferToSameCrmContact(left = {}, right = {}) {
  if ((left.workspace_key || '') !== (right.workspace_key || '')) return false;
  if ((left.project_key || '') !== (right.project_key || '')) return false;
  if (left.email && right.email && left.email === right.email) return true;
  if (left.phone && right.phone && left.phone === right.phone) return true;
  const leftCanonical = left.linked?.canonical_contact_key || '';
  const rightCanonical = right.linked?.canonical_contact_key || '';
  if (leftCanonical && (leftCanonical === rightCanonical || leftCanonical === right.id)) return true;
  if (rightCanonical && (rightCanonical === leftCanonical || rightCanonical === left.id)) return true;
  return false;
}

function dedupeCrmContactCards(cards = []) {
  const byKey = new Map();
  for (const card of cards) {
    const directKey = canonicalCrmContactKey(card);
    const emailKey = card.email ? `email:${card.workspace_key || ''}:${card.project_key || ''}:${card.email}` : '';
    const phoneKey = card.phone ? `phone:${card.workspace_key || ''}:${card.project_key || ''}:${card.phone}` : '';
    const keys = Array.from(new Set([directKey, emailKey, phoneKey].filter(Boolean)));
    const existing = keys.map((key) => byKey.get(key)).find(Boolean) || null;
    const preferred = preferCanonicalCrmCard(existing, card);
    for (const key of keys) byKey.set(key, preferred);
  }
  const finalByKey = new Map();
  for (const card of Array.from(new Set(byKey.values()))) {
    const directKey = canonicalCrmContactKey(card);
    const emailKey = card.email ? `email:${card.workspace_key || ''}:${card.project_key || ''}:${card.email}` : '';
    const phoneKey = card.phone ? `phone:${card.workspace_key || ''}:${card.project_key || ''}:${card.phone}` : '';
    const keys = Array.from(new Set([directKey, emailKey, phoneKey].filter(Boolean)));
    const existing = keys.map((key) => finalByKey.get(key)).find(Boolean) || null;
    const preferred = preferCanonicalCrmCard(existing, card);
    for (const key of keys) finalByKey.set(key, preferred);
  }
  const result = [];
  for (const card of Array.from(new Set(finalByKey.values()))) {
    const index = result.findIndex((existing) => cardsReferToSameCrmContact(existing, card));
    if (index === -1) {
      result.push(card);
    } else {
      result[index] = preferCanonicalCrmCard(result[index], card);
    }
  }
  return result;
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
      card.signup_context?.audience_type,
      card.signup_context?.reminder_preference,
      card.signup_context?.city_label,
      card.signup_context?.timezone,
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

function crmListLimit(value, fallback = 50) {
  const parsed = Number(value);
  const integer = Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
  return Math.max(1, Math.min(integer || fallback, 100));
}

function decodeCrmCursor(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return { offset: 0 };
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const offset = Math.max(0, Math.floor(Number(parsed.offset || 0)));
    return { offset };
  } catch (_) {
    return { offset: 0 };
  }
}

function encodeCrmCursor(offset = 0) {
  return Buffer.from(JSON.stringify({ offset: Math.max(0, Math.floor(Number(offset || 0))) })).toString('base64url');
}

function paginateCards(cards = [], filters = {}) {
  const limit = crmListLimit(filters.limit);
  const cursor = decodeCrmCursor(filters.cursor);
  const offset = cursor.offset;
  const pageCards = cards.slice(offset, offset + limit);
  const nextOffset = offset + pageCards.length;
  const hasMore = nextOffset < cards.length;
  return {
    cards: pageCards,
    page: {
      limit,
      cursor: filters.cursor || null,
      offset,
      returned_count: pageCards.length,
      has_more: hasMore,
      next_cursor: hasMore ? encodeCrmCursor(nextOffset) : null,
    },
  };
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

  const cards = dedupeCrmContactCards(rows.map((row) => toContactCard(row, {
    workspace_key: scope.workspace_key,
    project_key: scope.project_key,
  })));

  const filtered = cards.filter((card) => matchesFilters(card, filters));
  const sorted = sortCards(filtered, filters.sort_key);
  const paged = paginateCards(sorted, filters);
  return {
    cards: paged.cards,
    filters: buildFilterOptions(cards),
    total: cards.length,
    filtered_total: sorted.length,
    returned_count: paged.page.returned_count,
    limit: paged.page.limit,
    has_more: paged.page.has_more,
    next_cursor: paged.page.next_cursor,
    page: paged.page,
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
  humanCrmSourceLabel,
  crmListLimit,
  decodeCrmCursor,
  encodeCrmCursor,
  paginateCards,
  toContactCard,
  dedupeCrmContactCards,
  matchesFilters,
  sortCards,
  buildFilterOptions,
  canViewFullCrm,
  filterCrmContacts,
  filterProviderContactInbox,
  buildTimeline,
};
