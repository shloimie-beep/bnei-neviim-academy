import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  authWithRefreshToken,
  loadClient,
  loadConfig,
  loadRefreshToken,
} from '../scripts/sync-drive-content-library.mjs';

function withTempFile(contents, callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-drive-auth-'));
  const filePath = path.join(dir, 'google-oauth-client.json');
  fs.writeFileSync(filePath, contents, 'utf8');
  try {
    return callback(filePath);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('Drive content sync prefers direct Google OAuth env over invalid client file', () => {
  withTempFile('{ invalid json', (clientPath) => {
    const client = loadClient(
      {
        GOOGLE_CLIENT_ID: 'synthetic-client-id',
        GOOGLE_CLIENT_SECRET: 'synthetic-client-secret',
        GOOGLE_REDIRECT_URI: 'https://example.test/oauth',
      },
      { clientPath }
    );

    assert.equal(client.clientId, 'synthetic-client-id');
    assert.equal(client.clientSecret, 'synthetic-client-secret');
    assert.equal(client.redirectUri, 'https://example.test/oauth');
    assert.equal(client.source, 'GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
  });
});

test('Drive content sync accepts inline Google OAuth client JSON', () => {
  const client = loadClient({
    GOOGLE_OAUTH_CLIENT_JSON: JSON.stringify({
      installed: {
        client_id: 'synthetic-inline-id',
        client_secret: 'synthetic-inline-secret',
        redirect_uris: ['http://localhost/oauth'],
      },
    }),
  });

  assert.equal(client.clientId, 'synthetic-inline-id');
  assert.equal(client.clientSecret, 'synthetic-inline-secret');
  assert.equal(client.redirectUri, 'http://localhost/oauth');
  assert.equal(client.source, 'GOOGLE_OAUTH_CLIENT_JSON');
});

test('Drive content sync reports invalid OAuth file without echoing raw JSON', () => {
  withTempFile('{"client_secret":"do-not-print",', (clientPath) => {
    assert.throws(
      () => loadClient({}, { clientPath }),
      (error) => {
        assert.match(error.message, /Invalid JSON in Google OAuth client file/);
        assert.doesNotMatch(error.message, /do-not-print/);
        return true;
      }
    );
  });
});

test('Drive content sync auth uses env refresh token and synthetic OAuth env', () => {
  const auth = authWithRefreshToken({
    GOOGLE_CLIENT_ID: 'synthetic-client-id',
    GOOGLE_CLIENT_SECRET: 'synthetic-client-secret',
    GOOGLE_REFRESH_TOKEN: 'synthetic-refresh-token',
  });

  assert.equal(auth.credentials.refresh_token, 'synthetic-refresh-token');
});

test('Drive content sync config parses pipeline JSON from supplied env', () => {
  const config = loadConfig({
    GOOGLE_DRIVE_PIPELINE_CONFIG: JSON.stringify({ root: { id: 'synthetic-root' } }),
  });

  assert.equal(config.pipeline.root.id, 'synthetic-root');
});

test('Drive content sync refresh token loader fails with a direct config action', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-drive-auth-'));
  const tokenPath = path.join(dir, 'missing-refresh-token.txt');
  try {
    assert.throws(
      () => loadRefreshToken({}, { tokenPath }),
      /Missing Google refresh token. Set GOOGLE_REFRESH_TOKEN or provide/
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
