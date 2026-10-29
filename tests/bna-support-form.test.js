'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync('public/js/bna-support-interest.js','utf8');
const {renderSupportPage}=require('../src/lib/bna/support-page');
function harness({stored=false,changed=false,storageFails=false}={}){
 const controls=Object.fromEntries(['name','contactChannel','contact','purpose','language','areaOfInterest','question','emailUpdates','purposeConsent'].map(name=>[name,{value:'',checked:false,disabled:false,addEventListener(type,fn){this[type]=fn;}}]));
 controls.name.value='Synthetic supporter';controls.contactChannel.value='email';controls.contact.value='support@example.invalid';controls.purpose.value='support_conversation';controls.purposeConsent.checked=true;
 const button={disabled:false},status={textContent:'',dataset:{}},events={},sent=[],storage=new Map(stored?[['bna-support-unconfirmed-operation-v1','synthetic-previous-operation']]:[]);
 class Form{constructor(){this.elements={namedItem:name=>controls[name]};}querySelector(){return button;}querySelectorAll(){return Object.values(controls);}addEventListener(type,fn){events[type]=fn;}reportValidity(){return true;}reset(){}}
 const form=new Form(),html={lang:'en',dir:'ltr',dataset:{}},link={dataset:{enHref:'/support',heHref:'/he/support'},addEventListener(type,fn){this[type]=fn;}},cta={dataset:{supportPurpose:'project_updates'},addEventListener(type,fn){this[type]=fn;}};let fail=true;
 vm.runInNewContext(source,{HTMLFormElement:Form,document:{documentElement:html,referrer:'',querySelector:s=>s==='#support-interest-form'?form:status,querySelectorAll:s=>s==='[data-lang-toggle]'?[link]:[cta]},location:{search:''},history:{replaceState(){}},URL,URLSearchParams,crypto:{randomUUID:()=>'00000000-0000-4000-8000-000000000123'},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(storageFails)throw Error();storage.set(k,v);},removeItem:k=>storage.delete(k)},setTimeout:fn=>fn(),fetch:async(url,options={})=>{
  if(!options.method)return {ok:true,json:async()=>({data:{challenge:'synthetic',notice:{version:changed?'changed':'BNA-SUPPORT-INTEREST-20261029-v1',en:'Please keep my support inquiry privately and contact me using the details I provided. I have read the Privacy Policy.',he:'נא לשמור את פניית התמיכה שלי באופן פרטי וליצור איתי קשר באמצעות הפרטים שמסרתי. קראתי את מדיניות הפרטיות.'},updatesNotice:{version:'BNA-SUPPORT-UPDATES-20261029-v1',en:'Send me BNA project updates by email. I can unsubscribe at any time.',he:'שלחו לי עדכונים על פרויקט בני נביאים בדוא״ל. אוכל להסיר את ההרשמה בכל עת.'}}})};
  sent.push(JSON.parse(options.body));if(fail){fail=false;throw Error('response lost');}return {ok:true,status:200,json:async()=>({data:{saved:true,reference:'synthetic-support-reference'}})};
 }});
 return {controls,status,events,sent,storage,button,link,cta,html};
}
test('unknown support response retries the exact operation without child or gift fields',async()=>{
 const h=harness();await h.events.submit({preventDefault(){}});assert.equal(h.status.dataset.state,'unknown');assert.equal(h.storage.size,1);
 await h.events.submit({preventDefault(){}});assert.deepEqual(h.sent[0],h.sent[1]);assert.equal(h.status.dataset.state,'saved');assert.equal(h.storage.size,0);
 assert.equal(h.sent[0].fields.purpose,'support_conversation');assert.equal(h.sent[0].fields.emailUpdates,false);assert.equal(h.sent[0].fields.childAges,undefined);assert.equal(h.sent[0].fields.donationAmount,undefined);
});
test('updates CTA requires a separate unchecked email choice and never assumes phone permission',async()=>{
 const h=harness();h.cta.click();assert.equal(h.controls.purpose.value,'project_updates');assert.equal(h.controls.emailUpdates.checked,false);assert.equal(h.controls.emailUpdates.required,true);
 await h.events.submit({preventDefault(){}});assert.equal(h.sent.length,0);
 h.controls.emailUpdates.checked=true;h.controls.contactChannel.value='phone';h.controls.contact.value='+12025550129';await h.events.submit({preventDefault(){}});assert.equal(h.sent.length,0);
 h.controls.contactChannel.value='email';h.controls.contact.value='support@example.invalid';await h.events.submit({preventDefault(){}});assert.equal(h.sent[0].fields.updatesPermission.channel,'email');assert.equal(h.sent[0].fields.updatesPermission.confirmed,true);
});
test('language change preserves message preference and clears both acknowledgments',()=>{
 const h=harness();h.controls.language.value='en';h.controls.emailUpdates.checked=true;h.link.click({preventDefault(){}});
 assert.equal(h.html.lang,'he');assert.equal(h.controls.language.value,'en');assert.equal(h.controls.purposeConsent.checked,false);assert.equal(h.controls.emailUpdates.checked,false);
});
test('reopened unknown operation, changed notice and missing recovery storage prevent a new POST',async()=>{
 const reopened=harness({stored:true});assert.equal(reopened.button.disabled,true);assert.equal(reopened.events.submit,undefined);
 for(const config of [{changed:true},{storageFails:true}]){const h=harness(config);await h.events.submit({preventDefault(){}});assert.equal(h.sent.length,0);assert.equal(h.controls.name.disabled,false);}
});
test('support form opens only with its own form/relay gates and an approved configured policy',()=>{
 const ready={BNA_SUPPORT_FORM_ENABLED:'true',BNA_SUPPORT_INTEREST_GATEWAY_ENABLED:'true',BNA_PRIVACY_RELEASE_APPROVED:'true',BNA_PRIVACY_OPERATOR_LEGAL_NAME:'Solomon Dratler',BNA_PRIVACY_EFFECTIVE_DATE:'2026-10-29'};
 assert.ok(renderSupportPage(ready).includes('<fieldset id="support-fields">'));assert.ok(!renderSupportPage(ready).includes('data-support-unavailable'));
 for(const key of Object.keys(ready))assert.ok(renderSupportPage({...ready,[key]:''}).includes('<fieldset disabled id="support-fields">'));
 assert.ok(renderSupportPage({...ready,BNA_PRIVACY_EFFECTIVE_DATE:'2026-02-30'}).includes('<fieldset disabled id="support-fields">'));
});
