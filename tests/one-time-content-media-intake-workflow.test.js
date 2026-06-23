const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const workflowPath = 'ops/one-time-mishnah/content-media-intake-workflow.md';
const server = fs.readFileSync('server.js', 'utf8');
const providerHtml = fs.readFileSync('public/provider.html', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');

test('One Time content media intake workflow covers every requested lane', () => {
  const doc = fs.readFileSync(workflowPath, 'utf8');

  const requiredSections = [
    '## Purpose',
    '## Inputs',
    '## Canonical Records',
    '## Workflow Stages',
    '### 1. Intake',
    '### 2. Transcript And Session Structure',
    '### 3. Source Sheets',
    '### 4. Worksheets',
    '### 5. Question Digests',
    '### 6. Organic Clips',
    '### 7. Ad Candidates',
    '### 8. Approval Package',
    '### 9. Posting And Reporting',
    '## Guardrails',
    '## Implementation Sequence',
    '## Current Recommendation',
  ];

  for (const section of requiredSections) {
    assert.match(doc, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const requestedWorkflowTerms = [
    'Drive drops',
    'recording/session record',
    'transcript/source notes',
    'source sheets',
    'worksheets',
    'question digests',
    'organic clips',
    'ad candidates',
    'approval package',
    'posting/reporting',
  ];

  for (const term of requestedWorkflowTerms) {
    assert.match(doc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('One Time content media intake workflow maps to first-party records and approval gates', () => {
  const doc = fs.readFileSync(workflowPath, 'utf8');

  const requiredRecordsAndGates = [
    'bna_content_jobs',
    'bna_project_meetings',
    'bna_content_outputs',
    'bna_class_sessions',
    'bna_one_time_question_reviews',
    'one_time_mishnah_class',
    'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING',
    'APPROVE_BUFFER_SOCIAL_DRAFT',
    'APPROVE_GOOGLE_LIVE_ADAPTER_TEST',
  ];

  for (const term of requiredRecordsAndGates) {
    assert.match(doc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(doc, /No raw recording is published automatically/i);
  assert.match(doc, /No BNA school\/private family\/accountability data is copied/i);
  assert.match(doc, /No ad spend occurs/i);
  assert.match(doc, /No GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ runtime path/i);
  assert.doesNotMatch(doc, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(doc, /password\s*[:=]\s*\S+/i);
});

test('provider portal exposes scoped Rabbi Class Media intake only behind backend flag', () => {
  assert.match(providerHtml, /data-provider-section="class_media"/);
  assert.match(providerHtml, /Class Media/);
  assert.match(providerHtml, /Manual hosted URLs only/);
  assert.match(providerHtml, /id="classMediaForm"/);
  assert.match(providerHtml, /name="hosted_media_url"/);
  assert.match(providerHtml, /Preview No-Write/);
  assert.match(providerHtml, /portalState\?\.one_time_class_media_enabled/);
  assert.match(providerHtml, /\/api\/provider-portal\/one-time\/class-media/);
  assert.match(providerHtml, /dry_run = true/);
  assert.doesNotMatch(providerHtml, /<input[^>]+type="file"[^>]*>/i);
});

test('One Time Class Media provider APIs are scoped, dry-run capable, and no-write guarded', () => {
  assert.match(server, /function isOneTimeClassMediaProvider/);
  assert.match(server, /one_time_class_media_enabled/);
  assert.match(server, /one_time_class_media_guardrail/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/one-time\/class-media', requireProviderSession/);
  assert.match(server, /app\.patch\('\/api\/provider-portal\/one-time\/class-media\/:jobId', requireProviderSession/);
  assert.match(server, /return res\.status\(403\)\.json\(/);
  assert.match(server, /must be a full http:\/\/ or https:\/\/ URL/);
  assert.match(server, /dry_run/);
  assert.match(server, /class_media_created: false/);
  assert.match(server, /content_job_created: false/);
  assert.match(server, /no_upload: true/);
  assert.match(server, /no_publish: true/);
  assert.match(server, /no_send: true/);
  assert.match(server, /external_write_performed: false/);
});

test('One Time Class Media persists to first-party review records and class sessions only', () => {
  assert.match(server, /provider_one_time_class_media_intake/);
  assert.match(server, /content_kind: 'one_time_video_library_item'/);
  assert.match(server, /submitted_by_provider_id/);
  assert.match(server, /INSERT INTO bna_content_jobs/);
  assert.match(server, /INSERT INTO bna_content_outputs/);
  assert.match(server, /upsertContentOutputForJob/);
  assert.match(server, /upsertClassSessionFromContentJob\(client, inserted\)/);
  assert.match(server, /upsertClassSessionFromContentJob\(client, updated\)/);
  [
    'video_library_item',
    'transcript_review',
    'thumbnail_brief',
    'worksheet_draft',
    'social_copy_plan',
    'newsletter_plan',
  ].forEach((outputType) => assert.match(server, new RegExp(outputType)));
  const routeStart = server.indexOf("app.post('/api/provider-portal/one-time/class-media'");
  const routeEnd = server.indexOf("app.get('/api/bna/contact-communications'", routeStart);
  assert.doesNotMatch(server.slice(routeStart, routeEnd), /createCheckout|grant.*member|sendParentAccessLink|createBufferPostFromContent|publishNow/i);
});

test('Rabbi provider seed is idempotently scoped to One Time project', () => {
  assert.match(server, /const oneTimeProjectId = project\?\.oneTime\?\.id/);
  assert.match(server, /SET project_id = COALESCE\(\$4, project_id\)/);
  assert.match(server, /project_key: ONE_TIME_PROJECT_KEY/);
  assert.match(server, /workspace_key: 'rabbi_sheller_provider'/);
  assert.match(server, /WHERE provider_name = 'Rabbi Elie Scheller'/);
});

test('Operations One Time Library readback shows Rabbi portal provenance', () => {
  assert.match(operationsHtml, /provider_portal_submission/);
  assert.match(operationsHtml, /provider_one_time_class_media_intake/);
  assert.match(operationsHtml, /Submitted from Rabbi portal/);
  assert.match(operationsHtml, /submitted_by_provider_name/);
  assert.match(operationsHtml, /service_title/);
  assert.match(operationsHtml, /session_title/);
  assert.match(operationsHtml, /class_date/);
  assert.match(operationsHtml, /Package Preview/);
  assert.match(operationsHtml, /No email, WhatsApp, social post, checkout, external CRM, Drive\/video-host write, or member-library publish happens from this screen/);
});
