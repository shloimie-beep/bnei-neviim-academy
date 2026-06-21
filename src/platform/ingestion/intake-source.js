const crypto = require('node:crypto');

const INTAKE_SOURCE_CONTRACT_VERSION = 'w3-intake-source-v1';
const SOURCE_ENVELOPE_VERSION = 'source-envelope-v2';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const OPERATIONS_WORKSPACE_KEY = 'internal_super_admin';
const OPERATIONS_PROJECT_KEY = 'bna_operations';
const DRATLER_FAMILY_PROJECT_KEY = 'dratler_family';

const SOURCE_PROVIDERS = new Set([
  'telegram',
  'website_bot',
  'codex_chat',
  'operations_ui',
  'drive',
  'google_docs',
  'email',
  'whatsapp',
  'wapi',
  'local_file',
  'manual',
  'other',
]);

const SOURCE_KINDS = new Set([
  'markdown',
  'text',
  'google_doc',
  'audio',
  'video',
  'transcript',
  'telegram_text',
  'unknown',
]);

const SOURCE_CONTEXT_TYPES = new Set([
  'class_recording',
  'family_meeting',
  'provider_meeting',
  'operations_ramble',
  'crm_spreadsheet',
  'content_recording',
  'mixed',
  'unknown_needs_review',
]);

const CONTEXT_ROUTES = {
  class_recording: {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    privacy_level: 'private',
    confidence: 0.92,
  },
  family_meeting: {
    workspace_key: DRATLER_FAMILY_PROJECT_KEY,
    project_key: DRATLER_FAMILY_PROJECT_KEY,
    privacy_level: 'private',
    confidence: 0.9,
  },
  provider_meeting: {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    privacy_level: 'private',
    confidence: 0.88,
  },
  operations_ramble: {
    workspace_key: OPERATIONS_WORKSPACE_KEY,
    project_key: OPERATIONS_PROJECT_KEY,
    privacy_level: 'internal',
    confidence: 0.88,
  },
  crm_spreadsheet: {
    workspace_key: OPERATIONS_WORKSPACE_KEY,
    project_key: OPERATIONS_PROJECT_KEY,
    privacy_level: 'private',
    confidence: 0.87,
  },
  content_recording: {
    workspace_key: 'bna',
    project_key: 'content',
    privacy_level: 'internal',
    confidence: 0.82,
  },
  mixed: {
    workspace_key: 'bna',
    project_key: 'bna',
    privacy_level: 'needs_review',
    confidence: 0.62,
  },
  unknown_needs_review: {
    workspace_key: 'bna',
    project_key: null,
    privacy_level: 'needs_review',
    confidence: 0.45,
  },
};

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stableHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function normalizeKey(value = '', fallback = 'other') {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

function normalizeSourceProvider(value = '') {
  const key = normalizeKey(value, 'manual');
  if (SOURCE_PROVIDERS.has(key)) return key;
  if (key.includes('telegram')) return 'telegram';
  if (key.includes('drive')) return 'drive';
  if (key.includes('doc')) return 'google_docs';
  if (key.includes('whatsapp') || key.includes('whapi')) return 'whatsapp';
  if (key.includes('wapi')) return 'wapi';
  if (key.includes('email') || key.includes('gmail')) return 'email';
  if (key.includes('codex')) return 'codex_chat';
  if (key.includes('operation')) return 'operations_ui';
  if (key.includes('website')) return 'website_bot';
  if (key.includes('file')) return 'local_file';
  return key ? 'other' : 'manual';
}

function inferSourceKind({ mime_type: mimeType, filename, source_kind: sourceKind, source_type: sourceType } = {}) {
  const explicit = normalizeKey(sourceKind || sourceType || '', '');
  if (SOURCE_KINDS.has(explicit)) return explicit;
  const value = `${mimeType || ''} ${filename || ''}`.toLowerCase();
  if (/\bgoogle.*document|application\/vnd\.google-apps\.document/.test(value)) return 'google_doc';
  if (/\b(audio|m4a|mp3|wav|ogg)\b/.test(value)) return 'audio';
  if (/\b(video|mp4|mov|webm|mkv)\b/.test(value)) return 'video';
  if (/\b(transcript|vtt|srt)\b/.test(value)) return 'transcript';
  if (/\b(markdown|md)\b/.test(value)) return 'markdown';
  if (/\b(text|txt)\b/.test(value)) return 'text';
  if (normalizeSourceProvider(sourceType) === 'telegram') return 'telegram_text';
  return 'unknown';
}

function normalizeWorkspace(value = '') {
  const key = normalizeKey(value, '');
  if (!key) return null;
  if (/(one_time|onetime|mishnah|mishna|scheller|sheller)/.test(key)) return 'one_time_mishnah_class';
  if (/(bna|bnei_neviim|academy)/.test(key)) return 'bna';
  return key;
}

function normalizeEnvelopeWorkspace(value = '', fallback = null) {
  const key = normalizeKey(value, '');
  if (!key) return fallback;
  if (/(one_time|onetime|mishnah|mishna|scheller|sheller|rabbi_elie)/.test(key)) return ONE_TIME_WORKSPACE_KEY;
  if (/(dratler|family_app|family|household)/.test(key)) return DRATLER_FAMILY_PROJECT_KEY;
  if (/(internal|super_admin|operations|ops|admin)/.test(key)) return OPERATIONS_WORKSPACE_KEY;
  if (/(bna|bnei_neviim|academy|school)/.test(key)) return 'bna';
  return key || fallback;
}

function normalizeEnvelopeProject(value = '', fallback = null) {
  const key = normalizeKey(value, '');
  if (!key) return fallback;
  if (/(one_time|onetime|mishnah|mishna|scheller|sheller|rabbi_elie)/.test(key)) return ONE_TIME_PROJECT_KEY;
  if (/(dratler|family_app|family|household)/.test(key)) return DRATLER_FAMILY_PROJECT_KEY;
  if (/(internal|super_admin|operations|ops|admin)/.test(key)) return OPERATIONS_PROJECT_KEY;
  if (/(content|marketing|social|post|recording)/.test(key)) return 'content';
  if (/(bna|bnei_neviim|academy|school)/.test(key)) return 'bna';
  return key || fallback;
}

function detectSourceLanguage(text = '') {
  const raw = String(text || '');
  const hebrewChars = (raw.match(/[\u0590-\u05ff]/g) || []).length;
  const englishChars = (raw.match(/[a-z]/gi) || []).length;
  return {
    primary: hebrewChars > englishChars ? 'he' : 'en',
    has_hebrew: hebrewChars > 0,
    has_english: englishChars > 0,
    mixed: hebrewChars > 0 && englishChars > 0,
  };
}

function sourceDateFromInput(input = {}, uploadTime = '') {
  const explicit = String(input.source_date || input.sourceDate || input.recorded_at || input.recordedAt || '').match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (explicit) return explicit[1];
  const fromUpload = String(uploadTime || '').match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return fromUpload ? fromUpload[1] : null;
}

function sourceTitleFromInput(input = {}) {
  return compactWhitespace(
    input.title
      || input.source_title
      || input.sourceTitle
      || input.filename
      || input.name
      || input.file_name
      || input.fileName
      || ''
  );
}

function sourceTextForClassification(input = {}) {
  return compactWhitespace([
    input.raw_text || input.rawText || input.text || '',
    input.transcript_text || input.transcriptText || '',
  ].filter(Boolean).join('\n'));
}

function hasOneTimeCue(text = '') {
  return /\b(one[-\s]?time|onetime|rabbi\s+elie|rabbi\s+(?:scheller|sheller)|scheller|sheller|mishnah|mishna|mishnayos|mishnayot|worldwide\s+mishnayos)\b/i
    .test(String(text || ''));
}

function explicitContextType(value = '') {
  const key = normalizeKey(value, '');
  return SOURCE_CONTEXT_TYPES.has(key) ? key : null;
}

function inferContextType(input = {}) {
  const title = sourceTitleFromInput(input);
  const text = sourceTextForClassification(input);
  const sourceKind = inferSourceKind(input);
  const titleLower = title.toLowerCase();
  const combined = `${title} ${text}`.toLowerCase();
  const titleHasOneTime = hasOneTimeCue(title);
  const combinedHasOneTime = hasOneTimeCue(combined);

  if (explicitContextType(input.default_context_type || input.defaultContextType || input.context_type || input.contextType)) {
    return {
      context_type: explicitContextType(input.default_context_type || input.defaultContextType || input.context_type || input.contextType),
      confidence: 0.96,
      basis: 'explicit_context_type',
    };
  }
  if (/\b(dratler|family app|family meeting|household meeting)\b/i.test(title)
    && /\b(family|meeting|household|accountability|dratler)\b/i.test(title)) {
    return { context_type: 'family_meeting', confidence: 0.94, basis: 'title_dratler_family' };
  }
  if ((titleHasOneTime || /\brabbi\s+(?:elie|scheller|sheller)\b/i.test(title))
    && /\b(class|shiur|lesson|mishnah|mishna|mishnayos|mishnayot|recording|transcript)\b/i.test(title)) {
    return { context_type: 'class_recording', confidence: 0.94, basis: 'title_one_time_class' };
  }
  if (titleHasOneTime && /\b(meeting|strategy|planning|provider|rabbi)\b/i.test(title)) {
    return { context_type: 'provider_meeting', confidence: 0.9, basis: 'title_one_time_meeting' };
  }
  if (/\b(operations|ops|codex|agent|run|backlog|prompt packet|ramble)\b/i.test(title)) {
    return { context_type: 'operations_ramble', confidence: 0.9, basis: 'title_operations' };
  }
  if (/\b(crm|contacts?|lead|spreadsheet|xlsx|csv|phonebook|subscriber export|import)\b/i.test(title)) {
    return { context_type: 'crm_spreadsheet', confidence: 0.88, basis: 'title_crm_spreadsheet' };
  }
  if (/\b(content|marketing|social|post|clip|recording|youtube|vimeo)\b/i.test(title)
    && !titleHasOneTime) {
    return { context_type: 'content_recording', confidence: 0.82, basis: 'title_content' };
  }
  if ((sourceKind === 'audio' || sourceKind === 'video' || sourceKind === 'transcript') && combinedHasOneTime) {
    return { context_type: 'class_recording', confidence: 0.86, basis: 'media_one_time_class_cue' };
  }
  if ((sourceKind === 'audio' || sourceKind === 'video' || sourceKind === 'transcript') && /\b(class|shiur|lesson|recording|transcript)\b/i.test(combined)) {
    return { context_type: 'class_recording', confidence: 0.74, basis: 'media_class_cue' };
  }
  const localContexts = new Set(findLocalContextOverrides(text, { default_context_type: 'unknown_needs_review' }).map((item) => item.context_type));
  if (localContexts.size > 1) {
    return { context_type: 'mixed', confidence: 0.72, basis: 'mixed_local_contexts' };
  }
  if (combinedHasOneTime && /\b(class|shiur|lesson|mishnah|mishna|mishnayos|mishnayot)\b/i.test(combined)) {
    return { context_type: 'class_recording', confidence: 0.82, basis: 'one_time_class_text_cue' };
  }
  if (combinedHasOneTime) return { context_type: 'provider_meeting', confidence: 0.72, basis: 'one_time_text_cue' };
  if (/\b(dratler|family|household)\b/i.test(combined)) return { context_type: 'family_meeting', confidence: 0.7, basis: 'family_text_cue' };
  if (/\b(crm|contacts?|spreadsheet|xlsx|csv|import|dedupe|deduplicate)\b/i.test(combined)) {
    return { context_type: 'crm_spreadsheet', confidence: 0.72, basis: 'crm_text_cue' };
  }
  if (/\b(operations|ops|codex|agent|backlog|prompt packet|ramble|deploy|railway|server)\b/i.test(combined)) {
    return { context_type: 'operations_ramble', confidence: 0.7, basis: 'operations_text_cue' };
  }
  return { context_type: 'unknown_needs_review', confidence: 0.45, basis: 'unknown' };
}

function contextRoute(contextType = 'unknown_needs_review', input = {}) {
  const route = CONTEXT_ROUTES[contextType] || CONTEXT_ROUTES.unknown_needs_review;
  return {
    ...route,
    workspace_key: normalizeEnvelopeWorkspace(input.default_workspace || input.defaultWorkspace || input.workspace_key || input.workspaceKey || input.workspace, route.workspace_key),
    project_key: normalizeEnvelopeProject(input.default_project || input.defaultProject || input.project_key || input.projectKey || input.project, route.project_key),
  };
}

function contextForSegment(text = '') {
  const raw = compactWhitespace(text);
  const lower = raw.toLowerCase();
  if (/^(operations|ops|codex|agent)(?:\s+(?:task|note|fragment|item|ramble))?\s*:/i.test(raw)
    || /\boperations\s+(?:task|note|fragment|item|ramble)\s*:/i.test(raw)
    || /\bcodex\s+(?:task|note|fragment|item)\s*:/i.test(raw)) {
    return { context_type: 'operations_ramble', confidence: 0.94, basis: 'local_operations_prefix' };
  }
  if (/^(crm|contact|contacts|spreadsheet|phonebook|lead import)(?:\s+(?:task|note|fragment|item|import))?\s*:/i.test(raw)
    || /\bcrm\s+(?:task|note|import|spreadsheet)\s*:/i.test(raw)) {
    return { context_type: 'crm_spreadsheet', confidence: 0.92, basis: 'local_crm_prefix' };
  }
  if (/^(one[-\s]?time|rabbi\s+(?:elie|scheller|sheller)|mishnayos?|mishnayot)(?:\s+(?:task|note|fragment|item|meeting|class))?\s*:/i.test(raw)
    || (hasOneTimeCue(raw) && /\b(class|shiur|lesson|mishnah|mishna|mishnayos|mishnayot)\b/i.test(raw))) {
    return {
      context_type: /\b(class|shiur|lesson|mishnah|mishna|mishnayos|mishnayot)\b/i.test(raw) ? 'class_recording' : 'provider_meeting',
      confidence: 0.9,
      basis: 'local_one_time_cue',
    };
  }
  if (/^(dratler|family|household)(?:\s+(?:task|note|fragment|item|meeting))?\s*:/i.test(raw)
    || /\bdratler\s+family\b/i.test(raw)) {
    return { context_type: 'family_meeting', confidence: 0.9, basis: 'local_family_cue' };
  }
  if (/^(content|marketing|social|post|clip|recording)(?:\s+(?:task|note|fragment|item|idea))?\s*:/i.test(raw)
    || /\b(content idea|social post|marketing clip)\b/i.test(raw)) {
    return { context_type: 'content_recording', confidence: 0.84, basis: 'local_content_cue' };
  }
  if (/^(bna|academy|school)(?:\s+(?:task|note|fragment|item))?\s*:/i.test(raw)
    || /\bbna\s+(?:task|note|fragment|item)\s*:/i.test(raw)) {
    return { context_type: 'operations_ramble', confidence: 0.82, basis: 'local_bna_operations_cue' };
  }
  if (lower.includes('unknown needs review')) {
    return { context_type: 'unknown_needs_review', confidence: 0.5, basis: 'local_unknown_review_cue' };
  }
  return null;
}

function classifySourceSegmentContext(text = '', sourceEnvelope = {}) {
  const segmentContext = contextForSegment(text);
  const defaultContextType = explicitContextType(sourceEnvelope.default_context_type) || 'unknown_needs_review';
  const selectedType = segmentContext?.context_type || defaultContextType;
  const route = CONTEXT_ROUTES[selectedType] || CONTEXT_ROUTES.unknown_needs_review;
  const defaultRoute = CONTEXT_ROUTES[defaultContextType] || CONTEXT_ROUTES.unknown_needs_review;
  const workspaceKey = segmentContext
    ? route.workspace_key
    : (sourceEnvelope.default_workspace || defaultRoute.workspace_key);
  const projectKey = segmentContext
    ? route.project_key
    : (sourceEnvelope.default_project ?? defaultRoute.project_key);
  const overrideApplied = Boolean(segmentContext && (
    selectedType !== defaultContextType
    || workspaceKey !== sourceEnvelope.default_workspace
    || projectKey !== sourceEnvelope.default_project
  ));
  return {
    context_type: selectedType,
    workspace_key: workspaceKey,
    project_key: projectKey,
    privacy_level: segmentContext ? route.privacy_level : (sourceEnvelope.privacy_level || defaultRoute.privacy_level),
    confidence: segmentContext?.confidence || sourceEnvelope.source_level_confidence || sourceEnvelope.source_confidence || route.confidence,
    override_applied: overrideApplied,
    override_reason: overrideApplied ? segmentContext.basis : null,
    default_context_type: defaultContextType,
    default_workspace: sourceEnvelope.default_workspace || defaultRoute.workspace_key,
    default_project: sourceEnvelope.default_project ?? defaultRoute.project_key,
  };
}

function findLocalContextOverrides(text = '', sourceEnvelope = {}) {
  const raw = String(text || '');
  if (!compactWhitespace(raw)) return [];
  const markerPattern = /\b(operations|ops|codex|agent|crm|contact|contacts|spreadsheet|phonebook|lead import|one[-\s]?time|rabbi\s+(?:elie|scheller|sheller)|mishnayos?|mishnayot|dratler|family|household|content|marketing|social|post|clip|recording|bna|academy|school)(?:\s+(?:task|note|fragment|item|ramble|meeting|class|idea|import))?\s*:/ig;
  const matches = [...raw.matchAll(markerPattern)];
  const overrides = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index || 0;
    const end = matches[index + 1]?.index ?? Math.min(raw.length, start + 420);
    const segment = compactWhitespace(raw.slice(start, end));
    const context = classifySourceSegmentContext(segment, sourceEnvelope);
    if (!context.override_applied && context.context_type === (sourceEnvelope.default_context_type || 'unknown_needs_review')) continue;
    overrides.push({
      start,
      end,
      segment_preview: segment.slice(0, 240),
      context_type: context.context_type,
      workspace_key: context.workspace_key,
      project_key: context.project_key,
      privacy_level: context.privacy_level,
      confidence: context.confidence,
      override_reason: context.override_reason || context.context_type,
    });
  }
  return overrides;
}

function classifySourceEnvelope(input = {}) {
  const sourceProvider = normalizeSourceProvider(
    input.source_provider || input.sourceProvider || input.provider || input.source_channel || input.sourceChannel || input.source_type || input.sourceType
  );
  const sourceKind = inferSourceKind({
    mime_type: input.mime_type || input.mimeType,
    filename: input.filename || input.name,
    source_kind: input.source_kind || input.sourceKind,
    source_type: input.source_type || input.sourceType || sourceProvider,
  });
  const title = sourceTitleFromInput(input);
  const filename = input.filename || input.name || input.file_name || input.fileName || null;
  const text = sourceTextForClassification(input);
  const uploadTime = input.upload_time || input.uploadTime || input.received_at || input.receivedAt || input.created_at || input.createdAt || new Date().toISOString();
  const classification = inferContextType({ ...input, source_kind: sourceKind });
  const route = contextRoute(classification.context_type, input);
  const sourceHash = input.source_hash || input.sourceHash || input.fingerprint || input.checksum || buildSourceFingerprint({ ...input, source_provider: sourceProvider });
  const sourceId = input.source_id || input.sourceId || input.file_id || input.fileId || null;
  const envelope = {
    envelope_version: SOURCE_ENVELOPE_VERSION,
    source_id: sourceId || `source_${sourceHash.slice(0, 16)}`,
    source_hash: sourceHash,
    filename,
    title: title || filename || null,
    source_channel: sourceProvider,
    upload_time: uploadTime,
    source_date: sourceDateFromInput(input, uploadTime),
    uploader: input.uploader || input.uploaded_by || input.uploadedBy || input.actor || input.from || input.sender || null,
    language: detectSourceLanguage(text || title),
    default_workspace: route.workspace_key,
    default_project: route.project_key,
    default_context_type: classification.context_type,
    source_level_confidence: Number((classification.confidence || route.confidence || 0.5).toFixed(2)),
    source_confidence: Number((classification.confidence || route.confidence || 0.5).toFixed(2)),
    privacy_level: input.privacy_level || input.privacyLevel || route.privacy_level,
    parser_version: input.parser_version || input.parserVersion || SOURCE_ENVELOPE_VERSION,
    processing_status: input.processing_status || input.processingStatus || input.parse_status || input.parseStatus || 'new',
    classification_basis: classification.basis,
    source_kind: sourceKind,
    local_context_overrides: [],
  };
  envelope.local_context_overrides = findLocalContextOverrides(text, envelope);
  return envelope;
}

function buildSourceFingerprint(input = {}) {
  const parts = [
    input.source_provider || input.sourceProvider || input.provider || '',
    input.source_id || input.sourceId || input.file_id || input.fileId || '',
    input.source_link || input.sourceLink || input.web_view_link || input.webViewLink || '',
    input.filename || input.name || '',
    input.mime_type || input.mimeType || '',
    input.raw_text || input.rawText || input.text || '',
    input.transcript_text || input.transcriptText || '',
    input.transcript_version || input.transcriptVersion || '',
  ];
  return stableHash(parts.join('\n--bna-intake-source--\n'));
}

function createIntakeSourceRecord(input = {}) {
  const sourceProvider = normalizeSourceProvider(
    input.source_provider || input.sourceProvider || input.provider || input.source_channel || input.sourceChannel || input.source_type || input.sourceType
  );
  const sourceKind = inferSourceKind({
    mime_type: input.mime_type || input.mimeType,
    filename: input.filename || input.name,
    source_kind: input.source_kind || input.sourceKind,
    source_type: input.source_type || input.sourceType || sourceProvider,
  });
  const rawText = String(input.raw_text || input.rawText || input.text || '');
  const transcriptText = String(input.transcript_text || input.transcriptText || '');
  const fingerprint = input.fingerprint || input.checksum || buildSourceFingerprint({ ...input, source_provider: sourceProvider });
  const sourceId = input.source_id || input.sourceId || input.file_id || input.fileId || null;
  const sourceLink = input.source_link || input.sourceLink || input.web_view_link || input.webViewLink || null;
  const idempotencySource = [
    sourceProvider,
    sourceId || sourceLink || input.filename || input.name || fingerprint,
    fingerprint,
  ].join('|');
  const now = input.created_at || input.createdAt || new Date().toISOString();
  const record = {
    contract_version: INTAKE_SOURCE_CONTRACT_VERSION,
    stable_key: `intake_source_${stableHash(idempotencySource).slice(0, 16)}`,
    idempotency_key: stableHash(idempotencySource),
    source_provider: sourceProvider,
    source_channel: sourceProvider,
    source_kind: sourceKind,
    source_id: sourceId,
    source_link: sourceLink,
    filename: input.filename || input.name || null,
    mime_type: input.mime_type || input.mimeType || null,
    fingerprint,
    checksum: input.checksum || fingerprint,
    raw_text: rawText,
    transcript_text: transcriptText,
    transcript_version: input.transcript_version || input.transcriptVersion || null,
    timestamps: {
      created_at: now,
      received_at: input.received_at || input.receivedAt || now,
      source_created_at: input.source_created_at || input.sourceCreatedAt || null,
      source_modified_at: input.source_modified_at || input.sourceModifiedAt || null,
    },
    actor: input.actor || input.from || input.sender || null,
    workspace_candidate: normalizeWorkspace(input.workspace_candidate || input.workspaceCandidate || input.workspace || input.project || ''),
    workspace_resolution: input.workspace_resolution || input.workspaceResolution || null,
    parser_version: input.parser_version || input.parserVersion || null,
    processing_attempts: Number(input.processing_attempts || input.processingAttempts || 0),
    final_routing: input.final_routing || input.finalRouting || null,
    parse_status: input.parse_status || input.parseStatus || 'new',
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
  };
  record.source_envelope = classifySourceEnvelope({
    ...input,
    source_provider: sourceProvider,
    source_kind: sourceKind,
    source_id: sourceId,
    filename: record.filename,
    fingerprint,
    raw_text: rawText,
    transcript_text: transcriptText,
    created_at: now,
    received_at: record.timestamps.received_at,
    parser_version: record.parser_version,
    parse_status: record.parse_status,
  });
  record.has_raw_text = Boolean(compactWhitespace(record.raw_text));
  record.has_transcript = Boolean(compactWhitespace(record.transcript_text));
  return record;
}

function validateIntakeSourceRecord(record = {}) {
  const errors = [];
  if (record.contract_version !== INTAKE_SOURCE_CONTRACT_VERSION) errors.push('contract_version is not current');
  if (!record.stable_key) errors.push('stable_key is required');
  if (!record.idempotency_key) errors.push('idempotency_key is required');
  if (!SOURCE_PROVIDERS.has(record.source_provider)) errors.push(`unsupported source_provider: ${record.source_provider}`);
  if (!SOURCE_KINDS.has(record.source_kind)) errors.push(`unsupported source_kind: ${record.source_kind}`);
  if (!record.fingerprint) errors.push('fingerprint is required');
  if (!record.timestamps?.created_at) errors.push('timestamps.created_at is required');
  if (!record.raw_text && !record.transcript_text && !record.source_link && !record.source_id) {
    errors.push('one of raw_text, transcript_text, source_link, or source_id is required');
  }
  return { ok: errors.length === 0, errors };
}

module.exports = {
  INTAKE_SOURCE_CONTRACT_VERSION,
  SOURCE_ENVELOPE_VERSION,
  SOURCE_PROVIDERS,
  SOURCE_KINDS,
  SOURCE_CONTEXT_TYPES,
  stableHash,
  normalizeSourceProvider,
  inferSourceKind,
  normalizeWorkspace,
  classifySourceEnvelope,
  classifySourceSegmentContext,
  buildSourceFingerprint,
  createIntakeSourceRecord,
  validateIntakeSourceRecord,
};
