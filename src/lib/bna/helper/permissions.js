const TASK_SCOPE_TOOLS = new Set([
  'create_task',
  'update_task',
  'add_task_comment',
  'mark_task_done',
  'create_pending_blocker',
  'request_missing_input',
  'create_decision',
  'add_decision_comment',
  'convert_decision_to_task',
  'send_decision_to_codex',
  'create_codex_work_item',
  'audit_queue_status',
  'show_task_report',
  'show_integration_status',
  'create_integration_setup_task',
  'save_provider_api_key',
  'rotate_provider_api_key',
  'test_resend_connection',
  'test_buffer_connection',
  'test_vimeo_connection',
  'test_wapi_connection',
  'mark_integration_blocked_until_thursday',
  'create_dns_setup_task',
  'prepare_vimeo_upload',
  'mark_manual_vimeo_upload_needed',
  'attach_vimeo_url_to_library_item',
]);

function normalizeProjectKey(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (['bna', 'bnei_neviim', 'bnei_neviim_academy', 'school'].includes(normalized)) return 'bna';
  if (['one_time', 'one_time_mishnah', 'one_time_mishna', 'one_time_mishnah_class', 'one_time_mishna_class', 'rabbi_sheller_provider', 'rabbi_scheller_provider', 'mishnah', 'mishna'].includes(normalized)) return 'one_time_mishnah_class';
  return normalized;
}

function projectKeyFromContext(context = {}, args = {}) {
  return normalizeProjectKey(
    args.project_key ||
    args.project ||
    context.projectKey ||
    context.project_key ||
    context.project?.project_key ||
    context.workspaceProjectKey ||
    ''
  );
}

function helperPermissionForTool(tool, context = {}, args = {}) {
  const identity = context.identity || {};
  const role = String(identity.role || context.userRole || '').toLowerCase();
  const scope = identity.scope || {};
  if (!tool) return { allowed: false, reason: 'tool_not_found' };
  if (role === 'super_admin' || role === 'admin' || scope.type === 'all' || !scope.type) {
    return { allowed: true };
  }

  if (scope.type === 'project') {
    const scopedProject = normalizeProjectKey(scope.projectKey || scope.project_key);
    const requestedProject = projectKeyFromContext(context, args) || scopedProject;
    if (requestedProject && scopedProject && requestedProject !== scopedProject) {
      return { allowed: false, reason: 'permission_denied: project scope mismatch' };
    }
    if (TASK_SCOPE_TOOLS.has(tool.name)) return { allowed: true };
    return { allowed: false, reason: 'permission_denied: scoped users can use only task, decision, Codex queue, report, and safe integration setup tools' };
  }

  return { allowed: false, reason: 'permission_denied' };
}

function visibleHelperTools(tools = [], context = {}) {
  return tools.filter((tool) => helperPermissionForTool(tool, context, {}).allowed);
}

module.exports = {
  TASK_SCOPE_TOOLS,
  helperPermissionForTool,
  normalizeProjectKey,
  visibleHelperTools,
};
