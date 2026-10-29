'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {renderPrivacyPolicy}=require('./privacy-policy');
const template=fs.readFileSync(path.join(__dirname,'../../../public/support.html'),'utf8');
function renderSupportPage(env=process.env){
 const policy=renderPrivacyPolicy('en',{approved:env.BNA_PRIVACY_RELEASE_APPROVED==='true',operator:env.BNA_PRIVACY_OPERATOR_LEGAL_NAME,effectiveDate:env.BNA_PRIVACY_EFFECTIVE_DATE});
 if(env.BNA_SUPPORT_FORM_ENABLED!=='true'||env.BNA_SUPPORT_INTEREST_GATEWAY_ENABLED!=='true'||!policy)return template;
 if(!template.includes('<fieldset disabled id="support-fields">'))throw Error('BNA_SUPPORT_FORM_TEMPLATE_MISMATCH');
 return template.replace('<fieldset disabled id="support-fields">','<fieldset id="support-fields">')
  .replace(/<p class="note" role="status" data-support-unavailable>[\s\S]*?<\/p>/,'');
}
module.exports={renderSupportPage};
