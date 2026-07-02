#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { buildOneTimeDatabaseBootstrapCheck } from './bootstrap-onetime-database.mjs';
import { buildOneTimeRailwayTargetGuard } from './railway-target-guard.mjs';

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

function parseArgs(argv = []) {
  const args = {
    json: false,
    writeReport: false,
    checklist: DEFAULT_CHECKLIST_PATH,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--write-report') args.writeReport = true;
    else if (arg === '--checklist') {
      args.checklist = argv[index + 1] || args.checklist;
      index += 1;
    }
  }
  return args;
}

function truthy(value) {
  return ['1', 'true', 'yes', 'y', 'configured', 'ready', 'done'].includes(String(value || '').trim().toLowerCase());
}

function status(value) {
  return String(value || '').trim() ? 'configured' : 'missing';
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

export function buildOneTimeExternalSetupReadiness(options = {}) {
  const env = options.env || process.env;
  const repoRoot = options.repoRoot || process.cwd();
  const checklist = readChecklist(options.checklist || DEFAULT_CHECKLIST_PATH, repoRoot);
  const railway = buildOneTimeRailwayTargetGuard({ env });
  const db = buildOneTimeDatabaseBootstrapCheck({ env, apply: false });

  const joinDomainReady =
    env.ONE_TIME_PUBLIC_DOMAIN === 'join.onetimeonetime.com' &&
    truthy(env.ONE_TIME_JOIN_DOMAIN_ATTACHED) &&
    truthy(env.ONE_TIME_JOIN_DNS_CONFIGURED) &&
    truthy(env.ONE_TIME_APEX_ROOT_UNTOUCHED);

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
      missing: [
        railway.service_present ? '' : 'railway_project_service_environment_label',
        ...railway.checks.filter((check) => !check.matches).map((check) => check.key),
      ],
      warnings: [railway.blocker || ''],
      verification: ['npm run one-time:railway-target:guard', 'npm run one-time:railway-provision:check -- --write-report'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-DB-001',
      title: 'Separate One Time database',
      clears: ['REQ-20260701-701'],
      ready: db.database_url_status === 'configured',
      missing: db.database_url_status === 'configured' ? [] : ['ONE_TIME_DATABASE_URL_or_DATABASE_URL_ONE_TIME_keyholder_alias'],
      verification: ['npm run one-time:db:bootstrap'],
    }),
    makeItem({
      id: 'SETUP-ONETIME-JOIN-DOMAIN-001',
      title: 'Join subdomain only',
      clears: ['REQ-20260701-702', 'REQ-20260701-703', 'REQ-20260701-704', 'REQ-20260701-717'],
      ready: joinDomainReady,
      missing: [
        env.ONE_TIME_PUBLIC_DOMAIN === 'join.onetimeonetime.com' ? '' : 'ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com',
        truthy(env.ONE_TIME_JOIN_DOMAIN_ATTACHED) ? '' : 'ONE_TIME_JOIN_DOMAIN_ATTACHED',
        truthy(env.ONE_TIME_JOIN_DNS_CONFIGURED) ? '' : 'ONE_TIME_JOIN_DNS_CONFIGURED',
        truthy(env.ONE_TIME_APEX_ROOT_UNTOUCHED) ? '' : 'ONE_TIME_APEX_ROOT_UNTOUCHED',
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
      verification: ['safe test send only in later explicit packet'],
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

  const readyCount = items.filter((item) => item.ready).length;
  const blockers = items.filter((item) => !item.ready);
  const report = {
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
    checklist,
    ready_count: readyCount,
    total_count: items.length,
    all_required_external_setup_ready: blockers.length === 0,
    post_setup_execution_packet: checklist.post_setup_execution_packet || '',
    items,
    blockers: blockers.map((item) => ({
      id: item.id,
      title: item.title,
      missing_fields: item.missing_fields,
      warnings: item.warnings,
    })),
  };
  return report;
}

function renderMarkdown(report) {
  return [
    '# One Time External Setup Readiness Check',
    '',
    `Generated: ${report.generated_at}`,
    '',
    `Workspace/project: \`${report.workspace_key}\` / \`${report.project_key}\``,
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
  fs.writeFileSync(`${basePath}.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${basePath}.md`, renderMarkdown(report));
  return {
    json: path.relative(repoRoot, `${basePath}.json`),
    md: path.relative(repoRoot, `${basePath}.md`),
  };
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const report = buildOneTimeExternalSetupReadiness({
    ...options,
    checklist: args.checklist || options.checklist,
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
