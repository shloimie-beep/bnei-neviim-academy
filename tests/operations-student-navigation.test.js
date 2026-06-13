const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const shellCss = fs.readFileSync('public/css/bna-app-shell.css', 'utf8');

test('Students list uses compact rows before opening a student workspace', () => {
  assert.match(operations, /function renderStudentListRow/);
  assert.match(operations, /class="student-row-list"/);
  assert.match(operations, /class="student-row \$\{String\(state\.selectedStudent\?\.id\)/);
  assert.match(operations, /function renderStudentWorkspaceNav/);
  assert.match(operations, /Back to student list/);
  assert.match(operations, /function openStudentList/);
  assert.match(operations, /url\.searchParams\.delete\('student'\)/);
});

test('Student detail side panel keeps section navigation and an explicit Back action', () => {
  assert.match(operations, /function renderStudentDetailSidebar/);
  assert.match(operations, /renderPersonSectionMenu/);
  assert.match(operations, /class="student-picker-back"/);
  assert.match(operations, /onclick="openStudentList\(\)">Back to student list/);
  assert.match(operations, /STUDENT_DETAIL_SECTIONS/);
  assert.match(operations, /Profile/);
  assert.match(operations, /Assignments/);
  assert.match(operations, /Calendar/);
  assert.match(operations, /Meetings/);
  assert.match(operations, /Portal Links/);
});

test('mobile hamburger opens a full navigation page instead of a blocking overlay drawer', () => {
  assert.match(operations, /class="ops-sidebar-back" onclick="closeNavDrawer\(\)">Back/);
  assert.match(operations, /\.ops-app-shell\.drawer-open \.ops-main\s*{[\s\S]*display:\s*none/);
  assert.match(operations, /\.ops-drawer-backdrop\s*{[\s\S]*display:\s*none !important/);
  assert.match(operations, /\.ops-app-shell\.drawer-open \.ops-sidebar\s*{[\s\S]*display:\s*block/);
  assert.doesNotMatch(operations, /\.ops-app-shell\.drawer-open \.ops-sidebar\s*{[\s\S]{0,120}transform:\s*translateX\(0\)/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.ops-app-shell\.drawer-open \.ops-sidebar\s*{[\s\S]*width:\s*100vw/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.ops-app-shell\.drawer-open \.ops-main,[\s\S]*display:\s*none !important/);
});
