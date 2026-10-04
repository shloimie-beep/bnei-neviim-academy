const assert = require('node:assert/strict');
const test = require('node:test');
const { parseWorkbook, nextAllowedIso, nextAsset, record, scheduledIdentityMatches, sameAssetAndSlot, verifiedStoryReadback, hasPriorConceptDelivery } = require('../src/lib/bna/life-skills-status-publisher');
const { parseWorkbook: parseMarketingWorkbook } = require('../src/lib/bna/life-skills-marketing');

const digest = 'a'.repeat(64);
const url = 'https://drive.google.com/file/d/abc12345/view';
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
  pending.assets[1].concept = 2;
  assert.equal(nextAsset(pending, 'EN').id, 'C01-EN');
  pending.assets[0].deliveryText = JSON.stringify({ kind: 'LIFE_SKILLS_STATUS_V1', state: 'PUBLISHED' });
  pending.assets[0].delivery = record(pending.assets[0].deliveryText);
  assert.equal(nextAsset(pending, 'EN').id, 'C02-EN');
});

test('duplicate aliases for one concept and language cannot bypass a prior receipt, while the other language stays eligible', () => {
  const used = statusRow('C01-HE', 'HE'), alias = statusRow('C01-HE-copy', 'HE'), english = statusRow('C01-EN', 'EN'), next = statusRow('C02-EN', 'EN');
  used[1] = alias[1] = english[1] = '1';next[1]='2';
  alias[12] = 'b'.repeat(64);
  const published = JSON.stringify({ kind: 'LIFE_SKILLS_STATUS_V1', state: 'PUBLISHED', providerReceiptId: 'receipt' });
  used[21] = published;
  const workbook = parseWorkbook({ data: { valueRanges: [
    { values: [[], used, alias, english, next] },
    { values: [['Slot']] },
  ] } });
  assert.equal(hasPriorConceptDelivery(workbook, workbook.assets[1]), true);
  assert.equal(hasPriorConceptDelivery(workbook, workbook.assets[2]), false);
  assert.equal(nextAsset(workbook, 'EN')?.id, 'C01-EN');
});

test('any saved send or receipt state blocks automatic selection of that concept revision', () => {
  for (const state of ['PUBLISHED', 'UNKNOWN', 'SENDING', 'RESERVED', 'FAILED', 'SCHEDULED']) {
    const attempted = statusRow('C01-EN', 'EN', JSON.stringify({ kind: 'LIFE_SKILLS_STATUS_V1', state }));
    const next = statusRow('C02-EN', 'EN');
    next[1] = '2';
    const workbook = parseWorkbook({ data: { valueRanges: [
      { values: [[], attempted, next] },
      { values: [['Slot']] },
    ] } });
    assert.equal(nextAsset(workbook, 'EN')?.id, 'C02-EN', state);
  }
  const receiptText = statusRow('C01-EN', 'EN', 'Provider receipt exists; reconcile before retry');
  const next = statusRow('C02-EN', 'EN');
  next[1] = '2';
  const workbook = parseWorkbook({ data: { valueRanges: [{ values: [[], receiptText, next] }, { values: [['Slot']] }] } });
  assert.equal(nextAsset(workbook, 'EN')?.id, 'C02-EN');
});

test('scheduled delivery must retain the exact registry asset, revision, Drive file ID, and digest', () => {
  const workbook = parseWorkbook({ data: { valueRanges: [
    { values: [[], statusRow('C20-HE', 'HE')] },
    { values: [['Slot']] },
  ] } });
  const asset = workbook.assets[0];
  const delivery = { kind: 'LIFE_SKILLS_STATUS_V1', state: 'SCHEDULED', assetId: asset.id, conceptId: asset.concept,
    language: asset.language, surface: asset.surface, revision: asset.revision, driveFileId: 'abc12345', sha256: digest };
  assert.equal(scheduledIdentityMatches({ ...asset, delivery }), true);
  for (const change of [
    { assetId: 'renamed-copy' }, { revision: 'v05' }, { driveFileId: 'replacement-file' }, { sha256: 'b'.repeat(64) }, { conceptId: 21 },
  ]) assert.equal(scheduledIdentityMatches({ ...asset, delivery: { ...delivery, ...change } }), false);
});

test('queued calendar interventions and prior receipts remain visible in the sending preflight', () => {
  const workbook = parseWorkbook({ data: { valueRanges: [
    { values: [[], statusRow('C20-HE', 'HE')] },
    { values: [['Slot']] },
  ] } });
  const asset = workbook.assets[0];
  const scheduledAt = '2026-10-04T09:22:08.000Z';
  asset.delivery = { kind: 'LIFE_SKILLS_STATUS_V1', state: 'SCHEDULED', assetId: asset.id, conceptId: asset.concept,
    language: asset.language, surface: asset.surface, revision: asset.revision, driveFileId: 'abc12345', sha256: digest,
    scheduledAt, anchorSlot: 'D21' };
  const local = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(scheduledAt));
  const slot = { slot: 'D21', date: '2026-10-05', assetUrl: url, version: `v04 FROZEN / ${digest}`, approval: 'Approved', quiet: '',
    status: 'MEDIA ASSOCIATED — no send queued', scheduler: `SCHEDULED — ${local} Asia/Jerusalem via rolling Status publisher`, receipts: '' };
  assert.equal(sameAssetAndSlot(asset, slot, { allowExpectedSchedule: true }), true);
  assert.equal(sameAssetAndSlot(asset, { ...slot, status: 'PUBLISHED / USED' }, { allowExpectedSchedule: true }), false);
  assert.equal(sameAssetAndSlot(asset, { ...slot, scheduler: 'UNKNOWN — operator reconciliation' }, { allowExpectedSchedule: true }), false);
  assert.equal(sameAssetAndSlot(asset, { ...slot, receipts: 'WHAPI: old-receipt' }, { allowExpectedSchedule: true }), false);
});

test('a Status is confirmed only by a read provider story with matching ID and dimensions', () => {
  const result = { http: 200, body: { id: 'receipt', type: 'story', status: 'read', timestamp: 1791106028,
    image: { width: 1080, height: 1920 } } };
  assert.equal(verifiedStoryReadback(result, 'receipt').id, 'receipt');
  assert.equal(verifiedStoryReadback({ ...result, body: { ...result.body, status: 'sent' } }, 'receipt'), null);
  assert.equal(verifiedStoryReadback({ ...result, body: { ...result.body, id: 'other' } }, 'receipt'), null);
  assert.equal(verifiedStoryReadback({ ...result, body: { ...result.body, image: { width: 1080, height: 1350 } } }, 'receipt'), null);
});

test('rolling time uses confirmed provider time and skips Friday and Saturday', () => {
  assert.equal(nextAllowedIso('2026-10-04T09:27:08.000Z', []), '2026-10-05T09:22:08.000Z');
  assert.equal(nextAllowedIso('2026-10-08T09:27:08.000Z', []), '2026-10-11T09:22:08.000Z');
});

test('marketing read model exposes the scheduled English Status from the existing registry', () => {
  const scheduled = JSON.stringify({ kind: 'LIFE_SKILLS_STATUS_V1', state: 'SCHEDULED',
    assetId: 'C01-EN', conceptId: 1, language: 'EN', surface: 'VERTICAL', revision: 'v04', driveFileId: 'abc12345', sha256: digest,
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
