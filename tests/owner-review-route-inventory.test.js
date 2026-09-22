const assert = require('node:assert/strict');
const test = require('node:test');

test('owner-review route inventory discovers full app surfaces, not only watchdog sample pages', async () => {
  const { buildOwnerReviewRouteInventory } = await import('../scripts/generate-owner-review-route-inventory.mjs');
  const report = buildOwnerReviewRouteInventory({ write: false });
  const routes = new Set(report.rows.map((row) => row['Canonical URL']));
  const discovered = (route) => report.rows.find((row) => row['Canonical URL'] === route)?.['Discovered as'] || '';

  assert.ok(report.summary.html_pages >= 25, 'inventory should scan every public HTML page');
  assert.ok(report.summary.server_routes >= 100, 'inventory should include server UI and API routes');
  assert.ok(report.summary.linked_destinations >= 50, 'inventory should include discovered navigation destinations');
  assert.ok(report.summary.manifest_edges >= 3, 'inventory should include PWA manifest start/scope routes');
  assert.ok(report.summary.service_worker_edges >= 5, 'inventory should include service-worker cached/private routes');

  for (const route of ['/', '/parent', '/student', '/provider', '/rabbi-member', '/member-library', '/one-time-classroom']) {
    assert.ok(routes.has(route), `${route} should be inventoried`);
  }

  assert.match(discovered('/one-time-classroom'), /server-get|literal-a-href|service-worker/);
  assert.match(discovered('/api/member-library'), /fetch|server-get/);
  assert.match(discovered('/operations'), /server-get|manifest:start_url|service-worker/);
});
