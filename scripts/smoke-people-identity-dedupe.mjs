import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildStudentAliases,
  scoreStudentIdentityCandidate,
  evidenceLabels,
} = require('../src/lib/bna/student-identity-dedupe');

function scenario(label, fn) {
  try {
    fn();
    console.log(`ok - ${label}`);
  } catch (error) {
    console.error(`not ok - ${label}`);
    throw error;
  }
}

scenario('safe Hebrew/English Menachem alias with same parent phone', () => {
  const scored = scoreStudentIdentityCandidate(
    { id: 2, name: '\u05de\u05e0\u05d7\u05dd', parent_phone: '054-123-4567' },
    { name: 'Menachem Mendel Dratler', parent_phone: '+972 54 123 4567' }
  );
  assert.ok(scored.confidence >= 90);
  assert.equal(scored.safe_auto_match, true);
});

scenario('ambiguous name-only Hebrew/English Menachem remains review-only', () => {
  const scored = scoreStudentIdentityCandidate(
    { id: 2, name: '\u05de\u05e0\u05d7\u05dd' },
    { name: 'Menachem' }
  );
  assert.ok(scored.confidence >= 55 && scored.confidence < 90);
  assert.equal(scored.safe_auto_match, false);
});

scenario('conflicting parent contact blocks automatic merge', () => {
  const scored = scoreStudentIdentityCandidate(
    { id: 2, name: '\u05de\u05e0\u05d7\u05dd', parent_email: 'a@example.test' },
    { name: 'Menachem', parent_email: 'b@example.test' }
  );
  assert.ok(scored.confidence < 60);
  assert.ok(evidenceLabels(scored.evidence).includes('conflicting parent email'));
});

scenario('Menachem aliases preserve Hebrew and English labels', () => {
  const aliases = buildStudentAliases({ name: 'Menachem Mendel Dratler' });
  assert.ok(aliases.includes('Menachem Mendel Dratler'));
  assert.ok(aliases.includes('\u05de\u05e0\u05d7\u05dd'));
});
