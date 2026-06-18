const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('student list and detail helpers resolve records through the selected workspace', () => {
  const server = read('server.js');

  assert.match(server, /function studentProjectKeyFromRequest\(req, input = \{\}\)/);
  assert.match(server, /async function resolveStudentProjectForWrite\(req, input = \{\}, db = pool\)/);
  assert.match(server, /async function assertStudentAccess\(req, studentId, projectKey = studentProjectKeyFromRequest\(req\), db = pool\)/);
  assert.match(server, /async function assertDeviceAccess\(req, deviceId, projectKey = studentProjectKeyFromRequest\(req\), db = pool\)/);
  assert.match(server, /async function assertAccountabilityEventAccess\(req, eventId, projectKey = studentProjectKeyFromRequest\(req\), db = pool\)/);
  assert.match(server, /async function assertGroupGoalAccess\(req, goalId, projectKey = studentProjectKeyFromRequest\(req\), db = pool\)/);

  assert.match(
    server,
    /app\.get\('\/api\/bna\/students'[\s\S]*const projectKey = studentProjectKeyFromRequest\(req\);[\s\S]*addAccountingProjectCondition\(conditions, params, projectKey, 'proj', 'w'\);[\s\S]*res\.json\(\{ students: result\.rows, project: projectKey \|\| 'all' \}\);/
  );
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = s\.workspace_id/);
  assert.match(server, /FROM bna_projects p\s+WHERE p\.workspace_id = s\.workspace_id/);
});

test('student mutations assert workspace access before changing student-owned records', () => {
  const server = read('server.js');

  assert.match(server, /app\.post\('\/api\/bna\/students'[\s\S]*await resolveStudentProjectForWrite\(req, req\.body \|\| \{\}\)/);
  assert.match(server, /app\.patch\('\/api\/bna\/students\/:id'[\s\S]*await assertStudentAccess\(req, id, studentProjectKeyFromRequest\(req, req\.body \|\| \{\}\)\)/);
  assert.match(server, /app\.delete\('\/api\/bna\/students\/:id'[\s\S]*await assertStudentAccess\(req, id, studentProjectKeyFromRequest\(req\)\)/);
  assert.match(server, /app\.post\('\/api\/bna\/students\/:id\/merge'[\s\S]*await assertStudentAccess\(req, id, projectKey, client\)/);
  assert.match(server, /Duplicate student merge must stay inside one workspace/);
  assert.match(server, /UPDATE bna_accountability_events[\s\S]*WHERE student_id = \$1\s+AND workspace_id IS NOT DISTINCT FROM \$3/);

  assert.match(server, /app\.post\('\/api\/bna\/students\/:id\/devices'[\s\S]*await assertStudentAccess\(req, req\.params\.id, studentProjectKeyFromRequest\(req, req\.body \|\| \{\}\)\)/);
  assert.match(server, /app\.patch\('\/api\/bna\/devices\/:id'[\s\S]*await assertDeviceAccess\(req, req\.params\.id, studentProjectKeyFromRequest\(req, req\.body \|\| \{\}\)\)/);
  assert.match(server, /app\.post\('\/api\/bna\/devices\/:id\/actions'[\s\S]*await assertDeviceAccess\(req, req\.params\.id, studentProjectKeyFromRequest\(req, req\.body \|\| \{\}\)\)/);
});

test('accountability and group-goal writes stay inside the selected student workspace', () => {
  const server = read('server.js');

  assert.match(server, /app\.post\('\/api\/bna\/accountability'[\s\S]*const projectKey = studentProjectKeyFromRequest\(req, req\.body \|\| \{\}\);[\s\S]*await assertStudentAccess\(req, student_id, projectKey\)/);
  assert.match(server, /app\.patch\('\/api\/bna\/accountability\/:id'[\s\S]*await assertAccountabilityEventAccess\(req, id, projectKey\)/);
  assert.match(server, /app\.delete\('\/api\/bna\/accountability\/:id'[\s\S]*await assertAccountabilityEventAccess\(req, id, studentProjectKeyFromRequest\(req\)\)/);
  assert.match(server, /DELETE FROM bna_accountability_events WHERE id = \$1 AND workspace_id IS NOT DISTINCT FROM \$2/);

  assert.match(server, /app\.get\('\/api\/bna\/group-goals'[\s\S]*addAccountingProjectCondition\(conditions, params, projectKey, 'proj', 'w'\);[\s\S]*res\.json\(\{ goals: result\.rows, project: projectKey \|\| 'all' \}\);/);
  assert.match(server, /app\.post\('\/api\/bna\/group-goals'[\s\S]*await resolveStudentProjectForWrite\(req, req\.body \|\| \{\}\)/);
  assert.match(server, /app\.post\('\/api\/bna\/group-goals\/:id\/entries'[\s\S]*await assertGroupGoalAccess\(req, id, projectKey\)/);
  assert.match(server, /Group goal entry student must belong to the same workspace as the goal/);
});

test('Torah learning is readable only as scoped summary and writable only in BNA', () => {
  const server = read('server.js');

  assert.match(server, /function emptyTorahLearningSummary\(dateInput, projectKey = DEFAULT_PROJECT_KEY\)/);
  assert.match(server, /if \(projectKey !== DEFAULT_PROJECT_KEY\) \{\s+return emptyTorahLearningSummary\(dateString, projectKey\);/);
  assert.match(server, /function assertTorahProjectAccess\(projectKey = DEFAULT_PROJECT_KEY\)/);
  assert.match(server, /Torah learning is only available in the BNA workspace/);
  assert.match(server, /app\.get\('\/api\/bna\/torah-learning'[\s\S]*getTorahLearningSummary\([\s\S]*\{ projectKey \}/);
  assert.match(server, /app\.post\('\/api\/bna\/torah-learning\/entries'[\s\S]*assertTorahProjectAccess\(studentProjectKeyFromRequest\(req, req\.body \|\| \{\}\) \|\| DEFAULT_PROJECT_KEY\)/);
  assert.match(server, /app\.post\('\/api\/bna\/torah-learning\/reconcile-trip-progress'[\s\S]*assertTorahProjectAccess\(studentProjectKeyFromRequest\(req, body\) \|\| DEFAULT_PROJECT_KEY\)/);
});

test('Operations student UI sends the active workspace on reads and writes', () => {
  const operations = read('public/operations.html');

  for (const expected of [
    /api\.getStudents\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/,
    /api\.getDevices\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/,
    /api\.getDeviceAccessRules\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/,
    /api\.getTorahLearning\(null, \{ project: selectedProjectFilter\(\) \|\| undefined \}\)/,
    /api\.getAccountability\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/,
    /api\.getGroupGoals\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/,
    /createAccountability\(event = \{\}\)/,
    /updateAccountability\(id, updates = \{\}\)/,
    /deleteAccountability\(id, filters = \{\}\)/,
    /project: selectedProjectFilter\(\) \|\| undefined/
  ]) {
    assert.match(operations, expected);
  }
});
