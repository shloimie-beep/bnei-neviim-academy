const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
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
  assert.doesNotMatch(JSON.stringify(report), /postgres:\/\/|[sr]k_live_|[sr]k_test_|secret-value/i);
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
  assert.doesNotMatch(JSON.stringify(report), /secret-value|postgres:\/\/|[sr]k_live_|[sr]k_test_/i);
});

test('One Time setup readiness accepts Stripe restricted test keys without printing them', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    repoRoot: path.join(__dirname, '..'),
    env: {
      RABBI_STRIPE_TEST_SECRET_KEY: 'rk_test_unit_secret',
      ONE_TIME_STRIPE_PRICE_ALIAS: 'stripe:test/price_67',
    },
  });

  const stripe = report.items.find((item) => item.id === 'SETUP-ONETIME-STRIPE-001');
  assert.equal(stripe.ready, true);
  assert.deepEqual(stripe.missing_fields, []);
  assert.doesNotMatch(JSON.stringify(report), /[sr]k_live_|[sr]k_test_|whsec_/i);
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
    env: {
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
      ONE_TIME_JOIN_DOMAIN_ATTACHED: 'true',
      ONE_TIME_APEX_ROOT_UNTOUCHED: 'true',
    },
    railwayProvisioningReport: 'ops/one-time-mishnah/onetime-railway-provisioning-report.json',
    joinDomainReport: 'ops/missing-join-domain-readback.json',
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
});

test('One Time setup readiness blocks stale provisioning proof when current Railway auth cannot see service', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const repoRoot = path.join(__dirname, '..');
  const report = buildOneTimeExternalSetupReadiness({
    repoRoot,
    env: {
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
      ONE_TIME_JOIN_DOMAIN_ATTACHED: 'true',
      ONE_TIME_JOIN_DNS_CONFIGURED: 'true',
      ONE_TIME_APEX_ROOT_UNTOUCHED: 'true',
    },
    railwayProvisioningReport: 'ops/one-time-mishnah/onetime-railway-provisioning-report.json',
    railwayVariables: {
      ok: false,
      attempted: true,
      source: 'railway_token_or_env',
      reason: "Service 'one-time-web' not found",
      current_project: 'skillful-motivation',
      current_environment: 'production',
      visible_services: ['Postgres', 'skillful-motivation'],
      expected_service: 'one-time-web',
      expected_environment: 'production',
      target_service_visible: false,
      diagnosis:
        'Current Railway auth context can read project "skillful-motivation" with services [Postgres, skillful-motivation], but cannot see target service "one-time-web".',
    },
  });

  const railway = report.items.find((item) => item.id === 'SETUP-ONETIME-RAILWAY-001');
  const database = report.items.find((item) => item.id === 'SETUP-ONETIME-DB-001');
  assert.equal(railway.ready, false);
  assert.equal(database.ready, false);
  assert.ok(railway.missing_fields.includes('current_railway_auth_can_read_one-time-web'));
  assert.match(railway.warnings.join(' '), /cannot see target service "one-time-web"/);
  assert.match(railway.warnings.join(' '), /Historical guarded Railway provisioning report exists/);
  assert.doesNotMatch(railway.warnings.join(' '), /Ready from guarded Railway provisioning report/);
  assert.equal(report.blockers.some((item) => item.id === 'SETUP-ONETIME-RAILWAY-001'), true);
  assert.equal(report.blockers.some((item) => item.id === 'SETUP-ONETIME-DB-001'), true);
  assert.doesNotMatch(JSON.stringify(report), /postgres:\/\/|[sr]k_live_|[sr]k_test_/i);
});

test('One Time railway readback honors account auth instead of loading the BNA project token', async () => {
  const { runRailwayVariablesReadback } = await import(setupUrl);
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'onetime-readiness-auth-'));
  fs.mkdirSync(path.join(repoRoot, '.secrets'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, '.secrets', 'railway-token.txt'), 'bna-project-token');
  const seen = [];

  const result = runRailwayVariablesReadback({
    repoRoot,
    env: { BNA_RAILWAY_USE_ACCOUNT_AUTH: '1' },
    runner: (command, args, options) => {
      seen.push({ command, args, token: options.env.RAILWAY_TOKEN || '' });
      return {
        status: 0,
        stdout: JSON.stringify({
          DATABASE_URL: '${{ one-time-postgres.DATABASE_URL }}',
          ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
          DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
          DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
        }),
      };
    },
  });

  fs.rmSync(repoRoot, { recursive: true, force: true });
  assert.equal(result.ok, true);
  assert.equal(result.source, 'railway_token_or_env');
  assert.equal(seen[0].token, '');
  assert.doesNotMatch(JSON.stringify(result), /bna-project-token|one-time-postgres\.DATABASE_URL/);
});

test('One Time railway readback can use an isolated temp link when the local Railway context is BNA', async () => {
  const { runRailwayVariablesReadback } = await import(setupUrl);
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'onetime-readiness-temp-link-'));
  fs.mkdirSync(path.join(repoRoot, 'ops', 'one-time-mishnah'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, '.secrets'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, '.secrets', 'railway-token.txt'), 'bna-project-token');
  fs.writeFileSync(path.join(repoRoot, 'ops', 'one-time-mishnah', 'onetime-railway-provisioning-report.json'), JSON.stringify({
    target: {
      target_project: 'one-time-production',
      web_service: 'one-time-web',
      postgres_service: 'one-time-postgres',
    },
    steps: [
      {
        key: 'link_project',
        command: 'railway link --project ce55ef20-1418-4ad3-aafa-f877fb992dc8 --environment production --json',
      },
    ],
  }));
  const calls = [];

  const result = runRailwayVariablesReadback({
    repoRoot,
    env: {},
    runner: (command, args, options) => {
      const argText = args.join(' ');
      calls.push({ command, args, cwd: options.cwd, token: options.env.RAILWAY_TOKEN || '' });
      if (argText.includes('variable list') && options.cwd === repoRoot) {
        return { status: 1, stderr: "Service 'one-time-web' not found" };
      }
      if (argText.includes('status --json')) {
        return {
          status: 0,
          stdout: JSON.stringify({
            name: 'skillful-motivation',
            services: { edges: [{ node: { name: 'skillful-motivation' } }] },
          }),
        };
      }
      if (argText.includes('link --project ce55ef20-1418-4ad3-aafa-f877fb992dc8')) {
        return { status: 0, stdout: JSON.stringify({ projectName: 'one-time-production' }) };
      }
      if (argText.includes('variable list') && options.cwd !== repoRoot) {
        assert.equal(options.env.RAILWAY_TOKEN || '', '');
        return {
          status: 0,
          stdout: JSON.stringify({
            DATABASE_URL: 'postgres://secret-value.invalid/db',
            ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
            DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
            DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
            ONE_TIME_DRIVE_DROP_FOLDER_ID: 'drive-folder-id',
            ONE_TIME_ZOOM_JOIN_URL: 'https://example.test/redacted-zoom-link',
            ONE_TIME_WHATSAPP_CLASS_LINK: 'https://example.test/redacted-class-link',
            ONE_TIME_CLASS_REMINDERS_ENABLED: 'true',
            ONE_TIME_CLASS_REMINDERS_CONFIRM: 'APPROVE_ONE_TIME_CLASS_REMINDERS',
            CRON_SECRET: 'cron-secret-value',
            ONE_TIME_WAPI_API_TOKEN: 'scoped-wapi-token',
            ONE_TIME_WHAPI_INSTANCE_ID: 'instance-id',
            ONE_TIME_WHAPI_PHONE: '+972500000000',
            ONE_TIME_WAPI_WEBHOOK_SECRET: 'wapi-webhook-secret',
            ONE_TIME_WAPI_AUTO_REPLY_ENABLED: 'true',
            ONE_TIME_WAPI_AUTO_REPLY_CONFIRM: 'APPROVE_ONE_TIME_WAPI_AUTO_REPLY',
            ONE_TIME_PROVIDER_LEAD_BOT_MODE: 'live',
            ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM: 'APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM',
          }),
        };
      }
      return { status: 1, stderr: 'unexpected fake railway command' };
    },
  });

  fs.rmSync(repoRoot, { recursive: true, force: true });
  assert.equal(result.ok, true);
  assert.equal(result.source, 'railway_temp_link_account_auth');
  assert.equal(result.link_target.project_name, 'one-time-production');
  assert.equal(result.database_url_usable, true);
  assert.equal(result.one_time_drive_drop_folder_present, true);
  assert.equal(result.one_time_zoom_session_present, true);
  assert.equal(result.one_time_class_link_present, true);
  assert.equal(result.one_time_class_reminders_enabled_true, true);
  assert.equal(result.one_time_class_reminders_confirm_approved, true);
  assert.equal(result.cron_secret_present, true);
  assert.equal(result.one_time_class_reminder_scheduler_ready, true);
  assert.equal(result.one_time_wapi_token_present, true);
  assert.equal(result.one_time_whapi_instance_present, true);
  assert.equal(result.one_time_whapi_phone_present, true);
  assert.equal(result.one_time_wapi_webhook_secret_present, true);
  assert.equal(result.one_time_wapi_auto_reply_enabled_true, true);
  assert.equal(result.one_time_wapi_auto_reply_confirm_approved, true);
  assert.equal(result.one_time_provider_lead_bot_mode_live, true);
  assert.equal(result.one_time_provider_lead_bot_telegram_confirm_approved, true);
  assert.ok(calls.some((call) => call.args.join(' ').includes('link --project ce55ef20-1418-4ad3-aafa-f877fb992dc8')));
  assert.doesNotMatch(JSON.stringify(result), /secret-value|postgres:\/\/|example\.test|scoped-wapi-token|cron-secret-value|wapi-webhook-secret|\+972500000000/);
});

test('One Time railway readback treats redacted secret keys as present without values', async () => {
  const { runRailwayVariablesReadback } = await import(setupUrl);
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'onetime-redacted-secret-readback-'));

  const result = runRailwayVariablesReadback({
    repoRoot,
    env: { BNA_RAILWAY_USE_ACCOUNT_AUTH: '1' },
    runner: (_command, args) => {
      if (args.join(' ').includes('variable list')) {
        return {
          status: 0,
          stdout: JSON.stringify({
            DATABASE_URL: '',
            ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
            DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
            DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
            ONE_TIME_WAPI_API_TOKEN: '',
            ONE_TIME_WAPI_WEBHOOK_SECRET: '',
            ONE_TIME_OWNER_TEST_EMAIL: '',
            ONE_TIME_OWNER_TEST_WHATSAPP: '',
            VIMEO_ACCESS_TOKEN: '',
          }),
        };
      }
      return { status: 1, stderr: 'unexpected fake railway command' };
    },
  });

  fs.rmSync(repoRoot, { recursive: true, force: true });
  assert.equal(result.ok, true);
  assert.equal(result.one_time_wapi_token_present, true);
  assert.equal(result.one_time_wapi_webhook_secret_present, true);
  assert.equal(result.one_time_owner_test_email_present, true);
  assert.equal(result.one_time_owner_test_whatsapp_present, true);
  assert.equal(result.vimeo_access_token_present, true);
  assert.doesNotMatch(JSON.stringify(result), /owner@example|scoped-wapi-token|wapi-webhook-secret|vimeo-token/);
});

test('One Time setup readiness can satisfy Zoom session from redacted Railway class-link readback', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    repoRoot: path.join(__dirname, '..'),
    env: {
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
      ONE_TIME_JOIN_DOMAIN_ATTACHED: 'true',
      ONE_TIME_JOIN_DNS_CONFIGURED: 'true',
      ONE_TIME_APEX_ROOT_UNTOUCHED: 'true',
    },
    railwayProvisioningReport: 'ops/one-time-mishnah/onetime-railway-provisioning-report.json',
    railwayVariables: {
      ok: true,
      database_url_usable: true,
      one_time_public_domain_matches: true,
      default_workspace_matches: true,
      default_project_matches: true,
      one_time_class_link_present: true,
      one_time_drive_drop_folder_present: false,
    },
  });

  const zoom = report.items.find((item) => item.id === 'SETUP-ONETIME-ZOOM-001');
  assert.equal(zoom.ready, true);
  assert.deepEqual(zoom.missing_fields, []);
  assert.match(zoom.warnings.join(' '), /redacted One Time Railway readback/);
  assert.doesNotMatch(JSON.stringify(report), /zoom\.us|example\.test/);
});

test('One Time setup readiness can satisfy WAPI provider details from redacted Railway readback', async () => {
  const { buildOneTimeExternalSetupReadiness } = await import(setupUrl);
  const report = buildOneTimeExternalSetupReadiness({
    repoRoot: path.join(__dirname, '..'),
    env: {
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
      ONE_TIME_JOIN_DOMAIN_ATTACHED: 'true',
      ONE_TIME_JOIN_DNS_CONFIGURED: 'true',
      ONE_TIME_APEX_ROOT_UNTOUCHED: 'true',
    },
    railwayProvisioningReport: 'ops/one-time-mishnah/onetime-railway-provisioning-report.json',
    railwayVariables: {
      ok: true,
      database_url_usable: true,
      one_time_public_domain_matches: true,
      default_workspace_matches: true,
      default_project_matches: true,
      one_time_wapi_token_present: true,
      one_time_whapi_instance_present: true,
      one_time_whapi_phone_present: true,
    },
  });

  const wapi = report.items.find((item) => item.id === 'SETUP-ONETIME-WHAPI-001');
  assert.equal(wapi.ready, true);
  assert.deepEqual(wapi.missing_fields, []);
  assert.match(wapi.warnings.join(' '), /redacted One Time Railway readback/);
  assert.doesNotMatch(JSON.stringify(report), /scoped-wapi-token|instance-id|\+972500000000/);
});
