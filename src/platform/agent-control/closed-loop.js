const { stableHash } = require('../ingestion/intake-source');

const CLOSED_LOOP_CONTRACT_VERSION = 'w3-agent-closed-loop-v1';

const VERIFICATION_MODES = new Set(['automated', 'browser_agent', 'operator', 'mixed']);
const PACKAGE_STATUSES = new Set([
  'queued',
  'claimed',
  'implementing',
  'verifying',
  'passed',
  'failed',
  'blocked',
  'needs_operator_decision',
  'requeued',
]);

const SECRET_PATTERN = /(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9_]{16,}|xox[baprs]-[A-Za-z0-9-]{16,}|AIza[0-9A-Za-z_-]{16,}|OPS_PASSWORD|OPENAI_API_KEY|KIMI_API_KEY|DATABASE_URL|TOKEN=|PASSWORD=)/i;

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeVerificationMode(value = 'automated') {
  const normalized = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return VERIFICATION_MODES.has(normalized) ? normalized : 'automated';
}

function assertNoSecrets(value = '', label = 'prompt') {
  const text = String(value || '');
  if (SECRET_PATTERN.test(text)) {
    const error = new Error(`${label} contains credential-like text and cannot be handed to an agent.`);
    error.statusCode = 400;
    throw error;
  }
  return true;
}

function createWorkPackage({ parentPrompt = {}, parsedItem = {}, verificationMode = 'automated', retryLimit = 2, browserTarget = null } = {}) {
  const mode = normalizeVerificationMode(verificationMode || parsedItem.verification_mode || parsedItem.verificationMode);
  const title = compactWhitespace(parsedItem.title || parentPrompt.title || 'Verify BNA work package');
  const packageId = `WP-${stableHash([
    parentPrompt.prompt_id,
    parsedItem.item_id || parsedItem.idempotency_key,
    title,
  ].join('|')).slice(0, 12).toUpperCase()}`;
  return {
    contract_version: CLOSED_LOOP_CONTRACT_VERSION,
    package_id: packageId,
    parent_prompt_id: parentPrompt.prompt_id || null,
    parsed_item_id: parsedItem.item_id || null,
    title,
    status: 'queued',
    implementation_status: 'not_started',
    verification_status: 'needed',
    verification_mode: mode,
    retry_limit: Math.max(0, Number(retryLimit)),
    retry_count: 0,
    browser_target: browserTarget || parsedItem.target_url || parsedItem.targetUrl || null,
    acceptance_criteria: normalizeCriteria(parsedItem.acceptance_criteria || parsedItem.acceptanceCriteria || parsedItem.expected_result || title),
    evidence: [],
    progress: [],
    blocker: null,
    operator_decision: null,
    result: null,
    idempotency_key: stableHash([parentPrompt.prompt_id, parsedItem.idempotency_key || parsedItem.item_id || title].join('|')),
  };
}

function normalizeCriteria(value) {
  const input = Array.isArray(value) ? value : String(value || '').split(/\r?\n|;/);
  const criteria = input
    .map((item, index) => {
      if (item && typeof item === 'object') {
        return {
          id: String(item.id || `AC-${index + 1}`),
          label: compactWhitespace(item.label || item.title || item.text || item.criterion || ''),
          required: item.required !== false,
        };
      }
      return {
        id: `AC-${index + 1}`,
        label: compactWhitespace(item),
        required: true,
      };
    })
    .filter((item) => item.label);
  return criteria.length ? criteria : [{ id: 'AC-1', label: 'Verify the work package result with evidence.', required: true }];
}

function renderBrowserVerificationPrompt(workPackage = {}) {
  const criteria = (workPackage.acceptance_criteria || [])
    .map((criterion, index) => `${index + 1}. ${criterion.label}`)
    .join('\n');
  const text = [
    'You are verifying one BNA Agent Run work package.',
    '',
    `Work package: ${workPackage.package_id}`,
    `Parent prompt: ${workPackage.parent_prompt_id || 'none'}`,
    `Target: ${workPackage.browser_target || 'the assigned local route or supplied evidence path'}`,
    '',
    'Acceptance criteria:',
    criteria,
    '',
    'Allowed:',
    '- Read-only navigation',
    '- Safe filters/search/tabs',
    '- Screenshots, notes, and evidence references',
    '- Mark blocked when login, credentials, or external approval is required',
    '',
    'Forbidden:',
    '- Sending messages',
    '- Publishing',
    '- Deleting, archiving, approving, charging, inviting, or mutating production data',
    '- Using or pasting credentials',
    '- Running broad crawls or watch loops unless this package explicitly asks for them',
    '',
    'Submit pass, fail, blocked, or needs_operator_decision with evidence for every criterion.',
  ].join('\n');
  assertNoSecrets(text, 'browser verification prompt');
  return text;
}

function createVerificationPlan(workPackage = {}) {
  const mode = normalizeVerificationMode(workPackage.verification_mode);
  const plan = {
    contract_version: CLOSED_LOOP_CONTRACT_VERSION,
    package_id: workPackage.package_id,
    mode,
    criteria: workPackage.acceptance_criteria || [],
    automated_commands: [],
    browser_prompt: null,
    operator_prompt: null,
    evidence_required: true,
    credential_policy: 'no credentials or secrets in agent prompts',
  };
  if (mode === 'automated' || mode === 'mixed') {
    plan.automated_commands.push('Run the focused local tests for the changed module.');
  }
  if (mode === 'browser_agent' || mode === 'mixed') {
    plan.browser_prompt = renderBrowserVerificationPrompt(workPackage);
  }
  if (mode === 'operator') {
    plan.operator_prompt = 'Operator must make the explicit decision or perform the external-account verification before this package can close.';
  }
  return plan;
}

function claimWorkPackage(workPackage = {}, { agent = 'Codex', at = new Date().toISOString() } = {}) {
  if (!PACKAGE_STATUSES.has(workPackage.status || 'queued')) throw new Error('Invalid package status.');
  if (!['queued', 'requeued'].includes(workPackage.status)) {
    const error = new Error(`Cannot claim package from ${workPackage.status}.`);
    error.statusCode = 409;
    throw error;
  }
  return {
    ...workPackage,
    status: 'claimed',
    implementation_status: 'in_progress',
    claimed_by: agent,
    claimed_at: at,
    heartbeat_at: at,
  };
}

function recordProgress(workPackage = {}, { phase = 'running', summary, at = new Date().toISOString() } = {}) {
  const entry = {
    phase,
    summary: compactWhitespace(summary || phase),
    at,
  };
  return {
    ...workPackage,
    status: phase === 'verifying' ? 'verifying' : workPackage.status,
    heartbeat_at: at,
    progress: [...(workPackage.progress || []), entry],
  };
}

function recordEvidence(workPackage = {}, evidence = {}) {
  const entry = {
    label: compactWhitespace(evidence.label || evidence.title || 'Evidence'),
    kind: evidence.kind || 'note',
    path: evidence.path || evidence.repo_path || null,
    url: evidence.url || null,
    summary: compactWhitespace(evidence.summary || ''),
    at: evidence.at || new Date().toISOString(),
  };
  assertNoSecrets(`${entry.label} ${entry.path || ''} ${entry.url || ''} ${entry.summary || ''}`, 'evidence');
  return {
    ...workPackage,
    evidence: [...(workPackage.evidence || []), entry],
  };
}

function sealWorkPackage(workPackage = {}, { outcome, summary, criterionResults = [], blocker = null } = {}) {
  const normalizedOutcome = String(outcome || '').toLowerCase();
  if (!['pass', 'fail', 'blocked', 'needs_operator_decision'].includes(normalizedOutcome)) {
    const error = new Error('Seal requires pass, fail, blocked, or needs_operator_decision.');
    error.statusCode = 400;
    throw error;
  }
  if (!compactWhitespace(summary)) {
    const error = new Error('Seal requires a concise summary.');
    error.statusCode = 400;
    throw error;
  }
  const criteria = workPackage.acceptance_criteria || [];
  const byId = new Map((criterionResults || []).map((item) => [String(item.id || item.criterion_id || ''), item]));
  const results = criteria.map((criterion, index) => {
    const supplied = byId.get(String(criterion.id)) || criterionResults[index] || {};
    const status = String(supplied.status || supplied.outcome || normalizedOutcome).toLowerCase();
    return {
      id: criterion.id,
      label: criterion.label,
      status: ['pass', 'fail', 'blocked', 'needs_operator_decision'].includes(status) ? status : 'blocked',
      note: compactWhitespace(supplied.note || supplied.summary || ''),
    };
  });
  if ((workPackage.verification_mode === 'browser_agent' || workPackage.verification_mode === 'mixed') && !(workPackage.evidence || []).length) {
    const error = new Error('Browser or mixed verification requires at least one evidence reference.');
    error.statusCode = 400;
    throw error;
  }
  const status = normalizedOutcome === 'pass'
    ? 'passed'
    : normalizedOutcome === 'needs_operator_decision'
      ? 'needs_operator_decision'
      : normalizedOutcome;
  return {
    ...workPackage,
    status,
    implementation_status: normalizedOutcome === 'pass' ? 'complete' : workPackage.implementation_status,
    verification_status: normalizedOutcome === 'pass' ? 'passed' : status,
    blocker: blocker || (status === 'blocked' ? summary : workPackage.blocker),
    operator_decision: status === 'needs_operator_decision' ? summary : workPackage.operator_decision,
    result: {
      outcome: normalizedOutcome,
      summary,
      criterion_results: results,
      sealed_at: new Date().toISOString(),
    },
  };
}

function requeueFindingOrDecision(workPackage = {}, finding = {}) {
  const exhausted = Number(workPackage.retry_count || 0) >= Number(workPackage.retry_limit || 0);
  if (exhausted) {
    return {
      ...workPackage,
      status: 'needs_operator_decision',
      verification_status: 'needs_operator_decision',
      operator_decision: compactWhitespace(finding.summary || finding.reason || 'Retry limit reached; operator decision required.'),
    };
  }
  return {
    ...workPackage,
    status: 'requeued',
    retry_count: Number(workPackage.retry_count || 0) + 1,
    blocker: null,
    progress: [
      ...(workPackage.progress || []),
      {
        phase: 'requeued',
        summary: compactWhitespace(finding.summary || finding.reason || 'Requeued exact verification finding.'),
        at: new Date().toISOString(),
      },
    ],
  };
}

module.exports = {
  CLOSED_LOOP_CONTRACT_VERSION,
  VERIFICATION_MODES,
  PACKAGE_STATUSES,
  SECRET_PATTERN,
  normalizeVerificationMode,
  assertNoSecrets,
  createWorkPackage,
  createVerificationPlan,
  renderBrowserVerificationPrompt,
  claimWorkPackage,
  recordProgress,
  recordEvidence,
  sealWorkPackage,
  requeueFindingOrDecision,
};
