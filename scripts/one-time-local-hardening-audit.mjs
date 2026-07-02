#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const { runOneTimeLocalBetaCommand } = await import('./one-time-local-beta.mjs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const REQUIREMENT_ID = 'REQ-20260619-419';

const REQUIRED_ROUTES = [
  '/',
  '/one-time',
  '/one-time/mishnayos',
  '/one-time/us',
  '/one-time/uk',
  '/one-time/israel',
  '/one-time/interest',
  '/one-time/member-login',
  '/rabbi',
  '/parent',
  '/student',
  '/provider',
  '/operations',
  '/api/one-time/interest',
  '/api/bna/one-time/integrations/readiness',
  '/api/bna/one-time/community-moderation-readiness',
  '/api/bna/gamification/badge-readiness',
  '/api/bna/pending-briefs',
];

const REQUIRED_BASIC_ACTIONS = [
  'ACTION-ONETIME-JOIN-SHIR-CTA',
  'ACTION-ONETIME-INTEREST-FORM',
  'ACTION-ONETIME-MEMBER-LOGIN-LINK',
  'ACTION-ONETIME-SCOPED-AGENT-STATUS',
  'ACTION-ONETIME-DRIVE-BRIEF-PREVIEW',
];

const REQUIRED_DETAILED_ACTIONS = [
  'create_provider_classroom_draft',
  'post_community_message',
  'submit_student_question_for_moderation',
  'review_moderated_question',
];

const REQUIRED_MIGRATIONS = [
  'railway-migration-2026-06-05-one-time-projects.sql',
  'railway-migration-2026-06-16-one-time-product-system.sql',
  'railway-migration-2026-06-16-community-06.sql',
];

const REQUIRED_WATCHDOG_SCRIPTS = [
  'watchdog:ui',
  'watchdog:actions',
  'watchdog:security',
  'watchdog:links',
  'watchdog:audit',
];

const SECRET_SCAN_FILES = [
  'scripts/one-time-local-beta.mjs',
  'scripts/one-time-local-hardening-audit.mjs',
  'src/platform/community/announcements-first.js',
  'src/platform/progress/one-time-progress.js',
  'docs/product/one-time-local-beta-startup-seed-reset.md',
  'docs/product/one-time-progress-rewards-local-beta.md',
  'docs/product/one-time-announcements-first-community.md',
  'tests/one-time-local-beta-startup-reset.test.js',
  'tests/one-time-progress-rewards-local-beta.test.js',
  'tests/one-time-announcements-first-community.test.js',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, filePath), 'utf8'));
}

function readText(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function check(name, ok, details = {}) {
  return { name, ok: Boolean(ok), ...details };
}

function routeRegistryChecks() {
  const registry = readJson('ops/route-registry.json');
  const routes = new Map((registry.routes || []).map((row) => [row.route, row]));
  const missing = REQUIRED_ROUTES.filter((route) => !routes.has(route));
  const unsafePublic = REQUIRED_ROUTES
    .map((route) => routes.get(route))
    .filter(Boolean)
    .filter((row) => row.public_allowed === true && row.access === 'private');
  const apiInterest = routes.get('/api/one-time/interest') || {};
  return [
    check('route_registry_required_routes_present', missing.length === 0, { missing }),
    check('route_registry_public_private_consistency', unsafePublic.length === 0, {
      unsafe: unsafePublic.map((row) => row.route),
    }),
    check('route_registry_interest_api_no_external_write_expectation', /no checkout|no external send|access grant/i.test(apiInterest.security_expectation || ''), {
      route: '/api/one-time/interest',
    }),
  ];
}

function actionRegistryChecks() {
  const basic = readJson('ops/action-registry.json');
  const detailed = readJson('ops/action-registry/actions.json');
  const basicIds = new Set((basic.actions || []).map((row) => row.action_id));
  const detailedIds = new Set((Array.isArray(detailed) ? detailed : []).map((row) => row.action_id));
  const missingBasic = REQUIRED_BASIC_ACTIONS.filter((id) => !basicIds.has(id));
  const missingDetailed = REQUIRED_DETAILED_ACTIONS.filter((id) => !detailedIds.has(id));
  return [
    check('basic_action_registry_onetime_actions_present', missingBasic.length === 0, { missing: missingBasic }),
    check('detailed_action_registry_community_actions_present', missingDetailed.length === 0, { missing: missingDetailed }),
  ];
}

function packageAndWatchdogChecks() {
  const packageJson = readJson('package.json');
  const scripts = packageJson.scripts || {};
  const missingWatchdogs = REQUIRED_WATCHDOG_SCRIPTS.filter((script) => !scripts[script]);
  const missingLocal = ['onetime:local:plan', 'onetime:local:seed', 'onetime:local:reset', 'onetime:local:smoke', 'onetime:local:audit']
    .filter((script) => !scripts[script]);
  return [
    check('watchdog_scripts_available', missingWatchdogs.length === 0, { missing: missingWatchdogs }),
    check('one_time_local_scripts_available', missingLocal.length === 0, { missing: missingLocal }),
  ];
}

function migrationChecks() {
  const missing = REQUIRED_MIGRATIONS.filter((file) => !fs.existsSync(path.join(repoRoot, file)));
  const risky = REQUIRED_MIGRATIONS
    .filter((file) => fs.existsSync(path.join(repoRoot, file)))
    .filter((file) => /\bDROP\s+DATABASE\b|\bTRUNCATE\b/i.test(readText(file)));
  return [
    check('one_time_migrations_present', missing.length === 0, { missing }),
    check('one_time_migrations_no_drop_database_or_truncate', risky.length === 0, { risky }),
  ];
}

function secretAndProviderChecks() {
  const findings = [];
  const providerFindings = [];
  for (const file of SECRET_SCAN_FILES) {
    const text = readText(file);
    if (/\bsk-[A-Za-z0-9_-]{20,}\b|\b\d{7,12}:[A-Za-z0-9_-]{25,}\b|postgres(?:ql)?:\/\/[^'"\s<>]+/i.test(text)) {
      findings.push(file);
    }
    if (file !== 'scripts/one-time-local-hardening-audit.mjs' && /\b(?:GoHighLevel|LeadConnector|LeadConnectorHQ|GHL)\b/i.test(text)) {
      providerFindings.push(file);
    }
  }
  return [
    check('local_beta_files_no_secret_values', findings.length === 0, { findings }),
    check('local_beta_files_no_active_ghl_runtime', providerFindings.length === 0, { findings: providerFindings }),
  ];
}

function localCliSafetyChecks() {
  const started = Date.now();
  const smoke = runOneTimeLocalBetaCommand({ command: 'smoke', write: false });
  const durationMs = Date.now() - started;
  const allSmokeChecksPass = Array.isArray(smoke.checks) && smoke.checks.every((item) => item.ok);
  return [
    check('local_beta_smoke_preview_passes', smoke.success === true && allSmokeChecksPass, {
      duration_ms: durationMs,
      checks: smoke.checks?.length || 0,
    }),
    check('local_beta_smoke_no_writes', smoke.write_performed === false && smoke.external_write_performed === false && smoke.production_mutation_performed === false, {
      write_performed: smoke.write_performed,
    }),
    check('local_beta_smoke_fast_enough_for_local_loop', durationMs < 3000, { duration_ms: durationMs, budget_ms: 3000 }),
  ];
}

export function buildOneTimeLocalHardeningAudit() {
  const checks = [
    ...routeRegistryChecks(),
    ...actionRegistryChecks(),
    ...packageAndWatchdogChecks(),
    ...migrationChecks(),
    ...secretAndProviderChecks(),
    ...localCliSafetyChecks(),
  ];
  return {
    requirement_id: REQUIREMENT_ID,
    generated_at: new Date().toISOString(),
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    checks,
    success: checks.every((item) => item.ok),
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  return {
    json: argv.includes('--json'),
    writeReport: argv.includes('--write-report'),
  };
}

function reportPath() {
  return path.join(repoRoot, 'ops', 'execution-runs', '2026-06-19-onetime-local-beta-hardening', 'evidence', 'req419-local-hardening-audit.json');
}

function maybeWriteReport(audit) {
  const filePath = reportPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(audit, null, 2)}\n`);
  return rel(filePath);
}

async function main() {
  const args = parseArgs();
  const audit = buildOneTimeLocalHardeningAudit();
  if (args.writeReport) audit.report_path = maybeWriteReport(audit);
  if (args.json) console.log(JSON.stringify(audit, null, 2));
  else {
    console.log(`One Time local hardening audit: ${audit.success ? 'PASS' : 'FAIL'}`);
    for (const item of audit.checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}`);
    if (audit.report_path) console.log(`Report: ${audit.report_path}`);
  }
  if (!audit.success) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
