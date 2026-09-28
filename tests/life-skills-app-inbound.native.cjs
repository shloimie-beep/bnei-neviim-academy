// Explicit native gate: node --test tests/life-skills-app-inbound.native.cjs.
// No skip, mock database, production URL or history data is permitted.
const assert = require('node:assert/strict');
const {test,before,after,beforeEach} = require('node:test');
const {Pool} = require('pg');
const {APP_INBOUND_URL,OUTBOX_SQL,forwardConfig,inquiriesFromEnvelope,LifeSkillsAppInboundOutbox} = require('../src/lib/bna/life-skills-app-inbound');
const url = new URL(process.env.TEST_DATABASE_URL || 'invalid:');
assert.equal(url.protocol,'postgresql:'); assert.equal(url.hostname,'127.0.0.1'); assert.equal(url.username,'synthetic');
assert.match(url.pathname,/^\/ls_calendar_test_voice_[a-f0-9]{8}_test$/);
assert.equal(process.env.LS_CALENDAR_TEST_ALLOW,'true');
const pool = new Pool({connectionString:url.href,ssl:false,max:5});
const config = forwardConfig({LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:'true',LIFE_SKILLS_SHEET_CRM_ENABLED:'true',
  LIFE_SKILLS_SHEET_CRM_CONFIRM:'APPROVE_LIFE_SKILLS_SHEET_CRM_INBOUND_UPSERT',LIFE_SKILLS_APP_BRIDGE_SECRET:'synthetic-not-real-credential-0123456789',
  WHAPI_CHANNEL_ID:'synthetic-channel',LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS:'972534932631'});
function inquiry(id='synthetic-message-1',text='DEMO synthetic inquiry') {
  return inquiriesFromEnvelope({channel_id:'synthetic-channel',event:{type:'messages',event:'post'},messages:[{
    id,from_me:false,type:'text',chat_id:'972525550101@s.whatsapp.net',timestamp:1790500000,from:'972525550101',from_name:'DEMO',text:{body:text}}]}, {},config)[0];
}
function receipt(replayed=false) { return Response.json({ok:true,data:{replayed,storedAt:'2026-09-28T03:00:00.000Z'},requestId:'synthetic-request'}, {status:replayed?200:201}); }
const count=async()=>Number((await pool.query('SELECT count(*) AS n FROM bna_life_skills_app_inbound_outbox')).rows[0].n);
before(async()=>{ await pool.query(OUTBOX_SQL); await pool.query(OUTBOX_SQL); });
beforeEach(async()=>{ await pool.query('TRUNCATE bna_life_skills_app_inbound_outbox'); });
after(async()=>{ await pool.end(); });

test('native schema is idempotent, owner-only and rejects malformed identifiers/ciphertext',async()=>{
  const permissions=(await pool.query(`SELECT count(*)::int AS n FROM pg_class c CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a WHERE c.oid='bna_life_skills_app_inbound_outbox'::regclass AND a.grantee<>c.relowner`)).rows[0].n;
  assert.equal(permissions,0);
  await assert.rejects(()=>pool.query(`INSERT INTO bna_life_skills_app_inbound_outbox(binding_sha256,event_key,key_sha256,payload_digest,payload_ciphertext) VALUES('bad','bad','bad','bad',decode('00','hex'))`),{code:'23514'});
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
  const row=(await pool.query('SELECT status,attempts,delivered_at,last_code FROM bna_life_skills_app_inbound_outbox')).rows[0];
  assert.equal(row.attempts,2); assert.ok(row.delivered_at instanceof Date); assert.equal(row.last_code,'COMMITTED_PRIVATE_RECEIPT');
});
test('forged 200, redirect/auth/binding failure and corrupt ciphertext never count as successful private capture',async()=>{
  for (const [response,expected] of [[Response.json({ok:true}),'pending'],[Response.json({ok:true,data:{replayed:false,storedAt:'not-a-time'}}),'pending'],[new Response('x'.repeat(4097)),'pending'],
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
  let sent=0; const outbox=new LifeSkillsAppInboundOutbox(pool,config,async()=>{sent++;return receipt();}), {eventKey}=await outbox.capture(inquiry());
  await Promise.all(Array.from({length:4},()=>outbox.deliver(eventKey))); assert.equal(sent,1);
  const a=await outbox.capture(inquiry('synthetic-message-2')), b=await outbox.capture(inquiry('synthetic-message-3'));
  await pool.query(`UPDATE bna_life_skills_app_inbound_outbox SET next_attempt_at=clock_timestamp()+interval '1 hour' WHERE event_key=$1`,[b.eventKey]);
  assert.deepEqual(await outbox.drain(1),{attempted:1,delivered:1,pending:0,blocked:0}); assert.equal(sent,2);
  assert.equal((await pool.query('SELECT status FROM bna_life_skills_app_inbound_outbox WHERE event_key=$1',[a.eventKey])).rows[0].status,'delivered');
  assert.equal((await pool.query('SELECT status FROM bna_life_skills_app_inbound_outbox WHERE event_key=$1',[b.eventKey])).rows[0].status,'pending');
  await assert.rejects(()=>outbox.drain(26),/INVALID_LIMIT/);
});
