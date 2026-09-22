const {
  loadConfigValue,
  loadSecret,
  redactSecretText,
} = require('./secret-loader');

function parseList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '').split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
}

function getBufferConfig(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const apiKey = options.apiKey !== undefined
    ? String(options.apiKey || '').trim()
    : loadSecret({
      envName: 'BUFFER_API_KEY',
      names: ['buffer-api-key', 'BUFFER_API_KEY', 'buffer'],
      fileNames: ['buffer-api-key.txt', 'BUFFER_API_KEY.txt', 'buffer.txt'],
      repoRoot,
    }).value;
  const apiBase = String(options.apiBase || loadConfigValue({
    envName: 'BUFFER_API_BASE',
    names: ['buffer-api-key', 'buffer'],
    fileNames: ['buffer-api-key.txt', 'BUFFER_API_KEY.txt', 'buffer.txt'],
    repoRoot,
  }) || 'https://api.buffer.com').replace(/\/+$/, '');
  const organizationId = String(options.organizationId || loadConfigValue({
    envName: 'BUFFER_ORGANIZATION_ID',
    names: ['buffer-api-key', 'buffer-organization-id', 'buffer'],
    fileNames: ['buffer-api-key.txt', 'BUFFER_ORGANIZATION_ID.txt', 'buffer.txt'],
    repoRoot,
  }) || '').trim();
  const defaultChannelIds = parseList(options.defaultChannelIds || loadConfigValue({
    envName: 'BUFFER_DEFAULT_CHANNEL_IDS',
    names: ['buffer-api-key', 'buffer-default-channel-ids', 'buffer'],
    fileNames: ['buffer-api-key.txt', 'BUFFER_DEFAULT_CHANNEL_IDS.txt', 'buffer.txt'],
    repoRoot,
  }));
  return {
    apiKey,
    apiBase,
    organizationId,
    defaultChannelIds,
  };
}

function setupBlocker() {
  return 'BUFFER_API_KEY is not configured in env/keyholder/.secrets. Add the key server-side; do not paste it into chat or commit it.';
}

function normalizeBufferError(error, config = {}) {
  const message = redactSecretText(error?.message || String(error || 'Buffer request failed'), [config.apiKey]);
  const normalized = new Error(message);
  normalized.status = error?.status || error?.statusCode || 500;
  normalized.blocker = error?.blocker || message;
  normalized.body = redactSecretText(error?.body || '', [config.apiKey]).slice(0, 1000);
  normalized.hint = error?.hint || null;
  return normalized;
}

async function bufferRequest(query, variables = {}, options = {}) {
  const config = options.config || getBufferConfig(options);
  if (!config.apiKey) {
    const error = new Error(setupBlocker());
    error.status = 503;
    error.blocker = setupBlocker();
    throw error;
  }
  const fetchImpl = options.fetchImpl || global.fetch;
  if (typeof fetchImpl !== 'function') {
    const error = new Error('No fetch implementation is available for Buffer requests');
    error.status = 500;
    throw error;
  }

  let response;
  try {
    response = await fetchImpl(config.apiBase, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (error) {
    throw normalizeBufferError(error, config);
  }

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok || payload.errors) {
    const messages = Array.isArray(payload.errors)
      ? payload.errors.map((item) => item?.message).filter(Boolean)
      : [];
    const error = new Error(messages.join('; ') || payload.raw || `Buffer API error: ${response.status}`);
    error.status = response.status || 500;
    error.body = redactSecretText(JSON.stringify(payload), [config.apiKey]);
    error.blocker = response.status === 401 || response.status === 403
      ? 'Buffer rejected the API key or account context. Recheck the server-side Buffer key and organization ID.'
      : 'Buffer returned an API error. Check the channel IDs, organization ID, and post payload.';
    throw normalizeBufferError(error, config);
  }

  return payload.data || {};
}

function safeChannel(channel = {}, organizationId = '') {
  return {
    id: channel.id || null,
    name: channel.name || null,
    displayName: channel.displayName || channel.name || null,
    service: channel.service || channel.platform || null,
    platform: channel.service || channel.platform || null,
    avatar: channel.avatar || channel.avatarUrl || null,
    isQueuePaused: Boolean(channel.isQueuePaused || channel.paused),
    organizationId: channel.organizationId || organizationId || null,
  };
}

async function listBufferOrganizations(options = {}) {
  const data = await bufferRequest(`
    query GetOrganizations {
      account {
        organizations {
          id
          name
          ownerEmail
        }
      }
    }
  `, {}, options);
  return (data.account?.organizations || []).map((organization) => ({
    id: organization.id || null,
    name: organization.name || null,
    ownerEmail: organization.ownerEmail || null,
  }));
}

async function listBufferChannels(options = {}) {
  const config = options.config || getBufferConfig(options);
  const organizationId = String(options.organizationId || config.organizationId || '').trim();
  if (!organizationId) {
    const error = new Error('BUFFER_ORGANIZATION_ID is required before Buffer channels can be listed safely.');
    error.status = 409;
    error.blocker = 'Set BUFFER_ORGANIZATION_ID, or copy the intended Buffer channel IDs into server-side config before scheduling.';
    throw error;
  }
  const data = await bufferRequest(`
    query GetChannels($organizationId: OrganizationId!) {
      channels(input: { organizationId: $organizationId, filter: { isLocked: false } }) {
        id
        name
        displayName
        service
        avatar
        isQueuePaused
      }
    }
  `, { organizationId }, { ...options, config });
  return (data.channels || []).map((channel) => safeChannel(channel, organizationId));
}

async function testBufferConnection(options = {}) {
  const config = options.config || getBufferConfig(options);
  if (!config.apiKey) {
    return {
      configured: false,
      connected: false,
      provider: 'buffer',
      organization_id_configured: Boolean(config.organizationId),
      channels_count: 0,
      blocker: setupBlocker(),
      details: {},
    };
  }
  try {
    const organizations = await listBufferOrganizations({ ...options, config });
    let channels = [];
    let blocker = null;
    if (config.organizationId) {
      channels = await listBufferChannels({ ...options, config, organizationId: config.organizationId });
    } else {
      blocker = 'BUFFER_ORGANIZATION_ID is not configured. Buffer key works, but channel listing/scheduling needs the organization ID or explicit channel IDs.';
    }
    return {
      configured: true,
      connected: true,
      provider: 'buffer',
      organization_id_configured: Boolean(config.organizationId),
      channels_count: channels.length,
      blocker,
      details: {
        organizations_count: organizations.length,
      },
    };
  } catch (error) {
    const normalized = normalizeBufferError(error, config);
    return {
      configured: true,
      connected: false,
      provider: 'buffer',
      organization_id_configured: Boolean(config.organizationId),
      channels_count: 0,
      blocker: normalized.blocker || normalized.message,
      details: {
        status: normalized.status || null,
      },
    };
  }
}

function normalizeAssets(media = []) {
  return (Array.isArray(media) ? media : [])
    .map((item) => {
      if (item?.image || item?.video) return item;
      const url = String(item?.url || item?.media_url || '').trim();
      if (!url) return null;
      const type = String(item?.type || item?.media_type || '').toLowerCase();
      if (type.includes('video')) {
        return { video: { url, ...(item.thumbnail_url ? { thumbnailUrl: item.thumbnail_url } : {}) } };
      }
      return { image: { url } };
    })
    .filter(Boolean);
}

function createPostMutation() {
  return `
    mutation CreateBufferPost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            status
            text
            channel {
              id
              service
              displayName
            }
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;
}

async function createPostForChannels({ channelIds = [], text, inputPatch = {}, media = [] } = {}, options = {}) {
  const ids = parseList(channelIds);
  if (!ids.length) {
    const error = new Error('At least one Buffer channel id is required');
    error.status = 400;
    throw error;
  }
  const body = String(text || '').trim();
  if (!body) {
    const error = new Error('Post text is required');
    error.status = 400;
    throw error;
  }
  const assets = normalizeAssets(media);
  const posts = [];
  for (const channelId of ids) {
    const input = {
      text: body,
      channelId,
      source: 'bna_operations',
      ...inputPatch,
    };
    if (assets.length) input.assets = assets;
    const data = await bufferRequest(createPostMutation(), { input }, options);
    const result = data.createPost;
    if (result?.message && !result?.post) {
      const error = new Error(result.message);
      error.status = 422;
      throw error;
    }
    if (!result?.post?.id) {
      const error = new Error('Buffer did not return a created post id');
      error.status = 502;
      throw error;
    }
    posts.push(result.post);
  }
  return posts;
}

async function createBufferDraftPost({ channelIds, text, media = [], metadata = {} } = {}, options = {}) {
  const posts = await createPostForChannels({
    channelIds,
    text,
    media,
    inputPatch: {
      schedulingType: metadata.schedulingType || 'automatic',
      mode: 'addToQueue',
      saveToDraft: true,
    },
  }, options);
  return {
    provider: 'buffer',
    draft: true,
    posts,
  };
}

async function scheduleBufferPost({ channelIds, text, scheduledAt, media = [], confirmation = {} } = {}, options = {}) {
  if (!confirmation || confirmation.confirmed !== true) {
    const error = new Error('Explicit confirmation is required before scheduling a Buffer post');
    error.status = 409;
    throw error;
  }
  const dueAt = new Date(scheduledAt);
  if (!Number.isFinite(dueAt.getTime())) {
    const error = new Error('A valid scheduled_at timestamp is required');
    error.status = 400;
    throw error;
  }
  const posts = await createPostForChannels({
    channelIds,
    text,
    media,
    inputPatch: {
      schedulingType: 'scheduled',
      mode: 'customScheduled',
      dueAt: dueAt.toISOString(),
      saveToDraft: false,
    },
  }, options);
  return {
    provider: 'buffer',
    scheduled: true,
    posts,
  };
}

module.exports = {
  bufferRequest,
  createBufferDraftPost,
  getBufferConfig,
  listBufferChannels,
  listBufferOrganizations,
  scheduleBufferPost,
  setupBlocker,
  testBufferConnection,
};
