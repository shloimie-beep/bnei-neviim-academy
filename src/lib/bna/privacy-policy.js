'use strict';
const candidate = require('./privacy-policy-candidate.json');
const escape = value => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const inline = value => escape(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
function renderBody(markdown) {
  const lines=markdown.split(/\r?\n/),out=[];let list=false;
  for(const raw of lines){const line=raw.trim();if(!line){if(list){out.push('</ul>');list=false;}continue;}
    if(line.startsWith('- ')){if(!list){out.push('<ul>');list=true;}out.push('<li>'+inline(line.slice(2))+'</li>');continue;}
    if(list){out.push('</ul>');list=false;}
    if(line.startsWith('## '))out.push('<h2>'+inline(line.slice(3))+'</h2>');
    else if(line.startsWith('# '))out.push('<h1>'+inline(line.slice(2))+'</h1>');
    else out.push('<p>'+inline(line)+'</p>');
  }
  if(list)out.push('</ul>');return out.join('\n');
}
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value+'T00:00:00Z');return !Number.isNaN(date.valueOf())&&date.toISOString().slice(0,10)===value;}
function renderPrivacyPolicy(locale,config){
  if(config.approved!==true||!validDate(config.effectiveDate||'')||typeof config.operator!=='string'||config.operator.trim().length<2||config.operator.trim().length>200||/[\u0000-\u001f{}]/.test(config.operator))return null;
  const lang=locale==='he'?'he':'en',body=candidate[lang].replaceAll('{{VERIFIED_OPERATOR_LEGAL_NAME}}',config.operator.trim()).replaceAll('{{EFFECTIVE_DATE}}',config.effectiveDate);
  if(/\{\{[^}]+\}\}/.test(body))return null;
  return '<!doctype html><html lang="'+lang+'" dir="'+(lang==='he'?'rtl':'ltr')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+(lang==='he'?'מדיניות הפרטיות':'Privacy Policy')+' | Bnei Neviim Academy</title><link rel="stylesheet" href="/css/bna-torah-interest.css"></head><body><main class="wrap section"><a href="'+(lang==='he'?'/he':'/')+'">'+(lang==='he'?'חזרה לדף הבית':'Back to BNA home')+'</a><article class="narrow">'+renderBody(body)+'</article></main></body></html>';
}
function privacyPolicyHandler(env=process.env){return (req,res)=>{const locale=req.path==='/he/privacy'?'he':'en';
  const html=renderPrivacyPolicy(locale,{approved:env.BNA_PRIVACY_RELEASE_APPROVED==='true',operator:env.BNA_PRIVACY_OPERATOR_LEGAL_NAME,effectiveDate:env.BNA_PRIVACY_EFFECTIVE_DATE});
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  if(!html)return res.status(503).type('text/plain').send(locale==='he'?'מדיניות הפרטיות אינה זמינה כרגע.':'Privacy policy is not available yet.');
  return res.type('html').send(html);
};}
module.exports={renderPrivacyPolicy,privacyPolicyHandler};
