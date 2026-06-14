const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const appAuditPath = 'ops/rabbi-scheller/2026-06-14-one-time-app-audit.md';
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
