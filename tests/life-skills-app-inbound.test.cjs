const assert = require('node:assert/strict');
const test = require('node:test');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { APP_INBOUND_URL, OUTBOX_SQL, forwardConfig, inquiriesFromEnvelope, ctwaAttributionFromProviderMessage, receiptDigest, LifeSkillsAppInboundOutbox } = require('../src/lib/bna/life-skills-app-inbound');

function env(extra={}) { return { LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:'true', LIFE_SKILLS_SHEET_CRM_ENABLED:'true',
  LIFE_SKILLS_SHEET_CRM_CONFIRM:'APPROVE_LIFE_SKILLS_SHEET_CRM_INBOUND_UPSERT', LIFE_SKILLS_APP_BRIDGE_SECRET:'synthetic-key-not-a-real-secret-123456789',
  WHAPI_CHANNEL_ID:'synthetic-channel', LIFE_SKILLS_WAPI_REQUIRED_SENDER_DIGITS:'972534932631', ...extra }; }
function envelope(extra={}) { return { channel_id:'synthetic-channel', event:{type:'messages',event:'post'}, messages:[{
  id:'synthetic-message-1', from_me:false, type:'text', chat_id:'972525550101@s.whatsapp.net', timestamp:1790500000,
  from:'972525550101', from_name:'DEMO inquiry', text:{body:'שלום / neutral inquiry'}, ...extra }] }; }

test('defaults OFF and retains existing explicit capture consent; no disabled backlog', () => {
  for (const extra of [{LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:''},{LIFE_SKILLS_SHEET_CRM_ENABLED:'false'},{LIFE_SKILLS_SHEET_CRM_CONFIRM:'wrong'}]) {
    const config=forwardConfig(env(extra)); assert.equal(config.enabled,false); assert.equal(config.ready,false);
    assert.deepEqual(inquiriesFromEnvelope(envelope(),{},config),[]);
  }
  assert.equal(forwardConfig({}).ready,false);
  assert.throws(()=>inquiriesFromEnvelope(envelope(),{},forwardConfig(env({LIFE_SKILLS_APP_BRIDGE_SECRET:'short'}))),/FORWARD_CONFIGURATION_UNAVAILABLE/);
  assert.equal(APP_INBOUND_URL,'https://life-skills.bneineviimacademy.org/api/private/contact-inbound');
});
test('binding is the private app canonical SHA-256; no owner-controlled destination URL', () => {
  const c=forwardConfig(env({LIFE_SKILLS_APP_INBOUND_URL:'https://untrusted.invalid'}));
  assert.equal(c.bindingSha256,crypto.createHash('sha256').update(JSON.stringify({businessNumber:'+972534932631',channelId:'synthetic-channel',provider:'whapi'})).digest('hex'));
  assert.equal(c.ready,true);
});
test('blind acknowledgement binds the exact normalized event/body to the existing bridge secret',()=>{
  const config=forwardConfig(env()),[dto]=inquiriesFromEnvelope(envelope(),{},config),digest=receiptDigest(dto,config.secret);
  assert.match(digest,/^[a-f0-9]{64}$/);
  assert.notEqual(receiptDigest({...dto,providerEventId:'different-event'},config.secret),digest);
  assert.notEqual(receiptDigest({...dto,messageText:'different-body'},config.secret),digest);
  assert.notEqual(receiptDigest(dto,config.secret+'different-key'),digest);
});
test('maps actual messages.post shape, stable message/event IDs, Hebrew and provider time', () => {
  const [dto]=inquiriesFromEnvelope(envelope(),{},forwardConfig(env()));
  assert.equal(dto.provider,'whapi'); assert.equal(dto.providerEventId,dto.providerMessageId);
  assert.equal(dto.businessNumber,'+972534932631'); assert.equal(dto.fromNumber,'+972525550101');
  assert.equal(dto.messageText,'שלום / neutral inquiry'); assert.equal(dto.pushName,'DEMO inquiry');
  assert.equal(dto.occurredAt,new Date(1790500000000).toISOString());
  assert.deepEqual(inquiriesFromEnvelope(envelope(),{},forwardConfig(env())),[dto]);
});
test('captures every new message in a batch instead of only its first item', () => {
  const payload=envelope(); payload.messages.push({...payload.messages[0],id:'synthetic-message-2',text:{body:'second'}});
  const dtos=inquiriesFromEnvelope(payload,{},forwardConfig(env()));
  assert.equal(dtos.length,2); assert.equal(dtos[1].messageText,'second'); assert.equal(dtos[1].providerEventId,'synthetic-message-2');
});
test('complete authenticated provider CTWA evidence reaches the existing exact DTO and acknowledgement', () => {
  const config=forwardConfig(env()),context={ad:{ctwa:' synthetic-click ',attrib:true,source:{id:' synthetic-ad ',type:'ad',url:'https://ignored.invalid'},headline:'ignored headline'}};
  const [dto]=inquiriesFromEnvelope(envelope({context}),{},config),[ordinary]=inquiriesFromEnvelope(envelope(),{},config);
  assert.deepEqual(dto.ctwaAttribution,{clickId:'synthetic-click',adId:'synthetic-ad',attributed:true,sourceType:'ad'});
  const {ctwaAttribution,...retained}=dto;assert.deepEqual(retained,ordinary);
  assert.equal(Object.hasOwn(ordinary,'ctwaAttribution'),false); // Old digest/DTO bytes are unchanged.
  assert.notEqual(receiptDigest(dto,config.secret),receiptDigest(ordinary,config.secret));
  assert.notEqual(receiptDigest(dto,config.secret),receiptDigest({...dto,ctwaAttribution:{...ctwaAttribution,clickId:'another-click'}},config.secret));
  assert.doesNotMatch(JSON.stringify(dto),/ignored\.invalid|headline/);
});
test('body/UTM/name never qualify and incomplete or invalid attribution still captures an ordinary message', () => {
  const config=forwardConfig(env());
  for(const ad of [{},{ctwa:'click',attrib:true},{ctwa:'click',attrib:'true',source:{id:'ad',type:'ad'}},
    {ctwa:'click',attrib:false,source:{id:'ad',type:'ad'}},{ctwa:'',attrib:true,source:{id:'ad',type:'ad'}},
    {ctwa:'x'.repeat(2049),attrib:true,source:{id:'ad',type:'ad'}},{ctwa:'click',attrib:true,source:{id:'x'.repeat(181),type:'ad'}},
    {ctwa:'click',attrib:true,source:{id:123,type:'ad'}},{ctwa:'click',attrib:true,source:{id:'ad',type:'post'}}]){
    const [dto]=inquiriesFromEnvelope(envelope({context:{ad},from_name:'LS • Lead',text:{body:'utm_source=facebook ctwa=click business inquiry'}}),{},config);
    assert.equal(Object.hasOwn(dto,'ctwaAttribution'),false);assert.equal(dto.messageText,'utm_source=facebook ctwa=click business inquiry');
  }
});
test('inherited CTWA properties cannot qualify a shared personal-number message', () => {
  const ad={ctwa:'click',attrib:true,source:{id:'ad',type:'ad'}};
  for(const message of [Object.create({context:{ad}}),{context:Object.create({ad})},
    {context:{ad:Object.create(ad)}},{context:{ad:{ctwa:'click',attrib:true,source:Object.create({id:'ad',type:'ad'})}}}])
    assert.equal(ctwaAttributionFromProviderMessage(message),null);
  for(const value of [null,undefined,'click',[],{context:{ad:[]}}])assert.equal(ctwaAttributionFromProviderMessage(value),null);
});
test('CTWA metadata retains channel/consent/scope exclusions and never creates contacts or sends', () => {
  const payload=envelope({context:{ad:{ctwa:'click',attrib:true,source:{id:'ad',type:'ad'}}}}),config=forwardConfig(env());
  assert.deepEqual(inquiriesFromEnvelope({...payload,channel_id:'other'},{},config),[]);
  assert.deepEqual(inquiriesFromEnvelope(payload,{project_key:'one_time_mishnah_class'},config),[]);
  assert.deepEqual(inquiriesFromEnvelope(payload,{},forwardConfig(env({LIFE_SKILLS_APP_INBOUND_FORWARD_ENABLED:'false'}))),[]);
  assert.deepEqual(inquiriesFromEnvelope(envelope({...payload.messages[0],from_me:true}),{},config),[]);
  const source=fs.readFileSync(path.join(__dirname,'..','src/lib/bna/life-skills-app-inbound.js'),'utf8');
  assert.doesNotMatch(source,/sendWapiTextMessage|messages\/list|people\.create|contacts\/put/);
});
test('wrong channel, One Time, groups, Status, newsletters, outbound and delivery events never enter this inbox', () => {
  const config=forwardConfig(env());
  assert.deepEqual(inquiriesFromEnvelope({...envelope(),channel_id:'another-channel'},{},config),[]);
  for (const scope of [{project_key:'one_time_mishnah_class'},{workspace_key:'rabbi_sheller_provider'}]) assert.deepEqual(inquiriesFromEnvelope(envelope(),scope,config),[]);
  for (const change of [{chat_id:'123@g.us'},{chat_id:'status@broadcast'},{chat_id:'123@newsletter'},{from_me:true},{from_me:'false'},{status:'delivered'}]) assert.deepEqual(inquiriesFromEnvelope(envelope(change),{},config),[]);
  assert.deepEqual(inquiriesFromEnvelope({...envelope(),event:{type:'messages',event:'patch'}},{},config),[]);
  assert.throws(()=>inquiriesFromEnvelope(envelope({to:'+972500000000'}),{},config),/DESTINATION_MISMATCH/);
  assert.throws(()=>inquiriesFromEnvelope(envelope({from:'972525550102'}),{},config),/INVALID_INQUIRY/);
});
test('media records only real IDs and bounded descriptors, no URL/preview/download', () => {
  const payload=envelope({type:'document',text:undefined,document:{id:'synthetic-media-id',file_name:'DEMO.pdf',mime_type:'application/pdf',file_size:1234,
    caption:'neutral attachment',link:'https://private-provider.invalid/secret',preview:'private-preview'}});
  const [dto]=inquiriesFromEnvelope(payload,{},forwardConfig(env()));
  assert.deepEqual(dto.media,[{providerMediaId:'synthetic-media-id',fileName:'DEMO.pdf',mimeType:'application/pdf',sizeBytes:1234}]);
  assert.equal(dto.messageText,'neutral attachment'); assert.doesNotMatch(JSON.stringify(dto),/private-provider|preview|link/);
  payload.messages[0].document.id=''; assert.throws(()=>inquiriesFromEnvelope(payload,{},forwardConfig(env())),/INVALID_INQUIRY/);
});
test('invalid/oversized content, timestamp, media and envelope fail without truncating data', () => {
  for (const changes of [{id:''},{id:'x'.repeat(181)},{timestamp:undefined},{timestamp:0},{text:{body:'x'.repeat(16001)}},
    {from_name:'x'.repeat(121)},{type:'image',text:undefined,image:{id:'image',file_size:50_000_001}},
    {type:'image',text:undefined,image:{id:'image',file_size:-1}},{type:'text',text:undefined}]) assert.throws(()=>inquiriesFromEnvelope(envelope(changes),{},forwardConfig(env())));
  assert.throws(()=>inquiriesFromEnvelope({...envelope(),messages:Array(101).fill(envelope().messages[0])},{},forwardConfig(env())));
});
test('encrypted outbox keeps plaintext/IDs out of stored bytes and detects corruption/rebinding/key changes', () => {
  const config=forwardConfig(env()), outbox=new LifeSkillsAppInboundOutbox(null,config);
  const [inquiry]=inquiriesFromEnvelope(envelope(),{},config), key=outbox.eventKey(inquiry);
  const row={binding_sha256:config.bindingSha256,event_key:key,key_sha256:outbox.keySha256,payload_digest:outbox.digest(inquiry),payload_ciphertext:outbox.seal(inquiry,key)};
  assert.match(key,/^[a-f0-9]{64}$/); assert.equal(row.payload_ciphertext.includes(Buffer.from(inquiry.messageText)),false);
  assert.deepEqual(outbox.unseal(row),inquiry);
  for (const corrupted of [{...row,event_key:'0'.repeat(64)},{...row,key_sha256:'0'.repeat(64)},{...row,payload_digest:'0'.repeat(64)}]) assert.throws(()=>outbox.unseal(corrupted),/OUTBOX_INTEGRITY_FAILURE/);
  const tampered=Buffer.from(row.payload_ciphertext); tampered[20]^=1;
  assert.throws(()=>outbox.unseal({...row,payload_ciphertext:tampered}),/OUTBOX_INTEGRITY_FAILURE/);
});
test('actual webhook awaits encrypted capture before communication/ACK; timer drains only the new table', () => {
  const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
  const handler=server.slice(server.indexOf("app.post('/api/webhooks/wapi'"));
  assert.ok(handler.indexOf('authorizeWapiWebhookRequest')<handler.indexOf('await captureLifeSkillsAppInbound'));
  assert.ok(handler.indexOf('await captureLifeSkillsAppInbound')<handler.indexOf('createCommunicationFromWapiWebhook'));
  assert.match(server,/await outbox.captureBatch\(inquiries\)/);
  assert.match(server,/lifeSkillsAppInboundPool.query\(createLifeSkillsAppInboundOutboxSQL\)/);
  assert.doesNotMatch(server,/await pool.query\(createLifeSkillsAppInboundOutboxSQL\)/);
  assert.match(server,/new LifeSkillsAppInboundOutbox\(await lifeSkillsAppInboundDatabase\(\), config\)/);
  assert.match(server,/startLifeSkillsAppInboundScheduler\(\)/);
  const module=fs.readFileSync(path.join(__dirname,'..','src/lib/bna/life-skills-app-inbound.js'),'utf8');
  assert.doesNotMatch(module,/bna_wapi_webhook_log|bna_contact_communications|bna_life_skills_sheet_crm_sync|sendWapiTextMessage|messages\/list/);
  assert.match(OUTBOX_SQL,/REVOKE ALL ON bna_life_skills_app_inbound_outbox FROM PUBLIC/);
});

test('optional outbox startup cannot interrupt healthy shared initialization or log failure details', async () => {
  const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
  const start=server.indexOf('    // Optional outbox startup must not abort');
  const end=server.indexOf('    await pool.query(createWapiSyncRunsSQL);',start);
  assert.ok(start>0&&end>start);
  const startup=server.slice(start,end)+'    await pool.query(createWapiSyncRunsSQL);';
  for(const ready of [false,true]) {
    const calls=[],messages=[];
    await vm.runInNewContext(`(async()=>{${startup}})()`,{
      process:{env:{}},lifeSkillsAppInboundConfig:()=>({ready}),
      lifeSkillsAppInboundDatabase:async()=>{calls.push('outbox');throw new Error('synthetic-private-failure-detail');},
      console:{error:message=>messages.push(message)},
      pool:{query:async()=>calls.push('shared')},createWapiSyncRunsSQL:'synthetic-shared-migration',
    });
    assert.deepEqual(calls,ready?['outbox','shared']:['shared']);
    assert.equal(messages.length,ready?1:0);
    assert.doesNotMatch(messages.join(' '),/synthetic-private-failure-detail/);
  }
});
test('actual webhook capture still rejects the same unavailable durable database before capture or ACK', async () => {
  const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
  const start=server.indexOf('async function captureLifeSkillsAppInbound(');
  const end=server.indexOf('function startLifeSkillsAppInboundScheduler()',start);
  assert.ok(start>0&&end>start);
  let captureCalls=0;
  const result=vm.runInNewContext(`${server.slice(start,end)};captureLifeSkillsAppInbound({},{});`,{
    process:{env:{}},lifeSkillsAppInboundConfig:()=>({enabled:true,ready:true}),lifeSkillsAppInquiries:()=>[{}],
    lifeSkillsAppInboundDatabase:async()=>{throw new Error('OUTBOX_DATABASE_TLS_UNAVAILABLE');},
    LifeSkillsAppInboundOutbox:class { async captureBatch(){captureCalls++;return {};} },
  });
  await assert.rejects(result,/OUTBOX_DATABASE_TLS_UNAVAILABLE/);
  assert.equal(captureCalls,0);
});

module.exports={env,envelope};
