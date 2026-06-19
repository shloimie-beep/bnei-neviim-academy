const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Operations shell exposes workspace selector, sidebar drilldown, and mobile drawer', () => {
  assert.match(operations, /function renderWorkspaceSwitcher/);
  assert.match(operations, /function switchWorkspace/);
  assert.match(operations, /Workspace Directory/);
  assert.match(operations, /function renderSidebarSubnav/);
  assert.match(operations, /function currentSubnavConfig/);
  assert.match(operations, /class="ops-sidebar-drilldown ops-nested-subnav"/);
  assert.match(operations, /function showAllModulesSidebar/);
  assert.match(operations, /sidebarMode = 'sections'/);
  assert.match(operations, /function setCurrentSection/);
  assert.match(operations, /function openNavDrawer/);
  assert.match(operations, /function closeNavDrawer/);
  assert.match(operations, /<header class="mobile-app-header">/);
  assert.match(operations, /aria-label="Open navigation"/);
  assert.match(operations, /\.ops-app-shell\.drawer-open \.ops-main\s*{[\s\S]*display:\s*none/);
});

test('Operations module toolbar includes first-class Agents navigation', () => {
  assert.match(operations, /const MODULE_TOOLBAR_PRIORITY = \[\s*'decisions',\s*'tasks',\s*'agents',\s*'calendar',\s*'students',\s*'content',\s*'community',\s*'accounting',\s*'automations',\s*'admin',\s*'integrations'\s*\]/);
  assert.match(operations, /function renderModuleToolbar/);
  assert.match(operations, /data-module-toolbar-priority="\$\{MODULE_TOOLBAR_PRIORITY\.join\(','\)\}"/);
  assert.match(operations, /agents: \(\) => canUseView\('agents'\) \? \{/);
  assert.match(operations, /id: 'agents'[\s\S]*label: 'Agents'[\s\S]*action: "switchView\('agents'\)"/);
  assert.match(operations, /currentView === 'agents'/);
  assert.match(operations, /AGENT_RUN_TABS/);
  assert.match(server, /const platformAllowedViews = \['dashboard', 'watchdog', 'pipelines', 'tasks', 'agents'/);
});

test('Operations topbar keeps concise status chips and one helper entry per header', () => {
  for (const label of ['Need decision', 'Codex Queue', 'Student accountability', 'Alerts']) {
    assert.match(operations, new RegExp(label));
  }
  assert.match(operations, /function operationsTopbarStatusChips/);
  assert.match(operations, /openCommandTarget\('tasks', 'codex_queue'\)/);
  assert.match(operations, /data-bna-helper-open="true"/);
  assert.equal((operations.match(/data-bna-helper-open="true"/g) || []).length, 2);
  assert.match(operations, /<header class="mobile-app-header">[\s\S]*data-bna-helper-open="true"/);
  assert.match(operations, /<header class="ops-brand-topbar saas-topbar">[\s\S]*data-bna-helper-open="true"/);
  assert.doesNotMatch(operations, /class="bna-helper-launcher"/);
  assert.doesNotMatch(operations, /bna-bot-widget\.js/);
  assert.doesNotMatch(operations, /openTaskModal\(\)">New Task/);
});
