const assert = require('node:assert/strict');
const test = require('node:test');

test('Hebrew RTL label audit passes across parent, student, signup, and provider entry surfaces', async () => {
  const { auditSurfaces } = await import('../scripts/audit-hebrew-rtl-ui-labels.mjs');
  const report = auditSurfaces();
  assert.equal(report.success, true, JSON.stringify(report.findings, null, 2));
  assert.deepEqual(
    report.surfaces.map((surface) => surface.id),
    ['parent-portal', 'student-portal', 'signup-he', 'public-provider-navigation', 'provider-portal'],
  );
});
