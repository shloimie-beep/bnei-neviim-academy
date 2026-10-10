const test = require('node:test');
const assert = require('node:assert/strict');
const {
  GROUP_ID,
  MAX_BYTES,
  rosterConfig,
  normalizeWhapiGroup,
  fetchLifeSkillsWhatsAppRoster,
} = require('../src/lib/bna/life-skills-whatsapp-roster');

const credentials = { token: 'synthetic-not-a-real-whapi-token-123456', baseUrl: 'https://gate.whapi.invalid' };
const channelId = 'synthetic-channel';
const config = () => rosterConfig({ credentials, channelId });
const provider = (overrides = {}) => ({
  id: GROUP_ID,
  name: 'Synthetic Life Skills Group',
  participants: [{ id: '12025550101', rank: 'creator' }, { id: '123456789@lid', rank: 'member' }],
  ...overrides,
});
const jsonResponse = (body, init = {}) => new Response(typeof body === 'string' ? body : JSON.stringify(body), {
  status: 200,
  headers: { 'content-type': 'application/json' },
  ...init,
});

test('normalizes the documented provider group shape without guessing LID phones or completeness', () => {
  const result = normalizeWhapiGroup(JSON.stringify(provider()), config(), new Date('2026-10-11T10:00:00.000Z'));
  assert.equal(result.channelId, channelId);
  assert.equal(result.group.id, GROUP_ID);
  assert.deepEqual(result.completeness, { state: 'partial', declaredCount: null, reason: 'unknown' });
  assert.deepEqual(result.members[0], { memberId: '12025550101', phone: '+12025550101', displayName: null, role: 'owner' });
  assert.deepEqual(result.members[1], { memberId: '123456789@lid', phone: null, displayName: null, role: 'member' });
});

test('reports an empty provider cache as partial rather than an empty group', () => {
  const result = normalizeWhapiGroup(JSON.stringify(provider({ participants: [] })), config(), new Date('2026-10-11T10:00:00.000Z'));
  assert.deepEqual(result.completeness, { state: 'partial', declaredCount: null, reason: 'unknown' });
  assert.deepEqual(result.members, []);
});

test('uses one fixed GET and never accepts a caller-selected destination', async () => {
  let called;
  const result = await fetchLifeSkillsWhatsAppRoster({ credentials, channelId, now: () => new Date('2026-10-11T10:00:00.000Z'), fetchImpl: async (url, init) => {
    called = { url, init };
    return jsonResponse(provider());
  }});
  assert.equal(called.url, `https://gate.whapi.invalid/groups/${encodeURIComponent(GROUP_ID)}`);
  assert.equal(called.init.method, 'GET');
  assert.equal(called.init.redirect, 'error');
  assert.match(called.init.headers.Authorization, /^Bearer /);
  assert.equal(result.group.id, GROUP_ID);
});

test('rejects missing scoped configuration and any alternate group binding', async () => {
  assert.throws(() => rosterConfig({ credentials: {}, channelId }), /ROSTER_CONFIGURATION_UNAVAILABLE/);
  assert.throws(() => rosterConfig({ credentials, channelId: '' }), /ROSTER_CONFIGURATION_UNAVAILABLE/);
  assert.throws(() => rosterConfig({ credentials, channelId, groupId: 'another@g.us' }), /ROSTER_CONFIGURATION_UNAVAILABLE/);
  assert.throws(() => normalizeWhapiGroup(JSON.stringify(provider({ id: 'another@g.us' })), config(), new Date()), /PROVIDER_BINDING_MISMATCH/);
});

test('rejects malformed, duplicate and over-limit provider responses without truncation', () => {
  assert.throws(() => normalizeWhapiGroup('{', config(), new Date()), /INVALID_PROVIDER_RESPONSE/);
  assert.throws(() => normalizeWhapiGroup(JSON.stringify(provider({ participants: [{ id: '12025550101' }, { id: '12025550101' }] })), config(), new Date()), /DUPLICATE_MEMBER/);
  const participants = Array.from({ length: 101 }, (_, index) => ({ id: String(12025550000 + index), rank: 'member' }));
  assert.throws(() => normalizeWhapiGroup(JSON.stringify(provider({ participants })), config(), new Date()), /ROSTER_TOO_LARGE/);
});

test('enforces the provider body cap while streaming and does not expose provider errors', async () => {
  await assert.rejects(fetchLifeSkillsWhatsAppRoster({ credentials, channelId, fetchImpl: async () => jsonResponse('x'.repeat(MAX_BYTES + 1)) }), /PROVIDER_RESPONSE_TOO_LARGE/);
  await assert.rejects(fetchLifeSkillsWhatsAppRoster({ credentials, channelId, fetchImpl: async () => jsonResponse({ token: 'PRIVATE' }, { status: 500 }) }), /PROVIDER_UNAVAILABLE/);
});

test('maps only allowlisted text and roles into the normalized contract', () => {
  const raw = provider({ token: 'PRIVATE', invite: 'PRIVATE', participants: [{ id: '12025550101', rank: 'admin', name: 'Synthetic Admin', messages: ['PRIVATE'] }] });
  const result = normalizeWhapiGroup(JSON.stringify(raw), config(), new Date('2026-10-11T10:00:00.000Z'));
  assert.deepEqual(result.members[0], { memberId: '12025550101', phone: '+12025550101', displayName: 'Synthetic Admin', role: 'admin' });
  assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});
