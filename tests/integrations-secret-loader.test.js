const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  loadSecret,
  redactError,
  redactSecrets,
  redactSecretText,
  usableSecretValue,
} = require('../src/lib/integrations/secret-loader');

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bna-secret-loader-'));
}

function withEnv(name, value, fn) {
  const old = process.env[name];
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
  try {
    return fn();
  } finally {
    if (old === undefined) delete process.env[name];
    else process.env[name] = old;
  }
}

test('env value wins over keyholder and .secrets files', () => {
  const root = tempRoot();
  const keyholder = path.join(root, 'keyholder');
  const secrets = path.join(root, '.secrets');
  fs.mkdirSync(keyholder);
  fs.mkdirSync(secrets);
  fs.writeFileSync(path.join(keyholder, 'buffer-api-key.txt'), 'file-token');
  fs.writeFileSync(path.join(secrets, 'buffer-api-key.txt'), 'secret-token');

  withEnv('BUFFER_API_KEY', 'env-token', () => {
    const loaded = loadSecret({
      envName: 'BUFFER_API_KEY',
      fileNames: ['buffer-api-key.txt'],
      repoRoot: root,
      keyholderRoots: [keyholder],
    });
    assert.equal(loaded.value, 'env-token');
    assert.equal(loaded.source_type, 'env');
  });
});

test('keyholder file loads before .secrets fallback without exposing file contents in blocker', () => {
  const root = tempRoot();
  const keyholder = path.join(root, 'keyholder');
  const secrets = path.join(root, '.secrets');
  fs.mkdirSync(keyholder);
  fs.mkdirSync(secrets);
  fs.writeFileSync(path.join(keyholder, 'resend-api-key.txt'), 'RESEND_API_KEY=keyholder-token');
  fs.writeFileSync(path.join(secrets, 'resend-api-key.txt'), 'secret-token');

  withEnv('RESEND_API_KEY', undefined, () => {
    const loaded = loadSecret({
      envName: 'RESEND_API_KEY',
      fileNames: ['resend-api-key.txt'],
      repoRoot: root,
      keyholderRoots: [keyholder],
    });
    assert.equal(loaded.value, 'keyholder-token');
    assert.equal(loaded.source_type, 'keyholder');
    assert.equal(loaded.blocker, null);
  });
});

test('.secrets fallback works and placeholder values are rejected safely', () => {
  const root = tempRoot();
  const secrets = path.join(root, '.secrets');
  fs.mkdirSync(secrets);
  fs.writeFileSync(path.join(secrets, 'resend-api-key.txt'), 'your-api-key');

  withEnv('RESEND_API_KEY', undefined, () => {
    const missing = loadSecret({
      envName: 'RESEND_API_KEY',
      fileNames: ['resend-api-key.txt'],
      repoRoot: root,
      keyholderRoots: [path.join(root, 'missing-keyholder')],
    });
    assert.equal(missing.configured, false);
    assert.equal(missing.value, '');
    assert.match(missing.blocker, /RESEND_API_KEY is not configured/);
    assert.doesNotMatch(missing.blocker, /your-api-key/);
  });

  fs.writeFileSync(path.join(secrets, 'resend-api-key.txt'), 'secret-fallback-token');
  withEnv('RESEND_API_KEY', undefined, () => {
    const loaded = loadSecret({
      envName: 'RESEND_API_KEY',
      fileNames: ['resend-api-key.txt'],
      repoRoot: root,
      keyholderRoots: [path.join(root, 'missing-keyholder')],
    });
    assert.equal(loaded.value, 'secret-fallback-token');
    assert.equal(loaded.source_type, '.secrets');
  });
});

test('common placeholder values are not usable secrets', () => {
  for (const placeholder of [
    'None',
    'null',
    'undefined',
    'not configured',
    'TODO',
    'TBD',
    'n/a',
    '${RESEND_API_KEY}',
    '<resend-api-key>',
  ]) {
    assert.equal(usableSecretValue(placeholder), '', `${placeholder} should be rejected`);
  }

  assert.equal(usableSecretValue('"live-secret-token"'), 'live-secret-token');
});

test('redactSecretText removes bearer tokens and loaded secret values', () => {
  const redacted = redactSecretText('Authorization: Bearer abc123 and token=secret-value', ['secret-value']);
  assert.doesNotMatch(redacted, /abc123/);
  assert.doesNotMatch(redacted, /secret-value/);
  assert.match(redacted, /\[redacted\]/);
});

test('path traversal candidates are ignored when loading local secret files', () => {
  const root = tempRoot();
  const keyholder = path.join(root, 'keyholder');
  const outside = path.join(root, 'outside-secret.txt');
  fs.mkdirSync(keyholder);
  fs.writeFileSync(outside, 'outside-token');

  withEnv('OUTSIDE_SECRET', undefined, () => {
    const loaded = loadSecret({
      envName: 'OUTSIDE_SECRET',
      fileNames: ['../outside-secret.txt'],
      repoRoot: root,
      keyholderRoots: [keyholder],
    });
    assert.equal(loaded.configured, false);
    assert.equal(loaded.value, '');
    assert.doesNotMatch(loaded.blocker, /outside-token/);
  });
});

test('redactSecrets and redactError remove nested token-looking fields', () => {
  const redacted = redactSecrets({
    message: 'Bearer token-here',
    nested: { api_key: 'should-hide', value: 'sk_live_abcdefghijklmnopqrstuvwxyz' },
  });
  assert.equal(redacted.nested.api_key, '[redacted]');
  assert.doesNotMatch(JSON.stringify(redacted), /sk_live_/);

  const error = redactError(Object.assign(new Error('client_secret=zoom-secret'), { status: 401 }), ['zoom-secret']);
  assert.equal(error.status, 401);
  assert.doesNotMatch(error.message, /zoom-secret/);
});
