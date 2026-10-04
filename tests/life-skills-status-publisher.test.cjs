const assert = require('node:assert/strict');
const test = require('node:test');
const { parseWorkbook, nextAllowedIso, nextAsset, record } = require('../src/lib/bna/life-skills-status-publisher');
const { parseWorkbook: parseMarketingWorkbook } = require('../src/lib/bna/life-skills-marketing');

const digest = 'a'.repeat(64);
const url = 'https://drive.google.com/file/d/abc123/view';
const statusRow = (id, language, delivery = '') => {
  const row = Array(27).fill('');
  Object.assign(row, { 0: id, 1: language === 'HE' ? '20' : '1', 2: language, 3: 'VERTICAL',
    4: 'v04', 6: '1080', 7: '1920', 8: 'OWNER_APPROVED', 10: url, 12: digest,
    18: 'Exact pixels verified', 21: delivery, 22: `${id}.png`, 26: 'CURRENT_APPROVED' });
  return row;
};

test('Registry provider state is read from column V, leaving filename in W untouched', () => {
  const published = JSON.stringify({ kind: 'LIFE_SKILLS_STATUS_V1', state: 'PUBLISHED', providerReceiptId: 'receipt' });
  const parsed = parseWorkbook({ data: { valueRanges: [
    { values: [[], statusRow('C20-HE', 'HE', published)] },
    { values: [['Slot'], ['D20', '2026-10-04']] },
  ] } });
  assert.equal(parsed.assets[0].delivery.state, 'PUBLISHED');
  assert.equal(parsed.assets[0].deliveryText, published);
  assert.equal(parsed.assets[0].rowNumber, 2);
  assert.equal(parsed.calendar[0].rowNumber, 10);
  assert.equal(record('C20-HE.png'), null);
});

test('next English asset excludes an already published exact revision', () => {
  const pending = parseWorkbook({ data: { valueRanges: [
    { values: [[], statusRow('C01-EN', 'EN'), statusRow('C02-EN', 'EN')] },
    { values: [['Slot']] },
  ] } });
  assert.equal(nextAsset(pending, 'EN').id, 'C01-EN');
  pending.assets[0].deliveryText = JSON.stringify({ kind: 'LIFE_SKILLS_STATUS_V1', state: 'PUBLISHED' });
  pending.assets[0].delivery = record(pending.assets[0].deliveryText);
  assert.equal(nextAsset(pending, 'EN').id, 'C02-EN');
});

test('rolling time uses confirmed provider time and skips Friday and Saturday', () => {
  assert.equal(nextAllowedIso('2026-10-04T09:27:08.000Z', []), '2026-10-05T09:22:08.000Z');
  assert.equal(nextAllowedIso('2026-10-08T09:27:08.000Z', []), '2026-10-11T09:22:08.000Z');
});

test('marketing read model exposes the scheduled English Status from the existing registry', () => {
  const scheduled = JSON.stringify({ kind: 'LIFE_SKILLS_STATUS_V1', state: 'SCHEDULED',
    scheduledAt: '2026-10-05T09:22:08.000Z' });
  const row = statusRow('C01-EN', 'EN', scheduled);
  row[8] = 'OWNER_APPROVED_EXACT_FILE';
  const result = parseMarketingWorkbook({
    assetRows: [['Asset key','Concept','Language','Surface','Revision','Kind','Width px','Height px','Approval','Verification','Drive file / archive','Archive member / locator','SHA256','Source / parent','Approval evidence','Prompt / job source','Provider job / ref','Template','QA / hold','Release date (planned)','Calendar slot','Provider delivery','Filename','Record evidence','Ingest date','Readiness','Current library state'], row],
    calendarRows: [['Slot','Date','Day','Local time','Asset ID','Headline','Proposed caption','WhatsApp Status','Facebook Page','Asset link','Version / SHA256','Exact approval','Holiday / quiet rule','Scheduler state','Provider receipts / errors']],
  });
  assert.equal(result.creatives[0].review, 'approved');
  assert.equal(result.publications.length, 1);
  assert.equal(result.publications[0].state, 'scheduled');
  assert.equal(result.publications[0].scheduledFor, '2026-10-05T09:22:08.000Z');
});
