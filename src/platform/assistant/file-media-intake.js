const crypto = require('crypto');

const {
  actionPolicy,
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');
const {
  createIntakeSourceRecord,
  inferSourceKind,
  stableHash,
} = require('../ingestion/intake-source');

const FILE_MEDIA_INTAKE_REQUIREMENT_ID = 'REQ-20260623-016';
const CONTRACT_VERSION = 'assistant-file-media-intake-v1';

const MEDIA_TYPES = Object.freeze([
  'message',
  'image',
  'audio',
  'video',
  'document',
  'transcript',
  'archive',
  'unknown',
]);

const MAX_BYTES_BY_TYPE = Object.freeze({
  message: 128 * 1024,
  image: 25 * 1024 * 1024,
  audio: 500 * 1024 * 1024,
  video: 1500 * 1024 * 1024,
  document: 75 * 1024 * 1024,
  transcript: 10 * 1024 * 1024,
  archive: 100 * 1024 * 1024,
  unknown: 10 * 1024 * 1024,
});

const BLOCKED_EXTENSIONS = new Set([
  'bat',
  'cmd',
  'com',
  'dll',
  'exe',
  'js',
  'msi',
  'ps1',
  'scr',
  'sh',
  'vbs',
]);

const BLOCKED_MIME_PATTERNS = [
  /^application\/x-msdownload/i,
  /^application\/x-msdos-program/i,
  /^application\/x-sh/i,
  /^application\/x-bat/i,
  /^text\/javascript/i,
  /^application\/javascript/i,
];

function compact(value = '', maxLength = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeKey(value = '', fallback = '') {
  const key = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key || fallback;
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function extensionFromFilename(filename = '') {
  const match = String(filename || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

function classifyMediaType({ mime_type = '', mimeType = '', filename = '', source_kind = '', sourceKind = '' } = {}) {
  const mime = String(mime_type || mimeType || '').toLowerCase();
  const name = String(filename || '').toLowerCase();
  const explicit = normalizeKey(source_kind || sourceKind, '');
  if (MEDIA_TYPES.includes(explicit)) return explicit;
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|heic|svg)$/.test(name)) return 'image';
  if (mime.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|opus)$/.test(name)) return 'audio';
  if (mime.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/.test(name)) return 'video';
  if (/\b(transcript|vtt|srt|txt|text\/plain)\b/.test(`${mime} ${name}`)) return 'transcript';
  if (/\b(zip|tar|gzip|rar|7z)\b/.test(`${mime} ${name}`)) return 'archive';
  if (mime || name) return 'document';
  return 'message';
}

function attachmentFingerprint(input = {}) {
  const checksum = input.checksum || input.file_checksum || input.fileChecksum || input.sha256 || '';
  if (checksum) return String(checksum).toLowerCase();
  const parts = [
    input.file_unique_id || input.fileUniqueId || '',
    input.file_id || input.fileId || '',
    input.source_id || input.sourceId || '',
    input.source_link || input.sourceLink || '',
    input.filename || input.name || '',
    input.mime_type || input.mimeType || '',
    input.size_bytes || input.sizeBytes || '',
    input.raw_text || input.rawText || input.text || '',
    input.transcript_text || input.transcriptText || '',
  ];
  return sha256(parts.join('\n--bna-media-fingerprint--\n'));
}

function validateAttachment(input = {}) {
  const filename = input.filename || input.name || '';
  const mime = String(input.mime_type || input.mimeType || '').toLowerCase();
  const mediaType = classifyMediaType(input);
  const sizeBytes = Number(input.size_bytes || input.sizeBytes || input.file_size || input.fileSize || 0);
  const extension = extensionFromFilename(filename);
  const errors = [];
  const warnings = [];

  if (extension && BLOCKED_EXTENSIONS.has(extension)) errors.push(`blocked_extension:${extension}`);
  if (mime && BLOCKED_MIME_PATTERNS.some((pattern) => pattern.test(mime))) errors.push(`blocked_mime:${mime}`);
  const maxBytes = MAX_BYTES_BY_TYPE[mediaType] || MAX_BYTES_BY_TYPE.unknown;
  if (sizeBytes > maxBytes) errors.push(`file_too_large:${mediaType}`);
  if (!mime && mediaType !== 'message') warnings.push('missing_mime_type');
  if (!sizeBytes && mediaType !== 'message') warnings.push('missing_size');

  return {
    ok: errors.length === 0,
    media_type: mediaType,
    size_bytes: sizeBytes,
    max_bytes: maxBytes,
    needs_virus_scan: mediaType !== 'message',
    errors,
    warnings,
  };
}

function classifyPrivacy(input = {}) {
  const channel = normalizeChannel(input.channel || input.channel_key || input.source_channel || '');
  const metadata = input.metadata && typeof input.metadata === 'object' ? input.metadata : {};
  const text = `${input.raw_text || input.rawText || input.text || ''} ${input.transcript_text || input.transcriptText || ''} ${input.caption || ''} ${input.filename || ''}`;
  const reasons = [];
  let classification = 'role_scoped';
  if (metadata.chat_type === 'group' || metadata.is_group_chat || metadata.forwarded_from_chat_type === 'group') {
    classification = 'group_sensitive';
    reasons.push('group_chat_context');
  }
  if (/\b(password|secret|api[_-\s]?key|token|private key|credential)\b/i.test(text)) {
    classification = 'secret_risk';
    reasons.push('secret_like_content');
  } else if (/\b(student|child|parent note|medical|diagnosis|therapy|payment|charged|billing|attendance|score|accountability)\b/i.test(text)) {
    classification = 'student_or_family_sensitive';
    reasons.push('private_student_or_family_context');
  } else if (channel === 'telegram' && (metadata.forwarded_from || metadata.forwarded_from_chat_id)) {
    classification = 'forwarded_private_context';
    reasons.push('forwarded_message_context');
  }
  return {
    classification,
    reasons,
    public_safe: classification === 'role_scoped',
  };
}

function workspaceFrom(actor = {}, input = {}) {
  return {
    workspace_key: input.workspace_key || input.workspaceKey || actor.workspace_key || actor.workspaceKey || actor.workspace_id || actor.workspace || 'bna',
    project_key: input.project_key || input.projectKey || actor.project_key || actor.projectKey || actor.project_id || actor.project || 'bna',
  };
}

function objectResolution(input = {}) {
  const candidateMatches = Array.isArray(input.candidate_matches || input.candidateMatches)
    ? (input.candidate_matches || input.candidateMatches)
    : [];
  const objectType = input.object_type || input.objectType || input.related_type || input.relatedType || '';
  const objectId = input.object_id || input.objectId || input.related_id || input.relatedId || '';
  const ambiguous = candidateMatches.length > 1 && !objectId;
  const unresolved = !objectType && !objectId && !candidateMatches.length;
  return {
    status: ambiguous ? 'needs_human_review' : unresolved ? 'unresolved' : 'resolved',
    object_type: objectType || candidateMatches[0]?.object_type || candidateMatches[0]?.type || '',
    object_id: objectId ? String(objectId) : String(candidateMatches[0]?.object_id || candidateMatches[0]?.id || ''),
    candidate_count: candidateMatches.length,
    candidate_matches: candidateMatches.slice(0, 5).map((item) => ({
      object_type: item.object_type || item.type || '',
      object_id: String(item.object_id || item.id || ''),
      label: compact(item.label || item.name || item.title || '', 160),
      confidence: Number(item.confidence || 0),
    })),
    human_review_required: ambiguous,
  };
}

function inferOutcomeKind(input = {}, mediaType = 'unknown') {
  const text = `${input.intent || ''} ${input.caption || ''} ${input.raw_text || input.rawText || input.text || ''} ${input.filename || ''}`.toLowerCase();
  if (/\b(logo|brand|colors?|profile photo|headshot|hero|photo|gallery|image)\b/.test(text)) return 'provider_brand_asset';
  if (/\b(worksheet|pdf|source sheet|resource|handout)\b/.test(text)) return 'worksheet_resource';
  if (/\b(recording|lesson|class|transcript|vimeo|course)\b/.test(text) || ['audio', 'video', 'transcript'].includes(mediaType)) return 'class_course_media';
  if (/\b(parent update|voice note|announcement|message)\b/.test(text)) return 'draft_version';
  if (/\b(screenshot|broken|bug|ticket|issue|does not work|doesn't work)\b/.test(text)) return 'ticket_attachment';
  if (/\b(contact note|forwarded message|lead|parent info)\b/.test(text)) return 'contact_note';
  return 'review_queue';
}

function planLinkedOutcomes(input = {}, context = {}) {
  const kind = inferOutcomeKind(input, context.media_type);
  const common = {
    outcome_key: `outcome_${stableHash(`${context.intake_key}:${kind}`).slice(0, 16)}`,
    status: 'planned',
    idempotency_key: stableHash(`${context.dedupe_key}:${kind}`),
    external_write_performed: false,
  };
  if (kind === 'provider_brand_asset') return [{ ...common, kind, target: 'service_provider_studio_asset_review' }];
  if (kind === 'worksheet_resource') return [{ ...common, kind, target: 'worksheet_or_resource_review' }];
  if (kind === 'class_course_media') return [{ ...common, kind, target: 'class_course_ingestion_review' }];
  if (kind === 'draft_version') return [{ ...common, kind, target: 'assistant_draft_version_review' }];
  if (kind === 'ticket_attachment') return [{ ...common, kind, target: 'support_ticket_attachment_review' }];
  if (kind === 'contact_note') return [{ ...common, kind, target: 'contact_note_review' }];
  return [{ ...common, kind, target: 'manual_review' }];
}

function buildSourceEnvelope(input = {}) {
  const channel = normalizeChannel(input.channel || input.channel_key || input.source_channel || '');
  const provider = channel === 'website_assistant' ? 'website_bot' : channel || input.source_provider || input.sourceProvider || 'manual';
  const sourceRecord = createIntakeSourceRecord({
    ...input,
    source_provider: input.source_provider || input.sourceProvider || provider,
    source_channel: channel || provider,
    source_kind: input.source_kind || input.sourceKind || inferSourceKind(input),
    fingerprint: attachmentFingerprint(input),
  });
  return {
    source_envelope_id: sourceRecord.stable_key,
    source_record: sourceRecord,
    immutable: true,
    raw_preserved: true,
    adapter_metadata: {
      channel,
      channel_message_id: input.channel_message_id || input.channelMessageId || input.message_id || input.messageId || null,
      forwarded: Boolean(input.forwarded || input.forwarded_from || input.forwardedFrom || input.metadata?.forwarded_from),
      forwarded_from_redacted: input.forwarded_from || input.forwardedFrom ? 'present_redacted' : null,
    },
  };
}

function buildProcessingStatus({ validation, privacy, resolution, transcript_text = '', ocr_text = '' } = {}) {
  const blockers = [];
  if (!validation.ok) blockers.push(...validation.errors);
  if (privacy.classification === 'secret_risk') blockers.push('secret_review_required');
  if (resolution.human_review_required) blockers.push('ambiguous_object_match');
  return {
    status: blockers.length ? 'needs_review' : 'ready_for_parse',
    transcript_status: transcript_text ? 'transcribed' : 'not_started',
    ocr_status: ocr_text ? 'extracted' : 'not_started',
    virus_scan_status: validation.needs_virus_scan ? 'required' : 'not_required',
    retryable: validation.ok,
    blockers,
  };
}

function buildUnifiedFileMediaIntake(input = {}) {
  const channel = normalizeChannel(input.channel || input.channel_key || input.source_channel || '');
  if (!channel) throw new Error('unsupported_channel');
  const actor = input.actor || {};
  const workspace = workspaceFrom(actor, input);
  const target = {
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    provider_id: input.provider_id || input.providerId || input.audience_scope?.provider_id,
    child_id: input.child_id || input.childId || input.student_id || input.studentId || input.audience_scope?.child_id || input.audience_scope?.student_id,
    parent_id: input.parent_id || input.parentId || input.audience_scope?.parent_id,
  };
  const policy = assertActionPolicy({
    actor,
    channel,
    action_category: 'file_intake',
    operation: 'upload',
    target,
    dry_run: true,
  });
  const validation = validateAttachment(input);
  const privacy = classifyPrivacy({ ...input, channel });
  const resolution = objectResolution(input);
  const sourceEnvelope = buildSourceEnvelope({ ...input, channel });
  const contentFingerprint = attachmentFingerprint(input);
  const dedupeKey = stableHash([contentFingerprint, workspace.workspace_key, workspace.project_key].join('|'));
  const intakeKey = `media_intake_${dedupeKey.slice(0, 16)}`;
  const processing = buildProcessingStatus({
    validation,
    privacy,
    resolution,
    transcript_text: input.transcript_text || input.transcriptText,
    ocr_text: input.ocr_text || input.ocrText,
  });
  const linkedOutcomes = planLinkedOutcomes(input, {
    media_type: validation.media_type,
    intake_key: intakeKey,
    dedupe_key: dedupeKey,
  });
  const blockers = [
    ...processing.blockers,
    ...(privacy.public_safe ? [] : [`privacy:${privacy.classification}`]),
  ];
  return {
    requirement_id: FILE_MEDIA_INTAKE_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    intake_key: intakeKey,
    idempotency_key: dedupeKey,
    content_fingerprint: contentFingerprint,
    channel,
    actor: {
      role: policy.role,
      user_id: actor.user_id || actor.id || '',
      identity_key: actor.identity_key || '',
    },
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    source_envelope: sourceEnvelope,
    attachment: {
      file_id: input.file_id || input.fileId || input.source_id || input.sourceId || '',
      file_unique_id: input.file_unique_id || input.fileUniqueId || '',
      filename: input.filename || input.name || '',
      mime_type: input.mime_type || input.mimeType || '',
      size_bytes: validation.size_bytes,
      media_type: validation.media_type,
      storage_path: input.storage_path || input.storagePath || '',
    },
    checks: validation,
    privacy,
    workspace_resolution: {
      ...resolution,
      workspace_key: workspace.workspace_key,
      project_key: workspace.project_key,
    },
    transcript: {
      text_present: Boolean(compact(input.transcript_text || input.transcriptText)),
      ocr_present: Boolean(compact(input.ocr_text || input.ocrText)),
      metadata_present: Boolean(input.metadata && Object.keys(input.metadata).length),
      transcript_version: input.transcript_version || input.transcriptVersion || '',
    },
    processing,
    preview: {
      preview_key: `media_preview_${stableHash(intakeKey).slice(0, 16)}`,
      real_data: Boolean(input.real_data ?? true),
      sample_data: Boolean(input.sample_data ?? false),
      audience_scope: input.audience_scope || input.audienceScope || {},
      workspace_key: workspace.workspace_key,
      project_key: workspace.project_key,
      blockers,
      status: blockers.length ? 'needs_review' : 'ready',
      external_action: false,
    },
    linked_outcomes: linkedOutcomes,
    adapter_routing: {
      telegram_buttons_allowed: channel === 'telegram',
      website_cards_allowed: channel === 'website_assistant',
      secure_deep_link_allowed: true,
      channel_specific_business_logic_allowed: false,
    },
    evidence: {
      source_envelope_id: sourceEnvelope.source_envelope_id,
      no_duplicate_content_jobs: true,
      retry_resume_key: dedupeKey,
      immutable_source_preserved: true,
    },
  };
}

function isDuplicateIntake(next = {}, existing = []) {
  return (existing || []).some((item) => item.idempotency_key === next.idempotency_key || item.content_fingerprint === next.content_fingerprint);
}

module.exports = {
  CONTRACT_VERSION,
  FILE_MEDIA_INTAKE_REQUIREMENT_ID,
  MEDIA_TYPES,
  attachmentFingerprint,
  buildSourceEnvelope,
  buildUnifiedFileMediaIntake,
  classifyMediaType,
  classifyPrivacy,
  inferOutcomeKind,
  isDuplicateIntake,
  planLinkedOutcomes,
  validateAttachment,
  actionPolicy,
};
