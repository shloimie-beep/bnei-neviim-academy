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
  'open_operations_view',
  'create_codex_work_item',
  'audit_queue_status',
  'show_task_report',
  'create_support_ticket',
  'capture_raw_intake',
  'show_goal_status',
  'run_watchdog_audit',
  'show_integration_status',
  'create_integration_setup_task',
  'create_automation',
  'update_automation',
  'test_resend_connection',
  'test_buffer_connection',
  'test_vimeo_connection',
  'test_wapi_connection',
  'mark_integration_blocked_until_thursday',
  'create_dns_setup_task',
  'create_provider_classroom_draft',
  'mark_manual_vimeo_upload_needed',
  'attach_vimeo_url_to_library_item',
]);

const PROVIDER_SCOPE_TOOLS = new Set([
  ...TASK_SCOPE_TOOLS,
  'draft_email',
  'draft_social_post',
  'show_task_report',
]);

const PARENT_SCOPE_TOOLS = new Set([
  'create_task',
  'create_pending_blocker',
  'request_missing_input',
  'draft_email',
]);

const STUDENT_SCOPE_TOOLS = new Set([
  'request_missing_input',
]);

const ADMIN_ONLY_PROVIDER_SECRET_TOOLS = new Set([
  'save_provider_api_key',
  'rotate_provider_api_key',
]);

function normalizeProjectKey(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (['bna', 'bnei_neviim', 'bnei_neviim_academy', 'school'].includes(normalized)) return 'bna';
  if (['one_time', 'one_time_mishnah', 'one_time_mishna', 'one_time_mishnah_class', 'one_time_mishna_class', 'rabbi_sheller_provider', 'rabbi_scheller_provider', 'mishnah', 'mishna'].includes(normalized)) return 'one_time_mishnah_class';
  return normalized;
}

function normalizeWorkspaceKey(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (['ops', 'operations', 'academy', 'school', 'bna', 'bnei_neviim', 'bnei_neviim_academy'].includes(normalized)) return 'bna';
  if (['one_time', 'one_time_mishnah', 'one_time_mishna', 'one_time_mishnah_class', 'one_time_mishna_class', 'rabbi_sheller', 'rabbi_sheller_provider', 'rabbi_scheller', 'rabbi_scheller_provider'].includes(normalized)) return 'rabbi_sheller_provider';
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

function workspaceKeyFromContext(context = {}, args = {}) {
  return normalizeWorkspaceKey(
    args.workspace_key ||
    args.workspace ||
    context.workspaceKey ||
    context.workspace_key ||
    context.helperScope?.workspaceKey ||
    context.helperScope?.workspace_key ||
    context.pageContext?.workspace?.workspaceKey ||
    context.pageContext?.workspace?.workspace_key ||
    ''
  );
}

function explicitWorkspaceKeyFromArgs(args = {}) {
  if (!Object.prototype.hasOwnProperty.call(args, 'workspace_key') && !Object.prototype.hasOwnProperty.call(args, 'workspace')) {
    return '';
  }
  return normalizeWorkspaceKey(args.workspace_key || args.workspace || '');
}

function helperPermissionForTool(tool, context = {}, args = {}) {
  const identity = context.identity || {};
  const role = String(identity.role || context.userRole || '').toLowerCase();
  const scope = identity.scope || {};
  const scopeType = String(context.helperScope?.scopeType || context.scopeType || scope.type || '').toLowerCase();
  if (!tool) return { allowed: false, reason: 'tool_not_found' };
  if (role === 'super_admin' || role === 'admin' || scope.type === 'all') {
    return { allowed: true };
  }

  if (scope.type === 'project') {
    const scopedProject = normalizeProjectKey(scope.projectKey || scope.project_key);
    const requestedProject = projectKeyFromContext(context, args) || scopedProject;
    const scopedWorkspace = normalizeWorkspaceKey(
      scope.workspaceKey ||
      scope.workspace_key ||
      context.workspaceKey ||
      context.workspace_key ||
      context.helperScope?.workspaceKey ||
      context.helperScope?.workspace_key ||
      context.pageContext?.workspace?.workspaceKey ||
      context.pageContext?.workspace?.workspace_key ||
      ''
    );
    const requestedWorkspace = explicitWorkspaceKeyFromArgs(args) || workspaceKeyFromContext(context, args) || scopedWorkspace;
    if (requestedProject && scopedProject && requestedProject !== scopedProject) {
      return { allowed: false, reason: 'permission_denied: project scope mismatch' };
    }
    if (requestedWorkspace && scopedWorkspace && requestedWorkspace !== scopedWorkspace) {
      return { allowed: false, reason: 'permission_denied: workspace scope mismatch' };
    }
    if (ADMIN_ONLY_PROVIDER_SECRET_TOOLS.has(tool.name)) {
      return { allowed: false, reason: 'permission_denied: provider helper cannot use admin/private BNA tools' };
    }
    if (TASK_SCOPE_TOOLS.has(tool.name)) return { allowed: true };
    return { allowed: false, reason: 'permission_denied: scoped users can use only task, decision, Codex queue, report, and safe integration setup tools' };
  }

  if (scope.type === 'provider' || scopeType === 'provider' || scopeType === 'rabbi') {
    const requestedProviderId = args.provider_id || args.providerId || context.providerId || context.pageContext?.workspace?.providerId || '';
    const scopedProviderId = scope.providerId || scope.provider_id || context.providerId || context.pageContext?.workspace?.providerId || '';
    if (requestedProviderId && scopedProviderId && String(requestedProviderId) !== String(scopedProviderId)) {
      return { allowed: false, reason: 'permission_denied: provider scope mismatch' };
    }
    if (ADMIN_ONLY_PROVIDER_SECRET_TOOLS.has(tool.name)) {
      return { allowed: false, reason: 'permission_denied: provider helper cannot use admin/private BNA tools' };
    }
    if (PROVIDER_SCOPE_TOOLS.has(tool.name)) return { allowed: true };
    return { allowed: false, reason: 'permission_denied: provider helper cannot use admin/private BNA tools' };
  }

  if (scope.type === 'parent' || scopeType === 'parent' || scopeType === 'family') {
    const requestedFamilyId = args.family_id || args.familyId || args.parent_id || args.parentId || '';
    const scopedFamilyId = scope.familyId || scope.family_id || scope.parentId || scope.parent_id || '';
    if (requestedFamilyId && scopedFamilyId && String(requestedFamilyId) !== String(scopedFamilyId)) {
      return { allowed: false, reason: 'permission_denied: parent/family scope mismatch' };
    }
    if (PARENT_SCOPE_TOOLS.has(tool.name)) return { allowed: true };
    return { allowed: false, reason: 'permission_denied: parent helper cannot use admin, provider, or other-family tools' };
  }

  if (scope.type === 'student' || scopeType === 'student') {
    const requestedStudentId = args.student_id || args.studentId || context.studentId || context.pageContext?.selectedRecord?.id || '';
    const scopedStudentId = scope.studentId || scope.student_id || context.studentId || '';
    if (requestedStudentId && scopedStudentId && String(requestedStudentId) !== String(scopedStudentId)) {
      return { allowed: false, reason: 'permission_denied: student scope mismatch' };
    }
    if (STUDENT_SCOPE_TOOLS.has(tool.name)) return { allowed: true };
    return { allowed: false, reason: 'permission_denied: student helper is student-safe only' };
  }

  return { allowed: false, reason: 'permission_denied' };
}

function visibleHelperTools(tools = [], context = {}) {
  return tools.filter((tool) => helperPermissionForTool(tool, context, {}).allowed);
}

module.exports = {
  ADMIN_ONLY_PROVIDER_SECRET_TOOLS,
  PARENT_SCOPE_TOOLS,
  PROVIDER_SCOPE_TOOLS,
  STUDENT_SCOPE_TOOLS,
  TASK_SCOPE_TOOLS,
  helperPermissionForTool,
  normalizeProjectKey,
  normalizeWorkspaceKey,
  visibleHelperTools,
  workspaceKeyFromContext,
};
