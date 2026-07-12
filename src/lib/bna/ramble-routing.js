'use strict';

const {
  parseIntakeText,
  splitIntoFragments,
} = require('./intake-parser');
const {
  compactWhitespace,
  formatStableId,
  isoDate,
  sourceQuote,
  stableHash,
} = require('./ramble-protocol');

const RAMBLE_ROUTING_VERSION = 'bna-ramble-routing-v1';
const TERMINAL_STATUSES = new Set(['Done', 'Already satisfied', 'Blocked', 'Needs operator decision', 'Failed', 'Archived', 'Superseded']);

function normalizeKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function tokenSet(value = '') {
  return new Set(normalizeKey(value).split('_').filter((token) => token.length > 2));
}

function overlapScore(left = '', right = '') {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap += 1;
  }
  return overlap / Math.min(a.size, b.size);
}

function statementId(dateValue, index, text = '') {
  return `STMT-${isoDate(dateValue).replace(/-/g, '')}-${String(index + 1).padStart(3, '0')}-${stableHash(text).slice(0, 8).toUpperCase()}`;
}

function canonicalItemKey(type = 'item', title = '', workspaceKey = '') {
  return `${normalizeKey(type)}:${normalizeKey(workspaceKey || 'bna')}:${normalizeKey(title).slice(0, 120)}`;
}

function classifyStatement(text = '') {
  const value = String(text || '');
  if (
    /\b(decide|decision|choose|should we|whether)\b/i.test(value)
    || /\bapprove\b/i.test(value)
    || /\bapproval\s+(?:required|needed|gate|decision|from|by)\b/i.test(value)
  ) return 'decision';
  if (/\b(remember|from now on|always|never|source of truth|durable memory)\b/i.test(value)) return 'memory_candidate';
  if (/\b(ticket|support|broken|bug|problem|doesn't work|does not work)\b/i.test(value)) return 'ticket';
  if (/\b(task|todo|codex|fix|build|implement|test|run|wire|route|persist|database|api|ui|button|page|portal|helper|assistant)\b/i.test(value)) return 'task';
  if (/\b(must|should|requirement|expected|acceptance|needs to|make sure)\b/i.test(value)) return 'requirement';
  return 'review';
}

function titleFromStatement(text = '', fallback = 'Review ramble statement') {
  return sourceQuote(
    compactWhitespace(text)
      .replace(/^(task|todo|decision|requirement|remember|from now on)\s*[:=-]\s*/i, '')
      .replace(/\b(i need you to|please|can you|could you|make sure to)\b/gi, '')
      .trim(),
    96
  ) || fallback;
}

function isOwnerDecisionText(text = '') {
  const value = String(text || '');
  return /\b(decide|decision|choose|owner|external|credential|account|dns|billing|payment|legal|privacy)\b/i.test(value)
    || /\bapprove\b/i.test(value)
    || /\bapproval\s+(?:required|needed|gate|decision|from|by)\b/i.test(value);
}

function hasUnsupportedDoneClaim(text = '', evidencePaths = []) {
  return /\b(done|finished|complete|completed|already fixed|shipped)\b/i.test(String(text || ''))
    && !(Array.isArray(evidencePaths) && evidencePaths.length);
}

function buildSourceEnvelope(input = {}) {
  const rawText = String(input.raw_input || input.raw_text || input.text || '').trim();
  const sourceDate = isoDate(input.source_date || input.sourceDate || input.created_at || input.createdAt || null);
  const rawId = input.raw_id || formatStableId('raw', sourceDate, 1, {
    source: input.source_channel || input.source_type || input.source || 'codex_chat',
    rawText,
  });
  return {
    raw_id: rawId,
    source_channel: input.source_channel || input.source_type || input.source || 'codex_chat',
    source_date: sourceDate,
    workspace_key: input.workspace_key || input.workspaceKey || 'bna',
    project_key: input.project_key || input.projectKey || null,
    privacy_classification: input.privacy_classification || input.privacyClassification || 'internal_agent_work',
    raw_text_sha256: stableHash(rawText),
    raw_text: rawText,
  };
}

function buildStatementRecords(input = {}, sourceEnvelope = buildSourceEnvelope(input)) {
  const rawText = sourceEnvelope.raw_text;
  return splitIntoFragments(rawText).map((fragment, index) => ({
    statement_id: statementId(sourceEnvelope.source_date, index, fragment.text),
    index: index + 1,
    text: fragment.text,
    offset_start: fragment.start,
    offset_end: fragment.end,
    source_excerpt: fragment.excerpt,
    statement_hash: stableHash(fragment.text),
    classification: classifyStatement(fragment.text),
  }));
}

function existingMatches(statement = {}, existingItems = []) {
  const text = statement.text || '';
  return (existingItems || [])
    .filter((item) => {
      if (item.statement_hash && item.statement_hash === statement.statement_hash) return true;
      if (item.canonical_key && item.canonical_key === canonicalItemKey(statement.classification, titleFromStatement(text), item.workspace_key || 'bna')) return true;
      return overlapScore(item.title || item.canonical_key || '', text) >= 0.72;
    });
}

function supersededMatches(statement = {}, existingItems = []) {
  if (!/\b(instead|replace|supersede|no longer|contradict|actually|not that)\b/i.test(statement.text || '')) return [];
  return (existingItems || []).filter((item) => overlapScore(item.title || item.canonical_key || '', statement.text) >= 0.35);
}

function buildRoutingItem(statement = {}, sourceEnvelope = {}, existingItems = [], index = 0, evidencePaths = []) {
  const classification = statement.classification;
  const title = titleFromStatement(statement.text);
  const stableType = classification === 'review' ? 'requirement' : classification;
  const stableId = formatStableId(stableType, sourceEnvelope.source_date, index + 1, {
    raw_id: sourceEnvelope.raw_id,
    statement_id: statement.statement_id,
    title,
  });
  const supersedes = supersededMatches(statement, existingItems);
  const duplicateOf = supersedes.length ? null : (existingMatches(statement, existingItems)[0] || null);
  const unsupportedDoneClaim = hasUnsupportedDoneClaim(statement.text, evidencePaths);
  const needsDecision = isOwnerDecisionText(statement.text) && classification !== 'decision';
  const itemType = classification === 'review' ? 'requirement' : classification;
  let status = 'queued';
  if (duplicateOf) status = 'Already satisfied';
  else if (classification === 'decision') status = 'Needs operator decision';
  else if (needsDecision) status = 'Blocked';
  else if (unsupportedDoneClaim) status = 'needs_verification';

  return {
    stable_id: stableId,
    canonical_key: canonicalItemKey(itemType, title, sourceEnvelope.workspace_key),
    item_type: itemType,
    title,
    source_id: sourceEnvelope.raw_id,
    source_statement_ids: [statement.statement_id],
    source_quote: statement.source_excerpt || sourceQuote(statement.text),
    workspace_key: sourceEnvelope.workspace_key,
    project_key: sourceEnvelope.project_key,
    owner: classification === 'decision' || needsDecision ? 'Shloimie' : 'Codex',
    status,
    duplicate_of: duplicateOf?.stable_id || duplicateOf?.id || null,
    supersedes: supersedes.map((item) => item.stable_id || item.id || item.canonical_key).filter(Boolean),
    blocker: needsDecision ? 'Owner/external decision is required before this item can proceed.' : null,
    blocker_owner: needsDecision ? 'Shloimie' : null,
    next_action: classification === 'decision'
      ? 'Choose the option or provide the missing external information.'
      : needsDecision
        ? 'Resolve the linked Decision, then re-evaluate the dependent task.'
        : 'Inspect affected files/workflows, implement or verify, and record evidence.',
    unsupported_done_claim: unsupportedDoneClaim,
    evidence_paths: evidencePaths,
    statement_hash: statement.statement_hash,
    created_at: new Date().toISOString(),
  };
}

function buildSourceStatementMappings(statements = [], items = []) {
  return statements.map((statement) => {
    const mappedItems = items.filter((item) => item.source_statement_ids?.includes(statement.statement_id));
    return {
      statement_id: statement.statement_id,
      classification: statement.classification,
      mapped_item_ids: mappedItems.map((item) => item.stable_id),
      mapped_item_types: [...new Set(mappedItems.map((item) => item.item_type))],
      explicit_exclusion: mappedItems.length ? null : 'review_only_no_executable_item',
    };
  });
}

function activeQueueItems(items = []) {
  return (items || []).filter((item) => {
    if (TERMINAL_STATUSES.has(item.status)) return false;
    if (item.duplicate_of) return false;
    if (item.status === 'completed' || item.status === 'done') return false;
    return true;
  });
}

function historicalEvidenceItems(items = []) {
  return (items || []).filter((item) => {
    return TERMINAL_STATUSES.has(item.status) || item.duplicate_of || (item.evidence_paths || []).length;
  });
}

function buildRambleRoutingPackage(input = {}, existingState = {}) {
  const source_envelope = buildSourceEnvelope(input);
  const parsed = parseIntakeText({
    raw_input: source_envelope.raw_text,
    source_type: source_envelope.source_channel,
    source_date: source_envelope.source_date,
    workspace_key: source_envelope.workspace_key,
    project_key: source_envelope.project_key,
    raw_id: source_envelope.raw_id,
  });
  const statements = buildStatementRecords(input, source_envelope);
  const evidencePaths = Array.isArray(input.evidence_paths) ? input.evidence_paths : [];
  const existingItems = existingState.items || existingState.requirements || [];
  const items = statements.map((statement, index) => buildRoutingItem(statement, source_envelope, existingItems, index, evidencePaths));
  const statement_mappings = buildSourceStatementMappings(statements, items);
  const decisions = items.filter((item) => item.item_type === 'decision');
  const decision = decisions[0] || null;
  const executable = items
    .filter((item) => ['task', 'requirement', 'ticket'].includes(item.item_type))
    .map((item) => decision && item.status === 'Blocked'
      ? { ...item, blocked_by_decision_id: decision.stable_id }
      : item);
  const allItems = items.map((item) => executable.find((candidate) => candidate.stable_id === item.stable_id) || item);
  const active = activeQueueItems(allItems);

  return {
    routing_version: RAMBLE_ROUTING_VERSION,
    source_envelope,
    parsed_summary: parsed.summary,
    statements,
    source_statement_mappings: statement_mappings,
    requirements: allItems.filter((item) => item.item_type === 'requirement'),
    executable_codex_tasks: executable.filter((item) => item.owner === 'Codex'),
    decisions,
    memory_context_updates: allItems.filter((item) => item.item_type === 'memory_candidate'),
    dedupe: {
      duplicate_count: allItems.filter((item) => item.duplicate_of).length,
      superseded_item_ids: [...new Set(allItems.flatMap((item) => item.supersedes || []))],
    },
    queue_visibility: {
      active_items: active,
      active_count: active.length,
      completed_hidden_from_active: historicalEvidenceItems(allItems),
    },
    no_lost_sentence: statement_mappings.every((mapping) => mapping.mapped_item_ids.length || mapping.explicit_exclusion),
    automatic_re_evaluation_supported: true,
  };
}

function reevaluateRambleQueueAfterDecision({ tasks = [], decisions = [] } = {}) {
  const decided = new Set((decisions || [])
    .filter((decision) => ['Decided', 'done', 'Done', 'approved'].includes(decision.status))
    .map((decision) => decision.stable_id || decision.decision_id || decision.id));
  return (tasks || []).map((task) => {
    const blockedBy = task.blocked_by_decision_id || task.blockedByDecisionId;
    if (blockedBy && decided.has(blockedBy)) {
      return {
        ...task,
        status: 'queued',
        blocker: null,
        blocker_owner: null,
        unblocked_by_decision_id: blockedBy,
        next_action: task.next_action_after_decision || 'Continue implementation now that the Decision is complete.',
      };
    }
    return task;
  });
}

module.exports = {
  RAMBLE_ROUTING_VERSION,
  activeQueueItems,
  buildRambleRoutingPackage,
  buildSourceEnvelope,
  buildStatementRecords,
  canonicalItemKey,
  classifyStatement,
  reevaluateRambleQueueAfterDecision,
};
