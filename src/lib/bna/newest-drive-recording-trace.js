const {
  buildPipelineTraceRows,
  extractStructuredOutput,
  parseJsonMaybe,
  redactSensitiveText,
  redactedRef,
  sha256,
  transcriptChars,
} = require('./class-drive-intake-reconcile');

const BACKFILL_GUARDRAIL = 'NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.';
const PIPELINE_TERMINAL_STAGE_NAMES = [
  'source_discovered',
  'source_fingerprint',
  'intake_record',
  'queue_record',
  'download',
  'transcription_request',
  'transcription_result',
  'parser_request',
  'structured_output',
  'class_session_match',
  'student_name_alias_match',
  'ambiguity_review',
  'score_progress_proposal',
  'question_proposal',
  'profile_note_proposal',
  'accountability_proposal',
  'canonical_write_status',
  'operations_read_model_visibility',
  'parent_student_visibility',
  'retry_dedup_status',
];

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toTimestamp(value) {
  if (!value) return 0;
  const parsed = new Date(value).valueOf();
  return Number.isFinite(parsed) ? parsed : 0;
}

function newestByTime(rows, getTime) {
  return toArray(rows)
    .filter(Boolean)
    .sort((a, b) => getTime(b) - getTime(a) || String(b.id || '').localeCompare(String(a.id || '')))[0] || null;
}

function isLikelyRecordingFile(file = {}) {
  const value = `${file.name || ''} ${file.mimeType || ''}`.toLowerCase();
  return /audio|video|recording|class|lesson|shiur|\.m4a|\.mp3|\.mp4|\.mov|\.wav|\.webm/.test(value);
}

function isDriveBackedJob(job = {}) {
  const source = String(job.source_type || job.source || '').toLowerCase();
  return Boolean(job.drive_file_id || job.source_drive_file_id || /drive|recording|class/.test(source));
}

function jobTime(job = {}) {
  return Math.max(toTimestamp(job.updated_at), toTimestamp(job.created_at), toTimestamp(job.processed_at));
}

function fileTime(file = {}) {
  return Math.max(toTimestamp(file.modifiedTime), toTimestamp(file.createdTime));
}

function sanitizeDriveFile(file = null) {
  if (!file) return null;
  return {
    id_ref: redactedRef(file.id, 'drive_file'),
    name_ref: file.name ? `drive_file_name:${sha256(file.name).slice(0, 12)}` : null,
    mime_type: file.mimeType || null,
    created_time: file.createdTime || null,
    modified_time: file.modifiedTime || null,
    size_bytes: file.size ? Number(file.size) || null : null,
    folder_label: file.folder_label || null,
    folder_ref: file.folder_ref || null,
    likely_recording: isLikelyRecordingFile(file),
  };
}

function sanitizeJob(job = null) {
  if (!job) return null;
  return {
    job_id: job.id || null,
    job_ref: job.id ? `content_job:${job.id}` : null,
    source_type: job.source_type || null,
    status: job.status || null,
    drive_stage: job.drive_stage || null,
    created_at: job.created_at || null,
    updated_at: job.updated_at || null,
    processed_at: job.processed_at || null,
    transcript_chars: transcriptChars(job),
    drive_file_ref: redactedRef(job.drive_file_id || job.source_drive_file_id, 'drive_file'),
    drive_folder_ref: redactedRef(job.drive_folder_id, 'drive_folder'),
  };
}

function selectNewestDriveRecording({ driveFiles = [], jobs = [] } = {}) {
  const usableFiles = toArray(driveFiles).filter((file) => file?.id);
  const likelyFiles = usableFiles.filter(isLikelyRecordingFile);
  const selectedFile = newestByTime(likelyFiles.length ? likelyFiles : usableFiles, fileTime);
  const driveBackedJobs = toArray(jobs).filter(isDriveBackedJob);
  let selectedJob = null;
  let selectionReason = '';

  if (selectedFile) {
    selectedJob = newestByTime(
      driveBackedJobs.filter((job) => (
        String(job.drive_file_id || job.source_drive_file_id || '') === String(selectedFile.id)
      )),
      jobTime
    );
    selectionReason = selectedJob
      ? 'Newest Drive recording matched to a content job by Drive file id.'
      : 'Newest Drive recording discovered, but no matching content job was found.';
  } else {
    selectedJob = newestByTime(driveBackedJobs, jobTime);
    selectionReason = selectedJob
      ? 'Drive readback was unavailable or empty; newest Drive-backed content job was selected from production DB.'
      : 'No Drive recording file or Drive-backed content job was available for read-only inspection.';
  }

  return {
    selected_file: selectedFile,
    selected_job: selectedJob,
    selection_source: selectedFile ? 'google_drive_readback' : (selectedJob ? 'production_db_content_jobs' : 'none'),
    match_status: selectedFile && selectedJob ? 'matched' : (selectedFile ? 'drive_orphan' : (selectedJob ? 'db_only' : 'missing')),
    selection_reason: selectionReason,
  };
}

function relatedCounts(snapshot = {}, jobId = null) {
  const numericJobId = Number(jobId);
  const byJob = (rows, fields) => toArray(rows).filter((row) => fields.some((field) => Number(row?.[field]) === numericJobId)).length;
  const accountabilityRows = toArray(snapshot.accountabilityEvents).filter((row) => {
    const metadata = parseJsonMaybe(row.metadata, {}) || {};
    return Number(metadata.source_content_job_id || row.source_content_job_id || row.content_job_id) === numericJobId;
  }).length;

  return {
    class_sessions: byJob(snapshot.classSessions, ['content_job_id', 'source_content_job_id', 'job_id']),
    group_goal_entries: byJob(snapshot.groupGoalEntries, ['source_content_job_id', 'content_job_id', 'job_id']),
    torah_entries_scope: toArray(snapshot.torahEntries).length,
    accountability_events: accountabilityRows,
    content_outputs: byJob(snapshot.contentOutputs, ['job_id', 'content_job_id', 'source_content_job_id']),
    intake_parse_runs: toArray(snapshot.intakeParseRuns).length,
    raw_intake_rows: toArray(snapshot.rawIntake).length,
  };
}

function summarizeStructuredOutput(job = {}) {
  const structured = extractStructuredOutput(job);
  return {
    parser: structured.parser || null,
    class_notes: structured.class_notes.length,
    daily_torah_updates: structured.daily_torah_updates.length,
    group_goal_entries: structured.group_goal_entries.length,
    accountability_events: structured.accountability_events.length,
    tasks: structured.tasks.length,
    intake_parse_run_ref: structured.intake_parse_run_id ? `parse_run:${structured.intake_parse_run_id}` : null,
    raw_intake_stable_id: structured.raw_intake_stable_id || null,
  };
}

function stageStatus(traceRow, name) {
  return traceRow?.stages?.[name]?.status || 'UNKNOWN';
}

function firstProblemStage(traceRow) {
  if (!traceRow) return null;
  return PIPELINE_TERMINAL_STAGE_NAMES
    .map((name) => ({ name, stage: traceRow.stages?.[name] || null }))
    .find((item) => ['FAILED', 'MISSING', 'NEEDS_REVIEW', 'NEEDS_RETRY', 'UNKNOWN'].includes(item.stage?.status)) || null;
}

function inferVerdict({ traceRow, selected, dbBlockers = [], driveReadback = {} } = {}) {
  const blockers = [...toArray(dbBlockers).filter(Boolean)];
  if (driveReadback?.skipped && !selected?.selected_job) blockers.push(driveReadback.reason || 'Drive readback skipped.');

  if (!selected?.selected_file && !selected?.selected_job) {
    return {
      status: 'BLOCKED',
      summary: 'No newest Drive recording could be inspected from Drive or production DB.',
      blocker: blockers.join(' | ') || 'Drive and DB read-only discovery returned no recording source.',
      next_action: 'Restore read-only Drive/DB credentials or confirm the production Drive folder target, then rerun drive:trace-newest-recording.',
    };
  }

  if (selected?.selected_file && !selected?.selected_job) {
    return {
      status: 'BLOCKED',
      summary: 'Newest Drive recording is visible in Drive but has no matching production content job.',
      blocker: 'Drive discovery succeeded, but bna_content_jobs has no row for the selected Drive file id.',
      next_action: 'Inspect the Drive watcher/content-job creation path; do not apply class backfill.',
    };
  }

  if (!traceRow) {
    return {
      status: 'BLOCKED',
      summary: 'A content job was selected, but no pipeline trace row could be built.',
      blocker: 'Trace builder returned no row for the selected content job.',
      next_action: 'Inspect the read-only snapshot query and selected content job fields.',
    };
  }

  if (stageStatus(traceRow, 'transcription_result') === 'FAILED' || stageStatus(traceRow, 'retry_dedup_status') === 'NEEDS_RETRY') {
    return {
      status: 'BLOCKED',
      summary: 'Newest recording reached the queue but needs retry or transcription repair.',
      blocker: redactSensitiveText(traceRow.stages?.retry_dedup_status?.evidence || traceRow.stages?.transcription_result?.evidence || 'Retry/transcription failure is visible.'),
      next_action: 'Repair the worker/transcription blocker and retry the content job; do not apply class backfill.',
    };
  }

  if (stageStatus(traceRow, 'structured_output') !== 'CONFIRMED') {
    return {
      status: 'PARTIAL',
      summary: 'Newest recording has no confirmed structured class output.',
      blocker: redactSensitiveText(traceRow.stages?.structured_output?.evidence || 'Structured output is not confirmed.'),
      next_action: 'Inspect parser request/result for the content job; preserve the Issue #18 no-backfill guardrail.',
    };
  }

  if (stageStatus(traceRow, 'canonical_write_status') === 'MISSING') {
    return {
      status: 'PARTIAL',
      summary: 'Newest recording parsed but did not produce confirmed canonical class/progress writes.',
      blocker: redactSensitiveText(traceRow.stages?.canonical_write_status?.evidence || 'Canonical writes missing.'),
      next_action: 'Audit parser-to-canonical write path in read-only mode; do not run class backfill apply.',
    };
  }

  const problem = firstProblemStage(traceRow);
  if (problem && !['operations_read_model_visibility', 'parent_student_visibility'].includes(problem.name)) {
    return {
      status: problem.stage.status === 'UNKNOWN' ? 'PARTIAL' : 'BLOCKED',
      summary: `Newest recording has a pipeline issue at ${problem.name}.`,
      blocker: redactSensitiveText(problem.stage.evidence || problem.stage.status),
      next_action: 'Inspect the named pipeline stage before claiming production processing.',
    };
  }

  return {
    status: 'PROCESSED',
    summary: 'Newest recording has confirmed queue, transcript/parser, and canonical/read-model evidence.',
    blocker: '',
    next_action: 'No class backfill action is authorized; continue with read-only monitoring.',
  };
}

function buildNewestRecordingTrace({
  generatedAt = new Date().toISOString(),
  driveFiles = [],
  snapshot = {},
  dbBlockers = [],
  driveReadback = {},
  authStatus = {},
} = {}) {
  const selected = selectNewestDriveRecording({ driveFiles, jobs: snapshot.jobs || [] });
  const focusJobs = selected.selected_job ? [selected.selected_job] : [];
  const focusFiles = selected.selected_file ? [selected.selected_file] : [];
  const pipelineRows = buildPipelineTraceRows({
    jobs: focusJobs,
    driveFiles: focusFiles,
    classSessions: snapshot.classSessions,
    groupGoalEntries: snapshot.groupGoalEntries,
    torahEntries: snapshot.torahEntries,
    accountabilityEvents: snapshot.accountabilityEvents,
    contentOutputs: snapshot.contentOutputs,
    intakeParseRuns: snapshot.intakeParseRuns,
    rawIntake: snapshot.rawIntake,
    students: snapshot.students,
  });
  const traceRow = selected.selected_job
    ? pipelineRows.find((row) => row.kind === 'content_job' && Number(row.job_id) === Number(selected.selected_job.id))
    : pipelineRows.find((row) => row.kind === 'drive_orphan');
  const verdict = inferVerdict({ traceRow, selected, dbBlockers, driveReadback });

  return {
    generated_at: generatedAt,
    mode: 'read_only_newest_drive_recording_trace',
    no_production_mutation: true,
    read_only_authorization_phrase: 'READ_EXTERNAL_PRODUCTION_STATE',
    parent_requirement_id: 'REQ-20260625-025',
    source_issue: 'https://github.com/shloimie-beep/bnei-neviim-academy/issues/24',
    guardrails: {
      class_backfill: BACKFILL_GUARDRAIL,
      safe_to_apply_class_backfill: false,
      transcript_body_included: false,
      secret_values_included: false,
    },
    auth_status: {
      database: authStatus.database || null,
      google_drive: authStatus.google_drive || null,
      configured_drive_folders: authStatus.configured_drive_folders || 0,
      loaded_secret_file_count: authStatus.loaded_secret_file_count || 0,
    },
    drive_readback: {
      skipped: Boolean(driveReadback.skipped),
      reason: redactSensitiveText(driveReadback.reason || ''),
      files_seen: toArray(driveFiles).length,
      likely_recording_files_seen: toArray(driveFiles).filter(isLikelyRecordingFile).length,
    },
    selection: {
      source: selected.selection_source,
      match_status: selected.match_status,
      reason: selected.selection_reason,
      selected_file: sanitizeDriveFile(selected.selected_file),
      selected_job: sanitizeJob(selected.selected_job),
    },
    related_counts: selected.selected_job ? relatedCounts(snapshot, selected.selected_job.id) : relatedCounts(snapshot, null),
    structured_output_summary: selected.selected_job ? summarizeStructuredOutput(selected.selected_job) : null,
    stage_order: PIPELINE_TERMINAL_STAGE_NAMES,
    stage_trace: traceRow?.stages || null,
    pipeline_row: traceRow || null,
    verdict,
    exact_next_action: verdict.next_action,
  };
}

function renderNewestRecordingTraceMarkdown(trace = {}) {
  const stages = trace.stage_trace || {};
  return [
    '# Newest Drive Recording Read-Only Trace',
    '',
    `Generated: ${trace.generated_at || new Date().toISOString()}`,
    `Mode: ${trace.mode || 'read_only_newest_drive_recording_trace'}`,
    `No production mutation: ${trace.no_production_mutation !== false}`,
    `Class backfill guardrail: ${trace.guardrails?.class_backfill || BACKFILL_GUARDRAIL}`,
    '',
    '## Verdict',
    '',
    `- Status: ${trace.verdict?.status || 'UNKNOWN'}`,
    `- Summary: ${redactSensitiveText(trace.verdict?.summary || '')}`,
    `- Blocker: ${redactSensitiveText(trace.verdict?.blocker || 'none')}`,
    `- Next action: ${redactSensitiveText(trace.exact_next_action || trace.verdict?.next_action || '')}`,
    '',
    '## Selection',
    '',
    `- Source: ${trace.selection?.source || 'none'}`,
    `- Match status: ${trace.selection?.match_status || 'missing'}`,
    `- Reason: ${redactSensitiveText(trace.selection?.reason || '')}`,
    `- Selected Drive file: ${trace.selection?.selected_file?.id_ref?.redacted || 'none'}`,
    `- Selected content job: ${trace.selection?.selected_job?.job_ref || 'none'}`,
    `- Transcript chars: ${trace.selection?.selected_job?.transcript_chars ?? 0}`,
    '',
    '## Stage Verdict',
    '',
    '| Stage | Status | Evidence |',
    '| --- | --- | --- |',
    ...toArray(trace.stage_order || PIPELINE_TERMINAL_STAGE_NAMES).map((name) => {
      const item = stages[name] || {};
      return `| ${name} | ${item.status || 'UNKNOWN'} | ${redactSensitiveText(item.evidence || '')} |`;
    }),
    '',
    '## Structured Output Counts',
    '',
    '```json',
    JSON.stringify(trace.structured_output_summary || {}, null, 2),
    '```',
    '',
    '## Related Row Counts',
    '',
    '```json',
    JSON.stringify(trace.related_counts || {}, null, 2),
    '```',
    '',
  ].join('\n');
}

module.exports = {
  BACKFILL_GUARDRAIL,
  PIPELINE_TERMINAL_STAGE_NAMES,
  buildNewestRecordingTrace,
  inferVerdict,
  isLikelyRecordingFile,
  renderNewestRecordingTraceMarkdown,
  sanitizeDriveFile,
  sanitizeJob,
  selectNewestDriveRecording,
};
