const test = require('node:test');
const assert = require('node:assert/strict');
const { enqueueCommand } = require('../src/commands/outbox');
const { browserPrincipal } = require('../src/auth/principal');
const { MemoryControlPlaneStorage } = require('../src/storage/memory');

const caseRecord = {
  case_ref: 'cp_synthetic_case_ref_000001',
  product: 'one_time',
  product_case_id: 'case_01JCONTROLPLANEOT000001',
  product_version: 4,
  correlation_id: 'corr_01JCONTROLPLANEOT000001',
};

test('enqueueCommand writes a deterministic command envelope', () => {
  const storage = new MemoryControlPlaneStorage();
  const record = enqueueCommand({
    storage,
    principal: browserPrincipal({ role: 'cp_triage' }),
    caseRecord,
    commandType: 'support.case.assign_queue.v1',
    instruction: { queue: 'technical_ops' },
    reasonCode: 'routing_correction',
    now: new Date('2026-07-17T08:10:00Z'),
  });
  assert.equal(record.status, 'queued');
  assert.equal(record.target_product, 'one_time');
  assert.equal(record.envelope.target.expected_product_version, 4);
  assert.equal(storage.commandOutbox.size, 1);
});

test('outbox leasing and retry are bounded and observable', () => {
  const storage = new MemoryControlPlaneStorage({ now: () => Date.UTC(2026, 6, 17, 8, 10, 0) });
  const record = enqueueCommand({
    storage,
    principal: browserPrincipal({ role: 'cp_admin' }),
    caseRecord,
    commandType: 'support.case.assign_queue.v1',
    instruction: { queue: 'technical_ops' },
    reasonCode: 'routing_correction',
    now: new Date('2026-07-17T08:10:00Z'),
  });
  const leased = storage.leaseDueCommands({ now: Date.UTC(2026, 6, 17, 8, 10, 1), workerId: 'worker-1' });
  assert.equal(leased.length, 1);
  assert.equal(leased[0].leased_by, 'worker-1');
  const failed = storage.markCommandFailure(record.command_id, {
    retryable: true,
    now: Date.UTC(2026, 6, 17, 8, 10, 2),
  });
  assert.equal(failed.status, 'retry');
  assert.equal(failed.attempts, 1);
});

test('command result projection updates the matching command', () => {
  const storage = new MemoryControlPlaneStorage();
  const record = enqueueCommand({
    storage,
    principal: browserPrincipal({ role: 'cp_admin' }),
    caseRecord,
    commandType: 'support.case.assign_queue.v1',
    instruction: { queue: 'technical_ops' },
    reasonCode: 'routing_correction',
    now: new Date('2026-07-17T08:10:00Z'),
  });
  storage.recordCommandResult({
    command_id: record.command_id,
    result: 'applied',
    result_code: 'queue_changed',
    product_version: 5,
  });
  assert.equal(storage.commandOutbox.get(record.command_id).status, 'applied');
  assert.equal(storage.commandOutbox.get(record.command_id).product_version, 5);
});
