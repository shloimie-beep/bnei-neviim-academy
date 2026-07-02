'use strict';

const crypto = require('crypto');

const DROPOFF_CONTRACT_VERSION = 'bna-chatgpt-ramble-dropoff-v1';
const DEFAULT_DROPOFF_ROOT = 'ops/chatgpt-ramble-dropoff/incoming';

function compactText(value = '', max = 20000) {
  return String(value || '')
    .replace(/\r/g, '')
    .trim()
    .slice(0, max);
}

function stableHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function slugify(value = '', fallback = 'ramble') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || fallback;
}

function dateStamp(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function packetIdFor({ rawText = '', title = '', createdAt = new Date(), sequence = '001' } = {}) {
  const day = dateStamp(createdAt);
  const suffix = slugify(title || rawText.slice(0, 120), 'chatgpt-ramble');
  return `RAW-${day}-${sequence}-${suffix}`;
}

function rawIdFor({ createdAt = new Date(), sequence = '001' } = {}) {
  return `RAW-${dateStamp(createdAt)}-${sequence}`;
}

function buildChatGptRamblePacket(input = {}) {
  const rawText = compactText(input.rawText || input.raw_text || input.text || '', 200000);
  if (!rawText) {
    const error = new Error('rawText is required');
    error.code = 'raw_text_required';
    throw error;
  }

  const createdAt = input.createdAt || input.created_at || new Date().toISOString();
  const sequence = String(input.sequence || '001').padStart(3, '0');
  const rawId = input.rawId || input.raw_id || rawIdFor({ createdAt, sequence });
  const title = compactText(input.title || rawText.split('\n').find(Boolean) || 'ChatGPT ramble packet', 180);
  const packetId = input.packetId || input.packet_id || `${rawId}-${slugify(title)}`;

  return {
    contract_version: DROPOFF_CONTRACT_VERSION,
    packet_id: packetId,
    raw_id: rawId,
    created_at: createdAt,
    source: {
      channel: 'chatgpt',
      actor: input.actor || 'operator',
      conversation_id: input.conversationId || input.conversation_id || null,
    },
    workspace_key: input.workspaceKey || input.workspace_key || 'bna',
    project_key: input.projectKey || input.project_key || 'bna',
    title,
    status: 'queued',
    goal_mode_execution_requested: Boolean(input.goalMode || input.goal_mode_execution_requested),
    raw_text_hash: stableHash(rawText),
    raw_text_file: 'RAW.md',
    codex_prompt_file: 'CODEX_PROMPT.md',
    attachments: Array.isArray(input.attachments) ? input.attachments : [],
    expected_agent_flow: [
      'audit_repo_context',
      'create_or_update_raw_input',
      'create_or_update_task_handoff',
      'apply_prepared_code_if_present',
      'run_tests',
      'record_evidence_and_result',
    ],
    acceptance_criteria: Array.isArray(input.acceptanceCriteria || input.acceptance_criteria)
      ? (input.acceptanceCriteria || input.acceptance_criteria)
      : [],
  };
}

function validateChatGptRamblePacket(packet = {}) {
  const errors = [];
  if (packet.contract_version !== DROPOFF_CONTRACT_VERSION) errors.push('contract_version mismatch');
  if (!packet.packet_id) errors.push('packet_id is required');
  if (!packet.raw_id || !/^RAW-\d{8}-/.test(packet.raw_id)) errors.push('raw_id must start RAW-YYYYMMDD-');
  if (!packet.raw_text_hash) errors.push('raw_text_hash is required');
  if (packet.status && !['queued', 'claimed', 'picked_up', 'running', 'done', 'blocked', 'failed'].includes(packet.status)) {
    errors.push(`unsupported status ${packet.status}`);
  }
  return {
    ok: errors.length === 0,
    errors,
  };
}

function packetToCodexPrompt(packet = {}, rawText = '') {
  return [
    `# Codex prompt for ${packet.raw_id || packet.packet_id}`,
    '',
    `Packet: \`${packet.packet_id}\``,
    `Workspace: \`${packet.workspace_key || 'bna'}\``,
    `Project: \`${packet.project_key || 'bna'}\``,
    '',
    '## Required behavior',
    '',
    '1. Read AGENTS.md first.',
    '2. Preserve the raw ramble as source/provenance.',
    '3. Audit existing repo code before editing.',
    '4. Apply prepared code from packet attachments when present.',
    '5. Adapt code to real repo structure; do not blindly overwrite unrelated files.',
    '6. Run targeted tests and then the relevant broader test command.',
    '7. Record evidence, blockers, and result records.',
    '8. Do not claim done without tests/evidence.',
    '',
    '## Raw ramble',
    '',
    '```text',
    compactText(rawText, 20000),
    '```',
  ].join('\n');
}

module.exports = {
  DEFAULT_DROPOFF_ROOT,
  DROPOFF_CONTRACT_VERSION,
  buildChatGptRamblePacket,
  compactText,
  dateStamp,
  packetIdFor,
  packetToCodexPrompt,
  rawIdFor,
  slugify,
  stableHash,
  validateChatGptRamblePacket,
};
