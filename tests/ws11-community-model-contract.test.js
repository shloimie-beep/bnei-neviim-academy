const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');

test('WS11 schema creates community course, worksheet, gamification, shoutout, and parent report tables', () => {
  for (const table of [
    'bna_courses',
    'bna_course_enrollments',
    'bna_course_lessons',
    'bna_worksheets',
    'bna_worksheet_questions',
    'bna_worksheet_submissions',
    'bna_worksheet_answers',
    'bna_course_questions',
    'bna_course_question_responses',
    'bna_badges',
    'bna_gamification_events',
    'bna_student_badges',
    'bna_student_references',
    'bna_parent_student_links',
    'bna_parent_progress_reports',
  ]) {
    assert.match(server, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(server, /async function ensureWs11CommunityFoundation/);
  assert.match(server, /rabbi-mishnah-learning-community/);
  assert.match(server, /Mishnah Foundations/);
});

test('WS11 schema is wired into startup and compatibility migration', () => {
  const initDb = server.slice(
    server.indexOf('async function initDb()'),
    server.indexOf('initDb();')
  );
  assert.match(initDb, /await pool\.query\(createWs11CommunityGamificationSQL\);/);
  assert.match(initDb, /await ensureWs11CommunityFoundation\(\);/);
  assert(
    initDb.indexOf('await pool.query(createIdentityLinkingCompatibilitySQL);')
      < initDb.indexOf('await pool.query(createWs11CommunityGamificationSQL);'),
    'WS11 schema must run after identity compatibility creates parent account dependencies'
  );

  const migrateRoute = server.slice(
    server.indexOf("app.post('/api/bna/migrate-db'"),
    server.indexOf('// Login endpoint for operations')
  );
  assert.match(migrateRoute, /await pool\.query\(createWs11CommunityGamificationSQL\);/);
  assert.match(migrateRoute, /await ensureWs11CommunityFoundation\(\);/);
});

test('WS11 routes expose admin, student, and parent progress surfaces', () => {
  for (const route of [
    "app.get('/api/bna/courses'",
    "app.post('/api/bna/courses'",
    "app.post('/api/bna/courses/:id/lessons'",
    "app.get('/api/bna/worksheets'",
    "app.post('/api/bna/worksheets'",
    "app.post('/api/bna/worksheets/:id/questions'",
    "app.get('/api/bna/course-questions'",
    "app.post('/api/bna/course-questions'",
    "app.get('/api/bna/course-questions/:id/responses'",
    "app.get('/api/bna/gamification-events'",
    "app.post('/api/bna/gamification-events'",
    "app.post('/api/bna/gamification-events/backfill'",
    "app.post('/api/bna/shoutouts'",
    "app.get('/api/bna/shoutouts'",
    "app.post('/api/bna/shoutouts/:id/approve'",
    "app.post('/api/bna/parent-progress-reports/generate'",
    "app.post('/api/bna/parent-progress-reports/:id/approve'",
    "app.post('/api/student-portal/questions'",
    "app.get('/api/student-portal/course-questions'",
    "app.post('/api/student-portal/course-questions/:id/answer'",
    "app.post('/api/student-portal/worksheets/:id/submit'",
    "app.get('/api/parent-portal/students/:studentId/ws11-progress'",
    "app.get('/api/parent-portal/students/:studentId/progress'",
    "app.get('/api/parent-portal/students/:studentId/activity'",
    "app.get('/api/parent-portal/students/:studentId/worksheets'",
    "app.get('/api/parent-portal/students/:studentId/questions'",
    "app.get('/api/parent-portal/students/:studentId/shoutouts'",
  ]) {
    assert.match(server, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('student course-question answer route is ownership and visibility guarded', () => {
  const route = server.slice(
    server.indexOf("app.post('/api/student-portal/course-questions/:id/answer'"),
    server.indexOf("app.post('/api/student-portal/worksheets/:id/submit'")
  );
  assert.match(route, /getStudentForPortalCredential\(req, res, code, client\)/);
  assert.match(route, /q\.student_visible = TRUE/);
  assert.match(route, /q\.approval_status = 'approved'/);
  assert.match(route, /student\.id/);
  assert.match(route, /parent_visible = FALSE/);
  assert.match(route, /approval_status = 'pending'/);
  assert.doesNotMatch(route, /body\.student_id|body\.studentId|body\.parent_visible|body\.public_visible|body\.approval_status/);
});

test('parent privacy route uses explicit parent-student links and generic not found response', () => {
  const route = server.slice(
    server.indexOf("app.get('/api/parent-portal/students/:studentId/ws11-progress'"),
    server.indexOf('function parentContextChildren')
  );
  assert.match(route, /ensureParentStudentLinksForRecords/);
  assert.match(route, /bna_parent_student_links/);
  assert.match(route, /parentCanAccessStudent/);
  assert.match(route, /Student was not found for this parent/);
  assert.doesNotMatch(route, /SELECT \*[\s\S]{0,120}FROM bna_students[\s\S]{0,120}WHERE id = \$1/);
});

test('parent progress aliases all use the scoped parent WS11 guard', () => {
  const aliasBlock = server.slice(
    server.indexOf("app.get('/api/parent-portal/students/:studentId/progress'"),
    server.indexOf('function parentContextChildren')
  );
  for (const route of [
    "app.get('/api/parent-portal/students/:studentId/progress'",
    "app.get('/api/parent-portal/students/:studentId/activity'",
    "app.get('/api/parent-portal/students/:studentId/worksheets'",
    "app.get('/api/parent-portal/students/:studentId/questions'",
    "app.get('/api/parent-portal/students/:studentId/shoutouts'",
  ]) {
    assert.match(aliasBlock, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.equal((aliasBlock.match(/getParentPortalScopedWs11\(req\)/g) || []).length, 5);
  assert.match(server, /function getParentPortalScopedWs11/);
  assert.match(server, /parentCanAccessStudent\(accessContext, studentId\)/);
  assert.match(server, /Student was not found for this parent/);
});

test('student and parent portals include WS11 render hooks', () => {
  assert.match(studentHtml, /ws11/);
  assert.match(studentHtml, /submitCourseQuestionAnswer/);
  assert.match(parentHtml, /ws11/);
  assert.match(parentHtml, /course_questions/);
  assert.match(operationsHtml, /renderCommunityAdmin/);
  assert.match(operationsHtml, /data-community-admin/);
});
