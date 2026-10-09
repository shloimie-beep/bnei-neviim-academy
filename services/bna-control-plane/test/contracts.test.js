const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  stableFingerprint,
  validateCommandEnvelope,
  validateSupportCaseEvent,
} = require('../src/contracts');
const { fixture, serviceRoot, withPatch } = require('./helpers');

test('JSON contract files parse cleanly', () => {
  const contractsDir = path.join(serviceRoot, 'contracts');
  for (const file of fs.readdirSync(contractsDir)) {
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(contractsDir, file), 'utf8')), file);
  }
});

test('support case event fixtures validate', () => {
  assert.equal(validateSupportCaseEvent(fixture('valid-one-time-case-created.json')).producer.product, 'one_time');
  assert.equal(validateSupportCaseEvent(fixture('valid-school-status-changed.json')).producer.product, 'bna_school');
});

test('command result and command fixtures validate', () => {
  assert.equal(validateSupportCaseEvent(fixture('valid-command-result.json')).event_type, 'control.command.result.v1');
  assert.equal(validateCommandEnvelope(fixture('valid-assign-queue-command.json')).command_type, 'support.case.assign_queue.v1');
});

test('contracts reject unexpected detailed product data', () => {
  assert.throws(
    () => validateSupportCaseEvent(withPatch('valid-one-time-case-created.json', { case: { diagnostic_blob: 'raw trace' } })),
    /unexpected property diagnostic_blob/
  );
});

test('fingerprint is stable across object key order', () => {
  const a = { z: 1, a: { b: 2, c: 3 } };
  const b = { a: { c: 3, b: 2 }, z: 1 };
  assert.equal(stableFingerprint(a), stableFingerprint(b));
});
