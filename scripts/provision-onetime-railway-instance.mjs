#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { buildOneTimeRailwayTargetGuard } from './railway-target-guard.mjs';

function parseArgs(argv = []) {
  const args = { apply: false, json: false, writeReport: false, service: '', environment: '', targetDomain: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--write-report') args.writeReport = true;
    else if (arg === '--service') {
      args.service = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--environment') {
      args.environment = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--target-domain') {
      args.targetDomain = argv[index + 1] || '';
      index += 1;
    }
  }
  return args;
}

function renderMarkdown(report) {
  return [
    `# One Time Railway Provision Check`,
    '',
    `Generated: ${report.generated_at}`,
    '',
    `Apply requested: ${report.apply_requested}`,
    `External write performed: ${report.external_write_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    `Target domain: ${report.target_domain}`,
    `Target guard ready: ${report.target_guard.ready}`,
    `Apply allowed: ${report.apply_allowed}`,
    '',
    '## Required Variables',
    '',
    ...report.target_guard.checks.map((check) => `- ${check.key}: ${check.value_status}`),
    '',
    '## Blocked Live Actions',
    '',
    ...report.blocked_live_actions.map((action) => `- ${action}`),
    '',
    report.blocker ? `Blocker: ${report.blocker}` : 'No blocker for dry-run readiness.',
    '',
  ].join('\n');
}

export function buildOneTimeRailwayProvisionCheck(options = {}) {
  const env = options.env || process.env;
  const applyRequested = Boolean(options.apply);
  const targetGuard = buildOneTimeRailwayTargetGuard({
    env,
    service: options.service,
    environment: options.environment,
    targetDomain: options.targetDomain,
  });
  const confirmation = env.CONFIRM_ONE_TIME_RAILWAY_PROVISION === 'join.onetimeonetime.com';
  const applyAllowed = applyRequested && targetGuard.ready && confirmation;
  const blockedLiveActions = [
    'create_or_select_railway_project',
    'create_or_select_railway_service',
    'create_or_attach_postgres_database',
    'write_railway_variables',
    'add_custom_domain',
    'trigger_deploy_or_promote',
    'mutate_dns',
  ];

  return {
    generated_at: new Date().toISOString(),
    apply_requested: applyRequested,
    apply_allowed: applyAllowed,
    external_write_performed: false,
    secret_values_printed: false,
    target_domain: targetGuard.target_domain,
    target_guard: targetGuard,
    required_confirmation: 'CONFIRM_ONE_TIME_RAILWAY_PROVISION=join.onetimeonetime.com',
    blocked_live_actions: blockedLiveActions,
    blocker: applyRequested && !applyAllowed
      ? 'Apply requested but exact target guard and confirmation are not both present. No Railway mutation performed.'
      : targetGuard.blocker,
  };
}

function writeReport(report, repoRoot = process.cwd()) {
  const outDir = path.join(repoRoot, 'ops', 'one-time-mishnah', 'provisioning');
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, '2026-07-01-separate-railway-db-readiness');
  fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${base}.md`, renderMarkdown(report));
  return { json: `${base}.json`, md: `${base}.md` };
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const report = buildOneTimeRailwayProvisionCheck({
    ...options,
    apply: args.apply || options.apply,
    service: args.service || options.service,
    environment: args.environment || options.environment,
    targetDomain: args.targetDomain || options.targetDomain,
  });
  const paths = args.writeReport ? writeReport(report, options.repoRoot || process.cwd()) : null;
  if (args.json) console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  else console.log(renderMarkdown(report));
  if (args.apply && !report.apply_allowed) process.exitCode = 1;
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 1;
  });
}
