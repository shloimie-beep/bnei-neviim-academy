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
const { helperPermissionForTool } = require('../src/lib/bna/helper/permissions');
const { buildHelperPlan, deterministicPlan } = require('../src/lib/bna/helper/planner');
const { redactValue } = require('../src/lib/bna/helper/redaction');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

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
    openai_key: 'sk-abcdefghijklmnopqrstuvwxyz1234567890',
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
    identity: {
      role: 'one_time_admin',
      scope: { type: 'project', projectKey: 'one_time_mishnah_class' },
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
});

test('BNA Helper planner resolves explicit navigation before hosted AI', async () => {
  const registry = buildToolRegistry();
  const previousApiKey = process.env.OPENAI_API_KEY;
  const previousFetch = global.fetch;
  let fetchCalled = false;
  process.env.OPENAI_API_KEY = 'sk-test-helper-navigation';
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error('AI planner should not be called for explicit navigation');
  };
  try {
    const plan = await buildHelperPlan('decisions', registry, { projectKey: 'bna' });
    assert.equal(fetchCalled, false);
    assert.equal(plan.actions[0].tool, 'open_operations_view');
    assert.deepEqual(plan.actions[0].args, { view: 'tasks', section: 'decisions' });
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
