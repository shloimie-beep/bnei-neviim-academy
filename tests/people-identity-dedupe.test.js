const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  buildStudentAliases,
  buildNormalizedStudentNames,
  scoreStudentIdentityCandidate,
  evidenceLabels,
} = require('../src/lib/bna/student-identity-dedupe');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const operations = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
const legacySubmit = fs.readFileSync(path.join(root, 'public', 'api', 'submit.js'), 'utf8');

test('Menachem bilingual aliases normalize into one identity candidate set', () => {
  const aliases = buildStudentAliases({ name: 'Menachem Mendel Dratler' });
  assert.ok(aliases.includes('Menachem Mendel Dratler'));
  assert.ok(aliases.includes('\u05de\u05e0\u05d7\u05dd'));
  assert.ok(buildNormalizedStudentNames({ name: '\u05de\u05e0\u05d7\u05dd' }).length >= 1);
});

test('same parent contact plus known Hebrew alias is high confidence', () => {
  const scored = scoreStudentIdentityCandidate(
    { id: 2, name: '\u05de\u05e0\u05d7\u05dd', parent_phone: '054-123-4567' },
    { name: 'Menachem Mendel Dratler', parent_phone: '+972 54 123 4567' }
  );
  assert.ok(scored.confidence >= 90);
  assert.ok(scored.safe_auto_match);
  assert.ok(evidenceLabels(scored.evidence).includes('known Hebrew/English alias'));
});

test('name-only bilingual and conflicting parent evidence require review', () => {
  const nameOnly = scoreStudentIdentityCandidate(
    { id: 2, name: '\u05de\u05e0\u05d7\u05dd' },
    { name: 'Menachem' }
  );
  assert.ok(nameOnly.confidence >= 55 && nameOnly.confidence < 90);
  assert.equal(nameOnly.safe_auto_match, false);

  const conflict = scoreStudentIdentityCandidate(
    { id: 2, name: '\u05de\u05e0\u05d7\u05dd', parent_phone: '0501112222' },
    { name: 'Menachem', parent_phone: '0509998888' }
  );
  assert.ok(conflict.confidence < 60);
  assert.equal(conflict.safe_auto_match, false);
  assert.ok(evidenceLabels(conflict.evidence).includes('conflicting parent phone'));
});

test('server exposes student identity schema, review APIs, safe merge, and signup guardrails', () => {
  [
    'ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS canonical_display_name',
    'ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS aliases TEXT[]',
    'ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS archived_duplicate_of',
    'ALTER TABLE signups ADD COLUMN IF NOT EXISTS canonical_student_id',
    'CREATE TABLE IF NOT EXISTS bna_identity_review_tasks',
    'CREATE TABLE IF NOT EXISTS bna_student_merge_events',
    'async function resolveStudentIdentity',
    'async function mergeStudentsSafely',
    "app.get('/api/bna/identity/duplicates'",
    "app.post('/api/bna/identity/scan'",
    "app.get('/api/bna/students/:id/identity'",
    "app.post('/api/bna/identity/reviews/:id/approve-merge'",
    "app.post('/api/bna/identity/reviews/:id/reject'",
    "app.post('/api/bna/identity/reviews/:id/block'",
    "identityReviewRequired",
    "student-merge:",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
});

test('Operations exposes student identity review controls without touching public student portal', () => {
  [
    'Identity Review',
    'scanStudentIdentityDuplicates',
    'approveStudentIdentityMerge',
    'rejectStudentIdentityReview',
    'blockStudentIdentityReview',
    'renderStudentIdentityProfileSection',
    'evidence_chips',
  ].forEach((needle) => assert.ok(operations.includes(needle), needle));
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'public', 'student.html'), 'utf8'), /identity_review|source_records|merge_history|aliases/);
});

test('legacy serverless signup handler is disabled instead of writing duplicate schema', () => {
  assert.match(legacySubmit, /Obsolete serverless signup handler/);
  assert.match(legacySubmit, /status\(410\)/);
  assert.doesNotMatch(legacySubmit, /INSERT INTO signups/);
});
