const {
  loadConfigValue,
  loadSecret,
  redactSecretText,
} = require('./secret-loader');
const {
  requireExternalApproval,
} = require('./external-actions');
const crypto = require('node:crypto');

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
  const configValue = (suffix, slug) => {
    const profileEnvName = envFor(suffix);
    const genericEnvName = `RESEND_${suffix}`;
    const profileSlug = profile ? `resend-${profile}-${slug}` : '';
    const names = [profileSlug, `resend-${slug}`].filter(Boolean);
    const fileNames = [
      `${profileEnvName}.txt`,
      profileSlug ? `${profileSlug}.txt` : '',
      `resend-${slug}.txt`,
      `${genericEnvName}.txt`,
    ].filter(Boolean);
    const profileValue = loadConfigValue({
      envName: profileEnvName,
      names,
      fileNames,
      ...loaderOptions,
    });
    if (profileValue || profileEnvName === genericEnvName) return profileValue;
    return loadConfigValue({
      envName: genericEnvName,
      names: [`resend-${slug}`],
      fileNames: [`resend-${slug}.txt`, `${genericEnvName}.txt`],
      ...loaderOptions,
    });
  };
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
  const providerAccount = String(options.providerAccount || configValue('PROVIDER_ACCOUNT', 'provider-account') || '').trim();
  const rawFrom = String(options.from || configValue('FROM', 'from') || '').trim();
  const fromEmail = normalizeEmail(options.fromEmail || rawFrom || configValue('FROM_EMAIL', 'from-email'));
  const fromName = String(options.fromName || configValue('FROM_NAME', 'from-name') || '').trim();
  const from = rawFrom || (fromEmail ? (fromName ? `${fromName} <${fromEmail}>` : fromEmail) : '');
  const domain = String(options.domain || configValue('DOMAIN', 'domain') || domainFromEmail(fromEmail)).trim().toLowerCase();
  const fallbackApproved = options.fallbackApproved !== undefined
    ? Boolean(options.fallbackApproved)
    : parseBoolean(loadConfigValue({
      envName: 'RESEND_SEND_FALLBACK_APPROVED',
      names: ['resend-send-fallback-approved'],
      fileNames: ['resend-send-fallback-approved.txt', 'RESEND_SEND_FALLBACK_APPROVED.txt'],
      ...loaderOptions,
    }));
  const replyTo = normalizeEmail(options.replyTo || options.reply_to || configValue('REPLY_TO', 'reply-to'));
  return {
    apiKey,
    apiBase,
    accountOwner,
    providerAccount,
    domain,
    from,
    fromEmail,
    fromName,
    replyTo,
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
    reply_to: config.replyTo || null,
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
      ...((replyTo || config.replyTo) ? { reply_to: replyTo || config.replyTo } : {}),
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

function headerValue(headers = {}, name = '') {
  if (!headers || !name) return '';
  if (typeof headers.get === 'function') return String(headers.get(name) || '');
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (String(key || '').toLowerCase() === wanted) {
      return Array.isArray(value) ? String(value[0] || '') : String(value || '');
    }
  }
  return '';
}

function svixSecretBytes(secret = '') {
  const trimmed = String(secret || '').trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('whsec_')) {
    try {
      const decoded = Buffer.from(trimmed.slice('whsec_'.length), 'base64');
      if (decoded.length) return decoded;
    } catch {}
  }
  return Buffer.from(trimmed, 'utf8');
}

function svixSignatureCandidates(signatureHeader = '') {
  return String(signatureHeader || '')
    .split(/\s+/)
    .flatMap((entry) => entry.split(';'))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [version, signature] = entry.split(',', 2);
      return { version, signature };
    })
    .filter((entry) => entry.version === 'v1' && entry.signature);
}

function timingSafeBase64Equal(expectedBase64, candidateBase64) {
  let expected;
  let candidate;
  try {
    expected = Buffer.from(expectedBase64, 'base64');
    candidate = Buffer.from(candidateBase64, 'base64');
  } catch {
    return false;
  }
  return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
}

function verifyResendWebhookSignature({
  payload = '',
  headers = {},
  webhookSecret = '',
  toleranceSeconds = 5 * 60,
  now = Date.now(),
} = {}) {
  const secretBytes = svixSecretBytes(webhookSecret);
  const id = headerValue(headers, 'svix-id');
  const timestamp = headerValue(headers, 'svix-timestamp');
  const signatureHeader = headerValue(headers, 'svix-signature');
  if (!secretBytes) {
    const error = new Error('RESEND_WEBHOOK_SECRET is not configured');
    error.status = 503;
    error.blocker = 'RESEND_WEBHOOK_SECRET is not configured. Create the Resend webhook and add the signing secret server-side.';
    throw error;
  }
  if (!id || !timestamp || !signatureHeader) {
    const error = new Error('Missing required Resend webhook Svix headers');
    error.status = 401;
    throw error;
  }
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    const error = new Error('Invalid Resend webhook timestamp');
    error.status = 401;
    throw error;
  }
  if (toleranceSeconds !== null && toleranceSeconds !== undefined) {
    const ageSeconds = Math.abs(Math.floor(Number(now) / 1000) - timestampSeconds);
    if (ageSeconds > Number(toleranceSeconds)) {
      const error = new Error('Resend webhook timestamp is outside the allowed tolerance');
      error.status = 401;
      throw error;
    }
  }
  const rawPayload = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
  const signedContent = `${id}.${timestamp}.${rawPayload}`;
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');
  const valid = svixSignatureCandidates(signatureHeader)
    .some((candidate) => timingSafeBase64Equal(expected, candidate.signature));
  if (!valid) {
    const error = new Error('Invalid Resend webhook signature');
    error.status = 401;
    throw error;
  }
  try {
    return JSON.parse(rawPayload || '{}');
  } catch {
    const error = new Error('Invalid Resend webhook JSON payload');
    error.status = 400;
    throw error;
  }
}

async function getReceivedEmail(emailId, runtime = {}) {
  const id = String(emailId || '').trim();
  if (!id) {
    const error = new Error('Resend received email id is required');
    error.status = 400;
    throw error;
  }
  return resendRequest(`/emails/receiving/${encodeURIComponent(id)}?html_format=cid`, {
    method: 'GET',
  }, runtime);
}

module.exports = {
  domainFromEmail,
  getReceivedEmail,
  getResendConfig,
  getResendDomainStatus,
  getResendReadiness,
  listResendDomains,
  normalizeEmail,
  resendRequest,
  sendResendEmail,
  verifyResendWebhookSignature,
  verifyResendDomain,
};
