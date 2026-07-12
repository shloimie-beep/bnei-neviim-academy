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
const routeQuery = '?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts';
const routeTargets = [
  { id: 'split-shell', route: `/operations${routeQuery}` },
];


const viewports = [
  { id: 'desktop-1440', width: 1440, height: 960 },
  { id: 'desktop-1024', width: 1024, height: 900 },
  { id: 'tablet-768', width: 768, height: 1024 },
  { id: 'mobile-430', width: 430, height: 932 },
  { id: 'mobile-390', width: 390, height: 844 },
];

const crmSeedCards = [

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
    summary: 'One Time free-class public signup captured. Wants current free-class details after approval gates are ready.',
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

const generatedCrmCards = Array.from({ length: 78 }, (_, index) => {
  const id = 600 + index;
  return {
    id: `bna_parent_leads:${id}`,
    source: 'bna_parent_leads',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    display_name: `One Time Fixture Contact ${String(index + 1).padStart(2, '0')}`,
    contact_type: index % 2 ? 'group_member' : 'school_interest',
    status: index % 3 ? 'follow_up' : 'active',
    interest_level: index % 2 ? 'warm' : 'hot',
    email: `fixture-${id}@redacted.invalid`,
    phone: index % 4 === 0 ? '' : `+1555010${String(id).padStart(4, '0')}`,
    tags: index % 2 ? ['member-library', 'access-review'] : ['free-class-interest', 'trial-review'],
    source_label: index % 2 ? 'Member access' : 'Public One Time form',
    last_contact_at: '2026-07-09T16:15:00.000Z',
    next_follow_up_at: index % 3 ? '2026-07-12T12:00:00.000Z' : '',
    summary: 'Generated synthetic CRM fixture for frontend pagination and card-cap smoke.',
    linked: { parent_lead_id: id, signup_id: null, student_id: null, contact_id: null, provider_profile_id: null },
  };
});

const crmCards = [...crmSeedCards, ...generatedCrmCards];
const apiRequests = [];
const staticRequests = [];
const timelineByContactId = new Map(crmCards.map((card) => [
  card.id,
  [
    {
      id: `${card.id}:initial`,
      channel: 'crm',
      type: 'contact_summary',
      direction: 'internal',
      body: card.summary,
      occurred_at: card.last_contact_at,
    },
  ],
]));


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
  const filtered = crmCards
    .filter((card) => type === 'all' || card.contact_type === type)
    .filter((card) => status === 'all' || card.status === status)
    .filter((card) => tag === 'all' || card.tags.includes(tag))
    .filter((card) => source === 'all' || card.source === source || card.source_label === source)
    .filter((card) => {
      if (!search) return true;
      const blob = [card.display_name, card.email, card.phone, card.summary, card.tags.join(' '), card.source_label].join(' ').toLowerCase();
      return blob.includes(search);
    });
  const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit') || crmCards.length), crmCards.length));
  return { filtered, cards: filtered.slice(0, limit), limit };
}

function findCrmCardFromPath(pathname = '') {
  const encodedId = pathname.replace(/^\/api\/bna\/crm\/contacts\//, '').replace(/\/timeline$/, '');
  const id = decodeURIComponent(encodedId);
  return crmCards.find((card) => String(card.id) === id) || null;
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  if (!value) return [];
  return String(value).split(',').map((tag) => tag.trim()).filter(Boolean);
}

function apiPayload(url, { method = 'GET', body = {} } = {}) {
  const pathname = url.pathname;
  apiRequests.push({
    method,
    pathname,
    search: url.search,
    workspace: url.searchParams.get('workspace') || url.searchParams.get('workspace_key') || '',
    project: url.searchParams.get('project') || url.searchParams.get('project_key') || '',
  });
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
    const { filtered, cards, limit } = filterCrmCards(url);

    return {
      success: true,
      cards,
      total: crmCards.length,
      filtered_total: filtered.length,
      limit,
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
  if (pathname.startsWith('/api/bna/crm/contacts/') && pathname.endsWith('/timeline')) {
    const card = findCrmCardFromPath(pathname);
    return {
      success: true,
      timeline: card ? timelineByContactId.get(card.id) || [] : [],
      no_send: true,
      external_write_performed: false,
    };
  }
  if (pathname.startsWith('/api/bna/crm/contacts/') && method === 'PATCH') {
    const card = findCrmCardFromPath(pathname);
    if (!card) {
      return {
        status: 404,
        body: { success: false, error: 'CRM contact not found in this workspace.', external_write_performed: false },
      };
    }
    card.display_name = body.display_name || card.display_name;
    card.email = body.email || card.email;
    card.phone = body.phone || card.phone;
    card.status = body.status || body.lifecycle_stage || card.status;
    card.next_follow_up_at = body.next_follow_up_at || card.next_follow_up_date || card.next_follow_up_at;
    card.assigned_owner = body.assigned_owner || card.assigned_owner;
    card.tags = normalizeTags(body.tags).length ? normalizeTags(body.tags) : card.tags;
    card.last_contact_at = '2026-07-12T09:55:00.000Z';
    if (body.note_body) card.summary = body.note_body;
    const followUpTask = body.create_follow_up_task
      ? {
          task_id: 9001,
          assigned_to: card.assigned_owner || 'Rabbi Scheller team',
          due_date: card.next_follow_up_at || null,
          status: 'assigned',
        }
      : null;
    if (followUpTask) card.follow_up_task = followUpTask;
    const timeline = timelineByContactId.get(card.id) || [];
    timeline.unshift({
      id: `${card.id}:safe-update`,
      channel: 'internal_note',
      type: followUpTask ? 'crm_workbench_update_follow_up_task' : 'crm_workbench_update',
      direction: 'internal',
      body: body.note_body || 'CRM contact updated locally.',
      occurred_at: '2026-07-12T09:55:00.000Z',
      no_send: true,
      external_write_performed: false,
      source_context: {
        create_follow_up_task: Boolean(followUpTask),
        no_checkout: true,
        no_access_granted: true,
      },
    });
    timelineByContactId.set(card.id, timeline);
    return {
      success: true,
      contact: card,
      local_event: timeline[0],
      follow_up_task: followUpTask,
      timeline,
      no_send: true,
      no_checkout: true,
      no_access_granted: true,
      no_import_performed: true,
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
    let rawBody = '';
    for await (const chunk of req) rawBody += chunk;
    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = {};
      }
    }
    const payload = apiPayload(url, { method: req.method || 'GET', body });
    if (payload && typeof payload === 'object' && Number.isInteger(payload.status) && payload.body) {
      json(res, payload.body, payload.status);
    } else {
      json(res, payload);
    }
    return;
  }
  const requested = url.pathname === '/'
    ? '/operations-bootstrap.html'
    : url.pathname === '/operations'
      ? '/operations-bootstrap.html'
      : url.pathname;
  staticRequests.push({
    request_path: url.pathname,
    served_path: requested,
  });
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

async function captureViewport(browser, baseUrl, viewport, target) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  const crmRequests = [];
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !/403 \(Forbidden\)/i.test(text)) consoleErrors.push(text);
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const failureText = request.failure()?.errorText || '';
    const isExpectedNavigationAbort = request.method() === 'GET'
      && /net::ERR_ABORTED/i.test(failureText)
      && request.url().startsWith(baseUrl);
    const isExpectedExternalFontAbort = request.method() === 'GET'
      && /net::ERR_ABORTED/i.test(failureText)
      && request.url().startsWith('https://fonts.googleapis.com/');
    if (!isExpectedNavigationAbort && !isExpectedExternalFontAbort) failedRequests.push(`${request.method()} ${request.url()} ${failureText}`.trim());
  });
  page.on('response', (response) => {
    const expectedDeniedCrmRead = response.status() === 403
      && response.url().includes('/api/bna/crm/contacts')
      && response.url().includes('workspace=bna');
    if (response.status() >= 400 && !expectedDeniedCrmRead) badResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on('request', (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.pathname.startsWith('/api/bna/crm/contacts')) {
      crmRequests.push({
        method: request.method(),
        pathname: requestUrl.pathname,
        search: requestUrl.search,
      });
    }
  });

  const staticRequestsBeforeGoto = staticRequests.length;
  await page.goto(`${baseUrl}${target.route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 15000 });
  await page.waitForFunction(() => /Sample One Time Parent/.test(document.body.textContent || ''), null, { timeout: 15000 });
  const routeStaticRequests = staticRequests.slice(staticRequestsBeforeGoto);
  const canonicalRouteProof = {
    url_path: new URL(page.url()).pathname,
    served_bootstrap: routeStaticRequests.some((item) => item.request_path === '/operations' && item.served_path === '/operations-bootstrap.html'),
    used_legacy_monolith_route: routeStaticRequests.some((item) => item.request_path === '/operations.html'),
    loaded_operations_shell: routeStaticRequests.some((item) => item.served_path === '/js/operations-shell.js'),
    loaded_generated_ia: routeStaticRequests.some((item) => item.served_path === '/js/one-time-rabbi-dashboard-ia.generated.js'),
    loaded_operations_css: routeStaticRequests.some((item) => item.served_path === '/css/operations-shell.css'),
  };
  const initialMetrics = await page.evaluate(() => ({
    cardCount: document.querySelectorAll('[data-first-party-crm-card]').length,
    paneCount: document.querySelectorAll('[data-crm-pane-count="3"]').length,
    listPaneVisible: Boolean(document.querySelector('.crm-workbench-list')?.getBoundingClientRect?.().width),
    activityPaneVisible: Boolean(document.querySelector('[data-crm-contact-detail]')?.getBoundingClientRect?.().width),
    profilePaneVisible: Boolean(document.querySelector('[data-crm-contact-profile]')?.getBoundingClientRect?.().width),
    legacyTableClosedCount: document.querySelectorAll('[data-one-time-crm-review-context]:not([open]) [data-one-time-crm-contact-table]').length,
    legacyPlaceholderCount: document.querySelectorAll('[data-one-time-crm-review-placeholder]').length,
  }));
  const initialCrmRequestCount = crmRequests.length;
  const initialListRequestCount = crmRequests.filter((item) => item.pathname === '/api/bna/crm/contacts').length;
  const initialLimitRequests = crmRequests
    .filter((item) => item.pathname === '/api/bna/crm/contacts')
    .map((item) => new URLSearchParams(item.search).get('limit'));

  await page.evaluate(() => {
    window.__crmSmokeAppRootMutations = 0;
    const app = document.getElementById('app');
    if (!app) return;
    window.__crmSmokeRootObserver = new MutationObserver((mutations) => {
      window.__crmSmokeAppRootMutations += mutations.filter((mutation) => mutation.target === app && mutation.type === 'childList').length;
    });
    window.__crmSmokeRootObserver.observe(app, { childList: true });
  });

  await page.locator('[data-first-party-crm-card] [data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]').first().click();
  await page.waitForFunction(() => /Contact Timeline/.test(document.body.textContent || '') && /One Time free-class public signup captured/.test(document.body.textContent || ''), null, { timeout: 15000 });
  const selectedMetrics = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ').trim();
    const detail = document.querySelector('[data-crm-contact-detail]');
    const profile = document.querySelector('[data-crm-contact-profile]');
    const list = document.querySelector('.crm-workbench-list');
    const detailRect = detail?.getBoundingClientRect();
    const profileRect = profile?.getBoundingClientRect();
    const listRect = list?.getBoundingClientRect();
    return {
      selectedDetailVisible: Boolean(detail && detailRect && detailRect.width > 0 && detailRect.height > 0),
      selectedProfileVisible: Boolean(profile && profileRect && profileRect.width > 0 && profileRect.height > 0),
      selectedListHiddenOnMobile: window.innerWidth <= 700 ? Boolean(!list || listRect.width === 0 || window.getComputedStyle(list).display === 'none') : true,
      hasContactTimeline: /Contact Timeline/.test(text),
      hasClassTrialAccess: /Class \/ Trial \/ Access/i.test(text),
      hasNoSendLock: /No-send locked|Scoped no-send|Read-only preview|Read-only \/ no-send|No email, WhatsApp, payment, access, or external CRM write/.test(text),
      hasSafeActionPanel: Boolean(document.querySelector('[data-crm-safe-actions]')),
      disabledCrmActionCount: document.querySelectorAll('[data-action-id="ACTION-CRM-REPLY-DRAFT-BLOCKED"][disabled], [data-action-id="ACTION-CRM-INTERNAL-NOTE-BLOCKED"][disabled], [data-action-id="ACTION-CRM-TASK-BLOCKED"][disabled]').length,
      hasOpenScopedInboxAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-OPEN-SCOPED-INBOX"]')),
    };
  });
  let mobileBackMetrics = { checked: viewport.width <= 700, restoredList: true, clearedSelectedState: true };
  if (viewport.width <= 700) {
    await page.locator('[data-action-id="ACTION-CRM-CONTACT-BACK"]').click();
    await page.waitForFunction(() => document.querySelector('[data-one-time-crm-workbench]')?.getAttribute('data-selected-contact') === 'false', null, { timeout: 15000 });
    mobileBackMetrics = await page.evaluate(() => {
      const list = document.querySelector('.crm-workbench-list');
      const listRect = list?.getBoundingClientRect();
      return {
        checked: true,
        restoredList: Boolean(list && listRect && listRect.width > 0 && listRect.height > 0 && window.getComputedStyle(list).display !== 'none'),
        clearedSelectedState: document.querySelector('[data-one-time-crm-workbench]')?.getAttribute('data-selected-contact') === 'false',
      };
    });
    await page.locator('[data-first-party-crm-card] [data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]').first().click();
    await page.waitForFunction(() => /Contact Timeline/.test(document.body.textContent || '') && /One Time free-class public signup captured/.test(document.body.textContent || ''), null, { timeout: 15000 });
  }
  const listRequestsAfterSelect = crmRequests.filter((item) => item.pathname === '/api/bna/crm/contacts').length;
  const timelineRequestsAfterSelect = crmRequests.filter((item) => item.pathname.startsWith('/api/bna/crm/contacts/')).length;
  const appRootMutationsAfterSelect = await page.evaluate(() => window.__crmSmokeAppRootMutations || 0);

  const listRequestsBeforeSearch = crmRequests.filter((item) => item.pathname === '/api/bna/crm/contacts').length;
  await page.evaluate(() => {
    const input = document.querySelector('[data-first-party-crm-search]');
    if (!input) throw new Error('CRM search input not found.');
    ['C', 'Cu', 'Curr', 'Current'].forEach((value) => {
      input.value = value;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: value }));
    });
  });
  await page.waitForFunction(() => /Current Library Member/.test(document.body.textContent || ''), null, { timeout: 15000 });
  await page.waitForTimeout(420);
  const searchListRequestDelta = crmRequests.filter((item) => item.pathname === '/api/bna/crm/contacts').length - listRequestsBeforeSearch;

  await page.evaluate(() => {
    const details = document.querySelector('[data-one-time-crm-review-context]');
    if (!details) throw new Error('CRM review/source details panel not found.');
    details.open = true;
    if (typeof window.toggleOneTimeCrmReviewContext === 'function') window.toggleOneTimeCrmReviewContext(details);
    else details.dispatchEvent(new Event('toggle', { bubbles: true }));
  });
  await page.waitForFunction(() => document.querySelectorAll('[data-one-time-crm-review-context][open] [data-one-time-crm-contact-table]').length > 0, null, { timeout: 15000 });
  const legacyTableOpenCount = await page.locator('[data-one-time-crm-review-context][open] [data-one-time-crm-contact-table]').count();


  const metrics = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ').trim();
    const detail = document.querySelector('[data-crm-contact-detail]');
    const profile = document.querySelector('[data-crm-contact-profile]');
    const detailRect = detail?.getBoundingClientRect();
    const profileRect = profile?.getBoundingClientRect();
    return {
      title: document.title,
      workbenchCount: document.querySelectorAll('[data-one-time-crm-workbench]').length,
      apiWorkbenchCount: document.querySelectorAll('[data-one-time-crm-api-workbench]').length,
      paneCount: document.querySelectorAll('[data-crm-pane-count="3"]').length,
      cardCount: document.querySelectorAll('[data-first-party-crm-card]').length,
      selectedDetailVisible: Boolean(detail && detailRect && detailRect.width > 0 && detailRect.height > 0),
      selectedProfileVisible: Boolean(profile && profileRect && profileRect.width > 0 && profileRect.height > 0),
      hasContactTimeline: /Contact Timeline/.test(text),
      hasClassTrialAccess: /Class \/ Trial \/ Access/i.test(text),
      hasNoSendLock: /No-send locked|Scoped no-send|Read-only preview|Read-only \/ no-send|No email, WhatsApp, payment, access, or external CRM write/.test(text),
      hasSafeActionPanel: Boolean(document.querySelector('[data-crm-safe-actions]')),
      disabledCrmActionCount: document.querySelectorAll('[data-action-id="ACTION-CRM-REPLY-DRAFT-BLOCKED"][disabled], [data-action-id="ACTION-CRM-INTERNAL-NOTE-BLOCKED"][disabled], [data-action-id="ACTION-CRM-TASK-BLOCKED"][disabled]').length,

      hasWrongWorkspaceLeak: /BNA Academy/i.test(text),
      hasForbiddenExternalTerm: /LeadConnector|GHL runtime/i.test(text),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      bodyTextLength: text.length,
    };
  });
  const patchRequests = apiRequests.filter((request) => request.method === 'PATCH' && request.pathname.startsWith('/api/bna/crm/contacts/'));
  const contactsReads = apiRequests.filter((request) => request.method === 'GET' && request.pathname === '/api/bna/crm/contacts');

  const screenshot = path.join(outDir, `${target.id}-${viewport.id}-crm-workbench.png`);
  await page.screenshot({ path: screenshot, fullPage: true, type: 'png', animations: 'disabled' });
  await page.close();

  const passed = Boolean(
    target.route.startsWith('/operations?') &&
      canonicalRouteProof.url_path === '/operations' &&
      canonicalRouteProof.served_bootstrap &&
      !canonicalRouteProof.used_legacy_monolith_route &&
      canonicalRouteProof.loaded_operations_shell &&
      canonicalRouteProof.loaded_generated_ia &&
      canonicalRouteProof.loaded_operations_css &&
      metrics.workbenchCount >= 1 &&
      metrics.apiWorkbenchCount >= 1 &&
      initialMetrics.paneCount >= 1 &&
      initialMetrics.listPaneVisible &&
      initialMetrics.activityPaneVisible &&
      initialMetrics.profilePaneVisible &&
      initialMetrics.cardCount > 0 &&
      initialMetrics.cardCount <= 50 &&
      initialCrmRequestCount <= 3 &&
      initialListRequestCount <= 1 &&
      initialLimitRequests.every((value) => value === '50') &&
      selectedMetrics.selectedDetailVisible &&
      selectedMetrics.selectedProfileVisible &&
      selectedMetrics.selectedListHiddenOnMobile &&
      selectedMetrics.hasContactTimeline &&
      selectedMetrics.hasClassTrialAccess &&
      selectedMetrics.hasNoSendLock &&
      selectedMetrics.hasSafeActionPanel &&
      selectedMetrics.disabledCrmActionCount >= 3 &&
      selectedMetrics.hasOpenScopedInboxAction &&
      mobileBackMetrics.restoredList &&
      mobileBackMetrics.clearedSelectedState &&
      listRequestsAfterSelect === initialListRequestCount &&
      timelineRequestsAfterSelect >= 1 &&
      appRootMutationsAfterSelect === 0 &&
      searchListRequestDelta === 1 &&
      initialMetrics.legacyTableClosedCount === 0 &&
      initialMetrics.legacyPlaceholderCount >= 1 &&
      legacyTableOpenCount >= 1 &&

      !metrics.hasWrongWorkspaceLeak &&
      !metrics.hasForbiddenExternalTerm &&
      patchRequests.length === 0 &&
      contactsReads.some((request) => /workspace=rabbi_sheller_provider/.test(request.search)) &&
      !metrics.horizontalOverflow &&
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      failedRequests.length === 0 &&
      badResponses.length === 0
  );

  return {
    viewport,
    route: target.route,
    target: target.id,
    screenshot: rel(screenshot),
    canonicalRouteProof,
    initialCrmRequestCount,
    initialListRequestCount,
    initialRenderedCardCount: initialMetrics.cardCount,
    initialPaneCount: initialMetrics.paneCount,
    initialListPaneVisible: initialMetrics.listPaneVisible,
    initialActivityPaneVisible: initialMetrics.activityPaneVisible,
    initialProfilePaneVisible: initialMetrics.profilePaneVisible,
    initialLimitRequests,
    selectedDetailVisibleAfterSelect: selectedMetrics.selectedDetailVisible,
    selectedProfileVisibleAfterSelect: selectedMetrics.selectedProfileVisible,
    selectedListHiddenOnMobile: selectedMetrics.selectedListHiddenOnMobile,
    hasContactTimelineAfterSelect: selectedMetrics.hasContactTimeline,
    hasClassTrialAccessAfterSelect: selectedMetrics.hasClassTrialAccess,
    hasNoSendLockAfterSelect: selectedMetrics.hasNoSendLock,
    hasSafeActionPanelAfterSelect: selectedMetrics.hasSafeActionPanel,
    disabledCrmActionCountAfterSelect: selectedMetrics.disabledCrmActionCount,
    hasOpenScopedInboxActionAfterSelect: selectedMetrics.hasOpenScopedInboxAction,
    mobileBackMetrics,
    listRequestsAfterSelect,
    timelineRequestsAfterSelect,
    appRootMutationsAfterSelect,
    searchListRequestDelta,
    legacyTableClosedCount: initialMetrics.legacyTableClosedCount,
    legacyTableOpenCount,
    ...metrics,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    passed,
  };
}

async function captureInboxContext(browser, baseUrl) {
  const viewport = { id: 'desktop-1024', width: 1024, height: 900 };
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

  await page.goto(`${baseUrl}/operations${routeQuery}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 15000 });
  await page.waitForFunction(() => /Sample One Time Parent/.test(document.body.textContent || ''), null, { timeout: 15000 });
  await page.locator('[data-first-party-crm-card] [data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]').first().click();
  await page.waitForFunction(() => /Contact Timeline/.test(document.body.textContent || ''), null, { timeout: 15000 });
  await page.locator('[data-action-id="ACTION-CRM-OPEN-SCOPED-INBOX"]').click();
  await page.waitForSelector('[data-email-operator-workspace][data-one-time-inbox-workspace="true"]', { timeout: 20000 });
  await page.waitForFunction(() => /One Time Inbox/.test(document.body.textContent || '') && /One Time Inbox context/.test(document.body.textContent || ''), null, { timeout: 20000 });
  const screenshot = path.join(outDir, 'split-shell-desktop-1024-one-time-inbox.png');
  await page.screenshot({ path: screenshot, fullPage: true, type: 'png', animations: 'disabled' });
  const mailboxUrl = page.url();
  const metrics = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ').trim();
    return {
      hasOneTimeInbox: /One Time Inbox/.test(text),
      hasInboxContext: Boolean(document.querySelector('[data-email-selected-crm-context]')) && /Sample One Time Parent/.test(text),
      hasRabbiScope: /Rabbi \/ One Time|one_time_mishnah_class|rabbi_sheller_provider/.test(text),
      hasSendGate: /SEND_RESEND_EMAIL|Locked until sender\/domain readiness|No email is sent/i.test(text),
      hasWrongInboxDefault: /Now Viewing: BNA \/ Shloimie Inbox/.test(text),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
  await page.close();
  const passed = Boolean(
    metrics.hasOneTimeInbox &&
      metrics.hasInboxContext &&
      metrics.hasRabbiScope &&
      metrics.hasSendGate &&
      !metrics.hasWrongInboxDefault &&
      /view=communications/.test(mailboxUrl) &&
      /section=email/.test(mailboxUrl) &&
      /inbox=rabbi/.test(mailboxUrl) &&
      !metrics.horizontalOverflow &&
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      failedRequests.length === 0 &&
      badResponses.length === 0
  );
  return {
    target: 'split-shell',
    route: `/operations${routeQuery} -> communications/email?inbox=rabbi`,
    viewport,
    screenshot: rel(screenshot),
    ...metrics,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    mailboxUrl,
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
      for (const target of routeTargets) {
        results.push(await captureViewport(browser, baseUrl, viewport, target));
      }
    }
    var inboxContextResult = await captureInboxContext(browser, baseUrl);
  } finally {
    await browser.close();
    await close(server);
  }

  const inboxResults = [inboxContextResult].filter(Boolean);
  const report = {
    status: results.every((result) => result.passed) && inboxResults.every((result) => result.passed) ? 'PASS' : 'FAIL',
    generated_at: new Date().toISOString(),
    target: routeTargets.map((target) => target.route).join(' + '),
    scope: 'Local synthetic Operations One Time CRM workbench smoke; no database, sends, payments, external accounts, or production writes.',

    guardrails: {
      external_write_performed: false,
      test_data_only: true,
      raw_private_data_committed: false,
    },
    results,
    inbox_context_results: inboxResults,
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
    '| Target | Viewport | Passed | Bootstrap route | CRM calls | Initial cards | Root rerenders | Search requests | Legacy table closed/open | Screenshot |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---|',
    ...results.map((result) => [
      `| ${result.target}`,
      `${result.viewport.width}x${result.viewport.height}`,
      String(result.passed),
      String(Boolean(result.canonicalRouteProof?.served_bootstrap && !result.canonicalRouteProof?.used_legacy_monolith_route)),
      String(result.initialCrmRequestCount),
      String(result.initialRenderedCardCount),
      String(result.appRootMutationsAfterSelect),
      String(result.searchListRequestDelta),
      `${result.legacyTableClosedCount}/${result.legacyTableOpenCount}`,
      result.screenshot,
    ].join(' | ') + ' |'),
    '',
    'Inbox context:',
    '',
    '| Target | Viewport | Passed | One Time Inbox | Context | Scope | Send gate | Screenshot |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...inboxResults.map((result) => [
      `| ${result.target}`,
      `${result.viewport.width}x${result.viewport.height}`,
      String(result.passed),
      String(result.hasOneTimeInbox),
      String(result.hasInboxContext),
      String(result.hasRabbiScope),
      String(result.hasSendGate),
      result.screenshot,
    ].join(' | ') + ' |'),
    '',
    'Checks:',
    '',
    '- One Time Operations CRM route renders the API-backed workbench.',
    '- Canonical /operations renders through operations-bootstrap.html with split-shell assets; the legacy /operations.html monolith route is not used for proof.',
    '- Search/filter/sort controls, cards, three CRM panes, selected detail, profile, class/trial/access context, no-send guard, safe action locks, and timeline readback are visible.',
    '- Mobile selected-contact state hides the list and Back to contacts restores it.',
    '- Scoped One Time Inbox retains selected CRM contact context and keeps send gates visible.',
    '- Initial CRM API calls after auth are <= 3, initial cards are <= 50, contact selection does not replace the app root, and debounced search sends one list request.',
    '- Legacy CRM review/source table is absent while the details panel is closed and present after it is opened.',

    '- Desktop, tablet, and mobile screenshots have no horizontal overflow.',
    '- Synthetic local records only; no external sends, payments, access grants, or external CRM writes.',
    report.remaining_blocker ? `- Remaining blocker: ${report.remaining_blocker}` : '',
    '',
  ].join('\n'));

  console.log(`${report.status} ${rel(path.join(outDir, 'report.md'))}`);
  if (report.status !== 'PASS') process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
