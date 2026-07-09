const AGENT_TYPES = new Set([
  'codex_builder',
  'browser_qa',
  'playwright_verifier',
  'research_agent',
  'operator',
]);

const AGENT_RUN_STATUSES = new Set([
  'draft',
  'ready',
  'claimed',
  'running',
  'waiting_operator',
  'submitted',
  'sealed_pass',
  'sealed_fail',
  'blocked',
  'expired',
  'cancelled',
]);

const TERMINAL_RUN_STATUSES = new Set([
  'sealed_pass',
  'sealed_fail',
  'blocked',
  'expired',
  'cancelled',
]);

const VERIFICATION_MODES = new Set([
  'automated',
  'browser_agent',
  'operator',
  'mixed',
]);

const RUN_OUTCOMES = new Set([
  'pass',
  'fail',
  'blocked',
  'needs_operator',
]);

const AGENT_PRIORITIES = new Set(['urgent', 'today', 'normal', 'low']);

const IMPLEMENTATION_STATUSES = new Set([
  'not_started',
  'in_progress',
  'complete',
  'blocked',
  'not_required',
]);

const VERIFICATION_STATUSES = new Set([
  'not_required',
  'needed',
  'ready',
  'running',
  'submitted',
  'passed',
  'failed',
  'blocked',
  'needs_operator',
]);

const DEFAULT_AGENT_PROFILES = [
  {
    agent_key: 'codex_builder',
    display_name: 'Codex Builder',
    agent_type: 'codex_builder',
    description: 'Repository implementation, migrations, tests, and deployment preparation.',
    workspace_scope_mode: 'scoped',
    capabilities: ['repo_write', 'run_tests', 'post_agent_progress'],
  },
  {
    agent_key: 'browser_qa',
    display_name: 'Browser QA',
    agent_type: 'browser_qa',
    description: 'Agent Mode browser walkthroughs, UI acceptance, and safe read-only verification.',
    workspace_scope_mode: 'assigned_run',
    capabilities: [
      'browser_read',
      'browser_safe_interaction',
      'visual_review',
      'post_agent_progress',
      'submit_verification',
      'request_operator_decision',
    ],
  },
  {
    agent_key: 'playwright_verifier',
    display_name: 'Playwright Verifier',
    agent_type: 'playwright_verifier',
    description: 'Deterministic route, viewport, console, and regression verification.',
    workspace_scope_mode: 'scoped',
    capabilities: ['run_tests', 'browser_read', 'post_agent_progress', 'submit_verification'],
  },
  {
    agent_key: 'research_agent',
    display_name: 'Research Agent',
    agent_type: 'research_agent',
    description: 'Public research and source collection without private-group scraping or unauthorized harvesting.',
    workspace_scope_mode: 'scoped',
    capabilities: ['external_research', 'post_agent_progress', 'submit_verification'],
  },
  {
    agent_key: 'operator',
    display_name: 'Operator',
    agent_type: 'operator',
    description: 'Human approvals for credentials, destructive actions, external account authorization, and release.',
    workspace_scope_mode: 'manual',
    capabilities: ['request_operator_decision', 'production_deploy', 'production_write'],
  },
];

const BROWSER_QA_TEMPLATE_VERSION = 2;

const BROWSER_QA_TEMPLATE = `You are the Browser QA verifier for Bnei Neviim Academy.

Agent Run:
{{run_id}}

Parent Task:
{{task_ref}}

Workspace:
{{workspace}}

Target:
{{target_url}}

Your job:
{{purpose}}

Acceptance criteria:
{{acceptance_criteria}}

Allowed:
{{allowed_actions}}

Forbidden:
{{forbidden_actions}}

Start:
1. Open the Agent Run URL:
   {{agent_run_url}}
2. If login is required, pause for browser takeover.
3. Click Claim Run or Start/Claim Run.
4. Post progress: Started: claimed run and opened task verification checklist.
5. Keep two tabs when possible: the Run tab and a Target tab.
6. Perform every acceptance criterion and task-note check that is safely reachable.
7. Attach/reference evidence for each major route, viewport, or blocked step.
8. Post progress after each major section with short factual notes only.

Pass / fail / blocked rules:
- Pass only when every acceptance criterion is verified with evidence.
- Fail when the target is reachable but the implementation is visibly wrong.
- Blocked/Needs Operator when verification cannot continue because access, route,
  canonical URL, safe test mode, credential, or product spec is missing.
- If a page shows raw server text such as Cannot GET, a browser 404, a broken
  route, missing login takeover, missing safe-smoke control, or an unclear
  canonical URL, attach evidence and submit/seal as Blocked/Needs Operator.
- Do not ask the operator whether to submit, seal, or report a blocked run.
  That is part of your autonomous verification job.
- Do not check automated gates unless real gate output is visible in the run or
  task notes.

Submit and seal:
1. Return to the Run tab.
2. Set the outcome to Pass, Fail, or Blocked/Needs Operator.
3. Fill the Summary with the tested count, result, and key finding.
4. Mark every acceptance criterion Pass, Fail, Blocked, or Needs Operator.
5. Fill the Blocker / Operator Decision field when blocked with the exact next
   action needed.
6. Click Submit Result.
7. Click Seal Run.
8. Confirm the page shows a sealed/completed status before ending.

Do not finish only in chat. The authoritative result must be submitted and sealed inside BNA Operations.`;

const createAgentControlSQL = `
CREATE TABLE IF NOT EXISTS bna_agent_profiles (
  id SERIAL PRIMARY KEY,
  agent_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  description TEXT,
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  workspace_scope_mode TEXT NOT NULL DEFAULT 'scoped',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_agent_profiles DROP CONSTRAINT IF EXISTS bna_agent_profiles_agent_type_check;
ALTER TABLE bna_agent_profiles
  ADD CONSTRAINT bna_agent_profiles_agent_type_check
  CHECK (agent_type IN ('codex_builder', 'browser_qa', 'playwright_verifier', 'research_agent', 'operator'));
CREATE INDEX IF NOT EXISTS idx_bna_agent_profiles_type ON bna_agent_profiles (agent_type, active);

CREATE TABLE IF NOT EXISTS bna_agent_prompt_templates (
  id SERIAL PRIMARY KEY,
  template_key TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  agent_type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  template_text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  change_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (template_key, version)
);

ALTER TABLE bna_agent_prompt_templates DROP CONSTRAINT IF EXISTS bna_agent_prompt_templates_agent_type_check;
ALTER TABLE bna_agent_prompt_templates
  ADD CONSTRAINT bna_agent_prompt_templates_agent_type_check
  CHECK (agent_type IN ('codex_builder', 'browser_qa', 'playwright_verifier', 'research_agent', 'operator'));
CREATE INDEX IF NOT EXISTS idx_bna_agent_prompt_templates_active ON bna_agent_prompt_templates (template_key, active, version DESC);

CREATE TABLE IF NOT EXISTS bna_agent_runs (
  id SERIAL PRIMARY KEY,
  run_key TEXT NOT NULL UNIQUE,
  task_id INTEGER REFERENCES bna_tasks(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES bna_workspace_settings(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  batch_id TEXT,
  agent_profile_id INTEGER REFERENCES bna_agent_profiles(id) ON DELETE SET NULL,
  run_type TEXT NOT NULL DEFAULT 'verification',
  verification_mode TEXT NOT NULL DEFAULT 'mixed',
  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT NOT NULL DEFAULT 'normal',
  prompt_version INTEGER NOT NULL DEFAULT 1,
  prompt_text TEXT NOT NULL DEFAULT '',
  target_url TEXT,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  allowed_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  forbidden_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  claimed_by TEXT,
  claimed_at TIMESTAMP,
  started_at TIMESTAMP,
  last_progress_at TIMESTAMP,
  submitted_at TIMESTAMP,
  sealed_at TIMESTAMP,
  expires_at TIMESTAMP,
  result_summary TEXT,
  result_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  failure_reason TEXT,
  blocker TEXT,
  operator_decision_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS run_key TEXT;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS task_id INTEGER;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS workspace_id INTEGER;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS project_id INTEGER;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS agent_profile_id INTEGER;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS run_type TEXT DEFAULT 'verification';
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS verification_mode TEXT DEFAULT 'mixed';
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS prompt_version INTEGER DEFAULT 1;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS prompt_text TEXT DEFAULT '';
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS acceptance_criteria JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS allowed_actions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS forbidden_actions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS context_snapshot JSONB DEFAULT '{}'::jsonb;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS claimed_by TEXT;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS last_progress_at TIMESTAMP;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS sealed_at TIMESTAMP;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS result_summary TEXT;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS result_payload JSONB DEFAULT '{}'::jsonb;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS blocker TEXT;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS operator_decision_id INTEGER;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system';
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bna_agent_runs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE bna_agent_runs DROP CONSTRAINT IF EXISTS bna_agent_runs_status_check;
ALTER TABLE bna_agent_runs
  ADD CONSTRAINT bna_agent_runs_status_check
  CHECK (status IN ('draft', 'ready', 'claimed', 'running', 'waiting_operator', 'submitted', 'sealed_pass', 'sealed_fail', 'blocked', 'expired', 'cancelled'));
ALTER TABLE bna_agent_runs DROP CONSTRAINT IF EXISTS bna_agent_runs_verification_mode_check;
ALTER TABLE bna_agent_runs
  ADD CONSTRAINT bna_agent_runs_verification_mode_check
  CHECK (verification_mode IN ('automated', 'browser_agent', 'operator', 'mixed'));
ALTER TABLE bna_agent_runs DROP CONSTRAINT IF EXISTS bna_agent_runs_priority_check;
ALTER TABLE bna_agent_runs
  ADD CONSTRAINT bna_agent_runs_priority_check
  CHECK (priority IN ('urgent', 'today', 'normal', 'low'));

CREATE TABLE IF NOT EXISTS bna_agent_run_events (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES bna_agent_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'system',
  actor_id TEXT,
  actor_name TEXT,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_agent_run_artifacts (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES bna_agent_runs(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL DEFAULT 'Evidence',
  path TEXT,
  url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  redaction_status TEXT NOT NULL DEFAULT 'not_needed',
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_agent_run_artifacts DROP CONSTRAINT IF EXISTS bna_agent_run_artifacts_type_check;
ALTER TABLE bna_agent_run_artifacts
  ADD CONSTRAINT bna_agent_run_artifacts_type_check
  CHECK (artifact_type IN ('screenshot', 'report', 'log', 'test_result', 'route', 'console_error', 'network_error', 'note', 'external_source'));
ALTER TABLE bna_agent_run_artifacts DROP CONSTRAINT IF EXISTS bna_agent_run_artifacts_redaction_check;
ALTER TABLE bna_agent_run_artifacts
  ADD CONSTRAINT bna_agent_run_artifacts_redaction_check
  CHECK (redaction_status IN ('not_needed', 'redacted', 'needs_review'));

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS implementation_status TEXT DEFAULT 'not_started';
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_required';
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS required_verification_mode TEXT DEFAULT 'automated';
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS active_agent_run_id INTEGER REFERENCES bna_agent_runs(id) ON DELETE SET NULL;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP;

ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_implementation_status_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_implementation_status_check
  CHECK (implementation_status IN ('not_started', 'in_progress', 'complete', 'blocked', 'not_required'));
ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_verification_status_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_verification_status_check
  CHECK (verification_status IN ('not_required', 'needed', 'ready', 'running', 'submitted', 'passed', 'failed', 'blocked', 'needs_operator'));
ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_required_verification_mode_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_required_verification_mode_check
  CHECK (required_verification_mode IN ('automated', 'browser_agent', 'operator', 'mixed'));

CREATE INDEX IF NOT EXISTS idx_bna_agent_runs_task ON bna_agent_runs (task_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_runs_workspace ON bna_agent_runs (workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_runs_project ON bna_agent_runs (project_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_runs_status ON bna_agent_runs (status, updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_agent_runs_active_task_mode
  ON bna_agent_runs(task_id, run_type, verification_mode)
  WHERE task_id IS NOT NULL
    AND status IN ('draft', 'ready', 'claimed', 'running', 'waiting_operator', 'submitted');
CREATE INDEX IF NOT EXISTS idx_bna_agent_run_events_run ON bna_agent_run_events (run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_run_artifacts_run ON bna_agent_run_artifacts (run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_active_agent_run ON bna_tasks (active_agent_run_id);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_verification_status ON bna_tasks (verification_status);

INSERT INTO bna_agent_profiles (agent_key, display_name, agent_type, description, capabilities, workspace_scope_mode, active)
VALUES
  ('codex_builder', 'Codex Builder', 'codex_builder', 'Repository implementation, migrations, tests, and deployment preparation.', '["repo_write","run_tests","post_agent_progress"]'::jsonb, 'scoped', TRUE),
  ('browser_qa', 'Browser QA', 'browser_qa', 'Agent Mode browser walkthroughs, UI acceptance, and safe read-only verification.', '["browser_read","browser_safe_interaction","visual_review","post_agent_progress","submit_verification","request_operator_decision"]'::jsonb, 'assigned_run', TRUE),
  ('playwright_verifier', 'Playwright Verifier', 'playwright_verifier', 'Deterministic route, viewport, console, and regression verification.', '["run_tests","browser_read","post_agent_progress","submit_verification"]'::jsonb, 'scoped', TRUE),
  ('research_agent', 'Research Agent', 'research_agent', 'Public research and source collection without private-group scraping or unauthorized harvesting.', '["external_research","post_agent_progress","submit_verification"]'::jsonb, 'scoped', TRUE),
  ('operator', 'Operator', 'operator', 'Human approvals for credentials, destructive actions, external account authorization, and release.', '["request_operator_decision","production_deploy","production_write"]'::jsonb, 'manual', TRUE)
ON CONFLICT (agent_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  agent_type = EXCLUDED.agent_type,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  workspace_scope_mode = EXCLUDED.workspace_scope_mode,
  active = TRUE,
  updated_at = NOW();

INSERT INTO bna_agent_prompt_templates (template_key, version, agent_type, purpose, template_text, active, change_notes)
VALUES (
  'browser_qa_agent_mode',
  ${BROWSER_QA_TEMPLATE_VERSION},
  'browser_qa',
  'Task-specific Browser QA Agent Mode verification prompt.',
  $BNA_AGENT_PROMPT$${BROWSER_QA_TEMPLATE}$BNA_AGENT_PROMPT$::text,
  TRUE,
  'Autonomous Browser QA blocked/fail/pass submit and seal template.'
)
ON CONFLICT (template_key, version) DO UPDATE SET
  agent_type = EXCLUDED.agent_type,
  purpose = EXCLUDED.purpose,
  template_text = EXCLUDED.template_text,
  active = TRUE,
  updated_at = NOW();
`;

function normalizeSetValue(value, allowed, fallback) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return allowed.has(normalized) ? normalized : fallback;
}

function normalizeAgentType(value, fallback = 'browser_qa') {
  return normalizeSetValue(value, AGENT_TYPES, fallback);
}

function normalizeAgentRunStatus(value, fallback = 'draft') {
  return normalizeSetValue(value, AGENT_RUN_STATUSES, fallback);
}

function normalizeVerificationMode(value, fallback = 'mixed') {
  return normalizeSetValue(value, VERIFICATION_MODES, fallback);
}

function normalizeRunOutcome(value, fallback = null) {
  return normalizeSetValue(value, RUN_OUTCOMES, fallback);
}

function normalizeAgentPriority(value, fallback = 'normal') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'this_week') return 'normal';
  return normalizeSetValue(normalized, AGENT_PRIORITIES, fallback);
}

function normalizeImplementationStatus(value, fallback = 'not_started') {
  return normalizeSetValue(value, IMPLEMENTATION_STATUSES, fallback);
}

function normalizeVerificationStatus(value, fallback = 'not_required') {
  return normalizeSetValue(value, VERIFICATION_STATUSES, fallback);
}

function parseJsonMaybe(value, fallback = {}) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function jsonArray(value) {
  const parsed = typeof value === 'string' ? parseJsonMaybe(value, null) : value;
  if (Array.isArray(parsed)) return parsed;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function normalizeStringList(value, fallback = []) {
  const input = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\r?\n|;/)
      : [];
  const list = input.map((item) => String(item || '').trim()).filter(Boolean);
  return list.length ? list : fallback;
}

function acceptanceCriteriaFromInput(value, task = {}) {
  const parsed = typeof value === 'string' ? parseJsonMaybe(value, value) : value;
  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'string'
      ? parsed.split(/\r?\n|;/)
      : [];
  const normalized = list.map((item, index) => {
    if (typeof item === 'object' && item) {
      return {
        id: String(item.id || `AC-${index + 1}`),
        label: String(item.label || item.title || item.text || item.criterion || `Criterion ${index + 1}`).trim(),
        required: item.required !== false,
      };
    }
    return {
      id: `AC-${index + 1}`,
      label: String(item || '').trim(),
      required: true,
    };
  }).filter((item) => item.label);
  if (normalized.length) return normalized;
  return [{
    id: 'AC-1',
    label: `Verify ${task.title || task.display_title || 'the requested BNA work'} against the task notes and visible result.`,
    required: true,
  }];
}

function defaultAllowedActions(agentType = 'browser_qa') {
  if (agentType === 'browser_qa') {
    return [
      'read-only navigation',
      'safe tabs/filters/search',
      'browser back/forward',
      'screenshots/evidence',
      'progress updates to the Agent Run page',
    ];
  }
  if (agentType === 'playwright_verifier') {
    return ['run deterministic tests', 'capture screenshots', 'record console/network findings', 'submit verification'];
  }
  return ['post progress', 'submit verification'];
}

function defaultForbiddenActions() {
  return [
    'sending messages',
    'publishing',
    'approving/rejecting real records',
    'deleting/archiving',
    'charging/payments',
    'inviting users',
    'production changes',
    'credential disclosure',
    'any action not explicitly allowed',
  ];
}

function numberedLines(items = []) {
  return items.map((item, index) => {
    const label = typeof item === 'object' && item ? (item.label || item.title || item.text || item.criterion) : item;
    return `${index + 1}. ${String(label || '').trim()}`;
  }).filter((line) => !/^\d+\.\s*$/.test(line)).join('\n');
}

function bulletLines(items = []) {
  return items.map((item) => `- ${String(item || '').trim()}`).filter((line) => line !== '-').join('\n');
}

function renderTemplate(template, replacements) {
  return String(template || '').replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, key) => {
    return replacements[key] === undefined || replacements[key] === null ? '' : String(replacements[key]);
  });
}

function renderAgentRunPrompt({ run = {}, task = {}, profile = {}, templateText = BROWSER_QA_TEMPLATE, baseUrl = '' } = {}) {
  const criteria = acceptanceCriteriaFromInput(run.acceptance_criteria || run.acceptanceCriteria, task);
  const allowed = normalizeStringList(run.allowed_actions || run.allowedActions, defaultAllowedActions(profile.agent_type || profile.agentType || 'browser_qa'));
  const forbidden = normalizeStringList(run.forbidden_actions || run.forbiddenActions, defaultForbiddenActions());
  const runKey = run.run_key || run.runKey || run.id || '[RUN ID]';
  const agentRunPath = `/operations/agents/runs/${encodeURIComponent(runKey)}`;
  const agentRunUrl = /^https?:\/\//i.test(String(baseUrl || ''))
    ? `${String(baseUrl).replace(/\/+$/, '')}${agentRunPath}`
    : agentRunPath;
  const targetUrl = run.target_url || run.targetUrl || agentRunUrl;
  const workspace = run.workspace_label || run.workspaceLabel || run.workspace_key || run.project_key || task.project_key || 'BNA';
  const taskTitle = task.display_title || task.title || run.task_title || 'BNA task';
  return renderTemplate(templateText, {
    run_id: runKey,
    task_ref: task.id ? `#${task.id} - ${taskTitle}` : taskTitle,
    workspace,
    target_url: targetUrl,
    purpose: run.purpose || run.result_summary || `Verify ${taskTitle}.`,
    acceptance_criteria: numberedLines(criteria),
    allowed_actions: bulletLines(allowed),
    forbidden_actions: bulletLines(forbidden),
    agent_run_url: agentRunUrl,
  });
}

const TRANSITIONS = {
  draft: new Set(['ready', 'cancelled']),
  ready: new Set(['claimed', 'running', 'blocked', 'expired', 'cancelled']),
  claimed: new Set(['running', 'waiting_operator', 'submitted', 'blocked', 'cancelled']),
  running: new Set(['waiting_operator', 'submitted', 'blocked', 'cancelled']),
  waiting_operator: new Set(['running', 'blocked', 'cancelled']),
  submitted: new Set(['sealed_pass', 'sealed_fail', 'blocked', 'cancelled']),
  blocked: new Set(['running', 'cancelled']),
  sealed_pass: new Set([]),
  sealed_fail: new Set([]),
  expired: new Set([]),
  cancelled: new Set([]),
};

function canTransitionAgentRun(fromStatus, toStatus) {
  const from = normalizeAgentRunStatus(fromStatus, 'draft');
  const to = normalizeAgentRunStatus(toStatus, null);
  return Boolean(to && TRANSITIONS[from]?.has(to));
}

function assertAgentRunTransition(fromStatus, toStatus) {
  if (!canTransitionAgentRun(fromStatus, toStatus)) {
    const error = new Error(`Cannot move agent run from ${fromStatus || 'draft'} to ${toStatus}.`);
    error.statusCode = 409;
    throw error;
  }
}

function criterionResultsFromInput(value, criteria = []) {
  const allowedStatuses = new Set(['pass', 'fail', 'blocked', 'needs_operator']);
  const input = jsonArray(value);
  const byId = new Map(input.filter((item) => item && typeof item === 'object').map((item) => [String(item.id || item.criterion_id || item.criterionId || ''), item]));
  return criteria.map((criterion, index) => {
    const id = String(criterion.id || `AC-${index + 1}`);
    const supplied = byId.get(id) || input[index] || {};
    const status = normalizeSetValue(supplied.status || supplied.result || supplied.outcome, allowedStatuses, 'blocked');
    return {
      id,
      label: criterion.label || criterion.title || criterion.text || `Criterion ${index + 1}`,
      status,
      note: String(supplied.note || supplied.summary || '').slice(0, 1000),
    };
  });
}

function validateSealPayload({ run = {}, artifacts = [], outcome, summary, criterionResults = [] } = {}) {
  const normalizedOutcome = normalizeRunOutcome(outcome, null);
  if (!normalizedOutcome) {
    const error = new Error('Seal Run requires pass, fail, blocked, or needs_operator outcome.');
    error.statusCode = 400;
    throw error;
  }
  if (!String(summary || run.result_summary || '').trim()) {
    const error = new Error('Seal Run requires a concise summary.');
    error.statusCode = 400;
    throw error;
  }
  const criteria = acceptanceCriteriaFromInput(run.acceptance_criteria || run.acceptanceCriteria, run);
  const results = criterionResultsFromInput(criterionResults.length ? criterionResults : run.result_payload?.criterion_results, criteria);
  if (criteria.length && results.length < criteria.length) {
    const error = new Error('Seal Run requires every criterion to be marked.');
    error.statusCode = 400;
    throw error;
  }
  const unmarked = results.find((item) => !['pass', 'fail', 'blocked', 'needs_operator'].includes(item.status));
  if (unmarked) {
    const error = new Error(`Seal Run criterion ${unmarked.id} is not marked.`);
    error.statusCode = 400;
    throw error;
  }
  const mode = normalizeVerificationMode(run.verification_mode || run.verificationMode, 'mixed');
  const artifactCount = Number(run.artifact_count || 0) + (Array.isArray(artifacts) ? artifacts.length : 0);
  const evidenceExempt = Boolean(run.context_snapshot?.evidence_exempt || run.contextSnapshot?.evidence_exempt);
  if (['browser_agent', 'mixed'].includes(mode) && !evidenceExempt && artifactCount < 1) {
    const error = new Error('Browser verification requires at least one evidence reference before sealing.');
    error.statusCode = 400;
    throw error;
  }
  return { outcome: normalizedOutcome, criterion_results: results };
}

function agentRunView(row = {}) {
  if (!row) return null;
  return {
    ...row,
    run_id: row.id,
    acceptance_criteria: jsonArray(row.acceptance_criteria),
    allowed_actions: jsonArray(row.allowed_actions),
    forbidden_actions: jsonArray(row.forbidden_actions),
    context_snapshot: parseJsonMaybe(row.context_snapshot, {}),
    result_payload: parseJsonMaybe(row.result_payload, {}),
    capabilities: jsonArray(row.capabilities),
    artifact_count: Number(row.artifact_count || 0),
    event_count: Number(row.event_count || 0),
  };
}

module.exports = {
  AGENT_TYPES,
  AGENT_RUN_STATUSES,
  TERMINAL_RUN_STATUSES,
  VERIFICATION_MODES,
  RUN_OUTCOMES,
  DEFAULT_AGENT_PROFILES,
  BROWSER_QA_TEMPLATE_VERSION,
  BROWSER_QA_TEMPLATE,
  createAgentControlSQL,
  normalizeAgentType,
  normalizeAgentRunStatus,
  normalizeVerificationMode,
  normalizeRunOutcome,
  normalizeAgentPriority,
  normalizeImplementationStatus,
  normalizeVerificationStatus,
  parseJsonMaybe,
  jsonArray,
  acceptanceCriteriaFromInput,
  defaultAllowedActions,
  defaultForbiddenActions,
  renderAgentRunPrompt,
  canTransitionAgentRun,
  assertAgentRunTransition,
  criterionResultsFromInput,
  validateSealPayload,
  agentRunView,
};
