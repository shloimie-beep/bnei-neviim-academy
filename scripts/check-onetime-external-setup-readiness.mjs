#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { loadSecret, safeSecretSourceLabel } = require('../src/lib/integrations/secret-loader');

const DEFAULT_CHECKLIST_PATH = path.join(
  'ops',
  'one-time-mishnah',
  'launch-unblocker',
  '2026-07-02-operator-external-setup-checklist.json',
);

const DEFAULT_REPORT_BASE = path.join(
  'ops',
  'one-time-mishnah',
  'launch-unblocker',
  '2026-07-02-external-setup-readiness-check',
);

const DEFAULT_RAILWAY_PROVISIONING_REPORT = path.join(
  'ops',
  'one-time-mishnah',
  'onetime-railway-provisioning-report.json',
);

const DEFAULT_JOIN_DOMAIN_REPORT = path.join(
  'ops',
  'domain-readbacks',
  '2026-07-02-join-onetimeonetime-domain-task.json',
);

const ONE_TIME_EXPECTED_ENV = Object.freeze({
  PUBLIC_SITE_MODE: 'one_time',
  DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
  DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
  ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
});

function parseArgs(argv = []) {
  const args = {
    json: false,
    writeReport: false,
    railwayOnly: false,
    checklist: DEFAULT_CHECKLIST_PATH,
    railwayProvisioningReport: DEFAULT_RAILWAY_PROVISIONING_REPORT,
    joinDomainReport: DEFAULT_JOIN_DOMAIN_REPORT,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--write-report') args.writeReport = true;
    else if (arg === '--railway-only') args.railwayOnly = true;
    else if (arg === '--checklist') {
      args.checklist = argv[index + 1] || args.checklist;
      index += 1;
    } else if (arg === '--railway-provisioning-report') {
      args.railwayProvisioningReport = argv[index + 1] || args.railwayProvisioningReport;
      index += 1;
    } else if (arg === '--join-domain-report') {
      args.joinDomainReport = argv[index + 1] || args.joinDomainReport;
      index += 1;
    }
  }
  return args;
}

function truthy(value) {
  return ['1', 'true', 'yes', 'y', 'configured', 'ready', 'done'].includes(
    String(value || '').trim().toLowerCase(),
  );
}

function status(value) {
  return String(value || '').trim() ? 'configured' : 'missing';
}

function normalizeValue(value) {
  return String(value || '').replace(/^\uFEFF/, '').trim();
}

function loadSecretCandidate({ envName, names = [], fileNames = [], repoRoot, inspectKeyholder = true }) {
  if (!inspectKeyholder) return { configured: false, value: '', source: 'not configured' };
  const loaded = loadSecret({ envName, names, fileNames, repoRoot });
  const value = normalizeValue(loaded.value);
  return {
    configured: Boolean(value),
    value,
    source: loaded.configured ? safeSecretSourceLabel(loaded) : 'not configured',
    length: value.length,
  };
}

function configuredFromEnvOrSecret(env, envNames, secretSpecs, repoRoot, inspectKeyholder) {
  const envValue = envNames.map((name) => normalizeValue(env[name])).find(Boolean);
  if (envValue) return { configured: true, source: 'env', length: envValue.length, value: envValue };
  for (const spec of secretSpecs) {
    const loaded = loadSecretCandidate({ ...spec, repoRoot, inspectKeyholder });
    if (loaded.configured) return loaded;
  }
  return { configured: false, source: 'not configured', length: 0, value: '' };
}

function loadRailwayTokenEnv(repoRoot) {
  const env = { ...process.env };
  const tokenPath = path.join(repoRoot, '.secrets', 'railway-token.txt');
  if (!env.RAILWAY_TOKEN && !env.RAILWAY_API_TOKEN && fs.existsSync(tokenPath)) {
    env.RAILWAY_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
  }
  return env;
}

function runRailwayVariablesReadback({ repoRoot, service = 'one-time-web', environment = 'production' } = {}) {
  const railwayArgs = ['variable', 'list', '--service', service, '--environment', environment, '--json'];
  const command = process.platform === 'win32' ? 'cmd.exe' : 'railway';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'railway.cmd', ...railwayArgs] : railwayArgs;

  function runWithEnv(commandEnv) {
    return spawnSync(command, args, {
      cwd: repoRoot,
      env: commandEnv,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 4,
    });
  }

  const tokenEnv = loadRailwayTokenEnv(repoRoot);
  let result = runWithEnv(tokenEnv);
  let source = 'railway_token_or_env';
  if (
    result.status !== 0 &&
    /service.+not found|project.+not found|environment.+not found/i.test(String(result.stderr || result.stdout || '')) &&
    (tokenEnv.RAILWAY_TOKEN || tokenEnv.RAILWAY_API_TOKEN)
  ) {
    const fallbackEnv = { ...process.env };
    delete fallbackEnv.RAILWAY_TOKEN;
    delete fallbackEnv.RAILWAY_API_TOKEN;
    const fallback = runWithEnv(fallbackEnv);
    if (fallback.status === 0 && !fallback.error) {
      result = fallback;
      source = 'railway_cli_session_fallback';
    }
  }

  if (result.error) {
    return { ok: false, attempted: true, source, reason: result.error.message || 'Railway variable readback failed.' };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      attempted: true,
      source,
      reason: String(result.stderr || result.stdout || `Railway exited ${result.status}`).split(/\r?\n/)[0],
    };
  }
  try {
    const variables = JSON.parse(result.stdout || '{}');
    const databaseUrl = normalizeValue(variables.DATABASE_URL);
    return {
      ok: true,
      attempted: true,
      source,
      service,
      environment,
      key_count: Object.keys(variables).length,
      database_url_present: Object.prototype.hasOwnProperty.call(variables, 'DATABASE_URL'),
      database_url_length: databaseUrl.length,
      database_url_usable: databaseUrl.length > 0,
      one_time_public_domain_matches: variables.ONE_TIME_PUBLIC_DOMAIN === 'join.onetimeonetime.com',
      default_workspace_matches: variables.DEFAULT_WORKSPACE_KEY === 'rabbi_sheller_provider',
      default_project_matches: variables.DEFAULT_PROJECT_KEY === 'one_time_mishnah_class',
    };
  } catch {
    return { ok: false, attempted: true, source, reason: 'Railway returned non-JSON variable output.' };
  }
}

function expectedEnvMissing(env) {
  return Object.entries(ONE_TIME_EXPECTED_ENV)
    .filter(([key, expected]) => String(env[key] || '').trim() !== expected)
    .map(([key]) => key);
}

function makeItem({ id, title, clears = [], ready, missing = [], warnings = [], verification = [] }) {
  return {
    id,
    title,
    clears_requirements: clears,
    ready: Boolean(ready),
    missing_fields: missing.filter(Boolean),
    warnings: warnings.filter(Boolean),
    verification_after_setup: verification,
  };
}

function readChecklist(checklistPath, repoRoot) {
  const fullPath = path.resolve(repoRoot, checklistPath || DEFAULT_CHECKLIST_PATH);
  if (!fs.existsSync(fullPath)) {
    return { path: checklistPath, present: false, setup_items: [] };
  }
  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return {
    path: checklistPath,
    present: true,
    source_raw_ids: parsed.source_raw_ids || [],
    post_setup_execution_packet: parsed.post_setup_execution_packet || '',
    setup_items: parsed.setup_items || [],
  };
}

function readJsonIfExists(filePath, repoRoot) {
  const fullPath = path.resolve(repoRoot, filePath || '');
  if (!filePath || !fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    return null;
  }
}

function stepOk(report, key) {
  return Array.isArray(report?.steps) && report.steps.some((step) => step.key === key && step.ok === true);
}

function successfulRailwayProvisioning(report) {
  return Boolean(
    report &&
      report.ok === true &&
      report.mutation_performed === true &&
      report.target?.target_project === 'one-time-production' &&
      report.target?.web_service === 'one-time-web' &&
      report.target?.postgres_service === 'one-time-postgres' &&
      (stepOk(report, 'reuse_project') || stepOk(report, 'create_project')) &&
      stepOk(report, 'link_project') &&
      stepOk(report, 'create_or_verify_postgres') &&
      stepOk(report, 'create_or_verify_web') &&
      stepOk(report, 'set_non_secret_variables') &&
      stepOk(report, 'set_database_reference'),
  );
}

function railwayReadiness(env, repoRoot, provisioningReportPath, railwayVariables = null) {
  const serviceReady = status(env.ONE_TIME_RAILWAY_SERVICE || env.ONE_TIME_RAILWAY_SERVICE_LABEL) === 'configured';
  const projectReady = status(env.ONE_TIME_RAILWAY_PROJECT || env.ONE_TIME_RAILWAY_PROJECT_LABEL) === 'configured';
  const environmentReady = status(env.ONE_TIME_RAILWAY_ENVIRONMENT || env.ONE_TIME_RAILWAY_ENVIRONMENT_LABEL) === 'configured';
  const missingExpected = expectedEnvMissing(env);
  const provisioningReport = readJsonIfExists(provisioningReportPath, repoRoot);
  const provisionedByReport = successfulRailwayProvisioning(provisioningReport);
  const railwayVariablesReady =
    railwayVariables?.ok &&
    railwayVariables.one_time_public_domain_matches &&
    railwayVariables.default_workspace_matches &&
    railwayVariables.default_project_matches;
  const envReady = serviceReady && projectReady && environmentReady && missingExpected.length === 0;
  const ready = envReady || provisionedByReport;
  return {
    ready,
    source: provisionedByReport ? 'railway_provisioning_report' : 'env',
    provisioning_report_path: provisionedByReport ? provisioningReportPath : '',
    database_reference_ready:
      Boolean(railwayVariables?.database_url_usable) ||
      (!railwayVariables && provisionedByReport && stepOk(provisioningReport, 'set_database_reference')),
    postgres_service_ready: provisionedByReport && stepOk(provisioningReport, 'create_or_verify_postgres'),
    current_variables_ready: Boolean(railwayVariablesReady),
    current_variables: railwayVariables,
    missing: ready
      ? []
      : [
          serviceReady && projectReady && environmentReady ? '' : 'railway_project_service_environment_label',
          ...missingExpected,
        ],
    warning: ready
      ? ''
      : `Missing explicit One Time Railway target. ${missingExpected
        .map((key) => `${key} missing or mismatch; expected ${ONE_TIME_EXPECTED_ENV[key]}.`)
        .join(' ')}`.trim(),
  };
}

export function buildOneTimeExternalSetupReadiness(options = {}) {
  const env = options.env || process.env;
  const repoRoot = options.repoRoot || process.cwd();
  const inspectKeyholder = options.inspectKeyholder ?? !options.env;
  const inspectRailway = options.inspectRailway ?? !options.env;
  const checklist = readChecklist(options.checklist || DEFAULT_CHECKLIST_PATH, repoRoot);
  const railwayVariables = options.railwayVariables || (inspectRailway ? runRailwayVariablesReadback({ repoRoot }) : null);
  const railway = railwayReadiness(
    env,
    repoRoot,
    options.railwayProvisioningReport || DEFAULT_RAILWAY_PROVISIONING_REPORT,
    railwayVariables,
  );
  const joinDomainReport = readJsonIfExists(options.joinDomainReport || DEFAULT_JOIN_DOMAIN_REPORT, repoRoot);
  const joinDomainReportMatches =
    joinDomainReport?.domain === 'join.onetimeonetime.com' &&
    joinDomainReport?.custom_domain_attached_in_railway === true &&
    joinDomainReport?.apex_root_mutation_performed === false;

  const joinDomainReady =
    (env.ONE_TIME_PUBLIC_DOMAIN === 'join.onetimeonetime.com' || joinDomainReportMatches) &&
    (truthy(env.ONE_TIME_JOIN_DOMAIN_ATTACHED) || joinDomainReportMatches) &&
    (truthy(env.ONE_TIME_JOIN_DNS_CONFIGURED) || joinDomainReport?.verified === true) &&
    (truthy(env.ONE_TIME_APEX_ROOT_UNTOUCHED) || joinDomainReport?.apex_root_must_remain_untouched === true);

  const localDatabase = configuredFromEnvOrSecret(
    env,
    ['ONE_TIME_DATABASE_URL', 'DATABASE_URL_ONE_TIME'],
    [
      {
        envName: 'ONE_TIME_DATABASE_URL',
        names: ['one-time-database-url', 'database-url-one-time'],
        fileNames: ['one-time-database-url.txt', 'DATABASE_URL_ONE_TIME.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );

  const zoomCredentials = [
    ['ZOOM_ACCOUNT_ID', ['zoom-account-id'], ['zoom-account-id.txt', 'ZOOM_ACCOUNT_ID.txt']],
    ['ZOOM_CLIENT_ID', ['zoom-client-id'], ['zoom-client-id.txt', 'ZOOM_CLIENT_ID.txt']],
    ['ZOOM_CLIENT_SECRET', ['zoom-client-secret'], ['zoom-client-secret.txt', 'ZOOM_CLIENT_SECRET.txt']],
  ].map(([envName, names, fileNames]) =>
    configuredFromEnvOrSecret(env, [envName], [{ envName, names, fileNames }], repoRoot, inspectKeyholder),
  );
  const zoomCredentialsReady = zoomCredentials.every((item) => item.configured);
  const zoomSession = configuredFromEnvOrSecret(
    env,
    ['ONE_TIME_ZOOM_SESSION_ALIAS', 'ONE_TIME_ZOOM_DETAILS_ALIAS', 'ONE_TIME_ZOOM_JOIN_URL', 'ZOOM_MEETING_ID'],
    [
      {
        envName: 'ONE_TIME_ZOOM_SESSION_ALIAS',
        names: ['one-time-zoom-session', 'one-time-zoom-join-url', 'zoom-join-url', 'zoom-meeting-id'],
        fileNames: [
          'one-time-zoom-session.txt',
          'one-time-zoom-join-url.txt',
          'zoom-join-url.txt',
          'zoom-meeting-id.txt',
        ],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );

  const vimeoClientId = configuredFromEnvOrSecret(
    env,
    ['VIMEO_CLIENT_ID'],
    [{ envName: 'VIMEO_CLIENT_ID', names: ['vimeo-client-id'], fileNames: ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt'] }],
    repoRoot,
    inspectKeyholder,
  );
  const vimeoClientSecret = configuredFromEnvOrSecret(
    env,
    ['VIMEO_CLIENT_SECRET'],
    [
      {
        envName: 'VIMEO_CLIENT_SECRET',
        names: ['vimeo-client-secret'],
        fileNames: ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );
  const vimeoAccess = configuredFromEnvOrSecret(
    env,
    ['VIMEO_ACCESS_TOKEN', 'ONE_TIME_VIMEO_ACCESS_TOKEN_ALIAS'],
    [
      {
        envName: 'VIMEO_ACCESS_TOKEN',
        names: ['vimeo-access-token', 'one-time-vimeo-access-token'],
        fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'one-time-vimeo-access-token.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );
  const driveDropFolder = configuredFromEnvOrSecret(
    env,
    ['ONE_TIME_DRIVE_DROP_FOLDER_ALIAS', 'ONE_TIME_DRIVE_DROP_FOLDER_ID', 'DRIVE_DROP_FOLDER_ID'],
    [
      {
        envName: 'ONE_TIME_DRIVE_DROP_FOLDER_ALIAS',
        names: ['one-time-drive-drop-folder', 'one-time-drive-folder', 'drive-drop-folder'],
        fileNames: ['one-time-drive-drop-folder.txt', 'one-time-drive-folder.txt', 'drive-drop-folder.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );

  const stripeTestSecret = configuredFromEnvOrSecret(
    env,
    ['RABBI_STRIPE_TEST_SECRET_KEY', 'ONE_TIME_STRIPE_TEST_SECRET_KEY', 'STRIPE_TEST_SECRET_KEY'],
    [
      {
        envName: 'RABBI_STRIPE_TEST_SECRET_KEY',
        names: ['rabbi-stripe-test-secret-key', 'one-time-stripe-test-secret-key', 'stripe-test-secret-key'],
        fileNames: [
          'rabbi-stripe-test-secret-key.txt',
          'one-time-stripe-test-secret-key.txt',
          'stripe-test-secret-key.txt',
          'RABBI_STRIPE_TEST_SECRET_KEY.txt',
        ],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );
  const genericStripeSecret = configuredFromEnvOrSecret(
    env,
    ['STRIPE_SECRET_KEY', 'ONE_TIME_STRIPE_SECRET_KEY'],
    [
      {
        envName: 'STRIPE_SECRET_KEY',
        names: ['stripe-secret-key', 'stripe'],
        fileNames: ['stripe-secret-key.txt', 'STRIPE_SECRET_KEY.txt', 'stripe.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );
  const stripePrice = configuredFromEnvOrSecret(
    env,
    ['ONE_TIME_STRIPE_PRICE_ID', 'ONE_TIME_STRIPE_PRICE_ALIAS', 'RABBI_STRIPE_PRICE_ID'],
    [
      {
        envName: 'ONE_TIME_STRIPE_PRICE_ID',
        names: ['one-time-stripe-price-id', 'rabbi-stripe-price-id', 'stripe-price-67'],
        fileNames: ['one-time-stripe-price-id.txt', 'rabbi-stripe-price-id.txt', 'stripe-price-67.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );
  const stripeLiveKeyPresent = /^sk_live_/i.test(genericStripeSecret.value);
  const stripeTestKeyReady =
    /^sk_test_/i.test(stripeTestSecret.value) ||
    (!stripeLiveKeyPresent && /^sk_test_/i.test(genericStripeSecret.value)) ||
    status(env.ONE_TIME_STRIPE_TEST_SECRET_KEY_ALIAS) === 'configured';

  const whapiToken = configuredFromEnvOrSecret(
    env,
    ['WHAPI_TOKEN', 'WAPI_API_KEY', 'WHAPI_API_TOKEN', 'WAPI_API_TOKEN', 'ONE_TIME_WHAPI_TOKEN_ALIAS'],
    [
      {
        envName: 'WHAPI_API_TOKEN',
        names: ['whapi-api-token', 'wapi-api-token', 'whapi-token', 'wapi-token'],
        fileNames: ['whapi-api-token.txt', 'wapi-api-token.txt', 'whapi-token.txt', 'wapi-token.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );
  const whapiInstance = configuredFromEnvOrSecret(
    env,
    ['ONE_TIME_WHAPI_INSTANCE_ID', 'WHAPI_INSTANCE_ID', 'WAPI_INSTANCE_ID'],
    [
      {
        envName: 'WHAPI_INSTANCE_ID',
        names: ['whapi-instance-id', 'wapi-instance-id'],
        fileNames: ['whapi-instance-id.txt', 'wapi-instance-id.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );
  const whapiPhone = configuredFromEnvOrSecret(
    env,
    ['ONE_TIME_WHAPI_PHONE', 'WHAPI_PHONE', 'WAPI_PHONE', 'BNA_WHATSAPP_NUMBER'],
    [
      {
        envName: 'ONE_TIME_WHAPI_PHONE',
        names: ['one-time-whapi-phone', 'whapi-phone', 'wapi-phone', 'bna-whatsapp-number'],
        fileNames: ['one-time-whapi-phone.txt', 'whapi-phone.txt', 'wapi-phone.txt', 'bna-whatsapp-number.txt'],
      },
    ],
    repoRoot,
    inspectKeyholder,
  );

  const items = [
    makeItem({
      id: 'SETUP-ONETIME-RAILWAY-001',
      title: 'Separate One Time Railway target',
      clears: ['REQ-20260701-701'],
      ready: railway.ready,
      missing: railway.missing,
      warnings: [
        railway.warning,
        railway.source === 'railway_provisioning_report'
          ? `Ready from guarded Railway provisioning report: ${railway.provisioning_report_path}.`
          : '',
      ],
      verification: [
        'npm run one-time:railway-target:guard',
        'npm run one-time:railway-provision:check -- --write-report',
      ],
    }),
    makeItem({
      id: 'SETUP-ONETIME-DB-001',
      title: 'Separate One Time database',
      clears: ['REQ-20260701-701'],
      ready: localDatabase.configured || railway.database_reference_ready,
      missing: localDatabase.configured || railway.database_reference_ready
        ? []
        : ['DATABASE_URL_service_reference_resolves_non_empty_or_ONE_TIME_DATABASE_URL_alias'],
      warnings: [
        railway.database_reference_ready
          ? `Ready from current Railway DATABASE_URL service reference readback or ${railway.provisioning_report_path}.`
          : '',
        railway.current_variables?.ok && !railway.current_variables.database_url_usable
          ? 'Railway one-time-web DATABASE_URL exists but resolves empty; set it to the actual One Time Postgres service reference before deploy.'
          : '',
      ],
      verification: ['npm run one-time:db:bootstrap'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-JOIN-DOMAIN-001',
      title: 'Join subdomain only',
      clears: ['REQ-20260701-702', 'REQ-20260701-703', 'REQ-20260701-704', 'REQ-20260701-717'],
      ready: joinDomainReady,
      missing: [
        env.ONE_TIME_PUBLIC_DOMAIN === 'join.onetimeonetime.com' || joinDomainReportMatches ? '' : 'ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com',
        truthy(env.ONE_TIME_JOIN_DOMAIN_ATTACHED) || joinDomainReportMatches ? '' : 'ONE_TIME_JOIN_DOMAIN_ATTACHED',
        truthy(env.ONE_TIME_JOIN_DNS_CONFIGURED) || joinDomainReport?.verified === true ? '' : 'ONE_TIME_JOIN_DNS_CONFIGURED',
        truthy(env.ONE_TIME_APEX_ROOT_UNTOUCHED) || joinDomainReport?.apex_root_must_remain_untouched === true ? '' : 'ONE_TIME_APEX_ROOT_UNTOUCHED',
      ],
      warnings: [
        joinDomainReportMatches
          ? joinDomainReport?.verified === true
            ? `Railway custom domain and GoDaddy DNS are verified from ${options.joinDomainReport || DEFAULT_JOIN_DOMAIN_REPORT}.`
            : `Railway custom domain is attached from ${options.joinDomainReport || DEFAULT_JOIN_DOMAIN_REPORT}; GoDaddy DNS still must verify.`
          : '',
      ],
      verification: ['join-domain live smoke after deploy'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-ZOOM-001',
      title: 'Zoom session details',
      clears: ['REQ-20260701-708'],
      ready: zoomSession.configured,
      missing: zoomSession.configured
        ? []
        : ['ONE_TIME_ZOOM_SESSION_ALIAS_or_zoom_join_url_alias'],
      warnings: [
        zoomCredentialsReady
          ? 'Zoom account/client credentials are present by safe keyholder alias; class session/join details are still a separate setup item.'
          : 'Zoom account/client credential aliases were not all found.',
      ],
      verification: ['member-gated class-link smoke; no public raw Zoom link'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-VIMEO-001',
      title: 'Vimeo / Drive / OBS media setup',
      clears: ['REQ-20260701-713'],
      ready: vimeoAccess.configured && driveDropFolder.configured,
      missing: [
        vimeoAccess.configured ? '' : 'VIMEO_ACCESS_TOKEN_alias_or_keyholder_path',
        driveDropFolder.configured ? '' : 'ONE_TIME_DRIVE_DROP_FOLDER_ALIAS',
      ],
      warnings: [
        vimeoClientId.configured && vimeoClientSecret.configured && vimeoAccess.configured
          ? 'Vimeo client credentials and access token are present by safe keyholder alias; remaining media setup needs the One Time Drive/drop folder and any private test-folder/OBS decisions.'
          : vimeoClientId.configured && vimeoClientSecret.configured
            ? 'Vimeo client credentials are present by safe keyholder alias; upload/readback still needs an access token alias.'
            : 'Vimeo client credential aliases were not all found.',
      ],
      verification: ['fingerprint-only Vimeo readback', 'Drive intake/drop-folder readback'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-STRIPE-001',
      title: 'Rabbi Stripe sandbox',
      clears: ['REQ-20260701-714'],
      ready: stripeTestKeyReady && stripePrice.configured,
      missing: [
        stripeTestKeyReady ? '' : 'rabbi_stripe_test_secret_key_alias_or_test_key_status',
        stripePrice.configured ? '' : '67_month_product_price_id_or_alias',
      ],
      warnings: [stripeLiveKeyPresent ? 'Live Stripe key appears configured; sandbox-only smoke must not use it.' : ''],
      verification: ['sandbox Stripe smoke only; no live payment'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-WHAPI-001',
      title: 'Whapi/WAPI provider details',
      ready: whapiToken.configured && whapiInstance.configured && whapiPhone.configured,
      missing: [
        whapiToken.configured ? '' : 'whapi_wapi_token_alias',
        whapiInstance.configured ? '' : 'whapi_wapi_instance_id',
        whapiPhone.configured ? '' : 'whapi_wapi_phone_number',
      ],
      verification: ['safe test send only in later exact packet'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-CAMPAIGN-001',
      title: 'Campaign seed / real campaign',
      clears: ['REQ-20260701-709', 'REQ-20260701-710'],
      ready:
        joinDomainReady &&
        truthy(env.ONE_TIME_CAMPAIGN_COPY_READY) &&
        truthy(env.ONE_TIME_CAMPAIGN_SEGMENT_READY) &&
        truthy(env.ONE_TIME_SUPPRESSION_READY) &&
        truthy(env.ONE_TIME_SEED_PACKET_APPROVED),
      missing: [
        joinDomainReady ? '' : 'join_domain_live_first',
        truthy(env.ONE_TIME_CAMPAIGN_COPY_READY) ? '' : 'final_campaign_copy',
        truthy(env.ONE_TIME_CAMPAIGN_SEGMENT_READY) ? '' : 'exact_recipient_segment_or_list',
        truthy(env.ONE_TIME_SUPPRESSION_READY) ? '' : 'suppression_unsubscribe_proof',
        truthy(env.ONE_TIME_SEED_PACKET_APPROVED) ? '' : 'explicit_seed_packet_approval',
      ],
      verification: ['seed packet to sdratler@gmail.com after live link only'],
    }),
  ];

  const scopedItems = options.railwayOnly ? items.slice(0, 1) : items;
  const readyCount = scopedItems.filter((item) => item.ready).length;
  const blockers = scopedItems.filter((item) => !item.ready);
  return {
    generated_at: new Date().toISOString(),
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    external_write_performed: false,
    provider_mutation_performed: false,
    dns_mutation_performed: false,
    email_send_performed: false,
    whatsapp_send_performed: false,
    live_payment_performed: false,
    secret_values_printed: false,
    mode: options.railwayOnly ? 'railway_only' : 'full_setup',
    checklist,
    railway_variable_readback: railway.current_variables || null,
    ready_count: readyCount,
    total_count: scopedItems.length,
    all_required_external_setup_ready: blockers.length === 0,
    post_setup_execution_packet: checklist.post_setup_execution_packet || '',
    items: scopedItems,
    blockers: blockers.map((item) => ({
      id: item.id,
      title: item.title,
      missing_fields: item.missing_fields,
      warnings: item.warnings,
    })),
  };
}

function renderMarkdown(report) {
  return [
    '# One Time External Setup Readiness Check',
    '',
    `Generated: ${report.generated_at}`,
    '',
    `Workspace/project: \`${report.workspace_key}\` / \`${report.project_key}\``,
    `Mode: ${report.mode}`,
    `External write performed: ${report.external_write_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    `Ready items: ${report.ready_count}/${report.total_count}`,
    `All external setup ready: ${report.all_required_external_setup_ready}`,
    '',
    '## Items',
    '',
    ...report.items.flatMap((item) => [
      `### ${item.id} - ${item.title}`,
      '',
      `Ready: ${item.ready}`,
      item.clears_requirements.length ? `Clears: ${item.clears_requirements.join(', ')}` : 'Clears: not mapped',
      item.missing_fields.length ? `Missing: ${item.missing_fields.join(', ')}` : 'Missing: none',
      item.warnings.length ? `Warnings: ${item.warnings.join(' ')}` : 'Warnings: none',
      '',
    ]),
    '## Next Packet',
    '',
    report.all_required_external_setup_ready
      ? `Run \`${report.post_setup_execution_packet}\`.`
      : 'Do not run deploy/live smoke yet. Clear the missing fields above first.',
    '',
  ].join('\n');
}

function writeReport(report, repoRoot = process.cwd()) {
  const basePath = path.resolve(repoRoot, DEFAULT_REPORT_BASE);
  fs.mkdirSync(path.dirname(basePath), { recursive: true });
  fs.writeFileSync(`${basePath}.json`, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(`${basePath}.md`, renderMarkdown(report));
  return {
    json: path.relative(repoRoot, `${basePath}.json`).replace(/\\/g, '/'),
    md: path.relative(repoRoot, `${basePath}.md`).replace(/\\/g, '/'),
  };
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const report = buildOneTimeExternalSetupReadiness({
    ...options,
    checklist: args.checklist || options.checklist,
    railwayProvisioningReport: args.railwayProvisioningReport || options.railwayProvisioningReport,
    joinDomainReport: args.joinDomainReport || options.joinDomainReport,
    railwayOnly: args.railwayOnly || options.railwayOnly,
  });
  const paths = args.writeReport ? writeReport(report, options.repoRoot || process.cwd()) : null;
  if (args.json) console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  else console.log(renderMarkdown(report));
  if (!report.all_required_external_setup_ready) process.exitCode = 1;
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 2;
  });
}
