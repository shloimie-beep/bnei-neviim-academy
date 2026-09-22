const assert = require('node:assert/strict');
const test = require('node:test');

const { parseIntakeText } = require('../src/lib/bna/intake-parser');

test('student question and observation stay distinct from generic task lane', () => {
  const parsed = parseIntakeText({
    raw_input: 'Student question: Eli asked why we say this pasuk. Observed that he improved focus today.',
    source_type: 'class_recording',
    source_date: '2026-06-17',
  });
  assert.ok(parsed.student_questions.length >= 1);
  assert.ok(parsed.student_observations.length >= 1);
  assert.equal(parsed.student_questions[0].target_lane, 'Student Questions');
  assert.equal(parsed.student_observations[0].target_lane, 'Student Observations');
});
