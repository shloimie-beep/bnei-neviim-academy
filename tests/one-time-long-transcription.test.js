const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const transcription = require('../src/lib/bna/one-time-long-transcription');

const PRIVATE_TRANSCRIPT_TEXT = 'Rabbi reviewed Mishnah Aleph and a student asked a private question.';

test('long-form chunk plan creates overlapping timestamp windows', () => {
  const plan = transcription.buildLongFormChunkPlan({
    durationSeconds: 1250,
    chunkSeconds: 600,
    overlapSeconds: 15,
  });

  assert.equal(plan.blockers.length, 0);
  assert.equal(plan.chunks.length, 3);
  assert.deepEqual(plan.chunks.map((chunk) => [chunk.start_seconds, chunk.end_seconds]), [
    [0, 615],
    [585, 1215],
    [1185, 1250],
  ]);
  assert.equal(plan.chunks[1].overlap_before_seconds, 15);
  assert.equal(plan.chunks[1].overlap_after_seconds, 15);
});

test('audio extraction commands are per-chunk and do not call a provider', () => {
  const plan = transcription.buildLongFormChunkPlan({
    durationSeconds: 700,
    chunkSeconds: 600,
    overlapSeconds: 10,
  });
  const commands = transcription.buildAudioExtractionCommands({
    inputPath: 'C:/private/source/class.mp4',
    outputDir: 'C:/private/chunks',
    outputBase: 'Rabbi class recording',
    chunkPlan: plan,
  });

  assert.equal(commands.length, 2);
  assert.equal(commands[0].descriptor.mimeType, 'audio/mpeg');
  assert.ok(commands[0].ffmpeg_args.includes('-vn'));
  assert.ok(commands[0].ffmpeg_args.includes('-ar'));
  assert.equal(commands[0].no_provider_call, true);
  assert.match(commands[0].output_path, /Rabbi-class-recording-part-001\.mp3$/);
});

test('chunk transcript merge dedupes overlapping repeated segments while preserving timestamps', () => {
  const merged = transcription.mergeChunkTranscripts([
    {
      chunk_index: 1,
      start_seconds: 0,
      segments: [
        { start_seconds: 590, end_seconds: 600, text: 'Repeated overlap sentence.' },
        { start_seconds: 601, end_seconds: 610, text: PRIVATE_TRANSCRIPT_TEXT },
      ],
    },
    {
      chunk_index: 2,
      start_seconds: 585,
      segments: [
        { start_seconds: 5, end_seconds: 15, text: 'Repeated overlap sentence.' },
        { start_seconds: 25, end_seconds: 35, text: 'New second chunk sentence.' },
      ],
    },
  ]);

  assert.equal(merged.status, 'machine_complete');
  assert.equal(merged.segment_count, 3);
  assert.deepEqual(merged.segments.map((segment) => segment.start_seconds), [590, 601, 610]);
  assert.match(merged.transcript_text, /private question/);
});

test('private transcript version stores hashes and counters without raw body fields', () => {
  const plan = transcription.buildLongFormChunkPlan({ durationSeconds: 60 });
  const merged = transcription.mergeChunkTranscripts([{
    chunk_index: 1,
    start_seconds: 0,
    segments: [{ start_seconds: 0, end_seconds: 12, text: PRIVATE_TRANSCRIPT_TEXT }],
  }]);
  const version = transcription.buildPrivateTranscriptVersion({
    contentJobId: 12,
    classSessionId: 34,
    mediaFingerprint: 'media:fingerprint',
    provider: 'openai',
    model: 'gpt-4o-mini-transcribe',
    mergedTranscript: merged,
    chunkPlan: plan,
    previousVersion: 2,
  });

  assert.equal(version.workspace_key, 'rabbi_sheller_provider');
  assert.equal(version.project_key, 'one_time_mishnah_class');
  assert.equal(version.version, 3);
  assert.equal(version.status, 'machine_complete');
  assert.equal(version.transcript_body_included, false);
  assert.equal(version.raw_text_returned, false);
  assert.equal(version.transcript_sha256.length, 64);
  assert.equal(version.transcript_char_count, PRIVATE_TRANSCRIPT_TEXT.length);
  assert.equal(version.segment_hashes[0].text_sha256.length, 64);
  assert.doesNotMatch(JSON.stringify(version), /private question/i);
});

test('retry plan retries failed chunks and dead-letters after max attempts', () => {
  const retry = transcription.buildChunkRetryPlan([
    { chunk_index: 1, status: 'failed', attempts: 0, last_error: 'provider timeout' },
    { chunk_index: 2, status: 'failed', attempts: 2, last_error: 'provider timeout' },
    { chunk_index: 3, status: 'transcribed', attempts: 1 },
  ], { maxAttempts: 3, now: '2026-07-13T12:00:00.000Z' });

  assert.equal(retry.chunks[0].action, 'retry_chunk');
  assert.equal(retry.chunks[0].status, 'retry_wait');
  assert.equal(retry.chunks[1].action, 'dead_letter_chunk');
  assert.equal(retry.chunks[1].status, 'dead_letter');
  assert.equal(retry.chunks[2].action, 'skip_transcribed');
});

test('safe transcription report omits transcript bodies and keeps version evidence', () => {
  const chunkPlan = transcription.buildLongFormChunkPlan({ durationSeconds: 60 });
  const merged = transcription.mergeChunkTranscripts([{
    chunk_index: 1,
    start_seconds: 0,
    segments: [{ start_seconds: 0, end_seconds: 12, text: PRIVATE_TRANSCRIPT_TEXT }],
  }]);
  const version = transcription.buildPrivateTranscriptVersion({ mergedTranscript: merged, chunkPlan });
  const report = transcription.safeTranscriptionReport({ chunkPlan, version });
  const serialized = JSON.stringify(report);

  assert.equal(report.transcript_body_included, false);
  assert.equal(report.raw_text_returned, false);
  assert.equal(report.transcript_version.transcript_body_included, false);
  assert.equal(report.transcript_version.transcript_sha256.length, 64);
  assert.doesNotMatch(serialized, /private question/i);
  assert.doesNotMatch(serialized, /Rabbi reviewed Mishnah/i);
});

test('server transcript status lifecycle includes machine review states', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  for (const status of ['machine_complete', 'needs_review', 'approved', 'superseded', 'rejected']) {
    assert.match(server, new RegExp(status));
  }
});
