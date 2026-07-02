const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildContentCardViewModel,
  contentNeedsOutput,
  contentSourceKey,
  contentStatusKey,
  contentTopicKey,
  inferredContentTopics,
} = require('../src/lib/bna/content-card-view-model');

test('content card model omits transcript bodies and keeps transcript count only', () => {
  const [card] = buildContentCardViewModel([{
    id: 58,
    title: 'Class Recording 2026-06-11 - Job 058 (needs parser review)',
    source_type: 'google_drive',
    transcript_text: 'private transcript body that must not be exposed',
    categories: ['class_session', 'parser_error', 'student_question'],
  }]);

  assert.equal(card.id, 58);
  assert.equal(card.raw_transcript_body_included, false);
  assert.equal(card.transcript_chars, 'private transcript body that must not be exposed'.length);
  assert.equal(Object.prototype.hasOwnProperty.call(card, 'transcript_text'), false);
});

test('content card taxonomy normalizes topic, source, and parser status', () => {
  const job = {
    title: 'Drive transcript parser repair for Mishnah class',
    source_type: 'google_drive',
    categories: ['drive_workflow_issue', 'parser_error'],
    transcript_chars: 1200,
  };

  assert.equal(contentTopicKey(job), 'torah');
  assert.deepEqual(inferredContentTopics(job), ['torah', 'operations']);
  assert.equal(contentSourceKey(job), 'drive');
  assert.equal(contentStatusKey(job), 'needs_parse');
});

test('class recordings are multi-topic Torah and Class Notes even when parser repair metadata is present', () => {
  const [card] = buildContentCardViewModel([{
    id: 58,
    title: 'Class Recording 2026-06-11 - Job 058 (needs parser review)',
    source_type: 'google_drive',
    categories: ['class_notes', 'class_session', 'drive_workflow_issue', 'parser_error', 'student_question'],
    transcript_chars: 55809,
  }]);

  assert.equal(card.topic_key, 'torah');
  assert.ok(card.topic_keys.includes('torah'));
  assert.ok(card.topic_keys.includes('class_notes'));
  assert.ok(card.topic_keys.includes('education'));
  assert.ok(card.topic_keys.includes('operations'));
});

test('One Time Mishnah class content appears under One Time and Torah', () => {
  const [card] = buildContentCardViewModel([{
    id: 86,
    title: 'Sanhedrin New perek daled.pptx',
    project_key: 'one_time_mishnah_class',
    source_type: 'google_drive',
    categories: ['class_notes', 'class_session', 'source_sheets'],
  }]);

  assert.equal(card.topic_key, 'one_time');
  assert.ok(card.topic_keys.includes('one_time'));
  assert.ok(card.topic_keys.includes('torah'));
  assert.ok(card.topic_keys.includes('class_notes'));
});

test('transcribed jobs with no active outputs are needs-output candidates', () => {
  const job = {
    title: 'YouTube classroom clip',
    source_type: 'youtube',
    status: 'transcribed',
    transcript_chars: 5000,
    outputs: [{ status: 'archived', output_type: 'blog_draft' }],
  };

  assert.equal(contentNeedsOutput(job), true);
  assert.equal(contentSourceKey(job), 'youtube');
  assert.equal(contentStatusKey(job), 'needs_output');
});
