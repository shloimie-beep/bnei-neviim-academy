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
    'send_test_email',
    'sync_google_calendar',
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
  for (const action_id of ['send_test_email', 'schedule_email', 'sync_google_calendar']) {
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
  assert.ok(actionsJson.some((action) => action.action_id === 'create_report_problem_ticket'));
  assert.ok(pageMap.telegram.some((entry) => entry.action_id === 'create_task'));
  assert.match(buttonMap, /refine_newsletter_draft/);
  assert.match(buttonMap, /create_calendar_event/);
  assert.match(buttonMap, /create_report_problem_ticket/);
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
