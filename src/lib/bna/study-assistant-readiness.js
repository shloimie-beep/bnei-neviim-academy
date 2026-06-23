const crypto = require('node:crypto');

const STUDY_ASSISTANT_REQUIREMENT_ID = 'REQ-20260619-312';

const SOURCE_VERSION_REQUIRED_FIELDS = [
  'canonical_reference',
  'title',
  'index_title',
  'version_title',
  'language',
  'license',
  'attribution',
  'source_url',
  'retrieved_at',
  'content_hash',
  'rabbi_approval_status',
  'quote_permission',
  'summary_permission',
  'index_permission',
];

const STUDY_ASSISTANT_SOURCE_SCOPES = [
  'provider_wide',
  'cohort',
  'student_private',
  'restricted',
];

const SOURCE_REVIEW_STATES = [
  'draft',
  'source_checked',
  'citation_verified',
  'license_reviewed',
  'rabbi_approved',
  'rejected',
  'needs_review',
];

const SOURCE_PERMISSION_STATES = [
  'allowed',
  'needs_review',
  'blocked',
];

const STUDY_ASSISTANT_READINESS_SECTIONS = [
  {
    key: 'source_version_model',
    label: 'Approved Source-Version Model',
    status: 'implemented',
    result: 'Each source version requires canonical reference, version title, language, license, attribution, URL/reference, retrieved timestamp, content hash, Rabbi approval, and explicit permissions.',
  },
  {
    key: 'provider_wide_retrieval',
    label: 'Provider-Wide Retrieval',
    status: 'implemented_preview',
    result: 'Rabbi-approved recordings, transcripts, summaries, handouts, and approved Sefaria texts can be modeled as provider-wide metadata only.',
  },
  {
    key: 'cohort_retrieval',
    label: 'Cohort Retrieval',
    status: 'implemented_preview',
    result: 'Cohort material requires matching cohort context before it can appear in assistant retrieval previews.',
  },
  {
    key: 'student_private_retrieval',
    label: 'Student-Private Retrieval',
    status: 'guarded',
    result: 'Student-private questions, reviewed feedback, assignments, attendance, badges, and approved transcript segments remain scoped to the matching student.',
  },
  {
    key: 'restricted_sources',
    label: 'Restricted Sources',
    status: 'blocked_by_policy',
    result: 'Another student information, raw unreviewed transcripts, staff notes, moderation metadata, and private family information are blocked from study-assistant retrieval.',
  },
  {
    key: 'licensing_review',
    label: 'Licensing Review',
    status: 'implemented_gate',
    result: 'Source licensing must be reviewed before quote, summary, or indexing permissions become assistant-ready.',
  },
  {
    key: 'citation_verification',
    label: 'Citation Verification',
    status: 'implemented_gate',
    result: 'Citation verification is required before answer generation or source display can launch.',
  },
  {
    key: 'transcript_privacy',
    label: 'Transcript Privacy',
    status: 'guarded',
    result: 'Raw or unreviewed transcripts are not retrievable; approved student-specific transcript segments stay student-scoped.',
  },
  {
    key: 'disabled_feature_flag',
    label: 'Disabled Feature Flag',
    status: 'guarded',
    result: 'The study assistant remains disabled until source, citation, privacy, retrieval, and Rabbi-approval gates pass.',
  },
  {
    key: 'rabbi_approval',
    label: 'Rabbi Approval',
    status: 'implemented_gate',
    result: 'Rabbi approval is required for source versions and any launch-facing assistant behavior.',
  },
  {
    key: 'audit_release',
    label: 'Audit And Release',
    status: 'live_smoke_ready',
    result: 'Read-only readiness can be deployed and live-smoked while answer generation and corpus mutation stay disabled.',
  },
];

const STUDY_ASSISTANT_FUTURE_CAPABILITIES = [
  'explain_assigned_mishnah',
  'ask_guiding_questions',
  'quiz',
  'suggest_chazarah',
  'retrieve_rabbi_approved_teaching',
  'locate_video_timestamps',
  'cite_approved_sefaria_references',
];

const STUDY_ASSISTANT_PROHIBITED_BEHAVIORS = [
  'expose_another_student',
  'use_raw_unreviewed_transcripts',
  'fabricate_citations',
  'claim_rabbi_scheller_said_unsupported_content',
  'unrestricted_general_chat',
  'ingest_arbitrary_versions',
  'return_raw_source_text',
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
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function hasOwn(input = {}, keys = []) {
  return keys.some((key) => Object.prototype.hasOwnProperty.call(input, key));
}

function normalizeStudyAssistantScope(value = 'restricted') {
  const normalized = normalizeKey(value || 'restricted');
  return STUDY_ASSISTANT_SOURCE_SCOPES.includes(normalized) ? normalized : 'restricted';
}

function normalizeSourceReviewState(value = 'needs_review') {
  const normalized = normalizeKey(value || 'needs_review');
  if (['approved', 'rabbi_reviewed', 'final'].includes(normalized)) return 'rabbi_approved';
  return SOURCE_REVIEW_STATES.includes(normalized) ? normalized : 'needs_review';
}

function normalizePermission(value, fallback = 'needs_review') {
  if (value === true) return 'allowed';
  if (value === false) return 'blocked';
  const normalized = normalizeKey(value || fallback);
  if (['yes', 'y', 'allow', 'allowed', 'permitted', 'approved', 'true'].includes(normalized)) return 'allowed';
  if (['no', 'n', 'deny', 'denied', 'blocked', 'prohibited', 'false'].includes(normalized)) return 'blocked';
  return SOURCE_PERMISSION_STATES.includes(normalized) ? normalized : 'needs_review';
}

function sourceContentHash(text = '') {
  const body = String(text || '');
  if (!body) return '';
  return crypto.createHash('sha256').update(body, 'utf8').digest('hex');
}

function sourceBody(input = {}) {
  return safeText(
    input.content
      || input.text
      || input.body
      || input.raw_text
      || input.rawText
      || input.snippet
      || input.excerpt
      || input.transcript_text
      || input.transcriptText
  );
}

function normalizeSourceVersion(source = {}, index = 0) {
  const body = sourceBody(source);
  const contentHash = safeText(source.content_hash || source.contentHash || source.hash || source.sha256)
    || sourceContentHash(body);
  const reviewState = normalizeSourceReviewState(
    source.rabbi_approval_status
      || source.rabbiApprovalStatus
      || source.review_state
      || source.reviewState
      || source.status
  );
  const quotePermission = normalizePermission(source.quote_permission ?? source.quotePermission);
  const summaryPermission = normalizePermission(source.summary_permission ?? source.summaryPermission);
  const indexPermission = normalizePermission(source.index_permission ?? source.indexPermission);
  const normalized = {
    source_ref: safeText(source.source_ref || source.sourceRef || source.id || `source_${index + 1}`),
    canonical_reference: safeText(source.canonical_reference || source.canonicalReference || source.ref || source.reference || source.source_reference || source.sourceReference),
    title: safeText(source.title || source.display_title || source.displayTitle),
    index_title: safeText(source.index_title || source.indexTitle || source.index || source.book || source.sefer),
    version_title: safeText(source.version_title || source.versionTitle || source.version || source.translation),
    language: safeText(source.language || source.lang),
    license: safeText(source.license || source.license_name || source.licenseName),
    attribution: safeText(source.attribution || source.attribution_text || source.attributionText || source.credit),
    source_url: safeText(source.source_url || source.sourceUrl || source.url || source.href),
    retrieved_at: safeText(source.retrieved_at || source.retrievedAt || source.fetched_at || source.fetchedAt),
    content_hash: contentHash,
    content_present: Boolean(body),
    content_chars: body.length,
    content_returned: false,
    rabbi_approval_status: reviewState,
    quote_permission: quotePermission,
    summary_permission: summaryPermission,
    index_permission: indexPermission,
    retrieval_scope: normalizeStudyAssistantScope(source.retrieval_scope || source.retrievalScope || source.scope || source.privacy_scope || source.privacyScope),
    cohort_key: safeText(source.cohort_key || source.cohortKey || source.cohort_id || source.cohortId),
    student_id: safeNumber(source.student_id || source.studentId || source.matched_student_id || source.matchedStudentId),
    citation_verified: Boolean(source.citation_verified || source.citationVerified || reviewState === 'citation_verified' || reviewState === 'rabbi_approved'),
    license_reviewed: Boolean(source.license_reviewed || source.licenseReviewed || reviewState === 'license_reviewed' || reviewState === 'rabbi_approved'),
    raw_or_unreviewed: Boolean(source.raw_unreviewed || source.rawUnreviewed || source.raw_transcript || source.rawTranscript)
      || ['draft', 'needs_review'].includes(reviewState),
    staff_only: Boolean(source.staff_only || source.staffOnly),
    parent_visible: Boolean(source.parent_visible || source.parentVisible),
    moderation_metadata: Boolean(source.moderation_metadata || source.moderationMetadata),
    source_type: normalizeKey(source.source_type || source.sourceType || source.kind || 'source_version'),
  };
  const missing = [];
  const fieldPresence = {
    canonical_reference: Boolean(normalized.canonical_reference),
    title: Boolean(normalized.title),
    index_title: Boolean(normalized.index_title),
    version_title: Boolean(normalized.version_title),
    language: Boolean(normalized.language),
    license: Boolean(normalized.license),
    attribution: Boolean(normalized.attribution),
    source_url: Boolean(normalized.source_url),
    retrieved_at: Boolean(normalized.retrieved_at),
    content_hash: Boolean(normalized.content_hash),
    rabbi_approval_status: hasOwn(source, ['rabbi_approval_status', 'rabbiApprovalStatus', 'review_state', 'reviewState', 'status']),
    quote_permission: hasOwn(source, ['quote_permission', 'quotePermission']),
    summary_permission: hasOwn(source, ['summary_permission', 'summaryPermission']),
    index_permission: hasOwn(source, ['index_permission', 'indexPermission']),
  };
  for (const field of SOURCE_VERSION_REQUIRED_FIELDS) {
    if (!fieldPresence[field]) missing.push(field);
  }
  return {
    ...normalized,
    missing_fields: missing,
  };
}

function sourceIsAssistantReady(source = {}) {
  const normalized = source.missing_fields ? source : normalizeSourceVersion(source);
  return normalized.missing_fields.length === 0
    && normalized.rabbi_approval_status === 'rabbi_approved'
    && normalized.license_reviewed
    && normalized.citation_verified
    && normalized.quote_permission === 'allowed'
    && normalized.summary_permission === 'allowed'
    && normalized.index_permission === 'allowed'
    && !normalized.raw_or_unreviewed
    && !normalized.moderation_metadata
    && !normalized.staff_only
    && normalized.retrieval_scope !== 'restricted';
}

function audienceRole(audience = {}) {
  return normalizeKey(audience.role || audience.audience || audience.type || 'public');
}

function audienceStudentId(audience = {}) {
  return safeNumber(audience.student_id || audience.studentId || audience.member_student_id || audience.memberStudentId);
}

function audienceCohortKey(audience = {}) {
  return safeText(audience.cohort_key || audience.cohortKey || audience.cohort_id || audience.cohortId);
}

function requestedPermission(audience = {}) {
  const mode = normalizeKey(audience.retrieval_mode || audience.retrievalMode || audience.mode || 'summary');
  if (mode === 'quote') return 'quote_permission';
  if (mode === 'index') return 'index_permission';
  return 'summary_permission';
}

function canRetrieveStudyAssistantSource(source = {}, audience = {}) {
  const normalized = source.missing_fields ? source : normalizeSourceVersion(source);
  const role = audienceRole(audience);
  const studentId = audienceStudentId(audience);
  const cohortKey = audienceCohortKey(audience);
  const staffRoles = ['admin', 'super_admin', 'staff', 'rabbi', 'provider'];
  if (normalized.retrieval_scope === 'restricted') {
    return { allowed: false, reason: 'restricted_source_not_for_study_assistant', source: normalized };
  }
  if (normalized.raw_or_unreviewed || normalized.moderation_metadata || normalized.staff_only) {
    return { allowed: false, reason: 'raw_staff_or_moderation_source_blocked', source: normalized };
  }
  if (!sourceIsAssistantReady(normalized)) {
    return { allowed: false, reason: 'source_not_ready_for_study_assistant', source: normalized };
  }
  const permissionField = requestedPermission(audience);
  if (normalized[permissionField] !== 'allowed') {
    return { allowed: false, reason: `${permissionField}_not_allowed`, source: normalized };
  }
  if (normalized.retrieval_scope === 'provider_wide') {
    return { allowed: role === 'public' ? false : true, reason: role === 'public' ? 'public_not_in_provider_scope' : 'approved_provider_wide_source', source: normalized };
  }
  if (normalized.retrieval_scope === 'cohort') {
    if (normalized.cohort_key && cohortKey && normalized.cohort_key !== cohortKey) {
      return { allowed: false, reason: 'cohort_scope_mismatch', source: normalized };
    }
    return { allowed: role === 'public' ? false : true, reason: role === 'public' ? 'public_not_in_cohort_scope' : 'approved_cohort_source', source: normalized };
  }
  if (normalized.retrieval_scope === 'student_private') {
    if (staffRoles.includes(role)) return { allowed: true, reason: 'staff_review_access_to_approved_student_source', source: normalized };
    if (role === 'student' && normalized.student_id && normalized.student_id === studentId) {
      return { allowed: true, reason: 'own_student_private_source', source: normalized };
    }
    if (role === 'parent' && normalized.parent_visible && normalized.student_id && normalized.student_id === studentId) {
      return { allowed: true, reason: 'own_parent_visible_student_source', source: normalized };
    }
    return { allowed: false, reason: 'student_scope_mismatch', source: normalized };
  }
  return { allowed: false, reason: 'unknown_scope', source: normalized };
}

function sourceSummaryForPreview(source = {}, decision = {}) {
  const normalized = source.missing_fields ? source : normalizeSourceVersion(source);
  return {
    source_ref: normalized.source_ref,
    canonical_reference: normalized.canonical_reference,
    title: normalized.title,
    index_title: normalized.index_title,
    version_title: normalized.version_title,
    language: normalized.language,
    retrieval_scope: normalized.retrieval_scope,
    rabbi_approval_status: normalized.rabbi_approval_status,
    citation_verified: normalized.citation_verified,
    license_reviewed: normalized.license_reviewed,
    missing_fields: normalized.missing_fields,
    reason: decision.reason || '',
    content_returned: false,
  };
}

function buildScopedStudyRetrievalPreview(input = {}) {
  const sources = (Array.isArray(input.sources) ? input.sources : []).map(normalizeSourceVersion);
  const decisions = sources.map((source) => {
    const decision = canRetrieveStudyAssistantSource(source, input.audience || {});
    return {
      source,
      allowed: decision.allowed,
      reason: decision.reason,
    };
  });
  const allowed = decisions.filter((item) => item.allowed);
  const blocked = decisions.filter((item) => !item.allowed);
  return {
    requirement_id: STUDY_ASSISTANT_REQUIREMENT_ID,
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    content_returned: false,
    answer_generation_enabled: false,
    audience: {
      role: audienceRole(input.audience || {}),
      student_id_present: Boolean(audienceStudentId(input.audience || {})),
      cohort_key_present: Boolean(audienceCohortKey(input.audience || {})),
    },
    allowed_sources: allowed.map((item) => sourceSummaryForPreview(item.source, item)),
    blocked_sources: blocked.map((item) => sourceSummaryForPreview(item.source, item)),
    summary: {
      sources_seen: sources.length,
      allowed_sources: allowed.length,
      blocked_sources: blocked.length,
      restricted_sources_blocked: blocked.filter((item) => item.source.retrieval_scope === 'restricted').length,
      raw_or_unreviewed_blocked: blocked.filter((item) => item.source.raw_or_unreviewed).length,
      cross_student_blocked: blocked.filter((item) => item.reason === 'student_scope_mismatch').length,
    },
  };
}

function sourceVersionsFromClasses(classes = []) {
  return (Array.isArray(classes) ? classes : []).flatMap((item, classIndex) => {
    const sourceItems = Array.isArray(item.sources) ? item.sources : [];
    return sourceItems.map((source, sourceIndex) => ({
      ...source,
      source_ref: source.id || `class_${item.id || classIndex + 1}_source_${sourceIndex + 1}`,
      title: source.title || item.title,
      retrieval_scope: source.retrieval_scope || source.scope || 'cohort',
      cohort_key: source.cohort_key || item.cohort_key || item.curriculum_key || 'one_time_mishnah',
      review_state: source.review_state || item.package_status || 'needs_review',
    }));
  });
}

function buildStudyAssistantReadiness(input = {}) {
  const explicitSources = Array.isArray(input.sources) ? input.sources : [];
  const classSources = sourceVersionsFromClasses(input.classes || []);
  const sources = (explicitSources.length ? explicitSources : classSources).map(normalizeSourceVersion);
  const scopeCounts = STUDY_ASSISTANT_SOURCE_SCOPES.reduce((acc, key) => {
    acc[key] = sources.filter((source) => source.retrieval_scope === key).length;
    return acc;
  }, {});
  return {
    requirement_id: STUDY_ASSISTANT_REQUIREMENT_ID,
    status: 'implemented_read_only',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    sections: STUDY_ASSISTANT_READINESS_SECTIONS,
    approved_source_version_whitelist: SOURCE_VERSION_REQUIRED_FIELDS,
    future_capabilities: STUDY_ASSISTANT_FUTURE_CAPABILITIES,
    prohibited_behaviors: STUDY_ASSISTANT_PROHIBITED_BEHAVIORS,
    retrieval_policy: {
      apply_authorization_before_retrieval: true,
      allowed_scopes: STUDY_ASSISTANT_SOURCE_SCOPES,
      requires_rabbi_approval: true,
      requires_citation_verification: true,
      requires_license_review: true,
      requires_explicit_quote_summary_index_permissions: true,
      content_returned_by_readiness: false,
      arbitrary_versions_allowed: false,
    },
    gates: {
      study_assistant_feature_flag_enabled: false,
      unrestricted_ai_chat_enabled: false,
      arbitrary_translation_ingestion_enabled: false,
      arbitrary_version_ingestion_enabled: false,
      unreviewed_source_retrieval_enabled: false,
      raw_transcript_retrieval_enabled: false,
      cross_student_retrieval_enabled: false,
      answer_generation_enabled: false,
      portal_publish_enabled: false,
      source_corpus_mutation_enabled: false,
      live_study_assistant_write_smoke_complete: false,
    },
    summary: {
      source_versions_seen: sources.length,
      missing_required_metadata: sources.filter((source) => source.missing_fields.length > 0).length,
      assistant_ready_sources: sources.filter(sourceIsAssistantReady).length,
      rabbi_approved_sources: sources.filter((source) => source.rabbi_approval_status === 'rabbi_approved').length,
      license_reviewed_sources: sources.filter((source) => source.license_reviewed).length,
      citation_verified_sources: sources.filter((source) => source.citation_verified).length,
      scope_counts: scopeCounts,
    },
    retrieval_examples: {
      provider_wide: buildScopedStudyRetrievalPreview({ sources, audience: { role: 'provider', mode: 'summary' } }).summary,
      cohort: buildScopedStudyRetrievalPreview({ sources, audience: { role: 'student', cohort_key: 'one_time_mishnah', mode: 'summary' } }).summary,
      student_private: buildScopedStudyRetrievalPreview({ sources, audience: { role: 'student', student_id: input.example_student_id || null, mode: 'summary' } }).summary,
      restricted: buildScopedStudyRetrievalPreview({ sources, audience: { role: 'student', student_id: input.example_student_id || null, mode: 'summary' } }).summary,
    },
    guardrails: [
      'Study assistant feature flag remains disabled.',
      'Answer generation, Sefaria/API ingestion, arbitrary translation merge, arbitrary version ingestion, and corpus mutation remain disabled.',
      'Authorization is applied before retrieval previews.',
      'Restricted sources, raw transcripts, staff notes, moderation metadata, private family information, and cross-student material remain blocked.',
      'Readiness responses do not return source text.',
    ],
    blockers: [],
  };
}

module.exports = {
  SOURCE_PERMISSION_STATES,
  SOURCE_REVIEW_STATES,
  SOURCE_VERSION_REQUIRED_FIELDS,
  STUDY_ASSISTANT_READINESS_SECTIONS,
  STUDY_ASSISTANT_FUTURE_CAPABILITIES,
  STUDY_ASSISTANT_PROHIBITED_BEHAVIORS,
  STUDY_ASSISTANT_REQUIREMENT_ID,
  STUDY_ASSISTANT_SOURCE_SCOPES,
  buildScopedStudyRetrievalPreview,
  buildSourceVersionApprovalPreview: (input = {}) => {
    const source = normalizeSourceVersion(input.source || input);
    return {
      requirement_id: STUDY_ASSISTANT_REQUIREMENT_ID,
      preview_only: true,
      external_write_performed: false,
      production_mutation_performed: false,
      source: sourceSummaryForPreview(source),
      source_version_ready: sourceIsAssistantReady(source),
      missing_fields: source.missing_fields,
      content_returned: false,
    };
  },
  buildStudyAssistantReadiness,
  canRetrieveStudyAssistantSource,
  normalizePermission,
  normalizeSourceReviewState,
  normalizeSourceVersion,
  normalizeStudyAssistantScope,
  sourceContentHash,
};
