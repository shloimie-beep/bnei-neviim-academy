const assert = require('node:assert/strict');
const test = require('node:test');

const brandConfig = require('../config/brands/one-time.json');
const { buildOneTimeSharedReviewData } = require('../src/platform/instances/one-time-shared-review-data');
const {
  ONE_TIME_CONTENT_SECTIONS,
  buildContentBlockers,
  buildNoWritePreviewStatus,
  buildOneTimeContentCommandCenter,
} = require('../src/platform/instances/one-time-content-command-center');

function buildContract() {
  return buildOneTimeContentCommandCenter({
    baseUrl: 'https://bneineviimacademy.org',
    checkedAt: '2026-06-26T00:00:00.000Z',
  });
}

test('One Time content command center exposes all six content sections', () => {
  const contract = buildContract();
  const expectedKeys = [
    'meeting_drops',
    'class_library',
    'worksheets_source_sheets',
    'questions_replies',
    'approved_assets',
    'publishing_readiness',
  ];

  assert.deepEqual(ONE_TIME_CONTENT_SECTIONS.map((section) => section.key), expectedKeys);
  assert.deepEqual(contract.sections.map((section) => section.key), expectedKeys);
  for (const key of expectedKeys) {
    assert.equal(contract.section_map[key].key, key);
    assert.equal(contract.section_map[key].workspace_key, 'rabbi_sheller_provider');
    assert.equal(contract.section_map[key].project_key, 'one_time_mishnah_class');
  }
});

test('One Time content command center stays scoped to the Rabbi workspace and project', () => {
  const contract = buildContract();

  assert.equal(contract.workspace_key, 'rabbi_sheller_provider');
  assert.equal(contract.project_key, 'one_time_mishnah_class');
  assert.equal(contract.review_only, true);
  assert.equal(contract.external_write_performed, false);
  assert.equal(contract.secrets_included, false);
  assert.ok(contract.guardrails.some((item) => /Do not mix BNA school/.test(item)));
});

test('no-send, no-upload, and no-external-write flags are explicit', () => {
  const contract = buildContract();
  const status = buildNoWritePreviewStatus('TEST-ACTION');

  for (const checked of [status, contract.no_write_status]) {
    assert.equal(checked.no_send, true);
    assert.equal(checked.no_upload, true);
    assert.equal(checked.no_external_write, true);
    assert.equal(checked.external_write_performed, false);
    assert.equal(checked.no_zoom_create, true);
    assert.equal(checked.no_vimeo_upload, true);
    assert.equal(checked.no_member_content_publish, true);
  }

  assert.equal(contract.section_map.meeting_drops.preview_action_status.no_external_write, true);
  assert.equal(contract.section_map.class_library.action_statuses.package_preview.no_upload, true);
  assert.equal(contract.section_map.class_library.action_statuses.publish.status, 'blocked_until_approval_phrase');
  assert.equal(contract.section_map.class_library.action_statuses.publish.member_content_published, false);
});

test('approved assets come from brand config and shared review data', () => {
  const review = buildOneTimeSharedReviewData({
    baseUrl: 'https://bneineviimacademy.org',
    checkedAt: '2026-06-26T00:00:00.000Z',
  });
  const contract = buildOneTimeContentCommandCenter(review);
  const assets = contract.section_map.approved_assets;

  assert.equal(assets.logo.src, brandConfig.assets.logo);
  assert.equal(assets.logo.review_data_src, review.brand.logo);
  assert.equal(assets.hero_portrait.src, brandConfig.assets.hero_portrait);
  assert.equal(assets.hero_portrait.review_data_src, review.brand.hero);
  assert.equal(assets.social_image.src, brandConfig.assets.social_og);
  assert.deepEqual(assets.teaching_stills.map((item) => item.src), brandConfig.assets.teaching_stills);
  assert.deepEqual(assets.press_logo_inventory.map((item) => item.src), brandConfig.assets.press_logos);
  assert.match(assets.rights_safe_note, /review only|does not imply/i);
});

test('private questions stay private and review-scoped', () => {
  const review = buildOneTimeSharedReviewData({
    baseUrl: 'https://bneineviimacademy.org',
    checkedAt: '2026-06-26T00:00:00.000Z',
  });
  const contract = buildOneTimeContentCommandCenter(review);
  const questions = contract.section_map.questions_replies;
  const question = questions.private_student_questions[0];

  assert.equal(question.visibility, 'student_private');
  assert.equal(question.review_scope, 'rabbi_admin_only');
  assert.equal(question.raw_body_included, false);
  assert.equal(question.body_preview, '[private question body withheld from command center contract]');
  assert.equal(questions.moderation_state.public_forum_created, false);
  assert.equal(questions.moderation_state.member_visible_by_default, false);
  assert.equal(questions.preview_status.no_send, true);
  assert.doesNotMatch(JSON.stringify(contract), /Can Rabbi explain why this time is used for Shema\?/);
});

test('class library keeps manual Vimeo sample and gated publishing statuses', () => {
  const contract = buildContract();
  const classLibrary = contract.section_map.class_library;
  const packageItem = classLibrary.class_packages[0];

  assert.equal(packageItem.manual_vimeo_reference.label, 'Manual Vimeo sample/reference only');
  assert.equal(packageItem.manual_vimeo_reference.review_only, true);
  assert.equal(packageItem.manual_vimeo_reference.automated_upload, false);
  assert.match(packageItem.manual_vimeo_reference.media_url, /1178363755/);
  assert.equal(packageItem.transcript_body_included, false);
  assert.equal(classLibrary.action_statuses.approve.requires_approval_phrase, 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING');
  assert.equal(classLibrary.action_statuses.publish.requires_approval_phrase, 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING');
  assert.ok(classLibrary.upload_blockers.some((item) => item.key === 'manual_vimeo_reference_only'));
  assert.ok(classLibrary.publish_blockers.some((item) => item.key === 'resend_sender_domain'));
});

test('publishing readiness names blockers and owners', () => {
  const contract = buildContract();
  const readiness = contract.section_map.publishing_readiness;
  const blockers = buildContentBlockers(contract);
  const labels = readiness.blocked_items.map((item) => item.label).join(' | ');

  assert.ok(readiness.ready_items.some((item) => item.key === 'manual_vimeo_reference'));
  assert.match(labels, /Hosted transcription credential/);
  assert.match(labels, /Vimeo upload authorization/);
  assert.match(labels, /Zoom meeting creation/);
  assert.match(labels, /Email sender\/domain readiness/);
  assert.match(labels, /Billing\/live charge approval/);
  assert.match(labels, /Separate Railway\/DNS setup/);
  assert.ok(readiness.rabbi_decisions_needed.some((item) => item.key === 'manual_vimeo_reference_only'));
  assert.ok(readiness.shloimie_setup_needed.some((item) => item.key === 'hosted_transcription_credential'));
  assert.equal(blockers.length, readiness.blocked_items.length);
});
