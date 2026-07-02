const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const guardUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'railway-target-guard.mjs')).href;
const provisionUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'provision-onetime-railway-instance.mjs')).href;
const dbUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'bootstrap-onetime-database.mjs')).href;
const setupUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'check-onetime-external-setup-readiness.mjs')).href;

test('One Time Railway target guard accepts only join subdomain defaults', async () => {
  const { buildOneTimeRailwayTargetGuard } = await import(guardUrl);
  const report = buildOneTimeRailwayTargetGuard({
    env: {
      PUBLIC_SITE_MODE: 'one_time',
      DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
      DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
    },
    service: 'one-time-service',
    environment: 'production',
  });
  assert.equal(report.external_write_performed, false);
  assert.equal(report.secret_values_printed, false);
  assert.equal(report.target_domain, 'join.onetimeonetime.com');
  assert.equal(report.ready, true);
});

test('One Time Railway target guard blocks apex/root target', async () => {
  const { buildOneTimeRailwayTargetGuard } = await import(guardUrl);
  const report = buildOneTimeRailwayTargetGuard({
    env: {
      PUBLIC_SITE_MODE: 'one_time',
      DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
      DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
      ONE_TIME_PUBLIC_DOMAIN: 'onetimeonetime.com',
    },
    service: 'one-time-service',
  });
  assert.equal(report.ready, false);
  assert.match(report.blocker, /Forbidden campaign target domain/);
});

test('One Time Railway provision check never mutates resources in dry-run', async () => {
  const { buildOneTimeRailwayProvisionCheck } = await import(provisionUrl);
  const report = buildOneTimeRailwayProvisionCheck({
    env: {
      PUBLIC_SITE_MODE: 'one_time',
      DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
      DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
    },
    service: 'one-time-service',
  });
  assert.equal(report.apply_requested, false);
  assert.equal(report.external_write_performed, false);
  assert.equal(report.apply_allowed, false);
  assert(report.blocked_live_actions.includes('create_or_attach_postgres_database'));
  assert(report.blocked_live_actions.includes('mutate_dns'));
});

test('One Time database bootstrap check is dry-run until DB URL and confirmation exist', async () => {
  const { buildOneTimeDatabaseBootstrapCheck } = await import(dbUrl);
  const missing = buildOneTimeDatabaseBootstrapCheck({ env: {}, apply: true });
  assert.equal(missing.apply_allowed, false);
  assert.equal(missing.database_mutation_performed, false);
  assert.match(missing.blocker, /dry-run\/check only/);

  const ready = buildOneTimeDatabaseBootstrapCheck({
    env: {
      ONE_TIME_DATABASE_URL: 'postgres://example.invalid/db',
      CONFIRM_ONE_TIME_DB_BOOTSTRAP: 'one_time_mishnah_class',
    },
    apply: true,
  });
  assert.equal(ready.apply_allowed, true);
  assert.equal(ready.external_write_performed, false);
  assert.equal(ready.database_mutation_performed, false);
});

test('One Time external setup readiness summarizes missing fields without secrets or provider writes', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    env: {
      PUBLIC_SITE_MODE: 'one_time',
      DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
      DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
    },
    repoRoot: path.join(__dirname, '..'),
  });
  assert.equal(report.external_write_performed, false);
  assert.equal(report.provider_mutation_performed, false);
  assert.equal(report.secret_values_printed, false);
  assert.equal(report.all_required_external_setup_ready, false);
  assert.ok(report.blockers.find((item) => item.id === 'SETUP-ONETIME-RAILWAY-001'));
  assert.ok(report.blockers.find((item) => item.id === 'SETUP-ONETIME-DB-001'));
  assert.doesNotMatch(JSON.stringify(report), /postgres:\/\/|sk_live_|sk_test_|secret-value/i);
});

test('One Time external setup readiness can become ready from safe labels and env presence only', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    repoRoot: path.join(__dirname, '..'),
    env: {
      ONE_TIME_RAILWAY_SERVICE: 'one-time-service',
      ONE_TIME_RAILWAY_ENVIRONMENT: 'production',
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
  assert.doesNotMatch(JSON.stringify(report), /secret-value/);
});
