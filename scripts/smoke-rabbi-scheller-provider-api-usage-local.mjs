#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'playwright-smokes', '2026-06-23-rabbi-scheller-provider-api-usage-local');

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const providerFixture = {
  provider: {
    id: 1,
    provider_name: 'Rabbi Elie Scheller',
    status: 'active_partner',
    provider_status: 'active_partner',
    commercial_model: 'revenue_share',
    entitlement_plan: 'partner',
    integration_status: 'manual_only',
    source_of_truth: 'bna_operations',
    public_signup_enabled: false,
    plan: {
      label: 'Partner workspace',
      helper: 'Commercial settings are managed by BNA Operations.',
    },
  },
  profile: {
    id: 1,
  },
  guardrails: {
    public_changes: 'Edits stay pending review until BNA approves them.',
  },
  services: [
    {
      id: 1,
      title: '7:00 Rabbi Scheller Mishnah class',
      description: 'Approved Rabbi-led Mishnah class option.',
      status: 'pending_review',
      service_type: 'mishnah_class',
      city: 'Online',
      currency: 'ILS',
    },
  ],
  entitlements: [
    {
      entitlement_key: 'api_usage_preview',
      enabled: true,
      notes: 'Preview only until workspace-scoped metering persistence is configured.',
    },
  ],
  integrations: [],
  access_checklist: [],
  messages: [],
  media: [],
  comments: [],
  google_business: {
    status: 'not_configured',
    fallback: 'Google Business Profile is not connected yet.',
  },
  upgrade: {
    configured: false,
    message: 'Paid provider features are not enabled until BNA configures Stripe links.',
  },
  one_time_class_media_enabled: true,
  one_time_class_media: [],
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

async function serveStatic(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (url.pathname === '/api/provider-portal/session') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(providerFixture));
    return;
  }
  const routePath = url.pathname === '/provider' || url.pathname === '/' ? '/provider.html' : url.pathname;
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
      const page = await browser.newPage({ viewport });
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('requestfailed', (request) => {
        failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
      });

      await page.goto(`${baseUrl}/provider?api_usage_preview=1&section=api_usage`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'API Usage' }).waitFor({ state: 'visible' });
      const directDeepLinkActive = await page.locator('[data-provider-nav="api_usage"].active').count() === 1;

      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'API Usage' }).waitFor({ state: 'visible' });
      await page.getByRole('heading', { name: 'No usage events recorded' }).waitFor({ state: 'visible' });
      const refreshPreservesSection = await page.locator('[data-provider-nav="api_usage"].active').count() === 1
        && new URL(page.url()).searchParams.get('section') === 'api_usage';

      await page.goto(`${baseUrl}/provider?api_usage_preview=1`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'Overview' }).waitFor({ state: 'visible' });
      const overviewBeforeClick = await page.locator('[data-provider-nav="overview"].active').count() === 1;
      await page.getByRole('button', { name: 'API Usage' }).click();
      await page.getByRole('heading', { name: 'API Usage' }).waitFor({ state: 'visible' });
      const clickUpdatesUrl = new URL(page.url()).searchParams.get('section') === 'api_usage';
      await page.goBack();
      await page.waitForFunction(() => document.querySelector('[data-provider-nav="overview"]')?.classList.contains('active'));
      const backReturnsOverview = await page.locator('[data-provider-section="overview"]:not(.provider-section-hidden)').count() === 1
        && !new URL(page.url()).searchParams.has('section');
      await page.getByRole('button', { name: 'API Usage' }).click();
      await page.getByRole('heading', { name: 'API Usage' }).waitFor({ state: 'visible' });

      const checks = {
        providerTitle: await page.getByText('Rabbi Elie Scheller').first().isVisible(),
        apiUsageNavVisible: await page.getByRole('button', { name: 'API Usage' }).isVisible(),
        apiUsageNavActive: await page.locator('[data-provider-nav="api_usage"].active').count() === 1,
        directDeepLinkActive,
        refreshPreservesSection,
        overviewBeforeClick,
        clickUpdatesUrl,
        backReturnsOverview,
        honestEmptyState: await page.getByText('API usage metering is not instrumented yet').isVisible(),
        noFakeUsage: !(await page.locator('text=/\\b(\\$[0-9]|[0-9]+\\s+(requests|tokens)|actual cost|input tokens|output tokens)\\b/i').count()),
        noHorizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
      };

      const screenshot = path.join(outDir, `${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      results.push({
        viewport,
        screenshot: path.relative(repoRoot, screenshot).replace(/\\/g, '/'),
        checks,
        consoleErrors,
        pageErrors,
        failedRequests,
      });
      await page.close();
    }
  } finally {
    await browser.close();
    await close(server);
  }

  const failed = results.flatMap((result) => {
    const failedChecks = Object.entries(result.checks).filter(([, value]) => !value).map(([key]) => `${result.viewport.name}:${key}`);
    return [
      ...failedChecks,
      ...result.consoleErrors.map((error) => `${result.viewport.name}:console:${error}`),
      ...result.pageErrors.map((error) => `${result.viewport.name}:page:${error}`),
      ...result.failedRequests.map((error) => `${result.viewport.name}:request:${error}`),
    ];
  });

  const report = {
    status: failed.length ? 'FAIL' : 'PASS',
    generated_at: new Date().toISOString(),
    target: '/provider?api_usage_preview=1&section=api_usage',
    fixture: 'workspace-scoped Rabbi Elie Scheller provider session; no database or production writes',
    results,
    failed,
  };
  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outDir, 'report.md'), [
    '# Rabbi Scheller Provider API Usage Local Smoke',
    '',
    `Status: ${report.status}`,
    '',
    'Scope: local static Provider Portal render with mocked `/api/provider-portal/session`; no database, credentials, external accounts, sends, billing, or production data writes.',
    '',
    '| Viewport | Result | Screenshot | Notes |',
    '|---|---|---|---|',
    ...results.map((result) => {
      const resultFailed = [
        ...Object.entries(result.checks).filter(([, value]) => !value).map(([key]) => key),
        ...result.consoleErrors,
        ...result.pageErrors,
        ...result.failedRequests,
      ];
      return `| ${result.viewport.width}x${result.viewport.height} | ${resultFailed.length ? 'FAIL' : 'PASS'} | ${result.screenshot} | ${resultFailed.length ? resultFailed.join('; ') : 'API Usage nav active; honest empty state visible; no fake usage; no horizontal overflow.'} |`;
    }),
    '',
    'Checks:',
    '',
    '- Provider title visible as Rabbi Elie Scheller.',
    '- API Usage nav appears only through preview entitlement/query flag.',
    '- Direct section deep link opens API Usage, refresh preserves it, clicking API Usage updates the URL, and browser back returns to Overview.',
    '- API Usage section shows the not-instrumented empty state.',
    '- No fabricated request, token, or cost values are displayed.',
    '- No horizontal overflow at 390x844, 768x1024, or 1440x900.',
    '- No console errors, page errors, or failed requests.',
    '',
  ].join('\n'));

  if (failed.length) {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`PASS Provider API Usage local smoke: ${path.relative(repoRoot, path.join(outDir, 'report.md'))}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
