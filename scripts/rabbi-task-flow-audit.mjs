#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const auditsDir = path.join(repoRoot, 'ops', 'system-audits');

const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const RABBI_TERMS = /\b(one time|one-time|mishnah|mishna|mishnayos|rabbi elie|elie scheller|elie sheller|scheller|sheller|shiur|video library|member[-\s]?library)\b/i;
const PRIVATE_BNA_SCOPE_TERMS = /\b(bna school|student access code|bnastudentaccesscode|parent portal|student portal|parent_email|parent phone|accountability|dratler|kosofsky|golombo|weber|fober|menachem|ahuva|braka|baraka|eitan chaim)\b/i;
const PRIVATE_BNA_REDACTION_TERMS = [
  'bna school',
  'student access code',
  'bnastudentaccesscode',
  'parent portal',
  'student portal',
  'parent_email',
  'parent phone',
  'accountability',
  'dratler',
  'kosofsky',
  'golombo',
  'weber',
  'fober',
  'menachem',
  'ahuva',
  'braka',
  'baraka',
  'eitan chaim',
];
const EXTERNAL_WRITE_TERMS = /\b(google|drive|oauth|vimeo|resend|stripe|green invoice|payment|checkout|billing|member[-\s]?library|publish|send|whatsapp|email|sms|buffer|social|external crm|admin password|access grant)\b/i;
const CODEX_TERMS = /\b(codex|agent|system|automation|script|deploy|railway|smoke|test|api|implementation|frontend|backend)\b/i;

function nowIso() {
  return new Date().toISOString();
}

function localStamp(date = new Date()) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  return `${date.toISOString().replace(/\.\d{3}Z$/, '')}${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadConfig() {
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  return {
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
  };
}

function parseArgs(argv = []) {
  const args = {
    json: false,
    limit: 1000,
    tasksFile: '',
    noLive: false,
    outputDir: auditsDir,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--no-live') args.noLive = true;
    else if (arg === '--limit') args.limit = Number(argv[++index] || 1000);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.split('=').slice(1).join('=') || 1000);
    else if (arg === '--tasks-file') args.tasksFile = String(argv[++index] || '');
    else if (arg.startsWith('--tasks-file=')) args.tasksFile = arg.split('=').slice(1).join('=');
    else if (arg === '--output-dir') args.outputDir = String(argv[++index] || auditsDir);
    else if (arg.startsWith('--output-dir=')) args.outputDir = arg.split('=').slice(1).join('=') || auditsDir;
    else if (arg === '--apply' || arg.startsWith('--confirm')) {
      throw new Error('Rabbi task-flow audit is read-only and has no apply mode.');
    }
  }
  args.limit = Math.max(1, Math.min(Number.isFinite(args.limit) ? Math.trunc(args.limit) : 1000, 1000));
  args.outputDir = path.isAbsolute(args.outputDir) ? args.outputDir : path.join(repoRoot, args.outputDir);
  return args;
}

function normalizeTaskList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tasks)) return data.tasks;
  return [];
}

function readTasksFile(filePath) {
  if (!filePath) return [];
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
  return normalizeTaskList(JSON.parse(fs.readFileSync(resolved, 'utf8')));
}

async function appRequest(config, method, endpoint) {
  if (!config.opsUsername || !config.opsPassword) {
    throw new Error('OPS_USERNAME/OPS_PASSWORD are required for live Rabbi task-flow audit');
  }
  const response = await fetch(`${config.appUrl.replace(/\/+$/, '')}${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`,
      Accept: 'application/json',
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${endpoint} failed ${response.status}: ${text.slice(0, 800)}`);
  return text ? JSON.parse(text) : {};
}

async function loadLiveTasks(config, { limit = 1000 } = {}) {
  const query = new URLSearchParams({ limit: String(limit) });
  const data = await appRequest(config, 'GET', `/api/bna/tasks?${query.toString()}`);
  return normalizeTaskList(data);
}

function compactText(value, maxLength = 96) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function redactPrivateBnaTerms(value) {
  let text = String(value || '');
  for (const term of PRIVATE_BNA_REDACTION_TERMS) {
    text = text.replace(new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi'), '[private BNA scope]');
  }
  return text;
}

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function taskMetadataText(task = {}) {
  const metadata = task.metadata || task.source_context || task.workflow_detail || {};
  if (!metadata || typeof metadata !== 'object') return '';
  return JSON.stringify(metadata);
}

function taskHaystack(task = {}) {
  return [
    task.project_key,
    task.project_name,
    task.workspace_key,
    task.title,
    task.notes,
    task.category,
    task.assigned_to,
    task.waiting_on,
    task.status,
    task.stage,
    taskMetadataText(task),
  ].filter(Boolean).join(' ');
}

function taskMatchesRabbiFlow(task = {}) {
  const projectKey = normalizeKey(task.project_key || task.projectKey);
  if (projectKey === ONE_TIME_PROJECT_KEY) return true;
  return RABBI_TERMS.test(taskHaystack(task));
}

function isClosedTask(task = {}) {
  const stage = normalizeKey(task.stage || task.status);
  return ['done', 'archive', 'closed', 'completed', 'verified'].includes(stage) || Boolean(task.completed_at || task.verified_at);
}

function taskNeedsHuman(task = {}) {
  const stage = normalizeKey(task.stage || task.status);
  const assignee = normalizeKey(task.assigned_to || task.owner);
  const waitingOn = normalizeKey(task.waiting_on || task.blocked_by);
  if (task.decision_required || stage === 'needs_decision') return true;
  if (waitingOn && !CODEX_TERMS.test(waitingOn)) return true;
  return /\b(shloimie|rabbi|elie|parent|provider|owner)\b/.test(assignee) && !isClosedTask(task);
}

function taskLooksCodexReady(task = {}) {
  const stage = normalizeKey(task.stage || task.status);
  const assignee = normalizeKey(task.assigned_to || task.owner);
  const haystack = taskHaystack(task);
  if (isClosedTask(task)) return false;
  if (taskNeedsHuman(task)) return false;
  if (/\bcodex\b/.test(assignee)) return true;
  return ['assigned', 'queued', 'running', 'in_progress'].includes(stage) && CODEX_TERMS.test(haystack);
}

function titleNeedsReview(title = '') {
  const text = String(title || '').replace(/\s+/g, ' ').trim();
  if (!text) return true;
  if (text.length > 120) return true;
  return /\b(i should|i need|i want|can you|could you|you should|what in the world|nothing gets messed up|passed that over|raw ramble)\b/i.test(text);
}

function buildTaskIssueFlags(task = {}) {
  const flags = [];
  const haystack = taskHaystack(task);
  const title = String(task.title || '');
  if (titleNeedsReview(title)) flags.push('visible_title_review');
  if (PRIVATE_BNA_SCOPE_TERMS.test(haystack)) flags.push('private_bna_scope_review');
  if (EXTERNAL_WRITE_TERMS.test(haystack) && !isClosedTask(task)) flags.push('external_write_gate_review');
  if (!normalizeKey(task.project_key || task.projectKey) && RABBI_TERMS.test(haystack)) flags.push('missing_project_key_review');
  if (taskNeedsHuman(task)) flags.push('human_blocker_or_decision');
  if (taskLooksCodexReady(task)) flags.push('codex_ready');
  return [...new Set(flags)];
}

function countBy(items = [], keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item) || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function taskAuditRow(task = {}) {
  const flags = buildTaskIssueFlags(task);
  return {
    id: task.id,
    title_preview: compactText(redactPrivateBnaTerms(task.title || 'Untitled task'), 110),
    project_key: task.project_key || task.projectKey || '',
    stage: task.stage || task.status || '',
    assigned_to: task.assigned_to || task.owner || '',
    due_date: task.due_date || task.planned_at || '',
    decision_required: Boolean(task.decision_required),
    flags,
  };
}

function buildRabbiTaskFlowAudit(tasks = [], options = {}) {
  const allTasks = normalizeTaskList(tasks);
  const rabbiTasks = allTasks.filter(taskMatchesRabbiFlow).map(taskAuditRow);
  const active = rabbiTasks.filter((task) => !['done', 'archive', 'closed', 'completed', 'verified'].includes(normalizeKey(task.stage)));
  const flagged = rabbiTasks.filter((task) => task.flags.length);
  const humanBlocked = rabbiTasks.filter((task) => task.flags.includes('human_blocker_or_decision'));
  const codexReady = rabbiTasks.filter((task) => task.flags.includes('codex_ready'));
  const privateScopeReview = rabbiTasks.filter((task) => task.flags.includes('private_bna_scope_review'));
  const externalWriteGates = rabbiTasks.filter((task) => task.flags.includes('external_write_gate_review'));
  const titleReviews = rabbiTasks.filter((task) => task.flags.includes('visible_title_review'));

  return {
    generated_at: nowIso(),
    report_kind: 'rabbi_task_flow_audit',
    dry_run: true,
    read_only: true,
    live_write_performed: false,
    task_patch_performed: false,
    source: options.source || 'tasks',
    scanned_task_count: allTasks.length,
    rabbi_task_count: rabbiTasks.length,
    summary: {
      active_count: active.length,
      closed_or_done_count: rabbiTasks.length - active.length,
      human_blocker_or_decision_count: humanBlocked.length,
      codex_ready_count: codexReady.length,
      private_scope_review_count: privateScopeReview.length,
      external_write_gate_review_count: externalWriteGates.length,
      visible_title_review_count: titleReviews.length,
      by_stage: countBy(rabbiTasks, task => normalizeKey(task.stage) || 'missing_stage'),
      by_assignee: countBy(rabbiTasks, task => normalizeKey(task.assigned_to) || 'unassigned'),
    },
    queues: {
      human_blocker_or_decision: humanBlocked,
      codex_ready: codexReady,
      private_scope_review: privateScopeReview,
      external_write_gate_review: externalWriteGates,
      visible_title_review: titleReviews,
      all_rabbi_tasks: rabbiTasks,
    },
    guardrails: [
      'This audit is read-only and has no apply mode.',
      'Do not move, close, retitle, reassign, or publish Rabbi/One Time tasks from this report alone.',
      'Use typed approval-gated actions or explicit task endpoints only after review.',
      'Do not expose private BNA student/parent/accountability data in Rabbi/provider task flow.',
      'External writes remain blocked behind their existing approval phrases and connector gates.',
    ],
  };
}

function renderTaskList(title, tasks = [], emptyText = 'None found.') {
  const lines = [`## ${title}`, ''];
  if (!tasks.length) {
    lines.push(`- ${emptyText}`, '');
    return lines;
  }
  for (const task of tasks.slice(0, 80)) {
    lines.push(`- #${task.id} ${task.title_preview}`);
    lines.push(`  - Stage: ${task.stage || 'unknown'}; Assignee: ${task.assigned_to || 'unassigned'}; Project: ${task.project_key || 'unknown'}`);
    lines.push(`  - Flags: ${task.flags.join(', ') || 'none'}`);
  }
  if (tasks.length > 80) lines.push(`- ${tasks.length - 80} additional rows omitted from Markdown; see JSON report.`);
  lines.push('');
  return lines;
}

function renderRabbiTaskFlowMarkdown(audit = {}) {
  const summary = audit.summary || {};
  const queues = audit.queues || {};
  const lines = [
    `# Rabbi / One Time Task Flow Audit - ${audit.generated_at}`,
    '',
    'Result: read-only report',
    '',
    '## Summary',
    '',
    `- Scanned tasks: ${audit.scanned_task_count || 0}`,
    `- Rabbi / One Time related tasks: ${audit.rabbi_task_count || 0}`,
    `- Active Rabbi / One Time tasks: ${summary.active_count || 0}`,
    `- Human blocker or decision: ${summary.human_blocker_or_decision_count || 0}`,
    `- Codex-ready: ${summary.codex_ready_count || 0}`,
    `- Private BNA scope review: ${summary.private_scope_review_count || 0}`,
    `- External-write gate review: ${summary.external_write_gate_review_count || 0}`,
    `- Visible title review: ${summary.visible_title_review_count || 0}`,
    '',
    '## Stage Counts',
    '',
    ...Object.entries(summary.by_stage || {}).sort().map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Assignee Counts',
    '',
    ...Object.entries(summary.by_assignee || {}).sort().map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Guardrails',
    '',
    ...(audit.guardrails || []).map((item) => `- ${item}`),
    '',
    ...renderTaskList('Human Blockers / Decisions', queues.human_blocker_or_decision || []),
    ...renderTaskList('Codex-Ready Rabbi Work', queues.codex_ready || []),
    ...renderTaskList('Private Scope Review', queues.private_scope_review || []),
    ...renderTaskList('External Write Gate Review', queues.external_write_gate_review || []),
    ...renderTaskList('Visible Title Review', queues.visible_title_review || []),
  ];
  return `${lines.join('\n')}\n`;
}

function writeAuditReports(audit, { outputDir = auditsDir } = {}) {
  ensureDir(outputDir);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const mdPath = path.join(outputDir, `${stamp}-rabbi-task-flow-audit.md`);
  const jsonPath = path.join(outputDir, `${stamp}-rabbi-task-flow-audit.json`);
  fs.writeFileSync(mdPath, renderRabbiTaskFlowMarkdown(audit));
  fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
  return { mdPath, jsonPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  let tasks = [];
  let source = 'live';
  if (args.tasksFile) {
    tasks = readTasksFile(args.tasksFile);
    source = relative(path.isAbsolute(args.tasksFile) ? args.tasksFile : path.join(repoRoot, args.tasksFile));
  } else if (args.noLive) {
    tasks = [];
    source = 'no-live-empty';
  } else {
    tasks = await loadLiveTasks(config, { limit: args.limit });
    source = `${config.appUrl.replace(/\/+$/, '')}/api/bna/tasks`;
  }

  const audit = buildRabbiTaskFlowAudit(tasks, { source, local_time: localStamp() });
  const reports = writeAuditReports(audit, { outputDir: args.outputDir });
  const result = {
    message: 'Rabbi task-flow audit complete.',
    markdown_report: relative(reports.mdPath),
    json_report: relative(reports.jsonPath),
    scanned_task_count: audit.scanned_task_count,
    rabbi_task_count: audit.rabbi_task_count,
    summary: audit.summary,
    read_only: true,
  };
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(result.message);
    console.log(`Markdown: ${result.markdown_report}`);
    console.log(`JSON: ${result.json_report}`);
    console.log(`Rabbi / One Time tasks: ${result.rabbi_task_count}`);
    console.log(`Human blockers/decisions: ${result.summary.human_blocker_or_decision_count}`);
    console.log(`Codex-ready: ${result.summary.codex_ready_count}`);
    console.log('No writes performed.');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

export {
  buildRabbiTaskFlowAudit,
  parseArgs,
  renderRabbiTaskFlowMarkdown,
  taskMatchesRabbiFlow,
  writeAuditReports,
};
