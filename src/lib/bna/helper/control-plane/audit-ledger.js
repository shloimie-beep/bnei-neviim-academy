'use strict';

const { redactValue } = require('../redaction');
const { makeId, sha256 } = require('./evidence');

const CREATE_HELPER_CONTROL_PLANE_SQL = `
CREATE TABLE IF NOT EXISTS bna_helper_control_turns (
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  conversation_id TEXT,
  session_id TEXT,
  actor_id TEXT,
  helper_role TEXT,
  auth_status TEXT,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_context_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_message_redacted TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bna_helper_route_resolution_log (
  id BIGSERIAL PRIMARY KEY,
  route_resolution_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL,
  status TEXT NOT NULL,
  route_key TEXT,
  route TEXT,
  url TEXT,
  attempted_path TEXT,
  canonical_path TEXT,
  reason_code TEXT,
  authorization_result TEXT,
  actor_role TEXT,
  workspace_key TEXT,
  project_key TEXT,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bna_helper_control_action_audits (
  id BIGSERIAL PRIMARY KEY,
  audit_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  action_id TEXT,
  actor_id TEXT,
  helper_role TEXT,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  input_hash TEXT NOT NULL,
  input_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bna_helper_control_action_results (
  id BIGSERIAL PRIMARY KEY,
  result_id TEXT UNIQUE NOT NULL,
  audit_id TEXT,
  request_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  action_id TEXT,
  status TEXT NOT NULL,
  result_summary TEXT,
  result_payload_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_entity_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bna_helper_control_denials (
  id BIGSERIAL PRIMARY KEY,
  denial_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  reason_code TEXT,
  user_safe_reason TEXT NOT NULL,
  repair JSONB NOT NULL DEFAULT '{}'::jsonb,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bna_helper_control_data_access_log (
  id BIGSERIAL PRIMARY KEY,
  data_ref_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL,
  query_kind TEXT NOT NULL,
  actor_role TEXT,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  row_count INTEGER NOT NULL DEFAULT 0,
  redaction_applied BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bna_helper_control_api_usage (
  id BIGSERIAL PRIMARY KEY,
  usage_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL,
  conversation_id TEXT,
  session_id TEXT,
  actor_id TEXT,
  helper_role TEXT,
  portal TEXT,
  scope_kind TEXT,
  model_provider TEXT,
  model_name TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cached_input_tokens INTEGER,
  reasoning_tokens INTEGER,
  tool_calls JSONB NOT NULL DEFAULT '[]'::jsonb,
  route_resolution_count INTEGER NOT NULL DEFAULT 0,
  action_preview_count INTEGER NOT NULL DEFAULT 0,
  action_commit_count INTEGER NOT NULL DEFAULT 0,
  denial_count INTEGER NOT NULL DEFAULT 0,
  repair_item_count INTEGER NOT NULL DEFAULT 0,
  estimated_cost_cents NUMERIC,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bna_helper_control_agent_review_items (
  id BIGSERIAL PRIMARY KEY,
  review_item_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL,
  conversation_id TEXT,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  actor_role TEXT,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_message_redacted TEXT,
  assistant_response_redacted TEXT,
  route_resolution_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_audit_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_result_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  denial_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposed_repair JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function ensureHelperControlPlaneTables(db) {
  if (!db || typeof db.query !== 'function') return { ok: false, reason: 'db_not_available' };
  await db.query(CREATE_HELPER_CONTROL_PLANE_SQL);
  return { ok: true };
}

async function safeQuery(db, sql, params, fallback) {
  if (!db || typeof db.query !== 'function') return { persisted: false, ...(fallback || {}) };
  try {
    const result = await db.query(sql, params);
    return { persisted: true, row: result.rows?.[0] || null };
  } catch (error) {
    return {
      persisted: false,
      error_code: error.code || 'db_error',
      error_message: error.message,
      ...(fallback || {}),
    };
  }
}

async function recordTurn(db, context = {}, message = '') {
  const record = {
    request_id: context.requestId,
    conversation_id: context.conversationId || null,
    session_id: context.sessionId || null,
    actor_id: context.actor?.id || null,
    helper_role: context.helperRole || null,
    auth_status: context.authStatus || null,
    scope: redactValue(context.effectiveScope || {}),
    page_context_redacted: redactValue(context.pageContext || {}),
    user_message_redacted: String(message || '').slice(0, 12000),
  };
  const result = await safeQuery(db, `
    INSERT INTO bna_helper_control_turns
      (request_id, conversation_id, session_id, actor_id, helper_role, auth_status, scope, page_context_redacted, user_message_redacted)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)
    ON CONFLICT (request_id) DO NOTHING
    RETURNING *
  `, [
    record.request_id,
    record.conversation_id,
    record.session_id,
    record.actor_id,
    record.helper_role,
    record.auth_status,
    JSON.stringify(record.scope),
    JSON.stringify(record.page_context_redacted),
    record.user_message_redacted,
  ], { row: record });
  return { ...record, persisted: result.persisted, db_error: result.error_message || null };
}

async function recordRouteResolution(db, context = {}, resolution = {}) {
  const record = {
    route_resolution_id: resolution.route_resolution_id || makeId('route_res'),
    request_id: context.requestId || resolution.request_id,
    status: resolution.status || 'denied',
    route_key: resolution.route_key || resolution.route_id || null,
    route: resolution.route || null,
    url: resolution.url || null,
    attempted_path: resolution.attempted_path || null,
    canonical_path: resolution.canonical_path || null,
    reason_code: resolution.reason_code || resolution.reason || null,
    authorization_result: resolution.authorization_result || null,
    actor_role: context.helperRole || resolution.role || null,
    workspace_key: resolution.workspace_key || context.effectiveScope?.workspaceKey || context.effectiveScope?.workspace_key || null,
    project_key: resolution.project_key || context.effectiveScope?.projectKey || context.effectiveScope?.project_key || null,
    scope: redactValue(resolution.scope || context.effectiveScope || {}),
    checks: redactValue(resolution.checks || {}),
  };
  const result = await safeQuery(db, `
    INSERT INTO bna_helper_route_resolution_log
      (route_resolution_id, request_id, status, route_key, route, url, attempted_path, canonical_path, reason_code, authorization_result, actor_role, workspace_key, project_key, scope, checks)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb)
    ON CONFLICT (route_resolution_id) DO NOTHING
    RETURNING *
  `, [
    record.route_resolution_id,
    record.request_id,
    record.status,
    record.route_key,
    record.route,
    record.url,
    record.attempted_path,
    record.canonical_path,
    record.reason_code,
    record.authorization_result,
    record.actor_role,
    record.workspace_key,
    record.project_key,
    JSON.stringify(record.scope),
    JSON.stringify(record.checks),
  ], { row: record });
  return { ...record, persisted: result.persisted, db_error: result.error_message || null };
}

async function recordActionAudit(db, context = {}, payload = {}) {
  const inputRedacted = redactValue(payload.input || payload.args || {});
  const record = {
    audit_id: payload.audit_id || makeId('helper_action_audit'),
    request_id: context.requestId || payload.request_id,
    tool_name: payload.tool_name || payload.tool || '',
    action_id: payload.action_id || null,
    actor_id: context.actor?.id || null,
    helper_role: context.helperRole || null,
    scope: redactValue(context.effectiveScope || {}),
    input_hash: payload.input_hash || sha256(inputRedacted),
    input_redacted: inputRedacted,
    idempotency_key: payload.idempotency_key || null,
    status: payload.status || 'intent_recorded',
  };
  const result = await safeQuery(db, `
    INSERT INTO bna_helper_control_action_audits
      (audit_id, request_id, tool_name, action_id, actor_id, helper_role, scope, input_hash, input_redacted, idempotency_key, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::jsonb,$10,$11)
    ON CONFLICT (audit_id) DO NOTHING
    RETURNING *
  `, [
    record.audit_id,
    record.request_id,
    record.tool_name,
    record.action_id,
    record.actor_id,
    record.helper_role,
    JSON.stringify(record.scope),
    record.input_hash,
    JSON.stringify(record.input_redacted),
    record.idempotency_key,
    record.status,
  ], { row: record });
  return { ...record, persisted: result.persisted, db_error: result.error_message || null };
}

async function recordActionResult(db, context = {}, resultPayload = {}) {
  const record = {
    result_id: resultPayload.result_id || makeId('helper_action_result'),
    audit_id: resultPayload.audit_id || null,
    request_id: context.requestId || resultPayload.request_id,
    tool_name: resultPayload.tool_name || resultPayload.tool || '',
    action_id: resultPayload.action_id || null,
    status: resultPayload.status || 'failed',
    result_summary: String(resultPayload.result_summary || resultPayload.summary || '').slice(0, 4000),
    result_payload_redacted: redactValue(resultPayload.result_payload || resultPayload.result || {}),
    created_entity_refs: redactValue(resultPayload.created_entity_refs || []),
    error_code: resultPayload.error_code || null,
    error_message: resultPayload.error_message || null,
  };
  const persisted = await safeQuery(db, `
    INSERT INTO bna_helper_control_action_results
      (result_id, audit_id, request_id, tool_name, action_id, status, result_summary, result_payload_redacted, created_entity_refs, error_code, error_message)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11)
    ON CONFLICT (result_id) DO NOTHING
    RETURNING *
  `, [
    record.result_id,
    record.audit_id,
    record.request_id,
    record.tool_name,
    record.action_id,
    record.status,
    record.result_summary,
    JSON.stringify(record.result_payload_redacted),
    JSON.stringify(record.created_entity_refs),
    record.error_code,
    record.error_message,
  ], { row: record });
  return { ...record, persisted: persisted.persisted, db_error: persisted.error_message || null };
}

async function recordDenial(db, context = {}, denial = {}) {
  const record = {
    denial_id: denial.denial_id || makeId('helper_denial'),
    request_id: context.requestId || denial.request_id,
    kind: denial.kind || 'blocked',
    reason_code: denial.reason_code || null,
    user_safe_reason: String(denial.user_safe_reason || denial.message || 'The helper could not do that from this role or scope.').slice(0, 4000),
    repair: redactValue(denial.repair || {}),
    scope: redactValue(context.effectiveScope || denial.scope || {}),
  };
  const result = await safeQuery(db, `
    INSERT INTO bna_helper_control_denials
      (denial_id, request_id, kind, reason_code, user_safe_reason, repair, scope)
    VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)
    ON CONFLICT (denial_id) DO NOTHING
    RETURNING *
  `, [
    record.denial_id,
    record.request_id,
    record.kind,
    record.reason_code,
    record.user_safe_reason,
    JSON.stringify(record.repair),
    JSON.stringify(record.scope),
  ], { row: record });
  return { ...record, persisted: result.persisted, db_error: result.error_message || null };
}

async function recordDataAccess(db, context = {}, payload = {}) {
  const record = {
    data_ref_id: payload.data_ref_id || makeId('helper_data_ref'),
    request_id: context.requestId || payload.request_id,
    query_kind: payload.query_kind || payload.kind || 'unknown',
    actor_role: context.helperRole || null,
    scope: redactValue(context.effectiveScope || {}),
    row_count: Number(payload.row_count || 0),
    redaction_applied: payload.redaction_applied !== false,
  };
  const result = await safeQuery(db, `
    INSERT INTO bna_helper_control_data_access_log
      (data_ref_id, request_id, query_kind, actor_role, scope, row_count, redaction_applied)
    VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)
    ON CONFLICT (data_ref_id) DO NOTHING
    RETURNING *
  `, [
    record.data_ref_id,
    record.request_id,
    record.query_kind,
    record.actor_role,
    JSON.stringify(record.scope),
    record.row_count,
    record.redaction_applied,
  ], { row: record });
  return { ...record, persisted: result.persisted, db_error: result.error_message || null };
}

module.exports = {
  CREATE_HELPER_CONTROL_PLANE_SQL,
  ensureHelperControlPlaneTables,
  recordActionAudit,
  recordActionResult,
  recordDataAccess,
  recordDenial,
  recordRouteResolution,
  recordTurn,
};
