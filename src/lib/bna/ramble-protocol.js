const crypto = require('crypto');

const {
  INTAKE_SOURCE_CHANNELS,
  RAW_PARSE_STATUSES,
  STABLE_ID_PREFIX_BY_ITEM_TYPE,
} = require('./intake-schema');

const RAMBLE_PROTOCOL_VERSION = 'bna-ramble-protocol-v3';
const RAMBLE_INTAKE_TEMPLATE_PATH = 'tasks-pending/_template-ramble-intake.md';
const GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH = 'tasks-pending/_template-goal-mode-correction-output.md';
const DEFAULT_REQUIREMENT_REGISTER_BASENAME = 'website-ramble-correction-audit';

const RAW_SOURCE_CHANNELS = INTAKE_SOURCE_CHANNELS;

const RAMBLE_CANONICAL_ARRAY_KEYS = [
  'requirements',
  'open_questions',
  'memory_candidates',
  'goal_candidates',
  'student_notes',
  'student_questions',
  'student_observations',
  'content_items',
  'research_items',
  'accounting_items',
  'contact_items',
  'contacts',
  'communications',
  'integration_items',
  'service_provider_items',
  'workspace_routing',
  'alerts',
  'errors',
];

const STABLE_ID_PREFIX_BY_TYPE = {
  ...STABLE_ID_PREFIX_BY_ITEM_TYPE,
  ticket: 'TASK',
  goal: 'GOAL',
  diet_nutrition_note: 'NOTE',
  attendance: 'NOTE',
  assignment: 'NOTE',
  behavior_note: 'NOTE',
  provider_lead: 'CONTACT',
  class_session_note: 'CLASS',
  custom_section: 'REQ',
};

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stableHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function dateStamp(value = null) {
  const explicit = String(value || '').match(/\b(20\d{2})-?(\d{2})-?(\d{2})\b/);
  if (explicit) return `${explicit[1]}${explicit[2]}${explicit[3]}`;
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function isoDate(value = null) {
  const stamp = dateStamp(value);
  return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}`;
}

function formatStableId(prefixOrType, dateValue, index = 1) {
  const prefix = STABLE_ID_PREFIX_BY_TYPE[prefixOrType] || String(prefixOrType || 'ITEM').toUpperCase();
  const number = Math.max(1, Number(index || 1));
  return `${prefix}-${dateStamp(dateValue)}-${String(number).padStart(3, '0')}`;
}

function normalizeSourceChannel(value = '') {
  const key = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (RAW_SOURCE_CHANNELS.includes(key)) return key;
  if (key.includes('telegram')) return 'telegram';
  if (key.includes('class_recording') || key.includes('recording') || key.includes('class_transcript')) return 'class_recording';
  if (key.includes('operations_helper') || key.includes('ops_helper')) return 'operations_helper';
  if (key.includes('website_helper') || key.includes('public_helper')) return 'website_helper';
  if (key.includes('website') || key.includes('bot_widget')) return 'website_bot';
  if (key.includes('codex')) return 'codex_chat';
  if (key.includes('operation') || key === 'web' || key === 'dashboard') return 'operations_ui';
  if (key.includes('drive')) return 'drive';
  if (key.includes('whatsapp') || key.includes('whapi')) return 'whatsapp';
  if (key.includes('wapi')) return 'wapi';
  if (key.includes('email') || key.includes('gmail')) return 'email';
  if (key.includes('manual') || !key) return 'manual';
  return 'other';
}

function requirementRegisterPath(dateValue, basename = DEFAULT_REQUIREMENT_REGISTER_BASENAME) {
  return `tasks-pending/${isoDate(dateValue)}-${basename}.md`;
}

function sourceQuote(value = '', max = 320) {
  const text = compactWhitespace(value);
  if (text.length <= max) return text;
  const preview = text.slice(0, max + 1);
  const wordBreak = preview.lastIndexOf(' ');
  return `${preview.slice(0, wordBreak > max * 0.6 ? wordBreak : max).trim()}...`;
}

function titleFromText(value = '', fallback = 'Review intake item') {
  const text = compactWhitespace(value)
    .replace(/^(task|todo|decision|requirement|question|memory|note|content|contact|payment|accounting)\s*[:=-]\s*/i, '')
    .replace(/\b(i need you to|please|can you|could you|make sure to|we need to)\b/gi, '')
    .trim();
  const sentence = text.split(/(?<=[.!?])\s+|;|\n/)[0] || text;
  return sourceQuote(sentence || fallback, 90) || fallback;
}

function broadCorrectionRegisterNeeded(text = '') {
  return /\b(website|homepage|page|site|correction|correct|fix everything|large ramble|big ramble|broad correction|missed items|audit)\b/i
    .test(String(text || ''));
}

function goalModeExecutionRequested(text = '') {
  const value = String(text || '');
  return /\b(goal\s*mode|goal\s*setting\s*mode|goalmode|set (it|this|that) as a goal|make (it|this|that) a goal)\b/i.test(value)
    || /\b(build everything|finish everything|finish up all|do all (of )?(those|these|the) things|work through (the )?(whole|entire|full) (prompt|output|list|register|correction|packet)|keep (going|working) (until|till) (it'?s|it is|everything is|all|they are|they'?re) done)\b/i.test(value);
}

function gptCorrectionPacketDetected(text = '') {
  return /\b(chat\s*gpt|chatgpt|gpt|codex prompt|prompt packet|generated prompt|super prompt|correction output|whole prompt|entire output|BNA_GOAL_MODE_EXECUTION_PACKET)\b/i
    .test(String(text || ''));
}

function buildProtocolItem({
  type,
  date,
  index = 1,
  text = '',
  title,
  expected_result,
  done_definition,
  target_lane,
  verification_method,
  confidence = 0.8,
  needs_review,
  source_quote,
  metadata = {},
} = {}) {
  const itemType = String(type || 'requirement').trim();
  const quote = sourceQuote(source_quote || text);
  const protocolTitle = title || titleFromText(text, `Review ${itemType.replace(/_/g, ' ')}`);
  const stable_id = formatStableId(itemType, date, index);
  return {
    stable_id,
    item_key: `${itemType}:${stable_id}`,
    item_type: itemType,
    title: protocolTitle,
    short_title: protocolTitle,
    source_quote: quote,
    source_excerpt: quote,
    expected_result: expected_result || done_definition || `Review and satisfy: ${protocolTitle}`,
    done_definition: done_definition || expected_result || `The item is inspected, implemented or explicitly blocked, and verified with evidence.`,
    target_lane: target_lane || 'Tasks',
    verification_method: verification_method || 'Inspect affected files/workflow, run relevant local checks, and record evidence in the final audit table.',
    confidence: Number(confidence || 0.8),
    needs_review: needs_review === undefined ? Number(confidence || 0.8) < 0.85 : Boolean(needs_review),
    metadata,
  };
}

function extractedItemCounts(parsed = {}) {
  return {
    requirements: (parsed.requirements || []).length,
    tasks: (parsed.tasks || []).length,
    decisions: (parsed.decisions || []).length,
    open_questions: (parsed.open_questions || []).length,
    memory_candidates: (parsed.memory_candidates || []).length,
    goal_candidates: (parsed.goal_candidates || []).length,
    student_notes: (parsed.student_notes || []).length,
    student_questions: (parsed.student_questions || []).length,
    student_observations: (parsed.student_observations || []).length,
    content_items: (parsed.content_items || []).length,
    research_items: (parsed.research_items || []).length,
    accounting_items: (parsed.accounting_items || []).length,
    contact_items: (parsed.contact_items || []).length,
    contacts: (parsed.contacts || []).length,
    communications: (parsed.communications || []).length,
    integration_items: (parsed.integration_items || []).length,
    service_provider_items: (parsed.service_provider_items || []).length,
    alerts: (parsed.alerts || []).length,
    errors: (parsed.errors || []).length,
  };
}

function buildRawIntakeMetadata(input = {}, parsed = {}) {
  const sourceDate = isoDate(input.source_date || input.created_at || input.recorded_at || null);
  const sourceChannel = normalizeSourceChannel(input.source_channel || input.source_type || input.source || 'manual');
  const counts = extractedItemCounts(parsed);
  const rawText = input.raw_input || input.raw_text || input.text || '';
  const registerRequired = broadCorrectionRegisterNeeded(rawText);
  const goalModeRequested = goalModeExecutionRequested(rawText);
  return {
    source_date: sourceDate,
    source_channel: sourceChannel,
    raw_id_format: 'RAW-YYYYMMDD-###',
    requirement_register_path: registerRequired
      ? requirementRegisterPath(sourceDate)
      : null,
    goal_mode_execution_requested: goalModeRequested,
    goal_mode_output_contract_path: goalModeRequested ? GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH : null,
    counts,
    confirmation_fields: ['raw_id', 'requirements', 'tasks', 'decisions', 'open_questions', 'requirement_register_path', 'goal_mode_execution_requested'],
  };
}

module.exports = {
  RAMBLE_PROTOCOL_VERSION,
  RAMBLE_INTAKE_TEMPLATE_PATH,
  GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH,
  DEFAULT_REQUIREMENT_REGISTER_BASENAME,
  RAW_SOURCE_CHANNELS,
  RAW_PARSE_STATUSES,
  RAMBLE_CANONICAL_ARRAY_KEYS,
  STABLE_ID_PREFIX_BY_TYPE,
  compactWhitespace,
  stableHash,
  dateStamp,
  isoDate,
  formatStableId,
  normalizeSourceChannel,
  requirementRegisterPath,
  sourceQuote,
  titleFromText,
  broadCorrectionRegisterNeeded,
  goalModeExecutionRequested,
  gptCorrectionPacketDetected,
  buildProtocolItem,
  extractedItemCounts,
  buildRawIntakeMetadata,
};
