const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Contacts signup review lane excludes completed and signed-up records', () => {
  assert.match(operations, /const SIGNUP_REVIEW_STATUSES = new Set\(/);
  assert.match(operations, /const SIGNUP_SIGNED_UP_STATUSES = new Set\(/);
  assert.match(operations, /function signupHasCompletedRegistration\(signup\)/);
  assert.match(operations, /function signupIsSignedUpContact\(signup\)/);
  assert.match(operations, /normalizePaymentStatusKey\(signup\.payment_status\) === 'paid'/);
  assert.match(operations, /Boolean\(linkedStudentForSignup\(signup\)\)/);
  assert.match(operations, /signupHasCompletedRegistration\(signup\)/);
  assert.match(operations, /if \(signupIsSignedUpContact\(signup\)\) return false;/);
  assert.match(operations, /if \(section === 'intake'\) return signupNeedsIntakeReview\(signup\);/);
  assert.doesNotMatch(operations, /if \(section === 'intake'\) return \['new', 'contacted', 'interview_scheduled'\]\.includes\(status\) \|\| missingContact;/);
});

test('Contacts copy separates signed-up families from interested prospects', () => {
  assert.match(operations, /\{ id: 'intake', label: 'Signup Review' \}/);
  assert.match(operations, /title: 'Signup Review'/);
  assert.match(operations, /Signed-up families live in Contacts\/Students; prospects live in Leads \/ Interested Parents\./);
  assert.match(operations, /No signup records need review\. Signed-up families are in Contacts\/Students; prospects stay in Leads \/ Interested Parents\./);
});

test('Task proof links accept live smoke reports and registers', () => {
  assert.match(server, /'ops\/live-smokes\/'/);
  assert.match(server, /'tasks-pending\/'/);
  assert.match(server, /ops\\\/live-smokes\|tasks-pending/);
});
