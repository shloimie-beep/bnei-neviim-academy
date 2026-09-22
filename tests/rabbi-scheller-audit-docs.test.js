const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const appAuditPath = 'ops/rabbi-scheller/2026-06-14-one-time-app-audit.md';
const accessAuditPath = 'ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md';
const billingPath = 'ops/rabbi-scheller/green-invoice-billing-options.md';

test('Rabbi Scheller app audit exists at the goal-mode requested path', () => {
  const audit = fs.readFileSync(appAuditPath, 'utf8');
  const requiredSections = [
    '## 1. Repo Purpose',
    '## 2. Tech Stack',
    '## 3. Routes And Screens',
    '## 4. Backend / Server Structure',
    '## 5. Auth / Login System',
    '## 6. How To Get Shloimie Logged In',
    '## 7. Existing Billing / Payment Links',
    '## 8. Resend / Email Usage',
    '## 9. Analytics / Tracking Usage',
    '## 10. Video Library / Backend',
    '## 11. Database / Storage',
    '## 12. Admin Dashboard / Back Office',
    '## 13. Content / Video Thumbnail Support',
    '## 14. What BNA Should Reuse',
    '## 15. What BNA Should Not Reuse',
    '## 16. Security Risks',
    '## 17. Missing Credentials / Access',
    '## 18. Recommended Next Architecture',
  ];

  for (const section of requiredSections) {
    assert.match(audit, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(audit, /a3463bc6756ac34d8f304451fa0e5190309b8ae1/);
  assert.match(audit, /050fe2468a3f5601e74e738c219cbe5c1bdf398e/);
  assert.doesNotMatch(audit, /sk-[A-Za-z0-9_-]{20,}/);
});

test('One Time access/backend audit covers live-access readiness without secrets', () => {
  const audit = fs.readFileSync(accessAuditPath, 'utf8');
  const requiredSections = [
    '## Evidence And Source Boundaries',
    '## 1. Repo And Deployment Targets',
    '## 2. Login Routes, Roles, And Access Model',
    '## 3. How Shloimie Can Log In',
    '## 4. Credential Source Names Only',
    '## 5. Missing Credentials And Decisions',
    '## 6. Analytics, Billing, Email, And Media Inventory',
    '## 7. App Routes And Pages',
    '## 8. What Is Useful For BNA',
    '## 9. What Should Remain Separate',
    '## 10. Integration Candidates',
    '## 11. Risks And Blockers',
    '## 12. Safe Bootstrap / Reset Plan',
    '## 13. Current Recommendation',
  ];

  for (const section of requiredSections) {
    assert.match(audit, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(audit, /a3463bc6756ac34d8f304451fa0e5190309b8ae1/);
  assert.match(audit, /050fe2468a3f5601e74e738c219cbe5c1bdf398e/);
  assert.match(audit, /GET \/api\/bna\/one-time\/app-access-readiness/);
  assert.match(audit, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
  assert.match(audit, /No BNA-side script should reset One Time production admin access/);
  assert.doesNotMatch(audit, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(audit, /password\s*[:=]\s*\S+/i);
});

test('Green Invoice billing options document discourages daily link sprawl', () => {
  const billing = fs.readFileSync(billingPath, 'utf8');

  assert.match(billing, /## Option 1: Immediate Payment Plus First-Of-Month Subscription/);
  assert.match(billing, /## Option 2: First-Of-Month Only/);
  assert.match(billing, /## Option 3: Manual First-Cycle Link, Then Subscription/);
  assert.match(billing, /## Option 4: Multiple Daily Links/);
  assert.match(billing, /## Option 5: Stripe Or Another Billing Alternative/);
  assert.match(billing, /Do not create 30 daily payment links for launch/);
  assert.doesNotMatch(billing, /sk-[A-Za-z0-9_-]{20,}/);
});

test('One Time billing packet requires provider of record and refund approval before checkout', () => {
  const billing = fs.readFileSync(billingPath, 'utf8');

  const requiredSections = [
    '## 2026-06-15 Provider Of Record And Policy Packet',
    '### Current Source-Of-Truth Answer',
    '### Provider Decision Options',
    '### Required Billing Policy Decisions',
    '### Refund And Cancellation Options',
    '### Approval Phrases',
    '### Implementation Guardrails',
  ];

  for (const section of requiredSections) {
    assert.match(billing, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(billing, /exactly one provider of record per live product\/plan/);
  assert.match(billing, /APPROVE_ONE_TIME_BILLING_PROVIDER_GREEN_INVOICE/);
  assert.match(billing, /APPROVE_ONE_TIME_BILLING_PROVIDER_STRIPE/);
  assert.match(billing, /APPROVE_ONE_TIME_BILLING_MANUAL_BRIDGE/);
  assert.match(billing, /APPROVE_ONE_TIME_REFUND_POLICY_R1_NO_REFUNDS/);
  assert.match(billing, /APPROVE_ONE_TIME_REFUND_POLICY_R2_SEVEN_DAY_FIRST_PAYMENT/);
  assert.match(billing, /APPROVE_ONE_TIME_REFUND_POLICY_R3_TRIAL_THEN_NO_REFUNDS/);
  assert.match(billing, /Do not create payment links, checkout sessions, subscriptions, invoices/);
  assert.match(billing, /Post-approval smoke should use an approved test buyer\/session first/);
  assert.doesNotMatch(billing, /password\s*[:=]\s*\S+/i);
});
