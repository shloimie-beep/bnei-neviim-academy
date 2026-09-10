const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'school-admin.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'css', 'school-admin.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public', 'js', 'school-admin.js'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

function gzipBytes(relativePath) {
  return zlib.gzipSync(fs.readFileSync(path.join(root, relativePath))).length;
}

test('School admin route is private and serves the focused shell', () => {
  assert.match(server, /function sendSchoolAdminShell\(req, res\) \{/);
  assert.match(server, /res\.sendFile\(path\.join\(__dirname, 'public', 'school-admin\.html'\)\)/);
  assert.match(server, /app\.get\('\/operations\/school', requireAdmin, sendSchoolAdminShell\);/);
  assert.match(server, /routePath === '\/operations\/school'/);

  const route = routeRegistry.routes.find((row) => row.route === '/operations/school');
  assert.ok(route, 'route registry row exists');
  assert.equal(route.access, 'private');
  assert.equal(route.public_allowed, false);
  assert.match(route.security_expectation, /must not preload Control Plane, provider marketplace, One Time/);
});

test('School admin shell excludes the heavy Operations and provider runtimes', () => {
  assert.match(html, /\/css\/school-admin\.css/);
  assert.match(html, /\/js\/school-admin\.js/);
  assert.doesNotMatch(html, /operations-shell|operations-deferred-renderers|one-time|provider\.html|bna-bot-widget/i);
  assert.doesNotMatch(js, /operations-shell|operations-deferred-renderers|\/api\/bna\/one-time|\/api\/bna\/service-providers|\/api\/bna\/studio|\/api\/bna\/integrations/i);
  assert.doesNotMatch(css, /operations-shell|one-time|provider/i);
});

test('School admin API is bounded, masked, no-store, and BNA scoped', () => {
  const route = sliceBetween(server, 'const SCHOOL_ADMIN_SUMMARY_DEFAULT_LIMIT', '// BNA dashboard: students');
  assert.match(route, /requireAdmin/);
  assert.match(route, /DEFAULT_PROJECT_KEY/);
  assert.match(route, /assertProjectAccess\(req, project\)/);
  assert.match(route, /SCHOOL_ADMIN_SUMMARY_DEFAULT_LIMIT/);
  assert.match(route, /SCHOOL_ADMIN_SUMMARY_MAX_LIMIT/);
  assert.match(route, /LIMIT \$\$\{studentParams\.length \+ 1\}/);
  assert.match(route, /maskEmail/);
  assert.match(route, /maskPhone/);
  assert.match(route, /res\.setHeader\('Cache-Control', 'no-store'\)/);
  assert.match(route, /excluded_before_useful_action/);
  assert.doesNotMatch(route, /getServiceProviders|getOneTime|ONE_TIME_PROJECT_KEY|studio\/dashboard/);

  const apiRoute = routeRegistry.routes.find((row) => row.route === '/api/bna/school-admin/summary');
  assert.ok(apiRoute, 'API route registry row exists');
  assert.equal(apiRoute.access, 'private');
  assert.equal(apiRoute.public_allowed, false);
});

test('School admin client exposes useful-action markers and one initial API group', () => {
  assert.match(js, /performance\.mark\('bna-school-admin-shell-ready'\)/);
  assert.match(js, /performance\.mark\('bna-school-admin-useful-action'\)/);
  assert.match(js, /performance\.measure\('bna-school-admin-navigation-to-useful-action'/);
  assert.match(js, /dataset\.schoolUsefulAction = 'ready'/);
  assert.match(js, /request_groups_before_useful_action: \['school_admin_summary'\]/);
  assert.match(js, /fetch\(`\/api\/bna\/school-admin\/summary\?\$\{query\.toString\(\)\}`/);
  assert.match(js, /state\.controller\.abort\(\)/);
});

test('School admin visible actions are registered', () => {
  const registered = new Set(actionRegistry.actions.map((row) => row.action_id));
  for (const actionId of [
    'ACTION-SCHOOL-ADMIN-TAB-NAV',
    'ACTION-SCHOOL-ADMIN-REFRESH',
    'ACTION-SCHOOL-ADMIN-ROW-OPEN',
    'ACTION-SCHOOL-ADMIN-PORTAL-LINK',
  ]) {
    assert.ok(registered.has(actionId), `${actionId} is registered`);
    assert.match(html + js, new RegExp(actionId));
  }
});

test('School admin budget command passes and assets stay below the prompt ceilings', () => {
  assert.equal(packageJson.scripts['school-admin:perf:budget'], 'node scripts/check-school-admin-performance-budget.mjs');
  assert.equal(packageJson.scripts['school-admin:perf:audit'], 'node scripts/audit-school-admin-performance.mjs --write');
  assert.ok(gzipBytes('public/js/school-admin.js') <= 250 * 1024);
  assert.ok(gzipBytes('public/css/school-admin.css') <= 80 * 1024);
  const result = execFileSync(process.execPath, ['scripts/check-school-admin-performance-budget.mjs', '--json'], {
    cwd: root,
    encoding: 'utf8',
  });
  const parsed = JSON.parse(result);
  assert.equal(parsed.ok, true, JSON.stringify(parsed.failures, null, 2));
  assert.ok(parsed.initial_requests.total <= 4);
});
