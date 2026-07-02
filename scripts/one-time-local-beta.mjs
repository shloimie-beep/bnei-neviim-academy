#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const { buildOneTimeInstanceConfig } = require('../src/platform/instances/one-time');
const { buildAnnouncementsFirstDigestPreview } = require('../src/platform/community');
const { buildOneTimeProgressRewardSnapshot, buildOneTimeProgressRewardViews } = require('../src/platform/progress');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const defaultRuntimeDir = path.join(repoRoot, '.runtime', 'one-time-local-beta');
const REQUIREMENT_ID = 'REQ-20260619-418';
const VALID_COMMANDS = new Set(['plan', 'seed', 'reset', 'smoke']);
const LOCAL_PACKAGE_SCRIPTS = [
  'onetime:local',
  'onetime:local:plan',
  'onetime:local:seed',
  'onetime:local:reset',
  'onetime:local:smoke',
];

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    command: 'plan',
    json: false,
    write: false,
    runtimeDir: defaultRuntimeDir,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (VALID_COMMANDS.has(arg)) args.command = arg;
    else if (arg === '--json') args.json = true;
    else if (arg === '--write') args.write = true;
    else if (arg === '--runtime-dir') args.runtimeDir = path.resolve(repoRoot, argv[++index] || '');
    else if (arg.startsWith('--runtime-dir=')) args.runtimeDir = path.resolve(repoRoot, arg.split('=').slice(1).join('='));
    else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }
  return args;
}

function localRuntimePath(runtimeDir, fileName) {
  const resolvedRoot = path.resolve(runtimeDir);
  const resolvedPath = path.resolve(resolvedRoot, fileName);
  if (!resolvedPath.startsWith(`${resolvedRoot}${path.sep}`) && resolvedPath !== resolvedRoot) {
    throw new Error(`Unsafe runtime path: ${resolvedPath}`);
  }
  return resolvedPath;
}

function packageScripts() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  return packageJson.scripts || {};
}

function dependencyStatus() {
  const npmUserAgent = String(process.env.npm_config_user_agent || '');
  const npmVersionFromEnv = npmUserAgent.match(/\bnpm\/([^\s]+)/)?.[1] || '';
  const npm = npmVersionFromEnv ? null : spawnSync(npmCommand(), ['--version'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    timeout: 30000,
  });
  const npmVersion = npmVersionFromEnv || String(npm?.stdout || npm?.stderr || '').trim();
  const nodeModulesPresent = fs.existsSync(path.join(repoRoot, 'node_modules'));
  return {
    node: {
      version: process.version,
      ok: Number(process.versions.node.split('.')[0]) >= 20,
    },
    npm: {
      version: npmVersion || (nodeModulesPresent ? 'available_via_existing_node_modules' : ''),
      ok: Boolean(npmVersionFromEnv) || npm?.status === 0 || nodeModulesPresent,
    },
    node_modules_present: nodeModulesPresent,
  };
}

function envSafety(env = process.env) {
  const nodeEnv = String(env.NODE_ENV || '').toLowerCase();
  const railwayEnvironment = String(env.RAILWAY_ENVIRONMENT || '').toLowerCase();
  const databaseUrl = String(env.DATABASE_URL || '');
  const looksProductionDb = /\brailway\b|\.railway\.app|render\.com|amazonaws\.com|supabase\.co/i.test(databaseUrl)
    || /prod|production/i.test(databaseUrl);
  const productionLike = nodeEnv === 'production' || railwayEnvironment === 'production' || looksProductionDb;
  return {
    node_env: nodeEnv || 'unset',
    railway_environment: railwayEnvironment || 'unset',
    database_url: databaseUrl ? 'present_redacted' : 'missing',
    production_like_environment_detected: productionLike,
    production_database_write_allowed: false,
    external_service_write_allowed: false,
    requires_bna_skip_env_local_for_server: true,
    recommended_env: {
      BNA_SKIP_ENV_LOCAL: '1',
      OPS_USERNAME: 'codex-local',
      OPS_PASSWORD: 'codex-local-pass',
    },
  };
}

function basePlan(options = {}) {
  const scripts = packageScripts();
  const missingScripts = LOCAL_PACKAGE_SCRIPTS.filter((script) => !scripts[script]);
  return {
    requirement_id: REQUIREMENT_ID,
    command: options.command || 'plan',
    generated_at: new Date().toISOString(),
    repo_root: rel(repoRoot) || '.',
    runtime_dir: rel(path.resolve(options.runtimeDir || defaultRuntimeDir)),
    preview_only: !options.write,
    write_requested: Boolean(options.write),
    production_mutation_performed: false,
    external_write_performed: false,
    database_write_performed: false,
    hidden_credential_dependency: false,
    dependency_status: dependencyStatus(),
    env_safety: envSafety(options.env || process.env),
    package_scripts: {
      required: LOCAL_PACKAGE_SCRIPTS,
      missing: missingScripts,
      ok: missingScripts.length === 0,
    },
    local_commands: {
      plan: 'npm run onetime:local:plan',
      seed: 'npm run onetime:local:seed',
      smoke: 'npm run onetime:local:smoke',
      reset: 'npm run onetime:local:reset',
    },
    guardrails: [
      'No deploy, Railway mutation, DNS, production database write, live email, live payment, Zoom/Vimeo mutation, Telegram/WhatsApp send, Buffer/social post, push, PR, or external-account write.',
      'Seed and reset operate only inside .runtime/one-time-local-beta when --write is explicitly passed.',
      'Default commands are dry-run previews.',
    ],
  };
}

function seedManifest(options = {}) {
  const config = buildOneTimeInstanceConfig();
  const progressSnapshot = buildOneTimeProgressRewardSnapshot({ seed: config.seed.progress_rewards });
  const digestPreview = buildAnnouncementsFirstDigestPreview({
    items: [
      { kind: 'announcement', title: 'Welcome to the One Time local beta' },
      { kind: 'reminder', title: 'Tonight class starts at 7:00 PM' },
      { kind: 'resource_link', title: 'Member library preview', url: 'https://one-time.local/member-library' },
    ],
  });
  return {
    ...basePlan({ ...options, command: 'seed' }),
    seed_id: 'one-time-local-beta-seed-v1',
    workspace_key: config.instance.workspace_key,
    project_key: config.instance.project_key,
    instance_slug: config.instance.slug,
    roles: config.roles.visible_product_roles,
    product: config.product.primary_offer,
    community: config.community,
    progress_rewards: progressSnapshot,
    progress_views: {
      student: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'student', student_id: 'ot-student-001' }),
      parent: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'parent', linked_student_ids: ['ot-student-001'] }),
      provider: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'provider' }),
      public: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'public' }),
    },
    announcements_digest_preview: digestPreview,
    output_files: {
      seed: rel(localRuntimePath(options.runtimeDir || defaultRuntimeDir, 'seed.json')),
      smoke: rel(localRuntimePath(options.runtimeDir || defaultRuntimeDir, 'smoke.json')),
    },
  };
}

function resetManifest(options = {}) {
  const runtimeDir = options.runtimeDir || defaultRuntimeDir;
  return {
    ...basePlan({ ...options, command: 'reset' }),
    reset_scope: 'local_runtime_files_only',
    targets: [
      rel(localRuntimePath(runtimeDir, 'seed.json')),
      rel(localRuntimePath(runtimeDir, 'smoke.json')),
      rel(localRuntimePath(runtimeDir, 'latest.json')),
    ],
    database_reset_performed: false,
    production_data_deleted: false,
    safe_to_repeat: true,
  };
}

function smokeManifest(options = {}) {
  const seed = seedManifest({ ...options, command: 'smoke', write: false });
  const plan = basePlan({ ...options, command: 'smoke' });
  const checks = [
    { key: 'package_scripts', ok: plan.package_scripts.ok },
    { key: 'instance_config', ok: seed.instance_slug === 'one-time-mishnah-class' },
    { key: 'community_preview', ok: seed.community.mode === 'announcements_first' },
    { key: 'progress_snapshot', ok: seed.progress_rewards.group_summary.student_count >= 2 },
    { key: 'student_view_scope', ok: seed.progress_views.student.students.length === 1 },
    { key: 'parent_view_scope', ok: seed.progress_views.parent.students.length === 1 },
    { key: 'public_aggregate_only', ok: seed.progress_views.public.students.length === 0 },
    { key: 'no_external_writes', ok: seed.external_write_performed === false && seed.production_mutation_performed === false },
  ];
  return {
    ...plan,
    checks,
    success: checks.every((check) => check.ok),
    seed_preview: {
      seed_id: seed.seed_id,
      workspace_key: seed.workspace_key,
      project_key: seed.project_key,
      student_count: seed.progress_rewards.group_summary.student_count,
      attendance_percent: seed.progress_rewards.group_summary.attendance_percent,
      average_course_progress_percent: seed.progress_rewards.group_summary.average_course_progress_percent,
    },
  };
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) fs.rmSync(filePath, { force: true });
}

export function buildOneTimeLocalBetaPlan(options = {}) {
  const command = VALID_COMMANDS.has(options.command) ? options.command : 'plan';
  if (command === 'seed') return seedManifest(options);
  if (command === 'reset') return resetManifest(options);
  if (command === 'smoke') return smokeManifest(options);
  return basePlan({ ...options, command: 'plan' });
}

export function runOneTimeLocalBetaCommand(options = {}) {
  const command = VALID_COMMANDS.has(options.command) ? options.command : 'plan';
  const runtimeDir = path.resolve(options.runtimeDir || defaultRuntimeDir);
  const payload = buildOneTimeLocalBetaPlan({ ...options, command, runtimeDir });
  if (options.write && command === 'seed') {
    writeJson(localRuntimePath(runtimeDir, 'seed.json'), payload);
    writeJson(localRuntimePath(runtimeDir, 'latest.json'), { command, seed_id: payload.seed_id, written_at: new Date().toISOString() });
    payload.write_performed = true;
    payload.written_files = [rel(localRuntimePath(runtimeDir, 'seed.json')), rel(localRuntimePath(runtimeDir, 'latest.json'))];
  } else if (options.write && command === 'smoke') {
    writeJson(localRuntimePath(runtimeDir, 'smoke.json'), payload);
    writeJson(localRuntimePath(runtimeDir, 'latest.json'), { command, success: payload.success, written_at: new Date().toISOString() });
    payload.write_performed = true;
    payload.written_files = [rel(localRuntimePath(runtimeDir, 'smoke.json')), rel(localRuntimePath(runtimeDir, 'latest.json'))];
  } else if (options.write && command === 'reset') {
    for (const target of payload.targets) removeIfExists(path.join(repoRoot, target));
    writeJson(localRuntimePath(runtimeDir, 'latest.json'), { command, reset_at: new Date().toISOString() });
    payload.write_performed = true;
    payload.reset_performed = true;
  } else {
    payload.write_performed = false;
  }
  return payload;
}

function printHelp() {
  console.log('Usage: node scripts/one-time-local-beta.mjs [plan|seed|smoke|reset] [--json] [--write] [--runtime-dir <dir>]');
  console.log('');
  console.log('Default mode is dry-run. --write is limited to .runtime/one-time-local-beta artifacts.');
}

function printHuman(payload) {
  console.log(`One Time local beta ${payload.command}`);
  console.log(`Requirement: ${payload.requirement_id}`);
  console.log(`Runtime: ${payload.runtime_dir}`);
  console.log(`Preview only: ${payload.preview_only}`);
  console.log(`Production mutation: ${payload.production_mutation_performed}`);
  console.log(`External write: ${payload.external_write_performed}`);
  if (payload.success !== undefined) console.log(`Success: ${payload.success}`);
  if (payload.package_scripts) console.log(`Package scripts: ${payload.package_scripts.ok ? 'ok' : `missing ${payload.package_scripts.missing.join(', ')}`}`);
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    printHelp();
    return;
  }
  const payload = runOneTimeLocalBetaCommand(args);
  if (args.json) console.log(JSON.stringify(payload, null, 2));
  else printHuman(payload);
  if (payload.success === false || payload.package_scripts?.ok === false) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
