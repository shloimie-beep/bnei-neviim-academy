const fs = require('fs');
const path = require('path');

const {
  buildPipelineTraceRows,
  extractStructuredOutput,
  parseJsonMaybe,
  redactSensitiveText,
  redactedRef,
  sha256,
  transcriptChars,
} = require('./class-drive-intake-reconcile');

const DEFAULT_START_DATE = '2026-06-12';
const DEFAULT_END_DATE = '2026-06-26';
const DEFAULT_OUT_DIR = path.join(
  'ops',
  'class-drive-intake',
  '2026-06-26-two-week-class-intake-audit'
);
const BACKFILL_GUARDRAIL = 'NOT SAFE TO APPLY - Issue #18 guardrail preserved; no class backfill writes attempted.';

const PIPELINE_STAGE_ORDER = [
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
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
}

function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

function toTimestamp(value) {
  if (!value) return 0;
  const parsed = new Date(value).valueOf();
  return Number.isFinite(parsed) ? parsed : 0;
}

function dayEndTimestamp(date) {
  const iso = toIsoDate(date);
  if (!iso) return 0;
  return new Date(`${iso}T23:59:59.999Z`).valueOf();
}

function dayStartTimestamp(date) {
  const iso = toIsoDate(date);
  if (!iso) return 0;
  return new Date(`${iso}T00:00:00.000Z`).valueOf();
}

function isWithinRange(value, startDate = DEFAULT_START_DATE, endDate = DEFAULT_END_DATE) {
  const ts = toTimestamp(value);
  if (!ts) return false;
  return ts >= dayStartTimestamp(startDate) && ts <= dayEndTimestamp(endDate);
}

function compactWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value || {}).filter(([, item]) => item !== undefined && item !== null && item !== '')
  );
}

function statusOfStage(row, stageName) {
  return row?.stages?.[stageName]?.status || 'UNKNOWN';
}

function evidenceOfStage(row, stageName) {
  return row?.stages?.[stageName]?.evidence || '';
}

function likelyRecordingName(value) {
  return /audio|video|recording|class|lesson|shiur|voice|\.m4a|\.mp3|\.mp4|\.mov|\.wav|\.webm/i.test(String(value || ''));
}

function isLikelyRecordingFile(file = {}) {
  const name = file.name || file.title || '';
  const mime = file.mimeType || file.mime_type || '';
  return likelyRecordingName(`${name} ${mime}`);
}

function normalizeDriveFile(file = {}, folder = {}) {
  const id = file.id || file.file_id || file.drive_file_id || '';
  const name = file.name || file.title || file.filename || '';
  const createdTime = file.createdTime || file.created_time || file.created_at || '';
  const modifiedTime = file.modifiedTime || file.modified_time || file.updated_at || '';
  const mimeType = file.mimeType || file.mime_type || '';
  return compactObject({
    id,
    name,
    mimeType,
    size: file.size || file.size_bytes || '',
    createdTime,
    modifiedTime,
    webViewLink: file.webViewLink || file.url || file.web_view_link || '',
    folder_label: folder.label || file.folder_label || folder.name || '',
    folder_ref: folder.id ? redactedRef(folder.id, 'drive_folder') : file.folder_ref || null,
    likely_recording: isLikelyRecordingFile({ name, mimeType }),
  });
}

function sanitizeDriveFile(file = {}) {
  return compactObject({
    id_ref: redactedRef(file.id, 'drive_file'),
    name_ref: file.name ? `drive_file_name:${sha256(file.name).slice(0, 12)}` : null,
    mime_type: file.mimeType || null,
    created_time: file.createdTime || null,
    modified_time: file.modifiedTime || null,
    size_bytes: file.size ? Number(file.size) || null : null,
    folder_label: file.folder_label || null,
    folder_ref: file.folder_ref || null,
    likely_recording: Boolean(file.likely_recording || isLikelyRecordingFile(file)),
  });
}

function jobTime(job = {}) {
  return Math.max(
    toTimestamp(job.created_at),
    toTimestamp(job.updated_at),
    toTimestamp(job.processed_at),
    toTimestamp(job.transcribed_at),
    toTimestamp(job.parsed_at)
  );
}

function jobDate(job = {}) {
  return (
    toIsoDate(job.class_date) ||
    toIsoDate(job.recorded_date) ||
    toIsoDate(job.created_at) ||
    toIsoDate(job.updated_at) ||
    ''
  );
}

function jobLikelyClassRecording(job = {}) {
  const title = `${job.title || ''} ${job.source_type || ''} ${job.drive_stage || ''} ${job.media_url || ''}`;
  const length = transcriptChars(job);
  if (/smoke|test content|prompt studio|codex smoke|google business profile|handling ui updates/i.test(title)) return false;
  if (/class|recording|torah|voice|m4a|mp4|shiur|mishnah|mishnayos|bnei neviim|one time|rabbi/i.test(title)) return true;
  if (job.drive_file_id || job.source_drive_file_id) return length >= 500;
  return length >= 1800;
}

function driveIdFromUrl(value) {
  const raw = String(value || '');
  const match = raw.match(/\/d\/([A-Za-z0-9_-]{10,})/) || raw.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  return match ? match[1] : '';
}

function driveFileIdsForJob(job = {}) {
  return new Set([
    job.drive_file_id,
    job.source_drive_file_id,
    driveIdFromUrl(job.media_url),
    driveIdFromUrl(job.source_media_url),
  ].map((item) => String(item || '').trim()).filter(Boolean));
}

function matchDriveFilesToJobs(driveFiles = [], jobs = []) {
  const byDriveId = new Map();
  for (const job of toArray(jobs)) {
    for (const id of driveFileIdsForJob(job)) {
      if (!byDriveId.has(id)) byDriveId.set(id, []);
      byDriveId.get(id).push(job);
    }
  }

  return toArray(driveFiles).map((file) => {
    const id = String(file.id || '');
    const matches = byDriveId.get(id) || [];
    return {
      file,
      matched_jobs: matches.map((job) => job.id).filter(Boolean),
      match_status: matches.length ? (matches.length === 1 ? 'matched' : 'duplicate_matches') : 'orphan',
    };
  });
}

function selectScope({ jobs = [], driveFiles = [], startDate = DEFAULT_START_DATE, endDate = DEFAULT_END_DATE, jobIds = [], minJobId = null, maxJobId = null } = {}) {
  const explicitIds = new Set(toArray(jobIds).map(Number).filter(Boolean));
  const filesInRange = toArray(driveFiles)
    .filter((file) => isLikelyRecordingFile(file))
    .filter((file) => isWithinRange(file.createdTime, startDate, endDate) || isWithinRange(file.modifiedTime, startDate, endDate));

  const fileIds = new Set(filesInRange.map((file) => String(file.id || '')).filter(Boolean));
  const jobsInRange = toArray(jobs).filter((job) => {
    const id = Number(job.id);
    if (explicitIds.size && explicitIds.has(id)) return true;
    if (minJobId !== null && id && id >= Number(minJobId) && (maxJobId === null || id <= Number(maxJobId))) return true;
    if (!jobLikelyClassRecording(job)) return false;
    if (isWithinRange(job.created_at, startDate, endDate) || isWithinRange(job.updated_at, startDate, endDate) || isWithinRange(job.processed_at, startDate, endDate)) return true;
    for (const fileId of driveFileIdsForJob(job)) {
      if (fileIds.has(fileId)) return true;
    }
    return false;
  });

  const matchedDriveIds = new Set();
  for (const job of jobsInRange) {
    for (const fileId of driveFileIdsForJob(job)) matchedDriveIds.add(fileId);
  }

  const driveOrphans = filesInRange.filter((file) => !matchedDriveIds.has(String(file.id || '')));
  return { filesInRange, jobsInRange, driveOrphans };
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[^a-z0-9\u0590-\u05FF]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function studentDisplayName(student = {}) {
  return student.full_name || student.name || student.student_name || [student.first_name, student.last_name].filter(Boolean).join(' ');
}

function matchStudentName(studentName, students = []) {
  const normalized = normalizeName(studentName);
  if (!normalized) {
    return {
      match_status: 'no_student_name',
      student_name_hash: null,
      matched_student_ref: null,
      confidence: 0,
      contenders: [],
    };
  }

  const ranked = toArray(students)
    .map((student) => {
      const candidates = [
        studentDisplayName(student),
        student.fullName,
        student.nickname,
        student.hebrew_name,
        student.alias,
      ].filter(Boolean).map(normalizeName);
      let score = 0;
      for (const candidate of candidates) {
        if (!candidate) continue;
        if (candidate === normalized) score = Math.max(score, 100);
        else if (candidate.includes(normalized) || normalized.includes(candidate)) score = Math.max(score, 82);
        else {
          const nameParts = new Set(candidate.split(' ').filter(Boolean));
          const inputParts = normalized.split(' ').filter(Boolean);
          const overlap = inputParts.filter((part) => nameParts.has(part)).length;
          if (overlap) score = Math.max(score, Math.min(75, Math.round((overlap / Math.max(inputParts.length, 1)) * 75)));
        }
      }
      return { student, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(a.student?.id || 0) - Number(b.student?.id || 0));

  const best = ranked[0];
  const ambiguous = Boolean(best && ranked[1] && ranked[1].score === best.score && best.score < 100);
  return {
    match_status: !best ? 'unmatched' : (ambiguous ? 'ambiguous' : 'matched'),
    student_name_hash: sha256(normalized).slice(0, 12),
    matched_student_ref: best?.student?.id ? `student:${best.student.id}` : null,
    confidence: best?.score || 0,
    contenders: ranked.slice(0, 3).map((item) => ({
      student_ref: item.student?.id ? `student:${item.student.id}` : null,
      score: item.score,
    })),
  };
}

function normalizeQuestionCandidate(value = {}, fallbackStudentName = '') {
  if (typeof value === 'string') {
    const raw = compactWhitespace(value);
    const match = raw.match(/^([^:-]{2,80})[:-]\s*(.+)$/);
    return {
      student_name: match ? compactWhitespace(match[1]) : fallbackStudentName,
      question_text: match ? compactWhitespace(match[2]) : raw,
      raw_kind: 'string',
    };
  }
  if (value && typeof value === 'object') {
    return {
      student_name: compactWhitespace(value.student_name || value.student || value.name || fallbackStudentName),
      question_text: compactWhitespace(value.question_text || value.question || value.text || value.title || value.summary || ''),
      topic: compactWhitespace(value.topic || value.subject || ''),
      source_kind: compactWhitespace(value.source_kind || value.kind || ''),
      raw_kind: 'object',
    };
  }
  return { student_name: fallbackStudentName, question_text: '', raw_kind: typeof value };
}

function collectQuestionCandidates(job = {}) {
  const structured = extractStructuredOutput(job);
  const parse = parseJsonMaybe(job.parse_json, {}) || {};
  const mixed = parseJsonMaybe(parse.mixed_recording_parse, parse.mixed_recording_parse || {}) || {};
  const parsed = mixed.parsed || parse.parsed || {};

  const rows = [];

  function pushCandidate(candidate, context = {}) {
    const normalized = normalizeQuestionCandidate(candidate, context.student_name || '');
    if (!normalized.question_text) return;
    rows.push({
      ...normalized,
      context,
    });
  }

  for (const [noteIndex, note] of toArray(structured.class_notes).entries()) {
    const context = {
      source_kind: 'class_notes.student_questions',
      class_note_index: noteIndex,
      class_note_title_hash: note?.title ? sha256(note.title).slice(0, 12) : null,
      student_name: note?.student_name || '',
    };
    for (const question of toArray(note?.student_questions)) pushCandidate(question, context);
    for (const question of toArray(note?.questions)) pushCandidate(question, { ...context, source_kind: 'class_notes.questions' });
    for (const discussion of toArray(note?.discussions)) {
      if (/\?$/.test(compactWhitespace(typeof discussion === 'string' ? discussion : JSON.stringify(discussion)))) {
        pushCandidate(discussion, { ...context, source_kind: 'class_notes.discussions_question' });
      }
    }
  }

  for (const question of toArray(parse.student_questions)) pushCandidate(question, { source_kind: 'parse.student_questions' });
  for (const question of toArray(mixed.student_questions)) pushCandidate(question, { source_kind: 'mixed_recording_parse.student_questions' });
  for (const question of toArray(parsed.student_questions)) pushCandidate(question, { source_kind: 'mixed_recording_parse.parsed.student_questions' });

  return rows;
}

function buildStudentQuestionMatrix({ jobs = [], students = [], includePrivateText = false } = {}) {
  const matrix = [];
  for (const job of toArray(jobs)) {
    const questions = collectQuestionCandidates(job);
    const seenQuestionKeys = new Set();
    let visibleIndex = 0;
    for (const question of questions) {
      const dedupeKey = sha256([
        job.id || '',
        normalizeName(question.student_name),
        compactWhitespace(question.question_text).toLowerCase(),
      ].join('\n'));
      if (seenQuestionKeys.has(dedupeKey)) continue;
      seenQuestionKeys.add(dedupeKey);
      visibleIndex += 1;
      const match = matchStudentName(question.student_name, students);
      const questionHash = sha256(question.question_text).slice(0, 16);
      matrix.push(compactObject({
        job_id: job.id || null,
        job_ref: job.id ? `content_job:${job.id}` : null,
        class_date: jobDate(job),
        source_recording_ref: redactedRef(job.drive_file_id || job.source_drive_file_id || driveIdFromUrl(job.media_url), 'drive_file'),
        question_index: visibleIndex,
        question_ref: `question:${questionHash}`,
        question_text: includePrivateText ? question.question_text : undefined,
        question_text_hash: questionHash,
        topic: includePrivateText ? question.topic : (question.topic ? `topic:${sha256(question.topic).slice(0, 12)}` : undefined),
        student_name: includePrivateText ? question.student_name : undefined,
        student_name_hash: match.student_name_hash,
        matched_student_ref: match.matched_student_ref,
        match_status: match.match_status,
        confidence: match.confidence,
        source_kind: question.context?.source_kind || question.source_kind || '',
        review_status: match.match_status === 'matched' ? 'parsed_needs_learning_review' : 'needs_student_match_review',
        source_sheet_status: 'not_verified_by_this_audit',
        newsletter_ready: match.match_status === 'matched' ? 'candidate_after_review' : 'blocked_unmatched_student',
      }));
    }
  }
  return matrix;
}

function summarizeStructuredCounts(job = {}) {
  const structured = extractStructuredOutput(job);
  return {
    parser: structured.parser || null,
    tasks: structured.tasks.length,
    class_notes: structured.class_notes.length,
    daily_torah_updates: structured.daily_torah_updates.length,
    group_goal_entries: structured.group_goal_entries.length,
    accountability_events: structured.accountability_events.length,
    student_questions: collectQuestionCandidates(job).length,
    intake_parse_run_ref: structured.intake_parse_run_id ? `parse_run:${structured.intake_parse_run_id}` : null,
    raw_intake_stable_id: structured.raw_intake_stable_id || null,
  };
}

function buildJobPipelineTrace({ jobs = [], driveFiles = [], snapshot = {} } = {}) {
  return buildPipelineTraceRows({
    jobs,
    driveFiles,
    classSessions: snapshot.classSessions,
    groupGoalEntries: snapshot.groupGoalEntries,
    torahEntries: snapshot.torahEntries,
    accountabilityEvents: snapshot.accountabilityEvents,
    contentOutputs: snapshot.contentOutputs,
    intakeParseRuns: snapshot.intakeParseRuns,
    rawIntake: snapshot.rawIntake,
    students: snapshot.students,
  });
}

function buildDriveMediaCensus({ driveFiles = [], jobs = [] } = {}) {
  const matches = matchDriveFilesToJobs(driveFiles, jobs);
  return matches.map((item) => ({
    file: sanitizeDriveFile(item.file),
    match_status: item.match_status,
    matched_job_refs: item.matched_jobs.map((id) => `content_job:${id}`),
  }));
}

function jobHasExport(job, exportedTranscriptIds = new Set()) {
  return exportedTranscriptIds.has(Number(job.id));
}

function readExportedTranscriptIds(repoRoot = process.cwd()) {
  const dir = path.join(repoRoot, 'content-memory', 'transcripts');
  const ids = new Set();
  if (!fs.existsSync(dir)) return ids;
  for (const name of fs.readdirSync(dir)) {
    const match = name.match(/^(\d{3,})-/);
    if (match) ids.add(Number(match[1]));
  }
  return ids;
}

function buildGithubExportGaps({ jobs = [], repoRoot = process.cwd(), exportedTranscriptIds = null } = {}) {
  const exported = exportedTranscriptIds || readExportedTranscriptIds(repoRoot);
  return toArray(jobs).map((job) => ({
    job_ref: job.id ? `content_job:${job.id}` : null,
    job_id: job.id || null,
    class_date: jobDate(job),
    transcript_chars: transcriptChars(job),
    exported_to_github: jobHasExport(job, exported),
    expected_file_hint: job.id ? `${String(job.id).padStart(3, '0')}-*.md` : '',
    status: transcriptChars(job) && !jobHasExport(job, exported) ? 'missing_export' : 'ok_or_no_transcript',
  }));
}

function buildNewsletterReadyMatrix({ jobs = [], pipelineRows = [], questionMatrix = [] } = {}) {
  const questionsByJob = new Map();
  for (const row of questionMatrix) {
    const key = Number(row.job_id);
    if (!questionsByJob.has(key)) questionsByJob.set(key, []);
    questionsByJob.get(key).push(row);
  }

  const rowByJob = new Map(toArray(pipelineRows).filter((row) => row.kind === 'content_job').map((row) => [Number(row.job_id), row]));
  return toArray(jobs).map((job) => {
    const trace = rowByJob.get(Number(job.id));
    const questions = questionsByJob.get(Number(job.id)) || [];
    const blockers = [];
    if (!transcriptChars(job)) blockers.push('missing_transcript');
    if (statusOfStage(trace, 'structured_output') !== 'CONFIRMED') blockers.push('structured_output_not_confirmed');
    if (!questions.length) blockers.push('no_student_questions_found');
    if (questions.some((item) => item.match_status !== 'matched')) blockers.push('student_match_review_needed');
    if (statusOfStage(trace, 'canonical_write_status') === 'MISSING') blockers.push('canonical_write_missing');
    return {
      job_ref: job.id ? `content_job:${job.id}` : null,
      job_id: job.id || null,
      class_date: jobDate(job),
      transcript_chars: transcriptChars(job),
      parser: summarizeStructuredCounts(job).parser,
      question_count: questions.length,
      matched_question_count: questions.filter((item) => item.match_status === 'matched').length,
      newsletter_status: blockers.length ? 'not_ready' : 'ready_for_draft_review',
      blockers,
    };
  });
}

function buildReprocessDryRunPlan({ jobs = [], driveOrphans = [], pipelineRows = [] } = {}) {
  const rowByJob = new Map(toArray(pipelineRows).filter((row) => row.kind === 'content_job').map((row) => [Number(row.job_id), row]));
  const planRows = [];

  for (const job of toArray(jobs)) {
    const trace = rowByJob.get(Number(job.id));
    const structured = summarizeStructuredCounts(job);
    if (transcriptChars(job) && !structured.parser) {
      planRows.push({
        action: 'dry_run_reparse',
        target: 'content_job_parse_json',
        source_ref: `content_job:${job.id}`,
        reason: 'Transcript exists but no parser metadata/output was found.',
        no_production_mutation: true,
      });
    }
    if (structured.parser && statusOfStage(trace, 'structured_output') !== 'CONFIRMED') {
      planRows.push({
        action: 'dry_run_parser_diagnostic',
        target: 'parse_run',
        source_ref: `content_job:${job.id}`,
        reason: evidenceOfStage(trace, 'structured_output') || 'Parser metadata exists but usable structured output is not confirmed.',
        no_production_mutation: true,
      });
    }
    if (statusOfStage(trace, 'canonical_write_status') === 'MISSING') {
      planRows.push({
        action: 'dry_run_canonical_write_plan',
        target: 'class/student/question canonical tables',
        source_ref: `content_job:${job.id}`,
        reason: evidenceOfStage(trace, 'canonical_write_status') || 'Structured output exists but canonical writes were not found.',
        no_production_mutation: true,
      });
    }
    if (statusOfStage(trace, 'retry_dedup_status') === 'NEEDS_REVIEW') {
      planRows.push({
        action: 'dry_run_duplicate_review',
        target: 'content_job_deduplication',
        source_ref: `content_job:${job.id}`,
        reason: evidenceOfStage(trace, 'retry_dedup_status'),
        no_production_mutation: true,
      });
    }
  }

  for (const file of toArray(driveOrphans)) {
    planRows.push({
      action: 'dry_run_intake_repair_plan',
      target: 'drive_to_content_job',
      source_ref: redactedRef(file.id, 'drive_file').redacted,
      reason: 'Drive recording exists in the date range with no matching content job.',
      no_production_mutation: true,
    });
  }

  return {
    generated_at: new Date().toISOString(),
    safe_to_apply: false,
    guardrail: BACKFILL_GUARDRAIL,
    row_level_change_plan: [],
    dry_run_repair_candidates: planRows,
    apply_command: 'BLOCKED: no apply command is authorized by this package.',
  };
}

function summarizeStageCounts(pipelineRows = []) {
  const summary = {};
  for (const stageName of PIPELINE_STAGE_ORDER) {
    summary[stageName] = {};
    for (const row of toArray(pipelineRows)) {
      const status = statusOfStage(row, stageName);
      summary[stageName][status] = (summary[stageName][status] || 0) + 1;
    }
  }
  return summary;
}

function buildFinalVerdict({ scopedJobs = [], scopedFiles = [], driveOrphans = [], pipelineRows = [], questionMatrix = [], exportGaps = [] } = {}) {
  const blockers = [];
  const missingTranscript = toArray(scopedJobs).filter((job) => !transcriptChars(job));
  const noStructured = toArray(pipelineRows).filter((row) => row.kind === 'content_job' && statusOfStage(row, 'structured_output') !== 'CONFIRMED');
  const missingCanonical = toArray(pipelineRows).filter((row) => row.kind === 'content_job' && statusOfStage(row, 'canonical_write_status') === 'MISSING');
  const unmatchedQuestions = toArray(questionMatrix).filter((row) => row.match_status !== 'matched');
  const missingExports = toArray(exportGaps).filter((row) => row.status === 'missing_export');

  if (!scopedFiles.length && !scopedJobs.length) blockers.push('No class recordings/content jobs found in the requested date range.');
  if (driveOrphans.length) blockers.push(`${driveOrphans.length} Drive recording(s) have no matched content job.`);
  if (missingTranscript.length) blockers.push(`${missingTranscript.length} scoped content job(s) have no transcript text.`);
  if (noStructured.length) blockers.push(`${noStructured.length} scoped content job(s) do not have confirmed structured output.`);
  if (missingCanonical.length) blockers.push(`${missingCanonical.length} scoped content job(s) have structured output but missing canonical writes.`);
  if (unmatchedQuestions.length) blockers.push(`${unmatchedQuestions.length} student question row(s) need student-match review.`);
  if (missingExports.length) blockers.push(`${missingExports.length} scoped transcript job(s) are missing from GitHub transcript export.`);

  const status = blockers.length ? 'PARTIAL' : 'AUDIT_READY';
  return {
    generated_at: new Date().toISOString(),
    status,
    summary: status === 'AUDIT_READY'
      ? 'All scoped files/jobs have confirmed trace evidence for this audit. Publishing/sending remains review-gated.'
      : 'Two-week class intake has incomplete organization or downstream pipeline gaps.',
    safe_to_apply_class_backfill: false,
    guardrail: BACKFILL_GUARDRAIL,
    blockers,
    recommended_next_action: blockers.length
      ? 'Resolve blockers through dry-run reparse/canonical-write/export plans before generating parent-facing newsletter copy.'
      : 'Refresh GitHub/Drive mirrors and generate newsletter candidates for Shloimie review.',
  };
}

function buildTwoWeekClassIntakeAudit({
  generatedAt = new Date().toISOString(),
  startDate = DEFAULT_START_DATE,
  endDate = DEFAULT_END_DATE,
  snapshot = {},
  driveFiles = [],
  repoRoot = process.cwd(),
  jobIds = [],
  minJobId = null,
  maxJobId = null,
  includePrivateText = false,
} = {}) {
  const normalizedFiles = toArray(driveFiles).map((file) => normalizeDriveFile(file));
  const scope = selectScope({
    jobs: snapshot.jobs || [],
    driveFiles: normalizedFiles,
    startDate,
    endDate,
    jobIds,
    minJobId,
    maxJobId,
  });
  const pipelineRows = buildJobPipelineTrace({
    jobs: scope.jobsInRange,
    driveFiles: scope.filesInRange,
    snapshot,
  });
  const driveMediaCensus = buildDriveMediaCensus({ driveFiles: scope.filesInRange, jobs: scope.jobsInRange });
  const questionMatrix = buildStudentQuestionMatrix({
    jobs: scope.jobsInRange,
    students: snapshot.students || [],
    includePrivateText,
  });
  const exportGaps = buildGithubExportGaps({ jobs: scope.jobsInRange, repoRoot });
  const newsletterReadyMatrix = buildNewsletterReadyMatrix({
    jobs: scope.jobsInRange,
    pipelineRows,
    questionMatrix,
  });
  const reprocessDryRunPlan = buildReprocessDryRunPlan({
    jobs: scope.jobsInRange,
    driveOrphans: scope.driveOrphans,
    pipelineRows,
  });
  const finalVerdict = buildFinalVerdict({
    scopedJobs: scope.jobsInRange,
    scopedFiles: scope.filesInRange,
    driveOrphans: scope.driveOrphans,
    pipelineRows,
    questionMatrix,
    exportGaps,
  });

  return {
    generated_at: generatedAt,
    mode: 'read_only_two_week_class_intake_audit',
    no_production_mutation: true,
    start_date: startDate,
    end_date: endDate,
    guardrails: {
      issue_18: BACKFILL_GUARDRAIL,
      safe_to_apply_class_backfill: false,
      transcript_body_included: Boolean(includePrivateText),
      private_text_mode: includePrivateText ? 'operator_local_only_requested' : 'sanitized_repo_safe',
    },
    scope_counts: {
      drive_recordings_in_range: scope.filesInRange.length,
      content_jobs_in_range: scope.jobsInRange.length,
      drive_orphans_in_range: scope.driveOrphans.length,
      student_question_rows: questionMatrix.length,
      github_export_gaps: exportGaps.filter((row) => row.status === 'missing_export').length,
      dry_run_repair_candidates: reprocessDryRunPlan.dry_run_repair_candidates.length,
    },
    drive_media_census: driveMediaCensus,
    job_pipeline_trace: pipelineRows,
    stage_summary: summarizeStageCounts(pipelineRows),
    student_question_matrix: questionMatrix,
    github_export_gaps: exportGaps,
    newsletter_ready_matrix: newsletterReadyMatrix,
    reprocess_dry_run_plan: reprocessDryRunPlan,
    final_verdict: finalVerdict,
  };
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map((col) => col.label).join(' | ')} |`;
  const sep = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = toArray(rows).map((row) => `| ${columns.map((col) => {
    const raw = typeof col.value === 'function' ? col.value(row) : row[col.value];
    return String(raw ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  }).join(' | ')} |`);
  return [header, sep, ...body].join('\n');
}

function renderDriveMediaCensusMarkdown(audit) {
  return [
    '# Drive Media Census',
    '',
    `Generated: ${audit.generated_at}`,
    `Date range: ${audit.start_date} through ${audit.end_date}`,
    `No production mutation: ${audit.no_production_mutation}`,
    '',
    markdownTable(audit.drive_media_census, [
      { label: 'Drive file', value: (row) => row.file?.id_ref?.redacted || '' },
      { label: 'Folder', value: (row) => row.file?.folder_label || '' },
      { label: 'Created', value: (row) => row.file?.created_time || '' },
      { label: 'Modified', value: (row) => row.file?.modified_time || '' },
      { label: 'MIME', value: (row) => row.file?.mime_type || '' },
      { label: 'Match', value: 'match_status' },
      { label: 'Jobs', value: (row) => toArray(row.matched_job_refs).join(', ') },
    ]),
    '',
  ].join('\n');
}

function renderJobPipelineTraceMarkdown(audit) {
  const rows = toArray(audit.job_pipeline_trace).map((row) => ({
    kind: row.kind,
    job: row.job_id ? `#${row.job_id}` : '',
    status: `${row.status || ''}/${row.drive_stage || ''}`,
    transcript: row.transcript_chars || 0,
    parser: row.parser || '',
    structured: statusOfStage(row, 'structured_output'),
    canonical: statusOfStage(row, 'canonical_write_status'),
    studentMatch: statusOfStage(row, 'student_name_alias_match'),
    questions: statusOfStage(row, 'question_proposal'),
    retry: statusOfStage(row, 'retry_dedup_status'),
  }));

  return [
    '# Job Pipeline Trace',
    '',
    `Generated: ${audit.generated_at}`,
    `Date range: ${audit.start_date} through ${audit.end_date}`,
    '',
    markdownTable(rows, [
      { label: 'Kind', value: 'kind' },
      { label: 'Job', value: 'job' },
      { label: 'Status/stage', value: 'status' },
      { label: 'Transcript chars', value: 'transcript' },
      { label: 'Parser', value: 'parser' },
      { label: 'Structured', value: 'structured' },
      { label: 'Canonical writes', value: 'canonical' },
      { label: 'Student match', value: 'studentMatch' },
      { label: 'Questions', value: 'questions' },
      { label: 'Retry/dedup', value: 'retry' },
    ]),
    '',
    '## Stage Summary',
    '',
    '```json',
    JSON.stringify(audit.stage_summary, null, 2),
    '```',
    '',
  ].join('\n');
}

function renderStudentQuestionMatrixMarkdown(audit) {
  const rows = toArray(audit.student_question_matrix);
  return [
    '# Student Question Matrix',
    '',
    `Generated: ${audit.generated_at}`,
    `Mode: ${audit.guardrails.private_text_mode}`,
    '',
    rows.length
      ? markdownTable(rows, [
        { label: 'Job', value: 'job_ref' },
        { label: 'Class date', value: 'class_date' },
        { label: 'Question', value: (row) => row.question_text || row.question_ref },
        { label: 'Student', value: (row) => row.student_name || row.matched_student_ref || row.student_name_hash || '' },
        { label: 'Match', value: 'match_status' },
        { label: 'Confidence', value: 'confidence' },
        { label: 'Review', value: 'review_status' },
        { label: 'Newsletter', value: 'newsletter_ready' },
      ])
      : '- No parsed student questions found in scoped jobs.',
    '',
  ].join('\n');
}

function renderGithubExportGapsMarkdown(audit) {
  return [
    '# GitHub Export Gaps',
    '',
    `Generated: ${audit.generated_at}`,
    '',
    markdownTable(audit.github_export_gaps, [
      { label: 'Job', value: 'job_ref' },
      { label: 'Class date', value: 'class_date' },
      { label: 'Transcript chars', value: 'transcript_chars' },
      { label: 'Exported', value: (row) => row.exported_to_github ? 'yes' : 'no' },
      { label: 'Expected file', value: 'expected_file_hint' },
      { label: 'Status', value: 'status' },
    ]),
    '',
    'Recommended command after upstream parsing is verified:',
    '',
    '```bash',
    'npm run content:export-transcripts',
    '```',
    '',
  ].join('\n');
}

function renderNewsletterReadyMatrixMarkdown(audit) {
  return [
    '# Newsletter Ready Matrix',
    '',
    `Generated: ${audit.generated_at}`,
    '',
    markdownTable(audit.newsletter_ready_matrix, [
      { label: 'Job', value: 'job_ref' },
      { label: 'Class date', value: 'class_date' },
      { label: 'Transcript chars', value: 'transcript_chars' },
      { label: 'Parser', value: 'parser' },
      { label: 'Questions', value: 'question_count' },
      { label: 'Matched questions', value: 'matched_question_count' },
      { label: 'Newsletter status', value: 'newsletter_status' },
      { label: 'Blockers', value: (row) => toArray(row.blockers).join('; ') },
    ]),
    '',
  ].join('\n');
}

function renderReprocessDryRunPlanMarkdown(audit) {
  const plan = audit.reprocess_dry_run_plan || {};
  return [
    '# Reprocess Dry-Run Plan',
    '',
    `Generated: ${plan.generated_at || audit.generated_at}`,
    `Safe to apply: ${plan.safe_to_apply === true}`,
    `Guardrail: ${plan.guardrail || BACKFILL_GUARDRAIL}`,
    '',
    '## Dry-Run Repair Candidates',
    '',
    toArray(plan.dry_run_repair_candidates).length
      ? markdownTable(plan.dry_run_repair_candidates, [
        { label: 'Action', value: 'action' },
        { label: 'Target', value: 'target' },
        { label: 'Source', value: 'source_ref' },
        { label: 'Reason', value: (row) => redactSensitiveText(row.reason || '') },
        { label: 'No write', value: (row) => row.no_production_mutation ? 'yes' : 'no' },
      ])
      : '- No dry-run repair candidates found.',
    '',
    '## Row-Level Change Plan',
    '',
    '- None. This package intentionally performs no production mutations.',
    '',
  ].join('\n');
}

function renderFinalVerdictMarkdown(audit) {
  const verdict = audit.final_verdict || {};
  return [
    '# Two-Week Class Intake Audit - Final Verdict',
    '',
    `Generated: ${verdict.generated_at || audit.generated_at}`,
    `Status: ${verdict.status || 'UNKNOWN'}`,
    `Safe to apply class backfill: ${verdict.safe_to_apply_class_backfill === true}`,
    '',
    '## Summary',
    '',
    verdict.summary || '',
    '',
    '## Counts',
    '',
    '```json',
    JSON.stringify(audit.scope_counts || {}, null, 2),
    '```',
    '',
    '## Blockers',
    '',
    toArray(verdict.blockers).length
      ? toArray(verdict.blockers).map((item) => `- ${redactSensitiveText(item)}`).join('\n')
      : '- None found by this audit.',
    '',
    '## Recommended Next Action',
    '',
    verdict.recommended_next_action || '',
    '',
    '## Guardrail',
    '',
    verdict.guardrail || BACKFILL_GUARDRAIL,
    '',
  ].join('\n');
}

function writeAuditArtifacts(audit, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const files = {
    'DRIVE-MEDIA-CENSUS.md': renderDriveMediaCensusMarkdown(audit),
    'DRIVE-MEDIA-CENSUS.json': JSON.stringify(audit.drive_media_census, null, 2),
    'JOB-PIPELINE-TRACE.md': renderJobPipelineTraceMarkdown(audit),
    'JOB-PIPELINE-TRACE.json': JSON.stringify(audit.job_pipeline_trace, null, 2),
    'STUDENT-QUESTION-MATRIX.md': renderStudentQuestionMatrixMarkdown(audit),
    'STUDENT-QUESTION-MATRIX.json': JSON.stringify(audit.student_question_matrix, null, 2),
    'GITHUB-EXPORT-GAPS.md': renderGithubExportGapsMarkdown(audit),
    'GITHUB-EXPORT-GAPS.json': JSON.stringify(audit.github_export_gaps, null, 2),
    'NEWSLETTER-READY-MATRIX.md': renderNewsletterReadyMatrixMarkdown(audit),
    'NEWSLETTER-READY-MATRIX.json': JSON.stringify(audit.newsletter_ready_matrix, null, 2),
    'REPROCESS-DRY-RUN-PLAN.md': renderReprocessDryRunPlanMarkdown(audit),
    'REPROCESS-DRY-RUN-PLAN.json': JSON.stringify(audit.reprocess_dry_run_plan, null, 2),
    'FINAL-VERDICT.md': renderFinalVerdictMarkdown(audit),
    'AUDIT-SUMMARY.json': JSON.stringify({
      generated_at: audit.generated_at,
      mode: audit.mode,
      no_production_mutation: audit.no_production_mutation,
      start_date: audit.start_date,
      end_date: audit.end_date,
      scope_counts: audit.scope_counts,
      final_verdict: audit.final_verdict,
    }, null, 2),
  };

  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(outDir, name), `${String(content).replace(/\s+$/, '')}\n`);
  }
  return Object.keys(files).map((name) => path.join(outDir, name));
}

module.exports = {
  BACKFILL_GUARDRAIL,
  DEFAULT_END_DATE,
  DEFAULT_OUT_DIR,
  DEFAULT_START_DATE,
  buildDriveMediaCensus,
  buildFinalVerdict,
  buildGithubExportGaps,
  buildNewsletterReadyMatrix,
  buildReprocessDryRunPlan,
  buildStudentQuestionMatrix,
  buildTwoWeekClassIntakeAudit,
  collectQuestionCandidates,
  isLikelyRecordingFile,
  matchDriveFilesToJobs,
  normalizeDriveFile,
  renderDriveMediaCensusMarkdown,
  renderFinalVerdictMarkdown,
  renderGithubExportGapsMarkdown,
  renderJobPipelineTraceMarkdown,
  renderNewsletterReadyMatrixMarkdown,
  renderReprocessDryRunPlanMarkdown,
  renderStudentQuestionMatrixMarkdown,
  selectScope,
  writeAuditArtifacts,
};
