#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

function run(command, args = [], options = {}) {
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
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
    error: result.error ? String(result.error.message || result.error) : ''
  };
}

function runGit(args, cwd = repoRoot) {
  return run('git', args, { cwd });
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
  const branch = runGit(['branch', '--show-current'], root).stdout || '(detached)';
  const head = runGit(['rev-parse', 'HEAD'], root).stdout;
  const upstream = runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], root);
  const upstreamHead = upstream.ok ? runGit(['rev-parse', '@{u}'], root).stdout : '';
  const originMaster = runGit(['rev-parse', 'origin/master'], root).stdout;
  const remote = runGit(['remote', '-v'], root).stdout.split(/\r?\n/).filter(Boolean);
  const aheadBehind = upstream.ok
    ? runGit(['rev-list', '--left-right', '--count', `${upstream.stdout}...HEAD`], root).stdout
    : '';
  const [behind = '', ahead = ''] = aheadBehind.split(/\s+/);
  return {
    path: root,
    branch,
    head,
    upstream: upstream.ok ? upstream.stdout : '',
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

async function sourceReport() {
  const latestPath = path.join(repoRoot, 'ops', 'execution-runs', 'latest.json');
  const latest = readJsonSafe(latestPath);
  const runDir = latest?.path ? path.resolve(repoRoot, latest.path) : null;
  const requirementsDoc = runDir ? readJsonSafe(path.join(runDir, 'requirements.json')) : null;
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
      stdout: railwayStatus.stdout,
      stderr_first_line: railwayStatus.stderr.split(/\r?\n/)[0] || ''
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
    'intake:github'
  ];
  return Object.fromEntries(required.map((name) => [name, Boolean(scripts[name])]));
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
    readiness: 'readiness'
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
