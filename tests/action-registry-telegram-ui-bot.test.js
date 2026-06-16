const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { listActions, getAction } = require('../src/lib/actions/registry');
const { runAction } = require('../src/lib/actions/runner');
const { checkActionPermission } = require('../src/lib/actions/permissions');
const { classifyTelegramActionRequest } = require('../src/lib/bna/telegram-action-router');
const telegramBridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');

test('action registry exposes required metadata for every action', () => {
  const actions = listActions();
  assert.ok(actions.length >= 30);
  for (const action of actions) {
    assert.ok(action.action_id, 'action_id is required');
    assert.ok(action.label, `${action.action_id} label is required`);
    assert.ok(action.description, `${action.action_id} description is required`);
    assert.ok(action.category, `${action.action_id} category is required`);
    assert.ok(Array.isArray(action.page_contexts), `${action.action_id} page_contexts must be an array`);
    assert.ok(Array.isArray(action.allowed_roles), `${action.action_id} allowed_roles must be an array`);
    assert.ok(Array.isArray(action.allowed_workspaces), `${action.action_id} allowed_workspaces must be an array`);
    assert.ok(Array.isArray(action.required_inputs), `${action.action_id} required_inputs must be an array`);
    assert.ok(Array.isArray(action.optional_inputs), `${action.action_id} optional_inputs must be an array`);
    assert.equal(typeof action.dry_run_supported, 'boolean');
    assert.equal(typeof action.approval_required, 'boolean');
    assert.ok(action.execution_handler, `${action.action_id} execution_handler is required`);
    assert.ok(action.audit_log_event, `${action.action_id} audit_log_event is required`);
    assert.ok(action.success_message, `${action.action_id} success_message is required`);
    assert.ok(action.failure_message, `${action.action_id} failure_message is required`);
    assert.ok(Array.isArray(action.related_routes), `${action.action_id} related_routes must be an array`);
    assert.ok(Array.isArray(action.ui_button_labels), `${action.action_id} ui_button_labels must be an array`);
    assert.ok(Array.isArray(action.telegram_intent_examples), `${action.action_id} telegram_intent_examples must be an array`);
  }
});

test('core Telegram/UI operations are present in the registry', () => {
  for (const actionId of [
    'refine_newsletter_draft',
    'draft_email',
    'create_task',
    'update_task_stage',
    'retitle_task_naturally',
    'add_decision_option',
    'schedule_task_on_date',
    'move_task_workspace',
    'create_calendar_event',
    'create_provider_class_session',
    'show_today_plan',
    'show_child_calendar',
    'create_report_problem_ticket',
    'create_ticket',
    'create_decision',
    'draft_weekly_update',
    'select_weekly_update_hero',
    'generate_student_worksheet',
    'draft_parent_response',
    'post_community_message',
    'request_provider_contact',
    'show_contact_communication_history',
    'capture_provider_google_business_link',
    'google_business_place_id_lookup',
    'google_business_list_locations_preview',
    'preview_social_schedule_package',
    'queue_telegram_report',
    'route_bug_to_codex',
    'send_test_email',
    'sync_google_calendar',
    'calendar_batch_launch_plan_preview',
    'classroom_topic_material_preview',
    'google_drive_find_file_preview',
    'google_drive_create_doc_preview',
    'google_drive_create_folder_preview',
    'google_drive_move_file_preview',
    'create_one_time_video_library_item',
    'preview_one_time_member_library_publish_package',
    'create_rabbi_shiur_idea',
    'create_rabbi_source_sheet_task',
    'create_referral_ledger_entry',
    'submit_student_question_for_moderation',
    'review_moderated_question',
  ]) {
    assert.ok(getAction(actionId), `${actionId} should exist`);
  }
});

test('parent/student problem reports create review tickets without Codex tasks', async () => {
  const result = await runAction({
    action_id: 'create_report_problem_ticket',
    source: 'ui_button',
    inputs: {
      message: 'The parent portal calendar button looks broken on mobile.',
      route: '/parent?section=calendar',
      viewport: { width: 390, height: 844 },
    },
    actor: { user_id: 'parent-local', role: 'parent', workspace_id: 'bna' },
  });
  assert.equal(result.success, true);
  assert.equal(result.executed, true);
  assert.equal(result.result.review_ticket, true);
  assert.equal(result.result.codex_task_created, false);
  assert.equal(result.audit_log.action_id, 'create_report_problem_ticket');
});

test('bot actions route parent/provider requests away from Codex and keep risky sends preview-only', async () => {
  const ticket = await runAction({
    action_id: 'create_ticket',
    source: 'bot',
    inputs: {
      message: 'I need help understanding the provider request status.',
      category: 'student_parent_data',
      route: '/parent',
    },
    actor: { user_id: 'parent-local', role: 'parent', workspace_id: 'bna' },
  });
  assert.equal(ticket.success, true);
  assert.equal(ticket.executed, true);
  assert.equal(ticket.result.no_codex_task_created, true);

  const providerRequest = await runAction({
    action_id: 'request_provider_contact',
    source: 'bot',
    inputs: {
      provider_id: 42,
      student_id: 7,
      message: 'Please ask this provider to contact me about tutoring.',
      preferred_contact_method: 'whatsapp',
    },
    actor: { user_id: 'parent@example.com', role: 'parent', workspace_id: 'bna' },
  });
  assert.equal(providerRequest.success, true);
  assert.equal(providerRequest.executed, true);
  assert.equal(providerRequest.result.live_send_performed, false);
  assert.equal(providerRequest.result.external_booking_owned_by_provider, true);

  const telegramReport = await runAction({
    action_id: 'queue_telegram_report',
    source: 'bot',
    inputs: { message: 'Release smoke completed.' },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(telegramReport.success, true);
  assert.equal(telegramReport.executed, false);
  assert.equal(telegramReport.approval_required, true);
  assert.equal(telegramReport.preview.live_send_performed, false);
});

test('technical bugs require approval before Codex routing while decisions stay in Decisions', async () => {
  const decision = await runAction({
    action_id: 'create_decision',
    source: 'bot',
    inputs: {
      title: 'Should parents see provider discount notes?',
      options: ['Show only approved badges', 'Show all notes'],
      recommendation: 'Show only approved badges.',
    },
    actor: { user_id: 'school-manager-local', role: 'school_manager', workspace_id: 'bna' },
  });
  assert.equal(decision.success, true);
  assert.equal(decision.executed, true);
  assert.equal(decision.result.route, 'Shloimie Decisions');

  const technical = await runAction({
    action_id: 'route_bug_to_codex',
    source: 'bot',
    inputs: {
      title: 'Parent portal crashes on mobile',
      route: '/parent',
      severity: 'blocking',
    },
    actor: { user_id: 'admin-local', role: 'super_admin', workspace_id: 'bna' },
  });
  assert.equal(technical.success, true);
  assert.equal(technical.executed, false);
  assert.equal(technical.approval_required, true);
  assert.equal(technical.preview.approval_required_before_queue, true);
});

test('worksheet, weekly update, and parent response actions expose safe context only', async () => {
  const worksheet = await runAction({
    action_id: 'generate_student_worksheet',
    source: 'bot',
    inputs: {
      student_id: 12,
      assignment_id: 22,
      language: 'Hebrew and English',
      interests: ['stories', 'projects'],
      prompt_patch: 'Make it warmer.',
    },
    actor: { user_id: 'parent-local', role: 'parent', workspace_id: 'bna' },
  });
  assert.equal(worksheet.success, true);
  assert.equal(worksheet.result.privacy_filtered, true);
  assert.equal(worksheet.result.admin_only_notes_excluded, true);

  const weekly = await runAction({
    action_id: 'draft_weekly_update',
    source: 'bot',
    inputs: {
      source_text: 'The class reviewed Mishnayos and practiced clear questions.',
      audience: 'BNA parents',
    },
    actor: { user_id: 'admin-local', role: 'bna_admin', workspace_id: 'bna' },
  });
  assert.equal(weekly.success, true);
  assert.equal(weekly.result.sent, false);
  assert.equal(weekly.result.privacy_filtered, true);

  const response = await runAction({
    action_id: 'draft_parent_response',
    source: 'bot',
    inputs: {
      message: 'Can you explain what my child should practice?',
      student_id: 12,
    },
    actor: { user_id: 'parent-local', role: 'parent', workspace_id: 'bna' },
  });
  assert.equal(response.success, true);
  assert.equal(response.result.sent, false);
  assert.equal(response.result.admin_only_notes_excluded, true);
});

test('permission checks protect parent/student/provider scopes', () => {
  assert.equal(
    checkActionPermission(getAction('show_today_plan'), { role: 'student', workspace_id: 'bna' }).allowed,
    true,
  );
  assert.equal(
    checkActionPermission(getAction('show_today_plan'), { role: 'participant', workspace_id: 'rabbi_sheller_provider' }).allowed,
    false,
  );
  assert.equal(
    checkActionPermission(getAction('create_provider_question_post'), { role: 'participant', workspace_id: 'rabbi_sheller_provider' }).allowed,
    true,
  );
  assert.equal(
    checkActionPermission(getAction('create_provider_question_post'), { role: 'student', workspace_id: 'bna' }).allowed,
    false,
  );
  assert.equal(
    checkActionPermission(getAction('mark_event_parent_visible'), { role: 'parent', workspace_id: 'bna' }).allowed,
    false,
  );
  assert.equal(
    checkActionPermission(getAction('create_decision'), { role: 'school_manager', workspace_id: 'bna' }).allowed,
    true,
  );
  assert.equal(
    checkActionPermission(getAction('update_provider_profile'), { role: 'provider_manager', workspace_id: 'rabbi_sheller_provider' }).allowed,
    true,
  );
  assert.equal(
    checkActionPermission(getAction('generate_student_worksheet'), { role: 'parent', workspace_id: 'bna' }).allowed,
    true,
  );
  assert.equal(
    checkActionPermission(getAction('route_bug_to_codex'), { role: 'parent', workspace_id: 'bna' }).allowed,
    false,
  );
});

test('Telegram routes normal operations to typed actions before Codex', () => {
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Refine the newsletter' }).action_id,
    'refine_newsletter_draft',
  );
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Draft an email to parents about tomorrow' }).action_id,
    'draft_email',
  );
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Create task to call the parent tomorrow' }).action_id,
    'create_task',
  );
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Move task #12 to done' }).action_id,
    'update_task_stage',
  );
  const retitleRoute = classifyTelegramActionRequest({ text: 'Retitle task #195 to Add watchdog soft repair for task warnings' });
  assert.equal(retitleRoute.action_id, 'retitle_task_naturally');
  assert.equal(retitleRoute.inputs.task_id, 195);
  assert.equal(retitleRoute.inputs.new_title, 'Add watchdog soft repair for task warnings');
  assert.equal(retitleRoute.dry_run, true);
  const optionRoute = classifyTelegramActionRequest({ text: 'Add decision option Hybrid path to task #195' });
  assert.equal(optionRoute.action_id, 'add_decision_option');
  assert.equal(optionRoute.inputs.task_id, 195);
  assert.equal(optionRoute.inputs.option_label, 'Hybrid path');
  assert.equal(optionRoute.dry_run, true);
  const scheduleRoute = classifyTelegramActionRequest({ text: 'Schedule task #195 on 2026-06-18 14:30' });
  assert.equal(scheduleRoute.action_id, 'schedule_task_on_date');
  assert.equal(scheduleRoute.inputs.task_id, 195);
  assert.equal(scheduleRoute.inputs.due_date, '2026-06-18');
  assert.equal(scheduleRoute.inputs.planned_at, '2026-06-18T14:30:00');
  assert.equal(scheduleRoute.dry_run, true);
  const moveWorkspaceRoute = classifyTelegramActionRequest({ text: 'Move task #195 to One Time workspace' });
  assert.equal(moveWorkspaceRoute.action_id, 'move_task_workspace');
  assert.equal(moveWorkspaceRoute.inputs.task_id, 195);
  assert.equal(moveWorkspaceRoute.inputs.workspace_key, 'one_time_mishnah_class');
  assert.equal(moveWorkspaceRoute.dry_run, true);
  const oneTimeLibraryRoute = classifyTelegramActionRequest({
    text: 'Create One Time video library item for Mishnah review recording https://example.com/video.mp4',
  });
  assert.equal(oneTimeLibraryRoute.action_id, 'create_one_time_video_library_item');
  assert.equal(oneTimeLibraryRoute.dry_run, true);
  assert.match(oneTimeLibraryRoute.inputs.title, /Mishnah review recording/);
  assert.equal(oneTimeLibraryRoute.inputs.source_url, 'https://example.com/video.mp4');
  const oneTimePublishPackageRoute = classifyTelegramActionRequest({
    text: 'Preview member-library publish package for One Time content job #57',
  });
  assert.equal(oneTimePublishPackageRoute.action_id, 'preview_one_time_member_library_publish_package');
  assert.equal(oneTimePublishPackageRoute.dry_run, true);
  assert.equal(oneTimePublishPackageRoute.inputs.content_job_id, 57);
  assert.equal(oneTimePublishPackageRoute.inputs.project_key, 'one_time_mishnah_class');
  const socialScheduleRoute = classifyTelegramActionRequest({
    text: 'Schedule this Facebook post one post per day this week starting 2026-06-22 09:00: Registration is open',
  });
  assert.equal(socialScheduleRoute.action_id, 'preview_social_schedule_package');
  assert.equal(socialScheduleRoute.dry_run, true);
  assert.deepEqual(socialScheduleRoute.inputs.channels, ['facebook']);
  assert.equal(socialScheduleRoute.inputs.post_count, 7);
  assert.equal(socialScheduleRoute.inputs.schedule_start, '2026-06-22T09:00:00');
  assert.equal(socialScheduleRoute.inputs.cadence, 'daily');
  const contactHistoryRoute = classifyTelegramActionRequest({
    text: 'Show WhatsApp history for +972 50-111-1111',
  });
  assert.equal(contactHistoryRoute.action_id, 'show_contact_communication_history');
  assert.equal(contactHistoryRoute.dry_run, true);
  assert.match(contactHistoryRoute.inputs.phone, /972/);
  const shiurIdeaRoute = classifyTelegramActionRequest({
    text: 'Create Rabbi shiur idea about Mishnah Aleph review',
  });
  assert.equal(shiurIdeaRoute.action_id, 'create_rabbi_shiur_idea');
  assert.equal(shiurIdeaRoute.dry_run, true);
  assert.match(shiurIdeaRoute.inputs.title, /Mishnah Aleph review/);
  const sourceSheetRoute = classifyTelegramActionRequest({
    text: 'Create Rabbi source sheet task for Mishnah Aleph questions',
  });
  assert.equal(sourceSheetRoute.action_id, 'create_rabbi_source_sheet_task');
  assert.equal(sourceSheetRoute.dry_run, true);
  assert.match(sourceSheetRoute.inputs.title, /Mishnah Aleph questions/);
  const referralRoute = classifyTelegramActionRequest({
    text: 'Create referral ledger entry for Cohen family from Rabbi Scheller',
  });
  assert.equal(referralRoute.action_id, 'create_referral_ledger_entry');
  assert.equal(referralRoute.dry_run, true);
  assert.equal(referralRoute.inputs.referred_name, 'Cohen family');
  assert.equal(referralRoute.inputs.referrer_name, 'Rabbi Scheller');
  const submitQuestionRoute = classifyTelegramActionRequest({
    text: 'Submit student question for moderation: Why does the Mishnah begin here?',
  });
  assert.equal(submitQuestionRoute.action_id, 'submit_student_question_for_moderation');
  assert.equal(submitQuestionRoute.dry_run, true);
  assert.match(submitQuestionRoute.inputs.question_text, /Why does the Mishnah begin here/);
  const reviewQuestionRoute = classifyTelegramActionRequest({
    text: 'Review moderated question task #195 as needs source sheet',
  });
  assert.equal(reviewQuestionRoute.action_id, 'review_moderated_question');
  assert.equal(reviewQuestionRoute.dry_run, true);
  assert.equal(reviewQuestionRoute.inputs.task_id, 195);
  assert.equal(reviewQuestionRoute.inputs.review_status, 'needs_source_sheet');
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Create calendar event parent meeting on 2026-06-18 16:00' }).action_id,
    'create_calendar_event',
  );
  const googleBusinessRoute = classifyTelegramActionRequest({
    text: 'Attach this Google Business link to provider #42 https://www.google.com/maps/place/BNA/?place_id=ChIJ1234567890abcdef',
  });
  assert.equal(googleBusinessRoute.action_id, 'capture_provider_google_business_link');
  assert.equal(googleBusinessRoute.inputs.provider_id, 42);
  assert.match(googleBusinessRoute.inputs.google_business_profile_url, /google\.com\/maps/);
  const placeLookupRoute = classifyTelegramActionRequest({
    text: 'Find the Place ID from this Google Maps link https://www.google.com/maps/place/BNA/?place_id=ChIJ1234567890abcdef',
  });
  assert.equal(placeLookupRoute.action_id, 'google_business_place_id_lookup');
  assert.equal(placeLookupRoute.dry_run, true);
  assert.equal(placeLookupRoute.inputs.google_place_id, 'ChIJ1234567890abcdef');
  const gbpLocationsRoute = classifyTelegramActionRequest({
    text: 'List accessible Google Business locations for provider #42',
  });
  assert.equal(gbpLocationsRoute.action_id, 'google_business_list_locations_preview');
  assert.equal(gbpLocationsRoute.dry_run, true);
  assert.equal(gbpLocationsRoute.inputs.provider_id, 42);
  const launchCalendarRoute = classifyTelegramActionRequest({
    text: 'Create the 8-week Rabbi Scheller launch calendar starting 2026-06-21',
  });
  assert.equal(launchCalendarRoute.action_id, 'calendar_batch_launch_plan_preview');
  assert.equal(launchCalendarRoute.dry_run, true);
  assert.equal(launchCalendarRoute.inputs.program, 'One Time Mishnayos launch');
  assert.equal(launchCalendarRoute.inputs.weeks, 8);
  assert.equal(launchCalendarRoute.inputs.start_date, '2026-06-21');
  const classroomTopicRoute = classifyTelegramActionRequest({
    text: 'Put this worksheet for Parsha review under topic Week 1 for course Mishnayos',
  });
  assert.equal(classroomTopicRoute.action_id, 'classroom_topic_material_preview');
  assert.equal(classroomTopicRoute.dry_run, true);
  assert.equal(classroomTopicRoute.inputs.topic_name, 'Week 1');
  assert.equal(classroomTopicRoute.inputs.course_name, 'Mishnayos');
  assert.match(classroomTopicRoute.inputs.material_title, /Parsha review/);
});

test('Telegram routes code/development work to Codex instead of normal operation actions', () => {
  const route = classifyTelegramActionRequest({ text: 'Fix the Telegram bridge parser and run tests' });
  assert.equal(route.kind, 'codex_development');
});

test('Telegram WhatsApp status reads recent delivery logs from app communications', () => {
  assert.match(telegramBridge, /recent_whatsapp_communications/);
  assert.match(telegramBridge, /compactCommunicationForContext/);
  assert.match(telegramBridge, /delivery=\$\{status\}/);
  assert.match(telegramBridge, /Service providers\/contact visibility/);
});

test('contact communication history helper previews local rows without sends or CRM writes', async () => {
  const queries = [];
  const fakeDb = {
    async query(sql, params = []) {
      queries.push({ sql, params });
      if (/INSERT INTO bna_bot_action_logs/.test(sql)) return { rows: [{ id: 901, status: 'previewed' }] };
      if (/FROM bna_contact_communications/.test(sql)) {
        return {
          rows: [
            {
              id: 7701,
              contact_type: 'general',
              lead_id: null,
              signup_id: 9901,
              student_id: null,
              channel: 'whatsapp',
              direction: 'inbound',
              summary: 'WhatsApp from Fixture Parent',
              body: 'Asked about schedule.',
              follow_up_required: true,
              occurred_at: '2026-06-15T08:45:00Z',
              created_at: '2026-06-15T08:45:10Z',
              source: 'wapi',
              source_context: { from_number: '+972501111111', chat_id: '972501111111@s.whatsapp.net' },
              metadata: { push_name: 'Fixture Parent' },
              signup_parent_name: 'Fixture Parent',
              signup_student_name: 'Fixture Student',
            },
            {
              id: 7702,
              contact_type: 'general',
              lead_id: 8801,
              signup_id: null,
              student_id: null,
              channel: 'email',
              direction: 'inbound',
              summary: 'Email from Fixture Lead',
              body: 'Follow-up.',
              follow_up_required: false,
              occurred_at: '2026-06-15T08:50:00Z',
              created_at: '2026-06-15T08:50:10Z',
              source: 'communications',
              source_context: { from_address: 'Fixture Lead <fixture.lead@example.com>' },
              metadata: {},
              lead_parent_name: 'Fixture Lead',
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const result = await runAction({
    action_id: 'show_contact_communication_history',
    source: 'telegram',
    dry_run: true,
    inputs: { phone: '050-111-1111', email: 'fixture.lead@example.com', limit: 5 },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db: fakeDb });

  assert.equal(result.success, true);
  assert.equal(result.executed, false);
  assert.equal(result.preview.contact_history_preview_created, true);
  assert.equal(result.preview.no_send, true);
  assert.equal(result.preview.external_write_performed, false);
  assert.equal(result.preview.local_write_performed, false);
  assert.equal(result.preview.whatsapp_send_performed, false);
  assert.equal(result.preview.broadcast_created, false);
  assert.equal(result.preview.contact_tag_write_performed, false);
  assert.equal(result.preview.summary.total_matches, 2);
  assert.equal(result.preview.summary.whatsapp, 1);
  assert.equal(result.preview.summary.email, 1);
  assert.ok(result.preview.communications.some((item) => item.match_reasons.includes('normalized_phone_or_wapi_source_context')));
  assert.ok(result.preview.communications.some((item) => item.match_reasons.includes('email_or_source_address')));
  assert.equal(queries.some((query) => /SEND_WHATSAPP|broadcast|buffer|leadconnector|ghl/i.test(query.sql)), false);
  assert.equal(queries.some((query) => /INSERT INTO bna_contact_communications|UPDATE bna_contact_communications|UPDATE bna_parent_leads|UPDATE bna_contacts/i.test(query.sql)), false);
});

test('Telegram direct-reply correction stays normal chat instead of Codex work', () => {
  const route = classifyTelegramActionRequest({
    text: "No dude I don't want to speak to codex I want to speak to you I didn't want you to file that for codex no I want you to be aren't you able to give me that right now can't you do that for me put that text together so I can just paste it in",
  });

  assert.equal(route.kind, 'normal_chat');
  assert.equal(route.reason, 'direct_reply_requested_instead_of_codex');
});

test('newsletter refine can execute without Codex and writes an audit log', async () => {
  const result = await runAction({
    action_id: 'refine_newsletter_draft',
    source: 'telegram',
    inputs: {
      draft_body: 'This week the boys learned Mishnayos and worked on responsibility.\n\nPlease remember the trip form.',
      instruction: 'Make it warmer and parent-facing',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(result.success, true);
  assert.equal(result.executed, true);
  assert.match(result.result.revised_body, /Dear parents/);
  assert.equal(result.audit_log.action_id, 'refine_newsletter_draft');
  assert.equal(result.audit_log.source, 'telegram');
  assert.equal(result.audit_log.result_status, 'executed');
});

test('email draft can execute without sending email', async () => {
  const result = await runAction({
    action_id: 'draft_email',
    source: 'telegram',
    inputs: {
      subject: 'Schedule reminder',
      body: 'Tomorrow class starts at 9.',
      audience: 'BNA parents',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(result.success, true);
  assert.equal(result.executed, true);
  assert.equal(result.result.sent, false);
  assert.match(result.result.identity, /BNA school/);
});

test('task creation action uses typed runner and does not require Codex', async () => {
  const created = [];
  const result = await runAction({
    action_id: 'create_task',
    source: 'telegram',
    inputs: { title: 'Call parent about calendar', raw_text: 'Create task to call parent about calendar' },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, {
    helpers: {
      createTaskFromText: async (input) => {
        created.push(input);
        return { id: 501, title: input.title, stage: input.stage || 'assigned' };
      },
    },
  });
  assert.equal(result.success, true);
  assert.equal(result.executed, true);
  assert.equal(result.result.task.id, 501);
  assert.equal(created.length, 1);
});

test('task retitle helper is approval-gated and preserves provenance preview', async () => {
  const rawTitle = 'Umm can you clean up this long raw task title so the task dashboard is not full of ramble wording that nobody can scan';
  const preview = await runAction({
    action_id: 'retitle_task_naturally',
    source: 'telegram',
    inputs: {
      task_id: 195,
      current_title: rawTitle,
      new_title: 'Clean raw task titles in Operations',
      reason: 'Visible title cleanup',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.preview.task_updated, false);
  assert.equal(preview.preview.next_title, 'Clean raw task titles in Operations');
  assert.equal(preview.preview.raw_previous_title_copied, false);
  assert.ok(preview.preview.previous_title_preview.length < rawTitle.length);

  const queries = [];
  const fakeDb = {
    async query(sql, params = []) {
      queries.push({ sql: String(sql), params });
      if (/SELECT id, title, stage, category, assigned_to, ai_parsed\s+FROM bna_tasks/.test(sql)) {
        return {
          rows: [{
            id: 195,
            title: rawTitle,
            stage: 'assigned',
            category: 'operations',
            assigned_to: 'Codex',
            ai_parsed: { original_text: rawTitle },
          }],
        };
      }
      if (/UPDATE bna_tasks/.test(sql)) {
        return { rows: [{ id: 195, title: params[1], verification_notes: params[2], ai_parsed: JSON.parse(params[3]) }] };
      }
      if (/INSERT INTO bna_bot_action_logs/.test(sql)) {
        return { rows: [{ id: queries.length, status: 'executed' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const executed = await runAction({
    action_id: 'retitle_task_naturally',
    source: 'telegram',
    approved: true,
    inputs: {
      task_id: 195,
      new_title: 'Clean raw task titles in Operations',
      reason: 'Visible title cleanup',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db: fakeDb });
  assert.equal(executed.success, true);
  assert.equal(executed.executed, true);
  assert.equal(executed.result.task_updated, true);
  assert.equal(executed.result.task.title, 'Clean raw task titles in Operations');
  assert.equal(executed.result.raw_previous_title_copied, false);
  assert.ok(queries.some((query) => /UPDATE bna_tasks/.test(query.sql)));
});

test('task decision, scheduling, and workspace helpers are approval-gated task-only writes', async () => {
  const decisionPreview = await runAction({
    action_id: 'add_decision_option',
    source: 'telegram',
    inputs: {
      task_id: 195,
      option_label: 'Hybrid path',
      reason: 'Needs Shloimie choice',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(decisionPreview.success, true);
  assert.equal(decisionPreview.executed, false);
  assert.equal(decisionPreview.approval_required, true);
  assert.equal(decisionPreview.preview.no_agent_job_created, true);
  assert.equal(decisionPreview.preview.planned_option.label, 'Hybrid path');

  const schedulePreview = await runAction({
    action_id: 'schedule_task_on_date',
    source: 'telegram',
    inputs: {
      task_id: 195,
      due_date: '2026-06-18',
      planned_at: '2026-06-18T14:30:00',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(schedulePreview.success, true);
  assert.equal(schedulePreview.executed, false);
  assert.equal(schedulePreview.approval_required, true);
  assert.equal(schedulePreview.preview.due_date, '2026-06-18');

  const workspacePreview = await runAction({
    action_id: 'move_task_workspace',
    source: 'telegram',
    inputs: {
      task_id: 195,
      workspace_key: 'one_time_mishnah_class',
      reason: 'Belongs with Rabbi Sheller work',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(workspacePreview.success, true);
  assert.equal(workspacePreview.executed, false);
  assert.equal(workspacePreview.approval_required, true);
  assert.equal(workspacePreview.preview.target_project_key, 'one_time_mishnah_class');

  const queries = [];
  const fakeDb = {
    async query(sql, params = []) {
      queries.push({ sql: String(sql), params });
      if (/SELECT id, title, stage, project_key, workspace_role, decision_options_json, ai_parsed\s+FROM bna_tasks/.test(sql)) {
        return {
          rows: [{
            id: 195,
            title: 'Pick onboarding path',
            stage: 'needs_decision',
            project_key: 'bna',
            workspace_role: null,
            decision_options_json: [{ label: 'Manual path', value: 'Manual path' }],
            ai_parsed: {},
          }],
        };
      }
      if (/SELECT id, project_key, name, short_name FROM bna_projects/.test(sql)) {
        return {
          rows: [{
            id: 77,
            project_key: params[0],
            name: params[0] === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
            short_name: params[0] === 'one_time_mishnah_class' ? 'One Time' : 'BNA',
          }],
        };
      }
      if (/UPDATE bna_tasks/.test(sql) && /decision_options_json/.test(sql)) {
        return {
          rows: [{
            id: params[0],
            decision_options_json: JSON.parse(params[1]),
            verification_notes: params[2],
            ai_parsed: JSON.parse(params[3]),
          }],
        };
      }
      if (/INSERT INTO bna_task_comments/.test(sql)) {
        return { rows: [{ id: queries.length, task_id: params[0], body: params[2] }] };
      }
      if (/UPDATE bna_tasks/.test(sql) && /due_date = \$2::date/.test(sql)) {
        return {
          rows: [{
            id: params[0],
            due_date: params[1],
            planned_at: params[2],
            verification_notes: params[4],
            ai_parsed: JSON.parse(params[5]),
          }],
        };
      }
      if (/UPDATE bna_tasks/.test(sql) && /project_id = \$2/.test(sql)) {
        return {
          rows: [{
            id: params[0],
            project_id: params[1],
            project_key: params[2],
            workspace_role: params[3],
            verification_notes: params[4],
            ai_parsed: JSON.parse(params[5]),
          }],
        };
      }
      if (/INSERT INTO bna_bot_action_logs/.test(sql)) {
        return { rows: [{ id: queries.length, status: 'executed' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };

  const decisionExecuted = await runAction({
    action_id: 'add_decision_option',
    source: 'telegram',
    approved: true,
    inputs: {
      task_id: 195,
      option_label: 'Hybrid path',
      reason: 'Needs Shloimie choice',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db: fakeDb });
  assert.equal(decisionExecuted.success, true);
  assert.equal(decisionExecuted.executed, true);
  assert.equal(decisionExecuted.result.decision_option_added, true);
  assert.equal(decisionExecuted.result.next_options.length, 2);
  assert.equal(decisionExecuted.result.task.ai_parsed.action_id, 'add_decision_option');

  const scheduleExecuted = await runAction({
    action_id: 'schedule_task_on_date',
    source: 'telegram',
    approved: true,
    inputs: {
      task_id: 195,
      due_date: '2026-06-18',
      planned_at: '2026-06-18T14:30:00',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db: fakeDb });
  assert.equal(scheduleExecuted.success, true);
  assert.equal(scheduleExecuted.executed, true);
  assert.equal(scheduleExecuted.result.task_scheduled, true);
  assert.equal(scheduleExecuted.result.task.due_date, '2026-06-18');
  assert.equal(scheduleExecuted.result.task.ai_parsed.action_id, 'schedule_task_on_date');

  const workspaceExecuted = await runAction({
    action_id: 'move_task_workspace',
    source: 'telegram',
    approved: true,
    inputs: {
      task_id: 195,
      workspace_key: 'one_time_mishnah_class',
      reason: 'Belongs with Rabbi Sheller work',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db: fakeDb });
  assert.equal(workspaceExecuted.success, true);
  assert.equal(workspaceExecuted.executed, true);
  assert.equal(workspaceExecuted.result.task_moved, true);
  assert.equal(workspaceExecuted.result.task.project_key, 'one_time_mishnah_class');
  assert.equal(workspaceExecuted.result.task.ai_parsed.action_id, 'move_task_workspace');

  assert.equal(queries.some((query) => /INSERT INTO bna_agent_jobs/.test(query.sql)), false);
  assert.equal(queries.some((query) => /buffer|leadconnector|ghl/i.test(query.sql)), false);
});

test('One Time video library helper is approval-gated and writes only scoped content records', async () => {
  const preview = await runAction({
    action_id: 'create_one_time_video_library_item',
    source: 'telegram',
    inputs: {
      title: 'Mishnah Aleph review recording',
      source_url: 'https://example.com/private-review.mp4',
      transcript_status: 'needs_review',
      summary: 'Class recording needs Rabbi review before members see it.',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.preview.project_key, 'one_time_mishnah_class');
  assert.equal(preview.preview.member_visible, false);
  assert.equal(preview.preview.public_visible, false);
  assert.equal(preview.preview.external_write_performed, false);
  assert.equal(preview.preview.no_send, true);
  assert.deepEqual(
    preview.preview.planned_outputs.map((output) => output.output_type),
    ['video_library_item', 'transcript_review', 'thumbnail_brief', 'worksheet_draft', 'social_copy_plan', 'newsletter_plan'],
  );

  const queries = [];
  let outputId = 900;
  const fakeDb = {
    async query(sql, params = []) {
      queries.push({ sql: String(sql), params });
      if (/SELECT id, project_key, name FROM bna_projects/.test(sql)) {
        return { rows: [{ id: 77, project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class' }] };
      }
      if (/INSERT INTO bna_content_jobs/.test(sql)) {
        return {
          rows: [{
            id: 880,
            project_id: params[0],
            title: params[1],
            source_type: params[2],
            status: params[12],
            media_url: params[6],
            parse_json: JSON.parse(params[15]),
          }],
        };
      }
      if (/INSERT INTO bna_content_outputs/.test(sql)) {
        outputId += 1;
        return {
          rows: [{
            id: outputId,
            job_id: params[0],
            output_type: params[1],
            title: params[2],
            body: params[3],
            platform: params[4],
            status: params[5],
            metadata: JSON.parse(params[6]),
          }],
        };
      }
      if (/INSERT INTO bna_bot_action_logs/.test(sql)) {
        return { rows: [{ id: queries.length, status: 'executed' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const executed = await runAction({
    action_id: 'create_one_time_video_library_item',
    source: 'telegram',
    approved: true,
    inputs: {
      title: 'Mishnah Aleph review recording',
      source_url: 'https://example.com/private-review.mp4',
      thumbnail_url: 'https://cdn.example.com/mishnah-aleph-thumb.jpg',
      summary: 'Class recording needs Rabbi review before members see it.',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(executed.success, true);
  assert.equal(executed.executed, true);
  assert.equal(executed.result.content_job_created, true);
  assert.equal(executed.result.local_write_performed, true);
  assert.equal(executed.result.external_write_performed, false);
  assert.equal(executed.result.job.project_id, 77);
  assert.equal(executed.result.outputs.length, 6);
  assert.ok(executed.result.outputs.every((output) => output.metadata.project_key === 'one_time_mishnah_class'));
  const thumbnailOutput = executed.result.outputs.find((output) => output.output_type === 'thumbnail_brief');
  assert.equal(thumbnailOutput.metadata.thumbnail_url, 'https://cdn.example.com/mishnah-aleph-thumb.jpg');
  assert.equal(thumbnailOutput.metadata.thumbnail_status, 'thumbnail_received');
  assert.ok(queries.some((query) => /INSERT INTO bna_content_jobs/.test(query.sql)));
  assert.equal(queries.filter((query) => /INSERT INTO bna_content_outputs/.test(query.sql)).length, 6);
  assert.equal(queries.some((query) => /bna_parent_leads|bna_contacts|buffer|legacy|ghl/i.test(query.sql)), false);
});

test('One Time member-library publish package preview performs no writes or publishing', async () => {
  const preview = await runAction({
    action_id: 'preview_one_time_member_library_publish_package',
    source: 'operations',
    inputs: {
      content_job_id: 57,
      title: 'Mishnah Aleph review recording',
      project_key: 'one_time_mishnah_class',
      workspace_key: 'rabbi_sheller_provider',
      media_url: 'https://cdn.example.com/mishnah-aleph.mp4',
      output_statuses: {
        video_library_item: 'approved',
        transcript_review: 'approved',
        thumbnail_brief: 'draft',
        worksheet_draft: 'draft',
        social_copy_plan: 'draft',
        newsletter_plan: 'draft',
      },
      release_status: 'approved',
      rabbi_review_status: 'approved',
      privacy_review_status: 'approved',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.preview.publish_package_preview_created, true);
  assert.equal(preview.preview.content_job_id, 57);
  assert.equal(preview.preview.project_key, 'one_time_mishnah_class');
  assert.equal(preview.preview.publish_performed, false);
  assert.equal(preview.preview.member_library_publish_performed, false);
  assert.equal(preview.preview.member_visibility_changed, false);
  assert.equal(preview.preview.drive_video_host_write_performed, false);
  assert.equal(preview.preview.buffer_social_write_performed, false);
  assert.equal(preview.preview.email_whatsapp_send_performed, false);
  assert.equal(preview.preview.checkout_access_write_performed, false);
  assert.equal(preview.preview.external_crm_write_performed, false);
  assert.equal(preview.preview.external_write_performed, false);
  assert.equal(preview.preview.local_write_performed, false);
  assert.equal(preview.preview.no_send, true);
  assert.ok(preview.preview.blockers.includes('Member-library destination is not approved yet.'));
  assert.ok(preview.preview.blockers.includes('Final approval phrase has not been supplied for a live publishing smoke.'));

  const fakeDb = {
    async query() {
      throw new Error('publish package preview must not query the database');
    },
  };
  const approved = await runAction({
    action_id: 'preview_one_time_member_library_publish_package',
    source: 'operations',
    approved: true,
    inputs: {
      content_job_id: 57,
      title: 'Mishnah Aleph review recording',
      project_key: 'one_time_mishnah_class',
      workspace_key: 'rabbi_sheller_provider',
      media_url: 'https://cdn.example.com/mishnah-aleph.mp4',
      output_statuses: {
        video_library_item: 'approved',
        transcript_review: 'approved',
        worksheet_draft: 'approved',
      },
      release_status: 'approved',
      rabbi_review_status: 'approved',
      privacy_review_status: 'approved',
      destination: 'approved member-library smoke destination',
      audience: 'approved One Time test member',
      visibility_rules: 'admin-reviewed member-only smoke item',
      rollback_plan: 'remove the smoke item and confirm readback',
      approval_phrase: 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(approved.success, true);
  assert.equal(approved.executed, true);
  assert.equal(approved.result.ready_for_one_item_smoke, true);
  assert.equal(approved.result.publish_performed, false);
  assert.equal(approved.result.member_library_publish_performed, false);
  assert.equal(approved.result.external_write_performed, false);
  assert.equal(approved.result.no_send, true);
});

test('social schedule package preview routes Buffer requests without external writes', async () => {
  const preview = await runAction({
    action_id: 'preview_social_schedule_package',
    source: 'telegram',
    inputs: {
      source_text: 'Schedule this Facebook post one post per day this week starting 2026-06-22 09:00: Registration is open.',
      channels: ['facebook'],
      post_count: 7,
      schedule_start: '2026-06-22T09:00:00',
      cadence: 'daily',
      workspace_key: 'rabbi_sheller_provider',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.preview.social_schedule_preview_created, true);
  assert.equal(preview.preview.provider, 'buffer');
  assert.equal(preview.preview.workspace_key, 'rabbi_sheller_provider');
  assert.deepEqual(preview.preview.channels, ['facebook']);
  assert.equal(preview.preview.post_count, 7);
  assert.equal(preview.preview.package.slots.length, 7);
  assert.equal(preview.preview.package.slots[0].scheduled_for, '2026-06-22T09:00:00');
  assert.equal(preview.preview.package.slots[6].scheduled_for, '2026-06-28T09:00:00');
  assert.equal(preview.preview.buffer_draft_write_performed, false);
  assert.equal(preview.preview.buffer_social_write_performed, false);
  assert.equal(preview.preview.buffer_media_upload_performed, false);
  assert.equal(preview.preview.publish_performed, false);
  assert.equal(preview.preview.external_write_performed, false);
  assert.equal(preview.preview.local_write_performed, false);
  assert.equal(preview.preview.no_send, true);
  assert.ok(preview.preview.blockers.includes('Final Buffer draft approval phrase has not been supplied.'));

  const fakeDb = {
    async query() {
      throw new Error('social schedule preview must not query the database');
    },
  };
  const approved = await runAction({
    action_id: 'preview_social_schedule_package',
    source: 'telegram',
    approved: true,
    inputs: {
      source_text: 'Make 3 posts from this video after Rabbi review.',
      channels: ['facebook', 'linkedin'],
      post_count: 3,
      source_url: 'https://cdn.example.com/rabbi-class.mp4',
      schedule_start: '2026-06-23T10:00:00',
      cadence: 'daily',
      approval_phrase: 'APPROVE_BUFFER_SOCIAL_DRAFT',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(approved.success, true);
  assert.equal(approved.executed, true);
  assert.equal(approved.result.ready_for_buffer_draft_smoke, true);
  assert.equal(approved.result.buffer_social_write_performed, false);
  assert.equal(approved.result.publish_performed, false);
  assert.equal(approved.result.external_write_performed, false);
  assert.equal(approved.result.no_send, true);
});

test('Rabbi shiur and source-sheet helpers create only scoped local review tasks after approval', async () => {
  const shiurPreview = await runAction({
    action_id: 'create_rabbi_shiur_idea',
    source: 'telegram',
    inputs: {
      title: 'Mishnah Aleph opening question',
      outline: ['Opening story', 'Core Mishnah point'],
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(shiurPreview.success, true);
  assert.equal(shiurPreview.executed, false);
  assert.equal(shiurPreview.approval_required, true);
  assert.equal(shiurPreview.preview.project_key, 'one_time_mishnah_class');
  assert.equal(shiurPreview.preview.category, 'shiur_ideas');
  assert.equal(shiurPreview.preview.no_agent_job_created, true);
  assert.equal(shiurPreview.preview.no_send, true);

  const sourcePreview = await runAction({
    action_id: 'create_rabbi_source_sheet_task',
    source: 'telegram',
    inputs: {
      title: 'Mishnah Aleph questions',
      sourceable_topics: ['Mishnah wording', 'Rambam comparison'],
      student_questions: ['Why does the Mishnah start here?'],
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(sourcePreview.success, true);
  assert.equal(sourcePreview.executed, false);
  assert.equal(sourcePreview.approval_required, true);
  assert.equal(sourcePreview.preview.project_key, 'one_time_mishnah_class');
  assert.equal(sourcePreview.preview.category, 'source_sheets');
  assert.equal(sourcePreview.preview.no_agent_job_created, true);
  assert.equal(sourcePreview.preview.external_write_performed, false);

  const queries = [];
  let nextTaskId = 900;
  const fakeDb = {
    async query(sql, params = []) {
      queries.push({ sql: String(sql), params });
      if (/SELECT id, project_key, name, short_name FROM bna_projects/.test(sql)) {
        return { rows: [{ id: 77, project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time' }] };
      }
      if (/INSERT INTO bna_tasks/.test(sql)) {
        nextTaskId += 1;
        return {
          rows: [{
            id: nextTaskId,
            title: params[0],
            notes: params[1],
            summary: params[2],
            category: params[3],
            urgency: params[4],
            source: params[5],
            source_context: params[6],
            assigned_to: params[8],
            ai_parsed: JSON.parse(params[9]),
            project_id: params[10],
            project_key: params[11],
            waiting_on: params[13],
            agent_status: 'none',
            next_action_label: params[16],
          }],
        };
      }
      if (/INSERT INTO bna_bot_action_logs/.test(sql)) {
        return { rows: [{ id: queries.length, status: 'executed' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };

  const shiurExecuted = await runAction({
    action_id: 'create_rabbi_shiur_idea',
    source: 'telegram',
    approved: true,
    inputs: {
      title: 'Mishnah Aleph opening question',
      outline: ['Opening story', 'Core Mishnah point'],
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(shiurExecuted.success, true);
  assert.equal(shiurExecuted.executed, true);
  assert.equal(shiurExecuted.result.task_created, true);
  assert.equal(shiurExecuted.result.task.project_key, 'one_time_mishnah_class');
  assert.equal(shiurExecuted.result.task.category, 'shiur_ideas');
  assert.equal(shiurExecuted.result.task.agent_status, 'none');
  assert.equal(shiurExecuted.result.task.ai_parsed.action_id, 'create_rabbi_shiur_idea');

  const sourceExecuted = await runAction({
    action_id: 'create_rabbi_source_sheet_task',
    source: 'telegram',
    approved: true,
    inputs: {
      title: 'Mishnah Aleph questions',
      sourceable_topics: ['Mishnah wording', 'Rambam comparison'],
      student_questions: ['Why does the Mishnah start here?'],
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(sourceExecuted.success, true);
  assert.equal(sourceExecuted.executed, true);
  assert.equal(sourceExecuted.result.task_created, true);
  assert.equal(sourceExecuted.result.task.project_key, 'one_time_mishnah_class');
  assert.equal(sourceExecuted.result.task.category, 'source_sheets');
  assert.equal(sourceExecuted.result.task.agent_status, 'none');
  assert.equal(sourceExecuted.result.task.ai_parsed.action_id, 'create_rabbi_source_sheet_task');

  assert.equal(queries.some((query) => /INSERT INTO bna_agent_jobs/.test(query.sql)), false);
  assert.equal(queries.some((query) => /buffer|leadconnector|ghl/i.test(query.sql)), false);
});

test('referral and moderated question helpers stay local, private, and approval-gated', async () => {
  const referralPreview = await runAction({
    action_id: 'create_referral_ledger_entry',
    source: 'telegram',
    inputs: {
      title: 'Referral review for Cohen family',
      referrer_name: 'Rabbi Scheller',
      referred_name: 'Cohen family',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(referralPreview.success, true);
  assert.equal(referralPreview.executed, false);
  assert.equal(referralPreview.approval_required, true);
  assert.equal(referralPreview.preview.lead.source, 'referral');
  assert.equal(referralPreview.preview.no_send, true);
  assert.equal(referralPreview.preview.referral_link_created, false);
  assert.equal(referralPreview.preview.reward_created, false);

  const questionPreview = await runAction({
    action_id: 'submit_student_question_for_moderation',
    source: 'telegram',
    inputs: {
      question_text: 'Why does the Mishnah begin here?',
      submitter_label: 'Private member',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(questionPreview.success, true);
  assert.equal(questionPreview.executed, false);
  assert.equal(questionPreview.approval_required, true);
  assert.equal(questionPreview.preview.forum_post_created, false);
  assert.equal(questionPreview.preview.member_visible, false);
  assert.equal(questionPreview.preview.no_send, true);

  const reviewPreview = await runAction({
    action_id: 'review_moderated_question',
    source: 'telegram',
    inputs: {
      task_id: 991,
      review_status: 'needs_source_sheet',
      review_notes: 'Needs sources before Rabbi response.',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(reviewPreview.success, true);
  assert.equal(reviewPreview.executed, false);
  assert.equal(reviewPreview.approval_required, true);
  assert.equal(reviewPreview.preview.review_status, 'needs_source_sheet');
  assert.equal(reviewPreview.preview.next_stage, 'assigned');
  assert.equal(reviewPreview.preview.no_send, true);

  const queries = [];
  let nextLeadId = 1200;
  let nextCommunicationId = 1300;
  let nextTaskId = 1400;
  let nextQuestionReviewId = 1500;
  let nextNotificationId = 1600;
  const fakeDb = {
    async query(sql, params = []) {
      queries.push({ sql: String(sql), params });
      if (/SELECT id, project_key, name, short_name FROM bna_projects/.test(sql)) {
        return { rows: [{ id: 77, project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time' }] };
      }
      if (/INSERT INTO bna_parent_leads/.test(sql)) {
        nextLeadId += 1;
        return {
          rows: [{
            id: nextLeadId,
            project_id: params[0],
            parent_name: params[1],
            parent_phone: params[2],
            parent_email: params[3],
            student_name: params[4],
            interest_level: params[5],
            source_detail: params[6],
            source: 'referral',
            status: 'lead_candidate',
            lead_type: 'content_interest',
            tags: params[9],
            metadata: JSON.parse(params[11]),
          }],
        };
      }
      if (/INSERT INTO bna_contact_communications/.test(sql)) {
        nextCommunicationId += 1;
        return {
          rows: [{
            id: nextCommunicationId,
            project_id: params[0],
            lead_id: params[1],
            summary: params[2],
            body: params[3],
            source: params[5],
            source_context: JSON.parse(params[6]),
            metadata: JSON.parse(params[7]),
          }],
        };
      }
      if (/INSERT INTO bna_tasks/.test(sql)) {
        nextTaskId += 1;
        return {
          rows: [{
            id: nextTaskId,
            title: params[0],
            notes: params[1],
            summary: params[2],
            category: params[3],
            urgency: params[4],
            source: params[5],
            source_context: params[6],
            assigned_to: params[8],
            ai_parsed: JSON.parse(params[9]),
            project_id: params[10],
            project_key: params[11],
            waiting_on: params[13],
            agent_status: 'none',
            next_action_label: params[16],
          }],
        };
      }
      if (/INSERT INTO bna_one_time_question_reviews/.test(sql)) {
        nextQuestionReviewId += 1;
        return {
          rows: [{
            id: nextQuestionReviewId,
            project_id: params[0],
            task_id: params[1],
            content_job_id: params[2],
            class_session_id: params[3],
            member_id: params[4],
            student_id: params[5],
            submitter_label: params[6],
            question_text: params[7],
            topic: params[8],
            privacy_notes: params[9],
            review_status: 'needs_review',
            assigned_to: params[10],
            waiting_on: params[11],
            next_action_label: params[12],
            source_context: JSON.parse(params[13]),
            public_visible: false,
            member_visible: false,
            forum_post_created: false,
            no_send: true,
            external_write_performed: false,
          }],
        };
      }
      if (/UPDATE bna_tasks/.test(sql)) {
        return {
          rows: [{
            id: params[0],
            stage: params[1],
            next_action_label: params[2],
            verification_notes: params[3],
            ai_parsed: JSON.parse(params[4]),
            agent_status: 'none',
          }],
        };
      }
      if (/INSERT INTO bna_task_comments/.test(sql)) {
        return {
          rows: [{
            id: queries.length,
            task_id: params[0],
            author: params[1],
            body: params[2],
            source_context: JSON.parse(params[3]),
          }],
        };
      }
      if (/UPDATE bna_one_time_question_reviews/.test(sql)) {
        return {
          rows: [{
            id: nextQuestionReviewId,
            task_id: params[0],
            review_status: params[1],
            reviewed_by: params[2],
            review_notes: params[3],
            next_action_label: params[4],
            public_visible: false,
            member_visible: false,
            forum_post_created: false,
            no_send: true,
            external_write_performed: false,
            source_context: JSON.parse(params[5]),
          }],
        };
      }
      if (/INSERT INTO bna_in_app_notifications/.test(sql)) {
        nextNotificationId += 1;
        return {
          rows: [{
            id: nextNotificationId,
            notification_key: params[0],
            project_id: params[1],
            workspace_key: params[2],
            recipient_label: params[3],
            recipient_role: params[4],
            event_type: params[5],
            title: params[6],
            body: params[7],
            priority: params[8],
            status: 'unread',
            related_type: params[9],
            related_id: params[10],
            source_table: params[11],
            source_id: params[12],
            source_context: JSON.parse(params[13]),
            delivery_state: 'in_app_only',
            no_send: true,
            external_write_performed: false,
          }],
        };
      }
      if (/INSERT INTO bna_bot_action_logs/.test(sql)) {
        return { rows: [{ id: queries.length, status: 'executed' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };

  const referralExecuted = await runAction({
    action_id: 'create_referral_ledger_entry',
    source: 'telegram',
    approved: true,
    inputs: {
      title: 'Referral review for Cohen family',
      referrer_name: 'Rabbi Scheller',
      referred_name: 'Cohen family',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(referralExecuted.success, true);
  assert.equal(referralExecuted.executed, true);
  assert.equal(referralExecuted.result.referral_entry_created, true);
  assert.equal(referralExecuted.result.lead.source, 'referral');
  assert.equal(referralExecuted.result.communication.metadata.no_send, true);
  assert.equal(referralExecuted.result.task.project_key, 'one_time_mishnah_class');
  assert.equal(referralExecuted.result.task.category, 'communications');
  assert.equal(referralExecuted.result.task.agent_status, 'none');

  const questionExecuted = await runAction({
    action_id: 'submit_student_question_for_moderation',
    source: 'telegram',
    approved: true,
    inputs: {
      question_text: 'Why does the Mishnah begin here?',
      submitter_label: 'Private member',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(questionExecuted.success, true);
  assert.equal(questionExecuted.executed, true);
  assert.equal(questionExecuted.result.task_created, true);
  assert.equal(questionExecuted.result.task.project_key, 'one_time_mishnah_class');
  assert.equal(questionExecuted.result.task.category, 'torah_class_prep');
  assert.equal(questionExecuted.result.task.ai_parsed.action_id, 'submit_student_question_for_moderation');
  assert.equal(questionExecuted.result.question_review_created, true);
  assert.equal(questionExecuted.result.question_review.review_status, 'needs_review');
  assert.equal(questionExecuted.result.question_review.no_send, true);
  assert.equal(questionExecuted.result.question_review.forum_post_created, false);
  assert.ok(questionExecuted.result.in_app_notification_id);

  const reviewExecuted = await runAction({
    action_id: 'review_moderated_question',
    source: 'telegram',
    approved: true,
    inputs: {
      task_id: 991,
      review_status: 'needs_source_sheet',
      review_notes: 'Needs sources before Rabbi response.',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(reviewExecuted.success, true);
  assert.equal(reviewExecuted.executed, true);
  assert.equal(reviewExecuted.result.moderation_review_recorded, true);
  assert.equal(reviewExecuted.result.task.ai_parsed.action_id, 'review_moderated_question');
  assert.equal(reviewExecuted.result.comment.source_context.no_send, true);
  assert.equal(reviewExecuted.result.question_review.review_status, 'needs_source_sheet');
  assert.equal(reviewExecuted.result.question_review.no_send, true);
  assert.equal(reviewExecuted.result.question_review.forum_post_created, false);
  assert.ok(reviewExecuted.result.in_app_notification_id);

  assert.equal(queries.some((query) => /INSERT INTO bna_agent_jobs/.test(query.sql)), false);
  assert.equal(queries.some((query) => /INSERT INTO bna_one_time_question_reviews/.test(query.sql)), true);
  assert.equal(queries.some((query) => /UPDATE bna_one_time_question_reviews/.test(query.sql)), true);
  assert.equal(queries.filter((query) => /INSERT INTO bna_in_app_notifications/.test(query.sql)).length, 2);
  assert.equal(queries.some((query) => /buffer|leadconnector|ghl|whatsapp|email_log/i.test(query.sql)), false);
});

test('calendar event create supports dry-run and mobile-safe internal calendar first', async () => {
  const result = await runAction({
    action_id: 'create_calendar_event',
    source: 'telegram',
    dry_run: true,
    inputs: {
      title: 'Parent meeting',
      start_at: '2026-06-18T16:00:00',
      visibility: 'parent',
      source: 'manual',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(result.success, true);
  assert.equal(result.executed, false);
  assert.equal(result.preview.preview.visibility, 'parent');
  assert.equal(result.preview.preview.source, 'manual');
  assert.equal(result.audit_log.result_status, 'previewed');
});

test('sensitive email/send/sync actions require approval and do not send in tests', async () => {
  for (const action_id of ['send_test_email', 'schedule_email', 'sync_google_calendar', 'google_drive_create_doc_preview', 'classroom_topic_material_preview', 'google_business_place_id_lookup', 'google_business_list_locations_preview']) {
    const inputs = action_id === 'sync_google_calendar'
      ? {}
      : { to: 'test@example.com', subject: 'Test', body: 'Body', scheduled_for: '2026-06-18T09:00:00' };
    const result = await runAction({
      action_id,
      source: 'telegram',
      inputs,
      actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
    });
    assert.equal(result.success, true);
    assert.equal(result.executed, false);
    assert.equal(result.approval_required, true);
    assert.equal(result.audit_log.approval_status, 'required');
  }
});

test('Google Drive preview actions are dry-run only and report missing connection blockers', async () => {
  const search = await runAction({
    action_id: 'google_drive_find_file_preview',
    source: 'telegram',
    dry_run: true,
    inputs: { query: 'latest Rabbi Scheller Mishnah video', source_stage: 'one_time_video_drop' },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(search.success, true);
  assert.equal(search.executed, false);
  assert.equal(search.preview.drive_action, 'find_or_list_files');
  assert.equal(search.preview.external_write_performed, false);
  assert.equal(search.preview.missing_connection_task_needed, true);

  const move = await runAction({
    action_id: 'google_drive_move_file_preview',
    source: 'telegram',
    dry_run: true,
    inputs: { file_name: 'selected transcript', target_folder_name: 'One Time folder' },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(move.success, true);
  assert.equal(move.preview.drive_action, 'move_or_import_file');
  assert.equal(move.preview.approval_required_before_external_write, true);
  assert.equal(move.preview.external_write_performed, false);
});

test('Classroom topic material preview plans topic placement without Google writes', async () => {
  const preview = await runAction({
    action_id: 'classroom_topic_material_preview',
    source: 'telegram',
    inputs: {
      course_name: 'Mishnayos',
      topic_name: 'Week 1',
      material_title: 'Parsha review worksheet',
      material_url: 'https://example.com/worksheet.pdf',
      workspace_key: 'bna',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.preview.classroom_topic_material_preview_created, true);
  assert.equal(preview.preview.course_name, 'Mishnayos');
  assert.equal(preview.preview.topic_name, 'Week 1');
  assert.equal(preview.preview.material_title, 'Parsha review worksheet');
  assert.equal(preview.preview.classroom_read_performed, false);
  assert.equal(preview.preview.google_classroom_write_performed, false);
  assert.equal(preview.preview.external_write_performed, false);
  assert.equal(preview.preview.live_google_api_used, false);
  assert.equal(preview.preview.no_send, true);
  assert.equal(preview.preview.approval_required_before_external_write, true);

  const fakeDb = {
    async query() {
      throw new Error('classroom_topic_material_preview must not query the database');
    },
  };
  const approved = await runAction({
    action_id: 'classroom_topic_material_preview',
    source: 'telegram',
    approved: true,
    inputs: {
      course_name: 'Mishnayos',
      topic_name: 'Week 1',
      material_title: 'Parsha review worksheet',
      workspace_key: 'bna',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db: fakeDb });
  assert.equal(approved.success, true);
  assert.equal(approved.executed, true);
  assert.equal(approved.result.classroom_write_performed, false);
  assert.equal(approved.result.google_classroom_write_performed, false);
  assert.equal(approved.result.external_write_performed, false);
  assert.equal(approved.result.live_google_api_used, false);
});

test('provider schedule action stays in provider workspace and separate from BNA accountability', async () => {
  const result = await runAction({
    action_id: 'create_provider_class_session',
    dry_run: true,
    inputs: {
      title: 'Rabbi Sheller 7:00 class',
      start_at: '2026-06-21T19:00:00',
    },
    actor: { user_id: 'provider-local', role: 'provider_admin', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(result.success, true);
  assert.equal(result.preview.preview.workspace_key, 'rabbi_sheller_provider');
  assert.equal(result.preview.preview.visibility, 'provider');
  assert.equal(result.preview.preview.source, 'provider_program');
});

test('launch calendar batch preview plans One Time weeks without writes', async () => {
  const preview = await runAction({
    action_id: 'calendar_batch_launch_plan_preview',
    source: 'telegram',
    inputs: {
      program: 'One Time Mishnayos launch',
      start_date: '2026-06-21',
      weeks: 8,
      workspace_key: 'rabbi_sheller_provider',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.preview.calendar_batch_preview_created, true);
  assert.equal(preview.preview.events_created, false);
  assert.equal(preview.preview.internal_calendar_write_performed, false);
  assert.equal(preview.preview.google_calendar_write_performed, false);
  assert.equal(preview.preview.external_write_performed, false);
  assert.equal(preview.preview.no_send, true);
  assert.equal(preview.preview.workspace_key, 'rabbi_sheller_provider');
  assert.equal(preview.preview.weeks, 8);
  assert.equal(preview.preview.item_count, 26);
  assert.ok(preview.preview.items.some((item) => item.type === 'live_mishnah_class'));
  assert.ok(preview.preview.items.some((item) => item.type === 'source_sheet_prep'));
  assert.ok(preview.preview.items.every((item) => item.google_calendar_write_performed === false));

  const fakeDb = {
    async query() {
      throw new Error('calendar_batch_launch_plan_preview must not query the database');
    },
  };
  const approved = await runAction({
    action_id: 'calendar_batch_launch_plan_preview',
    source: 'telegram',
    approved: true,
    inputs: {
      program: 'One Time Mishnayos launch',
      start_date: '2026-06-21',
      weeks: 8,
      workspace_key: 'rabbi_sheller_provider',
    },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(approved.success, true);
  assert.equal(approved.executed, true);
  assert.equal(approved.result.events_created, false);
  assert.equal(approved.result.internal_calendar_write_performed, false);
  assert.equal(approved.result.google_calendar_write_performed, false);
  assert.equal(approved.result.external_write_performed, false);
});

test('provider Google Business link capture is approval-gated and manual-only', async () => {
  const preview = await runAction({
    action_id: 'capture_provider_google_business_link',
    source: 'bot',
    inputs: {
      provider_id: 42,
      google_business_profile_url: 'https://www.google.com/maps/place/Bnei+Neviim+Academy/',
      notes: 'Provider sent this as the public Google profile link.',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.preview.live_google_api_used, false);
  assert.equal(preview.preview.external_write_performed, false);
  assert.equal(preview.preview.public_listing_review_needed, true);

  const queries = [];
  const fakeDb = {
    async query(sql, params = []) {
      queries.push({ sql: String(sql), params });
      if (/FROM bna_service_provider_profiles WHERE id = \$1 LIMIT 1/.test(sql)) {
        return { rows: [{ id: 42, metadata: { service_provider_id: 77 } }] };
      }
      if (/FROM bna_service_providers WHERE id = \$1 LIMIT 1/.test(sql)) {
        return { rows: [{ id: 77, display_name: 'Rabbi Scheller' }] };
      }
      if (/UPDATE bna_service_provider_profiles/.test(sql)) {
        return { rows: [{ id: 42, google_business_status: 'manual', google_place_id: params[1], metadata: {} }] };
      }
      if (/UPDATE bna_service_providers/.test(sql)) {
        return { rows: [{ id: 77, google_business_profile_url: params[1], google_place_id: params[2] }] };
      }
      if (/INSERT INTO bna_bot_action_logs/.test(sql)) {
        return { rows: [{ id: 1, status: 'executed' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };

  const executed = await runAction({
    action_id: 'capture_provider_google_business_link',
    source: 'bot',
    approved: true,
    inputs: {
      provider_id: 42,
      google_business_profile_url: 'https://www.google.com/maps/place/Bnei+Neviim+Academy/?place_id=ChIJ1234567890abcdef',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'bna' },
  }, { db: fakeDb });
  assert.equal(executed.success, true);
  assert.equal(executed.executed, true);
  assert.equal(executed.result.provider_google_business_link_captured, true);
  assert.equal(executed.result.profile_updated, true);
  assert.equal(executed.result.legacy_provider_updated, true);
  assert.ok(queries.some((query) => /UPDATE bna_service_provider_profiles/.test(query.sql)));
  assert.ok(queries.some((query) => /UPDATE bna_service_providers/.test(query.sql)));
});

test('Google Business preview helpers perform no live Google reads or writes', async () => {
  const placePreview = await runAction({
    action_id: 'google_business_place_id_lookup',
    source: 'telegram',
    inputs: {
      google_business_profile_url: 'https://www.google.com/maps/place/Bnei+Neviim+Academy/?place_id=ChIJ1234567890abcdef',
      query: 'Bnei Neviim Academy',
      workspace_key: 'bna',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(placePreview.success, true);
  assert.equal(placePreview.executed, false);
  assert.equal(placePreview.approval_required, true);
  assert.equal(placePreview.preview.google_business_place_id_lookup_preview_created, true);
  assert.equal(placePreview.preview.google_place_id, 'ChIJ1234567890abcdef');
  assert.equal(placePreview.preview.place_id_found_from_input, true);
  assert.equal(placePreview.preview.maps_lookup_performed, false);
  assert.equal(placePreview.preview.google_business_profile_api_used, false);
  assert.equal(placePreview.preview.external_read_performed, false);
  assert.equal(placePreview.preview.external_write_performed, false);
  assert.equal(placePreview.preview.no_send, true);

  const locationsPreview = await runAction({
    action_id: 'google_business_list_locations_preview',
    source: 'telegram',
    inputs: {
      provider_id: 42,
      provider_name: 'Rabbi Scheller',
      workspace_key: 'rabbi_sheller_provider',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(locationsPreview.success, true);
  assert.equal(locationsPreview.executed, false);
  assert.equal(locationsPreview.approval_required, true);
  assert.equal(locationsPreview.preview.google_business_locations_preview_created, true);
  assert.equal(locationsPreview.preview.business_locations_read_performed, false);
  assert.equal(locationsPreview.preview.google_business_profile_api_used, false);
  assert.equal(locationsPreview.preview.external_read_performed, false);
  assert.equal(locationsPreview.preview.external_write_performed, false);
  assert.equal(locationsPreview.preview.no_send, true);

  const fakeDb = {
    async query() {
      throw new Error('Google Business preview helpers must not query the database');
    },
  };
  const approved = await runAction({
    action_id: 'google_business_list_locations_preview',
    source: 'telegram',
    approved: true,
    inputs: {
      provider_id: 42,
      provider_name: 'Rabbi Scheller',
      workspace_key: 'rabbi_sheller_provider',
    },
    actor: { user_id: 'operator-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  }, { db: fakeDb });
  assert.equal(approved.success, true);
  assert.equal(approved.executed, true);
  assert.equal(approved.result.business_locations_read_performed, false);
  assert.equal(approved.result.google_business_profile_api_used, false);
  assert.equal(approved.result.external_read_performed, false);
  assert.equal(approved.result.external_write_performed, false);
});

test('action registry artifacts are generated for UI button mapping', () => {
  const actionsJson = JSON.parse(fs.readFileSync('ops/action-registry/actions.json', 'utf8'));
  const pageMap = JSON.parse(fs.readFileSync('ops/action-registry/page-action-map.json', 'utf8'));
  const buttonMap = fs.readFileSync('ops/action-registry/ui-button-map.md', 'utf8');
  assert.ok(actionsJson.some((action) => action.action_id === 'refine_newsletter_draft'));
  assert.ok(actionsJson.some((action) => action.action_id === 'create_report_problem_ticket'));
  assert.ok(actionsJson.some((action) => action.action_id === 'route_bug_to_codex'));
  assert.ok(actionsJson.some((action) => action.action_id === 'request_provider_contact'));
  assert.ok(actionsJson.some((action) => action.action_id === 'show_contact_communication_history'));
  assert.ok(actionsJson.some((action) => action.action_id === 'capture_provider_google_business_link'));
  assert.ok(actionsJson.some((action) => action.action_id === 'google_business_place_id_lookup'));
  assert.ok(actionsJson.some((action) => action.action_id === 'google_business_list_locations_preview'));
  assert.ok(actionsJson.some((action) => action.action_id === 'calendar_batch_launch_plan_preview'));
  assert.ok(actionsJson.some((action) => action.action_id === 'classroom_topic_material_preview'));
  assert.ok(actionsJson.some((action) => action.action_id === 'preview_social_schedule_package'));
  assert.ok(actionsJson.some((action) => action.action_id === 'retitle_task_naturally'));
  assert.ok(actionsJson.some((action) => action.action_id === 'add_decision_option'));
  assert.ok(actionsJson.some((action) => action.action_id === 'schedule_task_on_date'));
  assert.ok(actionsJson.some((action) => action.action_id === 'move_task_workspace'));
  assert.ok(actionsJson.some((action) => action.action_id === 'create_one_time_video_library_item'));
  assert.ok(actionsJson.some((action) => action.action_id === 'preview_one_time_member_library_publish_package'));
  assert.ok(actionsJson.some((action) => action.action_id === 'create_rabbi_shiur_idea'));
  assert.ok(actionsJson.some((action) => action.action_id === 'create_rabbi_source_sheet_task'));
  assert.ok(actionsJson.some((action) => action.action_id === 'create_referral_ledger_entry'));
  assert.ok(actionsJson.some((action) => action.action_id === 'submit_student_question_for_moderation'));
  assert.ok(actionsJson.some((action) => action.action_id === 'review_moderated_question'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_task'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'show_contact_communication_history'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'google_business_place_id_lookup'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'google_business_list_locations_preview'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'calendar_batch_launch_plan_preview'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'classroom_topic_material_preview'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'preview_social_schedule_package'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'retitle_task_naturally'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'add_decision_option'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'schedule_task_on_date'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'move_task_workspace'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_one_time_video_library_item'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'preview_one_time_member_library_publish_package'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_rabbi_shiur_idea'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_rabbi_source_sheet_task'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_referral_ledger_entry'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'submit_student_question_for_moderation'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'review_moderated_question'));
  assert.match(buttonMap, /refine_newsletter_draft/);
  assert.match(buttonMap, /show_contact_communication_history/);
  assert.match(buttonMap, /google_business_place_id_lookup/);
  assert.match(buttonMap, /google_business_list_locations_preview/);
  assert.match(buttonMap, /calendar_batch_launch_plan_preview/);
  assert.match(buttonMap, /classroom_topic_material_preview/);
  assert.match(buttonMap, /preview_social_schedule_package/);
  assert.match(buttonMap, /retitle_task_naturally/);
  assert.match(buttonMap, /add_decision_option/);
  assert.match(buttonMap, /schedule_task_on_date/);
  assert.match(buttonMap, /move_task_workspace/);
  assert.match(buttonMap, /create_one_time_video_library_item/);
  assert.match(buttonMap, /preview_one_time_member_library_publish_package/);
  assert.match(buttonMap, /create_rabbi_shiur_idea/);
  assert.match(buttonMap, /create_rabbi_source_sheet_task/);
  assert.match(buttonMap, /create_referral_ledger_entry/);
  assert.match(buttonMap, /submit_student_question_for_moderation/);
  assert.match(buttonMap, /review_moderated_question/);
  assert.match(buttonMap, /create_calendar_event/);
  assert.match(buttonMap, /create_report_problem_ticket/);
  assert.match(buttonMap, /route_bug_to_codex/);
});

test('server, Operations UI, and Telegram bridge are wired to the shared action runner', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const operations = fs.readFileSync('public/operations.html', 'utf8');
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  assert.match(server, /require\('\.\/src\/lib\/actions\/runner'\)/);
  assert.match(server, /app\.post\('\/api\/bna\/actions\/run'/);
  assert.match(server, /app\.get\('\/api\/bna\/actions\/audit-log'/);
  assert.match(operations, /runAction\(payload = \{\}\) \{ return this\.request\('POST', '\/actions\/run', payload\); \}/);
  assert.match(bridge, /classifyTelegramActionRequest/);
  assert.match(bridge, /\/api\/bna\/actions\/run/);
});
