const crypto = require('node:crypto');

const INTAKE_SOURCE_CONTRACT_VERSION = 'w3-intake-source-v1';

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
  if (/(one_time|onetime|mishnah|mishna|scheller|sheller)/.test(key)) return 'rabbi_sheller_provider';
  if (/(bna|bnei_neviim|academy)/.test(key)) return 'bna';
  return key;
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
  SOURCE_PROVIDERS,
  SOURCE_KINDS,
  stableHash,
  normalizeSourceProvider,
  inferSourceKind,
  normalizeWorkspace,
  buildSourceFingerprint,
  createIntakeSourceRecord,
  validateIntakeSourceRecord,
};
