const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('Operations student detail data uses selected workspace and selected student filters', () => {
  assert.match(operationsHtml, /function selectedStudentDetailDataFilters/);
  assert.match(operationsHtml, /const selectedStudentFilters = selectedStudentDetailDataFilters\(\);/);
  assert.match(operationsHtml, /api\.getStudents\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /api\.getAssignments\(selectedStudentFilters\)/);
  assert.match(operationsHtml, /api\.getDevices\(selectedStudentFilters\)/);
  assert.match(operationsHtml, /api\.getDeviceAccessRules\(selectedStudentFilters\)/);
  assert.match(operationsHtml, /api\.getTorahLearning\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /api\.getAccountability\(selectedStudentFilters\)/);
  assert.match(operationsHtml, /api\.getGroupGoals\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /!\['overview', 'list', 'group_goal', 'next_year_login'\]\.includes\(studentSection\)/);
});

test('Student API client methods forward workspace and student scope parameters', () => {
  const apiClient = sliceBetween(operationsHtml, 'const api = {', '// State');
  for (const method of ['getStudents', 'getAssignments', 'getDevices', 'getDeviceAccessRules', 'getAccountability']) {
    const route = sliceBetween(apiClient, `${method}(filters = {})`, method === 'getAccountability' ? 'createAccountability' : 'return this.request');
    assert.match(route, /filters\.project_key/);
    assert.match(route, /filters\.workspace/);
    assert.match(route, /filters\.student_id/);
  }
  const torahRoute = sliceBetween(apiClient, 'getTorahLearning(filters = {})', 'saveTorahEntry');
  assert.match(torahRoute, /filters\.project_key/);
  assert.match(torahRoute, /filters\.workspace/);
  const groupGoalsRoute = sliceBetween(apiClient, 'getGroupGoals(filters = {})', '};');
  assert.match(groupGoalsRoute, /filters\.project_key/);
  assert.match(groupGoalsRoute, /filters\.workspace/);
});

test('Student event and Goal Board matching prefer linked student IDs over name aliases', () => {
  const studentEvents = sliceBetween(operationsHtml, 'function studentEvents(student)', 'function sortEventsNewestFirst');
  assert.match(studentEvents, /if \(event\.student_id\) return String\(event\.student_id\) === String\(student\.id \|\| ''\);/);
  assert.match(studentEvents, /normalizeLooseText\(event\.student_name \|\| ''\)/);

  const goalBoardItems = sliceBetween(operationsHtml, 'function studentGoalBoardItems(student, events)', 'function goalBoardCounts');
  assert.match(goalBoardItems, /if \(event\.student_id\) return String\(event\.student_id\) === String\(student\.id \|\| ''\);/);
  assert.match(goalBoardItems, /normalizeLooseText\(event\.student_name \|\| ''\) === studentName/);
});

test('Server student/accountability routes enforce requested workspace scope', () => {
  const studentsRoute = sliceBetween(server, "app.get('/api/bna/students'", "app.post('/api/bna/students'");
  assert.match(studentsRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 's\.project_id'\)/);
  assert.match(studentsRoute, /await assertStudentAccess\(req, req\.query\.student_id\)/);
  assert.match(studentsRoute, /conditions\.push\(`s\.id = \$\$\{params\.length\}`\)/);

  const assignmentsRoute = sliceBetween(server, "app.get('/api/bna/assignments'", "app.post('/api/bna/assignments'");
  assert.match(assignmentsRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 'a\.project_id'\)/);
  assert.match(assignmentsRoute, /if \(req\.query\.student_id\) await assertStudentAccess\(req, req\.query\.student_id\)/);

  const devicesRoute = sliceBetween(server, "app.get('/api/bna/devices'", "app.post('/api/bna/students/:id/devices'");
  assert.match(devicesRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 's\.project_id'\)/);
  assert.match(devicesRoute, /if \(req\.query\.student_id\) await assertStudentAccess\(req, req\.query\.student_id\)/);

  const rulesRoute = sliceBetween(server, "app.get('/api/bna/device-access-rules'", "app.post('/api/bna/device-access-rules'");
  assert.match(rulesRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 's\.project_id'\)/);
  assert.match(rulesRoute, /if \(req\.query\.student_id\) await assertStudentAccess\(req, req\.query\.student_id\)/);

  const accountabilityRoute = sliceBetween(server, "app.get('/api/bna/accountability'", "app.get('/api/torah-learning/public-summary'");
  assert.match(accountabilityRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 'COALESCE\(a\.project_id, s\.project_id\)'\)/);
  assert.match(accountabilityRoute, /res\.status\(err\.statusCode \|\| 500\)/);
});

test('Torah and group goal routes do not leak BNA group data into provider workspaces', () => {
  const torahRoute = sliceBetween(server, "app.get('/api/bna/torah-learning'", "app.post('/api/bna/torah-learning/entries'");
  assert.match(torahRoute, /const requestedProjectKey = requestedProjectKeyForScopedList\(req\);/);
  assert.match(torahRoute, /requestedProjectKey && requestedProjectKey !== DEFAULT_PROJECT_KEY/);
  assert.match(torahRoute, /scoped_empty: true/);

  const groupGoalsRoute = sliceBetween(server, "app.get('/api/bna/group-goals'", "app.post('/api/bna/group-goals'");
  assert.match(groupGoalsRoute, /ensureDefaultGroupGoal\(pool, requestedProjectKeyForScopedList\(req\) \|\| DEFAULT_PROJECT_KEY\)/);
  assert.match(groupGoalsRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 'g\.project_id'\)/);

  const enrichRoute = sliceBetween(server, "app.post('/api/bna/accountability/enrich-question-sources'", "app.delete('/api/bna/accountability/:id'");
  assert.match(enrichRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 'project_id'\)/);
});
