const test = require('node:test');
const assert = require('node:assert/strict');

const {
  REVIEW_ACCESS_CODE,
  buildOneTimeSharedReviewData,
} = require('../../src/platform/instances/one-time-shared-review-data');

test('One Time shared review packet exposes scoped review links and TEST identities', () => {
  const review = buildOneTimeSharedReviewData({ baseUrl: 'https://example.test' });
  assert.equal(review.workspace_key, 'rabbi_sheller_provider');
  assert.equal(review.project_key, 'one_time_mishnah_class');
  assert.equal(review.access_code, REVIEW_ACCESS_CODE);
  assert.equal(review.links.parent, 'https://example.test/parent.html?review=one-time');
  assert.equal(review.links.student, 'https://example.test/student.html?review=one-time');
  assert.equal(review.identities.parent.id, 'TEST-ONETIME-PARENT-001');
  assert.equal(review.identities.student.id, 'TEST-ONETIME-STUDENT-001');
});

test('One Time shared review student mode excludes bot and BNA accountability', () => {
  const review = buildOneTimeSharedReviewData();
  assert.equal(review.student_portal.bot_enabled, false);
  assert.equal(review.student_portal.bna_accountability_enabled, false);
  assert.match(review.student_portal.hidden_scope_note, /only TEST-ONETIME-STUDENT-001/);
});

test('One Time shared review parent sees only the linked TEST student', () => {
  const review = buildOneTimeSharedReviewData();
  assert.equal(review.parent_portal.linked_students_visible.length, 1);
  assert.equal(review.parent_portal.linked_students_visible[0].id, 'TEST-ONETIME-STUDENT-001');
  assert.deepEqual(review.parent_portal.parent.linked_students, ['TEST-ONETIME-STUDENT-001']);
});

test('One Time shared review email templates are preview-only and no-send', () => {
  const review = buildOneTimeSharedReviewData();
  assert.equal(review.email_templates.length, 11);
  for (const template of review.email_templates) {
    assert.equal(template.no_send, true);
    assert.equal(template.send_readiness, 'preview_only');
    assert.ok(template.subject);
    assert.ok(template.preview_text);
    assert.ok(template.body_preview);
    assert.ok(template.recipient_scope);
    assert.ok(template.blocked_reason);
  }
});

test('One Time shared review classroom includes manual Vimeo library sample', () => {
  const review = buildOneTimeSharedReviewData();
  const video = review.classroom.today_video;
  assert.equal(video.vimeo_video_id, '1178363755');
  assert.equal(video.member_library_item.media_url, 'https://vimeo.com/1178363755/282ea2577c');
  assert.equal(review.classroom.curriculum.length, 1);
  assert.equal(review.classroom.classes.length, 1);
});

test('One Time shared review data contains no known BNA private fixture strings', () => {
  const json = JSON.stringify(buildOneTimeSharedReviewData());
  assert.equal(json.includes('Dratler'), false);
  assert.equal(json.includes('BNA payment'), false);
  assert.equal(json.includes('student tutor bot'), false);
});
