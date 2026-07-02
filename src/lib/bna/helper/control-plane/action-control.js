'use strict';

const crypto = require('crypto');

const { buildToolRegistry } = require('../tool-registry');
const { helperPermissionForTool } = require('../permissions');
const { redactValue } = require('../redaction');
const { addActionAudit, addActionResult, addDenial, makeId, sha256 } = require('./evidence');
const { recordActionAudit, recordActionResult, recordDenial } = require('./audit-ledger');

function defaultIdempotencyKey(context = {}, toolName = '', args = {}) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({
      request_id: context.requestId,
      actor_id: context.actor?.id || null,
      tool_name: toolName,
      args_hash: sha256(args),
    }))
    .digest('hex');
}

function actionStatusForTool(tool = {}, result = {}) {
  if (!result || result.ok === false) return result?.status === 'blocked' ? 'denied' : 'failed';
  const category = String(tool.category || '').toLowerCase();
  const sideEffect = String(tool.sideEffectLevel || '').toLowerCase();
  if (category === 'navigation' || sideEffect === 'read' || sideEffect === 'none') return 'preview_prepared';
  if (String(result.status || '').includes('prepared')) return 'preview_prepared';
  if (String(result.status || '').includes('fallback')) return 'unsupported';
  return 'committed';
}

function createdEntityRefsFromResult(result = {}) {
  if (!result.record_type || result.record_id === undefined || result.record_id === null) return [];
  return [{
    entity_type: result.record_type,
    entity_id: String(result.record_id),
    route: result.url || null,
  }];
}

function publicDenial(kind, reasonCode, message, extra = {}) {
  return {
    denial_id: makeId('helper_denial'),
    kind,
    reason_code: reasonCode,
    user_safe_reason: message,
    repair: extra.repair || { status: 'not_allowed', reason: reasonCode },
  };
}

async function executeControlledAction(input = {}, context = {}, options = {}) {
  const db = options.db || null;
  const deps = options.deps || {};
  const evidence = options.evidence || null;
  const registry = input.registry || buildToolRegistry({ ...deps, db });
  const toolName = String(input.toolName || input.tool || input.name || '').trim();
  const args = input.args && typeof input.args === 'object' && !Array.isArray(input.args) ? input.args : {};
  const confirmationText = input.confirmationText || input.confirmation_text || '';
  const idempotencyKey = input.idempotencyKey || input.idempotency_key || defaultIdempotencyKey(context, toolName, args);

  const tool = registry.get(toolName);
  if (!tool) {
    const denial = publicDenial(
      'unsupported_action',
      'tool_not_found',
      `The helper cannot run "${toolName || 'that action'}" because it is not registered as a helper tool.`,
      { repair: { status: context.capabilities?.includes('helper.repair.create') ? 'available' : 'not_allowed', action_id: 'create_support_ticket' } }
    );
    if (evidence) addDenial(evidence, denial);
    await recordDenial(db, context, denial);
    const result = await recordActionResult(db, context, {
      tool_name: toolName || 'unknown',
      status: 'unsupported',
      result_summary: denial.user_safe_reason,
      error_code: 'tool_not_found',
    });
    if (evidence) addActionResult(evidence, result);
    return { ok: false, denial, result };
  }

  const validation = registry.validate(toolName, args);
  if (!validation.ok) {
    const denial = publicDenial(
      'unsupported_action',
      'schema_validation_failed',
      `The helper cannot run ${toolName} because required typed inputs are missing or invalid: ${validation.errors.join('; ')}.`,
      { repair: { status: 'not_allowed', reason: 'schema_validation_failed' } }
    );
    if (evidence) addDenial(evidence, denial);
    await recordDenial(db, context, denial);
    const result = await recordActionResult(db, context, {
      tool_name: toolName,
      status: 'failed',
      result_summary: denial.user_safe_reason,
      result_payload: { validation_errors: validation.errors },
      error_code: 'schema_validation_failed',
    });
    if (evidence) addActionResult(evidence, result);
    return { ok: false, denial, result };
  }

  const permission = helperPermissionForTool(tool, context.registryContext || context, validation.args);
  if (!permission.allowed) {
    const denial = publicDenial(
      'missing_capability',
      'permission_denied',
      permission.reason || `This role is not allowed to run ${toolName}.`,
      { repair: { status: 'not_allowed', reason: 'permission_denied' } }
    );
    if (evidence) addDenial(evidence, denial);
    await recordDenial(db, context, denial);
    const result = await recordActionResult(db, context, {
      tool_name: toolName,
      status: 'denied',
      result_summary: denial.user_safe_reason,
      error_code: 'permission_denied',
    });
    if (evidence) addActionResult(evidence, result);
    return { ok: false, denial, result };
  }

  const audit = await recordActionAudit(db, context, {
    audit_id: input.auditId || input.audit_id || makeId('helper_action_audit'),
    tool_name: toolName,
    action_id: input.actionId || input.action_id || null,
    input: validation.args,
    input_hash: sha256(validation.args),
    idempotency_key: idempotencyKey,
    status: tool.requiresConfirmation && confirmationText !== 'CONFIRM' ? 'previewed' : 'executing',
  });
  if (evidence) addActionAudit(evidence, audit);

  if (tool.requiresConfirmation && confirmationText !== 'CONFIRM') {
    const result = await recordActionResult(db, context, {
      audit_id: audit.audit_id,
      tool_name: toolName,
      action_id: input.actionId || input.action_id || null,
      status: 'preview_prepared',
      result_summary: `Prepared a preview for ${toolName}. It has not been saved or executed.`,
      result_payload: {
        tool: toolName,
        args_preview: redactValue(validation.args),
        confirmation_required: true,
        confirmation_text_required: 'CONFIRM',
      },
    });
    if (evidence) addActionResult(evidence, result);
    return { ok: true, audit, result, preview_only: true };
  }

  try {
    const resultPayload = await registry.execute(
      toolName,
      validation.args,
      {
        ...(context.registryContext || context),
        requestId: context.requestId,
        idempotencyKey,
        helper_control_plane: true,
      },
      db
    );

    const status = actionStatusForTool(tool, resultPayload);
    const result = await recordActionResult(db, context, {
      audit_id: audit.audit_id,
      tool_name: toolName,
      action_id: input.actionId || input.action_id || null,
      status,
      result_summary: resultPayload.summary || `${toolName} completed with status ${status}.`,
      result_payload: resultPayload,
      created_entity_refs: createdEntityRefsFromResult(resultPayload),
    });
    if (evidence) addActionResult(evidence, result);
    return {
      ok: resultPayload.ok !== false,
      audit,
      result,
      raw_result: resultPayload,
    };
  } catch (error) {
    const status = error.code === 'permission_denied' ? 'denied' : 'failed';
    const result = await recordActionResult(db, context, {
      audit_id: audit.audit_id,
      tool_name: toolName,
      action_id: input.actionId || input.action_id || null,
      status,
      result_summary: `The helper could not run ${toolName}: ${error.message}`,
      error_code: error.code || 'execution_failed',
      error_message: error.message,
      result_payload: { validation_args: validation.args },
    });
    if (evidence) addActionResult(evidence, result);

    const denial = publicDenial(
      status === 'denied' ? 'missing_capability' : 'unsupported_action',
      error.code || 'execution_failed',
      `The helper could not run ${toolName}: ${error.message}`,
      { repair: { status: context.capabilities?.includes('helper.repair.create') ? 'available' : 'not_allowed', action_id: 'create_support_ticket' } }
    );
    if (evidence) addDenial(evidence, denial);
    await recordDenial(db, context, denial);
    return { ok: false, audit, result, denial, error };
  }
}

module.exports = {
  actionStatusForTool,
  createdEntityRefsFromResult,
  defaultIdempotencyKey,
  executeControlledAction,
};
