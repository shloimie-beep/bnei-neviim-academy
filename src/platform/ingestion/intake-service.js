const { createIntakeSourceRecord, stableHash } = require('./intake-source');
const { parsePlatformIntake } = require('./canonical-parser');
const { createParentPrompt, appendChildOutcome } = require('./prompt-queue');

const CANONICAL_INTAKE_SERVICE_VERSION = 'w3-canonical-intake-service-v1';

const PARSED_ITEM_GROUPS = [
  ['participants', 'participant', 'parsed'],
  ['decisions', 'decision', 'needs_decision'],
  ['tasks', 'task', 'queued'],
  ['calendar_events', 'calendar_event', 'queued'],
  ['content_items', 'content_item', 'queued'],
  ['community_items', 'community_item', 'queued'],
  ['integration_items', 'integration_item', 'queued'],
  ['notes', 'note', 'queued'],
  ['unresolved', 'unresolved', 'blocked'],
];

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function rawTextFromInput(input = {}) {
  return String(input.raw_text || input.rawText || input.raw_input || input.rawInput || input.text || '').trim();
}

function parsedItems(parsed = {}) {
  return PARSED_ITEM_GROUPS.flatMap(([key, fallbackType, defaultStatus]) => (
    (parsed[key] || []).map((item, index) => ({
      group: key,
      fallback_type: fallbackType,
      default_status: defaultStatus,
      item,
      index,
    }))
  ));
}

function buildParseItemRecord({ entry, sourceRecord = {}, parentPrompt = {} } = {}) {
  const item = entry.item || {};
  const itemType = item.item_type || entry.fallback_type;
  const itemId = item.item_id || item.stable_id || `${itemType}-${stableHash(JSON.stringify(item)).slice(0, 12)}`;
  const provenance = item.provenance && typeof item.provenance === 'object' ? item.provenance : {};
  return {
    item_id: itemId,
    item_key: item.idempotency_key || item.deduplication_key || `${itemType}:${itemId}`,
    item_type: itemType,
    group: entry.group,
    title: compactWhitespace(item.title || item.summary || item.reason || itemType),
    status: item.status || entry.default_status,
    target_lane: item.target_lane || null,
    owner: item.owner || item.assigned_to || null,
    workspace_key: item.workspace_key || null,
    project_key: item.project_key || null,
    confidence: item.confidence || null,
    expected_result: item.expected_result || item.what || item.summary || null,
    next_action: item.next_action || null,
    reason: item.reason || null,
    idempotency_key: item.idempotency_key || item.deduplication_key || null,
    source_stable_key: sourceRecord.stable_key || null,
    source_id: sourceRecord.source_id || null,
    parent_prompt_id: parentPrompt.prompt_id || null,
    source_excerpt: provenance.source_excerpt || item.source_excerpt || null,
    metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata : {},
  };
}

function shouldAttachChildOutcome(entry = {}) {
  return ['decisions', 'tasks', 'calendar_events', 'content_items', 'community_items', 'integration_items'].includes(entry.group);
}

function appendParsedChildOutcomes(parentPrompt = {}, entries = []) {
  return entries.filter(shouldAttachChildOutcome).reduce((prompt, entry) => {
    const item = entry.item || {};
    return appendChildOutcome(prompt, {
      child_id: item.item_id || item.stable_id || item.idempotency_key || undefined,
      item_type: item.item_type || entry.fallback_type,
      title: item.title || item.summary || entry.fallback_type,
      status: entry.default_status,
      evidence: item.evidence || [],
      idempotency_key: item.idempotency_key || item.deduplication_key || undefined,
    });
  }, parentPrompt);
}

function buildPersistencePlan({ sourceRecord = {}, parsed = {}, parentPrompt = {} } = {}) {
  const entries = parsedItems(parsed);
  const parseItems = entries.map((entry) => buildParseItemRecord({ entry, sourceRecord, parentPrompt }));
  const parsedPayloadHash = stableHash(JSON.stringify(parsed));
  return {
    contract_version: CANONICAL_INTAKE_SERVICE_VERSION,
    external_write_performed: false,
    raw_intake: {
      stable_id: sourceRecord.stable_key,
      idempotency_key: sourceRecord.idempotency_key,
      source_provider: sourceRecord.source_provider,
      source_channel: sourceRecord.source_channel,
      source_kind: sourceRecord.source_kind,
      source_id: sourceRecord.source_id,
      source_link: sourceRecord.source_link,
      fingerprint: sourceRecord.fingerprint,
      raw_text_hash: stableHash(sourceRecord.raw_text || ''),
      has_raw_text: Boolean(sourceRecord.has_raw_text),
      has_transcript: Boolean(sourceRecord.has_transcript),
      parse_status: parsed.schema_valid === false ? 'needs_review' : 'parsed',
      source_envelope: sourceRecord.source_envelope,
    },
    parse_run: {
      parser_version: parsed.parser_version,
      input_hash: sourceRecord.fingerprint,
      source_type: sourceRecord.source_kind,
      source_id: sourceRecord.source_id || sourceRecord.stable_key,
      status: parsed.schema_valid === false ? 'needs_review' : 'parsed',
      parsed_payload_hash: parsedPayloadHash,
      item_count: parseItems.length,
      schema_valid: Boolean(parsed.schema_valid),
      schema_errors: parsed.schema_errors || [],
    },
    parse_items: parseItems,
    parent_prompt: parentPrompt,
  };
}

function buildCanonicalIntakePacket(input = {}, options = {}) {
  const rawText = rawTextFromInput(input);
  if (!rawText) {
    const error = new Error('raw_text is required');
    error.statusCode = 400;
    throw error;
  }

  const sourceRecord = createIntakeSourceRecord({
    ...input,
    raw_text: rawText,
    parser_version: input.parser_version || input.parserVersion || options.parser_version || 'canonical-intake-service',
  });
  const parsed = parsePlatformIntake({
    ...input,
    raw_text: rawText,
    source_id: sourceRecord.source_id || sourceRecord.stable_key,
    raw_id: input.raw_id || input.rawId || sourceRecord.stable_key,
    source_provider: sourceRecord.source_provider,
    source_kind: sourceRecord.source_kind,
    source_type: input.source_type || input.sourceType || sourceRecord.source_kind || sourceRecord.source_provider,
    source_envelope: sourceRecord.source_envelope,
    existing_records: input.existing_records || input.existingRecords || [],
  });
  const promptStatus = options.prompt_status || input.prompt_status || input.promptStatus || 'queued';
  const parentPrompt = appendParsedChildOutcomes(createParentPrompt({
    source_record: sourceRecord,
    status: promptStatus,
    agent: options.agent || input.agent || null,
    workspace_key: parsed.workspace?.key || input.workspace_key || input.workspaceKey || sourceRecord.workspace_candidate || 'bna',
    title: options.title || input.title || sourceRecord.source_envelope?.title || undefined,
    metadata: {
      canonical_intake_service_version: CANONICAL_INTAKE_SERVICE_VERSION,
      parser_version: parsed.parser_version,
    },
  }), parsedItems(parsed));
  const persistence = buildPersistencePlan({ sourceRecord, parsed, parentPrompt });

  return {
    contract_version: CANONICAL_INTAKE_SERVICE_VERSION,
    generated_at: options.generated_at || new Date().toISOString(),
    external_write_performed: false,
    source_record: sourceRecord,
    parsed,
    parent_prompt: parentPrompt,
    persistence,
  };
}

module.exports = {
  CANONICAL_INTAKE_SERVICE_VERSION,
  PARSED_ITEM_GROUPS,
  rawTextFromInput,
  parsedItems,
  buildParseItemRecord,
  buildPersistencePlan,
  buildCanonicalIntakePacket,
};
