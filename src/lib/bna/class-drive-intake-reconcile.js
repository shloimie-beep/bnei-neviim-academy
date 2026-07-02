'use strict';

const crypto = require('crypto');

function toArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function parseJsonMaybe(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function redactSensitiveText(value = '') {
  return String(value || '')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, '[redacted-phone]')
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, '[redacted-openai-key]')
    .replace(/\b(?:ya29|xox[baprs]|gh[pousr]|railway)_[A-Za-z0-9_-]{12,}\b/gi, '[redacted-token]')
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, (match) => `[redacted:${sha256(match).slice(0, 10)}]`);
}

function redactedRef(value = '', prefix = 'ref') {
  const raw = String(value || '').trim();
  if (!raw) return { redacted: null, hash: null };
  const hash = sha256(raw).slice(0, 16);
  return {
    redacted: `${prefix}:${hash}`,
    hash,
  };
}

function transcriptChars(job = {}) {
  return String(
    job.transcript_text ||
    job.transcript ||
    job.transcriptText ||
    job.raw_transcript ||
    job.text ||
    ''
  ).length;
}

function extractStructuredOutput(job = {}) {
  const parse = parseJsonMaybe(job.parse_json, {}) || {};
  const mixed = parseJsonMaybe(parse.mixed_recording_parse, parse.mixed_recording_parse || {}) || {};
  const parsed = mixed.parsed || parse.parsed || parse || {};
  const classNotes = [
    ...toArray(parsed.class_notes),
    ...toArray(parse.class_notes),
    ...toArray(job.class_notes),
  ];
  return {
    parser: mixed.parser || parse.parser || parsed.parser || job.parser || null,
    tasks: toArray(parsed.tasks || parse.tasks || job.tasks),
    class_notes: classNotes,
    daily_torah_updates: toArray(parsed.daily_torah_updates || parse.daily_torah_updates),
    group_goal_entries: toArray(parsed.group_goal_entries || parse.group_goal_entries),
    accountability_events: toArray(parsed.accountability_events || parse.accountability_events),
    intake_parse_run_id: mixed.intake_parse_run_id || parse.intake_parse_run_id || job.intake_parse_run_id || null,
    raw_intake_stable_id: mixed.raw_intake_stable_id || parse.raw_intake_stable_id || job.raw_intake_stable_id || null,
  };
}

function hasRow(rows = [], predicate) {
  return toArray(rows).some(predicate);
}

function stage(status, evidence = '') {
  return { status, evidence };
}

function buildPipelineTraceRows({
  jobs = [],
  driveFiles = [],
  classSessions = [],
  groupGoalEntries = [],
  torahEntries = [],
  accountabilityEvents = [],
  contentOutputs = [],
  intakeParseRuns = [],
  rawIntake = [],
  students = [],
} = {}) {
  const driveIds = new Set(toArray(driveFiles).map((file) => String(file.id || '').trim()).filter(Boolean));
  return toArray(jobs).map((job) => {
    const structured = extractStructuredOutput(job);
    const jobId = Number(job.id || 0);
    const driveId = String(job.drive_file_id || job.source_drive_file_id || '').trim();
    const hasTranscript = transcriptChars(job) > 0;
    const hasStructured = Boolean(
      structured.parser ||
      structured.class_notes.length ||
      structured.tasks.length ||
      structured.daily_torah_updates.length ||
      structured.group_goal_entries.length ||
      structured.accountability_events.length
    );
    const hasCanonicalRows = hasRow(classSessions, (row) => Number(row.content_job_id || row.job_id) === jobId) ||
      hasRow(groupGoalEntries, (row) => Number(row.content_job_id || row.job_id) === jobId) ||
      hasRow(torahEntries, (row) => Number(row.content_job_id || row.job_id) === jobId) ||
      hasRow(accountabilityEvents, (row) => Number(row.content_job_id || row.job_id) === jobId) ||
      hasRow(contentOutputs, (row) => Number(row.job_id || row.content_job_id) === jobId);
    const hasParseRun = hasRow(intakeParseRuns, (row) => String(row.source_id || row.content_job_id || row.job_id) === String(jobId));
    const hasRaw = hasRow(rawIntake, (row) => String(row.source_id || row.content_job_id || row.job_id) === String(jobId));
    const questionProposalCount = structured.class_notes.reduce((count, note) => {
      return count + toArray(note?.student_questions).length + toArray(note?.questions).length;
    }, 0);
    const hasStudentCandidates = structured.class_notes.some((note) => {
      return toArray(note?.student_questions).length || toArray(note?.questions).length || note?.student_name;
    });

    return {
      kind: 'content_job',
      job_id: job.id || null,
      job_ref: job.id ? `content_job:${job.id}` : null,
      status: job.status || '',
      drive_stage: job.drive_stage || '',
      parser: structured.parser || '',
      transcript_chars: transcriptChars(job),
      source_recording_ref: redactedRef(driveId || job.media_url || job.source_media_url, 'drive_file'),
      stages: {
        source_discovered: stage(jobId ? 'CONFIRMED' : 'MISSING', jobId ? `content_job:${job.id}` : 'no content job id'),
        source_fingerprint: stage(driveId || driveIds.has(driveId) ? 'CONFIRMED' : 'MISSING', driveId ? redactedRef(driveId, 'drive_file').redacted : ''),
        intake_record: stage(hasRaw || job.raw_intake_stable_id ? 'CONFIRMED' : 'MISSING', job.raw_intake_stable_id || ''),
        queue_record: stage(jobId ? 'CONFIRMED' : 'MISSING', jobId ? 'content job row exists' : ''),
        download: stage(driveId && driveIds.has(driveId) ? 'CONFIRMED' : driveId ? 'NEEDS_REVIEW' : 'MISSING', driveId ? 'drive id linked to job' : 'no drive id on job'),
        transcription_request: stage(hasTranscript ? 'CONFIRMED' : 'MISSING', hasTranscript ? `${transcriptChars(job)} transcript chars` : ''),
        transcription_result: stage(hasTranscript ? 'CONFIRMED' : 'MISSING', hasTranscript ? `${transcriptChars(job)} transcript chars` : ''),
        parser_request: stage(hasParseRun || structured.parser ? 'CONFIRMED' : 'MISSING', structured.intake_parse_run_id ? `parse_run:${structured.intake_parse_run_id}` : ''),
        structured_output: stage(hasStructured ? 'CONFIRMED' : 'MISSING', structured.parser || 'no parser metadata'),
        class_session_match: stage(hasRow(classSessions, (row) => Number(row.content_job_id || row.job_id) === jobId) ? 'CONFIRMED' : 'MISSING', ''),
        student_name_alias_match: stage(hasStudentCandidates ? 'NEEDS_REVIEW' : 'MISSING', hasStudentCandidates ? `${questionProposalCount} question candidate(s)` : 'no student question candidates'),
        ambiguity_review: stage(hasStudentCandidates ? 'NEEDS_REVIEW' : 'MISSING', hasStudentCandidates ? 'question candidates need review before publishing' : 'no ambiguity candidates'),
        score_progress_proposal: stage(structured.daily_torah_updates.length || structured.group_goal_entries.length ? 'CONFIRMED' : 'MISSING', ''),
        question_proposal: stage(questionProposalCount ? 'CONFIRMED' : 'MISSING', questionProposalCount ? `${questionProposalCount} question candidate(s)` : 'no question candidates'),
        profile_note_proposal: stage(structured.class_notes.length ? 'CONFIRMED' : 'MISSING', structured.class_notes.length ? `${structured.class_notes.length} class note(s)` : 'no class notes'),
        accountability_proposal: stage(structured.accountability_events.length ? 'CONFIRMED' : 'MISSING', ''),
        canonical_write_status: stage(hasCanonicalRows ? 'CONFIRMED' : 'MISSING', hasCanonicalRows ? 'canonical row found' : 'no canonical row found'),
        operations_read_model_visibility: stage(hasCanonicalRows ? 'CONFIRMED' : 'MISSING', ''),
        parent_student_visibility: stage(hasCanonicalRows ? 'NEEDS_REVIEW' : 'MISSING', ''),
        retry_dedup_status: stage('CONFIRMED', 'duplicate review not flagged by this read-only trace'),
      },
    };
  });
}

module.exports = {
  buildPipelineTraceRows,
  extractStructuredOutput,
  parseJsonMaybe,
  redactSensitiveText,
  redactedRef,
  sha256,
  transcriptChars,
};
