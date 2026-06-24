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

export const TASK_DEFAULT_VIEWS = [
  { id: 'my_tasks', label: 'My Tasks', description: 'Open work owned by Shloimie/operator roles.' },
  { id: 'one_time_tasks', label: 'One Time Tasks', description: 'Open One Time Mishnah Class work only.' },
  { id: 'codex_agent_work', label: 'Codex / Agent Work', description: 'Machine work and observable agent jobs.' },
  { id: 'blocked', label: 'Blocked', description: 'Open work blocked by a human or external account/system.' },
  { id: 'due_soon', label: 'Due Soon', description: 'Open work due within seven days.' },
  { id: 'calendar', label: 'Calendar', description: 'Open work with a planned or due date.' },
  { id: 'completed_activity', label: 'Done / Activity', description: 'Closed work and recent task activity.' },
  { id: 'archived', label: 'Archived', description: 'Reversible archive, duplicate, or hidden records.' }
];

export const DECISION_DEFAULT_VIEWS = [
  { id: 'needs_my_decision', label: 'Needs My Decision', description: 'Open Decisions owned by Shloimie/operator roles.' },
  { id: 'needs_rabbi_scheller', label: 'Needs Rabbi Scheller', description: 'Open Decisions owned by Rabbi Ellie Scheller or provider staff.' },
  { id: 'needs_external_owner', label: 'Needs External Owner', description: 'Open Decisions blocked by an outside account, credential, legal, billing, DNS, or platform owner.' },
  { id: 'decided', label: 'Decided', description: 'Decisions with a selected outcome or terminal lifecycle status.' },
  { id: 'superseded', label: 'Superseded', description: 'Duplicate, stale, or replaced Decision records.' },
  { id: 'archived', label: 'Archived', description: 'Hidden or archived Decision records.' }
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

function normalizeKeyFragment(value, fallback = 'unknown') {
  const normalized = lower(value)
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = nonEmpty(value);
    if (text) return text;
  }
  return '';
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
    task.cleaned_summary,
    task.next_action,
    task.next_action_label,
    task.blocked_reason,
    task.waiting_on,
    task.assigned_to,
    task.decision_owner,
    task.source,
    task.source_channel,
    task.source_context,
    task.raw_message,
    task.original_raw_message
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
  return nonEmpty(task.workspace_key || task.workspace || task.workspace_slug || 'unknown');
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

function isArchivedTask(task = {}) {
  const stage = normalizedStage(task);
  return Boolean(
    task.archived_at ||
    task.duplicate_archived_at ||
    task.decision_hidden_at ||
    stage === 'archive' ||
    stage === 'archived'
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

function parseDateMs(value) {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : null;
}

function latestMeaningfulActivityAt(task = {}) {
  return firstNonEmpty(
    task.last_activity_at,
    task.latest_activity_event_at,
    task.last_comment_at,
    task.updated_at,
    task.completed_at,
    task.verified_at,
    task.created_at
  ) || null;
}

function bucketAgeFromDate(value, generatedAt = new Date().toISOString()) {
  const start = parseDateMs(value);
  const end = parseDateMs(generatedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'unknown';
  const days = Math.max(0, Math.floor((end - start) / (24 * 60 * 60 * 1000)));
  if (days < 1) return '0d';
  if (days <= 2) return '1_2d';
  if (days <= 7) return '3_7d';
  if (days <= 30) return '8_30d';
  if (days <= 90) return '31_90d';
  return '90d_plus';
}

function knownOwnerKey(value = '') {
  const owner = lower(value);
  if (!owner) return '';
  if (/shloimie|operator|manager|platform/.test(owner)) return 'shloimie_platform_operator';
  if (/rabbi|scheller|sheller|provider/.test(owner)) return 'rabbi_ellie_scheller';
  if (/codex|agent|automation|system|openai|kimi/.test(owner)) return 'codex_agent';
  if (/external|account|credential|dns|domain|legal|billing|payment|railway|resend|vimeo|zoom|stripe|whapi|wapi|whatsapp/.test(owner)) return 'external_owner';
  return '';
}

function ownerKey(task = {}) {
  const owner = firstNonEmpty(task.assigned_to, task.decision_owner, task.waiting_on, task.owner, task.owner_name);
  const known = knownOwnerKey(owner);
  if (known) return known;
  return owner ? `owner:${textFingerprint(owner)}` : 'unassigned';
}

function sourceId(task = {}) {
  return firstNonEmpty(
    task.source_id,
    task.sourceId,
    task.source_message_id,
    task.source_chat_id,
    task.raw_input_id,
    task.intake_parse_run_id,
    task.intake_parse_item_id,
    task.source_context?.source_id,
    task.source_context?.sourceId
  );
}

function sourceStatement(task = {}) {
  return firstNonEmpty(
    task.source_statement,
    task.source_statement_id,
    task.source_statement_ids,
    task.original_raw_message,
    task.raw_message,
    task.source_text,
    task.source_context?.statement_id,
    task.source_context?.statement,
    task.notes,
    taskTitle(task)
  );
}

function requirementKey(task = {}) {
  return normalizeKeyFragment(firstNonEmpty(
    task.requirement_id,
    task.requirementId,
    task.requirement,
    task.source_context?.requirement_id,
    task.source_context?.requirementId
  ), 'none');
}

function targetFileRoute(task = {}) {
  return normalizeKeyFragment(firstNonEmpty(
    task.target_file,
    task.target_route,
    task.route,
    task.url_path,
    task.source_context?.target_file,
    task.source_context?.target_route
  ), 'none');
}

function canonicalAction(task = {}) {
  return normalizeKeyFragment(firstNonEmpty(
    task.action_key,
    task.canonical_action,
    task.next_action,
    task.next_action_label,
    task.what,
    titleKey(task)
  ), 'unknown_action');
}

function redactedEntityKey(type, value) {
  const text = nonEmpty(value);
  return text ? `${type}:${textFingerprint(text)}` : '';
}

function relatedEntityKey(task = {}) {
  return firstNonEmpty(
    redactedEntityKey('contact', task.contact_id || task.contactId || task.lead_id),
    redactedEntityKey('student', task.student_id || task.studentId),
    redactedEntityKey('parent', task.parent_id || task.parentId || task.household_id),
    redactedEntityKey('provider', task.provider_id || task.providerId),
    redactedEntityKey('ticket', task.ticket_id || task.ticketId),
    redactedEntityKey('person', task.owner_person_id || task.person_id),
    'none'
  );
}

export function deterministicTaskDedupeKey(task = {}) {
  const basis = [
    normalizeKeyFragment(workspaceKey(task)),
    normalizeKeyFragment(projectKey(task)),
    sourceId(task) ? `source:${normalizeKeyFragment(sourceId(task))}` : `statement:${textFingerprint(sourceStatement(task))}`,
    canonicalAction(task),
    relatedEntityKey(task),
    requirementKey(task),
    targetFileRoute(task)
  ].join('::');
  return textFingerprint(basis);
}

function taskRequirementKey(task = {}) {
  const key = requirementKey(task);
  return key === 'none' ? 'none' : key;
}

function agentRunKey(task = {}) {
  return firstNonEmpty(
    task.latest_agent_job_id,
    task.agent_job_id,
    task.agent_run_id,
    task.agent_ledger_ref,
    task.ledger_ref
  ) ? `agent_run:${textFingerprint(firstNonEmpty(task.latest_agent_job_id, task.agent_job_id, task.agent_run_id, task.agent_ledger_ref, task.ledger_ref))}` : 'none';
}

function statusKey(task = {}) {
  if (isArchivedTask(task)) return 'archived';
  if (isDoneTask(task)) return 'done';
  return normalizeKeyFragment(firstNonEmpty(task.decision_status, task.workflow_status, task.status_detail, normalizedStage(task), canonicalTaskLane(task)));
}

function contactKey(task = {}) {
  return redactedEntityKey('contact', task.contact_id || task.contactId || task.lead_id) || 'none';
}

function studentKey(task = {}) {
  return redactedEntityKey('student', task.student_id || task.studentId) || 'none';
}

function providerKey(task = {}) {
  return redactedEntityKey('provider', task.provider_id || task.providerId || task.provider_key) || 'none';
}

function taskLooksOneTime(task = {}) {
  const scope = `${workspaceKey(task)} ${projectKey(task)} ${taskText(task)}`.toLowerCase();
  return /one[_\s-]?time|mishn|rabbi[_\s-]?(sheller|scheller)|ellie\s+scheller/.test(scope);
}

function taskLooksBna(task = {}) {
  const scope = `${workspaceKey(task)} ${projectKey(task)} ${taskText(task)}`.toLowerCase();
  return /\bbna\b|bnei\s+neviim|yeshiva|school|tuition|parent|student record|accounting/.test(scope);
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
    status: statusKey(task),
    task_kind: normalizedTaskKind(task),
    item_type: normalizedItemType(task),
    owner: ownerKey(task),
    agent_status: nonEmpty(task.agent_status || ''),
    source: sourceId(task) ? `source:${textFingerprint(sourceId(task))}` : 'none',
    requirement: taskRequirementKey(task),
    agent_run: agentRunKey(task),
    contact: contactKey(task),
    student: studentKey(task),
    provider: providerKey(task),
    duplicate_fingerprint: deterministicTaskDedupeKey(task),
    canonical_action_fingerprint: textFingerprint(canonicalAction(task)),
    age_bucket: bucketAgeFromDate(task.created_at),
    last_activity_bucket: bucketAgeFromDate(latestMeaningfulActivityAt(task)),
    latest_meaningful_activity_at: latestMeaningfulActivityAt(task),
    blocker: nonEmpty(task.blocked_reason || task.waiting_on || ''),
    next_action: nonEmpty(task.next_action || task.next_action_label || ''),
    due_date: task.due_date || null,
    updated_at: task.updated_at || null
  };
}

function detectViolations(task = {}, context = {}) {
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
  if (!sourceId(task) && !nonEmpty(task.source || task.source_context || task.original_raw_message || task.raw_message)) {
    violations.push({
      type: 'no_source_record',
      severity: 'medium',
      recommendation: 'Attach source provenance or archive as non-actionable history.'
    });
  }
  if (!nonEmpty(task.workspace_id || task.workspace_key || task.workspace || task.project_key || task.project_id)) {
    violations.push({
      type: 'unscoped_record',
      severity: 'high',
      recommendation: 'Attach the task to exactly one workspace/project or quarantine it from default views.'
    });
  }
  if (!nonEmpty(task.project_id || task.project_key || task.project)) {
    violations.push({
      type: 'orphaned_record',
      severity: 'medium',
      recommendation: 'Attach a project, archive as provenance, or link to the canonical requirement.'
    });
  }
  if (!isDoneTask(task) && ownerKey(task) === 'unassigned') {
    violations.push({
      type: 'no_owner_record',
      severity: 'medium',
      recommendation: 'Assign an owner or move the item out of default active views.'
    });
  }
  if (/^(please|i need|i want|can you|we need|do this|everything|all of this)\b/i.test(title) || /\n/.test(title)) {
    violations.push({
      type: 'raw_prompt_title_visible',
      severity: 'medium',
      recommendation: 'Distill the visible title and keep raw wording only as provenance.'
    });
  }
  if (isMachineTask(task) && !isDoneTask(task) && bucketAgeFromDate(latestMeaningfulActivityAt(task), context.generated_at) === '90d_plus') {
    violations.push({
      type: 'stale_machine_work',
      severity: 'medium',
      recommendation: 'Close, retry, or convert stale machine work into a human Decision with one blocker owner.'
    });
  }
  if (!isDoneTask(task) && /\b(local complete|completed locally|local verification passed|implementation complete)\b/i.test(text)) {
    violations.push({
      type: 'local_complete_still_active',
      severity: 'medium',
      recommendation: 'Move to Completed only with proof/deploy context, or keep active with the exact remaining action.'
    });
  }
  if (!isArchivedTask(task) && isDoneTask(task) && (kind === 'pending_access' || ['pending', 'blocked', 'waiting'].includes(stage))) {
    violations.push({
      type: 'completed_shown_pending',
      severity: 'medium',
      recommendation: 'Normalize the terminal status so completed work is not displayed as active Pending/Blocked.'
    });
  }
  if (workspaceKey(task) === 'rabbi_sheller_provider' && projectKey(task) !== 'one_time_mishnah_class' && taskLooksBna(task)) {
    violations.push({
      type: 'bna_record_in_one_time',
      severity: 'high',
      recommendation: 'Re-scope the BNA record away from One Time defaults after backup/export.'
    });
  }
  if (projectKey(task) !== 'one_time_mishnah_class' && workspaceKey(task) !== 'rabbi_sheller_provider' && taskLooksOneTime(task)) {
    violations.push({
      type: 'one_time_record_in_bna',
      severity: 'high',
      recommendation: 'Re-scope the One Time record to rabbi_sheller_provider / one_time_mishnah_class.'
    });
  }

  return violations;
}

function duplicateGroups(tasks = []) {
  const groups = new Map();
  for (const task of tasks) {
    if (isDoneTask(task)) continue;
    const key = deterministicTaskDedupeKey(task);
    const action = canonicalAction(task);
    if (!action || action.length < 8) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(task);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({
      group_key_fingerprint: key,
      lane: canonicalTaskLane(group[0]),
      workspace: redactedScopeKey(workspaceKey(group[0])),
      project: redactedScopeKey(projectKey(group[0])),
      count: group.length,
      task_ids: group.map((task) => task.id ?? task.task_id).filter(Boolean),
      title_fingerprints: [...new Set(group.map((task) => textFingerprint(taskTitle(task))))],
      source_fingerprints: [...new Set(group.map((task) => sourceId(task) ? textFingerprint(sourceId(task)) : textFingerprint(sourceStatement(task))))],
      stable_key_basis: [
        'workspace',
        'project',
        'source_id_or_statement',
        'canonical_action',
        'related_entity',
        'requirement_id',
        'target_file_or_route'
      ],
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
      done_without_visible_proof_marker: 'attach_proof_or_reopen',
      no_source_record: 'attach_source_or_archive_as_history',
      unscoped_record: 'quarantine_until_workspace_scope_is_set',
      orphaned_record: 'attach_project_or_quarantine',
      no_owner_record: 'assign_owner_or_archive',
      raw_prompt_title_visible: 'distill_title_preserve_raw_provenance',
      stale_machine_work: 'close_retry_or_convert_to_decision',
      local_complete_still_active: 'add_deploy_context_or_restore_active_next_action',
      completed_shown_pending: 'normalize_terminal_status',
      bna_record_in_one_time: 'reclassify_bna_record_out_of_one_time',
      one_time_record_in_bna: 'reclassify_one_time_record_into_one_time_scope',
      repeated_parser_fan_out: 'collapse_parser_fan_out_to_canonical_task',
      repeated_decision: 'archive_duplicate_decisions_keep_canonical'
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
    detectViolations(task, { generated_at }).map((violation) => ({
      ...violation,
      task: redactedTaskRef(task)
    }))
  );
  const duplicate_groups = duplicateGroups(tasks);
  for (const group of duplicate_groups) {
    if (group.lane === 'decisions') {
      violations.push({
        type: 'repeated_decision',
        severity: 'high',
        recommendation: 'Keep one canonical Decision and archive/link duplicate Decision cards.',
        task: {
          task_id: group.task_ids[0] || null,
          lane: group.lane,
          workspace: group.workspace,
          duplicate_fingerprint: group.group_key_fingerprint
        }
      });
    }
    if (group.source_fingerprints.length === 1 && group.count > 2) {
      violations.push({
        type: 'repeated_parser_fan_out',
        severity: 'high',
        recommendation: 'Collapse repeated parser fan-out into one canonical executable requirement and archive duplicates.',
        task: {
          task_id: group.task_ids[0] || null,
          lane: group.lane,
          workspace: group.workspace,
          duplicate_fingerprint: group.group_key_fingerprint
        }
      });
    }
  }
  const cleanup_plan = buildCleanupPlan({ violations, duplicate_groups });
  const beforeCounts = {
    tasks_seen: tasks.length,
    by_lane: countBy(redactedTasks, (task) => task.lane),
    by_workspace: countBy(redactedTasks, (task) => task.workspace),
    by_project: countBy(redactedTasks, (task) => task.project),
    violations: countBy(violations, (violation) => violation.type),
    duplicate_groups: duplicate_groups.length
  };
  const contamination = {
    bna_records_in_one_time: violations.filter((violation) => violation.type === 'bna_record_in_one_time').length,
    one_time_records_in_bna: violations.filter((violation) => violation.type === 'one_time_record_in_bna').length
  };

  return {
    generated_at,
    source,
    read_only: true,
    total_tasks_seen: tasks.length,
    counts: {
      by_lane: countBy(redactedTasks, (task) => task.lane),
      by_stage: countBy(redactedTasks, (task) => task.stage),
      by_status: countBy(redactedTasks, (task) => task.status),
      by_task_kind: countBy(redactedTasks, (task) => task.task_kind),
      by_item_type: countBy(redactedTasks, (task) => task.item_type),
      by_agent_status: countBy(redactedTasks, (task) => task.agent_status || 'none'),
      by_workspace: countBy(redactedTasks, (task) => task.workspace),
      by_project: countBy(redactedTasks, (task) => task.project),
      by_source: countBy(redactedTasks, (task) => task.source),
      by_owner: countBy(redactedTasks, (task) => task.owner),
      by_requirement: countBy(redactedTasks, (task) => task.requirement),
      by_agent_run: countBy(redactedTasks, (task) => task.agent_run),
      by_contact: countBy(redactedTasks, (task) => task.contact),
      by_student: countBy(redactedTasks, (task) => task.student),
      by_provider: countBy(redactedTasks, (task) => task.provider),
      by_duplicate_fingerprint: countBy(redactedTasks, (task) => task.duplicate_fingerprint),
      by_age: countBy(redactedTasks, (task) => task.age_bucket),
      by_last_activity: countBy(redactedTasks, (task) => task.last_activity_bucket)
    },
    default_task_views: TASK_DEFAULT_VIEWS,
    default_decision_views: DECISION_DEFAULT_VIEWS,
    card_contract: [
      'concise title',
      'owner',
      'workspace',
      'project',
      'priority',
      'status',
      'next action',
      'blocker',
      'source',
      'due date',
      'latest meaningful activity',
      'direct action'
    ],
    default_view_rules: [
      'My Tasks: open work assigned to or waiting on Shloimie/operator roles.',
      'One Time Tasks: open rabbi_sheller_provider / one_time_mishnah_class records only.',
      'Codex / Agent Work: Codex/agent/system work and agent_job rows, including queued/running/failed machine states.',
      'Blocked: human or external blockers only, with blocker owner and next action.',
      'Due Soon: open work due within seven days.',
      'Calendar: open work with due_date or planned_at.',
      'Done / Activity: done/archive/history rows with proof or verification notes.',
      'Archived: archived, hidden, or duplicate-archived rows excluded from default active views.'
    ],
    duplicate_groups,
    violations,
    cleanup_plan,
    cleanup_behavior: {
      mode: 'dry_run_only_no_production_mutation',
      backup_export_evidence: 'ops/one-time-mishnah/task-decision-production-census.json',
      dry_run_plan: cleanup_plan,
      before_counts: beforeCounts,
      after_counts_if_applied_now: beforeCounts,
      no_private_parent_student_data_deleted: true,
      rollback_plan: [
        'Export affected bna_tasks rows before any approved mutation.',
        'Apply only reversible archive/quarantine/reclassification fields.',
        'Restore archived_at, duplicate_archived_at, decision_hidden_at, task_kind, stage, project_id, workspace_id, owner, and source fields from the backup export if rollback is needed.',
        'Never hard-delete source provenance, comments, parent/student records, payments, communications, or private notes.'
      ],
      workspace_isolation_checks: {
        bna_records_in_one_time: contamination.bna_records_in_one_time,
        one_time_records_in_bna: contamination.one_time_records_in_bna,
        passed: contamination.bna_records_in_one_time === 0 && contamination.one_time_records_in_bna === 0
      }
    },
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
      `SELECT t.*, p.project_key, p.name AS project_name, w.workspace_key AS workspace_key
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
    '# One Time Task And Decision Production Census',
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
    '## Audit Dimensions',
    '',
    '- workspace',
    '- project',
    '- source',
    '- owner',
    '- status',
    '- requirement',
    '- agent run',
    '- contact',
    '- student',
    '- provider',
    '- duplicate fingerprint',
    '- age',
    '- last activity',
    '',
    '## Default Task Views',
    '',
    markdownTableRow(['View', 'Description']),
    markdownTableRow(['---', '---']),
    ...(census.default_task_views?.length
      ? census.default_task_views.map((view) => markdownTableRow([view.label, view.description]))
      : [markdownTableRow(['none', ''])]),
    '',
    '## Default Decision Views',
    '',
    markdownTableRow(['View', 'Description']),
    markdownTableRow(['---', '---']),
    ...(census.default_decision_views?.length
      ? census.default_decision_views.map((view) => markdownTableRow([view.label, view.description]))
      : [markdownTableRow(['none', ''])]),
    '',
    '## Card Contract',
    '',
    ...(census.card_contract || []).map((field) => `- ${field}`),
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
    markdownTableRow(['Group fingerprint', 'Lane', 'Workspace', 'Project', 'Count', 'Task IDs', 'Source fingerprints', 'Dry-run action']),
    markdownTableRow(['---', '---', '---', '---', '---', '---', '---', '---']),
    ...(census.duplicate_groups?.length
      ? census.duplicate_groups.map((group) =>
          markdownTableRow([
            group.group_key_fingerprint,
            group.lane,
            group.workspace,
            group.project,
            group.count,
            group.task_ids.join(', '),
            (group.source_fingerprints || []).join(', '),
            group.dry_run_action
          ])
        )
      : [markdownTableRow(['none', '', '', '', '0', '', '', ''])]),
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
    '## Before Counts',
    '',
    `- tasks seen: ${Number(census.cleanup_behavior?.before_counts?.tasks_seen || 0)}`,
    `- duplicate groups: ${Number(census.cleanup_behavior?.before_counts?.duplicate_groups || 0)}`,
    `- violation types: ${Object.keys(census.cleanup_behavior?.before_counts?.violations || {}).length}`,
    '',
    '## After Counts',
    '',
    '- dry run only: no production mutation was applied in this census.',
    `- after-count snapshot if applied now: ${Number(census.cleanup_behavior?.after_counts_if_applied_now?.tasks_seen || 0)} tasks seen`,
    '',
    '## Workspace Isolation',
    '',
    `- BNA records in One Time: ${Number(census.cleanup_behavior?.workspace_isolation_checks?.bna_records_in_one_time || 0)}`,
    `- One Time records in BNA: ${Number(census.cleanup_behavior?.workspace_isolation_checks?.one_time_records_in_bna || 0)}`,
    `- Passed: ${census.cleanup_behavior?.workspace_isolation_checks?.passed ? 'yes' : 'no'}`,
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
  const oneTimeDir = path.join(root, 'ops', 'one-time-mishnah');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(oneTimeDir, { recursive: true });
  const jsonPath = path.join(dir, `${stamp}-task-decision-census.json`);
  const mdPath = path.join(dir, `${stamp}-task-decision-census.md`);
  const latestPath = path.join(dir, 'latest.json');
  const oneTimeJsonPath = path.join(oneTimeDir, 'task-decision-production-census.json');
  const oneTimeMdPath = path.join(oneTimeDir, 'task-decision-production-census.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(census, null, 2)}\n`);
  fs.writeFileSync(latestPath, `${JSON.stringify(census, null, 2)}\n`);
  fs.writeFileSync(oneTimeJsonPath, `${JSON.stringify(census, null, 2)}\n`);
  const markdown = censusMarkdown(census);
  fs.writeFileSync(mdPath, markdown);
  fs.writeFileSync(oneTimeMdPath, markdown);
  return {
    jsonPath: oneTimeJsonPath,
    mdPath: oneTimeMdPath,
    latestPath,
    timestampedJsonPath: jsonPath,
    timestampedMdPath: mdPath
  };
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
