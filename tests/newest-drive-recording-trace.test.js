const assert = require('assert');
const test = require('node:test');

const {
  buildNewestRecordingTrace,
  selectNewestDriveRecording,
} = require('../src/lib/bna/newest-drive-recording-trace');

function jobFixture(overrides = {}) {
  return {
    id: 81,
    title: 'Private raw class title',
    source_type: 'google_drive',
    drive_file_id: 'drive-new',
    drive_folder_id: 'folder-a',
    status: 'parsed',
    drive_stage: 'parsed',
    transcript_text: 'super secret transcript text that must not appear in evidence',
    created_at: '2026-06-25T08:00:00.000Z',
    updated_at: '2026-06-25T08:20:00.000Z',
    parse_json: {
      mixed_recording_parse: {
        parser: 'class-progress-parser',
        intake_parse_run_id: 501,
        parsed: {
          class_notes: [{ title: 'Private class title', summary: 'Private summary', student_questions: ['Amitai: Why?'] }],
          daily_torah_updates: [{ student_name: 'Amitai', date: '2026-06-25', goal_minutes: 20 }],
        },
      },
    },
    ...overrides,
  };
}

test('selects newest likely recording from Drive and matches its content job', () => {
  const result = selectNewestDriveRecording({
    driveFiles: [
      { id: 'drive-old', name: 'old-recording.mp4', mimeType: 'video/mp4', modifiedTime: '2026-06-24T08:00:00.000Z' },
      { id: 'drive-new', name: 'new-class.m4a', mimeType: 'audio/mp4', modifiedTime: '2026-06-25T08:00:00.000Z' },
    ],
    jobs: [jobFixture(), jobFixture({ id: 80, drive_file_id: 'drive-old' })],
  });

  assert.equal(result.selected_file.id, 'drive-new');
  assert.equal(result.selected_job.id, 81);
  assert.equal(result.match_status, 'matched');
});

test('builds a redacted read-only trace without transcript or Drive file names', () => {
  const trace = buildNewestRecordingTrace({
    generatedAt: '2026-06-25T09:00:00.000Z',
    driveFiles: [{ id: 'drive-new', name: 'new-class.m4a', mimeType: 'audio/mp4', modifiedTime: '2026-06-25T08:00:00.000Z' }],
    snapshot: {
      jobs: [jobFixture()],
      students: [{ id: 3, name: 'Amitai Kosovsky', status: 'active' }],
      classSessions: [],
      groupGoalEntries: [],
      torahEntries: [],
      accountabilityEvents: [],
      contentOutputs: [],
      intakeParseRuns: [{ id: 501, source_table: 'bna_content_jobs', source_id: '81', metadata: { raw_intake_stable_id: 'RAW-TRACE' } }],
      rawIntake: [{ stable_id: 'RAW-TRACE' }],
    },
    driveReadback: { skipped: false, files: [] },
    authStatus: { database: 'ready', google_drive: 'ready', configured_drive_folders: 1, loaded_secret_file_count: 2 },
  });

  assert.equal(trace.no_production_mutation, true);
  assert.equal(trace.guardrails.safe_to_apply_class_backfill, false);
  assert.equal(trace.selection.selected_job.job_ref, 'content_job:81');
  assert.equal(trace.stage_trace.structured_output.status, 'CONFIRMED');
  assert.equal(trace.verdict.status, 'PARTIAL');

  const serialized = JSON.stringify(trace);
  assert.equal(serialized.includes('super secret transcript text'), false);
  assert.equal(serialized.includes('new-class.m4a'), false);
  assert.equal(serialized.includes('Private raw class title'), false);
});

test('reports a Drive orphan when newest recording has no matching content job', () => {
  const trace = buildNewestRecordingTrace({
    driveFiles: [{ id: 'orphan-drive', name: 'orphan-recording.mp4', mimeType: 'video/mp4', modifiedTime: '2026-06-25T08:00:00.000Z' }],
    snapshot: { jobs: [] },
    driveReadback: { skipped: false, files: [] },
  });

  assert.equal(trace.selection.match_status, 'drive_orphan');
  assert.equal(trace.verdict.status, 'BLOCKED');
  assert.match(trace.verdict.blocker, /no row/i);
});

test('falls back to newest Drive-backed DB job when Drive readback is unavailable', () => {
  const trace = buildNewestRecordingTrace({
    driveFiles: [],
    snapshot: {
      jobs: [
        jobFixture({ id: 70, drive_file_id: 'older', updated_at: '2026-06-24T08:00:00.000Z' }),
        jobFixture({ id: 72, drive_file_id: 'newer', updated_at: '2026-06-25T08:00:00.000Z' }),
      ],
    },
    driveReadback: { skipped: true, reason: 'blocked auth', files: [] },
  });

  assert.equal(trace.selection.source, 'production_db_content_jobs');
  assert.equal(trace.selection.selected_job.job_ref, 'content_job:72');
});
