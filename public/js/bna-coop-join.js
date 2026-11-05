(() => {
'use strict';
const form=document.querySelector('#coop-interest-form');if(!(form instanceof HTMLFormElement))return;
const locale=document.documentElement.lang==='he'?'he':'en',he=locale==='he',status=document.querySelector('#coop-status'),submit=form.querySelector('[type=submit]'),retry=document.querySelector('#retry-interest'),fieldset=document.querySelector('#coop-fields');
const input=name=>form.elements.namedItem(name),value=name=>String(input(name)?.value||'').trim(),endpoint='/api/bna/coop-interest',key='bna-interest-operation-20261105-v1';
const notice={version:'BNA-INTEREST-LAUNCH-20261105-v1',en:'Please contact me about the BNA program or programs I selected using the details I provided. I have read the Privacy Notice.',he:'אבקש ליצור איתי קשר בנוגע לתוכנית או לתוכניות של BNA שבחרתי, באמצעות הפרטים שמסרתי. קראתי את הודעת הפרטיות.'};
let operationId=crypto.randomUUID(),recoveryToken=crypto.randomUUID(),pending=null,posting=false,unknown=false;
const say=(en,heb,state)=>{status.textContent=he?heb:en;status.dataset.state=state;};
const remember=item=>{sessionStorage.setItem(key,JSON.stringify(item));if(!sessionStorage.getItem(key))throw Error('RECOVERY_UNAVAILABLE');};
const lock=state=>{fieldset.disabled=state;};
function sync(){input('phone').required=value('contactChannel')!=='email';for(const [program,checkbox]of[['pod','podUpdates'],['academy','academyUpdates']]){const visible=value('program')===program||value('program')==='both';document.querySelector('[data-'+program+'-updates]').hidden=!visible;input(checkbox).disabled=!visible;if(!visible)input(checkbox).checked=false;}}
input('program').addEventListener('change',sync);input('contactChannel').addEventListener('change',sync);
const params=new URLSearchParams(location.search),selected=params.get('interest');if(['pod','academy','both'].includes(selected))input('program').value=selected;sync();
const attribution={};for(const[param,target]of[['utm_campaign','campaign'],['utm_source','source'],['utm_medium','medium'],['utm_content','content'],['group_ref','groupRef'],['post_ref','postRef']]){const item=params.get(param);if(item&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(item))attribution[target]=item;}
document.querySelectorAll('[data-language-link]').forEach(link=>{link.href+=location.search;link.addEventListener('click',event=>{if(posting||unknown)event.preventDefault();});});
function showSaved(result){
if(typeof result?.reference!=='string'||!/^[a-f0-9-]{36}$/i.test(result.reference))throw Error('INVALID_REFERENCE');
unknown=false;pending=null;fieldset.hidden=true;retry.hidden=true;status.replaceChildren();status.dataset.state='saved';
const heading=document.createElement('h2');heading.textContent=he?'ההתעניינות שלכם נשמרה':'Your Interest Has Been Saved';
const body=document.createElement('p');body.textContent=he?'תודה. שלומי ייצור קשר באמצעות הפרטים שמסרתם כדי לשוחח על לימודו של בנכם, על האזור שלכם ועל התוכנית שבחרתם.':"Thank you. Shloimie will follow up using the contact details you provided to discuss your son's learning, your area, and the program you selected.";
const reference=document.createElement('span');reference.className='reference';reference.textContent=(he?'מספר הפנייה: ':'Inquiry reference: ')+result.reference;
const email=document.createElement('p'),state=result.email?.state;
email.textContent=['provider_accepted','sent'].includes(state)?(he?'הודעת האישור התקבלה אצל ספק הדוא״ל.':'Your confirmation email has been accepted by the email provider.'):state==='delivered'?(he?'מסירת הודעת האישור אושרה.':'Delivery of your confirmation email has been confirmed.'):['queued','sending'].includes(state)?(he?'הודעת האישור ממתינה לשליחה.':'Your confirmation email is pending.'):(he?'הפנייה שלכם נשמרה. לא נשלחה תשובה אוטומטית.':'Your inquiry has been saved. No automatic reply has been sent.');
if(state==='unknown')email.textContent=he?'הפנייה נשמרה. לא ניתן לאשר עדיין את מצב שליחת הדוא״ל.':'Your inquiry has been saved. The email outcome has not yet been confirmed.';
const back=document.createElement('a');back.href=he?'/he':'/';back.textContent=he?'חזרה ל־BNA':'Back to BNA';status.append(heading,body,reference,email,back);status.focus();
}
function details(){return{program:value('program'),name:value('name'),email:value('email').toLowerCase(),phone:value('phone').replace(/[ ().-]/g,''),contactChannel:value('contactChannel'),language:value('language'),siteLanguage:locale,area:value('area'),preferredArea:value('preferredArea'),childAges:[value('childAge'),value('otherChildAge')].filter(Boolean).map(Number),learningArrangement:value('learningArrangement'),torahExperience:value('torahExperience'),question:value('question'),articleUpdates:input('articleUpdates').checked,podUpdates:input('podUpdates').checked,academyUpdates:input('academyUpdates').checked,permission:{confirmed:input('purposeConsent').checked,version:notice.version,language:locale}};}
async function recover(marker){
posting=true;lock(true);submit.disabled=true;say('Checking your previous submission…','בודקים את הפנייה הקודמת…','saving');
try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'recover',operationId:marker.operationId,recoveryToken:marker.recoveryToken}),credentials:'omit',cache:'no-store'});const result=(await response.json().catch(()=>null))?.data;if(response.ok&&result?.saved){showSaved(result);return;}throw Error('RECOVERY_UNAVAILABLE');}
catch{unknown=true;say('The previous save could not be confirmed. Please contact Shloimie with operation reference '+marker.operationId+'.','לא ניתן לאשר את השמירה הקודמת. פנו לשלומי עם מספר הפעולה '+marker.operationId+'.','unknown');retry.hidden=false;retry.onclick=()=>recover(marker);}
finally{posting=false;}
}
async function save(event){
event?.preventDefault();if(posting||fieldset.disabled&&!unknown||!unknown&&!form.reportValidity())return;
if(!pending)pending={operationId,recoveryToken,fields:details(),...(Object.keys(attribution).length?{attribution}:{})};
posting=true;submit.disabled=true;retry.hidden=true;lock(true);let posted=unknown;say('Saving your interest…','שומרים את הפנייה…','saving');
try{
const offerResponse=await fetch(endpoint,{headers:{Accept:'application/json'},credentials:'omit',cache:'no-store'});if(!offerResponse.ok)throw Error('UNAVAILABLE');const offer=(await offerResponse.json())?.data;
if(!offer?.challenge||!unknown&&(offer.notice?.version!==notice.version||offer.notice?.[locale]!==notice[locale]))throw Error('NOTICE_CHANGED');
await new Promise(resolve=>setTimeout(resolve,Math.max(1300,Math.min(5000,Number(offer.minWaitMs)||1300))));
remember({operationId,recoveryToken});posted=true;
const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...pending,challenge:offer.challenge}),credentials:'omit',cache:'no-store'});const body=await response.json().catch(()=>null);
if(response.ok&&body?.data?.saved){showSaved(body.data);return;}
if([400,403,413,422].includes(response.status)&&!unknown){sessionStorage.removeItem(key);pending=null;lock(false);sync();say(body?.error==='INVALID_EMAIL'?'Enter a valid email address.':body?.error==='PHONE_REQUIRED'?'Enter a phone number with its country code.':'Your details have not been saved. Please review the form and try again. Your answers are still here.',body?.error==='INVALID_EMAIL'?'הזינו כתובת דוא״ל תקינה.':body?.error==='PHONE_REQUIRED'?'הזינו מספר טלפון הכולל קידומת מדינה.':'הפרטים לא נשמרו. בדקו את הטופס ונסו שוב. התשובות שלכם עדיין כאן.','error');}
else throw Error('UNKNOWN');
}catch(error){unknown=posted;if(!unknown){pending=null;lock(false);sync();}say(unknown?'The save could not be confirmed. Retry this same submission without changing your answers.':error.message==='NOTICE_CHANGED'?'The privacy notice has changed. Please review the current form before submitting. Your answers are still here.':'The form is temporarily unavailable. Your answers are still here.',unknown?'לא ניתן לאשר שהפנייה נשמרה. נסו שוב את אותה פנייה בלי לשנות את התשובות.':error.message==='NOTICE_CHANGED'?'הודעת הפרטיות השתנתה. יש לעיין בטופס העדכני לפני השליחה. התשובות עדיין כאן.':'הטופס אינו זמין כעת. התשובות עדיין כאן.',unknown?'unknown':'error');retry.hidden=!unknown;}
finally{posting=false;if(!fieldset.hidden)submit.disabled=unknown;}
}
form.addEventListener('submit',save);retry.addEventListener('click',()=>{if(pending)save();});
try{const legacy=sessionStorage.getItem('bna-coop-unconfirmed-operation-v1');if(legacy){lock(true);submit.disabled=true;unknown=true;say('A previous inquiry is awaiting confirmation. Please contact Shloimie with operation reference '+legacy+'.','פנייה קודמת ממתינה לאישור. פנו לשלומי עם מספר הפעולה '+legacy+'.','unknown');return;}
const marker=JSON.parse(sessionStorage.getItem(key)||'null');if(marker?.operationId&&marker?.recoveryToken){operationId=marker.operationId;recoveryToken=marker.recoveryToken;recover(marker);}}
catch{/* Storage availability is checked before any POST. */}
})();
