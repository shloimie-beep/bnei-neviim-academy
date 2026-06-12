const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = (process.env.BNA_APP_URL || 'http://127.0.0.1:8128').replace(/\/+$/, '');
const outDir = process.env.MOBILE_SMOKE_OUT_DIR || path.join('ops', 'qa-runs', '2026-06-12-clean-deploy-mobile-smoke');
fs.mkdirSync(outDir, { recursive: true });
const opsUsername = process.env.OPS_USERNAME || 'local';
const opsPassword = process.env.OPS_PASSWORD || 'localpass';
const auth = 'Basic ' + Buffer.from(`${opsUsername}:${opsPassword}`).toString('base64');
const today = new Date().toISOString().slice(0, 10);

const sampleTask = {
  id: 381,
  title: 'Decide whether to keep using GHL or replace it with modular internal/API tools',
  notes: 'No real option should disappear on mobile. This task validates the task detail page route.',
  stage: 'needs_decision',
  category: 'technology',
  urgency: 'this_week',
  assigned_to: 'Shloimie',
  source: 'dashboard',
  project_key: 'bna',
  project_name: 'BNA',
  decision_required: true,
  decision_question: 'Which operating system should BNA use?',
  created_at: '2026-06-10T10:00:00Z',
  updated_at: '2026-06-11T10:00:00Z',
  comment_count: 1,
};

const parentPayload = {
  parent: { name: 'Smoke Parent', email: 'parent@example.com', preferred_language: 'en', rabbi_contact: { whatsapp_url: '' } },
  students: [{
    student: { id: 1, name: 'Smoke Student', name_en: 'Smoke Student' },
    torah: { class_trip_percentage: 42, public_trip_percentage: 35, daily_completion_percentage: 50, history: [] },
    goals: [{ id: 11, title: 'Read Mishnah', bucket: 'today', progress_percent: 50, status: 'active', due_at: today }],
    assignments: [{ id: 21, title: 'Worksheet review', status: 'assigned', due_at: today }],
    attendance: [],
    questions: [],
    weekly_private_meeting: { label: 'Weekly check-in', next_date: today, time_label: '7:00' },
    next_meeting_date: today,
    parent_notifications: [],
    chat_messages: [],
    meeting_uploads: [],
    attendance_summary: {},
    financial: {},
  }],
  service_providers: [{ provider_name: 'Math Tutor', services: [{ title: 'Math tutoring', city: 'Beit Shemesh', price_amount: 120, age_min: 10, age_max: 14, max_children: 4 }] }],
  communications: [],
};

const studentPayload = {
  student: { id: 1, name: 'Smoke Student', name_en: 'Smoke Student' },
  torah: { class_trip_percentage: 42, public_trip_percentage: 35, daily_completion_percentage: 50, morning_goal_status: 'in_progress', history: [] },
  goals: [{ id: 11, title: 'Read Mishnah', bucket: 'today', status: 'active', progress_percent: 50, due_at: today }],
  questions: [],
  assignments: [{ id: 21, title: 'Worksheet review', status: 'assigned', due_at: today, worksheet_body: 'Read and answer.' }],
  calendar_events: [{ id: 'event-1', title: '7:00 class', start_at: `${today}T19:00:00`, source: 'internal' }],
  next_meeting_date: today,
  weekly_private_meeting: { label: 'Weekly check-in', time_label: '7:00' },
  rabbi_contact: {},
  device_access: { status: 'accountability_only' },
};

function responseFor(url, method = 'GET') {
  const parsed = new URL(url);
  const p = parsed.pathname;
  if (p === '/api/operations/me') return { username: 'local', role: 'platform_admin', scope: 'platform', allowedViews: ['dashboard', 'pipelines', 'tasks', 'students', 'contacts', 'content', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'accounting', 'api_usage', 'admin', 'settings'] };
  if (p === '/api/bna/tasks/381/comments') return { comments: [{ id: 1, author: 'Codex', body: 'Verified mobile detail.', created_at: '2026-06-11T10:10:00Z' }] };
  if (p === '/api/bna/tasks') return { tasks: [sampleTask] };
  if (p === '/api/bna/workspace-platform') return { workspaces: [], connector_settings: [], bot_actions: [], bot_action_logs: [] };
  if (p === '/api/bna/calendar-events') return { events: [] };
  if (p === '/api/bna/pipeline-cards') return { cards: [] };
  if (p === '/api/bna/internal-dialogue') return { threads: [], messages: [] };
  if (p === '/api/bna/projects') return { projects: [{ project_key: 'bna', name: 'BNA' }] };
  if (p === '/api/bna/people') return { people: [] };
  if (p === '/api/bna/agent-fleet/status') return { success: true, fleet: { status: 'running', queue_size: 0, ready_count: 0, stale: false }, watchdog: { status: 'running', stale: false } };
  if (p === '/api/bna/support-tickets') return method === 'POST' ? { success: true, ticket: { id: 999, status: 'open' } } : { tickets: [] };
  if (p === '/api/bna/signups') return { signups: [] };
  if (p === '/api/bna/parent-leads') return { leads: [] };
  if (p === '/api/bna/service-providers') return { providers: [] };
  if (p === '/api/bna/contact-communications') return { communications: [] };
  if (p === '/api/bna/payments') return { payments: [] };
  if (p === '/api/bna/payment-intake') return { intake: [] };
  if (p.includes('payment-reminder')) return { found: 0, due: [] };
  if (p === '/api/bna/content-jobs') return { jobs: [] };
  if (p === '/api/bna/class-sessions') return { sessions: [] };
  if (p === '/api/bna/project-meetings') return { meetings: [] };
  if (p === '/api/bna/content-prompts') return { prompts: [] };
  if (p === '/api/bna/content-bundles') return { bundles: [] };
  if (p === '/api/bna/students') return { students: [] };
  if (p === '/api/bna/assignments') return { assignments: [] };
  if (p === '/api/bna/assignment-prompts') return { prompts: [] };
  if (p === '/api/bna/devices') return { devices: [] };
  if (p === '/api/bna/device-access-rules') return { rules: [] };
  if (p === '/api/bna/torah-learning') return { group: { percentage: 0 }, students: [] };
  if (p === '/api/bna/accountability') return { events: [] };
  if (p === '/api/bna/group-goals') return { goals: [] };
  if (p === '/api/parent-portal') return parentPayload;
  if (p === '/api/student-portal') return studentPayload;
  return {};
}

async function installMocks(page) {
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseFor(req.url(), req.method())),
    });
  });
}

async function loginOperations(context) {
  const response = await context.request.post(`${base}/api/operations/login`, {
    data: {
      username: opsUsername,
      password: opsPassword,
    },
    failOnStatusCode: false,
  });
  if (!response.ok()) {
    const body = await response.text().catch(() => '');
    throw new Error(`Operations smoke login failed with ${response.status()}: ${body.slice(0, 300)}`);
  }
}

async function noHorizontalScroll(page, label) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
  }));
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${label} has document horizontal scroll ${JSON.stringify(metrics)}`);
  assert.ok(metrics.bodyScrollWidth <= metrics.bodyClientWidth + 1, `${label} has body horizontal scroll ${JSON.stringify(metrics)}`);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 360, height: 701 }, extraHTTPHeaders: { Authorization: auth } });
    await loginOperations(context);

    let page = await context.newPage();
    await installMocks(page);
    await page.goto(`${base}/operations?view=tasks&section=overview&workspace=bna&task=381`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.task-detail-page', { timeout: 15000 });
    await page.waitForTimeout(250);
    const opsState = await page.evaluate(() => ({
      y: window.scrollY,
      detailTop: document.querySelector('.task-detail-page')?.getBoundingClientRect().top,
    }));
    assert.ok(opsState.y <= 1, `operations task detail did not reset scroll: ${JSON.stringify(opsState)}`);
    assert.ok(opsState.detailTop >= 0, `operations task detail starts above viewport: ${JSON.stringify(opsState)}`);
    await page.click('button:has-text("Report problem")');
    await page.waitForSelector('#supportTicketModal.show #supportTicketDescription', { timeout: 5000 });
    await noHorizontalScroll(page, 'operations task detail');
    await shot(page, 'operations-task-detail-report-modal-360x701.png');
    await page.close();

    page = await context.newPage();
    await installMocks(page);
    await page.goto(`${base}/operations?view=dashboard&section=overview&workspace=bna`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.menu-button', { timeout: 15000 });
    await page.click('.menu-button');
    await page.waitForSelector('.ops-app-shell.drawer-open', { timeout: 5000 });
    const drawerState = await page.evaluate(() => ({
      mainDisplay: getComputedStyle(document.querySelector('.ops-main')).display,
      sidebarWidth: document.querySelector('.ops-sidebar')?.getBoundingClientRect().width,
    }));
    assert.equal(drawerState.mainDisplay, 'none', `operations drawer should hide main on mobile: ${JSON.stringify(drawerState)}`);
    assert.ok(drawerState.sidebarWidth >= 340, `operations drawer should be full-width on mobile: ${JSON.stringify(drawerState)}`);
    await page.click("button[onclick=\"switchView('tasks')\"]");
    await page.waitForFunction(() => !document.querySelector('.ops-app-shell')?.classList.contains('drawer-open'));
    await noHorizontalScroll(page, 'operations mobile drawer');
    await shot(page, 'operations-mobile-drawer-closed-360x701.png');
    await page.close();

    page = await context.newPage();
    await installMocks(page);
    await page.goto(`${base}/parent.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.getElementById('portalMenuToggle')?.classList.contains('hidden'), null, { timeout: 15000 });
    await page.click('#portalMenuToggle');
    await page.waitForFunction(() => document.body.classList.contains('portal-menu-open'));
    await page.click('[data-parent-section-nav="calendar"]');
    await page.waitForFunction(() => !document.body.classList.contains('portal-menu-open'));
    await noHorizontalScroll(page, 'parent mobile menu');
    await shot(page, 'parent-calendar-menu-closed-360x701.png');
    await page.close();

    page = await context.newPage();
    await installMocks(page);
    await page.goto(`${base}/student.html?code=smoke`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.getElementById('portalMenuToggle')?.classList.contains('hidden'), null, { timeout: 15000 });
    await page.click('#portalMenuToggle');
    await page.waitForFunction(() => document.body.classList.contains('portal-menu-open'));
    await page.click('[data-portal-section="calendar"]');
    await page.waitForFunction(() => !document.body.classList.contains('portal-menu-open'));
    await noHorizontalScroll(page, 'student mobile menu');
    await shot(page, 'student-calendar-menu-closed-360x701.png');
    await page.close();

    page = await context.newPage();
    await page.goto(`${base}/provider-participant.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.mobile-nav-toggle', { timeout: 10000 });
    await page.click('.mobile-nav-toggle');
    await page.waitForFunction(() => document.body.classList.contains('provider-nav-open'));
    await page.click('[data-section="schedule"]');
    await page.waitForFunction(() => !document.body.classList.contains('provider-nav-open'));
    await noHorizontalScroll(page, 'provider participant mobile menu');
    await shot(page, 'provider-participant-schedule-menu-closed-360x701.png');
    await page.close();

    page = await context.newPage();
    await page.goto(`${base}/?public=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.nav-menu-toggle', { timeout: 10000 });
    await page.click('.nav-menu-toggle');
    await page.waitForSelector('#mainNavActions.is-open', { timeout: 5000 });
    const publicMenu = await page.evaluate(() => {
      const box = document.getElementById('mainNavActions')?.getBoundingClientRect();
      return {
        width: Math.round(box?.width || 0),
        expanded: document.querySelector('.nav-menu-toggle')?.getAttribute('aria-expanded'),
      };
    });
    assert.equal(publicMenu.expanded, 'true');
    assert.ok(publicMenu.width <= 340, `homepage mobile menu too wide: ${JSON.stringify(publicMenu)}`);
    await page.click('.nav-link--mobile-only');
    await page.waitForFunction(() => !document.getElementById('mainNavActions')?.classList.contains('is-open'));
    await noHorizontalScroll(page, 'public homepage menu');
    await shot(page, 'public-home-menu-closed-360x701.png');
    await page.close();

    console.log(JSON.stringify({ ok: true, outDir }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
