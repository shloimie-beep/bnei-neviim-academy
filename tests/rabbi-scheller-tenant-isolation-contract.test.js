const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const contactService = fs.readFileSync('src/lib/bna/crm/contact-service.js', 'utf8');

function serverSlice(startNeedle, endNeedle) {
  const start = server.indexOf(startNeedle);
  assert.notEqual(start, -1, `${startNeedle} should exist`);
  const end = server.indexOf(endNeedle, start);
  assert.notEqual(end, -1, `${endNeedle} should exist after ${startNeedle}`);
  return server.slice(start, end);
}

test('Operations task search remains constrained by scoped project before broad text matching', () => {
  const route = serverSlice(
    "app.get('/api/bna/tasks', requireAdmin",
    "app.post('/api/bna/tasks'"
  );

  const scopedProjectIndex = route.indexOf('const scopedProjectKey = opsScopeProjectKey(req);');
  const projectKeyIndex = route.indexOf("const projectKey = scopedProjectKey || normalizeProjectKey(project_key || project || '');");
  const projectFilterIndex = route.indexOf("if (projectKey && projectKey !== 'all') where.push(`p.project_key");
  const searchIndex = route.indexOf('if (search) {');
  const taskBaseWhereIndex = route.indexOf("WHERE ${where.join(' AND ')}");

  assert.ok(scopedProjectIndex > -1, 'route should resolve the server-side scoped project');
  assert.ok(projectKeyIndex > scopedProjectIndex, 'scoped project should override requested project');
  assert.ok(projectFilterIndex > projectKeyIndex, 'project filter should be part of the base WHERE');
  assert.ok(searchIndex > projectFilterIndex, 'search should not be built before tenant scope');
  assert.ok(taskBaseWhereIndex > searchIndex, 'task_base should apply both scope and search conditions');

  const relatedTaskBaseFilters = route.match(/WHERE task_id IN \(SELECT id FROM task_base\)/g) || [];
  assert.ok(relatedTaskBaseFilters.length >= 4, 'comments, activity, and agent job related rows should be limited to task_base');
  assert.doesNotMatch(route, /const projectKey = normalizeProjectKey\(project_key \|\| project \|\| ''\)/);
});

test('Operations task detail scopes child linked tasks for provider-scoped logins', () => {
  const route = serverSlice(
    "app.get('/api/bna/tasks/:id', requireAdmin",
    "app.get('/api/bna/tasks/:id/comments'"
  );

  const accessCheckIndex = route.indexOf('await assertTaskAccess(req, req.params.id);');
  const taskLoadIndex = route.indexOf('const result = await pool.query');
  assert.ok(accessCheckIndex > -1, 'detail route should check task access first');
  assert.ok(taskLoadIndex > accessCheckIndex, 'task access must be checked before the detail query');

  assert.match(route, /const linkedTaskScopedProjectKey = opsScopeProjectKey\(req\);/);
  assert.match(route, /linkedTaskWhere\.push\(`p\.project_key = \$\$\{linkedTaskParams\.length\}`\);/);
  assert.match(route, /FROM bna_tasks child\s+LEFT JOIN bna_projects p ON p\.id = child\.project_id\s+WHERE \$\{linkedTaskWhere\.join\(' AND '\)\}/);
  assert.doesNotMatch(route, /FROM bna_tasks\s+WHERE parent_task_id = \$1/);
});

test('One Time CRM contacts and timelines require explicit workspace or project ownership', () => {
  const listRows = serverSlice(
    'async function operationsCrmContactRows',
    'async function operationsCrmTimelineRows'
  );

  assert.match(listRows, /contactConditions\.push\(`ws\.workspace_key = \$\$\{contactParams\.length\}`\);/);
  assert.match(listRows, /leadConditions\.push\(`p\.project_key = \$\$\{leadParams\.length\}`\);/);
  assert.match(listRows, /LEFT JOIN bna_workspace_settings ws ON ws\.id = c\.workspace_id/);
  assert.match(listRows, /LEFT JOIN bna_projects p ON p\.id = l\.project_id/);

  const timelineRows = serverSlice(
    'async function operationsCrmTimelineRows',
    'async function getProviderPortalPayload'
  );

  assert.match(timelineRows, /conditions\.push\(`p\.project_key = \$\$\{params\.length\}`\);/);
  assert.match(timelineRows, /communicationConditions\.push\(`workspace_id IN \(SELECT id FROM bna_workspace_settings WHERE workspace_key = \$\$\{params\.length\}\)`\);/);
  assert.match(timelineRows, /pipelineConditions\.push\(`workspace_id IN \(SELECT id FROM bna_workspace_settings WHERE workspace_key = \$\$\{params\.length\}\)`\);/);
  assert.doesNotMatch(timelineRows, /primary_email\s*=\s*|parent_email\s*=\s*|from_address\s*=\s*/i);
});

test('One Time CRM and communications routes derive scope server-side before querying', () => {
  const contactsRoute = serverSlice(
    "app.get('/api/bna/crm/contacts', requireAdmin",
    "app.get('/api/bna/crm/contacts/:id/timeline'"
  );
  assert.match(contactsRoute, /const workspaceKey = assertWorkspaceAccess\(req, scope\.workspace_key \|\| defaultWorkspaceKeyForRequest\(req\)\);/);
  assert.match(contactsRoute, /scope\.project_key = scope\.project_key \|\| workspaceProjectKey\(workspaceKey\) \|\| opsScopeProjectKey\(req\) \|\| null;/);
  assert.match(contactsRoute, /const payload = await operationsCrmContactService\.listContacts\(scope, filters\);/);

  const timelineRoute = serverSlice(
    "app.get('/api/bna/crm/contacts/:id/timeline', requireAdmin",
    "app.post('/api/bna/assistant/scope-plan'"
  );
  assert.match(timelineRoute, /const workspaceKey = assertWorkspaceAccess\(req, scope\.workspace_key \|\| defaultWorkspaceKeyForRequest\(req\)\);/);
  assert.match(timelineRoute, /const payload = await operationsCrmContactService\.getContactTimeline\(req\.params\.id, scope\);/);
  assert.match(server, /const operationsCrmContactService = createContactService\({[\s\S]*listContactRows: operationsCrmContactRows,[\s\S]*timelineRows: operationsCrmTimelineRows,[\s\S]*parseContactRef: parseCrmContactRef,[\s\S]*}\);/);

  const communicationsFilters = serverSlice(
    'function buildCommunicationsQueryFilters',
    "app.get('/api/bna/communications', requireAdmin"
  );
  assert.match(communicationsFilters, /const projectKey = requestedProjectKeyForScopedList\(req\);/);
  assert.match(communicationsFilters, /COALESCE\(project_id, \(SELECT id FROM bna_projects WHERE project_key = '\$\{DEFAULT_PROJECT_KEY\}' LIMIT 1\)\)/);
});

test('One Time CRM list API is bounded and cursor-paginated', () => {
  const listRows = serverSlice(
    'function crmListSourceFetchLimit',
    'async function operationsCrmTimelineRows'
  );
  assert.match(listRows, /const limit = crmContactModel\.crmListLimit\(options\.limit\);/);
  assert.match(listRows, /const cursor = crmContactModel\.decodeCrmCursor\(options\.cursor\);/);
  assert.match(listRows, /return Math\.min\(500, cursor\.offset \+ limit \+ 1\);/);
  assert.match(listRows, /LIMIT \$\$\{contactLimitParam\}/);
  assert.match(listRows, /LIMIT \$\$\{leadLimitParam\}/);

  const contactsRoute = serverSlice(
    "app.get('/api/bna/crm/contacts', requireAdmin",
    "app.get('/api/bna/crm/contacts/:id/timeline'"
  );
  assert.match(contactsRoute, /limit: req\.query\.limit/);
  assert.match(contactsRoute, /cursor: req\.query\.cursor/);
  assert.match(contactsRoute, /const payload = await operationsCrmContactService\.listContacts\(scope, filters\);/);
  assert.match(contactService, /aggregate_service: 'bna_crm_contact_service_v1'/);
});
