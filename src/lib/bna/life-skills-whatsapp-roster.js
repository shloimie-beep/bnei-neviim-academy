'use strict';

const GROUP_ID = '120363191551602241@g.us';
const MAX_BYTES = 65536;
const MAX_MEMBERS = 100;
const GROUP_ID_PATTERN = /^[A-Za-z0-9._:@-]{1,128}$/;
const CHANNEL_ID_PATTERN = /^[A-Za-z0-9._:@-]{1,128}$/;
const PHONE_PATTERN = /^[1-9]\d{7,14}$/;

class LifeSkillsWhatsAppRosterError extends Error {
  constructor(code, statusCode = 503) {
    super(code);
    this.name = 'LifeSkillsWhatsAppRosterError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function fail(code, statusCode) {
  throw new LifeSkillsWhatsAppRosterError(code, statusCode);
}

function plainText(value, max, nullable = false) {
  if (nullable && (value === null || value === undefined || value === '')) return null;
  if (typeof value !== 'string') fail('INVALID_PROVIDER_RESPONSE', 502);
  const result = value.trim();
  if (!result || result.length > max || /[<>\p{Cc}\p{Cf}]/u.test(result)) fail('INVALID_PROVIDER_RESPONSE', 502);
  return result;
}

function identifier(value, pattern = GROUP_ID_PATTERN) {
  const result = plainText(value, 128);
  if (!pattern.test(result)) fail('INVALID_PROVIDER_RESPONSE', 502);
  return result;
}

function memberRole(rank) {
  switch (String(rank || '').trim().toLowerCase()) {
    case 'creator':
    case 'owner':
      return 'owner';
    case 'admin':
    case 'superadmin':
      return 'admin';
    case 'member':
    case 'participant':
      return 'member';
    default:
      return 'unknown';
  }
}

function participantPhone(participant) {
  // Whapi's documented group-participant response identifies telephone
  // participants with an international numeric id. LID and other opaque ids
  // are never guessed or sent to the CRM matcher.
  const id = String(participant?.id || '').trim();
  return PHONE_PATTERN.test(id) ? `+${id}` : null;
}

function rosterConfig({ credentials, channelId, groupId = GROUP_ID } = {}) {
  const token = String(credentials?.token || '').trim();
  const baseUrl = String(credentials?.baseUrl || '').trim().replace(/\/+$/, '');
  const channel = String(channelId || '').trim();
  if (!token || token.length < 20 || !baseUrl || !channel) fail('ROSTER_CONFIGURATION_UNAVAILABLE');
  let origin;
  try { origin = new URL(baseUrl); } catch { fail('ROSTER_CONFIGURATION_UNAVAILABLE'); }
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash) fail('ROSTER_CONFIGURATION_UNAVAILABLE');
  if (!CHANNEL_ID_PATTERN.test(channel) || !GROUP_ID_PATTERN.test(groupId) || groupId !== GROUP_ID) fail('ROSTER_CONFIGURATION_UNAVAILABLE');
  return Object.freeze({ token, baseUrl, channelId: channel, groupId });
}

async function boundedText(response, maxBytes = MAX_BYTES) {
  const declared = Number(response.headers?.get?.('content-length') || 0);
  if (Number.isFinite(declared) && declared > maxBytes) fail('PROVIDER_RESPONSE_TOO_LARGE', 502);
  if (!response.body?.getReader) {
    const body = await response.arrayBuffer();
    if (body.byteLength > maxBytes) fail('PROVIDER_RESPONSE_TOO_LARGE', 502);
    return Buffer.from(body).toString('utf8');
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel().catch(() => undefined);
        fail('PROVIDER_RESPONSE_TOO_LARGE', 502);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, length).toString('utf8');
}

function normalizeWhapiGroup(raw, config, observedAt) {
  let source;
  try { source = JSON.parse(raw); } catch { fail('INVALID_PROVIDER_RESPONSE', 502); }
  if (!source || typeof source !== 'object' || Array.isArray(source)) fail('INVALID_PROVIDER_RESPONSE', 502);
  const groupId = identifier(source.id);
  if (groupId !== config.groupId) fail('PROVIDER_BINDING_MISMATCH', 502);
  if (!Array.isArray(source.participants)) fail('INVALID_PROVIDER_RESPONSE', 502);
  if (source.participants.length > MAX_MEMBERS) fail('ROSTER_TOO_LARGE', 502);
  const seen = new Set();
  const members = source.participants.map((participant) => {
    if (!participant || typeof participant !== 'object' || Array.isArray(participant)) fail('INVALID_PROVIDER_RESPONSE', 502);
    const memberId = identifier(participant.id);
    if (seen.has(memberId)) fail('DUPLICATE_MEMBER', 502);
    seen.add(memberId);
    return {
      memberId,
      phone: participantPhone(participant),
      displayName: plainText(participant.name || participant.push_name || null, 120, true),
      role: memberRole(participant.rank),
    };
  });
  const timestamp = observedAt instanceof Date ? observedAt.toISOString() : new Date(observedAt).toISOString();
  return Object.freeze({
    schemaVersion: 1,
    channelId: config.channelId,
    group: Object.freeze({ id: groupId, title: plainText(source.name, 120) }),
    observedAt: timestamp,
    actorRole: 'unknown',
    // Whapi fills group metadata asynchronously and does not expose a reliable
    // completion marker on this response. Returned participants are therefore
    // a bounded snapshot, never proof of the group's complete membership.
    completeness: Object.freeze({ state: 'partial', declaredCount: null, reason: 'unknown' }),
    members: Object.freeze(members.map((member) => Object.freeze(member))),
  });
}

async function fetchLifeSkillsWhatsAppRoster({ credentials, channelId, fetchImpl = fetch, now = () => new Date(), timeoutMs = 15000 } = {}) {
  const config = rosterConfig({ credentials, channelId });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(Math.max(Number(timeoutMs) || 15000, 1000), 30000));
  let response;
  try {
    response = await fetchImpl(`${config.baseUrl}/groups/${encodeURIComponent(config.groupId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${config.token}` },
      redirect: 'error',
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') fail('PROVIDER_TIMEOUT', 504);
    fail('PROVIDER_UNAVAILABLE', 503);
  } finally {
    clearTimeout(timer);
  }
  const raw = await boundedText(response);
  if (!response.ok) fail('PROVIDER_UNAVAILABLE', 503);
  return normalizeWhapiGroup(raw, config, now());
}

module.exports = {
  GROUP_ID,
  MAX_BYTES,
  MAX_MEMBERS,
  LifeSkillsWhatsAppRosterError,
  rosterConfig,
  boundedText,
  normalizeWhapiGroup,
  fetchLifeSkillsWhatsAppRoster,
};
