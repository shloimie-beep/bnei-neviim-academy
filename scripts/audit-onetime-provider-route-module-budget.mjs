#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicRoot = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'performance-audits', '2026-07-13-onetime-provider-route-module-budget');

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

const baseRef = argValue('--base-ref', 'HEAD');

function gitText(ref, filePath) {
  try {
    return execFileSync('git', ['show', `${ref}:${filePath}`], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function gitSha(ref) {
  try {
    return execFileSync('git', ['rev-parse', ref], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return ref;
  }
}

function byteLength(text) {
  return Buffer.byteLength(String(text || ''), 'utf8');
}

async function fileBytes(relativePath) {
  const info = await stat(path.join(repoRoot, relativePath));
  return info.size;
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function providerPayload() {
  return {
    success: true,
    provider: {
      id: 77,
      provider_name: 'Rabbi Eli Scheller',
      display_name: 'Rabbi Eli Scheller',
      login_username: 'ELISHELLER',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      entitlement_plan: 'rabbi_sheller_partner',
      status: 'active',
      plan: { label: 'One Time Mishnah Class workspace' },
    },
    scope: {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      entitlements: ['crm_contacts', 'parent_portal', 'student_portal'],
    },
    profile: { id: 77 },
    services: [
      {
        id: 8,
        title: 'One Time Mishnah Class',
        description: 'Live class and member library workspace.',
        status: 'active',
      },
    ],
    links: {
      one_time_home: '/one-time',
      parent: '/parent/login',
      student: '/student/login',
      member: '/rabbi-member',
      classroom: '/one-time-classroom.html',
      email_preview: '/one-time-email-review.html',
    },
    crm_workspace: { current_records: { parents: 0, students: 0, support_items: 1 } },
    one_time_class_media_enabled: true,
    one_time_class_media: [],
    wapi_setup: null,
    messages: [],
    entitlements: [],
    integrations: [],
    access_checklist: [],
    media: [],
    comments: [],
    google_business: {},
    upgrade: {},
    dedicated_provider_shell: true,
    operations_shell: false,
    legacy_provider_dashboard_replaced: true,
    external_write_performed: false,
  };
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

async function serveStatic(req, res, baseUrl, servedPaths) {
  const url = new URL(req.url || '/', baseUrl);
  if (url.pathname === '/api/provider-portal/session') {
    servedPaths.push(url.pathname);
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(providerPayload()));
    return;
  }
  if (url.pathname === '/api/provider-portal/inquiries') {
    servedPaths.push(url.pathname);
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ cards: [], external_write_performed: false }));
    return;
  }
  if (url.pathname === '/api/provider-portal/calendar-events') {
    servedPaths.push(url.pathname);
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ events: [], external_write_performed: false }));
    return;
  }
  if (url.pathname === '/api/provider-portal/mailbox') {
    servedPaths.push(url.pathname);
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      mailbox: {
        readiness: {
          inbox_address: 'info@onetimeonetime.com',
          readiness: { send_allowed: false },
        },
        threads: [],
      },
      external_write_performed: false,
    }));
    return;
  }
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  const requested = url.pathname === '/' || url.pathname === '/provider' || url.pathname === '/provider-dashboard'
    ? '/provider.html'
    : url.pathname;
  const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(publicRoot, safePath);
  if (!filePath.startsWith(publicRoot)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    servedPaths.push(url.pathname);
    res.writeHead(200, {
      'content-type': contentType(filePath),
      'content-length': String(body.length),
    });
    res.end(body);
  } catch {
    servedPaths.push(`${url.pathname}:404`);
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

async function captureRoute(browser, baseUrl, route) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failedRequests = [];
  const badResponses = [];
  const consoleErrors = [];
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim()));
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
  if (route.expectShell) await page.waitForSelector('[data-one-time-provider-crm-shell]', { timeout: 10000 });
  if (route.expectModuleKey) {
    await page.waitForFunction((key) => Boolean(window.OneTimeProviderRouteModules?.[key]), route.expectModuleKey, { timeout: 10000 });
  }
  const metrics = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[src]')].map((node) => node.getAttribute('src'));
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.getAttribute('href'));
    const resources = performance.getEntriesByType('resource').map((entry) => ({
      name: entry.name,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
    }));
    return {
      scripts,
      styles,
      routeModuleScripts: scripts.filter((src) => /one-time-provider-.*-route\.js/.test(src || '')),
      modules: Object.keys(window.OneTimeProviderRouteModules || {}).sort(),
      crmLoaded: document.documentElement.dataset.oneTimeProviderCrmRouteModule === 'loaded',
      mailboxLoaded: document.documentElement.dataset.oneTimeProviderMailboxRouteModule === 'loaded',
      communicationsLoaded: document.documentElement.dataset.oneTimeProviderCommunicationsRouteModule === 'loaded',
      hasCrmShell: Boolean(document.querySelector('[data-one-time-provider-crm-shell]')),
      hasCrmPlaceholder: Boolean(document.querySelector('[data-one-time-provider-crm-route-placeholder]')),
      hasOperationsCss: styles.includes('/css/operations-shell.css'),
      hasOperationsJs: scripts.includes('/js/operations-shell.js') || scripts.includes('/js/operations-deferred-renderers.js'),
      resources,
    };
  });
  await page.close();
  return {
    id: route.id,
    path: route.path,
    ...metrics,
    failedRequests,
    badResponses,
    consoleErrors,
  };
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const baseProviderHtml = gitText(baseRef, 'public/provider.html');
  const currentProviderHtml = await readFile(path.join(repoRoot, 'public', 'provider.html'), 'utf8');
  const currentBytes = {
    provider_html: byteLength(currentProviderHtml),
    crm_route_module: await fileBytes('public/js/one-time-provider-crm-route.js'),
    mailbox_route_module: await fileBytes('public/js/one-time-provider-mailbox-route.js'),
    communications_route_module: await fileBytes('public/js/one-time-provider-communications-route.js'),
    agents_route_module: await fileBytes('public/js/one-time-provider-agents-route.js'),
    rum_collector: await fileBytes('public/js/one-time-performance-rum.js'),
  };
  const sizeComparison = {
    base_ref: baseRef,
    base_sha: gitSha(baseRef),
    base_provider_html_bytes: byteLength(baseProviderHtml),
    current_provider_html_bytes: currentBytes.provider_html,
    provider_html_delta_bytes: currentBytes.provider_html - byteLength(baseProviderHtml),
    crm_route_module_bytes: currentBytes.crm_route_module,
    crm_route_total_delta_bytes: currentBytes.provider_html + currentBytes.crm_route_module - byteLength(baseProviderHtml),
  };

  const servedPaths = [];
  let baseUrl = '';
  const server = createServer((req, res) => {
    serveStatic(req, res, baseUrl, servedPaths).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error instanceof Error ? error.stack || error.message : String(error));
    });
  });
  const port = await listen(server);
  baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ headless: true });
  let routes = [];
  try {
    routes = [
      await captureRoute(browser, baseUrl, {
        id: 'overview',
        path: '/provider.html?admin_provider=one-time',
      }),
      await captureRoute(browser, baseUrl, {
        id: 'crm',
        path: '/provider.html?admin_provider=one-time&section=crm',
        expectShell: true,
        expectModuleKey: 'crm',
      }),
      await captureRoute(browser, baseUrl, {
        id: 'mailbox',
        path: '/provider.html?admin_provider=one-time&section=mailbox',
        expectModuleKey: 'mailbox',
      }),
      await captureRoute(browser, baseUrl, {
        id: 'communications',
        path: '/provider.html?admin_provider=one-time&section=communications',
        expectModuleKey: 'communications',
      }),
      await captureRoute(browser, baseUrl, {
        id: 'agents',
        path: '/provider.html?admin_provider=one-time&section=agents',
        expectModuleKey: 'agents',
      }),
    ];
  } finally {
    await browser.close();
    await close(server);
  }

  const overview = routes.find((route) => route.id === 'overview');
  const crm = routes.find((route) => route.id === 'crm');
  const mailbox = routes.find((route) => route.id === 'mailbox');
  const communications = routes.find((route) => route.id === 'communications');
  const agents = routes.find((route) => route.id === 'agents');
  const checks = [
    {
      id: 'provider_html_delta_within_agents_route_budget',
      passed: sizeComparison.provider_html_delta_bytes <= 8192,
      detail: `${sizeComparison.provider_html_delta_bytes} bytes <= 8192 bytes for the new lazy Agents route wiring`,
    },
    {
      id: 'overview_no_crm_module',
      passed: overview?.routeModuleScripts?.length === 0 && overview?.hasCrmShell === false && overview?.hasCrmPlaceholder === true,
      detail: JSON.stringify({ scripts: overview?.routeModuleScripts || [], hasCrmShell: overview?.hasCrmShell, hasCrmPlaceholder: overview?.hasCrmPlaceholder }),
    },
    {
      id: 'crm_loads_only_crm_route_module',
      passed: JSON.stringify(crm?.modules || []) === JSON.stringify(['crm']) && crm?.hasCrmShell === true && crm?.routeModuleScripts?.includes('/js/one-time-provider-crm-route.js'),
      detail: JSON.stringify({ modules: crm?.modules || [], routeModuleScripts: crm?.routeModuleScripts || [], hasCrmShell: crm?.hasCrmShell }),
    },
    {
      id: 'mailbox_loads_only_mailbox_route_module',
      passed: JSON.stringify(mailbox?.modules || []) === JSON.stringify(['mailbox']) &&
        mailbox?.routeModuleScripts?.includes('/js/one-time-provider-mailbox-route.js') &&
        mailbox?.hasCrmShell === false,
      detail: JSON.stringify({ modules: mailbox?.modules || [], routeModuleScripts: mailbox?.routeModuleScripts || [], hasCrmShell: mailbox?.hasCrmShell }),
    },
    {
      id: 'communications_loads_only_communications_route_module',
      passed: JSON.stringify(communications?.modules || []) === JSON.stringify(['communications']) &&
        communications?.routeModuleScripts?.includes('/js/one-time-provider-communications-route.js') &&
        communications?.hasCrmShell === false,
      detail: JSON.stringify({ modules: communications?.modules || [], routeModuleScripts: communications?.routeModuleScripts || [], hasCrmShell: communications?.hasCrmShell }),
    },
    {
      id: 'agents_loads_only_agents_route_module',
      passed: JSON.stringify(agents?.modules || []) === JSON.stringify(['agents']) &&
        agents?.routeModuleScripts?.includes('/js/one-time-provider-agents-route.js') &&
        agents?.hasCrmShell === false,
      detail: JSON.stringify({ modules: agents?.modules || [], routeModuleScripts: agents?.routeModuleScripts || [], hasCrmShell: agents?.hasCrmShell }),
    },
    {
      id: 'operations_assets_absent',
      passed: routes.every((route) => !route.hasOperationsCss && !route.hasOperationsJs),
      detail: JSON.stringify(routes.map((route) => ({ id: route.id, hasOperationsCss: route.hasOperationsCss, hasOperationsJs: route.hasOperationsJs }))),
    },
    {
      id: 'no_failed_requests_or_console_errors',
      passed: routes.every((route) => !route.failedRequests.length && !route.badResponses.length && !route.consoleErrors.length),
      detail: JSON.stringify(routes.map((route) => ({
        id: route.id,
        failed: route.failedRequests.length,
        bad: route.badResponses.length,
        console: route.consoleErrors.length,
      }))),
    },
    {
      id: 'route_module_budgets',
      passed: currentBytes.crm_route_module <= 16384 &&
        currentBytes.mailbox_route_module <= 18432 &&
        currentBytes.communications_route_module <= 8192 &&
        currentBytes.agents_route_module <= 24576 &&
        currentBytes.rum_collector <= 8192,
      detail: JSON.stringify({
        crm_route_module_bytes: currentBytes.crm_route_module,
        mailbox_route_module_bytes: currentBytes.mailbox_route_module,
        communications_route_module_bytes: currentBytes.communications_route_module,
        agents_route_module_bytes: currentBytes.agents_route_module,
        rum_collector_bytes: currentBytes.rum_collector,
        crm_route_total_delta_bytes: sizeComparison.crm_route_total_delta_bytes,
      }),
    },
  ];

  const report = {
    status: checks.every((check) => check.passed) ? 'PASS' : 'FAIL',
    generated_at: new Date().toISOString(),
    scope: 'Local One Time provider route-module budget audit. No database, sends, payments, external accounts, or production writes.',
    base_ref: baseRef,
    size_comparison: sizeComparison,
    current_bytes: currentBytes,
    routes,
    served_paths: servedPaths,
    checks,
    external_write_performed: false,
    production_data_mutation_performed: false,
  };

  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outDir, 'report.md'), [
    '# One Time Provider Route Module Budget',
    '',
    `Status: ${report.status}`,
    `Generated: ${report.generated_at}`,
    `Base ref: ${baseRef} (${sizeComparison.base_sha})`,
    '',
    report.scope,
    '',
    '## Size Comparison',
    '',
    `- Base provider.html: ${sizeComparison.base_provider_html_bytes} bytes`,
    `- Current provider.html: ${sizeComparison.current_provider_html_bytes} bytes`,
    `- Provider HTML delta: ${sizeComparison.provider_html_delta_bytes} bytes`,
    `- CRM route module: ${sizeComparison.crm_route_module_bytes} bytes`,
    `- Mailbox route module: ${currentBytes.mailbox_route_module} bytes`,
    `- Communications route module: ${currentBytes.communications_route_module} bytes`,
    `- Agents route module: ${currentBytes.agents_route_module} bytes`,
    `- One Time RUM collector: ${currentBytes.rum_collector} bytes`,
    `- Current provider.html + CRM module delta: ${sizeComparison.crm_route_total_delta_bytes} bytes`,
    '',
    '## Route Checks',
    '',
    '| Route | Modules | Route scripts | CRM shell | Placeholder | Operations assets | Failed/bad/console |',
    '|---|---|---|---:|---:|---:|---:|',
    ...routes.map((route) => [
      `| ${route.id}`,
      (route.modules || []).join(', ') || 'none',
      (route.routeModuleScripts || []).join(', ') || 'none',
      String(route.hasCrmShell),
      String(route.hasCrmPlaceholder),
      String(route.hasOperationsCss || route.hasOperationsJs),
      `${route.failedRequests.length}/${route.badResponses.length}/${route.consoleErrors.length} |`,
    ].join(' | ')),
    '',
    '## Checks',
    '',
    ...checks.map((check) => `- ${check.passed ? 'PASS' : 'FAIL'} ${check.id}: ${check.detail}`),
    '',
    'No sends, provider mutations, CRM writes, payments, access grants, or production data mutations were performed.',
    '',
  ].join('\n'));

  console.log(`${report.status} ${path.relative(repoRoot, path.join(outDir, 'report.md')).replace(/\\/g, '/')}`);
  if (report.status !== 'PASS') process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
