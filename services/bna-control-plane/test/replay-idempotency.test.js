const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { handleEventRequest } = require('../src/events/ingest');
const { MemoryControlPlaneStorage } = require('../src/storage/memory');
const { signRequest } = require('../src/security/signature');
const { fixture, withPatch } = require('./helpers');

function signedRequest({ event, storage, privateKey, keyId = 'ot-key-1', nonce = Buffer.alloc(24, 3).toString('base64url'), now }) {
  const body = Buffer.from(JSON.stringify(event));
  return {
    method: 'POST',
    path: '/internal/v1/events',
    headers: {
      'content-type': 'application/json',
      ...signRequest({
        privateKey,
        path: '/internal/v1/events',
        timestamp: Math.floor(now / 1000),
        nonce,
        body,
      }),
      'x-bna-key-id': keyId,
    },
    body,
    storage,
    now,
  };
}

test('event ingest accepts a valid signed product event once', () => {
  const now = Date.UTC(2026, 6, 17, 8, 0, 0);
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const storage = new MemoryControlPlaneStorage({ now: () => now });
  storage.addProductKey({ keyId: 'ot-key-1', publicKey, product: 'one_time' });
  const result = handleEventRequest(signedRequest({
    event: fixture('valid-one-time-case-created.json'),
    storage,
    privateKey,
    now,
  }));
  assert.equal(result.statusCode, 202);
  assert.equal(result.body.code, 'accepted');
  assert.equal(storage.cases.size, 1);
  assert.equal(storage.telegramAlertOutbox.length, 1);
});

test('event ingest rejects nonce replay before idempotency path', () => {
  const now = Date.UTC(2026, 6, 17, 8, 0, 0);
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const storage = new MemoryControlPlaneStorage({ now: () => now });
  storage.addProductKey({ keyId: 'ot-key-1', publicKey, product: 'one_time' });
  const event = fixture('valid-one-time-case-created.json');
  const first = handleEventRequest(signedRequest({ event, storage, privateKey, now }));
  const second = handleEventRequest(signedRequest({ event, storage, privateKey, now }));
  assert.equal(first.statusCode, 202);
  assert.equal(second.statusCode, 401);
  assert.equal(second.body.code, 'nonce_replay');
});

test('event ingest treats duplicate event id with new nonce as idempotent', () => {
  const now = Date.UTC(2026, 6, 17, 8, 0, 0);
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const storage = new MemoryControlPlaneStorage({ now: () => now });
  storage.addProductKey({ keyId: 'ot-key-1', publicKey, product: 'one_time' });
  const event = fixture('valid-one-time-case-created.json');
  const first = handleEventRequest(signedRequest({ event, storage, privateKey, now, nonce: Buffer.alloc(24, 3).toString('base64url') }));
  const second = handleEventRequest(signedRequest({ event, storage, privateKey, now, nonce: Buffer.alloc(24, 4).toString('base64url') }));
  assert.equal(first.body.code, 'accepted');
  assert.equal(second.body.code, 'duplicate');
});

test('event ingest rejects duplicate event id with different fingerprint', () => {
  const now = Date.UTC(2026, 6, 17, 8, 0, 0);
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const storage = new MemoryControlPlaneStorage({ now: () => now });
  storage.addProductKey({ keyId: 'ot-key-1', publicKey, product: 'one_time' });
  const first = handleEventRequest(signedRequest({
    event: fixture('valid-one-time-case-created.json'),
    storage,
    privateKey,
    now,
    nonce: Buffer.alloc(24, 3).toString('base64url'),
  }));
  const changed = withPatch('valid-one-time-case-created.json', { case: { product_version: 5, updated_at: '2026-07-17T08:02:00Z' } });
  const second = handleEventRequest(signedRequest({
    event: changed,
    storage,
    privateKey,
    now,
    nonce: Buffer.alloc(24, 4).toString('base64url'),
  }));
  assert.equal(first.body.code, 'accepted');
  assert.equal(second.statusCode, 409);
  assert.equal(second.body.code, 'id_fingerprint_collision');
});
