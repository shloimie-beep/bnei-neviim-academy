#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'playwright-smokes', '2026-06-23-portal-agnostic-login-chooser-local');

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const loginPages = [
  {
    name: 'operations',
    path: '/operations-login',
    usernameSelector: '#username',
    passwordSelector: '#password',
    submitSelector: '#submitBtn',
    screenshotPrefix: 'operations',
  },
  {
    name: 'provider',
    path: '/provider',
    usernameSelector: '#username',
    passwordSelector: '#password',
    submitSelector: '#loginButton',
    screenshotPrefix: 'provider',
  },
  {
    name: 'student',
    path: '/student',
    usernameSelector: '#studentUsername',
    passwordSelector: '#studentPassword',
    submitSelector: '#studentLoginButton',
    screenshotPrefix: 'student',
  },
  {
    name: 'parent',
    path: '/parent',
    usernameSelector: '#parentEmail',
    passwordSelector: '#parentPassword',
    submitSelector: '#requestButton',
    screenshotPrefix: 'parent',
  },
];

const chooserResponse = {
  success: true,
  chooser_required: true,
  message: 'Choose which portal or workspace to open.',
  destinations: [
    {
      id: 'operations:rabbi-sheller-manager',
      portal: 'operations',
      role: 'project_manager',
      label: 'Operations - Rabbi workspace',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      redirect_to: '/operations?workspace=rabbi_sheller_provider&view=tasks',
    },
    {
      id: 'provider:rabbi-sheller',
      portal: 'provider',
      role: 'service_provider',
      label: 'Provider workspace',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      redirect_to: '/provider',
    },
    {
      id: 'parent:demo',
      portal: 'parent',
      role: 'parent',
      label: 'Parent portal',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      redirect_to: '/parent',
    },
    {
      id: 'student:demo',
      portal: 'student',
      role: 'student',
      label: 'Student portal',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      redirect_to: '/student',
    },
  ],
};

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy(new Error('Request body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function serveStatic(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1');

  if (req.method === 'POST' && [
    '/api/operations/login',
    '/api/provider-portal/login',
    '/api/student-portal/login',
    '/api/parent-portal/login',
  ].includes(url.pathname)) {
    await readRequestBody(req);
    json(res, 200, chooserResponse);
    return;
  }

  if (url.pathname === '/api/bna/auth/me') {
    json(res, 200, { success: false, authenticated: false });
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    json(res, 401, { error: 'Mocked unauthenticated local smoke response' });
    return;
  }

  const htmlRoutes = {
    '/': '/provider.html',
    '/operations-login': '/operations-login.html',
    '/provider': '/provider.html',
    '/student': '/student.html',
    '/parent': '/parent.html',
  };
  const routePath = htmlRoutes[url.pathname] || url.pathname;
  const safePath = path.normalize(routePath).replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': contentType(filePath) });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function smokeLoginPage({ browser, baseUrl, pageConfig, viewport }) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const ignoredConsoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/Failed to load resource: the server responded with a status of 401 \(Unauthorized\)/.test(text)) {
      ignoredConsoleMessages.push(text);
      return;
    }
    consoleErrors.push(text);
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
  });

  await page.goto(`${baseUrl}${pageConfig.path}`, { waitUntil: 'networkidle' });
  await page.locator(pageConfig.usernameSelector).waitFor({ state: 'visible' });
  await page.fill(pageConfig.usernameSelector, 'same-identity-demo');
  await page.fill(pageConfig.passwordSelector, 'not-a-real-password');
  await page.click(pageConfig.submitSelector);
  try {
    await page.locator('[data-action-id="ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION"]').first().waitFor({ state: 'visible' });
  } catch (error) {
    const bodyText = await page.locator('body').innerText().catch(() => '');
    throw new Error(`${pageConfig.name}:${viewport.name}: chooser links did not become visible. url=${page.url()} body=${bodyText.slice(0, 500)}`, { cause: error });
  }

  const chooserLinkLocator = page.locator('[data-action-id="ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION"]');
  const links = await chooserLinkLocator.evaluateAll((anchors) => anchors.map((anchor) => ({
    text: anchor.textContent?.trim() || '',
    href: anchor.getAttribute('href') || '',
  })));
  const renderedHrefs = links.map((link) => link.href);
  const checks = {
    chooserVisible: await chooserLinkLocator.count() >= 4,
    operationsDestination: renderedHrefs.includes('/operations?workspace=rabbi_sheller_provider&view=tasks'),
    providerDestination: renderedHrefs.includes('/provider'),
    parentDestination: renderedHrefs.includes('/parent'),
    studentDestination: renderedHrefs.includes('/student'),
    noExternalDestinations: renderedHrefs.every((href) => href.startsWith('/')),
    noClientTrustedWorkspaceRouting: await page.locator('a[href*="workspace_key"]').count() === 0,
    passwordRemainsMasked: await page.locator(`${pageConfig.passwordSelector}[type="password"]`).count() === 1,
    noHorizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  };

  const screenshot = path.join(outDir, `${pageConfig.screenshotPrefix}-${viewport.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await page.close();

  return {
    page: pageConfig.name,
    viewport,
    screenshot: path.relative(repoRoot, screenshot).replace(/\\/g, '/'),
    links,
    checks,
    consoleErrors,
    ignoredConsoleMessages,
    pageErrors,
    failedRequests,
  };
}

async function run() {
  await mkdir(outDir, { recursive: true });
  const server = createServer((req, res) => {
    serveStatic(req, res).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error instanceof Error ? error.stack : String(error));
    });
  });
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const results = [];

  try {
    for (const viewport of viewports) {
      for (const pageConfig of loginPages) {
        results.push(await smokeLoginPage({ browser, baseUrl, pageConfig, viewport }));
      }
    }
  } finally {
    await browser.close();
    await close(server);
  }

  const failed = results.flatMap((result) => {
    const failedChecks = Object.entries(result.checks)
      .filter(([, value]) => !value)
      .map(([key]) => `${result.page}:${result.viewport.name}:${key}`);
    return [
      ...failedChecks,
      ...result.consoleErrors.map((error) => `${result.page}:${result.viewport.name}:console:${error}`),
      ...result.pageErrors.map((error) => `${result.page}:${result.viewport.name}:page:${error}`),
      ...result.failedRequests.map((error) => `${result.page}:${result.viewport.name}:request:${error}`),
    ];
  });

  const report = {
    status: failed.length ? 'FAIL' : 'PASS',
    generated_at: new Date().toISOString(),
    target: 'operations, provider, student, and parent password login chooser rendering',
    fixture: 'mocked chooser_required responses; no database, credentials, external accounts, sends, billing, or production writes',
    results,
    failed,
  };
  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outDir, 'report.md'), [
    '# Portal-Agnostic Login Chooser Local Smoke',
    '',
    `Status: ${report.status}`,
    '',
    'Scope: local static render of Operations, provider, student, and parent password login pages with mocked `chooser_required` responses. No database, credentials, external accounts, sends, billing, or production data writes.',
    '',
    '| Page | Viewport | Result | Screenshot | Notes |',
    '|---|---|---|---|---|',
    ...results.map((result) => {
      const resultFailed = [
        ...Object.entries(result.checks).filter(([, value]) => !value).map(([key]) => key),
        ...result.consoleErrors,
        ...result.pageErrors,
        ...result.failedRequests,
      ];
      return `| ${result.page} | ${result.viewport.width}x${result.viewport.height} | ${resultFailed.length ? 'FAIL' : 'PASS'} | ${result.screenshot} | ${resultFailed.length ? resultFailed.join('; ') : 'Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow.'} |`;
    }),
    '',
    'Checks:',
    '',
    '- Operations, provider, student, and parent password login pages render server-resolved chooser destinations.',
    '- Destination links come from `redirect_to` values returned by the mocked server response.',
    '- Operations, Provider, Parent, and Student destinations are visible.',
    '- No external destination links are rendered.',
    '- Password fields remain masked.',
    '- No horizontal overflow at 390x844, 768x1024, or 1440x900.',
    '- No unexpected console errors, page errors, or network request failures. Initial unauthenticated session-probe 401 console messages are expected in this local static smoke and are recorded separately in `report.json`.',
    '',
  ].join('\n'));

  if (failed.length) {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`PASS portal chooser local smoke: ${path.relative(repoRoot, path.join(outDir, 'report.md'))}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
