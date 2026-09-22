const { stableHash } = require('./intake-source');

const PROMPT_QUEUE_CONTRACT_VERSION = 'w3-parent-prompt-queue-v1';

const PROMPT_STATUSES = [
  'new',
  'triaged',
  'queued',
  'in_progress',
  'needs_decision',
  'verifying',
  'completed',
  'failed',
  'archived',
];

const TERMINAL_PROMPT_STATUSES = new Set(['completed', 'failed', 'archived']);
const PROMPT_STATUS_ALIASES = {
  done: 'completed',
  pass: 'completed',
  passed: 'completed',
  sealed_pass: 'completed',
  sealed_fail: 'failed',
};
const CHILD_OUTCOME_STATUS_ALIASES = {
  done: 'completed',
  pass: 'passed',
  sealed_pass: 'passed',
  sealed_fail: 'failed',
  needs_operator: 'blocked',
  needs_operator_decision: 'blocked',
};
const TERMINAL_CHILD_OUTCOME_STATUSES = new Set(['passed', 'completed', 'blocked', 'failed', 'archived']);
const DEFAULT_AUTO_RESUME_STALE_AFTER_MS = 30 * 60 * 1000;

const PROMPT_STATUS_TRANSITIONS = {
  new: new Set(['triaged', 'queued', 'needs_decision', 'failed', 'archived']),
  triaged: new Set(['queued', 'needs_decision', 'failed', 'archived']),
  queued: new Set(['in_progress', 'needs_decision', 'failed', 'archived']),
  in_progress: new Set(['verifying', 'needs_decision', 'failed', 'archived']),
  needs_decision: new Set(['queued', 'in_progress', 'failed', 'archived']),
  verifying: new Set(['completed', 'failed', 'needs_decision', 'in_progress', 'archived']),
  completed: new Set(['archived']),
  failed: new Set(['queued', 'archived']),
  archived: new Set([]),
};

const QUEUE_ROUTE_CONTRACTS = {
  queue: '/queue',
  prompt: '/prompt <id>',
  ramble_status: '/ramble_status',
};

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizePromptStatus(value = 'new') {
  const status = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normalized = PROMPT_STATUS_ALIASES[status] || status;
  return PROMPT_STATUSES.includes(normalized) ? normalized : 'new';
}

function normalizeChildOutcomeStatus(value = 'queued') {
  const status = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return CHILD_OUTCOME_STATUS_ALIASES[status] || status || 'queued';
}

function isTerminalChildOutcomeStatus(value = '') {
  return TERMINAL_CHILD_OUTCOME_STATUSES.has(normalizeChildOutcomeStatus(value));
}

function promptTitleFromSource(sourceRecord = {}, fallback = 'Review intake prompt') {
  const raw = compactWhitespace(sourceRecord.raw_text || sourceRecord.transcript_text || sourceRecord.filename || fallback);
  if (!raw) return fallback;
  const first = raw.split(/(?<=[.!?])\s+|[\r\n]+/).find((part) => compactWhitespace(part).length >= 5) || raw;
  const cleaned = first
    .replace(/^(?:task|todo|prompt|ramble|recording|transcript)\s*[:=-]\s*/i, '')
    .replace(/\b(?:um+|uh+|you know|kind of|sort of)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= 90) return cleaned || fallback;
  const slice = cleaned.slice(0, 91);
  const cut = slice.lastIndexOf(' ');
  return `${slice.slice(0, cut > 45 ? cut : 87).trim()}...`;
}

function createPromptId({ created_at: createdAt, sourceRecord = {}, sequence = 1 } = {}) {
  const date = String(createdAt || sourceRecord.timestamps?.created_at || new Date().toISOString()).slice(0, 10).replace(/-/g, '');
  const hash = stableHash([
    sourceRecord.stable_key,
    sourceRecord.idempotency_key,
    sourceRecord.source_id,
    sourceRecord.source_link,
    sourceRecord.fingerprint,
    sequence,
  ].join('|')).slice(0, 8).toUpperCase();
  return `PROMPT-${date}-${String(sequence).padStart(3, '0')}-${hash}`;
}

function createParentPrompt(input = {}) {
  const sourceRecord = input.source_record || input.sourceRecord || {};
  const createdAt = input.created_at || input.createdAt || sourceRecord.timestamps?.created_at || new Date().toISOString();
  const status = normalizePromptStatus(input.status || 'new');
  const prompt = {
    contract_version: PROMPT_QUEUE_CONTRACT_VERSION,
    prompt_id: input.prompt_id || input.promptId || createPromptId({ created_at: createdAt, sourceRecord, sequence: input.sequence || 1 }),
    prompt_number: input.prompt_number || input.promptNumber || null,
    title: compactWhitespace(input.title) || promptTitleFromSource(sourceRecord),
    source: {
      provider: sourceRecord.source_provider || input.source_provider || 'manual',
      source_id: sourceRecord.source_id || input.source_id || null,
      source_link: sourceRecord.source_link || input.source_link || null,
      stable_key: sourceRecord.stable_key || null,
      fingerprint: sourceRecord.fingerprint || null,
    },
    status,
    created_at: createdAt,
    queued_at: status === 'queued' ? (input.queued_at || input.queuedAt || createdAt) : (input.queued_at || input.queuedAt || null),
    started_at: input.started_at || input.startedAt || null,
    completed_at: input.completed_at || input.completedAt || null,
    agent: input.agent || null,
    current_phase: input.current_phase || input.currentPhase || status,
    heartbeat_at: input.heartbeat_at || input.heartbeatAt || null,
    dependency: input.dependency || null,
    child_outcomes: Array.isArray(input.child_outcomes || input.childOutcomes) ? (input.child_outcomes || input.childOutcomes) : [],
    blocker: input.blocker || null,
    result: input.result || null,
    evidence: Array.isArray(input.evidence) ? input.evidence : [],
    workspace_key: input.workspace_key || input.workspaceKey || sourceRecord.workspace_candidate || 'bna',
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
  };
  return prompt;
}

function canTransitionPrompt(fromStatus, toStatus) {
  const from = normalizePromptStatus(fromStatus);
  const to = normalizePromptStatus(toStatus);
  return Boolean(PROMPT_STATUS_TRANSITIONS[from]?.has(to));
}

function transitionPrompt(prompt = {}, toStatus, fields = {}) {
  const from = normalizePromptStatus(prompt.status);
  const to = normalizePromptStatus(toStatus);
  if (!canTransitionPrompt(from, to)) {
    const error = new Error(`Cannot move prompt from ${from} to ${to}.`);
    error.statusCode = 409;
    throw error;
  }
  const now = fields.timestamp || new Date().toISOString();
  const next = {
    ...prompt,
    ...fields,
    status: to,
    current_phase: fields.current_phase || fields.currentPhase || to,
    heartbeat_at: fields.heartbeat_at || fields.heartbeatAt || prompt.heartbeat_at,
  };
  if (to === 'queued' && !next.queued_at) next.queued_at = now;
  if (to === 'in_progress' && !next.started_at) next.started_at = now;
  if (TERMINAL_PROMPT_STATUSES.has(to) && !next.completed_at) next.completed_at = now;
  return next;
}

function appendChildOutcome(prompt = {}, outcome = {}) {
  const child = {
    child_id: outcome.child_id || outcome.childId || `CHILD-${stableHash(JSON.stringify(outcome)).slice(0, 10).toUpperCase()}`,
    item_type: outcome.item_type || outcome.itemType || 'task',
    title: compactWhitespace(outcome.title || outcome.summary || 'Child outcome'),
    status: normalizeChildOutcomeStatus(outcome.status || 'queued'),
    owner: outcome.owner || null,
    blocker: outcome.blocker || null,
    evidence: Array.isArray(outcome.evidence) ? outcome.evidence : [],
    idempotency_key: outcome.idempotency_key || outcome.idempotencyKey || stableHash([
      prompt.prompt_id,
      outcome.item_type || outcome.itemType || 'task',
      outcome.title || outcome.summary || '',
    ].join('|')),
  };
  const existing = new Set((prompt.child_outcomes || []).map((item) => item.idempotency_key));
  if (existing.has(child.idempotency_key)) return prompt;
  return {
    ...prompt,
    child_outcomes: [...(prompt.child_outcomes || []), child],
  };
}

function elapsedMs(start, end) {
  const startMs = start ? Date.parse(start) : NaN;
  const endMs = end ? Date.parse(end) : Date.now();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return 0;
  return endMs - startMs;
}

function resolvedDecision(input = {}) {
  const decision = input.decision_resolution || input.decisionResolution || input.operator_decision || input.operatorDecision || {};
  const status = String(decision.status || decision.state || '').toLowerCase();
  return Boolean(
    decision.resolved === true ||
    decision.approved === true ||
    ['resolved', 'approved', 'unblocked', 'resume', 'resumed'].includes(status)
  );
}

function promptSignalAt(prompt = {}) {
  return prompt.heartbeat_at || prompt.started_at || prompt.queued_at || prompt.created_at || null;
}

function buildPromptAutoResumePlan(prompt = {}, options = {}) {
  const now = options.now || new Date().toISOString();
  const status = normalizePromptStatus(prompt.status);
  const childOutcomes = prompt.child_outcomes || [];
  const terminalChildren = childOutcomes.filter((child) => isTerminalChildOutcomeStatus(child.status));
  const blockedChildren = childOutcomes.filter((child) => ['blocked', 'failed'].includes(normalizeChildOutcomeStatus(child.status)));
  const allChildrenTerminal = childOutcomes.length > 0 && terminalChildren.length === childOutcomes.length;
  const signalAt = promptSignalAt(prompt);
  const staleAfterMs = Number(options.stale_after_ms ?? options.staleAfterMs ?? DEFAULT_AUTO_RESUME_STALE_AFTER_MS);
  const signalAgeMs = elapsedMs(signalAt, now);
  const stale = Boolean(
    signalAt &&
    Number.isFinite(staleAfterMs) &&
    staleAfterMs > 0 &&
    signalAgeMs >= staleAfterMs &&
    ['in_progress', 'verifying'].includes(status)
  );
  let action = 'none';
  let targetStatus = null;
  let reason = 'no_auto_resume_needed';
  let summary = 'No lifecycle transition is needed.';

  if (TERMINAL_PROMPT_STATUSES.has(status)) {
    reason = 'parent_prompt_terminal';
    summary = 'Parent prompt is already terminal.';
  } else if (status === 'needs_decision' && resolvedDecision(options)) {
    action = 'resume_after_decision';
    targetStatus = normalizePromptStatus(options.resume_status || options.resumeStatus || 'in_progress');
    reason = 'operator_decision_resolved';
    summary = 'Operator decision is resolved; prompt can resume.';
  } else if (allChildrenTerminal && blockedChildren.length) {
    action = 'route_to_decision';
    targetStatus = 'needs_decision';
    reason = 'terminal_child_blocked_or_failed';
    summary = 'At least one terminal child is blocked or failed; operator decision is required.';
  } else if (allChildrenTerminal && status === 'verifying') {
    action = 'close_completed';
    targetStatus = 'completed';
    reason = 'all_child_outcomes_terminal';
    summary = 'All child outcomes are terminal and can close the parent prompt.';
  } else if (stale) {
    action = 'route_to_decision';
    targetStatus = 'needs_decision';
    reason = 'stale_heartbeat';
    summary = 'Prompt heartbeat is stale; route to an operator decision instead of silently continuing.';
  } else if (prompt.blocker) {
    action = 'route_to_decision';
    targetStatus = 'needs_decision';
    reason = 'blocker_present';
    summary = 'Prompt has a blocker and should be made explicit as a decision.';
  }

  const canTransition = targetStatus ? canTransitionPrompt(status, targetStatus) : false;
  return {
    contract_version: PROMPT_QUEUE_CONTRACT_VERSION,
    prompt_id: prompt.prompt_id || null,
    generated_at: now,
    external_write_performed: false,
    action,
    reason,
    summary,
    current_status: status,
    target_status: canTransition ? targetStatus : null,
    requested_target_status: targetStatus,
    can_transition: canTransition,
    stale,
    signal_at: signalAt,
    signal_age_ms: signalAgeMs,
    stale_after_ms: staleAfterMs,
    child_outcome_count: childOutcomes.length,
    terminal_child_outcome_count: terminalChildren.length,
    blocked_child_outcome_count: blockedChildren.length,
  };
}

function applyPromptAutoResumePlan(prompt = {}, plan = {}, fields = {}) {
  if (!plan.can_transition || !plan.target_status) {
    return {
      prompt,
      applied: false,
      reason: plan.reason || 'no_transition',
      external_write_performed: false,
    };
  }
  const timestamp = fields.timestamp || fields.at || plan.generated_at || new Date().toISOString();
  const next = transitionPrompt(prompt, plan.target_status, {
    ...fields,
    timestamp,
    blocker: plan.target_status === 'needs_decision' ? (fields.blocker || prompt.blocker || plan.summary) : null,
    result: fields.result || plan.summary,
  });
  return {
    prompt: next,
    applied: true,
    action: plan.action,
    reason: plan.reason,
    from_status: plan.current_status,
    to_status: next.status,
    external_write_performed: false,
  };
}

function promptQueueSortValue(prompt = {}) {
  const status = normalizePromptStatus(prompt.status);
  const rank = {
    in_progress: 1,
    verifying: 2,
    needs_decision: 3,
    queued: 4,
    triaged: 5,
    new: 6,
    failed: 7,
    completed: 8,
    archived: 9,
  }[status] || 10;
  return `${String(rank).padStart(2, '0')}:${prompt.queued_at || prompt.created_at || ''}:${prompt.prompt_id || ''}`;
}

function promptQueueItemView(prompt = {}, index = 0, now = new Date().toISOString()) {
  return {
    prompt_id: prompt.prompt_id,
    prompt_number: prompt.prompt_number,
    title: prompt.title,
    source: prompt.source,
    status: normalizePromptStatus(prompt.status),
    created_at: prompt.created_at,
    queued_at: prompt.queued_at,
    started_at: prompt.started_at,
    elapsed_ms: elapsedMs(prompt.started_at || prompt.queued_at || prompt.created_at, prompt.completed_at || now),
    agent: prompt.agent,
    current_phase: prompt.current_phase || prompt.status,
    heartbeat_at: prompt.heartbeat_at,
    queue_position: TERMINAL_PROMPT_STATUSES.has(normalizePromptStatus(prompt.status)) ? null : index + 1,
    dependency: prompt.dependency,
    child_outcomes: prompt.child_outcomes || [],
    blocker: prompt.blocker,
    result: prompt.result,
    evidence: prompt.evidence || [],
  };
}

function buildQueueViewModel(prompts = [], { now = new Date().toISOString() } = {}) {
  const sorted = [...prompts].sort((a, b) => promptQueueSortValue(a).localeCompare(promptQueueSortValue(b)));
  return {
    contract_version: PROMPT_QUEUE_CONTRACT_VERSION,
    routes: QUEUE_ROUTE_CONTRACTS,
    generated_at: now,
    prompts: sorted.map((prompt, index) => promptQueueItemView(prompt, index, now)),
    counts: sorted.reduce((acc, prompt) => {
      const status = normalizePromptStatus(prompt.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}),
  };
}

function buildPromptDetailViewModel(prompt = {}, { now = new Date().toISOString() } = {}) {
  return {
    contract_version: PROMPT_QUEUE_CONTRACT_VERSION,
    route: QUEUE_ROUTE_CONTRACTS.prompt.replace('<id>', prompt.prompt_id || ':id'),
    generated_at: now,
    prompt: promptQueueItemView(prompt, 0, now),
  };
}

function buildRambleStatusViewModel(prompt = {}, { now = new Date().toISOString() } = {}) {
  const childOutcomes = prompt.child_outcomes || [];
  const terminalChildren = childOutcomes.filter((child) => isTerminalChildOutcomeStatus(child.status));
  const allChildrenTerminal = childOutcomes.length > 0 && terminalChildren.length === childOutcomes.length;
  return {
    contract_version: PROMPT_QUEUE_CONTRACT_VERSION,
    route: QUEUE_ROUTE_CONTRACTS.ramble_status,
    generated_at: now,
    prompt_id: prompt.prompt_id,
    status: normalizePromptStatus(prompt.status),
    current_phase: prompt.current_phase || prompt.status,
    child_outcome_count: childOutcomes.length,
    terminal_child_outcome_count: terminalChildren.length,
    blocker: prompt.blocker || null,
    next_action: prompt.blocker
      ? 'Resolve the blocker or move the prompt to needs_decision.'
      : TERMINAL_PROMPT_STATUSES.has(normalizePromptStatus(prompt.status))
        ? 'Review evidence and archive when appropriate.'
        : allChildrenTerminal
          ? 'All child outcomes are terminal; move the parent prompt to completed, failed, or needs_decision with evidence.'
        : 'Continue the current work package and update heartbeat/evidence.',
    evidence: prompt.evidence || [],
  };
}

module.exports = {
  PROMPT_QUEUE_CONTRACT_VERSION,
  PROMPT_STATUSES,
  TERMINAL_PROMPT_STATUSES,
  TERMINAL_CHILD_OUTCOME_STATUSES,
  DEFAULT_AUTO_RESUME_STALE_AFTER_MS,
  PROMPT_STATUS_TRANSITIONS,
  QUEUE_ROUTE_CONTRACTS,
  normalizePromptStatus,
  normalizeChildOutcomeStatus,
  isTerminalChildOutcomeStatus,
  createPromptId,
  createParentPrompt,
  canTransitionPrompt,
  transitionPrompt,
  appendChildOutcome,
  buildPromptAutoResumePlan,
  applyPromptAutoResumePlan,
  buildQueueViewModel,
  buildPromptDetailViewModel,
  buildRambleStatusViewModel,
};
