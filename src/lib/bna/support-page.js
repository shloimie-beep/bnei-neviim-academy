'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {renderPrivacyPolicy}=require('./privacy-policy');
const template=fs.readFileSync(path.join(__dirname,'../../../public/support.html'),'utf8');
function renderSupportPage(env=process.env,locale='en'){
 let html=template;
 if(locale==='he')html=html.replace('<html lang="en" dir="ltr" data-locale="en">','<html lang="he" dir="rtl" data-locale="he">')
  .replace('<title>Support the Generation of the Geulah | Bnei Neviim Academy</title>','<title>תמכו בדור הגאולה | אקדמיית בני נביאים</title>')
  .replace('content="Support BNA\'s educational work and its long-term vision for a nature-centered Torah learning community in Florida."','content="תמיכתכם מחזקת את העשייה החינוכית של אקדמיית בני נביאים ואת התפתחותה של קהילת לימוד תורה אינטגרטיבית בפלורידה."')
  .replace('rel="canonical" href="https://bneineviimacademy.org/support"','rel="canonical" href="https://bneineviimacademy.org/he/support"')
  .replace('class="identity" href="/"','class="identity" href="/he"');
 const policy=renderPrivacyPolicy('en',{approved:env.BNA_PRIVACY_RELEASE_APPROVED==='true',operator:env.BNA_PRIVACY_OPERATOR_LEGAL_NAME,effectiveDate:env.BNA_PRIVACY_EFFECTIVE_DATE});
 if(env.BNA_SUPPORT_FORM_ENABLED!=='true'||env.BNA_SUPPORT_INTEREST_GATEWAY_ENABLED!=='true'||!policy)return html;
 if(!html.includes('<fieldset disabled id="support-fields">'))throw Error('BNA_SUPPORT_FORM_TEMPLATE_MISMATCH');
 return html.replace('<fieldset disabled id="support-fields">','<fieldset id="support-fields">')
  .replace(/<p class="note" role="status" data-support-unavailable>[\s\S]*?<\/p>/,'');
}
module.exports={renderSupportPage};
