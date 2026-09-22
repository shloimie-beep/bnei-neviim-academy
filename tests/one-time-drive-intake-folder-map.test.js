const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ONE_TIME_CONTENT_MEDIA_PARENT_ID,
  classifyDriveIntakeFile,
  driveFolderLinksFromMap,
  rabbiFacingDriveLinksFromMap,
} = require('../src/lib/bna/one-time-drive-intake-map');
const {
  buildOneTimeSharedReviewData,
} = require('../src/platform/instances/one-time-shared-review-data');

const driveMap = JSON.parse(fs.readFileSync('ops/one-time-mishnah-class/drive-social-ingestion-map.json', 'utf8'));
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const providerHtml = fs.readFileSync('public/provider.html', 'utf8');
const workflowDoc = fs.readFileSync('ops/one-time-mishnah/content-media-intake-workflow.md', 'utf8');
const setupDriveScript = fs.readFileSync('scripts/setup-one-time-partnership-drive.mjs', 'utf8');

test('One Time Drive classifier routes media to transcription and source materials away from transcription', () => {
  const ppt = classifyDriveIntakeFile({ name: 'Sanhedrin.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  assert.equal(ppt.route, 'slideshow/source-material');
  assert.equal(ppt.source_type, 'slideshow_reference');
  assert.equal(ppt.eligible_for_transcription, false);
  assert.equal(ppt.no_transcription_required, true);
  assert.equal(ppt.index_only_until_review, true);

  const slides = classifyDriveIntakeFile({ name: 'Mishnah review', mimeType: 'application/vnd.google-apps.presentation' });
  assert.equal(slides.route, 'slideshow/source-material');
  assert.equal(slides.eligible_for_content_generation, 'review_required');

  const pdf = classifyDriveIntakeFile({ name: 'Perek worksheet.pdf', mimeType: 'application/pdf' });
  assert.equal(pdf.route, 'source-material');
  assert.equal(pdf.eligible_for_transcription, false);

  const audio = classifyDriveIntakeFile({ name: 'Rabbi shiur audio.m4a', mimeType: 'audio/mp4' });
  assert.equal(audio.route, 'transcription_intake');
  assert.equal(audio.source_type, 'shiur_recording');
  assert.equal(audio.eligible_for_transcription, true);

  const meeting = classifyDriveIntakeFile({ name: 'Planning meeting recording.mp4', mimeType: 'video/mp4' });
  assert.equal(meeting.route, 'transcription_intake');
  assert.equal(meeting.source_type, 'meeting_drop');
  assert.equal(meeting.eligible_for_transcription, true);

  const unknown = classifyDriveIntakeFile({ name: 'mystery.asset', mimeType: 'application/octet-stream' });
  assert.equal(unknown.route, 'needs Shloimie decision');
  assert.equal(unknown.eligible_for_transcription, false);
  assert.equal(unknown.automation_allowed, false);
});

test('broad content media parent does not auto-transcribe all child files', () => {
  const parent = classifyDriveIntakeFile({
    id: ONE_TIME_CONTENT_MEDIA_PARENT_ID,
    name: '04 Content and Media Intake',
    mimeType: 'application/vnd.google-apps.folder',
  });
  assert.equal(parent.route, 'folder_index');
  assert.equal(parent.eligible_for_transcription, false);
  assert.match(parent.next_action, /do not auto-transcribe the broad parent folder/i);
});

test('One Time Drive folder map exposes all super-admin folders and only two Rabbi-facing upload folders', () => {
  const allLinks = driveFolderLinksFromMap(driveMap);
  assert.equal(allLinks.length, 9);
  assert.deepEqual(allLinks.map((link) => link.key), [
    'projectRoot',
    'contentMedia',
    'videoDrop',
    'sourceMaterials',
    'ingestionQueue',
    'sourceMaterialReview',
    'socialOutputs',
    'approvedPosted',
    'needsDecision',
  ]);

  const rabbiLinks = rabbiFacingDriveLinksFromMap(driveMap);
  assert.equal(rabbiLinks.length, 2);
  assert.deepEqual(rabbiLinks.map((link) => link.key), ['videoDrop', 'sourceMaterials']);
  assert.ok(rabbiLinks.every((link) => link.rabbi_facing));
  assert.ok(rabbiLinks.some((link) => link.copy_label === 'Send this link for videos/audio'));
  assert.ok(rabbiLinks.some((link) => link.copy_label === 'Send this link for slideshows/source sheets/materials'));
  assert.doesNotMatch(JSON.stringify(rabbiLinks), /Ingestion Queue|Source Material Review|Output Drafts|Approved and Posted|Needs Shloimie Decision|transcript library|backend|production DB/i);
});

test('review provider payload includes only approved Rabbi-facing Drive dropoff links', () => {
  const review = buildOneTimeSharedReviewData();
  const links = review.provider_portal.drive_dropoff_links;
  assert.equal(links.length, 2);
  assert.deepEqual(links.map((link) => link.key), ['videoDrop', 'sourceMaterials']);
  assert.ok(links[0].webViewLink.startsWith('https://drive.google.com/drive/folders/'));
  assert.ok(links[1].webViewLink.startsWith('https://drive.google.com/drive/folders/'));
  assert.equal(links.find((link) => link.key === 'sourceMaterials').triggers_transcription, false);
  assert.equal(links.find((link) => link.key === 'sourceMaterials').source_material_only, true);
  assert.doesNotMatch(JSON.stringify(links), /private transcript|raw backend|production DB|Ingestion Queue|Output Draft/i);
});

test('Operations and Rabbi UI render Drive folder links with copy actions and scope guardrails', () => {
  assert.match(operationsHtml, /function driveFolderLinksForMap/);
  assert.match(operationsHtml, /function renderDriveFolderLinkCard/);
  assert.match(operationsHtml, /copyText\(event, '\$\{escapeHtml\(url\)\}'\)/);
  assert.match(operationsHtml, /Triggers transcription/);
  assert.match(operationsHtml, /Source-material only/);
  assert.match(operationsHtml, /Rabbi-facing/);

  assert.match(providerHtml, /function renderDriveDropoffLinks/);
  assert.match(providerHtml, /function copyProviderDriveLink/);
  assert.match(providerHtml, /Upload folders are limited to approved Rabbi-facing drop-off links/);
  assert.match(providerHtml, /Internal ingestion queues, draft review folders, private transcript libraries, and backend IDs are not exposed here/);
  assert.match(providerHtml, /Source material only/);
  assert.match(providerHtml, /No transcription/);
});

test('workflow docs and setup script preserve slideshow/source-material no-transcription rules', () => {
  assert.match(workflowDoc, /04\.05 Upload Here - Slideshows and Source Materials/);
  assert.match(workflowDoc, /PowerPoint and Google Slides files are `slideshow_reference` and\s+`source_material`; they are not transcription candidates/i);
  assert.match(workflowDoc, /No source-material file becomes a newsletter, social post, WhatsApp update,\s+email, source sheet, worksheet, or member-library item until review output is\s+created/i);

  assert.match(setupDriveScript, /04\.00 Upload Here - Videos and Audio for Transcription/);
  assert.match(setupDriveScript, /04\.00 Upload Here - Rabbi Video Drops/);
  assert.match(setupDriveScript, /04\.05 Upload Here - Slideshows and Source Materials/);
  assert.match(setupDriveScript, /ensureFolderWithAliases/);
  assert.match(setupDriveScript, /04\.99 Needs Shloimie Decision/);
});
