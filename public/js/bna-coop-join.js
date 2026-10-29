(() => {
  'use strict';
  const form=document.querySelector('#coop-interest-form');if(!(form instanceof HTMLFormElement))return;
  let locale=document.documentElement.lang==='he'?'he':'en';const status=document.querySelector('#coop-status');
  const input=name=>form.elements.namedItem(name),value=name=>String(input(name)?.value||'').trim();
  const submit=form.querySelector('[type=submit]'),markerKey='bna-coop-unconfirmed-operation-v1';
  let operationId=crypto.randomUUID(),pending=null,unknown=false,posting=false;
  input('language').value=locale;
  document.querySelectorAll('[data-lang-toggle]').forEach(a=>{const sync=()=>{a.href=locale==='he'?a.dataset.enHref:a.dataset.heHref;};sync();a.addEventListener('click',event=>{event.preventDefault();if(unknown||posting)return;locale=locale==='en'?'he':'en';document.documentElement.lang=locale;document.documentElement.dir=locale==='he'?'rtl':'ltr';document.documentElement.dataset.locale=locale;input('purposeConsent').checked=false;history.replaceState(null,'',(locale==='he'?a.dataset.heHref:a.dataset.enHref)+(location.search||''));sync();});});
  const say=(en,he,state)=>{status.textContent=locale==='he'?he:en;status.dataset.state=state;};
  const lock=locked=>form.querySelectorAll('input,select,textarea').forEach(node=>{node.disabled=locked;});
  const clearMarker=()=>{try{sessionStorage.removeItem(markerKey);}catch{}};
  const normalizedPhone=raw=>{const digits=raw.replace(/\D/g,'');return digits.length===10?'+1'+digits:'+'+digits;};
  const syncContact=()=>{const email=value('contactChannel')==='email';input('contact').type=email?'email':'tel';input('contact').autocomplete=email?'email':'tel';input('secondaryContact').type=email?'tel':'email';input('secondaryContact').autocomplete=email?'tel':'email';};
  input('contactChannel').addEventListener('change',syncContact);syncContact();
  function fields(){const channel=value('contactChannel'),other=value('secondaryContact'),secondChannel=channel==='email'?'phone':'email';
    return {name:value('name'),contactChannel:channel,contact:channel==='phone'?normalizedPhone(value('contact')):value('contact').toLowerCase(),
      ...(other?{secondaryContact:{channel:secondChannel,value:secondChannel==='phone'?normalizedPhone(other):other.toLowerCase()}}:{}),
      language:value('language'),siteLanguage:locale,townOrZip:value('townOrZip'),childAges:[value('childAge'),value('otherChildAge')].filter(Boolean).map(Number),
      ...(value('availability')?{availability:value('availability')}:{}),...(value('question')?{question:value('question')}:{}),
      emailUpdates:input('emailUpdates').checked,permission:{confirmed:input('purposeConsent').checked,version:'BNA-COOP-INTEREST-20261029-v2',language:locale}};
  }
  const attribution={};const params=new URLSearchParams(location.search);
  for(const [key,target] of [['utm_campaign','campaign'],['utm_source','source'],['utm_medium','medium'],['utm_content','content'],['group_ref','groupRef'],['post_ref','postRef']]){
    const item=params.get(key);if(item&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(item))attribution[target]=item;
  }
  if(document.referrer){try{const ref=new URL(document.referrer);if(ref.origin!==location.origin&&/^https?:$/.test(ref.protocol)&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(ref.hostname))attribution.referral=ref.hostname;}catch{}}
  try{const marker=sessionStorage.getItem(markerKey);if(marker){operationId=marker;lock(true);submit.disabled=true;say('A previous submission could not be confirmed after the page was reopened. Please contact Shloimie with reference '+marker+'.','לא ניתן לאשר פנייה קודמת לאחר פתיחה מחדש. פנו לשלומי עם מספר הפעולה '+marker+'.','unknown');return;}}catch{}
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(posting||(!unknown&&!form.reportValidity()))return;
    if(!pending){const details=fields();if(details.emailUpdates&&details.contactChannel!=='email'&&details.secondaryContact?.channel!=='email'){say('Add an email address to request email updates.','יש להוסיף כתובת דוא״ל לקבלת עדכונים.','error');return;}
      pending={operationId,fields:details,...(Object.keys(attribution).length?{attribution}:{})};}
    posting=true;submit.disabled=true;lock(true);say('Saving your interest…','שומרים את הפנייה…','saving');let posted=unknown;
    try{
      const response=await fetch('/api/bna/coop-interest',{headers:{Accept:'application/json'},cache:'no-store',credentials:'omit'});
      if(!response.ok)throw Error('CHALLENGE_UNAVAILABLE');const challenge=(await response.json())?.data?.challenge;if(typeof challenge!=='string'||!challenge)throw Error('CHALLENGE_INVALID');
      await new Promise(resolve=>setTimeout(resolve,1600));
      try{sessionStorage.setItem(markerKey,operationId);if(sessionStorage.getItem(markerKey)!==operationId)throw Error();}catch{throw Error('RECOVERY_STORAGE_UNAVAILABLE');}
      posted=true;const saved=await fetch('/api/bna/coop-interest',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...pending,challenge}),cache:'no-store',credentials:'omit'});
      const result=(await saved.json().catch(()=>null))?.data;
      if(saved.ok&&result?.saved===true&&typeof result.reference==='string'){clearMarker();unknown=false;pending=null;form.reset();input('language').value=locale;syncContact();lock(false);operationId=crypto.randomUUID();say(`Your interest has been saved. Shloimie will follow up using the contact details you provided. Your reference is ${result.reference}.`,`ההתעניינות שלכם נשמרה. שלומי יחזור אליכם באמצעות פרטי הקשר שמסרתם. מספר הפנייה: ${result.reference}.`,'saved');}
      else if(saved.status>=400&&saved.status<500&&!unknown){clearMarker();pending=null;operationId=crypto.randomUUID();lock(false);say('Your details have not been saved. Please try again. Your answers are still here.','הפרטים לא נשמרו. נסו שוב. התשובות שלכם עדיין מופיעות כאן.','error');}
      else{unknown=true;say('The save could not be confirmed. Retry this same submission without changing your answers.','לא ניתן לאשר שהפנייה נשמרה. נסו שוב את אותה פנייה בלי לשנות את התשובות.','unknown');}
    }catch{unknown=posted;if(!unknown){pending=null;clearMarker();lock(false);}say(posted?'The save could not be confirmed. Retry this same submission without changing your answers.':'The form is temporarily unavailable. Your answers are still here.',posted?'לא ניתן לאשר שהפנייה נשמרה. נסו שוב את אותה פנייה בלי לשנות את התשובות.':'הטופס אינו זמין כעת. התשובות עדיין כאן.',posted?'unknown':'error');}
    finally{posting=false;submit.disabled=false;}
  });
})();
