#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date().toISOString().slice(0, 10);
const auditSlug = `${today}-full-app-ui-audit`;
const outputRoot = path.join(repoRoot, 'ops', 'ui-audits', auditSlug);
const screenshotsRoot = path.join(outputRoot, 'screenshots');

const env = {
  ...process.env,
  ...readEnvFile(path.join(repoRoot, '.env.local')),
};

const BASE_URL = (env.UI_AUDIT_BASE_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
const OPS_USERNAME = env.OPS_USERNAME || '';
const OPS_PASSWORD = env.OPS_PASSWORD || '';

const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 1000 },
  { id: 'mobile', width: 390, height: 900 },
];

const WORKSPACES = [
  { id: 'platform', label: 'Platform / Super Admin' },
  { id: 'bna', label: 'BNA School Workspace' },
  { id: 'rabbi_sheller_provider', label: 'Rabbi Sheller Provider Workspace' },
];

const OPERATION_SECTIONS = {
  dashboard: ['overview', 'activity', 'alerts', 'today', 'updates'],
  pipelines: ['overview', 'bna_enrollment', 'provider_class', 'provider_onboarding', 'participants', 'stale_tasks', 'decisions'],
  tasks: ['overview', 'decisions', 'mine', 'schedule', 'research', 'changelog', 'done'],
  students: ['overview', 'list', 'group_goal', 'goal_board', 'assignments', 'questions', 'documents', 'portal_links', 'tablet_access', 'profile', 'parent_family', 'analysis', 'meetings', 'bot_settings', 'activity', 'next_year_login'],
  contacts: ['overview', 'interested_parents', 'parents', 'people', 'contacts', 'notes', 'students', 'intake', 'follow_up', 'tags'],
  content: ['library', 'meetings', 'research', 'selected', 'repurpose', 'newsletter', 'prompts', 'bundles'],
  calendar: ['overview', 'week', 'month', 'classes', 'students', 'provider', 'google_sync', 'settings'],
  service_providers: ['overview', 'directory', 'workspaces', 'commercial', 'plans', 'onboarding', 'access_checklist', 'integration_audit', 'communities', 'content', 'marketing', 'leads', 'communications', 'settings'],
  communications: ['overview', 'parents', 'students', 'providers', 'internal', 'whatsapp', 'email', 'bots', 'templates', 'settings'],
  internal_dialogue: ['overview', 'shloimie_rabbi', 'meeting_notes', 'uploads', 'decisions', 'support', 'activity'],
  accounting: ['overview', 'payments', 'open', 'paid', 'needs_signup', 'exceptions'],
  api_usage: ['overview', 'workspace', 'parent', 'student', 'provider', 'bot', 'errors', 'budgets', 'settings'],
  admin: ['overview', 'users', 'roles', 'workspaces', 'invitations', 'tickets', 'messages', 'settings'],
  settings: ['profile', 'workspace', 'branding', 'language', 'users_roles', 'email_identities', 'whatsapp', 'social_accounts', 'calendar', 'google_classroom', 'parent_portal', 'student_portal', 'provider_portal', 'provider_index', 'provider_plans', 'provider_entitlements', 'provider_onboarding', 'commercial_models', 'bot_permissions', 'api_limits', 'communications', 'integrations', 'payment_links', 'external_apps', 'billing', 'automations', 'danger'],
};

const PUBLIC_TARGETS = [
  { id: 'public-home', label: 'Public Site Home', path: '/', group: 'Public Website' },
  { id: 'public-home-he', label: 'Public Site Home Hebrew Route', path: '/he', group: 'Public Website' },
  { id: 'public-blog', label: 'Blog', path: '/blog', group: 'Public Website' },
  { id: 'public-blog-he', label: 'Blog Hebrew Route', path: '/he/blog', group: 'Public Website' },
  { id: 'public-faq', label: 'FAQ', path: '/faq', group: 'Public Website' },
  { id: 'public-faq-he', label: 'FAQ Hebrew Route', path: '/he/faq', group: 'Public Website' },
  { id: 'public-signup', label: 'Signup English', path: '/signup.html', group: 'Public Website' },
  { id: 'public-signup-he', label: 'Signup Hebrew', path: '/signup-he.html', group: 'Public Website' },
  { id: 'public-signup-thank-you', label: 'Signup Thank You', path: '/signup-thank-you.html', group: 'Public Website' },
  { id: 'public-parent-handbook', label: 'Parent Handbook', path: '/documents/parent-handbook.html', group: 'Public Website' },
  { id: 'operations-login', label: 'Operations Login', path: '/operations-login.html', group: 'Auth / Login' },
  { id: 'parent-login', label: 'Parent Portal Login', path: '/parent', group: 'Parent Portal' },
  { id: 'student-login', label: 'Student Workspace Login', path: '/student', group: 'Student Workspace' },
  { id: 'provider-login', label: 'Provider Portal Login', path: '/provider', group: 'Provider Portal' },
  { id: 'provider-join', label: 'Provider Join / Onboarding', path: '/providers/join', group: 'Provider Onboarding' },
];

const EXTRA_STATES = [
  {
    id: 'parent-login-hebrew',
    label: 'Parent Portal Login - Hebrew',
    group: 'Parent Portal',
    path: '/parent',
    run: async (page) => {
      await clickIfPresent(page, '[data-language="he"]');
    },
  },
  {
    id: 'parent-password-reset',
    label: 'Parent Portal Password Reset Request',
    group: 'Parent Portal',
    path: '/parent',
    run: async (page) => {
      await clickIfPresent(page, '#showResetButton');
    },
  },
  {
    id: 'student-login-hebrew',
    label: 'Student Workspace Login - Hebrew',
    group: 'Student Workspace',
    path: '/student',
    run: async (page) => {
      await clickIfPresent(page, '#langHeButton');
    },
  },
  {
    id: 'provider-join-filled-draft',
    label: 'Provider Join Form Filled Draft',
    group: 'Provider Onboarding',
    path: '/providers/join',
    run: async (page) => {
      await fillIfPresent(page, 'input[name="provider_name"]', 'Example Provider');
      await fillIfPresent(page, 'input[name="contact_name"]', 'Demo Contact');
      await fillIfPresent(page, 'input[name="email"]', 'demo-provider@example.com');
      await fillIfPresent(page, 'input[name="phone"]', '+1 555 0100');
      await fillIfPresent(page, 'input[name="category"]', 'Torah Classes');
      await fillIfPresent(page, 'input[name="location"]', 'Online');
      await fillIfPresent(page, 'textarea[name="program_description"]', 'Demo screenshot only. Not submitted.');
    },
  },
];

const reportRows = [];
const errors = [];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  fs.mkdirSync(screenshotsRoot, { recursive: true });
  for (const viewport of VIEWPORTS) {
    fs.mkdirSync(path.join(screenshotsRoot, viewport.id), { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of VIEWPORTS) {
      const publicContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });
      await auditPublicTargets(publicContext, viewport);
      await publicContext.close();

      const opsHeaders = authorizationHeaders();
      const opsContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        extraHTTPHeaders: opsHeaders,
      });
      await auditOperationsTargets(opsContext, viewport);
      await opsContext.close();
    }
  } finally {
    await browser.close();
  }

  writeManifest();
  writeReports();
  writeReadme();
  console.log(JSON.stringify({
    outputRoot,
    screenshots: reportRows.length,
    errors: errors.length,
  }, null, 2));
}

async function auditPublicTargets(context, viewport) {
  const page = await context.newPage();
  try {
    for (const target of PUBLIC_TARGETS) {
      await captureTarget(page, viewport, target);
    }
    for (const target of EXTRA_STATES) {
      await captureTarget(page, viewport, target);
    }
  } finally {
    await page.close();
  }
}

async function auditOperationsTargets(context, viewport) {
  const page = await context.newPage();
  page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));
  try {
    if (!OPS_USERNAME || !OPS_PASSWORD) {
      errors.push({ target: 'operations', error: 'Missing OPS_USERNAME or OPS_PASSWORD; Operations screenshots limited to login page.' });
      return;
    }

    for (const workspace of WORKSPACES) {
      for (const [view, sections] of Object.entries(OPERATION_SECTIONS)) {
        for (const section of sections) {
          await captureTarget(page, viewport, {
            id: `operations-${workspace.id}-${view}-${section}`,
            label: `Operations / ${workspace.label} / ${labelize(view)} / ${labelize(section)}`,
            group: 'Operations',
            path: `/operations?workspace=${encodeURIComponent(workspace.id)}&view=${encodeURIComponent(view)}&section=${encodeURIComponent(section)}`,
            workspace: workspace.id,
            view,
            section,
            authenticated: true,
            operations: true,
          });
        }
      }

      if (viewport.id === 'mobile') {
        await captureTarget(page, viewport, {
          id: `operations-${workspace.id}-mobile-drawer-open`,
          label: `Operations / ${workspace.label} / Mobile Navigation Drawer Open`,
          group: 'Operations Chrome',
          path: `/operations?workspace=${encodeURIComponent(workspace.id)}&view=dashboard&section=overview`,
          workspace: workspace.id,
          view: 'dashboard',
          section: 'mobile_drawer',
          authenticated: true,
          operations: true,
          run: async (currentPage) => {
            await clickIfPresent(currentPage, '.menu-button');
          },
        });
      }
    }
  } finally {
    await page.close();
  }
}

async function captureTarget(page, viewport, target) {
  const url = `${BASE_URL}${target.path}`;
  const fileBase = safeFileName(`${target.id}`);
  const screenshotRel = path.join('screenshots', viewport.id, `${fileBase}.jpg`).replace(/\\/g, '/');
  const screenshotAbs = path.join(outputRoot, screenshotRel);
  const startedAt = Date.now();
  let loadStatus = 'ok';
  let pageInfo = {};
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await settlePage(page, target);
    if (typeof target.run === 'function') {
      await target.run(page);
      await page.waitForTimeout(350);
    }
    pageInfo = await collectPageInfo(page);
    await page.screenshot({
      path: screenshotAbs,
      fullPage: true,
      type: 'jpeg',
      quality: 72,
      animations: 'disabled',
    });
  } catch (error) {
    loadStatus = 'error';
    errors.push({ target: target.id, viewport: viewport.id, url, error: error.message });
    pageInfo = { title: '', url, buttons: [], links: [], issues: [`Capture failed: ${error.message}`] };
  }

  const evaluation = evaluateUi({
    target,
    viewport,
    pageInfo,
    status: loadStatus,
    durationMs: Date.now() - startedAt,
  });

  reportRows.push({
    id: target.id,
    label: target.label,
    group: target.group,
    viewport: viewport.id,
    width: viewport.width,
    height: viewport.height,
    url,
    finalUrl: pageInfo.url || url,
    screenshot: screenshotRel,
    status: loadStatus,
    durationMs: Date.now() - startedAt,
    workspace: target.workspace || '',
    view: target.view || '',
    section: target.section || '',
    rating: evaluation.rating,
    ratingLabel: evaluation.ratingLabel,
    issues: evaluation.issues,
    nextSteps: evaluation.nextSteps,
    visibleButtonCount: pageInfo.buttons?.length || 0,
    visibleLinkCount: pageInfo.links?.length || 0,
    disabledButtonCount: (pageInfo.buttons || []).filter((button) => button.disabled).length,
    actionInventory: pageInfo.buttons || [],
    linkInventory: pageInfo.links || [],
    metrics: pageInfo.metrics || {},
  });
}

async function settlePage(page, target) {
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  if (target.operations) {
    await page.waitForFunction(() => {
      const app = document.querySelector('#app');
      return Boolean(app && !/Loading BNA Operations/i.test(app.textContent || ''));
    }, null, { timeout: 18000 }).catch(() => {});
    await page.waitForTimeout(850);
    return;
  }
  await page.waitForTimeout(650);
}

async function collectPageInfo(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const text = (el) => (el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], a.button-link, a.btn'))
      .filter(visible)
      .slice(0, 180)
      .map((el) => ({
        label: text(el) || el.getAttribute('aria-label') || el.getAttribute('value') || el.id || el.className || el.tagName,
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        disabled: Boolean(el.disabled || el.getAttribute('aria-disabled') === 'true'),
        href: el.getAttribute('href') || '',
        onclick: el.getAttribute('onclick') || '',
        classes: String(el.className || '').slice(0, 120),
      }));
    const links = Array.from(document.querySelectorAll('a[href]'))
      .filter(visible)
      .slice(0, 180)
      .map((el) => ({
        label: text(el) || el.getAttribute('aria-label') || el.getAttribute('href'),
        href: el.getAttribute('href'),
        target: el.getAttribute('target') || '',
        classes: String(el.className || '').slice(0, 120),
      }));
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
      .filter(visible)
      .slice(0, 20)
      .map((el) => ({ level: el.tagName.toLowerCase(), text: text(el) }));
    const rects = Array.from(document.querySelectorAll('body *'))
      .filter(visible)
      .slice(0, 1200)
      .map((el) => el.getBoundingClientRect());
    const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 3;
    const maxRight = rects.reduce((max, rect) => Math.max(max, rect.right), 0);
    const tinyTapTargets = Array.from(document.querySelectorAll('button, a[href], input, select, textarea'))
      .filter(visible)
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 34 || rect.height < 34);
      }).length;
    const bodyText = document.body.innerText || '';
    return {
      title: document.title || '',
      url: window.location.href,
      headings,
      buttons,
      links,
      metrics: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow,
        maxRight: Math.round(maxRight),
        buttonCount: buttons.length,
        linkCount: links.length,
        formCount: document.querySelectorAll('form').length,
        cardLikeCount: document.querySelectorAll('[class*="card"], [class*="panel"], article, .focus-panel').length,
        disabledButtonCount: buttons.filter((button) => button.disabled).length,
        tinyTapTargets,
        todoMentions: (bodyText.match(/\b(TODO|placeholder|not configured|not enabled|disabled until|requires .* endpoint|missing)\b/gi) || []).length,
        bodyTextLength: bodyText.length,
      },
    };
  });
}

function evaluateUi({ target, viewport, pageInfo, status, durationMs }) {
  const metrics = pageInfo.metrics || {};
  const issues = [];
  const nextSteps = [];
  let rating = 9.2;

  if (status !== 'ok') {
    rating = 2;
    issues.push('Page did not complete capture successfully.');
    nextSteps.push('Fix route load errors before design polish.');
  }

  if (metrics.horizontalOverflow) {
    rating -= viewport.id === 'mobile' ? 2.2 : 1.4;
    issues.push('Horizontal overflow detected.');
    nextSteps.push('Constrain grids, tables, nav labels, and card content to prevent sideways scrolling.');
  }

  if (viewport.id === 'mobile' && metrics.scrollHeight > 9000) {
    rating -= 0.8;
    issues.push('Mobile page is very tall and likely hard to scan.');
    nextSteps.push('Collapse secondary detail, move filters/actions into drawers, and reduce repeated cards.');
  } else if (viewport.id === 'desktop' && metrics.scrollHeight > 7000) {
    rating -= 0.5;
    issues.push('Desktop page is long enough to hide actions and context.');
    nextSteps.push('Use denser tables, sticky section summaries, and detail drawers instead of long inline stacks.');
  }

  if (metrics.buttonCount > (viewport.id === 'mobile' ? 34 : 55)) {
    rating -= viewport.id === 'mobile' ? 1.1 : 0.7;
    issues.push(`High visible action count (${metrics.buttonCount}) increases decision load.`);
    nextSteps.push('Consolidate secondary actions into menus and keep only the page primary action prominent.');
  }

  if (metrics.cardLikeCount > (viewport.id === 'mobile' ? 36 : 58)) {
    rating -= 0.6;
    issues.push(`High card/panel count (${metrics.cardLikeCount}) can make the UI feel busy.`);
    nextSteps.push('Replace repeated cards with compact lists/tables and reserve cards for real detail surfaces.');
  }

  if (metrics.todoMentions > 6) {
    rating -= 0.9;
    issues.push('The screen contains many disabled/not-configured/placeholder signals.');
    nextSteps.push('Keep not-configured helper text close to disabled controls, but avoid making the whole page feel unfinished.');
  }

  if (viewport.id === 'mobile' && metrics.tinyTapTargets > 0) {
    rating -= 0.7;
    issues.push(`${metrics.tinyTapTargets} visible touch targets appear smaller than a comfortable mobile target.`);
    nextSteps.push('Normalize mobile tap targets to at least 40px high with clear spacing.');
  }

  if (/login/i.test(target.id) || /Login/.test(target.label)) {
    rating -= 0.4;
    issues.push('Authenticated portal content was not entered in this screenshot state.');
    nextSteps.push('Create safe demo parent/student/provider credentials for full private-portal walkthroughs.');
  }

  if (target.operations && !pageInfo.headings?.length) {
    rating -= 1.0;
    issues.push('No strong heading was detected in the app state.');
    nextSteps.push('Ensure every route has a clear page heading and section title.');
  }

  if (durationMs > 8000) {
    rating -= 0.4;
    issues.push(`Slow capture/load path (${Math.round(durationMs / 100) / 10}s).`);
    nextSteps.push('Profile the route data loader and defer non-critical API calls.');
  }

  if (!issues.length) {
    issues.push('No major automated layout issue detected in this screenshot.');
    nextSteps.push('Manually review visual density, label clarity, and whether the primary action is obvious.');
  }

  rating = Math.max(1, Math.min(10, Math.round(rating * 10) / 10));
  return {
    rating,
    ratingLabel: rating >= 8.5 ? 'Strong' : rating >= 7 ? 'Good with polish needed' : rating >= 5.5 ? 'Needs cleanup' : 'Problematic',
    issues,
    nextSteps,
  };
}

function writeManifest() {
  fs.writeFileSync(path.join(outputRoot, 'manifest.json'), `${JSON.stringify({
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    total_screenshots: reportRows.length,
    errors,
    screenshots: reportRows,
  }, null, 2)}\n`);

  const csvHeader = [
    'id',
    'label',
    'group',
    'viewport',
    'rating',
    'status',
    'screenshot',
    'url',
    'visibleButtonCount',
    'visibleLinkCount',
    'disabledButtonCount',
  ];
  const csvRows = reportRows.map((row) => csvHeader.map((key) => csvValue(row[key])).join(','));
  fs.writeFileSync(path.join(outputRoot, 'screenshot-index.csv'), `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`);
}

function writeReports() {
  const grouped = new Map();
  for (const row of reportRows) {
    const key = row.group || 'Other';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  const summary = [];
  summary.push(`# BNA Full App UI Audit - ${today}`);
  summary.push('');
  summary.push(`Base URL: ${BASE_URL}`);
  summary.push(`Screenshots captured: ${reportRows.length}`);
  summary.push(`Capture errors: ${errors.length}`);
  summary.push('');
  summary.push('## Executive Summary');
  summary.push('');
  summary.push(...executiveSummaryLines());
  summary.push('');
  summary.push('## Priority Optimizations');
  summary.push('');
  for (const item of priorityOptimizations()) {
    summary.push(`- ${item}`);
  }
  summary.push('');
  summary.push('## Screenshot Catalog');
  summary.push('');

  for (const [group, rows] of grouped.entries()) {
    const groupFile = path.join(outputRoot, `${safeFileName(group)}.md`);
    const lines = [`# ${group} UI Audit`, '', `Screenshots: ${rows.length}`, ''];
    summary.push(`- [${group}](${safeFileName(group)}.md): ${rows.length} screenshots`);
    for (const row of rows) {
      lines.push(`## ${row.label} (${row.viewport})`);
      lines.push('');
      lines.push(`Rating: ${row.rating}/10 - ${row.ratingLabel}`);
      lines.push('');
      lines.push(`Route: \`${row.finalUrl || row.url}\``);
      lines.push('');
      lines.push(`Screenshot: [${row.screenshot}](${row.screenshot})`);
      lines.push('');
      lines.push(`![${row.label}](${row.screenshot})`);
      lines.push('');
      lines.push('Problems / Observations:');
      for (const issue of row.issues) lines.push(`- ${issue}`);
      lines.push('');
      lines.push('Optimization Steps:');
      for (const step of row.nextSteps) lines.push(`- ${step}`);
      lines.push('');
      lines.push(`Visible actions: ${row.visibleButtonCount} buttons, ${row.visibleLinkCount} links, ${row.disabledButtonCount} disabled buttons.`);
      const actionSample = row.actionInventory
        .filter((action) => action.label)
        .slice(0, 16)
        .map((action) => `${action.disabled ? '[disabled] ' : ''}${action.label}`);
      if (actionSample.length) {
        lines.push('');
        lines.push('Action sample:');
        for (const action of actionSample) lines.push(`- ${action}`);
      }
      lines.push('');
    }
    fs.writeFileSync(groupFile, `${lines.join('\n')}\n`);
  }

  summary.push('');
  summary.push('## Auth / Safety Notes');
  summary.push('');
  summary.push('- Operations screenshots used existing admin auth without printing credentials.');
  summary.push('- Real send, publish, payment, delete, archive, password reset, and data-changing actions were inventoried but not executed.');
  summary.push('- Parent/student/provider private portal screenshots require safe demo credentials or generated access links; unauthenticated login states are captured here.');
  summary.push('');
  if (errors.length) {
    summary.push('## Capture Errors');
    summary.push('');
    for (const error of errors) summary.push(`- ${error.viewport || 'n/a'} ${error.target}: ${error.error}`);
    summary.push('');
  }
  fs.writeFileSync(path.join(outputRoot, 'ui-audit-report.md'), `${summary.join('\n')}\n`);
}

function writeReadme() {
  const lines = [
    `# ${auditSlug}`,
    '',
    'This folder is Drive-ready. Upload the whole folder to Google Drive if automatic Drive upload is not configured.',
    '',
    'Key files:',
    '- `ui-audit-report.md`: executive summary and group links.',
    '- `manifest.json`: full machine-readable screenshot/action inventory.',
    '- `screenshot-index.csv`: spreadsheet-friendly screenshot index.',
    '- `screenshots/desktop/`: desktop captures.',
    '- `screenshots/mobile/`: mobile captures.',
    '',
  ];
  fs.writeFileSync(path.join(outputRoot, 'README.md'), `${lines.join('\n')}\n`);
}

function executiveSummaryLines() {
  const mobileRows = reportRows.filter((row) => row.viewport === 'mobile');
  const desktopRows = reportRows.filter((row) => row.viewport === 'desktop');
  const avg = (rows) => rows.length ? Math.round((rows.reduce((sum, row) => sum + Number(row.rating || 0), 0) / rows.length) * 10) / 10 : 0;
  const lowRows = reportRows.filter((row) => row.rating < 7).sort((a, b) => a.rating - b.rating).slice(0, 12);
  return [
    `- Average desktop rating: ${avg(desktopRows)}/10.`,
    `- Average mobile rating: ${avg(mobileRows)}/10.`,
    `- Lowest-rated states: ${lowRows.map((row) => `${row.label} ${row.viewport} (${row.rating})`).join('; ') || 'none below 7'}.`,
    '- The audit is intentionally conservative: risky live actions were not clicked, but every visible action is inventoried in `manifest.json`.',
  ];
}

function priorityOptimizations() {
  const overflowCount = reportRows.filter((row) => row.metrics?.horizontalOverflow).length;
  const highActionCount = reportRows.filter((row) => row.visibleButtonCount > (row.viewport === 'mobile' ? 34 : 55)).length;
  const placeholderCount = reportRows.filter((row) => (row.metrics?.todoMentions || 0) > 6).length;
  const authScreens = reportRows.filter((row) => /login/i.test(row.id)).length;
  return [
    `${overflowCount} states show horizontal overflow; fix these first because they break trust immediately on mobile.`,
    `${highActionCount} states have too many visible actions; consolidate secondary actions into menus and detail drawers.`,
    `${placeholderCount} states overuse disabled/not-configured wording; replace big placeholder blocks with real settings rows and small helper text.`,
    `${authScreens} portal/login states were captured without private demo login; create safe demo credentials so parent/student/provider private workflows can be audited end-to-end.`,
    'Standardize page headers: workspace chip, role chip, section title, one primary action, and compact filters.',
    'Use the manifest action inventory to remove dead buttons or convert unsupported actions into disabled controls with one-line explanations.',
  ];
}

async function clickIfPresent(page, selector) {
  const locator = page.locator(selector).first();
  if (await locator.count()) {
    await locator.click({ timeout: 2000 }).catch(() => {});
  }
}

async function fillIfPresent(page, selector, value) {
  const locator = page.locator(selector).first();
  if (await locator.count()) {
    await locator.fill(value, { timeout: 2000 }).catch(() => {});
  }
}

function authorizationHeaders() {
  if (!OPS_USERNAME || !OPS_PASSWORD) return {};
  const token = Buffer.from(`${OPS_USERNAME}:${OPS_PASSWORD}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function safeFileName(value) {
  return String(value || 'item')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

function labelize(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function csvValue(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
