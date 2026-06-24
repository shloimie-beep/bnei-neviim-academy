const crypto = require('crypto');

const {
  findStudentForParsedName,
  normalizeNameForMatch,
  scoreStudentParsedNameMatch,
} = require('./student-match');
const { normalizeParsedTorahEngagement } = require('./torah-learning');

const APPLY_GATE_PHRASE = 'APPLY_GUARDED_CLASS_BACKFILL';
const DEFAULT_REPAIR_JOB_RANGE = [64, 74];
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
    const questionSignals = structured.class_notes.reduce((sum, note) => sum + toArray(note.student_questions).length, 0);
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
  for (const note of structured.class_notes) {
    for (const rawQuestion of toArray(note.student_questions)) {
      const question = normalizeStudentQuestion(rawQuestion);
      if (!question) continue;
      const match = question.student_name ? matchDetailsForName(question.student_name, students) : null;
      if (!match?.matched_student_id || match.ambiguous) {
        exclusions.push({
          reason: match?.ambiguous ? 'ambiguous question student match' : 'question has no student match',
          student_name_hash: sha256(normalizeNameForMatch(question.student_name) || question.student_name || '').slice(0, 12),
          question_text_hash: sha256(question.question_text).slice(0, 12),
          match,
        });
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
        },
      });
    }
  }
  return { proposals, exclusions };
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
  }
  const plannedWrites = proposals.filter((row) => !/^skip/.test(row.action));
  const expectedRowCounts = plannedWrites.reduce((counts, row) => {
    counts[row.table] = (counts[row.table] || 0) + 1;
    return counts;
  }, {});
  const blockingAmbiguities = ambiguityExclusions.filter((item) => /ambiguous|no student match|all-active/.test(item.reason || ''));
  const safeToApply = plannedWrites.length > 0 && blockingAmbiguities.length === 0;
  return {
    generated_at: generatedAt,
    mode: 'dry_run_no_writes',
    no_production_mutation: true,
    candidate_jobs: candidateJobs,
    approved_candidate_jobs: safeToApply ? candidateJobs.map((job) => job.job_id).filter(Boolean) : [],
    excluded_jobs: excludedJobs,
    row_level_change_plan: proposals,
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
  DEFAULT_REPAIR_JOB_RANGE,
  PIPELINE_STAGES,
  buildGuardedBackfillDryRun,
  buildPipelineTraceRows,
  duplicateGroupsForJobs,
  evaluateSuspectedCauses,
  extractStructuredOutput,
  jobSourceFingerprint,
  parseJsonMaybe,
  redactSensitiveText,
  redactedRef,
  renderBackfillMarkdown,
  renderPipelineCensusMarkdown,
  sha256,
  transcriptChars,
};
