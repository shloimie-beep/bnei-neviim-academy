const { previewMessage, redactValue, stableHash } = require('./redaction');

function safeJson(value, fallback = {}) {
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

async function insertHelperAudit(db, entry = {}) {
  const result = await db.query(
    `INSERT INTO bna_helper_tool_audit_log (
       request_id, client_request_id, plan_id, tool_call_id, conversation_id, message_hash,
       tool_name, action_label, risk_level, status, requires_confirmation,
       confirmed, confirmed_by, confirmed_at, confirmation_token_hash, idempotency_key,
       user_name, user_role,
       workspace_key, project_key, record_type, record_id,
       page_context_redacted, args_redacted, result_redacted, error_message
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11,
       $12, $13, $14, $15, $16,
       $17, $18,
       $19, $20, $21, $22,
       $23::jsonb, $24::jsonb, $25::jsonb, $26
     )
     RETURNING *`,
    [
      entry.request_id || null,
      entry.client_request_id || null,
      entry.plan_id || null,
      entry.tool_call_id || null,
      entry.conversation_id || null,
      entry.message_hash || null,
      entry.tool_name || 'unknown',
      entry.action_label || null,
      entry.risk_level || 'low',
      entry.status || 'planned',
      Boolean(entry.requires_confirmation),
      Boolean(entry.confirmed),
      entry.confirmed_by || null,
      entry.confirmed_at || null,
      entry.confirmation_token_hash || null,
      entry.idempotency_key || null,
      entry.user_name || null,
      entry.user_role || null,
      entry.workspace_key || null,
      entry.project_key || null,
      entry.record_type || null,
      entry.record_id === undefined || entry.record_id === null ? null : String(entry.record_id),
      JSON.stringify(redactValue(entry.page_context || entry.page_context_redacted || {})),
      JSON.stringify(redactValue(entry.args || entry.args_redacted || {})),
      JSON.stringify(redactValue(entry.result || entry.result_redacted || {})),
      entry.error_message || null,
    ]
  );
  return result.rows[0];
}

async function saveHelperPlan(db, {
  id,
  requestId,
  conversationId,
  userName,
  userRole,
  workspaceKey,
  projectKey,
  message,
  plan,
  status = 'planned',
  expiresAt = null,
} = {}) {
  const messagePreview = previewMessage(message || '');
  const messageHash = stableHash(message || '');
  const result = await db.query(
    `INSERT INTO bna_helper_plans (
       id, request_id, conversation_id, user_name, user_role, workspace_key,
       project_key, message_hash, message_preview, plan, status, expires_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
     ON CONFLICT (id) DO UPDATE SET
       plan = EXCLUDED.plan,
       status = EXCLUDED.status,
       updated_at = NOW()
     RETURNING *`,
    [
      id,
      requestId || null,
      conversationId || null,
      userName || null,
      userRole || null,
      workspaceKey || null,
      projectKey || null,
      messageHash,
      messagePreview,
      JSON.stringify(redactValue(plan || {})),
      status,
      expiresAt || null,
    ]
  );
  return result.rows[0];
}

async function loadHelperPlan(db, planId) {
  const result = await db.query(
    `SELECT *
     FROM bna_helper_plans
     WHERE id = $1
       AND (expires_at IS NULL OR expires_at > NOW())
     LIMIT 1`,
    [planId]
  );
  const row = result.rows[0] || null;
  if (!row) return null;
  return {
    ...row,
    plan: safeJson(row.plan, {}),
  };
}

async function updateHelperPlan(db, planId, plan, status = 'planned') {
  const result = await db.query(
    `UPDATE bna_helper_plans
     SET plan = $2::jsonb,
         status = $3,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [planId, JSON.stringify(redactValue(plan || {})), status]
  );
  return result.rows[0] || null;
}

async function listHelperAudit(db, { limit = 100 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 250));
  const result = await db.query(
    `SELECT id, request_id, plan_id, tool_call_id, conversation_id,
            client_request_id, tool_name, action_label, risk_level, status,
            requires_confirmation, confirmed, confirmed_by, confirmed_at,
            confirmation_token_hash, idempotency_key,
            user_name, user_role, workspace_key, project_key,
            record_type, record_id, page_context_redacted, args_redacted, result_redacted,
            error_message, created_at
     FROM bna_helper_tool_audit_log
     ORDER BY created_at DESC, id DESC
     LIMIT $1`,
    [safeLimit]
  );
  return result.rows.map((row) => ({
    ...row,
    page_context_redacted: safeJson(row.page_context_redacted, {}),
    args_redacted: safeJson(row.args_redacted, {}),
    result_redacted: safeJson(row.result_redacted, {}),
  }));
}

module.exports = {
  insertHelperAudit,
  listHelperAudit,
  loadHelperPlan,
  saveHelperPlan,
  updateHelperPlan,
};
