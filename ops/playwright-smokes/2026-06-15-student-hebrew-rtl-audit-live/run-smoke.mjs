import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const baseUrl = (process.argv[2] || process.env.BNA_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/$/, '');
const studentPath = process.env.BNA_STUDENT_PATH || '/student/login';
const outDir = process.env.BNA_SMOKE_OUT_DIR
  ? path.resolve(process.env.BNA_SMOKE_OUT_DIR)
  : path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(outDir, { recursive: true });

const fixtureCode = 'fixture-student-hebrew-rtl-audit';
const hebrew = {
  studentName: '\u05d0\u05dc\u05d9\u05d4\u05d5 \u05db\u05d4\u05df',
  goalTitle: '\u05d7\u05d6\u05e8\u05d4 \u05d9\u05d5\u05de\u05d9\u05ea',
  secondGoalTitle: '\u05d4\u05db\u05e0\u05ea \u05de\u05e9\u05d9\u05de\u05ea \u05d2\u05de\u05e8\u05d0',
  questionTitle: '\u05e9\u05d0\u05dc\u05ea \u05d2\u05de\u05e8\u05d0',
  questionText: '\u05de\u05d4 \u05e2\u05d5\u05e9\u05d9\u05dd \u05db\u05e9\u05e6\u05e8\u05d9\u05da \u05dc\u05d7\u05d6\u05d5\u05e8 \u05e2\u05dc \u05d4\u05e1\u05d5\u05d2\u05d9\u05d0?',
  answerLabel: '\u05ea\u05e9\u05d5\u05d1\u05d4',
  answerText: '\u05de\u05d7\u05dc\u05e7\u05d9\u05dd \u05dc\u05e9\u05dc\u05d5\u05e9\u05d4 \u05e6\u05e2\u05d3\u05d9\u05dd \u05e7\u05e6\u05e8\u05d9\u05dd \u05d5\u05de\u05d1\u05e7\u05e9\u05d9\u05dd \u05e2\u05d6\u05e8\u05d4 \u05db\u05e9\u05e0\u05ea\u05e7\u05e2\u05d9\u05dd.',
  assignmentTitle: '\u05d3\u05e3 \u05e2\u05d1\u05d5\u05d3\u05d4 \u05dc\u05e9\u05d9\u05e2\u05d5\u05e8',
  worksheet: '\u05e7\u05e8\u05d0 \u05d0\u05ea \u05d4\u05de\u05e7\u05d5\u05e8 \u05d5\u05db\u05ea\u05d5\u05d1 \u05e9\u05ea\u05d9 \u05e9\u05d5\u05e8\u05d5\u05ea \u05e1\u05d9\u05db\u05d5\u05dd.',
  sourceLabel: '\u05e8\u05d1\u05d9 \u05e9\u05dc\u05d5\u05d9\u05de\u05d9',
  sourceRef: '\u05d1\u05e8\u05db\u05d5\u05ea \u05d4\u05f3 \u05d0\u05f3',
  sourceSnippet: '\u05de\u05e7\u05d5\u05e8 \u05d2\u05dc\u05d5\u05d9 \u05dc\u05ea\u05dc\u05de\u05d9\u05d3 \u05dc\u05d7\u05d6\u05e8\u05d4.',
  followUp: '\u05d7\u05d6\u05d5\u05e8 \u05e2\u05dc \u05d4\u05e9\u05d5\u05e8\u05d4 \u05d4\u05e8\u05d0\u05e9\u05d5\u05e0\u05d4 \u05e4\u05e2\u05de\u05d9\u05d9\u05dd',
  parentResponse: '\u05de\u05d0\u05d5\u05e9\u05e8 \u05dc\u05d4\u05de\u05e9\u05d9\u05da \u05dc\u05e9\u05dc\u05d1 \u05d4\u05d1\u05d0.',
  whatsapp: '\u05d5\u05d5\u05d0\u05d8\u05e1\u05d0\u05e4',
};

const forbiddenPrivatePatterns = [
  /PRIVATE_PARENT_EMAIL_SENTINEL/i,
  /PRIVATE_PHONE_SENTINEL/i,
  /ADMIN_ONLY_SENTINEL/i,
  /OTHER_STUDENT_SENTINEL/i,
  /PRIVATE_PARENT_NOTE_SENTINEL/i,
  /password_hash/i,
  /refresh_token/i,
  /student_access_code/i,
  /billing/i,
  /payment/i,
];

const fixturePortalPayload = {
  student: {
    id: 999001,
    name: 'Eliyahu Cohen',
    name_en: 'Eliyahu Cohen',
    name_he: hebrew.studentName,
    localized_names: {
      en: 'Eliyahu Cohen',
      he: hebrew.studentName,
    },
    parent_email: 'PRIVATE_PARENT_EMAIL_SENTINEL@example.test',
    parent_phone: 'PRIVATE_PHONE_SENTINEL',
    admin_notes: 'ADMIN_ONLY_SENTINEL should never render',
  },
  torah: {
    class_trip_percentage: 67,
    public_trip_percentage: 42,
    daily_completion_percentage: 75,
    morning_goal_status: 'in_progress',
    history: [
      { date: '2026-06-13', public_trip_percentage: 30, daily_completed: true },
      { date: '2026-06-14', public_trip_percentage: 38, daily_completed: true },
      { date: '2026-06-15', public_trip_percentage: 42, daily_completed: false },
    ],
  },
  next_meeting_date: '2026-06-16',
  weekly_private_meeting: {
    id: 501,
    title: hebrew.sourceLabel,
    next_date: '2026-06-16',
    start_time: '17:30',
    end_time: '17:50',
    time_label: '17:30-17:50',
    weekday_label: 'Tuesday',
    label: hebrew.sourceLabel,
  },
  rabbi_contact: {
    whatsapp_url: 'https://wa.me/15555550123',
  },
  device_access: {
    device_count: 1,
    status: 'accountability_only',
    status_label: '\u05de\u05e2\u05e7\u05d1 \u05d1\u05dc\u05d1\u05d3',
    expires_at: '2026-06-15T20:00:00+03:00',
  },
  calendar_events: [
    {
      id: 'fixture-internal-calendar',
      title: '\u05d7\u05d6\u05e8\u05ea \u05d1\u05d5\u05e7\u05e8',
      description: '\u05e9\u05d9\u05e2\u05d5\u05e8 \u05d2\u05dc\u05d5\u05d9 \u05dc\u05ea\u05dc\u05de\u05d9\u05d3 \u05d1\u05dc\u05d1\u05d3',
      start_at: '2026-06-16T09:15:00+03:00',
      end_at: '2026-06-16T09:45:00+03:00',
      source: 'internal',
      visibility: 'student',
      related_type: 'class_session',
    },
  ],
  goals: [
    {
      id: 7001,
      title: hebrew.goalTitle,
      bucket: 'today',
      status: 'today',
      urgency: 'today',
      category: '\u05dc\u05d9\u05de\u05d5\u05d3',
      due_at: '2026-06-15T19:00:00+03:00',
      progress_percent: 50,
      goal_target_value: 30,
      goal_actual_value: 15,
      goal_unit: '\u05d3\u05e7\u05d5\u05ea',
      source_label: hebrew.sourceLabel,
      student_summary: '\u05d4\u05de\u05e9\u05d9\u05de\u05d4 \u05d4\u05d9\u05d5\u05dd \u05d4\u05d9\u05d0 \u05dc\u05d7\u05d6\u05d5\u05e8 \u05d1\u05e7\u05e6\u05e8\u05d4 \u05d5\u05dc\u05e1\u05de\u05df \u05d1\u05d9\u05d5\u05e9\u05e8.',
      checklist: [
        '\u05e4\u05ea\u05d7 \u05d0\u05ea \u05d4\u05d3\u05e3',
        '\u05d7\u05d6\u05d5\u05e8 \u05e2\u05dc \u05e9\u05e0\u05d9 \u05e1\u05e2\u05d9\u05e4\u05d9\u05dd',
      ],
      agreement: {
        bedtime_time: '21:30',
        wake_time: '07:00',
        student_commitment: '\u05d0\u05e0\u05d9 \u05de\u05e1\u05de\u05df \u05e8\u05e7 \u05de\u05d4 \u05e9\u05e2\u05e9\u05d9\u05ea\u05d9 \u05d1\u05d0\u05de\u05ea.',
        chosen_consequence: '\u05d0\u05dd \u05e4\u05e1\u05e4\u05e1\u05ea\u05d9, \u05d0\u05e0\u05d9 \u05de\u05d1\u05e7\u05e9 \u05e2\u05d6\u05e8\u05d4 \u05d5\u05de\u05ea\u05d7\u05d9\u05dc \u05e9\u05d5\u05d1.',
      },
      consequence: {
        recovery_path: '\u05dc\u05d7\u05d6\u05d5\u05e8 \u05dc\u05ea\u05d5\u05db\u05e0\u05d9\u05ea \u05e7\u05e6\u05e8\u05d4',
        success_device_access_state: 'student_device_open',
        success_duration_minutes: 45,
      },
      daily_checkins: [
        {
          week_start: '2026-06-15',
          days: [
            { date: '2026-06-15', label: '\u05d1', day_number: 15, completed: false, is_today: true, note: '\u05d1\u05d3\u05d9\u05e7\u05d4 \u05d1\u05d9\u05d5\u05e9\u05e8' },
            { date: '2026-06-16', label: '\u05d2', day_number: 16, completed: false, is_today: false, note: '' },
            { date: '2026-06-17', label: '\u05d3', day_number: 17, completed: false, is_today: false, note: '' },
          ],
        },
      ],
      admin_notes: 'ADMIN_ONLY_SENTINEL goal note should never render',
      other_student_name: 'OTHER_STUDENT_SENTINEL',
    },
    {
      id: 7002,
      title: hebrew.secondGoalTitle,
      bucket: 'upcoming',
      status: 'assigned',
      urgency: 'this_week',
      category: '\u05d2\u05de\u05e8\u05d0',
      due_at: '2026-06-18T16:00:00+03:00',
      progress_percent: 0,
      source_label: hebrew.sourceLabel,
      student_summary: '\u05de\u05e9\u05d9\u05de\u05d4 \u05e7\u05e6\u05e8\u05d4 \u05dc\u05d4\u05de\u05e9\u05da \u05d4\u05e9\u05d1\u05d5\u05e2.',
      agreement: {},
      consequence: {},
      daily_checkins: [],
    },
  ],
  questions: [
    {
      id: 8101,
      title: hebrew.questionTitle,
      topic: '\u05d2\u05de\u05e8\u05d0',
      question_text: hebrew.questionText,
      answer: hebrew.answerText,
      occurred_at: '2026-06-14T12:30:00+03:00',
      sources: [
        {
          ref: 'Berakhot 5a',
          heRef: hebrew.sourceRef,
          url: 'https://www.sefaria.org/Berakhot.5a',
          snippet: hebrew.sourceSnippet,
        },
      ],
      assignments: [hebrew.followUp],
      parent_responses: [
        { body: hebrew.parentResponse, created_at: '2026-06-14T18:00:00+03:00' },
      ],
      private_parent_notes: 'PRIVATE_PARENT_NOTE_SENTINEL should never render',
    },
  ],
  assignments: [
    {
      id: 9101,
      title: hebrew.assignmentTitle,
      status: 'ready',
      schedule_bucket: '\u05d4\u05e9\u05d1\u05d5\u05e2',
      worksheet_type: 'source_sheet',
      instructions: '\u05e4\u05ea\u05d7 \u05d0\u05ea \u05d4\u05de\u05e7\u05d5\u05e8 \u05d5\u05e2\u05e0\u05d4 \u05d1\u05e7\u05e6\u05e8\u05d4.',
      worksheet_body: hebrew.worksheet,
      scheduled_start_at: '2026-06-17T10:00:00+03:00',
      due_at: '2026-06-17T18:00:00+03:00',
      material_url: 'https://www.sefaria.org/Berakhot.5a',
      youtube_url: 'https://youtu.be/fixtureTorahClip',
      classroom_alternate_link: 'https://classroom.google.com/c/fixture/a/fixture/details',
      calendar_html_link: 'https://calendar.google.com/calendar/event?eid=fixture',
      google_classroom_status: 'synced',
      google_calendar_status: 'synced',
      private_notes: 'ADMIN_ONLY_SENTINEL assignment note should never render',
    },
  ],
};

const scenarios = [
  {
    id: 'mobile-hebrew',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    expectedCalendarMode: 'list',
    sections: ['overview', 'calendar', 'goals', 'assignments', 'questions', 'documents', 'bot', 'help_account'],
  },
  {
    id: 'desktop-hebrew',
    viewport: { width: 1366, height: 900 },
    isMobile: false,
    expectedCalendarMode: 'week',
    sections: ['overview', 'calendar', 'questions'],
  },
];

const sectionSelectors = {
  overview: '#studentPanel',
  calendar: '#calendarSection',
  goals: '#goalsSection',
  assignments: '#assignmentsSection',
  questions: '#questionsSection',
  documents: '#documentsSection',
  bot: '#messageSection',
  help_account: '#parentMessageSection',
};

const pass = [];
const failures = [];
const screenshots = [];
const blockedWrites = [];
const unexpectedPortalRequests = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
  pass.push(message);
}

function routeUrl(routePath) {
  return `${baseUrl}${routePath}?code=${encodeURIComponent(fixtureCode)}`;
}

function screenshotPath(fileName) {
  const fullPath = path.join(outDir, fileName);
  screenshots.push(fileName);
  return fullPath;
}

async function readBodyText(page) {
  return page.locator('body').innerText({ timeout: 10000 });
}

async function checkNoOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    htmlScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
  }));
  const limit = metrics.clientWidth;
  assert(metrics.htmlScrollWidth <= limit, `${label}: html does not overflow horizontally (${metrics.htmlScrollWidth}/${metrics.clientWidth})`);
  assert(metrics.bodyScrollWidth <= limit, `${label}: body does not overflow horizontally (${metrics.bodyScrollWidth}/${metrics.clientWidth})`);
}

function assertNoPrivateText(text, label) {
  for (const pattern of forbiddenPrivatePatterns) {
    assert(!pattern.test(text), `${label}: did not expose private pattern ${pattern}`);
  }
}

function assertHebrewText(text, label) {
  assert(/[\u0590-\u05ff]/.test(text), `${label}: rendered Hebrew characters`);
  assert(!text.includes('\u00d7'), `${label}: rendered text is not mojibake`);
  assert(text.includes(hebrew.studentName), `${label}: rendered Hebrew student display name`);
}

async function assertLanguageState(page, scenarioId) {
  const state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    htmlLanguage: document.documentElement.dataset.language,
    bodyLanguage: document.body.dataset.language,
    bodyClass: document.body.className,
    storedLanguage: localStorage.getItem('bnaStudentGoalBoardLanguage'),
    storedCode: localStorage.getItem('bnaStudentAccessCode'),
    heButtonActive: document.getElementById('langHeButton')?.classList.contains('active') || false,
  }));
  assert(state.lang === 'he', `${scenarioId}: document lang is he`);
  assert(state.dir === 'rtl', `${scenarioId}: document direction is rtl`);
  assert(state.htmlLanguage === 'he', `${scenarioId}: html data-language is he`);
  assert(state.bodyLanguage === 'he', `${scenarioId}: body data-language is he`);
  assert(/\blang-he\b/.test(state.bodyClass), `${scenarioId}: body has lang-he class`);
  assert(state.storedLanguage === 'he', `${scenarioId}: Hebrew preference persisted`);
  assert(state.storedCode === fixtureCode, `${scenarioId}: fixture access code persisted only on student page`);
  assert(state.heButtonActive, `${scenarioId}: Hebrew toggle is active`);
}

async function showSection(page, section) {
  await page.evaluate((name) => {
    window.setPortalSection(name, { scroll: false });
  }, section);
  const selector = sectionSelectors[section];
  if (selector) await page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(250);
}

async function auditSection(page, scenario, section) {
  await showSection(page, section);

  if (section === 'questions') {
    const question = page.locator('#questionList details').first();
    await question.locator('summary').click({ timeout: 10000 });
    const questionText = await question.innerText({ timeout: 10000 });
    assert(questionText.includes(hebrew.answerLabel), `${scenario.id}: question answer label is localized`);
    assert(questionText.includes(hebrew.sourceRef), `${scenario.id}: Sefaria source uses Hebrew ref when available`);
    assert(!questionText.includes('Answer:'), `${scenario.id}: question card does not show hardcoded English answer label`);
  }

  if (section === 'assignments') {
    const assignment = page.locator('#assignmentList details').first();
    await assignment.locator('summary').click({ timeout: 10000 });
    const assignmentText = await assignment.innerText({ timeout: 10000 });
    assert(assignmentText.includes(hebrew.worksheet), `${scenario.id}: assignment worksheet body renders in Hebrew`);
  }

  if (section === 'calendar') {
    await page.locator(`.calendar-view-button.active[data-student-calendar-mode="${scenario.expectedCalendarMode}"]`).waitFor({ timeout: 10000 });
    assert(true, `${scenario.id}: calendar defaults to ${scenario.expectedCalendarMode} view`);
    await page.locator('[data-student-calendar-event]').first().click({ timeout: 10000 });
    await page.locator('.calendar-drawer').waitFor({ state: 'visible', timeout: 10000 });
    const drawerText = await page.locator('.calendar-drawer').innerText({ timeout: 10000 });
    assert(/[\u0590-\u05ff]/.test(drawerText), `${scenario.id}: calendar drawer renders Hebrew-visible detail`);
  }

  if (section === 'overview') {
    const text = await readBodyText(page);
    assert(text.includes(hebrew.goalTitle), `${scenario.id}: overview includes active Hebrew goal title`);
    assert(text.includes(hebrew.whatsapp), `${scenario.id}: WhatsApp Rabbi button is localized in Hebrew`);
    assert(!text.includes('WhatsApp Rabbi Shloimie'), `${scenario.id}: overview does not show hardcoded English WhatsApp label`);
  }

  const text = await readBodyText(page);
  assertHebrewText(text, `${scenario.id}/${section}`);
  assertNoPrivateText(text, `${scenario.id}/${section}`);
  await checkNoOverflow(page, `${scenario.id}/${section}`);
  const selector = sectionSelectors[section];
  if (scenario.isMobile && selector) {
    await page.locator(selector).scrollIntoViewIfNeeded({ timeout: 10000 });
    await page.waitForTimeout(120);
  }
  await page.screenshot({
    path: screenshotPath(`${scenario.id}-${section}.png`),
    fullPage: !scenario.isMobile,
  });
}

async function installStudentPortalFixture(context) {
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
      blockedWrites.push(`${request.method()} ${url.pathname}`);
      await route.fulfill({
        status: 405,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ error: 'Student Hebrew/RTL smoke blocks write requests.' }),
      });
      return;
    }

    unexpectedPortalRequests.push(`${request.method()} ${url.pathname}${url.search}`);
    await route.fulfill({
      status: 403,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ error: 'Unexpected student portal fixture request.' }),
    });
  });
}

async function runScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    isMobile: scenario.isMobile,
    hasTouch: scenario.isMobile,
    locale: 'he-IL',
  });
  await context.addInitScript(() => {
    localStorage.setItem('bnaStudentGoalBoardLanguage', 'he');
  });
  await installStudentPortalFixture(context);

  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message || String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  try {
    await page.goto(routeUrl(studentPath), { waitUntil: 'networkidle' });
    await page.locator('#portalLayout').waitFor({ state: 'visible', timeout: 15000 });
    await assertLanguageState(page, scenario.id);

    for (const section of scenario.sections) {
      await auditSection(page, scenario, section);
    }

    assert(pageErrors.length === 0, `${scenario.id}: no page runtime errors`);
    assert(consoleErrors.length === 0, `${scenario.id}: no console errors`);
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });

try {
  for (const scenario of scenarios) {
    try {
      await runScenario(browser, scenario);
    } catch (error) {
      failures.push(`${scenario.id}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}

if (blockedWrites.length) {
  failures.push(`Unexpected write attempts were blocked: ${blockedWrites.join(', ')}`);
}
if (unexpectedPortalRequests.length) {
  failures.push(`Unexpected student portal fixture requests: ${unexpectedPortalRequests.join(', ')}`);
}

const result = failures.length ? 'FAIL' : 'PASS';
const report = [
  '# Student Hebrew/RTL Portal Audit Smoke',
  '',
  `- Base URL: \`${baseUrl}\``,
  `- Student path: \`${studentPath}\``,
  `- Fixture access code: \`${fixtureCode}\``,
  `- Result: ${result}`,
  '- Scope: student portal login auto-open, overview, calendar, goals, assignments, questions, documents, student helper, and parent-message/account help sections in Hebrew RTL.',
  '- Guardrail: all `/api/student-portal` reads were fulfilled with synthetic fixture data; all write endpoints were blocked and no checkoff/message/save action was clicked.',
  '',
  '## Screenshots',
  '',
  ...screenshots.map((item) => `- \`${item}\``),
  '',
  '## Checks',
  '',
  ...pass.map((item) => `- PASS ${item}`),
  ...(failures.length ? ['', '## Failures', '', ...failures.map((item) => `- FAIL ${item}`)] : []),
  '',
].join('\n');

fs.writeFileSync(path.join(outDir, 'report.md'), report);
console.log(report);

if (failures.length) {
  process.exitCode = 1;
}
