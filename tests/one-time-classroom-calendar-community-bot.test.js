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
});

test('Source-grounded classroom bot refuses unsupported Torah answers and cites only approved classroom context', () => {
  const bot = sliceBetween(server, 'async function buildOneTimeClassroomBotReply', 'function requireOneTimeLibraryApprovalFlag');
  assert.match(bot, /getOneTimeClassroomForAccessCode/);
  assert.match(bot, /member_library_items/);
  assert.match(bot, /classroom\.classes/);
  assert.match(bot, /classroom\.assignments/);
  assert.match(bot, /calendar_items/);
  assert.match(bot, /live_plus_library/);
  assert.match(bot, /I can answer only from approved One Time classroom sources/);
  assert.match(bot, /I do not have an approved One Time source/);
  assert.match(bot, /should not invent a Torah answer/);
  assert.match(bot, /route_to: 'rabbi_moderation'/);
  assert.match(server, /source_grounded_only: true/);
  assert.match(server, /invented_sources_allowed: false/);
  assert.match(server, /unsupported_answer: 'route_to_rabbi_or_moderation'/);
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

test('Member library and classroom pages expose classroom navigation, six Sedarim, moderated threads, and source bot', () => {
  assert.match(memberLibraryHtml, /classroomStrip/);
  assert.match(memberLibraryHtml, /payload\.classroom/);
  assert.match(memberLibraryHtml, /\/one-time-classroom\?code=/);
  assert.match(memberLibraryHtml, /Open Classroom/);

  [
    'One Time Mishnah Classroom',
    'Six Sedarim',
    'Source Bot',
    'Rabbi Threads',
    'Responses are reviewed before visibility',
    '/api/one-time-classroom?code=',
    '/api/one-time-classroom/bot',
    'Submit For Review',
    'new URLSearchParams(window.location.search).get',
  ].forEach((needle) => assert.match(classroomHtml, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  const scripts = [...classroomHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join('\n');
  assert.doesNotThrow(() => new Function(scripts));
});

test('Parent-scoped payload and portal surface held classroom bot safety context', () => {
  assert.match(server, /function getParentClassroomSafetyContextForStudents/);
  assert.match(server, /payload\.classroom_safety = await getParentClassroomSafetyContextForStudents/);
  assert.match(server, /m\.parent_visible_safety = TRUE/);
  assert.match(server, /m\.author_type = 'student' AND m\.author_id = ANY\(\$2::int\[\]\)/);
  assert.match(server, /metadata_json->>'parent_email'/);
  assert.match(server, /source_grounded_bot_policy/);
  assert.match(parentHtml, /function renderParentClassroomSafety/);
  assert.match(parentHtml, /classroom_safety\?\.held_responses/);
  assert.match(parentHtml, /classroomBotPolicy/);

  const scripts = [...parentHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join('\n');
  assert.doesNotThrow(() => new Function(scripts));
});
