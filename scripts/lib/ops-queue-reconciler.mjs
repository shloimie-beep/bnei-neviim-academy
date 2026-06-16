import fs from 'fs';
import path from 'path';

export const QUEUE_STATUSES = [
  'active_fresh',
  'active_stale',
  'blocked',
  'pending_shloimie',
  'pending_external',
  'completed_verified',
  'done_missing_report',
  'duplicate',
  'abandoned_unknown',
  'do_not_redo',
];

export const QUEUE_STATUS_LABELS = {
  active_fresh: 'Active fresh',
  active_stale: 'Active stale',
  blocked: 'Blocked',
  pending_shloimie: 'Needs Shloimie',
  pending_external: 'Pending external',
  completed_verified: 'Completed verified',
  done_missing_report: 'Done missing report',
  duplicate: 'Duplicate',
  abandoned_unknown: 'Abandoned/unknown',
  do_not_redo: 'Do not redo',
};

const DEFAULT_CYCLE_ID = '2026-06-15-cycle-ops-queue-helper-integrations';
const DEFAULT_STALE_MINUTES = 15;
const REPORT_PREFIXES = [
  'ops/agent-fleet-runs/',
  'ops/queue-audits/',
  'ops/openai-smokes/',
  'ops/system-audits/',
];
const REPORT_EXTENSIONS = new Set(['.md', '.json', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.pdf']);
const ARTIFACT_PREFIXES = [
  ...REPORT_PREFIXES,
  'tasks-pending/',
  'screenshots/',
  'content-memory/',
  'ops/local-smokes/',
  'ops/playwright-smokes/',
];

const SEED_ROWS = [
  {
    id: 'seed:agents-md',
    source: 'system_state',
    requested_work: 'Define shared agent/task source-of-truth rules',
    current_status: 'completed_verified',
    evidence: ['AGENTS.md names ledger, changelog, TASKS, tasks-pending, memory, and project notes as truth sources.'],
    next_action: 'Preserve contract.',
    confidence: 'high',
  },
  {
    id: 'task:67',
    task_id: 67,
    source: 'tasks_md',
    requested_work: 'Build autonomous Codex agent fleet',
    current_status: 'completed_verified',
    evidence: ['TASKS.md and ledger/changelog evidence say the fleet was built and marked done/verified.'],
    next_action: 'Do not redo; improve visibility only.',
    do_not_redo: true,
    confidence: 'high',
  },
  {
    id: 'task:43',
    task_id: 43,
    source: 'agent_fleet_run',
    requested_work: 'Website image intake and non-redundant blog publishing workflow',
    current_status: 'completed_verified',
    evidence: ['Ledger agent_fleet_task_verified record and PASS report exist.'],
    report_paths: ['ops/agent-fleet-runs/2026-06-05T12-02-29-545Z-task-43.md'],
    next_action: 'Do not requeue.',
    do_not_redo: true,
    confidence: 'high',
  },
  {
    id: 'task:49',
    task_id: 49,
    source: 'agent_fleet_run',
    requested_work: 'Improve spoken Torah engagement parsing and timer mapping',
    current_status: 'completed_verified',
    evidence: ['Ledger agent_fleet_task_verified record and PASS report exist.'],
    report_paths: ['ops/agent-fleet-runs/2026-06-05T12-13-12-980Z-task-49.md'],
    next_action: 'Do not requeue.',
    do_not_redo: true,
    confidence: 'high',
  },
  {
    id: 'task:65',
    task_id: 65,
    source: 'agent_fleet_run',
    requested_work: 'Design student Goal Board, Classroom assignments, and consequence rules',
    current_status: 'completed_verified',
    evidence: ['Planning brief says do not build until explicit request; PASS report exists.'],
    report_paths: [
      'ops/agent-fleet-runs/2026-06-05T12-30-56-424Z-task-65.md',
      'tasks-pending/2026-06-05-student-goal-board-classroom-consequences.md',
    ],
    next_action: 'Keep as handoff; do not implement until explicit request.',
    do_not_redo: true,
    needed_from_shloimie: 'Explicit build request before implementation.',
    confidence: 'high',
  },
  {
    id: 'task:72',
    task_id: 72,
    source: 'agent_fleet_run',
    requested_work: 'Build One Time Mishnah Class project/workspace model',
    current_status: 'completed_verified',
    evidence: ['Ledger says implemented/verified; PASS report exists; pending brief has a stale deploy note.'],
    report_paths: [
      'ops/agent-fleet-runs/2026-06-05T12-54-04-242Z-task-72.md',
      'tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md',
    ],
    next_action: 'Reconcile live deployment state; do not redo implementation.',
    do_not_redo: true,
    confidence: 'high',
  },
  {
    id: 'task:98',
    task_id: 98,
    source: 'agent_fleet_run',
    requested_work: 'Fix Telegram replies that appeared cut off after capture summaries',
    current_status: 'completed_verified',
    evidence: ['Direct verified ledger evidence plus fleet PASS report exist.'],
    report_paths: ['ops/agent-fleet-runs/2026-06-05T12-24-33-913Z-task-98.md'],
    next_action: 'Do not requeue.',
    do_not_redo: true,
    confidence: 'high',
  },
  {
    id: 'task:100',
    task_id: 100,
    source: 'agent_fleet_run',
    requested_work: 'Improve AI ability to investigate/research/help like ChatGPT; question about APIs/frameworks',
    current_status: 'blocked',
    evidence: ['Two fleet FAIL reports and blocked ledger records exist close together.'],
    report_paths: [
      'ops/agent-fleet-runs/2026-06-05T12-55-26-838Z-task-100.md',
      'ops/agent-fleet-runs/2026-06-05T12-56-48-445Z-task-100.md',
    ],
    next_action: 'Surface blocker; do not auto-retry until clarified.',
    blocker: 'Repeated fleet failures indicate the request needs human clarification before another automated pass.',
    needed_from_shloimie: 'Clarify whether this is a product capability request, an API/tooling research task, or a new implementation task.',
    confidence: 'high',
  },
  {
    id: 'task:97',
    task_id: 97,
    source: 'ledger',
    requested_work: 'Speaker-label transcription capability question',
    current_status: 'do_not_redo',
    evidence: ['Ledger says the pure question was answered in chat and archived.'],
    next_action: 'Do not requeue unless a new implementation task is created.',
    do_not_redo: true,
    confidence: 'high',
  },
  {
    id: 'seed:agent-changelog',
    source: 'changelog',
    requested_work: 'Human-readable completed agent work',
    current_status: 'abandoned_unknown',
    evidence: ['ops/agent-changelog.md exists and is parsed for report/proof paths, but it is not itself a normalized status model.'],
    next_action: 'Keep appending; use the reconciler output as the normalized queue-health view.',
    confidence: 'medium',
  },
  {
    id: 'seed:agent-fleet-runs',
    source: 'agent_fleet_run',
    requested_work: 'Agent run proof',
    current_status: 'completed_verified',
    evidence: ['ops/agent-fleet-runs contains PASS/FAIL Markdown and JSON reports used as proof.'],
    next_action: 'Link from Done/history and Queue Health.',
    confidence: 'high',
  },
  {
    id: 'seed:runtime-locks',
    source: 'runtime_lock',
    requested_work: 'Local active worker locks/state',
    current_status: 'abandoned_unknown',
    evidence: ['.runtime/agent-fleet files are local evidence only, not durable repo truth.'],
    next_action: 'Use as freshness evidence; surface stale locks; do not rely on them alone.',
    confidence: 'medium',
  },
  {
    id: 'brief:qstudio-device-control',
    source: 'tasks_pending',
    requested_work: 'QStudio/device-control checklist',
    current_status: 'pending_external',
    evidence: ['Documentation-only brief; real hardware/login/provider verification remains future work.'],
    report_paths: ['tasks-pending/2026-06-05-qstudio-device-control-checklist.md'],
    next_action: 'Do not implement real device control yet.',
    do_not_redo: true,
    needed_from_shloimie: 'Hardware/login/provider verification before implementation.',
    confidence: 'high',
  },
  {
    id: 'brief:goal-board-classroom-consequences',
    source: 'tasks_pending',
    requested_work: 'Goal Board/Classroom/consequence design',
    current_status: 'pending_shloimie',
    evidence: ['Planning-only handoff explicitly says not to build until requested.'],
    report_paths: ['tasks-pending/2026-06-05-student-goal-board-classroom-consequences.md'],
    next_action: 'Keep as handoff; do not build.',
    do_not_redo: true,
    needed_from_shloimie: 'Explicit build request.',
    confidence: 'high',
  },
  {
    id: 'brief:telegram-ai-mode-one-time-rabbi',
    source: 'tasks_pending',
    requested_work: 'Telegram AI mode and One Time/Rabbi setup',
    current_status: 'completed_verified',
    evidence: ['Pending brief has stale deploy note, but later task #72 report says verified.'],
    report_paths: [
      'tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md',
      'ops/agent-fleet-runs/2026-06-05T12-54-04-242Z-task-72.md',
    ],
    next_action: 'Reconcile status; do not redo blindly.',
    do_not_redo: true,
    confidence: 'high',
  },
  {
    id: 'seed:legacy-next-task-api',
    source: 'unknown',
    requested_work: 'Next/Supabase task API under src/app/api/bna/tasks/*',
    current_status: 'do_not_redo',
    evidence: ['Legacy/parallel API uses older stages and Supabase while the live app runs Express server.js.'],
    next_action: 'Do not base queue-health work here unless deliberately migrating.',
    do_not_redo: true,
    confidence: 'high',
  },
];

function unique(values = []) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const text = String(value || '').trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

function limitText(value, max = 260) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3).trim()}...` : text;
}

function safeRead(filePath, fallback = '') {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return fallback;
  }
}

function safeJson(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function safeStat(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function safeDirFiles(dir, predicate = () => true) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && predicate(entry.name))
      .map((entry) => path.join(dir, entry.name));
  } catch {
    return [];
  }
}

function relativePath(repoRoot, filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

export function normalizeRepoPath(value = '') {
  return String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^['"`(]+|['"`),.;:\]]+$/g, '')
    .replace(/:\d+$/, '')
    .replace(/^\.\//, '');
}

function isAllowedPrefix(value, prefixes) {
  const normalized = normalizeRepoPath(value);
  return prefixes.some((prefix) => normalized.startsWith(prefix));
}

export function isAllowedReportPath(value = '') {
  const normalized = normalizeRepoPath(value);
  return isAllowedPrefix(normalized, REPORT_PREFIXES) && REPORT_EXTENSIONS.has(path.extname(normalized).toLowerCase());
}

function isAllowedArtifactPath(value = '') {
  return isAllowedPrefix(value, ARTIFACT_PREFIXES);
}

export function extractRepoPaths(text = '') {
  const value = String(text || '');
  const matches = [];
  const pattern = /\b(?:ops|tasks-pending|screenshots|content-memory)\/[A-Za-z0-9._~!$&'()+,;=:@%\/-]+/g;
  for (const match of value.matchAll(pattern)) {
    const normalized = normalizeRepoPath(match[0]);
    if (isAllowedArtifactPath(normalized)) matches.push(normalized);
  }
  return unique(matches);
}

function extractTaskIds(text = '') {
  const ids = new Set();
  for (const match of String(text || '').matchAll(/(?:task\s*#|#)(\d{1,6})\b/gi)) {
    ids.add(Number(match[1]));
  }
  return [...ids];
}

function toDateMs(value) {
  const ms = Date.parse(value || '');
  return Number.isFinite(ms) ? ms : null;
}

function newestDate(values = []) {
  const dates = values.map(toDateMs).filter(Number.isFinite);
  if (!dates.length) return null;
  return new Date(Math.max(...dates)).toISOString();
}

function normalizeTitleKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(get|need|needs|collect|ask for|request|please|build|make|fix|create|add)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function taskStage(task = {}) {
  const map = {
    inbox: 'raw_input',
    clarify: 'needs_decision',
    plan: 'needs_decision',
    execute: 'in_progress',
    review: 'needs_decision',
    complete: 'done',
  };
  const stage = String(task.stage || '').trim();
  return map[stage] || stage || 'raw_input';
}

function isMachineTask(task = {}) {
  const haystack = [
    task.assigned_to,
    task.agent_status,
    task.task_kind,
    task.item_type,
    task.agent_name,
  ].filter(Boolean).join(' ');
  return /\b(codex|agent|system|kimi|automation)\b/i.test(haystack);
}

function isDoneTask(task = {}) {
  const stage = taskStage(task);
  return Boolean(task.completed_at || task.verified_at || ['done', 'archive'].includes(stage));
}

function isActiveMachineTask(task = {}) {
  const stage = taskStage(task);
  if (!['assigned', 'in_progress'].includes(stage)) return false;
  if (isDoneTask(task)) return false;
  return isMachineTask(task);
}

function getTaskTitle(task = {}) {
  return String(task.display_title || task.title || task.task_title || `Task #${task.id || '?'}`).replace(/\s+/g, ' ').trim();
}

function parseJsonl(filePath, warnings = []) {
  const text = safeRead(filePath);
  if (!text) return [];
  return text.split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), index }))
    .filter((item) => item.line)
    .map(({ line, index }) => {
      const parsed = safeJson(line, null);
      if (!parsed) {
        warnings.push(`Could not parse JSONL line ${index + 1} in ${normalizeRepoPath(filePath)}.`);
        return null;
      }
      return parsed;
    })
    .filter(Boolean);
}

function readLedger(repoRoot, warnings) {
  const filePath = path.join(repoRoot, 'ops', 'agent-task-ledger.jsonl');
  const records = parseJsonl(filePath, warnings).map((record, index) => {
    const taskIds = [
      Number(record.task_id || record.taskId || 0) || null,
      ...extractTaskIds([record.title, record.notes, record.summary, record.blocker].filter(Boolean).join('\n')),
    ].filter(Boolean);
    const paths = extractRepoPaths(JSON.stringify(record));
    return {
      ...record,
      _index: index,
      _task_ids: unique(taskIds.map(String)).map(Number),
      _paths: paths,
      _recorded_at: record.recorded_at || record.timestamp || record.created_at || null,
    };
  });
  return {
    records,
    source: fs.existsSync(filePath) ? 'ops/agent-task-ledger.jsonl' : null,
  };
}

function readChangelog(repoRoot) {
  const filePath = path.join(repoRoot, 'ops', 'agent-changelog.md');
  const text = safeRead(filePath);
  if (!text) return { entries: [], source: null };
  const blocks = text.split(/\n(?=##\s+)/g).filter((block) => block.trim());
  const entries = blocks.map((block, index) => {
    const heading = block.match(/^##\s+([^\n]+)/m)?.[1] || `Changelog entry ${index + 1}`;
    return {
      id: `changelog:${index}`,
      heading,
      text: block,
      task_ids: extractTaskIds(block),
      report_paths: extractRepoPaths(block).filter(isAllowedReportPath),
      artifact_paths: extractRepoPaths(block),
      completed: /\b(complete|completed|verified|pass|done)\b/i.test(block),
      blocked: /\b(blocked|failed|needs decision)\b/i.test(block),
    };
  });
  return { entries, source: 'ops/agent-changelog.md' };
}

function readFleetRuns(repoRoot) {
  const dir = path.join(repoRoot, 'ops', 'agent-fleet-runs');
  const files = safeDirFiles(dir, (name) => /\.(md|json)$/i.test(name));
  const runs = files.map((filePath) => {
    const rel = relativePath(repoRoot, filePath);
    const ext = path.extname(filePath).toLowerCase();
    const text = safeRead(filePath);
    const json = ext === '.json' ? safeJson(text, {}) : {};
    const nameTask = path.basename(filePath).match(/task-(\d+)/i)?.[1];
    const taskId = Number(json.task_id || nameTask || 0) || null;
    const outcomeText = String(json.outcome || json.status || json.result || '');
    const markdownOutcome = text.match(/^Outcome:\s*(PASS|FAIL|OK|ERROR|BLOCKED)/im)?.[1] || '';
    const ok = typeof json.ok === 'boolean'
      ? json.ok
      : /^(PASS|OK|DONE)$/i.test(outcomeText || markdownOutcome);
    const fail = /^(FAIL|ERROR|BLOCKED)$/i.test(outcomeText || markdownOutcome) || json.ok === false;
    const generatedAt = json.generated_at || text.match(/^Generated:\s*([^\n]+)/im)?.[1]?.trim() || null;
    const title = json.title || text.match(/^Task:\s*([^\n]+)/im)?.[1]?.trim() || '';
    const paths = extractRepoPaths(text);
    return {
      id: `fleet-run:${rel}`,
      task_id: taskId,
      path: rel,
      generated_at: generatedAt,
      title,
      outcome: ok ? 'PASS' : fail ? 'FAIL' : 'UNKNOWN',
      ok,
      fail,
      report_paths: isAllowedReportPath(rel) ? [rel] : [],
      artifact_paths: unique([rel, ...paths]),
      evidence: `${ok ? 'PASS' : fail ? 'FAIL' : 'UNKNOWN'} fleet report ${rel}`,
    };
  });
  return {
    runs,
    source: fs.existsSync(dir) ? 'ops/agent-fleet-runs' : null,
  };
}

function readPendingBriefs(repoRoot) {
  const dir = path.join(repoRoot, 'tasks-pending');
  const files = safeDirFiles(dir, (name) => /\.md$/i.test(name))
    .map((filePath) => ({ filePath, stat: safeStat(filePath) }))
    .sort((a, b) => Number(b.stat?.mtimeMs || 0) - Number(a.stat?.mtimeMs || 0));
  const briefs = files.map(({ filePath, stat }) => {
    const rel = relativePath(repoRoot, filePath);
    const text = safeRead(filePath);
    const heading = text.match(/^#\s+([^\n]+)/m)?.[1] || path.basename(filePath, '.md').replace(/-/g, ' ');
    const lower = text.toLowerCase();
    const statusLine = text.match(/^\s*(?:status|current status)\s*:\s*([^\n]+)/im)?.[1]?.trim() || '';
    const planningOnly = /\b(planning-only|planning only|design handoff|do not build|not build until|until .*explicit)\b/i.test(text);
    const documentationOnly = /\b(documentation-only|documentation only|checklist only|docs? only)\b/i.test(text);
    const external = /\b(hardware|login|provider verification|account access|credential|railway|google|third[- ]party|external)\b/i.test(text);
    const stale = /\b(stale|later report|already verified|do not redo|do not re[- ]?do)\b/i.test(text);
    return {
      id: `brief:${rel}`,
      path: rel,
      title: heading,
      status_line: statusLine,
      task_ids: extractTaskIds(text),
      planning_only: planningOnly,
      documentation_only: documentationOnly,
      pending_external: external,
      stale_handoff: stale,
      do_not_redo: planningOnly || documentationOnly || /\bdo not re[- ]?do\b/i.test(text),
      mtime_at: stat ? new Date(stat.mtimeMs).toISOString() : null,
      text: text.slice(0, 12000),
    };
  });
  return {
    briefs,
    source: fs.existsSync(dir) ? 'tasks-pending' : null,
  };
}

function readRuntimeLocks(repoRoot) {
  const dir = path.join(repoRoot, '.runtime', 'agent-fleet');
  const files = safeDirFiles(dir, (name) => /\.json$/i.test(name));
  const locks = files.map((filePath) => {
    const rel = relativePath(repoRoot, filePath);
    const json = safeJson(safeRead(filePath), {}) || {};
    const nameTask = path.basename(filePath).match(/task-(\d+)/i)?.[1];
    const taskId = Number(json.task_id || json.taskId || nameTask || 0) || null;
    return {
      id: `runtime:${rel}`,
      path: rel,
      task_id: taskId,
      pid: json.pid || null,
      run_id: json.run_id || json.runId || null,
      title: json.title || '',
      started_at: json.started_at || json.startedAt || null,
      heartbeat_at: json.heartbeat_at || json.heartbeatAt || json.updated_at || null,
      raw: json,
    };
  });
  return {
    locks,
    source: fs.existsSync(dir) ? '.runtime/agent-fleet' : null,
  };
}

function readOpsQueueArtifacts(repoRoot) {
  const sources = [];
  const pendingDir = path.join(repoRoot, 'ops', 'pending');
  const completedDir = path.join(repoRoot, 'ops', 'completed');
  const items = [];
  for (const [dir, source] of [[pendingDir, 'ops_pending'], [completedDir, 'ops_completed']]) {
    if (!fs.existsSync(dir)) continue;
    sources.push(relativePath(repoRoot, dir));
    for (const filePath of safeDirFiles(dir)) {
      const rel = relativePath(repoRoot, filePath);
      const text = safeRead(filePath);
      const json = path.extname(filePath).toLowerCase() === '.json' ? safeJson(text, {}) : {};
      items.push({
        id: `${source}:${rel}`,
        source,
        path: rel,
        title: json.title || json.summary || path.basename(filePath),
        task_ids: extractTaskIds(text),
        text: text.slice(0, 4000),
      });
    }
  }
  return { items, sources };
}

function emptyTaskGroup(taskId) {
  return {
    task_id: Number(taskId),
    live_task: null,
    ledger_records: [],
    changelog_entries: [],
    fleet_runs: [],
    pending_briefs: [],
    runtime_locks: [],
    ops_artifacts: [],
  };
}

function taskGroupKey(taskId) {
  return String(Number(taskId));
}

function latestLedgerEvent(records = []) {
  return records.slice().sort((a, b) => {
    const aTime = toDateMs(a._recorded_at) ?? a._index ?? 0;
    const bTime = toDateMs(b._recorded_at) ?? b._index ?? 0;
    return bTime - aTime;
  })[0] || null;
}

function latestFleetRun(runs = []) {
  return runs.slice().sort((a, b) => {
    const aTime = toDateMs(a.generated_at) ?? 0;
    const bTime = toDateMs(b.generated_at) ?? 0;
    return bTime - aTime;
  })[0] || null;
}

function latestRuntimeSignal(group = {}) {
  const task = group.live_task || {};
  const lockSignals = (group.runtime_locks || []).flatMap((lock) => [lock.heartbeat_at, lock.started_at]);
  return newestDate([
    ...lockSignals,
    task.agent_job_heartbeat_at,
    task.heartbeat_at,
    task.started_at,
    task.updated_at,
    task.created_at,
  ]);
}

function signalIsFresh(value, nowMs, staleMinutes) {
  const ms = toDateMs(value);
  if (!Number.isFinite(ms)) return false;
  return nowMs - ms <= staleMinutes * 60 * 1000;
}

function groupReportPaths(group = {}, seed = {}) {
  return unique([
    ...(seed.report_paths || []),
    ...(group.ledger_records || []).flatMap((record) => record._paths || []),
    ...(group.changelog_entries || []).flatMap((entry) => entry.report_paths || []),
    ...(group.fleet_runs || []).flatMap((run) => run.report_paths || []),
    ...(group.pending_briefs || []).map((brief) => brief.path),
  ]).filter((item) => isAllowedReportPath(item) || item.startsWith('tasks-pending/'));
}

function groupArtifactPaths(group = {}, seed = {}) {
  return unique([
    ...(seed.artifact_paths || []),
    ...groupReportPaths(group, seed),
    ...(group.ledger_records || []).flatMap((record) => record._paths || []),
    ...(group.changelog_entries || []).flatMap((entry) => entry.artifact_paths || []),
    ...(group.fleet_runs || []).flatMap((run) => run.artifact_paths || []),
    ...(group.runtime_locks || []).map((lock) => lock.path),
  ]).filter(isAllowedArtifactPath);
}

function groupEvidence(group = {}, seed = {}) {
  const task = group.live_task || null;
  const latestLedger = latestLedgerEvent(group.ledger_records || []);
  const latestRun = latestFleetRun(group.fleet_runs || []);
  const evidence = [
    ...(seed.evidence || []),
    task ? `Live task #${task.id} is ${taskStage(task)}${task.assigned_to ? ` assigned to ${task.assigned_to}` : ''}.` : '',
    latestLedger ? `Latest ledger event: ${latestLedger.event || latestLedger.status || 'record'}${latestLedger._recorded_at ? ` at ${latestLedger._recorded_at}` : ''}.` : '',
    latestRun ? `${latestRun.outcome} report: ${latestRun.path}.` : '',
    group.changelog_entries?.length ? `${group.changelog_entries.length} changelog entr${group.changelog_entries.length === 1 ? 'y' : 'ies'} mention this item.` : '',
    group.pending_briefs?.length ? `${group.pending_briefs.length} pending brief${group.pending_briefs.length === 1 ? '' : 's'} mention this item.` : '',
    group.runtime_locks?.length ? `${group.runtime_locks.length} runtime lock/state file${group.runtime_locks.length === 1 ? '' : 's'} mention this item.` : '',
  ].filter(Boolean);
  return unique(evidence).slice(0, 8);
}

function hasDoneLedger(records = []) {
  return records.some((record) => /\b(done|completed|verified|agent_fleet_task_verified|task_verified|task_followup_verified|planning_brief_completed|task_completed)\b/i.test(String(record.event || record.status || record.stage || '')));
}

function hasBlockedLedger(records = []) {
  return records.some((record) => /\b(blocked|failed|needs_decision|agent_fleet_task_blocked)\b/i.test([
    record.event,
    record.status,
    record.stage,
    record.blocker,
    record.notes,
  ].filter(Boolean).join(' ')));
}

function hasArchivedDuplicate(records = []) {
  return records.some((record) => /\b(duplicate|archived|answered in chat|pure question)\b/i.test([
    record.event,
    record.status,
    record.stage,
    record.notes,
    record.summary,
  ].filter(Boolean).join(' ')));
}

function hasCompletionProof(group = {}) {
  const passRun = (group.fleet_runs || []).some((run) => run.ok || run.outcome === 'PASS');
  return passRun
    || hasDoneLedger(group.ledger_records || [])
    || (group.changelog_entries || []).some((entry) => entry.completed)
    || groupReportPaths(group).some(isAllowedReportPath);
}

function hasFailureProof(group = {}) {
  const latestRun = latestFleetRun(group.fleet_runs || []);
  return Boolean(latestRun?.fail)
    || hasBlockedLedger(group.ledger_records || [])
    || (group.changelog_entries || []).some((entry) => entry.blocked);
}

function pendingBriefStatus(group = {}) {
  const briefs = group.pending_briefs || [];
  if (!briefs.length) return null;
  if (briefs.some((brief) => brief.documentation_only || brief.pending_external)) {
    return {
      current_status: 'pending_external',
      next_action: 'Verify the outside account, hardware, or provider state before implementation.',
      needed_from_shloimie: 'External access or verification.',
      do_not_redo: briefs.some((brief) => brief.do_not_redo),
    };
  }
  if (briefs.some((brief) => brief.planning_only || brief.do_not_redo)) {
    return {
      current_status: 'pending_shloimie',
      next_action: 'Wait for an explicit build request before implementation.',
      needed_from_shloimie: 'Explicit approval/build request.',
      do_not_redo: true,
    };
  }
  return null;
}

function livePendingStatus(task = {}) {
  const waiting = String(task.waiting_on || task.decision_owner || '').toLowerCase();
  if (/shloimie|operator|manager/.test(waiting) || task.decision_required || taskStage(task) === 'needs_decision') {
    return {
      current_status: 'pending_shloimie',
      next_action: task.next_action || task.recommended_next_action || 'Shloimie needs to choose or clarify the next step.',
      needed_from_shloimie: task.blocked_reason || task.next_action || 'Decision or clarification.',
    };
  }
  if (waiting && !/codex|agent|system|kimi|automation/.test(waiting)) {
    return {
      current_status: 'pending_external',
      next_action: task.next_action || task.recommended_next_action || 'Wait for the outside input/access, then update the task.',
      needed_from_shloimie: null,
    };
  }
  return null;
}

function requestedWorkForGroup(group = {}, seed = {}) {
  if (seed.requested_work) return seed.requested_work;
  const task = group.live_task || {};
  const runTitle = latestFleetRun(group.fleet_runs || [])?.title;
  const ledgerTitle = latestLedgerEvent(group.ledger_records || [])?.title;
  const briefTitle = group.pending_briefs?.[0]?.title;
  return getTaskTitle(task) || runTitle || ledgerTitle || briefTitle || `Task #${group.task_id}`;
}

function inferTaskStatus(group = {}, seed = {}, options = {}) {
  const nowMs = Number(options.nowMs || Date.now());
  const staleMinutes = Number(options.staleThresholdMinutes || DEFAULT_STALE_MINUTES);
  const task = group.live_task || null;
  const seedStatus = seed.current_status || null;
  const seedIsStrict = Boolean(seed.id && seed.current_status);
  const completionProof = hasCompletionProof(group) || (seed.report_paths || []).length > 0;
  const failureProof = hasFailureProof(group);
  const pendingBrief = pendingBriefStatus(group);
  const livePending = task ? livePendingStatus(task) : null;
  const done = task ? isDoneTask(task) : false;
  const activeMachine = task ? isActiveMachineTask(task) : false;
  const signal = latestRuntimeSignal(group);
  const fresh = signalIsFresh(signal, nowMs, staleMinutes);
  const archivedDuplicate = hasArchivedDuplicate(group.ledger_records || []) || Boolean(task?.duplicate_of_task_id);

  if (seedIsStrict && seedStatus !== 'abandoned_unknown') {
    return {
      current_status: seedStatus,
      next_action: seed.next_action || defaultNextAction(seedStatus),
      safe_to_requeue: false,
      do_not_redo: Boolean(seed.do_not_redo || seedStatus === 'completed_verified' || seedStatus === 'do_not_redo'),
      blocker: seed.blocker || null,
      needed_from_shloimie: seed.needed_from_shloimie || null,
    };
  }

  if (archivedDuplicate) {
    return {
      current_status: 'duplicate',
      next_action: 'Keep archived/linked to the canonical item; create a new task only if Shloimie asks.',
      safe_to_requeue: false,
      do_not_redo: true,
      duplicate_of: task?.duplicate_of_task_id || null,
    };
  }

  if (done && completionProof) {
    return {
      current_status: 'completed_verified',
      next_action: 'Do not redo. Keep proof linked.',
      safe_to_requeue: false,
      do_not_redo: true,
    };
  }

  if (done && !completionProof) {
    return {
      current_status: 'done_missing_report',
      next_action: 'Review and attach/link proof; do not redo by default.',
      safe_to_requeue: false,
      do_not_redo: false,
    };
  }

  if (!task && completionProof && (group.fleet_runs || []).some((run) => run.ok) && hasDoneLedger(group.ledger_records || [])) {
    return {
      current_status: 'completed_verified',
      next_action: 'Do not redo. Keep proof linked.',
      safe_to_requeue: false,
      do_not_redo: true,
    };
  }

  if (failureProof || task?.blocked_reason) {
    return {
      current_status: 'blocked',
      next_action: 'Review blocker before retrying.',
      safe_to_requeue: false,
      do_not_redo: false,
      blocker: task?.blocked_reason || latestLedgerEvent(group.ledger_records || [])?.blocker || null,
      needed_from_shloimie: latestLedgerEvent(group.ledger_records || [])?.needed_from_shloimie || null,
    };
  }

  if (livePending) {
    return {
      ...livePending,
      safe_to_requeue: false,
      do_not_redo: false,
    };
  }

  if (pendingBrief) {
    return {
      ...pendingBrief,
      safe_to_requeue: false,
    };
  }

  if (activeMachine) {
    return fresh
      ? {
        current_status: 'active_fresh',
        next_action: 'Let the current agent run continue; watch heartbeat/report links.',
        safe_to_requeue: false,
        do_not_redo: false,
      }
      : {
        current_status: 'active_stale',
        next_action: 'Review the stale worker/task before requeueing.',
        safe_to_requeue: true,
        do_not_redo: false,
      };
  }

  if (!task && seedStatus) {
    return {
      current_status: seedStatus,
      next_action: seed.next_action || defaultNextAction(seedStatus),
      safe_to_requeue: false,
      do_not_redo: Boolean(seed.do_not_redo || seedStatus === 'completed_verified' || seedStatus === 'do_not_redo'),
      blocker: seed.blocker || null,
      needed_from_shloimie: seed.needed_from_shloimie || null,
    };
  }

  return {
    current_status: 'abandoned_unknown',
    next_action: 'Review and reconcile this item before hiding or requeueing.',
    safe_to_requeue: Boolean(task?.id && isMachineTask(task)),
    do_not_redo: false,
  };
}

function defaultNextAction(status) {
  return ({
    active_fresh: 'Let current work continue.',
    active_stale: 'Review before requeue.',
    blocked: 'Resolve blocker before retry.',
    pending_shloimie: 'Shloimie needs to decide or clarify.',
    pending_external: 'Wait for outside input or account access.',
    completed_verified: 'Do not redo.',
    done_missing_report: 'Attach proof or review.',
    duplicate: 'Do not requeue duplicate.',
    abandoned_unknown: 'Review and reconcile.',
    do_not_redo: 'Do not requeue unless explicitly requested.',
  })[status] || 'Review.';
}

function buildTaskItem(group = {}, seed = {}, options = {}) {
  const inference = inferTaskStatus(group, seed, options);
  const task = group.live_task || null;
  const reportPaths = groupReportPaths(group, seed);
  const artifactPaths = groupArtifactPaths(group, seed);
  const evidence = groupEvidence(group, seed);
  const startedAt = newestDate([
    task?.started_at,
    latestLedgerEvent(group.ledger_records || [])?._recorded_at,
    ...(group.runtime_locks || []).map((lock) => lock.started_at),
  ]);
  const completedAt = newestDate([
    task?.completed_at,
    ...(group.fleet_runs || []).filter((run) => run.ok).map((run) => run.generated_at),
    ...(group.ledger_records || []).filter((record) => /\b(done|verified|completed)\b/i.test(String(record.event || record.status || ''))).map((record) => record._recorded_at),
  ]);
  const verifiedAt = task?.verified_at || completedAt || null;
  const lastSeenAt = newestDate([
    latestRuntimeSignal(group),
    ...(group.fleet_runs || []).map((run) => run.generated_at),
    ...(group.ledger_records || []).map((record) => record._recorded_at),
  ]);
  const source = seed.source || (task ? 'live_task'
    : group.fleet_runs?.length ? 'agent_fleet_run'
      : group.ledger_records?.length ? 'ledger'
        : group.pending_briefs?.length ? 'tasks_pending'
          : group.runtime_locks?.length ? 'runtime_lock'
            : 'unknown');

  return normalizeAuditItem({
    id: seed.id || `task:${group.task_id}`,
    task_id: group.task_id || seed.task_id || task?.id || null,
    source,
    requested_work: requestedWorkForGroup(group, seed),
    status_label: QUEUE_STATUS_LABELS[inference.current_status] || inference.current_status,
    evidence,
    report_paths: reportPaths,
    artifact_paths: artifactPaths,
    confidence: seed.confidence || (task || completionProofFromItem(inference.current_status, reportPaths) ? 'high' : 'medium'),
    duplicate_of: inference.duplicate_of || seed.duplicate_of || null,
    started_at: startedAt,
    completed_at: completedAt,
    verified_at: verifiedAt,
    last_seen_at: lastSeenAt,
    ...inference,
  });
}

function completionProofFromItem(status, reportPaths) {
  return status === 'completed_verified' || (reportPaths || []).length > 0;
}

function normalizeAuditItem(item = {}) {
  const currentStatus = QUEUE_STATUSES.includes(item.current_status) ? item.current_status : 'abandoned_unknown';
  const doNotRedo = Boolean(item.do_not_redo || currentStatus === 'completed_verified' || currentStatus === 'do_not_redo');
  const safe = Boolean(item.safe_to_requeue)
    && !doNotRedo
    && !['completed_verified', 'do_not_redo', 'duplicate', 'pending_shloimie', 'pending_external'].includes(currentStatus);
  return {
    id: String(item.id || `${item.source || 'unknown'}:${item.task_id || item.requested_work || 'item'}`),
    task_id: item.task_id === undefined ? null : item.task_id,
    source: item.source || 'unknown',
    requested_work: limitText(item.requested_work || 'Unlabeled work item', 320),
    current_status: currentStatus,
    status_label: item.status_label || QUEUE_STATUS_LABELS[currentStatus] || currentStatus,
    evidence: unique(item.evidence || []).slice(0, 10),
    report_paths: unique(item.report_paths || []),
    artifact_paths: unique(item.artifact_paths || []),
    next_action: limitText(item.next_action || defaultNextAction(currentStatus), 360),
    safe_to_requeue: safe,
    do_not_redo: doNotRedo,
    duplicate_of: item.duplicate_of || null,
    blocker: item.blocker || null,
    needed_from_shloimie: item.needed_from_shloimie || null,
    last_seen_at: item.last_seen_at || null,
    started_at: item.started_at || null,
    completed_at: item.completed_at || null,
    verified_at: item.verified_at || null,
    confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'medium',
  };
}

function buildStandaloneLedgerItems(records = [], options = {}) {
  const grouped = new Map();
  for (const record of records) {
    if (record._task_ids?.length) continue;
    const key = [
      record.cycle_id || '',
      record.workstream_id || '',
      record.title || record.event || record.status || `record-${record._index}`,
    ].join(':');
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(record);
  }
  const items = [];
  for (const [key, groupRecords] of grouped) {
    const latest = latestLedgerEvent(groupRecords);
    const text = groupRecords.map((record) => JSON.stringify(record)).join('\n');
    const eventText = String(latest?.event || latest?.status || latest?.stage || '').toLowerCase();
    const status = /done|completed|verified/.test(eventText)
      ? 'completed_verified'
      : /blocked|failed|needs_decision/.test(eventText)
        ? 'blocked'
        : signalIsFresh(latest?._recorded_at, options.nowMs || Date.now(), options.staleThresholdMinutes || DEFAULT_STALE_MINUTES)
          ? 'active_fresh'
          : 'active_stale';
    items.push(normalizeAuditItem({
      id: `ledger:${key}`,
      task_id: null,
      source: 'ledger',
      requested_work: latest?.title || latest?.summary || latest?.event || 'Ledger-only work item',
      current_status: status,
      evidence: [`Ledger has ${groupRecords.length} record${groupRecords.length === 1 ? '' : 's'}; latest event is ${latest?.event || latest?.status || 'unknown'}.`],
      report_paths: extractRepoPaths(text).filter(isAllowedReportPath),
      artifact_paths: extractRepoPaths(text),
      next_action: status === 'active_stale' ? 'Review ledger-only started item and append done/blocked evidence.' : defaultNextAction(status),
      safe_to_requeue: false,
      do_not_redo: status === 'completed_verified',
      blocker: latest?.blocker || null,
      needed_from_shloimie: latest?.needed_from_shloimie || null,
      last_seen_at: latest?._recorded_at || null,
      started_at: groupRecords.find((record) => /started/i.test(String(record.event || '')))?._recorded_at || null,
      completed_at: /done|completed|verified/.test(eventText) ? latest?._recorded_at || null : null,
      verified_at: /done|completed|verified/.test(eventText) ? latest?._recorded_at || null : null,
      confidence: 'medium',
    }));
  }
  return items;
}

function buildStandaloneBriefItems(briefs = [], taskIdsSeen = new Set()) {
  return briefs
    .filter((brief) => !brief.task_ids?.some((taskId) => taskIdsSeen.has(Number(taskId))))
    .map((brief) => {
      const status = brief.documentation_only || brief.pending_external
        ? 'pending_external'
        : brief.planning_only || brief.do_not_redo
          ? 'pending_shloimie'
          : brief.stale_handoff
            ? 'abandoned_unknown'
            : 'abandoned_unknown';
      return normalizeAuditItem({
        id: brief.id,
        task_id: null,
        source: 'tasks_pending',
        requested_work: brief.title,
        current_status: status,
        evidence: [
          `${brief.path}${brief.status_line ? ` status: ${brief.status_line}` : ''}.`,
          brief.planning_only ? 'Planning-only boundary detected.' : '',
          brief.documentation_only ? 'Documentation-only boundary detected.' : '',
          brief.pending_external ? 'External account/hardware/provider dependency detected.' : '',
        ].filter(Boolean),
        report_paths: [brief.path],
        artifact_paths: [brief.path],
        next_action: status === 'pending_external'
          ? 'Verify outside access or hardware before implementation.'
          : brief.planning_only
            ? 'Wait for explicit implementation request.'
            : 'Review and reconcile this handoff.',
        safe_to_requeue: false,
        do_not_redo: brief.do_not_redo || brief.planning_only || brief.documentation_only,
        needed_from_shloimie: brief.planning_only ? 'Explicit build request.' : null,
        last_seen_at: brief.mtime_at,
        confidence: brief.do_not_redo ? 'high' : 'medium',
      });
    });
}

function markDuplicateLiveTasks(items = []) {
  const byTitle = new Map();
  for (const item of items) {
    if (!item.task_id || item.current_status === 'completed_verified') continue;
    const key = normalizeTitleKey(item.requested_work);
    if (!key || key.length < 12) continue;
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key).push(item);
  }
  for (const group of byTitle.values()) {
    if (group.length < 2) continue;
    const canonical = group.slice().sort((a, b) => Number(a.task_id || 0) - Number(b.task_id || 0))[0];
    for (const item of group) {
      if (item === canonical) continue;
      if (['completed_verified', 'do_not_redo', 'blocked'].includes(item.current_status)) continue;
      item.current_status = 'duplicate';
      item.status_label = QUEUE_STATUS_LABELS.duplicate;
      item.duplicate_of = canonical.task_id || canonical.id;
      item.safe_to_requeue = false;
      item.do_not_redo = true;
      item.evidence = unique([...item.evidence, `Similar active item found; canonical candidate is ${canonical.task_id ? `task #${canonical.task_id}` : canonical.id}.`]);
      item.next_action = 'Review duplicate linkage; do not requeue unless Shloimie explicitly creates a new task.';
    }
  }
  return items;
}

function sortAuditItems(items = []) {
  const seedOrder = new Map(SEED_ROWS.map((row, index) => [row.id, index]));
  const statusRank = new Map([
    ['active_stale', 1],
    ['blocked', 2],
    ['pending_shloimie', 3],
    ['pending_external', 4],
    ['abandoned_unknown', 5],
    ['done_missing_report', 6],
    ['active_fresh', 7],
    ['duplicate', 8],
    ['completed_verified', 9],
    ['do_not_redo', 10],
  ]);
  return items.slice().sort((a, b) => {
    const aSeed = seedOrder.has(a.id) ? seedOrder.get(a.id) : 9999;
    const bSeed = seedOrder.has(b.id) ? seedOrder.get(b.id) : 9999;
    if (aSeed !== bSeed) return aSeed - bSeed;
    const status = (statusRank.get(a.current_status) || 99) - (statusRank.get(b.current_status) || 99);
    if (status !== 0) return status;
    return String(a.requested_work).localeCompare(String(b.requested_work));
  });
}

function buildCounts(items = []) {
  const counts = Object.fromEntries(QUEUE_STATUSES.map((status) => [status, 0]));
  for (const item of items) {
    counts[item.current_status] = Number(counts[item.current_status] || 0) + 1;
    if (item.do_not_redo && item.current_status !== 'do_not_redo') {
      counts.do_not_redo = Number(counts.do_not_redo || 0) + 1;
    }
  }
  return counts;
}

export function buildQueueAudit({
  repoRoot = process.cwd(),
  liveTasks = [],
  staleThresholdMinutes = Number(process.env.OPS_QUEUE_HEARTBEAT_STALE_MINUTES || DEFAULT_STALE_MINUTES),
  generatedAt = new Date().toISOString(),
  cycleId = DEFAULT_CYCLE_ID,
} = {}) {
  const warnings = [];
  const nowMs = toDateMs(generatedAt) || Date.now();
  const sourcesRead = new Set();
  for (const canonicalSource of ['AGENTS.md', 'TASKS.md', 'SYSTEM-STATE.md']) {
    if (fs.existsSync(path.join(repoRoot, canonicalSource))) sourcesRead.add(canonicalSource);
  }
  const groups = new Map();
  const taskIdsSeen = new Set();

  const ensureGroup = (taskId) => {
    const key = taskGroupKey(taskId);
    taskIdsSeen.add(Number(taskId));
    if (!groups.has(key)) groups.set(key, emptyTaskGroup(taskId));
    return groups.get(key);
  };

  const ledger = readLedger(repoRoot, warnings);
  if (ledger.source) sourcesRead.add(ledger.source);
  for (const record of ledger.records) {
    for (const taskId of record._task_ids || []) ensureGroup(taskId).ledger_records.push(record);
  }

  const changelog = readChangelog(repoRoot);
  if (changelog.source) sourcesRead.add(changelog.source);
  for (const entry of changelog.entries) {
    for (const taskId of entry.task_ids || []) ensureGroup(taskId).changelog_entries.push(entry);
  }

  const fleetRuns = readFleetRuns(repoRoot);
  if (fleetRuns.source) sourcesRead.add(fleetRuns.source);
  for (const run of fleetRuns.runs) {
    if (run.task_id) ensureGroup(run.task_id).fleet_runs.push(run);
  }

  const pendingBriefs = readPendingBriefs(repoRoot);
  if (pendingBriefs.source) sourcesRead.add(pendingBriefs.source);
  for (const brief of pendingBriefs.briefs) {
    for (const taskId of brief.task_ids || []) ensureGroup(taskId).pending_briefs.push(brief);
  }

  const runtimeLocks = readRuntimeLocks(repoRoot);
  if (runtimeLocks.source) sourcesRead.add(runtimeLocks.source);
  for (const lock of runtimeLocks.locks) {
    if (lock.task_id) ensureGroup(lock.task_id).runtime_locks.push(lock);
  }

  const opsArtifacts = readOpsQueueArtifacts(repoRoot);
  for (const source of opsArtifacts.sources) sourcesRead.add(source);
  for (const artifact of opsArtifacts.items) {
    for (const taskId of artifact.task_ids || []) ensureGroup(taskId).ops_artifacts.push(artifact);
  }

  for (const task of liveTasks || []) {
    const id = Number(task.id || task.task_id || 0);
    if (!id) continue;
    ensureGroup(id).live_task = task;
  }
  if (Array.isArray(liveTasks) && liveTasks.length) sourcesRead.add('live_task');
  if (!Array.isArray(liveTasks) || !liveTasks.length) {
    warnings.push('Live task source was unavailable or returned no tasks; live-state confidence is low.');
  }

  const seedByTask = new Map(SEED_ROWS.filter((row) => row.task_id).map((row) => [Number(row.task_id), row]));
  const seededStandalone = SEED_ROWS.filter((row) => !row.task_id).map((row) => normalizeAuditItem(row));
  const taskItems = [];

  for (const seed of SEED_ROWS.filter((row) => row.task_id)) {
    const group = groups.get(taskGroupKey(seed.task_id)) || emptyTaskGroup(seed.task_id);
    taskItems.push(buildTaskItem(group, seed, { nowMs, staleThresholdMinutes }));
  }

  for (const group of groups.values()) {
    if (seedByTask.has(Number(group.task_id))) continue;
    taskItems.push(buildTaskItem(group, {}, { nowMs, staleThresholdMinutes }));
  }

  const standaloneLedger = buildStandaloneLedgerItems(ledger.records, { nowMs, staleThresholdMinutes });
  const standaloneBriefs = buildStandaloneBriefItems(pendingBriefs.briefs, taskIdsSeen);
  const runtimeStandalone = runtimeLocks.locks
    .filter((lock) => !lock.task_id)
    .map((lock) => normalizeAuditItem({
      id: lock.id,
      source: 'runtime_lock',
      requested_work: lock.title || lock.path,
      current_status: signalIsFresh(lock.heartbeat_at || lock.started_at, nowMs, staleThresholdMinutes) ? 'active_fresh' : 'active_stale',
      evidence: [`Runtime lock ${lock.path}${lock.pid ? ` pid ${lock.pid}` : ''}.`],
      artifact_paths: [lock.path],
      next_action: 'Review local runtime lock before assuming worker state.',
      safe_to_requeue: false,
      do_not_redo: false,
      last_seen_at: lock.heartbeat_at || lock.started_at || null,
      started_at: lock.started_at || null,
      confidence: 'low',
    }));

  let items = [
    ...seededStandalone,
    ...taskItems,
    ...standaloneLedger,
    ...standaloneBriefs,
    ...runtimeStandalone,
  ];
  items = markDuplicateLiveTasks(items);
  items = sortAuditItems(items);
  const requeueCandidateItems = items.filter((item) => item.safe_to_requeue);

  return {
    generated_at: generatedAt,
    cycle_id: cycleId,
    counts: buildCounts(items),
    stale_threshold_minutes: Number(staleThresholdMinutes || DEFAULT_STALE_MINUTES),
    sources_read: [...sourcesRead].sort(),
    warnings: unique(warnings),
    requeue_candidates: requeueCandidateItems,
    items,
  };
}

export function requeueCandidates(summary = {}) {
  return (summary.items || []).filter((item) => item.safe_to_requeue);
}

export function summarizeQueueHealthForStatus(summary = {}) {
  const counts = summary.counts || {};
  return {
    active_fresh: Number(counts.active_fresh || 0),
    active_stale: Number(counts.active_stale || 0),
    blocked: Number(counts.blocked || 0),
    pending_shloimie: Number(counts.pending_shloimie || 0),
    pending_external: Number(counts.pending_external || 0),
    completed_verified: Number(counts.completed_verified || 0),
    done_missing_report: Number(counts.done_missing_report || 0),
    duplicate: Number(counts.duplicate || 0),
    abandoned_unknown: Number(counts.abandoned_unknown || 0),
    do_not_redo: Number(counts.do_not_redo || 0),
  };
}

function markdownCell(value = '') {
  return String(value || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>')
    .trim() || 'n/a';
}

export function queueAuditMarkdown(summary = {}) {
  const lines = [
    '# Operations Queue Audit',
    '',
    `Generated: ${summary.generated_at || new Date().toISOString()}`,
    `Cycle: ${summary.cycle_id || DEFAULT_CYCLE_ID}`,
    `Stale threshold: ${summary.stale_threshold_minutes || DEFAULT_STALE_MINUTES} minutes`,
    '',
    '## Counts',
    '',
    ...QUEUE_STATUSES.map((status) => `- ${QUEUE_STATUS_LABELS[status]}: ${Number(summary.counts?.[status] || 0)}`),
    '',
    '## Sources Read',
    '',
    ...(summary.sources_read?.length ? summary.sources_read.map((source) => `- ${source}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(summary.warnings?.length ? summary.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## Queue Audit Result',
    '',
    '| Item/source | Requested work | Current status | Evidence | Link/report | Next action |',
    '|---|---|---|---|---|---|',
  ];
  for (const item of summary.items || []) {
    const itemLabel = item.task_id ? `Task #${item.task_id} (${item.source})` : `${item.id} (${item.source})`;
    lines.push([
      markdownCell(itemLabel),
      markdownCell(item.requested_work),
      markdownCell(`${item.status_label || item.current_status}${item.do_not_redo ? ' / do not redo' : ''}`),
      markdownCell((item.evidence || []).slice(0, 3).join('; ')),
      markdownCell((item.report_paths || []).join('<br>')),
      markdownCell(item.next_action),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function writeQueueAuditFiles(summary = {}, { repoRoot = process.cwd(), stamp = null } = {}) {
  const generatedStamp = stamp || String(summary.generated_at || new Date().toISOString()).replace(/[:.]/g, '-');
  const dir = path.join(repoRoot, 'ops', 'queue-audits');
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, `${generatedStamp}-queue-audit.json`);
  const mdPath = path.join(dir, `${generatedStamp}-queue-audit.md`);
  const latestPath = path.join(dir, 'latest.json');
  fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(latestPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(mdPath, queueAuditMarkdown(summary));
  return {
    jsonPath,
    mdPath,
    latestPath,
  };
}

export function compactConsoleRows(summary = {}, limit = 24) {
  return (summary.items || []).slice(0, limit).map((item) => ({
    item: item.task_id ? `#${item.task_id}` : item.id.slice(0, 28),
    source: item.source,
    status: item.current_status,
    requeue: item.safe_to_requeue ? 'yes' : 'no',
    work: limitText(item.requested_work, 72),
  }));
}
