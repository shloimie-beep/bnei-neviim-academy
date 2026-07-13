const crypto = require('crypto');

const { ONE_TIME_PROJECT_KEY, ONE_TIME_WORKSPACE_KEY } = require('./one-time-drive-intake-map');

const METADATA_SCHEMA_VERSION = 'one_time_transcript_metadata.v1';
const KNOWLEDGE_HANDOFF_SCHEMA_VERSION = 'one_time_bot_knowledge_handoff.v1';

const MASECHTA_TRANSLITERATION = new Map([
  ['berachos', 'Berakhot'],
  ['berachot', 'Berakhot'],
  ['brachos', 'Berakhot'],
  ['peah', 'Peah'],
  ['demai', 'Demai'],
  ['kilayim', 'Kilayim'],
  ['sheviis', 'Sheviit'],
  ['sheviit', 'Sheviit'],
  ['shabbos', 'Shabbat'],
  ['shabbat', 'Shabbat'],
  ['eruvin', 'Eruvin'],
  ['pesachim', 'Pesachim'],
]);

function sha256(value) {
  return crypto.createHash('sha256').update(String(value ?? '')).digest('hex');
}

function compactText(value = '', max = 240) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function transcriptTextFromSegments(segments = []) {
  return (segments || []).map((segment) => segment.text || '').filter(Boolean).join(' ').trim();
}

function normalizeNumberText(value = '') {
  const text = String(value || '').trim();
  if (/^\d+$/.test(text)) return text;
  const words = {
    aleph: '1',
    beis: '2',
    bet: '2',
    gimel: '3',
    daled: '4',
    hey: '5',
    vav: '6',
    zayin: '7',
    ches: '8',
    tet: '9',
    yud: '10',
  };
  return words[text.toLowerCase()] || text;
}

function isMishnahRefToken(value = '') {
  const normalized = normalizeNumberText(value);
  return /^\d+(?:[-:]\d+)?$/.test(normalized);
}

function canonicalMasechta(value = '') {
  const text = compactText(value, 80);
  if (!text) return '';
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function transliterateMasechta(value = '') {
  const key = compactText(value, 80).toLowerCase();
  return MASECHTA_TRANSLITERATION.get(key) || canonicalMasechta(value);
}

function extractTorahMetadataFromText(text = '') {
  const normalized = compactText(text, 5000);
  const masechtaMatch = normalized.match(/\b(?:masechta|mishnah|mishna)\s+([A-Za-z][A-Za-z' -]{2,40}?)(?=\s+\bperek\b|\s+\bmishnah\b|[.;,]|$)/i);
  const perekMatch = normalized.match(/\bperek\s+([A-Za-z0-9]+)\b/i);
  const mishnahMatches = [...normalized.matchAll(/\bmishnah(?:\s+range)?\s+([A-Za-z0-9:-]+)\b/gi)];
  const mishnahMatch = [...mishnahMatches].reverse().find((match) => isMishnahRefToken(match[1]));
  const topicMatches = [...normalized.matchAll(/\b(?:topic|sugya|theme)\s*[:\-]\s*([^.;\n]{3,80})/gi)]
    .map((match) => compactText(match[1], 80))
    .filter(Boolean);
  return {
    masechta: canonicalMasechta(masechtaMatch?.[1] || ''),
    perek: normalizeNumberText(perekMatch?.[1] || ''),
    mishnah_range: normalizeNumberText(mishnahMatch?.[1] || ''),
    topics: [...new Set(topicMatches)].slice(0, 6),
  };
}

function mergeMetadata(sidecar = {}, extracted = {}) {
  const masechta = compactText(sidecar.masechta || extracted.masechta || '', 80);
  const perek = compactText(sidecar.perek || extracted.perek || '', 40);
  const mishnahRange = compactText(sidecar.mishnah_range || sidecar.mishnahRange || extracted.mishnah_range || '', 40);
  const sidecarTopics = (Array.isArray(sidecar.topics) ? sidecar.topics : [])
    .map((topic) => compactText(topic, 80))
    .filter(Boolean);
  const extractedTopics = (Array.isArray(extracted.topics) ? extracted.topics : [])
    .map((topic) => compactText(topic, 80))
    .filter(Boolean);
  const topics = sidecarTopics.length ? sidecarTopics : extractedTopics;
  return {
    masechta,
    masechta_transliterated: transliterateMasechta(masechta),
    perek,
    mishnah_range: mishnahRange,
    topics: [...new Set(topics)].slice(0, 8),
  };
}

function confidenceForMetadata(metadata = {}, sidecar = {}) {
  let score = 0.35;
  if (metadata.masechta) score += sidecar.masechta ? 0.25 : 0.15;
  if (metadata.perek) score += sidecar.perek ? 0.15 : 0.08;
  if (metadata.mishnah_range) score += (sidecar.mishnah_range || sidecar.mishnahRange) ? 0.15 : 0.08;
  if (metadata.topics?.length) score += 0.08;
  return Math.min(0.98, Number(score.toFixed(2)));
}

function buildBulletDescription({ summary = '', topics = [], transcriptText = '' } = {}) {
  const bullets = [];
  if (summary) bullets.push(compactText(summary, 180));
  for (const topic of topics || []) {
    if (bullets.length >= 3) break;
    bullets.push(`Topic: ${compactText(topic, 100)}`);
  }
  if (!bullets.length && transcriptText) bullets.push(compactText(transcriptText, 180));
  return bullets.slice(0, 3);
}

function buildOneTimeMetadataDraft({
  transcriptVersion = {},
  transcriptText = '',
  segments = [],
  sidecar = {},
  createdAt = new Date().toISOString(),
} = {}) {
  const text = transcriptText || transcriptTextFromSegments(segments);
  const extracted = extractTorahMetadataFromText(text);
  const torah = mergeMetadata(sidecar, extracted);
  const confidence = confidenceForMetadata(torah, sidecar);
  const needsReview = confidence < 0.82 || !torah.masechta || !torah.perek || !torah.mishnah_range;
  const titleParts = [
    torah.masechta ? `Mishnah ${torah.masechta}` : 'One Time Mishnah',
    torah.perek ? `Perek ${torah.perek}` : '',
    torah.mishnah_range ? `Mishnah ${torah.mishnah_range}` : '',
  ].filter(Boolean);
  const summary = compactText(sidecar.summary || sidecar.description || '', 500);
  return {
    schema_version: METADATA_SCHEMA_VERSION,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    transcript_version: transcriptVersion.version || null,
    transcript_sha256: transcriptVersion.transcript_sha256 || (text ? sha256(text) : ''),
    title: compactText(sidecar.title || titleParts.join(' - '), 160),
    description_bullets: buildBulletDescription({ summary, topics: torah.topics, transcriptText: text }),
    torah_metadata: torah,
    confidence,
    review_state: needsReview ? 'needs_review' : 'machine_complete',
    approved_for_member_publish: false,
    approved_for_bot_knowledge: false,
    raw_transcript_included: false,
    created_at: createdAt,
  };
}

function buildBotKnowledgeHandoff({
  metadataDraft = {},
  transcriptVersion = {},
  approved = false,
  createdAt = new Date().toISOString(),
} = {}) {
  const approvedTranscript = ['approved'].includes(String(transcriptVersion.status || ''));
  const approvedMetadata = approved === true
    && metadataDraft.approved_for_bot_knowledge === true
    && ['approved', 'machine_complete'].includes(String(metadataDraft.review_state || ''));
  const allowed = approvedTranscript && approvedMetadata;
  const blockers = [];
  if (!approvedTranscript) blockers.push('transcript_version_not_approved');
  if (!metadataDraft.approved_for_bot_knowledge) blockers.push('metadata_not_approved_for_bot_knowledge');
  if (!approved) blockers.push('handoff_approval_flag_missing');
  return {
    schema_version: KNOWLEDGE_HANDOFF_SCHEMA_VERSION,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    status: allowed ? 'ready_for_scoped_promotion' : 'blocked',
    blockers,
    no_raw_transcript_body: true,
    transcript_sha256: transcriptVersion.transcript_sha256 || metadataDraft.transcript_sha256 || '',
    metadata_schema_version: metadataDraft.schema_version || METADATA_SCHEMA_VERSION,
    knowledge_item: allowed ? {
      source_type: 'one_time_class_transcript_metadata',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      title: metadataDraft.title || 'One Time Mishnah class',
      summary_bullets: metadataDraft.description_bullets || [],
      torah_metadata: metadataDraft.torah_metadata || {},
      visibility: 'provider_scoped_private',
      raw_transcript_body_included: false,
      confidence: metadataDraft.confidence || 0,
    } : null,
    created_at: createdAt,
  };
}

module.exports = {
  KNOWLEDGE_HANDOFF_SCHEMA_VERSION,
  METADATA_SCHEMA_VERSION,
  buildBotKnowledgeHandoff,
  buildOneTimeMetadataDraft,
  canonicalMasechta,
  extractTorahMetadataFromText,
  transliterateMasechta,
};
