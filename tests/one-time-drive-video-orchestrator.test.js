const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  PROCESSING_STATES,
  VIDEO_DROP_STAGE,
  buildLeaseAndRetryPlan,
  buildOneTimeDriveVideoIntakePlan,
  evaluateStableFileAdmission,
  resolveVideoDropFolder,
  safeIntakeReport,
} = require('../src/lib/bna/one-time-drive-video-orchestrator');

const folderId = 'drive-folder-video-drop';
const now = '2026-07-13T12:00:00.000Z';

function driveFile(overrides = {}) {
  return {
    id: 'drive-file-001',
    name: 'Rabbi Scheller Mishnah class 001.mp4',
    mimeType: 'video/mp4',
    size: '12000000',
    md5Checksum: 'abc123fixture',
    version: '7',
    modifiedTime: '2026-07-13T11:50:00.000Z',
    parents: [folderId],
    ...overrides,
  };
}

test('resolves the canonical One Time video-drop folder from explicit env first', () => {
  const resolved = resolveVideoDropFolder({
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    driveMap: {
      lanes: [{ key: 'videoDrop', id: 'drive-map-folder' }],
    },
  });

  assert.equal(resolved.folder_id, folderId);
  assert.equal(resolved.source, 'env:ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID');
  assert.equal(resolved.configured, true);
});

test('falls back to the One Time Drive map video lane when env is absent', () => {
  const resolved = resolveVideoDropFolder({
    env: {},
    driveMap: {
      lanes: [{ key: 'videoDrop', id: folderId }],
    },
  });

  assert.equal(resolved.folder_id, folderId);
  assert.equal(resolved.source, 'drive_map:videoDrop');
  assert.equal(resolved.configured, true);
});

test('waits for recently modified media instead of creating an unstable job', () => {
  const admission = evaluateStableFileAdmission(driveFile({
    modifiedTime: '2026-07-13T11:59:10.000Z',
  }), {
    now,
    folderId,
    stabilitySeconds: 120,
  });

  assert.equal(admission.stable, false);
  assert.ok(admission.blockers.includes('modified_too_recent'));
  assert.equal(admission.no_source_drive_mutation, true);
});

test('admits checksum-backed stable video and drafts exactly one scoped content job', () => {
  const plan = buildOneTimeDriveVideoIntakePlan({
    files: [driveFile()],
    existingJobs: [],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
    projectId: 42,
  });

  assert.equal(plan.insert_count, 1);
  assert.equal(plan.skip_count, 0);
  const draft = plan.job_inserts[0].draft;
  assert.equal(draft.source_type, 'google_drive');
  assert.equal(draft.project_key, 'one_time_mishnah_class');
  assert.equal(draft.workspace_key, 'rabbi_sheller_provider');
  assert.equal(draft.project_id, 42);
  assert.equal(draft.drive_stage, VIDEO_DROP_STAGE);
  assert.equal(draft.processing_state, PROCESSING_STATES.QUEUED);
  assert.equal(draft.status, 'ingested');
  assert.equal(draft.source_provenance.original_drive_file_preserved, true);
  assert.equal(draft.source_provenance.no_source_drive_mutation, true);
  assert.equal(typeof draft.source_fingerprint, 'string');
  assert.equal(draft.source_fingerprint.length, 64);
});

test('supports stable MKV recording intake when Drive metadata proves the file is complete', () => {
  const plan = buildOneTimeDriveVideoIntakePlan({
    files: [driveFile({
      id: 'drive-file-mkv',
      name: 'OBS Mishnah recording.mkv',
      mimeType: 'video/x-matroska',
      md5Checksum: 'mkvchecksumfixture',
      version: '11',
    })],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
  });

  assert.equal(plan.insert_count, 1);
  assert.equal(plan.job_inserts[0].draft.mime_type, 'video/x-matroska');
});

test('requires a second matching observation when checksum/version metadata is absent', () => {
  const file = driveFile({
    id: 'drive-file-no-md5',
    md5Checksum: '',
    version: '',
    headRevisionId: '',
  });

  const firstPass = buildOneTimeDriveVideoIntakePlan({
    files: [file],
    previousFiles: [],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
  });
  assert.equal(firstPass.insert_count, 0);
  assert.deepEqual(firstPass.skips[0].blockers, ['needs_second_matching_observation']);

  const secondPass = buildOneTimeDriveVideoIntakePlan({
    files: [file],
    previousFiles: [file],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
  });
  assert.equal(secondPass.insert_count, 1);
});

test('suppresses duplicate content jobs by fingerprint and Drive source identity', () => {
  const first = buildOneTimeDriveVideoIntakePlan({
    files: [driveFile()],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
  });
  const fingerprint = first.job_inserts[0].draft.source_fingerprint;

  const rerun = buildOneTimeDriveVideoIntakePlan({
    files: [driveFile()],
    existingJobs: [{
      id: 101,
      source_fingerprint: fingerprint,
      drive_file_id: 'drive-file-001',
      drive_stage: VIDEO_DROP_STAGE,
      processing_state: PROCESSING_STATES.QUEUED,
    }],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
  });

  assert.equal(rerun.insert_count, 0);
  assert.equal(rerun.skips[0].action, 'skip_existing_job');
  assert.equal(rerun.skips[0].existing_job_id, 101);
});

test('does not create jobs for source materials or files outside the video drop folder', () => {
  const plan = buildOneTimeDriveVideoIntakePlan({
    files: [
      driveFile({ id: 'source-sheet', name: 'source sheet.pdf', mimeType: 'application/pdf', parents: [folderId] }),
      driveFile({ id: 'wrong-folder', parents: ['other-folder'] }),
    ],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
  });

  assert.equal(plan.insert_count, 0);
  assert.equal(plan.skips.length, 2);
  assert.ok(plan.skips[0].blockers.includes('not_transcription_media'));
  assert.ok(plan.skips[1].blockers.includes('outside_one_time_video_drop_folder'));
});

test('safe report redacts Drive identifiers while preserving evidence', () => {
  const plan = buildOneTimeDriveVideoIntakePlan({
    files: [driveFile()],
    env: { ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID: folderId },
    now,
  });
  const report = safeIntakeReport(plan);
  const serialized = JSON.stringify(report);

  assert.equal(report.insert_count, 1);
  assert.doesNotMatch(serialized, /drive-file-001/);
  assert.doesNotMatch(serialized, /drive-folder-video-drop/);
  assert.match(serialized, /drive_file:[0-9a-f]{12}/);
  assert.match(serialized, /drive_folder:[0-9a-f]{12}/);
});

test('lease plan leases due jobs and leaves active leases untouched', () => {
  const plan = buildLeaseAndRetryPlan({
    now,
    workerId: 'worker-a',
    jobs: [
      { id: 1, drive_stage: VIDEO_DROP_STAGE, processing_state: PROCESSING_STATES.QUEUED },
      {
        id: 2,
        drive_stage: VIDEO_DROP_STAGE,
        processing_state: PROCESSING_STATES.LEASED,
        lease_owner: 'worker-b',
        lease_expires_at: '2026-07-13T12:10:00.000Z',
      },
    ],
  });

  assert.equal(plan.update_count, 1);
  assert.equal(plan.updates[0].job_id, 1);
  assert.equal(plan.updates[0].after.processing_state, PROCESSING_STATES.LEASED);
  assert.equal(plan.updates[0].after.lease_owner, 'worker-a');
  assert.equal(plan.skips[0].action, 'skip_active_lease');
});

test('expired leases schedule retries and dead-letter after the configured max retry count', () => {
  const plan = buildLeaseAndRetryPlan({
    now,
    maxRetryCount: 3,
    jobs: [
      {
        id: 3,
        drive_stage: VIDEO_DROP_STAGE,
        processing_state: PROCESSING_STATES.PROCESSING,
        retry_count: 1,
        lease_expires_at: '2026-07-13T11:30:00.000Z',
      },
      {
        id: 4,
        drive_stage: VIDEO_DROP_STAGE,
        processing_state: PROCESSING_STATES.PROCESSING,
        retry_count: 2,
        lease_expires_at: '2026-07-13T11:30:00.000Z',
      },
    ],
  });

  assert.equal(plan.update_count, 2);
  assert.equal(plan.updates[0].action, 'schedule_retry');
  assert.equal(plan.updates[0].after.processing_state, PROCESSING_STATES.RETRY_WAIT);
  assert.equal(plan.updates[1].action, 'dead_letter_job');
  assert.equal(plan.updates[1].after.processing_state, PROCESSING_STATES.DEAD_LETTER);
});

test('content job schema can store orchestrator fingerprints, leases, retries, and provenance', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  for (const term of [
    'source_fingerprint TEXT',
    'processing_state TEXT',
    'lease_owner TEXT',
    'lease_expires_at TIMESTAMP',
    'retry_count INTEGER',
    'next_retry_at TIMESTAMP',
    'source_provenance JSONB',
    'idx_bna_content_jobs_source_fingerprint',
    'idx_bna_content_jobs_lease_due',
    'bna_content_jobs_processing_state_check',
  ]) {
    assert.match(server, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
