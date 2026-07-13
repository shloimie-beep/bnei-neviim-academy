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
  { id: 'monolith', route: `/operations.html${routeQuery}` },
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
    follow_up_task: {
      task_id: 9001,
      assigned_to: 'Rabbi Scheller team',
      due_date: '2026-07-11T12:00:00.000Z',
      status: 'assigned',
    },
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
  if (url.pathname === '/api/performance/rum') {
    for await (const _chunk of req) {
      // Drain sendBeacon/fetch bodies so the synthetic smoke server can close cleanly.
    }
    json(res, {
      success: true,
      accepted: true,
      dry_run: true,
      external_write_performed: false,
    });
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

  await page.goto(`${baseUrl}${target.route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 15000 });
  await page.waitForFunction(() => /Sample One Time Parent/.test(document.body.textContent || ''), null, { timeout: 15000 });
  const initialMetrics = await page.evaluate(() => ({
    cardCount: document.querySelectorAll('[data-first-party-crm-card]').length,
    paneCount: document.querySelectorAll('[data-crm-pane-count="3"]').length,
    listPaneVisible: Boolean(document.querySelector('.crm-workbench-list')?.getBoundingClientRect?.().width),
    activityPaneVisible: Boolean(document.querySelector('[data-crm-contact-detail]')?.getBoundingClientRect?.().width),
    profilePaneVisible: Boolean(document.querySelector('[data-crm-contact-profile]')?.getBoundingClientRect?.().width),
    legacyTableClosedCount: document.querySelectorAll('[data-one-time-crm-review-context]:not([open]) [data-one-time-crm-contact-table]').length,
    legacyPlaceholderCount: document.querySelectorAll('[data-one-time-crm-review-placeholder]').length,
    crmContractVersion: document.querySelector('[data-shared-crm-workbench]')?.getAttribute('data-crm-contract-version') || '',
    crmComponentOrder: document.querySelector('[data-shared-crm-workbench]')?.getAttribute('data-crm-component-order') || '',
    crmMobileBreakpoint: document.querySelector('[data-shared-crm-workbench]')?.getAttribute('data-crm-mobile-breakpoint') || '',
    crmBackControlHeight: document.querySelector('[data-shared-crm-workbench]')?.getAttribute('data-crm-back-control-height') || '',
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

  const addContactMetrics = {
    hasAction: await page.locator('[data-action-id="ACTION-CRM-ADD-CONTACT"]').count().then((count) => count > 0),
    formVisible: false,
    noExternalCopy: false,
  };
  await page.locator('[data-action-id="ACTION-CRM-ADD-CONTACT"]').first().click();
  await page.waitForSelector('[data-crm-add-contact-form]', { timeout: 5000 });
  Object.assign(addContactMetrics, await page.evaluate(() => {
    const form = document.querySelector('[data-crm-add-contact-form]');
    const text = form?.innerText.replace(/\s+/g, ' ').trim() || '';
    return {
      formVisible: Boolean(form),
      noExternalCopy: /No email, WhatsApp, Telegram, payment, access, import, or external CRM write runs/.test(text),
    };
  }));
  await page.locator('[data-crm-add-contact-cancel]').click();
  await page.waitForFunction(() => !document.querySelector('[data-crm-add-contact-form]'), null, { timeout: 5000 });

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
      selectedProfileResponsiveState: window.innerWidth <= 700
        ? Boolean(!profile || profileRect.width === 0 || window.getComputedStyle(profile).display === 'none')
        : Boolean(profile && profileRect && profileRect.width > 0 && profileRect.height > 0),
      selectedListHiddenOnMobile: window.innerWidth <= 700 ? Boolean(!list || listRect.width === 0 || window.getComputedStyle(list).display === 'none') : true,
      hasFocusedContactHeader: Boolean(document.querySelector('[data-crm-focused-contact-header]')),
      hasSubviewRail: Boolean(document.querySelector('[data-crm-subview-rail]')),
      activeSubview: document.querySelector('[data-crm-selected-detail]')?.getAttribute('data-crm-active-subview') || '',
      hasActionOverflow: Boolean(document.querySelector('[data-crm-action-overflow]')),
      actionOverflowOpen: Boolean(document.querySelector('[data-crm-action-overflow][open]')),
      activeSubviewPanel: Boolean(document.querySelector('[data-crm-active-subview-panel="activity"]')),
      lazySectionData: document.querySelector('[data-one-time-crm-workbench]')?.getAttribute('data-crm-lazy-section-data') === 'true',
      hasContactTimeline: /Contact Timeline/.test(text),
      hasClassTrialAccess: /Class \/ Trial \/ Access/i.test(text),
      hasNoSendLock: /Review mode|Scoped review|Read-only preview|No email, WhatsApp, payment, access, or external CRM write/.test(text),
      hasSafeActionPanel: Boolean(document.querySelector('[data-crm-safe-actions]')),
      hasAddContactAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-ADD-CONTACT"]')),
      hasCreateTaskAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-CREATE-TASK"]:not([disabled])')),
      hasArchiveContactAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-ARCHIVE-CONTACT"]:not([disabled])')),
      mobileBackControlHeight: window.innerWidth <= 700 ? (document.querySelector('[data-action-id="ACTION-CRM-CONTACT-BACK"]')?.getBoundingClientRect?.().height || 0) : 40,
      disabledCrmActionCount: document.querySelectorAll('[data-action-id="ACTION-CRM-CREATE-TASK"][disabled], [data-action-id="ACTION-CRM-REPLY-DRAFT-BLOCKED"][disabled], [data-action-id="ACTION-CRM-INTERNAL-NOTE-BLOCKED"][disabled], [data-action-id="ACTION-CRM-TASK-BLOCKED"][disabled]').length,
      hasOpenScopedInboxAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-OPEN-SCOPED-INBOX"]')),
    };
  });
  const selectedDetailScreenshot = path.join(outDir, `${target.id}-${viewport.id}-crm-selected-detail.png`);
  await page.screenshot({ path: selectedDetailScreenshot, fullPage: true, type: 'png', animations: 'disabled' });
  const detailRequestsBeforeSubviewClicks = crmRequests.filter((item) => item.pathname.startsWith('/api/bna/crm/contacts/')).length;
  const conversationRequestsBeforeSubviewClicks = crmRequests.filter((item) => item.pathname.endsWith('/conversations')).length;
  const taskRequestsBeforeSubviewClicks = crmRequests.filter((item) => item.pathname.endsWith('/tasks')).length;
  const workspaceTabs = [
    { id: 'overview', label: 'Overview', pattern: /Lifecycle|Owner|Class \/ Trial \/ Access/i },
    { id: 'conversations', label: 'Conversations', pattern: /No conversations yet|email messages|Open email thread/i },
    { id: 'tasks', label: 'Tasks', pattern: /No tasks assigned|Task #|Create task|Complete task|Reopen task/i },
    { id: 'access', label: 'Access', pattern: /Membership|Class Activity|Linked Records/i },
    { id: 'identity', label: 'Identity', pattern: /Communication Preference|Consent \/ Suppression|Email is not available|WhatsApp is not available/i },
    { id: 'family', label: 'Family', pattern: /Family \/ School|No membership linked|No follow-up scheduled|Linked Records/i },
    { id: 'activity', label: 'Activity', pattern: /Local CRM update|Safe next actions/i },
  ];
  const workspaceTabMetrics = {};
  let taskTabActionMetrics = { hasLinkedTaskPanel: false, hasCompleteTaskAction: false, hasReopenTaskAction: false };
  let memberLinkMetrics = { hasMemberLinkPanel: false, hasLinkMemberAction: false };
  for (const tab of workspaceTabs) {
    await page.locator('.crm-workbench-tabs [role="tab"]', { hasText: tab.label }).click();
    await page.waitForFunction(({ label, id, patternSource }) => {
      const active = document.querySelector('.crm-workbench-tabs [role="tab"][aria-selected="true"]');
      const text = document.body.innerText.replace(/\s+/g, ' ').trim();
      if (!active || !active.textContent.includes(label)) return false;
      if (id === 'conversations' && /Loading conversations/i.test(text)) return false;
      if (id === 'tasks' && /Loading tasks/i.test(text)) return false;
      return new RegExp(patternSource, 'i').test(text);
    }, { label: tab.label, id: tab.id, patternSource: tab.pattern.source }, { timeout: 10000 });
    workspaceTabMetrics[tab.id] = await page.evaluate((label) => {
      const active = document.querySelector('.crm-workbench-tabs [role="tab"][aria-selected="true"]');
      const text = document.body.innerText.replace(/\s+/g, ' ').trim();
      return {
        active: Boolean(active && active.textContent.includes(label)),
        text,
      };
    }, tab.label).then((result) => result.active && tab.pattern.test(result.text));
    if (tab.id === 'tasks') {
      taskTabActionMetrics = await page.evaluate(() => ({
        hasLinkedTaskPanel: Boolean(document.querySelector('[data-crm-linked-task-state]')),
        hasCompleteTaskAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-COMPLETE-TASK"]:not([disabled])')),
        hasReopenTaskAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-REOPEN-TASK"]')),
      }));
    }
    if (tab.id === 'access') {
      memberLinkMetrics = await page.evaluate(() => ({
        hasMemberLinkPanel: Boolean(document.querySelector('[data-crm-member-link-state]')),
        hasLinkMemberAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-LINK-MEMBER"]:not([disabled])')),
      }));
    }
  }
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
  const conversationRequestsAfterSubviewClicks = crmRequests.filter((item) => item.pathname.endsWith('/conversations')).length;
  const taskRequestsAfterSubviewClicks = crmRequests.filter((item) => item.pathname.endsWith('/tasks')).length;
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
      hasNoSendLock: /Review mode|Scoped review|Read-only preview|No email, WhatsApp, payment, access, or external CRM write/.test(text),
      hasSafeActionPanel: Boolean(document.querySelector('[data-crm-safe-actions]')),
      hasCreateTaskAction: Boolean(document.querySelector('[data-action-id="ACTION-CRM-CREATE-TASK"]:not([disabled])')),
      disabledCrmActionCount: document.querySelectorAll('[data-action-id="ACTION-CRM-CREATE-TASK"][disabled], [data-action-id="ACTION-CRM-REPLY-DRAFT-BLOCKED"][disabled], [data-action-id="ACTION-CRM-INTERNAL-NOTE-BLOCKED"][disabled], [data-action-id="ACTION-CRM-TASK-BLOCKED"][disabled]').length,

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
    metrics.workbenchCount >= 1 &&
      metrics.apiWorkbenchCount >= 1 &&
      initialMetrics.paneCount >= 1 &&
      initialMetrics.listPaneVisible &&
      initialMetrics.activityPaneVisible &&
      initialMetrics.profilePaneVisible &&
      initialMetrics.crmContractVersion === 'shared-crm-v1' &&
      initialMetrics.crmComponentOrder === 'contacts-index>contact-workspace>contact-inspector' &&
      initialMetrics.crmMobileBreakpoint === '700' &&
      initialMetrics.crmBackControlHeight === '40' &&
      initialMetrics.cardCount > 0 &&
      initialMetrics.cardCount <= 50 &&
      initialCrmRequestCount <= 3 &&
      initialListRequestCount <= 1 &&
      initialLimitRequests.every((value) => value === '50') &&
      selectedMetrics.selectedDetailVisible &&
      selectedMetrics.selectedProfileResponsiveState &&
      selectedMetrics.selectedListHiddenOnMobile &&
      selectedMetrics.hasFocusedContactHeader &&
      selectedMetrics.hasSubviewRail &&
      selectedMetrics.activeSubview === 'activity' &&
      selectedMetrics.hasActionOverflow &&
      selectedMetrics.actionOverflowOpen &&
      selectedMetrics.activeSubviewPanel &&
      selectedMetrics.lazySectionData &&
      selectedMetrics.hasContactTimeline &&
      selectedMetrics.hasClassTrialAccess &&
      selectedMetrics.hasNoSendLock &&
      selectedMetrics.hasSafeActionPanel &&
      selectedMetrics.hasAddContactAction &&
      addContactMetrics.hasAction &&
      addContactMetrics.formVisible &&
      addContactMetrics.noExternalCopy &&
      selectedMetrics.hasCreateTaskAction &&
      taskTabActionMetrics.hasLinkedTaskPanel &&
      taskTabActionMetrics.hasCompleteTaskAction &&
      taskTabActionMetrics.hasReopenTaskAction &&
      memberLinkMetrics.hasMemberLinkPanel &&
      memberLinkMetrics.hasLinkMemberAction &&
      selectedMetrics.hasArchiveContactAction &&
      selectedMetrics.mobileBackControlHeight >= 40 &&
      Object.values(workspaceTabMetrics).every(Boolean) &&
      selectedMetrics.hasOpenScopedInboxAction &&
      mobileBackMetrics.restoredList &&
      mobileBackMetrics.clearedSelectedState &&
      listRequestsAfterSelect === initialListRequestCount &&
      detailRequestsBeforeSubviewClicks === 1 &&
      conversationRequestsBeforeSubviewClicks === 0 &&
      taskRequestsBeforeSubviewClicks === 0 &&
      timelineRequestsAfterSelect >= 1 &&
      conversationRequestsAfterSubviewClicks >= 1 &&
      taskRequestsAfterSubviewClicks >= 1 &&
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
    selectedDetailScreenshot: rel(selectedDetailScreenshot),
    initialCrmRequestCount,
    initialListRequestCount,
    initialRenderedCardCount: initialMetrics.cardCount,
    initialPaneCount: initialMetrics.paneCount,
    crmContractVersion: initialMetrics.crmContractVersion,
    crmComponentOrder: initialMetrics.crmComponentOrder,
    crmMobileBreakpoint: initialMetrics.crmMobileBreakpoint,
    crmBackControlHeight: initialMetrics.crmBackControlHeight,
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
    hasAddContactActionAfterSelect: selectedMetrics.hasAddContactAction,
    addContactMetrics,
    hasCreateTaskActionAfterSelect: selectedMetrics.hasCreateTaskAction,
    taskTabActionMetrics,
    memberLinkMetrics,
    hasArchiveContactActionAfterSelect: selectedMetrics.hasArchiveContactAction,
    mobileBackControlHeightAfterSelect: selectedMetrics.mobileBackControlHeight,
    workspaceTabMetrics,
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
  await page.waitForSelector('[data-crm-selected-detail] [data-action-id="ACTION-CRM-OPEN-SCOPED-INBOX"]', { timeout: 15000 });
  await page.evaluate(() => {
    const overflow = document.querySelector('[data-crm-action-overflow]');
    if (overflow) overflow.open = true;
    const button = document.querySelector('[data-crm-selected-detail] [data-action-id="ACTION-CRM-OPEN-SCOPED-INBOX"]');
    if (!button) throw new Error('Scoped inbox CRM action not found.');
    button.click();
  });
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
    '| Target | Viewport | Passed | CRM calls | Initial cards | Task action | Root rerenders | Search requests | Legacy table closed/open | Selected detail | Final screenshot |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|',
    ...results.map((result) => [
      `| ${result.target}`,
      `${result.viewport.width}x${result.viewport.height}`,
      String(result.passed),
      String(result.initialCrmRequestCount),
      String(result.initialRenderedCardCount),
      String(result.hasCreateTaskActionAfterSelect),
      String(result.appRootMutationsAfterSelect),
      String(result.searchListRequestDelta),
      `${result.legacyTableClosedCount}/${result.legacyTableOpenCount}`,
      result.selectedDetailScreenshot,
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
    '- Split shell and monolith fallback render the API-backed workbench.',
    '- Search/filter/sort controls, Add Contact form, cards, shared CRM contract attributes, three CRM panes, selected detail, profile, class/trial/access context, no-send guard, safe actions, explicit Create task/archive actions, Link member disabled-shell action, and timeline readback are visible.',
    '- Overview, Activity, Conversations, Tasks, Access, Identity, and Family tabs are clickable and render non-disabled workspace panels.',
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
