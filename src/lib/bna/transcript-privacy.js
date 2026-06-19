const TRANSCRIPT_PRIVACY_REQUIREMENT_ID = 'REQ-20260619-309';

const TRANSCRIPT_PRIVACY_CLASSES = [
  'provider_general',
  'cohort_general',
  'student_private',
  'parent_visible',
  'staff_private',
  'excluded',
  'needs_review',
];

const TRANSCRIPT_REVIEW_STATES = [
  'raw',
  'normalized',
  'segmented',
  'speaker_review',
  'privacy_review',
  'corrected',
  'approved',
  'rabbi_approved',
  'published',
  'excluded',
  'needs_review',
];

const TRANSCRIPT_PRIVACY_SECTIONS = [
  {
    key: 'version_model',
    label: 'Transcript Versions',
    status: 'local_contract_present',
    result: 'Tracks raw, normalized, corrected, and Rabbi-approved transcript states without exposing raw text.',
  },
  {
    key: 'segments_speakers_confidence',
    label: 'Segments, Speakers, Confidence',
    status: 'local_contract_present',
    result: 'Models timestamped segments, speaker labels, speaker confidence, and match confidence.',
  },
  {
    key: 'privacy_classes',
    label: 'Privacy Classes',
    status: 'local_contract_present',
    result: 'Defines provider_general, cohort_general, student_private, parent_visible, staff_private, excluded, and needs_review.',
  },
  {
    key: 'student_matching',
    label: 'Student Matching',
    status: 'local_contract_present',
    result: 'Requires enrollment context, match method, confidence threshold, and manual review for uncertain matches.',
  },
  {
    key: 'retrieval_boundaries',
    label: 'Retrieval Boundaries',
    status: 'preview_ready',
    result: 'Filters transcript segments by audience so one student cannot retrieve another student private segment.',
  },
  {
    key: 'public_helper_guardrails',
    label: 'Public Helper Guardrails',
    status: 'local_contract_present',
    result: 'Public helper retrieval may use only reviewed safe snippets, never raw unreviewed transcript dumps.',
  },
  {
    key: 'audit_release',
    label: 'Audit And Release',
    status: 'blocked_external_approval',
    result: 'Production privacy smoke, deploy, and live retrieval write/readback remain operator-gated.',
  },
];

function safeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function safeNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeKey(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeTranscriptPrivacyClass(value = 'needs_review') {
  const normalized = normalizeKey(value || 'needs_review');
  return TRANSCRIPT_PRIVACY_CLASSES.includes(normalized) ? normalized : 'needs_review';
}

function normalizeTranscriptReviewState(value = 'needs_review') {
  const normalized = normalizeKey(value || 'needs_review');
  return TRANSCRIPT_REVIEW_STATES.includes(normalized) ? normalized : 'needs_review';
}

function approvedForNonStaff(reviewState = '') {
  return ['approved', 'rabbi_approved', 'published'].includes(normalizeTranscriptReviewState(reviewState));
}

function normalizeTranscriptSegment(segment = {}, index = 0) {
  const transcript = safeText(segment.raw_text || segment.rawText || segment.text || segment.transcript_text || segment.transcriptText);
  const normalized = safeText(segment.normalized_text || segment.normalizedText || segment.approved_text || segment.approvedText);
  const studentId = safeNumber(segment.student_id || segment.studentId || segment.matched_student_id || segment.matchedStudentId);
  return {
    segment_ref: safeText(segment.segment_ref || segment.segmentRef || segment.id || `segment_${index + 1}`),
    source_recording_ref: safeText(segment.source_recording_ref || segment.sourceRecordingRef || segment.recording_id || segment.recordingId),
    start_ms: safeNumber(segment.start_ms || segment.startMs, null),
    end_ms: safeNumber(segment.end_ms || segment.endMs, null),
    raw_text_present: Boolean(transcript),
    raw_text_chars: transcript.length,
    normalized_text_present: Boolean(normalized),
    normalized_text_chars: normalized.length,
    speaker_label_present: Boolean(safeText(segment.speaker_label || segment.speakerLabel)),
    speaker_confidence: safeNumber(segment.speaker_confidence || segment.speakerConfidence, null),
    student_id: studentId,
    match_method: safeText(segment.match_method || segment.matchMethod || 'none'),
    match_confidence: safeNumber(segment.match_confidence || segment.matchConfidence, null),
    review_state: normalizeTranscriptReviewState(segment.review_state || segment.reviewState),
    privacy_class: normalizeTranscriptPrivacyClass(segment.privacy_class || segment.privacyClass),
    source_version: safeText(segment.source_version || segment.sourceVersion || 'raw'),
    corrected_version_present: Boolean(safeText(segment.corrected_text || segment.correctedText)),
    rabbi_approved_version_present: Boolean(safeText(segment.rabbi_approved_text || segment.rabbiApprovedText || segment.approved_text || segment.approvedText)),
  };
}

function audienceRole(audience = {}) {
  return normalizeKey(audience.role || audience.audience || audience.type || 'public');
}

function audienceStudentId(audience = {}) {
  return safeNumber(audience.student_id || audience.studentId || audience.member_student_id || audience.memberStudentId);
}

function canAudienceReadTranscriptSegment(segment = {}, audience = {}) {
  const normalized = normalizeTranscriptSegment(segment);
  const role = audienceRole(audience);
  const studentId = audienceStudentId(audience);
  const privacyClass = normalized.privacy_class;
  const state = normalized.review_state;
  if (privacyClass === 'excluded') return { allowed: false, reason: 'excluded_segment' };
  if (privacyClass === 'needs_review' || state === 'needs_review' || state === 'raw') {
    return { allowed: ['admin', 'staff', 'super_admin'].includes(role), reason: 'needs_staff_review' };
  }
  if (['admin', 'staff', 'super_admin'].includes(role)) return { allowed: true, reason: 'staff_private_access' };
  if (!approvedForNonStaff(state)) return { allowed: false, reason: 'not_approved_for_non_staff' };
  if (role === 'public') {
    return ['provider_general', 'cohort_general'].includes(privacyClass)
      ? { allowed: true, reason: 'public_safe_reviewed_segment' }
      : { allowed: false, reason: 'not_public_safe' };
  }
  if (['provider', 'rabbi', 'cohort_member', 'member'].includes(role)) {
    return ['provider_general', 'cohort_general'].includes(privacyClass)
      ? { allowed: true, reason: 'cohort_or_provider_safe_segment' }
      : { allowed: false, reason: 'private_segment_not_for_cohort' };
  }
  if (role === 'student') {
    if (['provider_general', 'cohort_general'].includes(privacyClass)) return { allowed: true, reason: 'student_safe_general_segment' };
    if (privacyClass === 'student_private' && normalized.student_id && normalized.student_id === studentId) return { allowed: true, reason: 'own_student_private_segment' };
    return { allowed: false, reason: 'student_scope_mismatch' };
  }
  if (role === 'parent') {
    if (['provider_general', 'cohort_general'].includes(privacyClass)) return { allowed: true, reason: 'parent_safe_general_segment' };
    if (privacyClass === 'parent_visible' && normalized.student_id && normalized.student_id === studentId) return { allowed: true, reason: 'own_parent_visible_segment' };
    return { allowed: false, reason: 'parent_scope_mismatch' };
  }
  return { allowed: false, reason: 'unknown_audience' };
}

function filterTranscriptSegmentsForAudience(segments = [], audience = {}) {
  return (Array.isArray(segments) ? segments : []).map((segment, index) => {
    const normalized = normalizeTranscriptSegment(segment, index);
    const decision = canAudienceReadTranscriptSegment(normalized, audience);
    return {
      ...normalized,
      allowed: decision.allowed,
      reason: decision.reason,
      text_returned: false,
    };
  });
}

function buildTranscriptKnowledgeRetrievalPolicy(input = {}) {
  const segments = filterTranscriptSegmentsForAudience(input.segments || [], input.audience || {});
  const allowed = segments.filter((segment) => segment.allowed);
  const blocked = segments.filter((segment) => !segment.allowed);
  return {
    requirement_id: TRANSCRIPT_PRIVACY_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    audience: {
      role: audienceRole(input.audience || {}),
      student_id_present: Boolean(audienceStudentId(input.audience || {})),
    },
    raw_unreviewed_transcripts_allowed: false,
    public_helper_raw_transcript_rag_allowed: false,
    allowed_segments: allowed.map((segment) => ({
      segment_ref: segment.segment_ref,
      privacy_class: segment.privacy_class,
      review_state: segment.review_state,
      reason: segment.reason,
      text_returned: false,
    })),
    blocked_segments: blocked.map((segment) => ({
      segment_ref: segment.segment_ref,
      privacy_class: segment.privacy_class,
      review_state: segment.review_state,
      reason: segment.reason,
      text_returned: false,
    })),
    summary: {
      total_segments: segments.length,
      allowed_segments: allowed.length,
      blocked_segments: blocked.length,
    },
  };
}

function buildTranscriptPrivacyReadiness(input = {}) {
  const classes = Array.isArray(input.classes) ? input.classes : [];
  const segments = (Array.isArray(input.segments) && input.segments.length)
    ? input.segments.map(normalizeTranscriptSegment)
    : classes.map((item, index) => normalizeTranscriptSegment({
        id: item.id || `class_${index + 1}`,
        transcript_text: item.transcript_text,
        normalized_text: item.transcript_notes || item.summary,
        review_state: item.transcript_status === 'approved' ? 'approved' : (item.transcript_status || item.package_status || 'needs_review'),
        privacy_class: item.privacy_class || item.transcript_privacy_class || (item.package_status === 'published' ? 'cohort_general' : 'needs_review'),
      }, index));
  const privacyCounts = TRANSCRIPT_PRIVACY_CLASSES.reduce((acc, key) => {
    acc[key] = segments.filter((segment) => segment.privacy_class === key).length;
    return acc;
  }, {});
  return {
    requirement_id: TRANSCRIPT_PRIVACY_REQUIREMENT_ID,
    status: 'needs_operator_decision',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    sections: TRANSCRIPT_PRIVACY_SECTIONS,
    gates: {
      raw_transcript_public_rag_enabled: false,
      cross_student_retrieval_enabled: false,
      unreviewed_segment_retrieval_enabled: false,
      public_helper_raw_transcript_dump_enabled: false,
      live_privacy_smoke_complete: false,
    },
    summary: {
      classes_seen: classes.length,
      segments_seen: segments.length,
      raw_text_segments: segments.filter((segment) => segment.raw_text_present).length,
      normalized_segments: segments.filter((segment) => segment.normalized_text_present).length,
      rabbi_approved_segments: segments.filter((segment) => segment.rabbi_approved_version_present || ['rabbi_approved', 'published'].includes(segment.review_state)).length,
      needs_review_segments: segments.filter((segment) => ['needs_review', 'raw', 'privacy_review', 'speaker_review'].includes(segment.review_state) || segment.privacy_class === 'needs_review').length,
      privacy_counts: privacyCounts,
    },
    retrieval_examples: {
      public: buildTranscriptKnowledgeRetrievalPolicy({ segments, audience: { role: 'public' } }).summary,
      student: buildTranscriptKnowledgeRetrievalPolicy({ segments, audience: { role: 'student', student_id: input.example_student_id || null } }).summary,
      parent: buildTranscriptKnowledgeRetrievalPolicy({ segments, audience: { role: 'parent', student_id: input.example_student_id || null } }).summary,
    },
    blockers: [
      'Production public privacy smoke, deploy/live smoke, and live retrieval readback require explicit operator approval.',
      'Raw unreviewed transcripts, staff-private notes, and cross-student transcript/question/feedback retrieval remain blocked.',
    ],
  };
}

module.exports = {
  TRANSCRIPT_PRIVACY_CLASSES,
  TRANSCRIPT_PRIVACY_REQUIREMENT_ID,
  TRANSCRIPT_PRIVACY_SECTIONS,
  TRANSCRIPT_REVIEW_STATES,
  buildTranscriptKnowledgeRetrievalPolicy,
  buildTranscriptPrivacyReadiness,
  canAudienceReadTranscriptSegment,
  filterTranscriptSegmentsForAudience,
  normalizeTranscriptPrivacyClass,
  normalizeTranscriptReviewState,
  normalizeTranscriptSegment,
};
