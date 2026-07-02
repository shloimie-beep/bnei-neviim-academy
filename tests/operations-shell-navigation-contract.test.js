const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

function functionSlice(name) {
  const start = operations.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const next = operations.indexOf('\n        function ', start + 1);
  return next === -1 ? operations.slice(start) : operations.slice(start, next);
}

function constSlice(name) {
  const match = operations.match(new RegExp(`const ${name} = \\[[\\s\\S]*?\\];`));
  assert.ok(match, `missing const ${name}`);
  return match[0];
}

test('Operations shell uses sidebar modules, selected-module subnav, and compact record filters', () => {
  const shell = functionSlice('renderAppShell');
  const sidebar = functionSlice('renderSidebar');
  const mobileHeader = functionSlice('renderMobileHeader');

  assert.match(shell, /renderSidebar\(\)/);
  assert.match(shell, /renderOpsTopbar\(\)/);
  assert.match(shell, /renderOperationsSubnav\(\)/);
  assert.match(shell, /renderOperationsFilterRow\(\)/);
  assert.match(shell, /renderBnaHelperDock\(\)/);
  assert.doesNotMatch(shell, /renderModuleToolbar\(\)/);

  assert.match(sidebar, /renderSidebarModuleList\(navItems\)/);
  assert.doesNotMatch(sidebar, /renderSidebarSubnav\(\)/);
  assert.match(operations, /function openNavDrawer/);
  assert.match(operations, /function closeNavDrawer/);
  assert.match(mobileHeader, /aria-label="Open navigation"/);
  assert.doesNotMatch(mobileHeader, /Ask \/ Search/);
  assert.doesNotMatch(mobileHeader, /data-bna-helper-open/);
  assert.doesNotMatch(mobileHeader, /toLocaleDateString/);
  assert.match(operations, /\.ops-app-shell\.drawer-open \.ops-main\s*{[\s\S]*display:\s*none/);
});

test('Operations topbar is identity-only plus current-page primary action', () => {
  const topbar = functionSlice('renderOpsTopbar');
  const helperDock = functionSlice('renderBnaHelperDock');

  assert.match(topbar, /class="ops-brand-topbar saas-topbar"/);
  assert.match(topbar, /breadcrumb-line/);
  assert.match(topbar, /Current page actions/);
  assert.match(topbar, /\$\{primary\}/);
  assert.doesNotMatch(topbar, /operationsTopbarStatusChips/);
  assert.doesNotMatch(topbar, /renderOneTimeRabbiViewAction/);
  assert.doesNotMatch(topbar, /data-bna-helper-open/);
  assert.doesNotMatch(topbar, /Ask \/ Search/);
  assert.doesNotMatch(topbar, /toLocaleDateString/);

  assert.match(helperDock, /class="bna-helper-launcher"/);
  assert.match(helperDock, /data-action-id="ACTION-OPERATIONS-HELPER-OPEN"/);
  assert.equal((operations.match(/data-bna-helper-open="true"/g) || []).length, 1);
  assert.doesNotMatch(operations, /bna-bot-widget\.js/);
  assert.doesNotMatch(operations, /openTaskModal\(\)">New Task/);
});

test('Tasks, communications, content, and contacts expose current-module filters only', () => {
  const taskTabs = constSlice('TASK_PRIMARY_SUBTABS');
  const communicationTabs = constSlice('COMMUNICATIONS_SUBTABS');
  const subnavConfig = functionSlice('currentSubnavConfig');
  const filterRow = functionSlice('renderOperationsFilterRow');
  const taskFilters = functionSlice('renderTaskCompactFilterRow');
  const communicationFilters = functionSlice('renderCommunicationCompactFilterRow');

  for (const id of ['tasks', 'mine', 'decisions', 'codex_queue', 'pending', 'done_activity']) {
    assert.match(taskTabs, new RegExp(`id: '${id}'`));
  }
  assert.match(subnavConfig, /tasks: \{ tabs: TASK_PRIMARY_SUBTABS/);
  assert.match(subnavConfig, /communications: \{ tabs: COMMUNICATIONS_SUBTABS/);
  assert.match(filterRow, /tasks: renderTaskCompactFilterRow/);
  assert.match(filterRow, /communications: renderCommunicationCompactFilterRow/);
  assert.match(filterRow, /content: renderContentCompactFilterRow/);
  assert.match(filterRow, /contacts: renderContactCompactFilterRow/);

  for (const id of ['overview', 'email', 'whatsapp', 'internal', 'bots', 'announcements', 'templates', 'support_threads']) {
    assert.match(communicationTabs, new RegExp(`id: '${id}'`));
  }
  for (const id of ['parents', 'students', 'providers', 'settings']) {
    assert.doesNotMatch(communicationTabs, new RegExp(`id: '${id}'`));
  }
  assert.match(taskFilters, /renderMoreFiltersMenu/);
  assert.match(communicationFilters, /setCommunicationFilter/);
  assert.match(operations, /function setCommunicationFilter/);
});

test('Task cards suppress communication-only logs and communications render sanitized previews', () => {
  assert.match(operations, /function taskIsCommunicationOnlyLog/);
  assert.match(operations, /function taskVisibleInTaskCards/);
  assert.match(functionSlice('taskVisibleToCurrentTaskWorkspace'), /taskVisibleInTaskCards\(task\)/);
  assert.match(operations, /const taskCardBuckets = \{/);
  assert.match(operations, /buckets\.tasks\.filter\(taskVisibleToCurrentTaskWorkspace\)/);
  assert.match(operations, /function renderTaskCardPrimaryAction/);
  assert.match(operations, /function renderTaskCardOverflowActions/);
  assert.doesNotMatch(functionSlice('renderTaskCard'), /renderQueueAuditBadges\(auditItem\)/);

  assert.match(operations, /function sanitizeCommunicationPreview/);
  assert.match(operations, /function uniqueCommunicationsForDisplay/);
  assert.match(operations, /function communicationAttachmentChips/);
  assert.match(functionSlice('renderCommunicationCard'), /sanitizeCommunicationPreview/);
  assert.match(functionSlice('renderCommunicationEntry'), /sanitizeCommunicationPreview/);
});

test('Settings keeps Danger Zone collapsed inside Advanced settings', () => {
  const settingsChildren = functionSlice('settingsCategoryChildren');
  const addendum = functionSlice('renderSettingsCategoryOverviewAddendum');

  assert.match(settingsChildren, /\.filter\(id => id !== 'danger'\)/);
  assert.match(addendum, /category === 'advanced'/);
  assert.match(addendum, /<summary>Danger Zone<\/summary>/);
  assert.match(addendum, /renderSettingsContent\('danger'\)/);
});

test('Operations backend still exposes expected workspace-scoped views', () => {
  assert.match(server, /const platformAllowedViews = \['dashboard', 'watchdog', 'pipelines', 'tasks', 'agents'/);
  assert.match(server, /allowedViews: platformAllowedViews/);
  assert.match(server, /const providerAllowedViews = \[/);
  assert.match(server, /allowedViews: ownerAllowedViews/);
  assert.match(server, /allowedViews: managerAllowedViews/);
});
