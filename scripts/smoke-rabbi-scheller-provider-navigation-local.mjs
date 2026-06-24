#!/usr/bin/env node
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'playwright-smokes', '2026-06-23-rabbi-scheller-provider-navigation-local');

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const expectedSections = [
  'overview',
  'profile',
  'services',
  'class_setup',
  'class_media',
  'media',
  'comments',
  'commercial',
  'entitlements',
  'google_business',
  'upgrade',
  'website_import',
  'communications',
  'integrations',
  'access',
  'activity',
  'api_usage',
  'settings',
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
    contact_name: 'Rabbi Elie Scheller',
    category: 'Mishnah class',
    city: 'Online',
    service_area: 'Remote',
    short_description: 'Workspace-scoped Rabbi provider fixture for local navigation proof.',
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
      sessions: [
        {
          id: 11,
          title: 'Evening Mishnah',
          session_date: '2026-06-23',
        },
      ],
    },
  ],
  entitlements: [
    {
      entitlement_key: 'api_usage_preview',
      enabled: true,
      notes: 'Preview only until workspace-scoped metering persistence is configured.',
    },
    {
      entitlement_key: 'provider_admin',
      enabled: true,
      notes: 'Allows provider workspace administration, not BNA platform administration.',
    },
    {
      entitlement_key: 'landing_page_funnel',
      enabled: true,
      notes: 'Shows safe import planning UI without publishing.',
    },
    {
      entitlement_key: 'content_video_workflow',
      enabled: true,
      notes: 'Shows provider-scoped media planning UI.',
    },
    {
      entitlement_key: 'custom_partnership_terms',
      enabled: true,
      notes: 'Shows provider-scoped integration and access review sections.',
    },
  ],
  integrations: [
    {
      label: 'Vimeo',
      integration_key: 'vimeo',
      external_system: 'Vimeo',
      integration_status: 'not_configured',
      source_of_truth: 'bna_operations',
      notes: 'Configured by BNA Operations after approval.',
    },
  ],
  access_checklist: [
    {
      label: 'Provider owner identity',
      item_key: 'owner_identity',
      status: 'needed',
      next_action: 'Confirm the production owner identity before live credential testing.',
    },
  ],
  messages: [
    {
      id: 101,
      subject: 'Welcome',
      body: 'Provider-scoped communication fixture.',
      direction: 'bna_to_provider',
      status: 'sent',
      created_at: '2026-06-23T00:00:00.000Z',
    },
  ],
  media: [],
  comments: [],
  google_business: {
    status: 'not_configured',
    fallback: 'Google Business Profile is not connected yet.',
    oauth_configured: false,
    maps_key_configured: false,
  },
  upgrade: {
    configured: false,
    message: 'Paid provider features are not enabled until BNA configures Stripe links.',
  },
  one_time_class_media_enabled: true,
  one_time_class_media: [
    {
      id: 201,
      title: 'Opening shiur recording',
      media_kind: 'video',
      status: 'pending_review',
      notes: 'Local fixture only.',
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

function sectionUrl(baseUrl, section) {
  const url = new URL('/provider', baseUrl);
  url.searchParams.set('api_usage_preview', '1');
  if (section !== 'overview') url.searchParams.set('section', section);
  return url.toString();
}

async function verifySection(page, section) {
  const nav = page.locator(`[data-provider-nav="${section}"]`);
  const panel = page.locator(`[data-provider-section="${section}"]:not(.provider-section-hidden)`);
  await nav.waitFor({ state: 'visible' });
  await panel.waitFor({ state: 'visible' });
  const activeNavCount = await page.locator('[data-provider-nav].active').count();
  const visibleSectionCount = await page.locator('[data-provider-section]:not(.provider-section-hidden)').count();
  const activeTarget = await nav.evaluate((node) => node.classList.contains('active'));
  const current = new URL(page.url());
  const queryStateOk = section === 'overview'
    ? !current.searchParams.has('section')
    : current.searchParams.get('section') === section;
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  return {
    section,
    activeTarget,
    activeNavCount,
    visibleSectionCount,
    queryStateOk,
    noHorizontalOverflow,
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

      await page.goto(sectionUrl(baseUrl, 'overview'), { waitUntil: 'networkidle' });
      await page.getByText('Rabbi Elie Scheller').first().waitFor({ state: 'visible' });

      const navIds = await page.locator('[data-provider-nav]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-provider-nav')));
      const navLabels = await page.locator('[data-provider-nav]').evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() || ''));
      const navActionIds = await page.locator('[data-provider-nav]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-action-id')));
      const superAdminNavLabels = navLabels.filter((label) => /platform suite|team\/admin|accounting|credentials|deployment|super admin/i.test(label));

      const clickResults = [];
      for (const section of expectedSections) {
        await page.locator(`[data-provider-nav="${section}"]`).click();
        clickResults.push(await verifySection(page, section));
      }
      await page.goBack();
      await page.waitForFunction(() => document.querySelector('[data-provider-nav="api_usage"]')?.classList.contains('active'));
      const backFromSettings = await verifySection(page, 'api_usage');

      const directResults = [];
      for (const section of expectedSections) {
        await page.goto(sectionUrl(baseUrl, section), { waitUntil: 'networkidle' });
        directResults.push(await verifySection(page, section));
      }
      await page.reload({ waitUntil: 'networkidle' });
      const refreshSettings = await verifySection(page, 'settings');

      const screenshot = path.join(outDir, `${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      results.push({
        viewport,
        screenshot: path.relative(repoRoot, screenshot).replace(/\\/g, '/'),
        navIds,
        navLabels,
        navActionIds,
        superAdminNavLabels,
        clickResults,
        backFromSettings,
        directResults,
        refreshSettings,
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

  const failed = [];
  for (const result of results) {
    const prefix = result.viewport.name;
    if (JSON.stringify(result.navIds) !== JSON.stringify(expectedSections)) {
      failed.push(`${prefix}: navigation ids mismatch ${JSON.stringify(result.navIds)}`);
    }
    if (result.navActionIds.some((id) => id !== 'ACTION-PROVIDER-SECTION-NAVIGATION')) {
      failed.push(`${prefix}: provider nav buttons missing ACTION-PROVIDER-SECTION-NAVIGATION`);
    }
    if (result.superAdminNavLabels.length) {
      failed.push(`${prefix}: super-admin nav labels visible ${result.superAdminNavLabels.join(', ')}`);
    }
    for (const row of [...result.clickResults, ...result.directResults, result.backFromSettings, result.refreshSettings]) {
      if (!row.activeTarget) failed.push(`${prefix}:${row.section}: target nav is not active`);
      if (row.activeNavCount !== 1) failed.push(`${prefix}:${row.section}: active nav count ${row.activeNavCount}`);
      if (row.visibleSectionCount !== 1) failed.push(`${prefix}:${row.section}: visible section count ${row.visibleSectionCount}`);
      if (!row.queryStateOk) failed.push(`${prefix}:${row.section}: query state mismatch`);
      if (!row.noHorizontalOverflow) failed.push(`${prefix}:${row.section}: horizontal overflow`);
    }
    failed.push(...result.consoleErrors.map((error) => `${prefix}:console:${error}`));
    failed.push(...result.pageErrors.map((error) => `${prefix}:page:${error}`));
    failed.push(...result.failedRequests.map((error) => `${prefix}:request:${error}`));
  }

  const report = {
    status: failed.length ? 'FAIL' : 'PASS',
    generated_at: new Date().toISOString(),
    target: '/provider?api_usage_preview=1',
    fixture: 'workspace-scoped Rabbi Elie Scheller provider session; no database or production writes',
    expected_sections: expectedSections,
    results,
    failed,
  };
  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outDir, 'report.md'), [
    '# Rabbi Scheller Provider Navigation Local Smoke',
    '',
    `Status: ${report.status}`,
    '',
    'Scope: local static Provider Portal render with mocked `/api/provider-portal/session`; no database, credentials, external accounts, sends, billing, or production data writes.',
    '',
    `Sections walked: ${expectedSections.join(', ')}`,
    '',
    '| Viewport | Result | Screenshot | Notes |',
    '|---|---|---|---|',
    ...results.map((result) => {
      const resultFailed = failed.filter((item) => item.startsWith(`${result.viewport.name}:`));
      return `| ${result.viewport.width}x${result.viewport.height} | ${resultFailed.length ? 'FAIL' : 'PASS'} | ${result.screenshot} | ${resultFailed.length ? resultFailed.join('; ') : 'Every supported provider section direct-linked and clicked; one active nav and one visible section; browser back and refresh preserved section state; no super-admin nav, failed requests, console errors, or horizontal overflow.'} |`;
    }),
    '',
    'Checks:',
    '',
    '- Provider title visible as Rabbi Elie Scheller.',
    '- Provider nav ids exactly match the supported provider section graph for the fixture.',
    '- Every provider nav button carries `ACTION-PROVIDER-SECTION-NAVIGATION`.',
    '- No Platform Suite, Team/Admin, Accounting, credentials, deployment, or super-admin labels appear in provider nav.',
    '- Every section can be reached by clicking provider nav.',
    '- Every section can be reached by direct `section=` URL.',
    '- Browser back from Settings returns to API Usage.',
    '- Refresh on Settings preserves the Settings section.',
    '- Exactly one nav item is active and exactly one section is visible at a time.',
    '- No horizontal overflow at 390x844, 768x1024, or 1440x900.',
    '- No console errors, page errors, or failed requests.',
    '',
  ].join('\n'));

  if (failed.length) {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`PASS Provider navigation local smoke: ${path.relative(repoRoot, path.join(outDir, 'report.md'))}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
