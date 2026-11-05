'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),express=require('express'),{randomUUID}=require('node:crypto');
const {createTestDatabase}=require('./helpers/bna-interest-db.cjs');
const {createInterestRouter}=require('../src/lib/bna/interest-http');
const {NOTICE}=require('../src/lib/bna/interest-launch');
let fixture,server,origin;
before(async()=>{fixture=await createTestDatabase();const app=express();server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.on('listening',resolve));origin='http://127.0.0.1:'+server.address().port;app.use(createInterestRouter({store:fixture.store,enabled:()=>true,origin}));});
after(async()=>{await new Promise(resolve=>server.close(resolve));await fixture.close();});
const fields=()=>({program:'both',name:'Synthetic parent',email:randomUUID()+'@example.invalid',phone:'',contactChannel:'email',language:'en',siteLanguage:'en',area:'Other region',preferredArea:'Another region',childAges:[10],learningArrangement:'',torahExperience:'',question:'',articleUpdates:false,podUpdates:false,academyUpdates:false,permission:{confirmed:true,version:NOTICE.version,language:'en'}});
const post=body=>fetch(origin+'/api/bna/coop-interest',{method:'POST',headers:{Origin:origin,'Sec-Fetch-Site':'same-origin','Content-Type':'application/json'},body:JSON.stringify(body)});
test('HTTP binds the displayed consent, saves a durable reference and recovers after a lost response without a duplicate',async()=>{
const offer=await(await fetch(origin+'/api/bna/coop-interest')).json();assert.equal(offer.data.notice.en,NOTICE.en);
const body={operationId:randomUUID(),recoveryToken:randomUUID(),fields:fields(),challenge:offer.data.challenge};
const response=await post(body);assert.equal(response.status,201);const saved=(await response.json()).data;assert.equal(saved.saved,true);assert.equal(saved.email.state,'draft');
const replay=await post(body);assert.equal(replay.status,200);assert.equal((await replay.json()).data.reference,saved.reference);
const recovery=await post({action:'recover',operationId:body.operationId,recoveryToken:body.recoveryToken});assert.equal(recovery.status,200);assert.equal((await recovery.json()).data.reference,saved.reference);
const conflict=await post({...body,fields:{...body.fields,program:'academy'}});assert.equal(conflict.status,409);
assert.equal((await fixture.pool.query('SELECT COUNT(*)::int AS count FROM bna_interest_inquiries')).rows[0].count,1);
});
test('cross-origin, query variation, missing email and missing purpose permission cannot save',async()=>{
const offer=(await(await fetch(origin+'/api/bna/coop-interest')).json()).data;
const body={operationId:randomUUID(),recoveryToken:randomUUID(),fields:fields(),challenge:offer.challenge};
assert.equal((await fetch(origin+'/api/bna/coop-interest',{method:'POST',headers:{Origin:'https://other.example.invalid','Content-Type':'application/json'},body:JSON.stringify(body)})).status,403);
assert.equal((await fetch(origin+'/api/bna/coop-interest?token=untrusted')).status,404);
assert.equal((await post({...body,fields:{...body.fields,email:''}})).status,400);
assert.equal((await post({...body,fields:{...body.fields,permission:{...body.fields.permission,confirmed:false}}})).status,400);
assert.equal((await fixture.pool.query('SELECT COUNT(*)::int AS count FROM bna_interest_inquiries')).rows[0].count,1);
});
test('malformed JSON and oversized bodies fail closed before persistence',async()=>{
const headers={Origin:origin,'Sec-Fetch-Site':'same-origin','Content-Type':'application/json'};
assert.equal((await fetch(origin+'/api/bna/coop-interest',{method:'POST',headers,body:'{broken'})).status,400);
assert.equal((await fetch(origin+'/api/bna/coop-interest',{method:'POST',headers,body:JSON.stringify({value:'x'.repeat(17000)})})).status,413);
});
