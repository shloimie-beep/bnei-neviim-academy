const TASK_SCOPE_TOOLS = new Set([
  'create_task',
  'create_rabbi_shiur_idea',
  'create_rabbi_source_sheet_task',
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
  'route_bug_to_codex',
  'audit_queue_status',
  'show_task_report',
  'create_support_ticket',
  'create_report_problem_ticket',
  'create_ticket',
  'create_help_request',
  'capture_raw_intake',
  'capture_ramble',
  'show_goal_status',
  'show_operating_goals',
  'run_watchdog_audit',
  'show_one_time_launch_checklist',
  'list_calendar_sessions',
  'open_calendar_event',
  'view_email_log',
  'show_contact_communication_history',
  'list_provider_leads',
  'open_content_item_url',
  'list_students',
  'show_assignments',
  'show_my_assignments',
  'show_my_goals',
  'show_parent_students',
  'show_student_progress',
  'show_student_progress_for_parent',
  'show_child_calendar',
  'view_parent_visible_notes',
  'calendar_batch_launch_plan_preview',
  'classroom_topic_material_preview',
  'google_drive_find_file_preview',
  'google_drive_create_doc_preview',
  'google_drive_create_folder_preview',
  'google_business_place_id_lookup',
  'google_business_list_locations_preview',
  'add_decision_option',
  'add_timeline_note',
  'create_calendar_event',
  'update_calendar_event',
  'create_parent_visible_event',
  'mark_event_admin_only',
  'create_provider_class_session',
  'create_referral_ledger_entry',
  'request_provider_contact',
  'retitle_task_naturally',
  'update_task_stage',
  'create_calendar_event_draft',
  'update_calendar_event_draft',
  'create_shoutout_draft',
  'distill_ramble',
  'draft_automation',
  'draft_drip_sequence',
  'draft_email_campaign',
  'draft_email_from_newsletter',
  'draft_mishnayos_landing_page',
  'find_latest_newsletter_draft',
  'generate_social_posts_from_newsletter',
  'generate_student_worksheet',
  'preview_campaign_segment',
  'refine_email',
  'refine_newsletter_draft',
  'draft_message_to_admin',
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
  'draft_parent_response',
  'draft_weekly_update',
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
