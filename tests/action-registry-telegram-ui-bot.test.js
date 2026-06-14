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
    'capture_provider_google_business_link',
    'queue_telegram_report',
    'route_bug_to_codex',
    'send_test_email',
    'sync_google_calendar',
    'google_drive_find_file_preview',
    'google_drive_create_doc_preview',
    'google_drive_create_folder_preview',
    'google_drive_move_file_preview',
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
  for (const action_id of ['send_test_email', 'schedule_email', 'sync_google_calendar', 'google_drive_create_doc_preview']) {
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

test('action registry artifacts are generated for UI button mapping', () => {
  const actionsJson = JSON.parse(fs.readFileSync('ops/action-registry/actions.json', 'utf8'));
  const pageMap = JSON.parse(fs.readFileSync('ops/action-registry/page-action-map.json', 'utf8'));
  const buttonMap = fs.readFileSync('ops/action-registry/ui-button-map.md', 'utf8');
  assert.ok(actionsJson.some((action) => action.action_id === 'refine_newsletter_draft'));
  assert.ok(actionsJson.some((action) => action.action_id === 'create_report_problem_ticket'));
  assert.ok(actionsJson.some((action) => action.action_id === 'route_bug_to_codex'));
  assert.ok(actionsJson.some((action) => action.action_id === 'request_provider_contact'));
  assert.ok(actionsJson.some((action) => action.action_id === 'capture_provider_google_business_link'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_task'));
  assert.match(buttonMap, /refine_newsletter_draft/);
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
