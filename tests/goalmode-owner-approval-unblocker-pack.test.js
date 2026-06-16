const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packPath = 'ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md';

test('owner approval unblocker pack includes every remaining approval lane', () => {
  const pack = fs.readFileSync(packPath, 'utf8');

  const requiredSections = [
    '## 1. Google Live Adapter Test',
    '## 2. One Time Member-Library Publishing Smoke',
    '## 3. One Time Question Digest / Public Q&A Surface',
    '## 4. One Time Billing Provider And Refund Policy',
    '## 5. Buffer Social Draft Or Publish',
    '## 6. Rabbi Live App Access And Reset',
    '## 7. External Access Persistence Workflow',
    '## 8. Google Public OAuth Verification Packet',
  ];

  for (const section of requiredSections) {
    assert.match(pack, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const approvalPhrases = [
    'APPROVE_GOOGLE_LIVE_ADAPTER_TEST',
    'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    'APPROVE_ONE_TIME_BILLING_PROVIDER_GREEN_INVOICE',
    'APPROVE_ONE_TIME_BILLING_PROVIDER_STRIPE',
    'APPROVE_ONE_TIME_BILLING_MANUAL_BRIDGE',
    'APPROVE_ONE_TIME_REFUND_POLICY_R1_NO_REFUNDS',
    'APPROVE_ONE_TIME_REFUND_POLICY_R2_SEVEN_DAY_FIRST_PAYMENT',
    'APPROVE_ONE_TIME_REFUND_POLICY_R3_TRIAL_THEN_NO_REFUNDS',
    'APPROVE_BUFFER_SOCIAL_DRAFT',
    'RABBI_LIVE_APP_ACCESS_CONFIRMATION',
    'APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW',
    'APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET',
    'APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE',
  ];

  for (const phrase of approvalPhrases) {
    assert.match(pack, new RegExp(phrase));
  }

  const actualSections = [...pack.matchAll(/^## \d+\. .+$/gm)].map(match => match[0]);
  assert.deepEqual(actualSections.slice(0, requiredSections.length), requiredSections);
});

test('owner approval unblocker pack requires details and blocks hidden writes', () => {
  const pack = fs.readFileSync(packPath, 'utf8');

  assert.match(pack, /A valid approval must\s+include the approval phrase plus the required fields/s);
  assert.match(pack, /If the\s+phrase is present but the required fields are missing/);
  assert.match(pack, /no production-wide sync/);
  assert.match(pack, /no member-library publish/i);
  assert.match(pack, /no payment links, checkout session, subscription, invoice/);
  assert.match(pack, /no Buffer draft, publish, media attach, ad spend/);
  assert.match(pack, /do not invent credentials/i);
  assert.match(pack, /no parent\/student portal account/);
  assert.match(pack, /provider portal password/);
  assert.match(pack, /does not approve `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`/);
  assert.match(pack, /does not\s+approve any Google read\/write/s);
  assert.match(pack, /the private digest is review-only/i);
  assert.match(pack, /No public forum post,\s+member-visible answer/s);
  assert.match(pack, /Student identity policy/);
  assert.match(pack, /no secret values/i);
  assert.doesNotMatch(pack, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(pack, /password\s*[:=]\s*\S+/i);
});
