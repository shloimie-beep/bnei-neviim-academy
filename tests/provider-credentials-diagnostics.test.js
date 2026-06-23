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
    resendApiKey: 're_resend-api-key-secret',
    resendFrom: 'operations@example.test',
    resendDomain: 'example.test',
    stripeSecretKey: 'sk_test_stripe-secret-key',
    greenInvoiceSecret: 'green-invoice-secret-secret',
    greenInvoiceApiKey: 'green-invoice-api-key-secret',
    zoomReturnedToken: 'zoom-returned-access-token-secret',
    vimeoReturnedToken: 'vimeo-returned-access-token-secret',
  };

  writeSecret(repoRoot, 'zoom-account-id.txt', secrets.zoomAccountId);
  writeSecret(repoRoot, 'zoom-client-id.txt', secrets.zoomClientId);
  writeSecret(repoRoot, 'zoom-client-secret.txt', secrets.zoomClientSecret);
  writeSecret(repoRoot, 'vimeo-client-id.txt', secrets.vimeoClientId);
  writeSecret(repoRoot, 'vimeo-client-secret.txt', secrets.vimeoClientSecret);
  writeSecret(repoRoot, 'resend-api-key.txt', secrets.resendApiKey);
  writeSecret(repoRoot, 'resend-from.txt', secrets.resendFrom);
  writeSecret(repoRoot, 'resend-domain.txt', secrets.resendDomain);
  writeSecret(repoRoot, 'stripe-secret-key.txt', secrets.stripeSecretKey);
  writeSecret(repoRoot, 'green-invoice-secret.txt', secrets.greenInvoiceSecret);
  writeSecret(repoRoot, 'rabbi-green-invoice-api-key.txt', secrets.greenInvoiceApiKey);

  const requestedUrls = [];
  const fetchImpl = async (url, options = {}) => {
    requestedUrls.push(String(url));
    if (String(url).includes('zoom.us/oauth/token')) {
      assert.equal(options.method, 'POST');
      assert.match(options.headers.Authorization, /^Basic /);
      return new Response(JSON.stringify({
        access_token: secrets.zoomReturnedToken,
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'meeting:read:admin meeting:write:admin',
      }), { status: 200 });
    }
    if (String(url).includes('api.vimeo.com/oauth/authorize/client')) {
      assert.equal(options.method, 'POST');
      assert.match(options.headers.Authorization, /^Basic /);
      return new Response(JSON.stringify({
        access_token: secrets.vimeoReturnedToken,
        token_type: 'bearer',
        scope: 'public',
      }), { status: 200 });
    }
    if (String(url).includes('api.resend.com/domains')) {
      assert.equal(options.method, 'GET');
      assert.equal(options.headers.Authorization, `Bearer ${secrets.resendApiKey}`);
      return new Response(JSON.stringify({
        data: [{ name: secrets.resendDomain, status: 'verified' }],
      }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'unexpected' }), { status: 404 });
  };

  const report = await buildProviderCredentialDiagnostics({ repoRoot, fetchImpl, network: true, keyholderRoots: [] });
  assert.equal(report.external_write_performed, false);
  assert.equal(report.secret_values_printed, false);
  assert.equal(report.checks.zoom.token_check.status, 'token_ready');
  assert.equal(report.checks.vimeo.client_credentials_check.status, 'client_credentials_ready');
  assert.equal(report.checks.resend.domain_read_check.status, 'domains_read');
  assert.equal(report.checks.resend.domain_read_check.domain_count, 1);
  assert.equal(report.checks.resend.domain_read_check.configured_domain_verified, true);
  assert.equal(report.checks.stripe.readiness.status, 'configured_test_mode');
  assert.equal(report.checks.green_invoice.readiness.status, 'credentials_present');
  assert.equal(report.checks.zoom.token_check.token_stored, false);
  assert.equal(report.checks.vimeo.client_credentials_check.token_stored, false);
  assert.deepEqual(report.checks.resend.readiness_state, [
    'credentials_present',
    'auth_verified_read_only',
    'live_write_not_tested',
  ]);
  assert.equal(requestedUrls.length, 3);

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
  writeSecret(repoRoot, 'resend-api-key.txt', 're_resend-api-key-secret');

  const report = await buildProviderCredentialDiagnostics({
    repoRoot,
    network: false,
    keyholderRoots: [],
    fetchImpl: async () => {
      throw new Error('fetch should not be called');
    },
  });
  assert.equal(report.checks.zoom.token_check.status, 'network_skipped');
  assert.equal(report.checks.vimeo.client_credentials_check.status, 'network_skipped');
  assert.equal(report.checks.resend.domain_read_check.status, 'network_skipped');
  assert.match(report.checks.resend.readiness_state.join(','), /credentials_present/);

  fs.rmSync(repoRoot, { recursive: true, force: true });
});
