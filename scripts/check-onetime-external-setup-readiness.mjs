#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

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

function railwayReadiness(env, repoRoot, provisioningReportPath) {
  const serviceReady = status(env.ONE_TIME_RAILWAY_SERVICE || env.ONE_TIME_RAILWAY_SERVICE_LABEL) === 'configured';
  const projectReady = status(env.ONE_TIME_RAILWAY_PROJECT || env.ONE_TIME_RAILWAY_PROJECT_LABEL) === 'configured';
  const environmentReady = status(env.ONE_TIME_RAILWAY_ENVIRONMENT || env.ONE_TIME_RAILWAY_ENVIRONMENT_LABEL) === 'configured';
  const missingExpected = expectedEnvMissing(env);
  const provisioningReport = readJsonIfExists(provisioningReportPath, repoRoot);
  const provisionedByReport = successfulRailwayProvisioning(provisioningReport);
  const envReady = serviceReady && projectReady && environmentReady && missingExpected.length === 0;
  const ready = envReady || provisionedByReport;
  return {
    ready,
    source: provisionedByReport ? 'railway_provisioning_report' : 'env',
    provisioning_report_path: provisionedByReport ? provisioningReportPath : '',
    database_reference_ready: provisionedByReport && stepOk(provisioningReport, 'set_database_reference'),
    postgres_service_ready: provisionedByReport && stepOk(provisioningReport, 'create_or_verify_postgres'),
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
  const checklist = readChecklist(options.checklist || DEFAULT_CHECKLIST_PATH, repoRoot);
  const railway = railwayReadiness(
    env,
    repoRoot,
    options.railwayProvisioningReport || DEFAULT_RAILWAY_PROVISIONING_REPORT,
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

  const stripeSecret = String(env.STRIPE_SECRET_KEY || env.ONE_TIME_STRIPE_SECRET_KEY || '');
  const stripeLiveKeyPresent = /^sk_live_/i.test(stripeSecret);
  const stripeTestKeyReady =
    !stripeLiveKeyPresent &&
    (status(env.ONE_TIME_STRIPE_TEST_SECRET_KEY_ALIAS) === 'configured' || /^sk_test_/i.test(stripeSecret));

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
      ready: status(env.ONE_TIME_DATABASE_URL || env.DATABASE_URL_ONE_TIME) === 'configured' || railway.database_reference_ready,
      missing: status(env.ONE_TIME_DATABASE_URL || env.DATABASE_URL_ONE_TIME) === 'configured' || railway.database_reference_ready
        ? []
        : ['ONE_TIME_DATABASE_URL_or_DATABASE_URL_ONE_TIME_keyholder_alias'],
      warnings: [
        railway.database_reference_ready
          ? `Ready from Railway Postgres service and DATABASE_URL service reference in ${railway.provisioning_report_path}.`
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
          ? `Railway custom domain is attached from ${options.joinDomainReport || DEFAULT_JOIN_DOMAIN_REPORT}; GoDaddy DNS still must verify.`
          : '',
      ],
      verification: ['join-domain live smoke after deploy'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-ZOOM-001',
      title: 'Zoom session details',
      clears: ['REQ-20260701-708'],
      ready: status(env.ONE_TIME_ZOOM_SESSION_ALIAS || env.ONE_TIME_ZOOM_DETAILS_ALIAS) === 'configured',
      missing: status(env.ONE_TIME_ZOOM_SESSION_ALIAS || env.ONE_TIME_ZOOM_DETAILS_ALIAS) === 'configured'
        ? []
        : ['ONE_TIME_ZOOM_SESSION_ALIAS_or_private_keyholder_path'],
      verification: ['member-gated class-link smoke; no public raw Zoom link'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-VIMEO-001',
      title: 'Vimeo / Drive / OBS media setup',
      clears: ['REQ-20260701-713'],
      ready:
        status(env.VIMEO_ACCESS_TOKEN || env.ONE_TIME_VIMEO_ACCESS_TOKEN_ALIAS) === 'configured' &&
        status(env.ONE_TIME_DRIVE_DROP_FOLDER_ALIAS) === 'configured',
      missing: [
        status(env.VIMEO_ACCESS_TOKEN || env.ONE_TIME_VIMEO_ACCESS_TOKEN_ALIAS) === 'configured'
          ? ''
          : 'VIMEO_ACCESS_TOKEN_alias_or_keyholder_path',
        status(env.ONE_TIME_DRIVE_DROP_FOLDER_ALIAS) === 'configured' ? '' : 'ONE_TIME_DRIVE_DROP_FOLDER_ALIAS',
      ],
      verification: ['fingerprint-only Vimeo readback', 'Drive intake/drop-folder readback'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-STRIPE-001',
      title: 'Rabbi Stripe sandbox',
      clears: ['REQ-20260701-714'],
      ready: stripeTestKeyReady && status(env.ONE_TIME_STRIPE_PRICE_ID || env.ONE_TIME_STRIPE_PRICE_ALIAS) === 'configured',
      missing: [
        stripeTestKeyReady ? '' : 'rabbi_stripe_test_secret_key_alias_or_test_key_status',
        status(env.ONE_TIME_STRIPE_PRICE_ID || env.ONE_TIME_STRIPE_PRICE_ALIAS) === 'configured'
          ? ''
          : '67_month_product_price_id_or_alias',
      ],
      warnings: [stripeLiveKeyPresent ? 'Live Stripe key appears configured; sandbox-only smoke must not use it.' : ''],
      verification: ['sandbox Stripe smoke only; no live payment'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-WHAPI-001',
      title: 'Whapi/WAPI provider details',
      ready:
        status(env.WHAPI_TOKEN || env.WAPI_API_KEY || env.ONE_TIME_WHAPI_TOKEN_ALIAS) === 'configured' &&
        status(env.ONE_TIME_WHAPI_INSTANCE_ID || env.WHAPI_INSTANCE_ID) === 'configured' &&
        status(env.ONE_TIME_WHAPI_PHONE) === 'configured',
      missing: [
        status(env.WHAPI_TOKEN || env.WAPI_API_KEY || env.ONE_TIME_WHAPI_TOKEN_ALIAS) === 'configured'
          ? ''
          : 'whapi_wapi_token_alias',
        status(env.ONE_TIME_WHAPI_INSTANCE_ID || env.WHAPI_INSTANCE_ID) === 'configured' ? '' : 'whapi_wapi_instance_id',
        status(env.ONE_TIME_WHAPI_PHONE) === 'configured' ? '' : 'whapi_wapi_phone_number',
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
