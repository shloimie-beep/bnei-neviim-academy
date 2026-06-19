const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const transcriptPrivacy = require('../src/lib/bna/transcript-privacy');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
const publicHelperRetrieval = fs.readFileSync('src/lib/bna/public-helper-retrieval.js', 'utf8');

const RAW_PRIVATE_TEXT = 'Student seven privately asked for sensitive follow-up.';

const sampleSegments = [
  {
    segment_ref: 'general-approved',
    text: 'Approved general shiur segment.',
    normalized_text: 'Approved general shiur segment.',
    review_state: 'approved',
    privacy_class: 'provider_general',
    speaker_label: 'Rabbi',
    speaker_confidence: 0.97,
    match_confidence: 0.91,
  },
  {
    segment_ref: 'student-seven-private',
    text: RAW_PRIVATE_TEXT,
    review_state: 'approved',
    privacy_class: 'student_private',
    student_id: 7,
    match_method: 'roster_email',
    match_confidence: 0.94,
  },
  {
    segment_ref: 'parent-seven-visible',
    text: 'Parent-visible progress note.',
    review_state: 'rabbi_approved',
    privacy_class: 'parent_visible',
    student_id: 7,
    match_method: 'manual_review',
    match_confidence: 1,
  },
  {
    segment_ref: 'staff-private',
    text: 'Staff-only note.',
    review_state: 'approved',
    privacy_class: 'staff_private',
  },
  {
    segment_ref: 'raw-needs-review',
    text: 'Raw unreviewed transcript body.',
    review_state: 'raw',
    privacy_class: 'needs_review',
  },
  {
    segment_ref: 'excluded-segment',
    text: 'Excluded transcript body.',
    review_state: 'excluded',
    privacy_class: 'excluded',
  },
];

test('transcript privacy policy filters segments by audience without returning text', () => {
  const studentSeven = transcriptPrivacy.filterTranscriptSegmentsForAudience(sampleSegments, { role: 'student', student_id: 7 });
  const studentEight = transcriptPrivacy.filterTranscriptSegmentsForAudience(sampleSegments, { role: 'student', student_id: 8 });
  const parentSeven = transcriptPrivacy.filterTranscriptSegmentsForAudience(sampleSegments, { role: 'parent', student_id: 7 });
  const staff = transcriptPrivacy.filterTranscriptSegmentsForAudience(sampleSegments, { role: 'staff' });

  assert.equal(studentSeven.find((segment) => segment.segment_ref === 'student-seven-private').allowed, true);
  assert.equal(studentEight.find((segment) => segment.segment_ref === 'student-seven-private').allowed, false);
  assert.equal(parentSeven.find((segment) => segment.segment_ref === 'parent-seven-visible').allowed, true);
  assert.equal(parentSeven.find((segment) => segment.segment_ref === 'student-seven-private').allowed, false);
  assert.equal(staff.find((segment) => segment.segment_ref === 'staff-private').allowed, true);
  assert.equal(staff.find((segment) => segment.segment_ref === 'raw-needs-review').allowed, true);
  assert.equal(staff.find((segment) => segment.segment_ref === 'excluded-segment').allowed, false);

  [studentSeven, studentEight, parentSeven, staff].flat().forEach((segment) => {
    assert.equal(segment.text_returned, false);
  });
  assert.doesNotMatch(JSON.stringify(studentSeven), /Student seven privately asked/);
  assert.doesNotMatch(JSON.stringify(staff), /Staff-only note/);
});

test('knowledge retrieval policy blocks raw dumps and cross-student leakage', () => {
  const publicPolicy = transcriptPrivacy.buildTranscriptKnowledgeRetrievalPolicy({
    segments: sampleSegments,
    audience: { role: 'public' },
  });
  const studentEightPolicy = transcriptPrivacy.buildTranscriptKnowledgeRetrievalPolicy({
    segments: sampleSegments,
    audience: { role: 'student', student_id: 8 },
  });

  assert.equal(publicPolicy.requirement_id, 'REQ-20260619-309');
  assert.equal(publicPolicy.preview_only, true);
  assert.equal(publicPolicy.external_write_performed, false);
  assert.equal(publicPolicy.production_mutation_performed, false);
  assert.equal(publicPolicy.raw_unreviewed_transcripts_allowed, false);
  assert.equal(publicPolicy.public_helper_raw_transcript_rag_allowed, false);
  assert.equal(publicPolicy.summary.allowed_segments, 1);
  assert.equal(publicPolicy.allowed_segments[0].segment_ref, 'general-approved');
  assert.equal(studentEightPolicy.allowed_segments.some((segment) => segment.segment_ref === 'student-seven-private'), false);
  assert.equal(studentEightPolicy.blocked_segments.some((segment) => segment.reason === 'student_scope_mismatch'), true);
  assert.doesNotMatch(JSON.stringify(publicPolicy), /Raw unreviewed transcript body/);
  assert.doesNotMatch(JSON.stringify(studentEightPolicy), /Student seven privately asked/);
});

test('transcript privacy readiness covers REQ-20260619-309 sections and gates', () => {
  const readiness = transcriptPrivacy.buildTranscriptPrivacyReadiness({
    classes: [{ id: 88, package_status: 'review', transcript_text: 'Class transcript draft.' }],
    segments: sampleSegments,
    example_student_id: 7,
  });

  assert.equal(readiness.requirement_id, 'REQ-20260619-309');
  assert.equal(readiness.status, 'needs_operator_decision');
  assert.equal(readiness.preview_only, true);
  assert.equal(readiness.external_write_performed, false);
  assert.equal(readiness.production_mutation_performed, false);
  assert.equal(Object.values(readiness.gates).every((value) => value === false), true);
  assert.deepEqual(
    readiness.sections.map((section) => section.key),
    [
      'version_model',
      'segments_speakers_confidence',
      'privacy_classes',
      'student_matching',
      'retrieval_boundaries',
      'public_helper_guardrails',
      'audit_release',
    ]
  );
  assert.equal(readiness.summary.classes_seen, 1);
  assert.equal(readiness.summary.segments_seen, sampleSegments.length);
  assert.equal(readiness.summary.privacy_counts.student_private, 1);
  assert.equal(readiness.summary.privacy_counts.parent_visible, 1);
  assert.equal(readiness.summary.needs_review_segments, 1);
  assert.equal(readiness.retrieval_examples.public.allowed_segments, 1);
  assert.match(readiness.blockers.join(' '), /Production public privacy smoke/);
  assert.doesNotMatch(JSON.stringify(readiness), /Student seven privately asked/);
});

test('server exposes protected transcript privacy readiness while member-safe classroom data blanks transcripts', () => {
  [
    "app.get('/api/bna/one-time/transcript-privacy', requireAdmin",
    'buildTranscriptPrivacyReadiness',
    'raw_transcript_text_returned: false',
    "routePath === '/api/bna/one-time/transcript-privacy' && method === 'GET'",
    "transcript_text: memberSafe ? '' : session.transcript_text",
    "transcript_notes: memberSafe ? '' : session.transcript_notes",
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('Operations One Time Library shows no-write transcript privacy readiness', () => {
  assert.match(operations, /renderOneTimeTranscriptPrivacyReadinessPanel/);
  assert.match(operations, /data-one-time-transcript-privacy-readiness/);
  assert.match(operations, /Transcript Privacy \/ Knowledge Scope/);
  assert.match(operations, /REQ-20260619-309/);
  assert.match(operations, /No raw unreviewed transcript, staff-private note, student-private segment, cross-student question\/feedback, or public helper raw transcript dump is exposed by this panel/);
  assert.match(operations, /Student and parent views can only resolve their own approved private segments/);
});

test('route registry and public helper retrieval keep transcript privacy scoped', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  const row = routes.get('/api/bna/one-time/transcript-privacy');
  assert.ok(row, 'transcript privacy route should be registered');
  assert.equal(row.access, 'private');
  assert.equal(row.public_allowed, false);
  assert.equal(row.privacy_risk, 'critical');
  assert.match(row.security_expectation, /no raw transcript body/i);
  assert.match(row.security_expectation, /cross-student\/private retrieval remains blocked/i);
  assert.match(publicHelperRetrieval, /SAFE_TRANSCRIPT_STATUSES/);
  assert.match(publicHelperRetrieval, /bounded retrieval, not exhaustive transcript training/);
  assert.match(publicHelperRetrieval, /needs_approval/);
  assert.match(publicHelperRetrieval, /archived/);
});
