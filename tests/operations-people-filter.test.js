const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Operations Contacts exposes a unified People tab with internal/external filtering', () => {
  assert.match(operationsHtml, /getPeople\(filters = \{\}\)/);
  assert.match(operationsHtml, /if \(filters\.project_key\) params\.set\('project_key', filters\.project_key\)/);
  assert.match(operationsHtml, /needsPeopleData \? api\.getPeople\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /createPerson\(person\) \{ return this\.request\('POST', '\/people', person\); \}/);
  assert.match(operationsHtml, /\{ id: 'people', label: 'People' \}/);
  assert.match(operationsHtml, /function renderPeopleSection/);
  assert.match(operationsHtml, /contactPeopleAudienceFilter/);
  assert.match(operationsHtml, /people_audience/);
  assert.match(operationsHtml, /Internal \/ school/);
  assert.match(operationsHtml, /External \/ non-school/);
});

test('People roster keeps student and parent records linked before applying filters', () => {
  assert.match(operationsHtml, /function linkedSignupForStudent/);
  assert.match(operationsHtml, /function linkedStudentForSignup/);
  assert.match(operationsHtml, /Number\(student\.signup_id\)/);
  assert.match(operationsHtml, /Number\(signup\.id\)/);
  assert.match(operationsHtml, /normalizeEmailKey\(student\.parent_email\) === parentEmail/);
  assert.match(operationsHtml, /type: audience === 'external' \? 'external_accountability' : 'student_parent'/);
  assert.match(operationsHtml, /coveredSignupIds\.add\(Number\(signup\.id\)\)/);
  assert.match(operationsHtml, /Open student/);
  assert.match(operationsHtml, /Open contact/);
  assert.match(operationsHtml, /function openSignupContact/);
  assert.match(operationsHtml, /contactSection = 'parents'/);
});

test('Parent contact detail can resolve and open the linked student record', () => {
  assert.match(operationsHtml, /\{ id: 'linked', label: 'Linked Records' \}/);
  assert.match(operationsHtml, /const needsLocalClassroomData = activeView === 'students' \|\| \(activeView === 'content' && activeContentSection === 'one_time_library'\)/);
  assert.match(operationsHtml, /const needsStudentRosterData = needsDashboardData \|\| needsLocalClassroomData \|\| needsCommunityData \|\| \['contacts', 'api_usage', 'calendar'\]\.includes\(activeView\) \|\| \(activeView === 'settings' && \['learning_portals', 'parent_portal', 'student_portal'\]\.includes\(activeSettingsSection\)\)/);
  assert.match(operationsHtml, /needsStudentRosterData \? api\.getStudents\(workspaceDataFilters\) : Promise\.resolve\(\{ students: \[\] \}\)/);
  assert.match(operationsHtml, /const linkedStudent = linkedStudentForSignup\(signup\)/);
  assert.match(operationsHtml, /Open linked student/);
  assert.match(operationsHtml, /Student Record/);
  assert.match(operationsHtml, /Match Source/);
});

test('Student accountability views share the same internal/external classifier', () => {
  assert.match(operationsHtml, /function studentIsExternalPerson/);
  assert.match(operationsHtml, /external-accountability/);
  assert.match(operationsHtml, /not-bna-school/);
  assert.match(operationsHtml, /studentAudienceFilter/);
  assert.match(operationsHtml, /renderFilterSelect\('setStudentFilter', 'audience'/);
  assert.match(operationsHtml, /studentAudienceMatches\(student, studentAudienceFilter\)/);
});

test('Internal people are stored as project members without seeding unavailable personal details', () => {
  assert.match(server, /app\.post\('\/api\/bna\/people'/);
  assert.match(server, /audience: 'internal'/);
  assert.match(server, /ensureProjectMember\(project, personName/);
  assert.doesNotMatch(server, /Esty Dratler|Esti Dratler/);
});
