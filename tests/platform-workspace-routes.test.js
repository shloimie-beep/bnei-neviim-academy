const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const operationsShell = fs.readFileSync(path.join(root, 'public', 'js', 'operations-shell.js'), 'utf8');
const agentActions = fs.readFileSync(path.join(root, 'public', 'agent-actions.html'), 'utf8');
const agentActionsJs = fs.readFileSync(path.join(root, 'public', 'js', 'agent-actions.js'), 'utf8');
const dropoff = fs.readFileSync(path.join(root, 'public', 'agent-action-dropoff.html'), 'utf8');
const dropoffJs = fs.readFileSync(path.join(root, 'public', 'js', 'agent-action-dropoff.js'), 'utf8');
const school = fs.readFileSync(path.join(root, 'public', 'school-admin.html'), 'utf8');
const oneTimeConnector = fs.readFileSync(path.join(root, 'public', 'one-time-connector.html'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));

test('server registers requested private workspace and Agent Action routes', () => {
  [
    "app.get('/operations/school', requireAdmin, sendBnaSchoolWorkspaceShell)",
    "app.get('/operations/workspaces/one-time', requireAdmin, sendOneTimeConnectorShell)",
    "app.get(['/operations/agent-actions', '/operations/agent-actions/:jobId'], requireAdmin, sendAgentActionsShell)",
    "app.get('/operations/agent-actions/:jobId/dropoff', requireAdmin, sendAgentActionDropoffShell)",
    "app.get('/api/platform/agent-actions', requireAdmin",
    "app.get('/api/platform/agent-actions/:jobId', requireAdmin",
    "app.post('/api/platform/agent-actions/:jobId/results', requireAdmin",
    "app.get('/api/platform/agent-actions/:jobId/results', requireAdmin",
    "app.get('/api/platform/one-time-rabbi/preview', requireAdmin",
    "app.post('/api/platform/one-time-rabbi/actions', requireAdmin",
    "app.post('/api/platform/one-time-rabbi/telegram/webhook'",
    "app.get('/api/bna/school-admin/summary', requireAdmin",
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('existing Agent Review routes remain present', () => {
  assert.match(server, /app\.get\(\['\/operations\/agent-review', '\/agent-review'\], requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-review\/results'/);
  assert.match(server, /app\.get\('\/operations\/agent-review\/dropoff'/);
});

test('safe Operations returnTo allowlist includes new Agent Action and workspace routes', () => {
  assert.match(server, /'\/operations\/school'/);
  assert.match(server, /'\/operations\/workspaces\/one-time'/);
  assert.match(server, /'\/operations\/agent-actions'/);
  assert.match(server, /agentActionDropoffPath/);
  const loginHtml = fs.readFileSync(path.join(root, 'public', 'operations-login.html'), 'utf8');
  assert.match(loginHtml, /\/operations\/school/);
  assert.match(loginHtml, /agentActionDetailPath/);
});

test('normal UI exposes workspace switcher without View-as as primary navigation', () => {
  assert.match(operationsShell, /renderCanonicalWorkspaceSwitcher/);
  assert.match(operationsShell, /Super Admin/);
  assert.match(operationsShell, /\/operations\/school/);
  assert.match(operationsShell, /\/operations\/workspaces\/one-time/);
  [agentActions, school, oneTimeConnector].forEach((html) => {
    assert.match(html, /Workspace switcher/);
    assert.match(html, /Super Admin/);
    assert.match(html, /BNA/);
    assert.match(html, /One Time/);
    assert.doesNotMatch(html, /View as/);
  });
});

test('Agent Action UI exposes required controls and save plus readback flow', () => {
  [
    'Copy Prompt',
    'Open Target',
    'I Started',
    'Save Partial Result',
    'Save Completed Result',
    'Readback',
    'Retry',
    'Supersede',
  ].forEach((label) => assert.match(agentActionsJs + dropoff + dropoffJs, new RegExp(label)));
  assert.match(dropoffJs, /state\.readback = await requestJson\(response\.readback_url\)/);
  assert.match(server, /ON CONFLICT \(idempotency_key\) DO UPDATE SET[\s\S]*bna_agent_action_results/);
  assert.match(server, /SET status = \$2,[\s\S]*readback_at = COALESCE\(readback_at, NOW\(\)\)/);
});

test('route and action registries cover new visible surfaces', () => {
  const routeSet = new Set(routeRegistry.routes.map((route) => route.route));
  [
    '/operations/school',
    '/operations/workspaces/one-time',
    '/operations/agent-actions',
    '/operations/agent-actions/:jobId',
    '/operations/agent-actions/:jobId/dropoff',
    '/api/platform/agent-actions',
    '/api/platform/agent-actions/:jobId',
    '/api/platform/agent-actions/:jobId/results',
    '/api/platform/one-time-rabbi/preview',
    '/api/platform/one-time-rabbi/actions',
    '/api/platform/one-time-rabbi/telegram/webhook',
    '/api/bna/school-admin/summary',
  ].forEach((route) => assert.ok(routeSet.has(route), route));

  const actionSet = new Set(actionRegistry.actions.map((action) => action.action_id));
  [
    'ACTION-PLATFORM-WORKSPACE-SWITCHER-SUPER-ADMIN',
    'ACTION-PLATFORM-WORKSPACE-SWITCHER-BNA',
    'ACTION-PLATFORM-WORKSPACE-SWITCHER-ONE-TIME',
    'ACTION-AGENT-ACTION-COPY-PROMPT',
    'ACTION-AGENT-ACTION-OPEN-TARGET',
    'ACTION-AGENT-ACTION-I-STARTED',
    'ACTION-AGENT-ACTION-SAVE-PARTIAL',
    'ACTION-AGENT-ACTION-SAVE-COMPLETED',
    'ACTION-AGENT-ACTION-READBACK',
    'ACTION-AGENT-ACTION-RETRY',
    'ACTION-AGENT-ACTION-SUPERSEDE',
    'ACTION-BNA-SCHOOL-OPEN-MODULE',
    'ACTION-ONETIME-CONNECTOR-OPEN-APP',
    'ACTION-ONETIME-CONNECTOR-OPEN-AGENT-ACTIONS',
  ].forEach((action) => assert.ok(actionSet.has(action), action));
});
