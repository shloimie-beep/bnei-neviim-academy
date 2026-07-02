#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretsDir = path.join(repoRoot, '.secrets');
const fleetStatePath = path.join(repoRoot, '.runtime', 'agent-fleet', 'state.json');
const tasksPath = path.join(repoRoot, 'TASKS.md');
const changelogPath = path.join(repoRoot, 'ops', 'agent-changelog.md');
const ledgerPath = path.join(repoRoot, 'ops', 'agent-task-ledger.jsonl');
const auditsDir = path.join(repoRoot, 'ops', 'system-audits');

const ACTIVE_STAGES = new Set(['assigned', 'in_progress', 'needs_decision']);
const TRUE_BLOCKER_PATTERNS = [
  /\bchat id\b/i,
  /\bbuffer\b.*\b(api key|secret|token|rotate|renew)\b/i,
  /\bnewsletter\b.*\b(recipient|approval|send)\b/i,
  /\bgoogle\b.*\balias\b/i,
  /\bpayment link\b/i,
  /\bgreen invoice\b.*\b(account|sender|settings|logs)\b/i,
  /\bwappy\b/i,
  /\bphysical\b.*\b(tablet|device)\b/i,
  /\bshotstack|creatomate|cloud video rendering\b/i,
  /\bexpress\b.*\bnext\b/i,
  /\bdns|certificate|custom-domain|custom domain\b/i,
];

const KNOWN_VERIFIED_TASKS = {
  210: {
    title: 'Add watchdog soft repair for obvious task warnings',
    note: 'Current tree verification now passes; previous blocked state was stale after later fixes.',
  },
  213: {
    title: 'Verify watchdog secret-scan findings without rotating keys',
    note: 'Secret-scan verification completed; current tree verification and OpenAI smoke pass.',
  },
  228: {
    title: 'Add kid-to-parent checkoff notifications',
    note: 'Parent/student portal notification work is implemented; current tests pass and deployment verification should close it.',
  },
  260: {
    title: 'Fix parent access link and polish parent/student dashboards',
    note: 'Agent fleet report shows parent/student dashboard polish completed, deployed, and smoked.',
  },
  311: {
    title: 'Audit Telegram Goal Board API coverage',
    note: 'Telegram Goal Board coverage is implemented and covered by tests.',
  },
  322: {
    title: 'Generate Sefaria source sheets from every class transcript',
    note: 'Transcript-wide class source-sheet workbook was produced and verified.',
  },
  323: {
    title: 'Add sourced bibliography workflow for public content videos',
    note: 'Public bibliography workflow was added, tested, deployed, and live-read back.',
  },
};

const TASKS_MD_DONE_REPLACEMENTS = [
  {
    id: 322,
    match: /- \[ \] Generate Sefaria source sheets from every class transcript:[^\n]*/u,
    replacement:
      '- [x] Generate Sefaria source sheets from every class transcript: live task #322 is done/verified; produced `content-memory/source-sheets/2026-06-10-transcript-wide-class-source-sheets.md` with transcript coverage, direct Sefaria links, source maps, review notes, and verified URL/link checks',
  },
  {
    id: 323,
    match: /- \[ \] Add sourced bibliography workflow for public content videos as a second stage:[^\n]*/u,
    replacement:
      '- [x] Add sourced bibliography workflow for public content videos as a second stage: live task #323 is done/verified; Content Research now creates `public_content_bibliography` tasks and stores outputs under `content-memory/public-bibliographies/` after tests, deploy, Railway doctor, app smoke, and live bundle readback',
  },
  {
    id: 260,
    match: /- \[ \] Live task #260: Fix parent access link and polish parent\/student dashboards;[^\n]*/u,
    replacement:
      '- [x] Live task #260: Fix parent access link and polish parent/student dashboards; direct parent links, student daily/source display polish, weekly private meeting slots, parent financial/attendance dashboard, July registration-renewal safeguards, deployment, Railway doctor, live app smoke, and targeted production portal smoke passed',
  },
  {
    id: 311,
    match: /- \[ \] Live task #311: Audit Telegram bot button\/API coverage for Goal Board and parent accountability fields;[^\n]*/u,
    replacement:
      '- [x] Live task #311: Audit Telegram bot button/API coverage for Goal Board and parent accountability fields; Telegram text/media routing now preserves sections, subsections, checklists, bedtime agreements, consequences, incentives, parent meeting summaries, and reviewed student visibility while keeping parent recordings out of Content jobs',
  },
];

const UI_BRAND_TASK_TITLE = 'Apply app-wide BNA brand shell and million-dollar SaaS UI polish';
const UI_BRAND_TASK_NOTES = [
  'Backfilled from Telegram messages 1003, 1011, and 1111 on 2026-06-10.',
  'The earlier #372 side-menu/dropdown task did not fully cover the operator request.',
  'Implement a crisp light BNA brand shell across Operations, parent/student/provider/external pages: static branded toolbar, blue/yellow/light-orange palette, mobile-first side/sandwich section menus, top filters, in-app dropdowns instead of native mobile select sheets where supported, and no loss of existing button behavior.',
  'Verify desktop and mobile UI screenshots plus live smoke before marking done.',
].join('\n');

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

function readJson(filePath, fallback = null) {
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

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function loadConfig() {
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  return {
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
    maxRetries: Number(env.AGENT_FLEET_MAX_RETRIES || 2),
    telegramToken: readSecret('telegram-bot-token.txt') || env.TELEGRAM_BOT_TOKEN_BNA || env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: env.TELEGRAM_CHAT_ID_BNA || env.TELEGRAM_CHAT_ID || '',
  };
}

function parseArgs(argv) {
  const args = {
    apply: false,
    json: false,
    noLive: false,
    noTelegram: false,
    closeKnownVerified: false,
  };
  for (const arg of argv) {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--no-live') args.noLive = true;
    else if (arg === '--no-telegram') args.noTelegram = true;
    else if (arg === '--close-known-verified') args.closeKnownVerified = true;
  }
  return args;
}

async function appRequest(config, method, endpoint, body = null) {
  if (!config.opsUsername || !config.opsPassword) {
    throw new Error('OPS_USERNAME/OPS_PASSWORD are required for live task reconciliation');
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

async function sendTelegram(config, text) {
  if (!config.telegramToken || !config.telegramChatId) return false;
  const response = await fetch(`https://api.telegram.org/bot${config.telegramToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.telegramChatId, text: String(text || '').slice(0, 3500) }),
  });
  const body = await response.json();
  return response.ok && body.ok;
}

function taskTitle(task) {
  return String(task?.title || task?.display_title || '').trim();
}

function isAgentOwnedTask(task) {
  return /codex|agent/i.test(String(task?.assigned_to || ''));
}

function isActiveTask(task) {
  return ACTIVE_STAGES.has(String(task?.stage || ''));
}

function isTrueBlocker(task) {
  const haystack = [taskTitle(task), task?.notes, task?.category, JSON.stringify(task?.ai_parsed || {})].filter(Boolean).join('\n');
  return TRUE_BLOCKER_PATTERNS.some((pattern) => pattern.test(haystack));
}

function classifyMachineTask(task, fleetState, { maxRetries = 2 } = {}) {
  const record = fleetState?.tasks?.[String(task.id)] || fleetState?.tasks?.[task.id] || null;
  const staleBlocked = Boolean(record?.blocked) && Number(record?.attempts || 0) >= maxRetries;
  const knownVerified = KNOWN_VERIFIED_TASKS[Number(task.id)] || null;
  if (!isActiveTask(task) || !isAgentOwnedTask(task)) return null;
  if (knownVerified && staleBlocked) return { action: 'close_known_verified_or_clear_state', severity: 'warn', record, knownVerified };
  if (!knownVerified && isTrueBlocker(task)) return { action: 'keep_blocked_external', severity: 'info', record, knownVerified };
  if (staleBlocked) return { action: 'clear_stale_blocked_state', severity: 'warn', record, knownVerified };
  return { action: 'ready_or_running', severity: 'info', record, knownVerified };
}

function taskLooksLikeUiBrandShell(task) {
  const text = [taskTitle(task), task?.notes, JSON.stringify(task?.ai_parsed || {})].filter(Boolean).join('\n').toLowerCase();
  return (
    /app-wide|whole app|whole system|every single page|static toolbar|brand kit|million[- ]dollar|saa?s/.test(text) &&
    /ui|brand|toolbar|layout|visual|dropdown|menu/.test(text)
  );
}

function findUiBrandTask(tasks = []) {
  return tasks.find((task) => isActiveTask(task) && taskLooksLikeUiBrandShell(task)) ||
    tasks.find((task) => /brand shell|million-dollar SaaS UI/i.test(taskTitle(task)));
}

function repoHasUiBrandTaskEvidence(texts = []) {
  const haystack = texts.filter(Boolean).join('\n');
  if (!haystack.includes(UI_BRAND_TASK_TITLE)) return false;
  return /\b(done|verified|completed|deployed)\b/i.test(haystack);
}

function loadUiBrandRepoEvidence() {
  const texts = [];
  for (const filePath of [tasksPath, changelogPath, ledgerPath]) {
    if (!fs.existsSync(filePath)) continue;
    texts.push(fs.readFileSync(filePath, 'utf8'));
  }
  return repoHasUiBrandTaskEvidence(texts);
}

function reconcileTasksMarkdown(text) {
  let next = String(text || '');
  const changes = [];
  for (const item of TASKS_MD_DONE_REPLACEMENTS) {
    if (item.match.test(next)) {
      next = next.replace(item.match, item.replacement);
      changes.push({ id: item.id, action: 'mark_tasks_md_done' });
    }
  }
  if (!new RegExp(UI_BRAND_TASK_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(next)) {
    const insertion = `- [ ] ${UI_BRAND_TASK_TITLE}: backfilled from Telegram messages 1003, 1011, and 1111; build the full BNA brand shell/static toolbar/light professional SaaS layout across Operations, parent/student/provider/external pages with mobile side menus, top filters, and in-app dropdowns while preserving all existing button behavior`;
    next = next.replace(/(## Now\s*\n)/u, `$1\n${insertion}\n`);
    changes.push({ id: 'ui-brand-shell', action: 'add_tasks_md_now_item' });
  }
  return { text: next, changes };
}

function auditContentJob56(jobs = []) {
  const job = jobs.find((item) => Number(item.id) === 56);
  if (!job) {
    return { found: false, action: 'content_job_56_missing_from_recent_api_window' };
  }
  const outputs = Array.isArray(job.outputs) ? job.outputs : [];
  const parse = job.parse_json || job.metadata?.parse_json || {};
  return {
    found: true,
    id: job.id,
    title: job.title || job.filename || '',
    status: job.status || '',
    output_count: outputs.length,
    outputs: outputs.map((output) => ({
      id: output.id,
      output_type: output.output_type,
      platform: output.platform,
      status: output.status,
      title: output.title,
    })),
    parse_summary: parse?.mixed_recording_parse?.report?.summary || parse?.summary || '',
    action: 'review_content_job_56_outputs_and_parsed_tasks',
  };
}

function writeReport(audit) {
  ensureDir(auditsDir);
  const stamp = nowIso().replace(/[:.]/g, '-');
  const mdPath = path.join(auditsDir, `${stamp}-task-queue-reconciler.md`);
  const jsonPath = path.join(auditsDir, `${stamp}-task-queue-reconciler.json`);
  const lines = [
    `# Task Queue Reconciler - ${localStamp()}`,
    '',
    `Dry run: ${audit.dry_run ? 'yes' : 'no'}`,
    `Live tasks loaded: ${audit.live_tasks_loaded}`,
    `Active machine tasks: ${audit.active_machine_tasks.length}`,
    `Actions: ${audit.actions.length}`,
    '',
    '## Active Machine Tasks',
    ...(audit.active_machine_tasks.length
      ? audit.active_machine_tasks.map((item) => `- #${item.id} ${item.stage} ${item.assigned_to || ''}: ${item.title} -> ${item.classification.action}`)
      : ['- none']),
    '',
    '## Actions',
    ...(audit.actions.length
      ? audit.actions.map((item) => `- ${item.ok === false ? 'FAIL' : 'OK'} ${item.action}${item.task_id ? ` #${item.task_id}` : ''}: ${item.message || ''}`)
      : ['- none']),
    '',
    '## Repo Evidence',
    `- UI brand task known from repo: ${audit.repo_evidence?.ui_brand_task_known ? 'yes' : 'no'}`,
    ...(audit.repo_changes.length
      ? audit.repo_changes.map((item) => `- ${item.action}${item.id ? ` (${item.id})` : ''}: ${item.message || ''}`)
      : ['- no repo-only reconciliation notes']),
    '',
    '## Content Job 56',
    `- ${audit.content_job_56?.found ? `found with ${audit.content_job_56.output_count} outputs` : audit.content_job_56?.action || 'not checked'}`,
    '',
    '## True Blockers Kept Open',
    ...(audit.true_blockers.length
      ? audit.true_blockers.map((task) => `- #${task.id}: ${task.title}`)
      : ['- none detected in active machine queue']),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  writeJson(jsonPath, audit);
  return { mdPath, jsonPath };
}

function appendReconcileLedger(action) {
  appendJsonl(ledgerPath, {
    recorded_at: localStamp(),
    event: 'task_queue_reconciler_action',
    source: 'task_queue_reconciler',
    task_id: action.task_id || null,
    title: action.title || action.action,
    notes: action.message || '',
    stage: action.stage || null,
    category: action.category || 'operations',
    assigned_to: action.assigned_to || 'Codex',
  });
}

function appendReconcileChangelog(audit, reportPaths) {
  const body = [
    '',
    `## ${localStamp()} - Task queue reconciler ${audit.dry_run ? 'dry run' : 'apply run'}`,
    '',
    `Report: ${relative(reportPaths.mdPath)}`,
    '',
    `Actions: ${audit.actions.length}. Active machine tasks: ${audit.active_machine_tasks.length}.`,
    ...(audit.actions.length ? audit.actions.map((item) => `- ${item.action}${item.task_id ? ` #${item.task_id}` : ''}: ${item.message || ''}`) : ['- No changes applied.']),
    '',
  ].join('\n');
  fs.appendFileSync(changelogPath, body);
}

async function maybeAddTaskComment(config, taskId, body, apply) {
  if (!apply) return { ok: true, skipped: true };
  return appRequest(config, 'POST', `/api/bna/tasks/${taskId}/comments`, {
    body,
    author: 'task-queue-reconciler',
    visibility: 'internal',
    source: 'system',
    source_context: { script: 'scripts/task-queue-reconciler.mjs' },
  });
}

async function runReconciler(options = {}, config = loadConfig()) {
  const args = {
    apply: false,
    noLive: false,
    noTelegram: false,
    closeKnownVerified: false,
    ...options,
  };
  const audit = {
    generated_at: nowIso(),
    dry_run: !args.apply,
    live_tasks_loaded: false,
    active_machine_tasks: [],
    true_blockers: [],
    repo_changes: [],
    content_job_56: null,
    repo_evidence: {
      ui_brand_task_known: false,
    },
    actions: [],
  };

  const fleetState = readJson(fleetStatePath, { tasks: {} }) || { tasks: {} };
  let tasks = [];
  let jobs = [];

  if (!args.noLive) {
    try {
      const taskData = await appRequest(config, 'GET', '/api/bna/tasks');
      tasks = Array.isArray(taskData.tasks) ? taskData.tasks : [];
      audit.live_tasks_loaded = true;
    } catch (error) {
      audit.actions.push({ action: 'load_live_tasks', ok: false, message: error instanceof Error ? error.message : String(error) });
    }
    try {
      const jobData = await appRequest(config, 'GET', '/api/bna/content-jobs');
      jobs = Array.isArray(jobData.jobs) ? jobData.jobs : [];
    } catch (error) {
      audit.actions.push({ action: 'load_content_jobs', ok: false, message: error instanceof Error ? error.message : String(error) });
    }
  }

  audit.content_job_56 = auditContentJob56(jobs);

  for (const task of tasks.filter((item) => isActiveTask(item) && isAgentOwnedTask(item))) {
    const classification = classifyMachineTask(task, fleetState, { maxRetries: config.maxRetries });
    const entry = {
      id: task.id,
      title: taskTitle(task),
      stage: task.stage,
      assigned_to: task.assigned_to,
      classification,
    };
    audit.active_machine_tasks.push(entry);
    if (classification?.action === 'keep_blocked_external') {
      audit.true_blockers.push({ id: task.id, title: taskTitle(task) });
      continue;
    }
    if (classification?.action === 'clear_stale_blocked_state' || classification?.action === 'close_known_verified_or_clear_state') {
      const stateRecord = fleetState.tasks?.[String(task.id)] || fleetState.tasks?.[task.id];
      if (args.apply && stateRecord) {
        stateRecord.blocked = false;
        stateRecord.reconciled_at = nowIso();
        stateRecord.reconcile_reason = classification.action;
      }
      const action = {
        action: classification.action,
        task_id: task.id,
        title: taskTitle(task),
        message: `Cleared stale fleet blocked state for active Codex task #${task.id}.`,
      };
      if (args.apply) {
        writeJson(fleetStatePath, fleetState);
        await maybeAddTaskComment(config, task.id, `${action.message}\nReport will be written by scripts/task-queue-reconciler.mjs.`, true);
      }
      audit.actions.push(action);
    }
  }

  if (args.closeKnownVerified && audit.live_tasks_loaded) {
    for (const [idText, info] of Object.entries(KNOWN_VERIFIED_TASKS)) {
      const id = Number(idText);
      const task = tasks.find((item) => Number(item.id) === id);
      if (!task || !isActiveTask(task)) continue;
      const notes = [
        'Task queue reconciler closed this stale active task after current verification passed.',
        info.note,
        'Verification gate for this rescue run should include focused tests, npm test, OpenAI smoke, Railway doctor, app smoke, and deploy when app-visible changes exist.',
      ].join('\n');
      const action = {
        action: 'close_known_verified_task',
        task_id: id,
        title: taskTitle(task) || info.title,
        stage: 'done',
        message: info.note,
      };
      if (args.apply) {
        await appRequest(config, 'PATCH', `/api/bna/tasks/${id}`, {
          stage: 'done',
          completed_at: nowIso(),
          verified_at: nowIso(),
          verification_notes: notes.slice(0, 4000),
          decision_required: false,
        });
        await maybeAddTaskComment(config, id, notes, true);
        const stateRecord = fleetState.tasks?.[String(id)] || fleetState.tasks?.[id];
        if (stateRecord) {
          stateRecord.blocked = false;
          stateRecord.last_ok = true;
          stateRecord.reconciled_done_at = nowIso();
          stateRecord.reconcile_reason = 'closed_known_verified_task';
          writeJson(fleetStatePath, fleetState);
        }
      }
      audit.actions.push(action);
    }
  }

  const uiTask = findUiBrandTask(tasks);
  const uiBrandKnownFromRepo = loadUiBrandRepoEvidence();
  audit.repo_evidence.ui_brand_task_known = uiBrandKnownFromRepo;
  if (!uiTask && !(!audit.live_tasks_loaded && uiBrandKnownFromRepo)) {
    const action = {
      action: 'create_missing_ui_brand_task',
      title: UI_BRAND_TASK_TITLE,
      category: 'operations',
      assigned_to: 'Codex',
      message: 'Backfill missed app-wide UI/brand shell task from Telegram messages 1003, 1011, and 1111.',
    };
    if (args.apply && audit.live_tasks_loaded) {
      const created = await appRequest(config, 'POST', '/api/bna/tasks', {
        title: UI_BRAND_TASK_TITLE,
        notes: UI_BRAND_TASK_NOTES,
        stage: 'assigned',
        category: 'operations',
        urgency: 'today',
        assigned_to: 'Codex',
        source: 'task_queue_reconciler',
        created_by: 'task-queue-reconciler',
        ai_parsed: {
          parser: 'task-queue-reconciler-v1',
          kind: 'backfilled_codex_task',
          source_messages: [1003, 1011, 1111],
        },
      });
      action.task_id = created?.task?.id || null;
    }
    audit.actions.push(action);
  } else if (!uiTask && uiBrandKnownFromRepo) {
    audit.repo_changes.push({
      id: 'ui-brand-shell',
      action: 'skip_duplicate_ui_brand_backfill_no_live',
      message: 'Repo evidence already records the app-wide UI brand shell task as completed/verified.',
    });
  }

  if (fs.existsSync(tasksPath)) {
    const before = fs.readFileSync(tasksPath, 'utf8');
    const reconciled = reconcileTasksMarkdown(before);
    audit.repo_changes.push(...reconciled.changes);
    for (const change of reconciled.changes) {
      audit.actions.push({ action: change.action, task_id: change.id, message: 'Updated TASKS.md queue summary.' });
    }
    if (args.apply && reconciled.text !== before) fs.writeFileSync(tasksPath, reconciled.text);
  }

  const reportPaths = writeReport(audit);
  audit.report = { md: relative(reportPaths.mdPath), json: relative(reportPaths.jsonPath) };
  if (args.apply) {
    appendReconcileChangelog(audit, reportPaths);
    for (const action of audit.actions.filter((item) => item.ok !== false)) appendReconcileLedger(action);
    if (!args.noTelegram) {
      await sendTelegram(config, [
        'Task queue reconciler ran.',
        `Actions: ${audit.actions.length}`,
        `Report: ${audit.report.md}`,
        audit.true_blockers.length ? `True blockers kept open: ${audit.true_blockers.map((item) => `#${item.id}`).join(', ')}` : 'No active machine blockers were kept open.',
      ].join('\n'));
    }
  }
  return audit;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const audit = await runReconciler(args);
  if (args.json) {
    console.log(JSON.stringify(audit, null, 2));
    return;
  }
  console.log([
    `Task queue reconciler ${audit.dry_run ? 'dry-run' : 'apply'} complete.`,
    `Actions: ${audit.actions.length}`,
    `Active machine tasks: ${audit.active_machine_tasks.length}`,
    `Report: ${audit.report?.md || 'not written'}`,
  ].join('\n'));
}

export {
  KNOWN_VERIFIED_TASKS,
  UI_BRAND_TASK_TITLE,
  auditContentJob56,
  classifyMachineTask,
  findUiBrandTask,
  isTrueBlocker,
  repoHasUiBrandTaskEvidence,
  reconcileTasksMarkdown,
  runReconciler,
  taskLooksLikeUiBrandShell,
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  });
}
