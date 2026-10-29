(() => {
 'use strict';
 const form=document.querySelector('#support-interest-form');if(!(form instanceof HTMLFormElement))return;
 let locale=document.documentElement.lang==='he'?'he':'en';const status=document.querySelector('#support-status');
 const input=name=>form.elements.namedItem(name),value=name=>String(input(name)?.value||'').trim();
 const submit=form.querySelector('[type=submit]'),markerKey='bna-support-unconfirmed-operation-v1';
 const notice={version:'BNA-SUPPORT-INTEREST-20261029-v1',en:'Please keep my support inquiry privately and contact me using the details I provided. I have read the Privacy Policy.',he:'נא לשמור את פניית התמיכה שלי באופן פרטי וליצור איתי קשר באמצעות הפרטים שמסרתי. קראתי את מדיניות הפרטיות.'};
 const updatesNotice={version:'BNA-SUPPORT-UPDATES-20261029-v1',en:'Send me BNA project updates by email. I can unsubscribe at any time.',he:'שלחו לי עדכונים על פרויקט בני נביאים בדוא״ל. אוכל להסיר את ההרשמה בכל עת.'};
 let operationId=crypto.randomUUID(),pending=null,unknown=false,posting=false;
 input('language').value=locale;
 document.querySelectorAll('[data-lang-toggle]').forEach(a=>{const sync=()=>{a.href=locale==='he'?a.dataset.enHref:a.dataset.heHref;};sync();a.addEventListener('click',event=>{event.preventDefault();if(unknown||posting)return;locale=locale==='en'?'he':'en';document.documentElement.lang=locale;document.documentElement.dir=locale==='he'?'rtl':'ltr';document.documentElement.dataset.locale=locale;input('purposeConsent').checked=false;input('emailUpdates').checked=false;history.replaceState(null,'',(locale==='he'?a.dataset.heHref:a.dataset.enHref)+(location.search||''));sync();});});
 const say=(en,he,state)=>{status.textContent=locale==='he'?he:en;status.dataset.state=state;};
 const lock=locked=>form.querySelectorAll('input,select,textarea').forEach(node=>{node.disabled=locked;});
 const clearMarker=()=>{try{sessionStorage.removeItem(markerKey);}catch{}};
 const syncPurpose=()=>{input('emailUpdates').required=value('purpose')==='project_updates';};
 input('purpose').addEventListener('change',syncPurpose);syncPurpose();
 document.querySelectorAll('[data-support-purpose]').forEach(a=>a.addEventListener('click',()=>{if(unknown||posting)return;input('purpose').value=a.dataset.supportPurpose;syncPurpose();}));
 const syncContact=()=>{const email=value('contactChannel')==='email';input('contact').type=email?'email':'tel';input('contact').autocomplete=email?'email':'tel';};
 input('contactChannel').addEventListener('change',syncContact);syncContact();
 function fields(){const channel=value('contactChannel'),raw=value('contact'),digits=raw.replace(/\D/g,'');
  return {name:value('name'),contactChannel:channel,contact:channel==='phone'?(digits.length===10?'+1'+digits:'+'+digits):raw.toLowerCase(),
   purpose:value('purpose'),language:value('language'),siteLanguage:locale,
   ...(value('areaOfInterest')?{areaOfInterest:value('areaOfInterest')}:{}),...(value('question')?{question:value('question')}:{}),
   emailUpdates:input('emailUpdates').checked,
   permission:{confirmed:input('purposeConsent').checked,version:notice.version,language:locale},
   ...(input('emailUpdates').checked?{updatesPermission:{confirmed:true,channel:'email',version:updatesNotice.version,language:locale}}:{})};
 }
 const attribution={};const params=new URLSearchParams(location.search);
 for(const [key,target] of [['utm_campaign','campaign'],['utm_source','source'],['utm_medium','medium'],['utm_content','content'],['group_ref','groupRef'],['post_ref','postRef']]){const item=params.get(key);if(item&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(item))attribution[target]=item;}
 if(document.referrer){try{const ref=new URL(document.referrer);if(ref.origin!==location.origin&&/^https?:$/.test(ref.protocol)&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(ref.hostname))attribution.referral=ref.hostname;}catch{}}
 try{const marker=sessionStorage.getItem(markerKey);if(marker){operationId=marker;lock(true);submit.disabled=true;say('A previous support inquiry could not be confirmed after the page was reopened. Please contact Shloimie with reference '+marker+'.','לא ניתן לאשר פניית תמיכה קודמת לאחר פתיחה מחדש. פנו לשלומי עם מספר הפעולה '+marker+'.','unknown');return;}}catch{}
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(posting||(!unknown&&!form.reportValidity()))return;
  if(!pending){const details=fields();if((details.emailUpdates&&details.contactChannel!=='email')||(details.purpose==='project_updates'&&!details.emailUpdates)){say('Project updates require an email reply address and your explicit email choice.','עדכוני הפרויקט דורשים כתובת דוא״ל ובחירה מפורשת בקבלת עדכונים.','error');return;}
   pending={operationId,fields:details,...(Object.keys(attribution).length?{attribution}:{})};}
  posting=true;submit.disabled=true;lock(true);say('Saving your support inquiry…','שומרים את פניית התמיכה…','saving');let posted=unknown;
  try{
   const response=await fetch('/api/bna/support-interest',{headers:{Accept:'application/json'},cache:'no-store',credentials:'omit'});
   if(!response.ok)throw Error('CHALLENGE_UNAVAILABLE');const offer=(await response.json())?.data,challenge=offer?.challenge;if(typeof challenge!=='string'||!challenge)throw Error('CHALLENGE_INVALID');
   if(!unknown&&(offer.notice?.version!==notice.version||offer.notice?.[locale]!==notice[locale]||offer.updatesNotice?.version!==updatesNotice.version||offer.updatesNotice?.[locale]!==updatesNotice[locale]))throw Error('NOTICE_CHANGED');
   await new Promise(resolve=>setTimeout(resolve,1600));
   try{sessionStorage.setItem(markerKey,operationId);if(sessionStorage.getItem(markerKey)!==operationId)throw Error();}catch{throw Error('RECOVERY_STORAGE_UNAVAILABLE');}
   posted=true;const saved=await fetch('/api/bna/support-interest',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...pending,challenge}),cache:'no-store',credentials:'omit'});
   const result=(await saved.json().catch(()=>null))?.data;
   if(saved.ok&&result?.saved===true&&typeof result.reference==='string'){clearMarker();unknown=false;pending=null;form.reset();input('language').value=locale;syncContact();syncPurpose();lock(false);operationId=crypto.randomUUID();say('Your support inquiry has been saved. Shloimie will follow up. Your reference is '+result.reference+'.','פניית התמיכה נשמרה. שלומי יחזור אליכם. מספר הפנייה: '+result.reference+'.','saved');}
   else if(saved.status>=400&&saved.status<500&&!unknown){clearMarker();pending=null;operationId=crypto.randomUUID();lock(false);say('Your details have not been saved. Please check your answers and try again.','הפרטים לא נשמרו. יש לבדוק את התשובות ולנסות שוב.','error');}
   else{unknown=true;say('The save could not be confirmed. Retry this same submission without changing your answers.','לא ניתן לאשר שהפנייה נשמרה. נסו שוב את אותה פנייה בלי לשנות את התשובות.','unknown');}
  }catch(error){unknown=posted;if(!unknown){pending=null;clearMarker();lock(false);}if(!posted&&error?.message==='NOTICE_CHANGED')say('The privacy notice has changed. Please review the current form before submitting. Your answers are still here.','הודעת הפרטיות השתנתה. יש לעיין בטופס העדכני לפני השליחה. התשובות עדיין כאן.','error');
   else say(posted?'The save could not be confirmed. Retry this same submission without changing your answers.':'The form is temporarily unavailable. Your answers are still here.',posted?'לא ניתן לאשר שהפנייה נשמרה. נסו שוב את אותה פנייה בלי לשנות את התשובות.':'הטופס אינו זמין כעת. התשובות עדיין כאן.',posted?'unknown':'error');}
  finally{posting=false;submit.disabled=false;}
 });
})();
