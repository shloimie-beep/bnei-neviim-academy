const assert = require('node:assert/strict');
const test = require('node:test');
const { createHash } = require('node:crypto');
const { Readable } = require('node:stream');
const { parseWorkbook, isEligible, nextAllowedIso, nextAsset, record, scheduledIdentityMatches, sameAssetAndSlot, verifiedStoryReadback, hasPriorConceptDelivery,
  validScheduledAt, invalidScheduledHolds, invalidActiveAttemptHolds, holdAmbiguousNextTurn, scheduledPreflight, reservationPreflightMatches,
  publisherStatePreflightMatches, successorPreflightMatches, publicationResultPreflight,
  successorScheduleIso, heldSuccessorCalendarUpdates, scheduledSuccessorCalendarUpdates,
  invalidPublisherRecordHolds, pendingSuccessorPlan, pendingSuccessorPreflightMatches,
  reanchorRequestKey, reanchorPreflight, authorizedReanchor,
  attachPoolErrorHandler, exactMedia, MAX_MEDIA_BYTES } = require('../src/lib/bna/life-skills-status-publisher');
const { parseWorkbook: parseMarketingWorkbook } = require('../src/lib/bna/life-skills-marketing');

const digest = 'a'.repeat(64);
const url = 'https://drive.google.com/file/d/abc12345/view';
const calendarConceptId = concept => `LS-MONTH-20260914-${String(concept).padStart(2, '0')}`;
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

test('Asset Registry Readiness HOLD, PENDING, and REVIEW values block automatic eligibility',()=>{
  for(const readiness of ['HOLD — owner review required','PENDING exact approval','REVIEW current export']){
    const asset=statusRow('C01-EN','EN');asset[25]=readiness;
    const workbook=parseWorkbook({data:{valueRanges:[{values:[[],asset]},{values:[['Slot']]}]}});
    assert.equal(workbook.assets[0].readiness,readiness.toUpperCase());
    assert.equal(isEligible(workbook.assets[0]),false,readiness);
    assert.equal(nextAsset(workbook,'EN'),null,readiness);
  }
});

test('explicit release blockers in Readiness or QA prevent Status selection',()=>{
  const notReady=statusRow('C01-EN','EN');notReady[25]='NOT_RELEASE_READY';
  const doNotPublish=statusRow('C02-EN','EN');doNotPublish[1]='2';doNotPublish[18]='Owner note: do not publish';
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],notReady,doNotPublish]},{values:[['Slot']] } ]}});
  assert.equal(isEligible(workbook.assets[0]),false);
  assert.equal(isEligible(workbook.assets[1]),false);
  assert.equal(nextAsset(workbook,'EN'),null);
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
  Object.assign(calendar,{0:'D20',1:'2026-10-04',4:calendarConceptId(20),9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict'});
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],wrongConcept,intended]},{values:[['Slot'],calendar] }]}});
  const selected=nextAsset(workbook,'HE','D19');
  assert.equal(selected.asset.id,'C20-HE');
  assert.equal(selected.asset.concept,20);
  assert.equal(selected.slot.slot,'D20');
  assert.equal(selected.slot.assetId,calendarConceptId(20));
  const wrongCalendarAsset=[...calendar];wrongCalendarAsset[4]=calendarConceptId(19);
  const mismatched=parseWorkbook({data:{valueRanges:[{values:[[],wrongConcept,intended]},{values:[['Slot'],wrongCalendarAsset]}]}});
  assert.equal(nextAsset(mismatched,'HE','D19').reason,'HEBREW_CALENDAR_BINDING_MISMATCH');
  const exactRegistryBinding=[...calendar];exactRegistryBinding[4]='C20-HE';
  const exact=parseWorkbook({data:{valueRanges:[{values:[[],intended]},{values:[['Slot'],exactRegistryBinding]}]}});
  assert.equal(nextAsset(exact,'HE','D19').asset.id,'C20-HE');
});

test('Hebrew successor selection follows the lowest numeric Calendar slot, not sheet row order',()=>{
  const c21=statusRow('C21-HE','HE'),c22=statusRow('C22-HE','HE');c21[1]='21';c22[1]='22';
  const slot=(name,date)=>{const row=Array(15).fill('');const concept=Number(name.match(/\d+/)?.[0]);Object.assign(row,{0:name,1:date,4:calendarConceptId(concept),9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict'});return row;};
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],c21,c22]},{values:[['Slot'],slot('D22','2026-10-06'),slot('D21','2026-10-05')]}]}});
  const selection=nextAsset(workbook,'HE','D20');
  assert.equal(selection.asset.id,'C21-HE');
  assert.equal(selection.slot.slot,'D21');
});

test('ambiguous Hebrew exact matches and changed calendar bindings are durably held',()=>{
  const first=statusRow('C20-HE-r04','HE'), second=statusRow('C20-HE-copy','HE');
  first[1]=second[1]='20';
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D20',1:'2026-10-04',4:calendarConceptId(20),7:'MEDIA ASSOCIATED — no send queued',9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict'});
  const ambiguous=parseWorkbook({data:{valueRanges:[{values:[[],first,second]},{values:[['Slot'],calendar]}]}});
  const selection=nextAsset(ambiguous,'HE','D19');
  assert.equal(selection.state,'HELD');assert.equal(selection.reason,'AMBIGUOUS_NEXT_HEBREW_ASSET');assert.equal(selection.slot.slot,'D20');
  const held=holdAmbiguousNextTurn(selection,'2026-10-04T13:00:00.000Z');
  assert.ok(held.every(item=>item.delivery.state==='HELD'&&item.delivery.holdType==='SELECTION'&&item.delivery.anchorSlot==='D20'));
  const firstHeld=[...first],secondHeld=[...second];firstHeld[21]=JSON.stringify(held[0].delivery);secondHeld[21]=JSON.stringify(held[1].delivery);
  const heldSlot=[...calendar];heldSlot[7]=`HELD — ${held[0].delivery.error}`;heldSlot[13]=held[0].delivery.error;
  secondHeld[26]='CURRENT_REVIEW';
  const resolved=parseWorkbook({data:{valueRanges:[{values:[[],firstHeld,secondHeld]},{values:[['Slot'],heldSlot]}]}});
  const recovered=nextAsset(resolved,'HE','D19');
  assert.equal(recovered.asset.id,first[0]);assert.equal(recovered.slot.recoverPublisherSelectionHold,true);
  assert.equal(recovered.slot.calendarRestoreStatus,'MEDIA ASSOCIATED — no send queued');
  assert.equal(hasPriorConceptDelivery(resolved,recovered.asset),false);
  const recheck=successorPreflightMatches(resolved,resolved,recovered,{nextLanguage:'HE',publishingAssetId:'C19-HE',anchorSlot:'D19',now:Date.parse('2026-10-04T09:00:00.000Z')});
  assert.equal(recheck.ok,true);assert.equal(recheck.selection.slot.recoverPublisherSelectionHold,true);
  const changed=statusRow('C20-HE-r05','HE');changed[1]='20';changed[10]='https://drive.google.com/file/d/replacement1/view';changed[4]='v05';changed[12]='b'.repeat(64);
  const changedWorkbook=parseWorkbook({data:{valueRanges:[{values:[[],changed]},{values:[['Slot'],calendar]}]}});
  const changedSelection=nextAsset(changedWorkbook,'HE','D19');
  assert.equal(changedSelection.state,'HELD');assert.equal(changedSelection.reason,'HEBREW_CALENDAR_BINDING_MISMATCH');
});

test('an explicit Hebrew calendar hold blocks the next turn without overwriting the hold',()=>{
  const asset=statusRow('C21-HE','HE');asset[1]='21';
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D21',1:'2026-10-05',4:calendarConceptId(21),9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict',13:'OFF — exact approved Status media associated; publishing owner must act'});
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

test('malformed active-attempt timestamps are held and SENDING attempts become UNKNOWN',()=>{
  const reserved=statusRow('C01-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'RESERVED',submittedAt:'2026-10-04T12:59:00.000Z'}));
  const malformedReserved=statusRow('C02-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SENDING',reservedAt:'not-a-date',submittedAt:'2026-10-04T12:59:00.000Z'}));
  const missingSubmitted=statusRow('C03-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SENDING',reservedAt:'2026-10-04T12:58:00.000Z'}));
  const valid=statusRow('C04-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SENDING',reservedAt:'2026-10-04T12:58:00.000Z',submittedAt:'2026-10-04T12:59:00.000Z'}));
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],reserved,malformedReserved,missingSubmitted,valid]},{values:[['Slot']]}]}});
  const held=invalidActiveAttemptHolds(workbook,'2026-10-04T13:00:00.000Z');
  assert.deepEqual(held.map(item=>[item.asset.id,item.delivery.state]),[['C01-EN','HELD'],['C02-EN','UNKNOWN'],['C03-EN','UNKNOWN']]);
  assert.ok(held[1].delivery.error.includes('inspect provider history before retry'));
  assert.ok(held.every(item=>item.delivery.recoveryAt==='2026-10-04T13:00:00.000Z'&&item.delivery.error.startsWith('ACTIVE_ATTEMPT_TIMESTAMP_INVALID')));
});

test('malformed saved publisher records become durable actionable holds',()=>{
  const raw='{"kind":"LIFE_SKILLS_STATUS_V1","state":"SCHEDULED","assetId":"C01-EN';
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],statusRow('C01-EN','EN',raw)]},{values:[['Slot']]}]}});
  const [held]=invalidPublisherRecordHolds(workbook,'2026-10-04T09:00:00.000Z');
  assert.equal(held.asset.id,'C01-EN');
  assert.equal(held.delivery.state,'HELD');
  assert.equal(held.delivery.holdType,'MALFORMED_RECORD');
  assert.match(held.delivery.error,/reconcile saved send state/);
  assert.equal(held.delivery.malformedRecordRaw,raw);
  assert.equal(held.delivery.malformedRecordLength,raw.length);
  assert.equal(held.delivery.malformedRecordSha256,createHash('sha256').update(raw).digest('hex'));
  assert.equal(scheduledPreflight({assets:[{...held.asset,delivery:held.delivery}],calendar:[]}).state,'HELD');
  const attemptedRaw='{"kind":"LIFE_SKILLS_STATUS_V1","state":"SENDING","providerReceiptId":"possible-receipt"';
  const attempted=parseWorkbook({data:{valueRanges:[
    {values:[[],statusRow('C03-EN','EN',attemptedRaw)]},
    {values:[['Slot']]},
  ]}});
  const [unknown]=invalidPublisherRecordHolds(attempted,'2026-10-04T09:00:00.000Z');
  assert.equal(unknown.delivery.state,'UNKNOWN');
  assert.match(unknown.delivery.error,/inspect provider history before retry/);
  assert.equal(scheduledPreflight({assets:[{...unknown.asset,delivery:unknown.delivery}],calendar:[]}).state,'UNKNOWN');
  const sentinel=parseWorkbook({data:{valueRanges:[{values:[[],statusRow('C02-EN','EN','No provider delivery')]},{values:[['Slot']]}]}});
  assert.deepEqual(invalidPublisherRecordHolds(sentinel,'2026-10-04T09:00:00.000Z'),[]);
});

test('malformed-record repair leaves unrelated registry formats and ordinary Status notes untouched',()=>{
  const publisherRaw='{"kind":"LIFE_SKILLS_STATUS_V1","state":"SENDING"';
  const statusNote=statusRow('C02-EN','EN','Manual review note: check marketing row');
  const feedRecord=statusRow('C03-EN-FEED','EN',publisherRaw);feedRecord[3]='FEED';
  const workbook=parseWorkbook({data:{valueRanges:[{values:[[],statusRow('C01-EN','EN',publisherRaw),statusNote,feedRecord]},{values:[['Slot']]}]}});
  const held=invalidPublisherRecordHolds(workbook,'2026-10-04T09:00:00.000Z');
  assert.deepEqual(held.map(item=>item.asset.id),['C01-EN']);
  assert.equal(held[0].delivery.state,'UNKNOWN');
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
  const queuedAsset=statusRow('C21-HE','HE');queuedAsset[1]='21';
  const workbook = parseWorkbook({ data: { valueRanges: [
    { values: [[], queuedAsset] },
    { values: [['Slot']] },
  ] } });
  const asset = workbook.assets[0];
  const scheduledAt = '2026-10-05T09:22:08.000Z';
  asset.delivery = { kind: 'LIFE_SKILLS_STATUS_V1', state: 'SCHEDULED', assetId: asset.id, conceptId: asset.concept,
    language: asset.language, surface: asset.surface, revision: asset.revision, driveFileId: 'abc12345', sha256: digest,
    scheduledAt, anchorSlot: 'D21' };
  const local = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(scheduledAt));
  const slot = { slot: 'D21', date: '2026-10-05', assetId: calendarConceptId(21), assetUrl: url, version: `v04 FROZEN / ${digest}`, approval: 'Approved', quiet: '',
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
  Object.assign(calendar,{0:'D20',1:'2026-10-04',4:calendarConceptId(20),9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict',7:'MEDIA ASSOCIATED — no send queued'});
  const parse=(a,c)=>parseWorkbook({data:{valueRanges:[{values:[[],a]},{values:[['Slot'],c]}]}});
  const original=parse(asset,calendar);
  const changedApproval=[...asset];changedApproval[8]='REVIEW';changedApproval[26]='CURRENT_REVIEW';
  assert.equal(reservationPreflightMatches(original,parse(changedApproval,calendar),{initial:true,assetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
  const changedReadiness=[...asset];changedReadiness[25]='HOLD — owner review required';
  assert.equal(reservationPreflightMatches(original,parse(changedReadiness,calendar),{initial:true,assetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
  const changedCalendarAsset=[...calendar];changedCalendarAsset[4]=calendarConceptId(19);
  assert.equal(reservationPreflightMatches(original,parse(asset,changedCalendarAsset),{initial:true,assetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
  const heldCalendar=[...calendar];heldCalendar[13]='OFF — operator hold';
  assert.equal(reservationPreflightMatches(original,parse(asset,heldCalendar),{initial:true,assetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
});

test('provider POST preflight requires our exact SENDING record and unchanged Calendar fields',()=>{
  const asset=statusRow('C20-HE','HE');
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D20',1:'2026-10-04',4:calendarConceptId(20),9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict',7:'MEDIA ASSOCIATED — no send queued'});
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
  const changedAssetId=[...marked];changedAssetId[4]=calendarConceptId(19);
  assert.equal(publisherStatePreflightMatches(parse(prepared,changedAssetId),args).ok,false);
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

test('successor reread refuses a changed approval, replacement, Calendar intervention, or parallel schedule',()=>{
  const hebrew=statusRow('C20-HE','HE'), english=statusRow('C01-EN','EN');
  const parse=(assets,calendar=[['Slot']])=>parseWorkbook({data:{valueRanges:[{values:[[],...assets]},{values:calendar}]}});
  const original=parse([hebrew,english]);
  const selection=nextAsset(original,'EN','D20');
  assert.equal(selection.id,'C01-EN');
  const refreshed=parse([hebrew,english]);
  const matched=successorPreflightMatches(original,refreshed,selection,
    {nextLanguage:'EN',publishingAssetId:'C20-HE',now:Date.parse('2026-10-04T09:00:00.000Z')});
  assert.equal(matched.ok,true);assert.equal(matched.workbook,refreshed);
  const revoked=[...english];revoked[26]='CURRENT_REVIEW';
  assert.equal(successorPreflightMatches(original,parse([hebrew,revoked]),selection,
    {nextLanguage:'EN',publishingAssetId:'C20-HE',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
  const scheduled=[...statusRow('C02-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'SCHEDULED',scheduledAt:'2026-10-05T09:22:08.000Z'}))];scheduled[1]='2';
  assert.equal(successorPreflightMatches(original,parse([hebrew,english,scheduled]),selection,
    {nextLanguage:'EN',publishingAssetId:'C20-HE',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
  const c02=statusRow('C02-EN','EN');c02[1]='2';
  const originalC02=parse([hebrew,c02]), selectionC02=nextAsset(originalC02,'EN','D20');
  const newlyEarlier=statusRow('C01-EN','EN');
  assert.equal(successorPreflightMatches(originalC02,parse([hebrew,newlyEarlier,c02]),selectionC02,
    {nextLanguage:'EN',publishingAssetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
  const duplicateConcept=statusRow('C02-EN-copy','EN');duplicateConcept[1]='2';
  assert.equal(successorPreflightMatches(originalC02,parse([hebrew,c02,duplicateConcept]),selectionC02,
    {nextLanguage:'EN',publishingAssetId:'C20-HE',anchorSlot:'D20',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);

  const c21=statusRow('C21-HE','HE');c21[1]='21';
  const d21=Array(15).fill('');Object.assign(d21,{0:'D21',1:'2026-10-05',4:calendarConceptId(21),7:'MEDIA ASSOCIATED — no send queued',9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict'});
  const hebrewOriginal=parse([hebrew,c21],[['Slot'],d21]);
  const hebrewSelection=nextAsset(hebrewOriginal,'HE','D20');
  assert.equal(hebrewSelection.asset.id,'C21-HE');
  const off=[...d21];off[13]='OFF — operator hold';
  assert.equal(successorPreflightMatches(hebrewOriginal,parse([hebrew,c21],[['Slot'],off]),hebrewSelection,
    {nextLanguage:'HE',publishingAssetId:'C20-HE',now:Date.parse('2026-10-04T09:00:00.000Z')}).ok,false);
});

test('successor holds use the refreshed Calendar row after an insertion',()=>{
  const d21=Array(15).fill('');Object.assign(d21,{0:'D21',1:'2026-10-05'});
  const current=parseWorkbook({data:{valueRanges:[{values:[[]]},{values:[['Slot'],['D19','2026-10-03'],['D20','2026-10-04'],d21]}]}});
  const held=[{asset:{id:'C21-HE',rowNumber:4},delivery:{anchorSlot:'D21',error:'AMBIGUOUS_NEXT_HEBREW_ASSET'}}];
  const result=heldSuccessorCalendarUpdates(current.calendar,held);
  assert.deepEqual([...result.slots],['D21']);
  assert.deepEqual(result.updates.map(item=>item.range),["'30-Day Calendar'!H12","'30-Day Calendar'!N12"]);
  const scheduleHold=heldSuccessorCalendarUpdates(current.calendar,[{asset:{id:'C01-EN'},delivery:{anchorSlot:'D21',holdType:'SUCCESSOR_SCHEDULE',error:'SUCCESSOR_SCHEDULE_HORIZON_EXHAUSTED'}}]);
  assert.deepEqual(scheduleHold,{updates:[],slots:new Set()});
});

test('scheduling a resolved selection hold restores its prior Calendar state',()=>{
  const slot={rowNumber:12,recoverPublisherSelectionHold:true,calendarRestoreStatus:'MEDIA ASSOCIATED — no send queued'};
  const updates=scheduledSuccessorCalendarUpdates(slot,'2026-10-05T09:22:08.000Z');
  assert.deepEqual(updates.map(item=>item.range),["'30-Day Calendar'!H12","'30-Day Calendar'!N12"]);
  assert.equal(updates[0].values[0][0],'MEDIA ASSOCIATED — no send queued');
  assert.match(updates[1].values[0][0],/^SCHEDULED —/);
});

test('a resolved held successor resumes at its original future roll time and never backfills',()=>{
  const priorDelivery={kind:'LIFE_SKILLS_STATUS_V1',state:'PUBLISHED',used:true,assetId:'C20-HE',conceptId:20,
    language:'HE',surface:'VERTICAL',revision:'v04',driveFileId:'abc12345',sha256:digest,anchorSlot:'D20',
    providerReceiptId:'receipt20',confirmedAt:'2026-10-04T09:27:08.000Z',verificationAt:'2026-10-04T09:27:15.762Z',
    providerType:'story',providerWidth:1080,providerHeight:1920,
    nextTurnHold:{state:'HELD',language:'EN',reason:'AMBIGUOUS_NEXT_ENGLISH_ASSET',candidateAssetIds:['C01-EN','C01-EN-copy']}};
  const prior=statusRow('C20-HE','HE',JSON.stringify(priorDelivery));
  const selected=statusRow('C01-EN','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'HELD',holdType:'SELECTION'}));
  const revoked=statusRow('C01-EN-copy','EN',JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'HELD',holdType:'SELECTION'}));
  revoked[26]='CURRENT_REVIEW';
  const calendar=Array.from({length:27},(_,index)=>{const date=new Date(Date.UTC(2026,9,4+index)).toISOString().slice(0,10);return {slot:index===0?'D20':`D${index+20}`,date,day:'',status:'',assetUrl:'',version:'',approval:'',quiet:'No recorded holiday conflict',scheduler:'',receipts:''};});
  const workbook={assets:parseWorkbook({data:{valueRanges:[{values:[[],prior,selected,revoked]},{values:[['Slot']]}]}}).assets,calendar};
  const plan=pendingSuccessorPlan(workbook,Date.parse('2026-10-04T10:00:00.000Z'));
  assert.equal(plan.state,'READY');
  assert.equal(plan.asset.id,'C01-EN');
  assert.equal(plan.scheduledAt,'2026-10-05T09:22:08.000Z');
  assert.equal(pendingSuccessorPreflightMatches(workbook,workbook,plan,{now:Date.parse('2026-10-04T10:00:00.000Z')}).ok,true);
  const past=pendingSuccessorPlan(workbook,Date.parse('2026-10-05T09:23:00.000Z'));
  assert.equal(past.state,'HELD');
  assert.equal(past.reason,'SUCCESSOR_SCHEDULE_TIME_PASSED_NO_BACKFILL');
  const changed={...workbook,assets:workbook.assets.map(item=>item.id==='C20-HE'
    ? {...item,delivery:{...item.delivery,nextTurnHold:{...item.delivery.nextTurnHold,state:'RESOLVED'}}} : item)};
  assert.equal(pendingSuccessorPreflightMatches(workbook,changed,plan,{now:Date.parse('2026-10-04T10:00:00.000Z')}).ok,false);
});

test('a successor schedule horizon hold becomes eligible again when Calendar is extended',()=>{
  const priorDelivery={kind:'LIFE_SKILLS_STATUS_V1',state:'PUBLISHED',used:true,assetId:'C20-HE',conceptId:20,
    language:'HE',surface:'VERTICAL',revision:'v04',driveFileId:'abc12345',sha256:digest,anchorSlot:'D20',
    providerReceiptId:'receipt20',confirmedAt:'2026-10-04T09:27:08.000Z',verificationAt:'2026-10-04T09:27:15.762Z',
    providerType:'story',providerWidth:1080,providerHeight:1920,
    nextTurnHold:{state:'HELD',language:'EN',reason:'SUCCESSOR_SCHEDULE_HORIZON_EXHAUSTED',candidateAssetIds:['C01-EN']}};
  const successorHold={kind:'LIFE_SKILLS_STATUS_V1',state:'HELD',holdType:'SUCCESSOR_SCHEDULE',assetId:'C01-EN',
    conceptId:1,language:'EN',surface:'VERTICAL',revision:'v04',driveFileId:'abc12345',sha256:digest,
    anchorSlot:'D20',predecessorReceiptId:'receipt20',error:'SUCCESSOR_SCHEDULE_HORIZON_EXHAUSTED: refresh Calendar'};
  const prior=statusRow('C20-HE','HE',JSON.stringify(priorDelivery));
  const english=statusRow('C01-EN','EN',JSON.stringify(successorHold));
  const parse=(calendarRows)=>parseWorkbook({data:{valueRanges:[{values:[[],prior,english]},{values:calendarRows}]}});
  const short=parse([['Slot'],['D20','2026-10-04']]);
  const now=Date.parse('2026-10-04T10:00:00.000Z');
  assert.equal(pendingSuccessorPlan(short,now).reason,'SUCCESSOR_SCHEDULE_HORIZON_EXHAUSTED');
  const extended=parse([['Slot'],['D20','2026-10-04'],['D21','2026-10-05']]);
  const recovered=pendingSuccessorPlan(extended,now);
  assert.equal(recovered.state,'READY');
  assert.equal(recovered.asset.id,'C01-EN');
  assert.equal(recovered.scheduledAt,'2026-10-05T09:22:08.000Z');
  assert.equal(pendingSuccessorPreflightMatches(extended,extended,recovered,{now}).ok,true);
  const foreignHold={...extended,assets:extended.assets.map(asset=>asset.id==='C01-EN'
    ? {...asset,delivery:{...asset.delivery,predecessorReceiptId:'different-receipt'}} : asset)};
  assert.equal(pendingSuccessorPlan(foreignHold,now).reason,'SUCCESSOR_SCHEDULE_HOLD_PREDECESSOR_MISMATCH');
});

function reanchorFixture({off=true,successorDelivery='',quiet='No recorded holiday conflict',scheduledQuiet=quiet}={}) {
  const predecessorDelivery={kind:'LIFE_SKILLS_STATUS_V1',state:'PUBLISHED',used:true,
    assetId:'C01-EN-VERTICAL-TEAL-H2-r01',conceptId:1,language:'EN',surface:'VERTICAL',revision:'v01',
    driveFileId:'predecessor-drive',sha256:'b'.repeat(64),anchorSlot:'D01',providerReceiptId:'Pso5yqYWQCBDlso-xGsA',
    confirmedAt:'2026-10-05T09:23:11.000Z',verificationAt:'2026-10-05T09:23:18.000Z',providerType:'story',
    providerWidth:1080,providerHeight:1920,nextTurnHold:{state:'HELD',language:'HE',reason:'HEBREW_CALENDAR_OFF',
      conceptId:21,candidateAssetIds:['C21-HE-STATUS-TEAL-v04-FROZEN']}};
  const predecessor=statusRow('C01-EN-VERTICAL-TEAL-H2-r01','EN',JSON.stringify(predecessorDelivery));
  predecessor[1]='1';predecessor[4]='v01';predecessor[10]='https://drive.google.com/file/d/predecessor-drive/view';predecessor[12]='b'.repeat(64);
  const successor=statusRow('C21-HE-STATUS-TEAL-v04-FROZEN','HE',successorDelivery);
  successor[1]='21';successor[10]='https://drive.google.com/file/d/1vIZuC9WLxLiwuuKWdkVrwQyL4j6jr31r/view';
  successor[12]='87943a42360ad8299b576ce875bca9b0ed9d6ddf51a55cd87e1aa506224512fb';
  const d21=Array(15).fill('');Object.assign(d21,{0:'D21',1:'2026-10-05',4:calendarConceptId(21),
    7:'MEDIA ASSOCIATED — no send queued',9:successor[10],10:`v04 FROZEN / ${successor[12]}`,11:'Approved',12:quiet,
    13:off?'OFF — exact approved Status media associated; publishing owner must act':''});
  const future=Array(15).fill('');Object.assign(future,{0:'D24',1:'2026-10-08',12:scheduledQuiet});
  const assetHeader=[];const calendarHeader=[];
  const raw={assetRows:[assetHeader,predecessor,successor],calendarRows:[calendarHeader,d21,future]};
  return {raw,workbook:parseWorkbook({data:{valueRanges:[{values:raw.assetRows},{values:raw.calendarRows}]}})};
}
function reanchorAuthorization(extra={}) {
  return {ownerAuthorized:true,predecessorReceiptId:'Pso5yqYWQCBDlso-xGsA',assetId:'C21-HE-STATUS-TEAL-v04-FROZEN',
    language:'HE',surface:'VERTICAL',revision:'v04',driveFileId:'1vIZuC9WLxLiwuuKWdkVrwQyL4j6jr31r',
    sha256:'87943a42360ad8299b576ce875bca9b0ed9d6ddf51a55cd87e1aa506224512fb',width:1080,height:1920,
    scheduledAt:'2026-10-08T09:18:11.000Z',...extra};
}

test('future re-anchor remains held with D21 OFF or without explicit authorization, and never backfills',()=>{
  const now=Date.parse('2026-10-07T08:00:00.000Z');
  assert.equal(reanchorPreflight(reanchorFixture({off:true}).workbook,reanchorAuthorization(),{now}).reason,'HEBREW_CALENDAR_OFF');
  assert.equal(reanchorPreflight(reanchorFixture({off:false}).workbook,reanchorAuthorization({ownerAuthorized:false}),{now}).reason,
    'EXPLICIT_REANCHOR_AUTHORIZATION_REQUIRED');
  assert.equal(reanchorPreflight(reanchorFixture({off:false}).workbook,
    reanchorAuthorization({scheduledAt:'2026-10-06T09:18:11.000Z'}),{now}).reason,'AUTHORIZED_REANCHOR_TIME_NOT_FUTURE');
});

test('future re-anchor binds the exact predecessor, C21 identity, future time, and stable request key',()=>{
  const fixture=reanchorFixture({off:false});
  const authorization=reanchorAuthorization();
  const result=reanchorPreflight(fixture.workbook,authorization,{now:Date.parse('2026-10-07T08:00:00.000Z')});
  assert.equal(result.ok,true);assert.equal(result.replay,false);assert.equal(result.predecessor.id,'C01-EN-VERTICAL-TEAL-H2-r01');
  assert.equal(result.asset.id,authorization.assetId);assert.equal(result.slot.slot,'D21');assert.equal(result.scheduledAt,authorization.scheduledAt);
  assert.equal(result.requestKey,reanchorRequestKey(authorization));
  assert.equal(result.requestKey,reanchorRequestKey({...authorization}));
  assert.notEqual(result.requestKey,reanchorRequestKey({...authorization,scheduledAt:'2026-10-08T09:19:11.000Z'}));
  assert.equal(reanchorPreflight(fixture.workbook,{...authorization,sha256:'c'.repeat(64)},{now:Date.parse('2026-10-07T08:00:00.000Z')}).reason,
    'SUCCESSOR_EXACT_ASSET_OR_APPROVAL_CHANGED');
});

test('future re-anchor rejects quiet days and any attempted or duplicate successor delivery',()=>{
  const now=Date.parse('2026-10-07T08:00:00.000Z'),authorization=reanchorAuthorization();
  assert.equal(reanchorPreflight(reanchorFixture({off:false,scheduledQuiet:'HOLIDAY — no Status publication'}).workbook,authorization,{now}).reason,
    'AUTHORIZED_REANCHOR_CALENDAR_OR_QUIET_DAY_FAILED');
  const unknown=JSON.stringify({kind:'LIFE_SKILLS_STATUS_V1',state:'UNKNOWN',assetId:authorization.assetId,conceptId:21,
    language:'HE',surface:'VERTICAL',revision:'v04',driveFileId:authorization.driveFileId,sha256:authorization.sha256,
    providerReceiptId:'possible-receipt'});
  assert.equal(reanchorPreflight(reanchorFixture({off:false,successorDelivery:unknown}).workbook,authorization,{now}).reason,
    'UNRESOLVED_PROVIDER_DELIVERY_REQUIRES_RECONCILIATION');
});

test('authorized re-anchor uses the existing lock, writes one canonical schedule, reads it back, and replays idempotently',async()=>{
  const fixture=reanchorFixture({off:false}),authorization=reanchorAuthorization(),writes=[];
  const ranges=()=>[{values:fixture.raw.assetRows},{values:fixture.raw.calendarRows}];
  const apply=(item)=>{
    const match=item.range.match(/'(Asset Registry|30-Day Calendar)'!([A-Z]+)(\d+)/);assert.ok(match,item.range);
    const [,sheet,column,rowText]=match;const row=Number(rowText);const index=[...column].reduce((sum,ch)=>sum*26+ch.charCodeAt(0)-64,0)-1;
    const rows=sheet==='Asset Registry'?fixture.raw.assetRows:fixture.raw.calendarRows;
    const offset=sheet==='Asset Registry'?1:9;const rawIndex=row-offset;
    while(rows[rawIndex].length<=index) rows[rawIndex].push('');
    rows[rawIndex][index]=item.values[0][0];
  };
  const sheets={spreadsheets:{values:{batchGet:async()=>({data:{valueRanges:ranges()}}),batchUpdate:async({requestBody})=>{
    writes.push(requestBody.data);requestBody.data.forEach(apply);return {data:{}};}}}};
  const queries=[];const db={query:async(sql)=>{queries.push(sql);return /pg_try_advisory_lock/.test(sql)?{rows:[{acquired:true}]}:{rows:[]};},release:()=>{}};
  const pool={connect:async()=>db};
  const first=await authorizedReanchor({authorization,pool,clients:{sheets},clock:()=>Date.parse('2026-10-07T08:00:00.000Z')});
  assert.equal(first.state,'SCHEDULED');assert.equal(first.replay,false);assert.equal(first.schedulerReadback,true);assert.equal(writes.length,1);
  const parsed=parseWorkbook({data:{valueRanges:ranges()}});const predecessor=parsed.assets[0].delivery,scheduled=parsed.assets[1].delivery;
  assert.equal(predecessor.providerReceiptId,authorization.predecessorReceiptId);assert.equal(predecessor.confirmedAt,'2026-10-05T09:23:11.000Z');
  assert.equal(predecessor.nextTurnHold.state,'RESOLVED');assert.equal(predecessor.nextTurnHold.reanchorRequestKey,first.reanchorRequestKey);
  assert.equal(scheduled.state,'SCHEDULED');assert.equal(scheduled.predecessorReceiptId,authorization.predecessorReceiptId);
  assert.equal(scheduled.scheduledAt,authorization.scheduledAt);assert.equal(scheduled.reanchorRequestKey,first.reanchorRequestKey);
  assert.match(parsed.calendar[0].scheduler,/^SCHEDULED — .*12:18 Asia\/Jerusalem via rolling Status publisher$/);
  const second=await authorizedReanchor({authorization,pool,clients:{sheets},clock:()=>Date.parse('2026-10-08T09:19:00.000Z')});
  assert.equal(second.state,'SCHEDULED');assert.equal(second.replay,true);assert.equal(second.reanchorRequestKey,first.reanchorRequestKey);
  assert.equal(writes.length,1);assert.equal(queries.filter(sql=>/pg_try_advisory_lock/.test(sql)).length,2);
  assert.equal(queries.filter(sql=>/pg_advisory_unlock/.test(sql)).length,2);
});

test('authorized re-anchor makes no canonical write when the existing publisher lock is unavailable',async()=>{
  let connected=false,writes=0;
  const db={query:async(sql)=>/pg_try_advisory_lock/.test(sql)?{rows:[{acquired:false}]}:{rows:[]},release:()=>{connected=false;}};
  const pool={connect:async()=>{connected=true;return db;}};
  const sheets={spreadsheets:{values:{batchGet:async()=>{throw new Error('must not read without lock');},
    batchUpdate:async()=>{writes++;}}}};
  const result=await authorizedReanchor({authorization:reanchorAuthorization(),pool,clients:{sheets},clock:()=>Date.parse('2026-10-07T08:00:00.000Z')});
  assert.equal(result.state,'HELD');assert.match(result.reason,/holds the production lock/);assert.equal(writes,0);assert.equal(connected,false);
});

test('re-anchor replay blocks new active, unknown, duplicate-predecessor, and Calendar hold state',()=>{
  const fixture=reanchorFixture({off:false}),authorization=reanchorAuthorization(),requestKey=reanchorRequestKey(authorization);
  const predecessor=fixture.workbook.assets[0],asset=fixture.workbook.assets[1],slot=fixture.workbook.calendar[0];
  predecessor.delivery={...predecessor.delivery,nextTurnHold:{...predecessor.delivery.nextTurnHold,state:'RESOLVED',
    scheduledAssetId:asset.id,scheduledAt:authorization.scheduledAt,reanchorRequestKey:requestKey}};
  asset.delivery={kind:'LIFE_SKILLS_STATUS_V1',state:'SCHEDULED',assetId:asset.id,conceptId:asset.concept,
    language:asset.language,surface:asset.surface,revision:asset.revision,driveFileId:authorization.driveFileId,sha256:authorization.sha256,
    queuedAt:'2026-10-07T08:00:00.000Z',scheduledAt:authorization.scheduledAt,anchorSlot:slot.slot,
    predecessorReceiptId:authorization.predecessorReceiptId,reanchorRequestKey:requestKey};
  slot.scheduler=scheduledSuccessorCalendarUpdates(slot,authorization.scheduledAt).at(-1).values[0][0];
  const now=Date.parse('2026-10-07T08:00:00.000Z');
  assert.equal(reanchorPreflight(fixture.workbook,authorization,{now}).replay,true);
  const parallel={...asset,id:'C99-EN',delivery:{state:'RESERVED'}};
  assert.equal(reanchorPreflight({...fixture.workbook,assets:[...fixture.workbook.assets,parallel]},authorization,{now}).reason,
    'ANOTHER_STATUS_SEND_OR_SCHEDULE_EXISTS');
  const unknown={...asset,id:'C98-EN',delivery:{state:'UNKNOWN'}};
  assert.equal(reanchorPreflight({...fixture.workbook,assets:[...fixture.workbook.assets,unknown]},authorization,{now}).state,'UNKNOWN');
  const duplicatePredecessor={...predecessor,id:'C01-EN-duplicate'};
  assert.equal(reanchorPreflight({...fixture.workbook,assets:[...fixture.workbook.assets,duplicatePredecessor]},authorization,{now}).ok,false);
  slot.scheduler='OFF — publishing owner hold restored';
  assert.equal(reanchorPreflight(fixture.workbook,authorization,{now}).reason,'HEBREW_CALENDAR_OFF');
});

test('authorized re-anchor rechecks the clock immediately before write and never creates a past-due schedule',async()=>{
  const fixture=reanchorFixture({off:false}),authorization=reanchorAuthorization({scheduledAt:'2026-10-08T09:18:11.000Z'}),writes=[];
  const ranges=()=>[{values:fixture.raw.assetRows},{values:fixture.raw.calendarRows}];
  const sheets={spreadsheets:{values:{batchGet:async()=>({data:{valueRanges:ranges()}}),batchUpdate:async()=>{writes.push(true);}}}};
  const db={query:async(sql)=>/pg_try_advisory_lock/.test(sql)?{rows:[{acquired:true}]}:{rows:[]},release:()=>{}};
  const times=[Date.parse('2026-10-08T09:18:00.000Z'),Date.parse('2026-10-08T09:18:05.000Z'),Date.parse('2026-10-08T09:18:12.000Z')];
  const result=await authorizedReanchor({authorization,pool:{connect:async()=>db},clients:{sheets},clock:()=>times.shift()});
  assert.equal(result.state,'HELD');assert.equal(result.reason,'AUTHORIZED_REANCHOR_TIME_PASSED_BEFORE_WRITE');assert.equal(writes.length,0);
});

test('provider result reread resolves shifted rows and preserves post-send Calendar interventions',()=>{
  const sent=statusRow('C20-HE','HE');
  const calendar=Array(15).fill('');
  Object.assign(calendar,{0:'D20',1:'2026-10-04',4:calendarConceptId(20),9:url,10:`v04 FROZEN / ${digest}`,11:'Approved',12:'No recorded holiday conflict',7:'MEDIA ASSOCIATED — no send queued'});
  const parse=(assets,calRows)=>parseWorkbook({data:{valueRanges:[{values:[[],...assets]},{values:calRows}]}});
  const original=parse([sent],[['Slot'],calendar]);
  const baselineAsset=original.assets[0], baselineSlot=original.calendar[0];
  const sending={kind:'LIFE_SKILLS_STATUS_V1',state:'SENDING',assetId:baselineAsset.id,conceptId:baselineAsset.concept,
    language:baselineAsset.language,surface:baselineAsset.surface,revision:baselineAsset.revision,driveFileId:'abc12345',sha256:digest,
    queuedAt:'2026-10-04T09:00:00.000Z',scheduledAt:'2026-10-04T09:00:00.000Z',anchorSlot:'D20',reservedAt:'2026-10-04T09:00:01.000Z',submittedAt:'2026-10-04T09:00:02.000Z'};
  const prepared=[...sent];prepared[21]=JSON.stringify(sending);
  const marked=[...calendar];marked[7]='SENDING — C20-HE';marked[13]='SENDING — rolling Status publisher';
  const prior1=[...calendar],prior2=[...calendar];prior1[0]='D18';prior2[0]='D19';
  const shifted=parse([statusRow('C18-HE','HE'),statusRow('C19-HE','HE'),prepared],[['Slot'],prior1,prior2,marked]);
  const resolved=publicationResultPreflight(original,shifted,{assetId:sent[0],baselineAsset,baselineSlot,expectedDelivery:sending});
  assert.equal(resolved.ok,true);assert.equal(resolved.asset.rowNumber,4);assert.equal(resolved.slot.rowNumber,12);
  assert.equal(resolved.canWriteCalendarReceipt,true);assert.equal(resolved.canUpdateCalendarState,true);

  const beforeNewest=[...calendar];beforeNewest[0]='D17';
  const newest=parse([statusRow('C17-HE','HE'),statusRow('C18-HE','HE'),statusRow('C19-HE','HE'),prepared],
    [['Slot'],beforeNewest,prior1,prior2,marked]);
  const newestResolved=publicationResultPreflight(shifted,newest,
    {assetId:sent[0],baselineAsset,baselineSlot,expectedDelivery:sending});
  assert.equal(newestResolved.ok,true);
  assert.equal(newestResolved.asset.rowNumber,5);
  assert.equal(newestResolved.slot.rowNumber,13);
  assert.equal(newestResolved.canWriteCalendarReceipt,true);
  assert.equal(newestResolved.canUpdateCalendarState,true);

  const held=[...marked];held[7]='OFF — operator hold';held[13]='OFF — preserve operator decision';
  const heldResult=publicationResultPreflight(original,parse([prepared],[['Slot'],held]),
    {assetId:sent[0],baselineAsset,baselineSlot,expectedDelivery:sending});
  assert.equal(heldResult.ok,true);assert.equal(heldResult.canWriteCalendarReceipt,true);assert.equal(heldResult.canUpdateCalendarState,false);

  const changed=[...prepared];changed[10]='https://drive.google.com/file/d/replacement/view';changed[12]='b'.repeat(64);
  const changedResult=publicationResultPreflight(original,parse([changed],[['Slot'],marked]),
    {assetId:sent[0],baselineAsset,baselineSlot,expectedDelivery:sending});
  assert.equal(changedResult.ok,true);assert.equal(changedResult.assetBindingChanged,true);

  const replacedCalendar=[...marked];replacedCalendar[9]='https://drive.google.com/file/d/replacement/view';
  const calendarChanged=publicationResultPreflight(original,parse([prepared],[['Slot'],replacedCalendar]),
    {assetId:sent[0],baselineAsset,baselineSlot,expectedDelivery:sending});
  assert.equal(calendarChanged.ok,true);assert.equal(calendarChanged.canWriteCalendarReceipt,false);assert.equal(calendarChanged.canUpdateCalendarState,false);
  const changedCalendarAssetId=[...marked];changedCalendarAssetId[4]=calendarConceptId(19);
  const calendarAssetChanged=publicationResultPreflight(original,parse([prepared],[['Slot'],changedCalendarAssetId]),
    {assetId:sent[0],baselineAsset,baselineSlot,expectedDelivery:sending});
  assert.equal(calendarAssetChanged.ok,true);assert.equal(calendarAssetChanged.canWriteCalendarReceipt,false);

  const alteredDelivery=[...prepared];alteredDelivery[21]=JSON.stringify({...sending,state:'UNKNOWN',error:'operator reconciliation'});
  assert.equal(publicationResultPreflight(original,parse([alteredDelivery],[['Slot'],marked]),
    {assetId:sent[0],baselineAsset,baselineSlot,expectedDelivery:sending}).ok,false);
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
  const calendar=Array.from({length:30},(_,index)=>({slot:`D${index+1}`,date:new Date(Date.UTC(2026,9,5+index)).toISOString().slice(0,10),quiet:'No recorded holiday conflict'}));
  assert.equal(nextAllowedIso('2026-10-04T09:27:08.000Z', calendar), '2026-10-05T09:22:08.000Z');
  assert.equal(nextAllowedIso('2026-10-08T09:27:08.000Z', calendar), '2026-10-11T09:22:08.000Z');
  assert.equal(nextAllowedIso('2026-10-04T09:27:08.000Z', []), null);
});

test('successor time uses the refreshed Calendar quiet-day markers',()=>{
  const refreshed=[{slot:'D21',date:'2026-10-05',quiet:'HOLIDAY — no Status publication'},
    {slot:'D22',date:'2026-10-06',quiet:'No recorded holiday conflict'}];
  assert.equal(successorScheduleIso('2026-10-04T09:27:08.000Z',refreshed,{slot:'D21',date:'2026-10-05'}),'2026-10-06T09:22:08.000Z');
});

test('rolling time scans long quiet stretches and holds when none remain inside Calendar horizon',()=>{
  const quietStretch=Array.from({length:11},(_,index)=>({slot:`D${index+21}`,date:new Date(Date.UTC(2026,9,5+index)).toISOString().slice(0,10),
    quiet:index<10?'HOLIDAY — no Status publication':'No recorded holiday conflict'}));
  assert.equal(nextAllowedIso('2026-10-04T09:27:08.000Z',quietStretch),'2026-10-15T09:22:08.000Z');
  assert.equal(nextAllowedIso('2026-10-04T09:27:08.000Z',quietStretch.slice(0,10)),null);
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
