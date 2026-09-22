const assert = require('node:assert/strict');
const test = require('node:test');

const {
  CONTROL_SUMMARY_SCHEMA_VERSION,
  controlSummarySignature,
  summaryEventsEnabled,
  validateControlSummaryEvent,
  verifyControlSummarySignature,
} = require('../src/lib/bna/control-summary-event');

function fixture(overrides = {}) {
  return {
    schema_version: CONTROL_SUMMARY_SCHEMA_VERSION,
    event_type: 'work_item.created',
    event_id: 'evt-20260803-001',
    idempotency_key: 'ot-work-42-v1',
    source_product: 'one_time',
    source_workspace: 'one_time_mishnah_class',
    source_object_type: 'work_item',
    source_object_id: 'work-42',
    source_object_version: '1',
    occurred_at: '2026-08-03T12:00:00.000Z',
    title: 'Sanitized operator follow-up',
    status: 'pending',
    assignee: 'Shloimie',
    priority: 'today',
    deep_link: 'https://bneineviimacademy.org/operations?view=tasks&task=42',
    data_classification: 'sanitized_summary',
    signature_algorithm: 'hmac-sha256',
    key_id: 'ot-live-001',
    signed_at: '2026-08-03T12:00:00.000Z',
    replay_window_seconds: 300,
    ...overrides,
  };
}

test('sanitized summary envelope validates inside the replay window', () => {
  const result = validateControlSummaryEvent(fixture(), { now: new Date('2026-08-03T12:02:00.000Z') });
  assert.deepEqual(result, { ok: true, errors: [] });
});

test('summary validation rejects private classification and expired replay', () => {
  const result = validateControlSummaryEvent(fixture({ data_classification: 'private' }), { now: new Date('2026-08-03T12:10:00.000Z') });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('data_classification'));
  assert.ok(result.errors.includes('replay_window_expired'));
});

test('raw-body HMAC verification is timing-safe and flag defaults off', () => {
  const body = JSON.stringify(fixture());
  const signature = controlSummarySignature(body, 'test-secret');
  assert.equal(verifyControlSummarySignature(body, `sha256=${signature}`, 'test-secret'), true);
  assert.equal(verifyControlSummarySignature(`${body}x`, `sha256=${signature}`, 'test-secret'), false);
  assert.equal(summaryEventsEnabled({}), false);
  assert.equal(summaryEventsEnabled({ BNA_CONTROL_SUMMARY_EVENTS_ENABLED: 'true' }), true);
});
