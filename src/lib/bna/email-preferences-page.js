'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {renderPrivacyPolicy}=require('./privacy-policy');
const template=fs.readFileSync(path.join(__dirname,'../../../public/bna-coop-join.html'),'utf8');
/** Compose the existing BNA page shell, fonts and controls. No second design. */
function renderBnaPreferencesPage(env=process.env,locale='en'){
 const he=locale==='he';
 const policy=renderPrivacyPolicy(locale,{approved:env.BNA_PRIVACY_RELEASE_APPROVED==='true',operator:env.BNA_PRIVACY_OPERATOR_LEGAL_NAME,effectiveDate:env.BNA_PRIVACY_EFFECTIVE_DATE});
 const enabled=env.BNA_EMAIL_PREFERENCES_ENABLED==='true'&&env.BNA_EMAIL_PREFERENCES_GATEWAY_ENABLED==='true'&&!!policy;
 const head=template.slice(0,template.indexOf('<body')).replace(/<title>[^<]*<\/title>/,`<title>${he?'העדפות דוא״ל':'Email preferences'} | Bnei Neviim Academy</title>`)
  .replace('/js/bna-coop-join.js','/js/bna-email-preferences.js').replace('<html lang="en" dir="ltr" data-locale="en">',`<html lang="${locale}" dir="${he?'rtl':'ltr'}" data-locale="${locale}">`);
 const nav=template.match(/<div id="navMount"[\s\S]*?<\/noscript><\/div>/)?.[0];
 const footer=template.slice(template.indexOf('<div id="footerMount"'),template.indexOf('</body>'));
 if(!head||!nav||!footer)throw Error('BNA_PREFERENCES_SHELL_MISMATCH');
 return `${head}<body data-bna-current-page="email-preferences">${nav}<main id="main" class="wrap"><section class="form-shell" id="email-preferences" data-enabled="${enabled}">
 <h1><span data-lang="en">Email preferences</span><span data-lang="he">העדפות דוא״ל</span></h1>
 <p data-lang="en">Choose BNA educational and project updates. These choices do not cancel an inquiry or change Fishing Academy WhatsApp preferences.</p>
 <p data-lang="he">בחרו את העדכונים החינוכיים ועדכוני הפרויקט של בני נביאים. הבחירות אינן מבטלות פנייה ואינן משנות העדפות WhatsApp של האקדמיה לדיג.</p>
 <noscript><p>To manage preferences, enable JavaScript or email office@bneineviimacademy.org. לניהול העדפות יש להפעיל JavaScript או לפנות בדוא״ל.</p></noscript>
 <p id="preferences-program"></p><p id="preferences-current"></p><p id="preferences-paused" hidden><span data-lang="en">Updates are currently paused.</span><span data-lang="he">העדכונים מושהים כעת.</span></p>
 <form id="preferences-form"><fieldset disabled id="preferences-fields"><legend><span data-lang="en">This program</span><span data-lang="he">תוכנית זו</span></legend>
 <p><label><input type="checkbox" name="updates"><span id="preferences-notice"></span></label></p>
 <div class="field"><label for="preferences-language"><span data-lang="en">Email language</span><span data-lang="he">שפת הדוא״ל</span></label><select id="preferences-language" name="locale"><option value="en">English</option><option value="he">עברית</option></select></div>
 <div class="form-actions"><button type="submit" class="button"><span data-lang="en">Save preferences</span><span data-lang="he">שמירת העדפות</span></button></div></fieldset></form>
 <div class="form-actions"><button type="button" class="button secondary" id="preferences-stop-program" disabled><span data-lang="en">Stop updates for this program</span><span data-lang="he">הפסקת עדכונים לתוכנית זו</span></button>
 <button type="button" class="button secondary" id="preferences-stop-all" disabled><span data-lang="en">Stop all BNA optional email</span><span data-lang="he">הפסקת כל עדכוני הדוא״ל של בני נביאים</span></button></div>
 <p id="preferences-status" class="status" role="status" aria-live="polite"></p>
 <button type="button" class="button quiet" id="preferences-retry" hidden><span data-lang="en">Retry the same change</span><span data-lang="he">ניסיון חוזר של אותו שינוי</span></button>
 <button type="button" class="button quiet" id="preferences-read" hidden><span data-lang="en">Reload preferences</span><span data-lang="he">טעינת ההעדפות מחדש</span></button>
 <p><span data-lang="en">Need help? Email </span><span data-lang="he">לעזרה פנו בדוא״ל: </span><a href="mailto:office@bneineviimacademy.org">office@bneineviimacademy.org</a>.</p>
 <p><a href="/privacy" data-lang="en">Privacy Policy</a><a href="/he/privacy" data-lang="he">מדיניות הפרטיות</a></p>
 </section></main>${footer}</body></html>`;
}
module.exports={renderBnaPreferencesPage};
