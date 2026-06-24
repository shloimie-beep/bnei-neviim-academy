const videoHosting = require('./video-hosting');
const { redactError, redactSecretText } = require('./secret-loader');

const VIMEO_API_BASE = 'https://api.vimeo.com';
const VIMEO_READINESS_STATES = Object.freeze([
  'not_configured',
  'preview_only',
  'mock_tested',
  'credential_missing',
  'credential_invalid',
  'permission_missing',
  'test_target_missing',
  'private_test_ready',
  'private_test_uploaded',
  'manual_ready',
  'automated_ready',
  'live',
]);

const READY_VIMEO_STATES = new Set([
  'private_test_ready',
  'private_test_uploaded',
  'manual_ready',
  'automated_ready',
  'live',
]);

const RETRYABLE_VIMEO_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

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

function redactVimeoAssetId(value = '') {
  const text = String(value || '').trim();
  const id = (text.match(/\d{5,}/) || [text])[0] || '';
  if (!id) return '';
  return `[vimeo-id:...${id.slice(-4)}]`;
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

function mapVimeoApiErrorToReadinessState(error = {}) {
  const status = Number(error.status || error.statusCode || error.response?.status || 0);
  const message = String(error.message || error.error || error.data?.error || error.data?.message || '').toLowerCase();
  if (status === 401) return 'credential_invalid';
  if (status === 403 || /scope|permission|upload access|paid plan|quota|upgrade/.test(message)) return 'permission_missing';
  if (status === 404) return 'test_target_missing';
  if (status === 429 || status >= 500) return 'permission_missing';
  return 'permission_missing';
}

function vimeoReadinessState(state, fields = {}) {
  const normalized = VIMEO_READINESS_STATES.includes(state) ? state : 'preview_only';
  const ready = fields.ready !== undefined ? Boolean(fields.ready) : READY_VIMEO_STATES.has(normalized);
  const reason = String(fields.reason || '').trim()
    || (ready ? `${normalized} is available for this safe Vimeo lane.` : `${normalized} requires a concrete next action before use.`);
  const nextAction = String(fields.next_action || fields.nextAction || '').trim()
    || (ready ? 'Keep privacy defaults private/unlisted and record evidence before any live use.' : 'Complete the missing Vimeo setup item, then rerun the readiness check.');
  return {
    provider: 'vimeo',
    status: normalized,
    readiness_status: normalized,
    ready,
    reason,
    next_action: nextAction,
    external_write_performed: fields.external_write_performed === true,
    public_publish_performed: false,
    ...fields,
    status: normalized,
    readiness_status: normalized,
    ready,
    reason,
    next_action: nextAction,
    public_publish_performed: false,
  };
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

async function readVimeoResponse(response) {
  if (!response) return {};
  if (typeof response.text === 'function') {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { raw: String(text || '').slice(0, 500) };
    }
  }
  if (typeof response.json === 'function') return response.json();
  return {};
}

function createVimeoClient(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const apiBase = String(options.apiBase || VIMEO_API_BASE).replace(/\/+$/, '');
  const timeoutMs = Number(options.timeoutMs || 20000);
  async function request(path, requestOptions = {}) {
    if (!token) {
      const error = new Error('Vimeo access token is not configured.');
      error.status = 401;
      throw error;
    }
    if (typeof fetchImpl !== 'function') {
      const error = new Error('Fetch is not available for Vimeo API checks.');
      error.status = 503;
      throw error;
    }
    const absolute = /^https?:\/\//i.test(String(path || ''));
    const controller = timeoutMs > 0 && typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    if (timeout && typeof timeout.unref === 'function') timeout.unref();
    try {
      const response = await fetchImpl(absolute ? path : `${apiBase}${path}`, {
        method: requestOptions.method || 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
          ...(requestOptions.body !== undefined && requestOptions.body !== null && requestOptions.rawBody !== true ? { 'Content-Type': 'application/json' } : {}),
          ...(requestOptions.headers || {}),
        },
        body: requestOptions.rawBody === true ? requestOptions.body : (requestOptions.body !== undefined && requestOptions.body !== null ? JSON.stringify(requestOptions.body) : null),
        signal: controller?.signal,
      });
      const data = await readVimeoResponse(response);
      if (!response.ok) {
        const error = new Error(data?.error || data?.message || `Vimeo API request failed with ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (error) {
      if (error?.name === 'AbortError') {
        const timeoutError = new Error(`Vimeo API request timed out after ${timeoutMs}ms.`);
        timeoutError.status = 408;
        throw timeoutError;
      }
      throw error;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
  return {
    request,
    redacted_token_present: Boolean(token),
  };
}

async function retryVimeoOperation(operation, options = {}) {
  const retries = Math.max(0, Number(options.retries ?? 2));
  const attempts = [];
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await operation({ attempt: attempt + 1, attempts });
      return {
        ok: true,
        result,
        attempts: [...attempts, { attempt: attempt + 1, status: 'success' }],
      };
    } catch (error) {
      lastError = error;
      const status = Number(error.status || error.statusCode || 0);
      attempts.push({ attempt: attempt + 1, status: 'failed', error_status: status || null });
      if (!RETRYABLE_VIMEO_STATUSES.has(status) || attempt >= retries) break;
    }
  }
  return {
    ok: false,
    error: lastError,
    attempts,
  };
}

function normalizeVimeoPrivacy(input = {}) {
  const requested = String(input.privacy || input.view || input.visibility || 'private').trim().toLowerCase();
  const allowPublic = input.allowPublicPublish === true || input.allow_public_publish === true;
  const view = (() => {
    if (['private', 'nobody', 'disable', 'disabled'].includes(requested)) return 'nobody';
    if (['unlisted', 'anybody_unlisted'].includes(requested)) return 'unlisted';
    if (['embed_only', 'embed-only', 'embed'].includes(requested)) return 'embed_only';
    if (['public', 'anybody'].includes(requested) && allowPublic) return 'anybody';
    return 'nobody';
  })();
  const embed = String(input.embed || input.embedPrivacy || input.embed_privacy || 'private').trim().toLowerCase();
  return {
    requested,
    view,
    embed: ['public', 'private', 'whitelist'].includes(embed) ? embed : 'private',
    safe_default_applied: view !== 'anybody',
    public_publish_allowed: allowPublic,
    public_publish_performed: false,
  };
}

function normalizeVimeoMetadata(input = {}) {
  const metadata = input.metadata && typeof input.metadata === 'object' ? input.metadata : input;
  const title = String(input.title || metadata.title || metadata.name || 'BNA Vimeo test asset').trim().slice(0, 180);
  const descriptionParts = [
    input.description || metadata.description || '',
    metadata.class_session_id || input.class_session_id ? `Class session: ${metadata.class_session_id || input.class_session_id}` : '',
    metadata.transcript_id || input.transcript_id ? `Transcript: ${metadata.transcript_id || input.transcript_id}` : '',
  ].filter(Boolean);
  return {
    title,
    name: title,
    description: descriptionParts.join('\n').slice(0, 4500),
    class_session_id: String(input.class_session_id || input.classSessionId || metadata.class_session_id || '').trim() || null,
    transcript_id: String(input.transcript_id || input.transcriptId || metadata.transcript_id || '').trim() || null,
    workspace_key: String(input.workspace_key || input.workspaceKey || metadata.workspace_key || '').trim() || null,
    project_key: String(input.project_key || input.projectKey || metadata.project_key || '').trim() || null,
    provider_owner: String(input.provider_owner || input.providerOwner || metadata.provider_owner || '').trim() || null,
    tags: Array.isArray(input.tags || metadata.tags) ? (input.tags || metadata.tags).map((tag) => String(tag).trim()).filter(Boolean).slice(0, 20) : [],
    synthetic_test: input.synthetic_test === true || input.syntheticTest === true || metadata.synthetic_test === true,
    test_only: input.test_only === true || input.testOnly === true || metadata.test_only === true,
  };
}

function buildThumbnailState(video = {}) {
  const pictures = video.pictures || {};
  const sizes = Array.isArray(pictures.sizes) ? pictures.sizes : [];
  const largest = sizes.slice().sort((a, b) => Number(b.width || 0) - Number(a.width || 0))[0] || null;
  return {
    status: pictures.active === false || !largest ? 'thumbnail_missing' : 'thumbnail_ready',
    thumbnail_url: largest?.link || largest?.link_with_play_button || null,
    width: largest?.width || null,
    height: largest?.height || null,
    source: largest ? 'vimeo_pictures' : 'none',
  };
}

function buildPlaybackState(video = {}) {
  const uri = String(video.uri || '').trim();
  const parsed = parseVimeoUrl(video.link || uri);
  const status = String(video.status || video.transcode?.status || '').toLowerCase();
  const deleted = video.deleted === true || ['deleted', 'removed'].includes(status) || video.resource_key === null && /deleted/.test(String(video.message || '').toLowerCase());
  const unavailable = deleted || ['error', 'unavailable', 'uploading', 'transcoding'].includes(status);
  const id = parsed.id || (uri.match(/\d{5,}/) || [''])[0];
  return {
    status: deleted ? 'deleted' : (unavailable ? 'unavailable' : 'available'),
    vimeo_id: id || null,
    playback_url: id ? `https://vimeo.com/${id}` : (video.link || null),
    embed_url: id ? `https://player.vimeo.com/video/${id}` : (video.embed?.html ? 'vimeo_embed_html_present' : null),
    deleted,
    unavailable,
    reason: deleted ? 'Vimeo reports the asset as deleted.' : (unavailable ? `Vimeo playback is ${status || 'unavailable'}.` : 'Vimeo playback metadata is available.'),
  };
}

function normalizeVimeoVideo(video = {}) {
  const playback = buildPlaybackState(video);
  const privacy = video.privacy || {};
  return {
    provider: 'vimeo',
    uri: video.uri || null,
    link: video.link || null,
    name: video.name || null,
    description: video.description || null,
    duration_seconds: Number.isFinite(Number(video.duration)) ? Number(video.duration) : null,
    privacy: {
      view: privacy.view || null,
      embed: privacy.embed || null,
      download: privacy.download || null,
    },
    thumbnail: buildThumbnailState(video),
    playback,
    status: playback.deleted ? 'deleted' : (playback.unavailable ? 'unavailable' : 'available'),
    redacted_asset_id: redactVimeoAssetId(playback.vimeo_id || video.uri || ''),
    raw_included: false,
  };
}

function buildVimeoDuplicateKey(input = {}) {
  const metadata = normalizeVimeoMetadata(input);
  return [
    metadata.workspace_key || 'workspace',
    metadata.project_key || 'project',
    metadata.class_session_id || 'class',
    metadata.transcript_id || 'transcript',
    metadata.title,
    input.source_sha256 || input.sourceHash || input.synthetic_hash || '',
  ].join(':').replace(/[^A-Za-z0-9:_-]/g, '_').slice(0, 180);
}

function duplicateMatches(candidate = {}, duplicateKey = '') {
  const haystack = [
    candidate.name,
    candidate.description,
    candidate.metadata?.duplicate_key,
    candidate.metadata?.connections?.duplicate_key,
  ].map((value) => String(value || '')).join('\n');
  return Boolean(duplicateKey && haystack.includes(duplicateKey));
}

async function findDuplicateVimeoVideo(input = {}, options = {}) {
  const duplicateKey = input.duplicate_key || input.duplicateKey || buildVimeoDuplicateKey(input);
  if (Array.isArray(options.existingVideos)) {
    const match = options.existingVideos.find((video) => duplicateMatches(video, duplicateKey));
    return {
      duplicate_key: duplicateKey,
      found: Boolean(match),
      video: match ? normalizeVimeoVideo(match) : null,
      external_write_performed: false,
    };
  }
  if (!options.checkRemoteDuplicates) {
    return { duplicate_key: duplicateKey, found: false, video: null, external_write_performed: false };
  }
  const client = options.client || createVimeoClient(options);
  try {
    const data = await client.request(`/me/videos?per_page=25&query=${encodeURIComponent(duplicateKey)}`);
    const videos = Array.isArray(data?.data) ? data.data : [];
    const match = videos.find((video) => duplicateMatches(video, duplicateKey));
    return {
      duplicate_key: duplicateKey,
      found: Boolean(match),
      video: match ? normalizeVimeoVideo(match) : null,
      external_write_performed: false,
    };
  } catch (error) {
    return {
      duplicate_key: duplicateKey,
      found: false,
      video: null,
      external_write_performed: false,
      error: redactError(error, [options.token || options.accessToken || options.vimeoToken]),
    };
  }
}

function resolveVimeoTestTarget(options = {}, folders = []) {
  const projectUri = String(
    options.testProjectUri || options.vimeoTestProjectUri || options.VIMEO_TEST_PROJECT_URI || process.env.VIMEO_TEST_PROJECT_URI || process.env.BNA_VIMEO_TEST_PROJECT_URI || ''
  ).trim();
  const projectName = String(
    options.testProjectName || options.vimeoTestProjectName || options.VIMEO_TEST_PROJECT_NAME || process.env.VIMEO_TEST_PROJECT_NAME || process.env.BNA_VIMEO_TEST_PROJECT_NAME || ''
  ).trim();
  const matched = projectName
    ? folders.find((folder) => String(folder.name || '').trim().toLowerCase() === projectName.toLowerCase())
    : null;
  const uri = projectUri || matched?.uri || '';
  return {
    ok: Boolean(uri),
    type: 'vimeo_project',
    uri,
    name: projectName || matched?.name || '',
    reason: uri ? 'A Vimeo private test project/folder is configured.' : 'No Vimeo private test project/folder is configured.',
    next_action: 'Create or identify a Vimeo project/folder for BNA synthetic private tests and set VIMEO_TEST_PROJECT_URI or VIMEO_TEST_PROJECT_NAME.',
  };
}

function accountMatchesExpected(user = {}, options = {}) {
  const expectedUri = String(options.expectedAccountUri || options.VIMEO_EXPECTED_ACCOUNT_URI || process.env.VIMEO_EXPECTED_ACCOUNT_URI || '').trim();
  const expectedName = String(options.expectedAccountName || options.VIMEO_EXPECTED_ACCOUNT_NAME || process.env.VIMEO_EXPECTED_ACCOUNT_NAME || '').trim();
  const confirmed = options.accountConfirmed === true
    || options.BNA_VIMEO_TEST_ACCOUNT_CONFIRMED === true
    || /^(1|true|yes)$/i.test(String(process.env.BNA_VIMEO_TEST_ACCOUNT_CONFIRMED || '').trim());
  const uriMatches = expectedUri ? String(user.uri || '').trim() === expectedUri : true;
  const nameMatches = expectedName ? String(user.name || '').trim().toLowerCase() === expectedName.toLowerCase() : true;
  return {
    ok: confirmed && uriMatches && nameMatches,
    confirmed,
    expected_uri_present: Boolean(expectedUri),
    expected_name_present: Boolean(expectedName),
    uri_matches: uriMatches,
    name_matches: nameMatches,
    redacted_account: {
      name: user.name || null,
      uri: user.uri ? `${String(user.uri).replace(/\d{3,}/g, '...')}` : null,
      account: user.account || null,
    },
  };
}

async function checkVimeoTokenCapabilities(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken || process.env.VIMEO_ACCESS_TOKEN);
  if (!token) {
    return vimeoReadinessState('credential_missing', {
      ok: false,
      reason: 'Vimeo access token is missing from env/keyholder/.secrets.',
      next_action: 'Create a Vimeo app token with private, upload, edit, and video_files scopes, then store it as VIMEO_ACCESS_TOKEN server-side.',
      capabilities: { read_account: false, upload: false, edit_metadata: false, private_playback: false },
    });
  }
  const client = options.client || createVimeoClient({ ...options, token });
  try {
    const user = await client.request('/me');
    let folders = [];
    if (!options.skipTargetLookup) {
      if (options.client) {
        const folderData = await client.request('/me/projects?per_page=25');
        folders = Array.isArray(folderData?.data) ? folderData.data.map((item) => ({ name: item.name || '', uri: item.uri || '' })) : [];
      } else {
        const foldersResult = await listVimeoFolders({ ...options, token, fetchImpl: options.fetchImpl || globalThis.fetch });
        folders = foldersResult.ok ? foldersResult.folders : [];
      }
    }
    const account = accountMatchesExpected(user, options);
    if (options.requireExpectedAccount !== false && !account.ok) {
      return vimeoReadinessState('test_target_missing', {
        ok: false,
        reason: 'Vimeo token works, but the intended test account has not been explicitly confirmed.',
        next_action: 'Set BNA_VIMEO_TEST_ACCOUNT_CONFIRMED=true plus expected account URI or name before any private synthetic upload.',
        account: account.redacted_account,
        capabilities: { read_account: true, upload: false, edit_metadata: false, private_playback: false },
      });
    }
    const target = resolveVimeoTestTarget(options, folders);
    if (!target.ok) {
      return vimeoReadinessState('test_target_missing', {
        ok: false,
        reason: target.reason,
        next_action: target.next_action,
        account: account.redacted_account,
        capabilities: { read_account: true, upload: false, edit_metadata: false, private_playback: false },
      });
    }
    return vimeoReadinessState('private_test_ready', {
      ok: true,
      reason: 'Vimeo token, intended test account, and private test target are configured for a synthetic private upload.',
      next_action: 'Run the private synthetic smoke with a non-sensitive generated video and keep privacy private/unlisted.',
      account: account.redacted_account,
      target,
      capabilities: {
        read_account: true,
        upload: true,
        edit_metadata: true,
        private_playback: true,
      },
    });
  } catch (error) {
    const status = mapVimeoApiErrorToReadinessState(error);
    return vimeoReadinessState(status, {
      ok: false,
      reason: status === 'credential_invalid'
        ? 'Vimeo rejected the configured access token.'
        : 'Vimeo token does not have the capability required for safe private upload testing.',
      next_action: status === 'credential_invalid'
        ? 'Regenerate the Vimeo token from the intended app/account and update VIMEO_ACCESS_TOKEN server-side.'
        : 'Confirm the Vimeo plan and token scopes include private, upload, edit, and video_files access.',
      error: redactError(error, [token]),
      capabilities: { read_account: false, upload: false, edit_metadata: false, private_playback: false },
    });
  }
}

function createVimeoUploadRequest(payload = {}, options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken || payload.token);
  const metadata = normalizeVimeoMetadata(payload);
  const privacy = normalizeVimeoPrivacy({ ...payload, ...options });
  const size = Number(payload.size_bytes || payload.sizeBytes || payload.size || payload.file_size || payload.fileSize || 0);
  const duplicateKey = payload.duplicate_key || payload.duplicateKey || buildVimeoDuplicateKey({ ...payload, ...metadata });
  if (!token && options.requireToken !== false) {
    return vimeoReadinessState('credential_missing', {
      ok: false,
      preview_only: true,
      reason: 'Cannot create an automated Vimeo upload request without VIMEO_ACCESS_TOKEN.',
      next_action: 'Use manual_ready URL attachment, or configure a Vimeo token for private testing.',
      upload_request: null,
    });
  }
  if (!size || size < 1) {
    return vimeoReadinessState('test_target_missing', {
      ok: false,
      preview_only: true,
      reason: 'Automated Vimeo upload needs a declared synthetic file size.',
      next_action: 'Provide a synthetic non-sensitive media file and pass its byte size before requesting an upload.',
      upload_request: null,
    });
  }
  return vimeoReadinessState('private_test_ready', {
    ok: true,
    preview_only: options.previewOnly !== false,
    reason: 'A safe private/unlisted Vimeo upload request can be created for the provided synthetic asset.',
    next_action: 'Submit this request only inside the private synthetic smoke or an explicitly approved automated upload path.',
    upload_request: {
      method: 'POST',
      path: '/me/videos',
      body: {
        upload: {
          approach: 'tus',
          size,
        },
        name: metadata.name,
        description: [metadata.description, `BNA duplicate key: ${duplicateKey}`].filter(Boolean).join('\n\n').slice(0, 4500),
        privacy: {
          view: privacy.view,
          embed: privacy.embed,
        },
      },
      duplicate_key: duplicateKey,
      privacy,
      metadata,
    },
  });
}

async function uploadVimeoAsset(payload = {}, options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken || process.env.VIMEO_ACCESS_TOKEN);
  const bytes = Buffer.isBuffer(payload.bytes)
    ? payload.bytes
    : (payload.bytes ? Buffer.from(payload.bytes) : null);
  const size = Number(payload.size_bytes || payload.sizeBytes || bytes?.length || 0);
  const request = createVimeoUploadRequest({ ...payload, size_bytes: size }, { ...options, token, previewOnly: false });
  if (!request.ok) return request;
  const duplicate = await findDuplicateVimeoVideo({ ...payload, duplicate_key: request.upload_request.duplicate_key }, options);
  if (duplicate.found && options.allowDuplicate !== true) {
    return vimeoReadinessState('private_test_uploaded', {
      ok: true,
      duplicate_protected: true,
      reason: 'A matching Vimeo asset already exists, so no duplicate upload was performed.',
      next_action: 'Use the existing redacted asset for playback/metadata verification or choose a new duplicate key.',
      redacted_asset_id: duplicate.video?.redacted_asset_id || null,
      video: duplicate.video,
      progress_events: [{ uploaded_bytes: 0, total_bytes: size, percent: 0, duplicate_protected: true }],
    });
  }
  if (!bytes || !size) {
    return vimeoReadinessState('test_target_missing', {
      ok: false,
      reason: 'No synthetic upload bytes were provided.',
      next_action: 'Provide bytes from a non-sensitive synthetic test video before running an automated upload.',
    });
  }
  const client = options.client || createVimeoClient({ ...options, token });
  const progressEvents = [];
  const emitProgress = (uploadedBytes) => {
    const event = {
      uploaded_bytes: uploadedBytes,
      total_bytes: size,
      percent: size ? Math.round((uploadedBytes / size) * 100) : 0,
    };
    progressEvents.push(event);
    if (typeof options.onProgress === 'function') options.onProgress(event);
  };
  emitProgress(0);
  const init = await retryVimeoOperation(() => client.request(request.upload_request.path, {
    method: 'POST',
    body: request.upload_request.body,
  }), { retries: options.retries ?? 2 });
  if (!init.ok) {
    return vimeoReadinessState(mapVimeoApiErrorToReadinessState(init.error), {
      ok: false,
      reason: 'Vimeo upload creation failed after retry handling.',
      next_action: 'Review token scopes, upload permission, quota, and test target, then rerun the private smoke.',
      retry_attempts: init.attempts,
      error: redactError(init.error, [token]),
    });
  }
  const created = init.result || {};
  const uploadLink = created.upload?.upload_link;
  if (!uploadLink) {
    return vimeoReadinessState('permission_missing', {
      ok: false,
      reason: 'Vimeo did not return a TUS upload link.',
      next_action: 'Confirm upload scope and account plan support API upload.',
      retry_attempts: init.attempts,
    });
  }
  const patch = await retryVimeoOperation(() => client.request(uploadLink, {
    method: 'PATCH',
    rawBody: true,
    body: bytes,
    headers: {
      'Tus-Resumable': '1.0.0',
      'Upload-Offset': '0',
      'Content-Type': 'application/offset+octet-stream',
    },
  }), { retries: options.retries ?? 2 });
  if (!patch.ok) {
    return vimeoReadinessState(mapVimeoApiErrorToReadinessState(patch.error), {
      ok: false,
      reason: 'Vimeo resumable upload failed after retry handling.',
      next_action: 'Retry with the same duplicate key after confirming upload quota and network stability.',
      retry_attempts: [...init.attempts, ...patch.attempts],
      error: redactError(patch.error, [token]),
    });
  }
  emitProgress(size);
  const videoId = (String(created.uri || '').match(/\d{5,}/) || [''])[0];
  if (options.testProjectUri && videoId) {
    const projectAttach = await retryVimeoOperation(() => client.request(`${options.testProjectUri.replace(/\/+$/, '')}/videos/${videoId}`, { method: 'PUT' }), { retries: options.retries ?? 2 });
    if (!projectAttach.ok) {
      return vimeoReadinessState(mapVimeoApiErrorToReadinessState(projectAttach.error), {
        ok: false,
        reason: 'Vimeo project/folder attachment failed after upload.',
        next_action: 'Confirm the test project URI and token folder permissions before rerunning smoke.',
        retry_attempts: [...init.attempts, ...patch.attempts, ...projectAttach.attempts],
        error: redactError(projectAttach.error, [token]),
      });
    }
  }
  if (videoId && options.markTestOnly !== false) {
    const metadataUpdate = await retryVimeoOperation(() => client.request(`/videos/${videoId}`, {
      method: 'PATCH',
      body: {
        name: request.upload_request.metadata.name,
        description: `${request.upload_request.body.description}\n\nTEST ONLY: synthetic BNA private smoke asset.`,
        privacy: request.upload_request.body.privacy,
      },
    }), { retries: options.retries ?? 2 });
    if (!metadataUpdate.ok) {
      return vimeoReadinessState(mapVimeoApiErrorToReadinessState(metadataUpdate.error), {
        ok: false,
        reason: 'Vimeo test-only metadata update failed after upload.',
        next_action: 'Confirm edit scope before treating automated upload as ready.',
        retry_attempts: [...init.attempts, ...patch.attempts, ...metadataUpdate.attempts],
        error: redactError(metadataUpdate.error, [token]),
      });
    }
  }
  let playbackVerification = {
    status: 'not_requested',
    result: null,
    external_write_performed: false,
  };
  if (videoId && options.verifyPlayback === true) {
    const playbackCheck = await retryVimeoOperation(() => client.request(`/videos/${videoId}`), { retries: options.retries ?? 2 });
    if (!playbackCheck.ok) {
      playbackVerification = {
        status: 'unavailable',
        result: null,
        external_write_performed: false,
        error: redactError(playbackCheck.error, [token]),
      };
    } else {
      playbackVerification = {
        status: 'verified',
        result: normalizeVimeoVideo(playbackCheck.result),
        external_write_performed: false,
      };
    }
  }
  const normalized = playbackVerification.result || normalizeVimeoVideo(created);
  return vimeoReadinessState('private_test_uploaded', {
    ok: true,
    reason: 'Synthetic Vimeo test asset was uploaded with private/unlisted privacy defaults.',
    next_action: 'Verify private playback, metadata update, and cleanup/test-only marking evidence before automated_ready.',
    video: normalized,
    redacted_asset_id: normalized.redacted_asset_id,
    privacy: request.upload_request.privacy,
    duplicate_key: request.upload_request.duplicate_key,
    progress_events: progressEvents,
    retry_attempts: [...init.attempts, ...patch.attempts],
    playback_verification: playbackVerification,
    external_write_performed: true,
    public_publish_performed: false,
  });
}

function isSyntheticTestAsset(input = {}) {
  const fileName = String(input.file_name || input.fileName || input.path || input.file_path || '').toLowerCase();
  const markedSynthetic = input.synthetic === true || input.synthetic_test === true || input.syntheticTest === true;
  const nonSensitive = input.contains_sensitive_data !== true && input.containsSensitiveData !== true && input.real_class_recording !== true && input.realClassRecording !== true;
  const namedSafely = /synthetic|test|smoke|fixture|sample/.test(fileName);
  return markedSynthetic && nonSensitive && namedSafely;
}

async function runVimeoPrivateSyntheticSmoke(options = {}) {
  const enabled = options.enabled === true || /^(1|true|yes)$/i.test(String(process.env.BNA_VIMEO_PRIVATE_SMOKE || '').trim());
  if (!enabled) {
    return vimeoReadinessState('preview_only', {
      ok: false,
      reason: 'Private synthetic Vimeo smoke is opt-in and was not enabled.',
      next_action: 'Set BNA_VIMEO_PRIVATE_SMOKE=1 only after token, intended test account, test project, and synthetic media are confirmed.',
      smoke_ran: false,
    });
  }
  const token = normalizeVimeoTokenInput(options.token || process.env.VIMEO_ACCESS_TOKEN);
  const capability = await checkVimeoTokenCapabilities({ ...options, token });
  if (!capability.ok) return { ...capability, smoke_ran: false };
  const fs = require('node:fs');
  const filePath = String(options.syntheticFile || options.synthetic_file || process.env.BNA_VIMEO_SYNTHETIC_TEST_FILE || '').trim();
  if (!filePath || !fs.existsSync(filePath)) {
    return vimeoReadinessState('test_target_missing', {
      ok: false,
      reason: 'Synthetic non-sensitive media file for Vimeo private smoke is missing.',
      next_action: 'Create a tiny synthetic test video and set BNA_VIMEO_SYNTHETIC_TEST_FILE to its local path.',
      smoke_ran: false,
    });
  }
  const stat = fs.statSync(filePath);
  const asset = {
    file_name: filePath,
    synthetic: true,
    synthetic_test: true,
    contains_sensitive_data: false,
    size_bytes: stat.size,
  };
  if (!isSyntheticTestAsset(asset)) {
    return vimeoReadinessState('test_target_missing', {
      ok: false,
      reason: 'The configured smoke file is not clearly marked as synthetic/non-sensitive.',
      next_action: 'Use a filename containing synthetic/test/smoke/fixture/sample and confirm it contains no student or class recording data.',
      smoke_ran: false,
    });
  }
  const bytes = fs.readFileSync(filePath);
  const upload = await uploadVimeoAsset({
    title: options.title || 'BNA synthetic Vimeo private smoke',
    description: 'Synthetic, non-sensitive BNA Vimeo private smoke asset.',
    bytes,
    size_bytes: bytes.length,
    synthetic_test: true,
    test_only: true,
    workspace_key: options.workspace_key || 'bna',
    project_key: options.project_key || 'one_time_mishnah_class',
    source_sha256: `${stat.size}-${stat.mtimeMs}`,
    privacy: options.privacy || 'private',
  }, {
    ...options,
    token,
    testProjectUri: capability.target?.uri,
    markTestOnly: true,
    checkRemoteDuplicates: true,
    verifyPlayback: true,
  });
  return {
    ...upload,
    smoke_ran: upload.ok === true,
    destination: capability.target,
    cleanup_or_test_only_state: upload.ok ? 'test_only_marked' : 'not_uploaded',
  };
}

function buildVimeoAuditEvent(action, payload = {}) {
  return {
    provider: 'vimeo',
    action: String(action || 'vimeo_media_event'),
    workspace_key: payload.workspace_key || payload.workspaceKey || null,
    project_key: payload.project_key || payload.projectKey || null,
    class_session_id: payload.class_session_id || payload.classSessionId || null,
    transcript_id: payload.transcript_id || payload.transcriptId || null,
    redacted_asset_id: redactVimeoAssetId(payload.vimeo_id || payload.vimeoId || payload.provider_asset_id || payload.providerAssetId || ''),
    external_write_performed: payload.external_write_performed === true,
    public_publish_performed: false,
    created_at: payload.created_at || new Date().toISOString(),
  };
}

function checkMemberVideoEntitlement(context = {}, video = {}, entitlement = {}) {
  const contextWorkspace = String(context.workspace_key || context.workspace?.workspace_key || context.workspace?.key || context.workspace_id || context.workspace?.id || '').trim();
  const videoWorkspace = String(video.workspace_key || video.workspaceKey || video.workspace_id || video.workspaceId || '').trim();
  if (videoWorkspace && contextWorkspace && videoWorkspace !== contextWorkspace) {
    return {
      allowed: false,
      status: 'cross_workspace_denied',
      reason: 'Member context workspace does not match the video workspace.',
      next_action: 'Load the member from the same workspace as the video asset before playback.',
    };
  }
  if (video.deleted === true || video.playback?.deleted === true) {
    return {
      allowed: false,
      status: 'deleted_video',
      reason: 'Vimeo asset is deleted.',
      next_action: 'Detach the deleted asset or attach a replacement Vimeo URL.',
    };
  }
  if (video.playback?.unavailable === true || video.status === 'unavailable') {
    return {
      allowed: false,
      status: 'unavailable_playback',
      reason: 'Vimeo playback is unavailable.',
      next_action: 'Wait for processing or replace the unavailable asset before granting member playback.',
    };
  }
  const active = entitlement.active === true || ['active', 'trialing', 'paid', 'manual_grant'].includes(String(entitlement.status || '').toLowerCase());
  const courseMatch = !video.course_id || !entitlement.course_id || String(video.course_id) === String(entitlement.course_id);
  const tier = String(entitlement.tier || entitlement.plan || 'library').toLowerCase();
  const tierAllowed = ['library', 'library_only', 'full', 'premium', 'member', 'manual_grant'].includes(tier);
  return {
    allowed: active && courseMatch && tierAllowed,
    status: active && courseMatch && tierAllowed ? 'member_entitled' : 'member_entitlement_missing',
    reason: active && courseMatch && tierAllowed ? 'Member entitlement permits scoped private playback.' : 'Member needs an active matching video-library entitlement.',
    next_action: active && courseMatch && tierAllowed ? 'Render the private embed only inside the member workspace.' : 'Confirm membership/course entitlement before playback.',
  };
}

function linkVimeoVideoToClassSession(input = {}) {
  const parsed = parseVimeoUrl(input.vimeo_url || input.vimeoUrl || input.playback_url || input.playbackUrl || input.media_url || input.mediaUrl || input.vimeo_id || input.vimeoId || '');
  const vimeoId = parsed.id || String(input.vimeo_id || input.vimeoId || '').trim();
  const workspaceKey = String(input.workspace_key || input.workspaceKey || 'bna').trim();
  const projectKey = String(input.project_key || input.projectKey || 'one_time_mishnah_class').trim();
  const classSessionId = String(input.class_session_id || input.classSessionId || '').trim();
  const transcriptId = String(input.transcript_id || input.transcriptId || '').trim();
  const ok = Boolean(vimeoId && classSessionId);
  return {
    ok,
    provider: 'vimeo',
    status: ok ? 'manual_ready' : 'test_target_missing',
    readiness_status: ok ? 'manual_ready' : 'test_target_missing',
    reason: ok ? 'Vimeo asset can be linked to a scoped class session.' : 'Class-session linkage needs both a Vimeo ID/URL and class_session_id.',
    next_action: ok ? 'Save the scoped video metadata and keep member publication approval-gated.' : 'Provide class_session_id and a valid Vimeo URL before linking.',
    workspace_key: workspaceKey,
    project_key: projectKey,
    class_session_linkage: {
      class_session_id: classSessionId || null,
      linked: ok,
    },
    transcript_linkage: {
      transcript_id: transcriptId || null,
      linked: Boolean(transcriptId),
      status: transcriptId ? 'linked' : 'missing_transcript',
    },
    video_asset: vimeoId ? {
      provider: 'vimeo',
      provider_asset_id: vimeoId,
      playback_url: parsed.embed_url || `https://player.vimeo.com/video/${vimeoId}`,
      privacy: input.privacy || 'workspace',
      workspace_key: workspaceKey,
      project_key: projectKey,
      class_session_id: classSessionId || null,
      transcript_reference: transcriptId || null,
      status: input.video_status || 'draft_reference',
    } : null,
    audit_event: buildVimeoAuditEvent('vimeo_class_session_linked', {
      workspace_key: workspaceKey,
      project_key: projectKey,
      class_session_id: classSessionId,
      transcript_id: transcriptId,
      vimeo_id: vimeoId,
      external_write_performed: false,
    }),
    external_write_performed: false,
    public_publish_performed: false,
  };
}

function assertNoVimeoSecrets(value, secrets = []) {
  const text = JSON.stringify(value || {});
  const redacted = redactSecretText(text, secrets);
  return {
    ok: redacted === text && !/(VIMEO_ACCESS_TOKEN|client_secret|Authorization: Bearer|Bearer\s+[A-Za-z0-9._-]{12,})/i.test(text),
    secret_values_included: redacted !== text,
  };
}

async function testVimeoAuth(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  if (!token) {
    return {
      provider: 'vimeo',
      ok: false,
      status: 'credential_missing',
      legacy_status: 'needs_api_key',
      action: 'needs_primary_account_holder',
      external_write_performed: false,
      blocker: 'Vimeo token is not configured. Log in as the primary account holder, create a Vimeo API app, and generate a token.',
      reason: 'Vimeo access token is missing.',
      next_action: 'Store VIMEO_ACCESS_TOKEN server-side; do not paste it into chat or tracked files.',
    };
  }
  try {
    const user = await vimeoApiRequest('/me', { ...options, token });
    return {
      provider: 'vimeo',
      ok: true,
      status: 'private_test_ready',
      legacy_status: 'api_auth_ready',
      external_write_performed: false,
      reason: 'Vimeo token can read the account.',
      next_action: 'Confirm intended test account and test project before synthetic upload.',
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
      status: mapVimeoApiErrorToReadinessState(error),
      legacy_status: mapVimeoApiErrorToAction(error),
      external_write_performed: false,
      reason: 'Vimeo token validation failed.',
      next_action: 'Confirm token validity, scopes, owner account, and plan permissions.',
      error: redactError(error, [token]),
    };
  }
}

async function listVimeoFolders(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  if (!token) return { provider: 'vimeo', ok: false, status: 'credential_missing', legacy_status: 'needs_api_key', folders: [], external_write_performed: false, reason: 'Vimeo token is missing.', next_action: 'Configure VIMEO_ACCESS_TOKEN before folder checks.' };
  try {
    const data = await vimeoApiRequest('/me/projects?per_page=25', { ...options, token });
    return {
      provider: 'vimeo',
      ok: true,
      status: 'private_test_ready',
      legacy_status: 'api_auth_ready',
      folders: Array.isArray(data?.data) ? data.data.map((item) => ({ name: item.name || '', uri: item.uri || '' })) : [],
      external_write_performed: false,
    };
  } catch (error) {
    return { provider: 'vimeo', ok: false, status: mapVimeoApiErrorToReadinessState(error), legacy_status: mapVimeoApiErrorToAction(error), folders: [], external_write_performed: false, error: redactError(error, [token]), reason: 'Vimeo folder check failed.', next_action: 'Confirm token scopes and project/folder availability.' };
  }
}

async function listRecentVimeoVideos(options = {}) {
  const token = normalizeVimeoTokenInput(options.token || options.accessToken || options.vimeoToken);
  if (!token) return { provider: 'vimeo', ok: false, status: 'credential_missing', legacy_status: 'needs_api_key', videos: [], external_write_performed: false, reason: 'Vimeo token is missing.', next_action: 'Configure VIMEO_ACCESS_TOKEN before video checks.' };
  try {
    const data = await vimeoApiRequest('/me/videos?per_page=10&sort=date&direction=desc', { ...options, token });
    return {
      provider: 'vimeo',
      ok: true,
      status: 'private_test_ready',
      legacy_status: 'api_auth_ready',
      videos: Array.isArray(data?.data)
        ? data.data.map((item) => ({ name: item.name || '', uri: item.uri || '', link: item.link || '', privacy: item.privacy || null }))
        : [],
      external_write_performed: false,
    };
  } catch (error) {
    return { provider: 'vimeo', ok: false, status: mapVimeoApiErrorToReadinessState(error), legacy_status: mapVimeoApiErrorToAction(error), videos: [], external_write_performed: false, error: redactError(error, [token]), reason: 'Vimeo recent-video check failed.', next_action: 'Confirm token scopes and account access.' };
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
    status: apiReady ? 'automated_ready' : 'manual_ready',
    legacy_status: apiReady ? 'api_upload_ready' : 'manual_upload_required',
    upload_method: apiReady ? 'tus_or_pull_after_approval' : 'manual_upload_then_paste_url',
    title: String(payload.title || 'Untitled Vimeo upload').slice(0, 180),
    readiness,
    approval_required: true,
    required_confirmation: 'UPLOAD_VIDEO',
    reason: apiReady ? 'Vimeo upload intent can be prepared after explicit approval.' : 'Manual Vimeo URL attachment is available while automated upload is not configured.',
    next_action: apiReady ? 'Use the private synthetic smoke before enabling automated upload.' : 'Upload manually in Vimeo, keep privacy private/unlisted, then paste the Vimeo URL for review.',
  };
}

function attachVimeoUrl(payload = {}) {
  const parsed = parseVimeoUrl(payload.vimeo_url || payload.url || payload.media_url);
  if (!parsed.ok) {
    return {
      provider: 'vimeo',
      ok: false,
      status: 'test_target_missing',
      legacy_status: parsed.error,
      external_write_performed: false,
      blocker: 'Paste a valid Vimeo URL before attaching it to a library item.',
      reason: 'Vimeo URL is missing or invalid.',
      next_action: 'Paste a valid Vimeo URL before attaching it to a library item.',
    };
  }
  return {
    provider: 'vimeo',
    ok: true,
    status: 'manual_ready',
    legacy_status: 'manual_vimeo_url_attached',
    external_write_performed: false,
    reason: 'Valid Vimeo URL can be attached for internal review.',
    next_action: 'Keep the library item approval-gated until playback, metadata, entitlement, and transcript checks pass.',
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
  READY_VIMEO_STATES,
  VIMEO_READINESS_STATES,
  attachVimeoUrl,
  assertNoVimeoSecrets,
  buildPlaybackState,
  buildThumbnailState,
  buildVimeoAuditEvent,
  buildVimeoDuplicateKey,
  checkMemberVideoEntitlement,
  checkVimeoTokenCapabilities,
  createVimeoClient,
  createVimeoUploadRequest,
  createVimeoUploadIntent,
  duplicateMatches,
  findDuplicateVimeoVideo,
  isSyntheticTestAsset,
  linkVimeoVideoToClassSession,
  listRecentVimeoVideos,
  listVimeoFolders,
  mapVimeoApiErrorToAction,
  mapVimeoApiErrorToReadinessState,
  normalizeVimeoMetadata,
  normalizeVimeoPrivacy,
  normalizeVimeoVideo,
  normalizeVimeoTokenInput,
  parseVimeoUrl,
  redactVimeoAssetId,
  redactVimeoToken,
  resolveVimeoTestTarget,
  retryVimeoOperation,
  runVimeoPrivateSyntheticSmoke,
  testVimeoAuth,
  uploadVimeoAsset,
  vimeoApiRequest,
  vimeoReadinessState,
};
