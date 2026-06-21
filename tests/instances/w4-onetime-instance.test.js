const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeInstanceConfig,
  buildOneTimeExportManifest,
  assertNoBnaPrivateData,
} = require('../../src/platform/instances/one-time');

test('W4 One Time instance defaults to scoped workspace with partner-owned split readiness', () => {
  const config = buildOneTimeInstanceConfig();
  assert.equal(config.instance.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(config.instance.workspace_key, 'rabbi_sheller_provider');
  assert.equal(config.instance.project_key, 'one_time_mishnah_class');
  assert.equal(config.instance.deployment_mode, 'scoped_workspace');
  assert.equal(config.instance.database_scope, 'shared_database_scoped_rows');
  assert.equal(config.instance.split_ready, true);
  assert.equal(config.instance.external_write_performed, false);
  assert.equal(config.owners.partner_owner, 'Rabbi Elie Scheller');
  assert.equal(config.owners.operator_admin, 'Shloimie');
  assert.equal(config.module_visibility.bna_private_operations, false);
});

test('W4 One Time instance single-tenant mode requires separate deployment boundaries', () => {
  const config = buildOneTimeInstanceConfig({ singleTenant: true });
  assert.equal(config.instance.deployment_mode, 'single_tenant_partner');
  assert.equal(config.instance.database_scope, 'separate_database_required');
  assert.equal(config.instance.domain_scope, 'separate_partner_domain_required');
  assert.equal(config.instance.secret_scope, 'separate_secret_set_required');
});

test('W4 One Time export manifest excludes secrets and production-only sources', () => {
  const manifest = buildOneTimeExportManifest(buildOneTimeInstanceConfig());
  assert.equal(manifest.secrets_included, false);
  assert.equal(manifest.external_write_performed, false);
  assert.ok(manifest.excluded_secret_fields.includes('DATABASE_URL'));
  assert.ok(manifest.files.includes('config/brands/one-time.json'));
});

test('W4 One Time export guard rejects BNA private records', () => {
  assert.deepEqual(assertNoBnaPrivateData([
    { id: 'one-time-1', workspace_key: 'rabbi_sheller_provider', privacy: 'partner_program' },
  ]), { ok: true, violations: [] });

  const result = assertNoBnaPrivateData([
    { id: 'bna-private-1', workspace_key: 'bna', privacy: 'bna_private' },
    { id: 'flagged', bna_private: true },
  ]);
  assert.equal(result.ok, false);
  assert.equal(result.violations.length, 2);
});
