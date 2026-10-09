#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'ops', 'codex-runs', 'BNA-SEP-01', 'AFTER');
const write = process.argv.includes('--write');

const files = [
  'public/school-admin.html',
  'public/css/school-admin.css',
  'public/js/school-admin.js',
  'server.js',
  'ops/route-registry.json',
  'ops/action-registry.json',
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function stat(rel) {
  const absolute = path.join(root, rel);
  const raw = fs.readFileSync(absolute);
  return {
    path: rel,
    bytes: raw.length,
    gzip_bytes: zlib.gzipSync(raw).length,
  };
}

function count(pattern, text) {
  return [...text.matchAll(pattern)].length;
}

function metricSummary() {
  const html = read('public/school-admin.html');
  const js = read('public/js/school-admin.js');
  const css = read('public/css/school-admin.css');
  const server = read('server.js');
  const routeRows = JSON.parse(read('ops/route-registry.json')).routes || [];
  const actionRows = JSON.parse(read('ops/action-registry.json')).actions || [];
  const apiRouteStart = server.indexOf('const SCHOOL_ADMIN_SUMMARY_DEFAULT_LIMIT');
  const apiRouteEnd = server.indexOf('// BNA dashboard: students', apiRouteStart);
  const apiRoute = apiRouteStart >= 0 ? server.slice(apiRouteStart, apiRouteEnd > apiRouteStart ? apiRouteEnd : undefined) : '';

  const requestsBeforeUsefulAction = {
    document: 1,
    css: count(/<link\b[^>]+stylesheet/gi, html),
    js: count(/<script\b[^>]+src=/gi, html),
    school_api: js.includes('/api/bna/school-admin/summary') ? 1 : 0,
  };
  requestsBeforeUsefulAction.total = Object.values(requestsBeforeUsefulAction).reduce((sum, value) => sum + value, 0);

  return {
    report_version: 'school-admin-performance-static-v1',
    generated_at: new Date().toISOString(),
    commit: process.env.GIT_COMMIT || '',
    files: files.map(stat),
    initial_requests_before_useful_action: requestsBeforeUsefulAction,
    useful_action_markers: {
      shell_ready: js.includes("performance.mark('bna-school-admin-shell-ready')"),
      useful_action: js.includes("performance.mark('bna-school-admin-useful-action')"),
      measure: js.includes("performance.measure('bna-school-admin-navigation-to-useful-action'"),
      test_visible_dataset: js.includes("dataset.schoolUsefulAction = 'ready'"),
    },
    route_contract: {
      page_registered: server.includes("app.get('/operations/school', requireAdmin, sendSchoolAdminShell);"),
      api_registered: server.includes("app.get('/api/bna/school-admin/summary', requireAdmin"),
      page_registry: routeRows.some((row) => row.route === '/operations/school'),
      api_registry: routeRows.some((row) => row.route === '/api/bna/school-admin/summary'),
      action_registry: ['ACTION-SCHOOL-ADMIN-TAB-NAV', 'ACTION-SCHOOL-ADMIN-REFRESH', 'ACTION-SCHOOL-ADMIN-ROW-OPEN', 'ACTION-SCHOOL-ADMIN-PORTAL-LINK']
        .every((id) => actionRows.some((row) => row.action_id === id)),
    },
    api_bounds: {
      default_limit: apiRoute.includes('SCHOOL_ADMIN_SUMMARY_DEFAULT_LIMIT'),
      max_limit: apiRoute.includes('SCHOOL_ADMIN_SUMMARY_MAX_LIMIT'),
      sql_limit: apiRoute.includes('LIMIT $'),
      masks_contacts: apiRoute.includes('maskEmail') && apiRoute.includes('maskPhone'),
      no_store: apiRoute.includes("res.setHeader('Cache-Control', 'no-store')"),
      project_scope_guard: apiRoute.includes('assertProjectAccess(req, project)'),
    },
    excluded_initial_assets: {
      operations_shell: !html.includes('operations-shell') && !js.includes('operations-shell'),
      operations_deferred_renderers: !html.includes('operations-deferred-renderers') && !js.includes('operations-deferred-renderers'),
      one_time_runtime: !/\/api\/bna\/one-time|one-time/i.test(html) && !/\/api\/bna\/one-time/.test(js),
      provider_runtime: !/\/api\/bna\/service-providers|\/api\/bna\/studio|provider\.html/.test(js + html),
      integrations_runtime: !/\/api\/bna\/integrations|\/api\/google/.test(js),
    },
    browser_measurement: {
      status: 'not_run_by_static_audit',
      blocker: 'Run with installed npm dependencies, an authenticated local/staging session, and the CODEX-01 browser harness for 30 cold and warm samples.',
    },
  };
}

const summary = metricSummary();

if (write) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'school-admin-static-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'school-admin-static-summary.md'), [
    '# School Admin Static Performance Summary',
    '',
    `Generated: ${summary.generated_at}`,
    '',
    `Initial requests before useful action: ${summary.initial_requests_before_useful_action.total}`,
    '',
    '## Assets',
    ...summary.files.map((file) => `- ${file.path}: ${file.bytes} bytes, ${file.gzip_bytes} gzip bytes`),
    '',
    '## Browser Evidence',
    `- ${summary.browser_measurement.status}: ${summary.browser_measurement.blocker}`,
    '',
  ].join('\n'));
}

console.log(JSON.stringify(summary, null, 2));
