const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { signRequest, verifySignedRequest } = require('../src/security/signature');
const { fixture } = require('./helpers');

function keypair() {
  return crypto.generateKeyPairSync('ed25519');
}

test('Ed25519 request signature verifies exact method path and body digest', () => {
  const { privateKey, publicKey } = keypair();
  const body = Buffer.from(JSON.stringify(fixture('valid-one-time-case-created.json')));
  const timestamp = 1784284800;
  const headers = {
    ...signRequest({
      privateKey,
      method: 'POST',
      path: '/internal/v1/events',
      timestamp,
      nonce: Buffer.alloc(24, 7).toString('base64url'),
      body,
    }),
    'x-bna-key-id': 'ot-key-1',
  };
  const result = verifySignedRequest({
    method: 'POST',
    path: '/internal/v1/events',
    headers,
    body,
    now: timestamp * 1000,
    keyResolver: (keyId) => (keyId === 'ot-key-1' ? publicKey : null),
  });
  assert.equal(result.keyId, 'ot-key-1');
});

test('signature verification rejects body tampering and stale timestamps', () => {
  const { privateKey, publicKey } = keypair();
  const body = Buffer.from(JSON.stringify(fixture('valid-one-time-case-created.json')));
  const timestamp = 1784284800;
  const headers = {
    ...signRequest({
      privateKey,
      path: '/internal/v1/events',
      timestamp,
      nonce: Buffer.alloc(24, 9).toString('base64url'),
      body,
    }),
    'x-bna-key-id': 'ot-key-1',
  };
  assert.throws(() => verifySignedRequest({
    path: '/internal/v1/events',
    headers,
    body: Buffer.from('{}'),
    now: timestamp * 1000,
    keyResolver: () => publicKey,
  }), /digest mismatch/);
  assert.throws(() => verifySignedRequest({
    path: '/internal/v1/events',
    headers,
    body,
    now: (timestamp + 301) * 1000,
    keyResolver: () => publicKey,
  }), /outside allowed skew/);
});
