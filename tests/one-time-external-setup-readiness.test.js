const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const setupUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'check-onetime-external-setup-readiness.mjs')).href;

test('One Time external setup readiness reports missing setup without writes or secrets', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    env: {},
    repoRoot: path.join(__dirname, '..'),
    railwayProvisioningReport: 'ops/missing-onetime-railway-provisioning-report.json',
    joinDomainReport: 'ops/missing-join-domain-readback.json',
  });

  assert.equal(report.external_write_performed, false);
  assert.equal(report.provider_mutation_performed, false);
  assert.equal(report.dns_mutation_performed, false);
  assert.equal(report.email_send_performed, false);
  assert.equal(report.whatsapp_send_performed, false);
  assert.equal(report.live_payment_performed, false);
  assert.equal(report.secret_values_printed, false);
  assert.equal(report.all_required_external_setup_ready, false);
  assert.equal(report.ready_count, 0);
  assert.ok(report.blockers.find((item) => item.id === 'SETUP-ONETIME-RAILWAY-001'));
  assert.ok(report.blockers.find((item) => item.id === 'SETUP-ONETIME-DB-001'));
  assert.doesNotMatch(JSON.stringify(report), /postgres:\/\/|sk_live_|sk_test_|secret-value/i);
});

test('One Time external setup readiness can pass from aliases and readiness flags only', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    repoRoot: path.join(__dirname, '..'),
    env: {
      ONE_TIME_RAILWAY_PROJECT_LABEL: 'one-time-project',
      ONE_TIME_RAILWAY_SERVICE_LABEL: 'one-time-service',
      ONE_TIME_RAILWAY_ENVIRONMENT_LABEL: 'production',
      PUBLIC_SITE_MODE: 'one_time',
      DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
      DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
      ONE_TIME_DATABASE_URL: 'postgres://secret-value.invalid/db',
      ONE_TIME_JOIN_DOMAIN_ATTACHED: 'true',
      ONE_TIME_JOIN_DNS_CONFIGURED: 'true',
      ONE_TIME_APEX_ROOT_UNTOUCHED: 'true',
      ONE_TIME_ZOOM_SESSION_ALIAS: 'keyholder:onetime/zoom/session',
      ONE_TIME_VIMEO_ACCESS_TOKEN_ALIAS: 'keyholder:onetime/vimeo/token',
      ONE_TIME_DRIVE_DROP_FOLDER_ALIAS: 'drive:onetime/drop',
      ONE_TIME_STRIPE_TEST_SECRET_KEY_ALIAS: 'keyholder:onetime/stripe/test',
      ONE_TIME_STRIPE_PRICE_ALIAS: 'stripe:test/price_67',
      ONE_TIME_WHAPI_TOKEN_ALIAS: 'keyholder:onetime/whapi/token',
      ONE_TIME_WHAPI_INSTANCE_ID: 'instance-alias',
      ONE_TIME_WHAPI_PHONE: 'phone-alias',
      ONE_TIME_CAMPAIGN_COPY_READY: 'true',
      ONE_TIME_CAMPAIGN_SEGMENT_READY: 'true',
      ONE_TIME_SUPPRESSION_READY: 'true',
      ONE_TIME_SEED_PACKET_APPROVED: 'true',
    },
  });

  assert.equal(report.all_required_external_setup_ready, true);
  assert.equal(report.ready_count, report.total_count);
  assert.equal(report.live_payment_performed, false);
  assert.equal(report.email_send_performed, false);
  assert.equal(report.whatsapp_send_performed, false);
  assert.equal(report.dns_mutation_performed, false);
  assert.doesNotMatch(JSON.stringify(report), /secret-value|postgres:\/\//);
});

test('One Time railway-only mode isolates the first setup item', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    railwayOnly: true,
    railwayProvisioningReport: 'ops/missing-onetime-railway-provisioning-report.json',
    env: {
      PUBLIC_SITE_MODE: 'one_time',
      DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
      DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
    },
  });

  assert.equal(report.mode, 'railway_only');
  assert.equal(report.total_count, 1);
  assert.equal(report.items[0].id, 'SETUP-ONETIME-RAILWAY-001');
  assert.equal(report.items[0].ready, false);
  assert.deepEqual(report.blockers.map((item) => item.id), ['SETUP-ONETIME-RAILWAY-001']);
});

test('One Time setup readiness consumes successful Railway provisioning report', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const repoRoot = path.join(__dirname, '..');
  const report = buildOneTimeExternalSetupReadiness({
    repoRoot,
    env: {},
    railwayProvisioningReport: 'ops/one-time-mishnah/onetime-railway-provisioning-report.json',
  });

  const railway = report.items.find((item) => item.id === 'SETUP-ONETIME-RAILWAY-001');
  const database = report.items.find((item) => item.id === 'SETUP-ONETIME-DB-001');
  assert.equal(railway.ready, true);
  assert.equal(database.ready, true);
  assert.match(railway.warnings.join(' '), /guarded Railway provisioning report/);
  assert.match(database.warnings.join(' '), /DATABASE_URL service reference/);
  assert.equal(report.ready_count >= 2, true);
  assert.equal(report.all_required_external_setup_ready, false);
  assert.ok(report.blockers.find((item) => item.id === 'SETUP-ONETIME-JOIN-DOMAIN-001'));
  const joinDomain = report.items.find((item) => item.id === 'SETUP-ONETIME-JOIN-DOMAIN-001');
  assert.deepEqual(joinDomain.missing_fields, ['ONE_TIME_JOIN_DNS_CONFIGURED']);
  assert.match(joinDomain.warnings.join(' '), /Railway custom domain is attached/);
});
