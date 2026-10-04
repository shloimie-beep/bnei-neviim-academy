const assert = require('node:assert/strict');
const test = require('node:test');
const { createHash } = require('node:crypto');
const { Readable } = require('node:stream');
const { parseWorkbook, nextAllowedIso, nextAsset, record, scheduledIdentityMatches, sameAssetAndSlot, verifiedStoryReadback, hasPriorConceptDelivery,
  validScheduledAt, invalidScheduledHolds, holdAmbiguousNextTurn, scheduledPreflight, reservationPreflightMatches,
  publisherStatePreflightMatches, attachPoolErrorHandler, exactMedia, MAX_MEDIA_BYTES } = require('../src/lib/bna/life-skills-status-publisher');
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

test('multiple eligible English assets for the next concept produce durable holds instead of row-order selection', () => {
  const first=statusRow('C01-EN-r01','EN'), second=statusRow('C01-EN-r02','EN'), later=statusRow('C02-EN','EN');
  later[1]='2';
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],first,second,later]},{values:[['Slot']]}]}});
  const selection=nextAsset(workbook,'EN');
  assert.equal(selection.state,'HELD');assert.equal(selection.reason,'AMBIGUOUS_NEXT_ENGLISH_ASSET');assert.equal(selection.conceptId,1);
  assert.deepEqual(selection.candidates.map(asset=>asset.id),['C01-EN-r01','C01-EN-r02']);
  const held=holdAmbiguousNextTurn(selection,'2026-10-06T09:22:08.000Z');
  assert.equal(held.length,2);assert.ok(held.every(item=>item.delivery.state==='HELD'&&!item.delivery.scheduledAt&&item.delivery.error.includes('choose one exact approved asset')));
});

test('Hebrew selection binds the calendar slot to its concept and exact unique registry asset', () => {
  const wrongConcept = statusRow('C19-alias','HE'); wrongConcept[1]='19';
  const intended = statusRow('C20-HE','HE'); intended[1]='20';
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D20',1:'2026-10-04',9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict'});
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],wrongConcept,intended]},{values:[['Slot'],calendar] }]}});
  const selected=nextAsset(workbook,'HE','D19');
  assert.equal(selected.asset.id,'C20-HE');
  assert.equal(selected.asset.concept,20);
  assert.equal(selected.slot.slot,'D20');
});

test('ambiguous Hebrew exact matches and changed calendar bindings are durably held',()=>{
  const first=statusRow('C20-HE-r04','HE'), second=statusRow('C20-HE-copy','HE');
  first[1]=second[1]='20';
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D20',1:'2026-10-04',9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict'});
  const ambiguous=parseWorkbook({data:{valueRanges:[{values:[[],first,second]},{values:[['Slot'],calendar]}]}});
  const selection=nextAsset(ambiguous,'HE','D19');
  assert.equal(selection.state,'HELD');assert.equal(selection.reason,'AMBIGUOUS_NEXT_HEBREW_ASSET');assert.equal(selection.slot.slot,'D20');
  const held=holdAmbiguousNextTurn(selection,'2026-10-04T13:00:00.000Z');
  assert.ok(held.every(item=>item.delivery.state==='HELD'&&item.delivery.anchorSlot==='D20'));
  const changed=statusRow('C20-HE-r05','HE');changed[1]='20';changed[10]='https://drive.google.com/file/d/replacement1/view';changed[4]='v05';changed[12]='b'.repeat(64);
  const changedWorkbook=parseWorkbook({data:{valueRanges:[{values:[[],changed]},{values:[['Slot'],calendar]}]}});
  const changedSelection=nextAsset(changedWorkbook,'HE','D19');
  assert.equal(changedSelection.state,'HELD');assert.equal(changedSelection.reason,'HEBREW_CALENDAR_BINDING_MISMATCH');
});

test('an explicit Hebrew calendar hold blocks the next turn without overwriting the hold',()=>{
  const asset=statusRow('C21-HE','HE');asset[1]='21';
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D21',1:'2026-10-05',9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict',13:'OFF — exact approved Status media associated; publishing owner must act'});
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],asset]},{values:[['Slot'],calendar]}]}});
  const selection=nextAsset(workbook,'HE','D20');
  assert.equal(selection.state,'HELD');assert.equal(selection.reason,'HEBREW_CALENDAR_OFF');assert.equal(selection.preserveCalendarHold,true);
  assert.deepEqual(holdAmbiguousNextTurn(selection,'2026-10-04T13:00:00.000Z'),[]);
});

test('the publisher refuses any parallel scheduled record, even if only one record is due',()=>{
  const due=statusRow('C01-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SCHEDULED',scheduledAt:'2026-10-05T09:22:08.000Z'}));
  const future=statusRow('C02-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SCHEDULED',scheduledAt:'2026-10-06T09:22:08.000Z'}));future[1]='2';
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],due,future]},{values:[['Slot']]}]}});
  assert.deepEqual(scheduledPreflight(workbook,Date.parse('2026-10-05T10:00:00.000Z')),
    {state:'HELD',reason:'Multiple scheduled Status records need reconciliation',assetIds:['C01-EN','C02-EN']});
  const single=parseWorkbook({data:{valueRanges:[{values:[[],due]},{values:[['Slot']]}]}});
  assert.equal(scheduledPreflight(single,Date.parse('2026-10-05T09:22:07.000Z')).state,'WAITING');
  assert.equal(scheduledPreflight(single,Date.parse('2026-10-05T09:22:08.000Z')).asset.id,'C01-EN');
});

test('approved media uses its registry size and a hard stream cap before buffering',async()=>{
  const png=Buffer.alloc(33);Buffer.from('89504e470d0a1a0a','hex').copy(png);png.writeUInt32BE(1080,16);png.writeUInt32BE(1920,20);
  const asset={url,digest:createHash('sha256').update(png).digest('hex')};
  const drive={files:{get:async(params,options)=>params.alt==='media'
    ? {data:Readable.from([png.subarray(0,10),png.subarray(10)])}
    : {data:{id:'abc12345',mimeType:'image/png',trashed:false,size:String(png.length)}}}};
  assert.deepEqual(await exactMedia(drive,asset),png);
  let downloads=0;
  const oversizedMetadata={files:{get:async(params)=>{if(params.alt==='media'){downloads++;return {data:Readable.from([])}};return {data:{mimeType:'image/png',trashed:false,size:String(MAX_MEDIA_BYTES+1)}};}}};
  await assert.rejects(exactMedia(oversizedMetadata,asset),/exceeds maximum size/);assert.equal(downloads,0);
  const oversizedStream={files:{get:async(params)=>params.alt==='media'
    ? {data:Readable.from([png,Buffer.alloc(MAX_MEDIA_BYTES)])}
    : {data:{mimeType:'image/png',trashed:false,size:String(png.length)}}}};
  await assert.rejects(exactMedia(oversizedStream,asset),/download exceeds maximum size/);
});

test('malformed saved scheduled timestamps are detected and converted into actionable held records',()=>{
  const valid=statusRow('C01-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SCHEDULED',scheduledAt:'2026-10-05T09:22:08.000Z'}));
  const malformed=statusRow('C02-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SCHEDULED',scheduledAt:'not-a-date'}));
  const missing=statusRow('C03-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SCHEDULED'}));
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],valid,malformed,missing]},{values:[['Slot']]}]}});
  assert.equal(validScheduledAt(workbook.assets[0].delivery.scheduledAt),true);
  assert.equal(validScheduledAt('2026-10-05T09:22:08.000Z'),true);
  const held=invalidScheduledHolds(workbook,'2026-10-04T13:00:00.000Z');
  assert.deepEqual(held.map(item=>item.asset.id),['C02-EN','C03-EN']);
  assert.ok(held.every(item=>item.delivery.state==='HELD'&&item.delivery.heldAt==='2026-10-04T13:00:00.000Z'&&item.delivery.error.startsWith('SCHEDULED_TIMESTAMP_INVALID')));
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
  for(const state of ['HELD','BLOCKED','OFF']) {
    assert.equal(sameAssetAndSlot(asset,{...slot,status:`${state} — operator intervention`},{allowExpectedSchedule:true}),false,state);
    assert.equal(sameAssetAndSlot(asset,{...slot,scheduler:`${state} — operator intervention`},{allowExpectedSchedule:true}),false,state);
  }
});

test('reservation reread blocks changed Asset Registry approval and Calendar holds',()=>{
  const asset=statusRow('C20-HE','HE');
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D20',1:'2026-10-04',9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict',7:'MEDIA ASSOCIATED — no send queued'});
  const parse=(a,c)=>parseWorkbook({data:{valueRanges:[{values:[[],a]},{values:[['Slot'],c]}]}});
  const original=parse(asset,calendar);
  const changedApproval=[...asset];changedApproval[8]='REVIEW';changedApproval[26]='CURRENT_REVIEW';
  assert.equal(reservationPreflightMatches(original,parse(changedApproval,calendar),{initial:true,assetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
  const heldCalendar=[...calendar];heldCalendar[13]='OFF — operator hold';
  assert.equal(reservationPreflightMatches(original,parse(asset,heldCalendar),{initial:true,assetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
});

test('provider POST preflight requires our exact SENDING record and unchanged Calendar fields',()=>{
  const asset=statusRow('C20-HE','HE');
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D20',1:'2026-10-04',9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict',7:'MEDIA ASSOCIATED — no send queued'});
  const parse=(a,c)=>parseWorkbook({data:{valueRanges:[{values:[[],a]},{values:[['Slot'],c]}]}});
  const baseline=parse(asset,calendar), baselineAsset=baseline.assets[0], baselineSlot=baseline.calendar[0];
  const sending={kind:'LIFE_SKILLS_STATUS_V1',state:'SENDING',assetId:baselineAsset.id,conceptId:baselineAsset.concept,
    language:baselineAsset.language,surface:baselineAsset.surface,revision:baselineAsset.revision,driveFileId:'abc12345',sha256:digest,
    queuedAt:'2026-10-04T09:00:00.000Z',scheduledAt:'2026-10-04T09:00:00.000Z',anchorSlot:'D20',reservedAt:'2026-10-04T09:00:01.000Z',submittedAt:'2026-10-04T09:00:02.000Z'};
  const prepared=[...asset];prepared[21]=JSON.stringify(sending);
  const marked=[...calendar];marked[7]='SENDING — C20-HE';marked[13]='SENDING — rolling Status publisher';
  const state=parse(prepared,marked);
  const args={baselineAsset,baselineSlot,expectedDelivery:sending,now:Date.parse('2026-10-04T09:00:03.000Z')};
  assert.equal(publisherStatePreflightMatches(state,args).ok,true);
  const held=[...marked];held[7]='OFF — operator hold';
  assert.equal(publisherStatePreflightMatches(parse(prepared,held),args).ok,false);
  const receipt=[...marked];receipt[14]='WHAPI: unexpected-existing-receipt';
  assert.equal(publisherStatePreflightMatches(parse(prepared,receipt),args).ok,false);
});

test('the persistent scheduler pool logs idle-client errors instead of emitting an uncaught error',()=>{
  const { EventEmitter }=require('node:events');
  const pool=new EventEmitter(), logged=[];
  attachPoolErrorHandler(pool,{error:(...args)=>logged.push(args)});
  assert.doesNotThrow(()=>pool.emit('error',Object.assign(new Error('connection reset'),{code:'ECONNRESET'})));
  assert.equal(logged[0][0],'[life-skills-status] database pool idle client error');
  assert.deepEqual(logged[0][1],{code:'ECONNRESET'});
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

test('marketing read model preserves a durable publisher HELD state and its reason',()=>{
  const reason='SCHEDULED_TIMESTAMP_INVALID: inspect the saved time before rescheduling';
  const held=JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'HELD',assetId:'C01-EN',conceptId:1,language:'EN',surface:'VERTICAL',revision:'v04',driveFileId:'abc12345',sha256:digest,heldAt:'2026-10-04T13:00:00.000Z',error:reason});
  const row=statusRow('C01-EN','EN',held);row[8]='OWNER_APPROVED_EXACT_FILE';
  const result=parseMarketingWorkbook({assetRows:[['Asset key','Concept','Language','Surface','Revision','Kind','Width px','Height px','Approval','Verification','Drive file / archive','Archive member / locator','SHA256','Source / parent','Approval evidence','Prompt / job source','Provider job / ref','Template','QA / hold','Release date (planned)','Calendar slot','Provider delivery','Filename','Record evidence','Ingest date','Readiness','Current library state'],row],calendarRows:[['Slot','Date','Day','Local time','Asset ID','Headline','Proposed caption','WhatsApp Status','Facebook Page','Asset link','Version / SHA256','Exact approval','Holiday / quiet rule','Scheduler state','Provider receipts / errors']]});
  assert.equal(result.publications[0].state,'held');assert.equal(result.publications[0].scheduledFor,null);assert.equal(result.publications[0].errorCode,reason);assert.equal(result.inventory.queued,0);assert.equal(result.inventory.heldMissing,1);
});
