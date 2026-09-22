const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const providerHtml = fs.readFileSync('public/provider.html', 'utf8');

function assertSharedPortalShell(html, label) {
  assert.match(html, /href="\/css\/bna-app-shell\.css"/, `${label} loads the shared shell CSS`);
  assert.match(html, /class="[^"]*\bbna-shell\b[^"]*\bbna-portal-page\b[^"]*"/, `${label} uses the shared portal body classes`);
  assert.match(html, /<header class="brand-topbar">/, `${label} renders the BNA brand topbar`);
  assert.match(html, /class="portal-topbar-actions"/, `${label} renders safe portal navigation actions`);
  assert.match(html, /class="portal-topbar-link" href="\//, `${label} links back to public BNA surfaces`);
}

test('parent, student, and provider portals use the shared BNA portal toolbar shell', () => {
  assertSharedPortalShell(parentHtml, 'parent portal');
  assertSharedPortalShell(studentHtml, 'student portal');
  assertSharedPortalShell(providerHtml, 'provider portal');
});

test('student portal renders overview before filters and long checkoff details', () => {
  const overviewIndex = studentHtml.indexOf('id="studentPanel"');
  const commandGridIndex = studentHtml.indexOf('id="portalCommandGrid"');
  const goalsIndex = studentHtml.indexOf('id="goalsSection"');
  const filterIndex = studentHtml.indexOf('id="goalStatusFilter"');
  const goalGridIndex = studentHtml.indexOf('id="goalGrid"');

  assert.ok(overviewIndex > -1, 'student overview panel exists');
  assert.ok(commandGridIndex > overviewIndex, 'overview command grid appears inside the overview panel');
  assert.ok(goalsIndex > commandGridIndex, 'goal checkoff section appears after the overview panel');
  assert.ok(filterIndex > goalsIndex, 'goal filters stay inside the later goal section');
  assert.ok(goalGridIndex > filterIndex, 'long goal details appear after filters');
});
