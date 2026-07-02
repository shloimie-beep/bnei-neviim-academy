#!/usr/bin/env node
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const DEFAULT_EXPECTED = Object.freeze({
  PUBLIC_SITE_MODE: 'one_time',
  DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
  DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
  ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
});

const FORBIDDEN_DOMAINS = new Set([
  'onetimeonetime.com',
  'www.onetimeonetime.com',
  'bneineviimacademy.org',
  'www.bneineviimacademy.org',
]);

function parseArgs(argv = []) {
  const args = {
    json: false,
    service: '',
    environment: '',
    targetDomain: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
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

function normalizeDomain(value) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

export function buildOneTimeRailwayTargetGuard(options = {}) {
  const env = options.env || process.env;
  const expected = { ...DEFAULT_EXPECTED, ...(options.expected || {}) };
  const service = options.service || env.ONE_TIME_RAILWAY_SERVICE || env.RAILWAY_SERVICE_NAME || '';
  const environment = options.environment || env.ONE_TIME_RAILWAY_ENVIRONMENT || env.RAILWAY_ENVIRONMENT || 'production';
  const targetDomain = normalizeDomain(options.targetDomain || env.ONE_TIME_PUBLIC_DOMAIN || expected.ONE_TIME_PUBLIC_DOMAIN);
  const checks = Object.entries(expected).map(([key, expectedValue]) => {
    const actual = String(env[key] || '').trim();
    return {
      key,
      expected: expectedValue,
      present: Boolean(actual),
      matches: actual === expectedValue,
      value_status: actual ? (actual === expectedValue ? 'matched' : 'mismatch') : 'missing',
    };
  });
  const forbiddenDomain = FORBIDDEN_DOMAINS.has(targetDomain);
  const missingService = !String(service || '').trim();
  const ready = checks.every((check) => check.matches) && !forbiddenDomain && !missingService;

  return {
    generated_at: new Date().toISOString(),
    external_write_performed: false,
    secret_values_printed: false,
    target_domain: targetDomain,
    forbidden_domains: [...FORBIDDEN_DOMAINS],
    apex_root_untouched_required: true,
    service_present: !missingService,
    service_label: service ? 'configured' : 'missing',
    environment,
    checks,
    ready,
    blocker: ready
      ? null
      : [
          missingService ? 'Missing explicit One Time Railway service target.' : '',
          forbiddenDomain ? `Forbidden campaign target domain: ${targetDomain}. Use join.onetimeonetime.com and do not touch apex/root.` : '',
          ...checks.filter((check) => !check.matches).map((check) => `${check.key} ${check.value_status}; expected ${check.expected}.`),
        ].filter(Boolean).join(' '),
  };
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const report = buildOneTimeRailwayTargetGuard({
    ...options,
    service: args.service || options.service,
    environment: args.environment || options.environment,
    targetDomain: args.targetDomain || options.targetDomain,
  });
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`# One Time Railway Target Guard`);
    console.log(`external_write_performed: ${report.external_write_performed}`);
    console.log(`target_domain: ${report.target_domain}`);
    console.log(`service_label: ${report.service_label}`);
    console.log(`environment: ${report.environment}`);
    console.log(`ready: ${report.ready}`);
    if (report.blocker) console.log(`blocker: ${report.blocker}`);
  }
  if (!report.ready) process.exitCode = 1;
  return report;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 1;
  });
}
