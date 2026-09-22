import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

function loadAuthHelpers(tempDir) {
  const source = fs.readFileSync('scripts/sync-drive-content-library.mjs', 'utf8');
  const start = source.indexOf('function parseEnvFile');
  const end = source.indexOf('function authWithRefreshToken');
  assert.ok(start > 0 && end > start, 'auth helper block should be found');

  const secretsDir = path.join(tempDir, '.secrets');
  fs.mkdirSync(secretsDir, { recursive: true });
  const sandbox = {
    Buffer,
    fs,
    path,
    process: { env: {} },
    repoRoot: tempDir,
    clientPath: path.join(secretsDir, 'google-oauth-client.json'),
    tokenPath: path.join(secretsDir, 'google-refresh-token.txt'),
    openAiSecretPath: path.join(secretsDir, 'openai-api-key.txt'),
    kimiSecretPath: path.join(secretsDir, 'kimi-api-key.txt'),
  };

  vm.runInNewContext(`${source.slice(start, end)}\nresult = { loadClient, loadRefreshToken };`, sandbox);
  return sandbox.result;
}

test('Drive content sync auth prefers Railway env client credentials over bad local JSON', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-drive-auth-'));
  const helpers = loadAuthHelpers(tempDir);
  fs.writeFileSync(path.join(tempDir, '.secrets', 'google-oauth-client.json'), 'not-json');

  const client = helpers.loadClient({
    GOOGLE_CLIENT_ID: 'env-client-id',
    GOOGLE_CLIENT_SECRET: 'env-client-secret',
    GOOGLE_REDIRECT_URI: 'http://localhost/callback',
  });

  assert.equal(client.clientId, 'env-client-id');
  assert.equal(client.clientSecret, 'env-client-secret');
  assert.equal(client.redirectUri, 'http://localhost/callback');
});

test('Drive content sync auth supports inline OAuth client JSON', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-drive-auth-'));
  const helpers = loadAuthHelpers(tempDir);

  const client = helpers.loadClient({
    GOOGLE_OAUTH_CLIENT_JSON: JSON.stringify({
      installed: {
        client_id: 'inline-client-id',
        client_secret: 'inline-client-secret',
        redirect_uris: ['http://localhost/inline'],
      },
    }),
  });

  assert.equal(client.clientId, 'inline-client-id');
  assert.equal(client.clientSecret, 'inline-client-secret');
  assert.equal(client.redirectUri, 'http://localhost/inline');
});

test('Drive content sync auth supports .env.local refresh token fallback', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-drive-auth-'));
  const helpers = loadAuthHelpers(tempDir);
  fs.writeFileSync(path.join(tempDir, '.env.local'), 'GOOGLE_REFRESH_TOKEN=refresh-from-env-local\n');

  assert.equal(helpers.loadRefreshToken({}), 'refresh-from-env-local');
});
