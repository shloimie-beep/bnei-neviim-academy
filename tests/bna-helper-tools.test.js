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
const { redactValue } = require('../src/lib/bna/helper/redaction');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('BNA Helper backend exposes HELPER-03 storage, redaction fields, and routes', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_helper_tool_audit_log/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_helper_plans/);
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
  assert.match(server, /app\.post\('\/api\/bna\/helper\/message'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/confirm'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/runs\/:id'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/plan'/);
  assert.match(server, /app\.post\('\/api\/bna\/helper\/execute'/);
  assert.match(server, /app\.get\('\/api\/bna\/helper\/audit'/);
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

  const bufferTool = registry.get('schedule_social_post_via_buffer');
  assert.equal(bufferTool.available, false);
  assert.equal(bufferTool.unavailableReason, 'missing_integration');
  assert.equal(bufferTool.requiresConfirmation, true);
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
    workspace: { workspaceKey: 'ops', projectKey: 'bna', providerId: 'provider-1' },
    actor: { role: 'admin', allowedViews: ['tasks', 'students'] },
    selectedRecord: { type: 'student', id: 42, secret: 'ignore-me' },
    visibleSection: 'student_detail',
    availableClientActions: ['create_task', 'draft_email'],
  });

  assert.equal(pageContext.route, '/operations');
  assert.equal(pageContext.workspace.projectKey, 'bna');
  assert.equal(pageContext.workspace.providerId, 'provider-1');
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

test('Operations exposes the HELPER-03 helper drawer, scoped context, and client endpoint calls', () => {
  assert.match(operations, /getHelperContext\(\) \{ return this\.request\('GET', '\/helper\/context'\); \}/);
  assert.match(operations, /getHelperTools\(\) \{ return this\.request\('GET', '\/helper\/tools'\); \}/);
  assert.match(operations, /sendHelperMessage\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/message', payload\); \}/);
  assert.match(operations, /confirmHelperAction\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/confirm', payload\); \}/);
  assert.match(operations, /getHelperRun\(id\) \{ return this\.request\('GET', '\/helper\/runs\/' \+ encodeURIComponent\(id\)\); \}/);
  assert.match(operations, /planHelperAction\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/plan', payload\); \}/);
  assert.match(operations, /executeHelperPlan\(payload = \{\}\) \{ return this\.request\('POST', '\/helper\/execute', payload\); \}/);
  assert.match(operations, /function helperVisibleFilters/);
  assert.match(operations, /function helperSelectedRecord/);
  assert.match(operations, /function helperAvailableClientActions/);
  assert.match(operations, /function renderBnaHelperDock/);
  assert.match(operations, /function submitBnaHelperMessage/);
  assert.match(operations, /function executeBnaHelperPlan/);
  assert.match(operations, /api\.getHelperContext\(\)/);
  assert.match(operations, /api\.sendHelperMessage\(/);
  assert.match(operations, /api\.confirmHelperAction\(/);
  assert.match(operations, /data-helper-record-type=\"task\"/);
  assert.match(operations, /data-helper-record-type=\"student\"/);
  assert.match(operations, /data-helper-record-type=\"content_job\"/);
  assert.match(operations, /bna-helper-panel/);
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
