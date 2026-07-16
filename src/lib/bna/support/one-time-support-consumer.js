const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { previewMessage, redactText } = require('../helper/redaction');
const { notifySuperAdminSupportTicket } = require('../telegram-notifications');

const EVENT_PATH = '/api/internal/integrations/onetime/support-events/v1';
const STATUS_PATH = '/api/internal/integrations/onetime/support-ticket-status/v1';
const OPERATOR_API_PATH = '/api/bna/onetime/support-tickets/:bnaTicketRef';
const OPERATOR_VIEW_PATH = '/operations/onetime/support-tickets/:bnaTicketRef';
const CONTRACT_VERSION = '1.0.0';
const EVENT_TYPE = 'onetime.support.ticket.submitted.v1';
const AUTH_POLICY_VERSION = 'ot89-subscriber-support-v1';
const REDACTION_POLICY = 'ot89-redaction-v1';
const MAX_BODY_BYTES = 131072;
const NONCE_RETENTION_SECONDS = 86400;
const TIMESTAMP_SKEW_SECONDS = 300;
const ALERT_LEASE_SECONDS = 120;
const ALERT_MAX_ATTEMPTS = 12;
const ALERT_MAX_BACKOFF_SECONDS = 4 * 60 * 60;
const JERUSALEM_TZ = 'Asia/Jerusalem';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const EVENT_ID_PATTERN = /^evt_[0-9A-HJKMNP-TV-Z]{26}$/;
const SOURCE_TICKET_ID_PATTERN = /^ots_[0-9A-HJKMNP-TV-Z]{26}$/;
const RECEIPT_ID_PATTERN = /^otr_[0-9A-HJKMNP-TV-Z]{26}$/;
const OUTBOX_ID_PATTERN = /^otx_[0-9A-HJKMNP-TV-Z]{26}$/;
const BNA_REF_PATTERN = /^bna_[0-9A-HJKMNP-TV-Z]{26}$/;
const ATTACHMENT_ID_PATTERN = /^ota_[0-9A-HJKMNP-TV-Z]{26}$/;
const ACCOUNT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{5,127}$/;
const CORRELATION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{5,127}$/;
const KEY_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const NONCE_PATTERN = /^[A-Za-z0-9_-]{32}$/;
const SIGNATURE_PATTERN = /^v1=[a-f0-9]{64}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SOURCE_COMMIT_PATTERN = /^[a-f0-9]{40}$/;
const ERROR_CODE_PATTERN = /^[A-Z0-9][A-Z0-9._:-]{0,99}$/;
const SAFE_FILENAME_PATTERN = /^[^/\\\u0000-\u001F\u007F]+$/;

const PRODUCER_ENVIRONMENTS = new Set(['development', 'staging', 'production']);
const TICKET_CATEGORIES = new Set(['bug', 'access_login', 'class_zoom', 'billing', 'content', 'complaint', 'other']);
const REPLY_PREFERENCES = new Set(['in_app', 'email', 'whatsapp']);
const OCCURRENCES = new Set(['once', 'intermittent', 'always', 'not_applicable']);
const PROVIDERS = new Set(['none', 'authentication', 'zoom', 'payments', 'content_delivery', 'other']);
const MEDIA_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'text/plain']);
const NORMALIZATION_TYPES = new Set(['image-decoded-and-reencoded', 'utf8-text-normalized']);
const STATUS_VALUES = new Set(['new', 'triage', 'pending_operator', 'waiting_customer', 'in_progress', 'resolved', 'closed', 'rejected']);
const TRIAGE_CLASSES = new Set(['REPRODUCIBLE_BUG', 'ACCESS_PROVIDER_INCIDENT', 'FEATURE_REQUEST', 'COMPLAINT', 'AMBIGUOUS']);
const DIAGNOSTIC_OPERATION_CODES = Object.freeze([
  'READ_BUILD_METADATA',
  'READ_HEALTH_STATUS',
  'QUERY_STRUCTURED_LOGS_BY_CORRELATION_ID',
  'READ_FEATURE_FLAG_STATE',
  'READ_PROVIDER_STATUS_CACHE',
  'RUN_EXISTING_READ_ONLY_TEST',
]);
const DIAGNOSTIC_OPERATION_SET = new Set(DIAGNOSTIC_OPERATION_CODES);

const SUPPORT_CATEGORY_MAP = {
  bug: 'task_manager',
  access_login: 'access',
  class_zoom: 'link',
  billing: 'payment',
  content: 'recording',
  complaint: 'other',
  other: 'other',
};

const STATUS_MAP = {
  open: 'new',
  triage: 'triage',
  awaiting_super_admin_approval: 'pending_operator',
  needs_requester_information: 'waiting_customer',
  approved_for_codex: 'in_progress',
  kept_as_ticket: 'pending_operator',
  rejected: 'rejected',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed',
};

class Ot89Error extends Error {
  constructor(message, { statusCode = 400, reasonCode = 'ot89_error', retryable = false, safe = {} } = {}) {
    super(message);
    this.name = 'Ot89Error';
    this.statusCode = statusCode;
    this.reasonCode = reasonCode;
    this.retryable = retryable;
    this.safe = safe;
  }
}

function truthy(value) {
  return ['1', 'true', 'yes', 'on', 'enabled'].includes(String(value || '').trim().toLowerCase());
}

function nowDate(clock = Date) {
  return new Date(typeof clock.now === 'function' ? clock.now() : Date.now());
}

function compact(value = '', max = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function clampNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(number)));
}

function normalizeString(value = '', max = 6000) {
  return String(value || '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, max);
}

function redactSupportText(value = '', max = 6000) {
  let text = redactText(normalizeString(value, max));
  const replacements = [
    [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]'],
    [/\b(?:\d[ -]*?){13,19}\b/g, '[redacted-financial-id]'],
    [/\b(?:\+?\d[\d .()/-]{7,}\d)\b/g, '[redacted-phone]'],
    [/\b(?:password|passcode|otp|one[- ]?time code|token|secret|bearer|cookie|session)\s*[:=]\s*[^\s,;]+/gi, '[redacted-secret]'],
    [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted-jwt]'],
    [/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{12,}\b/g, '[redacted-key]'],
    [/\b\d{3}-\d{2}-\d{4}\b/g, '[redacted-government-id]'],
    [/\b(?:street|st\.|avenue|ave\.|road|rd\.|boulevard|blvd\.|lane|ln\.)\b[^\n]{0,80}/gi, '[redacted-address]'],
  ];
  for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
  return text.slice(0, max);
}

function safeFilename(value = '') {
  const clean = redactSupportText(value, 100)
    .replace(/[\\/:\u0000-\u001F\u007F]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  return clean || 'attachment';
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmacSha256Hex(secret, value) {
  return crypto.createHmac('sha256', Buffer.from(String(secret || ''), 'utf8')).update(value).digest('hex');
}

function alertBackoffSeconds(attempts = 0) {
  const attempt = clampNumber(attempts, { min: 1, max: ALERT_MAX_ATTEMPTS, fallback: 1 });
  return Math.min(ALERT_MAX_BACKOFF_SECONDS, 60 * (2 ** Math.min(attempt - 1, 8)));
}

function safeAlertError(error) {
  const reason = error instanceof Ot89Error ? error.reasonCode : (error?.code || error?.name || 'alert_send_failed');
  return {
    reason: compact(reason, 120),
    message: redactSupportText(error?.message || reason || 'alert send failed', 500),
    retryable: error instanceof Ot89Error ? Boolean(error.retryable) : true,
  };
}

function telegramDrainGate({ env = process.env } = {}) {
  if (!truthy(env.OT89_REAL_TELEGRAM_DELIVERY_ENABLED)) {
    return { ok: false, reason: 'real_telegram_delivery_disabled' };
  }
  if (!truthy(env.OT89_BNA_BOT_SOLE_OWNER_VERIFIED)) {
    return { ok: false, reason: 'bna_bot_sole_owner_not_verified' };
  }
  return { ok: true, reason: 'ready' };
}

function base64url(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomCrockford26() {
  let n = BigInt(`0x${crypto.randomBytes(16).toString('hex')}`);
  let out = '';
  for (let i = 0; i < 26; i += 1) {
    out = CROCKFORD[Number(n & 31n)] + out;
    n >>= 5n;
  }
  return out;
}

function newBnaTicketRef() {
  return `bna_${randomCrockford26()}`;
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function canonicalString({ method, requestTarget, timestamp, nonce, rawBodySha256 }) {
  return [
    String(method || '').toUpperCase(),
    requestTarget,
    String(timestamp || ''),
    String(nonce || ''),
    rawBodySha256,
  ].join('\n');
}

function loadHmacKeys(env = process.env) {
  const keys = new Map();
  const json = String(env.OT89_ONETIME_TO_BNA_HMAC_KEYS || '').trim();
  if (json) {
    try {
      const parsed = JSON.parse(json);
      for (const [keyId, secret] of Object.entries(parsed || {})) {
        if (KEY_ID_PATTERN.test(keyId) && String(secret || '').trim()) keys.set(keyId, String(secret));
      }
    } catch {
      throw new Ot89Error('Invalid OT89 HMAC key map', { statusCode: 500, reasonCode: 'invalid_hmac_key_config', retryable: true });
    }
  }
  const keyId = String(env.OT89_ONETIME_TO_BNA_HMAC_KEY_ID || env.OT89_HMAC_KEY_ID || '').trim();
  const secret = String(env.OT89_ONETIME_TO_BNA_HMAC_SECRET || env.OT89_HMAC_SECRET || '').trim();
  if (keyId && secret && KEY_ID_PATTERN.test(keyId)) keys.set(keyId, secret);
  return keys;
}

function extractHeader(headers = {}, name) {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (String(key).toLowerCase() === wanted) return Array.isArray(value) ? String(value[0] || '') : String(value || '');
  }
  return '';
}

function safeRequestPath(reqLike = {}, fallbackPath = EVENT_PATH) {
  const raw = String(reqLike.originalUrl || reqLike.url || reqLike.path || fallbackPath || '');
  try {
    return new URL(raw, 'https://bna.invalid').pathname;
  } catch {
    return fallbackPath;
  }
}

function assertHttpsAllowed({ reqLike = {}, env = process.env, requestPath = '' } = {}) {
  if (String(env.NODE_ENV || '').toLowerCase() === 'test') return;
  if (truthy(env.OT89_ALLOW_INSECURE_TEST_TRANSPORT)) return;
  const secure = reqLike.secure === true || String(reqLike.protocol || '').toLowerCase() === 'https'
    || String(reqLike.headers?.['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase() === 'https';
  if (!secure) {
    throw new Ot89Error('HTTPS is required for OT89 internal integration routes', {
      statusCode: 403,
      reasonCode: 'https_required',
      safe: { request_path: requestPath },
    });
  }
}

function verifySignedRequest({
  reqLike = {},
  rawBody,
  expectedPath,
  env = process.env,
  now = Date.now(),
  keys = loadHmacKeys(env),
} = {}) {
  const method = String(reqLike.method || '').toUpperCase();
  const requestPath = safeRequestPath(reqLike, expectedPath);
  if (method !== 'POST' || requestPath !== expectedPath) {
    throw new Ot89Error('Wrong OT89 method or path', { statusCode: 404, reasonCode: 'wrong_method_or_path', safe: { method, request_path: requestPath } });
  }
  assertHttpsAllowed({ reqLike, env, requestPath });

  const contentType = extractHeader(reqLike.headers, 'content-type').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw new Ot89Error('OT89 content type must be application/json', { statusCode: 415, reasonCode: 'invalid_content_type' });
  }

  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody || '');
  if (bodyBuffer.length > MAX_BODY_BYTES) {
    throw new Ot89Error('OT89 body is too large', { statusCode: 413, reasonCode: 'body_too_large' });
  }
  if (bodyBuffer.length >= 3 && bodyBuffer[0] === 0xef && bodyBuffer[1] === 0xbb && bodyBuffer[2] === 0xbf) {
    throw new Ot89Error('OT89 body must be UTF-8 without BOM', { statusCode: 400, reasonCode: 'body_bom_forbidden' });
  }

  const keyId = extractHeader(reqLike.headers, 'x-ot89-key-id');
  const timestamp = extractHeader(reqLike.headers, 'x-ot89-timestamp');
  const nonce = extractHeader(reqLike.headers, 'x-ot89-nonce');
  const signature = extractHeader(reqLike.headers, 'x-ot89-signature');
  const eventId = extractHeader(reqLike.headers, 'x-ot89-event-id');
  if (!KEY_ID_PATTERN.test(keyId)) throw new Ot89Error('Invalid OT89 key id', { statusCode: 401, reasonCode: 'invalid_key_id' });
  if (!/^\d+$/.test(timestamp)) throw new Ot89Error('Invalid OT89 timestamp', { statusCode: 401, reasonCode: 'invalid_timestamp' });
  if (!NONCE_PATTERN.test(nonce)) throw new Ot89Error('Invalid OT89 nonce', { statusCode: 401, reasonCode: 'invalid_nonce' });
  if (!SIGNATURE_PATTERN.test(signature)) throw new Ot89Error('Invalid OT89 signature header', { statusCode: 401, reasonCode: 'invalid_signature_header' });
  if (expectedPath === EVENT_PATH && !EVENT_ID_PATTERN.test(eventId)) {
    throw new Ot89Error('Invalid OT89 event id header', { statusCode: 401, reasonCode: 'invalid_event_id_header' });
  }

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Number(now) - timestampMs) > TIMESTAMP_SKEW_SECONDS * 1000) {
    throw new Ot89Error('OT89 timestamp is outside the accepted skew', { statusCode: 401, reasonCode: 'timestamp_skew' });
  }

  if (!(keys instanceof Map) || !keys.has(keyId)) {
    throw new Ot89Error('OT89 key is not configured', { statusCode: 401, reasonCode: 'hmac_key_not_configured', safe: { key_id: keyId } });
  }
  const rawBodySha256 = sha256Hex(bodyBuffer);
  const input = canonicalString({ method, requestTarget: requestPath, timestamp, nonce, rawBodySha256 });
  const expected = `v1=${hmacSha256Hex(keys.get(keyId), input)}`;
  const actualBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Ot89Error('OT89 signature verification failed', { statusCode: 401, reasonCode: 'signature_mismatch', safe: { key_id: keyId, body_sha256: rawBodySha256 } });
  }
  return { key_id: keyId, nonce, timestamp: Number(timestamp), event_id: eventId || null, raw_body_sha256: rawBodySha256, canonical_string: input };
}

function parseJsonStrict(rawBody) {
  try {
    return JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || ''));
  } catch {
    throw new Ot89Error('Malformed OT89 JSON body', { statusCode: 400, reasonCode: 'malformed_json' });
  }
}

function assertPlainObject(value, pathName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Ot89Error(`${pathName} must be an object`, { statusCode: 422, reasonCode: 'schema_object_required', safe: { field: pathName } });
  }
}

function assertOnlyKeys(value, allowed, pathName) {
  for (const key of Object.keys(value || {})) {
    if (!allowed.includes(key)) {
      throw new Ot89Error(`Unexpected field ${pathName}.${key}`, { statusCode: 422, reasonCode: 'schema_unknown_field', safe: { field: `${pathName}.${key}` } });
    }
  }
}

function assertStringField(value, { field, min = 0, max = 1000, pattern = null, nullable = false }) {
  if (value === null && nullable) return;
  if (typeof value !== 'string' || value.length < min || value.length > max || (pattern && !pattern.test(value))) {
    throw new Ot89Error(`Invalid ${field}`, { statusCode: 422, reasonCode: 'schema_invalid_field', safe: { field } });
  }
}

function assertDateTimeField(value, { field, nullable = false }) {
  if (value === null && nullable) return;
  assertStringField(value, { field, min: 1, max: 80 });
  if (Number.isNaN(Date.parse(value))) {
    throw new Ot89Error(`Invalid ${field}`, { statusCode: 422, reasonCode: 'schema_invalid_datetime', safe: { field } });
  }
}

function assertEnum(value, set, field) {
  if (!set.has(value)) {
    throw new Ot89Error(`Invalid ${field}`, { statusCode: 422, reasonCode: 'schema_invalid_enum', safe: { field } });
  }
}

function validateSupportEventSchema(event) {
  assertPlainObject(event, 'event');
  assertOnlyKeys(event, ['contract_version', 'event_type', 'event_id', 'occurred_at', 'producer', 'submission', 'actor', 'authorization', 'ticket', 'attachments', 'privacy', 'trace'], 'event');
  if (event.contract_version !== CONTRACT_VERSION) throw new Ot89Error('Unsupported contract version', { statusCode: 422, reasonCode: 'unsupported_contract_version' });
  if (event.event_type !== EVENT_TYPE) throw new Ot89Error('Unsupported OT89 event type', { statusCode: 422, reasonCode: 'unsupported_event_type' });
  assertStringField(event.event_id, { field: 'event.event_id', pattern: EVENT_ID_PATTERN });
  assertDateTimeField(event.occurred_at, { field: 'event.occurred_at' });

  assertPlainObject(event.producer, 'event.producer');
  assertOnlyKeys(event.producer, ['service', 'environment', 'deployment_id', 'source_commit'], 'event.producer');
  if (event.producer.service !== 'onetime') throw new Ot89Error('Invalid producer service', { statusCode: 422, reasonCode: 'invalid_producer_service' });
  assertEnum(event.producer.environment, PRODUCER_ENVIRONMENTS, 'event.producer.environment');
  assertStringField(event.producer.deployment_id, { field: 'event.producer.deployment_id', min: 1, max: 64 });
  assertStringField(event.producer.source_commit, { field: 'event.producer.source_commit', pattern: SOURCE_COMMIT_PATTERN });

  assertPlainObject(event.submission, 'event.submission');
  assertOnlyKeys(event.submission, ['source_ticket_id', 'receipt_id', 'outbox_id'], 'event.submission');
  assertStringField(event.submission.source_ticket_id, { field: 'event.submission.source_ticket_id', pattern: SOURCE_TICKET_ID_PATTERN });
  assertStringField(event.submission.receipt_id, { field: 'event.submission.receipt_id', pattern: RECEIPT_ID_PATTERN });
  assertStringField(event.submission.outbox_id, { field: 'event.submission.outbox_id', pattern: OUTBOX_ID_PATTERN });

  assertPlainObject(event.actor, 'event.actor');
  assertOnlyKeys(event.actor, ['onetime_user_id', 'onetime_account_id'], 'event.actor');
  assertStringField(event.actor.onetime_user_id, { field: 'event.actor.onetime_user_id', pattern: ACCOUNT_ID_PATTERN });
  assertStringField(event.actor.onetime_account_id, { field: 'event.actor.onetime_account_id', pattern: ACCOUNT_ID_PATTERN });

  assertPlainObject(event.authorization, 'event.authorization');
  assertOnlyKeys(event.authorization, ['policy_version', 'authenticated', 'account_id', 'entitlement_product', 'entitlement_id', 'entitlement_status', 'checked_at', 'valid_until'], 'event.authorization');
  if (event.authorization.policy_version !== AUTH_POLICY_VERSION) throw new Ot89Error('Invalid authorization policy', { statusCode: 422, reasonCode: 'invalid_authorization_policy' });
  if (event.authorization.authenticated !== true) throw new Ot89Error('Actor is not authenticated', { statusCode: 403, reasonCode: 'actor_not_authenticated' });
  assertStringField(event.authorization.account_id, { field: 'event.authorization.account_id', pattern: ACCOUNT_ID_PATTERN });
  if (event.authorization.entitlement_product !== 'one_time') throw new Ot89Error('Invalid entitlement product', { statusCode: 403, reasonCode: 'invalid_entitlement_product' });
  assertStringField(event.authorization.entitlement_id, { field: 'event.authorization.entitlement_id', pattern: ACCOUNT_ID_PATTERN });
  if (event.authorization.entitlement_status !== 'active') throw new Ot89Error('Entitlement is not active', { statusCode: 403, reasonCode: 'entitlement_not_active' });
  assertDateTimeField(event.authorization.checked_at, { field: 'event.authorization.checked_at' });
  assertDateTimeField(event.authorization.valid_until, { field: 'event.authorization.valid_until', nullable: true });

  assertPlainObject(event.ticket, 'event.ticket');
  assertOnlyKeys(event.ticket, ['category', 'title', 'message', 'issue_details', 'client_context', 'reply_preference'], 'event.ticket');
  assertEnum(event.ticket.category, TICKET_CATEGORIES, 'event.ticket.category');
  assertStringField(event.ticket.title, { field: 'event.ticket.title', min: 5, max: 120 });
  assertStringField(event.ticket.message, { field: 'event.ticket.message', min: 20, max: 6000 });
  assertEnum(event.ticket.reply_preference, REPLY_PREFERENCES, 'event.ticket.reply_preference');

  assertPlainObject(event.ticket.issue_details, 'event.ticket.issue_details');
  assertOnlyKeys(event.ticket.issue_details, ['steps_to_reproduce', 'expected_behavior', 'actual_behavior', 'occurrence', 'first_observed_at', 'error_code', 'provider'], 'event.ticket.issue_details');
  if (!Array.isArray(event.ticket.issue_details.steps_to_reproduce) || event.ticket.issue_details.steps_to_reproduce.length > 10) {
    throw new Ot89Error('Invalid steps_to_reproduce', { statusCode: 422, reasonCode: 'schema_invalid_field', safe: { field: 'event.ticket.issue_details.steps_to_reproduce' } });
  }
  event.ticket.issue_details.steps_to_reproduce.forEach((step, index) => assertStringField(step, { field: `event.ticket.issue_details.steps_to_reproduce.${index}`, min: 1, max: 500 }));
  assertStringField(event.ticket.issue_details.expected_behavior, { field: 'event.ticket.issue_details.expected_behavior', min: 1, max: 1500, nullable: true });
  assertStringField(event.ticket.issue_details.actual_behavior, { field: 'event.ticket.issue_details.actual_behavior', min: 1, max: 1500, nullable: true });
  assertEnum(event.ticket.issue_details.occurrence, OCCURRENCES, 'event.ticket.issue_details.occurrence');
  assertDateTimeField(event.ticket.issue_details.first_observed_at, { field: 'event.ticket.issue_details.first_observed_at', nullable: true });
  assertStringField(event.ticket.issue_details.error_code, { field: 'event.ticket.issue_details.error_code', pattern: ERROR_CODE_PATTERN, nullable: true });
  assertEnum(event.ticket.issue_details.provider, PROVIDERS, 'event.ticket.issue_details.provider');

  assertPlainObject(event.ticket.client_context, 'event.ticket.client_context');
  assertOnlyKeys(event.ticket.client_context, ['route_template', 'app_release', 'locale', 'timezone'], 'event.ticket.client_context');
  assertStringField(event.ticket.client_context.route_template, { field: 'event.ticket.client_context.route_template', min: 1, max: 180 });
  assertStringField(event.ticket.client_context.app_release, { field: 'event.ticket.client_context.app_release', min: 1, max: 80 });
  assertStringField(event.ticket.client_context.locale, { field: 'event.ticket.client_context.locale', min: 2, max: 35 });
  assertStringField(event.ticket.client_context.timezone, { field: 'event.ticket.client_context.timezone', min: 1, max: 80 });

  if (!Array.isArray(event.attachments) || event.attachments.length > 3) {
    throw new Ot89Error('Invalid attachments array', { statusCode: 422, reasonCode: 'schema_invalid_attachments' });
  }
  let totalBytes = 0;
  for (const [index, attachment] of event.attachments.entries()) {
    assertPlainObject(attachment, `event.attachments.${index}`);
    assertOnlyKeys(attachment, ['attachment_id', 'normalized_filename', 'media_type', 'size_bytes', 'sha256', 'transfer_locator', 'normalization', 'storage_class', 'content_disposition', 'pixel_width', 'pixel_height'], `event.attachments.${index}`);
    assertStringField(attachment.attachment_id, { field: `event.attachments.${index}.attachment_id`, pattern: ATTACHMENT_ID_PATTERN });
    assertStringField(attachment.normalized_filename, { field: `event.attachments.${index}.normalized_filename`, min: 1, max: 100, pattern: SAFE_FILENAME_PATTERN });
    assertEnum(attachment.media_type, MEDIA_TYPES, `event.attachments.${index}.media_type`);
    if (!Number.isInteger(attachment.size_bytes) || attachment.size_bytes < 1 || attachment.size_bytes > 5242880) {
      throw new Ot89Error('Invalid attachment size', { statusCode: 422, reasonCode: 'schema_invalid_attachment_size' });
    }
    totalBytes += attachment.size_bytes;
    assertStringField(attachment.sha256, { field: `event.attachments.${index}.sha256`, pattern: SHA256_PATTERN });
    assertStringField(attachment.transfer_locator, { field: `event.attachments.${index}.transfer_locator`, pattern: new RegExp(`^onetime-private-blob://${attachment.attachment_id}$`) });
    assertEnum(attachment.normalization, NORMALIZATION_TYPES, `event.attachments.${index}.normalization`);
    if (attachment.storage_class !== 'private' || attachment.content_disposition !== 'attachment') {
      throw new Ot89Error('Invalid attachment storage policy', { statusCode: 422, reasonCode: 'schema_invalid_attachment_policy' });
    }
    for (const dimension of ['pixel_width', 'pixel_height']) {
      const value = attachment[dimension];
      if (value !== null && (!Number.isInteger(value) || value < 1 || value > 8000)) {
        throw new Ot89Error('Invalid attachment image dimensions', { statusCode: 422, reasonCode: 'schema_invalid_attachment_dimensions' });
      }
    }
    if (attachment.media_type.startsWith('image/')) {
      if (!attachment.pixel_width || !attachment.pixel_height || (attachment.pixel_width * attachment.pixel_height) > 20000000) {
        throw new Ot89Error('Invalid attachment decoded image limits', { statusCode: 422, reasonCode: 'schema_invalid_attachment_dimensions' });
      }
    }
  }
  if (totalBytes > 10485760) throw new Ot89Error('Attachment total is too large', { statusCode: 422, reasonCode: 'attachment_total_too_large' });

  assertPlainObject(event.privacy, 'event.privacy');
  assertOnlyKeys(event.privacy, ['redaction_policy', 'content_state', 'contains_raw_secrets', 'contains_direct_contact_details', 'redacted_fields', 'redaction_count'], 'event.privacy');
  if (event.privacy.redaction_policy !== REDACTION_POLICY || event.privacy.content_state !== 'sanitized_user_text') {
    throw new Ot89Error('Invalid privacy policy', { statusCode: 422, reasonCode: 'invalid_privacy_policy' });
  }
  if (event.privacy.contains_raw_secrets !== false || event.privacy.contains_direct_contact_details !== false) {
    throw new Ot89Error('Event claims unsafe private content', { statusCode: 422, reasonCode: 'privacy_invariant_failed' });
  }
  if (!Array.isArray(event.privacy.redacted_fields) || !Number.isInteger(event.privacy.redaction_count) || event.privacy.redaction_count < 0 || event.privacy.redaction_count > 1000) {
    throw new Ot89Error('Invalid privacy redaction metadata', { statusCode: 422, reasonCode: 'invalid_privacy_metadata' });
  }

  assertPlainObject(event.trace, 'event.trace');
  assertOnlyKeys(event.trace, ['correlation_id', 'request_id'], 'event.trace');
  assertStringField(event.trace.correlation_id, { field: 'event.trace.correlation_id', pattern: CORRELATION_ID_PATTERN });
  assertStringField(event.trace.request_id, { field: 'event.trace.request_id', pattern: CORRELATION_ID_PATTERN });
  return event;
}

function validateAuthorizationSemantics(event, { env = process.env } = {}) {
  if (event.actor.onetime_account_id !== event.authorization.account_id) {
    throw new Ot89Error('Authorization account does not match actor account', { statusCode: 403, reasonCode: 'authorization_account_mismatch' });
  }
  const occurred = Date.parse(event.occurred_at);
  const checked = Date.parse(event.authorization.checked_at);
  if ((occurred - checked) > 300000 || (checked - occurred) > 60000) {
    throw new Ot89Error('Authorization proof is not fresh for event occurrence', { statusCode: 403, reasonCode: 'authorization_freshness_failed' });
  }
  if (event.authorization.valid_until !== null) {
    const validUntil = Date.parse(event.authorization.valid_until);
    if (validUntil <= checked || validUntil < occurred) {
      throw new Ot89Error('Authorization validity window is expired for event', { statusCode: 403, reasonCode: 'authorization_valid_until_failed' });
    }
  }
  const allowedEnvironments = String(env.OT89_ALLOWED_PRODUCER_ENVIRONMENTS || 'development,staging,production')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (allowedEnvironments.length && !allowedEnvironments.includes(event.producer.environment)) {
    throw new Ot89Error('Producer environment is not allowed', { statusCode: 403, reasonCode: 'producer_environment_not_allowed' });
  }
  const allowedAccounts = String(env.OT89_ALLOWED_ONETIME_ACCOUNT_IDS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (allowedAccounts.length && !allowedAccounts.includes(event.actor.onetime_account_id)) {
    throw new Ot89Error('One Time account is not allowlisted', { statusCode: 403, reasonCode: 'account_not_allowlisted' });
  }
}

function sanitizeEventForStorage(event) {
  return {
    contract_version: event.contract_version,
    event_type: event.event_type,
    event_id: event.event_id,
    occurred_at: event.occurred_at,
    producer: { ...event.producer },
    submission: { ...event.submission },
    actor: { ...event.actor },
    authorization: {
      policy_version: event.authorization.policy_version,
      authenticated: event.authorization.authenticated,
      account_id: event.authorization.account_id,
      entitlement_product: event.authorization.entitlement_product,
      entitlement_id: event.authorization.entitlement_id,
      entitlement_status: event.authorization.entitlement_status,
      checked_at: event.authorization.checked_at,
      valid_until: event.authorization.valid_until,
    },
    ticket: {
      category: event.ticket.category,
      title: redactSupportText(event.ticket.title, 120),
      message: redactSupportText(event.ticket.message, 6000),
      reply_preference: event.ticket.reply_preference,
      issue_details: {
        steps_to_reproduce: event.ticket.issue_details.steps_to_reproduce.map((step) => redactSupportText(step, 500)),
        expected_behavior: event.ticket.issue_details.expected_behavior === null ? null : redactSupportText(event.ticket.issue_details.expected_behavior, 1500),
        actual_behavior: event.ticket.issue_details.actual_behavior === null ? null : redactSupportText(event.ticket.issue_details.actual_behavior, 1500),
        occurrence: event.ticket.issue_details.occurrence,
        first_observed_at: event.ticket.issue_details.first_observed_at,
        error_code: event.ticket.issue_details.error_code,
        provider: event.ticket.issue_details.provider,
      },
      client_context: { ...event.ticket.client_context },
    },
    attachments: event.attachments.map((attachment) => ({
      ...attachment,
      normalized_filename: safeFilename(attachment.normalized_filename),
      transfer_locator: attachment.transfer_locator,
      private_url_returned: false,
    })),
    privacy: {
      ...event.privacy,
      redacted_fields: [...event.privacy.redacted_fields],
    },
    trace: { ...event.trace },
  };
}

function immutablePayloadFingerprint(event) {
  const stable = {
    contract_version: event.contract_version,
    event_type: event.event_type,
    producer: event.producer,
    submission: event.submission,
    actor: event.actor,
    authorization: event.authorization,
    ticket: event.ticket,
    attachments: event.attachments,
    privacy: event.privacy,
  };
  return sha256Hex(stableStringify(stable));
}

function classifyTriage(event) {
  const details = event.ticket.issue_details;
  const text = `${event.ticket.title} ${event.ticket.message} ${details.expected_behavior || ''} ${details.actual_behavior || ''}`.toLowerCase();
  const concreteSteps = details.steps_to_reproduce.filter(Boolean).length;
  const hasExpectedActual = Boolean(details.expected_behavior && details.actual_behavior);
  const occurrenceKnown = ['always', 'intermittent'].includes(details.occurrence);
  const providerIncident = details.provider !== 'none' || ['access_login', 'class_zoom', 'billing'].includes(event.ticket.category);
  if (event.ticket.category === 'complaint') {
    return { class: 'COMPLAINT', confidence: 0.82, reason: 'Subscriber complaint category requires operator review.', severity: 'SEV2', bug_candidate: false, operator_decision_required: true, queue: 'support' };
  }
  if (providerIncident) {
    const severity = event.ticket.category === 'billing' || details.provider === 'payments' ? 'SEV1' : 'SEV2';
    return { class: 'ACCESS_PROVIDER_INCIDENT', confidence: 0.86, reason: 'Ticket points at access, class provider, billing, or external delivery incident.', severity, bug_candidate: false, operator_decision_required: true, queue: 'provider_or_admin' };
  }
  if (/\b(feature|please add|would like|wish|request)\b/.test(text)) {
    return { class: 'FEATURE_REQUEST', confidence: 0.78, reason: 'Ticket requests a product behavior change rather than a reproducible failure.', severity: 'SEV3', bug_candidate: false, operator_decision_required: true, queue: 'product_review' };
  }
  if (event.ticket.category === 'bug' && concreteSteps >= 2 && hasExpectedActual && occurrenceKnown && details.provider === 'none') {
    return { class: 'REPRODUCIBLE_BUG', confidence: 0.9, reason: 'Bug report includes reproducible steps, expected behavior, actual behavior, occurrence, and no stronger provider incident.', severity: details.occurrence === 'always' ? 'SEV1' : 'SEV2', bug_candidate: true, operator_decision_required: true, queue: 'technical_triage' };
  }
  return { class: 'AMBIGUOUS', confidence: 0.45, reason: 'Evidence is incomplete or low-confidence, so the ticket remains ambiguous.', severity: 'SEV3', bug_candidate: false, operator_decision_required: true, queue: 'support' };
}

function jerusalemParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: JERUSALEM_TZ,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const out = {};
  for (const part of parts) out[part.type] = part.value;
  return {
    weekday: out.weekday,
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour === '24' ? '0' : out.hour),
    minute: Number(out.minute),
    second: Number(out.second),
  };
}

function isBusinessMinute(date, holidays = []) {
  const parts = jerusalemParts(date);
  const dayKey = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  if (holidays.includes(dayKey)) return false;
  if (parts.weekday === 'Fri' || parts.weekday === 'Sat') return false;
  return parts.hour >= 9 && parts.hour < 18;
}

function addBusinessMinutes(start, minutes, { holidays = [] } = {}) {
  let cursor = new Date(start);
  let remaining = Math.max(0, Number(minutes || 0));
  while (!isBusinessMinute(cursor, holidays)) cursor = new Date(cursor.getTime() + 60 * 1000);
  while (remaining > 0) {
    cursor = new Date(cursor.getTime() + 60 * 1000);
    if (isBusinessMinute(cursor, holidays)) remaining -= 1;
  }
  return cursor;
}

function calculateSla({ severity = 'SEV3', receivedAt = new Date(), status = 'pending_operator', holidays = [] } = {}) {
  const minutesBySeverity = { SEV0: 60, SEV1: 4 * 60, SEV2: 24 * 60, SEV3: 72 * 60 };
  const dueAt = addBusinessMinutes(receivedAt, minutesBySeverity[severity] || minutesBySeverity.SEV3, { holidays });
  return {
    timezone: JERUSALEM_TZ,
    business_hours: 'Sunday-Thursday 09:00-18:00',
    severity,
    status,
    pauses_in_statuses: ['waiting_customer'],
    due_at: dueAt.toISOString(),
  };
}

function validateDiagnosticRequest(input = {}) {
  assertPlainObject(input, 'diagnostic');
  assertOnlyKeys(input, ['operation', 'parameters', 'limit'], 'diagnostic');
  if (!DIAGNOSTIC_OPERATION_SET.has(input.operation)) {
    throw new Ot89Error('Diagnostic operation is not allowlisted', { statusCode: 403, reasonCode: 'diagnostic_operation_forbidden' });
  }
  const params = input.parameters || {};
  assertPlainObject(params, 'diagnostic.parameters');
  const json = stableStringify(params);
  if (/[;&|`$<>]|\b(?:cmd|powershell|bash|sh|sql|select|insert|update|delete|drop|deploy|git|npm)\b/i.test(json)) {
    throw new Ot89Error('Diagnostic parameters contain forbidden command-like content', { statusCode: 403, reasonCode: 'diagnostic_parameter_forbidden' });
  }
  return {
    operation: input.operation,
    parameters: params,
    limit: Math.min(Math.max(Number(input.limit || 10), 1), 100),
    read_only: true,
  };
}

async function fetchAttachmentWithAdapter({ attachment, adapter, env = process.env } = {}) {
  if (!truthy(env.OT89_ATTACHMENT_FETCH_ENABLED)) {
    return { fetched: false, skipped: true, reason: 'attachment_fetch_disabled', attachment_id: attachment.attachment_id };
  }
  if (typeof adapter !== 'function') {
    throw new Ot89Error('Attachment adapter is not configured', { statusCode: 503, reasonCode: 'attachment_adapter_missing', retryable: true });
  }
  const result = await adapter({ attachment });
  if (!result || result.redirected) throw new Ot89Error('Attachment fetch redirects are forbidden', { statusCode: 502, reasonCode: 'attachment_redirect_forbidden', retryable: true });
  const body = Buffer.isBuffer(result.body) ? result.body : Buffer.from(result.body || '');
  if (body.length !== attachment.size_bytes || body.length > 5242880) throw new Ot89Error('Attachment size mismatch', { statusCode: 502, reasonCode: 'attachment_size_mismatch', retryable: true });
  if (sha256Hex(body) !== attachment.sha256) throw new Ot89Error('Attachment SHA mismatch', { statusCode: 502, reasonCode: 'attachment_sha_mismatch', retryable: true });
  const contentType = String(result.headers?.['content-type'] || result.headers?.['Content-Type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== attachment.media_type || !MEDIA_TYPES.has(contentType)) throw new Ot89Error('Attachment media type mismatch', { statusCode: 502, reasonCode: 'attachment_media_type_mismatch', retryable: true });
  const disposition = String(result.headers?.['content-disposition'] || result.headers?.['Content-Disposition'] || '').toLowerCase();
  const cacheControl = String(result.headers?.['cache-control'] || result.headers?.['Cache-Control'] || '').toLowerCase();
  const nosniff = String(result.headers?.['x-content-type-options'] || result.headers?.['X-Content-Type-Options'] || '').toLowerCase();
  if (!disposition.includes('attachment') || !cacheControl.includes('no-store') || nosniff !== 'nosniff') {
    throw new Ot89Error('Attachment private response headers are invalid', { statusCode: 502, reasonCode: 'attachment_private_headers_invalid', retryable: true });
  }
  return {
    fetched: true,
    attachment_id: attachment.attachment_id,
    sha256: attachment.sha256,
    media_type: attachment.media_type,
    bytes: body.length,
    private_storage: true,
    public_url_returned: false,
  };
}

function validateStatusRequestSchema(body) {
  assertPlainObject(body, 'status_request');
  assertOnlyKeys(body, ['source_ticket_id', 'onetime_account_id'], 'status_request');
  assertStringField(body.source_ticket_id, { field: 'status_request.source_ticket_id', pattern: SOURCE_TICKET_ID_PATTERN });
  assertStringField(body.onetime_account_id, { field: 'status_request.onetime_account_id', pattern: ACCOUNT_ID_PATTERN });
  return body;
}

function publicSummary(eventOrTicket = {}) {
  const title = eventOrTicket.ticket?.title || eventOrTicket.title || 'Support ticket';
  const message = eventOrTicket.ticket?.message || eventOrTicket.description || '';
  return compact(previewMessage(redactSupportText(`${title}. ${message}`, 500), 500), 500) || 'Support ticket received.';
}

function buildAlertPayload({ ticket, event, triage, sla, tokens = [] }) {
  return {
    alert_type: 'onetime_support_ticket',
    bna_ticket_ref: ticket.bna_ticket_ref,
    support_ticket_id: ticket.support_ticket_id || ticket.id || null,
    summary: publicSummary(event),
    category: event.ticket.category,
    severity: triage.severity,
    sla_due_at: sla.due_at,
    owner_queue: triage.queue,
    deep_link: `/operations/onetime/support-tickets/${encodeURIComponent(ticket.bna_ticket_ref)}`,
    raw_text_included: false,
    direct_contact_included: false,
    attachment_locator_included: false,
    decision_options: tokens.map((token) => ({
      label: token.label,
      action: token.action,
      token: token.token,
      expires_at: token.expires_at,
    })),
  };
}

function createDecisionTokens({ bnaTicketRef, ticketVersion = 1, actorScope = 'platform_super_admin', ttlMs = 30 * 60 * 1000, now = new Date() } = {}) {
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
  return [
    { action: 'keep_as_ticket', label: 'Keep as ticket' },
    { action: 'ask_for_details', label: 'Ask for details' },
    { action: 'reject', label: 'Reject' },
  ].map((option) => {
    const token = `otd_${base64url(crypto.randomBytes(24))}`;
    return {
      ...option,
      token,
      token_hash: sha256Hex(token),
      bna_ticket_ref: bnaTicketRef,
      ticket_version: ticketVersion,
      actor_scope: actorScope,
      expires_at: expiresAt,
      status: 'pending',
    };
  });
}

async function consumeDecisionToken({ token, actor = {}, store, now = new Date() } = {}) {
  if (!token || typeof store?.consumeDecisionToken !== 'function') {
    throw new Ot89Error('Decision token store is not configured', { statusCode: 503, reasonCode: 'decision_store_missing' });
  }
  const actorAllowed = actor.is_super_admin === true
    || String(actor.role || '').toLowerCase() === 'super_admin'
    || String(actor.username || '').toLowerCase() === String(process.env.OPS_USERNAME || '').toLowerCase();
  if (!actorAllowed) throw new Ot89Error('Wrong Telegram identity for decision token', { statusCode: 403, reasonCode: 'decision_wrong_identity' });
  return store.consumeDecisionToken({ token_hash: sha256Hex(token), actor, now });
}

function createMemoryStore({ idFactory = newBnaTicketRef } = {}) {
  const events = new Map();
  const sources = new Map();
  const nonces = new Map();
  const alerts = new Map();
  const decisions = new Map();
  let nextSupportTicketId = 1;

  return {
    async ensureSchema() {
      return { ok: true, mode: 'memory' };
    },
    async ingestEvent(input) {
      const nonceKey = `${input.key_id}:${input.nonce}`;
      const nowMs = input.received_at.getTime();
      const existingNonce = nonces.get(nonceKey);
      if (existingNonce && existingNonce > nowMs) {
        throw new Ot89Error('OT89 nonce replay rejected', { statusCode: 409, reasonCode: 'nonce_replay' });
      }
      nonces.set(nonceKey, nowMs + NONCE_RETENTION_SECONDS * 1000);

      const existingEvent = events.get(input.event.event_id);
      if (existingEvent) {
        if (existingEvent.body_fingerprint !== input.body_fingerprint) {
          throw new Ot89Error('OT89 event id collision', { statusCode: 409, reasonCode: 'event_id_collision' });
        }
        return { duplicate: true, ticket: existingEvent, statusCode: 200 };
      }
      const sourceExisting = sources.get(input.event.submission.source_ticket_id);
      if (sourceExisting) {
        if (sourceExisting.immutable_fingerprint !== input.immutable_fingerprint) {
          throw new Ot89Error('OT89 source ticket collision', { statusCode: 409, reasonCode: 'source_ticket_collision' });
        }
        events.set(input.event.event_id, sourceExisting);
        return { duplicate: true, ticket: sourceExisting, statusCode: 200 };
      }

      const bnaTicketRef = idFactory();
      const supportTicketId = nextSupportTicketId;
      nextSupportTicketId += 1;
      const tokenRecords = createDecisionTokens({
        bnaTicketRef,
        ticketVersion: 1,
        now: input.received_at,
      });
      for (const token of tokenRecords) decisions.set(token.token_hash, token);
      const ticket = {
        support_ticket_id: supportTicketId,
        id: supportTicketId,
        ticket_number: `OT-SUP-${String(supportTicketId).padStart(6, '0')}`,
        bna_ticket_ref: bnaTicketRef,
        event_id: input.event.event_id,
        source_ticket_id: input.event.submission.source_ticket_id,
        onetime_account_id: input.event.actor.onetime_account_id,
        status: 'pending_operator',
        status_version: 1,
        public_summary: publicSummary(input.sanitized_event),
        title: input.sanitized_event.ticket.title,
        description: input.sanitized_event.ticket.message,
        category: SUPPORT_CATEGORY_MAP[input.event.ticket.category] || 'other',
        severity: input.triage.severity,
        triage: input.triage,
        sla: input.sla,
        body_fingerprint: input.body_fingerprint,
        immutable_fingerprint: input.immutable_fingerprint,
        sanitized_event: input.sanitized_event,
        history: [{ event: 'created', status: 'pending_operator', at: input.received_at.toISOString() }],
        attachments: input.sanitized_event.attachments,
        alert_key: `support:new:${bnaTicketRef}:v1`,
        created_at: input.received_at.toISOString(),
        updated_at: input.received_at.toISOString(),
      };
      ticket.alert_payload = buildAlertPayload({ ticket, event: input.sanitized_event, triage: input.triage, sla: input.sla, tokens: tokenRecords });
      alerts.set(ticket.alert_key, {
        id: alerts.size + 1,
        alert_key: ticket.alert_key,
        bna_ticket_ref: bnaTicketRef,
        support_ticket_id: supportTicketId,
        status: 'pending',
        payload: ticket.alert_payload,
        attempts: 0,
        lease_generation: 0,
        lease_owner: null,
        lease_expires_at: null,
        last_attempt_at: null,
        next_attempt_at: input.received_at.toISOString(),
        last_error: null,
        safe_error: null,
        sent_at: null,
        dead_lettered_at: null,
        created_at: input.received_at.toISOString(),
        updated_at: input.received_at.toISOString(),
      });
      events.set(input.event.event_id, ticket);
      sources.set(input.event.submission.source_ticket_id, ticket);
      return { duplicate: false, ticket, statusCode: 202 };
    },
    async getStatus({ source_ticket_id, onetime_account_id }) {
      const ticket = sources.get(source_ticket_id);
      if (!ticket || ticket.onetime_account_id !== onetime_account_id) return null;
      return ticket;
    },
    async getOperatorTicket({ bna_ticket_ref }) {
      for (const ticket of events.values()) {
        if (ticket.bna_ticket_ref === bna_ticket_ref) return ticket;
      }
      return null;
    },
    async consumeDecisionToken({ token_hash, actor, now }) {
      const record = decisions.get(token_hash);
      if (!record) throw new Ot89Error('Decision token not found', { statusCode: 404, reasonCode: 'decision_token_not_found' });
      if (record.status !== 'pending') throw new Ot89Error('Decision token already used', { statusCode: 409, reasonCode: 'decision_duplicate_callback' });
      if (Date.parse(record.expires_at) <= now.getTime()) throw new Ot89Error('Decision token expired', { statusCode: 410, reasonCode: 'decision_token_expired' });
      record.status = 'used';
      record.decided_by = actor.username || actor.id || 'operator';
      record.decided_at = now.toISOString();
      return { success: true, action: record.action, bna_ticket_ref: record.bna_ticket_ref };
    },
    async listAlerts() {
      return [...alerts.values()];
    },
    async claimAlertBatch({ leaseOwner = 'memory-ot89b-alert-drain', batchSize = 10, leaseSeconds = ALERT_LEASE_SECONDS, now = new Date() } = {}) {
      const nowDateValue = now instanceof Date ? now : new Date(now);
      const claimed = [];
      for (const alert of alerts.values()) {
        if (claimed.length >= batchSize) break;
        const leaseExpired = alert.status === 'leased' && alert.lease_expires_at && Date.parse(alert.lease_expires_at) <= nowDateValue.getTime();
        const retryDue = alert.status === 'failed' && (!alert.next_attempt_at || Date.parse(alert.next_attempt_at) <= nowDateValue.getTime());
        if (alert.status !== 'pending' && !retryDue && !leaseExpired) continue;
        alert.status = 'leased';
        alert.attempts = clampNumber(alert.attempts, { min: 0 }) + 1;
        alert.lease_generation = clampNumber(alert.lease_generation, { min: 0 }) + 1;
        alert.lease_owner = leaseOwner;
        alert.lease_expires_at = new Date(nowDateValue.getTime() + leaseSeconds * 1000).toISOString();
        alert.last_attempt_at = nowDateValue.toISOString();
        alert.updated_at = nowDateValue.toISOString();
        claimed.push({ ...alert });
      }
      return claimed;
    },
    async markAlertSent({ alert_key, lease_owner, lease_generation, sent_at = new Date() } = {}) {
      const alert = alerts.get(alert_key);
      if (!alert || alert.status === 'sent') return { updated: false };
      if (Number(lease_generation) && Number(alert.lease_generation) !== Number(lease_generation)) return { updated: false };
      if (lease_owner && alert.lease_owner !== lease_owner) return { updated: false };
      const sentDate = sent_at instanceof Date ? sent_at : new Date(sent_at);
      alert.status = 'sent';
      alert.sent_at = sentDate.toISOString();
      alert.lease_owner = null;
      alert.lease_expires_at = null;
      alert.updated_at = sentDate.toISOString();
      return { updated: true };
    },
    async markAlertFailed({ alert_key, lease_owner, lease_generation, error, maxAttempts = ALERT_MAX_ATTEMPTS, now = new Date() } = {}) {
      const alert = alerts.get(alert_key);
      if (!alert || alert.status === 'sent' || alert.status === 'dead_letter') return { updated: false };
      if (Number(lease_generation) && Number(alert.lease_generation) !== Number(lease_generation)) return { updated: false };
      if (lease_owner && alert.lease_owner !== lease_owner) return { updated: false };
      const nowDateValue = now instanceof Date ? now : new Date(now);
      const safeError = safeAlertError(error);
      const deadLetter = !safeError.retryable || clampNumber(alert.attempts, { min: 0 }) >= maxAttempts;
      alert.status = deadLetter ? 'dead_letter' : 'failed';
      alert.last_error = safeError.message;
      alert.safe_error = safeError;
      alert.lease_owner = null;
      alert.lease_expires_at = null;
      alert.next_attempt_at = deadLetter ? null : new Date(nowDateValue.getTime() + alertBackoffSeconds(alert.attempts) * 1000).toISOString();
      alert.dead_lettered_at = deadLetter ? nowDateValue.toISOString() : null;
      alert.updated_at = nowDateValue.toISOString();
      return { updated: true, dead_letter: deadLetter };
    },
  };
}

function ot89BridgeSchemaSql() {
  return `
CREATE TABLE IF NOT EXISTS bna_onetime_support_nonces (
  id SERIAL PRIMARY KEY,
  key_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key_id, nonce)
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  source_ticket_id TEXT NOT NULL UNIQUE,
  body_fingerprint TEXT NOT NULL,
  immutable_fingerprint TEXT NOT NULL,
  bna_ticket_ref TEXT NOT NULL UNIQUE,
  support_ticket_id INTEGER REFERENCES bna_support_tickets(id) ON DELETE SET NULL,
  onetime_account_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_operator',
  status_version INTEGER NOT NULL DEFAULT 1,
  public_summary TEXT NOT NULL,
  triage JSONB NOT NULL DEFAULT '{}'::jsonb,
  sla JSONB NOT NULL DEFAULT '{}'::jsonb,
  sanitized_event JSONB NOT NULL DEFAULT '{}'::jsonb,
  trace JSONB NOT NULL DEFAULT '{}'::jsonb,
  audit JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_history (
  id SERIAL PRIMARY KEY,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  status TEXT NOT NULL,
  transition TEXT NOT NULL,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_attachment_refs (
  id SERIAL PRIMARY KEY,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  attachment_id TEXT NOT NULL,
  normalized_filename TEXT NOT NULL,
  media_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  transfer_locator TEXT NOT NULL,
  fetch_state TEXT NOT NULL DEFAULT 'not_fetched',
  private_storage_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bna_ticket_ref, attachment_id)
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_alert_outbox (
  id SERIAL PRIMARY KEY,
  alert_key TEXT NOT NULL UNIQUE,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  support_ticket_id INTEGER REFERENCES bna_support_tickets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'leased', 'sent', 'failed', 'dead_letter')),
  attempts INTEGER NOT NULL DEFAULT 0,
  lease_owner TEXT,
  lease_generation INTEGER NOT NULL DEFAULT 0,
  lease_expires_at TIMESTAMP,
  next_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_attempt_at TIMESTAMP,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  safe_error JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP,
  dead_lettered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_onetime_support_alert_outbox
  ADD COLUMN IF NOT EXISTS lease_owner TEXT;
ALTER TABLE bna_onetime_support_alert_outbox
  ADD COLUMN IF NOT EXISTS lease_generation INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bna_onetime_support_alert_outbox
  ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMP;
ALTER TABLE bna_onetime_support_alert_outbox
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bna_onetime_support_alert_outbox
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP;
ALTER TABLE bna_onetime_support_alert_outbox
  ADD COLUMN IF NOT EXISTS safe_error JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE bna_onetime_support_alert_outbox
  ADD COLUMN IF NOT EXISTS dead_lettered_at TIMESTAMP;
ALTER TABLE bna_onetime_support_alert_outbox
  DROP CONSTRAINT IF EXISTS bna_onetime_support_alert_outbox_status_check;
UPDATE bna_onetime_support_alert_outbox
SET status = 'leased'
WHERE status = 'claimed';
ALTER TABLE bna_onetime_support_alert_outbox
  ADD CONSTRAINT bna_onetime_support_alert_outbox_status_check
  CHECK (status IN ('pending', 'leased', 'sent', 'failed', 'dead_letter'));

CREATE TABLE IF NOT EXISTS bna_onetime_support_decision_tokens (
  id SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('keep_as_ticket', 'ask_for_details', 'reject')),
  ticket_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'denied')),
  actor_scope TEXT NOT NULL DEFAULT 'platform_super_admin',
  expires_at TIMESTAMP NOT NULL,
  decided_by TEXT,
  decided_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_events_status ON bna_onetime_support_events(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_events_account ON bna_onetime_support_events(onetime_account_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_nonces_expiry ON bna_onetime_support_nonces(expires_at);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_alert_claim ON bna_onetime_support_alert_outbox(status, created_at);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_alert_retry ON bna_onetime_support_alert_outbox(status, next_attempt_at, created_at);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_alert_lease ON bna_onetime_support_alert_outbox(status, lease_expires_at);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_history_ref ON bna_onetime_support_history(bna_ticket_ref, created_at);
`;
}

function createPgStore(pool) {
  if (!pool) return null;
  async function ensureSchema(db = pool) {
    await db.query(ot89BridgeSchemaSql());
    return { ok: true, mode: 'postgres' };
  }
  return {
    ensureSchema,
    async ingestEvent(input) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await ensureSchema(client);
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [input.event.event_id]);
        await client.query('DELETE FROM bna_onetime_support_nonces WHERE expires_at < NOW()');
        const nonceInsert = await client.query(
          `INSERT INTO bna_onetime_support_nonces (key_id, nonce, expires_at)
           VALUES ($1, $2, NOW() + ($3 || ' seconds')::interval)
           ON CONFLICT (key_id, nonce) DO NOTHING
           RETURNING id`,
          [input.key_id, input.nonce, NONCE_RETENTION_SECONDS]
        );
        if (!nonceInsert.rows.length) {
          await client.query('ROLLBACK');
          throw new Ot89Error('OT89 nonce replay rejected', { statusCode: 409, reasonCode: 'nonce_replay' });
        }
        const existing = (await client.query(
          `SELECT * FROM bna_onetime_support_events WHERE event_id = $1 FOR UPDATE`,
          [input.event.event_id]
        )).rows[0];
        if (existing) {
          await client.query('COMMIT');
          if (existing.body_fingerprint !== input.body_fingerprint) {
            throw new Ot89Error('OT89 event id collision', { statusCode: 409, reasonCode: 'event_id_collision' });
          }
          return { duplicate: true, ticket: pgTicketView(existing), statusCode: 200 };
        }
        const sourceExisting = (await client.query(
          `SELECT * FROM bna_onetime_support_events WHERE source_ticket_id = $1 FOR UPDATE`,
          [input.event.submission.source_ticket_id]
        )).rows[0];
        if (sourceExisting) {
          if (sourceExisting.immutable_fingerprint !== input.immutable_fingerprint) {
            await client.query('ROLLBACK');
            throw new Ot89Error('OT89 source ticket collision', { statusCode: 409, reasonCode: 'source_ticket_collision' });
          }
          await client.query('COMMIT');
          return { duplicate: true, ticket: pgTicketView(sourceExisting), statusCode: 200 };
        }

        const bnaTicketRef = newBnaTicketRef();
        const project = (await client.query(
          `SELECT id, project_key FROM bna_projects WHERE project_key = 'one_time_mishnah_class' ORDER BY id LIMIT 1`
        )).rows[0] || {};
        const ticketInsert = await client.query(
          `INSERT INTO bna_support_tickets (
             project_id, title, description, severity, status, category,
             reporter_name, reporter_role, assigned_to, source, ticket_number,
             workspace_key, project_key, requester_user_key, requester_role, page_path,
             authenticated_context, notification_state, staff_reply_state, source_context, created_by
           )
           VALUES ($1, $2, $3, $4, 'awaiting_super_admin_approval', $5,
             'One Time subscriber', 'member', 'Shloimie', 'api', NULL,
             'rabbi_sheller_provider', 'one_time_mishnah_class', $6, 'member', $7,
             $8::jsonb, 'outbox_pending', 'internal_only', $9::jsonb, 'ot89b-consumer')
           RETURNING *`,
          [
            project.id || null,
            input.sanitized_event.ticket.title,
            input.sanitized_event.ticket.message,
            input.triage.severity === 'SEV1' || input.triage.severity === 'SEV0' ? 'high' : 'normal',
            SUPPORT_CATEGORY_MAP[input.event.ticket.category] || 'other',
            input.event.actor.onetime_user_id,
            input.sanitized_event.ticket.client_context.route_template,
            JSON.stringify({
              source: 'ot89b_onetime_support_consumer',
              authenticated: true,
              entitlement_product: 'one_time',
              onetime_account_id: input.event.actor.onetime_account_id,
              no_contact_details_returned: true,
              raw_text_inert: true,
            }),
            JSON.stringify({
              source: 'ot89b_onetime_support_consumer',
              bna_ticket_ref: bnaTicketRef,
              event_id: input.event.event_id,
              source_ticket_id: input.event.submission.source_ticket_id,
              body_fingerprint: input.body_fingerprint,
              immutable_fingerprint: input.immutable_fingerprint,
              triage: input.triage,
              sla: input.sla,
              approval_gate: 'super_admin_required_before_codex',
              codex_job_created_initially: false,
              suppress_automatic_task_creation: true,
              raw_text_inert: true,
              external_write_performed: false,
            }),
          ]
        );
        const supportTicket = ticketInsert.rows[0];
        const ticketNumber = `OT-SUP-${String(supportTicket.id).padStart(6, '0')}`;
        await client.query(`UPDATE bna_support_tickets SET ticket_number = $2 WHERE id = $1 AND ticket_number IS NULL`, [supportTicket.id, ticketNumber]);
        const statusSummary = publicSummary(input.sanitized_event);
        await client.query(
          `INSERT INTO bna_onetime_support_events (
             event_id, source_ticket_id, body_fingerprint, immutable_fingerprint, bna_ticket_ref,
             support_ticket_id, onetime_account_id, status, status_version, public_summary,
             triage, sla, sanitized_event, trace, audit
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_operator', 1, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb)`,
          [
            input.event.event_id,
            input.event.submission.source_ticket_id,
            input.body_fingerprint,
            input.immutable_fingerprint,
            bnaTicketRef,
            supportTicket.id,
            input.event.actor.onetime_account_id,
            statusSummary,
            JSON.stringify(input.triage),
            JSON.stringify(input.sla),
            JSON.stringify(input.sanitized_event),
            JSON.stringify(input.event.trace),
            JSON.stringify({ key_id: input.key_id, received_at: input.received_at.toISOString(), raw_body_sha256: input.raw_body_sha256 }),
          ]
        );
        await client.query(
          `INSERT INTO bna_onetime_support_history (bna_ticket_ref, status, transition, summary, metadata)
           VALUES ($1, 'pending_operator', 'created', $2, $3::jsonb)`,
          [bnaTicketRef, 'Imported One Time support ticket and queued operator alert.', JSON.stringify({ event_id: input.event.event_id })]
        );
        for (const attachment of input.sanitized_event.attachments) {
          await client.query(
            `INSERT INTO bna_onetime_support_attachment_refs (
               bna_ticket_ref, attachment_id, normalized_filename, media_type, size_bytes, sha256, transfer_locator, private_storage_metadata
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
             ON CONFLICT (bna_ticket_ref, attachment_id) DO NOTHING`,
            [bnaTicketRef, attachment.attachment_id, attachment.normalized_filename, attachment.media_type, attachment.size_bytes, attachment.sha256, attachment.transfer_locator, JSON.stringify({ public_url: false, fetch_state: 'not_fetched' })]
          );
        }
        const tokenRecords = createDecisionTokens({ bnaTicketRef, ticketVersion: 1, now: input.received_at });
        for (const token of tokenRecords) {
          await client.query(
            `INSERT INTO bna_onetime_support_decision_tokens (token_hash, bna_ticket_ref, action, ticket_version, actor_scope, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [token.token_hash, bnaTicketRef, token.action, token.ticket_version, token.actor_scope, token.expires_at]
          );
        }
        const eventForAlert = { ...input.sanitized_event };
        const ticketForAlert = { ...supportTicket, id: supportTicket.id, ticket_number: ticketNumber, bna_ticket_ref: bnaTicketRef, support_ticket_id: supportTicket.id };
        const alertPayload = buildAlertPayload({ ticket: ticketForAlert, event: eventForAlert, triage: input.triage, sla: input.sla, tokens: tokenRecords });
        await client.query(
          `INSERT INTO bna_onetime_support_alert_outbox (alert_key, bna_ticket_ref, support_ticket_id, payload)
           VALUES ($1, $2, $3, $4::jsonb)
           ON CONFLICT (alert_key) DO NOTHING`,
          [`support:new:${bnaTicketRef}:v1`, bnaTicketRef, supportTicket.id, JSON.stringify(alertPayload)]
        );
        await client.query('COMMIT');
        return {
          duplicate: false,
          ticket: {
            support_ticket_id: supportTicket.id,
            id: supportTicket.id,
            ticket_number: ticketNumber,
            bna_ticket_ref: bnaTicketRef,
            source_ticket_id: input.event.submission.source_ticket_id,
            status: 'pending_operator',
            status_version: 1,
            public_summary: statusSummary,
            triage: input.triage,
            sla: input.sla,
            alert_payload: alertPayload,
          },
          statusCode: 202,
        };
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch {}
        throw error;
      } finally {
        client.release();
      }
    },
    async getStatus({ source_ticket_id, onetime_account_id }) {
      await ensureSchema(pool);
      const row = (await pool.query(
        `SELECT * FROM bna_onetime_support_events
         WHERE source_ticket_id = $1 AND onetime_account_id = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [source_ticket_id, onetime_account_id]
      )).rows[0];
      return row ? pgTicketView(row) : null;
    },
    async getOperatorTicket({ bna_ticket_ref }) {
      await ensureSchema(pool);
      const row = (await pool.query(
        `SELECT e.*, st.ticket_number, st.title, st.description, st.category, st.severity AS support_severity,
                st.status AS support_status, st.assigned_to, st.source_context,
                COALESCE(history.items, '[]'::jsonb) AS history,
                COALESCE(attachments.items, '[]'::jsonb) AS attachments
         FROM bna_onetime_support_events e
         LEFT JOIN bna_support_tickets st ON st.id = e.support_ticket_id
         LEFT JOIN LATERAL (
           SELECT jsonb_agg(jsonb_build_object('status', h.status, 'transition', h.transition, 'summary', h.summary, 'created_at', h.created_at) ORDER BY h.created_at) AS items
           FROM bna_onetime_support_history h
           WHERE h.bna_ticket_ref = e.bna_ticket_ref
         ) history ON true
         LEFT JOIN LATERAL (
           SELECT jsonb_agg(jsonb_build_object('attachment_id', a.attachment_id, 'normalized_filename', a.normalized_filename, 'media_type', a.media_type, 'size_bytes', a.size_bytes, 'fetch_state', a.fetch_state) ORDER BY a.created_at) AS items
           FROM bna_onetime_support_attachment_refs a
           WHERE a.bna_ticket_ref = e.bna_ticket_ref
         ) attachments ON true
         WHERE e.bna_ticket_ref = $1
         LIMIT 1`,
        [bna_ticket_ref]
      )).rows[0];
      return row ? pgTicketView(row) : null;
    },
    async consumeDecisionToken({ token_hash, actor, now }) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const row = (await client.query(
          `SELECT * FROM bna_onetime_support_decision_tokens WHERE token_hash = $1 FOR UPDATE`,
          [token_hash]
        )).rows[0];
        if (!row) {
          await client.query('ROLLBACK');
          throw new Ot89Error('Decision token not found', { statusCode: 404, reasonCode: 'decision_token_not_found' });
        }
        if (row.status !== 'pending') {
          await client.query('ROLLBACK');
          throw new Ot89Error('Decision token already used', { statusCode: 409, reasonCode: 'decision_duplicate_callback' });
        }
        if (new Date(row.expires_at).getTime() <= now.getTime()) {
          await client.query(`UPDATE bna_onetime_support_decision_tokens SET status = 'expired' WHERE id = $1`, [row.id]);
          await client.query('COMMIT');
          throw new Ot89Error('Decision token expired', { statusCode: 410, reasonCode: 'decision_token_expired' });
        }
        await client.query(
          `UPDATE bna_onetime_support_decision_tokens
           SET status = 'used', decided_by = $2, decided_at = NOW()
           WHERE id = $1`,
          [row.id, actor.username || actor.id || 'operator']
        );
        await client.query(
          `INSERT INTO bna_onetime_support_history (bna_ticket_ref, status, transition, summary, metadata)
           VALUES ($1, 'pending_operator', 'decision_callback', $2, $3::jsonb)`,
          [row.bna_ticket_ref, `Operator selected ${row.action}.`, JSON.stringify({ action: row.action, actor: actor.username || actor.id || 'operator' })]
        );
        await client.query('COMMIT');
        return { success: true, action: row.action, bna_ticket_ref: row.bna_ticket_ref };
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch {}
        throw error;
      } finally {
        client.release();
      }
    },
    async listAlerts() {
      await ensureSchema(pool);
      const result = await pool.query(
        `SELECT * FROM bna_onetime_support_alert_outbox
         ORDER BY created_at ASC, id ASC
         LIMIT 100`
      );
      return result.rows;
    },
    async claimAlertBatch({ leaseOwner = 'ot89b-alert-drain', batchSize = 10, leaseSeconds = ALERT_LEASE_SECONDS, now = new Date() } = {}) {
      await ensureSchema(pool);
      const client = await pool.connect();
      const boundedBatchSize = clampNumber(batchSize, { min: 1, max: 25, fallback: 10 });
      const boundedLeaseSeconds = clampNumber(leaseSeconds, { min: 30, max: 15 * 60, fallback: ALERT_LEASE_SECONDS });
      const leaseOwnerText = compact(leaseOwner || 'ot89b-alert-drain', 120);
      try {
        await client.query('BEGIN');
        const result = await client.query(
          `WITH candidates AS (
             SELECT id
             FROM bna_onetime_support_alert_outbox
             WHERE (
                status IN ('pending', 'failed')
                AND COALESCE(next_attempt_at, created_at) <= NOW()
             ) OR (
                status = 'leased'
                AND lease_expires_at IS NOT NULL
                AND lease_expires_at <= NOW()
             )
             ORDER BY id ASC
             LIMIT $1
             FOR UPDATE SKIP LOCKED
           )
           UPDATE bna_onetime_support_alert_outbox outbox
           SET status = 'leased',
               attempts = attempts + 1,
               lease_owner = $2,
               lease_generation = lease_generation + 1,
               lease_expires_at = NOW() + ($3 || ' seconds')::interval,
               last_attempt_at = NOW(),
               updated_at = NOW()
           FROM candidates
           WHERE outbox.id = candidates.id
           RETURNING outbox.*`,
          [boundedBatchSize, leaseOwnerText, boundedLeaseSeconds]
        );
        await client.query('COMMIT');
        return result.rows;
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch {}
        throw error;
      } finally {
        client.release();
      }
    },
    async markAlertSent({ id, alert_key, lease_owner, lease_generation, sent_at = new Date() } = {}) {
      await ensureSchema(pool);
      const result = await pool.query(
        `UPDATE bna_onetime_support_alert_outbox
         SET status = 'sent',
             sent_at = COALESCE($4::timestamp, NOW()),
             lease_owner = NULL,
             lease_expires_at = NULL,
             updated_at = NOW()
         WHERE ($1::integer IS NULL OR id = $1)
           AND ($2::text IS NULL OR alert_key = $2)
           AND ($3::integer IS NULL OR lease_generation = $3)
           AND ($5::text IS NULL OR lease_owner = $5)
           AND status <> 'sent'
         RETURNING *`,
        [id || null, alert_key || null, lease_generation || null, sent_at instanceof Date ? sent_at.toISOString() : sent_at || null, lease_owner || null]
      );
      return { updated: Boolean(result.rows.length), alert: result.rows[0] || null, lease_owner };
    },
    async markAlertFailed({ id, alert_key, lease_owner, lease_generation, error, maxAttempts = ALERT_MAX_ATTEMPTS, now = new Date() } = {}) {
      await ensureSchema(pool);
      const safeError = safeAlertError(error);
      const nowIso = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
      const result = await pool.query(
        `WITH current_alert AS (
           SELECT *,
                  (attempts >= $5 OR $6::boolean = FALSE) AS should_dead_letter
           FROM bna_onetime_support_alert_outbox
           WHERE ($1::integer IS NULL OR id = $1)
             AND ($2::text IS NULL OR alert_key = $2)
             AND ($3::integer IS NULL OR lease_generation = $3)
             AND ($10::text IS NULL OR lease_owner = $10)
             AND status NOT IN ('sent', 'dead_letter')
           LIMIT 1
         )
         UPDATE bna_onetime_support_alert_outbox outbox
         SET status = CASE WHEN current_alert.should_dead_letter THEN 'dead_letter' ELSE 'failed' END,
             last_error = $4,
             safe_error = $7::jsonb,
             next_attempt_at = CASE
               WHEN current_alert.should_dead_letter THEN NULL
               ELSE $8::timestamp + ((LEAST($9::integer, 60 * POWER(2, LEAST(GREATEST(current_alert.attempts, 1) - 1, 8)))::integer || ' seconds')::interval)
             END,
             dead_lettered_at = CASE WHEN current_alert.should_dead_letter THEN $8::timestamp ELSE NULL END,
             lease_owner = NULL,
             lease_expires_at = NULL,
             updated_at = NOW()
         FROM current_alert
         WHERE outbox.id = current_alert.id
         RETURNING outbox.*`,
        [
          id || null,
          alert_key || null,
          lease_generation || null,
          safeError.message,
          clampNumber(maxAttempts, { min: 1, max: 100, fallback: ALERT_MAX_ATTEMPTS }),
          safeError.retryable,
          JSON.stringify(safeError),
          nowIso,
          ALERT_MAX_BACKOFF_SECONDS,
          lease_owner || null,
        ]
      );
      return { updated: Boolean(result.rows.length), dead_letter: result.rows[0]?.status === 'dead_letter', alert: result.rows[0] || null };
    },
  };
}

function pgTicketView(row = {}) {
  const sanitized = row.sanitized_event || {};
  return {
    support_ticket_id: row.support_ticket_id || null,
    id: row.support_ticket_id || row.id || null,
    ticket_number: row.ticket_number || null,
    bna_ticket_ref: row.bna_ticket_ref,
    event_id: row.event_id,
    source_ticket_id: row.source_ticket_id,
    onetime_account_id: row.onetime_account_id,
    status: STATUS_MAP[row.support_status] || row.status || 'pending_operator',
    support_status: row.support_status || null,
    status_version: Number(row.status_version || 1),
    public_summary: row.public_summary || publicSummary(sanitized),
    title: row.title || sanitized.ticket?.title || '',
    description: row.description || sanitized.ticket?.message || '',
    category: row.category || sanitized.ticket?.category || 'other',
    severity: row.support_severity || row.triage?.severity || 'normal',
    triage: row.triage || {},
    sla: row.sla || {},
    sanitized_event: sanitized,
    history: row.history || [],
    attachments: row.attachments || sanitized.attachments || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function ingestSignedSupportEvent({ reqLike, rawBody, env = process.env, store, now = Date.now() } = {}) {
  if (!truthy(env.OT89_INGRESS_ENABLED)) {
    throw new Ot89Error('OT89 ingress is disabled', { statusCode: 503, reasonCode: 'ingress_disabled', retryable: true });
  }
  if (!store || typeof store.ingestEvent !== 'function') {
    throw new Ot89Error('OT89 event store is unavailable', { statusCode: 503, reasonCode: 'store_unavailable', retryable: true });
  }
  const verification = verifySignedRequest({ reqLike, rawBody, expectedPath: EVENT_PATH, env, now });
  const parsed = parseJsonStrict(rawBody);
  validateSupportEventSchema(parsed);
  if (verification.event_id !== parsed.event_id) {
    throw new Ot89Error('OT89 header event id does not match body event id', { statusCode: 422, reasonCode: 'event_id_header_body_mismatch' });
  }
  validateAuthorizationSemantics(parsed, { env });
  const sanitizedEvent = sanitizeEventForStorage(parsed);
  const triage = classifyTriage(sanitizedEvent);
  if (!TRIAGE_CLASSES.has(triage.class)) throw new Error('Internal triage class invariant failed');
  const receivedAt = nowDate({ now: () => Number(now) });
  const sla = calculateSla({ severity: triage.severity, receivedAt, holidays: String(env.OT89_BUSINESS_HOLIDAYS || '').split(',').map((item) => item.trim()).filter(Boolean) });
  const result = await store.ingestEvent({
    key_id: verification.key_id,
    nonce: verification.nonce,
    raw_body_sha256: verification.raw_body_sha256,
    body_fingerprint: verification.raw_body_sha256,
    immutable_fingerprint: immutablePayloadFingerprint(sanitizedEvent),
    event: parsed,
    sanitized_event: sanitizedEvent,
    triage,
    sla,
    received_at: receivedAt,
  });
  const ticket = result.ticket;
  return {
    statusCode: result.statusCode || (result.duplicate ? 200 : 202),
    body: {
      accepted: true,
      duplicate: Boolean(result.duplicate),
      event_id: parsed.event_id,
      source_ticket_id: parsed.submission.source_ticket_id,
      bna_ticket_ref: ticket.bna_ticket_ref,
      ingestion_status: result.duplicate ? 'duplicate' : 'accepted',
      status_version: ticket.status_version || 1,
      received_at: receivedAt.toISOString(),
    },
  };
}

async function handleSignedStatusRequest({ reqLike, rawBody, env = process.env, store, now = Date.now() } = {}) {
  if (!truthy(env.OT89_STATUS_SEAM_ENABLED || env.OT89_INGRESS_ENABLED)) {
    throw new Ot89Error('OT89 status seam is disabled', { statusCode: 503, reasonCode: 'status_seam_disabled', retryable: true });
  }
  if (!store || typeof store.getStatus !== 'function') {
    throw new Ot89Error('OT89 status store is unavailable', { statusCode: 503, reasonCode: 'store_unavailable', retryable: true });
  }
  verifySignedRequest({ reqLike, rawBody, expectedPath: STATUS_PATH, env, now });
  const body = validateStatusRequestSchema(parseJsonStrict(rawBody));
  const ticket = await store.getStatus(body);
  if (!ticket) throw new Ot89Error('OT89 ticket status not found', { statusCode: 404, reasonCode: 'status_ticket_not_found' });
  return {
    statusCode: 200,
    body: {
      source_ticket_id: body.source_ticket_id,
      bna_ticket_ref: ticket.bna_ticket_ref,
      status: STATUS_VALUES.has(ticket.status) ? ticket.status : 'pending_operator',
      public_summary: compact(ticket.public_summary || publicSummary(ticket), 500),
      status_version: Number(ticket.status_version || 1),
      updated_at: new Date(ticket.updated_at || ticket.created_at || Date.now()).toISOString(),
    },
  };
}

async function drainAlertOutbox({
  store,
  sender = null,
  env = process.env,
  leaseOwner = 'ot89b-alert-drain',
  batchSize = 10,
  leaseSeconds = ALERT_LEASE_SECONDS,
  maxAttempts = ALERT_MAX_ATTEMPTS,
  now = new Date(),
} = {}) {
  const gate = telegramDrainGate({ env });
  if (!gate.ok) {
    return { attempted: false, sent: 0, failed: 0, dead_lettered: 0, skipped: true, reason: gate.reason };
  }
  if (!store || typeof store.claimAlertBatch !== 'function') {
    return { attempted: false, sent: 0, failed: 0, dead_lettered: 0, skipped: true, reason: 'alert_store_unavailable' };
  }
  const nowDateValue = now instanceof Date ? now : new Date(now);
  const alerts = await store.claimAlertBatch({ leaseOwner, batchSize, leaseSeconds, now: nowDateValue });
  let sent = 0;
  let failed = 0;
  let deadLettered = 0;
  for (const alert of alerts) {
    try {
      let sendResult = null;
      if (sender) {
        sendResult = await sender(alert.payload, alert);
      } else {
        sendResult = await notifySuperAdminSupportTicket({
          ticket: {
            id: alert.payload.support_ticket_id,
            ticket_number: alert.payload.bna_ticket_ref,
            title: alert.payload.summary,
            severity: alert.payload.severity,
            category: alert.payload.category,
            workspace_key: 'rabbi_sheller_provider',
            project_key: 'one_time_mishnah_class',
          },
          context: {
            source: 'ot89b_alert_outbox',
            reviewPath: alert.payload.deep_link,
            requested_result: 'Review One Time subscriber support ticket.',
          },
        });
      }
      if (sendResult && sendResult.sent === false) {
        throw new Ot89Error('Telegram alert sender did not send', {
          statusCode: 503,
          reasonCode: compact(sendResult.blocker || 'telegram_alert_not_sent', 100).replace(/[^a-z0-9_:-]/gi, '_'),
          retryable: true,
        });
      }
      if (typeof store.markAlertSent === 'function') {
        await store.markAlertSent({
          id: alert.id,
          alert_key: alert.alert_key,
          lease_owner: alert.lease_owner || leaseOwner,
          lease_generation: alert.lease_generation,
          sent_at: nowDateValue,
        });
      }
      sent += 1;
    } catch (error) {
      failed += 1;
      if (typeof store.markAlertFailed === 'function') {
        const result = await store.markAlertFailed({
          id: alert.id,
          alert_key: alert.alert_key,
          lease_owner: alert.lease_owner || leaseOwner,
          lease_generation: alert.lease_generation,
          error,
          maxAttempts,
          now: nowDateValue,
        });
        if (result?.dead_letter) deadLettered += 1;
      }
    }
  }
  return { attempted: true, claimed: alerts.length, sent, failed, dead_lettered: deadLettered, skipped: false };
}

function errorResponse(error) {
  if (error instanceof Ot89Error) {
    return {
      statusCode: error.statusCode,
      body: {
        accepted: false,
        error: error.reasonCode,
        retryable: Boolean(error.retryable),
        correlation_id: crypto.randomUUID(),
      },
    };
  }
  return {
    statusCode: 500,
    body: {
      accepted: false,
      error: 'internal_error',
      retryable: true,
      correlation_id: crypto.randomUUID(),
    },
  };
}

function operatorTicketView(ticket = {}) {
  return {
    bna_ticket_ref: ticket.bna_ticket_ref,
    support_ticket_id: ticket.support_ticket_id || ticket.id || null,
    ticket_number: ticket.ticket_number || null,
    source_ticket_id: ticket.source_ticket_id || null,
    status: ticket.status || 'pending_operator',
    status_version: Number(ticket.status_version || 1),
    public_summary: compact(ticket.public_summary || publicSummary(ticket), 500),
    category: ticket.sanitized_event?.ticket?.category || ticket.category || 'other',
    classification: ticket.triage?.class || 'AMBIGUOUS',
    confidence: Number(ticket.triage?.confidence || 0),
    classification_reason: compact(ticket.triage?.reason || '', 500),
    severity: ticket.triage?.severity || ticket.severity || 'SEV3',
    sla: ticket.sla || {},
    owner_queue: ticket.triage?.queue || 'support',
    attachment_status: (ticket.attachments || []).map((attachment) => ({
      attachment_id: attachment.attachment_id,
      filename: attachment.normalized_filename,
      media_type: attachment.media_type,
      size_bytes: attachment.size_bytes,
      fetch_state: attachment.fetch_state || 'not_fetched',
    })),
    history: (ticket.history || []).slice(-50),
    private_fields_returned: false,
    direct_contact_returned: false,
    raw_attachment_locator_returned: false,
  };
}

function installOneTimeSupportConsumerRoutes({ app, express, pool, requireAdmin, publicDir = path.resolve(__dirname, '../../../public'), env = process.env } = {}) {
  if (!app || !express) return null;
  const store = createPgStore(pool);
  const rawParser = express.raw({ type: () => true, limit: MAX_BODY_BYTES });

  app.post(EVENT_PATH, rawParser, async (req, res) => {
    try {
      const result = await ingestSignedSupportEvent({
        reqLike: req,
        rawBody: req.body,
        env,
        store,
        now: Date.now(),
      });
      res.status(result.statusCode).json(result.body);
    } catch (error) {
      const response = errorResponse(error);
      res.status(response.statusCode).json(response.body);
    }
  });

  app.post(STATUS_PATH, rawParser, async (req, res) => {
    try {
      const result = await handleSignedStatusRequest({
        reqLike: req,
        rawBody: req.body,
        env,
        store,
        now: Date.now(),
      });
      res.status(result.statusCode).json(result.body);
    } catch (error) {
      const response = errorResponse(error);
      res.status(response.statusCode).json(response.body);
    }
  });

  if (typeof requireAdmin === 'function') {
    app.get(OPERATOR_API_PATH, requireAdmin, async (req, res) => {
      try {
        if (!BNA_REF_PATTERN.test(String(req.params.bnaTicketRef || ''))) {
          return res.status(404).json({ error: 'ticket_not_found' });
        }
        const ticket = await store.getOperatorTicket({ bna_ticket_ref: req.params.bnaTicketRef });
        if (!ticket) return res.status(404).json({ error: 'ticket_not_found' });
        res.json({ ticket: operatorTicketView(ticket) });
      } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.reasonCode || 'operator_ticket_error' });
      }
    });

    app.get(OPERATOR_VIEW_PATH, requireAdmin, (req, res) => {
      res.sendFile(path.join(publicDir, 'onetime-support-ticket.html'));
    });
  }

  return { store, paths: { EVENT_PATH, STATUS_PATH, OPERATOR_API_PATH, OPERATOR_VIEW_PATH } };
}

module.exports = {
  BNA_REF_PATTERN,
  CONTRACT_VERSION,
  DIAGNOSTIC_OPERATION_CODES,
  ALERT_LEASE_SECONDS,
  ALERT_MAX_ATTEMPTS,
  EVENT_PATH,
  EVENT_TYPE,
  MAX_BODY_BYTES,
  NONCE_RETENTION_SECONDS,
  OPERATOR_API_PATH,
  OPERATOR_VIEW_PATH,
  STATUS_PATH,
  TIMESTAMP_SKEW_SECONDS,
  Ot89Error,
  alertBackoffSeconds,
  buildAlertPayload,
  calculateSla,
  canonicalString,
  classifyTriage,
  consumeDecisionToken,
  createDecisionTokens,
  createMemoryStore,
  createPgStore,
  drainAlertOutbox,
  errorResponse,
  fetchAttachmentWithAdapter,
  handleSignedStatusRequest,
  hmacSha256Hex,
  immutablePayloadFingerprint,
  ingestSignedSupportEvent,
  installOneTimeSupportConsumerRoutes,
  loadHmacKeys,
  operatorTicketView,
  ot89BridgeSchemaSql,
  publicSummary,
  redactSupportText,
  sanitizeEventForStorage,
  sha256Hex,
  stableStringify,
  telegramDrainGate,
  validateAuthorizationSemantics,
  validateDiagnosticRequest,
  validateStatusRequestSchema,
  validateSupportEventSchema,
  verifySignedRequest,
};
