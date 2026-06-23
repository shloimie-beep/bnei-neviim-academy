const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const handoff = fs.readFileSync('tasks-pending/2026-06-14-one-time-content-library-build.md', 'utf8');

test('Operations Content exposes a guarded One Time Library workspace', () => {
  assert.match(operationsHtml, /\{ id: 'one_time_library', label: 'One Time Library' \}/);
  assert.match(operationsHtml, /function renderOneTimeContentLibraryPanel/);
  assert.match(operationsHtml, /function renderOneTimeLibraryCard/);
  assert.match(operationsHtml, /one_time_library: \{[\s\S]*title: 'One Time Library'[\s\S]*Scoped Rabbi Sheller video library review/);
  assert.match(operationsHtml, /function oneTimeLibraryStats/);
  assert.match(operationsHtml, /function oneTimeLibraryBlockers/);
  assert.match(operationsHtml, /one_time_mishnah_class/);
  assert.match(operationsHtml, /No email, WhatsApp, social post, checkout, external CRM, Drive\/video-host write, or member-library publish happens from this screen/);
  assert.match(operationsHtml, /Approval here records internal review state only/);
  assert.match(operationsHtml, /function renderOneTimePublishingApprovalPacket/);
  assert.match(operationsHtml, /One Time Publishing Approval Packet/);
  assert.match(operationsHtml, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
  assert.match(operationsHtml, /Member-library destination/);
  assert.match(operationsHtml, /Visibility and audience rules/);
  assert.match(operationsHtml, /No Buffer\/social, email, WhatsApp, Drive\/video-host, checkout, member visibility, or external CRM write runs from this packet/);
  assert.match(operationsHtml, /one_time_member_library/);
  assert.match(operationsHtml, /Preview Decision Draft/);
  assert.match(operationsHtml, /action_id: 'create_decision'/);
  assert.match(operationsHtml, /dry_run: true/);
  assert.match(operationsHtml, /Current review stats:/);
  assert.match(operationsHtml, /creates no decision task and performs no publishing, send, checkout, member visibility, Drive\/video-host, Buffer\/social, or external CRM write/);
});

test('One Time Library has searchable cards and internal output review lanes', () => {
  assert.match(operationsHtml, /let contentSearchQuery = '';/);
  assert.match(operationsHtml, /function contentMatchesSearch/);
  assert.match(operationsHtml, /function contentSearchHaystack/);
  assert.match(operationsHtml, /oninput="setContentSearch\(this\.value\)"/);
  assert.match(operationsHtml, /const ONE_TIME_LIBRARY_OUTPUT_LANES = \[/);
  [
    'video_library_item',
    'transcript_review',
    'thumbnail_brief',
    'worksheet_draft',
    'social_copy_plan',
    'newsletter_plan',
  ].forEach((outputType) => {
    assert.match(operationsHtml, new RegExp(outputType));
  });
  assert.match(operationsHtml, /renderOneTimeApprovalQueue/);
  assert.match(operationsHtml, /Approve Internal/);
  assert.match(operationsHtml, /Transcript Review/);
  assert.match(operationsHtml, /Worksheet \/ Source Sheet/);
  assert.match(operationsHtml, /function oneTimePublishPackagePayload/);
  assert.match(operationsHtml, /function previewOneTimePublishPackage/);
  assert.match(operationsHtml, /preview_one_time_member_library_publish_package/);
  assert.match(operationsHtml, /Package Preview/);
  assert.match(operationsHtml, /No publishing, send, member visibility, Drive\/video-host, Buffer\/social, checkout\/access, or external CRM write ran/);
  assert.match(operationsHtml, /function oneTimeThumbnailPreviewData/);
  assert.match(operationsHtml, /function renderOneTimeThumbnailPreview/);
  assert.match(operationsHtml, /Thumbnail Preview/);
  assert.match(operationsHtml, /metadata\.thumbnail_url/);
  assert.match(operationsHtml, /Open Thumbnail/);
  assert.match(operationsHtml, /Thumbnail reference missing/);
});

test('Hosted media URL support is first-party and does not publish externally', () => {
  assert.match(operationsHtml, /function saveOneTimeHostedMediaUrl/);
  assert.match(operationsHtml, /api\.updateContentJob\(id, \{ media_url: trimmed \|\| null \}\)/);
  assert.match(operationsHtml, /Use a full hosted URL starting with http:\/\/ or https:\/\//);
  assert.match(server, /'media_url'/);
  assert.match(server, /media_url must be a full http:\/\/ or https:\/\/ URL/);
  assert.match(server, /body\.media_url = mediaUrl \|\| null/);

  const panelStart = operationsHtml.indexOf('function renderOneTimeContentLibraryPanel');
  const panelEnd = operationsHtml.indexOf('function classSessionItems', panelStart);
  const actionStart = operationsHtml.indexOf('async function saveOneTimeHostedMediaUrl');
  const actionEnd = operationsHtml.indexOf('async function structureOneTimeMeeting', actionStart);
  const packageStart = operationsHtml.indexOf('async function previewOneTimePublishPackage');
  const packageEnd = operationsHtml.indexOf('function renderOneTimeLibraryCard', packageStart);
  const guardedSection = [
    operationsHtml.slice(panelStart, panelEnd),
    operationsHtml.slice(actionStart, actionEnd),
    operationsHtml.slice(packageStart, packageEnd),
    operationsHtml.slice(
      operationsHtml.indexOf('function oneTimeThumbnailPreviewData'),
      operationsHtml.indexOf('function oneTimeLibraryStats')
    ),
  ].join('\n');
  assert.doesNotMatch(guardedSection, /createBufferPostFromContent|publishNow|sendPaymentReminders|createCheckout|grant.*member/i);
});

test('One Time content-library handoff records deployed live verification', () => {
  assert.match(handoff, /Status: deployed and verified for the internal review-surface slice/);
  assert.match(handoff, /live Operations task #610 is marked done/);
  assert.match(handoff, /Railway deployment `4a77ab03-a394-4663-b4b7-55957655c6b0`/);
  assert.match(handoff, /ops\/playwright-smokes\/2026-06-14-one-time-content-library-live\/report\.md/);
  assert.match(handoff, /Actual member-library publishing is now implemented in the first-party app/);
  assert.match(handoff, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` approval before any member item/);
});

test('One Time app access readiness is read-only and blocks live publishing/access', () => {
  assert.match(server, /function oneTimeAppAccessReadinessFallback\(\)/);
  assert.match(server, /ready_for_live_app_write: false/);
  assert.match(server, /ready_for_admin_access_reset: false/);
  assert.match(server, /ready_for_member_library_publish: false/);
  assert.match(server, /generated_access_link: false/);
  assert.match(server, /checkout_or_access_grant_performed: false/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/app-access-readiness'/);
  assert.match(operationsHtml, /function defaultOneTimeAppAccessReadiness/);
  assert.match(operationsHtml, /function currentOneTimeAppAccessReadiness/);
  assert.match(operationsHtml, /function checkOneTimeAppAccessReadiness/);
  assert.match(operationsHtml, /No-write guard/);
  assert.match(operationsHtml, /no_member_library_publish/);
  assert.doesNotMatch(
    operationsHtml.slice(
      operationsHtml.indexOf('async function checkOneTimeAppAccessReadiness'),
      operationsHtml.indexOf('async function saveVisibleSettings')
    ),
    /contentJobAction|sendParentAccessLink|ops-access-links|createCheckout|grant.*member/i
  );
});

test('One Time private question moderation has first-party queue and no public forum', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_one_time_question_reviews/);
  assert.match(server, /review_status TEXT NOT NULL DEFAULT 'needs_review'/);
  assert.match(server, /forum_post_created BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(server, /no_send BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(server, /external_write_performed BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/question-moderation'/);
  assert.match(server, /read_only: true/);
  assert.match(server, /no_public_forum: true/);
  assert.match(server, /oneTimeQuestionReviewView/);
  assert.match(server, /function oneTimeQuestionDigestPreview/);
  assert.match(server, /digest_preview: oneTimeQuestionDigestPreview\(reviews\)/);
  assert.match(server, /No forum post is created by this digest/);
  assert.match(server, /No member-visible answer is published by this digest/);
  assert.match(server, /task_fallback/);

  assert.match(operationsHtml, /getOneTimeQuestionModeration/);
  assert.match(operationsHtml, /let oneTimeQuestionQueue = \[\];/);
  assert.match(operationsHtml, /let oneTimeQuestionDigestPreview = null/);
  assert.match(operationsHtml, /function renderOneTimeQuestionModerationQueue/);
  assert.match(operationsHtml, /function renderOneTimeQuestionDigestPreview/);
  assert.match(operationsHtml, /Private Question Moderation Queue/);
  assert.match(operationsHtml, /Private Question Digest Preview/);
  assert.match(operationsHtml, /data-one-time-question-digest-preview/);
  assert.match(operationsHtml, /Rabbi-facing review digest only/);
  assert.match(operationsHtml, /oneTimeQuestionDigestPreview = oneTimeQuestionQueueRes\.value\?\.digest_preview/);
  assert.match(operationsHtml, /no public forum/i);
  assert.match(operationsHtml, /review_moderated_question/);
  assert.match(operationsHtml, /Open Review Task/);
  assert.doesNotMatch(
    operationsHtml.slice(
      operationsHtml.indexOf('function renderOneTimeQuestionModerationQueue'),
      operationsHtml.indexOf('function renderOneTimeContentLibraryPanel')
    ),
    /sendParentAccessLink|createCheckout|publishNow|createBufferPostFromContent|grant.*member|createForumPost|publishAnswer|sendQuestionDigest/i
  );
});
