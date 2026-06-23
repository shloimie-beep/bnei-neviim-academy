const { getAction } = require('./registry');
const { writeActionAuditLog, summarizeInputs } = require('./audit-log');
const { actorFrom, checkActionPermission } = require('./permissions');
const { runOperationsHandler } = require('./actions/operations');

function actionInputValue(inputs, field) {
  if (Object.prototype.hasOwnProperty.call(inputs, field)) return inputs[field];
  const camel = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  return inputs[camel];
}

function missingRequiredInputs(action, inputs = {}) {
  return (action.required_inputs || []).filter((field) => {
    const value = actionInputValue(inputs, field);
    return value === undefined || value === null || String(value).trim() === '';
  });
}

function summarizeResult(result = {}) {
  const summary = {};
  for (const [key, value] of Object.entries(result || {})) {
    if (value === undefined) continue;
    if (/body|draft|description|note|message/i.test(key)) {
      summary[key] = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 700);
    } else if (Array.isArray(value)) {
      summary[key] = value.slice(0, 8);
    } else if (value && typeof value === 'object') {
      summary[key] = {
        id: value.id || value.action_run_id || undefined,
        title: value.title || value.subject || undefined,
        status: value.status || undefined,
      };
    } else {
      summary[key] = value;
    }
  }
  return summary;
}

function relatedObjectFromResult(action, result = {}, inputs = {}) {
  if (result.task?.id) return { type: 'task', id: result.task.id };
  if (result.event?.id) return { type: 'calendar_event', id: result.event.id };
  if (result.output?.id) return { type: 'content_output', id: result.output.id };
  if (result.revision_output_id) return { type: 'content_output', id: result.revision_output_id };
  if (inputs.task_id) return { type: 'task', id: inputs.task_id };
  if (inputs.event_id) return { type: 'calendar_event', id: inputs.event_id };
  if (inputs.output_id) return { type: 'content_output', id: inputs.output_id };
  return { type: action.category || 'action', id: null };
}

async function runAction(request = {}, context = {}) {
  const actionId = String(request.action_id || request.actionId || request.action || '').trim();
  const action = getAction(actionId);
  const actor = actorFrom({
    ...(context.actor || {}),
    ...(request.actor || {}),
    role: request.role || request.actor_role || request.actor?.role || context.actor?.role,
    workspace_id: request.workspace_id || request.workspace || request.actor?.workspace_id || context.actor?.workspace_id,
    user_id: request.user_id || request.actor?.user_id || context.actor?.user_id,
  });
  const source = request.source || context.source || 'system';
  const inputs = request.inputs || request.payload || {};
  const approved = Boolean(request.approved || request.confirm === 'APPROVE_TYPED_ACTION');
  const dryRunRequested = Boolean(request.dry_run || request.dryRun);
  const actionContext = {
    ...context,
    actor,
    source,
    approved,
    dryRun: false,
  };

  if (!action) {
    const audit_log = await writeActionAuditLog({
      action_id: actionId || 'unknown',
      user_id: actor.user_id,
      role: actor.role,
      workspace_id: actor.workspace_id,
      source,
      inputs,
      approval_status: 'not_required',
      result_status: 'failed',
      error: 'Unknown action_id',
    }, actionContext);
    return { success: false, error: 'Unknown action_id', audit_log };
  }

  const permission = checkActionPermission(action, actor);
  if (!permission.allowed) {
    const audit_log = await writeActionAuditLog({
      action_id: action.action_id,
      user_id: actor.user_id,
      role: actor.role,
      workspace_id: actor.workspace_id,
      source,
      inputs,
      approval_status: 'not_required',
      result_status: 'rejected',
      error: permission.reason,
    }, actionContext);
    return { success: false, action, permission, error: permission.reason, audit_log };
  }

  const missing = missingRequiredInputs(action, inputs);
  if (missing.length) {
    const audit_log = await writeActionAuditLog({
      action_id: action.action_id,
      user_id: actor.user_id,
      role: actor.role,
      workspace_id: actor.workspace_id,
      source,
      inputs,
      approval_status: action.approval_required ? 'required' : 'not_required',
      result_status: 'failed',
      error: `Missing required input(s): ${missing.join(', ')}`,
    }, actionContext);
    return {
      success: false,
      action,
      permission,
      missing_inputs: missing,
      error: `Missing required input(s): ${missing.join(', ')}`,
      audit_log,
    };
  }

  const approvalRequired = Boolean(action.approval_required && !approved);
  const dryRun = dryRunRequested || approvalRequired;
  let preview = null;
  try {
    preview = await runOperationsHandler(action.execution_handler, inputs, {
      ...actionContext,
      dryRun: true,
    });
  } catch (error) {
    preview = {
      preview_error: error instanceof Error ? error.message : String(error),
      input_summary: summarizeInputs(inputs),
    };
  }

  if (dryRun) {
    const approvalStatus = action.approval_required
      ? (approved ? 'approved' : 'required')
      : 'not_required';
    const audit_log = await writeActionAuditLog({
      action_id: action.action_id,
      user_id: actor.user_id,
      role: actor.role,
      workspace_id: actor.workspace_id,
      source,
      inputs,
      dry_run_result: preview,
      approval_status: approvalStatus,
      approved_by: approved ? actor.user_id : null,
      result_status: 'previewed',
      result_summary: summarizeResult(preview),
      related_object_type: action.category,
    }, actionContext);
    return {
      success: true,
      action,
      actor,
      dry_run: true,
      approval_required: approvalRequired,
      approved,
      preview,
      executed: false,
      audit_log,
      message: approvalRequired ? 'Approval required before this action executes.' : action.success_message,
    };
  }

  try {
    const result = await runOperationsHandler(action.execution_handler, inputs, {
      ...actionContext,
      dryRun: false,
    });
    const related = relatedObjectFromResult(action, result, inputs);
    const audit_log = await writeActionAuditLog({
      action_id: action.action_id,
      user_id: actor.user_id,
      role: actor.role,
      workspace_id: actor.workspace_id,
      source,
      inputs,
      dry_run_result: preview,
      approval_status: action.approval_required ? 'approved' : 'not_required',
      approved_by: action.approval_required ? actor.user_id : null,
      result_status: 'executed',
      result_summary: summarizeResult(result),
      related_object_type: related.type,
      related_object_id: related.id,
    }, actionContext);
    return {
      success: true,
      action,
      actor,
      dry_run: false,
      approval_required: false,
      approved,
      preview,
      result,
      executed: true,
      audit_log,
      message: action.success_message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const audit_log = await writeActionAuditLog({
      action_id: action.action_id,
      user_id: actor.user_id,
      role: actor.role,
      workspace_id: actor.workspace_id,
      source,
      inputs,
      dry_run_result: preview,
      approval_status: action.approval_required ? (approved ? 'approved' : 'required') : 'not_required',
      approved_by: approved ? actor.user_id : null,
      result_status: 'failed',
      error: message,
    }, actionContext);
    return {
      success: false,
      action,
      actor,
      dry_run: false,
      approved,
      preview,
      executed: false,
      error: message,
      audit_log,
      message: action.failure_message,
    };
  }
}

module.exports = {
  missingRequiredInputs,
  runAction,
  summarizeResult,
};
