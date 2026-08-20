const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertNoForbiddenKeys,
  assertProductCaseUrl,
  assertRedactedSummary,
} = require('../src/security/dlp');
const { validateSupportCaseEvent } = require('../src/contracts');
const { fixture, withPatch } = require('./helpers');

test('redacted summaries allow short operational descriptions', () => {
  assert.equal(assertRedactedSummary('Subscriber cannot open the member library.'), 'Subscriber cannot open the member library.');
});

test('redacted summaries reject direct identifiers and quoted text', () => {
  assert.throws(() => assertRedactedSummary('Please help Jane Smith with login.'), /personal name/);
  assert.throws(() => assertRedactedSummary('Reach me at family@example.test'), /email-like/);
  assert.throws(() => assertRedactedSummary('"The app says my password is wrong"'), /quote/);
});

test('case URL is product-owned, HTTPS, opaque, and query-free', () => {
  assert.doesNotThrow(() => assertProductCaseUrl({
    product: 'one_time',
    productCaseId: 'case_01JCONTROLPLANEOT000001',
    url: 'https://join.onetimeonetime.com/support/cases/case_01JCONTROLPLANEOT000001',
  }));
  assert.throws(() => assertProductCaseUrl({
    product: 'one_time',
    productCaseId: 'case_01JCONTROLPLANEOT000001',
    url: 'https://join.onetimeonetime.com/support/cases/case_01JCONTROLPLANEOT000001?token=abc',
  }), /query/);
});

test('forbidden fixture patches are rejected', () => {
  const cases = fixture('forbidden-pii-cases.json');
  for (const item of cases) {
    const event = withPatch('valid-one-time-case-created.json', item.patch);
    assert.throws(() => validateSupportCaseEvent(event), /unexpected property|phone-like|query|string/, item.label);
  }
});

test('recursive DLP key scanner rejects raw product details', () => {
  assert.throws(() => assertNoForbiddenKeys({ case: { customer_phone: '555-111-2222' } }), /customer_phone/);
});
