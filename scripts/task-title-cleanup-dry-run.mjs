#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  buildTaskTitleRepair,
  buildWatchdogRoutingRepair,
  looksRawRambleTitle,
  looksWatchdogWarningRepairRequest,
} from './agent-fleet-supervisor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const auditsDir = path.join(repoRoot, 'ops', 'system-audits');
const APPLY_CONFIRMATION = 'APPLY_TASK_TITLE_CLEANUP';
const SAFE_PATCH_FIELDS = new Set(['title', 'category', 'assigned_to', 'decision_required', 'stage']);

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
    apply: false,
    confirm: '',
    json: false,
    limit: 1000,
    tasksFile: '',
    noLive: false,
    includeClosed: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--no-live') args.noLive = true;
    else if (arg === '--confirm') args.confirm = String(argv[++index] || '');
    else if (arg.startsWith('--confirm=')) args.confirm = arg.split('=').slice(1).join('=');
    else if (arg === '--limit') args.limit = Number(argv[++index] || 1000);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.split('=').slice(1).join('=') || 1000);
    else if (arg === '--tasks-file') args.tasksFile = String(argv[++index] || '');
    else if (arg.startsWith('--tasks-file=')) args.tasksFile = arg.split('=').slice(1).join('=');
    else if (arg === '--include-closed') args.includeClosed = true;
  }
  args.limit = Math.max(1, Math.min(Number.isFinite(args.limit) ? Math.trunc(args.limit) : 1000, 1000));
  return args;
}

function assertApplyConfirmed(args) {
  if (!args.apply) return;
  if (args.confirm !== APPLY_CONFIRMATION) {
    throw new Error(`Live task cleanup requires --confirm ${APPLY_CONFIRMATION}`);
  }
}

function previewText(value, maxLength = 96) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function sanitizePatch(patch = {}) {
  return Object.fromEntries(
    Object.entries(patch)
      .filter(([key, value]) => SAFE_PATCH_FIELDS.has(key) && value !== undefined)
      .map(([key, value]) => [key, value]),
  );
}

function isClosedTask(task) {
  const stage = String(task?.stage || '').trim().toLowerCase();
  return ['done', 'archive'].includes(stage) || Boolean(task?.completed_at || task?.verified_at);
}

function suggestedTitleNeedsManualReview(title) {
  const normalized = String(title || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return true;
  const lower = normalized.toLowerCase();
  if (normalized.length > 96 && /\b(i|me|my|you|your|we|our)\b/i.test(normalized)) return true;
  if (/\b(i should|i need|i want|you bring|can you|could you|passed that over|he should make|she should make|what in the world|nothing gets messed up)\b/i.test(lower)) return true;
  return false;
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

async function appRequest(config, method, endpoint, body = null) {
  if (!config.opsUsername || !config.opsPassword) {
    throw new Error('OPS_USERNAME/OPS_PASSWORD are required for live task title cleanup');
  }
  const response = await fetch(`${config.appUrl.replace(/\/+$/, '')}${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
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

function buildTaskTitleCleanupPlan(tasks = [], options = {}) {
  const candidates = [];
  const manualReviews = [];
  let skippedClosedCount = 0;
  for (const task of tasks) {
    if (!task || task.id === undefined || task.id === null) continue;
    if (!options.includeClosed && isClosedTask(task)) {
      skippedClosedCount += 1;
      continue;
    }
    const titleRepair = buildTaskTitleRepair(task);
    const routingRepair = buildWatchdogRoutingRepair(task);
    const repair = routingRepair || titleRepair;
    if (!repair) continue;
    const patch = sanitizePatch(repair.patch || {});
    if (!Object.keys(patch).length) continue;
    const previousTitle = String(repair.previous_title || task.title || '').replace(/\s+/g, ' ').trim();
    const entry = {
      task_id: task.id,
      stage: task.stage || null,
      category: task.category || null,
      assigned_to: task.assigned_to || null,
      action: repair.action,
      raw_title_detected: looksRawRambleTitle(task),
      watchdog_warning_detected: looksWatchdogWarningRepairRequest(task),
      previous_title_preview: previewText(previousTitle),
      previous_title_length: previousTitle.length,
      next_title: repair.next_title || patch.title || null,
      patch,
    };
    if (suggestedTitleNeedsManualReview(entry.next_title)) {
      manualReviews.push({
        ...entry,
        reason: 'suggested_title_still_reads_like_raw_operator_wording',
      });
      continue;
    }
    candidates.push(entry);
  }
  return { candidates, manualReviews, skippedClosedCount };
}

function buildTaskTitleCleanupCandidates(tasks = [], options = {}) {
  return buildTaskTitleCleanupPlan(tasks, options).candidates;
}

function buildManualReviewCandidates(tasks = [], options = {}) {
  return buildTaskTitleCleanupPlan(tasks, options).manualReviews;
}

function buildTaskTitleCleanupAudit(tasks = [], options = {}) {
  const plan = buildTaskTitleCleanupPlan(tasks, options);
  const candidates = plan.candidates;
  return {
    generated_at: nowIso(),
    dry_run: !options.apply,
    apply_confirmed: Boolean(options.apply),
    include_closed: Boolean(options.includeClosed),
    tasks_scanned: tasks.length,
    skipped_closed_count: plan.skippedClosedCount,
    candidate_count: candidates.length,
    manual_review_count: plan.manualReviews.length,
    candidates,
    manual_reviews: plan.manualReviews,
    actions: candidates.map((candidate) => ({
      action: options.apply ? 'pending_apply' : 'would_patch_task_title',
      task_id: candidate.task_id,
      ok: null,
      patch_fields: Object.keys(candidate.patch),
    })),
    raw_source_policy: 'Full raw operator wording is intentionally excluded; previews are truncated.',
  };
}

function writeReport(audit) {
  ensureDir(auditsDir);
  const stamp = nowIso().replace(/[:.]/g, '-');
  const suffix = audit.dry_run ? 'dry-run' : 'apply';
  const mdPath = path.join(auditsDir, `${stamp}-task-title-cleanup-${suffix}.md`);
  const jsonPath = path.join(auditsDir, `${stamp}-task-title-cleanup-${suffix}.json`);
  const lines = [
    `# Task Title Cleanup ${audit.dry_run ? 'Dry Run' : 'Apply'} - ${localStamp()}`,
    '',
    `Dry run: ${audit.dry_run ? 'yes' : 'no'}`,
    `Tasks scanned: ${audit.tasks_scanned}`,
    `Skipped closed tasks: ${audit.skipped_closed_count}`,
    `Candidates: ${audit.candidate_count}`,
    `Manual review: ${audit.manual_review_count}`,
    '',
    'Full raw operator wording is intentionally excluded from this report; previous-title previews are truncated.',
    '',
    '## Candidates',
    ...(audit.candidates.length
      ? audit.candidates.map((candidate) => {
        const fields = Object.keys(candidate.patch).join(', ') || 'none';
        return `- #${candidate.task_id} [${candidate.stage || 'unknown'}] ${candidate.action}: "${candidate.previous_title_preview}" -> "${candidate.next_title || '(no title change)'}" (fields: ${fields})`;
      })
      : ['- none']),
    '',
    '## Manual Review',
    ...(audit.manual_reviews.length
      ? audit.manual_reviews.map((candidate) => `- #${candidate.task_id} [${candidate.stage || 'unknown'}] ${candidate.reason}: "${candidate.previous_title_preview}" -> "${candidate.next_title || '(no title change)'}"`)
      : ['- none']),
    '',
    '## Actions',
    ...(audit.actions.length
      ? audit.actions.map((action) => `- ${action.ok === false ? 'FAIL' : action.ok === true ? 'OK' : 'DRY'} ${action.action} #${action.task_id || 'n/a'}${action.message ? `: ${action.message}` : ''}`)
      : ['- none']),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
  return { mdPath, jsonPath };
}

async function applyCandidate(config, candidate) {
  const result = await appRequest(config, 'PATCH', `/api/bna/tasks/${candidate.task_id}`, candidate.patch);
  await appRequest(config, 'POST', `/api/bna/tasks/${candidate.task_id}/comments`, {
    body: [
      'Task title cleanup applied by scripts/task-title-cleanup-dry-run.mjs.',
      `Previous title preview: ${candidate.previous_title_preview}`,
      `New title: ${candidate.next_title || candidate.patch.title || '(unchanged)'}`,
      'Full raw operator wording was not copied into this comment.',
    ].join('\n'),
    author: 'task-title-cleanup',
    visibility: 'internal',
    source: 'system',
    source_context: { script: 'scripts/task-title-cleanup-dry-run.mjs' },
  });
  return result;
}

async function runTaskTitleCleanup(options = {}, config = loadConfig()) {
  const args = { ...parseArgs([]), writeReport: true, ...options };
  assertApplyConfirmed(args);
  let tasks = [];
  let liveTasksLoaded = false;
  if (args.tasksFile) {
    tasks = readTasksFile(args.tasksFile);
  } else if (!args.noLive) {
    tasks = await loadLiveTasks(config, { limit: args.limit });
    liveTasksLoaded = true;
  }

  const audit = buildTaskTitleCleanupAudit(tasks, { apply: args.apply, includeClosed: args.includeClosed });
  audit.live_tasks_loaded = liveTasksLoaded;
  audit.tasks_file = args.tasksFile || null;

  if (args.apply) {
    for (const candidate of audit.candidates) {
      const action = audit.actions.find((item) => item.task_id === candidate.task_id);
      try {
        await applyCandidate(config, candidate);
        action.ok = true;
        action.action = 'patched_task_title';
        action.message = `Patched fields: ${Object.keys(candidate.patch).join(', ')}`;
      } catch (error) {
        action.ok = false;
        action.action = 'patch_task_title_failed';
        action.message = error instanceof Error ? error.message : String(error);
      }
    }
  }

  if (args.writeReport !== false) {
    const reportPaths = writeReport(audit);
    audit.report = { md: relative(reportPaths.mdPath), json: relative(reportPaths.jsonPath) };
  } else {
    audit.report = null;
  }
  return audit;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const audit = await runTaskTitleCleanup(args);
  if (args.json) {
    console.log(JSON.stringify(audit, null, 2));
    return;
  }
  console.log([
    `Task title cleanup ${audit.dry_run ? 'dry-run' : 'apply'} complete.`,
    `Tasks scanned: ${audit.tasks_scanned}`,
    `Candidates: ${audit.candidate_count}`,
    `Report: ${audit.report?.md || 'not written'}`,
  ].join('\n'));
}

export {
  APPLY_CONFIRMATION,
  assertApplyConfirmed,
  buildTaskTitleCleanupAudit,
  buildTaskTitleCleanupCandidates,
  buildManualReviewCandidates,
  buildTaskTitleCleanupPlan,
  loadConfig,
  parseArgs,
  previewText,
  runTaskTitleCleanup,
  sanitizePatch,
  suggestedTitleNeedsManualReview,
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  });
}
