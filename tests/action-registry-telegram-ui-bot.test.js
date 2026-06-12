const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { listActions, getAction } = require('../src/lib/actions/registry');
const { runAction } = require('../src/lib/actions/runner');
const { checkActionPermission } = require('../src/lib/actions/permissions');
const { classifyTelegramActionRequest } = require('../src/lib/bna/telegram-action-router');

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
    'draft_whatsapp_message',
    'send_whatsapp_via_wapi',
    'find_latest_uploaded_media',
    'transcribe_or_parse_media_if_needed',
    'summarize_weekly_topics',
    'extract_student_questions',
    'generate_weekly_update',
    'generate_parent_newsletter',
    'generate_whatsapp_weekly_post',
    'attach_video_to_parent_portal',
    'save_weekly_update_revision',
    'prepare_rabbi_sheller_access_request',
    'create_report_problem_ticket',
    'send_test_email',
    'sync_google_calendar',
  ]) {
    assert.ok(getAction(actionId), `${actionId} should exist`);
  }
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
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Draft a WhatsApp update to parents about tomorrow' }).action_id,
    'draft_whatsapp_message',
  );
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Send this WhatsApp to the parent group after approval' }).action_id,
    'send_whatsapp_to_group',
  );
  const weeklyFromMedia = classifyTelegramActionRequest({
    text: 'Use the latest uploaded video and make a weekly WhatsApp parent update',
  });
  assert.equal(weeklyFromMedia.action_id, 'generate_whatsapp_weekly_post');
  assert.equal(weeklyFromMedia.inputs.from_latest_media, true);
  assert.equal(weeklyFromMedia.reason, 'weekly_update_from_latest_media');
  assert.deepEqual(
    classifyTelegramActionRequest({ text: 'Find the latest uploaded recording' }).action_id,
    'find_latest_uploaded_media',
  );
  const parentUpdateFromMedia = classifyTelegramActionRequest({
    text: 'Generate a parent weekly update from the latest uploaded audio',
  });
  assert.equal(parentUpdateFromMedia.action_id, 'generate_weekly_update');
  assert.equal(parentUpdateFromMedia.inputs.from_latest_media, true);
});

test('Telegram routes code/development work to Codex instead of normal operation actions', () => {
  const route = classifyTelegramActionRequest({ text: 'Fix the Telegram bridge parser and run tests' });
  assert.equal(route.kind, 'codex_development');
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

test('weekly update actions can draft from latest uploaded media context', async () => {
  const db = {
    query: async () => ({
      rows: [{
        id: 77,
        title: 'Latest class recording',
        source_type: 'telegram_media',
        media_url: 'https://example.test/class-77.mp4',
        status: 'ready',
        transcript_text: 'The boys learned Mishnah Berachos and reviewed responsibility. Dovid asked why a beracha needs kavana?',
        parse_json: null,
        caption: '',
        notes: '',
      }],
    }),
  };
  const result = await runAction({
    action_id: 'generate_weekly_update',
    source: 'telegram',
    inputs: { from_latest_media: true, student_name: 'BNA boys' },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db });
  assert.equal(result.success, true);
  assert.equal(result.executed, true);
  assert.equal(result.result.weekly_update_created, true);
  assert.equal(result.result.media.id, 77);
  assert.match(result.result.body, /Mishnah Berachos/);
  assert.ok(result.result.student_questions.some((question) => /kavana/i.test(question)));

  const whatsapp = await runAction({
    action_id: 'generate_whatsapp_weekly_post',
    source: 'telegram',
    inputs: { from_latest_media: true },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, { db });
  assert.equal(whatsapp.success, true);
  assert.equal(whatsapp.result.draft_created, true);
  assert.equal(whatsapp.result.sent, false);
  assert.match(whatsapp.result.body, /BNA weekly update/);
});

test('WhatsApp WAPI action falls back safely when unconfigured and honors test mode', async () => {
  const unconfigured = await runAction({
    action_id: 'send_whatsapp_via_wapi',
    source: 'telegram',
    approved: true,
    inputs: { to: '+15555551212', body: 'Parent update draft' },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  });
  assert.equal(unconfigured.success, true);
  assert.equal(unconfigured.executed, true);
  assert.equal(unconfigured.result.sent, false);
  assert.equal(unconfigured.result.connector, 'manual_link');
  assert.equal(unconfigured.result.blocked_by_config, true);
  assert.match(unconfigured.result.manual_link_fallback, /^https:\/\/wa\.me\/15555551212/);

  const testMode = await runAction({
    action_id: 'send_whatsapp_via_wapi',
    source: 'telegram',
    approved: true,
    inputs: { to: '+15555551212', body: 'Parent update draft' },
    actor: { user_id: 'telegram-local', role: 'operator', workspace_id: 'bna' },
  }, {
    connectors: {
      whatsapp: {
        provider: 'wapi',
        configured: true,
        test_mode: true,
        base_url: 'https://wapi.example.test',
        default_parent_group_id: 'parents',
      },
    },
  });
  assert.equal(testMode.success, true);
  assert.equal(testMode.result.connector, 'wapi');
  assert.equal(testMode.result.test_mode, true);
  assert.equal(testMode.result.sent, false);
  assert.match(testMode.result.blocked_reason, /test mode/i);
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

test('report problem action preserves selected page context for support tickets', async () => {
  const result = await runAction({
    action_id: 'create_report_problem_ticket',
    source: 'dashboard',
    dry_run: true,
    inputs: {
      description: 'The weekly update button does nothing',
      selector: 'button[data-action="weekly"]',
      bounding_box: { x: 12, y: 34, width: 180, height: 44 },
      page_context: { route: '/operations?view=communications&section=whatsapp' },
      reporter_user_id: 'super-admin-local',
      reporter_role: 'super_admin',
      workspace_id: 'platform',
    },
    actor: { user_id: 'super-admin-local', role: 'super_admin', workspace_id: 'platform' },
  });
  assert.equal(result.success, true);
  assert.equal(result.executed, false);
  assert.equal(result.preview.ticket_ready, true);
  assert.equal(result.preview.selector, 'button[data-action="weekly"]');
  assert.deepEqual(result.preview.bounding_box, { x: 12, y: 34, width: 180, height: 44 });
  assert.equal(result.preview.screenshot_status, 'not_captured_in_browser');
  assert.equal(result.preview.route, '/operations?view=communications&section=whatsapp');
});

test('Rabbi Sheller access request includes credential and materials checklist without sending', async () => {
  const result = await runAction({
    action_id: 'prepare_rabbi_sheller_access_request',
    source: 'dashboard',
    inputs: { recipient: 'Rabbi Sheller' },
    actor: { user_id: 'super-admin-local', role: 'operator', workspace_id: 'rabbi_sheller_provider' },
  });
  assert.equal(result.success, true);
  assert.equal(result.executed, true);
  assert.equal(result.result.sent, false);
  assert.ok(result.result.checklist.length >= 10);
  assert.ok(result.result.safe_intake_methods.includes('Shared password-manager item'));
  assert.match(result.result.message, /Please do not send raw passwords/i);
  assert.match(result.result.message, /BNA school student data/i);
});

test('sensitive email/whatsapp/send/sync actions require approval and do not send in tests', async () => {
  for (const action_id of ['send_test_email', 'schedule_email', 'sync_google_calendar', 'send_whatsapp_via_wapi']) {
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

test('action registry artifacts are generated for UI button mapping', () => {
  const actionsJson = JSON.parse(fs.readFileSync('ops/action-registry/actions.json', 'utf8'));
  const pageMap = JSON.parse(fs.readFileSync('ops/action-registry/page-action-map.json', 'utf8'));
  const buttonMap = fs.readFileSync('ops/action-registry/ui-button-map.md', 'utf8');
  assert.ok(actionsJson.some((action) => action.action_id === 'refine_newsletter_draft'));
  assert.ok(actionsJson.some((action) => action.action_id === 'generate_whatsapp_weekly_post'));
  assert.ok(actionsJson.some((action) => action.action_id === 'find_latest_uploaded_media'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_task'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'generate_whatsapp_weekly_post'));
  assert.match(buttonMap, /refine_newsletter_draft/);
  assert.match(buttonMap, /create_calendar_event/);
  assert.match(buttonMap, /generate_whatsapp_weekly_post/);
});

test('scoped bot context templates exist for super admin, parent, student, and provider roles', () => {
  const contextDir = path.join('content-memory', 'user-contexts');
  for (const file of [
    'README.md',
    'super_admin.md',
    'workspace_admin_template.md',
    'parent_template.md',
    'student_template.md',
    'provider_admin_template.md',
    'provider_member_template.md',
  ]) {
    const body = fs.readFileSync(path.join(contextDir, file), 'utf8');
    if (file === 'README.md') {
      assert.match(body, /Log Fields/i, `${file} should describe audit log fields`);
    } else {
      assert.match(body, /Allowed data sources|Allowed sources|Allowed actions/i, `${file} should declare allowed scope`);
      if (/_template\.md$/.test(file)) assert.match(body, /Denied data sources|Approval rules/i, `${file} should declare denied scope or approval rules`);
    }
  }
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
