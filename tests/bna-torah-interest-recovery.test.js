'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('public/js/bna-torah-interest.js','utf8');
const id='00000000-0000-4000-8000-000000000123',key='bna-torah-interest-pending-v1';
function harness(saved,unavailable=false){
 const storage=new Map(saved?[[key,saved]]:[]),events={},sent=[],status={textContent:'',dataset:{}},submit={disabled:false};
 const controls=Object.fromEntries(['name','contactChannel','contact','language','townOrZip','childAge','otherChildAge','readiness','availability','startPreference','question','purposeConsent'].map(name=>[name,{value:'',checked:false,disabled:false,addEventListener(){}}]));
 Object.assign(controls.name,{value:'Synthetic parent'});Object.assign(controls.contactChannel,{value:'email'});Object.assign(controls.contact,{value:'synthetic@example.invalid'});Object.assign(controls.townOrZip,{value:'Florida'});Object.assign(controls.childAge,{value:'10'});Object.assign(controls.purposeConsent,{checked:true});
 class Form{constructor(){this.elements={namedItem:name=>controls[name]};}querySelector(){return submit;}querySelectorAll(selector){return selector==='[data-consent-lang]'?[]:Object.values(controls);}addEventListener(type,fn){events[type]=fn;}reportValidity(){return true;}reset(){}}
 class Input{} class Anchor{} const form=new Form();let failure=true;
 const sandbox={HTMLFormElement:Form,HTMLInputElement:Input,HTMLAnchorElement:Anchor,FormData:class{get(name){return controls[name]?.value||'';}},
  document:{documentElement:{dataset:{}},referrer:'',querySelector:s=>s==='#torah-interest-form'?form:status,querySelectorAll:()=>[],head:{appendChild(){}}},
  location:{pathname:'/torah-mornings',search:'',origin:'https://example.invalid'},URL,URLSearchParams,crypto:{randomUUID:()=>id},
  sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(unavailable)throw Error('unavailable');storage.set(k,v);},removeItem:k=>storage.delete(k)},setTimeout:fn=>fn(),
  fetch:async(_url,options={})=>{if(!options.method)return {ok:true,json:async()=>({data:{challenge:'synthetic'}})};sent.push(JSON.parse(options.body));if(failure){failure=false;throw Error('response lost');}return {ok:true,status:200,json:async()=>({data:{saved:true,reference:'synthetic'}})};}};
 vm.runInNewContext(source,sandbox);return {storage,controls,status,submit,events,sent};
}
test('uncertain save retains only operation identity in session storage and retries exact payload in memory',async()=>{
 const h=harness();await h.events.submit({preventDefault(){}});assert.equal(h.storage.get(key),id);assert.equal(h.status.dataset.state,'unknown');
 await h.events.submit({preventDefault(){}});assert.deepEqual(h.sent[0],h.sent[1]);assert.equal(h.storage.has(key),false);assert.equal(h.status.dataset.state,'saved');
});
test('a reopened unknown submission, including legacy stored payload, is blocked without child data in storage',()=>{
 for(const stored of [id,JSON.stringify({operationId:id,fields:{name:'Synthetic parent',contact:'synthetic@example.invalid',childAges:[10]}})]){
  const h=harness(stored);assert.equal(h.storage.get(key),id);assert.equal(h.submit.disabled,true);assert.equal(h.events.submit,undefined);assert.match(h.status.textContent,/305/);assert.ok(h.status.textContent.includes(id));
 }
});
test('does not post when the recovery marker cannot be stored',async()=>{
 const h=harness(null,true);await h.events.submit({preventDefault(){}});assert.equal(h.sent.length,0);assert.equal(h.status.dataset.state,'error');assert.equal(h.controls.name.disabled,false);
});
test('a damaged prior marker fails closed and removes any stored details',()=>{
 const h=harness('{"fields":"synthetic sensitive text"');assert.equal(h.submit.disabled,true);assert.equal(h.storage.get(key),'unresolved');assert.equal(h.events.submit,undefined);
});
