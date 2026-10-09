// Explicit native gate: node --test tests/life-skills-app-inbound.native.cjs.
// No skip, mock database, production URL or history data is permitted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test,before,after,beforeEach} = require('node:test');
const {Pool} = require('pg');
const {APP_INBOUND_URL,OUTBOX_SQL,forwardConfig,inquiriesFromEnvelope,receiptDigest,LifeSkillsAppInboundOutbox} = require('../src/lib/bna/life-skills-app-inbound');
const crm = require('../src/lib/bna/life-skills-sheet-crm');
const {RECONCILIATION_SQL,lockInboundReconciliation,registerInboundReconciliation,confirmPrivateReceipt,markPrivateReceiptBlocked,markSheetMaterialized,readInboundReconciliation} = require('../src/lib/bna/life-skills-inbound-reconciliation');
const url = new URL(process.env.TEST_DATABASE_URL || 'invalid:');
assert.equal(url.protocol,'postgresql:'); assert.equal(url.hostname,'127.0.0.1'); assert.equal(url.username,'synthetic');
assert.match(url.pathname,/^\/ls_calendar_test_voice_[a-f0-9]{8}_test$/);
assert.equal(process.env.LS_CALENDAR_TEST_ALLOW,'true');
const pool = new Pool({connectionString:url.href,ssl:false,max:5});
const serverSource=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
const sheetSqlMatch=serverSource.match(/const createLifeSkillsSheetCrmSyncSQL = `([\s\S]*?)`;/);
assert.ok(sheetSqlMatch,'actual Sheet receipt migration must remain extractable');
const SHEET_SYNC_SQL=sheetSqlMatch[1];
const syncStart=serverSource.indexOf('async function syncLifeSkillsInboundToSheet');
const syncEnd=serverSource.indexOf('async function recoverLifeSkillsSheetCrm',syncStart);
assert.ok(syncStart>0&&syncEnd>syncStart);
const syncSource=serverSource.slice(syncStart,syncEnd);
const config = forwardConfig({LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:'true',LIFE_SKILLS_SHEET_CRM_ENABLED:'true',
  LIFE_SKILLS_SHEET_CRM_CONFIRM:'APPROVE_LIFE_SKILLS_SHEET_CRM_INBOUND_UPSERT',LIFE_SKILLS_APP_BRIDGE_SECRET:'synthetic-not-real-credential-0123456789',
  WHAPI_CHANNEL_ID:'synthetic-channel',LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS:'972534932631'});
const reconciliation={register:registerInboundReconciliation,confirm:confirmPrivateReceipt,block:markPrivateReceiptBlocked};
function inquiry(id='synthetic-message-1',text='DEMO synthetic inquiry') {
  return inquiriesFromEnvelope({channel_id:'synthetic-channel',event:{type:'messages',event:'post'},messages:[{
    id,from_me:false,type:'text',chat_id:'972525550101@s.whatsapp.net',timestamp:1790500000,from:'972525550101',from_name:'DEMO',text:{body:text}}]}, {},config)[0];
}
function receipt(replayed=false,dto=inquiry()) { return Response.json({ok:true,data:{replayed,storedAt:'2026-09-28T03:00:00.000Z',ackDigest:receiptDigest(dto,config.secret)},requestId:'synthetic-request'}, {status:replayed?200:201}); }
function sheetNormalized(dto){return {messageId:dto.providerMessageId,fromNumber:dto.fromNumber,chatId:dto.fromNumber,toNumber:dto.businessNumber,
  pushName:dto.pushName||'',hasMedia:Boolean(dto.media?.length),messageType:dto.messageType||'',messageText:dto.messageText||'',occurredAt:dto.occurredAt};}
function nativeSheetSync(upsert,writer={mode:'sheet',epoch:null,ready:true,blockers:[]}){
  const sheetConfig={enabled:true,approved:true,spreadsheetId:'synthetic',sheetName:'Leads',responseOwner:'Synthetic',requiredBusinessDigits:'972534932631',requiredChannelId:'synthetic-channel',defaultCountry:'972',timeZone:'Asia/Jerusalem'};
  return new Function('pool','process','lifeSkillsSheetCrmConfig','isLifeSkillsInboundInquiry','lifeSkillsCrmWriterState','lifeSkillsSheetCrmClient','messageAttribution','detectedLanguage','upsertLifeSkillsSheetLead','lockLifeSkillsInboundReconciliation','markLifeSkillsSheetMaterialized','lifeSkillsSheetCrmSafeError',
    `${syncSource}; return syncLifeSkillsInboundToSheet;`)(pool,{env:{}},()=>sheetConfig,crm.isLifeSkillsInboundInquiry,()=>writer,
    ()=>({readiness:{ready:true,blockers:[]},sheets:{}}),crm.messageAttribution,crm.detectedLanguage,upsert,lockInboundReconciliation,markSheetMaterialized,error=>String(error?.message||'sheet failure'));
}
async function bounded(promise,ms=4000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('native concurrency timeout')),ms);})]);}finally{clearTimeout(timer);}}
const count=async()=>Number((await pool.query('SELECT count(*) AS n FROM bna_life_skills_app_inbound_outbox')).rows[0].n);
before(async()=>{
  await pool.query(SHEET_SYNC_SQL);
  await pool.query(OUTBOX_SQL); await pool.query(OUTBOX_SQL);
  await pool.query(RECONCILIATION_SQL); await pool.query(RECONCILIATION_SQL);
});
beforeEach(async()=>{ await pool.query('TRUNCATE bna_life_skills_app_inbound_reconciliation,bna_life_skills_app_inbound_outbox,bna_life_skills_sheet_crm_sync RESTART IDENTITY'); });
after(async()=>{ await pool.end(); });

test('native schema is idempotent, owner-only and rejects malformed identifiers/ciphertext',async()=>{
  const permissions=(await pool.query(`SELECT count(*)::int AS n FROM pg_class c CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a WHERE c.oid='bna_life_skills_app_inbound_outbox'::regclass AND a.grantee<>c.relowner`)).rows[0].n;
  assert.equal(permissions,0);
  await assert.rejects(()=>pool.query(`INSERT INTO bna_life_skills_app_inbound_outbox(binding_sha256,event_key,message_key,capture_epoch,key_sha256,payload_digest,payload_ciphertext)
    VALUES('bad','bad','bad','bad epoch','bad','bad',decode('00','hex'))`),{code:'23514'});
  await assert.rejects(()=>lockInboundReconciliation(pool,{bindingSha256:'a'.repeat(64),eventKey:'b'.repeat(64)}),/INBOUND_RECONCILIATION_PINNED_CONNECTION_REQUIRED/);
  assert.equal(await count(),0);
  await pool.query('CREATE ROLE ls_inbound_denied NOSUPERUSER');
  const deniedPool={connect:async()=>{
    const db=await pool.connect(); await db.query('SET ROLE ls_inbound_denied');
    return {query:db.query.bind(db),release:()=>db.release(true)};
  }};
  let sent=0; const denied=new LifeSkillsAppInboundOutbox(deniedPool,config,async()=>{sent++;return receipt();});
  await assert.rejects(()=>denied.capture(inquiry()),{code:'42501'});
  assert.equal(await count(),0); assert.equal(sent,0);
  await pool.query('DROP ROLE ls_inbound_denied');
});
test('native concurrent capture/replay gives one committed encrypted receipt; changed notes cannot overwrite it',async()=>{
  let sent=0; const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>{sent++;return receipt();});
  const dto=inquiry(), results=await Promise.all(Array.from({length:5},()=>outbox.capture(dto)));
  assert.equal(results.filter(r=>!r.replayed).length,1); assert.equal(await count(),1); assert.equal(sent,0);
  const row=(await pool.query('SELECT * FROM bna_life_skills_app_inbound_outbox')).rows[0];
  assert.equal(row.status,'pending'); assert.equal(row.payload_ciphertext.includes(Buffer.from(dto.messageText)),false);
  assert.equal(row.payload_ciphertext.includes(Buffer.from(dto.fromNumber)),false);
  assert.deepEqual(outbox.unseal(row),dto);
  await assert.rejects(()=>outbox.capture({...dto,messageText:'changed note'}),/INQUIRY_REPLAY_CONFLICT/);
  assert.deepEqual(outbox.unseal((await pool.query('SELECT * FROM bna_life_skills_app_inbound_outbox')).rows[0]),dto);
  await outbox.capture(inquiry('synthetic-message-2','second inquiry')); assert.equal(await count(),2);
});
test('durable queue survives transport failure and uncertain ACK; replay delivery is exact and no double confirmation',async()=>{
  const dto=inquiry(), captured=[]; let fail=true;
  const sender=async(url,opts)=>{
    assert.equal(url,APP_INBOUND_URL); assert.equal(opts.redirect,'error'); assert.equal(opts.method,'POST');
    assert.equal(opts.headers['X-Life-Skills-Bridge-Secret'],config.secret); assert.deepEqual(JSON.parse(opts.body),dto);
    captured.push(opts.body); if(fail) throw Error('synthetic transport failure'); return receipt(true);
  };
  const first=new LifeSkillsAppInboundOutbox(pool,config,sender), {eventKey}=await first.capture(dto);
  assert.equal((await first.deliver(eventKey)).status,'pending'); assert.equal(await count(),1);
  fail=false; await pool.query(`UPDATE bna_life_skills_app_inbound_outbox SET next_attempt_at=clock_timestamp()`);
  const restarted=new LifeSkillsAppInboundOutbox(pool,config,sender);
  assert.equal((await restarted.deliver(eventKey)).status,'delivered'); assert.equal((await restarted.deliver(eventKey)).status,'delivered');
  assert.equal(captured.length,2); assert.equal(captured[0],captured[1]);
  const row=(await pool.query('SELECT status,attempts,delivered_at,last_code,private_ack_digest,private_acknowledged_at FROM bna_life_skills_app_inbound_outbox')).rows[0];
  assert.equal(row.attempts,2); assert.ok(row.delivered_at instanceof Date); assert.equal(row.last_code,'COMMITTED_PRIVATE_RECEIPT');
  assert.equal(row.private_ack_digest,receiptDigest(dto,config.secret));assert.ok(row.private_acknowledged_at instanceof Date);
});
test('native CTWA replay preserves exact encrypted attribution and requires a matching full acknowledgement',async()=>{
  const dto={...inquiry(),ctwaAttribution:{clickId:'synthetic-click',adId:'synthetic-ad',attributed:true,sourceType:'ad'}};
  let acknowledge=false,transmissions=0;
  const outbox=new LifeSkillsAppInboundOutbox(pool,config,async(_url,opts)=>{
    transmissions++;assert.deepEqual(JSON.parse(opts.body),dto);
    return receipt(false,acknowledge?dto:inquiry()); // Omitting attribution does not acknowledge this event.
  });
  const first=await outbox.capture(dto),second=await outbox.capture(dto);assert.equal(second.replayed,true);assert.equal(first.eventKey,second.eventKey);assert.equal(await count(),1);
  const stored=(await pool.query('SELECT * FROM bna_life_skills_app_inbound_outbox')).rows[0];
  assert.deepEqual(outbox.unseal(stored),dto);assert.equal(stored.payload_ciphertext.includes(Buffer.from('synthetic-click')),false);
  await assert.rejects(()=>outbox.capture({...dto,ctwaAttribution:{...dto.ctwaAttribution,adId:'changed-ad'}}),/INQUIRY_REPLAY_CONFLICT/);
  assert.equal((await outbox.deliver(first.eventKey)).status,'pending');
  assert.equal((await pool.query('SELECT delivered_at FROM bna_life_skills_app_inbound_outbox')).rows[0].delivered_at,null);
  await pool.query('UPDATE bna_life_skills_app_inbound_outbox SET next_attempt_at=clock_timestamp()');acknowledge=true;
  assert.equal((await outbox.deliver(first.eventKey)).status,'delivered');assert.equal(transmissions,2);assert.equal(await count(),1);
  assert.deepEqual(outbox.unseal((await pool.query('SELECT * FROM bna_life_skills_app_inbound_outbox')).rows[0]),dto);
});
test('altered replay cannot poison later valid batch messages; original is retained and conflict persists',async()=>{
  const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt()),original=inquiry();
  await outbox.capture(original);
  const batch=[{...original,messageText:'altered replay'},inquiry('synthetic-message-2','new valid message')];
  const firstBatch=await outbox.captureBatch(batch);assert.equal(firstBatch.captured,1);assert.equal(firstBatch.conflicts,1);assert.equal(firstBatch.receipts.length,1);assert.equal(firstBatch.receipts[0].providerEventId,'synthetic-message-2'); assert.equal(await count(),2);
  const secondBatch=await outbox.captureBatch(batch);assert.equal(secondBatch.captured,1);assert.equal(secondBatch.conflicts,1);assert.equal(secondBatch.receipts[0].replayed,true); assert.equal(await count(),2);
  const rows=(await pool.query('SELECT * FROM bna_life_skills_app_inbound_outbox')).rows;
  const prior=rows.find(row=>row.event_key===outbox.eventKey(original));
  assert.equal(prior.conflict_detected,true); assert.deepEqual(outbox.unseal(prior),original);
  assert.equal(rows.find(row=>row.event_key!==prior.event_key).conflict_detected,false);
});
test('forged 200, redirect/auth/binding failure and corrupt ciphertext never count as successful private capture',async()=>{
  for (const [response,expected] of [[Response.json({ok:true}),'pending'],[Response.json({ok:true,data:{replayed:false,storedAt:'not-a-time'}}),'pending'],[receipt(false,inquiry('different-event')),'pending'],[new Response('x'.repeat(4097)),'pending'],
    [new Response('redirect',{status:302}),'pending'],[new Response('denied',{status:401}),'blocked'],[new Response('wrong binding',{status:403}),'blocked']]) {
    await pool.query('TRUNCATE bna_life_skills_app_inbound_outbox');
    const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>response), {eventKey}=await outbox.capture(inquiry());
    assert.equal((await outbox.deliver(eventKey)).status,expected);
    assert.equal((await pool.query('SELECT delivered_at FROM bna_life_skills_app_inbound_outbox')).rows[0].delivered_at,null);
  }
  await pool.query('TRUNCATE bna_life_skills_app_inbound_outbox'); let sent=0;
  const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>{sent++;return receipt();}), {eventKey}=await outbox.capture(inquiry());
  await pool.query(`UPDATE bna_life_skills_app_inbound_outbox SET payload_ciphertext=decode(repeat('00',50),'hex')`);
  assert.equal((await outbox.deliver(eventKey)).status,'blocked'); assert.equal(sent,0);
});
test('concurrent delivery locks one row and bounded retry reads only newly captured pending rows',async()=>{
  let sent=0; const outbox=new LifeSkillsAppInboundOutbox(pool,config,async(_url,opts)=>{sent++;return receipt(false,JSON.parse(opts.body));}), {eventKey}=await outbox.capture(inquiry());
  await Promise.all(Array.from({length:4},()=>outbox.deliver(eventKey))); assert.equal(sent,1);
  const a=await outbox.capture(inquiry('synthetic-message-2')), b=await outbox.capture(inquiry('synthetic-message-3'));
  await pool.query(`UPDATE bna_life_skills_app_inbound_outbox SET next_attempt_at=clock_timestamp()+interval '1 hour' WHERE event_key=$1`,[b.eventKey]);
  assert.deepEqual(await outbox.drain(1),{attempted:1,delivered:1,pending:0,blocked:0}); assert.equal(sent,2);
  assert.equal((await pool.query('SELECT status FROM bna_life_skills_app_inbound_outbox WHERE event_key=$1',[a.eventKey])).rows[0].status,'delivered');
  assert.equal((await pool.query('SELECT status FROM bna_life_skills_app_inbound_outbox WHERE event_key=$1',[b.eventKey])).rows[0].status,'pending');
  await assert.rejects(()=>outbox.drain(26),/INVALID_LIMIT/);
});

test('dual-receipt readback never equates a private ACK with native CRM projection and preserves rollback replay',async()=>{
  const dto=inquiry(),outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt(false,dto),reconciliation);
  const captured=await outbox.capture(dto,'LS-CUTOVER-SYNTHETIC');
  let state=await readInboundReconciliation(pool,'LS-CUTOVER-SYNTHETIC');
  assert.equal(state.privateReceiptPending,1);assert.equal(state.privateReceiptOnly,0);assert.equal(state.sheetReplayRequiredIfRollback,1);
  assert.equal(state.missingSheetReceipts,0);
  assert.equal(state.nativeProjectionProofAvailable,false);assert.equal(state.nativeProjected,null);
  assert.equal((await outbox.deliver(captured.eventKey)).status,'delivered');
  state=await readInboundReconciliation(pool,'LS-CUTOVER-SYNTHETIC');
  assert.equal(state.privateReceiptOnly,1);assert.equal(state.sheetReplayRequiredIfRollback,1);
  assert.equal(state.nativeProjectionProofAvailable,false);assert.equal(state.nativeProjected,null);
  assert.equal((await outbox.deliver(captured.eventKey)).status,'delivered','replay is stable and does not become projection proof');
  await pool.query(`UPDATE bna_life_skills_sheet_crm_sync SET status='synced' WHERE provider_message_id=$1`,[dto.providerMessageId]);
  const materializeClient=await pool.connect();
  try{await materializeClient.query('BEGIN');await markSheetMaterialized(materializeClient,{bindingSha256:config.bindingSha256,eventKey:captured.eventKey});await materializeClient.query('COMMIT');}
  finally{materializeClient.release();}
  state=await readInboundReconciliation(pool,'LS-CUTOVER-SYNTHETIC');
  assert.equal(state.sheetApplied,1);assert.equal(state.sheetReplayRequiredIfRollback,0);assert.equal(state.privateReceiptOnly,0);
  assert.equal(state.nativeProjected,null);
  await assert.rejects(()=>pool.query(`UPDATE bna_life_skills_app_inbound_outbox SET private_ack_digest=$1,private_acknowledged_at=NULL`,['a'.repeat(64)]),{code:'23514'});
});

test('delivery repairs a missing late registration before the private request',async()=>{
  const dto=inquiry(),captureOnly=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt(false,dto));
  const captured=await captureOnly.capture(dto,'LS-LATE-REGISTRATION');
  assert.equal((await readInboundReconciliation(pool,'LS-LATE-REGISTRATION')).total,0);
  let sent=0;
  const delivery=new LifeSkillsAppInboundOutbox(pool,config,async()=>{sent++;return receipt(false,dto);},reconciliation);
  assert.equal((await delivery.deliver(captured.eventKey)).status,'delivered');assert.equal(sent,1);
  const state=await readInboundReconciliation(pool,'LS-LATE-REGISTRATION');
  assert.equal(state.total,1);assert.equal(state.privateReceiptOnly,1);assert.equal(state.missingSheetReceipts,0);
});

test('legacy schema backfill is upgraded without turning an exact replay into a conflict',async()=>{
  const dto=inquiry(),captureOnly=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt(false,dto));
  const captured=await captureOnly.capture(dto);
  await pool.query(`UPDATE bna_life_skills_app_inbound_outbox SET message_key=event_key,capture_epoch='legacy_unbound' WHERE event_key=$1`,[captured.eventKey]);
  const upgraded=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt(false,dto),reconciliation);
  const replay=await upgraded.capture(dto,'LS-NEW-EPOCH');
  assert.equal(replay.replayed,true);assert.equal(replay.captureEpoch,'legacy_unbound');
  const row=(await pool.query('SELECT message_key,capture_epoch FROM bna_life_skills_app_inbound_outbox')).rows[0];
  assert.equal(row.message_key,upgraded.messageKey(dto));assert.equal(row.capture_epoch,'legacy_unbound');
  assert.equal((await readInboundReconciliation(pool,'legacy_unbound')).total,1);
  assert.equal((await readInboundReconciliation(pool,'LS-NEW-EPOCH')).total,0);
});

test('a failed local commit after private ACK stays pending and replay completes both public receipts',async()=>{
  const dto=inquiry();let sends=0,failCommit=true;
  const unstable={register:registerInboundReconciliation,confirm:async(db,input)=>{
    await confirmPrivateReceipt(db,input);if(failCommit)throw Error('synthetic local commit failure');
  }};
  const sender=async()=>{sends++;return receipt(sends>1,dto);};
  const outbox=new LifeSkillsAppInboundOutbox(pool,config,sender,unstable);
  const captured=await outbox.capture(dto,'LS-ACK-ROLLBACK');
  await assert.rejects(()=>outbox.deliver(captured.eventKey),/synthetic local commit failure/);
  let row=(await pool.query('SELECT status,attempts,private_ack_digest FROM bna_life_skills_app_inbound_outbox')).rows[0];
  assert.deepEqual(row,{status:'pending',attempts:0,private_ack_digest:null});
  let state=await readInboundReconciliation(pool,'LS-ACK-ROLLBACK');
  assert.equal(state.privateReceiptPending,1);assert.equal(state.privateReceiptOnly,0);
  failCommit=false;
  const retry=new LifeSkillsAppInboundOutbox(pool,config,sender,reconciliation);
  assert.equal((await retry.deliver(captured.eventKey)).status,'delivered');assert.equal(sends,2);
  row=(await pool.query('SELECT status,attempts,private_ack_digest FROM bna_life_skills_app_inbound_outbox')).rows[0];
  assert.equal(row.status,'delivered');assert.equal(row.attempts,1);assert.match(row.private_ack_digest,/^[a-f0-9]{64}$/);
  state=await readInboundReconciliation(pool,'LS-ACK-ROLLBACK');assert.equal(state.privateReceiptOnly,1);
});

test('a non-retryable private denial is visible as blocked while Sheet rollback remains required',async()=>{
  const dto=inquiry(),outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>new Response('denied',{status:403}),reconciliation);
  const captured=await outbox.capture(dto,'LS-PRIVATE-BLOCKED');
  assert.equal((await outbox.deliver(captured.eventKey)).status,'blocked');
  const state=await readInboundReconciliation(pool,'LS-PRIVATE-BLOCKED');
  assert.equal(state.privateReceiptBlocked,1);assert.equal(state.privateReceiptPending,0);
  assert.equal(state.sheetReplayRequiredIfRollback,1);assert.equal(state.nativeProjected,null);
});

test('every batch event receives a Sheet-side registration and replay keeps the original capture epoch',async()=>{
  const first=inquiry(),second=inquiry('synthetic-message-2','second synthetic inquiry');
  const outbox=new LifeSkillsAppInboundOutbox(pool,config,async(_url,opts)=>receipt(false,JSON.parse(opts.body)),reconciliation);
  const captured=await outbox.captureBatch([first,second],'LS-BATCH-EPOCH-A');
  assert.equal(captured.captured,2);assert.equal(captured.receipts.length,2);
  assert.equal(Number((await pool.query('SELECT count(*) AS n FROM bna_life_skills_sheet_crm_sync')).rows[0].n),2);
  assert.equal((await readInboundReconciliation(pool,'LS-BATCH-EPOCH-A')).total,2);
  const replay=await outbox.capture(first,'LS-BATCH-EPOCH-B');
  assert.equal(replay.replayed,true);assert.equal(replay.captureEpoch,'LS-BATCH-EPOCH-A');
  assert.equal((await readInboundReconciliation(pool,'LS-BATCH-EPOCH-A')).total,2);
  assert.equal((await readInboundReconciliation(pool,'LS-BATCH-EPOCH-B')).total,0);
});

test('same-ID batch orderings pass only the exact accepted payload to the actual Sheet boundary',async()=>{
  const seen=[];
  const sync=nativeSheetSync(async({normalized})=>{seen.push({...normalized});return {action:'updated_existing',row:2,providerMessageIds:normalized.messageId};});
  for(const [id,order] of [['altered-first','altered-first'],['exact-first','exact-first']]){
    const original={...inquiry(`same-id-${id}`,'original accepted body'),pushName:`ORIGINAL ${id}`,occurredAt:'2026-09-28T04:00:00.000Z'};
    const altered={...original,pushName:`ALTERED ${id}`,occurredAt:'2026-09-29T04:00:00.000Z',messageText:'rejected altered body'};
    const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt(false,original),reconciliation);
    await outbox.capture(original,'LS-ACCEPTED-PAYLOAD');
    const batch=order==='altered-first'?[altered,original]:[original,altered];
    const result=await outbox.captureBatch(batch,'LS-DIFFERENT-EPOCH');
    assert.equal(result.captured,1);assert.equal(result.conflicts,1);assert.equal(result.receipts.length,1);
    const accepted=result.receipts[0];assert.strictEqual(accepted.acceptedInquiry,original);
    await sync({normalized:sheetNormalized(accepted.acceptedInquiry),payload:{},privateReceipt:accepted,receiptPool:pool});
  }
  assert.deepEqual(seen.map(row=>({messageId:row.messageId,pushName:row.pushName,occurredAt:row.occurredAt})),[
    {messageId:'same-id-altered-first',pushName:'ORIGINAL altered-first',occurredAt:'2026-09-28T04:00:00.000Z'},
    {messageId:'same-id-exact-first',pushName:'ORIGINAL exact-first',occurredAt:'2026-09-28T04:00:00.000Z'},
  ]);
});

test('real Sheet sync and registration concurrency share event-before-row ordering, including synced replay',async()=>{
  const dto=inquiry('lock-order-event','lock order inquiry');
  const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt(false,dto),reconciliation);
  const privateReceipt={providerEventId:dto.providerEventId,bindingSha256:config.bindingSha256,eventKey:outbox.eventKey(dto)};
  let sheetCalls=0;
  const sync=nativeSheetSync(async({normalized})=>{sheetCalls++;await new Promise(resolve=>setTimeout(resolve,25));return {action:'created',row:2,providerMessageIds:normalized.messageId};});
  const [captured,synced]=await bounded(Promise.all([
    outbox.capture(dto,'LS-OUTBOX-E2'),
    sync({normalized:sheetNormalized(dto),payload:{},privateReceipt,receiptPool:pool}),
  ]));
  assert.equal(synced.status,'synced');assert.equal(sheetCalls,1);
  const rows=(await pool.query(`SELECT o.capture_epoch AS outbox_epoch,r.capture_epoch AS reconciliation_epoch,
    s.attribution->>'writer_epoch' AS sheet_epoch,s.status FROM bna_life_skills_app_inbound_outbox o
    JOIN bna_life_skills_app_inbound_reconciliation r USING(binding_sha256,event_key)
    JOIN bna_life_skills_sheet_crm_sync s ON s.id=r.sheet_sync_id WHERE o.event_key=$1`,[captured.eventKey])).rows;
  assert.equal(rows.length,1);assert.equal(rows[0].outbox_epoch,rows[0].reconciliation_epoch);assert.equal(rows[0].outbox_epoch,rows[0].sheet_epoch);assert.equal(rows[0].status,'synced');
  const [replay,replayedSync]=await bounded(Promise.all([
    outbox.capture(dto,'LS-IGNORED-LATER-EPOCH'),
    sync({normalized:sheetNormalized(dto),payload:{},privateReceipt,receiptPool:pool}),
  ]));
  assert.equal(replay.replayed,true);assert.equal(replay.captureEpoch,rows[0].outbox_epoch);
  assert.equal(replayedSync.replay_suppressed,true);assert.equal(sheetCalls,1,'synced replay cannot call the external Sheet boundary again');
});

test('Sheet-first origin is retained and missing legacy origin stays explicitly held',async()=>{
  const e1=inquiry('sheet-first-e1','sheet first epoch');
  await pool.query(`INSERT INTO bna_life_skills_sheet_crm_sync
    (provider_message_id,phone_e164,to_number,push_name,has_media,message_type,occurred_at,attribution,status)
    VALUES($1,$2,$3,$4,FALSE,$5,$6,$7::jsonb,'pending')`,[e1.providerMessageId,e1.fromNumber,e1.businessNumber,e1.pushName,e1.messageType,e1.occurredAt,JSON.stringify({writer_epoch:'LS-SHEET-E1',source:'preserved'})]);
  const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>receipt(false,e1),reconciliation);
  const accepted=await outbox.capture(e1,'LS-OUTBOX-E2');
  assert.equal(accepted.captureEpoch,'LS-SHEET-E1');
  const retained=(await pool.query(`SELECT o.capture_epoch AS outbox_epoch,r.capture_epoch AS reconciliation_epoch,
    s.attribution,s.native_event_key FROM bna_life_skills_app_inbound_outbox o
    JOIN bna_life_skills_app_inbound_reconciliation r USING(binding_sha256,event_key)
    JOIN bna_life_skills_sheet_crm_sync s ON s.id=r.sheet_sync_id WHERE o.event_key=$1`,[accepted.eventKey])).rows[0];
  assert.equal(retained.outbox_epoch,'LS-SHEET-E1');assert.equal(retained.reconciliation_epoch,'LS-SHEET-E1');
  assert.deepEqual(retained.attribution,{source:'preserved',writer_epoch:'LS-SHEET-E1'});assert.equal(retained.native_event_key,accepted.eventKey);

  const unknown=inquiry('sheet-first-unknown','missing epoch');
  await pool.query(`INSERT INTO bna_life_skills_sheet_crm_sync
    (provider_message_id,phone_e164,to_number,push_name,has_media,message_type,occurred_at,attribution,status)
    VALUES($1,$2,$3,$4,FALSE,$5,$6,'{}'::jsonb,'synced')`,[unknown.providerMessageId,unknown.fromNumber,unknown.businessNumber,unknown.pushName,unknown.messageType,unknown.occurredAt]);
  const held=await outbox.capture(unknown,'LS-OUTBOX-E2');
  assert.equal(held.captureEpoch,'legacy_unbound');
  const heldClient=await pool.connect();
  try{await heldClient.query('BEGIN');await assert.rejects(()=>markSheetMaterialized(heldClient,{bindingSha256:config.bindingSha256,eventKey:held.eventKey}),/INBOUND_RECONCILIATION_CONFLICT/);await heldClient.query('ROLLBACK');}
  finally{heldClient.release();}
  const state=await readInboundReconciliation(pool,'legacy_unbound');
  assert.equal(state.total,1);assert.equal(state.sheetApplied,0);assert.equal(state.sheetReplayRequiredIfRollback,1);
});

test('actual populated baseline Sheet schema upgrades exactly once and repeats without data loss',async()=>{
  await pool.query('DROP TABLE bna_life_skills_app_inbound_reconciliation');
  await pool.query('DROP TABLE bna_life_skills_sheet_crm_sync');
  await pool.query(`CREATE TABLE bna_life_skills_sheet_crm_sync (
    id SERIAL PRIMARY KEY,provider_message_id TEXT NOT NULL UNIQUE,
    communication_id INTEGER REFERENCES bna_contact_communications(id) ON DELETE SET NULL,
    webhook_log_id INTEGER REFERENCES bna_wapi_webhook_log(id) ON DELETE SET NULL,
    phone_e164 TEXT NOT NULL,to_number TEXT NOT NULL,push_name TEXT,has_media BOOLEAN NOT NULL DEFAULT FALSE,
    message_type TEXT,occurred_at TIMESTAMP,attribution JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','synced','blocked_configuration','failed')),
    attempt_count INTEGER NOT NULL DEFAULT 0,sheet_row INTEGER,sheet_receipt JSONB NOT NULL DEFAULT '{}',last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE INDEX idx_bna_life_skills_sheet_crm_sync_recovery ON bna_life_skills_sheet_crm_sync(status,updated_at);`);
  await pool.query(`INSERT INTO bna_life_skills_sheet_crm_sync
    (provider_message_id,phone_e164,to_number,push_name,attribution,status,attempt_count,sheet_row,sheet_receipt,last_error)
    VALUES('populated-baseline','+972525550101','+972534932631','PRESERVE',
      '{"writer_epoch":"LS-BASELINE-E1","source":"preserve"}'::jsonb,'failed',3,27,'{"action":"updated_existing"}'::jsonb,'preserve error')`);
  const before=(await pool.query(`SELECT row_to_json(s)::text AS snapshot FROM bna_life_skills_sheet_crm_sync s WHERE provider_message_id='populated-baseline'`)).rows[0].snapshot;
  await pool.query(SHEET_SYNC_SQL);await pool.query(SHEET_SYNC_SQL);
  const after=(await pool.query(`SELECT row_to_json(s)::text AS snapshot FROM (SELECT id,provider_message_id,communication_id,webhook_log_id,phone_e164,to_number,push_name,has_media,message_type,occurred_at,attribution,status,attempt_count,sheet_row,sheet_receipt,last_error,created_at,updated_at FROM bna_life_skills_sheet_crm_sync WHERE provider_message_id='populated-baseline') s`)).rows[0].snapshot;
  const original=JSON.parse(before);delete original.native_binding_sha256;delete original.native_event_key;
  assert.deepEqual(JSON.parse(after),original);
  const columns=(await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='bna_life_skills_sheet_crm_sync' AND column_name IN('native_binding_sha256','native_event_key') ORDER BY column_name`)).rows.map(row=>row.column_name);
  assert.deepEqual(columns,['native_binding_sha256','native_event_key']);
  const constraints=(await pool.query(`SELECT conname FROM pg_constraint WHERE conrelid='bna_life_skills_sheet_crm_sync'::regclass AND conname IN('bna_ls_sheet_crm_native_binding_format','bna_ls_sheet_crm_native_event_format') ORDER BY conname`)).rows.map(row=>row.conname);
  assert.deepEqual(constraints,['bna_ls_sheet_crm_native_binding_format','bna_ls_sheet_crm_native_event_format']);
  assert.equal((await pool.query(`SELECT count(*)::int AS n FROM pg_indexes WHERE tablename='bna_life_skills_sheet_crm_sync' AND indexname='idx_bna_life_skills_sheet_crm_sync_native_receipt'`)).rows[0].n,1);
});
