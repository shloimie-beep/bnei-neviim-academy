const assert = require('node:assert/strict');
const test = require('node:test');

const {
  approvedParentVisibleRows,
  buildParentProgressSummary,
  parentCanAccessStudent,
  parentLinkedStudentIds,
  worksheetSubmissionsVisibleToParent,
} = require('../src/lib/bna/parent-progress');

test('parent access is derived from explicit linked student ids', () => {
  const context = {
    links: [
      { student_id: 10 },
      { studentId: 11 },
    ],
  };
  assert.deepEqual(parentLinkedStudentIds(context), [10, 11]);
  assert.equal(parentCanAccessStudent(context, 10), true);
  assert.equal(parentCanAccessStudent(context, 99), false);
});

test('parent-visible rows require approval and explicit visibility', () => {
  const rows = [
    { id: 1, parent_visible: true, approval_status: 'approved' },
    { id: 2, parent_visible: true, approval_status: 'pending' },
    { id: 3, parent_visible: false, approval_status: 'approved' },
  ];
  assert.deepEqual(approvedParentVisibleRows(rows).map((row) => row.id), [1]);
});

test('worksheet submissions hide drafts and unapproved work from parents', () => {
  const rows = [
    { id: 1, status: 'submitted', parent_visible: true, approval_status: 'approved' },
    { id: 2, status: 'draft', parent_visible: true, approval_status: 'approved' },
    { id: 3, status: 'reviewed', parent_visible: true, approval_status: 'pending' },
  ];
  assert.deepEqual(worksheetSubmissionsVisibleToParent(rows).map((row) => row.id), [1]);
});

test('parent progress summary uses only approved parent-visible source data', () => {
  const summary = buildParentProgressSummary({
    student: { id: 7, name: 'Student One' },
    gamificationEvents: [
      { event_type: 'shoutout_received', points: 10, parent_visible: true, approval_status: 'approved' },
      { event_type: 'ask_question', points: 5, parent_visible: true, approval_status: 'pending' },
    ],
    references: [
      { id: 1, parent_visible: true, approval_status: 'approved' },
      { id: 2, parent_visible: false, approval_status: 'approved' },
    ],
    worksheetSubmissions: [
      { id: 1, status: 'submitted', parent_visible: true, approval_status: 'approved' },
      { id: 2, status: 'submitted', parent_visible: true, approval_status: 'pending' },
    ],
    reports: [
      { id: 3, parent_visible: true, approval_status: 'approved' },
    ],
  });
  assert.equal(summary.student_id, 7);
  assert.equal(summary.total_points, 10);
  assert.equal(summary.event_count, 1);
  assert.equal(summary.shoutout_count, 1);
  assert.equal(summary.worksheet_count, 1);
  assert.equal(summary.latest_report.id, 3);
});
