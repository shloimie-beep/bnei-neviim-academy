import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = process.cwd();
const smokeDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.env.SMOKE_OUT_DIR ? path.resolve(root, process.env.SMOKE_OUT_DIR) : smokeDir;
await fs.mkdir(outDir, { recursive: true });

const baseUrl = (process.env.SMOKE_BASE_URL || process.env.BNA_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/$/, '');
const fixtureCode = 'fixture-assistant-onboarding-coach';

const server = await fs.readFile(path.join(root, 'server.js'), 'utf8');
const widget = await fs.readFile(path.join(root, 'public', 'js', 'bna-bot-widget.js'), 'utf8');
const contractChecks = [
  ['onboarding intent exists', /function assistantOnboardingIntent/.test(server)],
  ['onboarding coach metadata exists', /intent: 'role_onboarding_coach'/.test(server)],
  ['onboarding tool call is logged', /toolName: 'assistant_onboarding_coach'/.test(server)],
  ['student onboarding topic exists', /student_daily_checkin/.test(server)],
  ['no ticket guard exists', /support_ticket_created: false/.test(server)],
  ['student widget intro mentions daily checkoff', /walk you through Today, goals, daily checkoff/.test(widget)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static assistant onboarding contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const fixturePortalPayload = {
  student: {
    id: 999501,
    name: 'Fixture Student',
    name_en: 'Fixture Student',
    name_he: 'תלמיד בדיקה',
    localized_names: { en: 'Fixture Student', he: 'תלמיד בדיקה' },
  },
  torah: {
    class_trip_percentage: 20,
    public_trip_percentage: 20,
    daily_completion_percentage: 40,
    history: [],
  },
  next_meeting_date: '2026-06-16',
  weekly_private_meeting: {
    title: 'Weekly check-in',
    next_date: '2026-06-16',
    time_label: '17:30-17:50',
  },
  calendar_events: [],
  goals: [
    {
      id: 9101,
      title: 'Review one short Mishnah',
      bucket: 'today',
      status: 'today',
      urgency: 'today',
      category: 'Learning',
      progress_percent: 25,
      student_summary: 'Do one honest review and mark the checkoff.',
      checklist: ['Open the page', 'Review once', 'Write one honest note'],
      daily_checkins: [
        {
          week_start: '2026-06-15',
          days: [
            { date: '2026-06-15', label: 'M', day_number: 15, completed: false, is_today: true, note: '' },
          ],
        },
      ],
    },
  ],
  assignments: [],
  questions: [],
  documents: [],
  parent_notifications: [],
  rabbi_contact: {},
  device_access: { status: 'accountability_only', device_count: 0 },
};

async function installRoutes(context, assistantRequests, unexpectedWrites) {
  await context.route('**/api/student-portal**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'GET' && url.pathname === '/api/student-portal' && url.searchParams.get('code') === fixtureCode) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(fixturePortalPayload),
      });
      return;
    }
    if (request.method() !== 'GET') {
      unexpectedWrites.push(`${request.method()} ${url.pathname}`);
      await route.fulfill({
        status: 405,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ error: 'Student assistant onboarding smoke blocks write requests.' }),
      });
      return;
    }
    await route.continue();
  });

  await context.route('**/api/bna/assistant/chat', async (route) => {
    const request = route.request();
    const payload = request.postDataJSON();
    assistantRequests.push(payload);
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        success: true,
        actor: { type: 'student', role: 'student', can_use_codex: false },
        thread: {
          id: 70001,
          actor_type: 'student',
          actor_role: 'student',
          surface: 'student_portal',
          language: payload.language || 'en',
          status: 'open',
        },
        messages: [
          {
            id: 1,
            thread_id: 70001,
            author_type: 'user',
            author_role: 'student',
            body: payload.message,
            metadata: {},
            created_at: '2026-06-15T00:00:00.000Z',
          },
          {
            id: 2,
            thread_id: 70001,
            author_type: 'assistant',
            author_role: 'safe_assistant',
            body: 'Yes. Start with Today, pick one goal, use the daily checkoff, and write one honest reflection. I did not create a ticket or change a record yet.',
            metadata: {
              intent: 'role_onboarding_coach',
              topic: 'student_daily_checkin',
              support_ticket_created: false,
              durable_profile_write_performed: false,
              external_write_performed: false,
            },
            created_at: '2026-06-15T00:00:01.000Z',
          },
        ],
        anonymous_id: null,
      }),
    });
  });
}

async function runScenario(browser, scenario) {
  const assistantRequests = [];
  const unexpectedWrites = [];
  const pageErrors = [];
  const consoleErrors = [];
  const context = await browser.newContext({
    viewport: scenario.viewport,
    isMobile: scenario.viewport.width <= 480,
    hasTouch: scenario.viewport.width <= 480,
  });
  await installRoutes(context, assistantRequests, unexpectedWrites);
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(error.message || String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  try {
    await page.goto(`${baseUrl}/student/login?code=${encodeURIComponent(fixtureCode)}`, { waitUntil: 'networkidle' });
    await page.locator('#portalLayout').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('.bna-bot-launcher').click({ timeout: 10000 });
    await page.locator('.bna-bot-panel.is-open').waitFor({ timeout: 10000 });
    await assertVisibleText(page, 'daily checkoff');
    await page.locator('.bna-bot-form textarea').fill("Walk me through today's check-in");
    await page.locator('.bna-bot-form button[type="submit"]').click();
    await assertVisibleText(page, 'one honest reflection');
    await page.screenshot({ path: path.join(outDir, `${scenario.id}.png`), fullPage: true });

    const metrics = await page.evaluate(() => ({
      noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
      panelOpen: Boolean(document.querySelector('.bna-bot-panel.is-open')),
      replyText: document.querySelector('.bna-bot-thread')?.textContent || '',
    }));
    assert.equal(metrics.noHorizontalOverflow, true, `${scenario.id}: no horizontal overflow`);
    assert.equal(metrics.panelOpen, true, `${scenario.id}: assistant panel stayed open`);
    assert.equal(assistantRequests.length, 1, `${scenario.id}: one assistant chat request`);
    assert.equal(assistantRequests[0].surface, 'student_portal', `${scenario.id}: student surface submitted`);
    assert.equal(assistantRequests[0].access_code, fixtureCode, `${scenario.id}: fixture access code submitted`);
    assert.match(assistantRequests[0].message, /check-in/i, `${scenario.id}: onboarding message submitted`);
    assert.deepEqual(unexpectedWrites, [], `${scenario.id}: no unexpected writes`);
    assert.deepEqual(pageErrors, [], `${scenario.id}: no page errors`);
    assert.deepEqual(consoleErrors, [], `${scenario.id}: no console errors`);
    return { metrics, assistantRequests };
  } finally {
    await context.close();
  }
}

async function assertVisibleText(page, text) {
  await page.locator('body').filter({ hasText: text }).waitFor({ timeout: 10000 });
}

const scenarios = [
  { id: 'desktop', viewport: { width: 1024, height: 900 } },
  { id: 'mobile', viewport: { width: 390, height: 900 } },
];

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const scenario of scenarios) {
    results.push({ id: scenario.id, ...(await runScenario(browser, scenario)) });
  }
} finally {
  await browser.close();
}

const report = `# Assistant Onboarding Coach ${process.env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${baseUrl}/student/login?code=${fixtureCode}

## Result

PASS. The student portal assistant opened, showed onboarding-oriented copy, and
submitted a student-scoped assistant request that was intercepted before any
live assistant write.

## Contract Checks

${contractChecks.map(([name]) => `- PASS ${name}`).join('\n')}

## Browser Checks

${results.map((item) => `- PASS ${item.id}: ${JSON.stringify(item.metrics)}`).join('\n')}

## Guardrails

All student portal data came from synthetic fixture responses. Assistant chat
requests were intercepted and fulfilled with a fixture response. No real
student checkoff, message, support ticket, profile write, email, WhatsApp,
Google/Drive action, Buffer/social action, connector write, or external CRM
write was performed.
`;

await fs.writeFile(path.join(outDir, 'report.md'), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, results: results.map(({ id, metrics }) => ({ id, metrics })) }, null, 2));
