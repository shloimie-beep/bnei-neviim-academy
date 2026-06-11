const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const parent = fs.readFileSync('public/parent.html', 'utf8');
const student = fs.readFileSync('public/student.html', 'utf8');
const provider = fs.readFileSync('public/provider.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Operations uses the SaaS shell with global nav, workspace switcher, and nested subnav', () => {
  for (const id of [
    'dashboard',
    'pipelines',
    'tasks',
    'students',
    'contacts',
    'content',
    'calendar',
    'service_providers',
    'communications',
    'internal_dialogue',
    'accounting',
    'api_usage',
    'admin',
    'settings',
  ]) {
    assert.match(operations, new RegExp(`\\{ id: '${id}'`));
  }
  assert.match(operations, /function renderWorkspaceSwitcher/);
  assert.match(operations, /function switchWorkspace/);
  assert.match(operations, /function workspaceNavViewIds/);
  assert.match(operations, /Current Workspace/);
  assert.match(operations, /Platform \/ Super Admin/);
  assert.match(operations, /BNA School Workspace/);
  assert.match(operations, /Rabbi Sheller Provider Workspace/);
  assert.match(operations, /function renderSidebarSubnav/);
  assert.match(operations, /function currentSubnavConfig/);
  assert.match(operations, /class="ops-nested-subnav"/);
  assert.match(operations, /class="ops-brand-topbar saas-topbar"/);
  assert.match(operations, /function renderSectionNav\(tabs, activeId, handlerName\) \{\s*return '';/);
  assert.match(operations, /\.ops-app-shell\.drawer-open \.ops-main\s*{[\s\S]*display:\s*none/);
});

test('Operations exposes provider, communications, API usage, settings, and disabled placeholders', () => {
  assert.match(operations, /function renderPipelines/);
  assert.match(operations, /function renderCalendar/);
  assert.match(operations, /function renderInternalDialogue/);
  assert.match(operations, /function renderCommandBotPanel/);
  assert.match(operations, /function renderServiceProviders/);
  assert.match(operations, /function renderCommunications/);
  assert.match(operations, /function renderApiUsage/);
  assert.match(operations, /function renderTeamAdmin/);
  assert.match(operations, /function renderSettings/);
  assert.match(operations, /function renderNotConfiguredPanel/);
  assert.match(operations, /Estimated Cost/);
  assert.match(operations, /Detailed token, model, cost, budget, and export controls need backend metering/);
  assert.match(operations, /Website Import/);
  assert.match(operations, /Provider Workspace/);
  assert.match(operations, /Email Identities/);
  assert.match(operations, /Google Classroom/);
  assert.match(operations, /WhatsApp/);
  assert.match(operations, /Social Accounts/);
  assert.match(server, /allowedViews: platformAllowedViews/);
  assert.match(server, /allowedViews: providerAllowedViews/);
});

test('Operations platform scope has backend workspace, connector, calendar, pipeline, dialogue, and bot action APIs', () => {
  for (const table of [
    'bna_workspace_settings',
    'bna_connector_settings',
    'bna_calendar_events',
    'bna_pipeline_cards',
    'bna_internal_threads',
    'bna_internal_messages',
    'bna_bot_action_logs',
  ]) {
    assert.match(server, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  for (const route of [
    "app.get('/api/bna/workspace-platform'",
    "app.patch('/api/bna/workspace-settings/:workspaceKey'",
    "app.get('/api/bna/connector-settings'",
    "app.patch('/api/bna/connector-settings/:id'",
    "app.get('/api/bna/calendar-events'",
    "app.post('/api/bna/calendar-events'",
    "app.get('/api/bna/pipeline-cards'",
    "app.post('/api/bna/pipeline-cards'",
    "app.get('/api/bna/internal-dialogue'",
    "app.post('/api/bna/internal-dialogue/messages'",
    "app.post('/api/bna/bot-actions/preview'",
  ]) {
    assert.ok(server.includes(route), `missing route ${route}`);
  }
  assert.match(server, /function ensureWorkspacePlatformDefaults/);
  assert.match(server, /scopedWorkspace && requestedWorkspace && requestedWorkspace !== scopedWorkspace/);
  assert.match(server, /GHL is not the operating system/);
  assert.match(operations, /createPipelineCardPrompt/);
  assert.match(operations, /createCalendarEventPrompt/);
  assert.match(operations, /createInternalDialogueNotePrompt/);
  assert.match(operations, /previewBotActionFromPanel/);
});

test('Operations task and student details are query-addressable routed views', () => {
  assert.match(operations, /const initialTask = initialParams\.get\('task'\)/);
  assert.match(operations, /if \(currentView === 'tasks' && selectedTaskId\) url\.searchParams\.set\('task', selectedTaskId\)/);
  assert.match(operations, /function renderTaskDetailPage/);
  assert.match(operations, /function openTaskDetail/);
  assert.match(operations, /function closeTaskDetail/);
  assert.match(operations, /Open detail page for notes, timestamps, comments, and decisions/);
  assert.match(operations, /\{ id: 'parent_family', label: 'Parent \/ Family' \}/);
  assert.match(operations, /\{ id: 'documents', label: 'Documents' \}/);
  assert.match(operations, /\{ id: 'bot_settings', label: 'Bot Settings' \}/);
  assert.match(operations, /\{ id: 'activity', label: 'Activity' \}/);
  assert.match(operations, /function renderStudentDocumentsView/);
  assert.match(operations, /function renderStudentBotSettingsView/);
  assert.match(operations, /function renderStudentActivityView/);
});

test('Parent, student, and provider portals use the new workspace section models with RTL support', () => {
  assert.match(parent, /let activeParentSection = 'home'/);
  assert.match(parent, /\{ id: 'home', label: t\('home'\)/);
  assert.match(parent, /function parentChildrenLabel/);
  assert.match(parent, /\{ id: 'children', label: parentChildrenLabel\(data\)/);
  assert.match(parent, /\{ id: 'providers', label: t\('providerIndex'\)/);
  assert.match(parent, /function renderParentHome/);
  assert.match(parent, /function renderParentChildren/);
  assert.match(parent, /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr'/);

  assert.match(student, /\{ id: 'overview', label: t\('home'\)/);
  assert.match(student, /\{ id: 'documents', label: t\('documentsLinks'\)/);
  assert.match(student, /\{ id: 'bot', label: t\('bot'\)/);
  assert.match(student, /\{ id: 'help_account', label: t\('helpAccount'\)/);
  assert.match(student, /function renderStudentDocuments/);
  assert.match(student, /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr'/);

  assert.match(provider, /function providerSections/);
  assert.match(provider, /Profile \/ Listing/);
  assert.match(provider, /Website Import/);
  assert.match(provider, /Communications/);
  assert.match(provider, /Settings writes are disabled/);
});
