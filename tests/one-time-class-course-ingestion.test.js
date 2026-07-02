const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildOneTimeClassCourseIngestionPreview,
} = require('../src/platform/ingestion/one-time-class-course-builder');

function unwrap(result) {
  assert.equal(result.ok, true, result.error?.message);
  return result.data;
}

test('One Time natural-language class ingestion creates local course drafts with provenance', () => {
  const preview = unwrap(buildOneTimeClassCourseIngestionPreview({
    raw_id: 'RAW-20260620-INGEST-001',
    source_provider: 'codex_chat',
    source_type: 'vimeo_asset',
    provider_asset_id: 'vimeo-test-001',
    raw_text: [
      'One Time Mishnah class.',
      'Course: Mishnah Foundations.',
      'Module 2: Berachos Review.',
      'Lesson: Opening Mishnah 1.',
      'Use this Vimeo recording as the next lesson.',
      'Transcript says we learned Mishnah Berachos 1:1 and had attendance minutes.',
      'Turn the transcript into a worksheet.',
      'Publish the summary to parents after approval and give each student a progress update.',
    ].join(' '),
  }));

  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.live_publish_performed, false);
  assert.equal(preview.workspace_key, 'rabbi_sheller_provider');
  assert.equal(preview.project_key, 'one_time_mishnah_class');
  assert.equal(preview.drafts.course.title, 'Mishnah Foundations');
  assert.equal(preview.drafts.module.title, 'Berachos Review');
  assert.equal(preview.drafts.module.sort_order, 200);
  assert.equal(preview.drafts.lesson.title, 'Opening Mishnah 1');
  assert.equal(preview.drafts.video_reference.provider, 'vimeo');
  assert.equal(preview.drafts.lesson_video.video_asset_id, preview.drafts.video_reference.id);
  assert.equal(preview.drafts.class_session.provenance.raw_id, 'RAW-20260620-INGEST-001');
  assert.equal(preview.drafts.worksheet_resource_suggestions.length, 1);
  assert.deepEqual(
    preview.drafts.role_scoped_updates.map((item) => item.audience_role).sort(),
    ['parent', 'student']
  );
  assert.ok(preview.decisions.some((item) => item.title.includes('Approve publishing')));
  assert.ok(preview.tasks.some((item) => item.title.includes('speaker and participant')));
  assert.equal(preview.flow_coverage.source_fingerprint, 'drafted');
  assert.equal(preview.flow_coverage.video_reference, 'drafted');
  assert.equal(preview.flow_coverage.publish, 'blocked_until_approval');
  assert.ok(preview.idempotency.source_fingerprint);
});

test('One Time ambiguous class ingestion remains reviewable and performs no external writes', () => {
  const preview = unwrap(buildOneTimeClassCourseIngestionPreview({
    raw_id: 'RAW-20260620-INGEST-002',
    raw_text: 'Use this as the next one for One Time, maybe put it somewhere, do not publish this yet.',
  }));

  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.drafts.video_reference, null);
  assert.ok(preview.review_items.some((item) => item.title.includes('Confirm class source')));
  assert.ok(preview.review_items.some((item) => item.status === 'blocked_by_operator_hold'));
  assert.ok(preview.review_items.every((item) => item.provenance.raw_id === 'RAW-20260620-INGEST-002'));
  assert.equal(preview.flow_coverage.video_reference, 'review_required');
  assert.equal(preview.flow_coverage.publish, 'blocked_or_not_requested');
});

test('One Time class ingestion preview is idempotent for the same source', () => {
  const input = {
    raw_id: 'RAW-20260620-INGEST-003',
    source_provider: 'manual',
    raw_text: 'One Time Course: Review Track. Module 1: Basics. Lesson: First Class. Zoom recording transcript about Mishnah Brachos.',
  };
  const first = unwrap(buildOneTimeClassCourseIngestionPreview(input));
  const second = unwrap(buildOneTimeClassCourseIngestionPreview(input));

  assert.equal(first.idempotency.source_fingerprint, second.idempotency.source_fingerprint);
  assert.equal(first.drafts.course.id, second.drafts.course.id);
  assert.equal(first.drafts.module.id, second.drafts.module.id);
  assert.equal(first.drafts.lesson.id, second.drafts.lesson.id);
  assert.equal(first.drafts.class_session.id, second.drafts.class_session.id);
  assert.deepEqual(first.guardrails, second.guardrails);
});
