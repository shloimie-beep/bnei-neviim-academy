const crypto = require('node:crypto');

const CONTROL_SUMMARY_SCHEMA_VERSION = 'bna.control_summary.v1';
const CONTROL_SUMMARY_EVENT_TYPES = new Set([
  'work_item.created',
  'work_item.updated',
  'decision.required',
  'ticket.opened',
  'integration.blocked',
  'deploy.started',
  'deploy.failed',
  'deploy.succeeded',
  'canary.failed',
  'canary.succeeded',
  'agent.result_recorded',
]);
const CONTROL_SUMMARY_REPLAY_WINDOW_SECONDS = 300;

function summaryEventsEnabled(env = process.env) {
  return String(env.BNA_CONTROL_SUMMARY_EVENTS_ENABLED || 'false').toLowerCase() === 'true';
}

function compact(value, limit) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function validateControlSummaryEvent(event = {}, { now = new Date() } = {}) {
  const errors = [];
  if (event.schema_version !== CONTROL_SUMMARY_SCHEMA_VERSION) errors.push('schema_version');
  if (!CONTROL_SUMMARY_EVENT_TYPES.has(String(event.event_type || ''))) errors.push('event_type');
  for (const field of ['event_id', 'idempotency_key', 'source_product', 'source_workspace', 'source_object_type', 'source_object_id', 'source_object_version', 'occurred_at', 'title', 'status', 'assignee', 'priority', 'deep_link', 'data_classification', 'key_id', 'signed_at']) {
    if (!compact(event[field], field === 'title' ? 240 : 180)) errors.push(field);
  }
  if (event.data_classification !== 'sanitized_summary') errors.push('data_classification');
  if (event.signature_algorithm !== 'hmac-sha256') errors.push('signature_algorithm');
  if (Number(event.replay_window_seconds) !== CONTROL_SUMMARY_REPLAY_WINDOW_SECONDS) errors.push('replay_window_seconds');
  const occurredAt = Date.parse(event.occurred_at || '');
  const signedAt = Date.parse(event.signed_at || '');
  if (!Number.isFinite(occurredAt)) errors.push('occurred_at_invalid');
  if (!Number.isFinite(signedAt)) errors.push('signed_at_invalid');
  if (Number.isFinite(signedAt) && Math.abs(now.getTime() - signedAt) > CONTROL_SUMMARY_REPLAY_WINDOW_SECONDS * 1000) errors.push('replay_window_expired');
  try {
    const link = new URL(event.deep_link || '');
    if (link.protocol !== 'https:') errors.push('deep_link_https');
  } catch {
    errors.push('deep_link_invalid');
  }
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

function controlSummarySignature(rawBody, secret) {
  if (!secret) throw new Error('Control summary signing secret is not configured.');
  return crypto.createHmac('sha256', secret).update(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ''))).digest('hex');
}

function verifyControlSummarySignature(rawBody, suppliedSignature, secret) {
  const expected = Buffer.from(controlSummarySignature(rawBody, secret), 'hex');
  const supplied = Buffer.from(String(suppliedSignature || '').replace(/^sha256=/i, ''), 'hex');
  return expected.length === supplied.length && expected.length > 0 && crypto.timingSafeEqual(expected, supplied);
}

module.exports = {
  CONTROL_SUMMARY_EVENT_TYPES,
  CONTROL_SUMMARY_REPLAY_WINDOW_SECONDS,
  CONTROL_SUMMARY_SCHEMA_VERSION,
  controlSummarySignature,
  summaryEventsEnabled,
  validateControlSummaryEvent,
  verifyControlSummarySignature,
};
