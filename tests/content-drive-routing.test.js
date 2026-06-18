const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Drive pipeline config supports per-workspace intake and routing folders', () => {
  const server = read('server.js');

  assert.match(server, /function readGoogleDrivePipelineConfig\(\) \{/);
  assert.match(server, /function configuredDriveFolderId\(config = \{\}, workspaceKey = DEFAULT_PROJECT_KEY, stage = '01 Raw Intake'\) \{/);
  assert.match(server, /function workspaceKeyForDriveFolderId\(folderId, config = readGoogleDrivePipelineConfig\(\)\) \{/);
  assert.match(server, /async function resolveContentWorkspaceRouting\(req, input = \{\}, db = pool\) \{/);
  assert.match(server, /folderProjectKey && normalizeProjectKey\(project\.project_key\) !== folderProjectKey/);
  assert.match(server, /Drive folder belongs to a different workspace/);
  assert.match(server, /const oneTimeRoot = await ensureDriveFolder\(drive, 'Workspace - One Time Mishnah Class', root\.id\);/);
  assert.match(server, /const oneTimeRawIntake = await ensureDriveFolder\(drive, '00 Upload Here - One Time Mishnah Intake', oneTimeRoot\.id\);/);
  assert.match(server, /const workspaceFolders = \{[\s\S]*?\[DEFAULT_WORKSPACE_KEY\][\s\S]*?\[ONE_TIME_WORKSPACE_KEY\]/);
  assert.match(server, /workspaces: Object\.fromEntries\(Object\.entries\(pipeline\.workspaceFolders\)/);
  assert.match(server, /workspaceFolders: pipeline\.workspaceFolders/);
});

test('content job creation and edits resolve workspace Drive routing before writes', () => {
  const server = read('server.js');

  assert.match(server, /const driveRouting = await resolveContentWorkspaceRouting\(req, \{[\s\S]*?drive_folder_id,[\s\S]*?drive_stage,[\s\S]*?\}, client\);/);
  assert.match(server, /driveRouting\.workspaceId/);
  assert.match(server, /driveRouting\.driveFolderId/);
  assert.match(server, /driveRouting\.driveStage/);
  assert.match(server, /const existingJobContext = await assertContentJobAccess\(req, id\);/);
  assert.match(server, /project: existingJobContext\.project_key \|\| existingJobContext\.workspace_key/);
  assert.match(server, /body\.drive_folder_id = driveRouting\.driveFolderId/);
  assert.match(server, /body\.drive_stage = driveRouting\.driveStage/);
  assert.match(server, /res\.status\(err\.statusCode \|\| 500\)\.json\(\{ error: err\.message \}\);/);
});

test('content bundles and combined outputs are scoped and cannot mix workspaces', () => {
  const server = read('server.js');
  const operations = read('public/operations.html');

  assert.match(server, /app\.get\('\/api\/bna\/content-bundles', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /const \{ project \} = req\.query;/);
  assert.match(server, /COALESCE\(p\.project_key, w\.workspace_key, ''\) = \$\$\{params\.length\}/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = b\.workspace_id/);
  assert.match(server, /LEFT JOIN LATERAL \([\s\S]*?FROM bna_projects p[\s\S]*?WHERE p\.workspace_id = b\.workspace_id/);
  assert.match(server, /function assertContentJobsSingleWorkspace\(jobs = \[\]\) \{/);
  assert.match(server, /Content jobs from different workspaces cannot be combined/);
  assert.match(server, /const selectedWorkspaceId = assertContentJobsSingleWorkspace\(selectedJobs\);/);
  assert.match(server, /assertContentJobsSingleWorkspace\(jobs\);/);
  assert.match(operations, /getContentBundles\(filters = \{\}\) \{/);
  assert.match(operations, /if \(filters\.project\) params\.set\('project', filters\.project\);/);
  assert.match(operations, /api\.getContentBundles\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /Workspace: \$\{escapeHtml\(workspaceLabel\)\}/);
});

test('environment example documents workspace Drive config shape without real IDs', () => {
  const envExample = read('.env.example');

  assert.match(envExample, /workspaces\.bna\.rawIntake/);
  assert.match(envExample, /workspaces\.one_time_mishnah_class\.rawIntake/);
});
