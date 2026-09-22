#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { buildTaskDecisionCensus } from './task-decision-census.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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
  return {
    apply: argv.includes('--apply'),
    limit: Number(argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 1000)
  };
}

function textFingerprint(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function nonEmpty(value) {
  return String(value || '').trim();
}

function lower(value) {
  return nonEmpty(value).toLowerCase();
}

function taskText(task = {}) {
  return [
    task.title,
    task.display_title,
    task.summary,
    task.notes,
    task.cleaned_summary,
    task.next_action,
    task.waiting_on,
    task.decision_owner,
    task.source,
    task.source_channel,
    task.source_context,
    task.raw_message,
    task.original_raw_message,
    task.project_key,
    task.project_name
  ].filter(Boolean).join('\n');
}

function looksOneTime(task = {}) {
  return /one[_\s-]?time|mishn|rabbi[_\s-]?(scheller|sheller)|ellie\s+scheller/.test(lower(taskText(task)));
}

function isDone(task = {}) {
  const stage = lower(task.stage || task.workflow_status);
  return Boolean(task.completed_at || task.verified_at || task.archived_at || ['done', 'archive', 'archived', 'complete', 'completed'].includes(stage) || lower(task.task_kind) === 'history');
}

function isInternalBrief(task = {}) {
  return /\btasks-pending\/|_template-|implementation brief|planned brief|pending brief/i.test(taskText(task));
}

function hasPrivateRelatedRecord(task = {}) {
  return Boolean(
    task.contact_id ||
    task.student_id ||
    task.parent_id ||
    task.household_id ||
    task.person_id ||
    task.owner_person_id ||
    task.provider_id
  );
}

function rollbackSnapshot(task = {}) {
  return {
    task_id: task.id,
    title_fingerprint: textFingerprint(task.display_title || task.title || `task:${task.id}`),
    project_key: task.project_key || null,
    workspace_key: task.workspace_key || null,
    stage: task.stage || null,
    task_kind: task.task_kind || null,
    item_type: task.item_type || null,
    decision_required: task.decision_required ?? null,
    decision_status: task.decision_status || null,
    archived_at: task.archived_at || null,
    duplicate_archived_at: task.duplicate_archived_at || null,
    decision_hidden_at: task.decision_hidden_at || null,
    canonical_task_id: task.canonical_task_id || null,
    duplicate_of_task_id: task.duplicate_of_task_id || null,
    duplicate_reason: task.duplicate_reason || null,
    updated_at: task.updated_at || null
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

function liveConfig() {
  const env = {
    ...readEnvFile(path.join(repoRoot, '.env.local')),
    ...readEnvFile(path.join(repoRoot, '.env')),
    ...process.env
  };
  const appUrl = env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org';
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!appUrl || !username || !password) {
    throw new Error('BNA_APP_URL/OPS_USERNAME/OPS_PASSWORD are required for production cleanup.');
  }
  return {
    baseUrl: appUrl.replace(/\/+$/, ''),
    headers: {
      'content-type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
    }
  };
}

async function fetchTasks(config, limit) {
  const data = await fetchJson(`${config.baseUrl}/api/bna/tasks?limit=${Number(limit || 1000)}`, {
    headers: config.headers
  });
  return Array.isArray(data.tasks) ? data.tasks : [];
}

async function patchTask(config, id, body) {
  return fetchJson(`${config.baseUrl}/api/bna/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify(body)
  });
}

async function archiveDuplicate(config, id, canonicalId, reason) {
  return fetchJson(`${config.baseUrl}/api/bna/tasks/${encodeURIComponent(id)}/actions/archive-duplicate`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({
      canonical_task_id: canonicalId,
      reason
    })
  });
}

export function buildPlan(tasks = []) {
  const byId = new Map(tasks.map((task) => [Number(task.id), task]));
  const census = buildTaskDecisionCensus({ tasks, source: 'live_api:/api/bna/tasks' });
  const reclassifyOneTime = census.violations
    .filter((violation) => violation.type === 'one_time_record_in_bna')
    .map((violation) => byId.get(Number(violation.task?.task_id)))
    .filter((task) => task && looksOneTime(task))
    .map((task) => ({
      action: 'reclassify_one_time_record',
      task_id: Number(task.id),
      reversible: true,
      before: rollbackSnapshot(task),
      patch: { project_key: 'one_time_mishnah_class' }
    }));

  const quarantineInternalBriefs = census.violations
    .filter((violation) => violation.type === 'internal_brief_visible_as_task')
    .map((violation) => byId.get(Number(violation.task?.task_id)))
    .filter((task) => task && !isDone(task) && isInternalBrief(task))
    .map((task) => ({
      action: 'quarantine_internal_handoff',
      task_id: Number(task.id),
      reversible: true,
      before: rollbackSnapshot(task),
      patch: {
        stage: 'archive',
        task_kind: 'history',
        archived_at: new Date().toISOString(),
        duplicate_reason: 'Batch 3 cleanup: internal handoff brief quarantined from default Task/Decision views.'
      }
    }));

  const archiveDuplicates = [];
  for (const group of census.duplicate_groups || []) {
    const groupTasks = (group.task_ids || []).map((id) => byId.get(Number(id))).filter(Boolean);
    if (!groupTasks.length) continue;
    const projectKeys = new Set(groupTasks.map((task) => task.project_key || ''));
    const oneTimeGroup = projectKeys.has('one_time_mishnah_class') || groupTasks.some(looksOneTime);
    if (!oneTimeGroup) continue;
    if (groupTasks.some(hasPrivateRelatedRecord)) continue;
    const canonical = groupTasks[0];
    for (const duplicate of groupTasks.slice(1)) {
      archiveDuplicates.push({
        action: 'archive_duplicate_task',
        task_id: Number(duplicate.id),
        canonical_task_id: Number(canonical.id),
        reversible: true,
        before: rollbackSnapshot(duplicate),
        reason: 'Batch 3 cleanup: deterministic duplicate task group archived after backup and dry run.'
      });
    }
  }

  return {
    generated_at: new Date().toISOString(),
    mode: 'dry_run',
    total_tasks_seen: tasks.length,
    before_counts: census.counts,
    workspace_isolation_before: census.cleanup_behavior.workspace_isolation_checks,
    actions: [
      ...reclassifyOneTime,
      ...quarantineInternalBriefs,
      ...archiveDuplicates
    ],
    skipped: {
      duplicate_groups_not_applied: (census.duplicate_groups || []).filter((group) => {
        const groupTasks = (group.task_ids || []).map((id) => byId.get(Number(id))).filter(Boolean);
        return !groupTasks.length || groupTasks.some(hasPrivateRelatedRecord) || !(groupTasks.some(looksOneTime) || new Set(groupTasks.map((task) => task.project_key || '')).has('one_time_mishnah_class'));
      }).length
    }
  };
}

function writeReport(report) {
  const dir = path.join(repoRoot, 'ops', 'one-time-mishnah');
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, 'task-decision-production-cleanup.json');
  const mdPath = path.join(dir, 'task-decision-production-cleanup.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    '# One Time Task And Decision Production Cleanup',
    '',
    `Generated: ${report.generated_at}`,
    `Mode: ${report.mode}`,
    `Tasks seen: ${report.total_tasks_seen}`,
    `Actions planned: ${report.actions.length}`,
    `Actions applied: ${report.applied?.length || 0}`,
    `Actions failed: ${report.failed?.length || 0}`,
    '',
    '## Action Counts',
    '',
    ...Object.entries(report.actions.reduce((counts, action) => {
      counts[action.action] = Number(counts[action.action] || 0) + 1;
      return counts;
    }, {})).map(([action, count]) => `- ${action}: ${count}`),
    '',
    '## Safety',
    '',
    '- no hard deletes',
    '- no parent/student/payment/communication records mutated',
    '- duplicate archives use canonical_task_id and duplicate_of_task_id for rollback',
    '- One Time reclassification updates only project scope',
    '- internal handoff quarantine uses archive/history fields only',
    '',
    '## Rollback',
    '',
    '- Restore fields from each action.before object for the affected task_id.',
    '- For duplicate archives, clear archived_at, duplicate_archived_at, duplicate_of_task_id, canonical_task_id, and duplicate_reason from the archived duplicate if rollback is approved.',
    ''
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = liveConfig();
  const tasks = await fetchTasks(config, args.limit);
  const report = buildPlan(tasks);
  if (args.apply) {
    report.mode = 'applied';
    report.applied = [];
    report.failed = [];
    for (const action of report.actions) {
      try {
        if (action.action === 'archive_duplicate_task') {
          await archiveDuplicate(config, action.task_id, action.canonical_task_id, action.reason);
        } else {
          await patchTask(config, action.task_id, action.patch);
        }
        report.applied.push({ action: action.action, task_id: action.task_id, canonical_task_id: action.canonical_task_id || null });
      } catch (error) {
        report.failed.push({ action: action.action, task_id: action.task_id, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  const paths = writeReport(report);
  console.log(`Task/Decision cleanup ${report.mode}. Planned: ${report.actions.length}. Applied: ${report.applied?.length || 0}. Failed: ${report.failed?.length || 0}.`);
  console.log(`Report: ${path.relative(repoRoot, paths.mdPath).replace(/\\/g, '/')}`);
  if (report.failed?.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
