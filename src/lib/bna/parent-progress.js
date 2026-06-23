const { parentVisibleGamificationEvents, summarizeGamificationEvents } = require('./gamification');

function numericIds(values = []) {
  return (Array.isArray(values) ? values : [])
    .map(Number)
    .filter(Number.isFinite);
}

function parentLinkedStudentIds(context = {}) {
  const explicit = numericIds(context.linked_student_ids || context.linkedStudentIds);
  const rows = numericIds((context.links || []).map((row) => row.student_id || row.studentId));
  const students = numericIds((context.students || []).map((row) => row.id || row.student_id));
  return [...new Set([...explicit, ...rows, ...students])];
}

function parentCanAccessStudent(context = {}, studentId) {
  const wanted = Number(studentId);
  if (!Number.isFinite(wanted)) return false;
  return parentLinkedStudentIds(context).includes(wanted);
}

function approvedParentVisibleRows(rows = []) {
  return (Array.isArray(rows) ? rows : []).filter((row) => (
    row &&
    row.parent_visible === true &&
    String(row.approval_status || '').toLowerCase() === 'approved'
  ));
}

function worksheetSubmissionsVisibleToParent(rows = []) {
  return approvedParentVisibleRows(rows).filter((row) => !['draft', 'archived'].includes(String(row.status || '').toLowerCase()));
}

function buildParentProgressSummary({
  student = {},
  gamificationEvents = [],
  references = [],
  worksheetSubmissions = [],
  reports = [],
} = {}) {
  const visibleEvents = parentVisibleGamificationEvents(gamificationEvents);
  const visibleReferences = approvedParentVisibleRows(references);
  const visibleWorksheets = worksheetSubmissionsVisibleToParent(worksheetSubmissions);
  const visibleReports = approvedParentVisibleRows(reports);
  const points = summarizeGamificationEvents(visibleEvents);
  return {
    student_id: student.id || null,
    student_name: student.name || student.student_name || '',
    total_points: points.total_points,
    event_count: points.event_count,
    events_by_type: points.by_type,
    shoutout_count: visibleReferences.length,
    worksheet_count: visibleWorksheets.length,
    latest_report: visibleReports[0] || null,
  };
}

module.exports = {
  approvedParentVisibleRows,
  buildParentProgressSummary,
  parentCanAccessStudent,
  parentLinkedStudentIds,
  worksheetSubmissionsVisibleToParent,
};
