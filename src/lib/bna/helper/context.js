const { redactValue } = require('./redaction');

function compactText(value = '', max = 500) {
  return String(value || '').replace(/\r/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeStringMap(value = {}, maxEntries = 20) {
  const input = safeObject(value);
  const output = {};
  for (const [key, raw] of Object.entries(input).slice(0, maxEntries)) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (typeof raw === 'object') continue;
    output[compactText(key, 80)] = compactText(raw, 240);
  }
  return output;
}

function safeStringList(value = [], maxItems = 30) {
  return (Array.isArray(value) ? value : [])
    .map((item) => compactText(item, 120))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeSelectedRecord(value = {}) {
  const record = safeObject(value);
  const type = compactText(record.type || record.record_type || '', 80);
  const id = record.id || record.record_id || '';
  if (!type && !id) return null;
  return {
    type,
    id: compactText(id, 120),
  };
}

function sanitizeHelperPageContext(input = {}) {
  const context = safeObject(input);
  const workspace = safeObject(context.workspace);
  const actor = safeObject(context.actor);
  return redactValue({
    route: compactText(context.route || context.page_path || context.path || '', 300),
    query: safeStringMap(context.query || {}, 30),
    page: compactText(context.page || context.surface || '', 80),
    view: compactText(context.view || '', 80),
    workspace: {
      projectKey: compactText(workspace.projectKey || workspace.project_key || context.project_key || '', 120),
      providerId: compactText(workspace.providerId || workspace.provider_id || '', 120) || null,
      workspaceKey: compactText(workspace.workspaceKey || workspace.workspace_key || context.workspace_key || '', 120),
      displayName: compactText(workspace.displayName || workspace.display_name || '', 160),
      workspaceType: compactText(workspace.workspaceType || workspace.workspace_type || '', 80),
      roleLabel: compactText(workspace.roleLabel || workspace.role_label || '', 120),
    },
    actor: {
      role: compactText(actor.role || context.actor_role || '', 80),
      allowedViews: safeStringList(actor.allowedViews || actor.allowed_views || [], 40),
    },
    visibleFilters: safeObject(context.visibleFilters || context.visible_filters),
    selectedRecord: sanitizeSelectedRecord(context.selectedRecord || context.selected_record),
    visibleSection: compactText(context.visibleSection || context.visible_section || context.section || '', 120),
    availableClientActions: safeStringList(context.availableClientActions || context.available_client_actions || [], 50),
  });
}

function safeActionForClient(action = {}, options = {}) {
  const output = {
    id: action.id,
    tool: action.tool,
    label: action.label,
    summary: action.summary,
    reason: action.reason,
    risk: action.risk || 'low',
    requires_confirmation: Boolean(action.requires_confirmation),
    available: action.available,
    unavailable_reason: action.unavailable_reason || null,
    status: action.status || 'planned',
    error: action.error || null,
    args_preview: action.args_preview || {},
    result: action.result || null,
    result_url: action.result?.url || action.result_url || null,
  };
  if (options.includeConfirmationTokens && output.requires_confirmation && action._confirmationToken) {
    output.confirmation_token = action._confirmationToken;
  }
  return output;
}

function resultLinksFromActions(actions = []) {
  return (Array.isArray(actions) ? actions : [])
    .map((action) => action?.result)
    .filter((result) => result && result.url)
    .map((result) => ({
      label: result.label || result.summary || result.url,
      url: result.url,
      recordType: result.record_type || null,
      recordId: result.record_id || null,
    }));
}

function helperStateFromActions(actions = []) {
  const list = Array.isArray(actions) ? actions : [];
  if (!list.length) return 'completed';
  const statuses = new Set(list.map((action) => String(action.status || '').toLowerCase()));
  if (statuses.has('needs_confirmation')) return 'needs_confirmation';
  if (statuses.has('tool_not_found')) return 'failed';
  if (statuses.has('execution_failed')) return 'failed';
  if (statuses.has('schema_validation_failed')) return 'failed';
  if (statuses.has('permission_denied')) return 'blocked';
  if (statuses.has('missing_integration') || statuses.has('fallback_created') || statuses.has('needs_input')) return 'blocked';
  if ([...statuses].some((status) => status.endsWith('_failed'))) return 'failed';
  if (statuses.has('planned')) return 'planning';
  return 'completed';
}

function firstConfirmationForActions(planId, actions = [], options = {}) {
  const action = (Array.isArray(actions) ? actions : []).find((item) => item?.status === 'needs_confirmation');
  if (!action) return null;
  return {
    toolCallId: `${planId}:${action.id}`,
    actionId: action.id,
    summary: action.summary || action.label || action.tool || 'Confirm helper action',
    risks: [action.risk || 'medium'].filter(Boolean),
    confirmLabel: action.label ? `Confirm ${action.label}` : 'Confirm action',
    confirmationToken: options.includeConfirmationTokens ? (action._confirmationToken || null) : null,
  };
}

module.exports = {
  firstConfirmationForActions,
  helperStateFromActions,
  resultLinksFromActions,
  safeActionForClient,
  sanitizeHelperPageContext,
};
