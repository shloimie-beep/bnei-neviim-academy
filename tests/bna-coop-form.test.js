'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('public/js/bna-coop-join.js','utf8');
function harness({stored=false}={}){
 const controls=Object.fromEntries(['name','contactChannel','contact','secondaryContact','language','townOrZip','childAge','otherChildAge','availability','question','emailUpdates','purposeConsent'].map(name=>[name,{value:'',checked:false,disabled:false,addEventListener(type,fn){this[type]=fn;}}]));
 Object.assign(controls.name,{value:'Synthetic parent'});Object.assign(controls.contactChannel,{value:'email'});Object.assign(controls.contact,{value:'parent@example.invalid'});Object.assign(controls.townOrZip,{value:'Florida'});Object.assign(controls.childAge,{value:'10'});controls.purposeConsent.checked=true;
 const button={disabled:false},status={textContent:'',dataset:{}},events={},sent=[],storage=new Map(stored?[['bna-coop-unconfirmed-operation-v1','synthetic-previous-operation']]:[]);
 class Form{constructor(){this.elements={namedItem:name=>controls[name]};} querySelector(){return button;} querySelectorAll(){return Object.values(controls);} addEventListener(type,fn){events[type]=fn;} reportValidity(){return true;} reset(){}}
 const form=new Form(),html={lang:'en',dir:'ltr',dataset:{locale:'en'}},link={dataset:{enHref:'/join',heHref:'/he/join'},addEventListener(type,fn){this[type]=fn;}},history=[];
 let fail=true;
 const sandbox={HTMLFormElement:Form,document:{documentElement:html,referrer:'',querySelector:s=>s==='#coop-interest-form'?form:status,querySelectorAll:()=>[link]},
  location:{search:'?utm_source=facebook'},history:{replaceState:(_a,_b,url)=>history.push(url)},URL,URLSearchParams,crypto:{randomUUID:()=>'00000000-0000-4000-8000-000000000123'},
  sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:fn=>fn(),
  fetch:async(url,options={})=>{if(!options.method)return {ok:true,json:async()=>({data:{challenge:'synthetic'}})};sent.push(JSON.parse(options.body));if(fail){fail=false;throw Error('response lost');}return {ok:true,status:200,json:async()=>({data:{saved:true,reference:'synthetic-reference'}})};}};
 vm.runInNewContext(source,sandbox);return {controls,button,status,events,sent,storage,link,html,history};
}
test('unknown response retries the same operation and retains exact fields',async()=>{
 const h=harness();await h.events.submit({preventDefault(){}});assert.equal(h.status.dataset.state,'unknown');assert.equal(h.sent.length,1);assert.equal(h.storage.size,1);
 await h.events.submit({preventDefault(){}});assert.equal(h.sent.length,2);assert.deepEqual(h.sent[0],h.sent[1]);assert.equal(h.sent[0].fields.permission.confirmed,true);assert.equal(h.status.dataset.state,'saved');assert.equal(h.storage.size,0);
});
test('changing page language preserves message language and requires renewed purpose acknowledgment',()=>{
 const h=harness();h.controls.language.value='en';h.link.click({preventDefault(){}});assert.equal(h.html.lang,'he');assert.equal(h.controls.language.value,'en');assert.equal(h.controls.purposeConsent.checked,false);assert.equal(h.history[0],'/he/join?utm_source=facebook');
});
test('reopened unknown operation cannot silently start another inquiry',()=>{
 const h=harness({stored:true});assert.equal(h.button.disabled,true);assert.equal(h.events.submit,undefined);assert.equal(h.status.dataset.state,'unknown');assert.equal(h.sent.length,0);
});
