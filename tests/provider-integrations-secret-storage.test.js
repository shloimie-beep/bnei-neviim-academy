const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  REQUIRED_HELPER_TOOL_NAMES,
  buildToolRegistry,
} = require('../src/lib/bna/helper/tool-registry');
const { redactValue } = require('../src/lib/bna/helper/redaction');
const vimeo = require('../src/lib/integrations/vimeo');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const migration = fs.readFileSync('railway-migration-2026-06-16-provider-integrations-secret-storage.sql', 'utf8');

test('provider integration schema supports scoped records, secret refs, audit logs, and DNS tasks', () => {
  for (const source of [server, migration]) {
    assert.match(source, /(?:CREATE TABLE IF NOT EXISTS|ALTER TABLE) bna_provider_integrations/);
    assert.match(source, /integration_type TEXT/);
    assert.match(source, /status TEXT NOT NULL DEFAULT 'not_configured'/);
    assert.match(source, /blocked_until_thursday/);
    assert.match(source, /CREATE TABLE IF NOT EXISTS bna_provider_secret_refs/);
    assert.match(source, /secret_ref TEXT NOT NULL/);
    assert.match(source, /secret_hash_prefix TEXT/);
    assert.match(source, /fingerprint TEXT/);
    assert.match(source, /CREATE TABLE IF NOT EXISTS bna_provider_integration_audit_log/);
    assert.match(source, /request_ip_hash TEXT/);
    assert.match(source, /ALTER TABLE bna_dns_setup_tasks ADD COLUMN IF NOT EXISTS purpose TEXT/);
    assert.match(source, /copy exact value/i);
  }
});

test('integration readiness includes Thursday blockers and provider-owned status cards', () => {
  assert.match(server, /function buildGodaddyDnsStatusCard/);
  assert.match(server, /status: 'blocked_until_thursday'/);
  assert.match(server, /GoDaddy Delegate Access\/DNS is blocked until Thursday/);
  assert.match(server, /function buildWapiStatusCard/);
  assert.match(server, /provider_owned_readiness/);
  assert.match(server, /function buildProviderScopedIntegrationsStatusCard/);
  assert.match(server, /bna_provider_secret_refs/);
  assert.match(operations, /Integration Readiness/);
  assert.match(operations, /status\.includes\('blocked'\)/);
  assert.doesNotMatch(operations, /INTEGRATION_SECRET_MASTER_KEY/);
});

test('BNA Helper exposes scoped integration tools and redacts key input', () => {
  const registry = buildToolRegistry();
  const names = registry.tools.map((tool) => tool.name);
  [
    'show_integration_status',
    'create_integration_setup_task',
    'save_provider_api_key',
    'rotate_provider_api_key',
    'test_resend_connection',
    'test_buffer_connection',
    'test_vimeo_connection',
    'test_wapi_connection',
    'mark_integration_blocked_until_thursday',
    'create_dns_setup_task',
    'prepare_vimeo_upload',
    'mark_manual_vimeo_upload_needed',
    'attach_vimeo_url_to_library_item',
  ].forEach((name) => assert.ok(names.includes(name), `${name} should be registered`));
  for (const name of REQUIRED_HELPER_TOOL_NAMES) assert.ok(names.includes(name), `${name} required`);

  const saveTool = registry.get('save_provider_api_key');
  assert.equal(saveTool.requiresConfirmation, true);
  assert.equal(saveTool.risk, 'high');
  const valid = registry.validate('save_provider_api_key', {
    integration_type: 'vimeo',
    key_input: 'vimeo-token-that-should-not-show',
  });
  assert.equal(valid.ok, true);
  const redacted = redactValue(valid.args);
  assert.equal(redacted.key_input, '[redacted-secret]');
  assert.doesNotMatch(JSON.stringify(redacted), /vimeo-token-that-should-not-show/);
});

test('Vimeo adapter supports auth readiness, parsing, manual fallback, and redaction', async () => {
  assert.equal(vimeo.normalizeVimeoTokenInput('Bearer vimeo_secret_1234567890'), 'vimeo_secret_1234567890');
  assert.equal(vimeo.normalizeVimeoTokenInput('your-token-here'), '');

  const parsed = vimeo.parseVimeoUrl('https://player.vimeo.com/video/123456789');
  assert.equal(parsed.ok, true);
  assert.equal(parsed.id, '123456789');
  assert.equal(parsed.embed_url, 'https://player.vimeo.com/video/123456789');

  const invalid = vimeo.parseVimeoUrl('https://example.com/video/123');
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error, 'not_vimeo_url');

  const noToken = await vimeo.testVimeoAuth({ token: '' });
  assert.equal(noToken.ok, false);
  assert.equal(noToken.status, 'credential_missing');
  assert.equal(noToken.legacy_status, 'needs_api_key');
  assert.equal(noToken.external_write_performed, false);

  const intent = vimeo.createVimeoUploadIntent({ title: 'Class video' }, { token: '', uploadAccess: false });
  assert.equal(intent.preview_only, true);
  assert.equal(intent.external_write_performed, false);
  assert.equal(intent.status, 'manual_ready');
  assert.equal(intent.legacy_status, 'manual_upload_required');
  assert.equal(vimeo.getVideoHostingReadiness({
    config: {
      providerDecision: 'vimeo',
      vimeoToken: '',
      vimeoClientId: 'client-id-present',
      vimeoClientSecret: 'client-secret-present',
      accountOwner: 'unknown',
      vimeoPlan: '',
    },
  }).vimeo.appCredentialsConfigured, true);

  const attached = vimeo.attachVimeoUrl({ content_id: 42, vimeo_url: 'https://vimeo.com/987654321' });
  assert.equal(attached.ok, true);
  assert.equal(attached.library_item.vimeo_id, '987654321');
  assert.equal(attached.library_item.publish_status, 'needs_approval');

  assert.doesNotMatch(vimeo.redactVimeoToken('token vimeo_secret_1234567890'), /vimeo_secret_1234567890/);
});

test('integration audit script is wired in package scripts', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.scripts['integrations:audit'], 'node scripts/integrations-audit.mjs');
  assert.match(fs.readFileSync('scripts/integrations-audit.mjs', 'utf8'), /provider_scoped_schema/);
});
