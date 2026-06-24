const assert = require('node:assert/strict');
const test = require('node:test');

const {
  canonicalDisplayId,
  dateStamp,
} = require('../../src/platform/ingestion/canonical-ids');

test('canonical display dates use the operations timezone for timestamps', () => {
  assert.equal(dateStamp('2026-06-16'), '20260616');
  assert.equal(dateStamp('2026-06-16T22:30:00.000Z'), '20260617');
});

test('canonical display IDs preserve readable prefixes and deterministic source disambiguation', () => {
  const first = canonicalDisplayId({
    prefix: 'task',
    dateValue: '2026-06-23',
    index: 1,
    disambiguator: { source_id: 'chat-a', item_type: 'task' },
  });
  const repeat = canonicalDisplayId({
    prefix: 'task',
    dateValue: '2026-06-23',
    index: 1,
    disambiguator: { source_id: 'chat-a', item_type: 'task' },
  });
  const second = canonicalDisplayId({
    prefix: 'task',
    dateValue: '2026-06-23',
    index: 1,
    disambiguator: { source_id: 'chat-b', item_type: 'task' },
  });

  assert.match(first, /^TASK-20260623-001-[A-F0-9]{8}$/);
  assert.equal(first, repeat);
  assert.notEqual(first, second);
});
