'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {renderCoopJoinPage}=require('../src/lib/bna/coop-join-page');
const ready={BNA_COOP_FORM_ENABLED:'true',BNA_COOP_INTEREST_GATEWAY_ENABLED:'true',BNA_PRIVACY_RELEASE_APPROVED:'true',BNA_PRIVACY_OPERATOR_LEGAL_NAME:'Solomon Dratler',BNA_PRIVACY_EFFECTIVE_DATE:'2026-10-29'};
test('opens the actual form only with an enabled relay and configured released policy',()=>{
 const html=renderCoopJoinPage(ready);assert.ok(html.includes('<fieldset id="coop-fields">'));assert.ok(!html.includes('This form is not open yet.'));assert.ok(!html.includes('הטופס עדיין אינו פתוח.'));
 for(const key of Object.keys(ready)){assert.ok(renderCoopJoinPage({...ready,[key]:''}).includes('<fieldset disabled id="coop-fields">'));}
 assert.ok(renderCoopJoinPage({...ready,BNA_PRIVACY_EFFECTIVE_DATE:'2026-02-30'}).includes('<fieldset disabled id="coop-fields">'));
});
