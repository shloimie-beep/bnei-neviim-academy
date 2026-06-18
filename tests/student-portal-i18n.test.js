const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function objectBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

function labelKeys(block) {
  return [...block.matchAll(/^\s+([a-zA-Z][a-zA-Z0-9]*):/gm)]
    .map((match) => match[1])
    .filter((key) => !['en', 'he'].includes(key));
}

test('Student portal Hebrew mode has complete labels and RTL behavior', () => {
  const student = read('public/student.html');
  const enBlock = objectBlock(student, '            en: {', '            he: {');
  const heBlock = objectBlock(student, '            he: {', '        const DEVICE_ACCESS_LABELS');
  const enKeys = new Set(labelKeys(enBlock));
  const heKeys = new Set(labelKeys(heBlock));
  const missingHebrewKeys = [...enKeys].filter((key) => !heKeys.has(key));

  assert.deepEqual(missingHebrewKeys, []);
  assert.match(student, /document\.documentElement\.lang = language;/);
  assert.match(student, /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr';/);
  assert.match(student, /html\[dir="rtl"\] body/);
  assert.match(student, /html\[dir="rtl"\] \.progress-fill/);
  assert.match(student, /html\[dir="rtl"\] #accessCode/);
  assert.match(student, /date\.toLocaleString\(language === 'he' \? 'he-IL' : 'en-GB'/);
});

test('Student portal dynamic cards route visible copy through localization helpers', () => {
  const student = read('public/student.html');
  const renderGoalBlock = objectBlock(
    student,
    '        function renderGoal(goal) {',
    '        function renderDeviceAccessSummary(access) {',
  );
  const commandGridBlock = objectBlock(
    student,
    '        function renderPortalCommandGrid(data, goals) {',
    '        function renderPortal(data) {',
  );

  assert.doesNotMatch(renderGoalBlock, /Agreement:<\/strong> in bed by/);
  assert.doesNotMatch(renderGoalBlock, /After honest checkoff:<\/strong> tablet access opens/);
  assert.doesNotMatch(renderGoalBlock, /Chosen rule:<\/strong>/);
  assert.match(renderGoalBlock, /t\('agreement'\)/);
  assert.match(renderGoalBlock, /t\('afterCheckoff'\)/);
  assert.match(renderGoalBlock, /t\('chosenRule'\)/);

  assert.doesNotMatch(commandGridBlock, /<div class="portal-command-label">My Agreement<\/div>/);
  assert.doesNotMatch(commandGridBlock, /Use the buttons below when you are ready\./);
  assert.doesNotMatch(commandGridBlock, /After a successful checkoff, access opens for/);
  assert.doesNotMatch(commandGridBlock, /Today is \$\{todayPercent\}%/);
  assert.match(commandGridBlock, /t\('myAgreement'\)/);
  assert.match(commandGridBlock, /t\('checkOff'\)/);
  assert.match(commandGridBlock, /t\('tabletAccessCard'\)/);
  assert.match(commandGridBlock, /t\('torahTrip'\)/);
});

test('Student portal localizes tablet access statuses and save messages', () => {
  const student = read('public/student.html');
  const accessLabelsBlock = objectBlock(student, '        const DEVICE_ACCESS_LABELS = {', '        const els = {');

  assert.match(accessLabelsBlock, /temporary_open: 'Temporary open'/);
  assert.match(accessLabelsBlock, /temporary_open: 'פתוח זמנית'/);
  assert.match(student, /function accessStatusLabel\(access\)/);
  assert.match(student, /const statusLabel = accessStatusLabel\(access\);/);
  assert.match(student, /const accessLabel = accessStatusLabel\(access\);/);
  assert.match(student, /setSaveState\(`\$\{t\('savedAccessOpened'\)\}/);
  assert.match(student, /setSaveState\(t\('savedNoDevice'\), true\);/);
  assert.match(student, /setSaveState\(error\.message \|\| t\('couldNotSaveCheckoff'\), true\);/);
});
