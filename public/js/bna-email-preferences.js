(() => {
 'use strict';
 const root=document.querySelector('#email-preferences'),form=document.querySelector('#preferences-form');
 if(!root||!(form instanceof HTMLFormElement))return;
 const fields=document.querySelector('#preferences-fields'),status=document.querySelector('#preferences-status');
 const retry=document.querySelector('#preferences-retry'),reload=document.querySelector('#preferences-read');
 const stopProgram=document.querySelector('#preferences-stop-program'),stopAll=document.querySelector('#preferences-stop-all');
 const updates=form.elements.namedItem('updates'),language=form.elements.namedItem('locale');
 let locale=document.documentElement.lang==='he'?'he':'en',data=null,pending=null,posting=false,unknown=false,markerKey='',savedMessage=null;
 const say=(en,he,state='')=>{savedMessage={en,he,state};status.textContent=locale==='he'?he:en;status.dataset.state=state;};
 function lock(){fields.disabled=posting||unknown||!data||!data.canSubscribe;stopProgram.disabled=posting||unknown||!data;stopAll.disabled=posting||unknown||!data;retry.disabled=posting;retry.hidden=!unknown;reload.hidden=posting||unknown;}
 function render(){if(!data)return;const p=data.preferences;
  document.querySelector('#preferences-program').textContent=locale==='he'?(p.program==='bna_learning_coop'?'קואופרטיב הלמידה':'עדכוני פרויקט ותמיכה'):(p.program==='bna_learning_coop'?'Learning Co-op':'Project and supporter updates');
  document.querySelector('#preferences-current').textContent=locale==='he'?(p.updates?'הרשאה לעדכוני דוא״ל שמורה.':'לא התבקשו עדכוני דוא״ל, או שבוטלה ההרשמה.'):(p.updates?'Email-updates permission is recorded.':'Email updates are not requested or have been unsubscribed.');
  document.querySelector('#preferences-paused').hidden=!p.deliveryPaused;
  document.querySelector('#preferences-notice').textContent=data.notice[locale];
  lock();
 }
 document.querySelectorAll('[data-lang-toggle]').forEach(a=>a.addEventListener('click',event=>{
  event.preventDefault();if(posting||unknown)return;locale=locale==='he'?'en':'he';document.documentElement.lang=locale;document.documentElement.dir=locale==='he'?'rtl':'ltr';document.documentElement.dataset.locale=locale;
  document.title=(locale==='he'?'העדפות דוא״ל':'Email preferences')+' | Bnei Neviim Academy';
  history.replaceState(null,'',(locale==='he'?'/he/email-preferences':'/email-preferences')+location.hash);
  render();if(savedMessage)say(savedMessage.en,savedMessage.he,savedMessage.state);
 }));
 const params=new URLSearchParams(location.hash.slice(1)),token=params.get('token');
 if(location.search||[...params.keys()].join()!=='token'||params.getAll('token').length!==1||!/^[A-Za-z0-9_-]{100,2048}$/.test(token||'')){
  say('Open the personal preference link from your BNA message, or email the office for help.','פתחו את קישור ההעדפות האישי מהודעת בני נביאים, או פנו למשרד בדוא״ל.','error');return;
 }
 if(root.dataset.enabled!=='true'){
  say('Preference management is temporarily unavailable. Email the office to change your choices.','ניהול ההעדפות אינו זמין כעת. אפשר לפנות למשרד בדוא״ל לשינוי הבחירות.','error');return;
 }
 async function request(body){
  const response=await fetch('/api/bna/preferences',{method:'POST',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(25000),
   headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const result=await response.json().catch(()=>null);
  if(!response.ok){const error=Error('PREFERENCE_REQUEST_REJECTED');error.status=response.status;throw error;}
  if(!result?.ok||!result.data)throw Error('PREFERENCE_RESULT_UNCONFIRMED');return result.data;
 }
 function validRead(value){const p=value?.preferences;
  return value&&/^[a-f0-9-]{36}$/i.test(value.inquiryId)&&p&&Number.isSafeInteger(p.version)&&p.version>=0&&['bna_learning_coop','bna_support_interest'].includes(p.program)&&
   ['en','he'].includes(p.locale)&&typeof p.updates==='boolean'&&typeof p.deliveryPaused==='boolean'&&typeof value.canSubscribe==='boolean'&&
   value.notice?.version==='BNA-EMAIL-PREFERENCES-20261029-v1'&&['en','he'].every(lang=>typeof value.notice[lang]==='string'&&value.notice[lang].length<=400);
 }
 async function read(){
  const value=await request({action:'read',token});if(!validRead(value))throw Error('PREFERENCE_READ_UNCONFIRMED');data=value;
  if(!pending){updates.checked=value.preferences.updates;language.value=value.preferences.locale;}render();
 }
 async function load(){if(posting||unknown)return;posting=true;lock();
  try{await read();say('Your current preferences are shown.','ההעדפות הנוכחיות שלכם מוצגות.');}
  catch{data=null;say('Preferences could not be read. Use this link again or email the office.','לא ניתן לקרוא את ההעדפות. נסו שוב את הקישור או פנו למשרד בדוא״ל.','error');}
  finally{posting=false;lock();}
 }
 function persist(command){sessionStorage.setItem(markerKey,JSON.stringify(command));if(sessionStorage.getItem(markerKey)!==JSON.stringify(command))throw Error('PREFERENCE_RECOVERY_UNAVAILABLE');}
 function clear(){pending=null;unknown=false;try{sessionStorage.removeItem(markerKey);}catch{}}
 async function save(command){if(posting)return;const previouslyUnknown=unknown;
  try{persist(command);}catch{say('This browser could not preserve a safe recovery reference. Email the office to change your preferences.','הדפדפן לא הצליח לשמור מספר פעולה לשחזור בטוח. אפשר לפנות למשרד בדוא״ל לשינוי ההעדפות.','error');return;}
  posting=true;pending=command;unknown=true;lock();
  try{
   const result=await request({action:'update',token,command});
   if(!result.preferences||!Number.isSafeInteger(result.preferences.version)||result.preferences.version<command.expectedVersion+1||typeof result.replayed!=='boolean')throw Error('PREFERENCE_SAVE_UNCONFIRMED');
   clear();
   say('Your preference change is saved.','שינוי ההעדפה נשמר.','saved');
   try{await read();}catch{data=null;say('Your change is saved. The current preference display could not be reloaded.','השינוי נשמר. לא ניתן לטעון מחדש את תצוגת ההעדפות הנוכחית.','saved');}
  }catch(error){
   if(!previouslyUnknown&&[400,401,403,404,409].includes(error.status)){
    clear();data=null;say('The change was not accepted. Reload your current preferences before trying again.','השינוי לא התקבל. יש לטעון את ההעדפות הנוכחיות לפני ניסיון נוסף.','error');
   }else say('The result is unconfirmed. Retry the same change to recover its saved result.','התוצאה לא אושרה. יש לנסות שוב את אותו שינוי כדי לקרוא את התוצאה השמורה.','unknown');
  }finally{posting=false;lock();}
 }
 function command(action,off=false){if(!data||posting||unknown)return null;
  const base={inquiryId:data.inquiryId,operationId:crypto.randomUUID(),expectedVersion:data.preferences.version,action};
  return action==='unsubscribe_all'?base:{...base,updates:off?false:updates.checked,locale:language.value,noticeVersion:data.notice.version,noticeLanguage:locale};
 }
 form.addEventListener('submit',event=>{event.preventDefault();const next=command('set_preferences');if(next)void save(next);});
 stopProgram.addEventListener('click',()=>{const next=command('set_preferences',true);if(next)void save(next);});
 stopAll.addEventListener('click',()=>{const next=command('unsubscribe_all');if(next)void save(next);});
 retry.addEventListener('click',()=>{if(pending)void save(pending);});reload.addEventListener('click',()=>void load());
 function validPending(value){return value&&/^[a-f0-9-]{36}$/i.test(value.inquiryId)&&/^[a-f0-9-]{36}$/i.test(value.operationId)&&Number.isSafeInteger(value.expectedVersion)&&value.expectedVersion>=0&&
  (value.action==='unsubscribe_all'||value.action==='set_preferences'&&typeof value.updates==='boolean'&&['en','he'].includes(value.locale)&&value.noticeVersion==='BNA-EMAIL-PREFERENCES-20261029-v1'&&['en','he'].includes(value.noticeLanguage));}
 (async()=>{
  try{
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));markerKey='bna-preference-operation-v1:'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
   const prior=sessionStorage.getItem(markerKey);
   if(prior){const saved=JSON.parse(prior);if(!validPending(saved))throw Error('PREFERENCE_RECOVERY_INVALID');pending=saved;unknown=true;
    say('An earlier change is unconfirmed. Retry that same change before a new action.','שינוי קודם לא אושר. יש לנסות שוב את אותו שינוי לפני פעולה חדשה.','unknown');lock();return;}
   await load();
  }catch{say('Preferences could not be opened safely. Email the office for help.','לא ניתן לפתוח את ההעדפות בבטחה. אפשר לפנות למשרד בדוא״ל לעזרה.','error');}
 })();
})();
