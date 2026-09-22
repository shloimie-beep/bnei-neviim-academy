const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const operationsBootstrap = fs.readFileSync('public/operations-bootstrap.html', 'utf8');
const operationsShellCss = fs.readFileSync('public/css/operations-shell.css', 'utf8');
const operationsShellJs = fs.readFileSync('public/js/operations-shell.js', 'utf8');
const operationsDeferredRenderersJs = fs.readFileSync('public/js/operations-deferred-renderers.js', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Operations shell exposes workspace selector, module sidebar, top filter rail, and mobile drawer', () => {
  assert.match(operations, /function renderWorkspaceSwitcher/);
  assert.match(operations, /function switchWorkspace/);
  assert.match(operations, /Workspace Directory/);
  assert.match(operations, /let sidebarMode = 'modules'/);
  assert.match(operations, /\$\{renderSidebarModuleList\(navItems\)\}/);
  assert.match(operations, /function renderSidebarSubnav/);
  assert.match(operations, /function currentSubnavConfig/);
  assert.match(operations, /class="ops-sidebar-drilldown ops-nested-subnav"/);
  assert.match(operations, /function showAllModulesSidebar/);
  assert.doesNotMatch(operations, /sidebarMode = 'sections'/);
  assert.match(operations, /function renderTopFilterRail/);
  assert.match(operations, /data-top-filter-rail="true"/);
  assert.match(operations, /data-current-module="\$\{escapeHtml\(currentView\)\}"/);
  assert.match(operations, /class="ops-filter-track" role="tablist"/);
  assert.match(operations, /function setCurrentSection/);
  assert.match(operations, /function openNavDrawer/);
  assert.match(operations, /function closeNavDrawer/);
  assert.match(operations, /<header class="mobile-app-header">/);
  assert.match(operations, /aria-label="Open navigation"/);
  assert.match(operations, /\.ops-app-shell\.drawer-open \.ops-main\s*{[\s\S]*display:\s*none/);
  assert.doesNotMatch(operations, /data-module-toolbar-priority/);
  assert.doesNotMatch(operations, /data-module-toolbar-id/);
});

test('Operations top filter rail is current-module subview navigation', () => {
  assert.match(operations, /function topFilterRailItems/);
  assert.match(operations, /const config = currentSubnavConfig\(\)/);
  assert.match(operations, /tabsWithCounts\(config\.tabs \|\| \[\], config\.countSource \|\| \{\}\)/);
  assert.match(operations, /tab\.source_view \? `openSidebarNavItem\(\$\{attrJson\(tab\.source_view\)\}/);
  assert.match(operations, /: `setCurrentSection\(\$\{attrJson\(tab\.id\)\}\)`/);
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

test('Operations route uses a small split bootstrap with cacheable shell assets', () => {
  assert.ok(Buffer.byteLength(operationsBootstrap, 'utf8') < 10000, 'split Operations bootstrap should stay small');
  assert.match(operationsBootstrap, /<link rel="stylesheet" href="\/css\/operations-shell\.css">/);
  assert.match(operationsBootstrap, /<script src="\/js\/operations-shell\.js"><\/script>/);
  assert.doesNotMatch(operationsBootstrap, /\/\/ API Client/);
  assert.doesNotMatch(operationsBootstrap, /function renderDashboard/);
  assert.match(operationsShellCss, /\.ops-app-shell/);
  assert.match(operationsShellJs, /async function loadData/);
  assert.match(operationsShellJs, /function renderAppShell/);
  assert.match(operationsShellJs, /OPERATIONS_DEFERRED_RENDER_CHUNK = '\/js\/operations-deferred-renderers\.js'/);
  assert.match(operationsShellJs, /renderDeferredView\('content', 'renderContent'\)/);
  assert.match(operationsShellJs, /const EMAIL_INBOX_SCOPES = \[/);
  assert.match(operationsShellJs, /function emailInboxScopeRecord/);
  assert.match(operationsShellJs, /function emailInboxFilters/);
  assert.match(operationsShellJs, /async function fetchCommunicationsIntegrationBundle/);
  assert.match(operationsShellJs, /function dataRequestWithTimeout/);
  assert.match(operationsShellJs, /const needsWorkspaceDirectoryData = !oneTimeProgramLightPass/);
  assert.doesNotMatch(operationsShellJs, /function renderContent\(/);
  assert.doesNotMatch(operationsShellJs, /function renderStudents\(/);
  assert.doesNotMatch(operationsShellJs, /function renderLiveClasses\(/);
  const normalizedShellJs = operationsShellJs.replace(/\r\n/g, '\n');
  assert.ok(Buffer.byteLength(normalizedShellJs, 'utf8') < 1200000, 'initial Operations JS should stay below 1.2MB');
  assert.match(operationsDeferredRenderersJs, /function renderContent\(/);
  assert.match(operationsDeferredRenderersJs, /function renderStudents\(/);
  assert.match(operationsDeferredRenderersJs, /function renderLiveClasses\(/);
  assert.doesNotMatch(operationsDeferredRenderersJs, /const EMAIL_INBOX_SCOPES = \[/);
  assert.match(operationsDeferredRenderersJs, /window\.__operationsDeferredRenderersLoaded = true/);
  assert.match(operationsShellJs, /const oneTimeProgramFastPass = !options\.background/);
  assert.match(operationsShellJs, /window\.setTimeout\(\(\) => loadData\(\{ background: true \}\), 0\)/);
  assert.match(server, /function sendOperationsShell[\s\S]*operations-bootstrap\.html/);
  assert.match(server, /endsWith\('\/css\/operations-shell\.css'\)/);
  assert.match(server, /endsWith\('\/js\/operations-shell\.js'\)/);
  assert.match(server, /endsWith\('\/js\/operations-deferred-renderers\.js'\)/);
});
