#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  BACKFILL_CONFIRM_PHRASE,
  buildExternalReadbackGateReport,
  externalReadbackGateBlockers,
  READBACK_CONFIRM_PHRASE,
  summarizeExternalReadbackGateReport,
} from './bna-external-readback-gate.mjs';
import { buildIntegrationReadinessSummary, integrationReadinessBlockers } from './lib/integration-readiness.mjs';

export const DEPLOY_CONFIRM_PHRASE = 'DEPLOY_BNA_PRODUCTION_CLOSEOUT';
export const LIVE_VERIFY_CONFIRM_PHRASE = 'VERIFY_BNA_LIVE_CLOSEOUT';
export const DEPLOY_APPROVAL_ENV = 'BNA_PRODUCTION_DEPLOY_APPROVED';
export const LIVE_VERIFY_APPROVAL_ENV = 'BNA_LIVE_VERIFY_APPROVED';
export const DEFER_OPTIONAL_INTEGRATIONS_ENV = 'BNA_DEFER_OPTIONAL_INTEGRATIONS_APPROVED';
export const DEFER_EXTERNAL_READBACK_ENV = 'BNA_DEFER_EXTERNAL_READBACK_APPROVED';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

const REQUIRED_PACKAGE_SCRIPTS = [
  'bna:run:validate',
  'bna:run:source-coverage',
  'bna:intake:postgres',
  'production:readiness:gate',
  'app:smoke',
  'railway:doctor',
  'watchdog:raw',
  'secrets:audit',
];

const WORK_REMAINS_STATUSES = new Set([
  'not_started',
  'in_progress',
  'needs_verification',
  'blocked',
  'needs_operator_decision',
]);

function readNext(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    json: false,
    deploy: false,
    liveVerify: false,
    finalCloseout: false,
    confirmDeploy: '',
    confirmLive: '',
    repoRoot: DEFAULT_REPO_ROOT,
    allowDetached: false,
    remoteBranch: '',
    deferOptionalIntegrations: false,
    deferExternalReadback: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--deploy') options.deploy = true;
    else if (arg === '--live-verify') options.liveVerify = true;
    else if (arg === '--final-closeout') options.finalCloseout = true;
    else if (arg === '--allow-detached') options.allowDetached = true;
    else if (arg === '--defer-optional-integrations') options.deferOptionalIntegrations = true;
    else if (arg === '--defer-external-readback') options.deferExternalReadback = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--confirm-deploy') {
      options.confirmDeploy = readNext(argv, index, '--confirm-deploy');
      index += 1;
    } else if (arg.startsWith('--confirm-deploy=')) options.confirmDeploy = arg.slice('--confirm-deploy='.length);
    else if (arg === '--confirm-live') {
      options.confirmLive = readNext(argv, index, '--confirm-live');
      index += 1;
    } else if (arg.startsWith('--confirm-live=')) options.confirmLive = arg.slice('--confirm-live='.length);
    else if (arg === '--run-dir') {
      options.runDir = readNext(argv, index, '--run-dir');
      index += 1;
    } else if (arg.startsWith('--run-dir=')) options.runDir = arg.slice('--run-dir='.length);
    else if (arg === '--expected-branch') {
      options.expectedBranch = readNext(argv, index, '--expected-branch');
      index += 1;
    } else if (arg.startsWith('--expected-branch=')) options.expectedBranch = arg.slice('--expected-branch='.length);
    else if (arg === '--remote-branch') {
      options.remoteBranch = readNext(argv, index, '--remote-branch');
      index += 1;
    } else if (arg.startsWith('--remote-branch=')) options.remoteBranch = arg.slice('--remote-branch='.length);
    else if (arg === '--repo-root') {
      options.repoRoot = path.resolve(readNext(argv, index, '--repo-root'));
      index += 1;
    } else if (arg.startsWith('--repo-root=')) options.repoRoot = path.resolve(arg.slice('--repo-root='.length));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

export function usage() {
  return `Usage:
  node scripts/bna-production-closeout-gate.mjs --json
  node scripts/bna-production-closeout-gate.mjs --json --allow-detached --remote-branch codex/issue-8-complete-system-reconciliation
  node scripts/bna-production-closeout-gate.mjs --deploy --confirm-deploy ${DEPLOY_CONFIRM_PHRASE}
  node scripts/bna-production-closeout-gate.mjs --deploy --confirm-deploy ${DEPLOY_CONFIRM_PHRASE} --defer-optional-integrations --defer-external-readback
  node scripts/bna-production-closeout-gate.mjs --live-verify --confirm-live ${LIVE_VERIFY_CONFIRM_PHRASE}

Dry-run by default. This command does not deploy, smoke the live app, mutate the
database, or print secrets. It verifies that the local branch/run state is safe
enough to request the separately approved production deploy/live-verification
steps.

For scoped deploys, --defer-optional-integrations and --defer-external-readback
record unrelated provider/readback readiness as deferred findings after the
normal deploy approval is present. They do not approve sends, charges, DNS,
credential changes, provider account writes, production mutations, or live
verification closeout.`;
}

export function defaultRunCommand(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || DEFAULT_REPO_ROOT,
    env: options.env || process.env,
    encoding: 'utf8',
    shell: false,
    maxBuffer: options.maxBuffer || 1024 * 1024 * 8,
  });
  return {
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error ? String(result.error.message || result.error) : '',
  };
}

function runGit(args, repoRoot, runCommand) {
  return runCommand('git', args, { cwd: repoRoot });
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function normalizeRepoPath(value) {
  return String(value || '').trim().replaceAll('\\', '/');
}

function trimmedOutput(value) {
  return String(value || '').trim();
}

function parseStatusPorcelain(text = '') {
  const files = String(text || '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2),
      path: normalizeRepoPath(line.slice(2).trimStart()),
    }));
  return {
    total: files.length,
    staged: files.filter((file) => file.status[0] !== ' ' && file.status[0] !== '?').length,
    modified: files.filter((file) => file.status[1] !== ' ' && file.status[0] !== '?').length,
    untracked: files.filter((file) => file.status === '??').length,
    sample: files.slice(0, 40),
  };
}

function resolveRunDir(repoRoot, options = {}) {
  if (options.runDir) return path.resolve(repoRoot, options.runDir);
  const latest = readJsonSafe(path.join(repoRoot, 'ops', 'execution-runs', 'latest.json'));
  return latest?.path ? path.resolve(repoRoot, latest.path) : null;
}

function loadRunState(repoRoot, options = {}) {
  const runDir = resolveRunDir(repoRoot, options);
  const runJson = runDir ? readJsonSafe(path.join(runDir, 'run.json')) : null;
  const requirementsJson = runDir ? readJsonSafe(path.join(runDir, 'requirements.json')) : null;
  const requirements = Array.isArray(requirementsJson?.requirements) ? requirementsJson.requirements : [];
  const statusCounts = requirements.reduce((acc, requirement) => {
    const status = String(requirement.status || 'unknown');
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const openRequirements = requirements
    .filter((requirement) => WORK_REMAINS_STATUSES.has(String(requirement.status || '')))
    .map((requirement) => ({
      id: requirement.id,
      status: requirement.status,
      owner: requirement.owner || '',
      next_action: requirement.next_action || '',
      blocker: requirement.blocker || '',
    }));

  return {
    run_dir: runDir ? normalizeRepoPath(path.relative(repoRoot, runDir)) : null,
    run_id: runJson?.run_id || requirementsJson?.run_id || null,
    active: runJson?.active === true,
    expected_branch: options.expectedBranch || runJson?.git_refs?.expected_branch || null,
    pr_number: runJson?.git_refs?.pr_number || null,
    pr_url: runJson?.git_refs?.pr_url || null,
    status_counts: statusCounts,
    open_requirements: openRequirements,
  };
}

function loadPackageScripts(repoRoot) {
  const pkg = readJsonSafe(path.join(repoRoot, 'package.json'));
  return pkg?.scripts && typeof pkg.scripts === 'object' ? pkg.scripts : {};
}

function loadGitState(repoRoot, expectedBranch, options, runCommand) {
  const branch = trimmedOutput(runGit(['branch', '--show-current'], repoRoot, runCommand).stdout) || '(detached)';
  const head = trimmedOutput(runGit(['rev-parse', 'HEAD'], repoRoot, runCommand).stdout);
  const status = parseStatusPorcelain(runGit(['status', '--porcelain=v1'], repoRoot, runCommand).stdout);
  const remoteBranch = options.remoteBranch || expectedBranch || (branch !== '(detached)' ? branch : '');
  const remoteHeadResult = remoteBranch && remoteBranch !== '(detached)'
    ? runGit(['rev-parse', `origin/${remoteBranch}`], repoRoot, runCommand)
    : { ok: false, stdout: '' };
  const upstreamResult = runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], repoRoot, runCommand);
  const remoteHead = trimmedOutput(remoteHeadResult.stdout);
  const detached_allowed = Boolean(options.allowDetached && branch === '(detached)' && remoteBranch);
  return {
    branch,
    expected_branch: expectedBranch || null,
    allow_detached: Boolean(options.allowDetached),
    detached_allowed,
    branch_matches_expected: expectedBranch ? (branch === expectedBranch || detached_allowed) : true,
    head,
    upstream: upstreamResult.ok ? trimmedOutput(upstreamResult.stdout) : '',
    remote_branch: remoteBranch ? `origin/${remoteBranch}` : '',
    remote_head: remoteHeadResult.ok ? remoteHead : '',
    head_pushed: Boolean(head && remoteHeadResult.ok && remoteHead === head),
    dirty: status,
  };
}

function approved(value) {
  return /^(?:1|true|yes|approved)$/i.test(String(value || '').trim());
}

function commandPlan() {
  return [
    'npm test',
    'npm run bna:run:validate',
    'npm run production:readiness:gate -- --json',
    'npm run bna:run:source-coverage',
    'npm run bna:run:stale-evidence',
    'npm run watchdog:actions',
    'npm run watchdog:security',
    'npm run watchdog:raw',
    'node scripts/audit-secrets.mjs',
    'git diff --check',
    `npm run bna:external-readback-gate -- --readback --all --confirm-readback ${READBACK_CONFIRM_PHRASE}`,
    `npm run bna:external-readback-gate -- --backfill-apply --database --job-range 64-74 --confirm-readback ${READBACK_CONFIRM_PHRASE} --confirm-backfill ${BACKFILL_CONFIRM_PHRASE}`,
    `npm run bna:release-gate -- --deploy --confirm-deploy ${DEPLOY_CONFIRM_PHRASE}`,
    `npm run bna:release-gate -- --deploy --confirm-deploy ${DEPLOY_CONFIRM_PHRASE} --defer-optional-integrations --defer-external-readback`,
    `npm run bna:release-gate -- --live-verify --confirm-live ${LIVE_VERIFY_CONFIRM_PHRASE}`,
  ];
}

function parseJsonObject(text = '') {
  const start = String(text || '').indexOf('{');
  const end = String(text || '').lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('No JSON object found.');
  return JSON.parse(String(text).slice(start, end + 1));
}

function buildProductionReadinessGateSummary(repoRoot, runCommand) {
  const result = runCommand(process.execPath, ['scripts/production-readiness-gate.mjs', '--json'], {
    cwd: repoRoot,
    maxBuffer: 1024 * 1024 * 8,
  });
  try {
    const parsed = parseJsonObject(result.stdout || result.stderr || '');
    return {
      ok: parsed.ok === true,
      status: parsed.status || 'unknown',
      blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      snapshot_summary: parsed.snapshot_summary || {},
      operator_unblocker: parsed.operator_unblocker || null,
      next_actions: Array.isArray(parsed.next_actions) ? parsed.next_actions : [],
      production_mutation_performed: false,
      external_write_performed: false,
    };
  } catch (error) {
    return {
      ok: false,
      status: 'failed',
      blockers: [`Production readiness gate could not be parsed: ${error.message}`],
      warnings: [],
      snapshot_summary: {},
      operator_unblocker: null,
      next_actions: [],
      production_mutation_performed: false,
      external_write_performed: false,
    };
  }
}

function productionReadinessGateBlockers(report = {}) {
  if (report.ok === true) return [];
  const blockers = Array.isArray(report.blockers) && report.blockers.length
    ? report.blockers
    : [`Production readiness gate status is ${report.status || 'unknown'}.`];
  return blockers.map((blocker) => `Production readiness gate blocked: ${blocker}`);
}

export async function buildProductionCloseoutGateReport(options = {}, context = {}) {
  const repoRoot = path.resolve(options.repoRoot || context.repoRoot || DEFAULT_REPO_ROOT);
  const runCommand = context.runCommand || defaultRunCommand;
  const env = context.env || process.env;
  const run = loadRunState(repoRoot, options);
  const expectedBranch = options.expectedBranch || run.expected_branch || null;
  const git = loadGitState(repoRoot, expectedBranch, options, runCommand);
  const scripts = loadPackageScripts(repoRoot);
  const missingScripts = REQUIRED_PACKAGE_SCRIPTS.filter((name) => !scripts[name]);
  const integrationReadiness = context.integrationReadiness || buildIntegrationReadinessSummary({ repoRoot });
  const deployApproved = approved(env[DEPLOY_APPROVAL_ENV]);
  const optionalIntegrationsDeferred = Boolean(options.deferOptionalIntegrations && options.deploy && deployApproved);
  const externalReadbackDeferred = Boolean(options.deferExternalReadback && options.deploy && deployApproved);
  const integrationBlockers = integrationReadinessBlockers(integrationReadiness);
  const externalReadbackGate = summarizeExternalReadbackGateReport(
    context.externalReadbackGate || buildExternalReadbackGateReport({}, {
      repoRoot,
      env,
      loadSecretFn: context.loadSecretFn,
    }),
  );
  const externalReadbackBlockers = externalReadbackGateBlockers(externalReadbackGate);
  const requiresProductionReadinessGate = Boolean(options.deploy || options.liveVerify || options.finalCloseout);
  const productionReadinessGate = context.productionReadinessGate
    || (requiresProductionReadinessGate
      ? buildProductionReadinessGateSummary(repoRoot, runCommand)
      : {
          ok: null,
          status: 'not_required_for_dry_run',
          blockers: [],
          warnings: [],
          snapshot_summary: {},
          production_mutation_performed: false,
          external_write_performed: false,
        });
  const productionReadinessBlockers = requiresProductionReadinessGate
    ? productionReadinessGateBlockers(productionReadinessGate)
    : [];
  const blockers = [];

  if (git.branch === '(detached)' && !options.allowDetached) {
    blockers.push('Current checkout is detached; pass --allow-detached with --remote-branch only for a clean release-candidate checkout.');
  }
  if (options.allowDetached && git.branch === '(detached)' && !options.remoteBranch) {
    blockers.push('Detached release-candidate validation requires --remote-branch.');
  }
  if (!git.branch_matches_expected) {
    blockers.push(`Current branch ${git.branch} does not match expected branch ${expectedBranch}.`);
  }
  if (!git.head_pushed) {
    blockers.push(`Current HEAD is not confirmed pushed to ${git.remote_branch || 'the expected remote branch'}.`);
  }
  if (git.dirty.total > 0) {
    blockers.push('Working tree has dirty or untracked files; do not deploy from a mixed dirty worktree.');
  }
  if (missingScripts.length) {
    blockers.push(`Missing required package scripts: ${missingScripts.join(', ')}.`);
  }
  if (!run.run_id) {
    blockers.push('Active execution run metadata could not be read.');
  }
  if (options.deploy) {
    if (options.confirmDeploy !== DEPLOY_CONFIRM_PHRASE) {
      blockers.push(`Missing deploy confirmation phrase: --confirm-deploy ${DEPLOY_CONFIRM_PHRASE}`);
    }
    if (!approved(env[DEPLOY_APPROVAL_ENV])) {
      blockers.push(`${DEPLOY_APPROVAL_ENV}=approved is required before deploy closeout.`);
    }
    if (!optionalIntegrationsDeferred) blockers.push(...integrationBlockers);
    if (!externalReadbackDeferred) blockers.push(...externalReadbackBlockers);
    blockers.push(...productionReadinessBlockers);
  }
  if (options.liveVerify) {
    if (options.confirmLive !== LIVE_VERIFY_CONFIRM_PHRASE) {
      blockers.push(`Missing live verification confirmation phrase: --confirm-live ${LIVE_VERIFY_CONFIRM_PHRASE}`);
    }
    if (!approved(env[LIVE_VERIFY_APPROVAL_ENV])) {
      blockers.push(`${LIVE_VERIFY_APPROVAL_ENV}=approved is required before live verification closeout.`);
    }
    blockers.push(...integrationBlockers);
    blockers.push(...externalReadbackBlockers);
    blockers.push(...productionReadinessBlockers);
  }
  if (options.finalCloseout && run.open_requirements.length) {
    blockers.push(`Final closeout still has open requirements: ${run.open_requirements.map((item) => item.id).join(', ')}.`);
  }
  if (options.finalCloseout) {
    blockers.push(...integrationBlockers);
    blockers.push(...externalReadbackBlockers);
    blockers.push(...productionReadinessBlockers);
  }

  return {
    ok: blockers.length === 0,
    mode: options.deploy ? 'deploy_gate' : options.liveVerify ? 'live_verify_gate' : options.finalCloseout ? 'final_closeout_gate' : 'dry_run',
    generated_at: new Date().toISOString(),
    production_mutation_performed: false,
    deploy_performed: false,
    live_verification_performed: false,
    secrets_redacted: true,
    blockers,
    git,
    run,
    external_readback_gate: externalReadbackGate,
    production_readiness_gate: productionReadinessGate,
    integration_readiness: integrationReadiness,
    deferred_readiness: {
      integration: optionalIntegrationsDeferred ? integrationBlockers : [],
      external_readback: externalReadbackDeferred ? externalReadbackBlockers : [],
    },
    package_scripts: {
      required: REQUIRED_PACKAGE_SCRIPTS,
      missing: missingScripts,
    },
    approval_gates: {
      deploy: {
        requested: Boolean(options.deploy),
        confirmation_phrase: DEPLOY_CONFIRM_PHRASE,
        approval_env: DEPLOY_APPROVAL_ENV,
        approved: approved(env[DEPLOY_APPROVAL_ENV]),
      },
      live_verify: {
        requested: Boolean(options.liveVerify),
        confirmation_phrase: LIVE_VERIFY_CONFIRM_PHRASE,
        approval_env: LIVE_VERIFY_APPROVAL_ENV,
        approved: approved(env[LIVE_VERIFY_APPROVAL_ENV]),
      },
      defer_optional_integrations: {
        requested: Boolean(options.deferOptionalIntegrations),
        approval_env: DEPLOY_APPROVAL_ENV,
        legacy_approval_env: DEFER_OPTIONAL_INTEGRATIONS_ENV,
        approved: deployApproved,
        performed: optionalIntegrationsDeferred,
      },
      defer_external_readback: {
        requested: Boolean(options.deferExternalReadback),
        approval_env: DEPLOY_APPROVAL_ENV,
        legacy_approval_env: DEFER_EXTERNAL_READBACK_ENV,
        approved: deployApproved,
        performed: externalReadbackDeferred,
      },
    },
    next_command_plan: commandPlan(),
  };
}

function printReport(report, options = {}) {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  console.log(`BNA production closeout gate: ${report.ok ? 'ready' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Branch: ${report.git.branch}`);
  console.log(`HEAD pushed: ${report.git.head_pushed ? 'yes' : 'no'}`);
  console.log(`Dirty files: ${report.git.dirty.total}`);
  console.log(`Production mutation performed: ${report.production_mutation_performed ? 'yes' : 'no'}`);
  for (const blocker of report.blockers) console.log(`Blocked: ${blocker}`);
  for (const finding of report.deferred_readiness?.integration || []) console.log(`Deferred integration readiness: ${finding}`);
  for (const finding of report.deferred_readiness?.external_readback || []) console.log(`Deferred external readback: ${finding}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const report = await buildProductionCloseoutGateReport(options);
  printReport(report, options);
  if (!report.ok) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      mode: 'error',
      production_mutation_performed: false,
      error: error.message,
    }, null, 2));
    process.exit(1);
  });
}
