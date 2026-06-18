const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const { chromium } = require('playwright');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://bna_test:bna_test@127.0.0.1:1/bna_test';
process.env.OPS_USERNAME = 'super-admin-test';
process.env.OPS_PASSWORD = 'super-secret-test';
process.env.ONE_TIME_OPS_USERNAME = 'one-time-test';
process.env.ONE_TIME_OPS_PASSWORD = 'one-time-secret-test';
process.env.PAYMENT_REMINDER_SCHEDULER = 'off';

const { app } = require('../server');

const TEST_STUDENT_ID = 301;
const TEST_STUDENT_NAME = 'TEST BNA Seed Student';
const TEST_ACCESS_CODE = 'TEST-SEED-CODE';

function basicAuth(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function withServer(fn) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function jsonResponse(payload) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  };
}

function projectFrom(url) {
  return url.searchParams.get('project') || 'all';
}

function fixtureStudent() {
  return {
    id: TEST_STUDENT_ID,
    workspace_id: 1,
    project_key: 'bna',
    workspace_key: 'bna',
    workspace_name: 'BNA',
    name: TEST_STUDENT_NAME,
    parent_name: 'TEST BNA Seed Parent',
    parent_email: 'test-bna-seed@example.invalid',
    grade: 'TEST',
    age: 11,
    status: 'active',
    student_access_code: TEST_ACCESS_CODE,
    tags: ['TEST'],
    notes: 'TEST-BNA-SEED student fixture',
  };
}

function fixtureGoal() {
  return {
    id: 401,
    workspace_id: 1,
    student_id: TEST_STUDENT_ID,
    student_name: TEST_STUDENT_NAME,
    event_type: 'student_goal',
    title: 'TEST-BNA-SEED: Finish today honestly',
    topic: 'Self governance',
    progress_percent: 50,
    source: 'manual',
    created_at: '2026-06-18T08:00:00+03:00',
    metadata: {
      source: 'admin',
      urgency: 'today',
      status: 'active',
      due_at: '2026-06-19T20:00:00+03:00',
      student_summary: 'Student sees only the assigned goal summary.',
      agreement: {
        bedtime_time: '21:30',
        wake_time: '07:00',
        student_commitment: 'I will check off honestly.',
        chosen_consequence: 'Review with rebbi',
      },
      consequence: {
        success_device_access_state: 'approved_access',
        success_duration_minutes: 60,
      },
    },
  };
}

function operationsFixture(pathname, url, options = {}) {
  const authMode = options.authMode || 'super_admin';
  const scopedOneTime = authMode === 'scoped_one_time';
  const project = projectFrom(url);
  const workspaceProject = project === 'all' ? 'all' : project;
  const student = fixtureStudent();
  const goal = fixtureGoal();

  const routes = {
    '/api/bna/auth/me': {
      success: true,
      user: scopedOneTime ? 'one-time-test' : 'super-admin-test',
      role: scopedOneTime ? 'workspace_member' : 'super_admin',
      scope: scopedOneTime
        ? {
            type: 'workspace',
            workspaceType: 'service_provider',
            workspaceKey: 'one_time_mishnah_class',
            projectKey: 'one_time_mishnah_class',
          }
        : { type: 'global', workspaceType: null, workspaceKey: null, projectKey: null },
      allowedViews: scopedOneTime
        ? ['tasks', 'assistant', 'calendar', 'content', 'contacts', 'automations', 'integrations']
        : ['tasks', 'assistant', 'calendar', 'students', 'content', 'contacts', 'accounting', 'automations', 'integrations', 'users'],
    },
    '/api/bna/projects': {
      projects: scopedOneTime
        ? [
            { project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time', workspace_type: 'service_provider' },
          ]
        : [
            { project_key: 'bna', name: 'BNA', short_name: 'BNA', workspace_type: 'school' },
            { project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time', workspace_type: 'service_provider' },
          ],
    },
    '/api/bna/tasks': {
      tasks: [
        {
          id: 201,
          workspace_id: project === 'one_time_mishnah_class' ? 2 : 1,
          project_key: project === 'one_time_mishnah_class' ? 'one_time_mishnah_class' : 'bna',
          title: `${project === 'one_time_mishnah_class' ? 'One Time' : 'BNA'} acceptance task`,
          stage: 'decision_required',
          category: 'operations',
          urgency: 'today',
          assigned_to: 'System Work',
          created_at: '2026-06-18T08:00:00+03:00',
          ai_parsed: { seed_marker: 'TEST-BNA-SEED' },
        },
      ],
    },
    '/api/bna/calendar': {
      events: [
        {
          id: 'class-1',
          source_type: 'class_session',
          title: 'TEST-BNA-SEED Live class',
          class_date: '2026-06-19',
          project_key: workspaceProject,
          workspace_label: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
        },
      ],
    },
    '/api/bna/assistant/status': {
      assistant: {
        visible_label: 'BNA Assistant',
        active_provider: 'openai',
        openai_configured: true,
        model: 'test-model',
        workspace_project: workspaceProject,
        user_role: 'super_admin',
        capabilities: ['operations_navigation', 'permissioned_action_registry'],
        disabled_until_verified: [],
      },
    },
    '/api/bna/assistant/memory': {
      scope: {
        project_key: workspaceProject,
        module_key: 'assistant',
        subject_type: 'workspace',
        subject_id: workspaceProject,
        user_scope: 'current_user',
        user_role: 'super_admin',
      },
      memories: [{ memory_key: 'test_seed_context', visibility: 'scoped' }],
    },
    '/api/bna/assistant/actions': {
      actions: [
        {
          action_key: 'calendar.read_context',
          label: 'Read calendar context',
          module_key: 'calendar',
          method: 'GET',
          route: '/api/bna/calendar',
          enabled: true,
        },
      ],
    },
    '/api/bna/automations/status': { automations: [] },
    '/api/bna/integrations/status': { integrations: [] },
    '/api/bna/users': { users: [] },
    '/api/bna/invitations': { invitations: [] },
    '/api/bna/signups': { signups: [] },
    '/api/bna/payments': { payments: [] },
    '/api/bna/payment-intake': { intake: [] },
    '/api/bna/payment-reminders/due': { found: 0, due: [] },
    '/api/bna/green-invoice/webhooks': { events: [] },
    '/api/bna/content-jobs': { jobs: [] },
    '/api/bna/content-prompts': { prompts: [] },
    '/api/bna/content-bundles': { bundles: [] },
    '/api/bna/students': { students: project === 'one_time_mishnah_class' ? [] : [student] },
    '/api/bna/devices': {
      devices: [
        {
          id: 501,
          workspace_id: 1,
          student_id: TEST_STUDENT_ID,
          device_name: 'TEST-BNA-SEED Tablet',
          status: 'approved_access',
          provider: 'mock',
          active_session: {
            started_at: '2026-06-19T18:00:00+03:00',
            expires_at: '2026-06-19T19:00:00+03:00',
          },
        },
      ],
    },
    '/api/bna/device-access-rules': { rules: [] },
    '/api/bna/torah-learning': {
      group: { groupPercentage: 50 },
      students: [{ id: TEST_STUDENT_ID, percentage: 50, daily_completion_percentage: 50 }],
    },
    '/api/bna/accountability': { events: [goal] },
    '/api/bna/group-goals': { goals: [] },
  };

  return routes[pathname] || null;
}

function studentPortalFixture() {
  return {
    student: fixtureStudent(),
    torah: {
      public_trip_percentage: 50,
      daily_completion_percentage: 50,
      morning_goal_status: 'in_progress',
    },
    device_access: {
      status: 'approved_access',
      status_label: 'approved_access',
      device_count: 1,
      expires_at: '2026-06-19T19:00:00+03:00',
    },
    goals: [
      {
        id: 401,
        title: 'TEST-BNA-SEED: Finish today honestly',
        bucket: 'today',
        status: 'active',
        progress_percent: 50,
        goal_target_value: 1,
        goal_actual_value: 0.5,
        goal_unit: 'checkoff',
        source_label: 'BNA',
        urgency: 'today',
        due_at: '2026-06-19T20:00:00+03:00',
        agreement: {
          bedtime_time: '21:30',
          wake_time: '07:00',
          student_commitment: 'I will check off honestly.',
          chosen_consequence: 'Review with rebbi',
        },
        consequence: {
          success_device_access_state: 'approved_access',
          success_duration_minutes: 60,
        },
        student_summary: 'Student sees only the assigned goal summary.',
      },
    ],
  };
}

async function installFixtureRoutes(context, calls, options = {}) {
  await context.route('**/api/bna/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    calls.push({ method: request.method(), pathname: url.pathname, search: url.search, project: projectFrom(url) });
    const payload = operationsFixture(url.pathname, url, options);
    if (!payload) {
      await route.fulfill(jsonResponse({ error: `Unhandled test fixture route: ${url.pathname}` }));
      return;
    }
    await route.fulfill(jsonResponse(payload));
  });

  await context.route('**/api/student-portal**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    calls.push({ method: request.method(), pathname: url.pathname, search: url.search, project: '' });
    await route.fulfill(jsonResponse(studentPortalFixture()));
  });
}

async function noHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, JSON.stringify(metrics));
}

async function assertOperationsShellStable(page, label) {
  await page.locator('.ops-app-shell').waitFor();
  await page.locator('.ops-view-frame').waitFor();
  const metrics = await page.evaluate(() => {
    const shell = document.querySelector('.ops-app-shell');
    const frame = document.querySelector('.ops-view-frame');
    const shellBox = shell?.getBoundingClientRect();
    const frameBox = frame?.getBoundingClientRect();
    return {
      shellHeight: shellBox?.height || 0,
      frameHeight: frameBox?.height || 0,
      frameWidth: frameBox?.width || 0,
      currentView: frame?.getAttribute('data-current-view') || '',
    };
  });
  assert.ok(metrics.shellHeight > 300, `${label} shell collapsed: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.frameHeight > 180, `${label} frame collapsed: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.frameWidth > 200, `${label} frame width collapsed: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.currentView, `${label} missing current view: ${JSON.stringify(metrics)}`);
  await noHorizontalOverflow(page);
}

async function assertOperationsIdentity(page) {
  const identity = await page.evaluate(() => ({
    manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href') || '',
    hasOpsLogo: Array.from(document.images).some((img) => (
      img.classList.contains('ops-brand-logo')
        && img.getAttribute('alt') === "Bnei Nevi'im Academy"
        && img.getAttribute('src') === '/images/bna-logo-nobg.png'
    )),
    hasMobileLogo: Array.from(document.images).some((img) => (
      img.classList.contains('mobile-brand-logo')
        && img.getAttribute('alt') === "Bnei Nevi'im Academy"
        && img.getAttribute('src') === '/images/bna-logo-nobg.png'
    )),
    text: document.body.textContent || '',
  }));
  assert.equal(identity.manifest, '/operations-manifest.json');
  assert.ok(identity.hasOpsLogo, JSON.stringify(identity));
  assert.ok(identity.hasMobileLogo, JSON.stringify(identity));
  assert.match(identity.text, /BNA Operations/);
  assert.match(identity.text, /Private Operations portal/);
  assert.match(identity.text, /EN/);
}

async function assertStudentPortalIdentity(page) {
  const identity = await page.evaluate(() => ({
    hasLogo: Array.from(document.images).some((img) => (
      img.classList.contains('portal-logo')
        && img.getAttribute('alt') === "Bnei Nevi'im Academy"
        && img.getAttribute('src') === '/images/bna-logo-nobg.png'
    )),
    brand: document.querySelector('.portal-brand-name')?.textContent?.trim() || '',
    eyebrow: document.querySelector('.eyebrow')?.textContent?.trim() || '',
    languageButtons: Array.from(document.querySelectorAll('[data-lang]')).map((node) => node.textContent.trim()),
  }));
  assert.ok(identity.hasLogo, JSON.stringify(identity));
  assert.equal(identity.brand, 'Bnei Neviim Academy');
  assert.equal(identity.eyebrow, 'Student Portal');
  assert.deepEqual(identity.languageButtons, ['EN', 'HE']);
}

async function moduleToolbarLabels(page) {
  return page.locator('.ops-module-toolbar .ops-module-button span:last-child').evaluateAll((nodes) => (
    nodes.map((node) => node.textContent.trim())
  ));
}

async function assertSidebarWorkspaceContextOnly(page) {
  const sidebar = page.locator('.ops-sidebar');
  await sidebar.waitFor();
  assert.equal(await sidebar.locator('.workspace-context-control').count(), 1);
  assert.equal(await sidebar.locator('.ops-module-button').count(), 0);
  assert.equal(await sidebar.locator('.ops-sidebar-nav').count(), 0);
}

async function waitForCall(calls, predicate, label) {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    if (calls.some(predicate)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(`Timed out waiting for API call: ${label}`);
}

test('Playwright Operations acceptance covers routes, history, responsive layout, workspace, helper, and student detail', async () => {
  await withServer(async (baseUrl) => {
    const calls = [];
    const browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: baseUrl,
      httpCredentials: { username: 'super-admin-test', password: 'super-secret-test' },
      serviceWorkers: 'block',
      viewport: { width: 390, height: 844 },
      extraHTTPHeaders: {
        authorization: basicAuth('super-admin-test', 'super-secret-test'),
      },
    });
    await installFixtureRoutes(context, calls);

    try {
      const page = await context.newPage();
      await page.goto('/operations?view=tasks', { waitUntil: 'domcontentloaded' });
      await page.locator('.ops-app-shell').waitFor();
      await assertOperationsIdentity(page);
      await assertSidebarWorkspaceContextOnly(page);
      assert.deepEqual(await moduleToolbarLabels(page), [
        'Tasks',
        'Assistant',
        'Calendar',
        'Students',
        'Content',
        'Contacts',
        'Accounting',
        'Automations',
        'Integrations',
        'Users',
      ]);
      await assertOperationsShellStable(page, 'initial mobile operations shell');

      await page.setViewportSize({ width: 1440, height: 900 });
      await assertOperationsShellStable(page, 'desktop operations shell');

      await page.locator('.ops-module-button').filter({ hasText: 'Assistant' }).click();
      await page.locator('.ops-view-frame[data-current-view="assistant"]').waitFor();
      assert.match(page.url(), /view=assistant/);
      await page.getByText('Memory Scope').waitFor();
      await page.getByText('test_seed_context').waitFor();
      await assertOperationsShellStable(page, 'assistant module operations shell');

      await page.locator('.ops-module-button').filter({ hasText: 'Students' }).click();
      await page.locator('.ops-view-frame[data-current-view="students"]').waitFor();
      await page.getByText(TEST_STUDENT_NAME).waitFor();
      await page.locator('.student-card').filter({ hasText: TEST_STUDENT_NAME }).first().click();
      await page.locator('.student-profile-hero').filter({ hasText: TEST_STUDENT_NAME }).waitFor();
      assert.match(page.url(), /view=students/);
      assert.match(page.url(), /section=profile/);
      assert.match(page.url(), new RegExp(`student=${TEST_STUDENT_ID}`));
      await assertOperationsShellStable(page, 'student profile operations shell');

      await page.goBack();
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('section') === 'overview');
      await page.goBack();
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('view') === 'assistant');
      await page.goForward();
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('view') === 'students');
      await assertOperationsShellStable(page, 'history restored operations shell');

      await page.locator('#workspaceProjectSelector').selectOption('one_time_mishnah_class');
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('project') === 'one_time_mishnah_class');
      const workspaceUrl = new URL(page.url());
      assert.equal(workspaceUrl.searchParams.get('view'), 'tasks');
      assert.equal(workspaceUrl.searchParams.get('section'), 'overview');
      assert.equal(workspaceUrl.searchParams.get('student'), null);
      await waitForCall(
        calls,
        (call) => call.pathname === '/api/bna/tasks' && call.project === 'one_time_mishnah_class',
        'tasks scoped to One Time workspace',
      );
      assert.equal(await page.locator('#workspaceProjectSelector').inputValue(), 'one_time_mishnah_class');
      await page.locator('.ops-view-frame[data-current-view="tasks"]').waitFor();
      assert.equal(await page.locator('.student-profile-hero').count(), 0);
      await assertOperationsShellStable(page, 'workspace switched operations shell');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('.ops-view-frame[data-current-view="tasks"]').waitFor();
      await assertOperationsShellStable(page, 'refreshed operations shell');
    } finally {
      await context.close();
      await browser.close();
    }
  });
});

test('Playwright Operations scoped user sees locked workspace context without global selector', async () => {
  await withServer(async (baseUrl) => {
    const calls = [];
    const browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: baseUrl,
      httpCredentials: { username: 'one-time-test', password: 'one-time-secret-test' },
      serviceWorkers: 'block',
      viewport: { width: 390, height: 844 },
      extraHTTPHeaders: {
        authorization: basicAuth('one-time-test', 'one-time-secret-test'),
      },
    });
    await installFixtureRoutes(context, calls, { authMode: 'scoped_one_time' });

    try {
      const page = await context.newPage();
      await page.goto('/operations?view=tasks', { waitUntil: 'domcontentloaded' });
      await page.locator('.ops-app-shell').waitFor();
      await page.locator('.workspace-context-control[data-mode="scoped"]').waitFor();
      await assertSidebarWorkspaceContextOnly(page);
      assert.doesNotMatch(await page.locator('.ops-sidebar').textContent(), /All workspaces/);
      assert.deepEqual(await moduleToolbarLabels(page), [
        'Tasks',
        'Assistant',
        'Calendar',
        'Content',
        'Contacts',
        'Automations',
        'Integrations',
      ]);
      await page.getByText('Service provider: One Time Mishnah Class').waitFor();
      await page.getByText('Scoped login').waitFor();
      assert.equal(await page.locator('#workspaceProjectSelector').count(), 0);
      await waitForCall(
        calls,
        (call) => call.pathname === '/api/bna/tasks' && call.project === 'one_time_mishnah_class',
        'scoped user tasks pinned to One Time workspace',
      );
      await waitForCall(
        calls,
        (call) => call.pathname === '/api/bna/calendar' && call.project === 'one_time_mishnah_class',
        'scoped user calendar pinned to One Time workspace',
      );
      await noHorizontalOverflow(page);
    } finally {
      await context.close();
      await browser.close();
    }
  });
});

test('Playwright Student Portal acceptance covers private route, Hebrew RTL, and responsive goal view', async () => {
  await withServer(async (baseUrl) => {
    const calls = [];
    const browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: baseUrl,
      serviceWorkers: 'block',
      viewport: { width: 390, height: 844 },
    });
    await installFixtureRoutes(context, calls);

    try {
      const page = await context.newPage();
      await page.goto(`/student?code=${TEST_ACCESS_CODE}`, { waitUntil: 'domcontentloaded' });
      await page.locator('#studentName').waitFor();
      await assertStudentPortalIdentity(page);
      assert.equal(await page.locator('#studentName').textContent(), TEST_STUDENT_NAME);
      await page.getByText('TEST-BNA-SEED: Finish today honestly').waitFor();
      await noHorizontalOverflow(page);

      await page.locator('[data-lang="he"]').click();
      const htmlState = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
      }));
      assert.deepEqual(htmlState, { lang: 'he', dir: 'rtl' });
      await noHorizontalOverflow(page);

      assert.ok(
        calls.some((call) => call.pathname === '/api/student-portal' && call.search.includes(TEST_ACCESS_CODE)),
        'student portal should request only the private access-code API',
      );
    } finally {
      await context.close();
      await browser.close();
    }
  });
});
