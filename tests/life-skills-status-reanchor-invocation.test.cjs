const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { reanchorRequestKey } = require('../src/lib/bna/life-skills-status-publisher');
const { INVOCATION_KIND, APPROVAL_SCOPE, TARGET, validateAuthorizedReanchorInvocation,
  runAuthorizedReanchorInvocation, parseInvocationArgs } = require('../src/lib/bna/life-skills-status-reanchor-invocation');

const now = Date.parse('2026-10-08T13:30:00.000Z');
const env = { RAILWAY_SERVICE_ID: TARGET.serviceId, RAILWAY_ENVIRONMENT_ID: TARGET.environmentId,
  DATABASE_URL: 'postgresql://synthetic.invalid/db', GOOGLE_CLIENT_ID: 'synthetic', GOOGLE_CLIENT_SECRET: 'synthetic',
  GOOGLE_REDIRECT_URI: 'https://synthetic.invalid/oauth', GOOGLE_REFRESH_TOKEN: 'synthetic' };
function fixture(overrides = {}) {
  const authorization = { ownerAuthorized: true, predecessorReceiptId: 'synthetic-predecessor-receipt',
    assetId: 'C21-HE-STATUS-TEAL-v04-FROZEN', revision: 'v04', sha256: 'a'.repeat(64),
    driveFileId: 'syntheticDriveFile21', language: 'HE', surface: 'VERTICAL', width: 1080, height: 1920,
    scheduledAt: '2026-10-08T14:30:00.000Z', ...(overrides.authorization || {}) };
  return { kind: INVOCATION_KIND, mode: 'apply', approvalScope: APPROVAL_SCOPE, authorizationId: randomUUID(),
    issuedAt: '2026-10-08T13:25:00.000Z', expiresAt: '2026-10-08T13:35:00.000Z', target: { ...TARGET }, authorization,
    requestKey: reanchorRequestKey(authorization), ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== 'authorization')) };
}

test('requires one explicit apply command and a short-lived authorization file', () => {
  assert.deepEqual(parseInvocationArgs(['--apply', '--authorization-file', 'authorization.json']), { authorizationFile: 'authorization.json' });
  assert.throws(() => parseInvocationArgs(['--authorization-file', 'authorization.json']), /Usage:/);
  assert.throws(() => parseInvocationArgs(['--apply', '--authorization-file', 'authorization.json', '--extra']), /Usage:/);
});
test('accepts only the exact existing Status target and runtime binding', () => {
  assert.equal(validateAuthorizedReanchorInvocation(fixture(), { env, now }).target.spreadsheetId, TARGET.spreadsheetId);
  assert.throws(() => validateAuthorizedReanchorInvocation(fixture({ target: { ...TARGET, serviceId: randomUUID() } }), { env, now }), /TARGET_MISMATCH/);
  assert.throws(() => validateAuthorizedReanchorInvocation(fixture(), { env: { ...env, RAILWAY_SERVICE_ID: randomUUID() }, now }), /RUNTIME_TARGET_MISMATCH/);
});
test('rejects missing owner authorization, unknown fields and mismatched request keys', () => {
  assert.throws(() => validateAuthorizedReanchorInvocation(fixture({ authorization: { ownerAuthorized: false } }), { env, now }), /OWNER_AUTHORIZATION_REQUIRED/);
  assert.throws(() => validateAuthorizedReanchorInvocation({ ...fixture(), unexpected: true }, { env, now }), /ENVELOPE_KEYS_INVALID/);
  assert.throws(() => validateAuthorizedReanchorInvocation({ ...fixture(), requestKey: 'wrong' }, { env, now }), /REQUEST_KEY_MISMATCH/);
});
test('rejects expired authorization and a past or elapsed anchor', () => {
  assert.throws(() => validateAuthorizedReanchorInvocation(fixture({ issuedAt: '2026-10-08T13:00:00.000Z', expiresAt: '2026-10-08T13:15:00.000Z' }), { env, now }), /EXPIRED_OR_WINDOW_INVALID/);
  assert.throws(() => validateAuthorizedReanchorInvocation(fixture({ authorization: { scheduledAt: '2026-10-08T13:29:59.000Z' } }), { env, now }), /SCHEDULE_NOT_FUTURE/);
});
test('invokes only the existing guarded operation and requires canonical schedule readback', async () => {
  const input = fixture(); let received;
  const receipt = await runAuthorizedReanchorInvocation(input, { env, clock: () => now, execute: async request => {
    received = request;
    return { state: 'SCHEDULED', assetId: input.authorization.assetId, scheduledAt: input.authorization.scheduledAt,
      predecessorReceiptId: input.authorization.predecessorReceiptId, reanchorRequestKey: input.requestKey,
      schedulerReadback: true, replay: false };
  } });
  assert.deepEqual(received.authorization, input.authorization); assert.equal(received.authorizationExpiresAt, input.expiresAt);
  assert.equal(received.env, env); assert.equal(received.clock(), now);
  assert.equal(receipt.result.state, 'SCHEDULED'); assert.equal(receipt.result.replay, false);
  await assert.rejects(runAuthorizedReanchorInvocation(input, { env, clock: () => now, execute: async () => ({ state: 'SCHEDULED',
    assetId: input.authorization.assetId, scheduledAt: input.authorization.scheduledAt,
    predecessorReceiptId: input.authorization.predecessorReceiptId, reanchorRequestKey: input.requestKey }) }), /CANONICAL_READBACK_REQUIRED/);
});
test('reports idempotent replay only with the same exact canonical readback', async () => {
  const input = fixture();
  const receipt = await runAuthorizedReanchorInvocation(input, { env, clock: () => now, execute: async () => ({ state: 'SCHEDULED',
    assetId: input.authorization.assetId, scheduledAt: input.authorization.scheduledAt,
    predecessorReceiptId: input.authorization.predecessorReceiptId, reanchorRequestKey: input.requestKey,
    schedulerReadback: true, replay: true }) });
  assert.equal(receipt.result.replay, true); assert.equal(receipt.requestKey, input.requestKey);
});
test('preserves lock, hold, UNKNOWN and owner-intervention outcomes without claiming schedule success', async () => {
  const input = fixture();
  for (const result of [
    { state: 'HELD', reason: 'Another Status publisher holds the production lock' },
    { state: 'HELD', reason: 'HEBREW_CALENDAR_OFF' },
    { state: 'UNKNOWN', reason: 'UNRESOLVED_PROVIDER_DELIVERY_REQUIRES_RECONCILIATION' },
    { state: 'HELD', reason: 'Canonical authorized re-anchor readback failed: HEBREW_CALENDAR_OFF' },
  ]) {
    const receipt = await runAuthorizedReanchorInvocation(input, { env, clock: () => now, execute: async () => result });
    assert.equal(receipt.result.state, result.state); assert.equal(receipt.result.reason, result.reason);
    assert.equal(receipt.result.schedulerReadback, false);
  }
});
test('rejects unsupported executor results instead of creating a second delivery contract', async () => {
  await assert.rejects(runAuthorizedReanchorInvocation(fixture(), { env, clock: () => now, execute: async () => ({ state: 'PUBLISHED' }) }), /RESULT_STATE_INVALID/);
});
