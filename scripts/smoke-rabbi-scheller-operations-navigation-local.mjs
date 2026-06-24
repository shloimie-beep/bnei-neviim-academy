#!/usr/bin/env node
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'playwright-smokes', '2026-06-23-rabbi-scheller-operations-navigation-local');

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const routeChecks = [
  { view: 'dashboard', section: 'overview', expectedView: 'dashboard', expectedSection: 'overview' },
  { view: 'tasks', section: 'tasks', expectedView: 'tasks', expectedSection: 'tasks' },
  { view: 'contacts', section: 'students', expectedView: 'contacts', expectedSection: 'participants' },
  { view: 'service_providers', section: 'schedule', expectedView: 'service_providers', expectedSection: 'schedule' },
  { view: 'communications', section: 'students', expectedView: 'communications', expectedSection: 'providers' },
  { view: 'api_usage', section: 'student', expectedView: 'api_usage', expectedSection: 'provider' },
  { view: 'settings', section: 'student_portal', expectedView: 'settings', expectedSection: 'provider_portal' },
];

const workspace = {
  id: 'rabbi_sheller_provider',
  key: 'rabbi_sheller_provider',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
  display_name: 'Rabbi Scheller Workspace',
  name: 'Rabbi Scheller Workspace',
  workspace_type: 'service_provider',
  display_category: 'service_provider',
  role: 'provider_admin',
  role_label: 'Provider Admin',
  scope_label: 'Service Provider / Provider Admin',
  description: 'Fixture workspace for local Operations navigation proof.',
};

const project = {
  id: 101,
  project_key: 'one_time_mishnah_class',
  name: 'One Time Mishnah Class',
  short_name: 'One Time',
};

const opsIdentity = {
  authenticated: true,
  username: 'rabbi-provider-admin.local',
  displayName: 'Rabbi Scheller Provider Admin',
  role: 'project_owner',
  workspace_role: 'provider_admin',
  workspace_role_label: 'Provider Admin',
  canonical_role_label: 'Provider Admin',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
  scope: {
    type: 'project',
    projectKey: 'one_time_mishnah_class',
    workspaceKey: 'rabbi_sheller_provider',
  },
  allowedViews: [
    'dashboard',
    'watchdog',
    'service_providers',
    'agents',
    'contacts',
    'community',
    'content',
    'live_classes',
    'calendar',
    'communications',
    'tasks',
    'automations',
    'integrations',
    'api_usage',
    'settings',
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

function jsonResponse(res, payload) {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function apiFixture(url) {
  const pathname = url.pathname.replace(/^\/api\/bna/, '') || '/';
  if (pathname === '/auth/me') return opsIdentity;
  if (pathname === '/workspace-directory') {
    return {
      workspaces: [workspace],
      categories: [{ id: 'service_provider', label: 'Service Provider' }],
      review_items: [],
    };
  }
  if (pathname === '/workspace-platform') {
    return {
      workspaces: [workspace],
      connector_settings: [],
      bot_actions: [],
      bot_action_logs: [],
    };
  }
  if (pathname === '/workspace-settings/rabbi_sheller_provider/branding') {
    return {
      workspace_key: 'rabbi_sheller_provider',
      workspace_name_override: 'Rabbi Scheller Workspace',
      logo_url: '/icons/icon-192.png',
      primary_color: '#1f4f46',
    };
  }
  if (pathname === '/projects') return { projects: [project] };
  if (pathname === '/tasks') {
    return {
      tasks: [{
        id: 901,
        title: 'Provider-scoped task fixture',
        display_title: 'Provider-scoped task fixture',
        stage: 'active',
        task_kind: 'task',
        item_type: 'task',
        status_bucket: 'tasks',
        urgency: 'this_week',
        project_key: 'one_time_mishnah_class',
        workspace_key: 'rabbi_sheller_provider',
        assigned_to: 'Provider Admin',
        created_at: '2026-06-23T00:00:00.000Z',
        updated_at: '2026-06-23T00:00:00.000Z',
      }],
    };
  }
  if (pathname === '/people') {
    return { people: [{ id: 1, name: 'Provider Member Fixture', role: 'member', workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' }] };
  }
  if (pathname === '/students') {
    return { students: [{ id: 11, name: 'Provider Student Fixture', workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' }] };
  }
  if (pathname === '/assignments') return { assignments: [] };
  if (pathname === '/assignment-prompts') return { prompts: [] };
  if (pathname === '/devices') return { devices: [] };
  if (pathname === '/device-access-rules') return { rules: [] };
  if (pathname === '/torah-learning') return { summary: null, entries: [] };
  if (pathname === '/accountability') return { events: [] };
  if (pathname === '/group-goals') return { goals: [] };
  if (pathname === '/members') return { members: [] };
  if (pathname === '/live-sessions') return { sessions: [] };
  if (pathname === '/calendar-events') return { events: [] };
  if (pathname === '/pipeline-cards') return { cards: [] };
  if (pathname === '/internal-dialogue') return { threads: [], messages: [] };
  if (pathname === '/support-tickets') return { tickets: [] };
  if (pathname === '/signups') return { signups: [] };
  if (pathname === '/parent-leads') return { leads: [] };
  if (pathname === '/service-providers') {
    return {
      providers: [{
        id: 1,
        provider_name: 'Rabbi Elie Scheller',
        workspace_key: 'rabbi_sheller_provider',
        project_key: 'one_time_mishnah_class',
        provider_status: 'active_partner',
        category: 'Mishnah class',
      }],
    };
  }
  if (pathname === '/contact-communications') return { communications: [] };
  if (pathname === '/parent-announcements') return { announcements: [] };
  if (pathname === '/payments') return { payments: [] };
  if (pathname === '/payment-intake') return { intake: [] };
  if (pathname === '/payment-reminders/due') return { reminders: [] };
  if (pathname === '/content-jobs') return { jobs: [] };
  if (pathname === '/class-sessions') return { sessions: [] };
  if (pathname === '/project-meetings') return { meetings: [] };
  if (pathname === '/content-prompts') return { prompts: [] };
  if (pathname === '/content-bundles') return { bundles: [] };
  if (pathname === '/one-time/classes') return { classes: [] };
  if (pathname === '/one-time/classroom') return { classroom: null };
  if (pathname === '/one-time/question-moderation') return { reviews: [], summary: null };
  if (pathname === '/courses') return { courses: [] };
  if (pathname === '/worksheets') return { worksheets: [] };
  if (pathname === '/course-questions') return { questions: [] };
  if (pathname === '/gamification-events') return { events: [] };
  if (pathname === '/shoutouts') return { shoutouts: [] };
  if (pathname === '/agent-fleet/status') return { agents: [], summary: {} };
  if (pathname === '/ops/queue-health') return { queues: [], summary: {} };
  if (pathname === '/notifications') return { notifications: [], summary: null };
  if (pathname === '/notification-preferences') return { preferences: [] };
  if (pathname === '/integrations/google/status') return { configured: false, status: 'not_configured' };
  if (pathname === '/integrations/status') return { status: 'not_configured', integrations: [] };
  if (pathname === '/automations') return { automations: [], filters: {} };
  if (pathname === '/communications/social/drafts') return { drafts: [] };
  if (pathname === '/communications/email/drafts') return { drafts: [] };
  if (pathname === '/communications/dns-tasks') return { tasks: [] };
  if (pathname === '/integrations/buffer/health') return { configured: false };
  if (pathname === '/integrations/buffer/channels') return { channels: [] };
  if (pathname === '/integrations/resend/health') return { configured: false };
  if (pathname === '/integrations/resend/domains') return { domains: [] };
  if (pathname === '/rabbi/config') return { config: { status: 'preview' } };
  if (pathname === '/rabbi/tiers') return { tiers: [] };
  if (pathname === '/rabbi/provider-settings') return { settings: [] };
  if (pathname === '/rabbi/checkouts') return { checkouts: [] };
  if (pathname === '/rabbi/members') return { members: [] };
  if (pathname === '/rabbi/access-grants') return { grants: [] };
  if (pathname === '/rabbi/library-items') return { items: [] };
  if (pathname === '/rabbi/live-sessions') return { sessions: [] };
  if (pathname === '/rabbi/communications') return { communications: [] };
  if (pathname === '/rabbi/site') return { site: { status: 'preview' } };
  return {};
}

async function serveStatic(req, res, requestLog) {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (url.pathname.startsWith('/api/bna/')) {
    requestLog.push({ method: req.method || 'GET', path: url.pathname, search: url.search, href: `${url.pathname}${url.search}` });
    if ((req.method || 'GET') !== 'GET') {
      jsonResponse(res, { success: true, preview_only: true, no_external_write: true });
      return;
    }
    jsonResponse(res, apiFixture(url));
    return;
  }

  const routePath = url.pathname === '/operations' || url.pathname === '/' ? '/operations.html' : url.pathname;
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

function operationsUrl(baseUrl, route) {
  const url = new URL('/operations', baseUrl);
  url.searchParams.set('workspace', 'rabbi_sheller_provider');
  url.searchParams.set('view', route.view);
  if (route.section) url.searchParams.set('section', route.section);
  return url.toString();
}

function hasScopedQuery(href, key, value) {
  const url = new URL(href, 'http://127.0.0.1');
  return url.searchParams.get(key) === value;
}

async function pageState(page) {
  return page.evaluate(() => ({
    workspace: currentWorkspaceKey(),
    view: currentView,
    taskFocus,
    taskProjectFilter,
    contactSection,
    serviceProviderSection,
    communicationsSection,
    apiUsageSection,
    settingsSection,
    navIds: workspaceNavItems().map((item) => item.id),
    navLabels: workspaceNavItems().map((item) => item.label),
    currentSectionLabel: currentSectionLabel(),
    bodyText: document.body.innerText,
    noHorizontalOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  }));
}

async function waitForOperationsShell(page) {
  await page.waitForFunction(() => {
    const nodes = Array.from(document.querySelectorAll('.ops-brand-topbar, .mobile-app-header'));
    return nodes.some((node) => {
      const style = window.getComputedStyle(node);
      return style && style.display !== 'none' && style.visibility !== 'hidden' && node.getBoundingClientRect().height > 0;
    });
  }, null, { timeout: 15000 });
}

function assertState(route, state) {
  const sectionByView = {
    dashboard: 'overview',
    tasks: state.taskFocus,
    contacts: state.contactSection,
    service_providers: state.serviceProviderSection,
    communications: state.communicationsSection,
    api_usage: state.apiUsageSection,
    settings: state.settingsSection,
  };
  if (state.workspace !== 'rabbi_sheller_provider') throw new Error(`${route.view} loaded workspace ${state.workspace}`);
  if (state.view !== route.expectedView) throw new Error(`${route.view} normalized to unexpected view ${state.view}`);
  if (route.expectedView !== 'dashboard' && sectionByView[route.expectedView] !== route.expectedSection) {
    throw new Error(`${route.view}/${route.section} normalized to unexpected section ${sectionByView[route.expectedView]}`);
  }
  if (state.taskProjectFilter !== 'one_time_mishnah_class') throw new Error(`${route.view} taskProjectFilter=${state.taskProjectFilter}`);
  for (const forbidden of ['platform_suite', 'admin', 'accounting', 'students']) {
    if (state.navIds.includes(forbidden)) throw new Error(`${route.view} nav includes forbidden ${forbidden}`);
  }
  for (const required of ['dashboard', 'service_providers', 'contacts', 'communications', 'tasks', 'api_usage', 'settings']) {
    if (!state.navIds.includes(required)) throw new Error(`${route.view} nav missing ${required}`);
  }
  for (const forbiddenLabel of ['Platform Suite', 'Program Suite', 'Team / Admin', 'Accounting']) {
    if (state.bodyText.includes(forbiddenLabel)) throw new Error(`${route.view} rendered forbidden label ${forbiddenLabel}`);
  }
  if (!state.noHorizontalOverflow) throw new Error(`${route.view} has horizontal overflow`);
}

function assertScopedRequests(requests) {
  const taskRequests = requests.filter((request) => request.path === '/api/bna/tasks');
  if (!taskRequests.length) throw new Error('No task request was observed');
  for (const request of taskRequests) {
    if (!hasScopedQuery(request.href, 'project_key', 'one_time_mishnah_class')) {
      throw new Error(`Task request was not provider-scoped: ${request.href}`);
    }
  }

  const workspaceScoped = new Set([
    '/api/bna/workspace-directory',
    '/api/bna/workspace-platform',
    '/api/bna/calendar-events',
    '/api/bna/pipeline-cards',
    '/api/bna/internal-dialogue',
    '/api/bna/contact-communications',
    '/api/bna/parent-announcements',
    '/api/bna/notifications',
    '/api/bna/notification-preferences',
  ]);
  for (const request of requests.filter((item) => workspaceScoped.has(item.path))) {
    if (!hasScopedQuery(request.href, 'workspace', 'rabbi_sheller_provider')) {
      throw new Error(`Workspace-scoped request missing Rabbi workspace: ${request.href}`);
    }
  }

  const projectScoped = new Set([
    '/api/bna/people',
    '/api/bna/students',
    '/api/bna/assignments',
    '/api/bna/devices',
    '/api/bna/device-access-rules',
    '/api/bna/accountability',
    '/api/bna/group-goals',
    '/api/bna/content-jobs',
    '/api/bna/class-sessions',
    '/api/bna/courses',
    '/api/bna/worksheets',
    '/api/bna/course-questions',
    '/api/bna/gamification-events',
    '/api/bna/shoutouts',
  ]);
  for (const request of requests.filter((item) => projectScoped.has(item.path))) {
    if (!hasScopedQuery(request.href, 'project_key', 'one_time_mishnah_class')) {
      throw new Error(`Project-scoped request missing One Time project: ${request.href}`);
    }
  }

  for (const request of requests) {
    if (request.href.includes('workspace=bna') || request.href.includes('project_key=bna')) {
      throw new Error(`Unexpected BNA-scoped request while in Rabbi workspace: ${request.href}`);
    }
  }
}

async function run() {
  await mkdir(outDir, { recursive: true });
  const requestLog = [];
  const server = createServer((req, res) => {
    serveStatic(req, res, requestLog).catch((error) => {
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
      for (const route of routeChecks) {
        const before = requestLog.length;
        const page = await browser.newPage({ viewport });
        const consoleErrors = [];
        const pageErrors = [];
        const failedRequests = [];
        page.on('console', (message) => {
          if (message.type() === 'error') consoleErrors.push(message.text());
        });
        page.on('pageerror', (error) => pageErrors.push(error.message));
        page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`));

        try {
          const response = await page.goto(operationsUrl(baseUrl, route), { waitUntil: 'networkidle', timeout: 30000 });
          if (!response || response.status() >= 400) throw new Error(`Navigation failed with status ${response?.status() || 0}`);
          await waitForOperationsShell(page);
          await page.waitForFunction(() => currentWorkspaceKey() === 'rabbi_sheller_provider', null, { timeout: 10000 });
          const state = await pageState(page);
          assertState(route, state);
          const screenshotPath = path.join(outDir, `${viewport.name}-${route.view}-${route.section || 'overview'}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          results.push({
            viewport,
            route,
            url: page.url().replace(baseUrl, ''),
            state: {
              workspace: state.workspace,
              view: state.view,
              taskFocus: state.taskFocus,
              taskProjectFilter: state.taskProjectFilter,
              contactSection: state.contactSection,
              serviceProviderSection: state.serviceProviderSection,
              communicationsSection: state.communicationsSection,
              apiUsageSection: state.apiUsageSection,
              settingsSection: state.settingsSection,
              navIds: state.navIds,
              navLabels: state.navLabels,
              noHorizontalOverflow: state.noHorizontalOverflow,
            },
            screenshot: path.relative(repoRoot, screenshotPath).replace(/\\/g, '/'),
            requestCount: requestLog.length - before,
            consoleErrors,
            pageErrors,
            failedRequests,
          });
          if (consoleErrors.length || pageErrors.length || failedRequests.length) {
            throw new Error(`${route.view} at ${viewport.name} had console/page/request errors`);
          }
        } finally {
          await page.close();
        }
      }

      const page = await browser.newPage({ viewport });
      try {
        await page.goto(operationsUrl(baseUrl, { view: 'dashboard', section: 'overview' }), { waitUntil: 'networkidle', timeout: 30000 });
        await waitForOperationsShell(page);
        await page.evaluate(() => {
          if (typeof switchView !== 'function') throw new Error('switchView is not available');
          switchView('tasks');
        });
        await page.waitForURL(/view=tasks/, { timeout: 10000 });
        const taskState = await pageState(page);
        if (taskState.workspace !== 'rabbi_sheller_provider' || taskState.view !== 'tasks' || taskState.taskProjectFilter !== 'one_time_mishnah_class') {
          throw new Error(`Module toolbar task navigation lost provider state: ${JSON.stringify(taskState)}`);
        }
        await page.goBack({ waitUntil: 'networkidle', timeout: 30000 });
        await waitForOperationsShell(page);
        await page.waitForFunction(() => typeof currentWorkspaceKey === 'function' && currentWorkspaceKey() === 'rabbi_sheller_provider', null, { timeout: 10000 });
        const backState = await pageState(page);
        if (backState.workspace !== 'rabbi_sheller_provider' || backState.view !== 'dashboard') {
          throw new Error(`Back navigation lost provider dashboard state: ${JSON.stringify(backState)}`);
        }
        results.push({
          viewport,
          route: { view: 'dashboard', section: 'toolbar-back' },
          url: page.url().replace(baseUrl, ''),
          state: {
            workspace: backState.workspace,
            view: backState.view,
            taskProjectFilter: backState.taskProjectFilter,
          },
          requestCount: 0,
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
        });
      } finally {
        await page.close();
      }
    }

    assertScopedRequests(requestLog);

    const report = {
      generated_at: new Date().toISOString(),
      local_only: true,
      mocked_api: true,
      production_data_mutation_performed: false,
      external_write_performed: false,
      base_url: baseUrl,
      viewports,
      routes: routeChecks,
      results,
      request_log: requestLog,
      assertions: [
        'Rabbi workspace deep links keep currentWorkspaceKey() as rabbi_sheller_provider.',
        'Provider workspace direct links initialize taskProjectFilter to one_time_mishnah_class.',
        'Provider workspace nav excludes platform_suite, admin, accounting, and students.',
        'Provider workspace view/section aliases normalize students to participants/providers/provider_portal.',
        'Observed task, workspace, and high-risk data requests carry Rabbi workspace or One Time project scope.',
        'No observed request asks for workspace=bna or project_key=bna.',
        'No console errors, page errors, failed requests, or horizontal overflow at required viewports.',
      ],
    };
    await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
    await writeFile(path.join(outDir, 'report.md'), [
      '# Rabbi Scheller Operations Navigation Local Smoke',
      '',
      `Generated: ${report.generated_at}`,
      '',
      '- Local fixture-backed smoke only.',
      '- No database access, credentials, external writes, sends, billing, DNS, deploy, or live smoke.',
      '- Opened the Operations app as a provider-scoped Rabbi Scheller identity.',
      '- Verified dashboard, tasks, contacts, program, communications, API usage, settings, toolbar navigation, browser back, and required viewports.',
      '',
      `Results: ${results.length} checks passed.`,
      '',
      '## Assertions',
      '',
      ...report.assertions.map((item) => `- ${item}`),
      '',
      '## Screenshots',
      '',
      ...results.filter((item) => item.screenshot).map((item) => `- ${item.route.view}/${item.route.section}: \`${item.screenshot}\``),
      '',
      '## API Requests',
      '',
      ...requestLog.map((item) => `- ${item.method} ${item.href}`),
      '',
    ].join('\n'));
    console.log(`PASS Rabbi Scheller Operations navigation local smoke: ${path.relative(repoRoot, path.join(outDir, 'report.md'))}`);
  } finally {
    await browser.close();
    await close(server);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
