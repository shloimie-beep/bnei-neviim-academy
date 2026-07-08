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
