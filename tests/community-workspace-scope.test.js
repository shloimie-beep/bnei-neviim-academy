const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('BNA signups community endpoint supports explicit workspace project filtering', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/signups', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /const \{ status, payment_status, project \} = req\.query;/);
  assert.match(server, /const scopedProjectKey = opsScopeProjectKey\(req\);/);
  assert.match(server, /const requestedProjectKey = normalizeProjectKey\(project\);/);
  assert.match(server, /const projectKey = scopedProjectKey \|\| requestedProjectKey;/);
  assert.match(server, /COALESCE\(p\.project_key, w\.workspace_key, ''\) = \$\$\{params\.length\}/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = s\.workspace_id/);
  assert.match(server, /LEFT JOIN LATERAL \([\s\S]*?FROM bna_projects p[\s\S]*?WHERE p\.workspace_id = s\.workspace_id/);
  assert.match(server, /p\.project_key,[\s\S]*?w\.workspace_key,[\s\S]*?w\.workspace_type,[\s\S]*?w\.name AS workspace_name/);
});

test('Operations Contacts requests and displays the active workspace context', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /if \(filters\.project\) params\.set\('project', filters\.project\);/);
  assert.match(operations, /api\.getSignups\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /const workspaceLabel = selectedProjectFilter\(\) \? activeWorkspaceProjectLabel\(\) : 'All workspaces';/);
  assert.match(operations, /Workspace: \$\{escapeHtml\(workspaceLabel\)\}/);
  assert.match(operations, /function contactWorkspaceLabel\(signup\) \{/);
  assert.match(operations, /renderContactDetailItem\('Workspace', contactWorkspaceLabel\(signup\) \|\| 'Not set'\)/);
  assert.match(operations, /contactWorkspaceLabel\(signup\)[\s\S]*?<span class="page-status-pill">\$\{escapeHtml\(workspaceLabel\)\}<\/span>/);
});
