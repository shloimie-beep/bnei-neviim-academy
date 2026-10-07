const test = require('node:test');
const assert = require('node:assert/strict');
const { parseWorkbook } = require('../src/lib/bna/life-skills-marketing');

const digest = value => value.repeat(64);
const headers = ['Asset key', 'Concept', 'Revision', 'Language', 'Surface', 'Width px', 'Height px', 'SHA256', 'Approval', 'Drive file / archive', 'Current library state', 'Readiness', 'QA / hold', 'Provider delivery'];
function assetRow({ id, concept, language, state, delivery = null, digestValue = digest('a') }) {
  return [id, `C${concept}`, 'v1', language, 'STATUS', '1080', '1920', digestValue, state === 'CURRENT_APPROVED' ? 'OWNER_APPROVED' : 'OWNER_ACCEPTED_DISPLAYED_BATCH', `https://drive.google.com/file/d/${id}/view`, state, state === 'CURRENT_APPROVED' ? 'READY' : 'HOLD', state === 'CURRENT_APPROVED' ? '' : 'D21 OFF', delivery ? JSON.stringify(delivery) : ''];
}
function workbook(nextTurnHold) {
  const predecessorId = 'C01-EN-STATUS-TEAL-v01';
  const predecessorDigest = digest('a');
  const delivery = {
    kind: 'LIFE_SKILLS_STATUS_V1', state: 'PUBLISHED', assetId: predecessorId, conceptId: 1,
    language: 'EN', surface: 'STATUS', revision: 'v1', driveFileId: predecessorId,
    sha256: predecessorDigest, providerReceiptId: 'provider-receipt', providerHttp: 200,
    confirmedAt: '2026-10-05T17:00:00.000Z', verificationAt: '2026-10-05T17:01:00.000Z',
    providerType: 'story', providerWidth: 1080, providerHeight: 1920, nextTurnHold,
  };
  return parseWorkbook({
    assetRows: [headers,
      assetRow({ id: predecessorId, concept: 1, language: 'EN', state: 'CURRENT_APPROVED', delivery, digestValue: predecessorDigest }),
      assetRow({ id: 'C21-HE-STATUS-TEAL-v04-FROZEN', concept: 21, language: 'HE', state: 'CURRENT_ACCEPTED_HELD', digestValue: digest('b') }),
    ],
    calendarRows: [], fetchedAt: '2026-10-07T15:00:00.000Z',
  });
}

test('exposes the single exact publisher next-turn hold without creating a queue record', () => {
  const result = workbook({ state: 'HELD', language: 'HE', reason: 'HEBREW_CALENDAR_OFF', conceptId: 21, candidateAssetIds: ['C21-HE-STATUS-TEAL-v04-FROZEN'] });
  assert.deepEqual(result.nextStatusHold, { state: 'held', language: 'he', reason: 'HEBREW_CALENDAR_OFF', conceptId: 21, candidateAssetIds: ['C21-HE-STATUS-TEAL-v04-FROZEN'] });
  assert.equal(result.inventory.queued, 0);
  assert.equal(result.publications.some(item => ['ready', 'scheduled', 'sending'].includes(item.state)), false);
});

test('ignores resolved, malformed and unbound next-turn hold evidence', () => {
  assert.equal(workbook({ state: 'RESOLVED', language: 'HE', reason: 'HEBREW_CALENDAR_OFF', conceptId: 21, candidateAssetIds: ['C21-HE-STATUS-TEAL-v04-FROZEN'] }).nextStatusHold, null);
  assert.equal(workbook({ state: 'HELD', language: 'HE', reason: 'HEBREW CALENDAR OFF', conceptId: 21, candidateAssetIds: ['C21-HE-STATUS-TEAL-v04-FROZEN'] }).nextStatusHold, null);
  assert.equal(workbook({ state: 'HELD', language: 'EN', reason: 'HEBREW_CALENDAR_OFF', conceptId: 21, candidateAssetIds: ['C21-HE-STATUS-TEAL-v04-FROZEN'] }).nextStatusHold, null);
  assert.equal(workbook({ state: 'HELD', language: 'HE', reason: 'HEBREW_CALENDAR_OFF', conceptId: 21, candidateAssetIds: ['NOT-IN-THE-CURRENT-REGISTRY'] }).nextStatusHold, null);
});
