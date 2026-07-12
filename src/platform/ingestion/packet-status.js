const PACKET_STATUS_CONTRACT_VERSION = 'bna-shared-packet-status-v1';

const PACKET_STATUSES = [
  'draft',
  'ready_for_codex_audit',
  'ready_for_codex_pickup',
  'codex_queued',
  'auditing',
  'in_progress',
  'implemented',
  'verified',
  'done_verified',
  'blocked_needs_operator_decision',
  'rejected',
  'archived',
];

const READY_PACKET_STATUSES = new Set(['ready_for_codex_audit', 'ready_for_codex_pickup']);
const TERMINAL_PACKET_STATUSES = new Set(['done_verified', 'rejected', 'blocked_needs_operator_decision', 'archived']);
const PACKET_STATUS_ALIASES = {
  codex_done: 'done_verified',
  done: 'done_verified',
  complete: 'done_verified',
  completed: 'done_verified',
  queued_for_codex: 'codex_queued',
  needs_operator: 'blocked_needs_operator_decision',
  needs_operator_decision: 'blocked_needs_operator_decision',
  blocked: 'blocked_needs_operator_decision',
};

function slug(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizePacketStatus(value = '', options = {}) {
  const original = String(value || '').trim();
  const key = slug(original || options.fallback || 'draft');
  const migrated = PACKET_STATUS_ALIASES[key] || key || 'draft';
  const known = PACKET_STATUSES.includes(migrated);
  if (!known && options.rejectUnknown) {
    const error = new Error(`Unknown packet status: ${original || '(empty)'}`);
    error.code = 'UNKNOWN_PACKET_STATUS';
    error.status = original;
    throw error;
  }
  return {
    contract_version: PACKET_STATUS_CONTRACT_VERSION,
    original_status: original,
    status: known ? migrated : 'draft',
    known,
    migrated: Boolean(PACKET_STATUS_ALIASES[key]),
    migration_required: Boolean(PACKET_STATUS_ALIASES[key] && original !== migrated),
  };
}

function packetStatusValue(value = '', fallback = 'draft') {
  return normalizePacketStatus(value || fallback, { fallback }).status;
}

function isReadyPacketStatus(value = '') {
  return READY_PACKET_STATUSES.has(packetStatusValue(value));
}

function isTerminalPacketStatus(value = '') {
  return TERMINAL_PACKET_STATUSES.has(packetStatusValue(value));
}

module.exports = {
  PACKET_STATUS_CONTRACT_VERSION,
  PACKET_STATUSES,
  READY_PACKET_STATUSES,
  TERMINAL_PACKET_STATUSES,
  PACKET_STATUS_ALIASES,
  normalizePacketStatus,
  packetStatusValue,
  isReadyPacketStatus,
  isTerminalPacketStatus,
};
