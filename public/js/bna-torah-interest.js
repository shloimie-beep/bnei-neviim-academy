(() => {
  'use strict';
  const contact = Object.freeze({ display: '+1 (305) 491-6674', international: '+13054916674', tel: 'tel:+13054916674', whatsapp: 'https://wa.me/13054916674' });
  const root = document.documentElement;
  const isHebrewPath = /^\/he(?:\/|$)/.test(location.pathname);
  const locale = isHebrewPath ? 'he' : 'en';
  root.dataset.locale = locale; root.lang = locale; root.dir = locale === 'he' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-bna-phone]').forEach(node => { node.textContent = contact.display; node.dir = 'ltr'; if (node instanceof HTMLAnchorElement) node.href = contact.tel; });
  const message = locale === 'he' ? 'שלום, אני רוצה לברר על קבוצת התורה הראשונה בבוקר של בני נביאים. אנא חזרו אליי.' : 'Hello, I would like to ask about the first BNA Torah-morning group. Please contact me.';
  document.querySelectorAll('[data-bna-whatsapp]').forEach(node => { if (node instanceof HTMLAnchorElement) node.href = `${contact.whatsapp}?text=${encodeURIComponent(message)}`; });
  document.querySelectorAll('[data-bna-lang-link]').forEach(node => { if (node instanceof HTMLAnchorElement) node.href = locale === 'he' ? node.dataset.enHref : node.dataset.heHref; });
  if (location.pathname === '/' || location.pathname === '/he') {
    const schema = document.createElement('script'); schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({ '@context':'https://schema.org', '@type':'EducationalOrganization', name:'Bnei Neviim Academy', url:'https://bneineviimacademy.org/', telephone:contact.international, contactPoint:{ '@type':'ContactPoint', telephone:contact.international, contactType:'inquiries' } });
    document.head.appendChild(schema);
  }

  const form = document.querySelector('#torah-interest-form');
  if (!(form instanceof HTMLFormElement)) return;
  form.elements.namedItem('language').value = locale;
  const syncConsentLanguage = () => { const language = form.elements.namedItem('language').value; form.querySelectorAll('[data-consent-lang]').forEach(node => { node.hidden = node.dataset.consentLang !== language; }); };
  form.elements.namedItem('language').addEventListener('change', () => { form.elements.namedItem('purposeConsent').checked = false; syncConsentLanguage(); });
  syncConsentLanguage();
  const status = document.querySelector('#save-status');
  const submit = form.querySelector('[type=submit]');
  let operationId = crypto.randomUUID(), attempted = null, unknown = false;
  const pendingKey = 'bna-torah-interest-pending-v1';
  const say = (en, he, state) => { status.textContent = locale === 'he' ? he : en; status.dataset.state = state; };
  const lockFields = locked => form.querySelectorAll('input,select,textarea').forEach(node => { node.disabled = locked; });
  const clearPending = () => { try { sessionStorage.removeItem(pendingKey); } catch {} };
  const get = name => String(new FormData(form).get(name) || '').trim();
  const attribution = {source:'bna_site'};
  const query = new URLSearchParams(location.search);
  for (const [key, tag] of [['utm_campaign','campaign'],['utm_source','source'],['utm_content','content'],['ref','referral'],['post_ref','postRef']]) {
    const value = query.get(key);
    if (value && /^[A-Za-z0-9_.:-]{1,100}$/.test(value)) attribution[tag] = value;
  }
  if (!attribution.referral && document.referrer) {
    try { const source = new URL(document.referrer); if (source.origin !== location.origin && /^https?:$/.test(source.protocol) && /^[A-Za-z0-9_.:-]{1,100}$/.test(source.hostname)) attribution.referral = source.hostname; } catch {}
  }
  function fields() {
    const ages = [get('childAge'),get('otherChildAge')].filter(Boolean).map(Number);
    const channel = get('contactChannel'), rawContact = get('contact');
    const digits = rawContact.replace(/\D/g,'');
    const normalizedPhone = digits.length === 10 ? '+1' + digits : '+' + digits;
    return { name:get('name'), contactChannel:channel, contact:channel === 'phone' ? normalizedPhone : rawContact.toLowerCase(), language:get('language'), townOrZip:get('townOrZip'), childAges:ages,
      ...(get('readiness') ? {readiness:get('readiness')} : {}), ...(get('availability') ? {availability:get('availability')} : {}),
      ...(get('startPreference') ? {startPreference:get('startPreference')} : {}), ...(get('question') ? {question:get('question')} : {}),
      permission:{confirmed:form.elements.namedItem('purposeConsent').checked,version:'BNA-TORAH-MORNING-INTEREST-20261028-v1',language:get('language')} };
  }
  function setContactInput() {
    const input = form.elements.namedItem('contact');
    if (!(input instanceof HTMLInputElement)) return;
    const email = get('contactChannel') === 'email';
    input.type = email ? 'email' : 'tel'; input.autocomplete = email ? 'email' : 'tel'; input.inputMode = email ? 'email' : 'tel';
    input.placeholder = email ? 'name@example.com' : '+1 305 555 0100';
  }
  form.elements.namedItem('contactChannel')?.addEventListener('change', setContactInput);
  setContactInput();
  try {
    const stored = sessionStorage.getItem(pendingKey);
    let pendingId = stored;
    // Older versions stored a full payload. Reduce it to the operation ID.
    if (stored?.startsWith('{')) { try { pendingId = JSON.parse(stored)?.operationId; } catch { pendingId = null; } }
    if (typeof pendingId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pendingId)) {
      try { sessionStorage.setItem(pendingKey, pendingId); } catch {} lockFields(true); submit.disabled = true;
      say(`We could not confirm your earlier inquiry. Please call +1 (305) 491-6674 and mention operation ${pendingId} before submitting again.`,`לא הצלחנו לאשר את הפנייה הקודמת. אנא התקשרו למספר +1 (305) 491-6674 וציינו את הפעולה ${pendingId} לפני שליחה נוספת.`,'unknown');
      return;
    }
    if (stored) {
      try { sessionStorage.setItem(pendingKey, 'unresolved'); } catch {}
      lockFields(true); submit.disabled = true;
      say('A previous inquiry could not be reconciled. Please call +1 (305) 491-6674 before submitting again.','לא ניתן לברר את מצב הפנייה הקודמת. אנא התקשרו למספר +1 (305) 491-6674 לפני שליחה נוספת.','unknown');
      return;
    }
  } catch {
    lockFields(true); submit.disabled = true;
    say('We cannot safely check a previous inquiry on this device. Please call +1 (305) 491-6674.','לא ניתן לבדוק בבטחה פנייה קודמת במכשיר זה. אנא התקשרו למספר +1 (305) 491-6674.','unknown');
    return;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (get('contactChannel') === 'phone' && !unknown && !/^\+[1-9]\d{7,14}$/.test(fields().contact)) {
      say('Enter a phone number with country code. Your answers are still here.','יש להזין מספר טלפון עם קידומת מדינה. הפרטים עדיין כאן.','error');
      return;
    }
    const payload = unknown ? attempted : { operationId, fields:fields(), ...(Object.keys(attribution).length ? {attribution} : {}) };
    if (!payload) return;
    submit.disabled = true;
    lockFields(true);
    say('Saving your inquiry…','שומרים את פנייתכם…','saving');
    let posted = unknown;
    try {
      const challengeResponse = await fetch('/api/bna/interest', { headers:{Accept:'application/json'}, cache:'no-store', credentials:'omit' });
      if (!challengeResponse.ok) throw new Error('CHALLENGE_UNAVAILABLE');
      const challenge = (await challengeResponse.json())?.data?.challenge;
      if (typeof challenge !== 'string' || !challenge) throw new Error('CHALLENGE_INVALID');
      // The server requires a short challenge age; the form remains intact while waiting.
      await new Promise(resolve => setTimeout(resolve,1600));
      if (!attempted) attempted = payload;
      // Do not send if a reload could lose the only safe reconciliation marker.
      sessionStorage.setItem(pendingKey, payload.operationId);
      if (sessionStorage.getItem(pendingKey) !== payload.operationId) throw new Error('RECOVERY_MARKER_UNAVAILABLE');
      posted = true;
      const response = await fetch('/api/bna/interest', { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify({...payload,challenge}), cache:'no-store', credentials:'omit' });
      const result = (await response.json().catch(() => null))?.data;
      if (response.ok && result?.saved === true && typeof result.reference === 'string') {
        say(`Your inquiry was saved. Reference: ${result.reference}. This is not enrollment or a reserved place. No reply message has been sent.`,`פנייתכם נשמרה. מספר פנייה: ${result.reference}. אין בכך הרשמה או שמירת מקום. עדיין לא נשלחה הודעת תשובה.`,'saved');
        unknown = false; attempted = null; clearPending(); operationId = crypto.randomUUID(); lockFields(false); form.reset(); form.elements.namedItem('language').value = locale; syncConsentLanguage(); setContactInput();
      } else if (response.status >= 400 && response.status < 500 && !unknown) {
        unknown = false; attempted = null; clearPending(); operationId = crypto.randomUUID();
        lockFields(false);
        say('Not saved. Your answers are still here. Please check them and try again.','לא נשמר. הפרטים שהזנתם עדיין כאן. בדקו אותם ונסו שוב.','error');
      } else {
        unknown = true;
        say('We could not confirm the save. Your answers are still here. Retry this same inquiry to reconcile it.','לא הצלחנו לאשר שהפנייה נשמרה. הפרטים עדיין כאן. נסו שוב את אותה הפנייה כדי לברר את מצבה.','unknown');
      }
    } catch {
      // An unavailable GET has not sent any data; a failed POST may have committed.
      unknown = posted;
      if (!unknown) { attempted = null; clearPending(); lockFields(false); }
      say(posted ? 'We could not confirm the save. Your answers are still here. Retry this same inquiry to reconcile it.' : 'The form is temporarily unavailable. Your answers are still here. Please try again.', posted ? 'לא הצלחנו לאשר שהפנייה נשמרה. הפרטים עדיין כאן. נסו שוב את אותה הפנייה כדי לברר את מצבה.' : 'הטופס אינו זמין כרגע. הפרטים עדיין כאן. נסו שוב.', posted ? 'unknown' : 'error');
    } finally { submit.disabled = false; }
  });
})();
