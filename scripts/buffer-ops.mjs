import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const bufferIntegration = require('../src/lib/integrations/buffer-client');
const envLocalPath = path.join(repoRoot, '.env.local');
const bufferSecretFilePath = path.join(repoRoot, '.secrets', 'buffer-api-key.txt');
const BUFFER_API_BASE = 'https://api.buffer.com';

let cachedBufferConfig = null;
let cachedAccounts = null;
let cachedBufferOrganizations = null;

function parseEnvBlock(rawValue) {
  if (!rawValue) return {};

  return String(rawValue)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex <= 0) return acc;
      acc[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1).trim();
      return acc;
    }, {});
}

function readEnvBlockFile(filePath) {
  try {
    return parseEnvBlock(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function pickToken(rawToken, inlineToken, fileToken) {
  if (rawToken && !rawToken.includes('\n') && !/^[A-Z0-9_]+=/.test(rawToken)) {
    return rawToken.trim();
  }
  return inlineToken || fileToken || '';
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function getBufferConfig() {
  if (cachedBufferConfig) return cachedBufferConfig;

  const envFile = fs.existsSync(envLocalPath)
    ? parseEnvBlock(fs.readFileSync(envLocalPath, 'utf8'))
    : {};
  const secretFile = readEnvBlockFile(bufferSecretFilePath);
  const inlineSecrets = parseEnvBlock(process.env.BUFFER_API_KEY || '');
  const runtimeConfig = bufferIntegration.getBufferConfig({ repoRoot });

  const token = runtimeConfig.apiKey || pickToken(
    process.env.BUFFER_API_KEY || envFile.BUFFER_API_KEY,
    inlineSecrets.BUFFER_API_KEY || envFile.BUFFER_API_KEY,
    secretFile.BUFFER_API_KEY
  );
  if (!token) {
    throw new Error('BUFFER_API_KEY not configured');
  }

  cachedBufferConfig = {
    token,
    apiBase: runtimeConfig.apiBase || process.env.BUFFER_API_BASE || envFile.BUFFER_API_BASE || secretFile.BUFFER_API_BASE || BUFFER_API_BASE,
    organizationId: runtimeConfig.organizationId || process.env.BUFFER_ORGANIZATION_ID || envFile.BUFFER_ORGANIZATION_ID || secretFile.BUFFER_ORGANIZATION_ID || '',
  };
  return cachedBufferConfig;
}

async function bufferGraphql(query, variables = {}) {
  const config = getBufferConfig();
  const response = await fetch(config.apiBase, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok || data.errors) {
    const message = data.errors?.map((item) => item.message).filter(Boolean).join('; ')
      || data.raw
      || `Buffer ${response.status}`;
    throw new Error(`Buffer ${response.status}: ${message}`);
  }
  return data.data || {};
}

async function listBufferOrganizations() {
  if (cachedBufferOrganizations) return cachedBufferOrganizations;
  const data = await bufferGraphql(`
    query GetOrganizations {
      account {
        organizations {
          id
          name
          ownerEmail
        }
      }
    }
  `);
  cachedBufferOrganizations = data.account?.organizations || [];
  return cachedBufferOrganizations;
}

export async function listSocialAccounts(forceRefresh = false) {
  if (cachedAccounts && !forceRefresh) return cachedAccounts;
  const { organizationId } = getBufferConfig();
  const organizationIds = organizationId
    ? [organizationId]
    : (await listBufferOrganizations()).map((organization) => organization.id).filter(Boolean);
  const accounts = [];
  for (const currentOrganizationId of organizationIds) {
    const data = await bufferGraphql(`
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
    `, { organizationId: currentOrganizationId });
    accounts.push(...(data.channels || []).map((channel) => ({
      ...channel,
      platform: channel.service,
      name: channel.displayName || channel.name || channel.service,
      originId: channel.id,
      organizationId: currentOrganizationId,
      isExpired: false,
      deleted: false,
      provider: 'buffer',
    })));
  }
  cachedAccounts = accounts;
  return accounts;
}

export function buildAccountAliases(accounts) {
  const aliasMap = new Map();
  const platformCounts = new Map();

  for (const account of accounts) {
    const platform = slugify(account.platform || 'account');
    const name = slugify(account.name || 'connected-account');
    const locality = slugify(account?.meta?.storefrontAddress?.locality || '');
    const shortOrigin = String(account.originId || '').slice(-4);
    const baseAlias = [platform, name, locality || shortOrigin].filter(Boolean).join(':');
    const count = (platformCounts.get(baseAlias) || 0) + 1;
    platformCounts.set(baseAlias, count);
    const alias = count > 1 ? `${baseAlias}-${count}` : baseAlias;
    aliasMap.set(alias, account);
  }

  return aliasMap;
}

export async function createSocialPost({
  accountId,
  summary,
  media = [],
  publishNow = false,
}) {
  if (media.length) {
    throw new Error('Buffer media posting from Telegram needs hosted asset URLs; this bridge currently creates text Buffer drafts only.');
  }
  const requestedPublishNow = Boolean(publishNow);
  const mode = 'addToQueue';
  const saveToDraft = true;
  const data = await bufferGraphql(`
    mutation CreateBufferPost($text: String!, $channelId: ChannelId!, $saveToDraft: Boolean!) {
      createPost(input: {
        text: $text
        channelId: $channelId
        schedulingType: automatic
        mode: ${mode}
        saveToDraft: $saveToDraft
      }) {
        ... on PostActionSuccess {
          post {
            id
            text
            status
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `, { text: summary || '', channelId: accountId, saveToDraft });
  if (data.createPost?.message && !data.createPost?.post) {
    throw new Error(data.createPost.message);
  }
  return {
    results: {
      post: {
        _id: data.createPost?.post?.id || '',
        id: data.createPost?.post?.id || '',
        status: data.createPost?.post?.status || 'draft',
        requested_publish_now: requestedPublishNow,
        publish_blocked_by_policy: requestedPublishNow,
      },
    },
    provider: 'buffer',
    raw: data.createPost || null,
  };
}

export async function listBlogs() {
  return [
    {
      id: 'first-party-bna-blog',
      name: 'BNA website blog',
      url: '/blog',
      provider: 'first-party',
    },
  ];
}
