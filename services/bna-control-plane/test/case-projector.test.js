const test = require('node:test');
const assert = require('node:assert/strict');
const { caseRefFor, pickCaseProjection, projectEvent } = require('../src/cases/projector');
const { MemoryControlPlaneStorage } = require('../src/storage/memory');
const { fixture, withPatch } = require('./helpers');

test('case refs are deterministic and product-scoped', () => {
  const oneTime = caseRefFor('one_time', 'case_01JCONTROLPLANEOT000001');
  const school = caseRefFor('bna_school', 'case_01JCONTROLPLANEOT000001');
  assert.equal(oneTime, caseRefFor('one_time', 'case_01JCONTROLPLANEOT000001'));
  assert.notEqual(oneTime, school);
});

test('case projection contains only redacted control-plane fields', () => {
  const projection = pickCaseProjection(fixture('valid-one-time-case-created.json'));
  assert.deepEqual(Object.keys(projection), [
    'case_ref',
    'product',
    'product_case_id',
    'case_kind',
    'severity',
    'queue',
    'status',
    'redacted_summary',
    'product_case_url',
    'product_version',
    'opened_at',
    'updated_at',
    'closed_at',
    'source_event_id',
    'correlation_id',
  ]);
});

test('projector upserts cases and queues link-only Telegram alerts on create', () => {
  const storage = new MemoryControlPlaneStorage();
  const result = projectEvent(fixture('valid-one-time-case-created.json'), storage);
  assert.equal(result.projected, 'case');
  assert.equal(storage.cases.size, 1);
  assert.equal(storage.telegramAlertOutbox.length, 1);
  assert.match(storage.telegramAlertOutbox[0].control_plane_url, /^https:\/\/control\.bnei-neviim\.com\/cases\/cp_/);
});

test('deleted event removes case index', () => {
  const storage = new MemoryControlPlaneStorage();
  const created = fixture('valid-one-time-case-created.json');
  projectEvent(created, storage);
  const deleted = withPatch('valid-one-time-case-created.json', {
    event_id: 'evt_01JCONTROLPLANEOTDELETE01',
    event_type: 'support.case.deleted.v1',
    case: {
      status: 'deleted',
      product_version: 5,
      updated_at: '2026-07-17T08:12:00Z',
      closed_at: '2026-07-17T08:12:00Z',
    },
  });
  const result = projectEvent(deleted, storage);
  assert.equal(result.projected, 'case_deleted');
  assert.equal(storage.cases.size, 0);
});
