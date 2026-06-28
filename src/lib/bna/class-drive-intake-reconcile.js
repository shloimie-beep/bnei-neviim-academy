const crypto = require('crypto');

const {
  findStudentForParsedName,
  normalizeNameForMatch,
  scoreStudentParsedNameMatch,
  studentAliasesForServer,
} = require('./student-match');
const { normalizeParsedTorahEngagement } = require('./torah-learning');

const APPLY_GATE_PHRASE = 'APPLY_GUARDED_CLASS_BACKFILL';
const DEFAULT_REPAIR_JOB_RANGE = [64, 74];
const DEFAULT_CATCHUP_FOCUS_JOB_IDS = [21, 25, 26, 30, 31, 56, 57, 58, 59, 71];
const DEFAULT_PRIVATE_REPARSE_JOB_IDS = DEFAULT_CATCHUP_FOCUS_JOB_IDS.slice();
const DEFAULT_PRODUCTION_APPLY_ACTIONS = ['personal_questions', 'class_question_broadcasts', 'score_progress'];
const PRODUCTION_APPLY_TABLES = ['bna_accountability_events', 'bna_torah_learning_entries', 'bna_group_goal_entries'];
const PIPELINE_STAGES = [
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

function sha256(value) {
  return crypto.createHash('sha256').update(String(value ?? '')).digest('hex');
}

function parseJsonMaybe(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch (_error) {
    return fallback;
  }
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== '')
  );
}

function redactSensitiveText(value) {
  if (value === undefined || value === null) return value;
  return String(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/https?:\/\/[^\s)]+/gi, '[redacted-url]')
    .replace(/\b(?:ya29|AIza|sk-|rk-|pk_live_|sk_live_|xoxb-|ghp_)[A-Za-z0-9._-]{12,}\b/g, '[redacted-secret]')
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g, '[redacted-private-key]');
}

function redactedRef(value, label = 'ref') {
  if (!value) return { present: false, redacted: null, sha256: null };
  const digest = sha256(value);
  return { present: true, redacted: `${label}:${digest.slice(0, 12)}`, sha256: digest };
}

function redactedLabel(label, value) {
  return `${label}:${sha256(value || label).slice(0, 12)}`;
}

function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

function transcriptChars(job = {}) {
  return String(job.transcript_text || job.transcript || '').length;
}

function jobSourceFingerprint(job = {}) {
  return sha256([
    job.source_type || '',
    job.drive_file_id || job.source_drive_file_id || '',
    job.drive_folder_id || '',
    job.source_media_url || job.media_url || '',
    job.source_local_path || job.local_path || '',
    job.title || '',
    job.original_filename || '',
    transcriptChars(job),
  ].join('|'));
}

function contentJobLabel(job = {}) {
  return job.id ? `content_job:${job.id}` : redactedLabel('content_job', jobSourceFingerprint(job));
}

function driveFileLabel(file = {}) {
  return redactedLabel('drive_file', file.id || file.name || file.createdTime || '');
}

function extractStructuredOutput(job = {}) {
  const parse = parseJsonMaybe(job.parse_json, {}) || {};
  const mixed = parse.mixed_recording_parse || {};
  const progressOnly = mixed.progress_only || {};
  const parsed = progressOnly.parsed || mixed.parsed || parse.parsed || {};
  return {
    raw_parse: parse,
    parser: mixed.parser || mixed.parser_name || parse.parser || null,
    report: mixed.report || parsed.report || parse.report || {},
    tasks: toArray(parsed.tasks || mixed.tasks || parse.tasks),
    accountability_events: toArray(parsed.accountability_events || mixed.accountability_events || parse.accountability_events),
    group_goal_entries: toArray(parsed.group_goal_entries || mixed.group_goal_entries || parse.group_goal_entries),
    daily_torah_updates: toArray(parsed.daily_torah_updates || mixed.daily_torah_updates || parse.daily_torah_updates),
    class_notes: toArray(parsed.class_notes || mixed.class_notes || parse.class_notes),
    counts: mixed.counts || progressOnly.counts || parse.counts || {},
    intake_parse_run_id: parse.intake_parse_run_id || mixed.intake_parse_run_id || null,
    raw_intake_stable_id: parse.raw_intake_stable_id || mixed.raw_intake_stable_id || null,
  };
}

function hasStructuredParse(job = {}) {
  const out = extractStructuredOutput(job);
  return Boolean(
    out.tasks.length
    || out.accountability_events.length
    || out.group_goal_entries.length
    || out.daily_torah_updates.length
    || out.class_notes.length
  );
}

function stage(status, evidence = '', details = {}) {
  return compactObject({ status, evidence: redactSensitiveText(evidence), ...details });
}

function indexByJobId(rows = [], field) {
  const map = new Map();
  for (const row of toArray(rows)) {
    const id = Number(row[field] || row.content_job_id || row.source_content_job_id || row.job_id);
    if (!id) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(row);
  }
  return map;
}

function matchDetailsForName(name, students = []) {
  const ranked = toArray(students)
    .map((student) => ({ student, score: scoreStudentParsedNameMatch(name, student) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(a.student?.id || 0) - Number(b.student?.id || 0));
  const matched = findStudentForParsedName(name, students);
  const ambiguous = Boolean(ranked[1] && ranked[1].score === ranked[0].score && ranked[0].score < 100);
  return {
    input_hash: sha256(normalizeNameForMatch(name) || name || '').slice(0, 12),
    matched_student_id: matched?.id || null,
    matched_student_ref: matched?.id ? `student:${matched.id}` : null,
    ambiguous,
    best_score: ranked[0]?.score || 0,
    contenders: ranked.slice(0, 3).map((item) => ({
      student_id: item.student?.id || null,
      student_ref: item.student?.id ? `student:${item.student.id}` : null,
      score: item.score,
    })),
  };
}

function normalizeStudentQuestion(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const match = text.match(/^([^:：-]{2,80})[:：-]\s*(.+)$/);
  return match
    ? { student_name: match[1].trim(), question_text: match[2].trim() }
    : { student_name: '', question_text: text };
}

function compactWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function candidateIdsFromMarkdown(text = '') {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => {
      const match = line.match(/^-\s+([A-Z]+(?:-[A-Z0-9]+)*-\d{6}(?:-[A-Z0-9]+)*):/);
      return match ? match[1] : '';
    })
    .filter(Boolean);
}

function normalizeQuestionCandidateForBackfill(value, fallbackStudentName = '') {
  if (typeof value === 'string') {
    const text = compactWhitespace(value);
    if (!text) return null;
    const match = text.match(/^([^:-]{2,80})[:-]\s*(.+)$/);
    return match
      ? { student_name: compactWhitespace(match[1]), question_text: compactWhitespace(match[2]) }
      : { student_name: compactWhitespace(fallbackStudentName), question_text: text };
  }
  if (value && typeof value === 'object') {
    const studentName = compactWhitespace(value.student_name || value.student || value.name || fallbackStudentName);
    const questionText = compactWhitespace(value.question_text || value.question || value.text || value.title || value.summary || '');
    if (!questionText) return null;
    return { student_name: studentName, question_text: questionText };
  }
  return null;
}

function questionCandidateItems(structured = {}) {
  const candidates = [];
  function pushQuestion(value, sourceKind, fallbackStudentName = '') {
    const question = normalizeQuestionCandidateForBackfill(value, fallbackStudentName);
    if (!question?.question_text) return;
    candidates.push({ ...question, source_kind: sourceKind });
  }
  for (const note of toArray(structured.class_notes)) {
    const fallbackStudentName = note?.student_name || '';
    for (const question of toArray(note?.student_questions)) pushQuestion(question, 'class_notes.student_questions', fallbackStudentName);
    for (const question of toArray(note?.questions)) pushQuestion(question, 'class_notes.questions', fallbackStudentName);
    for (const discussion of toArray(note?.discussions)) {
      const raw = compactWhitespace(typeof discussion === 'string' ? discussion : JSON.stringify(discussion || ''));
      if (/\?$/.test(raw)) pushQuestion(discussion, 'class_notes.discussions_question', fallbackStudentName);
    }
  }
  return candidates;
}

function existingClassSessionForJob(rows = [], jobId) {
  return toArray(rows).find((row) => Number(row.content_job_id || row.source_content_job_id || row.job_id) === Number(jobId));
}

function existingProgressRow(rows = [], studentId, date) {
  return toArray(rows).find((row) => Number(row.student_id) === Number(studentId) && toIsoDate(row.date || row.recorded_date || row.created_at) === date);
}

function existingQuestionEvent(rows = [], jobId, studentId, questionText) {
  const normalized = normalizeNameForMatch(questionText);
  return toArray(rows).find((row) => {
    const metadata = parseJsonMaybe(row.metadata, {}) || {};
    return Number(metadata.source_content_job_id || row.source_content_job_id) === Number(jobId)
      && Number(row.student_id || metadata.student_id) === Number(studentId)
      && normalizeNameForMatch(row.question_text || row.title || row.notes || '') === normalized;
  });
}

function activeStudentsForClassQuestions(students = []) {
  return toArray(students)
    .filter((student) => Number(student?.id))
    .filter((student) => !['archived', 'inactive'].includes(String(student.status || 'active').toLowerCase()))
    .sort((a, b) => Number(a.id) - Number(b.id));
}

function duplicateGroupsForJobs(jobs = []) {
  const groups = new Map();
  for (const job of toArray(jobs)) {
    const fingerprint = jobSourceFingerprint(job);
    if (!groups.has(fingerprint)) groups.set(fingerprint, []);
    groups.get(fingerprint).push(job.id || fingerprint);
  }
  return [...groups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([fingerprint, ids]) => ({ fingerprint_sha256: fingerprint, job_ids: ids }));
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
  const classByJob = indexByJobId(classSessions, 'content_job_id');
  const groupByJob = indexByJobId(groupGoalEntries, 'source_content_job_id');
  const outputByJob = indexByJobId(contentOutputs, 'job_id');
  const eventsByJob = new Map();
  for (const row of toArray(accountabilityEvents)) {
    const metadata = parseJsonMaybe(row.metadata, {}) || {};
    const id = Number(metadata.source_content_job_id || row.source_content_job_id || row.content_job_id);
    if (!id) continue;
    if (!eventsByJob.has(id)) eventsByJob.set(id, []);
    eventsByJob.get(id).push(row);
  }
  const parseRunSourceIds = new Set(toArray(intakeParseRuns).flatMap((run) => [String(run.source_id || ''), String(run.source_record_id || '')]));
  const rawStableIds = new Set(toArray(rawIntake).map((row) => row.stable_id).filter(Boolean));
  const seen = new Map();
  const rows = [];

  for (const job of toArray(jobs)) {
    const structured = extractStructuredOutput(job);
    const fingerprint = jobSourceFingerprint(job);
    const duplicateOf = seen.get(fingerprint);
    seen.set(fingerprint, job.id || fingerprint);
    const classRows = classByJob.get(Number(job.id)) || [];
    const groupRows = groupByJob.get(Number(job.id)) || [];
    const eventRows = eventsByJob.get(Number(job.id)) || [];
    const outputRows = outputByJob.get(Number(job.id)) || [];
    const transcriptLength = transcriptChars(job);
    const errorText = String(job.error || job.last_error || structured.report?.primary_error || structured.report?.error || '');
    const parsedNames = [
      ...structured.daily_torah_updates,
      ...structured.group_goal_entries,
      ...structured.accountability_events,
    ].map((item) => item.student_name).filter(Boolean);
    const matches = parsedNames.map((name) => matchDetailsForName(name, students));
    const ambiguous = matches.filter((item) => item.ambiguous || !item.matched_student_id);
    const progressSignals = structured.daily_torah_updates.length + structured.group_goal_entries.length;
    const questionSignals = questionCandidateItems(structured).length;
    const hasIntake = parseRunSourceIds.has(String(job.id)) || rawStableIds.has(structured.raw_intake_stable_id);
    const statusText = `${job.status || ''} ${job.drive_stage || ''} ${errorText}`.toLowerCase();

    rows.push({
      kind: 'content_job',
      job_id: job.id || null,
      title: contentJobLabel(job),
      created_at: job.created_at || null,
      updated_at: job.updated_at || null,
      status: job.status || null,
      drive_stage: job.drive_stage || null,
      transcript_chars: transcriptLength,
      parser: structured.parser,
      fingerprint_sha256: fingerprint,
      stage_order: PIPELINE_STAGES,
      stages: {
        source_discovered: stage(job.id ? 'CONFIRMED' : 'UNKNOWN', job.id ? `content job ${job.id}` : 'no content job id', {
          source_ref: {
            drive_file: redactedRef(job.drive_file_id || job.source_drive_file_id, 'drive_file'),
            drive_folder: redactedRef(job.drive_folder_id, 'drive_folder'),
          },
        }),
        source_fingerprint: stage('CONFIRMED', fingerprint.slice(0, 16), { sha256: fingerprint }),
        intake_record: hasIntake || structured.intake_parse_run_id ? stage('CONFIRMED', structured.raw_intake_stable_id || structured.intake_parse_run_id || 'linked intake') : stage('UNKNOWN', 'No linked raw/canonical intake row was found.'),
        queue_record: job.status || job.drive_stage ? stage('CONFIRMED', `status=${job.status || 'unknown'} stage=${job.drive_stage || 'unknown'}`) : stage('UNKNOWN', 'No queue status was found.'),
        download: job.local_path || job.source_local_path || transcriptLength ? stage('CONFIRMED', 'Download/transcript evidence exists.') : stage('UNKNOWN', 'No download evidence was found.'),
        transcription_request: transcriptLength || /transcrib|openai|whisper/i.test(JSON.stringify(structured.raw_parse)) ? stage('CONFIRMED', 'Transcript or transcription metadata exists.') : errorText ? stage('CONFIRMED', errorText) : stage('UNKNOWN', 'No transcription request metadata was found.'),
        transcription_result: transcriptLength ? stage('CONFIRMED', `${transcriptLength} transcript chars`) : errorText ? stage('FAILED', errorText) : stage('UNKNOWN', 'No transcript text was found.'),
        parser_request: structured.intake_parse_run_id || structured.parser || hasStructuredParse(job) ? stage('CONFIRMED', structured.parser || structured.intake_parse_run_id || 'structured output present') : transcriptLength ? stage('UNKNOWN', 'Transcript exists but parser request is not visible.') : stage('SKIPPED', 'Parser requires transcript text.'),
        structured_output: hasStructuredParse(job) ? stage('CONFIRMED', `class_notes=${structured.class_notes.length} progress=${progressSignals}`) : structured.parser === 'canonical-intake-parser' ? stage('CONFIRMED', 'Canonical parser output exists but class/progress output is empty.') : stage('UNKNOWN', 'No structured class output was found.'),
        class_session_match: classRows.length ? stage('CONFIRMED', `${classRows.length} class session row(s)`) : structured.class_notes.length ? stage('MISSING', 'Class notes exist but no class-session row was found.') : stage('UNKNOWN', 'No class-session signal.'),
        student_name_alias_match: matches.length ? stage(ambiguous.length ? 'NEEDS_REVIEW' : 'CONFIRMED', `${matches.length - ambiguous.length}/${matches.length} matched`, { matches }) : stage('UNKNOWN', 'No parsed student names found.'),
        ambiguity_review: ambiguous.length ? stage('NEEDS_REVIEW', `${ambiguous.length} ambiguous/unmatched parsed student name(s).`, { ambiguous }) : stage(matches.length ? 'CONFIRMED' : 'UNKNOWN', matches.length ? 'No ambiguous matches.' : 'No student names to review.'),
        score_progress_proposal: progressSignals ? stage(groupRows.length ? 'CONFIRMED' : 'MISSING', `${progressSignals} parsed progress signal(s), ${groupRows.length} persisted group row(s)`) : stage('UNKNOWN', 'No progress signals found.'),
        question_proposal: questionSignals ? stage('CONFIRMED', `${questionSignals} parsed student question(s)`) : stage('UNKNOWN', 'No parsed student questions found.'),
        profile_note_proposal: structured.accountability_events.length ? stage('CONFIRMED', `${structured.accountability_events.length} candidate(s)`) : stage('UNKNOWN', 'No profile-note candidates found.'),
        accountability_proposal: eventRows.length || structured.accountability_events.length ? stage(eventRows.length ? 'CONFIRMED' : 'MISSING', `${eventRows.length} persisted event(s), ${structured.accountability_events.length} parsed candidate(s)`) : stage('UNKNOWN', 'No accountability events found.'),
        canonical_write_status: classRows.length || groupRows.length || eventRows.length ? stage('CONFIRMED', `class=${classRows.length} group=${groupRows.length} events=${eventRows.length}`) : hasStructuredParse(job) ? stage('MISSING', 'Structured output exists but canonical writes were not found.') : stage('UNKNOWN', 'No structured output to compare.'),
        operations_read_model_visibility: outputRows.length || classRows.length || groupRows.length || eventRows.length ? stage('CONFIRMED', 'Operations-backed row is visible.') : stage('UNKNOWN', 'No read-model rows found.'),
        parent_student_visibility: torahEntries.length || eventRows.length ? stage('CONFIRMED', 'Progress/accountability rows exist for downstream views.') : stage('UNKNOWN', 'No permitted parent/student rows found.'),
        retry_dedup_status: duplicateOf ? stage('NEEDS_REVIEW', `Same source fingerprint as ${duplicateOf}`, { duplicate_of: duplicateOf }) : /fail|error|retry|queued|stuck/.test(statusText) ? stage('NEEDS_RETRY', `status=${job.status || 'unknown'} error=${errorText || 'none'}`) : stage('CONFIRMED', 'No duplicate or retry marker found.'),
      },
    });
  }

  const knownDriveHashes = new Set(toArray(jobs).map((job) => sha256(job.drive_file_id || job.source_drive_file_id || '')).filter(Boolean));
  for (const file of toArray(driveFiles)) {
    if (!file.id || knownDriveHashes.has(sha256(file.id))) continue;
    rows.push({
      kind: 'drive_orphan',
      job_id: null,
      title: driveFileLabel(file),
      status: 'orphan_drive_file',
      drive_stage: file.folder_label || null,
      transcript_chars: 0,
      parser: null,
      fingerprint_sha256: sha256(`${file.id}|${file.name || ''}|${file.createdTime || ''}`),
      stage_order: PIPELINE_STAGES,
      stages: Object.fromEntries(PIPELINE_STAGES.map((name) => [
        name,
        name === 'source_discovered'
          ? stage('CONFIRMED', 'Drive file discovered with no matching content job.', { source_ref: { drive_file: redactedRef(file.id, 'drive_file') } })
          : name === 'source_fingerprint'
            ? stage('CONFIRMED', 'Drive orphan fingerprint created.')
            : name === 'intake_record'
              ? stage('MISSING', 'No content job/raw intake matched this Drive file.')
              : stage('UNKNOWN', 'Stage cannot be inspected without a content job.'),
      ])),
    });
  }
  return rows;
}

function cause(status, evidence) {
  return { status, evidence: redactSensitiveText(evidence) };
}

function evaluateSuspectedCauses({ jobs = [], authReadiness = {}, driveFiles = [], pipelineRows = [] } = {}) {
  const allText = JSON.stringify({ jobs, pipelineRows }).toLowerCase();
  const transcriptJobs = toArray(jobs).filter((job) => transcriptChars(job) > 0);
  const structuredJobs = toArray(jobs).filter(hasStructuredParse);
  const missingApply = toArray(pipelineRows).filter((row) => row.stages?.canonical_write_status?.status === 'MISSING');
  const genericParser = toArray(pipelineRows).filter((row) => /canonical-intake-parser/i.test(row.parser || ''));
  const staleStatus = toArray(pipelineRows).filter((row) => /queued|ingested|transcrib|parsing/i.test(`${row.status || ''} ${row.drive_stage || ''}`) && row.stages?.structured_output?.status === 'CONFIRMED');
  return {
    openai_transcription_401_invalid_api_key: /401|invalid[_ -]?api[_ -]?key|unauthorized/.test(allText) ? cause('CONFIRMED', '401/invalid_api_key appears in inspected state.') : cause('DISPROVED', 'No inspected state mentions 401/invalid_api_key.'),
    drive_target_not_configured: authReadiness.drive_stage_folders?.configured_count ? cause('DISPROVED', `${authReadiness.drive_stage_folders.configured_count} Drive folder(s) detected.`) : cause('UNKNOWN', 'No Drive target folder config detected.'),
    drive_auth_path_mismatch: authReadiness.canonical_google_auth?.status === 'ready' ? cause('DISPROVED', `Canonical auth path is ${authReadiness.canonical_google_auth.path_type}.`) : cause('UNKNOWN', authReadiness.canonical_google_auth?.blocker || 'No ready Google auth path.'),
    files_uploaded_but_no_job_created: toArray(driveFiles).some((file) => file.orphan || file.no_matching_job) || toArray(pipelineRows).some((row) => row.kind === 'drive_orphan') ? cause('CONFIRMED', 'Drive orphan(s) found.') : toArray(driveFiles).length ? cause('DISPROVED', 'Drive files matched inspected content jobs.') : cause('UNKNOWN', 'Drive metadata unavailable or empty.'),
    jobs_queued_but_no_worker: /queued|stuck|worker/.test(allText) ? cause('UNKNOWN', 'Queued/stuck/worker language needs log confirmation.') : cause('DISPROVED', 'No queued/stuck worker-only state found.'),
    transcript_exists_but_parser_never_ran: transcriptJobs.some((job) => !extractStructuredOutput(job).parser && !hasStructuredParse(job)) ? cause('CONFIRMED', 'Transcript exists without parser metadata/output.') : transcriptJobs.length ? cause('DISPROVED', 'Transcript jobs have parser metadata/output.') : cause('UNKNOWN', 'No transcript jobs available.'),
    parser_output_exists_but_apply_step_did_not_run: missingApply.length ? cause('CONFIRMED', `${missingApply.length} structured row(s) lack canonical writes.`) : structuredJobs.length ? cause('DISPROVED', 'Structured rows have inspected write evidence.') : cause('UNKNOWN', 'No structured output found.'),
    student_alias_name_mismatch: toArray(pipelineRows).some((row) => row.stages?.student_name_alias_match?.status === 'NEEDS_REVIEW') ? cause('CONFIRMED', 'At least one parsed name was unmatched or ambiguous.') : cause('DISPROVED', 'No name/alias mismatch found.'),
    ambiguous_names_auto_linked_incorrectly: toArray(pipelineRows).some((row) => row.stages?.ambiguity_review?.status === 'NEEDS_REVIEW') ? cause('UNKNOWN', 'Ambiguity exists; auto-link error not proven read-only.') : cause('DISPROVED', 'No ambiguous matches found.'),
    scores_written_to_wrong_table: toArray(pipelineRows).some((row) => row.stages?.score_progress_proposal?.status === 'MISSING') ? cause('UNKNOWN', 'Progress signals exist without inspected progress rows.') : cause('DISPROVED', 'No missing inspected progress rows.'),
    questions_written_but_not_linked: toArray(pipelineRows).some((row) => row.stages?.question_proposal?.status === 'CONFIRMED' && row.stages?.canonical_write_status?.status === 'MISSING') ? cause('UNKNOWN', 'Question candidates exist without write evidence.') : cause('DISPROVED', 'No orphan question write found.'),
    accountability_omitted: toArray(pipelineRows).some((row) => row.stages?.accountability_proposal?.status === 'MISSING') ? cause('CONFIRMED', 'Parsed accountability exists without persisted event rows.') : cause('DISPROVED', 'No missing accountability candidate found.'),
    duplicates_suppressing_valid_retry: toArray(pipelineRows).some((row) => row.stages?.retry_dedup_status?.status === 'NEEDS_REVIEW') ? cause('UNKNOWN', 'Duplicate source fingerprints exist.') : cause('DISPROVED', 'No duplicate fingerprints found.'),
    generic_ramble_parser_used_instead_of_class_parser: genericParser.length ? cause('CONFIRMED', `${genericParser.length} row(s) use canonical-intake-parser.`) : cause('DISPROVED', 'No canonical-intake-parser rows found.'),
    local_fix_not_deployed: authReadiness.production_revision_compared ? cause(authReadiness.production_revision_matches ? 'DISPROVED' : 'CONFIRMED', authReadiness.production_revision_evidence || '') : cause('UNKNOWN', 'This lane did not compare production revisions.'),
    stale_job_status_masking_completed_output: staleStatus.length ? cause('CONFIRMED', `${staleStatus.length} row(s) have in-progress status with output.`) : cause('DISPROVED', 'No stale in-progress status with output found.'),
  };
}

function classSessionProposal(job, structured, classSessions) {
  if (!structured.class_notes.length || existingClassSessionForJob(classSessions, job.id)) return null;
  const note = structured.class_notes[0] || {};
  return {
    table: 'bna_class_sessions',
    action: 'insert',
    natural_key: `content_job:${job.id}:class_session`,
    before: null,
    after: compactObject({
      content_job_id: job.id,
      source_content_job_id: job.id,
      class_date: toIsoDate(job.class_date || job.created_at),
      title: contentJobLabel(job),
      summary_hash: note.summary || structured.report?.summary ? sha256(note.summary || structured.report?.summary).slice(0, 12) : undefined,
      topics_count: toArray(note.topics).length,
    }),
  };
}

function progressProposal({ job, update, students, torahEntries, groupGoalEntries, sourceKind }) {
  const name = update.student_name || update.name || '';
  if (!name || /^all[_\s-]*active$/i.test(name) || update.all_active_students) {
    return { exclusion: { reason: 'all-active update requires explicit expansion before backfill', source_kind: sourceKind, student_name_hash: sha256(name || 'ALL_ACTIVE').slice(0, 12) } };
  }
  const match = matchDetailsForName(name, students);
  if (!match.matched_student_id || match.ambiguous) {
    return { exclusion: { reason: match.ambiguous ? 'ambiguous student match' : 'no student match', source_kind: sourceKind, student_name_hash: sha256(normalizeNameForMatch(name) || name).slice(0, 12), match } };
  }
  let mapping;
  try {
    mapping = normalizeParsedTorahEngagement({
      ...update,
      goal_minutes: update.goal_minutes || update.target_minutes,
      goal_type: update.goal_type || 'INSIDE',
      inside_engaged_minutes: update.inside_engaged_minutes ?? update.inside_following_minutes,
      listening_without_following_minutes: update.listening_without_following_minutes ?? update.inside_listening_minutes,
    }, { goalType: update.goal_type || 'INSIDE' });
  } catch (error) {
    return { exclusion: { reason: 'invalid progress mapping', source_kind: sourceKind, student_name_hash: sha256(normalizeNameForMatch(name) || name).slice(0, 12), error: error.message } };
  }
  if (!mapping.hasProgressSignal) return { exclusion: { reason: 'no progress signal', source_kind: sourceKind, student_name_hash: sha256(normalizeNameForMatch(name) || name).slice(0, 12) } };
  const date = toIsoDate(update.date || update.recorded_date || job.class_date || job.created_at) || new Date().toISOString().slice(0, 10);
  const existingTorah = existingProgressRow(torahEntries, match.matched_student_id, date);
  const existingGroup = toArray(groupGoalEntries).find((row) => Number(row.source_content_job_id) === Number(job.id) && Number(row.student_id) === Number(match.matched_student_id) && toIsoDate(row.recorded_date || row.date || row.created_at) === date);
  const proposals = [{
    table: 'bna_torah_learning_entries',
    action: existingTorah ? 'update' : 'insert',
    natural_key: `student:${match.matched_student_id}:date:${date}:torah_learning`,
    before: existingTorah ? { id: existingTorah.id, progress_percent: existingTorah.progress_percent || existingTorah.daily_completion_percentage || null } : null,
    after: compactObject({
      student_id: match.matched_student_id,
      date,
      goal_minutes: mapping.goalMinutes,
      goal_type: mapping.goalType,
      engaged_listening_minutes: mapping.engagedListeningMinutes,
      inside_engaged_minutes: mapping.insideEngagedMinutes,
      listening_without_following_minutes: mapping.listeningWithoutFollowingMinutes,
      distracted_minutes: mapping.distractedMinutes,
      daily_completion_percentage: mapping.dailyCompletionPercentage,
      daily_completed_boolean: mapping.dailyCompletedBoolean,
      source_content_job_id: job.id,
      source_kind: sourceKind,
    }),
  }];
  if (sourceKind === 'group_goal_entries' || update.target_minutes || update.inside_following_minutes || update.inside_listening_minutes) {
    proposals.push({
      table: 'bna_group_goal_entries',
      action: existingGroup ? 'skip_existing' : 'insert',
      natural_key: `content_job:${job.id}:student:${match.matched_student_id}:date:${date}:group_goal`,
      before: existingGroup ? { id: existingGroup.id, progress_percent: existingGroup.progress_percent } : null,
      after: compactObject({
        student_id: match.matched_student_id,
        recorded_date: date,
        target_minutes: mapping.goalMinutes,
        inside_following_minutes: mapping.insideEngagedMinutes,
        inside_listening_minutes: mapping.listeningWithoutFollowingMinutes,
        distracted_minutes: mapping.distractedMinutes,
        progress_percent: mapping.progressPercent,
        source_content_job_id: job.id,
      }),
    });
  }
  proposals.push({
    table: 'bna_accountability_events',
    action: 'insert_if_missing',
    natural_key: `content_job:${job.id}:student:${match.matched_student_id}:date:${date}:progress_event`,
    before: null,
    after: {
      student_id: match.matched_student_id,
      event_type: 'learning_note',
      title: 'Daily Torah progress',
      progress_percent: mapping.progressPercent,
      source_content_job_id: job.id,
      parent_visible: true,
      student_visible: true,
    },
  });
  return { proposals };
}

function questionProposals({ job, structured, students, accountabilityEvents }) {
  const proposals = [];
  const exclusions = [];
  const classQuestionFallbacks = [];
  for (const question of questionCandidateItems(structured)) {
      if (!question) continue;
      const match = question.student_name ? matchDetailsForName(question.student_name, students) : null;
      if (!match?.matched_student_id || match.ambiguous) {
        const reason = match?.ambiguous ? 'ambiguous question student match' : 'question has no student match';
        const activeStudents = activeStudentsForClassQuestions(students);
        const fallback = {
          reason,
          routing: 'class_question_broadcast',
          student_name_hash: sha256(normalizeNameForMatch(question.student_name) || question.student_name || '').slice(0, 12),
          question_text_hash: sha256(question.question_text).slice(0, 12),
          target_student_count: activeStudents.length,
          source_kind: question.source_kind,
          match,
        };
        classQuestionFallbacks.push(fallback);
        for (const student of activeStudents) {
          const existing = existingQuestionEvent(accountabilityEvents, job.id, student.id, question.question_text);
          proposals.push({
            table: 'bna_accountability_events',
            action: existing ? 'skip_existing' : 'insert',
            natural_key: `content_job:${job.id}:class_question:${sha256(question.question_text).slice(0, 12)}:student:${student.id}`,
            before: existing ? { id: existing.id } : null,
            after: {
              student_id: student.id,
              event_type: 'question',
              title: 'Class question',
              question_text_hash: sha256(question.question_text).slice(0, 12),
              source_content_job_id: job.id,
              parent_visible: true,
              student_visible: true,
              metadata: {
                source: 'class_drive_intake',
                question_scope: 'class_question',
                class_question_broadcast: true,
                not_personal_student_question: true,
                original_match_status: reason,
                source_kind: question.source_kind,
              },
            },
          });
        }
        if (!activeStudents.length) {
          exclusions.push({
            ...fallback,
            reason: 'class question fallback has no active students',
          });
        }
        continue;
      }
      const existing = existingQuestionEvent(accountabilityEvents, job.id, match.matched_student_id, question.question_text);
      proposals.push({
        table: 'bna_accountability_events',
        action: existing ? 'skip_existing' : 'insert',
        natural_key: `content_job:${job.id}:student:${match.matched_student_id}:question:${sha256(question.question_text).slice(0, 12)}`,
        before: existing ? { id: existing.id } : null,
        after: {
          student_id: match.matched_student_id,
          event_type: 'question',
          title: 'Student class question',
          question_text_hash: sha256(question.question_text).slice(0, 12),
          source_content_job_id: job.id,
          parent_visible: true,
          student_visible: true,
          metadata: {
            source: 'class_drive_intake',
            question_scope: 'student_question',
            class_question_broadcast: false,
            matched_student_ref: match.matched_student_ref,
            source_kind: question.source_kind,
          },
        },
      });
  }
  return { proposals, exclusions, classQuestionFallbacks };
}

function buildGuardedBackfillDryRun({
  jobs = [],
  students = [],
  classSessions = [],
  groupGoalEntries = [],
  torahEntries = [],
  accountabilityEvents = [],
  jobRange = DEFAULT_REPAIR_JOB_RANGE,
  generatedAt = new Date().toISOString(),
} = {}) {
  const duplicateGroups = duplicateGroupsForJobs(jobs);
  const duplicateJobIds = new Set(duplicateGroups.flatMap((group) => group.job_ids.slice(1).map(Number)));
  const [start, end] = jobRange;
  const proposals = [];
  const ambiguityExclusions = [];
  const classQuestionFallbacks = [];
  const duplicateExclusions = [];
  const candidateJobs = [];
  const excludedJobs = [];
  for (const job of toArray(jobs)) {
    const inRequestedRange = Number(job.id) >= start && Number(job.id) <= end;
    if (!inRequestedRange) {
      excludedJobs.push({ job_id: job.id || null, reason: 'outside requested guarded backfill job range' });
      continue;
    }
    const structured = extractStructuredOutput(job);
    const useful = structured.class_notes.length || structured.daily_torah_updates.length || structured.group_goal_entries.length || structured.accountability_events.length;
    if (!useful) {
      excludedJobs.push({ job_id: job.id || null, reason: 'no structured class/progress output available for backfill' });
      continue;
    }
    if (duplicateJobIds.has(Number(job.id))) {
      duplicateExclusions.push({ job_id: Number(job.id), reason: 'duplicate source fingerprint; first occurrence is canonical candidate' });
      excludedJobs.push({ job_id: job.id || null, reason: 'duplicate source fingerprint' });
      continue;
    }
    candidateJobs.push({
      job_id: job.id || null,
      in_required_repair_range: inRequestedRange,
      title: contentJobLabel(job),
      fingerprint_sha256: jobSourceFingerprint(job),
    });
    const classRow = classSessionProposal(job, structured, classSessions);
    if (classRow) proposals.push(classRow);
    for (const update of structured.daily_torah_updates) {
      const result = progressProposal({ job, update, students, torahEntries, groupGoalEntries, sourceKind: 'daily_torah_updates' });
      if (result?.exclusion) ambiguityExclusions.push({ job_id: job.id || null, ...result.exclusion });
      if (result?.proposals) proposals.push(...result.proposals);
    }
    for (const entry of structured.group_goal_entries) {
      const result = progressProposal({ job, update: entry, students, torahEntries, groupGoalEntries, sourceKind: 'group_goal_entries' });
      if (result?.exclusion) ambiguityExclusions.push({ job_id: job.id || null, ...result.exclusion });
      if (result?.proposals) proposals.push(...result.proposals);
    }
    const questions = questionProposals({ job, structured, students, accountabilityEvents });
    proposals.push(...questions.proposals);
    ambiguityExclusions.push(...questions.exclusions.map((item) => ({ job_id: job.id || null, ...item })));
    for (const fallback of questions.classQuestionFallbacks || []) {
      const withJob = { job_id: job.id || null, ...fallback, blocking: false };
      classQuestionFallbacks.push(withJob);
      ambiguityExclusions.push(withJob);
    }
  }
  const plannedWrites = proposals.filter((row) => !/^skip/.test(row.action));
  const expectedRowCounts = plannedWrites.reduce((counts, row) => {
    counts[row.table] = (counts[row.table] || 0) + 1;
    return counts;
  }, {});
  const blockingAmbiguities = ambiguityExclusions.filter((item) => item.blocking !== false && /ambiguous|no student match|all-active|no active students/.test(item.reason || ''));
  const safeToApply = plannedWrites.length > 0 && blockingAmbiguities.length === 0;
  return {
    generated_at: generatedAt,
    mode: 'dry_run_no_writes',
    no_production_mutation: true,
    candidate_jobs: candidateJobs,
    approved_candidate_jobs: safeToApply ? candidateJobs.map((job) => job.job_id).filter(Boolean) : [],
    excluded_jobs: excludedJobs,
    row_level_change_plan: proposals,
    class_question_fallbacks: classQuestionFallbacks,
    ambiguity_exclusions: ambiguityExclusions,
    duplicate_exclusions: duplicateExclusions,
    blocking_ambiguities: blockingAmbiguities,
    duplicate_groups: duplicateGroups,
    expected_row_counts: expectedRowCounts,
    transaction_boundaries: [
      'BEGIN',
      'lock each candidate bna_content_jobs row FOR UPDATE',
      'upsert by deterministic natural keys',
      'write audit event with source fingerprints and counts',
      'COMMIT',
    ],
    rollback_strategy: [
      'Take a production DB snapshot before apply.',
      'Store inserted/updated row ids and previous values in the audit event.',
      'Rollback restores before values and deletes inserted rows by audit id in one transaction.',
    ],
    snapshot_backup_requirement: 'Production database snapshot and exported candidate rows are required before apply.',
    idempotency: {
      natural_keys: [...new Set(proposals.map((row) => row.natural_key))],
      duplicate_uploads_excluded: duplicateExclusions.length,
      rerun_after_success_expected_writes: 0,
      dry_run_performs_no_writes: true,
    },
    safe_to_apply: safeToApply,
    required_gate_phrase: APPLY_GATE_PHRASE,
    apply_command: `node scripts/class-drive-intake-reconcile.cjs backfill --apply --gate ${APPLY_GATE_PHRASE} --jobs ${start}-${end}`,
    rollback_command: `node scripts/class-drive-intake-reconcile.cjs rollback --gate ${APPLY_GATE_PHRASE} --audit-id <audit_event_id>`,
  };
}

function jobIdFromNaturalKey(value = '') {
  const match = String(value || '').match(/\bcontent_job:(\d+)\b/);
  return match ? Number(match[1]) : 0;
}

function rowsByContentJob(rows = []) {
  const map = new Map();
  for (const row of toArray(rows)) {
    const jobId = Number(row.job_id || row.source_content_job_id || row.after?.source_content_job_id || jobIdFromNaturalKey(row.natural_key));
    if (!jobId) continue;
    if (!map.has(jobId)) map.set(jobId, []);
    map.get(jobId).push(row);
  }
  return map;
}

function digestCategories(record = {}) {
  const manifest = record.manifest || record;
  const categoryRows = toArray(record.categories?.categories);
  const categoryList = toArray(manifest.category_list || manifest.categories);
  return [...new Set([
    ...categoryList,
    ...categoryRows.map((item) => item.lane || item.category || item.key).filter(Boolean),
  ])].sort();
}

function classifyDigestParseStatus(record = {}, cardRow = {}) {
  const manifest = record.manifest || record;
  const categories = digestCategories(record);
  const parseGaps = toArray(record.parse_gaps);
  const parserMissing = !manifest.parser_used || /structured output present|transcript exists but parser request is not visible/i.test(String(manifest.parse_run_id || ''));
  const hasParserError = categories.includes('parser_error') || parseGaps.some((gap) => ['parser_request', 'structured_output'].includes(gap.stage));
  if (cardRow.parse_status === 'Parsed' && !hasParserError && !parserMissing) return { key: 'parsed', label: 'Parsed', reason: 'Content-card audit reports parsed with parser metadata.' };
  if (toPositiveNumber(manifest.transcript_chars) > 0 && (hasParserError || parserMissing)) {
    return { key: 'needs_parse', label: 'Needs parse', reason: 'Private transcript exists, but parser metadata/structured class output is incomplete.' };
  }
  if (toPositiveNumber(manifest.transcript_chars) > 0) return { key: 'needs_parse', label: 'Needs parse', reason: 'Transcript exists but parser readiness is not proven.' };
  return { key: 'needs_transcript', label: 'Needs transcript', reason: 'No transcript character count is available in repo-safe metadata.' };
}

function scoreProgressRows(rows = []) {
  return toArray(rows).filter((row) => (
    row.table === 'bna_torah_learning_entries'
    || row.table === 'bna_group_goal_entries'
    || row.after?.event_type === 'learning_note'
  ));
}

function questionRows(rows = []) {
  return toArray(rows).filter((row) => row.table === 'bna_accountability_events' && row.after?.event_type === 'question');
}

function buildBacklogCatchupCensus({
  digestRecords = [],
  contentCardAudit = {},
  questionMatrix = [],
  backfillPlan = {},
  classQuestionDryRun = {},
  focusJobIds = DEFAULT_CATCHUP_FOCUS_JOB_IDS,
  generatedAt = new Date().toISOString(),
} = {}) {
  const cardRows = rowsByContentJob(contentCardAudit.rows || []);
  const matrixRows = rowsByContentJob(questionMatrix);
  const backfillRows = rowsByContentJob(backfillPlan.row_level_change_plan || []);
  const fallbackRows = rowsByContentJob(backfillPlan.class_question_fallbacks || []);
  const focusSet = new Set(toArray(focusJobIds).map(Number));
  const records = toArray(digestRecords)
    .map((record) => ({ ...record, manifest: record.manifest || record }))
    .filter((record) => Number(record.manifest?.job_id))
    .sort((a, b) => Number(a.manifest.job_id) - Number(b.manifest.job_id));

  const rows = records.map((record) => {
    const manifest = record.manifest;
    const jobId = Number(manifest.job_id);
    const categories = digestCategories(record);
    const card = (cardRows.get(jobId) || [])[0] || {};
    const rowPlan = backfillRows.get(jobId) || [];
    const questionPlanRows = questionRows(rowPlan);
    const classQuestionRows = questionPlanRows.filter((row) => row.after?.metadata?.question_scope === 'class_question');
    const personalQuestionRows = questionPlanRows.filter((row) => row.after?.metadata?.question_scope === 'student_question');
    const scoreRows = scoreProgressRows(rowPlan);
    const parse = classifyDigestParseStatus(record, card);
    const questionCandidates = matrixRows.get(jobId) || [];
    const taskCandidateIds = record.task_candidate_ids || [];
    const contentCandidateIds = record.content_idea_candidate_ids || [];
    const digestReady = manifest.raw_transcript_body_included === false || Boolean(manifest.job_ref);
    const routingReady = categories.some((category) => !['unknown_needs_review', 'uncategorized'].includes(category));
    const topicReady = routingReady && card.topic_status !== 'Needs topic classification';
    const scoreReason = scoreRows.length
      ? 'Redacted score/progress before-after rows exist in the dry-run plan.'
      : parse.key === 'needs_parse'
        ? 'No safe score/progress rows because parser output lacks structured progress signals; reparse/canonical-write dry-run is required first.'
        : 'No score/progress rows are warranted by the current sanitized digest/backfill evidence.';
    const needsHumanReview = Boolean(
      manifest.private_review_flag
      || parse.key !== 'parsed'
      || scoreRows.length === 0
      || classQuestionRows.length
      || personalQuestionRows.length
    );
    const blockedReasons = [
      parse.key !== 'parsed' ? 'needs_private_reparse_or_parser_review' : '',
      scoreRows.length ? '' : 'score_progress_no_safe_rows',
      questionPlanRows.length ? 'production_question_apply_not_approved' : '',
      manifest.private_review_flag ? 'private_review_required' : '',
    ].filter(Boolean);
    const nextAction = parse.key !== 'parsed'
      ? 'Run an approved dry-run reparse/canonical-write planner against the private transcript source; do not write production rows yet.'
      : questionPlanRows.length
        ? 'Review the class-question/student-question dry-run rows and approve an exact guarded apply path if acceptable.'
        : 'Keep card visible as repo-safe digest evidence; no production write is implied by this report.';

    return {
      job_id: jobId,
      focus_job: focusSet.has(jobId),
      generated_title: manifest.generated_title || card.display_title || `content_job:${jobId}`,
      has_repo_safe_digest: digestReady,
      has_private_raw_transcript: toPositiveNumber(manifest.transcript_chars) > 0,
      private_raw_transcript_ref: toPositiveNumber(manifest.transcript_chars) > 0 ? 'private_app_or_drive_raw_body' : 'none_visible_to_repo',
      transcript_chars: toPositiveNumber(manifest.transcript_chars),
      parse_status: parse,
      digest_status: digestReady ? 'digest_ready' : 'needs_digest',
      routing_status: routingReady ? 'routing_ready' : 'needs_routing',
      topic_status: topicReady ? 'classified' : 'needs_topic_classification',
      categories,
      question_candidates: {
        total: toPositiveNumber(manifest.questions_extracted_count) || questionCandidates.length,
        matrix_rows: questionCandidates.length,
        candidate_refs: questionCandidates.map((item) => item.question_ref || '').filter(Boolean),
      },
      class_question_candidates: {
        fallback_candidates: (fallbackRows.get(jobId) || []).length,
        broadcast_insert_rows: classQuestionRows.filter((row) => row.action === 'insert').length,
        skip_existing_rows: classQuestionRows.filter((row) => /^skip/.test(row.action || '')).length,
      },
      matched_personal_question_candidates: {
        matrix_rows: questionCandidates.filter((item) => item.match_status === 'matched').length,
        insert_rows: personalQuestionRows.filter((row) => row.action === 'insert').length,
        skip_existing_rows: personalQuestionRows.filter((row) => /^skip/.test(row.action || '')).length,
      },
      task_action_candidates: {
        manifest_count: toPositiveNumber(manifest.tasks_extracted),
        candidate_ids: taskCandidateIds,
        production_task_write_allowed: false,
      },
      research_content_candidates: {
        content_card_ready: digestReady && routingReady,
        content_idea_candidate_ids: contentCandidateIds,
        content_marketing_flag: Boolean(manifest.content_marketing_flag),
      },
      score_progress_candidate_status: {
        status: scoreRows.length ? 'row_level_plan_ready' : 'no_safe_rows',
        row_level_change_count: scoreRows.length,
        reason: scoreReason,
      },
      needs_human_review: needsHumanReview,
      blocked_reason: blockedReasons.join('; ') || '',
      next_action: nextAction,
      raw_transcript_body_included: false,
    };
  });

  const sum = (selector) => rows.reduce((count, row) => count + Number(selector(row) || 0), 0);
  const summary = {
    recording_count: rows.length,
    focus_job_count: rows.filter((row) => row.focus_job).length,
    repo_safe_digest_count: rows.filter((row) => row.has_repo_safe_digest).length,
    private_raw_transcript_available_count: rows.filter((row) => row.has_private_raw_transcript).length,
    needs_parse_count: rows.filter((row) => row.parse_status.key === 'needs_parse').length,
    digest_ready_count: rows.filter((row) => row.digest_status === 'digest_ready').length,
    routing_ready_count: rows.filter((row) => row.routing_status === 'routing_ready').length,
    topic_classified_count: rows.filter((row) => row.topic_status === 'classified').length,
    question_candidate_count: sum((row) => row.question_candidates.total),
    class_question_broadcast_insert_rows: sum((row) => row.class_question_candidates.broadcast_insert_rows),
    matched_personal_question_insert_rows: sum((row) => row.matched_personal_question_candidates.insert_rows),
    question_skip_existing_rows: sum((row) => row.class_question_candidates.skip_existing_rows + row.matched_personal_question_candidates.skip_existing_rows),
    task_action_candidate_count: sum((row) => row.task_action_candidates.candidate_ids.length || row.task_action_candidates.manifest_count),
    score_progress_row_level_change_count: sum((row) => row.score_progress_candidate_status.row_level_change_count),
    research_content_card_ready_count: rows.filter((row) => row.research_content_candidates.content_card_ready).length,
    human_review_required_count: rows.filter((row) => row.needs_human_review).length,
  };

  return {
    generated_at: generatedAt,
    mode: 'repo_safe_no_write_catchup_census',
    no_production_mutation: true,
    raw_transcript_bodies_included: false,
    focus_job_ids: [...focusSet].sort((a, b) => a - b),
    class_question_dry_run_summary: classQuestionDryRun.dry_run_result || null,
    summary,
    rows,
    remaining_blockers: [
      summary.needs_parse_count ? `${summary.needs_parse_count} digest jobs still need private parser/reparse review before downstream score/progress writes.` : '',
      summary.score_progress_row_level_change_count ? '' : 'Score/progress has 0 safe row-level before-after rows in this no-write package.',
      summary.class_question_broadcast_insert_rows || summary.matched_personal_question_insert_rows ? 'Question rows are planned only; production apply requires exact owner approval plus snapshot/rollback proof.' : '',
    ].filter(Boolean),
    guardrails: {
      drive_write_performed: false,
      production_db_mutation_performed: false,
      class_backfill_performed: false,
      raw_transcript_export_performed: false,
      ai_call_performed: false,
      apply_performed: false,
    },
  };
}

function buildScoreProgressCatchupPlan(census = {}) {
  const rows = toArray(census.rows).map((row) => ({
    job_id: row.job_id,
    parse_status: row.parse_status?.key || 'unknown',
    transcript_chars: row.transcript_chars || 0,
    row_level_change_count: row.score_progress_candidate_status?.row_level_change_count || 0,
    status: row.score_progress_candidate_status?.status || 'no_safe_rows',
    before_after_rows_redacted: [],
    no_op_reason: row.score_progress_candidate_status?.row_level_change_count
      ? ''
      : row.score_progress_candidate_status?.reason || 'No score/progress candidate rows were emitted.',
    exact_next_action: row.score_progress_candidate_status?.row_level_change_count
      ? 'Review row-level score/progress before-after plan before any apply command.'
      : 'Keep as no-op until an approved private reparse/canonical-write dry-run emits score/progress before-after rows.',
  }));
  return {
    generated_at: census.generated_at || new Date().toISOString(),
    mode: 'no_write_score_progress_catchup_plan',
    no_production_mutation: true,
    summary: {
      inspected_jobs: rows.length,
      row_level_change_count: rows.reduce((count, row) => count + row.row_level_change_count, 0),
      no_op_jobs: rows.filter((row) => row.row_level_change_count === 0).length,
      jobs_needing_private_reparse: rows.filter((row) => row.parse_status === 'needs_parse').map((row) => row.job_id),
    },
    rows,
    production_apply_allowed: false,
    blocker: 'Production score/progress writes require exact owner approval and redacted row-level before/after evidence. Current plan has no safe rows.',
  };
}

function buildTaskActionCatchupPlan(census = {}) {
  const rows = [];
  for (const row of toArray(census.rows)) {
    const candidateIds = row.task_action_candidates?.candidate_ids?.length
      ? row.task_action_candidates.candidate_ids
      : Array.from({ length: row.task_action_candidates?.manifest_count || 0 }, (_item, index) => `TASK-CANDIDATE-${String(row.job_id).padStart(6, '0')}-${String(index + 1).padStart(2, '0')}`);
    for (const candidateId of candidateIds) {
      const type = /DIGEST|REPAIR|PARSE|AUDIT/.test(candidateId) ? 'internal_agent_task' : 'human_visible_task_candidate';
      rows.push({
        job_id: row.job_id,
        candidate_id: candidateId,
        canonical_task_key: `bna|class_drive_intake|content_job:${row.job_id}|${candidateId.toLowerCase()}`,
        candidate_type: type,
        dedupe_key: sha256(`content_job:${row.job_id}|${candidateId}`).slice(0, 16),
        action: 'no_write_plan_only',
        production_task_write_allowed: false,
        exact_next_action: type === 'internal_agent_task'
          ? 'Keep as repo evidence/agent work; do not create a human-facing production task.'
          : 'Review before any separately approved production task creation.',
      });
    }
  }
  return {
    generated_at: census.generated_at || new Date().toISOString(),
    mode: 'no_write_task_action_catchup_plan',
    no_production_mutation: true,
    summary: {
      inspected_jobs: toArray(census.rows).length,
      task_action_candidates: rows.length,
      internal_agent_task_candidates: rows.filter((row) => row.candidate_type === 'internal_agent_task').length,
      human_visible_task_candidates: rows.filter((row) => row.candidate_type === 'human_visible_task_candidate').length,
    },
    rows,
    production_task_creation_allowed: false,
    dedupe_rule: 'Use canonical_task_key; do not surface internal digest/parser/audit handoff rows as operator Pending cards.',
  };
}

function buildResearchContentCatchupPlan(census = {}) {
  const rows = toArray(census.rows).map((row) => ({
    job_id: row.job_id,
    generated_title: row.generated_title,
    content_card_ready: row.research_content_candidates?.content_card_ready === true,
    categories: row.categories,
    topic_status: row.topic_status,
    content_idea_candidate_ids: row.research_content_candidates?.content_idea_candidate_ids || [],
    raw_transcript_body_included: false,
    next_action: row.research_content_candidates?.content_card_ready
      ? 'Content/research card can stay visible with sanitized digest metadata.'
      : 'Repair digest/routing/topic evidence before showing as complete.',
  }));
  return {
    generated_at: census.generated_at || new Date().toISOString(),
    mode: 'repo_safe_research_content_catchup_plan',
    no_production_mutation: true,
    raw_transcript_bodies_included: false,
    summary: {
      inspected_jobs: rows.length,
      content_cards_ready: rows.filter((row) => row.content_card_ready).length,
      needs_content_card_repair: rows.filter((row) => !row.content_card_ready).length,
      content_idea_candidate_count: rows.reduce((count, row) => count + row.content_idea_candidate_ids.length, 0),
    },
    rows,
  };
}

function buildApplyLaneDesign({ backfillPlan = {}, exactJobIds = [] } = {}) {
  const jobIds = toArray(exactJobIds).map(Number).filter(Boolean);
  return {
    generated_at: new Date().toISOString(),
    mode: 'apply_lane_design_only_not_executed',
    current_apply_lane_status: 'refuses_mutation_by_design',
    production_apply_executed: false,
    dry_run_default: true,
    required_owner_gate_phrase: APPLY_GATE_PHRASE,
    exact_job_ids_required: true,
    planned_job_ids: jobIds,
    dry_run_command: jobIds.length
      ? `node scripts/class-drive-intake-reconcile.cjs backfill --jobs ${Math.min(...jobIds)}-${Math.max(...jobIds)} --out-dir <evidence-dir>`
      : 'node scripts/class-drive-intake-reconcile.cjs backfill --jobs <exact-range> --out-dir <evidence-dir>',
    apply_command_template: `node scripts/class-drive-intake-reconcile.cjs backfill --apply --gate ${APPLY_GATE_PHRASE} --jobs <exact-approved-job-range> --snapshot <snapshot-file> --rollback-out <rollback-file>`,
    required_controls: [
      'explicit owner approval naming job IDs and actions',
      'production DB snapshot before write',
      'rollback file generated before commit',
      'row-level before/after evidence',
      'idempotent natural keys',
      'small batch support',
      'dry-run remains default',
    ],
    refusal_conditions: [
      'raw transcript body would be exported to GitHub',
      'student match is ambiguous',
      'score/progress row lacks before/after',
      'target schema is unknown',
      'snapshot path is missing',
      'rollback path is missing',
      'approval scope does not exactly match job IDs/actions',
      'Drive write or broad sync is requested by the apply lane',
    ],
    success_planning_path: {
      safe_to_apply_if_separately_approved: Boolean(backfillPlan.safe_to_apply),
      expected_row_counts: backfillPlan.expected_row_counts || {},
      row_level_change_plan_rows: toArray(backfillPlan.row_level_change_plan).length,
      blocking_ambiguities: toArray(backfillPlan.blocking_ambiguities).length,
      dry_run_performs_no_writes: true,
    },
    implementation_note: 'This packet documents the guarded apply contract but leaves the CLI mutation path disabled until an exact owner-approved implementation step is requested.',
  };
}

function sortedUniqueNumbers(values = []) {
  return [...new Set(toArray(values).map(Number).filter(Boolean))].sort((a, b) => a - b);
}

function sameNumberList(left = [], right = []) {
  const a = sortedUniqueNumbers(left);
  const b = sortedUniqueNumbers(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function normalizeApprovedActions(actions = []) {
  const aliases = {
    personal_question: 'personal_questions',
    personal_questions: 'personal_questions',
    class_question: 'class_question_broadcasts',
    class_questions: 'class_question_broadcasts',
    class_question_broadcast: 'class_question_broadcasts',
    class_question_broadcasts: 'class_question_broadcasts',
    score_progress: 'score_progress',
    score: 'score_progress',
    progress: 'score_progress',
    production_task: 'production_tasks',
    production_tasks: 'production_tasks',
    tasks: 'production_tasks',
  };
  return [...new Set(toArray(actions)
    .flatMap((item) => String(item || '').split(/[,\s]+/))
    .map((item) => aliases[item.trim().toLowerCase()])
    .filter(Boolean))];
}

function plannedWriteRows(rows = []) {
  return toArray(rows).filter((row) => !/^skip/.test(String(row.action || '')));
}

function rowsByTable(rows = []) {
  return toArray(rows).reduce((counts, row) => {
    counts[row.table || 'unknown'] = (counts[row.table || 'unknown'] || 0) + 1;
    return counts;
  }, {});
}

function duplicateValues(values = []) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes].sort();
}

function preflightCheck(id, passed, detail, severity = 'blocker') {
  return { id, passed: Boolean(passed), severity, detail };
}

function productionApplyCommand({ batch, jobIds = [], snapshotPath = '', rollbackPath = '', approvedActions = [] } = {}) {
  return [
    'node scripts/class-drive-intake-reconcile.cjs production-apply',
    '--apply',
    `--gate ${APPLY_GATE_PHRASE}`,
    `--job-ids ${sortedUniqueNumbers(jobIds).join(',')}`,
    `--approved-actions ${normalizeApprovedActions(approvedActions).join(',')}`,
    `--batch ${batch}`,
    `--snapshot "${snapshotPath || '<snapshot-file>'}"`,
    `--rollback-out "${rollbackPath || '<rollback-file>'}"`,
  ].join(' ');
}

function buildProductionApplyPreflight({
  privateReparseDryRun = {},
  approvedJobIds = DEFAULT_PRIVATE_REPARSE_JOB_IDS,
  approvedActions = DEFAULT_PRODUCTION_APPLY_ACTIONS,
  snapshotPath = '',
  rollbackPath = '',
  evidenceIntegrity = {},
  dbBlockers = [],
  branch = '',
  pullRequest = '',
  issue = '',
  generatedAt = new Date().toISOString(),
} = {}) {
  const jobIds = sortedUniqueNumbers(approvedJobIds);
  const actions = normalizeApprovedActions(approvedActions);
  const summary = privateReparseDryRun.summary || {};
  const reportJobIds = sortedUniqueNumbers(privateReparseDryRun.approved_job_ids || []);
  const inspectedJobIds = sortedUniqueNumbers(privateReparseDryRun.inspected_job_ids || []);
  const allPlanRows = plannedWriteRows(privateReparseDryRun.row_level_change_plan || []);
  const questionRows = allPlanRows.filter((row) => row.table === 'bna_accountability_events' && row.after?.event_type === 'question');
  const personalQuestionRows = questionRows.filter((row) => row.routing === 'personal_question');
  const classQuestionRows = questionRows.filter((row) => row.routing === 'class_question_broadcast');
  const scoreProgressRows = allPlanRows.filter((row) => ['bna_torah_learning_entries', 'bna_group_goal_entries'].includes(row.table));
  const progressEventRows = allPlanRows.filter((row) => row.routing === 'progress_event');
  const taskRows = allPlanRows.filter((row) => row.table === 'bna_tasks');
  const supportedApplyRows = [
    ...(actions.includes('personal_questions') ? personalQuestionRows : []),
    ...(actions.includes('class_question_broadcasts') ? classQuestionRows : []),
    ...(actions.includes('score_progress') ? scoreProgressRows : []),
  ];
  const naturalKeys = supportedApplyRows.map((row) => row.natural_key).filter(Boolean);
  const duplicateNaturalKeys = duplicateValues(naturalKeys);
  const targetTables = [...new Set(supportedApplyRows.map((row) => row.table).filter(Boolean))].sort();
  const unknownTables = targetTables.filter((table) => !PRODUCTION_APPLY_TABLES.includes(table));
  const scoreProgressBeforeAfterReady = scoreProgressRows.every((row) => Object.prototype.hasOwnProperty.call(row, 'before') && row.after && row.natural_key);
  const classCandidateRows = toArray(privateReparseDryRun.question_routing).filter((row) => row.routing === 'class_question_broadcast');
  const blockedReviewRows = toArray(privateReparseDryRun.question_routing).filter((row) => row.routing === 'blocked_review');
  const ambiguousPersonalRows = toArray(privateReparseDryRun.question_routing).filter((row) => row.routing === 'personal_question' && row.match_status === 'ambiguous');
  const countsMatch = (
    Number(summary.personal_question_candidates || 0) === personalQuestionRows.length
    && Number(summary.class_question_broadcast_candidates || 0) === classCandidateRows.length
    && Number(summary.score_progress_rows || 0) === scoreProgressRows.length
    && Number(summary.task_candidate_rows || 0) === taskRows.length
  );
  const knownResultPreserved = (
    Number(summary.approved_jobs || 0) === 10
    && Number(summary.inspected_jobs || 0) === 10
    && Number(summary.private_transcript_sources_read || 0) === 10
    && Number(summary.student_name_mentions || 0) === 261
    && Number(summary.question_candidates || 0) === 1285
    && Number(summary.personal_question_candidates || 0) === 36
    && Number(summary.class_question_broadcast_candidates || 0) === 1249
    && Number(summary.task_candidate_rows || 0) === 119
    && Number(summary.score_progress_rows || 0) === 1
    && Number(summary.score_progress_no_op_rows || 0) === 55
    && Number(summary.blocked_review_candidates || 0) === 0
  );
  const checks = [
    preflightCheck('exact_approved_job_ids', sameNumberList(jobIds, DEFAULT_PRIVATE_REPARSE_JOB_IDS) && sameNumberList(reportJobIds, DEFAULT_PRIVATE_REPARSE_JOB_IDS), `requested=${jobIds.join(',')} report=${reportJobIds.join(',')}`),
    preflightCheck('all_approved_jobs_inspected', sameNumberList(inspectedJobIds, DEFAULT_PRIVATE_REPARSE_JOB_IDS), `inspected=${inspectedJobIds.join(',')}`),
    preflightCheck('private_reparse_evidence_non_empty', toArray(evidenceIntegrity.files).every((file) => file.exists && file.size > 0) && toArray(evidenceIntegrity.files).length >= 2, 'private dry-run markdown/json evidence exists and is non-empty'),
    preflightCheck('private_reparse_evidence_sanitized', evidenceIntegrity.privacy_scan_passed !== false && privateReparseDryRun.raw_transcript_bodies_included !== true && privateReparseDryRun.raw_drive_urls_or_ids_included !== true, 'no raw transcript body, raw Drive URL/ID, or secret literal detected in evidence'),
    preflightCheck('known_private_reparse_counts_preserved', knownResultPreserved, 'private dry-run summary matches the approved baseline packet'),
    preflightCheck('row_counts_match_preflight', countsMatch, `personal=${personalQuestionRows.length}; classCandidates=${classCandidateRows.length}; classRows=${classQuestionRows.length}; scoreProgress=${scoreProgressRows.length}; taskCandidates=${taskRows.length}`),
    preflightCheck('no_blocked_review_question_candidates', blockedReviewRows.length === 0, `${blockedReviewRows.length} blocked-review question route(s)`),
    preflightCheck('no_ambiguous_personal_question_matches', ambiguousPersonalRows.length === 0, `${ambiguousPersonalRows.length} ambiguous personal route(s); ambiguous/no-name questions remain class broadcasts`),
    preflightCheck('score_progress_before_after_present', scoreProgressBeforeAfterReady, `${scoreProgressRows.length} score/progress row(s)`),
    preflightCheck('target_schema_mapping_known', unknownTables.length === 0, unknownTables.length ? `unknown tables: ${unknownTables.join(', ')}` : 'supported tables map to bna_accountability_events metadata and bna_torah_learning_entries updates'),
    preflightCheck('snapshot_path_present', Boolean(snapshotPath), snapshotPath || 'missing snapshot path'),
    preflightCheck('rollback_path_present', Boolean(rollbackPath), rollbackPath || 'missing rollback path'),
    preflightCheck('dedupe_keys_present', naturalKeys.length === supportedApplyRows.length && duplicateNaturalKeys.length === 0, `naturalKeys=${naturalKeys.length}; duplicateKeys=${duplicateNaturalKeys.length}`),
    preflightCheck('production_db_readback_available', toArray(dbBlockers).length === 0, toArray(dbBlockers).length ? toArray(dbBlockers).join('; ') : 'read-only production DB snapshot query succeeded'),
    preflightCheck('no_drive_write_or_ai_or_raw_export', privateReparseDryRun.no_drive_write !== false && privateReparseDryRun.no_ai_call !== false && privateReparseDryRun.raw_transcript_bodies_included !== true, 'private preflight uses DB/app transcript source only and writes repo-safe evidence only'),
    preflightCheck('production_tasks_not_enabled', !actions.includes('production_tasks'), `${taskRows.length} internal task candidate(s) remain internal and are not user-facing production tasks`),
    preflightCheck('final_owner_apply_approval_recorded', false, 'This packet authorizes implementation and final no-write preflight only; actual production apply needs a separate exact approval.', 'owner_approval'),
  ];
  const failedBlockers = checks.filter((check) => !check.passed && check.severity === 'blocker');
  const batchPlans = [
    {
      batch: 'personal_questions',
      status: actions.includes('personal_questions') ? 'ready_after_final_owner_approval' : 'not_requested',
      candidate_count: Number(summary.personal_question_candidates || personalQuestionRows.length),
      row_level_apply_rows: personalQuestionRows.length,
      target_tables: rowsByTable(personalQuestionRows),
      command: productionApplyCommand({ batch: 'personal_questions', jobIds, snapshotPath, rollbackPath, approvedActions: actions }),
    },
    {
      batch: 'class_question_broadcasts',
      status: actions.includes('class_question_broadcasts') ? 'ready_after_final_owner_approval' : 'not_requested',
      candidate_count: Number(summary.class_question_broadcast_candidates || classCandidateRows.length),
      row_level_apply_rows: classQuestionRows.length,
      target_tables: rowsByTable(classQuestionRows),
      command: productionApplyCommand({ batch: 'class_question_broadcasts', jobIds, snapshotPath, rollbackPath, approvedActions: actions }),
    },
    {
      batch: 'score_progress',
      status: actions.includes('score_progress') && scoreProgressBeforeAfterReady ? 'ready_after_snapshot_and_final_owner_approval' : 'blocked_or_not_requested',
      candidate_count: Number(summary.score_progress_rows || scoreProgressRows.length),
      row_level_apply_rows: scoreProgressRows.length,
      ancillary_progress_event_rows_deferred: progressEventRows.length,
      target_tables: rowsByTable(scoreProgressRows),
      command: productionApplyCommand({ batch: 'score_progress', jobIds, snapshotPath, rollbackPath, approvedActions: actions }),
      note: 'The ancillary progress_event row is deferred unless separately approved; the approved score/progress count is one row.',
    },
    {
      batch: 'production_tasks',
      status: 'not_allowed_internal_candidates_only',
      candidate_count: Number(summary.task_candidate_rows || taskRows.length),
      row_level_apply_rows: 0,
      target_tables: {},
      command: '',
      note: 'Internal agent/parser/audit task candidates must not become user-facing tasks without a separate human-visible task plan.',
    },
  ];
  const readbackCommands = [
    `node scripts/class-drive-intake-reconcile.cjs production-apply-preflight --job-ids ${jobIds.join(',')} --approved-actions ${actions.join(',')} --snapshot "${snapshotPath || '<snapshot-file>'}" --rollback-out "${rollbackPath || '<rollback-file>'}" --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit`,
    `node scripts/class-drive-intake-reconcile.cjs private-reparse --job-ids ${jobIds.join(',')} --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit`,
    'npm run bna:run:validate',
  ];
  return {
    generated_at: generatedAt,
    mode: 'production_apply_preflight_no_writes',
    branch,
    pull_request: pullRequest,
    issue,
    no_production_mutation: true,
    production_apply_executed: false,
    production_apply_command_may_be_run_now: false,
    final_owner_approval_required: true,
    required_gate_phrase: APPLY_GATE_PHRASE,
    approved_job_ids: jobIds,
    approved_actions: actions,
    snapshot_path: snapshotPath,
    snapshot_path_ref: redactedRef(snapshotPath, 'snapshot_path'),
    rollback_path: rollbackPath,
    rollback_path_ref: redactedRef(rollbackPath, 'rollback_path'),
    evidence_integrity: evidenceIntegrity,
    private_reparse_summary: summary,
    expected_row_counts: {
      personal_question_candidates: Number(summary.personal_question_candidates || personalQuestionRows.length),
      personal_question_rows: personalQuestionRows.length,
      class_question_broadcast_candidates: Number(summary.class_question_broadcast_candidates || classCandidateRows.length),
      class_question_broadcast_rows: classQuestionRows.length,
      score_progress_rows: scoreProgressRows.length,
      progress_event_rows_deferred: progressEventRows.length,
      production_task_rows: 0,
      internal_task_candidates_not_applied: taskRows.length,
      target_table_rows_if_all_requested_batches_are_later_approved: rowsByTable(supportedApplyRows),
    },
    target_schema_mapping: {
      bna_accountability_events: {
        question_rows: questionRows.length,
        write_columns: ['student_id', 'event_type', 'title', 'question_text', 'metadata', 'source', 'source_message_id'],
        private_value_rule: 'question_text is read from the private transcript source at apply time and must never be written to repo evidence',
        metadata_keys: ['source_content_job_id', 'question_text_hash', 'question_scope', 'class_question_broadcast', 'source_window_ref', 'parent_visible', 'student_visible'],
      },
      bna_torah_learning_entries: {
        score_progress_rows: scoreProgressRows.length,
        write_columns: ['engaged_listening_minutes', 'inside_engaged_minutes', 'listening_without_following_minutes', 'daily_completion_percentage', 'daily_completed_boolean', 'note', 'updated_at'],
        before_after_rule: 'snapshot must capture the full previous row before update; repo evidence stores row id and redacted hashes only',
      },
      bna_tasks: {
        production_task_rows: 0,
        internal_task_candidates_not_applied: taskRows.length,
      },
    },
    refusal_checks: checks,
    blocking_refusal_checks: failedBlockers,
    preflight_controls_passed: failedBlockers.length === 0,
    batch_plan: batchPlans,
    snapshot_plan: {
      required_before_apply: true,
      path: snapshotPath,
      path_ref: redactedRef(snapshotPath, 'snapshot_path'),
      commit_to_git: false,
      contains_private_data: true,
      required_tables: ['bna_content_jobs', 'bna_students', 'bna_accountability_events', 'bna_torah_learning_entries', 'bna_group_goal_entries'],
      minimum_rows_to_capture: supportedApplyRows.length,
      proof_to_record_in_repo: ['snapshot path ref', 'snapshot hash', 'row counts by table', 'created_at timestamp'],
    },
    rollback_plan: {
      required_before_apply: true,
      path: rollbackPath,
      path_ref: redactedRef(rollbackPath, 'rollback_path'),
      commit_to_git: false,
      contains_private_data: true,
      strategy: [
        'insert rows: delete by apply audit id and natural key',
        'update rows: restore the full before snapshot for each row id',
        'all batches: verify post-rollback row counts and write sanitized readback proof',
      ],
    },
    readback_plan: {
      required_after_each_batch: true,
      commands: readbackCommands,
      checks: [
        'row counts match approved batch',
        'rerun preflight shows zero duplicate natural keys',
        'student/class portal read models show only approved question rows',
        'no raw transcript body appears in repo evidence',
      ],
    },
    final_apply_commands: batchPlans.filter((batch) => batch.command).map((batch) => ({
      batch: batch.batch,
      expected_rows: batch.row_level_apply_rows,
      command: batch.command,
      do_not_run_until_final_owner_approval: true,
    })),
    remaining_blocker: 'Final production apply is still blocked by DEC-20260626-101 until Shloimie approves the exact command(s), snapshot path, rollback path, and row counts printed by this preflight.',
  };
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitPrivateTranscriptSegments(transcript = '') {
  const text = String(transcript || '').replace(/\r/g, '\n').replace(/\s+\n/g, '\n').trim();
  if (!text) return [];
  const chunks = text
    .split(/\n+|(?<=[?!])\s+|(?<=\.)\s+(?=[A-Z\u0590-\u05ff])/u)
    .map((chunk) => compactWhitespace(chunk))
    .filter(Boolean);
  const segments = [];
  for (const chunk of chunks) {
    if (chunk.length <= 520) {
      segments.push(chunk);
      continue;
    }
    for (let index = 0; index < chunk.length; index += 420) {
      segments.push(compactWhitespace(chunk.slice(index, index + 520)));
    }
  }
  return segments.map((segment, index) => ({
    index,
    text: segment,
    source_window_ref: `window:${sha256(`${index}|${segment}`).slice(0, 12)}`,
    source_window_hash: sha256(segment).slice(0, 16),
    char_count: segment.length,
  }));
}

function mentionStatusFromMatch(match = {}) {
  if (match.ambiguous) return 'ambiguous';
  if (match.matched_student_id) return 'matched';
  return 'unmatched';
}

function transcriptStudentMentions({ job, segments = [], students = [] } = {}) {
  const aliases = [];
  for (const student of toArray(students).filter((item) => !['archived', 'inactive'].includes(String(item?.status || 'active').toLowerCase()))) {
    for (const alias of studentAliasesForServer(student)) {
      aliases.push({
        student,
        alias,
        normalized_alias: normalizeNameForMatch(alias),
        alias_hash: sha256(normalizeNameForMatch(alias) || alias).slice(0, 12),
      });
    }
  }
  aliases.sort((a, b) => b.normalized_alias.length - a.normalized_alias.length);
  const mentions = [];
  const seen = new Set();
  for (const segment of segments) {
    const normalizedSegment = ` ${normalizeNameForMatch(segment.text)} `;
    for (const alias of aliases) {
      if (!alias.normalized_alias) continue;
      const regex = new RegExp(`\\s${escapeRegExp(alias.normalized_alias)}\\s`, 'g');
      let match;
      while ((match = regex.exec(normalizedSegment)) !== null) {
        const key = `${segment.index}|${alias.student.id}|${alias.normalized_alias}|${match.index}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const matchDetails = matchDetailsForName(alias.alias, students);
        mentions.push({
          job_id: job.id || null,
          mention_ref: `mention:${sha256(`${job.id}|${key}`).slice(0, 12)}`,
          source_window_ref: segment.source_window_ref,
          normalized_name_hash: alias.alias_hash,
          match_status: mentionStatusFromMatch(matchDetails),
          matched_student_ref: matchDetails.matched_student_ref,
          best_score: matchDetails.best_score,
          contenders: toArray(matchDetails.contenders).map((item) => ({
            student_ref: item.student_ref,
            score: item.score,
          })),
          raw_text_included: false,
          _student_name_for_internal_match: alias.alias,
        });
      }
    }
  }
  return mentions;
}

function questionSignal(segmentText = '') {
  const text = String(segmentText || '');
  if (/\?/.test(text)) return 'question_mark';
  if (/\b(?:asked|asks|question|wanted to know|wondered|can you explain|what about)\b/i.test(text)) return 'question_cue';
  if (/^\s*(?:why|what|how|when|where|who|which)\b/i.test(text) && text.length <= 180) return 'interrogative_cue';
  return '';
}

function studentNameFromQuestionSegment(segmentText = '', mentions = []) {
  const prefix = compactWhitespace(String(segmentText || '').match(/^([^:：-]{2,80})[:：-]\s*(.+)$/)?.[1] || '');
  if (prefix) return prefix;
  const matchedMentions = toArray(mentions).filter((mention) => mention.match_status === 'matched' && mention._student_name_for_internal_match);
  const matchedIds = [...new Set(matchedMentions.map((mention) => mention.matched_student_ref).filter(Boolean))];
  return matchedIds.length === 1 ? matchedMentions[0]._student_name_for_internal_match : '';
}

function privateQuestionCandidatesFromTranscript({ job, segments = [], mentions = [] } = {}) {
  const candidates = [];
  const seen = new Set();
  for (const segment of segments) {
    const signal = questionSignal(segment.text);
    if (!signal || segment.text.length < 8) continue;
    const windowMentions = mentions.filter((mention) => mention.source_window_ref === segment.source_window_ref);
    const questionText = compactWhitespace(segment.text).slice(0, 700);
    const questionHash = sha256(questionText).slice(0, 12);
    if (seen.has(questionHash)) continue;
    seen.add(questionHash);
    candidates.push({
      job_id: job.id || null,
      question_ref: `question:${questionHash}`,
      question_text_hash: questionHash,
      source_window_ref: segment.source_window_ref,
      source_window_hash: segment.source_window_hash,
      candidate_chars: questionText.length,
      signal,
      student_name_hash: windowMentions.length
        ? sha256(windowMentions.map((mention) => mention.normalized_name_hash).join('|')).slice(0, 12)
        : null,
      mention_refs: windowMentions.map((mention) => mention.mention_ref),
      raw_text_included: false,
      _question_text_for_internal_match: questionText,
      _student_name_for_internal_match: studentNameFromQuestionSegment(segment.text, windowMentions),
    });
  }
  return candidates;
}

function buildPrivateQuestionRouting({ job, questionCandidates = [], students = [], accountabilityEvents = [] } = {}) {
  const candidateRoutes = [];
  const rowPlan = [];
  const classQuestionFallbacks = [];
  const activeStudents = activeStudentsForClassQuestions(students);
  for (const candidate of questionCandidates) {
    const internalName = candidate._student_name_for_internal_match || '';
    const match = internalName ? matchDetailsForName(internalName, students) : null;
    const questionText = candidate._question_text_for_internal_match || candidate.question_text_hash;
    if (match?.matched_student_id && !match.ambiguous) {
      const existing = existingQuestionEvent(accountabilityEvents, job.id, match.matched_student_id, questionText);
      const row = {
        table: 'bna_accountability_events',
        action: existing ? 'skip_existing' : 'insert',
        routing: existing ? 'existing_skip' : 'personal_question',
        natural_key: `content_job:${job.id}:student:${match.matched_student_id}:question:${candidate.question_text_hash}`,
        before: existing ? { id: existing.id } : null,
        after: {
          student_id: match.matched_student_id,
          event_type: 'question',
          title: 'Student class question',
          question_text_hash: candidate.question_text_hash,
          source_content_job_id: job.id,
          parent_visible: true,
          student_visible: true,
          metadata: {
            source: 'private_reparse_dry_run',
            question_scope: 'student_question',
            class_question_broadcast: false,
            matched_student_ref: match.matched_student_ref,
            source_window_ref: candidate.source_window_ref,
          },
        },
      };
      rowPlan.push(row);
      candidateRoutes.push({
        job_id: job.id || null,
        question_ref: candidate.question_ref,
        question_text_hash: candidate.question_text_hash,
        source_window_ref: candidate.source_window_ref,
        routing: row.routing,
        match_status: 'matched',
        matched_student_ref: match.matched_student_ref,
        row_count: 1,
        insert_rows: existing ? 0 : 1,
        skip_existing_rows: existing ? 1 : 0,
        blocked_review_reason: '',
        raw_text_included: false,
      });
      continue;
    }

    if (!activeStudents.length) {
      candidateRoutes.push({
        job_id: job.id || null,
        question_ref: candidate.question_ref,
        question_text_hash: candidate.question_text_hash,
        source_window_ref: candidate.source_window_ref,
        routing: 'blocked_review',
        match_status: match?.ambiguous ? 'ambiguous' : 'no_student_name',
        matched_student_ref: null,
        row_count: 0,
        insert_rows: 0,
        skip_existing_rows: 0,
        blocked_review_reason: 'No active students available for class-question broadcast.',
        raw_text_included: false,
      });
      continue;
    }

    const reason = match?.ambiguous ? 'ambiguous question student match' : 'question has no student match';
    let insertRows = 0;
    let skipRows = 0;
    for (const student of activeStudents) {
      const existing = existingQuestionEvent(accountabilityEvents, job.id, student.id, questionText);
      if (existing) skipRows += 1;
      else insertRows += 1;
      rowPlan.push({
        table: 'bna_accountability_events',
        action: existing ? 'skip_existing' : 'insert',
        routing: existing ? 'existing_skip' : 'class_question_broadcast',
        natural_key: `content_job:${job.id}:class_question:${candidate.question_text_hash}:student:${student.id}`,
        before: existing ? { id: existing.id } : null,
        after: {
          student_id: student.id,
          event_type: 'question',
          title: 'Class question',
          question_text_hash: candidate.question_text_hash,
          source_content_job_id: job.id,
          parent_visible: true,
          student_visible: true,
          metadata: {
            source: 'private_reparse_dry_run',
            question_scope: 'class_question',
            class_question_broadcast: true,
            not_personal_student_question: true,
            original_match_status: reason,
            source_window_ref: candidate.source_window_ref,
          },
        },
      });
    }
    classQuestionFallbacks.push({
      job_id: job.id || null,
      question_ref: candidate.question_ref,
      question_text_hash: candidate.question_text_hash,
      source_window_ref: candidate.source_window_ref,
      reason,
      routing: 'class_question_broadcast',
      target_student_count: activeStudents.length,
      insert_rows: insertRows,
      skip_existing_rows: skipRows,
      blocking: false,
    });
    candidateRoutes.push({
      job_id: job.id || null,
      question_ref: candidate.question_ref,
      question_text_hash: candidate.question_text_hash,
      source_window_ref: candidate.source_window_ref,
      routing: insertRows ? 'class_question_broadcast' : 'existing_skip',
      match_status: match?.ambiguous ? 'ambiguous' : 'no_student_name',
      matched_student_ref: null,
      row_count: activeStudents.length,
      insert_rows: insertRows,
      skip_existing_rows: skipRows,
      blocked_review_reason: '',
      raw_text_included: false,
    });
  }
  return { candidateRoutes, rowPlan, classQuestionFallbacks };
}

function taskCandidatesFromTranscript({ job, segments = [] } = {}) {
  const rows = [];
  const seen = new Set();
  for (const segment of segments) {
    if (questionSignal(segment.text)) continue;
    if (!/\b(?:task|todo|to do|need to|needs to|make sure|fix|follow up|follow-up|remember to|next action|repair|update)\b/i.test(segment.text)) continue;
    const hash = sha256(segment.text).slice(0, 12);
    if (seen.has(hash)) continue;
    seen.add(hash);
    rows.push({
      table: 'bna_tasks',
      action: 'dry_run_insert_candidate',
      routing: 'internal_task_candidate',
      natural_key: `content_job:${job.id}:private_reparse_task:${hash}`,
      before: null,
      after: {
        source_content_job_id: job.id,
        canonical_task_key: `bna|class_drive_intake|content_job:${job.id}|private-reparse-task-${hash}`,
        task_text_hash: hash,
        source_window_ref: segment.source_window_ref,
        production_task_write_allowed: false,
        visibility: 'internal_agent_review',
      },
    });
  }
  return rows;
}

function progressCandidateFromSegment({ job, segment, mentions = [] } = {}) {
  if (!/\b(?:minute|minutes|min|percent|percentage|progress|completed|complete|inside|listening|listened|distracted|score)\b/i.test(segment.text)) return null;
  const matchedMentions = mentions.filter((mention) => mention.source_window_ref === segment.source_window_ref && mention.match_status === 'matched');
  const matchedRefs = [...new Set(matchedMentions.map((mention) => mention.matched_student_ref).filter(Boolean))];
  if (matchedRefs.length !== 1) {
    return {
      no_op: {
        job_id: job.id || null,
        source_window_ref: segment.source_window_ref,
        reason: matchedRefs.length ? 'progress signal mentions multiple students; needs review' : 'progress signal has no safe student match',
        raw_text_included: false,
      },
    };
  }
  const name = matchedMentions[0]._student_name_for_internal_match;
  const percentMatch = segment.text.match(/\b(\d{1,3})\s*(?:%|percent|percentage)\b/i);
  const minuteMatch = segment.text.match(/\b(\d{1,3})\s*(?:minutes?|mins?)\b/i);
  const update = {
    student_name: name,
    date: toIsoDate(job.class_date || job.created_at),
    goal_type: /\binside|following|text|sefer\b/i.test(segment.text) ? 'INSIDE' : 'LISTENING',
    source_window_ref: segment.source_window_ref,
  };
  if (percentMatch) update.progress_percent = Number(percentMatch[1]);
  if (minuteMatch) {
    const minutes = Number(minuteMatch[1]);
    update.goal_minutes = Math.max(10, minutes);
    if (update.goal_type === 'INSIDE') update.inside_engaged_minutes = minutes;
    else update.listening_minutes = minutes;
  }
  if (update.progress_percent === undefined && minuteMatch === null) {
    return {
      no_op: {
        job_id: job.id || null,
        source_window_ref: segment.source_window_ref,
        reason: 'progress cue has no deterministic minute or percent value',
        raw_text_included: false,
      },
    };
  }
  return { update };
}

function buildPrivateProgressPlan({ job, segments = [], mentions = [], students = [], torahEntries = [], groupGoalEntries = [] } = {}) {
  const rowPlan = [];
  const noOps = [];
  const seen = new Set();
  for (const segment of segments) {
    const result = progressCandidateFromSegment({ job, segment, mentions });
    if (!result) continue;
    if (result.no_op) {
      noOps.push(result.no_op);
      continue;
    }
    const key = sha256(`${result.update.student_name}|${result.update.date}|${result.update.progress_percent ?? ''}|${result.update.listening_minutes ?? result.update.inside_engaged_minutes ?? ''}`).slice(0, 16);
    if (seen.has(key)) continue;
    seen.add(key);
    const proposal = progressProposal({
      job,
      update: result.update,
      students,
      torahEntries,
      groupGoalEntries,
      sourceKind: 'private_transcript_dry_run',
    });
    if (proposal?.proposals) {
      for (const row of proposal.proposals) {
        row.source_window_ref = result.update.source_window_ref;
        row.routing = row.table === 'bna_accountability_events' ? 'progress_event' : 'score_progress';
        rowPlan.push(row);
      }
    }
    if (proposal?.exclusion) {
      noOps.push({
        job_id: job.id || null,
        source_window_ref: result.update.source_window_ref,
        reason: proposal.exclusion.reason || 'progress candidate excluded',
        match: proposal.exclusion.match || null,
        raw_text_included: false,
      });
    }
  }
  if (!rowPlan.length && !noOps.length) {
    noOps.push({
      job_id: job.id || null,
      reason: 'No deterministic score/progress signal was detected in the private transcript dry-run.',
      raw_text_included: false,
    });
  }
  return { rowPlan, noOps };
}

function privateNeedsParseReason(job = {}) {
  const structured = extractStructuredOutput(job);
  const hasTranscript = transcriptChars(job) > 0;
  if (!hasTranscript) return 'No private transcript text was available to the dry-run reader.';
  if (!structured.parser && !hasStructuredParse(job)) return 'Transcript exists, but parser request/output metadata is missing.';
  if (structured.parser === 'canonical-intake-parser' && !hasStructuredParse(job)) return 'Canonical parser metadata exists, but class/progress/question structured output is empty.';
  if (hasStructuredParse(job) && !(structured.class_notes.length || structured.daily_torah_updates.length || structured.group_goal_entries.length)) return 'Structured output exists, but class/progress lanes are incomplete.';
  return 'Digest/card audit marked Needs parse because canonical class/progress read-model evidence was incomplete.';
}

function redactInternalPrivateFields(row = {}) {
  const clone = JSON.parse(JSON.stringify(row));
  delete clone._question_text_for_internal_match;
  delete clone._student_name_for_internal_match;
  return clone;
}

function buildPrivateReparseCanonicalDryRun({
  jobs = [],
  students = [],
  accountabilityEvents = [],
  torahEntries = [],
  groupGoalEntries = [],
  exactJobIds = DEFAULT_PRIVATE_REPARSE_JOB_IDS,
  generatedAt = new Date().toISOString(),
} = {}) {
  const approvedIds = toArray(exactJobIds).map(Number).filter(Boolean);
  const approvedSet = new Set(approvedIds);
  const rows = [];
  const allStudentMentions = [];
  const allQuestionRoutes = [];
  const allClassFallbacks = [];
  const rowLevelChangePlan = [];
  const taskRows = [];
  const progressNoOps = [];
  const inspectedJobs = toArray(jobs)
    .filter((job) => approvedSet.has(Number(job.id)))
    .sort((a, b) => Number(a.id) - Number(b.id));
  const foundIds = new Set(inspectedJobs.map((job) => Number(job.id)));
  const missingJobIds = approvedIds.filter((id) => !foundIds.has(id));

  for (const job of inspectedJobs) {
    const segments = splitPrivateTranscriptSegments(job.transcript_text || job.transcript || '');
    const mentions = transcriptStudentMentions({ job, segments, students });
    const questionCandidates = privateQuestionCandidatesFromTranscript({ job, segments, mentions });
    const questionRouting = buildPrivateQuestionRouting({ job, questionCandidates, students, accountabilityEvents });
    const progressPlan = buildPrivateProgressPlan({ job, segments, mentions, students, torahEntries, groupGoalEntries });
    const jobTaskRows = taskCandidatesFromTranscript({ job, segments });

    allStudentMentions.push(...mentions.map(redactInternalPrivateFields));
    allQuestionRoutes.push(...questionRouting.candidateRoutes);
    allClassFallbacks.push(...questionRouting.classQuestionFallbacks);
    rowLevelChangePlan.push(...questionRouting.rowPlan, ...progressPlan.rowPlan, ...jobTaskRows);
    taskRows.push(...jobTaskRows);
    progressNoOps.push(...progressPlan.noOps);

    rows.push({
      job_id: Number(job.id),
      transcript_chars: transcriptChars(job),
      private_source_read: transcriptChars(job) > 0,
      raw_transcript_body_included: false,
      needs_parse_reason: privateNeedsParseReason(job),
      segment_count: segments.length,
      student_name_mentions: mentions.map(redactInternalPrivateFields),
      question_candidates: questionCandidates.map(redactInternalPrivateFields).map((candidate) => ({
        ...candidate,
        routing: allQuestionRoutes.find((route) => route.question_ref === candidate.question_ref)?.routing || 'blocked_review',
      })),
      question_routing: questionRouting.candidateRoutes,
      score_progress: {
        row_level_change_rows: progressPlan.rowPlan,
        no_op_reasons: progressPlan.noOps,
      },
      task_candidates: jobTaskRows,
    });
  }

  for (const missingId of missingJobIds) {
    rows.push({
      job_id: missingId,
      transcript_chars: 0,
      private_source_read: false,
      raw_transcript_body_included: false,
      needs_parse_reason: 'Approved job ID was not returned by the private app transcript source query.',
      segment_count: 0,
      student_name_mentions: [],
      question_candidates: [],
      question_routing: [],
      score_progress: {
        row_level_change_rows: [],
        no_op_reasons: [{ job_id: missingId, reason: 'No job row was available for score/progress dry-run.', raw_text_included: false }],
      },
      task_candidates: [],
    });
  }

  const questionRoutes = allQuestionRoutes;
  const plannedWrites = rowLevelChangePlan.filter((row) => !/^skip/.test(row.action));
  return {
    generated_at: generatedAt,
    mode: 'private_reparse_canonical_write_dry_run_no_writes',
    no_production_mutation: true,
    no_drive_write: true,
    no_ai_call: true,
    approved_job_ids: approvedIds,
    inspected_job_ids: inspectedJobs.map((job) => Number(job.id)),
    missing_job_ids: missingJobIds,
    raw_transcript_bodies_included: false,
    raw_drive_urls_or_ids_included: false,
    summary: {
      approved_jobs: approvedIds.length,
      inspected_jobs: inspectedJobs.length,
      missing_jobs: missingJobIds.length,
      private_transcript_sources_read: rows.filter((row) => row.private_source_read).length,
      student_name_mentions: allStudentMentions.length,
      question_candidates: questionRoutes.length,
      personal_question_candidates: questionRoutes.filter((row) => row.routing === 'personal_question').length,
      class_question_broadcast_candidates: questionRoutes.filter((row) => row.routing === 'class_question_broadcast').length,
      existing_skip_candidates: questionRoutes.filter((row) => row.routing === 'existing_skip').length,
      blocked_review_candidates: questionRoutes.filter((row) => row.routing === 'blocked_review').length,
      row_level_change_plan_rows: rowLevelChangePlan.length,
      planned_insert_or_update_rows: plannedWrites.length,
      task_candidate_rows: taskRows.length,
      score_progress_rows: rowLevelChangePlan.filter((row) => ['bna_torah_learning_entries', 'bna_group_goal_entries'].includes(row.table)).length,
      score_progress_no_op_rows: progressNoOps.length,
    },
    rows,
    student_name_mentions: allStudentMentions,
    question_routing: questionRoutes,
    class_question_fallbacks: allClassFallbacks,
    task_rows: taskRows,
    score_progress_no_ops: progressNoOps,
    row_level_change_plan: rowLevelChangePlan,
    expected_row_counts: plannedWrites.reduce((counts, row) => {
      counts[row.table] = (counts[row.table] || 0) + 1;
      return counts;
    }, {}),
    production_apply_allowed: false,
    blocker: 'This is a no-write private reparse/canonical-write dry-run only. Production apply remains blocked by DEC-20260626-101.',
  };
}

function renderPrivateReparseDryRunMarkdown(report = {}) {
  const rows = toArray(report.rows);
  return [
    '# Private Reparse / Canonical-Write Dry-run',
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `Mode: ${report.mode || 'private_reparse_canonical_write_dry_run_no_writes'}`,
    `Approved job IDs: ${toArray(report.approved_job_ids).join(', ')}`,
    `No production mutation: ${report.no_production_mutation !== false}`,
    `No Drive write: ${report.no_drive_write !== false}`,
    `No AI call: ${report.no_ai_call !== false}`,
    `Raw transcript bodies included: ${report.raw_transcript_bodies_included === true}`,
    `Raw Drive URLs/IDs included: ${report.raw_drive_urls_or_ids_included === true}`,
    '',
    '## Summary',
    '',
    ...Object.entries(report.summary || {}).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
    '',
    '## Why Each Job Was Needs Parse',
    '',
    '| Job | Transcript Chars | Private Source Read | Needs Parse Reason |',
    '| --- | ---: | --- | --- |',
    ...rows.map((row) => `| #${row.job_id} | ${row.transcript_chars || 0} | ${row.private_source_read ? 'yes' : 'no'} | ${String(row.needs_parse_reason || '').replace(/\|/g, '\\|')} |`),
    '',
    '## Question Routing',
    '',
    '| Job | Question Ref | Window | Routing | Match Status | Matched Student | Rows | Inserts | Existing Skips | Blocker |',
    '| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |',
    ...(toArray(report.question_routing).length ? toArray(report.question_routing).map((row) => `| #${row.job_id} | ${row.question_ref || ''} | ${row.source_window_ref || ''} | ${row.routing || ''} | ${row.match_status || ''} | ${row.matched_student_ref || ''} | ${row.row_count || 0} | ${row.insert_rows || 0} | ${row.skip_existing_rows || 0} | ${String(row.blocked_review_reason || '').replace(/\|/g, '\\|')} |`) : ['| - | - | - | - | - | - | 0 | 0 | 0 | none |']),
    '',
    '## Student-name Mentions',
    '',
    '| Job | Mention Ref | Window | Match Status | Matched Student | Best Score | Contenders |',
    '| --- | --- | --- | --- | --- | ---: | ---: |',
    ...(toArray(report.student_name_mentions).length ? toArray(report.student_name_mentions).map((row) => `| #${row.job_id} | ${row.mention_ref || ''} | ${row.source_window_ref || ''} | ${row.match_status || ''} | ${row.matched_student_ref || ''} | ${row.best_score || 0} | ${toArray(row.contenders).length} |`) : ['| - | - | - | - | - | 0 | 0 |']),
    '',
    '## Score / Progress',
    '',
    '| Job | Status | Detail | Window |',
    '| --- | --- | --- | --- |',
    ...(toArray(report.row_level_change_plan).filter((row) => ['bna_torah_learning_entries', 'bna_group_goal_entries'].includes(row.table)).map((row) => `| #${row.after?.source_content_job_id || ''} | ${row.action || ''} | ${row.table || ''}:${row.natural_key || ''} | ${row.source_window_ref || ''} |`)),
    ...(toArray(report.score_progress_no_ops).map((row) => `| #${row.job_id || ''} | no_op | ${String(row.reason || '').replace(/\|/g, '\\|')} | ${row.source_window_ref || ''} |`)),
    '',
    '## Task Candidates',
    '',
    '| Job | Routing | Natural Key | Window |',
    '| --- | --- | --- | --- |',
    ...(toArray(report.task_rows).length ? toArray(report.task_rows).map((row) => `| #${row.after?.source_content_job_id || ''} | ${row.routing || ''} | ${row.natural_key || ''} | ${row.after?.source_window_ref || ''} |`) : ['| - | - | - | - |']),
    '',
    '## Row-level Plan',
    '',
    '| Table | Action | Routing | Natural Key |',
    '| --- | --- | --- | --- |',
    ...(toArray(report.row_level_change_plan).length ? toArray(report.row_level_change_plan).map((row) => `| ${row.table || ''} | ${row.action || ''} | ${row.routing || ''} | ${row.natural_key || ''} |`) : ['| - | - | - | - |']),
    '',
    `Remaining blocker: ${report.blocker || 'Production apply remains blocked.'}`,
    '',
  ].join('\n');
}

function renderProductionApplyPreflightMarkdown(report = {}) {
  return [
    '# Production Apply Preflight',
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `Mode: ${report.mode || 'production_apply_preflight_no_writes'}`,
    `Branch: ${report.branch || ''}`,
    `PR: ${report.pull_request || ''}`,
    `Issue: ${report.issue || ''}`,
    `No production mutation: ${report.no_production_mutation !== false}`,
    `Production apply executed: ${report.production_apply_executed === true}`,
    `Production apply command may be run now: ${report.production_apply_command_may_be_run_now === true}`,
    `Final owner approval required: ${report.final_owner_approval_required !== false}`,
    `Required gate phrase: ${report.required_gate_phrase || APPLY_GATE_PHRASE}`,
    `Approved job IDs: ${toArray(report.approved_job_ids).join(', ')}`,
    `Approved action list: ${toArray(report.approved_actions).join(', ')}`,
    '',
    '## Expected Row Counts',
    '',
    ...Object.entries(report.expected_row_counts || {}).map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`),
    '',
    '## Refusal Checks',
    '',
    '| Check | Passed | Severity | Detail |',
    '| --- | --- | --- | --- |',
    ...toArray(report.refusal_checks).map((check) => `| ${check.id || ''} | ${check.passed ? 'yes' : 'no'} | ${check.severity || ''} | ${String(check.detail || '').replace(/\|/g, '/')} |`),
    '',
    '## Batch Commands - Do Not Run Until Final Approval',
    '',
    '| Batch | Expected Rows | Command |',
    '| --- | ---: | --- |',
    ...toArray(report.final_apply_commands).map((row) => `| ${row.batch || ''} | ${row.expected_rows || 0} | \`${String(row.command || '').replace(/\|/g, '/')} \` |`),
    '',
    '## Remaining Blocker',
    '',
    redactSensitiveText(report.remaining_blocker || ''),
    '',
  ].join('\n');
}

function renderProductionApplySnapshotPlanMarkdown(report = {}) {
  const plan = report.snapshot_plan || {};
  return [
    '# Production Apply Snapshot Plan',
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `Required before apply: ${plan.required_before_apply !== false}`,
    `Snapshot path: ${plan.path || ''}`,
    `Snapshot path ref: ${plan.path_ref?.redacted || ''}`,
    `Commit snapshot to Git: ${plan.commit_to_git === true}`,
    `Contains private data: ${plan.contains_private_data === true}`,
    '',
    '## Required Tables',
    '',
    ...toArray(plan.required_tables).map((table) => `- ${table}`),
    '',
    '## Repo Proof To Record',
    '',
    ...toArray(plan.proof_to_record_in_repo).map((item) => `- ${item}`),
    '',
    `Minimum rows to capture: ${plan.minimum_rows_to_capture || 0}`,
    '',
  ].join('\n');
}

function renderProductionApplyRollbackPlanMarkdown(report = {}) {
  const plan = report.rollback_plan || {};
  return [
    '# Production Apply Rollback Plan',
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `Required before apply: ${plan.required_before_apply !== false}`,
    `Rollback path: ${plan.path || ''}`,
    `Rollback path ref: ${plan.path_ref?.redacted || ''}`,
    `Commit rollback artifact to Git: ${plan.commit_to_git === true}`,
    `Contains private data: ${plan.contains_private_data === true}`,
    '',
    '## Strategy',
    '',
    ...toArray(plan.strategy).map((item) => `- ${item}`),
    '',
  ].join('\n');
}

function renderProductionApplyBatchPlanMarkdown(report = {}) {
  return [
    '# Production Apply Batch Plan',
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `No production mutation: ${report.no_production_mutation !== false}`,
    `Final owner approval required: ${report.final_owner_approval_required !== false}`,
    '',
    '| Batch | Status | Candidates | Row-Level Apply Rows | Target Tables | Note |',
    '| --- | --- | ---: | ---: | --- | --- |',
    ...toArray(report.batch_plan).map((row) => [
      row.batch,
      row.status,
      row.candidate_count || 0,
      row.row_level_apply_rows || 0,
      JSON.stringify(row.target_tables || {}),
      row.note || '',
    ].map((cell) => String(cell ?? '').replace(/\|/g, '/')).join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Commands - Do Not Run Until Final Approval',
    '',
    ...toArray(report.final_apply_commands).map((row) => `- ${row.batch}: \`${row.command}\``),
    '',
  ].join('\n');
}

function renderProductionApplyReadbackPlanMarkdown(report = {}) {
  const plan = report.readback_plan || {};
  return [
    '# Production Apply Readback Plan',
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `Required after each batch: ${plan.required_after_each_batch !== false}`,
    '',
    '## Commands',
    '',
    ...toArray(plan.commands).map((command) => `- \`${command}\``),
    '',
    '## Checks',
    '',
    ...toArray(plan.checks).map((check) => `- ${check}`),
    '',
  ].join('\n');
}

function renderBacklogCatchupCensusMarkdown(census = {}) {
  const rows = toArray(census.rows);
  return [
    '# Backlog Catch-up Census',
    '',
    `Generated: ${census.generated_at || new Date().toISOString()}`,
    `Mode: ${census.mode || 'repo_safe_no_write_catchup_census'}`,
    `No production mutation: ${census.no_production_mutation !== false}`,
    `Raw transcript bodies included: ${census.raw_transcript_bodies_included === true}`,
    '',
    '## Summary',
    '',
    ...Object.entries(census.summary || {}).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
    '',
    '## Job Rows',
    '',
    '| Job | Focus | Digest | Private Transcript | Parse | Questions | Class Inserts | Personal Inserts | Score/Progress | Tasks | Research Card | Next Action |',
    '| ---: | --- | --- | --- | --- | ---: | ---: | ---: | --- | ---: | --- | --- |',
    ...rows.map((row) => [
      row.job_id,
      row.focus_job ? 'yes' : 'no',
      row.digest_status,
      row.has_private_raw_transcript ? `${row.transcript_chars} chars` : 'no',
      row.parse_status?.label || '',
      row.question_candidates?.total || 0,
      row.class_question_candidates?.broadcast_insert_rows || 0,
      row.matched_personal_question_candidates?.insert_rows || 0,
      row.score_progress_candidate_status?.status || '',
      row.task_action_candidates?.candidate_ids?.length || row.task_action_candidates?.manifest_count || 0,
      row.research_content_candidates?.content_card_ready ? 'ready' : 'needs repair',
      redactSensitiveText(row.next_action || ''),
    ].map((cell) => String(cell).replace(/\|/g, '/')).join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Remaining Blockers',
    '',
    ...(toArray(census.remaining_blockers).length ? census.remaining_blockers.map((item) => `- ${redactSensitiveText(item)}`) : ['- None']),
    '',
    '## Guardrails',
    '',
    '- No Drive write.',
    '- No production database mutation.',
    '- No class backfill.',
    '- No raw transcript body export.',
    '- No apply command executed.',
    '',
  ].join('\n');
}

function renderScoreProgressCatchupMarkdown(plan = {}) {
  return [
    '# Score/Progress Catch-up Plan',
    '',
    `Generated: ${plan.generated_at || new Date().toISOString()}`,
    `Mode: ${plan.mode || 'no_write_score_progress_catchup_plan'}`,
    `No production mutation: ${plan.no_production_mutation !== false}`,
    `Production apply allowed: ${plan.production_apply_allowed === true}`,
    '',
    '## Summary',
    '',
    ...Object.entries(plan.summary || {}).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
    '',
    '## Job No-op/Plan Rows',
    '',
    '| Job | Parse | Row-Level Changes | Status | No-op Reason | Next Action |',
    '| ---: | --- | ---: | --- | --- | --- |',
    ...toArray(plan.rows).map((row) => [
      row.job_id,
      row.parse_status,
      row.row_level_change_count ?? 0,
      row.status,
      row.no_op_reason,
      row.exact_next_action,
    ].map((cell) => String(cell ?? '').replace(/\|/g, '/')).join(' | ')).map((line) => `| ${line} |`),
    '',
    `Blocker: ${redactSensitiveText(plan.blocker || '')}`,
    '',
  ].join('\n');
}

function renderTaskActionCatchupMarkdown(plan = {}) {
  return [
    '# Task/Action Catch-up Plan',
    '',
    `Generated: ${plan.generated_at || new Date().toISOString()}`,
    `Mode: ${plan.mode || 'no_write_task_action_catchup_plan'}`,
    `No production mutation: ${plan.no_production_mutation !== false}`,
    `Production task creation allowed: ${plan.production_task_creation_allowed === true}`,
    '',
    '## Summary',
    '',
    ...Object.entries(plan.summary || {}).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Candidate Rows',
    '',
    '| Job | Candidate | Type | Dedupe | Action | Next Action |',
    '| ---: | --- | --- | --- | --- | --- |',
    ...toArray(plan.rows).map((row) => [
      row.job_id,
      row.candidate_id,
      row.candidate_type,
      row.dedupe_key,
      row.action,
      row.exact_next_action,
    ].map((cell) => String(cell ?? '').replace(/\|/g, '/')).join(' | ')).map((line) => `| ${line} |`),
    '',
    `Dedupe rule: ${redactSensitiveText(plan.dedupe_rule || '')}`,
    '',
  ].join('\n');
}

function renderResearchContentCatchupMarkdown(plan = {}) {
  return [
    '# Research/Content Catch-up Plan',
    '',
    `Generated: ${plan.generated_at || new Date().toISOString()}`,
    `Mode: ${plan.mode || 'repo_safe_research_content_catchup_plan'}`,
    `No production mutation: ${plan.no_production_mutation !== false}`,
    `Raw transcript bodies included: ${plan.raw_transcript_bodies_included === true}`,
    '',
    '## Summary',
    '',
    ...Object.entries(plan.summary || {}).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Content Rows',
    '',
    '| Job | Card | Topic | Ideas | Categories | Next Action |',
    '| ---: | --- | --- | ---: | --- | --- |',
    ...toArray(plan.rows).map((row) => [
      row.job_id,
      row.content_card_ready ? 'ready' : 'needs repair',
      row.topic_status,
      row.content_idea_candidate_ids.length,
      toArray(row.categories).join(', '),
      row.next_action,
    ].map((cell) => String(cell ?? '').replace(/\|/g, '/')).join(' | ')).map((line) => `| ${line} |`),
    '',
  ].join('\n');
}

function renderApplyLaneDesignMarkdown(design = {}) {
  return [
    '# Apply Lane Design',
    '',
    `Generated: ${design.generated_at || new Date().toISOString()}`,
    `Mode: ${design.mode || 'apply_lane_design_only_not_executed'}`,
    `Current apply lane status: ${design.current_apply_lane_status || ''}`,
    `Production apply executed: ${design.production_apply_executed === true}`,
    `Dry-run default: ${design.dry_run_default !== false}`,
    `Required gate phrase: ${design.required_owner_gate_phrase || APPLY_GATE_PHRASE}`,
    '',
    '## Commands',
    '',
    `Dry-run command: \`${design.dry_run_command || ''}\``,
    `Apply command template: \`${design.apply_command_template || ''}\``,
    '',
    '## Required Controls',
    '',
    ...toArray(design.required_controls).map((item) => `- ${item}`),
    '',
    '## Refusal Conditions',
    '',
    ...toArray(design.refusal_conditions).map((item) => `- ${item}`),
    '',
    '## Success Planning Path',
    '',
    '```json',
    JSON.stringify(design.success_planning_path || {}, null, 2),
    '```',
    '',
    redactSensitiveText(design.implementation_note || ''),
    '',
  ].join('\n');
}

function renderPipelineCensusMarkdown(census = {}) {
  const rows = toArray(census.pipeline_rows || census.rows);
  const causes = census.suspected_causes || {};
  return [
    '# Class/Drive Intake Pipeline Census',
    '',
    `Generated: ${census.generated_at || new Date().toISOString()}`,
    `No production mutation: ${census.no_production_mutation !== false}`,
    '',
    '## Summary',
    '',
    `- Inspected rows: ${rows.length}`,
    `- Content jobs: ${rows.filter((row) => row.kind === 'content_job').length}`,
    `- Drive orphans: ${rows.filter((row) => row.kind === 'drive_orphan').length}`,
    `- Missing canonical writes: ${rows.filter((row) => row.stages?.canonical_write_status?.status === 'MISSING').length}`,
    `- Student ambiguity/review rows: ${rows.filter((row) => row.stages?.ambiguity_review?.status === 'NEEDS_REVIEW').length}`,
    '',
    '## Suspected Causes',
    '',
    '| Cause | Status | Evidence |',
    '| --- | --- | --- |',
    ...Object.entries(causes).map(([key, value]) => `| ${key} | ${value.status || 'UNKNOWN'} | ${redactSensitiveText(value.evidence || '')} |`),
    '',
    '## Job Rows',
    '',
    '| Kind | Job | Status | Transcript | Parser | Canonical Writes | Retry/Dedup |',
    '| --- | ---: | --- | ---: | --- | --- | --- |',
    ...rows.map((row) => `| ${row.kind} | ${row.job_id ?? ''} | ${row.status || ''}/${row.drive_stage || ''} | ${row.transcript_chars || 0} | ${row.parser || ''} | ${row.stages?.canonical_write_status?.status || ''} | ${row.stages?.retry_dedup_status?.status || ''} |`),
    '',
  ].join('\n');
}

function renderBackfillMarkdown(plan = {}) {
  return [
    '# Guarded Class Backfill Dry Run',
    '',
    `Generated: ${plan.generated_at || new Date().toISOString()}`,
    `Mode: ${plan.mode || 'dry_run_no_writes'}`,
    `No production mutation: ${plan.no_production_mutation !== false}`,
    `Safe to apply: ${Boolean(plan.safe_to_apply)}`,
    `Required gate phrase: ${plan.required_gate_phrase || APPLY_GATE_PHRASE}`,
    '',
    '## Candidate Jobs',
    '',
    '| Job | Required Range | Fingerprint |',
    '| ---: | --- | --- |',
    ...toArray(plan.candidate_jobs).map((job) => `| ${job.job_id ?? ''} | ${job.in_required_repair_range ? 'yes' : 'no'} | ${(job.fingerprint_sha256 || '').slice(0, 16)} |`),
    '',
    '## Exclusions',
    '',
    ...(toArray(plan.excluded_jobs).length ? toArray(plan.excluded_jobs).map((item) => `- Job ${item.job_id ?? ''}: ${redactSensitiveText(item.reason || '')}`) : ['- None']),
    '',
    '## Blocking Ambiguities',
    '',
    ...(toArray(plan.blocking_ambiguities).length ? toArray(plan.blocking_ambiguities).map((item) => `- Job ${item.job_id ?? ''}: ${redactSensitiveText(item.reason || '')} (${item.student_name_hash || item.matched_student_ref || 'redacted-student'})`) : ['- None']),
    '',
    '## Class Question Fallbacks',
    '',
    ...(toArray(plan.class_question_fallbacks).length ? toArray(plan.class_question_fallbacks).map((item) => `- Job ${item.job_id ?? ''}: ${redactSensitiveText(item.reason || '')}; routed to ${item.target_student_count || 0} active students as class question (${item.question_text_hash || 'redacted-question'})`) : ['- None']),
    '',
    '## Expected Row Counts',
    '',
    '```json',
    JSON.stringify(plan.expected_row_counts || {}, null, 2),
    '```',
    '',
    '## Row-Level Change Plan',
    '',
    '| Table | Action | Natural Key |',
    '| --- | --- | --- |',
    ...toArray(plan.row_level_change_plan).map((row) => `| ${row.table} | ${row.action} | ${row.natural_key} |`),
    '',
    '## Transaction And Rollback',
    '',
    ...toArray(plan.transaction_boundaries).map((item) => `- ${item}`),
    ...toArray(plan.rollback_strategy).map((item) => `- ${item}`),
    '',
    `Apply command: \`${plan.apply_command || ''}\``,
    `Rollback command: \`${plan.rollback_command || ''}\``,
    '',
  ].join('\n');
}

module.exports = {
  APPLY_GATE_PHRASE,
  DEFAULT_CATCHUP_FOCUS_JOB_IDS,
  DEFAULT_PRIVATE_REPARSE_JOB_IDS,
  DEFAULT_PRODUCTION_APPLY_ACTIONS,
  DEFAULT_REPAIR_JOB_RANGE,
  PIPELINE_STAGES,
  buildApplyLaneDesign,
  buildBacklogCatchupCensus,
  buildGuardedBackfillDryRun,
  buildPipelineTraceRows,
  buildProductionApplyPreflight,
  buildPrivateReparseCanonicalDryRun,
  buildResearchContentCatchupPlan,
  buildScoreProgressCatchupPlan,
  buildTaskActionCatchupPlan,
  duplicateGroupsForJobs,
  evaluateSuspectedCauses,
  extractStructuredOutput,
  jobSourceFingerprint,
  parseJsonMaybe,
  redactSensitiveText,
  redactedRef,
  renderApplyLaneDesignMarkdown,
  renderBackfillMarkdown,
  renderBacklogCatchupCensusMarkdown,
  renderPipelineCensusMarkdown,
  renderProductionApplyBatchPlanMarkdown,
  renderProductionApplyPreflightMarkdown,
  renderProductionApplyReadbackPlanMarkdown,
  renderProductionApplyRollbackPlanMarkdown,
  renderProductionApplySnapshotPlanMarkdown,
  renderPrivateReparseDryRunMarkdown,
  renderResearchContentCatchupMarkdown,
  renderScoreProgressCatchupMarkdown,
  renderTaskActionCatchupMarkdown,
  sha256,
  transcriptChars,
};
