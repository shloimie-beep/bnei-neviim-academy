// Explicit native gate: node --test tests/life-skills-app-inbound.native.cjs.
// No skip, mock database, production URL or history data is permitted.
const assert = require('node:assert/strict');
const {test,before,after,beforeEach} = require('node:test');
const {Pool} = require('pg');
const {APP_INBOUND_URL,OUTBOX_SQL,forwardConfig,inquiriesFromEnvelope,receiptDigest,LifeSkillsAppInboundOutbox} = require('../src/lib/bna/life-skills-app-inbound');
const {RECONCILIATION_SQL,registerInboundReconciliation,confirmPrivateReceipt,markPrivateReceiptBlocked,markSheetMaterialized,readInboundReconciliation} = require('../src/lib/bna/life-skills-inbound-reconciliation');
const url = new URL(process.env.TEST_DATABASE_URL || 'invalid:');
assert.equal(url.protocol,'postgresql:'); assert.equal(url.hostname,'127.0.0.1'); assert.equal(url.username,'synthetic');
assert.match(url.pathname,/^\/ls_calendar_test_voice_[a-f0-9]{8}_test$/);
assert.equal(process.env.LS_CALENDAR_TEST_ALLOW,'true');
const pool = new Pool({connectionString:url.href,ssl:false,max:5});
const config = forwardConfig({LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:'true',LIFE_SKILLS_SHEET_CRM_ENABLED:'true',
  LIFE_SKILLS_SHEET_CRM_CONFIRM:'APPROVE_LIFE_SKILLS_SHEET_CRM_INBOUND_UPSERT',LIFE_SKILLS_APP_BRIDGE_SECRET:'synthetic-not-real-credential-0123456789',
  WHAPI_CHANNEL_ID:'synthetic-channel',LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS:'972534932631'});
const reconciliation={register:registerInboundReconciliation,confirm:confirmPrivateReceipt,block:markPrivateReceiptBlocked};
function inquiry(id='synthetic-message-1',text='DEMO synthetic inquiry') {
  return inquiriesFromEnvelope({channel_id:'synthetic-channel',event:{type:'messages',event:'post'},messages:[{
    id,from_me:false,type:'text',chat_id:'972525550101@s.whatsapp.net',timestamp:1790500000,from:'972525550101',from_name:'DEMO',text:{body:text}}]}, {},config)[0];
}
function receipt(replayed=false,dto=inquiry()) { return Response.json({ok:true,data:{replayed,storedAt:'2026-09-28T03:00:00.000Z',ackDigest:receiptDigest(dto,config.secret)},requestId:'synthetic-request'}, {status:replayed?200:201}); }
const count=async()=>Number((await pool.query('SELECT count(*) AS n FROM bna_life_skills_app_inbound_outbox')).rows[0].n);
before(async()=>{
  await pool.query(`CREATE TABLE IF NOT EXISTS bna_life_skills_sheet_crm_sync (
    id SERIAL PRIMARY KEY,provider_message_id TEXT NOT NULL UNIQUE,phone_e164 TEXT NOT NULL,to_number TEXT NOT NULL,
    push_name TEXT,has_media BOOLEAN NOT NULL DEFAULT FALSE,message_type TEXT,occurred_at TIMESTAMP,
    attribution JSONB NOT NULL DEFAULT '{}',native_binding_sha256 TEXT,native_event_key TEXT,
    status TEXT NOT NULL DEFAULT 'pending',attempt_count INTEGER NOT NULL DEFAULT 0,sheet_row INTEGER,
    sheet_receipt JSONB NOT NULL DEFAULT '{}',last_error TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  await pool.query(`ALTER TABLE bna_life_skills_sheet_crm_sync ADD COLUMN IF NOT EXISTS native_binding_sha256 TEXT,
    ADD COLUMN IF NOT EXISTS native_event_key TEXT`);
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
  await markSheetMaterialized(pool,{bindingSha256:config.bindingSha256,eventKey:captured.eventKey});
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
