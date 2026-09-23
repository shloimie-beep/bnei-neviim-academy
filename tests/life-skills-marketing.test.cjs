const assert = require('node:assert/strict');
const test = require('node:test');
const { parseWorkbook, publicationState } = require('../src/lib/bna/life-skills-marketing');

const digest = 'a'.repeat(64);

test('marketing workbook projection counts concepts, posts and placements rather than raw files', () => {
  const statusAsset = Array(27).fill('');
  Object.assign(statusAsset, {0:'C09-HE-STATUS-v04',1:'9',2:'HE',3:'VERTICAL',4:'v04',5:'EXPORT',6:'1080',7:'1920',8:'OWNER_APPROVED',9:'BYTES_VERIFIED',10:'https://drive.google.com/file/d/status/view',12:digest,23:'https://drive.google.com/file/d/evidence/view',25:'CHECK_PLACEMENT_AND_RELEASE',26:'CURRENT_APPROVED'});
  const feedAsset = Array(27).fill('');
  Object.assign(feedAsset, {0:'C09-HE-FEED-v04',1:'9',2:'HE',3:'FEED',4:'v04',5:'EXPORT',6:'1080',7:'1350',8:'OWNER_APPROVED',9:'BYTES_VERIFIED',10:'https://drive.google.com/file/d/feed/view',12:digest,25:'CHECK_PLACEMENT_AND_RELEASE',26:'CURRENT_APPROVED'});
  const result = parseWorkbook({
    fetchedAt: '2026-09-23T09:00:00.000Z',
    assetRows: [
      ['Asset key','Concept','Language','Surface','Revision','Kind','Width px','Height px','Approval','Verification','Drive file / archive','Archive member / locator','SHA256','Source / parent','Approval evidence','Prompt / job source','Provider job / ref','Template','QA / hold','Release date (planned)','Calendar slot','Provider delivery','Filename','Record evidence','Ingest date','Readiness','Current library state'],
      statusAsset,
      feedAsset,
      ['LOGO','', 'HE','LOGO','1','LOGO','100','100','OWNER_APPROVED','BYTES_VERIFIED','https://drive.google.com/file/d/logo/view','',digest],
    ],
    calendarRows: [
      ['Slot','Date','Day','Local time','Asset ID','Headline','Proposed caption','WhatsApp Status','Facebook Page','Asset link','Version / SHA256','Exact approval','Holiday / quiet rule','Scheduler state','Provider receipts / errors'],
      ['D09','2026-09-23','Wed','20:00','LS-MONTH-20260914-09','Headline','Caption','QUEUED — exact owner-approved Hebrew Status','','https://drive.google.com/file/d/status/view',`v04 / ${digest}`,'Approved','','QUEUED — daily task owns send','No provider call yet'],
    ],
  });
  assert.equal(result.inventory.files, 3);
  assert.equal(result.inventory.concepts, 1);
  assert.equal(result.inventory.publishablePosts, 1);
  assert.equal(result.inventory.heStatusReady, 1);
  assert.equal(result.inventory.heFeedReady, 1);
  assert.equal(result.inventory.queued, 1);
  assert.equal(result.publications[0].state, 'scheduled');
  assert.equal(result.publications[0].providerReceiptId, null);
});

test('provider acceptance is not publication and quiet-day slots stay skipped', () => {
  assert.equal(publicationState('QUEUED', 'provider accepted', ''), 'scheduled');
  assert.equal(publicationState('SKIP — quiet day', 'SKIP — no backfill', ''), 'skipped');
  assert.equal(publicationState('PUBLISHED', 'complete', 'WHAPI: receipt-1; Direct Whapi GET /messages/receipt-1 returned HTTP200, type=story'), 'published');
});
