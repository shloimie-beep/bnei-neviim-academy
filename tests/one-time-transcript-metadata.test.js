const assert = require('node:assert/strict');
const test = require('node:test');

const metadata = require('../src/lib/bna/one-time-transcript-metadata');

const RAW_TRANSCRIPT = [
  'The class learned Mishnah Berachos perek aleph mishnah 1.',
  'Topic: why Shema begins at night.',
  'Rabbi reviewed the first Mishnah carefully.',
].join(' ');

test('metadata draft extracts Torah fields and transliteration from transcript text', () => {
  const draft = metadata.buildOneTimeMetadataDraft({
    transcriptVersion: { version: 1, transcript_sha256: 'transcript-hash' },
    transcriptText: RAW_TRANSCRIPT,
  });

  assert.equal(draft.workspace_key, 'rabbi_sheller_provider');
  assert.equal(draft.project_key, 'one_time_mishnah_class');
  assert.equal(draft.schema_version, metadata.METADATA_SCHEMA_VERSION);
  assert.equal(draft.torah_metadata.masechta, 'Berachos');
  assert.equal(draft.torah_metadata.masechta_transliterated, 'Berakhot');
  assert.equal(draft.torah_metadata.perek, '1');
  assert.equal(draft.torah_metadata.mishnah_range, '1');
  assert.match(draft.title, /Mishnah Berachos/);
  assert.equal(draft.raw_transcript_included, false);
});

test('sidecar metadata wins and raises confidence while still requiring review approval', () => {
  const draft = metadata.buildOneTimeMetadataDraft({
    transcriptText: 'Short class transcript.',
    sidecar: {
      title: 'Approved Sidecar Title',
      summary: 'Reviewed the opening Mishnah.',
      masechta: 'Shabbos',
      perek: '2',
      mishnah_range: '3-4',
      topics: ['lighting candles'],
    },
  });

  assert.equal(draft.title, 'Approved Sidecar Title');
  assert.equal(draft.torah_metadata.masechta_transliterated, 'Shabbat');
  assert.equal(draft.confidence > 0.8, true);
  assert.equal(draft.approved_for_member_publish, false);
  assert.equal(draft.approved_for_bot_knowledge, false);
});

test('metadata draft from weak transcript remains needs_review', () => {
  const draft = metadata.buildOneTimeMetadataDraft({
    transcriptText: 'This class mentioned a few ideas without exact source labels.',
  });

  assert.equal(draft.review_state, 'needs_review');
  assert.equal(draft.approved_for_bot_knowledge, false);
});

test('bot knowledge handoff blocks until transcript and metadata are explicitly approved', () => {
  const draft = metadata.buildOneTimeMetadataDraft({
    transcriptVersion: { version: 1, transcript_sha256: 'transcript-hash' },
    transcriptText: RAW_TRANSCRIPT,
  });
  const blocked = metadata.buildBotKnowledgeHandoff({
    metadataDraft: draft,
    transcriptVersion: { status: 'machine_complete', transcript_sha256: 'transcript-hash' },
    approved: false,
  });

  assert.equal(blocked.status, 'blocked');
  assert.ok(blocked.blockers.includes('transcript_version_not_approved'));
  assert.ok(blocked.blockers.includes('metadata_not_approved_for_bot_knowledge'));
  assert.ok(blocked.blockers.includes('handoff_approval_flag_missing'));
  assert.equal(blocked.knowledge_item, null);
});

test('approved handoff produces provider-scoped knowledge without raw transcript body', () => {
  const draft = metadata.buildOneTimeMetadataDraft({
    transcriptVersion: { version: 2, transcript_sha256: 'transcript-hash' },
    transcriptText: RAW_TRANSCRIPT,
    sidecar: {
      masechta: 'Berachos',
      perek: '1',
      mishnah_range: '1',
      topics: ['Shema at night'],
    },
  });
  draft.review_state = 'approved';
  draft.approved_for_bot_knowledge = true;
  const handoff = metadata.buildBotKnowledgeHandoff({
    metadataDraft: draft,
    transcriptVersion: { status: 'approved', transcript_sha256: 'transcript-hash' },
    approved: true,
  });
  const serialized = JSON.stringify(handoff);

  assert.equal(handoff.status, 'ready_for_scoped_promotion');
  assert.deepEqual(handoff.blockers, []);
  assert.equal(handoff.no_raw_transcript_body, true);
  assert.equal(handoff.knowledge_item.visibility, 'provider_scoped_private');
  assert.equal(handoff.knowledge_item.raw_transcript_body_included, false);
  assert.doesNotMatch(serialized, /Rabbi reviewed the first Mishnah/);
  assert.doesNotMatch(serialized, /why Shema begins at night/);
});
