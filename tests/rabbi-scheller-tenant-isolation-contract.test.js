const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');

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
