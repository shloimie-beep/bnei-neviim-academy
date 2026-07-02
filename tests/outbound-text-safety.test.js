const test = require('node:test');
const assert = require('node:assert/strict');

const {
  assertOutboundTextReadable,
  looksLikeQuestionMarkEncodingCorruption,
} = require('../src/lib/bna/outbound-text-safety');

test('outbound text safety allows normal English question marks', () => {
  assert.equal(looksLikeQuestionMarkEncodingCorruption('Are you coming??? Please reply when you can.'), false);
  assert.doesNotThrow(() => assertOutboundTextReadable('Are you coming??? Please reply when you can.'));
});

test('outbound text safety allows real Hebrew text', () => {
  const hebrew = '\u05ea\u05d6\u05db\u05d5\u05e8\u05ea \u05dc\u05de\u05d7\u05e8: \u05e0\u05d0 \u05dc\u05d4\u05d1\u05d9\u05d0 \u05de\u05d9\u05dd \u05d5\u05d7\u05d8\u05d9\u05e4\u05d9\u05dd.';
  assert.equal(looksLikeQuestionMarkEncodingCorruption(hebrew), false);
  assert.doesNotThrow(() => assertOutboundTextReadable(hebrew));
});

test('outbound text safety blocks repeated question-mark encoding corruption', () => {
  const corrupted = '?????? ?????, ??? ?????? 25 ?????:\\n\\n?????? ????? 9:00 ????? ?????? ?????.';
  assert.equal(looksLikeQuestionMarkEncodingCorruption(corrupted), true);
  assert.throws(
    () => assertOutboundTextReadable(corrupted, 'WhatsApp message body'),
    /encoding-corrupted text/
  );
});
