#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

export const TASK_DECISION_LANES = [
  'decisions',
  'tasks',
  'codex_queue',
  'pending',
  'calendar',
  'done_activity'
];

const TERMINAL_STAGES = new Set(['done', 'archive', 'archived', 'complete', 'completed']);
const MACHINE_AGENT_STATUSES = new Set([
  'queued',
  'running',
  'completed',
  'failed',
  'blocked_needs_human_decision'
]);

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
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
    env[key] = value;
  }
  return env;
}

function parseArgs(argv = []) {
  const args = {
    input: '',
    json: false,
    noLive: false,
    noWrite: false,
    limit: 1000
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') args.input = argv[++index] || '';
    else if (arg.startsWith('--input=')) args.input = arg.split('=').slice(1).join('=');
    else if (arg === '--json') args.json = true;
    else if (arg === '--no-live') args.noLive = true;
    else if (arg === '--no-write') args.noWrite = true;
    else if (arg === '--limit') args.limit = Number(argv[++index] || args.limit);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.split('=').slice(1).join('=') || args.limit);
  }
  return args;
}

function nonEmpty(value) {
  return String(value || '').trim();
}

function lower(value) {
  return nonEmpty(value).toLowerCase();
}

function normalizedStage(task = {}) {
  const stage = lower(task.stage || task.workflow_status);
  const aliases = {
    complete: 'done',
    completed: 'done',
    archived: 'archive',
    clarify: 'needs_decision',
    plan: 'needs_decision',
    execute: 'in_progress',
    review: 'needs_decision'
  };
  return aliases[stage] || stage || 'raw_input';
}

function normalizedTaskKind(task = {}) {
  return lower(task.task_kind || task.taskKind || task.item_type || task.itemType || 'task');
}

function normalizedItemType(task = {}) {
  return lower(task.item_type || task.itemType || (task.decision_required ? 'decision' : 'task')) || 'task';
}

function textFingerprint(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function taskTitle(task = {}) {
  return nonEmpty(task.display_title || task.title || task.task_title || `Task ${task.id || ''}`);
}

function taskText(task = {}) {
  return [
    taskTitle(task),
    task.summary,
    task.notes,
    task.next_action,
    task.blocked_reason,
    task.waiting_on,
    task.assigned_to,
    task.decision_owner,
    task.source,
    task.source_channel
  ]
    .filter(Boolean)
    .join('\n');
}

function titleKey(task = {}) {
  return taskTitle(task)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(please|need|needs|build|make|fix|add|create|the|a|an)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function workspaceKey(task = {}) {
  return nonEmpty(task.workspace_key || task.workspace || task.workspace_slug || task.project_key || task.project || 'unknown');
}

function projectKey(task = {}) {
  return nonEmpty(task.project_key || task.project || task.project_slug || task.workspace_key || 'unknown');
}

function redactedScopeKey(value = '') {
  const key = nonEmpty(value || 'unknown') || 'unknown';
  if (['bna', 'one_time_mishnah_class', 'rabbi_sheller_provider', 'platform', 'unknown'].includes(key)) {
    return key;
  }
  if (/^(household|family|student|parent|person|provider)_/i.test(key)) {
    return `private_scope:${textFingerprint(key)}`;
  }
  return `scope:${textFingerprint(key)}`;
}

function isDoneTask(task = {}) {
  const stage = normalizedStage(task);
  return Boolean(task.completed_at || task.verified_at || TERMINAL_STAGES.has(stage) || normalizedTaskKind(task) === 'history');
}

function isDecisionTask(task = {}) {
  const stage = normalizedStage(task);
  return (
    normalizedItemType(task) === 'decision' ||
    normalizedTaskKind(task) === 'decision' ||
    Boolean(task.decision_required) ||
    stage === 'needs_decision'
  );
}

function isMachineTask(task = {}) {
  const text = [task.assigned_to, task.agent_name, task.task_kind, task.agent_status, task.item_type]
    .filter(Boolean)
    .join(' ');
  return /\b(codex|agent|automation|system|kimi)\b/i.test(text) ||
    normalizedTaskKind(task) === 'agent_job' ||
    MACHINE_AGENT_STATUSES.has(lower(task.agent_status));
}

function isCalendarTask(task = {}) {
  return Boolean(task.due_date || task.planned_at || task.calendar_date) && !isDecisionTask(task);
}

function hasHumanOrExternalBlocker(task = {}) {
  const text = taskText(task);
  return /\b(operator|shloimie|rabbi|owner|external|credential|account|dns|domain|legal|billing|payment|resend|vimeo|zoom|stripe|green invoice|wapi|whatsapp|buffer|google|approval|decision|access)\b/i.test(text);
}

function isPendingAccessTask(task = {}) {
  const stage = normalizedStage(task);
  return (
    normalizedTaskKind(task) === 'pending_access' ||
    ['blocked', 'pending', 'waiting', 'needs_operator_decision'].includes(stage) ||
    Boolean(task.waiting_on || task.blocked_reason || task.blocked_at)
  );
}

export function canonicalTaskLane(task = {}) {
  if (isDoneTask(task)) return 'done_activity';
  if (isDecisionTask(task)) return 'decisions';
  if (isMachineTask(task)) return 'codex_queue';
  if (isPendingAccessTask(task)) return 'pending';
  if (isCalendarTask(task)) return 'calendar';
  return 'tasks';
}

function countBy(items, getter) {
  const counts = {};
  for (const item of items) {
    const key = getter(item) || 'unknown';
    counts[key] = Number(counts[key] || 0) + 1;
  }
  return counts;
}

function redactedTaskRef(task = {}) {
  const title = taskTitle(task);
  return {
    task_id: task.id ?? task.task_id ?? null,
    title_fingerprint: textFingerprint(title),
    workspace: redactedScopeKey(workspaceKey(task)),
    project: redactedScopeKey(projectKey(task)),
    lane: canonicalTaskLane(task),
    stage: normalizedStage(task),
    task_kind: normalizedTaskKind(task),
    item_type: normalizedItemType(task),
    assigned_to: nonEmpty(task.assigned_to || ''),
    agent_status: nonEmpty(task.agent_status || ''),
    updated_at: task.updated_at || null
  };
}

function detectViolations(task = {}) {
  const lane = canonicalTaskLane(task);
  const stage = normalizedStage(task);
  const kind = normalizedTaskKind(task);
  const text = taskText(task);
  const title = taskTitle(task);
  const violations = [];

  if (isMachineTask(task) && kind === 'pending_access') {
    violations.push({
      type: 'machine_work_marked_pending_access',
      severity: 'high',
      recommendation: 'Move machine-owned work to Codex Queue or create a linked human Decision for the blocker.'
    });
  }
  if (lane === 'pending' && !hasHumanOrExternalBlocker(task)) {
    violations.push({
      type: 'pending_without_human_or_external_blocker',
      severity: 'medium',
      recommendation: 'Add blocker owner/next action or move the item back to Tasks.'
    });
  }
  if (lane === 'decisions' && !nonEmpty(task.decision_owner || task.assigned_to)) {
    violations.push({
      type: 'decision_without_owner',
      severity: 'medium',
      recommendation: 'Assign a decision owner before keeping it in Decisions.'
    });
  }
  if (lane === 'decisions' && !nonEmpty(task.decision_prompt || task.next_action || task.summary)) {
    violations.push({
      type: 'decision_without_prompt_or_next_action',
      severity: 'medium',
      recommendation: 'Add one concise required choice or next action.'
    });
  }
  if (/\btasks-pending\/|_template-|implementation brief|planned brief|pending brief/i.test(text)) {
    violations.push({
      type: 'internal_brief_visible_as_task',
      severity: 'high',
      recommendation: 'Keep internal handoff files as Codex evidence, not visible operator Tasks.'
    });
  }
  if (/^(raw-|ops\/|memory\/|agent-task-ledger|agent-changelog|watchdog|audit log)/i.test(title)) {
    violations.push({
      type: 'audit_or_source_file_visible_as_task',
      severity: 'medium',
      recommendation: 'Keep audit/source files in evidence/history unless a human action is required.'
    });
  }
  if (title.length > 120 || /\b(i want|i need|you should|do this|all of this|everything above)\b/i.test(title)) {
    violations.push({
      type: 'visible_title_not_distilled',
      severity: 'medium',
      recommendation: 'Rewrite visible title as a concise action while preserving raw wording as provenance.'
    });
  }
  if (stage === 'done' && !nonEmpty(task.verified_at || task.verification_notes || task.proof_status || task.done_link_status)) {
    violations.push({
      type: 'done_without_visible_proof_marker',
      severity: 'low',
      recommendation: 'Attach proof links or verification notes, or reopen if proof is missing.'
    });
  }

  return violations;
}

function duplicateGroups(tasks = []) {
  const groups = new Map();
  for (const task of tasks) {
    if (isDoneTask(task)) continue;
    const key = [workspaceKey(task), projectKey(task), canonicalTaskLane(task), titleKey(task)].join('::');
    if (!titleKey(task) || titleKey(task).length < 12) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(task);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({
      group_key_fingerprint: textFingerprint(key),
      lane: canonicalTaskLane(group[0]),
      workspace: redactedScopeKey(workspaceKey(group[0])),
      project: redactedScopeKey(projectKey(group[0])),
      count: group.length,
      task_ids: group.map((task) => task.id ?? task.task_id).filter(Boolean),
      title_fingerprints: [...new Set(group.map((task) => textFingerprint(taskTitle(task))))],
      dry_run_action: 'archive_or_link_duplicates_after_operator_review'
    }));
}

function buildCleanupPlan({ violations = [], duplicate_groups = [] } = {}) {
  const plan = [];
  for (const group of duplicate_groups) {
    plan.push({
      action: 'archive_or_link_duplicates_after_operator_review',
      reversible: true,
      applies_to: group.task_ids,
      reason: `Duplicate-like ${group.lane} group ${group.group_key_fingerprint}`,
      apply_gate: 'operator approval required'
    });
  }
  for (const violation of violations) {
    const actionByType = {
      machine_work_marked_pending_access: 'move_machine_work_to_codex_queue_or_create_decision',
      pending_without_human_or_external_blocker: 'add_blocker_owner_next_action_or_return_to_tasks',
      decision_without_owner: 'assign_decision_owner',
      decision_without_prompt_or_next_action: 'add_concise_decision_prompt',
      internal_brief_visible_as_task: 'quarantine_internal_brief_card',
      audit_or_source_file_visible_as_task: 'move_audit_source_item_to_history_or_evidence',
      visible_title_not_distilled: 'rewrite_visible_title_preserve_raw_provenance',
      done_without_visible_proof_marker: 'attach_proof_or_reopen'
    };
    plan.push({
      action: actionByType[violation.type] || 'review_item',
      reversible: true,
      applies_to: [violation.task.task_id].filter(Boolean),
      reason: violation.type,
      apply_gate: 'operator approval required'
    });
  }
  return plan;
}

export function buildTaskDecisionCensus({ tasks = [], generated_at = new Date().toISOString(), source = 'unknown', warnings = [] } = {}) {
  const redactedTasks = tasks.map(redactedTaskRef);
  const violations = tasks.flatMap((task) =>
    detectViolations(task).map((violation) => ({
      ...violation,
      task: redactedTaskRef(task)
    }))
  );
  const duplicate_groups = duplicateGroups(tasks);
  const cleanup_plan = buildCleanupPlan({ violations, duplicate_groups });

  return {
    generated_at,
    source,
    read_only: true,
    total_tasks_seen: tasks.length,
    counts: {
      by_lane: countBy(redactedTasks, (task) => task.lane),
      by_stage: countBy(redactedTasks, (task) => task.stage),
      by_task_kind: countBy(redactedTasks, (task) => task.task_kind),
      by_item_type: countBy(redactedTasks, (task) => task.item_type),
      by_agent_status: countBy(redactedTasks, (task) => task.agent_status || 'none'),
      by_workspace: countBy(redactedTasks, (task) => task.workspace),
      by_project: countBy(redactedTasks, (task) => task.project)
    },
    default_view_rules: [
      'Decisions: item_type/task_kind decision, decision_required, or stage needs_decision.',
      'Tasks: human-doable work that is neither blocked, done, decision, nor machine-owned.',
      'Codex Queue: Codex/agent/system work and agent_job rows, including queued/running/failed machine states.',
      'Pending: human or external blockers only, with blocker owner and next action.',
      'Done / Activity: done/archive/history rows with proof or verification notes.'
    ],
    duplicate_groups,
    violations,
    cleanup_plan,
    warnings
  };
}

async function fetchJson(url, options = {}, timeoutMs = 18000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) throw new Error(`${response.status}: ${text.slice(0, 500)}`);
    return text ? JSON.parse(text) : {};
  } finally {
    clearTimeout(timer);
  }
}

async function loadTasksFromApi(env, limit) {
  const appUrl = env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || '';
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!appUrl || !username || !password) {
    return { tasks: [], warning: 'BNA_APP_URL/OPS_USERNAME/OPS_PASSWORD unavailable for live API read.' };
  }
  const data = await fetchJson(`${appUrl.replace(/\/+$/, '')}/api/bna/tasks?limit=${Number(limit || 1000)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
    }
  });
  return { tasks: Array.isArray(data.tasks) ? data.tasks : [], warning: '' };
}

async function loadTasksFromDb(env, limit) {
  if (!env.DATABASE_URL) {
    return { tasks: [], warning: 'DATABASE_URL unavailable for read-only DB census.' };
  }
  const pg = await import('pg');
  const Pool = pg.Pool || pg.default?.Pool;
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1/i.test(env.DATABASE_URL) ? false : { rejectUnauthorized: false }
  });
  try {
    const result = await pool.query(
      `SELECT t.*, p.project_key, p.name AS project_name, w.key AS workspace_key
       FROM bna_tasks t
       LEFT JOIN bna_projects p ON p.id = t.project_id
       LEFT JOIN bna_workspace_settings w ON w.id = t.workspace_id
       ORDER BY t.updated_at DESC NULLS LAST, t.created_at DESC NULLS LAST
       LIMIT $1`,
      [Number(limit || 1000)]
    );
    return { tasks: result.rows || [], warning: '' };
  } finally {
    await pool.end().catch(() => {});
  }
}

async function loadTasks(args) {
  if (args.input) {
    const inputPath = path.resolve(repoRoot, args.input);
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    return {
      tasks: Array.isArray(data) ? data : Array.isArray(data.tasks) ? data.tasks : [],
      source: args.input,
      warnings: []
    };
  }
  if (args.noLive) {
    return { tasks: [], source: 'none', warnings: ['Live reads skipped with --no-live.'] };
  }

  const env = {
    ...readEnvFile(path.join(repoRoot, '.env.local')),
    ...readEnvFile(path.join(repoRoot, '.env')),
    ...process.env
  };
  const warnings = [];
  try {
    const api = await loadTasksFromApi(env, args.limit);
    if (api.tasks.length) return { tasks: api.tasks, source: 'live_api:/api/bna/tasks', warnings };
    if (api.warning) warnings.push(api.warning);
  } catch (error) {
    warnings.push(`Live API read failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    const db = await loadTasksFromDb(env, args.limit);
    if (db.tasks.length) return { tasks: db.tasks, source: 'database:bna_tasks', warnings };
    if (db.warning) warnings.push(db.warning);
  } catch (error) {
    warnings.push(`Read-only DB census failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  return { tasks: [], source: 'none', warnings };
}

function markdownTableRow(values = []) {
  return `| ${values.map((value) => String(value ?? '').replace(/\|/g, '\\|')).join(' | ')} |`;
}

export function censusMarkdown(census = {}) {
  const lines = [
    '# Task And Decision Census',
    '',
    `Generated: ${census.generated_at}`,
    `Source: ${census.source}`,
    `Read only: ${census.read_only ? 'yes' : 'no'}`,
    `Tasks seen: ${census.total_tasks_seen}`,
    '',
    '## Lane Counts',
    '',
    ...TASK_DECISION_LANES.map((lane) => `- ${lane}: ${Number(census.counts?.by_lane?.[lane] || 0)}`),
    '',
    '## Warnings',
    '',
    ...(census.warnings?.length ? census.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## Default View Rules',
    '',
    ...(census.default_view_rules || []).map((rule) => `- ${rule}`),
    '',
    '## Duplicate Groups',
    '',
    markdownTableRow(['Group fingerprint', 'Lane', 'Workspace', 'Project', 'Count', 'Task IDs', 'Dry-run action']),
    markdownTableRow(['---', '---', '---', '---', '---', '---', '---']),
    ...(census.duplicate_groups?.length
      ? census.duplicate_groups.map((group) =>
          markdownTableRow([
            group.group_key_fingerprint,
            group.lane,
            group.workspace,
            group.project,
            group.count,
            group.task_ids.join(', '),
            group.dry_run_action
          ])
        )
      : [markdownTableRow(['none', '', '', '', '0', '', ''])]),
    '',
    '## Violations',
    '',
    markdownTableRow(['Type', 'Severity', 'Task ID', 'Lane', 'Workspace', 'Recommendation']),
    markdownTableRow(['---', '---', '---', '---', '---', '---']),
    ...(census.violations?.length
      ? census.violations.map((violation) =>
          markdownTableRow([
            violation.type,
            violation.severity,
            violation.task?.task_id || '',
            violation.task?.lane || '',
            violation.task?.workspace || '',
            violation.recommendation
          ])
        )
      : [markdownTableRow(['none', '', '', '', '', ''])]),
    '',
    '## Dry-Run Cleanup Plan',
    '',
    markdownTableRow(['Action', 'Reversible', 'Applies to', 'Reason', 'Apply gate']),
    markdownTableRow(['---', '---', '---', '---', '---']),
    ...(census.cleanup_plan?.length
      ? census.cleanup_plan.map((item) =>
          markdownTableRow([
            item.action,
            item.reversible ? 'yes' : 'no',
            (item.applies_to || []).join(', '),
            item.reason,
            item.apply_gate
          ])
        )
      : [markdownTableRow(['none', '', '', '', ''])]),
    '',
    '## Reversible Apply Workflow',
    '',
    '- This report is read-only and does not apply cleanup.',
    '- Before any apply step, export affected task rows and comments.',
    '- Apply one action family at a time: duplicate archive/linking, lane correction, decision owner/prompt repair, proof attachment, then title cleanup.',
    '- Keep internal briefs and raw source wording as evidence/provenance, not visible Pending cards.',
    '- After any approved apply, rerun this census and `npm run bna:run:validate`.',
    ''
  ];
  return `${lines.join('\n')}\n`;
}

function writeCensus(census, { root = repoRoot } = {}) {
  const stamp = String(census.generated_at || new Date().toISOString()).replace(/[:.]/g, '-');
  const dir = path.join(root, 'ops', 'task-decision-census');
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, `${stamp}-task-decision-census.json`);
  const mdPath = path.join(dir, `${stamp}-task-decision-census.md`);
  const latestPath = path.join(dir, 'latest.json');
  fs.writeFileSync(jsonPath, `${JSON.stringify(census, null, 2)}\n`);
  fs.writeFileSync(latestPath, `${JSON.stringify(census, null, 2)}\n`);
  fs.writeFileSync(mdPath, censusMarkdown(census));
  return { jsonPath, mdPath, latestPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const loaded = await loadTasks(args);
  const census = buildTaskDecisionCensus({
    tasks: loaded.tasks,
    source: loaded.source,
    warnings: loaded.warnings
  });
  if (!args.noWrite) {
    const paths = writeCensus(census);
    census.output = {
      json: path.relative(repoRoot, paths.jsonPath).replace(/\\/g, '/'),
      markdown: path.relative(repoRoot, paths.mdPath).replace(/\\/g, '/'),
      latest: path.relative(repoRoot, paths.latestPath).replace(/\\/g, '/')
    };
  }
  if (args.json) {
    console.log(JSON.stringify(census, null, 2));
    return;
  }
  console.log(`Task and Decision census complete. Tasks seen: ${census.total_tasks_seen}`);
  console.log(`Source: ${census.source}`);
  if (census.output?.markdown) console.log(`Report: ${census.output.markdown}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
