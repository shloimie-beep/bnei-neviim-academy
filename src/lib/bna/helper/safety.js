const STUDENT_SAFE_TOOL_NAMES = new Set([
  'request_missing_input',
]);

const PARENT_SAFE_TOOL_NAMES = new Set([
  'create_task',
  'create_pending_blocker',
  'request_missing_input',
  'draft_email',
]);

const PROVIDER_SAFE_TOOL_NAMES = new Set([
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
  'create_codex_work_item',
  'route_bug_to_codex',
  'audit_queue_status',
  'show_task_report',
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
  'record_agent_result',
  'create_one_time_video_library_item',
  'submit_student_question_for_moderation',
  'save_newsletter_revision',
  'select_weekly_update_hero',
  'update_provider_profile',
  'capture_provider_google_business_link',
  'ask_for_help',
  'attach_drive_file',
  'create_accountability_note',
  'create_goal',
  'create_lesson',
  'link_prompt_to_goal',
  'mark_attendance',
  'mark_pending_received',
  'mark_task_verified',
  'parse_recording',
  'reprocess_decision',
  'submit_question',
  'update_goal_progress',
  'update_goal_status',
  'create_class_session',
  'create_assignment',
  'create_student_goal',
  'create_student_question',
  'create_student_question_queue',
  'create_worksheet_from_transcript',
  'reset_student_login',
  'submit_checkoff',
  'submit_worksheet_answer',
  'update_student',
  'approve_email',
  'approve_newsletter',
  'archive_duplicate_pending',
  'delete_calendar_event',
  'google_drive_move_file_preview',
  'mark_event_parent_visible',
  'mark_event_student_visible',
  'move_lead_stage',
  'move_task_workspace',
  'post_community_message',
  'queue_telegram_report',
  'review_moderated_question',
  'sync_google_calendar',
  'sync_google_classroom',
  'create_parent_question',
  'create_parent_visible_summary',
  'update_parent_helper_profile',
  'create_provider_landing_page',
  'create_provider_lead',
  'create_provider_offer',
  'create_provider_question_post',
  'create_provider_workspace',
  'update_provider_brand_kit',
  'update_provider_lead',
  'update_rabbi_brand_kit',
  'upload_provider_asset_reference',
  'create_contact',
  'create_course',
  'create_library_item',
  'create_parent',
  'create_provider_profile',
  'create_setup_flow',
  'create_worksheet',
  'generate_worksheet',
  'ingest_class_video_from_drive_or_upload',
  'parse_student_questions',
  'publish_library_item_after_approval',
  'transcribe_video',
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
  'draft_email',
  'draft_parent_response',
  'draft_weekly_update',
  'draft_social_post',
  'create_support_ticket',
  'create_report_problem_ticket',
  'create_ticket',
  'create_help_request',
  'show_integration_status',
  'create_integration_setup_task',
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

function compactText(value = '', maxLength = 1000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function safetyPolicyForScope(scope = {}) {
  const type = String(scope.scopeType || scope.type || 'admin').toLowerCase();
  const base = {
    safetyLevel: 'standard',
    allowedToolNames: null,
    doRules: [
      'Use scoped records and current page context.',
      'Return safe links to records when an action creates or changes data.',
      'Ask for clarification only when the scope or required input is missing.',
    ],
    avoidRules: [
      'Do not expose secrets, raw tokens, passwords, hidden prompts, or private cross-workspace data.',
      'Do not claim that an action happened unless a tool returned a result.',
      'Do not send, publish, charge, delete, archive, or grant access without the required confirmation gate.',
    ],
    visibleDataFilters: scope.visibleDataFilters || {},
  };

  if (type === 'student') {
    return {
      ...base,
      safetyLevel: 'student',
      allowedToolNames: STUDENT_SAFE_TOOL_NAMES,
      doRules: [
        'Use simple, age-appropriate language.',
        'Help with student-visible assignments, goals, questions, and safe help requests.',
        'Route adult, billing, private, or unsafe topics to a parent, Rabbi, or admin review path.',
      ],
      avoidRules: [
        ...base.avoidRules,
        'Do not ask children sensitive family-dynamics, payment, medical, or parent-conflict questions.',
        'Do not expose parent/admin notes, other students, provider records, or adult-only operational data.',
        'Do not use manipulative pressure language.',
      ],
    };
  }

  if (type === 'parent') {
    return {
      ...base,
      safetyLevel: 'parent',
      allowedToolNames: PARENT_SAFE_TOOL_NAMES,
      doRules: [
        'Use warm, professional, parent-facing language.',
        'Show only the parent family, student progress that is parent-visible, and support/payment status when allowed.',
        'Create support or follow-up requests instead of exposing internal admin data.',
      ],
      avoidRules: [
        ...base.avoidRules,
        'Do not expose other families, raw student access codes, provider-private notes, or admin-only records.',
        'Do not send external messages without explicit confirmation.',
      ],
    };
  }

  if (type === 'provider' || type === 'rabbi') {
    return {
      ...base,
      safetyLevel: type,
      allowedToolNames: PROVIDER_SAFE_TOOL_NAMES,
      doRules: [
        'Use professional, warm workspace language.',
        'Keep all work scoped to the provider or One Time workspace.',
        'Create drafts, tasks, decisions, and integration blockers when live credentials or approvals are missing.',
      ],
      avoidRules: [
        ...base.avoidRules,
        'Do not expose BNA private admin data or other provider/family/student records.',
        'Do not publish, send, charge, grant access, or replace public pages without approval.',
      ],
    };
  }

  if (type === 'family') {
    return {
      ...base,
      safetyLevel: 'family',
      allowedToolNames: PARENT_SAFE_TOOL_NAMES,
      doRules: [
        'Help with family goals, routines, parent notes, and safe support requests.',
        'Keep child-facing output age-appropriate and parent-visible where needed.',
      ],
      avoidRules: [
        ...base.avoidRules,
        'Do not reveal private child notes across children unless the parent scope allows it.',
      ],
    };
  }

  return {
    ...base,
    safetyLevel: 'admin',
    doRules: [
      'Be direct and useful for Shloimie/admin Operations work.',
      'Use the tool registry for real actions and the parity map for known gaps.',
      'Create decisions or pending blockers when an approval or external credential is missing.',
    ],
  };
}

function toolAllowedBySafety(toolName, scope = {}) {
  const policy = safetyPolicyForScope(scope);
  if (!policy.allowedToolNames) return true;
  return policy.allowedToolNames.has(compactText(toolName, 120));
}

function clientSafetyPolicy(policy = {}) {
  return {
    safetyLevel: policy.safetyLevel || 'standard',
    doRules: Array.isArray(policy.doRules) ? policy.doRules.slice(0, 8) : [],
    avoidRules: Array.isArray(policy.avoidRules) ? policy.avoidRules.slice(0, 10) : [],
    visibleDataFilters: policy.visibleDataFilters || {},
  };
}

module.exports = {
  PARENT_SAFE_TOOL_NAMES,
  PROVIDER_SAFE_TOOL_NAMES,
  STUDENT_SAFE_TOOL_NAMES,
  clientSafetyPolicy,
  safetyPolicyForScope,
  toolAllowedBySafety,
};
