const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const ghlBna = fs.readFileSync('src/lib/ghl/bna.ts', 'utf8');
const signupSync = fs.readFileSync('scripts/sync-signups-to-ghl.mjs', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const repairScript = fs.readFileSync('scripts/repair-bna-contact-roles.mjs', 'utf8');
const whapiSync = fs.readFileSync('scripts/sync-whapi-history.mjs', 'utf8');

test('GHL student sync no longer reuses parent email or phone as student identity', () => {
  assert.match(ghlBna, /function studentIdentityEmail/);
  assert.match(ghlBna, /bna-student-\$\{slug\}@bna-student\.invalid/);
  assert.doesNotMatch(ghlBna, /email:\s*data\.parent1Email,\s*\/\/ Use parent's email/);
  assert.doesNotMatch(ghlBna, /phone:\s*data\.parent1Phone,\s*\/\/ Use parent's phone/);

  assert.match(signupSync, /function studentIdentityEmailForSignup/);
  assert.match(signupSync, /email:\s*studentIdentityEmailForSignup\(signup\)/);
  assert.doesNotMatch(signupSync, /email:\s*signup\.parent1_email,\s*\n\s*phone:\s*signup\.parent1_phone/);

  assert.match(server, /function syntheticGhlStudentEmail/);
  assert.match(server, /bna-student-\$\{slug\}@bna-student\.invalid/);
  assert.doesNotMatch(server, /\$\{studentFirst\.toLowerCase\(\)\}@bna\.student/);
});

test('contact role repair script is dry-run first and audits known students, collisions, and phone-only contacts', () => {
  assert.match(repairScript, /argv\.includes\('--apply'\)/);
  assert.match(repairScript, /argv\.includes\('--apply-ghl'\)/);
  assert.match(repairScript, /findKnownStudents/);
  assert.match(repairScript, /hillel/);
  assert.match(repairScript, /menachem/);
  assert.match(repairScript, /findSignupGhlCollisions/);
  assert.match(repairScript, /findPhoneOnlyWapiContacts/);
  assert.match(repairScript, /findResolvablePhoneOnlyContacts/);
  assert.match(repairScript, /Dry-run only/);
  assert.match(repairScript, /applyInternalStudentTagRepair/);
});

test('Whapi imports prefer resolved contact names before phone fallbacks', () => {
  assert.match(whapiSync, /matched_name/);
  assert.match(whapiSync, /match\.matched_name/);
});
