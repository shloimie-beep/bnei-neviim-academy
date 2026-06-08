#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

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
    dryRun: false,
    maxTasks: null,
    noSmoke: false,
    noDeploy: false,
    noTelegram: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--watch') args.watch = true;
    else if (arg === '--once') args.once = true;
    else if (arg === '--status') args.status = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--no-smoke') args.noSmoke = true;
    else if (arg === '--no-deploy') args.noDeploy = true;
    else if (arg === '--no-telegram') args.noTelegram = true;
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
    codexCommand: env.CODEX_CLI_COMMAND || 'codex',
    codexModel: env.CODEX_CLI_MODEL || '',
    taskTimeoutMs: Number(env.AGENT_FLEET_TASK_TIMEOUT_MS || env.CODEX_BRIDGE_TIMEOUT_MS || 30 * 60 * 1000),
    verifyTimeoutMs: Number(env.AGENT_FLEET_VERIFY_TIMEOUT_MS || 8 * 60 * 1000),
    pollMs: Number(env.AGENT_FLEET_POLL_MS || 60 * 1000),
    maxRetries: Number(env.AGENT_FLEET_MAX_RETRIES || 2),
    openAiSmoke: String(env.AGENT_FLEET_OPENAI_SMOKE || '1') !== '0',
    verifyCommandsRaw: env.AGENT_FLEET_VERIFY_COMMANDS || '',
    autoDeploy: String(env.AGENT_FLEET_AUTO_DEPLOY || '1') !== '0',
    deployCommand: env.AGENT_FLEET_DEPLOY_COMMAND || 'npm run railway:redeploy',
    deployDoctorCommand: env.AGENT_FLEET_DEPLOY_DOCTOR_COMMAND || 'npm run railway:doctor',
    deployTimeoutMs: Number(env.AGENT_FLEET_DEPLOY_TIMEOUT_MS || 15 * 60 * 1000),
    telegramToken: readSecret('telegram-bot-token.txt') || env.TELEGRAM_BOT_TOKEN_BNA || env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: env.TELEGRAM_CHAT_ID_BNA || env.TELEGRAM_CHAT_ID || '',
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
      body: JSON.stringify({ chat_id: config.telegramChatId, text: chunk }),
    });
    const body = await response.json();
    if (!response.ok || !body.ok) {
      throw new Error(`Telegram send failed: ${JSON.stringify(body).slice(0, 500)}`);
    }
  }
  return true;
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

function taskStatusLine(task) {
  return `#${task.id} [${normalizeStage(task.stage)}] ${taskTitle(task).slice(0, 110)}`;
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

async function loadTasks(config) {
  const data = await appRequest(config, 'GET', '/api/bna/tasks');
  return Array.isArray(data.tasks) ? data.tasks : [];
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
  if (lock.pid && processIsAlive(lock.pid)) return true;
  const ageMs = Date.now() - Date.parse(lock.started_at || 0);
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs < maxAgeMs;
}

function acquireTaskLock(task) {
  writeJson(taskLockPath(task.id), {
    task_id: task.id,
    pid: process.pid,
    started_at: nowIso(),
    title: taskTitle(task),
  });
}

function releaseTaskLock(taskId) {
  const lockPath = taskLockPath(taskId);
  const lock = readJson(lockPath, null);
  if (Number(lock?.pid) === process.pid && fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
}

function selectNextTasks(tasks, state, config, maxTasks = 1) {
  const freshMs = Math.max(config.taskTimeoutMs * 2, 30 * 60 * 1000);
  return tasks
    .filter((task) => isActiveStage(task.stage))
    .filter(isAgentOwnedTask)
    .filter((task) => normalizeStage(task.stage) !== 'needs_decision')
    .filter((task) => !task.decision_required)
    .filter((task) => !taskLockIsFresh(task.id, freshMs))
    .filter((task) => {
      const record = state.tasks?.[task.id];
      return !(record?.blocked && Number(record?.attempts || 0) >= config.maxRetries);
    })
    .sort(sortQueue)
    .slice(0, maxTasks);
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

function buildTaskPrompt(task, attempt) {
  const originalText = (() => {
    try {
      const parsed = typeof task.ai_parsed === 'string' ? JSON.parse(task.ai_parsed) : task.ai_parsed;
      return parsed?.original_text || '';
    } catch {
      return '';
    }
  })();
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
    '',
    `Task ID: ${task.id}`,
    `Attempt: ${attempt}`,
    `Title: ${taskTitle(task)}`,
    `Stage: ${normalizeStage(task.stage)}`,
    `Category: ${task.category || 'operations'}`,
    `Urgency: ${task.urgency || 'this_week'}`,
    `Project: ${task.project_short_name || task.project_name || task.project_key || 'BNA'}`,
    `Created: ${task.created_at || 'unknown'}`,
    '',
    'Task notes:',
    String(task.notes || '[none]').slice(0, 3500),
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
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/\n*To resume this session:[^\n]*/g, '')
    .trim();
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
  };

  if (!changed.ok) {
    result.ok = false;
    result.skipped_reason = 'could_not_inspect_git_changes';
    return result;
  }

  if (!deployableFiles.length) return result;

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
    `Task: ${taskTitle(task)}`,
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
    ? `Complete agent task #${task.id}: ${taskTitle(task)}`
    : `Agent task #${task.id} blocked: ${taskTitle(task)}`;
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
  appendJsonl(ledgerPath, {
    recorded_at: localStamp(),
    event: outcome.ok ? 'agent_fleet_task_verified' : 'agent_fleet_task_blocked',
    source: 'agent_fleet',
    task_id: task.id,
    title: taskTitle(task),
    notes: `${outcome.ok ? 'Completed and verified' : 'Blocked or failed'} by agent fleet. Report: ${relative(reportPaths.mdPath)}`,
    stage: outcome.ok ? 'done' : 'needs_decision',
    category: task.category || 'operations',
    assigned_to: 'Codex',
  });
}

async function processTask(config, task, state, options) {
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

  acquireTaskLock(task);
  try {
  const startedAt = nowIso();
  const claimNote = `Agent fleet claimed this task at ${startedAt}. Attempt ${record.attempts}.`;
  console.log(claimNote);
  await patchTask(config, task.id, {
    stage: 'in_progress',
    started_at: task.started_at || startedAt,
    assigned_to: 'Codex',
  });
  await addTaskComment(config, task.id, claimNote);

  let codexResult = null;
  let codexError = null;
  let verificationResults = [];
  let deploymentResult = null;
  try {
    codexResult = await runCodex(buildTaskPrompt(task, record.attempts), config, task.id);
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
    const verificationNotes = [
      'Agent fleet completed, verified, and passed the deployment gate for this task.',
      summarizeVerification(verificationResults),
      summarizeDeployment(deploymentResult),
      `Report: ${relative(reportPaths.mdPath)}`,
    ].join('\n');
    await patchTask(config, task.id, {
      stage: 'done',
      completed_at: nowIso(),
      verified_at: nowIso(),
      verification_notes: verificationNotes.slice(0, 4000),
    });
    await addTaskComment(config, task.id, verificationNotes);
    if (!options.noTelegram) {
      await sendTelegram(
        config,
        [
          `Agent fleet completed task #${task.id}.`,
          taskTitle(task),
          '',
          summarizeVerification(verificationResults),
          '',
          summarizeDeployment(deploymentResult),
          '',
          `Report: ${relative(reportPaths.mdPath)}`,
        ].join('\n')
      );
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
    if (!options.noTelegram) await sendTelegram(config, blockerNote);
  }

  return outcome;
  } finally {
    releaseTaskLock(task.id);
  }
}

async function status(config) {
  const tasks = await loadTasks(config);
  const state = loadState();
  const queue = selectNextTasks(tasks, state, config, 12);
  const active = tasks.filter((task) => isActiveStage(task.stage));
  const codex = active.filter(isAgentOwnedTask);
  const lock = readJson(supervisorLockPath, null);
  const lines = [
    'Agent fleet status:',
    `- Supervisor: ${lock?.pid && processIsAlive(lock.pid) ? `running PID ${lock.pid}` : 'not running'}`,
    `- Active Codex queue: ${codex.length}`,
    `- Ready to claim: ${queue.length}`,
    `- Max retries: ${config.maxRetries}`,
    `- Baseline smoke: ${config.openAiSmoke ? 'enabled' : 'disabled'}`,
    `- Auto deploy gate: ${config.autoDeploy ? 'enabled' : 'disabled'}`,
  ];
  if (queue.length) {
    lines.push('', 'Next tasks:');
    for (const task of queue.slice(0, 8)) lines.push(`- ${taskStatusLine(task)}`);
  }
  return lines.join('\n');
}

async function runOnce(config, args) {
  const state = loadState();
  const tasks = await loadTasks(config);
  const maxTasks = args.maxTasks && args.maxTasks > 0 ? args.maxTasks : 1;
  const selected = selectNextTasks(tasks, state, config, maxTasks);
  await reportRuntimeStatus(config, {
    status: 'running',
    mode: args.watch ? 'watch' : 'once',
    tasks,
    selected,
    currentTaskId: selected[0]?.id || null,
    details: {
      dry_run: Boolean(args.dryRun),
      no_smoke: Boolean(args.noSmoke),
      no_deploy: Boolean(args.noDeploy),
    },
  });
  if (!selected.length) {
    console.log('Agent fleet: no Codex-owned tasks ready to claim.');
    return [];
  }
  const outcomes = [];
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
    console.log(await status(config));
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

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
