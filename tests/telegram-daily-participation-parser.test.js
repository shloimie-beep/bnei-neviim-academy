const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadParser() {
  const bridge = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'telegram-kimi-bridge.mjs'), 'utf8');
  const start = bridge.indexOf('function normalizeStudentLookupText');
  const end = bridge.indexOf('function isLikelyStudentAccountabilityUnit', start);
  assert.ok(start > 0 && end > start, 'Telegram participation parser slice should be found');
  const sandbox = { Intl, Date, result: null };
  vm.runInNewContext(`${bridge.slice(start, end)}
result = { parseTelegramDailyTorahParticipation, hasTelegramDailyTorahParticipationIntent };`, sandbox);
  return sandbox.result;
}

const students = [
  { id: 101, name: 'Amitai Sample', project_id: 1, tags: ['student', 'bna'] },
  { id: 102, name: 'Eitan Sample', project_id: 1, tags: ['student', 'bna'] },
  { id: 103, name: 'Hillel Sample', project_id: 1, tags: ['student', 'bna'] },
  { id: 104, name: 'Huda Sample', project_id: 1, tags: ['student', 'bna'] },
  { id: 105, name: 'Menachem Sample', project_id: 1, tags: ['student', 'bna'] },
  { id: 106, name: 'External Sample', project_id: 1, tags: ['external-accountability', 'not-bna-school'] },
  { id: 107, name: 'Huda Duplicate Sample', project_id: 100164, tags: ['student'] },
];

test('Telegram daily Torah participation parser applies default and latest named corrections', () => {
  const { parseTelegramDailyTorahParticipation } = loadParser();
  const text = [
    'calculate the grades based on the participation whether I said they did 50% or 100%',
    "the status quo without updating is that they're there and they did 100%",
    'in regards to yesterday eitan got zero and he was there',
    'Menachem came late and he got half Hooda hello got half Hillel got half',
    'oh no eitan yesterday got full credit full credit and who to also got full credit',
  ].join(' ');

  const rows = parseTelegramDailyTorahParticipation(text, students, {
    now: new Date('2026-06-30T06:00:00Z'),
  });
  const byName = Object.fromEntries(rows.map((row) => [row.student.name, row]));

  assert.equal(rows.length, 5);
  assert.equal(byName['Amitai Sample'].percent, 100);
  assert.equal(byName['Amitai Sample'].default_rule_applied, true);
  assert.equal(byName['Eitan Sample'].percent, 100);
  assert.equal(byName['Huda Sample'].percent, 100);
  assert.equal(byName['Hillel Sample'].percent, 50);
  assert.equal(byName['Menachem Sample'].percent, 50);
  assert.equal(byName['Menachem Sample'].attendance_status, 'late');
  assert.equal(byName['Eitan Sample'].date, '2026-06-29');
  assert.equal(byName['Huda Duplicate Sample'], undefined);
  assert.equal(byName['External Sample'], undefined);
});

test('Telegram daily Torah participation parser does not fan out without an explicit default phrase', () => {
  const { parseTelegramDailyTorahParticipation, hasTelegramDailyTorahParticipationIntent } = loadParser();
  const text = 'Hillel got half and Menachem came late and got 50 percent today.';

  assert.equal(hasTelegramDailyTorahParticipationIntent(text), true);
  const rows = parseTelegramDailyTorahParticipation(text, students, {
    now: new Date('2026-06-30T06:00:00Z'),
  });

  assert.equal(rows.map((row) => row.student.name).sort().join('|'), 'Hillel Sample|Menachem Sample');
  assert.equal(rows.every((row) => row.default_rule_applied === false), true);
});
