const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('class sessions endpoint supports explicit workspace project filtering', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/class-sessions', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /const \{ project \} = req\.query;/);
  assert.match(server, /const scopedProjectKey = opsScopeProjectKey\(req\);/);
  assert.match(server, /const requestedProjectKey = project && project !== 'all' \? normalizeProjectKey\(project\) : '';/);
  assert.match(server, /const projectKey = scopedProjectKey \|\| requestedProjectKey;/);
  assert.match(server, /COALESCE\(p\.project_key, w\.workspace_key, ''\) = \$\$\{params\.length\}/);
  assert.match(server, /await ensureDefaultProjects\(\);/);
  assert.match(server, /row_to_json\(j\.\*\) AS content_job/);
  assert.match(server, /p\.project_key,[\s\S]*?p\.name AS project_name,[\s\S]*?p\.short_name AS project_short_name/);
  assert.match(server, /w\.workspace_key,[\s\S]*?w\.workspace_type,[\s\S]*?w\.name AS workspace_name/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = COALESCE\(cs\.workspace_id, j\.workspace_id\)/);
  assert.match(server, /LEFT JOIN LATERAL \([\s\S]*?FROM bna_projects p[\s\S]*?WHERE p\.workspace_id = COALESCE\(cs\.workspace_id, j\.workspace_id\)/);
});

test('Calendar class-session feed remains workspace scoped for the selected Operations workspace', () => {
  const server = read('server.js');
  const operations = read('public/operations.html');

  assert.match(server, /const workspaceParams = \[\];/);
  assert.match(server, /workspaceScopeClause = `AND COALESCE\(w\.workspace_key, ''\) = \$\$\{workspaceParams\.length\}`;/);
  assert.match(server, /FROM bna_class_sessions cs[\s\S]*?LEFT JOIN bna_workspaces w ON w\.id = cs\.workspace_id[\s\S]*?WHERE cs\.class_date IS NOT NULL[\s\S]*?\$\{workspaceScopeClause\}/);
  assert.match(server, /source_type: 'class_session'/);
  assert.match(operations, /viewAllowed\('calendar'\) \? api\.getCalendar\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /calendarEventTypeLabel\(type\)[\s\S]*?class_session: 'Class'/);
});
