#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildExternalReadbackGateReport } from './bna-external-readback-gate.mjs';

const require = createRequire(import.meta.url);
const { loadSecret, safeSecretSourceLabel } = require('../src/lib/integrations/secret-loader');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const KNOWN_ASSET_TERMS = [
  'OneTimeOneTime',
  'Rabbi Eli Scheller',
  'onetimelogo',
  'onetime hero vertical',
  'Promo Website',
  'Vimeo hero',
  'teaching still',
  'TorahAnytime',
  '24Six',
  'The Loop',
  'Mishpacha',
  'Naki',
  'contact sheet'
];

const READINESS_FIELDS = [
  ['DATABASE_URL', ['railway-database-url.txt', 'DATABASE_URL.txt']],
  ['RAILWAY_TOKEN', ['railway-token.txt', 'RAILWAY_TOKEN.txt']],
  ['OPENAI_API_KEY', ['openai-api-key.txt', 'OPENAI_API_KEY.txt']],
  ['VIMEO_CLIENT_ID', ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'vimeo.txt']],
  ['VIMEO_CLIENT_SECRET', ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'vimeo.txt']],
  ['VIMEO_ACCESS_TOKEN', ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt']],
  ['RESEND_API_KEY', ['resend-api-key.txt', 'RESEND_API_KEY.txt', 'resend.txt']],
  ['RESEND_FROM', ['resend-from.txt', 'RESEND_FROM.txt', 'resend.txt']],
  ['RESEND_FROM_EMAIL', ['resend-from-email.txt', 'RESEND_FROM_EMAIL.txt', 'resend.txt']],
  ['RESEND_DOMAIN', ['resend-domain.txt', 'RESEND_DOMAIN.txt', 'resend.txt']],
  ['RESEND_WEBHOOK_SECRET', ['resend-webhook-secret.txt', 'RESEND_WEBHOOK_SECRET.txt']],
  ['STRIPE_SECRET_KEY', ['stripe-secret-key.txt', 'STRIPE_SECRET_KEY.txt', 'stripe.txt']],
  ['RABBI_STRIPE_SECRET_KEY', ['rabbi-stripe-secret-key.txt', 'RABBI_STRIPE_SECRET_KEY.txt', 'stripe.txt']],
  ['RABBI_STRIPE_MODE', ['rabbi-stripe-mode.txt', 'RABBI_STRIPE_MODE.txt', 'stripe-mode.txt']],
  ['TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER', ['telegram-rabbi-elie-scheller-bot-token.txt', 'TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER.txt']]
];

function nowIso() {
  return new Date().toISOString();
}

function slugStamp() {
  return nowIso().replace(/[:.]/g, '-');
}

function dateStamp() {
  return nowIso().slice(0, 10);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(target, root = repoRoot) {
  return path.relative(root, target).replaceAll(path.sep, '/');
}

export function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: options.env || process.env,
    encoding: 'utf8',
    maxBuffer: options.maxBuffer || 1024 * 1024 * 16,
    shell: false
  });
  return {
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error ? String(result.error.message || result.error) : ''
  };
}

function runGit(args, cwd = repoRoot) {
  return run('git', args, { cwd });
}

function trimmedOutput(value) {
  return String(value || '').trim();
}

function parseStatusPorcelain(text = '') {
  const lines = String(text || '').split(/\r?\n/).filter(Boolean);
  const files = lines.map((line) => ({
    status: line.slice(0, 2),
    path: line.slice(2).trimStart()
  }));
  return {
    staged: files.filter((file) => file.status[0] !== ' ' && file.status[0] !== '?').length,
    modified: files.filter((file) => file.status[1] !== ' ' && file.status[0] !== '?').length,
    untracked: files.filter((file) => file.status === '??').length,
    total: files.length,
    sample: files.slice(0, 60)
  };
}

function gitIdentity(root = repoRoot) {
  const status = runGit(['status', '--porcelain=v1'], root);
  const branch = trimmedOutput(runGit(['branch', '--show-current'], root).stdout) || '(detached)';
  const head = trimmedOutput(runGit(['rev-parse', 'HEAD'], root).stdout);
  const upstream = runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], root);
  const upstreamName = upstream.ok ? trimmedOutput(upstream.stdout) : '';
  const upstreamHead = upstreamName ? trimmedOutput(runGit(['rev-parse', '@{u}'], root).stdout) : '';
  const originMaster = trimmedOutput(runGit(['rev-parse', 'origin/master'], root).stdout);
  const remote = runGit(['remote', '-v'], root).stdout.split(/\r?\n/).map(trimmedOutput).filter(Boolean);
  const aheadBehind = upstreamName
    ? trimmedOutput(runGit(['rev-list', '--left-right', '--count', `${upstreamName}...HEAD`], root).stdout)
    : '';
  const [behind = '', ahead = ''] = aheadBehind.split(/\s+/);
  return {
    path: root,
    branch,
    head,
    upstream: upstreamName,
    upstream_head: upstreamHead,
    origin_master: originMaster,
    ahead: Number(ahead || 0),
    behind: Number(behind || 0),
    dirty: parseStatusPorcelain(status.stdout),
    remote
  };
}

function parseWorktrees(text = '') {
  const entries = [];
  let current = null;
  for (const line of String(text || '').split(/\r?\n/)) {
    if (!line.trim()) {
      if (current) entries.push(current);
      current = null;
      continue;
    }
    const [key, ...rest] = line.split(' ');
    const value = rest.join(' ');
    if (key === 'worktree') current = { path: value };
    else if (current && key === 'HEAD') current.head = value;
    else if (current && key === 'branch') current.branch = value.replace(/^refs\/heads\//, '');
    else if (current && key === 'detached') current.detached = true;
  }
  if (current) entries.push(current);
  return entries;
}

function classifyWorktree(entry, identity) {
  const normalizedPath = String(entry.path || '').replaceAll('\\', '/').toLowerCase();
  if (normalizedPath.includes('/goal-c-users-user-downloads-bna/work/bna-reconciliation')) {
    return 'active_owned';
  }
  if (identity.dirty.total > 0) {
    if (normalizedPath.includes('goal-c-users-user-downloads-codex/work/bna-active')) {
      return 'dirty_required';
    }
    return 'dirty_unknown';
  }
  if (entry.detached || entry.branch === '(detached)') {
    return normalizedPath.includes('deploy') || normalizedPath.includes('temp')
      ? 'safety_snapshot'
      : 'clean_stale';
  }
  if (identity.head && identity.origin_master && identity.head === identity.origin_master) {
    return 'clean_current';
  }
  if (identity.upstream && identity.behind === 0 && identity.ahead === 0) {
    return 'clean_current';
  }
  return 'clean_stale';
}

function worktreeReport() {
  const listed = parseWorktrees(runGit(['worktree', 'list', '--porcelain']).stdout);
  const worktrees = listed.map((entry) => {
    const identity = fs.existsSync(entry.path) ? gitIdentity(entry.path) : null;
    return {
      path: entry.path,
      branch: entry.branch || '(detached)',
      head: entry.head || identity?.head || '',
      upstream: identity?.upstream || '',
      ahead: identity?.ahead || 0,
      behind: identity?.behind || 0,
      dirty: identity?.dirty || { staged: 0, modified: 0, untracked: 0, total: 0, sample: [] },
      state: identity ? classifyWorktree(entry, identity) : 'unknown',
      recovery_action: identity?.dirty?.total
        ? 'review file-level diff before porting; do not stage all'
        : 'retain until owner confirms cleanup'
    };
  });
  return {
    generated_at: nowIso(),
    repo: gitIdentity(repoRoot),
    worktrees,
    cleanup_rules: [
      'No automatic deletion was performed.',
      'Remove only clean merged stale worktrees after confirming no active process owns them.',
      'Port required dirty work into a clean branch before archiving the old worktree.'
    ]
  };
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readTextSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function currentRunState() {
  const latestPath = path.join(repoRoot, 'ops', 'execution-runs', 'latest.json');
  const latest = readJsonSafe(latestPath);
  const runDir = latest?.path ? path.resolve(repoRoot, latest.path) : null;
  const requirementsDoc = runDir ? readJsonSafe(path.join(runDir, 'requirements.json')) : null;
  const runDoc = runDir ? readJsonSafe(path.join(runDir, 'run.json')) : null;
  return { latest, runDir, requirementsDoc, runDoc };
}

async function sourceReport() {
  const { latest, runDir, requirementsDoc } = currentRunState();
  const { validateExecutionRun } = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'bna-execution-run.mjs')).href);
  const validation = validateExecutionRun(repoRoot);
  const rawInputDir = path.join(repoRoot, 'raw-input');
  const taskPendingDir = path.join(repoRoot, 'tasks-pending');
  const rawInputs = fs.existsSync(rawInputDir) ? fs.readdirSync(rawInputDir).filter((name) => name.endsWith('.md')) : [];
  const pending = fs.existsSync(taskPendingDir) ? fs.readdirSync(taskPendingDir).filter((name) => name.endsWith('.md')) : [];
  const statements = Array.isArray(requirementsDoc?.source_statements)
    ? requirementsDoc.source_statements
    : [];
  const unmapped = statements.filter((statement) => {
    const classification = String(statement.classification || '').toLowerCase();
    return !statement.requirement_id &&
      !statement.existing_requirement_id &&
      !['excluded', 'unrelated', 'non_requirement', 'context_only', 'duplicate', 'archived'].includes(classification);
  });
  return {
    generated_at: nowIso(),
    latest,
    active_run: runDir ? rel(runDir) : null,
    validation: {
      errors: validation.errors,
      warnings: validation.warnings,
      counts: validation.counts,
      work_remains: validation.workRemains
    },
    source_statements: {
      total: statements.length,
      unmapped_executable: unmapped.length
    },
    raw_input_files: rawInputs.length,
    task_pending_files: pending.length,
    issue_sources_present: {
      issue_7: rawInputs.some((name) => name.includes('github-issue-7')),
      issue_8: rawInputs.some((name) => name.includes('github-issue-8'))
    }
  };
}

function listFiles(root, options = {}) {
  const maxFiles = options.maxFiles || 12000;
  const ignored = new Set(['.git', 'node_modules', '.runtime', '.deploy-railway']);
  const files = [];
  function walk(dir) {
    if (files.length >= maxFiles) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (files.length >= maxFiles) return;
      if (ignored.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  walk(root);
  return files;
}

function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function assetReport() {
  const files = listFiles(repoRoot, { maxFiles: 20000 });
  const lowerTerms = KNOWN_ASSET_TERMS.map((term) => term.toLowerCase());
  const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.mov', '.webm', '.svg']);
  const matches = [];
  for (const filePath of files) {
    const normalized = rel(filePath).toLowerCase();
    const extension = path.extname(filePath).toLowerCase();
    const term = lowerTerms.find((item) => normalized.includes(item));
    if (!term && !mediaExtensions.has(extension)) continue;
    if (term || normalized.includes('onetime') || normalized.includes('one-time')) {
      const stat = fs.statSync(filePath);
      matches.push({
        path: rel(filePath),
        bytes: stat.size,
        sha256: stat.size <= 30 * 1024 * 1024 ? hashFile(filePath) : null,
        matched_term: term || 'one-time-media-name',
        repo_usage_hint: normalized.startsWith('public/') ? 'public_asset_candidate' : 'evidence_or_source_candidate'
      });
    }
  }
  return {
    generated_at: nowIso(),
    privacy: 'repo scan only; Drive source and render proof require connector/live readback',
    known_targets: KNOWN_ASSET_TERMS,
    matches: matches.slice(0, 300),
    limitations: [
      'A matching file does not prove the asset is rendered live.',
      'Drive source IDs and permissions are not proven by this repo-only command.'
    ]
  };
}

function driveIntakeReport() {
  const auditDir = path.join(repoRoot, 'ops', 'drive-audits');
  const files = fs.existsSync(auditDir)
    ? fs.readdirSync(auditDir).filter((name) => /\.(md|json)$/i.test(name)).sort()
    : [];
  const jobIds = Array.from({ length: 16 }, (_, index) => 64 + index);
  const jobEvidence = Object.fromEntries(jobIds.map((id) => [String(id), []]));
  for (const name of files) {
    const full = path.join(auditDir, name);
    let text = '';
    try {
      text = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    for (const id of jobIds) {
      if (new RegExp(`\\b(?:job|content job|content_job_id|id)\\s*[:#-]?\\s*${id}\\b`, 'i').test(text) || new RegExp(`\\b${id}\\b`).test(text)) {
        jobEvidence[String(id)].push(rel(full));
      }
    }
  }
  return {
    generated_at: nowIso(),
    scope: 'repo evidence scan for Drive/class intake; no production DB mutation',
    audit_files: files.length,
    jobs: Object.fromEntries(Object.entries(jobEvidence).map(([id, evidence]) => [
      id,
      {
        evidence_files: [...new Set(evidence)].slice(-8),
        repo_evidence_found: evidence.length > 0,
        live_database_verified: false,
        safe_apply_performed: false
      }
    ])),
    blockers: [
      'Live database readback requires DATABASE_URL or approved read-only connection.',
      'Guarded older-job backfill apply requires explicit production gate after dry-run review.'
    ]
  };
}

function uiSourceCoverageReport() {
  const routeRegistry = readJsonSafe(path.join(repoRoot, 'ops', 'route-registry.json')) || [];
  const actionRegistry = readJsonSafe(path.join(repoRoot, 'ops', 'action-registry.json')) || [];
  const routeRows = Array.isArray(routeRegistry) ? routeRegistry : Object.values(routeRegistry).flat();
  const actionRows = Array.isArray(actionRegistry) ? actionRegistry : Object.values(actionRegistry).flat();
  const routeNeedles = [
    '/operations',
    '/one-time',
    '/provider.html',
    '/parent.html',
    '/student.html',
    '/one-time-classroom.html',
    '/one-time-email-review.html'
  ];
  const screenshots = listFiles(path.join(repoRoot, 'ops'), { maxFiles: 12000 })
    .filter((filePath) => /\.(png|jpg|jpeg|webp)$/i.test(filePath))
    .filter((filePath) => /playwright-smokes|ui-audits|live-smokes/i.test(filePath))
    .map((filePath) => rel(filePath));
  return {
    generated_at: nowIso(),
    routes: routeNeedles.map((needle) => ({
      route: needle,
      registry_rows: routeRows.filter((row) => JSON.stringify(row).includes(needle)).length,
      action_rows: actionRows.filter((row) => JSON.stringify(row).includes(needle)).length,
      screenshot_evidence_count: screenshots.filter((item) => item.toLowerCase().includes(needle.replace(/[^a-z0-9]+/gi, '').toLowerCase())).length
    })),
    totals: {
      route_rows: routeRows.length,
      action_rows: actionRows.length,
      screenshot_files: screenshots.length
    },
    limitations: [
      'Registry coverage is not live behavior proof.',
      'Screenshots are stale unless tied to current branch, deployed commit, and route smoke metadata.'
    ]
  };
}

function readinessReport() {
  const fields = READINESS_FIELDS.map(([key, fileNames]) => {
    const loaded = loadSecret({ envName: key, fileNames, repoRoot });
    return {
      key,
      configured: Boolean(loaded.configured),
      source: loaded.configured ? safeSecretSourceLabel(loaded) : 'not configured'
    };
  });
  const railwayStatus = run(process.platform === 'win32' ? 'cmd.exe' : 'railway', process.platform === 'win32' ? ['/d', '/s', '/c', 'railway.cmd', 'status'] : ['status']);
  return {
    generated_at: nowIso(),
    variable_state_only: true,
    fields,
    railway_status: {
      attempted: true,
      ok: railwayStatus.ok,
      stdout: trimmedOutput(railwayStatus.stdout),
      stderr_first_line: railwayStatus.stderr.split(/\r?\n/).map(trimmedOutput).find(Boolean) || ''
    }
  };
}

async function systemReport() {
  const source = await sourceReport();
  return {
    generated_at: nowIso(),
    repo: gitIdentity(repoRoot),
    source,
    readiness: readinessReport(),
    deployment: {
      railway_json_present: fs.existsSync(path.join(repoRoot, 'railway.json')),
      live_smoke_files: fs.existsSync(path.join(repoRoot, 'ops', 'live-smokes'))
        ? fs.readdirSync(path.join(repoRoot, 'ops', 'live-smokes')).filter((name) => /\.(md|json)$/i.test(name)).sort().slice(-12)
        : []
    },
    required_scripts: requiredScriptsStatus()
  };
}

function requiredScriptsStatus() {
  const pkg = readJsonSafe(path.join(repoRoot, 'package.json')) || {};
  const scripts = pkg.scripts || {};
  const required = [
    'system:truth',
    'worktree:truth',
    'source:truth',
    'asset:truth',
    'drive:intake:truth',
    'ui:source-coverage',
    'intake:github',
    'bna:return-packet'
  ];
  return Object.fromEntries(required.map((name) => [name, Boolean(scripts[name])]));
}

function countRequirementsByStatus(requirements = []) {
  const counts = {};
  for (const requirement of requirements) {
    const status = requirement.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

function summarizeRequirements(requirements = []) {
  return requirements.map((requirement) => ({
    id: requirement.id,
    title: requirement.title,
    status: requirement.status,
    implementation_status: requirement.implementation_status,
    batch_id: requirement.batch_id,
    category: requirement.category,
    depends_on: Array.isArray(requirement.depends_on) ? requirement.depends_on : [],
    deployment_required: Boolean(requirement.deployment_required),
    can_continue_without_operator: Boolean(requirement.can_continue_without_operator),
    blocker: requirement.blocker || '',
    blocker_owner: requirement.blocker_owner || '',
    blocker_next_action: requirement.blocker_next_action || '',
    next_action: requirement.next_action || '',
    evidence: Array.isArray(requirement.evidence) ? requirement.evidence.slice(0, 12) : [],
    verification_count: Array.isArray(requirement.verification) ? requirement.verification.length : 0
  }));
}

const RETURN_PACKET_CLOSED_STATUSES = new Set([
  'done',
  'already_satisfied',
  'verified',
  'failed',
  'archived',
  'superseded'
]);

const RETURN_PACKET_WORK_REMAINS_STATUSES = new Set([
  'not_started',
  'in_progress',
  'needs_verification',
  'blocked',
  'needs_operator_decision'
]);

const RETURN_PACKET_BLOCKER_STATUSES = new Set(['blocked', 'needs_operator_decision']);

function dependenciesClosedForPacket(requirement, requirementsById) {
  return (requirement.depends_on || []).every((dependencyId) => {
    const dependency = requirementsById.get(dependencyId);
    return dependency && RETURN_PACKET_CLOSED_STATUSES.has(dependency.status);
  });
}

function nextExecutableRequirement(requirements = []) {
  const requirementsById = new Map(
    requirements.filter((requirement) => requirement?.id).map((requirement) => [requirement.id, requirement])
  );
  return requirements.find((requirement) => {
    if (!requirement || !RETURN_PACKET_WORK_REMAINS_STATUSES.has(requirement.status)) {
      return false;
    }
    if (RETURN_PACKET_BLOCKER_STATUSES.has(requirement.status)) {
      return false;
    }
    if (requirement.can_continue_without_operator === false) {
      return false;
    }
    return dependenciesClosedForPacket(requirement, requirementsById);
  });
}

function summarizeLatestTests(runDir) {
  const testResults = runDir ? readTextSafe(path.join(runDir, 'TEST-RESULTS.md')) : '';
  const lines = testResults.split(/\r?\n/).filter(Boolean);
  return {
    path: runDir ? rel(path.join(runDir, 'TEST-RESULTS.md')) : '',
    latest_lines: lines.slice(0, 24),
    npm_test: lines.find((line) => /npm test/i.test(line)) || '',
    source_coverage: lines.find((line) => /bna:run:source-coverage/i.test(line)) || '',
    validation: lines.find((line) => /bna:run:validate/i.test(line)) || '',
    secret_audit: lines.find((line) => /audit-secrets/i.test(line)) || ''
  };
}

function validatedAgentWorkCommit(repo = {}, runDoc = {}) {
  const validatedHead = String(runDoc?.git_refs?.last_validated_head || '').trim();
  return validatedHead || repo.head || '';
}

function summarizeExternalGate(report = {}) {
  const readiness = Object.entries(report.readiness || {}).map(([scope, state]) => {
    const secrets = Array.isArray(state.secrets) ? state.secrets : [];
    const config = Array.isArray(state.config) ? state.config : [];
    return {
      scope,
      ready: Boolean(state.ready),
      secrets_configured: secrets.filter((item) => item.configured).length,
      secrets_required: secrets.length,
      config_configured: config.filter((item) => item.configured).length,
      config_required: config.length
    };
  });
  const approvalGates = report.approval_gates || {};
  return {
    ok: Boolean(report.ok),
    mode: report.mode || 'unknown',
    scopes: readiness,
    external_read_performed: Boolean(report.external_read_performed),
    production_mutation_performed: Boolean(report.production_mutation_performed),
    safe_apply_performed: Boolean(report.safe_apply_performed),
    deploy_performed: Boolean(report.deploy_performed),
    secrets_redacted: report.secrets_redacted !== false,
    blockers: Array.isArray(report.blockers) ? report.blockers : [],
    approval_gates: {
      readback: {
        requested: Boolean(approvalGates.readback?.requested),
        approved: Boolean(approvalGates.readback?.approved)
      },
      backfill_apply: {
        requested: Boolean(approvalGates.backfill_apply?.requested),
        approved: Boolean(approvalGates.backfill_apply?.approved)
      }
    },
    next_command_plan: Array.isArray(report.next_command_plan) ? report.next_command_plan : []
  };
}

async function returnPacketReport() {
  const { latest, runDir, requirementsDoc, runDoc } = currentRunState();
  const repo = gitIdentity(repoRoot);
  const source = await sourceReport();
  const worktree = worktreeReport();
  const drive = driveIntakeReport();
  const asset = assetReport();
  const ui = uiSourceCoverageReport();
  const externalGates = summarizeExternalGate(buildExternalReadbackGateReport());
  const requirements = Array.isArray(requirementsDoc?.requirements) ? requirementsDoc.requirements : [];
  const summarizedRequirements = summarizeRequirements(requirements);
  const blocked = summarizedRequirements.filter((item) => item.status === 'blocked' || item.can_continue_without_operator === false);
  const inProgress = summarizedRequirements.filter((item) => item.status === 'in_progress');
  const nextExecutable = nextExecutableRequirement(summarizedRequirements);
  const dirty = repo.dirty || { total: 0, sample: [] };
  const agentWorkCommit = validatedAgentWorkCommit(repo, runDoc);
  const privatePacketPath = '.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.md';
  const privatePacketJsonPath = '.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.json';
  const redactedRepoPath = `ops/return-packets/${dateStamp()}-complete-system-reality-redacted.md`;
  return {
    generated_at: nowIso(),
    privacy_classification: 'internal_local_only',
    redacted_repo_classification: 'redacted_repo_safe',
    packet_contract: 'chatgpt-return-packet-v1',
    private_packet: {
      markdown_path: privatePacketPath,
      json_path: privatePacketJsonPath,
      gitignored: true
    },
    redacted_repo_summary: {
      markdown_path: redactedRepoPath,
      includes_private_raw_source: false,
      includes_secret_values: false
    },
    system_truth: {
      master: repo.origin_master,
      branch: repo.branch,
      head: repo.head,
      upstream: repo.upstream || '',
      validated_agent_work_head: agentWorkCommit,
      pr: runDoc?.git_refs?.pr_url || '',
      active_run: latest?.path || '',
      deployed_commit: 'not verified by current local state',
      deployment_id: 'not verified by current local state',
      dirty_total: dirty.total,
      dirty_sample: dirty.sample || []
    },
    source_coverage: source,
    worktrees: worktree.worktrees,
    ramble_protocol: {
      canonical_source: requirementsDoc?.sources?.[0]?.source_path || '',
      parent_persistence: 'canonical packet and local/Postgres adapters implemented; live DB persistence remains gated',
      source_statements: requirementsDoc?.source_statements?.length || 0,
      modes: ['brainstorm', 'capture', 'goal'],
      adapters: ['github', 'chatgpt', 'codex/manual', 'operations', 'drive/transcript planned through canonical service'],
      github_intake: 'dry-run and canonical packet preview implemented; production persistence gated',
      decisions: 'canonical Decision lane tested locally through parser/projection/auto-resume contracts',
      my_tasks: 'human work stays separate from Agent Work in canonical parser/projection contracts',
      agent_work: 'machine work packages tracked in execution-run requirements',
      auto_resume: 'local prompt auto-resume planner and watchdog contract implemented',
      session_resume: 'execution run, next-session file, PR comments, and return-packet generator carry continuation state'
    },
    goals: {
      canonical_registry: latest?.path || '',
      counts_by_status: countRequirementsByStatus(requirements),
      requirements: summarizedRequirements,
      blockers: blocked.map((item) => ({
        id: item.id,
        owner: item.blocker_owner || 'Operator',
        reason: item.blocker || item.next_action,
        next_action: item.blocker_next_action || item.next_action
      })),
      progress: inProgress.map((item) => ({
        id: item.id,
        status: item.implementation_status,
        next_action: item.next_action
      }))
    },
    class_drive_intake: {
      jobs: drive.jobs,
      blockers: drive.blockers,
      live_database_verified: false,
      safe_apply_performed: false,
      remaining_backfill: 'jobs 64-74 production apply remains gated by external readback/backfill approval'
    },
    external_gates: externalGates,
    assets_drive: {
      known_targets: asset.known_targets,
      match_count: asset.matches.length,
      sample_matches: asset.matches.slice(0, 20),
      drive_writes: 'not performed by return-packet generation',
      deployed_proof: 'not verified by current local state'
    },
    ui_studio: {
      routes: ui.routes,
      totals: ui.totals,
      service_provider_studio: 'present in repo evidence and covered by local smoke tests; live deployed proof remains gated',
      deployed_proof: 'not verified by current local state'
    },
    decisions_for_shloimie: blocked.map((item) => ({
      id: `DECISION-${item.id}`,
      deep_link: runDoc?.git_refs?.pr_url || '',
      recommendation: item.blocker_next_action || item.next_action,
      exact_action: item.blocker_next_action || item.next_action
    })),
    my_tasks: blocked.map((item) => ({
      id: `MYTASK-${item.id}`,
      deep_link: runDoc?.git_refs?.pr_url || '',
      action: item.blocker_next_action || item.next_action
    })),
    agent_work: inProgress.map((item) => ({
      package: item.id,
      phase: item.implementation_status,
      branch: repo.branch,
      commit: agentWorkCommit,
      next_step: item.next_action
    })),
    tests_deployment: {
      latest_tests: summarizeLatestTests(runDir),
      pr: runDoc?.git_refs?.pr_url || '',
      migrations: 'additive/local verified where implemented; production apply remains gated',
      deployment: 'not performed by this packet generation',
      live_smokes: 'not performed by this packet generation'
    },
    what_is_still_not_done: summarizedRequirements
      .filter((item) => !['done', 'superseded'].includes(item.status))
      .map((item) => ({
        item: item.id,
        reason: item.blocker || item.next_action || item.implementation_status,
        owner: item.blocker_owner || item.owner || 'Codex',
        next_action: item.blocker_next_action || item.next_action
      })),
    next_automatic_action: {
      package: nextExecutable?.id || 'none',
      command: nextExecutable
        ? `npm run bna:return-packet -- --json, then continue ${nextExecutable.id}: ${nextExecutable.next_action || nextExecutable.title}`
        : 'No unblocked automatic package. Run npm run bna:run:blockers after required external approvals are configured.'
    },
    verdict: nextExecutable
      ? 'PARTIAL - UNBLOCKED IMPLEMENTATION REMAINS'
      : 'PARTIAL - APPROVAL-GATED WORK REMAINS'
  };
}

function redactLocalPath(value, redacted) {
  if (!redacted) return value;
  if (!value) return value;
  return String(value).replace(/[A-Z]:[\\/]+Users[\\/]+[^\\/]+/gi, '[local-user]');
}

function renderReturnPacketMarkdown(report, options = {}) {
  const redacted = Boolean(options.redacted);
  const pathLabel = (value) => redactLocalPath(value || '', redacted);
  const worktrees = Array.isArray(report.worktrees) ? report.worktrees : [];
  const requirements = Array.isArray(report.goals?.requirements) ? report.goals.requirements : [];
  const blockers = Array.isArray(report.goals?.blockers) ? report.goals.blockers : [];
  const agentWork = Array.isArray(report.agent_work) ? report.agent_work : [];
  const decisions = Array.isArray(report.decisions_for_shloimie) ? report.decisions_for_shloimie : [];
  const myTasks = Array.isArray(report.my_tasks) ? report.my_tasks : [];
  const openItems = Array.isArray(report.what_is_still_not_done) ? report.what_is_still_not_done : [];
  const routeRows = Array.isArray(report.ui_studio?.routes) ? report.ui_studio.routes : [];
  const assetSamples = Array.isArray(report.assets_drive?.sample_matches) ? report.assets_drive.sample_matches : [];
  const jobRows = report.class_drive_intake?.jobs || {};
  const latestTests = report.tests_deployment?.latest_tests || {};
  const externalGates = report.external_gates || {};
  const gateScopes = Array.isArray(externalGates.scopes) ? externalGates.scopes : [];
  const gateBlockers = Array.isArray(externalGates.blockers) ? externalGates.blockers : [];
  const gateCommands = Array.isArray(externalGates.next_command_plan) ? externalGates.next_command_plan : [];
  const lines = [
    'CHATGPT RETURN PACKET',
    `Generated: ${report.generated_at}`,
    `Privacy: ${redacted ? report.redacted_repo_classification : report.privacy_classification}`,
    '',
    'SYSTEM TRUTH',
    `- master: ${report.system_truth.master || 'unknown'}`,
    `- deployed commit/deployment: ${report.system_truth.deployed_commit || 'unknown'} / ${report.system_truth.deployment_id || 'unknown'}`,
    `- branch/PR: ${report.system_truth.branch || 'unknown'} / ${report.system_truth.pr || 'none'}`,
    `- active run: ${report.system_truth.active_run || 'unknown'}`,
    `- source coverage: errors ${report.source_coverage?.validation?.errors?.length ?? 'unknown'}, unmapped ${report.source_coverage?.source_statements?.unmapped_executable ?? 'unknown'}`,
    `- local-only work: dirty files ${report.system_truth.dirty_total ?? 0}`,
    '- unpushed work: current branch upstream status recorded in git; no local-only commit claim made by packet',
    '- merged-not-deployed: deployment readback not verified in current local state',
    '- deployed-not-verified: live proof not verified in current local state',
    '',
    'WORKTREES',
    ...(worktrees.length ? worktrees.map((wt) => `- ${pathLabel(wt.path)} / ${wt.branch} / ${String(wt.head || '').slice(0, 12)} / ${wt.state} / recovery: ${wt.recovery_action}`) : ['- none recorded']),
    '',
    'RAMBLE PROTOCOL',
    `- canonical source: ${report.ramble_protocol.canonical_source || 'unknown'}`,
    `- parent persistence: ${report.ramble_protocol.parent_persistence}`,
    `- source statements: ${report.ramble_protocol.source_statements}`,
    `- modes: ${report.ramble_protocol.modes.join(', ')}`,
    `- adapters: ${report.ramble_protocol.adapters.join(', ')}`,
    `- GitHub intake: ${report.ramble_protocol.github_intake}`,
    `- Decisions: ${report.ramble_protocol.decisions}`,
    `- My Tasks: ${report.ramble_protocol.my_tasks}`,
    `- Agent Work: ${report.ramble_protocol.agent_work}`,
    `- auto-resume: ${report.ramble_protocol.auto_resume}`,
    `- session resume: ${report.ramble_protocol.session_resume}`,
    '',
    'GOALS',
    `- canonical registry: ${report.goals.canonical_registry || 'unknown'}`,
    `- active goals: ${JSON.stringify(report.goals.counts_by_status)}`,
    `- progress: ${requirements.filter((item) => item.status === 'done').length} done, ${requirements.filter((item) => item.status === 'in_progress').length} in progress`,
    `- blockers: ${blockers.map((item) => `${item.id} ${item.owner}`).join('; ') || 'none'}`,
    '- evidence: execution-run requirements, test results, PR comments, and generated truth reports',
    '',
    'CLASS / DRIVE INTAKE',
    `- jobs 75-79: ${['75', '76', '77', '78', '79'].map((id) => `${id}:${jobRows[id]?.repo_evidence_found ? 'repo-evidence' : 'missing-repo-evidence'}`).join(', ')}`,
    `- jobs 64-74: ${Array.from({ length: 11 }, (_, index) => String(64 + index)).map((id) => `${id}:${jobRows[id]?.repo_evidence_found ? 'repo-evidence' : 'missing-repo-evidence'}`).join(', ')}`,
    '- transcription: live state requires external readback',
    '- parsing: repo evidence exists where audits found it; live state requires external readback',
    '- questions: live state requires database readback',
    '- scores/progress: live state requires database readback',
    '- profiles: live state requires database readback',
    `- remaining backfill: ${report.class_drive_intake.remaining_backfill}`,
    '',
    'EXTERNAL READBACK / APPLY GATES',
    `- gate status: ${externalGates.ok ? 'ready' : 'blocked'} (${externalGates.mode || 'unknown'})`,
    `- safety: external_read=${externalGates.external_read_performed ? 'yes' : 'no'}, production_mutation=${externalGates.production_mutation_performed ? 'yes' : 'no'}, safe_apply=${externalGates.safe_apply_performed ? 'yes' : 'no'}, deploy=${externalGates.deploy_performed ? 'yes' : 'no'}, secrets_redacted=${externalGates.secrets_redacted ? 'yes' : 'no'}`,
    ...(gateScopes.length
      ? gateScopes.map((scope) => `- ${scope.scope}: ${scope.ready ? 'ready' : 'blocked'}; secrets ${scope.secrets_configured}/${scope.secrets_required}; config ${scope.config_configured}/${scope.config_required}`)
      : ['- scopes: none recorded']),
    ...(gateBlockers.length ? gateBlockers.map((blocker) => `- blocker: ${blocker}`) : ['- blockers: none']),
    ...(gateCommands.length ? gateCommands.map((command) => `- next: ${command}`) : ['- next: see execution-run blockers']),
    '',
    'ASSETS / DRIVE',
    `- logo: repo match count ${assetSamples.filter((item) => /logo/i.test(item.path)).length}`,
    '- portrait: repo evidence scan only',
    '- hero video/Vimeo: access token/readback remains gated',
    '- teaching stills: repo evidence scan only',
    '- labels: repo evidence scan only',
    '- contact sheets: generated location exists in repo summary when asset truth runs',
    `- Drive writes: ${report.assets_drive.drive_writes}`,
    '- repo usage: sample asset candidates are listed below',
    `- deployed proof: ${report.assets_drive.deployed_proof}`,
    ...assetSamples.slice(0, 8).map((item) => `- asset sample: ${item.path}`),
    '',
    'UI / STUDIO',
    `- routes: ${routeRows.map((row) => `${row.route}(${row.registry_rows}/${row.action_rows})`).join(', ')}`,
    '- missing requested changes: live proof gaps remain where deployment/readback is not verified',
    '- real vs mock: local/static coverage distinguishes repo evidence from live proof',
    `- screenshots: ${report.ui_studio.totals?.screenshot_files ?? 0} repo screenshot files scanned`,
    `- deployed proof: ${report.ui_studio.deployed_proof}`,
    `- Service Provider Studio: ${report.ui_studio.service_provider_studio}`,
    '',
    'DECISIONS FOR SHLOIMIE',
    ...(decisions.length ? decisions.map((decision) => `- ${decision.id} / ${decision.deep_link || 'no link'} / recommendation: ${decision.recommendation} / action: ${decision.exact_action}`) : ['- none']),
    '',
    'MY TASKS',
    ...(myTasks.length ? myTasks.map((task) => `- ${task.id} / ${task.deep_link || 'no link'} / ${task.action}`) : ['- none']),
    '',
    'AGENT WORK',
    ...(agentWork.length ? agentWork.map((item) => `- ${item.package} / ${item.phase} / ${item.branch} / ${String(item.commit || '').slice(0, 12)} / ${item.next_step}`) : ['- none']),
    '',
    'TESTS / DEPLOYMENT',
    `- tests: ${latestTests.npm_test || 'see execution-run TEST-RESULTS.md'}`,
    '- Playwright: not run by return-packet generation',
    `- PRs: ${report.tests_deployment.pr || 'none'}`,
    `- migrations: ${report.tests_deployment.migrations}`,
    `- deployment: ${report.tests_deployment.deployment}`,
    `- live smokes: ${report.tests_deployment.live_smokes}`,
    '',
    'WHAT IS STILL NOT DONE',
    ...(openItems.length ? openItems.map((item) => `- ${item.item} / ${item.reason} / owner: ${item.owner} / next: ${item.next_action}`) : ['- none']),
    '',
    'NEXT AUTOMATIC ACTION',
    `- package: ${report.next_automatic_action.package}`,
    `- command: ${report.next_automatic_action.command}`,
    '',
    'CHATGPT RETURN PACKET',
    `- local path: ${report.private_packet.markdown_path}`,
    `- redacted repo path: ${report.redacted_repo_summary.markdown_path}`,
    '- copy-ready packet follows in this file',
    '',
    'VERDICT',
    report.verdict,
    ''
  ];
  return lines.join('\n');
}

function renderMarkdown(title, report) {
  const lines = [`# ${title}`, '', `Generated: ${report.generated_at}`, ''];
  if (report.repo) {
    lines.push('## Git', '');
    lines.push(`- path: ${report.repo.path}`);
    lines.push(`- branch: ${report.repo.branch}`);
    lines.push(`- head: ${report.repo.head}`);
    lines.push(`- upstream: ${report.repo.upstream || 'none'}`);
    lines.push(`- dirty_total: ${report.repo.dirty.total}`);
    lines.push('');
  }
  if (report.source) {
    lines.push('## Source', '');
    lines.push(`- active_run: ${report.source.active_run || 'none'}`);
    lines.push(`- validation_errors: ${report.source.validation.errors.length}`);
    lines.push(`- validation_warnings: ${report.source.validation.warnings.length}`);
    lines.push(`- source_statements: ${report.source.source_statements.total}`);
    lines.push(`- unmapped_executable: ${report.source.source_statements.unmapped_executable}`);
    lines.push('');
  }
  if (report.worktrees) {
    lines.push('## Worktrees', '');
    for (const wt of report.worktrees) {
      lines.push(`- ${wt.path} / ${wt.branch} / ${String(wt.head || '').slice(0, 12)} / ${wt.state} / dirty ${wt.dirty.total}`);
    }
    lines.push('');
  }
  if (report.fields) {
    lines.push('## Integration Readiness', '');
    for (const field of report.fields) {
      lines.push(`- ${field.key}: ${field.configured ? `configured (${field.source})` : 'missing'}`);
    }
    lines.push('');
  }
  if (report.matches) {
    lines.push('## Assets', '');
    lines.push(`- matches: ${report.matches.length}`);
    for (const match of report.matches.slice(0, 40)) {
      lines.push(`- ${match.path} / ${match.matched_term} / ${match.repo_usage_hint}`);
    }
    lines.push('');
  }
  if (report.jobs) {
    lines.push('## Class Jobs', '');
    for (const [id, job] of Object.entries(report.jobs)) {
      lines.push(`- ${id}: repo_evidence=${job.repo_evidence_found}; db_verified=${job.live_database_verified}; files=${job.evidence_files.length}`);
    }
    lines.push('');
  }
  if (report.routes) {
    lines.push('## UI Routes', '');
    for (const row of report.routes) {
      lines.push(`- ${row.route}: route_rows=${row.registry_rows}; action_rows=${row.action_rows}; screenshots=${row.screenshot_evidence_count}`);
    }
    lines.push('');
  }
  lines.push('## JSON Summary', '', '```json', JSON.stringify(report, null, 2), '```', '');
  return lines.join('\n');
}

function writeReport(mode, report) {
  const stamp = slugStamp();
  if (mode === 'return-packet') {
    const runtimeDir = path.join(repoRoot, '.runtime', 'system-reality-audit');
    const repoDir = path.join(repoRoot, 'ops', 'return-packets');
    ensureDir(runtimeDir);
    ensureDir(repoDir);
    const privateMd = path.join(runtimeDir, 'CHATGPT-RETURN-PACKET.md');
    const privateJson = path.join(runtimeDir, 'CHATGPT-RETURN-PACKET.json');
    const redactedMd = path.join(repoDir, `${dateStamp()}-complete-system-reality-redacted.md`);
    fs.writeFileSync(privateMd, renderReturnPacketMarkdown(report));
    fs.writeFileSync(privateJson, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(redactedMd, renderReturnPacketMarkdown(report, { redacted: true }));
    return {
      private_md: rel(privateMd),
      private_json: rel(privateJson),
      redacted_md: rel(redactedMd)
    };
  }
  if (mode === 'worktree') {
    const dir = path.join(repoRoot, 'ops', 'worktree-reconciliation');
    ensureDir(dir);
    const base = `${dateStamp()}-worktree-cleanup-plan`;
    fs.writeFileSync(path.join(dir, `${base}.json`), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, `${base}.md`), renderMarkdown('Worktree Cleanup Plan', report));
    return { json: rel(path.join(dir, `${base}.json`)), md: rel(path.join(dir, `${base}.md`)) };
  }
  if (mode === 'asset') {
    const dir = path.join(repoRoot, 'ops', 'audits');
    const contactDir = path.join(repoRoot, 'ops', 'ui-audits', `${dateStamp()}-one-time-asset-contact-sheet`);
    ensureDir(dir);
    ensureDir(contactDir);
    fs.writeFileSync(path.join(contactDir, 'README.md'), '# One Time Asset Contact Sheet\n\nNo contact sheet images were generated by asset:truth; this folder records the required output location for a later visual pass.\n');
    const base = `${dateStamp()}-one-time-asset-drive-and-render-truth`;
    fs.writeFileSync(path.join(dir, `${base}.json`), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, `${base}.md`), renderMarkdown('One Time Asset Drive And Render Truth', report));
    return { json: rel(path.join(dir, `${base}.json`)), md: rel(path.join(dir, `${base}.md`)), contact_sheet: rel(contactDir) };
  }
  if (mode === 'drive-intake') {
    const dir = path.join(repoRoot, 'ops', 'drive-audits');
    ensureDir(dir);
    const truth = `${dateStamp()}-class-intake-complete-truth`;
    const backfill = `${dateStamp()}-guarded-progress-question-backfill`;
    fs.writeFileSync(path.join(dir, `${truth}.json`), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, `${truth}.md`), renderMarkdown('Class Intake Complete Truth', report));
    fs.writeFileSync(path.join(dir, `${backfill}.md`), renderMarkdown('Guarded Progress Question Backfill', report));
    return { json: rel(path.join(dir, `${truth}.json`)), md: rel(path.join(dir, `${truth}.md`)), backfill: rel(path.join(dir, `${backfill}.md`)) };
  }
  if (mode === 'ui') {
    const dir = path.join(repoRoot, 'ops', 'ui-audits');
    ensureDir(dir);
    const base = `${dateStamp()}-ui-source-coverage`;
    fs.writeFileSync(path.join(dir, `${base}.json`), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, `${base}.md`), renderMarkdown('UI Source Coverage', report));
    return { json: rel(path.join(dir, `${base}.json`)), md: rel(path.join(dir, `${base}.md`)) };
  }
  if (mode === 'source') {
    const dir = path.join(repoRoot, 'ops', 'source-truth');
    ensureDir(dir);
    const base = `${dateStamp()}-source-truth`;
    fs.writeFileSync(path.join(dir, `${base}.json`), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, `${base}.md`), renderMarkdown('Source Truth', report));
    return { json: rel(path.join(dir, `${base}.json`)), md: rel(path.join(dir, `${base}.md`)) };
  }
  const dir = path.join(repoRoot, 'ops', 'system-audits');
  ensureDir(dir);
  const base = `${stamp}-system-truth`;
  fs.writeFileSync(path.join(dir, `${base}.json`), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, `${base}.md`), renderMarkdown('System Truth', report));
  return { json: rel(path.join(dir, `${base}.json`)), md: rel(path.join(dir, `${base}.md`)) };
}

export async function buildReport(mode = 'system') {
  if (mode === 'worktree') return worktreeReport();
  if (mode === 'source') return sourceReport();
  if (mode === 'asset') return assetReport();
  if (mode === 'drive-intake') return driveIntakeReport();
  if (mode === 'ui') return uiSourceCoverageReport();
  if (mode === 'readiness') return readinessReport();
  if (mode === 'return-packet') return returnPacketReport();
  return systemReport();
}

function parseArgs(argv) {
  const modeAliases = {
    system: 'system',
    worktree: 'worktree',
    source: 'source',
    asset: 'asset',
    'drive-intake': 'drive-intake',
    ui: 'ui',
    readiness: 'readiness',
    'return-packet': 'return-packet'
  };
  const args = { mode: 'system', json: false, noWrite: false };
  for (const arg of argv) {
    if (modeAliases[arg]) args.mode = modeAliases[arg];
    else if (arg === '--json') args.json = true;
    else if (arg === '--no-write') args.noWrite = true;
  }
  return args;
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = await buildReport(args.mode);
  const paths = args.noWrite ? null : writeReport(args.mode, report);
  if (args.json) {
    console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  } else {
    console.log(renderMarkdown(`${args.mode} truth`, report));
    if (paths) console.log(`Report written: ${Object.values(paths).join(', ')}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
