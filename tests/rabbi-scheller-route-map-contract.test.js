const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const routeMapPath = path.join(__dirname, '..', 'ops', 'audits', '2026-06-23-rabbi-scheller-route-map.json');

function loadRouteMap() {
  return JSON.parse(fs.readFileSync(routeMapPath, 'utf8'));
}

test('Rabbi Scheller route map includes portal aliases, auth entries, and Operations deep links', () => {
  const routeMap = loadRouteMap();
  const routeKeys = new Set(routeMap.routes.map((route) => `${route.method} ${route.url_pattern}`));

  [
    'GET /operations',
    'GET /operations/agents/runs/:runKey',
    'GET /provider',
    'GET /provider/login',
    'GET /provider-dashboard',
    'GET /student',
    'GET /student/login',
    'GET /parent',
    'GET /parent/login',
    'GET /one-time-classroom',
    'GET /member-library',
    'POST /api/operations/login',
    'POST /api/provider-portal/login',
    'POST /api/student-portal/login',
    'POST /api/parent-portal/login',
    'GET /api/bna/one-time/classes',
    'GET /api/bna/rabbi/members',
    'GET /api/rabbi/member/library',
  ].forEach((routeKey) => assert.equal(routeKeys.has(routeKey), true, `missing route ${routeKey}`));

  assert.equal(routeMap.canonical_provider_workspace_key, 'rabbi_sheller_provider');
  assert.equal(routeMap.totals.public_or_page_routes >= 60, true);
  assert.equal(routeMap.totals.api_routes >= 600, true);
});

test('route map marks provider workspace route inventory as static until browser/live evidence exists', () => {
  const routeMap = loadRouteMap();
  const operationsRoute = routeMap.routes.find((route) => route.method === 'GET' && route.url_pattern === '/operations');
  const providerLogin = routeMap.routes.find((route) => route.method === 'GET' && route.url_pattern === '/provider/login');
  const providerApi = routeMap.routes.find((route) => route.method === 'POST' && route.url_pattern === '/api/provider-portal/login');

  assert.equal(operationsRoute.access, 'private_server_guarded');
  assert.equal(providerLogin.access, 'public_entry_auth');
  assert.equal(providerApi.access, 'public_entry_auth');
  assert.match(routeMap.scope, /Browser reachability, console, 404, and viewport claims require separate Playwright\/live smoke evidence/);
});
