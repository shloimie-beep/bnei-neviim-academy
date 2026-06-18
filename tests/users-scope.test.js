const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Workspace invitation schema is canonical and workspace scoped', () => {
  const server = read('server.js');

  assert.match(server, /const createWorkspaceInvitationsSQL = `/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_workspace_invitations/);
  assert.match(server, /workspace_id INTEGER REFERENCES bna_workspaces\(id\) ON DELETE SET NULL/);
  assert.match(server, /project_id INTEGER REFERENCES bna_projects\(id\) ON DELETE CASCADE/);
  assert.match(server, /access_level TEXT NOT NULL DEFAULT 'member' CHECK \(access_level IN \('owner', 'manager', 'member', 'viewer'\)\)/);
  assert.match(server, /status TEXT NOT NULL DEFAULT 'pending' CHECK \(status IN \('pending', 'accepted', 'revoked', 'expired'\)\)/);
  assert.match(server, /await pool\.query\(createWorkspaceInvitationsSQL\);/);
  assert.match(server, /idx_bna_workspace_invitations_workspace_id/);
  assert.match(server, /idx_bna_workspace_invitations_project_id/);
});

test('Users and invitations endpoints are read-only and server-side scoped', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/users', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /app\.get\('\/api\/bna\/invitations', requireAdmin, async \(req, res\) => \{/);
  assert.doesNotMatch(server, /app\.post\('\/api\/bna\/users'/);
  assert.doesNotMatch(server, /app\.post\('\/api\/bna\/invitations'/);
  assert.match(server, /const scopedProjectKey = opsScopeProjectKey\(req\);/);
  assert.match(server, /const requestedProjectKey = project && project !== 'all' \? normalizeProjectKey\(project\) : '';/);
  assert.match(server, /const projectKey = scopedProjectKey \|\| requestedProjectKey;/);
  assert.match(server, /FROM bna_project_members pm/);
  assert.match(server, /FROM bna_workspace_invitations i/);
  assert.match(server, /COALESCE\(p\.project_key, w\.workspace_key, ''\) = \$\$\{params\.length\}/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = COALESCE\(pm\.workspace_id, p\.workspace_id\)/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = COALESCE\(i\.workspace_id, p\.workspace_id\)/);
});

test('Operations UI loads and renders workspace users and invitations', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /getUsers\(filters = \{\}\)/);
  assert.match(operations, /getInvitations\(filters = \{\}\)/);
  assert.match(operations, /let workspaceUsers = \[\];/);
  assert.match(operations, /let workspaceInvitations = \[\];/);
  assert.match(operations, /id: 'users', label: 'Users'/);
  assert.match(operations, /viewAllowed\('users'\) \? api\.getUsers\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ users: \[\] \}\)/);
  assert.match(operations, /viewAllowed\('users'\) \? api\.getInvitations\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ invitations: \[\] \}\)/);
  assert.match(operations, /case 'users': content = renderUsers\(\); break;/);
  assert.match(operations, /function renderUsers\(\) \{/);
  assert.match(operations, /function renderWorkspaceUserCard\(user\) \{/);
  assert.match(operations, /function renderWorkspaceInvitationCard\(invite\) \{/);
  assert.match(operations, /workspaceUsers = \[\];/);
  assert.match(operations, /workspaceInvitations = \[\];/);
});

