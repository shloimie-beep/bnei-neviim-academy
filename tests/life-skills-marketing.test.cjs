const assert = require('node:assert/strict');
const test = require('node:test');
const { parseWorkbook, publicationState, readLifeSkillsMarketingSnapshot } = require('../src/lib/bna/life-skills-marketing');

const digest = 'a'.repeat(64);
const headers=['Asset key','Concept','Language','Surface','Revision','Kind','Width px','Height px','Approval','Verification','Drive file / archive','Archive member / locator','SHA256','Source / parent','Approval evidence','Prompt / job source','Provider job / ref','Template','QA / hold','Release date (planned)','Calendar slot','Provider delivery','Filename','Record evidence','Ingest date','Readiness','Current library state'];
test('accepted exact recovered bytes stay visible and approved while their release hold does not qualify ads or posts',()=>{
 const row=Array(27).fill('');Object.assign(row,{0:'C03-HE-FEED-RECOVERED',1:'3',2:'HE',3:'FEED',4:'v02',6:'1080',7:'1350',8:'OWNER_ACCEPTED_DISPLAYED_BATCH',10:'https://drive.google.com/file/d/synthetic_accepted/view',12:digest,18:'QA_RECEIPT_NOT_AVAILABLE; do not publish',25:'NOT_RELEASE_READY',26:'CURRENT_ACCEPTED_HELD'});
 const result=parseWorkbook({assetRows:[headers,row]});assert.equal(result.creatives.length,1);assert.equal(result.creatives[0].review,'approved');assert.equal(result.creatives[0].approvedDigest,digest);assert.equal(result.creatives[0].holdReason,row[18]);assert.equal(result.inventory.publishablePosts,0);assert.equal(result.inventory.adEligible,0);assert.equal(result.inventory.heFeedReady,0);assert.equal(result.inventory.needsApproval,0);
});

test('exact-file approval and current review rows remain distinct, including unscheduled assets',()=>{
  const approved=Array(27).fill(''),review=Array(27).fill('');
  Object.assign(approved,{0:'DEMO-EN-STATUS-r1',1:'1',2:'EN',3:'VERTICAL',4:'r1',6:'1080',7:'1920',8:'OWNER_APPROVED_EXACT_FILE',10:'https://drive.google.com/file/d/synthetic_approved/view',12:digest,26:'CURRENT_APPROVED'});
  Object.assign(review,{0:'DEMO-EN-FEED-r1',1:'3',2:'EN',3:'FEED',4:'r1',6:'1080',7:'1350',8:'REVIEW',10:'https://drive.google.com/file/d/synthetic_review/view',12:'b'.repeat(64),26:'CURRENT_REVIEW'});
  const result=parseWorkbook({assetRows:[headers,approved,review]});
  assert.equal(result.creatives.length,2);assert.equal(result.creatives[0].review,'approved');assert.equal(result.creatives[0].approvedDigest,digest);
  assert.equal(result.creatives[1].review,'in_review');assert.equal(result.creatives[1].approvedDigest,null);assert.equal(result.inventory.needsApproval,1);assert.equal(result.publications.length,0);
});

test('marketing workbook projection counts concepts, posts and placements rather than raw files', () => {
  const statusAsset = Array(27).fill('');
  Object.assign(statusAsset, {0:'C09-HE-STATUS-v04',1:'9',2:'HE',3:'VERTICAL',4:'v04',5:'EXPORT',6:'1080',7:'1920',8:'OWNER_APPROVED',9:'BYTES_VERIFIED',10:'https://drive.google.com/file/d/synthetic_status/view',12:digest,23:'https://drive.google.com/file/d/evidence/view',25:'CHECK_PLACEMENT_AND_RELEASE',26:'CURRENT_APPROVED'});
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
      ['D09','2026-09-23','Wed','20:00','LS-MONTH-20260914-09','Headline','Caption','QUEUED — exact owner-approved Hebrew Status','','https://drive.google.com/file/d/synthetic_status/view',`v04 / ${digest}`,'Approved','','QUEUED — daily task owns send','No provider call yet'],
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
test('a concept-wide HE caption cannot attach to EN or feed artwork, and prose evidence does not become a hyperlink', () => {
  const status = Array(27).fill('');Object.assign(status,{0:'DEMO-HE-STATUS',1:'3',2:'HE',3:'VERTICAL',4:'r1',6:'1080',7:'1920',8:'OWNER_APPROVED',10:'https://drive.google.com/file/d/synthetic_status/view',12:digest,23:'Exact byte verification recorded privately',26:'CURRENT_APPROVED'});
  const english=[...status];english[0]='DEMO-EN-STATUS';english[2]='EN';
  const feed=[...status];feed[0]='DEMO-HE-FEED';feed[3]='FEED';feed[7]='1350';
  const calendar=[['Slot','Asset ID','Proposed caption','Version / SHA256','Exact approval','Asset link'],['D03','LS-MONTH-20260914-03','Synthetic Hebrew Status caption',`v01 / ${digest}`,'Approved',status[10]]];
  const result=parseWorkbook({assetRows:[headers,status,english,feed],calendarRows:calendar});
  assert.equal(result.creatives[0].caption,'Synthetic Hebrew Status caption');assert.equal(result.creatives[1].caption,'');assert.equal(result.creatives[2].caption,'');assert.equal(result.creatives[0].sourceUrl,status[10]);assert.equal(result.inventory.publishablePosts,1);
});
test('missing registry columns fail the runtime read instead of returning an empty success',async()=>{
  const sheets={spreadsheets:{values:{batchGet:async()=>({data:{valueRanges:[{values:[['Wrong schema']]}]}})}}};await assert.rejects(readLifeSkillsMarketingSnapshot({sheets}),/GRAPHICS_REGISTRY_UNAVAILABLE/);
});
function approvedStatus(revision=1,hash=digest){const row=Array(27).fill('');Object.assign(row,{0:`DEMO-HE-STATUS-r${revision}`,1:'3',2:'HE',3:'VERTICAL',4:`r${revision}`,6:'1080',7:'1920',8:'OWNER_APPROVED',10:'https://drive.google.com/file/d/synthetic_status/view',12:hash,26:'CURRENT_APPROVED'});return row;}
const exactCalendarHeaders=['Slot','Asset ID','Proposed caption','Version / SHA256','Exact approval','Asset link','WhatsApp Status'];
const exactCalendar=(revision,caption,approval='Approved',hash=digest)=>['D03','LS-MONTH-20260914-03',caption,`v${revision} / ${hash}`,approval,'https://drive.google.com/file/d/synthetic_status/view','READY'];

for(const planned of ['READY','QUEUED','SENDING'])test(`held exact accepted artwork cannot inherit calendar caption or ${planned} publication eligibility`,()=>{
 const held=approvedStatus();held[8]='OWNER_ACCEPTED_DISPLAYED_BATCH';held[18]='QA/caption/publication hold — do not publish';held[26]='CURRENT_ACCEPTED_HELD';
 const row=exactCalendar(1,'Previously approved caption');row[6]=planned;
 const result=parseWorkbook({assetRows:[headers,held],calendarRows:[exactCalendarHeaders,row]});
 assert.equal(result.creatives[0].review,'approved');assert.equal(result.creatives[0].approvedDigest,digest);assert.equal(result.creatives[0].imageUrl,held[10]);assert.equal(result.creatives[0].holdReason,held[18]);
  assert.equal(result.creatives[0].caption,'');assert.equal(result.publications[0].state,planned==='SENDING'?'sending':'draft');assert.equal(result.publications[0].errorCode,'ASSET_PUBLICATION_HELD');assert.equal(result.publications[0].creativeDigest,digest);
 assert.equal(result.inventory.queued,0);assert.equal(result.inventory.publishablePosts,0);assert.equal(result.inventory.heStatusReady,0);assert.equal(result.inventory.needsResizeOrCaption,1);assert.equal(result.inventory.heldMissing,1);
});
test('held exact artwork without a calendar record is still counted as held, not ready',()=>{
 const held=approvedStatus();held[8]='OWNER_ACCEPTED_DISPLAYED_BATCH';held[26]='CURRENT_ACCEPTED_HELD';
 const result=parseWorkbook({assetRows:[headers,held]});assert.equal(result.inventory.heldMissing,1);assert.equal(result.inventory.publishablePosts,0);assert.equal(result.publications.length,0);
});

for(const planned of ['READY','QUEUED','SENDING'])test(`${planned} requires a unique exact current asset binding before it can be operational`,()=>{
 for(const patch of [{5:'https://drive.google.com/file/d/wrong_original/view'},{1:'LS-MONTH-20260914-04'},{3:`v2 / ${digest}`},{3:`v1 / ${'b'.repeat(64)}`}]){
  const row=exactCalendar(1,'Exact approved caption');row[6]=planned;Object.assign(row,patch);
  const result=parseWorkbook({assetRows:[headers,approvedStatus()],calendarRows:[exactCalendarHeaders,row]});
   assert.equal(result.publications[0].state,planned==='SENDING'?'sending':'draft');assert.equal(result.publications[0].errorCode,planned==='QUEUED'?'SCHEDULED_ASSET_BINDING_MISSING':'ASSET_BINDING_UNAVAILABLE');assert.equal(result.publications[0].provider,'unbound');assert.equal(result.publications[0].providerReceiptId,null);assert.equal(result.inventory.queued,0);assert.equal(result.inventory.heldMissing,1);
 }
});
test('bound future records retain artwork, placement and caption approval gates without erasing verified history',()=>{
 for(const patch of [{8:'REVIEW',26:'CURRENT_REVIEW'},{26:'SUPERSEDED'},{7:'1350'}]){
  const asset=approvedStatus();Object.assign(asset,patch);const row=exactCalendar(1,'Caption');row[6]='QUEUED';
   const result=parseWorkbook({assetRows:[headers,asset],calendarRows:[exactCalendarHeaders,row]});assert.equal(result.publications[0].state,'draft');assert.equal(result.publications[0].errorCode,patch[26]==='SUPERSEDED'?'SCHEDULED_ASSET_BINDING_MISSING':'ASSET_PUBLICATION_HELD');assert.equal(result.inventory.queued,0);
 }
 const row=exactCalendar(1,'');row[6]='QUEUED';const result=parseWorkbook({assetRows:[headers,approvedStatus()],calendarRows:[exactCalendarHeaders,row]});assert.equal(result.publications[0].state,'draft');assert.equal(result.publications[0].errorCode,'ASSET_PUBLICATION_HELD');assert.equal(result.inventory.queued,0);
});
test('later artwork holds do not erase historical verified publication receipt evidence',()=>{
 const held=approvedStatus();held[8]='OWNER_ACCEPTED_DISPLAYED_BATCH';held[26]='CURRENT_ACCEPTED_HELD';
 const row=exactCalendar(1,'Historical caption');row[6]='PUBLISHED';row.push(`WHAPI: synthetic-receipt; Direct Whapi GET /messages/synthetic-receipt returned HTTP200, type=story; exact asset DEMO-HE-STATUS-r1 SHA256 ${digest}`);
 const result=parseWorkbook({assetRows:[headers,held],calendarRows:[[...exactCalendarHeaders,'Provider receipts / errors'],row],fetchedAt:'2026-10-04T11:55:00Z'});
 assert.equal(result.creatives[0].caption,'');assert.equal(result.publications[0].state,'published');assert.equal(result.publications[0].providerReceiptId,'synthetic-receipt');assert.equal(result.publications[0].providerReadAt,'2026-10-04T11:55:00Z');assert.equal(result.inventory.published,1);assert.equal(result.inventory.heldMissing,1);
});

for(const evidence of ['not published because delivery failed','WHAPI: synthetic-receipt','type=story','WHAPI: synthetic-receipt; GET /messages/other-receipt returned HTTP200, type=story','WHAPI: synthetic-receipt; GET /messages/synthetic-receipt returned HTTP500, type=story','WHAPI: synthetic-receipt; GET /messages/synthetic-receipt returned HTTP200, type=video'])test(`unverified publication text never exempts held artwork: ${evidence}`,()=>{
 const held=approvedStatus();held[8]='OWNER_ACCEPTED_DISPLAYED_BATCH';held[26]='CURRENT_ACCEPTED_HELD';
 const row=exactCalendar(1,'Held caption');row[6]='PUBLISHED';row.push(evidence);
 const result=parseWorkbook({assetRows:[headers,held],calendarRows:[[...exactCalendarHeaders,'Provider receipts / errors'],row]});
  assert.equal(result.publications[0].state,'unknown');assert.equal(result.publications[0].errorCode,'ASSET_PUBLICATION_HELD');assert.equal(result.publications[0].providerReceiptId,null);assert.equal(result.publications[0].providerReadAt,null);assert.equal(result.publications[0].receiptKind,'unknown');assert.equal(result.inventory.published,0);
 assert.equal(publicationState('PUBLISHED','complete',evidence),'unknown');
});
test('identical bytes cannot borrow another revision or an unapproved calendar caption',()=>{
 const result=parseWorkbook({assetRows:[headers,approvedStatus(1),approvedStatus(2)],calendarRows:[exactCalendarHeaders,exactCalendar(1,'Approved version one'),exactCalendar(2,'Pending version two','Pending')]});
 assert.equal(result.creatives[0].caption,'Approved version one');assert.equal(result.creatives[1].caption,'');assert.equal(result.inventory.publishablePosts,1);assert.equal(result.publications[0].creativeRevision,1);assert.equal(result.publications[1].creativeRevision,2);
});
test('multiple calendar slots never silently overwrite one exact original caption',()=>{
 const result=parseWorkbook({assetRows:[headers,approvedStatus()],calendarRows:[exactCalendarHeaders,exactCalendar(1,'First approved slot'),['D04',...exactCalendar(1,'Another approved slot').slice(1)]]});assert.equal(result.creatives[0].caption,'');assert.equal(result.inventory.publishablePosts,0);
});
test('calendar source binds the actual Status derivative and rejects different file/concept/placement',()=>{
 const derived='b'.repeat(64),status=approvedStatus(2,derived),feed=approvedStatus(2);feed[0]='DEMO-HE-FEED-r2';feed[3]='FEED';feed[7]='1350';
 const row=exactCalendar(2,'Exact approved derivative','Approved',derived);row[3]=`v02 original / ${digest} → Status v02-derived / ${derived}`;
 const result=parseWorkbook({assetRows:[headers,feed,status],calendarRows:[exactCalendarHeaders,row]});assert.equal(result.creatives[0].caption,'');assert.equal(result.creatives[1].caption,'Exact approved derivative');assert.equal(result.publications[0].assetId,status[0]);assert.equal(result.publications[0].creativeDigest,derived);
 for(const patch of [{1:'LS-MONTH-20260914-04'},{5:'https://drive.google.com/file/d/another_status/view'},{3:`v01 / ${derived}`},{4:'Pending'}]){const changed=[...row];Object.assign(changed,patch);assert.equal(parseWorkbook({assetRows:[headers,status],calendarRows:[exactCalendarHeaders,changed]}).creatives[0].caption,'');}
});
test('duplicate current Asset keys cannot project an actionable publication the private media route rejects',()=>{
 const asset=approvedStatus(),collision=approvedStatus(2,'b'.repeat(64));collision[0]=asset[0];collision[10]='https://drive.google.com/file/d/another_status/view';
 const row=exactCalendar(1,'Approved exact caption');row[6]='QUEUED';
 const result=parseWorkbook({assetRows:[headers,asset,collision],calendarRows:[exactCalendarHeaders,row]});
 assert.equal(result.creatives[0].caption,'');assert.equal(result.publications[0].state,'draft');assert.equal(result.publications[0].provider,'unbound');assert.equal(result.publications[0].errorCode,'SCHEDULED_ASSET_BINDING_MISSING');assert.equal(result.inventory.queued,0);
});
test('calendar binding requires an explicit valid registry revision instead of display fallback',()=>{
 for(const revision of ['', 'canonical', 'unknown revision 1', 'v1junk', 'r0', 'v1/v2']){
  const asset=approvedStatus();asset[4]=revision;
  const result=parseWorkbook({assetRows:[headers,asset],calendarRows:[exactCalendarHeaders,exactCalendar(1,'Must not attach')]});
  assert.equal(result.creatives[0].caption,'',revision);assert.equal(result.inventory.publishablePosts,0,revision);assert.equal(result.publications[0].creativeDigest,'',revision);
 }
 for(const revision of ['r01','v01','1','v01-derived','v01/BOLD','NUMERIC-v01']){
  const asset=approvedStatus();asset[4]=revision;
  assert.equal(parseWorkbook({assetRows:[headers,asset],calendarRows:[exactCalendarHeaders,exactCalendar(1,'Explicit version')]}).creatives[0].caption,'Explicit version',revision);
 }
});

test('an explicit corrected row cannot lend its approved caption to a legacy malformed sibling',()=>{
  for(const revision of ['', 'canonical', 'unknown revision 1', 'v1junk', 'r0', 'v1/v2']){
  const explicit=approvedStatus(),legacy=[...explicit];legacy[4]=revision;
  const result=parseWorkbook({assetRows:[headers,explicit,legacy],calendarRows:[exactCalendarHeaders,exactCalendar(1,'Only the explicit row')]});
   assert.equal(result.creatives[0].caption,'',revision);assert.equal(result.creatives[1].caption,'',revision);assert.equal(result.inventory.publishablePosts,0,revision);assert.equal(result.publications[0].state,'draft',revision);
 }
 const a=approvedStatus(),b=[...a];b[10]='https://drive.google.com/file/d/another_status/view';
  const matched=parseWorkbook({assetRows:[headers,a,b],calendarRows:[exactCalendarHeaders,exactCalendar(1,'Only exact file')]});assert.equal(matched.creatives[0].caption,'');assert.equal(matched.creatives[1].caption,'');assert.equal(matched.publications[0].state,'draft');assert.equal(matched.inventory.queued,0);
});

function publisherDelivery(asset, state, extra={}) {
  return JSON.stringify({ kind:'LIFE_SKILLS_STATUS_V1', state, assetId:asset[0], conceptId:Number(asset[1]), language:asset[2], surface:asset[3],
    revision:asset[4], driveFileId:'synthetic_status', sha256:asset[12], scheduledAt:'2026-10-05T09:22:08.000Z', anchorSlot:'D03', ...extra });
}

test('an exact registry-bound Status reservation projects as scheduled with its durable time',()=>{
 const asset=approvedStatus();asset[21]=publisherDelivery(asset,'SCHEDULED');
 const row=exactCalendar(1,'Approved exact caption');row[6]='MEDIA ASSOCIATED — no send queued';row.push('OFF — exact approved Status media associated; publishing owner must act','');
 const calendarHeaders=[...exactCalendarHeaders,'Scheduler state','Provider receipts / errors'];
 const result=parseWorkbook({assetRows:[headers,asset],calendarRows:[calendarHeaders,row]});
 assert.equal(result.publications[0].state,'scheduled');assert.equal(result.publications[0].provider,'whapi');assert.equal(result.publications[0].scheduledFor,'2026-10-05T09:22:08.000Z');assert.equal(result.inventory.queued,1);
});

test('a queued calendar row without a unique exact Asset Registry match is held, not shown as scheduled',()=>{
 const asset=approvedStatus();const row=exactCalendar(1,'Approved exact caption');row[5]='https://drive.google.com/file/d/replacement_status/view';row.push('SCHEDULED — future Status','');
 const result=parseWorkbook({assetRows:[headers,asset],calendarRows:[[...exactCalendarHeaders,'Scheduler state','Provider receipts / errors'],row]});
 assert.equal(result.publications[0].state,'draft');assert.equal(result.publications[0].provider,'unbound');assert.equal(result.publications[0].errorCode,'SCHEDULED_ASSET_BINDING_MISSING');assert.equal(result.inventory.queued,0);
});

test('a scheduled image replacement stays bound to the original revision and is held pending renewed scheduling approval',()=>{
 const asset=approvedStatus();asset[21]=publisherDelivery(asset,'SCHEDULED');
 const row=exactCalendar(1,'Approved exact caption');row.push('SCHEDULED — future Status','');
 asset[10]='https://drive.google.com/file/d/replacement_status/view';asset[12]='b'.repeat(64);
 const result=parseWorkbook({assetRows:[headers,asset],calendarRows:[[...exactCalendarHeaders,'Scheduler state','Provider receipts / errors'],row]});
 assert.equal(result.publications[0].state,'draft');assert.equal(result.publications[0].errorCode,'SCHEDULED_ASSET_BINDING_CHANGED');assert.equal(result.publications[0].creativeDigest,digest);assert.equal(result.publications[0].scheduledFor,'2026-10-05T09:22:08.000Z');assert.equal(result.inventory.queued,0);
});

test('a verified Whapi story receipt is recognized and bound to the exact published revision',()=>{
 const asset=approvedStatus();asset[21]=publisherDelivery(asset,'PUBLISHED',{providerHttp:200,providerReceiptId:'synthetic-story',confirmedAt:'2026-10-04T09:27:08.000Z',verificationAt:'2026-10-04T09:27:15.000Z',providerType:'story',providerWidth:1080,providerHeight:1920});
 const row=exactCalendar(1,'Published exact caption');row[6]='PUBLISHED / USED';
 row.push(`WHAPI: synthetic-story; GET /stories/synthetic-story HTTP200, type=story, 1080x1920; exact asset ${asset[0]} SHA256 ${digest}`);
 const result=parseWorkbook({assetRows:[headers,asset],calendarRows:[[...exactCalendarHeaders,'Provider receipts / errors'],row]});
 assert.equal(result.publications.length,1);assert.equal(result.publications[0].state,'published');assert.equal(result.publications[0].providerReceiptId,'synthetic-story');assert.equal(result.publications[0].creativeDigest,digest);assert.equal(result.inventory.published,1);
});
