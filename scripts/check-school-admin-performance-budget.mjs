#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = {
  html: path.join(root, 'public', 'school-admin.html'),
  css: path.join(root, 'public', 'css', 'school-admin.css'),
  js: path.join(root, 'public', 'js', 'school-admin.js'),
  server: path.join(root, 'server.js'),
  routeRegistry: path.join(root, 'ops', 'route-registry.json'),
  actionRegistry: path.join(root, 'ops', 'action-registry.json'),
};

const budgets = {
  initialJsGzipBytes: 250 * 1024,
  initialCssGzipBytes: 80 * 1024,
  htmlBytes: 24 * 1024,
  initialRequestCeiling: 4,
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function bytes(file) {
  return fs.statSync(file).size;
}

function gzipBytes(file) {
  return zlib.gzipSync(fs.readFileSync(file)).length;
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) return '';
  const endIndex = source.indexOf(end, startIndex + start.length);
  return source.slice(startIndex, endIndex < 0 ? undefined : endIndex);
}

function check(condition, id, detail, failures) {
  if (!condition) failures.push({ id, detail });
}

function main() {
  const failures = [];
  const html = read(files.html);
  const css = read(files.css);
  const js = read(files.js);
  const server = read(files.server);
  const routes = JSON.parse(read(files.routeRegistry));
  const actions = JSON.parse(read(files.actionRegistry));
  const apiRoute = sliceBetween(server, 'const SCHOOL_ADMIN_SUMMARY_DEFAULT_LIMIT', '// BNA dashboard: students');
  const pageRoute = sliceBetween(server, 'function sendSchoolAdminShell', "function wantsOneTimeReviewQuery");

  const assetSizes = {
    html_bytes: bytes(files.html),
    css_gzip_bytes: gzipBytes(files.css),
    js_gzip_bytes: gzipBytes(files.js),
    js_raw_bytes: bytes(files.js),
    css_raw_bytes: bytes(files.css),
  };

  const initialRequests = {
    html: 1,
    css: countMatches(html, /<link\b[^>]+stylesheet/gi),
    js: countMatches(html, /<script\b[^>]+src=/gi),
    api_before_useful_action: countMatches(js, /\/api\/bna\/school-admin\/summary/g) > 0 ? 1 : 0,
  };
  initialRequests.total = initialRequests.html + initialRequests.css + initialRequests.js + initialRequests.api_before_useful_action;

  check(assetSizes.js_gzip_bytes <= budgets.initialJsGzipBytes, 'SCHOOL_ADMIN_JS_GZIP_BUDGET', `${assetSizes.js_gzip_bytes} > ${budgets.initialJsGzipBytes}`, failures);
  check(assetSizes.css_gzip_bytes <= budgets.initialCssGzipBytes, 'SCHOOL_ADMIN_CSS_GZIP_BUDGET', `${assetSizes.css_gzip_bytes} > ${budgets.initialCssGzipBytes}`, failures);
  check(assetSizes.html_bytes <= budgets.htmlBytes, 'SCHOOL_ADMIN_HTML_BUDGET', `${assetSizes.html_bytes} > ${budgets.htmlBytes}`, failures);
  check(initialRequests.total <= budgets.initialRequestCeiling, 'SCHOOL_ADMIN_INITIAL_REQUEST_BUDGET', `${initialRequests.total} > ${budgets.initialRequestCeiling}`, failures);

  check(html.includes('/css/school-admin.css'), 'SCHOOL_ADMIN_CSS_LINK', 'school-admin.html must load only the school stylesheet.', failures);
  check(html.includes('/js/school-admin.js'), 'SCHOOL_ADMIN_JS_LINK', 'school-admin.html must load the school script.', failures);
  check(!/operations-shell|operations-deferred-renderers|one-time|provider\.html|bna-bot-widget/i.test(html), 'SCHOOL_ADMIN_NO_HEAVY_HTML_IMPORTS', 'school-admin.html imports unrelated runtime assets.', failures);
  check(!/operations-shell|operations-deferred-renderers|\/api\/bna\/one-time|\/api\/bna\/service-providers|\/api\/bna\/studio|\/api\/bna\/integrations/i.test(js), 'SCHOOL_ADMIN_NO_HEAVY_JS_IMPORTS', 'school-admin.js calls unrelated runtime assets or APIs.', failures);
  check(js.includes("performance.mark('bna-school-admin-useful-action')"), 'SCHOOL_ADMIN_USEFUL_MARK', 'Useful-action performance mark is missing.', failures);
  check(js.includes("request_groups_before_useful_action: ['school_admin_summary']"), 'SCHOOL_ADMIN_REQUEST_CLASSIFICATION', 'School request classification is missing.', failures);
  check(apiRoute.includes('DEFAULT_PROJECT_KEY'), 'SCHOOL_ADMIN_API_DEFAULT_PROJECT', 'API must scope to the BNA project.', failures);
  check(apiRoute.includes('assertProjectAccess(req, project)'), 'SCHOOL_ADMIN_API_SCOPE_GUARD', 'API must reject wrong scoped sessions.', failures);
  check(apiRoute.includes('maskEmail') && apiRoute.includes('maskPhone'), 'SCHOOL_ADMIN_API_MASKED_CONTACTS', 'API must return masked contact details.', failures);
  check(apiRoute.includes('LIMIT $'), 'SCHOOL_ADMIN_API_LIMIT', 'API queries must be explicitly bounded.', failures);
  check(apiRoute.includes("res.setHeader('Cache-Control', 'no-store')"), 'SCHOOL_ADMIN_API_NO_STORE', 'API response must be no-store.', failures);
  check(pageRoute.includes('school-admin.html'), 'SCHOOL_ADMIN_PAGE_ROUTE', 'Server must serve the focused school shell.', failures);
  check(server.includes("app.get('/operations/school', requireAdmin, sendSchoolAdminShell);"), 'SCHOOL_ADMIN_PRIVATE_ROUTE', 'Private /operations/school route is missing.', failures);
  check(server.includes("routePath === '/api/bna/school-admin/summary' && method === 'GET'"), 'SCHOOL_ADMIN_ALLOWED_ROUTE', 'Scoped route allowlist is missing the School summary API.', failures);

  const routeRows = routes.routes || [];
  const actionRows = actions.actions || [];
  check(routeRows.some((row) => row.route === '/operations/school' && row.access === 'private'), 'SCHOOL_ADMIN_ROUTE_REGISTRY', 'Route registry missing /operations/school.', failures);
  check(routeRows.some((row) => row.route === '/api/bna/school-admin/summary' && row.access === 'private'), 'SCHOOL_ADMIN_API_ROUTE_REGISTRY', 'Route registry missing summary API.', failures);
  for (const id of ['ACTION-SCHOOL-ADMIN-TAB-NAV', 'ACTION-SCHOOL-ADMIN-REFRESH', 'ACTION-SCHOOL-ADMIN-ROW-OPEN', 'ACTION-SCHOOL-ADMIN-PORTAL-LINK']) {
    check(actionRows.some((row) => row.action_id === id), `SCHOOL_ADMIN_ACTION_${id}`, `Action registry missing ${id}.`, failures);
  }

  const result = {
    ok: failures.length === 0,
    budgets,
    asset_sizes: assetSizes,
    initial_requests: initialRequests,
    failures,
  };

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`# School admin performance budget\n`);
    console.log(`- Initial requests: ${initialRequests.total}/${budgets.initialRequestCeiling}`);
    console.log(`- JS gzip bytes: ${assetSizes.js_gzip_bytes}/${budgets.initialJsGzipBytes}`);
    console.log(`- CSS gzip bytes: ${assetSizes.css_gzip_bytes}/${budgets.initialCssGzipBytes}`);
    console.log(`- HTML bytes: ${assetSizes.html_bytes}/${budgets.htmlBytes}`);
    if (failures.length) {
      console.log('\nFailures:');
      failures.forEach((failure) => console.log(`- ${failure.id}: ${failure.detail}`));
    }
  }

  if (failures.length) process.exitCode = 1;
}

main();
