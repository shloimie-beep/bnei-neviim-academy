const crypto = require('crypto');

const {
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  classifyDriveIntakeFile,
  findLaneDefinition,
  stableHash,
} = require('./one-time-drive-intake-map');

const VIDEO_DROP_STAGE = 'one_time_video_drop';
const DEFAULT_STABILITY_SECONDS = 120;
const DEFAULT_LEASE_SECONDS = 15 * 60;
const DEFAULT_MAX_RETRY_COUNT = 3;
const DEFAULT_RETRY_BACKOFF_SECONDS = [60, 5 * 60, 15 * 60];

const VIDEO_DROP_ENV_KEYS = [
  'ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID',
  'ONE_TIME_CLASS_RECORDINGS_FOLDER_ID',
  'GOOGLE_DRIVE_CLASS_RECORDINGS_FOLDER_ID',
];

const PROCESSING_STATES = Object.freeze({
  QUEUED: 'queued',
  LEASED: 'leased',
  PROCESSING: 'processing',
  RETRY_WAIT: 'retry_wait',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  DEAD_LETTER: 'dead_letter',
  DUPLICATE: 'duplicate',
});

function sha256(value) {
  return crypto.createHash('sha256').update(String(value ?? '')).digest('hex');
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function iso(value) {
  const date = toDate(value);
  return date ? date.toISOString() : '';
}

function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function toParentIds(file = {}) {
  const parents = Array.isArray(file.parents) ? file.parents : [];
  return [
    ...parents,
    file.parent_id,
    file.parentId,
    file.drive_folder_id,
  ].filter(Boolean).map(String);
}

function driveFileRedactedRef(value) {
  return value ? `drive_file:${sha256(value).slice(0, 12)}` : '';
}

function driveFolderRedactedRef(value) {
  return value ? `drive_folder:${sha256(value).slice(0, 12)}` : '';
}

function findVideoDropLaneInMap(driveMap = {}) {
  const lanes = Array.isArray(driveMap.lanes) ? driveMap.lanes : [];
  return lanes.find((lane) => {
    const definition = findLaneDefinition(lane);
    return definition?.drive_stage === VIDEO_DROP_STAGE;
  }) || null;
}

function resolveVideoDropFolder({ env = process.env, driveMap = {} } = {}) {
  for (const key of VIDEO_DROP_ENV_KEYS) {
    if (env[key]) {
      return {
        folder_id: String(env[key]).trim(),
        source: `env:${key}`,
        configured: true,
      };
    }
  }

  const lane = findVideoDropLaneInMap(driveMap);
  if (lane?.id) {
    return {
      folder_id: String(lane.id),
      source: 'drive_map:videoDrop',
      configured: true,
    };
  }

  return {
    folder_id: '',
    source: 'missing',
    configured: false,
    blocker: 'No One Time Drive video-drop folder ID was configured.',
  };
}

function driveFileSignature(file = {}) {
  const sizeBytes = toPositiveNumber(file.size || file.sizeBytes || file.drive_size_bytes);
  return {
    drive_file_id: String(file.id || file.drive_file_id || ''),
    name: String(file.name || file.title || ''),
    mime_type: String(file.mimeType || file.mime_type || ''),
    size_bytes: sizeBytes,
    md5_checksum: String(file.md5Checksum || file.md5_checksum || ''),
    sha256_checksum: String(file.sha256Checksum || file.sha256_checksum || ''),
    generation: String(file.version || file.generation || file.drive_generation || ''),
    head_revision_id: String(file.headRevisionId || file.head_revision_id || ''),
    modified_time: iso(file.modifiedTime || file.modified_time),
  };
}

function sameDriveObservation(current = {}, previous = {}) {
  const currentSig = driveFileSignature(current);
  const previousSig = driveFileSignature(previous);
  if (!currentSig.drive_file_id || currentSig.drive_file_id !== previousSig.drive_file_id) return false;
  if (!currentSig.size_bytes || currentSig.size_bytes !== previousSig.size_bytes) return false;
  if (currentSig.modified_time && previousSig.modified_time && currentSig.modified_time !== previousSig.modified_time) return false;
  const currentVersion = currentSig.md5_checksum || currentSig.sha256_checksum || currentSig.generation || currentSig.head_revision_id;
  const previousVersion = previousSig.md5_checksum || previousSig.sha256_checksum || previousSig.generation || previousSig.head_revision_id;
  return currentVersion ? currentVersion === previousVersion : true;
}

function sourceFingerprint(file = {}, folderId = '') {
  const sig = driveFileSignature(file);
  return sha256([
    ONE_TIME_WORKSPACE_KEY,
    ONE_TIME_PROJECT_KEY,
    VIDEO_DROP_STAGE,
    sig.drive_file_id,
    folderId,
    sig.md5_checksum || sig.sha256_checksum,
    sig.generation || sig.head_revision_id,
    sig.size_bytes,
    sig.modified_time,
  ].join('|'));
}

function existingJobMatches(existingJobs = [], fingerprint = '', file = {}) {
  const fileId = String(file.id || file.drive_file_id || '');
  return existingJobs.find((job) => {
    if (fingerprint && job.source_fingerprint === fingerprint) return true;
    return fileId
      && String(job.drive_file_id || '') === fileId
      && String(job.drive_stage || '') === VIDEO_DROP_STAGE
      && ![PROCESSING_STATES.DEAD_LETTER, 'archived'].includes(String(job.processing_state || job.status || ''));
  }) || null;
}

function evaluateStableFileAdmission(file = {}, {
  previousFile = null,
  now = new Date(),
  folderId = '',
  stabilitySeconds = DEFAULT_STABILITY_SECONDS,
} = {}) {
  const lane = findLaneDefinition(VIDEO_DROP_STAGE);
  const classification = classifyDriveIntakeFile(file, { id: folderId, name: lane?.name || '' });
  const signature = driveFileSignature(file);
  const parentIds = toParentIds(file);
  const blockers = [];

  if (!signature.drive_file_id) blockers.push('missing_drive_file_id');
  if (folderId && !parentIds.includes(String(folderId))) blockers.push('outside_one_time_video_drop_folder');
  if (!classification.eligible_for_transcription || classification.route !== 'transcription_intake') {
    blockers.push('not_transcription_media');
  }
  if (!signature.size_bytes) blockers.push('missing_or_zero_size');

  const modified = toDate(signature.modified_time);
  const nowDate = toDate(now) || new Date();
  const ageMs = modified ? nowDate.valueOf() - modified.valueOf() : 0;
  if (!modified) blockers.push('missing_modified_time');
  else if (ageMs < stabilitySeconds * 1000) blockers.push('modified_too_recent');

  const hasChecksumOrVersion = Boolean(
    signature.md5_checksum
    || signature.sha256_checksum
    || signature.generation
    || signature.head_revision_id
  );
  const observedStable = previousFile ? sameDriveObservation(file, previousFile) : false;
  if (!hasChecksumOrVersion && !observedStable) blockers.push('needs_second_matching_observation');

  const stable = blockers.length === 0;
  return {
    stable,
    status: stable ? 'stable' : 'waiting',
    blockers,
    classification,
    signature,
    observed_stable: observedStable,
    stability_seconds: stabilitySeconds,
    no_source_drive_mutation: true,
  };
}

function buildContentJobDraft(file = {}, {
  folderId = '',
  projectId = null,
  now = new Date(),
} = {}) {
  const sig = driveFileSignature(file);
  const fingerprint = sourceFingerprint(file, folderId);
  return {
    title: `One Time class media - ${sig.name || 'Drive upload'}`,
    source_type: 'google_drive',
    project_id: projectId,
    project_key: ONE_TIME_PROJECT_KEY,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    drive_file_id: sig.drive_file_id,
    drive_folder_id: folderId,
    drive_stage: VIDEO_DROP_STAGE,
    mime_type: sig.mime_type,
    status: 'ingested',
    processing_state: PROCESSING_STATES.QUEUED,
    source_fingerprint: fingerprint,
    drive_generation: sig.generation || sig.head_revision_id,
    drive_md5_checksum: sig.md5_checksum,
    drive_size_bytes: sig.size_bytes,
    drive_file_modified_at: sig.modified_time || null,
    retry_count: 0,
    source_provenance: {
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      drive_stage: VIDEO_DROP_STAGE,
      source_kind: 'google_drive_file',
      file_name: sig.name,
      mime_type: sig.mime_type,
      size_bytes: sig.size_bytes,
      md5_checksum_present: Boolean(sig.md5_checksum),
      generation_present: Boolean(sig.generation || sig.head_revision_id),
      admitted_at: iso(now),
      original_drive_file_preserved: true,
      no_source_drive_mutation: true,
    },
    notes: 'Queued by One Time Drive video intake orchestrator; original Drive file is not mutated.',
  };
}

function previousByDriveFileId(previousFiles = []) {
  const map = new Map();
  for (const file of previousFiles || []) {
    const id = String(file.id || file.drive_file_id || '');
    if (id) map.set(id, file);
  }
  return map;
}

function buildOneTimeDriveVideoIntakePlan({
  files = [],
  previousFiles = [],
  existingJobs = [],
  env = process.env,
  driveMap = {},
  now = new Date(),
  projectId = null,
  stabilitySeconds = DEFAULT_STABILITY_SECONDS,
} = {}) {
  const folder = resolveVideoDropFolder({ env, driveMap });
  const previous = previousByDriveFileId(previousFiles);
  const discovered = [];
  const inserts = [];
  const skips = [];
  const blockers = [];

  if (!folder.configured) blockers.push(folder.blocker);

  for (const file of files || []) {
    const id = String(file.id || file.drive_file_id || '');
    const previousFile = id ? previous.get(id) : null;
    const admission = evaluateStableFileAdmission(file, {
      previousFile,
      now,
      folderId: folder.folder_id,
      stabilitySeconds,
    });
    const fingerprint = sourceFingerprint(file, folder.folder_id);
    const matchedJob = existingJobMatches(existingJobs, fingerprint, file);
    const base = {
      drive_file_ref: driveFileRedactedRef(id),
      drive_folder_ref: driveFolderRedactedRef(folder.folder_id),
      file_name: String(file.name || file.title || ''),
      source_fingerprint: fingerprint,
      admission,
    };

    if (!folder.configured) {
      skips.push({ ...base, action: 'blocked', reason: 'missing_video_drop_folder_config' });
    } else if (!admission.stable) {
      skips.push({ ...base, action: 'wait_for_stability', blockers: admission.blockers });
    } else if (matchedJob) {
      skips.push({
        ...base,
        action: 'skip_existing_job',
        existing_job_id: matchedJob.id || null,
        existing_state: matchedJob.processing_state || matchedJob.status || '',
      });
    } else {
      const draft = buildContentJobDraft(file, { folderId: folder.folder_id, projectId, now });
      inserts.push({ ...base, action: 'insert_content_job', draft });
    }
    discovered.push(base);
  }

  return {
    generated_at: iso(now),
    mode: 'dry_run_no_writes',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    drive_stage: VIDEO_DROP_STAGE,
    folder,
    no_drive_write: true,
    no_database_write: true,
    no_vimeo_write: true,
    discovered_count: discovered.length,
    insert_count: inserts.length,
    skip_count: skips.length,
    blocker_count: blockers.length,
    discovered,
    job_inserts: inserts,
    skips,
    blockers,
  };
}

function jobLeaseActive(job = {}, now = new Date()) {
  const expires = toDate(job.lease_expires_at || job.leaseExpiresAt);
  if (!expires) return false;
  const nowDate = toDate(now) || new Date();
  return expires.valueOf() > nowDate.valueOf();
}

function retryBackoffSeconds(retryCount, backoffSeconds = DEFAULT_RETRY_BACKOFF_SECONDS) {
  const index = Math.max(0, Math.min(backoffSeconds.length - 1, Number(retryCount || 0)));
  return backoffSeconds[index] || backoffSeconds[backoffSeconds.length - 1] || 60;
}

function buildLeaseUpdate(job = {}, {
  now = new Date(),
  workerId = 'one-time-drive-video-orchestrator',
  leaseSeconds = DEFAULT_LEASE_SECONDS,
} = {}) {
  const nowDate = toDate(now) || new Date();
  return {
    job_id: job.id || null,
    action: 'lease_job',
    before: {
      processing_state: job.processing_state || '',
      lease_owner: job.lease_owner || null,
      lease_expires_at: job.lease_expires_at || null,
    },
    after: {
      processing_state: PROCESSING_STATES.LEASED,
      lease_owner: workerId,
      lease_expires_at: new Date(nowDate.valueOf() + leaseSeconds * 1000).toISOString(),
      updated_at: nowDate.toISOString(),
    },
  };
}

function buildRetryOrDeadLetterUpdate(job = {}, {
  now = new Date(),
  maxRetryCount = DEFAULT_MAX_RETRY_COUNT,
  backoffSeconds = DEFAULT_RETRY_BACKOFF_SECONDS,
  reason = 'lease expired before completion',
} = {}) {
  const nowDate = toDate(now) || new Date();
  const nextRetryCount = Number(job.retry_count || 0) + 1;
  if (nextRetryCount >= maxRetryCount) {
    return {
      job_id: job.id || null,
      action: 'dead_letter_job',
      before: {
        processing_state: job.processing_state || '',
        retry_count: Number(job.retry_count || 0),
      },
      after: {
        processing_state: PROCESSING_STATES.DEAD_LETTER,
        retry_count: nextRetryCount,
        last_error: reason,
        lease_owner: null,
        lease_expires_at: null,
        updated_at: nowDate.toISOString(),
      },
    };
  }

  const delaySeconds = retryBackoffSeconds(nextRetryCount, backoffSeconds);
  return {
    job_id: job.id || null,
    action: 'schedule_retry',
    before: {
      processing_state: job.processing_state || '',
      retry_count: Number(job.retry_count || 0),
    },
    after: {
      processing_state: PROCESSING_STATES.RETRY_WAIT,
      retry_count: nextRetryCount,
      last_error: reason,
      next_retry_at: new Date(nowDate.valueOf() + delaySeconds * 1000).toISOString(),
      lease_owner: null,
      lease_expires_at: null,
      updated_at: nowDate.toISOString(),
    },
  };
}

function buildLeaseAndRetryPlan({
  jobs = [],
  now = new Date(),
  workerId = 'one-time-drive-video-orchestrator',
  leaseSeconds = DEFAULT_LEASE_SECONDS,
  maxRetryCount = DEFAULT_MAX_RETRY_COUNT,
  backoffSeconds = DEFAULT_RETRY_BACKOFF_SECONDS,
} = {}) {
  const updates = [];
  const skips = [];
  const nowDate = toDate(now) || new Date();
  for (const job of jobs || []) {
    const state = String(job.processing_state || PROCESSING_STATES.QUEUED);
    const driveStage = String(job.drive_stage || '');
    if (driveStage && driveStage !== VIDEO_DROP_STAGE) {
      skips.push({ job_id: job.id || null, action: 'skip_wrong_drive_stage', state });
      continue;
    }
    if ([PROCESSING_STATES.COMPLETED, PROCESSING_STATES.DEAD_LETTER, 'published', 'archived'].includes(state)) {
      skips.push({ job_id: job.id || null, action: 'skip_terminal', state });
      continue;
    }
    if ([PROCESSING_STATES.LEASED, PROCESSING_STATES.PROCESSING].includes(state)) {
      if (jobLeaseActive(job, nowDate)) {
        skips.push({ job_id: job.id || null, action: 'skip_active_lease', state });
      } else {
        updates.push(buildRetryOrDeadLetterUpdate(job, { now: nowDate, maxRetryCount, backoffSeconds }));
      }
      continue;
    }
    if (state === PROCESSING_STATES.RETRY_WAIT) {
      const nextRetry = toDate(job.next_retry_at);
      if (nextRetry && nextRetry.valueOf() > nowDate.valueOf()) {
        skips.push({ job_id: job.id || null, action: 'skip_retry_not_due', state });
      } else {
        updates.push(buildLeaseUpdate(job, { now: nowDate, workerId, leaseSeconds }));
      }
      continue;
    }
    updates.push(buildLeaseUpdate(job, { now: nowDate, workerId, leaseSeconds }));
  }
  return {
    generated_at: nowDate.toISOString(),
    mode: 'dry_run_no_writes',
    no_database_write: true,
    update_count: updates.length,
    skip_count: skips.length,
    updates,
    skips,
  };
}

function safeIntakeReport(plan = {}) {
  return {
    generated_at: plan.generated_at,
    mode: plan.mode,
    workspace_key: plan.workspace_key,
    project_key: plan.project_key,
    drive_stage: plan.drive_stage,
    folder_ref: driveFolderRedactedRef(plan.folder?.folder_id),
    folder_source: plan.folder?.source || '',
    no_drive_write: plan.no_drive_write !== false,
    no_database_write: plan.no_database_write !== false,
    no_vimeo_write: plan.no_vimeo_write !== false,
    discovered_count: plan.discovered_count || 0,
    insert_count: plan.insert_count || 0,
    skip_count: plan.skip_count || 0,
    blocker_count: plan.blocker_count || 0,
    job_inserts: (plan.job_inserts || []).map((item) => ({
      action: item.action,
      drive_file_ref: item.drive_file_ref,
      drive_folder_ref: item.drive_folder_ref,
      file_name: item.file_name,
      source_fingerprint: item.source_fingerprint,
      processing_state: item.draft?.processing_state || '',
      source_type: item.draft?.source_type || '',
      no_source_drive_mutation: item.draft?.source_provenance?.no_source_drive_mutation === true,
    })),
    skips: (plan.skips || []).map((item) => ({
      action: item.action,
      drive_file_ref: item.drive_file_ref,
      drive_folder_ref: item.drive_folder_ref,
      file_name: item.file_name,
      blockers: item.blockers || item.admission?.blockers || [],
      existing_job_id: item.existing_job_id || null,
      existing_state: item.existing_state || '',
      reason: item.reason || '',
    })),
    blockers: plan.blockers || [],
  };
}

module.exports = {
  DEFAULT_LEASE_SECONDS,
  DEFAULT_MAX_RETRY_COUNT,
  DEFAULT_RETRY_BACKOFF_SECONDS,
  DEFAULT_STABILITY_SECONDS,
  PROCESSING_STATES,
  VIDEO_DROP_ENV_KEYS,
  VIDEO_DROP_STAGE,
  buildContentJobDraft,
  buildLeaseAndRetryPlan,
  buildLeaseUpdate,
  buildOneTimeDriveVideoIntakePlan,
  buildRetryOrDeadLetterUpdate,
  driveFileRedactedRef,
  driveFileSignature,
  driveFolderRedactedRef,
  evaluateStableFileAdmission,
  resolveVideoDropFolder,
  safeIntakeReport,
  sameDriveObservation,
  sha256,
  sourceFingerprint,
};
