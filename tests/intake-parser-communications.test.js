const assert = require('node:assert/strict');
const test = require('node:test');

const { parseIntakeText } = require('../src/lib/bna/intake-parser');

test('important parent communication creates communication and alert lanes', () => {
  const parsed = parseIntakeText({
    raw_input: 'Urgent parent WhatsApp: student cannot log in and tuition payment receipt needs follow up today.',
    source_type: 'wapi',
    source_date: '2026-06-17',
  });
  assert.ok(parsed.communications.length >= 1);
  assert.ok(parsed.alerts.length >= 1);
  assert.match(parsed.communications[0].stable_id, /^COMM-20260617-/);
  assert.match(parsed.alerts[0].stable_id, /^ALERT-20260617-/);
  assert.equal(parsed.communications[0].channel, 'wapi');
  assert.ok(parsed.alerts[0].related_goal_ids.includes('GOAL-CORE-013'));
});
