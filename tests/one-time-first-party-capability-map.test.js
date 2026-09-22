const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const mapPath = 'ops/one-time-mishnah/first-party-capability-map.md';

test('One Time first-party capability map covers the required operating areas', () => {
  const doc = fs.readFileSync(mapPath, 'utf8');

  const requiredSections = [
    '## Purpose',
    '## Source Boundaries',
    '## Capability Matrix',
    '## What BNA Can Own Now',
    '## What Stays External Until Approved',
    '## No-GHL Rule',
    '## Recommended Sequence',
    '## Acceptance For External Writes',
    '## Current Recommendation',
  ];

  for (const section of requiredSections) {
    assert.match(doc, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const requiredCapabilityTerms = [
    'Contacts and identities',
    'Tags and segments',
    'Pipelines and opportunities',
    'Calendars and classes',
    'Payments and access',
    'Workflows and automations',
    'Community and membership support',
    'Content and media intake',
    'Social/content posting through Buffer',
    'WhatsApp/WAPI communications',
    'browser-only',
  ];

  for (const term of requiredCapabilityTerms) {
    assert.match(doc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }

  const requiredBnaPrimitives = [
    'bna_parent_leads',
    'bna_pipeline_cards',
    'bna_calendar_events',
    'bna_provider_service_sessions',
    'bna_payment_intake',
    'bna_learning_communities',
    'bna_one_time_question_reviews',
    'bna_content_jobs',
    'bna_content_outputs',
    'preview_social_schedule_package',
    'calendar_batch_launch_plan_preview',
    'APPROVE_GOOGLE_LIVE_ADAPTER_TEST',
    'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    'APPROVE_BUFFER_SOCIAL_DRAFT',
  ];

  for (const term of requiredBnaPrimitives) {
    assert.match(doc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('One Time first-party capability map keeps external writes gated', () => {
  const doc = fs.readFileSync(mapPath, 'utf8');

  assert.match(doc, /does\s+not\s+grant\s+access/i);
  assert.match(doc, /do\s+not\s+replace\s+the\s+live\s+One\s+Time\s+production\s+app/i);
  assert.match(doc, /No external write path should be considered ready/i);
  assert.match(doc, /credentials exist outside the repo\/chat/i);
  assert.match(doc, /rollback\/revoke path is documented/i);
  assert.match(doc, /No active One Time or BNA capability above depends on GHL/i);
  assert.doesNotMatch(doc, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(doc, /password\s*[:=]\s*\S+/i);
});
