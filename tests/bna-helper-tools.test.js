const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const {
  REQUIRED_HELPER_TOOL_NAMES,
  buildToolRegistry,
} = require('../src/lib/bna/helper/tool-registry');
const {
  firstConfirmationForActions,
  helperStateFromActions,
  sanitizeHelperPageContext,
} = require('../src/lib/bna/helper/context');
const { getIntegrationReadiness } = require('../src/lib/bna/helper/integrations');
const { resolveHelperDestination } = require('../src/lib/bna/helper/destination-resolver');
const { helperPermissionForTool } = require('../src/lib/bna/helper/permissions');
const { buildHelperPlan, deterministicPlan } = require('../src/lib/bna/helper/planner');
const { redactValue } = require('../src/lib/bna/helper/redaction');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

const RABBI_LOCAL_SCOPE_PRIMITIVE_TOOLS = [
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
];

const RABBI_LOCAL_SCOPE_APPROVAL_TOOLS = new Set([
  'reset_student_login',
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
  'create_parent_visible_summary',
  'update_parent_helper_profile',
  'create_provider_landing_page',
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
]);

const RABBI_LOCAL_SCOPE_PRIMITIVE_ARGS = {
  title: 'Scoped One Time packet',
  issue: 'Private issue body should not return raw.',
  task_id: 44,
  pending_id: 45,
  duplicate_of_pending_id: 46,
  student_id: 11,
  parent_id: 12,
  provider_id: 7,
  lead_id: 15,
  event_id: 44,
  email_id: 51,
  newsletter_id: 52,
  source_output_id: 41,
  question_id: 53,
  community_id: 54,
  offer_id: 56,
  assignment_id: 22,
  goal_id: 33,
  lesson_id: 34,
  prompt_id: 35,
  recording_id: 55,
  content_id: 57,
  class_session_id: 66,
  course_id: 'course-123',
  worksheet_id: 58,
  setup_flow_key: 'one_time_setup',
  drive_file_id: 'private-drive-id',
  drive_url: 'https://drive.example/private',
  media_url: 'https://media.example/private-video.mp4',
  target_folder_id: 'private-target-folder',
  source_folder_id: 'private-source-folder',
  topic: 'Mishnah Peah',
  note: 'Private note should not return raw.',
  notes: 'Private notes should not return raw.',
  question_text: 'Private question body should not return raw.',
  transcript_text: 'Private transcript should not return raw.',
  body: 'Private worksheet answer should not return raw.',
  attendance_status: 'present',
  progress_percent: 80,
  status: 'active',
  stage: 'interested',
  decision: 'approved',
  visibility: 'parent',
  sync_direction: 'push',
  report_type: 'progress',
  target_workspace_key: 'rabbi_sheller_provider',
  target_project_key: 'one_time_mishnah_class',
  workspace_name: 'One Time provider workspace',
  slug: 'one-time-provider',
  asset_type: 'logo',
  asset_url: 'https://assets.example/private-logo.png',
  price_label: '$100 test',
  recipient_segment: 'One Time parents',
  checkoff_status: 'complete',
  display_name: 'Student One',
  grade: '7',
  start_at: '2026-08-09T19:00:00+03:00',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
};

test('BNA Helper backend exposes HELPER-03 storage, redaction fields, and routes', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_helper_tool_audit_log/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_helper_plans/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_helper_action_log/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_helper_profiles/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_helper_knowledge_items/);
  assert.match(server, /createBnaHelperSQL/);
  assert.match(server, /await pool\.query\(createBnaHelperSQL\)/);
  assert.match(server, /client_request_id TEXT/);
  assert.match(server, /confirmation_token_hash TEXT/);
  assert.match(server, /idempotency_key TEXT/);
  assert.match(server, /page_context_redacted JSONB/);
  assert.match(server, /sanitizeHelperPageContext/);
  assert.match(server, /getIntegrationReadiness/);
  assert.match(server, /helperNoStore/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/context'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/tools'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/profile'/);
  assert.match(server, /app\.patch\('\/api\/bna\/helper\/profile'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/profile\/questionnaire'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/knowledge'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/knowledge'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/message'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/chat'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/confirm'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/runs\/:id'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/plan'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/execute'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/audit'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/action-log'/);
  assert.match(server, /helperPermissionForTool/);
  assert.match(server, /insertHelperAudit/);
  assert.match(server, /Cache-Control', 'no-store'/);
  assert.match(server, /function setOperationsShellCacheHeader[\s\S]*private, no-cache, max-age=0, must-revalidate/);
  assert.match(server, /function setPublicStaticAssetCacheHeader/);
  assert.match(server, /STATIC_CODE_CACHE_SECONDS = 300/);
  assert.match(server, /public, max-age=\$\{STATIC_CODE_CACHE_SECONDS\}, must-revalidate/);
  assert.match(server, /STATIC_MEDIA_CACHE_SECONDS = 86400/);
  assert.match(server, /stale-while-revalidate=\$\{STATIC_MEDIA_STALE_SECONDS\}/);
  assert.match(server, /setPublicStaticAssetCacheHeader\(res, normalizedPath\)/);
  assert.match(server, /function sendOperationsShell[\s\S]*setOperationsShellCacheHeader\(res\)[\s\S]*operations-bootstrap\.html/);
  assert.match(server, /app\.get\(\['\/operations', '\/operations\/agents\/runs\/:runKey'\], requireAdmin, sendOperationsShell\)/);
  assert.match(server, /confirmation_text[\s\S]*CONFIRM/);
});

test('BNA Helper registry includes required tools and validates schemas', () => {
  const registry = buildToolRegistry();
  const names = registry.tools.map((tool) => tool.name);
  for (const name of REQUIRED_HELPER_TOOL_NAMES) {
    assert.ok(names.includes(name), `${name} should be registered`);
  }

  const invalidTask = registry.validate('create_task', { project_key: 'one_time_mishnah_class' });
  assert.equal(invalidTask.ok, false);
  assert.ok(invalidTask.errors.some((error) => error.includes('title is required')));

  const validTask = registry.validate('create_task', {
    title: 'Prepare source sheet',
    project_key: 'one_time_mishnah_class',
  });
  assert.equal(validTask.ok, true);
  assert.equal(validTask.args.title, 'Prepare source sheet');

  assert.equal(registry.validate('create_rabbi_source_sheet_task', {
    title: 'Prepare sources for Mishnah Peah',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('draft_parent_response', {
    body: 'We will review the question after class.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('show_one_time_launch_checklist', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('list_calendar_sessions', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('open_calendar_event', {
    event_id: 44,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('view_email_log', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('show_contact_communication_history', {
    email: 'parent@example.com',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('list_provider_leads', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  assert.equal(registry.validate('open_content_item_url', {
    content_id: 9,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }).ok, true);
  for (const toolName of [
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
    ...RABBI_LOCAL_SCOPE_PRIMITIVE_TOOLS,
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
  ]) {
    assert.equal(registry.validate(toolName, {
      title: 'Draft title',
      start_at: '2026-08-01T19:00:00+03:00',
      event_id: 44,
      task_id: 44,
      provider_id: 7,
      update_id: 8,
      option_label: 'Hybrid path',
      new_title: 'Verify One Time calendar',
      stage: 'in_progress',
      note: 'Internal note body should not be returned raw.',
      summary: 'Agent finished the scoped smoke.',
      question_text: 'Private question body should not return raw.',
      raw_text: 'Distill this One Time ramble into tasks.',
      message: 'Draft this safely',
      goal: 'Draft parent campaign',
      segment_name: 'One Time parents',
      body: 'Draft body',
      ...RABBI_LOCAL_SCOPE_PRIMITIVE_ARGS,
      student_id: 11,
      assignment_id: 22,
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    }).ok, true, `${toolName} should validate scoped draft args`);
  }

  const validClassroomDraft = registry.validate('create_provider_classroom_draft', {
    title: 'Rabbi classroom draft',
    raw_prompt: 'Start an 8-class private Rabbi Q&A classroom',
    class_count: 8,
    project_key: 'one_time_mishnah_class',
  });
  assert.equal(validClassroomDraft.ok, true);
  assert.equal(validClassroomDraft.args.class_count, 8);

  const validAutomation = registry.validate('create_automation', {
    name: 'Payment reminder workflow',
    automation_type: 'accounting',
    project_key: 'bna',
  });
  assert.equal(validAutomation.ok, true);
  assert.equal(validAutomation.args.name, 'Payment reminder workflow');
  assert.equal(registry.validate('update_automation', { automation_id: 7, enabled: false }).ok, true);

  const bufferTool = registry.get('schedule_social_post_via_buffer');
  assert.equal(bufferTool.available, false);
  assert.equal(bufferTool.unavailableReason, 'missing_integration');
  assert.equal(bufferTool.requiresConfirmation, true);
  assert.equal(bufferTool.sideEffectLevel, 'external_write');
  assert.equal(bufferTool.confirmationPolicy, 'explicit_confirmation_required');

  assert.equal(registry.validate('open_operations_view', { view: 'tasks', section: 'pending' }).ok, true);
  assert.equal(registry.validate('create_support_ticket', { title: 'Broken task button' }).ok, true);
});

test('BNA Helper redacts secrets, tokens, and student access codes', () => {
  const redacted = redactValue({
    openai_key: 'sk-placeholder-abcdefghijklmnopqrstuvwxyz1234567890', // watchdog-secret-scan: allow-placeholder
    Authorization: 'Bearer abc.def.ghi',
    note: 'Portal link /student.html?code=student-secret-123 should not leak.',
    nested: {
      password: 'super-secret-password',
    },
  });

  assert.equal(redacted.openai_key, '[redacted-secret]');
  assert.equal(redacted.Authorization, '[redacted-secret]');
  assert.match(redacted.note, /\[redacted-access\]/);
  assert.equal(redacted.nested.password, '[redacted-secret]');
});

test('BNA Helper context sanitizes page payloads and gates confirmation token exposure', () => {
  const pageContext = sanitizeHelperPageContext({
    route: '/operations',
    query: { view: 'students', access_token: 'secret-token' },
    page: 'operations',
    view: 'students',
    workspace: { workspaceKey: 'ops', projectKey: 'bna', providerId: 'provider-1', displayName: 'BNA School', workspaceType: 'school', roleLabel: 'BNA Admin' },
    actor: { role: 'admin', allowedViews: ['tasks', 'students'] },
    selectedRecord: { type: 'student', id: 42, secret: 'ignore-me' },
    visibleSection: 'student_detail',
    availableClientActions: ['create_task', 'draft_email'],
  });

  assert.equal(pageContext.route, '/operations');
  assert.equal(pageContext.workspace.projectKey, 'bna');
  assert.equal(pageContext.workspace.providerId, 'provider-1');
  assert.equal(pageContext.workspace.displayName, 'BNA School');
  assert.equal(pageContext.workspace.workspaceType, 'school');
  assert.equal(pageContext.workspace.roleLabel, 'BNA Admin');
  assert.deepEqual(pageContext.actor.allowedViews, ['tasks', 'students']);
  assert.deepEqual(pageContext.selectedRecord, { type: 'student', id: '42' });
  assert.equal(pageContext.query.access_token, '[redacted-secret]');

  const actions = [{
    id: 'act_1',
    tool: 'send_email',
    label: 'Send email',
    status: 'needs_confirmation',
    risk: 'high',
    requires_confirmation: true,
    _confirmationToken: 'opaque-token',
  }];

  assert.equal(helperStateFromActions(actions), 'needs_confirmation');
  assert.equal(helperStateFromActions([{ status: 'tool_not_found' }]), 'failed');
  assert.equal(helperStateFromActions([{ status: 'missing_integration' }]), 'blocked');
  assert.equal(firstConfirmationForActions('run_1', actions)?.confirmationToken, null);
  assert.equal(
    firstConfirmationForActions('run_1', actions, { includeConfirmationTokens: true })?.confirmationToken,
    'opaque-token'
  );
});

test('BNA Helper integration readiness only reports safe configured/not configured statuses', () => {
  const readiness = getIntegrationReadiness({
    configured: {
      openai: true,
      kimi: false,
      google_drive: true,
      gmail: true,
      telegram: false,
      buffer: false,
      resend: false,
      stripe: false,
      zoom: false,
      vimeo: false,
    },
  });

  assert.equal(readiness.openai, 'configured');
  assert.equal(readiness.kimi, 'not_configured');
  assert.equal(readiness.google_drive, 'configured');
  assert.equal(readiness.gmail, 'configured');
  assert.equal(readiness.telegram, 'not_configured');
  assert.equal(readiness.buffer, 'not_configured');
  assert.equal(readiness.ghl, 'not_configured');
  assert.equal(Object.values(readiness).includes('sk-test-secret-value'), false);
});

test('BNA Helper permissions keep project-scoped users in task and decision tools', () => {
  const registry = buildToolRegistry();
  const context = {
    userRole: 'one_time_admin',
    projectKey: 'one_time_mishnah_class',
    workspaceKey: 'rabbi_sheller_provider',
    identity: {
      role: 'one_time_admin',
      scope: { type: 'project', projectKey: 'one_time_mishnah_class', workspaceKey: 'rabbi_sheller_provider' },
    },
  };

  assert.equal(
    helperPermissionForTool(registry.get('create_task'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_decision'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_provider_classroom_draft'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_rabbi_source_sheet_task'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('draft_parent_response'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('route_bug_to_codex'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('show_one_time_launch_checklist'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('open_calendar_event'), context, { event_id: 7, workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('view_email_log'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('list_provider_leads'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  for (const toolName of [
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
    ...RABBI_LOCAL_SCOPE_PRIMITIVE_TOOLS,
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
  ]) {
    assert.equal(
      helperPermissionForTool(registry.get(toolName), context, {
        title: 'Draft title',
        start_at: '2026-08-01T19:00:00+03:00',
        event_id: 44,
        task_id: 44,
        provider_id: 7,
        update_id: 8,
        option_label: 'Hybrid path',
        new_title: 'Verify One Time calendar',
        stage: 'in_progress',
        note: 'Internal note body should not be returned raw.',
        summary: 'Agent finished the scoped smoke.',
        question_text: 'Private question body should not return raw.',
        raw_text: 'Distill this One Time ramble into tasks.',
        message: 'Draft this safely',
        goal: 'Draft parent campaign',
        segment_name: 'One Time parents',
        body: 'Draft body',
        ...RABBI_LOCAL_SCOPE_PRIMITIVE_ARGS,
        student_id: 11,
        assignment_id: 22,
        workspace_key: 'rabbi_sheller_provider',
        project_key: 'one_time_mishnah_class',
      }).allowed,
      true,
      `${toolName} should be allowed for the Rabbi project scope`
    );
  }
  assert.equal(
    helperPermissionForTool(registry.get('create_automation'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('update_automation'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_student'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('send_email'), context, { project_key: 'one_time_mishnah_class' }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_task'), context, { project_key: 'bna' }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_rabbi_source_sheet_task'), context, { project_key: 'bna' }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('open_calendar_event'), context, { event_id: 7, workspace_key: 'bna', project_key: 'one_time_mishnah_class' }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('view_email_log'), context, { project_key: 'bna' }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('list_students'), context, {
      student_id: 11,
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('show_student_progress_for_parent'), context, {
      student_id: 11,
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'bna',
    }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('google_drive_find_file_preview'), context, {
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }).allowed,
    false
  );
});

test('BNA Helper planner maps natural language to task, support, and navigation actions', () => {
  const registry = buildToolRegistry();
  const context = {
    projectKey: 'bna',
    pageContext: {
      selectedRecord: { type: 'task', id: '321' },
    },
  };

  assert.equal(deterministicPlan('go back to task 123', registry, context).actions[0].tool, 'open_operations_view');
  assert.deepEqual(
    deterministicPlan('go back to task 123', registry, context).actions[0].args,
    { view: 'tasks', section: 'tasks', task_id: 123 }
  );
  assert.deepEqual(
    deterministicPlan('open pending', registry, context).actions[0].args,
    { view: 'tasks', section: 'pending' }
  );
  assert.deepEqual(
    deterministicPlan('decisions', registry, context).actions[0].args,
    { view: 'tasks', section: 'decisions' }
  );
  assert.deepEqual(
    deterministicPlan('open the calendar schedule week', registry, context).actions[0].args,
    { view: 'tasks', section: 'schedule', calendar_mode: 'week' }
  );
  assert.deepEqual(
    deterministicPlan('open a link to this page', registry, {
      projectKey: 'bna',
      workspaceKey: 'bna',
      pageContext: {
        query: { view: 'settings', section: 'calendar_classroom', workspace: 'bna' },
        view: 'settings',
      },
    }).actions[0].args,
    { view: 'settings', section: 'calendar_classroom', workspace_key: 'bna' }
  );
  assert.deepEqual(
    deterministicPlan('open settings calendar classroom', registry, { projectKey: 'bna', workspaceKey: 'bna' }).actions[0].args,
    { view: 'settings', section: 'calendar_classroom', workspace_key: 'bna' }
  );
  assert.equal(deterministicPlan('mark this done', registry, context).actions[0].tool, 'mark_task_done');
  assert.equal(deterministicPlan('mark this done', registry, context).actions[0].args.task_id, 321);
  assert.equal(deterministicPlan('edit task 44 title to Fix the parent reset copy', registry, context).actions[0].tool, 'update_task');
  assert.equal(deterministicPlan('edit task 44 title to Fix the parent reset copy', registry, context).actions[0].args.title, 'Fix the parent reset copy');
  assert.equal(deterministicPlan('report problem the task page button looks wrong', registry, context).actions[0].tool, 'create_support_ticket');
  assert.equal(deterministicPlan('report problem the task page button looks wrong', registry, context).actions[0].args.category, 'link');
  const performancePlan = deterministicPlan('the whole app is slow and laggy and takes forever to load', registry, context);
  assert.equal(performancePlan.actions[0].tool, 'create_support_ticket');
  assert.equal(performancePlan.actions[0].args.category, 'other');
  const classroomPlan = deterministicPlan(
    'Start an 8-class provider classroom where students reply privately and the teacher publishes selected questions',
    registry,
    { projectKey: 'one_time_mishnah_class', workspaceKey: 'rabbi_sheller_provider' }
  );
  assert.equal(classroomPlan.actions[0].tool, 'create_provider_classroom_draft');
  assert.equal(classroomPlan.actions[0].args.class_count, 8);
  assert.equal(classroomPlan.actions[0].args.student_to_teacher_replies, true);
  assert.equal(classroomPlan.actions[0].args.student_to_student_chat_enabled, false);
  assert.equal(classroomPlan.actions[0].args.teacher_moderation_required, true);

  const billingPlan = deterministicPlan(
    'create a billing workflow for tuition payment reminders',
    registry,
    { projectKey: 'bna' }
  );
  assert.equal(billingPlan.actions[0].tool, 'create_automation');
  assert.equal(billingPlan.actions[0].args.automation_type, 'accounting');
  assert.equal(billingPlan.actions[0].args.package_key, 'accounting');

  const automationUpdatePlan = deterministicPlan(
    'disable automation 42 because the reminder copy needs review',
    registry,
    { projectKey: 'bna' }
  );
  assert.equal(automationUpdatePlan.actions[0].tool, 'update_automation');
  assert.equal(automationUpdatePlan.actions[0].args.automation_id, 42);
  assert.equal(automationUpdatePlan.actions[0].args.enabled, false);

  const oneTimeContext = { projectKey: 'one_time_mishnah_class', workspaceKey: 'rabbi_sheller_provider' };
  assert.equal(deterministicPlan('capture this ramble: make the bot scoped for the rabbi', registry, oneTimeContext).actions[0].tool, 'capture_ramble');
  assert.equal(deterministicPlan('show operating goals for this bot', registry, oneTimeContext).actions[0].tool, 'show_operating_goals');
  assert.equal(deterministicPlan('create source sheet task for Mishnah Peah class three', registry, oneTimeContext).actions[0].tool, 'create_rabbi_source_sheet_task');
  assert.equal(deterministicPlan('create shiur idea about reviewing the first perek', registry, oneTimeContext).actions[0].tool, 'create_rabbi_shiur_idea');
  assert.equal(deterministicPlan('route bug to Codex: the One Time calendar page is broken', registry, oneTimeContext).actions[0].tool, 'route_bug_to_codex');
  assert.equal(deterministicPlan('draft parent response about tonight class reminder', registry, oneTimeContext).actions[0].tool, 'draft_parent_response');
  assert.equal(deterministicPlan('draft weekly update about the review goals', registry, oneTimeContext).actions[0].tool, 'draft_weekly_update');
  assert.equal(deterministicPlan('create help request because the Rabbi login is confusing', registry, oneTimeContext).actions[0].tool, 'create_help_request');
  assert.equal(deterministicPlan('show the One Time launch checklist', registry, oneTimeContext).actions[0].tool, 'show_one_time_launch_checklist');
  assert.equal(deterministicPlan('show upcoming calendar sessions', registry, oneTimeContext).actions[0].tool, 'list_calendar_sessions');
  assert.equal(deterministicPlan('open calendar event 44', registry, oneTimeContext).actions[0].tool, 'open_calendar_event');
  assert.equal(deterministicPlan('open calendar event 44', registry, oneTimeContext).actions[0].args.event_id, 44);
  assert.equal(deterministicPlan('view recent email log', registry, oneTimeContext).actions[0].tool, 'view_email_log');
  assert.equal(deterministicPlan('show communication history for parent@example.com', registry, oneTimeContext).actions[0].tool, 'show_contact_communication_history');
  assert.equal(deterministicPlan('show communication history for parent@example.com', registry, oneTimeContext).actions[0].args.email, 'parent@example.com');
  assert.equal(deterministicPlan('list provider leads', registry, oneTimeContext).actions[0].tool, 'list_provider_leads');
  assert.equal(deterministicPlan('open content item 9', registry, oneTimeContext).actions[0].tool, 'open_content_item_url');
  assert.equal(deterministicPlan('open content item 9', registry, oneTimeContext).actions[0].args.content_id, 9);
  assert.equal(deterministicPlan('list students', registry, oneTimeContext).actions[0].tool, 'list_students');
  assert.equal(deterministicPlan('show parent students', registry, oneTimeContext).actions[0].tool, 'show_parent_students');
  assert.equal(deterministicPlan('show assignments for student 11', registry, oneTimeContext).actions[0].tool, 'show_my_assignments');
  assert.equal(deterministicPlan('show assignments for student 11', registry, oneTimeContext).actions[0].args.student_id, 11);
  assert.equal(deterministicPlan('show assignments for parents', registry, oneTimeContext).actions[0].tool, 'show_assignments');
  assert.equal(deterministicPlan('show my assignments', registry, oneTimeContext).actions[0].tool, 'show_my_assignments');
  assert.equal(deterministicPlan('show my goals', registry, oneTimeContext).actions[0].tool, 'show_my_goals');
  assert.equal(deterministicPlan('show student progress for student 11', registry, oneTimeContext).actions[0].tool, 'show_student_progress');
  assert.equal(deterministicPlan('show student progress for parent about student 11', registry, oneTimeContext).actions[0].tool, 'show_student_progress_for_parent');
  assert.equal(deterministicPlan('show child calendar for student 11', registry, oneTimeContext).actions[0].tool, 'show_child_calendar');
  assert.equal(deterministicPlan('view parent visible notes for student 11', registry, oneTimeContext).actions[0].tool, 'view_parent_visible_notes');
  assert.equal(deterministicPlan('preview the 8 week launch calendar plan starting 2026-08-01', registry, oneTimeContext).actions[0].tool, 'calendar_batch_launch_plan_preview');
  assert.equal(deterministicPlan('preview classroom topic material for topic Week 1', registry, oneTimeContext).actions[0].tool, 'classroom_topic_material_preview');
  assert.equal(deterministicPlan('find Google Drive file "Mishnah Peah source file"', registry, oneTimeContext).actions[0].tool, 'google_drive_find_file_preview');
  assert.equal(deterministicPlan('preview Google Drive doc "Class summary draft"', registry, oneTimeContext).actions[0].tool, 'google_drive_create_doc_preview');
  assert.equal(deterministicPlan('preview Google Drive folder "One Time class summaries"', registry, oneTimeContext).actions[0].tool, 'google_drive_create_folder_preview');
  assert.equal(deterministicPlan('lookup Google Business place id for Rabbi Scheller One Time', registry, oneTimeContext).actions[0].tool, 'google_business_place_id_lookup');
  assert.equal(deterministicPlan('list Google Business locations for Rabbi Scheller One Time', registry, oneTimeContext).actions[0].tool, 'google_business_list_locations_preview');
  assert.equal(deterministicPlan('add decision option Hybrid path to task 44', registry, oneTimeContext).actions[0].tool, 'add_decision_option');
  assert.equal(deterministicPlan('add decision option Hybrid path to task 44', registry, oneTimeContext).actions[0].args.option_label, 'Hybrid path');
  assert.equal(deterministicPlan('add timeline note to task 44: parent asked about schedule', registry, oneTimeContext).actions[0].tool, 'add_timeline_note');
  assert.equal(deterministicPlan('create calendar event "One Time review" on 2026-08-04', registry, oneTimeContext).actions[0].tool, 'create_calendar_event');
  assert.equal(deterministicPlan('update calendar event 44 to 2026-08-05', registry, oneTimeContext).actions[0].tool, 'update_calendar_event');
  assert.equal(deterministicPlan('create parent visible event "Class reminder" on 2026-08-06', registry, oneTimeContext).actions[0].tool, 'create_parent_visible_event');
  assert.equal(deterministicPlan('mark event 44 admin only', registry, oneTimeContext).actions[0].tool, 'mark_event_admin_only');
  assert.equal(deterministicPlan('create provider class session "Week 2" on 2026-08-07', registry, oneTimeContext).actions[0].tool, 'create_provider_class_session');
  assert.equal(deterministicPlan('create referral ledger entry for Sarah referral', registry, oneTimeContext).actions[0].tool, 'create_referral_ledger_entry');
  assert.equal(deterministicPlan('request provider 7 contact message please call parent', registry, oneTimeContext).actions[0].tool, 'request_provider_contact');
  assert.equal(deterministicPlan('retitle task 44 to Verify One Time calendar', registry, oneTimeContext).actions[0].tool, 'retitle_task_naturally');
  assert.equal(deterministicPlan('update task 44 stage in_progress', registry, oneTimeContext).actions[0].tool, 'update_task_stage');
  assert.equal(deterministicPlan('record agent result for task 44: PASS scoped smoke', registry, oneTimeContext).actions[0].tool, 'record_agent_result');
  assert.equal(deterministicPlan('create One Time video library item "Week 3 recording"', registry, oneTimeContext).actions[0].tool, 'create_one_time_video_library_item');
  assert.equal(deterministicPlan('submit student question for moderation: why does the Mishnah begin here', registry, oneTimeContext).actions[0].tool, 'submit_student_question_for_moderation');
  assert.equal(deterministicPlan('save newsletter revision body: this week we reviewed Peah', registry, oneTimeContext).actions[0].tool, 'save_newsletter_revision');
  assert.equal(deterministicPlan('select weekly update 8 as hero', registry, oneTimeContext).actions[0].tool, 'select_weekly_update_hero');
  assert.equal(deterministicPlan('update provider profile for provider 7 summary: private One Time class', registry, oneTimeContext).actions[0].tool, 'update_provider_profile');
  assert.equal(deterministicPlan('capture provider 7 Google Business link https://maps.google.com/?cid=12345', registry, oneTimeContext).actions[0].tool, 'capture_provider_google_business_link');
  for (const [message, expectedTool] of [
    ['ask for help with task 44 about source upload', 'ask_for_help'],
    ['attach Drive file private-drive-id to task 44', 'attach_drive_file'],
    ['create accountability note for student 11 about review effort', 'create_accountability_note'],
    ['create goal Finish Peah review', 'create_goal'],
    ['create lesson Peah review', 'create_lesson'],
    ['link prompt 35 to goal 33', 'link_prompt_to_goal'],
    ['mark attendance for student 11 present', 'mark_attendance'],
    ['mark pending 45 received', 'mark_pending_received'],
    ['mark task 44 verified', 'mark_task_verified'],
    ['parse recording 55', 'parse_recording'],
    ['reprocess decision task 44', 'reprocess_decision'],
    ['submit question for student 11: why does the Mishnah start here', 'submit_question'],
    ['update goal 33 progress 80', 'update_goal_progress'],
    ['update goal 33 status active', 'update_goal_status'],
    ['create Rabbi class session "Week 2" on 2026-08-09', 'create_class_session'],
    ['create assignment for student 11 Review Peah', 'create_assignment'],
    ['create student goal for student 11 Finish Peah', 'create_student_goal'],
    ['create student question for student 11: what does Peah mean', 'create_student_question'],
    ['create student question queue for student 11 topic Peah', 'create_student_question_queue'],
    ['create worksheet from transcript for student 11 assignment 22', 'create_worksheet_from_transcript'],
    ['reset student 11 login', 'reset_student_login'],
    ['submit checkoff for student 11 assignment 22 complete', 'submit_checkoff'],
    ['submit worksheet answer for student 11 assignment 22 answer: reviewed it', 'submit_worksheet_answer'],
    ['update student 11 display name to Student One', 'update_student'],
    ['approve email 51 subject: Parent update', 'approve_email'],
    ['approve newsletter 52 title "Weekly One Time update"', 'approve_newsletter'],
    ['archive duplicate pending 45 duplicate of pending 46', 'archive_duplicate_pending'],
    ['delete calendar event 44 because duplicate', 'delete_calendar_event'],
    ['move Google Drive file private-drive-id to target folder private-target-folder', 'google_drive_move_file_preview'],
    ['mark event 44 parent visible', 'mark_event_parent_visible'],
    ['mark event 44 student visible', 'mark_event_student_visible'],
    ['move lead 15 stage interested', 'move_lead_stage'],
    ['move task 44 workspace target workspace rabbi_sheller_provider target project one_time_mishnah_class', 'move_task_workspace'],
    ['post community message to community 54: class starts tonight', 'post_community_message'],
    ['queue Telegram report body: progress update', 'queue_telegram_report'],
    ['review moderated question 53 approve', 'review_moderated_question'],
    ['sync Google Calendar event 44 push', 'sync_google_calendar'],
    ['sync Google Classroom session 66 push', 'sync_google_classroom'],
    ['create parent question for student 11: what time is class', 'create_parent_question'],
    ['create parent visible summary for student 11 about review effort', 'create_parent_visible_summary'],
    ['update parent helper profile parent 12 name to Parent One', 'update_parent_helper_profile'],
    ['create provider landing page "One Time landing" slug one-time-provider', 'create_provider_landing_page'],
    ['create provider lead for parent 12', 'create_provider_lead'],
    ['create provider offer "One Time monthly"', 'create_provider_offer'],
    ['create provider question post question 53', 'create_provider_question_post'],
    ['create provider workspace "One Time provider workspace"', 'create_provider_workspace'],
    ['update provider brand kit provider 7 brand key one_time', 'update_provider_brand_kit'],
    ['update provider lead 15 stage interested', 'update_provider_lead'],
    ['update rabbi brand kit provider 7 brand key one_time', 'update_rabbi_brand_kit'],
    ['upload provider asset reference provider 7 asset type logo https://assets.example/private-logo.png', 'upload_provider_asset_reference'],
    ['create contact "Parent One" for student 11', 'create_contact'],
    ['create course "Peah review course"', 'create_course'],
    ['create library item "Week 4 recording"', 'create_library_item'],
    ['create parent "Parent One" for student 11', 'create_parent'],
    ['create provider profile "Rabbi Scheller One Time"', 'create_provider_profile'],
    ['create setup flow "One Time onboarding"', 'create_setup_flow'],
    ['create worksheet for student 11 assignment 22 about Mishnah Peah', 'create_worksheet'],
    ['generate worksheet topic Mishnah Peah', 'generate_worksheet'],
    ['ingest class video from Drive file private-drive-id for session 66', 'ingest_class_video_from_drive_or_upload'],
    ['parse student questions from recording 55 topic Peah', 'parse_student_questions'],
    ['publish library item 57 after approval', 'publish_library_item_after_approval'],
    ['transcribe video recording 55', 'transcribe_video'],
  ]) {
    assert.equal(
      deterministicPlan(message, registry, oneTimeContext).actions[0].tool,
      expectedTool,
      message
    );
  }
  assert.equal(deterministicPlan('draft calendar event "Week 1 Mishnah class" on 2026-08-01', registry, oneTimeContext).actions[0].tool, 'create_calendar_event_draft');
  assert.equal(deterministicPlan('update calendar event 44 draft to 2026-08-02', registry, oneTimeContext).actions[0].tool, 'update_calendar_event_draft');
  assert.equal(deterministicPlan('draft shoutout for student 11 about review effort', registry, oneTimeContext).actions[0].tool, 'create_shoutout_draft');
  assert.equal(deterministicPlan('distill this ramble about the One Time bot', registry, oneTimeContext).actions[0].tool, 'distill_ramble');
  assert.equal(deterministicPlan('draft automation when a parent signs up send welcome after review', registry, oneTimeContext).actions[0].tool, 'draft_automation');
  assert.equal(deterministicPlan('draft 3 email drip sequence for new One Time parents', registry, oneTimeContext).actions[0].tool, 'draft_drip_sequence');
  assert.equal(deterministicPlan('draft email campaign for One Time parent leads', registry, oneTimeContext).actions[0].tool, 'draft_email_campaign');
  assert.equal(deterministicPlan('draft email from newsletter body: this week we reviewed Peah', registry, oneTimeContext).actions[0].tool, 'draft_email_from_newsletter');
  assert.equal(deterministicPlan('draft Mishnayos landing page for One Time', registry, oneTimeContext).actions[0].tool, 'draft_mishnayos_landing_page');
  assert.equal(deterministicPlan('find latest newsletter draft', registry, oneTimeContext).actions[0].tool, 'find_latest_newsletter_draft');
  assert.equal(deterministicPlan('make social posts from newsletter body: class recap', registry, oneTimeContext).actions[0].tool, 'generate_social_posts_from_newsletter');
  assert.equal(deterministicPlan('generate worksheet for student 11 assignment 22 about Mishnah Peah', registry, oneTimeContext).actions[0].tool, 'generate_student_worksheet');
  assert.equal(deterministicPlan('preview campaign segment One Time interested parents', registry, oneTimeContext).actions[0].tool, 'preview_campaign_segment');
  assert.equal(deterministicPlan('refine email body: hello parents', registry, oneTimeContext).actions[0].tool, 'refine_email');
  assert.equal(deterministicPlan('refine newsletter body: this week was great', registry, oneTimeContext).actions[0].tool, 'refine_newsletter_draft');
  assert.equal(deterministicPlan('draft message to admin about a parent question', registry, oneTimeContext).actions[0].tool, 'draft_message_to_admin');
});

test('Rabbi helper alias wrappers delegate to scoped runtime primitives and reject cross-scope execution', async () => {
  const createdTasks = [];
  const deps = {
    createTaskFromText: async (input) => {
      const task = {
        id: createdTasks.length + 1,
        title: input.title,
        category: input.category,
        project_key: input.project_key,
        notes: input.notes,
      };
      createdTasks.push(input);
      return task;
    },
    resolveProjectFromInput: async ({ project_key }) => ({
      id: 91,
      project_key,
      workspace_key: 'rabbi_sheller_provider',
    }),
    assertProjectAccess: () => {},
    createRawIntakeRecord: async ({ rawInput }) => ({
      id: 501,
      stable_id: 'RAW-20260708-TEST',
      raw_text: rawInput,
      parse_status: 'raw',
    }),
    updateRawIntakeRecordAfterParse: async (record) => ({
      ...record,
      parse_status: 'parsed',
    }),
  };
  const executedQueries = [];
  const db = {
    query: async (sql, params) => {
      executedQueries.push({ sql, params });
      if (/INSERT INTO bna_bot_action_logs/i.test(sql)) {
        return {
          rows: [{
            id: executedQueries.length,
            workspace_key: params[0],
            actor_role: params[1],
            action_key: params[2],
            status: params[5],
          }],
        };
      }
      if (/INSERT INTO bna_support_tickets/i.test(sql)) {
        return {
          rows: [{
            id: 77,
            project_id: params[0],
            title: params[1],
            description: params[2],
            severity: params[3],
            category: params[4],
          }],
        };
      }
      if (/FROM bna_tasks/i.test(sql)) {
        return {
          rows: [{
            id: 901,
            title: 'Finish launch smoke',
            display_title: 'Finish launch smoke',
            summary: 'Run Agent Mode scoped probe.',
            stage: 'assigned',
            category: 'technology',
            waiting_on: 'Codex',
            agent_status: 'ready',
            updated_at: '2026-07-08T08:00:00.000Z',
          }],
        };
      }
      if (/FROM bna_calendar_events/i.test(sql) && /WHERE id = \$1/i.test(sql)) {
        return {
          rows: [{
            id: params[0],
            title: 'Mishnah review',
            start_at: '2026-07-09T18:00:00.000Z',
            end_at: '2026-07-09T19:00:00.000Z',
            status: 'scheduled',
            visibility: 'provider',
            source: 'manual',
            related_type: 'class_session',
            related_id: 11,
            meeting_url_present: true,
          }],
        };
      }
      if (/FROM bna_calendar_events/i.test(sql)) {
        return {
          rows: [{
            id: 44,
            title: 'Mishnah review',
            start_at: '2026-07-09T18:00:00.000Z',
            end_at: '2026-07-09T19:00:00.000Z',
            status: 'scheduled',
            visibility: 'provider',
            source: 'manual',
            related_type: 'class_session',
            related_id: 11,
            meeting_url_present: true,
          }],
        };
      }
      if (/FROM bna_content_jobs/i.test(sql)) {
        return {
          rows: [{
            id: params[0],
            title: 'Peah recording',
            status: 'approved',
            source_type: 'telegram_media',
            created_at: '2026-07-08T07:00:00.000Z',
            updated_at: '2026-07-08T07:30:00.000Z',
            media_url_present: true,
            drive_file_present: true,
          }],
        };
      }
      if (/FROM bna_students st/i.test(sql)) {
        return {
          rows: [{
            id: 11,
            signup_id: 12,
            name: 'Student One',
            name_en: 'Student One',
            name_he: 'תלמיד א',
            grade: '7',
            current_school: 'One Time',
            status: 'active',
            tags: ['review'],
            created_at: '2026-07-08T02:00:00.000Z',
            updated_at: '2026-07-08T03:00:00.000Z',
            parent_email: 'parent@example.com',
            parent_phone: '+15555555555',
            student_access_code: 'student-secret-123',
            notes: 'private student note',
          }],
        };
      }
      if (/FROM bna_assignment_students ast/i.test(sql)) {
        return {
          rows: [{
            assignment_student_id: 21,
            assignment_id: 22,
            student_id: 11,
            student_name: 'Student One',
            title: 'Review Mishnah Peah',
            language_mode: 'en_he',
            worksheet_type: 'review',
            schedule_text: 'Tonight',
            assignment_status: 'assigned',
            status: 'open',
            scheduled_start_at: '2026-07-09T16:00:00.000Z',
            due_at: '2026-07-10T16:00:00.000Z',
            sync_mode: 'manual',
            sync_status: 'not_synced',
            classroom_state: 'draft',
            material_url_present: true,
            youtube_url_present: true,
            classroom_link_present: true,
            calendar_link_present: true,
            worksheet_body: 'private worksheet body',
            raw_instructions: 'private instructions',
            material_url: 'https://private.example/material',
            youtube_url: 'https://youtube.example/private',
          }],
        };
      }
      if (/FROM bna_accountability_events ae/i.test(sql) && /student_goal/i.test(sql)) {
        return {
          rows: [{
            id: 31,
            student_id: 11,
            student_name: 'Student One',
            title: 'Finish review',
            topic: 'Peah',
            goal_target_value: 10,
            goal_actual_value: 6,
            goal_unit: 'mishnayos',
            progress_percent: 60,
            follow_up_required: true,
            next_check_in_date: '2026-07-12',
            occurred_at: '2026-07-08T03:30:00.000Z',
            updated_at: '2026-07-08T04:00:00.000Z',
            notes: 'private goal note',
            metadata: { private: true },
          }],
        };
      }
      if (/FROM bna_accountability_events ae/i.test(sql)) {
        return {
          rows: [{
            id: 32,
            student_id: 11,
            student_name: 'Student One',
            event_type: 'parent_update',
            title: 'Parent-visible update',
            topic: 'Review',
            notes: 'Student practiced six Mishnayos.',
            question_text: 'private question body',
            occurred_at: '2026-07-08T04:30:00.000Z',
            created_at: '2026-07-08T04:30:00.000Z',
            metadata: { private: true },
          }],
        };
      }
      if (/FROM bna_communications/i.test(sql) && /c\.channel = 'email'/i.test(sql)) {
        return {
          rows: [{
            id: 31,
            channel: 'email',
            direction: 'outbound',
            communication_type: 'weekly_update',
            from_name: 'One Time',
            from_address: 'rabbi@example.com',
            to_name: 'Parent',
            to_address: 'parent@example.com',
            subject: 'This week',
            provider: 'resend',
            status: 'sent',
            occurred_at: '2026-07-08T06:00:00.000Z',
            created_at: '2026-07-08T06:00:00.000Z',
            body_text: 'should never return',
          }],
        };
      }
      if (/FROM bna_communications/i.test(sql)) {
        return {
          rows: [{
            id: 32,
            channel: 'whatsapp',
            direction: 'inbound',
            communication_type: 'question',
            from_name: 'Parent',
            from_address: 'parent@example.com',
            to_name: 'One Time',
            to_address: 'rabbi@example.com',
            subject: 'Question',
            provider: 'wapi',
            status: 'logged',
            occurred_at: '2026-07-08T05:00:00.000Z',
            created_at: '2026-07-08T05:00:00.000Z',
            body_text: 'private body should never return',
          }],
        };
      }
      if (/FROM bna_parent_leads/i.test(sql)) {
        return {
          rows: [{
            record_type: 'parent_lead',
            id: 12,
            parent_name: 'Parent One',
            student_name: 'Student One',
            lead_type: 'content_interest',
            status: 'interested',
            interest_level: 'hot',
            source: 'website_form',
            source_detail: 'landing page',
            last_inbound_at: '2026-07-08T04:15:00.000Z',
            last_outbound_at: null,
            next_follow_up_date: '2026-07-09',
            tag_count: 2,
            communication_count: 3,
            latest_communication_at: '2026-07-08T04:30:00.000Z',
            parent_email: 'private@example.com',
            created_at: '2026-07-08T03:00:00.000Z',
            updated_at: '2026-07-08T04:00:00.000Z',
            parent_phone: 'private phone',
            notes: 'private lead notes',
          }],
        };
      }
      if (/FROM bna_content_outputs/i.test(sql)) {
        return {
          rows: [{
            id: 41,
            job_id: 55,
            title: 'Private newsletter title',
            body: 'Private newsletter body should not be returned raw',
            status: 'draft',
            output_type: 'weekly_newsletter',
            updated_at: '2026-07-08T06:00:00.000Z',
            created_at: '2026-07-08T05:00:00.000Z',
          }],
        };
      }
      throw new Error(`Unexpected test query: ${sql}`);
    },
  };
  const registry = buildToolRegistry(deps);
  const context = {
    userName: 'Rabbi Helper Test',
    userRole: 'one_time_admin',
    projectKey: 'one_time_mishnah_class',
    workspaceKey: 'rabbi_sheller_provider',
    identity: {
      role: 'one_time_admin',
      scope: {
        type: 'project',
        projectKey: 'one_time_mishnah_class',
        workspaceKey: 'rabbi_sheller_provider',
      },
    },
  };

  const sourceSheet = await registry.execute('create_rabbi_source_sheet_task', {
    title: 'Prepare Peah source sheet',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(sourceSheet.tool, 'create_rabbi_source_sheet_task');
  assert.equal(sourceSheet.data.delegated_tool, 'create_task');
  assert.equal(sourceSheet.data.task.category, 'source_sheets');
  assert.equal(sourceSheet.data.task.project_key, 'one_time_mishnah_class');

  const parentDraft = await registry.execute('draft_parent_response', {
    body: 'We will review this with the Rabbi after class.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(parentDraft.tool, 'draft_parent_response');
  assert.equal(parentDraft.data.delegated_tool, 'draft_email');
  assert.equal(parentDraft.data.sent, false);

  const ticket = await registry.execute('create_help_request', {
    title: 'Rabbi login needs help',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(ticket.tool, 'create_help_request');
  assert.equal(ticket.data.delegated_tool, 'create_support_ticket');
  assert.equal(ticket.record_id, 77);

  const ramble = await registry.execute('capture_ramble', {
    raw_text: 'Goal mode: keep the Rabbi helper scoped only to One Time.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(ramble.tool, 'capture_ramble');
  assert.equal(ramble.data.delegated_tool, 'capture_raw_intake');
  assert.equal(ramble.data.raw_text_returned, false);

  const launchChecklist = await registry.execute('show_one_time_launch_checklist', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(launchChecklist.tool, 'show_one_time_launch_checklist');
  assert.equal(launchChecklist.data.scope.workspace_key, 'rabbi_sheller_provider');
  assert.equal(launchChecklist.data.tasks[0].id, 901);

  const sessions = await registry.execute('list_calendar_sessions', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(sessions.tool, 'list_calendar_sessions');
  assert.equal(sessions.data.events[0].meeting_url_present, true);
  assert.equal(sessions.data.events[0].meeting_url_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(sessions.data.events[0], 'meeting_url'), false);

  const calendarEvent = await registry.execute('open_calendar_event', {
    event_id: 44,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(calendarEvent.tool, 'open_calendar_event');
  assert.equal(calendarEvent.data.event.id, 44);
  assert.equal(calendarEvent.data.event.meeting_url_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(calendarEvent.data.event, 'meeting_url'), false);

  const emailLog = await registry.execute('view_email_log', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(emailLog.tool, 'view_email_log');
  assert.equal(emailLog.data.emails[0].body_returned, false);
  assert.equal(emailLog.data.emails[0].from.email_domain, 'example.com');
  assert.equal(emailLog.data.emails[0].from.address_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(emailLog.data.emails[0], 'body_text'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(emailLog.data.emails[0].from, 'address'), false);

  const communicationHistory = await registry.execute('show_contact_communication_history', {
    email: 'parent@example.com',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(communicationHistory.tool, 'show_contact_communication_history');
  assert.equal(communicationHistory.data.body_returned, false);
  assert.equal(communicationHistory.data.communications[0].raw_message_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(communicationHistory.data.communications[0], 'body_text'), false);

  const providerLeads = await registry.execute('list_provider_leads', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(providerLeads.tool, 'list_provider_leads');
  assert.equal(providerLeads.data.leads[0].parent_name, 'Parent One');
  assert.equal(providerLeads.data.leads[0].student_name, 'Student One');
  assert.equal(providerLeads.data.leads[0].email_domain, 'example.com');
  assert.equal(providerLeads.data.leads[0].communication_count, 3);
  assert.equal(providerLeads.data.leads[0].parent_email_returned, false);
  assert.equal(providerLeads.data.leads[0].parent_phone_returned, false);
  assert.equal(providerLeads.data.leads[0].notes_returned, false);
  assert.equal(providerLeads.data.leads[0].raw_contact_export_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(providerLeads.data.leads[0], 'parent_email'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(providerLeads.data.leads[0], 'parent_phone'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(providerLeads.data.leads[0], 'notes'), false);

  const contentItem = await registry.execute('open_content_item_url', {
    content_id: 9,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(contentItem.tool, 'open_content_item_url');
  assert.equal(contentItem.data.content_item.media_url_present, true);
  assert.equal(contentItem.data.content_item.media_url_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(contentItem.data.content_item, 'media_url'), false);

  const students = await registry.execute('list_students', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(students.tool, 'list_students');
  assert.equal(students.data.students[0].name, 'Student One');
  assert.equal(students.data.students[0].parent_contact_returned, false);
  assert.equal(students.data.students[0].student_access_code_returned, false);
  assert.equal(students.data.students[0].private_notes_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(students.data.students[0], 'parent_email'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(students.data.students[0], 'parent_phone'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(students.data.students[0], 'student_access_code'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(students.data.students[0], 'notes'), false);

  const parentStudents = await registry.execute('show_parent_students', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(parentStudents.tool, 'show_parent_students');
  assert.equal(parentStudents.data.students[0].parent_contact_returned, false);

  const assignments = await registry.execute('show_my_assignments', {
    student_id: 11,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(assignments.tool, 'show_my_assignments');
  assert.equal(assignments.data.assignments[0].worksheet_returned, false);
  assert.equal(assignments.data.assignments[0].raw_instructions_returned, false);
  assert.equal(assignments.data.assignments[0].material_url_present, true);
  assert.equal(assignments.data.assignments[0].material_url_returned, false);
  assert.equal(assignments.data.assignments[0].youtube_url_returned, false);
  assert.equal(assignments.data.assignments[0].classroom_link_returned, false);
  assert.equal(assignments.data.assignments[0].calendar_link_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(assignments.data.assignments[0], 'worksheet_body'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(assignments.data.assignments[0], 'raw_instructions'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(assignments.data.assignments[0], 'material_url'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(assignments.data.assignments[0], 'youtube_url'), false);

  const goals = await registry.execute('show_my_goals', {
    student_id: 11,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(goals.tool, 'show_my_goals');
  assert.equal(goals.data.goals[0].raw_notes_returned, false);
  assert.equal(goals.data.goals[0].private_goal_metadata_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(goals.data.goals[0], 'notes'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(goals.data.goals[0], 'metadata'), false);

  const progress = await registry.execute('show_student_progress_for_parent', {
    student_id: 11,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(progress.tool, 'show_student_progress_for_parent');
  assert.equal(progress.data.audience, 'parent');
  assert.equal(progress.data.parent_contact_returned, false);
  assert.equal(progress.data.student_access_code_returned, false);
  assert.equal(progress.data.private_notes_returned, false);
  assert.equal(progress.data.assignments[0].material_url_returned, false);
  assert.equal(progress.data.goals[0].raw_notes_returned, false);

  const childCalendar = await registry.execute('show_child_calendar', {
    student_id: 11,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(childCalendar.tool, 'show_child_calendar');
  assert.equal(childCalendar.data.events[0].meeting_url_present, true);
  assert.equal(childCalendar.data.events[0].meeting_url_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(childCalendar.data.events[0], 'meeting_url'), false);

  const parentVisibleNotes = await registry.execute('view_parent_visible_notes', {
    student_id: 11,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(parentVisibleNotes.tool, 'view_parent_visible_notes');
  assert.equal(parentVisibleNotes.data.notes[0].note_preview, 'Student practiced six Mishnayos.');
  assert.equal(parentVisibleNotes.data.notes[0].raw_notes_returned, false);
  assert.equal(parentVisibleNotes.data.notes[0].private_metadata_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(parentVisibleNotes.data.notes[0], 'notes'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(parentVisibleNotes.data.notes[0], 'metadata'), false);

  const previewQueryStart = executedQueries.length;
  const launchPreview = await registry.execute('calendar_batch_launch_plan_preview', {
    program: 'One Time Mishnayos launch',
    start_date: '2026-08-01',
    weeks: 8,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(launchPreview.tool, 'calendar_batch_launch_plan_preview');
  assert.equal(launchPreview.data.delegated_action_id, 'calendar_batch_launch_plan_preview');
  assert.equal(launchPreview.data.preview.executed, false);
  assert.equal(launchPreview.data.preview.dry_run_only, true);
  assert.equal(launchPreview.data.preview.external_write_performed, false);
  assert.equal(launchPreview.data.preview.google_calendar_write_performed, false);
  assert.equal(launchPreview.data.preview.item_count > 0, true);

  const classroomPreview = await registry.execute('classroom_topic_material_preview', {
    course_name: 'One Time private class',
    topic_name: 'Week 1',
    material_title: 'Reviewed class material',
    material_url: 'https://classroom.example/private-material',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(classroomPreview.data.preview.classroom_topic_material_preview_created, true);
  assert.equal(classroomPreview.data.preview.classroom_read_performed, false);
  assert.equal(classroomPreview.data.preview.classroom_write_performed, false);
  assert.equal(classroomPreview.data.preview.raw_urls_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(classroomPreview.data.preview, 'material_url'), false);

  const driveFindPreview = await registry.execute('google_drive_find_file_preview', {
    query: 'Mishnah Peah recording',
    folder_id: 'private-folder-id',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(driveFindPreview.data.preview.drive_action, 'find_or_list_files');
  assert.equal(driveFindPreview.data.preview.external_read_performed, false);
  assert.equal(driveFindPreview.data.preview.raw_external_ids_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(driveFindPreview.data.preview, 'folder_id'), false);

  const driveDocPreview = await registry.execute('google_drive_create_doc_preview', {
    title: 'Class summary draft',
    body: 'Private body should not return',
    folder_id: 'private-folder-id',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(driveDocPreview.data.preview.drive_action, 'create_google_doc');
  assert.equal(driveDocPreview.data.preview.body_preview_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(driveDocPreview.data.preview, 'body_preview'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(driveDocPreview.data.preview, 'folder_id'), false);

  const driveFolderPreview = await registry.execute('google_drive_create_folder_preview', {
    folder_name: 'One Time class summaries',
    parent_folder_id: 'private-parent-folder-id',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(driveFolderPreview.data.preview.drive_action, 'create_folder');
  assert.equal(driveFolderPreview.data.preview.raw_external_ids_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(driveFolderPreview.data.preview, 'parent_folder_id'), false);

  const businessPlacePreview = await registry.execute('google_business_place_id_lookup', {
    query: 'Rabbi Scheller One Time',
    google_maps_url: 'https://maps.google.com/?cid=private',
    google_place_id: 'private-place-id',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(businessPlacePreview.data.preview.connector, 'google_business_profile');
  assert.equal(businessPlacePreview.data.preview.live_google_api_used, false);
  assert.equal(businessPlacePreview.data.preview.external_read_performed, false);
  assert.equal(businessPlacePreview.data.preview.raw_external_ids_returned, false);
  assert.equal(businessPlacePreview.data.preview.raw_urls_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(businessPlacePreview.data.preview, 'google_place_id'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(businessPlacePreview.data.preview, 'google_business_profile_url'), false);

  const businessLocationsPreview = await registry.execute('google_business_list_locations_preview', {
    provider_name: 'Rabbi Scheller / One Time',
    account_id: 'private-account-id',
    location_id: 'private-location-id',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(businessLocationsPreview.data.preview.connector, 'google_business_profile');
  assert.equal(businessLocationsPreview.data.preview.live_google_api_used, false);
  assert.equal(businessLocationsPreview.data.preview.external_read_performed, false);
  assert.equal(businessLocationsPreview.data.preview.raw_external_ids_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(businessLocationsPreview.data.preview, 'account_id'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(businessLocationsPreview.data.preview, 'location_id'), false);

  const calendarDraft = await registry.execute('create_calendar_event_draft', {
    title: 'Week 1 Mishnah class',
    start_at: '2026-08-01T19:00:00+03:00',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(calendarDraft.data.delegated_action_id, 'create_calendar_event');
  assert.equal(calendarDraft.data.preview.executed, false);
  assert.equal(calendarDraft.data.preview.dry_run_only, true);
  assert.equal(calendarDraft.data.preview.internal_calendar_write_performed, false);
  assert.equal(calendarDraft.data.preview.google_calendar_write_performed, false);
  assert.equal(calendarDraft.data.preview.title, 'Week 1 Mishnah class');

  const calendarUpdateDraft = await registry.execute('update_calendar_event_draft', {
    event_id: 44,
    start_at: '2026-08-02T19:00:00+03:00',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(calendarUpdateDraft.data.delegated_action_id, 'update_calendar_event');
  assert.equal(calendarUpdateDraft.data.preview.executed, false);
  assert.equal(calendarUpdateDraft.data.preview.internal_calendar_write_performed, false);
  assert.equal(calendarUpdateDraft.data.preview.google_calendar_write_performed, false);

  const shoutoutDraft = await registry.execute('create_shoutout_draft', {
    student_id: 11,
    message: 'Great review effort this week.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(shoutoutDraft.data.local_draft_only, true);
  assert.equal(shoutoutDraft.data.preview.no_publish, true);
  assert.equal(shoutoutDraft.data.preview.external_publish_performed, false);
  assert.equal(shoutoutDraft.data.preview.parent_visible_after_approval, true);

  const distilledRamble = await registry.execute('distill_ramble', {
    raw_text: 'Goal mode: scope the Rabbi bot to One Time tasks only and block BNA data.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(distilledRamble.data.preview.ramble_distilled, true);
  assert.equal(distilledRamble.data.preview.raw_text_returned, false);
  assert.equal(distilledRamble.data.preview.raw_private_body_returned, false);

  const automationDraft = await registry.execute('draft_automation', {
    message: 'When a parent signs up, draft a welcome follow-up task.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(automationDraft.data.delegated_action_id, 'draft_automation');
  assert.equal(automationDraft.data.preview.enabled, false);
  assert.equal(automationDraft.data.preview.external_send_performed, false);

  const dripDraft = await registry.execute('draft_drip_sequence', {
    goal: 'Welcome new One Time parents',
    message_count: 3,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(dripDraft.data.delegated_action_id, 'draft_drip_sequence');
  assert.equal(dripDraft.data.preview.drip_sequence_draft_created, true);
  assert.equal(dripDraft.data.preview.message_count, 3);
  assert.equal(dripDraft.data.preview.external_send_performed, false);

  const campaignDraft = await registry.execute('draft_email_campaign', {
    goal: 'Invite interested One Time parents',
    segment_name: 'One Time interested parents',
    subject: 'One Time Mishnayos',
    body: 'Join the class after review.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(campaignDraft.data.delegated_action_id, 'draft_email_campaign');
  assert.equal(campaignDraft.data.preview.campaign_draft_created, true);
  assert.equal(campaignDraft.data.preview.ready_for_live_send, false);
  assert.equal(campaignDraft.data.preview.external_send_performed, false);
  assert.equal(campaignDraft.data.preview.audience.contact_rows_returned, false);

  const newsletterEmailDraft = await registry.execute('draft_email_from_newsletter', {
    newsletter_body: 'This week we reviewed Peah.',
    subject: 'Weekly One Time update',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(newsletterEmailDraft.data.delegated_action_id, 'draft_email_from_newsletter');
  assert.equal(newsletterEmailDraft.data.preview.email_draft_created, true);
  assert.equal(newsletterEmailDraft.data.preview.sent, false);
  assert.equal(newsletterEmailDraft.data.preview.raw_private_body_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(newsletterEmailDraft.data.preview, 'body'), false);

  const landingDraft = await registry.execute('draft_mishnayos_landing_page', {
    prompt: 'Draft a One Time landing page for parents.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(landingDraft.data.preview.landing_page_draft_created, true);
  assert.equal(landingDraft.data.preview.brand_scope, 'one_time_black_yellow');
  assert.equal(landingDraft.data.preview.public_page_changed, false);

  const latestNewsletter = await registry.execute('find_latest_newsletter_draft', {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(latestNewsletter.data.delegated_action_id, 'find_latest_newsletter_draft');
  assert.equal(typeof latestNewsletter.data.action_success, 'boolean');
  assert.equal(typeof latestNewsletter.data.preview.newsletter_found, 'boolean');
  assert.equal(latestNewsletter.data.preview.body_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(latestNewsletter.data.preview, 'body'), false);

  const socialDraft = await registry.execute('generate_social_posts_from_newsletter', {
    newsletter_body: 'Class recap for parents.',
    channels: ['facebook', 'linkedin'],
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(socialDraft.data.delegated_action_id, 'generate_social_posts_from_newsletter');
  assert.equal(socialDraft.data.preview.social_drafts_created, true);
  assert.equal(socialDraft.data.preview.published, false);
  assert.equal(socialDraft.data.preview.external_publish_performed, false);

  const worksheetDraft = await registry.execute('generate_student_worksheet', {
    student_id: 11,
    assignment_id: 22,
    topic: 'Mishnah Peah',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(worksheetDraft.data.preview.worksheet_draft_created, true);
  assert.equal(worksheetDraft.data.preview.worksheet_body_returned, false);
  assert.equal(worksheetDraft.data.preview.student_access_code_returned, false);
  assert.equal(worksheetDraft.data.preview.official_assignment_mutated, false);

  const segmentPreview = await registry.execute('preview_campaign_segment', {
    segment_name: 'One Time interested parents',
    estimated_count: 20,
    consent_count: 18,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(segmentPreview.data.delegated_action_id, 'preview_campaign_segment');
  assert.equal(segmentPreview.data.preview.segment_preview_created, true);
  assert.equal(segmentPreview.data.preview.audience.contact_rows_returned, false);
  assert.equal(segmentPreview.data.preview.external_send_performed, false);

  const refinedEmail = await registry.execute('refine_email', {
    body: 'hello parents',
    instruction: 'Make it warmer.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(refinedEmail.data.delegated_action_id, 'refine_email');
  assert.equal(refinedEmail.data.preview.email_refined, true);
  assert.equal(refinedEmail.data.preview.sent, false);
  assert.equal(Object.prototype.hasOwnProperty.call(refinedEmail.data.preview, 'body'), false);

  const refinedNewsletter = await registry.execute('refine_newsletter_draft', {
    draft_body: 'This week was great.',
    instruction: 'Make it clearer for parents.',
    save_revision: false,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(refinedNewsletter.data.delegated_action_id, 'refine_newsletter_draft');
  assert.equal(refinedNewsletter.data.preview.newsletter_refined, true);
  assert.equal(refinedNewsletter.data.preview.saved, false);
  assert.equal(refinedNewsletter.data.preview.raw_private_body_returned, false);
  assert.equal(Object.prototype.hasOwnProperty.call(refinedNewsletter.data.preview, 'revised_body'), false);

  const adminMessageDraft = await registry.execute('draft_message_to_admin', {
    message: 'A parent has a question about the next class.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(adminMessageDraft.data.preview.admin_message_draft_created, true);
  assert.equal(adminMessageDraft.data.preview.sent, false);
  assert.equal(adminMessageDraft.data.preview.parent_impersonation_performed, false);
  assert.equal(adminMessageDraft.data.preview.raw_private_body_returned, false);

  const assertScopedInternalPreview = (result) => {
    assert.equal(result.data.scope.workspace_key, 'rabbi_sheller_provider');
    assert.equal(result.data.scope.project_key, 'one_time_mishnah_class');
    assert.equal(result.data.preview.workspace_key, 'rabbi_sheller_provider');
    assert.equal(result.data.preview.project_key, 'one_time_mishnah_class');
    assert.equal(result.data.preview.executed, false);
    assert.equal(result.data.preview.internal_write_performed, false);
    assert.equal(result.data.preview.external_write_performed, false);
    assert.equal(result.data.preview.external_send_performed, false);
    assert.equal(result.data.preview.external_publish_performed, false);
    assert.equal(result.data.preview.payment_or_access_change_performed, false);
    assert.equal(result.data.preview.credential_write_performed, false);
    assert.equal(result.data.preview.raw_private_body_returned, false);
    assert.equal(result.data.preview.raw_contact_export_returned, false);
    assert.equal(result.data.preview.raw_urls_returned, false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'body'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'message'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'note'), false);
  };

  const decisionOption = await registry.execute('add_decision_option', {
    task_id: 44,
    option_label: 'Hybrid path',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(decisionOption.data.delegated_action_id, 'add_decision_option');
  assert.equal(decisionOption.data.approval_required, true);
  assert.equal(decisionOption.data.preview.option_label, 'Hybrid path');
  assert.equal(decisionOption.data.preview.next_options_returned, false);
  assertScopedInternalPreview(decisionOption);

  const timelineNote = await registry.execute('add_timeline_note', {
    note: 'Private parent note should not return raw.',
    related_type: 'task',
    related_id: 44,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(timelineNote.data.delegated_action_id, 'add_timeline_note');
  assert.equal(timelineNote.data.preview.note_preview_returned, false);
  assertScopedInternalPreview(timelineNote);

  const createdInternalEvent = await registry.execute('create_calendar_event', {
    title: 'One Time review',
    start_at: '2026-08-04T19:00:00+03:00',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(createdInternalEvent.data.delegated_action_id, 'create_calendar_event');
  assert.equal(createdInternalEvent.data.preview.title, 'One Time review');
  assert.equal(createdInternalEvent.data.preview.google_calendar_write_performed, false);
  assertScopedInternalPreview(createdInternalEvent);

  const updatedInternalEvent = await registry.execute('update_calendar_event', {
    event_id: 44,
    start_at: '2026-08-05T19:00:00+03:00',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(updatedInternalEvent.data.delegated_action_id, 'update_calendar_event');
  assert.equal(updatedInternalEvent.data.preview.event_id, 44);
  assert.equal(updatedInternalEvent.data.preview.google_calendar_write_performed, false);
  assertScopedInternalPreview(updatedInternalEvent);

  const parentVisibleEvent = await registry.execute('create_parent_visible_event', {
    title: 'Class reminder',
    start_at: '2026-08-06T19:00:00+03:00',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(parentVisibleEvent.data.delegated_action_id, 'create_calendar_event');
  assert.equal(parentVisibleEvent.data.approval_required, true);
  assert.equal(parentVisibleEvent.data.preview.visibility, 'parent');
  assert.equal(parentVisibleEvent.data.preview.source, 'rabbi_helper_internal');
  assertScopedInternalPreview(parentVisibleEvent);

  const adminOnlyEvent = await registry.execute('mark_event_admin_only', {
    event_id: 44,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(adminOnlyEvent.data.delegated_action_id, 'mark_event_admin_only');
  assert.equal(adminOnlyEvent.data.preview.visibility, 'internal');
  assertScopedInternalPreview(adminOnlyEvent);

  const providerClassSession = await registry.execute('create_provider_class_session', {
    title: 'Week 2',
    start_at: '2026-08-07T19:00:00+03:00',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(providerClassSession.data.delegated_action_id, 'create_provider_class_session');
  assert.equal(providerClassSession.data.preview.visibility, 'provider');
  assert.equal(providerClassSession.data.preview.related_type, 'class_session');
  assertScopedInternalPreview(providerClassSession);

  const referralLedger = await registry.execute('create_referral_ledger_entry', {
    title: 'Sarah referral',
    notes: 'Private referral details should not return raw.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(referralLedger.data.delegated_action_id, 'create_referral_ledger_entry');
  assert.equal(referralLedger.data.approval_required, true);
  assert.equal(referralLedger.data.preview.no_send, true);
  assert.equal(referralLedger.data.preview.referral_link_created, false);
  assert.equal(referralLedger.data.preview.reward_created, false);
  assert.equal(referralLedger.data.preview.lead_contact_fields_returned, false);
  assertScopedInternalPreview(referralLedger);

  const providerContact = await registry.execute('request_provider_contact', {
    provider_id: 7,
    message: 'Private callback request should not return raw.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(providerContact.data.delegated_action_id, 'request_provider_contact');
  assert.equal(providerContact.data.preview.provider_id, 7);
  assert.equal(providerContact.data.preview.live_send_performed, false);
  assert.equal(providerContact.data.preview.request_body_returned, false);
  assertScopedInternalPreview(providerContact);

  const retitledTask = await registry.execute('retitle_task_naturally', {
    task_id: 44,
    new_title: 'Verify One Time calendar',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(retitledTask.data.delegated_action_id, 'retitle_task_naturally');
  assert.equal(retitledTask.data.approval_required, true);
  assert.equal(retitledTask.data.preview.next_title, 'Verify One Time calendar');
  assert.equal(retitledTask.data.preview.raw_previous_title_copied, false);
  assertScopedInternalPreview(retitledTask);

  const taskStage = await registry.execute('update_task_stage', {
    task_id: 44,
    stage: 'in_progress',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(taskStage.data.delegated_action_id, 'update_task_stage');
  assert.equal(taskStage.data.preview.stage, 'in_progress');
  assertScopedInternalPreview(taskStage);

  const agentResult = await registry.execute('record_agent_result', {
    task_id: 44,
    summary: 'PASS scoped smoke completed.',
    status: 'PASS',
    evidence: ['ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json'],
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    dry_run: true,
  }, context, db);
  assert.equal(agentResult.data.delegated_action_id, 'record_agent_result');
  assert.equal(agentResult.data.preview.task_id, 44);
  assert.equal(agentResult.data.preview.result_packet_returned, false);
  assert.equal(agentResult.data.preview.summary_body_returned, false);
  assertScopedInternalPreview(agentResult);

  const videoLibraryItem = await registry.execute('create_one_time_video_library_item', {
    title: 'Week 3 recording',
    source_url: 'https://drive.example/private-video',
    transcript_text: 'Private transcript text should not return raw.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(videoLibraryItem.data.delegated_action_id, 'create_one_time_video_library_item');
  assert.equal(videoLibraryItem.data.approval_required, true);
  assert.equal(videoLibraryItem.data.preview.title, 'Week 3 recording');
  assert.equal(videoLibraryItem.data.preview.source_url_returned, false);
  assert.equal(videoLibraryItem.data.preview.media_url_returned, false);
  assert.equal(videoLibraryItem.data.preview.transcript_text_returned, false);
  assertScopedInternalPreview(videoLibraryItem);

  const moderatedQuestion = await registry.execute('submit_student_question_for_moderation', {
    question_text: 'Why does the Mishnah begin here?',
    student_id: 11,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(moderatedQuestion.data.delegated_action_id, 'submit_student_question_for_moderation');
  assert.equal(moderatedQuestion.data.approval_required, true);
  assert.equal(moderatedQuestion.data.preview.question_text_returned, false);
  assert.equal(moderatedQuestion.data.preview.public_post_created, false);
  assert.equal(moderatedQuestion.data.preview.response_sent, false);
  assertScopedInternalPreview(moderatedQuestion);

  const newsletterRevision = await registry.execute('save_newsletter_revision', {
    body: 'Private newsletter body should not return raw.',
    title: 'Weekly One Time update',
    source_output_id: 41,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(newsletterRevision.data.delegated_action_id, 'save_newsletter_revision');
  assert.equal(newsletterRevision.data.approval_required, true);
  assert.equal(newsletterRevision.data.preview.body_preview_returned, false);
  assert.equal(newsletterRevision.data.preview.body_returned, false);
  assert.equal(newsletterRevision.data.preview.sent, false);
  assertScopedInternalPreview(newsletterRevision);

  const weeklyHero = await registry.execute('select_weekly_update_hero', {
    update_id: 8,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(weeklyHero.data.delegated_action_id, 'select_weekly_update_hero');
  assert.equal(weeklyHero.data.approval_required, true);
  assert.equal(weeklyHero.data.preview.update_id, 8);
  assert.equal(weeklyHero.data.preview.parent_notification_sent, false);
  assert.equal(weeklyHero.data.preview.raw_update_body_returned, false);
  assertScopedInternalPreview(weeklyHero);

  const providerProfile = await registry.execute('update_provider_profile', {
    provider_id: 7,
    display_name: 'Rabbi Scheller One Time',
    summary: 'Private profile summary should not return raw.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(providerProfile.data.delegated_action_id, 'update_provider_profile');
  assert.equal(providerProfile.data.approval_required, true);
  assert.equal(providerProfile.data.preview.provider_id, 7);
  assert.equal(providerProfile.data.preview.summary_returned, false);
  assert.equal(providerProfile.data.preview.public_publish_performed, false);
  assertScopedInternalPreview(providerProfile);

  const googleBusinessLink = await registry.execute('capture_provider_google_business_link', {
    provider_id: 7,
    google_business_profile_url: 'https://maps.google.com/?cid=12345',
    google_place_id: 'private-place-id',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, context, db);
  assert.equal(googleBusinessLink.data.delegated_action_id, 'capture_provider_google_business_link');
  assert.equal(googleBusinessLink.data.approval_required, true);
  assert.equal(googleBusinessLink.data.preview.provider_id, 7);
  assert.equal(googleBusinessLink.data.preview.live_google_api_used, false);
  assert.equal(googleBusinessLink.data.preview.google_business_profile_url_returned, false);
  assert.equal(googleBusinessLink.data.preview.google_place_id_returned, false);
  assertScopedInternalPreview(googleBusinessLink);

  const assertLocalScopedRequest = (result) => {
    assert.equal(result.data.local_scope_request_only, true);
    assert.equal(result.data.scope.workspace_key, 'rabbi_sheller_provider');
    assert.equal(result.data.scope.project_key, 'one_time_mishnah_class');
    assert.equal(result.data.preview.local_scope_request_created, true);
    assert.equal(result.data.preview.workspace_key, 'rabbi_sheller_provider');
    assert.equal(result.data.preview.project_key, 'one_time_mishnah_class');
    assert.equal(result.data.preview.official_record_mutated, false);
    assert.equal(result.data.preview.local_database_write_performed, false);
    assert.equal(result.data.preview.external_read_performed, false);
    assert.equal(result.data.preview.body_returned, false);
    assert.equal(result.data.preview.note_returned, false);
    assert.equal(result.data.preview.question_text_returned, false);
    assert.equal(result.data.preview.transcript_text_returned, false);
    assert.equal(result.data.preview.private_payload_returned, false);
    assert.equal(result.data.preview.raw_machine_payload_returned, false);
    assert.equal(result.data.preview.drive_file_id_returned, false);
    assert.equal(result.data.preview.drive_url_returned, false);
    assert.equal(result.data.preview.access_reset_performed, false);
    assert.equal(result.data.preview.login_reset_performed, false);
    assert.equal(result.data.preview.student_access_code_returned, false);
    assert.equal(result.data.preview.parent_notification_sent, false);
    assert.equal(result.data.preview.public_post_created, false);
    assert.equal(result.data.preview.sent, false);
    assert.equal(result.data.preview.published, false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'body'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'note'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'question_text'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'transcript_text'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'drive_file_id'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'drive_url'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result.data.preview, 'student_access_code'), false);
    assertScopedInternalPreview(result);
  };

  for (const toolName of RABBI_LOCAL_SCOPE_PRIMITIVE_TOOLS) {
    const result = await registry.execute(toolName, RABBI_LOCAL_SCOPE_PRIMITIVE_ARGS, context, db);
    assert.equal(result.tool, toolName);
    assertLocalScopedRequest(result);
    if (RABBI_LOCAL_SCOPE_APPROVAL_TOOLS.has(toolName)) {
      assert.equal(result.data.approval_required, true);
      assert.match(result.data.preview.status, /^approval_required_before_/);
    }
  }

  await assert.rejects(
    () => registry.execute('draft_email_campaign', {
      goal: 'Cross scope campaign',
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }, context, db),
    /workspace scope mismatch/
  );
  assert.ok(
    executedQueries.filter((query) => /INSERT INTO bna_bot_action_logs/i.test(query.sql)).length >= 7,
    'preview wrappers should write local action audit rows only'
  );
  assert.ok(
    executedQueries.slice(previewQueryStart).every((query) => !/google_|classroom|drive/i.test(query.sql) || /bna_bot_action_logs/i.test(query.sql)),
    'preview wrappers must not query Google/Classroom/Drive tables in helper tests'
  );

  await assert.rejects(
    () => registry.execute('create_rabbi_source_sheet_task', {
      title: 'Cross scope source sheet',
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }, context, db),
    /workspace scope mismatch/
  );
  await assert.rejects(
    () => registry.execute('open_calendar_event', {
      event_id: 44,
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }, context, db),
    /workspace scope mismatch/
  );
  await assert.rejects(
    () => registry.execute('list_students', {
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }, context, db),
    /workspace scope mismatch/
  );
  await assert.rejects(
    () => registry.execute('google_drive_find_file_preview', {
      query: 'Cross-scope Drive search',
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }, context, db),
    /workspace scope mismatch/
  );
  await assert.rejects(
    () => registry.execute('update_task_stage', {
      task_id: 44,
      stage: 'in_progress',
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
      dry_run: true,
    }, context, db),
    /workspace scope mismatch/
  );
  await assert.rejects(
    () => registry.execute('create_assignment', {
      ...RABBI_LOCAL_SCOPE_PRIMITIVE_ARGS,
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
    }, context, db),
    /workspace scope mismatch/
  );
  await assert.rejects(
    () => registry.execute('move_task_workspace', {
      ...RABBI_LOCAL_SCOPE_PRIMITIVE_ARGS,
      target_workspace_key: 'bna',
      target_project_key: 'one_time_mishnah_class',
    }, context, db),
    /target workspace scope mismatch/
  );
  await assert.rejects(
    () => registry.execute('draft_parent_response', {
      body: 'Cross scope parent draft',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'bna',
    }, context, db),
    /project scope mismatch/
  );
  assert.ok(executedQueries.every((query) => !/bna_email_log/i.test(query.sql)), 'read-only email wrapper should use scoped communications, not unscoped legacy email log');
});

test('BNA Helper planner resolves explicit typed actions before hosted AI', async () => {
  const registry = buildToolRegistry();
  const previousApiKey = process.env.OPENAI_API_KEY;
  const previousFetch = global.fetch;
  let fetchCalled = false;
  process.env.OPENAI_API_KEY = 'sk-dummy-helper-navigation'; // watchdog-secret-scan: allow-placeholder
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error('AI planner should not be called for explicit navigation');
  };
  try {
    const plan = await buildHelperPlan('decisions', registry, { projectKey: 'bna' });
    assert.equal(fetchCalled, false);
    assert.equal(plan.actions[0].tool, 'open_operations_view');
    assert.deepEqual(plan.actions[0].args, { view: 'tasks', section: 'decisions' });

    const ticketPlan = await buildHelperPlan('report problem the task page button looks wrong', registry, {
      projectKey: 'bna',
    });
    assert.equal(fetchCalled, false);
    assert.equal(ticketPlan.actions[0].tool, 'create_support_ticket');
    assert.equal(ticketPlan.actions[0].args.category, 'link');
    assert.equal(ticketPlan.actions[0].args.severity, 'normal');

    const performanceTicketPlan = await buildHelperPlan('the backend is laggy and takes forever to open pages', registry, {
      projectKey: 'bna',
    });
    assert.equal(fetchCalled, false);
    assert.equal(performanceTicketPlan.actions[0].tool, 'create_support_ticket');
    assert.equal(performanceTicketPlan.actions[0].args.category, 'other');
  } finally {
    if (previousApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousApiKey;
    global.fetch = previousFetch;
  }
});

test('BNA Helper open_operations_view returns a direct deep link', async () => {
  const registry = buildToolRegistry();
  const result = await registry.execute(
    'open_operations_view',
    { view: 'settings', section: 'calendar_classroom', workspace_key: 'bna' },
    { userRole: 'admin', projectKey: 'bna', identity: { role: 'admin', scope: { type: 'all' } } }
  );

  assert.equal(result.tool, 'open_operations_view');
  assert.equal(result.url, '/operations?view=settings&section=calendar_classroom&workspace=bna');
  assert.equal(result.label, 'Open settings / calendar_classroom');
});

test('BNA Helper destination resolver refuses unsafe scope and route substitutions', () => {
  const providerActor = {
    role: 'provider_admin',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    scope: { type: 'provider', providerId: 'provider-1' },
  };

  const providerToBnaOperations = resolveHelperDestination({
    intent: 'open_operations_view',
    actor: providerActor,
    target: { view: 'tasks', workspace_key: 'bna' },
    helperTool: 'open_operations_view',
  });
  assert.equal(providerToBnaOperations.ok, false);
  assert.match(providerToBnaOperations.authorization_result, /workspace_scope_mismatch/);
  assert.equal(providerToBnaOperations.fallback.path, '/provider');
  assert.equal(providerToBnaOperations.checks.browser_click_substitution_allowed, false);

  const externalRoute = resolveHelperDestination({
    intent: 'open_operations_view',
    actor: providerActor,
    target: { route: 'https://example.invalid/steal-data' },
    helperTool: 'open_operations_view',
  });
  assert.equal(externalRoute.ok, false);
  assert.match(externalRoute.authorization_result, /non_same_origin_or_invalid_route/);
  assert.equal(externalRoute.attempted_path, null);
  assert.equal(externalRoute.fallback.path, '/provider');

  const parentToOperations = resolveHelperDestination({
    intent: 'open_operations_view',
    actor: {
      role: 'parent',
      workspace_key: 'bna',
      project_key: 'bna',
      scope: { type: 'parent', familyId: 'family-1' },
    },
    target: { view: 'admin', workspace_key: 'bna' },
    helperTool: 'open_operations_view',
  });
  assert.equal(parentToOperations.ok, false);
  assert.match(parentToOperations.authorization_result, /role_not_allowed/);
  assert.equal(parentToOperations.fallback.path, '/parent');

  const studentToOperations = resolveHelperDestination({
    intent: 'open_operations_view',
    actor: {
      role: 'student',
      workspace_key: 'bna',
      project_key: 'bna',
      scope: { type: 'student', studentId: 'student-1' },
    },
    target: { view: 'tasks', workspace_key: 'bna' },
    helperTool: 'open_operations_view',
  });
  assert.equal(studentToOperations.ok, false);
  assert.match(studentToOperations.authorization_result, /role_not_allowed/);
  assert.equal(studentToOperations.fallback.path, '/student');
});

test('BNA Helper execution keeps One Time helpers out of BNA workspace links', async () => {
  const registry = buildToolRegistry();
  const oneTimeContext = {
    userRole: 'one_time_admin',
    workspaceKey: 'rabbi_sheller_provider',
    projectKey: 'one_time_mishnah_class',
    identity: {
      role: 'one_time_admin',
      scope: {
        type: 'project',
        workspaceKey: 'rabbi_sheller_provider',
        projectKey: 'one_time_mishnah_class',
      },
    },
    helperScope: {
      scopeType: 'rabbi',
      workspaceKey: 'rabbi_sheller_provider',
    },
  };

  await assert.rejects(
    () => registry.execute('open_operations_view', { view: 'tasks', workspace_key: 'bna' }, oneTimeContext),
    /workspace scope mismatch/
  );

  const scopedResult = await registry.execute(
    'open_operations_view',
    { view: 'tasks', workspace_key: 'rabbi_sheller_provider' },
    oneTimeContext
  );
  assert.equal(scopedResult.status, 'blocked');
  assert.equal(scopedResult.url, '/provider');
  assert.match(scopedResult.data.destination.authorization_result, /role_not_allowed/);
  assert.equal(scopedResult.data.destination.checks.browser_click_substitution_allowed, false);
});

test('Operations exposes the HELPER-03 helper drawer, scoped context, and client endpoint calls', () => {
  assert.match(operations, /getHelperContext\(\) \{ return this\.request\('GET', '\/helper\/context'\); \}/);
  assert.match(operations, /getHelperTools\(\) \{ return this\.request\('GET', '\/helper\/tools'\); \}/);
  assert.match(operations, /getHelperProfile\(\) \{ return this\.request\('GET', '\/helper\/profile'\); \}/);
  assert.match(operations, /saveHelperQuestionnaire\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/profile\/questionnaire', payload\); \}/);
  assert.match(operations, /getHelperKnowledge\(limit = 20\)/);
  assert.match(operations, /sendHelperMessage\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/message', payload\); \}/);
  assert.match(operations, /confirmHelperAction\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/confirm', payload\); \}/);
  assert.match(operations, /getHelperRun\(id\) \{ return this\.request\('GET', '\/helper\/runs\/' \+ encodeURIComponent\(id\)\); \}/);
  assert.match(operations, /planHelperAction\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/plan', payload\); \}/);
  assert.match(operations, /executeHelperPlan\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/execute', payload\); \}/);
  assert.match(operations, /function helperVisibleFilters/);
  assert.match(operations, /function helperSelectedRecord/);
  assert.match(operations, /function helperAvailableClientActions/);
  assert.match(operations, /'open_operations_view'/);
  assert.match(operations, /'create_support_ticket'/);
  assert.match(operations, /'open_task_detail'/);
  assert.match(operations, /'return_to_task'/);
  assert.match(operations, /'open_decisions'/);
  assert.match(operations, /'open_pending'/);
  assert.match(operations, /'open_task_calendar'/);
  assert.match(operations, /'report_problem'/);
  assert.match(operations, /displayName: workspace\.display_name \|\| workspaceBranding\?\.workspace_name_override/);
  assert.match(operations, /function helperFallbackDisplayName/);
  assert.match(operations, /return 'BNA Operations Helper'/);
  assert.match(operations, /function renderBnaHelperDock/);
  assert.match(operations, /function renderBnaHelperScopeCard/);
  assert.match(operations, /function submitBnaHelperMessage/);
  assert.match(operations, /function executeBnaHelperPlan/);
  assert.match(operations, /api\.getHelperContext\(\)/);
  assert.match(operations, /api\.sendHelperMessage\(/);
  assert.match(operations, /api\.confirmHelperAction\(/);
  assert.match(operations, /data-helper-record-type=\"task\"/);
  assert.match(operations, /data-helper-record-type=\"student\"/);
  assert.match(operations, /data-helper-record-type=\"content_job\"/);
  assert.match(operations, /bna-helper-panel/);
  assert.match(operations, /aria-label=\"\$\{escapeHtml\(displayName\)\}\"/);
  assert.match(operations, /Ask \$\{escapeHtml\(displayName\)\} to open a task, mark done, report a problem/);
  assert.match(operations, /confirmation_text: confirmed \? 'CONFIRM' : ''/);
  assert.match(operations, /if \(bnaHelperOpen\) \{\s*toggleBnaHelper\(false\);/);
  assert.match(operations, /renderAppShell\(errorBanner \+ content \+ renderTaskModal\(\) \+ renderSupportTicketModal\(\)\)/);
});

test('Operations inline scripts still parse with the helper drawer installed', () => {
  const scripts = [...operations.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  assert.ok(scripts.length >= 1, 'Operations should include inline scripts');
  scripts.forEach((script, index) => {
    assert.doesNotThrow(() => new vm.Script(script), `inline script ${index + 1} should parse`);
  });
});
