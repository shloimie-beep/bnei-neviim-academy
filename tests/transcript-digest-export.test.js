const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  buildDigestForJob,
  buildRepairCandidateRows,
  buildTranscriptGapRows,
  classifySection,
  classifyTranscriptSections,
  scanOutputForLeaks,
  writeDigestOutputs,
} = require('../src/lib/bna/transcript-digest-export');

const repoRoot = path.resolve(__dirname, '..');

function stage(status, evidence = '') {
  return { status, evidence };
}

function sampleTrace(jobId = 83) {
  return {
    kind: 'content_job',
    job_id: jobId,
    job_ref: `content_job:${jobId}`,
    status: 'transcribed',
    drive_stage: '04 Parsed',
    parser: 'canonical-intake-parser',
    transcript_chars: 9025,
    source_recording_ref: { redacted: 'drive_file:abc123digest', hash: 'abc123digest' },
    stages: {
      intake_record: stage('MISSING'),
      parser_request: stage('CONFIRMED', 'parse_run:54'),
      structured_output: stage('CONFIRMED', 'canonical-intake-parser'),
      class_session_match: stage('CONFIRMED'),
      profile_note_proposal: stage('CONFIRMED', '2 class notes'),
      question_proposal: stage('CONFIRMED', '1 question candidate'),
      parent_student_visibility: stage('NEEDS_REVIEW'),
      accountability_proposal: stage('MISSING'),
      score_progress_proposal: stage('MISSING'),
    },
  };
}

function sampleGap(jobId = 83) {
  return {
    job_ref: `content_job:${jobId}`,
    job_id: jobId,
    class_date: '2026-06-25',
    transcript_chars: 9025,
    exported_to_github: false,
    expected_file_hint: `${String(jobId).padStart(3, '0')}-*.md`,
    status: 'missing_export',
  };
}

function currentAuditShapeTrace(jobId = 83) {
  return {
    kind: 'content_job',
    job_id: jobId,
    job_ref: `content_job:${jobId}`,
    status: 'transcribed',
    drive_stage: '04 Parsed',
    parser: 'canonical-intake-parser',
    transcript_chars: 9025,
    stages: {
      source_discovered: {
        status: 'CONFIRMED',
        evidence: `content job ${jobId}`,
        source_ref: {
          drive_file: {
            present: true,
            redacted: 'drive_file:9f6f75a5d602',
            sha256: '9f6f75a5d602bcf8ab6df7ed078a3d61f05e6bfc61a6d1f75742c2cea303847d',
          },
        },
      },
      intake_record: stage('CONFIRMED', 'RAW-20260625-002'),
      parser_request: stage('CONFIRMED', 'canonical-intake-parser'),
      structured_output: stage('CONFIRMED', 'canonical-intake-parser'),
      class_session_match: stage('CONFIRMED'),
      profile_note_proposal: stage('CONFIRMED', '2 class notes'),
      question_proposal: stage('CONFIRMED', '0 question candidates'),
      parent_student_visibility: stage('CONFIRMED'),
      accountability_proposal: stage('CONFIRMED'),
      score_progress_proposal: stage('CONFIRMED'),
    },
  };
}

function writeAuditFixture(root) {
  const auditDir = path.join(root, 'audit');
  fs.mkdirSync(auditDir, { recursive: true });
  fs.writeFileSync(path.join(auditDir, 'AUDIT-SUMMARY.json'), JSON.stringify({ generated_at: '2026-06-26T00:00:00.000Z' }, null, 2));
  fs.writeFileSync(path.join(auditDir, 'JOB-PIPELINE-TRACE.json'), JSON.stringify([sampleTrace(83)], null, 2));
  fs.writeFileSync(path.join(auditDir, 'GITHUB-EXPORT-GAPS.json'), JSON.stringify([sampleGap(83)], null, 2));
  fs.writeFileSync(path.join(auditDir, 'STUDENT-QUESTION-MATRIX.json'), JSON.stringify([
    {
      job_id: 83,
      job_ref: 'content_job:83',
      question_ref: 'question:aaa',
      question_text_hash: 'aaa',
      student_name_hash: 'studenthash',
      matched_student_ref: 'student:5',
      confidence: 100,
      match_status: 'matched',
      source_kind: 'class_notes.student_questions',
      newsletter_ready: 'candidate_after_review',
    },
  ], null, 2));
  fs.writeFileSync(path.join(auditDir, 'REPROCESS-DRY-RUN-PLAN.json'), JSON.stringify({
    dry_run_repair_candidates: [
      {
        action: 'dry_run_reparse',
        target: 'content_job_parse_json',
        source_ref: 'content_job:83',
        reason: 'Transcript exists but no parser metadata/output was found.',
        no_production_mutation: true,
      },
    ],
  }, null, 2));
  return auditDir;
}

test('digest export writes no raw transcript bodies and privacy scan passes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-digest-'));
  const auditDir = writeAuditFixture(root);
  const outDir = path.join(root, 'content-memory', 'transcript-digests');
  const result = writeDigestOutputs({ repoRoot: root, auditDir, outputDir: outDir });

  assert.equal(result.manifest.raw_transcript_bodies_included, false);
  const digestText = fs.readFileSync(path.join(outDir, 'recordings', '000083', 'DIGEST.md'), 'utf8');
  assert.doesNotMatch(digestText, /This is a raw transcript body/i);
  assert.doesNotMatch(digestText, /## Raw Transcript/i);
  assert.deepEqual(scanOutputForLeaks(outDir), []);
});

test('legacy raw transcript exporter is blocked without explicit unsafe flag', () => {
  const result = spawnSync(process.execPath, [path.join(repoRoot, 'scripts', 'export-content-transcripts.mjs')], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /Refusing to export raw transcript bodies/);
});

test('default digest export does not delete stale recording folders', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-digest-stale-'));
  const auditDir = writeAuditFixture(root);
  const outDir = path.join(root, 'content-memory', 'transcript-digests');
  const staleDir = path.join(outDir, 'recordings', '999999');
  fs.mkdirSync(staleDir, { recursive: true });
  fs.writeFileSync(path.join(staleDir, 'STALE.md'), 'keep me');

  writeDigestOutputs({ repoRoot: root, auditDir, outputDir: outDir });
  assert.equal(fs.existsSync(path.join(staleDir, 'STALE.md')), true);
});

test('section classifier routes mixed recordings into multiple lanes', () => {
  const sections = classifyTranscriptSections([
    'Class discussion: the student asked why the Mishnah repeats the case?',
    '',
    'Operations note: task for Codex to fix the Drive parser export gap.',
  ].join('\n'));
  const lanes = new Set(sections.flatMap((section) => section.lanes));
  assert.equal(lanes.has('class_session'), true);
  assert.equal(lanes.has('student_question'), true);
  assert.equal(lanes.has('task'), true);
  assert.equal(lanes.has('drive_workflow_issue'), true);
});

test('private meeting sections do not export raw text', () => {
  const section = classifySection({
    title: 'Private meeting',
    text: 'Private meeting about a sensitive student behavior issue.',
  });
  assert.equal(section.privacy, 'private_review_required');
  assert.equal(section.raw_text_included, false);
  assert.equal(section.lanes.includes('private_meeting'), true);
});

test('current audit source refs and class transcript privacy are preserved', () => {
  const digest = buildDigestForJob({
    trace: currentAuditShapeTrace(83),
    gap: { ...sampleGap(83), status: 'ok_or_no_transcript' },
    questionRows: [],
    repairPlan: { dry_run_repair_candidates: [] },
  });

  assert.equal(digest.manifest.drive_file_ref, 'drive_file:9f6f75a5d602');
  assert.equal(
    digest.manifest.drive_file_hash,
    '9f6f75a5d602bcf8'
  );
  assert.equal(digest.manifest.private_review_flag, true);
  assert.match(digest.privateReview.reason, /Class recording transcripts stay private by default/);
});

test('student question candidates are deduped and ambiguous students are not auto-merged', () => {
  const digest = buildDigestForJob({
    trace: sampleTrace(83),
    gap: sampleGap(83),
    questionRows: [
      {
        job_id: 83,
        job_ref: 'content_job:83',
        question_ref: 'question:aaa',
        question_text_hash: 'aaa',
        matched_student_ref: 'student:5',
        confidence: 80,
        match_status: 'ambiguous',
      },
      {
        job_id: 83,
        job_ref: 'content_job:83',
        question_ref: 'question:aaa',
        question_text_hash: 'aaa',
        matched_student_ref: 'student:5',
        confidence: 80,
        match_status: 'ambiguous',
      },
    ],
    repairPlan: { dry_run_repair_candidates: [] },
  });
  assert.equal(digest.questionCandidates.length, 1);
  assert.equal(digest.questionCandidates[0].student_matching_status.matched_student_ref, null);
  assert.equal(digest.questionCandidates[0].student_matching_status.next_action, 'Human student-match review.');
});

test('task candidates include routing metadata required by the run', () => {
  const digest = buildDigestForJob({
    trace: sampleTrace(83),
    gap: sampleGap(83),
    questionRows: [],
    repairPlan: { dry_run_repair_candidates: [] },
  });
  const task = digest.taskCandidates[0];
  assert.ok(task.title);
  assert.ok(task.owner);
  assert.ok(task.category);
  assert.ok(task.priority);
  assert.ok(Array.isArray(task.depends_on));
  assert.ok(task.related_source);
  assert.ok(task.notes);
});

test('transcript gap and repair candidate manifests are deterministic', () => {
  const digest = buildDigestForJob({
    trace: sampleTrace(83),
    gap: sampleGap(83),
    questionRows: [],
    repairPlan: {
      dry_run_repair_candidates: [
        { action: 'dry_run_reparse', target: 'content_job_parse_json', source_ref: 'content_job:83', reason: 'Missing parser.' },
      ],
    },
  });
  const repairPlan = {
    dry_run_repair_candidates: [
      { action: 'dry_run_reparse', target: 'content_job_parse_json', source_ref: 'content_job:83', reason: 'Missing parser.' },
    ],
  };

  assert.deepEqual(buildTranscriptGapRows([digest]), buildTranscriptGapRows([digest]));
  assert.deepEqual(buildRepairCandidateRows([digest], repairPlan), buildRepairCandidateRows([digest], repairPlan));
});
