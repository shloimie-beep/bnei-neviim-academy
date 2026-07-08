const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const memberLibraryHtml = fs.readFileSync('public/member-library.html', 'utf8');
const classroomHtml = fs.readFileSync('public/one-time-classroom.html', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('One Time classroom schema adds reusable curriculum, class, assignment, thread, and participation storage', () => {
  assert.match(server, /const createOneTimeClassroomSQL = `/);
  [
    'CREATE TABLE IF NOT EXISTS bna_curriculum_units',
    'ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS curriculum_unit_id',
    'ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS daily_video',
    'ALTER TABLE bna_assignments ADD COLUMN IF NOT EXISTS class_session_id',
    'ALTER TABLE bna_assignments ADD COLUMN IF NOT EXISTS natural_language_request',
    'ALTER TABLE bna_schedule_items ADD COLUMN IF NOT EXISTS class_session_id',
    'ALTER TABLE bna_community_threads ADD COLUMN IF NOT EXISTS class_session_id',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS ai_moderation_json',
    'CREATE TABLE IF NOT EXISTS bna_classroom_participation_events',
  ].forEach((needle) => assert.match(server, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.match(server, /'zeraim', 'Zeraim'/);
  assert.match(server, /'moed', 'Moed'/);
  assert.match(server, /'nashim', 'Nashim'/);
  assert.match(server, /'nezikin', 'Nezikin'/);
  assert.match(server, /'kodashim', 'Kodashim'/);
  assert.match(server, /'taharos', 'Taharos'/);
  assert.match(server, /bna_community_messages_author_type_check CHECK \(author_type IN \('admin', 'rabbi', 'parent', 'student', 'service_provider', 'member'\)\)/);
  assert.match(server, /event_type TEXT NOT NULL CHECK \(event_type IN \('approved_question', 'approved_response', 'rabbi_featured', 'assignment_participation'\)\)/);
});

test('Classroom APIs expose admin readback, natural-language scheduling, moderated responses, and member-safe read routes', () => {
  [
    "app.get('/api/bna/one-time/classroom'",
    "app.post('/api/bna/one-time/classroom/assignment-preview'",
    "app.post('/api/bna/one-time/classroom/assignments'",
    "app.post('/api/bna/one-time/classroom/threads'",
    "app.post('/api/bna/one-time/classroom/messages/:id/review'",
    "app.get('/api/one-time-classroom'",
    "app.post('/api/one-time-classroom/threads/:id/responses'",
    "app.post('/api/one-time-classroom/bot'",
  ].forEach((route) => assert.match(server, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  const assignmentHelper = sliceBetween(server, 'async function createOneTimeClassroomAssignmentFromNaturalLanguage', "app.get('/api/bna/one-time/classroom'");
  const assignmentRoute = sliceBetween(server, "app.post('/api/bna/one-time/classroom/assignments'", "app.post('/api/bna/one-time/classroom/threads'");
  assert.match(assignmentHelper, /'app_only'/);
  assert.match(assignmentHelper, /INSERT INTO bna_schedule_items/);
  assert.match(assignmentHelper, /source, recurrence_json/);
  assert.match(assignmentRoute, /no_google_write_performed: true/);
  assert.match(assignmentRoute, /no_classroom_write_performed: true/);

  const responseRoute = sliceBetween(server, "app.post('/api/one-time-classroom/threads/:id/responses'", "app.post('/api/one-time-classroom/bot'");
  assert.match(responseRoute, /oneTimeClassroomScreenResponse\(responseBody\)/);
  assert.match(responseRoute, /'member'/);
  assert.match(responseRoute, /visible_after_review_only: true/);
  assert.match(responseRoute, /parent_visible_safety/);
  assert.match(responseRoute, /visible_to_classroom: false/);

  const threadRead = sliceBetween(server, 'async function getOneTimeClassroomThreads', 'async function getOneTimeClassroomParticipation');
  assert.match(threadRead, /COALESCE\(moderation_status, 'approved'\) = 'approved'/);
  assert.match(threadRead, /memberSafe/);

  const updatesHelper = sliceBetween(server, 'function oneTimeClassroomUpdates', 'async function getOneTimeClassroomData');
  assert.match(updatesHelper, /message\.status !== 'visible'/);
  assert.match(updatesHelper, /message\.moderation_status !== 'approved'/);
  assert.match(updatesHelper, /event\.status !== 'approved' \|\| event\.visibility !== 'classroom'/);
  assert.match(updatesHelper, /Published classroom response/);
  assert.match(updatesHelper, /Good job - classroom progress/);
  assert.match(server, /class_updates: oneTimeClassroomUpdates\(threads, participation\)/);
});

test('One Time classroom bot endpoint is approval-blocked while private replies remain active', () => {
  const route = sliceBetween(server, "app.post('/api/one-time-classroom/bot'", 'function rabbiJson');
  assert.match(route, /res\.status\(403\)\.json/);
  assert.match(route, /OneTime classroom bot is disabled pending explicit operator approval/);
  assert.match(route, /approval_required: true/);
  assert.match(route, /Students can respond privately to Rabbi\/admin threads for review/);
  assert.doesNotMatch(route, /buildOneTimeClassroomBotReply/);
});

test('Operations One Time console wires schedule preview, internal calendar creation, Rabbi threads, and moderation review', () => {
  [
    'getOneTimeClassroom()',
    'previewOneTimeClassroomAssignment(payload = {})',
    'createOneTimeClassroomAssignment(payload = {})',
    'createOneTimeClassroomThread(payload = {})',
    'reviewOneTimeClassroomMessage(id, payload = {})',
    'function renderOneTimeClassroomAdminPanel',
    'Natural-language video assignment',
    'Create Internal Calendar Item',
    'function previewOneTimeClassroomAssignment',
    'function createOneTimeClassroomAssignment',
    'function createOneTimeClassroomThread',
    'function reviewOneTimeClassroomMessage',
    'Google/Classroom writes stayed off',
  ].forEach((needle) => assert.match(operationsHtml, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  const scripts = [...operationsHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join('\n');
  assert.doesNotThrow(() => new Function(scripts));
});

test('Member library and classroom pages expose classroom navigation, six Sedarim, and moderated private replies', () => {
  assert.match(memberLibraryHtml, /classroomStrip/);
  assert.match(memberLibraryHtml, /payload\.classroom/);
  assert.match(memberLibraryHtml, /\/one-time-classroom\?code=/);
  assert.match(memberLibraryHtml, /Open Classroom/);

  [
    'One Time Mishnah Classroom',
    'Six Sedarim',
    'Class Materials',
    'Reviewed slides and worksheets will appear here after approval',
    'View slides',
    'Open worksheet',
    'Open source sheet',
    'Member-only view reduces casual sharing',
    'activateClassroomMedia',
    'Play Video',
    'loading="lazy"',
    'Rewards Scoreboard',
    'Class Updates',
    'Published comments and approved progress only',
    'Approved class updates will appear here after Rabbi/admin review',
    'renderClassUpdates',
    'classUpdates',
    'state.classroom?.class_updates',
    'Current One Time access',
    'Use fallback access code',
    'Fallback access code',
    'setAccessPanelState',
    'Opening your One Time classroom',
    "document.body.classList.add('one-time-review-active', 'one-time-classroom-review-shell')",
    'Reply Queue',
    'Rabbi Threads',
    'Responses are reviewed before visibility',
    '/api/one-time-classroom?code=',
    'Submit For Review',
    'new URLSearchParams(window.location.search).get',
    'renderRewardsScoreboard',
    'scoreboardList',
    'state.classroom?.leaderboard',
    'Approved rewards will appear after Rabbi/admin review',
  ].forEach((needle) => assert.match(classroomHtml, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  [
    'Source Bot',
    'Source-grounded bot',
    '/api/one-time-classroom/bot',
    'botQuestion',
    'askBot',
    'Fallback Vimeo Link',
    'loading="eager"',
    'This review route uses TEST-only member-library data',
  ].forEach((needle) => assert.doesNotMatch(classroomHtml, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  const scripts = [...classroomHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join('\n');
  assert.doesNotThrow(() => new Function(scripts));
});

test('Parent-scoped payload and portal surface held classroom reply safety context', () => {
  assert.match(server, /function getParentClassroomSafetyContextForStudents/);
  assert.match(server, /payload\.classroom_safety = await getParentClassroomSafetyContextForStudents/);
  assert.match(server, /m\.parent_visible_safety = TRUE/);
  assert.match(server, /m\.author_type = 'student' AND m\.author_id = ANY\(\$2::int\[\]\)/);
  assert.match(server, /metadata_json->>'parent_email'/);
  assert.match(server, /source_grounded_bot_policy/);
  assert.match(server, /enabled: false/);
  assert.match(server, /current_student_path: 'private_replies_to_rabbi_admin_threads'/);
  assert.match(parentHtml, /function renderParentClassroomSafety/);
  assert.match(parentHtml, /classroom_safety\?\.held_responses/);
  assert.match(parentHtml, /classroomBotPolicy/);
  assert.match(parentHtml, /One Time classroom bot is off for students until explicitly approved/);

  const scripts = [...parentHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join('\n');
  assert.doesNotThrow(() => new Function(scripts));
});
