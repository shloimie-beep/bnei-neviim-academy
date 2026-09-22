#!/usr/bin/env node
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = process.cwd();
const runId = '2026-06-24-owner-review-role-flows-local';
const outDir = path.join(root, 'ops', 'playwright-smokes', runId);
const docsDir = path.join(root, 'docs', 'owner-review');
const roleFlowDoc = path.join(docsDir, 'ROLE-FLOW-QA.md');

const viewports = [
  { id: 'desktop', size: { width: 1366, height: 900 }, mobile: false },
  { id: 'mobile', size: { width: 390, height: 844 }, mobile: true },
];

const journeys = [
  { id: 'public-visitor', title: 'Anonymous public visitor', url: '/', audience: 'Public', assistant: 'website', expectedSurface: 'public', expected: ['Bnei Neviim Academy', 'Families'], expectedLinks: ['/providers', '/one-time'], backTarget: '/one-time' },
  { id: 'parent-one-child', title: 'Parent with one linked child', url: '/parent', audience: 'Parent', fixture: 'parent-one-child', assistant: 'website', expectedSurface: 'parent_portal', expected: ['Synthetic Parent', 'Avi Synthetic', 'Assistant/help'], forbidden: ['Benny Synthetic', 'Synthetic Robotics Lab'], backTarget: '/' },
  { id: 'parent-multiple-children', title: 'Parent with multiple children', url: '/parent', audience: 'Parent', fixture: 'parent-multiple-children', assistant: 'website', expectedSurface: 'parent_portal', expected: ['Synthetic Parent', 'Avi Synthetic', 'Benny Synthetic', 'Assistant/help'], forbidden: ['Synthetic Robotics Lab'], backTarget: '/' },
  { id: 'student', title: 'Student', url: '/student?code=QA-STUDENT', audience: 'Student', fixture: 'student', assistant: 'website', expectedSurface: 'student_portal', expected: ['Avi Synthetic', 'Assistant/help'], forbidden: ['Benny Synthetic', 'Synthetic Parent', 'Synthetic Robotics Lab'], backTarget: '/' },
  { id: 'provider-admin', title: 'Provider administrator', url: '/provider', audience: 'Provider admin', fixture: 'provider-admin', assistant: 'website', expectedSurface: 'provider_workspace', expected: ['Synthetic Robotics Lab', 'Assistant/help'], forbidden: ['Avi Synthetic', 'Benny Synthetic', 'Synthetic Parent'], backTarget: '/providers' },
  { id: 'provider-participant', title: 'Provider participant/member', url: '/provider-participant', audience: 'Provider participant', assistant: 'website', expectedSurface: 'one_time_member', expected: ['Mishnayos Membership', 'Helper', 'No BNA accountability'], forbidden: ['Avi Synthetic', 'Benny Synthetic', 'Synthetic Parent'], backTarget: '/rabbi-member' },
  { id: 'one-time-member', title: 'One Time member', url: '/rabbi-member', audience: 'One Time member', assistant: 'website', expectedSurface: 'one_time_member', expected: ['Home', 'Library', 'Classroom', 'Helper'], forbidden: ['Avi Synthetic', 'Benny Synthetic', 'Synthetic Parent'], backTarget: '/member-library' },
  { id: 'super-admin', title: 'Platform super-admin', url: '/operations', audience: 'Super admin', fixture: 'super-admin', assistant: 'operations-helper', expectedSurface: 'operations', expected: ['Operations', 'Ask'], workspaceSwitch: 'rabbi_sheller_provider' },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function escapeMd(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function json(body, status = 200) {
  return { status, contentType: 'application/json', body: JSON.stringify(body) };
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForReady(baseUrl, child) {
  const started = Date.now();
  let lastError = '';
  while (Date.now() - started < 30000) {
    if (child.exitCode !== null) throw new Error(`Local server exited before ready with code ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/`, { headers: { 'cache-control': 'no-cache' } });
      if (response.status === 200) return;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Local server did not become ready: ${lastError}`);
}

function parentFixture(kind) {
  const students = [
    {
      id: 101,
      name: 'Avi Synthetic',
      display_name: 'Avi Synthetic',
      student: { id: 101, name: 'Avi Synthetic', name_en: 'Avi Synthetic', display_name: 'Avi Synthetic', access_code: 'QA-STUDENT', grade: '5', status: 'active' },
      access_code: 'QA-STUDENT',
      grade: '5',
      status: 'active',
      torah: { class_trip_percentage: 72, public_trip_percentage: 68, daily_completion_percentage: 50, morning_goal_status: 'in_progress', history: [] },
      goals: [{ id: 501, title: 'Review Mishnah for 12 minutes', bucket: 'today', status: 'active', due_at: new Date(Date.now() + 86400000).toISOString(), agreement: { student_commitment: 'Practice after supper.' }, consequence: { success_duration_minutes: 20 } }],
      questions: [],
      assignments: [],
      notifications: [],
      weekly_private_meeting: { status: 'scheduled' },
      attendance_summary: { overall_percent: 92 },
    },
  ];
  if (kind === 'parent-multiple-children') {
    students.push({
      id: 102,
      name: 'Benny Synthetic',
      display_name: 'Benny Synthetic',
      student: { id: 102, name: 'Benny Synthetic', name_en: 'Benny Synthetic', display_name: 'Benny Synthetic', access_code: 'QA-STUDENT-2', grade: '4', status: 'active' },
      access_code: 'QA-STUDENT-2',
      grade: '4',
      status: 'active',
      torah: { class_trip_percentage: 61, public_trip_percentage: 55, daily_completion_percentage: 100, morning_goal_status: 'done', history: [] },
      goals: [],
      questions: [],
      assignments: [],
      notifications: [],
      weekly_private_meeting: { status: 'not_scheduled' },
      attendance_summary: { overall_percent: 88 },
    });
  }
  return {
    ok: true,
    parent: { id: 9001, name: 'Synthetic Parent', email: 'parent.qa@example.test', preferred_language: 'en', rabbi_contact: {} },
    household: { id: 4001, name: 'Synthetic Household' },
    students,
    messages: [],
    provider_questions: [],
    communications: [],
    upcoming: [],
    setup: { filter_setup_status: 'configured' },
  };
}

function studentFixture() {
  return {
    ok: true,
    student: { id: 101, name: 'Avi Synthetic', display_name: 'Avi Synthetic', access_code: 'QA-STUDENT', preferred_language: 'en' },
    torah: { class_trip_percentage: 72, public_trip_percentage: 68, daily_completion_percentage: 50, morning_goal_status: 'in_progress', history: [] },
    goals: [{ id: 501, title: 'Review Mishnah for 12 minutes', bucket: 'today', status: 'active', due_at: new Date(Date.now() + 86400000).toISOString(), agreement: { student_commitment: 'Practice after supper.' }, consequence: { success_duration_minutes: 20 } }],
    questions: [],
    assignments: [],
    ws11: { announcements: [] },
    calendar_events: [],
    weekly_private_meeting: { status: 'scheduled' },
    device_access: { status: 'available', status_label: 'Available after goal checkoff' },
    rabbi_contact: {},
  };
}

function providerFixture() {
  return {
    ok: true,
    provider: {
      id: 701,
      provider_name: 'Synthetic Robotics Lab',
      status: 'draft',
      provider_status: 'draft',
      entitlement_plan: 'free_listing',
      integration_status: 'no_access',
      commercial_model: 'free_listing',
      public_signup_enabled: false,
      plan: { label: 'Free listing', helper: 'Synthetic owner-review fixture. No live connector is used.' },
    },
    profile: { id: 801, public_name: 'Synthetic Robotics Lab', headline: 'Hands-on electronics for boys ages 10-13', bio: 'Synthetic provider profile for navigation QA.', status: 'draft' },
    services: [{ id: 901, title: 'Eight-week electronics class', status: 'draft', price_label: '$0 review fixture' }],
    one_time_class_media: [],
    entitlements: [],
    integrations: [],
    access_checklist: [],
    messages: [],
    media: [],
    comments: [],
    google_business: { status: 'not_configured', fallback: 'Synthetic fixture.' },
    upgrade: { configured: false },
    guardrails: { public_changes: 'Edits stay pending review until BNA approves them.' },
  };
}

function oneTimeClassroomFixture() {
  return {
    ok: true,
    member: { label: 'Synthetic One Time Member' },
    classroom: { title: 'One Time Classroom', calendar_items: [{ id: 1, title: 'Sunday class', starts_at: new Date().toISOString() }], threads: [], leaderboard: [] },
    media: [],
    announcements: [],
  };
}

function memberLibraryFixture() {
  return {
    ok: true,
    member_library: {
      access: { member_label: 'Synthetic One Time Member', tier: 'video_library' },
      items: [{ id: 'lesson-1', title: 'Mishnah Review Recording', type: 'recording', status: 'available', description: 'Synthetic recording fixture.', tags: ['mishnah'] }],
    },
    classroom: { calendar_items: [{ id: 1, title: 'Sunday class' }], threads: [], leaderboard: [] },
  };
}

function apiResponse(pathname, fixture) {
  if (fixture === 'api-failure') return json({ ok: false, error: 'Synthetic API failure for owner-review QA.' }, 503);
  if (pathname === '/api/parent-portal' || pathname === '/api/parent-portal/session') return json(parentFixture(fixture));
  if (pathname === '/api/parent-portal/login' || pathname === '/api/parent-portal/help' || pathname === '/api/parent/assistant' || pathname.startsWith('/api/parent-portal/students/')) {
    return json({ ok: true, success: true, message: 'Synthetic parent action accepted without external side effect.', data: parentFixture(fixture) });
  }
  if (pathname === '/api/student-portal' || pathname === '/api/student-portal/session') return json(studentFixture());
  if (pathname.startsWith('/api/student-portal/')) return json({ ok: true, success: true, message: 'Synthetic student action accepted without external side effect.', data: studentFixture() });
  if (pathname === '/api/provider-portal/session' || pathname === '/api/provider-portal/profile' || pathname === '/api/provider-portal/services') return json(providerFixture());
  if (pathname.startsWith('/api/provider-portal/') || pathname.startsWith('/api/providers/')) return json({ ok: true, success: true, message: 'Synthetic provider action accepted without external side effect.', data: providerFixture() });
  if (pathname === '/api/member-library') return json(memberLibraryFixture());
  if (pathname === '/api/one-time-classroom') return json(oneTimeClassroomFixture());
  if (pathname.startsWith('/api/one-time-classroom/')) return json({ ok: true, success: true, message: 'Synthetic classroom action accepted without external side effect.' });
  if (pathname.endsWith('/student') && pathname.startsWith('/api/one-time-review/')) return json(studentFixture());
  if (pathname.endsWith('/parent') && pathname.startsWith('/api/one-time-review/')) return json(parentFixture('parent-one-child'));
  if (pathname.endsWith('/provider') && pathname.startsWith('/api/one-time-review/')) return json(providerFixture());
  if (pathname.endsWith('/classroom') && pathname.startsWith('/api/one-time-review/')) return json(oneTimeClassroomFixture());
  if (pathname === '/api/bna/auth/me') {
    return json({
      ok: true,
      authenticated: true,
      user: { id: 'qa-super-admin', name: 'Synthetic Super Admin', email: 'superadmin.qa@example.test', role: 'super_admin', workspace_id: 'platform' },
      allowedViews: ['dashboard', 'tasks', 'decisions', 'students', 'providers', 'communications', 'assistant-control-center', 'system'],
    });
  }
  if (pathname.startsWith('/api/bna/assistant') || pathname.startsWith('/api/bna/helper')) {
    return json({
      ok: true,
      success: true,
      thread: { id: 'qa-thread', title: 'Owner-review synthetic thread' },
      thread_id: 'qa-thread',
      messages: [{ id: 'qa-message', author_type: 'assistant', body: 'Synthetic owner-review assistant response. No external action was executed.' }],
      plan: { summary: 'Synthetic helper plan.', actions: [], approvals: [] },
    });
  }
  if (pathname.startsWith('/api/bna/')) return json({ ok: true, success: true, items: [], rows: [], tasks: [], decisions: [], reminders: [], tickets: [], previews: [], campaigns: [], automations: [], notifications: [], audit_events: [], counts: {}, stats: {} });
  if (pathname.startsWith('/api/')) return json({ ok: true, success: true, items: [], rows: [] });
  return null;
}

async function installMocks(context, fixture) {
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/operations' && fixture === 'super-admin') {
      const html = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
      await route.fulfill({ status: 200, contentType: 'text/html', body: html });
      return;
    }
    if (url.pathname === '/data/learning-moments.json') {
      await route.fulfill(json({ items: [] }));
      return;
    }
    const response = apiResponse(url.pathname, fixture);
    if (response) {
      await route.fulfill(response);
      return;
    }
    await route.continue();
  });
}

function ignoreConsoleError(text) {
  const value = String(text || '');
  return value.includes('favicon') || value.includes('Failed to load resource: the server responded with a status of 404');
}

async function bodyText(page) {
  return await page.locator('body').innerText({ timeout: 8000 });
}

async function checkOverflow(page) {
  return await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
}

async function brokenVisibleImages(page) {
  return await page.evaluate(() => Array.from(document.images)
    .filter((img) => {
      const rect = img.getBoundingClientRect();
      const style = getComputedStyle(img);
      const inViewport = rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
      return inViewport && rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && (!img.complete || img.naturalWidth === 0);
    })
    .map((img) => img.currentSrc || img.src || img.alt || 'unknown image'));
}

async function smallMobileTargets(page) {
  return await page.evaluate(() => Array.from(document.querySelectorAll('a[href], button:not([disabled]), input, select, textarea'))
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return { label: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('name') || el.id || el.tagName).trim().slice(0, 80), width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' };
    })
    .filter((item) => item.visible && item.width < 28 && item.height < 28)
    .slice(0, 20));
}

async function internalLinkStatus(page, baseUrl) {
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('header a[href], nav a[href], .topbar a[href], .portal-topbar a[href]'))
    .map((anchor) => anchor.getAttribute('href'))
    .filter(Boolean)
    .filter((href) => !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))
    .slice(0, 12));
  const results = [];
  for (const href of [...new Set(links)]) {
    const target = new URL(href, baseUrl);
    if (target.origin !== baseUrl) continue;
    const response = await fetch(target.href, { redirect: 'manual' }).catch((error) => ({ status: 0, statusText: error.message }));
    results.push({ href, status: response.status, ok: [200, 301, 302, 307, 308, 401, 403].includes(response.status) });
  }
  return results;
}

async function openAssistant(page, kind) {
  if (kind === 'operations-helper') {
    const opener = page.locator('[data-bna-helper-open]:visible').first();
    await opener.waitFor({ timeout: 15000 });
    await opener.click();
    await page.waitForTimeout(300);
    return { opened: true, kind: 'operations-helper', surface: 'operations' };
  }
  const opener = page.locator('[data-bna-assistant-open], .bna-bot-launcher').first();
  await opener.waitFor({ timeout: 12000 });
  await opener.click();
  await page.locator('#bnaBotPanel, .bna-bot-panel').first().waitFor({ timeout: 8000 });
  const surface = await page.evaluate(() => window.BNAAssistant?.surface || document.body?.dataset?.assistantSurface || 'unknown').catch(() => 'unknown');
  return { opened: true, kind: 'website-assistant', surface };
}

async function switchOperationsWorkspace(page, workspaceId) {
  if (!workspaceId) return { tested: false };
  const result = {
    tested: true,
    target_workspace: workspaceId,
    url_before: page.url(),
    url_after: '',
    active_workspace: '',
    ok: false,
  };
  try {
    const menu = page.locator('.workspace-menu').first();
    if (await menu.count()) {
      const summary = menu.locator('summary').first();
      if (!(await summary.isVisible().catch(() => false))) {
        const drawerButton = page.locator('.menu-button').first();
        if (await drawerButton.isVisible().catch(() => false)) {
          await drawerButton.click();
          await page.locator('.ops-app-shell.drawer-open .ops-sidebar').first().waitFor({ timeout: 5000 });
        }
      }
      const open = await menu.evaluate((node) => node.hasAttribute('open')).catch(() => false);
      if (!open) await summary.click({ timeout: 5000 });
    }
    const option = page.locator(`[data-workspace-option][onclick*="${workspaceId}"], [data-action-id="ACTION-ONETIME-WORKSPACE-VIEW"]`).first();
    await option.waitFor({ timeout: 8000 });
    await option.click();
    await page.waitForTimeout(500);
    result.url_after = page.url();
    result.active_workspace = await page.evaluate(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get('workspace')
        || window.currentWorkspaceKey?.()
        || document.querySelector('[data-workspace-option][aria-current="true"]')?.getAttribute('onclick')?.match(/switchWorkspace\('([^']+)'/)?.[1]
        || '';
    }).catch(() => '');
    const text = await bodyText(page);
    result.ok = result.active_workspace === workspaceId
      || new URL(result.url_after).searchParams.get('workspace') === workspaceId
      || /One Time Mishnah Class/.test(text);
  } catch (error) {
    result.error = error.message;
    result.url_after = page.url();
  }
  return result;
}

async function backNavigation(page, baseUrl, journey) {
  if (!journey.backTarget) return { tested: false };
  const expectedPath = new URL(journey.url, baseUrl).pathname;
  try {
    await page.goto(new URL(journey.backTarget, baseUrl).href, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const actualPath = new URL(page.url()).pathname;
    return { tested: true, expected_path: expectedPath, actual_path: actualPath, ok: actualPath === expectedPath };
  } catch (error) {
    return { tested: true, expected_path: expectedPath, actual_path: new URL(page.url()).pathname, ok: false, error: error.message };
  }
}

async function runJourney(browser, baseUrl, viewport, journey) {
  const context = await browser.newContext({ viewport: viewport.size, isMobile: viewport.mobile, hasTouch: viewport.mobile });
  await installMocks(context, journey.fixture || journey.id);
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !ignoreConsoleError(message.text())) consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText || 'failed';
    const url = request.url();
    if (url.includes('favicon') || failure === 'net::ERR_ABORTED' || url.startsWith('https://fonts.gstatic.com/')) return;
    failedRequests.push(`${failure} ${url}`);
  });

  const started = Date.now();
  await page.goto(new URL(journey.url, baseUrl).href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const text = await bodyText(page);
  const missing = journey.expected.filter((expected) => !text.includes(expected));
  assert(missing.length === 0, `${journey.id} missing expected text: ${missing.join(', ')}`);
  const leaked = (journey.forbidden || []).filter((forbidden) => text.includes(forbidden));
  assert(leaked.length === 0, `${journey.id} leaked forbidden fixture text: ${leaked.join(', ')}`);
  if (journey.expectedLinks?.length) {
    const missingLinks = [];
    for (const href of journey.expectedLinks) {
      const count = await page.locator(`a[href="${href}"]`).count();
      if (!count) missingLinks.push(href);
    }
    assert(missingLinks.length === 0, `${journey.id} missing expected links: ${missingLinks.join(', ')}`);
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const workspaceSwitch = await switchOperationsWorkspace(page, journey.workspaceSwitch);
  const assistant = await openAssistant(page, journey.assistant);
  if (journey.expectedSurface) {
    assert(assistant.surface === journey.expectedSurface, `${journey.id} assistant surface expected ${journey.expectedSurface}, got ${assistant.surface}`);
  }
  const screenshot = path.join(outDir, `${viewport.id}-${journey.id}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  const result = {
    role_id: journey.id,
    title: journey.title,
    audience: journey.audience,
    viewport: viewport.id,
    url: journey.url,
    status: 'passed',
    duration_ms: Date.now() - started,
    screenshot: rel(screenshot),
    assistant,
    workspace_switch: workspaceSwitch,
    direct_deep_link_loaded: true,
    refresh_ok: true,
    back_navigation: await backNavigation(page, baseUrl, journey),
    horizontal_overflow_px: await checkOverflow(page),
    broken_visible_images: await brokenVisibleImages(page),
    small_mobile_targets: viewport.mobile ? await smallMobileTargets(page) : [],
    internal_link_statuses: await internalLinkStatus(page, baseUrl),
    console_errors: consoleErrors,
    failed_requests: failedRequests,
  };
  await context.close();
  return result;
}

async function runLoggedOutAndWrongRole(browser, baseUrl, viewport) {
  const context = await browser.newContext({ viewport: viewport.size, isMobile: viewport.mobile, hasTouch: viewport.mobile });
  const page = await context.newPage();
  const checks = [];
  for (const url of ['/operations', '/parent/login', '/student/login', '/provider/login']) {
    await page.goto(new URL(url, baseUrl).href, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    const text = await bodyText(page);
    checks.push({ url, final_url: page.url().replace(baseUrl, ''), has_login_or_recovery: /login|access code|password|request|portal/i.test(text) });
  }
  const screenshot = path.join(outDir, `${viewport.id}-wrong-role-logged-out.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await context.close();
  return { role_id: 'wrong-role-logged-out', title: 'Wrong-role and logged-out access', audience: 'Logged-out or wrong role', viewport: viewport.id, status: checks.every((check) => check.has_login_or_recovery) ? 'passed' : 'failed', screenshot: rel(screenshot), checks };
}

async function runApiFailureState(browser, baseUrl, viewport) {
  const context = await browser.newContext({ viewport: viewport.size, isMobile: viewport.mobile, hasTouch: viewport.mobile });
  await installMocks(context, 'api-failure');
  const page = await context.newPage();
  await page.goto(new URL('/parent', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const text = await bodyText(page);
  const screenshot = path.join(outDir, `${viewport.id}-api-failure-state.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await context.close();
  return { role_id: 'api-failure-state', title: 'Synthetic API failure state', audience: 'All authenticated surfaces', viewport: viewport.id, status: /could not|error|login|access/i.test(text) ? 'passed' : 'needs_review', screenshot: rel(screenshot), observed_text_excerpt: text.slice(0, 500) };
}

function summarize(report) {
  const all = [...report.role_runs, ...report.access_runs, ...report.failure_runs];
  const failed = all.filter((item) => item.status !== 'passed');
  const consoleErrors = report.role_runs.flatMap((item) => item.console_errors.map((error) => ({ role_id: item.role_id, viewport: item.viewport, error })));
  const failedRequests = report.role_runs.flatMap((item) => item.failed_requests.map((error) => ({ role_id: item.role_id, viewport: item.viewport, error })));
  const brokenImages = report.role_runs.flatMap((item) => item.broken_visible_images.map((image) => ({ role_id: item.role_id, viewport: item.viewport, image })));
  const linkFailures = report.role_runs.flatMap((item) => item.internal_link_statuses.filter((link) => !link.ok).map((link) => ({ role_id: item.role_id, viewport: item.viewport, ...link })));
  const overflow = report.role_runs.filter((item) => item.horizontal_overflow_px > 12);
  const smallTargets = report.role_runs.flatMap((item) => item.small_mobile_targets.map((target) => ({ role_id: item.role_id, viewport: item.viewport, ...target })));
  const workspaceSwitchFailures = report.role_runs
    .filter((item) => item.workspace_switch?.tested && !item.workspace_switch?.ok)
    .map((item) => ({ role_id: item.role_id, viewport: item.viewport, workspace_switch: item.workspace_switch }));
  return { ok: failed.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0 && brokenImages.length === 0 && linkFailures.length === 0 && overflow.length === 0 && workspaceSwitchFailures.length === 0, failed, consoleErrors, failedRequests, brokenImages, linkFailures, overflow, smallTargets, workspaceSwitchFailures };
}

function writeReports(report) {
  ensureDir(outDir);
  ensureDir(docsDir);
  report.summary = {
    failed: [],
    consoleErrors: [],
    failedRequests: [],
    brokenImages: [],
    linkFailures: [],
    overflow: [],
    smallTargets: [],
    ok: false,
    ...report.summary,
  };
  const jsonPath = path.join(outDir, 'report.json');
  const mdPath = path.join(outDir, 'report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const primaryRows = report.role_runs.map((run) => [run.title, run.audience, run.viewport, run.status, run.assistant?.kind || 'n/a', run.assistant?.surface || 'n/a', run.direct_deep_link_loaded ? 'yes' : 'no', run.refresh_ok ? 'yes' : 'no', run.back_navigation?.tested ? (run.back_navigation.ok ? 'yes' : 'no') : 'n/a', run.workspace_switch?.tested ? (run.workspace_switch.ok ? run.workspace_switch.target_workspace : 'failed') : 'n/a', run.horizontal_overflow_px ?? 'n/a', (run.broken_visible_images || []).length, (run.console_errors || []).length, run.screenshot || run.error || 'n/a']);
  const accessRows = report.access_runs.map((run) => [run.title, run.viewport, run.status, (run.checks || []).map((check) => `${check.url} -> ${check.final_url}`).join('; ') || run.error || 'n/a', run.screenshot || 'n/a']);
  const failureRows = report.failure_runs.map((run) => [run.title, run.viewport, run.status, run.screenshot || run.error || 'n/a']);
  const screenshotLines = [...report.role_runs, ...report.access_runs, ...report.failure_runs].map((run) => `- ${run.viewport} / ${run.title}: ${run.screenshot}`);
  const docLines = [
    '# Role Flow QA',
    '',
    `Generated: ${report.started_at}`,
    `Release candidate SHA: ${report.release_candidate_sha}`,
    `Local base URL: ${report.base_url}`,
    `Result: ${report.summary.ok ? 'PASS' : 'NEEDS REVIEW'}`,
    '',
    'Guardrail: this run used a local server plus Playwright route mocks for `/api/*`. It did not use external credentials, read production state, mutate a production database, deploy, send email or Telegram messages, publish, upload, charge, alter DNS, or request secret values.',
    '',
    '## Primary Role Journeys',
    '',
    '| Journey | Audience | Viewport | Status | Assistant | Surface | Deep link | Refresh | Back nav | Workspace switch | Overflow px | Broken images | Console errors | Screenshot |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |',
    ...primaryRows.map((row) => `| ${row.map(escapeMd).join(' | ')} |`),
    '',
    '## Logged-Out And Wrong-Role Access',
    '',
    '| Journey | Viewport | Status | Checked destinations | Screenshot |',
    '| --- | --- | --- | --- | --- |',
    ...accessRows.map((row) => `| ${row.map(escapeMd).join(' | ')} |`),
    '',
    '## Failure State',
    '',
    '| Journey | Viewport | Status | Screenshot |',
    '| --- | --- | --- | --- |',
    ...failureRows.map((row) => `| ${row.map(escapeMd).join(' | ')} |`),
    '',
    '## Screenshots',
    '',
    ...screenshotLines,
    '',
    '## Remaining QA Notes',
    '',
    report.summary.smallTargets.length ? `- Mobile tap-target review found ${report.summary.smallTargets.length} small visible controls. These are recorded in the JSON report for targeted polish, but they did not block this credential-free owner-review run.` : '- No small mobile tap targets were detected in the checked primary role surfaces.',
    report.summary.consoleErrors.length ? `- Console errors require review: ${report.summary.consoleErrors.length}.` : '- No browser console errors were detected outside the favicon/404 allowlist.',
    report.summary.failedRequests.length ? `- Failed network requests require review: ${report.summary.failedRequests.length}.` : '- No failed browser requests were detected outside the favicon allowlist.',
    report.summary.linkFailures.length ? `- Internal header/navigation link failures require review: ${report.summary.linkFailures.length}.` : '- Header/navigation internal links returned expected local statuses.',
    report.summary.brokenImages.length ? `- Broken visible images require review: ${report.summary.brokenImages.length}.` : '- No broken visible images were detected on the checked surfaces.',
    report.summary.workspaceSwitchFailures.length ? `- Workspace switching requires review: ${report.summary.workspaceSwitchFailures.length}.` : '- Super-admin workspace switching into the One Time provider workspace passed where applicable.',
    '',
  ];
  fs.writeFileSync(mdPath, docLines.join('\n'));
  fs.writeFileSync(roleFlowDoc, docLines.join('\n'));
  return { json: rel(jsonPath), markdown: rel(mdPath), role_flow_doc: rel(roleFlowDoc) };
}

async function gitHead() {
  return await new Promise((resolve) => {
    const child = spawn('git', ['rev-parse', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += String(chunk); });
    child.on('close', () => resolve(output.trim() || 'unknown'));
  });
}

async function main() {
  ensureDir(outDir);
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ONE_TIME_REVIEW_ONLY_NO_DB: '1', DATABASE_URL: '', BNA_OWNER_REVIEW_QA: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr.on('data', (chunk) => logs.push(String(chunk)));
  const report = {
    started_at: new Date().toISOString(),
    base_url: baseUrl,
    release_candidate_sha: (process.env.GITHUB_SHA || '').trim() || await gitHead(),
    guardrails: { external_credentials: false, production_state_readback: false, production_database_mutation: false, deploy: false, external_send_publish_upload_charge_dns: false },
    role_runs: [],
    access_runs: [],
    failure_runs: [],
    summary: {},
    server_log_tail: [],
  };

  let browser;
  try {
    await waitForReady(baseUrl, child);
    browser = await chromium.launch({ headless: true });
    for (const viewport of viewports) {
      for (const journey of journeys) {
        try {
          report.role_runs.push(await runJourney(browser, baseUrl, viewport, journey));
        } catch (error) {
          report.role_runs.push({
            role_id: journey.id,
            title: journey.title,
            audience: journey.audience,
            viewport: viewport.id,
            url: journey.url,
            status: 'failed',
            error: error.message,
            direct_deep_link_loaded: false,
            refresh_ok: false,
            broken_visible_images: [],
            small_mobile_targets: [],
            internal_link_statuses: [],
            console_errors: [],
            failed_requests: [],
          });
        }
      }
      try {
        report.access_runs.push(await runLoggedOutAndWrongRole(browser, baseUrl, viewport));
      } catch (error) {
        report.access_runs.push({ role_id: 'wrong-role-logged-out', title: 'Wrong-role and logged-out access', audience: 'Logged-out or wrong role', viewport: viewport.id, status: 'failed', error: error.message, checks: [] });
      }
      try {
        report.failure_runs.push(await runApiFailureState(browser, baseUrl, viewport));
      } catch (error) {
        report.failure_runs.push({ role_id: 'api-failure-state', title: 'Synthetic API failure state', audience: 'All authenticated surfaces', viewport: viewport.id, status: 'failed', error: error.message });
      }
    }
    report.summary = summarize(report);
  } finally {
    if (browser) await browser.close();
    child.kill();
    report.server_log_tail = logs.join('').split(/\r?\n/).filter(Boolean).slice(-30);
    report.paths = writeReports(report);
  }

  if (!report.summary.ok) {
    console.error(`Owner-review role flow smoke needs review. Reports: ${report.paths.role_flow_doc} ${report.paths.json}`);
    console.error(JSON.stringify(report.summary, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`Owner-review role flow smoke passed. Reports: ${report.paths.role_flow_doc} ${report.paths.json}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
