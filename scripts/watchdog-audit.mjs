#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const now = new Date();
const today = now.toISOString().slice(0, 10);
const stamp = now.toISOString().slice(0, 16).replace(/:/g, '-');
const staleHours = Number(process.env.WATCHDOG_STALE_HOURS || 6);

const paths = {
  goalsJson: path.join(repoRoot, 'ops', 'operating-goals.json'),
  goalsMd: path.join(repoRoot, 'ops', 'operating-goals.md'),
  promptRegister: path.join(repoRoot, 'ops', 'prompt-intake-register.jsonl'),
  promptSummary: path.join(repoRoot, 'ops', 'prompt-intake-summary.md'),
  watchdogRules: path.join(repoRoot, 'ops', 'watchdog-rules.md'),
  thursdayChecklist: path.join(repoRoot, 'ops', 'thursday-access-checklist.md'),
  ledger: path.join(repoRoot, 'ops', 'agent-task-ledger.jsonl'),
  changelog: path.join(repoRoot, 'ops', 'agent-changelog.md'),
  tasks: path.join(repoRoot, 'TASKS.md'),
  systemState: path.join(repoRoot, 'SYSTEM-STATE.md'),
  memory: path.join(repoRoot, 'MEMORY.md'),
  agents: path.join(repoRoot, 'AGENTS.md'),
  operations: path.join(repoRoot, 'public', 'operations.html'),
  helperRegistry: path.join(repoRoot, 'src', 'lib', 'bna', 'helper', 'tool-registry.js'),
  helperPlanner: path.join(repoRoot, 'src', 'lib', 'bna', 'helper', 'planner.js'),
  helperPermissions: path.join(repoRoot, 'src', 'lib', 'bna', 'helper', 'permissions.js'),
  helperAuditLog: path.join(repoRoot, 'src', 'lib', 'bna', 'helper', 'audit-log.js'),
  helperContext: path.join(repoRoot, 'src', 'lib', 'bna', 'helper', 'context.js'),
  helperResultLinks: path.join(repoRoot, 'src', 'lib', 'bna', 'helper', 'result-links.js'),
};

const SECRET_PATTERNS = [
  { label: 'openai_key', pattern: /\bsk-(?:live|test|proj)?[A-Za-z0-9_-]{16,}\b/g },
  { label: 'stripe_key', pattern: /\b(?:rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g },
  { label: 'github_token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { label: 'telegram_token', pattern: /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/g },
  { label: 'railway_token', pattern: /\brailway_[A-Za-z0-9_-]{20,}\b/gi },
  { label: 'private_key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/g },
  { label: 'google_api_key', pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/g },
  { label: 'oauth_token', pattern: /\bya29\.[0-9A-Za-z_-]{20,}\b/g },
];

const SOURCE_TRUTH_FILES = [
  'AGENTS.md',
  'MEMORY.md',
  'TASKS.md',
  'SYSTEM-STATE.md',
  'ops/operating-goals.md',
  'ops/operating-goals.json',
  'ops/prompt-intake-summary.md',
  'ops/watchdog-rules.md',
];

const TERMINAL_STATUSES = new Set(['superseded', 'done_verified', 'deployed_verified', 'blocked']);
const GOAL_REQUIRED_FIELDS = [
  'goal_id',
  'title',
  'scope',
  'definition_of_done',
  'current_status',
  'codex_workstreams',
  'proof_required',
  'last_updated',
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function posixRelative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(readText(filePath));
  } catch {
    return fallback;
  }
}

function readJsonl(filePath) {
  return readText(filePath)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        return { _parse_error: true, _line: index + 1 };
      }
    });
}

function compact(value = '', max = 260) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, max);
}

function linesWithSingleTrailingNewline(lines) {
  const output = [...lines];
  while (output.length && output[output.length - 1] === '') output.pop();
  return `${output.join('\n')}\n`;
}

function normalizeKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => !['the', 'and', 'for', 'with', 'from', 'into', 'codex'].includes(word))
    .slice(0, 10)
    .join('-') || 'untitled';
}

function walkFiles(dir, { maxDepth = 3, include = () => true } = {}) {
  const results = [];
  function walk(current, depth) {
    if (!fs.existsSync(current) || depth < 0) return;
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'docs', 'public'].includes(entry.name)) walk(full, depth - 1);
      } else if (entry.isFile() && include(full)) {
        results.push(full);
      }
    }
  }
  walk(dir, maxDepth);
  return results;
}

function addFinding(findings, severity, category, title, details, evidence = [], recommendedFix = '') {
  findings.push({
    severity,
    category,
    title,
    details: compact(details, 600),
    evidence: evidence.filter(Boolean).map((item) => compact(item, 260)).slice(0, 8),
    recommendedFix: compact(recommendedFix, 360),
  });
}

function severityRank(severity = '') {
  return { critical: 4, high: 3, medium: 2, low: 1, info: 0 }[String(severity).toLowerCase()] ?? 0;
}

function overallSeverity(findings = []) {
  const sorted = [...findings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  return sorted[0]?.severity || 'ok';
}

function listStatusCounts(items = [], key = 'status') {
  return items.reduce((acc, item) => {
    const value = String(item[key] || 'unknown');
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function duplicateValues(values = []) {
  const counts = new Map();
  for (const value of values.map((item) => String(item || '').trim()).filter(Boolean)) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
}

function markdownGoalIds(text = '') {
  return [...String(text || '').matchAll(/^##\s+(GOAL-\d+)\b/gim)].map((match) => match[1]);
}

function parseMarkdownTasks(text = '') {
  return String(text || '')
    .split(/\r?\n/)
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter((item) => /^\s*-\s+\[[ xX]\]\s+/.test(item.line));
}

function isUncheckedTaskLine(line = '') {
  return /^\s*-\s+\[\s\]\s+/.test(line);
}

function isCheckedTaskLine(line = '') {
  return /^\s*-\s+\[[xX]\]\s+/.test(line);
}

function taskLineHasProof(line = '') {
  return /\b(proof|verified|tests?|smoke|screenshot|deployment|railway|doctor|ops\/|screenshots\/|tasks-pending\/|audit|report|handoff)\b/i.test(line);
}

function promptProofs(record = {}) {
  return [
    ...(Array.isArray(record.linked_proof_paths) ? record.linked_proof_paths : []),
    ...(Array.isArray(record.linked_proof_files) ? record.linked_proof_files : []),
  ].filter(Boolean);
}

function promptTaskLinks(record = {}) {
  return [
    ...(Array.isArray(record.linked_task_ids) ? record.linked_task_ids : []),
    ...(Array.isArray(record.linked_decision_ids) ? record.linked_decision_ids : []),
    ...(Array.isArray(record.linked_pending_ids) ? record.linked_pending_ids : []),
    ...(Array.isArray(record.linked_ledger_records) ? record.linked_ledger_records : []),
  ].filter(Boolean);
}

function terminalLedgerStage(row = {}) {
  const raw = String(row.stage || row.status || row.event || '').toLowerCase();
  if (/deployed|live.*verified|completed_deployed/.test(raw)) return 'deployed_verified';
  if (/done|completed|workstream_done/.test(raw) && /local|followup|required|pending/i.test(`${row.stage || ''} ${row.notes || ''}`)) return 'local_verified';
  if (/done|completed/.test(raw)) return 'done_verified';
  if (/blocked/.test(raw)) return 'blocked';
  if (/started|running|progress|in_progress/.test(raw)) return 'in_progress';
  return raw || 'unknown';
}

function latestLedgerRows(rows = []) {
  const map = new Map();
  for (const row of rows) {
    const key = `${row.cycle_id || ''}|${row.workstream_id || row.title || row.event || ''}`;
    if (!key.replace(/\|/g, '').trim()) continue;
    const stamp = Date.parse(row.recorded_at || row.timestamp || '');
    const current = map.get(key);
    const currentStamp = current ? Date.parse(current.recorded_at || current.timestamp || '') : 0;
    if (!current || (Number.isFinite(stamp) && stamp >= currentStamp)) map.set(key, row);
  }
  return [...map.values()];
}

function scanSecrets(files = []) {
  const findings = [];
  for (const relative of files) {
    const filePath = path.join(repoRoot, relative);
    const text = readText(filePath);
    if (!text) continue;
    const labels = new Set();
    for (const item of SECRET_PATTERNS) {
      item.pattern.lastIndex = 0;
      if (item.pattern.test(text)) labels.add(item.label);
    }
    if (labels.size) findings.push({ file: relative, labels: [...labels] });
  }
  return findings;
}

function goalIdsForRecord(record = {}) {
  if (Array.isArray(record.linked_goal_ids) && record.linked_goal_ids.length) return record.linked_goal_ids;
  const key = String(record.workstream_key || '').toUpperCase();
  const map = {
    WATCHDOG: ['GOAL-009'],
    'PROMPT-INTAKE': ['GOAL-002', 'GOAL-009'],
    'OPERATING-GOALS': ['GOAL-009'],
    'HELPER-03': ['GOAL-001'],
    'OPS-02': ['GOAL-002', 'GOAL-009'],
    'INT-05': ['GOAL-004'],
    'THURSDAY-ACCESS': ['GOAL-004', 'GOAL-006'],
    'RABBI-04': ['GOAL-006'],
    'COMMUNITY-06': ['GOAL-003'],
    'UI-01': ['GOAL-007'],
    'FAMILY-CLEANUP': ['GOAL-008'],
  };
  return map[key] || [];
}

function buildAudit() {
  const findings = [];
  const goalsData = readJson(paths.goalsJson, { goals: [] }) || { goals: [] };
  const goals = Array.isArray(goalsData.goals) ? goalsData.goals : [];
  const promptRecords = readJsonl(paths.promptRegister);
  const ledgerRows = readJsonl(paths.ledger);
  const tasksText = readText(paths.tasks);
  const systemText = readText(paths.systemState);
  const memoryText = readText(paths.memory);
  const operationsText = readText(paths.operations);
  const watchdogRulesText = readText(paths.watchdogRules);
  const thursdayText = readText(paths.thursdayChecklist);
  const helperFiles = [
    paths.helperRegistry,
    paths.helperPlanner,
    paths.helperPermissions,
    paths.helperAuditLog,
    paths.helperContext,
    paths.helperResultLinks,
  ];
  const tasksPendingFiles = walkFiles(path.join(repoRoot, 'tasks-pending'), {
    maxDepth: 1,
    include: (filePath) => path.extname(filePath).toLowerCase() === '.md',
  });
  const memoryFiles = walkFiles(path.join(repoRoot, 'memory'), {
    maxDepth: 1,
    include: (filePath) => path.extname(filePath).toLowerCase() === '.md',
  });

  for (const [label, filePath] of Object.entries({
    'operating goals json': paths.goalsJson,
    'operating goals md': paths.goalsMd,
    'prompt intake register': paths.promptRegister,
    'watchdog rules': paths.watchdogRules,
    'Thursday access checklist': paths.thursdayChecklist,
    'agent ledger': paths.ledger,
    'agent changelog': paths.changelog,
    'TASKS.md': paths.tasks,
    'SYSTEM-STATE.md': paths.systemState,
    'MEMORY.md': paths.memory,
    'AGENTS.md': paths.agents,
  })) {
    if (!fs.existsSync(filePath)) {
      addFinding(findings, 'high', 'source-of-truth drift', `Missing ${label}`, `${posixRelative(filePath)} is required by the repo operating rules.`, [posixRelative(filePath)], 'Create or restore the source-of-truth file before marking ramble-derived work complete.');
    }
  }

  if (!goals.length) {
    addFinding(findings, 'critical', 'goals reviewed', 'Operating goals register is empty', 'The watchdog cannot track goal-led work without machine-readable goals.', ['ops/operating-goals.json'], 'Populate ops/operating-goals.json with current operating goals.');
  }

  const goalIds = new Set(goals.map((goal) => goal.goal_id));
  const duplicateJsonGoals = duplicateValues(goals.map((goal) => goal.goal_id));
  const duplicateMdGoals = duplicateValues(markdownGoalIds(readText(paths.goalsMd)));
  if (duplicateJsonGoals.length || duplicateMdGoals.length) {
    addFinding(
      findings,
      'high',
      'source-of-truth drift',
      'Duplicate operating goal IDs found',
      'Operating goals must have one canonical JSON row and one canonical Markdown section per goal ID.',
      [
        ...duplicateJsonGoals.map((item) => `ops/operating-goals.json ${item.value} x${item.count}`),
        ...duplicateMdGoals.map((item) => `ops/operating-goals.md ${item.value} x${item.count}`),
      ],
      'Merge duplicate goal sections before using the register as an agent handoff source.'
    );
  }

  if (!goalIds.has('GOAL-009') && !goals.some((goal) => /watchdog|ramble-to-execution/i.test(`${goal.title || ''} ${goal.definition_of_done || ''}`))) {
    addFinding(findings, 'high', 'goals reviewed', 'Ramble-to-execution watchdog goal missing', 'The new stable watchdog goal is not represented as a first-class operating goal.', ['ops/operating-goals.json'], 'Add GOAL-009 or equivalent watchdog goal with definition of done and proof requirements.');
  }

  for (const goal of goals) {
    const missing = GOAL_REQUIRED_FIELDS.filter((field) => {
      const value = goal[field] ?? (field === 'current_status' ? goal.status : undefined);
      return Array.isArray(value) ? !value.length : !String(value || '').trim();
    });
    if (missing.length) {
      addFinding(findings, 'medium', 'goals reviewed', `Goal ${goal.goal_id || goal.title || 'unknown'} missing fields`, `Missing fields: ${missing.join(', ')}`, [goal.title || goal.goal_id || 'unknown goal'], 'Fill required fields so the goal can be audited and shown in Operations.');
    }
  }

  const parseErrors = promptRecords.filter((record) => record._parse_error);
  if (parseErrors.length) {
    addFinding(findings, 'high', 'prompt sources reviewed', 'Prompt register has invalid JSONL rows', `${parseErrors.length} prompt register rows could not be parsed.`, parseErrors.slice(0, 5).map((row) => `line ${row._line}`), 'Re-run npm run prompts:audit and inspect malformed appended rows if any remain.');
  }

  const realPromptRecords = promptRecords.filter((record) => !record._parse_error);
  const promptsWithoutPath = realPromptRecords.filter((record) => {
    const status = String(record.status || '').toLowerCase();
    if (TERMINAL_STATUSES.has(status)) return false;
    return !promptTaskLinks(record).length && !promptProofs(record).length && !goalIdsForRecord(record).length;
  });
  if (promptsWithoutPath.length) {
    addFinding(findings, 'medium', 'prompt sources reviewed', 'Prompts without goal/task/proof path', `${promptsWithoutPath.length} prompt sources have no durable goal, task, pending, decision, ledger, or proof path.`, promptsWithoutPath.slice(0, 8).map((record) => `${record.workstream_key || 'UNMAPPED'}: ${record.detected_title || record.source_path}`), 'Map each prompt to a goal/task/proof, mark it superseded, or record the blocker.');
  }

  const localOnlyPrompts = realPromptRecords.filter((record) => String(record.status || '').toLowerCase() === 'local_verified');
  if (localOnlyPrompts.length) {
    addFinding(findings, 'high', 'missing proof', 'Local-verified prompt groups still need deploy/live proof', `${localOnlyPrompts.length} prompt sources are local_verified rather than deployed_verified or done_verified.`, localOnlyPrompts.slice(0, 8).map((record) => `${record.workstream_key}: ${record.detected_title}`), 'Keep them open unless a deployment/live-smoke proof path is added.');
  }

  const duplicateActive = realPromptRecords.filter((record) => record.duplicate_of && !TERMINAL_STATUSES.has(String(record.status || '').toLowerCase()));
  if (duplicateActive.length) {
    addFinding(findings, 'low', 'duplicate work found', 'Duplicate prompt sources are still active', `${duplicateActive.length} duplicate prompt records are not terminal/superseded.`, duplicateActive.slice(0, 8).map((record) => `${record.detected_title} -> ${record.duplicate_of}`), 'Mark duplicates superseded or link them to the canonical source.');
  }

  const latestLedger = latestLedgerRows(ledgerRows.filter((row) => !row._parse_error));
  const staleCutoff = Date.now() - staleHours * 60 * 60 * 1000;
  const staleLedger = latestLedger.filter((row) => {
    const stampMs = Date.parse(row.recorded_at || row.timestamp || '');
    return Number.isFinite(stampMs) && stampMs < staleCutoff && /started|running|progress|in_progress/.test(terminalLedgerStage(row));
  });
  if (staleLedger.length) {
    addFinding(findings, 'high', 'stale work found', 'Stale ledger records need terminal closeout', `${staleLedger.length} latest ledger records are still running/in-progress after ${staleHours} hours.`, staleLedger.slice(0, 10).map((row) => `${row.cycle_id || ''} ${row.workstream_id || ''} ${row.title || row.event || ''}`), 'Append a terminal completed, blocked, superseded, or failed record with proof/blocker.');
  }

  const taskLines = parseMarkdownTasks(tasksText);
  const uncheckedWithoutSource = taskLines
    .filter((item) => isUncheckedTaskLine(item.line))
    .filter((item) => !taskLineHasProof(item.line))
    .slice(0, 40);
  if (uncheckedWithoutSource.length) {
    addFinding(findings, 'low', 'repo/source-of-truth drift', 'Open TASKS.md rows lack obvious source/proof pointers', `${uncheckedWithoutSource.length} open rows do not point to a prompt, handoff, audit, proof, or blocker path.`, uncheckedWithoutSource.slice(0, 8).map((item) => `TASKS.md:${item.lineNumber} ${compact(item.line, 180)}`), 'Add a handoff/proof/source path or clarify the blocker.');
  }

  const doneWithoutProof = taskLines
    .filter((item) => isCheckedTaskLine(item.line))
    .filter((item) => /done|complete|deploy|verify|close/i.test(item.line))
    .filter((item) => !taskLineHasProof(item.line))
    .slice(0, 30);
  if (doneWithoutProof.length) {
    addFinding(findings, 'medium', 'missing proof', 'Done-looking TASKS.md rows lack proof language', `${doneWithoutProof.length} checked rows look complete but do not mention proof, tests, deployment, smoke, audit, or handoff.`, doneWithoutProof.slice(0, 8).map((item) => `TASKS.md:${item.lineNumber} ${compact(item.line, 180)}`), 'Add proof paths or downgrade to local/staged/blocked.');
  }

  const localOnlyMentions = `${tasksText}\n${systemText}\n${memoryText}`
    .split(/\r?\n/)
    .filter((line) => /local[_ -]?verified|completed_local_verification_live_followup_required|locally verified/i.test(line))
    .filter((line) => !/deployed|live smoke|live-smoke|not deployed|follow-up|pending/i.test(line))
    .slice(0, 30);
  if (localOnlyMentions.length) {
    addFinding(findings, 'medium', 'missing proof', 'Local verification wording needs deployment context', `${localOnlyMentions.length} source-of-truth lines mention local verification without immediate deploy/live-smoke context.`, localOnlyMentions.slice(0, 8), 'Clarify whether the item is local-only, deployed verified, blocked, or superseded.');
  }

  const externalAsCodex = taskLines
    .filter((item) => isUncheckedTaskLine(item.line))
    .filter((item) => /\b(zoom|godaddy|dns|vimeo|resend|buffer|wapi|whatsapp|stripe|oauth|credential|api key|billing|legal)\b/i.test(item.line))
    .filter((item) => !/\b(pending|decision|checklist|blocked|approval|external|owner)\b/i.test(item.line))
    .slice(0, 20);
  if (externalAsCodex.length) {
    addFinding(findings, 'medium', 'blocked external actions', 'External blocker may be represented as generic task', `${externalAsCodex.length} open rows mention external/account work without pending/decision/blocker language.`, externalAsCodex.slice(0, 8).map((item) => `TASKS.md:${item.lineNumber} ${compact(item.line, 180)}`), 'Move access/account work into Pending or Decision wording.');
  }

  const requiredThursday = ['Zoom', 'GoDaddy', 'Vimeo', 'Resend', 'Buffer', 'WAPI', 'Stripe', 'Old One Time App'];
  const missingThursday = requiredThursday.filter((label) => !new RegExp(label.replace(/\s+/g, '\\s+'), 'i').test(thursdayText));
  if (missingThursday.length) {
    addFinding(findings, 'high', 'blocked external actions', 'Thursday blockers missing from checklist', `Missing checklist sections: ${missingThursday.join(', ')}`, ['ops/thursday-access-checklist.md'], 'Update the Thursday access checklist before claiming blockers are visible.');
  }

  if (!/watchdog|operating goals/i.test(operationsText) || !/case 'watchdog'|currentView === 'watchdog'|watchdogSection/i.test(operationsText)) {
    addFinding(findings, 'medium', 'UI issues found', 'Operations watchdog control center is missing or only staged in docs', 'The Operations UI does not appear to expose a Watchdog/Goals/Operating Goals module.', ['public/operations.html'], 'Add an Operations Watchdog or Operating Goals section, or record a precise staged blocker.');
  }

  if (/bna-bot-widget\.js/i.test(operationsText)) {
    addFinding(findings, 'high', 'UI issues found', 'Operations mounts public helper widget', 'Operations should use only the private scoped helper entry, not the public helper launcher.', ['public/operations.html'], 'Remove the public helper widget from Operations.');
  }

  const helperMissingFiles = helperFiles.filter((filePath) => !fs.existsSync(filePath)).map(posixRelative);
  if (helperMissingFiles.length) {
    addFinding(findings, 'high', 'helper architecture', 'Helper architecture files missing', 'The helper watchdog foundation requires scoped context, registry, planner/permissions, audit log, and result links.', helperMissingFiles, 'Restore missing helper architecture files before adding more natural-language tools.');
  }

  const helperRegistryText = readText(paths.helperRegistry);
  if (!/buildToolRegistry|tools|requiresConfirmation|execute/i.test(helperRegistryText)) {
    addFinding(findings, 'high', 'helper architecture', 'Helper registry has no obvious registered tools', 'The helper tool registry does not show expected registry/tool execution markers.', ['src/lib/bna/helper/tool-registry.js'], 'Wire actual scoped tools before presenting the helper as an action interface.');
  }

  const stagedToolNames = [
    'capture_ramble',
    'distill_ramble',
    'create_goal',
    'update_goal_status',
    'create_decision',
    'create_pending_item',
    'create_codex_task',
    'link_prompt_to_goal',
    'run_watchdog_audit',
    'show_thursday_blockers',
    'show_goal_status',
    'mark_pending_received',
    'mark_decision_answered',
    'create_ui_audit_issue',
  ];
  const missingToolNames = stagedToolNames.filter((tool) => !helperRegistryText.includes(tool) && !watchdogRulesText.includes(tool));
  if (missingToolNames.length) {
    addFinding(findings, 'medium', 'helper architecture', 'Watchdog helper tools are not registered or staged', `Missing tool names: ${missingToolNames.join(', ')}`, ['ops/watchdog-rules.md', 'src/lib/bna/helper/tool-registry.js'], 'Stage the tool names in watchdog rules or implement them in the scoped helper registry.');
  }

  const secretFindings = scanSecrets(SOURCE_TRUTH_FILES);
  if (secretFindings.length) {
    addFinding(findings, 'critical', 'integration/secret rules', 'Secret-like values found in source-of-truth files', `${secretFindings.length} source-of-truth files contain secret-like patterns. Values are not printed by this audit.`, secretFindings.map((item) => `${item.file}: ${item.labels.join(', ')}`), 'Move secrets to the BNA keyholder/Railway env and replace tracked text with redacted metadata/fingerprints.');
  }

  if (/GoHighLevel|LeadConnector|GHL/i.test(`${readText(path.join(repoRoot, 'README.md'))}\n${tasksText}\n${systemText}`) && !/no-GHL|legacy|archive|historical/i.test(`${tasksText}\n${systemText}`)) {
    addFinding(findings, 'medium', 'repo/source-of-truth drift', 'Possible active GHL wording outside legacy context', 'Current BNA runtime should not add active GHL/LeadConnector assumptions.', ['README.md', 'TASKS.md', 'SYSTEM-STATE.md'], 'Move historical GHL references under archive/legacy language or remove active runtime wording.');
  }

  const ramblesToday = memoryFiles
    .filter((filePath) => path.basename(filePath).startsWith(today))
    .flatMap((filePath) => readText(filePath).split(/\n##\s+/).filter((section) => /ramble|prompt|watchdog|operating|Downloads|Codex/i.test(section)).map((section) => ({ filePath, section: compact(section, 220) })));

  return {
    generated_at: now.toISOString(),
    repo_root: repoRoot,
    stale_hours: staleHours,
    counts: {
      goals_reviewed: goals.length,
      prompt_sources_reviewed: realPromptRecords.length,
      tasks_pending_files_reviewed: tasksPendingFiles.length,
      daily_memory_files_reviewed: memoryFiles.length,
      ledger_rows_reviewed: ledgerRows.filter((row) => !row._parse_error).length,
      stale_work_found: findings.filter((finding) => finding.category === 'stale work found').length,
      duplicate_work_found: findings.filter((finding) => finding.category === 'duplicate work found').length,
      missing_proof_findings: findings.filter((finding) => finding.category === 'missing proof').length,
      blocked_external_action_findings: findings.filter((finding) => finding.category === 'blocked external actions').length,
      ui_issue_findings: findings.filter((finding) => finding.category === 'UI issues found').length,
      source_drift_findings: findings.filter((finding) => finding.category === 'repo/source-of-truth drift' || finding.category === 'source-of-truth drift').length,
      findings_total: findings.length,
    },
    goals,
    prompt_status_counts: listStatusCounts(realPromptRecords),
    prompt_workstream_counts: listStatusCounts(realPromptRecords, 'workstream_key'),
    prompts_without_path: promptsWithoutPath.slice(0, 30),
    local_only_prompts: localOnlyPrompts.slice(0, 30),
    duplicate_active: duplicateActive.slice(0, 30),
    stale_ledger: staleLedger.slice(0, 30),
    unchecked_without_source: uncheckedWithoutSource,
    done_without_proof: doneWithoutProof,
    thursday_missing: missingThursday,
    helper_architecture_present: helperMissingFiles.length === 0,
    rambles_today: ramblesToday.slice(0, 10),
    findings: findings.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.category.localeCompare(b.category)),
  };
}

function findingLines(findings = [], category = '') {
  const list = category ? findings.filter((finding) => finding.category === category) : findings;
  if (!list.length) return ['- None found.'];
  const lines = [];
  for (const finding of list) {
    lines.push(`- **${finding.severity.toUpperCase()}** ${finding.title}: ${finding.details}`);
    if (finding.evidence?.length) {
      lines.push(`  Evidence: ${finding.evidence.join(' | ')}`);
    }
    if (finding.recommendedFix) {
      lines.push(`  Fix: ${finding.recommendedFix}`);
    }
  }
  return lines;
}

function promptSampleLines(records = []) {
  if (!records.length) return ['- None found.'];
  return records.slice(0, 15).map((record) => `- ${record.status || 'unknown'} / ${record.workstream_key || 'UNMAPPED'}: ${record.detected_title || record.source_path}`);
}

function writeMarkdownReport(audit) {
  const reportDir = path.join(repoRoot, 'ops', 'watchdog-audits');
  ensureDir(reportDir);
  const reportPath = path.join(reportDir, `${stamp}-watchdog-audit.md`);
  const lines = [
    `# Watchdog Audit - ${stamp}`,
    '',
    `Generated by \`npm run watchdog:audit\` at ${audit.generated_at}.`,
    '',
    'This report is read-only. It does not stage, commit, deploy, send, publish, charge, change DNS, upload video, grant access, or copy credentials.',
    '',
    '## Totals',
    '',
    `- Overall severity: ${overallSeverity(audit.findings)}`,
    `- Goals reviewed: ${audit.counts.goals_reviewed}`,
    `- Prompt sources reviewed: ${audit.counts.prompt_sources_reviewed}`,
    `- Tasks-pending files reviewed: ${audit.counts.tasks_pending_files_reviewed}`,
    `- Daily memory files reviewed: ${audit.counts.daily_memory_files_reviewed}`,
    `- Ledger rows reviewed: ${audit.counts.ledger_rows_reviewed}`,
    `- Findings total: ${audit.counts.findings_total}`,
    '',
    '## Goals Reviewed',
    '',
    ...audit.goals.map((goal) => `- ${goal.goal_id || 'NO-ID'}: ${goal.title || 'Untitled'} -> ${goal.current_status || goal.status || 'unknown'}`),
    '',
    '## Prompt Sources Reviewed',
    '',
    `- Status counts: ${Object.entries(audit.prompt_status_counts).map(([key, value]) => `${key} ${value}`).join(', ') || 'none'}`,
    `- Workstream counts: ${Object.entries(audit.prompt_workstream_counts).map(([key, value]) => `${key} ${value}`).join(', ') || 'none'}`,
    '',
    '## Stale Work Found',
    '',
    ...findingLines(audit.findings, 'stale work found'),
    '',
    '## Duplicate Work Found',
    '',
    ...findingLines(audit.findings, 'duplicate work found'),
    '',
    '## Missing Proof',
    '',
    ...findingLines(audit.findings, 'missing proof'),
    '',
    '## Blocked External Actions',
    '',
    ...findingLines(audit.findings, 'blocked external actions'),
    '',
    '## UI Issues Found',
    '',
    ...findingLines(audit.findings, 'UI issues found'),
    '',
    '## Repo / Source-Of-Truth Drift',
    '',
    ...findingLines(audit.findings, 'source-of-truth drift'),
    ...findingLines(audit.findings, 'repo/source-of-truth drift'),
    '',
    '## Prompt Sources Without Path',
    '',
    ...promptSampleLines(audit.prompts_without_path),
    '',
    '## Local-Only Prompt Groups',
    '',
    ...promptSampleLines(audit.local_only_prompts),
    '',
    '## Helper Architecture',
    '',
    `- Helper architecture present: ${audit.helper_architecture_present ? 'yes' : 'no'}`,
    ...findingLines(audit.findings, 'helper architecture'),
    '',
    '## Integration / Secret Rules',
    '',
    ...findingLines(audit.findings, 'integration/secret rules'),
    '',
    '## Recommended Fixes',
    '',
    ...audit.findings.slice(0, 20).map((finding) => `- ${finding.title}: ${finding.recommendedFix || 'Review and resolve this finding.'}`),
    '',
    '## Safe Auto-Fixes Applied',
    '',
    '- None. This audit is intentionally read-only.',
    '',
    '## Remaining Human Decisions',
    '',
    '- Thursday access/account-owner decisions remain gated in `ops/thursday-access-checklist.md`.',
    '- Decide whether watchdog audits stay manual (`npm run watchdog:audit`) or become an automatic Downloads/attachments monitor.',
    '- Decide when local/staged watchdog UI and helper tool names should become database-backed live helper actions.',
    '',
  ];
  fs.writeFileSync(reportPath, linesWithSingleTrailingNewline(lines));
  return reportPath;
}

function main() {
  const audit = buildAudit();
  const reportPath = writeMarkdownReport(audit);
  console.log(JSON.stringify({
    ok: true,
    severity: overallSeverity(audit.findings),
    finding_count: audit.findings.length,
    goals_reviewed: audit.counts.goals_reviewed,
    prompt_sources_reviewed: audit.counts.prompt_sources_reviewed,
    report: posixRelative(reportPath),
  }, null, 2));
}

main();
