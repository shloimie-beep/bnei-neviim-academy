'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {renderPrivacyPolicy}=require('./privacy-policy');
const template=fs.readFileSync(path.join(__dirname,'../../../public/bna-coop-join.html'),'utf8');
function renderCoopJoinPage(env=process.env){
 const policy=renderPrivacyPolicy('en',{approved:env.BNA_PRIVACY_RELEASE_APPROVED==='true',operator:env.BNA_PRIVACY_OPERATOR_LEGAL_NAME,effectiveDate:env.BNA_PRIVACY_EFFECTIVE_DATE});
 if(env.BNA_COOP_FORM_ENABLED!=='true'||env.BNA_COOP_INTEREST_GATEWAY_ENABLED!=='true'||!policy)return template;
 if(!template.includes('<fieldset disabled id="coop-fields">'))throw Error('BNA_COOP_FORM_TEMPLATE_MISMATCH');
 return template.replace('<fieldset disabled id="coop-fields">','<fieldset id="coop-fields">')
  .replace(/<p class="note" role="status" data-lang="en">Privacy information is being prepared\. This form is not open yet\.<\/p>/,'')
  .replace(/<p class="note" role="status" data-lang="he">מידע הפרטיות נמצא בהכנה\. הטופס עדיין אינו פתוח\.<\/p>/,'');
}
module.exports={renderCoopJoinPage};
