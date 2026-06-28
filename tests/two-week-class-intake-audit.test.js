const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildStudentQuestionMatrix,
  buildTwoWeekClassIntakeAudit,
  collectQuestionCandidates,
  isLikelyRecordingFile,
  matchDriveFilesToJobs,
  selectScope,
} = require('../src/lib/bna/two-week-class-intake-audit');

test('isLikelyRecordingFile detects class audio and video files', () => {
  assert.equal(isLikelyRecordingFile({ name: 'Voice 260625_142916.m4a', mimeType: 'audio/mp4' }), true);
  assert.equal(isLikelyRecordingFile({ name: 'Class Sunday balak.m4a', mimeType: 'audio/mp4' }), true);
  assert.equal(isLikelyRecordingFile({ name: 'README.md', mimeType: 'text/markdown' }), false);
});

test('selectScope includes date-range recordings and matching Drive-backed jobs', () => {
  const driveFiles = [
    { id: 'drive-a', name: 'Voice 260625_142916.m4a', mimeType: 'audio/mp4', createdTime: '2026-06-25T12:15:00Z' },
    { id: 'old-drive', name: 'Voice 260601.m4a', mimeType: 'audio/mp4', createdTime: '2026-06-01T12:15:00Z' },
  ];
  const jobs = [
    { id: 83, title: 'Voice 260625_142916.m4a', source_type: 'google_drive', drive_file_id: 'drive-a', created_at: '2026-06-25T12:16:00Z', transcript_text: 'x'.repeat(9025) },
    { id: 10, title: 'Old job', source_type: 'google_drive', drive_file_id: 'old-drive', created_at: '2026-06-01T12:16:00Z', transcript_text: 'x'.repeat(9025) },
  ];
  const scope = selectScope({ jobs, driveFiles, startDate: '2026-06-12', endDate: '2026-06-26' });
  assert.deepEqual(scope.filesInRange.map((file) => file.id), ['drive-a']);
  assert.deepEqual(scope.jobsInRange.map((job) => job.id), [83]);
});

test('matchDriveFilesToJobs reports orphans and duplicate matches', () => {
  const result = matchDriveFilesToJobs(
    [{ id: 'drive-file-aa' }, { id: 'orphan' }],
    [{ id: 1, drive_file_id: 'drive-file-aa' }, { id: 2, media_url: 'https://drive.google.com/file/d/drive-file-aa/view' }]
  );
  assert.equal(result[0].match_status, 'duplicate_matches');
  assert.deepEqual(result[0].matched_jobs, [1, 2]);
  assert.equal(result[1].match_status, 'orphan');
});

test('collectQuestionCandidates extracts questions from class notes and parse fields', () => {
  const job = {
    id: 83,
    parse_json: {
      mixed_recording_parse: {
        parser: 'canonical-intake-parser',
        parsed: {
          class_notes: [
            {
              title: 'Tefillah',
              student_questions: [
                'Huda Weber: Why is it more important for children to pray?',
                { student_name: 'Hillel Baraka', question_text: 'What does it mean that Torah brings Hashem closer?' },
              ],
            },
          ],
        },
      },
      student_questions: ['Amitai Kosofsky: Could the manna taste like anything?'],
    },
  };
  const questions = collectQuestionCandidates(job);
  assert.equal(questions.length, 3);
  assert.equal(questions[0].student_name, 'Huda Weber');
  assert.match(questions[0].question_text, /children to pray/);
});

test('buildStudentQuestionMatrix matches synthetic students and redacts by default', () => {
  const matrix = buildStudentQuestionMatrix({
    jobs: [{
      id: 83,
      created_at: '2026-06-25T12:16:00Z',
      drive_file_id: 'drive-a',
      parse_json: {
        mixed_recording_parse: {
          parsed: {
            class_notes: [
              { student_questions: ['Huda Weber: Why is it more important for children to pray?'] },
            ],
          },
        },
      },
    }],
    students: [{ id: 5, full_name: 'Huda Weber' }],
  });
  assert.equal(matrix.length, 1);
  assert.equal(matrix[0].matched_student_ref, 'student:5');
  assert.equal(matrix[0].match_status, 'matched');
  assert.equal(matrix[0].question_text, undefined);
  assert.ok(matrix[0].question_ref.startsWith('question:'));
});

test('buildStudentQuestionMatrix deduplicates repeated parser echoes', () => {
  const matrix = buildStudentQuestionMatrix({
    jobs: [{
      id: 84,
      parse_json: {
        mixed_recording_parse: {
          parsed: {
            class_notes: [
              { student_questions: ['Huda Weber: Why is tefillah daily?'] },
            ],
          },
        },
        student_questions: ['Huda Weber: Why is tefillah daily?'],
      },
    }],
    students: [{ id: 5, full_name: 'Huda Weber' }],
  });
  assert.equal(matrix.length, 1);
  assert.equal(matrix[0].question_index, 1);
});

test('buildTwoWeekClassIntakeAudit returns export gaps and partial verdict for incomplete job', () => {
  const audit = buildTwoWeekClassIntakeAudit({
    startDate: '2026-06-12',
    endDate: '2026-06-26',
    snapshot: {
      jobs: [{
        id: 83,
        title: 'Voice 260625_142916.m4a',
        source_type: 'google_drive',
        drive_file_id: 'drive-a',
        created_at: '2026-06-25T12:16:00Z',
        updated_at: '2026-06-25T12:17:00Z',
        status: 'transcribed',
        drive_stage: '04 Parsed',
        transcript_text: 'This is a transcript.',
        parse_json: { mixed_recording_parse: { parser: 'canonical-intake-parser', parsed: { class_notes: [] } } },
      }],
      students: [],
      classSessions: [{ id: 1, content_job_id: 83 }],
      contentOutputs: [{ id: 1, job_id: 83 }],
      groupGoalEntries: [],
      torahEntries: [],
      accountabilityEvents: [],
      intakeParseRuns: [{ id: 54, source_id: '83' }],
      rawIntake: [],
    },
    driveFiles: [{ id: 'drive-a', name: 'Voice 260625_142916.m4a', mimeType: 'audio/mp4', createdTime: '2026-06-25T12:15:00Z' }],
    repoRoot: '/tmp/nonexistent-bna-repo',
  });

  assert.equal(audit.scope_counts.content_jobs_in_range, 1);
  assert.equal(audit.scope_counts.github_export_gaps, 1);
  assert.equal(audit.final_verdict.status, 'PARTIAL');
  assert.ok(audit.final_verdict.blockers.some((item) => item.includes('missing from GitHub transcript export')));
});
