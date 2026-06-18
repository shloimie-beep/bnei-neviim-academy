const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Server exposes a scoped aggregate calendar endpoint', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/calendar', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /const projectKey = scopedProjectKey \|\| requestedProjectKey;/);
  assert.match(server, /SELECT t\.id, t\.title[\s\S]*?t\.due_date, t\.planned_at/);
  assert.match(server, /FROM bna_class_sessions cs/);
  assert.match(server, /FROM bna_accountability_events a/);
  assert.match(server, /FROM bna_group_goals g/);
  assert.match(server, /source_type: 'task'/);
  assert.match(server, /source_type: 'class_session'/);
  assert.match(server, /source_type: event\.next_check_in_date \? 'check_in' : 'accountability_event'/);
  assert.match(server, /source_type: 'group_goal'/);
});

test('Operations shell loads and renders an internal Calendar module', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /getCalendar\(filters = \{\}\) \{/);
  assert.match(operations, /let calendarEvents = \[\];/);
  assert.match(operations, /\{ id: 'calendar', label: 'Calendar', marker: 'CAL' \}/);
  assert.match(operations, /viewAllowed\('calendar'\) \? api\.getCalendar\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /case 'calendar': content = renderCalendar\(\); break;/);
  assert.match(operations, /function renderCalendar\(\) \{/);
  assert.match(operations, /function calendarEventGroups\(\) \{/);
  assert.match(operations, /function renderCalendarItem\(event\) \{/);
  assert.match(operations, /Tasks, classes, check-ins, student events, and group goals appear here from the current workspace\./);
});

test('Calendar implementation avoids broken external sync controls', () => {
  const operations = read('public/operations.html');

  assert.doesNotMatch(operations, /google calendar/i);
  assert.doesNotMatch(operations, /sync calendar/i);
  assert.doesNotMatch(operations, /connect calendar/i);
});
