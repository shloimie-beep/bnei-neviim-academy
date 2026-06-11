const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const providerParticipantHtml = fs.readFileSync('public/provider-participant.html', 'utf8');

function objectAssignBlock(source, objectName) {
  const start = source.indexOf(`Object.assign(${objectName}, {`);
  assert.notEqual(start, -1, `${objectName} block missing`);
  const end = source.indexOf('\n        });', start);
  assert.notEqual(end, -1, `${objectName} block end missing`);
  return source.slice(start, end);
}

test('parent portal has localized user-facing nav and calendar detail contract', () => {
  const parentHebrew = objectAssignBlock(parentHtml, 'strings.he');
  assert.doesNotMatch(parentHebrew, /home:\s*'Home'/);
  assert.doesNotMatch(parentHebrew, /myChildren:\s*'My Children'/);
  assert.doesNotMatch(parentHebrew, /providerIndex:\s*'Service Provider Index'/);
  assert.match(parentHtml, /document\.documentElement\.dataset\.language = language/);
  assert.match(parentHtml, /document\.body\.classList\.toggle\('lang-he'/);
  assert.match(parentHtml, /data-calendar-mode="month"/);
  assert.match(parentHtml, /data-calendar-mode="week"/);
  assert.match(parentHtml, /data-calendar-mode="list"/);
  assert.match(parentHtml, /data-calendar-event/);
  assert.match(parentHtml, /calendar-drawer/);
  assert.match(parentHtml, /googleCalendarStatus/);
  assert.match(parentHtml, /googleClassroomStatus/);
});

test('student workspace has localized Hebrew labels and agenda-first calendar contract', () => {
  const studentHebrew = studentHtml.slice(studentHtml.indexOf('he: {'), studentHtml.indexOf('\n            },\n        };', studentHtml.indexOf('he: {')));
  assert.doesNotMatch(studentHebrew, /calendarTitle:\s*'My Calendar'/);
  assert.doesNotMatch(studentHebrew, /documentsLinks:\s*'Documents \/ Links'/);
  assert.doesNotMatch(studentHebrew, /askHelper:\s*'Ask BNA Helper'/);
  assert.match(studentHtml, /studentCalendarViewMode = window\.matchMedia/);
  assert.match(studentHtml, /data-student-calendar-mode="month"/);
  assert.match(studentHtml, /data-student-calendar-mode="week"/);
  assert.match(studentHtml, /data-student-calendar-mode="list"/);
  assert.match(studentHtml, /data-student-calendar-event/);
  assert.match(studentHtml, /calendar-drawer/);
  assert.match(studentHtml, /googleSetupChecklist/);
});

test('provider participant portal stays separate from BNA school accountability nav', () => {
  assert.match(providerParticipantHtml, /Rabbi Sheller Programs/);
  assert.match(providerParticipantHtml, /Participant, not BNA school/);
  assert.match(providerParticipantHtml, /data-section="program"/);
  assert.match(providerParticipantHtml, /data-section="payment"/);
  assert.doesNotMatch(providerParticipantHtml, /data-section="goals"/);
  assert.doesNotMatch(providerParticipantHtml, /data-section="assignments"/);
  assert.doesNotMatch(providerParticipantHtml, /Student Workspace/);
});
