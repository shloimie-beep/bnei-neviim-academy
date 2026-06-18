const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');

const workspaceScopedTables = [
  'signups',
  'bna_signup_agreement_signatures',
  'bna_tasks',
  'bna_projects',
  'bna_project_members',
  'bna_task_comments',
  'bna_assistant_memory',
  'bna_payment_log',
  'bna_email_log',
  'bna_payment_intake',
  'bna_students',
  'bna_devices',
  'bna_torah_learning_goals',
  'bna_torah_learning_entries',
  'bna_green_invoice_webhook_log',
  'bna_accountability_events',
  'bna_device_access_rules',
  'bna_device_access_sessions',
  'bna_group_goals',
  'bna_group_goal_entries',
  'bna_content_jobs',
  'bna_class_sessions',
  'bna_content_outputs',
  'bna_content_prompt_examples',
  'bna_content_bundles',
  'bna_content_bundle_items'
];

test('workspace table is canonical and initialized before dependent tables', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_workspaces/);
  assert.match(server, /workspace_type TEXT NOT NULL CHECK \(workspace_type IN \('school', 'service_provider', 'family'\)\)/);
  assert.doesNotMatch(server, /workspace_type IN \([^)]*'super_admin'/);

  const createWorkspaceCall = server.indexOf('await pool.query(createWorkspacesSQL);');
  const createSignupCall = server.indexOf('await pool.query(createSignupsTableSQL);');
  const createProjectCall = server.indexOf('await pool.query(createProjectsSQL);');

  assert.ok(createWorkspaceCall > -1, 'initDb should create bna_workspaces');
  assert.ok(createWorkspaceCall < createSignupCall, 'workspaces should exist before signups use workspace_id');
  assert.ok(createWorkspaceCall < createProjectCall, 'workspaces should exist before projects use workspace_id');
});

test('workspace-owned tables get idempotent workspace_id migrations and indexes', () => {
  for (const table of workspaceScopedTables) {
    assert.match(
      server,
      new RegExp(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces\\(id\\) ON DELETE SET NULL;`),
      `${table} should have a safe workspace_id migration`
    );
    assert.match(
      server,
      new RegExp(`CREATE INDEX IF NOT EXISTS [a-z0-9_]+ ON ${table.replace(/_/g, '_')} \\(workspace_id\\);`),
      `${table} should have a workspace_id index`
    );
  }
});

test('default workspaces and legacy backfills are seeded on startup', () => {
  assert.match(server, /async function ensureDefaultWorkspaces/);
  assert.match(server, /workspaceKey: DEFAULT_WORKSPACE_KEY/);
  assert.match(server, /workspaceType: 'school'/);
  assert.match(server, /workspaceKey: ONE_TIME_WORKSPACE_KEY/);
  assert.match(server, /workspaceType: 'service_provider'/);
  assert.match(server, /async function backfillWorkspaceScope/);
  assert.match(server, /UPDATE bna_tasks t\s+SET workspace_id = p\.workspace_id/s);
  assert.match(server, /UPDATE bna_content_jobs\s+SET workspace_id = \$1[\s\S]+one time\|mishnah\|mishna\|rabbi elie scheller/);
  assert.match(server, /await backfillWorkspaceScope\(\{ bnaWorkspace, oneTimeWorkspace \}, db\);/);
});

test('primary create paths write workspace_id immediately', () => {
  assert.match(server, /INSERT INTO bna_tasks \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_students \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_devices \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_accountability_events \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_torah_learning_goals \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_torah_learning_entries \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_payment_intake \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_content_jobs \(\s*workspace_id,/);
  assert.match(server, /INSERT INTO bna_content_outputs \(workspace_id,/);
  assert.match(server, /INSERT INTO bna_content_bundles \(workspace_id,/);
  assert.match(server, /INSERT INTO bna_group_goal_entries \(\s*workspace_id,/);
});

test('protected legacy migrate endpoint runs the workspace migration too', () => {
  const migrateRoute = server.slice(server.indexOf("app.post('/api/bna/migrate-db'"));

  assert.match(migrateRoute, /CREATE TABLE IF NOT EXISTS bna_workspaces/);
  assert.match(migrateRoute, /workspace_id INTEGER REFERENCES bna_workspaces\(id\) ON DELETE SET NULL/);
  assert.match(migrateRoute, /await pool\.query\(createWorkspacesSQL\);/);
  assert.match(migrateRoute, /await pool\.query\(createWorkspaceScopeMigrationSQL\);/);
  assert.match(migrateRoute, /await ensureDefaultProjects\(\);/);
});
