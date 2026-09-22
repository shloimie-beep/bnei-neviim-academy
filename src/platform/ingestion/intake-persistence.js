const { stableHash } = require('./intake-source');

const CANONICAL_INTAKE_PERSISTENCE_VERSION = 'w3-canonical-intake-persistence-v1';

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function mapFromSeed(seedValue = []) {
  if (seedValue instanceof Map) return new Map(seedValue);
  if (Array.isArray(seedValue)) {
    return new Map(seedValue.map((row) => [
      row.stable_id || row.parse_run_id || row.parse_item_id || row.entity_id || row.prompt_id,
      clone(row),
    ]).filter(([key]) => key));
  }
  return new Map();
}

function createMemoryIntakePersistenceStore(seed = {}) {
  return {
    contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    storage_kind: 'memory',
    raw_intake: mapFromSeed(seed.raw_intake),
    parse_runs: mapFromSeed(seed.parse_runs),
    parse_items: mapFromSeed(seed.parse_items),
    parsed_entities: mapFromSeed(seed.parsed_entities),
    parent_prompts: mapFromSeed(seed.parent_prompts),
    audit_events: Array.isArray(seed.audit_events) ? clone(seed.audit_events) : [],
  };
}

function assertMemoryStore(store = {}) {
  for (const key of ['raw_intake', 'parse_runs', 'parse_items', 'parent_prompts']) {
    if (!(store[key] instanceof Map)) {
      throw new Error(`canonical intake memory store is missing ${key}`);
    }
  }
  if (!(store.parsed_entities instanceof Map)) store.parsed_entities = new Map();
  if (!Array.isArray(store.audit_events)) store.audit_events = [];
  return store;
}

function packetPersistence(packet = {}) {
  if (!packet || typeof packet !== 'object' || !packet.persistence) {
    throw new Error('canonical intake packet persistence is required');
  }
  if (!packet.persistence.raw_intake?.stable_id) {
    throw new Error('canonical intake packet raw_intake.stable_id is required');
  }
  if (!packet.persistence.parse_run) {
    throw new Error('canonical intake packet parse_run is required');
  }
  if (!packet.persistence.parent_prompt?.prompt_id) {
    throw new Error('canonical intake packet parent_prompt.prompt_id is required');
  }
  return packet.persistence;
}

function parseRunStableId(parseRun = {}, rawIntake = {}) {
  const parts = [
    parseRun.input_hash || rawIntake.fingerprint || rawIntake.raw_text_hash || '',
    parseRun.parser_version || '',
    parseRun.source_type || rawIntake.source_kind || '',
    parseRun.source_id || rawIntake.source_id || rawIntake.stable_id || '',
  ];
  return `parse_run_${stableHash(parts.join('|')).slice(0, 16)}`;
}

function parseItemStableId(parseRunId, item = {}) {
  return `parse_item_${stableHash([
    parseRunId,
    item.item_key || item.idempotency_key || item.item_id || '',
    item.item_type || '',
  ].join('|')).slice(0, 16)}`;
}

function parsedEntityStableId(parseRunId, item = {}) {
  return `entity_${stableHash([
    parseRunId,
    item.parse_item_id || '',
    item.item_key || item.idempotency_key || item.item_id || '',
    item.item_type || '',
  ].join('|')).slice(0, 16)}`;
}

function canonicalEntityRowFromParseItem(item = {}, index = 0) {
  return {
    entity_id: item.entity_id || parsedEntityStableId(item.parse_run_id, item),
    parse_item_id: item.parse_item_id,
    parse_run_id: item.parse_run_id,
    raw_intake_stable_id: item.raw_intake_stable_id,
    parent_prompt_id: item.parent_prompt_id,
    item_id: item.item_id || null,
    entity_key: item.item_key || item.idempotency_key || item.parse_item_id,
    entity_group: item.group || item.item_type || 'unknown',
    entity_type: item.item_type || 'unknown',
    title: item.title || item.item_type || 'Parsed intake item',
    status: item.status || 'parsed',
    target_lane: item.target_lane || null,
    workspace_key: item.workspace_key || null,
    project_key: item.project_key || null,
    confidence: item.confidence || null,
    owner: item.owner || null,
    expected_result: item.expected_result || null,
    next_action: item.next_action || null,
    reason: item.reason || null,
    idempotency_key: item.idempotency_key || null,
    source_stable_key: item.source_stable_key || null,
    source_id: item.source_id || null,
    source_excerpt: item.source_excerpt || null,
    metadata: item.metadata && typeof item.metadata === 'object' ? clone(item.metadata) : {},
    sort_index: Number(item.sort_index ?? index),
    persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    external_write_performed: false,
    updated_at: item.updated_at || null,
  };
}

function canonicalRowsFromPacket(packet = {}, options = {}) {
  const persistence = packetPersistence(packet);
  const appliedAt = options.applied_at || options.appliedAt || new Date().toISOString();
  const rawIntake = {
    ...clone(persistence.raw_intake),
    persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    external_write_performed: false,
    updated_at: appliedAt,
  };
  const parseRunId = persistence.parse_run.parse_run_id || parseRunStableId(persistence.parse_run, rawIntake);
  const parseRun = {
    ...clone(persistence.parse_run),
    parse_run_id: parseRunId,
    raw_intake_stable_id: rawIntake.stable_id,
    parent_prompt_id: persistence.parent_prompt.prompt_id,
    persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    external_write_performed: false,
    updated_at: appliedAt,
  };
  const parentPrompt = {
    ...clone(persistence.parent_prompt),
    raw_intake_stable_id: rawIntake.stable_id,
    parse_run_id: parseRunId,
    persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    external_write_performed: false,
    updated_at: appliedAt,
  };
  const parseItems = (persistence.parse_items || []).map((item, index) => ({
    ...clone(item),
    parse_item_id: item.parse_item_id || parseItemStableId(parseRunId, item),
    parse_run_id: parseRunId,
    raw_intake_stable_id: rawIntake.stable_id,
    parent_prompt_id: parentPrompt.prompt_id,
    sort_index: index,
    persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    external_write_performed: false,
    updated_at: appliedAt,
  }));
  const parsedEntities = parseItems.map((item, index) => canonicalEntityRowFromParseItem(item, index));
  return {
    raw_intake: rawIntake,
    parse_run: parseRun,
    parse_items: parseItems,
    parsed_entities: parsedEntities,
    parent_prompt: parentPrompt,
  };
}

function readCanonicalIntakePersistence(store = {}, locator = {}) {
  assertMemoryStore(store);
  const rawId = locator.raw_intake_stable_id || locator.rawIntakeStableId || locator.stable_id || null;
  const parseRunId = locator.parse_run_id || locator.parseRunId || null;
  const parentPromptId = locator.parent_prompt_id || locator.parentPromptId || locator.prompt_id || null;
  const parseRun = parseRunId
    ? store.parse_runs.get(parseRunId) || null
    : Array.from(store.parse_runs.values()).find((row) =>
        (rawId && row.raw_intake_stable_id === rawId) ||
        (parentPromptId && row.parent_prompt_id === parentPromptId)
      ) || null;
  const parentPrompt = parentPromptId
    ? store.parent_prompts.get(parentPromptId) || null
    : Array.from(store.parent_prompts.values()).find((row) =>
        (rawId && row.raw_intake_stable_id === rawId) ||
        (parseRun?.parse_run_id && row.parse_run_id === parseRun.parse_run_id)
      ) || null;
  const effectiveParseRunId = parseRunId || parseRun?.parse_run_id || null;
  const effectiveRawId = rawId || parseRun?.raw_intake_stable_id || parentPrompt?.raw_intake_stable_id || null;
  const rawIntake = effectiveRawId ? store.raw_intake.get(effectiveRawId) || null : null;
  const parseItems = Array.from(store.parse_items.values())
    .filter((row) =>
      (effectiveParseRunId && row.parse_run_id === effectiveParseRunId) ||
      (effectiveRawId && row.raw_intake_stable_id === effectiveRawId) ||
      (parentPrompt?.prompt_id && row.parent_prompt_id === parentPrompt.prompt_id)
    )
    .sort((a, b) => Number(a.sort_index || 0) - Number(b.sort_index || 0));
  const parsedEntities = Array.from(store.parsed_entities.values())
    .filter((row) =>
      (effectiveParseRunId && row.parse_run_id === effectiveParseRunId) ||
      (effectiveRawId && row.raw_intake_stable_id === effectiveRawId) ||
      (parentPrompt?.prompt_id && row.parent_prompt_id === parentPrompt.prompt_id)
    )
    .sort((a, b) => Number(a.sort_index || 0) - Number(b.sort_index || 0));
  const entityCountsByGroup = parsedEntities.reduce((acc, row) => {
    const group = row.entity_group || row.entity_type || 'unknown';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  return {
    contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    storage_kind: store.storage_kind || 'memory',
    external_write_performed: false,
    found: Boolean(rawIntake || parseRun || parentPrompt || parseItems.length || parsedEntities.length),
    raw_intake: clone(rawIntake),
    parse_run: clone(parseRun),
    parse_items: clone(parseItems),
    parsed_entities: clone(parsedEntities),
    parent_prompt: clone(parentPrompt),
    counts: {
      raw_intake: rawIntake ? 1 : 0,
      parse_runs: parseRun ? 1 : 0,
      parse_items: parseItems.length,
      parsed_entities: parsedEntities.length,
      parent_prompts: parentPrompt ? 1 : 0,
    },
    entity_counts_by_group: entityCountsByGroup,
  };
}

function applyCanonicalIntakePacketToMemory(packet = {}, options = {}) {
  const store = assertMemoryStore(options.store || createMemoryIntakePersistenceStore());
  const rows = canonicalRowsFromPacket(packet, options);
  const beforeCounts = {
    raw_intake: store.raw_intake.size,
    parse_runs: store.parse_runs.size,
    parse_items: store.parse_items.size,
    parsed_entities: store.parsed_entities.size,
    parent_prompts: store.parent_prompts.size,
  };
  store.raw_intake.set(rows.raw_intake.stable_id, rows.raw_intake);
  store.parse_runs.set(rows.parse_run.parse_run_id, rows.parse_run);
  store.parent_prompts.set(rows.parent_prompt.prompt_id, rows.parent_prompt);
  for (const item of rows.parse_items) {
    store.parse_items.set(item.parse_item_id, item);
  }
  for (const entity of rows.parsed_entities) {
    store.parsed_entities.set(entity.entity_id, entity);
  }
  const readback = readCanonicalIntakePersistence(store, {
    raw_intake_stable_id: rows.raw_intake.stable_id,
    parse_run_id: rows.parse_run.parse_run_id,
    parent_prompt_id: rows.parent_prompt.prompt_id,
  });
  const afterCounts = {
    raw_intake: store.raw_intake.size,
    parse_runs: store.parse_runs.size,
    parse_items: store.parse_items.size,
    parsed_entities: store.parsed_entities.size,
    parent_prompts: store.parent_prompts.size,
  };
  const result = {
    contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    storage_kind: store.storage_kind || 'memory',
    external_write_performed: false,
    applied: true,
    raw_intake_stable_id: rows.raw_intake.stable_id,
    parse_run_id: rows.parse_run.parse_run_id,
    parent_prompt_id: rows.parent_prompt.prompt_id,
    parse_item_ids: rows.parse_items.map((item) => item.parse_item_id),
    parsed_entity_ids: rows.parsed_entities.map((item) => item.entity_id),
    before_counts: beforeCounts,
    after_counts: afterCounts,
    readback,
  };
  store.audit_events.push({
    event_type: 'canonical_intake_memory_apply',
    raw_intake_stable_id: result.raw_intake_stable_id,
    parse_run_id: result.parse_run_id,
    parent_prompt_id: result.parent_prompt_id,
    parse_item_count: result.parse_item_ids.length,
    parsed_entity_count: result.parsed_entity_ids.length,
    external_write_performed: false,
  });
  return result;
}

module.exports = {
  CANONICAL_INTAKE_PERSISTENCE_VERSION,
  createMemoryIntakePersistenceStore,
  canonicalRowsFromPacket,
  readCanonicalIntakePersistence,
  applyCanonicalIntakePacketToMemory,
};
