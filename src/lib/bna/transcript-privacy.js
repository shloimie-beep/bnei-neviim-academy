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

const TRANSCRIPT_MATCH_CONFIDENCE_THRESHOLD = 0.92;
const TRANSCRIPT_STUDENT_MATCH_METHODS = [
  'registrant_id',
  'enrollment_id',
  'parent_confirmed',
  'student_login',
  'roster_email',
  'roster_phone',
  'manual_review',
  'rabbi_review',
];
const TRANSCRIPT_UNSAFE_MATCH_METHODS = [
  'none',
  'speaker_label',
  'guessed_speaker_label',
  'voice_guess',
  'llm_guess',
  'name_mentioned',
];

const TRANSCRIPT_PRIVACY_SECTIONS = [
  {
    key: 'version_model',
    label: 'Transcript Versions',
    status: 'implemented',
    result: 'Tracks raw, normalized, corrected, and Rabbi-approved transcript states without exposing raw text.',
  },
  {
    key: 'segments_speakers_confidence',
    label: 'Segments, Speakers, Confidence',
    status: 'implemented',
    result: 'Models timestamped segments, speaker labels, speaker confidence, match method, and match confidence.',
  },
  {
    key: 'privacy_classes',
    label: 'Privacy Classes',
    status: 'implemented',
    result: 'Defines provider_general, cohort_general, student_private, parent_visible, staff_private, excluded, and needs_review.',
  },
  {
    key: 'student_matching',
    label: 'Student Matching',
    status: 'implemented',
    result: 'Requires enrollment context, accepted match method, confidence threshold, and manual review for uncertain matches.',
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
    status: 'implemented',
    result: 'Public helper retrieval may use only reviewed safe snippets, never raw unreviewed transcript dumps.',
  },
  {
    key: 'audit_release',
    label: 'Audit And Release',
    status: 'live_smoke_ready',
    result: 'Read-only production smoke can verify no raw body, no guessed student mapping, and no cross-student retrieval.',
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

function normalizeMatchMethod(value = 'none') {
  const normalized = normalizeKey(value || 'none');
  if (TRANSCRIPT_STUDENT_MATCH_METHODS.includes(normalized)) return normalized;
  if (TRANSCRIPT_UNSAFE_MATCH_METHODS.includes(normalized)) return normalized;
  return normalized || 'none';
}

function approvedForNonStaff(reviewState = '') {
  return ['approved', 'rabbi_approved', 'published'].includes(normalizeTranscriptReviewState(reviewState));
}

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'object') return [value].filter(Boolean);
  return String(value)
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasEnrollmentContext(segment = {}) {
  return Boolean(
    segment.enrollment_context_present === true
    || segment.registrant_match_present === true
    || safeNumber(segment.enrollment_id || segment.enrollmentId)
    || safeText(segment.enrollment_ref || segment.enrollmentRef)
    || safeText(segment.enrollment_context || segment.enrollmentContext)
    || safeText(segment.registrant_id || segment.registrantId)
    || safeText(segment.registrant_ref || segment.registrantRef)
    || segment.registrant_match === true
    || segment.registrantMatch === true
  );
}

function normalizeTranscriptSegment(segment = {}, index = 0) {
  const transcript = safeText(segment.raw_text || segment.rawText || segment.text || segment.transcript_text || segment.transcriptText);
  const normalized = safeText(segment.normalized_text || segment.normalizedText || segment.approved_text || segment.approvedText);
  const studentId = safeNumber(segment.student_id || segment.studentId || segment.matched_student_id || segment.matchedStudentId);
  const matchMethod = normalizeMatchMethod(segment.match_method || segment.matchMethod || 'none');
  const speakerConfidence = safeNumber(segment.speaker_confidence || segment.speakerConfidence, null);
  const matchConfidence = safeNumber(segment.match_confidence || segment.matchConfidence, null);
  const corrected = safeText(segment.corrected_text || segment.correctedText);
  const rabbiApproved = safeText(segment.rabbi_approved_text || segment.rabbiApprovedText || segment.approved_text || segment.approvedText);
  const reviewedFeedback = safeText(segment.reviewed_feedback || segment.reviewedFeedback || segment.parent_safe_feedback || segment.parentSafeFeedback);
  return {
    segment_ref: safeText(segment.segment_ref || segment.segmentRef || segment.id || `segment_${index + 1}`),
    source_recording_ref: safeText(segment.source_recording_ref || segment.sourceRecordingRef || segment.recording_id || segment.recordingId),
    source_transcript_ref: safeText(segment.source_transcript_ref || segment.sourceTranscriptRef || segment.transcript_id || segment.transcriptId),
    start_ms: safeNumber(segment.start_ms || segment.startMs, null),
    end_ms: safeNumber(segment.end_ms || segment.endMs, null),
    raw_text_present: Boolean(transcript),
    raw_text_chars: transcript.length,
    normalized_text_present: Boolean(normalized),
    normalized_text_chars: normalized.length,
    speaker_label_present: Boolean(safeText(segment.speaker_label || segment.speakerLabel)),
    speaker_confidence: speakerConfidence,
    student_id: studentId,
    enrollment_context_present: hasEnrollmentContext(segment),
    registrant_match_present: Boolean(safeText(segment.registrant_id || segment.registrantId || segment.registrant_ref || segment.registrantRef) || segment.registrant_match === true || segment.registrantMatch === true),
    match_method: matchMethod,
    match_confidence: matchConfidence,
    review_state: normalizeTranscriptReviewState(segment.review_state || segment.reviewState),
    privacy_class: normalizeTranscriptPrivacyClass(segment.privacy_class || segment.privacyClass),
    source_version: safeText(segment.source_version || segment.sourceVersion || 'raw'),
    corrected_version_present: Boolean(corrected),
    corrected_text_chars: corrected.length,
    rabbi_approved_version_present: Boolean(rabbiApproved),
    rabbi_approved_text_chars: rabbiApproved.length,
    reviewed_feedback_present: Boolean(reviewedFeedback),
    reviewed_feedback_chars: reviewedFeedback.length,
    hebrew_aramaic_glossary_count: parseList(segment.hebrew_aramaic_glossary || segment.hebrewAramaicGlossary || segment.glossary).length,
    masechta_normalized: Boolean(safeText(segment.masechta || segment.masechta_normalized || segment.masechtaNormalized)),
    commentator_normalized: Boolean(safeText(segment.commentator || segment.commentator_normalized || segment.commentatorNormalized)),
    canonical_reference_present: Boolean(safeText(segment.canonical_reference || segment.canonicalReference || segment.mishnah_ref || segment.mishnahRef)),
  };
}

function audienceRole(audience = {}) {
  return normalizeKey(audience.role || audience.audience || audience.type || 'public');
}

function audienceStudentId(audience = {}) {
  return safeNumber(audience.student_id || audience.studentId || audience.member_student_id || audience.memberStudentId);
}

function isStudentScopedPrivacyClass(privacyClass = '') {
  return ['student_private', 'parent_visible'].includes(normalizeTranscriptPrivacyClass(privacyClass));
}

function analyzeTranscriptSegmentRelease(segment = {}) {
  const normalized = normalizeTranscriptSegment(segment);
  const reasons = [];
  const acceptedMethod = TRANSCRIPT_STUDENT_MATCH_METHODS.includes(normalized.match_method);
  const unsafeMethod = TRANSCRIPT_UNSAFE_MATCH_METHODS.includes(normalized.match_method);
  const studentScoped = isStudentScopedPrivacyClass(normalized.privacy_class);
  const staffOnly = normalized.privacy_class === 'staff_private';
  const excluded = normalized.privacy_class === 'excluded';
  const needsReview = normalized.privacy_class === 'needs_review'
    || ['raw', 'needs_review', 'speaker_review', 'privacy_review'].includes(normalized.review_state);

  if (excluded) reasons.push('excluded_segment');
  if (needsReview) reasons.push('manual_review_required');
  if (studentScoped && !normalized.student_id) reasons.push('student_id_required');
  if (studentScoped && !normalized.enrollment_context_present) reasons.push('enrollment_or_registrant_context_required');
  if (studentScoped && unsafeMethod) reasons.push('guessed_speaker_identity_not_student_data');
  if (studentScoped && !acceptedMethod) reasons.push('accepted_match_method_required');
  if (studentScoped && normalized.match_method !== 'manual_review' && normalized.match_method !== 'rabbi_review') {
    if (normalized.match_confidence === null || normalized.match_confidence < TRANSCRIPT_MATCH_CONFIDENCE_THRESHOLD) {
      reasons.push('match_confidence_below_threshold');
    }
  }
  if (normalized.privacy_class === 'parent_visible' && !normalized.reviewed_feedback_present && !normalized.rabbi_approved_version_present && normalized.review_state !== 'rabbi_approved') {
    reasons.push('parent_visible_requires_reviewed_feedback_card');
  }

  const reviewerApproved = ['approved', 'rabbi_approved', 'published'].includes(normalized.review_state);
  const canMapToStudentRecord = studentScoped
    && !excluded
    && !unsafeMethod
    && acceptedMethod
    && Boolean(normalized.student_id)
    && normalized.enrollment_context_present
    && (normalized.match_method === 'manual_review' || normalized.match_method === 'rabbi_review' || (normalized.match_confidence !== null && normalized.match_confidence >= TRANSCRIPT_MATCH_CONFIDENCE_THRESHOLD))
    && reviewerApproved;
  const canExposeToParent = canMapToStudentRecord
    && normalized.privacy_class === 'parent_visible'
    && (normalized.reviewed_feedback_present || normalized.rabbi_approved_version_present || normalized.review_state === 'rabbi_approved');
  const canExposeToStudent = canMapToStudentRecord && normalized.privacy_class === 'student_private';
  const canUseForPublicHelper = reviewerApproved && ['provider_general', 'cohort_general'].includes(normalized.privacy_class);

  return {
    ...normalized,
    release_state: excluded ? 'excluded'
      : reasons.length ? 'needs_review'
        : staffOnly ? 'staff_only'
          : canUseForPublicHelper ? 'public_helper_safe'
            : canExposeToParent ? 'parent_visible'
              : canExposeToStudent ? 'student_private'
                : reviewerApproved ? 'reviewed_general' : 'needs_review',
    manual_review_required: reasons.length > 0,
    review_reasons: reasons,
    can_map_to_student_record: canMapToStudentRecord,
    can_expose_to_student: canExposeToStudent,
    can_expose_to_parent: canExposeToParent,
    can_use_for_public_helper: canUseForPublicHelper,
    raw_text_returned: false,
    transcript_body_returned: false,
  };
}

function canAudienceReadTranscriptSegment(segment = {}, audience = {}) {
  const normalized = analyzeTranscriptSegmentRelease(segment);
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
    if (privacyClass === 'student_private' && !normalized.can_map_to_student_record) return { allowed: false, reason: normalized.review_reasons[0] || 'student_mapping_not_reviewed' };
    if (privacyClass === 'student_private' && normalized.student_id && normalized.student_id === studentId) return { allowed: true, reason: 'own_student_private_segment' };
    return { allowed: false, reason: 'student_scope_mismatch' };
  }
  if (role === 'parent') {
    if (['provider_general', 'cohort_general'].includes(privacyClass)) return { allowed: true, reason: 'parent_safe_general_segment' };
    if (privacyClass === 'parent_visible' && !normalized.can_expose_to_parent) return { allowed: false, reason: normalized.review_reasons[0] || 'parent_visible_not_reviewed' };
    if (privacyClass === 'parent_visible' && normalized.student_id && normalized.student_id === studentId) return { allowed: true, reason: 'own_parent_visible_segment' };
    return { allowed: false, reason: 'parent_scope_mismatch' };
  }
  return { allowed: false, reason: 'unknown_audience' };
}

function filterTranscriptSegmentsForAudience(segments = [], audience = {}) {
  return (Array.isArray(segments) ? segments : []).map((segment, index) => {
    const normalized = analyzeTranscriptSegmentRelease(normalizeTranscriptSegment(segment, index));
    const decision = canAudienceReadTranscriptSegment(normalized, audience);
    return {
      ...normalized,
      allowed: decision.allowed,
      reason: decision.reason,
      text_returned: false,
    };
  });
}

function buildTranscriptReleasePolicy(input = {}) {
  const segments = (Array.isArray(input.segments) ? input.segments : []).map((segment, index) => analyzeTranscriptSegmentRelease(normalizeTranscriptSegment(segment, index)));
  const manualReview = segments.filter((segment) => segment.manual_review_required);
  const guessedSpeakerBlocks = segments.filter((segment) => segment.review_reasons.includes('guessed_speaker_identity_not_student_data'));
  return {
    requirement_id: TRANSCRIPT_PRIVACY_REQUIREMENT_ID,
    match_confidence_threshold: TRANSCRIPT_MATCH_CONFIDENCE_THRESHOLD,
    accepted_match_methods: TRANSCRIPT_STUDENT_MATCH_METHODS,
    unsafe_match_methods: TRANSCRIPT_UNSAFE_MATCH_METHODS,
    raw_text_returned: false,
    transcript_body_returned: false,
    summary: {
      total_segments: segments.length,
      manual_review_required: manualReview.length,
      guessed_speaker_blocks: guessedSpeakerBlocks.length,
      student_record_allowed: segments.filter((segment) => segment.can_map_to_student_record).length,
      parent_visible_allowed: segments.filter((segment) => segment.can_expose_to_parent).length,
      public_helper_allowed: segments.filter((segment) => segment.can_use_for_public_helper).length,
    },
    segments: segments.map((segment) => ({
      segment_ref: segment.segment_ref,
      privacy_class: segment.privacy_class,
      review_state: segment.review_state,
      release_state: segment.release_state,
      manual_review_required: segment.manual_review_required,
      review_reasons: segment.review_reasons,
      can_map_to_student_record: segment.can_map_to_student_record,
      can_expose_to_parent: segment.can_expose_to_parent,
      can_use_for_public_helper: segment.can_use_for_public_helper,
      raw_text_returned: false,
      transcript_body_returned: false,
    })),
  };
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
        review_state: item.transcript_review_state || (item.transcript_status === 'approved' ? 'approved' : (item.transcript_status || item.package_status || 'needs_review')),
        privacy_class: item.privacy_class || item.transcript_privacy_class || (item.package_status === 'published' ? 'cohort_general' : 'needs_review'),
        source_recording_ref: item.id ? `class_session:${item.id}` : '',
        source_transcript_ref: item.content_job_id ? `content_job:${item.content_job_id}` : '',
        match_method: item.transcript_match_method || 'none',
        match_confidence: item.transcript_match_confidence || null,
        enrollment_context: item.transcript_enrollment_context || '',
        hebrew_aramaic_glossary: item.transcript_glossary || [],
        masechta: item.masechta || '',
      }, index));
  const privacyCounts = TRANSCRIPT_PRIVACY_CLASSES.reduce((acc, key) => {
    acc[key] = segments.filter((segment) => segment.privacy_class === key).length;
    return acc;
  }, {});
  const releasePolicy = buildTranscriptReleasePolicy({ segments });
  return {
    requirement_id: TRANSCRIPT_PRIVACY_REQUIREMENT_ID,
    status: 'implemented_read_only',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    raw_text_returned: false,
    transcript_body_returned: false,
    match_confidence_threshold: TRANSCRIPT_MATCH_CONFIDENCE_THRESHOLD,
    accepted_match_methods: TRANSCRIPT_STUDENT_MATCH_METHODS,
    unsafe_match_methods: TRANSCRIPT_UNSAFE_MATCH_METHODS,
    sections: TRANSCRIPT_PRIVACY_SECTIONS,
    storage_model: {
      raw_transcript: 'stored only in restricted transcript_text/source asset fields, never returned by readiness or member-safe APIs',
      normalized_transcript: 'tracked through transcript_notes/transcript_versions metadata',
      timestamped_segments: 'stored in transcript_segments JSON metadata with body-free readiness projection',
      corrected_version: 'tracked before Rabbi approval',
      rabbi_approved_version: 'required before parent-visible release',
      source_recording: 'linked by class/session, content job, Zoom recording, or Vimeo asset reference',
      glossary_and_normalization: 'Hebrew/Aramaic glossary, Masechta, commentator, and canonical reference flags are modeled',
    },
    gates: {
      raw_transcript_public_rag_enabled: false,
      cross_student_retrieval_enabled: false,
      unreviewed_segment_retrieval_enabled: false,
      public_helper_raw_transcript_dump_enabled: false,
      guessed_speaker_to_student_record_enabled: false,
      live_privacy_smoke_complete: Boolean(input.live_privacy_smoke_complete),
    },
    summary: {
      classes_seen: classes.length,
      segments_seen: segments.length,
      raw_text_segments: segments.filter((segment) => segment.raw_text_present).length,
      normalized_segments: segments.filter((segment) => segment.normalized_text_present).length,
      rabbi_approved_segments: segments.filter((segment) => segment.rabbi_approved_version_present || ['rabbi_approved', 'published'].includes(segment.review_state)).length,
      needs_review_segments: segments.filter((segment) => ['needs_review', 'raw', 'privacy_review', 'speaker_review'].includes(segment.review_state) || segment.privacy_class === 'needs_review').length,
      privacy_counts: privacyCounts,
      manual_review_required_segments: releasePolicy.summary.manual_review_required,
      guessed_speaker_blocks: releasePolicy.summary.guessed_speaker_blocks,
      student_record_allowed_segments: releasePolicy.summary.student_record_allowed,
      parent_visible_allowed_segments: releasePolicy.summary.parent_visible_allowed,
      public_helper_allowed_segments: releasePolicy.summary.public_helper_allowed,
    },
    release_policy: releasePolicy,
    retrieval_examples: {
      public: buildTranscriptKnowledgeRetrievalPolicy({ segments, audience: { role: 'public' } }).summary,
      student: buildTranscriptKnowledgeRetrievalPolicy({ segments, audience: { role: 'student', student_id: input.example_student_id || null } }).summary,
      parent: buildTranscriptKnowledgeRetrievalPolicy({ segments, audience: { role: 'parent', student_id: input.example_student_id || null } }).summary,
    },
    guardrails: [
      'Raw unreviewed transcripts, staff-private notes, and cross-student transcript/question/feedback retrieval remain blocked.',
      'Speaker labels and voice guesses are never enough to write student data.',
      'Parent-visible output should use reviewed Rabbi feedback cards, not raw transcript excerpts.',
    ],
    blockers: [],
    remaining_operator_decisions: [],
  };
}

module.exports = {
  TRANSCRIPT_PRIVACY_CLASSES,
  TRANSCRIPT_PRIVACY_REQUIREMENT_ID,
  TRANSCRIPT_PRIVACY_SECTIONS,
  TRANSCRIPT_MATCH_CONFIDENCE_THRESHOLD,
  TRANSCRIPT_STUDENT_MATCH_METHODS,
  TRANSCRIPT_UNSAFE_MATCH_METHODS,
  TRANSCRIPT_REVIEW_STATES,
  analyzeTranscriptSegmentRelease,
  buildTranscriptReleasePolicy,
  buildTranscriptKnowledgeRetrievalPolicy,
  buildTranscriptPrivacyReadiness,
  canAudienceReadTranscriptSegment,
  filterTranscriptSegmentsForAudience,
  normalizeTranscriptPrivacyClass,
  normalizeTranscriptReviewState,
  normalizeTranscriptSegment,
};
