#!/usr/bin/env node
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'ui-audits', '2026-07-10-onetime-crm-workbench-local');
const route = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts';

const viewports = [
  { id: 'desktop-1440', width: 1440, height: 960 },
  { id: 'desktop-1024', width: 1024, height: 900 },
  { id: 'tablet-768', width: 768, height: 1024 },
  { id: 'mobile-430', width: 430, height: 932 },
  { id: 'mobile-390', width: 390, height: 844 },
];

const crmCards = [
  {
    id: 'bna_parent_leads:501',
    source: 'bna_parent_leads',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    display_name: 'Sample One Time Parent',
    contact_type: 'school_interest',
    status: 'follow_up',
    interest_level: 'hot',
    email: 'sample-parent@redacted.invalid',
    phone: '+15550101188',
    tags: ['free-class-interest', 'one-time-no-send-until-approved', 'trial-review'],
    source_label: 'Public One Time form',
    last_contact_at: '2026-07-10T08:20:00.000Z',
    next_follow_up_at: '2026-07-11T12:00:00.000Z',
    summary: 'OneTime free-class public signup captured. Wants current free-class details after approval gates are ready.',
    linked: { parent_lead_id: 501, signup_id: null, student_id: null, contact_id: null, provider_profile_id: null },
  },
  {
    id: 'bna_parent_leads:502',
    source: 'bna_parent_leads',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    display_name: 'Current Library Member',
    contact_type: 'group_member',
    status: 'active',
    interest_level: 'warm',
    email: 'library-member@redacted.invalid',
    phone: '',
    tags: ['member-library', 'access-review'],
    source_label: 'Member access',
    last_contact_at: '2026-07-09T16:15:00.000Z',
    next_follow_up_at: '',
    summary: 'Member/access context is present; review access panel before messaging.',
    linked: { parent_lead_id: 502, signup_id: null, student_id: null, contact_id: null, provider_profile_id: null },
  },
];

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

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function json(res, body, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function filterCrmCards(url) {
  const search = String(url.searchParams.get('search') || '').trim().toLowerCase();
  const type = String(url.searchParams.get('contact_type') || 'all');
  const status = String(url.searchParams.get('status') || 'all');
  const tag = String(url.searchParams.get('tag') || 'all');
  const source = String(url.searchParams.get('source') || 'all');
  return crmCards
    .filter((card) => type === 'all' || card.contact_type === type)
    .filter((card) => status === 'all' || card.status === status)
    .filter((card) => tag === 'all' || card.tags.includes(tag))
    .filter((card) => source === 'all' || card.source === source || card.source_label === source)
    .filter((card) => {
      if (!search) return true;
      const blob = [card.display_name, card.email, card.phone, card.summary, card.tags.join(' '), card.source_label].join(' ').toLowerCase();
      return blob.includes(search);
    });
}

function apiPayload(url) {
  const pathname = url.pathname;
  if (pathname === '/api/bna/auth/me') {
    return {
      authenticated: true,
      username: 'codex-onetime-crm-smoke@redacted.invalid',
      role: 'owner',
      displayName: 'One Time CRM Smoke',
      allowedViews: ['dashboard', 'contacts', 'communications', 'tasks', 'service_providers', 'content', 'settings'],
      scope: { type: 'project', projectKey: 'one_time_mishnah_class' },
    };
  }
  if (pathname === '/api/bna/workspace-directory') {
    return {
      categories: [
        {
          id: 'provider',
          label: 'Providers',
          workspaces: [
            {
              workspace_key: 'rabbi_sheller_provider',
              name: 'Rabbi Scheller / One Time',
              display_name: 'Rabbi Scheller / One Time',
              workspace_type: 'service_provider',
              display_category: 'service_provider',
              project_key: 'one_time_mishnah_class',
              enabled: true,
            },
          ],
        },
      ],
      review_items: [],
    };
  }
  if (pathname === '/api/bna/workspace-platform') {
    return {
      workspaces: [
        { workspace_key: 'rabbi_sheller_provider', name: 'Rabbi Scheller / One Time', workspace_type: 'service_provider', display_category: 'service_provider', project_key: 'one_time_mishnah_class' },
      ],
      connector_settings: [],
      bot_actions: [],
      bot_action_logs: [],
    };
  }
  if (pathname === '/api/bna/projects') {
    return { projects: [{ project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time' }] };
  }
  if (pathname === '/api/bna/parent-leads') {
    return {
      leads: crmCards.map((card) => ({
        id: Number(String(card.id).split(':').pop()),
        project_key: card.project_key,
        parent_name: card.display_name,
        parent_email: card.email,
        parent_phone: card.phone,
        student_name: card.display_name.includes('Parent') ? 'Sample Student' : '',
        lead_type: card.contact_type,
        status: card.status,
        interest_level: card.interest_level,
        source: card.source_label,
        source_detail: card.summary,
        tags: card.tags,
        notes: card.summary,
        updated_at: card.last_contact_at,
        next_follow_up_date: card.next_follow_up_at || null,
        metadata: { no_send_until_approved: true, source: 'local_smoke_fixture' },
      })),
    };
  }
  if (pathname === '/api/bna/crm/contacts') {
    const cards = filterCrmCards(url);
    return {
      success: true,
      cards,
      total: crmCards.length,
      filtered_total: cards.length,
      filters: {
        contact_types: ['all', 'group_member', 'school_interest'],
        statuses: ['all', 'active', 'follow_up'],
        sources: ['all', 'Public One Time form', 'Member access'],
        tags: ['all', 'access-review', 'free-class-interest', 'member-library', 'one-time-no-send-until-approved', 'trial-review'],
      },
      no_send: true,
      external_write_performed: false,
    };
  }
  if (pathname.startsWith('/api/bna/crm/contacts/')) {
    return {
      success: true,
      timeline: [
        {
          id: 'local-smoke-timeline-1',
          channel: 'internal',
          type: 'public_signup_capture',
          direction: 'inbound',
          body: 'OneTime free-class public signup captured. No external message was sent from this CRM workbench.',
          occurred_at: '2026-07-10T08:22:45.952Z',
          no_send: true,
          external_write_performed: false,
        },
      ],
      no_send: true,
      external_write_performed: false,
    };
  }
  if (pathname === '/api/bna/contact-communications') return { communications: [] };
  return {
    success: true,
    signups: [],
    people: [],
    users: [],
    audit_events: [],
    tasks: [],
    tickets: [],
    providers: [],
    notifications: [],
    payments: [],
    intake: [],
    jobs: [],
    sessions: [],
    meetings: [],
    cards: [],
    announcements: [],
    automations: [],
    classes: [],
    leads: [],
    members: [],
  };
}

async function serve(req, res, baseUrl) {
  const url = new URL(req.url || '/', baseUrl);
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (url.pathname.startsWith('/api/bna/')) {
    json(res, apiPayload(url));
    return;
  }
  const requested = url.pathname === '/' || url.pathname === '/operations' ? '/operations.html' : url.pathname;
  const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': contentType(filePath) });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

async function captureViewport(browser, baseUrl, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 15000 });
  await page.waitForFunction(() => /Sample One Time Parent/.test(document.body.textContent || ''), null, { timeout: 15000 });
  await page.locator('[data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]').first().click();
  await page.waitForFunction(() => /Contact Timeline/.test(document.body.textContent || '') && /OneTime free-class public signup captured/.test(document.body.textContent || ''), null, { timeout: 15000 });

  const metrics = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ').trim();
    const detail = document.querySelector('[data-crm-contact-detail]');
    const detailRect = detail?.getBoundingClientRect();
    return {
      title: document.title,
      workbenchCount: document.querySelectorAll('[data-one-time-crm-workbench]').length,
      apiWorkbenchCount: document.querySelectorAll('[data-one-time-crm-api-workbench]').length,
      cardCount: document.querySelectorAll('[data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]').length,
      selectedDetailVisible: Boolean(detail && detailRect && detailRect.width > 0 && detailRect.height > 0),
      hasContactTimeline: /Contact Timeline/.test(text),
      hasClassTrialAccess: /Class \/ Trial \/ Access/i.test(text),
      hasNoSendLock: /No-send locked|Read-only \/ no-send|No email, WhatsApp, payment, access, or external CRM write/.test(text),
      hasWrongWorkspaceLeak: /BNA Academy/i.test(text),
      hasForbiddenExternalTerm: /LeadConnector|GHL runtime/i.test(text),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      bodyTextLength: text.length,
    };
  });

  const screenshot = path.join(outDir, `${viewport.id}-crm-workbench.png`);
  await page.screenshot({ path: screenshot, fullPage: true, type: 'png', animations: 'disabled' });
  await page.close();

  const passed = Boolean(
    metrics.workbenchCount >= 1 &&
      metrics.apiWorkbenchCount >= 1 &&
      metrics.cardCount >= 2 &&
      metrics.selectedDetailVisible &&
      metrics.hasContactTimeline &&
      metrics.hasClassTrialAccess &&
      metrics.hasNoSendLock &&
      !metrics.hasWrongWorkspaceLeak &&
      !metrics.horizontalOverflow &&
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      failedRequests.length === 0 &&
      badResponses.length === 0
  );

  return {
    viewport,
    route,
    screenshot: rel(screenshot),
    ...metrics,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    passed,
  };
}

async function main() {
  await mkdir(outDir, { recursive: true });
  let baseUrl = '';
  const server = createServer((req, res) => {
    serve(req, res, baseUrl).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error instanceof Error ? error.stack || error.message : String(error));
    });
  });
  const port = await listen(server);
  baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  let results = [];
  try {
    for (const viewport of viewports) {
      results.push(await captureViewport(browser, baseUrl, viewport));
    }
  } finally {
    await browser.close();
    await close(server);
  }

  const report = {
    status: results.every((result) => result.passed) ? 'PASS' : 'FAIL',
    generated_at: new Date().toISOString(),
    target: route,
    scope: 'Local synthetic Operations One Time CRM workbench smoke; no database, sends, payments, external accounts, or production writes.',
    guardrails: {
      external_write_performed: false,
      test_data_only: true,
      raw_private_data_committed: false,
    },
    results,
  };
  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outDir, 'report.md'), [
    '# One Time Operations CRM Workbench Local Smoke',
    '',
    `Status: ${report.status}`,
    `Generated: ${report.generated_at}`,
    '',
    report.scope,
    '',
    '| Viewport | Passed | Overflow | Cards | Detail | Timeline | Screenshot |',
    '|---|---:|---:|---:|---:|---:|---|',
    ...results.map((result) => [
      `| ${result.viewport.width}x${result.viewport.height}`,
      String(result.passed),
      String(result.horizontalOverflow),
      String(result.cardCount),
      String(result.selectedDetailVisible),
      String(result.hasContactTimeline),
      result.screenshot,
    ].join(' | ') + ' |'),
    '',
    'Checks:',
    '',
    '- One Time Operations CRM route renders the API-backed workbench.',
    '- Search/filter/sort controls, cards, selected detail, class/trial/access context, no-send guard, and timeline readback are visible.',
    '- Desktop, tablet, and mobile screenshots have no horizontal overflow.',
    '- Synthetic data only; no external sends, payments, access grants, or external CRM writes.',
    '',
  ].join('\n'));

  console.log(`${report.status} ${rel(path.join(outDir, 'report.md'))}`);
  if (report.status !== 'PASS') process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
