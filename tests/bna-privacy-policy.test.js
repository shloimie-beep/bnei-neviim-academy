'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const {renderPrivacyPolicy,privacyPolicyHandler}=require('../src/lib/bna/privacy-policy');
test('privacy policy stays unavailable until the approved operator and real effective date are configured',()=>{
 for(const config of [{},{approved:true,operator:'Example',effectiveDate:'2026-02-30'},{approved:false,operator:'Example',effectiveDate:'2026-10-29'},{approved:true,operator:'{{name}}',effectiveDate:'2026-10-29'}])assert.equal(renderPrivacyPolicy('en',config),null);
 const res={headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(v){this.statusCode=v;return this;},type(){return this;},send(v){this.body=v;return this;}};
 privacyPolicyHandler({})({path:'/privacy'},res);assert.equal(res.statusCode,503);assert.doesNotMatch(res.body,/\{\{|sdratler@gmail/);assert.equal(res.headers['Cache-Control'],'no-store');
});
test('both languages use only the supplied policy, escape bindings, and exclude private instructions',()=>{
 for(const locale of ['en','he']){const html=renderPrivacyPolicy(locale,{approved:true,operator:'Synthetic <operator>',effectiveDate:'2026-10-29'});
  assert.ok(html.includes('Synthetic &lt;operator&gt;'));assert.ok(html.includes('2026-10-29'));assert.ok(html.includes('BNA-ACQUISITION-PRIVACY-v1'));
  assert.ok(html.includes('office@bneineviimacademy.org'));assert.doesNotMatch(html,/305|sdratler@gmail/i);
  assert.doesNotMatch(html,/\{\{|Part C|Private release checklist|<script/i);assert.match(html,new RegExp('lang="'+locale+'"'));}
 const server=fs.readFileSync('server.js','utf8');assert.match(server,/app\.get\(\['\/privacy', '\/he\/privacy'\]/);
});
