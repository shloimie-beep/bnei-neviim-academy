const crypto = require('crypto');
const { previewMessage, redactText, redactValue, stableHash } = require('./helper/redaction');
const {
  formatSupportTicketTelegramAlert,
  supportTicketApprovalKeyboard,
} = require('./telegram-notifications');

const ONE_TIME_SUPPORT_ENDPOINT_PATH = '/api/bna/integrations/one-time/support-tickets/v1';
const ONE_TIME_SUPPORT_SCHEMA_VERSION = '2026-07-17.one_time_support_ticket.v1';
const ONE_TIME_SUPPORT_EVENT_TYPE = 'one_time.support_ticket.created';
const ONE_TIME_SUPPORT_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_SUPPORT_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_SUPPORT_MAX_BODY_BYTES = 64 * 1024;
const ONE_TIME_SUPPORT_SIGNATURE_TOLERANCE_SECONDS = 5 * 60;
const ONE_TIME_SUPPORT_TELEGRAM_CHANNEL_KEY = 'telegram:platform_support_shloimie';
const ONE_TIME_SUPPORT_OPERATOR_ALIAS = 'platform_support_shloimie';

const createOneTimeSupportConsumerSQL = `
CREATE TABLE IF NOT EXISTS bna_one_time_support_consumer_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  schema_version TEXT NOT NULL,
  event_type TEXT NOT NULL,
  account_key TEXT NOT NULL,
  product_key TEXT NOT NULL,
  raw_body_sha256 TEXT NOT NULL,
  signature_key_id TEXT,
  request_headers JSONB DEFAULT '{}'::jsonb,
  payload_redacted JSONB DEFAULT '{}'::jsonb,
  entitlement_reference_hash TEXT,
  ticket_id INTEGER REFERENCES bna_support_tickets(id) ON DELETE SET NULL,
  alert_outbox_id INTEGER,
  processing_state TEXT NOT NULL DEFAULT 'queued'
    CHECK (processing_state IN ('queued', 'processing', 'retry_wait', 'completed', 'dead_letter', 'duplicate', 'blocked')),
  lease_owner TEXT,
  lease_until TIMESTAMP,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMP,
  last_error TEXT,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_one_time_support_consumer_events_state
  ON bna_one_time_support_consumer_events(processing_state, next_attempt_at, lease_until);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_support_consumer_events_ticket
  ON bna_one_time_support_consumer_events(ticket_id);

CREATE TABLE IF NOT EXISTS bna_one_time_support_status_outbox (
  id SERIAL PRIMARY KEY,
  delivery_key TEXT NOT NULL UNIQUE,
  source_event_id TEXT,
  ticket_id INTEGER REFERENCES bna_support_tickets(id) ON DELETE SET NULL,
  status_event TEXT NOT NULL
    CHECK (status_event IN ('received', 'triaged', 'needs_information', 'decision_needed', 'in_progress', 'resolved', 'rejected')),
  payload JSONB DEFAULT '{}'::jsonb,
  signed_body_sha256 TEXT,
  delivery_state TEXT NOT NULL DEFAULT 'provider_off'
    CHECK (delivery_state IN ('queued', 'provider_off', 'sending', 'sent', 'failed', 'dead_lettered', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMP,
  last_error TEXT,
  provider_off BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_one_time_support_status_outbox_ticket
  ON bna_one_time_support_status_outbox(ticket_id, status_event);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_support_status_outbox_state
  ON bna_one_time_support_status_outbox(delivery_state, next_attempt_at);
`;

class OneTimeSupportConsumerError extends Error {
  constructor(message, { statusCode = 400, code = 'bad_request', publicMessage = '' } = {}) {
    super(message);
    this.name = 'OneTimeSupportConsumerError';
    this.statusCode = statusCode;
    this.code = code;
    this.publicMessage = publicMessage || message;
  }
}

function normalizeHeaderName(name = '') {
  return String(name || '').trim().toLowerCase();
}

function headerValue(headers = {}, name = '') {
  const wanted = normalizeHeaderName(name);
  for (const [key, value] of Object.entries(headers || {})) {
    if (normalizeHeaderName(key) === wanted) return Array.isArray(value) ? value[0] : value;
  }
  return '';
}

function asRawBuffer(rawBody) {
  if (Buffer.isBuffer(rawBody)) return rawBody;
  if (typeof rawBody === 'string') return Buffer.from(rawBody, 'utf8');
  if (rawBody === undefined || rawBody === null) return Buffer.alloc(0);
  return Buffer.from(JSON.stringify(rawBody), 'utf8');
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmacForOneTimeSupport({ rawBody, timestamp, eventId, secret }) {
  const raw = asRawBuffer(rawBody);
  const hmac = crypto.createHmac('sha256', String(secret || ''));
  hmac.update(String(timestamp || ''));
  hmac.update('.');
  hmac.update(String(eventId || ''));
  hmac.update('.');
  hmac.update(raw);
  return hmac.digest('hex');
}

function buildOneTimeSupportSignature({ rawBody, timestamp, eventId, secret }) {
  return `v1=${hmacForOneTimeSupport({ rawBody, timestamp, eventId, secret })}`;
}

function signatureHexFromHeader(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  for (const part of text.split(',')) {
    const candidate = part.trim();
    const match = candidate.match(/^(?:v1|sha256)=([a-f0-9]{64})$/i);
    if (match) return match[1].toLowerCase();
    if (/^[a-f0-9]{64}$/i.test(candidate)) return candidate.toLowerCase();
  }
  return '';
}

function timingSafeHexEqual(left = '', right = '') {
  const a = Buffer.from(String(left || ''), 'hex');
  const b = Buffer.from(String(right || ''), 'hex');
  if (!a.length || !b.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function timestampToDate(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) {
    const numeric = Number(text);
    if (!Number.isFinite(numeric)) return null;
    return new Date(numeric > 9999999999 ? numeric : numeric * 1000);
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function configuredSecret(env = process.env) {
  return String(
    env.ONE_TIME_SUPPORT_WEBHOOK_SECRET ||
    env.BNA_ONE_TIME_SUPPORT_WEBHOOK_SECRET ||
    env.ONE_TIME_SUPPORT_CONSUMER_SECRET ||
    ''
  ).trim();
}

function configuredAllowedKeys(value, fallback) {
  const items = String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return new Set(items.length ? items : [fallback]);
}

function verifyOneTimeSupportSignature({
  rawBody,
  headers = {},
  env = process.env,
  now = new Date(),
  toleranceSeconds = ONE_TIME_SUPPORT_SIGNATURE_TOLERANCE_SECONDS,
} = {}) {
  const secret = configuredSecret(env);
  if (!secret) {
    throw new OneTimeSupportConsumerError('One Time support consumer secret is not configured.', {
      statusCode: 503,
      code: 'consumer_secret_missing',
      publicMessage: 'support consumer is not configured',
    });
  }
  const raw = asRawBuffer(rawBody);
  if (!raw.length) {
    throw new OneTimeSupportConsumerError('Request body is required.', { statusCode: 400, code: 'body_required' });
  }
  if (raw.length > ONE_TIME_SUPPORT_MAX_BODY_BYTES) {
    throw new OneTimeSupportConsumerError('Request body is too large.', { statusCode: 413, code: 'body_too_large' });
  }
  const contentType = String(headerValue(headers, 'content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    throw new OneTimeSupportConsumerError('content-type must be application/json.', {
      statusCode: 415,
      code: 'unsupported_content_type',
    });
  }

  const eventId = String(headerValue(headers, 'x-bna-onetime-event-id') || '').trim();
  const timestamp = String(headerValue(headers, 'x-bna-onetime-timestamp') || '').trim();
  const signature = signatureHexFromHeader(headerValue(headers, 'x-bna-onetime-signature'));
  const keyId = String(headerValue(headers, 'x-bna-onetime-key-id') || '').trim();
  if (!eventId || !timestamp || !signature) {
    throw new OneTimeSupportConsumerError('Signed One Time support requests require event id, timestamp, and signature headers.', {
      statusCode: 401,
      code: 'signature_headers_missing',
      publicMessage: 'signature verification failed',
    });
  }
  const timestampDate = timestampToDate(timestamp);
  if (!timestampDate) {
    throw new OneTimeSupportConsumerError('Invalid signature timestamp.', {
      statusCode: 401,
      code: 'invalid_signature_timestamp',
      publicMessage: 'signature verification failed',
    });
  }
  const skewSeconds = Math.abs((new Date(now).getTime() - timestampDate.getTime()) / 1000);
  if (skewSeconds > toleranceSeconds) {
    throw new OneTimeSupportConsumerError('Signed One Time support request is outside the replay window.', {
      statusCode: 401,
      code: 'stale_signature_timestamp',
      publicMessage: 'signature verification failed',
    });
  }
  const expected = hmacForOneTimeSupport({ rawBody: raw, timestamp, eventId, secret });
  if (!timingSafeHexEqual(signature, expected)) {
    throw new OneTimeSupportConsumerError('Signed One Time support request signature did not match.', {
      statusCode: 401,
      code: 'signature_mismatch',
      publicMessage: 'signature verification failed',
    });
  }
  return {
    eventId,
    timestamp,
    timestampDate,
    signatureKeyId: keyId || null,
    rawBodySha256: sha256Hex(raw),
  };
}

function parseOneTimeSupportPayload(rawBody) {
  const raw = asRawBuffer(rawBody);
  try {
    const payload = JSON.parse(raw.toString('utf8'));
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('payload must be an object');
    }
    return payload;
  } catch (err) {
    throw new OneTimeSupportConsumerError(`Malformed One Time support payload: ${err.message}`, {
      statusCode: 400,
      code: 'malformed_json',
      publicMessage: 'malformed JSON payload',
    });
  }
}

function normalizeKey(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value || '').trim();
    if (text) return text;
  }
  return '';
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function ticketPayloadFrom(payload = {}) {
  return objectValue(payload.ticket || payload.support_ticket || payload.issue || {});
}

function subscriberPayloadFrom(payload = {}) {
  return objectValue(payload.subscriber || payload.member || payload.customer || {});
}

function entitlementPayloadFrom(payload = {}) {
  const subscriber = subscriberPayloadFrom(payload);
  const ticket = ticketPayloadFrom(payload);
  return objectValue(
    payload.entitlement ||
    payload.entitlement_proof ||
    subscriber.entitlement ||
    subscriber.entitlement_proof ||
    ticket.entitlement ||
    ticket.entitlement_proof
  );
}

function normalizeEventBasics(payload = {}) {
  const account = objectValue(payload.account || payload.workspace || payload.provider || {});
  const product = objectValue(payload.product || payload.project || payload.program || {});
  return {
    eventId: firstText(payload.event_id, payload.eventId, payload.id),
    eventType: firstText(payload.event_type, payload.eventType, payload.type),
    schemaVersion: firstText(payload.schema_version, payload.schemaVersion, payload.version),
    accountKey: normalizeKey(firstText(payload.account_key, payload.accountKey, account.key, account.account_key, account.workspace_key)),
    productKey: normalizeKey(firstText(payload.product_key, payload.productKey, product.key, product.product_key, product.project_key)),
  };
}

function maskEmail(email = '') {
  const text = String(email || '').trim();
  const match = text.match(/^([^@\s]+)@([^@\s]+\.[^@\s]+)$/);
  if (!match) return '';
  const local = match[1];
  const domain = match[2];
  const localMask = `${local.slice(0, 1)}${local.length > 2 ? '***' : '*'}${local.length > 1 ? local.slice(-1) : ''}`;
  return `${localMask}@${domain}`;
}

function normalizeEmail(value = '') {
  const text = String(value || '').trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text) ? text.slice(0, 180) : '';
}

function redactSupportFreeText(value = '', max = 1600) {
  let text = redactText(String(value || ''));
  text = text.replace(/\b(password|passcode|pin|otp|code)\s*(?:is|:|=)\s*[^\s,.;)]+/gi, '$1 [redacted-secret]');
  text = text.replace(/\bhttps?:\/\/[^\s<>"')]+/gi, (url) => (
    /\b(zoom|join|class|lesson|session|magic|token|access|login|activation|password)\b/i.test(url)
      ? '[redacted-link]'
      : '[url]'
  ));
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]');
  text = text.replace(/\+?\b(?:\d[\s().-]?){8,}\d\b/g, '[phone]');
  return previewMessage(text, max);
}

function redactionFlagsFromText(value = '') {
  const raw = String(value || '');
  const redacted = redactSupportFreeText(raw, Math.max(raw.length + 100, 2000));
  const flags = [];
  if (raw !== redacted) flags.push('text_redacted');
  if (/\bhttps?:\/\/[^\s]+/i.test(raw)) flags.push('url_removed');
  if (/\b(password|passcode|token|secret|api[_-]?key|authorization)\b/i.test(raw)) flags.push('secret_removed');
  if (/\b(student_id|household_id|parent_id|class_session_id|provider_profile_id)\b/i.test(raw)) flags.push('record_id_removed');
  return [...new Set(flags)];
}

function parseDateOrNull(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateEntitlement(entitlement = {}, { accountKey, productKey, now = new Date() } = {}) {
  const proofType = normalizeKey(firstText(entitlement.proof_type, entitlement.type, entitlement.kind));
  const reference = firstText(entitlement.reference, entitlement.ref, entitlement.entitlement_reference, entitlement.id);
  const status = normalizeKey(firstText(entitlement.status, entitlement.state));
  const signatureReference = firstText(
    entitlement.signature,
    entitlement.proof_signature,
    entitlement.signed_reference,
    entitlement.reference_signature
  );
  const entitlementAccountKey = normalizeKey(firstText(entitlement.account_key, entitlement.workspace_key, entitlement.provider_key, accountKey));
  const entitlementProductKey = normalizeKey(firstText(entitlement.product_key, entitlement.project_key, entitlement.program_key, productKey));
  const issuedAt = parseDateOrNull(firstText(entitlement.issued_at, entitlement.created_at));
  const validUntil = parseDateOrNull(firstText(entitlement.expires_at, entitlement.valid_until, entitlement.ends_at));

  if (proofType !== 'one_time_subscription_entitlement_v1') {
    throw new OneTimeSupportConsumerError('One Time support entitlement proof type is not allowed.', {
      statusCode: 403,
      code: 'invalid_entitlement_proof_type',
      publicMessage: 'entitlement verification failed',
    });
  }
  if (!reference || !signatureReference) {
    throw new OneTimeSupportConsumerError('One Time support entitlement proof reference/signature is required.', {
      statusCode: 403,
      code: 'entitlement_proof_missing',
      publicMessage: 'entitlement verification failed',
    });
  }
  if (!['active', 'trialing', 'current', 'paid', 'grace_period'].includes(status)) {
    throw new OneTimeSupportConsumerError('One Time support entitlement is not active.', {
      statusCode: 403,
      code: 'entitlement_not_active',
      publicMessage: 'entitlement verification failed',
    });
  }
  if (entitlementAccountKey !== accountKey || entitlementProductKey !== productKey) {
    throw new OneTimeSupportConsumerError('One Time support entitlement scope does not match the request scope.', {
      statusCode: 403,
      code: 'entitlement_scope_mismatch',
      publicMessage: 'entitlement verification failed',
    });
  }
  if (issuedAt && issuedAt.getTime() > new Date(now).getTime() + 5 * 60 * 1000) {
    throw new OneTimeSupportConsumerError('One Time support entitlement proof was issued in the future.', {
      statusCode: 403,
      code: 'entitlement_issued_in_future',
      publicMessage: 'entitlement verification failed',
    });
  }
  if (!validUntil || validUntil.getTime() < new Date(now).getTime() - 5 * 60 * 1000) {
    throw new OneTimeSupportConsumerError('One Time support entitlement proof is expired or missing an expiry.', {
      statusCode: 403,
      code: 'entitlement_expired',
      publicMessage: 'entitlement verification failed',
    });
  }

  return {
    proofType,
    reference,
    status,
    validUntil: validUntil.toISOString(),
    referenceHash: stableHash(reference),
    signatureHash: stableHash(signatureReference),
  };
}

function validateOneTimeSupportPayload(payload = {}, {
  verifiedEventId = '',
  env = process.env,
  now = new Date(),
} = {}) {
  const basics = normalizeEventBasics(payload);
  if (!basics.eventId || basics.eventId !== verifiedEventId) {
    throw new OneTimeSupportConsumerError('One Time support event id does not match the signed header.', {
      statusCode: 400,
      code: 'event_id_mismatch',
    });
  }
  if (basics.schemaVersion !== ONE_TIME_SUPPORT_SCHEMA_VERSION) {
    throw new OneTimeSupportConsumerError('Unsupported One Time support schema version.', {
      statusCode: 400,
      code: 'unsupported_schema_version',
    });
  }
  if (basics.eventType !== ONE_TIME_SUPPORT_EVENT_TYPE) {
    throw new OneTimeSupportConsumerError('Unsupported One Time support event type.', {
      statusCode: 400,
      code: 'unsupported_event_type',
    });
  }

  const allowedAccounts = configuredAllowedKeys(env.ONE_TIME_SUPPORT_ALLOWED_ACCOUNTS, ONE_TIME_SUPPORT_WORKSPACE_KEY);
  const allowedProducts = configuredAllowedKeys(env.ONE_TIME_SUPPORT_ALLOWED_PRODUCTS, ONE_TIME_SUPPORT_PROJECT_KEY);
  if (!allowedAccounts.has(basics.accountKey) || !allowedProducts.has(basics.productKey)) {
    throw new OneTimeSupportConsumerError('One Time support request is outside the allowed account/product scope.', {
      statusCode: 403,
      code: 'account_product_not_allowed',
      publicMessage: 'account/product is not allowed',
    });
  }

  const ticket = ticketPayloadFrom(payload);
  if (Array.isArray(ticket.attachments) && ticket.attachments.length) {
    throw new OneTimeSupportConsumerError('One Time support attachments are not accepted by this consumer.', {
      statusCode: 400,
      code: 'attachments_not_accepted',
    });
  }
  const title = firstText(ticket.title, payload.title, ticket.subject, payload.subject);
  const message = firstText(ticket.message, ticket.description, ticket.body, payload.message, payload.description);
  if (!title && !message) {
    throw new OneTimeSupportConsumerError('One Time support ticket title or message is required.', {
      statusCode: 400,
      code: 'ticket_message_required',
    });
  }

  const entitlement = validateEntitlement(entitlementPayloadFrom(payload), {
    accountKey: basics.accountKey,
    productKey: basics.productKey,
    now,
  });

  return {
    ...basics,
    ticket,
    subscriber: subscriberPayloadFrom(payload),
    entitlement,
  };
}

function routeOneTimeSupportTicket({ payload = {}, normalized = {} } = {}) {
  const ticket = normalized.ticket || ticketPayloadFrom(payload);
  const rawCategory = normalizeKey(firstText(ticket.category, payload.category, ticket.issue_type, ticket.topic));
  const rawSeverity = normalizeKey(firstText(ticket.severity, payload.severity));
  const text = [
    ticket.title,
    ticket.message,
    ticket.description,
    ticket.reproduction_steps,
    ticket.expected_behavior,
    ticket.actual_behavior,
  ].filter(Boolean).join('\n').toLowerCase();

  const accessLike = /\b(access|login|security|privacy|private|breach|permission|locked|token|password)\b/.test(`${rawCategory} ${text}`);
  const billingLike = /\b(billing|payment|refund|charge|invoice|dispute|stripe)\b/.test(`${rawCategory} ${text}`);
  const dataCorrectionLike = /\b(data|record|correction|wrong info|student|parent|household)\b/.test(`${rawCategory} ${text}`);
  const featureLike = /\b(feature|request|idea|policy|change request|new)\b/.test(`${rawCategory} ${text}`);
  const bugLike = /\b(bug|broken|error|crash|does not work|doesn't work|failing|reproducible)\b/.test(`${rawCategory} ${text}`);
  const hasRepro = Boolean(
    ticket.reproducible === true ||
    firstText(ticket.reproduction_steps, ticket.steps_to_reproduce, ticket.expected_behavior, ticket.actual_behavior)
  );

  let supportCategory = 'other';
  let severity = ['low', 'normal', 'high', 'blocking'].includes(rawSeverity) ? rawSeverity : 'normal';
  let routingState = 'decision_needed';
  let assignedTo = 'Shloimie';
  let restrictedDisplay = false;
  let operatorOptions = [
    'Keep as manual subscriber support ticket',
    'Ask subscriber for missing details',
    'Reject as unactionable or out of scope',
  ];
  let agentDecision = null;

  if (billingLike) supportCategory = 'payment';
  if (dataCorrectionLike) supportCategory = 'student_parent_data';
  if (accessLike) {
    supportCategory = 'access';
    severity = severity === 'blocking' ? 'blocking' : 'high';
    restrictedDisplay = true;
    operatorOptions = [
      'Keep restricted for operator follow-up',
      'Ask subscriber for safe non-secret details',
      'Reject or redirect without exposing private data',
    ];
  } else if (bugLike && hasRepro) {
    supportCategory = /\b(task|automation|workflow)\b/.test(`${rawCategory} ${text}`) ? 'task_manager' : 'bot_api';
    routingState = 'awaiting_agent_review';
    assignedTo = 'Codex';
    operatorOptions = [
      'Approve for Codex triage',
      'Ask subscriber for reproduction details',
      'Keep as manual support ticket',
      'Reject as not reproducible',
    ];
    agentDecision = {
      status: 'awaiting_agent_review',
      approval_required_before_codex: true,
      automatic_code_execution_allowed: false,
      codex_job_created_initially: false,
    };
  } else if (featureLike || billingLike || dataCorrectionLike) {
    routingState = 'decision_needed';
  }

  if (supportCategory === 'other' && rawCategory === 'recording') supportCategory = 'recording';
  if (supportCategory === 'other' && rawCategory === 'worksheet') supportCategory = 'worksheet';
  if (supportCategory === 'other' && rawCategory === 'link') supportCategory = 'link';

  return {
    supportCategory,
    severity,
    ticketStatus: 'triage',
    routingState,
    assignedTo,
    restrictedDisplay,
    agentDecision,
    decisionCard: routingState === 'decision_needed'
      ? {
          status: 'decision_needed',
          options: operatorOptions,
          automatic_code_execution_allowed: false,
        }
      : null,
    operatorOptions,
  };
}

function buildSafeTicketFields({ payload = {}, normalized = {}, route = {}, reviewPath = '' } = {}) {
  const ticket = normalized.ticket || ticketPayloadFrom(payload);
  const subscriber = normalized.subscriber || subscriberPayloadFrom(payload);
  const email = normalizeEmail(firstText(subscriber.email, ticket.email, payload.email));
  const displayName = redactSupportFreeText(firstText(subscriber.display_name, subscriber.name, ticket.name, payload.name), 140);
  const title = redactSupportFreeText(firstText(ticket.title, payload.title, ticket.subject, payload.subject, 'One Time subscriber support ticket'), 180);
  const message = redactSupportFreeText(firstText(ticket.message, ticket.description, ticket.body, payload.message, payload.description), 1800);
  const reproduction = redactSupportFreeText(firstText(ticket.reproduction_steps, ticket.steps_to_reproduce), 900);
  const expected = redactSupportFreeText(firstText(ticket.expected_behavior), 500);
  const actual = redactSupportFreeText(firstText(ticket.actual_behavior), 500);
  const descriptionParts = [
    message,
    reproduction ? `Reproduction: ${reproduction}` : '',
    expected ? `Expected: ${expected}` : '',
    actual ? `Actual: ${actual}` : '',
  ].filter(Boolean);
  const redactionFlags = [
    ...redactionFlagsFromText(firstText(ticket.title, payload.title, ticket.subject, payload.subject)),
    ...redactionFlagsFromText(firstText(ticket.message, ticket.description, ticket.body, payload.message, payload.description)),
    ...redactionFlagsFromText(firstText(ticket.reproduction_steps, ticket.steps_to_reproduce)),
  ];
  const publicReference = firstText(ticket.public_reference, ticket.publicReference, payload.public_reference, normalized.eventId);
  const subscriberReference = firstText(subscriber.reference, subscriber.id, subscriber.member_id, subscriber.customer_id);

  return {
    title: title || 'One Time subscriber support ticket',
    description: descriptionParts.join('\n\n').slice(0, 3000) || title,
    reporterName: displayName || 'One Time subscriber',
    requesterEmail: email || null,
    requesterDisplayName: displayName || null,
    requesterUserKey: subscriberReference ? `one_time_subscriber:${stableHash(subscriberReference).slice(0, 24)}` : null,
    affectedSection: redactSupportFreeText(firstText(ticket.affected_section, ticket.affectedSection, ticket.page, ticket.route), 180) || route.supportCategory,
    requestedResult: redactSupportFreeText(firstText(ticket.requested_result, ticket.requestedResult, ticket.request, ticket.desired_outcome), 220) || 'Review and triage subscriber support ticket',
    publicReference,
    reviewPath,
    redactionFlags: [...new Set(redactionFlags)],
    subscriberReferenceHash: subscriberReference ? stableHash(subscriberReference) : null,
    subscriberEmailHash: email ? stableHash(email) : null,
    subscriberEmailMasked: email ? maskEmail(email) : null,
  };
}

function buildOneTimeSupportSourceContext({ normalized = {}, route = {}, fields = {}, signature = {}, payload = {} } = {}) {
  return {
    source: 'one_time_support_consumer',
    relationship_scope: 'one_time_subscriber_support_ticket',
    workspace_key: ONE_TIME_SUPPORT_WORKSPACE_KEY,
    project_key: ONE_TIME_SUPPORT_PROJECT_KEY,
    consumer_contract_version: ONE_TIME_SUPPORT_SCHEMA_VERSION,
    event_id: normalized.eventId,
    event_type: normalized.eventType,
    schema_version: normalized.schemaVersion,
    signature_key_id: signature.signatureKeyId || null,
    raw_body_sha256: signature.rawBodySha256,
    account_key: normalized.accountKey,
    product_key: normalized.productKey,
    public_reference: fields.publicReference,
    affected_section: fields.affectedSection,
    requested_result: fields.requestedResult,
    review_path: fields.reviewPath,
    subscriber: {
      reference_hash: fields.subscriberReferenceHash,
      email_hash: fields.subscriberEmailHash,
      email_masked: fields.subscriberEmailMasked,
      display_name_masked: fields.requesterDisplayName || null,
    },
    entitlement: {
      proof_type: normalized.entitlement.proofType,
      status: normalized.entitlement.status,
      reference_hash: normalized.entitlement.referenceHash,
      signature_hash: normalized.entitlement.signatureHash,
      valid_until: normalized.entitlement.validUntil,
    },
    routing: {
      state: route.routingState,
      support_category: route.supportCategory,
      severity: route.severity,
      restricted_display: route.restrictedDisplay,
      operator_options: route.operatorOptions,
    },
    agent_decision: route.agentDecision,
    decision_card: route.decisionCard,
    approval_gate: 'operator_required_before_codex',
    requires_super_admin_approval: true,
    suppress_task_creation: true,
    codex_job_created_initially: false,
    no_provider_action_from_ticket: true,
    no_send: true,
    external_write_performed: false,
    real_telegram_send_performed: false,
    automatic_code_execution_allowed: false,
    automatic_deployment_allowed: false,
    academy_data_crossover: false,
    raw_payload_returned: false,
    raw_body_stored: false,
    attachments_accepted: false,
    redaction_flags: fields.redactionFlags,
    payload_redacted: redactValue({
      source: payload.source || null,
      ticket_public_reference: fields.publicReference,
      category: normalized.ticket?.category || payload.category || null,
    }),
  };
}

function safeRequestHeaders({ headers = {}, signature = {} } = {}) {
  return {
    content_type: previewMessage(headerValue(headers, 'content-type'), 120),
    user_agent: previewMessage(headerValue(headers, 'user-agent'), 180),
    event_id_header: signature.eventId,
    timestamp_header: signature.timestamp,
    signature_key_id: signature.signatureKeyId || null,
    signature_present: Boolean(headerValue(headers, 'x-bna-onetime-signature')),
  };
}

async function persistOneTimeSupportEvent({ db, signature = {}, normalized = {}, payload = {}, headers = {} } = {}) {
  const payloadRedacted = redactValue({
    event_id: normalized.eventId,
    schema_version: normalized.schemaVersion,
    event_type: normalized.eventType,
    account_key: normalized.accountKey,
    product_key: normalized.productKey,
    ticket: {
      category: normalized.ticket?.category || payload.category || null,
      severity: normalized.ticket?.severity || payload.severity || null,
      title: redactSupportFreeText(firstText(normalized.ticket?.title, payload.title), 180),
    },
    entitlement_reference_hash: normalized.entitlement?.referenceHash || null,
  });
  const row = (await db.query(
    `WITH inserted AS (
       INSERT INTO bna_one_time_support_consumer_events (
         event_id, schema_version, event_type, account_key, product_key,
         raw_body_sha256, signature_key_id, request_headers, payload_redacted,
         entitlement_reference_hash, processing_state, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8::jsonb, $9::jsonb,
         $10, 'queued', NOW()
       )
       ON CONFLICT (event_id) DO NOTHING
       RETURNING *, TRUE AS created
     )
     SELECT *, created FROM inserted
     UNION ALL
     SELECT *, FALSE AS created
     FROM bna_one_time_support_consumer_events
     WHERE event_id = $1
     LIMIT 1`,
    [
      normalized.eventId,
      normalized.schemaVersion,
      normalized.eventType,
      normalized.accountKey,
      normalized.productKey,
      signature.rawBodySha256,
      signature.signatureKeyId || null,
      JSON.stringify(safeRequestHeaders({ headers, signature })),
      JSON.stringify(payloadRedacted),
      normalized.entitlement?.referenceHash || null,
    ]
  )).rows[0];
  return {
    ...row,
    created: row?.created === true || row?.created === 't',
  };
}

async function claimOneTimeSupportEvent({ db, eventId, leaseOwner = 'one-time-support-consumer', leaseMinutes = 5 } = {}) {
  const row = (await db.query(
    `WITH next_event AS (
       SELECT id
       FROM bna_one_time_support_consumer_events
       WHERE event_id = $1
         AND processing_state IN ('queued', 'retry_wait')
         AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
         AND (lease_until IS NULL OR lease_until < NOW())
       ORDER BY received_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 1
     )
     UPDATE bna_one_time_support_consumer_events e
        SET processing_state = 'processing',
            lease_owner = $2,
            lease_until = NOW() + ($3::text)::interval,
            attempt_count = attempt_count + 1,
            updated_at = NOW()
       FROM next_event
      WHERE e.id = next_event.id
      RETURNING e.*`,
    [eventId, leaseOwner, `${Number(leaseMinutes) || 5} minutes`]
  )).rows[0] || null;
  return row;
}

async function findProjectForOneTimeSupport({ db, projectKey = ONE_TIME_SUPPORT_PROJECT_KEY } = {}) {
  return (await db.query(
    `SELECT id, project_key, name, short_name
     FROM bna_projects
     WHERE project_key = $1
     ORDER BY id ASC
     LIMIT 1`,
    [projectKey]
  )).rows[0] || null;
}

function ticketNumberFor(row = {}) {
  const id = row.id ? Number(row.id) : null;
  return row.ticket_number || (id ? `OT-SUP-${String(id).padStart(6, '0')}` : '');
}

async function createOneTimeSupportTicket({ db, project = null, normalized = {}, route = {}, fields = {}, sourceContext = {} } = {}) {
  const row = (await db.query(
    `INSERT INTO bna_support_tickets (
       project_id, title, description, severity, status, category,
       reporter_name, reporter_role, assigned_to, source,
       workspace_key, project_key, requester_user_key, requester_email,
       requester_display_name, requester_role, page_path,
       authenticated_context, notification_state, staff_reply_state,
       source_context, created_by
     )
     VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, 'subscriber', $8, 'api',
       $9, $10, $11, $12,
       $13, 'member', $14,
       $15::jsonb, $16, 'reverse_status_outbox_only',
       $17::jsonb, 'one_time_support_consumer'
     )
     RETURNING *`,
    [
      project?.id || null,
      fields.title,
      fields.description,
      route.severity,
      route.ticketStatus,
      route.supportCategory,
      fields.reporterName,
      route.assignedTo,
      ONE_TIME_SUPPORT_WORKSPACE_KEY,
      ONE_TIME_SUPPORT_PROJECT_KEY,
      fields.requesterUserKey,
      fields.requesterEmail,
      fields.requesterDisplayName,
      fields.reviewPath || null,
      JSON.stringify({
        signed_entitlement_verified: true,
        account_key: normalized.accountKey,
        product_key: normalized.productKey,
        event_id: normalized.eventId,
      }),
      route.restrictedDisplay ? 'restricted_operator_only' : 'queued_operator_alert',
      JSON.stringify(sourceContext),
    ]
  )).rows[0];
  return {
    ...row,
    ticket_number: ticketNumberFor(row),
  };
}

async function addOneTimeSupportTicketComment({ db, ticket = {}, fields = {}, route = {}, sourceContext = {} } = {}) {
  return (await db.query(
    `INSERT INTO bna_support_ticket_comments (
       ticket_id, author, body, visibility, requester_visible, staff_reply,
       notification_state, source, source_context
     )
     VALUES ($1, 'one_time_support_consumer', $2, $3, FALSE, FALSE, 'internal_only', 'api', $4::jsonb)
     RETURNING *`,
    [
      ticket.id,
      [
        `Route: ${route.routingState}`,
        `Affected: ${fields.affectedSection}`,
        `Requested: ${fields.requestedResult}`,
        fields.redactionFlags.length ? `Redaction: ${fields.redactionFlags.join(', ')}` : '',
      ].filter(Boolean).join('\n'),
      route.restrictedDisplay ? 'operator' : 'project',
      JSON.stringify({
        source: 'one_time_support_consumer',
        relationship_scope: 'one_time_subscriber_support_ticket',
        event_id: sourceContext.event_id,
        raw_body_stored: false,
        attachments_accepted: false,
      }),
    ]
  )).rows[0] || null;
}

function statusPayloadFor({ ticket = {}, sourceEventId = '', statusEvent = 'received', context = {} } = {}) {
  const ticketNumber = ticketNumberFor(ticket);
  const payload = {
    schema_version: '2026-07-17.one_time_support_status.v1',
    event_type: 'bna.one_time_support.status',
    source_event_id: sourceEventId || context.event_id || null,
    ticket_id: ticket.id || null,
    ticket_number: ticketNumber || null,
    public_reference: context.public_reference || ticketNumber || null,
    status: statusEvent,
    account_key: ONE_TIME_SUPPORT_WORKSPACE_KEY,
    product_key: ONE_TIME_SUPPORT_PROJECT_KEY,
    provider_off: true,
    no_send: true,
    external_write_performed: false,
    message: statusEvent === 'decision_needed'
      ? 'Operator decision is required before this ticket can move forward.'
      : 'BNA recorded the support ticket status update.',
  };
  return redactValue(payload);
}

async function enqueueOneTimeSupportStatusEvent({
  db,
  ticket = {},
  sourceEventId = '',
  statusEvent = 'received',
  context = {},
} = {}) {
  const payload = statusPayloadFor({ ticket, sourceEventId, statusEvent, context });
  const deliveryKey = `one-time-support-status:${sourceEventId || context.event_id || ticket.id || 'manual'}:${statusEvent}`;
  const bodyHash = stableHash(JSON.stringify(payload));
  const row = (await db.query(
    `WITH inserted AS (
       INSERT INTO bna_one_time_support_status_outbox (
         delivery_key, source_event_id, ticket_id, status_event,
         payload, signed_body_sha256, delivery_state, provider_off, updated_at
       ) VALUES (
         $1, $2, $3, $4,
         $5::jsonb, $6, 'provider_off', TRUE, NOW()
       )
       ON CONFLICT (delivery_key) DO NOTHING
       RETURNING id, delivery_key, status_event, delivery_state, TRUE AS created
     )
     SELECT id, delivery_key, status_event, delivery_state, created FROM inserted
     UNION ALL
     SELECT id, delivery_key, status_event, delivery_state, FALSE AS created
     FROM bna_one_time_support_status_outbox
     WHERE delivery_key = $1
     LIMIT 1`,
    [
      deliveryKey,
      sourceEventId || context.event_id || null,
      ticket.id || null,
      statusEvent,
      JSON.stringify(payload),
      bodyHash,
    ]
  )).rows[0] || null;
  return row
    ? {
        ...row,
        created: row.created === true || row.created === 't',
      }
    : null;
}

async function enqueueOneTimeSupportTelegramAlert({ db, ticket = {}, sourceContext = {}, route = {}, fields = {} } = {}) {
  const telegramContext = {
    ...sourceContext,
    source: 'one_time_support_consumer',
    requested_result: fields.requestedResult,
    affected_section: fields.affectedSection,
    reviewPath: fields.reviewPath,
    category: route.supportCategory,
    severity: route.severity,
  };
  const text = formatSupportTicketTelegramAlert({ ticket, context: telegramContext });
  const replyMarkup = supportTicketApprovalKeyboard({ ticket, context: telegramContext });
  const deliveryKey = `one-time-support-operator-alert:${sourceContext.event_id}`;
  const row = (await db.query(
    `WITH inserted AS (
       INSERT INTO assistant_delivery_outbox (
         delivery_key, conversation_key, channel_key, recipient_identity_key,
         payload, idempotency_key, status, next_attempt_at, updated_at
       ) VALUES (
         $1, $2, $3, $4,
         $5::jsonb, $6, 'queued', NOW(), NOW()
       )
       ON CONFLICT (delivery_key) DO NOTHING
       RETURNING id, delivery_key, channel_key, status, idempotency_key, TRUE AS created
     )
     SELECT id, delivery_key, channel_key, status, idempotency_key, created FROM inserted
     UNION ALL
     SELECT id, delivery_key, channel_key, status, idempotency_key, FALSE AS created
     FROM assistant_delivery_outbox
     WHERE delivery_key = $1
     LIMIT 1`,
    [
      deliveryKey,
      `one-time-support:${ticket.id}`,
      ONE_TIME_SUPPORT_TELEGRAM_CHANNEL_KEY,
      ONE_TIME_SUPPORT_OPERATOR_ALIAS,
      JSON.stringify({
        type: 'telegram_send_message',
        role_alias: ONE_TIME_SUPPORT_OPERATOR_ALIAS,
        bot_scope: 'bna_operator_super_admin',
        text,
        reply_markup: replyMarkup,
        ticket_id: ticket.id || null,
        ticket_number: ticketNumberFor(ticket) || null,
        event_id: sourceContext.event_id,
        dispatch_guard: 'queued_only_by_consumer_no_direct_send',
        redacted: true,
        raw_body_returned: false,
        raw_payload_returned: false,
        no_provider_action_from_ticket: true,
        automatic_code_execution_allowed: false,
      }),
      deliveryKey,
    ]
  )).rows[0] || null;
  return row
    ? {
        ...row,
        created: row.created === true || row.created === 't',
        text,
      }
    : null;
}

async function markOneTimeSupportEventCompleted({ db, eventId, ticket = {}, alertOutbox = null } = {}) {
  return (await db.query(
    `UPDATE bna_one_time_support_consumer_events
        SET processing_state = 'completed',
            ticket_id = COALESCE($2, ticket_id),
            alert_outbox_id = COALESCE($3, alert_outbox_id),
            lease_owner = NULL,
            lease_until = NULL,
            processed_at = NOW(),
            updated_at = NOW()
      WHERE event_id = $1
      RETURNING *`,
    [eventId, ticket.id || null, alertOutbox?.id || null]
  )).rows[0] || null;
}

function nextOneTimeSupportProcessingState({ attemptCount = 0, maxAttempts = 5, retryable = true } = {}) {
  const attempts = Number(attemptCount) || 0;
  const max = Number(maxAttempts) || 5;
  if (!retryable || attempts >= max) {
    return {
      processing_state: 'dead_letter',
      delivery_state: 'dead_lettered',
      retry: false,
      next_attempt_at: null,
    };
  }
  const delaySeconds = Math.min(3600, Math.max(30, 30 * 2 ** Math.max(0, attempts - 1)));
  return {
    processing_state: 'retry_wait',
    delivery_state: 'failed',
    retry: true,
    delay_seconds: delaySeconds,
  };
}

async function recordOneTimeSupportProcessingFailure({ db, eventRow = {}, error, retryable = true } = {}) {
  const state = nextOneTimeSupportProcessingState({
    attemptCount: eventRow.attempt_count || 1,
    maxAttempts: eventRow.max_attempts || 5,
    retryable,
  });
  const message = previewMessage(error instanceof Error ? error.message : String(error || 'unknown error'), 500);
  const row = (await db.query(
    `UPDATE bna_one_time_support_consumer_events
        SET processing_state = $2,
            lease_owner = NULL,
            lease_until = NULL,
            next_attempt_at = CASE WHEN $3::int IS NULL THEN NULL ELSE NOW() + ($3::text || ' seconds')::interval END,
            last_error = $4,
            updated_at = NOW()
      WHERE event_id = $1
      RETURNING *`,
    [
      eventRow.event_id,
      state.processing_state,
      state.delay_seconds || null,
      message,
    ]
  )).rows[0] || null;

  if (state.processing_state === 'dead_letter') {
    await db.query(
      `INSERT INTO assistant_dead_letters (
         dead_letter_key, source_table, source_key, channel_key,
         workspace_key, project_key, reason, payload_redacted, status
       ) VALUES (
         $1, 'bna_one_time_support_consumer_events', $2, $3,
         $4, $5, $6, $7::jsonb, 'open'
       )
       ON CONFLICT (dead_letter_key) DO NOTHING`,
      [
        `one-time-support-consumer:${eventRow.event_id}`,
        eventRow.event_id,
        ONE_TIME_SUPPORT_TELEGRAM_CHANNEL_KEY,
        ONE_TIME_SUPPORT_WORKSPACE_KEY,
        ONE_TIME_SUPPORT_PROJECT_KEY,
        message,
        JSON.stringify(redactValue({ event_id: eventRow.event_id, error: message })),
      ]
    );
  }
  return row;
}

async function processClaimedOneTimeSupportEvent({
  db,
  eventRow = {},
  payload = {},
  normalized = {},
  signature = {},
  reviewBaseUrl = '',
} = {}) {
  const route = routeOneTimeSupportTicket({ payload, normalized });
  const reviewPath = reviewBaseUrl
    ? `${String(reviewBaseUrl).replace(/\/+$/, '')}/operations?workspace=${ONE_TIME_SUPPORT_WORKSPACE_KEY}&project=${ONE_TIME_SUPPORT_PROJECT_KEY}&view=admin&section=tickets`
    : `/operations?workspace=${ONE_TIME_SUPPORT_WORKSPACE_KEY}&project=${ONE_TIME_SUPPORT_PROJECT_KEY}&view=admin&section=tickets`;
  const fields = buildSafeTicketFields({ payload, normalized, route, reviewPath });
  const sourceContext = buildOneTimeSupportSourceContext({
    normalized,
    route,
    fields,
    signature,
    payload,
  });
  const project = await findProjectForOneTimeSupport({ db, projectKey: ONE_TIME_SUPPORT_PROJECT_KEY });
  const ticket = await createOneTimeSupportTicket({ db, project, normalized, route, fields, sourceContext });
  await addOneTimeSupportTicketComment({ db, ticket, fields, route, sourceContext });
  const receivedStatus = await enqueueOneTimeSupportStatusEvent({
    db,
    ticket,
    sourceEventId: normalized.eventId,
    statusEvent: 'received',
    context: sourceContext,
  });
  const routedStatus = await enqueueOneTimeSupportStatusEvent({
    db,
    ticket,
    sourceEventId: normalized.eventId,
    statusEvent: route.routingState === 'decision_needed' ? 'decision_needed' : 'triaged',
    context: sourceContext,
  });
  const alert = await enqueueOneTimeSupportTelegramAlert({ db, ticket, sourceContext, route, fields });
  const completed = await markOneTimeSupportEventCompleted({
    db,
    eventId: eventRow.event_id || normalized.eventId,
    ticket,
    alertOutbox: alert,
  });
  return {
    ticket,
    route,
    sourceContext,
    telegramAlert: alert,
    reverseStatuses: [receivedStatus, routedStatus].filter(Boolean),
    completed,
  };
}

async function handleOneTimeSupportConsumerRequest({
  db,
  rawBody,
  headers = {},
  env = process.env,
  now = new Date(),
  reviewBaseUrl = '',
  leaseOwner = 'one-time-support-consumer-route',
} = {}) {
  if (!db || typeof db.connect !== 'function') {
    throw new OneTimeSupportConsumerError('Database connection is required.', {
      statusCode: 500,
      code: 'db_required',
    });
  }
  const signature = verifyOneTimeSupportSignature({ rawBody, headers, env, now });
  const payload = parseOneTimeSupportPayload(rawBody);
  const normalized = validateOneTimeSupportPayload(payload, {
    verifiedEventId: signature.eventId,
    env,
    now,
  });

  const client = await db.connect();
  let persisted = null;
  try {
    await client.query('BEGIN');
    persisted = await persistOneTimeSupportEvent({ db: client, signature, normalized, payload, headers });
    await client.query('COMMIT');

    if (!persisted.created && persisted.ticket_id) {
      return {
        statusCode: 200,
        body: {
          success: true,
          accepted: true,
          duplicate_event: true,
          event_id: normalized.eventId,
          processing_state: persisted.processing_state || 'completed',
          ticket_id: persisted.ticket_id,
          no_send: true,
          external_write_performed: false,
        },
      };
    }

    let processing = null;
    try {
      await client.query('BEGIN');
      const claimed = await claimOneTimeSupportEvent({ db: client, eventId: normalized.eventId, leaseOwner });
      if (!claimed) {
        await client.query('COMMIT');
        return {
          statusCode: 202,
          body: {
            success: true,
            accepted: true,
            duplicate_event: !persisted.created,
            event_id: normalized.eventId,
            processing_state: 'already_claimed_or_waiting',
            no_send: true,
            external_write_performed: false,
          },
        };
      }
      processing = await processClaimedOneTimeSupportEvent({
        db: client,
        eventRow: claimed,
        payload,
        normalized,
        signature,
        reviewBaseUrl,
      });
      await client.query('COMMIT');
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch {}
      try {
        await client.query('BEGIN');
        await recordOneTimeSupportProcessingFailure({ db: client, eventRow: persisted, error: err, retryable: true });
        await client.query('COMMIT');
      } catch {
        try { await client.query('ROLLBACK'); } catch {}
      }
      throw err;
    }

    return {
      statusCode: 202,
      body: {
        success: true,
        accepted: true,
        duplicate_event: false,
        event_id: normalized.eventId,
        processing_state: 'completed',
        ticket: {
          id: processing.ticket.id,
          ticket_number: ticketNumberFor(processing.ticket),
          status: processing.ticket.status || 'triage',
          category: processing.route.supportCategory,
          severity: processing.route.severity,
        },
        routing: {
          state: processing.route.routingState,
          decision_needed: processing.route.routingState === 'decision_needed',
          awaiting_agent_review: processing.route.routingState === 'awaiting_agent_review',
          automatic_code_execution_allowed: false,
        },
        telegram_alert: {
          queued: Boolean(processing.telegramAlert),
          channel_key: processing.telegramAlert?.channel_key || ONE_TIME_SUPPORT_TELEGRAM_CHANNEL_KEY,
          delivery_key: processing.telegramAlert?.delivery_key || null,
          real_send_attempted: false,
        },
        reverse_status: {
          queued: processing.reverseStatuses.map((status) => ({
            delivery_key: status.delivery_key,
            status_event: status.status_event,
            delivery_state: status.delivery_state,
          })),
          provider_off: true,
        },
        no_send: true,
        external_write_performed: false,
        raw_body_returned: false,
        academy_data_crossover: false,
      },
    };
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  ONE_TIME_SUPPORT_ENDPOINT_PATH,
  ONE_TIME_SUPPORT_SCHEMA_VERSION,
  ONE_TIME_SUPPORT_EVENT_TYPE,
  ONE_TIME_SUPPORT_WORKSPACE_KEY,
  ONE_TIME_SUPPORT_PROJECT_KEY,
  ONE_TIME_SUPPORT_MAX_BODY_BYTES,
  ONE_TIME_SUPPORT_SIGNATURE_TOLERANCE_SECONDS,
  ONE_TIME_SUPPORT_TELEGRAM_CHANNEL_KEY,
  ONE_TIME_SUPPORT_OPERATOR_ALIAS,
  OneTimeSupportConsumerError,
  buildOneTimeSupportSignature,
  buildOneTimeSupportSourceContext,
  createOneTimeSupportConsumerSQL,
  enqueueOneTimeSupportStatusEvent,
  handleOneTimeSupportConsumerRequest,
  nextOneTimeSupportProcessingState,
  parseOneTimeSupportPayload,
  redactSupportFreeText,
  routeOneTimeSupportTicket,
  validateOneTimeSupportPayload,
  verifyOneTimeSupportSignature,
};
