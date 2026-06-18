const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Operations shell renders explicit super-admin and scoped workspace modes', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function renderWorkspaceContextControl\(\)/);
  assert.match(operations, /data-mode="super-admin"/);
  assert.match(operations, /aria-label="Super-admin workspace selector"/);
  assert.match(operations, /data-mode="scoped"/);
  assert.match(operations, /aria-label="Scoped workspace context"/);
  assert.match(operations, />Scoped login</);
  assert.match(operations, /school: 'School'/);
  assert.match(operations, /service_provider: 'Service provider'/);
  assert.match(operations, /return type \? `\$\{type\}: \$\{name\}` : name;/);
});

test('Operations workspace selector drives scoped task and calendar API loading', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function isGlobalOpsUser\(\)/);
  assert.match(operations, /function selectedProjectFilter\(\)/);
  assert.match(operations, /function setWorkspaceProject\(value\)/);
  assert.match(operations, /window\.localStorage\?\.setItem\('bna_ops_active_project', activeWorkspaceProject\)/);
  assert.match(operations, /api\.getTasks\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /viewAllowed\('calendar'\) \? api\.getCalendar\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ events: \[\] \}\)/);
  assert.match(operations, /viewAllowed\('automations'\) \? api\.getAutomations\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ automations: \[\] \}\)/);
  assert.match(operations, /viewAllowed\('integrations'\) \? api\.getIntegrations\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ integrations: \[\] \}\)/);
  assert.match(operations, /viewAllowed\('users'\) \? api\.getUsers\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ users: \[\] \}\)/);
  assert.match(operations, /viewAllowed\('users'\) \? api\.getInvitations\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ invitations: \[\] \}\)/);
  assert.doesNotMatch(operations, /getAgentFleetStatus/);
});

test('Task create and edit controls cannot override a scoped or selected workspace project', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function projectControlsLocked\(\)/);
  assert.match(operations, /const lockProjectControl = projectControlsLocked\(\)/);
  assert.ok(operations.includes("<select id=\"taskProject\" ${lockProjectControl ? 'disabled' : ''}>"));
  assert.match(operations, /const taskProject = selectedProjectFilter\(\) \|\| document\.getElementById\('taskProject'\)\.value;/);
  assert.match(operations, /if \(kind === 'project' && !selectedProjectFilter\(\)\) taskProjectFilter = value;/);
  assert.match(operations, /Workspace: \$\{escapeHtml\(activeWorkspaceProjectLabel\(\)\)\}/);
});

test('Changing workspace clears stale module, student, content, and task-modal context', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function resetWorkspaceScopedUiState\(\)/);
  assert.match(operations, /currentView = 'tasks';/);
  assert.match(operations, /taskFocus = 'overview';/);
  assert.match(operations, /calendarEvents = \[\];/);
  assert.match(operations, /assistantStatus = null;/);
  assert.match(operations, /assistantMemory = null;/);
  assert.match(operations, /assistantActions = null;/);
  assert.match(operations, /automationStatuses = \[\];/);
  assert.match(operations, /integrationStatuses = \[\];/);
  assert.match(operations, /workspaceUsers = \[\];/);
  assert.match(operations, /workspaceInvitations = \[\];/);
  assert.match(operations, /contentSection = 'library';/);
  assert.match(operations, /contentTypeFilter = 'all';/);
  assert.match(operations, /contentDateFilter = 'all';/);
  assert.match(operations, /contentProjectFilter = 'all';/);
  assert.match(operations, /contactSection = 'parents';/);
  assert.match(operations, /accountingSection = 'overview';/);
  assert.match(operations, /studentSection = 'overview';/);
  assert.match(operations, /studentGoalFilter = 'due_today';/);
  assert.match(operations, /studentAccountabilityFilter = 'all';/);
  assert.match(operations, /selectedStudentId = null;/);
  assert.match(operations, /selectedContactKey = null;/);
  assert.match(operations, /selectedContentJobIds = new Set\(\);/);
  assert.match(operations, /expandedContentJobIds = new Set\(\);/);
  assert.match(operations, /expandedPromptKey = null;/);
  assert.match(operations, /editingTask = null;/);
  assert.match(operations, /taskComments = \[\];/);
  assert.match(operations, /resetWorkspaceScopedUiState\(\);/);
  assert.match(operations, /function writeOperationsRoute\(mode = 'replace'\)/);
  assert.match(operations, /writeOperationsRoute\('push'\);/);
  assert.match(operations, /window\.addEventListener\('popstate', \(\) => \{/);
  assert.match(operations, /applyOperationsRouteFromLocation\(\);/);
});

test('Projects API returns canonical workspace metadata for the selector', () => {
  const server = read('server.js');

  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = p\.workspace_id/);
  assert.match(server, /w\.workspace_type/);
  assert.match(server, /w\.workspace_key/);
  assert.match(server, /w\.name AS workspace_name/);
  assert.match(server, /AND p\.project_key = \$1/);
});
