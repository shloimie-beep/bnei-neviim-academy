const {
  CANONICAL_INTAKE_PERSISTENCE_VERSION,
  canonicalRowsFromPacket,
} = require('./intake-persistence');

const CANONICAL_INTAKE_POSTGRES_VERSION = 'w3-canonical-intake-postgres-v1';

const POSTGRES_RAW_CHANNELS = new Set([
  'telegram',
  'website_bot',
  'codex_chat',
  'chatgpt',
  'github',
  'github_issue',
  'github_pr',
  'operations_ui',
  'drive',
  'approved_upload',
  'class_recording',
  'website_helper',
  'operations_helper',
  'email',
  'whatsapp',
  'wapi',
  'manual',
  'other',
]);

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function asJson(value, fallback = {}) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function jsonb(value) {
  return JSON.stringify(value === undefined ? null : value);
}

function normalizePostgresSourceChannel(value = '') {
  const key = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (POSTGRES_RAW_CHANNELS.has(key)) return key;
  if (/github/.test(key)) return key.includes('pr') || key.includes('pull') ? 'github_pr' : key.includes('issue') ? 'github_issue' : 'github';
  if (/chatgpt|chat_gpt|openai_chat/.test(key)) return 'chatgpt';
  if (/codex/.test(key)) return 'codex_chat';
  if (/drive|google_doc|google_drive/.test(key)) return 'drive';
  if (/upload/.test(key)) return 'approved_upload';
  if (/recording|transcript|audio|video/.test(key)) return 'class_recording';
  if (/operation|dashboard|ops/.test(key)) return 'operations_ui';
  if (/telegram/.test(key)) return 'telegram';
  if (/website|bot_widget/.test(key)) return 'website_bot';
  return key ? 'other' : 'manual';
}

function sourceRecordFromPacket(packet = {}) {
  return packet.source_record || {};
}

function rawTextFromPacket(packet = {}) {
  return String(sourceRecordFromPacket(packet).raw_text || packet.raw_text || packet.rawText || '').trim();
}

function transcriptTextFromPacket(packet = {}) {
  return String(sourceRecordFromPacket(packet).transcript_text || packet.transcript_text || packet.transcriptText || '').trim();
}

function rawIntakeMetadata(packet = {}, rows = {}) {
  const raw = rows.raw_intake || {};
  const source = sourceRecordFromPacket(packet);
  return {
    persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    postgres_contract_version: CANONICAL_INTAKE_POSTGRES_VERSION,
    source_provider: raw.source_provider || source.source_provider || null,
    source_kind: raw.source_kind || source.source_kind || null,
    source_link: raw.source_link || source.source_link || null,
    source_envelope: raw.source_envelope || source.source_envelope || null,
    raw_text_hash: raw.raw_text_hash || null,
    fingerprint: raw.fingerprint || source.fingerprint || null,
    external_write_performed: false,
  };
}

function parseRunMetadata(packet = {}, rows = {}) {
  const parseRun = rows.parse_run || {};
  return {
    persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    postgres_contract_version: CANONICAL_INTAKE_POSTGRES_VERSION,
    canonical_parse_run_id: parseRun.parse_run_id || null,
    raw_intake_stable_id: parseRun.raw_intake_stable_id || null,
    parent_prompt_id: parseRun.parent_prompt_id || null,
    parsed_payload_hash: parseRun.parsed_payload_hash || null,
    schema_valid: parseRun.schema_valid === true,
    schema_errors: parseRun.schema_errors || [],
    external_write_performed: false,
  };
}

function parseItemPayload(item = {}) {
  return {
    canonical_parse_item: clone(item),
    canonical_parse_item_id: item.parse_item_id,
    raw_intake_stable_id: item.raw_intake_stable_id,
    parent_prompt_id: item.parent_prompt_id,
    target_lane: item.target_lane || null,
    expected_result: item.expected_result || null,
    next_action: item.next_action || null,
    reason: item.reason || null,
    source_stable_key: item.source_stable_key || null,
    source_id: item.source_id || null,
    metadata: item.metadata || {},
    external_write_performed: false,
  };
}

function statement(name, sql, values = []) {
  return { name, sql, values };
}

function rawIntakeStatement(packet = {}, rows = {}) {
  const raw = rows.raw_intake;
  const source = sourceRecordFromPacket(packet);
  return statement('upsert_raw_intake', `
INSERT INTO bna_raw_intake (
  stable_id, source_channel, source_message_id, source_user, raw_text,
  transcript_text, media_url, intake_type, parse_status, parsed_payload,
  metadata
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb)
ON CONFLICT (stable_id) DO UPDATE SET
  source_channel = EXCLUDED.source_channel,
  source_message_id = COALESCE(EXCLUDED.source_message_id, bna_raw_intake.source_message_id),
  source_user = COALESCE(EXCLUDED.source_user, bna_raw_intake.source_user),
  raw_text = COALESCE(EXCLUDED.raw_text, bna_raw_intake.raw_text),
  transcript_text = COALESCE(EXCLUDED.transcript_text, bna_raw_intake.transcript_text),
  media_url = COALESCE(EXCLUDED.media_url, bna_raw_intake.media_url),
  intake_type = EXCLUDED.intake_type,
  parse_status = EXCLUDED.parse_status,
  parsed_payload = EXCLUDED.parsed_payload,
  metadata = COALESCE(bna_raw_intake.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW()
RETURNING *`, [
    raw.stable_id,
    normalizePostgresSourceChannel(raw.source_channel || raw.source_provider || source.source_channel || source.source_provider || 'manual'),
    raw.source_id || source.source_id || null,
    source.actor || packet.actor || 'canonical_intake_service',
    rawTextFromPacket(packet) || null,
    transcriptTextFromPacket(packet) || null,
    raw.source_link || source.source_link || null,
    packet.intake_type || packet.intakeType || 'canonical',
    raw.parse_status || 'parsed',
    jsonb(packet.parsed || {}),
    jsonb(rawIntakeMetadata(packet, rows)),
  ]);
}

function parseRunStatement(packet = {}, rows = {}) {
  const parseRun = rows.parse_run;
  const source = sourceRecordFromPacket(packet);
  const rawText = rawTextFromPacket(packet);
  return statement('upsert_intake_parse_run', `
INSERT INTO bna_intake_parse_runs (
  source_type, source_id, source_id_key, source_table, input_hash, parser_version,
  raw_input, language_json, summary, parse_json, dry_run, status, created_by,
  metadata
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb, $11, $12, $13, $14::jsonb)
ON CONFLICT (input_hash, parser_version, source_type, source_id_key) DO UPDATE SET
  source_table = COALESCE(EXCLUDED.source_table, bna_intake_parse_runs.source_table),
  language_json = EXCLUDED.language_json,
  summary = EXCLUDED.summary,
  parse_json = EXCLUDED.parse_json,
  dry_run = EXCLUDED.dry_run,
  status = CASE WHEN bna_intake_parse_runs.status = 'filed' THEN bna_intake_parse_runs.status ELSE EXCLUDED.status END,
  metadata = COALESCE(bna_intake_parse_runs.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW()
RETURNING *`, [
    parseRun.source_type || source.source_kind || source.source_provider || 'manual',
    parseRun.source_id || source.source_id || rows.raw_intake.stable_id,
    parseRun.source_id || source.source_id || rows.raw_intake.stable_id,
    source.source_table || packet.source_table || null,
    parseRun.input_hash || rows.raw_intake.fingerprint || rows.raw_intake.raw_text_hash,
    parseRun.parser_version || packet.parsed?.parser_version || 'canonical-intake-service',
    rawText || packet.parsed?.summary || 'Canonical intake packet',
    jsonb(packet.parsed?.language || {}),
    packet.parsed?.summary || parseRun.title || 'Canonical intake parse',
    jsonb(packet.parsed || {}),
    packet.dry_run === undefined ? true : Boolean(packet.dry_run),
    parseRun.status || 'parsed',
    source.actor || packet.actor || 'canonical_intake_service',
    jsonb(parseRunMetadata(packet, rows)),
  ]);
}

function canonicalParseRunStatement(rows = {}, legacyParseRunId = null) {
  const parseRun = rows.parse_run;
  return statement('upsert_canonical_parse_run', `
INSERT INTO bna_canonical_intake_parse_runs (
  parse_run_id, raw_intake_stable_id, parent_prompt_id, legacy_parse_run_id,
  parser_version, status, parse_run_json, external_write_performed
)
VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, FALSE)
ON CONFLICT (parse_run_id) DO UPDATE SET
  raw_intake_stable_id = EXCLUDED.raw_intake_stable_id,
  parent_prompt_id = EXCLUDED.parent_prompt_id,
  legacy_parse_run_id = COALESCE(EXCLUDED.legacy_parse_run_id, bna_canonical_intake_parse_runs.legacy_parse_run_id),
  parser_version = EXCLUDED.parser_version,
  status = EXCLUDED.status,
  parse_run_json = EXCLUDED.parse_run_json,
  external_write_performed = FALSE,
  updated_at = NOW()
RETURNING *`, [
    parseRun.parse_run_id,
    parseRun.raw_intake_stable_id,
    parseRun.parent_prompt_id,
    legacyParseRunId,
    parseRun.parser_version || 'canonical-intake-service',
    parseRun.status || 'parsed',
    jsonb(parseRun),
  ]);
}

function parentPromptStatement(rows = {}) {
  const parentPrompt = rows.parent_prompt;
  return statement('upsert_canonical_parent_prompt', `
INSERT INTO bna_canonical_parent_prompts (
  prompt_id, raw_intake_stable_id, parse_run_id, status, child_outcome_count,
  prompt_json, metadata, external_write_performed
)
VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, FALSE)
ON CONFLICT (prompt_id) DO UPDATE SET
  raw_intake_stable_id = EXCLUDED.raw_intake_stable_id,
  parse_run_id = EXCLUDED.parse_run_id,
  status = EXCLUDED.status,
  child_outcome_count = EXCLUDED.child_outcome_count,
  prompt_json = EXCLUDED.prompt_json,
  metadata = COALESCE(bna_canonical_parent_prompts.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  external_write_performed = FALSE,
  updated_at = NOW()
RETURNING *`, [
    parentPrompt.prompt_id,
    parentPrompt.raw_intake_stable_id,
    parentPrompt.parse_run_id,
    parentPrompt.status || 'queued',
    (parentPrompt.child_outcomes || []).length,
    jsonb(parentPrompt),
    jsonb({
      persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
      postgres_contract_version: CANONICAL_INTAKE_POSTGRES_VERSION,
      external_write_performed: false,
    }),
  ]);
}

function parseItemStatement(item = {}, legacyParseRunId) {
  return statement('upsert_intake_parse_item', `
INSERT INTO bna_intake_parse_items (
  parse_run_id, item_key, item_type, title, summary, payload, confidence,
  status, review_reason, source_excerpt, target_table
)
VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11)
ON CONFLICT (parse_run_id, item_key) DO UPDATE SET
  item_type = EXCLUDED.item_type,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  payload = EXCLUDED.payload,
  confidence = EXCLUDED.confidence,
  status = CASE WHEN bna_intake_parse_items.status = 'filed' THEN 'filed' ELSE EXCLUDED.status END,
  review_reason = EXCLUDED.review_reason,
  source_excerpt = EXCLUDED.source_excerpt,
  target_table = EXCLUDED.target_table,
  updated_at = NOW()
RETURNING *`, [
    legacyParseRunId,
    item.item_key || item.parse_item_id,
    item.item_type || 'unknown',
    item.title || item.item_type || 'Parsed intake item',
    item.expected_result || item.reason || item.source_excerpt || '',
    jsonb(parseItemPayload(item)),
    item.confidence || null,
    item.status || 'parsed',
    item.reason || null,
    item.source_excerpt || null,
    item.target_lane || null,
  ]);
}

function parsedEntityStatement(entity = {}) {
  return statement('upsert_canonical_parsed_entity', `
INSERT INTO bna_canonical_parsed_entities (
  entity_id, parse_item_id, parse_run_id, raw_intake_stable_id, parent_prompt_id,
  item_id, entity_key, entity_group, entity_type, title, status, target_lane,
  workspace_key, project_key, confidence, owner, expected_result, next_action,
  reason, idempotency_key, source_stable_key, source_id, source_excerpt, metadata,
  sort_index, external_write_performed
)
VALUES (
  $1, $2, $3, $4, $5,
  $6, $7, $8, $9, $10, $11, $12,
  $13, $14, $15, $16, $17, $18,
  $19, $20, $21, $22, $23, $24::jsonb,
  $25, FALSE
)
ON CONFLICT (entity_id) DO UPDATE SET
  parse_item_id = EXCLUDED.parse_item_id,
  parse_run_id = EXCLUDED.parse_run_id,
  raw_intake_stable_id = EXCLUDED.raw_intake_stable_id,
  parent_prompt_id = EXCLUDED.parent_prompt_id,
  item_id = EXCLUDED.item_id,
  entity_key = EXCLUDED.entity_key,
  entity_group = EXCLUDED.entity_group,
  entity_type = EXCLUDED.entity_type,
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  target_lane = EXCLUDED.target_lane,
  workspace_key = EXCLUDED.workspace_key,
  project_key = EXCLUDED.project_key,
  confidence = EXCLUDED.confidence,
  owner = EXCLUDED.owner,
  expected_result = EXCLUDED.expected_result,
  next_action = EXCLUDED.next_action,
  reason = EXCLUDED.reason,
  idempotency_key = EXCLUDED.idempotency_key,
  source_stable_key = EXCLUDED.source_stable_key,
  source_id = EXCLUDED.source_id,
  source_excerpt = EXCLUDED.source_excerpt,
  metadata = EXCLUDED.metadata,
  sort_index = EXCLUDED.sort_index,
  external_write_performed = FALSE,
  updated_at = NOW()
RETURNING *`, [
    entity.entity_id,
    entity.parse_item_id,
    entity.parse_run_id,
    entity.raw_intake_stable_id,
    entity.parent_prompt_id,
    entity.item_id || null,
    entity.entity_key || null,
    entity.entity_group || 'unknown',
    entity.entity_type || 'unknown',
    entity.title || null,
    entity.status || 'parsed',
    entity.target_lane || null,
    entity.workspace_key || null,
    entity.project_key || null,
    entity.confidence || null,
    entity.owner || null,
    entity.expected_result || null,
    entity.next_action || null,
    entity.reason || null,
    entity.idempotency_key || null,
    entity.source_stable_key || null,
    entity.source_id || null,
    entity.source_excerpt || null,
    jsonb({
      ...(entity.metadata || {}),
      persisted_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
      postgres_contract_version: CANONICAL_INTAKE_POSTGRES_VERSION,
      external_write_performed: false,
    }),
    Number(entity.sort_index || 0),
  ]);
}

function buildCanonicalIntakePostgresPlan(packet = {}, options = {}) {
  const rows = canonicalRowsFromPacket(packet, options);
  return {
    contract_version: CANONICAL_INTAKE_POSTGRES_VERSION,
    persistence_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    storage_kind: 'postgres',
    external_write_performed: false,
    applied: false,
    raw_intake_stable_id: rows.raw_intake.stable_id,
    parse_run_id: rows.parse_run.parse_run_id,
    parent_prompt_id: rows.parent_prompt.prompt_id,
    counts: {
      raw_intake: 1,
      parse_runs: 1,
      parse_items: rows.parse_items.length,
      parsed_entities: rows.parsed_entities.length,
      parent_prompts: 1,
    },
    statements: [
      rawIntakeStatement(packet, rows),
      parseRunStatement(packet, rows),
      canonicalParseRunStatement(rows, options.legacy_parse_run_id || null),
      parentPromptStatement(rows),
    ],
    parse_item_statements: rows.parse_items.map((item) => parseItemStatement(item, options.legacy_parse_run_id || '$legacy_parse_run_id')),
    parsed_entity_statements: rows.parsed_entities.map(parsedEntityStatement),
    readback_locator: {
      raw_intake_stable_id: rows.raw_intake.stable_id,
      parse_run_id: rows.parse_run.parse_run_id,
      parent_prompt_id: rows.parent_prompt.prompt_id,
    },
  };
}

function assertClient(client) {
  if (!client || typeof client.query !== 'function') {
    throw new Error('Postgres client with query(sql, values) is required');
  }
}

async function applyCanonicalIntakePacketToPostgres(packet = {}, options = {}) {
  if (options.dry_run || options.dryRun) {
    return buildCanonicalIntakePostgresPlan(packet, options);
  }
  const client = options.client || options.db;
  assertClient(client);
  const rows = canonicalRowsFromPacket(packet, options);
  const useTransaction = options.transaction !== false;
  const executed = [];
  try {
    if (useTransaction) {
      await client.query('BEGIN');
      executed.push('BEGIN');
    }
    const rawStmt = rawIntakeStatement(packet, rows);
    await client.query(rawStmt.sql, rawStmt.values);
    executed.push(rawStmt.name);

    const parseRunStmt = parseRunStatement(packet, rows);
    const parseRunResult = await client.query(parseRunStmt.sql, parseRunStmt.values);
    executed.push(parseRunStmt.name);
    const legacyParseRunId = Number(parseRunResult.rows?.[0]?.id || parseRunResult.rows?.[0]?.legacy_parse_run_id || 0);
    if (!legacyParseRunId) throw new Error('Postgres parse-run upsert did not return legacy parse run id');

    const canonicalRunStmt = canonicalParseRunStatement(rows, legacyParseRunId);
    await client.query(canonicalRunStmt.sql, canonicalRunStmt.values);
    executed.push(canonicalRunStmt.name);

    const parentStmt = parentPromptStatement(rows);
    await client.query(parentStmt.sql, parentStmt.values);
    executed.push(parentStmt.name);

    const legacyParseItemIds = [];
    for (const item of rows.parse_items) {
      const itemStmt = parseItemStatement(item, legacyParseRunId);
      const itemResult = await client.query(itemStmt.sql, itemStmt.values);
      executed.push(itemStmt.name);
      const legacyParseItemId = Number(itemResult.rows?.[0]?.id || 0);
      if (legacyParseItemId) legacyParseItemIds.push(legacyParseItemId);
    }
    for (const entity of rows.parsed_entities) {
      const entityStmt = parsedEntityStatement(entity);
      await client.query(entityStmt.sql, entityStmt.values);
      executed.push(entityStmt.name);
    }
    if (useTransaction) {
      await client.query('COMMIT');
      executed.push('COMMIT');
    }
    return {
      contract_version: CANONICAL_INTAKE_POSTGRES_VERSION,
      persistence_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
      storage_kind: 'postgres',
      external_write_performed: false,
      applied: true,
      raw_intake_stable_id: rows.raw_intake.stable_id,
      parse_run_id: rows.parse_run.parse_run_id,
      parent_prompt_id: rows.parent_prompt.prompt_id,
      legacy_parse_run_id: legacyParseRunId,
      legacy_parse_item_ids: legacyParseItemIds,
      parse_item_ids: rows.parse_items.map((item) => item.parse_item_id),
      parsed_entity_ids: rows.parsed_entities.map((item) => item.entity_id),
      statements_executed: executed,
      readback_locator: {
        raw_intake_stable_id: rows.raw_intake.stable_id,
        parse_run_id: rows.parse_run.parse_run_id,
        parent_prompt_id: rows.parent_prompt.prompt_id,
      },
    };
  } catch (error) {
    if (useTransaction) await client.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function readCanonicalIntakePersistenceFromPostgres(client, locator = {}) {
  assertClient(client);
  const rawId = locator.raw_intake_stable_id || locator.rawIntakeStableId || locator.stable_id || null;
  const parseRunId = locator.parse_run_id || locator.parseRunId || null;
  const parentPromptId = locator.parent_prompt_id || locator.parentPromptId || locator.prompt_id || null;
  const values = [rawId, parseRunId, parentPromptId];
  const rawResult = await client.query(`
SELECT raw.*
FROM bna_raw_intake raw
WHERE raw.stable_id = COALESCE(
  $1,
  (SELECT c.raw_intake_stable_id FROM bna_canonical_intake_parse_runs c WHERE c.parse_run_id = $2),
  (SELECT p.raw_intake_stable_id FROM bna_canonical_parent_prompts p WHERE p.prompt_id = $3)
)
LIMIT 1`, values);
  const parseRunResult = await client.query(`
SELECT canonical.*, legacy.id AS legacy_parse_run_id, legacy.metadata AS legacy_metadata
FROM bna_canonical_intake_parse_runs canonical
LEFT JOIN bna_intake_parse_runs legacy ON legacy.id = canonical.legacy_parse_run_id
WHERE canonical.parse_run_id = COALESCE(
  $2,
  (SELECT c.parse_run_id FROM bna_canonical_intake_parse_runs c WHERE c.raw_intake_stable_id = $1 ORDER BY c.updated_at DESC LIMIT 1),
  (SELECT p.parse_run_id FROM bna_canonical_parent_prompts p WHERE p.prompt_id = $3)
)
LIMIT 1`, values);
  const parentPromptResult = await client.query(`
SELECT prompt.*
FROM bna_canonical_parent_prompts prompt
WHERE prompt.prompt_id = COALESCE(
  $3,
  (SELECT c.parent_prompt_id FROM bna_canonical_intake_parse_runs c WHERE c.parse_run_id = $2),
  (SELECT p.prompt_id FROM bna_canonical_parent_prompts p WHERE p.raw_intake_stable_id = $1 ORDER BY p.updated_at DESC LIMIT 1)
)
LIMIT 1`, values);
  const parseItemsResult = await client.query(`
SELECT item.*
FROM bna_intake_parse_items item
JOIN bna_intake_parse_runs legacy ON legacy.id = item.parse_run_id
LEFT JOIN bna_canonical_intake_parse_runs canonical ON canonical.legacy_parse_run_id = legacy.id
WHERE canonical.parse_run_id = $2
   OR canonical.raw_intake_stable_id = $1
   OR canonical.parent_prompt_id = $3
   OR item.payload->>'parent_prompt_id' = $3
ORDER BY item.id ASC`, values);
  const entitiesResult = await client.query(`
SELECT entity.*
FROM bna_canonical_parsed_entities entity
WHERE entity.parse_run_id = $2
   OR entity.raw_intake_stable_id = $1
   OR entity.parent_prompt_id = $3
ORDER BY entity.sort_index ASC, entity.entity_id ASC`, values);

  const rawIntake = rawResult.rows?.[0] || null;
  const parseRunRow = parseRunResult.rows?.[0] || null;
  const parentPromptRow = parentPromptResult.rows?.[0] || null;
  const parseRun = parseRunRow ? asJson(parseRunRow.parse_run_json, parseRunRow) : null;
  const parentPrompt = parentPromptRow ? asJson(parentPromptRow.prompt_json, parentPromptRow) : null;
  const parseItems = (parseItemsResult.rows || []).map((row) => {
    const payload = asJson(row.payload, {});
    return payload.canonical_parse_item || { ...row, payload };
  });
  const parsedEntities = (entitiesResult.rows || []).map((row) => ({
    ...row,
    metadata: asJson(row.metadata, {}),
  }));
  const entityCountsByGroup = parsedEntities.reduce((acc, row) => {
    const group = row.entity_group || row.entity_type || 'unknown';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  return {
    contract_version: CANONICAL_INTAKE_POSTGRES_VERSION,
    persistence_contract_version: CANONICAL_INTAKE_PERSISTENCE_VERSION,
    storage_kind: 'postgres',
    external_write_performed: false,
    found: Boolean(rawIntake || parseRun || parentPrompt || parseItems.length || parsedEntities.length),
    raw_intake: rawIntake,
    parse_run: parseRun,
    parse_items: parseItems,
    parsed_entities: parsedEntities,
    parent_prompt: parentPrompt,
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

module.exports = {
  CANONICAL_INTAKE_POSTGRES_VERSION,
  POSTGRES_RAW_CHANNELS,
  normalizePostgresSourceChannel,
  buildCanonicalIntakePostgresPlan,
  applyCanonicalIntakePacketToPostgres,
  readCanonicalIntakePersistenceFromPostgres,
};
