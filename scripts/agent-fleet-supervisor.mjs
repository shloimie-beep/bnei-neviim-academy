#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { buildQueueAudit, summarizeQueueHealthForStatus } from './lib/ops-queue-reconciler.mjs';
import hardening from '../src/lib/bna/agent-fleet-hardening.js';

const {
  AGENT_FLEET_PERMISSION_TIERS,
  buildStartupShortcutMatrix,
  classifyAgentFleetCommand,
  permissionTierLines,
  redactAgentFleetText,
} = hardening;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(repoRoot, '.runtime', 'agent-fleet');
const reportsDir = path.join(repoRoot, 'ops', 'agent-fleet-runs');
const changelogPath = path.join(repoRoot, 'ops', 'agent-changelog.md');
const ledgerPath = path.join(repoRoot, 'ops', 'agent-task-ledger.jsonl');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretsDir = path.join(repoRoot, '.secrets');
const supervisorLockPath = path.join(runtimeDir, 'supervisor.lock.json');
const statePath = path.join(runtimeDir, 'state.json');
const deployStatePath = path.join(runtimeDir, 'deploy-state.json');
const watchdogRuntimeDir = path.join(repoRoot, '.runtime', 'watchdog');
const watchdogLockPath = path.join(watchdogRuntimeDir, 'watchdog.lock.json');
const watchdogStatePath = path.join(watchdogRuntimeDir, 'state.json');
const systemAuditsDir = path.join(repoRoot, 'ops', 'system-audits');
const WATCHDOG_IMPROVEMENT_AUDIT_VERSION = 'watchdog-improvement-v1';
const SECRET_SCAN_ALLOWLIST_MARKER = 'watchdog-secret-scan: allow-placeholder';
const SECRET_SCAN_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/g,
  /\brailway_[A-Za-z0-9_-]{20,}\b/gi,
];

const LEGACY_DOC_FILES = [
  'README.md',
  'SETUP.md',
  'SPEC.md',
  'ARCHITECTURE.md',
  'DESIGN.md',
  'CLAUDE_CODE_PROMPT.md',
  'README-bundle.md',
  'WISHLIST.md',
];

const LEGACY_SURFACE_FILES = [
  // Source-tree paths only. Archived legacy code under docs/archive is
  // intentionally ignored so historical references do not keep reopening tasks.
  'src/app/page.tsx',
  'src/app/kid/[name]/page.tsx',
  'src/app/parent/page.tsx',
  'src/app/api/checkins/route.ts',
  'src/app/api/goals/route.ts',
  'src/app/api/meetings/route.ts',
  'src/app/api/consequences/route.ts',
  'src/app/api/cron/daily-summary/route.ts',
  'src/lib/ai/system-prompt.ts',
  'src/lib/ai/family-context.ts',
  'src/lib/telegram/auth.ts',
  'src/lib/telegram/messages.ts',
  'scripts/send-onboarding.mjs',
  'scripts/launch.mjs',
  'scripts/set-webhooks.mjs',
  'supabase-schema.sql',
  'supabase-migration-002.sql',
];

function nowIso() {
  return new Date().toISOString();
}

function localStamp(date = new Date()) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  const minutes = String(abs % 60).padStart(2, '0');
  return `${date.toISOString().replace(/\.\d{3}Z$/, '')}${sign}${hours}:${minutes}`;
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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function defaultCodexCommand(env = process.env) {
  if (process.platform !== 'win32') return 'codex';

  const localAppData = env.LOCALAPPDATA || process.env.LOCALAPPDATA || '';
  const binRoot = localAppData ? path.join(localAppData, 'OpenAI', 'Codex', 'bin') : '';
  if (binRoot && fs.existsSync(binRoot)) {
    const candidates = fs.readdirSync(binRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const exePath = path.join(binRoot, entry.name, 'codex.exe');
        if (!fs.existsSync(exePath)) return null;
        return { exePath, mtimeMs: fs.statSync(exePath).mtimeMs };
      })
      .filter(Boolean)
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
    if (candidates[0]?.exePath) return candidates[0].exePath;
  }

  return 'codex';
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function appendJsonl(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, `${JSON.stringify(value)}\n`);
}

function parseArgs(argv) {
  const args = {
    watch: false,
    once: false,
    status: false,
    watchdog: false,
    dryRun: false,
    maxTasks: null,
    noSmoke: false,
    noDeploy: false,
    noTelegram: false,
    noReconcile: false,
    noChatGptDropoff: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--watch') args.watch = true;
    else if (arg === '--once') args.once = true;
    else if (arg === '--status') args.status = true;
    else if (arg === '--watchdog') args.watchdog = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--no-smoke') args.noSmoke = true;
    else if (arg === '--no-deploy') args.noDeploy = true;
    else if (arg === '--no-telegram') args.noTelegram = true;
    else if (arg === '--no-reconcile') args.noReconcile = true;
    else if (arg === '--no-chatgpt-dropoff') args.noChatGptDropoff = true;
    else if (arg === '--max-tasks') args.maxTasks = Number(argv[++index] || 0);
    else if (arg.startsWith('--max-tasks=')) args.maxTasks = Number(arg.split('=').slice(1).join('=') || 0);
  }
  if (!args.watch && !args.status) args.once = true;
  return args;
}

function loadConfig() {
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  return {
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
    codexCommand: env.CODEX_CLI_COMMAND || defaultCodexCommand(env),
    codexModel: env.CODEX_CLI_MODEL || '',
    taskTimeoutMs: Number(env.AGENT_FLEET_TASK_TIMEOUT_MS || env.CODEX_BRIDGE_TIMEOUT_MS || 30 * 60 * 1000),
    verifyTimeoutMs: Number(env.AGENT_FLEET_VERIFY_TIMEOUT_MS || 8 * 60 * 1000),
    pollMs: Number(env.AGENT_FLEET_POLL_MS || 60 * 1000),
    maxRetries: Number(env.AGENT_FLEET_MAX_RETRIES || 2),
    openAiSmoke: String(env.AGENT_FLEET_OPENAI_SMOKE || '1') !== '0',
    verifyCommandsRaw: env.AGENT_FLEET_VERIFY_COMMANDS || '',
    autoDeploy: String(env.AGENT_FLEET_AUTO_DEPLOY || '0') === '1',
    deployCommand: env.AGENT_FLEET_DEPLOY_COMMAND || 'npm run railway:redeploy',
    deployDoctorCommand: env.AGENT_FLEET_DEPLOY_DOCTOR_COMMAND || 'npm run railway:doctor',
    deployTimeoutMs: Number(env.AGENT_FLEET_DEPLOY_TIMEOUT_MS || 15 * 60 * 1000),
    heartbeatMs: Number(env.AGENT_FLEET_HEARTBEAT_MS || 45 * 1000),
    telegramToken: readSecret('telegram-bot-token.txt') || env.TELEGRAM_BOT_TOKEN_BNA || env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: env.TELEGRAM_CHAT_ID_BNA || env.TELEGRAM_CHAT_ID || '',
    watchdogPollMs: Number(env.WATCHDOG_POLL_MS || env.AGENT_FLEET_WATCHDOG_POLL_MS || 60 * 1000),
    watchdogStaleTaskMs: Number(env.WATCHDOG_STALE_TASK_MS || 45 * 60 * 1000),
    watchdogAlertCooldownMs: Number(env.WATCHDOG_ALERT_COOLDOWN_MS || 30 * 60 * 1000),
    watchdogRepair: String(env.WATCHDOG_SOFT_REPAIR || '1') !== '0',
    watchdogImprovementAudit: String(env.WATCHDOG_IMPROVEMENT_AUDIT || '1') !== '0',
    watchdogImprovementIntervalMs: Number(env.WATCHDOG_IMPROVEMENT_INTERVAL_MS || 24 * 60 * 60 * 1000),
    watchdogImprovementMaxDecisions: Number(env.WATCHDOG_IMPROVEMENT_MAX_DECISIONS || 5),
    watchdogImprovementDedupeMs: Number(env.WATCHDOG_IMPROVEMENT_DEDUPE_MS || 14 * 24 * 60 * 60 * 1000),
    taskQueueReconcile: String(env.AGENT_FLEET_TASK_RECONCILE || '1') !== '0',
    chatGptDropoffIngest: String(env.AGENT_FLEET_CHATGPT_DROPOFF_INGEST || '1') !== '0',
    chatGptDropoffLimit: Number(env.AGENT_FLEET_CHATGPT_DROPOFF_LIMIT || 12),
    chatGptDropoffCommentCollect: String(env.AGENT_FLEET_CHATGPT_COMMENT_COLLECT || '1') !== '0',
    chatGptDropoffCommentLimit: Number(env.CHATGPT_DROPOFF_COMMENT_LIMIT || 40),
  };
}

function processIsAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(Number(pid), 0);
    return true;
  } catch {
    return false;
  }
}

function acquireSupervisorLock({ watch }) {
  ensureDir(runtimeDir);
  const existing = readJson(supervisorLockPath, null);
  if (existing?.pid && processIsAlive(existing.pid)) {
    throw new Error(`Agent fleet supervisor is already running as PID ${existing.pid}`);
  }
  writeJson(supervisorLockPath, {
    pid: process.pid,
    started_at: nowIso(),
    mode: watch ? 'watch' : 'once',
  });
}

function releaseSupervisorLock() {
  const existing = readJson(supervisorLockPath, null);
  if (Number(existing?.pid) === process.pid && fs.existsSync(supervisorLockPath)) {
    fs.unlinkSync(supervisorLockPath);
  }
}

function loadState() {
  return readJson(statePath, { updated_at: null, tasks: {}, runs: [] }) || { tasks: {}, runs: [] };
}

function saveState(state) {
  state.updated_at = nowIso();
  writeJson(statePath, state);
}

async function appRequest(config, method, endpoint, body = null) {
  if (!config.opsUsername || !config.opsPassword) {
    throw new Error('OPS_USERNAME/OPS_PASSWORD are required for agent fleet app access');
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
  if (!response.ok) {
    throw new Error(`${method} ${endpoint} failed ${response.status}: ${text.slice(0, 600)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function sendTelegram(config, text) {
  if (!config.telegramToken || !config.telegramChatId) return false;
  return sendTelegramToChat(config, config.telegramChatId, text);
}

async function sendTelegramToChat(config, chatId, text) {
  if (!config.telegramToken || !chatId) return false;
  const chunks = [];
  let remaining = String(text || '').trim();
  while (remaining.length > 3500) {
    const split = remaining.lastIndexOf('\n', 3400);
    const at = split > 1000 ? split : 3400;
    chunks.push(remaining.slice(0, at));
    remaining = remaining.slice(at).trim();
  }
  if (remaining) chunks.push(remaining);
  for (const chunk of chunks) {
    const response = await fetch(`https://api.telegram.org/bot${config.telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: chunk }),
    });
    const body = await response.json();
    if (!response.ok || !body.ok) {
      throw new Error(`Telegram send failed: ${JSON.stringify(body).slice(0, 500)}`);
    }
  }
  return true;
}

async function notifyAgentFleet(config, text, { chatId = '', label = 'agent notification' } = {}) {
  try {
    if (chatId) return await sendTelegramToChat(config, chatId, text);
    return await sendTelegram(config, text);
  } catch (error) {
    console.error(`Could not send ${label}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

function normalizeStage(stage) {
  const map = {
    inbox: 'raw_input',
    clarify: 'needs_decision',
    plan: 'needs_decision',
    execute: 'in_progress',
    review: 'needs_decision',
    complete: 'done',
  };
  return map[stage] || stage || 'raw_input';
}

function isActiveStage(stage) {
  return !['done', 'archive'].includes(normalizeStage(stage));
}

function isAgentOwnedTask(task) {
  return /codex|kimi|system|agent/i.test(String(task?.assigned_to || ''));
}

function taskTitle(task) {
  return String(task?.title || `Task #${task?.id || '?'}`).replace(/\s+/g, ' ').trim();
}

function taskReportTitle(task) {
  return buildTaskTitleRepair(task)?.next_title || taskTitle(task);
}

function parseTaskAiParsed(task) {
  const value = task?.ai_parsed;
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' ? value : {};
}

function taskOriginalText(task) {
  const parsed = parseTaskAiParsed(task);
  return String(parsed.original_text || parsed.raw_text || '').replace(/\s+/g, ' ').trim();
}

function isWatchdogImprovementDecision(task) {
  const parsed = parseTaskAiParsed(task);
  return parsed.kind === 'watchdog_improvement_decision' ||
    task?.source_context?.audit === 'improvement';
}

function taskSearchText(task) {
  const parsed = parseTaskAiParsed(task);
  return [
    taskTitle(task),
    taskOriginalText(task),
    task?.notes || '',
    parsed.display_title || '',
  ].join('\n').replace(/\s+/g, ' ').trim();
}

function taskWatchdogRepairSearchText(task) {
  const parsed = parseTaskAiParsed(task);
  return [
    taskTitle(task),
    taskOriginalText(task),
    parsed.display_title || '',
  ].join('\n').replace(/\s+/g, ' ').trim();
}

function taskStatusLine(task) {
  return `#${task.id} [${normalizeStage(task.stage)}] ${taskTitle(task).slice(0, 110)}`;
}

function observableJobStatusTitle(job = {}, tasks = []) {
  const linkedTaskId = Number(job.task_id || 0);
  const linkedTask = linkedTaskId
    ? tasks.find((task) => Number(task.id || task.task_id || 0) === linkedTaskId)
    : null;
  return String(linkedTask ? taskTitle(linkedTask) : job.title || job.task_title || '').slice(0, 110);
}

function urgencyRank(value) {
  return ({ urgent: 0, today: 1, this_week: 2, low: 3 })[String(value || '')] ?? 2;
}

function sortQueue(a, b) {
  const urgency = urgencyRank(a.urgency) - urgencyRank(b.urgency);
  if (urgency !== 0) return urgency;
  const inProgress = (normalizeStage(a.stage) === 'in_progress' ? 0 : 1) -
    (normalizeStage(b.stage) === 'in_progress' ? 0 : 1);
  if (inProgress !== 0) return inProgress;
  return Date.parse(a.created_at || 0) - Date.parse(b.created_at || 0);
}

async function loadTasks(config, { limit = null, search = '' } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (search) params.set('search', search);
  const query = params.toString();
  const data = await appRequest(config, 'GET', `/api/bna/tasks${query ? `?${query}` : ''}`);
  return Array.isArray(data.tasks) ? data.tasks : [];
}

async function loadTaskById(config, taskId) {
  const id = Number(taskId || 0);
  if (!Number.isFinite(id) || id <= 0) return null;
  const data = await appRequest(config, 'GET', `/api/bna/tasks/${id}`);
  return data.task || (data.id ? data : null);
}

async function loadAgentJobs(config, { status = 'queued', limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (limit) params.set('limit', String(limit));
  const data = await appRequest(config, 'GET', `/api/bna/agent-jobs?${params.toString()}`);
  return Array.isArray(data.jobs) ? data.jobs : [];
}

async function claimAgentJob(config, job) {
  return appRequest(config, 'POST', `/api/bna/agent-jobs/${job.id || job.job_id}/claim`, {
    owner: 'Codex',
  });
}

async function heartbeatAgentJob(config, job, metadata = {}) {
  if (!job?.id && !job?.job_id) return null;
  return appRequest(config, 'POST', `/api/bna/agent-jobs/${job.id || job.job_id}/heartbeat`, {
    summary: 'Codex fleet heartbeat.',
    metadata,
  });
}

async function completeAgentJob(config, job, payload = {}) {
  if (!job?.id && !job?.job_id) return null;
  return appRequest(config, 'POST', `/api/bna/agent-jobs/${job.id || job.job_id}/complete`, payload);
}

async function blockAgentJob(config, job, payload = {}) {
  if (!job?.id && !job?.job_id) return null;
  return appRequest(config, 'POST', `/api/bna/agent-jobs/${job.id || job.job_id}/block`, payload);
}

async function loadTaskComments(config, taskId, limit = 10) {
  const data = await appRequest(config, 'GET', `/api/bna/tasks/${taskId}/comments`);
  const comments = Array.isArray(data.comments) ? data.comments : [];
  return comments.slice(-limit);
}

async function reportRuntimeStatus(config, {
  status = 'running',
  mode = 'once',
  tasks = [],
  selected = [],
  currentTaskId = null,
  details = {},
} = {}) {
  try {
    const activeCodexTasks = tasks
      .filter((task) => isActiveStage(task.stage))
      .filter(isAgentOwnedTask);
    const lock = readJson(supervisorLockPath, null);
    await appRequest(config, 'POST', '/api/bna/agent-fleet/status', {
      agent_key: 'codex-fleet',
      status,
      pid: process.pid,
      mode,
      host: os.hostname(),
      started_at: lock?.started_at || null,
      stale_after_ms: Math.max(config.pollMs * 3, 180000),
      current_task_id: currentTaskId,
      queue_size: activeCodexTasks.length,
      ready_count: selected.length,
      details: {
        script: 'scripts/agent-fleet-supervisor.mjs',
        updated_at: nowIso(),
        ...details,
      },
    });
  } catch (error) {
    console.error(`Could not report agent runtime status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function taskLockPath(taskId) {
  return path.join(runtimeDir, `task-${taskId}.lock.json`);
}

function taskLockIsFresh(taskId, maxAgeMs) {
  const lock = readJson(taskLockPath(taskId), null);
  if (!lock) return false;
  const signalAt = lock.heartbeat_at || lock.started_at || 0;
  const ageMs = Date.now() - Date.parse(signalAt);
  if (lock.pid && processIsAlive(lock.pid) && Number.isFinite(ageMs) && ageMs >= 0 && ageMs < maxAgeMs) return true;
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs < maxAgeMs;
}

function acquireTaskLock(task, runId) {
  const stamp = nowIso();
  writeJson(taskLockPath(task.id), {
    task_id: task.id,
    run_id: runId,
    pid: process.pid,
    started_at: stamp,
    heartbeat_at: stamp,
    title: taskTitle(task),
  });
}

function refreshTaskLockHeartbeat(taskId, runId, details = {}) {
  const lockPath = taskLockPath(taskId);
  const lock = readJson(lockPath, null);
  if (!lock || Number(lock.pid) !== process.pid) return false;
  writeJson(lockPath, {
    ...lock,
    task_id: lock.task_id || taskId,
    run_id: lock.run_id || runId,
    pid: process.pid,
    heartbeat_at: nowIso(),
    heartbeat_details: {
      ...(lock.heartbeat_details || {}),
      ...details,
    },
  });
  return true;
}

function releaseTaskLock(taskId) {
  const lockPath = taskLockPath(taskId);
  const lock = readJson(lockPath, null);
  if (Number(lock?.pid) === process.pid && fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
}

function selectNextTasks(tasks, state, config, maxTasks = 1) {
  return tasks
    .filter((task) => isClaimableAgentTask(task, state, config))
    .sort(sortQueue)
    .slice(0, maxTasks);
}

function isClaimableAgentTask(task, state, config) {
  const freshMs = Math.max(config.taskTimeoutMs * 2, 45 * 60 * 1000);
  if (!isActiveStage(task.stage)) return false;
  if (!isAgentOwnedTask(task)) return false;
  if (isExplicitHumanReviewTask(task)) return false;
  if (normalizeStage(task.stage) === 'needs_decision') return false;
  if (task.decision_required) return false;
  if (taskLockIsFresh(task.id, freshMs)) return false;
  const record = state.tasks?.[task.id];
  return !(record?.blocked && Number(record?.attempts || 0) >= config.maxRetries);
}

function isExplicitHumanReviewTask(task) {
  const parsed = parseTaskAiParsed(task);
  return parsed.agent_executable === false ||
    parsed.needs_human_review === true ||
    (parsed.recording_review_task === true && parsed.payload?.needs_review === true);
}

function filterObservableJobsForClaim(jobs = [], tasks = [], state = { tasks: {} }, config = {}) {
  const claimableTaskIds = new Set(
    tasks
      .filter((task) => isClaimableAgentTask(task, state, config))
      .map((task) => Number(task.id))
      .filter(Number.isFinite)
  );
  return jobs.filter((job) => {
    const status = String(job.status || 'queued').toLowerCase();
    if (status !== 'queued') return false;
    const taskId = Number(job.task_id || job.taskId || 0);
    return Number.isFinite(taskId) && taskId > 0 && claimableTaskIds.has(taskId);
  });
}

function parseJsonish(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value || ''));
  } catch {
    return {};
  }
}

function taskMapById(tasks = []) {
  return new Map(
    tasks
      .map((task) => [Number(task?.id || 0), task])
      .filter(([id]) => Number.isFinite(id) && id > 0)
  );
}

function observableJobTask(job = {}, taskMap = new Map()) {
  const taskId = Number(job.task_id || job.taskId || 0);
  return taskMap.get(taskId) || null;
}

function isChatGptDropoffTask(task = {}) {
  const sourceContext = parseJsonish(task.source_context);
  const aiParsed = parseJsonish(task.ai_parsed);
  return String(task.source_channel || '').toLowerCase() === 'chatgpt_dropoff' ||
    String(task.created_by || '').toLowerCase() === 'chatgpt-dropoff-ingestor' ||
    String(task.author || '').toLowerCase() === 'chatgpt-dropoff-ingestor' ||
    String(sourceContext.source || '').toLowerCase() === 'chatgpt_dropoff_ingestor' ||
    Boolean(aiParsed.source_packet_id);
}

function observableJobSortTuple(job = {}, taskMap = new Map()) {
  const task = observableJobTask(job, taskMap) || {};
  const dropoffRank = isChatGptDropoffTask(task) ? 0 : 1;
  const urgency = urgencyRank(task.urgency);
  const createdAt = Date.parse(task.created_at || job.created_at || 0);
  const created = Number.isFinite(createdAt) ? createdAt : Number.MAX_SAFE_INTEGER;
  const id = Number(job.id || job.job_id || 0);
  return [dropoffRank, urgency, created, Number.isFinite(id) ? id : Number.MAX_SAFE_INTEGER];
}

function compareTuples(a = [], b = []) {
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function sortObservableJobsForClaim(jobs = [], tasks = []) {
  const taskMap = taskMapById(tasks);
  return [...jobs].sort((a, b) => compareTuples(
    observableJobSortTuple(a, taskMap),
    observableJobSortTuple(b, taskMap)
  ));
}

function observableJobTaskIdsMissingFromTasks(jobs = [], tasks = []) {
  const existingTaskIds = new Set(
    tasks
      .map((task) => Number(task?.id || 0))
      .filter((id) => Number.isFinite(id) && id > 0)
  );
  return [...new Set(
    jobs
      .map((job) => Number(job?.task_id || job?.taskId || 0))
      .filter((id) => Number.isFinite(id) && id > 0 && !existingTaskIds.has(id))
  )];
}

function mergeTasksById(...taskLists) {
  const byId = new Map();
  for (const tasks of taskLists) {
    for (const task of Array.isArray(tasks) ? tasks : []) {
      const id = Number(task?.id || 0);
      if (Number.isFinite(id) && id > 0) byId.set(id, task);
    }
  }
  return [...byId.values()];
}

async function hydrateObservableJobTasks(config, jobs = [], tasks = []) {
  const missingTaskIds = observableJobTaskIdsMissingFromTasks(jobs, tasks);
  const fetchedTasks = [];
  const errors = [];
  for (const taskId of missingTaskIds.slice(0, 50)) {
    try {
      // Observable jobs may point at tasks outside the default task-list window.
      // Fetch linked tasks directly so claim eligibility is based on the job's real task.
      // eslint-disable-next-line no-await-in-loop
      const task = await loadTaskById(config, taskId);
      if (task?.id) fetchedTasks.push(task);
      else errors.push({ task_id: taskId, message: 'Task endpoint returned no task.' });
    } catch (error) {
      errors.push({ task_id: taskId, message: error instanceof Error ? error.message : String(error) });
    }
  }
  return {
    tasks: mergeTasksById(tasks, fetchedTasks),
    fetchedTasks,
    missingTaskIds,
    errors,
  };
}

async function addTaskComment(config, taskId, body) {
  try {
    await appRequest(config, 'POST', `/api/bna/tasks/${taskId}/comments`, {
      body,
      author: 'agent-fleet',
      visibility: 'internal',
      source: 'system',
      source_context: { script: 'scripts/agent-fleet-supervisor.mjs' },
    });
  } catch (error) {
    console.error(`Could not add task comment for #${taskId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function patchTask(config, taskId, updates) {
  return appRequest(config, 'PATCH', `/api/bna/tasks/${taskId}`, updates);
}

function newestPendingBriefs(limit = 6) {
  const dir = path.join(repoRoot, 'tasks-pending');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const filePath = path.join(dir, name);
      return { name, filePath, mtimeMs: fs.statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, limit)
    .map((item) => `## ${relative(item.filePath)}\n${fs.readFileSync(item.filePath, 'utf8').slice(0, 2200)}`);
}

function readContextFile(relativePath, maxChars = 2500) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return `[missing ${relativePath}]`;
  return fs.readFileSync(filePath, 'utf8').slice(0, maxChars);
}

function formatTaskCommentsForPrompt(comments = []) {
  if (!comments.length) return '[none]';
  return comments.map((comment) => {
    const createdAt = comment.created_at || 'unknown time';
    const author = String(comment.author || 'comment').replace(/\s+/g, ' ').trim();
    const body = String(comment.body || '').trim().slice(0, 1200);
    return `- ${createdAt} ${author}: ${body}`;
  }).join('\n');
}

function buildTaskPrompt(task, attempt, comments = []) {
  const parsedTaskAi = (() => {
    try {
      return typeof task.ai_parsed === 'string' ? JSON.parse(task.ai_parsed) : task.ai_parsed;
    } catch {
      return {};
    }
  })();
  const sourceContext = (() => {
    try {
      return typeof task.source_context === 'string' ? JSON.parse(task.source_context) : task.source_context;
    } catch {
      return {};
    }
  })();
  const originalText = parsedTaskAi?.original_text || '';
  const taskWorkflow = String(parsedTaskAi?.workflow || parsedTaskAi?.action || sourceContext?.workflow || '').toLowerCase();
  const torahResearchInstructions = String(task.category || '') === 'torah_research'
    ? [
      '',
      'Torah Research instructions:',
      '- Research the question through Sefaria/source pages and include direct Sefaria links for every cited source.',
      '- Use the official Sefaria search API when useful: POST https://www.sefaria.org/api/search-wrapper.',
      '- Build a source map grouped by primary sources, Gemara/Rishonim/Acharonim/halacha codes/commentaries as relevant.',
      '- Summarize what each source says and where it is found.',
      '- Distinguish source research from final psak; flag unresolved points for Shloimie/rav review instead of presenting an automated ruling.',
      '- If a source cannot be verified on Sefaria, say that directly and do not invent a citation.',
      '',
    ]
    : [];
  const publicBibliographyInstructions = String(task.category || '') === 'content'
    && (
      taskWorkflow === 'public_content_bibliography'
      || /public content bibliography workflow|content-memory\/public-bibliographies/i.test(String(task.notes || ''))
    )
    ? [
      '',
      'Public content bibliography instructions:',
      '- Treat this as second-stage sourcing for parent-facing/public content, not a class worksheet/source-sheet task.',
      '- First identify claims that need backing, then attach actual books, Torah sources where relevant, and scientific or educational literature.',
      '- Include stable links when available: direct Sefaria URLs, DOI/PubMed/journal/publisher/university pages, or other credible source pages.',
      '- Store any produced markdown under content-memory/public-bibliographies/, not content-memory/source-sheets/.',
      '- Do not invent citations; mark unverified, anecdotal, opinion, or needs-review claims clearly.',
      '',
    ]
    : [];
  return [
    'You are Codex running as an autonomous BNA agent-fleet worker.',
    'Work inside this repository and complete the assigned task end-to-end when feasible.',
    '',
    'Safety rules:',
    '- Follow AGENTS.md and MEMORY.md.',
    '- Do not revert unrelated user changes.',
    '- Do not ask the operator for ordering confirmation.',
    '- If a real blocker or risky decision appears, stop and report it clearly.',
    '- Do not start long-lived foreground services; the supervisor owns background loops.',
    '- Run relevant checks yourself; the supervisor will run baseline verification afterward.',
    '- Do not mark the live task done yourself unless you already changed the system state intentionally; the supervisor will normally mark done after verification.',
    '- Permission tiers: Tier 0 read/audit/test/report; Tier 1 local code/branch/draft PR; Tier 2 merge/deploy/live smoke only through the parent release gate; Tier 3 sends, charges, DNS, credential/account changes, production mutation, Drive writes, public publishing, and class backfill are blocked without an explicit owner Decision.',
    '',
    `Task ID: ${task.id}`,
    `Attempt: ${attempt}`,
    `Title: ${taskReportTitle(task)}`,
    `Stage: ${normalizeStage(task.stage)}`,
    `Category: ${task.category || 'operations'}`,
    `Urgency: ${task.urgency || 'this_week'}`,
    `Project: ${task.project_short_name || task.project_name || task.project_key || 'BNA'}`,
    `Created: ${task.created_at || 'unknown'}`,
    ...torahResearchInstructions,
    ...publicBibliographyInstructions,
    '',
    'Task notes:',
    String(task.notes || '[none]').slice(0, 3500),
    '',
    'Recent task comments:',
    formatTaskCommentsForPrompt(comments),
    '',
    originalText ? `Original captured wording:\n${String(originalText).slice(0, 2200)}\n` : '',
    'Current source-of-truth context:',
    '## AGENTS.md',
    readContextFile('AGENTS.md', 2600),
    '',
    '## MEMORY.md',
    readContextFile('MEMORY.md', 2600),
    '',
    '## TASKS.md',
    readContextFile('TASKS.md', 2600),
    '',
    '## SYSTEM-STATE.md',
    readContextFile('SYSTEM-STATE.md', 2600),
    '',
    '## ops/agent-changelog.md tail',
    readContextFile('ops/agent-changelog.md', 2800).slice(-2800),
    '',
    'Newest internal Codex handoff files:',
    newestPendingBriefs().join('\n\n') || '[none]',
    '',
    'Required final format:',
    'STATUS: done | blocked | needs_decision',
    'SUMMARY: one short paragraph',
    'VERIFICATION: commands/tests you ran and results',
    'FILES: important files changed or inspected',
  ].filter(Boolean).join('\n');
}

function cleanProcessText(text) {
  return redactAgentFleetText(String(text || '')
    .replace(/\r/g, '')
    .replace(/\n*To resume this session:[^\n]*/g, '')
    .trim());
}

function summarizeAgentError(error, maxChars = 900) {
  const text = cleanProcessText(error instanceof Error ? error.message : String(error || ''));
  if (!text) return 'Unknown agent error';
  const usefulLines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^workdir:|^model:|^provider:|^approval:|^sandbox:|^session id:/i.test(line))
    .filter((line) => !/^[-]{4,}$/.test(line))
    .filter((line) => !/^user$/i.test(line))
    .filter((line) => !/^You are Codex running as an autonomous/i.test(line));
  const preferred = usefulLines.find((line) => /error|failed|timed out|blocked|cannot|missing|fatal/i.test(line))
    || usefulLines[0]
    || text;
  return preferred.length > maxChars ? `${preferred.slice(0, maxChars - 3).trim()}...` : preferred;
}

function runCodex(prompt, config, taskId) {
  ensureDir(runtimeDir);
  const lastMessagePath = path.join(runtimeDir, `task-${taskId}-${nowIso().replace(/[:.]/g, '-')}.last-message.txt`);
  const logPath = path.join(runtimeDir, `task-${taskId}-${nowIso().replace(/[:.]/g, '-')}.codex.log`);
  const args = [
    '--sandbox',
    'danger-full-access',
    '--ask-for-approval',
    'never',
  ];
  if (config.codexModel) args.push('--model', config.codexModel);
  args.push('exec', '-C', repoRoot, '--output-last-message', lastMessagePath, '-');

  return new Promise((resolve, reject) => {
    const child = spawn(config.codexCommand || 'codex', args, {
      cwd: repoRoot,
      windowsHide: true,
      shell: false,
      env: {
        ...process.env,
        PYTHONUTF8: '1',
        PYTHONIOENCODING: 'utf-8',
        LANG: 'C.UTF-8',
      },
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error(`Codex timed out after ${config.taskTimeoutMs}ms`));
    }, config.taskTimeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      fs.appendFileSync(logPath, chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      fs.appendFileSync(logPath, chunk);
    });
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const lastMessage = fs.existsSync(lastMessagePath)
        ? fs.readFileSync(lastMessagePath, 'utf8')
        : '';
      const cleanedLastMessage = cleanProcessText(lastMessage);
      const result = {
        code,
        stdout: cleanProcessText(stdout),
        stderr: cleanProcessText(stderr),
        lastMessage: cleanedLastMessage,
        lastMessagePath,
        logPath,
      };
      if (code === 0) {
        resolve(result);
        return;
      }
      const error = new Error(cleanProcessText(lastMessage || stderr || stdout || `Codex exited ${code}`));
      error.result = result;
      reject(error);
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

function splitVerifyCommands(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {}
  return raw.split(/\r?\n|;;/).map((item) => item.trim()).filter(Boolean);
}

function verificationCommands(config, { noSmoke }) {
  const custom = splitVerifyCommands(config.verifyCommandsRaw);
  if (custom?.length) return custom;
  const commands = [
    'node --check server.js',
    'node --check scripts/telegram-kimi-bridge.mjs',
    'node --check scripts/agent-fleet-supervisor.mjs',
    'npm test',
    'npm run watchdog:audit',
    'npm run watchdog:links',
    'npm run watchdog:actions',
    'npm run watchdog:security',
    'npm run watchdog:raw',
    'npm run watchdog:content',
    'npm run watchdog:communications',
    'npm run watchdog:ui',
    'npm run watchdog:visual',
  ];
  if (!noSmoke && config.openAiSmoke) commands.push('npm run openai:smoke');
  return commands;
}

function runShellCommand(command, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: repoRoot,
      shell: true,
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONUTF8: '1',
        PYTHONIOENCODING: 'utf-8',
        LANG: 'C.UTF-8',
      },
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        command,
        code,
        ok: code === 0 && !timedOut,
        timedOut,
        stdout: cleanProcessText(stdout).slice(-3000),
        stderr: cleanProcessText(stderr).slice(-3000),
      });
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        command,
        code: -1,
        ok: false,
        timedOut,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
      });
    });
  });
}

async function runVerification(config, options) {
  const results = [];
  for (const command of verificationCommands(config, options)) {
    console.log(`Verifying: ${command}`);
    // Verification commands intentionally run serially so failures are readable.
    // They are short baseline checks; task-specific checks are expected inside Codex.
    // eslint-disable-next-line no-await-in-loop
    results.push(await runShellCommand(command, config.verifyTimeoutMs));
    if (!results[results.length - 1].ok) break;
  }
  return results;
}

function summarizeVerification(results) {
  return results.map((result) => {
    const status = result.ok ? 'PASS' : 'FAIL';
    const detail = result.timedOut ? ' timed out' : result.code !== 0 ? ` exit ${result.code}` : '';
    return `- ${status} ${result.command}${detail}`;
  }).join('\n');
}

function normalizeRepoFile(file) {
  return String(file || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function parseFileList(output) {
  return String(output || '')
    .split(/\r?\n/)
    .map(normalizeRepoFile)
    .filter(Boolean);
}

function isDeployableFile(file) {
  const normalized = normalizeRepoFile(file);
  return [
    /^server\.js$/,
    /^package\.json$/,
    /^railway\.json$/,
    /^public\//,
    /^src\//,
    /^tasks-pending\//,
    /^agents\//,
    /^scripts\/railway-redeploy\.ps1$/,
  ].some((pattern) => pattern.test(normalized));
}

async function collectChangedFiles(timeoutMs) {
  const diffResult = await runShellCommand('git diff --name-only', timeoutMs);
  const untrackedResult = await runShellCommand('git ls-files --others --exclude-standard', timeoutMs);
  const files = new Set([
    ...parseFileList(diffResult.stdout),
    ...parseFileList(untrackedResult.stdout),
  ]);
  return {
    ok: diffResult.ok && untrackedResult.ok,
    files: [...files].sort(),
    inspection_results: [diffResult, untrackedResult],
  };
}

function deploymentFingerprint(files) {
  const hash = crypto.createHash('sha256');
  for (const file of files.map(normalizeRepoFile).sort()) {
    const absolute = path.join(repoRoot, file);
    hash.update(file);
    hash.update('\0');
    if (!fs.existsSync(absolute)) {
      hash.update('[missing]');
      hash.update('\0');
      continue;
    }
    const stat = fs.statSync(absolute);
    hash.update(stat.isFile() ? '[file]' : '[other]');
    hash.update('\0');
    if (stat.isFile()) hash.update(fs.readFileSync(absolute));
    hash.update('\0');
  }
  return hash.digest('hex');
}

async function runDeploymentIfNeeded(config, options) {
  const inspectionTimeoutMs = Math.min(config.verifyTimeoutMs, 60 * 1000);
  const changed = await collectChangedFiles(inspectionTimeoutMs);
  const deployableFiles = changed.files.filter(isDeployableFile);
  const result = {
    checked_at: nowIso(),
    ok: true,
    needed: deployableFiles.length > 0,
    skipped_reason: '',
    changed_files_count: changed.files.length,
    deployable_files: deployableFiles,
    inspection_results: changed.inspection_results,
    deployment_results: [],
    permission_gate: {
      deploy_command: classifyAgentFleetCommand(config.deployCommand),
      doctor_command: classifyAgentFleetCommand(config.deployDoctorCommand),
    },
  };

  if (!changed.ok) {
    result.ok = false;
    result.skipped_reason = 'could_not_inspect_git_changes';
    return result;
  }

  if (!deployableFiles.length) return result;

  if (result.permission_gate.deploy_command.blocked_by_default || result.permission_gate.doctor_command.blocked_by_default) {
    result.ok = false;
    result.skipped_reason = 'permission_tier_3_blocked';
    return result;
  }

  const fingerprint = deploymentFingerprint(deployableFiles);
  result.fingerprint = fingerprint;
  const deployState = readJson(deployStatePath, {}) || {};
  if (deployState.last_success_fingerprint === fingerprint) {
    result.needed = false;
    result.skipped_reason = 'already_deployed';
    return result;
  }

  if (!config.autoDeploy || options.noDeploy) {
    result.ok = false;
    result.skipped_reason = 'auto_deploy_disabled';
    return result;
  }

  const deployResult = await runShellCommand(config.deployCommand, config.deployTimeoutMs);
  result.deployment_results.push(deployResult);
  if (!deployResult.ok) {
    result.ok = false;
    return result;
  }

  const doctorResult = await runShellCommand(config.deployDoctorCommand, config.verifyTimeoutMs);
  result.deployment_results.push(doctorResult);
  result.ok = doctorResult.ok;

  if (result.ok) {
    writeJson(deployStatePath, {
      last_success_fingerprint: fingerprint,
      deployed_at: nowIso(),
      deployable_files: deployableFiles,
      deploy_command: config.deployCommand,
      doctor_command: config.deployDoctorCommand,
    });
  }

  return result;
}

function summarizeDeployment(deployment) {
  if (!deployment) return '- NOT RUN Deployment gate was not reached.';
  const files = deployment.deployable_files || [];
  const fileSummary = files.length
    ? files.slice(0, 12).join(', ') + (files.length > 12 ? `, and ${files.length - 12} more` : '')
    : 'none';
  const lines = [];
  if (!deployment.needed && deployment.skipped_reason === 'already_deployed') {
    lines.push('- PASS Deployable changes already match the last successful deployment.');
  } else if (!deployment.needed) {
    lines.push('- PASS No deployable app changes detected.');
  } else {
    lines.push(`- ${deployment.ok ? 'PASS' : 'FAIL'} Deployment gate for app-visible changes.`);
  }
  lines.push(`- Deployable files: ${fileSummary}`);
  if (deployment.skipped_reason) lines.push(`- Note: ${deployment.skipped_reason}`);
  for (const commandResult of deployment.deployment_results || []) {
    const status = commandResult.ok ? 'PASS' : 'FAIL';
    const detail = commandResult.timedOut ? ' timed out' : commandResult.code !== 0 ? ` exit ${commandResult.code}` : '';
    lines.push(`- ${status} ${commandResult.command}${detail}`);
  }
  return lines.join('\n');
}

function reportMarkdown(task, outcome) {
  return [
    `# Agent Fleet Run - Task #${task.id}`,
    '',
    `Generated: ${outcome.generated_at}`,
    `Outcome: ${outcome.ok ? 'PASS' : 'FAIL'}`,
    `Task: ${taskReportTitle(task)}`,
    '',
    '## Codex Result',
    '',
    '```text',
    String(outcome.codex_final || outcome.codex_error || '[none]').slice(0, 5000),
    '```',
    '',
    '## Verification',
    '',
    summarizeVerification(outcome.verification_results || []),
    '',
    '## Deployment Gate',
    '',
    summarizeDeployment(outcome.deployment_result),
    '',
    '## Files',
    '',
    outcome.codex_log ? `- Codex log: ${outcome.codex_log}` : '',
    outcome.codex_last_message ? `- Last message: ${outcome.codex_last_message}` : '',
  ].filter((line) => line !== '').join('\n');
}

function writeRunReport(task, outcome) {
  ensureDir(reportsDir);
  const stamp = outcome.generated_at.replace(/[:.]/g, '-');
  const base = `${stamp}-task-${task.id}`;
  const jsonPath = path.join(reportsDir, `${base}.json`);
  const mdPath = path.join(reportsDir, `${base}.md`);
  writeJson(jsonPath, outcome);
  fs.writeFileSync(mdPath, `${reportMarkdown(task, outcome)}\n`);
  return { jsonPath, mdPath };
}

function appendChangelog(task, outcome, reportPaths) {
  ensureDir(path.dirname(changelogPath));
  const title = outcome.ok
    ? `Complete agent task #${task.id}: ${taskReportTitle(task)}`
    : `Agent task #${task.id} blocked: ${taskReportTitle(task)}`;
  const body = [
    '',
    `## ${localStamp()} - ${title}`,
    '',
    outcome.ok
      ? 'The agent fleet claimed this Codex-owned task, ran Codex CLI, ran verification, then passed the deployment gate before marking the task done.'
      : 'The agent fleet claimed this Codex-owned task but did not mark it complete because Codex, verification, or the deployment gate failed.',
    '',
    'Codex result:',
    String(outcome.codex_final || outcome.codex_error || '[none]').slice(0, 1400),
    '',
    'Verification:',
    summarizeVerification(outcome.verification_results || []),
    '',
    'Deployment gate:',
    summarizeDeployment(outcome.deployment_result),
    '',
    `Report: ${relative(reportPaths.mdPath)}`,
    '',
    '- source: agent_fleet',
    '- worker: Codex',
    '',
  ].join('\n');
  fs.appendFileSync(changelogPath, body);
}

function appendLedger(task, outcome, reportPaths) {
  const recordedAt = localStamp();
  appendJsonl(ledgerPath, {
    recorded_at: recordedAt,
    event: outcome.ok ? 'agent_fleet_task_verified' : 'agent_fleet_task_blocked',
    source: 'agent_fleet',
    task_id: task.id,
    title: taskReportTitle(task),
    notes: `${outcome.ok ? 'Completed and verified' : 'Blocked or failed'} by agent fleet. Report: ${relative(reportPaths.mdPath)}`,
    stage: outcome.ok ? 'done' : 'needs_decision',
    category: task.category || 'operations',
    assigned_to: 'Codex',
  });
  appendJsonl(ledgerPath, {
    recorded_at: recordedAt,
    event: outcome.ok ? 'done' : 'blocked',
    source: 'agent_fleet',
    task_id: task.id,
    run_id: outcome.run_id || null,
    title: taskReportTitle(task),
    stage: outcome.ok ? 'done' : 'needs_decision',
    assigned_to: 'Codex',
    report_path: relative(reportPaths.mdPath),
    blocker: outcome.ok ? null : (outcome.codex_error || 'Verification, Codex, or deployment gate failed.'),
    summary: outcome.ok ? 'Completed and verified by agent fleet.' : 'Blocked or failed by agent fleet.',
  });
}

async function processTask(config, task, state, options) {
  const agentJob = options.agentJob || task.agent_job || null;
  const record = state.tasks[task.id] || { attempts: 0 };
  record.attempts = Number(record.attempts || 0) + 1;
  record.last_started_at = nowIso();
  record.blocked = false;
  state.tasks[task.id] = record;
  saveState(state);

  if (options.dryRun) {
    return {
      ok: true,
      dry_run: true,
      message: `Would process ${taskStatusLine(task)}`,
    };
  }

  const runId = `task-${task.id}-${nowIso().replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
  let heartbeatTimer = null;
  acquireTaskLock(task, runId);
  try {
  const startedAt = nowIso();
  const claimNote = `Agent fleet claimed this task at ${startedAt}. Attempt ${record.attempts}.`;
  console.log(claimNote);
  appendJsonl(ledgerPath, {
    recorded_at: startedAt,
    event: 'started',
    source: 'agent_fleet',
    task_id: task.id,
    run_id: runId,
    title: taskReportTitle(task),
    stage: 'in_progress',
    assigned_to: 'Codex',
  });
  await patchTask(config, task.id, {
    stage: 'in_progress',
    started_at: task.started_at || startedAt,
    assigned_to: 'Codex',
  });
  await addTaskComment(config, task.id, claimNote);
  if (agentJob) {
    try {
      await heartbeatAgentJob(config, agentJob, { phase: 'task_claimed', task_id: task.id });
    } catch (error) {
      console.error(`Could not heartbeat agent job #${agentJob.id || agentJob.job_id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  heartbeatTimer = setInterval(() => {
    refreshTaskLockHeartbeat(task.id, runId, { phase: 'running' });
    if (agentJob) {
      heartbeatAgentJob(config, agentJob, { phase: 'running', task_id: task.id, run_id: runId })
        .catch((error) => console.error(`Could not heartbeat agent job #${agentJob.id || agentJob.job_id}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }, Math.max(30 * 1000, Number(config.heartbeatMs || 45 * 1000)));
  heartbeatTimer.unref?.();

  let codexResult = null;
  let codexError = null;
  let verificationResults = [];
  let deploymentResult = null;
  let taskComments = [];
  try {
    try {
      taskComments = await loadTaskComments(config, task.id);
    } catch (error) {
      console.error(`Could not load task comments for #${task.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
    codexResult = await runCodex(buildTaskPrompt(task, record.attempts, taskComments), config, task.id);
    verificationResults = await runVerification(config, options);
  } catch (error) {
    codexError = error;
    if (error?.result) codexResult = error.result;
  }

  const verificationOk = verificationResults.length > 0 && verificationResults.every((result) => result.ok);
  if (!codexError && verificationOk) {
    try {
      deploymentResult = await runDeploymentIfNeeded(config, options);
    } catch (error) {
      deploymentResult = {
        checked_at: nowIso(),
        ok: false,
        needed: true,
        skipped_reason: `deployment_gate_exception: ${summarizeAgentError(error, 500)}`,
        changed_files_count: null,
        deployable_files: [],
        inspection_results: [],
        deployment_results: [],
      };
    }
  }
  const deploymentOk = deploymentResult ? deploymentResult.ok : true;
  const ok = !codexError && verificationOk && deploymentOk;
  const outcome = {
    generated_at: nowIso(),
    task_id: task.id,
    run_id: runId,
    ok,
    codex_exit_code: codexResult?.code ?? null,
    codex_final: codexResult?.lastMessage || codexResult?.stdout || '',
    codex_error: codexError ? summarizeAgentError(codexError, 1500) : '',
    codex_log: codexResult?.logPath ? relative(codexResult.logPath) : '',
    codex_last_message: codexResult?.lastMessagePath ? relative(codexResult.lastMessagePath) : '',
    verification_results: verificationResults,
    deployment_result: deploymentResult,
  };
  const reportPaths = writeRunReport(task, outcome);
  appendChangelog(task, outcome, reportPaths);
  appendLedger(task, outcome, reportPaths);

  record.last_finished_at = nowIso();
  record.last_report = relative(reportPaths.mdPath);
  record.last_ok = ok;
  record.blocked = !ok && record.attempts >= config.maxRetries;
  saveState(state);

  if (ok) {
    const reportPath = relative(reportPaths.mdPath);
    const now = nowIso();
    const proofLinks = [
      {
        label: 'Agent fleet report',
        kind: 'report',
        type: 'repo_path',
        repo_path: reportPath,
        path: reportPath,
        source: 'agent_fleet',
        status: 'valid',
        added_at: now,
        verified_at: now,
      },
      {
        label: 'Agent task ledger',
        kind: 'verification',
        type: 'repo_path',
        repo_path: 'ops/agent-task-ledger.jsonl',
        path: 'ops/agent-task-ledger.jsonl',
        source: 'agent_fleet',
        status: 'valid',
        added_at: now,
        verified_at: now,
      },
      {
        label: 'Agent changelog',
        kind: 'verification',
        type: 'repo_path',
        repo_path: 'ops/agent-changelog.md',
        path: 'ops/agent-changelog.md',
        source: 'agent_fleet',
        status: 'valid',
        added_at: now,
        verified_at: now,
      },
    ];
    const verificationNotes = [
      'Agent fleet completed, verified, and passed the deployment gate for this task.',
      summarizeVerification(verificationResults),
      summarizeDeployment(deploymentResult),
      `Report: ${reportPath}`,
    ].join('\n');
    await patchTask(config, task.id, {
      stage: 'done',
      completed_at: now,
      verified_at: now,
      verification_notes: verificationNotes.slice(0, 4000),
      workflow_status: 'done_with_report',
      status_detail: 'done_with_report',
      artifact_links: proofLinks,
      proof_links_json: proofLinks,
      done_link_status: 'done_with_report',
      proof_status: 'valid',
      done_link_checked_at: now,
      proof_checked_at: now,
    });
    await addTaskComment(config, task.id, verificationNotes);
    if (agentJob) {
      await completeAgentJob(config, agentJob, {
        summary: verificationNotes.slice(0, 4000),
        report_path: relative(reportPaths.mdPath),
        ledger_ref: 'ops/agent-task-ledger.jsonl',
        changelog_ref: 'ops/agent-changelog.md',
        result_payload: outcome,
      });
    }
    if (!options.noTelegram) {
      const message = [
        `Codex completed task #${task.id}${agentJob?.id || agentJob?.job_id ? ` / job #${agentJob.id || agentJob.job_id}` : ''}.`,
        taskReportTitle(task),
        '',
        summarizeVerification(verificationResults),
        '',
        summarizeDeployment(deploymentResult),
        '',
        `Report: ${relative(reportPaths.mdPath)}`,
      ].join('\n');
      await notifyAgentFleet(config, message, {
        chatId: agentJob?.source_chat_id || '',
        label: `completion notification for task #${task.id}`,
      });
    }
  } else {
    const exhausted = record.attempts >= config.maxRetries;
    const blockerNote = [
      `Agent fleet could not verify task #${task.id}.`,
      `Attempt ${record.attempts} of ${config.maxRetries}.`,
      codexError ? `Codex error: ${summarizeAgentError(codexError)}` : '',
      verificationResults.length ? summarizeVerification(verificationResults) : 'Verifier did not complete.',
      deploymentResult ? summarizeDeployment(deploymentResult) : '',
      `Report: ${relative(reportPaths.mdPath)}`,
      exhausted ? 'Marked as Needs Decision so it does not loop forever on the same failure.' : 'It will be retried by the fleet.',
    ].filter(Boolean).join('\n');
    await patchTask(config, task.id, exhausted
      ? {
        stage: 'needs_decision',
        decision_required: true,
        verification_notes: blockerNote.slice(0, 4000),
      }
      : {
        stage: 'assigned',
        verification_notes: blockerNote.slice(0, 4000),
      });
    await addTaskComment(config, task.id, blockerNote);
    if (agentJob) {
      await blockAgentJob(config, agentJob, {
        status: exhausted ? 'blocked_needs_human_decision' : 'failed',
        blocker: blockerNote.slice(0, 4000),
        summary: blockerNote.slice(0, 4000),
        report_path: relative(reportPaths.mdPath),
        ledger_ref: 'ops/agent-task-ledger.jsonl',
        changelog_ref: 'ops/agent-changelog.md',
        result_payload: outcome,
      });
    }
    if (!options.noTelegram) {
      await notifyAgentFleet(config, blockerNote, {
        chatId: agentJob?.source_chat_id || '',
        label: `blocker notification for task #${task.id}`,
      });
    }
  }

  return outcome;
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    refreshTaskLockHeartbeat(task.id, runId, { phase: 'finished' });
    releaseTaskLock(task.id);
  }
}

function acquireWatchdogLock({ watch }) {
  ensureDir(watchdogRuntimeDir);
  const existing = readJson(watchdogLockPath, null);
  if (existing?.pid && processIsAlive(existing.pid)) {
    throw new Error(`Agent watchdog is already running as PID ${existing.pid}`);
  }
  writeJson(watchdogLockPath, {
    pid: process.pid,
    started_at: nowIso(),
    mode: watch ? 'watch' : 'once',
  });
}

function releaseWatchdogLock() {
  const existing = readJson(watchdogLockPath, null);
  if (Number(existing?.pid) === process.pid && fs.existsSync(watchdogLockPath)) {
    fs.unlinkSync(watchdogLockPath);
  }
}

function loadWatchdogState() {
  return readJson(watchdogStatePath, { updated_at: null, tasks: {}, railway: {} }) || { tasks: {}, railway: {} };
}

function saveWatchdogState(state) {
  state.updated_at = nowIso();
  writeJson(watchdogStatePath, state);
}

function simplifiedWatchdogFindings(audit) {
  return (audit.findings || []).map((finding) => ({
    severity: finding.severity,
    type: finding.type,
    message: finding.message,
    task_ids: finding.task_ids || [],
    lock: finding.lock || '',
    railway_status: finding.railway_status || '',
  }));
}

function watchdogIncidentSignature(audit, repairs = []) {
  return JSON.stringify({
    severity: audit.severity,
    findings: simplifiedWatchdogFindings(audit).map((finding) => ({
      severity: finding.severity,
      type: finding.type,
      task_ids: finding.task_ids,
      lock: finding.lock,
      railway_status: finding.railway_status,
    })),
    repairs: repairs.map((repair) => ({
      task_id: repair.task_id,
      action: repair.action,
      ok: repair.ok,
    })),
  });
}

function watchdogNotificationSignature(audit, repairs = [], event = 'active', previousIncident = null) {
  if (event === 'resolved') {
    return JSON.stringify({
      event,
      previous_signature: previousIncident?.signature || '',
    });
  }
  return JSON.stringify({
    event: 'active',
    severity: audit.severity,
    findings: simplifiedWatchdogFindings(audit).map((finding) => ({
      severity: finding.severity,
      type: finding.type,
      task_ids: finding.task_ids,
      lock: finding.lock,
    })),
    repairs: repairs.map((repair) => ({
      task_id: repair.task_id,
      action: repair.action,
      ok: repair.ok,
    })),
  });
}

function watchdogFindingLines(findings) {
  if (!findings?.length) return ['- No findings.'];
  return findings.map((finding) => {
    const taskText = finding.task_ids?.length ? ` Tasks: ${finding.task_ids.join(', ')}.` : '';
    const railwayText = finding.railway_status ? ` Railway: ${finding.railway_status}.` : '';
    return `- [${finding.severity}] ${finding.type}: ${finding.message}${taskText}${railwayText}`;
  });
}

function watchdogRepairLines(repairs) {
  if (!repairs?.length) return ['- No soft repairs applied.'];
  return repairs.map((repair) => `- Task #${repair.task_id || 'n/a'}: ${repair.action}${repair.ok ? '' : ` failed (${repair.error || 'unknown error'})`}`);
}

function appendWatchdogIncidentChangelog({ audit, repairs, reportPaths, event, previousIncident = null }) {
  ensureDir(path.dirname(changelogPath));
  const title = event === 'resolved'
    ? 'Watchdog incident resolved'
    : event === 'changed'
      ? `Watchdog incident changed to ${String(audit.severity || 'unknown').toUpperCase()}`
      : `Watchdog incident opened as ${String(audit.severity || 'unknown').toUpperCase()}`;
  const previousLines = previousIncident?.findings?.length
    ? [
      '',
      'Previous findings:',
      ...watchdogFindingLines(previousIncident.findings),
    ]
    : [];
  const body = [
    '',
    `## ${localStamp(new Date(audit.audit_finished_at || Date.now()))} - ${title}`,
    '',
    event === 'resolved'
      ? `The watchdog returned to OK after a ${String(previousIncident?.severity || 'non-ok').toUpperCase()} incident.`
      : 'The watchdog recorded a non-OK audit and added this changelog trail so the warning is visible outside the raw audit files.',
    ...previousLines,
    '',
    'Current findings:',
    ...watchdogFindingLines(simplifiedWatchdogFindings(audit)),
    '',
    'Soft repairs:',
    ...watchdogRepairLines(repairs),
    '',
    `Report: ${relative(reportPaths.mdPath)}`,
    '',
    '- source: watchdog',
    '- worker: Codex',
    '',
  ].join('\n');
  fs.appendFileSync(changelogPath, body);
}

function appendWatchdogIncidentLedger({ audit, repairs, reportPaths, event, previousIncident = null }) {
  appendJsonl(ledgerPath, {
    recorded_at: localStamp(new Date(audit.audit_finished_at || Date.now())),
    event: event === 'resolved' ? 'watchdog_incident_resolved' : event === 'changed' ? 'watchdog_incident_changed' : 'watchdog_incident_opened',
    source: 'watchdog',
    title: event === 'resolved'
      ? 'Watchdog incident resolved'
      : `Watchdog incident ${event}: ${String(audit.severity || 'unknown').toUpperCase()}`,
    notes: event === 'resolved'
      ? `Watchdog returned to OK after previous ${previousIncident?.severity || 'non-ok'} incident.`
      : `Watchdog recorded ${audit.severity} findings: ${simplifiedWatchdogFindings(audit).map((finding) => finding.type).join(', ') || 'none'}.`,
    stage: event === 'resolved' ? 'done' : audit.severity,
    category: 'operations',
    assigned_to: 'Codex',
    report: relative(reportPaths.mdPath),
    findings: simplifiedWatchdogFindings(audit),
    repairs: repairs.map((repair) => ({ task_id: repair.task_id, action: repair.action, ok: repair.ok })),
  });
}

function syncWatchdogIncidentState(audit, repairs, reportPaths, args) {
  if (args.dryRun) {
    return { event: null, previousIncident: null, pendingResolution: null };
  }
  const state = loadWatchdogState();
  const previousIncident = state.current_incident_signature
    ? {
      signature: state.current_incident_signature,
      severity: state.current_incident_severity || 'unknown',
      opened_at: state.current_incident_opened_at || null,
      last_seen_at: state.current_incident_last_seen_at || null,
      findings: state.current_incident_findings || [],
      report: state.current_incident_report || null,
    }
    : null;
  const pendingResolution = state.pending_resolution_notification || null;

  if (audit.severity === 'ok' && !repairs.length) {
    let resolution = pendingResolution;
    if (previousIncident) {
      appendWatchdogIncidentChangelog({ audit, repairs, reportPaths, event: 'resolved', previousIncident });
      appendWatchdogIncidentLedger({ audit, repairs, reportPaths, event: 'resolved', previousIncident });
      resolution = {
        previous_incident: previousIncident,
        resolved_at: audit.audit_finished_at,
        report: relative(reportPaths.mdPath),
      };
      state.pending_resolution_notification = resolution;
    }
    delete state.current_incident_signature;
    delete state.current_incident_severity;
    delete state.current_incident_opened_at;
    delete state.current_incident_last_seen_at;
    delete state.current_incident_findings;
    delete state.current_incident_report;
    state.last_ok_at = audit.audit_finished_at;
    saveWatchdogState(state);
    return resolution
      ? {
        event: 'resolved',
        previousIncident: resolution.previous_incident || null,
        pendingResolution: resolution,
      }
      : { event: null, previousIncident: null, pendingResolution: null };
  }

  const signature = watchdogIncidentSignature(audit, repairs);
  const event = !previousIncident ? 'opened' : previousIncident.signature === signature ? null : 'changed';
  if (event) {
    appendWatchdogIncidentChangelog({ audit, repairs, reportPaths, event, previousIncident });
    appendWatchdogIncidentLedger({ audit, repairs, reportPaths, event, previousIncident });
  }
  state.current_incident_signature = signature;
  state.current_incident_severity = audit.severity;
  state.current_incident_opened_at = previousIncident?.opened_at || audit.audit_finished_at;
  state.current_incident_last_seen_at = audit.audit_finished_at;
  state.current_incident_findings = simplifiedWatchdogFindings(audit);
  state.current_incident_report = relative(reportPaths.mdPath);
  saveWatchdogState(state);
  return {
    event,
    previousIncident,
    pendingResolution: null,
    signature,
  };
}

function readTextTail(filePath, maxChars = 6000) {
  if (!fs.existsSync(filePath)) return '';
  const text = fs.readFileSync(filePath, 'utf8');
  return text.length > maxChars ? text.slice(-maxChars) : text;
}

function inspectRuntimeLock(name, filePath) {
  const lock = readJson(filePath, null);
  const pid = lock?.pid ? Number(lock.pid) : null;
  const running = Boolean(pid && processIsAlive(pid));
  return {
    name,
    file: relative(filePath),
    exists: Boolean(lock),
    pid,
    mode: lock?.mode || null,
    started_at: lock?.started_at || lock?.startedAt || null,
    running,
    stale_lock: Boolean(lock && pid && !running),
  };
}

function inspectTelegramBridgeLock() {
  const lock = inspectRuntimeLock('Academy Telegram bridge', path.join(repoRoot, '.runtime', 'telegram-kimi-bridge.lock'));
  const lockData = readJson(path.join(repoRoot, '.runtime', 'telegram-kimi-bridge.lock'), {}) || {};
  const logTail = [
    readTextTail(path.join(repoRoot, '.runtime', 'telegram-kimi-bridge.out.log'), 50000),
    readTextTail(path.join(repoRoot, '.runtime', 'telegram-kimi-bridge.log'), 50000),
  ].filter(Boolean).join('\n');
  const expectedBotPattern = /Bot=bneineviimacademy_bot|bneineviimacademy_bot|Profile=BNA academy/i;
  const lockProfileOk = /BNA academy/i.test(String(lockData.profile || ''));
  const lockBotOk = /bneineviimacademy_bot/i.test([
    lockData.bot_username,
    lockData.academy_bot_username,
  ].filter(Boolean).join(' '));
  const identityOk = (lockProfileOk && lockBotOk) || expectedBotPattern.test(logTail);
  return {
    ...lock,
    expected_bot: 'bneineviimacademy_bot',
    bot_ok: !lock.running || !logTail || identityOk,
    profile: lockData.profile || null,
    bot_username: lockData.bot_username || null,
    log_hint: logTail.split(/\r?\n/).slice(-6).join('\n'),
  };
}

function looksRawRambleTitle(task) {
  const title = taskTitle(task);
  const rawPattern = /\b(umm+|uh+|you know|basically|okay so|ok so|can you just|i need you|i want you|what in the world|i don't know|like i|so i just|telegram bot|definitely fix up that thing|nothing gets messed up|too many things at once|doesn(?:'|\u2019)?t fix everything|fix everything|super professional|change log)\b/i;
  const connectiveCount = (title.match(/\b(and|but|so|because|cuz|then|also)\b/gi) || []).length;
  return rawPattern.test(title) ||
    (title.length > 160 && /\b(i|me|my|you|your|we|our)\b/i.test(title)) ||
    (title.length > 120 && connectiveCount >= 4);
}

function looksWatchdogWarningRepairRequest(task) {
  if (isWatchdogImprovementDecision(task)) return false;
  const lower = taskWatchdogRepairSearchText(task).toLowerCase();
  const mentionsWatchdog = /\b(watch\s*dogs?|watchdog|warning|warnings|critical warnings|visible ramble|raw[- ]?looking|natural[- ]language|change log|changelog)\b/.test(lower);
  const asksForRepair = /\b(auto[- ]?fix|fix(?:es|ed|ing)?|repair|clean|reroute|route|put this|move|change)\b/.test(lower);
  const taskOrDashboard = /\b(task|tasks|dashboard|title|titles|changelog|change log|codex|agent|queue|lane)\b/.test(lower);
  return mentionsWatchdog && asksForRepair && taskOrDashboard;
}

function fallbackProfessionalTitle(task) {
  const text = (taskOriginalText(task) || taskTitle(task))
    .replace(/\b(umm+|uh+|you know|basically|okay so|ok so|yeah|right|just|like)\b/gi, ' ')
    .replace(/\b(can you|could you|i need you to|i want you to|you need to|please)\b/gi, ' ')
    .replace(/\b(i don't know|what in the world)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  const firstClause = text
    .split(/\s+(?:and also|also|but|because|cuz|so then|so if)\s+/i)[0]
    .replace(/[.?!:,;]+$/g, '')
    .trim();
  if (!firstClause) return '';
  const titled = firstClause.charAt(0).toUpperCase() + firstClause.slice(1);
  return titled.slice(0, 120).trim();
}

function buildTaskTitleRepair(task) {
  const title = taskTitle(task);
  if (!looksRawRambleTitle(task) && !looksWatchdogWarningRepairRequest(task)) return null;

  const lower = taskSearchText(task).toLowerCase();
  let nextTitle = '';
  if (looksWatchdogWarningRepairRequest(task)) {
    nextTitle = 'Add watchdog soft repair for obvious task warnings';
  } else if (/\btoo many things at once\b|\bdoesn(?:'|\u2019)?t fix everything\b|\bfix everything\b.*\btoo many things\b|\btoo many things\b.*\bfix everything\b/.test(lower)) {
    nextTitle = 'Split oversized operator requests into focused execution packets';
  } else if (/\b(dot org|public website|operations app|check mark|website not safe|unsecured|dns|certificate)\b/.test(lower)) {
    nextTitle = 'Verify public website routing and DNS security follow-up';
  } else if (/\b(telegram|bot)\b/.test(lower) && /\b(button|buttons|quick action|mine|urgent|done)\b/.test(lower)) {
    nextTitle = 'Remove Telegram task quick-action buttons';
  } else if (/\bnatural[- ]language\b/.test(lower) && /\btask|dashboard|title\b/.test(lower)) {
    nextTitle = 'Clean raw natural-language wording from the Tasks dashboard';
  } else {
    nextTitle = fallbackProfessionalTitle(task);
  }

  nextTitle = String(nextTitle || '').replace(/\s+/g, ' ').trim();
  if (!nextTitle || nextTitle === title || looksRawRambleTitle({ title: nextTitle })) return null;

  const patch = { title: nextTitle };
  if (looksWatchdogWarningRepairRequest(task)) {
    patch.category = 'operations';
    patch.assigned_to = 'Codex';
    patch.decision_required = false;
    if (!['in_progress', 'done', 'archive'].includes(normalizeStage(task.stage))) {
      patch.stage = 'assigned';
    }
  }

  return {
    task_id: task.id,
    previous_title: title,
    next_title: nextTitle,
    action: 'clean_raw_visible_title',
    patch,
  };
}

function buildWatchdogRoutingRepair(task) {
  if (!looksWatchdogWarningRepairRequest(task)) return null;
  if (isAgentOwnedTask(task) && normalizeStage(task.stage) !== 'needs_decision' && !task.decision_required) return null;

  const titleRepair = buildTaskTitleRepair(task);
  return {
    task_id: task.id,
    previous_title: taskTitle(task),
    next_title: titleRepair?.next_title || taskTitle(task),
    action: 'route_watchdog_warning_task_to_codex',
    patch: {
      ...(titleRepair?.patch || {}),
      assigned_to: 'Codex',
      category: 'operations',
      decision_required: false,
      stage: ['in_progress', 'done', 'archive'].includes(normalizeStage(task.stage)) ? normalizeStage(task.stage) : 'assigned',
    },
  };
}

function taskAgeMs(task) {
  const stamp = task.started_at || task.updated_at || task.created_at;
  const parsed = Date.parse(stamp || 0);
  if (!Number.isFinite(parsed)) return null;
  return Date.now() - parsed;
}

function tailContainsTask(filePath, taskId) {
  if (!fs.existsSync(filePath)) return false;
  const tail = fs.readFileSync(filePath, 'utf8');
  const id = String(taskId);
  return tail.includes(`"task_id":${id}`) ||
    tail.includes(`"task_id": ${id}`) ||
    tail.includes(`task #${id}`) ||
    tail.includes(`task \`#${id}\``) ||
    tail.includes(`#${id}`);
}

function parseRailwayStatus(text) {
  const statuses = [...String(text || '').matchAll(/\bStatus:\s*([A-Z_ -]+)/gi)].map((match) => match[1].trim());
  return statuses.length ? statuses[statuses.length - 1] : '';
}

function normalizeRailwayStatus(status) {
  return String(status || '').trim().replace(/\s+/g, '_').toUpperCase();
}

function classifyRailwayDoctorResult(result) {
  const combined = `${result?.stdout || ''}\n${result?.stderr || ''}`.trim();
  const railwayStatus = normalizeRailwayStatus(parseRailwayStatus(combined));
  const transient = new Set(['BUILDING', 'DEPLOYING', 'INITIALIZING', 'REMOVING']).has(railwayStatus);
  const failedStatus = new Set(['FAILED', 'CRASHED', 'REMOVED']).has(railwayStatus);
  const explicitFailure = /\b(deployment|doctor|railway)\b[^\n]*\bfailed\b|\bfailed\b[^\n]*\b(deployment|doctor|railway)\b/i.test(combined);
  const commandFailed = !result?.ok || Boolean(result?.timedOut);
  const warning = commandFailed || failedStatus || explicitFailure;

  return {
    ok: !warning,
    status: railwayStatus || (result?.ok ? 'unknown' : 'doctor_error'),
    warning,
    transient,
    command: result?.command || '',
    code: result?.code ?? null,
    timed_out: Boolean(result?.timedOut),
    output_tail: combined.slice(-2500),
  };
}

async function inspectRailwayDoctor(config) {
  const result = await runShellCommand(config.deployDoctorCommand, Math.min(config.deployTimeoutMs, 120000));
  return classifyRailwayDoctorResult(result);
}

function severityFromFindings(findings) {
  if (findings.some((finding) => finding.severity === 'critical')) return 'critical';
  if (findings.some((finding) => finding.severity === 'warn')) return 'warn';
  return 'ok';
}

function addFinding(findings, severity, type, message, data = {}) {
  findings.push({ severity, type, message, ...data });
}

function readRepoText(relativePath, maxChars = 1000000) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return '';
  const stat = fs.statSync(filePath);
  if (stat.size > maxChars) return '';
  return fs.readFileSync(filePath, 'utf8');
}

function firstPatternLine(text, patterns) {
  const lines = String(text || '').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (patterns.some((pattern) => new RegExp(pattern.source, pattern.flags.replace(/g/g, '')).test(line))) {
      return {
        line: index + 1,
        excerpt: line.replace(/\s+/g, ' ').trim().slice(0, 180),
      };
    }
  }
  return null;
}

function collectPatternEvidence(relativePaths, patterns, limit = 8) {
  const evidence = [];
  for (const relativePath of relativePaths) {
    const text = readRepoText(relativePath);
    if (!text) continue;
    const count = patterns.reduce((sum, pattern) => {
      const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
      return sum + ([...text.matchAll(new RegExp(pattern.source, flags))].length || 0);
    }, 0);
    if (!count) continue;
    const firstLine = firstPatternLine(text, patterns);
    evidence.push({
      file: relativePath,
      count,
      line: firstLine?.line || null,
      excerpt: firstLine?.excerpt || '',
    });
    if (evidence.length >= limit) break;
  }
  return evidence;
}

function secretScanLineMatches(line, patterns = SECRET_SCAN_PATTERNS) {
  const matches = [];
  for (const pattern of patterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const matcher = new RegExp(pattern.source, flags);
    for (const match of String(line || '').matchAll(matcher)) {
      matches.push(match[0]);
    }
  }
  return matches;
}

function isLowEntropyPlaceholderSecret(value) {
  const body = String(value || '')
    .replace(/^sk-/i, '')
    .replace(/^gh[pousr]_/i, '')
    .replace(/^railway_/i, '')
    .replace(/^\d{7,12}:/, '')
    .replace(/[_-]/g, '');
  if (body.length < 20) return false;
  const unique = new Set(body.toLowerCase().split(''));
  return unique.size <= 3;
}

function isNonSensitiveSecretScanPlaceholder(value) {
  const normalized = String(value || '').toLowerCase();
  return (
    /(redacted|placeholder|example|dummy|fake|sample)/.test(normalized) ||
    isLowEntropyPlaceholderSecret(value)
  );
}

function isAllowlistedSecretScanLine(line, matches = secretScanLineMatches(line)) {
  const text = String(line || '');
  return (
    text.includes(SECRET_SCAN_ALLOWLIST_MARKER) &&
    matches.length > 0 &&
    matches.every((value) => isNonSensitiveSecretScanPlaceholder(value))
  );
}

function collectSecretEvidenceFromText(relativePath, text, patterns = SECRET_SCAN_PATTERNS) {
  const lines = String(text || '').split(/\r?\n/);
  let count = 0;
  let firstLine = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const matches = secretScanLineMatches(line, patterns);
    if (!matches.length || isAllowlistedSecretScanLine(line, matches)) continue;
    count += matches.length;
    if (!firstLine) {
      firstLine = {
        line: index + 1,
        excerpt: line.replace(/\s+/g, ' ').trim().slice(0, 180),
      };
    }
  }

  if (!count) return null;
  return {
    file: relativePath,
    count,
    line: firstLine?.line || null,
    excerpt: firstLine?.excerpt
      ? firstLine.excerpt.replace(/[A-Za-z0-9_-]{12,}/g, '[redacted]')
      : 'token-shaped text detected',
  };
}

function watchdogImprovementSignature(id) {
  return `${WATCHDOG_IMPROVEMENT_AUDIT_VERSION}:${id}`;
}

function baseImprovementFinding(id, data) {
  return {
    id,
    signature: watchdogImprovementSignature(id),
    severity: data.severity || 'improvement',
    category: data.category || 'operations',
    task_category: data.task_category || data.category || 'operations',
    urgency: data.urgency || 'this_week',
    title: data.title,
    decision_title: data.decision_title || data.title,
    message: data.message || '',
    evidence: data.evidence || [],
    options: data.options || [],
  };
}

function codexOption(label, value, patch = {}) {
  return {
    label,
    value,
    patch: {
      stage: 'assigned',
      assigned_to: 'Codex',
      decision_required: false,
      ...patch,
    },
  };
}

function collectWatchdogImprovementFindings() {
  const findings = [];
  const legacyPatterns = [
    /Family Accountability/i,
    /Dratler family/i,
    /family-accountability/i,
    /Ahuva/i,
    /Menachem and Esther/i,
    /two kids/i,
  ];
  const legacyDocEvidence = collectPatternEvidence(LEGACY_DOC_FILES, legacyPatterns);
  if (legacyDocEvidence.length) {
    findings.push(baseImprovementFinding('stale_legacy_docs', {
      category: 'docs',
      task_category: 'operations',
      title: 'Replace stale family-app docs with current BNA documentation',
      decision_title: 'Decide how to replace stale BNA docs',
      message: 'Root documentation still describes the old family accountability app instead of the current BNA school/operator system.',
      evidence: legacyDocEvidence,
      options: [
        codexOption('Option A', 'Rewrite current docs around BNA and clearly mark legacy docs.', {
          title: 'Rewrite stale root docs for BNA',
          category: 'operations',
        }),
        codexOption('Option B', 'Add legacy banners only, then rewrite docs in a later cleanup pass.', {
          title: 'Add legacy banners to stale family-app docs',
          category: 'operations',
        }),
        codexOption('Option C', 'Archive old family docs into a legacy folder and create a compact BNA README.', {
          title: 'Archive legacy family docs and add compact BNA README',
          category: 'operations',
        }),
      ],
    }));
  }

  const legacySurfaceEvidence = collectPatternEvidence(LEGACY_SURFACE_FILES, legacyPatterns, 10);
  if (legacySurfaceEvidence.length) {
    findings.push(baseImprovementFinding('legacy_family_runtime_surfaces', {
      category: 'organization',
      task_category: 'technology',
      title: 'Choose cleanup scope for dormant family-app code paths',
      decision_title: 'Decide how to handle dormant family-app code',
      message: 'Dormant Next/Supabase/Telegram family-app code paths still exist and can mislead future agents or become risky if reused.',
      evidence: legacySurfaceEvidence,
      options: [
        codexOption('Option A', 'Add guards and legacy labels first; avoid runtime refactors in this pass.', {
          title: 'Guard and label dormant family-app code paths',
          category: 'technology',
        }),
        codexOption('Option B', 'Archive dormant family-app code after confirming current Express routes do not import it.', {
          title: 'Archive dormant family-app code after import audit',
          category: 'technology',
        }),
        codexOption('Option C', 'Leave code in place but create a detailed migration map before touching it.', {
          title: 'Map dormant family-app code before cleanup',
          category: 'technology',
        }),
      ],
    }));
  }

  const operationsHtml = readRepoText('public/operations.html');
  if (/renderMetricButton\('Urgent \/ Today'/.test(operationsHtml) && /renderSectionNav\(tabsWithCounts\(TASK_SUBTABS/.test(operationsHtml)) {
    findings.push(baseImprovementFinding('task_filter_visibility_drift', {
      category: 'visibility',
      task_category: 'operations',
      title: 'Remove duplicate large Tasks metric cards',
      decision_title: 'Decide compact Tasks filter cleanup',
      message: 'Tasks currently has compact lane counts plus a duplicate large overview metric-card row before the actual task list.',
      evidence: [
        { file: 'public/operations.html', count: 1, line: null, excerpt: "renderMetricButton('Urgent / Today') and TASK_SUBTABS lane counts both exist." },
      ],
      options: [
        codexOption('Option A', 'Remove the large metric-card row and rely on lane buttons plus compact filter chips.', {
          title: 'Remove duplicate Tasks overview metric cards',
          category: 'operations',
        }),
        codexOption('Option B', 'Keep one compact current-view strip and remove only the duplicate Urgent/Decision/Queue cards.', {
          title: 'Replace Tasks metric cards with compact current-view strip',
          category: 'operations',
        }),
      ],
    }));
  }

  const taskApp = readRepoText('src/app/operations/components/TaskApp.tsx');
  if (taskApp && operationsHtml && /getTasks\(\)/.test(taskApp) && /function renderTasks\(\)/.test(operationsHtml)) {
    findings.push(baseImprovementFinding('duplicate_task_ui_surfaces', {
      category: 'organization',
      task_category: 'technology',
      title: 'Label or archive duplicate task UI surfaces',
      decision_title: 'Decide what to do with duplicate task UIs',
      message: 'The repo contains a dormant React TaskApp surface and a separate live-looking public Operations task renderer, which can cause agents to edit the wrong UI.',
      evidence: [
        { file: 'src/app/operations/components/TaskApp.tsx', count: 1, line: null, excerpt: 'React TaskApp reads local task store.' },
        { file: 'public/operations.html', count: 1, line: null, excerpt: 'Inline Operations renderer contains the active task dashboard functions.' },
      ],
      options: [
        codexOption('Option A', 'Mark the React TaskApp as legacy/dormant and point agents to the live Operations surface.', {
          title: 'Label dormant React TaskApp as legacy',
          category: 'technology',
        }),
        codexOption('Option B', 'Archive the dormant React task UI after confirming it is not deployed.', {
          title: 'Archive dormant React task UI',
          category: 'technology',
        }),
      ],
    }));
  }

  const secretEvidence = scanTrackedTextForSecrets();
  if (secretEvidence.length) {
    findings.push(baseImprovementFinding('possible_tracked_secret_material', {
      severity: 'security',
      category: 'security',
      task_category: 'technology',
      urgency: 'today',
      title: 'Review possible tracked secret material',
      decision_title: 'Review possible tracked secret material',
      message: 'A deterministic scan found token-shaped strings in repo text files. The watchdog redacts values and only reports file evidence.',
      evidence: secretEvidence,
      options: [
        codexOption('Option A', 'Audit the flagged files, rotate any real secrets, and replace them with placeholders.', {
          title: 'Audit and remove possible tracked secrets',
          category: 'technology',
          urgency: 'today',
        }),
        codexOption('Option B', 'Verify these are placeholders or logs and add scanner allowlist comments where appropriate.', {
          title: 'Verify watchdog secret-scan findings',
          category: 'technology',
        }),
      ],
    }));
  }

  const publicDataEvidence = scanPublicDataForPrivateMarkers();
  if (publicDataEvidence.length) {
    findings.push(baseImprovementFinding('public_data_private_marker_drift', {
      severity: 'security',
      category: 'security',
      task_category: 'technology',
      urgency: 'today',
      title: 'Review public data files for private/admin markers',
      decision_title: 'Review public/private data boundary',
      message: 'Public data files contain private/admin/accounting-looking markers and should be reviewed against BNA public/private boundary rules.',
      evidence: publicDataEvidence,
      options: [
        codexOption('Option A', 'Audit the public data files and remove or move private fields to protected APIs.', {
          title: 'Audit public data privacy boundary',
          category: 'technology',
          urgency: 'today',
        }),
        codexOption('Option B', 'Confirm the fields are safe public metadata and document the rule.', {
          title: 'Document public data privacy rule',
          category: 'operations',
        }),
      ],
    }));
  }

  return findings;
}

function scanTrackedTextForSecrets() {
  const ignoredDirs = new Set(['.git', '.runtime', '.secrets', 'node_modules', 'renders', 'screenshots']);
  const ignoredFiles = new Set(['package-lock.json', 'lighthouse-report.html']);
  const allowedExts = new Set(['.js', '.mjs', '.ts', '.tsx', '.html', '.md', '.json', '.sql', '.ps1', '.css', '.env', '.txt', '.csv']);
  const evidence = [];

  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') && !['.env.example'].includes(entry.name) && entry.isDirectory()) continue;
      const fullPath = path.join(dir, entry.name);
      const rel = relative(fullPath);
      if (entry.isDirectory()) {
        if (ignoredDirs.has(entry.name) || rel.startsWith('public/images/') || rel.startsWith('public/video-edit-assets/') || rel.startsWith('ops/agent-fleet-runs/')) continue;
        visit(fullPath);
        if (evidence.length >= 8) return;
        continue;
      }
      if (ignoredFiles.has(entry.name)) continue;
      if (!allowedExts.has(path.extname(entry.name).toLowerCase())) continue;
      let text = '';
      try {
        const stat = fs.statSync(fullPath);
        if (stat.size > 500000) continue;
        text = fs.readFileSync(fullPath, 'utf8');
      } catch {
        continue;
      }
      const secretEvidence = collectSecretEvidenceFromText(rel, text);
      if (!secretEvidence) continue;
      evidence.push(secretEvidence);
      if (evidence.length >= 8) return;
    }
  };

  visit(repoRoot);
  return evidence;
}

function scanPublicDataForPrivateMarkers() {
  const candidates = ['public/data/website-blog-posts.json', 'public/data/learning-moments.json'];
  const patterns = [
    /private admin/i,
    /admin[-_ ]only/i,
    /green_invoice/i,
    /payment_status/i,
    /accountability_event/i,
    /student_goal/i,
  ];
  return collectPatternEvidence(candidates, patterns, 8);
}

function watchdogImprovementShouldRun(state, config, args = {}, now = new Date()) {
  if (!config.watchdogImprovementAudit) return false;
  if (args.dryRun) return true;
  const improvements = state.improvements || {};
  const lastRunAt = Date.parse(improvements.last_run_at || 0);
  if (!Number.isFinite(lastRunAt)) return true;
  return now.getTime() - lastRunAt >= Math.max(config.watchdogImprovementIntervalMs || 0, 1);
}

function activeTaskHasImprovementSignature(task, signature) {
  if (!isActiveStage(task.stage)) return false;
  const parsed = parseTaskAiParsed(task);
  return parsed.signature === signature ||
    parsed.watchdog_signature === signature ||
    String(task.notes || '').includes(signature);
}

function selectWatchdogImprovementFindingsForCreation(findings, tasks, state, config, now = new Date()) {
  const improvements = state.improvements || {};
  const records = improvements.findings || {};
  const selected = [];
  const skipped = [];
  const max = Math.max(Number(config.watchdogImprovementMaxDecisions || 0), 0);
  for (const finding of findings) {
    const activeTask = tasks.find((task) => activeTaskHasImprovementSignature(task, finding.signature));
    if (activeTask) {
      skipped.push({ signature: finding.signature, reason: 'active_task', task_id: activeTask.id, title: finding.title });
      continue;
    }
    const record = records[finding.signature] || {};
    const lastCreatedAt = Date.parse(record.last_created_at || 0);
    if (
      Number.isFinite(lastCreatedAt) &&
      now.getTime() - lastCreatedAt < Math.max(config.watchdogImprovementDedupeMs || 0, 1)
    ) {
      skipped.push({ signature: finding.signature, reason: 'state_cooldown', task_id: record.last_created_task_id || null, title: finding.title });
      continue;
    }
    if (selected.length >= max) {
      skipped.push({ signature: finding.signature, reason: 'daily_limit', title: finding.title });
      continue;
    }
    selected.push(finding);
  }
  return { selected, skipped };
}

function watchdogImprovementNotes(finding, reportRelativePath = '') {
  const evidenceLines = finding.evidence.length
    ? finding.evidence.map((item) => `- ${item.file}${item.line ? `:${item.line}` : ''} (${item.count} hit${item.count === 1 ? '' : 's'}): ${item.excerpt || 'evidence detected'}`)
    : ['- No file evidence recorded.'];
  const optionLines = finding.options.length
    ? finding.options.map((option) => `- ${option.label}: ${option.value}`)
    : ['- No options were generated.'];
  return [
    finding.message,
    '',
    `Watchdog signature: ${finding.signature}`,
    reportRelativePath ? `Report: ${reportRelativePath}` : '',
    '',
    'Evidence:',
    ...evidenceLines,
    '',
    'Options:',
    ...optionLines,
  ].filter((line) => line !== '').join('\n');
}

function buildWatchdogImprovementDecisionPayload(finding, reportRelativePath = '') {
  return {
    title: finding.decision_title,
    notes: watchdogImprovementNotes(finding, reportRelativePath),
    stage: 'needs_decision',
    category: finding.task_category || 'operations',
    urgency: finding.urgency || 'this_week',
    assigned_to: 'Shloimie',
    decision_required: true,
    source: 'manual',
    created_by: 'watchdog',
    author: 'watchdog',
    project: 'bna',
    source_context: {
      source: 'watchdog',
      audit: 'improvement',
      signature: finding.signature,
      report: reportRelativePath || null,
    },
    ai_parsed: {
      parser: WATCHDOG_IMPROVEMENT_AUDIT_VERSION,
      kind: 'watchdog_improvement_decision',
      signature: finding.signature,
      category: finding.category,
      display_title: finding.decision_title,
      original_text: finding.message,
      options: finding.options,
      evidence: finding.evidence,
      report: reportRelativePath || null,
    },
  };
}

async function createWatchdogImprovementDecision(config, finding, reportRelativePath) {
  const payload = buildWatchdogImprovementDecisionPayload(finding, reportRelativePath);
  const result = await appRequest(config, 'POST', '/api/bna/tasks', payload);
  return result.task || result;
}

function watchdogImprovementReportMarkdown(audit, createdDecisions = [], skipped = []) {
  const lines = [
    `# Watchdog Improvement Audit - ${localStamp(new Date(audit.audit_finished_at))}`,
    '',
    `Dry run: ${audit.dry_run ? 'yes' : 'no'}`,
    `Findings: ${audit.findings.length}`,
    `Selected for Decisions: ${audit.selected.length}`,
    '',
    '## Findings',
  ];
  if (!audit.findings.length) {
    lines.push('- No improvement findings detected.');
  } else {
    for (const finding of audit.findings) {
      lines.push(`- [${finding.category}] ${finding.title} (${finding.signature})`);
      if (finding.evidence?.length) {
        const evidence = finding.evidence.slice(0, 3).map((item) => `${item.file}${item.line ? `:${item.line}` : ''}`).join(', ');
        lines.push(`  Evidence: ${evidence}`);
      }
    }
  }
  if (createdDecisions.length) {
    lines.push('', '## Decisions Created');
    for (const decision of createdDecisions) {
      lines.push(`- Task #${decision.task_id}: ${decision.title} (${decision.signature})`);
    }
  }
  if (skipped.length) {
    lines.push('', '## Skipped/Deduped');
    for (const item of skipped) {
      lines.push(`- ${item.signature}: ${item.reason}${item.task_id ? ` via task #${item.task_id}` : ''}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

function writeWatchdogImprovementReport(audit, createdDecisions = [], skipped = []) {
  ensureDir(systemAuditsDir);
  const stamp = audit.audit_finished_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(systemAuditsDir, `${stamp}-watchdog-improvements.json`);
  const mdPath = path.join(systemAuditsDir, `${stamp}-watchdog-improvements.md`);
  writeJson(jsonPath, { audit, created_decisions: createdDecisions, skipped });
  fs.writeFileSync(mdPath, watchdogImprovementReportMarkdown(audit, createdDecisions, skipped));
  return { jsonPath, mdPath };
}

async function maybeRunWatchdogImprovementAudit(config, args) {
  const state = loadWatchdogState();
  if (!watchdogImprovementShouldRun(state, config, args)) {
    return { ran: false, reason: 'not_due' };
  }

  let tasks = [];
  const findings = collectWatchdogImprovementFindings();
  const skipped = [];
  try {
    tasks = await loadTasks(config);
  } catch (error) {
    skipped.push({
      signature: 'task_api_unavailable',
      reason: `task_api_unavailable: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  const selection = selectWatchdogImprovementFindingsForCreation(findings, tasks, state, config);
  skipped.push(...selection.skipped);

  const audit = {
    audit_started_at: nowIso(),
    audit_finished_at: nowIso(),
    dry_run: Boolean(args.dryRun),
    version: WATCHDOG_IMPROVEMENT_AUDIT_VERSION,
    findings,
    selected: selection.selected.map((finding) => ({
      signature: finding.signature,
      title: finding.title,
      category: finding.category,
    })),
  };
  const reportPaths = writeWatchdogImprovementReport(audit, [], skipped);
  const reportRelativePath = relative(reportPaths.mdPath);
  const createdDecisions = [];

  if (!args.dryRun) {
    for (const finding of selection.selected) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const task = await createWatchdogImprovementDecision(config, finding, reportRelativePath);
        createdDecisions.push({
          task_id: task.id,
          title: task.title || finding.decision_title,
          signature: finding.signature,
        });
        appendJsonl(ledgerPath, {
          recorded_at: localStamp(new Date()),
          event: 'watchdog_improvement_decision_created',
          source: 'watchdog',
          task_id: task.id,
          title: task.title || finding.decision_title,
          notes: finding.message,
          stage: 'needs_decision',
          category: finding.task_category || 'operations',
          assigned_to: 'Shloimie',
          decision_required: true,
          signature: finding.signature,
          report: reportRelativePath,
        });
      } catch (error) {
        skipped.push({
          signature: finding.signature,
          reason: `create_failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }

  if (createdDecisions.length || skipped.length) {
    writeJson(reportPaths.jsonPath, { audit, created_decisions: createdDecisions, skipped });
    fs.writeFileSync(reportPaths.mdPath, watchdogImprovementReportMarkdown(audit, createdDecisions, skipped));
  }

  if (!args.dryRun) {
    const nextState = loadWatchdogState();
    nextState.improvements = nextState.improvements || {};
    nextState.improvements.last_run_at = audit.audit_finished_at;
    nextState.improvements.last_report = reportRelativePath;
    nextState.improvements.findings = nextState.improvements.findings || {};
    for (const finding of findings) {
      const created = createdDecisions.find((decision) => decision.signature === finding.signature);
      nextState.improvements.findings[finding.signature] = {
        ...(nextState.improvements.findings[finding.signature] || {}),
        first_seen_at: nextState.improvements.findings[finding.signature]?.first_seen_at || audit.audit_finished_at,
        last_seen_at: audit.audit_finished_at,
        title: finding.title,
        last_report: reportRelativePath,
        ...(created ? { last_created_at: audit.audit_finished_at, last_created_task_id: created.task_id } : {}),
      };
    }
    saveWatchdogState(nextState);
  }

  return {
    ran: true,
    audit,
    created_decisions: createdDecisions,
    skipped,
    report: {
      md: reportRelativePath,
      json: relative(reportPaths.jsonPath),
    },
  };
}

async function buildWatchdogAudit(config, args) {
  const auditStartedAt = nowIso();
  const state = loadWatchdogState();
  let tasks = [];
  let apiStatus = null;
  let railway = null;
  const findings = [];

  try {
    tasks = await loadTasks(config);
  } catch (error) {
    addFinding(findings, 'critical', 'tasks_unavailable', `Task API unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    apiStatus = await appRequest(config, 'GET', '/api/bna/agent-fleet/status');
  } catch (error) {
    addFinding(findings, 'critical', 'status_api_unavailable', `Agent fleet status API unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    railway = await inspectRailwayDoctor(config);
    if (railway.warning) {
      addFinding(findings, railway.ok ? 'warn' : 'critical', 'railway_doctor_warning', `Railway doctor reports ${railway.status || 'a warning'}.`, { railway_status: railway.status });
    }
  } catch (error) {
    addFinding(findings, 'warn', 'railway_doctor_error', `Railway doctor could not run: ${error instanceof Error ? error.message : String(error)}`);
  }

  const locks = {
    agent_fleet: inspectRuntimeLock('Codex agent fleet', supervisorLockPath),
    watchdog: inspectRuntimeLock('Agent watchdog', watchdogLockPath),
    telegram_bridge: inspectTelegramBridgeLock(),
    rabbi_bridge: inspectRuntimeLock('Rabbi Telegram bridge', path.join(repoRoot, '.runtime', 'telegram-kimi-bridge-rabbi-elie-scheller.lock')),
  };

  for (const lock of Object.values(locks)) {
    if (lock.stale_lock) {
      addFinding(findings, 'warn', 'stale_lock', `${lock.name} lock exists but PID ${lock.pid} is not alive.`, { lock: lock.file });
    }
  }
  if (locks.telegram_bridge.running && !locks.telegram_bridge.bot_ok) {
    addFinding(findings, 'critical', 'telegram_wrong_profile', 'Academy Telegram bridge is running, but recent logs do not confirm the Academy bot/profile.', {
      expected_bot: locks.telegram_bridge.expected_bot,
    });
  }

  const activeTasks = tasks.filter((task) => isActiveStage(task.stage));
  const machineTasks = activeTasks.filter(isAgentOwnedTask);
  const inProgressMachine = machineTasks.filter((task) => normalizeStage(task.stage) === 'in_progress');
  if (inProgressMachine.length > 1) {
    addFinding(findings, 'critical', 'machine_task_conflict', 'Multiple machine-owned tasks are in progress at the same time.', {
      task_ids: inProgressMachine.map((task) => task.id),
    });
  }

  const staleTasks = [];
  for (const task of inProgressMachine) {
    const ageMs = taskAgeMs(task);
    const hasFreshLock = taskLockIsFresh(task.id, Math.max(config.taskTimeoutMs * 2, config.watchdogStaleTaskMs));
    if (ageMs !== null && ageMs > config.watchdogStaleTaskMs && !hasFreshLock) {
      staleTasks.push({ ...task, watchdog_age_ms: ageMs });
    }
  }
  if (staleTasks.length) {
    addFinding(findings, 'warn', 'stale_in_progress_tasks', 'Machine-owned tasks are stale and have no fresh task lock.', {
      task_ids: staleTasks.map((task) => task.id),
    });
  }

  const rawTitleTasks = activeTasks.filter(looksRawRambleTitle);
  if (rawTitleTasks.length) {
    addFinding(findings, 'warn', 'raw_ramble_titles', 'Visible task titles appear to contain raw ramble language.', {
      task_ids: rawTitleTasks.slice(0, 12).map((task) => task.id),
    });
  }

  const misroutedWatchdogTasks = activeTasks
    .filter(looksWatchdogWarningRepairRequest)
    .filter((task) => !isAgentOwnedTask(task) || normalizeStage(task.stage) === 'needs_decision' || task.decision_required);
  if (misroutedWatchdogTasks.length) {
    addFinding(findings, 'warn', 'watchdog_task_misrouted', 'Watchdog cleanup tasks should be owned by Codex unless they need a real operator decision.', {
      task_ids: misroutedWatchdogTasks.slice(0, 12).map((task) => task.id),
    });
  }

  const untrailedAgentTasks = inProgressMachine.filter((task) => {
    const hasLock = taskLockIsFresh(task.id, Math.max(config.taskTimeoutMs * 2, config.watchdogStaleTaskMs));
    const hasLedger = tailContainsTask(ledgerPath, task.id);
    const hasChangelog = tailContainsTask(changelogPath, task.id);
    return !hasLock && !hasLedger && !hasChangelog;
  });
  if (untrailedAgentTasks.length) {
    addFinding(findings, 'warn', 'agent_task_without_trail', 'Agent-owned in-progress tasks have no fresh lock, ledger, or changelog trail.', {
      task_ids: untrailedAgentTasks.map((task) => task.id),
    });
  }

  const doneMachineTasksMissingVerification = tasks
    .filter((task) => isAgentOwnedTask(task))
    .filter((task) => normalizeStage(task.stage) === 'done' || task.completed_at || task.verified_at)
    .filter((task) => !task.verified_at && !tailContainsTask(changelogPath, task.id))
    .slice(0, 20);
  if (doneMachineTasksMissingVerification.length) {
    addFinding(findings, 'warn', 'done_without_verification_trail', 'Completed machine tasks are missing an obvious verification/changelog trail.', {
      task_ids: doneMachineTasksMissingVerification.map((task) => task.id),
    });
  }

  const repeatedFailureTasks = machineTasks.filter((task) => Number(state.tasks?.[task.id]?.stale_requeues || 0) >= config.maxRetries);
  if (repeatedFailureTasks.length) {
    addFinding(findings, 'warn', 'repeated_watchdog_repairs', 'Some machine tasks have already been repaired repeatedly and should be escalated if they stall again.', {
      task_ids: repeatedFailureTasks.map((task) => task.id),
    });
  }

  const severity = severityFromFindings(findings);
  return {
    ok: severity === 'ok',
    severity,
    audit_started_at: auditStartedAt,
    audit_finished_at: nowIso(),
    dry_run: Boolean(args.dryRun),
    runtime: {
      host: os.hostname(),
      pid: process.pid,
      mode: args.watch ? 'watch' : 'once',
    },
    locks,
    queue: {
      active_tasks: activeTasks.length,
      machine_tasks: machineTasks.length,
      in_progress_machine_tasks: inProgressMachine.length,
      stale_tasks: staleTasks.map((task) => ({
        id: task.id,
        title: taskTitle(task),
        stage: normalizeStage(task.stage),
        assigned_to: task.assigned_to || null,
        age_minutes: Math.round(task.watchdog_age_ms / 60000),
      })),
      raw_title_tasks: rawTitleTasks.slice(0, 25).map((task) => ({
        id: task.id,
        title: taskTitle(task).slice(0, 220),
        suggested_title: buildTaskTitleRepair(task)?.next_title || null,
      })),
      misrouted_watchdog_tasks: misroutedWatchdogTasks.slice(0, 25).map((task) => ({
        id: task.id,
        title: taskTitle(task).slice(0, 220),
        assigned_to: task.assigned_to || null,
        suggested_title: buildWatchdogRoutingRepair(task)?.next_title || null,
      })),
      untrailed_agent_tasks: untrailedAgentTasks.map((task) => ({ id: task.id, title: taskTitle(task) })),
      done_without_verification_trail: doneMachineTasksMissingVerification.map((task) => ({ id: task.id, title: taskTitle(task) })),
    },
    api_status: apiStatus,
    railway,
    findings,
  };
}

async function applyWatchdogSoftRepairs(config, audit, args) {
  const repairs = [];
  if (args.dryRun || !config.watchdogRepair) return repairs;
  const state = loadWatchdogState();

  const repairedTaskIds = new Set();
  const titleRepairs = [
    ...(audit.queue.raw_title_tasks || []),
    ...(audit.queue.misrouted_watchdog_tasks || []),
  ];
  for (const repairTask of titleRepairs) {
    if (repairedTaskIds.has(repairTask.id)) continue;
    repairedTaskIds.add(repairTask.id);
    try {
      const allTasks = await loadTasks(config);
      const liveTask = allTasks.find((task) => Number(task.id) === Number(repairTask.id));
      if (!liveTask || !isActiveStage(liveTask.stage)) continue;
      const repair = buildWatchdogRoutingRepair(liveTask) || buildTaskTitleRepair(liveTask);
      if (!repair?.patch || !Object.keys(repair.patch).length) continue;
      await patchTask(config, liveTask.id, {
        ...repair.patch,
        verification_notes: `Watchdog soft repair: ${repair.action.replace(/_/g, ' ')}. Previous visible title: "${repair.previous_title.slice(0, 180)}".`,
      });
      await addTaskComment(config, liveTask.id, [
        `Watchdog soft repair applied: ${repair.action.replace(/_/g, ' ')}.`,
        `Previous visible title: ${repair.previous_title}`,
        `New visible title: ${repair.next_title}`,
        'Raw operator wording remains preserved in task provenance.',
      ].join('\n'));
      appendJsonl(ledgerPath, {
        at: nowIso(),
        source: 'watchdog',
        type: repair.action,
        task_id: liveTask.id,
        previous_title: repair.previous_title,
        title: repair.next_title,
      });
      repairs.push({ task_id: liveTask.id, action: repair.action, ok: true, title: repair.next_title });
    } catch (error) {
      repairs.push({
        task_id: repairTask.id,
        action: 'watchdog_warning_repair_failed',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const stale of audit.queue.stale_tasks || []) {
    const record = state.tasks[stale.id] || { stale_requeues: 0 };
    record.stale_requeues = Number(record.stale_requeues || 0) + 1;
    record.last_repaired_at = nowIso();
    state.tasks[stale.id] = record;
    const exhausted = record.stale_requeues > config.maxRetries;
    const body = exhausted
      ? `Watchdog escalated task #${stale.id} after ${record.stale_requeues} stale in-progress checks. It needs a human decision before agents retry.`
      : `Watchdog requeued stale machine task #${stale.id}. It had no fresh task lock after about ${stale.age_minutes} minutes.`;
    try {
      await patchTask(config, stale.id, exhausted
        ? {
          stage: 'needs_decision',
          decision_required: true,
          verification_notes: body,
        }
        : {
          stage: 'assigned',
          verification_notes: body,
        });
      await addTaskComment(config, stale.id, body);
      appendJsonl(ledgerPath, {
        at: nowIso(),
        source: 'watchdog',
        type: exhausted ? 'watchdog_task_escalated' : 'watchdog_task_requeued',
        task_id: stale.id,
        title: stale.title,
        repair_count: record.stale_requeues,
      });
      repairs.push({ task_id: stale.id, action: exhausted ? 'escalated_to_needs_decision' : 'requeued_to_assigned', ok: true });
    } catch (error) {
      repairs.push({
        task_id: stale.id,
        action: exhausted ? 'escalate_failed' : 'requeue_failed',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  saveWatchdogState(state);
  return repairs;
}

function watchdogReportMarkdown(audit, repairs) {
  const lines = [
    `# Agent Watchdog Audit - ${localStamp(new Date(audit.audit_finished_at))}`,
    '',
    `Severity: ${audit.severity.toUpperCase()}`,
    `Dry run: ${audit.dry_run ? 'yes' : 'no'}`,
    '',
    '## Runtime Locks',
  ];
  for (const lock of Object.values(audit.locks || {})) {
    lines.push(`- ${lock.name}: ${lock.running ? `running PID ${lock.pid}` : lock.exists ? `stale/missing process PID ${lock.pid || 'unknown'}` : 'no lock'} (${lock.file})`);
  }
  lines.push('', '## Queue Health');
  lines.push(`- Active tasks: ${audit.queue.active_tasks}`);
  lines.push(`- Machine tasks: ${audit.queue.machine_tasks}`);
  lines.push(`- Machine in progress: ${audit.queue.in_progress_machine_tasks}`);
  lines.push(`- Stale machine tasks: ${audit.queue.stale_tasks.length}`);
  lines.push(`- Raw-looking visible titles: ${audit.queue.raw_title_tasks.length}`);
  lines.push(`- Misrouted watchdog cleanup tasks: ${(audit.queue.misrouted_watchdog_tasks || []).length}`);
  lines.push(`- Done without verification trail: ${audit.queue.done_without_verification_trail.length}`);
  if (audit.findings.length) {
    lines.push('', '## Findings');
    for (const finding of audit.findings) lines.push(`- [${finding.severity}] ${finding.type}: ${finding.message}`);
  } else {
    lines.push('', '## Findings', '- No problems detected.');
  }
  if (repairs.length) {
    lines.push('', '## Soft Repairs');
    for (const repair of repairs) lines.push(`- Task #${repair.task_id}: ${repair.action}${repair.ok ? '' : ` (${repair.error})`}`);
  }
  if (audit.railway) {
    lines.push('', '## Railway Doctor');
    lines.push(`- Status: ${audit.railway.status}`);
    lines.push(`- OK: ${audit.railway.ok ? 'yes' : 'no'}`);
    lines.push(`- Transient deploy state: ${audit.railway.transient ? 'yes' : 'no'}`);
    if (audit.railway.output_tail) {
      lines.push('', '```text');
      lines.push(audit.railway.output_tail.slice(-2000));
      lines.push('```');
    }
  }
  return `${lines.join('\n')}\n`;
}

function writeWatchdogReport(audit, repairs) {
  ensureDir(systemAuditsDir);
  const stamp = audit.audit_finished_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(systemAuditsDir, `${stamp}-watchdog.json`);
  const mdPath = path.join(systemAuditsDir, `${stamp}-watchdog.md`);
  writeJson(jsonPath, { audit, repairs });
  fs.writeFileSync(mdPath, watchdogReportMarkdown(audit, repairs));
  return { jsonPath, mdPath };
}

async function reportWatchdogRuntimeStatus(config, audit, repairs, reportPaths, args, improvements = null) {
  try {
    const activeMachine = Number(audit.queue?.machine_tasks || 0);
    const warningCount = audit.findings.filter((finding) => finding.severity !== 'ok').length;
    await appRequest(config, 'POST', '/api/bna/agent-fleet/status', {
      agent_key: 'codex-watchdog',
      status: audit.severity === 'critical' ? 'error' : 'running',
      pid: process.pid,
      mode: args.watch ? 'watch' : 'once',
      host: os.hostname(),
      started_at: readJson(watchdogLockPath, null)?.started_at || null,
      stale_after_ms: Math.max(config.watchdogPollMs * 3, 180000),
      current_task_id: null,
      queue_size: activeMachine,
      ready_count: warningCount,
      details: {
        script: 'scripts/agent-fleet-supervisor.mjs',
        watchdog: true,
        severity: audit.severity,
        last_audit_at: audit.audit_finished_at,
        telegram_bridge: {
          running: audit.locks.telegram_bridge.running,
          stale_lock: audit.locks.telegram_bridge.stale_lock,
          bot_ok: audit.locks.telegram_bridge.bot_ok,
          expected_bot: audit.locks.telegram_bridge.expected_bot,
        },
        stale_tasks: audit.queue.stale_tasks,
        conflicts: audit.findings.filter((finding) => finding.type === 'machine_task_conflict'),
        raw_title_tasks: audit.queue.raw_title_tasks,
        misrouted_watchdog_tasks: audit.queue.misrouted_watchdog_tasks,
        repairs,
        improvements: improvements ? {
          ran: Boolean(improvements.ran),
          reason: improvements.reason || null,
          created_decisions: improvements.created_decisions || [],
          finding_count: improvements.audit?.findings?.length || 0,
          report: improvements.report || null,
        } : null,
        report: {
          md: relative(reportPaths.mdPath),
          json: relative(reportPaths.jsonPath),
        },
      },
    });
  } catch (error) {
    console.error(`Could not report watchdog status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function notifyWatchdogIfNeeded(config, audit, repairs, reportPaths, args) {
  return notifyWatchdogIncidentIfNeeded(config, audit, repairs, reportPaths, args, { event: null, previousIncident: null, pendingResolution: null });
}

function watchdogNotificationText(audit, repairs, reportPaths, incident) {
  const pendingResolution = incident?.pendingResolution || null;
  const previousIncident = incident?.previousIncident || pendingResolution?.previous_incident || null;
  if (incident?.event === 'resolved' && previousIncident) {
    return [
      'BNA watchdog: RESOLVED',
      `Handled: ${String(previousIncident.severity || 'non-ok').toUpperCase()} incident`,
      '',
      'Previous findings:',
      ...watchdogFindingLines(previousIncident.findings || []),
      '',
      'Current status: OK. The incident was recorded as resolved in the changelog and task ledger.',
      `Report: ${relative(reportPaths.mdPath)}`,
    ].join('\n');
  }

  const topFindings = audit.findings.slice(0, 5).map((finding) => `- ${finding.message}`).join('\n');
  const repairLines = repairs.length
    ? `\nSoft repairs:\n${repairs.map((repair) => `- #${repair.task_id}: ${repair.action}`).join('\n')}`
    : '';
  const actionLine = audit.findings.some((finding) => finding.type === 'railway_doctor_warning')
    ? 'Action: the watchdog is tracking Railway until it returns to SUCCESS, then it will send a resolved ping.'
    : 'Action: the watchdog logged the incident and will keep tracking it until the next OK audit.';
  return [
    `BNA watchdog: ${String(audit.severity || 'unknown').toUpperCase()}`,
    topFindings || '- No findings, but repairs were applied.',
    repairLines,
    actionLine,
    `Report: ${relative(reportPaths.mdPath)}`,
  ].filter(Boolean).join('\n');
}

async function notifyWatchdogIncidentIfNeeded(config, audit, repairs, reportPaths, args, incident = {}) {
  if (args.noTelegram) return;
  if (args.dryRun) return;
  const state = loadWatchdogState();
  const pendingResolution = incident.pendingResolution || state.pending_resolution_notification || null;
  const previousIncident = incident.previousIncident || pendingResolution?.previous_incident || null;
  const isResolution = audit.severity === 'ok' && !repairs.length && Boolean(pendingResolution && previousIncident);
  if (audit.severity === 'ok' && !repairs.length && !isResolution) return;
  const notificationEvent = isResolution ? 'resolved' : 'active';
  const signature = watchdogNotificationSignature(audit, repairs, notificationEvent, previousIncident);
  const lastAlertAt = Date.parse(state.last_alert_at || 0);
  const alertAgeMs = Date.now() - lastAlertAt;
  if (
    state.last_alert_signature === signature &&
    Number.isFinite(alertAgeMs) &&
    alertAgeMs >= 0 &&
    alertAgeMs < config.watchdogAlertCooldownMs
  ) {
    return;
  }
  await sendTelegram(config, watchdogNotificationText(audit, repairs, reportPaths, {
    ...incident,
    event: notificationEvent,
    previousIncident,
    pendingResolution,
  }));
  state.last_alert_signature = signature;
  state.last_alert_at = nowIso();
  if (isResolution) {
    delete state.pending_resolution_notification;
  }
  saveWatchdogState(state);
}

async function runWatchdogOnce(config, args) {
  const audit = await buildWatchdogAudit(config, args);
  const repairs = await applyWatchdogSoftRepairs(config, audit, args);
  const reportPaths = writeWatchdogReport(audit, repairs);
  const improvements = await maybeRunWatchdogImprovementAudit(config, args);
  await reportWatchdogRuntimeStatus(config, audit, repairs, reportPaths, args, improvements);
  const incident = syncWatchdogIncidentState(audit, repairs, reportPaths, args);
  await notifyWatchdogIncidentIfNeeded(config, audit, repairs, reportPaths, args, incident);
  return { audit, repairs, reportPaths, improvements };
}

async function watchdogStatus(config) {
  const lock = readJson(watchdogLockPath, null);
  let apiStatus = null;
  try {
    apiStatus = await appRequest(config, 'GET', '/api/bna/agent-fleet/status');
  } catch {}
  const latestReport = fs.existsSync(systemAuditsDir)
    ? fs.readdirSync(systemAuditsDir)
      .filter((name) => name.endsWith('-watchdog.md'))
      .sort()
      .at(-1)
    : null;
  const latestImprovementReport = fs.existsSync(systemAuditsDir)
    ? fs.readdirSync(systemAuditsDir)
      .filter((name) => name.endsWith('-watchdog-improvements.md'))
      .sort()
      .at(-1)
    : null;
  const watchdogApi = apiStatus?.watchdog || null;
  return [
    'Agent watchdog status:',
    `- Local lock: ${lock?.pid && processIsAlive(lock.pid) ? `running PID ${lock.pid}` : lock ? `stale PID ${lock.pid || 'unknown'}` : 'not running'}`,
    `- API status: ${watchdogApi?.status || 'unknown'}${watchdogApi?.stale ? ' (stale)' : ''}`,
    `- Last audit: ${watchdogApi?.details?.last_audit_at || 'unknown'}`,
    `- Severity: ${watchdogApi?.details?.severity || 'unknown'}`,
    `- Latest report: ${latestReport ? `ops/system-audits/${latestReport}` : 'none'}`,
    `- Latest improvement report: ${latestImprovementReport ? `ops/system-audits/${latestImprovementReport}` : 'none'}`,
  ].join('\n');
}

async function watchdogLoop(config, args) {
  console.log(`Agent watchdog started. Polling every ${config.watchdogPollMs}ms.`);
  while (true) {
    try {
      const result = await runWatchdogOnce(config, args);
      console.log(`Watchdog audit ${result.audit.severity}: ${relative(result.reportPaths.mdPath)}`);
    } catch (error) {
      const message = `Agent watchdog loop error: ${error instanceof Error ? error.message : String(error)}`;
      console.error(message);
      if (!args.noTelegram) {
        try {
          await sendTelegram(config, message);
        } catch (telegramError) {
          console.error(`Could not send Telegram watchdog error: ${telegramError instanceof Error ? telegramError.message : String(telegramError)}`);
        }
      }
    }
    await sleep(config.watchdogPollMs);
  }
}

async function runTaskQueueReconcilerBeforeClaim(config, args) {
  if (!config.taskQueueReconcile || args.noReconcile || args.watch) return null;
  const command = buildTaskQueueReconcilerCommand(args);
  const result = await runShellCommand(command, Math.min(config.verifyTimeoutMs, 3 * 60 * 1000));
  if (!result.ok) {
    console.error(`Task queue reconciler failed before claim: ${result.stderr || result.stdout}`);
  } else if (result.stdout) {
    console.log(result.stdout.trim());
  }
  return result;
}

function buildTaskQueueReconcilerCommand(args = {}) {
  return [
    'node scripts/task-queue-reconciler.mjs',
    args.dryRun ? '' : '--apply',
    '--no-telegram',
  ].filter(Boolean).join(' ');
}

async function runChatGptDropoffIngestBeforeClaim(config, args) {
  if (!config.chatGptDropoffIngest || args.noChatGptDropoff) return null;
  await runChatGptDropoffCommentCollectBeforeClaim(config, args);
  const command = buildChatGptDropoffIngestCommand(args, config);
  const result = await runShellCommand(command, Math.min(config.verifyTimeoutMs, 3 * 60 * 1000));
  if (!result.ok) {
    console.error(`ChatGPT dropoff ingestor failed before claim: ${result.stderr || result.stdout}`);
  } else if (result.stdout) {
    const text = result.stdout.trim();
    if (text && !/"queued_count": 0/.test(text)) console.log(text);
  }
  return result;
}

async function runChatGptDropoffCommentCollectBeforeClaim(config, args) {
  if (!config.chatGptDropoffCommentCollect || args.noChatGptDropoff) return null;
  const command = buildChatGptDropoffCommentCollectCommand(args, config);
  const result = await runShellCommand(command, Math.min(config.verifyTimeoutMs, 3 * 60 * 1000));
  if (!result.ok) {
    console.error(`ChatGPT dropoff GitHub comment collector failed before claim: ${result.stderr || result.stdout}`);
  } else if (result.stdout) {
    const text = result.stdout.trim();
    if (text && !/"collected_count": 0/.test(text)) console.log(text);
  }
  return result;
}

function buildChatGptDropoffCommentCollectCommand(args = {}, config = {}) {
  return [
    'node scripts/chatgpt-dropoff-comment-collector.mjs',
    args.dryRun ? '' : '--apply',
    '--json',
    '--limit',
    String(Math.max(Number(config.chatGptDropoffCommentLimit || 40), 1)),
  ].filter(Boolean).join(' ');
}

function buildChatGptDropoffIngestCommand(args = {}, config = {}) {
  return [
    'node scripts/chatgpt-dropoff-ingestor.mjs',
    args.dryRun ? '' : '--apply',
    '--json',
    '--limit',
    String(Math.max(Number(config.chatGptDropoffLimit || 12), 1)),
  ].filter(Boolean).join(' ');
}

async function processAgentJob(config, job, state, args) {
  if (args.dryRun) {
    return {
      ok: true,
      dry_run: true,
      message: `Would claim job #${job.id || job.job_id}${job.task_id ? ` for task #${job.task_id}` : ''}`,
    };
  }

  const claimed = await claimAgentJob(config, job);
  const claimedJob = claimed.job || job;
  const linkedTaskId = Number(claimedJob.task_id || claimedJob.taskId || 0);
  const task = claimed.task || (linkedTaskId ? await loadTaskById(config, linkedTaskId) : null);
  if (!task?.id) {
    const blocker = `Codex job #${claimedJob.id || claimedJob.job_id} is missing a linked task, so the fleet cannot execute it.`;
    await blockAgentJob(config, claimedJob, {
      status: 'blocked_needs_human_decision',
      blocker,
      summary: blocker,
    });
    if (!args.noTelegram) {
      await notifyAgentFleet(config, blocker, {
        chatId: claimedJob.source_chat_id || '',
        label: `missing-task notification for job #${claimedJob.id || claimedJob.job_id}`,
      });
    }
    return { ok: false, blocked: true, message: blocker };
  }

  if (!args.noTelegram) {
    const started = [
      `Codex started job #${claimedJob.id || claimedJob.job_id}${claimedJob.ticket_id ? ` for ticket #${claimedJob.ticket_id}` : ''}.`,
      `Task #${task.id}: ${taskReportTitle(task)}`,
    ].join('\n');
    await notifyAgentFleet(config, started, {
      chatId: claimedJob.source_chat_id || '',
      label: `start notification for job #${claimedJob.id || claimedJob.job_id}`,
    });
  }

  return processTask(config, { ...task, agent_job_id: claimedJob.id || claimedJob.job_id }, state, {
    ...args,
    agentJob: claimedJob,
  });
}

async function status(config) {
  let tasks = await loadTasks(config);
  const state = loadState();
  const auditStaleMinutes = Math.ceil(Math.max(config.taskTimeoutMs * 2, 45 * 60 * 1000) / 60000);
  let queueAudit = null;
  try {
    queueAudit = buildQueueAudit({
      repoRoot,
      liveTasks: tasks,
      staleThresholdMinutes: auditStaleMinutes,
    });
  } catch (error) {
    queueAudit = {
      warnings: [error instanceof Error ? error.message : String(error)],
      counts: {},
    };
  }
  const normalizedCounts = summarizeQueueHealthForStatus(queueAudit);
  let observableQueue = null;
  let linkedTaskHydration = { fetchedTasks: [], missingTaskIds: [], errors: [] };
  try {
    observableQueue = await appRequest(config, 'GET', '/api/bna/codex-queue/status?limit=50');
  } catch (error) {
    observableQueue = { error: error instanceof Error ? error.message : String(error), queue: { jobs: [] } };
  }
  const observableJobs = Array.isArray(observableQueue?.queue?.jobs) ? observableQueue.queue.jobs : [];
  linkedTaskHydration = await hydrateObservableJobTasks(config, observableJobs, tasks);
  tasks = linkedTaskHydration.tasks;
  const queue = selectNextTasks(tasks, state, config, 12);
  const active = tasks.filter((task) => isActiveStage(task.stage));
  const codex = active.filter(isAgentOwnedTask);
  const claimableObservableJobs = sortObservableJobsForClaim(
    filterObservableJobsForClaim(observableJobs, tasks, state, config),
    tasks
  );
  const lock = readJson(supervisorLockPath, null);
  const lines = [
    'Agent fleet status:',
    `- Supervisor: ${lock?.pid && processIsAlive(lock.pid) ? `running PID ${lock.pid}` : 'not running'}`,
    `- Observable Codex jobs: ${observableJobs.length}`,
    `- Claimable observable jobs: ${claimableObservableJobs.length}`,
    `- Linked observable task lookup: fetched ${linkedTaskHydration.fetchedTasks.length}, missing ${linkedTaskHydration.errors.length}`,
    `- Active Codex task fallback: ${codex.length}`,
    `- Ready to claim: ${claimableObservableJobs.length || queue.length}`,
    `- Queue health: fresh ${normalizedCounts.active_fresh}, stale ${normalizedCounts.active_stale}, blocked ${normalizedCounts.blocked}, unknown ${normalizedCounts.abandoned_unknown}, do-not-redo ${normalizedCounts.do_not_redo}`,
    `- Max retries: ${config.maxRetries}`,
    `- Baseline smoke: ${config.openAiSmoke ? 'enabled' : 'disabled'}`,
    `- Auto deploy gate: ${config.autoDeploy ? 'enabled' : 'disabled'}`,
    `- ChatGPT dropoff ingest: ${config.chatGptDropoffIngest ? 'enabled' : 'disabled'}`,
    `- ChatGPT comment collect: ${config.chatGptDropoffCommentCollect ? 'enabled' : 'disabled'}`,
    `- Permission tiers: ${permissionTierLines().join(' | ')}`,
    `- Startup shortcuts: ${buildStartupShortcutMatrix().map((item) => item.action).join(', ')}`,
  ];
  if (observableQueue?.error) lines.push(`- Observable queue read: ${observableQueue.error}`);
  if (linkedTaskHydration.errors.length) {
    lines.push(`- Linked task lookup warnings: ${linkedTaskHydration.errors.slice(0, 2).map((item) => `#${item.task_id} ${item.message}`).join('; ')}`);
  }
  if (queueAudit?.warnings?.length) lines.push(`- Queue audit warnings: ${queueAudit.warnings.slice(0, 2).join('; ')}`);
  if (claimableObservableJobs.length) {
    lines.push('', 'Next claimable observable jobs:');
    for (const job of claimableObservableJobs.slice(0, 8)) {
      lines.push(`- job #${job.id || job.job_id}${job.ticket_id ? ` / ticket #${job.ticket_id}` : ''}${job.task_id ? ` / task #${job.task_id}` : ''} [${job.status}] ${observableJobStatusTitle(job, tasks)}`);
    }
  } else if (observableJobs.length) {
    lines.push('', 'Observable jobs not claimable by active-task policy:');
    for (const job of observableJobs.slice(0, 8)) {
      lines.push(`- job #${job.id || job.job_id}${job.ticket_id ? ` / ticket #${job.ticket_id}` : ''}${job.task_id ? ` / task #${job.task_id}` : ''} [${job.status}] ${observableJobStatusTitle(job, tasks)}`);
    }
  } else if (queue.length) {
    lines.push('', 'Next tasks:');
    for (const task of queue.slice(0, 8)) lines.push(`- ${taskStatusLine(task)}`);
  }
  return lines.join('\n');
}

async function runOnce(config, args) {
  await runChatGptDropoffIngestBeforeClaim(config, args);
  await runTaskQueueReconcilerBeforeClaim(config, args);
  const state = loadState();
  let tasks = await loadTasks(config);
  const maxTasks = args.maxTasks && args.maxTasks > 0 ? args.maxTasks : 1;
  let selectedJobs = [];
  try {
    const observableJobs = await loadAgentJobs(config, { status: 'queued', limit: Math.max(maxTasks * 10, 50) });
    const linkedTaskHydration = await hydrateObservableJobTasks(config, observableJobs, tasks);
    tasks = linkedTaskHydration.tasks;
    selectedJobs = sortObservableJobsForClaim(
      filterObservableJobsForClaim(observableJobs, tasks, state, config),
      tasks
    ).slice(0, maxTasks);
  } catch (error) {
    console.error(`Observable agent job queue unavailable; falling back to task queue: ${error instanceof Error ? error.message : String(error)}`);
  }
  const selected = selectNextTasks(tasks, state, config, maxTasks);
  await reportRuntimeStatus(config, {
    status: 'running',
    mode: args.watch ? 'watch' : 'once',
    tasks,
    selected: selectedJobs.length ? selectedJobs : selected,
    currentTaskId: selectedJobs[0]?.task_id || selected[0]?.id || null,
    details: {
      dry_run: Boolean(args.dryRun),
      no_smoke: Boolean(args.noSmoke),
      no_deploy: Boolean(args.noDeploy),
      observable_agent_jobs: selectedJobs.length,
    },
  });
  if (!selectedJobs.length && !selected.length) {
    console.log('Agent fleet: no Codex-owned tasks ready to claim.');
    return [];
  }
  const outcomes = [];
  if (selectedJobs.length) {
    for (const job of selectedJobs) {
      // Jobs are intentionally serial to avoid competing edits in the same repo.
      // eslint-disable-next-line no-await-in-loop
      await reportRuntimeStatus(config, {
        status: 'running',
        mode: args.watch ? 'watch' : 'once',
        tasks,
        selected: selectedJobs,
        currentTaskId: job.task_id || null,
        details: { phase: 'processing_observable_job', agent_job_id: job.id || job.job_id },
      });
      // eslint-disable-next-line no-await-in-loop
      outcomes.push(await processAgentJob(config, job, state, args));
    }
  } else {
    for (const task of selected) {
      // Tasks are intentionally serial to avoid competing edits in the same repo.
      // eslint-disable-next-line no-await-in-loop
      await reportRuntimeStatus(config, {
        status: 'running',
        mode: args.watch ? 'watch' : 'once',
        tasks,
        selected,
        currentTaskId: task.id,
        details: { phase: 'processing' },
      });
      // eslint-disable-next-line no-await-in-loop
      outcomes.push(await processTask(config, task, state, args));
    }
  }
  await reportRuntimeStatus(config, {
    status: 'running',
    mode: args.watch ? 'watch' : 'once',
    tasks,
    selected: [],
    currentTaskId: null,
    details: { phase: 'idle_after_run', processed: outcomes.length },
  });
  return outcomes;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function watchLoop(config, args) {
  console.log(`Agent fleet watcher started. Polling every ${config.pollMs}ms.`);
  while (true) {
    try {
      await runOnce(config, { ...args, maxTasks: args.maxTasks || 1 });
    } catch (error) {
      const message = `Agent fleet loop error: ${error instanceof Error ? error.message : String(error)}`;
      console.error(message);
      await reportRuntimeStatus(config, {
        status: 'error',
        mode: 'watch',
        tasks: [],
        selected: [],
        details: { error: message },
      });
      if (!args.noTelegram) {
        try {
          await sendTelegram(config, message);
        } catch (telegramError) {
          console.error(`Could not send Telegram loop error: ${telegramError instanceof Error ? telegramError.message : String(telegramError)}`);
        }
      }
    }
    await sleep(config.pollMs);
  }
}

async function main() {
  ensureDir(runtimeDir);
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();

  if (args.status) {
    console.log(args.watchdog ? await watchdogStatus(config) : await status(config));
    return;
  }

  if (args.watchdog) {
    if (args.watch) {
      acquireWatchdogLock({ watch: args.watch });
      const cleanup = () => releaseWatchdogLock();
      process.on('exit', cleanup);
      process.on('SIGINT', () => {
        cleanup();
        process.exit(130);
      });
      process.on('SIGTERM', () => {
        cleanup();
        process.exit(143);
      });
      await watchdogLoop(config, args);
      return;
    }

    const result = await runWatchdogOnce(config, args);
    console.log(JSON.stringify({
      ok: result.audit.ok,
      severity: result.audit.severity,
      dry_run: args.dryRun,
      repairs: result.repairs,
      report: {
        md: relative(result.reportPaths.mdPath),
        json: relative(result.reportPaths.jsonPath),
      },
      improvements: result.improvements
        ? {
          ran: Boolean(result.improvements.ran),
          reason: result.improvements.reason || null,
          created_decisions: result.improvements.created_decisions || [],
          report: result.improvements.report || null,
        }
        : null,
      finding_count: result.audit.findings.length,
    }, null, 2));
    return;
  }

  acquireSupervisorLock({ watch: args.watch });
  const cleanup = () => releaseSupervisorLock();
  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });

  if (args.watch) {
    await watchLoop(config, args);
    return;
  }

  const outcomes = await runOnce(config, args);
  console.log(JSON.stringify({
    ok: outcomes.every((outcome) => outcome.ok !== false),
    processed: outcomes.length,
    dry_run: args.dryRun,
    outcomes: outcomes.map((outcome) => ({
      task_id: outcome.task_id,
      ok: outcome.ok,
      dry_run: outcome.dry_run || false,
      message: outcome.message || '',
      deployment_gate: outcome.deployment_result
        ? {
          ok: outcome.deployment_result.ok,
          needed: outcome.deployment_result.needed,
          skipped_reason: outcome.deployment_result.skipped_reason || '',
        }
        : null,
    })),
  }, null, 2));
}

export {
  AGENT_FLEET_PERMISSION_TIERS,
  buildChatGptDropoffCommentCollectCommand,
  buildChatGptDropoffIngestCommand,
  buildTaskTitleRepair,
  buildTaskQueueReconcilerCommand,
  buildWatchdogRoutingRepair,
  buildWatchdogImprovementDecisionPayload,
  classifyAgentFleetCommand,
  classifyRailwayDoctorResult,
  collectSecretEvidenceFromText,
  collectWatchdogImprovementFindings,
  filterObservableJobsForClaim,
  inspectTelegramBridgeLock,
  isAllowlistedSecretScanLine,
  isNonSensitiveSecretScanPlaceholder,
  isWatchdogImprovementDecision,
  mergeTasksById,
  looksRawRambleTitle,
  looksWatchdogWarningRepairRequest,
  observableJobTaskIdsMissingFromTasks,
  redactAgentFleetText,
  selectWatchdogImprovementFindingsForCreation,
  sortObservableJobsForClaim,
  watchdogIncidentSignature,
  watchdogImprovementShouldRun,
  watchdogNotificationSignature,
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  });
}
