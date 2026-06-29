const assert = require('node:assert/strict');
const test = require('node:test');

const { parseIntakeText } = require('../src/lib/bna/intake-parser');

test('class recording parses class notes, research, questions, and workspace routing', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Class recording: Rabbi Scheller learned Mishnah Berachos with a pasuk source.',
      'A student asked why the Mishnah changes the language?',
      'Research: find Rashi and Gemara sources for the worksheet.',
      'Route this to the One Time Mishnah workspace.',
    ].join(' '),
    source_type: 'class_recording',
    workspace_key: 'one_time_mishnah_class',
    source_date: '2026-06-17',
  });
  assert.ok(parsed.class_session_notes.length >= 1);
  assert.ok(parsed.student_questions.length >= 1);
  assert.ok(parsed.research_items.length >= 1);
  assert.ok(parsed.workspace_routing.length >= 1);
  assert.match(parsed.class_session_notes[0].stable_id, /^CLASS-20260617-/);
  assert.match(parsed.student_questions[0].stable_id, /^STUQ-20260617-/);
  assert.match(parsed.research_items[0].stable_id, /^RESEARCH-20260617-/);
});

test('class recording test and pasuk language does not become Codex work', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'We are on Pusik test, go for it, Eitan Chaim.',
      'You have to bring the ephor outside of the machaneh, says Rashi, pasuk test.',
      'Why did Hashem not build the Beis Hamikdash first?',
      'All those together does not equal AI, what Codex can do, and the systems it can build.',
    ].join(' '),
    source_type: 'class_recording',
    source_date: '2026-06-17',
  });

  assert.equal(parsed.tasks.length, 0);
  assert.ok(parsed.class_session_notes.length >= 1);
  assert.ok(parsed.student_questions.length >= 1);
});

test('system correction inside recording can still create task work', () => {
  const parsed = parseIntakeText({
    raw_input: 'Fix the Operations dashboard queue button and verify the mobile UI smoke before deploy.',
    source_type: 'google_drive',
    source_date: '2026-06-17',
  });

  assert.ok(parsed.tasks.length >= 1);
  assert.match(parsed.tasks[0].stable_id, /^TASK-20260617-/);
});

test('class recording parses attendance and student progress without creating Codex work', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Class recording: Eitan was present for the Mishnah class.',
      'His student goal score was 70 percent and he should keep practicing inside reading.',
    ].join(' '),
    source_type: 'class_recording',
    source_date: '2026-06-29',
  });

  assert.equal(parsed.tasks.length, 0);
  assert.ok(parsed.attendance.length >= 1);
  assert.equal(parsed.attendance[0].fields.status, 'present');
  assert.equal(parsed.attendance[0].target_lane, 'Student Attendance');
  assert.ok(parsed.goals.length >= 1);
  assert.equal(parsed.goals[0].target_lane, 'Student Progress / Goals');
});
