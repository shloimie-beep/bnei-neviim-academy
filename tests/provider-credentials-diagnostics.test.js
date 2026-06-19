const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const diagnosticsUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'provider-credentials-diagnostics.mjs')).href;

async function loadDiagnostics() {
  return import(diagnosticsUrl);
}

function tempRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-provider-diagnostics-'));
  fs.mkdirSync(path.join(repoRoot, '.secrets'), { recursive: true });
  return repoRoot;
}

function writeSecret(repoRoot, name, value) {
  fs.writeFileSync(path.join(repoRoot, '.secrets', name), value);
}

test('provider credential diagnostics redacts stored secrets and returned tokens', async () => {
  const { buildProviderCredentialDiagnostics } = await loadDiagnostics();
  const repoRoot = tempRepo();
  const secrets = {
    zoomAccountId: 'zoom-account-id-secret',
    zoomClientId: 'zoom-client-id-secret',
    zoomClientSecret: 'zoom-client-secret-secret',
    vimeoClientId: 'vimeo-client-id-secret',
    vimeoClientSecret: 'vimeo-client-secret-secret',
    zoomReturnedToken: 'zoom-returned-access-token-secret',
    vimeoReturnedToken: 'vimeo-returned-access-token-secret',
  };

  writeSecret(repoRoot, 'zoom-account-id.txt', secrets.zoomAccountId);
  writeSecret(repoRoot, 'zoom-client-id.txt', secrets.zoomClientId);
  writeSecret(repoRoot, 'zoom-client-secret.txt', secrets.zoomClientSecret);
  writeSecret(repoRoot, 'vimeo-client-id.txt', secrets.vimeoClientId);
  writeSecret(repoRoot, 'vimeo-client-secret.txt', secrets.vimeoClientSecret);

  const requestedUrls = [];
  const fetchImpl = async (url, options = {}) => {
    requestedUrls.push(String(url));
    assert.equal(options.method, 'POST');
    assert.match(options.headers.Authorization, /^Basic /);
    if (String(url).includes('zoom.us/oauth/token')) {
      return new Response(JSON.stringify({
        access_token: secrets.zoomReturnedToken,
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'meeting:read:admin meeting:write:admin',
      }), { status: 200 });
    }
    if (String(url).includes('api.vimeo.com/oauth/authorize/client')) {
      return new Response(JSON.stringify({
        access_token: secrets.vimeoReturnedToken,
        token_type: 'bearer',
        scope: 'public',
      }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
  };

  const report = await buildProviderCredentialDiagnostics({ repoRoot, fetchImpl, network: true });
  assert.equal(report.external_write_performed, false);
  assert.equal(report.secret_values_printed, false);
  assert.equal(report.checks.zoom.token_check.status, 'token_ready');
  assert.equal(report.checks.vimeo.client_credentials_check.status, 'client_credentials_ready');
  assert.equal(report.checks.zoom.token_check.token_stored, false);
  assert.equal(report.checks.vimeo.client_credentials_check.token_stored, false);
  assert.equal(requestedUrls.length, 2);

  const serialized = JSON.stringify(report);
  for (const value of Object.values(secrets)) {
    assert.doesNotMatch(serialized, new RegExp(value));
  }

  fs.rmSync(repoRoot, { recursive: true, force: true });
});

test('provider credential diagnostics can run without network', async () => {
  const { buildProviderCredentialDiagnostics } = await loadDiagnostics();
  const repoRoot = tempRepo();
  writeSecret(repoRoot, 'zoom-account-id.txt', 'zoom-account-id-secret');
  writeSecret(repoRoot, 'zoom-client-id.txt', 'zoom-client-id-secret');
  writeSecret(repoRoot, 'zoom-client-secret.txt', 'zoom-client-secret-secret');
  writeSecret(repoRoot, 'vimeo-client-id.txt', 'vimeo-client-id-secret');
  writeSecret(repoRoot, 'vimeo-client-secret.txt', 'vimeo-client-secret-secret');

  const report = await buildProviderCredentialDiagnostics({
    repoRoot,
    network: false,
    fetchImpl: async () => {
      throw new Error('fetch should not be called');
    },
  });
  assert.equal(report.checks.zoom.token_check.status, 'network_skipped');
  assert.equal(report.checks.vimeo.client_credentials_check.status, 'network_skipped');

  fs.rmSync(repoRoot, { recursive: true, force: true });
});
