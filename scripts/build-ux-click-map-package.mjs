#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date().toISOString().slice(0, 10);
const rawRoot = path.join(repoRoot, 'ops', 'ui-audits', `${today}-full-app-ui-audit`);
const rawManifestPath = path.join(rawRoot, 'manifest.json');
const runRoot = path.join(repoRoot, 'ops', 'ux-audit-runs', `${today}-click-map`);
const screenshotsRoot = path.join(runRoot, 'screenshots');
const env = { ...process.env, ...readEnv(path.join(repoRoot, '.env.local')) };

const supplementalViewports = [
  { id: 'laptop', width: 1280, height: 900 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'small-mobile', width: 360, height: 800 },
];

const allScreenshotDirs = [
  'desktop',
  'mobile',
  'laptop',
  'tablet',
  'small-mobile',
  'errors',
  'modals',
  'drawers',
  'dropdowns',
];

const raw = JSON.parse(fs.readFileSync(rawManifestPath, 'utf8'));
const screenRows = [];
const actionRows = [];
const routeRowsByKey = new Map();
const issueRowsByKey = new Map();
const flowRows = [];
const conversionErrors = [];
let screenCounter = 1;
let actionCounter = 1;
let issueCounter = 1;

await main();

async function main() {
  prepareFolders();
  importRawScreenshots();

  if (process.argv.includes('--capture-missing-viewports')) {
    await captureSupplementalViewports();
  }

  buildActions();
  buildRoutes();
  buildIssues();
  buildConversionIssues();
  buildFlows();
  writeStructuredFiles();
  writeMarkdownReports();
  writeScreenshotIndex();
  writeDriveMirrorGuide();

  console.log(JSON.stringify({
    runRoot,
    screenshots: screenRows.length,
    actions: actionRows.length,
    routes: routeRowsByKey.size,
    issues: issueRowsByKey.size,
  }, null, 2));
}

function buildConversionIssues() {
  for (const item of conversionErrors) {
    addIssue({
      severity: 'P2',
      category: 'performance',
      title: 'Source screenshot could not be converted',
      description: `A raw screenshot file was corrupt or unreadable during PNG conversion: ${item.source}`,
      affected_screen_ids: [],
      affected_routes: [],
      affected_roles: [],
      affected_workspaces: [],
      evidence_screenshots: [],
      expected_behavior: 'Every screenshot source file should be readable and preserved.',
      actual_behavior: item.error,
      recommendation: 'Recapture this screen if it becomes important for implementation review.',
      priority: 'P2',
      implementation_notes: 'Audit artifact pipeline',
    });
  }
}

function prepareFolders() {
  fs.mkdirSync(runRoot, { recursive: true });
  for (const dir of allScreenshotDirs) {
    fs.mkdirSync(path.join(screenshotsRoot, dir), { recursive: true });
  }
}

function importRawScreenshots() {
  for (const row of raw.screenshots || []) {
    const screen = normalizedScreenFromRaw(row);
    const sourcePath = path.join(rawRoot, row.screenshot);
    const destPath = path.join(runRoot, screen.screenshot_file);
    if (!fs.existsSync(destPath)) convertToPng(sourcePath, destPath);
    screenRows.push(screen);
  }
}

async function captureSupplementalViewports() {
  const targets = uniqueTargetsFromRaw();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of supplementalViewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        extraHTTPHeaders: authorizationHeaders(),
      });
      const page = await context.newPage();
      page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));
      try {
        for (const target of targets) {
          const screen = await captureSupplementalScreen(page, viewport, target);
          screenRows.push(screen);
        }
      } finally {
        await page.close();
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

function uniqueTargetsFromRaw() {
  const map = new Map();
  for (const row of raw.screenshots || []) {
    if (!map.has(row.id)) map.set(row.id, row);
  }
  return [...map.values()];
}

async function captureSupplementalScreen(page, viewport, target) {
  const startedAt = Date.now();
  let status = 'ok';
  let pageInfo = {};
  const base = normalizedScreenBase(target, viewport.id);
  const screen_id = makeScreenId(base);
  const folder = viewport.id;
  const screenshot_file = `screenshots/${folder}/${screen_id}.png`;
  const destPath = path.join(runRoot, screenshot_file);

  try {
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await settlePage(page, target);
    await runTargetState(page, target);
    pageInfo = await collectPageInfo(page);
    await page.screenshot({ path: destPath, fullPage: true, type: 'png', animations: 'disabled' });
  } catch (error) {
    status = 'error';
    pageInfo = {
      title: '',
      url: target.url,
      buttons: [],
      links: [],
      metrics: {},
      issues: [`Capture failed: ${error.message}`],
    };
    const errorFile = `screenshots/errors/${screen_id}.txt`;
    fs.writeFileSync(path.join(runRoot, errorFile), `${error.stack || error.message}\n`);
  }

  const evaluation = evaluateScreen({ target, viewport, pageInfo, status, durationMs: Date.now() - startedAt });
  return {
    ...base,
    screen_id,
    screenshot_file,
    timestamp: isoNow(),
    viewport: viewport.id,
    viewport_width: viewport.width,
    viewport_height: viewport.height,
    route: routeOnly(target.finalUrl || target.url),
    url: pageInfo.url || target.finalUrl || target.url,
    entry_method: entryMethodForTarget(target),
    previous_screen_id: null,
    clicked_selector: clickedSelectorForTarget(target),
    clicked_label: clickedLabelForTarget(target),
    expected_result: expectedResultForTarget(target),
    actual_result: actualResultText(status, evaluation),
    result_type: status === 'ok' ? resultTypeForTarget(target) : 'error',
    back_path_available: backPathAvailable(target),
    back_path_type: backPathType(target),
    primary_action_visible: primaryActionLabel(target, pageInfo) !== '',
    primary_action_label: primaryActionLabel(target, pageInfo),
    workspace_visible: workspaceVisibleForTarget(target),
    role_visible: roleVisibleForTarget(target),
    breadcrumbs_visible: breadcrumbsVisibleForTarget(target),
    subnav_visible: subnavVisibleForTarget(target),
    mobile_usable: viewport.id.includes('mobile') || viewport.id === 'tablet' ? !pageInfo.metrics?.horizontalOverflow : null,
    has_bot_panel: hasBotPanel(target, pageInfo),
    issues: evaluation.issueIds,
    notes: evaluation.notes,
    rating: evaluation.rating,
    action_inventory: pageInfo.buttons || [],
    link_inventory: pageInfo.links || [],
    metrics: pageInfo.metrics || {},
  };
}

function normalizedScreenFromRaw(row) {
  const base = normalizedScreenBase(row, row.viewport);
  const screen_id = makeScreenId(base);
  const folder = row.viewport || 'desktop';
  const screenshot_file = `screenshots/${folder}/${screen_id}.png`;
  const evaluation = evaluateScreen({
    target: row,
    viewport: { id: row.viewport, width: row.width, height: row.height },
    pageInfo: {
      buttons: row.actionInventory || [],
      links: row.linkInventory || [],
      metrics: row.metrics || {},
      url: row.finalUrl || row.url,
    },
    status: row.status,
    durationMs: row.durationMs || 0,
  });
  return {
    ...base,
    screen_id,
    screenshot_file,
    timestamp: isoNow(),
    viewport: row.viewport,
    viewport_width: row.width,
    viewport_height: row.height,
    route: routeOnly(row.finalUrl || row.url),
    url: row.finalUrl || row.url,
    entry_method: entryMethodForTarget(row),
    previous_screen_id: null,
    clicked_selector: clickedSelectorForTarget(row),
    clicked_label: clickedLabelForTarget(row),
    expected_result: expectedResultForTarget(row),
    actual_result: actualResultText(row.status, evaluation),
    result_type: row.status === 'ok' ? resultTypeForTarget(row) : 'error',
    back_path_available: backPathAvailable(row),
    back_path_type: backPathType(row),
    primary_action_visible: inferredPrimaryAction(row) !== '',
    primary_action_label: inferredPrimaryAction(row),
    workspace_visible: workspaceVisibleForTarget(row),
    role_visible: roleVisibleForTarget(row),
    breadcrumbs_visible: breadcrumbsVisibleForTarget(row),
    subnav_visible: subnavVisibleForTarget(row),
    mobile_usable: row.viewport === 'mobile' ? !row.metrics?.horizontalOverflow : null,
    has_bot_panel: hasBotPanel(row, { buttons: row.actionInventory || [], links: row.linkInventory || [], metrics: row.metrics || {} }),
    issues: evaluation.issueIds,
    notes: evaluation.notes,
    rating: row.rating || evaluation.rating,
    action_inventory: row.actionInventory || [],
    link_inventory: row.linkInventory || [],
    metrics: row.metrics || {},
  };
}

function normalizedScreenBase(row, viewportId) {
  const route = routeOnly(row.finalUrl || row.url || '');
  const group = String(row.group || '');
  const workspaceKey = row.workspace || workspaceFromRoute(route);
  const roleInfo = roleWorkspace(row, workspaceKey, route, group);
  const section = sectionForRow(row, route, group);
  const page = pageForRow(row, route, group);
  const action = actionForRow(row);
  return {
    role: roleInfo.roleLabel,
    role_key: roleInfo.roleKey,
    workspace: roleInfo.workspaceLabel,
    workspace_key: roleInfo.workspaceKey,
    section,
    page_title: page,
    top_level_nav: row.view ? labelize(row.view) : section,
    subnav: row.section ? labelize(row.section) : '',
    public_or_private: privacyForRole(roleInfo.roleKey),
    expected_audience: audienceForRole(roleInfo.roleKey),
    actual_audience: audienceForRoute(route, group),
    action,
    viewport_key: viewportToken(viewportId),
  };
}

function roleWorkspace(row, workspaceKey, route, group) {
  if (row.workspace === 'platform') {
    return { roleKey: 'SUPERADMIN', roleLabel: 'Super Admin', workspaceKey: 'PLATFORM', workspaceLabel: 'Platform' };
  }
  if (row.workspace === 'bna') {
    return { roleKey: 'BNAADMIN', roleLabel: 'BNA Admin', workspaceKey: 'BNA', workspaceLabel: 'BNA School Workspace' };
  }
  if (row.workspace === 'rabbi_sheller_provider') {
    return { roleKey: 'PROVIDERADMIN', roleLabel: 'Provider Admin', workspaceKey: 'SHELLER', workspaceLabel: 'Rabbi Sheller Provider Workspace' };
  }
  if (/parent/i.test(group) || route.startsWith('/parent')) {
    return { roleKey: 'PARENT', roleLabel: 'Parent', workspaceKey: 'BNA', workspaceLabel: 'BNA School Workspace' };
  }
  if (/student/i.test(group) || route.startsWith('/student')) {
    return { roleKey: 'STUDENT', roleLabel: 'Student', workspaceKey: 'BNA', workspaceLabel: 'BNA School Workspace' };
  }
  if (/provider portal/i.test(group) || route.startsWith('/provider')) {
    return { roleKey: 'PROVIDERADMIN', roleLabel: 'Provider Admin', workspaceKey: 'SHELLER', workspaceLabel: 'Rabbi Sheller Provider Workspace' };
  }
  if (/provider onboarding/i.test(group) || route.startsWith('/providers')) {
    return { roleKey: 'PUBLIC', roleLabel: 'Public', workspaceKey: 'PROVIDERS', workspaceLabel: 'Public Provider Index' };
  }
  if (/operations-login/i.test(row.id || '')) {
    return { roleKey: 'PUBLIC', roleLabel: 'Public', workspaceKey: 'OPERATIONS', workspaceLabel: 'Operations Login' };
  }
  return { roleKey: 'PUBLIC', roleLabel: 'Public', workspaceKey: 'WEBSITE', workspaceLabel: 'Public Website' };
}

function sectionForRow(row, route, group) {
  if (row.view) return labelize(row.view);
  if (/parent portal/i.test(group) || route.startsWith('/parent')) return 'Portal';
  if (/student workspace/i.test(group) || route.startsWith('/student')) return 'Portal';
  if (/provider portal/i.test(group) || route === '/provider') return 'Portal';
  if (/provider onboarding/i.test(group) || route.startsWith('/providers')) return 'Provider Onboarding';
  if (/auth/i.test(group)) return 'Auth';
  if (/public/i.test(group)) return 'Website';
  return labelize(group || 'Page');
}

function pageForRow(row, route, group) {
  if (row.section) return labelize(row.section);
  if (/password-reset/i.test(row.id || '')) return 'Password Reset';
  if (/hebrew/i.test(row.id || '') || /-he$/.test(row.id || '')) return 'Hebrew State';
  if (/filled-draft/i.test(row.id || '')) return 'Filled Draft';
  return labelize(String(row.label || route || group || 'Page').split('/').at(-1));
}

function actionForRow(row) {
  const id = String(row.id || '');
  if (id.includes('mobile-drawer-open')) return 'OPEN_NAV_DRAWER';
  if (id.includes('password-reset')) return 'OPEN_PASSWORD_RESET';
  if (id.includes('hebrew')) return 'SWITCH_HEBREW';
  if (id.includes('filled-draft')) return 'FILL_FORM_DRAFT';
  return 'LOAD';
}

function makeScreenId(base) {
  const serial = String(screenCounter++).padStart(3, '0');
  return [
    base.role_key,
    base.workspace_key,
    token(base.section),
    token(base.page_title),
    token(base.action),
    base.viewport_key,
    serial,
  ].join('__');
}

function buildActions() {
  const screenByRouteViewport = new Map(screenRows.map((screen) => [screenLookupKey(screen), screen]));
  const loadScreens = screenRows.filter((screen) => screen.action === 'LOAD');

  for (const screen of loadScreens) {
    if (screen.subnav) {
      const overview = screenRows.find((candidate) =>
        candidate.role_key === screen.role_key &&
        candidate.workspace_key === screen.workspace_key &&
        candidate.top_level_nav === screen.top_level_nav &&
        candidate.viewport === screen.viewport &&
        /overview|workspace settings|library/i.test(candidate.page_title)
      );
      addAction({
        from_screen_id: overview?.screen_id || '',
        to_screen_id: screen.screen_id,
        role: screen.role,
        workspace: screen.workspace,
        route_before: overview?.route || '',
        route_after: screen.route,
        action_type: 'subnav_click',
        clicked_label: screen.subnav,
        clicked_selector: '.ops-nested-button',
        expected_behavior: `Open ${screen.page_title} inside ${screen.top_level_nav}.`,
        actual_behavior: screen.result_type === 'error' ? 'Route capture failed.' : 'Destination screen captured.',
        status: screen.result_type === 'error' ? 'broken' : 'works',
        severity: screen.result_type === 'error' ? 'P1' : 'P3',
        needs_confirmation: false,
        creates_timeline_event: false,
        role_allowed: true,
        recommendation: 'Keep this as section subnav unless the page represents a different workspace or audience.',
      });
    }

    for (const action of screen.action_inventory || []) {
      const analysis = classifyAction(action, screen, screenByRouteViewport);
      addAction({
        from_screen_id: screen.screen_id,
        to_screen_id: analysis.to_screen_id,
        role: screen.role,
        workspace: screen.workspace,
        route_before: screen.route,
        route_after: analysis.route_after,
        action_type: analysis.action_type,
        clicked_label: action.label || '',
        clicked_selector: action.onclick ? `[onclick="${action.onclick.slice(0, 40)}..."]` : action.href ? `a[href="${action.href}"]` : action.classes || action.tag || '',
        clicked_location: '',
        expected_behavior: analysis.expected_behavior,
        actual_behavior: analysis.actual_behavior,
        status: analysis.status,
        severity: analysis.severity,
        needs_confirmation: analysis.needs_confirmation,
        creates_timeline_event: analysis.creates_timeline_event,
        role_allowed: analysis.role_allowed,
        recommendation: analysis.recommendation,
      });
    }
  }

  for (const screen of screenRows.filter((item) => item.action !== 'LOAD')) {
    addAction({
      from_screen_id: '',
      to_screen_id: screen.screen_id,
      role: screen.role,
      workspace: screen.workspace,
      route_before: '',
      route_after: screen.route,
      action_type: actionTypeForScreenAction(screen.action),
      clicked_label: screen.clicked_label || labelize(screen.action),
      clicked_selector: screen.clicked_selector || '',
      expected_behavior: screen.expected_result,
      actual_behavior: screen.actual_result,
      status: screen.result_type === 'error' ? 'broken' : 'works',
      severity: screen.result_type === 'error' ? 'P1' : 'P3',
      needs_confirmation: false,
      creates_timeline_event: false,
      role_allowed: true,
      recommendation: 'Keep this state discoverable and make sure there is a clear close/back path.',
    });
  }
}

function buildRoutes() {
  for (const screen of screenRows) {
    const key = [screen.route, screen.role, screen.workspace, screen.viewport].join('|');
    if (routeRowsByKey.has(key)) continue;
    routeRowsByKey.set(key, {
      route: screen.route,
      page_title: screen.page_title,
      role: screen.role,
      workspace: screen.workspace,
      top_level_nav: screen.top_level_nav,
      subnav: screen.subnav,
      page_type: pageType(screen),
      public_or_private: screen.public_or_private,
      expected_audience: screen.expected_audience,
      actual_audience: screen.actual_audience,
      primary_action: screen.primary_action_label,
      has_breadcrumbs: screen.breadcrumbs_visible,
      has_back_path: screen.back_path_available,
      has_workspace_chip: screen.workspace_visible,
      has_role_chip: screen.role_visible,
      has_bot_panel: screen.has_bot_panel,
      mobile_ready: screen.mobile_usable === null ? '' : screen.mobile_usable,
      notes: screen.notes,
    });
  }
}

function buildIssues() {
  for (const screen of screenRows) {
    const metric = screen.metrics || {};
    const add = (category, severity, title, description, recommendation, priority = severity) => {
      addIssue({
        severity,
        category,
        title,
        description,
        affected_screen_ids: [screen.screen_id],
        affected_routes: [screen.route],
        affected_roles: [screen.role],
        affected_workspaces: [screen.workspace],
        evidence_screenshots: [screen.screenshot_file],
        expected_behavior: expectedByCategory(category),
        actual_behavior: description,
        recommendation,
        priority,
        implementation_notes: recommendedImplementationArea(screen, category),
      });
    };

    if (screen.result_type === 'error') {
      add('broken_action', 'P1', 'Route failed to capture', 'The route did not load successfully during audit.', 'Fix the route/load error and rerun the capture.');
    }
    if (metric.horizontalOverflow) {
      add('mobile_usability', screen.viewport.includes('mobile') || screen.viewport === 'tablet' ? 'P1' : 'P2', 'Horizontal overflow', 'The page is wider than the viewport.', 'Constrain grids, tables, filters, nav labels, and long unbroken content.');
    }
    if (!screen.workspace_visible && screen.public_or_private !== 'public') {
      add('workspace_visibility', 'P1', 'Workspace context is not obvious', 'The screen does not clearly show the active account/workspace.', 'Add a persistent workspace chip/dropdown in the toolbar or portal header.');
    }
    if (!screen.role_visible && ['Super Admin', 'BNA Admin', 'Provider Admin'].includes(screen.role)) {
      add('role_visibility', 'P1', 'Role context is not obvious', 'The admin screen does not clearly show the active role.', 'Add a role chip near the workspace chip and clarify role-scoped navigation.');
    }
    if ((metric.buttonCount || 0) > (screen.viewport.includes('mobile') ? 34 : 55)) {
      add('oversized_layout', screen.viewport.includes('mobile') ? 'P1' : 'P2', 'Too many visible actions', `The screen exposes ${metric.buttonCount} visible actions.`, 'Keep one primary action visible and group secondary actions into action menus.');
    }
    if ((metric.cardLikeCount || 0) > (screen.viewport.includes('mobile') ? 36 : 58)) {
      add('oversized_layout', 'P2', 'Too many card/panel blocks', `The screen has ${metric.cardLikeCount} card-like elements.`, 'Use compact tables/lists and open details in drawers/pages.');
    }
    if ((metric.todoMentions || 0) > 6) {
      add('settings_placeholder', 'P1', 'Too much placeholder language', 'The screen overuses not-configured/disabled/placeholder wording.', 'Render real settings rows and disable only the missing controls with one-line helper text.');
    }
    if (screen.viewport.includes('mobile') && (metric.tinyTapTargets || 0) > 0) {
      add('mobile_usability', 'P1', 'Small mobile tap targets', `${metric.tinyTapTargets} visible controls appear smaller than comfortable tap targets.`, 'Normalize buttons/links/inputs to at least 40px height on mobile.');
    }
    if (['PARENT', 'STUDENT'].includes(screen.role_key) && !screen.has_bot_panel) {
      add('bot_panel', 'P1', `${screen.role} assistant is missing or not obvious`, 'The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.', 'Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.');
    }
    if (screen.role_key === 'PROVIDERADMIN' && /goals|accountability|student/i.test(`${screen.section} ${screen.page_title}`)) {
      add('provider_school_confusion', 'P1', 'Provider/admin surface may be mixed with BNA school concepts', 'Provider workspace states should not look like BNA student accountability unless explicitly enabled.', 'Separate provider participants/members from BNA students and keep provider program pages simpler.');
    }
  }

  for (const action of actionRows) {
    if (['no_op', 'broken', 'unsafe', 'unclear', 'misplaced'].includes(action.status)) {
      addIssue({
        severity: action.status === 'unsafe' ? 'P1' : 'P2',
        category: action.status === 'no_op' ? 'dead_button' : action.status === 'unsafe' ? 'broken_action' : 'unclear_label',
        title: `Action needs review: ${action.clicked_label || action.action_type}`,
        description: action.actual_behavior,
        affected_screen_ids: [action.from_screen_id].filter(Boolean),
        affected_routes: [action.route_before].filter(Boolean),
        affected_roles: [action.role],
        affected_workspaces: [action.workspace],
        evidence_screenshots: screenshotForScreen(action.from_screen_id),
        expected_behavior: action.expected_behavior,
        actual_behavior: action.actual_behavior,
        recommendation: action.recommendation,
        priority: action.severity || 'P2',
        implementation_notes: 'Review the owning page/component and convert unsupported actions to disabled/explained states.',
      });
    }
  }
}

function buildFlows() {
  const screens = (roleKey, workspaceKey, topNav, pageRegex = /overview|library|workspace/i) =>
    screenRows.find((screen) =>
      screen.role_key === roleKey &&
      screen.workspace_key === workspaceKey &&
      (!topNav || screen.top_level_nav === topNav) &&
      pageRegex.test(screen.page_title) &&
      screen.viewport === 'desktop'
    );

  const platform = screens('SUPERADMIN', 'PLATFORM', 'Dashboard');
  const bnaDashboard = screens('BNAADMIN', 'BNA', 'Dashboard');
  const bnaStudents = screens('BNAADMIN', 'BNA', 'Students');
  const bnaSettings = screens('BNAADMIN', 'BNA', 'Settings');
  const shellerDashboard = screens('PROVIDERADMIN', 'SHELLER', 'Dashboard');
  const shellerProviders = screens('PROVIDERADMIN', 'SHELLER', 'Service Providers');
  const parentLogin = screenRows.find((screen) => screen.role_key === 'PARENT' && screen.viewport === 'desktop');
  const studentLogin = screenRows.find((screen) => screen.role_key === 'STUDENT' && screen.viewport === 'desktop');
  const providerJoin = screenRows.find((screen) => screen.role_key === 'PUBLIC' && screen.workspace_key === 'PROVIDERS' && /join|onboarding/i.test(screen.route) && screen.viewport === 'desktop');

  addFlow('FLOW-001', 'Platform to BNA School Workspace', 'Super Admin', 'Platform', platform, bnaDashboard, [
    'Open Operations dashboard',
    'Use workspace switcher',
    'Select BNA School Workspace',
    'Confirm BNA-specific navigation appears',
  ], true, [], ['Role/workspace labels must remain visible after switch.']);

  addFlow('FLOW-002', 'BNA School Student Admin Flow', 'BNA Admin', 'BNA School Workspace', bnaDashboard, bnaStudents, [
    'Open BNA workspace',
    'Open Students',
    'Open student profile/detail sections',
    'Review goals, assignments, questions, documents, bot settings',
  ], Boolean(bnaStudents), ['Authenticated private student detail clicks were not all executed in production-safe mode.'], ['Student detail should use side subnav/detail pages, not giant inline expansion.']);

  addFlow('FLOW-003', 'BNA Settings / Bot Configuration Flow', 'BNA Admin', 'BNA School Workspace', bnaSettings, bnaSettings, [
    'Open Settings',
    'Open Student Portal settings',
    'Open Bot Permissions',
    'Verify admin can inspect bot context rules',
  ], Boolean(bnaSettings), ['Actual parent/student bot config persistence may be incomplete.'], ['Bot scope and prompt configuration should be auditable by admin only.']);

  addFlow('FLOW-004', 'Rabbi Sheller Provider Workspace Flow', 'Provider Admin', 'Rabbi Sheller Provider Workspace', shellerDashboard, shellerProviders, [
    'Switch to Rabbi Sheller Provider Workspace',
    'Open Service Providers / commercial model',
    'Open access checklist',
    'Open integration audit',
  ], Boolean(shellerProviders), [], ['Provider workspace should say participants/members, not BNA students.']);

  addFlow('FLOW-005', 'Parent Portal Access Flow', 'Parent', 'BNA School Workspace', parentLogin, parentLogin, [
    'Open parent portal',
    'Use login or password reset',
    'Open family dashboard after valid credentials',
    'Find child calendar, messages, provider index, help assistant',
  ], false, ['No safe parent demo credentials were provided for private dashboard capture.'], ['Create demo parent account and rerun private portal flow.']);

  addFlow('FLOW-006', 'Student Workspace Access Flow', 'Student', 'BNA School Workspace', studentLogin, studentLogin, [
    'Open student workspace',
    'Enter student access code',
    'Review goals/assignments/questions/documents/calendar',
    'Open student helper bot',
  ], false, ['No safe student demo code was provided for private dashboard capture.'], ['Create demo student code and rerun private student flow.']);

  addFlow('FLOW-007', 'Provider Join / Public Listing Flow', 'Public visitor', 'Public Provider Index', providerJoin, providerJoin, [
    'Open provider join page',
    'Review commercial options',
    'Fill provider draft form',
    'Submit for review in dry-run/test mode only',
  ], Boolean(providerJoin), ['Form submission was not executed to avoid creating production data during this audit.'], ['Add a visible dry-run/test mode for provider onboarding QA.']);
}

function addFlow(flow_id, flow_name, persona, workspace, start, end, steps, success, blockers, confusion) {
  flowRows.push({
    flow_id,
    flow_name,
    persona,
    workspace,
    start_screen_id: start?.screen_id || '',
    end_screen_id: end?.screen_id || '',
    steps: steps.join(' -> '),
    success,
    blockers: blockers.join('; '),
    confusion_points: confusion.join('; '),
    expected_flow: steps.join(' -> '),
    actual_flow: success ? 'Screens captured for the major route states.' : 'Flow is blocked or partially captured.',
    recommended_flow: recommendedFlowText(flow_id),
    severity: success ? 'P2' : 'P1',
  });
}

function writeStructuredFiles() {
  fs.writeFileSync(path.join(runRoot, 'manifest.json'), `${JSON.stringify(screenRows, null, 2)}\n`);
  fs.writeFileSync(path.join(runRoot, 'screenshots.csv'), toCsv(screenRows, [
    'screen_id', 'screenshot_file', 'timestamp', 'viewport', 'role', 'workspace', 'section', 'page_title', 'route', 'url', 'previous_screen_id', 'clicked_label', 'expected_result', 'actual_result', 'result_type', 'back_path_available', 'primary_action_label', 'workspace_visible', 'role_visible', 'issues', 'notes',
  ]));
  fs.writeFileSync(path.join(runRoot, 'actions.csv'), toCsv(actionRows, [
    'action_id', 'from_screen_id', 'to_screen_id', 'role', 'workspace', 'route_before', 'route_after', 'action_type', 'clicked_label', 'clicked_selector', 'clicked_location', 'expected_behavior', 'actual_behavior', 'status', 'severity', 'needs_confirmation', 'creates_timeline_event', 'role_allowed', 'recommendation',
  ]));
  fs.writeFileSync(path.join(runRoot, 'routes.csv'), toCsv([...routeRowsByKey.values()], [
    'route', 'page_title', 'role', 'workspace', 'top_level_nav', 'subnav', 'page_type', 'public_or_private', 'expected_audience', 'actual_audience', 'primary_action', 'has_breadcrumbs', 'has_back_path', 'has_workspace_chip', 'has_role_chip', 'has_bot_panel', 'mobile_ready', 'notes',
  ]));
  fs.writeFileSync(path.join(runRoot, 'flows.csv'), toCsv(flowRows, [
    'flow_id', 'flow_name', 'persona', 'workspace', 'start_screen_id', 'end_screen_id', 'steps', 'success', 'blockers', 'confusion_points', 'expected_flow', 'actual_flow', 'recommended_flow', 'severity',
  ]));
  fs.writeFileSync(path.join(runRoot, 'issues.csv'), toCsv([...issueRowsByKey.values()], [
    'issue_id', 'severity', 'category', 'title', 'description', 'affected_screen_ids', 'affected_routes', 'affected_roles', 'affected_workspaces', 'evidence_screenshots', 'expected_behavior', 'actual_behavior', 'recommendation', 'priority', 'implementation_notes',
  ]));
}

function writeMarkdownReports() {
  writeReadme();
  writeTopFindings();
  writeNavigationMap();
  writeRoleWorkspaceMatrix();
  writeContextFailures();
  writeButtonActionAudit();
  writeMobileAudit();
  writeImplementationBacklog();
}

function writeReadme() {
  const issues = [...issueRowsByKey.values()];
  const counts = countBy(issues, 'severity');
  const lines = [
    '# BNA UX Click Map Audit',
    '',
    `Date: ${today}`,
    `App URL: ${raw.base_url || 'https://bneineviimacademy.org'}`,
    `Screenshots: ${screenRows.length}`,
    `Routes: ${routeRowsByKey.size}`,
    `Actions inventoried/mapped: ${actionRows.length}`,
    `Issues: ${issues.length} (P0 ${counts.P0 || 0}, P1 ${counts.P1 || 0}, P2 ${counts.P2 || 0}, P3 ${counts.P3 || 0})`,
    '',
    '## How To Read This Folder',
    '',
    '- `manifest.json` is the canonical screenshot metadata file. Every screenshot has a `screen_id`.',
    '- `screenshots.csv` is the spreadsheet-friendly screenshot index.',
    '- `actions.csv` maps visible buttons, nav clicks, subnav clicks, drawers, dropdowns, and risky/disabled actions.',
    '- `routes.csv` explains route ownership, audience, role/workspace state, and bot presence.',
    '- `flows.csv` summarizes the major product flows and blockers.',
    '- `issues.csv` is the structured issue registry.',
    '- `navigation-map.md`, `role-workspace-matrix.md`, `context-clarity-failures.md`, `button-action-audit.md`, `mobile-audit.md`, `top-findings.md`, and `implementation-backlog.md` are designer/implementation reports.',
    '',
    '## Safety Rules Used During Audit',
    '',
    '- No real emails were sent.',
    '- No real WhatsApps were sent.',
    '- No social posts were published.',
    '- No payments were charged.',
    '- No destructive delete/archive/reset actions were executed.',
    '- Production-risk actions were inventoried and classified instead of clicked.',
    '',
    '## Known Blockers',
    '',
    '- Parent private dashboard, student private dashboard, provider authenticated portal, and provider/member participant portal require safe demo credentials or generated access links for a complete private workflow walkthrough.',
    '- The package maps visible actions and safe navigation states; production-mutating actions are marked `unsafe`, `blocked_by_config`, or `not_tested` where appropriate.',
  ];
  if (conversionErrors.length) {
    lines.push('', '## Source Screenshot Conversion Issues', '');
    for (const item of conversionErrors) {
      lines.push(`- ${item.source}: ${item.error}`);
    }
  }
  fs.writeFileSync(path.join(runRoot, 'README.md'), `${lines.join('\n')}\n`);
}

function writeTopFindings() {
  const issues = [...issueRowsByKey.values()];
  const lines = ['# Top Findings', ''];
  const groups = [
    ['Top P0/P1 Issues', issues.filter((i) => ['P0', 'P1'].includes(i.severity)).slice(0, 10)],
    ['Top Navigation Fixes', issues.filter((i) => ['navigation', 'no_back_path', 'unclear_label', 'duplicate_section', 'misplaced_section'].includes(i.category)).slice(0, 10)],
    ['Top Mobile Fixes', issues.filter((i) => i.category === 'mobile_usability' || /mobile/i.test(i.title)).slice(0, 10)],
    ['Top Role/Workspace Clarity Fixes', issues.filter((i) => ['context_clarity', 'role_visibility', 'workspace_visibility'].includes(i.category)).slice(0, 10)],
    ['Top Parent/Student Portal Fixes', issues.filter((i) => /Parent|Student|portal/i.test(`${i.title} ${i.description} ${i.affected_roles}`)).slice(0, 10)],
    ['Top Provider Workspace Fixes', issues.filter((i) => /Provider|Sheller|provider/i.test(`${i.title} ${i.description} ${i.affected_workspaces}`)).slice(0, 10)],
    ['Top Natural-Language Bot Fixes', issues.filter((i) => i.category === 'bot_panel').slice(0, 10)],
  ];
  for (const [title, rows] of groups) {
    lines.push(`## ${title}`, '');
    if (!rows.length) lines.push('- No issues in this bucket from the automated pass.');
    for (const issue of rows) {
      lines.push(`- ${issue.severity} ${issue.issue_id}: ${issue.title} - ${issue.recommendation}`);
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(runRoot, 'top-findings.md'), `${lines.join('\n')}\n`);
}

function writeNavigationMap() {
  const lines = [
    '# Navigation Map',
    '',
    '## Current Nav Map',
    '',
    '- Platform / Super Admin: Dashboard, Pipelines, Tasks, Service Providers, Calendar, Communications, Internal Dialogue, API Usage, Team/Admin, Settings.',
    '- BNA School Workspace: Dashboard, Pipelines, Tasks, Students, Parents/Contacts, Content, Calendar, Communications, Accounting, Service Provider Index, API Usage, Settings.',
    '- Rabbi Sheller Provider Workspace: Dashboard, Pipelines, Tasks, Content, Calendar, Service Providers, Communications, Internal Dialogue, API Usage, Settings.',
    '- Parent Portal: Home, My Children, Messages, Provider Index, Help, Account, Settings when authenticated.',
    '- Student Workspace: Home, Goals, Assignments, Questions, Documents/Links, Bot/Help, Account when authenticated.',
    '- Provider Portal: Overview, Profile/Listing, Services, Commercial Model, Entitlements, Integrations, Access Checklist, Activity, Settings when authenticated.',
    '',
    '## Recommended Nav Map',
    '',
    '- Keep Platform, BNA School, and Rabbi Sheller Provider as explicit workspace contexts with a compact switcher.',
    '- Keep BNA school student/parent operations separate from provider participants/members.',
    '- Put provider commercial model, access checklist, integration audit, and entitlements under provider admin/provider setup, not inside BNA student operations.',
    '- Parent/student portals need a visible scoped assistant/help entry point without exposing admin notes.',
    '- Provider participant/member portal should be a simpler class/program surface, not the full BNA accountability/student layout.',
    '',
    '## Major Flow Graph',
    '',
    '```mermaid',
    'flowchart TD',
    '  A[Platform Dashboard] --> B[Workspace Switcher]',
    '  B --> C[BNA School Workspace]',
    '  B --> D[Rabbi Sheller Provider Workspace]',
    '  C --> E[Students]',
    '  E --> F[Student Detail]',
    '  F --> G[Student Calendar]',
    '  F --> H[Student Bot Settings]',
    '  C --> I[Parents / Contacts]',
    '  I --> J[Parent Detail]',
    '  J --> K[Parent Calendar / Messages]',
    '  D --> L[Provider Program / Membership]',
    '  L --> M[Participants / Members]',
    '  L --> N[Questions / Source Sheets]',
    '  O[Public Provider Index] --> P[Rabbi Sheller Public Profile]',
    '  P --> Q[Signup / Request Info CTA]',
    '  R[Parent Portal] --> S[Children / Calendar / Messages]',
    '  R --> T[Parent Help Assistant]',
    '  U[Student Workspace] --> V[Goals / Assignments / Questions]',
    '  U --> W[Student Learning Helper]',
    '```',
    '',
    '## Broken / Mismatched Flow Watchlist',
    '',
  ];
  for (const issue of [...issueRowsByKey.values()].filter((i) => ['provider_school_confusion', 'workspace_visibility', 'role_visibility', 'bot_panel', 'dead_button'].includes(i.category)).slice(0, 40)) {
    lines.push(`- ${issue.issue_id}: ${issue.title} (${issue.affected_routes})`);
  }
  fs.writeFileSync(path.join(runRoot, 'navigation-map.md'), `${lines.join('\n')}\n`);
}

function writeRoleWorkspaceMatrix() {
  const roles = [
    ['Super Admin', 'Platform', 'All platform, BNA, provider, task, usage, integration, admin/settings pages', 'None by role, but destructive live sends/deletes should require confirmation', 'Platform nav', 'Section-specific Operations subnav', 'Platform Dashboard', 'Workspace switch, global search, add/manage records', 'BNA Sidekick / Command Assistant', 'Can access private admin notes and cross-workspace data.'],
    ['BNA Admin', 'BNA School Workspace', 'BNA dashboard, pipelines, tasks, students, parents, content, calendar, communications, accounting, provider index, settings', 'Provider private admin terms unless explicitly allowed; public-only provider fields in parent views', 'BNA nav', 'School section subnav', 'BNA Dashboard', 'Add task/student/contact/content/event', 'BNA Sidekick plus student bot settings inspection', 'Private admin notes stay admin-only unless explicitly parent/student visible.'],
    ['Provider Admin', 'Rabbi Sheller Provider Workspace', 'Provider dashboard, program, participants/members, leads, content/videos, questions, schedule, communications, tasks, reporting, settings', 'BNA school private student/parent data', 'Provider nav', 'Provider program/setup subnav', 'Provider Dashboard', 'Lead, class/session, content, worksheet, question, task actions', 'Provider command/help scoped to program', 'Participants/members are not BNA students.'],
    ['Parent', 'BNA School Workspace', 'Own children, visible calendar/goals/assignments/questions/documents, messages/help, provider index, account/settings', 'Other families, admin notes, private provider business notes', 'Parent portal nav', 'Child/detail portal sections', 'Parent Home', 'Ask help, contact Shloimie, view provider, view child', 'Parent help assistant', 'Only own family and parent-visible data.'],
    ['Student', 'BNA School Workspace', 'Own goals, assignments, questions, documents, calendar, helper bot/help, account', 'Other students, parent/admin private notes, provider admin data', 'Student workspace nav', 'Student sections', 'Student Home', 'Check off goals, ask questions, use helper', 'Student learning helper', 'Only permitted student context.'],
    ['Provider Member / Provider Parent', 'Rabbi Sheller Provider Workspace', 'Program/class schedule, worksheets/source sheets, structured questions, messages/help, payment/access status', 'BNA goals/check-ins/accountability unless explicitly enabled', 'Provider member nav', 'Program sections', 'Program Home', 'Ask class question, view worksheet, request support', 'Simple provider help assistant', 'No BNA school-only accountability data.'],
    ['Public', 'Public Provider Index', 'Website, signup, provider index/profile, claim/request info CTA', 'Private admin notes, access credentials, partnership terms', 'Public website/provider nav', 'Public page sections', 'Home or Provider Index', 'Signup/request info/claim listing', 'Optional public help/contact', 'Public fields only.'],
  ];
  const lines = ['# Role / Workspace Matrix', '', '| Role | Workspace | Pages Allowed | Pages Hidden | Top Nav | Subnav | Default Landing | Primary Actions | Bot/Help Behavior | Privacy Restrictions |', '|---|---|---|---|---|---|---|---|---|---|'];
  for (const row of roles) lines.push(`| ${row.map(mdCell).join(' | ')} |`);
  fs.writeFileSync(path.join(runRoot, 'role-workspace-matrix.md'), `${lines.join('\n')}\n`);
}

function writeContextFailures() {
  const rows = [...issueRowsByKey.values()].filter((issue) => ['context_clarity', 'workspace_visibility', 'role_visibility', 'provider_school_confusion', 'public_private_leak', 'bot_panel'].includes(issue.category));
  const lines = ['# Context Clarity Failures', ''];
  if (!rows.length) lines.push('No context clarity failures were generated by the automated pass.');
  for (const issue of rows) {
    lines.push(`## ${issue.issue_id}: ${issue.title}`);
    lines.push('');
    lines.push(`Severity: ${issue.severity}`);
    lines.push(`Screen IDs: ${issue.affected_screen_ids}`);
    lines.push(`Page/routes: ${issue.affected_routes}`);
    lines.push(`Failure: ${issue.description}`);
    lines.push(`Why it matters: Users must always know whether they are in Platform, BNA School, Rabbi Sheller provider, parent/student portal, provider portal, or public provider index.`);
    lines.push(`Recommended fix: ${issue.recommendation}`);
    lines.push('');
  }
  fs.writeFileSync(path.join(runRoot, 'context-clarity-failures.md'), `${lines.join('\n')}\n`);
}

function writeButtonActionAudit() {
  const buckets = [
    ['Broken actions', actionRows.filter((a) => a.status === 'broken')],
    ['No-op / unclear actions', actionRows.filter((a) => ['no_op', 'unclear', 'not_tested'].includes(a.status)).slice(0, 80)],
    ['Unsafe actions needing confirmation', actionRows.filter((a) => a.needs_confirmation).slice(0, 80)],
    ['Disabled / blocked actions', actionRows.filter((a) => ['disabled_correctly', 'blocked_by_config', 'blocked_by_auth'].includes(a.status)).slice(0, 80)],
    ['Actions that should move into dropdowns/drawers', actionRows.filter((a) => /too many|secondary|menu|drawer/i.test(a.recommendation)).slice(0, 80)],
  ];
  const lines = ['# Button / Action Audit', '', `Total mapped actions: ${actionRows.length}`, ''];
  for (const [title, rows] of buckets) {
    lines.push(`## ${title}`, '');
    if (!rows.length) lines.push('- None found in this bucket.');
    for (const row of rows) {
      lines.push(`- ${row.status} ${row.action_id}: "${row.clicked_label}" on ${row.from_screen_id || row.route_before} - ${row.recommendation}`);
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(runRoot, 'button-action-audit.md'), `${lines.join('\n')}\n`);
}

function writeMobileAudit() {
  const mobileScreens = screenRows.filter((screen) => ['mobile', 'small-mobile', 'tablet'].includes(screen.viewport));
  const mobileIssues = [...issueRowsByKey.values()].filter((issue) => issue.category === 'mobile_usability' || /\b(MOBILE|TABLET|SMALL_MOBILE)\b/.test(String(issue.affected_screen_ids || '')));
  const lines = ['# Mobile Audit', '', `Mobile/tablet screenshots: ${mobileScreens.length}`, `Mobile-related issues: ${mobileIssues.length}`, '', '## Summary', '', '- Mobile navigation must keep workspace, role, active section, and back path visible without creating an endless drawer.', '- Filters should stay compact and move into sheet/drawer patterns on mobile.', '- Parent/student bot/help should be a sticky Ask/help affordance or full-screen sheet, not buried in the page.', '- Provider workspace mobile screens should avoid showing BNA school-only language.', '', '## Issue References', ''];
  for (const issue of mobileIssues.slice(0, 120)) {
    lines.push(`- ${issue.severity} ${issue.issue_id}: ${issue.title} (${issue.evidence_screenshots})`);
  }
  fs.writeFileSync(path.join(runRoot, 'mobile-audit.md'), `${lines.join('\n')}\n`);
}

function writeImplementationBacklog() {
  const issues = [...issueRowsByKey.values()].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const lines = ['# Implementation Backlog', ''];
  for (const severity of ['P0', 'P1', 'P2', 'P3']) {
    lines.push(`## ${severity}`, '');
    const bucket = issues.filter((issue) => issue.severity === severity).slice(0, 120);
    if (!bucket.length) lines.push('- No items in this bucket.');
    for (const issue of bucket) {
      lines.push(`### ${issue.title}`);
      lines.push('');
      lines.push(`Severity: ${issue.severity}`);
      lines.push(`Affected screen IDs: ${issue.affected_screen_ids}`);
      lines.push(`Affected routes: ${issue.affected_routes}`);
      lines.push(`Current behavior: ${issue.actual_behavior}`);
      lines.push(`Desired behavior: ${issue.expected_behavior}`);
      lines.push(`Acceptance criteria: ${issue.recommendation}`);
      lines.push(`Recommended file/component: ${issue.implementation_notes}`);
      lines.push('');
    }
  }
  fs.writeFileSync(path.join(runRoot, 'implementation-backlog.md'), `${lines.join('\n')}\n`);
}

function writeScreenshotIndex() {
  const lines = ['<!doctype html><meta charset="utf-8"><title>BNA UX Screenshot Index</title><style>body{font-family:system-ui;margin:24px;background:#f7f7f4;color:#111} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}.card{border:1px solid #ddd;background:#fff;border-radius:8px;padding:10px}img{width:100%;height:190px;object-fit:cover;object-position:top;border:1px solid #eee}.id{font-size:11px;word-break:break-all;color:#555}.meta{font-size:12px}</style><h1>BNA UX Screenshot Index</h1><div class="grid">'];
  for (const screen of screenRows) {
    lines.push(`<article class="card"><a href="${html(screen.screenshot_file)}"><img src="${html(screen.screenshot_file)}" loading="lazy"></a><p class="id">${html(screen.screen_id)}</p><p class="meta">${html(screen.role)} / ${html(screen.workspace)} / ${html(screen.section)} / ${html(screen.page_title)} / ${html(screen.viewport)}</p><p class="meta">Rating ${html(String(screen.rating || ''))} / Issues: ${html(String(screen.issues?.length || 0))}</p></article>`);
  }
  lines.push('</div>');
  fs.writeFileSync(path.join(runRoot, 'screenshot-index.html'), lines.join('\n'));
}

function writeDriveMirrorGuide() {
  const lines = [
    '# Drive Mirror Structure',
    '',
    'Mirror this local folder to Google Drive as:',
    '',
    '`BNA UX Audit / 2026-06-11 Click Map /`',
    '',
    'Recommended Drive filenames:',
    '',
    '- `00_README.md` -> `README.md`',
    '- `01_manifest.json` -> `manifest.json`',
    '- `02_screenshots.csv` -> `screenshots.csv`',
    '- `03_actions.csv` -> `actions.csv`',
    '- `04_routes.csv` -> `routes.csv`',
    '- `05_flows.csv` -> `flows.csv`',
    '- `06_issues.csv` -> `issues.csv`',
    '- `07_navigation-map.md` -> `navigation-map.md`',
    '- `08_role-workspace-matrix.md` -> `role-workspace-matrix.md`',
    '- `09_context-clarity-failures.md` -> `context-clarity-failures.md`',
    '- `10_button-action-audit.md` -> `button-action-audit.md`',
    '- `11_mobile-audit.md` -> `mobile-audit.md`',
    '- `12_top-findings.md` -> `top-findings.md`',
    '- `13_implementation-backlog.md` -> `implementation-backlog.md`',
    '',
  ];
  fs.writeFileSync(path.join(runRoot, 'drive-mirror-guide.md'), `${lines.join('\n')}\n`);
}

function classifyAction(action, screen, screenByRouteViewport) {
  const label = String(action.label || '').trim();
  const haystack = `${label} ${action.onclick || ''} ${action.href || ''}`.toLowerCase();
  if (action.disabled) {
    return actionResult('disabled_action', '', '', 'Disabled control should explain why it is unavailable.', 'The control is disabled in the captured UI.', 'disabled_correctly', 'P3', false, false, true, 'Keep disabled controls paired with small helper text.');
  }
  if (/(delete|archive|reset|send|publish|charge|payment|invoice|logout|sign out|approve|deny|run|generate|create|add|save|submit|upload|parse|mark|move|grant|revoke)/i.test(label)) {
    return actionResult('button_click', '', '', 'Action should work only in dry-run or after explicit confirmation.', 'Not executed during audit because it can mutate production state or trigger external systems.', 'unsafe', 'P1', true, /task|note|message|payment|publish|send|upload|parse|generate/i.test(label), true, 'Add confirmation/dry-run/test mode and audit-log/timeline writes where appropriate.');
  }
  if (/switchView\(|setCurrentSection\(|set.*Section\(/.test(action.onclick || '')) {
    return actionResult('nav_click', '', screen.route, 'Navigate to the matching section.', 'Equivalent route state was captured in the screenshot matrix.', 'works', 'P3', false, false, true, 'Keep label and destination aligned.');
  }
  if (/toggleFilterDropdown|filter|dropdown/i.test(`${label} ${action.onclick || ''} ${action.classes || ''}`)) {
    return actionResult('dropdown_open', '', screen.route, 'Open dropdown/filter without changing data.', 'Dropdown state was inventoried; representative dropdown screenshots should be reviewed in the dropdowns folder when added.', 'not_tested', 'P2', false, false, true, 'Capture representative dropdown open states and move large filters into compact filter bars/sheets.');
  }
  if (/open navigation|menu|hamburger/i.test(label)) {
    return actionResult('drawer_open', '', screen.route, 'Open navigation drawer.', 'Mobile drawer states were captured separately.', 'works', 'P3', false, false, true, 'Keep workspace/role visible at top of drawer.');
  }
  if (action.href) {
    const absolute = resolveUrl(action.href, screen.url);
    const target = screenByRouteViewport.get(`${routeOnly(absolute)}|${screen.role_key}|${screen.workspace_key}|${screen.viewport}`);
    return actionResult(action.href.startsWith('http') ? 'external_link' : 'nav_click', target?.screen_id || '', routeOnly(absolute), 'Open linked route or external destination.', target ? 'Destination screen exists in catalog.' : 'Destination was not matched to a captured screen.', target ? 'works' : 'not_tested', target ? 'P3' : 'P2', false, false, true, target ? 'Keep link label specific.' : 'Add this destination to the route audit or clarify that it leaves the app.');
  }
  return actionResult('button_click', '', screen.route, 'Button should have visible feedback or a clear disabled state.', 'Not executed in broad audit; needs focused click test.', 'not_tested', 'P2', false, false, true, 'Either wire the action, move it into a menu, or disable it with helper text.');
}

function actionResult(action_type, to_screen_id, route_after, expected_behavior, actual_behavior, status, severity, needs_confirmation, creates_timeline_event, role_allowed, recommendation) {
  return { action_type, to_screen_id, route_after, expected_behavior, actual_behavior, status, severity, needs_confirmation, creates_timeline_event, role_allowed, recommendation };
}

function addAction(row) {
  actionRows.push({
    action_id: `ACT-${String(actionCounter++).padStart(5, '0')}`,
    clicked_location: '',
    ...row,
  });
}

function addIssue(row) {
  const key = [
    row.category,
    row.title,
    row.affected_screen_ids?.[0] || '',
    row.affected_routes?.[0] || '',
  ].join('|');
  const existing = issueRowsByKey.get(key);
  if (existing) {
    mergeList(existing, 'affected_screen_ids', row.affected_screen_ids);
    mergeList(existing, 'affected_routes', row.affected_routes);
    mergeList(existing, 'affected_roles', row.affected_roles);
    mergeList(existing, 'affected_workspaces', row.affected_workspaces);
    mergeList(existing, 'evidence_screenshots', row.evidence_screenshots);
    return existing;
  }
  const issue = {
    issue_id: `${row.category.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}-${String(issueCounter++).padStart(3, '0')}`,
    ...row,
    affected_screen_ids: unique(row.affected_screen_ids || []).join(' '),
    affected_routes: unique(row.affected_routes || []).join(' '),
    affected_roles: unique(row.affected_roles || []).join(' '),
    affected_workspaces: unique(row.affected_workspaces || []).join(' '),
    evidence_screenshots: unique(row.evidence_screenshots || []).join(' '),
  };
  issueRowsByKey.set(key, issue);
  return issue;
}

function mergeList(target, key, values = []) {
  const current = String(target[key] || '').split(/\s+/).filter(Boolean);
  target[key] = unique([...current, ...values]).join(' ');
}

function evaluateScreen({ target, viewport, pageInfo, status, durationMs }) {
  const metrics = pageInfo.metrics || {};
  const issueIds = [];
  const notes = [];
  let rating = Number(target.rating || 9);
  const add = (id, note, penalty) => {
    issueIds.push(id);
    notes.push(note);
    rating -= penalty;
  };
  if (status !== 'ok') add('LOAD-ERROR', 'Page did not load cleanly.', 4);
  if (metrics.horizontalOverflow) add('HORIZONTAL-OVERFLOW', 'Horizontal overflow detected.', viewport.id?.includes('mobile') ? 2 : 1);
  if ((metrics.buttonCount || target.visibleButtonCount || 0) > (String(viewport.id).includes('mobile') ? 34 : 55)) add('ACTION-OVERLOAD', 'Too many visible actions.', 0.8);
  if ((metrics.cardLikeCount || 0) > (String(viewport.id).includes('mobile') ? 36 : 58)) add('CARD-DENSITY', 'Too many card-like panels.', 0.5);
  if ((metrics.todoMentions || 0) > 6) add('PLACEHOLDER-OVERUSE', 'Too much not-configured/placeholder language.', 0.8);
  if (String(viewport.id).includes('mobile') && (metrics.tinyTapTargets || 0) > 0) add('TINY-TAP-TARGETS', 'Small mobile tap targets detected.', 0.6);
  if (['Parent Portal', 'Student Workspace'].includes(target.group) || /^\/(parent|student)/.test(routeOnly(target.url || ''))) add('BOT-AUDIT-REQUIRED', 'Parent/student assistant placement must be explicitly reviewed.', 0.4);
  if (!notes.length) notes.push('No major automated issue detected; manual designer review still required.');
  return { rating: Math.max(1, Math.min(10, Math.round(rating * 10) / 10)), issueIds, notes: notes.join(' ') };
}

async function settlePage(page, target) {
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  if (/\/operations/.test(target.url || '')) {
    await page.waitForFunction(() => {
      const app = document.querySelector('#app');
      return Boolean(app && !/Loading BNA Operations/i.test(app.textContent || ''));
    }, null, { timeout: 18000 }).catch(() => {});
    await page.waitForTimeout(700);
  } else {
    await page.waitForTimeout(450);
  }
}

async function runTargetState(page, target) {
  const id = String(target.id || '');
  if (id.includes('mobile-drawer-open')) await clickIfPresent(page, '.menu-button');
  if (id.includes('parent-login-hebrew')) await clickIfPresent(page, '[data-language="he"]');
  if (id.includes('parent-password-reset')) await clickIfPresent(page, '#showResetButton');
  if (id.includes('student-login-hebrew')) await clickIfPresent(page, '#langHeButton');
  if (id.includes('provider-join-filled-draft')) {
    await fillIfPresent(page, 'input[name="provider_name"]', 'Example Provider');
    await fillIfPresent(page, 'input[name="contact_name"]', 'Demo Contact');
    await fillIfPresent(page, 'input[name="email"]', 'demo-provider@example.com');
    await fillIfPresent(page, 'input[name="phone"]', '+1 555 0100');
    await fillIfPresent(page, 'input[name="category"]', 'Torah Classes');
    await fillIfPresent(page, 'input[name="location"]', 'Online');
    await fillIfPresent(page, 'textarea[name="program_description"]', 'Demo screenshot only. Not submitted.');
  }
  await page.waitForTimeout(250);
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
      .slice(0, 220)
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
      .slice(0, 220)
      .map((el) => ({
        label: text(el) || el.getAttribute('aria-label') || el.getAttribute('href'),
        href: el.getAttribute('href'),
        target: el.getAttribute('target') || '',
        classes: String(el.className || '').slice(0, 120),
      }));
    const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 3;
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
      buttons,
      links,
      metrics: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow,
        buttonCount: buttons.length,
        linkCount: links.length,
        formCount: document.querySelectorAll('form').length,
        cardLikeCount: document.querySelectorAll('[class*="card"], [class*="panel"], article, .focus-panel').length,
        disabledButtonCount: buttons.filter((button) => button.disabled).length,
        tinyTapTargets,
        todoMentions: (bodyText.match(/\b(TODO|placeholder|not configured|not enabled|disabled until|requires .* endpoint|missing)\b/gi) || []).length,
        botMentions: (bodyText.match(/\b(bot|assistant|helper|sidekick|ask for help|ask)\b/gi) || []).length,
      },
    };
  });
}

function convertToPng(sourcePath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (path.extname(sourcePath).toLowerCase() === '.png') {
    fs.copyFileSync(sourcePath, destPath);
    return;
  }
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
    fs.copyFileSync(sourcePath, destPath);
    return;
  }
  const result = spawnSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', '-i', sourcePath, destPath], { stdio: 'pipe' });
  if (result.status !== 0) {
    const message = result.stderr?.toString()?.trim() || String(result.status);
    conversionErrors.push({ source: path.relative(repoRoot, sourcePath), error: message });
    fs.writeFileSync(destPath, Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64'
    ));
  }
}

function toCsv(rows, columns) {
  return `${columns.join(',')}\n${rows.map((row) => columns.map((column) => csv(row[column])).join(',')).join('\n')}\n`;
}

function csv(value) {
  const text = Array.isArray(value) ? value.join(' ') : String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function html(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function token(value) {
  return String(value || 'PAGE')
    .toUpperCase()
    .replace(/&/g, 'AND')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 34) || 'PAGE';
}

function viewportToken(value) {
  return token(String(value || 'desktop').replace(/-/g, '_'));
}

function labelize(value) {
  return String(value || '').replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function routeOnly(url) {
  try {
    const parsed = new URL(url, raw.base_url || 'https://bneineviimacademy.org');
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return String(url || '');
  }
}

function workspaceFromRoute(route) {
  const match = String(route).match(/[?&]workspace=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function privacyForRole(roleKey) {
  return roleKey === 'PUBLIC' ? 'public' : 'private';
}

function audienceForRole(roleKey) {
  return {
    SUPERADMIN: 'Shloimie / platform operator',
    BNAADMIN: 'BNA school admin',
    PROVIDERADMIN: 'Provider admin',
    PARENT: 'BNA parent',
    STUDENT: 'BNA student',
    PUBLIC: 'Public visitor',
  }[roleKey] || 'Unknown';
}

function audienceForRoute(route, group) {
  if (/operations/.test(route)) return 'Admin/operator';
  if (/parent/.test(route)) return 'Parent';
  if (/student/.test(route)) return 'Student';
  if (/provider/.test(route)) return 'Provider/public provider visitor';
  return group || 'Public';
}

function entryMethodForTarget(row) {
  if (String(row.id || '').includes('mobile-drawer-open')) return 'drawer';
  if (String(row.id || '').includes('password-reset')) return 'button_click';
  if (String(row.id || '').includes('hebrew')) return 'button_click';
  if (String(row.id || '').includes('filled-draft')) return 'form_submit';
  if (row.section || row.view) return 'direct_route';
  return 'direct_route';
}

function clickedSelectorForTarget(row) {
  const id = String(row.id || '');
  if (id.includes('mobile-drawer-open')) return '.menu-button';
  if (id.includes('password-reset')) return '#showResetButton';
  if (id.includes('parent-login-hebrew')) return '[data-language="he"]';
  if (id.includes('student-login-hebrew')) return '#langHeButton';
  return '';
}

function clickedLabelForTarget(row) {
  const id = String(row.id || '');
  if (id.includes('mobile-drawer-open')) return 'Open navigation';
  if (id.includes('password-reset')) return 'Create/reset password';
  if (id.includes('hebrew')) return 'Hebrew';
  if (id.includes('filled-draft')) return 'Fill demo provider form';
  return '';
}

function expectedResultForTarget(row) {
  const id = String(row.id || '');
  if (id.includes('mobile-drawer-open')) return 'Navigation drawer opens with current workspace, role, active section, and clear back/close path.';
  if (id.includes('password-reset')) return 'Password reset request panel opens without sending email until submitted.';
  if (id.includes('hebrew')) return 'Portal changes language/RTL state cleanly.';
  if (id.includes('filled-draft')) return 'Provider onboarding form can be filled without submitting production data.';
  if (row.view && row.section) return `${labelize(row.view)} / ${labelize(row.section)} loads in the correct workspace.`;
  return `${row.label || 'Page'} loads clearly.`;
}

function resultTypeForTarget(row) {
  const id = String(row.id || '');
  if (id.includes('mobile-drawer-open')) return 'drawer';
  if (id.includes('password-reset') || id.includes('hebrew') || id.includes('filled-draft')) return 'page';
  return 'page';
}

function actualResultText(status, evaluation) {
  if (status !== 'ok') return 'Screen failed to load or capture.';
  return evaluation.notes || 'Screen captured successfully.';
}

function backPathAvailable(row) {
  if (/login|drawer|password-reset|filled-draft|hebrew/.test(String(row.id || ''))) return true;
  if (row.view || row.section) return true;
  return false;
}

function backPathType(row) {
  if (String(row.id || '').includes('mobile-drawer-open')) return 'close_button';
  if (row.view || row.section) return 'breadcrumb';
  if (/login|hebrew|password-reset|filled-draft/.test(String(row.id || ''))) return 'browser_back';
  return 'none';
}

function inferredPrimaryAction(row) {
  const labels = (row.actionInventory || []).map((item) => String(item.label || '')).filter(Boolean);
  const found = labels.find((label) => /new|add|save|submit|send|open|sign in|request|create|upload|generate/i.test(label));
  return found || '';
}

function primaryActionLabel(row, pageInfo) {
  const buttons = pageInfo.buttons || [];
  const found = buttons.find((button) => /new|add|save|submit|send|open|sign in|request|create|upload|generate/i.test(button.label || ''));
  return found?.label || inferredPrimaryAction(row);
}

function workspaceVisibleForTarget(row) {
  if (row.workspace) return true;
  if (/operations/.test(row.url || '')) return true;
  if (/parent|student|provider/.test(row.url || '')) return true;
  return false;
}

function roleVisibleForTarget(row) {
  if (row.workspace) return true;
  if (/parent|student|provider/.test(row.url || '')) return true;
  return false;
}

function breadcrumbsVisibleForTarget(row) {
  return Boolean(row.view || row.section || /operations/.test(row.url || ''));
}

function subnavVisibleForTarget(row) {
  return Boolean(row.section || row.view);
}

function hasBotPanel(row, pageInfo) {
  const route = routeOnly(row.url || '');
  const textSignals = (pageInfo.buttons || []).some((button) => /bot|assistant|helper|ask|help/i.test(button.label || ''))
    || (pageInfo.links || []).some((link) => /bot|assistant|helper|ask|help/i.test(link.label || ''))
    || (pageInfo.metrics?.botMentions || 0) > 2;
  if (/\/student/.test(route)) return textSignals;
  if (/\/parent/.test(route)) return textSignals;
  if (/\/operations/.test(route) && /bot|settings|api/i.test(`${row.view || ''} ${row.section || ''}`)) return true;
  return textSignals;
}

function pageType(screen) {
  if (/login/i.test(screen.page_title) || /login/i.test(screen.route)) return 'login';
  if (/settings/i.test(screen.section) || /settings/i.test(screen.page_title)) return 'settings';
  if (/dashboard|overview/i.test(screen.page_title)) return 'dashboard';
  if (/detail|profile/i.test(screen.page_title)) return 'detail';
  return 'page';
}

function actionTypeForScreenAction(action) {
  if (action === 'OPEN_NAV_DRAWER') return 'drawer_open';
  if (action === 'OPEN_PASSWORD_RESET') return 'modal_open';
  if (action === 'SWITCH_HEBREW') return 'button_click';
  if (action === 'FILL_FORM_DRAFT') return 'form_submit';
  return 'nav_click';
}

function screenLookupKey(screen) {
  return `${screen.route}|${screen.role_key}|${screen.workspace_key}|${screen.viewport}`;
}

function screenshotForScreen(screenId) {
  const screen = screenRows.find((item) => item.screen_id === screenId);
  return screen ? [screen.screenshot_file] : [];
}

function expectedByCategory(category) {
  return {
    bot_panel: 'Scoped bot/help assistant is visible and safe for the current role.',
    workspace_visibility: 'Workspace/account is always visible.',
    role_visibility: 'Role/view is always visible where role affects access.',
    mobile_usability: 'Mobile screen has no overflow and comfortable tap targets.',
    settings_placeholder: 'Settings pages show real rows/fields with only missing controls disabled.',
    oversized_layout: 'Page is compact, scannable, and action hierarchy is clear.',
  }[category] || 'UI should be clear, wired, safe, and mapped to the correct route/workspace.';
}

function recommendedImplementationArea(screen, category) {
  if (screen.route.startsWith('/operations')) return 'public/operations.html';
  if (screen.route.startsWith('/parent')) return 'public/parent.html';
  if (screen.route.startsWith('/student')) return 'public/student.html';
  if (screen.route.startsWith('/provider')) return screen.route.startsWith('/providers') ? 'public/providers-join.html' : 'public/provider.html';
  if (category === 'bot_panel') return 'server.js plus portal HTML bot/help components';
  return 'public/*.html and shared CSS';
}

function recommendedFlowText(flowId) {
  return {
    'FLOW-001': 'Workspace switcher should behave like a SaaS account switcher with visible role/workspace chips after every switch.',
    'FLOW-002': 'Student admin should open stable student detail pages/drawers with calendar, goals, assignments, questions, documents, and bot settings.',
    'FLOW-003': 'Admin should inspect student/parent assistant context and safety rules without exposing raw prompts to end users.',
    'FLOW-004': 'Provider workspace should focus on program, members, leads, content, access, integration, and commercial model.',
    'FLOW-005': 'Parent portal should expose child calendar, assignments/questions/documents, messages/help, provider index, account, and scoped help assistant.',
    'FLOW-006': 'Student workspace should expose next actions, goals, assignments, questions, documents, calendar, and a safe learning helper.',
    'FLOW-007': 'Provider onboarding should create a draft provider record/task in test mode and make free vs managed vs school workspace distinction obvious.',
  }[flowId] || 'Keep flow linear, obvious, reversible, and role scoped.';
}

function resolveUrl(href, base) {
  try { return new URL(href, base || raw.base_url).href; } catch { return href || ''; }
}

async function clickIfPresent(page, selector) {
  const locator = page.locator(selector).first();
  if (await locator.count()) await locator.click({ timeout: 2000 }).catch(() => {});
}

async function fillIfPresent(page, selector, value) {
  const locator = page.locator(selector).first();
  if (await locator.count()) await locator.fill(value, { timeout: 2000 }).catch(() => {});
}

function authorizationHeaders() {
  const user = env.OPS_USERNAME || '';
  const pass = env.OPS_PASSWORD || '';
  if (!user || !pass) return {};
  return { Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}` };
}

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const parsed = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    parsed[key] = value;
  }
  return parsed;
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map(String))];
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

function severityRank(severity) {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[severity] ?? 4;
}

function isoNow() {
  return new Date().toISOString();
}
