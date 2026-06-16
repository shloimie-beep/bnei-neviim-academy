const videoHosting = require('./video-hosting');
const { redactError, redactSecretText } = require('./secret-loader');

const VIMEO_API_BASE = 'https://api.vimeo.com';

function normalizeVimeoTokenInput(input = '') {
  const raw = typeof input === 'object' && input !== null
    ? input.token || input.access_token || input.accessToken || input.VIMEO_ACCESS_TOKEN || ''
    : input;
  let token = String(raw || '').trim();
  token = token.replace(/^VIMEO_ACCESS_TOKEN\s*=\s*/i, '').trim();
  token = token.replace(/^Bearer\s+/i, '').trim();
  token = token.replace(/^['"]|['"]$/g, '').trim();
  if (!token || /^(your|paste|todo|changeme|example|placeholder)/i.test(token)) return '';
  return token;
}

function redactVimeoToken(value = '') {
  return redactSecretText(String(value || ''), [normalizeVimeoTokenInput(value)]).replace(/[A-Za-z0-9._-]{18,}/g, '[redacted]');
}

function parseVimeoUrl(value = '') {
  const text = String(value || '').trim();
  if (!text) return { ok: false, provider: 'vimeo', id: '', url: '', error: 'missing_url' };
  const match = text.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d{5,})/i);
  if (!match) return { ok: false, provider: 'vimeo', id: '', url: text, error: 'not_vimeo_url' };
  return {
    ok: true,
    provider: 'vimeo',
    id: match[1],
    url: text,
    embed_url: `https://player.vimeo.com/video/${match[1]}`,
  };
}

function mapVimeoApiErrorToAction(error = {}) {
  const status = Number(error.status || error.statusCode || error.response?.status || 0);
  const message = String(error.message || error.error || '').toLowerCase();
  if (status === 401 || status === 403) return 'needs_primary_account_holder_or_valid_token';
  if (status === 404) return 'needs_private_upload_scope';
  if (status === 429) return 'retry_later_rate_limited';
  if (/upload access|paid plan|quota|upgrade/.test(message)) return 'needs_paid_plan_or_upload_access';
  if (/scope|permission/.test(message)) return 'needs_private_upload_scope';
  return 'manual_upload_required';
}

async function vimeoApiRequest(path, { token, fetchImpl = globalThis.fetch, method = 'GET', body = null, apiBase = VIMEO_API_BASE } = {}) {
  const normalizedToken = normalizeVimeoTokenInput(token);
  if (!normalizedToken) {
    const error = new Error('Vimeo access token is not configured.');
    error.status = 401;
    throw error;
  }
  if (typeof fetchImpl !== 'function') {
    const error = new Error('Fetch is not available for Vimeo API checks.');
    error.status = 503;
    throw error;
  }
  const response = await fetchImpl(`${apiBase.replace(/\/+$/, '')}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${normalizedToken}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 500) };
  }
  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `Vimeo API request failed with ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function testVimeoAuth(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  if (!token) {
    return {
      provider: 'vimeo',
      ok: false,
      status: 'needs_api_key',
      action: 'needs_primary_account_holder',
      external_write_performed: false,
      blocker: 'Vimeo token is not configured. Log in as the primary account holder, create a Vimeo API app, and generate a token.',
    };
  }
  try {
    const user = await vimeoApiRequest('/me', { ...options, token });
    return {
      provider: 'vimeo',
      ok: true,
      status: 'api_auth_ready',
      external_write_performed: false,
      account: {
        name: user?.name || null,
        uri: user?.uri || null,
        account: user?.account || null,
      },
    };
  } catch (error) {
    return {
      provider: 'vimeo',
      ok: false,
      status: mapVimeoApiErrorToAction(error),
      external_write_performed: false,
      error: redactError(error, [token]),
    };
  }
}

async function listVimeoFolders(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  if (!token) return { provider: 'vimeo', ok: false, status: 'needs_api_key', folders: [], external_write_performed: false };
  try {
    const data = await vimeoApiRequest('/me/projects?per_page=25', { ...options, token });
    return {
      provider: 'vimeo',
      ok: true,
      status: 'api_auth_ready',
      folders: Array.isArray(data?.data) ? data.data.map((item) => ({ name: item.name || '', uri: item.uri || '' })) : [],
      external_write_performed: false,
    };
  } catch (error) {
    return { provider: 'vimeo', ok: false, status: mapVimeoApiErrorToAction(error), folders: [], external_write_performed: false, error: redactError(error, [token]) };
  }
}

async function listRecentVimeoVideos(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  if (!token) return { provider: 'vimeo', ok: false, status: 'needs_api_key', videos: [], external_write_performed: false };
  try {
    const data = await vimeoApiRequest('/me/videos?per_page=10&sort=date&direction=desc', { ...options, token });
    return {
      provider: 'vimeo',
      ok: true,
      status: 'api_auth_ready',
      videos: Array.isArray(data?.data)
        ? data.data.map((item) => ({ name: item.name || '', uri: item.uri || '', link: item.link || '', privacy: item.privacy || null }))
        : [],
      external_write_performed: false,
    };
  } catch (error) {
    return { provider: 'vimeo', ok: false, status: mapVimeoApiErrorToAction(error), videos: [], external_write_performed: false, error: redactError(error, [token]) };
  }
}

function createVimeoUploadIntent(payload = {}, options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  const readiness = videoHosting.getVideoHostingReadiness({
    ...options,
    config: {
      providerDecision: 'vimeo',
      vimeoToken: token,
      accountOwner: options.accountOwner || 'unknown',
      vimeoPlan: options.vimeoPlan || '',
    },
  });
  const apiReady = Boolean(token && options.uploadAccess === true);
  return {
    provider: 'vimeo',
    preview_only: true,
    external_write_performed: false,
    status: apiReady ? 'api_upload_ready' : 'manual_upload_required',
    upload_method: apiReady ? 'tus_or_pull_after_approval' : 'manual_upload_then_paste_url',
    title: String(payload.title || 'Untitled Vimeo upload').slice(0, 180),
    readiness,
    approval_required: true,
    required_confirmation: 'UPLOAD_VIDEO',
  };
}

function attachVimeoUrl(payload = {}) {
  const parsed = parseVimeoUrl(payload.vimeo_url || payload.url || payload.media_url);
  if (!parsed.ok) {
    return {
      provider: 'vimeo',
      ok: false,
      status: parsed.error,
      external_write_performed: false,
      blocker: 'Paste a valid Vimeo URL before attaching it to a library item.',
    };
  }
  return {
    provider: 'vimeo',
    ok: true,
    status: 'manual_vimeo_url_attached',
    external_write_performed: false,
    content_id: payload.content_id || payload.contentId || null,
    library_item: {
      media_provider: 'vimeo',
      media_url: parsed.url,
      vimeo_id: parsed.id,
      embed_url: parsed.embed_url,
      publish_status: 'needs_approval',
    },
  };
}

module.exports = {
  ...videoHosting,
  attachVimeoUrl,
  createVimeoUploadIntent,
  listRecentVimeoVideos,
  listVimeoFolders,
  mapVimeoApiErrorToAction,
  normalizeVimeoTokenInput,
  parseVimeoUrl,
  redactVimeoToken,
  testVimeoAuth,
};
