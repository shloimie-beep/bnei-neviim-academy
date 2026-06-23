const crypto = require('crypto');
const {
  loadConfigValue,
  loadSecret,
  redactSecretText,
} = require('./secret-loader');
const {
  requireExternalApproval,
} = require('./external-actions');

function parseBoolean(value) {
  return ['1', 'true', 'yes', 'approved'].includes(String(value || '').trim().toLowerCase());
}

function normalizeEmail(value = '') {
  const direct = String(value || '').trim();
  const angle = direct.match(/<([^>]+)>/);
  const candidate = angle ? angle[1] : direct;
  const match = candidate.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : '';
}

function domainFromEmail(value = '') {
  const email = normalizeEmail(value);
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

function safeAccountOwner(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (['shloimie', 'rabbi', 'bna', 'unknown'].includes(normalized)) return normalized;
  return 'unknown';
}

function getResendConfig(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const loaderOptions = {
    repoRoot,
    ...(options.keyholderRoots !== undefined ? { keyholderRoots: options.keyholderRoots } : {}),
    ...(options.secretsRoot !== undefined ? { secretsRoot: options.secretsRoot } : {}),
  };
  const profile = String(options.profile || process.env.RESEND_PROFILE || '').trim().toLowerCase();
  const profilePrefix = ['shloimie', 'rabbi'].includes(profile) ? `RESEND_${profile.toUpperCase()}` : 'RESEND';
  const envFor = (suffix) => profilePrefix === 'RESEND' ? `RESEND_${suffix}` : `${profilePrefix}_${suffix}`;
  const apiKey = options.apiKey !== undefined
    ? String(options.apiKey || '').trim()
    : loadSecret({
      envName: envFor('API_KEY'),
      names: ['resend-api-key', envFor('API_KEY'), profile ? `resend-${profile}` : 'resend'],
      fileNames: ['resend-api-key.txt', `${envFor('API_KEY')}.txt`, profile ? `resend-${profile}.txt` : 'resend.txt'],
      ...loaderOptions,
    }).value;
  const apiBase = String(options.apiBase || loadConfigValue({
    envName: 'RESEND_API_BASE_URL',
    names: ['resend-api-base-url'],
    fileNames: ['resend-api-base-url.txt', 'RESEND_API_BASE_URL.txt'],
    ...loaderOptions,
  }) || 'https://api.resend.com').replace(/\/+$/, '');
  const accountOwner = safeAccountOwner(options.accountOwner || loadConfigValue({
    envName: envFor('ACCOUNT_OWNER'),
    names: ['resend-account-owner', profile ? `resend-${profile}-account-owner` : ''],
    fileNames: ['resend-account-owner.txt', `${envFor('ACCOUNT_OWNER')}.txt`, profile ? `resend-${profile}-account-owner.txt` : ''],
    ...loaderOptions,
  }) || profile || 'unknown');
  const providerAccount = String(options.providerAccount || loadConfigValue({
    envName: 'RESEND_PROVIDER_ACCOUNT',
    names: ['resend-provider-account'],
    fileNames: ['resend-provider-account.txt', 'RESEND_PROVIDER_ACCOUNT.txt'],
    ...loaderOptions,
  }) || '').trim();
  const rawFrom = String(options.from || loadConfigValue({
    envName: 'RESEND_FROM',
    names: ['resend-from'],
    fileNames: ['resend-from.txt', 'RESEND_FROM.txt'],
    ...loaderOptions,
  }) || '').trim();
  const fromEmail = normalizeEmail(options.fromEmail || rawFrom || loadConfigValue({
    envName: 'RESEND_FROM_EMAIL',
    names: ['resend-from-email'],
    fileNames: ['resend-from-email.txt', 'RESEND_FROM_EMAIL.txt'],
    ...loaderOptions,
  }));
  const fromName = String(options.fromName || loadConfigValue({
    envName: 'RESEND_FROM_NAME',
    names: ['resend-from-name'],
    fileNames: ['resend-from-name.txt', 'RESEND_FROM_NAME.txt'],
    ...loaderOptions,
  }) || '').trim();
  const from = rawFrom || (fromEmail ? (fromName ? `${fromName} <${fromEmail}>` : fromEmail) : '');
  const domain = String(options.domain || loadConfigValue({
    envName: envFor('DOMAIN'),
    names: ['resend-domain', profile ? `resend-${profile}-domain` : ''],
    fileNames: ['resend-domain.txt', `${envFor('DOMAIN')}.txt`, profile ? `resend-${profile}-domain.txt` : ''],
    ...loaderOptions,
  }) || domainFromEmail(fromEmail)).trim().toLowerCase();
  const fallbackApproved = options.fallbackApproved !== undefined
    ? Boolean(options.fallbackApproved)
    : parseBoolean(loadConfigValue({
      envName: 'RESEND_SEND_FALLBACK_APPROVED',
      names: ['resend-send-fallback-approved'],
      fileNames: ['resend-send-fallback-approved.txt', 'RESEND_SEND_FALLBACK_APPROVED.txt'],
      ...loaderOptions,
    }));
  return {
    apiKey,
    apiBase,
    accountOwner,
    providerAccount,
    domain,
    from,
    fromEmail,
    fromName,
    fallbackApproved,
    profile: profile || null,
  };
}

function missingKeyBlocker() {
  return 'RESEND_API_KEY is not configured in env/keyholder/.secrets. Add the key server-side; do not paste it into chat or commit it.';
}

async function resendRequest(endpoint, options = {}, runtime = {}) {
  const config = runtime.config || getResendConfig(runtime);
  if (!config.apiKey) {
    const error = new Error(missingKeyBlocker());
    error.status = 503;
    error.blocker = missingKeyBlocker();
    throw error;
  }
  const fetchImpl = runtime.fetchImpl || global.fetch;
  if (typeof fetchImpl !== 'function') {
    const error = new Error('No fetch implementation is available for Resend requests');
    error.status = 500;
    throw error;
  }
  const response = await fetchImpl(`${config.apiBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.raw || `Resend API error: ${response.status}`;
    const error = new Error(redactSecretText(message, [config.apiKey]));
    error.status = response.status;
    error.blocker = response.status === 401 || response.status === 403
      ? 'Resend rejected the API key or account context. Recheck the server-side Resend key and account ownership.'
      : redactSecretText(message, [config.apiKey]);
    error.payload = JSON.parse(redactSecretText(JSON.stringify(payload), [config.apiKey]) || '{}');
    throw error;
  }
  return payload;
}

function safeDomain(row = {}) {
  return {
    id: row.id || null,
    name: row.name || null,
    status: row.status || null,
    region: row.region || null,
    created_at: row.created_at || null,
    capabilities: row.capabilities || null,
    records: Array.isArray(row.records) ? row.records.map(safeDnsRecord) : [],
  };
}

function safeDnsRecord(record = {}) {
  return {
    record: record.record || record.name || null,
    name: record.name || record.host || record.record || null,
    type: record.type || null,
    value: record.value || null,
    ttl: record.ttl || null,
    priority: record.priority || null,
    status: record.status || null,
  };
}

function resendWebhookStatusForEvent(eventType = '') {
  return ({
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.delivery_delayed': 'delivery_delayed',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
  })[String(eventType || '').trim()] || String(eventType || '').trim().replace(/^email\./, '') || 'webhook_received';
}

function parseWebhookPayload(payload) {
  if (payload && typeof payload === 'object' && !Buffer.isBuffer(payload)) return payload;
  const raw = Buffer.isBuffer(payload) ? payload.toString('utf8') : String(payload || '').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function normalizeResendWebhookEvent(payload = {}) {
  const parsed = parseWebhookPayload(payload);
  const data = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
  const eventType = String(parsed.type || parsed.event || '').trim();
  const messageId = data.email_id || data.emailId || data.message_id || data.id || null;
  return {
    event_type: eventType,
    status: resendWebhookStatusForEvent(eventType),
    message_id: messageId ? String(messageId) : null,
    webhook_id: parsed.id || parsed.webhook_id || parsed.event_id || null,
    created_at: parsed.created_at || data.created_at || null,
    subject: data.subject || null,
    from: data.from || null,
    to: Array.isArray(data.to) ? data.to : (data.to ? [data.to] : []),
    payload: parsed,
    data,
  };
}

function safeWebhookSummary(event = {}) {
  return {
    resend_event: event.event_type || null,
    resend_webhook_id: event.webhook_id || null,
    resend_message_id: event.message_id || null,
    created_at: event.created_at || null,
  };
}

function headerValue(headers = {}, key = '') {
  if (!headers || !key) return '';
  if (typeof headers.get === 'function') return String(headers.get(key) || headers.get(key.toLowerCase()) || '');
  return String(headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()] || '');
}

function svixSecretBytes(secret = '') {
  const value = String(secret || '').trim();
  if (!value) return Buffer.alloc(0);
  const encoded = value.startsWith('whsec_') ? value.slice('whsec_'.length) : '';
  if (encoded) {
    try {
      const decoded = Buffer.from(encoded, 'base64');
      if (decoded.length) return decoded;
    } catch {
      // Fall through to plain-text comparison for non-Svix local test secrets.
    }
  }
  return Buffer.from(value, 'utf8');
}

function timingSafeEqualString(left = '', right = '') {
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyResendWebhookRequest({
  payload = '',
  headers = {},
  secret = '',
  toleranceSeconds = 300,
  nowMs = Date.now(),
} = {}) {
  const configuredSecret = String(secret || '').trim();
  if (!configuredSecret) {
    const error = new Error('RESEND_WEBHOOK_SECRET is not configured; signed Resend webhooks are blocked until the signing secret is installed.');
    error.status = 503;
    throw error;
  }

  const id = headerValue(headers, 'svix-id');
  const timestamp = headerValue(headers, 'svix-timestamp');
  const signatureHeader = headerValue(headers, 'svix-signature');
  if (!id || !timestamp || !signatureHeader) {
    const error = new Error('Missing Resend Svix webhook headers');
    error.status = 401;
    throw error;
  }

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    const error = new Error('Invalid Resend webhook timestamp');
    error.status = 401;
    throw error;
  }
  const ageSeconds = Math.abs(Math.floor(nowMs / 1000) - timestampSeconds);
  if (toleranceSeconds && ageSeconds > toleranceSeconds) {
    const error = new Error('Expired Resend webhook timestamp');
    error.status = 401;
    throw error;
  }

  const rawPayload = Buffer.isBuffer(payload) ? payload.toString('utf8') : String(payload || '');
  const signedContent = `${id}.${timestamp}.${rawPayload}`;
  const expected = crypto
    .createHmac('sha256', svixSecretBytes(configuredSecret))
    .update(signedContent)
    .digest('base64');
  const signatures = String(signatureHeader || '')
    .split(/\s+/)
    .flatMap((item) => item.split(',').length === 2 ? [item.split(',')[1]] : [])
    .filter(Boolean);
  if (!signatures.some((signature) => timingSafeEqualString(signature, expected))) {
    const error = new Error('Invalid Resend webhook signature');
    error.status = 401;
    throw error;
  }
  return {
    configured: true,
    verified: true,
    method: 'svix',
    svix_id: id,
    svix_timestamp: timestampSeconds,
  };
}

async function storeResendWebhookEvent(db, event = {}, verification = {}) {
  if (!db || typeof db.query !== 'function') return { stored: false, duplicate: false, event_row: null };
  const payload = safeWebhookSummary(event);
  const row = (await db.query(
    `INSERT INTO bna_resend_webhook_events (
       svix_id, svix_timestamp, event_type, provider_message_id, delivery_status, payload, processing_status
     ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'queued')
     ON CONFLICT (svix_id) DO UPDATE
       SET duplicate_count = bna_resend_webhook_events.duplicate_count + 1,
           last_seen_at = NOW()
     RETURNING *`,
    [
      verification.svix_id || event.webhook_id || null,
      verification.svix_timestamp || null,
      event.event_type || 'unknown',
      event.message_id || null,
      event.status || 'webhook_received',
      JSON.stringify(payload),
    ]
  )).rows?.[0] || null;
  return {
    stored: Boolean(row),
    duplicate: Number(row?.duplicate_count || 0) > 0,
    event_row: row,
  };
}

async function markResendWebhookEventProcessed(db, eventId, patch = {}) {
  if (!eventId || !db || typeof db.query !== 'function') return null;
  return (await db.query(
    `UPDATE bna_resend_webhook_events
     SET processing_status = $2,
         communication_id = COALESCE($3, communication_id),
         email_log_id = COALESCE($4, email_log_id),
         error = $5,
         processed_at = CASE WHEN $2 IN ('processed', 'dead_letter') THEN NOW() ELSE processed_at END,
         last_seen_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      eventId,
      patch.processing_status || 'processed',
      patch.communication_id || null,
      patch.email_log_id || null,
      patch.error || null,
    ]
  )).rows?.[0] || null;
}

async function processResendWebhook({
  payload = {},
  rawPayload = '',
  headers = {},
  secret = '',
  suppliedSecret = '',
  db,
  logCommunication,
} = {}) {
  const raw = rawPayload || (typeof payload === 'string' ? payload : JSON.stringify(payload || {}));
  const verification = verifyResendWebhookRequest({ payload: raw, headers, secret });
  const event = normalizeResendWebhookEvent(payload);
  const metadata = safeWebhookSummary(event);
  const storedEvent = await storeResendWebhookEvent(db, event, verification);
  if (storedEvent.duplicate) {
    await markResendWebhookEventProcessed(db, storedEvent.event_row?.id, { processing_status: 'duplicate' });
    return {
      success: true,
      accepted: true,
      duplicate: true,
      event: event.event_type,
      status: event.status,
      message_id: event.message_id,
      verification,
      processing_status: 'duplicate',
      updated_count: 0,
    };
  }
  let updated = [];
  let emailLogId = null;

  if (event.message_id && db && typeof db.query === 'function') {
    updated = (await db.query(
      `UPDATE bna_communications
       SET status = $2,
           metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
       WHERE external_message_id = $1
          OR metadata->>'resend_message_id' = $1
       RETURNING *`,
      [event.message_id, event.status, JSON.stringify(metadata)]
    )).rows || [];
    const emailLog = await db.query(
      `UPDATE bna_email_log
       SET status = CASE WHEN $2 IN ('delivered', 'bounced', 'complained', 'opened', 'clicked', 'delivery_delayed') THEN $2 ELSE status END,
           metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
       WHERE provider_message_id = $1
       RETURNING id`,
      [event.message_id, event.status, JSON.stringify(metadata)]
    ).catch(() => ({ rows: [] }));
    emailLogId = emailLog.rows?.[0]?.id || null;
  }

  if (!updated.length && typeof logCommunication === 'function') {
    const communication = await logCommunication({
      channel: 'email',
      direction: 'outbound',
      communicationType: 'resend_webhook',
      subject: event.subject || null,
      fromAddress: event.from || null,
      toAddress: event.to.join(', ') || null,
      externalMessageId: event.message_id,
      provider: 'resend',
      status: event.status,
      metadata,
    });
    updated = communication ? [communication] : [];
  }

  await markResendWebhookEventProcessed(db, storedEvent.event_row?.id, {
    processing_status: 'processed',
    communication_id: updated[0]?.id || null,
    email_log_id: emailLogId,
  });

  return {
    success: true,
    accepted: true,
    event: event.event_type,
    status: event.status,
    message_id: event.message_id,
    verification,
    processing_status: 'processed',
    stored_event_id: storedEvent.event_row?.id || null,
    updated_count: updated.length,
  };
}

async function listResendDomains(runtime = {}) {
  const payload = await resendRequest('/domains', { method: 'GET' }, runtime);
  const rows = Array.isArray(payload.data) ? payload.data : Array.isArray(payload.domains) ? payload.domains : [];
  return rows.map(safeDomain);
}

async function getResendDomainStatus(domain, runtime = {}) {
  const wanted = String(domain || '').trim().toLowerCase();
  const domains = await listResendDomains(runtime);
  if (!wanted) return { domain: null, domains };
  return {
    domain: domains.find((item) => String(item.name || '').toLowerCase() === wanted) || null,
    domains,
  };
}

async function verifyResendDomain(domain, runtime = {}) {
  const status = await getResendDomainStatus(domain, runtime);
  if (!status.domain?.id) {
    const error = new Error('Configured Resend domain was not found in the connected account');
    error.status = 404;
    throw error;
  }
  const payload = await resendRequest(`/domains/${encodeURIComponent(status.domain.id)}/verify`, {
    method: 'POST',
    body: JSON.stringify({}),
  }, runtime);
  return {
    requested: true,
    domain: status.domain.name,
    result: payload,
  };
}

async function getResendReadiness(runtime = {}) {
  const config = runtime.config || getResendConfig(runtime);
  const base = {
    configured: Boolean(config.apiKey),
    connected: false,
    provider: 'resend',
    account_owner: config.accountOwner,
    provider_account: config.providerAccount || null,
    domain: config.domain || null,
    from: config.from || null,
    from_email: config.fromEmail || null,
    domain_verified: false,
    send_allowed: false,
    fallback_approved: Boolean(config.fallbackApproved),
    blocker: null,
    domains: [],
  };
  if (!config.apiKey) return { ...base, blocker: missingKeyBlocker() };
  if (!config.fromEmail) {
    return {
      ...base,
      connected: false,
      blocker: 'RESEND_FROM or RESEND_FROM_EMAIL is not configured. Drafts are allowed; production send is blocked.',
    };
  }
  try {
    const status = await getResendDomainStatus(config.domain, { ...runtime, config });
    const domain = status.domain;
    const domainVerified = Boolean(domain && String(domain.status || '').toLowerCase() === 'verified');
    const sendAllowed = Boolean(domainVerified || config.fallbackApproved);
    let blocker = null;
    if (!config.domain) {
      blocker = 'RESEND_DOMAIN is not configured. Drafts are allowed; production send is blocked until the sending domain is explicit.';
    } else if (!domain) {
      blocker = `Resend API key works, but ${config.domain} was not found in this Resend account. Drafts are allowed; production send is blocked.`;
    } else if (!domainVerified && !config.fallbackApproved) {
      blocker = `Resend API key works, but ${config.domain} is not verified for production send. Drafts are allowed; production send is blocked until DNS is complete or an approved fallback is configured.`;
    }
    return {
      ...base,
      connected: true,
      domain_verified: domainVerified,
      send_allowed: sendAllowed,
      blocker,
      domain_status: domain?.status || null,
      domains: status.domains,
    };
  } catch (error) {
    return {
      ...base,
      connected: false,
      blocker: error?.blocker || redactSecretText(error?.message || 'Resend connection failed', [config.apiKey]),
    };
  }
}

async function sendResendEmail({ from, to, cc = [], bcc = [], replyTo = null, subject, html, text, metadata = {} } = {}, runtime = {}) {
  const config = runtime.config || getResendConfig(runtime);
  const readiness = await getResendReadiness({ ...runtime, config });
  if (!readiness.send_allowed) {
    const error = new Error(readiness.blocker || 'Resend send is blocked until account/domain readiness passes');
    error.status = 409;
    error.send_blocked = true;
    error.readiness = readiness;
    throw error;
  }
  const recipients = Array.isArray(to) ? to : [to].filter(Boolean);
  if (!recipients.length || !subject || (!text && !html)) {
    const error = new Error('to, subject, and text/html are required');
    error.status = 400;
    throw error;
  }
  const approval = requireExternalApproval({
    provider: 'resend',
    action: 'send',
    riskLevel: 'high',
    previewOnly: false,
    confirm: runtime.confirm || runtime.confirmationPhrase || metadata.confirm || metadata.confirmation_phrase,
    accountOwner: config.accountOwner,
    mode: config.domain || 'unknown_domain',
    secrets: [config.apiKey],
  });
  const payload = await resendRequest('/emails', {
    method: 'POST',
    body: JSON.stringify({
      from: from || config.from,
      to: recipients,
      ...(cc.length ? { cc } : {}),
      ...(bcc.length ? { bcc } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
      ...(metadata && Object.keys(metadata).length ? { headers: { 'X-BNA-Source': 'operations' } } : {}),
    }),
  }, { ...runtime, config });
  return {
    provider: 'resend',
    id: payload.id || payload.data?.id || null,
    payload,
    readiness,
    approval,
  };
}

module.exports = {
  domainFromEmail,
  getResendConfig,
  getResendDomainStatus,
  getResendReadiness,
  listResendDomains,
  normalizeEmail,
  normalizeResendWebhookEvent,
  processResendWebhook,
  resendRequest,
  resendWebhookStatusForEvent,
  sendResendEmail,
  verifyResendWebhookRequest,
  verifyResendDomain,
};
