const test = require('node:test');
const assert = require('node:assert/strict');

const {
  findStudentForParsedName,
  scoreStudentParsedNameMatch,
} = require('../src/lib/bna/student-match');

const students = [
  {
    id: 53986,
    name: 'Esti Dratler',
    notes: 'External accountability app/person. Dratler family; not an internal BNA school student.',
  },
  {
    id: 2800,
    name: 'Menachem Mendel Dratler',
    notes: 'Canonical BNA school student.',
  },
  {
    id: 100,
    name: 'Eitan Chaim Golombo',
    notes: 'Known misspelling Golambo appears in recordings.',
  },
];

test('full parsed student names beat shared family-name aliases', () => {
  assert.equal(
    findStudentForParsedName('Menachem Mendel Dratler', students)?.id,
    2800
  );
  assert.ok(
    scoreStudentParsedNameMatch('Menachem Mendel Dratler', students[1])
      > scoreStudentParsedNameMatch('Menachem Mendel Dratler', students[0])
  );
});

test('ambiguous surname-only references do not attach to the wrong student', () => {
  assert.equal(findStudentForParsedName('Dratler', students), null);
});

test('known Torah goal aliases still resolve', () => {
  assert.equal(findStudentForParsedName('Eitan Chaim Golambo', students)?.id, 100);
  assert.equal(findStudentForParsedName('Eitan', students)?.id, 100);
});
