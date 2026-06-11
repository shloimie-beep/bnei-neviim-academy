const crypto = require('crypto');

const inMemoryActionRuns = [];

function actionRunId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `action_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function summarizeInputs(inputs = {}) {
  const summary = {};
  for (const [key, value] of Object.entries(inputs || {})) {
    if (value === undefined) continue;
    if (/body|notes|message|text|description|draft/i.test(key)) {
      summary[key] = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 500);
    } else {
      summary[key] = value;
    }
  }
  return summary;
}

function normalizeDbStatus(status) {
  if (status === 'executed') return 'executed';
  if (status === 'failed') return 'failed';
  if (status === 'rejected') return 'rejected';
  if (status === 'approved') return 'approved';
  return 'previewed';
}

async function writeActionAuditLog(entry = {}, context = {}) {
  const actionRun = {
    action_run_id: entry.action_run_id || actionRunId(),
    action_id: entry.action_id,
    user_id: entry.user_id || context.actor?.user_id || 'system',
    role: entry.role || context.actor?.role || 'system',
    workspace_id: entry.workspace_id || context.actor?.workspace_id || 'bna',
    source: entry.source || context.source || 'system',
    input_summary: entry.input_summary || summarizeInputs(entry.inputs || {}),
    dry_run_result: entry.dry_run_result || null,
    approval_status: entry.approval_status || 'not_required',
    approved_by: entry.approved_by || null,
    result_status: entry.result_status || 'previewed',
    result_summary: entry.result_summary || null,
    related_object_type: entry.related_object_type || null,
    related_object_id: entry.related_object_id || null,
    created_at: entry.created_at || new Date().toISOString(),
    error: entry.error || null,
  };

  inMemoryActionRuns.push(actionRun);
  if (inMemoryActionRuns.length > 500) inMemoryActionRuns.shift();

  if (context.db) {
    try {
      const result = await context.db.query(
        `INSERT INTO bna_bot_action_logs (
           workspace_key, actor_role, action_key, target_type, target_id, status, preview_json, result_json, created_by
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)
         RETURNING *`,
        [
          actionRun.workspace_id,
          actionRun.role,
          actionRun.action_id,
          actionRun.related_object_type,
          actionRun.related_object_id === undefined || actionRun.related_object_id === null || actionRun.related_object_id === ''
            ? null
            : Number(actionRun.related_object_id),
          normalizeDbStatus(actionRun.result_status),
          JSON.stringify({
            action_run_id: actionRun.action_run_id,
            input_summary: actionRun.input_summary,
            dry_run_result: actionRun.dry_run_result,
            approval_status: actionRun.approval_status,
          }),
          JSON.stringify({
            result_status: actionRun.result_status,
            result_summary: actionRun.result_summary,
            error: actionRun.error,
          }),
          actionRun.user_id,
        ]
      );
      actionRun.persisted_log = result.rows[0] || null;
    } catch (error) {
      actionRun.persist_error = error instanceof Error ? error.message : String(error);
    }
  }

  return actionRun;
}

function listInMemoryActionRuns() {
  return [...inMemoryActionRuns];
}

module.exports = {
  actionRunId,
  listInMemoryActionRuns,
  summarizeInputs,
  writeActionAuditLog,
};
