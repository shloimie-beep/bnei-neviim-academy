const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {nativeEpoch, validateNativeSend, deliverNativeProspectMessage} = require('../src/lib/bna/life-skills-native-outbound');
const {forwardConfig} = require('../src/lib/bna/life-skills-app-inbound');
const env = {LIFE_SKILLS_CRM_WRITER_MODE:'capture_only', LIFE_SKILLS_CRM_WRITER_EPOCH:nativeEpoch(4),
  LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:'true', LIFE_SKILLS_APP_BRIDGE_SECRET:'synthetic-bridge-secret-for-isolated-unit-tests',
  LIFE_SKILLS_WAPI_CHANNEL_ID:'synthetic-channel', LIFE_SKILLS_SHEET_CRM_ENABLED:'true',
  LIFE_SKILLS_SHEET_CRM_CONFIRM:'APPROVE_LIFE_SKILLS_SHEET_CRM_INBOUND_UPSERT'};
const input = () => ({operationId:'10000000-0000-4000-8000-000000000001',authorityEpoch:4,
  bindingSha256:forwardConfig(env).bindingSha256,leadId:'LS-LEAD-native-20000000-0000-4000-8000-000000000001',
  phone:'+15555550123',body:'Synthetic isolated message; never sent',recordMode:'live'});
function fixture() {
  const rows=[], calls={connect:0,send:0,create:0,update:0,release:0}; let sequence=0;
  const db={async query(sql,values) {
    if (sql.includes('SELECT id,metadata')) return {rows:rows.filter(row=>row.metadata.life_skills_native_operation===values[0]||row.metadata.life_skills_delivery_key===values[1])};
    return {rows:[]};
  },release(){calls.release++;}};
  const d={env:{...env},pool:{async connect(){calls.connect++;return db;}},
    async createAttempt(args){calls.create++; const row={id:++sequence,body:args.messageBody,metadata:{...args.metadata,recipient_phone:args.recipient.phone,delivery_status:'attempted'},source_context:args.sourceContext};rows.push(row);return row;},
    async send(){calls.send++;return {status:200,response:{id:'synthetic-provider-message-001'}};},
    messageId:r=>r.id,
    async updateResult(id,{sendResult}){calls.update++; const row=rows.find(r=>r.id===id);row.metadata={...row.metadata,
      delivery_status:'sent',wapi_message_id:sendResult.response.id,checked_at:'2026-10-05T09:00:00.000Z'};return row;}};
  return {d,calls,rows};
}
test('native epoch requires explicit matching cutover; default Sheet and generic freeze cannot send', async()=>{
  for (const override of [{LIFE_SKILLS_CRM_WRITER_MODE:'sheet'},{LIFE_SKILLS_CRM_WRITER_EPOCH:'cutover-hold-20261005'},
    {LIFE_SKILLS_CRM_WRITER_EPOCH:nativeEpoch(3)},{LIFE_SKILLS_CRM_WRITER_MODE:'invalid'}]) {
    const f=fixture();Object.assign(f.d.env,override);
    await assert.rejects(deliverNativeProspectMessage(input(),f.d),{code:'NATIVE_SEND_AUTHORITY_HELD'});
    assert.equal(f.calls.connect,0);assert.equal(f.calls.send,0);
  }
});
test('binding or disabled existing forward consent fails before ledger/provider', async()=>{
  for(const override of [{LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:'false'},{LIFE_SKILLS_WAPI_CHANNEL_ID:'other'},
    {LIFE_SKILLS_SHEET_CRM_CONFIRM:''},{LIFE_SKILLS_APP_BRIDGE_SECRET:''}]){
    const f=fixture();Object.assign(f.d.env,override);
    await assert.rejects(deliverNativeProspectMessage(input(),f.d),{code:'NATIVE_SEND_BINDING_UNAVAILABLE'});
    assert.equal(f.calls.connect,0);
  }
});
test('rejects DEMO, extra fields, malformed recipient/group, operation, epoch and message', ()=>{
  for(const override of [{recordMode:'demo'},{role:'practitioner'},{phone:'15555550123@g.us'},{phone:'+012345678'},
    {operationId:'not-uuid'},{authorityEpoch:NaN},{authorityEpoch:0},{authorityEpoch:1.2},{authorityEpoch:1000000001},
    {body:''},{body:' '},{body:' padded '},{body:'x'.repeat(2001)},{leadId:'other-id'}])
    assert.throws(()=>validateNativeSend({...input(),...override},env),{code:'INVALID_NATIVE_SEND'});
});
test('durable provider result replays one operation without another send or any Sheet dependency', async()=>{
  const f=fixture(),first=await deliverNativeProspectMessage(input(),f.d),second=await deliverNativeProspectMessage(input(),f.d);
  assert.equal(first.replaySuppressed,false);assert.equal(second.replaySuppressed,true);
  assert.equal(second.providerMessageId,first.providerMessageId);assert.equal(second.sentAt,first.sentAt);
  assert.equal(first.sheetUpdated,false);assert.equal(f.calls.send,1);assert.equal(f.calls.create,1);assert.equal(f.calls.release,2);
});
test('reused operation with changed exact body or recipient cannot send', async()=>{
  const f=fixture();await deliverNativeProspectMessage(input(),f.d);
  for(const change of [{body:'Different message'},{phone:'+15555550124'},{leadId:'LS-LEAD-other'}])
    await assert.rejects(deliverNativeProspectMessage({...input(),...change},f.d),{code:'NATIVE_SEND_OPERATION_CONFLICT'});
  assert.equal(f.calls.send,1);
});
test('same-day browser retry with a new operation reuses confirmed receipt; changed phone conflicts',async()=>{
  const f=fixture();await deliverNativeProspectMessage(input(),f.d);
  const retry={...input(),operationId:'10000000-0000-4000-8000-000000000002'};
  assert.equal((await deliverNativeProspectMessage(retry,f.d)).replaySuppressed,true);
  await assert.rejects(deliverNativeProspectMessage({...retry,phone:'+15555550124'},f.d),{code:'NATIVE_SEND_OPERATION_CONFLICT'});
  assert.equal(f.calls.send,1);
});
test('provider timeout retains attempted row and rejects replay rather than duplicate delivery', async()=>{
  const f=fixture();f.d.send=async()=>{f.calls.send++;throw Error('timeout');};
  await assert.rejects(deliverNativeProspectMessage(input(),f.d),/timeout/);
  await assert.rejects(deliverNativeProspectMessage(input(),f.d),{code:'NATIVE_SEND_OUTCOME_UNRESOLVED'});
  assert.equal(f.calls.send,1);assert.equal(f.rows[0].metadata.delivery_status,'attempted');
});
test('unconfirmed provider ID or failed result persistence never acknowledges or retries a send', async()=>{
  for (const kind of ['missing-id','save-failed','missing-row']) {
    const f=fixture();
    if(kind==='missing-id')f.d.messageId=()=>null;
    if(kind==='save-failed')f.d.updateResult=async()=>{throw Error('save failed');};
    if(kind==='missing-row')f.d.updateResult=async()=>null;
    await assert.rejects(deliverNativeProspectMessage(input(),f.d));
    await assert.rejects(deliverNativeProspectMessage(input(),f.d),{code:'NATIVE_SEND_OUTCOME_UNRESOLVED'});
    assert.equal(f.calls.send,1);
  }
});
test('duplicate ledger records fail closed', async()=>{
  const f=fixture();await deliverNativeProspectMessage(input(),f.d);f.rows.push({...f.rows[0],id:2});
  await assert.rejects(deliverNativeProspectMessage(input(),f.d),{code:'NATIVE_SEND_OPERATION_CONFLICT'});
  assert.equal(f.calls.send,1);
});
test('real route checks existing bridge auth before transport and has no Sheet access or automatic scheduler',()=>{
  const source=fs.readFileSync(require.resolve('../server.js'),'utf8');
  const route=source.slice(source.indexOf("app.post('/api/bna/life-skills-app/native-prospects/send'"),source.indexOf("app.get('/api/webhooks/wapi'"));
  assert.ok(route.indexOf('authorizeLifeSkillsAppBridge(req)')<route.indexOf('await deliverNativeProspectMessage'));
  assert.match(route,/createAttempt:createOutboundWapiCommunicationAttempt/);
  assert.match(route,/send:sendWapiTextMessage/);
  assert.doesNotMatch(route,/listLifeSkillsLeads|updateLifeSkillsLeadFields|setInterval|createGoogleClient/);
});
