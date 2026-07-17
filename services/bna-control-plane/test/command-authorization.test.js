const test = require('node:test');
const assert = require('node:assert/strict');
const { assertCommandAuthorization } = require('../src/commands/authorization');
const { browserPrincipal, telegramPrincipal } = require('../src/auth/principal');
const { validateCommandEnvelope } = require('../src/contracts');
const { fixture } = require('./helpers');

test('triage browser principal can issue versioned support commands', () => {
  const command = validateCommandEnvelope(fixture('valid-assign-queue-command.json'));
  const caseRecord = {
    product: 'one_time',
    product_case_id: 'case_01JCONTROLPLANEOT000001',
    product_version: 4,
  };
  assert.equal(assertCommandAuthorization({
    principal: browserPrincipal({ role: 'cp_triage' }),
    command,
    caseRecord,
  }), true);
});

test('viewer and Telegram principals cannot issue product commands', () => {
  const command = validateCommandEnvelope(fixture('valid-assign-queue-command.json'));
  assert.throws(() => assertCommandAuthorization({
    principal: browserPrincipal({ role: 'cp_viewer' }),
    command,
  }), /cannot create commands/);
  assert.throws(() => assertCommandAuthorization({
    principal: telegramPrincipal(),
    command,
  }), /browser-session principal/);
});

test('stale product versions are blocked before outbox insertion', () => {
  const command = validateCommandEnvelope(fixture('valid-assign-queue-command.json'));
  assert.throws(() => assertCommandAuthorization({
    principal: browserPrincipal({ role: 'cp_admin' }),
    command,
    caseRecord: {
      product: 'one_time',
      product_case_id: 'case_01JCONTROLPLANEOT000001',
      product_version: 3,
    },
  }), /stale product version/);
});
