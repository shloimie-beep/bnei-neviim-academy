const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packPath = 'ops/one-time-mishnah/partnership-drafting-pack.md';

test('One Time partnership drafting pack covers the requested writing artifacts', () => {
  const doc = fs.readFileSync(packPath, 'utf8');

  const requiredSections = [
    '## Purpose',
    '## Source Boundaries',
    '## Global Drafting Rules',
    '## Drafting Task 1: Cleaner Agreement Draft',
    '## Drafting Task 2: Values Checklist',
    '## Drafting Task 3: Refund And Cancellation Policy Options',
    '## Drafting Task 4: Family, Device, Zoom, And Access Rules',
    '## Drafting Task 5: Landing-Page Copy',
    '## Drafting Task 6: Launch Email Pack',
    '## Drafting Task 7: Reactivation Copy',
    '## Review And Approval Checklist',
    '## Current Recommendation',
  ];

  for (const section of requiredSections) {
    assert.match(doc, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const requestedArtifacts = [
    'cleaner agreement draft',
    'values checklist',
    'refund and cancellation policy',
    'family, device, Zoom, and access rules',
    'landing-page copy',
    'launch emails',
    'reactivation copy',
  ];

  for (const artifact of requestedArtifacts) {
    assert.match(doc, new RegExp(artifact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('One Time partnership drafting pack stays draft-only and approval-gated', () => {
  const doc = fs.readFileSync(packPath, 'utf8');

  const requiredSourcesAndGates = [
    'ops/one-time-mishnah-class/partnership-drive-map.md',
    'ops/audits/2026-06-14-one-time-billing-referral-plan.md',
    'ops/one-time-mishnah/first-party-capability-map.md',
    'ops/one-time-mishnah/content-media-intake-workflow.md',
    '01 Agreement and Values',
    '02 Offer, Pricing, and Policies',
    '05 Marketing and Launch',
    '09 Claude Drafting Tasks',
    'DECISION NEEDED',
    'APPROVE_BUFFER_SOCIAL_DRAFT',
    'APPROVE_GOOGLE_LIVE_ADAPTER_TEST',
    'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
  ];

  for (const term of requiredSourcesAndGates) {
    assert.match(doc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(doc, /does not create or edit Google Docs/i);
  assert.match(doc, /Do not treat old GHL\/legacy CRM language as active runtime direction/i);
  assert.match(doc, /Do not approve or send email, WhatsApp, Buffer, Google, Drive, Zoom, billing/i);
  assert.match(doc, /No live checkout link/i);
  assert.match(doc, /unknown consent: suppress by\s+default/i);
  assert.match(doc, /Use this pack to generate local draft text only/i);
  assert.doesNotMatch(doc, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(doc, /password\s*[:=]\s*\S+/i);
});
