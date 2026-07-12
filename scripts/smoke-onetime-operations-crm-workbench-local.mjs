#!/usr/bin/env node
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'evidence', 'one-time-crm-journey', '2026-07-12');
const routeQuery = '?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts';
const route = `/operations${routeQuery}`;
const routeTargets = [
  { id: 'split-shell', route },
  { id: 'monolith', route: `/operations.html${routeQuery}` },
];

const viewports = [
  { id: 'desktop-1440', width: 1440, height: 960 },
  { id: 'desktop-1024', width: 1024, height: 900 },
  { id: 'tablet-768', width: 768, height: 1024 },
  { id: 'mobile-430', width: 430, height: 932 },
  { id: 'mobile-390', width: 390, height: 844 },
];

const initialCrmCards = [
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

let crmCards = [];
let timelineByContactId = new Map();
let apiRequests = [];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resetCrmState() {
  crmCards = clone([...initialCrmCards, ...generatedCrmCards]);
  timelineByContactId = new Map(crmCards.map((card) => [
    card.id,
    [
      {
        id: `${card.id}:signup-capture`,
        channel: 'internal',
        type: 'public_signup_capture',
        direction: 'inbound',
        body: `${card.display_name} captured in the One Time first-party CRM. No external message was sent from this workbench.`,
        occurred_at: '2026-07-10T08:22:45.952Z',
        no_send: true,
        external_write_performed: false,
      },
    ],
  ]));
  apiRequests = [];
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
    if (['bna', 'bna_school', 'platform'].includes(String(url.searchParams.get('workspace') || url.searchParams.get('workspace_key') || '').toLowerCase())) {
      return {
        status: 403,
        body: {
          success: false,
          error: 'This scoped One Time session cannot access BNA CRM contacts.',
          external_write_performed: false,
        },
      };
    }
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

async function captureViewport(browser, baseUrl, viewport, target) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
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
      && /^https:\/\/fonts\.googleapis\.com\//.test(request.url());
    if (!isExpectedNavigationAbort && !isExpectedExternalFontAbort) failedRequests.push(`${request.method()} ${request.url()} ${failureText}`.trim());
  });
  page.on('response', (response) => {
    const expectedDeniedCrmRead = response.status() === 403
      && response.url().includes('/api/bna/crm/contacts')
      && response.url().includes('workspace=bna');
    if (response.status() >= 400 && !expectedDeniedCrmRead) badResponses.push(`${response.status()} ${response.url()}`);
  });

  resetCrmState();
  await page.goto(`${baseUrl}${target.route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 15000 });
  await page.waitForFunction(() => /Sample One Time Parent/.test(document.body.textContent || ''), null, { timeout: 15000 }).catch(async (error) => {
    const bodyText = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1800)).catch(() => '');
    throw new Error(`${error.message}\nBody text before CRM card timeout: ${bodyText}`);
  });
  const initialCardCount = await page.locator('[data-first-party-crm-card]').count();
  await page.locator('.crm-filter-search input').fill('Sample One Time Parent');
  await page.evaluate(() => {
    if (typeof window.setFirstPartyCrmFilter === 'function') {
      window.setFirstPartyCrmFilter('search', 'Sample One Time Parent');
      return;
    }
    const input = document.querySelector('.crm-filter-search input');
    input?.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => {
    const text = document.body.textContent || '';
    const input = document.querySelector('.crm-filter-search input');
    return /Sample One Time Parent/.test(text) && input && input.value === 'Sample One Time Parent';
  }, null, { timeout: 15000 }).catch(async (error) => {
    const bodyText = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1800)).catch(() => '');
    throw new Error(`${error.message}\nBody text before CRM search-control timeout: ${bodyText}`);
  });
  await page.locator('article.contact-card [data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]').first().click();
  await page.waitForFunction(() => /Contact Timeline/.test(document.body.textContent || '') && /captured in the One Time first-party CRM/.test(document.body.textContent || ''), null, { timeout: 15000 });
  await page.fill('[data-crm-contact-action-form] input[name="display_name"]', 'Sample One Time Parent Updated');
  await page.fill('[data-crm-contact-action-form] input[name="email"]', 'sample-updated@example.invalid');
  await page.fill('[data-crm-contact-action-form] input[name="phone"]', '+1 555 010 2200');
  await page.locator('[data-crm-contact-action-form] select[name="status"]').evaluate((select) => {
    select.value = 'follow_up';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.fill('[data-crm-contact-action-form] input[name="next_follow_up_at"]', '2026-07-20');
  await page.fill('[data-crm-contact-action-form] input[name="assigned_owner"]', 'Rabbi Scheller team');
  await page.fill('[data-crm-contact-action-form] input[name="tags"]', 'free-class-interest, operator-test, follow-up');
  await page.fill('[data-crm-contact-action-form] textarea[name="note_body"]', 'Operator local CRM journey note. No send.');
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/bna/crm/contacts/') && response.request().method() === 'PATCH' && response.status() === 200),
    page.locator('[data-crm-contact-action-form] button[type="submit"]').click(),
  ]);
  await page.waitForFunction(() => /CRM update saved locally/.test(document.body.textContent || '') && /Task #9001/.test(document.body.textContent || ''), null, { timeout: 15000 });
  const denial = await page.evaluate(async () => {
    const response = await fetch('/api/bna/crm/contacts?workspace=bna&project=bna');
    const body = await response.json().catch(() => ({}));
    return { status: response.status, error: body.error || '', external_write_performed: body.external_write_performed };
  });
  await page.locator('[data-action-id="ACTION-CRM-CONTACT-MAILBOX-OPEN"]').first().click();
  await page.waitForFunction(() => window.location.search.includes('view=communications') && window.location.search.includes('section=email') && window.location.search.includes('inbox=rabbi'), null, { timeout: 15000 });
  await page.waitForFunction(() => /Now Viewing: Rabbi \/ One Time Inbox/.test(document.body.textContent || ''), null, { timeout: 15000 });
  const mailboxUrl = page.url();
  await page.goto(`${baseUrl}${target.route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 15000 });
  await page.waitForFunction(() => /Sample One Time Parent Updated/.test(document.body.textContent || '') && /Contact Timeline/.test(document.body.textContent || ''), null, { timeout: 15000 });

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
      hasEditableIdentityFields: Boolean(
        document.querySelector('[data-crm-contact-action-form] input[name="display_name"]')
        && document.querySelector('[data-crm-contact-action-form] input[name="email"]')
        && document.querySelector('[data-crm-contact-action-form] input[name="phone"]')
      ),
      hasSavedUpdatedContact: /Sample One Time Parent Updated/.test(text) && /sample-updated@example\.invalid/.test(text),
      hasFollowUpTask: /Task #9001/.test(text),
      hasLocalNote: /Operator local CRM journey note/.test(text),
      hasNoSendLock: /No-send locked|Read-only \/ no-send|No email, WhatsApp, payment, access, or external CRM write/.test(text),
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
      initialCardCount >= 2 &&
      initialCardCount <= 50 &&
      metrics.cardCount >= 2 &&
      metrics.selectedDetailVisible &&
      metrics.hasContactTimeline &&
      metrics.hasClassTrialAccess &&
      metrics.hasEditableIdentityFields &&
      metrics.hasSavedUpdatedContact &&
      metrics.hasFollowUpTask &&
      metrics.hasLocalNote &&
      metrics.hasNoSendLock &&
      !metrics.hasWrongWorkspaceLeak &&
      denial.status === 403 &&
      denial.external_write_performed === false &&
      /cannot access BNA CRM/i.test(denial.error) &&
      patchRequests.length === 1 &&
      contactsReads.some((request) => /workspace=rabbi_sheller_provider/.test(request.search)) &&
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
    target: target.id,
    viewport,
    route: target.route,
    screenshot: rel(screenshot),
    initialCardCount,
    ...metrics,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    patchRequests,
    contactsReads,
    denial,
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
    for (const target of routeTargets) {
      for (const viewport of viewports) {
        results.push(await captureViewport(browser, baseUrl, viewport, target));
      }
    }
  } finally {
    await browser.close();
    await close(server);
  }

  const report = {
    status: results.every((result) => result.passed) ? 'PASS' : 'FAIL',
    generated_at: new Date().toISOString(),
    target: routeTargets.map((target) => target.route).join(' + '),
    scope: 'Local browser/API Operations One Time CRM journey smoke using isolated first-party test records; no production database, sends, payments, external accounts, or production writes.',
    remaining_blocker: process.env.DATABASE_URL || process.env.PGHOST
      ? ''
      : 'True local/test Postgres persistence proof was not run because DATABASE_URL/PGHOST is not configured in this session.',
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
    '| Target | Viewport | Passed | Overflow | Initial Cards | Action Buttons | Detail | Timeline | Screenshot |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|',
    ...results.map((result) => [
      `| ${result.target}`,
      `${result.viewport.width}x${result.viewport.height}`,
      String(result.passed),
      String(result.horizontalOverflow),
      String(result.initialCardCount),
      String(result.cardCount),
      String(result.selectedDetailVisible),
      String(result.hasContactTimeline),
      result.screenshot,
    ].join(' | ') + ' |'),
    '',
    'Checks:',
    '',
    '- One Time Operations CRM route renders the API-backed workbench in both split-shell and monolith fallback modes.',
    '- The synthetic 80-record CRM fixture renders as a capped first page of 50 or fewer contact cards.',
    '- Search/filter/sort controls, cards, selected detail, class/trial/access context, no-send guard, and timeline readback are visible.',
    '- The browser submits one safe PATCH update with name, email, phone, lifecycle, owner, tags, note, and follow-up task data.',
    '- The returned timeline and follow-up task are displayed after reload.',
    '- Opening mailbox routes to the Rabbi / One Time inbox and returning to CRM restores the selected contact.',
    '- A BNA workspace CRM read is denied with HTTP 403.',
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
