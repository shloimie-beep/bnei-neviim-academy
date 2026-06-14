function parseJsonMaybe(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

function normalizePhoneDigits(value = '') {
  return String(value || '').replace(/\D/g, '');
}

function phoneSuffix(value = '') {
  const digits = normalizePhoneDigits(value);
  return digits.length >= 7 ? digits.slice(-9) : '';
}

function phoneFromProviderId(value = '') {
  const raw = String(value || '').replace(/@.*/, '');
  const digits = normalizePhoneDigits(raw);
  return digits.length >= 7 ? digits : '';
}

function compactText(value = '', max = 240) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function uniquePush(list, value) {
  const text = compactText(value, 240);
  if (!text) return;
  if (!list.some((item) => item.toLowerCase() === text.toLowerCase())) list.push(text);
}

function groupKeyFromPhone(phone = '') {
  const digits = normalizePhoneDigits(phone);
  if (digits) return `phone:${digits}`;
  return '';
}

function normalizedNeedle(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]+/g, ' ').trim();
}

function isNatiFreezeOrFries(value = '') {
  const text = normalizedNeedle(value);
  return /\bnati\s+(?:freeze|fries|friez|friezes)\b/.test(text);
}

function hasSchoolInterest(value = '') {
  return /\b(bna|bnei\s+neviim|academy|school|enroll|enrol|registration|signup|sign\s+up|tuition|student|son|daughter|boy|boys|program|yeshiva|homeschool|home\s*school|visit|tour|application)\b/i.test(value);
}

function hasContentInterest(value = '') {
  return /\b(newsletter|facebook|post|video|clip|content|whatsapp\s+update|social|youtube|blog|caption|media)\b/i.test(value);
}

function hasSpamSignal(value = '') {
  return /\b(spam|scam|blocked|wrong\s+number|unsubscribe|stop\s+messaging|irrelevant)\b/i.test(value);
}

const WAPI_PHONEBOOK_CORRECTION_TYPES = new Set([
  'recognized_parent',
  'recognized_student',
  'provider',
  'school_interest',
  'content_interest',
  'group_member',
  'general_contact',
  'unknown_phone',
  'friend_non_lead',
  'spam_irrelevant',
]);

function uniqueTextArray(values = []) {
  const seen = new Set();
  return (Array.isArray(values) ? values : [values])
    .map((value) => compactText(value, 120))
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeWapiPhonebookCorrectionType(value = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const aliases = {
    parent: 'recognized_parent',
    student: 'recognized_student',
    lead: 'school_interest',
    school: 'school_interest',
    content: 'content_interest',
    group: 'group_member',
    general: 'general_contact',
    unknown: 'unknown_phone',
    friend: 'friend_non_lead',
    non_lead: 'friend_non_lead',
    spam: 'spam_irrelevant',
    irrelevant: 'spam_irrelevant',
  };
  const valueOrAlias = aliases[normalized] || normalized;
  return WAPI_PHONEBOOK_CORRECTION_TYPES.has(valueOrAlias) ? valueOrAlias : '';
}

function wapiPhonebookCorrectionPlanForType(value = '') {
  const correctionType = normalizeWapiPhonebookCorrectionType(value);
  if (!correctionType) return null;
  const typeTag = correctionType.replace(/_/g, '-');
  const baseTags = ['whatsapp', 'wapi-phonebook', 'wapi-phonebook-corrected', `wapi-${typeTag}`];
  const plans = {
    recognized_parent: {
      contact_status: 'parent',
      tags: ['parent', 'recognized-parent'],
      lead_status: null,
      lead_type: null,
      summary: 'Mark as a recognized BNA parent/contact.',
    },
    recognized_student: {
      contact_status: 'parent',
      tags: ['student-family', 'recognized-student-family'],
      lead_status: null,
      lead_type: null,
      summary: 'Mark the platform contact as linked to a student family without changing student records.',
    },
    provider: {
      contact_status: 'provider',
      tags: ['provider', 'service-provider'],
      lead_status: null,
      lead_type: null,
      summary: 'Mark as a provider/service contact.',
    },
    school_interest: {
      contact_status: 'lead',
      tags: ['lead', 'school-interest'],
      lead_status: 'interested',
      lead_type: 'school_interest',
      summary: 'Mark as a school-interest lead/contact.',
    },
    content_interest: {
      contact_status: 'lead',
      tags: ['lead', 'content-interest'],
      lead_status: 'interested',
      lead_type: 'content_interest',
      summary: 'Mark as a content/social/media-interest lead/contact.',
    },
    group_member: {
      contact_status: 'group_member',
      tags: ['whatsapp-group-member'],
      lead_status: 'interested',
      lead_type: 'group_member',
      summary: 'Mark as a WhatsApp group member for manual review.',
    },
    general_contact: {
      contact_status: 'general',
      tags: ['general-contact'],
      lead_status: null,
      lead_type: null,
      summary: 'Mark as a general WhatsApp contact.',
    },
    unknown_phone: {
      contact_status: 'needs_review',
      tags: ['unknown-phone', 'needs-review'],
      lead_status: null,
      lead_type: null,
      summary: 'Keep as an unknown phone needing manual identification.',
    },
    friend_non_lead: {
      contact_status: 'non_lead',
      tags: ['friend-non-lead', 'not-school-lead'],
      lead_status: 'not_now',
      lead_type: null,
      summary: 'Mark as friend/non-lead so it is not treated as a school lead.',
    },
    spam_irrelevant: {
      contact_status: 'spam_irrelevant',
      tags: ['spam-irrelevant', 'not-school-lead'],
      lead_status: 'not_fit',
      lead_type: null,
      summary: 'Mark as spam/irrelevant for local CRM review.',
    },
  };
  const plan = plans[correctionType] || plans.general_contact;
  return {
    correction_type: correctionType,
    contact_status: plan.contact_status,
    lead_status: plan.lead_status,
    lead_type: plan.lead_type,
    tags: uniqueTextArray([...baseTags, ...(plan.tags || [])]),
    summary: plan.summary,
  };
}

function buildWapiPhonebookCrmWritePreview(group = {}, correction = {}) {
  const correctionType = normalizeWapiPhonebookCorrectionType(
    correction.correction_type || correction.correctionType || correction.applied_type || group.applied_type || group.recommended_type
  );
  const plan = wapiPhonebookCorrectionPlanForType(correctionType);
  if (!plan) {
    return {
      no_send: true,
      external_write_performed: false,
      writes: [],
      skipped_writes: [{ target: 'local_crm', reason: 'Valid correction_type is required.' }],
      tags: [],
    };
  }
  const phoneDigits = normalizePhoneDigits(correction.phone_digits || correction.phoneDigits || group.phone_digits || '');
  const displayName = compactText(correction.display_name || correction.displayName || group.display_name || '', 220);
  const linkedRecords = Array.isArray(group.linked_records) ? group.linked_records : [];
  const linkedLeadIds = uniqueTextArray(linkedRecords.filter((record) => record.type === 'lead').map((record) => record.id));
  const linkedContactIds = uniqueTextArray(linkedRecords.filter((record) => record.type === 'contact').map((record) => record.id));
  const skippedWrites = [];
  const writes = [];

  if (phoneDigits || linkedContactIds.length) {
    writes.push({
      target: 'bna_contacts',
      action: linkedContactIds.length ? 'update_contact_tags' : 'upsert_contact_by_phone',
      contact_ids: linkedContactIds,
      match_phone_digits: phoneDigits || null,
      display_name: displayName || null,
      status: plan.contact_status,
      tags: plan.tags,
      metadata_patch: {
        source: 'wapi_phonebook_correction',
        phonebook_key: group.key || correction.phonebook_key || correction.phonebookKey || null,
        correction_type: plan.correction_type,
      },
    });
  } else {
    skippedWrites.push({
      target: 'bna_contacts',
      reason: 'No phone digits or linked platform contact id were available.',
    });
  }

  for (const leadId of linkedLeadIds) {
    writes.push({
      target: 'bna_parent_leads',
      action: 'update_lead_tags',
      lead_id: leadId,
      status: plan.lead_status,
      lead_type: plan.lead_type,
      tags: plan.tags,
      metadata_patch: {
        source: 'wapi_phonebook_correction',
        phonebook_key: group.key || correction.phonebook_key || correction.phonebookKey || null,
        correction_type: plan.correction_type,
      },
    });
  }

  for (const record of linkedRecords) {
    if (record.type === 'student') {
      skippedWrites.push({
        target: 'bna_students',
        id: record.id || null,
        reason: 'Student records are not changed by WAPI phonebook corrections.',
      });
    } else if (record.type === 'signup') {
      skippedWrites.push({
        target: 'signups',
        id: record.id || null,
        reason: 'Signup records are not changed; the platform contact receives tags instead.',
      });
    } else if (['provider_profile', 'service_provider'].includes(record.type)) {
      skippedWrites.push({
        target: record.type === 'provider_profile' ? 'bna_service_provider_profiles' : 'bna_service_providers',
        id: record.id || null,
        reason: 'Provider records are not changed by WAPI phonebook corrections.',
      });
    }
  }

  return {
    no_send: true,
    external_write_performed: false,
    correction_type: plan.correction_type,
    summary: plan.summary,
    tags: plan.tags,
    writes,
    skipped_writes: skippedWrites,
  };
}

function emptyGroup(key) {
  return {
    key,
    phone_digits: key.startsWith('phone:') ? key.slice('phone:'.length) : '',
    chat_id: key.startsWith('chat:') ? key.slice('chat:'.length) : '',
    display_name: '',
    aliases: [],
    source_counts: {
      wapi_contacts: 0,
      wapi_chats: 0,
      communications: 0,
      leads: 0,
      signups: 0,
      students: 0,
      provider_profiles: 0,
      service_providers: 0,
      contacts: 0,
    },
    linked_records: [],
    message_count: 0,
    inbound_count: 0,
    outbound_count: 0,
    latest_at: null,
    last_preview: '',
    review_flags: [],
    recommended_actions: [],
    source_rows: [],
  };
}

function touchLatest(group, value) {
  if (!value) return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return;
  if (!group.latest_at || date.getTime() > new Date(group.latest_at).getTime()) {
    group.latest_at = date.toISOString();
  }
}

function addLinkedRecord(group, record) {
  if (!record || !record.type || !record.id) return;
  const key = `${record.type}:${record.id}`;
  if (group.linked_records.some((item) => `${item.type}:${item.id}` === key)) return;
  group.linked_records.push({
    type: record.type,
    id: record.id,
    name: compactText(record.name || '', 180),
    status: compactText(record.status || '', 80),
    source: compactText(record.source || '', 80),
  });
}

function addSourceRow(group, row) {
  if (!row || !row.source) return;
  group.source_rows.push({
    source: row.source,
    id: row.id || null,
    label: compactText(row.label || '', 180),
    latest_at: row.latest_at || null,
  });
}

function groupDisplayText(group) {
  return [
    group.display_name,
    group.aliases.join(' '),
    group.last_preview,
    group.linked_records.map((record) => record.name).join(' '),
  ].filter(Boolean).join(' ');
}

function classifyWapiPhonebookGroup(group = {}) {
  const text = groupDisplayText(group);
  const recordTypes = new Set((group.linked_records || []).map((record) => record.type));
  const sourceCounts = group.source_counts || {};
  const multipleFirstPartyMatches = (group.linked_records || []).filter((record) =>
    ['lead', 'signup', 'student', 'provider_profile', 'service_provider', 'contact'].includes(record.type)
  ).length > 1;
  const flags = new Set(group.review_flags || []);
  const actions = new Set(group.recommended_actions || []);
  let recommendedType = 'general_contact';
  let confidence = 0.5;
  let confidenceLabel = 'medium';
  let reason = 'No stronger role signal found.';

  if (multipleFirstPartyMatches) {
    flags.add('multiple_first_party_matches');
    actions.add('Review duplicate/overlapping first-party records before applying tags.');
  }

  if (isNatiFreezeOrFries(text) && !hasSchoolInterest(text)) {
    recommendedType = 'friend_non_lead';
    confidence = 0.86;
    reason = 'Nati Freeze/Fries defaults to friend/general unless message evidence shows school interest.';
    flags.add('nati_friend_default');
    actions.add('Keep as friend/non-lead unless a real message shows school or content interest.');
  } else if (hasSpamSignal(text)) {
    recommendedType = 'spam_irrelevant';
    confidence = 0.78;
    reason = 'Spam/irrelevant language found in recent conversation text.';
    flags.add('possible_spam_or_irrelevant');
    actions.add('Review before archiving or blocking; do not send messages from this report.');
  } else if (recordTypes.has('provider_profile') || recordTypes.has('service_provider') || sourceCounts.provider_profiles || sourceCounts.service_providers) {
    recommendedType = 'provider';
    confidence = 0.9;
    reason = 'Phone matched a provider record.';
    actions.add('Review provider details before changing provider-visible contact fields.');
  } else if (recordTypes.has('student')) {
    recommendedType = 'recognized_student';
    confidence = 0.92;
    reason = 'Phone matched an active student/parent record.';
    actions.add('Keep private student context out of public/provider views.');
  } else if (recordTypes.has('signup')) {
    recommendedType = 'recognized_parent';
    confidence = 0.9;
    reason = 'Phone matched a signup parent record.';
  } else if (recordTypes.has('lead')) {
    recommendedType = hasContentInterest(text) ? 'content_interest' : 'school_interest';
    confidence = 0.86;
    reason = 'Phone matched an interested-parent lead.';
  } else if (group.chat_id && /@g\.us$/i.test(group.chat_id)) {
    recommendedType = 'group_member';
    confidence = 0.8;
    reason = 'The conversation is a WhatsApp group chat.';
    actions.add('Review group membership manually before assigning a school/contact role.');
  } else if (hasSchoolInterest(text)) {
    recommendedType = 'school_interest';
    confidence = 0.58;
    reason = 'Conversation text suggests school or enrollment interest.';
    flags.add('inferred_from_text');
  } else if (hasContentInterest(text)) {
    recommendedType = 'content_interest';
    confidence = 0.55;
    reason = 'Conversation text suggests content/social/media interest.';
    flags.add('inferred_from_text');
  } else if (!group.phone_digits || !group.display_name || /^\+?\d+$/.test(String(group.display_name || '').replace(/\s+/g, ''))) {
    recommendedType = 'unknown_phone';
    confidence = 0.28;
    confidenceLabel = 'low';
    reason = 'Only a phone/chat id is known.';
    flags.add('needs_manual_name');
    actions.add('Ask the operator to identify the contact before assigning a lead role.');
  }

  if (multipleFirstPartyMatches && confidence > 0.7) {
    confidence = 0.66;
    confidenceLabel = 'medium';
  } else if (confidence >= 0.85) {
    confidenceLabel = 'high';
  } else if (confidence < 0.5) {
    confidenceLabel = 'low';
  }

  return {
    recommended_type: recommendedType,
    confidence,
    confidence_label: confidenceLabel,
    reason,
    review_flags: [...flags],
    recommended_actions: [...actions],
  };
}

async function tableExists(db, tableName) {
  try {
    const result = await db.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = $1
       ) AS exists`,
      [tableName]
    );
    return Boolean(result.rows[0]?.exists);
  } catch {
    return false;
  }
}

async function queryIfTable(db, tableName, sql, params = []) {
  if (!(await tableExists(db, tableName))) return [];
  try {
    return (await db.query(sql, params)).rows;
  } catch (error) {
    if (error?.code === '42P01') return [];
    throw error;
  }
}

function addGroup(groups, key) {
  if (!key) return null;
  if (!groups.has(key)) groups.set(key, emptyGroup(key));
  return groups.get(key);
}

function addPhoneGroup(groups, phone) {
  return addGroup(groups, groupKeyFromPhone(phone));
}

function addAliasAndMaybeName(group, value) {
  const text = compactText(value, 180);
  if (!text) return;
  uniquePush(group.aliases, text);
  if (!group.display_name || /^\+?\d+$/.test(String(group.display_name || '').replace(/\s+/g, ''))) {
    group.display_name = text;
  }
}

function addKnownRecord(groups, phone, record) {
  const group = addPhoneGroup(groups, phone);
  if (!group) return;
  const countKey = `${record.type}s`;
  if (Object.prototype.hasOwnProperty.call(group.source_counts, countKey)) {
    group.source_counts[countKey] += 1;
  }
  addAliasAndMaybeName(group, record.name);
  addLinkedRecord(group, record);
  addSourceRow(group, { source: record.type, id: record.id, label: record.name });
}

function addCommunication(groups, row) {
  const sourceContext = parseJsonMaybe(row.source_context);
  const metadata = parseJsonMaybe(row.metadata);
  const chatId = compactText(sourceContext.chat_id || sourceContext.wapi_chat_id || '', 180);
  const phoneCandidates = [
    sourceContext.from_number,
    sourceContext.to_number,
    sourceContext.phone,
    sourceContext.recipient,
    sourceContext.chat_id,
    row.contact_phone,
  ].map((value) => phoneFromProviderId(value) || normalizePhoneDigits(value)).filter((value) => value && value.length >= 7);
  let group = null;
  for (const phone of phoneCandidates) {
    group = addPhoneGroup(groups, phone);
    if (group) break;
  }
  if (!group && chatId) group = addGroup(groups, `chat:${chatId}`);
  if (!group) group = addGroup(groups, `communication:${row.id}`);
  if (!group) return;
  group.source_counts.communications += 1;
  group.message_count += 1;
  if (row.direction === 'inbound') group.inbound_count += 1;
  if (row.direction === 'outbound') group.outbound_count += 1;
  addAliasAndMaybeName(group, metadata.matched_name || metadata.push_name || metadata.chat_name || sourceContext.push_name || '');
  if (!group.last_preview) group.last_preview = compactText(row.summary || row.body || '', 220);
  touchLatest(group, row.occurred_at || row.created_at);
  addLinkedRecord(group, {
    type: row.contact_type,
    id: row.lead_id || row.signup_id || row.student_id,
    name: metadata.matched_name || '',
    status: '',
    source: row.source || 'communication',
  });
  addSourceRow(group, {
    source: 'communication',
    id: row.id,
    label: row.summary,
    latest_at: row.occurred_at || row.created_at || null,
  });
}

function addWapiContact(groups, row) {
  const phone = normalizePhoneDigits(row.phone) || phoneFromProviderId(row.provider_contact_id);
  const group = addPhoneGroup(groups, phone) || addGroup(groups, `wapi_contact:${row.provider_contact_id || row.id}`);
  if (!group) return;
  group.source_counts.wapi_contacts += 1;
  addAliasAndMaybeName(group, row.display_name || row.push_name || row.provider_contact_id || row.phone);
  touchLatest(group, row.last_synced_at || row.updated_at || row.created_at);
  addSourceRow(group, {
    source: 'wapi_contact',
    id: row.id,
    label: row.display_name || row.push_name || row.phone || row.provider_contact_id,
    latest_at: row.last_synced_at || null,
  });
}

function addWapiChat(groups, row) {
  const phone = normalizePhoneDigits(row.phone) || phoneFromProviderId(row.provider_chat_id);
  const key = phone ? groupKeyFromPhone(phone) : `chat:${row.provider_chat_id || row.id}`;
  const group = addGroup(groups, key);
  if (!group) return;
  group.source_counts.wapi_chats += 1;
  if (row.provider_chat_id && /@g\.us$/i.test(row.provider_chat_id)) group.chat_id = row.provider_chat_id;
  if (row.is_group) group.review_flags.push('whatsapp_group_chat');
  addAliasAndMaybeName(group, row.display_name || row.provider_chat_id || row.phone);
  if (!group.last_preview) group.last_preview = compactText(row.last_message_preview || '', 220);
  touchLatest(group, row.last_message_at || row.last_synced_at || row.updated_at || row.created_at);
  addSourceRow(group, {
    source: row.is_group ? 'wapi_group_chat' : 'wapi_chat',
    id: row.id,
    label: row.display_name || row.provider_chat_id || row.phone,
    latest_at: row.last_message_at || null,
  });
}

function finalizeGroup(group) {
  if (!group.display_name) {
    group.display_name = group.aliases[0] || (group.phone_digits ? `+${group.phone_digits}` : group.chat_id || 'Unknown WhatsApp contact');
  }
  const classification = classifyWapiPhonebookGroup(group);
  const reviewFlags = [...new Set([...(group.review_flags || []), ...(classification.review_flags || [])])];
  const recommendedActions = [...new Set([...(group.recommended_actions || []), ...(classification.recommended_actions || [])])];
  return {
    key: group.key,
    phone_digits: group.phone_digits,
    chat_id: group.chat_id || null,
    display_name: group.display_name,
    aliases: group.aliases.slice(0, 8),
    recommended_type: classification.recommended_type,
    confidence: classification.confidence,
    confidence_label: classification.confidence_label,
    reason: classification.reason,
    review_flags: reviewFlags,
    recommended_actions: recommendedActions,
    linked_records: group.linked_records.slice(0, 10),
    source_counts: group.source_counts,
    message_count: group.message_count,
    inbound_count: group.inbound_count,
    outbound_count: group.outbound_count,
    latest_at: group.latest_at,
    last_preview: group.last_preview,
    source_rows: group.source_rows.slice(0, 8),
  };
}

function applyWapiPhonebookCorrectionToGroup(group = {}, correction = {}) {
  const correctionType = normalizeWapiPhonebookCorrectionType(correction.correction_type || correction.correctionType);
  if (!correctionType) return group;
  return {
    ...group,
    applied_type: correctionType,
    manual_correction_applied: true,
    applied_correction: {
      id: correction.id || null,
      correction_type: correctionType,
      notes: compactText(correction.notes || '', 500),
      applied_by: compactText(correction.applied_by || '', 120),
      applied_at: correction.applied_at || correction.created_at || null,
    },
    review_flags: [...new Set([...(group.review_flags || []), 'manual_correction_applied'])],
    recommended_actions: [
      `Manual correction applied as ${correctionType.replace(/_/g, ' ')}.`,
      ...(group.recommended_actions || []),
    ].slice(0, 8),
  };
}

async function buildWapiPhonebookReport({ db, limit = 100 } = {}) {
  if (!db?.query) throw new Error('db with query(sql, params) is required');
  const boundedLimit = Math.max(1, Math.min(Number(limit || 100), 500));
  const [hasWapiContacts, hasWapiChats, hasCommunications] = await Promise.all([
    tableExists(db, 'bna_wapi_contacts'),
    tableExists(db, 'bna_wapi_chats'),
    tableExists(db, 'bna_contact_communications'),
  ]);
  const groups = new Map();
  const [
    wapiContacts,
    wapiChats,
    communications,
    leads,
    signups,
    students,
    providerProfiles,
    serviceProviders,
    contacts,
    corrections,
  ] = await Promise.all([
    queryIfTable(db, 'bna_wapi_contacts', `
      SELECT id, provider_contact_id, display_name, push_name, phone, saved, last_synced_at, updated_at, created_at
      FROM bna_wapi_contacts
      ORDER BY last_synced_at DESC NULLS LAST, updated_at DESC NULLS LAST, id DESC
      LIMIT $1`, [boundedLimit * 2]),
    queryIfTable(db, 'bna_wapi_chats', `
      SELECT id, provider_chat_id, chat_type, display_name, phone, is_group, last_message_at,
             last_message_preview, last_synced_at, updated_at, created_at
      FROM bna_wapi_chats
      ORDER BY last_message_at DESC NULLS LAST, last_synced_at DESC NULLS LAST, id DESC
      LIMIT $1`, [boundedLimit * 2]),
    queryIfTable(db, 'bna_contact_communications', `
      SELECT id, contact_type, lead_id, signup_id, student_id, channel, direction, summary, body,
             follow_up_required, occurred_at, created_at, source, source_context, metadata
      FROM bna_contact_communications
      WHERE channel = 'whatsapp' OR source = 'wapi'
      ORDER BY occurred_at DESC NULLS LAST, created_at DESC, id DESC
      LIMIT $1`, [boundedLimit * 4]),
    queryIfTable(db, 'bna_parent_leads', `
      SELECT id, parent_name, student_name, parent_phone, other_phones, lead_type, status, source, updated_at, created_at
      FROM bna_parent_leads
      WHERE COALESCE(status, 'interested') <> 'archived'
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
      LIMIT $1`, [boundedLimit * 3]),
    queryIfTable(db, 'signups', `
      SELECT id, parent_name, student_name, parent_phone, status, created_at
      FROM signups
      WHERE COALESCE(status, 'new') <> 'archived'
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
      LIMIT $1`, [boundedLimit * 3]),
    queryIfTable(db, 'bna_students', `
      SELECT id, name, parent_name, parent_phone, status, tags, updated_at, created_at
      FROM bna_students
      WHERE COALESCE(status, 'active') NOT IN ('inactive', 'archived')
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
      LIMIT $1`, [boundedLimit * 3]),
    queryIfTable(db, 'bna_service_provider_profiles', `
      SELECT id, display_name, phone, status, updated_at, created_at
      FROM bna_service_provider_profiles
      WHERE COALESCE(status, 'draft') <> 'archived'
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
      LIMIT $1`, [boundedLimit * 2]),
    queryIfTable(db, 'bna_service_providers', `
      SELECT id, COALESCE(display_name, provider_name, contact_name) AS name,
             contact_phone, whatsapp_phone, status, updated_at, created_at
      FROM bna_service_providers
      WHERE COALESCE(status, 'pending_review') <> 'archived'
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
      LIMIT $1`, [boundedLimit * 2]),
    queryIfTable(db, 'bna_contacts', `
      SELECT id, full_name, primary_phone, status, source, updated_at, created_at
      FROM bna_contacts
      WHERE COALESCE(status, 'lead') <> 'archived'
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
      LIMIT $1`, [boundedLimit * 2]),
    queryIfTable(db, 'bna_wapi_phonebook_corrections', `
      SELECT id, phonebook_key, correction_type, notes, applied_by, applied_at, created_at
      FROM bna_wapi_phonebook_corrections
      ORDER BY applied_at DESC NULLS LAST, id DESC
      LIMIT $1`, [boundedLimit * 4]),
  ]);

  for (const row of wapiContacts) addWapiContact(groups, row);
  for (const row of wapiChats) addWapiChat(groups, row);
  for (const row of communications) addCommunication(groups, row);
  for (const row of leads) {
    const name = row.parent_name || row.student_name || 'Parent lead';
    addKnownRecord(groups, row.parent_phone, { type: 'lead', id: row.id, name, status: row.status, source: row.source || row.lead_type });
    for (const phone of Array.isArray(row.other_phones) ? row.other_phones : []) {
      addKnownRecord(groups, phone, { type: 'lead', id: row.id, name, status: row.status, source: 'other_phone' });
    }
  }
  for (const row of signups) {
    addKnownRecord(groups, row.parent_phone, { type: 'signup', id: row.id, name: row.parent_name || row.student_name || 'Signup parent', status: row.status, source: 'signup' });
  }
  for (const row of students) {
    addKnownRecord(groups, row.parent_phone, { type: 'student', id: row.id, name: row.parent_name || row.name || 'Student parent', status: row.status, source: 'student_parent_phone' });
  }
  for (const row of providerProfiles) {
    addKnownRecord(groups, row.phone, { type: 'provider_profile', id: row.id, name: row.display_name, status: row.status, source: 'provider_profile' });
  }
  for (const row of serviceProviders) {
    addKnownRecord(groups, row.whatsapp_phone || row.contact_phone, { type: 'service_provider', id: row.id, name: row.name, status: row.status, source: row.whatsapp_phone ? 'provider_whatsapp' : 'provider_phone' });
  }
  for (const row of contacts) {
    addKnownRecord(groups, row.primary_phone, { type: 'contact', id: row.id, name: row.full_name, status: row.status, source: row.source || 'contacts' });
  }

  const correctionsByKey = new Map();
  for (const correction of corrections) {
    if (correction.phonebook_key && !correctionsByKey.has(correction.phonebook_key)) {
      correctionsByKey.set(correction.phonebook_key, correction);
    }
  }

  const phonebook = [...groups.values()]
    .map(finalizeGroup)
    .map((group) => applyWapiPhonebookCorrectionToGroup(group, correctionsByKey.get(group.key)))
    .sort((a, b) => {
      const reviewWeight = (b.review_flags.length > 0 ? 1 : 0) - (a.review_flags.length > 0 ? 1 : 0);
      if (reviewWeight) return reviewWeight;
      return Date.parse(b.latest_at || 0) - Date.parse(a.latest_at || 0);
    })
    .slice(0, boundedLimit);

  const byType = {};
  for (const group of phonebook) {
    const type = group.applied_type || group.recommended_type;
    byType[type] = (byType[type] || 0) + 1;
  }
  const manualCorrectionCandidates = phonebook
    .filter((group) => !group.manual_correction_applied && (group.review_flags.length || ['unknown_phone', 'friend_non_lead', 'spam_irrelevant'].includes(group.recommended_type)))
    .slice(0, 25);

  return {
    success: true,
    dry_run: true,
    generated_at: new Date().toISOString(),
    no_send: true,
    external_write_performed: false,
    source_table_availability: {
      bna_wapi_contacts: hasWapiContacts,
      bna_wapi_chats: hasWapiChats,
      bna_contact_communications: hasCommunications,
      bna_wapi_phonebook_corrections: await tableExists(db, 'bna_wapi_phonebook_corrections'),
    },
    summary: {
      phonebook_groups: phonebook.length,
      communications_considered: communications.length,
      wapi_contacts_considered: wapiContacts.length,
      wapi_chats_considered: wapiChats.length,
      manual_correction_candidates: manualCorrectionCandidates.length,
      manual_corrections_applied: corrections.length,
      recommended_types: byType,
    },
    phonebook,
    manual_correction_candidates: manualCorrectionCandidates,
    guardrails: [
      'Dry-run/read-only report only.',
      'No WhatsApp messages are sent.',
      'No contact tags, lead stages, or provider records are changed.',
      'Nati Freeze/Fries stays friend/non-lead unless real message evidence shows school interest.',
    ],
  };
}

module.exports = {
  buildWapiPhonebookReport,
  buildWapiPhonebookCrmWritePreview,
  applyWapiPhonebookCorrectionToGroup,
  classifyWapiPhonebookGroup,
  hasSchoolInterest,
  isNatiFreezeOrFries,
  normalizePhoneDigits,
  normalizeWapiPhonebookCorrectionType,
  phoneFromProviderId,
  wapiPhonebookCorrectionPlanForType,
  WAPI_PHONEBOOK_CORRECTION_TYPES,
};
