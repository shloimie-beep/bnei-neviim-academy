const assert = require('node:assert/strict');
const test = require('node:test');

const { parseIntakeText } = require('../src/lib/bna/intake-parser');
const {
  shouldPromoteGoalCandidate,
  promoteGoalCandidate,
  assertGoalCoverage,
} = require('../src/lib/bna/goal-memory');

test('durable natural-language rule creates goal candidate with related goals', () => {
  const parsed = parseIntakeText({
    raw_input: 'From now on, every ramble should preserve raw intake first and watchdog proof before done.',
    source_type: 'operations_helper',
    source_date: '2026-06-17',
  });
  assert.ok(parsed.goal_candidates.length >= 1);
  const candidate = parsed.goal_candidates[0];
  assert.match(candidate.stable_id, /^GOAL-20260617-/);
  assert.equal(candidate.item_type, 'goal_candidate');
  assert.ok(candidate.related_goal_ids.includes('GOAL-CORE-007'));
  assert.ok(candidate.related_goal_ids.includes('GOAL-CORE-015'));
  assert.equal(shouldPromoteGoalCandidate(candidate), true);
  const promoted = promoteGoalCandidate(candidate);
  assert.equal(promoted.status, 'active');
  assert.equal(promoted.source_item_id, candidate.stable_id);
});

test('goal coverage audit detects missing required standing goals', () => {
  const parsed = parseIntakeText({
    raw_input: 'Task: update the homepage copy.',
    source_type: 'manual',
    source_date: '2026-06-17',
  });
  const findings = assertGoalCoverage(parsed, { required_goal_ids: ['GOAL-CORE-013'] });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].goal_id, 'GOAL-CORE-013');
});
