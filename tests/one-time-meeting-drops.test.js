const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const memory = fs.readFileSync('MEMORY.md', 'utf8');

test('One Time meeting drops have a durable backend artifact and scoped API', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_project_meetings/);
  assert.match(server, /UNIQUE \(project_id, content_job_id, meeting_type\)/);
  assert.match(server, /routePath === '\/api\/bna\/project-meetings'/);
  assert.match(server, /app\.get\('\/api\/bna\/project-meetings'/);
  assert.match(server, /app\.post\('\/api\/bna\/project-meetings'/);
  assert.match(server, /appendScopeCondition\(req, conditions, params, 'm\.project_id'\)/);
  assert.match(server, /'bna_project_meetings'/);
});

test('content jobs can be structured into One Time meeting summaries and decision tasks', () => {
  assert.match(server, /if \(action === 'structure_one_time_meeting'\)/);
  assert.match(server, /function structureOneTimeMeetingFromContentJob/);
  assert.match(server, /buildOneTimeMeetingSpec/);
  assert.match(server, /oneTimeMeetingDecisionList/);
  assert.match(server, /ensureOneTimeMeetingTask/);
  assert.match(server, /Option A: internal BNA app/);
  assert.match(server, /Option B: GHL-backed CRM\/community\/course builder/);
  assert.match(server, /project: ONE_TIME_PROJECT_KEY/);
  assert.match(server, /INSERT INTO bna_task_comments/);
  assert.match(server, /extracted_task_ids/);
});

test('Operations Content exposes Meeting Drops and structure action', () => {
  assert.match(operations, /\{ id: 'meetings', label: 'Meeting Drops' \}/);
  assert.match(operations, /getProjectMeetings\(filters = \{\}\)/);
  assert.match(operations, /let projectMeetings = \[\]/);
  assert.match(operations, /needsContentData \? api\.getProjectMeetings/);
  assert.match(operations, /function renderContentMeetingDropsPanel/);
  assert.match(operations, /function contentJobLooksLikeOneTimeMeeting/);
  assert.match(operations, /function structureOneTimeMeeting/);
  assert.match(operations, /api\.contentJobAction\(jobId, 'structure_one_time_meeting'/);
  assert.match(operations, /Structure as One Time Meeting/);
  assert.match(operations, /Rabbi Meeting Intake/);
});

test('durable memory records the internal-first One Time platform assumption', () => {
  assert.match(memory, /One Time platform default is internal-first/);
  assert.match(memory, /GHL\/HighLevel earns a specific backend connector role/);
  assert.match(memory, /One Time meeting recordings should be handled as Content > Meeting Drops/);
  assert.match(memory, /parent\/student accounts must be separated by `project_id`/);
});
