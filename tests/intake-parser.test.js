const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  CANONICAL_ARRAY_KEYS,
  parseIntakeText,
} = require('../src/lib/bna/intake-parser');
const { taskHasRequiredShape } = require('../src/lib/bna/task-shaping');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const telegramBridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const parserSource = fs.readFileSync('src/lib/bna/intake-parser.js', 'utf8');

function assertCanonicalShape(parsed) {
  assert.equal(typeof parsed.raw_input, 'string');
  assert.ok(parsed.source);
  assert.ok(parsed.language);
  assert.equal(typeof parsed.summary, 'string');
  for (const key of CANONICAL_ARRAY_KEYS) {
    assert.ok(Array.isArray(parsed[key]), `${key} should be an array`);
  }
  for (const task of parsed.tasks) {
    assert.ok(taskHasRequiredShape(task), `task is missing canonical fields: ${JSON.stringify(task)}`);
    assert.notEqual(task.title, parsed.raw_input);
  }
}

test('parser returns the canonical top-level shape and shaped task fields', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Task: Codex should build the dashboard parser.',
      'Decision: choose whether parents see diet notes.',
      'Ticket: dashboard parser is broken.',
      'Student Eli Cohen goal to practice Mishnah.',
      'Diet note: add a protein snack.',
    ].join(' '),
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.tasks.length >= 1);
  assert.equal(parsed.decisions.length, 1);
  assert.ok(parsed.tickets.length >= 1);
  assert.ok(parsed.goals.length >= 1);
  assert.ok(parsed.diet_nutrition_notes.length >= 1);
});

test('parent transcript can extract people, relationship, goal, diet note, and custom section review', () => {
  const parsed = parseIntakeText({
    raw_input: "Sarah Cohen's son Eli Cohen has a goal to read Mishnah. Nutrition note: Eli needs a protein snack. Custom section: bedtime independence.",
    source_type: 'parent_transcript',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.extracted_people.length >= 2);
  assert.ok(parsed.extracted_relationships.some((rel) => rel.relationship_type === 'parent_child'));
  assert.ok(parsed.goals.length >= 1);
  assert.ok(parsed.diet_nutrition_notes.length >= 1);
  assert.ok(parsed.custom_sections.some((section) => section.section_key === 'bedtime_independence'));
  assert.ok(parsed.review_items.some((item) => item.review_type === 'custom_section'));
});

test('ambiguous names and unclear scope stay in review instead of silent filing', () => {
  const parsed = parseIntakeText({
    raw_input: 'Student Eli needs a goal. Not sure which Eli.',
    source_type: 'manual',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.review_items.some((item) => ['unclear_scope', 'low_confidence_item', 'ambiguous_person'].includes(item.review_type)));
  assert.ok(parsed.filing_plan.some((plan) => plan.action === 'review' || plan.auto_file_allowed === false));
});

test('mixed Hebrew and English intake keeps language metadata and files obvious school notes', () => {
  const parsed = parseIntakeText({
    raw_input: 'תלמיד משה needs attendance note and goal to learn Torah today.',
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.equal(parsed.language.mixed, true);
  assert.ok(parsed.attendance.length >= 1);
  assert.ok(parsed.goals.length >= 1);
});

test('provider setup language creates provider lead without needing GHL assumptions', () => {
  const parsed = parseIntakeText({
    raw_input: 'Provider Rabbi Levi needs profile setup text for the service provider directory.',
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.provider_leads.length >= 1);
  assert.equal(parsed.provider_leads[0].section_key, 'provider_lead');
});

test('class recording content stays separate from task extraction', () => {
  const parsed = parseIntakeText({
    raw_input: 'Class recording: we learned Mishnah Berachos and discussed a pasuk source. Task: Codex should extract class notes.',
    source_type: 'content_recording',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.class_session_notes.length >= 1);
  assert.ok(parsed.tasks.length >= 1);
});

test('Google Classroom requests become backlog tickets only', () => {
  const parsed = parseIntakeText({
    raw_input: 'Please create a Google Classroom course and add students with assignments.',
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.equal(parsed.tasks.length, 0);
  assert.equal(parsed.assignments.length, 0);
  assert.equal(parsed.tickets.length, 1);
  assert.match(parsed.tickets[0].title, /Google Classroom/i);
  assert.match(parsed.tickets[0].next_action, /future Classroom capabilities/i);
});

test('parser item keys are stable for idempotent parse item upsert', () => {
  const input = 'Task: Codex should verify the intake parser route. Custom section: morning checklist.';
  const first = parseIntakeText({ raw_input: input, source_type: 'manual' });
  const second = parseIntakeText({ raw_input: input, source_type: 'manual' });
  assert.deepEqual(
    first.filing_plan.map((plan) => plan.item_key),
    second.filing_plan.map((plan) => plan.item_key)
  );
  assert.match(server, /UNIQUE \(parse_run_id, item_key\)/);
  assert.match(server, /ON CONFLICT \(parse_run_id, item_key\)/);
});

test('server, Operations UI, and Telegram bridge expose canonical intake workflow', () => {
  [
    'const createIntakeParserSQL',
    'CREATE TABLE IF NOT EXISTS bna_intake_parse_runs',
    'CREATE TABLE IF NOT EXISTS bna_intake_parse_items',
    'CREATE TABLE IF NOT EXISTS bna_section_definitions',
    'CREATE TABLE IF NOT EXISTS bna_section_records',
    'CREATE TABLE IF NOT EXISTS bna_parse_review_queue',
    "app.post('/api/bna/intake/parse'",
    "app.get('/api/bna/intake/parse-runs'",
    "app.post('/api/bna/intake/parse-runs/:id/apply'",
    "app.get('/api/bna/intake/review'",
    "app.post('/api/bna/intake/review/:id/resolve'",
    "app.get('/api/bna/intake/sections'",
    "app.get('/api/bna/sections'",
    "app.post('/api/bna/sections'",
    "app.patch('/api/bna/sections/:id'",
    'mixedRecordingParsedFromCanonical',
    "action === 'tasks_from_recording'",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
  assert.ok(parserSource.includes('hasGoogleClassroomRequest'));

  [
    'Intake Review',
    "parseIntake(payload = {})",
    "getIntakeParseRuns(filters = {})",
    'function renderIntakeReview()',
    'function renderIntakeReviewQueue()',
    'function renderIntakeSections()',
    "case 'intake': content = renderIntakeReview(); break;",
  ].forEach((needle) => assert.ok(operations.includes(needle), needle));

  assert.ok(telegramBridge.includes("'/api/bna/intake/parse'"));
  assert.ok(telegramBridge.includes('parseCanonicalIntakeToApp'));
});
