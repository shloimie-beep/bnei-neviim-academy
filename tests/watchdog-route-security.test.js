const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('route security watchdog fails private route marked public', async () => {
  const { buildRouteSecurityAudit } = await import('../scripts/watchdog-security-routes.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-route-audit-'));
  const routeRegistryPath = path.join(dir, 'routes.json');
  const serverPath = path.join(dir, 'server.js');
  fs.writeFileSync(routeRegistryPath, JSON.stringify({
    routes: [{
      route: '/operations',
      access: 'private',
      public_allowed: true,
      expected_logged_out_behavior: 'load dashboard',
      privacy_risk: 'critical',
      related_goal_ids: [],
    }],
  }));
  fs.writeFileSync(serverPath, 'function requireAdmin() {}');
  const audit = buildRouteSecurityAudit({ routeRegistryPath, serverPath });
  assert.equal(audit.ok, false);
  assert.ok(audit.findings.some((finding) => /marked public_allowed/.test(finding.title)));
});

test('route registry includes helper and intake APIs as private routes', () => {
  const registry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const byRoute = new Map(registry.routes.map((route) => [route.route, route]));
  assert.equal(byRoute.get('/api/bna/helper/execute').access, 'private');
  assert.equal(byRoute.get('/api/bna/intake/parse').public_allowed, false);
});
