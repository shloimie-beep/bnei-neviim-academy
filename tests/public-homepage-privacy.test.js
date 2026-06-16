const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(repoRoot, 'public', 'index.html'), 'utf8');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');

const publicTorahStudentNames = [
  'Huda Weber',
  'Hillel Baraka',
  'Menachem Mendel Dratler',
  'Eitan Chaim Golombo',
  'Amitai Kosofsky',
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceBetween(source, startPattern, endPattern) {
  const startIndex = source.search(startPattern);
  assert.notEqual(startIndex, -1, `missing start pattern: ${startPattern}`);
  const tail = source.slice(startIndex);
  const endIndex = tail.search(endPattern);
  assert.notEqual(endIndex, -1, `missing end pattern after ${startPattern}: ${endPattern}`);
  return tail.slice(0, endIndex);
}

test('public homepage Torah progress fallback is aggregate and anonymous', () => {
  for (const name of publicTorahStudentNames) {
    assert.doesNotMatch(homepage, new RegExp(escapeRegExp(name)));
  }

  assert.match(homepage, /torahGoalFallbackMetrics/);
  assert.match(homepage, /Class trip progress/);
  assert.match(homepage, /Current public range/);
  assert.match(homepage, /anonymous low-to-high trip progress, no student names/);
  assert.match(homepage, /aggregate class progress and anonymous range/);
  assert.match(homepage, /normalizeTorahGoalMetrics/);
  assert.match(homepage, /torahGoalPublicMetricCards/);

  assert.doesNotMatch(homepage, /torahGoalFallbackStudents/);
  assert.doesNotMatch(homepage, /\bstudentName\b/);
  assert.doesNotMatch(homepage, /student\.name/);
  assert.doesNotMatch(homepage, /each boy's cumulative progress/);
  assert.doesNotMatch(homepage, /No students are being shown/);
});

test('public Torah summary endpoint strips per-student records before JSON response', () => {
  const routeSource = sourceBetween(
    server,
    /app\.get\('\/api\/torah-learning\/public-summary'/,
    /app\.get\('\/api\/student-portal'/
  );
  const serializerSource = sourceBetween(
    server,
    /function buildPublicTorahLearningSummary/,
    /function buildGreenInvoiceHeaderSnapshot/
  );

  assert.match(routeSource, /buildPublicTorahLearningSummary\(summary\)/);
  assert.doesNotMatch(routeSource, /name:\s*student\.name/);
  assert.doesNotMatch(routeSource, /students\.map\(\(student\)/);

  assert.match(serializerSource, /metrics:/);
  assert.match(serializerSource, /minPercentage/);
  assert.match(serializerSource, /maxPercentage/);
  assert.match(serializerSource, /students:\s*\[\]/);
  assert.doesNotMatch(serializerSource, /name:\s*item\.name/);
  assert.doesNotMatch(serializerSource, /parent_name/);
  assert.doesNotMatch(serializerSource, /goal_minutes/);
});
