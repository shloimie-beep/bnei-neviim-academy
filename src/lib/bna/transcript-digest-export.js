'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_AUDIT_DIR = path.join(
  'ops',
  'class-drive-intake',
  '2026-06-26-two-week-class-intake-audit'
);
const DEFAULT_OUTPUT_DIR = path.join('content-memory', 'transcript-digests');

const LANES = [
  'class_session',
  'class_notes',
  'student_question',
  'student_answer_or_discussion',
  'student_progress',
  'student_score',
  'accountability_event',
  'profile_note',
  'parent_update_candidate',
  'task',
  'decision',
  'open_question',
  'content_idea',
  'article_angle',
  'marketing_clip',
  'source_sheet_candidate',
  'private_meeting',
  'private_student_detail',
  'operations_note',
  'billing/admin',
  'support_ticket',
  'integration_issue',
  'drive_workflow_issue',
  'parser_error',
  'unknown_needs_review',
];

const LANE_PATTERNS = [
  ['class_session', /\b(class|lesson|shiur|mishnah|mishna|gemara|torah|learning session|recording)\b/i],
  ['class_notes', /\b(note|notes|topic|subject|discussed|source|summary|highlight)\b/i],
  ['student_question', /\?|(\b(student|child|kid|boy)\b.{0,40}\b(asked|asks|question)\b)|\bquestion\b/i],
  ['student_answer_or_discussion', /\b(answer|answered|discussion|responded|rebbe said|teacher said)\b/i],
  ['student_progress', /\b(progress|completed|minutes|learned|reviewed|finished|goal)\b/i],
  ['student_score', /\b(score|grade|percent|percentage|points|mark)\b/i],
  ['accountability_event', /\b(accountability|checkoff|check off|daily|streak|commitment|follow[- ]?up)\b/i],
  ['profile_note', /\b(profile|learning style|needs help|strength|weakness|observation)\b/i],
  ['parent_update_candidate', /\b(parent|parents|family|home update|parent-facing)\b/i],
  ['task', /\b(task|todo|to do|fix|build|implement|repair|follow up|next action|need to|should)\b/i],
  ['decision', /\b(decide|decision|approve|approval|choose|option|authorize)\b/i],
  ['open_question', /\?|(\bunclear\b|\bquestion for\b|\bneeds answer\b)/i],
  ['content_idea', /\b(content idea|post|newsletter|article|blog|draft|social)\b/i],
  ['article_angle', /\b(angle|hook|essay|article|source sheet|claim)\b/i],
  ['marketing_clip', /\b(clip|short|reel|video moment|marketing|facebook|youtube|linkedin)\b/i],
  ['source_sheet_candidate', /\b(source sheet|mekor|mekoros|pasuk|rashi|worksheet|sugya)\b/i],
  ['private_meeting', /\b(private meeting|meeting with|confidential|sensitive|not public)\b/i],
  ['private_student_detail', /\b(private student|behavior|medical|family issue|sensitive student|discipline)\b/i],
  ['operations_note', /\b(operations|ops|dashboard|system|workflow|queue)\b/i],
  ['billing/admin', /\b(billing|payment|invoice|refund|charge|tuition|admin)\b/i],
  ['support_ticket', /\b(ticket|support|problem|issue|bug|broken)\b/i],
  ['integration_issue', /\b(integration|api|oauth|credential|drive sync|worker|provider)\b/i],
  ['drive_workflow_issue', /\b(drive|google drive|file|folder|transcript doc|recording title|export gap)\b/i],
  ['parser_error', /\b(parser error|parse gap|missing parser|not parsed|failed parse|no parser metadata)\b/i],
];

function toArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function compactWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${String(text || '').replace(/\s+$/, '')}\n`);
}

function stageStatus(trace = {}, stageName) {
  return trace.stages?.[stageName]?.status || 'UNKNOWN';
}

function stageEvidence(trace = {}, stageName) {
  return trace.stages?.[stageName]?.evidence || '';
}

function zeroJobId(jobId) {
  return String(jobId || 'unknown').padStart(6, '0');
}

function generatedTitleForJob({ trace = {}, gap = {} } = {}) {
  const jobId = trace.job_id || gap.job_id;
  const date = gap.class_date || '';
  const parser = trace.parser ? 'parsed' : 'needs parser review';
  if (date && jobId) return `Class Recording ${date} - Job ${String(jobId).padStart(3, '0')} (${parser})`;
  if (jobId) return `Class Recording Job ${String(jobId).padStart(3, '0')} (${parser})`;
  return 'Untitled Class Recording Digest';
}

function transcriptHashStatus(trace = {}) {
  return {
    available_in_repo: false,
    status: trace.transcript_chars
      ? 'private_app_or_drive_raw_body_required_to_compute'
      : 'no_transcript_text_reported',
    hash: null,
  };
}

function sourceRecordingRef(trace = {}) {
  const direct = trace.source_recording_ref || {};
  const discovered = trace.stages?.source_discovered?.source_ref?.drive_file || {};
  const hash = direct.hash || direct.sha256 || discovered.hash || discovered.sha256 || null;
  return {
    redacted: direct.redacted || direct.id_ref || discovered.redacted || discovered.id_ref || null,
    hash: hash ? String(hash).slice(0, 16) : null,
  };
}

function privateReviewSignals({ trace = {}, gap = {}, sections = [], questions = [] } = {}) {
  const transcriptChars = Number(trace.transcript_chars || gap.transcript_chars || 0);
  const privateSection = sections.some((section) => section.privacy !== 'repo_safe_digest');
  const unmatchedQuestions = questions.some((row) => row.match_status !== 'matched');
  const visibilityReview = stageStatus(trace, 'parent_student_visibility') === 'NEEDS_REVIEW';
  const transcriptBackedClassRecording = transcriptChars > 0 &&
    (/^content_job:/i.test(String(trace.job_ref || gap.job_ref || '')) || trace.kind === 'content_job' || Boolean(trace.job_id || gap.job_id));
  return {
    privateSection,
    unmatchedQuestions,
    visibilityReview,
    transcriptBackedClassRecording,
  };
}

function privateReviewRequired(context = {}) {
  const signals = privateReviewSignals(context);
  return Object.values(signals).some(Boolean);
}

function privateReviewReason(context = {}) {
  const signals = privateReviewSignals(context);
  if (signals.privateSection) return 'Private section classification needs review.';
  if (signals.unmatchedQuestions) return 'Student question matching needs review before any student write.';
  if (signals.visibilityReview) return 'Parent/student visibility needs review before parent-facing output.';
  if (signals.transcriptBackedClassRecording) {
    return 'Class recording transcripts stay private by default; use only sanitized digest metadata in GitHub.';
  }
  return 'No private review flag from sanitized audit metadata.';
}

function classifySection(section = {}, context = {}) {
  const rawText = compactWhitespace([
    section.title,
    section.summary,
    section.reason,
    section.text,
    context.extra,
  ].filter(Boolean).join(' '));
  const lanes = new Set();
  const evidenceTerms = [];
  for (const [lane, pattern] of LANE_PATTERNS) {
    if (pattern.test(rawText)) {
      lanes.add(lane);
      evidenceTerms.push(lane);
    }
  }
  if (!lanes.size) lanes.add('unknown_needs_review');
  const privateLanes = ['private_meeting', 'private_student_detail', 'billing/admin'];
  const privacy = [...lanes].some((lane) => privateLanes.includes(lane))
    ? 'private_review_required'
    : 'repo_safe_digest';
  return {
    section_id: section.section_id || `section:${sha256(rawText || JSON.stringify(section)).slice(0, 12)}`,
    title: compactWhitespace(section.title || 'Untitled section'),
    lanes: [...lanes].filter((lane) => LANES.includes(lane)).sort(),
    privacy,
    confidence: lanes.has('unknown_needs_review') ? 0.35 : 0.74,
    evidence_terms: [...new Set(evidenceTerms)].sort(),
    summary_hash: sha256(rawText).slice(0, 16),
    raw_text_included: false,
  };
}

function splitTranscriptIntoSections(text = '') {
  return String(text || '')
    .split(/\n{2,}|(?:^|\n)\s*(?:Section|Topic|Part)\s+\d+[:.-]/i)
    .map(compactWhitespace)
    .filter(Boolean)
    .map((sectionText, index) => ({
      section_id: `local-section:${String(index + 1).padStart(2, '0')}`,
      title: `Transcript section ${index + 1}`,
      text: sectionText,
    }));
}

function classifyTranscriptSections(text = '') {
  return splitTranscriptIntoSections(text).map((section) => classifySection(section));
}

function questionsForJob(questionRows = [], jobId) {
  return toArray(questionRows).filter((row) => Number(row.job_id) === Number(jobId));
}

function repairsForJob(repairPlan = {}, jobId) {
  const source = `content_job:${jobId}`;
  return toArray(repairPlan.dry_run_repair_candidates).filter((row) => row.source_ref === source);
}

function buildMetadataSections({ trace = {}, gap = {}, questions = [], repairs = [] } = {}) {
  const sections = [];
  sections.push(classifySection({
    section_id: `job-${trace.job_id || gap.job_id}-source`,
    title: 'Source discovery and transcript status',
    summary: [
      'Drive recording source discovered.',
      `${trace.transcript_chars || gap.transcript_chars || 0} transcript characters reported.`,
      gap.status === 'missing_export' ? 'GitHub transcript export gap present.' : 'No GitHub export gap reported.',
      stageStatus(trace, 'intake_record') === 'MISSING' ? 'Raw intake record is missing.' : 'Raw intake record linked.',
    ].join(' '),
  }));
  sections.push(classifySection({
    section_id: `job-${trace.job_id || gap.job_id}-parser`,
    title: 'Parser and class routing status',
    summary: [
      trace.parser ? `Parser ${trace.parser} reported.` : 'Missing parser metadata.',
      stageStatus(trace, 'class_session_match') === 'CONFIRMED' ? 'Class session linkage confirmed.' : 'Class session linkage not confirmed.',
      stageStatus(trace, 'profile_note_proposal') === 'CONFIRMED' ? 'Class note/profile-note material exists.' : 'Class note/profile-note material not confirmed.',
    ].join(' '),
  }));
  if (questions.length) {
    sections.push(classifySection({
      section_id: `job-${trace.job_id || gap.job_id}-questions`,
      title: 'Student question candidates',
      summary: `${questions.length} student question candidate(s) exist; ${questions.filter((row) => row.match_status !== 'matched').length} need matching/review.`,
    }));
  }
  if (repairs.length) {
    sections.push(classifySection({
      section_id: `job-${trace.job_id || gap.job_id}-repairs`,
      title: 'Dry-run repair candidates',
      summary: `${repairs.length} repair candidate(s) require dry-run review before production mutation.`,
    }));
  }
  return sections;
}

function categoryBreakdown(sections = []) {
  const counts = {};
  for (const section of sections) {
    for (const lane of section.lanes || []) counts[lane] = (counts[lane] || 0) + 1;
  }
  return Object.keys(counts).sort().map((lane) => ({ lane, section_count: counts[lane] }));
}

function buildTaskCandidates({ trace = {}, gap = {}, repairs = [] } = {}) {
  const candidates = [];
  if (gap.status === 'missing_export') {
    candidates.push({
      candidate_id: `TASK-CANDIDATE-${zeroJobId(gap.job_id || trace.job_id)}-DIGEST`,
      title: `Create privacy-safe digest for content job #${gap.job_id || trace.job_id}`,
      owner: 'Codex/agent',
      category: 'drive_workflow_issue',
      priority: 'high',
      depends_on: ['DEC-20260626-101'],
      related_source: `content_job:${gap.job_id || trace.job_id}`,
      notes: 'Candidate only; do not create live production task without active-run authorization.',
      privacy_classification: 'repo_safe_digest',
      confidence: 0.88,
    });
  }
  for (const [index, repair] of repairs.entries()) {
    candidates.push({
      candidate_id: `TASK-CANDIDATE-${zeroJobId(trace.job_id)}-REPAIR-${String(index + 1).padStart(2, '0')}`,
      title: `Review dry-run ${repair.action || 'repair'} for content job #${trace.job_id}`,
      owner: 'Codex/agent',
      category: repair.target || 'parser_repair',
      priority: 'medium',
      depends_on: ['DEC-20260626-101'],
      related_source: repair.source_ref || `content_job:${trace.job_id}`,
      notes: repair.reason || 'Dry-run repair candidate.',
      privacy_classification: 'repo_safe_digest',
      confidence: 0.72,
    });
  }
  return candidates;
}

function buildQuestionCandidates(questionRows = []) {
  const seen = new Set();
  const deduped = [];
  for (const row of toArray(questionRows)) {
    const key = row.question_ref || row.question_text_hash || JSON.stringify(row);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return deduped.map((row, index) => ({
    candidate_id: `QUESTION-CANDIDATE-${zeroJobId(row.job_id)}-${String(index + 1).padStart(2, '0')}`,
    question_ref: row.question_ref,
    question_text_hash: row.question_text_hash,
    recording_ref: row.job_ref,
    section_ref: row.source_kind || 'student_question',
    student_matching_status: {
      matched_student_ref: row.match_status === 'matched' ? row.matched_student_ref || null : null,
      confidence: row.confidence || 0,
      match_status: row.match_status || 'unknown',
      alias_evidence_summary: row.student_name_hash ? `student_name_hash:${row.student_name_hash}` : 'no student label',
      ambiguity_reason: row.match_status === 'matched' ? '' : 'Student identity needs review before any student write.',
      next_action: row.match_status === 'matched' ? 'Learning review before publication.' : 'Human student-match review.',
    },
    question_kind: row.newsletter_ready === 'blocked_unmatched_student'
      ? 'private_student_support'
      : 'classroom_question',
    needs_rabbi_review: true,
    raw_text_included: false,
  }));
}

function buildParseGaps(trace = {}, gap = {}) {
  const rows = [];
  for (const [stageName, stage] of Object.entries(trace.stages || {})) {
    if (['MISSING', 'NEEDS_REVIEW'].includes(stage.status)) {
      rows.push({
        stage: stageName,
        status: stage.status,
        evidence: stage.evidence || '',
        safe_next_action: stageName === 'intake_record'
          ? 'Link or create raw intake provenance without committing raw transcript bodies.'
          : 'Review parser/route evidence in private app or Drive before any production write.',
      });
    }
  }
  if (gap.status === 'missing_export') {
    rows.push({
      stage: 'repo_digest_export',
      status: 'MISSING',
      evidence: gap.expected_file_hint || '',
      safe_next_action: 'Export privacy-safe digest only; do not run raw transcript exporter by default.',
    });
  }
  return rows.sort((a, b) => a.stage.localeCompare(b.stage));
}

function buildDigestForJob({ trace = {}, gap = {}, questionRows = [], repairPlan = {} } = {}) {
  const jobId = trace.job_id || gap.job_id;
  const questions = questionsForJob(questionRows, jobId);
  const repairs = repairsForJob(repairPlan, jobId);
  const sections = buildMetadataSections({ trace, gap, questions, repairs });
  const categories = categoryBreakdown(sections);
  const privateFlag = privateReviewRequired({ trace, gap, sections, questions });
  const sourceRef = sourceRecordingRef(trace);
  const title = generatedTitleForJob({ trace, gap });
  const parseGaps = buildParseGaps(trace, gap);

  const manifest = {
    job_id: jobId,
    job_ref: `content_job:${jobId}`,
    generated_title: title,
    original_title_policy: 'not_exported_from_audit_artifact; use generated title in repo',
    source_type: 'content_job_from_class_drive_intake_audit',
    raw_intake_id: null,
    drive_file_ref: sourceRef.redacted,
    drive_file_hash: sourceRef.hash,
    transcript_chars: trace.transcript_chars || gap.transcript_chars || 0,
    transcript_hash: transcriptHashStatus(trace),
    parser_used: trace.parser || null,
    parse_run_id: stageEvidence(trace, 'parser_request') || null,
    class_session_linkage: stageStatus(trace, 'class_session_match'),
    category_list: categories.map((row) => row.lane),
    short_summary: `Privacy-safe digest for ${title}. Raw transcript body remains in private app database or Drive.`,
    subject_breakdown_status: stageStatus(trace, 'profile_note_proposal'),
    tasks_extracted: buildTaskCandidates({ trace, gap, repairs }).length,
    questions_extracted_count: questions.length,
    student_matching_status: questions.some((row) => row.match_status !== 'matched')
      ? 'needs_review'
      : questions.length
        ? 'matched_candidates_present'
        : 'no_student_question_candidates',
    accountability_profile_progress_status: {
      accountability_event: stageStatus(trace, 'accountability_proposal'),
      profile_note: stageStatus(trace, 'profile_note_proposal'),
      student_progress: stageStatus(trace, 'score_progress_proposal'),
    },
    private_meeting_flag: categories.some((row) => row.lane === 'private_meeting'),
    private_review_flag: privateFlag,
    content_marketing_flag: categories.some((row) => ['content_idea', 'article_angle', 'marketing_clip'].includes(row.lane)),
    confidence: parseGaps.length ? 0.62 : 0.82,
    blockers: parseGaps.map((row) => `${row.stage}:${row.status}`),
    next_action: parseGaps.length
      ? 'Review parse gaps and private matching before any production write or parent-facing output.'
      : 'Ready for owner review as digest memory only.',
    raw_transcript_body_included: false,
  };

  return {
    job_id: jobId,
    manifest,
    categories,
    sections,
    routing: sections.map((section) => ({
      section_id: section.section_id,
      lanes: section.lanes,
      privacy: section.privacy,
      owner: section.privacy === 'repo_safe_digest' ? 'Codex/agent' : 'Shloimie/private reviewer',
      next_action: section.privacy === 'repo_safe_digest'
        ? 'Use digest/category metadata only.'
        : 'Review in private app/Drive before any repo or public output.',
    })),
    classNotes: {
      status: stageStatus(trace, 'profile_note_proposal'),
      note: 'Repo digest stores only class-note status and hashed section summaries; raw note body stays private.',
    },
    taskCandidates: buildTaskCandidates({ trace, gap, repairs }),
    questionCandidates: buildQuestionCandidates(questions),
    contentIdeas: categories.some((row) => ['content_idea', 'article_angle', 'marketing_clip'].includes(row.lane))
      ? [{ title: `${manifest.generated_title} content angle`, source: manifest.job_ref, raw_text_included: false }]
      : [],
    privateReview: {
      private_review_required: privateFlag,
      reason: privateReviewReason({ trace, gap, sections, questions }),
      private_drive_or_app_pointer: manifest.drive_file_ref || manifest.job_ref,
      raw_text_included: false,
    },
    parseGaps,
  };
}

function loadAudit(auditDir = DEFAULT_AUDIT_DIR, repoRoot = process.cwd()) {
  const root = path.resolve(repoRoot);
  const dir = path.resolve(root, auditDir);
  return {
    dir,
    summary: readJson(path.join(dir, 'AUDIT-SUMMARY.json'), {}),
    traces: readJson(path.join(dir, 'JOB-PIPELINE-TRACE.json'), []),
    gaps: readJson(path.join(dir, 'GITHUB-EXPORT-GAPS.json'), []),
    questions: readJson(path.join(dir, 'STUDENT-QUESTION-MATRIX.json'), []),
    repairPlan: readJson(path.join(dir, 'REPROCESS-DRY-RUN-PLAN.json'), {}),
  };
}

function buildDigestsFromAudit(audit) {
  const traceByJob = new Map(toArray(audit.traces).map((trace) => [Number(trace.job_id), trace]));
  const gapByJob = new Map(toArray(audit.gaps).map((gap) => [Number(gap.job_id), gap]));
  const jobIds = [...new Set([...traceByJob.keys(), ...gapByJob.keys()].filter(Boolean))].sort((a, b) => b - a);
  return jobIds.map((jobId) => buildDigestForJob({
    trace: traceByJob.get(jobId) || { job_id: jobId, stages: {} },
    gap: gapByJob.get(jobId) || { job_id: jobId, status: 'ok_or_no_transcript' },
    questionRows: audit.questions,
    repairPlan: audit.repairPlan,
  }));
}

function renderIndexMarkdown(digests, generatedAt) {
  const rows = digests.map((digest) => {
    const manifest = digest.manifest;
    const folder = `recordings/${zeroJobId(digest.job_id)}/DIGEST.md`;
    return `| #${manifest.job_id} | [${manifest.generated_title}](${folder}) | ${manifest.transcript_chars} | ${manifest.category_list.join(', ') || 'none'} | ${manifest.private_review_flag ? 'yes' : 'no'} | ${manifest.blockers.length} |`;
  });
  return [
    '# Transcript Digest Index',
    '',
    `Generated from sanitized audit: ${generatedAt || 'unknown'}`,
    '',
    'Raw transcript bodies are not stored here. Use private Drive/app database pointers for transcript review.',
    '',
    '| Job | Digest | Transcript chars | Categories | Private review | Blockers |',
    '| --- | --- | ---: | --- | --- | ---: |',
    ...rows,
    '',
  ].join('\n');
}

function renderDigestMarkdown(digest) {
  const manifest = digest.manifest;
  return [
    `# ${manifest.generated_title}`,
    '',
    `- Job: ${manifest.job_ref}`,
    `- Drive source: ${manifest.drive_file_ref || 'unknown'}`,
    `- Transcript characters: ${manifest.transcript_chars}`,
    `- Transcript hash: ${manifest.transcript_hash.status}`,
    `- Parser: ${manifest.parser_used || 'none'}`,
    `- Class/session linkage: ${manifest.class_session_linkage}`,
    `- Private review: ${manifest.private_review_flag ? 'yes' : 'no'}`,
    `- Raw transcript body included: ${manifest.raw_transcript_body_included ? 'yes' : 'no'}`,
    '',
    '## Summary',
    '',
    manifest.short_summary,
    '',
    '## Categories',
    '',
    manifest.category_list.length ? manifest.category_list.map((lane) => `- ${lane}`).join('\n') : '- none',
    '',
    '## Next Action',
    '',
    manifest.next_action,
    '',
    '## Blockers',
    '',
    manifest.blockers.length ? manifest.blockers.map((item) => `- ${item}`).join('\n') : '- none',
    '',
  ].join('\n');
}

function renderRoutingMarkdown(digest) {
  const rows = digest.routing.map((row) =>
    `| ${row.section_id} | ${row.lanes.join(', ')} | ${row.privacy} | ${row.owner} | ${row.next_action.replace(/\|/g, '\\|')} |`
  );
  return [
    '# Section Routing',
    '',
    '| Section | Lanes | Privacy | Owner | Next action |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

function renderCandidateMarkdown(title, rows, emptyText) {
  return [
    `# ${title}`,
    '',
    rows.length
      ? rows.map((row) => `- ${row.candidate_id}: ${row.title || row.question_ref || row.related_source || row.recording_ref}`).join('\n')
      : `- ${emptyText}`,
    '',
  ].join('\n');
}

function buildTranscriptGapRows(digests) {
  return digests.map((digest) => {
    const manifest = digest.manifest;
    const hasQuestions = manifest.questions_extracted_count > 0;
    const missingExport = manifest.blockers.includes('repo_digest_export:MISSING');
    return {
      job_id: manifest.job_id,
      source_label: manifest.job_ref,
      source_hash: manifest.drive_file_hash || null,
      transcript_chars: manifest.transcript_chars,
      has_raw_transcript_in_app_db: manifest.transcript_chars ? 'yes' : 'no',
      has_drive_raw_transcript_doc: 'unknown',
      has_repo_digest: 'yes',
      has_generated_title: 'yes',
      has_category_classification: manifest.category_list.length ? 'yes' : 'no',
      has_class_session_parse: manifest.class_session_linkage === 'CONFIRMED' ? 'yes' : 'no',
      has_student_question_parse: hasQuestions ? (manifest.private_review_flag ? 'private' : 'yes') : 'not applicable',
      reason_for_gap: missingExport
        ? 'Prior raw transcript GitHub export was missing and raw-body exporter is blocked by DEC-20260626-101.'
        : 'No raw transcript export gap after digest generation.',
      safe_next_action: missingExport
        ? 'Keep digest in GitHub; keep raw transcript in Drive/app DB; do not run raw exporter without explicit unsafe approval.'
        : 'Use digest for agent memory and review private raw source only when needed.',
      blocker: missingExport ? 'DEC-20260626-101' : '',
    };
  });
}

function renderTranscriptGapsMarkdown(rows) {
  return [
    '# Transcript Gaps',
    '',
    'Sanitized gap manifest. No transcript bodies or raw Drive IDs are included.',
    '',
    '| Job | Source | Chars | App raw | Drive doc | Repo digest | Title | Categories | Class parse | Student parse | Blocker |',
    '| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map((row) => [
      `#${row.job_id}`,
      row.source_label,
      row.transcript_chars,
      row.has_raw_transcript_in_app_db,
      row.has_drive_raw_transcript_doc,
      row.has_repo_digest,
      row.has_generated_title,
      row.has_category_classification,
      row.has_class_session_parse,
      row.has_student_question_parse,
      row.blocker || '',
    ].map((item) => String(item).replace(/\|/g, '\\|')).join(' | ')).map((line) => `| ${line} |`),
    '',
  ].join('\n');
}

function buildRepairCandidateRows(digests, repairPlan = {}) {
  const rows = [];
  let index = 0;
  for (const repair of toArray(repairPlan.dry_run_repair_candidates)) {
    index += 1;
    const jobId = Number(String(repair.source_ref || '').match(/content_job:(\d+)/)?.[1] || 0) || null;
    const digest = digests.find((item) => Number(item.job_id) === Number(jobId));
    const sourceHash = digest?.manifest?.drive_file_hash || sha256(repair.source_ref || '').slice(0, 16);
    rows.push({
      candidate_id: `REPAIR-20260626-${String(index).padStart(3, '0')}`,
      job_id: jobId,
      source_hash: sourceHash,
      redacted_source_label: repair.source_ref || '',
      target_lane_table_model: repair.target || 'review',
      proposed_operation: repair.action?.includes('reparse') ? 'review-only' : 'no-op',
      before_state_hash_summary: sha256(JSON.stringify({ source: repair.source_ref, reason: repair.reason })).slice(0, 16),
      proposed_after_state_hash_summary: sha256(JSON.stringify({ source: repair.source_ref, action: repair.action, dry_run: true })).slice(0, 16),
      reason: repair.reason || '',
      confidence: 0.7,
      duplicate_idempotency_key: sha256(`${repair.action || ''}:${repair.source_ref || ''}:${repair.target || ''}`).slice(0, 24),
      rollback_method: 'No production mutation in this dry-run candidate.',
      privacy_classification: 'repo_safe_digest',
      owner_approval_needed: 'yes',
      exact_blocker: 'DEC-20260626-101 plus explicit production mutation approval is required before apply.',
    });
  }
  return rows;
}

function renderRepairCandidatesMarkdown(rows) {
  return [
    '# Repair Candidates',
    '',
    'Dry-run only. No production mutation is authorized by this manifest.',
    '',
    '| Candidate | Job | Target | Operation | Confidence | Approval | Blocker |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...rows.map((row) =>
      `| ${row.candidate_id} | #${row.job_id || ''} | ${row.target_lane_table_model} | ${row.proposed_operation} | ${row.confidence} | ${row.owner_approval_needed} | ${row.exact_blocker.replace(/\|/g, '\\|')} |`
    ),
    '',
  ].join('\n');
}

function buildDriveTranscriptLibraryPlan(digests) {
  const rows = digests.map((digest) => {
    const manifest = digest.manifest;
    const needsPrivateReview = manifest.private_review_flag || manifest.private_meeting_flag;
    return {
      job_id: manifest.job_id,
      generated_title: manifest.generated_title,
      planned_doc_action: manifest.transcript_chars ? 'would-create-or-update-private-transcript-doc' : 'no-transcript-doc-until-transcribed',
      existing_doc_status: 'unknown_not_checked_in_repo_safe_run',
      transcript_status: manifest.transcript_chars ? 'raw_transcript_available_in_app_or_private_drive' : 'missing_transcript',
      title_status: 'generated_title_available',
      parser_output_status: manifest.parser_used ? 'parser_metadata_present' : 'parser_metadata_missing_or_needs_review',
      private_review_tag: needsPrivateReview ? 'required' : 'not_required_from_metadata',
      marketing_content_library_safe: manifest.content_marketing_flag && !needsPrivateReview ? 'candidate' : 'no',
      class_private_restriction: needsPrivateReview ? 'restricted_private_review' : 'restricted_class_digest',
      raw_text_included: false,
    };
  });
  return {
    generated_at: new Date(0).toISOString(),
    dry_run: true,
    external_writes_performed: false,
    ai_provider_calls_performed: false,
    drive_create_update_delete_performed: false,
    source_files_moved: false,
    paid_retranscription_performed: false,
    rows,
    summary: {
      would_create_or_update_docs: rows.filter((row) => row.planned_doc_action.startsWith('would')).length,
      missing_transcripts: rows.filter((row) => row.transcript_status === 'missing_transcript').length,
      missing_titles: rows.filter((row) => row.title_status !== 'generated_title_available').length,
      missing_parser_outputs: rows.filter((row) => row.parser_output_status !== 'parser_metadata_present').length,
      existing_docs_unknown: rows.length,
      private_review_docs: rows.filter((row) => row.private_review_tag === 'required').length,
      marketing_safe_candidates: rows.filter((row) => row.marketing_content_library_safe === 'candidate').length,
      restricted_class_private_docs: rows.filter((row) => row.class_private_restriction !== 'none').length,
    },
  };
}

function renderDrivePlanMarkdown(plan) {
  return [
    '# Drive Transcript Library Dry-Run Plan',
    '',
    'No Drive create/update/delete, source-file move, AI provider call, paid retranscription, or production worker retry was performed.',
    '',
    '## Summary',
    '',
    ...Object.entries(plan.summary).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Rows',
    '',
    '| Job | Generated title | Planned action | Transcript | Parser | Private review | Marketing safe |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...plan.rows.map((row) =>
      `| #${row.job_id} | ${row.generated_title.replace(/\|/g, '\\|')} | ${row.planned_doc_action} | ${row.transcript_status} | ${row.parser_output_status} | ${row.private_review_tag} | ${row.marketing_content_library_safe} |`
    ),
    '',
  ].join('\n');
}

function scanTextForLeaks(text, filePath) {
  const findings = [];
  const checks = [
    ['raw_transcript_marker', /## Raw Transcript/i],
    ['transcript_text_field', /\btranscript_text\b/i],
    ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
    ['phone', /(?<![A-Za-z:])(?:\+\d[\d\s().-]{7,}\d|\b\d{9,}\b)/],
    ['google_drive_url', /https:\/\/drive\.google\.com\//i],
  ];
  for (const [kind, pattern] of checks) {
    if (pattern.test(text)) findings.push({ file: filePath, kind });
  }
  const safeLongTokenPrefixes = /^(TASK|QUESTION|REPAIR|CONTENT|CLASS|TRANSCRIPT)-|^\d{4}-\d{2}-\d{2}-/;
  for (const match of text.matchAll(/\b[A-Za-z0-9-]{28,}\b/g)) {
    if (!safeLongTokenPrefixes.test(match[0])) {
      findings.push({ file: filePath, kind: 'raw_google_drive_id' });
      break;
    }
  }
  return findings;
}

function scanOutputForLeaks(outputDir) {
  const findings = [];
  if (!fs.existsSync(outputDir)) return findings;
  const entries = fs.readdirSync(outputDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(outputDir, entry.name);
    if (entry.isDirectory()) findings.push(...scanOutputForLeaks(full));
    else if (/\.(md|json|txt)$/i.test(entry.name)) {
      findings.push(...scanTextForLeaks(fs.readFileSync(full, 'utf8'), full));
    }
  }
  return findings;
}

function writeDigestOutputs({
  repoRoot = process.cwd(),
  auditDir = DEFAULT_AUDIT_DIR,
  outputDir = DEFAULT_OUTPUT_DIR,
  dryRun = false,
  manifestOnly = false,
  deleteStale = false,
  jobIds = [],
} = {}) {
  const root = path.resolve(repoRoot);
  const audit = loadAudit(auditDir, root);
  let digests = buildDigestsFromAudit(audit);
  if (jobIds.length) {
    const wanted = new Set(jobIds.map(Number));
    digests = digests.filter((digest) => wanted.has(Number(digest.job_id)));
  }
  const outDir = path.resolve(root, outputDir);
  const generatedAt = audit.summary?.generated_at || audit.summary?.final_verdict?.generated_at || '';
  const manifest = {
    generated_from: path.relative(root, audit.dir).replaceAll(path.sep, '/'),
    generated_at: generatedAt,
    raw_transcript_bodies_included: false,
    stale_deletion_performed: false,
    recording_count: digests.length,
    recordings: digests.map((digest) => ({
      job_id: digest.job_id,
      path: `recordings/${zeroJobId(digest.job_id)}/MANIFEST.json`,
      generated_title: digest.manifest.generated_title,
      transcript_chars: digest.manifest.transcript_chars,
      categories: digest.manifest.category_list,
      private_review: digest.manifest.private_review_flag,
    })),
  };

  const gapRows = buildTranscriptGapRows(digests);
  const repairRows = buildRepairCandidateRows(digests, audit.repairPlan);
  const drivePlan = buildDriveTranscriptLibraryPlan(digests);
  const plannedFiles = [
    path.join(outDir, 'index.md'),
    path.join(outDir, 'manifest.json'),
    path.join(audit.dir, 'TRANSCRIPT-GAPS.md'),
    path.join(audit.dir, 'TRANSCRIPT-GAPS.json'),
    path.join(audit.dir, 'REPAIR-CANDIDATES.md'),
    path.join(audit.dir, 'REPAIR-CANDIDATES.json'),
    path.join(audit.dir, 'DRIVE-TRANSCRIPT-LIBRARY-DRY-RUN.md'),
    path.join(audit.dir, 'DRIVE-TRANSCRIPT-LIBRARY-DRY-RUN.json'),
  ];

  if (dryRun) {
    return { dryRun: true, manifest, plannedFiles, digests, gapRows, repairRows, drivePlan };
  }

  writeText(path.join(outDir, 'index.md'), renderIndexMarkdown(digests, generatedAt));
  writeJson(path.join(outDir, 'manifest.json'), manifest);

  if (!manifestOnly) {
    const expectedDirs = new Set();
    for (const digest of digests) {
      const dir = path.join(outDir, 'recordings', zeroJobId(digest.job_id));
      expectedDirs.add(dir);
      writeJson(path.join(dir, 'MANIFEST.json'), digest.manifest);
      writeText(path.join(dir, 'DIGEST.md'), renderDigestMarkdown(digest));
      writeJson(path.join(dir, 'CATEGORIES.json'), { job_id: digest.job_id, categories: digest.categories, sections: digest.sections });
      writeText(path.join(dir, 'ROUTING.md'), renderRoutingMarkdown(digest));
      writeText(path.join(dir, 'CLASS-NOTES.md'), `# Class Notes\n\nStatus: ${digest.classNotes.status}\n\n${digest.classNotes.note}\n`);
      writeText(path.join(dir, 'TASK-CANDIDATES.md'), renderCandidateMarkdown('Task Candidates', digest.taskCandidates, 'No task candidates from sanitized metadata.'));
      writeText(path.join(dir, 'STUDENT-QUESTION-CANDIDATES.md'), renderCandidateMarkdown('Student Question Candidates', digest.questionCandidates, 'No student question candidates from sanitized metadata.'));
      writeText(path.join(dir, 'CONTENT-IDEAS.md'), renderCandidateMarkdown('Content Ideas', digest.contentIdeas, 'No content ideas from sanitized metadata.'));
      writeText(path.join(dir, 'PRIVATE-REVIEW.md'), `# Private Review\n\n- Required: ${digest.privateReview.private_review_required ? 'yes' : 'no'}\n- Reason: ${digest.privateReview.reason}\n- Pointer: ${digest.privateReview.private_drive_or_app_pointer}\n- Raw text included: no\n`);
      writeJson(path.join(dir, 'PARSE-GAPS.json'), digest.parseGaps);
    }

    if (deleteStale) {
      const recordingsDir = path.join(outDir, 'recordings');
      if (fs.existsSync(recordingsDir)) {
        for (const entry of fs.readdirSync(recordingsDir, { withFileTypes: true })) {
          const full = path.join(recordingsDir, entry.name);
          if (entry.isDirectory() && !expectedDirs.has(full)) fs.rmSync(full, { recursive: true, force: true });
        }
      }
      manifest.stale_deletion_performed = true;
      writeJson(path.join(outDir, 'manifest.json'), manifest);
    }
  }

  writeJson(path.join(audit.dir, 'TRANSCRIPT-GAPS.json'), gapRows);
  writeText(path.join(audit.dir, 'TRANSCRIPT-GAPS.md'), renderTranscriptGapsMarkdown(gapRows));
  writeJson(path.join(audit.dir, 'REPAIR-CANDIDATES.json'), repairRows);
  writeText(path.join(audit.dir, 'REPAIR-CANDIDATES.md'), renderRepairCandidatesMarkdown(repairRows));
  writeJson(path.join(audit.dir, 'DRIVE-TRANSCRIPT-LIBRARY-DRY-RUN.json'), drivePlan);
  writeText(path.join(audit.dir, 'DRIVE-TRANSCRIPT-LIBRARY-DRY-RUN.md'), renderDrivePlanMarkdown(drivePlan));

  return { dryRun: false, manifest, plannedFiles, digests, gapRows, repairRows, drivePlan };
}

module.exports = {
  DEFAULT_AUDIT_DIR,
  DEFAULT_OUTPUT_DIR,
  LANES,
  buildDigestForJob,
  buildDigestsFromAudit,
  buildDriveTranscriptLibraryPlan,
  buildRepairCandidateRows,
  buildTranscriptGapRows,
  classifySection,
  classifyTranscriptSections,
  scanOutputForLeaks,
  splitTranscriptIntoSections,
  writeDigestOutputs,
};
