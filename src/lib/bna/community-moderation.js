const COMMUNITY_MODERATION_REQUIREMENT_ID = 'REQ-20260619-311';

const COMMUNITY_MODERATION_VISIBILITY_STATES = [
  'private',
  'staff_only',
  'parent_visible',
  'cohort_visible',
  'public_anonymized',
  'archived',
];

const COMMUNITY_MODERATION_REVIEW_STATES = [
  'submitted_private',
  'needs_human_review',
  'edited_private',
  'approved_parent_visible',
  'approved_cohort_visible',
  'approved_anonymized_public',
  'held_for_safety_review',
  'temporary_hold_pending_admin',
  'rejected_private',
  'deleted_with_history',
  'archived_private',
];

const COMMUNITY_MODERATION_SECTIONS = [
  {
    key: 'rabbi_announcements',
    label: 'Rabbi Announcements',
    status: 'local_contract_present',
    result: 'Rabbi/admin announcements are teacher-led threads, not open participant broadcasts.',
  },
  {
    key: 'cohort_discussions',
    label: 'Cohort Discussions',
    status: 'local_contract_present',
    result: 'Cohort-visible discussion requires approval and remains scoped to One Time members.',
  },
  {
    key: 'private_questions',
    label: 'Private Questions',
    status: 'preview_ready',
    result: 'Student/member replies submit privately for Rabbi/admin review before any wider visibility.',
  },
  {
    key: 'parent_visible_communication',
    label: 'Parent-Visible Communication',
    status: 'preview_ready',
    result: 'Safety flags can route a private item to a parent-visible hold without exposing it to the cohort.',
  },
  {
    key: 'staff_only_notes',
    label: 'Staff-Only Notes',
    status: 'local_contract_present',
    result: 'Staff-only notes are modeled as a separate visibility state for provider/admin review.',
  },
  {
    key: 'moderated_posting',
    label: 'Moderated Posting',
    status: 'guarded',
    result: 'Unreviewed student/member posts are hidden by default and cannot auto-publish.',
  },
  {
    key: 'edit_history',
    label: 'Edit History',
    status: 'local_contract_present',
    result: 'Original, edited, published, and anonymized versions have explicit audit fields.',
  },
  {
    key: 'deletion_history',
    label: 'Deletion History',
    status: 'local_contract_present',
    result: 'Delete/archival decisions preserve moderation history instead of silently purging records.',
  },
  {
    key: 'private_to_public_anonymization',
    label: 'Private-To-Public Anonymization',
    status: 'preview_ready',
    result: 'Public promotion requires reviewer-edited anonymized text and stores original/published version metadata.',
  },
  {
    key: 'report_flag_flow',
    label: 'Report And Flag Flow',
    status: 'preview_ready',
    result: 'Contact info, direct-chat requests, unsafe language, and private identifiers create review flags.',
  },
  {
    key: 'visibility_checks',
    label: 'Visibility Checks',
    status: 'guarded',
    result: 'Public, parent, staff, and cohort visibility remain separate states.',
  },
  {
    key: 'no_unrestricted_student_messaging',
    label: 'No Unrestricted Student Messaging',
    status: 'guarded',
    result: 'The One Time classroom does not enable student-to-student private messaging.',
  },
  {
    key: 'audit_release',
    label: 'Audit And Release',
    status: 'blocked_live_release',
    result: 'Live public promotion, notifications, and production smoke require operator approval.',
  },
];

function normalizeToken(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function safeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeCommunityVisibility(value = 'private') {
  const normalized = normalizeToken(value || 'private');
  return COMMUNITY_MODERATION_VISIBILITY_STATES.includes(normalized) ? normalized : 'private';
}

function normalizeCommunityReviewState(value = 'needs_human_review') {
  const normalized = normalizeToken(value || 'needs_human_review');
  return COMMUNITY_MODERATION_REVIEW_STATES.includes(normalized) ? normalized : 'needs_human_review';
}

function regexEscape(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function privateIdentifiers(input = {}) {
  const identifiers = Array.isArray(input.private_identifiers || input.privateIdentifiers)
    ? (input.private_identifiers || input.privateIdentifiers)
    : [];
  return identifiers.map((identifier) => safeText(identifier)).filter(Boolean);
}

function detectModerationFlags(text = '', input = {}) {
  const body = String(text || '');
  const lower = body.toLowerCase();
  const flags = [];
  if (body.length > 2000) flags.push('too_long');
  if (/\b(stupid|idiot|hate|shut up|kill|die|curse|swear|bad word)\b/i.test(body)) flags.push('unsafe_language');
  if (/\b(phone|email|address|whatsapp|telegram|meet me|dm me|message me|text me)\b/i.test(lower)) flags.push('direct_chat_request');
  if (/(?:\d[\s().-]?){7,}/.test(body) || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(body)) flags.push('contact_info');
  if (privateIdentifiers(input).some((identifier) => body.toLowerCase().includes(identifier.toLowerCase()))) flags.push('private_identifier');
  return [...new Set(flags)];
}

function hasPrivateIdentifierLeak(text = '', input = {}) {
  const body = String(text || '');
  if (/(?:\d[\s().-]?){7,}/.test(body)) return true;
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(body)) return true;
  return privateIdentifiers(input).some((identifier) => body.toLowerCase().includes(identifier.toLowerCase()));
}

function redactPrivateIdentifiersForPublic(text = '', input = {}) {
  let output = String(text || '').trim();
  output = output.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email redacted]');
  output = output.replace(/(?:\+?\d[\s().-]?){7,}\d/g, '[phone redacted]');
  for (const identifier of privateIdentifiers(input).sort((a, b) => b.length - a.length)) {
    output = output.replace(new RegExp(regexEscape(identifier), 'gi'), '[name redacted]');
  }
  output = output.replace(/\b(my name is|i am|i'm)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, '$1 [name redacted]');
  return output.replace(/\s+/g, ' ').trim();
}

function buildPrivateQuestionModerationDraft(input = {}) {
  const body = safeText(input.body || input.message || input.question || input.original_body);
  const flags = detectModerationFlags(body, input);
  const needsSafetyHold = flags.some((flag) => ['unsafe_language', 'direct_chat_request', 'contact_info', 'private_identifier'].includes(flag));
  return {
    requirement_id: COMMUNITY_MODERATION_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    question_ref: safeText(input.question_ref || input.questionRef || input.id || 'private_question_preview'),
    review_state: needsSafetyHold ? 'held_for_safety_review' : 'needs_human_review',
    submitted_private: true,
    original_body_present: Boolean(body),
    original_body_chars: body.length,
    raw_body_returned: false,
    author: {
      type: normalizeToken(input.author_type || input.authorType || 'member') || 'member',
      label_present: Boolean(safeText(input.author_label || input.authorLabel || input.author_name || input.authorName)),
    },
    desired_visibility: normalizeCommunityVisibility(input.desired_visibility || input.desiredVisibility || 'private'),
    suggested_visibility: needsSafetyHold ? 'staff_only' : 'private',
    report_flags: flags,
    temporary_hold_recommended: needsSafetyHold,
    safe_for_auto_publish: false,
    no_student_to_student_chat: true,
    unrestricted_student_messaging_enabled: false,
    private_to_public_requires_anonymization: true,
  };
}

function buildPrivateToPublicPromotionPreview(input = {}) {
  const originalBody = safeText(input.original_body || input.originalBody || input.body);
  const editedBody = safeText(input.edited_body || input.editedBody || originalBody);
  const anonymizedBody = redactPrivateIdentifiersForPublic(
    safeText(input.anonymized_body || input.anonymizedBody || editedBody),
    input
  );
  const publicSafe = anonymizedBody.length > 0 && !hasPrivateIdentifierLeak(anonymizedBody, input);
  return {
    requirement_id: COMMUNITY_MODERATION_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    visibility_decision: publicSafe ? 'public_anonymized' : 'private',
    review_state: publicSafe ? 'approved_anonymized_public' : 'needs_human_review',
    original_version_stored: Boolean(originalBody),
    edited_version_present: Boolean(editedBody),
    anonymized_public_body_present: Boolean(anonymizedBody),
    anonymized_public_body: anonymizedBody,
    original_body_returned: false,
    edited_body_returned: false,
    private_identifiers_removed: publicSafe,
    public_version_contains_private_identifiers: !publicSafe,
    reviewer_label_present: Boolean(safeText(input.reviewer || input.reviewer_name || input.reviewerName)),
    no_student_to_student_chat: true,
    write_enabled: false,
  };
}

function buildModerationHistoryEvent(input = {}) {
  const action = normalizeToken(input.action || 'review');
  const reason = safeText(input.reason || input.notes || input.review_notes);
  return {
    requirement_id: COMMUNITY_MODERATION_REQUIREMENT_ID,
    action,
    actor_type: normalizeToken(input.actor_type || input.actorType || 'admin') || 'admin',
    actor_label_present: Boolean(safeText(input.actor_label || input.actorLabel || input.actor || input.reviewer)),
    reason_present: Boolean(reason),
    reason_code: reason ? normalizeToken(reason).slice(0, 80) : '',
    original_body_returned: false,
    created_at: safeText(input.created_at || input.createdAt || ''),
  };
}

function parseJsonish(value, fallback) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function messageVisibility(row = {}) {
  return normalizeCommunityVisibility(row.visibility_decision || row.visibility || row.community_visibility || 'private');
}

function messageReviewState(row = {}) {
  if (row.private_to_public_state || row.review_state) {
    return normalizeCommunityReviewState(row.private_to_public_state || row.review_state);
  }
  const moderationStatus = normalizeToken(row.moderation_status || '');
  if (moderationStatus === 'approved') return 'approved_cohort_visible';
  if (moderationStatus === 'held_for_parent_review') return 'held_for_safety_review';
  if (moderationStatus === 'approved_anonymized_public') return 'approved_anonymized_public';
  if (moderationStatus === 'rejected_private') return 'rejected_private';
  if (moderationStatus === 'archived') return 'archived_private';
  return normalizeCommunityReviewState(moderationStatus || 'needs_human_review');
}

function flattenMessages(input = {}) {
  if (Array.isArray(input.messages)) return input.messages;
  const threads = Array.isArray(input.threads) ? input.threads : [];
  return threads.flatMap((thread) => (Array.isArray(thread.messages) ? thread.messages : []));
}

function buildCommunityModerationReadiness(input = {}) {
  const threads = Array.isArray(input.threads) ? input.threads : [];
  const messages = flattenMessages(input);
  const questionReviews = Array.isArray(input.question_reviews || input.questionReviews)
    ? (input.question_reviews || input.questionReviews)
    : [];
  const pendingMessages = messages.filter((message) => ['needs_human_review', 'held_for_safety_review', 'temporary_hold_pending_admin'].includes(messageReviewState(message))
    || ['needs_review', 'held_for_parent_review'].includes(normalizeToken(message.moderation_status || '')));
  const editHistoryCount = messages.filter((message) => {
    const history = parseJsonish(message.edit_history_json || message.editHistory || message.edit_history, []);
    return Array.isArray(history) ? history.length > 0 : Boolean(history);
  }).length;
  const deleteHistoryCount = messages.filter((message) => {
    const history = parseJsonish(message.delete_history_json || message.deleteHistory || message.delete_history, []);
    return Array.isArray(history) ? history.length > 0 : Boolean(history);
  }).length;
  const reportFlagCount = messages.filter((message) => {
    const flags = parseJsonish(message.report_flags_json || message.reportFlags || message.report_flags || message.ai_moderation?.flags, []);
    return Array.isArray(flags) ? flags.length > 0 : Boolean(flags);
  }).length;
  return {
    requirement_id: COMMUNITY_MODERATION_REQUIREMENT_ID,
    status: 'needs_operator_decision',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    sections: COMMUNITY_MODERATION_SECTIONS,
    summary: {
      threads_seen: threads.length,
      messages_seen: messages.length,
      private_questions_seen: messages.filter((message) => messageReviewState(message) === 'submitted_private' || message.original_body_present || message.original_body).length + questionReviews.length,
      pending_moderation: pendingMessages.length,
      safety_holds: messages.filter((message) => normalizeToken(message.parent_escalation_status || messageReviewState(message)) === 'flagged' || messageReviewState(message) === 'held_for_safety_review').length,
      parent_visible_items: messages.filter((message) => messageVisibility(message) === 'parent_visible' || message.parent_visible_safety === true).length,
      staff_only_items: messages.filter((message) => messageVisibility(message) === 'staff_only').length,
      cohort_visible_items: messages.filter((message) => messageVisibility(message) === 'cohort_visible' || message.status === 'visible').length,
      public_anonymized_items: messages.filter((message) => messageVisibility(message) === 'public_anonymized' || messageReviewState(message) === 'approved_anonymized_public').length,
      edit_history_records: editHistoryCount,
      delete_history_records: deleteHistoryCount,
      report_flag_records: reportFlagCount,
    },
    gates: {
      unrestricted_student_private_messaging_enabled: false,
      unreviewed_member_post_publication_enabled: false,
      private_question_public_promotion_write_enabled: false,
      deletion_without_history_enabled: false,
      external_notification_enabled: false,
      live_public_community_smoke_complete: false,
    },
    blockers: [
      'Live public promotion, public/community posting changes, external notifications, and production smoke require explicit operator approval.',
      'Unrestricted student-to-student private messaging remains disabled.',
    ],
  };
}

module.exports = {
  COMMUNITY_MODERATION_REQUIREMENT_ID,
  COMMUNITY_MODERATION_REVIEW_STATES,
  COMMUNITY_MODERATION_SECTIONS,
  COMMUNITY_MODERATION_VISIBILITY_STATES,
  buildCommunityModerationReadiness,
  buildModerationHistoryEvent,
  buildPrivateQuestionModerationDraft,
  buildPrivateToPublicPromotionPreview,
  detectModerationFlags,
  normalizeCommunityReviewState,
  normalizeCommunityVisibility,
  redactPrivateIdentifiersForPublic,
};
