const { parseIntakeText } = require('../../lib/bna/intake-parser');
const { titleFromActionText, compactWhitespace } = require('../../lib/bna/task-shaping');
const {
  stableHash,
  normalizeWorkspace,
  classifySourceEnvelope,
  classifySourceSegmentContext,
} = require('./intake-source');

const PLATFORM_PARSER_CONTRACT_VERSION = 'w3-platform-parser-v1';

const CONFIDENCE_LABELS = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

function emptyParserOutput(input = {}) {
  const sourceEnvelope = input.source_envelope || input.sourceEnvelope || classifySourceEnvelope({
    ...input,
    raw_text: input.raw_text || input.raw_input || input.text || '',
    parser_version: PLATFORM_PARSER_CONTRACT_VERSION,
  });
  return {
    parser_version: PLATFORM_PARSER_CONTRACT_VERSION,
    source_envelope: sourceEnvelope,
    workspace: {
      key: normalizeWorkspace(input.workspace_key || input.workspace || input.project_key || input.project) || sourceEnvelope.default_workspace || 'bna',
      project_key: normalizeProjectKey(input.raw_text || input.raw_input || '', input) || sourceEnvelope.default_project || 'bna',
      resolution_status: sourceEnvelope.default_context_type === 'unknown_needs_review' ? 'needs_review' : 'source_envelope_default',
    },
    participants: [],
    decisions: [],
    tasks: [],
    calendar_events: [],
    content_items: [],
    community_items: [],
    integration_items: [],
    notes: [],
    unresolved: [],
    deduplication_keys: [],
    parent_prompt: {
      source_id: input.source_id || input.sourceId || null,
      raw_id: input.raw_id || input.rawId || null,
    },
  };
}

function normalizeProjectKey(text = '', input = {}) {
  const explicit = input.project_key || input.projectKey || input.project || null;
  if (explicit) return normalizeWorkspace(explicit) || explicit;
  if (/\b(one[-\s]?time|onetime|rabbi\s+elie|scheller|sheller|mishnah|mishna|mishnayos|mishnayot)\b/i.test(String(text || ''))) {
    return 'one_time_mishnah_class';
  }
  return 'bna';
}

function confidenceLabel(score = 0.5) {
  const numeric = Number(score || 0);
  if (numeric >= 0.85) return CONFIDENCE_LABELS.high;
  if (numeric >= 0.65) return CONFIDENCE_LABELS.medium;
  return CONFIDENCE_LABELS.low;
}

function sourceExcerptFromItem(item = {}) {
  return compactWhitespace(item.source_quote || item.source_excerpt || item.raw_excerpt || item.summary || item.title || '').slice(0, 360);
}

function safeVisibleTitle(item = {}, fallback = 'Review parsed intake item') {
  const source = item.title || item.short_title || item.what || item.summary || fallback;
  const title = titleFromActionText(source, fallback);
  return title === compactWhitespace(item.raw_input || item.source_quote || '')
    ? titleFromActionText(sourceExcerptFromItem(item), fallback)
    : title;
}

function containsPrivateStudentCue(text = '') {
  return /\b(accountability|behavior|diet|nutrition|medical|parent note|private|student cannot|struggling|meltdown|therapy|diagnosis)\b/i.test(String(text || ''));
}

function containsSystemWorkCue(text = '') {
  return /\b(codex|server|api|database|dashboard|operations|parser|queue|deploy|railway|watchdog|button|route|bug|fix|build|implement)\b/i.test(String(text || ''));
}

function dedupeKeyForItem(type, item = {}, workspaceKey = 'bna') {
  const title = safeVisibleTitle(item, `${type} item`).toLowerCase();
  const excerpt = sourceExcerptFromItem(item).toLowerCase();
  return stableHash([workspaceKey, type, title, excerpt.slice(0, 180)].join('|'));
}

function existingDedupeKeys(existingRecords = []) {
  return new Set((existingRecords || []).map((record) => record.idempotency_key || record.deduplication_key || record.dedupe_key).filter(Boolean));
}

function normalizeParsedItem(type, item = {}, output = {}, input = {}) {
  const sourceEnvelope = output.source_envelope || classifySourceEnvelope(input);
  const itemSourceContext = item.metadata?.source_context && typeof item.metadata.source_context === 'object'
    ? item.metadata.source_context
    : classifySourceSegmentContext(`${item.title || ''} ${item.summary || ''} ${item.source_excerpt || ''}`, sourceEnvelope);
  const workspaceKey = item.workspace_key || itemSourceContext.workspace_key || output.workspace.key || 'bna';
  const key = dedupeKeyForItem(type, item, workspaceKey);
  const projectKey = item.project_key
    || itemSourceContext.project_key
    || normalizeProjectKey(`${item.title || ''} ${item.summary || ''} ${item.source_excerpt || ''}`, input);
  return {
    item_id: item.stable_id || `${type.toUpperCase()}-${key.slice(0, 12)}`,
    item_type: type,
    title: safeVisibleTitle(item, `Review ${type.replace(/_/g, ' ')}`),
    target_lane: item.target_lane || laneForType(type),
    status: item.status || 'parsed',
    confidence: confidenceLabel(item.confidence),
    confidence_score: Number(item.confidence || 0.5),
    idempotency_key: key,
    deduplication_key: key,
    owner: item.owner || item.assigned_to || null,
    workspace_key: workspaceKey,
    project_key: projectKey,
    provenance: {
      raw_id: input.raw_id || input.rawId || item.related_raw_id || null,
      source_id: input.source_id || input.sourceId || null,
      source_excerpt: sourceExcerptFromItem(item),
      source_item_key: item.item_key || null,
    },
    expected_result: item.expected_result || item.what || item.summary || null,
    next_action: item.next_action || null,
    metadata: {
      ...(item.metadata && typeof item.metadata === 'object' ? item.metadata : {}),
      source_context: {
        ...(itemSourceContext && typeof itemSourceContext === 'object' ? itemSourceContext : {}),
        workspace_key: workspaceKey,
        project_key: projectKey,
      },
    },
  };
}

function laneForType(type = '') {
  if (type === 'decision') return 'Decisions';
  if (type === 'task') return 'Tasks';
  if (type === 'calendar_event') return 'Calendar';
  if (type === 'content_item') return 'Content';
  if (type === 'community_item') return 'Community';
  if (type === 'integration_item') return 'Integrations';
  if (type === 'note') return 'Notes';
  return 'Review';
}

function pushUnique(output, key, item, seen, existing) {
  if (existing.has(item.idempotency_key)) {
    output.unresolved.push({
      item_type: item.item_type,
      title: item.title,
      reason: 'duplicate_active_or_recent_record',
      idempotency_key: item.idempotency_key,
      provenance: item.provenance,
    });
    output.deduplication_keys.push(item.idempotency_key);
    return;
  }
  if (seen.has(item.idempotency_key)) return;
  seen.add(item.idempotency_key);
  output[key].push(item);
  output.deduplication_keys.push(item.idempotency_key);
}

function shouldSuppressRetryNoise(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''} ${item.source_excerpt || ''}`;
  return /\b(stale heartbeat|retry noise|queued without claim|running without heartbeat|watchdog requeued)\b/i.test(text)
    && !/\b(fix|repair|implement|decide|operator decision)\b/i.test(text);
}

function mapCanonicalParserOutput(parsed = {}, input = {}) {
  const output = emptyParserOutput(input);
  output.source_envelope = parsed.source_envelope || parsed.sourceEnvelope || output.source_envelope;
  const existing = existingDedupeKeys(input.existing_records || input.existingRecords || []);
  const seen = new Set();
  const rawText = input.raw_text || input.raw_input || input.text || parsed.raw_input || '';
  output.workspace.project_key = output.source_envelope.default_project || normalizeProjectKey(rawText, input);
  output.workspace.key = output.source_envelope.default_workspace || output.workspace.key;
  if (output.workspace.project_key === 'one_time_mishnah_class') {
    output.workspace.key = normalizeWorkspace(input.workspace_key || input.workspace || '') || output.workspace.key || 'one_time_mishnah_class';
    output.workspace.resolution_status = 'high_confidence_alias';
  }

  for (const person of parsed.extracted_people || []) {
    const item = normalizeParsedItem('participant', {
      ...person,
      title: person.display_name || person.name || 'Participant',
      confidence: person.confidence || 0.75,
    }, output, input);
    pushUnique(output, 'participants', item, seen, existing);
  }

  const parsedDecisions = [
    ...(parsed.decisions || []),
    ...(parsed.open_questions || []).map((question) => ({
      ...question,
      title: question.title || 'Clarify intake question',
      metadata: { ...(question.metadata || {}), decision_source: 'open_question' },
    })),
  ];
  for (const decision of parsedDecisions) {
    pushUnique(output, 'decisions', normalizeParsedItem('decision', decision, output, input), seen, existing);
  }

  for (const event of [...(parsed.calendar_events || []), ...(parsed.calendar_items || []), ...(parsed.schedule_items || [])]) {
    pushUnique(output, 'calendar_events', normalizeParsedItem('calendar_event', {
      ...event,
      target_lane: event.target_lane || 'Calendar',
    }, output, input), seen, existing);
  }

  const parsedTasks = [...(parsed.tasks || []), ...(parsed.tickets || [])];
  for (const task of parsedTasks) {
    if (shouldSuppressRetryNoise(task)) {
      output.unresolved.push({
        item_type: 'task',
        title: safeVisibleTitle(task, 'Review retry noise'),
        reason: 'retry_or_watchdog_noise_not_visible_task',
        provenance: { source_excerpt: sourceExcerptFromItem(task) },
      });
      continue;
    }
    pushUnique(output, 'tasks', normalizeParsedItem('task', task, output, input), seen, existing);
  }

  for (const item of parsed.content_items || []) {
    const text = `${item.title || ''} ${item.summary || ''} ${item.source_excerpt || ''}`;
    if (containsPrivateStudentCue(text)) {
      pushUnique(output, 'notes', normalizeParsedItem('note', {
        ...item,
        title: safeVisibleTitle(item, 'Review private student note'),
        metadata: { ...(item.metadata || {}), privacy_reroute: 'not_public_content' },
      }, output, input), seen, existing);
    } else {
      pushUnique(output, 'content_items', normalizeParsedItem('content_item', item, output, input), seen, existing);
    }
  }

  for (const item of [...(parsed.communications || []), ...(parsed.contact_items || [])]) {
    pushUnique(output, 'community_items', normalizeParsedItem('community_item', item, output, input), seen, existing);
  }

  for (const item of parsed.integration_items || []) {
    pushUnique(output, 'integration_items', normalizeParsedItem('integration_item', item, output, input), seen, existing);
  }

  const noteItems = [
    ...(parsed.student_notes || []),
    ...(parsed.student_questions || []),
    ...(parsed.student_observations || []),
    ...(parsed.class_session_notes || []),
    ...(parsed.research_items || []),
    ...(parsed.accounting_items || []),
    ...(parsed.goals || []),
    ...(parsed.attendance || []),
    ...(parsed.assignments || []),
    ...(parsed.behavior_notes || []),
  ];
  for (const item of noteItems) {
    const text = `${item.title || ''} ${item.summary || ''} ${item.source_excerpt || ''}`;
    if (containsSystemWorkCue(text) && /student|class|content|note/i.test(item.item_type || '')) {
      pushUnique(output, 'tasks', normalizeParsedItem('task', {
        ...item,
        title: safeVisibleTitle(item, 'Review system work from intake'),
        owner: 'Codex',
        metadata: { ...(item.metadata || {}), rerouted_from_student_record: true },
      }, output, input), seen, existing);
    } else {
      pushUnique(output, 'notes', normalizeParsedItem('note', item, output, input), seen, existing);
    }
  }

  if ((parsed.review_items || []).some((item) => ['unclear_scope', 'ambiguous_person', 'low_confidence_item', 'workspace_routing'].includes(item.review_type))) {
    const decision = normalizeParsedItem('decision', {
      title: 'Decide ambiguous intake routing',
      summary: 'Parser found ambiguous scope, person, or filing confidence.',
      confidence: 0.9,
      next_action: 'Choose the correct workspace/lane or approve parser filing.',
      metadata: { decision_type: 'parser_ambiguity' },
    }, output, input);
    pushUnique(output, 'decisions', decision, seen, existing);
  }

  const hasZoomAttendanceFact = /\b(attended|present|absent|late|joined|no[-\s]?show)\b/i.test(rawText)
    && !/\b(no attendance|attendance (?:was )?(?:not )?recorded|without attendance|attendance unknown)\b/i.test(rawText);
  if (/\bzoom\b/i.test(rawText) && !hasZoomAttendanceFact) {
    output.unresolved.push({
      item_type: 'calendar_event',
      title: 'Do not infer Zoom attendance',
      reason: 'Zoom was mentioned without an explicit attendance fact.',
      provenance: { source_excerpt: compactWhitespace(rawText).slice(0, 240) },
    });
  }

  return validatePlatformParserOutput(output);
}

function validatePlatformParserOutput(output = {}) {
  const errors = [];
  for (const key of ['participants', 'decisions', 'tasks', 'calendar_events', 'content_items', 'community_items', 'integration_items', 'notes', 'unresolved', 'deduplication_keys']) {
    if (!Array.isArray(output[key])) errors.push(`${key} must be an array`);
  }
  if (!output.workspace || typeof output.workspace !== 'object') errors.push('workspace must be an object');
  for (const key of ['decisions', 'tasks', 'content_items', 'community_items', 'integration_items', 'notes']) {
    for (const item of output[key] || []) {
      if (!item.idempotency_key) errors.push(`${key} item missing idempotency_key`);
      if (!item.title || item.title.length > 120) errors.push(`${key} item has invalid visible title`);
      if (!['high', 'medium', 'low'].includes(item.confidence)) errors.push(`${key} item has invalid confidence`);
    }
  }
  output.schema_valid = errors.length === 0;
  output.schema_errors = errors;
  return output;
}

function parsePlatformIntake(input = {}) {
  const raw = String(input.raw_text || input.raw_input || input.text || '').trim();
  if (!raw) {
    const error = new Error('raw_text is required');
    error.statusCode = 400;
    throw error;
  }
  const parsed = parseIntakeText({
    ...input,
    raw_input: raw,
    source_type: input.source_type || input.source || input.source_provider || 'manual',
  });
  return mapCanonicalParserOutput(parsed, { ...input, raw_text: raw });
}

module.exports = {
  PLATFORM_PARSER_CONTRACT_VERSION,
  CONFIDENCE_LABELS,
  emptyParserOutput,
  normalizeProjectKey,
  confidenceLabel,
  safeVisibleTitle,
  dedupeKeyForItem,
  validatePlatformParserOutput,
  mapCanonicalParserOutput,
  parsePlatformIntake,
};
