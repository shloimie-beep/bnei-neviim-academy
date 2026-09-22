const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packet = fs.readFileSync('ops/google-integrations/google-public-oauth-verification-packet.md', 'utf8');
const nowVsLater = fs.readFileSync('ops/google-integrations/google-now-vs-later-scope-plan.md', 'utf8');
const ownerPack = fs.readFileSync('ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md', 'utf8');

test('Google public OAuth verification packet covers official-source readiness', () => {
  const requiredOfficialLinks = [
    'https://support.google.com/cloud/answer/13463073',
    'https://developers.google.com/terms/api-services-user-data-policy',
    'https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification',
    'https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification',
    'https://support.google.com/cloud/answer/13804565',
  ];
  for (const link of requiredOfficialLinks) assert.match(packet, new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  assert.match(packet, /APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET/);
  assert.match(packet, /Cloud Console category for each scope at time of submission/);
  assert.match(packet, /Test-user smoke evidence paths for each feature/);
  assert.match(packet, /Demo video URL or recording owner and script/);
  assert.match(packet, /security assessment/);
});

test('Google verification packet preserves Mode A and Mode B while gating Mode C', () => {
  assert.match(packet, /BNA can\s+continue using no-OAuth\/manual features and test-user OAuth/s);
  assert.match(packet, /This is not approval for a live Google write/);
  assert.match(packet, /APPROVE_GOOGLE_LIVE_ADAPTER_TEST/);
  assert.match(packet, /Do not request broad Drive access/);
  assert.match(packet, /Do not request Gmail scopes/);
  assert.match(packet, /Scope categories were checked in the Cloud Console the same day as\s+submission/s);
  assert.match(packet, /Do not claim public verification is\s+complete from a local checklist/s);
});

test('Google verification packet includes privacy, deletion, and demo evidence requirements', () => {
  assert.match(packet, /Privacy policy URL/);
  assert.match(packet, /Data deletion\/disconnect URL or exact in-app disconnect path/);
  assert.match(packet, /no sale or transfer to ads\/data brokers/);
  assert.match(packet, /no hidden\s+secondary use/s);
  assert.match(packet, /no broad AI\/model training/);
  assert.match(packet, /Open Operations > Integrations > Google/);
  assert.match(packet, /full OAuth consent screen in English with the exact requested\s+scopes/s);
  assert.match(packet, /Disconnect the Google account from Operations/);
});

test('Google planning docs point from Mode C to the verification packet', () => {
  assert.match(nowVsLater, /google-public-oauth-verification-packet\.md/);
  assert.match(nowVsLater, /APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET/);
  assert.match(ownerPack, /## 8\. Google Public OAuth Verification Packet/);
  assert.match(ownerPack, /APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET/);
});
