const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  buildContentCardTopicFilterAudit,
  buildContentCardViewModel,
  contentTopicLabel,
  loadTranscriptDigestCards,
  normalizeDigestCategories,
} = require('../src/lib/bna/content-card-view-model');

const repoRoot = path.resolve(__dirname, '..');

test('content card model turns mechanical digest titles into clean generated titles', () => {
  const card = buildContentCardViewModel(
    { id: 83, title: 'Voice 260625_142916.m4a', transcript_text: 'PRIVATE RAW TRANSCRIPT BODY' },
    {
      digest: {
        job_id: 83,
        generated_title: 'Class Recording 2026-06-25 - Job 083 (parsed)',
        transcript_chars: 9683,
        parser_used: 'canonical-intake-parser',
        class_session_linkage: 'CONFIRMED',
        category_list: ['class_notes', 'class_session', 'drive_workflow_issue', 'profile_note'],
        raw_transcript_body_included: false,
        private_review_flag: true,
        next_action: 'Review parse gaps before any production write.',
      },
    }
  );

  assert.equal(card.display_title, 'Class Notes + Class Sessions - 2026-06-25 - #83');
  assert.equal(card.title_status.label, 'Generated title');
  assert.equal(card.parse_status.label, 'Parsed');
  assert.equal(card.digest_status.label, 'Digest ready');
  assert.equal(card.routing_status.label, 'Routing ready');
  assert.equal(card.topic_status.label, 'Classified');
  assert.deepEqual(card.topic_keys, ['class_notes', 'class_session', 'drive_workflow_issue', 'profile_note']);
  assert.match(card.summary, /Raw transcript body remains private/);
  assert.doesNotMatch(JSON.stringify(card), /PRIVATE RAW TRANSCRIPT BODY/);
});

test('content card model exposes clear missing-state labels for unclassified records', () => {
  const card = buildContentCardViewModel({ id: 999, title: '', transcript_text: 'private body' }, { digest: {} });

  assert.equal(card.display_title, 'Needs title - #999');
  assert.equal(card.title_status.label, 'Needs title');
  assert.equal(card.parse_status.label, 'Needs parse');
  assert.equal(card.digest_status.label, 'Needs digest');
  assert.equal(card.routing_status.label, 'Needs routing');
  assert.equal(card.topic_status.label, 'Needs topic classification');
  assert.deepEqual(card.topic_keys, ['uncategorized']);
  assert.deepEqual(card.state_badges, ['Needs title', 'Needs parse', 'Needs digest', 'Needs routing', 'Needs topic classification']);
});

test('digest categories normalize to filterable topic labels', () => {
  const categories = normalizeDigestCategories(
    { lane: 'billing/admin' },
    { label: 'Drive Workflow' },
    { label: 'Class Sessions' },
    'student_question',
    'Other'
  );
  assert.deepEqual(categories.map((category) => category.key), [
    'billing_admin',
    'drive_workflow_issue',
    'class_session',
    'student_question',
    'uncategorized',
  ]);
  assert.equal(contentTopicLabel('billing_admin'), 'Billing / Admin');
});

test('repo digest audit covers all 29 recordings without raw transcript bodies', () => {
  const { manifest, cards } = loadTranscriptDigestCards({ repoRoot });
  const audit = buildContentCardTopicFilterAudit({ repoRoot });

  assert.equal(manifest.recording_count, 29);
  assert.equal(cards.size, 29);
  assert.equal(audit.recording_count, 29);
  assert.equal(audit.raw_transcript_bodies_included, false);
  assert.equal(audit.guardrails.drive_writes_performed, false);
  assert.equal(audit.guardrails.production_db_mutation_performed, false);
  assert.equal(audit.summary.multi_topic_cards > 0, true);
  assert.equal(audit.topic_counts.class_notes > 0, true);
  assert.equal(audit.topic_counts.drive_workflow_issue > 0, true);
  assert.deepEqual(audit.rows.filter((row) => row.raw_transcript_body_included), []);
});

test('operations UI uses digest-card topic arrays instead of transcript-body topic search', () => {
  const operationsHtml = fs.readFileSync(path.join(repoRoot, 'public', 'operations.html'), 'utf8');

  assert.match(operationsHtml, /function contentCardModel/);
  assert.match(operationsHtml, /function contentTopicKeys/);
  assert.match(operationsHtml, /countByContentTopicKeys\(visibleJobs\)/);
  assert.match(operationsHtml, /contentTopicKeys\(job\)\.includes\(contentTopicFilter\)/);
  assert.match(operationsHtml, /Parse: \$\{escapeHtml\(card\.parse_status\?\.label/);
  assert.match(operationsHtml, /Digest: \$\{escapeHtml\(card\.digest_status\?\.label/);
  assert.match(operationsHtml, /Routing: \$\{escapeHtml\(card\.routing_status\?\.label/);
  assert.match(operationsHtml, /Topic: \$\{escapeHtml\(card\.topic_status\?\.label/);
  assert.match(operationsHtml, /placeholder="Search title, summary, topic, source, output, or metadata"/);
  assert.doesNotMatch(operationsHtml, /addContentSearchValue\(parts,\s*job\.transcript_text/);
  assert.doesNotMatch(operationsHtml, /String\(job\.transcript_text \|\| ''\)\.slice\(0,\s*16000\)/);
});
