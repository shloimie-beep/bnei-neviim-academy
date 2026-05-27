import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretFilePath = path.join(repoRoot, '.secrets', 'ghl-pit-token.txt');

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2023-02-21';

let cachedConfig = null;
let cachedAccounts = null;
let cachedUserId = null;

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
  if (rawToken && !rawToken.includes('\n') && !rawToken.startsWith('GHL_PIT_TOKEN=')) {
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

export function getGhlConfig() {
  if (cachedConfig) return cachedConfig;

  const envFile = fs.existsSync(envLocalPath)
    ? parseEnvBlock(fs.readFileSync(envLocalPath, 'utf8'))
    : {};
  const secretFile = readEnvBlockFile(secretFilePath);
  const inlineSecrets = parseEnvBlock(process.env.GHL_PIT_TOKEN || '');

  const token = pickToken(
    process.env.GHL_PIT_TOKEN || envFile.GHL_PIT_TOKEN,
    inlineSecrets.GHL_PIT_TOKEN || envFile.GHL_PIT_TOKEN,
    secretFile.GHL_PIT_TOKEN
  );
  const locationId =
    process.env.GHL_LOCATION_ID ||
    envFile.GHL_LOCATION_ID ||
    inlineSecrets.GHL_LOCATION_ID ||
    secretFile.GHL_LOCATION_ID ||
    'IIofSrquLHvNxc8zrpka';

  if (!token) {
    throw new Error('GHL_PIT_TOKEN not configured');
  }

  cachedConfig = {
    token,
    locationId,
    apiBase: GHL_API_BASE,
    apiVersion: GHL_API_VERSION,
  };
  return cachedConfig;
}

async function ghlRequest(endpoint, options = {}) {
  const config = getGhlConfig();
  const url = `${config.apiBase}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${config.token}`,
    Accept: 'application/json',
    Version: config.apiVersion,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GHL ${response.status}: ${body.slice(0, 1200)}`);
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return response.text();
  }
  return response.json();
}

export async function listSocialAccounts(forceRefresh = false) {
  if (cachedAccounts && !forceRefresh) return cachedAccounts;
  const { locationId } = getGhlConfig();
  const data = await ghlRequest(`/social-media-posting/${locationId}/accounts`);
  const accounts = data?.results?.accounts || [];
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

export async function getDefaultUserId() {
  if (cachedUserId) return cachedUserId;
  const { locationId } = getGhlConfig();
  const data = await ghlRequest(`/users/?locationId=${encodeURIComponent(locationId)}`);
  const userId = data?.users?.[0]?.id;
  if (!userId) {
    throw new Error('No GHL user found for location');
  }
  cachedUserId = userId;
  return userId;
}

export async function uploadLocalFileToGhl(filePath, options = {}) {
  const { locationId, token, apiBase, apiVersion } = getGhlConfig();
  const fileBuffer = fs.readFileSync(filePath);
  const filename = options.filename || path.basename(filePath);
  const mimeType = options.mimeType || 'application/octet-stream';
  const form = new FormData();

  form.append('locationId', locationId);
  form.append('hosted', 'false');
  form.append('name', filename);
  form.append('file', new Blob([fileBuffer], { type: mimeType }), filename);

  const response = await fetch(`${apiBase}/medias/upload-file`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: apiVersion,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GHL media upload ${response.status}: ${body.slice(0, 1200)}`);
  }

  return response.json();
}

function inferSocialPostType(mediaItems, requestedTargets = []) {
  const hasVideo = mediaItems.some((item) => String(item.type || '').startsWith('video/'));
  const targets = requestedTargets.map((item) => item.toLowerCase());
  const googleOnly = targets.length > 0 && targets.every((item) => item === 'google');

  if (hasVideo && !googleOnly) return 'reel';
  return 'post';
}

export async function createSocialPost({
  accountId,
  summary,
  media = [],
  publishNow = false,
  targetPlatform = '',
}) {
  const { locationId } = getGhlConfig();
  const userId = await getDefaultUserId();
  const type = inferSocialPostType(media, [targetPlatform]);
  const body = {
    accountIds: [accountId],
    userId,
    summary: summary || '',
    media,
    type,
    status: publishNow ? 'published' : 'draft',
  };

  return ghlRequest(`/social-media-posting/${locationId}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function deleteSocialPost(postId) {
  const { locationId } = getGhlConfig();
  return ghlRequest(`/social-media-posting/${locationId}/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function listBlogs() {
  const { locationId } = getGhlConfig();
  const data = await ghlRequest(
    `/blogs/site/all?locationId=${encodeURIComponent(locationId)}&skip=0&limit=50`
  );
  return data?.data || [];
}

export async function createBlogPost(payload) {
  return ghlRequest('/blogs/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
