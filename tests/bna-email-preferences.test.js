'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto,randomUUID,createHash}=require('node:crypto');
const {renderBnaPreferencesPage}=require('../src/lib/bna/email-preferences-page');
const source=fs.readFileSync(require.resolve('../public/js/bna-email-preferences.js'),'utf8');
const ready={BNA_EMAIL_PREFERENCES_ENABLED:'true',BNA_EMAIL_PREFERENCES_GATEWAY_ENABLED:'true',BNA_PRIVACY_RELEASE_APPROVED:'true',BNA_PRIVACY_OPERATOR_LEGAL_NAME:'Solomon Dratler',BNA_PRIVACY_EFFECTIVE_DATE:'2026-10-29'};
test('recipient page composes the same released BNA shell, remains gated and contains no recipient fields',()=>{
 const html=renderBnaPreferencesPage(ready);assert.ok(html.includes('data-enabled="true"'));assert.ok(html.includes('/css/bna-current-site.css'));assert.ok(html.includes('data-bna-site-nav'));assert.ok(html.includes('data-bna-site-footer'));
 assert.ok(!html.includes('name="name"'));assert.ok(!html.includes('childAge'));assert.ok(!html.includes('name="contact"'));
 assert.ok(html.includes('<fieldset disabled id="preferences-fields">'));assert.ok(!html.includes('name="updates" checked'));
 for(const key of Object.keys(ready))assert.ok(renderBnaPreferencesPage({...ready,[key]:''}).includes('data-enabled="false"'));
 const he=renderBnaPreferencesPage(ready,'he');assert.ok(he.includes('<html lang="he" dir="rtl"'));assert.ok(he.includes('<title>העדפות דוא״ל'));
});
class Node{constructor(){this.dataset={};this.events={};this.hidden=false;this.disabled=false;this.checked=false;this.value='en';this.textContent='';}addEventListener(name,fn){this.events[name]=fn;}}
class Form extends Node{constructor(){super();this.inputs={updates:new Node(),locale:new Node()};this.elements={namedItem:name=>this.inputs[name]};}}
const token='a'.repeat(1000),inquiryId=randomUUID();
const notice={version:'BNA-EMAIL-PREFERENCES-20261029-v1',en:'Synthetic explicit notice',he:'הודעה סינתטית מפורשת'};
function readback(version=0,updates=false,canSubscribe=true){return {inquiryId,preferences:{version,program:'bna_learning_coop',locale:'en',updates,deliveryPaused:false},notice,canSubscribe};}
const tick=async()=>{for(let i=0;i<10;i++)await new Promise(resolve=>setImmediate(resolve));};
function harness({storage=new Map(),enabled=true,hash='#token='+token,reply=()=>({status:200,data:readback()})}={}){
 const form=new Form(),ids={};for(const name of ['email-preferences','preferences-fields','preferences-status','preferences-retry','preferences-read','preferences-stop-program','preferences-stop-all','preferences-program','preferences-current','preferences-paused','preferences-notice'])ids[name]=new Node();
 ids['email-preferences'].dataset.enabled=String(enabled);const toggle=new Node(),calls=[];
 const location={hash,search:'',pathname:'/email-preferences'},document={documentElement:{lang:'en',dir:'ltr',dataset:{}},title:'',querySelector:s=>s==='#preferences-form'?form:ids[s.slice(1)],querySelectorAll:()=>[toggle]};
 const context={document,HTMLFormElement:Form,location,history:{replaceState:(_a,_b,url)=>{location.pathname=url.split('#')[0];location.hash=url.includes('#')?'#'+url.split('#')[1]:'';}},URLSearchParams,TextEncoder,AbortSignal,
  crypto:{subtle:webcrypto.subtle,randomUUID},sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
  fetch:async(_url,options)=>{const input=JSON.parse(options.body);calls.push(input);const result=await reply(input,calls.length);return {ok:result.status===200,status:result.status,json:async()=>({ok:result.status===200,data:result.data})};}};
 vm.runInNewContext(source,context);return {form,ids,calls,storage,toggle,location,document};
}
test('loading a link reads only; no token is stored and no opt-in is inferred',async()=>{
 const h=harness();await tick();assert.equal(h.calls.length,1);assert.equal(h.calls[0].action,'read');assert.equal(h.form.inputs.updates.checked,false);assert.equal(h.ids['preferences-fields'].disabled,false);assert.equal(h.storage.size,0);
 const oldHash=h.location.hash;h.toggle.events.click({preventDefault(){}});assert.equal(h.location.hash,oldHash);assert.equal(h.document.documentElement.lang,'he');assert.equal(h.calls.length,1);assert.equal(h.form.inputs.updates.checked,false);
 const invalid=harness({hash:'#token=invalid'});await tick();assert.equal(invalid.calls.length,0);
 const off=harness({enabled:false});await tick();assert.equal(off.calls.length,0);
});
test('lost response locks conflicting actions and exact retry recovers one original command',async()=>{
 let updates=0;
 const h=harness({reply:input=>{if(input.action==='read')return {status:200,data:readback(updates?1:0,false)};
  updates++;if(updates===1)throw Error('synthetic response lost');return {status:200,data:{replayed:true,preferences:{version:1}}};}});
 await tick();h.ids['preferences-stop-all'].events.click();await tick();assert.equal(h.ids['preferences-fields'].disabled,true);assert.equal(h.ids['preferences-retry'].hidden,false);
 const first=h.calls.find(x=>x.action==='update').command,stored=[...h.storage.values()][0];assert.ok(!stored.includes(token));assert.equal(JSON.parse(stored).operationId,first.operationId);
 h.toggle.events.click({preventDefault(){}});assert.equal(h.document.documentElement.lang,'en');
 h.ids['preferences-retry'].events.click();await tick();const commands=h.calls.filter(x=>x.action==='update').map(x=>x.command);assert.deepEqual(commands[0],commands[1]);assert.equal(h.storage.size,0);assert.equal(h.ids['preferences-retry'].hidden,true);assert.equal(h.ids['preferences-status'].dataset.state,'saved');
});
test('reload restores only the original command and waits for the recipient to retry',async()=>{
 const command={inquiryId,operationId:randomUUID(),expectedVersion:4,action:'unsubscribe_all'};
 const key='bna-preference-operation-v1:'+createHash('sha256').update(token).digest('hex'),storage=new Map([[key,JSON.stringify(command)]]);
 const h=harness({storage,reply:input=>input.action==='read'?{status:200,data:readback(5,false)}:{status:200,data:{replayed:true,preferences:{version:5}}}});
 await tick();assert.equal(h.calls.length,0);assert.equal(h.ids['preferences-retry'].hidden,false);
 h.ids['preferences-retry'].events.click();await tick();assert.deepEqual(h.calls[0].command,command);assert.equal(storage.size,0);
});
test('a later conflict after an uncertain result retains the original operation',async()=>{
 let attempts=0;const h=harness({reply:input=>{if(input.action==='read')return {status:200,data:readback()};attempts++;if(attempts===1)throw Error('lost');return {status:409};}});
 await tick();h.ids['preferences-stop-all'].events.click();await tick();const first=[...h.storage.values()][0];h.ids['preferences-retry'].events.click();await tick();assert.equal([...h.storage.values()][0],first);assert.equal(h.ids['preferences-retry'].hidden,false);assert.equal(h.ids['preferences-stop-all'].disabled,true);
});
test('expired opt-in capability leaves both unsubscribe actions available and never renews permission',async()=>{
 const h=harness({reply:input=>input.action==='read'?{status:200,data:readback(0,true,false)}:{status:200,data:{replayed:false,preferences:{version:1}}}});
 await tick();assert.equal(h.ids['preferences-fields'].disabled,true);assert.equal(h.ids['preferences-stop-program'].disabled,false);assert.equal(h.ids['preferences-stop-all'].disabled,false);
 h.ids['preferences-stop-program'].events.click();await tick();const command=h.calls.find(x=>x.action==='update').command;assert.equal(command.action,'set_preferences');assert.equal(command.updates,false);
});
